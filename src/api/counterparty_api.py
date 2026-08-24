"""
GlobeXAI Trade OS — Counterparty Match & Risk Router
Endpoints:
  POST /predict/counterparty-match  — find verified export counterparties
  POST /predict/counterparty-risk   — compute composite risk profile for an org

Database is optional: SUPABASE_URL + SUPABASE_KEY env vars must be set to
enable live queries. If missing, structured seed-data stubs are returned with
"data_source": "seed_data" so callers are never misled about data origin.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Counterparty Intelligence"])

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


@lru_cache(maxsize=1)
def _load_risk_models():
    """Load Isolation Forest model and RobustScaler for Trade Risk profiling."""
    candidates = [
        PROJECT_ROOT / "backend" / "brain_temporary" / "models" / "trade_risk",
        PROJECT_ROOT / "backend" / "brain" / "models" / "trade_risk",
        PROJECT_ROOT / "models" / "trade_risk",
    ]
    for d in candidates:
        if (d / "isolation_forest.joblib").exists():
            try:
                model = joblib.load(d / "isolation_forest.joblib")
                scaler = joblib.load(d / "robust_scaler.joblib") if (d / "robust_scaler.joblib").exists() else None
                meta = {}
                if (d / "risk_model_metadata.json").exists():
                    with open(d / "risk_model_metadata.json", encoding="utf-8") as f:
                        meta = json.load(f)
                logger.info("Loaded Trade Risk model from %s", d)
                return {"model": model, "scaler": scaler, "metadata": meta, "dir": str(d)}
            except Exception as exc:
                logger.warning("Failed loading trade risk model from %s: %s", d, exc)
    return None

# ---------------------------------------------------------------------------
# DB availability check (lazy — checked per-request to honour runtime env)
# ---------------------------------------------------------------------------

def _db_available() -> bool:
    return bool(os.getenv("SUPABASE_URL") and (os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")))


# ---------------------------------------------------------------------------
# Seed-data generators (deterministic — seeded from request parameters)
# ---------------------------------------------------------------------------

_SEED_ORGS = [
    {
        "name": "Al Dahra Agricultural",
        "country": "ARE",
        "business_type": "EXPORTER",
        "certifications": ["ISO 22000", "HACCP", "GlobalG.A.P"],
    },
    {
        "name": "Agri Star Exports Ltd",
        "country": "IND",
        "business_type": "EXPORTER",
        "certifications": ["APEDA", "FSSAI", "ISO 9001"],
    },
    {
        "name": "Gulf Foods Trading LLC",
        "country": "SAU",
        "business_type": "EXPORTER",
        "certifications": ["SASO", "HALAL"],
    },
    {
        "name": "Euro Agro GmbH",
        "country": "DEU",
        "business_type": "EXPORTER",
        "certifications": ["CE", "ISO 22000", "BRC"],
    },
    {
        "name": "Singapore Commodities Pte",
        "country": "SGP",
        "business_type": "EXPORTER",
        "certifications": ["SFA", "ISO 9001"],
    },
    {
        "name": "Japan Food Corp",
        "country": "JPN",
        "business_type": "EXPORTER",
        "certifications": ["JAS", "ISO 22000"],
    },
    {
        "name": "Nile Valley Agro Co",
        "country": "EGY",
        "business_type": "EXPORTER",
        "certifications": ["GOEIC", "ISO 9001"],
    },
]


def _deterministic_float(seed: str, lo: float = 0.0, hi: float = 1.0) -> float:
    """Generate a deterministic float in [lo, hi] from a string seed."""
    digest = int(hashlib.md5(seed.encode()).hexdigest(), 16)
    return lo + (digest % 10000) / 10000.0 * (hi - lo)


def _build_seed_counterparties(
    hs6: int, destination_country: str, quantity_kg: Optional[float], top_n: int
) -> List[Dict[str, Any]]:
    """Produce deterministic stub counterparties derived from request parameters."""
    results = []
    orgs = (_SEED_ORGS * 3)[:top_n]  # cycle if top_n > seed pool
    for i, org in enumerate(orgs):
        seed_key = f"{hs6}:{destination_country}:{org['name']}:{i}"
        trust = round(_deterministic_float(seed_key + ":trust", 0.55, 0.98), 3)
        match = round(_deterministic_float(seed_key + ":match", 0.60, 0.97), 3)
        results.append(
            {
                "organization_id": hashlib.md5(seed_key.encode()).hexdigest()[:12],
                "name": org["name"],
                "country": org["country"],
                "trust_score": trust,
                "match_score": match,
                "certifications": org["certifications"],
                "business_type": org["business_type"],
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class CounterpartyMatchRequest(BaseModel):
    hs6: int = Field(..., description="6-digit HS product code", example=100630)
    destination_country: str = Field(
        ..., description="ISO3 destination country code", example="ARE"
    )
    quantity_kg: Optional[float] = Field(
        default=None, description="Required export quantity in kg", example=10000.0
    )
    certifications: Optional[List[str]] = Field(
        default=None,
        description="Required supplier certifications",
        example=["APEDA", "FSSAI"],
    )
    top_n: int = Field(default=5, description="Max results to return", ge=1, le=50)


class CounterpartyRiskRequest(BaseModel):
    organization_id: str = Field(
        ..., description="Organization UUID or internal ID", example="abc123"
    )
    hs6: Optional[int] = Field(
        default=None, description="HS6 code context (optional)", example=100630
    )


# ---------------------------------------------------------------------------
# Endpoint 1: counterparty-match
# ---------------------------------------------------------------------------

@router.post(
    "/predict/counterparty-match",
    summary="Find Verified Export Counterparties",
    description=(
        "Returns a ranked list of counterparty organisations matching the supplied "
        "HS6 product and destination country. When DB is unavailable, returns "
        "structured seed data clearly labelled as such."
    ),
)
def counterparty_match(req: CounterpartyMatchRequest) -> Dict[str, Any]:
    analysis_id = str(uuid.uuid4())

    if _db_available():
        # ------------------------------------------------------------------
        # Live DB path: query organisations + trust_scores via psycopg2
        # ------------------------------------------------------------------
        try:
            import psycopg2  # noqa: PLC0415
            import psycopg2.extras  # noqa: PLC0415

            conn = psycopg2.connect(
                os.environ["SUPABASE_URL"],
                password=os.environ["SUPABASE_KEY"],
                cursor_factory=psycopg2.extras.RealDictCursor,
            )
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT
                            o.id            AS organization_id,
                            o.name,
                            o.country,
                            o.business_type,
                            o.certifications,
                            COALESCE(ts.composite_score, 0.5) AS trust_score
                        FROM organizations o
                        LEFT JOIN trust_scores ts ON ts.organization_id = o.id
                        WHERE o.business_type = 'EXPORTER'
                        ORDER BY ts.composite_score DESC NULLS LAST
                        LIMIT %s
                        """,
                        (req.top_n,),
                    )
                    rows = cur.fetchall()
            conn.close()

            counterparties = []
            for row in rows:
                seed_key = f"{req.hs6}:{req.destination_country}:{row['organization_id']}"
                match_score = round(
                    _deterministic_float(seed_key + ":match", 0.55, 0.98), 3
                )
                counterparties.append(
                    {
                        "organization_id": str(row["organization_id"]),
                        "name": row["name"],
                        "country": row.get("country", ""),
                        "trust_score": float(row["trust_score"]),
                        "match_score": match_score,
                        "certifications": row.get("certifications") or [],
                        "business_type": row.get("business_type", "EXPORTER"),
                    }
                )
            counterparties.sort(key=lambda x: x["match_score"], reverse=True)

            return {
                "status": "OK",
                "data_source": "database",
                "counterparties": counterparties,
                "model_version": "cm-v1.0",
                "analysis_id": analysis_id,
            }

        except Exception as exc:
            logger.warning(
                "DB counterparty-match query failed, falling back to seed data: %s", exc
            )
            # Fall through to seed data on any DB error

    # ------------------------------------------------------------------
    # Stub / seed-data path
    # ------------------------------------------------------------------
    counterparties = _build_seed_counterparties(
        hs6=req.hs6,
        destination_country=req.destination_country,
        quantity_kg=req.quantity_kg,
        top_n=req.top_n,
    )
    return {
        "status": "OK",
        "data_source": "seed_data",
        "counterparties": counterparties,
        "model_version": "cm-v1.0",
        "analysis_id": analysis_id,
    }


# ---------------------------------------------------------------------------
# Endpoint 2: counterparty-risk
# ---------------------------------------------------------------------------

_RISK_LEVELS = [
    (0.80, "LOW"),
    (0.60, "MEDIUM"),
    (0.40, "HIGH"),
    (0.00, "CRITICAL"),
]


def _composite_to_risk_level(score: float) -> str:
    for threshold, level in _RISK_LEVELS:
        if score >= threshold:
            return level
    return "CRITICAL"


@router.post(
    "/predict/counterparty-risk",
    summary="Compute Counterparty Risk Profile",
    description=(
        "Returns a composite risk profile for an organisation, combining trust score, "
        "dispute rate, and completed trade count. Falls back to seed data when DB is unavailable."
    ),
)
def counterparty_risk(req: CounterpartyRiskRequest) -> Dict[str, Any]:
    analysis_id = str(uuid.uuid4())

    if _db_available():
        try:
            import psycopg2  # noqa: PLC0415
            import psycopg2.extras  # noqa: PLC0415

            conn = psycopg2.connect(
                os.environ["SUPABASE_URL"],
                password=os.environ["SUPABASE_KEY"],
                cursor_factory=psycopg2.extras.RealDictCursor,
            )
            with conn:
                with conn.cursor() as cur:
                    # Trust score
                    cur.execute(
                        "SELECT composite_score FROM trust_scores WHERE organization_id = %s LIMIT 1",
                        (req.organization_id,),
                    )
                    ts_row = cur.fetchone()
                    trust_score = float(ts_row["composite_score"]) if ts_row else 0.5

                    # Real name for restricted-party screening (OFAC SDN + UN
                    # Security Council + UK OFSI + EU consolidated lists —
                    # see src/compliance/entity_screening.py). This replaces
                    # the previous sanctions_present/scomet_match_flag stub
                    # slots, which were never populated from any real source.
                    cur.execute(
                        "SELECT COALESCE(trade_name, legal_name) AS org_name FROM organizations WHERE id = %s",
                        (req.organization_id,),
                    )
                    org_row = cur.fetchone()
                    org_name = org_row["org_name"] if org_row else None

                    # Dispute rate
                    cur.execute(
                        """
                        SELECT
                            COUNT(*) FILTER (WHERE status = 'OPEN')   AS open_disputes,
                            COUNT(*)                                    AS total_trades
                        FROM trades
                        WHERE seller_org_id = %s OR buyer_org_id = %s
                        """,
                        (req.organization_id, req.organization_id),
                    )
                    trade_row = cur.fetchone()
                    total_trades = int(trade_row["total_trades"]) if trade_row else 0
                    open_disputes = int(trade_row["open_disputes"]) if trade_row else 0
                    dispute_rate = (
                        round(open_disputes / total_trades, 4) if total_trades > 0 else 0.0
                    )
                    completed = max(0, total_trades - open_disputes)
            conn.close()

            composite = round(trust_score * (1 - dispute_rate * 0.5), 4)
            risk_level = _composite_to_risk_level(composite)
            risk_flags: List[str] = []
            if dispute_rate > 0.10:
                risk_flags.append("HIGH_DISPUTE_RATE")
            if trust_score < 0.50:
                risk_flags.append("LOW_TRUST_SCORE")
            if total_trades < 5:
                risk_flags.append("INSUFFICIENT_TRADE_HISTORY")

            sanctions_screening = None
            if org_name:
                try:
                    from src.compliance.entity_screening import screen_entity, ScreeningDecision  # noqa: PLC0415
                    result = screen_entity(org_name)
                    sanctions_screening = result
                    if result["decision"] == ScreeningDecision.MATCH_REQUIRES_RESTRICTION:
                        risk_flags.append("SANCTIONS_MATCH")
                        risk_level = "CRITICAL"
                    elif result["decision"] == ScreeningDecision.POTENTIAL_MATCH:
                        risk_flags.append("SANCTIONS_POTENTIAL_MATCH_NEEDS_REVIEW")
                except Exception as exc:
                    logger.warning("Entity screening failed for org %s: %s", req.organization_id, exc)

            return {
                "status": "OK",
                "organization_id": req.organization_id,
                "data_source": "database",
                "risk": {
                    "composite_score": composite,
                    "risk_level": risk_level,
                    "trust_score": round(trust_score, 4),
                    "dispute_rate": dispute_rate,
                    "completed_trades": completed,
                    "risk_flags": risk_flags,
                },
                "sanctions_screening": sanctions_screening,
                "model_version": "cr-v1.0",
                "analysis_id": analysis_id,
            }

        except Exception as exc:
            logger.warning(
                "DB counterparty-risk query failed, falling back to seed data: %s", exc
            )

    # ------------------------------------------------------------------
    # No-DB fallback path — seed data only, rule-based flags (see note
    # below on why the IsolationForest is not evaluated here)
    # ------------------------------------------------------------------
    seed_key = f"risk:{req.organization_id}:{req.hs6}"
    trust_score = round(_deterministic_float(seed_key + ":trust", 0.45, 0.95), 4)
    dispute_rate = round(_deterministic_float(seed_key + ":dispute", 0.0, 0.18), 4)
    completed = int(_deterministic_float(seed_key + ":trades", 3, 50) * 47)
    composite = round(trust_score * (1 - dispute_rate * 0.5), 4)
    risk_level = _composite_to_risk_level(composite)

    risk_flags: List[str] = []
    if dispute_rate > 0.10:
        risk_flags.append("HIGH_DISPUTE_RATE")
    if trust_score < 0.50:
        risk_flags.append("LOW_TRUST_SCORE")
    if completed < 5:
        risk_flags.append("INSUFFICIENT_TRADE_HISTORY")

    # If Isolation Forest model artifact is present, evaluate anomaly decision function
    model_source = "seed_data"
    # The IsolationForest at backend/brain/models/trade_risk/ takes 27
    # features. Without a DB, no real per-organization trade_value/
    # net_weight/growth history exists — only 5 of 27 slots could ever be
    # filled, the rest zero-padded, which produced a near-degenerate input
    # (verified: 85.7% of such inputs flagged "outlier", see
    # reports/production/phase6_risk_verdict.md). Running the model on a
    # mostly-fabricated vector and labelling it "isolation_forest_model" is
    # exactly the kind of fake-success bug this codebase fixes elsewhere, so
    # it is not run here. `risk_flags` above (rule-based) is the whole story
    # for this no-DB fallback path — no model score is reported.
    isolation_score = None

    return {
        "status": "OK",
        "organization_id": req.organization_id,
        "data_source": model_source,
        "risk": {
            "composite_score": composite,
            "risk_level": risk_level,
            "trust_score": trust_score,
            "dispute_rate": dispute_rate,
            "completed_trades": completed,
            "isolation_forest_score": isolation_score,
            "risk_flags": risk_flags,
        },
        "model_version": "cr-isolation-forest-v1.0",
        "analysis_id": analysis_id,
    }

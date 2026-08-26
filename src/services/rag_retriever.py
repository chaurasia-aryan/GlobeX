"""
GlobeXAI Trade OS — Comprehensive Regulatory, Tariff, Sanctions & Forecasting RAG Engine

Indexes and retrieves from GlobeXAI's verified offline datasets and live registry facts.
This is what is actually indexed below — kept in sync with the `_*_passages()`
functions in this file, not aspirational:
  1. Official UNCTAD TRAINS & WTO MFN Tariffs (processed/tariff_features.csv)
  2. Sovereign Country Sanctions Regimes (current_facts/country_sanctions_status.json)
     — country-level regime status only. Entity-level fuzzy name/alias screening
     against the OFAC SDN + UN Consolidated List (sdn.csv, alt.csv, un_consolidated.xml,
     uk_conlist.csv, eu_consolidated.xml) is a separate subsystem —
     see src/compliance/entity_screening.py — and is NOT part of this RAG corpus.
  3. DGFT India Export Controls & SCOMET List (current_facts/export_controls.json)
  4. Rules of Origin & Value Addition Formulas (current_facts/rules_of_origin.json)
  5. SPS/TBT Phytosanitary & Technical Standards (current_facts/sps_tbt.json)
  6. Bilateral Treaties & Mandatory Trade Document Schedules (compliance_api._TREATY_MAP
     and ._PRODUCT_DOCUMENTS/._DEFAULT_DOCUMENTS)
  7. Destination-Ranking Export/Demand Features — 3yr export-value CAGR, market share,
     activity ratio (processed/destination_country_ranking_features.csv)
  8. Trade Anomaly Screening Methodology — a description of how the IsolationForest +
     peer-price Z-score model works, not per-transaction anomaly data (no
     `anomaly_features.csv` exists in this repo)
"""

from __future__ import annotations

import csv
import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(os.path.dirname(_HERE))


@dataclass
class Passage:
    text: str
    source: str
    category: str
    metadata: Dict[str, Any]


# ---------------------------------------------------------------------------
# Corpus Builders across all datasets
# ---------------------------------------------------------------------------

def _treaty_passages() -> List[Passage]:
    from src.api.compliance_api import _TREATY_MAP  # noqa: PLC0415

    passages = []
    for (origin, dest), treaty in _TREATY_MAP.items():
        ntms = "; ".join(treaty.get("ntm_barriers", []))
        text = (
            f"Bilateral Trade Treaty {origin} to {dest}: {treaty['agreement']}. "
            f"Preferential customs tariff {treaty['preferential_rate_pct']}%, standard MFN tariff "
            f"{treaty['standard_mfn_rate_pct']}%. Non-tariff regulatory requirements: {ntms}."
        )
        passages.append(
            Passage(
                text=text,
                source="compliance_api._TREATY_MAP",
                category="treaty",
                metadata={"origin": origin, "destination": dest, "type": "treaty", **treaty},
            )
        )
    return passages


def _tariff_csv_passages() -> List[Passage]:
    csv_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "processed", "tariff_features.csv"
    )
    if not os.path.exists(csv_path):
        return []

    passages = []
    seen: Set[str] = set()
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rep = (row.get("reporter_iso3") or "").strip()
                part = (row.get("partner_iso3") or "").strip()
                hs = (row.get("cmd_code") or "").strip()
                desc = (row.get("cmd_desc") or "").strip()
                mfn = row.get("mfn_rate", "0")
                pref = row.get("pref_rate", mfn)
                savings = row.get("duty_savings_pct", "0")
                agree = row.get("trade_agreement", "WTO_MFN")

                dedup_key = f"{rep}:{part}:{hs}:{agree}"
                if dedup_key in seen:
                    continue
                seen.add(dedup_key)

                text = (
                    f"Official Customs Tariff Schedule {rep} to {part} for HS6 {hs} ({desc}): "
                    f"Applied MFN Rate: {mfn}%, Preferential Agreement Rate: {pref}% under {agree}. "
                    f"Preferential Duty Savings: {savings}%. Source: World Bank WITS / UNCTAD TRAINS."
                )
                passages.append(
                    Passage(
                        text=text,
                        source="processed/tariff_features.csv",
                        category="tariff",
                        metadata={
                            "reporter": rep,
                            "partner": part,
                            "hs6": int(hs) if hs.isdigit() else hs,
                            "description": desc,
                            "mfn_rate": float(mfn),
                            "pref_rate": float(pref),
                            "agreement": agree,
                        },
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing tariff_features.csv: %s", exc)

    return passages


def _country_sanctions_passages() -> List[Passage]:
    json_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "compliance_data", "current_facts", "country_sanctions_status.json"
    )
    if not os.path.exists(json_path):
        return []

    passages = []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            facts = data.get("facts", [])
            for fact in facts:
                dest = fact.get("destination")
                val = fact.get("value")
                if not val:
                    # e.g. status=UNSUPPORTED facts with no machine-readable value.
                    continue
                regime_present = val.get("un_regime_present", False)
                entries = val.get("listed_entries_under_regime", 0)
                auth = fact.get("authority", "United Nations Security Council")
                
                status_desc = (
                    f"Active UN Security Council Sanctions Regime in place ({entries} listed entities/individuals)."
                    if regime_present
                    else "No country-wide UN embargo regime present on record."
                )
                text = (
                    f"Sovereign Sanctions Compliance Record for {dest}: {status_desc} "
                    f"Governing Authority: {auth}. Freshness policy: {fact.get('freshness_policy', 'REVERIFY_DAILY')}."
                )
                passages.append(
                    Passage(
                        text=text,
                        source="current_facts/country_sanctions_status.json",
                        category="sanctions",
                        metadata={"destination": dest, "un_regime": regime_present, "authority": auth},
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing country_sanctions_status.json: %s", exc)

    return passages


def _export_controls_passages() -> List[Passage]:
    json_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "compliance_data", "current_facts", "export_controls.json"
    )
    if not os.path.exists(json_path):
        return []

    passages = []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for fact in data.get("facts", []):
                hs = fact.get("hs6")
                val = fact.get("value")
                if not val:
                    # e.g. status=UNSUPPORTED facts with no machine-readable value.
                    continue
                cat = val.get("scomet_category", "General")
                control_type = val.get("control_type", "Standard Clearance")
                auth = fact.get("authority", "Directorate General of Foreign Trade (DGFT), India")
                note = fact.get("verification_note", "")

                text = (
                    f"DGFT India Export Control & SCOMET Regulation for HS6 {hs}: "
                    f"Category: {cat}, Restriction Level: {control_type}. Authority: {auth}. Note: {note}"
                )
                passages.append(
                    Passage(
                        text=text,
                        source="current_facts/export_controls.json",
                        category="export_control",
                        metadata={"hs6": hs, "scomet_category": cat, "control_type": control_type},
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing export_controls.json: %s", exc)

    return passages


def _rules_of_origin_passages() -> List[Passage]:
    json_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "compliance_data", "current_facts", "rules_of_origin.json"
    )
    if not os.path.exists(json_path):
        return []

    passages = []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for fact in data.get("facts", []):
                # The "rta" category holds early-stage RTA negotiation status
                # (no PSR/RVC content) — only "rules_of_origin" facts carry
                # actual origin/value-addition data.
                if fact.get("category") != "rules_of_origin":
                    continue

                value = fact.get("value")
                if not value:
                    # e.g. status=UNSUPPORTED facts where the source API had
                    # no machine-readable rule; nothing retrievable to index.
                    continue

                fact_type = fact.get("fact_type")
                jurisdiction = fact.get("jurisdiction", "")
                origin = fact.get("origin", "")
                destination = fact.get("destination", "")
                hs6 = fact.get("hs6")

                if fact_type == "ORIGIN_SCHEME":
                    text = (
                        f"Rules of Origin scheme for {origin} exports to {destination} ({jurisdiction}): "
                        f"{value.get('title') or value.get('scheme_code', 'unnamed scheme')}. "
                        + ("Unilateral preference scheme. " if value.get("unilateral") else "")
                        + f"Reference document: {value.get('origin_reference_document', 'not specified')}."
                    )
                elif fact_type == "ORIGIN_CRITERIA":
                    criteria = "; ".join(value.get("criteria", []))
                    va_methods = "; ".join(value.get("value_addition_methods", []))
                    text = (
                        f"Rules of Origin criteria for {origin} to {destination} ({jurisdiction}), "
                        f"{value.get('article', 'origin criteria')}: {criteria}. "
                        + (f"Value-addition calculation methods: {va_methods}. " if va_methods else "")
                        + f"Proof of origin: {value.get('proof_of_origin', 'not specified')}."
                    )
                elif fact_type == "PRODUCT_SPECIFIC_RULE":
                    psr = value.get("product_specific_rule") or value.get("rule")
                    if not psr:
                        continue
                    text = (
                        f"Product-specific rule of origin for HS6 {hs6} ({origin} to {destination}, "
                        f"{jurisdiction}): {psr}."
                    )
                else:
                    continue

                passages.append(
                    Passage(
                        text=text,
                        source=fact.get("source_document", "current_facts/rules_of_origin.json"),
                        category="rules_of_origin",
                        metadata={
                            "hs6": hs6,
                            "jurisdiction": jurisdiction,
                            "fact_type": fact_type,
                            "origin": origin,
                            "destination": destination,
                        },
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing rules_of_origin.json: %s", exc)

    return passages


def _sps_tbt_passages() -> List[Passage]:
    json_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "compliance_data", "current_facts", "sps_tbt.json"
    )
    if not os.path.exists(json_path):
        return []

    passages = []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for fact in data.get("facts", []):
                hs = fact.get("hs6")
                val = fact.get("value")
                if not val:
                    # e.g. status=UNSUPPORTED facts with no machine-readable value.
                    continue
                measure = val.get("measure_description", "Phytosanitary / Quality Compliance")
                auth = fact.get("authority", "National Plant Protection Organization / FSSAI")

                text = (
                    f"Sanitary & Phytosanitary (SPS) / TBT Requirement for HS6 {hs}: {measure}. "
                    f"Enforcing Authority: {auth}. Lab test analysis for Maximum Residue Limits (MRL) required."
                )
                passages.append(
                    Passage(
                        text=text,
                        source="current_facts/sps_tbt.json",
                        category="sps_tbt",
                        metadata={"hs6": hs, "authority": auth},
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing sps_tbt.json: %s", exc)

    return passages


def _document_passages() -> List[Passage]:
    from src.api.compliance_api import _PRODUCT_DOCUMENTS, _DEFAULT_DOCUMENTS  # noqa: PLC0415

    passages = []
    for hs6, docs in _PRODUCT_DOCUMENTS.items():
        for d in docs:
            req = "mandatory" if d["mandatory"] else "optional"
            text = f"Mandatory Export/Import Document for HS6 {hs6}: {d['name']} ({req}), issued by {d['issuing_authority']}."
            passages.append(
                Passage(
                    text=text,
                    source="compliance_api._PRODUCT_DOCUMENTS",
                    category="document",
                    metadata={"hs6": hs6, "type": "document", **d},
                )
            )
    for d in _DEFAULT_DOCUMENTS:
        req = "mandatory" if d["mandatory"] else "optional"
        text = f"General Cross-Border Trade Document: {d['name']} ({req}), issued by {d['issuing_authority']}."
        passages.append(
            Passage(
                text=text,
                source="compliance_api._DEFAULT_DOCUMENTS",
                category="document",
                metadata={"hs6": None, "type": "document", **d},
            )
        )
    return passages


def _forecasting_passages() -> List[Passage]:
    csv_path = os.path.join(
        _REPO_ROOT, "backend", "brain", "datasets", "final", "processed", "destination_country_ranking_features.csv"
    )
    if not os.path.exists(csv_path):
        return []

    passages = []
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i > 250:  # limit to top representative corridors
                    break
                imp = row.get("importer_iso3") or ""
                hs = row.get("hs6") or ""
                raw_growth = row.get("export_value_cagr_3y")
                try:
                    growth = round(float(raw_growth) * 100, 2)  # stored as a fraction, not a percentage
                except (TypeError, ValueError):
                    growth = "N/A"
                share = row.get("destination_market_share_latest", "N/A")  # already stored as a percentage
                activity = row.get("activity_ratio", "N/A")
                text = (
                    f"Market Demand & Corridor Intelligence: Destination {imp} for HS6 {hs} "
                    f"recorded a 3-year export-value CAGR of {growth}%, holding a {share}% share of the "
                    f"destination's import market for this product, with an activity ratio of {activity} "
                    f"across the observed window. Derived from the destination-ranking feature set "
                    f"(recent_3y export value/weight trends, RTA and tariff context)."
                )
                passages.append(
                    Passage(
                        text=text,
                        source="processed/destination_country_ranking_features.csv",
                        category="forecasting",
                        metadata={"importer": imp, "hs6": hs, "export_value_cagr_3y": growth, "market_share": share, "activity_ratio": activity},
                    )
                )
    except Exception as exc:
        logger.warning("RAG: Failed indexing forecasting features: %s", exc)

    return passages


def _trade_anomaly_passages() -> List[Passage]:
    passages = [
        Passage(
            text=(
                "Trade Anomaly & Customs Undervaluation Screen: Compares transaction unit price (USD/kg) "
                "against 26-year empirical WITS trade distributions (P10, Median, P90). "
                "Transactions falling below P10 threshold trigger Customs Mis-Invoicing / Transfer Pricing flags."
            ),
            source="trade_anomaly/unsupervised_screen.py",
            category="anomaly",
            metadata={"model": "IsolationForest + Peer-Price Z-Score", "dataset": "26yr WITS Observations"},
        ),
        Passage(
            text=(
                "Volume Surge & Outlier Detection: Evaluates shipment container quantity against bilateral corridor "
                "historical moving averages. Abnormal single-shipment surges (>3.5 standard deviations) are flagged "
                "for trade fraud and cargo mismatch verification."
            ),
            source="trade_anomaly/feature_pipeline.py",
            category="anomaly",
            metadata={"model": "IsolationForest Anomaly Engine"},
        ),
    ]
    return passages


# ---------------------------------------------------------------------------
# Main RAG Retriever Class
# ---------------------------------------------------------------------------

class ComplianceRAGRetriever:
    """High-speed TF-IDF + Cosine Similarity RAG Retriever over GlobeXAI's trade corpus."""

    def __init__(self) -> None:
        self._passages: List[Passage] = []
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._matrix = None

    def _ensure_index(self) -> None:
        if self._vectorizer is not None:
            return

        corpus = (
            _treaty_passages()
            + _tariff_csv_passages()
            + _country_sanctions_passages()
            + _export_controls_passages()
            + _rules_of_origin_passages()
            + _sps_tbt_passages()
            + _document_passages()
            + _forecasting_passages()
            + _trade_anomaly_passages()
        )

        self._passages = corpus
        if not self._passages:
            logger.warning("RAG retriever: empty corpus")
            return

        self._vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self._matrix = self._vectorizer.fit_transform([p.text for p in self._passages])
        logger.info("RAG Retriever initialized with %d verified passages.", len(self._passages))

    def retrieve(
        self,
        query: str,
        top_k: int = 6,
        origin_iso3: Optional[str] = None,
        destination_iso3: Optional[str] = None,
        hs6: Optional[int] = None,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieves passages matching query semantics, corridor, and commodity."""
        self._ensure_index()
        results: List[Dict[str, Any]] = []

        if self._vectorizer is not None and self._passages:
            # Query expansion with corridor codes
            expanded_query = query
            if origin_iso3:
                expanded_query += f" {origin_iso3}"
            if destination_iso3:
                expanded_query += f" {destination_iso3}"
            if hs6:
                expanded_query += f" {hs6}"

            qvec = self._vectorizer.transform([expanded_query])
            sims = cosine_similarity(qvec, self._matrix)[0]
            ranked = sorted(range(len(sims)), key=lambda i: sims[i], reverse=True)

            count = 0
            for i in ranked:
                if sims[i] <= 0.0:
                    continue
                p = self._passages[i]
                if category and p.category != category:
                    continue

                results.append(
                    {
                        "text": p.text,
                        "source": p.source,
                        "category": p.category,
                        "relevance": round(float(sims[i]), 4),
                        "metadata": p.metadata,
                    }
                )
                count += 1
                if count >= top_k:
                    break

        return results

    def retrieve_structured_evidence(
        self,
        origin_iso3: str = "IND",
        destination_iso3: str = "ARE",
        hs6: int = 100630,
        query: str = "trade compliance and tariffs",
    ) -> Dict[str, Any]:
        """Returns structured multi-domain evidence synthesized across datasets."""
        tariffs = self.retrieve(f"tariff rate duty savings {hs6}", top_k=2, origin_iso3=origin_iso3, destination_iso3=destination_iso3, category="tariff")
        treaties = self.retrieve(f"treaty agreement {origin_iso3} {destination_iso3}", top_k=1, origin_iso3=origin_iso3, destination_iso3=destination_iso3, category="treaty")
        sanctions = self.retrieve(f"sanctions status {destination_iso3}", top_k=1, destination_iso3=destination_iso3, category="sanctions")
        export_ctrl = self.retrieve(f"DGFT SCOMET export controls {hs6}", top_k=1, hs6=hs6, category="export_control")
        origin_rules = self.retrieve(f"rules of origin value addition {hs6}", top_k=1, hs6=hs6, category="rules_of_origin")
        sps_tbt = self.retrieve(f"phytosanitary laboratory test {hs6}", top_k=1, hs6=hs6, category="sps_tbt")
        docs = self.retrieve(f"mandatory document certificate {hs6}", top_k=3, hs6=hs6, category="document")
        anomaly = self.retrieve("customs undervaluation peer-price z-score", top_k=1, category="anomaly")

        all_passages = treaties + tariffs + sanctions + export_ctrl + origin_rules + sps_tbt + docs + anomaly

        return {
            "origin": origin_iso3,
            "destination": destination_iso3,
            "hs6": hs6,
            "query": query,
            "passages": all_passages,
            "structured_evidence": {
                "treaties": treaties,
                "customs_tariffs": tariffs,
                "sanctions_clearance": sanctions,
                "export_controls": export_ctrl,
                "rules_of_origin": origin_rules,
                "sps_tbt_requirements": sps_tbt,
                "mandatory_documents": docs,
                "anomaly_price_checks": anomaly,
            },
            "sources_cited": list(dict.fromkeys(p["source"] for p in all_passages)),
        }


_singleton: Optional[ComplianceRAGRetriever] = None


def get_retriever() -> ComplianceRAGRetriever:
    global _singleton
    if _singleton is None:
        _singleton = ComplianceRAGRetriever()
    return _singleton

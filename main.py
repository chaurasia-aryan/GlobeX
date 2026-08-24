"""
GlobeXAI Trade OS — FastAPI Unified Application Entry Point

Assembles all ML microservice routers into a single coherent, production-quality API:
- Trade Anomaly:       POST /api/trade-anomaly/predict, GET /coverage, GET /health
- Partner Discovery:   POST /predict/market-opportunity
- HS Classification:   POST /predict/hs-code
- Counterparty Match:  POST /predict/counterparty-match
- Counterparty Risk:   POST /predict/counterparty-risk
- Compliance & Tariffs: POST /compliance/rag-analyze
- Document OCR:        POST /documents/ocr-extract
- Global Health:       GET /health, GET /
"""

import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment configuration (with zero-dependency fallback)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_file = Path(__file__).resolve().parent / ".env"
    if env_file.exists():
        with open(env_file, encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    os.environ.setdefault(_k.strip(), _v.strip())

# Ensure repository root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("globex-api")

# Import all API routers
from src.trade_anomaly.api import router as trade_anomaly_router
from src.api.hs_classifier import router as hs_classifier_router
from src.api.partner_discovery_api import router as partner_discovery_router
from src.api.counterparty_api import router as counterparty_router
from src.api.compliance_api import router as compliance_router
from src.api.documents_api import router as documents_router
from src.api.marketplace_api import router as marketplace_router
from src.api.trades_api import router as trades_router
from src.api.escrow_api import router as escrow_router
from src.api.scoring_api import router as scoring_router
from src.db.client import init_pool, close_pool, is_configured as db_is_configured
from src.services import chain_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for warming up models and verifying artifact availability."""
    logger.info("Initializing GlobeXAI Trade OS Unified API...")
    t0 = time.perf_counter()

    # Pre-warm trade anomaly inference service
    try:
        from src.trade_anomaly.api import get_inference_service
        svc = get_inference_service()
        logger.info(
            "Trade Anomaly Service ready (model_loaded=%s, version=%s)",
            svc.model is not None,
            svc.metadata.get("version", "1.0.0"),
        )
    except Exception as exc:
        logger.warning("Trade Anomaly warm-up warning: %s", exc)

    # Pre-warm HS classifier catalogue
    try:
        from src.api.hs_classifier import _load_catalogue
        cat = _load_catalogue()
        logger.info("HS Catalogue ready (loaded=%s)", cat is not None)
    except Exception as exc:
        logger.warning("HS Catalogue warm-up warning: %s", exc)

    # Initialize DB pool — never raises; the 7 ML routers work with zero DB.
    await init_pool()

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)
    logger.info("GlobeXAI Trade OS API ready in %sms", elapsed_ms)

    yield

    await close_pool()
    logger.info("Shutting down GlobeXAI Trade OS Unified API...")


# Create FastAPI application
app = FastAPI(
    title="GlobeXAI Trade OS API",
    description=(
        "Production AI/ML Microservice Gateway for cross-border B2B trade intelligence, "
        "partner discovery, anomaly detection, counterparty matching, and regulatory compliance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration (Permissive for local development & Docker networks)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all microservice routers
app.include_router(trade_anomaly_router)
app.include_router(hs_classifier_router)
app.include_router(partner_discovery_router)
app.include_router(counterparty_router)
app.include_router(compliance_router)
app.include_router(documents_router)
app.include_router(marketplace_router)
app.include_router(trades_router)
app.include_router(escrow_router)
app.include_router(scoring_router)


# Root and health check endpoints
@app.get("/", summary="API Root & System Metadata")
def root_info() -> Dict[str, Any]:
    return {
        "name": "GlobeXAI Trade OS API Gateway",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "endpoints": {
            "trade_anomaly": "/api/trade-anomaly/predict",
            "market_opportunity": "/predict/market-opportunity",
            "hs_classification": "/predict/hs-code",
            "counterparty_match": "/predict/counterparty-match",
            "counterparty_risk": "/predict/counterparty-risk",
            "compliance_rag": "/compliance/rag-analyze",
            "documents_ocr": "/documents/ocr-extract",
            "marketplace_match_buyers": "/api/v1/marketplace/match-buyers",
            "health": "/health",
        },
        "docs": "/docs",
    }


@app.get("/health", summary="Unified System Health Check")
async def health_check() -> Dict[str, Any]:
    """Returns aggregated status of all subsystem models and data sources."""
    # Trade Anomaly health
    anomaly_ok = False
    try:
        from src.trade_anomaly.api import get_inference_service
        svc = get_inference_service()
        anomaly_ok = svc.model is not None
    except Exception:
        anomaly_ok = False

    # Partner Discovery data availability
    pd_ok = False
    try:
        from src.partner_discovery.data import PartnerDataLoader
        loader = PartnerDataLoader(data_dir="backend/brain_temporary/data")
        pd_ok = not loader.get_product_catalogue().empty
    except Exception:
        pd_ok = False

    # Real DB round-trip, not just "is an env var set"
    if not db_is_configured():
        db_status = "NOT_CONFIGURED"
    else:
        try:
            from src.db.client import acquire
            async with acquire() as conn:
                await conn.fetchval("select 1")
            db_status = "CONNECTED"
        except Exception:
            db_status = "UNAVAILABLE"

    # Real adapter ping, not a hardcoded "OPERATIONAL" string
    chain_status = await chain_client.get_chain_status()

    return {
        "status": "HEALTHY",
        "timestamp": time.time(),
        "subsystems": {
            "trade_anomaly_model": "LOADED" if anomaly_ok else "HEURISTIC_FALLBACK",
            "partner_discovery_data": "AVAILABLE" if pd_ok else "UNAVAILABLE",
            "hs_classifier": "ACTIVE",
            "compliance_engine": "ACTIVE",
            "counterparty_engine": "ACTIVE",
            "database_connection": db_status,
            "blockchain_adapter": chain_status,
        },
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

# GlobeXAI Integration Inventory

## 1. System Inventory

| Component | Technology | Path / Location | Status | Integration Role |
|---|---|---|---|---|
| **Frontend Web App** | React 18, Vite 5, Tailwind CSS, shadcn/ui | `src/` | Operational | Interactive UI for trade intake, ranking, risk assessment, and active trade workspace. |
| **FastAPI Unified Gateway** | FastAPI, Uvicorn, Python 3.12/3.13 | `main.py` | Operational | Single entry point assembling all ML, ranking, and compliance endpoints on port 8000. |
| **HS Code Classifier** | FastAPI APIRouter, Catalogue Matcher | `src/api/hs_classifier.py` | Operational | Resolves commodity names/text into canonical 6-digit HS codes (e.g. Basmati -> 100630). |
| **Partner Discovery & Ranking** | PyTorch GRU, Multi-Factor Ranking Engine | `src/partner_discovery/`, `src/api/partner_discovery_api.py` | Operational | Evaluates commercial promise across destination corridors using 26 years of trade data. |
| **Trade Anomaly Detection** | XGBoost Anomaly Classifier, Rolling Baseline | `src/trade_anomaly/`, `src/trade_anomaly/api.py` | Operational | Detects volume collapses, price shifts, and corridor deviations against 3-month baselines. |
| **Counterparty Intelligence** | Supabase/PostgreSQL client + deterministic stub | `src/api/counterparty_api.py` | Operational | Ranks verified suppliers by trust score and computes composite counterparty risk. |
| **Regulatory Compliance & RAG** | Deterministic Rules Engine (CEPA, NTMs, Tariffs) | `src/api/compliance_api.py` | Operational | Determines preferential tariffs (e.g., India-UAE CEPA 0.0%) and mandatory export docs. |
| **Document Intelligence OCR** | FastAPI APIRouter, OCR Gateway | `src/api/documents_api.py` | Operational (Stub mode) | Extracts text and tables from invoices and bills of lading. |
| **Database Schema & Migrations** | Supabase / PostgreSQL | `backend/database/supabase/migrations/` | Operational | 18 core tables + 5 n8n integration tables (`trade_analysis`, `escrow_accounts`, `blockchain_records`, `shipment_events`, `trade_data_ingestion_log`). |
| **n8n Workflow Automation** | n8n JSON Workflow Engine | `n8n/globex_trade_automation.workflow.json` | Operational | Orchestrates 5 branches: Analysis, Trade Creation, Document Verification, Shipment, Ingestion. |

---

## 2. ML Model & Artifact Inventory

| Model Name | Artifact Location | Type | Input Features | Optimal Threshold | Validation Metric | Status |
|---|---|---|---|---|---|---|
| **Trade Behaviour Anomaly Detector** | `backend/brain/models/trade_anomaly/` | XGBoost Anomaly Classifier | 20 features (trade value, net weight, unit price, 3m rolling stats, MoM growth, partner share) | 0.45 (locked) | F1: 0.9818 | Loaded & verified |
| **Trade Risk Autoencoder** | `backend/brain/models/trade_risk/` | GRU Autoencoder + Isolation Forest | Multi-output risk feature vectors | Scaler: RobustScaler | Reconstruction error threshold | Loaded & verified |
| **Partner Discovery Forecaster** | `backend/brain_temporary/models/partner_discovery/forecasting/` | GRU Multi-Output Forecaster | 5-step historical sequence (FOB unit value, export weight, tariff) | N/A (Regression) | Momentum fallback active | Loaded & verified |
| **Destination Ranking Engine** | `backend/brain_temporary/models/destination_ranking/` | Multi-Factor Ranking with Quantity Fit | Revealed demand, forecast demand, trade access, economic capacity, logistics, stability | Regime: Balanced | Normalized score [0-100] | Loaded & verified |

---

## 3. Dataset Inventory

| Dataset Name | File Path | Format | Size | Rows / Temporal Window | Description |
|---|---|---|---|---|---|
| **Partner Discovery (India Exporter 2000-2025)** | `backend/brain_temporary/data/processed/partner_discovery_exporter_2000_2025.parquet` | Parquet | 3.3 MB | 26 Years (2000-2025) | Panel dataset of Indian exports across global destination corridors with tariffs and indicators. |
| **Trade Anomaly Observations** | `backend/brain/processed/trade_anomaly/02_trade_anomaly.parquet` | Parquet | 1.1 MB | 12,288 rows (48 periods) | Monthly time series panel covering 16 partner nations and 8 key HS6 commodities. |
| **Product Catalogue** | `backend/brain/models/destination_ranking/product_catalogue.parquet` | Parquet | 4.2 KB | Unique HS6 Codes | Product description to HS6 mapping catalogue for fast string resolution. |
| **Destination Ranking Features** | `backend/brain/processed/destination_country_ranking_features.parquet` | Parquet | 172 KB | Destination Corridors | Precomputed macroeconomic, logistical, and tariff indicators for destination countries. |

---

## 4. API Endpoints Inventory

| Method | Route | Subsystem | Request Body / Params | Response Schema |
|---|---|---|---|---|
| `GET` | `/health` | Gateway Health | None | `{"status": "HEALTHY", "subsystems": {...}}` |
| `POST` | `/predict/hs-code` | HS Classification | `{"product": "basmati rice", "origin": "IND"}` | `{"status": "OK", "hs6": 100630, "hs_code_formatted": "1006.30", ...}` |
| `POST` | `/predict/market-opportunity` | Partner Discovery | `{"product": "basmati rice", "quantity_kg": 50000, "top_n": 5}` | `{"status": "success", "top_recommendations": [...], ...}` |
| `POST` | `/api/trade-anomaly/predict` | Trade Anomaly | `{"trade_flow": "Export", "hs6": 100630, "partner_country": "ARE", "trade_value_usd": 120000, "quantity": 50000}` | `{"status": "OK", "risk": {"anomaly_score": 0.9975, "risk_level": "CRITICAL"}, "signals": [...]}` |
| `POST` | `/predict/counterparty-match` | Counterparty Match | `{"hs6": 100630, "destination_country": "ARE", "quantity_kg": 50000}` | `{"status": "OK", "counterparties": [{"name": "...", "trust_score": 0.94}, ...]}` |
| `POST` | `/predict/counterparty-risk` | Counterparty Risk | `{"organization_id": "abc123", "hs6": 100630}` | `{"status": "OK", "risk": {"composite_score": 0.88, "risk_level": "LOW"}}` |
| `POST` | `/compliance/rag-analyze` | Regulatory & Tariffs | `{"hs6": 100630, "origin_country": "IND", "destination_country": "ARE"}` | `{"status": "OK", "tariff": {"preferential_rate_pct": 0.0, "agreement": "India-UAE CEPA"}, "required_documents": [...]}` |
| `POST` | `/api/v1/marketplace/match-buyers` | Marketplace | `{"commodity": "Basmati Rice", "quantity": 500, "unit": "MT", "destinationCountry": "UAE"}` | `{"query": {...}, "candidateCount": 7420, "strongMatchCount": 142, "recommendations": [...]}` |
| `POST` | `/documents/ocr-extract` | Document Intelligence | `{"document_url": "https://...", "document_type": "COMMERCIAL_INVOICE"}` | `{"status": "STUB", "data_source": "stub"}` |

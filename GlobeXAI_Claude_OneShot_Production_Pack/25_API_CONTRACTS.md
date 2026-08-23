# API Contracts

## Required endpoints

Preserve existing:
- `POST /predict/market-opportunity`
- `POST /predict/hs-code`
- `POST /api/trade-anomaly/predict`
- `POST /predict/counterparty-risk`
- `POST /compliance/rag-analyze`
- `POST /documents/ocr-extract`

Add minimally:
- `POST /compliance/screen`
- `POST /compliance/sanctions-screen`
- `POST /compliance/product-controls`
- `POST /compliance/transaction-gate`
- `GET /compliance/source-status`
- `GET /compliance/coverage`
- `GET /health`

## Response principles

Every compliance response includes:
- decision;
- reasons;
- evidence;
- source version;
- retrieved timestamp;
- coverage;
- request ID.

Every ML response includes:
- model version;
- data version;
- training cutoff;
- uncertainty/limitations where relevant.

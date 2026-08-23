# GlobeXAI Generated n8n Workflow Guide

This document describes the design, architecture, and node-by-node specifications for the generated n8n workflow file:
`n8n/globex_trade_automation.workflow.json`

---

## 1. Overview & Setup

The generated workflow coordinates all cross-border B2B trade lifecycle events for GlobeXAI:
1. **Section 1: AI Trade Analysis** (Synchronous Webhook -> 5 Microservices -> Aggregation -> DB Persist -> Response)
2. **Section 2: Trade Creation & Escrow Initialization** (Webhook -> Org Validation -> Trade Insert -> Escrow Insert)
3. **Section 3: Document Verification & Blockchain Integrity** (Webhook -> OCR -> Consistency Check -> SHA-256 Hash -> Chain Anchor)
4. **Section 4: Shipment Telemetry & Settlement Watchdog** (Cron 6h -> Active Escrows -> Tracking API -> Milestone Update -> Release/Hold)
5. **Section 5: Trade Panel Ingestion** (Cron Daily -> UN Comtrade / WITS -> Ingestion Audit Log)

### Required Environment Variables in n8n

| Variable Name | Default / Example Value | Purpose |
|---|---|---|
| `GLOBEX_API_BASE_URL` | `http://localhost:8000` | Target URL for the unified FastAPI backend (`main.py`) |
| `GLOBEX_SUPABASE_URL` | `postgresql://...` | Connection URL for Supabase PostgreSQL database |
| `GLOBEX_TRACKING_API_URL` | `https://api.aftership.com/v4` | Carrier tracking REST API |
| `GLOBEX_TRACKING_API_KEY` | *(Secret)* | Carrier tracking authentication key |
| `GLOBEX_BLOCKCHAIN_SERVICE_URL` | `https://rpc.sepolia.org` | EVM Testnet RPC endpoint |
| `GLOBEX_COMTRADE_API_URL` | `https://comtradeapi.un.org/data/v1/get` | UN Comtrade ingestion API |
| `GLOBEX_WITS_API_URL` | `https://wits.worldbank.org/API/V1/SDMX/V21/rest/data` | World Bank WITS trade tariff API |

---

## 2. Detailed Node Specifications

### Section 1: AI Trade Analysis Workflow

#### `Webhook — Analyze Trade`
- **Path**: `POST /webhook/analyze-trade`
- **Response Mode**: `responseNode` (held open until `Respond — Analysis Result`)
- **Input**: Trade intent JSON from frontend wizard.

#### `Set — Normalize Input`
- **Purpose**: Type casting and default assignments.
- **Fields**: `product` (string), `origin_country` (default `'IND'`), `destination_country` (string), `quantity_kg` (numeric), `target_price_usd` (numeric), `trade_flow` (default `'Export'`).

#### `HTTP — HS Classifier`
- **URL**: `{{$env.GLOBEX_API_BASE_URL}}/predict/hs-code`
- **Method**: `POST`
- **Body**: `{"product": $json.product, "origin": $json.origin_country, "destination": $json.destination_country}`

#### `HTTP — Market Opportunity`
- **URL**: `{{$env.GLOBEX_API_BASE_URL}}/predict/market-opportunity`
- **Method**: `POST`
- **Body**: `{"product": $json.product, "quantity_kg": $json.quantity_kg, "regime": $json.regime, "top_n": 10}`

#### `HTTP — Trade Anomaly`
- **URL**: `{{$env.GLOBEX_API_BASE_URL}}/api/trade-anomaly/predict`
- **Method**: `POST`
- **Body**: Explicit JSON with `trade_flow`, `hs6`, `partner_country`, `trade_value_usd`, `quantity`, `quantity_unit: "kg"`.

#### `HTTP — Counterparty Match`
- **URL**: `{{$env.GLOBEX_API_BASE_URL}}/predict/counterparty-match`
- **Method**: `POST`
- **Body**: `{"hs6": $json.hs6, "destination_country": $json.destination_country, "quantity_kg": $json.quantity_kg, "top_n": 5}`

#### `HTTP — Compliance`
- **URL**: `{{$env.GLOBEX_API_BASE_URL}}/compliance/rag-analyze`
- **Method**: `POST`
- **Body**: `{"hs6": $json.hs6, "origin_country": $json.origin_country, "destination_country": $json.destination_country, "certifications": $json.certifications}`

#### `Code — Aggregate Analysis`
- **Purpose**: Calculates overall multi-criteria trade score, recommendation, and preserves separate ML dimensions without opaque collapsing.
- **Formula**: `0.40 * market + 0.30 * compliance + 0.20 * (100 - anomaly * 100) + 0.10 * cp_match`.

#### `Postgres — Save Analysis`
- **Operation**: `INSERT INTO public.trade_analysis`
- **Columns**: All individual ML dimensions, full JSON detail blobs, model versions, and status.

#### `Respond — Analysis Result`
- **Status**: 200 OK
- **Body**: Complete unified trade analysis JSON.

---

### Section 2: Trade Creation & Escrow

- Verifies seller organization in `public.organizations` where `verification_status = 'VERIFIED'`.
- Inserts new trade into `public.trades` with status `'CREATED'`.
- Inserts escrow account record into `public.escrow_accounts` with status `'PENDING'`.

---

### Section 3: Document Verification & Blockchain Anchoring

- Extracts fields via `POST /documents/ocr-extract`.
- Compares extracted quantities and HS code against reference trade record in `public.trades`.
- If mismatch detected: Updates `trade_documents.verification_result = 'REJECTED'` and logs audit alert.
- If consistent: Generates SHA-256 digest, inserts `public.blockchain_records` anchoring record, and updates `trade_documents.verification_result = 'VERIFIED'`.

---

### Section 4: Shipment Tracking & Settlement Watchdog

- Runs every 6 hours to poll active trades where `escrow_accounts.status IN ('FUNDED', 'HELD')`.
- Calls tracking API, normalizes telemetry to `DISPATCHED`, `IN_TRANSIT`, or `RECEIVED`.
- Logs event in `public.shipment_events`.
- When `received == true`: Releases escrow (`escrow_accounts.status = 'RELEASED'`) and completes trade (`trades.status = 'COMPLETED'`).

---

### Section 5: Trade Panel Data Ingestion

- Runs daily at 02:00 UTC to ingest monthly UN Comtrade and World Bank WITS panel updates.
- Records audit log in `public.trade_data_ingestion_log`.

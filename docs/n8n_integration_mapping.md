# GlobeXAI n8n Integration Mapping

This document provides the canonical mapping between **n8n Workflow Nodes**, **FastAPI Microservice Endpoints**, and **PostgreSQL/Supabase Database Schema Entities**.

---

## 1. Section 1: AI Trade Analysis Workflow

| n8n Node Name | Node Type | Target Endpoint / Operation | Incoming Input Payload | Outgoing Output / Transformed Fields | Canonical Database Target Table & Column |
|---|---|---|---|---|---|
| **Webhook — Analyze Trade** | `webhook` | `POST /webhook/analyze-trade` | HTTP POST from Frontend / Trader | `body`: `{product, origin_country, destination_country, quantity_kg, target_price_usd, certifications, ...}` | `public.trade_analysis` (stored at end of flow) |
| **Set — Normalize Input** | `set` | In-memory normalization | `body` JSON | Structured fields with strict fallback types: `product` (str), `quantity_kg` (num), `origin_country` (default 'IND') | N/A (Flow context) |
| **HTTP — HS Classifier** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/predict/hs-code` | `{"product": $json.product, "origin": $json.origin_country}` | `{"status": "OK", "hs6": 100630, "hs_code_formatted": "1006.30", "product_description": "..."}` | `public.trade_analysis.hs6`, `public.trade_analysis.hs_code_str` |
| **HTTP — Market Opportunity** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/predict/market-opportunity` | `{"product": $json.product, "quantity_kg": $json.quantity_kg, "top_n": 10}` | `{"status": "success", "top_recommendations": [...], "summary_table": [...]}` | `public.trade_analysis.market_opportunity_score`, `public.trade_analysis.destination_rank`, `public.trade_analysis.market_opportunity_detail` |
| **HTTP — Trade Anomaly** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/api/trade-anomaly/predict` | `{"trade_flow": "Export", "hs6": 100630, "partner_country": "ARE", "trade_value_usd": ..., "quantity": ...}` | `{"status": "OK", "risk": {"anomaly_score": 0.18, "risk_level": "LOW"}, "signals": [...]}` | `public.trade_analysis.trade_anomaly_score`, `public.trade_analysis.trade_risk_level`, `public.trade_analysis.trade_anomaly_detail` |
| **HTTP — Counterparty Match** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/predict/counterparty-match` | `{"hs6": 100630, "destination_country": "ARE", "quantity_kg": ..., "top_n": 5}` | `{"status": "OK", "counterparties": [{"name": "...", "trust_score": 0.94, "match_score": 0.96}, ...]}` | `public.trade_analysis.counterparty_match_score`, `public.trade_analysis.counterparty_matches` |
| **HTTP — Compliance** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/compliance/rag-analyze` | `{"hs6": 100630, "origin_country": "IND", "destination_country": "ARE"}` | `{"status": "OK", "tariff": {"preferential_rate_pct": 0.0}, "required_documents": [...], "compliance_score": 90.0}` | `public.trade_analysis.compliance_score`, `public.trade_analysis.compliance_detail` |
| **Code — Aggregate Analysis** | `code` | Multi-dimensional scoring aggregation | All upstream HTTP responses | `{overall_trade_score, recommendation: "PROCEED", model_versions: {...}}` | `public.trade_analysis.overall_trade_score`, `public.trade_analysis.recommendation` |
| **Postgres — Save Analysis** | `postgres` | SQL `INSERT INTO public.trade_analysis` | Aggregated payload | Returns `id` (UUID) | `public.trade_analysis` (all columns persisted) |
| **Respond — Analysis Result** | `respondToWebhook` | HTTP Response to caller | Aggregated JSON payload | Full unified analysis JSON returned to frontend | N/A (HTTP 200) |

---

## 2. Section 2: Trade Creation & Escrow Setup

| n8n Node Name | Node Type | Target Operation | Input Payload | Output / Next Step | Canonical Database Target Table & Column |
|---|---|---|---|---|---|
| **Webhook — Create Trade** | `webhook` | `POST /webhook/create-trade` | `{buyer_org_id, counterparty_org_id, hs_code, product_name, quantity_kg, price_per_unit_usd, total_value_usd}` | Forward to counterparty verification | `public.trades` |
| **Postgres — Fetch Verified Org** | `postgres` | SQL `SELECT ... FROM public.organizations WHERE id = $1` | `counterparty_org_id` | Verifies seller organization exists and has `verification_status = 'VERIFIED'` | `public.organizations` (`id`, `legal_name`, `verification_status`) |
| **IF — Counterparty Valid?** | `if` | Conditional check | Org query result | If valid -> proceed; If invalid -> return 422 error | N/A |
| **Postgres — Create Trade** | `postgres` | SQL `INSERT INTO public.trades` | Trade parameters + verified org ID | Creates trade with status `'CREATED'` and returns `id` | `public.trades` (`id`, `buyer_org_id`, `seller_org_id`, `hs_code`, `total_value_usd`, `status`) |
| **Postgres — Create Escrow Record** | `postgres` | SQL `INSERT INTO public.escrow_accounts` | Trade UUID + trade value | Creates escrow record with status `'PENDING'`, token `'USDC'`, chain `'EVM_TESTNET'` | `public.escrow_accounts` (`id`, `trade_id`, `amount_usdc`, `amount_usd`, `status`, `chain`) |
| **Respond — Trade Created** | `respondToWebhook` | HTTP 200 response | `{status: "CREATED", trade_id, escrow_account_id}` | Confirms trade and escrow record generation | N/A |

---

## 3. Section 3: Document Verification & Blockchain Anchoring

| n8n Node Name | Node Type | Target Operation | Input Payload | Output / Next Step | Canonical Database Target Table & Column |
|---|---|---|---|---|---|
| **Webhook — Document Uploaded** | `webhook` | `POST /webhook/document-uploaded` | `{trade_id, document_url, document_type, uploader_org_id}` | Document intake | `public.trade_documents` |
| **HTTP — OCR Extract** | `httpRequest` | `POST {{$env.GLOBEX_API_BASE_URL}}/documents/ocr-extract` | Document metadata | Returns extracted fields (`hs_code`, `quantity_kg`, etc.) or stub | N/A |
| **Postgres — Fetch Trade Record** | `postgres` | SQL `SELECT ... FROM public.trades WHERE id = $1` | `trade_id` | Fetches reference quantity, HS code, and total value | `public.trades` |
| **Code — Compare Fields** | `code` | Consistency evaluator | OCR extract + DB trade record | Evaluates whether extracted fields match trade record within tolerance | N/A |
| **Crypto — SHA-256 Hash** | `crypto` | Compute SHA-256 digest | Document stringified content | Returns hex digest `document_hash` | `public.blockchain_records.document_hash` |
| **Postgres — Save Hash + Verify** | `postgres` | SQL `INSERT INTO public.blockchain_records` + `UPDATE public.trade_documents` | `document_hash`, `trade_id` | Anchors hash and sets `verification_result = 'VERIFIED'` | `public.blockchain_records`, `public.trade_documents.verification_result` |

---

## 4. Section 4: Shipment Polling & Settlement

| n8n Node Name | Node Type | Target Operation | Input Payload | Output / Next Step | Canonical Database Target Table & Column |
|---|---|---|---|---|---|
| **Schedule — Poll Shipments** | `scheduleTrigger` | Cron: Every 6 hours | N/A | Trigger scheduled execution | N/A |
| **Postgres — Active Escrows** | `postgres` | SQL `SELECT ... FROM public.escrow_accounts WHERE status IN ('FUNDED', 'HELD')` | Query parameters | List of active trades with tracking numbers | `public.escrow_accounts`, `public.shipments` |
| **HTTP — Shipment Tracking** | `httpRequest` | `GET {{$env.GLOBEX_TRACKING_API_URL}}/track` | `tracking_number`, `api_key` | Carrier tracking status & milestone events | N/A |
| **Code — Normalize Milestone** | `code` | Status classifier | Raw carrier status | Maps carrier telemetry to `DISPATCHED`, `IN_TRANSIT`, or `RECEIVED` | `public.shipment_events.milestone` |
| **Postgres — Save Milestone** | `postgres` | SQL `INSERT INTO public.shipment_events` | Normalized milestone | Logs audit event for each tracking poll | `public.shipment_events` |
| **IF — Conditions Met?** | `if` | Delivery evaluation | `received === true` | If delivered -> release; Else -> hold | N/A |
| **Postgres — Release Escrow** | `postgres` | SQL `UPDATE public.escrow_accounts SET status = 'RELEASED'` + `UPDATE public.trades SET status = 'COMPLETED'` | `escrow_id` | Releases escrow funds and completes trade | `public.escrow_accounts.status`, `public.trades.status`, `public.audit_log` |

---

## 5. Section 5: Trade Data Ingestion

| n8n Node Name | Node Type | Target Operation | Input Payload | Output / Next Step | Canonical Database Target Table & Column |
|---|---|---|---|---|---|
| **Schedule — Daily Ingest** | `scheduleTrigger` | Cron: Daily at 02:00 UTC | N/A | Triggers data refresh pipeline | N/A |
| **HTTP — UN Comtrade** | `httpRequest` | `GET {{$env.GLOBEX_COMTRADE_API_URL}}` | Monthly trade panel query | Returns latest month trade observations | N/A |
| **HTTP — WITS Trade Data** | `httpRequest` | `GET {{$env.GLOBEX_WITS_API_URL}}` | Annual tariff & indicator query | Returns latest bilateral tariff updates | N/A |
| **Code — Normalize Trade Data** | `code` | Validation & row count aggregator | Comtrade & WITS responses | Validates schema integrity and counts processed rows | N/A |
| **Postgres — Log Ingestion** | `postgres` | SQL `INSERT INTO public.trade_data_ingestion_log` | Audit metadata | Logs ingestion run duration, status, and row counts | `public.trade_data_ingestion_log` |

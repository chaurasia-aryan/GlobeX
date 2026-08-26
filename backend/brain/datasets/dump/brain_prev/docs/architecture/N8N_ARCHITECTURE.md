# n8n Workflow Automation Architecture — GLOBEX AI

n8n serves as the central **Workflow Orchestrator**, coordinating backend transactions between Appwrite, FastAPI AI services, external customs APIs, and the EVM smart contract layer.

```
React UI ───► Appwrite BaaS ───► n8n Webhook Triggers ───► FastAPI / APIs / Blockchain
```

---

## 1. Workflow 1: End-to-End Trade Intelligence Aggregator
- **Trigger**: Webhook `POST /webhook/trade-intelligence`
- **Nodes**:
  1. **Webhook Ingest**: Receive product description, origin, and destination.
  2. **HTTP Request — HS Classification**: Call FastAPI `/predict/hs-code`.
  3. **HTTP Request — Trade Data API**: Fetch real-time UN Comtrade & WTO bilateral flow data.
  4. **HTTP Request — Market Opportunity Model**: Compute destination rankings.
  5. **HTTP Request — Counterparty Matching Model**: Vector similarity search on verified suppliers.
  6. **HTTP Request — Risk & Compliance RAG**: Calculate tariff rates and required certifications.
  7. **Code Node (Aggregation)**: Calculate composite `Trade Score (0–100)`.
  8. **Appwrite Node**: Save structured report to `market_analysis` and `trades` collections.

---

## 2. Workflow 2: Multi-Document OCR & Cross-Verification Pipeline
- **Trigger**: Storage Event `onFileUploaded(bucket: "trade_documents")`
- **Nodes**:
  1. **Document Downloader**: Stream PDF/TIFF from Appwrite Storage.
  2. **OCR & Entity Extraction**: Run LayoutLM/Tesseract for line-item field extraction.
  3. **Cross-Document Reconciliation**: Compare Invoice weight/value against Bill of Lading & Packing List.
  4. **Cryptographic Hasher**: Generate deterministic `SHA-256` digest of raw document and extracted fields.
  5. **Blockchain Anchoring Node**: Call smart contract `registerDocumentHash(bytes32 hash, string docId)`.
  6. **Appwrite Database Update**: Update `document_verifications` collection with verification status and anomaly list.

---

## 3. Workflow 3: Programmable Escrow Lifecycle Manager
- **Trigger**: Webhook `POST /webhook/escrow-event`
- **Nodes**:
  1. **Trade Accepted Trigger**: Generate EVM Escrow Contract instance.
  2. **Deposit Monitor**: Listen for ERC-20 `Transfer` event to escrow address.
  3. **Condition Evaluator**: Poll verification state (Seller Verified, Docs Verified, Shipment Delivered).
  4. **Release / Refund Dispatcher**: Trigger `releasePayment()` on smart contract upon 100% condition fulfillment.

---

## 4. Workflow 4: Multi-Modal Shipment Tracking & IoT Ingestion
- **Trigger**: AIS Vessel / Air Cargo API Webhook or Periodic Polling (every 15 min)
- **Nodes**:
  1. **Telemetry Ingest**: Ingest vessel GPS coordinates, port arrival timestamps, and temperature logs.
  2. **Geofence Validator**: Verify origin port departure and destination port entry.
  3. **Appwrite Realtime Pusher**: Broadcast updated shipment coordinates to active client sessions.

---

## 5. Workflow 5: Scheduled Market & Tariff Data Ingestion
- **Trigger**: Cron Schedule (`0 2 * * *` daily at 02:00 UTC)
- **Nodes**:
  1. **Global Tariff Scraper**: Ingest tariff updates and CEPA rate modifications.
  2. **Normalization Engine**: Map harmonized codes and exchange rates.
  3. **Appwrite Cache Refresh**: Bulk upsert refreshed data into `market_data` collection.

---
STATUS: IMPLEMENTED

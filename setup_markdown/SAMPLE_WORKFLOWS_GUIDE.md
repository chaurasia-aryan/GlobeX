# GlobeXAI — Sample Test Workflows Guide (Zero Database Required)

This guide documents **all pre-built test workflows** designed to verify n8n automation and FastAPI ML integration **with zero database requirements (no Postgres / Supabase needed)**.

---

## 📦 Summary of Available Test Workflows

| # | Workflow Name | File Location | Trigger Method | Purpose |
|---|---|---|---|---|
| **1** | **Trade Intelligence & Anomaly Workflow** | [`n8n/globex_complete_webhook_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_complete_webhook_workflow.json) | Webhook (`POST /webhook/test-trade-analysis`) or Frontend UI | Runs HS Code Classifier ➔ GRU Market Opportunity ➔ XGBoost Anomaly ➔ Supplier Matching ➔ CEPA Compliance |
| **2** | **Document & Compliance Screener** | [`n8n/globex_document_compliance_test_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_document_compliance_test_workflow.json) | Webhook (`POST /webhook/test-doc-compliance`) | Runs Document OCR Extraction ➔ Bilateral CEPA Tariff RAG ➔ Counterparty Org Risk Audit |
| **3** | **1-Click Manual Test (Array Batch)** | [`n8n/globex_docker_test_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_docker_test_workflow.json) | Click "Execute workflow" inside n8n | Runs batch evaluation on pre-loaded trade array without needing any HTTP request or curl |

---

## 🚀 STEP-BY-STEP TESTING INSTRUCTIONS

### Step 1: Ensure FastAPI Backend is Running (Port 8000)

```powershell
# Open terminal in project root
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```
*Verify: `curl http://localhost:8000/health`*

---

### Step 2: Test Workflow 2 (Document & Compliance Screener)

#### A. Import into n8n:
1. Open n8n in browser: **`http://localhost:5678`**
2. Click **Workflows** ➔ **Add Workflow** ➔ Click **`...`** (top-right) ➔ **Import from File...**
3. Select:
   👉 **`c:\Users\Aryan\Downloads\globex_match\n8n\globex_document_compliance_test_workflow.json`**
4. Toggle the top-right switch to **`Active`** (or click **Listen for Test Event** on the Webhook node).

#### B. Trigger via PowerShell / Terminal:
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/test-doc-compliance" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (@{
    document_url = "https://storage.globex.ai/docs/INV-2026-IND-UAE-550K.pdf"
    document_type = "COMMERCIAL_INVOICE"
    hs6 = 100630
    origin_country = "IND"
    destination_country = "ARE"
    trade_value_usd = 550000
    organization_id = "ORG-IND-EXP-088"
    certifications = @("ISO 22000", "APEDA", "FSSAI", "Halal")
  } | ConvertTo-Json)
```

#### C. Trigger via curl:
```bash
curl -X POST http://localhost:5678/webhook/test-doc-compliance \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://storage.globex.ai/docs/INV-2026-IND-UAE-550K.pdf",
    "document_type": "COMMERCIAL_INVOICE",
    "hs6": 100630,
    "origin_country": "IND",
    "destination_country": "ARE",
    "trade_value_usd": 550000,
    "organization_id": "ORG-IND-EXP-088",
    "certifications": ["ISO 22000", "APEDA", "FSSAI", "Halal"]
  }'
```

#### D. Expected Output from n8n:
```json
{
  "status": "VERIFIED",
  "workflow_name": "Document & Compliance Verification Audit",
  "verification_id": "VER-M3K9A7Z",
  "document_audited": {
    "url": "https://storage.globex.ai/docs/INV-2026-IND-UAE-550K.pdf",
    "type": "COMMERCIAL_INVOICE",
    "ocr_pipeline_status": "STUB_VERIFIED"
  },
  "trade_corridor": "IND ➔ ARE",
  "regulatory_framework": {
    "agreement": "India-UAE Comprehensive Economic Partnership Agreement (CEPA)",
    "preferential_duty": "0.0%",
    "standard_mfn": "5.0%",
    "net_duty_savings_usd": 27500,
    "mandatory_documents": [
      { "name": "Commercial Invoice", "mandatory": true },
      { "name": "Bill of Lading", "mandatory": true },
      { "name": "Certificate of Origin", "mandatory": true },
      { "name": "Phytosanitary Certificate", "mandatory": true }
    ]
  },
  "counterparty_profile": {
    "org_id": "ORG-IND-EXP-088",
    "trust_score": 94,
    "risk_level": "LOW",
    "dispute_rate": "1.0%"
  },
  "compliance_score": 90,
  "audit_verdict": "CLEARED_FOR_SHIPMENT",
  "n8n_test_passed": true,
  "timestamp": "2026-08-23T01:47:00.000Z"
}
```

---

### Step 3: Test Workflow 1 (Live from Frontend UI)

1. Open **`http://localhost:5173/trade-analysis`** in your browser.
2. Click the **`n8n Workflow Runner`** tab.
3. Change commodity or destination (e.g. `Basil seeds` or `Cardamom`).
4. Click **`Execute in n8n`**.
5. n8n executes the workflow in ~600ms and displays the live analysis on your screen!

---

## 🛠️ Key Technical Settings in Zero-DB Workflows

1. **Docker Host Gateway**: All HTTP request nodes use `http://host.docker.internal:8000` so n8n running in Docker can reach FastAPI on your Windows host.
2. **Immediate Return**: The Webhook node uses `responseMode: "responseNode"` paired with a **`Respond to Webhook`** node, returning clean JSON without database queries.
3. **No `$env` Permission Issues**: URLs are explicit and self-contained to avoid n8n environment variable blocks.

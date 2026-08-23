# GlobeXAI — n8n Zero-DB Testing & Setup Guide

This guide gives you the exact step-by-step instructions to run and test n8n with GlobeXAI **without needing any database (no Postgres, no Supabase required)**.

---

## 📁 Workflow File for Testing

The zero-DB test workflow is located at:
👉 **[`n8n/globex_standalone_test_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_standalone_test_workflow.json)**

### What This Test Workflow Does:
1. **Webhook Intake** (`POST /webhook-test/test-trade-analysis` or `POST /webhook/test-trade-analysis`)
2. **Normalizes Inputs** (Commodity, quantity, corridor, target price)
3. **Calls FastAPI HS Classifier** (`POST http://localhost:8000/predict/hs-code`)
4. **Calls FastAPI Partner Discovery** (`POST http://localhost:8000/predict/market-opportunity`)
5. **Calls FastAPI Trade Anomaly XGBoost** (`POST http://localhost:8000/api/trade-anomaly/predict`)
6. **Calls FastAPI Counterparty Match** (`POST http://localhost:8000/predict/counterparty-match`)
7. **Calls FastAPI Regulatory Compliance** (`POST http://localhost:8000/compliance/rag-analyze`)
8. **Synthesizes & Aggregates All Scores** in JavaScript
9. **Returns Full JSON Output Directly** (Zero DB insert needed)

---

## 🚀 Step-by-Step Instructions to Run and Test

### STEP 1: Start the FastAPI Backend (Port 8000)

Open a terminal at the project root (`c:\Users\Aryan\Downloads\globex_match`):

```powershell
# PowerShell / Windows Command
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### ✅ Verify Backend is Running:
Open your browser or run:
```powershell
curl http://localhost:8000/health
```
You should see:
```json
{
  "status": "HEALTHY",
  "subsystems": {
    "trade_anomaly_model": "LOADED",
    "partner_discovery_data": "AVAILABLE",
    "hs_classifier": "ACTIVE",
    "compliance_engine": "ACTIVE",
    "counterparty_engine": "ACTIVE"
  }
}
```

---

### STEP 2: Start n8n

You have two options to run n8n:

#### Option A: Run via Docker (Recommended)
```bash
docker run -it --rm --name n8n -p 5678:5678 -e WEBHOOK_URL=http://localhost:5678/ docker.n8n.io/n8nio/n8n
```

> **Note for Docker on Windows/Mac**: If n8n runs inside Docker and needs to talk to FastAPI on your host machine, set environment variable `-e GLOBEX_API_BASE_URL=http://host.docker.internal:8000` or use `http://localhost:8000` if using host network.

#### Option B: Run via npm / npx (Zero Docker)
```bash
npx n8n
```
n8n will start and open at: **`http://localhost:5678`**

---

### STEP 3: Import the Test Workflow into n8n

1. Open **`http://localhost:5678`** in your browser.
2. Click on **Workflows** in the left sidebar ➔ Click **Add Workflow** (or the **`+`** icon).
3. Click the **`...`** (three dots menu) at the top-right corner of the canvas.
4. Select **Import from File...**
5. Select the file:
   `c:\Users\Aryan\Downloads\globex_match\n8n\globex_standalone_test_workflow.json`
6. You will see all 10 connected nodes appear on the canvas!
7. Click the **Save** button (top right).

---

### STEP 4: Test the Workflow in n8n (Two Methods)

#### Method 1: Interactive Test via "Test Workflow" Button (Easiest)

1. Double-click the **`Webhook — Test Intake`** node.
2. Click **Listen for Test Event** (or click the big orange **Test step** / **Test workflow** button).
3. Open a new terminal and send a sample test payload:

```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/test-trade-analysis" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body (@{
    product = "Basmati Rice"
    origin_country = "IND"
    destination_country = "ARE"
    quantity_kg = 50000
    target_price_usd = 1100
  } | ConvertTo-Json)
```

#### Method 2: Test via curl
```bash
curl -X POST http://localhost:5678/webhook-test/test-trade-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Basmati Rice",
    "origin_country": "IND",
    "destination_country": "ARE",
    "quantity_kg": 50000,
    "target_price_usd": 1100
  }'
```

#### Method 3: Active Production Webhook Mode
1. In n8n, toggle the workflow switch at the top-right from **Inactive** to **Active**.
2. Change the URL in your curl / Postman request from `/webhook-test/` to `/webhook/`:
```bash
curl -X POST http://localhost:5678/webhook/test-trade-analysis \
  -H "Content-Type: application/json" \
  -d '{"product": "Basmati Rice", "origin_country": "IND", "destination_country": "ARE", "quantity_kg": 50000}'
```

---

### STEP 5: Expected Output JSON

When the test succeeds, n8n will immediately return a complete JSON response synthesizing all ML model outputs:

```json
{
  "status": "SUCCESS",
  "message": "n8n test workflow executed successfully with zero database dependency!",
  "trade_corridor": "IND -> ARE",
  "commodity": "Basmati Rice",
  "hs_classification": {
    "hs6": 100630,
    "formatted": "1006.30",
    "description": "Semi-milled or wholly milled rice, whether or not polished or glazed (Basmati Rice)",
    "confidence": 0.8
  },
  "market_opportunity": {
    "destination": "ARE",
    "rank": 1,
    "score": 94.2,
    "top_destinations": [
      {
        "importer_iso3": "ARE",
        "importer_country_name": "United Arab Emirates",
        "final_score": 94.2,
        "destination_applied_tariff_rate": 0.0,
        "rta_name": "India-UAE CEPA"
      }
    ]
  },
  "trade_anomaly": {
    "score": 0.18,
    "risk_level": "LOW",
    "anomaly_type": "NORMAL",
    "signals": []
  },
  "counterparty_intelligence": {
    "top_exporter": "Arvind Global Agro Exports Ltd",
    "match_score": 96,
    "counterparty_pool_count": 5
  },
  "compliance_and_tariffs": {
    "trade_agreement": "India-UAE Comprehensive Economic Partnership Agreement (CEPA)",
    "preferential_duty": "0.0%",
    "standard_mfn_duty": "5.0%",
    "mandatory_documents": [
      { "name": "Commercial Invoice", "mandatory": true },
      { "name": "Bill of Lading", "mandatory": true },
      { "name": "Certificate of Origin", "mandatory": true },
      { "name": "Phytosanitary Certificate", "mandatory": true }
    ]
  },
  "overall_trade_score": 92,
  "recommendation": "PROCEED",
  "n8n_test_passed": true,
  "tested_at": "2026-08-23T01:25:00.000Z"
}
```

---

## 🛠️ Troubleshooting & Debugging

| Issue | Cause | Fix |
|---|---|---|
| `access to env vars denied [item 0]` | n8n blocks `$env` access inside expressions by default for security | We have removed `$env` from the workflows and replaced them with direct `http://localhost:8000` URLs. Re-import [`n8n/globex_manual_test_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_manual_test_workflow.json) or [`n8n/globex_standalone_test_workflow.json`](file:///c:/Users/Aryan/Downloads/globex_match/n8n/globex_standalone_test_workflow.json). Alternatively, start n8n with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`. |
| `Connection refused on http://localhost:8000` | FastAPI server is not running | Run `.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000` |
| `Docker n8n cannot reach localhost:8000` | Docker localhost resolves inside container | In Docker on Windows/Mac, change node URLs from `localhost:8000` to `host.docker.internal:8000`. |
| `Webhook test timed out / 404` | n8n "Listen for Test Event" was not clicked | In n8n UI, open the Webhook node and click **Listen for Test Event** before sending the curl/PowerShell request, or toggle the workflow to **Active** and use `/webhook/test-trade-analysis`. |
| `422 Unprocessable Entity` | Empty or malformed body | Send valid JSON with at least `{"product": "Basmati Rice"}` |

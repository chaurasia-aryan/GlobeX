# GlobeXAI Trade OS — Complete App Run, Environment & n8n Setup Guide

This guide gives you the definitive setup instructions for GlobeXAI Trade OS: environment variables, backend startup, frontend configuration, database migrations, and n8n workflow engine setup.

---

## 1. Environment Variables Reference Guide

### File Locations
- **`.env`** *(Project root)*: Your active local configuration file. **Never committed to git** (protected by `.gitignore`).
- **`.env.local.example`** *(Project root)*: Template file containing all available variables and placeholder descriptions. Safe for git.

### Environment Variable Matrix

| Variable Name | Required | Default Value | Used By | Description |
|---|---|---|---|---|
| `PORT` | Optional | `8000` | Backend | Port on which the FastAPI server listens. |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Backend | Allowed CORS origin for the React frontend. |
| `VITE_FASTAPI_AI_URL` | Required | `http://localhost:8000` | Frontend | Base URL of the FastAPI backend microservices. |
| `VITE_N8N_WEBHOOK_URL` | Optional | `http://localhost:5678/webhook` | Frontend | Base URL for triggering active n8n automation webhooks. |
| `SUPABASE_URL` | Optional | *Supabase Project URL* | Backend & n8n | PostgreSQL/Supabase database endpoint. |
| `SUPABASE_ANON_KEY` / `SUPABASE_KEY` | Optional | *Anon JWT Key* | Backend | Client key for Supabase API data access. |
| `SUPABASE_SECRET_KEY` | Optional | *Secret Key* | Backend | Admin service role key for bypassing RLS rules during data loading. |
| `VITE_SUPABASE_URL` | Optional | *Supabase Project URL* | Frontend | Client-side database endpoint. |
| `VITE_SUPABASE_ANON_KEY` | Optional | *Anon JWT Key* | Frontend | Client-side database anon key. |
| `OPENSANCTIONS_API_KEY` | Optional | *API Key* | Backend | Key for live OpenSanctions compliance screening. |
| `VITE_OCR_SERVICE_URL` | Optional | `http://localhost:8000/documents/ocr-extract` | Frontend | Document OCR extraction service endpoint. |

> [!NOTE]
> **Zero-Dependency Fallback**: If `SUPABASE_URL` or `SUPABASE_KEY` are not set, both the backend and frontend automatically switch to in-memory seed models and deterministic mock data.

---

## 2. Running the FastAPI Backend

### Step 1: Initialize Virtual Environment
Navigate to the root directory (`globex_match`):
```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Launch FastAPI Server
```bash
# Standard launch on Port 8000
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*If Port 8000 is occupied by another process on your machine, launch on Port 8001:*
```bash
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Step 4: Verify Backend Status
- **Swagger Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **System Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 3. Running the React Frontend

### Step 1: Install Node Dependencies
From the root directory:
```bash
npm install
```

### Step 2: Configure Environment (If Backend port changed)
If your backend is running on port `8001`, update `.env`:
```env
VITE_FASTAPI_AI_URL=http://localhost:8001
```

### Step 3: Launch Frontend Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 4. PostgreSQL Database Setup

1. Open your PostgreSQL client (pgAdmin, DBeaver, `psql`) or Supabase SQL Editor.
2. Run the SQL setup script located at:
   ```
   n8n/supabase_schema_setup.sql
   ```
3. This creates all 8 core tables:
   `public.organizations`, `public.trust_scores`, `public.trade_analysis`, `public.trades`, `public.escrow_accounts`, `public.blockchain_records`, `public.trade_documents`, `public.shipments`.

---

## 5. Setting Up n8n Automation Engine

### Step 1: Install and Launch n8n
```bash
npx n8n start
```
n8n will start at **[http://localhost:5678](http://localhost:5678)**.

### Step 2: Add Postgres Credentials in n8n
1. Open n8n -> **Credentials** -> **New Credential** -> search for **Postgres**.
2. Set the Credential Name to: `GlobeX PostgreSQL / Supabase`.
3. Input connection details:
   - **Host**: `localhost` (or `db.xxxx.supabase.co`)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your database password
   - **Port**: `5432` (or `6543` for connection pooling)
   - **SSL**: `allow` or `require`

### Step 3: Import the Master Workflow
1. In n8n, go to **Workflows** -> **Import from File...**
2. Select the master workflow file:
   ```
   n8n/globex_complete_postgres_master_workflow.json
   ```
3. Toggle the workflow status to **Active** (top-right corner).

---

## 6. Testing the Complete Pipeline via cURL

### Test 1: AI Trade Analysis Pipeline
```bash
curl -X POST "http://localhost:5678/webhook/test-trade-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Basmati Rice",
    "origin_country": "IND",
    "destination_country": "ARE",
    "quantity_kg": 50000,
    "target_price_usd": 1100,
    "trade_flow": "Export",
    "regime": "balanced",
    "top_n": 5
  }'
```

### Test 2: Document Verification & Blockchain Anchor
```bash
curl -X POST "http://localhost:5678/webhook/document-uploaded" \
  -H "Content-Type: application/json" \
  -d '{
    "trade_id": "TRD-IND-ARE-550K",
    "document_name": "Bill_of_Lading.pdf",
    "document_type": "BILL_OF_LADING",
    "hs6": 100630,
    "origin_country": "IND",
    "destination_country": "ARE"
  }'
```

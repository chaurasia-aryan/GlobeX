# GlobeXAI Trade OS — App Run & Setup Guide

This guide describes how to set up and run the complete GlobeXAI Trade OS application (Frontend, FastAPI Backend, PostgreSQL Database, and n8n Master Workflow) on your local machine.

---

## 1. System Requirements & Prerequisites

Make sure you have the following installed:
- **Node.js** (v18.x or higher) & **npm** (v9.x or higher)
- **Python** (v3.10.x to v3.12.x) & **pip**
- **PostgreSQL** (v14+ locally) OR a free [Supabase](https://supabase.com) project
- **n8n** (v1.x+ via `npx n8n` or Docker)

---

## 2. PostgreSQL Database Setup

The database stores organizations, trust scores, AI trade analysis logs, contracts, escrow accounts, blockchain anchors, and maritime shipments.

### Step 1: Initialize Database Schema
1. Open your PostgreSQL client (pgAdmin, DBeaver, `psql`) or Supabase SQL Editor.
2. Open and execute the SQL migration script located at:
   ```
   n8n/supabase_schema_setup.sql
   ```
3. This creates all 8 required tables:
   - `public.organizations`
   - `public.trust_scores`
   - `public.trade_analysis`
   - `public.trades`
   - `public.escrow_accounts`
   - `public.blockchain_records`
   - `public.trade_documents`
   - `public.shipments`
4. The script also automatically seeds verified default organizations (e.g., *Acme Exports Ltd*, *Al-Hamad Global Foods Trading LLC*).

---

## 3. Backend Setup (FastAPI Gateway)

The FastAPI server hosts all ML models (GRU Forecaster, XGBoost Anomaly, Isolation Forest Risk, CEPA Tariff Engine).

### Step 1: Create and Activate Virtual Environment
From the project root directory:
```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\activate

# Mac / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create or verify `.env` in the root directory:
```env
PORT=8000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```
*(Note: If Supabase keys are omitted, the backend will gracefully use in-memory seed models).*

### Step 4: Start FastAPI Server
```bash
# Direct startup via Uvicorn
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*If port 8000 is occupied, use port 8001:*
```bash
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Step 5: Verify Backend Health
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Swagger Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Frontend Setup (React / Vite)

### Step 1: Install Node Dependencies
From the project root directory:
```bash
npm install
```

### Step 2: Configure Environment (If Backend port changed)
If the backend is running on port `8001`, update your `.env` or set:
```env
VITE_FASTAPI_AI_URL=http://localhost:8001
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. n8n Automation Engine & PostgreSQL Integration

The n8n workflow connects the frontend actions to FastAPI models and writes results directly to PostgreSQL.

### Step 1: Start n8n
```bash
npx n8n start
```
Open n8n in your browser at [http://localhost:5678](http://localhost:5678).

### Step 2: Set Up PostgreSQL Credentials in n8n
1. In n8n, navigate to **Credentials** -> **New Credential** -> **Postgres**.
2. Name the credential: `GlobeX PostgreSQL / Supabase`.
3. Fill in your database connection parameters:
   - **Host**: `localhost` (or `db.xxxx.supabase.co` for Supabase)
   - **Database**: `postgres`
   - **User**: `postgres` (or `postgres.xxxx`)
   - **Password**: Your database password
   - **Port**: `5432` (or `6543` for connection pooling)
   - **SSL**: `allow` or `require` (for Supabase)

### Step 3: Import the Master Workflow
1. In n8n, go to **Workflows** -> **Add Workflow** -> **Import from File...**
2. Select the workflow file:
   ```
   n8n/globex_complete_postgres_master_workflow.json
   ```
3. Toggle the workflow to **Active** (in the top-right corner).

---

## 6. Testing the End-to-End Pipeline

### Test 1: AI Trade Analysis Pipeline (Webhook + ML + PostgreSQL)
Run the following cURL command in your terminal:
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
**Expected Output:**
- Returns complete JSON with HS Code (`1006.30`), Market Opportunity Score, XGBoost Anomaly Score, Counterparty Matches, and CEPA Tariff Savings.
- Writes a new record directly into `public.trade_analysis` in PostgreSQL.

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
**Expected Output:**
- Returns verification status (`VERIFIED`).
- Inserts document hash into `public.trade_documents` and `public.blockchain_records`.

### Test 3: Frontend Live Execution
1. Navigate to **Trade Analysis Page** (`http://localhost:5173/analysis`).
2. Click the **Run AI Trade Intelligence** button.
3. The UI will trigger n8n, play the notification jingle, and display results from all 5 ML models and PostgreSQL database.

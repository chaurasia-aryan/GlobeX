# GlobeXAI Trade OS — Cross-Border B2B Trade Automation

Welcome to **GlobeXAI**, an enterprise-grade cross-border B2B trade intelligence and automation operating system. GlobeXAI combines interactive 3D WebGL cartography (`TradeGlobe`), PyTorch & XGBoost ML forecasting/anomaly models, programmable stablecoin escrow vaults, and automated document compliance checking.

---

## 📂 Documentation Hub (`setup_markdown/`)

Detailed guides are located in the [setup_markdown/](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/) folder:

1. **[System Workflow Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/understanding_workflow.md)**: Explains the B2B user journey, architecture layer, and database schema.
2. **[App Run & Setup Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/how_to_run.md)**: Complete step-by-step instructions for running the app, configuring environment variables, setting up PostgreSQL, and running n8n.
3. **[ML Models & API Endpoints Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/model_endpoints.md)**: Complete schemas and details on how to reuse models elsewhere (dynamic pricing, KYB, alerts).
4. **[n8n & PostgreSQL Workflow Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/n8n_postgres_workflow.md)**: Specifications for all 5 n8n pipelines, SQL nodes, and webhook endpoints.

---

## ⚙️ Environment Variables Reference Guide

### Locations
- **`.env`** *(Project Root)*: Local configuration file containing active credentials. Gitignored.
- **`.env.local.example`** *(Project Root)*: Template file containing placeholders for all supported variables. Safe for git.

### Environment Variable Matrix

| Variable Name | Required | Default Value | Used By | Description |
|---|---|---|---|---|
| `PORT` | Optional | `8000` | Backend | Port on which the FastAPI server listens. |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Backend | Allowed CORS origin for the React frontend. |
| `VITE_FASTAPI_AI_URL` | Required | `http://localhost:8000` | Frontend | Base URL of the FastAPI backend microservices. |
| `VITE_N8N_WEBHOOK_URL` | Optional | `http://localhost:5678/webhook` | Frontend | Base URL for triggering active n8n automation webhooks. |
| `SUPABASE_URL` | Optional | *Supabase Project URL* | Backend & n8n | PostgreSQL/Supabase database endpoint. |
| `SUPABASE_ANON_KEY` / `SUPABASE_KEY` | Optional | *Anon JWT Key* | Backend | Client key for Supabase API data access. |
| `SUPABASE_SECRET_KEY` | Optional | *Secret Key* | Backend | Admin service role key for bypassing RLS rules. |
| `VITE_SUPABASE_URL` | Optional | *Supabase Project URL* | Frontend | Client-side database endpoint. |
| `VITE_SUPABASE_ANON_KEY` | Optional | *Anon JWT Key* | Frontend | Client-side database anon key. |
| `OPENSANCTIONS_API_KEY` | Optional | *API Key* | Backend | Key for live OpenSanctions compliance screening. |
| `VITE_OCR_SERVICE_URL` | Optional | `http://localhost:8000/documents/ocr-extract` | Frontend | Document OCR extraction service endpoint. |

> [!NOTE]
> **Zero-Dependency Fallback**: If database keys are omitted, the system automatically uses in-memory seed data.

---

## 🚀 How to Run the Application

### 1. PostgreSQL Database Setup
Execute `n8n/supabase_schema_setup.sql` in your PostgreSQL client or Supabase SQL Editor to create all 8 tables and seed initial trading entities.

### 2. FastAPI AI Backend Setup
```bash
# Initialize virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. React Frontend Setup
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ⚡ Setting Up the n8n Automation Engine

1. **Launch n8n**:
   ```bash
   npx n8n start
   ```
   Open **[http://localhost:5678](http://localhost:5678)**.
2. **Add Credentials**: Go to **Credentials** -> **New Credential** -> **Postgres**. Name it `GlobeX PostgreSQL / Supabase` and fill in host, database, user, password, and port.
3. **Import Workflow**: Import `n8n/globex_complete_postgres_master_workflow.json` into n8n.
4. **Activate**: Toggle the workflow to **Active**.

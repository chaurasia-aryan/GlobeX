# GlobeXAI Trade OS — Cross-Border B2B Trade Automation

Welcome to **GlobeXAI**, an enterprise-grade cross-border B2B trade intelligence and automation operating system. GlobeXAI combines interactive 3D WebGL cartography (`TradeGlobe`), PyTorch & XGBoost ML forecasting/anomaly models, programmable stablecoin escrow vaults, and automated document compliance checking.

---

## 📂 Documentation Hub (`setup_markdown/`)

We have created a dedicated set of step-by-step guides in the [setup_markdown/](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/) folder to help you understand the entire architecture, run the application, and repurpose the machine learning models:

1. **[System Workflow Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/understanding_workflow.md)**:
   - Read this first to understand the B2B user journey (from KYB onboarding to customs release).
   - Learn the Decoupled System Architecture (React frontend, FastAPI gateway, n8n orchestrator, and PostgreSQL database).
   - Explore the core database schema.

2. **[App Run & Setup Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/how_to_run.md)**:
   - Detailed instructions for setting up the virtual environment, installing dependencies, and running the FastAPI backend.
   - Setup instructions for running the Vite dev server and configuring alternate ports (e.g. port `8001` if `8000` is blocked).
   - Database migration execution and sample data seeding steps.
   - Verification procedures using cURL test commands.

3. **[ML Models & API Endpoints Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/model_endpoints.md)**:
   - Detailed specifications of all ML services (Dual-Head GRU Forecaster, XGBoost Anomaly Classifier, Isolation Forest Risk model, and CEPA Tariff Rules Engine).
   - Complete request/response JSON schemas.
   - Code snippets and architectural guidance on how to reuse and integrate these models elsewhere (e.g. for dynamic marketplace pricing, KYB onboarding blocklists, or active workspace warning alerts).

4. **[n8n & PostgreSQL Workflow Guide](file:///c:/Users/Aryan/Downloads/globex_match/setup_markdown/n8n_postgres_workflow.md)**:
   - Explanation of the complete n8n master workflow (`n8n/globex_complete_postgres_master_workflow.json`) comprising 5 active pipelines.
   - PostgreSQL schema mappings, SQL queries, and trigger configurations.
   - Step-by-step connection steps for local PostgreSQL or cloud Supabase instances.

---

## ⚡ Quick Start Checklist

### 1. Database Migrations
Run the SQL script in your PostgreSQL or Supabase SQL Editor:
```
n8n/supabase_schema_setup.sql
```

### 2. Run FastAPI Backend
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

### 3. Run Vite Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run n8n Webhook Workflow
Start n8n, import `n8n/globex_complete_postgres_master_workflow.json`, configure your Postgres credentials, and activate the workflow.

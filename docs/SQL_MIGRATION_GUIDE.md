# GlobeXAI — SQL Integration & Migration Guide

> **NOTE FOR AI AGENTS & ENGINEERS:**  
> Read this document whenever you are ready to introduce PostgreSQL or Supabase into the GlobeXAI stack. It details the exact schemas, tables, queries, and n8n node swap instructions required to move from in-memory zero-SQL operation to persistent relational storage.

---

## 1. PostgreSQL / Supabase Relational Schema (DDL)

The complete SQL migration script is pre-built at:  
👉 [`backend/database/supabase/migrations/20260823000000_n8n_integration_tables.sql`](file:///c:/Users/Aryan/Downloads/globex_match/backend/database/supabase/migrations/20260823000000_n8n_integration_tables.sql)

### Core Relational Tables:

```sql
-- 1. AI Trade Analysis Persistence
CREATE TABLE IF NOT EXISTS public.trade_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(64) NOT NULL,
    commodity VARCHAR(255) NOT NULL,
    hs6 INTEGER NOT NULL,
    origin_country VARCHAR(3) NOT NULL,
    destination_country VARCHAR(3) NOT NULL,
    quantity_kg NUMERIC(15, 2) NOT NULL,
    target_price_usd NUMERIC(15, 2),
    overall_score NUMERIC(5, 2) NOT NULL,
    recommendation VARCHAR(32) NOT NULL,
    market_opportunity_score NUMERIC(5, 2),
    anomaly_score NUMERIC(6, 4),
    anomaly_risk_level VARCHAR(32),
    compliance_score NUMERIC(5, 2),
    tariff_preferential_rate NUMERIC(5, 2),
    duty_savings_usd NUMERIC(15, 2),
    top_exporter_id VARCHAR(64),
    top_exporter_name VARCHAR(255),
    raw_synthesis_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Escrow & Smart Contract Accounts
CREATE TABLE IF NOT EXISTS public.escrow_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(64) NOT NULL,
    vault_address VARCHAR(42) NOT NULL,
    collateral_token VARCHAR(10) DEFAULT 'USDC',
    collateral_amount_usd NUMERIC(15, 2) NOT NULL,
    funded_status VARCHAR(32) DEFAULT 'PENDING_DEPOSIT',
    multi_sig_quorum INTEGER DEFAULT 2,
    settlement_condition VARCHAR(128) DEFAULT 'SGS_INSPECTION_PASSED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- 3. Document Verification Log
CREATE TABLE IF NOT EXISTS public.trade_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(64) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    document_url TEXT NOT NULL,
    ocr_status VARCHAR(32) DEFAULT 'VERIFIED',
    verification_hash VARCHAR(66),
    compliance_cleared BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Blockchain Ledger Audit Records
CREATE TABLE IF NOT EXISTS public.blockchain_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    network VARCHAR(32) DEFAULT 'Polygon',
    raw_event JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Step-by-Step Instructions to Activate SQL

### Step 1: Run the Database Migration
When your PostgreSQL / Supabase database is online, run:
```bash
# Via Supabase CLI
npx supabase db push

# OR Via psql directly
psql "postgres://postgres:password@localhost:5432/globex" -f backend/database/supabase/migrations/20260823000000_n8n_integration_tables.sql
```

### Step 2: Configure Environment Variables in `.env`
Add your database credentials to `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key
DATABASE_URL=postgres://postgres:password@localhost:5432/globex
```

### Step 3: Swap n8n In-Memory Nodes with Postgres Nodes
In `n8n/globex_master_automation.workflow.json`:
1. In **Trigger 1 (Trade Analysis)**:
   - Between `Code — Synthesize All Models` and `Respond — Trade Analysis JSON`, add a **`PostgreSQL`** node.
   - Action: `Insert`
   - Table: `trade_analysis`
   - Data Mapping: `$json.trade_record` & `$json.hs_classification` etc.
2. In **Trigger 4 (Trade Creation & Escrow)**:
   - Between `Code — Initiate Escrow Vault` and `Respond — Trade & Escrow JSON`, add a **`PostgreSQL`** node.
   - Action: `Insert`
   - Table: `escrow_accounts`
3. In **Trigger 2 (Document Verification)**:
   - Add a **`PostgreSQL`** node to insert into `trade_documents`.

---

## 3. Current Architecture (Zero-SQL In-Memory Mode)

Until you run the steps above:
- FastAPI backend operates 100% in-memory with deterministic fallbacks for counterparty and document storage.
- n8n workflows generate and return rich, SQL-compatible JSON structures directly to the caller via `Respond to Webhook` nodes.
- Frontend renders all real-time ML forecasts, XGBoost anomaly evaluations, CEPA tariff calculations, and buyer match lists without throwing any database connection errors.

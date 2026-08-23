# GlobeXAI Integration Execution Plan

## Objective

Integrate the existing GlobeXAI frontend, backend, ML models, PostgreSQL schema, Trade Anomaly system, ranking layer, and supplied n8n workflow into one working end-to-end application.

Reference files:

- `GlobeXAI — Cross-Border B2B Trade Automation(1).json`
- `GLOBEX_FINAL_ER_DIAGRAM(1) (1).png`
- Existing Trade Anomaly baseline EDA notebook
- Existing model artifacts and repository code

---

## Phase 0 — Preserve Existing Work

- [ ] Locate the existing Trade Anomaly baseline notebook.
- [ ] Treat it as read-only baseline.
- [ ] Do not overwrite its cells or results.
- [ ] Create separate notebooks for any additional EDA/model validation.
- [ ] Back up the current n8n workflow before modifying it.
- [ ] Record current frontend/backend/model versions and routes.

Deliverable:
- `docs/integration_baseline_inventory.md`

---

## Phase 1 — Repository Audit

- [ ] Identify frontend framework.
- [ ] Identify backend framework.
- [ ] Identify database/migrations.
- [ ] Identify authentication.
- [ ] Locate all ML models.
- [ ] Locate preprocessing artifacts.
- [ ] Locate model serving code.
- [ ] Locate Trade Anomaly model.
- [ ] Locate ranking model.
- [ ] Locate HS classifier.
- [ ] Locate counterparty matching.
- [ ] Locate counterparty risk.
- [ ] Locate compliance/RAG.
- [ ] Locate existing n8n configuration.
- [ ] Identify current environment variables.
- [ ] Identify actual service ports.

Deliverable:
- component inventory with actual paths/endpoints.

---

## Phase 2 — Schema Reconciliation

Compare the ER diagram against the actual database implementation.

Core entities shown in the ER reference include:

- users
- organizations
- organization_members
- listings
- trades
- trade_offers
- trust_scores
- shipments
- delivery_confirmations
- disputes
- blockchain_records
- escrow_accounts
- verification_documents
- verification_reviews
- notifications
- audit_log

Inspect whether the n8n workflow's following tables exist:

- `trade_analysis`
- `counterparties`
- `escrow_contracts`
- `document_verifications`
- `blockchain_events`
- `shipment_events`
- `trade_data_ingest`

Tasks:

- [ ] Map each n8n entity to the canonical database entity.
- [ ] Reuse existing tables where appropriate.
- [ ] Create migrations only where required.
- [ ] Add foreign keys.
- [ ] Add indexes for analysis/trade lookups.
- [ ] Ensure organization isolation.
- [ ] Document every schema discrepancy.

Deliverable:
- `docs/schema_n8n_mapping.md`

---

## Phase 3 — Model Inventory

For every model determine:

- [ ] model name
- [ ] training notebook/script
- [ ] artifact path
- [ ] preprocessing artifact
- [ ] feature order
- [ ] input schema
- [ ] output schema
- [ ] model version
- [ ] current endpoint
- [ ] latency
- [ ] dependencies

Required model/service inventory:

- [ ] HS classifier
- [ ] Trade anomaly
- [ ] Market opportunity/ranking
- [ ] Counterparty matching
- [ ] Counterparty risk
- [ ] Compliance/RAG

Do not create duplicate endpoints if equivalent endpoints already exist.

---

## Phase 4 — Trade Anomaly Production Inference

- [ ] Verify final selected anomaly model.
- [ ] Verify it was evaluated using time-aware validation.
- [ ] Verify preprocessing matches training.
- [ ] Verify no target leakage.
- [ ] Verify model artifact loads without retraining.
- [ ] Add/confirm production inference endpoint.
- [ ] Add Pydantic/input validation.
- [ ] Add structured output.
- [ ] Add model version.
- [ ] Add health endpoint.
- [ ] Add error handling.

Recommended endpoint:

`POST /predict/trade-anomaly`

Required logical input:

- HS6
- origin
- destination
- trade flow
- quantity
- value/price
- reference date
- required historical identifiers/context

Required logical output:

- anomaly score
- anomaly flag
- risk level
- anomaly type if supported
- baseline/historical context
- explanation/reasons
- model version

Do not require the frontend to manually provide rolling statistics or ML-specific engineered features.

---

## Phase 5 — Historical Trade Data

- [ ] Verify current Comtrade ingestion.
- [ ] Verify current WITS ingestion.
- [ ] Resolve country-code mappings.
- [ ] Resolve HS6 mapping.
- [ ] Normalize units.
- [ ] Normalize import/export direction.
- [ ] Deduplicate.
- [ ] Add ingestion timestamp/source.
- [ ] Store actual historical observations, not only row counts.
- [ ] Add idempotent upsert.
- [ ] Add indexes.
- [ ] Verify the anomaly model can retrieve its historical window.

Test:

`India → UAE → HS6 → monthly history`

---

## Phase 6 — n8n Analyze Trade Flow

Modify:

`Webhook — Analyze Trade`

to perform:

1. [ ] validate request
2. [ ] normalize input
3. [ ] HS classification
4. [ ] retrieve historical context
5. [ ] Trade Anomaly model
6. [ ] Market Opportunity model
7. [ ] Counterparty Matching model
8. [ ] Counterparty Risk model
9. [ ] Compliance/RAG
10. [ ] aggregate result
11. [ ] persist analysis
12. [ ] return response

Do not rely on accidental `$json` propagation.

Each HTTP node must explicitly construct its request body.

Add failure handling.

---

## Phase 7 — n8n API Configuration

Replace all placeholder URLs with real environment/configuration references.

Current workflow contains placeholders for:

- HS classifier
- UN Comtrade
- Market Opportunity
- Counterparty Matching
- Counterparty Risk
- Compliance/RAG
- Trade Service
- escrow smart contract
- OCR
- document verification
- blockchain anchor
- shipment tracking
- release escrow
- daily Comtrade ingestion
- WITS ingestion

Tasks:

- [ ] configure every endpoint
- [ ] configure credentials
- [ ] configure timeouts
- [ ] configure authentication
- [ ] test each node individually
- [ ] test complete workflow

---

## Phase 8 — Result Aggregation

The current workflow uses market, compliance, and inverse counterparty risk.

Tasks:

- [ ] keep score directions consistent
- [ ] add anomaly/risk as a separate dimension
- [ ] prevent double-counting
- [ ] document final score mathematics
- [ ] define recommendation thresholds
- [ ] preserve individual scores

Expected result should contain at least:

- HS6
- market opportunity
- anomaly score
- anomaly flag/type
- counterparty matches
- counterparty risk
- compliance
- overall score
- recommendation
- model versions

---

## Phase 9 — Frontend

Inspect current UI.

Tasks:

- [ ] connect actual analysis form to backend
- [ ] connect backend to n8n
- [ ] ensure product input is sufficient for HS classification
- [ ] collect quantity + unit
- [ ] collect origin/destination
- [ ] collect trade flow
- [ ] collect target price/value if applicable
- [ ] collect certifications
- [ ] show loading state
- [ ] show error state
- [ ] show anomaly risk separately
- [ ] show ranking separately
- [ ] show counterparty results
- [ ] show compliance results
- [ ] show overall recommendation
- [ ] show historical anomaly explanation
- [ ] do not expose internal ML features

If UI changes are necessary, make the smallest coherent changes.

---

## Phase 10 — Authentication and Authorization

- [ ] connect authenticated user context
- [ ] connect organization context
- [ ] authorize analysis/trade/document access
- [ ] prevent cross-organization reads
- [ ] prevent trusting arbitrary user/org IDs from frontend
- [ ] protect admin-only operations

---

## Phase 11 — Trade Creation

Connect:

`create-trade`

to actual schema/API.

Tasks:

- [ ] validate counterparty
- [ ] validate buyer/seller authorization
- [ ] create trade
- [ ] create offer/terms where applicable
- [ ] create escrow state
- [ ] persist testnet escrow transaction
- [ ] return trade ID and escrow state

---

## Phase 12 — Document Verification

Connect:

`document-uploaded`

Tasks:

- [ ] validate document ownership
- [ ] OCR
- [ ] extraction
- [ ] LLM verification
- [ ] normalize extracted values
- [ ] compare with trade/document state
- [ ] record verification result
- [ ] branch on inconsistency
- [ ] hash verified representation
- [ ] anchor hash on testnet
- [ ] persist transaction hash
- [ ] return status

Important:
- [ ] distinguish integrity proof from truthfulness.

---

## Phase 13 — Shipment + Escrow

Connect scheduled shipment polling.

Tasks:

- [ ] fetch active escrows
- [ ] resolve tracking numbers
- [ ] call tracking provider
- [ ] normalize status
- [ ] save shipment event
- [ ] evaluate:
  - docs verified
  - no active dispute
  - inspection OK
  - dispatched
  - received
- [ ] release escrow on testnet when all conditions are satisfied
- [ ] update trade status
- [ ] otherwise keep escrow locked

---

## Phase 14 — Daily Data Ingestion

Tasks:

- [ ] configure daily trigger
- [ ] Comtrade pull
- [ ] WITS pull
- [ ] normalization
- [ ] deduplication
- [ ] upsert
- [ ] ingestion logging
- [ ] failure alert
- [ ] model data freshness check

---

## Phase 15 — Environment Configuration

Create/update environment documentation.

Variables should cover:

- frontend URL
- backend URL
- n8n base URL
- n8n webhook URL
- Postgres connection
- Comtrade credentials/config
- WITS config
- ML service URL
- RAG provider config
- OCR provider config
- blockchain RPC
- escrow contract address
- document registry contract address
- shipment tracking provider
- authentication secrets

Never commit secrets.

---

## Phase 16 — Integration Testing

Create tests for:

### Happy path

`1000 kg basmati rice, India → UAE`

Verify:

- [ ] HS code
- [ ] historical retrieval
- [ ] anomaly
- [ ] market opportunity
- [ ] counterparty ranking
- [ ] counterparty risk
- [ ] compliance
- [ ] aggregate result
- [ ] DB persistence
- [ ] frontend rendering

### Failure paths

- [ ] invalid product
- [ ] invalid country
- [ ] missing quantity
- [ ] model unavailable
- [ ] Comtrade unavailable
- [ ] RAG unavailable
- [ ] malformed model response
- [ ] unauthorized organization
- [ ] document mismatch
- [ ] shipment unavailable
- [ ] escrow condition false

---

## Phase 17 — Browser Validation

Use Playwright to test the real UI:

- [ ] login
- [ ] trade analysis form
- [ ] submit
- [ ] loading
- [ ] results
- [ ] anomaly display
- [ ] ranking display
- [ ] counterparty display
- [ ] compliance display
- [ ] trade creation
- [ ] document upload
- [ ] status display

Use Playwright for browser/GUI validation, not as a replacement for available official APIs.

---

## Phase 18 — Documentation

Create:

- [ ] `globex_integration_workflow.md`
- [ ] `docs/schema_n8n_mapping.md`
- [ ] `docs/integration_baseline_inventory.md`
- [ ] API contract documentation
- [ ] environment setup documentation
- [ ] model deployment documentation

`globex_integration_workflow.md` must contain:

- architecture
- sequence diagram
- node-by-node n8n explanation
- API contracts
- model contracts
- database mapping
- startup order
- environment variables
- credentials
- deployment
- testing
- failure handling
- troubleshooting
- security
- model explanations
- what/why/how answers

---

## Phase 19 — Final Verification

Do not finish until all of the following are true:

- [ ] no critical placeholder URLs remain
- [ ] no secrets in source
- [ ] frontend reaches backend
- [ ] backend reaches n8n
- [ ] n8n reaches real model services
- [ ] anomaly model runs
- [ ] ranking model runs
- [ ] matching model runs
- [ ] counterparty risk runs
- [ ] compliance runs or has controlled fallback
- [ ] result is persisted
- [ ] frontend renders result
- [ ] trade creation works
- [ ] document workflow works
- [ ] shipment workflow works
- [ ] escrow testnet workflow works
- [ ] daily ingestion works
- [ ] schema is internally consistent
- [ ] happy-path test passes
- [ ] important failure paths pass
- [ ] documentation explains the complete system

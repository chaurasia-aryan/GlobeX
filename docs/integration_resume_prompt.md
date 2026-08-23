# GlobeXAI Integration Resume Prompt — Continue From Interrupted Work

## Role

Act as the lead integration engineer for the existing GlobeXAI/SIH repository.

This is a RESUME/CONTINUATION task.

A previous integration attempt was interrupted after the repository audit because the required ML model artifacts were not available at that time. The repository has since changed and the model/data artifacts now exist.

Do NOT restart the project from scratch.

Do NOT blindly repeat the previous task list.

First inspect the CURRENT repository and reconcile it with the supplied reference documents.

The objective is to make the existing frontend, backend, ML modules, database, n8n workflow, blockchain/escrow pieces, document workflow, and shipment workflow operate as one coherent system.

---

# 1. AUTHORITATIVE REFERENCE MATERIAL

The project contains or references:

1. `GlobeXAI — Cross-Border B2B Trade Automation(1).json`
   - Treat as the ORIGINAL n8n workflow reference.
   - It is NOT automatically the final workflow.
   - Modify it or regenerate it as required by the current implementation.
   - Preserve the original before making changes.

2. `GLOBEX_FINAL_ER_DIAGRAM(1) (1).png`
   - Use as schema/architecture reference.
   - Compare against actual migrations/database code.
   - Actual implemented schema/migrations take precedence when the diagram differs.

3. Existing project ML notebooks and artifacts.

4. Existing integration master-plan/repository-audit documentation.

5. Existing source code and tests.

The uploaded integration master prompt and audit/plan describe the intended architecture and gaps. Use them as project context, but ALWAYS verify claims against the current filesystem.

---

# 2. CRITICAL CURRENT-DIRECTORY RULE

The repository has been reorganized.

Data/model/notebook work is now primarily organized under the current `Brain Data`, `data`, `models`, `notebooks`, `src`, `backend`, etc. structure.

DO NOT assume the paths from the old interrupted task are still valid.

Before changing anything:

1. inspect the current directory tree;
2. locate every relevant dataset;
3. locate every model artifact;
4. locate every notebook;
5. locate the actual backend entry point;
6. locate migrations;
7. locate frontend API clients;
8. locate the current n8n JSON;
9. locate the ER diagram;
10. locate configs and environment templates.

Use actual current paths in all code and documentation.

---

# 3. ABSOLUTE SAFETY RULES

DO NOT delete project files.

DO NOT use:

- `git reset --hard`
- `git clean`
- `git restore`
- destructive directory cleanup
- blanket replacement of existing code
- overwriting useful notebooks
- overwriting original n8n workflow JSON without creating a backup

Do not discard uncommitted work.

Do not switch branches unless explicitly required.

Before modifications:

```bash
git status --short
git branch --show-current
```

Create a recovery/integration log.

If an existing component works, integrate it rather than rebuilding it.

---

# 4. IMPORTANT MODEL RULE — MODELS NOW EXIST

The previous task was interrupted because model artifacts were missing.

That is no longer the assumption.

The current repository inventory indicates that model/data artifacts now exist, including:

- Partner Discovery exporter data;
- processed Parquet datasets;
- destination-ranking features;
- Partner Discovery forecasting artifacts;
- Trade Risk artifacts;
- Trade Anomaly artifacts/configuration.

Therefore:

## DO NOT automatically retrain models.

First locate and inspect the current artifacts.

For each model determine:

- artifact path;
- model type;
- training dataset;
- feature list;
- preprocessing/scaler;
- metadata;
- expected input;
- output;
- model version;
- validation metrics;
- whether it is loadable.

Only retrain if:

1. the required artifact is genuinely missing;
2. the artifact cannot be loaded;
3. the artifact is demonstrably incompatible with current inference code;
4. the current project specification explicitly requires a new training run.

If retraining is necessary, preserve the existing artifact first.

---

# 5. MODEL ARCHITECTURE — DO NOT CONFUSE THE MODULES

GlobeXAI has multiple ML functions.

Keep them conceptually separate:

## A. Partner Discovery / Market Opportunity

Purpose:

Given an export intent such as:

> Export 1000 kg of basmati rice from India.

determine which destination markets/countries are commercially promising.

The current Partner Discovery exporter pipeline includes:

- historical trade data;
- feature engineering;
- destination ranking;
- forecasting;
- explainability;
- risk integration.

Use the existing implementation rather than creating a competing ranking system.

## B. Trade Risk / Trade Anomaly

Purpose:

Detect unusual/risky trade behaviour.

This is NOT the same thing as market opportunity.

An anomaly score should not be treated as a demand score.

## C. Counterparty Matching

Purpose:

After destination selection, identify suitable counterparties/organizations.

## D. Counterparty Risk

Purpose:

Evaluate the selected counterparty.

## E. Compliance/RAG

Purpose:

Evaluate regulatory/compliance requirements.

---

# 6. REQUIRED USER FLOW

The integrated application must support the conceptual flow:

```text
User
  ↓
Trade Intent
  ↓
Product / HS6 Classification
  ↓
Partner Discovery / Market Opportunity
  ↓
Destination Ranking
  ↓
Trade Risk / Anomaly
  ↓
Counterparty Matching
  ↓
Counterparty Risk
  ↓
Compliance
  ↓
Unified Analysis
  ↓
Persist Analysis
  ↓
Frontend Result
  ↓
User selects partner
  ↓
Trade Creation
  ↓
Escrow
  ↓
Document Verification
  ↓
Blockchain Anchoring where applicable
  ↓
Shipment Tracking
  ↓
Settlement / Escrow Release
```

Do not collapse these into one arbitrary ML score.

The frontend must remain understandable to a human trader.

---

# 7. RANKING + RISK INTEGRATION

The current Partner Discovery ranking implementation must remain the source for market opportunity.

The Trade Risk/Anomaly system must provide a separate risk signal.

The final response may contain:

```json
{
  "market_opportunity_score": 0,
  "trade_anomaly_score": 0,
  "trade_risk_level": "LOW",
  "destination_rank": 1,
  "counterparty_match_score": 0,
  "counterparty_risk_score": 0,
  "compliance_score": 0,
  "overall_trade_score": 0,
  "recommendation": "PROCEED"
}
```

Do not double-count the same risk dimension.

Document the mathematical aggregation if an overall score is created.

Direction must be consistent:

- opportunity: higher is better;
- compliance: higher is better;
- anomaly/risk: higher is worse;
- counterparty risk: higher is worse.

---

# 8. API INTEGRATION

Inspect existing APIs first.

Do not create duplicate endpoints if an equivalent exists.

If an endpoint is missing, implement the minimum production-quality router.

Potential contracts include:

```text
POST /predict/hs-code
POST /predict/market-opportunity
POST /api/trade-anomaly/predict
POST /predict/counterparty-match
POST /predict/counterparty-risk
POST /compliance/rag-analyze
POST /documents/ocr-extract
GET  /health
```

Use the actual route implemented by the repository if different.

Every endpoint needs:

- request validation;
- response schema;
- structured errors;
- model version where applicable;
- no secret leakage;
- deterministic behavior where expected.

---

# 9. FASTAPI INTEGRATION

There must be ONE coherent FastAPI application entry point.

Before creating `main.py`, search for:

- existing `main.py`;
- FastAPI app objects;
- routers;
- backend entry points.

If one exists, integrate into it.

Do not create a second competing FastAPI server.

The application must assemble the actual routers used by the project.

Verify:

```bash
uvicorn <actual_module>:app --reload
```

with the actual module path.

---

# 10. FRONTEND INTEGRATION

The current frontend is rich and already contains relevant pages/components.

Do not redesign the website unnecessarily.

The frontend MAY be changed when required for real integration.

Examples of legitimate changes:

- replacing mock API calls with real calls;
- adding a missing field required by the backend;
- changing a field name to match the canonical schema;
- adding loading/error/partial-result states;
- displaying market opportunity;
- displaying anomaly/risk;
- displaying counterparty results;
- changing the trade-analysis payload;
- adding a required trade-analysis result section;
- repairing broken routes;
- changing types/interfaces to match real backend responses.

Do NOT change visual design merely for aesthetics.

Do NOT remove existing functionality unless it is demonstrably obsolete or conflicting.

---

# 11. MOCK DATA RULE

Mock/demo fallbacks must NOT be treated as successful integration.

Inspect:

- `src/services/api/aiService.ts`
- `src/services/n8n/workflowService.ts`
- relevant pages/components.

Replace simulated responses with real calls wherever the production flow requires them.

A development fallback may remain ONLY if:

1. clearly identified as fallback;
2. disabled/secondary when real services are available;
3. never masks real backend failure in production;
4. does not make a broken integration appear successful.

---

# 12. N8N — CRITICAL

The supplied n8n JSON is a reference artifact.

Do NOT simply replace placeholder URLs.

First inspect:

- actual backend endpoints;
- request/response schemas;
- actual database tables;
- current frontend payload;
- current ML model interfaces;
- current external APIs;
- current environment configuration.

Then generate the final n8n workflow around the actual implementation.

The final workflow must be a REAL importable n8n JSON.

It must not contain unresolved production placeholders such as:

```text
<__PLACEHOLDER_VALUE__...>
```

Use:

- n8n credentials;
- environment variables;
- configurable URLs;
- explicit request bodies.

Never hard-code secrets.

---

# 13. N8N ORIGINAL FILE SAFETY

Before modifying the supplied/reference JSON:

Create a backup copy, for example:

```text
n8n/globex_trade_automation.reference.json
```

The final working workflow should be saved separately:

```text
n8n/globex_trade_automation.workflow.json
```

Do not destroy the original reference.

---

# 14. REQUIRED N8N WORKFLOW BRANCHES

The final workflow should cover these branches where supported by the actual project.

## A. Analyze Trade

```text
Webhook
→ Validate/Normalize
→ HS Classification
→ Historical Trade Context
→ Market Opportunity / Ranking
→ Trade Anomaly/Risk
→ Counterparty Matching
→ Counterparty Risk
→ Compliance
→ Aggregate
→ Persist
→ Respond
```

Exact order may change if model dependencies require it.

## B. Trade Creation

```text
Webhook
→ Validate/Auth
→ Resolve Counterparty
→ Create Trade
→ Create Escrow
→ Persist
→ Respond
```

## C. Document Verification

```text
Document Webhook
→ Ownership Validation
→ OCR
→ Verification
→ Compare with Trade
→ Inconsistent branch OR
→ Hash
→ Blockchain Anchor
→ Persist
→ Respond
```

## D. Shipment + Settlement

```text
Schedule
→ Active Trades/Escrows
→ Tracking API
→ Normalize Milestone
→ Persist
→ Evaluate Conditions
→ Release OR Hold
```

## E. Trade Data Ingestion

```text
Schedule
→ UN Comtrade
→ WITS/other configured source
→ Normalize
→ Validate
→ Deduplicate
→ Upsert
→ Ingestion Log
```

Only implement external integrations that can actually be configured.

Do not fake successful upstream responses.

---

# 15. N8N PAYLOAD RULE

Never blindly send:

```javascript
$json
```

to ML services.

Construct explicit payloads.

For example:

```json
{
  "product": "Basmati Rice",
  "hs6": "100630",
  "origin_country": "IND",
  "destination_country": "ARE",
  "trade_flow": "EXPORT",
  "quantity": 1000,
  "quantity_unit": "kg",
  "target_price": 1200,
  "reference_date": "2026-08-22"
}
```

Use the exact fields supported by the actual API.

Document every node boundary as:

```text
INPUT
OUTPUT
ERROR
```

---

# 16. DATABASE / ER DIAGRAM

Inspect the actual migrations before creating any new migration.

The ER diagram is architecture evidence, not permission to duplicate tables.

Compare existing schema with n8n's historical references such as:

- `trade_analysis`;
- `counterparties`;
- `escrow_contracts`;
- `document_verifications`;
- `blockchain_events`;
- `shipment_events`;
- `trade_data_ingest`.

Map them to actual canonical entities.

Prefer existing tables where semantically correct.

Only create a new table if the required business state genuinely has no representation.

Document:

```text
n8n field
→ API field
→ canonical database table
→ canonical database column
```

---

# 17. SUPABASE / DATABASE SAFETY

If Supabase/PostgreSQL credentials are unavailable:

- still implement schema/migrations/code;
- do not invent successful live DB verification;
- clearly document what remains unverified.

If credentials are available through environment/configuration, use them safely.

Never expose credentials in:

- frontend;
- Git;
- logs;
- n8n JSON;
- documentation.

---

# 18. N8N JSON MUST ALSO BE UPDATED

If the existing n8n JSON needs:

- new endpoint;
- changed field;
- new node;
- changed SQL;
- changed database mapping;
- changed webhook;
- changed model route;
- changed environment variable;

then MODIFY THE JSON.

The JSON is part of the deliverable.

Do not leave documentation describing one workflow while the JSON implements another.

After generating the final JSON:

1. validate JSON syntax;
2. inspect node names;
3. inspect node IDs;
4. inspect connections;
5. inspect expressions;
6. inspect HTTP request bodies;
7. inspect SQL;
8. inspect credentials references;
9. inspect webhook paths;
10. verify no nonexistent node is referenced.

---

# 19. PLAYWRIGHT

The Anti-Gravity environment has Playwright access.

Use Playwright when appropriate for:

- actual frontend GUI validation;
- browser-only workflows;
- verifying rendered trade-analysis UI;
- interacting with official websites where no usable API exists.

Prefer official APIs when available.

Do not use Playwright to bypass CAPTCHAs, authentication, anti-bot controls, or access restrictions.

---

# 20. END-TO-END TEST CASE

Use this as the primary integration scenario:

```text
Export 1000 kg of basmati rice from India.
```

The system should:

1. accept the trade intent;
2. classify/resolve HS6;
3. run Partner Discovery / Market Opportunity;
4. rank suitable destinations;
5. run Trade Risk/Anomaly;
6. show risk separately from opportunity;
7. identify counterparties for a selected destination;
8. calculate counterparty risk;
9. evaluate compliance;
10. aggregate the result;
11. persist analysis;
12. return it to the frontend;
13. allow counterparty selection;
14. create a trade;
15. create escrow where configured;
16. support document verification;
17. anchor document hash where configured;
18. track shipment;
19. evaluate settlement conditions.

If a dependency is unavailable, the test must report the dependency as unavailable rather than fabricating success.

---

# 21. FAILURE HANDLING

Every external dependency must handle:

- timeout;
- HTTP 4xx;
- HTTP 5xx;
- malformed response;
- rate limit;
- missing fields;
- unavailable service.

Critical failures must not return fake successful analysis.

Return structured error information.

Distinguish:

```text
SUCCESS
PARTIAL
FAILED
UNAVAILABLE
```

where appropriate.

---

# 22. OBSERVABILITY

Track:

- request/analysis ID;
- user/org ID where appropriate;
- n8n execution ID where available;
- model versions;
- endpoint latency;
- total analysis latency;
- status;
- error code;
- persistence status.

Never log:

- passwords;
- JWTs;
- API keys;
- private keys;
- sensitive document contents unnecessarily.

---

# 23. SECURITY

Never put:

- database passwords;
- Supabase service-role keys;
- n8n credentials;
- blockchain private keys;
- API keys

in frontend code or committed workflow JSON.

Use environment variables/n8n credentials.

Validate all incoming payloads.

Apply authentication/authorization using the project's existing auth architecture.

Do not trust frontend-supplied organization/user IDs.

---

# 24. REQUIRED DOCUMENTATION

Create/update:

```text
docs/integration_inventory.md
docs/n8n_integration_mapping.md
docs/integration_verification.md
docs/integration_decisions.md
docs/integration_recovery_log.md
globex_generated_n8n_workflow.md
globex_integration_workflow.md
```

These documents must describe the ACTUAL final implementation, not the intended implementation.

---

# 25. REQUIRED FINAL ARTIFACTS

At minimum:

```text
requirements.txt
```

if missing and genuinely needed.

FastAPI routers/entry point as actually required.

Training script ONLY if genuinely required.

Database migration(s) ONLY if required.

```text
n8n/globex_trade_automation.reference.json
n8n/globex_trade_automation.workflow.json
```

plus documentation and updated frontend/backend files.

---

# 26. VERIFICATION ORDER

Run:

1. Python syntax/import validation;
2. model artifact loading;
3. API health;
4. model endpoints;
5. database schema validation where credentials permit;
6. n8n workflow JSON validation;
7. n8n execution/test;
8. frontend TypeScript/build;
9. existing tests;
10. Playwright end-to-end UI test where appropriate.

Do not call the integration complete merely because the frontend builds.

---

# 27. DEFINITION OF DONE

The integration is complete only when:

- the current repository has been audited;
- existing model artifacts are reused correctly;
- no unnecessary model retraining occurs;
- FastAPI has one coherent application;
- real API calls replace required mock integrations;
- frontend payloads match backend contracts;
- backend contracts match models;
- n8n JSON matches actual APIs;
- n8n JSON matches actual database schema;
- database persistence works or has clearly documented external dependency;
- market opportunity and trade risk remain separate;
- counterparty matching works or has a clearly documented dependency;
- counterparty risk works or has a clearly documented dependency;
- compliance works or has a clearly controlled fallback;
- document workflow is wired;
- escrow workflow is wired where credentials/network permit;
- shipment workflow is wired where credentials permit;
- no secrets are exposed;
- original n8n reference is preserved;
- final n8n workflow is importable;
- frontend renders real integration results;
- at least one realistic end-to-end scenario is tested;
- failures are handled honestly;
- documentation reflects the actual implementation.

Do not stop at "files created."

The final state must be a coherent, testable integration.

# GlobeXAI --- Anti-Gravity Master Recovery & Production Repair

## Mission

This is a recovery task, not a fresh build.

The current iteration is considered BROKEN until the actual end-to-end
product is proven through:

**Frontend → n8n → real backend/model services → database/data → n8n
aggregation → frontend**

The current n8n canvas is not sufficient evidence of implementation. A
node being visible does not mean it executes. The current symptom is
that the frontend receives only a generic execution-triggered message
such as:

`Workflow execution initiated successful in Anytask, status triggered`

That is NOT an acceptable product result.

The product must return the actual outputs of the executed ML/DL/RAG
pipeline.

## Absolute rules

1.  **No fabricated data.**
2.  **No hardcoded marketplace records.**
3.  **No fake companies.**
4.  **No fake trust scores.**
5.  **No fake ML predictions.**
6.  **No static report templates pretending to be AI output.**
7.  **No silent fallback when n8n, FastAPI, a model, database, or
    dataset fails.**
8.  **No `try/catch` that converts a real failure into success.**
9.  **No development/demo fallback in production paths.**
10. **Do not create or train a new ML/DL model without explicit user
    approval.**
11. Existing trained models and datasets are authoritative starting
    points.
12. Blockchain is explicitly deferred; do not spend implementation
    effort there in this repair unless required to prevent unrelated
    breakage.
13. Do not claim a feature works merely because TypeScript, pytest, or
    the frontend starts.
14. Do not report Playwright success unless the actual browser
    interaction produced and displayed real backend/n8n results.
15. Do not modify the n8n workflow merely by changing URLs. Reconstruct
    it from the actual current API contracts and model interfaces.
16. Preserve the original/reference workflow before replacing it.
17. Never use `localhost:8000` from inside Docker n8n. Docker-to-host
    calls must use `host.docker.internal:8000` unless the actual Docker
    network configuration proves another address is correct.
18. Never return HTTP 200 success from an n8n workflow when a required
    downstream node failed.

## Required first action --- audit, do not code

Before changing code:

-   inspect the current repository;
-   inspect all existing Markdown instructions and handoffs;
-   inspect actual frontend API/service calls;
-   inspect FastAPI routes and request/response schemas;
-   inspect all existing ML/DL artifacts and inference code;
-   inspect RAG implementation and corpus;
-   inspect sanctions/tariff datasets;
-   inspect PostgreSQL schema/migrations;
-   inspect the current n8n JSON;
-   inspect the actual n8n workflow through the available browser/GUI;
-   inspect the current marketplace implementation;
-   inspect current error handling;
-   inspect environment variables;
-   inspect current git status.

Create:

`reports/production/current_state_reconciliation.md`

The report must separate:

-   IMPLEMENTED
-   PARTIALLY IMPLEMENTED
-   BROKEN
-   DOCUMENTED BUT NOT VERIFIED
-   HARDCODED
-   FABRICATED/MOCK
-   BLOCKED BY EXTERNAL CONFIGURATION

Do not trust previous completion messages without verifying the
implementation.

## Required architecture

For ML/DL/RAG business workflows:

``` text
Browser
  ↓
GlobeX frontend
  ↓
n8n webhook
  ↓
validate + normalize
  ↓
required model/data branches
  ├─ HS classification
  ├─ historical trade context
  ├─ market opportunity / XGBoost
  ├─ forecasting model that actually exists and is approved
  ├─ anomaly / risk model
  ├─ counterparty matching
  ├─ sanctions screening
  ├─ tariff/compliance
  └─ RAG retrieval
  ↓
merge/join all required results
  ↓
report synthesis using actual returned evidence
  ↓
persist required business state
  ↓
final response node
  ↓
browser
```

n8n is the orchestrator.

Python/FastAPI remains responsible for model inference, RAG retrieval,
compliance logic and data processing.

The frontend must not embed model outputs.

The frontend must not independently recreate model logic that already
exists in the backend.

## n8n must actually execute the nodes

The final workflow must satisfy all of the following:

-   every production node is connected;
-   every production node is reachable from a webhook/schedule;
-   every required branch has a valid downstream path;
-   every branch terminates in a merge/aggregation path;
-   no orphan production node;
-   no dead-end production node;
-   no unused duplicate node;
-   no node that exists only for visual appearance;
-   node expressions use actual upstream outputs;
-   HTTP request bodies match actual FastAPI schemas;
-   errors are captured and propagated;
-   the final response contains actual node outputs;
-   the webhook uses synchronous response semantics for analysis
    requests, or an explicit polling/execution-status protocol if the
    workflow is intentionally asynchronous.

For a synchronous analysis workflow, use either:

**Webhook → ... → Respond to Webhook**

with the webhook configured to wait for the final response, or an
equivalent n8n configuration that demonstrably returns the final JSON.

Never use "Respond Immediately" and then tell the frontend that the ML
workflow completed.

## Required final response contract

The frontend must receive structured JSON similar to:

``` json
{
  "status": "SUCCESS",
  "execution_id": "...",
  "workflow": {
    "name": "...",
    "duration_ms": 1234,
    "nodes_executed": 8
  },
  "input": {},
  "results": {
    "hs_classification": {},
    "market_opportunity": {},
    "forecast": {},
    "anomaly_risk": {},
    "counterparty": {},
    "sanctions": {},
    "compliance_rag": {},
    "report": {}
  },
  "provenance": [],
  "errors": []
}
```

The exact fields must be adapted to the actual implementation.

If any required stage fails:

``` json
{
  "status": "FAILED",
  "failed_stage": "n8n / FastAPI / model / database / RAG / ...",
  "error_code": "...",
  "message": "...",
  "node": "...",
  "details": "...",
  "retryable": true
}
```

The frontend must render that actual failure.

## Marketplace is a product surface, not a demo page

Audit every marketplace page for:

-   hardcoded listings;
-   static suppliers;
-   fake country trust scores;
-   fake companies;
-   fake ports;
-   fake certifications;
-   hardcoded ranking results;
-   canned descriptions;
-   fake availability;
-   localStorage used as the source of truth.

Replace these with real flows.

### Exporter marketplace

Exporter flow must be driven by the real trade/product input and should
use the approved existing models/data to produce:

-   HS classification;
-   destination-country opportunity ranking;
-   forecast where an approved forecasting artifact exists;
-   XGBoost outputs and explanations where applicable;
-   tariff/compliance evidence;
-   risk/anomaly information where applicable;
-   RAG evidence;
-   verified marketplace/counterparty data where actually available.

### Importer marketplace

Importer flow must be driven by:

-   commodity/product;
-   HS6;
-   sourcing origin;
-   quantity;
-   price/trade intent;
-   verified counterparty data.

It should use approved matching/risk/sanctions/compliance capabilities.

If verified company data is unavailable:

**show no verified companies found.**

Do NOT invent company names just to fill cards.

If a country trust score cannot be computed from real evidence:

**show unavailable / insufficient evidence.**

Do NOT substitute a random number.

## Role-aware UX

At dashboard entry:

-   user chooses Importer or Exporter;
-   role becomes the source of truth for the active workflow;
-   navigation, actions and ML capabilities change according to the
    role.

Exporter should expose relevant destination discovery, forecasting,
ranking, export compliance and buyer discovery.

Importer should expose relevant supplier discovery, counterparty risk,
inbound tariff/landed-cost analysis, sanctions and procurement
workflows.

Do not put every model into one generic "AI Analysis" page. Models must
appear where the user actually needs them in the trade lifecycle.

## Dynamic report generation

Reports must be generated from actual model/data outputs.

A report is invalid if it contains:

-   fixed paragraphs;
-   fixed scores;
-   hardcoded recommendations;
-   hardcoded country names;
-   canned pros/cons;
-   generic placeholder text.

If an LLM/report synthesizer exists, feed it structured evidence from
the actual pipeline.

If the approved implementation uses deterministic synthesis rather than
an LLM, it must still derive every claim from actual upstream outputs
and must expose provenance. Do not call deterministic templates
"AI-generated".

## RAG

Use the existing RAG pipeline wherever it materially contributes to:

-   tariff interpretation;
-   sanctions evidence;
-   export controls;
-   rules of origin;
-   SPS/TBT requirements;
-   trade-risk context;
-   forecast context;
-   report evidence.

RAG output must include source/provenance.

Do not invent citations.

## Models

Use existing approved model artifacts.

For every model, verify:

-   artifact exists;
-   artifact loads;
-   preprocessing/scaler exists;
-   inference code matches artifact;
-   feature order is correct;
-   output is non-empty;
-   output is actually consumed by n8n;
-   output reaches the frontend;
-   output is displayed.

Do not retrain or add a new model without explicit user approval.

## Error truthfulness

Failure must be classified.

Examples:

-   n8n unreachable → `N8N_UNREACHABLE`
-   webhook inactive/not found → `N8N_WEBHOOK_INACTIVE`
-   n8n node failed → `N8N_NODE_FAILED`
-   FastAPI unreachable → `BACKEND_UNREACHABLE`
-   model unavailable → `MODEL_UNAVAILABLE`
-   model inference error → `MODEL_INFERENCE_FAILED`
-   database unavailable → `DATABASE_UNAVAILABLE`
-   RAG unavailable → `RAG_UNAVAILABLE`
-   insufficient real data → `INSUFFICIENT_DATA`

The UI must show the relevant category instead of a generic "something
went wrong".

## Completion gate

Do not declare success until all are demonstrated:

1.  real browser request;
2.  real n8n webhook;
3.  n8n execution with multiple production nodes;
4.  actual downstream model outputs;
5.  aggregation;
6.  actual response body returned to browser;
7.  frontend renders the returned results;
8.  forced failure of one dependency;
9.  frontend displays the correct dependency-specific error;
10. no fallback/mock result appears.

Create:

`reports/production/final_e2e_evidence.md`

Include timestamps, endpoint paths, workflow name, execution ID if
available, node names, actual response fields, and failure tests.

## Token discipline

Do not narrate every command.

Return concise progress updates containing only:

-   changed;
-   tested;
-   failed;
-   blocked;
-   next concrete action.

Batch related work.

Do not repeatedly rediscover already inspected files.

Use the existing documentation and handoff files as context, but verify
critical claims against the actual implementation.

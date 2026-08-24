# n8n --- Real Execution Rebuild Specification

## Objective

Rebuild the production n8n workflow from the current repository
contracts.

The current workflow is visually large but operationally suspect: some
nodes are not used, and the caller receives only an execution-triggered
message.

This file defines the acceptance criteria for the replacement workflow.

## Required workflow families

Create separate clearly named workflows or clearly separated branches,
depending on the current application architecture:

1.  `GlobeXAI — Analyze Trade`
2.  `GlobeXAI — Exporter Discovery`
3.  `GlobeXAI — Importer Supplier Discovery`
4.  `GlobeXAI — Compliance & RAG`
5.  `GlobeXAI — Trade Risk`
6.  `GlobeXAI — Report Generation`

Do not duplicate business logic between workflows. Reuse backend
services.

## Analyze Trade production graph

Minimum logical graph:

``` text
Webhook
  ↓
Validate Input
  ↓
Normalize Input
  ↓
HS Classification
  ↓
      ┌────────────── Market Opportunity / XGBoost
      ├────────────── Forecast
      ├────────────── Anomaly / Risk
      ├────────────── Counterparty Match
      ├────────────── Sanctions Screening
      └────────────── Compliance + RAG
              ↓
          Merge Results
              ↓
      Validate Required Outputs
              ↓
       Report Synthesis
              ↓
          Persist Result
              ↓
      Respond to Webhook
```

The exact dependency graph may differ if the actual API contracts
require sequential execution.

## Node requirements

### Webhook

-   POST only.
-   Production webhook path must be explicit.
-   Validate content type.
-   Reject malformed payloads.
-   Generate/carry a correlation ID.

### Validate / Normalize

Normalize:

-   product;
-   HS6 if supplied;
-   origin;
-   destination;
-   trade direction;
-   quantity;
-   unit;
-   target/reference price;
-   certifications;
-   reference date.

Do not insert example defaults such as Basmati Rice, IND, ARE, 50000 kg,
etc. unless those values are explicitly supplied by the frontend as test
input.

A missing required field must produce a validation error.

### HS Classifier

Call the real endpoint.

Pass the actual product data.

Capture:

-   response;
-   HTTP status;
-   latency;
-   model/version metadata if provided.

### Market Opportunity

Call the actual approved XGBoost/ranking endpoint.

Do not calculate a fake ranking inside n8n.

n8n only orchestrates.

### Forecast

Call only the existing approved forecasting artifact/service.

If the repository currently uses XGBoost quantile forecasting rather
than GRU, use the actual deployed artifact.

Do not reactivate an old GRU merely because an older document mentions
it.

Do not train a new model.

### Anomaly / Risk

Call the real anomaly/risk endpoint.

Do not recreate the model logic in a Code node.

### Counterparty

Call the real matching endpoint.

Company records must originate from real configured data.

Do not generate fictional companies.

### Sanctions

Use the real sanctions registry/data source.

Return match status and evidence/provenance.

Do not treat "not found" as "verified safe" unless the actual screening
contract defines that semantics.

### Compliance + RAG

Call the real compliance/RAG service.

Return:

-   tariff evidence;
-   preferential treatment if supported by the dataset;
-   sanctions evidence where relevant;
-   export controls;
-   rules of origin;
-   SPS/TBT;
-   mandatory documents;
-   source/provenance.

### Merge

The merge stage must retain each upstream result under a named key.

Do not allow one branch to overwrite another.

Example:

``` json
{
  "hs_classification": {...},
  "market_opportunity": {...},
  "forecast": {...},
  "anomaly_risk": {...},
  "counterparty": {...},
  "sanctions": {...},
  "compliance_rag": {...}
}
```

### Report synthesis

The report endpoint receives actual merged evidence.

It must not independently invent missing values.

If a required upstream result is missing, report generation must either
fail clearly or mark the section unavailable according to the actual
contract.

### Persistence

Persist business state in PostgreSQL through the existing backend
persistence layer.

Do not treat n8n execution JSON as the database.

### Respond to Webhook

The final node must return the complete structured result.

Do not return:

`Workflow execution initiated successful`

Do not return only:

`status: triggered`

Do not return an empty body.

## Error branch design

Every production HTTP node needs an explicit error path.

Use actual n8n error handling.

Required behavior:

``` text
dependency failure
    ↓
capture status/body/node
    ↓
stop dependent downstream work
    ↓
aggregate diagnostic state
    ↓
Respond to Webhook with FAILED/PARTIAL
```

Do not continue as if the failed dependency succeeded.

## Synchronous response requirement

The frontend is waiting for model results.

Therefore:

-   configure the Webhook/Respond to Webhook pair correctly;
-   verify the request remains open until the final aggregation is
    complete;
-   return the actual final payload.

If the workflow is intentionally asynchronous, implement a real
job/execution ID + status polling mechanism. Do not fake synchronous
completion.

## Docker networking

For n8n running in Docker and FastAPI running on the host:

``` text
http://host.docker.internal:8000
```

is the expected host address.

Verify it from inside the n8n container.

Do not assume it works because the browser can access localhost.

## n8n validation checklist

Before declaring the workflow complete:

-   JSON parses;
-   all node IDs are unique;
-   all node names are unique;
-   all production nodes have connections;
-   all connections point to existing nodes;
-   webhook paths are unique;
-   no unresolved placeholders;
-   no fake URLs;
-   no secrets embedded;
-   expressions resolve;
-   HTTP methods match API contracts;
-   request bodies match Pydantic/API schemas;
-   response mode is correct;
-   error branches exist;
-   final response is non-empty;
-   final response contains downstream outputs.

## Required artifacts

Create:

``` text
n8n/workflows/globex_production_trade_analysis.json
docs/n8n/globex_production_trade_analysis.md
docs/n8n/node_contracts.md
reports/production/n8n_execution_evidence.md
```

`node_contracts.md` must document each node as:

``` text
Node
Purpose
Input
Endpoint
Output
Failure
Downstream consumer
```

## Import rule

If Anti-Gravity cannot import into the user's private Docker n8n
instance, do not claim import success.

Write:

`HUMAN ACTION REQUIRED — IMPORT N8N WORKFLOW`

Then provide the exact file and verification procedure.

## Required live test

Trigger the real production webhook with a real payload.

The evidence must show:

``` text
Webhook
→ HS
→ ML/DL branch 1
→ ML/DL branch 2
→ RAG
→ merge
→ synthesis
→ response
```

A 200 response alone is not sufficient.

The n8n execution graph must show that the intended production nodes
actually executed.

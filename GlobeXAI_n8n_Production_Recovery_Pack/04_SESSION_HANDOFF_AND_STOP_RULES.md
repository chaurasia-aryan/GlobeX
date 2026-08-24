# GlobeXAI --- Production Session Handoff

## Purpose

Create this handoff at the end of every significant Anti-Gravity/Claude
implementation session.

The next agent must be able to continue without guessing.

File location:

`reports/production/session_handoff_<YYYY-MM-DD>.md`

## Required sections

### 1. Session summary

State exactly what changed.

### 2. Verified working

List only features proven by tests or live execution.

### 3. Not verified

List features that compile or exist but were not proven end-to-end.

### 4. Broken

List known failures.

### 5. n8n state

Record:

-   workflow filename;
-   workflow name;
-   webhook paths;
-   Docker configuration;
-   backend base URL used from n8n;
-   active/inactive state if observable;
-   latest execution ID;
-   nodes actually executed;
-   nodes not executed;
-   response mode;
-   final response shape.

### 6. ML/DL state

For every approved model:

``` text
Model
Artifact
Inference endpoint
Input schema
Output schema
Loaded?
Tested?
Used by n8n?
Used by frontend?
Evidence
```

Do not claim "integrated" unless the output reaches the user-facing
product.

### 7. RAG state

Record:

-   corpus/datasets;
-   retrieval endpoint;
-   source provenance;
-   test query;
-   retrieved sources;
-   downstream consumers.

### 8. Marketplace state

Record:

-   real data source;
-   database/API path;
-   importer behavior;
-   exporter behavior;
-   hardcoded data removed;
-   remaining hardcoded data;
-   verified counterparty source;
-   trust-score provenance.

### 9. Error handling state

Record each dependency and its failure behavior:

``` text
n8n
FastAPI
ML
DL
RAG
Database
External data
```

### 10. Files changed

List exact paths.

### 11. Tests

Record exact commands and actual outcomes.

Do not write "all tests passed" without command output.

### 12. Playwright evidence

Record:

-   routes tested;
-   flows tested;
-   n8n execution IDs;
-   network response keys;
-   failure injection results.

### 13. Human actions required

Examples:

``` text
HUMAN ACTION REQUIRED — IMPORT N8N WORKFLOW
HUMAN ACTION REQUIRED — SET ENVIRONMENT VARIABLE
HUMAN ACTION REQUIRED — ACTIVATE N8N WORKFLOW
```

Never mark human action as completed unless actually observed.

### 14. Remaining work

Prioritize:

1.  blocker;
2.  production correctness;
3.  integration;
4.  UI;
5.  polish.

## Stop rules

STOP implementation and report the blocker when:

-   a required model artifact is missing;
-   an API contract cannot be determined;
-   a required private service is inaccessible;
-   a database schema is ambiguous;
-   an external credential is required;
-   a destructive action would be necessary;
-   the user explicitly must approve a new model.

Do not invent a workaround that changes product semantics.

## New model approval gate

If the existing approved models are insufficient and a new ML/DL model
appears necessary:

STOP.

Create:

`reports/production/new_model_proposal.md`

Include:

-   why existing models are insufficient;
-   proposed model;
-   data required;
-   target/learning objective;
-   validation plan;
-   expected integration points;
-   compute requirements;
-   why a non-model solution is insufficient.

Do not train or add the model until explicit approval is received.

## Final handoff rule

The handoff must distinguish:

``` text
REAL + VERIFIED
REAL + NOT VERIFIED
MOCK/LEGACY — MUST REMOVE
BLOCKED
HUMAN ACTION REQUIRED
```

No percentage-complete claims without evidence.

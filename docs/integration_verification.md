# GlobeXAI Integration Verification Protocol

## A. Repository

- [ ] Current Git status cleanly understood.
- [ ] No user changes discarded.
- [ ] Current paths verified.

## B. Models

For each model:

```text
Artifact exists
Artifact loads
Preprocessor loads
Feature schema matches
Inference code matches
Output schema verified
```

## C. FastAPI

Verify:

```text
GET /health
```

Then every active ML/API route.

Check:
- valid request;
- invalid request;
- missing fields;
- model failure;
- upstream failure.

## D. Database

Verify:
- migration syntax;
- foreign keys;
- unique constraints;
- enums;
- indexes;
- canonical table mapping.

## E. n8n

Verify:
- JSON parses;
- workflow imports;
- webhook paths;
- node references;
- expressions;
- HTTP request bodies;
- database queries;
- error branches.

## F. Frontend

Verify:
- API URL configuration;
- request payload;
- response parsing;
- loading state;
- error state;
- partial state;
- result rendering.

## G. End-to-End

Input:

```text
Export 1000 kg of basmati rice from India.
```

Expected logical outputs:

```text
HS classification
market opportunity
ranked destinations
trade risk/anomaly
counterparty candidates
counterparty risk
compliance
overall recommendation
```

Then:

```text
trade creation
escrow
document verification
shipment
settlement
```

where dependencies are available.

## H. Playwright

Use Playwright for the actual rendered browser flow.

Record:
- URL;
- actions;
- observed UI state;
- API failures;
- final result.

## I. Completion Rule

A feature is:

`PASS` — actually verified.

`PARTIAL` — implemented but blocked by external dependency.

`FAIL` — implemented but broken.

`NOT_IMPLEMENTED` — missing.

Never label a feature PASS merely because files exist.

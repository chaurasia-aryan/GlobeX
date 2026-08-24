# Playwright --- GlobeXAI Production E2E Verification

## Objective

Use Playwright as a hard verification gate.

Do not use screenshots or page-load success as proof that the product
works.

The browser must execute actual user flows and verify actual returned
data.

## Scope

Verify:

-   dashboard role selection;
-   exporter flow;
-   importer flow;
-   marketplace;
-   trade analysis;
-   n8n integration;
-   ML/DL outputs;
-   RAG evidence;
-   dynamic report;
-   error states.

## Test 1 --- Application boot

Open:

-   frontend;
-   backend health endpoint through the application where appropriate;
-   n8n UI.

Verify:

-   frontend loads;
-   no fatal console errors;
-   no hardcoded result cards are displayed as successful live data;
-   role selector is visible.

## Test 2 --- Exporter flow

1.  Open dashboard.
2.  Select Exporter.
3.  Verify exporter navigation appears.
4.  Enter a real product/trade request.
5.  Trigger the actual trade intelligence workflow.
6.  Wait for the actual n8n response.
7.  Verify the browser receives a structured result.
8.  Verify at least these result categories when supported:
    -   HS classification;
    -   destination ranking;
    -   XGBoost/approved forecast output;
    -   anomaly/risk output where relevant;
    -   compliance/RAG;
    -   report.
9.  Verify values displayed in the UI are derived from the response.
10. Verify no static demo cards replace missing results.

## Test 3 --- Importer flow

1.  Switch to Importer.
2.  Verify exporter-only actions disappear.
3.  Enter commodity and sourcing criteria.
4.  Trigger supplier/counterparty discovery.
5.  Verify results originate from the actual backend/n8n pipeline.
6.  Verify sanctions/risk information is displayed from actual evidence.
7.  If no verified suppliers exist, verify the UI says so rather than
    inventing companies.

## Test 4 --- n8n response body

Capture the network response to the n8n webhook.

The response must NOT be only:

`Workflow execution initiated successful`

or:

`status: triggered`

It must contain the actual downstream result payload.

Record:

-   HTTP status;
-   response body;
-   execution ID if available;
-   latency;
-   result keys.

## Test 5 --- n8n execution graph

Open the actual n8n execution.

Verify the intended nodes are executed.

A workflow with 10 nodes where only Webhook + Respond executed is a
FAILURE.

Verify:

-   HS node executed;
-   model/ranking node executed;
-   anomaly node executed;
-   RAG node executed;
-   counterparty node executed when required;
-   aggregation executed;
-   report synthesis executed;
-   final response executed.

Record node names and statuses.

## Test 6 --- Failure injection: n8n unavailable

Stop/disable the n8n webhook or point the test configuration to an
unavailable listener.

Trigger the workflow from the frontend.

Expected:

-   no fabricated result;
-   no success toast;
-   visible n8n-specific error;
-   correct error category;
-   retry action;
-   original error details preserved.

## Test 7 --- Failure injection: FastAPI unavailable

Keep n8n reachable but make the backend unreachable.

Expected:

-   n8n reaches the dependency failure;
-   workflow does not fabricate model output;
-   frontend identifies backend failure rather than n8n failure if the
    n8n engine itself is healthy.

## Test 8 --- Failure injection: model failure

Make one model endpoint return a controlled failure.

Expected:

-   exact failed node is identified;
-   dependent report stage does not pretend the model succeeded;
-   UI shows model-specific failure;
-   no fallback result appears.

## Test 9 --- Marketplace data integrity

Inspect the rendered marketplace.

Fail the backend/database.

Expected:

-   the marketplace shows an honest data-source error or empty
    verified-state;
-   it does not continue showing the same supposedly live listings;
-   it does not generate random companies or trust scores.

## Test 10 --- Offline test

Disconnect internet only if the required system architecture supports
local execution.

The goal is not that the UI must stop rendering.

The goal is that it must not fabricate external/live data.

Offline behavior must distinguish:

-   local dataset-backed functionality;
-   unavailable external sources;
-   unavailable n8n;
-   unavailable backend;
-   unavailable database.

## Browser evidence

Create:

`reports/production/playwright_e2e_evidence.md`

For every test record:

``` text
Test
Route
Input
Expected
Observed
HTTP status
n8n execution ID
Executed nodes
Result keys
Pass/Fail
Evidence
```

## Hard pass condition

Playwright PASS requires actual data flow.

These are NOT sufficient:

-   page loads;
-   title is correct;
-   button is clickable;
-   HTTP 200;
-   pytest passes;
-   TypeScript compiles.

The user-visible result must be traceable to the actual n8n execution
and underlying model/data services.

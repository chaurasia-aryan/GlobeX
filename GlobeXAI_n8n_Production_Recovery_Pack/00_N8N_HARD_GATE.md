# GlobeXAI --- n8n HARD GATE

Read this file before every n8n workflow modification, import, test, or
Git push.

## Non-negotiable

-   n8n must execute the actual production pipeline; visible nodes are
    meaningless unless execution evidence proves they ran.
-   Every required node must be connected, reachable, and consumed by
    downstream aggregation.
-   No orphan ML/DL/RAG nodes.
-   No mock/template/fake output.
-   No silent fallback.
-   No fictional companies, trust scores, rankings, tariffs, sanctions
    results, forecasts, or reports.
-   If a dependency fails, return the real failure and identify the
    failing node/dependency.
-   Never return only `triggered`, `execution initiated`, or an empty
    200 response for a synchronous analysis request.
-   The final webhook response must contain the actual downstream
    ML/DL/RAG results.
-   n8n Docker → host FastAPI must use the verified Docker-reachable
    address, normally `host.docker.internal:8000`.
-   Use existing approved model artifacts only. STOP and request
    approval before creating/training another model.
-   Preserve the original n8n JSON before replacing it.
-   Generate a real importable final JSON from the actual current API
    contracts.
-   Validate the workflow through a real execution, not only JSON
    parsing.
-   Use Playwright to prove the browser receives and renders the real
    result.

## Required execution shape

``` text
Webhook
→ Validate/Normalize
→ Required ML/DL/RAG branches
→ Merge
→ Validate outputs
→ Report synthesis
→ Persist where required
→ Respond to Webhook
```

Every branch must end in the real aggregation path.

## Required proof

A task is FAILED if the execution evidence shows only:

``` text
Webhook → Respond
```

or the frontend receives only:

``` text
Workflow execution initiated successful
status: triggered
```

A task PASSES only when the evidence proves:

``` text
Webhook
→ multiple production nodes
→ actual model/data outputs
→ aggregation
→ final response body
→ frontend rendering
```

## Failure proof

Force at least one dependency failure.

The UI must show the dependency-specific error:

``` text
n8n unreachable
n8n webhook inactive
n8n node failed
FastAPI unreachable
model unavailable
model inference failed
RAG unavailable
database unavailable
insufficient verified data
```

Never replace the failure with a demo result.

## Token discipline

Do not narrate routine commands.

Report only:

``` text
CHANGED
TESTED
FAILED
BLOCKED
NEXT
```

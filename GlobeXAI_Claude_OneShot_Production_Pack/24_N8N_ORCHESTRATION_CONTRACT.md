# n8n Orchestration Contract

## Rule

n8n coordinates services.

Business/legal rules live in FastAPI/domain services, not scattered JavaScript nodes.

## Required workflow

```text
Webhook
→ Validate
→ HS6
→ Market Forecast
→ Anomaly
→ Counterparty
→ Sanctions
→ Product Controls
→ Compliance RAG
→ Transaction Gate
→ Persist
→ Respond
```

## Idempotency

Every workflow execution should have:
- request ID;
- trade ID where applicable;
- idempotency key;
- timestamp.

Repeated requests must not duplicate:
- trades;
- escrow;
- payments;
- compliance cases.

## Failure

Any compliance service failure:
- stop execution;
- persist failure;
- return REVIEW/UNSUPPORTED as appropriate.

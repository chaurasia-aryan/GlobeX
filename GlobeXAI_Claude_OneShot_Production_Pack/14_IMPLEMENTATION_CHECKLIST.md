# GlobeXAI Compliance Implementation Checklist

## Backend

- [ ] `compliance_engine` separates facts, rules and decisions.
- [ ] `sanctions_screening` supports entity/person/vessel/aircraft.
- [ ] `restricted_party_screening` supports applicable lists.
- [ ] `product_controls` resolves HS6 + jurisdiction + control.
- [ ] `end_use_end_user` captures and validates purpose.
- [ ] `kyb` verifies organization identity.
- [ ] `ownership` evaluates applicable ownership/control rules.
- [ ] `source_registry` tracks official sources/version/freshness.
- [ ] `audit_log` records every decision.
- [ ] `transaction_gate` is the only compliance-dependent execution gate.

## API

Create or extend minimally:
- `POST /compliance/screen`
- `POST /compliance/sanctions-screen`
- `POST /compliance/product-controls`
- `POST /compliance/transaction-gate`
- `GET /compliance/source-status`
- `GET /compliance/coverage`

Reuse existing `/compliance/rag-analyze` where appropriate instead of creating duplicate logic.

## n8n

Required order:

```text
HS6
 ↓
Market Opportunity
 ↓
Trade Anomaly
 ↓
Counterparty Match
 ↓
Sanctions / Restricted Party
 ↓
Product Controls
 ↓
Counterparty Risk / KYB
 ↓
Compliance RAG
 ↓
Transaction Gate
 ↓
Persist
 ↓
Frontend
```

n8n orchestrates. It does not reimplement compliance logic.

## Database

Persist:
- screening cases;
- source versions;
- compliance decisions;
- rule IDs;
- evidence IDs;
- review actions;
- overrides;
- timestamps.

## Frontend

Add:
- Compliance Status;
- Sanctions Status;
- Restricted Product Status;
- Required Actions;
- Evidence/Source drawer;
- Review Case;
- Blocked state;
- Demo-data warning.

## Escrow

Never allow escrow creation when:
- BLOCKED;
- REVIEW;
- UNSUPPORTED.

## Test

Run all adversarial tests in `13_DEPLOYMENT_ACCEPTANCE.md`.

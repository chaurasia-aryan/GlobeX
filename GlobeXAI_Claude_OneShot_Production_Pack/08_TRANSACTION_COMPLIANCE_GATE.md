# Transaction Compliance Gate

## Objective

Create one deterministic gate before:
- trade creation;
- escrow creation;
- marketplace activation;
- shipment release;
- payment release.

## Inputs

```text
trade_id
origin
destination
HS6
product
quantity
value
currency
exporter
importer
beneficial owners where required
banks/payment path where relevant
carrier/vessel where relevant
end use
end user
certifications
documents
```

## Gate Order

```text
1. HS6 resolved
2. Jurisdiction identified
3. Sanctions screened
4. Restricted parties screened
5. Ownership/control screened
6. Export controls screened
7. Import controls screened
8. End-use/end-user screened
9. Tariff/RTA verified
10. SPS/TBT/NTM checked
11. Required licenses/certificates checked
12. Customs/document requirements checked
13. Payment/financial restrictions checked
14. Anomaly/risk checks run
15. Final decision
```

## Decision Logic

### CLEAR
All mandatory checks pass with current evidence.

### REVIEW
Any material unresolved:
- potential sanctions match;
- ownership ambiguity;
- missing license evidence;
- stale critical rule;
- conflicting official sources;
- unclear end use;
- document mismatch;
- unsupported destination/product.

### BLOCKED
A verified applicable prohibition prevents proceeding.

### UNSUPPORTED
The system lacks sufficient authoritative coverage.

## Important

`UNSUPPORTED != CLEAR`.

`REVIEW != CLEAR`.

A high market opportunity score cannot override a compliance block.

A low anomaly score cannot override a sanctions block.

## Escrow

If decision is:
- `BLOCKED` → no escrow.
- `REVIEW` → escrow locked/not created until human approval.
- `UNSUPPORTED` → no automated execution.
- `CLEAR` → escrow may proceed subject to remaining business controls.

## Recommendation

Use:
- `PROCEED`
- `REVIEW`
- `BLOCK`
- `UNSUPPORTED`

Never `PROCEED` for unresolved mandatory compliance.

## Audit Log

Persist:
- decision;
- rule IDs;
- evidence IDs;
- source versions;
- timestamps;
- model versions;
- reviewer;
- overrides;
- reason.

Human override of a block must require authorized review and documented legal basis. Do not create a frontend "override" button that bypasses compliance.

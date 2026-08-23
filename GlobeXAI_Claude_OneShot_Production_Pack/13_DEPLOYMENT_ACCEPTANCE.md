# Deployment Acceptance

## HARD GATES

Deployment is `NOT READY` if any mandatory gate fails.

### Data
- [ ] canonical grain valid
- [ ] duplicate audit passed
- [ ] leakage audit passed
- [ ] provenance retained
- [ ] raw data preserved

### Forecast
- [ ] GRU artifact audited
- [ ] inference path proven
- [ ] walk-forward validation completed
- [ ] baseline comparison completed
- [ ] demand metrics recorded
- [ ] FOB metrics recorded
- [ ] intervals calibrated
- [ ] model versioned

### Current Facts
- [ ] tariff source verified
- [ ] RTA treatment verified
- [ ] import controls verified
- [ ] export controls verified
- [ ] sanctions source registry operational
- [ ] stale-data handling operational
- [ ] conflicting-source handling operational

### Sanctions
- [ ] UN screening
- [ ] OFAC screening where applicable
- [ ] EU screening where applicable
- [ ] UK screening where applicable
- [ ] BIS restricted-party screening where applicable
- [ ] ownership/control logic
- [ ] fuzzy-match review
- [ ] audit logs
- [ ] fail-closed behavior

### Product Controls
- [ ] SCOMET screening
- [ ] ITC(HS) export policy
- [ ] ITC(HS) import policy
- [ ] end-use/end-user screening
- [ ] destination restrictions
- [ ] required-license checks

### KYB/AML
- [ ] organization verification
- [ ] ownership review where applicable
- [ ] sanctions separate from risk score
- [ ] sensitive-data access controls
- [ ] audit logs

### Compliance Gate
- [ ] CLEAR / REVIEW / BLOCKED / UNSUPPORTED
- [ ] no automated bypass
- [ ] blocked trade cannot create escrow
- [ ] review trade cannot auto-execute
- [ ] unsupported trade cannot auto-execute

### RAG
- [ ] official source metadata
- [ ] SHA-256/versioning
- [ ] supersession
- [ ] source citations
- [ ] stale-source detection
- [ ] conflict detection
- [ ] no hallucinated legal claims

### Ranking
- [ ] historical backtest
- [ ] baseline comparison
- [ ] stability
- [ ] sensitivity
- [ ] risk direction correct
- [ ] compliance separate

### Production Safety
- [ ] mock/seed fallback disabled for compliance-dependent production actions
- [ ] DEMO state visible
- [ ] no secrets in frontend
- [ ] audit logs enabled
- [ ] monitoring enabled
- [ ] reproducible artifacts
- [ ] deterministic inference
- [ ] incident/review workflow

## Required Adversarial Tests

Test:
1. clear Basmati export to supported destination;
2. confirmed sanctions match;
3. fuzzy sanctions match;
4. blocked entity owned by designated person where applicable;
5. prohibited product;
6. restricted product without license;
7. restricted product with verified license;
8. ambiguous HS6;
9. stale tariff;
10. conflicting official sources;
11. unknown destination regulation;
12. suspicious end use;
13. suspicious end user;
14. document mismatch;
15. mock-data environment;
16. high commercial score + compliance block;
17. low anomaly score + sanctions block;
18. repeated identical request.

## Final Report

Create:
`reports/production/production_readiness_report.md`

Return:
`READY`
or
`NOT READY`

Never claim:
- 100% accurate;
- 100% legal;
- zero risk.

The system is defensible when every material output is traceable to:
- source;
- timestamp;
- rule;
- model;
- version;
- uncertainty;
- review decision.

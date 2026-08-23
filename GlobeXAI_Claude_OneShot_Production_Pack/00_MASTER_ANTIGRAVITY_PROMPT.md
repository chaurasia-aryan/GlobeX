# GlobeXAI — Claude One-Shot Production Master Prompt

## MANDATORY DOCUMENT LOCATION

All implementation instructions for this task are contained in the folder:

`Claude One Shot Production Pack/`

This folder contains all Markdown files required for this execution.

Before implementing anything:

1. Locate the `Claude One Shot Production Pack/` folder in the project.
2. Read `README.md`.
3. Read every `.md` file inside that folder.
4. Treat the folder as the authoritative task specification for this one-shot execution.
5. Do not skip files because a requirement appears unrelated; requirements are intentionally split across the pack.
6. Execute the instructions in the order defined by `README.md` and this master prompt.

If the folder is not at the project root, search the repository for a directory named exactly:

`Claude One Shot Production Pack`

Do not create a second copy unless necessary.

## EXECUTION MODE

You are Claude Code operating inside the existing GlobeXAI repository.

Execute this task end-to-end in ONE continuous run.

Do not merely explain what should be done.
Do not wait for confirmation between phases.
Do not create fake success reports.
Do not rebuild working components unnecessarily.

Read every MD file in this pack before implementation.

The project already contains working frontend/backend/model/integration work. Preserve it, audit it, and upgrade it.

---

# PHASE 0 — TOOLING BOOTSTRAP FIRST

Before touching application code, inspect the environment.

Check:

```bash
node --version
npm --version
python --version
git --version
docker --version
claude --version
gh --version
```

Install only missing tools that are genuinely required.

## Required agent capability

Install/configure Playwright MCP for Claude Code.

Use the current official Microsoft Playwright MCP installation path:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Verify:

```bash
claude mcp list
```

Then perform a real smoke test against a harmless public test page.

Node.js 20+ is preferred for current Playwright MCP documentation.

If Claude Code requires a different currently documented invocation, follow the current official documentation rather than an obsolete command.

## Optional tools

Install/configure only when required:

- GitHub CLI (`gh`) if repository/PR/API operations are needed.
- Docker if containers are used or required for local integration.
- PostgreSQL client if direct DB inspection is needed.
- Other MCP servers only if they materially reduce implementation risk.

Do NOT install arbitrary MCP servers just to increase the tool list.

Do NOT install:
- browser extensions unrelated to Playwright;
- credential-stealing tools;
- scraping/bypass tools;
- anti-bot/CAPTCHA bypasses;
- tools that circumvent access controls.

## Playwright usage

Use Playwright for:
- browser-only official government workflows;
- official websites without usable API/download interfaces;
- UI regression testing;
- end-to-end testing;
- verifying the actual GlobeXAI frontend.

Prefer official APIs/downloads over browser automation.

Never bypass:
- authentication;
- CAPTCHA;
- robots/access controls;
- paywalls;
- rate limits.

---

# PHASE 1 — REPOSITORY FORENSIC AUDIT

Read:
- `README.md`
- `globex_match_project_documentation.md`
- `model_endpoints.md`
- `understanding_workflow.md`
- `how_to_run.md`
- all supplied notebooks
- all existing task/prompt MD files
- all current source code
- model artifacts
- frontend API clients
- n8n workflows
- DB schema/migrations.

The supplied project documentation currently describes:
- React/Vite frontend;
- FastAPI gateway;
- PostgreSQL/Supabase;
- n8n;
- Dual-Head GRU partner discovery;
- XGBoost anomaly detection;
- GRU Autoencoder + Isolation Forest trade risk;
- HS6 catalogue matching;
- compliance/RAG;
- OCR/document verification;
- counterparty matching/risk;
- shipment/escrow workflows. 

Do not assume documentation is truthful merely because it exists.

Trace actual code.

Create:

`reports/production/repository_audit.md`

Include:
- actual component;
- expected component;
- missing component;
- broken component;
- mock/stub component;
- production-ready component;
- evidence path.

---

# PHASE 2 — EXISTING NOTEBOOK RULE

Treat existing notebooks as baseline evidence.

Never overwrite the user's existing:
- partner-discovery notebook;
- trade-anomaly notebook;
- trade-risk notebook.

Create new reproducible notebooks/scripts.

If findings change, record:
1. old finding;
2. new finding;
3. methodological reason;
4. final accepted conclusion.

---

# PHASE 3 — DATA + MODEL AUDIT

Run:
- schema checks;
- duplicate checks;
- temporal checks;
- missingness;
- unit checks;
- leakage audit;
- train/validation/test chronology;
- artifact loading;
- preprocessing loading;
- inference smoke tests.

For the partner discovery GRU, verify:
- exact input feature order;
- sequence length;
- target transformation;
- scaler;
- model architecture;
- training period;
- inference preprocessing;
- output units;
- output constraints.

For anomaly/risk models verify:
- feature lists;
- training labels;
- sequence construction;
- thresholds;
- calibration;
- artifact compatibility.

---

# PHASE 4 — PRODUCTION FORECASTING

Do not assume the GRU is accurate because it produces numbers.

Compare it against:
- naive/last-value baseline;
- moving average;
- trend baseline;
- tree baseline where useful;
- GRU.

Use chronological walk-forward validation.

Report:
- MAE;
- RMSE;
- WAPE;
- sMAPE;
- interval coverage;
- error by year;
- error by country/product;
- cold-start performance.

Never report a generic "accuracy %" for regression.

The GRU may be retained only if validation evidence justifies it.

---

# PHASE 5 — TRADE ANOMALY

The supplied anomaly dataset uses rule-based heuristic labels.

Never describe these labels as confirmed fraud.

Preserve the anomaly layer separately from:
- destination ranking;
- sanctions;
- legal compliance.

Evaluate:
- statistical baseline;
- Isolation Forest;
- XGBoost benchmark;
- MLP Autoencoder;
- GRU Autoencoder;
- TCN;
- small Transformer;
- optional LSTM.

Do not force every model into production.

Select based on:
- temporal validation;
- PR-AUC/F1 where heuristic labels are used as evaluation;
- anomaly stability;
- false positives;
- interpretability;
- compute cost;
- operational usefulness.

For unsupervised scores, do not call raw anomaly scores probabilities.

---

# PHASE 6 — TRADE RISK

Keep:
- behavioural anomaly;
- corridor risk;
- counterparty risk;
- sanctions;
- compliance

as separate dimensions.

The GRU Autoencoder + Isolation Forest ensemble may identify behavioural instability.

It cannot legally determine:
- fraud;
- money laundering;
- sanctions violations;
- tax evasion.

---

# PHASE 7 — CURRENT FACTS

Historical model data is not current law.

Build a current-fact registry for:
- tariffs;
- preferential tariffs;
- RTA;
- rules of origin;
- import controls;
- export controls;
- sanctions;
- licenses;
- SPS;
- TBT;
- customs;
- product restrictions;
- entity status.

Every current fact requires:
- authority;
- source;
- retrieval time;
- effective period;
- jurisdiction;
- version;
- status.

---

# PHASE 8 — COMPLIANCE

Implement deterministic compliance gates.

Required states:

`CLEAR`
`REVIEW`
`BLOCKED`
`UNSUPPORTED`

Rules:
- REVIEW never becomes CLEAR automatically.
- UNSUPPORTED never becomes CLEAR.
- BLOCKED prevents automated execution.
- model scores never override legal restrictions.

Screen, where applicable:
- UN;
- OFAC;
- BIS;
- EU;
- UK;
- India/DGFT;
- destination-country controls.

Screen:
- exporter;
- importer;
- beneficial owners;
- directors/signatories where required;
- banks;
- intermediaries;
- consignee;
- carrier;
- vessel/aircraft;
- end user.

Do not create a simplistic "banned countries" rule.

---

# PHASE 9 — PRODUCT / EXPORT / IMPORT CONTROLS

For every transaction evaluate:

```text
origin
destination
HS6
product description
end use
end user
exporter
importer
ownership
payment path
```

Support:
- DGFT ITC(HS);
- SCOMET;
- destination import controls;
- export licensing;
- end-use/end-user restrictions;
- SPS/TBT;
- product registration;
- certificates;
- quotas;
- customs rules.

If classification is ambiguous:
`REVIEW`.

If a verified prohibition applies:
`BLOCKED`.

---

# PHASE 10 — KYB / OWNERSHIP / AML

Separate:
- identity verification;
- ownership;
- sanctions;
- anomaly;
- dispute history;
- business trust.

Do not convert a risk score into a legal conclusion.

Implement minimum necessary data collection and access controls.

---

# PHASE 11 — TRANSACTION GATE

Before:
- marketplace activation where legally relevant;
- trade creation;
- escrow;
- payment release;

execute:

```text
HS6
→ jurisdiction
→ sanctions
→ restricted party
→ ownership/control
→ export controls
→ import controls
→ end-use/end-user
→ tariff/RTA
→ SPS/TBT/NTM
→ licenses/certificates
→ customs
→ payment restrictions
→ anomaly/risk
→ final decision
```

Only `CLEAR` may proceed automatically.

`REVIEW`, `BLOCKED`, `UNSUPPORTED` stop automated execution.

---

# PHASE 12 — DOCUMENTS

Verify:
- commercial invoice;
- packing list;
- bill of lading;
- certificate of origin;
- phytosanitary certificate;
- other required certificates.

Compare:
- HS6;
- product;
- quantity;
- weight;
- value;
- currency;
- parties;
- origin;
- destination;
- dates;
- contract terms.

OCR is extraction, not truth.

Hashing proves document bytes, not legal validity.

---

# PHASE 13 — RANKING

Keep opportunity ranking independent.

It answers:

> Which markets appear commercially promising?

Compliance answers:

> May this transaction legally proceed based on currently available evidence?

A market may have:
- high opportunity;
- high risk;
- REVIEW;
- BLOCKED.

Do not collapse those dimensions into one unexplained number.

---

# PHASE 14 — API

Preserve existing endpoints where possible.

Extend minimally.

Required capabilities:
- market opportunity;
- forecast;
- anomaly;
- counterparty risk;
- sanctions screening;
- product controls;
- compliance RAG;
- transaction gate;
- source status;
- coverage;
- health.

Every response should expose:
- model version;
- data version;
- source timestamp;
- evidence;
- decision state;
- uncertainty;
- coverage.

---

# PHASE 15 — FRONTEND

Do not show:
- "100% legal";
- "risk-free";
- "guaranteed buyer";
- "sanctions-free";
- "guaranteed profit".

Show:
- Verified;
- Review Required;
- Blocked;
- Unsupported;
- Stale;
- Source Unavailable.

If BLOCKED:
- disable trade;
- disable escrow;
- disable payment.

If REVIEW:
- require human review.

If UNSUPPORTED:
- disable automated execution.

If demo/mock data:
display prominently:

`DEMO DATA — NOT LIVE COMPLIANCE`

---

# PHASE 16 — N8N

n8n orchestrates.

It must not duplicate core compliance logic.

Pipeline:

```text
Input
→ HS6
→ Market Opportunity
→ Forecast
→ Anomaly
→ Counterparty Match
→ Sanctions
→ Product Controls
→ KYB/Risk
→ Compliance RAG
→ Transaction Gate
→ Persist Audit
→ Frontend
```

No downstream node may bypass the gate.

---

# PHASE 17 — TESTING

Create:
- unit tests;
- integration tests;
- model-loading tests;
- API tests;
- frontend E2E tests;
- compliance adversarial tests;
- stale-source tests;
- mock-mode tests;
- failure-mode tests.

Use Playwright for actual browser E2E validation.

---

# PHASE 18 — SECURITY

Check:
- secrets;
- API keys;
- CORS;
- authentication;
- authorization;
- RLS;
- file upload;
- OCR;
- webhook validation;
- SSRF;
- path traversal;
- SQL injection;
- XSS;
- prompt injection;
- log leakage;
- PII exposure.

Never expose service-role secrets to Vite/frontend.

---

# PHASE 19 — OBSERVABILITY

Add:
- structured logs;
- request IDs;
- model version logs;
- data version logs;
- compliance decision logs;
- source freshness;
- latency;
- error rates;
- model drift signals.

---

# PHASE 20 — FINAL PRODUCTION AUDIT

Run all commands and tests.

Build frontend.

Start backend.

Start n8n if available.

Run representative transactions.

Run compliance adversarial tests.

Run Playwright E2E.

Check production build.

Generate:

`reports/production/production_readiness_report.md`

Final status must be:

`READY`

or

`NOT READY`

If NOT READY:
list failed gates and exact evidence.

Never fabricate metrics.

Never claim 100% accuracy or legal certainty.

---

# TOKEN-EFFICIENCY RULE

Do not narrate every action.

Use short progress checkpoints:

`PHASE X DONE — files / tests / metrics / blockers`

Spend tokens on implementation, not repetition.


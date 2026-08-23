# Phase 6 — Trade Risk Verdict (Isolation Forest + GRU Autoencoder, Counterparty Risk API)

Date: 2026-08-23
Scope: `D:\hehehe\GlobeX`, branch `dataset`.
Subjects:
* `backend/brain/models/trade_risk/` — `isolation_forest.joblib`, `robust_scaler.joblib`,
  `gru_autoencoder.pt`, `selected_features.json` (27), `risk_model_metadata.json`
* `src/api/counterparty_api.py` — `POST /predict/counterparty-risk`, `POST /predict/counterparty-match`
* `backend/database/supabase/migrations/*.sql`, `backend/brain/n8n/supabase_schema_setup.sql`

Method: Phase 3's runtime findings carried forward, plus **new runtime and schema investigation
performed in this phase** (§2, §3) into whether the live counterparty API can be fed real features.

---

## 1. The five dimensions must stay separate

Per `19_TRADE_RISK_PRODUCTION.md`, these are five different things with five different evidentiary
standards, and the system must never collapse them into one number:

| Dimension | What it is | What it can legally support |
|---|---|---|
| **Behavioural anomaly** | Statistical deviation from a corridor's own history | "This pattern is unusual." Nothing more. |
| **Corridor risk** | Country×product-level volatility, concentration, tariff exposure | Commercial risk framing. Not a legal finding. |
| **Counterparty risk** | Organisation-level track record — trades, disputes, delivery | Commercial diligence. Requires real counterparty data. |
| **Sanctions status** | Match against an authoritative restricted-party list | A legal determination, from a named source, with a date. |
| **Compliance status** | Applicable export/import controls for this HS6 and destination | A legal determination, from a named regulation. |

**The Isolation Forest and the GRU Autoencoder can, at most, contribute to the first dimension.**
Neither has any input from a sanctions list, a control regime, or a legal register — Phase 3 §2.3
proved that the `sanctions_present`, `ofac_entity_count` and `scomet_match_flag` slots were **constant
columns at fit time** and therefore contribute exactly zero to the decision function. **They cannot
determine fraud, money laundering, sanctions violation or tax evasion**, and no output of theirs may
be routed into a `BLOCKED` state.

---

## 2. The live counterparty-risk score is fabricated, and this phase proves it end to end

Phase 3 §2.5 established that the API fills 5 of 27 feature slots and zero-pads 22, that slots 3 and
4 receive semantically wrong quantities, and that 85.7% of reachable inputs are classified as
outliers. **This phase found something worse.**

### 2.1 The Isolation Forest branch is unreachable when a database is configured

Read `src/api/counterparty_api.py:305-442`. The control flow is:

```
if _db_available():          -> query DB, return, NEVER touching the model
    ...
# fall through only when there is NO database
risk_model_data = _load_risk_models()
trust_score   = _deterministic_float(seed_key + ":trust",   0.45, 0.95)   # md5 hash
dispute_rate  = _deterministic_float(seed_key + ":dispute", 0.0,  0.18)   # md5 hash
completed     = int(_deterministic_float(seed_key + ":trades", 3, 50) * 47) # md5 hash
...
features[0, 0] = np.log1p(completed * 10000.0)
```

where `seed_key = f"risk:{organization_id}:{hs6}"` and `_deterministic_float` is
`int(md5(seed).hexdigest(), 16) % 10000 / 10000` (`counterparty_api.py:116-119`).

**The Isolation Forest is therefore only ever evaluated on the stub path, and every one of its inputs
is an MD5 hash of the organization ID string.** The "counterparty risk score" is a deterministic
function of a string. It has no relationship to any organisation's actual behaviour.

### 2.2 Verified by executing the endpoint

Run with `SUPABASE_URL` / `SUPABASE_KEY` unset (this phase, live call into the real router):

```
db_available: False

organization_id                       data_source              trust   dispute  completed  IF score  level
00000002-0000-0000-0000-000000000001  isolation_forest_model   0.7195  0.1041   2247       -0.0164   MEDIUM
abc123                                isolation_forest_model   0.7221  0.1477   2087       -0.0173   MEDIUM
ACME-TRADING-LTD                      isolation_forest_model   0.917   0.1758   916        -0.0154   LOW
zzz                                   isolation_forest_model   0.6549  0.0445   1347       -0.0242   MEDIUM
```

Four observations, each independently disqualifying:

1. **`"data_source": "isolation_forest_model"` is returned even though every input is fabricated.**
   The endpoint's own docstring promises `"data_source": "seed_data"` so callers "are never misled
   about data origin" (`counterparty_api.py:7-9`). On this path that promise is broken: the field
   names a model, and the model's inputs are hashes.
2. **A nonsense organization ID — `"zzz"` — returns a complete, well-formed risk profile** with a
   trust score, a dispute rate, 1,347 "completed trades", an isolation-forest score and a risk level.
   No error, no `UNKNOWN_ORGANIZATION`, no warning.
3. **`completed_trades` is fabricated at a plausible magnitude.** The expression
   `_deterministic_float(..., 3, 50) * 47` produces a value in **[141, 2350]**. The API reports
   "2,247 completed trades" for an arbitrary UUID. A user cannot distinguish this from a real count.
4. **The `INSUFFICIENT_TRADE_HISTORY` cold-start guard is dead code.** It fires on
   `completed < 5`, and `completed` is bounded below by 141. It can never trigger on this path, and
   the DB path where it *could* trigger is unreachable (§3.1). The pack's cold-start requirement is
   structurally unmet.

---

## 3. Can the API be fed real features? — investigated, and the answer is no

The task was to determine honestly whether `counterparty_api.py` can be given a genuine feature
vector from data that actually exists. Four independent blockers were found. **Any one of them is
sufficient; together they make a fix impossible without a new data pipeline.**

### 3.1 Blocker 1 — the live DB path cannot execute; it always throws

The API's SQL references columns that exist in **neither** of the repo's two schemas.

`counterparty_risk` (`counterparty_api.py:321-345`) issues:

```sql
SELECT composite_score FROM trust_scores WHERE organization_id = %s
SELECT COUNT(*) FILTER (WHERE status = 'OPEN') AS open_disputes, COUNT(*) AS total_trades
  FROM trades WHERE seller_org_id = %s OR buyer_org_id = %s
```

Against the actual schema (`20260822111809_initial_globex_schema.sql`):

| Referenced | Actually exists |
|---|---|
| `trust_scores.composite_score` | `overall_score`, `delivery_score`, `compliance_score`, `fraud_score` — **no `composite_score`** |
| `trades.seller_org_id`, `trades.buyer_org_id` | `exporter_id`, `importer_id` — **grep for `seller_org_id` / `buyer_org_id` across all migrations and the n8n schema returns zero hits** |
| `trades.status = 'OPEN'` | `trade_status` enum = CREATED, OFFERED, ACCEPTED, REJECTED, COUNTER_OFFERED, AGREED, IN_PROGRESS, SHIPPED, DELIVERED, DISPUTED, COMPLETED, CANCELLED — **`'OPEN'` belongs to `dispute_status`, not `trade_status`** |

`counterparty_match` (`counterparty_api.py:207-223`) additionally selects `o.name` and
`o.certifications`; `organizations` has `legal_name` / `trade_name` and **no `certifications` column
in either schema** (grep: zero hits).

Every one of these raises a `psycopg2` error, which is caught at `counterparty_api.py:374-377` and
`254-258` and silently falls through to the stub. **With `SUPABASE_URL` set and a correctly
provisioned database, both endpoints still return seed data** — and `counterparty_risk` still returns
`"data_source": "isolation_forest_model"` with hash-derived inputs.

There are also **two mutually incompatible schemas** in the repo:
`backend/database/supabase/migrations/*` (`organizations.legal_name`, `trust_scores.overall_score`)
and `backend/brain/n8n/supabase_schema_setup.sql` (`organizations.name`, `trust_scores.composite_score`).
The API's SQL matches neither completely. This must be resolved before any DB work is meaningful.

### 3.2 Blocker 2 — there is no counterparty history to read, in any schema

Counted directly from `20260822182000_seed_globex_demo_data.sql`:

| Table | Seeded rows |
|---|---|
| `users` | 100 |
| `organizations` | 36 |
| `organization_members` | 88 |
| `listings` | 300 |
| **`trades`** | **0 — no INSERT statement exists** |
| **`trust_scores`** | **0** |
| **`disputes`** | **0** |
| **`shipments`** | **0** |
| `trade_offers`, `delivery_confirmations`, `verification_documents`, `trade_documents` | 0 |

**Not a single trade, trust score, dispute or shipment exists in the seed data.** Every behavioural
input the model would need — transaction counts, trade values, dispute history, delivery
performance, time since last transaction — has no source. There is nothing to substitute for the
hash-derived `completed` count, because there is no trade table content to count.

### 3.3 Blocker 3 — grain mismatch: the model was never trained on organisations

This is the deepest blocker and the one that no amount of data plumbing fixes.

`04_trade_risk.parquet` has grain `(period, reporter_iso3, partner_iso3, hs6)` — 128
country×product corridors × 48 months = 6,144 rows. Verified this phase: the parquet's only
organisation-adjacent columns are `sanctions_entity_count` and `ofac_entity_count`, which are
**country-level counts, not organisation records**. There is **no organisation, company, entity or
counterparty dimension anywhere in the training data.**

**The Isolation Forest is a country×product corridor-month model. The API asks it for an
organisation's risk score.** Those are different objects. Feeding it a perfect 27-vector would still
produce a corridor score being presented as a counterparty score — a category error, not a
calibration problem.

The gap cannot be bridged by proxy either. Mapping an organisation to a corridor would need
`organizations.country` + a product, and:

* `organizations.country` holds **free-text country names** — measured: `India` (13), `Germany` (5),
  `UAE` (3), `USA` (3), `Vietnam` (2), `Brazil` (2), `Netherlands` (2), `Singapore` (2), `Japan` (2),
  `UK` (1) — not ISO3. No mapping table exists.
* The model knows only **16 partner ISO3 codes** (`ARE AUS BRA CHN DEU GBR IDN IND JPN KOR NLD SAU
  SGP USA WLD ZAF`). **Vietnam is not among them**, so 2 of 36 seed organisations have no corridor at
  all.
* The model knows only **8 HS6 codes** (090411, 100630, 271019, 300490, 520512, 711319, 847130,
  851712), against 300 listings spanning a far wider product space.
* Two of the 16 "partners" are `IND` (India as its own trade partner) and `WLD` (the World
  aggregate) — neither is a real corridor.

### 3.4 Blocker 4 — 17 of the 27 features have no source column anywhere

Phase 3 §5.2.2, cross-referencing `selected_features.json` against `04_trade_risk.parquet`:

```
directly present                     (3)  : unit_value_usd_per_kg, sanctions_present, ofac_entity_count
derivable from a same-named base     (7)  : log_trade_value, log_net_weight, log_transaction_count,
                                            trade_growth_mom_calc, trade_volatility_6m_clean,
                                            gdp_growth_clean, tariff_rate_clean
NO corresponding source column at all (17): growth_acceleration, tx_count_growth_mom,
  trade_val_hist_ratio, unit_val_growth_mom, unit_val_hist_dev, unit_val_hist_zscore,
  unit_val_volatility_6m_clean, partner_market_share_latest, partner_share_change_mom,
  partner_share_yoy_growth, inflation_rate_clean, tariff_preference_margin_clean,
  scomet_match_flag, days_since_last_tx, first_seen_flag, new_corridor_expansion,
  dormant_corridor_reactivation
```

Corroborated independently by the fitted `RobustScaler`: **23 of 27 features have zero IQR**, i.e.
were constant at fit time. Only `log_trade_value`, `log_net_weight`, `log_transaction_count` and
`unit_value_usd_per_kg` carry real variation. **The advertised "27-feature behavioural risk model" is
a 4-feature model on trade size.**

Generating those 17 features requires the same missing pipeline that produced the shipped artifacts —
which, per Phase 3 §3.5, **is not in this repository at all**.

### 3.5 Conclusion of the investigation — **BLOCKED, and no fix was implemented**

A "fix" here would mean replacing hash-derived constants with different constants and proxies, on an
unreachable code path, for a model of the wrong grain, using 4 of 27 features. **That is not an
improvement; it is the same defect with better-looking source code, and it would make the failure
harder to spot.** In line with the instruction not to implement anything that still feeds
constants or proxies, **no code change was made to `counterparty_api.py`.**

The only honest interim action is to stop returning the fabricated score at all (§6).

The one *unblocked*, genuinely useful improvement — recommended, not implemented, because it is
outside this phase's scope — is unrelated to the model: fix the SQL column names and seed the
`trades` / `trust_scores` / `disputes` tables, then compute counterparty risk from **explicit
descriptive statistics** (completed trades, dispute rate, on-time delivery rate, verification status)
with **no ML model at all**. Those are the numbers a trader actually wants, they are directly
auditable, and they need no 27-feature vector. That work is a database and API task with a clear
definition of done.

---

## 4. The GRU Autoencoder must stay disabled

Phase 3 §3.1-3.5. Four independent blockers, each sufficient on its own:

1. **No class in the repository can load it.** The checkpoint uses module names
   `encoder / fc_enc / fc_dec / decoder / output_layer`; the repo's `PyTorchGRUAutoencoder`
   (`src/trade_anomaly/models.py:151`) uses `encoder_gru / fc_bottleneck / fc_expand / decoder_gru /
   fc_out`. `load_state_dict` raises `RuntimeError: Missing key(s)`.
2. **Provenance is unverified and contradicts the baseline notebook.** The notebook
   `trade_risk_complete.ipynb` describes a **Keras** autoencoder over **19** features with
   hidden 64 / bottleneck 32, saved as `gru_autoencoder.keras` beside `preprocessing_scaler.joblib`,
   and explicitly *drops* `ofac_entity_count_clean` and `unit_val_hist_dev`. What ships is a
   **PyTorch** `state_dict` with **27** inputs, hidden 32, bottleneck 16, beside `robust_scaler.joblib`,
   with both allegedly-dropped features present. Different framework, different shape, inverted
   feature selection. **The notebook's training period, its cutoffs and its "100% Causal / 0 future
   leaks" assertion cannot be transferred to this artifact.**
3. **Its scoring thresholds are not reproducible.** Scores are percentiles against the *training*
   reconstruction-error distribution. The shipped `risk_model_metadata.json` has 5 keys and contains
   **no `cutoff_values`, no p70/p90, no reference distribution**. A single new observation has no
   distribution to be a percentile of. Even with the class restored, it cannot be scored.
4. **Its training sequence length is unrecoverable.** A GRU is length-agnostic; the checkpoint does
   not record `T`. The notebook says 12, but the notebook did not produce this artifact.

Additionally, per `18_TRADE_ANOMALY_PRODUCTION.md`: **reconstruction error is not a probability** and
must never be surfaced as one, in any wrapper that might eventually be written.

---

## 5. What survives

Two things are genuinely sound and should be preserved:

* **The Isolation Forest algorithm itself is not the problem.** Phase 3 §2.4, given a real full
  27-vector: `decision_function(typical) = +0.0588 → inlier`,
  `decision_function(+10×scale outlier) = −0.2254 → outlier`. It separates typical from extreme
  cleanly. The failure is entirely upstream — wrong grain, absent data, broken feature construction.
  A corridor-level anomaly model over real corridor features remains a reasonable design.
* **Corridor-level data quality is good where it exists.** `04_trade_risk.parquet` is a balanced
  panel: 128 corridors × 48 months, zero full-row duplicates, zero duplicate natural keys, 48 of 48
  months present, and a chronological split. That is a usable foundation for a corridor risk model —
  just not for a counterparty one.

Two version-hygiene items observed at runtime this phase and worth fixing regardless of the decision:
`robust_scaler.joblib` was pickled under **scikit-learn 1.9.0** and is being unpickled under **1.8.0**
(`InconsistentVersionWarning`), and `requirements.txt` uses `>=` constraints with no upper bounds and
no lockfile.

---

## 6. PRODUCTION DECISION

Three separable components, three decisions.

### 6a. Counterparty risk score (`POST /predict/counterparty-risk`, Isolation Forest path)

**Disable, no safe fallback available.**

The score is a deterministic MD5 hash of the organization ID, computed on a code path that is
unreachable when a database is configured, from a model trained on country×product corridor-months
rather than organisations, using 4 of its 27 features. It is returned under
`"data_source": "isolation_forest_model"`, so no consumer can tell it is fabricated. There is no
degraded-but-honest version of this number to fall back to: with zero `trades`, zero `trust_scores`
and zero `disputes` rows in the database, and no organisation dimension in the training data, there
is nothing real to compute. Remove the Isolation Forest block (`counterparty_api.py:398-425`)
entirely rather than repairing it.

### 6b. Corridor-level trade risk (`isolation_forest.joblib` + `robust_scaler.joblib`)

**Retain with fix: keep the artifacts offline as a research baseline; do not serve any output until
(i) a real corridor-level feature builder produces all 27 features with non-zero variance, (ii) the
producing pipeline is recovered or rewritten so a training period and leakage status can be stated,
and (iii) the model is scored at corridor grain, never at organisation grain.**

The algorithm is sound and the corridor panel is clean. Nothing about the *shipped* artifact is
servable: it has no recorded training period, no verified leakage audit, and 23 of 27 features were
constant at fit time.

### 6c. GRU Autoencoder (`gru_autoencoder.pt`)

**Disable, no safe fallback available.** Leave unwired. Do not add a reconstructed class to load it —
a shape-derived reconstruction was proven to work in Phase 3 and that is precisely the trap: it would
produce runnable, well-formed, entirely unvalidated numbers from an artifact of unknown provenance
with unrecoverable thresholds. Re-enable only when a compatible class **and** a verified training
pipeline **and** the persisted p70/p90 cutoffs exist together.

### What the live API and frontend must say

**Immediately**, `POST /predict/counterparty-risk` must stop returning a risk score. Required shape:

```json
{
  "status": "UNSUPPORTED",
  "organization_id": "…",
  "reason": "COUNTERPARTY_RISK_DATA_UNAVAILABLE",
  "message": "Counterparty risk scoring is not available. No verified trade history, trust score or dispute record exists for this organisation.",
  "risk": null,
  "data_source": "none",
  "model_version": null
}
```

* **`composite_score`, `risk_level`, `trust_score`, `dispute_rate`, `completed_trades` and
  `isolation_forest_score` must not be returned.** Fabricated values at plausible magnitudes are more
  dangerous than a missing field, because a user will act on them.
* `POST /predict/counterparty-match` returns hash-derived `trust_score` and `match_score` from the
  same `_deterministic_float` generator and must be labelled **`DEMO DATA — NOT LIVE COMPLIANCE`**,
  visibly on the card, not in a tooltip, per `12_UI_COMPLIANCE_REQUIREMENTS.md`.
* The UI must render `UNSUPPORTED` using the pack's vocabulary — **`UNSUPPORTED — Current
  authoritative rule unavailable`** — and, per the pack's transaction controls, **`UNSUPPORTED`
  disables automated execution**. Only `CLEAR` may enable the next automated compliance-dependent
  step.
* The five dimensions of §1 must be displayed as **five separate fields**. Behavioural anomaly,
  corridor risk, counterparty risk, sanctions status and compliance status must never be blended into
  one composite number or one traffic light. A missing counterparty score must not be silently
  absorbed by the others.
* Sanctions and compliance status must come from the sanctions and compliance layers with a named
  source and a date — **never from any model in this directory.** No output of the Isolation Forest
  or the GRU Autoencoder may set `BLOCKED`, and none may be described using the words *fraud*,
  *money laundering*, *sanctions violation*, *tax evasion*, *illegal* or *criminal*.
* Never display an organisation as simply "safe", "verified low risk", "sanctions-free" or
  "risk-free".

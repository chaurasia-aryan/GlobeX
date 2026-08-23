# Phase 4 — Production Forecasting Verdict (Partner-Discovery Dual-Head GRU)

Date: 2026-08-23
Scope: `D:\hehehe\GlobeX`, branch `dataset`.
Subject: `backend/brain/brain_prev/models/partner_discovery/forecasting/gru_multi_output.pt`
(`GRUMultiOutputForecaster`, 2-layer GRU, hidden 64, dual head, 12 features, sequence length 5).

Method: **runtime execution against the real held-out split.** New script left behind at
`backend/brain/notebooks/validation/phase4_forecast_walkforward.py`; machine-readable outputs at
`reports/production/phase4_forecast_outputs/`. No baseline notebook was touched (Phase 2 policy).
Every number below is copied from that script's stdout — nothing is estimated or interpolated.

---

## 0. What this phase adds over Phase 3

Phase 3 reported the **shipped** `benchmark_comparison.csv` as found on disk. That CSV carries only
MAE / MAPE / R² / composite error. The production pack (`02_GRU_FORECAST_VALIDATION.md`) additionally
requires **RMSE, WAPE, sMAPE, interval coverage, error-by-year, error-by-country, error-by-product,
and cold-start performance**. This phase computes all of them, against the shipped checkpoint, on the
real data — and in doing so uncovers three findings the CSV could not have shown.

### 0.1 Setup, verified at runtime

| Item | Value | How verified |
|---|---|---|
| Data | `backend/brain/processed/01_partner_discovery_india_as_exporter.parquet`, 48,445 × 51 | loaded |
| Feature engineering | `PartnerFeatureEngineer(sequence_length=5)` — **imported, not reimplemented** | `src/partner_discovery/features.py` |
| Split | `create_sequence_dataset(split_train_end=2020, split_val_end=2022, split_test_end=2024)` — by **target year**, strictly chronological | `features.py:151-165` |
| Model load | `PartnerForecastingPipeline.load()` — real class, real z-score scaler, real `expm1` / `$0.01` floor | `forecasting.py:203-212` |
| Windows | train 30,420 (targets 2002-2020) · val 3,976 (2021-2022) · **test 3,976 (2023-2024)** | printed |

Two runs are reported throughout:

* **AS-TRAINED** — panel loaded with `exclude_wld=False`, which is what the training notebook did
  (Phase 3 §5.3.1). The `WLD` "World" aggregate corridors are present. This reproduces the split
  the shipped CSV used.
* **AS-SERVED** — `exclude_wld=True`, which is what live inference does (`inference.py:43`).
  n = 3,896 test windows.

### 0.2 Reproduction check — the split reconstruction is exact

| Model | shipped CSV Demand MAE (kg) | this run (AS-TRAINED) | delta |
|---|---|---|---|
| Naive (Last Value) | 26,932,374.0 | 26,932,372.9 | **−1.1 kg** |
| Moving Average (3-Year) | 25,949,070.0 | 25,949,071.2 | **+1.2 kg** |
| Dual-Head GRU | 75,187,352.0 | 60,563,853.7 | **−14,623,498.3 kg** |

The deterministic baselines reproduce the shipped CSV to within ~1 kg on a ~26,000,000 kg figure
(float32 vs float64 rounding). **The test tensors evaluated here are the same tensors the shipped CSV
was scored on.** That makes the GRU discrepancy a *weights* difference, not a data difference — see
§5, finding-change record.

---

## 1. Headline metrics — full metric set, test split (target years 2023-2024)

### 1.1 AS-TRAINED (WLD kept, n = 3,976) — demand, kilograms

| Model | MAE (kg) | RMSE (kg) | WAPE % | sMAPE % | MAPE % | Dir. acc. % | R² |
|---|---|---|---|---|---|---|---|
| Naive (last value) | 26,932,373 | 253,935,734 | 25.33 | 28.27 | 29.46 | 1.59 | 0.884 |
| **Moving Average (3-year)** | **25,949,071** | 223,938,073 | **24.41** | 28.80 | 29.42 | 64.59 | **0.910** |
| Linear trend (OLS, 5 steps) | 32,313,143 | 277,440,338 | 30.39 | 34.25 | 37.38 | 51.18 | 0.861 |
| Production fallback (MA3 × 1.05) | 26,101,891 | **223,072,099** | 24.55 | 28.38 | 30.45 | **64.66** | 0.910 |
| **Dual-Head GRU (raw)** | **60,563,854** | **495,801,306** | **56.96** | **46.38** | 38.76 | 59.08 | **0.557** |
| Dual-Head GRU + prod guardrails | 60,563,854 | 495,801,306 | 56.96 | 46.38 | 38.76 | 59.08 | 0.557 |

### 1.2 AS-TRAINED — price, USD/kg

| Model | MAE | RMSE | WAPE % | sMAPE % | R² |
|---|---|---|---|---|---|
| Naive (last value) | 134.292 | 582.408 | 3.643 | 3.324 | 0.999 |
| Moving Average (3-year) | 90.429 | 437.703 | 2.453 | 3.376 | 0.999 |
| **Linear trend (OLS, 5 steps)** | **81.141** | **347.454** | **2.201** | **1.491** | 0.999 |
| Production fallback (median of 3) | 109.691 | 511.921 | 2.976 | 3.943 | 0.999 |
| **Dual-Head GRU (raw)** | **183.194** | **894.516** | **4.970** | **75.367** | 0.997 |
| Dual-Head GRU + prod guardrails | 182.712 | 894.515 | 4.957 | 11.617 | 0.997 |

### 1.3 AS-SERVED (WLD excluded, n = 3,896) — demand, kilograms

| Model | MAE (kg) | RMSE (kg) | WAPE % | sMAPE % | MAPE % | Dir. acc. % | R² |
|---|---|---|---|---|---|---|---|
| **Naive (last value)** | **1,063,336** | 3,610,323 | **27.73** | 28.32 | 29.48 | 1.62 | 0.845 |
| Moving Average (3-year) | 1,078,245 | 3,354,469 | 28.12 | 28.87 | 29.50 | 64.58 | 0.866 |
| Linear trend (OLS, 5 steps) | 1,337,624 | 4,170,909 | 34.89 | 34.34 | 37.45 | 51.00 | 0.794 |
| **Production fallback (MA3 × 1.05)** | 1,067,849 | **3,295,058** | 27.85 | 28.45 | 30.53 | 64.58 | **0.871** |
| **Dual-Head GRU (raw)** | **2,052,650** | **7,132,403** | **53.54** | **45.64** | 38.44 | 59.16 | **0.396** |

Two things worth naming explicitly:

1. **The GRU is last on every scale-aware demand metric in both runs.** MAE 2.3× the best baseline,
   RMSE 2.2×, WAPE 2.2×, sMAPE 1.6×, R² 0.396 vs 0.871.
2. **The shipped CSV's "25.9M kg MAE" headline is an artifact of the `WLD` aggregate.** Excluding
   the World rows drops every model's MAE by roughly 25× (26.9M → 1.06M kg for naive). The absolute
   MAE figure that has been circulating is dominated by ~80 aggregate windows that are not real
   bilateral corridors. WAPE and sMAPE are stable across the two runs and are the honest headline
   numbers.

### 1.4 Note on MAPE

MAPE is the only metric on which the GRU looks competitive (38.8% vs 29.4%). That is a masking
artifact: `calculate_mape` (`forecasting.py:16-21`) masks to `y_true > 0` and equal-weights corridors
spanning five orders of magnitude, so tiny corridors dominate. **WAPE and sMAPE are the metrics to
report.** Per the pack, no generic "accuracy %" is reported anywhere in this phase.

---

## 2. Prediction intervals and coverage

**Native interval coverage is NOT APPLICABLE — no model in this codebase produces a prediction
interval.** Verified in source:

* `GRUMultiOutputForecaster.forward` returns two point scalars (`forecasting.py:66-71`).
* `PartnerForecastingPipeline.predict` returns two point arrays (`forecasting.py:181-190`).
* The naive / moving-average / trend baselines are point forecasts by construction.

Rather than fabricate one, the validation script constructs an **empirical** interval post hoc:
log-space residual quantiles are fitted on the **validation split (target years 2021-2022)** and
applied to the test split. Realised coverage on the test split, demand:

| Model | nominal 80% → realised | nominal 95% → realised |
|---|---|---|
| Naive (last value) | 81.97 % | 95.62 % |
| Moving Average (3-year) | 80.68 % | 95.75 % |
| Linear trend | 81.04 % | 95.50 % |
| Production fallback (MA3 × 1.05) | 80.68 % | 95.75 % |
| Dual-Head GRU (raw) | 80.23 % | 95.10 % |

These are **properties of the wrapper this script wrote, not of the shipped model.** They do
establish one useful fact: a log-residual-quantile wrapper on a moving-average baseline is
**well calibrated out of the box** (80.7% at nominal 80%, 95.7% at nominal 95%) and is therefore a
cheap, honest way to ship uncertainty alongside a baseline forecast. The GRU's interval is equally
well calibrated but sits around a much worse point forecast, so it is wider in absolute terms for no
accuracy gain.

---

## 3. Error decompositions

### 3.1 By target year (demand, WAPE %, AS-TRAINED)

| Model | 2023 | 2024 |
|---|---|---|
| Moving Average (3-year) | 24.12 | 24.70 |
| Production fallback (MA3 × 1.05) | 23.95 | 25.16 |
| Naive (last value) | 25.56 | 25.09 |
| Linear trend | 30.45 | 30.33 |
| **Dual-Head GRU** | **57.58** | **56.33** |

AS-SERVED: GRU 51.48 → 55.39 (WAPE % 2023 → 2024) against MA3's 27.67 → 28.53. **No model degrades
materially in the second held-out year**, so there is no evidence of rapid drift — the GRU is simply
uniformly worse, not decaying.

### 3.2 By product (demand, WAPE %, AS-TRAINED, top 8 HS6 by test-window count)

| Model | 030617 | 100630 | 271019 | 300490 | 520512 | 711319 | 847130 | 851712 |
|---|---|---|---|---|---|---|---|---|
| Naive (last value) | 23.3 | 26.4 | 14.5 | **5.2** | **6.7** | **3.6** | **10.8** | **7.9** |
| Moving Average (3-year) | 18.1 | 43.5 | 26.4 | 13.3 | 11.7 | 6.8 | 21.3 | 15.3 |
| Linear trend | **10.1** | 39.0 | 28.6 | 23.8 | 14.2 | 12.7 | 34.4 | 17.6 |
| **Dual-Head GRU** | 36.3 | 38.3 | 39.4 | **80.2** | 13.2 | **99.5** | **94.6** | **81.6** |

The GRU's failure is concentrated in the high-unit-value, high-variance products:
**711319 (gold jewellery) WAPE 99.5%** — i.e. its error is the size of the quantity it is predicting —
**847130 (laptops/tablets) 94.6%**, **851712 (smartphones) 81.6%**, **300490 (pharma formulations) 80.2%**.
These are exactly the corridors a trader would most want a forecast for.

### 3.3 By country (demand, WAPE %, AS-TRAINED, top 10 by test-window count)

| Model | ARE | AUS | BRA | CAN | CHN | DEU | FRA | GBR | IDN | NLD |
|---|---|---|---|---|---|---|---|---|---|---|
| Moving Average (3-year) | 28.8 | 28.9 | 29.0 | 25.7 | 29.4 | 26.6 | 26.6 | 27.1 | **23.3** | 29.0 |
| Naive (last value) | 28.4 | 30.4 | 33.3 | 28.9 | 27.9 | 25.9 | 27.7 | 29.0 | 23.9 | 29.2 |
| Production fallback | 29.1 | 29.3 | 29.4 | **25.5** | 29.3 | 26.4 | 25.9 | 27.6 | 23.2 | **28.5** |
| **Dual-Head GRU** | 34.5 | 32.9 | 34.4 | 37.2 | **64.1** | 48.1 | 44.7 | 40.9 | 28.9 | 37.1 |

The GRU is beaten in **every one of the top 10 destinations**, worst on **CHN (64.1%)** and
**DEU (48.1%)**. The baselines are remarkably uniform across countries (23-33%), which is itself
useful: corridor-level error is driven far more by product than by destination.

### 3.4 Cold-start performance

**The held-out split contains no cold-start corridors.** Distinct calendar years of history before
the target year, test split:

```
10 prior years :     1 window
11 prior years :     1 window
13 prior years :   323 windows
14 prior years :   323 windows
23 prior years : 1,664 windows
24 prior years : 1,664 windows
```

Zero windows fall below the 8-year threshold; the minimum is 10. Every corridor that survives the
`len(sub) >= 6` filter (`features.py:130`) has at least a decade of history by 2023.

**This is itself a finding, and it is a gap, not a clean bill of health.** `inference.py:79` will
serve any corridor with **≥ 5 rows**, and for a duplicate-year corridor 5 rows can be as little as
**3 calendar years**. The production system will therefore serve forecasts in a regime the held-out
split cannot measure at all.

Two stratifications that the split *can* support:

**A. Depth of corridor history** (AS-TRAINED, demand):

| Model | shallow ≤14 prior yrs (n=648) WAPE % | deep ≥15 prior yrs (n=3,328) WAPE % |
|---|---|---|
| Moving Average (3-year) | 28.92 | **24.40** |
| Production fallback | **28.42** | 24.54 |
| Naive (last value) | 32.97 | 25.32 |
| Linear trend | 35.51 | 30.38 |
| **Dual-Head GRU** | **37.19** | **56.99** |

**B. Calendar span inside the 5-step input window** — the closest true analogue to a cold start
(a duplicate-year corridor packs 5 rows into 3 calendar years, so the model sees less history than
the architecture implies):

| Model | 3 calendar yrs (n=1,484) WAPE % | 5 calendar yrs (n=2,492) WAPE % |
|---|---|---|
| Naive (last value) | **10.49** † | 34.20 |
| Production fallback | 18.88 | 27.94 |
| Moving Average (3-year) | 19.43 | **27.38** |
| Linear trend | 24.35 | 34.00 |
| **Dual-Head GRU** | **67.06** | **50.92** |

† see §3.5 — this figure is contaminated, not skill.

**The GRU is the only model that gets *worse* when the input window is compressed** (67.1% vs 50.9%),
i.e. it degrades precisely where the data is thinnest. Every baseline improves. That is the opposite
of the robustness profile a production forecaster needs.

### 3.5 Duplicate-year contamination — quantified on held-out data

Phase 3 §5.3.2 established that 7 HS6 codes carry two `product_description` spellings, doubling
24.9% of corridor-years, and that 22.1% of *training* windows contain their own target year. This
validation measures the effect on the **test** split: **742 of 3,976 windows (18.7%)** have the target
calendar year already inside the input window.

| Model | clean window (n=3,234) MAE kg / WAPE % | target-year-in-window (n=742) MAE kg / WAPE % |
|---|---|---|
| **Naive (last value)** | 33,111,651 / 31.16 | **46.78 / 0.00** |
| Moving Average (3-year) | 28,481,143 / 26.80 | 14,913,062 / 13.99 |
| Production fallback | 28,725,864 / 27.03 | 14,665,328 / 13.76 |
| Linear trend | 35,523,260 / 33.43 | 18,321,877 / 17.19 |
| **Dual-Head GRU** | 58,167,002 / 54.74 | **71,010,509 / 66.62** |

The naive baseline scores **MAE 46.78 kg and WAPE 0.00%** on the contaminated subset (1.26 kg in the
AS-SERVED run). That is not forecasting skill — **the "last input row" *is* the target row**, the same
physical trade recorded under a second product-description spelling. This is direct, decisive,
runtime proof of the duplicate-year defect on held-out data.

Note the direction of the GRU's response: it is the **only** model that does *worse* on the
contaminated windows (66.62% vs 54.74%). A model that had learned to copy would score near-zero
there like the naive baseline does. It did not learn to copy; it learned something else, and the
duplicated rows simply corrupted its input distribution.

---

## 4. Economic plausibility of the GRU's point forecasts

Ratio of GRU forecast to the last observed actual, test split, AS-TRAINED:

```
negative demand forecasts   : 0
zero demand forecasts       : 0
forecast / last actual      : p05 = 0.317   p50 = 0.719   p95 = 1.511   max = 8.3
forecasts > 10x last actual : 0        (0.0%)
forecasts < 0.1x last actual: 41       (1.0%)
```

**No negative forecasts, no zeroes, no explosive outliers.** The architectural constraints of
Phase 3 §4.4 hold on real data. The problem is bias, not instability: **the median forecast is
0.72× the last observed actual** — a systematic ~28% under-forecast of demand. That single number
explains the WAPE of 57% and the sMAPE of 46% better than any variance story does. A GlobeXAI user
acting on this model would consistently under-order.

### 4.1 The price head, measured on real data

* **GRU price output sits at the $0.01 floor on 1,314 of 3,976 test windows (33.0%).** Phase 3
  estimated 33.5% on synthetic inputs; the real held-out figure is 33.0%. Confirmed.
* The production guardrail (`inference.py:87-88`) therefore fires on **33.0%** of real test rows for
  price and **0.0%** for demand.
* Even after the guardrail substitutes the historical median, the GRU price path is still worse than
  every baseline: MAE $182.71 vs the moving average's $90.43.
* The guardrail is what drops price sMAPE from **75.37% to 11.62%** — i.e. **five sixths of the
  apparent price quality on that metric comes from the heuristic, not the model**, while the response
  still labels the value a GRU forecast.

### 4.2 The heuristic that actually runs today is one of the best models

Both model-directory paths are broken (Phase 3 §4.9), so live traffic today gets
`fc_d = mean(last 3 net weights) × 1.05`, `fc_p = median(last 3 prices)` (`inference.py:74-77, 94-96`).
That is **not** a naive last-value heuristic — `hist_avg_d` is a **3-year mean**, so the accidental
fallback is a 3-year moving average with a 5% uplift. Measured:

| | AS-TRAINED WAPE % | AS-SERVED WAPE % | AS-SERVED R² |
|---|---|---|---|
| Production fallback (MA3 × 1.05) | **24.55** | **27.85** | **0.871** |
| Dual-Head GRU | 56.96 | 53.54 | 0.396 |

**The accident is roughly 2.2× more accurate than the model it is accidentally replacing, and has the
best RMSE and R² of any model tested in the AS-SERVED run.** Fixing the path bugs so the GRU loads
would make the product materially worse.

---

## 5. Finding-change record — the shipped benchmark CSV was not produced by the shipped checkpoint

```
OLD FINDING (source: Phase 3 §4.6, reporting
  backend/brain/brain_prev/models/partner_discovery/forecasting/benchmark_comparison.csv
  as shipped):
  The Dual-Head GRU's held-out demand MAE is 75,187,352 kg with R^2 = 0.3991, versus the
  3-year moving average's 25,949,070 kg / 0.9096. Phase 3 explicitly listed "whether the
  partner-discovery GRU's benchmark numbers are reproducible" as undetermined (§8), because
  the training notebook was saved without stored outputs.

NEW FINDING (source: backend/brain/notebooks/validation/phase4_forecast_walkforward.py,
  this phase):
  Scoring the SHIPPED checkpoint gru_multi_output.pt through the real
  PartnerForecastingPipeline.load() on the reconstructed test split gives demand MAE
  60,563,854 kg and R^2 = 0.557 — a gap of 14,623,498 kg against the CSV's GRU row. On the
  SAME tensors, the deterministic Naive and Moving-Average baselines reproduce the CSV to
  within 1.2 kg on a ~26,000,000 kg quantity.

METHODOLOGICAL REASON:
  train_and_evaluate_forecasting_models (forecasting.py:266-271) computes the GRU's benchmark
  row and then calls pipeline.save(output_dir) on the SAME pipeline object, so the CSV row and
  the .pt file are supposed to describe the same weights. predict() calls model.eval(), so
  dropout is inactive and inference is deterministic. Because the baselines match to float32
  rounding, the input tensors are proven identical; the only remaining free variable is the
  weight tensor. Therefore the shipped CSV and the shipped checkpoint come from two different
  training runs, and the CSV was not regenerated after the checkpoint that ships alongside it.

FINAL ACCEPTED CONCLUSION:
  Both the old and the new figure support the same production conclusion — the GRU loses badly
  to a 3-year moving average on held-out data — so the DECISION does not change. But
  benchmark_comparison.csv must no longer be cited as the shipped model's performance record:
  it describes different weights. The authoritative figures for the artifact currently on disk
  are those in §1 of this report. This is the same class of provenance defect Phase 3 §3.5
  found in the trade-risk directory, now confirmed in a second model directory.
```

---

## 6. Pack gate assessment (`02_GRU_FORECAST_VALIDATION.md`)

> "GRU is production-approved only if it is demonstrably useful against baselines and its
> error/uncertainty behavior is documented."

| Requirement | Status | Evidence |
|---|---|---|
| Chronological walk-forward, never random split | **Met** | split by target year, `features.py:151-165`; verified at runtime |
| Baselines: last value, moving average, trend, tree, GRU | **Met** (tree from shipped CSV: Ridge 29.79M, RF 29.78M — both also beat the GRU) | §1 |
| MAE, RMSE, WAPE, sMAPE | **Met** | §1.1-1.3 |
| Directional accuracy | **Met** | §1.1 — GRU 59.1% vs MA3 64.6%; naive 1.6% is a tie-breaking artifact, not a real score |
| Interval coverage calibrated from validation data | **Not applicable natively**; empirical wrapper reported instead | §2 |
| Error by year | **Met** | §3.1 |
| Error by country / product | **Met** | §3.2, §3.3 |
| Cold-start performance | **Not measurable on this split** (minimum 10 prior years); two proxies reported | §3.4 |
| Economic plausibility | **Met** | §4 |
| **"Demonstrably useful against baselines"** | **FAILED** | GRU is last on MAE, RMSE, WAPE, sMAPE and R² in both runs |

**The gate is failed on its central condition.**

---

## 7. Backlog — what a valid replacement programme would require

Not implemented here; recorded so the decision is not mistaken for a dead end.

1. **Fix the duplicate corridor-years at the source.** Canonicalise `product_description` per HS6 in
   the panel build so each `(importer_iso3, hs6, year)` key has exactly one row. This alone removes
   18.7% contamination from the test split and 22.1% from training. Nothing else should be attempted
   before this — every metric above is measured on partly corrupt windows.
2. **Rebuild `sanctions_present` / `ofac_entity_count` as time-varying series** or drop them from the
   feature list. Phase 3 §5.3.4: both are a 2026 snapshot back-filled onto 2000-2025, so they leak
   present-day state into year-2005 targets.
3. **Decide `WLD` explicitly.** It was in training and is out of serving. Either exclude it from both,
   or model it separately. Reporting MAE over a mixed population is what produced the misleading
   26M-kg headline.
4. **Re-run this script as the acceptance gate.** It is deterministic and takes about a minute; any
   candidate model must beat the moving average on WAPE and sMAPE in *both* runs before it ships.
5. **Ship intervals with whatever wins.** The log-residual-quantile wrapper in §2 is already
   calibrated to within 1 point of nominal at both 80% and 95% and costs nothing to compute.
6. **Build a cold-start test set** by holding out corridors whose history begins after 2015, so the
   regime the API actually serves (≥5 rows / possibly 3 calendar years) becomes measurable.

---

## 8. PRODUCTION DECISION

**Retire, replace with: the 3-year moving-average baseline, promoted from accidental fallback to
declared model.**

The Dual-Head GRU fails the pack's gate on its central condition. It is last on MAE, RMSE, WAPE,
sMAPE and R² against four baselines, on the correct chronological split, in both the as-trained and
as-served configurations; it under-forecasts demand by ~28% at the median; and its price head sits at
the hard floor on 33.0% of real test rows and is silently overwritten by a heuristic on exactly those
rows. Two independent path bugs mean it is not loaded in production today, and the accident that
replaced it — `mean(last 3 net weights) × 1.05` — is roughly **2.2× more accurate** than the model
would be. **Do not fix the path bugs to load this checkpoint; that change would degrade the product.**

Concretely:

* **Keep** the `mean(last 3 net weights)` demand baseline. Drop the arbitrary `× 1.05` uplift, or
  keep it — it is within noise (AS-SERVED WAPE 27.85 with vs 28.12 without) — but declare it either
  way instead of leaving it as an untitled fallback.
* **Change** the price baseline from `median(last 3)` to `mean(last 3)`: MAE $90.43 vs $109.69,
  WAPE 2.45% vs 2.98%. A one-line change for a ~18% price-error reduction.
* **Remove** the `os.path.exists` GRU-loading branch (`inference.py:63-92`) rather than repairing its
  path, and remove the guardrail block with it — once the model is gone, the guardrails have nothing
  to guard.
* **Keep** `gru_multi_output.pt` on disk as a research artifact with a README pointing at this report.
  Do not delete it; do not load it.
* **Attach** the empirical 80% interval from §2 to the surviving baseline.
* **Stop citing** `benchmark_comparison.csv` — per §5 it describes different weights than the shipped
  checkpoint.

### What the live API must say

Forecast responses must stop describing this output as a model forecast. Required response shape:

```json
{
  "forecast_demand_kg": 1234567.0,
  "forecast_demand_interval_80": [812000.0, 1980000.0],
  "forecast_fob_price_usd_per_kg": 2.91,
  "method": "three_year_moving_average",
  "method_label": "3-year moving average of observed exports",
  "model_version": "baseline-ma3-v1.0",
  "training_cutoff": null,
  "validated_on": "target years 2023-2024, WAPE 27.9% (demand), 2.5% (price)",
  "data_source": "un_comtrade_panel_2000_2025",
  "is_model_forecast": false
}
```

* `method_label` must be surfaced in the UI verbatim. **Never** label this output "GRU forecast",
  "AI forecast", "deep learning forecast" or "predicted by our model."
* The 80% interval must be displayed next to every point figure, not hidden behind a tooltip — the
  pack's market card requires "forecast uncertainty" as a first-class field.
* Corridors with fewer than 5 usable years of history must return
  `"status": "INSUFFICIENT_HISTORY"` with no forecast, not a number. Cold-start behaviour is
  unmeasured (§3.4) and must not be silently guessed.
* The frontend's hardcoded forecast values in `src/services/api/aiService.ts` (e.g.
  `score_forecast_demand: 95.6`) are mock data and must carry the pack's
  **`DEMO DATA — NOT LIVE COMPLIANCE`** banner whenever the API is unreachable, per
  `12_UI_COMPLIANCE_REQUIREMENTS.md`. They currently do not.
* No forecast may be presented as a guaranteed volume, guaranteed buyer, or guaranteed profit.

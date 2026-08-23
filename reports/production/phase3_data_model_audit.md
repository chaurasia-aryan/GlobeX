# Phase 3 — Data + Model Audit

Date: 2026-08-23
Scope: `D:\hehehe\GlobeX` on branch `dataset`.

Method: **runtime execution**, not static inspection. Every artifact below was loaded into a
live Python process, introspected, and given a real inference call. Reproducible scripts are
left behind (see §0.2) so this audit can be re-run.

Baseline-notebook policy (`phase2_notebook_baseline_policy.md`) was honoured: none of the six
baseline notebooks were edited, overwritten, or deleted. All new code is in a new
`backend/brain/notebooks/validation/` directory.

---

## 0. Environment & reproducibility

### 0.1 Python environment

No `venv/` or `.venv/` exists in the repo (checked; absent). System Python was used:

```
python 3.12.5  —  C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe
```

Already installed: `joblib 1.5.3`, `numpy 2.1.2`, `pandas 2.3.3`, `pyarrow 23.0.0`,
`scikit-learn 1.8.0`, `scipy 1.17.0`.

**Missing, installed for this audit** (read-only verification, not a deployment):

```
python -m pip install "xgboost>=2.0.0"                                   -> xgboost 3.4.1
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu  -> torch (CPU)
```

Nothing else from `requirements.txt` was needed to load the artifacts. Note that the artifacts
were pickled under older `scikit-learn`/`xgboost` versions than those installed; all loaded
without error, but this is a version-pinning risk for production (`requirements.txt` uses `>=`
constraints only, with no upper bounds and no lockfile).

### 0.2 Scripts written (all new files, none touch a baseline notebook)

| Script | Covers |
|---|---|
| `backend/brain/notebooks/validation/audit_trade_anomaly.py` | §1 XGBoost anomaly |
| `backend/brain/notebooks/validation/audit_trade_risk.py` | §2 Isolation Forest + §3 GRU autoencoder |
| `backend/brain/notebooks/validation/audit_partner_discovery_gru.py` | §4 Dual-Head GRU |
| `backend/brain/notebooks/validation/audit_datasets.py` | §5 all dataset audits |

Run each with `PYTHONIOENCODING=utf-8 python <path>` from the repo root. All four exit 0.

---

## 1. XGBoost trade-anomaly model

Artifacts: `backend/brain/models/trade_anomaly/` — confirmed this is the directory
`src/trade_anomaly/inference.py:_discover_models_dir()` actually resolves to.

```
       455  feature_list.json
       765  model_metadata.json
     4,136  preprocessor.joblib
        56  threshold_config.json
   254,229  xgboost_anomaly_model.joblib
```

### 1.1 Load result

Both `.joblib` files load — **but only if the repo root is on `sys.path`**. The pickles are not
plain sklearn/xgboost objects; they are custom wrapper classes:

```
preprocessor.joblib          -> src.trade_anomaly.feature_pipeline.TradeAnomalyPreprocessor
xgboost_anomaly_model.joblib -> src.trade_anomaly.models.XGBoostAnomalyModel
```

Loading from a process without the repo root importable fails with
`ModuleNotFoundError: No module named 'src'`. This is a real deployment constraint: the model
artifact is not portable independently of the source tree.

### 1.2 Feature list and order (exact, from `feature_list.json`)

20 features. `model_metadata.json["features"] == feature_list.json` → **True** (verified).

| # | Feature | Role |
|---|---|---|
| 0 | `trade_value_usd` | numeric |
| 1 | `net_weight_kg` | numeric |
| 2 | `quantity` | numeric |
| 3 | `transaction_count` | numeric |
| 4 | `unit_value_usd_per_kg` | numeric |
| 5 | `trade_growth_mom` | numeric |
| 6 | `unit_value_change_mom` | numeric |
| 7 | `quantity_growth_mom` | numeric |
| 8 | `weight_growth_mom` | numeric |
| 9 | `yoy_growth` | numeric |
| 10 | `rolling_mean_3m` | numeric |
| 11 | `rolling_std_3m` | numeric |
| 12 | `val_to_rolling_mean_ratio` | numeric |
| 13 | `val_rolling_zscore` | numeric |
| 14 | `partner_share_pct` | numeric |
| 15 | `partner_share_change_mom` | numeric |
| 16 | `new_corridor_flag` | numeric |
| 17 | `trade_flow` | **categorical** |
| 18 | `hs6` | **categorical** |
| 19 | `partner_iso3` | **categorical** |

### 1.3 Preprocessor / schema match

`TradeAnomalyPreprocessor` has **no `feature_names_in_` attribute** — it is a hand-rolled
`BaseEstimator` holding `numerical_features` (17) + `categorical_features` (3) lists, a
`SimpleImputer(median)`, a `RobustScaler(unit_variance=True)` and an
`OneHotEncoder(handle_unknown="ignore")`. Verified: those two lists concatenate to exactly the
20 names in `feature_list.json`, in the same order (17 numeric first, then 3 categorical).
`transform()` returns a dense `(n, 43)` ndarray = 17 scaled numerics + 26 one-hot columns.

**Schema match verdict: consistent**, but only by construction — there is no
`feature_names_in_` guard, so passing a DataFrame with columns in the wrong order would be
silently mis-scaled. The preprocessor selects by name (`X_df[self.numerical_features]`), so
column *order* in the caller's DataFrame is actually tolerated; missing columns raise `KeyError`.

### 1.4 Trained-category coverage — **severe limitation**

The fitted `OneHotEncoder`'s categories are the entire vocabulary the model has ever seen:

```
trade_flow   (2) : ['Export', 'Import']            <- Title case, NOT 'EXPORT'
hs6          (8) : [90411, 100630, 271019, 300490, 520512, 711319, 847130, 851712]
partner_iso3 (16): ['ARE','AUS','BRA','CHN','DEU','GBR','IDN','IND','JPN','KOR',
                    'NLD','SAU','SGP','USA','WLD','ZAF']
```

Because `handle_unknown="ignore"`, **any HS6 outside those 8 codes or any country outside those
16 is silently encoded as an all-zero block and still scored**, with no error and no coverage
warning in the model layer. Measured:

```
hs6=090111 iso=ARE : score=0.000241  onehot_nonzero=1/3
hs6=999999 iso=ZZZ : score=0.000241  onehot_nonzero=0/3
hs6=847130 iso=USA : score=0.000241  onehot_nonzero=2/3
```

The score is **identical to 6 decimal places** across all three, i.e. the categorical features
contribute essentially nothing to the model's output — it is driven entirely by the 17 numerics.

Mitigating: `src/trade_anomaly/inference.py:154` does reject corridors with `<3` historical
observations (`INSUFFICIENT_HISTORICAL_CONTEXT`), which indirectly blocks most out-of-vocabulary
requests at the service layer. The *model* itself has no such guard.

### 1.5 Threshold and its calibration

```json
threshold_config.json = {"optimal_threshold": 0.45, "f1_score": 0.9818}
model_metadata.json   = {..., "optimal_threshold": 0.45, "validation_f1": 0.9818,
                         "train_period": "<= 202406",
                         "val_period": "202407 - 202412",
                         "test_period": "202501 - 202512"}
```

Calibration method: **not documented anywhere**. The value 0.45 is paired with an F1 score, which
implies an F1-maximising sweep on the validation split, but no sweep code, no PR curve, no
per-threshold table, and no calibration plot exists in the artifacts or the modelling notebook.
There is no probability calibration (no Platt/isotonic); `scale_pos_weight=9.0` is applied during
training, which further distorts the raw probabilities away from being true likelihoods.
**Verdict: threshold is asserted, not demonstrably calibrated.**

### 1.6 Live threshold bug (verified)

`src/trade_anomaly/inference.py:217`:

```python
threshold = float(self.threshold_config.get("anomaly_threshold", 0.50))
```

`threshold_config.json` has keys `['optimal_threshold', 'f1_score']` — **`anomaly_threshold`
does not exist**. Verified output:

```
'anomaly_threshold' in threshold_config.json ? False
=> effective threshold used in production: 0.5
=> calibrated threshold on disk          : 0.45
=> MISMATCH: True
```

The lookup never matches, so the hardcoded `0.50` default always wins and the calibrated `0.45`
is silently discarded at inference time. Separately, `XGBoostAnomalyModel.predict()`
(`models.py:111`) also defaults to `threshold=0.5`, so a caller who omits the argument gets 0.5
too. **Two independent paths both bypass the calibrated threshold.**

### 1.7 Inference smoke test — PASSED

Synthetic plausible row → preprocessor → model, no errors:

```
input:  DataFrame (1, 20)
transform -> ndarray (1, 43)
predict_proba -> array([0.00024097])      # shape (1,), NOT (n,2)
score = 0.000241 ; calibrated threshold 0.45 -> flagged = False
```

Adversarial spread (confirms the model is not degenerate):

```
benign_baseline        score=0.000241  flagged=False
extreme_undervalue     score=0.000403  flagged=False
extreme_spike          score=0.999520  flagged=True
new_corridor           score=0.000236  flagged=False
all_zero_numeric       score=0.000202  flagged=False
```

Note `extreme_undervalue` (unit value $0.02/kg, −95% MoM price move, z=−4.5) scores **0.0004 and
is NOT flagged**. Under-invoicing — the canonical trade-fraud pattern — is invisible to this
model. That follows directly from the label definition in §5.1.4: only *upward* z-score spikes
and *collapses* in value are ever labelled anomalous.

### 1.8 Production inference contract (verified working call signature)

```python
import sys, joblib, json, pandas as pd
sys.path.insert(0, REPO_ROOT)   # REQUIRED: pickles reference `src.trade_anomaly.*`

D     = 'backend/brain/models/trade_anomaly'
feats = json.load(open(f'{D}/feature_list.json'))                          # 20 cols
thr   = json.load(open(f'{D}/threshold_config.json'))['optimal_threshold'] # 0.45
pre   = joblib.load(f'{D}/preprocessor.joblib')
model = joblib.load(f'{D}/xgboost_anomaly_model.joblib')

X     = pd.DataFrame([row_dict], columns=feats)   # DataFrame with named cols REQUIRED
Xt    = pre.transform(X)                          # -> ndarray (n, 43)
score = model.predict_proba(Xt)                   # 1-D positive-class array, NOT (n,2)
flag  = score >= thr                              # or model.predict(Xt, threshold=thr)
```

Value-domain constraints callers must respect:
`trade_flow ∈ {'Export','Import'}` (Title case), `hs6` ∈ the 8 trained codes,
`partner_iso3` ∈ the 16 trained ISO3 codes — anything else scores without error but is
out-of-distribution. `partner_share_pct` is a **0–1 fraction**, not a percentage (see §5.1.3).

---

## 2. Trade risk — Isolation Forest

Artifacts: `backend/brain/models/trade_risk/`. All load cleanly (plain sklearn objects, no
custom classes, no `sys.path` requirement).

```
isolation_forest.joblib -> sklearn.ensemble._iforest.IsolationForest
  n_features_in_ = 27, n_estimators = 300, contamination = 'auto',
  max_samples_ = 256, offset_ = -0.5, random_state = 42
robust_scaler.joblib    -> sklearn.preprocessing._data.RobustScaler
  n_features_in_ = 27, feature_names_in_ = None
```

`n_features_in_ == len(selected_features.json) == 27` → **True**.
`risk_model_metadata.json["selected_features"] == selected_features.json` → **True**.

### 2.1 Feature list (27, exact order)

`log_trade_value`, `log_net_weight`, `log_transaction_count`, `trade_growth_mom_calc`,
`growth_acceleration`, `tx_count_growth_mom`, `trade_val_hist_ratio`,
`trade_volatility_6m_clean`, `unit_value_usd_per_kg`, `unit_val_growth_mom`,
`unit_val_hist_dev`, `unit_val_hist_zscore`, `unit_val_volatility_6m_clean`,
`partner_market_share_latest`, `partner_share_change_mom`, `partner_share_yoy_growth`,
`gdp_growth_clean`, `inflation_rate_clean`, `tariff_rate_clean`,
`tariff_preference_margin_clean`, `sanctions_present`, `ofac_entity_count`,
`scomet_match_flag`, `days_since_last_tx`, `first_seen_flag`, `new_corridor_expansion`,
`dormant_corridor_reactivation`.

### 2.2 Training period

**Not documented in the artifact.** `risk_model_metadata.json` contains only 5 keys
(`system_name`, `version`, `selected_features`, `ensemble_formula`, `risk_cutoffs`) — no
`train_period`, no `chronological_split`, no `date_created`, no row counts. Programmatic check
for any key containing "period"/"date"/"train" → **False**. The training period is recoverable
only from the notebook (§3.3), not from the shipped artifact.

### 2.3 The scaler proves 23 of 27 features were constant in training

`RobustScaler` sets `scale_ = 1.0` when a feature's IQR is zero. Measured on the fitted scaler:

```
features with center_==0 AND scale_==1 (zero IQR => CONSTANT): 23/27

  [3] trade_growth_mom_calc            [15] partner_share_yoy_growth
  [4] growth_acceleration              [16] gdp_growth_clean
  [5] tx_count_growth_mom              [17] inflation_rate_clean
  [6] trade_val_hist_ratio             [18] tariff_rate_clean
  [7] trade_volatility_6m_clean        [19] tariff_preference_margin_clean
  [9] unit_val_growth_mom              [20] sanctions_present
 [10] unit_val_hist_dev                [21] ofac_entity_count
 [11] unit_val_hist_zscore             [22] scomet_match_flag
 [12] unit_val_volatility_6m_clean     [23] days_since_last_tx
 [13] partner_market_share_latest      [24] first_seen_flag
 [14] partner_share_change_mom         [25] new_corridor_expansion
                                       [26] dormant_corridor_reactivation

features carrying real variation: 4/27
  [0] log_trade_value        center=18.4921 scale=3.6160
  [1] log_net_weight         center=16.8656 scale=2.1962
  [2] log_transaction_count  center=2.7706  scale=1.7346
  [8] unit_value_usd_per_kg  center=7.6350  scale=70.1371
```

**The "27-feature behavioural risk model" is effectively a 4-feature model on trade size.**
Every compliance-relevant dimension the feature list advertises — `sanctions_present`,
`ofac_entity_count`, `scomet_match_flag`, tariff rates, corridor-novelty flags — was a constant
column at fit time and therefore contributes exactly zero to the model's decision function.

Corroborated by the source data (§5.2.2): 17 of the 27 named features have **no corresponding
source column at all** in `04_trade_risk.parquet`, so they could only ever have been filled with
a constant.

### 2.4 Full-vector smoke test — PASSED

```
decision_function(typical row, = scaler centers) = +0.058770   predict = 1  (inlier)
decision_function(+10*scale outlier)             = -0.225413   predict = -1 (outlier)
```

The model does separate typical from extreme inputs when given a real 27-vector.

### 2.5 The live API's 5-feature zero-padded vector — quantified mismatch

`src/api/counterparty_api.py:398-425` fills **5 of 27** slots and leaves 22 at zero:

```
[0] log_trade_value       = log1p(completed * 10000)
[1] log_net_weight        = log1p(completed * 5000)
[2] log_transaction_count = log1p(completed)
[3] trade_growth_mom_calc = trust_score            <-- WRONG QUANTITY
[4] growth_acceleration   = 1.0 - dispute_rate     <-- WRONG QUANTITY
[5..26] = 0.0
```

**22 of 27 features (81.5%) are zero-filled.** Worse than omission, slots 3 and 4 receive
*semantically wrong* quantities: `trade_growth_mom_calc` is a month-over-month growth rate but
receives a 0–1 reputation score; `growth_acceleration` is a second derivative of trade growth
but receives `1 − dispute_rate`.

Additionally, all three "real" inputs are derived from a single scalar — `completed`, the trade
count — so `log_trade_value`, `log_net_weight` and `log_transaction_count` are perfectly
collinear functions of one number, not three independent signals. `completed` itself comes from
seed data when no DB is configured.

**Does zero-padding still produce a plausible-looking-but-meaningless score? Yes.** Measured:

```
completed   trust  dispute | decision_function  predict  flagged(<-0.10)
        0    0.10     0.90 |        -0.142038       -1        True
        2    0.35     0.40 |        -0.142038       -1        True
       25    0.72     0.05 |        -0.113103       -1        True
      500    0.95     0.00 |        -0.006455       -1        False
    99999    0.99     0.00 |        -0.013139       -1        False
```

Over a 63-point sweep of the whole plausible API input domain:

```
min=-0.142038  max=+0.004959  range=0.146996  std=0.057053
fraction crossing the API's -0.10 alert cutoff : 0.571
fraction where IsolationForest.predict() = -1 (outlier) : 0.857
```

Three things are wrong here:

1. **85.7% of all reachable inputs are classified as outliers**, including a counterparty with
   500 completed trades, 0.95 trust and zero disputes. The zero-padded vector sits far outside
   the training manifold *by construction*, so nearly everything looks anomalous.
2. Rows 1 and 2 produce a **bit-identical** score (`-0.142038`) despite completely different
   trust and dispute inputs — because after RobustScaler those inputs land in a region where the
   forest cannot distinguish them. The score is not responsive to the business inputs it claims
   to reflect.
3. The output is a well-formed float in a believable range and is surfaced as
   `"data_source": "isolation_forest_model"`, so a consumer cannot tell it is meaningless.

**Verdict: the live counterparty-risk score is not a valid model output.** It is the model's
response to an out-of-distribution stub vector.

---

## 3. Trade risk — GRU Autoencoder (`gru_autoencoder.pt`)

### 3.1 Load

```
torch.load(path, map_location="cpu")  -> SUCCEEDED with default weights_only
loaded type: collections.OrderedDict
is a raw state_dict (all values Tensors)? True
```

**`weights_only=False` was NOT needed** — the checkpoint is a pure tensor `state_dict` with no
pickled Python objects, so it loaded under PyTorch's safe default. No security tradeoff was
incurred. (Had it been required, the note in `audit_trade_risk.py` documents that
`weights_only=False` executes arbitrary pickle opcodes and is acceptable only for a local,
repo-tracked, trusted artifact being audited offline.)

It is a **raw `state_dict`, not a full `nn.Module`** — no architecture, no hyperparameters, no
training metadata is embedded.

### 3.2 Tensor shapes and inferred architecture

```
encoder.weight_ih_l0     (96, 27)      decoder.weight_ih_l0  (96, 32)
encoder.weight_hh_l0     (96, 32)      decoder.weight_hh_l0  (96, 32)
encoder.bias_ih_l0       (96,)         decoder.bias_ih_l0    (96,)
encoder.bias_hh_l0       (96,)         decoder.bias_hh_l0    (96,)
fc_enc.weight            (16, 32)      output_layer.weight   (27, 32)
fc_enc.bias              (16,)         output_layer.bias     (27,)
fc_dec.weight            (32, 16)
fc_dec.bias              (32,)
```

Inferred (an `nn.GRU`'s `weight_ih_l0` is `(3*hidden, input_dim)`):

| Property | Value | Derivation |
|---|---|---|
| input feature count | **27** | `encoder.weight_ih_l0.shape[1]` |
| hidden size | **32** | `encoder.weight_ih_l0.shape[0] / 3` |
| bottleneck | **16** | `fc_enc.weight.shape[0]` |
| GRU layers | **1** (encoder), 1 (decoder) | one `weight_ih_l*` key each |
| output dim | **27** | `output_layer.weight.shape[0]` → reconstructs input, autoencoder confirmed |
| structure | encoder GRU → `fc_enc` (32→16) → `fc_dec` (16→32) → repeat over T → decoder GRU → `output_layer` (32→27) |

`input_dim == len(selected_features.json)` → **True**, so the feature order is the 27-item list
in §2.1.

**Sequence length is NOT recoverable from the checkpoint** — a GRU is length-agnostic; the same
weights run at any T. It must come from metadata or the notebook. `risk_model_metadata.json`
does not record it. The notebook does: **`seq_len = 12`**
(`trade_risk_complete.ipynb` cell 33, `seq_len = 12`), with `mode='edge'` padding at the start
of each corridor.

### 3.3 The checkpoint does not match any class in the repo

`load_state_dict` into `src/trade_anomaly/models.py:151 PyTorchGRUAutoencoder` → **FAILS**:

```
RuntimeError: Error(s) in loading state_dict for PyTorchGRUAutoencoder:
  Missing key(s): "encoder_gru.weight_ih_l0", "fc_bottleneck.weight", "fc_expand.weight", ...
```

The class uses `encoder_gru / fc_bottleneck / fc_expand / decoder_gru / fc_out`; the checkpoint
uses `encoder / fc_enc / fc_dec / decoder / output_layer`. Different module names — this class
did not produce this file.

A shape-derived reconstruction (defined in `audit_trade_risk.py`, explicitly labelled as a
reconstruction) loads it `strict=True` with `<All keys matched successfully>`, and forward passes
run at T=3, 6 and 12 producing `(B, T, 27)` reconstructions. **The weights are intact and
runnable — there is simply no class in the repository that can load them.**

### 3.4 Reconstruction-error thresholding

The notebook's approach (`trade_risk_complete.ipynb` cell 33) is **percentile-based against the
training distribution**, not an absolute error cutoff:

```python
reconstruction_errors = np.mean((all_seqs - reconstructed) ** 2, axis=(1, 2))
df['gru_percentile_score'] = df['gru_raw_score'].apply(lambda s: (train_gru_scores < s).mean())
```

then `low < p70 ≤ medium < p90 ≤ high`, ensembled as
`0.50 * if_percentile_score + 0.50 * gru_percentile_score`.

**The shipped `risk_model_metadata.json` records the percentile *rules* but not the percentile
*values*.** The notebook writes `cutoff_values: {p70, p90}` into its metadata; the shipped file
has no `cutoff_values` key at all. Without the reference training-score distribution or the p70/p90
values, the percentile scores **cannot be reproduced at inference time** — a single new
observation has no distribution to be a percentile of. This is a blocking gap for wiring the GRU
even if the class were restored.

### 3.5 Finding-change record — trade-risk artifacts do not match the baseline notebook

```
OLD FINDING (source: backend/brain/notebooks/trade_risk_complete.ipynb, cells 25/33/45/51):
  The trade-risk system is a Keras/TensorFlow GRU autoencoder over 19 selected features,
  architecture "Input(12, 19) -> GRU(64) -> Dense(32, relu) -> RepeatVector(12) -> GRU(64)
  -> TimeDistributed(Dense(19))", saved as `gru_autoencoder.keras` alongside
  `preprocessing_scaler.joblib`. Cell 25 explicitly DROPS `ofac_entity_count_clean` and
  `unit_val_hist_dev` for perfect collinearity. Cell 45 writes a metadata JSON containing
  date_created, dataset_grain, total_observations, temporal_range, chronological_split,
  a per-model block, and risk_level_thresholds.cutoff_values {p70, p90}.
  Cell 51 asserts "Leakage Audit Status: 100% Causal (0 future leaks detected)".

NEW FINDING (source: backend/brain/notebooks/validation/audit_trade_risk.py, this validation):
  The artifact shipped at backend/brain/models/trade_risk/ is a PyTorch state_dict
  (`gru_autoencoder.pt`, NOT `.keras`) with input_dim=27 (NOT 19), hidden=32 (NOT 64),
  bottleneck=16 (NOT 32), and module names encoder/fc_enc/fc_dec/decoder/output_layer that
  match no class anywhere in the repository. The companion scaler is `robust_scaler.joblib`
  (NOT `preprocessing_scaler.joblib`). `selected_features.json` lists 27 features INCLUDING
  `ofac_entity_count` and `unit_val_hist_dev` — the two the notebook says it dropped. The
  shipped `risk_model_metadata.json` has only 5 keys and contains none of the metadata cell 45
  writes (no date_created, no chronological_split, no cutoff_values). The fitted RobustScaler
  shows 23 of the 27 features had zero IQR, i.e. were constant at fit time.

METHODOLOGICAL REASON:
  The notebook was read as source text and the artifacts were loaded and introspected at
  runtime; the comparison is between what the notebook's code writes and what is actually on
  disk. A framework difference (Keras vs PyTorch), a feature-count difference (19 vs 27), an
  inverted feature-selection decision (dropped features present), and a metadata schema
  difference are each independently sufficient to establish different provenance. Runtime
  introspection of a saved artifact is strictly stronger evidence about that artifact than the
  notebook that claims to produce it.

FINAL ACCEPTED CONCLUSION:
  The shipped trade-risk artifacts were NOT produced by the baseline notebook
  `trade_risk_complete.ipynb`. They come from an undocumented pipeline that is not in the
  repository. The notebook remains valid baseline evidence for a DIFFERENT (Keras, 19-feature)
  model that is not on disk. Consequently the notebook's training period, its architecture
  description, its cutoff values, and its "100% Causal / 0 future leaks" leakage assertion
  CANNOT be transferred to the shipped artifacts — those artifacts have no verified training
  period, no verified leakage audit, and no reproducible scoring thresholds. The Isolation
  Forest in the same directory is subject to the same provenance doubt.
```

Note: `trade_risk_complete.ipynb` and `trade_risk_complete - Copy.ipynb` were verified
**byte-identical in source** (concatenated-source SHA1 `1e51f1ca487c` for both, 52 cells each).
The duplicate carries no additional information.

---

## 4. Partner-discovery Dual-Head GRU (`gru_multi_output.pt`)

Artifacts: `backend/brain/brain_prev/models/partner_discovery/forecasting/`.

The duplicate copy under `.../models/partner_forecasting/` was verified **byte-identical** for
all three files (SHA-256 prefixes `25a1b1d5…`, `eb0a0250…`, `5aa76c1b…` match exactly). It is a
redundant copy, not a variant.

### 4.1 Load via the real class — PASSED

Loaded with `PartnerForecastingPipeline.load()` from `src/partner_discovery/forecasting.py`
(imported, not reimplemented):

```
model = GRUMultiOutputForecaster
input_dim=12  hidden_dim=64  num_layers=2
feature_means set? True | feature_stds set? True
total parameters: 44,162
```

Checkpoint keys confirm the dual-head architecture:

```
gru.weight_ih_l0    (192, 12)     demand_head.0.weight  (32, 64)
gru.weight_hh_l0    (192, 64)     demand_head.3.weight  (1, 32)
gru.weight_ih_l1    (192, 64)     price_head.0.weight   (32, 64)
gru.weight_hh_l1    (192, 64)     price_head.3.weight   (1, 32)
```

2-layer shared GRU encoder (hidden 64) → two independent `Linear(64,32) → ReLU → Dropout →
Linear(32,1)` heads.

### 4.2 Input feature order and sequence length

`metadata.joblib` stores `feature_names` explicitly — **12 features, exact model input order**:

| # | Feature | Source column |
|---|---|---|
| 0 | `log_export_value` | `log1p(export_value_usd)` |
| 1 | `log_export_net_weight` | `log1p(export_net_weight_kg)` |
| 2 | `fob_unit_value` | `fob_unit_value_usd_per_kg` |
| 3 | `destination_market_share` | `destination_market_share_pct` |
| 4 | `trade_growth_yoy` | computed, `shift(1)`, clipped [−1, 5] |
| 5 | `log_gdp` | `log1p(destination_gdp)` |
| 6 | `log_population` | `log1p(destination_population)` |
| 7 | `applied_tariff_rate` | `destination_applied_tariff_rate` |
| 8 | `rta_active` | `rta_exists` |
| 9 | `log_locode_count` | `log1p(destination_locode_count)` |
| 10 | `log_active_buyers` | `log1p(gleif_active_buyer_count)` |
| 11 | `sanctions_present` | `sanctions_present > 0` |

`checkpoint input_dim == len(feature_columns)` → **True**.

**Sequence length = 5** (`PartnerFeatureEngineer.sequence_length = 5`, `features.py:11`;
confirmed by the training notebook's `PartnerFeatureEngineer(sequence_length=5)`). Data is
**annual**, so a sequence is 5 years of history predicting year 6.

### 4.3 Scaler

Not an sklearn object — a plain z-score dict fitted in `PartnerForecastingPipeline.fit_scaler()`
(`forecasting.py:88-91`) on the **flattened training sequence tensor** (`train_X.reshape(-1, 12)`),
i.e. fitted on the train split only, correctly excluding val/test.

```
feature_means = [16.4885, 13.6661, 3611.79, 1.7925, 0.1348, 26.9378,
                 17.5784, 7.5006, 0.1979, 5.7052, 5.9065, 0.0764]
feature_stds  = [ 3.3617,  1.7692, 13578.4, 11.9756, 0.4736,  1.5136,
                  1.5248, 4.3997, 0.3983, 1.3602, 1.4627, 0.2657]
```

`gru_scaler_metadata.joblib` and `metadata.joblib` hold the same means/stds (float32 rounding
aside); `metadata.joblib` additionally holds `feature_names`, `random_seed: 42`, and
`timestamp: 2026-08-22T18:42:02`.

### 4.4 Target transformation

| Head | Trained on | Returned as | Can go negative? |
|---|---|---|---|
| demand | `log1p(export_net_weight_kg)` (`forecasting.py:115`) | `expm1(max(0, log_d))` → **kg** (`forecasting.py:188`) | **No** — floored at 0 in log space, so min = `expm1(0)` = 0.0 kg |
| price | **raw** `fob_unit_value_usd_per_kg`, no log (`forecasting.py:120`) | `max(0.01, p)` → **USD/kg** (`forecasting.py:189`) | **No** — `torch.relu` in the head (`forecasting.py:70`) plus a 0.01 floor |

So demand **is** log-transformed and exponentiated back; price **is not**. Loss is
`0.60 * SmoothL1(log_demand) + 0.40 * SmoothL1(price)`.

### 4.5 Training period

`create_sequence_dataset` assigns by **target year** (`features.py:151-165`), and the training
notebook (`brain_prev/notebooks/partner_discovery_forecasting_model.ipynb` cell 5) calls it with
`split_train_end=2020, split_val_end=2022, split_test_end=2024`:

```
train : target_year <= 2020
val   : 2021 - 2022
test  : 2023 - 2024
```

**Strictly chronological, no shuffling — confirmed from source.** Underlying data spans
2000–2025; **year 2025 (1,988 rows) falls outside all three splits and is unused.**

The notebook was saved **without stored outputs**, so no reported metrics could be compared
against. However `benchmark_comparison.csv` ships alongside the artifact.

### 4.6 The shipped benchmark says the GRU is the worst of five models

`backend/brain/brain_prev/models/partner_discovery/forecasting/benchmark_comparison.csv`:

| Model | Demand MAE (kg) | Demand MAPE % | Demand R² | Price MAPE % | Composite Error |
|---|---|---|---|---|---|
| Moving Average (3-Year) | 25,949,070 | 29.42 | **0.9096** | 3.33 | **0.1562** |
| Naive (Last Value) | 26,932,374 | 29.45 | 0.8838 | 3.31 | 0.1666 |
| Ridge Regression | 29,786,274 | 26.75 | 0.8949 | 5.53 | 0.1681 |
| Random Forest | 29,775,061 | 26.34 | 0.8883 | 14.36 | 0.1709 |
| **Dual-Head GRU** | **75,187,352** | **54.49** | **0.3991** | **33.06** | **0.4503** |

The GRU has **~2.9× the demand MAE** of a 3-year moving average, less than half the R²
(0.399 vs 0.910), and ~2.9× the composite error. **It is the worst model in its own benchmark
by every demand metric.** A trivial moving-average baseline dominates it.

### 4.7 Inference smoke test — runs, but the price head is broken

Synthetic `(1, 5, 12)` sequence for a plausible corridor (~$4.4M/yr, ~1.5M kg, $2.90/kg):

```
input shape: (1, 5, 12)
forecast demand = 3,574,964.50 kg
forecast price  = 0.0100 USD/kg        <-- AT THE FLOOR
implied trade value = 35,749.64 USD
(input last step actual: 1,657,756 kg @ $2.90/kg = $4,807,494)
```

The demand output is dimensionally sane (millions of kg, ~2.2× the last observed year — high but
not absurd). **The price output is `0.01`, the hard floor**, meaning the ReLU head saturated to
zero. The implied trade value is $35.7K against an actual ~$4.8M — off by a factor of ~134.

Sweep over 200 randomised plausible corridors:

```
demand_kg : min=216,507  p50=7,771,322  max=222,196,848  n_negative=0  n_zero=0
price     : min=0.0100   p50=9.3669     max=71.0900      n_at_floor(0.01)=67
```

**Units are sane and nothing goes negative** (the architectural constraints in §4.4 hold). But
the price head collapses to the floor on **33.5% of inputs**.

### 4.8 Preprocessing: no mismatch beyond the path bug

Checked specifically for a scaling defect in `inference.py`'s fallback chain:

```
inference.py:80-82   seq_x = sub[engineer.feature_columns].values[-5:]
                     inp   = np.expand_dims(seq_x, axis=0)
                     pred  = gru_pipeline.predict(inp)
```

`predict()` calls `transform_x()` internally (`forecasting.py:184`), so the z-score
standardisation **is** applied exactly once. **No double-scaling, no missing scaling, correct
feature order** (it indexes by `engineer.feature_columns`, the same list the scaler was fitted
on). The preprocessing path is correct.

What is *not* correct is the guardrail layer. `inference.py:86-92` overrides the model:

```python
if fc_p < 0.10 or fc_p > 100000.0 or np.isnan(fc_p): fc_p = hist_avg_p
if fc_d < 100.0 or fc_d > hist_avg_d * 50.0 or np.isnan(fc_d): fc_d = hist_avg_d * 1.05
```

Applied to the 200-corridor sweep:

```
price overridden  : 67/200 (33.5%)
demand overridden : 4/200 (2.0%)
```

So even if the model were correctly wired, **the price forecast would be silently replaced by
the historical median on a third of all corridors**, and the response would still report it as a
GRU forecast. The code comment at line 86 ("Ground GRU price ... when model output is
uncalibrated (< $0.10)") shows the authors knew the price head was broken and papered over it.

### 4.9 Wiring defects confirmed on disk

```
exists=False  D:\hehehe\GlobeX\backend\brain_temporary\models\partner_discovery\forecasting
              <- src/api/partner_discovery_api.py:32-33 points here
exists=False  D:\hehehe\GlobeX\models\partner_forecasting
              <- src/partner_discovery/inference.py:19 default points here
exists=True   D:\hehehe\GlobeX\backend\brain\brain_prev\models\partner_discovery\forecasting
              <- the artifact actually lives here
```

**Two independent path bugs**, not one. Both the API's `_MODEL_DIR` and the library function's
default `model_dir` point at non-existent directories, so `os.path.exists()` fails silently and
the momentum heuristic (`fc_d = hist_avg_d * 1.05; fc_p = hist_avg_p`) runs instead. Phase 1's
finding is confirmed and extended.

---

## 5. Dataset audits

### 5.1 Trade-anomaly dataset

`backend/brain/processed/trade_anomaly/02_trade_anomaly_featured.parquet` — **12,288 × 31**.

#### 5.1.1 Schema, duplicates, temporal coverage

- **Missingness: 0.000% on every one of the 31 columns.** No nulls anywhere.
- **Full-row duplicates: 0.** Duplicates on the natural key
  `(period, reporter_iso3, partner_iso3, hs6, trade_flow)`: **0**.
- **Temporal range: 202201 – 202512, 48 distinct months, 0 missing months** (48 expected, 48
  present). No gaps.
- **Grain: 256 corridors × 48 months = 12,288.** Perfectly balanced panel.
- `reporter_iso3` = `['IND']` only; `trade_flow` = `['Export', 'Import']`;
  8 HS6 codes; 16 partner ISO3 codes.

#### 5.1.2 Data-integrity issues

- `partner_iso3` includes **`'IND'`** (India as its own trade partner) and **`'WLD'`** (the
  "World" aggregate). Both are in the *model's trained vocabulary*. The WLD rows double-count
  every bilateral row; the IND rows are self-trade. Neither is a real corridor.
- `mirror_ratio` (nunique=1, constant 1.0), `mirror_difference` (100% zero), and
  `mirror_missing_flag` (100% zero) are **hardcoded placeholders** —
  `build_canonical_parquet_v2.py:359-362` literally assigns `mirror_ratio = 1.0000`,
  `mirror_difference = 0.00`, `mirror_missing_flag = 0`. There is **no mirror-trade
  (exporter-vs-importer customs) reconciliation** in this dataset despite the columns existing.
- `transaction_count` has only **4 distinct values** across 12,288 rows.

#### 5.1.3 Unit consistency

- `quantity_unit` = `'kg'` for 100% of rows — single unit, no mixing.
- **`quantity == net_weight_kg` on 12,288/12,288 rows (100.0%).** The two are perfectly
  collinear; `quantity` carries zero additional information yet both are model features
  (indices 1 and 2). The baseline EDA notebook already noted this
  (`trade_anomaly_eda.ipynb` cell 38: *"`quantity` and `net_weight_kg` exhibit perfect
  collinearity (1.00 correlation)"*) — it was observed and then not acted on.
- No currency column exists; all value columns are `*_usd`. **No mixed-currency risk.**
- **Naming/unit inconsistency:** `partner_share_pct` ranges `0.000267 .. 0.197083` — it is a
  **0–1 fraction**, not a percentage, despite the `_pct` suffix
  (`feature_pipeline.py:135-139` computes `value / total`). Meanwhile the partner-discovery
  dataset's `destination_market_share_pct` ranges `0.0 .. 98.23` — a genuine **0–100 percentage**.
  **The two subsystems use the same `_pct` suffix for different scales.** Note also that
  `build_canonical_parquet_v2.py:352` multiplies by 100 while `feature_pipeline.py` does not —
  the training-data column and the live-inference recomputation of the same feature are on
  **different scales**, a latent train/serve skew.
- `unit_value_usd_per_kg` spans `0.78 .. 53,999.22` — a 69,000× range across 8 HS6 codes
  (gold jewellery vs rice), expected but worth noting for any global outlier rule.

#### 5.1.4 Labels — leakage, verified empirically

```
label_source : {'RULE_BASED_HEURISTIC': 12288}    (100%, single value)
anomaly_flag : {0: 11143, 1: 1145}                 positive rate = 0.0932
anomaly_type : NORMAL 11143 | VOLUME_SURGE 949 | UNEXPECTED_COLLAPSE 196
```

These are **not verified fraud outcomes.** They are generated by
`backend/brain/brain_prev/data_pipeline/scripts/build_canonical_parquet_v2.py:363-378`:

```python
z_score = (trade_value_usd - rolling_mean_3m) / rolling_std_3m
conditions = [ z_score > 3.0,
               unit_value_change_mom > 2.5,
               trade_growth_mom < -0.90 ]
choices    = [ 'VOLUME_SURGE', 'PRICE_SPIKE', 'UNEXPECTED_COLLAPSE' ]
anomaly_type = np.select(conditions, choices, default='NORMAL')
anomaly_flag = np.where(anomaly_type != 'NORMAL', 1, 0)
```

**All three quantities in the label rule are also model input features:**

| Label-rule quantity | Model feature |
|---|---|
| `z_score` | `feature_list.json[13]` = `val_rolling_zscore` |
| `unit_value_change_mom` | `feature_list.json[6]` = `unit_value_change_mom` |
| `trade_growth_mom` | `feature_list.json[5]` = `trade_growth_mom` |

**Empirical test — reproducing the label from model features alone:**

```
rule = (val_rolling_zscore > 3.0) | (unit_value_change_mom > 2.5) | (trade_growth_mom < -0.90)

rows where rule == anomaly_flag : 12288/12288 (100.0000%)
false positives (rule=1,label=0): 0
false negatives (rule=0,label=1): 0
F1 of this 3-threshold rule vs the label: 1.0000
accuracy: 1.0000
```

**The target is a closed-form Boolean function of three of the model's own inputs, reproduced
exactly, with zero errors, on all 12,288 rows.** The XGBoost classifier is not detecting
anomalies — it is re-deriving a three-threshold rule from the very columns that rule was computed
on. This is total, unambiguous target leakage, and it fully explains the reported
`validation_f1 = 0.9818`.

Per-condition contribution:

```
val_rolling_zscore > 3.0         fires on 949 rows;  P(label=1|cond)=1.0000
unit_value_change_mom > 2.5      fires on   0 rows;  (never fires)
trade_growth_mom < -0.90         fires on 196 rows;  P(label=1|cond)=1.0000
```

(`PRICE_SPIKE` never appears in `anomaly_type`, consistent with its condition firing on 0 rows.)

Single-feature AUC against the label corroborates: `val_rolling_zscore` alone achieves
**AUC 0.8566** with no model at all.

**A distinct second labelling script exists and is NOT the one used here.**
`build_anomaly_labels.py` implements 5 different rules plus an 8% random synthetic-perturbation
relabelling; its output vocabulary (`sudden_trade_spike`, `mirror_discrepancy`,
`unit_value_outlier`, `quantity_value_mismatch`, `partner_shift`,
`SYNTHETIC_CONTROLLED_PERTURBATION`) appears **nowhere** in the shipped dataset. Its rules were
tested against the shipped labels and do not reproduce them (e.g. its Rule 1 matches 656 rows
with `P(label=1|rule) = 0.2317`). Two competing label generators exist in the repo; only
`build_canonical_parquet_v2.py` produced the shipped data. Worth noting that
`build_anomaly_labels.py`'s own docstring (lines 36-37) states: *"These are statistical
discrepancy flags, NOT criminal fraud ground truth."*

#### 5.1.5 Split chronology — CORRECT

```
train  n=7680  period 202201 .. 202406  positive_rate=0.0874
val    n=1536  period 202407 .. 202412  positive_rate=0.1022
test   n=3072  period 202501 .. 202512  positive_rate=0.1032

strictly chronological (train_max < val_min < val_max < test_min)? True
row-key overlap: train∩val=0  val∩test=0  train∩test=0
total across splits = 12288 = featured rows (exact partition, no loss, no duplication)
```

**Matches `model_metadata.json` exactly** (`train <=202406`, `val 202407-202412`,
`test 202501-202512`). This is the one thing about the anomaly model that is fully correct and
verified. Class balance is stable across splits (8.7% / 10.2% / 10.3%).

### 5.2 Trade-risk dataset

`backend/brain/brain_prev/data_pipeline/data/processed/04_trade_risk.parquet` — **6,144 × 37**.

#### 5.2.1 Schema, duplicates, temporal, missingness

- **Full-row duplicates: 0.** Duplicates on `(period, reporter_iso3, partner_iso3, hs6)`: **0**.
- **Temporal: 202201 – 202512, 48 distinct months, 0 missing.** Grain = 128 corridors × 48
  months = 6,144. Balanced panel.
- **Missingness (non-zero columns only):**

| Column | Missing % |
|---|---|
| `rta_exists`, `rta_name`, `rta_status` | **12.500** |
| `gdp_usd`, `gdp_per_capita_usd`, `gdp_growth_pct`, `inflation_pct`, `population`, `trade_pct_gdp`, `tariff_rate`, `tariff_type`, `tariff_scope` | **6.250** |
| `partner_name`, `partner_iso2`, `region_name` | **6.250** |
| `trade_volatility_6m`, `unit_value_volatility_6m` | **4.167** |
| `trade_growth_mom` | **2.083** |

The 6.25% blocks are exactly 1/16 of rows — one partner (almost certainly the `WLD` aggregate)
has no country-level macro data. The 12.5% is 2/16.

#### 5.2.2 17 of the 27 model features have no source column

Cross-referencing `selected_features.json` against this parquet's columns:

```
directly present (3) : unit_value_usd_per_kg, sanctions_present, ofac_entity_count

derivable from a same-named base (7) : log_trade_value, log_net_weight,
  log_transaction_count, trade_growth_mom_calc, trade_volatility_6m_clean,
  gdp_growth_clean, tariff_rate_clean

NO corresponding source column at all (17) : growth_acceleration, tx_count_growth_mom,
  trade_val_hist_ratio, unit_val_growth_mom, unit_val_hist_dev, unit_val_hist_zscore,
  unit_val_volatility_6m_clean, partner_market_share_latest, partner_share_change_mom,
  partner_share_yoy_growth, inflation_rate_clean, tariff_preference_margin_clean,
  scomet_match_flag, days_since_last_tx, first_seen_flag, new_corridor_expansion,
  dormant_corridor_reactivation
```

This independently corroborates §2.3: those 17 features **could not have been computed from this
dataset**, which is exactly why 23 of 27 scaler entries show zero IQR. (`scomet_match_flag` is
absent here but present in the partner-discovery dataset — the risk feature list appears to have
been copied from a different, richer source.)

#### 5.2.3 Unit consistency

- No `quantity_unit` column at all — units are undeclared. `quantity == net_weight_kg` on
  **100%** of rows, so quantity is presumably kg, but this is inferred, not stated.
- `tariff_rate` spans `0.0 .. 15.0` — **percent scale**, not 0–1. `tariff_type` mixes
  `MFN_APPLIED` (4,608) and `PREFERENTIAL` (1,152) in a single column with no separate
  preference-margin column, so a consumer cannot tell which basis a given rate is on without
  reading `tariff_type`.
- `gdp_usd` spans `3.892e11 .. 2.285e13` — plain USD, consistent magnitude, no billions/units mixing.
- `gdp_growth_pct` has only **17 distinct values** across 6,144 rows and `inflation_pct` likewise
  17 — these are annual country constants broadcast across months, not monthly series.

#### 5.2.4 Leakage and split

This is an **unsupervised** system — there is no label column, so classical target leakage does
not apply. Verified: zero columns matching `*anomaly*` / `*risk*` / `*label*` / `*flag*` other
than the input flags themselves.

Split is documented **only in the notebook** (`trade_risk_complete.ipynb` cells 33/45), not in
the shipped `risk_model_metadata.json`:

```
train 202201-202406 | val 202407-202412 | test 202501-202512   -> chronological
actual row counts: <=202406: 3840 | 202407-202412: 768 | >=202501: 1536
```

The split **is** chronological. But per §3.5 the shipped artifacts were not produced by that
notebook, so **this split cannot be attributed to the shipped model.** The shipped artifacts have
**no verified training period.**

### 5.3 Partner-discovery dataset

`backend/brain/processed/01_partner_discovery_india_as_exporter.parquet` — **48,445 × 51**.

#### 5.3.1 Schema, temporal, missingness

- **Missingness: 0.0% on all 51 columns.**
- **Full-row duplicates: 0.**
- **Temporal: 2000 – 2025, 26 distinct years, no missing years.** Row counts step from 1,664/yr
  (2000-2004) to 1,988/yr (2021-2025) — coverage expands over time, so earlier years have fewer
  corridors. Not a gap, but the panel is unbalanced.
- 53 importer countries, 33 HS6 codes, exporter always `IND`.
- **`WLD` present as an importer: 1,040 rows.** `PartnerDataLoader.load_data(exclude_wld=True)`
  is called by `inference.py:43`, so the live path excludes it — but the *training* notebook
  (cell 3) calls `load_data(..., exclude_wld=False)`, so **the World aggregate WAS included in
  training**, double-counting every bilateral flow.

#### 5.3.2 Duplicate corridor-years — 24.9% of keys, and it corrupts the sequences

```
duplicates on key (importer_iso3, hs6, year): 9,646
rows per key: 1 -> 29,153 keys | 2 -> 9,646 keys   (24.9% of corridor-years doubled)
```

**Cause:** 7 of the 33 HS6 codes carry **two `product_description` spellings for the same code**:

```
100630: '...glazed (Basmati Rice)'  vs  '...glazed (Basmati)'
271019: 'Medium oils...minerals'    vs  'Medium oils...minerals (Diesel/Gas Oil)'
300490: 'Medicaments...uses'        vs  'Medicaments...uses (Formulations)'
520512: 'Single cotton yarn, measuring...'  vs  'Single cotton yarn, of uncombed fibres, measuring...'
711319: '...other than silver'      vs  '...other than silver (Gold Jewellery)'
847130: '...not > 10 kg (Laptops & Tablets)'  vs  '...weighing not more than 10 kg (Laptops)'
851712: 'Telephones for cellular networks / smartphones'  vs  'Telephones for cellular networks or for other wireless networks'
```

Example — key `('AGO', 100630, 2000)`:

```
product_description                                          export_value_usd  net_weight_kg  unit_value
'...glazed (Basmati Rice)'                                        66,404.26      49,279.6       1.3475
'...glazed (Basmati)'                                             62,782.21      49,279.6       1.2740
```

**Same net weight, different export value** — two records of the same physical trade, not two
distinct trades.

**Impact on the GRU, quantified.** `create_sequence_dataset` (`features.py:129`) groups by
`(importer_iso3, hs6)`, sorts by `year`, then slides a window of **5 consecutive rows** and takes
row `i+5` as the target. For a corridor with 2 rows per year, 5 rows span only ~2.5 calendar
years and the "next year" target is frequently a duplicate of a year already inside the window.

```
corridors with duplicated years : 371/1,617 (22.9%)
rows in those corridors         : 19,292/48,445 (39.8%)

sequence windows built                                          : 40,360
windows whose TARGET YEAR already appears inside the INPUT window: 8,904 (22.1%)
```

**22.1% of all training windows ask the model to predict a value from a calendar year it can
already see in its input.** That is direct target leakage in the forecasting task — and it
inflates apparent training performance while teaching the model to copy rather than forecast,
which is consistent with the GRU's poor *held-out* benchmark in §4.6.

Corridor row-count distribution confirms the mechanism:
`26 rows → 922 corridors` (clean, 1/yr), `52 rows → 371 corridors` (doubled), `16 rows → 323`,
`13 rows → 1`.

#### 5.3.3 Unit consistency — clean

- `currency_code` (46 distinct: EUR, USD, AUD, TRY, AED, GBP, CNY, IDR, JPY, ZAR, …) is the
  **destination's local currency, metadata only**. All value columns are `*_usd`.
  **No mixed-currency value column — verified.**
- Weight is `export_net_weight_kg`, kg throughout, range `1.767e4 .. 7.952e9`.
- **Internal consistency check:** `export_value_usd == export_net_weight_kg *
  fob_unit_value_usd_per_kg` — median relative error **0.000000**, **100.00% of rows within 1%**.
  The value/weight/unit-price triple is fully self-consistent.
- `destination_market_share_pct` is a genuine **0–100 percentage** (`0.0 .. 98.23`) — contrast
  with the trade-anomaly dataset's 0–1 fraction under the same suffix (see §5.1.3).
- `destination_applied_tariff_rate`: `0.0 .. 12.0`, percent scale.

#### 5.3.4 Leakage check

No column names contain `next` / `future` / `lead` / `forward` — **no explicitly
forward-looking columns.**

The temporal-feature construction is sound: `trade_growth_yoy` uses `groupby.shift(1)`, rolling
stats use `rolling(3, min_periods=1)` on past values only, and sequence inputs are years
`t..t+4` with the target at `t+5`.

**However — static-attribute back-fill leakage.** Testing whether each feature actually varies
over time within a country:

```
destination_locode_count   varies for 27/53 countries
destination_port_count     varies for 26/53 countries
gleif_active_buyer_count   varies for 52/53 countries
sanctions_present          varies for  0/53 countries   <-- CONSTANT PER COUNTRY
ofac_entity_count          varies for  0/53 countries   <-- CONSTANT PER COUNTRY
scomet_match_flag          varies for 53/53 countries
```

**`sanctions_present` (model feature index 11) and `ofac_entity_count` are perfectly constant
per country across all 26 years.** They are a present-day (2026) snapshot back-filled onto
2000–2025. For every target year before the snapshot date this is **lookahead leakage**: the
model is told a country's 2026 sanctions status when forecasting its year-2005 demand. It is
also simply wrong as history — sanctions regimes changed materially over 2000–2025.

The same concern applies to `destination_locode_count` / `destination_port_count`, which are
static for roughly half the countries.

#### 5.3.5 Split chronology — CORRECT

Defined in code (`features.py:106-111` defaults, called explicitly by the notebook), assigned by
**target year**:

```
train : target_year <= 2020
val   : 2021 - 2022
test  : 2023 - 2024
```

**Strictly chronological, no shuffling — confirmed from source.** Caveats: (a) year 2025 (1,988
rows) is in the data but outside all three splits, unused; (b) corridors with fewer than 6 yearly
observations are silently dropped by `features.py:130` — measured **0 of 1,617 corridors dropped**,
so this is not currently losing data.

---

## 6. Finding-change records

Two records are required. The first is in §3.5 (trade-risk artifacts vs `trade_risk_complete.ipynb`).
The second follows.

```
OLD FINDING (source: backend/brain/notebooks/trade_anomaly_eda.ipynb, cell 38 "Key Takeaways
from EDA"; and backend/brain/models/trade_anomaly/model_metadata.json):
  "Causal rolling features must be computed out-of-time (lagged [t-3, t-1]) to avoid
  forward-looking target leakage." The EDA presents the causal/lagged construction of the
  rolling window as the leakage control for this dataset, and the shipped model metadata
  reports validation_f1 = 0.9818 as the headline quality figure for the resulting classifier.

NEW FINDING (source: backend/brain/notebooks/validation/audit_datasets.py §A4, this validation):
  The lagged rolling construction is indeed causal — that specific control is correctly
  implemented and is not the problem. But the labels themselves were generated from three
  columns that are also model input features
  (build_canonical_parquet_v2.py:363-378: z_score > 3.0 | unit_value_change_mom > 2.5 |
  trade_growth_mom < -0.90 -> val_rolling_zscore, unit_value_change_mom, trade_growth_mom).
  Re-applying that Boolean rule to the model's own feature columns reproduces anomaly_flag on
  12,288 of 12,288 rows: F1 = 1.0000, accuracy = 1.0000, zero false positives, zero false
  negatives. val_rolling_zscore alone reaches AUC 0.8566 against the label with no model at all.

METHODOLOGICAL REASON:
  The EDA checked for TEMPORAL leakage (does a feature see the future?) and correctly found
  none. It did not check for DEFINITIONAL leakage (is the target a deterministic function of
  the features?). These are independent failure modes and the second is not detectable by
  inspecting the time-alignment of the feature pipeline; it is only visible by comparing the
  label-generation source against the feature list, then testing the reconstruction empirically.
  A 100% exact reconstruction over the full dataset is decisive: no sampling, no model, no
  threshold tuning is involved.

FINAL ACCEPTED CONCLUSION:
  Both findings stand, on different axes. The causal-rolling-feature control is correct and
  should be retained. The reported validation_f1 = 0.9818 is NOT evidence of anomaly-detection
  skill and must not be cited as such: it measures the classifier's ability to recover a
  three-threshold rule from the three columns that rule was computed on. Any downstream claim
  of anomaly-detection performance for this model is unsupported until the model is retrained
  against labels that are independent of its input features.
```

---

## 7. Summary table

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | Anomaly labels are an exact Boolean function of 3 model features (F1=1.0000 reconstruction on 12,288/12,288 rows) | **Disqualifying** | §5.1.4 |
| 2 | Trade-risk model: 23 of 27 features were constant at fit time; effectively a 4-feature size model | **Disqualifying** | §2.3, §5.2.2 |
| 3 | Live counterparty risk score: 22/27 features zero-filled, 2 slots semantically wrong, 85.7% of reachable inputs classified outlier | **Disqualifying** | §2.5 |
| 4 | Partner-discovery GRU is the worst of 5 models in its own shipped benchmark (2.9× the MAE of a moving average, R² 0.399 vs 0.910) | **Disqualifying** | §4.6 |
| 5 | Partner-discovery: 22.1% of training windows have the target year inside the input window (duplicate corridor-years) | **Disqualifying** | §5.3.2 |
| 6 | Trade-risk artifacts have no class in the repo that loads them; different framework/shape than the baseline notebook | High | §3.3, §3.5 |
| 7 | GRU price head saturates to the 0.01 floor on 33.5% of inputs; overridden by heuristic in production | High | §4.7, §4.8 |
| 8 | `sanctions_present`/`ofac_entity_count` are a present-day snapshot back-filled onto 2000-2025 (lookahead leakage) | High | §5.3.4 |
| 9 | Live anomaly service reads a threshold key that does not exist → always uses 0.50, never the calibrated 0.45 | High | §1.6 |
| 10 | GRU autoencoder percentile cutoffs (p70/p90) not saved → scores not reproducible at inference | High | §3.4 |
| 11 | Anomaly model trained on only 8 HS6 codes / 16 countries; unseen categories silently score without warning | High | §1.4 |
| 12 | Two path bugs (not one) prevent the partner-discovery GRU from ever loading | High | §4.9 |
| 13 | `partner_share_pct` is 0-1 in one subsystem, 0-100 in another; training vs live recomputation differ by 100× | Medium | §5.1.3 |
| 14 | `quantity` == `net_weight_kg` on 100% of rows but both are model features | Medium | §5.1.3 |
| 15 | Mirror-trade columns are hardcoded constants — no reconciliation exists | Medium | §5.1.2 |
| 16 | `WLD` aggregate and `IND` self-trade included in anomaly model's trained vocabulary; `WLD` included in GRU training | Medium | §5.1.2, §5.3.1 |
| 17 | Model pickles require repo root on `sys.path` (custom `src.*` classes) — not portable artifacts | Medium | §1.1 |
| 18 | Threshold 0.45 has no documented calibration method; no probability calibration applied | Medium | §1.5 |
| 19 | Under-invoicing scores 0.0004 and is not flagged — the model cannot detect the canonical fraud pattern | Medium | §1.7 |
| 20 | Trade-risk artifacts have no recorded training period anywhere in the shipped metadata | Medium | §2.2 |

**All three split definitions that could be verified are correctly chronological** (§5.1.5,
§5.2.4, §5.3.5). That is the strongest positive finding in this phase.

---

## 8. Things this audit did not determine

- **Whether the shipped trade-risk artifacts have any valid training period.** The producing
  pipeline is not in the repository. Unverified — would require locating the pipeline that
  produced `gru_autoencoder.pt` / `isolation_forest.joblib` / `robust_scaler.joblib`.
- **The GRU autoencoder's training sequence length.** Not recoverable from the state_dict; the
  notebook says 12, but the notebook did not produce this artifact (§3.5). Unverified.
- **The p70/p90 reconstruction-error cutoffs** for the risk ensemble. Not saved. Unverified —
  would require re-running the training pipeline over the training split.
- **Whether the partner-discovery GRU's benchmark numbers are reproducible.** The training
  notebook was saved without stored outputs, so `benchmark_comparison.csv` is the only record.
  Not independently re-run here (would require a full retrain).
- **Actual walk-forward / backtest performance** of any model. Out of scope for Phase 3; the
  benchmark CSV is reported as shipped, not reproduced.
- **Whether the anomaly model's 0.45 threshold was derived by an F1 sweep.** Implied by the
  paired `f1_score` field but no sweep artifact exists. Unverified.

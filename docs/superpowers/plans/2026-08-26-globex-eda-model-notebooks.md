# GlobeX ML Notebook Rebuild — Implementation Plan

> **Sub-skill:** superpowers:executing-plans (inline, user said go)

**Goal:** Fresh human-style EDA + model notebooks for 4 GlobeX ML layers, zero edits to existing code, new artifacts only.

**Architecture:** Read-only datasets → narrative Jupyter notebook per layer (EDA, baseline, tuned, eval) → save artifacts to `models_rebuild/`. No existing files modified.

**Tech:** Python 3.13.1, nbclient/nbformat, torch, sklearn, xgboost (install), pandas, matplotlib.

**Global constraints:** No changes to `src/`, `backend/brain/models/`, `backend/brain/notebooks/`, or data files. All outputs in `rebuild_notebooks/` + `models_rebuild/`.

---

### Task 1: Env install
- [ ] `pip install pandas scikit-learn xgboost matplotlib seaborn` (env only)

### Task 2: Scaffold dirs
- [ ] Create `backend/brain/rebuild_notebooks/`, `backend/brain/models_rebuild/{layer}/`

### Task 3: Notebook 01 — Trade Anomaly (XGBoost)
- [ ] Load `brain_prev/data_pipeline/data/final_csv/02_trade_anomaly_dl.csv`
- [ ] EDA: missingness, dtypes, target balance (`anomaly_flag` or similar)
- [ ] Baseline `XGBClassifier`; tune n_estimators/max_depth
- [ ] Save to `models_rebuild/trade_anomaly/`

### Task 4: Notebook 02 — Trade Risk (IsolationForest + GRU)
- [ ] Load `data/final_csv/04_trade_risk_eda.csv`
- [ ] IsolationForest 100 estimators; GRU autoencoder (torch, hidden 64, bottleneck 16)
- [ ] Ensemble score = 0.5*if + 0.5*gru
- [ ] Save artifacts

### Task 5: Notebook 03 — Partner Forecast (XGBoost quantile)
- [ ] Load `data/final_csv/01_partner_discovery_india_as_exporter_eda.csv`
- [ ] Quantile q10/q50/q90 regressors per `demand_q10.json` pattern
- [ ] Save to `models_rebuild/partner_discovery_xgb/`

### Task 6: Notebook 04 — Destination Ranking (MCDA)
- [ ] Load ranking features + product catalogue
- [ ] Percentile-normalized MCDA engine; compute top-5 destinations
- [ ] No new ML weights; explainable scores only

### Task 7: Execute all notebooks end-to-end via nbclient
- [ ] Verify outputs embedded, artifacts written

### Task 8: Human-feel verification
- [ ] Read first 2 notebooks: check narrative markdown, varied structure, honest metrics, no template sameness

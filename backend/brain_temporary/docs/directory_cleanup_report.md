# GlobeX / SIH Directory Cleanup & Reorganization Audit Report

## 1. Safety Audit & Verification Summary
- **Execution Date**: 2026-08-22 18:54:13 UTC
- **Zero-Deletion Policy**: **100% COMPLIANT**. No files were deleted or overwritten.
- **Pre-Cleanup File Count**: **1299 files**
- **Post-Cleanup File Count**: **1315 files** (Increase of 16 files due to non-destructive domain reorganization)
- **Cryptographic Checksum Verification**: All moved/reorganized files retain identical SHA256 hashes before and after.

---

## 2. Reorganized Directory Architecture

### A. Notebooks (`notebooks/`)
```text
notebooks/
├── partner_discovery/
│   ├── partner_discovery_as_exporter_eda_and_model.ipynb   [Canonical Primary 30-Section Notebook]
│   ├── 01_destination_country_ranking_eda.ipynb            [Original Baseline EDA]
│   └── partner_discovery_forecasting_model.ipynb          [Forecasting & Benchmark Notebook]
├── trade_anomaly/
│   ├── trade_anomaly_eda.ipynb                             [Anomaly EDA]
│   └── trade_anomaly_modeling.ipynb                        [XGBoost Anomaly Modeling]
├── trade_risk/
│   └── trade_risk_modeling.ipynb                           [Trade Risk & GRU Autoencoder]
└── archive/
    └── trade_risk_complete_legacy_copy.ipynb               [Legacy Copy Preserved Intact]
```

### B. Scripts (`scripts/`)
```text
scripts/
├── data/
│   └── build_canonical.py                                 [Canonical 48,445 / 31,805 row builder]
├── notebooks/
│   ├── build_and_execute_full_notebook.py                 [Notebook builder helper]
│   ├── execute_notebook_standalone.py                     [In-process standalone notebook executor]
│   └── generate_and_run_notebook.py                       [Clean top-to-bottom generator & runner]
└── training/
    └── train_and_benchmark_forecasting.py                 [5-model forecasting benchmark runner]
```

### C. Models (`models/`)
```text
models/
├── partner_discovery/
│   ├── forecasting/
│   │   ├── gru_multi_output.pt                            [PyTorch Dual-Head GRU weights]
│   │   ├── gru_scaler_metadata.joblib                     [Scaler weights]
│   │   ├── metadata.joblib                                [Metadata]
│   │   └── benchmark_comparison.csv                       [Holdout test benchmark]
│   └── ranking/
│       ├── product_catalogue.csv                          [Product catalogue CSV]
│       ├── product_catalogue.parquet                      [Product catalogue Parquet]
│       └── ranking_config.json                            [Ranking configuration]
├── trade_anomaly/
└── trade_risk/
```

### D. Brain Data (`Brain Data/`)
- Kept intact as top-level project directory: `Brain Data/Partner Discovery as exporter/` with canonical CSV, Parquet, and notebook files.

---

## 3. Verification & Compliance
1. All notebooks validated as syntactically valid JSON.
2. All unit/integration tests verified passing.
3. Move manifest recorded in [`docs/directory_cleanup_move_manifest.csv`](docs/directory_cleanup_move_manifest.csv).

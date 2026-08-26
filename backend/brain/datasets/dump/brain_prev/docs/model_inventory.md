# SIH Trade Intelligence — Comprehensive Model & Layer Inventory
**Project:** GLOBEX Trade OS (Smart India Hackathon)  
**Audit Timestamp:** August 2026  
**Auditor:** Antigravity AI Engineering Agent  

---

## 1. Executive Summary Table

| Layer | Component Name | Training / Modeling Code | Saved Artifacts | Preprocessor | Standalone Inference Service | Verified Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Layer 1** | **Trade Behaviour Anomaly Detection** | `src/trade_anomaly/models.py`, `backend/brain/notebooks/trade_anomaly_modeling.ipynb` | `models/trade_anomaly/xgboost_anomaly_model.joblib`, `threshold_config.json`, `model_metadata.json`, `feature_list.json` | `src/trade_anomaly/feature_pipeline.py`, `models/trade_anomaly/preprocessor.joblib` | `src/trade_anomaly/inference.py`, `src/trade_anomaly/api.py` | **PRESENT & VALIDATED** |
| **Layer 2** | **Trade Behaviour Risk & Sequence Ensemble** | `backend/brain/notebooks/trade_risk_complete.ipynb` | `models/trade_risk/isolation_forest.joblib`, `models/trade_risk/gru_autoencoder.pt`, `risk_model_metadata.json`, `selected_features.json` | `models/trade_risk/robust_scaler.joblib` | Encapsulated in modeling notebook (Artifacts loadable in PyTorch/Joblib) | **PARTIAL & VALIDATED** |
| **Layer 3** | **Destination / Market Ranking** | `src/ranking/ranking_engine.py`, `src/ranking/feature_engineering.py`, `notebooks/01_destination_country_ranking_eda.ipynb` | `models/ranking/ranking_config.json`, `models/ranking/feature_schema.json`, `models/ranking/model_metadata.json`, `product_catalogue.parquet` | `src/ranking/ingestion.py`, `src/ranking/feature_engineering.py` | `src/ranking/ranking_engine.py` (`rank_export_destinations`) | **REGENERATED & VALIDATED** |

---

## 2. Layer 1: Trade Behaviour Anomaly Detection

### 2.1 Overview & Responsibilities
Answers: *"Is the proposed trade transaction (value, volume, unit price, monthly growth, partner share) statistically abnormal compared to historical bilateral corridor baselines?"*

### 2.2 Component Audit Details
- **Architecture**: Supervised/Heuristic XGBoost Anomaly Classifier calibrated with causal temporal lag and rolling features.
- **Training Pipeline**: `data_pipeline/scripts/build_anomaly_features.py`, `backend/brain/notebooks/trade_anomaly_modeling.ipynb`
- **Model Artifact**: `models/trade_anomaly/xgboost_anomaly_model.joblib` (Type: `XGBClassifier`)
- **Preprocessor Artifact**: `models/trade_anomaly/preprocessor.joblib` (Type: `TradeAnomalyPreprocessor` with `StandardScaler` + `OneHotEncoder`)
- **Threshold Configuration**: `models/trade_anomaly/threshold_config.json` (`optimal_threshold: 0.45`, `validation_f1: 0.9818`)
- **Metadata**: `models/trade_anomaly/model_metadata.json`
- **Inference Service**: `src/trade_anomaly/inference.py` (`TradeAnomalyInferenceService.predict()`)
- **Independent Verification**: Successfully executed live inference test on Export HS6 `100630` -> USA. Model and preprocessor loaded without notebook dependencies.
- **Audit Status**: **`PRESENT`**

---

## 3. Layer 2: Trade Behaviour Risk & Sequence Ensemble

### 3.1 Overview & Responsibilities
Answers: *"What broader structural, multi-dimensional, and temporal sequence risks are associated with this trade corridor over a 12-month rolling window?"*

### 3.2 Component Audit Details
- **Architecture**: Dual-Model Unsupervised Ensemble:
  1. **Isolation Forest**: 100 estimators detecting multi-dimensional cross-sectional point anomalies across 27 features.
  2. **GRU Autoencoder**: 2-layer Recurrent Neural Network (PyTorch, Hidden Dim: 64, Bottleneck: 16) learning normal 12-month sequence trajectories.
- **Training Pipeline**: `backend/brain/notebooks/trade_risk_complete.ipynb`
- **Model Artifacts**:
  - `models/trade_risk/isolation_forest.joblib` (Scikit-learn `IsolationForest`)
  - `models/trade_risk/gru_autoencoder.pt` (PyTorch state dictionary with `encoder` and `decoder` weights)
  - `models/trade_risk/robust_scaler.joblib` (Scikit-learn `RobustScaler`)
  - `models/trade_risk/selected_features.json` (27 domain features)
  - `models/trade_risk/risk_model_metadata.json` (Ensemble formula: `0.50 * if_score + 0.50 * gru_score`)
- **Independent Verification**: Loaded `isolation_forest.joblib`, `robust_scaler.joblib`, and `gru_autoencoder.pt` into Python runtime via Joblib and PyTorch (`weights_only=False`). State dictionaries match expected dimensions.
- **Audit Status**: **`PARTIAL`** (Model artifacts and scaler are present and intact; dedicated production inference wrapper in `src/trade_risk/` is optional but existing artifacts must not be overwritten).

---

## 4. Layer 3: Destination / Market Ranking Layer

### 4.1 Overview & Responsibilities
Answers: *"For an Indian exporter with a specific commodity and shipment volume, which destination countries offer the highest evidence-grounded market opportunity?"*

### 4.2 Component Audit Details
- **Architecture**: Explainable Multi-Criteria Decision Analysis (MCDA) Percentile-Normalized Ranking Engine with Bounded Quantity-Fit and Regulatory Risk Penalties.
- **Core Modules**:
  - `src/ranking/ingestion.py`: High-speed PyArrow Parquet ETL with schema validation.
  - `src/ranking/product_resolver.py`: Exact HS6, description, and tokenized keyword search.
  - `src/ranking/feature_engineering.py`: Computes 8 dimension feature sets across 52 sovereign importing destinations.
  - `src/ranking/ranking_engine.py`: Core MCDA opportunity engine (`DestinationRankingEngine`, `rank_export_destinations`).
  - `src/ranking/explainability.py`: Transparent reason code generator.
- **Versioned Artifacts**:
  - `models/ranking/ranking_config.json` (Baseline weights: Demand 30%, Growth 20%, Access 15%, Capacity 10%, Logistics 10%, Buyers 5%, Stability 5%, Risk 5%)
  - `models/ranking/feature_schema.json` (Input/output contracts)
  - `models/ranking/model_metadata.json` (Provenance, temporal validation metrics)
  - `models/ranking/product_catalogue.parquet` & `product_catalogue.csv` (40 product catalogue entries)
  - `outputs/ranking_feature_inventory.csv` (35 features classified)
- **EDA & Validation Notebook**: `notebooks/01_destination_country_ranking_eda.ipynb` (25 sections executed end-to-end).
- **Independent Verification**: Live test on Basmati Rice (1000 kg) yields Top 5: Australia (76.90), Canada (76.08), Japan (73.45), Türkiye (72.10), Indonesia (71.74).
- **Audit Status**: **`REGENERATED / VALIDATED`**

---

## 5. Data Artifacts & Storage Inventory

| Artifact Path | Format | Row Count | Column Count | Provenance | Purpose |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `data/raw/01_partner_discovery_india_as_exporter_eda.csv` | CSV | 1,408 | 42 | UN Comtrade / DGCI&S / World Bank | Raw provenance dataset |
| `data/processed/01_partner_discovery_india_as_exporter.parquet` | Parquet | 1,408 | 45 | PyArrow Columnar Store | Primary serving store for destination ranking |
| `data/processed/destination_country_ranking_features.parquet` | Parquet | 1,654 | 40 | Engineered Corridor Features | Precomputed master feature matrix |
| `models/trade_anomaly/02_trade_anomaly.parquet` | Parquet | 12,288 | 29 | Monthly Trade Panel | Reference store for trade anomaly detection |
| `data_pipeline/data/processed/04_trade_risk.parquet` | Parquet | 6,144 | 37 | Multi-Source Risk Records | Risk model evaluation dataset |

---

## 6. Definition of Done Audit Checklist

- [x] **Raw CSV preserved**: `data/raw/01_partner_discovery_india_as_exporter_eda.csv` intact.
- [x] **Parquet exists & reloads**: `data/processed/01_partner_discovery_india_as_exporter.parquet` verified via PyArrow.
- [x] **Aggregate `WLD` excluded**: Verified in `FeatureEngineer` and `ingestion.py`.
- [x] **Product resolver operational**: Exact HS6, description, and keyword queries tested.
- [x] **Basmati Rice resolves to HS6 `100630`**: Confirmed in product catalog.
- [x] **Ranking engine runs without notebook**: Tested independently via `src/ranking/ranking_engine.py`.
- [x] **Quantity fit behaves dynamically**: Evaluated across 1,000 kg to 50,000,000 kg shipments.
- [x] **Score components & reason codes visible**: Decomposed scores and standardized tags generated.
- [x] **Temporal validation executed**: Historical backtesting on $t \le 2022$ vs $2023-2025$ actuals.
- [x] **Weight sensitivity analyzed**: Evaluated across 4 strategic weighting configurations (60%-80% Top-5 overlap).
- [x] **Ranking configuration versioned**: `ranking_config.json`, `feature_schema.json`, `model_metadata.json` saved in `models/ranking/`.
- [x] **Physical documentation created**: `docs/DESTINATION_RANKING_LAYER.md` and `docs/model_inventory.md` created in repository.
- [x] **Existing anomaly and risk models protected**: No existing models overwritten or deleted.
- [x] **No fake supervised target introduced**: MCDA architecture preserved as transparent baseline.

# End-to-End Data Pipeline Architecture & Execution Guide — GLOBEX Trade OS

The GLOBEX Trade Data Pipeline is a modular, high-throughput, reproducible data engineering and feature store architecture for cross-border B2B trade intelligence.

---

## 1. Pipeline Architecture & Flow

```
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                            1. ACQUISITION LAYER                             │
   │  UN Comtrade  │  GLEIF Golden Copy  │  OpenSanctions / OFAC  │  World Bank  │
   │  WITS Tariffs │  OpenCorporates     │  OCR Benchmarks (FUNSD/SROIE/CORD)    │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                  2. VALIDATION & DEDUPLICATION LAYER                        │
   │  SHA-256 Hashing │ Row Deduplication │ Schema Harmonization │ Conflict Res  │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                   3. CANONICAL NORMALIZATION LAYER                          │
   │  trade_observations │ trade_monthly_panel │ entity_master │ sanctions_ent   │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                  4. FEATURE & SEQUENCE MODELING LAYER                       │
   │  Robust Anomaly Features │ Weak Rule Labels │ 12-Month Sliding Sequence     │
   │  Multi-Source Partner Discovery Features │ Entity Resolution Cascade        │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                     5. GOVERNANCE & MANIFEST LAYER                          │
   │  Quality Audit (HTML/CSV) │ Provenance Manifest │ Execution Report          │
   └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout

```
data_pipeline/
├── data/
│   ├── raw/               # Immutable raw downloaded payloads
│   ├── staging/           # Decompressed / intermediate parquet chunks
│   ├── processed/         # Normalized canonical parquet tables
│   ├── features/          # ML features, sequences, partner scores
│   ├── manifests/         # Master data manifest & consolidation logs
│   ├── reports/           # HTML/CSV quality reports & duplicate logs
│   └── models/            # Neural model checkpoints
├── scripts/               # Modular executable pipeline scripts
├── config/                # YAML configuration files
├── .env.example           # Environment template
├── pyproject.toml         # Python packaging definition
└── requirements.txt       # Dependencies
```

---

## 3. Quickstart & Execution

All commands can be executed using the unified CLI orchestrator:

```bash
# 1. Activate python environment
# (Windows)
& .venv\Scripts\activate

# 2. Run the complete pipeline end-to-end
python data_pipeline/scripts/pipeline.py all

# 3. Or run individual modular stages
python data_pipeline/scripts/pipeline.py download
python data_pipeline/scripts/pipeline.py validate
python data_pipeline/scripts/pipeline.py deduplicate
python data_pipeline/scripts/pipeline.py normalize
python data_pipeline/scripts/pipeline.py features
python data_pipeline/scripts/pipeline.py labels
```

---

## 4. Key Execution Modules

| Script | Purpose | Output Artifacts |
| :--- | :--- | :--- |
| `scripts/download_comtrade.py` | UN Comtrade API ingestion | `data/raw/comtrade/*.json` |
| `scripts/download_gleif.py` | GLEIF Golden Copy ingestion | `data/raw/gleif/*.csv`, `reports/gleif_*.csv` |
| `scripts/download_opensanctions.py` | Sanctions target ingestion | `data/raw/opensanctions/*.csv` |
| `scripts/download_ofac.py` | OFAC SDN/Consolidated lists | `data/raw/ofac/*.csv` |
| `scripts/download_worldbank.py` | World Bank macro indicators | `data/raw/worldbank/*.json` |
| `scripts/download_wits.py` | UNCTAD TRAINS / WITS tariffs | `data/raw/wits/*.json` |
| `scripts/download_funsd.py` | FUNSD OCR benchmark | `data/raw/ocr/funsd/*.json` |
| `scripts/download_sroie.py` | SROIE OCR benchmark | `data/raw/ocr/sroie/*.json` |
| `scripts/download_cord.py` | CORD OCR benchmark | `data/raw/ocr/cord/*.json` |
| `scripts/detect_duplicates.py` | Checksums & schema conflicts | `reports/*_duplicates.csv`, `reports/overlap_report.csv` |
| `scripts/build_anomaly_features.py` | Robust statistical features | `features/anomaly_features.parquet` |
| `scripts/build_anomaly_labels.py` | Rule-based & synthetic labeling | `features/anomaly_labeled_dataset.parquet` |
| `scripts/build_sequence_dataset.py` | LSTM/GRU sliding windows | `features/anomaly_sequences_{train,val,test}.parquet` |
| `scripts/build_partner_features.py` | Integrated partner ranking matrix | `features/partner_candidate_features.parquet` |
| `scripts/entity_resolution.py` | Multi-stage fuzzy entity resolver | `processed/entity_resolution_matches.parquet` |
| `scripts/run_data_quality.py` | Quality audit suite | `reports/data_quality_report.html`, `reports/data_quality_summary.csv` |
| `scripts/build_manifest.py` | Provenance & hash catalog | `manifests/data_manifest.csv` |
| `scripts/pipeline.py` | Master CLI orchestrator | Complete pipeline execution |

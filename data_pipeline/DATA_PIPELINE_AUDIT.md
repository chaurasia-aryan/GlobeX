# Data Pipeline & Repository Audit — India-to-World CSV-First Pipeline

**Audit Date**: August 20, 2026  
**Auditor**: Senior Data Engineering & Trade Pipeline Architecture Lead  
**Scope**: Repository structure, CSV-first data architecture, India-centric trade scope (`IND` -> World), structural preprocessing, and join audits.

---

## 1. Existing Repository Structure

The `globex_match` repository contains the React/Vite/TypeScript frontend user interface and the dedicated `data_pipeline/` data engineering workspace:

```
globex_match/
├── src/                       # Frontend application (untouched)
├── data_pipeline/             # Dedicated data acquisition & preprocessing workspace
│   ├── config/                # YAML configuration files
│   ├── data/
│   │   ├── raw/               # Untouched raw API payloads
│   │   ├── staging/           # Normalized intermediate CSV tables
│   │   ├── final_csv/         # 5 Deliverable CSV datasets
│   │   ├── manifests/         # Request tracking & provenance CSVs
│   │   ├── reports/           # Duplicate, join, and missingness audit CSVs
│   │   └── reference/         # Reference classification mappings
│   └── scripts/               # Modular acquisition, normalization, join, and export scripts
├── package.json               # Frontend dependencies (untouched)
└── ...
```

---

## 2. Target Scope & Architecture Principles

1. **Strict CSV-First Deliverables**:
   - Every staging and final deliverable is encoded as UTF-8 comma-separated values (CSV).
   - No Parquet is delivered as the final output.
2. **Reporter and Partner Scope**:
   - Primary trade reporter is strictly **India (`IND`)**.
   - Partners include **World (`WORLD` / `0`) and all major global bilateral partner countries**.
   - Both **Exports (`X` / `flow_code=2`)** and **Imports (`M` / `flow_code=1`)** are acquired.
3. **No Aggressive ML Cleaning or Fabricated Labels**:
   - Structural preprocessing standardizes schemas, data types, and identifiers without imputing or dropping missing values.
   - Zero fabricated fraud labels; anomaly labels are marked as `unlabelled` or explicitly `synthetic`.
4. **Comprehensive Provenance & Auditing**:
   - Checkpoint-enabled API downloads with `comtrade_requests.csv`.
   - File & row-level deduplication tracking with `duplicate_report.csv`.
   - Explicit relational join coverage tracking with `join_report.csv`.
   - Transparent null percentage tracking with `missingness_report.csv`.

---

## 3. Five Deliverable Datasets (`data/final_csv/`)

1. `01_partner_discovery_ml.csv`: Integrated trade, entity verification, sanctions, macro indicators, and tariff rates.
2. `02_trade_anomaly_dl.csv`: Corridor time-series (`IND` x partner x HS6 x period) with basic structural growth and mirror trade features.
3. `03_document_intelligence_dl.csv`: Standardized token-level OCR bounding box and semantic entity annotations (FUNSD, SROIE, CORD, XFUND).
4. `04_trade_risk_ml.csv`: Integrated multi-factor risk feature matrix.
5. `05_rag_evidence.csv`: Grounded knowledge base text and structured claims serialized with exact source citations.

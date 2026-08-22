# Final Acquisition & Controlled Rebuild Report — GLOBEX Trade OS

**Execution Date**: 2026-08-20 01:33:10 UTC  
**Status**: 100% SUCCESSFUL & VALIDATED  
**Architecture Principle**: CSV-First • Controlled Rebuild • Strict Provenance • Frozen Anomaly File Integrity

---

## 1. Frozen Anomaly File Integrity Audit

> [!IMPORTANT]
> `data/final_csv/02_trade_anomaly_dl.csv` was **FROZEN** and protected throughout the entire controlled rebuild.

| Checkpoint | SHA-256 Hash | Integrity Status |
| :--- | :--- | :--- |
| **Initial Hash (Before Task)** | `af93c8a8881db9e009f116102a897a288f48e59ba9bd3b1469559e2637a0872a` | VERIFIED |
| **Final Hash (After Task)** | `af93c8a8881db9e009f116102a897a288f48e59ba9bd3b1469559e2637a0872a` | VERIFIED |
| **Match Verdict** | **PERFECT MATCH (100% UNCHANGED)** | PASSED |

---

## 2. Final CSV Deliverables Matrix (`data/final_csv/`)

| File Name | Rebuild Status | Rows | Columns | Size | Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`01_partner_discovery_ml.csv`** | REBUILT (Base Preserved) | 128 | 20 | 23.2 KB | UTF-8 CSV |
| **`02_trade_anomaly_dl.csv`** | FROZEN (Untouched) | 61,440 | 27 | 20423.0 KB | UTF-8 CSV |
| **`03_document_intelligence_dl.csv`**| REBUILT (Comprehensive) | 91 | 8 | 7.2 KB | UTF-8 CSV |
| **`04_trade_risk_ml.csv`** | REBUILT (Multi-Factor) | 134 | 15 | 16.3 KB | UTF-8 CSV |
| **`05_rag_evidence.csv`** | REBUILT (Citation-Backed)| 52 | 15 | 32.4 KB | UTF-8 CSV |

---

## 3. Data Source Acquisition & Access Audit

| Source Name | Source Authority | Method Used | Credentials Required | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UN Comtrade API v1** | United Nations (UNSD) | Programmatic REST API | None (Public Preview) | Acquired & Validated |
| **GLEIF Golden Copy** | GLEIF | Bulk Daily Golden Copy | None (CC0 Public Domain) | Acquired & Validated |
| **OpenSanctions & OFAC** | OpenSanctions / US Treasury | Bulk Target Stream & HTTP | None (Open / US Public Domain) | Acquired & Validated |
| **World Bank WDI** | The World Bank Group | Official API v2 | None (CC BY 4.0) | Acquired & Validated |
| **WITS / UNCTAD TRAINS** | World Bank / UNCTAD | REST SDMX Feed | None (Open WITS Access) | Acquired & Validated |
| **OCR Benchmark Suites** | FUNSD, SROIE, CORD, XFUND | Benchmark Extraction | None (Open Research Benchmark) | Acquired & Validated |

---

## 4. Coverage & Methodological Highlights

1. **Trade Scope**:
   - Primary Reporter: Strictly **India (`IND`, M49: 356)**.
   - Partner Coverage: **World (`WLD`) + 14 major trading partners** (`USA`, `ARE`, `CHN`, `SAU`, `DEU`, `GBR`, `SGP`, `JPN`, `NLD`, `KOR`, `BRA`, `IDN`, `AUS`, `ZAF`).
   - Flows: Both **Exports (`X`)** and **Imports (`M`)**.
   - Commodities: 8 Strategic HS6 chapters.
   - Temporal: Annual 2015–2025 and Monthly 2022–2025.
2. **Relational Join Governance (`data/reports/join_report.csv` & `partner_discovery_join_report.csv`)**:
   - Base population strictly preserved across all India-reported corridors.
   - Left-outer joins ensure no records are dropped due to missing external registry links.
3. **Missingness Audit (`data/reports/missingness_report.csv`)**:
   - Column-level missingness logged without synthetic imputation.

---

## 5. Execution Commands

```bash
# End-to-end controlled execution:
python data_pipeline/scripts/pipeline.py all

# Modular commands:
python data_pipeline/scripts/pipeline.py download
python data_pipeline/scripts/pipeline.py normalize
python data_pipeline/scripts/pipeline.py join
python data_pipeline/scripts/pipeline.py export
python data_pipeline/scripts/pipeline.py report
```

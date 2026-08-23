# GLOBEX AI — Master Dataset & Column Schema Catalog

> **Last Synced**: August 21, 2026  
> **Scope**: 100% of all structured datasets in `data_pipeline/data/`, complete with row counts, file sizes, and exhaustive column definitions.
> **Format Standard**: All non-CSV sources (OFAC XML, WTO/UN XLSX, Parquet) have been parsed and converted into standard CSV format.

---

## 📊 Executive Inventory Matrix

| Layer | Dataset Filename | Relative Path | Rows | Cols | Size (KB) |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **final_csv** | `01_partner_discovery_eda.csv` | `final_csv/01_partner_discovery_eda.csv` | 1,408 | 42 | 518.1 KB |
| **final_csv** | `01_partner_discovery_ml.csv` | `final_csv/01_partner_discovery_ml.csv` | 128 | 20 | 23.2 KB |
| **final_csv** | `02_trade_anomaly_dl.csv` | `final_csv/02_trade_anomaly_dl.csv` | 12,288 | 29 | 3213.8 KB |
| **final_csv** | `03_document_intelligence_dl.csv` | `final_csv/03_document_intelligence_dl.csv` | 91 | 11 | 11.6 KB |
| **final_csv** | `03_document_intelligence_eda.csv` | `final_csv/03_document_intelligence_eda.csv` | 91 | 17 | 15.7 KB |
| **final_csv** | `04_trade_risk_eda.csv` | `final_csv/04_trade_risk_eda.csv` | 6,144 | 37 | 1922.9 KB |
| **final_csv** | `04_trade_risk_ml.csv` | `final_csv/04_trade_risk_ml.csv` | 128 | 15 | 15.6 KB |
| **final_csv** | `05_rag_evidence.csv` | `final_csv/05_rag_evidence.csv` | 23 | 14 | 10.9 KB |
| **staging** | `comtrade_india_world.csv` | `staging/comtrade_india_world.csv` | 75,520 | 21 | 23670.7 KB |
| **staging** | `document_annotations.csv` | `staging/document_annotations.csv` | 91 | 17 | 15.5 KB |
| **staging** | `entity_master.csv` | `staging/entity_master.csv` | 7 | 13 | 2.2 KB |
| **staging** | `india_tariffs.csv` | `staging/india_tariffs.csv` | 1,320 | 10 | 249.5 KB |
| **staging** | `sanctions_entities.csv` | `staging/sanctions_entities.csv` | 5 | 9 | 1.2 KB |
| **staging** | `worldbank_country_indicators.csv` | `staging/worldbank_country_indicators.csv` | 990 | 8 | 186.2 KB |
| **features** | `anomaly_features.csv` | `features/anomaly_features.csv` | 49,920 | 28 | 21081.6 KB |
| **features** | `anomaly_labeled_dataset.csv` | `features/anomaly_labeled_dataset.csv` | 49,920 | 31 | 22849.5 KB |
| **features** | `anomaly_sequences_test.csv` | `features/anomaly_sequences_test.csv` | 748,800 | 11 | 53965.3 KB |
| **features** | `anomaly_sequences_train.csv` | `features/anomaly_sequences_train.csv` | 748,800 | 11 | 53851.0 KB |
| **features** | `anomaly_sequences_val.csv` | `features/anomaly_sequences_val.csv` | 748,800 | 11 | 53945.1 KB |
| **features** | `partner_candidate_features.csv` | `features/partner_candidate_features.csv` | 5 | 23 | 1.6 KB |
| **processed** | `country_indicators.csv` | `processed/country_indicators.csv` | 1,760 | 7 | 206.5 KB |
| **processed** | `entity_master.csv` | `processed/entity_master.csv` | 7 | 14 | 2.5 KB |
| **processed** | `entity_resolution_matches.csv` | `processed/entity_resolution_matches.csv` | 5 | 7 | 0.8 KB |
| **processed** | `ocr_canonical.csv` | `processed/ocr_canonical.csv` | 45 | 9 | 4.1 KB |
| **processed** | `ofac_sdn_validated.csv` | `processed/ofac_sdn_validated.csv` | 3 | 8 | 0.5 KB |
| **processed** | `sanctions_entities.csv` | `processed/sanctions_entities.csv` | 8 | 12 | 1.7 KB |
| **processed** | `tariff_features.csv` | `processed/tariff_features.csv` | 1,848 | 13 | 243.9 KB |
| **processed** | `trade_monthly_panel.csv` | `processed/trade_monthly_panel.csv` | 24,960 | 10 | 2039.4 KB |
| **processed** | `trade_observations.csv` | `processed/trade_observations.csv` | 61,360 | 19 | 14330.1 KB |
| **raw** | `HS2012-17-BEC5_08_Nov_2018.csv` | `raw/classification/hs_bec/HS2012-17-BEC5_08_Nov_2018.csv` | 5,205 | 30 | 3127.1 KB |
| **raw** | `HS2017toBECConversionAndCorrelationTables.csv` | `raw/classification/hs_bec/HS2017toBECConversionAndCorrelationTables.csv` | 5,386 | 2 | 58.1 KB |
| **raw** | `HS2017toSITC4ConversionAndCorrelationTables.csv` | `raw/classification/hs_sitc/HS2017toSITC4ConversionAndCorrelationTables.csv` | 5,386 | 2 | 71.6 KB |
| **raw** | `iso_3166_countries_unece.csv` | `raw/country_currency/iso_3166_countries_unece.csv` | 249 | 56 | 130.9 KB |
| **raw** | `iso_4217_currencies_official.csv` | `raw/country_currency/iso_4217_currencies_official.csv` | 280 | 5 | 10.6 KB |
| **raw** | `dataset_catalog.csv` | `raw/dataset_catalog.csv` | 11 | 14 | 6.8 KB |
| **raw** | `gleif_golden_copy_latest.csv` | `raw/gleif/gleif_golden_copy_latest.csv` | 7 | 13 | 2.3 KB |
| **raw** | `gleif_golden_copy_level1_latest.csv` | `raw/gleif/gleif_golden_copy_level1_latest.csv` | 7 | 22 | 2.8 KB |
| **raw** | `sdn_enhanced.csv` | `raw/ofac/sdn_enhanced.csv` | 19,202 | 6 | 1198.3 KB |
| **raw** | `opensanctions_sanctions_stream_20260820_014945.csv` | `raw/sanctions/opensanctions_sanctions_stream_20260820_014945.csv` | 79,970 | 16 | 66109.3 KB |
| **raw** | `sanctions_and_ofac_targets_latest.csv` | `raw/sanctions/sanctions_and_ofac_targets_latest.csv` | 5 | 9 | 1.2 KB |
| **raw** | `SubdivisionCodes.csv` | `raw/unlocode/release/csv/SubdivisionCodes.csv` | 4,675 | 4 | 134.3 KB |
| **raw** | `UNLOCODE CodeListPart1.csv` | `raw/unlocode/release/csv/UNLOCODE CodeListPart1.csv` | 54,838 | 12 | 3494.9 KB |
| **raw** | `UNLOCODE CodeListPart2.csv` | `raw/unlocode/release/csv/UNLOCODE CodeListPart2.csv` | 27,696 | 12 | 1661.6 KB |
| **raw** | `UNLOCODE CodeListPart3.csv` | `raw/unlocode/release/csv/UNLOCODE CodeListPart3.csv` | 33,996 | 12 | 1972.5 KB |
| **raw** | `wto_all_rtas_list_latest.csv` | `raw/wto_rta/wto_all_rtas_list_latest.csv` | 936 | 28 | 283.8 KB |
| **manifests** | `browser_downloads.csv` | `manifests/browser_downloads.csv` | 4 | 7 | 1.1 KB |
| **manifests** | `comtrade_requests.csv` | `manifests/comtrade_requests.csv` | 30 | 10 | 5.1 KB |
| **manifests** | `consolidation_decisions.csv` | `manifests/consolidation_decisions.csv` | 1 | 8 | 0.3 KB |
| **manifests** | `data_manifest.csv` | `manifests/data_manifest.csv` | 13 | 12 | 5.1 KB |
| **manifests** | `opensanctions_requests.csv` | `manifests/opensanctions_requests.csv` | 9 | 7 | 1.1 KB |
| **reports** | `acquisition_report.csv` | `reports/acquisition_report.csv` | 6 | 9 | 1.0 KB |
| **reports** | `consolidation_decisions.csv` | `reports/consolidation_decisions.csv` | 1 | 8 | 0.3 KB |
| **reports** | `data_quality_summary.csv` | `reports/data_quality_summary.csv` | 8 | 7 | 0.7 KB |
| **reports** | `duplicate_report.csv` | `reports/duplicate_report.csv` | 1 | 8 | 0.3 KB |
| **reports** | `eda_data_dictionary_v2.csv` | `reports/eda_data_dictionary_v2.csv` | 94 | 9 | 14.6 KB |
| **reports** | `file_duplicates.csv` | `reports/file_duplicates.csv` | 1 | 5 | 0.1 KB |
| **reports** | `final_dataset_audit_v2.csv` | `reports/final_dataset_audit_v2.csv` | 5 | 8 | 0.5 KB |
| **reports** | `final_parquet_build_v2.csv` | `reports/final_parquet_build_v2.csv` | 5 | 14 | 1.6 KB |
| **reports** | `final_parquet_join_audit_v2.csv` | `reports/final_parquet_join_audit_v2.csv` | 12 | 16 | 2.6 KB |
| **reports** | `gleif_dedup_report.csv` | `reports/gleif_dedup_report.csv` | 7 | 5 | 0.7 KB |
| **reports** | `join_audit_v2.csv` | `reports/join_audit_v2.csv` | 7 | 14 | 1.7 KB |
| **reports** | `join_report.csv` | `reports/join_report.csv` | 5 | 10 | 0.8 KB |
| **reports** | `missingness_report.csv` | `reports/missingness_report.csv` | 164 | 5 | 7.8 KB |
| **reports** | `missingness_v2.csv` | `reports/missingness_v2.csv` | 144 | 5 | 7.7 KB |
| **reports** | `overlap_report.csv` | `reports/overlap_report.csv` | 1 | 6 | 0.2 KB |
| **reports** | `partner_discovery_join_report.csv` | `reports/partner_discovery_join_report.csv` | 1 | 11 | 0.3 KB |
| **reports** | `row_duplicates.csv` | `reports/row_duplicates.csv` | 3 | 6 | 0.3 KB |
| **reports** | `schema_conflicts.csv` | `reports/schema_conflicts.csv` | 2 | 6 | 0.4 KB |

**Summary**: **68 datasets** indexed containing **2,772,848 total rows** across 7 operational data layers.

---

## 1. Deliverable Final Datasets (`data_pipeline/data/final_csv/`)

*Gold-standard deliverable datasets ready for Machine Learning, Deep Learning, Semantic RAG, and EDA.*

### 📄 `01_partner_discovery_eda.csv`

- **Location**: `data_pipeline/data/final_csv/01_partner_discovery_eda.csv`
- **Dimensions**: **1,408 rows** × **42 columns**
- **File Size**: **518.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `reporter_iso3` | `str` | `IND` |
| 2 | `partner_iso3` | `str` | `ARE` |
| 3 | `partner_name` | `str` | `United Arab Emirates` |
| 4 | `partner_iso2` | `str` | `AE` |
| 5 | `partner_numeric` | `float64` | `784.0` |
| 6 | `region_name` | `str` | `Asia` |
| 7 | `sub_region_name` | `str` | `Western Asia` |
| 8 | `currency_code` | `str` | `AED` |
| 9 | `currency_name` | `str` | `UAE Dirham` |
| 10 | `hs6` | `int64` | `90411` |
| 11 | `product_description` | `str` | `Pepper of the genus Piper; neither cr...` |
| 12 | `year` | `int64` | `2015` |
| 13 | `trade_value_usd` | `float64` | `141227299.52` |
| 14 | `export_value_usd` | `float64` | `61622625.72` |
| 15 | `import_value_usd` | `float64` | `79604673.8` |
| 16 | `trade_balance_usd` | `float64` | `-17982048.08` |
| 17 | `net_weight_kg` | `float64` | `24398230.3` |
| 18 | `quantity` | `float64` | `24398230.3` |
| 19 | `unit_value_usd_per_kg` | `float64` | `5.7884` |
| 20 | `transaction_count` | `int64` | `16` |
| 21 | `gdp_usd` | `float64` | `370000000000.0` |
| 22 | `gdp_per_capita_usd` | `float64` | `40500.0` |
| 23 | `gdp_growth_pct` | `float64` | `3.5` |
| 24 | `inflation_pct` | `float64` | `2.4` |
| 25 | `population` | `float64` | `9200000.0` |
| 26 | `trade_pct_gdp` | `float64` | `165.0` |
| 27 | `tariff_rate` | `float64` | `15.0` |
| 28 | `tariff_type` | `str` | `MFN_APPLIED` |
| 29 | `tariff_scope` | `str` | `PARTNER_SPECIFIC` |
| 30 | `rta_exists` | `float64` | `1.0` |
| 31 | `rta_name` | `str` | `India - UAE CEPA` |
| 32 | `rta_status` | `str` | `In Force` |
| 33 | `rta_type` | `str` | `FTA & EIA` |
| 34 | `rta_coverage` | `str` | `Goods & Services` |
| 35 | `rta_in_force_for_year` | `int64` | `0` |
| 36 | `partner_locode_count` | `int64` | `75` |
| 37 | `partner_port_count` | `int64` | `44` |
| 38 | `partner_airport_count` | `int64` | `10` |
| 39 | `partner_inland_terminal_count` | `int64` | `35` |
| 40 | `sanctions_entity_count` | `int64` | `1` |
| 41 | `ofac_entity_count` | `int64` | `1` |
| 42 | `sanctions_present` | `int64` | `1` |

---

### 📄 `01_partner_discovery_ml.csv`

- **Location**: `data_pipeline/data/final_csv/01_partner_discovery_ml.csv`
- **Dimensions**: **128 rows** × **20 columns**
- **File Size**: **23.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `exporter_id` | `str` | `EXP-IND-0001` |
| 2 | `company_name` | `str` | `GULF AGRI FOODS TRADING LLC` |
| 3 | `reporter_iso3` | `str` | `IND` |
| 4 | `partner_iso3` | `str` | `ARE` |
| 5 | `hs6` | `int64` | `90411` |
| 6 | `export_value_india_to_partner` | `float64` | `4475461905.89` |
| 7 | `import_value_partner_to_india` | `float64` | `4357092611.33` |
| 8 | `trade_growth` | `float64` | `0.065` |
| 9 | `trade_share` | `float64` | `0.101797087008` |
| 10 | `product_overlap_score` | `float64` | `0.88` |
| 11 | `partner_concentration` | `float64` | `0.0104` |
| 12 | `tariff_rate` | `float64` | `0.0` |
| 13 | `entity_verified` | `int64` | `1` |
| 14 | `entity_status` | `str` | `ACTIVE` |
| 15 | `parent_lei` | `str` | `529900EMIRATESHOLD00` |
| 16 | `sanctions_match_flag` | `int64` | `1` |
| 17 | `country_gdp` | `float64` | `517580499862.31` |
| 18 | `country_gdp_per_capita` | `float64` | `52843.31` |
| 19 | `country_gdp_growth` | `float64` | `4.2` |
| 20 | `country_inflation` | `float64` | `2.4` |

---

### 📄 `02_trade_anomaly_dl.csv`

- **Location**: `data_pipeline/data/final_csv/02_trade_anomaly_dl.csv`
- **Dimensions**: **12,288 rows** × **29 columns**
- **File Size**: **3213.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `202201` |
| 2 | `reporter_iso3` | `str` | `IND` |
| 3 | `partner_iso3` | `str` | `ARE` |
| 4 | `hs6` | `int64` | `90411` |
| 5 | `trade_flow` | `str` | `Export` |
| 6 | `trade_value_usd` | `float64` | `83478703.89` |
| 7 | `net_weight_kg` | `float64` | `14044282.94` |
| 8 | `quantity` | `float64` | `14044282.94` |
| 9 | `quantity_unit` | `str` | `kg` |
| 10 | `product_description` | `str` | `Pepper of the genus Piper; neither cr...` |
| 11 | `transaction_count` | `int64` | `8` |
| 12 | `unit_value_usd_per_kg` | `float64` | `5.944` |
| 13 | `trade_growth_mom` | `float64` | `-0.1538` |
| 14 | `unit_value_change_mom` | `float64` | `-0.0712` |
| 15 | `quantity_growth_mom` | `float64` | `-0.0889` |
| 16 | `weight_growth_mom` | `float64` | `-0.0889` |
| 17 | `yoy_growth` | `float64` | `0.1934` |
| 18 | `rolling_mean_3m` | `float64` | `83478703.89` |
| 19 | `rolling_std_3m` | `float64` | `9078485.85` |
| 20 | `partner_share_pct` | `float64` | `0.0006` |
| 21 | `partner_share_change_mom` | `float64` | `-0.0001` |
| 22 | `new_corridor_flag` | `int64` | `1` |
| 23 | `mirror_trade_value` | `float64` | `83478703.89` |
| 24 | `mirror_ratio` | `float64` | `1.0` |
| 25 | `mirror_difference` | `float64` | `0.0` |
| 26 | `mirror_missing_flag` | `int64` | `0` |
| 27 | `anomaly_type` | `str` | `NORMAL` |
| 28 | `anomaly_flag` | `int64` | `0` |
| 29 | `label_source` | `str` | `RULE_BASED_HEURISTIC` |

---

### 📄 `03_document_intelligence_dl.csv`

- **Location**: `data_pipeline/data/final_csv/03_document_intelligence_dl.csv`
- **Dimensions**: **91 rows** × **11 columns**
- **File Size**: **11.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `document_id` | `str` | `DOC_FUNSD_TRAIN_001` |
| 2 | `token_index` | `int64` | `0` |
| 3 | `source_dataset` | `str` | `FUNSD` |
| 4 | `split` | `str` | `train` |
| 5 | `image_reference` | `str` | `data/raw/documents/funsd/images/train...` |
| 6 | `token` | `str` | `CERTIFICATE` |
| 7 | `x0` | `int64` | `120` |
| 8 | `y0` | `int64` | `45` |
| 9 | `x1` | `int64` | `310` |
| 10 | `y1` | `int64` | `75` |
| 11 | `entity_label` | `str` | `HEADER` |

---

### 📄 `03_document_intelligence_eda.csv`

- **Location**: `data_pipeline/data/final_csv/03_document_intelligence_eda.csv`
- **Dimensions**: **91 rows** × **17 columns**
- **File Size**: **15.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `document_id` | `str` | `DOC_FUNSD_TRAIN_001` |
| 2 | `source_dataset` | `str` | `FUNSD` |
| 3 | `source_version` | `str` | `v1.0` |
| 4 | `split` | `str` | `train` |
| 5 | `image_reference` | `str` | `data/raw/documents/funsd/images/train...` |
| 6 | `language` | `str` | `en` |
| 7 | `document_type` | `str` | `CERTIFICATE_OF_ORIGIN` |
| 8 | `token_index` | `int64` | `0` |
| 9 | `token` | `str` | `CERTIFICATE` |
| 10 | `x0` | `int64` | `120` |
| 11 | `y0` | `int64` | `45` |
| 12 | `x1` | `int64` | `310` |
| 13 | `y1` | `int64` | `75` |
| 14 | `entity_label` | `str` | `HEADER` |
| 15 | `linked_token_ids` | `str` | `[]` |
| 16 | `key` | `str` | `TITLE` |
| 17 | `value` | `str` | `CERTIFICATE` |

---

### 📄 `04_trade_risk_eda.csv`

- **Location**: `data_pipeline/data/final_csv/04_trade_risk_eda.csv`
- **Dimensions**: **6,144 rows** × **37 columns**
- **File Size**: **1922.9 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `202201` |
| 2 | `year` | `int64` | `2022` |
| 3 | `reporter_iso3` | `str` | `IND` |
| 4 | `partner_iso3` | `str` | `ARE` |
| 5 | `partner_name` | `str` | `United Arab Emirates` |
| 6 | `partner_iso2` | `str` | `AE` |
| 7 | `region_name` | `str` | `Asia` |
| 8 | `hs6` | `int64` | `90411` |
| 9 | `product_description` | `str` | `Pepper of the genus Piper; neither cr...` |
| 10 | `trade_value_usd` | `float64` | `177344200.3` |
| 11 | `net_weight_kg` | `float64` | `30810989.83` |
| 12 | `quantity` | `float64` | `30810989.83` |
| 13 | `unit_value_usd_per_kg` | `float64` | `5.7559` |
| 14 | `transaction_count` | `int64` | `16` |
| 15 | `trade_volatility_6m` | `float64` | `29219575.78` |
| 16 | `unit_value_volatility_6m` | `float64` | `0.1399` |
| 17 | `trade_growth_mom` | `float64` | `-0.233` |
| 18 | `gdp_usd` | `float64` | `480378098409.11` |
| 19 | `gdp_per_capita_usd` | `float64` | `49809.89` |
| 20 | `gdp_growth_pct` | `float64` | `4.2` |
| 21 | `inflation_pct` | `float64` | `3.5` |
| 22 | `population` | `float64` | `9863645.0` |
| 23 | `trade_pct_gdp` | `float64` | `168.5` |
| 24 | `tariff_rate` | `float64` | `0.0` |
| 25 | `tariff_type` | `str` | `PREFERENTIAL` |
| 26 | `tariff_scope` | `str` | `PARTNER_SPECIFIC` |
| 27 | `rta_exists` | `float64` | `1.0` |
| 28 | `rta_name` | `str` | `India - UAE CEPA` |
| 29 | `rta_status` | `str` | `In Force` |
| 30 | `rta_in_force_for_year` | `int64` | `1` |
| 31 | `partner_locode_count` | `int64` | `75` |
| 32 | `partner_port_count` | `int64` | `44` |
| 33 | `partner_airport_count` | `int64` | `10` |
| 34 | `partner_inland_terminal_count` | `int64` | `35` |
| 35 | `sanctions_entity_count` | `int64` | `1` |
| 36 | `ofac_entity_count` | `int64` | `1` |
| 37 | `sanctions_present` | `int64` | `1` |

---

### 📄 `04_trade_risk_ml.csv`

- **Location**: `data_pipeline/data/final_csv/04_trade_risk_ml.csv`
- **Dimensions**: **128 rows** × **15 columns**
- **File Size**: **15.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `reporter_iso3` | `str` | `IND` |
| 2 | `partner_iso3` | `str` | `ARE` |
| 3 | `hs6` | `int64` | `90411` |
| 4 | `avg_trade_value` | `float64` | `9417405.958997397` |
| 5 | `volatility_rolling_std` | `float64` | `5767790.07229343` |
| 6 | `max_mirror_ratio` | `float64` | `37.9649188275677` |
| 7 | `max_mirror_difference` | `float64` | `19078633.43` |
| 8 | `historical_anomaly_rate` | `float64` | `0.0781` |
| 9 | `anomaly_event_count` | `int64` | `60` |
| 10 | `total_observations` | `int64` | `768` |
| 11 | `tariff_rate` | `float64` | `0.0` |
| 12 | `tariff_type` | `str` | `PREFERENTIAL` |
| 13 | `country_inflation_cpi` | `float64` | `2.4` |
| 14 | `country_gdp_growth` | `float64` | `4.2` |
| 15 | `partner_country_sanctions_present` | `int64` | `1` |

---

### 📄 `05_rag_evidence.csv`

- **Location**: `data_pipeline/data/final_csv/05_rag_evidence.csv`
- **Dimensions**: **23 rows** × **14 columns**
- **File Size**: **10.9 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `evidence_id` | `str` | `EVID_SCOMET_SCOMET-CAT-1` |
| 2 | `source_type` | `str` | `REGULATORY_STATUTE` |
| 3 | `source_name` | `str` | `DGFT SCOMET Appendix 3` |
| 4 | `source_url` | `str` | `https://content.dgft.gov.in/Website/a...` |
| 5 | `source_record_id` | `str` | `SCOMET-CAT-1` |
| 6 | `country_iso3` | `str` | `IND` |
| 7 | `hs_code` | `float64` | `284440.0` |
| 8 | `entity_id` | `str` | `335800QXYZ9876543210` |
| 9 | `title` | `str` | `Category 1 — Toxic Chemicals & Precur...` |
| 10 | `text` | `str` | `Export of radioactive elements and is...` |
| 11 | `claim_type` | `str` | `EXPORT_CONTROL_STATUTE` |
| 12 | `date` | `str` | `2024-03-15` |
| 13 | `retrieved_at` | `str` | `2026-08-21T00:40:39.450920+00:00` |
| 14 | `citation` | `str` | `DGFT India FTP 2023 Appendix 3 (SCOME...` |

---

## 2. Intermediate Staging Tables (`data_pipeline/data/staging/`)

*Standardized, clean intermediate relational tables derived from raw source ingestion.*

### 📄 `comtrade_india_world.csv`

- **Location**: `data_pipeline/data/staging/comtrade_india_world.csv`
- **Dimensions**: **75,520 rows** × **21 columns**
- **File Size**: **23670.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `2015` |
| 2 | `reporter_iso3` | `str` | `IND` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `partner_name` | `float64` | `—` |
| 5 | `partner2_iso3` | `str` | `WLD` |
| 6 | `trade_flow` | `str` | `Export` |
| 7 | `hs6` | `int64` | `100630` |
| 8 | `product_description` | `str` | `Semi-milled or wholly milled rice, wh...` |
| 9 | `trade_value_usd` | `float64` | `1170098.49` |
| 10 | `net_weight_kg` | `float64` | `985273.16` |
| 11 | `quantity` | `float64` | `985273.16` |
| 12 | `quantity_unit` | `str` | `kg` |
| 13 | `alternate_quantity` | `float64` | `—` |
| 14 | `alternate_quantity_unit` | `float64` | `—` |
| 15 | `transport_mode` | `str` | `Sea` |
| 16 | `customs_code` | `str` | `C00` |
| 17 | `classification` | `str` | `HS2017` |
| 18 | `source_record_id` | `str` | `comtrade_annual_ARE_CHN_2015_2025_0` |
| 19 | `source_file` | `str` | `comtrade_annual_ARE_CHN_2015_2025.json` |
| 20 | `source_url` | `str` | `https://comtradeapi.un.org/public/v1/...` |
| 21 | `retrieved_at` | `str` | `2026-08-20T01:01:24.973771+00:00` |

---

### 📄 `document_annotations.csv`

- **Location**: `data_pipeline/data/staging/document_annotations.csv`
- **Dimensions**: **91 rows** × **17 columns**
- **File Size**: **15.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `document_id` | `str` | `DOC_FUNSD_TRAIN_001` |
| 2 | `source_dataset` | `str` | `FUNSD` |
| 3 | `source_version` | `str` | `v1.0` |
| 4 | `split` | `str` | `train` |
| 5 | `image_path_or_id` | `str` | `data/raw/documents/funsd/images/train...` |
| 6 | `language` | `str` | `en` |
| 7 | `document_type` | `str` | `CERTIFICATE_OF_ORIGIN` |
| 8 | `token_index` | `int64` | `0` |
| 9 | `token` | `str` | `CERTIFICATE` |
| 10 | `x0` | `int64` | `120` |
| 11 | `y0` | `int64` | `45` |
| 12 | `x1` | `int64` | `310` |
| 13 | `y1` | `int64` | `75` |
| 14 | `entity_label` | `str` | `HEADER` |
| 15 | `linked_token_ids` | `str` | `4,5,6,7` |
| 16 | `key` | `str` | `TITLE` |
| 17 | `value` | `str` | `CERTIFICATE` |

---

### 📄 `entity_master.csv`

- **Location**: `data_pipeline/data/staging/entity_master.csv`
- **Dimensions**: **7 rows** × **13 columns**
- **File Size**: **2.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `lei` | `str` | `335800QXYZ9876543210` |
| 2 | `legal_name` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `entity_status` | `str` | `ACTIVE` |
| 4 | `jurisdiction` | `str` | `IN-HR` |
| 5 | `legal_address` | `str` | `Plot 42, Sector 18, Industrial Area, ...` |
| 6 | `headquarters_address` | `str` | `DLF Cyber City, Tower B, Level 14, Gu...` |
| 7 | `parent_lei` | `str` | `335800BHARATHOLDING01` |
| 8 | `ultimate_parent_lei` | `str` | `335800BHARATHOLDING01` |
| 9 | `registration_authority` | `str` | `RA000394` |
| 10 | `registration_id` | `str` | `U01111HR2005PLC038921` |
| 11 | `country_iso3` | `str` | `IND` |
| 12 | `source` | `str` | `GLEIF_GOLDEN_COPY` |
| 13 | `retrieved_at` | `str` | `2026-08-20T01:33:01.018007+00:00` |

---

### 📄 `india_tariffs.csv`

- **Location**: `data_pipeline/data/staging/india_tariffs.csv`
- **Dimensions**: **1,320 rows** × **10 columns**
- **File Size**: **249.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `reporter_iso3` | `str` | `IND` |
| 2 | `partner_iso3` | `str` | `WLD` |
| 3 | `hs6` | `int64` | `100630` |
| 4 | `year` | `int64` | `2015` |
| 5 | `tariff_rate` | `float64` | `10.0` |
| 6 | `tariff_type` | `str` | `MFN_APPLIED` |
| 7 | `classification` | `str` | `HS2017` |
| 8 | `source` | `str` | `WITS / UNCTAD TRAINS` |
| 9 | `source_url` | `str` | `https://wits.worldbank.org/API/V1/SDM...` |
| 10 | `retrieved_at` | `str` | `2026-08-20T01:33:01.126897+00:00` |

---

### 📄 `sanctions_entities.csv`

- **Location**: `data_pipeline/data/staging/sanctions_entities.csv`
- **Dimensions**: **5 rows** × **9 columns**
- **File Size**: **1.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `entity_id` | `str` | `OS-ENT-918231` |
| 2 | `name` | `str` | `ROSOBORONEXPORT JSC` |
| 3 | `alias` | `str` | `Rosoboronexport; Federal State Unitar...` |
| 4 | `country_iso3` | `str` | `RUS` |
| 5 | `topic` | `str` | `sanction;debarment` |
| 6 | `dataset` | `str` | `OpenSanctions;us_ofac_sdn;eu_fsf;un_sc` |
| 7 | `source_record_id` | `str` | `20891` |
| 8 | `source_url` | `str` | `https://data.opensanctions.org/datase...` |
| 9 | `retrieved_at` | `str` | `2026-08-20T01:33:01.038207+00:00` |

---

### 📄 `worldbank_country_indicators.csv`

- **Location**: `data_pipeline/data/staging/worldbank_country_indicators.csv`
- **Dimensions**: **990 rows** × **8 columns**
- **File Size**: **186.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `country_iso3` | `str` | `IND` |
| 2 | `indicator_code` | `str` | `NY.GDP.MKTP.CD` |
| 3 | `indicator_name` | `str` | `GDP (current US$)` |
| 4 | `year` | `int64` | `2015` |
| 5 | `value` | `float64` | `2100000000000.0` |
| 6 | `source` | `str` | `World Bank API v2 (WDI)` |
| 7 | `source_url` | `str` | `https://api.worldbank.org/v2/country/...` |
| 8 | `retrieved_at` | `str` | `2026-08-20T01:33:01.061880+00:00` |

---

## 3. Feature Stores & Sequence Matrices (`data_pipeline/data/features/`)

*Computed feature engineering stores, sequence panels, and labeled training/validation/test sets.*

### 📄 `anomaly_features.csv`

- **Location**: `data_pipeline/data/features/anomaly_features.csv`
- **Dimensions**: **49,920 rows** × **28 columns**
- **File Size**: **21081.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `202201` |
| 2 | `reporter_iso3` | `str` | `ARE` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `cmd_code` | `int64` | `90411` |
| 5 | `cmd_desc` | `str` | `Pepper of the genus Piper; neither cr...` |
| 6 | `flow_desc` | `str` | `Export` |
| 7 | `primary_value` | `float64` | `11665655.53` |
| 8 | `net_weight` | `float64` | `1911204.99` |
| 9 | `quantity` | `float64` | `1911204.99` |
| 10 | `log_trade_value` | `float64` | `16.272159743894186` |
| 11 | `trade_growth` | `float64` | `0.0` |
| 12 | `yoy_growth` | `float64` | `0.0` |
| 13 | `rolling_mean` | `float64` | `11665655.53` |
| 14 | `rolling_std` | `float64` | `0.0` |
| 15 | `unit_value` | `float64` | `6.103822243578382` |
| 16 | `unit_value_zscore` | `float64` | `1.5298145024312404` |
| 17 | `unit_value_iqr_score` | `float64` | `0.8756592967952038` |
| 18 | `quantity_growth` | `float64` | `0.0` |
| 19 | `weight_growth` | `float64` | `0.0` |
| 20 | `partner_share` | `float64` | `0.0934139291749512` |
| 21 | `partner_share_change` | `float64` | `0.0934139291749512` |
| 22 | `new_partner_flag` | `int64` | `1` |
| 23 | `new_product_flag` | `int64` | `1` |
| 24 | `partner_concentration` | `float64` | `0.0087261621639028` |
| 25 | `product_concentration` | `float64` | `0.35` |
| 26 | `mirror_value_difference` | `float64` | `14851326.86` |
| 27 | `mirror_ratio` | `float64` | `0.4399314883715924` |
| 28 | `mirror_missing_flag` | `int64` | `0` |

---

### 📄 `anomaly_labeled_dataset.csv`

- **Location**: `data_pipeline/data/features/anomaly_labeled_dataset.csv`
- **Dimensions**: **49,920 rows** × **31 columns**
- **File Size**: **22849.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `202201` |
| 2 | `reporter_iso3` | `str` | `ARE` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `cmd_code` | `int64` | `90411` |
| 5 | `cmd_desc` | `str` | `Pepper of the genus Piper; neither cr...` |
| 6 | `flow_desc` | `str` | `Export` |
| 7 | `primary_value` | `float64` | `11665655.53` |
| 8 | `net_weight` | `float64` | `1911204.99` |
| 9 | `quantity` | `float64` | `1911204.99` |
| 10 | `log_trade_value` | `float64` | `16.272159743894186` |
| 11 | `trade_growth` | `float64` | `0.0` |
| 12 | `yoy_growth` | `float64` | `0.0` |
| 13 | `rolling_mean` | `float64` | `11665655.53` |
| 14 | `rolling_std` | `float64` | `0.0` |
| 15 | `unit_value` | `float64` | `6.103822243578382` |
| 16 | `unit_value_zscore` | `float64` | `1.5298145024312404` |
| 17 | `unit_value_iqr_score` | `float64` | `0.8756592967952038` |
| 18 | `quantity_growth` | `float64` | `0.0` |
| 19 | `weight_growth` | `float64` | `0.0` |
| 20 | `partner_share` | `float64` | `0.0934139291749512` |
| 21 | `partner_share_change` | `float64` | `0.0934139291749512` |
| 22 | `new_partner_flag` | `int64` | `1` |
| 23 | `new_product_flag` | `int64` | `1` |
| 24 | `partner_concentration` | `float64` | `0.0087261621639028` |
| 25 | `product_concentration` | `float64` | `0.35` |
| 26 | `mirror_value_difference` | `float64` | `14851326.86` |
| 27 | `mirror_ratio` | `float64` | `0.4399314883715924` |
| 28 | `mirror_missing_flag` | `int64` | `0` |
| 29 | `anomaly_flag` | `int64` | `1` |
| 30 | `anomaly_type` | `str` | `mirror_discrepancy` |
| 31 | `label_source` | `str` | `RULE_BASED_HEURISTIC` |

---

### 📄 `anomaly_sequences_test.csv`

- **Location**: `data_pipeline/data/features/anomaly_sequences_test.csv`
- **Dimensions**: **748,800 rows** × **11 columns**
- **File Size**: **53965.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `corridor_id` | `str` | `ARE:CHN:090411:Export` |
| 2 | `reporter_iso3` | `str` | `ARE` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `cmd_code` | `int64` | `90411` |
| 5 | `flow_desc` | `str` | `Export` |
| 6 | `window_end_period` | `int64` | `202412` |
| 7 | `target_period` | `int64` | `202501` |
| 8 | `year` | `int64` | `2025` |
| 9 | `sequence_features` | `str` | `[array([ 1.66689777e+01,  1.12446940e...` |
| 10 | `target_label` | `int64` | `0` |
| 11 | `anomaly_type` | `str` | `NORMAL` |

---

### 📄 `anomaly_sequences_train.csv`

- **Location**: `data_pipeline/data/features/anomaly_sequences_train.csv`
- **Dimensions**: **748,800 rows** × **11 columns**
- **File Size**: **53851.0 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `corridor_id` | `str` | `ARE:CHN:090411:Export` |
| 2 | `reporter_iso3` | `str` | `ARE` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `cmd_code` | `int64` | `90411` |
| 5 | `flow_desc` | `str` | `Export` |
| 6 | `window_end_period` | `int64` | `202212` |
| 7 | `target_period` | `int64` | `202301` |
| 8 | `year` | `int64` | `2023` |
| 9 | `sequence_features` | `str` | `[array([1.62721596e+01, 0.00000000e+0...` |
| 10 | `target_label` | `int64` | `1` |
| 11 | `anomaly_type` | `str` | `mirror_discrepancy` |

---

### 📄 `anomaly_sequences_val.csv`

- **Location**: `data_pipeline/data/features/anomaly_sequences_val.csv`
- **Dimensions**: **748,800 rows** × **11 columns**
- **File Size**: **53945.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `corridor_id` | `str` | `ARE:CHN:090411:Export` |
| 2 | `reporter_iso3` | `str` | `ARE` |
| 3 | `partner_iso3` | `str` | `CHN` |
| 4 | `cmd_code` | `int64` | `90411` |
| 5 | `flow_desc` | `str` | `Export` |
| 6 | `window_end_period` | `int64` | `202312` |
| 7 | `target_period` | `int64` | `202401` |
| 8 | `year` | `int64` | `2024` |
| 9 | `sequence_features` | `str` | `[array([ 1.64905415e+01,  7.88182557e...` |
| 10 | `target_label` | `int64` | `0` |
| 11 | `anomaly_type` | `str` | `NORMAL` |

---

### 📄 `partner_candidate_features.csv`

- **Location**: `data_pipeline/data/features/partner_candidate_features.csv`
- **Dimensions**: **5 rows** × **23 columns**
- **File Size**: **1.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `exporter_id` | `str` | `335800QXYZ9876543210` |
| 2 | `company_name` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `origin_country` | `str` | `IND` |
| 4 | `target_country` | `str` | `ARE` |
| 5 | `hs_code` | `int64` | `100630` |
| 6 | `product_description` | `str` | `Premium Pusa Basmati Rice (1121 Parbo...` |
| 7 | `certifications` | `str` | `ISO 22000, FSSAI, APEDA, US-FDA, Halal` |
| 8 | `annual_capacity_mt` | `float64` | `120000.0` |
| 9 | `min_order_qty_mt` | `float64` | `25.0` |
| 10 | `trade_volume_usd` | `float64` | `264213048.72` |
| 11 | `trade_growth_rate` | `float64` | `0.085` |
| 12 | `product_overlap_score` | `float64` | `0.95` |
| 13 | `partner_diversification` | `float64` | `14.0` |
| 14 | `country_gdp_growth` | `float64` | `6.8` |
| 15 | `applied_tariff_pct` | `float64` | `10.0` |
| 16 | `mfn_tariff_pct` | `float64` | `10.0` |
| 17 | `duty_savings_pct` | `float64` | `0.0` |
| 18 | `sanctions_exposure` | `float64` | `0.0` |
| 19 | `entity_verified` | `int64` | `1` |
| 20 | `ownership_complexity` | `int64` | `2` |
| 21 | `historical_anomaly_score` | `float64` | `0.04` |
| 22 | `dispute_rate_pct` | `float64` | `0.2` |
| 23 | `composite_match_score` | `float64` | `82.7` |

---

## 4. Processed Analytical Panels (`data_pipeline/data/processed/`)

*Normalized analytical panels, entity resolution tables, and harmonized cross-border observations.*

### 📄 `country_indicators.csv`

- **Location**: `data_pipeline/data/processed/country_indicators.csv`
- **Dimensions**: **1,760 rows** × **7 columns**
- **File Size**: **206.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `country_iso3` | `str` | `IND` |
| 2 | `indicator_code` | `str` | `NY.GDP.MKTP.CD` |
| 3 | `indicator_name` | `str` | `GDP (current US$)` |
| 4 | `year` | `int64` | `2015` |
| 5 | `value` | `float64` | `2100000000000.0` |
| 6 | `source` | `str` | `World Bank WDI API v2` |
| 7 | `retrieved_at` | `str` | `2026-08-20T01:03:06.261772+00:00` |

---

### 📄 `entity_master.csv`

- **Location**: `data_pipeline/data/processed/entity_master.csv`
- **Dimensions**: **7 rows** × **14 columns**
- **File Size**: **2.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `lei` | `str` | `335800QXYZ9876543210` |
| 2 | `legal_name` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `entity_status` | `str` | `ACTIVE` |
| 4 | `jurisdiction` | `str` | `IN-HR` |
| 5 | `legal_address` | `str` | `Plot 42, Sector 18, Industrial Area, ...` |
| 6 | `headquarters_address` | `str` | `DLF Cyber City, Tower B, Level 14, Gu...` |
| 7 | `parent_lei` | `str` | `335800BHARATHOLDING01` |
| 8 | `ultimate_parent_lei` | `str` | `335800BHARATHOLDING01` |
| 9 | `registration_authority` | `str` | `RA000394` |
| 10 | `registration_id` | `str` | `U01111HR2005PLC038921` |
| 11 | `managing_lou` | `str` | `33580050O287955U0873` |
| 12 | `initial_registration_date` | `str` | `2015-04-12T10:00:00Z` |
| 13 | `source` | `str` | `GLEIF_GOLDEN_COPY` |
| 14 | `retrieved_at` | `str` | `2026-08-20T01:03:05.925312+00:00` |

---

### 📄 `entity_resolution_matches.csv`

- **Location**: `data_pipeline/data/processed/entity_resolution_matches.csv`
- **Dimensions**: **5 rows** × **7 columns**
- **File Size**: **0.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `entity_id` | `str` | `335800QXYZ9876543210` |
| 2 | `source_entity_id` | `str` | `INVOICE_CANDIDATE_01` |
| 3 | `input_raw_name` | `str` | `Bharat Agro Commodities Exp Ltd.` |
| 4 | `matched_legal_name` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 5 | `match_method` | `str` | `EXACT_LEI` |
| 6 | `match_score` | `float64` | `100.0` |
| 7 | `match_confidence` | `str` | `HIGH_DETERMINISTIC` |

---

### 📄 `ocr_canonical.csv`

- **Location**: `data_pipeline/data/processed/ocr_canonical.csv`
- **Dimensions**: **45 rows** × **9 columns**
- **File Size**: **4.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `document_id` | `str` | `FUNSD_TRAIN_0001` |
| 2 | `image_path` | `str` | `data/raw/ocr/funsd/images/train_0001.png` |
| 3 | `split` | `str` | `train` |
| 4 | `tokens` | `str` | `['CERTIFICATE' 'OF' 'ORIGIN' 'Exporte...` |
| 5 | `bounding_boxes` | `str` | `[array([120,  45, 310,  75]) array([3...` |
| 6 | `labels` | `str` | `['HEADER' 'HEADER' 'HEADER' 'QUESTION...` |
| 7 | `links` | `str` | `[array([3, 4]) array([7, 9])]` |
| 8 | `source_dataset` | `str` | `FUNSD` |
| 9 | `source_version` | `str` | `v1.0` |

---

### 📄 `ofac_sdn_validated.csv`

- **Location**: `data_pipeline/data/processed/ofac_sdn_validated.csv`
- **Dimensions**: **3 rows** × **8 columns**
- **File Size**: **0.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `ent_num` | `int64` | `20891` |
| 2 | `legal_name` | `str` | `ROSOBORONEXPORT` |
| 3 | `entity_type` | `str` | `Company` |
| 4 | `sanctions_program` | `str` | `RUSSIA-EO14024` |
| 5 | `vessel_imo` | `float64` | `9238472.0` |
| 6 | `remarks` | `str` | `Tax ID 7708088920; Legal Entity Ident...` |
| 7 | `source` | `str` | `OFAC` |
| 8 | `retrieved_at` | `str` | `2026-08-20T01:03:06.199757+00:00` |

---

### 📄 `sanctions_entities.csv`

- **Location**: `data_pipeline/data/processed/sanctions_entities.csv`
- **Dimensions**: **8 rows** × **12 columns**
- **File Size**: **1.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `query_entity_id` | `str` | `QRY-os-entity-918231` |
| 2 | `matched_entity_id` | `str` | `os-entity-918231` |
| 3 | `legal_name` | `str` | `ROSOBORONEXPORT JSC` |
| 4 | `match_score` | `float64` | `100.0` |
| 5 | `matching_fields` | `str` | `name,alias,country` |
| 6 | `dataset` | `str` | `us_ofac_sdn;eu_fsf;un_sc;uk_ofsi` |
| 7 | `topic` | `str` | `sanction;debarment` |
| 8 | `source` | `str` | `OpenSanctions` |
| 9 | `decision` | `str` | `FLAGGED` |
| 10 | `sanctions_program` | `str` | `CAATSA Section 231; Ukraine-/Russia-R...` |
| 11 | `countries` | `str` | `ru` |
| 12 | `retrieved_at` | `str` | `2026-08-20T01:03:06.149679+00:00` |

---

### 📄 `tariff_features.csv`

- **Location**: `data_pipeline/data/processed/tariff_features.csv`
- **Dimensions**: **1,848 rows** × **13 columns**
- **File Size**: **243.9 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `reporter_iso3` | `str` | `IND` |
| 2 | `partner_iso3` | `int64` | `0` |
| 3 | `cmd_code` | `int64` | `100630` |
| 4 | `cmd_desc` | `str` | `Basmati / Milled Rice` |
| 5 | `year` | `int64` | `2015` |
| 6 | `mfn_rate` | `float64` | `10.0` |
| 7 | `pref_rate` | `float64` | `10.0` |
| 8 | `duty_savings_pct` | `float64` | `0.0` |
| 9 | `tariff_type` | `str` | `MFN_APPLIED` |
| 10 | `trade_agreement` | `str` | `WTO_MFN` |
| 11 | `nomenclature` | `str` | `HS2017` |
| 12 | `source` | `str` | `WITS / UNCTAD TRAINS` |
| 13 | `retrieved_at` | `str` | `2026-08-20T01:03:06.422180+00:00` |

---

### 📄 `trade_monthly_panel.csv`

- **Location**: `data_pipeline/data/processed/trade_monthly_panel.csv`
- **Dimensions**: **24,960 rows** × **10 columns**
- **File Size**: **2039.4 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `reporter_iso3` | `str` | `ARE` |
| 2 | `partner_iso3` | `str` | `CHN` |
| 3 | `cmd_code` | `int64` | `90411` |
| 4 | `period` | `int64` | `202201` |
| 5 | `export_value_usd` | `float64` | `11665655.53` |
| 6 | `export_net_weight` | `float64` | `1911204.99` |
| 7 | `import_value_usd` | `float64` | `5349657.89` |
| 8 | `import_net_weight` | `float64` | `1164883.15` |
| 9 | `export_unit_value` | `float64` | `6.1038` |
| 10 | `import_unit_value` | `float64` | `4.5924` |

---

### 📄 `trade_observations.csv`

- **Location**: `data_pipeline/data/processed/trade_observations.csv`
- **Dimensions**: **61,360 rows** × **19 columns**
- **File Size**: **14330.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `period` | `int64` | `2015` |
| 2 | `reporter_code` | `int64` | `784` |
| 3 | `reporter_iso3` | `str` | `ARE` |
| 4 | `partner_code` | `int64` | `156` |
| 5 | `partner_iso3` | `str` | `CHN` |
| 6 | `partner2_code` | `int64` | `0` |
| 7 | `cmd_code` | `int64` | `100630` |
| 8 | `cmd_desc` | `str` | `Semi-milled or wholly milled rice, wh...` |
| 9 | `flow_code` | `int64` | `2` |
| 10 | `flow_desc` | `str` | `Export` |
| 11 | `primary_value` | `float64` | `1170098.49` |
| 12 | `net_weight` | `float64` | `985273.16` |
| 13 | `quantity` | `float64` | `985273.16` |
| 14 | `quantity_unit` | `str` | `kg` |
| 15 | `mot_code` | `int64` | `1` |
| 16 | `customs_code` | `str` | `C00` |
| 17 | `classification_code` | `str` | `HS2017` |
| 18 | `source_file` | `str` | `comtrade_annual_ARE_CHN_2015_2025.json` |
| 19 | `retrieved_at` | `str` | `2026-08-20T01:01:24.973771+00:00` |

---

## 5. Converted Raw Source Datasets (`data_pipeline/data/raw/`)

*Parsed and structured CSV datasets converted directly from external sources (OFAC XML, UN/LOCODE, WITS, WTO, ISO, GLEIF).*

### 📄 `HS2012-17-BEC5_08_Nov_2018.csv`

- **Location**: `data_pipeline/data/raw/classification/hs_bec/HS2012-17-BEC5_08_Nov_2018.csv`
- **Dimensions**: **5,205 rows** × **30 columns**
- **File Size**: **3127.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `HS` | `str` | `H4` |
| 2 | `HS4` | `int64` | `101` |
| 3 | `HS4Desc` | `str` | `Live horses, asses, mules and hinnies.` |
| 4 | `HS6` | `int64` | `10121` |
| 5 | `HS6Desc` | `str` | `live purebred breeding horses` |
| 6 | `BEC5Code1` | `float64` | `712010.0` |
| 7 | `BEC5Code2` | `float64` | `—` |
| 8 | `BEC5Category` | `str` | `Health, pharmaceuticals, education, c...` |
| 9 | `BEC5EndUse` | `str` | `CAP` |
| 10 | `BEC5Processing` | `str` | `PRIMARY` |
| 11 | `BEC5Specification` | `str` | `GENERIC` |
| 12 | `BEC5Durability` | `str` | `NON-DURABLE` |
| 13 | `i3` | `int64` | `121` |
| 14 | `i31Desc` | `str` | `Farming of cattle, sheep, goats, hors...` |
| 15 | `standesci3` | `str` | `C01` |
| 16 | `i4` | `int64` | `142` |
| 17 | `i4Desc` | `str` | `Raising of horses and other equines` |
| 18 | `standesci4` | `str` | `D01` |
| 19 | `GTAP` | `float64` | `9.0` |
| 20 | `GTAPcode` | `str` | `ctl` |
| 21 | `GTAPdesc` | `str` | `Bovine cattle sheep and goats horses,` |
| 22 | `CPC1` | `float64` | `2113.0` |
| 23 | `CPCdesc` | `str` | `Horses  asses  mules and hinnies  live` |
| 24 | `BEC4Code` | `int64` | `41` |
| 25 | `BEC4ENDUSE` | `str` | `CAP` |
| 26 | `BEC4INT` | `float64` | `0.0` |
| 27 | `BEC4CONS` | `float64` | `0.0` |
| 28 | `BEC4CAP` | `float64` | `1.0` |
| 29 | `AddedByUNSD` | `int64` | `0` |
| 30 | `NoteByUNSD` | `float64` | `—` |

---

### 📄 `HS2017toBECConversionAndCorrelationTables.csv`

- **Location**: `data_pipeline/data/raw/classification/hs_bec/HS2017toBECConversionAndCorrelationTables.csv`
- **Dimensions**: **5,386 rows** × **2 columns**
- **File Size**: **58.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `From HS 2017` | `int64` | `10121` |
| 2 | `To BEC` | `int64` | `41` |

---

### 📄 `HS2017toSITC4ConversionAndCorrelationTables.csv`

- **Location**: `data_pipeline/data/raw/classification/hs_sitc/HS2017toSITC4ConversionAndCorrelationTables.csv`
- **Dimensions**: **5,386 rows** × **2 columns**
- **File Size**: **71.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `From HS 2017` | `int64` | `10121` |
| 2 | `To SITC Rev. 4` | `int64` | `15` |

---

### 📄 `iso_3166_countries_unece.csv`

- **Location**: `data_pipeline/data/raw/country_currency/iso_3166_countries_unece.csv`
- **Dimensions**: **249 rows** × **56 columns**
- **File Size**: **130.9 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `FIFA` | `str` | `AFG` |
| 2 | `Dial` | `str` | `93` |
| 3 | `ISO3166-1-Alpha-3` | `str` | `AFG` |
| 4 | `MARC` | `str` | `af` |
| 5 | `is_independent` | `str` | `Yes` |
| 6 | `ISO3166-1-numeric` | `int64` | `4` |
| 7 | `GAUL` | `int64` | `1` |
| 8 | `FIPS` | `str` | `AF` |
| 9 | `WMO` | `str` | `AF` |
| 10 | `ISO3166-1-Alpha-2` | `str` | `AF` |
| 11 | `ITU` | `str` | `AFG` |
| 12 | `IOC` | `str` | `AFG` |
| 13 | `DS` | `str` | `AFG` |
| 14 | `UNTERM Spanish Formal` | `str` | `la República Islámica del Afganistán` |
| 15 | `Global Code` | `int64` | `1` |
| 16 | `Intermediate Region Code` | `float64` | `17.0` |
| 17 | `official_name_fr` | `str` | `Afghanistan` |
| 18 | `UNTERM French Short` | `str` | `Afghanistan (l')` |
| 19 | `ISO4217-currency_name` | `str` | `Afghani` |
| 20 | `UNTERM Russian Formal` | `str` | `Исламская Республика Афганистан` |
| 21 | `UNTERM English Short` | `str` | `Afghanistan` |
| 22 | `ISO4217-currency_alphabetic_code` | `str` | `AFN` |
| 23 | `Small Island Developing States (SIDS)` | `str` | `x` |
| 24 | `UNTERM Spanish Short` | `str` | `Afganistán (el)` |
| 25 | `ISO4217-currency_numeric_code` | `str` | `971` |
| 26 | `UNTERM Chinese Formal` | `str` | `阿富汗伊斯兰共和国` |
| 27 | `UNTERM French Formal` | `str` | `la République islamique d'Afghanistan` |
| 28 | `UNTERM Russian Short` | `str` | `Афганистан` |
| 29 | `M49` | `int64` | `4` |
| 30 | `Sub-region Code` | `float64` | `34.0` |
| 31 | `Region Code` | `float64` | `142.0` |
| 32 | `official_name_ar` | `str` | `أفغانستان` |
| 33 | `ISO4217-currency_minor_unit` | `str` | `2` |
| 34 | `UNTERM Arabic Formal` | `str` | `جمهورية أفغانستان الإسلامية` |
| 35 | `UNTERM Chinese Short` | `str` | `阿富汗` |
| 36 | `Land Locked Developing Countries (LLDC)` | `str` | `x` |
| 37 | `Intermediate Region Name` | `str` | `Middle Africa` |
| 38 | `official_name_es` | `str` | `Afganistán` |
| 39 | `UNTERM English Formal` | `str` | `the Islamic Republic of Afghanistan` |
| 40 | `official_name_cn` | `str` | `阿富汗` |
| 41 | `official_name_en` | `str` | `Afghanistan` |
| 42 | `ISO4217-currency_country_name` | `str` | `AFGHANISTAN` |
| 43 | `Least Developed Countries (LDC)` | `str` | `x` |
| 44 | `Region Name` | `str` | `Asia` |
| 45 | `UNTERM Arabic Short` | `str` | `أفغانستان` |
| 46 | `Sub-region Name` | `str` | `Southern Asia` |
| 47 | `official_name_ru` | `str` | `Афганистан` |
| 48 | `Global Name` | `str` | `World` |
| 49 | `Capital` | `str` | `Kabul` |
| 50 | `Continent` | `str` | `AS` |
| 51 | `TLD` | `str` | `.af` |
| 52 | `Languages` | `str` | `fa-AF,ps,uz-AF,tk` |
| 53 | `Geoname ID` | `int64` | `1149361` |
| 54 | `CLDR display name` | `str` | `Afghanistan` |
| 55 | `EDGAR` | `str` | `B2` |
| 56 | `wikidata_id` | `str` | `https://www.wikidata.org/wiki/Q889` |

---

### 📄 `iso_4217_currencies_official.csv`

- **Location**: `data_pipeline/data/raw/country_currency/iso_4217_currencies_official.csv`
- **Dimensions**: **280 rows** × **5 columns**
- **File Size**: **10.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `country_name` | `str` | `AFGHANISTAN` |
| 2 | `currency_name` | `str` | `Afghani` |
| 3 | `currency_alphabetic_code` | `str` | `AFN` |
| 4 | `currency_numeric_code` | `float64` | `971.0` |
| 5 | `minor_units` | `float64` | `2.0` |

---

### 📄 `dataset_catalog.csv`

- **Location**: `data_pipeline/data/raw/dataset_catalog.csv`
- **Dimensions**: **11 rows** × **14 columns**
- **File Size**: **6.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset_name` | `str` | `DGFT Appendix 3 - SCOMET List` |
| 2 | `organization` | `str` | `Directorate General of Foreign Trade ...` |
| 3 | `official_source_url` | `str` | `https://www.dgft.gov.in` |
| 4 | `direct_download_url` | `str` | `https://content.dgft.gov.in/Website/a...` |
| 5 | `version` | `str` | `Current Official Appendix 3 (Updated ...` |
| 6 | `release_date` | `str` | `2024-03-15` |
| 7 | `retrieval_date` | `str` | `2026-08-20` |
| 8 | `filename` | `str` | `append3_0.pdf` |
| 9 | `format` | `str` | `PDF` |
| 10 | `file_size` | `str` | `1,820,746 bytes (1.74 MB)` |
| 11 | `sha256` | `str` | `dafe0eef50e7be28e7a9bb4f0672f4e53e242...` |
| 12 | `license_or_usage_notes` | `str` | `Official Government of India Public D...` |
| 13 | `status` | `str` | `DOWNLOADED` |
| 14 | `notes` | `str` | `India export control list for Special...` |

---

### 📄 `gleif_golden_copy_latest.csv`

- **Location**: `data_pipeline/data/raw/gleif/gleif_golden_copy_latest.csv`
- **Dimensions**: **7 rows** × **13 columns**
- **File Size**: **2.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `LEI` | `str` | `335800QXYZ9876543210` |
| 2 | `LegalName` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `EntityStatus` | `str` | `ACTIVE` |
| 4 | `LegalJurisdiction` | `str` | `IN-HR` |
| 5 | `LegalAddress` | `str` | `Plot 42, Sector 18, Industrial Area, ...` |
| 6 | `HeadquartersAddress` | `str` | `DLF Cyber City, Tower B, Level 14, Gu...` |
| 7 | `ParentLEI` | `str` | `335800BHARATHOLDING01` |
| 8 | `UltimateParentLEI` | `str` | `335800BHARATHOLDING01` |
| 9 | `RegistrationAuthorityID` | `str` | `RA000394` |
| 10 | `RegistrationAuthorityEntityID` | `str` | `U01111HR2005PLC038921` |
| 11 | `CountryISO3` | `str` | `IND` |
| 12 | `Source` | `str` | `GLEIF_GOLDEN_COPY_L1_L2` |
| 13 | `RetrievedAt` | `str` | `2026-08-20T01:33:01.018007+00:00` |

---

### 📄 `gleif_golden_copy_level1_latest.csv`

- **Location**: `data_pipeline/data/raw/gleif/gleif_golden_copy_level1_latest.csv`
- **Dimensions**: **7 rows** × **22 columns**
- **File Size**: **2.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `LEI` | `str` | `335800QXYZ9876543210` |
| 2 | `LegalName` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `EntityStatus` | `str` | `ACTIVE` |
| 4 | `LegalJurisdiction` | `str` | `IN-HR` |
| 5 | `LegalAddress_FirstAddressLine` | `str` | `Plot 42, Sector 18, Industrial Area` |
| 6 | `LegalAddress_City` | `str` | `Karnal` |
| 7 | `LegalAddress_Region` | `str` | `IN-HR` |
| 8 | `LegalAddress_Country` | `str` | `IN` |
| 9 | `LegalAddress_PostalCode` | `str` | `132001` |
| 10 | `HeadquartersAddress_FirstAddressLine` | `str` | `DLF Cyber City, Tower B, Level 14` |
| 11 | `HeadquartersAddress_City` | `str` | `Gurugram` |
| 12 | `HeadquartersAddress_Region` | `str` | `IN-HR` |
| 13 | `HeadquartersAddress_Country` | `str` | `IN` |
| 14 | `HeadquartersAddress_PostalCode` | `str` | `122002` |
| 15 | `RegistrationAuthorityID` | `str` | `RA000394` |
| 16 | `RegistrationAuthorityEntityID` | `str` | `U01111HR2005PLC038921` |
| 17 | `ManagingLOU` | `str` | `33580050O287955U0873` |
| 18 | `InitialRegistrationDate` | `str` | `2015-04-12T10:00:00Z` |
| 19 | `LastUpdateDate` | `str` | `2026-01-15T08:30:00Z` |
| 20 | `ParentLEI` | `str` | `335800BHARATHOLDING01` |
| 21 | `UltimateParentLEI` | `str` | `335800BHARATHOLDING01` |
| 22 | `RelationshipType` | `str` | `IS_DIRECTLY_CONSOLIDATED_BY` |

---

### 📄 `sdn_enhanced.csv`

- **Location**: `data_pipeline/data/raw/ofac/sdn_enhanced.csv`
- **Dimensions**: **19,202 rows** × **6 columns**
- **File Size**: **1198.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `entity_id` | `int64` | `36` |
| 2 | `formatted_full_name` | `str` | `AEROCARIBBEAN AIRLINES` |
| 3 | `entity_type` | `str` | `Entity` |
| 4 | `countries` | `str` | `Cuba` |
| 5 | `programs` | `str` | `SDN List` |
| 6 | `remarks` | `float64` | `—` |

---

### 📄 `opensanctions_sanctions_stream_20260820_014945.csv`

- **Location**: `data_pipeline/data/raw/sanctions/opensanctions_sanctions_stream_20260820_014945.csv`
- **Dimensions**: **79,970 rows** × **16 columns**
- **File Size**: **66109.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `id` | `str` | `NK-223BSVnvKHYB96adihNXXZ` |
| 2 | `schema` | `str` | `Vessel` |
| 3 | `name` | `str` | `ABRAU` |
| 4 | `aliases` | `str` | `Shwe Kokko Special Economic Zone;Yata...` |
| 5 | `birth_date` | `str` | `1979-01-01` |
| 6 | `countries` | `str` | `mm` |
| 7 | `addresses` | `str` | `Hpa-An City;Shwe Kokko Village, Myawa...` |
| 8 | `identifiers` | `str` | `IMO9422964` |
| 9 | `sanctions` | `str` | `2026-07-24` |
| 10 | `phones` | `float64` | `78007070076.0` |
| 11 | `emails` | `str` | `ehmz@zelinskygroup.com` |
| 12 | `program_ids` | `str` | `EU-MARE` |
| 13 | `dataset` | `str` | `EU Council Official Journal Sanctione...` |
| 14 | `first_seen` | `str` | `2026-07-24T11:41:22` |
| 15 | `last_seen` | `str` | `2026-08-19T18:35:03` |
| 16 | `last_change` | `str` | `2026-07-30T08:48:01` |

---

### 📄 `sanctions_and_ofac_targets_latest.csv`

- **Location**: `data_pipeline/data/raw/sanctions/sanctions_and_ofac_targets_latest.csv`
- **Dimensions**: **5 rows** × **9 columns**
- **File Size**: **1.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `entity_id` | `str` | `OS-ENT-918231` |
| 2 | `name` | `str` | `ROSOBORONEXPORT JSC` |
| 3 | `alias` | `str` | `Rosoboronexport; Federal State Unitar...` |
| 4 | `country_iso3` | `str` | `RUS` |
| 5 | `topic` | `str` | `sanction;debarment` |
| 6 | `dataset` | `str` | `OpenSanctions;us_ofac_sdn;eu_fsf;un_sc` |
| 7 | `source_record_id` | `str` | `20891` |
| 8 | `source_url` | `str` | `https://data.opensanctions.org/datase...` |
| 9 | `retrieved_at` | `str` | `2026-08-20T01:33:01.038207+00:00` |

---

### 📄 `SubdivisionCodes.csv`

- **Location**: `data_pipeline/data/raw/unlocode/release/csv/SubdivisionCodes.csv`
- **Dimensions**: **4,675 rows** × **4 columns**
- **File Size**: **134.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `AD` | `str` | `AD` |
| 2 | `02` | `str` | `03` |
| 3 | `Canillo` | `str` | `Encamp` |
| 4 | `Parish` | `str` | `Parish` |

---

### 📄 `UNLOCODE CodeListPart1.csv`

- **Location**: `data_pipeline/data/raw/unlocode/release/csv/UNLOCODE CodeListPart1.csv`
- **Dimensions**: **54,838 rows** × **12 columns**
- **File Size**: **3494.9 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `Unnamed: 0` | `float64` | `—` |
| 2 | `AD` | `str` | `AD` |
| 3 | `Unnamed: 2` | `str` | `ALV` |
| 4 | `.ANDORRA` | `str` | `Andorra la Vella` |
| 5 | `Unnamed: 4` | `str` | `Andorra la Vella` |
| 6 | `Unnamed: 5` | `str` | `04` |
| 7 | `Unnamed: 6` | `str` | `--34-6--` |
| 8 | `Unnamed: 7` | `str` | `AI` |
| 9 | `Unnamed: 8` | `float64` | `601.0` |
| 10 | `Unnamed: 9` | `str` | `QAJ` |
| 11 | `Unnamed: 10` | `str` | `4230N 00131E` |
| 12 | `Unnamed: 11` | `str` | `Function is 1 and coordinates is 2423...` |

---

### 📄 `UNLOCODE CodeListPart2.csv`

- **Location**: `data_pipeline/data/raw/unlocode/release/csv/UNLOCODE CodeListPart2.csv`
- **Dimensions**: **27,696 rows** × **12 columns**
- **File Size**: **1661.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `Unnamed: 0` | `float64` | `—` |
| 2 | `GA` | `str` | `GA` |
| 3 | `Unnamed: 2` | `str` | `AKE` |
| 4 | `.GABON` | `str` | `Akieni` |
| 5 | `Unnamed: 4` | `str` | `Akieni` |
| 6 | `Unnamed: 5` | `float64` | `1.0` |
| 7 | `Unnamed: 6` | `str` | `---4----` |
| 8 | `Unnamed: 7` | `str` | `AI` |
| 9 | `Unnamed: 8` | `int64` | `9601` |
| 10 | `Unnamed: 9` | `float64` | `—` |
| 11 | `Unnamed: 10` | `str` | `0045S 00927E` |
| 12 | `Unnamed: 11` | `float64` | `—` |

---

### 📄 `UNLOCODE CodeListPart3.csv`

- **Location**: `data_pipeline/data/raw/unlocode/release/csv/UNLOCODE CodeListPart3.csv`
- **Dimensions**: **33,996 rows** × **12 columns**
- **File Size**: **1972.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `Unnamed: 0` | `float64` | `—` |
| 2 | `OM` | `str` | `OM` |
| 3 | `Unnamed: 2` | `str` | `ALA` |
| 4 | `.OMAN` | `str` | `Al Azaiba` |
| 5 | `Unnamed: 4` | `str` | `Al Azaiba` |
| 6 | `Unnamed: 5` | `str` | `MA` |
| 7 | `Unnamed: 6` | `str` | `--3-----` |
| 8 | `Unnamed: 7` | `str` | `RL` |
| 9 | `Unnamed: 8` | `float64` | `1301.0` |
| 10 | `Unnamed: 9` | `float64` | `—` |
| 11 | `Unnamed: 10` | `str` | `2336S 05832E` |
| 12 | `Unnamed: 11` | `float64` | `—` |

---

### 📄 `wto_all_rtas_list_latest.csv`

- **Location**: `data_pipeline/data/raw/wto_rta/wto_all_rtas_list_latest.csv`
- **Dimensions**: **936 rows** × **28 columns**
- **File Size**: **283.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `RTA ID` | `int64` | `155` |
| 2 | `RTA Name` | `str` | `Australia - GCC` |
| 3 | `Coverage` | `str` | `Goods & Services` |
| 4 | `Type` | `str` | `EIA` |
| 5 | `Notification` | `str` | `GATS Art. V` |
| 6 | `Status` | `str` | `Early announcement-Under negotiation` |
| 7 | `Date of Signature (G)` | `str` | `2015-06-22` |
| 8 | `Date of Signature (S)` | `str` | `2025-01-22` |
| 9 | `Date of Notification (G)` | `str` | `2024-12-10` |
| 10 | `Date of Notification (S)` | `str` | `2024-04-29` |
| 11 | `Date of Entry into Force (G)` | `str` | `2010-09-12` |
| 12 | `Date of Entry into Force (S)` | `str` | `2021-04-05` |
| 13 | `Inactive Date` | `float64` | `—` |
| 14 | `Accession?` | `str` | `No` |
| 15 | `RTA Composition` | `str` | `Plurilateral` |
| 16 | `Region` | `str` | `Oceania; Middle East` |
| 17 | `Cross-regional` | `str` | ` Yes` |
| 18 | `All Parties WTO members?` | `str` | `Yes` |
| 19 | `Current signatories` | `str` | `Costa Rica; Guatemala; Panama; Europe...` |
| 20 | `Original signatories` | `str` | `Costa Rica; Guatemala; Panama; Europe...` |
| 21 | `Specific Entry/Exit dates` | `str` | `Brunei Darussalam(27-Jul-2021 - ); My...` |
| 22 | `WTO Consideration Process (G)` | `str` | `Factual Presentation issued` |
| 23 | `Consideration Date (G)` | `str` | `2026-06-25` |
| 24 | `WTO Consideration Process (S)` | `str` | `Factual Presentation on hold` |
| 25 | `Consideration Date (S)` | `str` | `2026-06-25` |
| 26 | `End of implementation period (G)` | `float64` | `2038.0` |
| 27 | `End of implementation period (S)` | `float64` | `2036.0` |
| 28 | `Remarks` | `str` | `The EU would like to inform the WTO M...` |

---

## 6. Pipeline Manifests & Request Tracking (`data_pipeline/data/manifests/`)

*Audit trails of API requests, download receipts, and data provenance manifests.*

### 📄 `browser_downloads.csv`

- **Location**: `data_pipeline/data/manifests/browser_downloads.csv`
- **Dimensions**: **4 rows** × **7 columns**
- **File Size**: **1.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `source` | `str` | `UN_Comtrade` |
| 2 | `page_url` | `str` | `https://comtradeplus.un.org/` |
| 3 | `filters` | `str` | `reporter=IND;partners=all;flows=X,M;c...` |
| 4 | `filename` | `str` | `comtrade_raw_IND_WLD_annual_2015_2025...` |
| 5 | `retrieved_at` | `str` | `2026-08-20T01:17:41.572977+00:00` |
| 6 | `sha256` | `str` | `a1b2c3d4e5f67890123456789abcdef012345...` |
| 7 | `status` | `str` | `PROGRAMMATIC_API_VERIFIED` |

---

### 📄 `comtrade_requests.csv`

- **Location**: `data_pipeline/data/manifests/comtrade_requests.csv`
- **Dimensions**: **30 rows** × **10 columns**
- **File Size**: **5.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `request_id` | `str` | `REQ_COMTRADE_ANN_IND_WLD` |
| 2 | `period` | `str` | `2015-2025` |
| 3 | `reporter` | `str` | `IND` |
| 4 | `partner` | `str` | `WLD` |
| 5 | `flow` | `str` | `Exports+Imports` |
| 6 | `classification` | `str` | `HS` |
| 7 | `url_or_endpoint` | `str` | `https://comtradeapi.un.org/public/v1/...` |
| 8 | `status` | `str` | `CACHED_VALIDATED` |
| 9 | `records` | `int64` | `176` |
| 10 | `retrieved_at` | `str` | `2026-08-20T01:33:00.788728+00:00` |

---

### 📄 `consolidation_decisions.csv`

- **Location**: `data_pipeline/data/manifests/consolidation_decisions.csv`
- **Dimensions**: **1 rows** × **8 columns**
- **File Size**: **0.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `UN_Comtrade` |
| 2 | `file_a` | `str` | `comtrade_annual_*.json` |
| 3 | `file_b` | `str` | `comtrade_monthly_*.json` |
| 4 | `relationship` | `str` | `MULTI_TEMPORAL_RESOLUTION` |
| 5 | `overlap_pct` | `float64` | `25.0` |
| 6 | `decision` | `str` | `PRESERVE_BOTH_IN_DISTINCT_PANELS` |
| 7 | `reason` | `str` | `Annual provides 10-year macroeconomic...` |
| 8 | `preferred_source` | `str` | `UN Comtrade API v1` |

---

### 📄 `data_manifest.csv`

- **Location**: `data_pipeline/data/manifests/data_manifest.csv`
- **Dimensions**: **13 rows** × **12 columns**
- **File Size**: **5.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset_name` | `str` | `UN_Comtrade_Observations` |
| 2 | `dataset_version` | `str` | `2026.03_HS2022` |
| 3 | `source` | `str` | `United Nations Statistics Division (U...` |
| 4 | `source_type` | `str` | `OFFICIAL_API` |
| 5 | `retrieval_timestamp` | `str` | `2026-08-20T01:03:40.597224+00:00` |
| 6 | `raw_path` | `str` | `data/raw/comtrade/` |
| 7 | `processed_path` | `str` | `data/processed/trade_observations.par...` |
| 8 | `sha256` | `str` | `fdeb6f133adeb419681a1664aecca2cf3f235...` |
| 9 | `row_count` | `int64` | `61360` |
| 10 | `column_count` | `int64` | `19` |
| 11 | `license` | `str` | `UN Comtrade Open Data Terms` |
| 12 | `notes` | `str` | `Customs-level bilateral commodity tra...` |

---

### 📄 `opensanctions_requests.csv`

- **Location**: `data_pipeline/data/manifests/opensanctions_requests.csv`
- **Dimensions**: **9 rows** × **7 columns**
- **File Size**: **1.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `request_id` | `str` | `REQ_OS_MATCH_b34906f8` |
| 2 | `endpoint` | `str` | `/match/sanctions` |
| 3 | `query` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMIT...` |
| 4 | `status` | `str` | `SUCCESS` |
| 5 | `records_count` | `int64` | `0` |
| 6 | `raw_path` | `float64` | `—` |
| 7 | `retrieved_at` | `str` | `2026-08-20T01:49:33.393625+00:00` |

---

## 7. Governance, Audit & Quality Reports (`data_pipeline/data/reports/`)

*Join audits, missingness statistics, duplication reports, and comprehensive data dictionaries.*

### 📄 `acquisition_report.csv`

- **Location**: `data_pipeline/data/reports/acquisition_report.csv`
- **Dimensions**: **6 rows** × **9 columns**
- **File Size**: **1.0 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `source_name` | `str` | `UN_Comtrade` |
| 2 | `source_authority` | `str` | `United Nations (UNSD)` |
| 3 | `acquisition_method` | `str` | `PROGRAMMATIC_REST_API` |
| 4 | `credential_required` | `str` | `NO (Public Preview API)` |
| 5 | `raw_files_downloaded` | `int64` | `30` |
| 6 | `raw_records_acquired` | `int64` | `75520` |
| 7 | `retained_staging_rows` | `int64` | `75520` |
| 8 | `target_staging_table` | `str` | `comtrade_india_world.csv` |
| 9 | `status` | `str` | `VALIDATED_ACQUIRED` |

---

### 📄 `consolidation_decisions.csv`

- **Location**: `data_pipeline/data/reports/consolidation_decisions.csv`
- **Dimensions**: **1 rows** × **8 columns**
- **File Size**: **0.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `UN_Comtrade` |
| 2 | `file_a` | `str` | `comtrade_annual_*.json` |
| 3 | `file_b` | `str` | `comtrade_monthly_*.json` |
| 4 | `relationship` | `str` | `MULTI_TEMPORAL_RESOLUTION` |
| 5 | `overlap_pct` | `float64` | `25.0` |
| 6 | `decision` | `str` | `PRESERVE_BOTH_IN_DISTINCT_PANELS` |
| 7 | `reason` | `str` | `Annual provides 10-year macroeconomic...` |
| 8 | `preferred_source` | `str` | `UN Comtrade API v1` |

---

### 📄 `data_quality_summary.csv`

- **Location**: `data_pipeline/data/reports/data_quality_summary.csv`
- **Dimensions**: **8 rows** × **7 columns**
- **File Size**: **0.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `trade_observations` |
| 2 | `check_name` | `str` | `NULL_PRIMARY_VALUE_CHECK` |
| 3 | `target_column` | `str` | `primary_value` |
| 4 | `violations` | `int64` | `0` |
| 5 | `violation_pct` | `float64` | `0.0` |
| 6 | `status` | `str` | `PASSED` |
| 7 | `severity` | `str` | `CRITICAL` |

---

### 📄 `duplicate_report.csv`

- **Location**: `data_pipeline/data/reports/duplicate_report.csv`
- **Dimensions**: **1 rows** × **8 columns**
- **File Size**: **0.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `UN_Comtrade_India_Raw` |
| 2 | `total_raw_files` | `int64` | `161` |
| 3 | `exact_file_duplicates` | `int64` | `0` |
| 4 | `total_raw_records` | `int64` | `75520` |
| 5 | `logical_duplicate_rows` | `int64` | `15104` |
| 6 | `duplicate_percentage` | `float64` | `20.0` |
| 7 | `composite_key_dimensions` | `str` | `period,reporterISO,partnerISO,cmdCode...` |
| 8 | `resolution_action` | `str` | `PRESERVE_ALL_CONFLICTS_WITH_PROVENANCE` |

---

### 📄 `eda_data_dictionary_v2.csv`

- **Location**: `data_pipeline/data/reports/eda_data_dictionary_v2.csv`
- **Dimensions**: **94 rows** × **9 columns**
- **File Size**: **14.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `01_partner_discovery_eda.csv` |
| 2 | `column` | `str` | `reporter_iso3` |
| 3 | `description` | `str` | `ISO 3166-1 alpha-3 code of declaring ...` |
| 4 | `source` | `str` | `UN Comtrade` |
| 5 | `grain` | `str` | `Corridor` |
| 6 | `data_type` | `str` | `VARCHAR(3)` |
| 7 | `unit` | `str` | `ISO3` |
| 8 | `join_role` | `str` | `BASE_KEY` |
| 9 | `notes` | `str` | `Strictly IND` |

---

### 📄 `file_duplicates.csv`

- **Location**: `data_pipeline/data/reports/file_duplicates.csv`
- **Dimensions**: **1 rows** × **5 columns**
- **File Size**: **0.1 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `original_file` | `float64` | `—` |
| 2 | `duplicate_file` | `float64` | `—` |
| 3 | `sha256` | `float64` | `—` |
| 4 | `size_bytes` | `int64` | `0` |
| 5 | `action` | `str` | `ZERO_EXACT_FILE_DUPLICATES_DETECTED` |

---

### 📄 `final_dataset_audit_v2.csv`

- **Location**: `data_pipeline/data/reports/final_dataset_audit_v2.csv`
- **Dimensions**: **5 rows** × **8 columns**
- **File Size**: **0.5 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `01_partner_discovery_eda.csv` |
| 2 | `rows` | `int64` | `1408` |
| 3 | `columns` | `int64` | `47` |
| 4 | `grain` | `str` | `India × partner × HS6 × year` |
| 5 | `duplicate_key_rows` | `int64` | `0` |
| 6 | `missing_percentage` | `str` | `7.05%` |
| 7 | `source_count` | `int64` | `7` |
| 8 | `status` | `str` | `EDA_READY_VALIDATED` |

---

### 📄 `final_parquet_build_v2.csv`

- **Location**: `data_pipeline/data/reports/final_parquet_build_v2.csv`
- **Dimensions**: **5 rows** × **14 columns**
- **File Size**: **1.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `01_partner_discovery.parquet` |
| 2 | `path` | `str` | `data_pipeline/data/processed/01_partn...` |
| 3 | `rows` | `int64` | `1408` |
| 4 | `columns` | `int64` | `42` |
| 5 | `grain` | `str` | `reporter_iso3 × partner_iso3 × hs6 × ...` |
| 6 | `primary_key` | `str` | `reporter_iso3, partner_iso3, hs6, year` |
| 7 | `duplicate_key_rows` | `int64` | `0` |
| 8 | `null_rate_pct` | `str` | `3.87%` |
| 9 | `source_tables` | `str` | `comtrade_india_world.csv; worldbank_c...` |
| 10 | `join_count` | `int64` | `6` |
| 11 | `synthetic_formula_count` | `int64` | `2` |
| 12 | `derived_count` | `int64` | `5` |
| 13 | `imputed_count` | `int64` | `0` |
| 14 | `status` | `str` | `CANONICAL_EDA_READY` |

---

### 📄 `final_parquet_join_audit_v2.csv`

- **Location**: `data_pipeline/data/reports/final_parquet_join_audit_v2.csv`
- **Dimensions**: **12 rows** × **16 columns**
- **File Size**: **2.6 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `left_dataset` | `str` | `01_partner_discovery` |
| 2 | `right_dataset` | `str` | `raw/iso_3166_countries_unece.csv` |
| 3 | `left_grain` | `str` | `reporter_iso3 × partner_iso3 × hs6 × ...` |
| 4 | `right_grain` | `str` | `partner_iso3` |
| 5 | `join_key` | `str` | `partner_iso3` |
| 6 | `join_type` | `str` | `LEFT (many-to-one)` |
| 7 | `left_rows_before` | `int64` | `1408` |
| 8 | `right_rows` | `int64` | `249` |
| 9 | `matched_rows` | `int64` | `1320` |
| 10 | `unmatched_left` | `int64` | `88` |
| 11 | `unmatched_right` | `int64` | `-1071` |
| 12 | `duplicate_right_keys` | `int64` | `0` |
| 13 | `rows_after_join` | `int64` | `1408` |
| 14 | `row_multiplier` | `float64` | `1.0` |
| 15 | `match_rate` | `str` | `93.75%` |
| 16 | `action` | `str` | `JOINED` |

---

### 📄 `gleif_dedup_report.csv`

- **Location**: `data_pipeline/data/reports/gleif_dedup_report.csv`
- **Dimensions**: **7 rows** × **5 columns**
- **File Size**: **0.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `lei` | `str` | `335800QXYZ9876543210` |
| 2 | `legal_name` | `str` | `BHARAT AGRO COMMODITIES EXPORTS LIMITED` |
| 3 | `status` | `str` | `ACTIVE` |
| 4 | `is_duplicate` | `bool` | `False` |
| 5 | `resolution` | `str` | `UNIQUE_PRIMARY_RECORD` |

---

### 📄 `join_audit_v2.csv`

- **Location**: `data_pipeline/data/reports/join_audit_v2.csv`
- **Dimensions**: **7 rows** × **14 columns**
- **File Size**: **1.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `left_dataset` | `str` | `comtrade_india_world.csv (India Trade...` |
| 2 | `right_dataset` | `str` | `iso_3166_countries_unece.csv (Country...` |
| 3 | `left_grain` | `str` | `India × partner × HS6 × year` |
| 4 | `right_grain` | `str` | `country (ISO-3)` |
| 5 | `join_key` | `str` | `partner_iso3 == ISO3166-1-Alpha-3` |
| 6 | `join_type` | `str` | `LEFT_OUTER` |
| 7 | `left_rows_before` | `int64` | `128` |
| 8 | `right_rows` | `int64` | `249` |
| 9 | `matched_rows` | `int64` | `128` |
| 10 | `unmatched_left` | `int64` | `0` |
| 11 | `match_rate` | `str` | `100.0%` |
| 12 | `duplicate_right_keys` | `int64` | `0` |
| 13 | `rows_after_join` | `int64` | `128` |
| 14 | `row_multiplier` | `float64` | `1.0` |

---

### 📄 `join_report.csv`

- **Location**: `data_pipeline/data/reports/join_report.csv`
- **Dimensions**: **5 rows** × **10 columns**
- **File Size**: **0.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `left_table` | `str` | `01_partner_discovery (Base Corridors)` |
| 2 | `right_table` | `str` | `entity_master.csv` |
| 3 | `join_key` | `str` | `country_iso3 == partner_iso3` |
| 4 | `left_rows` | `int64` | `128` |
| 5 | `right_rows` | `int64` | `7` |
| 6 | `matched_rows` | `int64` | `48` |
| 7 | `unmatched_left` | `int64` | `80` |
| 8 | `unmatched_right` | `int64` | `0` |
| 9 | `match_rate` | `float64` | `37.5` |
| 10 | `match_type` | `str` | `LEFT_OUTER_ENRICHMENT` |

---

### 📄 `missingness_report.csv`

- **Location**: `data_pipeline/data/reports/missingness_report.csv`
- **Dimensions**: **164 rows** × **5 columns**
- **File Size**: **7.8 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `comtrade_india_world.csv` |
| 2 | `column` | `str` | `period` |
| 3 | `rows` | `int64` | `75520` |
| 4 | `missing_rows` | `int64` | `0` |
| 5 | `missing_percentage` | `float64` | `0.0` |

---

### 📄 `missingness_v2.csv`

- **Location**: `data_pipeline/data/reports/missingness_v2.csv`
- **Dimensions**: **144 rows** × **5 columns**
- **File Size**: **7.7 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `01_partner_discovery_eda.csv` |
| 2 | `column` | `str` | `reporter_iso3` |
| 3 | `rows` | `int64` | `1408` |
| 4 | `missing_rows` | `int64` | `0` |
| 5 | `missing_percentage` | `str` | `0.00%` |

---

### 📄 `overlap_report.csv`

- **Location**: `data_pipeline/data/reports/overlap_report.csv`
- **Dimensions**: **1 rows** × **6 columns**
- **File Size**: **0.2 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset_a` | `str` | `UN_Comtrade_Annual` |
| 2 | `dataset_b` | `str` | `UN_Comtrade_Monthly` |
| 3 | `overlap_dimension` | `str` | `period (2022-2025)` |
| 4 | `overlap_records` | `int64` | `49920` |
| 5 | `resolution_strategy` | `str` | `MONTHLY_PANEL_AGGREGATION_PRECEDENCE` |
| 6 | `status` | `str` | `HARMONIZED` |

---

### 📄 `partner_discovery_join_report.csv`

- **Location**: `data_pipeline/data/reports/partner_discovery_join_report.csv`
- **Dimensions**: **1 rows** × **11 columns**
- **File Size**: **0.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `stage` | `str` | `Dataset_01_Rebuild` |
| 2 | `base_table` | `str` | `comtrade_india_world.csv (Corridors)` |
| 3 | `base_rows` | `int64` | `128` |
| 4 | `gleif_left_join_matched` | `int64` | `48` |
| 5 | `gleif_match_rate_pct` | `float64` | `37.5` |
| 6 | `sanctions_left_join_matched` | `int64` | `8` |
| 7 | `worldbank_left_join_matched` | `int64` | `120` |
| 8 | `worldbank_match_rate_pct` | `float64` | `93.75` |
| 9 | `tariff_left_join_matched` | `int64` | `128` |
| 10 | `final_rows_retained` | `int64` | `128` |
| 11 | `base_reduction_detected` | `bool` | `False` |

---

### 📄 `row_duplicates.csv`

- **Location**: `data_pipeline/data/reports/row_duplicates.csv`
- **Dimensions**: **3 rows** × **6 columns**
- **File Size**: **0.3 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset` | `str` | `trade_observations` |
| 2 | `total_rows` | `int64` | `61360` |
| 3 | `duplicate_rows` | `int64` | `0` |
| 4 | `duplicate_pct` | `float64` | `0.0` |
| 5 | `primary_keys` | `str` | `period,reporter_iso3,partner_iso3,cmd...` |
| 6 | `status` | `str` | `VALIDATED_UNIQUE` |

---

### 📄 `schema_conflicts.csv`

- **Location**: `data_pipeline/data/reports/schema_conflicts.csv`
- **Dimensions**: **2 rows** × **6 columns**
- **File Size**: **0.4 KB**

| # | Column Name | Inferred Type | Sample / Representation |
| :-: | :--- | :--- | :--- |
| 1 | `dataset_name` | `str` | `trade_observations` |
| 2 | `expected_schema` | `str` | `period,reporter_iso3,partner_iso3,cmd...` |
| 3 | `actual_schema` | `str` | `period,reporter_iso3,partner_iso3,cmd...` |
| 4 | `drift_detected` | `bool` | `False` |
| 5 | `type_mismatches` | `int64` | `0` |
| 6 | `action` | `str` | `PASS` |

---

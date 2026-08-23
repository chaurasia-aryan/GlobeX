# Master Data Schema Dictionary — GLOBEX Trade OS

This document details the exact schemas across raw, canonical processed tables, engineered features, sequence tensors, and manifests.

---

## 1. Canonical Trade Observations (`processed/trade_observations.parquet`)

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `period` | `String` | Observation period (`YYYY` or `YYYYMM`) |
| `reporter_code` | `Int32` | UN M49 numerical country code of reporting territory |
| `reporter_iso3` | `String` | ISO 3166-1 alpha-3 code of reporting country (e.g., `IND`) |
| `partner_code` | `Int32` | UN M49 numerical country code of primary trading partner |
| `partner_iso3` | `String` | ISO 3166-1 alpha-3 code of trading partner (e.g., `ARE`, `USA`) |
| `partner2_code` | `Int32` | Second partner code (consignment origin/transit) |
| `cmd_code` | `String` | Harmonized System 6-digit commodity code (e.g., `100630`) |
| `cmd_desc` | `String` | Official WCO commodity description |
| `flow_code` | `Int32` | Trade flow numerical code (1=Import, 2=Export, 3=Re-export, 4=Re-import) |
| `flow_desc` | `String` | Trade flow description (`Export`, `Import`, etc.) |
| `primary_value` | `Float64` | Primary trade value in current US Dollars |
| `net_weight` | `Float64` | Net mass / weight in kilograms |
| `quantity` | `Float64` | Supplementary quantity reported |
| `quantity_unit` | `String` | Supplementary unit descriptor (e.g., `kg`, `units`, `m3`) |
| `mot_code` | `Int32` | Mode of Transport (1=Sea, 2=Rail, 3=Road, 4=Air, 5=Postal, 9=Other) |
| `customs_code` | `String` | Customs procedure regime code |
| `classification_code`| `String` | Nomenclature standard (e.g., `HS2017`, `HS2022`) |
| `source_file` | `String` | Lineage: source filename / API request ID |
| `retrieved_at` | `Timestamp`| Ingestion timestamp in UTC ISO-8601 |

---

## 2. Trade Monthly Panel (`processed/trade_monthly_panel.parquet`)

**Grain**: `reporter_iso3 × partner_iso3 × cmd_code × period`

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `reporter_iso3` | `String` | Exporting / Reporting country |
| `partner_iso3` | `String` | Importing / Destination country |
| `cmd_code` | `String` | 6-digit Harmonized System commodity code |
| `period` | `String` | Monthly time index (`YYYYMM`) |
| `export_value_usd` | `Float64` | Total outbound trade value in USD |
| `import_value_usd` | `Float64` | Total inbound trade value in USD |
| `export_net_weight` | `Float64` | Total outbound weight in kilograms |
| `import_net_weight` | `Float64` | Total inbound weight in kilograms |
| `export_unit_value` | `Float64` | Export price per kg ($\frac{\text{export\_value\_usd}}{\text{export\_net\_weight}}$) |
| `import_unit_value` | `Float64` | Import price per kg ($\frac{\text{import\_value\_usd}}{\text{import\_net\_weight}}$) |

---

## 3. Master Entity Database (`processed/entity_master.parquet`)

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `lei` | `String` | 20-character ISO 17442 Legal Entity Identifier |
| `legal_name` | `String` | Official registered legal entity name |
| `entity_status` | `String` | GLEIF operational status (`ACTIVE`, `INACTIVE`, `MERGED`) |
| `jurisdiction` | `String` | ISO 3166-2 jurisdiction of incorporation |
| `legal_address` | `String` | Full registered legal street address |
| `headquarters_address`| `String` | Operational headquarters address |
| `parent_lei` | `String` | Direct parent Legal Entity Identifier (if applicable) |
| `ultimate_parent_lei`| `String` | Ultimate consolidating parent Legal Entity Identifier |
| `registration_authority`| `String` | Identifier of the National Business Registry (e.g., `RA000394`) |
| `registration_id` | `String` | Domestic company registration / corporate tax ID |
| `source` | `String` | Source identifier (`GLEIF_GOLDEN_COPY`, `OPENCORPORATES`) |
| `retrieved_at` | `Timestamp`| Retrieval timestamp |

---

## 4. Sanctions & Debarment Matrix (`processed/sanctions_entities.parquet`)

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `query_entity_id` | `String` | Internal query identifier |
| `matched_entity_id` | `String` | Authoritative Sanctions Registry Entity ID |
| `legal_name` | `String` | Primary sanctioned entity name |
| `match_score` | `Float64` | Fuzzy token set match score (0.0–100.0) |
| `matching_fields` | `String` | Comma-separated matching attributes (`name`, `alias`, `address`, `lei`) |
| `dataset` | `String` | Sanctions list name (`ofac_sdn`, `eu_fsf`, `un_sc`, `uk_ofsi`) |
| `topic` | `String` | Risk taxonomy category (`sanction`, `debarment`, `pep`, `crime`) |
| `source` | `String` | Originating agency (`OFAC`, `OpenSanctions`, `WorldBank`) |
| `decision` | `String` | Screening outcome (`FLAGGED`, `CLEAR`, `MANUAL_REVIEW_REQUIRED`) |

---

## 5. Trade Anomaly Feature Store (`features/anomaly_features.parquet`)

| Feature Name | Type | Mathematical Definition / Logic |
| :--- | :--- | :--- |
| `log_trade_value` | `Float64` | $\ln(1 + \text{primary\_value})$ |
| `trade_growth` | `Float64` | MoM percentage change: $\frac{V_t - V_{t-1}}{V_{t-1} + \epsilon}$ |
| `yoy_growth` | `Float64` | YoY percentage change: $\frac{V_t - V_{t-12}}{V_{t-12} + \epsilon}$ |
| `rolling_mean` | `Float64` | 12-month rolling mean of primary trade value |
| `rolling_std` | `Float64` | 12-month rolling standard deviation |
| `unit_value` | `Float64` | Ratio: $\frac{\text{primary\_value}}{\text{net\_weight}}$ |
| `unit_value_zscore`| `Float64` | Robust Z-score against product-corridor historical distribution |
| `unit_value_iqr_score`| `Float64` | Distance from median scaled by Interquartile Range ($IQR = Q_3 - Q_1$) |
| `quantity_growth` | `Float64` | MoM quantity percentage change |
| `weight_growth` | `Float64` | MoM net weight percentage change |
| `partner_share` | `Float64` | Partner volume as share of country total for commodity |
| `partner_share_change`| `Float64` | MoM shift in bilateral market share |
| `new_partner_flag` | `Int32` | Binary flag: $1$ if trade occurred with previously unseen partner |
| `new_product_flag` | `Int32` | Binary flag: $1$ if reporting territory traded newly introduced HS6 |
| `partner_concentration`| `Float64`| Herfindahl-Hirschman Index (HHI) across corridor partners |
| `product_concentration`| `Float64`| Herfindahl-Hirschman Index (HHI) across commodity portfolio |
| `mirror_value_difference`| `Float64`| Discrepancy: $\|\text{Export}_{A\to B} - \text{Import}_{B\leftarrow A}\|$ |
| `mirror_ratio` | `Float64` | Symmetry Ratio: $\frac{\text{Export}_{A\to B}}{\text{Import}_{B\leftarrow A} + \epsilon}$ |
| `mirror_missing_flag`| `Int32` | $1$ if counterparty country reported zero mirror trade |

---

## 6. Sequence Dataset (`features/anomaly_sequences_{train,val,test}.parquet`)

| Tensor Field | Shape | Description |
| :--- | :--- | :--- |
| `corridor_id` | `String` | Grouping key: `reporter_iso3:partner_iso3:cmd_code` |
| `timestamp_end` | `String` | Final period index of the 12-month window |
| `sequence_features`| `List[List[Float32]]` | Time-series matrix of shape $[12 \times 19]$ |
| `target_label` | `Int32` | Ground truth / weak anomaly label at horizon $t+1$ |
| `anomaly_type` | `String` | Taxonomy of detected/perturbed anomaly |

---

## 7. Partner Candidate Feature Matrix (`features/partner_candidate_features.parquet`)

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `exporter_id` | `String` | Exporter LEI or National Tax ID |
| `company_name` | `String` | Registered Exporter Name |
| `origin_country` | `String` | ISO3 Origin Country (e.g., `IND`) |
| `target_country` | `String` | ISO3 Destination Country (e.g., `ARE`, `USA`) |
| `hs_code` | `String` | Target 6-digit HS commodity |
| `trade_volume_usd`| `Float64` | Annualized historical trade volume |
| `trade_growth_rate`| `Float64` | 3-year compound annual growth rate (CAGR) |
| `product_overlap_score`| `Float64` | Cosine similarity between exporter catalog & buyer demand |
| `partner_diversification`| `Float64`| Number of active international buyer corridors |
| `country_gdp_growth`| `Float64` | Macroeconomic momentum from World Bank indicators |
| `tariff_burden_pct`| `Float64` | Applicable preferential or MFN tariff rate from WITS |
| `sanctions_exposure`| `Float64` | 0.0 for clean screening, 1.0 for flagged entity/owner |
| `entity_verified` | `Int32` | $1$ if active LEI and registry matched, $0$ otherwise |
| `ownership_complexity`| `Int32` | Depth of parent holding company tree |
| `historical_anomaly_score`| `Float64` | Historical anomaly probability index |
| `composite_match_score`| `Float64` | Weighted baseline ranking metric |

---

## 8. Canonical OCR Dataset (`processed/ocr_canonical.parquet`)

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `document_id` | `String` | Unique document identifier |
| `image_path` | `String` | Relative path to document scan/image |
| `split` | `String` | Dataset split (`train`, `test`, `validation`) |
| `tokens` | `List[String]` | Extracted word/token string list |
| `bounding_boxes`| `List[List[Int32]]` | Normalized $[x_0, y_0, x_1, y_1]$ box coordinates ($0–1000$) |
| `labels` | `List[String]` | Token-level semantic class (`header`, `question`, `answer`, `other`) |
| `links` | `List[List[Int32]]` | Key-value linking relationship tuples |
| `source_dataset`| `String` | Provenance identifier (`FUNSD`, `SROIE`, `CORD`, `XFUND`, `RVL_CDIP`) |
| `source_version`| `String` | Version tag of source benchmark |

# task V2.md

## Objective

Rebuild the GLOBEX AI analytical data layer into exactly five clean, EDA-ready Parquet datasets.

The current catalog contains 66 datasets and multiple already-derived CSV/feature products. The purpose of this task is to create the canonical analytical datasets BEFORE future EDA, feature engineering and model training.

The authoritative source is the current column catalog supplied with this task.

External source semantics should be respected. UN Comtrade supports annual `YYYY` and monthly `YYYYMM` periods, so annual and monthly observations must remain distinct analytical resolutions rather than being blindly stacked together. citeturn0search6

World Bank WDI indicators are naturally keyed by country/indicator/time and are available through its V2 API, so macroeconomic enrichment must use country and year rather than a row-level Cartesian join. citeturn0search0turn0search2

WTO's RTA dataset describes agreements, parties and dates; it explicitly warns that the RTA database should not be treated as the source of actual preferential tariff rates. Therefore RTA information should be used for agreement/status features, while tariff rates should come from the tariff source. citeturn0search1

## Required output files

Delete all existing `.parquet` files inside:

`data_pipeline/data/processed/`

Then create ONLY these five canonical Parquet outputs:

1. `01_partner_discovery.parquet`
2. `02_trade_anomaly.parquet`
3. `03_document_intelligence.parquet`
4. `04_trade_risk.parquet`
5. `05_rag_evidence.parquet`

Do not delete CSV inputs.

---

# Dataset 1: 01_partner_discovery.parquet

## Grain

One row represents:

`India × partner × HS6 × year`

Composite key:

`reporter_iso3, partner_iso3, hs6, year`

## Primary source

`staging/comtrade_india_world.csv` or an equivalent validated annual Comtrade staging/processed table.

Filter:

`reporter_iso3 = IND`

Do not mix monthly observations into this dataset.

## Required joins

### A. World Bank

Source:
`staging/worldbank_country_indicators.csv`

Join:
`partner_iso3 = country_iso3`
AND
`year = year`

The source is indicator-long, so pivot/aggregate the required indicators BEFORE joining.

Preferred indicators from the catalog:
- GDP
- GDP per capita
- GDP growth
- inflation
- population
- trade as % GDP

Required behavior:
- one unique right-side row per `country_iso3 + year`
- no row multiplication
- retain nulls when a country-year is genuinely unavailable
- do not globally mean-fill missing macroeconomic values

### B. Tariffs

Source:
`staging/india_tariffs.csv` or validated `processed/tariff_features.csv`

Preferred key:
`reporter_iso3 + partner_iso3 + hs6 + year`

If the tariff source only provides `WLD`/MFN values and not partner-specific rates, do NOT pretend that the value is partner-specific.

Instead:
- retain the tariff with a clear `tariff_scope` such as `PARTNER_SPECIFIC` or `MFN/WORLD`
- preserve null where the requested partner-specific rate is unavailable
- optionally retain both MFN and partner-specific values when semantically distinct

### C. Country reference

Source:
`raw/country_currency/iso_3166_countries_unece.csv`

Join:
`partner_iso3 = ISO3166-1-Alpha-3`

Use only the small subset of country metadata actually useful for EDA:
country name, alpha-2, numeric code, currency, region/sub-region and continent where valid.

Do not retain all 56 reference columns.

### D. UN/LOCODE

Sources:
`UNLOCODE CodeListPart1.csv`
`UNLOCODE CodeListPart2.csv`
`UNLOCODE CodeListPart3.csv`

First normalize their malformed/header-like columns.

Create a country-level aggregate:
- `partner_locode_count`
- `partner_port_count`
- `partner_airport_count`
- `partner_inland_terminal_count`

Then join the aggregate by:
`partner_iso3`

Never join raw UN/LOCODE rows directly to trade observations.

### E. Sanctions

Use the OpenSanctions/OFAC sources only to derive defensible country-level risk indicators.

Acceptable country-level features:
- `sanctions_entity_count`
- `ofac_entity_count`
- `sanctions_present`

The country mapping must come from an actual source country field.

Do NOT join every sanctions entity to every trade row for the same country.

### F. WTO RTA

Source:
`raw/wto_rta/wto_all_rtas_list_latest.csv`

Create a normalized agreement table.

For every partner:
- determine whether India and partner are both parties
- determine whether the agreement was in force for the trade year
- derive:
  - `rta_exists`
  - `rta_name`
  - `rta_status`
  - `rta_entry_into_force`
  - `rta_type`
  - `rta_coverage`

If party membership cannot be established reliably from the source text, leave the RTA feature unavailable instead of guessing.

Do not use RTA data as tariff rates.

### G. GLEIF

Do NOT country-join `entity_master.csv` to trade.

The catalog shows only 7 GLEIF entities and the existing join report has only a 37.5% match rate when it is incorrectly used as a broad enrichment source. Treat this as an entity-level source, not a country dimension.

Use GLEIF only if a genuine entity key is present.

Otherwise exclude it from Dataset 1 and record:

`excluded_reason = ENTITY_GRAIN_DOES_NOT_MATCH_TRADE_GRAIN`

## Keep

At minimum:

- reporter_iso3
- partner_iso3
- partner_name
- hs6
- product_description
- year
- trade_value_usd
- export_value_usd
- import_value_usd
- trade_balance_usd
- net_weight_kg
- quantity
- unit_value_usd_per_kg
- transaction_count
- macro indicators
- tariff features
- RTA features
- logistics aggregates
- sanctions aggregates

Add other columns only if their analytical role is clear.

## Remove

- raw API URLs
- raw source filenames
- request IDs
- retrieval timestamps
- duplicated country identifiers
- ingestion-only fields
- arbitrary IDs with no analytical meaning

---

# Dataset 2: 02_trade_anomaly.parquet

## Grain

`period × reporter_iso3 × partner_iso3 × hs6 × trade_flow`

Composite key:

`period, reporter_iso3, partner_iso3, hs6, trade_flow`

## Base

Use monthly Comtrade data from:

`processed/trade_monthly_panel.csv`

or the validated monthly staging observations.

Do NOT use:
- `features/anomaly_features.csv`
- `features/anomaly_labeled_dataset.csv`
- `features/anomaly_sequences_*`
- `final_csv/02_trade_anomaly_dl.csv`

Those are already derived.

## Raw variables

Keep:
- period
- reporter_iso3
- partner_iso3
- hs6
- trade_flow
- trade value
- net weight
- quantity
- quantity unit
- product description where available

## Derived variables

Create using chronological group operations by:

`reporter_iso3, partner_iso3, hs6, trade_flow`

Possible features:
- trade_growth
- yoy_growth
- rolling_mean
- rolling_std
- unit_value
- unit_value_change
- quantity_growth
- weight_growth
- partner_share
- partner_share_change
- new_partner_flag
- new_product_flag
- mirror_trade_value
- mirror_ratio
- mirror_difference
- mirror_missing_flag

Every rolling or lagged calculation must be causal: only observations available before or at the feature timestamp may be used.

## Labels

If deterministic anomaly labels are created, retain:
- anomaly_flag
- anomaly_type
- label_source

Set:
`label_source = RULE_BASED_HEURISTIC`

Do not represent these labels as independently verified ground truth.

---

# Dataset 3: 03_document_intelligence.parquet

## Grain

`document_id × token_index`

## Base

`staging/document_annotations.csv`

## Optional compatible enrichment

`processed/ocr_canonical.csv`

Only join after proving:
- `document_id` uniqueness at the right grain
- no row multiplication

## Keep

- document_id
- source_dataset
- source_version
- split
- image_path_or_id
- language
- document_type
- token_index
- token
- x0
- y0
- x1
- y1
- entity_label
- linked_token_ids
- key
- value

## Critical small-data rule

The source has only 91 rows.

DO NOT manufacture OCR tokens, documents, bounding boxes, entities, labels or links.

Do not mean-fill text or coordinates.

If 91 rows are all that exist, produce 91 real rows and document the limitation.

---

# Dataset 4: 04_trade_risk.parquet

## Grain

`period × reporter_iso3 × partner_iso3 × hs6`

Composite key:

`period, reporter_iso3, partner_iso3, hs6`

## Base

Validated monthly trade observations.

## Join

World Bank:
`partner_iso3 + year`

Tariffs:
`reporter_iso3 + partner_iso3 + hs6 + year`, with explicit tariff scope.

RTA:
country-pair/year agreement status where reliably derivable.

UN/LOCODE:
country-level aggregate by partner.

Sanctions:
country-level aggregate by partner, or entity-level only where an actual entity identifier exists.

## Risk features

Derive only from real observations:

- average trade value
- rolling volatility
- mirror discrepancy
- historical anomaly rate
- anomaly event count
- total observations
- tariff exposure
- inflation
- GDP growth
- sanctions presence
- logistics capacity proxies

Do not use future periods.

Do not copy the old `04_trade_risk_eda.csv` or `04_trade_risk_ml.csv`.

---

# Dataset 5: 05_rag_evidence.parquet

## Grain

One evidence item per row.

## Base

Existing real evidence records.

Keep:

- evidence_id
- source_type
- source_name
- source_url
- source_record_id
- country_iso3
- hs_code
- entity_id
- title
- text
- claim_type
- date
- retrieved_at
- citation

## No synthetic evidence

Never fabricate:
- statutes
- regulatory text
- citations
- URLs
- source names
- legal claims
- document content

If only 23 evidence rows exist, retain the 23 rows.

---

# Small-source and missing-value policy

A source is considered too small when it cannot support the intended join or feature at the target grain.

Do NOT use:
- `fillna(0)` for factual missingness
- global mean
- global median
- random sampling
- arbitrary synthetic rows

Use this order:

1. Preserve observed value.
2. Derive from a deterministic domain formula if possible.
3. Use a time-valid carry-forward/backward rule only when semantically justified.
4. Add a provenance flag.
5. Otherwise retain null.
6. Drop a feature entirely if its source coverage is too weak.

Synthetic data may only be created when the value is mathematically derived from real observations and the derivation has a defensible domain identity.

Example:
`unit_value = trade_value_usd / net_weight_kg`
when denominator is positive and both inputs are observed.

Do not create synthetic entities, trades, documents, sanctions matches, RTA agreements or legal evidence.

---

# Join audit requirements

For every join, calculate:

- left dataset
- right dataset
- left grain
- right grain
- join key
- join type
- left rows before
- right rows
- matched rows
- unmatched left
- unmatched right
- duplicate right keys
- rows after join
- row multiplier
- match rate
- action

Any unexpected row multiplier > 1 for a supposed enrichment join is a failure.

For each output verify:

- no duplicate composite keys
- data types are intentional
- numeric columns are numeric
- categorical identifiers are strings
- dates/periods are correctly typed
- no accidental object/list serialization except where explicitly required
- no source URLs or provenance fields removed when they are needed for auditability

---

# Deliverables

Create:

`data_pipeline/data/processed/01_partner_discovery.parquet`
`data_pipeline/data/processed/02_trade_anomaly.parquet`
`data_pipeline/data/processed/03_document_intelligence.parquet`
`data_pipeline/data/processed/04_trade_risk.parquet`
`data_pipeline/data/processed/05_rag_evidence.parquet`

Also create:

`data_pipeline/data/reports/final_parquet_build_v2.csv`

with one row per output and columns:

- dataset
- path
- rows
- columns
- grain
- primary_key
- duplicate_key_rows
- null_rate_pct
- source_tables
- join_count
- synthetic_formula_count
- derived_count
- imputed_count
- status

Also create:

`data_pipeline/data/reports/final_parquet_join_audit_v2.csv`

containing one row per join with the join audit fields above.

## Final validation

The build is successful only if:

- exactly five requested Parquet outputs exist
- old Parquet files were removed from processed/
- no source CSVs were deleted
- every dataset has a declared grain
- every composite key is duplicate-free
- no uncontrolled row multiplication occurred
- no unsupported synthetic records were introduced
- no mean/zero/random imputation was used for factual fields
- anomaly/risk features do not leak future information
- document and RAG datasets contain only real source records
- audit reports are generated
- all five datasets can be opened with `pandas.read_parquet()`

If any condition fails, stop and report the failure rather than silently producing a compromised dataset.


---

# 18. Mandatory join and cleaning justification document

Create a companion Markdown document:

`data_pipeline/data/reports/join_cleaning_justification_v2.md`

This document is mandatory. It is not optional documentation.

Its purpose is to make the entire transformation understandable to a person learning data engineering and ML.

For EVERY join performed in EVERY one of the five datasets, document all of the following:

## Join justification template

```text
### <N>. <LEFT DATASET> → <RIGHT DATASET>

Purpose:
Why this right-side information is needed for the target ML/EDA use case.

Left grain:
<exact grain>

Right grain:
<exact grain>

Join key:
<exact columns and normalization>

Why this key is semantically valid:
<explain why these columns identify the same real-world entity/time/product>

Join type:
LEFT / INNER / ONE-TO-ONE / MANY-TO-ONE / etc.

Why this join type was selected:
<explain why rows should or should not be allowed to disappear>

Cardinality before join:
<measured result>

Cardinality after join:
<measured result>

Match rate:
<measured result>

Duplicate right-side keys:
<measured result>

Row multiplier:
<measured result>

Aggregation performed before joining:
<exact aggregation, if any>

Columns imported:
<list>

Columns deliberately excluded:
<list>

Why imported columns are useful:
<short explanation>

Why excluded columns are unnecessary or dangerous:
<short explanation>

Missing-value behavior:
<what happens when the enrichment is unavailable>

Leakage risk:
<none / explanation>

Decision:
<JOINED / EXCLUDED / AGGREGATED FIRST / BLOCKED>
```

Do not write generic explanations. Populate the document from the actual build results.

## Required dataset-level explanation

For each of the five outputs, explain:

1. Why this dataset exists.
2. What its exact grain means.
3. Why that grain is appropriate for the intended model/EDA.
4. Which source is the base table.
5. Every enrichment source used.
6. Why each enrichment is relevant.
7. Why each join key is correct.
8. Why each join type was selected.
9. Which sources were deliberately NOT joined.
10. Why those sources were excluded.
11. Which columns were kept.
12. Which columns were removed.
13. Why the kept columns are analytically useful.
14. Why the removed columns are not useful at this stage.
15. What cleaning was performed.
16. What cleaning was deliberately NOT performed because the user will handle it during EDA.
17. Which values were derived.
18. Which values were imputed, if any.
19. Which values were synthetic formula-derived, if any.
20. Why each derived/imputed/synthetic operation is defensible.
21. What limitations remain.

## Required cleaning justification

Document every transformation such as:

- column renaming;
- type conversion;
- date/period parsing;
- ISO code normalization;
- HS code normalization;
- duplicate removal;
- aggregation;
- unit conversion;
- formula-derived variables;
- missing-value handling;
- categorical normalization;
- removal of ingestion metadata.

For each transformation state:

```text
TRANSFORMATION:
BEFORE:
AFTER:
WHY:
RISK:
```

Do not call something "cleaning" unless it was actually performed.

## Required "do not clean yet" section

The document must explicitly state which operations were intentionally left to the user for EDA, including as applicable:

- outlier treatment;
- statistical imputation;
- scaling;
- normalization;
- encoding choices;
- feature selection;
- dimensionality reduction;
- class balancing;
- model-specific transformations.

## Required source exclusion section

Create a table:

```text
Source | Dataset(s) considered | Joined? | If not, why? | Risk if joined incorrectly
```

This is particularly important for:
- GLEIF;
- OpenSanctions;
- OFAC;
- raw UN/LOCODE;
- WTO RTA;
- SCOMET;
- document data;
- old `final_csv` and `features` datasets.

## Required final schema rationale

For each output, create:

```text
Column | Source | Grain | Type | Kept/Removed | Reason
```

The document must explain every final column at a useful level.

## Required provenance section

Document how the output can be traced back to the source datasets and how derived values are distinguished from observed values.

## Required limitations section

Do not hide small-source problems.

If a dataset/source has insufficient coverage, state:
- number of source rows;
- number of matched rows;
- coverage percentage;
- whether the source was retained, aggregated, or excluded;
- why.

If an attribute is essential but unavailable, record it in:

`data_pipeline/data/reports/additional_data_required_v2.md`

Do not invent a value merely to make the dataset look complete.

## Final rule

The Markdown justification must be generated from the actual execution results, not from assumptions.

If a planned join was skipped, document the actual reason.

If a join key had to be changed after inspection, document the original attempted key, the problem discovered, and the final key.

If a source was too small to support a feature, document the measured evidence.

This file is part of the deliverable.

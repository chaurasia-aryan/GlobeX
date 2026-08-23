# SIH Ranking Layer Recovery Manifest

## Purpose

This manifest records what is known about the surviving data after the
lost uncommitted work.

It is a recovery reference, not a license to overwrite or delete
anything.

## 1. Verified Current CSVs

### India as exporter

`01_partner_discovery_india_as_exporter_eda.csv`

Verified: - rows: `48,445` - columns: `45` - year range: `2000–2025` -
years: `26` - HS6 values: `33` - partner countries: `53` - rows for
`2010–2025`: `31,805`

Important fields include: - exporter/importer ISO codes - HS6 - product
description - year - export value - export net weight - quantity - FOB
unit value - destination market share - transaction count - destination
GDP/macroeconomics - destination tariffs - RTA information - destination
logistics - GLEIF buyer counts - sanctions/OFAC - SCOMET fields

### India as importer

`01_partner_discovery_india_as_importer_eda.csv`

Verified: - rows: `48,445` - columns: `41` - year range: `2000–2025` -
years: `26` - HS6 values: `33` - partner countries: `53` - rows for
`2010–2025`: `31,805`

Important fields include: - importer/exporter ISO codes - HS6 - product
description - year - import value - import net weight - quantity - CIF
unit value - supplier market share - transaction count - supplier
GDP/macroeconomics - India import tariff - MFN tariff - RTA
information - supplier logistics - GLEIF supplier counts -
sanctions/OFAC

## 2. Related Recovered Datasets

### Trade-risk EDA

`04_trade_risk_eda.csv`

Verified: - rows: `6,144` - columns: `37`

Contains monthly trade-risk signals including: - trade value - net
weight - unit value - trade volatility - unit-value volatility - MoM
growth - GDP - tariff - RTA - logistics - sanctions/OFAC

### Trade anomaly DL

`02_trade_anomaly_dl.csv`

Verified: - rows: `12,288` - columns: `29`

Contains monthly anomaly-related features including: - trade growth -
unit-value changes - quantity/weight growth - rolling statistics -
partner share - new corridor flag - mirror-trade measures - anomaly
type/flag - label source

These are related project assets but are not substitutes for the annual
partner-ranking base.

## 3. Important Interpretation

The phrase "30,000-row ranking dataset" should be interpreted carefully.

The verified recovered annual partner-discovery datasets have: -
`48,445` rows across `2000–2025`; - exactly `31,805` rows across
`2010–2025`.

Therefore:

**Do not fabricate a 30,000-row dataset.**

Correct recovery target: - preserve full 26-year history; - construct
verified `31,805`-row canonical 2010--2025 slices; - derive ranking
features from that data; - retain full history for long-term trend
features where required.

## 4. Current Missing/Expected Artifacts

Potential ranking-layer artifacts needing reconstruction: - ranking
feature Parquet - final ranking-ready Parquet - India-as-importer
ranking Parquet - ranking scorer/model artifact - ranking weights
config - preprocessing config - ranking evaluation report - recovery
documentation

Search Git and the directory before assuming an artifact is missing.

## 5. Recovery Principle

Classify artifacts as: - `RECOVERED_EXISTING` -
`REGENERATED_FROM_EXISTING` - `REDOWNLOADED_FROM_SOURCE` -
`NEW_DERIVED_ARTIFACT`

Never describe a newly generated artifact as the original lost artifact
unless provenance proves identity.

## 6. External Source

Authoritative trade source: UN Comtrade

Official portal: https://comtradeplus.un.org/

Use it to re-procure missing trade observations, but preserve existing
validated project data first.

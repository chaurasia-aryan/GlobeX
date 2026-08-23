# Production Data Audit

## Objective

Create a canonical, reproducible, leakage-safe data layer.

## Existing Data

The supplied project documentation identifies:
- India-as-exporter annual panel, 2000–2025;
- India-as-importer annual panel, 2000–2025;
- trade anomaly monthly data;
- current model artifacts and Parquet files.

Inspect existing files before downloading anything.

## Canonical Annual Grain

For partner discovery:

`direction × HS6 × partner_iso3 × year`

Exactly one canonical observation after documented aggregation.

Do not blindly drop duplicates.

For every duplicate:
- inspect source;
- determine whether records are duplicates or legitimate components;
- document aggregation/resolution;
- preserve raw source;
- create canonical output separately.

## Mandatory Checks

- schema;
- row counts;
- year coverage;
- HS6 validity;
- ISO3 validity;
- non-negative values;
- units;
- missingness;
- duplicate keys;
- join explosions;
- outliers;
- source provenance;
- source date;
- data freshness.

## Leakage

Audit all:
- lag;
- rolling;
- expanding;
- growth;
- z-score;
- percentile;
- historical;
- forecast;
- macro;
- tariff;
- risk.

Every feature must record:
- formula;
- source;
- availability date;
- future-data flag;
- final status.

Fit preprocessing only on training periods.

## Output

Create:
`reports/data_quality/`
- dataset_profile.csv
- duplicate_audit.csv
- missingness_report.csv
- temporal_coverage.csv
- temporal_leakage_audit.csv
- join_audit.csv
- source_provenance.csv
- canonical_dataset_audit.md

Create versioned canonical Parquet.

## Gate

No model retraining or production deployment if critical data-quality/leakage gates fail.

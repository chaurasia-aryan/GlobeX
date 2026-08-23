# Ranking Layer Data and Scoring Contract

## 1. Purpose

This file defines the minimum contract for the SIH partner-ranking
layer.

It is deliberately explicit so that rebuilding the lost work does not
silently change the meaning of the ranking system.

## 2. Business Meaning

The system receives: - India-side direction: `EXPORT` or `IMPORT` -
`hs6` - requested quantity, e.g. `1000 kg`

Output: A ranked list of candidate countries with: - final score -
rank - direction - HS6 - partner - component scores - risk flags -
explanation

## 3. Source Data Contract

Historical source period: `2000–2025 inclusive`.

Granularity: `HS6 × partner × year`.

Canonical ranking window: `2010–2025 inclusive`.

Verified recovery size: `31,805 rows` for each recovered
partner-discovery CSV.

## 4. Direction Contract

### EXPORT

India: `exporter_iso3 = IND`

Candidate: `importer_iso3`

Primary fields: - `export_value_usd` - `export_net_weight_kg` -
`quantity` - `fob_unit_value_usd_per_kg` -
`destination_market_share_pct`

Destination context: - `destination_gdp` -
`destination_gdp_per_capita` - `destination_gdp_growth` -
`destination_inflation` - `destination_population` -
`destination_trade_pct_gdp`

Policy: - `destination_applied_tariff_rate` - `mfn_tariff_rate` -
`tariff_preference_margin` - `tariff_type` - `rta_exists` - `rta_name` -
`rta_status` - `rta_entry_into_force` - `rta_type` - `rta_coverage`

Infrastructure: - `destination_locode_count` -
`destination_port_count` - `destination_airport_count` -
`destination_inland_terminal_count`

Business: - `gleif_buyer_count` - `gleif_active_buyer_count`

Risk/control: - `sanctions_entity_count` - `ofac_entity_count` -
`sanctions_present` - `scomet_match_flag` - `scomet_category` -
`scomet_item_reference`

### IMPORT

India: `importer_iso3 = IND`

Candidate: `exporter_iso3`

Primary fields: - `import_value_usd` - `import_net_weight_kg` -
`quantity` - `cif_unit_value_usd_per_kg` - `supplier_market_share_pct`

Supplier context: - `supplier_gdp` - `supplier_gdp_per_capita` -
`supplier_gdp_growth` - `supplier_inflation` - `supplier_population` -
`supplier_trade_pct_gdp`

Policy: - `india_import_tariff_rate` - `mfn_tariff_rate` -
`tariff_type` - `rta_exists` - `rta_name` - `rta_status` -
`rta_entry_into_force` - `rta_type` - `rta_coverage`

Infrastructure: - `supplier_locode_count` - `supplier_port_count` -
`supplier_airport_count` - `supplier_inland_terminal_count`

Business: - `gleif_supplier_count` - `gleif_active_supplier_count`

Risk: - `sanctions_entity_count` - `ofac_entity_count` -
`sanctions_present`

## 5. Core Feature Families

Separate components for: 1. Trade scale 2. Trade volume 3. Recent demand
4. Growth 5. Market/supplier share 6. Stability 7. Macro attractiveness
8. Tariff attractiveness 9. RTA/preference 10. Logistics 11. Business
ecosystem 12. Risk/control

Do not collapse all evidence into one opaque feature.

## 6. Temporal Features

A score at time T can use only information available at or before T.

Examples: - recent 3-year average - recent 5-year average - YoY growth -
CAGR - rolling volatility - trend slope - partner share trend - recent
trade consistency

Never use 2025 to construct a feature intended to represent a 2020
decision.

## 7. Quantity Handling

Requested quantity is not a historical training target.

For `1000 kg`, derive inference-time context such as: - recent average
partner volume - recent median partner volume - partner capacity proxy -
requested/recent-volume ratio

Do not modify historical trade values to match the request.

## 8. Missing Data

Do not automatically convert every missing value to zero.

Distinguish: - `0` = verified zero - `NA` = unavailable/unknown - not
applicable = structurally irrelevant

Document imputation and missingness indicators where appropriate.

## 9. Normalization

Preferred transform for skewed non-negative variables:

`log1p(x)`

Then use a reproducible ranking normalization such as percentile/rank
score, robust min-max, or another documented bounded method.

For backtests, fit transformations only on information available at the
prediction date.

## 10. Component Direction

  Component                  Direction
  -------------------------- -----------------------------------------------
  Trade scale                higher is better
  Trade volume               higher is better
  Recent demand              higher is better
  Growth                     higher is generally better
  Market/supplier share      higher is generally better
  Stability                  higher is better
  GDP / GDP per capita       contextual positive
  Trade openness             contextual positive
  Applied tariff             lower is better
  Tariff preference margin   higher is better
  RTA/preference             positive when actually applicable
  Logistics                  higher is better
  Business ecosystem         higher is generally better
  Sanctions/risk             higher risk is worse
  SCOMET restriction         restriction is worse for unrestricted ranking

## 11. Risk Contract

Risk must not accidentally improve ranking.

At minimum: - `sanctions_present = 1` must produce a documented penalty
or exclusion rule; - high sanctions/OFAC counts must not become positive
through naive normalization; - SCOMET-controlled products must be
surfaced in India-as-exporter results; - missing risk data must not be
treated as zero risk.

Whether high-risk partners are excluded or penalized must be
configurable.

## 12. Scoring Contract

Conceptually:

`final_score = Σ(weight_i × component_score_i) - risk_penalty`

Requirements: - deterministic - reproducible - explainable -
configurable - direction-aware - product-aware

If old weights are recoverable from Git/notebooks/configs, reproduce
them.

If not recoverable, use a clearly labeled reconstructed baseline and
store it in a versioned config. Never pretend reconstructed weights are
the lost original weights.

## 13. Ranking Output Schema

Minimum fields: - `rank` - `direction` - `hs6` - `product_description` -
`partner_iso3` - `partner_iso2` - `partner_country_name` - `score` -
`trade_scale_score` - `volume_score` - `demand_score` - `growth_score` -
`share_score` - `stability_score` - `macro_score` - `tariff_score` -
`rta_score` - `logistics_score` - `ecosystem_score` - `risk_penalty` -
`sanctions_present` - `requested_quantity_kg` - `capacity_fit_score` -
`explanation`

## 14. Business Key

Historical observations: `direction + hs6 + partner_iso3 + year`

Final inference ranking:
`direction + hs6 + partner_iso3 + request_context`

Check duplicates before Parquet export.

## 15. Validation

Validate: - expected row counts - expected year range - expected HS6
count - expected partner count - duplicates - null rates - numeric
ranges - direction correctness - risk behavior - quantity behavior -
deterministic rerun - explanation consistency

Use time-based backtesting. Do not use random train/test splitting for
temporal ranking validation.

If no defensible relevance target exists, do not report fabricated
accuracy/F1.

## 16. Recommended Artifact Family

``` text
task_rankinglayer_v1/
    prompt.md
    tasks.md
    ranking_contract.md
    recovery_manifest.md
    directory_safety_rules.md
    config/
        ranking_weights.yaml
        preprocessing.yaml
    data/
        canonical_exporter.parquet
        canonical_importer.parquet
        ranking_features_exporter.parquet
        ranking_features_importer.parquet
    model/
        ranking_scorer.joblib
    reports/
        validation_report.md
        data_quality_report.md
    logs/
        recovery_log.md
```

Adapt paths to the existing repository layout rather than duplicating
the entire repository.

# GRU Forecast Validation

## Scope

Audit the existing Dual-Head GRU before retraining.

The supplied project documentation defines the GRU as forecasting:
- future trade demand/volume;
- future trade-level FOB USD/kg.

## Artifact Audit

Record:
- artifact path;
- architecture;
- sequence length;
- feature order;
- scaler;
- targets;
- training data;
- training cutoff;
- model version;
- existing metrics;
- inference path.

## Walk-Forward Validation

Use chronological evaluation.

Example:
- train through 2020 → predict 2021;
- through 2021 → predict 2022;
- through 2022 → predict 2023;
- through 2023 → predict 2024;
- through 2024 → predict 2025.

Never random-split time series.

## Baselines

At minimum:
- last value;
- moving average;
- linear/regularized trend;
- lag-feature tree model where feasible;
- GRU.

## Metrics

Demand:
- MAE;
- RMSE;
- WAPE;
- sMAPE;
- directional accuracy where meaningful.

FOB:
- MAE;
- RMSE;
- WAPE;
- sMAPE.

Do not report a fake generic accuracy percentage.

## Uncertainty

Calibrate prediction intervals from validation data.

Return:
- point forecast;
- 80% interval;
- optionally 95% interval;
- calibration coverage;
- model version;
- training cutoff.

## Economic Plausibility

Check:
- negative forecasts;
- extreme growth;
- forecasts outside plausible historical distribution;
- unstable countries/products;
- sparse-history cases.

Flag rather than silently clip unless the transformation is explicitly part of the model.

## Required Outputs

`reports/forecasting/`
- walk_forward_predictions.parquet
- forecast_metrics.csv
- baseline_comparison.csv
- forecast_error_by_year.csv
- forecast_error_by_country.csv
- prediction_interval_calibration.csv
- gru_validation_report.md

## Gate

GRU is production-approved only if it is demonstrably useful against baselines and its error/uncertainty behavior is documented.

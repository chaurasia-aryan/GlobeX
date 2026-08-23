# GRU Forecast Model Card

## Intended use

Market-demand and trade-price forecasting for decision support.

## Not intended for

- legal decisions;
- guaranteed demand;
- guaranteed prices;
- guaranteed profit;
- sanctions decisions;
- credit approval.

## Outputs

- point demand forecast;
- point FOB forecast;
- uncertainty interval;
- horizon;
- model version;
- training cutoff.

## Evaluation

Use chronological walk-forward validation.

Report error by:
- year;
- destination;
- product;
- history depth.

## Limitations

- historical trade is not latent demand;
- unit values are not necessarily quoted market prices;
- macro variables can be revised;
- trade shocks can break historical relationships;
- model performance can drift.

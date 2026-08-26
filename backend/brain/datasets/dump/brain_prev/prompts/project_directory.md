# Project Directory Contract — GlobeX Match / SIH

Target root:
`c:\Users\Aryan\Downloads\globex_match`

## Target Structure

```text
globex_match/
├── Brain Data/
│   ├── Partner Discovery as exporter/
│   ├── Partner Discovery as importer/
│   ├── Trade Anomaly/
│   └── Trade Risk/
├── backend/
├── configs/
├── data/
│   ├── raw/
│   ├── processed/
│   └── provenance/
├── docs/
├── models/
│   ├── partner_discovery/
│   │   ├── forecasting/
│   │   └── ranking/
│   ├── trade_anomaly/
│   └── trade_risk/
├── notebooks/
│   ├── partner_discovery/
│   ├── trade_anomaly/
│   ├── trade_risk/
│   └── archive/
├── outputs/
├── reports/
├── scripts/
│   ├── data/
│   ├── notebooks/
│   └── training/
├── src/
│   ├── partner_discovery/
│   ├── ranking/
│   └── trade_anomaly/
└── tests/
```

## Important Rules

### Brain Data
Keep `Brain Data/` at root.

Keep:
`Brain Data/Partner Discovery as exporter/`

The exporter CSV, Parquet and current notebook must remain intact.

### Data
`data/raw/` = source/raw datasets.
`data/processed/` = canonical processed datasets/features/results.
`data/provenance/` = provenance if appropriate.

Existing backend and Brain Data copies must be preserved.

### Notebooks
Organize by domain. Legacy/copied notebooks go to `notebooks/archive/` only after inspection.

### Models
Use `models/partner_discovery/`, `models/trade_anomaly/`, and `models/trade_risk/`.

Do not merge backend runtime copies without checking references.

### Scripts
Use `scripts/data/`, `scripts/notebooks/`, and `scripts/training/`.

### Source
Keep reusable application/model code in `src/`.

### Backend
Preserve backend-specific assets where the backend expects them.

### Root
Keep application configuration and build files at root.

## Non-Destructive Rule
If a file does not fit:
1. inspect it;
2. preserve it;
3. move/rename it if useful;
4. record it.

Never delete it.

## Path Integrity
Whenever a file moves or is renamed, update all affected references in:
`.ipynb`, `.py`, `.ts`, `.tsx`, `.json`, `.yaml`, `.yml`, `.md`, tests and configs.

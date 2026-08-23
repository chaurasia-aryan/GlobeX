# Forecasting Production Pipeline

## Purpose

Productionize the existing Dual-Head GRU only after validation.

## Inputs

The supplied documentation describes a 12-dimensional sequence containing historical:
- import/trade volume;
- CIF/FOB unit values;
- tariff preference margin;
- macroeconomic GDP/growth variables.

Do not trust documentation blindly. Verify the notebook and inference code.

## Pipeline

```text
Raw Trade
→ Canonical Grain
→ Temporal Features
→ Train-only Preprocessing
→ Sequence Builder
→ GRU
→ Forecast
→ Interval Calibration
→ Plausibility Checks
→ API
```

## Requirements

Persist:
- feature order;
- scaler;
- sequence length;
- target transforms;
- model artifact;
- training cutoff;
- metrics;
- calibration;
- model version.

## Cold Start

If insufficient history:
- do not fabricate sequence values;
- return `INSUFFICIENT_HISTORY`;
- use a documented baseline only if configured;
- label the result as baseline.

## Plausibility

Check:
- negative demand;
- negative price;
- extreme growth;
- sparse corridors;
- distribution shift.

Do not silently clip.

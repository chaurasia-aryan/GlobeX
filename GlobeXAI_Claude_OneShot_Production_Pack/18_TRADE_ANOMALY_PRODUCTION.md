# Trade Anomaly Production Layer

## Purpose

Identify unusual trade behaviour.

The existing anomaly labels are heuristic labels and must not be represented as confirmed fraud ground truth.

## Required separation

```text
Anomaly
≠
Fraud
≠
Sanctions
≠
Legal violation
```

## Production output

```json
{
  "anomaly_score": 0.0,
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "anomaly_type": "...",
  "drivers": [],
  "coverage": {},
  "model_version": "..."
}
```

## Threshold

Thresholds must come from validation/training distributions.

Do not call reconstruction error a probability.

## Cold Start

Insufficient history:
`REVIEW` or `INSUFFICIENT_HISTORY`.

Do not manufacture a normal baseline.

# Production Inference Contract

## Core Principle

The API must distinguish:
- forecast;
- current fact;
- compliance decision;
- derived recommendation.

## Input

```json
{
  "direction": "EXPORT",
  "origin_country": "IND",
  "destination_country": null,
  "product": "Basmati Rice",
  "hs6": "100630",
  "quantity_kg": 1000,
  "value_usd": null,
  "currency": "USD",
  "end_use": null,
  "end_user": null,
  "reference_date": "2026-08-23",
  "top_k": 6
}
```

## Output

```json
{
  "status": "SUCCESS",
  "market_opportunity": {},
  "forecast": {},
  "compliance": {
    "decision": "CLEAR|REVIEW|BLOCKED|UNSUPPORTED",
    "jurisdictions": [],
    "checks": [],
    "blocking_reasons": [],
    "review_reasons": []
  },
  "counterparty_risk": {},
  "trade_anomaly": {},
  "verified_facts": [],
  "provenance": [],
  "model_versions": {},
  "data_versions": {}
}
```

## Forecast

Must include:
- point forecast;
- interval;
- horizon;
- training cutoff;
- model version;
- validation metrics;
- confidence.

## Verified Fact

Must include:
- value;
- authority;
- source;
- retrieved time;
- effective period;
- jurisdiction;
- status.

## Compliance Check

Each check:
```json
{
  "check_id": "...",
  "category": "SANCTIONS|EXPORT_CONTROL|IMPORT_CONTROL|END_USE|KYB|TARIFF|SPS|TBT|CUSTOMS|PAYMENT",
  "status": "PASS|REVIEW|BLOCK",
  "jurisdiction": "...",
  "source_ids": [],
  "reason": "..."
}
```

## Explanation

Every positive/negative reason must map to:
- a forecast component;
- verified fact;
- compliance rule;
- risk signal;
- ranking contribution.

No generic claims.

## No Legal Certainty

Use:
`System compliance assessment`

not:
`Legally guaranteed`.

## Demo Mode

If mock/seed data is active:
- expose `environment = DEMO`;
- disable trade execution/escrow;
- do not label results as verified.

# Production Test Matrix

## Data

- duplicate;
- missing;
- malformed HS6;
- unknown ISO3;
- future timestamp;
- stale source.

## Forecast

- known corridor;
- sparse corridor;
- new corridor;
- extreme quantity;
- missing macro feature.

## Anomaly

- normal;
- heuristic anomaly;
- insufficient history;
- unseen partner/product.

## Compliance

- clear;
- confirmed restricted party;
- potential restricted-party match;
- ownership ambiguity;
- prohibited product;
- restricted product without license;
- valid license;
- stale source;
- conflicting sources;
- unsupported destination;
- prohibited end use.

## Integration

- API timeout;
- n8n duplicate webhook;
- DB failure;
- model artifact missing;
- sanctions source unavailable.

## Browser

Use Playwright to verify:
- search;
- market ranking;
- compliance banner;
- blocked transaction;
- review workflow;
- source drawer;
- demo warning;
- disabled escrow.

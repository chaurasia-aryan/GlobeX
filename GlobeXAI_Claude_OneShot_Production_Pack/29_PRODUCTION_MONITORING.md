# Production Monitoring

## Application

Monitor:
- request rate;
- latency;
- error rate;
- failed workflows;
- DB health;
- n8n execution failures.

## ML

Monitor:
- input drift;
- missing features;
- forecast error when ground truth arrives;
- anomaly-rate drift;
- score distribution;
- cold-start frequency.

## Compliance

Monitor:
- source freshness;
- sanctions-list update failures;
- unresolved matches;
- REVIEW volume;
- BLOCKED volume;
- unsupported coverage;
- rule conflicts.

## Alerts

Critical:
- compliance source stale;
- sanctions feed unavailable;
- transaction gate bypass attempt;
- model artifact mismatch;
- unauthorized override.

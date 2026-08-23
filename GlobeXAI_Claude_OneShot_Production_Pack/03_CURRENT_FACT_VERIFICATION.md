# Current Fact Verification

## Objective

Separate current legal/market facts from historical model predictions.

## Required Fact Types

- tariff;
- preferential tariff;
- MFN tariff;
- RTA status;
- rules of origin;
- import/export restrictions;
- NTMs;
- SPS;
- TBT;
- licensing;
- sanctions;
- export controls;
- logistics;
- entity status;
- vessel status.

## Fact Record

Every fact:

```json
{
  "fact_id": "...",
  "value": "...",
  "unit": "...",
  "source_authority": "...",
  "source_url": "...",
  "retrieved_at": "...",
  "effective_from": "...",
  "effective_to": "...",
  "version": "...",
  "jurisdiction": "...",
  "hs6": "...",
  "origin": "...",
  "destination": "...",
  "status": "VERIFIED|STALE|CONFLICT|UNAVAILABLE"
}
```

## Critical Rule

Do not infer a preferential tariff merely because an RTA exists.

Verify:
- product;
- origin;
- destination;
- tariff line;
- preference regime;
- eligibility;
- effective period;
- rules of origin;
- certificate requirements.

## Freshness

Critical legal data must have source-specific freshness policies.

If stale:
- mark stale;
- downgrade confidence;
- or block/review if the fact is material.

## Source Priority

Official regulator/government source > official structured dataset > official document > secondary source.

Secondary sources may explain, never override the primary legal source.

## No Synthetic Legal Data

Missing law = `UNAVAILABLE`, not a guessed value.

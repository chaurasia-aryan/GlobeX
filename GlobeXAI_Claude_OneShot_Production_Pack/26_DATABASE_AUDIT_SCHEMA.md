# Database Audit Schema

## Required audit entities

Store immutable or append-only records for:
- compliance screenings;
- sanctions matches;
- rule evaluations;
- source snapshots;
- model inference;
- document verification;
- human review;
- overrides;
- transaction gate decisions.

## Minimum fields

```text
audit_id
request_id
trade_id
actor_id
action
decision
reason
source_ids
model_versions
data_versions
created_at
```

## Privacy

Do not store more personal information than necessary.

Protect:
- KYC documents;
- ownership data;
- payment details;
- API credentials.

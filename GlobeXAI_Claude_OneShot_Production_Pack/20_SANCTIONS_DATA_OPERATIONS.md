# Sanctions Data Operations

## Objective

Maintain current screening datasets.

## Required source families

- UN;
- OFAC;
- BIS restricted-party lists;
- EU;
- UK;
- India/DGFT where applicable;
- destination-specific lists where applicable.

## Record

Each list snapshot:
- source;
- list name;
- version/date;
- retrieval timestamp;
- URL;
- hash;
- record count;
- parser version;
- status.

## Update

```text
Fetch
→ Validate
→ Hash
→ Diff
→ Version
→ Activate
→ Re-screen affected open cases
```

## Failure

If update fails:
- mark stale;
- do not silently call it current;
- review/block depending on materiality.

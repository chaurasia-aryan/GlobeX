# Current Regulatory Source Registry

## Purpose

Maintain a single machine-readable registry of authoritative sources and their update policies.

## Minimum Sources

### Sanctions
- UN Security Council Consolidated List;
- OFAC Sanctions List Service;
- OFAC sanctions programs;
- UK Sanctions List;
- EU restrictive measures / sanctions map;
- additional destination/jurisdiction lists as applicable.

### Export Controls
- DGFT SCOMET;
- DGFT ITC(HS);
- DGFT Foreign Trade Policy/notifications;
- BIS EAR/CCL/CSL where applicable.

### Trade Policy
- WTO tariff/trade data;
- WTO RTA data;
- UNCTAD TRAINS;
- destination customs/tariff authority;
- India Ministry of Commerce agreements.

### Customs
- CBIC;
- ICEGATE;
- destination customs.

### Product Regulation
- FSSAI;
- plant quarantine;
- animal quarantine;
- destination SPS/TBT authorities;
- relevant product regulators.

### Entity Data
- GLEIF;
- official corporate registries where available.

## Registry Fields

```text
source_id
authority
jurisdiction
category
dataset/document
official_url
access_method
update_frequency
last_retrieved
version
effective_from
effective_to
sha256
status
freshness_policy
```

## Source Priority

Primary legal source wins.

A third-party explanation may be stored as context but cannot override the official rule.

## Monitoring

Create a scheduled update process.

On source change:
- retrieve;
- validate;
- hash;
- version;
- compare;
- mark supersession;
- update compliance cache;
- invalidate affected decisions if required.

## Fail-Safe

If a critical source cannot be refreshed:
- mark stale;
- prevent silent reuse as current;
- downgrade/review/block decisions depending on materiality.

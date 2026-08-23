# Sanctions and Restricted-Party Screening

## Objective

Prevent GlobeXAI from facilitating transactions prohibited by applicable sanctions, export restrictions, or restricted-party rules.

## Important Legal Model

Do NOT maintain only a "restricted countries" list.

Sanctions can target:
- countries/territories;
- individuals;
- entities;
- vessels;
- aircraft;
- sectors;
- banks/financial institutions;
- ownership/control relationships;
- specific goods;
- end uses/end users.

OFAC explicitly states that it does not maintain one universal country list and that sanctions can be comprehensive or selective. citeturn0search7

## Source Registry

At minimum support:

### United Nations
Use the UN Security Council Consolidated List and regime-specific lists.
The UN publishes the current consolidated list in XML/HTML/PDF and states that Member States implement measures applicable to listed persons/entities. citeturn0search1

### United States
Use OFAC:
- SDN;
- Non-SDN consolidated lists;
- sanctions programs;
- program-specific restrictions;
- vessels/aircraft where relevant.

OFAC provides downloadable current sanctions data and a sanctions search service. citeturn0search2

### BIS / US Export Controls
Use:
- Denied Persons List;
- Entity List;
- Unverified List;
- Military End User List;
- Consolidated Screening List;
- EAR end-use/end-user controls.

The US Consolidated Screening List is explicitly intended as a screening aid for restricted parties. citeturn1search3

### European Union
Use official EU restrictive-measures/legal sources and the EU sanctions map.
The EU maintains more than 40 sanctions regimes and an official consolidated financial sanctions list. citeturn2search6

### United Kingdom
Use the UK Sanctions List.
The UK states that from 28 January 2026 it is the only source for UK sanctions designations. citeturn2search0

### India
Use applicable DGFT/DGFT trade-control sources, official Indian notifications and applicable government restrictions.

## Entities to Screen

For a transaction screen:
1. exporter;
2. importer;
3. beneficial owners where available/required;
4. directors/signatories where relevant;
5. banks/payment institutions;
6. freight forwarder;
7. carrier;
8. vessel/aircraft where relevant;
9. intermediary/consignee;
10. end user.

## Matching

Use:
- exact identifiers;
- aliases;
- transliterations;
- addresses;
- registration numbers;
- dates of birth where applicable;
- LEI where available.

Fuzzy matching is a candidate generator, not a legal finding.

## Ownership

Do not screen only the named company.
Where the applicable regime contains ownership/control rules, evaluate relevant ownership/control.

OFAC states that entities owned 50% or more, directly or indirectly, by blocked persons are blocked under its 50 Percent Rule. citeturn0search7

## Decision

`NO_MATCH`:
No relevant match found.

`POTENTIAL_MATCH`:
Fuzzy/partial match requiring human resolution.

`MATCH_REQUIRES_RESTRICTION`:
Confirmed applicable designation/restriction.

`CLEARED_AFTER_REVIEW`:
Potential match resolved with documented evidence.

## Fail Closed

If a material sanctions match cannot be resolved:
`REVIEW`, not `CLEAR`.

If the applicable law prohibits the transaction:
`BLOCKED`.

## Required Data

Create:
`data/compliance/sanctions/`
- source_registry.csv
- sanctions_entities.parquet
- sanctions_programs.parquet
- restricted_party_screening_log.parquet

## Audit

Store:
- query;
- matched record;
- source;
- list version;
- timestamp;
- match method;
- reviewer;
- decision;
- evidence.

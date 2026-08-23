# Phase 8a — Entity-Level Restricted-Party Screening

**Status:** delivered
**Built:** 2026-08-23 (source fetches for OFAC SDN and UN Consolidated List happened earlier the same day, real timestamps recorded in `source_registry.json`)
**Scope decision:** OFAC SDN + UN Security Council Consolidated List only. BIS, EU, UK, and DGFT restricted-party lists are explicitly NOT covered — no free bulk-download source was integrated for them this pass. This mirrors Phase 7's honesty pattern: gaps are reported, never silently treated as "clear."

## 1. What was built

| Artifact | Path |
|---|---|
| Raw OFAC SDN export | `backend/brain/compliance_data/sanctions_entities/sdn.csv` |
| Raw OFAC SDN aliases | `backend/brain/compliance_data/sanctions_entities/alt.csv` |
| Raw UN Consolidated List | `backend/brain/compliance_data/sanctions_entities/un_consolidated.xml` |
| Build/normalize script | `backend/brain/compliance_data/sanctions_entities/build_registry.py` |
| Normalized entity registry | `backend/brain/compliance_data/sanctions_entities/normalized_entities.json` |
| Source registry (fetched + unsupported) | `backend/brain/compliance_data/sanctions_entities/source_registry.json` |
| Screening module | `src/compliance/entity_screening.py` |
| Tests | `tests/test_entity_screening.py` (9 tests, real data, 0 mocks) |

**20,260 normalized entity records** (19,249 from OFAC SDN + 1,011 from the UN Consolidated List: 736 individuals, 275 entities), each carrying `entity_id`, `name`, `aliases`, `entity_type`, `program`, `source`, `source_ref` for full provenance back to the original list row.

## 2. Sources

### 2.1 Fetched successfully (2)

| Source | Authority | URL | Record count |
|---|---|---|---|
| OFAC SDN + aliases | US Office of Foreign Assets Control | `sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/{sdn,alt}.csv` | 19,249 entities, 20,193 aliases |
| UN Consolidated List | United Nations Security Council | `scsanctions.un.org/resources/xml/en/consolidated.xml` (list generated 2026-08-22T23:00:03.221Z) | 736 individuals + 275 entities |

**Note on URL discovery**: the OFAC domain has moved since older documentation — `treasury.gov/ofac/downloads/sdn.csv` now 302-redirects to `sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/sdn.csv`, which is the URL actually used. Verified via direct `curl -I` before downloading, not assumed from stale docs.

### 2.2 Explicitly unsupported (4)

| Source | Reason |
|---|---|
| BIS Consolidated Screening List | No free bulk-download integrated this pass |
| EU Consolidated Financial Sanctions List | No free bulk-download integrated this pass |
| UK Sanctions List | Not wired up this pass |
| DGFT Restricted Parties | No machine-readable DGFT list identified |

Every `screen_entity()`/`screen_transaction_parties()` response carries these four as `coverage_gaps` — visible to every caller, not buried in documentation.

## 3. Matching approach

`rapidfuzz.fuzz.token_sort_ratio` (0-100 scale) against each entity's canonical name and every known alias. Two thresholds, both documented in-code:
- **≥97.0** → `MATCH_REQUIRES_RESTRICTION` (confirmed applicable designation)
- **82.0–97.0** → `POTENTIAL_MATCH` (fuzzy candidate, human review required — never auto-escalated)
- **<82.0** → `NO_MATCH`

Fuzzy matching is explicitly documented as "a candidate generator, not a legal finding" per `04_SANCTIONS_AND_RESTRICTED_PARTY_SCREENING.md`.

**OFAC 50% Rule**: an entity 50%+ owned by a blocked person is itself blocked, even if the entity's own name doesn't match anything. Implemented via an optional `beneficial_owners` parameter. If no ownership data is supplied, the response explicitly says `"NOT_EVALUATED — no beneficial ownership data supplied"` rather than silently treating the entity as clear.

## 4. A real bug found and fixed during testing

The first test pass (7/8 manual checks) caught a genuine logic bug in the 50% ownership rule: it sat behind an early `return` in the "primary entity has no match" branch, making it **unreachable in exactly the scenario it exists for** — a clean-named shell company owned by a blocked person. Fixed by restructuring so the ownership check always runs regardless of the primary entity's own match result. Verified via `tests/test_entity_screening.py::test_fifty_percent_ownership_rule`, which specifically exercises this path (primary name is a clean-sounding "Some Random Legit Trading Co Ltd", triggers `MATCH_REQUIRES_RESTRICTION` only via the 60%-owner rule).

## 5. Test results (real, run, not asserted)

```
tests/test_entity_screening.py::test_exact_ofac_sdn_match PASSED
tests/test_entity_screening.py::test_ofac_alias_match PASSED
tests/test_entity_screening.py::test_fabricated_name_no_match PASSED
tests/test_entity_screening.py::test_fuzzy_near_match_single_typo PASSED
tests/test_entity_screening.py::test_missing_optional_data_handled PASSED
tests/test_entity_screening.py::test_transaction_screening_mixed_parties PASSED
tests/test_entity_screening.py::test_fifty_percent_ownership_rule PASSED
tests/test_entity_screening.py::test_ownership_not_evaluated_below_fifty_percent PASSED
tests/test_entity_screening.py::test_registry_unavailable_fails_closed PASSED

9 passed in 3.51s
```

This is also the first real pytest suite for this project — `pytest.ini` (`testpaths = tests`, `asyncio_mode = auto`) and the `tests/` directory did not exist before this pass.

## 6. Audit logging

**Not yet implemented this pass.** The spec (`04_SANCTIONS_AND_RESTRICTED_PARTY_SCREENING.md` §"Audit") requires persisting query/matched-record/source/list-version/timestamp/match-method/reviewer/decision/evidence for every screening call. `screen_entity()`/`screen_transaction_parties()` currently return this data to the caller but do not persist it. Next step: either a `restricted_party_screening_log` table (the spec's own suggestion) or, minimally, an append-only `screening_log.jsonl` under the same `sanctions_entities/` directory — deferred, not silently dropped.

## 7. Interface for calling code

```python
from src.compliance.entity_screening import screen_transaction_parties

result = screen_transaction_parties({
    "exporter": "...",
    "importer": "...",
    "freight_forwarder": "...",   # any role name works; omitted roles are just skipped
})
if result["overall_decision"] != "NO_MATCH":
    # route to manual review — never silently proceed
    ...
```

## 8. Not yet done

- Audit log persistence (§6).
- Not yet wired into the Transaction Compliance Gate (`08_TRANSACTION_COMPLIANCE_GATE.md`) — this module exists standalone; the gate that orchestrates it + `current_facts.py` + anomaly/risk into a single CLEAR/REVIEW/BLOCKED/UNSUPPORTED decision is the next phase.
- `/compliance/rag-analyze` still serves the old fabricated 9-corridor table — rewiring it onto both `current_facts.py` and `entity_screening.py` is that same next-phase work.

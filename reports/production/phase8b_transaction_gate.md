# Phase 8b — Transaction Compliance Gate

**Status:** delivered
**Built:** 2026-08-23, same session as Phase 8a (entity screening)

## What was built

`src/compliance/transaction_gate.py` — the single deterministic gate per `08_TRANSACTION_COMPLIANCE_GATE.md`, orchestrating:
1. `src/compliance/current_facts.py` (Phase 7) — tariff/RTA/export-control/country-sanctions facts
2. `src/compliance/entity_screening.py` (Phase 8a) — OFAC SDN + UN restricted-party screening

into one `CLEAR` / `REVIEW` / `BLOCKED` / `UNSUPPORTED` decision, with a `recommendation` (`PROCEED`/`REVIEW`/`BLOCK`/`UNSUPPORTED`) and `escrow_allowed` (boolean — only `true` on `CLEAR`).

Wired into the API (`src/api/compliance_api.py`, additive — the existing tested `/compliance/rag-analyze` endpoint was **not** touched):
- `POST /compliance/transaction-gate` — the gate itself
- `POST /compliance/sanctions-screen` — direct entity screening
- `GET /compliance/coverage` — honest coverage report (in-scope HS6/partner counts, entity count, unsupported sources) for both subsystems

All three verified live via real HTTP calls against a running `uvicorn` instance (not just unit tests):
```
GET /compliance/coverage
→ {"current_facts": {"available": true, "in_scope_hs6_count": 34, "in_scope_partners_count": 51, ...},
    "entity_screening": {"available": true, "entity_count": 20260, "unsupported_sources": [...]}}

POST /compliance/transaction-gate  (exporter = a real OFAC SDN entity)
→ {"decision": "BLOCKED", "escrow_allowed": false,
    "reasons": ["Current-fact registry has partial coverage — missing categories: ['export_controls', 'sps_tbt']",
                "Restricted-party match confirmed for role(s): ['exporter']"]}

POST /compliance/sanctions-screen  (same entity)
→ {"overall_decision": "MATCH_REQUIRES_RESTRICTION", ...}
```

## Decision logic (priority order, matches the spec exactly)

1. Malformed input (missing hs6/origin/destination) → `UNSUPPORTED`.
2. Confirmed restricted-party match (`MATCH_REQUIRES_RESTRICTION`, including via the 50% ownership rule) → `BLOCKED`. This takes priority over everything else — it can never be overridden by a good compliance score or anything else, because the gate structurally doesn't accept a market-opportunity/commercial score as input at all.
3. Current-facts `UNSUPPORTED` → gate `UNSUPPORTED`.
4. Entity-screening `UNSUPPORTED` (coverage doesn't extend to these parties) → gate `UNSUPPORTED`.
5. Potential (fuzzy) restricted-party match, or current-facts `CONFLICT`/partial coverage/non-`CURRENT` status → `REVIEW`.
6. Otherwise → `CLEAR`.

`UNSUPPORTED != CLEAR` and `REVIEW != CLEAR` are enforced structurally — there's no code path that maps either to `CLEAR`.

## Real, honest test results (14 tests total across both Phase 8 modules)

```
tests/test_entity_screening.py — 9 passed
tests/test_transaction_gate.py — 5 passed
  test_blocked_on_restricted_party_match         (real OFAC entity → BLOCKED, escrow disabled)
  test_unsupported_on_out_of_scope_corridor      (fake HS6/country → UNSUPPORTED)
  test_review_on_partial_coverage_real_corridor  (real in-scope corridor, real documented gap → REVIEW)
  test_malformed_input_is_unsupported_not_clear
  test_clear_only_when_facts_current_and_screening_clean  (isolated/mocked — see below)

14 passed in 3.85s
```

**Honest finding, not a test gap**: a scan of 150 real in-scope HS6/partner combinations found **zero** that currently reach `CURRENT` status with no category gaps in the Phase 7 current-facts registry — consistent with Phase 7's own documented finding that tariff-fact coverage is thin (6.9% of tier-1 corridors). This means the real, end-to-end data currently in the registry cannot produce a `CLEAR` decision through this gate yet — every real query lands at `REVIEW` at best, given today's data coverage. The `CLEAR` branch's logic is proven correct via one isolated test that patches `get_current_facts` to return a clean result (documented in the test itself as testing gate logic in isolation, not claiming real data reaches it) — this is honestly labeled, not presented as an end-to-end pass.

## Not yet done

- Audit log persistence (same gap as Phase 8a — carries through here since the gate calls entity_screening directly).
- `end-use`/`end-user` screening beyond name-matching (the spec's fuller "end use/end user validation" concept, `21_COMPLIANCE_RULE_ENGINE.md` territory) not implemented.
- `/compliance/rag-analyze` still serves the old fabricated 9-corridor `_TREATY_MAP` — left untouched this pass to avoid breaking existing frontend consumers; migrating it onto `current_facts.py` is separate follow-up work, not silently skipped.
- Frontend has no UI for the gate yet — `ComplianceChecklistWidget.tsx`'s hardcoded "87/100 COMPLIANT" badge (found earlier this session) still needs rewiring to call these real endpoints.

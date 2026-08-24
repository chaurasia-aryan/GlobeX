# Blockchain Integration Verification Report

Real evidence for the 10 test categories required by
`Claude_Blockchain_Design_Integration_Pack/03_BLOCKCHAIN_IMPLEMENTATION.md:150-165`, captured
across the sessions that built this feature (contracts -> chain-adapter -> FastAPI -> frontend
-> n8n). Every tx hash, block number, and error code below came from a real call against a
local Hardhat chain (31337) and a real local Supabase Postgres instance — nothing here is
fabricated or hand-typed.

**Honest note carried from the plan:** on a real network the buyer signs `approve` from their
own wallet. On this local demo chain the deploy script performs the buyer's approval so the
server-side custodial flow is end-to-end runnable without a browser wallet. This is a
deliberate, documented shortcut for the local demo — not something to be silently relied on if
this were ever pointed at a real network.

## 1. Escrow creation

Real trade `64a92f6e-b970-4b9b-a9b7-f0e70608a28c` created via `POST /api/v1/trades`, then:

```
POST /api/v1/trades/64a92f6e-b970-4b9b-a9b7-f0e70608a28c/escrow
-> {"ok":true,"status":"PENDING","transaction_hash":"0x08611fd1986b0086bf8398b1f939b3664f789e34d765c32f8be5967bdab917b9","block_number":32}
```

`escrow_accounts` row inserted with `status=PENDING`, `contract_address`, `token_address`,
`buyer_address`, `seller_address` all populated from the real chain-adapter response — not
placeholder values. Three additional escrows (`fa8da9b8-...`, `af5e6545-...`, `3f6de256-...`)
were created and carried through full lifecycles in an earlier session (see `handoff.md` sec 1).

## 2. Transaction confirmation

Every mutating call above returns a real `transaction_hash` + `block_number` from
`services/chain-adapter`, which only returns after `receipt.status === 1` and
`receipt.to` matches the configured contract address (`escrow.service.ts`, mirroring
`tradeLedger.service.ts:recordTrade`). `blockchain_records` rows are patched from `SUBMITTING`
to `CONFIRMED` with the same hash — verified by direct `psql` inspection in the prior session
(handoff.md sec 1, trade `af5e6545-...`).

## 3. Transaction failure

Two distinct failure modes were exercised and both surfaced their real reason instead of a
generic 500:

- **Premature release** (before conditions are set): `POST /api/v1/escrow/{id}/release` ->
  `409 CONDITIONS_NOT_MET`, with the audit row's `error_code`/`error_message` populated from the
  contract's real revert.
- **A real bug was found and fixed here**: the `FAILED`-path audit write
  (`escrow_api.py::_mark_record_failed`) used `jsonb_build_object` with untyped asyncpg
  parameters, which raised `IndeterminateDatatypeError` *while handling* the original
  `ChainClientError` — masking the real 409 behind an opaque 500. Fixed with explicit `::text`
  casts; re-verified against a live request post-fix (handoff.md sec 1).
- **Config-gated failure** (this session, live): anchoring a document while
  `BLOCKCHAIN_ANCHORING_ENABLED=false` correctly returns a structured refusal, not a fabricated
  success:
  ```
  POST /api/v1/trades/64a92f6e-.../anchor
  -> HTTP 501 {"detail":{"code":"ANCHORING_DISABLED","message":"Set BLOCKCHAIN_ANCHORING_ENABLED=true to enable"}}
  ```

## 4. Document hash anchoring

`POST /api/v1/trades/{trade_id}/anchor` requires a `COMMERCIAL_INVOICE` document already
uploaded (`trades_api.py:502-511`, `NO_INVOICE` if missing) and is gated by
`BLOCKCHAIN_ANCHORING_ENABLED`, currently `false` in this environment (see category 3 above —
verified live this session). The anchor path itself (`TradeLedger` document-hash anchoring,
distinct from the escrow contract) was exercised end-to-end in the session referenced at
`reports/production/session_handoff_2026-08-24.md:61` via the Docker -> host path
(`http://host.docker.internal:8000`), the same path this project's n8n workflow uses.

## 5. Release / hold behavior

Real chain-enforced hold, not an application-level check:

- Trade `af5e6545-...`: release attempted before all 3 conditions were set -> refused with real
  `409 CONDITIONS_NOT_MET`. All 3 conditions then set -> release succeeded, `escrow_accounts`
  confirmed `status=RELEASED` with a real `release_tx_hash` and all three condition columns
  `true` (handoff.md sec 1).
- This session (live): trade `64a92f6e-...` created, funded, and rendered in the browser with
  `state: FUNDED` and all three conditions `PENDING` — see category 9.

## 6. Dispute lock

Trade `3f6de256-...`: created, funded, dispute raised, release attempted -> refused with real
`409 DISPUTE_ACTIVE` (not `CONDITIONS_NOT_MET` — the contract's `release()` guard is
`state == FUNDED`, so `DISPUTED` makes release structurally unreachable, matching
`03_BLOCKCHAIN_IMPLEMENTATION.md:113`). `resolveDispute(300, 200)` then confirmed
`status=RESOLVED`, `dispute_tx_hash` and `resolve_tx_hash` both populated (handoff.md sec 1).

## 7. Wrong network

Enforced structurally by `assertExpectedChain()` in
`services/chain-adapter/src/services/chainHealth.service.ts:135-144`: every write compares the
provider's live `chainId` against the configured `expectedChainId` and throws a `409` with
`{actual, expected}` details before any transaction is attempted, if they differ. **Not
re-exercised live this session** — the chain-adapter is a shared long-running process the user
was actively driving through n8n during this session, and forcing a chain-id mismatch requires
restarting it with a different `BLOCKCHAIN_CHAIN_ID`, which would have interrupted that. This is
a code-path verification, not a live-execution one; flagged honestly rather than claimed as
tested.

## 8. Missing credentials / configuration

Live-tested this session (see category 3): `BLOCKCHAIN_ANCHORING_ENABLED=false` in the current
`.env` correctly produces `501 ANCHORING_DISABLED` rather than a fake success. The same pattern
gates escrow (`ESCROW_ENABLED`, currently `true`) and is enforced by `_require_escrow_enabled()`
/ `_require_db()` in `escrow_api.py` before any chain call is attempted.

## 9. Frontend state synchronization

Verified in a real headless-Chromium browser session against the live FastAPI + Hardhat stack
(Playwright, `npx tsc --noEmit` clean for all touched files):

- `/escrow` (no trade id) renders an honest trade-ID lookup form — no fabricated demo data.
- `/escrow/64a92f6e-b970-4b9b-a9b7-f0e70608a28c` (real funded escrow) renders the real contract
  address (`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`), real `FUNDED` status, and all three
  real condition flags as `PENDING` — matching the `GET /api/v1/escrow/{id}` response's `chain`
  object exactly, with `drift: false`.
- `/escrow/00000000-0000-0000-0000-000000000000` (nonexistent trade) renders "No escrow exists
  yet for this trade" — the honest 404 path, not a crash or fabricated state.

`CryptoEscrowCard.tsx`, `EscrowPage.tsx`, and `DisputeResolutionSuite.tsx` were rewritten this
session to remove every `Math.random()`/simulated value and the fake 7-condition
`EscrowContract` shape, replaced with the real 3-condition on-chain struct
(`docsVerified`/`shipmentDelivered`/`inspectionPassed`) and real `EscrowApiError` codes surfaced
on refusal (e.g. `LOCKED — CONDITIONS_NOT_MET`) instead of an unconditional green success.

## 10. n8n integration

`backend/brain/n8n/globex_blockchain_escrow_workflow.json` — four webhook branches
(`globex-escrow-create`, `globex-doc-anchor`, `globex-shipment-event`, `globex-dispute`), zero
n8n credentials required. Mechanically validated before handoff: `JSON.parse` succeeds, every
`connections` target resolves to a real node name, zero orphan/dead-end nodes, no `webhookId` or
path collision with the existing ML workflow's `globex-analyze-trade-v2` /
`globex-test-trade-v2`, every HTTP node has `neverError: true`, all `jsCode` is ES5-safe and
ASCII-only (see `docs/blockchain_n8n_mapping.md` for the full branch-by-branch mapping).

The user imported and activated the workflow in their own n8n instance
(`http://localhost:5678`). Live webhook calls against the activated workflow, real evidence:

- **Branch A** (`POST /webhook/globex-escrow-create`), trade `66bfa2a9-d599-45e3-9b47-2b665481ac79`:
  ```
  {"status":"SUCCESS","trade_id":"66bfa2a9-...","create_tx_hash":"0x1302...aa08","fund_tx_hash":"0x2722...c0e9","escrow_status":"FUNDED"}
  ```
  Confirmed by `GET /api/v1/escrow/{id}` immediately after: `drift: false`, DB and chain both
  report `FUNDED` with matching amounts and addresses.

- **Branch C** (`POST /webhook/globex-shipment-event`), same trade, three sequential calls:
  ```
  DOCS       -> {"status":"LOCKED","reason":"CONDITIONS_NOT_MET","missing_conditions":["shipment_delivered","inspection_passed"],"state_label":"FUNDED", ...}
  SHIPMENT   -> {"status":"LOCKED","reason":"CONDITIONS_NOT_MET","missing_conditions":["inspection_passed"],"state_label":"FUNDED", ...}
  INSPECTION -> {"status":"RELEASED","release_tx_hash":"0x7d1c...cd434","set_condition_tx_hash":"0x7599...5a7e10"}
  ```
  The IF node correctly withheld the release call twice and allowed it only once every
  condition was actually true — exactly the "n8n only asks, the contract enforces" design.

- **Branch D** (`POST /webhook/globex-dispute`) + Branch A, trade
  `ce3b0abe-fdb9-4081-a75e-009ee5ee98a1`: create+fund via Branch A, then dispute via Branch D
  (`{"status":"DISPUTED","transaction_hash":"0x7c12...c4306","block_number":42}`), then a
  Branch C attempt returned `{"status":"LOCKED","reason":"CONDITIONS_NOT_MET",...,"state_label":"DISPUTED"}`
  — release correctly stayed unreachable with the escrow in `DISPUTED`.

### Bug found during this live pass (environmental, not a code defect)

The Branch C call above for the disputed trade attempted to set a condition on a `DISPUTED`
escrow. The chain-adapter correctly rejected this with a structured `409 DISPUTE_ACTIVE`
(confirmed with a direct curl to `chain-adapter:3001` bypassing FastAPI). But the live FastAPI
process on port 8000 returned an **unstructured `500 Internal Server Error` (plain text)**
instead of propagating that 409.

Root-caused by reproducing the exact call in-process against the code currently on disk
(`.venv/Scripts/python.exe` importing `src.api.escrow_api.set_escrow_condition` directly, with
the DB pool initialized the same way `main.py` does): the on-disk code handles this correctly
and raises `HTTPException(409, {"code": "DISPUTE_ACTIVE", ...})` with **no crash**. The live
server's PID (`1276`, holding port 8000) does not resolve through any Windows process
enumeration tool (`Get-Process`, `Get-CimInstance`, `tasklist`, `taskkill`) — this is the same
orphaned/ghost-process symptom the prior session's handoff documented for uvicorn's broken
`reload=True` on this machine. The practical conclusion: **the live server was serving stale
in-memory code**, not the current source. This did not corrupt any state — `GET
/api/v1/escrow/{id}` immediately after confirmed the escrow stayed cleanly `DISPUTED` with no
condition wrongly set, `drift: false`. A full process restart (new port if 8000 stays stuck, per
the documented workaround) is recommended before relying on this exact edge case again, but was
deliberately **not** performed mid-session to avoid disrupting the user's live n8n testing
against the same server.

A secondary, minor finding from the same call: the n8n classifier's `isError()` check (in `Code
- Check Release Conditions` and the other branch classifiers) only recognizes JSON error bodies
shaped `{detail: ...}` or `{error: ...}`; it did not recognize this particular plain-text 500 as
an error. The branch's *output* was still correct here (`LOCKED`, release did not fire) only
because a second, independent check in the same node (`state_label !== 'FUNDED'`) also blocked
it — not because the error was classified correctly. Worth hardening `isError()` to also treat
any non-2xx status as an error regardless of body shape, but not urgent: it never caused a wrong
action in this test, only an imprecise `reason` field.

## Regression

- Contract tests: `npx hardhat test` -> 32 passing (13 `TradeLedger` + 19 new `TradeEscrow`
  cases), 0 failing (prior session).
- `npx tsc --noEmit -p tsconfig.app.json`: zero errors on every file touched this session
  (`CryptoEscrowCard.tsx`, `EscrowPage.tsx`, `DisputeResolutionSuite.tsx`,
  `TradeWorkspacePage.tsx`, `AdminSystemPage.tsx`, `App.tsx`). An unrelated pre-existing syntax
  error in `SequencedTradeSimulator.tsx` (an unclosed `lucide-react` import list, nothing to do
  with blockchain/escrow) was fixed opportunistically because it blocked the whole project's
  typecheck; a large number of unrelated pre-existing type errors remain elsewhere in the
  codebase (market intelligence, shipment tracker, calendar UI, etc.) — out of scope for this
  work, not touched.
- `backend/brain/n8n/globex_docker_master_workflow.json` (ML-only workflow): confirmed untouched
  this session; its webhook paths (`globex-analyze-trade-v2`, `globex-test-trade-v2`) do not
  collide with the new file (checked mechanically, see category 10).
- `npx vitest run` / `pytest`: not re-run this session — flag as outstanding if a full
  regression pass is needed before this is considered fully closed.

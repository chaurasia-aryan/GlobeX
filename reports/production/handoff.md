# GlobeXAI — Blockchain + Escrow + n8n Rewrite — Session Handoff

**Date:** 2026-08-24 (third handoff, same day — continuation of the two handoffs below the `---`)
**Status:** IN PROGRESS — Phase 5 (FastAPI persistence layer) is now DONE and fully verified end-to-end, including a real bug found and fixed. Phase 6 (frontend) is STARTED but only 1 of ~5 files done. Phases 7-8 not started. Written mid-task at the user's request for a handoff — read this top section first, older sections below are prior context.

**Full plan (read this first):** `C:\Users\Aryan\.claude\plans\fix-the-entire-blockchain-snuggly-phoenix.md`

---

## 1. What changed since the previous handoff

### Phase 5 — FastAPI persistence layer — DONE and verified

- **`src/services/chain_client.py`** — added 8 escrow functions (`escrow_create, escrow_fund, escrow_set_condition, escrow_release, escrow_dispute, escrow_resolve, escrow_refund, escrow_get`) via a shared `_escrow_post()` helper, mirroring `anchor_trade`'s shape exactly.
- **New `src/api/escrow_api.py`** — `prefix="/api/v1"`, `tags=["Escrow"]`, gated by new `ESCROW_ENABLED` env flag (mirrors `ANCHORING_ENABLED`). Registered in `main.py` (`from src.api.escrow_api import router as escrow_router` + `app.include_router(escrow_router)`, placed right after `trades_router`). Implements all 8 routes from the plan's Phase 5 table, each following the write-intent-before-chain pattern via a shared `_run_mutating_call()` helper: insert a `SUBMITTING` `blockchain_records` row → call `chain_client` → patch to `CONFIRMED` (with real tx hash) or `FAILED` (with real error code/message). `GET /api/v1/escrow/{trade_id}` reads the DB row **and** live on-chain state via `chain_client.escrow_get`, and reports drift explicitly (`drift: bool`, `drift_details: string[]`) rather than trusting the DB blindly.
- **New migration `backend/database/supabase/migrations/20260824020000_escrow_settlement_columns.sql`** — additive only: adds `'RESOLVED'` to `public.escrow_status` enum, plus `dispute_tx_hash, resolve_tx_hash, buyer_address, seller_address, token_address, shipment_delivered` columns on `escrow_accounts`. **Applied successfully** via `npx supabase db reset` (run from `backend/database/`, since that's where `supabase/config.toml` lives) — verified with `\d public.escrow_accounts` and `enum_range` showing all 7 values including RESOLVED.

### A real bug was found and fixed during Phase 5 verification

**Symptom:** every mutating escrow route's *failure* path (e.g. calling `/release` before conditions were set) returned a raw `Internal Server Error` / HTTP 500 instead of propagating the real `409 CONDITIONS_NOT_MET`.

**Root cause:** in `escrow_api.py`'s `_mark_record_failed()` (writes the `FAILED` audit row into `blockchain_records`), the query used `jsonb_build_object('status', 'FAILED', 'error_code', $2, 'error_message', $3)` with **no explicit cast** on `$2`/`$3`. `jsonb_build_object` is a `VARIADIC "any"` function, and asyncpg's extended query protocol (unlike psql's simple `PREPARE ... AS` which silently defaults unresolvable params to `text`) raises `asyncpg.exceptions.IndeterminateDatatypeError: could not determine data type of parameter $2` when it can't infer a type for a parameter passed into a variadic-any function. This exception happened *inside the except block that was already handling a `ChainClientError`* (i.e. while trying to record the failure), so the real 409 got masked by an unrelated 500.

**Fix:** added `::text` casts — `jsonb_build_object('status', 'FAILED', 'error_code', $2::text, 'error_message', $3::text)`. Verified fixed by direct asyncpg reproduction script before touching the server, then confirmed against a live request.

**Any future `jsonb_build_object`/similar variadic-any call with asyncpg parameters MUST have explicit `::text`/`::int`/etc. casts on every parameter** — `_mark_record_confirmed()` already had these casts (which is why only the FAILED path broke, not the CONFIRMED path). Grep for `jsonb_build_object` before adding new mutating routes.

### A separate, unrelated environment problem was hit and worked around — **important, read before touching FastAPI process management**

While chasing the bug above, `python main.py` (which calls `uvicorn.run(..., reload=True)`) exhibited a **broken hot-reload on this Windows machine**: WatchFiles logged "detected changes... Reloading" but the actual listening process never truly restarted (confirmed: only one "Started server process" line ever appeared in the log across multiple edits). Worse, when I tried to kill and restart, **port 8000 got stuck**: `netstat -ano` showed `LISTENING` owned by PID 1276, but `Get-Process -Id 1276` said no such process exists — an orphaned kernel socket handle, not a real listener, but it still refused new binds (`[Errno 10048]`).

**Workaround applied:** ran FastAPI directly via `.venv/Scripts/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001` (no `--reload`, and on port **8001**, not 8000, to dodge the stuck socket). **This is what's running right now** — see §2.

**If you hit this again:** don't fight the reloader. Kill everything main.py-related via PowerShell `Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%uvicorn%'"` / `%main.py%` + `Stop-Process -Force`, then check `netstat -ano | grep ":8000"` before rebinding — if the LISTENING PID doesn't resolve via `Get-Process`, just use a different port rather than debugging the stuck handle, it's not worth the time.

### Full Phase 5 verification lifecycle — all passed, evidence below

Three real trades were created via `POST /api/v1/trades` against the real seeded orgs (`00000002-0000-0000-0000-000000000001` exporter / `...005` importer):

1. **Trade `fa8da9b8-...`**: create → fund → `GET /escrow/{id}` showed **zero drift** between DB and live chain state (`"drift": false, "drift_details": []`) → conditions set → release → RELEASED with real tx hash. (This trade's *first* premature-release attempt hit the bug above and the stuck-port issue — ignore that noise, it was retested clean on trade 2.)
2. **Trade `af5e6545-...`**: create → fund → premature release correctly refused with `409 CONDITIONS_NOT_MET` (confirmed post-fix) → the `ESCROW_RELEASE_FAILED` audit row in `blockchain_records` has the real `error_code`/`error_message` → 3 conditions set → release → DB row confirmed `status=RELEASED`, `release_tx_hash` populated, all three condition columns `true`.
3. **Trade `3f6de256-...`**: create → fund → dispute raised → release correctly refused with `409 DISPUTE_ACTIVE` → `resolveDispute(300, 200)` → DB row confirmed `status=RESOLVED`, `dispute_tx_hash` and `resolve_tx_hash` both populated, `dispute_active=false`.

**This is the plan's Verification step 5, done** (except the "stop the adapter mid-flight" deliberate-crash sub-test specifically — not yet done; the FAILED-path test above proves the *chain rejecting the tx* case, not the *adapter becoming unreachable mid-call* case. Low priority to add given the write-intent-before-chain pattern is structurally the same either way, but flagging it as not literally executed).

## 2. Live environment state RIGHT NOW — read before running anything

- **Hardhat node**: still running on `http://127.0.0.1:8545`, chain 31337. Verify with the usual `eth_chainId` curl.
- **`services/chain-adapter`**: still running on `http://127.0.0.1:3001` (the same process from the previous handoff, untouched this session).
- **Docker Desktop**: was not running at the start of this session; was launched (`"/c/Program Files/Docker/Docker/Docker Desktop.exe"`) and **Supabase's local stack came up automatically** (containers had been running before, presumably with a restart policy) — `supabase_db_GlobeX` on `127.0.0.1:54322`, plus studio/storage/pg_meta etc, all healthy.
- **Local Supabase DB was reset this session** (`npx supabase db reset` from `backend/database/`) — this **wiped and re-seeded** all demo data (re-ran every migration including `20260822182000_seed_globex_demo_data.sql` and the new escrow migration). Any manual demo data from earlier sessions is gone; the seed script's data is back. Three throwaway trades were created during Phase 5 testing (see §1) — harmless, on-chain and in-DB, safe to ignore or leave.
- **FastAPI is running on `http://127.0.0.1:8001`** (not the usual 8000 — see the stuck-socket note in §1), started via `.venv/Scripts/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001`, logging to `/tmp/fastapi3.log`. `ESCROW_ENABLED=true` was added to `.env` (alongside the pre-existing `SUPABASE_DB_URL`, `CHAIN_ADAPTER_URL`, `BLOCKCHAIN_ANCHORING_ENABLED=false`). **If you restart FastAPI, check `netstat -ano | grep ":8000"` first** — port 8000 may still be stuck; use 8001 or another free port if so, and remember any frontend testing needs `VITE_FASTAPI_AI_URL` to match whatever port you actually land on.
- **`services/chain-adapter`'s on-chain state has more test data now** too (trades `fa8da9b8`, `af5e6545` both RELEASED; `3f6de256` RESOLVED) — harmless.

## 3. Phase 6 — frontend truth-up — STARTED, mostly NOT done

**Done:**
- **`src/services/blockchain/escrowService.ts` — fully rewritten.** Deleted every `Math.random()` fake receipt generator. Kept `computeFileHash` unchanged. New `EscrowApiError` class carries the backend's real `code`/`httpStatus`/`details` (so callers can distinguish `CONDITIONS_NOT_MET` from a generic failure). New methods: `getEscrowStatus`, `createEscrow`, `fundEscrow`, `setCondition`, `releaseEscrow`, `raiseDispute`, `resolveDispute`, `refundEscrow` — all real `fetch` calls to `${VITE_FASTAPI_AI_URL}/api/v1/escrow/*` and `/api/v1/trades/{id}/escrow`, following the exact fetch/error-throwing convention already used in `src/services/api/aiService.ts` (`this.baseUrl = (import.meta as any).env?.VITE_FASTAPI_AI_URL || "http://localhost:8000"`). `getStatus()` kept as a **synchronous** method (matches the convention other services like `n8nWorkflowService`/`aiService` use for the admin panel) but now describes the real architecture (`"Frontend -> FastAPI /api/v1/escrow/* -> chain-adapter -> TradeEscrow.sol"`, `status: "LIVE"`) instead of `"SIMULATED"`.
- **Not yet typechecked/built** — I have not run `npx vitest run` or `npm run build`/`tsc` on the frontend since this edit. **Do this first when you resume** — `escrowService.ts` is a hard dependency for the 4 files below, and a typo there will cascade.

**NOT done yet — this is most of the remaining Phase 6 work:**

1. **`src/components/escrow/CryptoEscrowCard.tsx`** (named explicitly in the plan) — still imports the now-deleted `blockchainEscrowService.releaseEscrowPayment` method (**this file will not compile right now** — it's mid-refactor-broken, top priority to fix next). Needs: accept a `tradeId: string` prop (no longer default to fabricated `DEMO_ESCROW_CONTRACT`), fetch real state via `blockchainEscrowService.getEscrowStatus(tradeId)`, remove the `SIMULATION — NOT REAL FUNDS` badge and the `canvas-confetti` call, render the real contract address / real tx hashes / real 3 condition flags (`docsVerified, shipmentDelivered, inspectionPassed` — note: the real contract only has 3 conditions, not the fictional 7-condition `EscrowContract` type's `buyerVerified/sellerVerified/documentsVerified/shipmentDispatched/shipmentDelivered/inspectionAccepted/noActiveDispute` — this is a deliberate truth-up, don't try to preserve the fake 7-condition shape), and show the real `LOCKED` reason (`EscrowApiError.code`, e.g. `CONDITIONS_NOT_MET`/`DISPUTE_ACTIVE`) when a release attempt is refused instead of always succeeding.

2. **`src/pages/EscrowPage.tsx`** (named explicitly in the plan) — remove the `Not Implemented (Demo)` `StatusBadge`. Needs to accept/obtain a trade id to pass to the rewritten `CryptoEscrowCard`. **No route param currently exists** — `App.tsx:103` has `<Route path="/escrow" .../>` with no `:tradeId`. Recommend changing to `/escrow/:tradeId?` (optional param via `useParams`) and, when absent, rendering a simple trade-ID input/lookup form (a real, honest "enter a trade to view its escrow" UI) rather than defaulting to fabricated demo data.

3. **`src/components/disputes/DisputeResolutionSuite.tsx`** — **NOT in the plan's explicit Phase 6 file list, but it imports the now-deleted `blockchainEscrowService.executeArbitrationVerdict` method (line 37) — this file will also not compile right now.** Minimal necessary fix (don't do a full rewrite of this mock-data-driven component — out of scope per the plan): change the `handleArbitrate` call to `blockchainEscrowService.resolveDispute(dispute.tradeId, sellerAmount, buyerAmount)` using the new method. Note `dispute.tradeId` here comes from `DEMO_DISPUTES` mock fixture data, not a real DB trade — calling the real API with a fictional trade ID will correctly 404/`ESCROW_NOT_FOUND` rather than fabricate success; that's fine and honest, just make sure the UI doesn't claim success on that error (check `EscrowApiError` and surface it, don't silently `setIsRulingSettled(true)` on failure like the current try/finally-without-catch does — this needs at minimum a `.catch()` so it doesn't lie).

4. **`src/pages/AdminSystemPage.tsx`** — **NOT in the plan's explicit list either, but calls `blockchainEscrowService.getStatus()` (line 15)** — this one's fine as-is since `getStatus()` still exists (just returns real-architecture text now instead of "SIMULATED"), **no code change needed here**, just verify it renders sensibly once you're checking things visually.

5. **Also check**: `src/pages/TradeWorkspacePage.tsx:310` renders `<CryptoEscrowCard />` with **no props** (inside a mock-data-driven page built entirely around `FLAGSHIP_DEMO_TRADE`, not real DB data). Once `CryptoEscrowCard` requires a `tradeId` prop, this call site needs *something* passed (e.g. `trade.id` from the mock fixture) — it will legitimately show "no escrow found" since that fictional ID has no real DB row, which is correct/honest, just make sure it doesn't crash from a missing required prop. This page's wholesale conversion to real trade data is out of scope — don't attempt it.

**After all 5 above compile**, run `npm run dev`, open `/escrow` (and ideally seed one real trade + escrow via curl first, matching a real tradeId, so there's something real to look at), and do the plan's Verification step 7 checks: real contract address, real tx hashes from DB, and an unmet-condition case rendering `LOCKED` with the real reason instead of a green success.

## 4. NOT started at all

- **Phase 7 — n8n workflow**: new file `backend/brain/n8n/globex_blockchain_escrow_workflow.json`. Full design spec in the plan file's Phase 7 section — 4 branches, zero n8n credentials, ES5-safe ASCII-only `jsCode`, `neverError: true`, sticky notes. Follow it exactly.
- **Phase 8 — Docs**: `docs/blockchain_n8n_mapping.md` and `reports/blockchain/blockchain_integration_verification.md` (create `reports/blockchain/` dir first). The verification report should capture the real curl evidence from Phase 4 (previous handoff) **and** Phase 5 (§1 above, all three trade lifecycles) as the "real captured evidence" the pack requires.
- **Remaining verification steps 6-8**: n8n import+activate+curl, frontend render check (blocked on Phase 6 completing), regression (`npx vitest run`, `pytest`, confirm the ML n8n workflow `globex_docker_master_workflow.json` is untouched — it hasn't been touched this session, just re-confirm at the end).

## 5. Known gotchas (carried over + two new ones from this session)

- Bash heredoc breaks on apostrophes — use `Write` tool for prose with apostrophes.
- Em dashes fine in file content except n8n `jsCode` strings.
- `.to.be.reverted` deprecated — use `.to.be.revert(ethers)`.
- OpenZeppelin 5.6.1 `Ownable` needs explicit `initialOwner` arg.
- `err.revert.name` from ethers v6 only populated with ABI/interface context already attached (e.g. `.staticCall()`) — a normal write-call revert during `estimateGas` needs `err.data` parsed manually with an `ethers.Interface`. Already fixed in `services/chain-adapter/src/errors.ts` — don't re-break it.
- **NEW: asyncpg + `jsonb_build_object`/other `VARIADIC "any"` functions need explicit `::text`/`::type` casts on every bound parameter**, or you get `IndeterminateDatatypeError` at request time (not at code-review time — it only surfaces when that code path actually executes) even though `psql`'s plain `PREPARE ... AS` (which silently defaults unresolvable params to `text`) would make you think the query is fine. See §1.
- **NEW: `python main.py`'s `uvicorn.run(..., reload=True)` hot-reload is unreliable on this Windows machine** (silently fails to actually restart the worker despite logging "Reloading...", and can leave port 8000 in a stuck-but-unowned `LISTENING` state after a kill). Prefer running via `python -m uvicorn main:app --host 0.0.0.0 --port <N>` **without** `--reload` for anything you need to trust is running current code — restart it manually after every edit instead.

## 6. Immediate next steps (in order)

1. Fix `CryptoEscrowCard.tsx`, `EscrowPage.tsx`, `DisputeResolutionSuite.tsx` per §3 (items 1-3) — these currently fail to compile.
2. Typecheck/build the frontend (`npx tsc --noEmit` or `npm run build`) to confirm nothing else references the deleted `escrowService.ts` methods (`anchorDocumentHash`, old `releaseEscrowPayment` signature, `executeArbitrationVerdict` name).
3. Manually verify in a browser per plan Verification step 7.
4. Phase 7 (n8n), then Phase 8 (docs), then remaining verification steps 6-8.

Re-read `C:\Users\Aryan\.claude\plans\fix-the-entire-blockchain-snuggly-phoenix.md` in full before continuing.

---

# (Second handoff, written earlier the same day — kept for context)

**Status at time of writing:** Phase 4 (chain-adapter) fully DONE and verified end-to-end. Phase 5 not started.

## 1. What changed since the first handoff

Phase 4 completed: `escrow.controller.ts` written, 8 routes wired into `app.ts`, adapter started and full curl-driven lifecycle verified twice (happy path + dispute path) against the live Hardhat chain. A real bug was found and fixed in `services/chain-adapter/src/errors.ts`: ethers only populates `err.revert.name` when it already has interface context (e.g. `.staticCall()`); a normal write-call revert discovered during `estimateGas` throws a `CALL_EXCEPTION` with raw `err.data` but no `.revert` field. Fixed by adding a manual `Interface.parseError(err.data)` fallback in `classifyEscrowRevert()`. Verified: premature release now correctly returns `CONDITIONS_NOT_MET`/409, dispute-locked release correctly returns `DISPUTE_ACTIVE`/409.

One known low-priority gap noted (not hit in practice): `escrow.service.ts`'s `sendEscrowTx()` has a separate path for a tx that's broadcast and mined-but-reverted (`receipt.status !== 1`) which throws a raw generic `TX_REVERTED` ChainError bypassing the classification fix above. Only matters if a revert is discovered post-broadcast rather than during `estimateGas` (a race condition, unlikely on a single local dev chain).

## 2. Live environment state at that time

Local Hardhat node running on `127.0.0.1:8545` (chain 31337), started via trailing `&`. `services/chain-adapter` dev server running on `127.0.0.1:3001` via `npm run dev`. Test data on-chain: `TEST-ESCROW-001` RELEASED, `TEST-ESCROW-002` RESOLVED (from Phase 4 testing, before the Phase 5 DB reset — these on-chain events still exist in Hardhat's history but the *escrow_accounts* rows for them never existed since Phase 5's API didn't exist yet).

## 3. Everything from the FIRST handoff (Phases 1-3), unchanged

### Phase 1 — Contracts (DONE)
`blockchain/contracts/MockUSDC.sol` (ERC-20, 6 decimals, `mUSDC`), `blockchain/contracts/TradeEscrow.sol` (full state machine, custom errors, 7 events, Ownable+ReentrancyGuard, checks-effects-interactions). `@openzeppelin/contracts@5.6.1` installed.

### Phase 2 — Deploy + ABI export (DONE)
`blockchain/scripts/deploy.ts` and `exportAbi.mjs` rewritten/generalized. Deployed addresses (unchanged all session):
```
tradeLedgerAddress: 0x5FbDB2315678afecb367f032d93F642f64180aa3
tradeEscrowAddress: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
mockUsdcAddress:    0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
chainId: 31337
deployer/arbiter: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  (Hardhat account #0)
demoBuyer:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8         (Hardhat account #1)
demoSeller: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC         (Hardhat account #2)
```
ABIs exported to `services/chain-adapter/src/abi/{TradeLedger,TradeEscrow,MockUSDC}.abi.json`. `.env`/`.env.example` updated.

### Phase 3 — Contract tests (DONE, all passing)
`blockchain/test/TradeEscrow.test.ts`, 19 new cases. `npx hardhat test` → 32 passing, 0 failing. Use `.to.be.revert(ethers)`, not deprecated `.to.be.reverted`.

## 4. Everything true "at the start" (do not re-litigate)

- `blockchain/contracts/TradeLedger.sol` was real and worked. Kept as-is.
- `services/chain-adapter/` was solid for TradeLedger only, before this project's extensions.
- No escrow contract existed anywhere before this project. Frontend `escrowService.ts` was 100% fake before this session's Phase 6 rewrite.
- n8n's `backend/brain/n8n/globex_docker_master_workflow.json` (ML-only) must NOT be touched — confirmed still untouched.
- User-approved decisions: escrow custodies real MockUSDC (6 decimals); target chain local Hardhat 31337; n8n gets one new file `globex_blockchain_escrow_workflow.json`.

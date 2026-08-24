# GlobeXAI — Blockchain + Escrow + n8n Rewrite — Session Handoff (4th, same day)

**Date:** 2026-08-24 (fourth handoff — continuation of `handoff.md` below the `---`)
**Status:** Phases 1-8 of the plan are now ALL DONE. Frontend truth-up (Phase 6), the n8n
workflow (Phase 7), and both required docs (Phase 8) were completed this session. The n8n
workflow was imported, activated, and live-tested by the user via real webhook calls — real
evidence captured below. One real (environmental, not code) bug was found and diagnosed but
deliberately not fixed live — see §3.

**Full plan:** `C:\Users\Aryan\.claude\plans\fix-the-entire-blockchain-snuggly-phoenix.md`
**Verification report:** `reports/blockchain/blockchain_integration_verification.md` (all 10
required test categories, 9 live-executed, 1 code-verified-only — see that file for detail)
**n8n mapping doc:** `docs/blockchain_n8n_mapping.md`

---

## 1. What changed since `handoff.md`

### Phase 6 — Frontend truth-up — now DONE

- **`src/components/escrow/CryptoEscrowCard.tsx`** — fully rewritten. Now takes a required
  `tradeId: string` prop (no more `DEMO_ESCROW_CONTRACT` default), fetches real state via
  `blockchainEscrowService.getEscrowStatus(tradeId)`, renders the real contract address, the
  real 3-condition struct (`docsVerified`/`shipmentDelivered`/`inspectionPassed` — the old fake
  7-condition `EscrowContract` shape is gone from this component), and shows
  `LOCKED — <EscrowApiError.code>` with the real message when a release attempt is refused. No
  more `SIMULATION` badge, no more `canvas-confetti` fake-release celebration.
- **`src/pages/EscrowPage.tsx`** — route changed to `/escrow/:tradeId?` (`App.tsx:103`). With no
  id, renders an honest trade-ID lookup form instead of defaulting to fabricated demo data. With
  an id, renders `<CryptoEscrowCard tradeId={tradeId} />`. Dropped the `Not Implemented (Demo)`
  badge.
- **`src/components/disputes/DisputeResolutionSuite.tsx`** — `handleArbitrate` now calls
  `blockchainEscrowService.resolveDispute(dispute.tradeId, sellerAmount, buyerAmount)` (the old
  `executeArbitrationVerdict` method no longer exists). Added a `.catch()` with an
  `arbitrateError` state + visible error banner so a failed on-chain ruling no longer silently
  flips `isRulingSettled(true)`.
- **`src/pages/AdminSystemPage.tsx`** — updated to match the new `blockchainEscrowService.getStatus()`
  shape (`network`/`tokenAsset`/`path`/`status`, no more `contractAddress`); dropped the stale
  "Ethereum Sepolia / Arbitrum" label in favor of the real `Local Hardhat (31337)` network string.
- **`src/pages/TradeWorkspacePage.tsx:310`** — `<CryptoEscrowCard />` now passes `tradeId={trade.id}`
  (required prop). Still backed by `FLAGSHIP_DEMO_TRADE` mock data on this page — out of scope to
  convert, exactly as the plan said; it will correctly show "no escrow exists" since that mock
  trade id has no real DB row.
- **Unrelated pre-existing bug fixed opportunistically**: `src/components/landing/SequencedTradeSimulator.tsx`
  had an unclosed `lucide-react` import list (missing `} from "lucide-react";`) that broke
  `tsc --noEmit` for the *entire* project, blocking verification of the escrow changes. Fixed
  with a one-line closure. Nothing to do with blockchain/escrow.
- **Verified**: `npx tsc --noEmit -p tsconfig.app.json` — zero errors on every file touched this
  session. A large number of unrelated pre-existing type errors remain elsewhere in the codebase
  (`MarketIntelligencePage.tsx`, `ShipmentTracker.tsx`, `calendar.tsx`, etc.) — confirmed
  pre-existing, not touched, out of scope.
- **Verified in a real headless-Chromium browser** (Playwright, via the `webapp-testing` skill,
  against the live dev server + live FastAPI + live chain): `/escrow` (no id) renders the lookup
  form; `/escrow/<real funded trade>` renders the real contract address, real `FUNDED` status,
  real per-condition `PENDING`/`SATISFIED` flags; `/escrow/<nonexistent trade>` renders "No
  escrow exists yet for this trade" — no crash, no fabricated data. Screenshots were sent to the
  user this session (not saved to a permanent path — re-run the Playwright script in scratchpad
  history if needed again, or re-derive from the live app).

### Phase 7 — n8n workflow — now DONE

**New file: `backend/brain/n8n/globex_blockchain_escrow_workflow.json`** (32 nodes: 5 sticky
notes + 4 webhook branches). Built programmatically via a Python script (avoids manual
JSON-string-escaping mistakes in embedded jsCode) and mechanically validated before handoff:
`JSON.parse` succeeds, every `connections` target resolves to a real node name, zero
orphan/dead-end nodes, no `webhookId`/path collision with the ML workflow's
`globex-analyze-trade-v2`/`globex-test-trade-v2`, every HTTP node has `neverError: true`, all
`jsCode` is ES5-safe (`var`, no arrow functions, no `const`/`let`, no optional chaining, no
template literals) and pure ASCII (no em-dashes anywhere in the file, checked programmatically).

Four branches, matching the plan exactly:

| Branch | Webhook path | Flow |
|---|---|---|
| A | `globex-escrow-create` | validate → `POST /api/v1/trades/{id}/escrow` → `POST /api/v1/escrow/{id}/fund` → classify → respond |
| B | `globex-doc-anchor` | validate → `POST /api/v1/trades/{id}/anchor` → classify → respond |
| C | `globex-shipment-event` | validate → `POST /escrow/{id}/conditions` → `GET /escrow/{id}` → IF all 3 conditions true AND state==FUNDED → `POST /escrow/{id}/release`; else respond `LOCKED` with the real missing conditions |
| D | `globex-dispute` | validate → `POST /escrow/{id}/dispute` → classify → respond (never connects to any release node) |

Full branch → FastAPI route → DB table → contract method mapping is in
`docs/blockchain_n8n_mapping.md`.

**The user imported and activated this workflow themselves** in their own n8n instance at
`http://localhost:5678` (they explicitly asked to configure n8n manually rather than have this
session do it — respected that). They then asked this session to drive it live via real webhook
curl calls, which produced the real evidence in §3 below and in the verification report.

### Phase 8 — Docs — now DONE

- **`docs/blockchain_n8n_mapping.md`** — created. Branch-by-branch table (webhook path → FastAPI
  route → DB table/column → contract method), plus the "no business rules in n8n" design
  rationale for Branch C's IF node.
- **`reports/blockchain/blockchain_integration_verification.md`** — created. Real evidence for
  all 10 required test categories from `03_BLOCKCHAIN_IMPLEMENTATION.md:150-165` (escrow
  creation, tx confirmation, tx failure, doc anchoring, release/hold, dispute lock, wrong
  network, missing config, frontend sync, n8n integration). 9 of 10 are live-executed with real
  tx hashes/curl output; **wrong network (#7) is code-verified only** (cited the exact guard —
  `chainHealth.service.ts:135-144` — but not live-executed, to avoid restarting the shared
  chain-adapter process while the user was actively using it through n8n).

## 2. Live environment state RIGHT NOW

All of the following were confirmed responding at the end of this session:

- **Hardhat**: `http://127.0.0.1:8545`, chain 31337. Same process as prior sessions, untouched.
- **`services/chain-adapter`**: `http://127.0.0.1:3001`, healthy. Same process, untouched.
- **Local Supabase (Docker)**: was down at the start of this session (Docker Desktop wasn't
  running) — restarted via `"/c/Program Files/Docker/Docker/Docker Desktop.exe"`, containers
  came back up automatically (`supabase_db_GlobeX` etc, restart policy). **Not reset this
  session** — all data from prior sessions plus this session's new test trades/escrows is intact.
  Note: `supabase_vector_GlobeX` was seen `Restarting` at last check — a logging sidecar
  (Logflare's vector collector), not load-bearing for the DB/API path; worth a glance if you see
  odd log gaps, not worth chasing otherwise.
- **FastAPI**: `http://127.0.0.1:8000`. **This is the same long-running, PID-1276,
  doesn't-resolve-via-`Get-Process`/`Get-CimInstance`/`tasklist`/`taskkill` "ghost" process from
  the prior session's handoff.** It answers most requests correctly (all of Branch A and most of
  Branch C's live n8n calls worked perfectly against it), but **was caught serving stale
  in-memory code for at least one code path** this session — see §3. **Recommend a clean restart
  next time you're not mid-test**: try `taskkill //F //PID 1276` first (it will likely still say
  "not found" — that's expected, matches the ghost-process symptom), then just start a fresh
  `uvicorn main:app --host 0.0.0.0 --port 8000` (or `--port 8001` if 8000 stays stuck — update
  `VITE_FASTAPI_AI_URL` and the n8n workflow's `host.docker.internal:8000` URLs to match if you
  do land on a different port).
- **n8n**: `http://localhost:5678`, docker-compose stack at `C:\Users\Aryan\Downloads\n8n`
  (`compose.yml`) — was stopped at the start of this session (containers existed but were
  `Exited`), brought up via `docker compose up -d` from that directory. The new escrow workflow
  is imported and **activated** in it (user did this manually).
- **Vite dev server**: `http://localhost:5173`, started this session via `npm run dev` in
  `GlobeX-New/`, logging to `/tmp/vite_dev.log`. Still running.
- **New test data this session** (in addition to the three escrows from the prior session — see
  `handoff.md` §1 — which are also still in the DB since it wasn't reset):
  - Trade `64a92f6e-b970-4b9b-a9b7-f0e70608a28c` — created+funded via direct curl (not n8n), used
    for the Playwright browser verification screenshots.
  - Trade `66bfa2a9-d599-45e3-9b47-2b665481ac79` — created+funded+released **entirely through the
    live n8n webhook** (Branch A then Branch C x3). Real tx hashes in §3.
  - Trade `ce3b0abe-fdb9-4081-a75e-009ee5ee98a1` — created+funded+disputed entirely through n8n
    (Branch A then Branch D). Confirmed `DISPUTED` with `drift: false` after the stale-server
    hiccup (§3) — no state corruption occurred.

## 3. Real bug found this session (environmental — read before touching FastAPI process management again)

**Symptom:** calling Branch C (`POST /webhook/globex-shipment-event`, which internally calls
`POST /api/v1/escrow/{id}/conditions`) against the *disputed* test trade above returned an
n8n-level `LOCKED` response with `reason: CONDITIONS_NOT_MET` — directionally correct (release
correctly did not fire) but for the wrong stated reason. Digging in:

- A direct curl straight to FastAPI for the same call returned a raw, unstructured
  `500 Internal Server Error` (`text/plain`), not the expected structured `409 DISPUTE_ACTIVE`.
- A direct curl straight to `chain-adapter:3001` (bypassing FastAPI) for the equivalent call
  returned the **correct** structured `409 {"code":"DISPUTE_ACTIVE", ...}`.
- Reproducing the exact FastAPI call **in-process**, against the code currently on disk
  (`.venv/Scripts/python.exe` importing `src.api.escrow_api.set_escrow_condition` directly, with
  `src.db.client.init_pool()` called manually first the way `main.py`'s startup does): it handles
  this correctly and raises `HTTPException(409, {"code": "DISPUTE_ACTIVE", ...})` with **no
  crash**. The code on disk is correct.

**Conclusion:** the live FastAPI process (PID 1276, the same one from the prior session's
"stuck/orphaned socket, doesn't resolve via any process tool" finding) is serving **stale
in-memory code**, not what's currently on disk. This is the same broken-`reload=True` root cause
documented previously, resurfacing in a new way — the process didn't just fail to restart on an
edit, it's apparently been running long enough (or through enough edits) that at least one code
path it serves no longer matches the file on disk.

**No data was corrupted.** `GET /api/v1/escrow/{id}` immediately after confirmed the escrow
stayed cleanly `DISPUTED`, `drift: false` — the chain-adapter's real state guard held even though
FastAPI's error surfacing was broken for that one call.

**Secondary, minor finding from the same incident:** the n8n workflow's classifier nodes
(`isError()` helper in `Code - Check Release Conditions` and the other `Code - Classify ...`
nodes) only recognize JSON error bodies shaped `{detail: ...}` or `{error: ...}`. They did not
recognize the plain-text 500 above as an error — the branch's output was still correct here only
because a second, independent check (`state_label !== 'FUNDED'`) also blocked release. Worth
hardening `isError()` to treat any non-2xx HTTP status as an error regardless of body shape if
you touch this workflow again, but it never caused a wrong action, only an imprecise `reason`
field — not urgent.

**Action needed, not done this session (deliberately):** restart the FastAPI process cleanly.
Was not done because the user was actively driving live tests through n8n against this exact
server when the bug was found, and restarting mid-test would have disrupted that. Do this before
trusting any edge-case behavior on port 8000 again — the happy paths (Branch A create+fund,
Branch C's full 3-condition-then-release sequence) all worked correctly against the same stale
process, so this is not "the server is broken," just "don't fully trust it without a restart
after this many hours/edits."

## 4. Known gotchas (carried over + one new one)

- Bash heredoc breaks on apostrophes — use `Write` tool for prose with apostrophes.
- Em dashes fine in file content except n8n `jsCode` strings (and, this session showed, worth
  avoiding in the whole n8n JSON file — validated ASCII-only end to end).
- `.to.be.reverted` deprecated — use `.to.be.revert(ethers)`.
- OpenZeppelin 5.6.1 `Ownable` needs explicit `initialOwner` arg.
- asyncpg + `jsonb_build_object`/other `VARIADIC "any"` functions need explicit `::text`/`::type`
  casts on every bound parameter, or `IndeterminateDatatypeError` at request time. Already fixed
  everywhere it currently matters (`_mark_record_failed`/`_mark_record_confirmed` in
  `escrow_api.py`) — don't re-break it.
- **`python main.py`'s `uvicorn.run(..., reload=True)` hot-reload is unreliable on this Windows
  machine, and — new finding this session — a long-running instance of it can end up serving
  stale in-memory code for specific paths without any visible symptom until you hit that exact
  path.** Prefer running via `python -m uvicorn main:app --host 0.0.0.0 --port <N>` **without**
  `--reload`, and **restart it periodically / after significant edits**, not just when you
  believe you edited something it touches.
- Docker Desktop is not running by default at the start of a fresh session on this machine —
  check for it before assuming Supabase or n8n's Docker stack is reachable.
- The n8n stack for this project lives at `C:\Users\Aryan\Downloads\n8n` (docker-compose), not
  inside the GlobeX-New repo — `docker compose up -d` from that directory if it's stopped.

## 5. What's left

- **Restart FastAPI cleanly** (see §3) before trusting edge cases against port 8000 again.
- **Full regression pass**: `npx vitest run` and `pytest` were **not** re-run this session — the
  plan's Verification step 8 is not yet closed. Do this next.
- **Wrong-network test (verification category #7)**: code-verified only, not live-executed —
  optional to close out by temporarily pointing `services/chain-adapter` at a mismatched
  `BLOCKCHAIN_CHAIN_ID` and confirming the `409` guard fires, then reverting.
- **Optional n8n hardening**: broaden `isError()` in the workflow's classifier Code nodes to
  treat any non-2xx status as a failure, not just JSON bodies shaped `{detail}`/`{error}` (see
  §3). Not urgent — never caused a wrong action.
- Everything else in the original plan (`fix-the-entire-blockchain-snuggly-phoenix.md`) is done:
  Phases 1-8 all complete, Verification steps 1-7 all done (step 5's deliberate
  adapter-mid-flight-crash sub-test still not literally executed — low priority, noted in
  `handoff.md` as structurally equivalent to the FAILED-path tests that are done).

---

# Everything above `handoff.md`'s own `---` (Phases 1-5, first two same-day handoffs) — unchanged, not reproduced here again. Read `handoff.md` in full for that history if needed; this file only adds what changed after it.

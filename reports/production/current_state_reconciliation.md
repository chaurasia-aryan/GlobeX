# Current State Reconciliation

**Date:** 2026-08-23
**Repo:** `D:\Codes\SIH26\GlobeX-New` — `https://github.com/Sanya06C/GlobeX-New.git`
**Method:** every claim below comes from a command actually run or a file actually read during this pass. Where something could not be verified, it is marked as unverified rather than filled in. Nothing in this document is inferred from what "should" be true.

**Relationship to other tracking documents:** `docs/tasks.md` is the live phase checklist and is tracked separately — this document references it and does not duplicate or fork it. `docs/integration_recovery_log.md` holds the change-by-change history. This document is the point-in-time reconciliation between what the docs claim and what the repository actually contains.

---

## 1. Git state (fresh check, this pass)

```
branch:  dataset  ->  origin/dataset
HEAD:    e147087  chore: migrate large CSVs to Git LFS
origin/dataset:   e147087  (identical — nothing new pushed by anyone)
```

**Working tree — 11 modified, 14 untracked:**

| Modified | Untracked |
|---|---|
| `.gitignore` | `.agents/`, `.claude/`, `.mcp.json` |
| `backend/brain/n8n/globex_trade_automation.workflow.json` | `Claude_Blockchain_Design_Integration_Pack/` |
| `backend/database/supabase/migrations/20260822182000_seed_globex_demo_data.sql` | `backend/brain/compliance_data/sanctions_entities/` |
| `docs/integration_recovery_log.md`, `docs/tasks.md` | `backend/storage/`, `blockchain/`, `services/` |
| `main.py`, `package-lock.json`, `requirements.txt` | `reports/production/new_computer_takeover.md` |
| `src/api/marketplace_api.py` | `reports/production/skills_aware_final_audit.md` |
| `src/services/api/aiService.ts` | `reports/tooling/skills_inventory.md` |
| `src/test/coreFlowAndAuth.test.tsx` | `skills-lock.json`, `src/api/trades_api.py`, `src/db/`, `src/services/chain_client.py` |

Every session fix from this session is still uncommitted and local-only. Nothing has been pushed.

### 1a. FINDING — the branch divergence is much worse than "dataset is ahead"

```
git rev-list --left-right --count origin/dataset...origin/main
  14   2          (dataset ahead 14, main ahead 2)
merge-base: 43dd0e9  "Added Wishlist"
git diff --name-only origin/dataset...origin/main | wc -l
  357 files
```

The two commits `main` has that `dataset` does not are:

| Commit | Author | Date | Subject |
|---|---|---|---|
| `4033f3c` | Varun2976 | 2026-08-23 16:32 IST | **Created frontend folder and moved files into it** |
| `0a9c6c2` | Varun2976 | 2026-08-23 14:45 IST | Added Super Admin login section |

`4033f3c` is a whole-tree relocation: on `main` the entire frontend now lives under `frontend/` (`frontend/src/…` — 222 files, plus `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig*.json`, `frontend/tailwind.config.ts`, `frontend/docs/`, `frontend/globe/`). On `dataset` it is still at `src/`. Git will not auto-resolve a rename of 222 files against 14 commits of unrelated edits to those same files with any confidence.

**This is the single highest-risk item in the repository right now.** Every fix made this session (`src/api/marketplace_api.py`, `src/services/api/aiService.ts`, `src/test/coreFlowAndAuth.test.tsx`) touches paths that no longer exist on `main`. A naive `merge main` will produce hundreds of add/add and rename/modify conflicts. This must be resolved by a human decision on directory layout **before** any further frontend work lands on either branch.

### 1b. FINDING — this is a six-person team, not a two-person team

The task framing assumed two developers (the current user and `Sanya06C`). `git shortlog -sne --all` says otherwise:

| Commits | Author |
|---|---|
| 26 | `chaurasia-aryan <chaurasiaaryan1980@gmail.com>` (current user) |
| 6 | `Varun2976 <vsnair2976@gmail.com>` |
| 5 | `SiyaAgrawal95 <siyaagrawal9506@gmail.com>` |
| 2 | `Sanya Chavan <sanyachavan06@gmail.com>` (repo owner) |
| 1 | `MihirPetkar108 <mihirpetkar2006@gmail.com>` |
| 1 | `Pooja <pooja9b09@gmail.com>` |

Recent work by other people, already in the repo and **not** authored by the current user:

- `a019f6d` SiyaAgrawal95 — "Documents"
- `b3ab27c` Pooja — "feat: add verification audit fields to organizations and verification_reviews" (**a schema change**)
- `72e860a` SiyaAgrawal95 — "chore(database): add GLOBEX demo seed data"
- `4033f3c` / `0a9c6c2` / `43dd0e9` Varun2976 — frontend restructure, Super Admin, Wishlist

Two remote tags exist that were not present locally before this pass's `fetch`: `backup` and `maaaafi`.

Consequence: the two-way work split requested in `docs/collaboration/work_split.md` is written as requested, but it is explicitly flagged there as **modelling the wrong team size**. `MihirPetkar108` is also the owner of the `StoreonChain` upstream the blockchain layer was vendored from — that is a same-team dependency, not a third-party one.

---

## 2. Parallel Claude Code session — what was actually found

**The reported path `D:\SIH26` does not exist.** `ls "D:/"` shows no `SIH26` entry at the drive root. The real location is `D:\Codes\SIH26` — the parent of this repo — which contains:

```
D:\Codes\SIH26\
  .claude\settings.local.json      (created 18:26 today)
  GlobeX-New\                      (this repo)
  StoreonChain\                    (separate clone — github.com/mihirPetkar108/StoreonChain, HEAD d9b3156)
```

Claude Code session storage confirms it: `~/.claude/projects/` contains exactly one project directory, `D--Codes-SIH26`, holding two large live transcripts — `6a68eee2…jsonl` (6.0 MB, last written 23:26) and `78ed070a…jsonl` (0.99 MB, last written 23:19). Both sessions are keyed to `D:\Codes\SIH26`, i.e. **the parallel session is operating on the same working tree as this one, not a separate clone.**

**Implication, and it is the important one:** there is no isolation. Both sessions share one filesystem, one `.git`, one uncommitted working tree, and one set of running services. The `git status` in §1 is a *shared* status — some of those 25 entries may be the other session's work in progress, not this session's. Concurrent edits to the same file will silently overwrite each other with no merge and no warning.

The parallel session's `.claude/settings.local.json` at the parent level grants only `Bash(git clone *)` and one `grep` pattern — consistent with a session whose recent work was cloning `StoreonChain`.

**Not determined (and deliberately not guessed):** which of the two transcripts belongs to which session, and what the other session is currently mid-way through. Reading another session's transcript to find out was judged out of scope. Coordination on this needs to be human-to-human.

---

## 3. Running local infrastructure (verified, not assumed)

`docker ps` and `netstat -ano`:

| Service | Port | Status |
|---|---|---|
| Supabase Postgres (`supabase_db_GlobeX`) | 54322 | Up 4 hours, healthy |
| Supabase Kong / API | 54321 | Up 4 hours, healthy |
| Supabase Studio | 54323 | Up 4 hours, healthy |
| n8n (`n8n-n8n-1`) | 5678 | Up 3 hours |
| n8n sandbox runner / searxng | — | Up 11 hours |
| FastAPI backend | 127.0.0.1:8000 | LISTENING (PID 18916) |
| Chain adapter | 127.0.0.1:3001 | LISTENING (PID 14388) |
| Hardhat local node | 127.0.0.1:8545 | LISTENING (PID 21812) |
| **Vite dev server** | **0.0.0.0:5173** | **LISTENING (PID 19532)** |

Two notes worth flagging:

1. **The chain-adapter and Hardhat node are still running** despite the blockchain track being paused. "Paused" means `BLOCKCHAIN_ANCHORING_ENABLED=false` in `.env` (verified), not that the processes were stopped. They are consuming a port and holding local state.
2. **A Vite dev server on 5173 is running and was not started by this session** — almost certainly the parallel session. Consistent with §2: shared machine, shared tree.
3. `supabase_vector_GlobeX` is in a `Restarting (0)` crash loop. Not blocking (it is the log collector), but it is not healthy and should not be reported as such.

---

## 4. HUMAN ACTION REQUIRED — blockers this pass could not and did not work around

Per the policy that a task only a human can complete must be reported, never simulated:

### 4a. BLOCKER — `gh` CLI is installed but not authenticated

```
gh version 2.98.0 (2026-08-20)          [C:\Program Files\GitHub CLI\gh.exe]
$ gh auth status
  You are not logged into any GitHub hosts. To log in, run: gh auth login
$ gh repo view    -> "To get started with GitHub CLI, please run: gh auth login"
$ gh issue list   -> same
```

Secondary detail: `gh.exe` is **not on `PATH` in this shell**. It resolves only by full path (`"C:\Program Files\GitHub CLI\gh.exe"`). A new terminal after installation would normally pick it up; this shell predates the install.

**Consequence:** the GitHub issue audit could not be performed. **No issue list, issue count, label taxonomy, milestone, or assignee data appears anywhere in these three documents, because none was obtainable.** The work split in `docs/collaboration/work_split.md` is therefore explicitly provisional — it is derived from repository structure and merge-conflict topology, which are real and were measured, not from issue data, which was unavailable.

**Action required of a human:** run `gh auth login` interactively (browser or token flow), then re-run `gh issue list --state open --limit 100`. This cannot be automated — it requires a browser session or a personal access token that only the account holder can produce.

### 4b. BLOCKER — branch layout decision (`src/` vs `frontend/src/`)

See §1a. `main` and `dataset` disagree about where the frontend lives, across 357 files. No automated merge strategy is trustworthy here. A human must decide which layout wins and communicate it to the whole team before the next frontend commit.

### 4c. BLOCKER — two Claude Code sessions on one working tree

See §2. Requires a human to either stop one session, or move one to a separate clone/worktree. Not resolvable from inside a session.

### 4d. Known unresolved — n8n workflow activation

Documented honestly in `docs/tasks.md` Phase 4. An n8n instance-internals `webhook_entity` collision; a workaround was given, root cause is specific to this n8n build. Not fixed, not claimed fixed.

---

## 5. Phase checkpoint status — and a naming collision worth knowing about

**There are two different "Phase 7"s in this project, and they mean different things.**

| | Definition | Status |
|---|---|---|
| **Production Pack Phase 7** | `reports/production/phase7_current_facts.md` — current-facts corpus (tariff/compliance fact records with a JSON Schema, source registry, real fetch timestamps) | **Delivered.** Header reads `Status: delivered`. Evidence in-file. Phases 0–7 of this track all have real evidence artifacts in `reports/production/`. |
| **`docs/tasks.md` Phase 7** | "Security" — secrets scan, authorization, CORS, external request validation | **Not started.** 0 of 8 items checked. |

Citing "Phase 7 complete" without saying which is ambiguous to the point of being misleading. The production-pack phase 7 is done; the security phase 7 has not begun.

`docs/tasks.md` overall: **74 checked / 80 unchecked.** Phases 0–5 substantially progressed with per-item evidence notes; Phases 6 (Trade Lifecycle), 7 (Security), 8 (E2E Test), 9 (Verification), 10 (Documentation) and the Final Gate are entirely unchecked.

Existing evidence artifacts, all real, none re-derived this pass:

```
reports/production/repository_audit.md              (33 KB)
reports/production/phase2_notebook_baseline_policy.md
reports/production/phase3_data_model_audit.md       (58 KB)
reports/production/phase4_forecasting_verdict.md    (25 KB)
reports/production/phase5_anomaly_verdict.md        (18 KB)
reports/production/phase6_risk_verdict.md           (21 KB)
reports/production/phase7_current_facts.md          (27 KB)
reports/production/skills_aware_final_audit.md
reports/tooling/skills_inventory.md
```

---

## 6. Marketplace and frontend hardcoded-data audit

Method: enumerated every `src/pages/*.tsx`, counted mock-module imports against live-API call sites, then read each candidate's data path.

### 6a. Honestly labeled demo data — acceptable, no action

`src/data/mockTradeData.ts` (46 KB) is correctly named and its exports are correctly prefixed: `DEMO_LISTINGS`, `DEMO_TRADE_DOCUMENTS`, `DEMO_ESCROW_CONTRACT`, `DEMO_DISPUTES`, `DEMO_SHIPMENT_EVENT`, `DEMO_AUDIT_LOGS`, `FLAGSHIP_DEMO_TRADE`, `TOP_10_TRUSTED_PARTNERS`, `TOP_BUYERS_DATA`, `MARKET_OPPORTUNITY_COUNTRIES`. 19 modules import from it. The naming makes the demo status legible at every call site. This is the correct pattern and is not a finding.

### 6b. NEW FINDING — unlabeled hardcoded arrays presented as live user data

Three pages hold production-looking data in local `const` arrays with **no** `DEMO_`/`MOCK_` prefix, **no** mock-module import, and **zero** network calls:

| File | Symbol | What it pretends to be |
|---|---|---|
| `src/pages/MyListingsPage.tsx:39` | `INITIAL_ORG_PRODUCTS: OrganizationExportProduct[]` | *This organisation's own* export catalogue |
| `src/pages/TradeIntentWizardPage.tsx:43` | `INBOUND_REQUESTS_DATA: InboundTradeRequest[]` | Inbound RFQs addressed to this org |
| `src/pages/WishlistPage.tsx:24` | `INITIAL_ITEMS` | The user's saved/watchlisted items |

Each is loaded straight into component state (`useState<T[]>(INITIAL_…)`) and never refreshed from a server. The naming (`INITIAL_`, `_DATA`) reads like a seed for real data, not a stand-in for it.

`TradeIntentWizardPage` is the more serious of the three: it backs `/trade-requests`, **step 3 of the canonical six-step trade lifecycle**. The lifecycle step a user would consider the heart of the product is a static array.

### 6c. NEW FINDING — `CreateListingPage` reports success for work it did not do

`src/pages/CreateListingPage.tsx:62-105`. `handleSubmit` validates, builds a `Listing`, then:

```js
addListing(newListing);
toast.success("Product listing published successfully!");
navigate("/marketplace");
```

`addListing` is `WorkspaceContext.handleAddListing`, which writes to `localStorage["globex_listings"]` (`src/context/WorkspaceContext.tsx:44-52`). There is **no HTTP call anywhere in the file** — nothing reaches `public.listings`, and no other user or device will ever see the listing. "Published" is false.

Same handler hardcodes trust and risk metrics for every listing ever created:

```js
trustScore: 95,
riskScore: 12,
aiMatchScore: 94,
isTopTrusted: true,
```

Every new listing is born maximally trustworthy and flagged "top trusted", with no computation behind any of it. On a trade-compliance platform, a fabricated trust score is materially worse than a fabricated product name. This is the same class of defect as the three n8n fake-success bugs and the `7420` marketplace count already fixed this session — it was simply in a file those passes did not reach.

### 6d. NEW FINDING — four pages advertise live capabilities that do not exist

This is systematic, not a one-off. Four page headers render a hardcoded, unconditional `StatusBadge` asserting a live capability, with nothing behind it:

| Route | File | Badge, verbatim | Reality |
|---|---|---|---|
| `/escrow` | `EscrowPage.tsx:14` | `status="verified"` · **"USDC Smart Vault Active"** | No escrow exists in `TradeLedger.sol` at all |
| `/documents` | `DocumentVerificationPage.tsx:14` | `status="verified"` · **"On-Chain Hash Anchoring Active"** | `BLOCKCHAIN_ANCHORING_ENABLED=false`; API returns `501 ANCHORING_DISABLED` |
| `/blockchain` | `BlockchainLedgerPage.tsx:14` | `status="verified"` · **"Ethereum Sepolia Live"** | Nothing has ever touched Sepolia — local Hardhat only |
| `/shipments` | `ShipmentsPage.tsx:14` | `status="in_transit"` · **"AIS Live Satellite Connected"** | No AIS integration exists anywhere in the repo |

The `/escrow` case is the most severe. Its header renders:

```jsx
title="Programmable Smart Escrow"
subtitle="Multi-sig EVM smart contracts enforce conditional payment releases
          upon document verification and GPS port geofence entry."
badge={<StatusBadge status="verified" label="USDC Smart Vault Active" />}
```

Reconciled against verified fact (§9): `TradeLedger.sol` contains **no `payable`, no `msg.value`, no deposit/release/refund**. There is no multi-sig, no USDC, no geofence, and no vault. A green "verified / Active" badge asserts all four are live.

`/blockchain`'s subtitle compounds it by claiming "escrow locks" are among the anchored artifacts — anchoring a thing that does not exist.

**Why this matters beyond cosmetics:** this is the same anti-pattern already fixed this session in the n8n workflow, `marketplace_api.py`, and `aiService.ts` — *asserting success independently of whether anything succeeded*. The data layer was made honest; the presentation layer still contradicts it. `src/api/trades_api.py:262` correctly returns `501 ANCHORING_DISABLED`, while the page above it displays "On-Chain Hash Anchoring Active". Cheap to fix, and the only defect class here that actively misleads a demo audience.

### 6e. FINDING — hardcoded demo trade ID wired into primary navigation

`src/components/layout/CoreFlowSidebar.tsx:29` — the "Active Trades" lifecycle step:

```js
href: "/trades/TRD-IND-UAE-550K",
```

Every user, in every session, navigating the fourth step of the core lifecycle lands on one specific hardcoded demo trade. There is no per-user resolution and no `/trades` index route to fall back to (see `docs/product/user_flow.md` §Gaps).

### 6f. Small in-memory demo pools — already addressed

`_CANDIDATE_BUYERS` / `TOP_BUYERS_DATA` in `src/api/marketplace_api.py` and `src/services/api/aiService.ts` now carry honest `data_source` / `dataSource` labelling from this session's fixes. Not re-opened.

---

## 7. Database audit

### 7a. FINDING — zero row-level security across the entire schema

```
$ grep -rni "row level security|enable row level|create policy" \
    backend/database/supabase/migrations/*.sql
(no matches)
```

**22 tables, 0 RLS policies, 0 `enable row level security` statements.** The schema is unambiguously multi-tenant — `public.organizations`, `public.organization_members`, and `organization_id` foreign keys throughout `listings`, `trades`, `trade_documents`, `trade_offers`, `disputes`, `shipments`. Tenant isolation currently exists **only** in whatever filtering the application layer remembers to apply. Any direct PostgREST/Supabase-client access, or one missing `where organization_id = $1`, exposes every organisation's trade data to every other organisation.

For a trade-compliance platform holding counterparty risk scores, invoices, and dispute records, this is the most serious database finding. It is a build-out task, not a bug fix — no policy has ever existed to regress.

Tables, from `20260822111809_initial_globex_schema.sql` and `20260823000000_n8n_integration_tables.sql`:

```
users, organizations, organization_members, member_invitations,
audit_log, notifications,
verification_documents, verification_reviews,
listings, trades, trade_documents, trade_offers, trust_scores,
shipments, delivery_confirmations, disputes,
blockchain_records, escrow_accounts,
trade_analysis, shipment_events, trade_data_ingestion_log
```

### 7b. Migration archaeology — `escrow_accounts` / `blockchain_records` created, dropped, recreated

- `20260822111809` creates both (lines 427, 442).
- `20260822120632_remove_blockchain_and_escrow.sql` — the entire migration is two lines: `DROP TABLE IF EXISTS public.blockchain_records; DROP TABLE IF EXISTS public.escrow_accounts;`
- `20260823000000_n8n_integration_tables.sql` recreates both (lines 74, 115), with `if not exists`.

The net effect is that they exist, but with the *second* definition. Anyone reading only the initial schema will have the wrong column set. Worth a schema-consolidation pass before more tables land.

### 7c. SQL injection — clean, verified

```
$ grep -rn "f\".*SELECT|f'.*SELECT|f\".*INSERT|.format(.*SELECT|% .*SELECT" \
    src/ backend/ --include=*.py
(no matches)
$ grep -rn "SELECT|INSERT INTO|UPDATE " --include=*.py src/ backend/ | grep '"+|'"'"'+|format('
(no matches)
```

All 18 query sites in `src/api/trades_api.py` use asyncpg positional parameters (`$1`, `$2`). Example: `await conn.fetchrow("select * from public.trades where id = $1", uuid.UUID(trade_id))` — parameterised *and* the id is coerced through `uuid.UUID()` before it reaches the driver, so a non-UUID fails fast. **No injection risk found. No false positives to disambiguate — there were no hits at all.**

### 7d. Connection pooling — present and conservatively configured

`src/db/client.py`:

```python
dsn = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
_pool = await asyncpg.create_pool(dsn, min_size=1, max_size=5,
                                  command_timeout=10, timeout=5)
```

Correct behaviour on absent config: logs a warning and lets endpoints return `503` rather than crashing at import or pretending to succeed. `max_size=5` is fine for local/demo and will need raising for load.

### 7e. FINDING — CORS is wildcard-with-credentials

`main.py:128-131`:

```python
allow_origins=["*"],          # "Permissive for local dev + containerized n8n"
allow_credentials=True,
allow_methods=["*"],
```

`allow_origins=["*"]` together with `allow_credentials=True` is an invalid combination — browsers reject the wildcard on credentialed requests, so this does not work as intended *and* signals intent to accept credentialed requests from any origin. Must not ship. This is `docs/tasks.md` Phase 7 item "Verify CORS", still unchecked.

### 7f. Secrets — clean

`.env` is gitignored (`.gitignore:30`) and untracked (`git ls-files --error-unmatch .env` → not known to git). No secret leak into version control found.

---

## 8. n8n boundary status

`backend/brain/n8n/globex_trade_automation.workflow.json` — 24 nodes:

| Count | Type |
|---|---|
| 9 | `httpRequest` |
| 5 | `webhook` |
| 4 | `code` |
| 4 | `respondToWebhook` |
| 1 | `set` |
| 1 | `stickyNote` |

**Boundary largely holds.** All 9 HTTP nodes call real backend endpoints with explicitly constructed bodies — no raw `$json` passthrough:

```
/predict/hs-code                       /compliance/rag-analyze
/predict/market-opportunity            /documents/ocr-extract
/api/trade-anomaly/predict             /compliance/rag-analyze  (doc check)
/predict/counterparty-match            /api/v1/marketplace/match-buyers
/predict/counterparty-risk
```

The three fake-success fixes from this session are present and correct in the file — verified by reading the node source, not by trusting the changelog. `Synthesize All Models` now accumulates a `missing[]` array and refuses to compute a composite unless every dimension is real. `Synthesize Doc Verdict` gates on `ocrIsLive` and never claims `VERIFIED` for a stub OCR response. `Initiate Escrow Vault` no longer fabricates a `0x`+`Math.random()` address and carries an explicit comment recording the bug.

**Residual boundary violation — business logic still living in n8n.** Two rules are encoded in `code` nodes rather than in the backend:

- `Synthesize Doc Verdict`: `complianceScore < 70` → `REVIEW_REQUIRED`. A compliance threshold — a policy decision — in a workflow JSON, unversioned against the backend, untested by any suite.
- `Synthesize All Models` (123 lines): composite-score weighting across six model dimensions.

Both should migrate into the FastAPI layer where they can be unit-tested and reviewed. Not a fake-success defect; a maintainability and auditability one.

**`n8n/workflows/` does not exist.** The new required save location is absent — `find . -name "*.workflow.json"` returns only `backend/brain/n8n/globex_trade_automation.workflow.json` and `backend/brain/n8n/dump/globex_master_automation.workflow.json`. Noted as a to-create location for the next phase; deliberately not created in this pass.

**Cross-reference:** three of the nine HTTP nodes call endpoints backed by models that are retired (§9) — `/predict/market-opportunity`, `/api/trade-anomaly/predict`, `/predict/counterparty-risk`. The workflow's honest-`missing[]` handling means it degrades correctly rather than fabricating, but three of six composite dimensions currently cannot be satisfied.

---

## 9. Blockchain / StoreOnChain status — paused, real, not broken

**On hold by explicit user instruction.** Not resumed in this pass. Recorded status only.

What is real and verified:

- `blockchain/` — `TradeLedger.sol` vendored from `github.com/mihirPetkar108/StoreonChain`. **Confirmed fact, not re-derived: the contract has no financial escrow.** No `payable`, no `msg.value`, no deposit/release/refund. It is a document-hash-anchoring and reputation ledger, nothing more.
- `services/chain-adapter/` — Node/ethers adapter. Real local Hardhat deployment. 13/13 contract tests passing.
- A real on-chain transaction was executed and the anchored `invoiceHash` independently re-verified against a SHA-256 of the original file bytes — exact match.
- `src/api/trades_api.py`, `src/db/client.py`, `src/services/chain_client.py` — FastAPI persistence layer, verified against a real local Supabase instance with `psql` cross-checks.
- `.env`: `BLOCKCHAIN_ANCHORING_ENABLED=false`, `CHAIN_ADAPTER_URL=http://127.0.0.1:3001`. `src/api/trades_api.py:262` returns a clean `501 ANCHORING_DISABLED` when off — a correct, honest disabled state.

**Reconciliation gap:** the backend is honest about escrow not existing; the frontend is not. See §6d — `/escrow` claims a live "USDC Smart Vault". The `StoreonChain` clone at `D:\Codes\SIH26\StoreonChain` (HEAD `d9b3156`) is a separate checkout belonging to a teammate's account, not a fork.

---

## 10. ML model status — retired, evidenced, settled

Settled state from prior real held-out validation. **Not re-derived, not re-audited, not retrained.** All three retired:

| Model | Reason (evidence in `reports/production/`) |
|---|---|
| Forecast GRU | Underperforms a moving-average baseline on held-out data — `phase4_forecasting_verdict.md` |
| Anomaly XGBoost | Its label is a closed-form function of its own input features. Circular, not predictive — `phase5_anomaly_verdict.md` |
| Trade-risk ensemble | Checkpoint-provenance mismatch, plus a bug where an unrecognised org ID returns a fully fabricated profile — `phase6_risk_verdict.md` |

Per the project's own rule, a broken model is not forced into production. Future model work has permission to replace these; doing so is out of scope here.

---

## 11. Skills status — installed vs. actually activated

Per `reports/tooling/skills_inventory.md` and `reports/production/skills_aware_final_audit.md`. Curated install, not blanket — the policy holds.

**Activated (used for real output this session): 3** — `caveman`, `systematic-debugging` (in substance, during the n8n `webhook_entity` investigation), `verification-before-completion` (in substance — every fix live-tested before being marked done).

**Installed but never activated: 14+** — `frontend-design`, `web-design-guidelines`, `vercel-composition-patterns`, `extract-design-system`, `impeccable`, `fastapi`, `api-design-principles`, `webapp-testing`, `playwright-best-practices`, `security`, `performance`, `finishing-a-development-branch`, `defense-in-depth-validation`, Taste and Supabase skills. No matching task has been run.

Two real corrections to the pack's own citations were found and recorded: `impeccable` ships one skill, not the separate `polish`/`critique` the pack names; and the pack's cited `BehiSecc/awesome-claude-skills` source contains **no installable skills at all** (`npx skills add` → "No valid skills found") — the real sources are `obra/superpowers` and `secondsky/claude-skills`.

One flagged risk: `extract-design-system` carries **1 Socket alert / Medium**. Kept as the pack's specifically recommended tool and read-mostly in nature, but it warrants a look before heavy use.

Skills are installed in two directories — `.claude/skills/` and `.agents/skills/` — both picked up (`/reload-skills` → 31 available). Not consolidated, deliberately.

---

## 12. Consolidated findings ledger

| # | Finding | Severity | Where |
|---|---|---|---|
| 1 | `main` vs `dataset` diverge by 357 files over a whole-tree `frontend/` relocation | **Critical** | §1a |
| 2 | Two Claude sessions share one working tree — no isolation | **Critical** | §2 |
| 3 | Zero RLS policies across 22 multi-tenant tables | **Critical** | §7a |
| 4 | Four pages render hardcoded "live" badges for capabilities that do not exist (`/escrow`, `/documents`, `/blockchain`, `/shipments`) | **High** | §6d |
| 5 | `CreateListingPage` claims "published successfully", writes only to `localStorage`; hardcodes `trustScore: 95` on every listing | **High** | §6c |
| 6 | `gh` unauthenticated — issue audit impossible | **High (blocker)** | §4a |
| 7 | CORS `allow_origins=["*"]` + `allow_credentials=True` | **High** | §7e |
| 8 | Three unlabeled hardcoded arrays presented as live user data, incl. the `/trade-requests` lifecycle step | **Medium** | §6b |
| 9 | Six contributors, not two — split premise was wrong | **Medium** | §1b |
| 10 | Business logic (compliance threshold, composite weights) lives in n8n code nodes | **Medium** | §8 |
| 11 | Hardcoded demo trade ID in core lifecycle nav | **Medium** | §6e |
| 12 | `escrow_accounts`/`blockchain_records` created→dropped→recreated across migrations | **Low** | §7b |
| 13 | `supabase_vector_GlobeX` in a restart loop | **Low** | §3 |
| 14 | `docs/tasks.md` Phase 7 (Security) and Production-Pack Phase 7 (Current Facts) share a number, not a meaning | **Low** | §5 |

Clean, verified, no action: SQL injection (§7c), connection pooling (§7d), secrets in git (§7f), n8n fake-success fixes (§8), `mockTradeData.ts` labelling (§6a).

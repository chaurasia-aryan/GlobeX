# GlobeXAI — Developer Work Split

**Date:** 2026-08-23
**Branch:** `dataset` @ `e147087`
**Companion documents:** `reports/production/current_state_reconciliation.md` (evidence for every claim here), `docs/product/user_flow.md` (route-level gaps), `docs/tasks.md` (live phase checklist — tracked separately, referenced not duplicated).

---

## 0. Read this first — two premises in the brief turned out to be wrong

This split was requested as a two-way division between the current user and `Sanya06C`. Two things checked during this pass contradict that framing. Both change the answer materially, so they are stated up front rather than buried.

### 0a. The team is six people, not two

`git shortlog -sne --all`:

| Commits | Author | Evidence of what they touch |
|---|---|---|
| 26 | `chaurasia-aryan <chaurasiaaryan1980@gmail.com>` — **current user** | Docs, integration, backend, n8n, workflows |
| 6 | `Varun2976 <vsnair2976@gmail.com>` | **Frontend** — Wishlist, Super Admin login, the `frontend/` relocation |
| 5 | `SiyaAgrawal95 <siyaagrawal9506@gmail.com>` | **Database** — demo seed data; "Documents" |
| 2 | `Sanya Chavan <sanyachavan06@gmail.com>` — repo owner | LFS migration, bulk add |
| 1 | `MihirPetkar108 <mihirpetkar2006@gmail.com>` | Owner of the `StoreonChain` upstream |
| 1 | `Pooja <pooja9b09@gmail.com>` | **Schema** — verification audit fields on `organizations` / `verification_reviews` |

The consequential detail is not the head-count — it is that **the lanes the brief wanted to assign are already occupied by people who are not in the brief.** The proposed split gives frontend to the current user; `Varun2976` has been the de-facto frontend owner and made the largest frontend change in the repo's history yesterday. It gives Postgres to `Sanya06C`; `SiyaAgrawal95` and `Pooja` have been writing the migrations. Assigning a two-way split over a six-person repo would create collisions on day one.

A two-way split is therefore given below **as requested**, and a six-way split that matches observed ownership is given alongside it. The two-way version is the one to discard if the team is really six people.

### 0b. `Sanya06C`'s actual footprint is not backend work

The brief proposes `Sanya06C` take backend / Postgres / API / ingestion / n8n / ML. Their two commits are `e147087` ("chore: migrate large CSVs to Git LFS") and `aea681b` ("chore: add all untracked files and changes") — repository-maintenance commits. There is no evidence in git history of backend, API, n8n, or ML authorship by this account.

That does not mean they cannot own that lane — role assignment is a team decision, not a git-history deduction, and repo ownership plausibly implies coordination duties rather than feature work. But the split should be assigned by agreement, not presented as a description of what is already happening. **Confirm with the person before treating this as their lane.**

---

## 1. HUMAN ACTION REQUIRED — the GitHub issue situation

**No issue data was obtainable. None appears in this document.**

```
$ "C:\Program Files\GitHub CLI\gh.exe" --version
  gh version 2.98.0 (2026-08-20)

$ gh auth status
  You are not logged into any GitHub hosts. To log in, run: gh auth login

$ gh repo view      -> "To get started with GitHub CLI, please run: gh auth login"
$ gh issue list --state open
                    -> "To get started with GitHub CLI, please run: gh auth login"
```

Two separate problems, both needing a human:

1. **Not authenticated.** `gh auth login` requires an interactive browser flow or a personal access token that only the account holder can create. It cannot be automated or worked around from inside this session, and it was not attempted.
2. **Not on `PATH` in this shell.** `gh` resolves only by full path. A shell opened after the install would normally pick it up; this one predates it.

**Consequence for this document:** the requested split "by dependency, file ownership and merge-conflict risk, not raw issue count" is fortunate — those three inputs were all measurable from the repository and were measured. But the split cannot be reconciled against real open issues, milestones, labels, or existing assignees. **It is provisional.** No issue was invented to fill the gap.

**To complete it:** a human runs `gh auth login`, then `gh issue list --state open --limit 100 --json number,title,labels,assignees,milestone`. The lane assignments below should then be checked against real assignees before anyone acts on them.

---

## 2. The blocker that outranks the work split

**Before any lane is assigned, the branch layout must be settled.** Splitting work across a repository whose two branches disagree about where 357 files live will generate conflicts faster than any split can prevent them.

```
$ git rev-list --left-right --count origin/dataset...origin/main
  14      2
$ git merge-base origin/dataset origin/main
  43dd0e9  "Added Wishlist"
$ git diff --name-only origin/dataset...origin/main | wc -l
  357
```

The two commits `main` has that `dataset` lacks:

- `4033f3c` (Varun2976, 2026-08-23 16:32 IST) — **"Created frontend folder and moved files into it"**
- `0a9c6c2` (Varun2976, 2026-08-23 14:45 IST) — "Added Super Admin login section"

On `main`, the frontend is at `frontend/src/…` with its own `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts`. On `dataset` it is at `src/`. Every fix made this session — `src/api/marketplace_api.py`, `src/services/api/aiService.ts`, `src/test/coreFlowAndAuth.test.tsx` — lives at a path that does not exist on `main`. A 222-file rename crossed with 14 commits of edits to those same files is not something git will resolve confidently.

**Human decision required, by the whole team, before the next frontend commit on either branch:**

1. Does the frontend live at `src/` or `frontend/src/`? (`frontend/` is the better long-term layout for a repo that also holds `backend/`, `blockchain/`, and `services/`.)
2. Whoever performs the reconciliation does it **alone, in one commit, with everyone else's tree clean.** Nobody else commits to either branch while it is in flight.
3. Reconcile with `git merge -X rename-threshold=25%` or an explicit `git mv` replay — not a blind merge.

Until this is done, the split below describes lanes, not work that can safely start in parallel.

---

## 3. The other coordination hazard: two Claude sessions, one working tree

`~/.claude/projects/` contains exactly one project directory — `D--Codes-SIH26` — with two live transcripts (`6a68eee2…jsonl`, 6.0 MB, written 23:26; `78ed070a…jsonl`, 0.99 MB, written 23:19). The reported path `D:\SIH26` **does not exist**; the real parent is `D:\Codes\SIH26`.

Both sessions are operating on **the same working tree**: one filesystem, one `.git`, one set of uncommitted changes, one set of running services (including a Vite dev server on `:5173` that this session did not start). There is no isolation — concurrent edits to the same file overwrite each other silently, with no merge and no warning.

This matters for the split because it means the 25 uncommitted entries in `git status` are a **shared** state. Some may be the other session's work in progress. Before anyone commits, establish which changes belong to whom.

**Action:** one session moves to a separate clone or a `git worktree`, or one stops. Not resolvable from inside a session.

---

## 4. Conflict-risk map — measured, not guessed

The split is derived from this. Files are grouped by how likely two people are to need them in the same week.

### 4a. RED — shared contract surfaces, never edited by two people in parallel

| File / area | Why it is red | Recent authors |
|---|---|---|
| `backend/database/supabase/migrations/*.sql` | Append-only by filename timestamp; two people adding migrations the same day produce ordering ambiguity that only shows up at `supabase start`. Already bitten once: the `platform_role='ADMIN'` invalid-enum bug silently broke all migrations after it. | SiyaAgrawal95, Pooja, current user |
| `backend/brain/n8n/globex_trade_automation.workflow.json` | A single 24-node JSON blob. Any two edits conflict at the file level, and the diff is unreadable. **Never hand-merge.** | current user |
| `src/services/api/aiService.ts` | The frontend/backend contract. Every `dataSource` label added this session lives here; frontend consumes it, backend defines it. | current user |
| `src/types/trade.ts` | Shared TypeScript types consumed by 19+ modules. | — |
| `src/App.tsx` | Single route table; every new page touches it. | — |
| `package.json` / `package-lock.json` / `requirements.txt` | Lockfile conflicts are near-guaranteed and tedious. `package-lock.json` and `requirements.txt` are **already modified and uncommitted**. | current user |
| `main.py` | Single FastAPI entrypoint; every router registration touches it. **Already modified.** | current user |
| `.env` / `.env.local.example` | `.env` is correctly gitignored (`.gitignore:30`) and untracked — verified. The `.example` is shared and must stay in sync. | — |

**Protocol for RED files:** announce in the team channel before editing; land as a small standalone commit; never carry one inside a large feature branch. For migrations specifically, one person holds the pen at a time.

### 4b. AMBER — single-owner but cross-cutting

- `src/context/WorkspaceContext.tsx` — the `localStorage` persistence layer that `CreateListingPage` depends on. Changing it changes every consumer.
- `src/components/layout/` — `Navbar.tsx`, `RoleNavigation.tsx`, `CoreFlowSidebar.tsx`, `AppShell.tsx`. Every page renders through these; three of them hardcode `/trades/TRD-IND-UAE-550K`.
- `src/data/mockTradeData.ts` — 46 KB, 19 importers. Should shrink as pages are wired to real APIs; coordinate removals.
- `src/api/*.py` — separate router files, but they share `main.py` registration and `src/db/client.py`.

### 4c. GREEN — safe to work on in parallel

- Individual `src/pages/*.tsx` (one owner per page).
- Individual `src/components/<feature>/` directories.
- `blockchain/`, `services/chain-adapter/` — an isolated subtree, currently paused.
- `reports/`, `docs/` — additive; conflicts are trivial.
- `src/test/` — one test file per feature.

---

## 5. The split, as requested (two-way)

**Provisional** — pending §1 (issue data), §2 (branch layout), and §0b (confirmation that `Sanya06C` accepts the backend lane).

### Lane A — current user (`chaurasia-aryan`): frontend, UX, design system, marketplace UI, Playwright

| Owns | Files |
|---|---|
| Route table and IA | `src/App.tsx` (RED — coordinate) |
| All pages | `src/pages/*.tsx` (23 components) |
| Frontend components | `src/components/**` except backend-contract files |
| Layout / navigation | `src/components/layout/**` (AMBER) |
| Design system | `src/components/ui/**`, `tailwind.config.ts` |
| Client state | `src/context/WorkspaceContext.tsx` (AMBER) |
| Demo data retirement | `src/data/mockTradeData.ts` (AMBER) |
| Browser tests | `src/test/**`, Playwright suites |

**Priority queue, ordered by the evidence in `docs/product/user_flow.md`:**

1. **Remove the four false liveness badges** — `/escrow` "USDC Smart Vault Active", `/documents` "On-Chain Hash Anchoring Active", `/blockchain` "Ethereum Sepolia Live", `/shipments` "AIS Live Satellite Connected". All four assert capabilities that do not exist (there is no escrow in `TradeLedger.sol`; anchoring is disabled; nothing ever touched Sepolia; there is no AIS integration). This is the same fake-success anti-pattern already fixed in the data layer this session, surfacing in the UI. **Do this first** — it is cheap, and it is the only category of defect that actively misleads a demo audience.
2. **Fix `CreateListingPage`** — it shows "Product listing published successfully!" while writing only to `localStorage`, and stamps every listing with hardcoded `trustScore: 95, riskScore: 12, isTopTrusted: true`. Fabricated trust scores on a compliance platform.
3. **Render the honest `dataSource` labels** that this session added to `aiService.ts` — the data layer is honest, no UI shows it. `docs/tasks.md` Phase 5, five unchecked items.
4. **Add a `/trades` index route** and stop hardcoding `/trades/TRD-IND-UAE-550K` in three navigation files.
5. **Make `/trade-analysis` reachable** — 6 API calls, 9 loading states, the best-integrated page in the app, and no link points at it. Highest value per unit of effort in the repo.
6. Consolidate the six alias routes (`/role-select`, `/signup`, `/get-started`, `/trade-intent`, `/export-catalog`, `/arbitrator`) into redirects.
7. Loading / empty / error states — build them **as each route is wired**, not as a retrofit. 15 of 17 substantive routes have none, because they have no async data to wait on.

### Lane B — `Sanya06C` (proposed): backend, Postgres, API, ingestion, n8n, ML

| Owns | Files |
|---|---|
| Migrations | `backend/database/supabase/migrations/**` (RED — sole pen) |
| API routers | `src/api/*.py` |
| DB layer | `src/db/client.py` |
| FastAPI entrypoint | `main.py` (RED) |
| n8n | `backend/brain/n8n/**` (RED) |
| ML / ingestion | `backend/brain/**` |
| Python deps | `requirements.txt` (RED) |

**Priority queue:**

1. **Row-level security.** Zero RLS policies exist across 22 multi-tenant tables — `grep -rni "row level security|create policy" backend/database/supabase/migrations/*.sql` returns nothing. `organizations`, `organization_members`, and `organization_id` FKs on `listings`/`trades`/`trade_documents`/`disputes` make the tenancy model explicit; the enforcement is entirely absent. Any direct PostgREST access, or one forgotten `where organization_id = $1`, exposes every org's trade data to every other org. **Highest-severity backend item.**
2. **Fix CORS.** `main.py:128-131` has `allow_origins=["*"]` with `allow_credentials=True` — an invalid combination that browsers reject on credentialed requests, and one that must never ship. `docs/tasks.md` Phase 7, unchecked.
3. **Wire the frontend to the real trade API.** `src/api/trades_api.py` was built and live-verified against local Supabase; no route consumes it. This is a joint task with Lane A — see §6.
4. **Move business logic out of n8n.** `Synthesize Doc Verdict` encodes a compliance threshold (`complianceScore < 70` → `REVIEW_REQUIRED`); `Synthesize All Models` (123 lines) encodes composite scoring weights. Policy decisions in unversioned workflow JSON, untested by any suite. The boundary otherwise holds well — all 9 HTTP nodes call real backend endpoints with explicitly constructed bodies, no raw `$json` passthrough.
5. **Create `n8n/workflows/`.** The new required save location does not exist; the only workflow JSONs are under `backend/brain/n8n/`. To-create, next phase.
6. **Consolidate the migration history.** `escrow_accounts` and `blockchain_records` are created in `20260822111809`, dropped in `20260822120632`, and recreated with a different definition in `20260823000000`. Reading the initial schema gives the wrong columns.
7. Resolve the n8n `webhook_entity` activation quirk (`docs/tasks.md` Phase 4 — workaround only, root cause is specific to this n8n build).

**Not in scope for either lane:** ML retraining. All three models are retired with real held-out evidence (`phase4`/`phase5`/`phase6` verdicts). Future model work has permission to replace them; nobody should be forcing a broken model into production to close a ticket.

---

## 6. Cross-lane work — needs both people in the same conversation

These cannot be assigned to one lane. Each is a contract change.

| Task | Lane A does | Lane B does | Contract file (RED) |
|---|---|---|---|
| Wire `/trades/:id` to real persistence | Consume the API, add loading/empty/error states | Expose and document the endpoint | `src/services/api/aiService.ts` |
| Wire `/documents` to real verification | Upload UI, hash-result display | Document endpoints, `AUTHENTIC`/`TAMPERED` response shape | same |
| Wire `/trade-requests` to real RFQs | Replace `INBOUND_REQUESTS_DATA` | RFQ table + endpoints | same + migration |
| Persist listings | Replace the `localStorage` write | `POST /listings` against `public.listings` | same + migration |
| Org scoping in the UI | Pass org context | RLS policies + server-side scoping | migrations |
| Resolve `/escrow` | Remove the false claims, or gate behind a real flag | Decide whether escrow is ever built (it is **not** in `TradeLedger.sol`) | product decision |

**Rule for all six:** agree the response shape in writing *before* either side codes. `aiService.ts` and the migration files are the two places a disagreement becomes an unmergeable conflict.

---

## 7. The split that matches who is actually doing what (six-way)

Offered as the alternative to §5. Derived from `git shortlog` and per-commit file scope — real observed ownership, not assignment.

| Person | Observed lane | Evidence |
|---|---|---|
| `chaurasia-aryan` (current user) | Integration, backend wiring, n8n, docs, ML audit | 26 commits; all this session's fixes |
| `Varun2976` | **Frontend** — pages, auth UI, repo layout | Wishlist, Super Admin login, the `frontend/` move (`4033f3c`) |
| `SiyaAgrawal95` | **Database / seed data / documents** | `72e860a` GLOBEX demo seed data; `a019f6d` "Documents" |
| `Pooja` | **Schema — verification/compliance** | `b3ab27c` verification audit fields on `organizations`, `verification_reviews` |
| `Sanya Chavan` (`Sanya06C`) | **Repo ownership / release engineering** | LFS migration, bulk add — maintenance, not features |
| `MihirPetkar108` | **Blockchain** (currently paused) | Owns the `StoreonChain` upstream that `TradeLedger.sol` was vendored from |

Under this reading, the natural adjustment to §5 is: **the current user does not take the frontend lane** — `Varun2976` already has it, and handing it over would collide directly with the largest uncommitted structural change in the repo. The current user's demonstrated strength is integration and backend wiring, which is also exactly what the top blockers need (§6). `Sanya06C` coordinates the merge in §2, which is a repo-owner task and matches their actual commit history.

Two people who need a direct conversation regardless of which split wins: **`SiyaAgrawal95` and `Pooja` are both writing migrations.** That is the single reddest file in the repository and it currently has two authors and no protocol.

---

## 8. Working agreements — proposed, needs team sign-off

1. **One migration author at a time.** Announce before creating a migration file; land it alone.
2. **Never hand-merge the n8n workflow JSON.** Export from n8n and replace the whole file, or edit it in one place only.
3. **Contract-first.** Any change to `aiService.ts` or `src/types/trade.ts` is agreed before it is coded.
4. **Small, single-purpose commits on RED files** — never bundled into a feature branch.
5. **No fake success. No fabricated data.** The rule the codebase already enforces in its own comments. This session found and fixed the pattern in the n8n workflow, `marketplace_api.py`, `aiService.ts`, and a unit test that asserted the fabricated value as correct. `docs/product/user_flow.md` documents four more instances still live in the UI.
6. **Never add Claude or Anthropic as a git contributor or co-author.** Standing rule.
7. **One Claude Code session per working tree.** See §3.

---

## 9. Status of this document

| Section | Confidence | Basis |
|---|---|---|
| §0 team composition | **High** | `git shortlog -sne --all`, per-commit inspection |
| §1 gh auth blocker | **High** | Real command output |
| §2 branch divergence | **High** | `rev-list`, `merge-base`, `diff --name-only` |
| §3 parallel session | **High** | Filesystem + session-storage inspection |
| §4 conflict map | **High** | File structure, import counts, commit history |
| §5 two-way lanes | **Provisional** | No issue data (§1); premises questioned (§0) |
| §6 cross-lane tasks | **High** | Derived from measured integration gaps |
| §7 six-way lanes | **Medium** | Real git evidence; small sample per person |
| §8 agreements | **Proposed** | Needs team sign-off |

Re-run after `gh auth login` and after the branch layout is settled. Both change the answer.

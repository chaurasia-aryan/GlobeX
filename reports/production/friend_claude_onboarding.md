# Friend-Claude Onboarding Audit

**Date:** 2026-08-24
**Method:** static inspection (git, grep, GitHub REST API). No servers started, nothing installed, nothing modified except this report and `friend_claude_issue_map.md`.

## Repository

```
Path:    C:\Users\DELL\GlobeX_Personal
Remote:  https://github.com/chaurasia-aryan/GlobeX_Personal.git
Branch:  main (only branch that exists, locally or on origin)
HEAD:    6835d84 "Fix fake-success bugs across n8n/backend/frontend; add blockchain
                  anchoring, entity screening, and transaction compliance gate"
Status:  clean, up to date with origin/main
Git user (this session): Sanya Chavan <sanyachavan06@gmail.com> (matches GitHub Sanya06C)
```

## Important discrepancy vs. the in-repo onboarding docs

`reports/production/new_computer_takeover.md` and `current_state_reconciliation.md` were themselves committed as *content* of `6835d84` — they describe a **different machine** (`D:\Codes\SIH26\GlobeX-New`, remote `Sanya06C/GlobeX-New`, branch `dataset` @ `e147087`, two concurrent Claude sessions, live Docker services on ports 5173/8000/54321-3/5678/8545). None of that applies to this checkout: this machine has no `dataset` branch, no Docker, no running services, and a different remote entirely. Treat those two files as **historical evidence bundled into the repo, not live state** — re-verified every claim used below against the actual current code rather than trusting them.

`docs/collaboration/work_split.md` (also from `6835d84`) is the actual live document: it proposes a two-way split (current-user/Aryan = frontend; `Sanya06C` = backend/Postgres/API/ingestion/n8n/ML) plus an alternate six-way split reflecting real git history. The GitHub issue tracker (queried directly, see below) confirms the backend lane: **all 8 open issues are assigned to `Sanya06C`**, none to Aryan or anyone else.

## Current project phase

- Aryan's `6835d84` closed out several fake-success bugs (n8n fallback data, marketplace fake counts, aiService silent fallbacks) and added new subsystems: blockchain document-anchoring (`blockchain/`, `services/chain-adapter/`, real Hardhat deployment, 13/13 tests), entity/sanctions screening (`src/compliance/entity_screening.py`, 20,260 real OFAC/UN entities), and a transaction compliance gate (`src/compliance/transaction_gate.py`).
- What that commit did **not** fix, verified still present in the current code: the 4 fake "live" status badges, the CORS wildcard+credentials bug, `CreateListingPage`'s fabricated trust scores, zero RLS policies, business logic embedded in the n8n workflow JSON, and the churny escrow/blockchain migration history. These are exactly the 8 open GitHub issues (see `friend_claude_issue_map.md`).

## My assigned issues (all 8 open issues — GitHub `Sanya06C`)

1. Zero RLS policies across 22 multi-tenant tables — **Critical**
2. CORS `allow_origins=["*"]` + `allow_credentials=True` — **High**
3. Four hardcoded "live" status badges (`/escrow`, `/documents`, `/blockchain`, `/shipments`) — **High**
4. `CreateListingPage` fabricates trust scores, never persists — **High**
5. Business/compliance logic embedded in n8n workflow JSON — **Medium**
6. Branch divergence `main` vs `dataset` — **not applicable on this checkout**, needs confirmation with Aryan that it's resolved
7. Consolidate migration history (escrow/blockchain tables created→dropped→recreated) — **Medium**
8. Future work: real financial escrow — **deferred, out of scope unless requested**

Full detail, file ownership, and dependencies: `reports/production/friend_claude_issue_map.md`.

## Aryan's relevant work (not to touch)

No open issues are assigned to him in the tracker; his work lands directly on `main`. Recent authorship: n8n workflow, `marketplace_api.py`, `aiService.ts`, blockchain vendoring, entity screening, transaction gate, and most of `docs/`/`reports/`. Per the work-split doc, RED files he's touched recently (`backend/brain/n8n/globex_trade_automation.workflow.json`, `main.py`, `src/services/api/aiService.ts`) need announcement before edits even though issue #5 requires touching the n8n file.

## Shared / RED dependencies

- `backend/database/supabase/migrations/*.sql` — append-only, sole-pen rule. Issues #1 and #7 both live here; do them together in one migration pass to avoid two separate touches of the same red file.
- `backend/brain/n8n/globex_trade_automation.workflow.json` — never hand-merge; issue #5 requires editing it. Export/replace whole-file only.
- `main.py` — single FastAPI entrypoint; issue #2 is a 3-line fix here, low risk but still shared.

## Installed skills / tooling

- `.claude/` and `.agents/` skill directories: **absent** — clean machine, nothing carried over from the old audits' 31-skill install.
- Node v22.17.1, npm 11.12.1, Python 3.12.5, git 2.50.0, Claude Code 2.1.241 — all present.
- **Docker: not installed** — blocks running `supabase start` locally, so migration work (#1, #7) can be written/reviewed but not locally verified against a live Postgres instance on this machine.
- **`gh` CLI: not installed** — worked around for read-only issue listing via the GitHub REST API; cannot update/comment/close issues from this machine without it.

## Missing environment / configuration

- No `.env` file present (only the gitignored-correctly `.env.local.example`, which contains placeholders only — no live secrets, unlike a prior machine's copy that was flagged for a live `OPENSANCTIONS_API_KEY`).
- No local Supabase/n8n/FastAPI services running (none installed/started on this machine).

## Blockers

1. No Docker → cannot locally verify migrations for #1/#7 by actually running `supabase start`. Can still write correct SQL and review it against the schema files.
2. No `gh` CLI → cannot post issue updates/comments from this machine without a human running `gh auth login` first, or being told to proceed via the REST API read-only path only.
3. Issue #6 (branch divergence) references a `dataset` branch that doesn't exist on this remote — needs a one-line confirmation from Aryan/team that it's resolved before treating it as closed.

## First implementation task

Not yet started — awaiting the user's priority call between issue #2 (CORS, 3-line fix, ships fast) and issue #1 (RLS, highest severity, needs a new migration + more care). Recommendation: #2 first (minutes, zero risk), then #1/#7 together (same RED file area, same migration pass), then #3, #4, #5.

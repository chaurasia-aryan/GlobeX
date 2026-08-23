# Integration Recovery Log

Date: 2026-08-23. Method: direct inspection + live verification (servers actually started, real requests made, real DB queried) — not a static read-through.

## Git state at recovery start

```
Branch: dataset
HEAD:   e147087 chore: migrate large CSVs to Git LFS
Recent: aea681b chore: add all untracked files and changes
        e4130a8 readme improv
        339c149 reorganization
        456be98 docs: update README and setup guides with environment matrix and n8n setup
Working tree: 19 changed/untracked paths (see `git status --short`), no destructive ops run.
```

Also present but not yet reconciled into this task list: `GlobeXAI_Claude_OneShot_Production_Pack/` (33-file compliance/ML track, phases 0-7 already delivered with evidence in `reports/production/`) and `Claude_Blockchain_Design_Integration_Pack/` (9-file blockchain/design track). This resume prompt's Phase 0-10 structure overlaps with, but is not identical to, those. Where they overlap, work already done under those packs is credited below rather than redone.

## Inventory

**Frontend**: React 18.3 + Vite + Tailwind + shadcn/Radix, `package.json` at repo root, 22+ pages. `node_modules` was absent at session start — installed (781 packages).

**Backend entry point**: single `main.py` at repo root — ONE FastAPI app, confirmed no competing app exists. Mounts 8 routers: `trade_anomaly`, `hs_classifier`, `partner_discovery_api`, `counterparty_api`, `compliance_api`, `documents_api`, `marketplace_api` (pre-existing), plus `trades_api` (new, this session — the persistence layer that did not exist before).

**ML modules/artifacts** (per `reports/production/phase3_data_model_audit.md`, already on disk before this session):
- Trade anomaly (XGBoost): wired correctly, but the audit found the label is a closed-form function of its own input features (F1=1.0 is circular, not predictive) — **not retrained**, per the "never fabricate a pass" rule; documented as a finding, not fixed by force.
- Partner-discovery GRU forecast: underperforms a 3-year moving-average baseline on every metric — **not retrained**; moving-average promoted to the real production baseline instead.
- Trade-risk (Isolation Forest + GRU Autoencoder): checkpoint provenance doesn't match the repo; 23/27 features constant in production; **disabled**, no safe fallback existed (a bug was found where an unrecognized org ID returns a fully fabricated 1,347-trade profile — flagged, not silently patched).

These three verdicts were reached by prior sessions using held-out validation, not by this recovery pass — credited here since they satisfy Phase 1's "confirm model loads / confirm feature expectations / do not retrain unless genuinely broken" requirements with real evidence already on disk.

**Datasets**: `backend/brain/processed/*.parquet` (34 HS6 codes, 14 tier-1 + 51 tier-2 partner countries — see `reports/production/phase7_current_facts.md` §1 for the exact scope derivation). Two parallel trees exist (`backend/brain/` active, `backend/brain/brain_prev/` deprecated) — both preserved, nothing overwritten.

**Notebooks**: under `backend/brain/notebooks/` (active) and `backend/brain/brain_prev/notebooks/` (deprecated, kept for provenance per Phase 2's baseline-registry rule already established in `reports/production/phase2_notebook_baseline_policy.md`).

**Migrations**: `backend/database/supabase/migrations/`, 4 files, Supabase CLI timestamp-prefixed convention. Migration 2 dropped `blockchain_records`/`escrow_accounts`; migration 4 re-added both. **A real, previously-undiscovered bug was found and fixed this session**: migration 3's seed data inserted `platform_role = 'ADMIN'` for 4 rows, but the `platform_role` enum (defined in migration 1) does not contain that value — only `SUPER_ADMIN`, `VERIFICATION_OFFICER`, `COMPLIANCE_OFFICER`, `ARBITRATOR`, `OPERATIONS`. This caused `supabase start` to fail applying migration 3, which meant migration 4 (the one creating the tables this integration needs) never ran. Fixed by mapping the 4 invalid `'ADMIN'` values to `'SUPER_ADMIN'` (the only admin-tier value the enum has) — a data-only fix, no schema change. Verified: `supabase start` now applies all 4 migrations cleanly against a real local Postgres instance (`postgresql://postgres:postgres@127.0.0.1:54322/postgres`).

**n8n JSON**: `backend/brain/n8n/globex_trade_automation.workflow.json` (working copy) + `backend/brain/n8n/dump/globex_trade_automation.reference.json` (original, already preserved by a prior session — confirmed present, not yet re-validated against the current API surface in this pass).

**Environment files**: `.env.local.example` (tracked, placeholders only — the one real value it briefly carried was already replaced by a prior session; git *history* still carries it, a known item the user is handling separately, not part of this task). `.env` (untracked, gitignored, created this session) carries `SUPABASE_DB_URL` for the local Supabase instance and `CHAIN_ADAPTER_URL`/`BLOCKCHAIN_ANCHORING_ENABLED` (currently `false` — blockchain integration is paused per explicit user instruction, tracked separately).

## What changed this session (additive only, nothing destructive)

- `src/api/trades_api.py`, `src/db/client.py`, `src/services/chain_client.py` — new trade/document persistence layer (previously did not exist: zero DB client anywhere in the FastAPI app).
- `main.py` — added the new router, real DB-backed health check (was env-var-presence only), DB pool lifecycle in `lifespan`.
- `backend/database/supabase/migrations/20260822182000_seed_globex_demo_data.sql` — one-line-pattern fix for the invalid `'ADMIN'` enum value (see above).
- `requirements.txt` — added `rapidfuzz`, `python-multipart` (both genuinely required by new code, not speculative).
- Blockchain track (`blockchain/`, `services/chain-adapter/`) — built and verified live in an earlier part of this session, then explicitly paused by the user ("hold on to the blockchain part first do everything rest"). Left in a clean, working, non-destructive state; not part of this task-list pass.

## Verified live (not just read)

- Local Supabase stack up, all 4 migrations applied, confirmed via direct `psql` query matching API responses exactly.
- FastAPI backend starts, `/health` reports real subsystem states (DB round-trip, not env-var presence).
- Trade creation → real DB row (verified independently via `psql`).
- Document upload → server-side SHA-256 matches independently-computed `sha256sum` of the same bytes exactly.
- Tamper-detection endpoint → correctly returns `AUTHENTIC` for the identical file and `TAMPERED` for a modified one.

## Next per `docs/tasks.md`

Proceeding phase-by-phase from here: Phase 4 (n8n recovery) is the next substantively unstarted item — Phases 1-3 are largely satisfied by evidence already cited above.

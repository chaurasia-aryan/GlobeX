# New-Computer Takeover Audit

Date: 2026-08-23. Method: static inspection only (Read/Glob/Grep). No servers started, nothing installed, nothing modified.

## Environment

```
Previous development environment: unknown machine, repo path D:\hehehe\GlobeX (per reports/production/repository_audit.md line 4)
Current development environment:  this machine, repo path D:\Codes\SIH26\GlobeX-New
Repository branch:                dataset
Current commit:                   e147087 "chore: migrate large CSVs to Git LFS"
Previous known checkpoint:        Phase 7 ("Current Facts") — marked "delivered" in reports/production/phase7_current_facts.md, built 2026-08-23
Last confirmed completed phase:   Phase 7 of the ORIGINAL 33-file GlobeXAI_Claude_OneShot_Production_Pack (data/compliance track). The NEWER Claude_Blockchain_Design_Integration_Pack (9 files) has NOT been started — its Phase 0 (this audit) is the first action taken against it.
```

Tool versions confirmed present: node v22.12.0, npm 11.14.1, python 3.12.3, git 2.47.1.windows.2, docker 29.5.3, claude 2.1.241.
**Missing: `gh` (GitHub CLI) — not on PATH.** This blocks Phase 2's "if authenticated GitHub CLI is available" lookup and the later GitHub Issues final-hygiene phase.

## Phase 7 (data/compliance pack) — completed work

DONE, with direct evidence:
- `backend/brain/compliance_data/current_facts/*.json` — 1,102 fact records, schema-validated, real fetch timestamps 2026-08-23. Sources: WTO RTA DB, WITS/TRAINS, UK Trade Tariff API, UAE MOET CEPA text, DGFT SCOMET Appendix 3, DGFT Schedule 2, UN SC Consolidated List.
- `src/compliance/current_facts.py`, `src/compliance/__init__.py` — loader/query API, CLI-runnable.
- Finding-change records FC-P7-001..004 documenting that the old `_TREATY_MAP` in `src/api/compliance_api.py` is materially wrong (wrong agreement for GBR, scalar-vs-real-dispersion, unverified preferential-rate inference, fabricating default for unmapped corridors).

NOT DONE (explicitly deferred by the Phase 7 doc itself, §6.6 and §8):
- `_TREATY_MAP` was NOT deleted; `/compliance/rag-analyze` was NOT rewired to `get_current_facts()`. Phase 7 doc says this is "Phase 8/14's job."
- Coverage is thin outside GBR: only 6.9% of tier-1 corridors have a CURRENT (non-stale) tariff fact. Rules of origin exist for only 2 of 14 tier-1 corridors.

## Phase 7 classification vs. the ORIGINAL pack's 19 phases

Per `reports/production/repository_audit.md` (a prior forensic audit already on disk, itself Phase-1-equivalent), status by subsystem:

| Area | Status | Evidence |
|---|---|---|
| React/Vite frontend shell | DONE | Full app builds structurally; 22+ pages |
| Compliance current-facts registry | DONE | 1,102 sourced records, this session's Phase 7 |
| Compliance gate wiring (`_TREATY_MAP` → real facts) | NOT STARTED | repository_audit.md §1 "Compliance/RAG"; phase7_current_facts.md §6.6 |
| Sanctions/restricted-party screening (live) | NOT STARTED | download scripts exist in deprecated `brain_prev/`, not wired to any API |
| CLEAR/REVIEW/BLOCKED/UNSUPPORTED gate | NOT STARTED | zero implementation matches anywhere in `src/` or DB schema |
| XGBoost trade-anomaly inference | DONE | correctly wired, artifacts load from real path |
| GRU partner-discovery forecasting | BLOCKED (wiring bug) | trained checkpoint exists on disk but `partner_discovery_api.py:32-33` points at nonexistent `backend/brain_temporary/...`; silently falls back to a momentum heuristic |
| GRU Autoencoder (trade risk) | BLOCKED (never wired) | artifact on disk, no calling code found; only Isolation Forest half of the ensemble is wired |
| OCR/document verification | NOT STARTED (stub) | `documents_api.py` unconditionally returns `status="STUB"` |
| Blockchain/escrow | NOT STARTED (fake) | `escrowService.ts` fabricates tx hashes via `Math.random()`; DB migration `20260822120632` actively DROPPED `blockchain_records`/`escrow_accounts` tables |
| n8n orchestration | PARTIALLY DONE | 51-node root workflow exists end-to-end but has no sanctions/KYB/transaction-gate node, and calls a TESTNET "smart contract" HTTP endpoint that (per escrowService evidence) is not backed by a real contract |
| CI / Playwright | NOT STARTED | no `.github/workflows`, no `playwright.config.*` anywhere |

## Blockchain/Design-Taste pack (the NEW pack this session's user prompt is driving) — Phase 0 findings

**(a) Is StoreonChain the colleague blockchain repo?** — **Confirmed, exactly.** `02_BLOCKCHAIN_REPOSITORY_INGESTION.md` names `https://github.com/MihirPetkar108/StoreOnChain` verbatim and states it has already inspected `blockchain/contracts/TradeLedger.sol` (Hardhat 3 + ethers), a port-3000 backend with invoice/trade endpoints. This matches the cloned repo's structure exactly (`blockchain/contracts/TradeLedger.sol`, `backend/src/services/tradeLedger.service.ts`, `invoice.controller.ts`, `trade.controller.ts`).

**Critical caveat already flagged by the pack itself (line 203):** *"Do not assume this contract is an escrow vault."* TradeLedger records trade data + invoice hashes and computes exporter reputation — it is a **ledger/document-integrity contract, not an escrow/custody contract**. No `escrow`, `deposit`, `release`, `refund`, `payable`, or stablecoin-transfer code was found in a first pass over `blockchain/contracts/TradeLedger.sol`'s referenced surface (full Phase 2 grep sweep not yet run — that is the next task, not this one). **If GlobeXAI's compliance/frontend track expects real escrow release/refund/dispute financial custody, StoreOnChain as inspected so far does not provide it** — this is a scope gap to resolve with the user before Phase 4 (Blockchain Implementation) claims any escrow capability is "real."

**(b) Is a Design Taste repo genuinely missing?** — **Yes, confirmed missing, and there is a live inconsistency in the pack's own paperwork.** `05_DESIGN_TASTE_FRONTEND.md` line 11 has the URL as an unfilled template placeholder: `DESIGN_TASTE_REPO_URL=<PASTE_DESIGN_TASTE_REPOSITORY_URL>`. But `07_REPOSITORY_HANDOFF.md` (the file meant to carry the resolved values) fills the Design Taste URL field with `https://github.com/MihirPetkar108/StoreOnChain` — **the identical URL as the blockchain repo**, not a design repo. That is almost certainly a copy-paste error when the handoff template was filled in, not a real second use of StoreOnChain as a design reference. No directory named anything like "Design Taste" exists anywhere under `D:\Codes\SIH26`. **This is a genuine blocker requiring the user to supply the actual Design Taste repository URL** — Phase 3 (Design Taste Gate) cannot proceed on invented contents per the pack's own rule ("If it is private and inaccessible, report the blocker instead of inventing its contents").

**(c) Is `gh` CLI absence a real blocker?** — Yes, for two specific things: (1) `02_BLOCKCHAIN_REPOSITORY_INGESTION.md`'s optional "authenticated GitHub CLI" repo-name lookup (non-blocking — URL is already known and repo is already cloned, so this step is moot); (2) the Final Phase's GitHub Issues creation, which requires `gh issue list` / `gh issue create` — this **is** blocking until `gh` is installed and authenticated.

**(d) What Phase 7 delivered vs. left open** — see table above; summary: delivered a real, sourced, schema-validated current-facts registry (1,102 records) but did not touch the API layer that would consume it, so `/compliance/rag-analyze` still serves the old fabricated 9-corridor table today.

## Current blockers (3)

1. **Design Taste repository URL not actually provided** — the one value present is a copy-paste duplicate of the blockchain repo URL, not a real design reference. Cannot proceed to Phase 3 (Design Taste Gate) without the user supplying the correct URL, or explicit instruction to skip/defer frontend-design-taste work.
2. **`gh` CLI not installed** — blocks the Final-Phase GitHub Issues step only; does not block any earlier phase.
3. **StoreOnChain may not provide real escrow custody** (ledger/document-integrity contract confirmed; escrow/deposit/release/refund code not yet confirmed present or absent — needs the full Phase 2 keyword sweep before Phase 4 implementation claims are made). Not a hard blocker yet, but must be resolved by evidence (Phase 2 of the blockchain pack) before any "real escrow" claim is written.

## Missing local dependencies / config

- `gh` CLI (see above).
- No repo-root `.env` (only `.env.local.example` in GlobeX-New; `backend/.env.example` in StoreonChain) — none inspected for secret values here, per instruction.
- `.env.local.example` in GlobeX-New (tracked in git) was already flagged in `repository_audit.md` §5 as containing what looks like a **live, non-placeholder `OPENSANCTIONS_API_KEY`** value — carried forward here as a security item for Phase 9, not re-verified in this pass.
- No `.github/workflows` (no CI), no `playwright.config.*` anywhere in GlobeX-New.

## Missing generated artifacts / services that must be started

Not evaluated in this pass (static-only per Phase 0 scope) — FastAPI backend, n8n instance, and Supabase/Postgres connectivity are all unconfirmed as running on this machine. Docker is installed (29.5.3) but no containers were inspected.

## Files that differ from the expected handoff

- Repo root moved from `D:\hehehe\GlobeX` (old audit path) to `D:\Codes\SIH26\GlobeX-New` (this clone).
- `Claude_Blockchain_Design_Integration_Pack/` is present but untracked (`git status` shows it as `??`) — it was added to the working tree but never committed on the previous machine, or was added after the last commit here.

## Next task

Resolve blocker (1) with the user (real Design Taste URL, or explicit skip), or — if the user wants to proceed regardless — begin Phase 2 of the blockchain pack: the full keyword sweep of StoreOnChain (`escrow|deposit|release|refund|payable|stablecoin|USDC|USDT`) to settle blocker (3), and write `reports/blockchain/blockchain_repository_audit.md` / `globex_blockchain_compatibility.md`.

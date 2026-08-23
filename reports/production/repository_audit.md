# GlobeXAI Repository Forensic Audit — Phase 1

Date: 2026-08-23
Scope: `D:\hehehe\GlobeX` as of the current `dataset` branch, evaluated against the 33-file
`GlobeXAI_Claude_OneShot_Production_Pack/` specification (specifically the capability list in
`00_MASTER_ANTIGRAVITY_PROMPT.md` Phases 1–19).

Method: static inspection only (Read/Glob/Grep). No servers were started, no models were run.
Anything that requires runtime execution to confirm is explicitly marked "unverified — requires
runtime inspection" rather than guessed.

---

## 0. Referenced-but-missing documents (Phase 1 required reading)

The master prompt (`00_MASTER_ANTIGRAVITY_PROMPT.md` line 125) instructs reading four files at
repo root. Search results:

| File | Found? | Location |
|---|---|---|
| `README.md` | Yes | `D:\hehehe\GlobeX\README.md` |
| `globex_match_project_documentation.md` | **No** | Not found anywhere in repo (only self-referenced inside the pack's own master prompt). Treat as non-existent. |
| `model_endpoints.md` | Yes | `D:\hehehe\GlobeX\setup_markdown\model_endpoints.md` |
| `understanding_workflow.md` | Yes | `D:\hehehe\GlobeX\setup_markdown\understanding_workflow.md` |
| `how_to_run.md` | Yes | `D:\hehehe\GlobeX\setup_markdown\how_to_run.md` |

The pack assumes these live at repo root; three of the four actually live in `setup_markdown/`.

---

## 1. Component-by-component classification

### React/Vite frontend
- **Actual**: Full React 18 + TypeScript + Vite + Tailwind + shadcn app under `src/`, 22+ pages,
  `TradeGlobe.tsx` WebGL globe, marketplace/escrow/documents/trust/compliance component trees.
  Builds via `npm run build` (unverified — not executed in this audit).
- **Expected**: Same, per pack Phase 15 (must show CLEAR/REVIEW/BLOCKED/UNSUPPORTED/Stale/Source
  Unavailable states, gate escrow/payment on BLOCKED/REVIEW).
- **Missing**: No UI state machine implementing CLEAR/REVIEW/BLOCKED/UNSUPPORTED anywhere in
  `src/` (see §2 below — zero matches for those four tokens together in `src/`).
- **Broken**: None found structurally.
- **Mock/stub**: `src/components/compliance/ComplianceChecklistWidget.tsx` (lines 11–23, 41–43,
  83–86) — hardcoded product name, hardcoded "87/100 COMPLIANT" badge, hardcoded fake document
  hashes (`"8f4e...2b5d"` etc.), hardcoded "Verified"/"Uploaded" statuses. Not wired to any API
  call — no `fetch`/`axios`/react-query call inside the file.
- **Production-ready**: Component library, routing, layout, build tooling.
- **Evidence**: `src/App.tsx`, `src/components/compliance/ComplianceChecklistWidget.tsx`,
  `package.json`.

### FastAPI gateway
- **Actual**: `main.py` (root) assembles 7 routers (`trade_anomaly`, `hs_classifier`,
  `partner_discovery_api`, `counterparty_api`, `compliance_api`, `documents_api`,
  `marketplace_api`), CORS wide open (`allow_origins=["*"]`, `main.py` line 122, contradicting the
  code comment above it that lists specific origins), lifespan warm-up, `/health` endpoint.
- **Expected**: Same set of capabilities plus sanctions/RAG/transaction-gate/coverage endpoints
  per Phase 14.
- **Missing**: No `/transaction-gate`, no sanctions-screening endpoint, no `/coverage` at
  top level (only trade-anomaly-scoped `/api/trade-anomaly/coverage`), no source-freshness/data
  version fields in most responses.
- **Broken**: `main.py` line 190 checks `os.getenv("SUPABASE_KEY")` for DB status, but
  `.env.local.example` only documents `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`VITE_SUPABASE_*` — the
  var name `SUPABASE_KEY` is never defined in the example env, so DB "CONNECTED" status can never
  be reached from a copy of the example file (unverified whether this is intentional or a bug —
  flagged as inconsistency).
- **Mock/stub**: `/health` reports `"compliance_engine": "ACTIVE"` and `"counterparty_engine":
  "ACTIVE"` unconditionally (`main.py` lines 187–188) regardless of whether those subsystems are
  doing real work or returning seed/mock data — the health check does not distinguish real from
  stub.
- **Production-ready**: Router wiring, structured logging setup (`main.py` lines 46–51), lifespan
  model warm-up.
- **Evidence**: `main.py` (full file, 199 lines).

### PostgreSQL/Supabase integration
- **Actual**: 4 real SQL migrations under `backend/database/supabase/migrations/`:
  `20260822111809_initial_globex_schema.sql` (full enum + table schema for users, orgs, listings,
  trades, disputes, shipments, documents), `20260822120632_remove_blockchain_and_escrow.sql`
  (drops `blockchain_records` and `escrow_accounts` tables — 2 lines, entire file), a seed-data
  migration, and an n8n-integration-tables migration. `supabase/config.toml` present.
- **Expected**: Live schema backing trade/escrow/compliance workflows.
- **Missing**: No RLS policy files found in migrations directory beyond what's inline in the
  initial schema (unverified — would need full-file read of the 111809 migration, only first 150
  lines inspected). No dedicated compliance-decision or sanctions-screening tables/enums exist in
  the schema (enums found: `verification_status`, `trade_status`, `dispute_status`,
  `escrow_status`, `inspection_status` — no `compliance_decision_state` enum matching
  CLEAR/REVIEW/BLOCKED/UNSUPPORTED).
- **Broken**: The DB literally had blockchain/escrow tables added then dropped in the very next
  migration — schema churn evidence that escrow/blockchain was descoped from the DB layer while
  the frontend `escrowService.ts` still simulates it (see below).
- **Production-ready**: Core organizations/trades/documents schema.
- **Evidence**: `backend/database/supabase/migrations/20260822111809_initial_globex_schema.sql`,
  `backend/database/supabase/migrations/20260822120632_remove_blockchain_and_escrow.sql`.

### n8n workflows
- **Actual**: Two n8n JSON exports exist:
  1. Root: `GlobeXAI — Cross-Border B2B Trade Automation(1).json` — 51 nodes across 5 sections
     (sticky-note-delimited): (1) Analyze Trade webhook → HS Classifier → UN Comtrade → Market
     Opportunity → Counterparty Match/Risk → Compliance RAG → aggregate score → Postgres save →
     respond; (2) Create Trade webhook → fetch counterparty → Trade Service → **Smart Contract:
     Create Escrow (TESTNET)** HTTP call → Postgres save; (3) Document Uploaded webhook → OCR
     extraction → Document Verification (LLM) → compare fields → IF inconsistency → SHA-256 hash
     → **Blockchain Anchor (TESTNET)** HTTP call → Postgres; (4) Schedule → Poll Shipments →
     Shipment Tracking API → escrow condition check → **Smart Contract: Release Escrow (TESTNET)**
     → mark trade COMPLETED; (5) Schedule → Daily Ingest from UN Comtrade + WITS → normalize →
     store. Sanctions/KYB/transaction-gate nodes are **absent** from this pipeline — it goes
     straight from Compliance RAG to score aggregation with no gate/blocking node.
  2. `backend/brain/n8n/` holds 4 more workflow JSON files plus a `dump/` subfolder with 6
     additional exports (`globex_complete_webhook_workflow.json`,
     `globex_master_automation.workflow.json`, `globex_document_compliance_test_workflow.json`,
     etc.) and `supabase_schema_setup.sql` — evidence of iterative n8n development, not a single
     canonical workflow.
- **Expected** (Phase 16): `Input → HS6 → Market Opportunity → Forecast → Anomaly → Counterparty
  Match → Sanctions → Product Controls → KYB/Risk → Compliance RAG → Transaction Gate → Persist
  Audit → Frontend`.
- **Missing**: Sanctions node, Product Controls node, KYB/Risk node, Transaction Gate node — none
  present in the root workflow's 51 nodes. Escrow release nodes call **TESTNET** smart-contract
  HTTP endpoints against a service that (per code inspection below) does not exist as a real
  contract — likely calls out to nothing or a stub URL (unverified — would require inspecting the
  HTTP node's target URL, not captured in this pass).
- **Evidence**: `D:\hehehe\GlobeX\GlobeXAI — Cross-Border B2B Trade Automation(1).json`,
  `backend/brain/n8n/*.json`, `backend/brain/n8n/dump/*.json`.

### Dual-Head GRU partner discovery
- **Actual**: Real PyTorch implementation exists: `src/partner_discovery/forecasting.py` lines
  30–71 define `GRUMultiOutputForecaster` (shared GRU encoder, 2 output heads: log-demand and FOB
  price), with a full train/evaluate/benchmark pipeline (`train_and_evaluate_forecasting_models`,
  lines 214–319) comparing Naive, Moving-Average, Ridge, Random Forest, and the GRU. A trained
  checkpoint exists on disk at
  `backend/brain/brain_prev/models/partner_discovery/forecasting/gru_multi_output.pt` (and a
  duplicate at `.../partner_forecasting/gru_multi_output.pt`).
- **Broken (wiring)**: `src/api/partner_discovery_api.py` lines 32–33 hardcode
  `_MODEL_DIR = "backend/brain_temporary/models/partner_discovery/forecasting"`. **This directory
  does not exist anywhere in the repository** (confirmed via `find . -iname "brain_temporary*"` —
  zero results). `src/partner_discovery/inference.py` line 63 checks
  `os.path.exists(os.path.join(model_dir, "gru_multi_output.pt"))` before loading; since the path
  is wrong, this check always fails silently and the code falls through to the momentum heuristic
  fallback (`inference.py` lines 93–96: `fc_d = hist_avg_d * 1.05; fc_p = hist_avg_p`). **The
  trained GRU model is never loaded by the live API despite existing on disk** — every
  `/predict/market-opportunity` call in the current wiring uses a simple heuristic, not the GRU,
  even though the endpoint docstring (line 87) claims "generates GRU forecasts."
  `PartnerDataLoader` (`src/partner_discovery/data.py`) has its own independent fallback chain
  that does resolve to `backend/brain/processed/...` for the *data* (not the model), so the
  data-loading half degrades gracefully while the model-loading half silently never engages.
- **Expected**: Live GRU inference per Phase 4/11.
- **Evidence**: `src/api/partner_discovery_api.py:32-33`, `src/partner_discovery/inference.py:62-68,93-96`,
  `src/partner_discovery/forecasting.py:30-71,192-211`,
  `backend/brain/brain_prev/models/partner_discovery/forecasting/gru_multi_output.pt` (exists,
  architecture/training details unverified — requires runtime inspection).

### XGBoost anomaly detection
- **Actual**: `src/trade_anomaly/inference.py` `_discover_models_dir()` (lines 28–37) checks 3
  candidate paths in order, including `PROJECT_ROOT / "backend" / "brain" / "models" /
  "trade_anomaly"`, which **does exist** on disk with all required artifacts:
  `xgboost_anomaly_model.joblib`, `preprocessor.joblib`, `feature_list.json`,
  `model_metadata.json`, `threshold_config.json` (confirmed present at
  `backend/brain/models/trade_anomaly/`). This is the one ML subsystem whose wiring is verified
  correct — the discovery chain finds and loads the real artifact.
- **Expected**: Live XGBoost inference per Phase 5/11.
- **Missing**: Coverage of model calibration/thresholds vs. current data is unverified — requires
  runtime inspection.
- **Evidence**: `src/trade_anomaly/inference.py:28-40`, `src/trade_anomaly/api.py` (full file),
  `backend/brain/models/trade_anomaly/*.joblib,*.json` (files present, confirmed by Glob).

### GRU Autoencoder + Isolation Forest trade risk
- **Actual**: Artifacts present at `backend/brain/models/trade_risk/`: `gru_autoencoder.pt`,
  `isolation_forest.joblib`, `robust_scaler.joblib`, `risk_model_metadata.json`,
  `selected_features.json`. `src/api/counterparty_api.py` `_load_risk_models()` (lines 35–56)
  loads the **Isolation Forest + scaler** with a working 3-candidate path list that includes
  `backend/brain/models/trade_risk` and succeeds.
- **Missing/Broken**: `gru_autoencoder.pt` is present on disk but **no code in `src/` was found
  that loads or calls it** (no `gru_autoencoder` or `.pt` reference in `src/api/counterparty_api.py`
  beyond the Isolation Forest). The counterparty-risk endpoint's feature vector construction
  (`counterparty_api.py` lines 403–412) synthesizes only 5 proxy features (`log_trade_value` etc.
  derived from a fake `completed` trade count) into a `feat_len`-sized zero-padded array — this is
  a placeholder feature vector, not real trade behavioral data, even when the Isolation Forest
  model itself loads successfully. The GRU Autoencoder half of the "GRU Autoencoder + Isolation
  Forest ensemble" claimed in the pack and README is not wired into any live endpoint found.
- **Evidence**: `src/api/counterparty_api.py:35-56,398-425`, `backend/brain/models/trade_risk/`
  (files present via Glob). GRU autoencoder architecture/training unverified — requires runtime
  inspection of notebooks (`backend/brain/notebooks/trade_risk_complete.ipynb`).

### HS6 catalogue matching
- **Actual**: `src/api/hs_classifier.py` — pure catalogue lookup against the partner-discovery
  Parquet dataset (docstring line 7: "No external model inference required — purely
  catalogue-lookup driven"). Real, functioning, no ML claim to verify.
- **Evidence**: `src/api/hs_classifier.py:1-40`.

### Compliance/RAG
- **Actual**: `src/api/compliance_api.py` is a **fully deterministic, hardcoded lookup table**
  (`_TREATY_MAP`, lines 27–112) of 9 hand-entered bilateral treaty corridors (India-UAE CEPA,
  India-Singapore CECA, etc.) plus a generic MFN fallback. No retrieval, no vector store, no
  external source fetching, no citations to live regulatory data — despite the endpoint being
  named `/compliance/rag-analyze` and described as "RAG" in the README architecture diagram. There
  is no actual retrieval-augmented-generation happening; "RAG" is a naming artifact.
- **Missing entirely**: Sanctions screening, restricted-party screening, export/import control
  checks (SCOMET/DGFT ITC(HS)/BIS/OFAC/UN/EU/UK lists), KYB/beneficial-ownership checks, and the
  CLEAR/REVIEW/BLOCKED/UNSUPPORTED decision-state gate specified across Phases 4, 7, 8, 9, 11 of
  the pack. Confirmed via repo-wide grep: zero source files under `src/` or `backend/` (excluding
  the pack's own spec docs) implement a `CLEAR`/`REVIEW`/`BLOCKED`/`UNSUPPORTED` state machine;
  the only frontend hits are unrelated UI vocabulary (`sticky-banner.tsx`, `markdown.tsx`
  containing the word "review" in prose, `TrustBreakdownDrawer.tsx`, `RoleNavigation.tsx`) — none
  implement the 4-state compliance gate.
- **Evidence**: `src/api/compliance_api.py` (full file, 261 lines); grep results for
  `CLEAR|REVIEW|BLOCKED|UNSUPPORTED` across `src/` (5 files, none a compliance gate) and
  `OFAC|OpenSanctions|sanctions_screen|restricted.?party|SDN` across the repo (121 hits, all in
  the pack's own spec files, `backend/brain_prev/data_pipeline/scripts/download_ofac.py` /
  `download_opensanctions.py` / `normalize_sanctions.py` — **data-pipeline scripts that download
  raw sanctions source files but are not wired to any live API endpoint**, and
  `backend/brain_prev/data_pipeline/data/processed/sanctions_entities.csv` /
  `ofac_sdn_validated.csv` — static snapshot files under the deprecated `brain_prev/` tree, not
  the active `backend/brain/` tree).

### OCR/document verification
- **Actual**: `src/api/documents_api.py` `extract_document()` (lines 49–61) **unconditionally
  returns `status="STUB"`** with message "OCR extraction service is operating in stub mode" —
  regardless of input. No OCR library, no vision API call, nothing conditional. This directly
  contradicts the README's claim (line 28) of "Instant cross-reconciliation ... with cryptographic
  tamper-evident SHA-256 proofs" — SHA-256 hashing exists only in the n8n workflow's `Crypto`
  node and in the frontend's fake `escrowService.computeFileHash()` (real `crypto.subtle.digest`
  call, so the hashing itself is real), but the OCR extraction feeding it is a hardcoded stub.
- **Evidence**: `src/api/documents_api.py` (full file, 62 lines).

### Counterparty matching/risk
- **Actual**: `src/api/counterparty_api.py` has a real DB-query code path (psycopg2 against
  `organizations`/`trust_scores`/`trades` tables, lines 196–252) that only activates when
  `SUPABASE_URL` + `SUPABASE_KEY` env vars are set (`_db_available()`, lines 62–63). Without DB
  credentials it falls back to `_build_seed_counterparties()` (lines 122–144) — 7 hardcoded
  fictional organizations ("Al Dahra Agricultural", "Agri Star Exports Ltd", etc.) with
  deterministic MD5-hash-seeded fake trust/match scores. The fallback path is explicitly labeled
  `"data_source": "seed_data"` in the response, which is good practice (not misleading callers),
  but it is not real counterparty data.
- **Missing**: No KYB, no beneficial-ownership resolution, no sanctions cross-check before
  returning a "match."
- **Evidence**: `src/api/counterparty_api.py` (full file, 443 lines).

### Shipment/escrow workflows
- **Actual**: `src/services/blockchain/escrowService.ts` — every blockchain method
  (`anchorDocumentHash`, `releaseEscrowPayment`, `executeArbitrationVerdict`) is a client-side
  mock: `await new Promise((resolve) => setTimeout(resolve, 400-600))` followed by a
  **`Math.random()`-generated fake 64-hex-char transaction hash** (lines 46, 62, 82) and a
  hardcoded contract address (`0x789b91c491209bAcB28Da0a7C9d0F8372658A409`). No web3 library
  (ethers/viem/wagmi) import, no RPC call. This is corroborated by the DB layer: migration
  `20260822120632_remove_blockchain_and_escrow.sql` **dropped** `blockchain_records` and
  `escrow_accounts` tables from the schema — meaning escrow/blockchain persistence was actively
  removed from the database while the frontend service simulating it was left in place.
- **Expected**: "Programmable USDC Smart Escrow Vaults" (README line 27), "multi-sig smart
  contract vaults."
- **Missing entirely**: Any real smart contract, any real chain connection, any escrow table in
  the current schema.
- **Evidence**: `src/services/blockchain/escrowService.ts:1-99` (full mock implementation),
  `backend/database/supabase/migrations/20260822120632_remove_blockchain_and_escrow.sql` (2-line
  file, both DROP TABLE statements).

---

## 2. Greenfield-vs-brownfield signal checks

| Item | Present? | Evidence |
|---|---|---|
| Sanctions/restricted-party screening code (live, wired to an endpoint) | **No** | Only data-pipeline download scripts in deprecated `backend/brain/brain_prev/data_pipeline/scripts/download_ofac.py`, `download_opensanctions.py`, `normalize_sanctions.py` — not imported by any `src/api/*` router. |
| Compliance decision-state enum/gate (CLEAR/REVIEW/BLOCKED/UNSUPPORTED) | **No** | Zero implementation matches in `src/` or `backend/database` schema; concept exists only in the spec pack. |
| Tariff/HS6/current-fact data sources | **Partial** | `compliance_api.py`'s `_TREATY_MAP` is a static, hand-entered snapshot of 9 corridors with no source/version/retrieval-time metadata (no "authority, source, retrieval time, effective period, jurisdiction, version, status" fields required by pack Phase 7). |
| KYB/AML logic | **No** | No matches beyond pack spec files and unrelated UI text; DB schema has `verification_status`/`verification_document_type` enums (KYC-adjacent) but no ownership-graph or AML tables. |
| Transaction gate in front of trade/escrow/payment actions | **No** | n8n root workflow goes Compliance RAG → score aggregation → Postgres save with no gate/block node; no equivalent server-side gate found in `src/api/`. |
| Structured logging/observability | **Partial** | `main.py` sets up Python `logging` with a formatted pattern (lines 46-51) and per-router loggers; no request-ID propagation, no model/data-version logging beyond ad hoc fields in a few responses (`model_version` strings), no drift signals. Grep for `request_id`/`structlog`/`correlation_id` in `src/` returned zero matches. |
| Unit/integration/E2E test suites | **Thin** | `src/test/coreFlowAndAuth.test.tsx`, `src/test/example.test.ts` (Vitest, frontend only) and `globe/src/test/example.test.ts` (boilerplate). Python side has ad hoc diagnostic scripts (`scripts/test_hs_and_demand.py`, `scripts/test_proper_ranking.py`, `scripts/test_ranking_simulation.py`, `scripts/test_risk_gru_loading.py`, `scripts/test_supabase_connection.py`, `scripts/test_supabase_urllib.py`) that are runnable scripts, not confirmed to be pytest-discoverable assertions (unverified — requires running `pytest` to confirm pass/fail behavior). A separate, larger test suite exists only in the deprecated `backend/brain/brain_prev/tests/` (`test_partner_discovery_pipeline.py`, `test_ranking_engine.py`, `test_trade_anomaly.py`) — not part of the active tree. |
| Playwright config | **No** | No `playwright.config.*` file found anywhere in the repo. |
| CI config (`.github/workflows`) | **No** | No `.github` directory exists at repo root. |

---

## 3. `globe/` directory

`globe/` is a **separate, self-contained Vite+React+shadcn scaffold project** (its own
`package.json` name is `"vite_react_shadcn_ts"` — identical to the root project's package name,
suggesting it was the original generator template). It contains only a landing `Index.tsx` page
and its own copy of `TradeGlobe.tsx`/`GlobeTooltip.tsx`/`SidePanel.tsx`/`NavLink.tsx`. The main
application (`src/`) already has its own independent `src/components/TradeGlobe.tsx`, and nothing
under `src/App.tsx` or `src/pages/` imports from `../globe/`. Conclusion: **`globe/` is a
donor/reference prototype that was not wired into the production build** — evidence it predates
or was the source the main app's globe component was adapted from, then left in the repo
unintegrated.

Evidence: `globe/package.json:1-2`, `globe/src/App.tsx:1-25`, `src/components/TradeGlobe.tsx`
(exists independently), no `grep` match for an import path referencing `globe/` inside `src/`.

---

## 4. Notebooks and model artifacts inventory

**Active tree (`backend/brain/`, not `brain_prev/`):**
- `backend/brain/notebooks/01_destination_country_ranking_eda.ipynb`
- `backend/brain/notebooks/trade_anomaly_eda.ipynb`
- `backend/brain/notebooks/trade_anomaly_modeling.ipynb`
- `backend/brain/notebooks/trade_risk_complete.ipynb` and `trade_risk_complete - Copy.ipynb`
- `backend/brain/notebooks/intialedatradeanomaly` (no `.ipynb` extension — likely a misnamed/moved file, unverified)
- `.ipynb_checkpoints/` copies of the above 3

**Deprecated tree (`backend/brain/brain_prev/`)** carries a larger, separately-versioned set
including `partner_discovery_as_exporter_eda_and_model.ipynb` and
`partner_discovery_forecasting_model.ipynb` (this is where the partner-discovery GRU was actually
trained, per file layout) plus its own `models/`, `reports/`, `docs/`, `tests/`, `data_pipeline/`
trees — effectively a full previous-generation project nested inside the current one. The pack's
"never overwrite existing notebooks" rule (Phase 2) needs to account for **two parallel notebook
trees**, not one.

**Model artifacts (all `.pt`/`.pth`/`.pkl`/`.joblib`/`.onnx`/`.h5` in repo):**

Active (`backend/brain/models/`):
- `trade_anomaly/preprocessor.joblib`, `xgboost_anomaly_model.joblib` — **wired and loadable** (see §1).
- `trade_risk/gru_autoencoder.pt`, `isolation_forest.joblib`, `robust_scaler.joblib` — Isolation Forest **wired**; GRU autoencoder **not wired** to any endpoint found.
- No `partner_discovery` or `partner_forecasting` subfolder exists under active `backend/brain/models/` at all.

Deprecated (`backend/brain/brain_prev/models/`):
- `partner_discovery/forecasting/gru_multi_output.pt`, `gru_scaler_metadata.joblib`, `metadata.joblib`
- `partner_forecasting/gru_multi_output.pt`, `gru_scaler_metadata.joblib`, `metadata.joblib` (duplicate of above under a different folder name)
- `trade_anomaly/`, `trade_risk/` duplicates of the active artifacts

No `.onnx` or `.h5` files found anywhere in the repo.

Exact architectures/training periods/feature order beyond what's readable in the `.py` module
source (§1) are **unverified — requires runtime inspection** (loading the artifacts and
introspecting state dicts / metadata JSON contents was not performed in this static pass beyond
reading the JSON metadata files' existence).

---

## 5. requirements.txt / package.json / env template summary

- `requirements.txt`: FastAPI, uvicorn, pandas/numpy/scipy/pyarrow, xgboost, scikit-learn, joblib,
  torch, pydantic, httpx, psycopg2-binary, asyncpg, pytest/pytest-asyncio. No OCR library (no
  `pytesseract`, `easyocr`, `paddleocr`, cloud vision SDK), no sanctions/screening SDK, no
  LangChain/vector-store/RAG library — consistent with the "RAG" endpoint actually being a static
  lookup table.
- `package.json` (root): React 18, Vite 5, TypeScript, Tailwind, shadcn/Radix primitives,
  `react-globe.gl`, `three`, `recharts`, `zod`, no blockchain/web3 SDK (no ethers/viem/wagmi),
  consistent with escrow being a client-side mock. `test` script runs Vitest only; no Playwright
  dependency present.
- `.env.local.example`: documents FastAPI/n8n URLs, an **already-populated (not placeholder)**
  `OPENSANCTIONS_API_KEY=e8e3d3e28ccfa81c5b8f09e9fc500ab9` value (flagged — this looks like a real
  key committed in a tracked example file, not an obvious `your_key_here` placeholder; worth
  verifying/rotating before this repo is made public, though this audit does not confirm whether
  the key is live/valid), commented-out Supabase/Comtrade/WITS/blockchain/tracking/OCR variables
  (all optional, all commented out — meaning by default the app runs entirely in seed/stub mode).

---

## 6. Greenfield vs. brownfield by pack phase (Phase 2 through Phase 19)

| Phase | Groundwork that exists | New work required |
|---|---|---|
| 2 — Existing Notebook Rule | Two full notebook trees exist (`backend/brain/notebooks/` active, `backend/brain/brain_prev/notebooks/` deprecated) that must be preserved, not overwritten. | Establish which tree is canonical; reconcile duplicate/renamed notebooks (`trade_risk_complete.ipynb` vs `- Copy.ipynb`) before adding new ones. |
| 3 — Data + Model Audit | Real parquet/csv datasets in `backend/brain/data/`, `backend/brain/processed/`; real model metadata JSON files with feature lists/thresholds. | Full schema/leakage/chronology audit not yet performed; GRU partner-discovery model's exact training period/feature order not yet verified from metadata (present but unread in this pass). |
| 4 — Production Forecasting | Working `GRUMultiOutputForecaster` class and a 5-model benchmark harness (`forecasting.py`) already compares Naive/MA/Ridge/RF/GRU with MAE/RMSE/MAPE/directional accuracy — much of Phase 4's required rigor already exists in code. | Model is not live-wired (`brain_temporary` path bug, §1); needs re-pointing to the real artifact path and a walk-forward validation report. |
| 5 — Trade Anomaly | XGBoost model correctly wired and loadable; feature pipeline (`feature_pipeline.py`) and `models.py` exist. | Isolation Forest / GRU Autoencoder / TCN / Transformer benchmark suite for anomaly (per pack) not found for the anomaly subsystem specifically (only the risk subsystem has an Isolation Forest); heuristic-label-vs-fraud distinction not yet documented in code/comments. |
| 6 — Trade Risk | Isolation Forest wired; GRU Autoencoder artifact exists but unwired; risk dimensions (behavioural/corridor/counterparty/sanctions/compliance) are not yet separated in code — `counterparty_api.py` conflates trust score, dispute rate, and Isolation Forest anomaly into one composite score. | Wire GRU autoencoder; split risk dimensions per Phase 6; replace synthetic 5-feature proxy vector (§1) with real feature construction. |
| 7 — Current Facts | Nothing found — `_TREATY_MAP` in `compliance_api.py` is static and unsourced (no authority/retrieval-time/effective-period/version/status fields). | Full current-fact registry is greenfield. |
| 8 — Compliance | Nothing found — no CLEAR/REVIEW/BLOCKED/UNSUPPORTED gate exists anywhere in code or DB schema. | Fully greenfield: gate logic, screening integrations, decision-state enum, DB columns/tables. |
| 9 — Product/Export/Import Controls | Nothing found beyond the static NTM-barrier string lists inside `_TREATY_MAP`. | Fully greenfield: DGFT ITC(HS), SCOMET, destination import controls, licensing. |
| 10 — Ranking Backtest | `OpportunityRankingEngine` exists (`src/partner_discovery/ranking.py`, `src/ranking/ranking_engine.py`) with a separate `src/ranking/` module tree including `explainability.py`, `feature_engineering.py`, `ingestion.py`, `product_resolver.py` — substantial pre-existing ranking infrastructure. | Formal backtest report against the pack's required rigor not found; needs validation the two parallel ranking modules (`src/ranking/` vs `src/partner_discovery/ranking.py`) aren't diverged/duplicated logic. |
| 11 — Production Inference Contract | Partial: most endpoints return `model_version` and `analysis_id`; none consistently return `data_version`, `source_timestamp`, `evidence`, `decision_state`, `uncertainty`, or `coverage` together. | Contract standardization across all 7 routers. |
| 12 — UI Compliance Requirements | `ComplianceChecklistWidget.tsx` exists as a visual shell but is fully hardcoded/mocked, not connected to `compliance_api.py`. | Rebuild the widget against a real gate-state API; add BLOCKED/REVIEW/UNSUPPORTED/Stale/Source-Unavailable states and the "DEMO DATA — NOT LIVE COMPLIANCE" banner requirement (not found anywhere in `src/`). |
| 13 — Deployment Acceptance | `vercel.json`, `spa_server.py`, `vite.config.ts`, `vitest.config.ts` exist — basic deploy tooling present. | No CI (`.github/workflows` absent) to gate deployment; acceptance criteria from the pack not yet codified as automated checks. |
| 14 — Implementation Checklist | N/A (planning doc). | Use this audit as the checklist's evidentiary basis. |
| 15 — Source Verification Notes | N/A (planning doc). | — |
| 16 — Forecasting Production Pipeline | Training/benchmark code exists (`forecasting.py`). | Pipeline is not deployed correctly (path bug); no scheduled retraining/monitoring found. |
| 17 — Forecasting Model Card | `backend/brain/brain_prev/reports/partner_ranking_model_card.md` and `forecasting_model_comparison.md` exist in the deprecated tree. | Needs to be re-validated/updated against the currently active (bug-fixed) pipeline and moved/referenced from the active tree. |
| 18 — Trade Anomaly Production | XGBoost artifacts + inference service correctly wired (the most production-ready ML subsystem in the repo). | Calibration/threshold review, adversarial/failure-mode tests. |
| 19 — Trade Risk Production | Isolation Forest wired; GRU Autoencoder present but dormant. | Wire GRU autoencoder, separate risk dimensions, replace synthetic feature vector with real features. |

---

## Summary of hard findings (no speculation)

1. `globex_match_project_documentation.md` does not exist anywhere in the repository.
2. The Dual-Head GRU partner-discovery model exists on disk but is **never loaded** by the live
   API because `src/api/partner_discovery_api.py` points at a `backend/brain_temporary/...` path
   that does not exist; the API silently falls back to a momentum heuristic.
3. The GRU Autoencoder for trade risk exists on disk but no code path was found that loads or
   calls it; only the Isolation Forest half of the "ensemble" is wired.
4. `src/api/documents_api.py` unconditionally returns a stub — there is no OCR implementation.
5. `src/api/compliance_api.py` is a static hardcoded 9-corridor treaty lookup table, not RAG, not
   sanctions/restricted-party screening, and implements none of the CLEAR/REVIEW/BLOCKED/
   UNSUPPORTED gate states required by the pack.
6. `src/services/blockchain/escrowService.ts` fabricates all transaction hashes via
   `Math.random()` and simulates chain latency via `setTimeout` — there is no real blockchain
   integration, corroborated by the DB migration that dropped the escrow/blockchain tables.
7. `src/components/compliance/ComplianceChecklistWidget.tsx` is a fully hardcoded mock UI with a
   fake compliance score and fake document hashes, not connected to any API.
8. No CI (`.github/workflows`), no Playwright config, and no compliance-gate enum exist anywhere
   in the codebase.
9. The `.env.local.example` file (tracked in git) contains what appears to be a live, non-placeholder
   `OPENSANCTIONS_API_KEY` value.

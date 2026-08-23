# GlobeXAI Integration Resume — Task Checklist

This task list supersedes the interrupted integration task.

The repository has changed since the original task. Start from the CURRENT filesystem.

## Phase 0 — Recovery and Audit

- [ ] Read `integration_resume_prompt.md`.
- [ ] Read `integration_safety_rules.md`.
- [ ] Read `integration_architecture.md`.
- [ ] Run `git status --short`.
- [ ] Record current branch.
- [ ] Record recent commits.
- [ ] Create `docs/integration_recovery_log.md`.
- [ ] Inventory current frontend.
- [ ] Inventory current backend.
- [ ] Inventory current ML modules.
- [ ] Inventory current datasets.
- [ ] Inventory current model artifacts.
- [ ] Inventory current notebooks.
- [ ] Inventory current migrations.
- [ ] Inventory current n8n JSON.
- [ ] Inventory current environment files.

## Phase 1 — Model/Artifact Verification

- [ ] Locate Partner Discovery exporter dataset.
- [ ] Locate Partner Discovery processed Parquet.
- [ ] Locate destination-ranking features.
- [ ] Locate Partner Discovery forecasting model.
- [ ] Locate Trade Risk artifacts.
- [ ] Locate Trade Anomaly artifacts.
- [ ] Locate preprocessors/scalers.
- [ ] Locate model metadata.
- [ ] Confirm each artifact loads.
- [ ] Confirm model feature expectations.
- [ ] Confirm inference code matches artifacts.
- [ ] Do NOT retrain unless an artifact is missing/incompatible.
- [ ] If retraining is required, preserve existing artifacts first.

## Phase 2 — Backend Integration

- [ ] Locate existing FastAPI app/entry point.
- [ ] Do not create duplicate FastAPI apps.
- [ ] Integrate Trade Anomaly router.
- [ ] Integrate Partner Discovery/Ranking router.
- [ ] Add HS classifier only if missing.
- [ ] Add counterparty matching only if missing.
- [ ] Add counterparty risk only if missing.
- [ ] Add compliance endpoint only if missing.
- [ ] Add document OCR endpoint only if required.
- [ ] Add health endpoints.
- [ ] Add request/response validation.
- [ ] Add structured errors.
- [ ] Add model version metadata.
- [ ] Verify backend starts.

## Phase 3 — Database / ER Integration

- [ ] Inspect actual migrations.
- [ ] Compare schema with ER PNG.
- [ ] Inspect existing `trades`.
- [ ] Inspect `organizations`.
- [ ] Inspect `trade_documents`.
- [ ] Inspect `shipments`.
- [ ] Inspect `delivery_confirmations`.
- [ ] Inspect `trust_scores`.
- [ ] Inspect escrow/blockchain tables if present.
- [ ] Map old n8n table names to canonical tables.
- [ ] Create migration only for genuinely missing business state.
- [ ] Do not duplicate canonical entities.
- [ ] Create schema mapping documentation.

## Phase 4 — n8n Recovery

- [ ] Preserve original n8n JSON.
- [ ] Create reference backup.
- [ ] Inspect every workflow branch.
- [ ] Compare node URLs with actual backend endpoints.
- [ ] Compare node fields with actual API schemas.
- [ ] Compare SQL with actual database schema.
- [ ] Remove unresolved placeholders from required production paths.
- [ ] Use credentials/environment variables.
- [ ] Explicitly construct ML request bodies.
- [ ] Generate final importable workflow.
- [ ] Validate JSON syntax.
- [ ] Validate node connections.
- [ ] Validate expressions.
- [ ] Validate SQL.
- [ ] Validate webhook paths.
- [ ] Import into n8n if an instance is available.
- [ ] Test Analyze Trade workflow.
- [ ] Test Trade Creation workflow.
- [ ] Test Document Verification workflow.
- [ ] Test Shipment/Settlement workflow.
- [ ] Test Data Ingestion workflow where credentials permit.

## Phase 5 — Frontend

- [ ] Inspect existing `aiService.ts`.
- [ ] Inspect existing `workflowService.ts`.
- [ ] Inspect `TradeAnalysisPage.tsx`.
- [ ] Replace required mock calls with real APIs.
- [ ] Keep only controlled development fallback behavior.
- [ ] Align TypeScript interfaces with real responses.
- [ ] Add market opportunity display.
- [ ] Add anomaly/risk display.
- [ ] Add counterparty matching display.
- [ ] Add counterparty risk display.
- [ ] Add compliance result display.
- [ ] Add loading states.
- [ ] Add failure states.
- [ ] Add partial-result handling.
- [ ] Change fields only where integration requires it.
- [ ] Do not redesign unrelated UI.

## Phase 6 — Trade Lifecycle

- [ ] Verify trade creation payload.
- [ ] Verify organization/counterparty mapping.
- [ ] Verify trade persistence.
- [ ] Verify escrow creation.
- [ ] Verify document upload.
- [ ] Verify OCR/verification.
- [ ] Verify blockchain anchoring where configured.
- [ ] Verify shipment tracking.
- [ ] Verify escrow release conditions.
- [ ] Ensure testnet-only behavior unless production is explicitly configured.

## Phase 7 — Security

- [ ] Check frontend for exposed secrets.
- [ ] Check n8n JSON for secrets.
- [ ] Check logs for credentials.
- [ ] Check environment configuration.
- [ ] Verify organization/user authorization.
- [ ] Verify CORS.
- [ ] Verify external request validation.
- [ ] Verify no arbitrary user-controlled URL fetching.

## Phase 8 — End-to-End Test

Primary scenario:

`Export 1000 kg of basmati rice from India.`

- [ ] Frontend accepts trade intent.
- [ ] HS6 classification works.
- [ ] Market opportunity works.
- [ ] Destination ranking works.
- [ ] Trade risk/anomaly works.
- [ ] Counterparty matching works.
- [ ] Counterparty risk works.
- [ ] Compliance works.
- [ ] Aggregate result works.
- [ ] Result persists.
- [ ] Frontend renders result.
- [ ] User can select partner.
- [ ] Trade can be created.
- [ ] Escrow path is wired.
- [ ] Document workflow is wired.
- [ ] Shipment path is wired.
- [ ] Settlement path is wired where configured.

## Phase 9 — Verification

- [ ] Python syntax checks.
- [ ] Model loading checks.
- [ ] API health checks.
- [ ] API endpoint tests.
- [ ] Database verification.
- [ ] n8n workflow validation.
- [ ] n8n execution tests.
- [ ] Frontend build.
- [ ] Existing test suite.
- [ ] Playwright UI flow.

## Phase 10 — Documentation

- [ ] `docs/integration_inventory.md`
- [ ] `docs/n8n_integration_mapping.md`
- [ ] `docs/integration_verification.md`
- [ ] `docs/integration_decisions.md`
- [ ] `docs/integration_recovery_log.md`
- [ ] `globex_generated_n8n_workflow.md`
- [ ] `globex_integration_workflow.md`

## Final Gate

- [ ] No unnecessary model retraining.
- [ ] No duplicate FastAPI application.
- [ ] No fake successful API responses.
- [ ] No unresolved production placeholders.
- [ ] No exposed secrets.
- [ ] Original n8n JSON preserved.
- [ ] Final n8n JSON importable.
- [ ] Frontend uses real integration.
- [ ] Database mapping is consistent.
- [ ] End-to-end test completed or every external blocker explicitly documented.

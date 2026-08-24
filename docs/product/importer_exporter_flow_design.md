# Importer vs. Exporter Flow Differentiation — Design & Implementation

**Status:** design + partial implementation (this pass)
**Scope:** frontend flow differentiation and correct ML-model direction routing. No model/training code was touched.

Every capability below is labelled **[SERVABLE TODAY]** (a real model/endpoint exists and is
reachable with data that exists) or **[GAP]** (would require data or a model that does not exist
in this repo — documented, deliberately not faked).

---

## 1. Why this exists

`public.organizations.business_type` is a real Postgres enum (`EXPORTER`, `IMPORTER`, `BOTH`) —
`backend/database/supabase/migrations/20260822111809_initial_globex_schema.sql:27-29`. It also
exists in `src/types/trade.ts` and `src/data/mockTradeData.ts`. Before this pass it was used
**nowhere** to differentiate routing, navigation, or which backend model gets called.

The existing "role" concept (`OrganizationRole` in `src/services/appwrite/client.ts`,
`RoleNavigation.tsx`) is a **job title inside one organisation** — Admin, Compliance Officer,
Salesman, Arbitrator. That is an orthogonal axis. A compliance officer at an importing firm and a
compliance officer at an exporting firm have the same job title and completely different trade
direction. Overloading `role` to also mean direction is why the two flows were indistinguishable.

So: **`role` = what you do inside the org. `businessType` = which way goods flow.** They are
separate fields and this pass adds the second one.

---

## 2. Inventory: which ML assets are actually direction-aware

Verified by reading data and code, not assumed.

| Asset | Direction | Evidence |
|---|---|---|
| `src/trade_anomaly/` — anomaly / risk-behaviour detection | **Both** [SERVABLE TODAY] | `backend/brain/processed/trade_anomaly/02_trade_anomaly_featured.parquet` carries a real `trade_flow` column with values `Export` and `Import`; `aiService.predictTradeAnomaly()` and `POST /api/trade-anomaly/predict` already take `trade_flow` as a request parameter. |
| Compliance stack (`src/compliance/current_facts.py`, `entity_screening.py`, `transaction_gate.py`) | **Both** [SERVABLE TODAY] | Sanctions, tariff and licence facts key off corridor + HS6 + parties. Which side initiated the trade does not change them. |
| `src/partner_discovery/` — destination-country ranking (GRU) | **Exporter only** | Source dataset is `backend/brain/processed/01_partner_discovery_india_as_exporter.parquet`; feature columns are `exporter_iso3` / `export_value_usd`. |
| `src/api/counterparty_api.py` — counterparty match | **Exporter only** | Own docstring: `POST /predict/counterparty-match — find verified export counterparties`. It finds **buyers for India's exports**. |
| Trade-risk (Isolation Forest / retired GRU autoencoder) | corridor-based, neither | Not a strong asset in its current state for either flow. |

**Directory listing re-verified this pass.** `backend/brain/processed/` contains exactly:
`01_partner_discovery_india_as_exporter.parquet`, `destination_country_ranking_features.csv`,
`destination_country_ranking_features.parquet`, and `trade_anomaly/`. There is **no**
foreign-exporter-to-India flow dataset anywhere under `backend/brain/processed/`.

---

## 3. The exporter flow (screen by screen)

1. **Command Center** (`/dashboard`) — outbound contracts, revenue at risk, buyer-side settlement
   state. [SERVABLE TODAY]
2. **Market Discovery** (`/marketplace`) — "where should I sell this?" Destination-country ranking
   via `aiService.rankMarketOpportunity()` backed by the `partner_discovery` GRU. **This is the one
   screen with a genuinely exporter-specific model behind it.** [SERVABLE TODAY]
3. **Counterparty match** (`/counterparties`) — find verified overseas buyers.
   `POST /predict/counterparty-match`. [SERVABLE TODAY]
4. **Trade Analysis** (`/trade-analysis`) — full intake pipeline with `trade_flow = "Export"`:
   the anomaly model scores this as an *outbound sale* (is this sale price/quantity unusual for
   this corridor?). [SERVABLE TODAY]
5. **Compliance screening, documents, settlement, disputes** — shared, see section 5.

## 4. The importer flow (screen by screen)

1. **Command Center** (`/dashboard`) — inbound purchase contracts, landed cost, supplier-side
   settlement state. [SERVABLE TODAY] (same page, inbound framing and inbound data)
2. **Supplier Discovery** (`/marketplace`) — "who can supply me this, and from where?"
   **[GAP — see section 6].** The exporter destination-ranking model answers the opposite question
   and must not be shown here. The importer sees an honest not-yet-modelled state plus the
   direction-agnostic listing browser, which *is* real.
3. **Trade Analysis** (`/trade-analysis`) — same pipeline with `trade_flow = "Import"`: the anomaly
   model scores this as an *inbound purchase* (is this supplier's price/quantity unusual for goods
   entering India on this corridor?). **Same model, real parameter, genuinely different question.**
   [SERVABLE TODAY]
4. **Compliance screening, documents, settlement, disputes** — shared, see section 5.

Note the asymmetry is honest: the importer flow is currently *shorter* than the exporter flow,
because one of the exporter's steps has no importer-side equivalent yet. Padding it out with a
relabelled exporter model would make the product look symmetric and be wrong.

---

## 5. What is legitimately shared (and must NOT be forked into two implementations)

These screens are direction-agnostic by nature. They take a corridor, an HS6, and two parties.
Duplicating them into `ImporterCompliancePage` / `ExporterCompliancePage` would be two copies of
one behaviour drifting apart.

- **Compliance screening / transaction gate** (`/compliance/transaction-gate`, entity screening,
  current-facts) — sanctions and tariff facts do not care who initiated.
- **Document verification** (`/documents`) — a bill of lading is verified the same way in both
  directions.
- **Settlement / escrow** (`/escrow`), **blockchain ledger** (`/blockchain`).
- **Dispute resolution** (`/disputes`) — arbitration is symmetric.
- **`trade_anomaly`** — one model, one endpoint, one call site; the *parameter* differs, not the code.

The rule applied: **fork the question, share the machinery.**

---

## 6. [GAP] Importer-side supplier / market discovery

**What is missing:** a model answering "which countries can reliably supply me HS6 X, at what
price, with what supply risk?"

**Why it cannot be built today:** it needs foreign-exporter to India trade flows with the ranking
features computed from India's *importing* perspective (source-country supply capacity, supply
concentration/HHI, price volatility on the inbound leg, lead-time reliability). No such dataset
exists in `backend/brain/processed/` or `backend/brain/brain_prev/`.

**What was explicitly NOT done:** the exporter model's output was not relabelled as supplier
recommendations. `partner_discovery` ranks *destinations for Indian exports*. Presenting that to
an importer as sourcing advice would be presenting India-as-exporter market data as an answer to a
question it never modelled — fabrication of exactly the kind this project forbids elsewhere.

**What ships instead:** an explicit "Supplier discovery — not yet modelled" state on the importer's
discovery step, naming the missing dataset. The importer still gets the real listing browser and
the real anomaly + compliance checks.

**To close the gap:** ingest a partner-side flows dataset (e.g. UN Comtrade with India as reporter
on the import leg), recompute the ranking features from the importing perspective, and train a
sibling of the `partner_discovery` GRU. Until then this stays a gap.

Also a **[GAP]**: supplier-matching counterparty search. `counterparty_api.py` finds buyers, not
suppliers. Same treatment — not faked.

---

## 7. What was implemented this pass

1. **`businessType` on the session.** `src/services/appwrite/client.ts` — added
   `BusinessType = "EXPORTER" | "IMPORTER" | "BOTH"` (string-identical to the Postgres enum),
   a `businessType` field on `UserSession` and on `DEFAULT_USER`, `setBusinessType()`, and a
   migration for already-persisted localStorage sessions that predate the field. `register()` and
   `login()` accept an optional `businessType`. No new auth system was invented; the existing mock
   store was extended, as instructed.

2. **Direction as first-class context.** `src/context/WorkspaceContext.tsx` now exposes
   `businessType`, `setBusinessType`, `activeDirection: "Export" | "Import"`, and
   `setActiveDirection`. `EXPORTER` pins Export, `IMPORTER` pins Import, `BOTH` is user-toggleable
   and persisted to `localStorage`. **`activeDirection` is the single source of truth for
   `trade_flow`.**

3. **Fixed a real hardcoding bug.** `src/pages/TradeAnalysisPage.tsx` sent
   `trade_flow: "Export"` unconditionally in its workflow payload, and passed a hardcoded
   `role: "exporter"` into `analyzeTradeIntake()` — which is exactly what derives `trade_flow` for
   the anomaly model (`aiService.ts`, `payload.role === "exporter" ? "Export" : "Import"`). An
   importer therefore ran the anomaly model against the wrong flow. Both now come from
   `activeDirection`. The `trade_anomaly` model itself was not touched; it always accepted this
   parameter — only the caller was wrong.

4. **Importer discovery no longer calls the exporter model.**
   `src/pages/MarketplacePage.tsx` gated the `aiService.rankMarketOpportunity()` call on
   `activeDirection === "Export"`. Importers get the honest gap panel from section 6 instead. The
   listing browser below it is unchanged and shown to both.

5. **Direction-aware lifecycle labels.** `src/components/layout/CoreFlowSidebar.tsx` labels its
   steps by direction ("Market Discovery" vs "Supplier Discovery", "Buyer Requests" vs
   "Purchase Orders", and so on). Routes are identical — only the naming reflects direction, so
   there is no duplicated routing table.

6. **Not changed, deliberately:** compliance, documents, escrow, disputes, blockchain. Shared per
   section 5.

---

## 8. Known limitations of this pass

- `businessType` lives only in the mock session store. It is **not** yet read from
  `organizations.business_type` in Postgres — there is no live org fetch to read it from.
- Dashboard inbound/outbound contract lists are still static mock arrays
  (`DashboardPage.tsx`); direction now drives *framing and default view*, not data provenance.
- The `role` (job title) axis and the `businessType` axis are independent and their full
  cross-product is not designed. Only direction is.

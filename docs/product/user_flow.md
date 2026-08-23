# GlobeXAI — User Flow & Information Architecture

**Date:** 2026-08-23
**Branch:** `dataset` @ `e147087`
**Source of truth:** `src/App.tsx` (route table), `src/components/layout/CoreFlowSidebar.tsx` (canonical lifecycle), `src/components/layout/Navbar.tsx` + `RoleNavigation.tsx` (entry points), `src/components/common/CommandPalette.tsx` (command-palette targets).

**Scope and honesty note.** This document describes the routes that **actually exist today**, not an idealised target IA. Purpose, entry points, CTAs, data sources and API dependencies are read directly out of the components. Loading / empty / error / blocked states are reported as they exist in code — and where a page has no such state at all, that is recorded as a gap rather than described aspirationally. Anything that genuinely cannot be determined from source (exact rendered behaviour, visual regressions, real-device timing) is marked **TODO — needs UI inspection** and would require a live Playwright session, which is out of scope for this pass.

> **Layout warning.** On `origin/main`, commit `4033f3c` ("Created frontend folder and moved files into it") relocated the entire frontend to `frontend/src/…`. All paths in this document are `dataset` paths (`src/…`). See `reports/production/current_state_reconciliation.md` §1a — this must be reconciled before further frontend work.

---

## 1. The canonical lifecycle

`CANONICAL_CORE_FLOW_ITEMS` in `src/components/layout/CoreFlowSidebar.tsx` defines six steps, rendered as the persistent "Trade Lifecycle" rail:

| # | Step | Target route | Status |
|---|---|---|---|
| 0 | Command Center | `/dashboard` | Route exists |
| 1 | Trade Discovery | `/marketplace` | Route exists |
| 2 | Trade Requests | `/trade-requests` | Route exists — **static data** |
| 3 | Active Trades | `/trades/TRD-IND-UAE-550K` | **Hardcoded demo ID — no index route** |
| 4 | Documents | `/documents` | Route exists — **demo data** |
| 5 | Settlement | `/escrow` | Route exists — **no backing implementation** |

The sidebar's `getActiveIndex()` also *absorbs* routes that are not lifecycle steps, mapping them onto the nearest step:

```
step 1 (Discovery)  <- /marketplace, /my-listings, /export-catalog,
                       /market-intelligence, /trade-analysis
step 2 (Requests)   <- /trade-requests, /trade-intent, /get-started
step 3 (Active)     <- /trades/*, /counterparties/*, /shipments
step 5 (Settlement) <- /escrow, /blockchain, /disputes, /arbitrator
```

This absorption map is the best available statement of intended IA, and §4 uses it to judge which routes are redundant.

---

## 2. Complete route inventory (27 `<Route>` declarations, 23 distinct components)

From `src/App.tsx:71-99`. All pages are `React.lazy` except `LandingPage`, which is eager for first paint.

| Route | Component | Lifecycle step | Note |
|---|---|---|---|
| `/` | `LandingPage` | — (public) | Eager-loaded |
| `/onboarding` | `OnboardingPage` | — (auth) | |
| `/role-select` | `OnboardingPage` | — (auth) | **Alias of `/onboarding`** |
| `/signup` | `OnboardingPage` | — (auth) | **Alias of `/onboarding`** |
| `/login` | `AuthPage` | — (auth) | |
| `/get-started` | `TradeIntentWizardPage` | 2 | **Alias** |
| `/trade-intent` | `TradeIntentWizardPage` | 2 | **Alias** |
| `/trade-requests` | `TradeIntentWizardPage` | **2 — canonical** | |
| `/dashboard` | `DashboardPage` | **0 — canonical** | |
| `/marketplace` | `MarketplacePage` | **1 — canonical** | |
| `/marketplace/:id` | `ProductDetailPage` | 1 | |
| `/create-listing` | `CreateListingPage` | 1 | Not in lifecycle rail |
| `/my-listings` | `MyListingsPage` | 1 | |
| `/export-catalog` | `MyListingsPage` | 1 | **Alias of `/my-listings`** |
| `/market-intelligence` | `MarketIntelligencePage` | 1 | |
| `/trade-analysis` | `TradeAnalysisPage` | 1 | |
| `/trades/:id` | `TradeWorkspacePage` | **3 — canonical** | No index route |
| `/counterparties/:id` | `CounterpartyDetailPage` | 3 | No index route |
| `/documents` | `DocumentVerificationPage` | **4 — canonical** | |
| `/escrow` | `EscrowPage` | **5 — canonical** | |
| `/shipments` | `ShipmentsPage` | 3 | |
| `/disputes` | `DisputesPage` | 5 | |
| `/arbitrator` | `DisputesPage` | 5 | **Alias of `/disputes`** |
| `/blockchain` | `BlockchainLedgerPage` | 5 | |
| `/admin` | `AdminSystemPage` | — (ops) | |
| `/wishlist` | `WishlistPage` | — (unmapped) | Falls through to step 0 |
| `*` | `NotFound` | — | |

**Six routes are pure aliases** rendering an identical component with no differentiating prop: `/role-select`, `/signup`, `/get-started`, `/trade-intent`, `/export-catalog`, `/arbitrator`.

### Global route-level states (real, in `src/App.tsx`)

- **Loading:** `RouteFallback` (`App.tsx:49-62`) — a single app-wide Suspense fallback: pulsing emerald dot, "Loading workspace…". Applies to every lazy route. There is no per-route skeleton.
- **Error:** `ErrorBoundary` (`src/components/layout/ErrorBoundary.tsx`) wraps the tree. **TODO — needs UI inspection:** what it actually renders on catch was not read this pass.
- **Blocked/auth:** **none.** There is no `<ProtectedRoute>`, no auth guard, no redirect-to-login wrapper anywhere in the route table. Every route including `/admin` is directly reachable by URL. See §5.

---

## 3. Per-route detail

Legend: **[VERIFIED]** read from source · **[GAP]** does not exist in code · **[TODO]** needs live UI inspection.

---

### `/` — Landing Page
`src/pages/LandingPage.tsx` (227 LOC, eager)

| Field | Value |
|---|---|
| **Purpose** | Public marketing entry; explains the platform and drives sign-up. |
| **Entry points** | Direct URL; logo `to="/"` in `Navbar.tsx:87` and `RoleNavigation.tsx:111`; CommandPalette "Home" (`:172`). |
| **Previous page** | None (root). |
| **Next page** | `/onboarding`, `/login`. |
| **Primary CTA** | **[TODO]** — CTA targets not enumerated this pass. |
| **Secondary CTA** | **[TODO]** |
| **Required data** | None — static marketing content plus animated components (`LiveTradeActivityTicker`, `SequencedTradeSimulator`, `GSAPLifecycleTracer`). |
| **API dependency** | **None.** `LiveTradeActivityTicker.tsx:18` renders a hardcoded `LIVE_EVENTS` array — the ticker is *named* "Live" but is a static loop. |
| **Loading** | N/A (eager). |
| **Empty / Error / Blocked** | N/A. |

---

### `/dashboard` — Command Center (lifecycle step 0)
`src/pages/DashboardPage.tsx` (742 LOC)

| Field | Value |
|---|---|
| **Purpose** | Post-login overview: active trade status, alerts, lifecycle position. |
| **Entry points** | Navbar "Dashboard" (`Navbar.tsx:41`), RoleNavigation (`:64`), CoreFlowSidebar step 0, CommandPalette (`:68`), post-onboarding redirect. |
| **Previous page** | `/onboarding`, `/login`, or any page via nav. |
| **Next page** | `/marketplace` (step 1), `/trades/:id`. |
| **Primary CTA** | **[TODO]** — 742 LOC not fully enumerated. |
| **Required data** | `FLAGSHIP_DEMO_TRADE` from `@/data/mockTradeData` (`:4`). |
| **API dependency** | **[VERIFIED] None.** Zero `fetch`/`useQuery`/`aiService` call sites in the file. The Command Center is entirely static demo data. |
| **Loading** | **[GAP]** No `isLoading` state — nothing async to load. |
| **Empty** | **[GAP]** Cannot be empty; the demo trade is always present. A real user with zero trades has no represented state. |
| **Error** | **[GAP]** One `error` token in file; no error path (nothing can fail). |
| **Blocked** | **[GAP]** No auth guard. |

---

### `/marketplace` — Trade Discovery (lifecycle step 1)
`src/pages/MarketplacePage.tsx` (413 LOC)

| Field | Value |
|---|---|
| **Purpose** | Discover export/import opportunities; run AI destination-ranking on a commodity + quantity. |
| **Entry points** | Navbar "Global Marketplace" (`:42`), RoleNavigation (`:65`), CoreFlowSidebar step 1, CommandPalette (`:76`), redirect after `CreateListingPage` submit. |
| **Previous page** | `/dashboard`, `/create-listing`. |
| **Next page** | `/marketplace/:id`, `/trade-requests`. |
| **Primary CTA** | "Discover destinations" → `handleDiscoverDestinations()` (`:80`) → `aiService.rankMarketOpportunity(product, qty, regime, 6)` (`:87`). |
| **Secondary CTA** | Category filter (`CATEGORIES`, `:36`), quick-commodity chips (`QUICK_COMMODITIES`, `:46`) — both hardcoded, correctly so (they are taxonomy, not data). |
| **Required data** | Commodity string + quantity from user input; `MARKET_OPPORTUNITY_COUNTRIES` (demo) via `MarketplaceBento`. |
| **API dependency** | **[VERIFIED]** `aiService.rankMarketOpportunity` → `POST /predict/market-opportunity`. **Note:** backed by the retired forecast GRU (`reports/production/phase4_forecasting_verdict.md`). `aiService` now labels responses `dataSource: "live" \| "fallback"` after this session's fix. |
| **Loading** | **[VERIFIED]** One `isLoading` state gating the discover action. |
| **Empty** | **[TODO]** No `No results`/`empty` token found; behaviour on a zero-recommendation response needs UI inspection. |
| **Error** | **[VERIFIED]** One `catch` block, two `error` references. Because `aiService` falls back to demo data rather than throwing, the user-visible error path is probably unreachable — the honest `dataSource` label added this session is **not yet rendered in any UI** (`docs/tasks.md` Phase 5, "Add market opportunity display", still unchecked). **This is the top-priority UI gap.** |
| **Blocked** | **[GAP]** No auth guard. |

---

### `/marketplace/:id` — Product Detail
`src/pages/ProductDetailPage.tsx` (115 LOC)

| Field | Value |
|---|---|
| **Purpose** | Single listing detail + exporter profile. |
| **Entry points** | Card click from `/marketplace`. |
| **Previous page** | `/marketplace`. |
| **Next page** | `/trade-requests`, `/counterparties/:id`, `/wishlist`. |
| **Primary CTA** | **[TODO]** — likely "Create trade request"; not confirmed. |
| **Required data** | `TOP_10_TRUSTED_PARTNERS` from mock data (`:4`). |
| **API dependency** | **[VERIFIED] None.** |
| **Loading / Error** | **[GAP]** Neither exists — data is a synchronous import. |
| **Empty** | **[GAP]** An `:id` not present in the demo array has no handled state. **[TODO]** confirm whether it renders blank or throws. |

---

### `/create-listing` — Create Export Listing
`src/pages/CreateListingPage.tsx` (415 LOC)

| Field | Value |
|---|---|
| **Purpose** | Publish a new export product listing. |
| **Entry points** | Navbar "Create Listing" (`:43`), RoleNavigation (`:66`, `:74`). |
| **Previous page** | `/my-listings`, `/marketplace`, `/dashboard`. |
| **Next page** | `/marketplace` — hard `navigate("/marketplace")` on submit (`:104`). |
| **Primary CTA** | "Publish" → `handleSubmit` (`:62`). |
| **Secondary CTA** | "Back to marketplace" (`:126`). |
| **Required data** | Form fields; `title`, `hsCode`, `originPort` are required (`:65`). |
| **API dependency** | **[VERIFIED] NONE — and this is a defect.** `handleSubmit` calls `addListing(newListing)` → `WorkspaceContext.handleAddListing` → `localStorage["globex_listings"]` (`WorkspaceContext.tsx:44-52`), then fires `toast.success("Product listing published successfully!")`. Nothing is POSTed; `public.listings` is never written; no other user or device will ever see it. **"Published" is false.** |
| **Also** | Every listing is stamped with hardcoded `trustScore: 95, riskScore: 12, aiMatchScore: 94, isTopTrusted: true` (`:93-97`). On a trade-compliance platform a fabricated trust score is a serious honesty defect — same class as the fake-success bugs already fixed this session. |
| **Loading** | **[GAP]** Submit is fully synchronous — no pending state, because there is no request. |
| **Error** | **[VERIFIED]** Validation only: `toast.error("Please fill in all required fields.")` (`:66`). No network-error path exists. |
| **Empty / Blocked** | N/A / **[GAP]** no auth guard — anyone can "publish". |

---

### `/my-listings` (+ alias `/export-catalog`) — My Export Listings
`src/pages/MyListingsPage.tsx` (507 LOC)

| Field | Value |
|---|---|
| **Purpose** | Manage the organisation's export catalogue. |
| **Entry points** | Navbar (`:44`), RoleNavigation (`:75`), CommandPalette (`:104`). |
| **Previous / Next** | `/dashboard` · `/create-listing`, `/marketplace`. |
| **Primary CTA** | "Add product" → `showAddModal` (`:124`), an in-page modal writing to local state. |
| **Secondary CTA** | Category filter (`:117`), search (`:123`). |
| **Required data** | **[FINDING]** `INITIAL_ORG_PRODUCTS` (`:39`) — a hardcoded array with **no** `DEMO_`/`MOCK_` prefix and no mock-module import, loaded into `useState` (`:121`). It reads as the org's real catalogue. |
| **API dependency** | **[VERIFIED] None.** |
| **Loading / Empty / Error** | **[GAP] All three absent** — zero `isLoading`, `empty`, `catch`, or `error` tokens in 507 lines. |
| **Blocked** | **[GAP]** No auth guard, and no organisation scoping — "my" listings are the same array for every user. |

---

### `/trade-requests` (+ aliases `/get-started`, `/trade-intent`) — Trade Requests (lifecycle step 2)
`src/pages/TradeIntentWizardPage.tsx` (401 LOC)

| Field | Value |
|---|---|
| **Purpose** | Review inbound RFQs addressed to the organisation; accept/decline. |
| **Entry points** | Navbar (`:45`, `:54`), RoleNavigation (`:67`), CoreFlowSidebar step 2, CommandPalette (`:92`), plus the two aliases. |
| **Previous / Next** | `/marketplace`, `/dashboard` · `/trades/:id`. |
| **Primary CTA** | Review an RFQ → `selectedReviewRfq` drawer (`:119`). |
| **Secondary CTA** | Status filter (`:118`). |
| **Required data** | **[FINDING]** `INBOUND_REQUESTS_DATA` (`:43`) — hardcoded, unlabeled, into `useState` (`:117`). |
| **API dependency** | **[VERIFIED] None.** **This is the most consequential gap in the product:** step 3 of 6 in the canonical lifecycle — the point where a trade is actually agreed — is a static array. Accept/decline mutates local state only and reaches no backend. |
| **Loading / Empty / Error** | **[GAP] All three absent** — zero relevant tokens in 401 lines. |
| **Blocked** | **[GAP]** No auth guard, no org scoping. |

---

### `/trades/:id` — Trade Workspace (lifecycle step 3)
`src/pages/TradeWorkspacePage.tsx` (390 LOC)

| Field | Value |
|---|---|
| **Purpose** | Operate a single active trade — tabbed workspace over documents, escrow, shipment. |
| **Entry points** | CoreFlowSidebar step 3, Navbar "Workspace" (`:46`, `isLive: true`), RoleNavigation "Active Trades" (`:68`) — **all three hardcode `/trades/TRD-IND-UAE-550K`**. |
| **Previous / Next** | `/trade-requests`, `/dashboard` · `/documents`, `/escrow`, `/shipments`. |
| **Primary CTA** | Tab switching (`TABS`, `:35`). |
| **Required data** | `FLAGSHIP_DEMO_TRADE` (`:3`) — ignores the `:id` param. |
| **API dependency** | **[VERIFIED] None.** A real persistence layer exists (`src/api/trades_api.py`, live-verified against local Supabase) but **no frontend route consumes it.** The backend/frontend integration for the lifecycle's centre is unwired. |
| **Loading / Error** | **[GAP]** Neither. |
| **Empty** | One `empty` token — **[TODO]** confirm what it gates. |
| **Blocked** | **[GAP]** No auth guard; any user can open any trade ID and see the same demo trade. |

---

### `/documents` — Document Verification (lifecycle step 4)
`src/pages/DocumentVerificationPage.tsx` (23 LOC — thin `AppShell` + `PageHeader` + `DocumentVerificationStudio`)

| Field | Value |
|---|---|
| **Purpose** | Upload trade documents; SHA-256 hashing and integrity verification. |
| **Entry points** | RoleNavigation (`:69`), CoreFlowSidebar step 4, CommandPalette (`:112`). |
| **Previous / Next** | `/trades/:id` · `/escrow`. |
| **Primary CTA** | Inside `DocumentVerificationStudio` — **[TODO]**. |
| **Required data** | `DEMO_TRADE_DOCUMENTS` (`DocumentVerificationStudio.tsx:3`). |
| **API dependency** | **[VERIFIED] None from the frontend.** Real endpoints exist and were live-tested (`trades_api.py` document upload, hash verification, `AUTHENTIC`/`TAMPERED` detection) — but the page does not call them. |
| **[FINDING] False status badge** | Header renders `StatusBadge status="verified" label="On-Chain Hash Anchoring Active"` unconditionally, while `.env` has `BLOCKCHAIN_ANCHORING_ENABLED=false` and `trades_api.py:262` returns `501 ANCHORING_DISABLED`. The backend is honest; the UI contradicts it. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None at page level; **[TODO]** for the Studio component. |

---

### `/escrow` — Settlement (lifecycle step 5)
`src/pages/EscrowPage.tsx` (23 LOC — thin wrapper over `CryptoEscrowCard`)

| Field | Value |
|---|---|
| **Purpose** | Terminal lifecycle step — settle payment against verified delivery. |
| **Entry points** | RoleNavigation "Smart Escrow Vault" (`:76`), CoreFlowSidebar step 5, CommandPalette (`:132`). |
| **Previous / Next** | `/documents` · terminal (or `/disputes`). |
| **Primary CTA** | Inside `CryptoEscrowCard` — **[TODO]**. |
| **Required data** | `DEMO_ESCROW_CONTRACT` (`CryptoEscrowCard.tsx:3`). |
| **API dependency** | **[VERIFIED] None.** |
| **[FINDING — highest severity] The page advertises a capability that does not exist** | Header text, verbatim: title "Programmable Smart Escrow"; subtitle "Multi-sig EVM smart contracts enforce conditional payment releases upon document verification and GPS port geofence entry"; badge `status="verified" label="USDC Smart Vault Active"`. Reconciled against verified fact: **`TradeLedger.sol` contains no `payable`, no `msg.value`, and no deposit/release/refund — there is no escrow in the contract at all.** There is no multi-sig, no USDC, no geofence, and no vault. A green "verified / Active" badge asserts all four are live. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None. |

---

### `/shipments` — Shipment Telemetry
`src/pages/ShipmentsPage.tsx` (23 LOC — thin wrapper over `ShipmentTracker`)

| Field | Value |
|---|---|
| **Purpose** | Track vessel/container movement for active trades. |
| **Entry points** | RoleNavigation (`:77`), CommandPalette (`:140`). Absorbed into lifecycle step 3. |
| **Required data** | `DEMO_SHIPMENT_EVENT` (`ShipmentTracker.tsx:2`). |
| **API dependency** | **[VERIFIED] None.** |
| **[FINDING] False status badge** | `status="in_transit" label="AIS Live Satellite Connected"` + subtitle claiming "AIS satellite tracking … live speed, heading, and container temperature monitoring". No AIS integration exists anywhere in the repository. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None. |

---

### `/disputes` (+ alias `/arbitrator`) — Dispute Resolution
`src/pages/DisputesPage.tsx` (23 LOC — thin wrapper over `DisputeResolutionSuite`)

| Field | Value |
|---|---|
| **Purpose** | Human-in-the-loop arbitration over trade disputes. |
| **Entry points** | RoleNavigation (`:78`), CommandPalette (`:148`), `/arbitrator`. |
| **Required data** | `DEMO_DISPUTES` (`DisputeResolutionSuite.tsx:3`). |
| **API dependency** | **[VERIFIED] None.** |
| **Badge** | `status="warning" label="Human-in-the-Loop Protocol"` — a process descriptor, not a false liveness claim. Acceptable. |
| **Note** | `/arbitrator` renders the identical component with no role differentiation, despite implying a distinct arbitrator persona. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None — including no arbitrator role check. |

---

### `/blockchain` — Audit Ledger
`src/pages/BlockchainLedgerPage.tsx` (23 LOC — thin wrapper over `PublicTradeLedgerTable`)

| Field | Value |
|---|---|
| **Purpose** | Public on-chain evidence trail of anchored document hashes. |
| **Entry points** | RoleNavigation (`:79`), CommandPalette (`:156`). |
| **Required data** | `DEMO_AUDIT_LOGS` (`PublicTradeLedgerTable.tsx:2`). |
| **API dependency** | **[VERIFIED] None.** A real chain adapter runs on `127.0.0.1:3001` against a local Hardhat node on `:8545`, with a genuine verified anchor transaction — the page does not read from it. |
| **[FINDING] False status badge** | `status="verified" label="Ethereum Sepolia Live"`. **Nothing has ever touched Sepolia.** All real chain work was on a local Hardhat node, and anchoring is disabled. The subtitle additionally claims "escrow locks" are anchored — see `/escrow`: escrow does not exist. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None. |

---

### `/counterparties/:id` — Counterparty Detail
`src/pages/CounterpartyDetailPage.tsx` (106 LOC)

| Field | Value |
|---|---|
| **Purpose** | Trust/risk profile for a trading partner. |
| **Entry points** | Links from `/marketplace`, `/trade-requests`, buyer drawers. **No nav entry, no CommandPalette entry, no index route.** |
| **Required data** | `TOP_10_TRUSTED_PARTNERS` (`:3`). |
| **API dependency** | **[VERIFIED] None.** Relevant because the trade-risk ensemble is retired for, among other reasons, returning a **fully fabricated profile** on an unrecognised org ID (`reports/production/phase6_risk_verdict.md`) — the same failure mode this page would exhibit when wired up. Wire with care. |
| **Loading / Empty / Error / Blocked** | **[GAP]** None. |

---

### `/market-intelligence` and `/trade-analysis`
`MarketIntelligencePage.tsx` (166 LOC) · `TradeAnalysisPage.tsx` (764 LOC)

| Field | Value |
|---|---|
| **Purpose** | Market opportunity analytics · deep multi-model analysis of a trade. |
| **Entry points** | **Neither appears in Navbar, RoleNavigation, CoreFlowSidebar, or CommandPalette.** Both are reachable by direct URL only. |
| **Required data** | `MARKET_OPPORTUNITY_COUNTRIES` · `FLAGSHIP_DEMO_TRADE`. |
| **API dependency** | `MarketIntelligencePage`: **none**. `TradeAnalysisPage`: **[VERIFIED]** the most API-connected page in the app — 6 call sites, 9 `isLoading` states, 2 `catch` blocks. |
| **Loading** | `TradeAnalysisPage` **[VERIFIED]** 9 independent loading states — the only page with genuine per-section loading. |
| **Error** | `TradeAnalysisPage` **[VERIFIED]** 2 `catch` blocks. `MarketIntelligencePage` **[GAP]** none. |
| **Note** | `docs/tasks.md` Phase 5 records "Inspect `TradeAnalysisPage.tsx`" as **not yet reached**. It is simultaneously the best-integrated page and an unnavigable orphan. Making it reachable is high-value, low-cost. |

---

### `/onboarding` (+ aliases `/role-select`, `/signup`) and `/login`
`OnboardingPage.tsx` (269 LOC) · `AuthPage.tsx` (23 LOC → `AuthAccordion`)

| Field | Value |
|---|---|
| **Purpose** | Role selection / registration · authentication. |
| **Entry points** | `/` CTAs; direct URL. |
| **Next page** | `/dashboard`. |
| **API dependency** | **[VERIFIED] None in either page.** Zero network calls. **[TODO]** whether `AuthAccordion` calls Supabase Auth was not confirmed this pass — it is the one place a real auth call could plausibly live. |
| **Loading / Empty / Error / Blocked** | **[GAP]/[TODO]** — no page-level states; needs UI inspection of `AuthAccordion`. |
| **Note** | Three routes for one component with no differentiating prop: a user arriving at `/signup` gets the same role-select screen as `/role-select`. |

---

### `/admin` — System Health
`src/pages/AdminSystemPage.tsx` (149 LOC)

| Field | Value |
|---|---|
| **Purpose** | Operational health of FastAPI / n8n / chain state. |
| **Entry points** | Navbar (`:69`), RoleNavigation (`:80`), CommandPalette (`:164`). |
| **API dependency** | **[VERIFIED]** `aiService.getStatus()` (`:13`) — a local status read, not a health probe of live services. |
| **Blocked** | **[GAP] — security-relevant.** No role check, no auth guard, and it is listed in the ordinary CommandPalette. Any visitor can reach `/admin`. |
| **Loading / Empty / Error** | **[GAP]** None. |

---

### `/wishlist` — Wishlist
`src/pages/WishlistPage.tsx` (332 LOC)

| Field | Value |
|---|---|
| **Purpose** | Saved listings / price alerts. |
| **Entry points** | Navbar (`:176`), RoleNavigation (`:157`). Not in CommandPalette. |
| **Required data** | **[FINDING]** `INITIAL_ITEMS` (`:24`) — hardcoded, unlabeled, into `useState` (`:134`). |
| **API dependency** | **[VERIFIED] None.** |
| **Lifecycle fit** | **Unmapped** — `getActiveIndex()` has no branch for it, so it silently highlights step 0 (Command Center). |
| **Loading / Empty / Error / Blocked** | **[GAP] All absent** — zero relevant tokens in 332 lines, including no empty state for an empty wishlist, its most likely real condition. |

---

## 4. Gaps and redundant-route candidates

### 4a. Lifecycle steps with no real implementation

Every one of the six canonical steps has a route. **None of the six is wired to a backend.**

| Step | Route | Backing data | Real API exists? |
|---|---|---|---|
| 0 Command Center | `/dashboard` | `FLAGSHIP_DEMO_TRADE` | — |
| 1 Trade Discovery | `/marketplace` | user input + demo | **Yes**, `aiService` (partly wired) |
| 2 Trade Requests | `/trade-requests` | unlabeled static array | No |
| 3 Active Trades | `/trades/:id` | `FLAGSHIP_DEMO_TRADE`, ignores `:id` | **Yes**, `trades_api.py` — not consumed |
| 4 Documents | `/documents` | `DEMO_TRADE_DOCUMENTS` | **Yes**, live-tested — not consumed |
| 5 Settlement | `/escrow` | `DEMO_ESCROW_CONTRACT` | **No — escrow does not exist in the contract** |

The headline: **a verified, live-tested persistence and document-anchoring backend exists, and the frontend consumes none of it.** The gap is integration, not implementation — except at step 5, where the backing capability genuinely does not exist and the UI claims it does.

### 4b. Missing routes (real navigational gaps)

| Missing | Why it matters |
|---|---|
| **`/trades` index** | Step 3 is *"Active Trades"*, plural. There is no list route. Nav hardcodes `/trades/TRD-IND-UAE-550K` in three places (`CoreFlowSidebar.tsx:29`, `Navbar.tsx:46,53`, `RoleNavigation.tsx:68`). Every user lands on the same demo trade. |
| **`/counterparties` index** | Detail route exists; no way to browse. |
| **`/documents/:id`** | No per-document deep link. |
| **`/settings` / `/profile`** | No user or organisation settings route at all. |
| **`/organizations/:id`** | Schema is org-centric (`organizations`, `organization_members`, `member_invitations`); the UI has no org surface. |
| **Auth-blocked state** | No `<ProtectedRoute>` anywhere. `/admin` included. |

### 4c. Redundant routes — consolidation candidates

| Keep | Retire | Rationale |
|---|---|---|
| `/onboarding` | `/role-select`, `/signup` | Identical component, no props. Redirect. |
| `/trade-requests` | `/get-started`, `/trade-intent` | Identical component. `/get-started` is a marketing-funnel name pointing at an internal RFQ inbox — actively confusing. |
| `/my-listings` | `/export-catalog` | Identical component. |
| `/disputes` | `/arbitrator` | Identical component, no role differentiation. Keep only if a real arbitrator role ships. |

Six of 27 route declarations are redundant. Consolidating to `<Route path="/signup" element={<Navigate to="/onboarding" replace />} />` preserves inbound links and removes the ambiguity.

### 4d. Orphan routes — exist but unreachable by navigation

`/market-intelligence`, `/trade-analysis`, `/counterparties/:id` — direct-URL only. `/trade-analysis` is the single best-integrated page in the app (6 API calls, 9 loading states) and cannot be reached from the UI. **Highest value-per-effort fix in this document.**

### 4e. Systematic finding — four false liveness badges

Four pages render a hardcoded, unconditional `StatusBadge` asserting a live capability that does not exist:

| Route | Badge text | Reality |
|---|---|---|
| `/escrow` | "USDC Smart Vault Active" | No escrow in `TradeLedger.sol`; no USDC; no multi-sig |
| `/documents` | "On-Chain Hash Anchoring Active" | `BLOCKCHAIN_ANCHORING_ENABLED=false`; API returns `501` |
| `/blockchain` | "Ethereum Sepolia Live" | Local Hardhat only; never touched Sepolia |
| `/shipments` | "AIS Live Satellite Connected" | No AIS integration exists |

These are the same anti-pattern already fixed this session in the n8n workflow, `marketplace_api.py`, and `aiService.ts` — *asserting success independent of whether anything succeeded* — surfacing in the presentation layer. The data layer was made honest; the UI still contradicts it. They should be driven by real status (or removed) before any demo.

### 4f. Missing-state summary

| Route | Loading | Empty | Error |
|---|---|---|---|
| `/trade-analysis` | 9 states | TODO | 2 catches |
| `/marketplace` | 1 state | GAP | 1 catch (likely unreachable) |
| `/dashboard`, `/my-listings`, `/trade-requests`, `/wishlist`, `/trades/:id`, `/marketplace/:id`, `/counterparties/:id`, `/documents`, `/escrow`, `/shipments`, `/disputes`, `/blockchain`, `/admin`, `/create-listing`, `/market-intelligence` | **GAP** | **GAP** | **GAP** |

15 of 17 substantive routes have no loading, empty, or error state. This is consistent and explained: **a page with no async data cannot have a loading state.** The absence is a symptom of the static-data problem, not a separate styling oversight — these states must be built as each route is wired to its API, not retrofitted after.

This matches `docs/tasks.md` Phase 5, where "Add loading states", "Add failure states", and "Add partial-result handling" are all recorded as unchecked with the honest note "(not this pass)".

---

## 5. Cross-cutting security observations

Recorded here because they are properties of the route table:

1. **No route guard exists.** No `<ProtectedRoute>`, no auth wrapper, no redirect. Every route is reachable by URL, including `/admin`.
2. **No role-based routing.** `Navbar.tsx` and `RoleNavigation.tsx` vary *menu items* by role, but the router does not enforce anything — hiding a link is not access control.
3. **No organisation scoping in the UI.** "My Export Listings" and inbound trade requests are the same static arrays regardless of who is logged in. When these are wired to the API, org scoping must be enforced server-side — and there are currently **zero RLS policies** on 22 multi-tenant tables (`reports/production/current_state_reconciliation.md` §7a).

These map to `docs/tasks.md` Phase 7 ("Verify organization/user authorization"), unchecked.

---

## 6. What could not be determined without a live session

Explicitly out of scope for a code-reading pass; each needs a real browser (Playwright is installed via `webapp-testing` / `playwright-best-practices`, not yet used):

- Actual rendered output of `ErrorBoundary` on catch.
- Whether `AuthAccordion` performs a real Supabase Auth call.
- Behaviour of `/marketplace/:id` and `/trades/:id` for an unknown `:id`.
- Real CTA labels and layout inside the four thin wrapper pages' studio components.
- Whether the `RouteFallback` Suspense loader is perceptible or flashes.
- Real empty-state rendering for `/wishlist` and `/my-listings` when their arrays are emptied via the UI.

Every item above is marked **[TODO — needs UI inspection]** at its point of use rather than guessed at.

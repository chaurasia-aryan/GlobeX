# Session Handoff — Phase 4 + Phase 5 done, resume on another device

Date: 2026-08-24. Branch: `dataset`. Nothing committed this session — working tree has
uncommitted changes (`git status` before anything else on the new machine).

Read first, in order:
1. `reports/production/session_handoff_2026-08-24d_frontend_rebuild.md` — master 8-phase plan.
2. `reports/production/session_handoff_2026-08-24e_auth_state_machine.md` — auth/onboarding, why Supabase is deliberately not configured yet.
3. This file.

## What's done

**Phase 4** — route table rewritten in `src/App.tsx` to the master plan's §1c 17-route table
(`/home`, `/discover`, `/discover/:listingId`, `/catalog`, `/catalog/new`, `/assess/:tradeId?`,
`/counterparties`, `/requests`, `/trades`, `/escrow`, `/disputes`, `/ledger`, `/settings`, `/admin`,
plus legacy `<Navigate>` redirects for every retired path). A temporary demo-login bypass exists in
`useAuth.ts` (`enterDemo(mode)`) + `AuthAccordion.tsx` ("View onboarding" / "View workspace" buttons)
so the UI is clickable without a live Supabase — **remove this after Phase 8**, not before.

**Phase 5** — Discover/Assess, the direction-forked half, all wired to real `aiService` calls (no
fabricated numbers):
- `DiscoverPage.tsx` — exporter destination ranking (`rankMarketOpportunity`) + importer supplier
  matching (`semanticMatch` — confirmed it works both directions despite no `trade_flow` param) +
  shared live listing catalog.
- `ListingDetailPage.tsx` — real listing detail, fixed a crash-on-empty-listings bug from the old page.
- `CatalogPage.tsx` — exporter "My Listings" (real `getListings`), importer "Watchlist" (local
  bookmark over live data, in `localStorage`, not fabricated).
- `CatalogEditorPage.tsx` — exporter create-listing form (ported, fixed an `organizationId` bug);
  importer sees `NotModelledState` (no requirement/RFQ-posting endpoint exists).
- `AssessPage.tsx` — six real `MetricDial`s (`TradeRiskAnalysis.compositeScore` + 5 subscores) fed by
  `predictTradeAnomaly` → `analyzeTradeRisk` → `analyzeCompliance`, `trade_flow` sourced from
  `activeDirection`, never hardcoded.
- Fixed `CounterpartiesIndexPage.tsx`'s two real bugs (wrong `semanticMatch` call shape, nonexistent
  `VerifiedCounterparty` type import).
- Added `organizationId` to `WorkspaceContext`'s `user` object.
- Updated `LifecycleRail.tsx` and `CommandPalette.tsx` nav targets from old routes to the Phase-4
  canonical ones.

Gates as of end of session: `tsc --noEmit` 44 errors (down from 46 baseline; all remaining errors live
in orphaned pre-Phase-5 files — `MarketIntelligencePage.tsx`, `MarketplacePage.tsx`,
`TradeAnalysisPage.tsx`, `TradeWorkspacePage.tsx`, and a handful of unrelated files — none in anything
Phase 5 touched). `vite build` succeeds. `vitest run` unchanged from baseline (1 pre-existing expected
failure in `coreFlowAndAuth.test.tsx`, untouched — Phase 7 rewrites it).

Live-browser verification: got through exporter side on `/discover`, `/assess`, `/counterparties`,
`/catalog`, `/catalog/new`, and importer side on `/catalog` (watchlist) and `/catalog/new`
(`NotModelledState`) before the Claude-in-Chrome tooling itself got flaky (stale screenshots, clicks
not registering, tab navigation not taking) — confirmed via DOM-text checks each time that the app was
rendering correctly; the flakiness was the browser-automation harness, not the app. Did not get a
final visual pass on importer `/discover` or importer `/counterparties`, though they share the same
tested code paths as everything already confirmed. **Worth a quick sanity check on the new machine.**

## Two things the user wants done next, before anything else

### 1. Recolor `/discover`, `/catalog`, `/catalog/new`, `/counterparties`, `/discover/:listingId` from dark to light theme

These pages were ported from pre-existing dark-theme components this session
(`MarketplacePage.tsx`, `MyListingsPage.tsx`, `CreateListingPage.tsx`, `ProductDetailPage.tsx`,
`CounterpartiesIndexPage.tsx`) and still carry their original **hardcoded dark hex literals** —
`bg-[#0C121D]`, `bg-[#070A0E]`, `bg-[#080C14]`, `text-white`, `text-slate-400`, `border-white/[0.07]`,
etc. — instead of the light-theme CSS-variable token system established in `src/index.css` `:root`
(`--surface-0`, `--surface-1`, `--surface-2`, `--surface-3`, `--text-primary`, `--text-secondary`,
`--text-tertiary`, `--hairline`, `--hairline-strong`, `--radius-md`, `--radius-lg`, etc. — same tokens
`AssessPage.tsx` already uses correctly, since that one was written fresh this session rather than
ported).

Files needing the pass, roughly in order of how much dark-hex is in them:
- `src/pages/DiscoverPage.tsx` (heaviest — two big panel blocks with dark backgrounds/borders + a
  ranked-grid section)
- `src/pages/CatalogPage.tsx` (`ListingRow`, watchlist rows)
- `src/pages/CatalogEditorPage.tsx` (the whole `ExporterListingForm`)
- `src/pages/ListingDetailPage.tsx`
- `src/pages/CounterpartiesIndexPage.tsx`
- `src/pages/CounterpartyDetailPage.tsx` (lower priority — this one's still fully mock-data-driven,
  out of Phase 5 scope, but same dark-hex issue)
- `src/components/marketplace/*` (`ListingCard.tsx`, `ListingDetailDrawer.tsx`,
  `CountryOpportunityCard.tsx`, `CountryDetailDrawer.tsx`, `CommoditySearchDropdown.tsx`,
  `CreateTradeRequestDrawer.tsx`) — these are shared/reused by `DiscoverPage`, so fixing them once
  fixes all their call sites.

Approach: grep each file for `#0C121D|#070A0E|#080C14|text-white|text-slate-|border-white/\[` and swap
to the token equivalents (`bg-[var(--surface-1)]`, `bg-[var(--surface-0)]`, `text-[var(--text-primary)]`,
`text-[var(--text-secondary)]`, `border-[var(--hairline)]` / `border-[var(--hairline-strong)]`). Check
`AssessPage.tsx` and `src/pages/HomePage.tsx`/`DashboardPage` for the pattern already done correctly.
Verify in the browser in both light-appearing states (the app is light-theme-only per the master
plan — there's no dark-mode toggle to test against, just make sure nothing still renders as a
navy/black panel).

### 2. Add clearly-labeled dummy data as a fallback, so the UI is inspectable without the FastAPI backend running

Right now every Phase 5 page that calls `aiService` shows a real `ErrorState` ("Failed to fetch")
when the backend isn't running — which is correct/honest behavior and **must stay the default**. But
the user wants an easy way to *see* the UI populated without standing up the backend, for quick visual
iteration. Do this as an explicit, opt-in fallback, not a silent one:

- Use the existing `DataSourceLabel` component (`src/components/common/DataSourceLabel.tsx`) — it
  already has a `"demo"` variant that renders `"DEMO DATA — NOT LIVE COMPLIANCE"` in an obvious
  amber/review-colored badge. That's the right visual pattern to reuse; you may want a second, more
  generic label text for non-compliance contexts (e.g. `"DEMO DATA — NOT LIVE"`, matching what
  `MyListingsPage.tsx` used to do with its amber banner) rather than overloading the compliance-specific
  string.
- Wire it as a **fallback-on-error**, not a replacement for the real call: keep the existing
  `try { real call } catch { setError(...) }` flow, and only when the fetch fails AND some explicit
  flag is on (e.g. `import.meta.env.DEV` plus a query param like `?demo=1`, or a small dev-only toggle
  in the UI) do you substitute a small hardcoded demo dataset shaped exactly like the real
  `ListingRecord[]` / `DestinationCountryInsight[]` / `CounterpartyMatchResult[]` / `TradeRiskAnalysis`
  types, with the `DataSourceLabel` rendered directly above/beside that content so it's unmistakable.
  Never let it appear without the label, and never let it appear by default in production.
- Do **not** resurrect the old `DEMO_ORG_PRODUCTS` / `DEMO_WISHLIST_ITEMS` / `TOP_BUYERS_DATA`-style
  arrays as silent defaults the way the pre-Phase-5 pages did — that's exactly the fabricated-liveness
  pattern this whole rebuild has been removing. The difference this time is the label must always be
  visible when demo data is showing.
- Reasonable starting scope: `DiscoverPage.tsx`'s ranking grid + listing catalog, `CatalogPage.tsx`'s
  listing rows, `AssessPage.tsx`'s six dials, `CounterpartiesIndexPage.tsx`'s partner grid. Skip
  `CatalogEditorPage.tsx` (a create form has nothing to fall back to) and skip anything already showing
  `NotModelledState` (that's an honest "doesn't exist" state, not a "backend down" state — don't blur
  that distinction with demo data).

## Standing rules carried over (don't relitigate these)

- Supabase stays unconfigured until **after Phase 8**. Don't wire it up as a side effect of the theme
  or dummy-data work above.
- `businessType` (EXPORTER/IMPORTER/BOTH) drives the *journey*; `role`/`organizationRole` drives
  *permissions* — orthogonal, never conflate.
- `activeDirection` from `WorkspaceContext` is the single source of truth for `trade_flow` sent to any
  model — never hardcode `"Export"`/`"Import"` at a call site.
- "Fork the question, share the machinery" — same routes for both directions, forked framing/model
  calls, not duplicated Importer/Exporter page trees.
- Status vocabulary is closed (Verified/Pending/Review Required/Blocked/Stale/Source Unavailable) via
  `StatusBadge` — don't invent new status strings.
- Honest-gap pattern (`NotModelledState`) stays for anything with no backing model/endpoint — the demo
  data work above must not be used to paper over a genuine `NotModelledState` case.

## Not started yet

Phase 6 (Deal/Settle: `/requests`, `/trades`, `/escrow`, `/disputes`, `/ledger` — currently still
`PhasePendingPage` stubs or old unaudited pages), Phase 7 (verification/tests), Phase 8 (docs), then
finally real Supabase configuration + removal of the demo-login bypass.

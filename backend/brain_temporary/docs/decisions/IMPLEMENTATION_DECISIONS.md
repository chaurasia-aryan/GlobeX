# GLOBEX AI — Implementation Decisions Log
> Every important architectural, design, and engineering decision made during this implementation run.

---

## Decision 001: CSS Custom Property Token System

**Date**: 2026-08-16  
**File Modified**: `src/index.css`

**Problem**: Pages across the application (`BlockchainLedgerPage`, `DisputesPage`, `EscrowPage`, `ShipmentsPage`, `DocumentVerificationPage`, `TradeWorkspacePage`) all reference CSS custom properties like `var(--ink)`, `var(--panel)`, `var(--hairline)`, `var(--accent)`, `var(--emerald)` — but these were not defined in `index.css`. Without them, all dark-surface components render without background colors and borders, breaking the visual hierarchy entirely.

**Decision**: Add all 11 CSS custom property tokens to the `:root` block in `src/index.css`, matching the token specification in `docs/UX_DECISIONS.md` exactly:
- `--ink: #0B0F14` — the deepest background canvas
- `--panel: #12181F` — primary panel surface
- `--panel-raised: #171F28` — elevated card (max 2-level nesting rule enforced)
- `--hairline: rgba(226,232,240,0.08)` — 1px border separator
- `--accent: #5EC9DB` — interactive/AI cyan (ONE per screen)
- `--emerald: #34C795` — verified trust states
- `--amber: #E8A73D` — document discrepancies, warnings
- `--red: #E5605C` — errors, critical risk
- `--text-primary: #E2E8F0`, `--text-secondary: #94A3B8`, `--text-muted: #64748B`

**Why not Tailwind classes?**: The pages already hardcode `bg-[var(--ink)]` and `text-[var(--text-primary)]` throughout. Switching to Tailwind semantics would require touching 6+ pages and 15+ components. Defining the tokens in `:root` is the zero-regression fix.

**Consequence**: All dark institutional surfaces now render correctly.

---

## Decision 002: TradeWorkspacePage — Tabbed Multi-Stage Layout

**Date**: 2026-08-16  
**File Modified**: `src/pages/TradeWorkspacePage.tsx`

**Problem**: The existing `TradeWorkspacePage` only renders a 9-stage lifecycle stepper and a single AI Copilot chat window. According to `FINAL_IMPLEMENTATION_STATUS.md`, the Flagship Demo flow requires the workspace to allow the judge to:
- Review Trade Overview & Counterparty Dossier
- Run AI Document Verification
- Inspect Programmable Escrow conditions
- Track Live Shipment
- Access Dispute Resolution
- View the Public Blockchain Audit Trail

All of these interactive components exist (`DocumentVerificationStudio`, `CryptoEscrowCard`, `ShipmentTracker`, `DisputeResolutionSuite`, `PublicTradeLedgerTable`) but were disconnected from the workspace.

**Decision**: Replace the single-panel layout with a **6-tab workspace** using Radix UI `Tabs` (already in `src/components/ui/tabs.tsx`). The AI Copilot is kept as a persistent floating chat panel alongside the tabs.

**Tab structure**:
1. `overview` — Trade header + counterparty dossier cards
2. `documents` — `DocumentVerificationStudio` with the 10,000 kg vs 9,800 kg anomaly
3. `escrow` — `CryptoEscrowCard` with the $550,000 USDC release button
4. `shipment` — `ShipmentTracker` with AIS milestones
5. `disputes` — `DisputeResolutionSuite` with Human Arbitrator portal
6. `blockchain` — `PublicTradeLedgerTable` with SHA-256 anchors

**Why tabs vs. a scroll layout?**: Dense institutional UI with 6 heavy components on one page creates a bloated scroll. Tabs give judges a clear, deliberate navigation flow matching the 9-stage lifecycle mental model.

**Consequence**: The flagship $550k Basmati Rice demonstration can be walked through end-to-end from a single URL (`/trades/TRD-IND-UAE-550K`).

---

## Decision 003: MarketplacePage — Top 10 Partner Shelf Integration

**Date**: 2026-08-16  
**File Modified**: `src/pages/MarketplacePage.tsx`

**Problem**: The existing marketplace page only renders the product listing grid. According to `DESIGN_AUDIT.md`, the primary focal point of the marketplace should be the **Top 10 Trusted Trade Partners CircularCarousel** — but the `TrustedPartnerShelf` component exists in `src/components/marketplace/TrustedPartnerShelf.tsx` and was never wired into the marketplace page.

**Decision**: Insert `TrustedPartnerShelf` above the category filter bar with the `TOP_10_TRUSTED_PARTNERS` data from `mockTradeData.ts`. Also wire the search bar to `aiService.semanticMatch()` to show `AIMatchResultsPanel` results when queries are entered.

**Why not modal for AI results?**: The `AIMatchResultsPanel` is designed to render inline below the search bar, not as a modal — this avoids losing marketplace context and matches the "natural query → inline ranked results" UX documented in `AI_ML_ARCHITECTURE.md`.

**Consequence**: Marketplace now showcases the Top 10 partners prominently and demonstrates the AI semantic matching flow.

---

## Decision 004: DemoPersonaSwitcher — Preserved as Floating Widget

**Date**: 2026-08-16  
**Files Affected**: `src/App.tsx`, `src/components/layout/DemoPersonaSwitcher.tsx`

**Problem**: `DemoPersonaSwitcher` is imported in `App.tsx` (line 10) but never rendered. Judges need to switch between Exporter, Buyer, and Arbitrator personas to see role-differentiated views.

**Decision**: Add `<DemoPersonaSwitcher />` to the App JSX layout between `<Navbar />` and `<main>`. This renders it as a floating, always-accessible overlay per the UX decision in `docs/UX_DECISIONS.md` — "Arbitrator and Admin are moved to a separately-labeled, floating demo control (`DemoPersonaSwitcher`)".

**Consequence**: Judges can switch roles at any point in the demo without navigating away.

---

## Decision 005: TradeWorkspacePage — Mock Trade ID Routing

**Date**: 2026-08-16  
**File Modified**: `src/pages/TradeWorkspacePage.tsx`

**Problem**: The workspace page reads `const { id } = useParams()` but always falls back to `FLAGSHIP_DEMO_TRADE` regardless of the URL param. No real lookup logic is needed for the demo since there is only one active flagship trade.

**Decision**: Keep the `FLAGSHIP_DEMO_TRADE` fallback. Add a simple check: if `id !== FLAGSHIP_DEMO_TRADE.id`, redirect to `/trades/TRD-IND-UAE-550K` via React Router `useNavigate`. This ensures a clean demo URL without broken states.

**Consequence**: Navigating to `/trades/anything` will always show the flagship demo trade, maintaining demo integrity.

---

## Decision 006: Tab State Persistence via Hash

**Date**: 2026-08-16  
**File Modified**: `src/pages/TradeWorkspacePage.tsx`

**Problem**: When a judge navigates to `/trades/TRD-IND-UAE-550K#escrow` from a CTA button, the active tab should pre-select "Escrow" without the judge having to click.

**Decision**: Read `window.location.hash` on mount to determine the initial active tab. This is lightweight, requires no state management library, and makes every tab deep-linkable from buttons across the app.

**Consequence**: CTAs like "View Escrow" and "Track Shipment" on the Dashboard and Marketplace can link directly to the correct tab.

---

## Decision 007: GSAP Used Exclusively for Scroll-Driven Lifecycle Timeline

**Date**: 2026-08-16  
**File Created**: `src/components/landing/GSAPLifecycleTracer.tsx`

**Problem**: The DISCOVER→MATCH→ASSESS→COMPLY→VERIFY→ESCROW→SHIP→SETTLE pipeline needs a scroll-driven light beam that advances in sync with scroll position — pinning the section while the animation plays.

**Framer Motion limitation**: Framer Motion's `useScroll` + `useTransform` can scrub a single property but doesn't handle: (a) pinning the section while scroll drives the animation, (b) sequential property changes on 8 different elements timed to scroll progress.

**Decision**: Use `gsap` + `ScrollTrigger` **exclusively** for this one component. GSAP's `scrub: 1.5` gives the "buttery behind" feel — the beam lags slightly behind scroll position, creating inertia. All other animations (page transitions, card hovers, fade-ins) remain in Framer Motion.

**Consequence**: `gsap` and `@gsap/react` become dependencies, justified by a single high-value use case.

---

## Decision 008: react-wrap-balancer on All Headings

**Date**: 2026-08-16  
**Files Modified**: `LandingPage.tsx`, `MarketplacePage.tsx`; `src/main.tsx` for Provider

**Problem**: Multi-line headlines at tablet breakpoints (`text-3xl sm:text-4xl`) wrap awkwardly — e.g., "Analyze your next" / "trade" (orphaned single word on line 2).

**Decision**: Install `react-wrap-balancer` and wrap all `<h1>`, `<h2>`, `<h3>` display text with `<Balancer>`. The BalancerProvider is placed in `main.tsx` above `<App />` so all pages benefit.

**Why not CSS `text-wrap: balance`?**: Browser support is ~72% (excludes Firefox 120-). The React library is 1KB gzipped and works everywhere.

**Consequence**: Zero awkward headline orphans across all screen sizes.

---

## Decision 009: @number-flow/react for All Score and Stat Animations

**Date**: 2026-08-16  
**Files Modified**: `LandingPage.tsx`, `ListingCard.tsx`

**Problem**: The existing `CountUp` component in `src/components/reactbits/CountUp.tsx` uses a hand-rolled `requestAnimationFrame` counter with simple linear easing. It also doesn't handle value changes after mount (no re-animation on prop change).

**Decision**: Replace with `@number-flow/react` which provides:
- Spring-physics number transitions out of the box
- Digit-by-digit morphing animation (not just counting up)
- Built-in spring for re-triggering when value changes
- `format` prop accepts `Intl.NumberFormat` options natively

Applied to: escrow collateral ($1.82M USDC), AI match % (94%), verified exporters (145), blockchain blocks (#19,482), listing FOB prices, partner trust scores.

**Consequence**: All numeric displays now animate with purpose-built spring physics.

---

## Decision 010: class-variance-authority + tailwind-merge + clsx Already Installed

**Date**: 2026-08-16

**Status**: `cva`, `tailwind-merge`, and `clsx` were already in `package.json`. The `cn()` utility in `src/lib/utils.ts` already composes them:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```
All new components (`ScrollReveal`, `StaggerReveal`, `GSAPLifecycleTracer`) use `cn()` exclusively — no manual string concatenation.

---

## Decision 011: Lenis Smooth Scroll — Global, Single Instance

**Date**: 2026-08-16  
**Files Created**: `src/hooks/useSmoothScroll.ts`  
**Files Modified**: `src/App.tsx` (SmoothScrollProvider)

**Problem**: Native browser scroll is jerky on Windows/Chrome due to variable refresh rate and lack of inertia. All award-winning sites use Lenis or a similar library to provide consistent, physics-based scroll momentum.

**Decision**: 
- Single `Lenis` instance created inside `useSmoothScroll` hook
- Driven by `requestAnimationFrame` for 60/120fps sync
- Expo-out easing `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` — very fast start, feathers out gently
- Instance exposed on `window.lenis` so GSAP's `ScrollTrigger` can call `lenis.raf(time)` in sync

**SmoothScrollProvider**: A tiny wrapper component that calls the hook and is placed inside `<BrowserRouter>` so anchor hash navigation (`/trades/TRD-IND-UAE-550K#escrow`) still works with Lenis.

**Consequence**: All scroll on every page gets the "buttery premium" feel with zero per-page setup.

---

## Decision 012: ListingCard Typography & Spec Chips Redesign

**Date**: 2026-08-16  
**File Modified**: `src/components/marketplace/ListingCard.tsx`

**Problem**: The marketplace cards rendered a heavy nested dark table box (`glass-panel-raised`) containing HS Code, MOQ, and Origin Port in uniform `text-xs` font size. This created visual clutter and made all text look identical in scale.

**Decision**:
- Replaced the heavy nested table box with a clean horizontal **Spec Chips Row** (`HS: 1006.30.20`, `MOQ: 100 tonnes`, `Port`).
- Established clear typographic hierarchy:
  - Hero Title: `text-base sm:text-lg font-display font-bold` (18px)
  - Price Tag: `text-2xl font-display font-bold` (24px)
  - Exporter Subtitle: `text-xs text-[var(--text-secondary)]` (12px)
  - Spec Chips: `text-xs font-mono` with muted labels
- Added green `ShieldCheck` icon badges for certifications.

**Consequence**: Cards are spacious, uncluttered, and scan easily for high-intent buyers.

---

## Decision 013: Integrated 3D Heat-Map & Tooltip Logic from `globe/` Folder

**Date**: 2026-08-16  
**Files Modified**: `src/components/TradeGlobe.tsx`, `src/lib/colors.ts`, `src/components/GlobeTooltip.tsx`

**Problem**: The original `TradeGlobe.tsx` used dynamic dashed arc animations and standard polygon caps, whereas the dedicated `globe/` workspace contained d3-interpolated heat-map colors (`getHeatColor`, `getPolygonAltitude`, `valueColorScale`) and floating mouse-following `GlobeTooltip.tsx`.

**Decision**: Integrated the 3D heat-map polygon extrusions, `earth-night.jpg` textures, and `GlobeTooltip` from `globe/src/components/TradeGlobe.tsx` while keeping static thin red vector trade arcs (`#EF4444`, `arcDashLength={0}`) to eliminate random moving dash clutter.

**Consequence**: The globe displays institutional heat-map metrics with crisp static trade corridors and responsive hover tooltips.

---

## Decision 014: Smooth, Warm Typography Palette (Figtree, Outfit, Instrument Serif)

**Date**: 2026-08-16  
**Files Modified**: `index.html`, `tailwind.config.ts`, `LandingPage.tsx`

**Problem**: Sharp geometric fonts with harsh terminal angles (like Space Grotesk or hard geometric sans) felt cold, spiky, and aggressive on screen.

**Decision**:
- Adopted **Figtree** (`font-sans`) as the primary UI font: a warm, humanistic, rounded-neutral sans-serif with zero harsh spikes.
- Adopted **Outfit** (`font-display`) for section headings: smooth, balanced geometric curves.
- Adopted **Instrument Serif** (`font-serif`) for editorial emphasis (`With confidence.` hero accent).
- Kept **JetBrains Mono** (`font-mono`) for codes, prices, and hashes.

**Consequence**: The entire interface renders with smooth, comfortable, high-legibility typography across all viewports.




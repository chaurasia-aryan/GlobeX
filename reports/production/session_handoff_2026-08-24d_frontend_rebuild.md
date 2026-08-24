# GlobeXAI — Machine-switch handoff: Frontend Rebuild (light theme, direction-aware IA)

**Date:** 2026-08-24
**Reason for this doc:** the user is switching computers and will continue this exact task in a new
Claude Code session on the new machine. This file is written to be followed **in order**, top to
bottom, by that new session, before it touches any code.

**The task in one sentence:** a full frontend-only rebuild of GlobeX-New to a light theme with a
direction-aware (importer vs exporter) userflow, keeping the landing-page 3D globe, per the plan at
`C:\Users\Aryan\.claude\plans\read-session-md-use-cypress-replicated-lamport.md` (this path is local
to the old machine — see §3 for what to do about that).

---

## 0. Before switching machines — do this on the OLD machine first

Everything below assumes the work already done (Phases 0–1, see §4) is pushed. **It is not yet
committed.** Before leaving this machine:

```bash
cd D:/Codes/SIH26/GlobeX-New
git status
```

You will see a large uncommitted diff — most of it is **not** from this session (blockchain/escrow
work from earlier sessions the same day, per `reports/production/session_handoff_2026-08-24c.md`).
This session's changes are specifically:

```
M  components.json
M  reports/tooling/skills_inventory.md
M  skills-lock.json
D  src/App.css
M  src/App.tsx
D  src/components/common/ThemeToggle.tsx
D  src/context/ThemeContext.tsx
M  src/index.css
M  tailwind.config.js
```

Decide how you want to commit (one commit for everything, or split this session's frontend-token
work from the earlier blockchain work) — **this was intentionally left for you to decide, not done
automatically** (only commit when explicitly asked, per your own standing instruction). Once
committed:

```bash
git push origin dataset       # confirmed remote/branch as of this session: origin =
                               # https://github.com/Sanya06C/GlobeX-New.git, branch = dataset
                               # (a "personal" remote also exists: chaurasia-aryan/GlobeX_Personal.git —
                               # confirm with the user which one before pushing if unsure)
```

**Two things do NOT travel with git — recreate them manually on the new machine, do not commit them:**
- `.env` (gitignored) — FastAPI/Supabase/env config.
- `.mcp.json` (gitignored) — MCP server config.

Copy these two files over out-of-band (USB, secure note, password manager) if you need the same
values on the new machine — never paste live secrets into a tracked file or into chat.

---

## 1. New-machine setup — run this FIRST, before opening the project in conversation

### 1a. Clone and install

```bash
git clone https://github.com/Sanya06C/GlobeX-New.git
cd GlobeX-New
git checkout dataset
npm install
```

Recreate `.env` and `.mcp.json` from the copies you carried over (§0). Without `.env`,
`VITE_FASTAPI_AI_URL` etc. fall back to defaults (`http://localhost:8000`) which is fine for local
dev once the backend is running again on this machine.

### 1b. Restore the exact skill set (project-level, gitignored — must be reinstalled)

`.claude/skills/` and `.agents/skills/` are **deliberately gitignored** (tooling, not product code —
see `.gitignore:52-54`). `skills-lock.json` at the repo root **is** tracked and is the manifest of
record — 32 skills as of this session. Restore all of them in one shot:

```bash
npx skills experimental_install
```

This reads `skills-lock.json` and reinstalls exactly what was there, including the two added this
session: `cypress-author` and `cypress-docs` (installed for Phase 7 of the plan — see §4). If that
command is unavailable in your CLI version, fall back to installing the full set manually with
`npx skills add <owner>/<repo> --skill <name>` per the `source`/`skillPath` fields recorded in
`skills-lock.json` — do not skip this, several phases of the plan below assume these skills are
loaded (in particular `webapp-testing`, `playwright-best-practices`, `frontend-design`,
`design-taste-frontend`, `impeccable`).

**Known flag, not a blocker:** `cypress-docs` carries a Snyk Medium-Risk rating (`cypress-author` is
Low/Safe). Recorded in `reports/tooling/skills_inventory.md` — re-read that file after reinstalling
to confirm the flags still match, since risk ratings can change between install runs.

### 1c. Verify the toolchain before continuing

```bash
npx tsc --noEmit -p tsconfig.app.json   # expect exactly 46 pre-existing errors, 0 new
npx vitest run                          # expect 2 pre-existing failures (coreFlowAndAuth.test.tsx —
                                         # already broken before this session; see §4)
npx vite build                          # must succeed
```

If these numbers differ from what's stated, something changed in transit (a bad merge, a skipped
file) — investigate before writing new code, don't assume the plan's later phases still apply
cleanly.

### 1d. Restart Claude Code

**Restart the Claude Code session now**, after skills are installed, so the new skill set (and any
updated `.claude/settings.local.json` permissions) is loaded fresh. Do not try to continue in a
session that was open before `npx skills experimental_install` ran.

---

## 2. After restart — resume the frontend rebuild

Open a new conversation and paste (or paraphrase) this:

> Continue the GlobeXAI frontend rebuild. Read
> `reports/production/session_handoff_2026-08-24d_frontend_rebuild.md` in full first, then read the
> plan it references. Phases 0 and 1 are done and verified. Resume at Phase 2 (chrome + shared
> domain components).

The new session should **re-read this file and the plan file itself** rather than trust a paraphrase
— the plan is long (architecture decisions, route table, token spec, component list) and re-deriving
it from memory risks drift.

### 2a. Where the plan lives

The original plan file path (`C:\Users\Aryan\.claude\plans\read-session-md-use-cypress-replicated-lamport.md`)
is **local to the old machine's `~/.claude/plans/` directory and does not travel with git.** Its full
content is reproduced in §5 of this document so nothing is lost. On the new machine, either:
- paste §5 into a fresh plan file at the same relative location, or
- just keep working from §5 here — the content is identical and this file is now the source of
  record for the plan text.

---

## 3. Current state — what's done, what's next

### Done and verified (Phases 0–1)

- **Phase 0 — Tooling & baseline.** `cypress-author` + `cypress-docs` skills installed
  project-level. `components.json` fixed (`tailwind.config.ts` → `tailwind.config.js`, was silently
  breaking `npx shadcn add`). Baseline captured: **46 pre-existing `tsc` errors**, **2 pre-existing
  `vitest` failures** in `src/test/coreFlowAndAuth.test.tsx` (the app's route table had already
  drifted from `docs/product/user_flow.md` before this session touched anything — `/trades` now
  resolves to a real index route the test doesn't expect yet). Recorded in
  `reports/tooling/skills_inventory.md`.
- **Phase 1 — Token foundation.** `src/index.css` `:root` rewritten as the single light-theme token
  source (4-level surface hierarchy, hairlines, AA-contrast-checked status/semantic accents, and —
  notably — `--bg-app`/`--bg-surface`/`--border-subtle`/`--brand-teal`, which were referenced across
  8 source files and **defined nowhere in the repo** before this session; they now resolve for real).
  `tailwind.config.js` rewritten: the ~40-entry Material-3 dark hex palette deleted, `darkMode`
  dropped, the dark-only `scan` keyframe removed (confirmed zero usages via grep before deletion),
  every color key now maps to a `var()`. `src/context/ThemeContext.tsx` deleted (light-only, no
  toggle); `src/components/common/ThemeToggle.tsx` deleted (confirmed zero importers — it was
  already orphaned); `src/App.css` deleted (confirmed zero importers — unused Vite boilerplate).
  `src/App.tsx` unhooked from `ThemeProvider`.
- **Gate passed:** `tsc --noEmit` unchanged at 46 errors (no regressions), `vite build` succeeds.
  The app boots and now renders on the light token system — **pages have not been visually rebuilt
  yet, so most of them will look broken/inconsistent** (mixed literal dark hexes + new light
  tokens). This is the expected, tracked state per the plan's Phase 1 gate note, not a bug to chase.

### Not started (Phases 2–8) — pick up here

1. **Phase 2 — Chrome + shared domain components.** Build `AppShell`, direction-aware lifecycle
   rail, and the new `src/components/common/` set (`StatusBadge`, `ComplianceBanner`,
   `EscrowStateCard`, `DataSourceLabel`, `SourceRef`, `NotModelledState`, `EmptyState`, `ErrorState`,
   `LoadingSkeleton`, `MetricDial`). Delete `RoleNavigation.tsx`, `Navbar.tsx`, `Sidebar.tsx`,
   `CoreFlowSidebar.tsx`, `DemoPersonaSwitcher.tsx`, `ShaderBackground.tsx`,
   `src/components/landing/*`, `src/pages/Index.tsx`, and the dark-only Aceternity effect
   components. Full list and rationale in §5 (§1f, §2 Phase 2).
2. **Phase 3 — Entry flow.** `/`, `/auth`, `/onboarding` with business-type selection as the
   primary onboarding step (this is the one genuinely new piece of business logic — today
   `OnboardingPage.tsx` never asks importer-vs-exporter at all).
3. **Phase 4 — Route table rewrite.** `src/App.tsx` → the 17-route table in §5 §1c, with legacy
   `<Navigate>` redirects for every retired path.
4. **Phase 5 — Discover/Assess** (the direction-forked half).
5. **Phase 6 — Deal/Settle** (the shared half; escrow, trades, documents, disputes, ledger).
6. **Phase 7 — Verification.** `tsc`, `vitest` (rewrite `coreFlowAndAuth.test.tsx` against the new
   IA here — it will still be red until this phase), Cypress specs (exporter + importer journeys,
   using the `cypress-author` skill), Playwright real-browser pass.
7. **Phase 8 — Docs.** Update `docs/product/user_flow.md` and
   `docs/product/importer_exporter_flow_design.md` against what was actually built.

**Environment reminder carried over from `session_handoff_2026-08-24c.md`:** before Phase 5 (any
screen that calls the FastAPI backend), restart it cleanly —
`python -m uvicorn main:app --host 0.0.0.0 --port 8000` **without** `--reload** — the previous
long-running process was caught serving stale in-memory code. Docker Desktop is not running by
default on a fresh boot; Supabase and n8n need it up.

---

## 4. Ground rules that carry over (do not relitigate these)

- **Frontend only.** No backend, contract, n8n, or model changes. If a page needs something the
  backend doesn't have, render an honest gap state (`NotModelledState`) — do not fake it.
- **Light theme only.** No dark mode, no toggle, no `prefers-color-scheme` branch.
- **Direction model:** `businessType` (EXPORTER/IMPORTER/BOTH, real Postgres enum) drives the
  *journey*; `role` (job title) drives *permissions*. They are orthogonal.
  `WorkspaceContext.tsx:203-216` already exposes `businessType`, `activeDirection`,
  `canSwitchDirection` — reuse it, do not build a second direction system.
- **"Fork the question, share the machinery."** Same routes for both directions, forked framing and
  forked model calls — not duplicated `ImporterX`/`ExporterX` page trees.
- **The importer journey is honestly shorter than the exporter's** for two steps (destination
  ranking and counterparty match are exporter-only models — no dataset exists for the importer
  side). Do not pad this by relabelling the exporter model's output — that is the exact fabrication
  the project's compliance docs forbid.
- **No fake liveness.** Four specific badges must not survive into the rebuild: `/escrow` "USDC
  Smart Vault Active", `/documents` "On-Chain Hash Anchoring Active", `/blockchain`
  "Ethereum Sepolia Live" (real network is Local Hardhat 31337), `/shipments` "AIS Live Satellite
  Connected". Replace with real status reads.
- **Status vocabulary is closed-set:** Verified / Pending / Review Required / Blocked / Stale /
  Source Unavailable. No page invents its own status string — route everything through
  `StatusBadge`.
- **The globe stays almost untouched**, on a scoped dark hero band inside the light page. Do not
  re-tune `TradeGlobe.tsx`'s three.js materials for a light backdrop — that's a distinct, much
  larger project, explicitly out of scope here.

---

## 5. Full plan text (source of record — the local plan file does not travel with git)

*Verbatim copy of `C:\Users\Aryan\.claude\plans\read-session-md-use-cypress-replicated-lamport.md`
as it stood at the end of this session. This is now the authoritative copy — the old machine's
`~/.claude/plans/` directory is local and is not part of the repo.*

> # GlobeXAI — Full Frontend Rebuild (Light Theme, Direction-Aware IA)
>
> ## Context
>
> **Why this is happening.** The GlobeXAI frontend has drifted badly out of sync with a backend that is
> now real. Four audits already in the repo say the same thing from different angles:
>
> - `docs/product/user_flow.md` — 24 pages / 29 routes, 4 pure alias redirects, 3 orphan pages
>   reachable only by direct URL, and **15 of 17 substantive routes have no loading, empty, or error
>   state**. The best-integrated page (`TradeAnalysisPage`, 1057 lines, 6 API call sites) is
>   unreachable from any navigation.
> - `docs/product/importer_exporter_flow_design.md` — `organizations.business_type`
>   (`EXPORTER`/`IMPORTER`/`BOTH`) is a real Postgres enum. Direction plumbing now exists in
>   `WorkspaceContext`, but onboarding never collects it and almost nothing consumes it.
> - `reports/production/session_handoff_2026-08-24c.md` — escrow, trades, documents and the chain
>   adapter are live and verified end to end, driven through real n8n webhooks with real tx hashes.
> - `GlobeXAI_Claude_OneShot_Production_Pack/12_UI_COMPLIANCE_REQUIREMENTS.md` — the honesty rules the
>   UI currently violates in four documented places.
>
> **The outcome wanted.** One coherent light-theme product built around the real business logic, where
> an importer and an exporter get genuinely different journeys, every screen is backed by a real
> endpoint or an honest "not available" state, and the landing-page globe survives intact.
>
> **Scope.** Frontend only. No backend, contract, n8n, or model changes.
>
> ---
>
> ## Confirmed decisions
>
> | Decision | Choice |
> |---|---|
> | Rebuild scope | Entire website. Rethink the userflow from the business logic up. |
> | Theme | **Light only.** Dark mode deleted, not made optional. |
> | Data | Wire real endpoints where they exist; honest states everywhere else. |
> | Backend | Untouched. |
> | Cypress skills | `cypress-author` + `cypress-docs`, project-level. Skip `cypress-explain`. |
>
> ---
>
> ## Findings that shape the plan
>
> *(verified this session, not assumed)*
>
> 1. **`--bg-app`, `--bg-surface`, `--border-subtle`, `--brand-teal` are referenced in 8 source files
>    and defined nowhere in the repo.** `LandingPage.tsx:122` sets the page background from
>    `var(--bg-app)`. These resolve to nothing today. The token rebuild fixes live dead references.
> 2. **Two competing token systems** — a Material-3 hex palette in `tailwind.config.js` and a "GLOBEX
>    Institutional" CSS-var palette in `src/index.css`, bridged by a partial mapping layer. `body` is
>    hardcoded `#070A0E`.
> 3. **`components.json` points at `tailwind.config.ts`; the real file is `tailwind.config.js`** —
>    `npx shadcn add` is broken until fixed.
> 4. **Direction infrastructure already exists.** `src/context/WorkspaceContext.tsx:203-216` exposes
>    `businessType`, `activeDirection`, `canSwitchDirection`, `isExporterView`/`isImporterView`. This
>    is the single source of truth for `trade_flow`. **Do not build a second one.**
> 5. **Onboarding never asks the question the user wants asked.** `src/pages/OnboardingPage.tsx:27`
>    collects org *role* (job title) only; `businessType` appears nowhere in the file. The
>    importer-vs-exporter choice literally does not exist in signup today.
> 6. **Auth is fake.** `src/services/appwrite/client.ts` is a localStorage mock seeded with
>    `DEFAULT_USER.isLoggedIn: true`, so `ProtectedRoute` is an inert passthrough. Real Supabase Auth
>    is **out of scope** (backend/security work) — but the new UI must not pretend otherwise.
> 7. **The globe is one file.** `src/components/TradeGlobe.tsx` (1198 lines) over `react-globe.gl` +
>    `three`, driven by `LandingPage.tsx` via an imperative `pointOfView` ref. It fetches earth
>    textures from unpkg and country GeoJSON from a raw GitHub URL **at runtime** — an external
>    network dependency on the first screen of the app.
> 8. **Orphans safe to delete:** `src/pages/Index.tsx` (unrouted), all of `src/components/landing/*`
>    (none imported by `LandingPage.tsx`), `src/App.css` (Vite boilerplate).
>
> ---
>
> ## 1. Updated architecture
>
> ### 1a. The two axes (this is the core of the redesign)
>
> ```
> businessType  = EXPORTER | IMPORTER | BOTH     -> which way goods flow  -> drives the JOURNEY
> role          = admin | compliance | salesman  -> job title in the org  -> drives PERMISSIONS
>                 | buyer | exporter | dual | arbitrator
> ```
>
> They are orthogonal. A compliance officer at an importing firm and one at an exporting firm share a
> job title and have opposite journeys. The current UI conflates them; the rebuild separates them.
>
> `activeDirection` derives from `businessType`: `EXPORTER` pins Export, `IMPORTER` pins Import,
> `BOTH` is user-switchable and persisted. **Every `trade_flow` parameter sent to a model comes from
> `activeDirection` and nowhere else.**
>
> ### 1b. Direction strategy: fork the question, share the machinery
>
> **Same routes, forked framing and forked model calls — not duplicated `ImporterX`/`ExporterX` pages.**
>
> Rationale: compliance screening, document verification, escrow, disputes and the ledger take a
> corridor, an HS6 and two parties. They are direction-agnostic *by nature*. Duplicating them yields
> two copies of one behaviour that drift apart. What genuinely differs is which **question** each
> screen asks and which **model** answers it:
>
> | Screen | Exporter question | Importer question | Model reality |
> |---|---|---|---|
> | Discovery | "Where should I sell this?" | "Who can supply me this?" | `partner_discovery` GRU ranks **destinations for Indian exports**. Exporter-only. Importer side is a documented **[GAP]** — no dataset exists. |
> | Counterparty | "Which verified buyers?" | "Which verified suppliers?" | `POST /predict/counterparty-match` finds **buyers**. Exporter-only. Importer side is a **[GAP]**. |
> | Assess | "Is this outbound sale unusual?" | "Is this inbound purchase unusual?" | `POST /api/trade-anomaly/predict` — **same model, real `trade_flow` param, genuinely different question.** |
> | Requests | Inbound RFQs from buyers | Outbound POs to suppliers | Direction-agnostic data, mirrored framing. |
> | Compliance / Documents / Escrow / Shipment / Disputes / Ledger | identical | identical | Shared. |
>
> **The asymmetry is honest and must be shipped as-is.** The importer journey is currently shorter
> because two exporter steps have no importer-side model. Padding it with a relabelled exporter model
> would be exactly the fabrication this project forbids. Importer discovery renders a
> `NotModelledState` naming the missing dataset, above the real, direction-agnostic listing browser.
>
> ### 1c. New route table (17 routes, down from 29)
>
> ```
> PUBLIC
>   /                      LandingPage          globe hero + scroll fly-through + CTA
>   /auth                  AuthPage             login + signup, one screen
>   /onboarding            OnboardingPage       org profile -> BUSINESS TYPE -> role
>
> APP  (ProtectedRoute + AppShell + direction-aware nav)
>   /home                  HomePage             command center, direction-framed
>   DISCOVER
>   /discover              DiscoverPage         exporter: market ranking / importer: gap + listings
>   /discover/:listingId   ListingDetailPage
>   /catalog               CatalogPage          exporter: my listings / importer: my requirements
>   /catalog/new           CatalogEditorPage    create listing (exp) / create requirement (imp)
>   ASSESS
>   /assess/:tradeId?      AssessPage           the 6 dimensions, never collapsed into one score
>   /counterparties        CounterpartiesPage
>   /counterparties/:id    CounterpartyDetailPage
>   DEAL
>   /requests              RequestsPage         RFQ inbox (exp) / PO outbox (imp)
>   /trades                TradesPage
>   /trades/:id            TradeWorkspacePage   tabs: Overview | Documents | Escrow | Shipment
>   SETTLE
>   /escrow/:tradeId?      EscrowPage
>   /disputes              DisputesPage
>   /ledger                LedgerPage
>   SYSTEM
>   /settings              SettingsPage         org, profile, direction switch      [NEW]
>   /admin                 AdminPage            role-gated
>   *                      NotFoundPage
> ```
>
> **Deleted / merged:**
>
> | Gone | Absorbed into | Why |
> |---|---|---|
> | `/login`, `/signup`, `/role-select` | `/auth` + `/onboarding` | Three routes, one component, no differentiating prop. |
> | `/marketplace`, `/market-intelligence` | `/discover` | Same question, two screens; `/market-intelligence` was navigationally orphaned. |
> | `/trade-analysis` | `/assess/:tradeId?` | Best-integrated page in the app, unreachable from the UI. Making it a first-class step is the highest value-per-effort fix in `user_flow.md`. |
> | `/my-listings`, `/export-catalog`, `/wishlist` | `/catalog` | Exporter catalogue and importer watchlist are the same surface, forked by direction. |
> | `/trade-requests`, `/trade-intent`, `/get-started` | `/requests` | `/get-started` was a marketing-funnel name pointing at an internal RFQ inbox. |
> | `/documents`, `/shipments` | `/trades/:id` tabs | Documents and shipments are always *of a trade*. Cross-trade views become filters on `/trades`. |
> | `/blockchain` | `/ledger` | Rename only. |
> | `/arbitrator` | `/disputes` | Identical component, no role differentiation. |
>
> **New:** `/settings` — there is currently no user, org, or direction-settings surface anywhere.
>
> ### 1d. Chrome and where direction lives
>
> - **`AppShell`** — top bar (logo, global search / command palette, direction switcher, org + user
>   menu) + a left **lifecycle rail** whose six steps are labelled by `activeDirection`.
> - **Direction switcher** sits in the top bar, and renders **only when `canSwitchDirection`**
>   (`businessType === "BOTH"`). For a pinned EXPORTER or IMPORTER it renders as a static,
>   non-interactive badge — the direction is a fact about the org, not a preference.
> - **First visit:** `/` → `/auth` → `/onboarding`. Onboarding step 2 is the business-type choice,
>   presented as the primary decision of signup (three large cards: *I export* / *I import* /
>   *Both*), because it determines the entire journey. It writes through
>   `WorkspaceContext.setBusinessType`.
>
> ### 1e. Design system
>
> Single source of truth: **`src/index.css` `:root` only.** No `.dark` block, no `@media
> (prefers-color-scheme)`, no `data-theme`.
>
> | Layer | Tokens |
> |---|---|
> | Surfaces | `--surface-0` page white, `--surface-1` raised card, `--surface-2` sunken / table header, `--surface-3` inset |
> | Hairlines | `--hairline`, `--hairline-strong` (dark alpha on light, not grey hexes) |
> | Text | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted` |
> | Brand | `--brand`, `--brand-hover`, `--brand-subtle` (+ `--brand-teal`, currently dead, now defined) |
> | Status | one fg/bg/border triplet per **real vocabulary term**: `verified`, `pending`, `review`, `blocked`, `stale`, `unavailable` |
> | Contrast | Dark-theme accents do not survive a theme flip. The current `--amber: #F59E0B` **fails WCAG AA on white** — status colours are re-picked for AA against `--surface-0` (amber → ~`#B45309`, emerald → ~`#0F9D6B`), not just reused. |
> | Radius / elevation | `--radius-sm/md/lg/xl`; light-theme elevation is hairline + tint, **not** dark-theme glow |
> | Aliases | `--bg-app`, `--bg-surface`, `--border-subtle` defined for the first time so existing classes resolve |
>
> `tailwind.config.js`: delete the Material-3 hex block entirely; every color key maps to a `var()`.
> Keep `container`, `spacing`, `fontFamily`, `fontSize`, `tailwindcss-animate`. Drop the dark-only
> `scan` keyframe. Fix `components.json` → `tailwind.config.js`.
>
> **Fonts** stay on the installed `@fontsource` families (Inter variable / Fraunces / IBM Plex Mono) —
> they are already local. The Google-Fonts `Poppins` `@import` at the top of `index.css` is dropped.
>
> **Deleted:** `src/context/ThemeContext.tsx`, the theme toggle, `src/App.css`, and the dark-only
> Aceternity effect components (`border-beam`, `spotlight-new`, `dotted-glow-background`,
> `moving-border`, `star-border`, `card-spotlight`, `glowing-effect`, `ShaderBackground.tsx`) — they
> are glow-on-black decoration with no light-theme equivalent. `marquee`, `timeline`, `split-text`
> and `text-generate-effect` are kept for the landing page.
>
> ### 1f. New shared domain components (`src/components/common/`)
>
> These encode the honesty rules once so no page can violate them:
>
> | File | Responsibility |
> |---|---|
> | `StatusBadge.tsx` | The **only** status vocabulary: Verified / Pending / Review Required / Blocked / Stale / Source Unavailable. No free-text label prop. |
> | `ComplianceBanner.tsx` | CLEAR / REVIEW REQUIRED / BLOCKED / UNSUPPORTED **plus the gating contract** — exposes `canProceed`, and consumers disable Create Trade / Escrow / payment from it rather than deciding themselves. |
> | `EscrowStateCard.tsx` | The 10 real escrow states, driven off `escrowService.getEscrowStatus()` and the real 3-condition struct. |
> | `DataSourceLabel.tsx` | Renders `live` / `fallback` / `demo` / `stub` from a response's own `dataSource`. Demo renders **DEMO DATA — NOT LIVE COMPLIANCE** inline, never as a tooltip. |
> | `SourceRef.tsx` | Visible citation next to every legal/compliance statement. |
> | `NotModelledState.tsx` | The honest gap state — names the missing dataset and what would close it. |
> | `EmptyState.tsx` / `ErrorState.tsx` / `LoadingSkeleton.tsx` | The three states 15 of 17 routes are missing. Built **as each route is wired**, not retrofitted. |
> | `MetricDial.tsx` | One of the 6 result dimensions. Six separate dials, never a single composite. |
>
> **Four false liveness badges must not survive:** `/escrow` "USDC Smart Vault Active", `/documents`
> "On-Chain Hash Anchoring Active", `/blockchain` "Ethereum Sepolia Live", `/shipments` "AIS Live
> Satellite Connected". Replaced by real status reads — the ledger says **Local Hardhat (31337)**,
> anchoring reads its real `501 ANCHORING_DISABLED`, shipments carry a demo label.
>
> `src/data/mockTradeData.ts` (1264 lines, 17 consumers) is not deleted wholesale — each consumer is
> cut over as its route is wired, and whatever still needs it renders behind `DataSourceLabel`.
>
> ### 1g. The globe
>
> **Keep `TradeGlobe.tsx` essentially as-is.** It stays on a deliberately **dark hero band** inside the
> light page — a full-bleed near-black section at the top of `/`, with the light UI beginning below
> it. This is a normal editorial device, it preserves the scroll fly-through and the Mumbai bloom
> unchanged, and it avoids re-tuning 1198 lines of three.js material and arc colours for a light
> backdrop (where glowing arcs on white read as washed-out smears).
>
> Minimum required changes:
> 1. Define `--bg-app` / `--border-subtle` / `--brand-teal` so `LandingPage.tsx`'s currently-dead
>    references resolve.
> 2. Scope the dark band explicitly rather than relying on the old global dark `body`.
> 3. **Vendor the runtime assets.** `TradeGlobe.tsx:1157-1158` pulls earth textures from unpkg and
>    `:375` pulls country GeoJSON from a raw GitHub URL — fetched over the public network on the first
>    paint of the first screen, with no SLA and subject to rate limits. Copy into `public/globe/` and
>    point at local paths. A real reliability fix for a demo, not polish.
>    **Care required:** the GeoJSON carries an India-sovereign Kashmir/Ladakh boundary patch applied
>    *after* fetch. When baking the file locally that patch must be preserved byte-for-byte. This is
>    politically sensitive content, not a cosmetic detail — diff the baked file against the patched
>    runtime output before accepting it.
> 4. `MarketIntelligencePage.tsx` also renders `TradeGlobe`; that usage moves to `/discover`, on a
>    light card, with the globe's own container carrying the dark surface.
>
> ---
>
> ## 2. Execution phases
>
> The app builds and runs at the end of every phase.
>
> **Phase 0 — Tooling and baseline.**
> `npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-author` and `--skill
> cypress-docs`, into `GlobeX-New/.claude/skills`. Record source, version, and any Gen/Socket/Snyk
> risk flag in `reports/tooling/skills_inventory.md` per the project's skills policy. Fix
> `components.json` → `tailwind.config.js`.
> **Capture the baseline before changing anything**: run `npx tsc --noEmit -p tsconfig.app.json` and
> `npx vitest run` and record what already fails, so later failures are attributable to this work.
> Then grep for the Material-3 class names about to be deleted (`on-surface`, `surface-container`,
> `inverse-`, `error-container`, …) and for literal dark values (`#070A0E`, `bg-black`,
> `border-white/`, `text-slate-[4-6]00`) to size the conversion punch list.
>
> **Phase 1 — Token foundation.**
> Rewrite `src/index.css` `:root` as the light system; rewrite `tailwind.config.js` color keys onto
> `var()`; delete `ThemeContext.tsx`, the toggle, `App.css`. Remove `ThemeProvider` from
> `src/App.tsx`. Audit `src/components/agent-elements/agent-ui.css` (imported by `index.css` purely as
> a side effect) and fold anything load-bearing into the token block before deleting it.
> *At this point the old pages render light-ish and ugly — that is expected and temporary; it is the
> punch list, not a regression.* Gate: `npx tsc --noEmit -p tsconfig.app.json`, `vite build`, app boots.
>
> **Phase 2 — Chrome + shared components.**
> Build `AppShell`, top bar, direction-aware lifecycle rail, and every file in §1f. Delete
> `RoleNavigation.tsx`, `Navbar.tsx`, `Sidebar.tsx`, `CoreFlowSidebar.tsx`, `DemoPersonaSwitcher.tsx`,
> `ShaderBackground.tsx`, `src/components/landing/*`, `src/pages/Index.tsx`, and the dark-only
> Aceternity components.
>
> **Phase 3 — Entry flow.**
> `/` (globe hero, vendored assets, light page below), `/auth`, `/onboarding` with **business-type
> selection as its primary step**. Build the auth UI against a single `useAuth()`-shaped hook wrapping
> `appwriteService`, so real Supabase Auth can be swapped in later without a second UI rewrite — but
> do **not** quietly "fix" the passthrough guard; that is backend/security scope. Gate: real browser —
> signup → pick direction → land on `/home` with the correct direction pinned.
>
> **Phase 4 — Route table + direction routing.**
> Rewrite `src/App.tsx` to §1c. Add legacy `<Navigate>` redirects for the old paths so existing links
> and the handoff docs' URLs keep working.
>
> **Phase 5 — Discover / Assess (the forked half).**
> `/discover` with the exporter ranking path vs the importer `NotModelledState`; `/catalog`,
> `/catalog/new`, `/assess/:tradeId?` (six separate dimensions), `/counterparties`. Wire
> `aiService.rankMarketOpportunity`, `predictTradeAnomaly` with `trade_flow` from `activeDirection`,
> `counterparty-match`, `compliance/rag-analyze`, `scoring/composite`.
>
> **Phase 6 — Deal / Settle (the shared half).**
> `/requests`, `/trades`, `/trades/:id` with the four tabs, `/escrow/:tradeId?`, `/disputes`,
> `/ledger`, `/settings`, `/admin`. Wire `escrowService` (already typed, already throws real error
> codes), `/api/v1/trades`, `/api/v1/trades/{id}/documents`, `/api/v1/documents/{id}/verify`,
> `/api/v1/blockchain/ledger`.
>
> **Phase 7 — Verification.**
> - `npx tsc --noEmit -p tsconfig.app.json` — zero **new** errors. (A large number of pre-existing
>   errors live in files being deleted; they go away with them.)
> - `npx vitest run` — **`src/test/coreFlowAndAuth.test.tsx` will break; it asserts the old IA**,
>   including the six old lifecycle labels and the literal hardcoded demo route
>   `/trades/TRD-IND-UAE-550K`. Rewrite it against the new route table alongside the Phase 4 change
>   rather than deleting it or leaving it red.
> - Cypress: install as a devDependency, `cypress.config.ts` + `cypress/e2e/`, and author two specs
>   with the `cypress-author` skill — one exporter journey, one importer journey — covering
>   onboarding → direction → discover → assess → trade → escrow state.
> - Playwright (`webapp-testing` skill) against live Vite + live FastAPI + live Hardhat, per
>   `05_DESIGN_TASTE_FRONTEND.md`'s required chain: login/onboarding → trade intent → market analysis
>   → counterparty → compliance → trade creation → escrow state → document verification → shipment →
>   settlement. Screenshots saved under `reports/frontend/`.
>
> **Phase 8 — Docs.**
> Rewrite `docs/product/user_flow.md` against the new IA and update
> `docs/product/importer_exporter_flow_design.md` §7 with what this pass actually implemented.
>
> ---
>
> ## Environment note before Phase 5
>
> `session_handoff_2026-08-24c.md` §3: the FastAPI process on port 8000 (PID 1276) was caught serving
> **stale in-memory code** and the prior session deliberately did not restart it. Restart it cleanly —
> `python -m uvicorn main:app --host 0.0.0.0 --port 8000` **without** `--reload` — before trusting any
> endpoint behaviour while wiring screens. Docker Desktop is not running by default on this machine;
> Supabase and n8n need it up.
>
> ---
>
> ## Risks
>
> | Risk | Handling |
> |---|---|
> | Big-bang rebuild leaves the app unbootable mid-way | Phase order is chosen so the app builds at every gate. Phase 1 leaves it ugly but running. |
> | Deleting pages breaks unknown inbound links | Legacy `<Navigate>` redirects in Phase 4 for every retired path. |
> | The importer journey looks thin next to the exporter's | **Intended.** It is thin because two of its models do not exist. `NotModelledState` says so out loud. |
> | Light theme washes out the globe | Globe stays on a scoped dark hero band. No three.js re-tuning. |
> | Real endpoints down while wiring | Every wired screen ships `ErrorState` in the same commit as its happy path. |
> | Fake auth makes `ProtectedRoute` meaningless | Out of scope, unchanged, and not papered over. A rebuilt `/auth` screen risks *implying* real auth exists — mitigated by the `useAuth()` boundary in Phase 3 and flagged in Phase 8 docs. |
> | `mockTradeData.ts` has 17 consumers | Migrated off incrementally as each route is wired; the file is deleted last, when the consumer count reaches zero. A single purge commit would blow up the diff. |
> | Vendoring the GeoJSON could drop the sovereignty patch | Diff the baked file against the patched runtime output before accepting. Politically sensitive, needs a real review. |
>
> ## Non-goals
>
> Real Supabase Auth · RLS · the importer-side discovery/supplier models · enabling blockchain
> anchoring · AIS shipment integration · real OCR · any backend, contract, n8n, or model change.
>
> ---
>
> ## Progress log
>
> - **Phase 0 — done.** `cypress-author` + `cypress-docs` installed project-level (see
>   `reports/tooling/skills_inventory.md`; `cypress-docs` carries a Snyk Medium-Risk flag, recorded,
>   not blocking). `components.json` fixed to point at `tailwind.config.js`. Baseline captured: 46
>   pre-existing `tsc` errors, 2 pre-existing `vitest` failures (the app's route table had already
>   drifted from `user_flow.md` before this session touched anything).
> - **Phase 1 — done.** `src/index.css` `:root` rewritten as the light system (surfaces, hairlines,
>   text hierarchy, AA-safe status/semantic accents, and the `--bg-app`/`--border-subtle`/
>   `--brand-teal` aliases that were referenced in 8 files and undefined anywhere — now real).
>   `tailwind.config.js` Material-3 hex block deleted, `darkMode` and the dark-only `scan` keyframe
>   dropped, every color key now a `var()`. `ThemeContext.tsx` and the orphaned `ThemeToggle.tsx`
>   (confirmed zero importers) deleted; `App.css` (confirmed zero importers) deleted; `App.tsx`
>   unhooked from `ThemeProvider`. Gate passed: `tsc --noEmit` still 46 (no new errors), `vite build`
>   succeeds.
>
> ## Where I would cut for a demo
>
> Phases 0–4 plus **`/home`, `/discover`, `/assess`, `/trades/:id`, `/escrow`** — that is the full
> Discover → Assess → Verify → Secure → Settle spine with a real escrow at the end, in both
> directions. `/catalog`, `/requests`, `/counterparties`, `/disputes`, `/ledger`, `/settings`,
> `/admin` can land in a follow-up pass behind the same shell.

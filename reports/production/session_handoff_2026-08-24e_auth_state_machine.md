# GlobeXAI — Session Handoff: Real Auth/Onboarding State Machine (Phase 2 done, Phase 3 code-complete)

**Date:** 2026-08-24 (fifth handoff, same day — continuation of the frontend rebuild described in
`session_handoff_2026-08-24d_frontend_rebuild.md`, whose plan text is the source of record for the
overall 8-phase rebuild).

**Read order:** this file, then re-read `session_handoff_2026-08-24d_frontend_rebuild.md` §5 for the
full 8-phase plan text (Phase 4 route table, Phase 5/6 content, Phase 7 verification, Phase 8 docs).
The local plan file `C:\Users\Aryan\.claude\plans\floating-puzzling-mitten.md` currently holds the
**Phase 3 auth/onboarding plan** (not the frontend rebuild plan — it was overwritten this session; if
you need it again, this handoff + the d-handoff's §5 fully reconstruct it).

**Status:**
- **Phase 2 (AppShell chrome)** — DONE, committed context lost track of exact commit but code is in
  the working tree (uncommitted, see §4). Verified via Playwright screenshots earlier this session:
  light-theme nav, direction-aware lifecycle rail, command palette, account menu all render correctly.
- **Phase 3, redefined mid-session** — the user explicitly overrode the parent plan's "frontend only"
  scope for auth/onboarding specifically: it must be a real backend-persisted state machine
  (`NO_SESSION → AUTH → FIRST_TIME_ONBOARDING → DASHBOARD → IMPORTER/EXPORTER_WORKSPACE`), not
  localStorage. **All application code for this is written and verified to compile/build/render
  correctly** — but the actual Supabase backend has **not been started or configured**, per an explicit
  user instruction to defer that (and the full Playwright verification suite) until **after Phase 8**
  of the parent rebuild plan. Do not start Supabase configuration unless the user asks for it or you've
  reached Phase 8 and are told to proceed.
- **Phases 4-8 of the parent plan** — NOT started.

---

## 1. What was built this session (Phase 3 — auth/onboarding state machine)

### New files
- `backend/database/supabase/migrations/20260824030000_onboarding_state.sql` — additive migration:
  adds `onboarding_step varchar(30) default 'PROFILE'` (check-constrained to
  `PROFILE|BUSINESS_TYPE|VERIFICATION|DONE`), `onboarding_completed boolean default false`,
  `onboarding_completed_at timestamptz` to `public.organizations`. Also adds **two RLS policies that
  were genuinely missing before this migration** (found by direct inspection, not assumed):
  `users_self_insert` (there was no INSERT policy on `public.users` at all — a fresh signup could never
  create its own row) and `organization_members_self_bootstrap` (the existing
  `organization_members_all` policy requires the org already be in `user_org_ids()`, which is always
  empty for a brand-new org's first-ever member — this policy allows exactly one case: a user inserting
  themselves as `ORGANIZATION_ADMIN` into an org that currently has zero members, i.e. becoming its
  founder). **This migration has not been applied anywhere** — no local Supabase Postgres has run it
  yet, since the local stack was never started this session.
- `src/lib/supabaseClient.ts` — `@supabase/supabase-js` client. **Important gotcha already fixed**:
  `createClient` throws *synchronously* on an empty API key (not just at call time) — this crashed the
  entire app on load the first time it was tested. Fixed by falling back to a non-empty placeholder
  string (`"unconfigured-placeholder-anon-key"`) when `VITE_SUPABASE_ANON_KEY` is unset, so the client
  constructs fine and only fails per-call (caught by `useAuth`'s try/catch) rather than crashing the
  module graph. Don't revert this fallback to an empty string.
- `src/services/auth/authService.ts` — all real Supabase calls: `signUp`, `signIn`, `signOut` (with
  `scope: "global"` — real server-side refresh-token revocation, not just local clear),
  `fetchAuthSnapshot` (reads `public.users` by `auth_id`, then `organization_members` joined to
  `organizations` for the linked org + its onboarding state), `saveOrgProfileStep`,
  `saveBusinessTypeStep`, `saveVerificationStep`, `uploadVerificationFile` (Supabase Storage —
  **the `kyc_documents` bucket does not exist yet**, needs creating when Supabase is configured).
- `src/hooks/useAuth.ts` — owns `appState: "NO_SESSION" | "AUTH_LOADING" | "ONBOARDING" | "DASHBOARD"`,
  computed fresh from session + DB on every load via `supabase.auth.getSession()` +
  `onAuthStateChange`, never a cached client flag. `appState` derivation:
  `!session → NO_SESSION`, `!appUser → AUTH_LOADING` (race: auth row exists, `public.users` insert not
  yet visible), `!organization || !organization.onboardingCompleted → ONBOARDING`, else `DASHBOARD`.
- `src/context/AuthContext.tsx` — thin provider wrapping `useAuth()`, mounted **above**
  `WorkspaceProvider` in `App.tsx` (`WorkspaceContext` now reads identity from `useAuthContext()`
  instead of owning it).
- `src/components/auth/OnboardingRouteGuard.tsx` — the inverse of `ProtectedRoute`, wraps `/onboarding`
  itself: `NO_SESSION → /auth`, `DASHBOARD → /dashboard` (never show onboarding again once complete),
  otherwise renders the wizard.
- `src/pages/DashboardLandingPage.tsx` — new role-selection landing at `/dashboard`, **deliberately
  chrome-free** (no `AppShell`/`AppNav`/`LifecycleRail` — this was an explicit user requirement: "do
  not show full importer/exporter navigation on the role-selection dashboard"). Shows one or two
  Import/Export cards depending on `canSwitchDirection` (i.e. `businessType === "BOTH"`), and plays a
  **full-screen brand-colored transition overlay** ("Entering Export/Import Workspace") before
  navigating to `/workspace` — this satisfies a separate explicit user request mid-session: "the entire
  UI should change with a subtle transition such that I should understand visually that the roles have
  changed."

### Modified files (high-signal changes only)
- `src/App.tsx` — `AuthProvider` now wraps `WorkspaceProvider`. Route changes: `/auth` is now the
  canonical auth route (`/login` → `<Navigate to="/auth">`), `/onboarding` wrapped in
  `OnboardingRouteGuard`, `/dashboard` now renders the new `DashboardLandingPage` (was the old full
  `DashboardPage`), and a **new** `/workspace` route renders the old `DashboardPage` content (full
  `AppShell` nav) — this is where "choosing Import or Export" actually lands. All other 18 protected
  routes are unchanged.
- `src/components/auth/ProtectedRoute.tsx` — full rewrite off `useAuthContext().appState`:
  `AUTH_LOADING → spinner`, `NO_SESSION → /auth`, `ONBOARDING → /onboarding`, else render children.
  **Verified live** (see §3) — direct navigation to `/dashboard`, `/trades`, `/onboarding` with no
  session all correctly redirect to `/auth`.
- `src/context/WorkspaceContext.tsx` — full rewrite. Dropped a large amount of **dead code** discovered
  during this rewrite: `role`, `dutyMode`, `setDutyMode`, `roleLabel`, `roleAccentColor`,
  `roleBadgeClass`, `isBuyer`, `isExporter`, `isAdmin`, `isCompliance`, `isSalesman`, `isDual`,
  `register`, `login`, `setRole`, `setBusinessType`, `uploadDocument` — **confirmed via full-repo grep
  that none of these were consumed anywhere outside the context file itself** before deleting them; if
  you find a compile error referencing one of these, something changed since — re-grep before
  re-adding, don't assume it's needed. What's kept: `user` (now derived from `useAuthContext()`'s
  `appUser`/`organization`, same shape other components expect — `userId, name, email, roleTitle,
  companyName, country`), `businessType`, `activeDirection`/`setActiveDirection`/`canSwitchDirection`
  (unchanged logic), `isExporterView`/`isImporterView`, the `listings` slice (untouched, unrelated),
  and `logout` (delegates to `useAuthContext().signOut`).
- `src/components/auth/AuthAccordion.tsx` — full rewrite. **Org creation moved out of this component
  entirely** — the Register tab (now labeled "Create Account") collects only full name/email/password
  and calls `useAuthContext().signUp`, then unconditionally navigates to `/onboarding` (never
  `/dashboard`) since a brand-new account has no org yet. Sign In tab calls `signIn`, navigates via
  `onSuccess` prop or `/dashboard` — safe because `ProtectedRoute`/`OnboardingRouteGuard` will bounce an
  incomplete-onboarding user forward regardless of what URL they land on first.
- `src/pages/OnboardingPage.tsx` — full rewrite to a 3-step wizard (`PROFILE → BUSINESS_TYPE →
  VERIFICATION`), driven by `organization?.onboardingStep` from `useAuthContext()` on every render —
  **this is what makes "resume at correct step" survive a refresh**, not a `useState` step counter.
  Step 1 creates the org + founding `ORGANIZATION_ADMIN` membership. Step 3's document upload calls
  `uploadVerificationFile` (Storage — bucket doesn't exist yet, see §2) then
  `saveVerificationStep`, which sets `onboarding_completed = true`.
- `src/pages/AuthPage.tsx` — recolored off the old hardcoded `#070A0E` dark background onto
  `var(--surface-0)` etc. (trivial, in-scope since the file was already being touched).
- `src/pages/AdminSystemPage.tsx`, `src/components/disputes/DisputeResolutionSuite.tsx` — minimal
  compatibility fixes only (both imported the now-deleted `appwriteService`): `AdminSystemPage` now
  shows a Supabase-config-presence check instead of the fake Appwrite status;
  `DisputeResolutionSuite` now reads `useWorkspace().user` instead, with `isArbitrator` approximated as
  `roleTitle === "Admin"` since the real `organization_role` enum has no "arbitrator" value (arbitration
  is a separate `platform_role` concept in the real schema — flagged in a code comment, not resolved,
  since this component is mock-data-driven and out of scope per the parent plan).
- `src/components/ui/SpecularButton.tsx` — **fixed a real pre-existing bug, unrelated to auth but
  discovered while testing the new auth UI live**: the `sky` and `amber` variants used
  `bg-[var(--brand-blue)]/90`-style Tailwind arbitrary-value-plus-opacity-modifier syntax, which
  silently fails to apply an alpha channel to a CSS custom property reference — the class was dropped
  entirely, leaving a transparent background with white text on top of it (invisible button). This was
  blocking the "Create Account" and onboarding "Continue" buttons. Fixed by using the solid `var()`
  color directly with `hover:brightness-110` instead of an opacity modifier. Also fixed `amber`
  referencing `--warning`/`--warning-bg`, which **don't exist anywhere in `src/index.css`** — remapped
  to the real `--amber`/`--amber-dim` tokens. **Not fixed** (out of scope, not blocking anything used
  this session): `outline`/`ghost`/`secondary` variants reference `--neutral-bg` for their hover-glow
  effect, which also doesn't exist — low priority, the button's actual background/text still render
  fine without it, only the follow-cursor glow effect silently no-ops.

### Deleted
- `src/services/appwrite/client.ts` — the entire localStorage auth mock. Confirmed zero remaining
  importers via grep before deleting.
- `src/components/reactbits/Auth4Block.tsx` — confirmed orphaned (zero importers anywhere) before
  deleting; it imported the old `useWorkspace().login/register` which no longer exist, so it would have
  been a dead compile error otherwise.

---

## 2. What's deliberately NOT done — Supabase is not configured

**Explicit user instruction: do this after Phase 8, not now.** Do not start it unless told to.

When you do reach this step, it's exactly the "Last" step already documented in this session's now-
superseded plan file — reproduced here so it isn't lost:

1. `supabase start` from `backend/database/` (the local stack's `[auth]` block in `config.toml` is
   already configured — `enabled = true`, email signup on, `jwt_expiry = 3600` — just needs starting).
2. `supabase db reset` to apply `20260824030000_onboarding_state.sql` (and everything before it).
3. Copy the printed local `anon` key from `supabase status` into `.env` as `VITE_SUPABASE_URL`
   (`http://127.0.0.1:54321`) and `VITE_SUPABASE_ANON_KEY`.
4. Create the `kyc_documents` Storage bucket (currently commented out in `config.toml`'s `[storage]`
   block — no bucket exists locally yet; `OnboardingPage`'s step 3 upload will fail without it).
5. Only then run the full Playwright verification (register → onboard → dashboard; session survives a
   frontend restart and a browser close/reopen; logout actually revokes the server-side refresh token,
   not just clears local storage; existing onboarded user logs in straight to dashboard; a user seeded
   mid-onboarding resumes at the correct step; BOTH vs pinned EXPORTER/IMPORTER direction behavior;
   protected routes blocked with no session). A second Plan-agent pass this session sketched a more
   elaborate version of this (separate `user_onboarding_state` table, 5-step wizard with a `REVIEW`
   step, detailed Playwright fixture code with service-role admin cleanup) — that was **not** the
   approved design (the simpler organizations-column approach above was approved and implemented), but
   its Playwright fixture/teardown sketch (service-role `admin.auth.admin.deleteUser` +ExplicitOnDelete
   cascade caveat: `public.users.auth_id` has **no** `on delete cascade`, so admin cleanup must delete
   dependent rows in `verification_documents`/`organization_members`/`organizations`/
   `user_onboarding_state`-equivalent/`users` *before* deleting the `auth.users` row, or it'll hit an FK
   violation) is genuinely useful reference material if you write the Playwright suite — worth
   re-reading that agent's full output if you have it, otherwise just remember the FK-cascade gotcha.

---

## 3. Live verification already done this session (without Supabase running)

Confirmed via Playwright/Claude-in-Chrome against the dev server with **no** Supabase configured (the
placeholder-key fallback from §1 keeps the client constructible, so the app renders and the state
machine's `NO_SESSION` branch works correctly even fully offline):

- `tsc --noEmit -p tsconfig.app.json` — 46 errors, unchanged baseline (zero new), confirmed after every
  batch of changes.
- `vite build` — succeeds.
- Direct navigation to `/dashboard`, `/trades`, `/onboarding` with no session all correctly redirect to
  `/auth` (screenshotted, not just asserted).
- `/auth` renders correctly on light tokens; Sign In tab's submit button renders correctly (teal,
  visible text); Create Account tab **was broken (invisible button)** until the `SpecularButton` fix in
  §1, then re-verified fixed (blue background, visible white text, "Create Account & Continue →").
- `npx vitest run` was **not** re-run this session after these changes — do that before trusting it;
  the last known state (from the Phase 2 handoff) was `coreFlowAndAuth.test.tsx` failing at
  import-resolution because it imports the now-deleted `CoreFlowSidebar` — that's expected and
  untouched (Phase 7 rewrites this test file against the new IA, not this phase).

**Not yet verified live** (blocked on Supabase being configured, per §2): actual sign-up/sign-in
round-trips, the onboarding wizard's 3 real steps, session persistence across restart/browser-close,
real server-side logout invalidation, direction-switch transition overlay in the real (non-mocked)
flow.

---

## 4. Environment / repo state right now

- **Nothing committed this session** — `git status` shows a large uncommitted diff (Phase 2 chrome +
  this session's Phase 3 auth work all mixed together, since neither was committed yet). Decide how to
  split/commit when asked — don't commit unprompted.
- **No dev server / Supabase / Hardhat / chain-adapter processes left running** — all were killed at
  the end of each verification pass this session (`pkill -f vite`). Nothing to clean up on resume.
- `package.json` gained `@supabase/supabase-js` as a real dependency (not just the `supabase` CLI
  devDependency that was already there).

---

## 5. Immediate next steps (in order)

1. Confirm with the user whether to proceed straight into **Phase 4 — route table rewrite** (the parent
   plan's 17-route table, `docs/product/user_flow.md`-driven, with legacy `<Navigate>` redirects for
   every retired path) — this session ended by asking that and awaiting direction.
2. If continuing: re-read `session_handoff_2026-08-24d_frontend_rebuild.md` §5 in full for the Phase
   4-8 plan text before touching `src/App.tsx` again — Phase 4's route table is a bigger rewrite than
   this session's additive `/auth`/`/dashboard`/`/workspace` changes, and will need to reconcile with
   the auth-gating routes just built here (e.g. the new route table's `/escrow/:tradeId?` etc. all need
   to stay wrapped in `ProtectedRoute` the same way).
3. `npx vitest run` — get a fresh baseline reading before Phase 4 changes anything further.
4. Do not start Supabase configuration (§2) until Phase 8 is complete and the user confirms, per their
   explicit instruction this session.

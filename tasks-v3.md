# GLOBEX UI/UX — Iteration 3 Tasks

## Mission

Iteration 3 is about:

1. Removing the unnecessary dashboard-demo CTA.
2. Making Sign In ↔ Register feel like one physical/authentication surface that moves and reveals different contextual information.
3. Making the auth surface feel like it has emerged from the Mumbai/globe experience rather than being a static form placed over a background.
4. Replacing page-specific/random sidebars with one stable core user-flow sidebar.
5. Aggressively reducing frontend memory/CPU/GPU usage so the app feels light on Vercel and in the browser.
6. Preserving every existing business workflow and route.

This is not a redesign of the business logic.

---

# A. AUTHENTICATION EXPERIENCE

## A1 — P0 — Remove the static two-column "form + marketing panel" feeling

### Current problem

The current auth page has:

- form on the left
- static enterprise copy on the right
- sign-in/register toggle near the top
- background globe/map
- a disconnected "card over background" feeling

The user wants the authentication surface to feel as though it has emerged from the geographic/globe experience.

### Required model

Treat the auth UI as a **floating translucent authentication cockpit** attached to the globe landing sequence.

Conceptually:

```text
Background
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      spinning globe → zoom → Mumbai → emergence             │
│                              ↓                              │
│                translucent auth surface                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The auth panel should not feel like a separate website pasted over the globe.

### Visual requirements

- Keep the dark GLOBEX palette.
- Add subtle translucency to the main auth surface.
- Use low-opacity glass only where it improves the emergence effect.
- Avoid strong backdrop blur on the entire screen.
- Keep text crisp.
- Preserve the existing two-column information architecture where useful, but make the panel feel like one floating object.

Recommended surface treatment:

```css
background: rgba(5, 10, 18, 0.78);
border: 1px solid rgba(80, 180, 220, 0.12);
backdrop-filter: blur(8px);
```

Do not apply expensive blur to the whole page or globe.

---

# A2 — P0 — Remove the "Dashboard Demo" button

The floating `Instant Dashboard Demo` / dashboard demo CTA is unnecessary on the auth/landing experience.

Remove it completely.

Do not replace it with another CTA.

Do not leave an empty interaction zone where it existed.

The main user flow should be:

```text
Globe / map
→ authentication
→ workspace
```

---

# A3 — P0 — Sign In ↔ Register becomes a physical panel transition

The sign-in and registration modes must feel like the same physical authentication object changing state.

## Sign In state

Default:

- authentication panel is positioned slightly toward the right half of the visual composition
- a subtle contextual panel/content region appears on the left
- sign-in form is the primary focus

## Register state

When Register is clicked:

- the authentication object shifts toward the right
- the left contextual region changes
- registration-specific information/content appears on the left
- the register form becomes the focused content

The movement must feel like the panel is sliding/rotating/revealing a different layer, not like the entire route reloaded.

### Required transition

Use a single shared `authMode` state:

```ts
type AuthMode = 'signin' | 'register'
```

Do not duplicate the auth page implementation.

Recommended animation sequence:

```text
REGISTER CLICK
    ↓
current contextual content fades/slides left
    ↓
auth surface shifts 40–90px right
    ↓
new contextual content emerges from left
    ↓
register form fades/slides into focus
```

Duration:

- 450–650ms total
- ease-out
- no overshoot that feels playful
- no layout jump

Use `motion` for this state transition if Motion is already in the project.

---

# A4 — P1 — The left contextual region must be meaningfully different

Do not merely change the heading from "Sign in" to "Register".

## Sign-in contextual content

Example:

```text
RETURN TO YOUR TRADE NETWORK

Your active corridors, contracts,
documents and settlement state
continue from your last session.

[small network / corridor indicator]
```

## Register contextual content

Example:

```text
ENTER THE GLOBEX TRADE NETWORK

Create an institutional workspace
for import/export operations,
counterparty discovery and settlement.

[small 3-step onboarding indicator]
```

Keep this content short.

The left region exists to explain context, not advertise six features.

---

# A5 — P1 — Registration should visually "emerge from Mumbai"

The current globe experience zooms toward Mumbai.

Use that interaction as the visual origin for the auth surface.

### Desired effect

```text
globe rotates
      ↓
camera zooms toward Mumbai
      ↓
Mumbai becomes the visual anchor
      ↓
a translucent authentication surface emerges
      ↓
surface settles into final position
```

The auth surface can use:

- slight translate
- slight scale from 0.96 → 1
- opacity 0 → 1
- small blur 8px → 0px
- subtle shadow
- no large bounce

Recommended final transition:

```css
opacity: 0 → 1
transform: translate3d(40px, 0, 0) scale(0.96) → translate3d(0, 0, 0) scale(1)
```

For Register mode, use a slightly stronger rightward shift and a left-side reveal.

---

# A6 — P0 — Respect the globe/map lifecycle

Do not run the expensive globe effect at full intensity forever.

Create explicit visual phases:

```ts
type LandingPhase =
  | 'idle'
  | 'rotating'
  | 'zooming'
  | 'mumbai'
  | 'auth-reveal'
  | 'auth-ready'
```

Once `auth-ready` is reached:

- stop or heavily reduce the globe animation
- stop expensive particles
- stop unnecessary map updates
- keep only a very low-cost background state

The globe does not need to continue consuming GPU resources after the user is interacting with auth.

---

# A7 — P1 — Auth panel translucency without excessive GPU cost

Avoid applying `backdrop-filter: blur()` to huge surfaces.

Use blur only on:
- the auth surface
- small overlays
- compact UI

Do not use full-screen glass effects.

Prefer opacity + border + shadow over large-area blur.

---

# A8 — P1 — Auth animation accessibility

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is requested:

- no globe rotation
- no zoom animation
- no sliding authentication panel
- no decorative reveal
- auth content appears immediately

Functionality and visual hierarchy must remain intact.

---

# B. CORE USER-FLOW SIDEBAR

## B1 — P0 — Delete page-specific random sidebar definitions

Do not generate separate sidebars for:

- Dashboard
- Marketplace
- Export Catalog
- Trade Requests
- Documents
- Active Trades

The user explicitly does not want each page inventing its own sidebar.

Create ONE shared product-level sidebar model.

Component:

```text
CoreFlowSidebar
```

It should appear consistently across authenticated workspace pages.

---

# B2 — P0 — Sidebar represents the core user journey, not page sections

The sidebar must contain only the actions a user repeatedly needs to complete the central trade workflow.

Recommended model:

```text
01  Command Center

02  Source / List
03  Discover
04  Requests
05  Active Trades

06  Documents
07  Settlement
```

Adapt labels to the actual product routes.

The exact route mapping must come from the existing application.

Do not invent fake functionality.

---

# B3 — P0 — Sidebar should support the complete workflow

The sidebar should let a user skim the application as a workflow:

```text
Command Center
      ↓
Find / List goods
      ↓
Create / receive trade request
      ↓
Inspect trade
      ↓
Manage documents
      ↓
Track active trade
      ↓
Settlement
```

This is the mental model.

Low-frequency settings, technical information, diagnostics and feature marketing should not appear as top-level sidebar entries.

---

# B4 — P1 — Sidebar labels must be action-oriented

Bad:

```text
Tariff Intelligence
Settlement Vault
Trust Graph
Arbitration Protocol
```

These are system capabilities.

Preferred:

```text
Trade Discovery
Trade Requests
Active Trades
Documents
Settlement
```

The sidebar communicates user actions and workflow states.

Technical capabilities should appear inside those workflows.

---

# B5 — P1 — Contextual highlight without changing sidebar structure

The same sidebar remains visible.

The active item changes based on current route.

Example:

```text
Command Center      ← active
Trade Discovery
Trade Requests
Active Trades
Documents
Settlement
```

Marketplace does not get its own separate sidebar.

Instead:

```text
Trade Discovery     ← active
```

Export Catalog maps to the appropriate workflow entry.

---

# B6 — P1 — Use LineSidebar only as the visual implementation

Reuse the already integrated React Bits `LineSidebar`.

Do not create multiple copies with different item arrays on each page.

Create one shared data model and one shared component.

---

# C. FRONTEND PERFORMANCE / MEMORY

## C1 — P0 — First identify where "RAM issues" actually originate

Do NOT blindly optimize random components.

Measure:

### Browser side
- JS heap
- DOM node count
- active canvas/WebGL contexts
- GPU memory indicators where available
- React render frequency
- event listener count
- active animation frames
- image memory
- network payload size

### Vercel side
- Function invocations
- wall duration
- active CPU
- provisioned memory
- function errors
- cold starts
- API payload sizes

Vercel's current Fluid Compute model tracks active CPU and provisioned memory separately; use Vercel Observability to determine whether the issue is actually server function resource usage rather than the browser. citeturn597921search1turn597921search2

Do not claim "RAM issue fixed" without identifying the source.

---

# C2 — P0 — Audit all requestAnimationFrame loops

Search the entire repository for:

```text
requestAnimationFrame
setInterval
setTimeout
addEventListener
ResizeObserver
IntersectionObserver
MutationObserver
WebSocket
EventSource
```

Every long-running loop or listener must have a lifecycle.

Required pattern:

```text
mount
  → initialize
  → run
unmount / hidden
  → cancel
  → disconnect
  → dispose
```

React's Effect lifecycle requires external subscriptions/animations/connections to be cleaned up when their setup is no longer active. citeturn634388search0turn634388search1

---

# C3 — P0 — Fix SpecularButton's continuous render loop

The supplied `SpecularButton` implementation creates a WebGL renderer and starts a `requestAnimationFrame(update)` loop in its effect. The update function schedules another frame every iteration. fileciteturn1file0L256-L284

This means the component can continue consuming a frame loop even when `autoAnimate={false}`.

## Required optimization

Refactor the component so that:

- no RAF runs while the button is completely idle
- start RAF on pointer proximity / interaction
- stop RAF after the visual state settles
- or use a low-frequency update when idle
- cancel RAF on unmount
- dispose WebGL context
- disconnect `ResizeObserver`
- remove global pointer listener

Do not create one full-time RAF loop per button.

This is a high-priority optimization.

---

# C4 — P0 — SpecularButton should use one shared interaction layer when possible

If multiple SpecularButtons exist on one page:

Do not attach a separate expensive `window.pointermove` listener and full WebGL loop to every button unless profiling proves it acceptable.

Prefer:

```text
one pointer tracking layer
        ↓
button-specific proximity state
        ↓
activate WebGL effect only for focused/nearby button
```

At minimum, keep only the active/nearby button rendering.

---

# C5 — P0 — Pause globe/WebGL when not visible

Use `IntersectionObserver` or page visibility signals.

When the globe is:
- below the fold
- hidden behind auth
- on a different route
- browser tab is hidden

stop or reduce animation.

On visibility return, resume.

Do not continuously animate a hidden canvas.

---

# C6 — P0 — Destroy WebGL contexts on route transition

For every WebGL/canvas component:

- cancel RAF
- remove event listeners
- disconnect observers
- remove canvas
- dispose renderer/resources
- release WebGL context where supported

The supplied SpecularButton already performs part of this cleanup, including cancelling the RAF and losing the WebGL context, but the lifecycle must also be optimized so the loop does not run unnecessarily while mounted. fileciteturn1file0L286-L291

---

# C7 — P0 — Limit device pixel ratio

For decorative GPU effects:

```js
const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
```

Do not render a decorative canvas at 3× or 4× DPR on high-density displays unless there is a measured reason.

This applies to:
- globe
- particle layers
- specular effects
- decorative canvas effects

---

# C8 — P1 — Lazy-load heavy visual components

Do not load:
- globe
- WebGL effects
- large animation components
- dashboard-specific visualization code

until they are actually needed.

Use dynamic imports / route-level splitting appropriate to the current framework.

The authentication experience should not eagerly download every dashboard visualization.

---

# C9 — P1 — Route-level code splitting

Authenticated sections should not ship all code to the initial auth/landing page.

Split:

```text
auth
dashboard
marketplace
trade workspace
documents
```

Load route-specific code when the route is entered.

---

# C10 — P1 — Reduce React render churn

Audit components that re-render from:

- pointer movement
- scroll
- animation progress
- hover state
- clock/timer state
- global context

Pointer position and animation progress generally belong in refs or an external animation layer rather than causing the entire page to re-render.

Use:

- `useRef`
- `memo`
- `useMemo`
- `useCallback`
- local state only where visual state genuinely affects React rendering

Do not add memoization blindly.

Measure first.

---

# C11 — P1 — Avoid global pointermove state

Search for:

```js
window.addEventListener('pointermove', ...)
```

Global pointer events should not call `setState` on every movement.

Use:
- refs
- CSS variables
- requestAnimationFrame throttling
- component-local pointer handlers

React's documentation specifically emphasizes cleanup for event subscriptions and avoiding unnecessary Effect re-runs. citeturn634388search0turn634388search1

---

# C12 — P1 — Virtualize genuinely long lists

For:
- documents
- trade history
- marketplace listings
- large catalogs

If the rendered count becomes large, use virtualization.

Do not virtualize tiny lists such as the three visible active trades in the Dual View.

Potential lightweight library:

```text
@tanstack/react-virtual
```

Only add it if the actual dataset size warrants it.

---

# C13 — P1 — Avoid rendering hidden pages

Do not keep large inactive page trees mounted merely to preserve navigation.

When navigating away from:

- dashboard
- marketplace
- trade workspace

unmount heavy page-level visualizations.

Use route-level lifecycle.

---

# C14 — P1 — Image optimization

Audit all background/world/globe/map assets.

Use:
- AVIF/WebP where supported
- responsive images
- correct intrinsic dimensions
- lazy-loading for non-critical images
- no enormous source image when a smaller asset is sufficient

Do not preload decorative images unnecessarily.

---

# C15 — P1 — Avoid giant background images

The current landing globe/background appears to cover a large region.

Compress it aggressively.

Where the visual can be generated procedurally or rendered at a lower resolution without perceptual loss, do so.

Do not trade a 5 MB decorative background for a 200 KB optimized asset.

---

# C16 — P1 — API payload discipline

Audit API responses.

Do not return:
- unused fields
- entire catalog datasets when only the first page is visible
- duplicated nested entities

Add:
- pagination
- field selection where possible
- server-side filtering
- caching where valid

Do not change API contracts without preserving backward compatibility.

---

# C17 — P1 — Cache stable trade intelligence

For data that does not need every-render freshness:

- cache at the appropriate client/server boundary
- avoid duplicate requests on route transitions
- deduplicate identical requests
- avoid refetching stable data after every minor UI interaction

Do not cache user-specific sensitive data insecurely.

---

# C18 — P1 — Abort obsolete fetches

Every route-level or effect-based request that can become obsolete should support cancellation.

Pattern:

```text
navigation/change
     ↓
AbortController.abort()
     ↓
ignore obsolete response
```

This avoids retaining unnecessary response data and prevents stale state updates.

React's Effect model recommends cleanup for fetches that can become obsolete. citeturn634388search1

---

# C19 — P0 — Vercel Functions: identify and reduce server memory hotspots

Inspect Vercel Observability for:

- highest provisioned memory functions
- highest active CPU functions
- highest invocation functions
- slowest endpoints
- unexpectedly frequent endpoints

Prioritize server endpoints involved in:
- AI calls
- PDF/document processing
- OCR
- HS-code processing
- trade analytics
- large database queries

Do not increase the Vercel memory limit as the first solution.

First reduce:
- payload size
- duplicated work
- unnecessary serialization
- large in-memory arrays
- repeated external calls
- repeated parsing
- oversized query results

Vercel's current Fluid Compute model uses provisioned memory and active CPU as separate usage concepts, so profile the specific function rather than assuming the whole deployment has a RAM problem. citeturn597921search1turn597921search2

---

# C20 — P1 — Verify Fluid Compute configuration

Check the Vercel project settings.

If Fluid Compute is available and appropriate for the current deployment, verify its status rather than assuming it is enabled.

Do not change production settings blindly.

Measure before/after.

---

# C21 — P1 — Avoid background work on Vercel unless necessary

Audit:

- cron jobs
- background fetches
- polling
- analytics loops
- automatic refresh
- repeated document processing

Any process firing more frequently than required must be reduced or moved to a more appropriate architecture.

A 5-minute cron or repeated polling loop can create substantial resource usage even when the UI itself appears idle.

---

# C22 — P0 — Performance budget

Establish target budgets:

### Initial load
- minimal auth shell first
- heavy globe/visuals deferred

### Runtime
- no unnecessary continuous RAF loops
- no pointer-driven React render storm
- no hidden WebGL rendering

### Memory
- no steady heap growth during route navigation
- no increasing canvas/WebGL contexts after repeated navigation
- no accumulating event listeners

### Navigation test

Perform:

```text
Dashboard
→ Marketplace
→ Trade Requests
→ Active Trade
→ Documents
→ Dashboard
```

Repeat at least 5 times.

Memory should stabilize rather than grow continuously.

---

# D. UI CLEANUP

## D1 — P0 — Dashboard Demo removal

Completed requirement:

- [ ] remove `Instant Dashboard Demo`
- [ ] remove related state
- [ ] remove unused imports
- [ ] remove dead handlers
- [ ] remove dead CSS
- [ ] remove related assets if no longer used

---

# D2 — P1 — Login/register header

The Sign In / Register toggle should remain compact.

Use one segmented control.

Do not add another navigation layer.

---

# D3 — P1 — Auth footer

Keep:

```text
CEPA Schedule Rules · EVM Verified
© 2026 GLOBEX
```

but keep it visually quiet.

Do not add more badges.

---

# D4 — P1 — Auth form hierarchy

Final hierarchy:

```text
Sign in / Create account
short explanation
form
primary CTA
alternative auth
demo persona disclosure
security reassurance
```

The registration-specific contextual content belongs in the animated left region, not inside the form as extra clutter.

---

# E. IMPLEMENTATION ARCHITECTURE

Create:

```text
components/
  layout/
    AppShell
    CoreFlowSidebar
    GlobalHeader

  auth/
    AuthShell
    AuthContextPanel
    AuthModeTransition
    SignInForm
    RegisterForm

  performance/
    usePageVisibility
    useRafController
    useStablePointer
    useAbortableFetch
```

Do not create these exact files if equivalent abstractions already exist.

Reuse existing components first.

---

# F. DEFINITION OF DONE

## Auth

- [ ] Dashboard Demo button is completely removed.
- [ ] Auth surface appears translucent/floating.
- [ ] Sign In and Register feel like the same physical UI surface.
- [ ] Clicking Register shifts the authentication composition right.
- [ ] New registration-specific contextual content appears on the left.
- [ ] Clicking Sign In reverses the transformation.
- [ ] Globe/Mumbai transition leads naturally into auth reveal.
- [ ] Globe animation reduces/stops after auth becomes interactive.
- [ ] Reduced-motion mode disables decorative motion.

## Navigation

- [ ] There is one CoreFlowSidebar.
- [ ] It is reused across authenticated pages.
- [ ] It represents the actual core user journey.
- [ ] Random page-specific items are removed.
- [ ] Technical capabilities are not top-level workflow entries.
- [ ] Every important existing workflow remains reachable.

## Performance

- [ ] All RAF loops are audited.
- [ ] All event listeners are audited.
- [ ] All observers are audited.
- [ ] All WebGL components are audited.
- [ ] SpecularButton does not maintain unnecessary continuous render loops while idle.
- [ ] Hidden WebGL/canvas components pause.
- [ ] WebGL resources are disposed.
- [ ] Device pixel ratio is capped for decorative effects.
- [ ] Heavy routes/components are lazy-loaded.
- [ ] Long lists are virtualized only where warranted.
- [ ] Obsolete fetches are aborted.
- [ ] Duplicate requests are eliminated.
- [ ] Navigation does not cause growing heap usage.
- [ ] Vercel function hotspots have been measured instead of guessed.

## Final UX

The app should now feel:

```text
Light
Operational
Spatial
Intentional
Fast
```

not:

```text
Heavy
Decorative
Always animated
Dashboard-demo-like
```

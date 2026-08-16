# GLOBEX UI/UX — Iteration 4 Tasks

## Objective

This iteration corrects the information architecture around authentication, trade requests, the core sidebar, and the Marketplace.

The product must now communicate four clear facts:

1. Authentication is a compact account-access control, not a major sidebar destination.
2. `Trade Requests` means **requests received by the current organization**.
3. `Create New Trade Request` belongs inside the Marketplace/product-discovery flow.
4. The Marketplace should expose a clear **Top 10 Buyers** area and a restrained Bento-style organization of content, without returning to the overly glowing futuristic aesthetic.
5. remove names like ramesh and user only english names like jhon doe etc

Preserve all underlying functionality, routes, APIs, data, and existing trade logic.

---

# 1. P0 — Remove the persistent Core Flow sidebar from the current page layout

## Current problem

The current sidebar contains:

- Command Center
- Trade Discovery
- Trade Requests
- Active Trades
- Documents
- Settlement

Even though these are legitimate concepts, the current rendering makes the sidebar visually dominant and consumes a large, mostly empty vertical area.

The current screenshot also shows that the user does not need this persistent side rail to understand the immediate workflow.

## Required change

Remove the persistent left-side `LineSidebar` from the main authenticated content layout.

Do not delete the underlying navigation model.

Instead:

- keep the canonical route/workflow mapping internally
- expose navigation through the existing compact global navigation / menu
- use local in-page navigation only when a page genuinely contains multiple important sections

Do not replace the sidebar with another permanently visible vertical navigation rail.

## Acceptance criteria

- No large empty left rail.
- Main content receives the full available width.
- No duplicate navigation appears.
- Every important existing destination remains reachable.
- Mobile navigation remains functional.

## Important

Do not remove the route destinations themselves.

This is a layout simplification, not a feature removal.

---

# 2. P0 — Authentication becomes an accordion-style account switcher

## Current problem

The previous authentication treatment uses a large two-mode surface.

For the current product, Sign In / Register should consume less space and feel like one compact account control.

## Required design

Use a compact accordion-style authentication control.

Concept:

```text
┌───────────────────────────────┐
│ Sign In                       │
│ Create account          ˅     │
└───────────────────────────────┘
```

Clicking the collapsed control reveals the selected mode.

Alternative accepted composition:

```text
[ Sign In      Register ]
        ↓
expanded form
```

But the interaction must feel like **one account-access module**, not two unrelated pages.

## Behavior

### Default
- Sign In is the default expanded state.

### Register
When the user selects Register:
- collapse Sign In content
- expand Register content in the same position
- do not navigate to a completely separate full-page composition unless the existing route architecture requires it
- preserve route semantics if routes already exist

Use one shared auth state:

```ts
type AuthMode = 'signin' | 'register'
```

or an equivalent existing state abstraction.

## React Bits component

Use the supplied `AccordionGallery` only if it genuinely improves the transition of the auth mode itself.

The supplied component supports hover/click/focus and animated panel expansion via GSAP. fileciteturn2file0L5-L8 fileciteturn2file0L31-L50

Do NOT use image panels for authentication merely because the component is available.

A better implementation is to reuse the accordion interaction concept with normal GLOBEX content.

Avoid visual gimmicks.

---

# 3. P1 — Keep the globe/Mumbai identity but reduce the auth footprint

The globe/Mumbai emergence concept from the previous iteration remains valid.

However, the authentication surface should now be substantially lighter.

Desired relationship:

```text
Globe / Mumbai context
        ↓
compact translucent auth module
        ↓
Sign In OR Register
```

Do not place a giant two-column marketing wall over the globe.

Keep:
- subtle translucent surface
- restrained entrance motion
- strong readability
- reduced blur
- low GPU cost after the auth surface appears

Do not reintroduce large static enterprise marketing copy.

---

# 4. P0 — `Create New Trade Request` moves to Marketplace

## Current problem

The Trade Requests page currently contains:

- `New Trade Request`
- Inbound RFQs
- multi-step Product → Route → Requirements → Payment flow

This is conceptually wrong for the current user flow.

A user should discover a product/supplier first and then initiate a trade request from that discovery context.

## Required change

Remove the primary `New Trade Request` action from the top of `Trade Requests`.

Move the action into Marketplace.

The Marketplace becomes:

```text
Discover product
      ↓
Inspect trade/product
      ↓
Create trade request
```

## Marketplace action placement

Each relevant marketplace product/card should expose:

```text
Inspect Trade
Create Trade Request
```

Use action hierarchy:

- `Inspect Trade` = secondary
- `Create Trade Request` = primary

Do not force users to leave Marketplace and manually start a request.

---

# 5. P0 — Trade Requests becomes received requests only

## New definition

`Trade Requests` = **trade requests received by my organization**.

It must NOT be the creation surface for outgoing requests.

## Required page structure

```text
Trade Requests
Received trade requests

Filters / status
        ↓
Incoming request list
        ↓
Review
Accept / Reject / Negotiate
```

Do not show an `New Trade Request` button on this page.

Do not make the existing creation wizard the default content here.

## Important

The underlying request creation workflow may remain implemented because Marketplace still needs it.

The workflow entry point moves.

---

# 6. P0 — Rename ambiguous labels

Where the current UI uses:

```text
Trade Requests
```

add contextual language where needed:

```text
Received Trade Requests
```

or:

```text
Trade Requests
Received RFQs
```

The page title can remain `Trade Requests` if the subtitle clearly states:

`Review trade requests received by your organization.`

This avoids forcing users to infer whether the page contains sent or received requests.

---

# 7. P0 — Received Trade Requests information hierarchy

Each incoming request should emphasize:

```text
Buyer / Organization
Product
Quantity
Route
Offer / expected value
Request age/status
Primary response
```

Example:

```text
ABC Trading LLC
500 MT · Basmati Rice
Mumbai → Dubai
$550,000

Pending review · 2h ago

[Review Request]
```

Secondary metadata:
- HS code
- compliance details
- documents
- technical identifiers

should remain available without dominating the list.

---

# 8. P1 — Add clear request states

Use a compact status system:

```text
New
Under Review
Quoted
Accepted
Rejected
Expired
```

Do not create a separate giant card or glow treatment for each state.

Use semantic color only where it improves scanability.

---

# 9. P0 — Marketplace gets a Top 10 Buyers section

## Goal

The Marketplace should not only show products.

It should expose demand-side signals:

**Top 10 Buyers**

This gives exporters a quick way to understand where current demand exists.

## Placement

Place Top 10 Buyers near the upper part of Marketplace, after the page header/filter area and before the full product listing, or as a clearly separated Bento section alongside the first marketplace content.

The exact placement must preserve product discovery as the primary task.

---

# 10. P0 — Differentiate Top 10 Buyers from normal marketplace cards

Top Buyers must look like a different information type.

Do NOT make them look like another generic product card.

Recommended visual pattern:

```text
TOP 10 BUYERS

01  Emirates Food Trading
    UAE · Dubai
    18 active RFQs      $4.2M demand

02  Gulf Agro Imports
    UAE · Abu Dhabi
    11 active RFQs      $2.8M demand
```

Use:
- ranking number
- buyer name
- location
- RFQ/demand signal
- one compact trust/verification marker

The ranking number should be visually distinct.

---

# 11. P1 — Top Buyers should be scannable, not decorative

Use a compact list or bento area.

Do not create ten large cards.

Preferred structures:

### Option A
One compact ranked list.

### Option B
A Bento container:
- one larger top buyer
- remaining buyers in compact ranked cells

The user should be able to skim all ten rapidly.

---

# 12. P1 — Add restrained Bento layout to Marketplace

Use Bento layout only to create information grouping.

Recommended structure:

```text
┌───────────────────────┬───────────────────────┐
│ Top Buyer / Demand    │ Buyer Signals         │
│ large                  │ compact list          │
├───────────────────────┼───────────────────────┤
│ Marketplace filters   │ Market intelligence    │
│ + product discovery   │ / demand summary       │
└───────────────────────┴───────────────────────┘
```

Do not use Bento as an excuse to produce six unrelated decorative cards.

The Bento groups related information.

---

# 13. P0 — MagicBento must be visually restrained

The supplied `MagicBento` component includes:
- stars
- spotlight
- border glow
- tilt
- magnetism
- click ripple
- particle animation

Those defaults are too visually heavy for the current GLOBEX direction. The component explicitly exposes these controls. fileciteturn2file1L29-L42

## Required configuration

Use a restrained configuration:

```jsx
<MagicBento
  textAutoHide={false}
  enableStars={false}
  enableSpotlight={false}
  enableBorderGlow={false}
  enableTilt={false}
  enableMagnetism={false}
  clickEffect={false}
  disableAnimations={true}
/>
```

Then use normal CSS borders, spacing, typography, and very subtle hover state.

If the project only needs the Bento layout, extract/reuse the grid pattern rather than shipping all of MagicBento's effects.

## Important

Do not introduce:
- particles
- purple glow
- cursor spotlight
- tilt
- magnetic movement
- repeated border glow

The user explicitly does not want an overly glowing interface.

---

# 14. P0 — Marketplace visual style

The Marketplace should now feel:

```text
dense enough to be useful
calm enough to scan
```

Use:

- dark navy/black surfaces
- thin neutral borders
- one GLOBEX accent color
- muted secondary text
- minimal shadows
- very limited gradients

Avoid:

- neon card borders
- giant glows
- moving particles
- 3D tilts
- oversized hover effects

---

# 15. P0 — Marketplace product-card hierarchy

Each product card:

```text
Product name
Supplier · location

$ price / tonne
MOQ

Verified · Trust

[Inspect Trade] [Create Trade Request]
```

HS code remains available as secondary metadata.

The user should be able to understand the product and take action without reading every technical field.

---

# 16. P1 — Hover focus remains, but make it quieter

The previous requirement remains:

When hovering a product card:
- hovered card = sharp/full opacity
- siblings = subtly dimmed/softened

But do NOT combine this with:
- large glow
- 3D tilt
- magnetism
- spotlight
- particles

Target:

```css
active:
  opacity: 1;
  filter: blur(0);
  transform: translateY(-2px);

inactive:
  opacity: .62;
  filter: blur(1px);
}
```

Prefer opacity over stronger blur.

Keyboard focus must behave equivalently.

---

# 17. P1 — Marketplace filters

Keep the existing category filtering and search functionality.

Structure:

```text
All
Agriculture
Spices
Textiles
Pharmaceuticals
Metals
Chemicals

                    Search
```

Do not place the filter controls inside a giant decorated card.

---

# 18. P0 — Information architecture after this iteration

The user flow should be:

```text
GLOBAL NAV
│
├── Dashboard
│      ├── Import
│      ├── Export
│      └── Active operational state
│
├── Marketplace
│      ├── Discover products
│      ├── Top 10 Buyers
│      ├── Inspect Trade
│      └── Create Trade Request
│
├── Trade Requests
│      └── Requests received by my organization
│
├── Active Trades
│
└── Documents / Settlement
```

This is the core mental model.

---

# 19. P0 — Remove conflicting entry points

After implementing the new flow, search the repository for:

```text
New Trade Request
Create Trade Request
Trade Request
RFQ
```

Verify that:

- creation is primarily initiated from Marketplace
- received-request management is performed in Trade Requests
- no old top-level CTA still creates confusion
- no duplicate wizard entry remains in Trade Requests

---

# 20. P1 — Trade request creation may still use the existing wizard

Do not delete:

```text
Product
Route
Requirements
Payment
```

if those steps are part of the existing business logic.

Move the entry point.

Possible flow:

```text
Marketplace
  ↓
Create Trade Request
  ↓
Existing 4-step wizard
  ↓
Submit
```

The business workflow remains intact.

Only its discoverability/location changes.

---

# 21. P1 — Use a contextual drawer/modal for creation when appropriate

When starting from Marketplace, prefer:

- `Drawer`
- `Modal`
- existing multi-step panel

over navigating to a totally unrelated page, provided this does not conflict with the current routing/business flow.

Ant Design components:

- `Drawer`
- `Steps`
- `Form`
- `Modal`

The creation experience should retain full-screen treatment only when the existing form genuinely requires it.

---

# 22. P1 — Top Buyers data should use existing source/data model

Do not hardcode:

```text
Emirates Food Trading
Gulf Agro Imports
...
```

unless these entities already exist in the application data.

Use actual buyer/trade-request data.

If there is currently no buyer ranking backend:

- derive from existing received/request data where valid
- define a clear ranking rule
- document the ranking logic
- do not fabricate demand values

Possible ranking signals:
- active RFQ count
- total requested quantity
- total request value

Use whichever source data is actually available.

---

# 23. P0 — Avoid "market intelligence theater"

Do not create fake:
- demand percentages
- trust scores
- buyer growth percentages
- market sentiment
- transaction volumes

unless the application already has real data for them.

Visual structure may be introduced without inventing facts.

---

# 24. P1 — Authentication/global navigation cleanup

The auth accordion belongs to account access.

Do not put:
- sidebar
- trade lifecycle
- workflow navigation

inside the authentication page.

Before login, the user is not yet inside the authenticated trade workspace.

---

# 25. P0 — Performance constraints for new Marketplace components

Because the application is already being optimized:

Do NOT enable heavy MagicBento effects.

The supplied implementation attaches mouse listeners, creates particles, performs GSAP animations, and supports a global spotlight that listens to document-level mouse movement. fileciteturn2file1L127-L156 fileciteturn2file1L374-L491

For the Marketplace Bento:
- use the layout only
- disable particle/spotlight/tilt/magnetism
- avoid document-level pointer tracking
- keep hover transitions CSS-only where possible

If the MagicBento code is imported only for layout, refactor it so the unused behavior is not shipped or initialized.

---

# 26. P1 — Keep React Bits components purposeful

Use:
- AccordionGallery concept → compact auth mode transition only if needed
- MagicBento → marketplace information grouping only
- Existing LineSidebar → remove from persistent layout
- Existing AnimatedList → active trades, unchanged
- SpecularButton → primary actions only

Do not increase the amount of animation just because React Bits components are available.

---

# 27. Definition of done

## Sidebar
- [ ] Persistent sidebar removed.
- [ ] No empty left rail.
- [ ] Global navigation still reaches all important routes.
- [ ] No per-page replacement sidebar added.

## Authentication
- [ ] Sign In / Register is one compact accordion-style control.
- [ ] Default state is Sign In.
- [ ] Register expands in the same interaction surface.
- [ ] Globe/Mumbai visual identity is retained but lighter.
- [ ] No giant auth marketing panel.
- [ ] Authentication remains low-GPU after reveal.

## Marketplace
- [ ] `Create New Trade Request` moved from Trade Requests to Marketplace.
- [ ] Product cards expose creation action.
- [ ] Top 10 Buyers visible.
- [ ] Top Buyers have a visibly distinct ranked/list presentation.
- [ ] Marketplace uses restrained Bento grouping.
- [ ] No excessive glow.
- [ ] No particle/spotlight/tilt/magnetism effects.
- [ ] Existing marketplace filters/search remain functional.
- [ ] Product hover focus remains subtle.

## Trade Requests
- [ ] Page represents received requests only.
- [ ] No `New Trade Request` CTA.
- [ ] Received requests are scannable.
- [ ] Review/Accept/Reject/Negotiate actions remain functional.
- [ ] Existing four-step creation wizard remains accessible from Marketplace.

## Data integrity
- [ ] Top 10 Buyers use actual data.
- [ ] No fabricated demand metrics.
- [ ] No fake market intelligence.

## Performance
- [ ] New Marketplace components do not add persistent document-level animation listeners.
- [ ] MagicBento effects are disabled or replaced by static layout.
- [ ] No new continuous RAF/WebGL loops.
- [ ] Marketplace hover remains CSS-driven where possible.

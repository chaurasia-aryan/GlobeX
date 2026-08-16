# GLOBEX UI/UX — Iteration 2 Tasks

## Objective

Iteration 1 reduced general clutter. Iteration 2 now establishes the final interaction model shown in the reference screenshot:

- minimal top chrome
- persistent Dual View for import/export operations
- very large operational numbers
- two equal operational columns
- side-mounted LineSidebar for navigation/breadcrumb context
- AnimatedList for active trade contracts
- SpecularButton as the controlled primary CTA
- restrained PillNav for the remaining global navigation
- hover focus in Marketplace where the hovered product becomes dominant and other cards subtly blur/dim

The business functionality, data, routes, and workflows must remain unchanged.

---

# 1. P0 — Dashboard becomes a true Dual View operations screen

## Target

The dashboard should visually read as two synchronized operational workspaces:

```text
┌─────────────────────────────────────────────────────────────┐
│ minimal global chrome                                      │
├────────────┬───────────────────────┬────────────────────────┤
│            │ IMPORT DUTY           │ EXPORT DUTY             │
│ Line       │ large metrics         │ large metrics           │
│ Sidebar    │ active contracts      │ active contracts        │
│            │ AnimatedList           │ AnimatedList            │
│            │ primary action         │ primary action          │
├────────────┴───────────────────────┴────────────────────────┤
│ tariff calculator / shared intelligence (lower priority)   │
└─────────────────────────────────────────────────────────────┘
```

## Required changes

- Use one equal-width Import panel and one equal-width Export panel.
- Both panels must be visible without requiring the user to choose Import vs Export first.
- Keep `Import Duty` and `Export Duty` as independent operational views.
- Do not make one side visually dominant unless its workflow has an actual alert/exception.
- The dual-view switch in the header should no longer consume the visual weight of the main dashboard.
- The dashboard should lead with the operational state, not platform marketing.

## Acceptance criteria

- Import and Export are immediately comparable.
- Both sides have matching geometry.
- The main content begins with the large operational numbers.
- Feature showcase cards do not appear above the operational panels.
- The dashboard feels like a command surface, not a landing page.

---

# 2. P0 — Large-number hierarchy

The dashboard should use large values as the primary visual anchors.

## Import side

Prioritize:
- Inbound Value
- Active Imports / Orders
- CEPA Savings

## Export side

Prioritize:
- Outbound Value
- Active Exports / Orders
- Escrow Receivables

Use the existing data exactly; do not change calculations.

## Visual rules

- Primary number: large and highly readable.
- Label: small, restrained.
- Supporting unit: visually subordinate.
- Supporting explanation: one short line or hidden behind progressive disclosure.
- Avoid placing icons on every metric.
- Avoid enclosing every metric in a separate decorative card.

Prefer one compact metric strip per side or three visually connected statistics.

Ant Design:
- `Statistic`
- `Flex`
- `Grid`

---

# 3. P0 — Contract lists use React Bits AnimatedList

Use the provided `AnimatedList` component for the active import/export contract collections.

The supplied component supports:
- item selection
- arrow/tab navigation
- gradient edges
- custom scrollbar
- selected item state
- Motion-based enter/exit behavior

Use it as the operational list container, not as decorative animation.

## Required behavior

Each item must preserve:
- product/trade title
- trade ID
- origin/destination
- value
- escrow/payment state
- current operational step
- next action

The user's current `Inspect Papers` / `Open Trade` actions must remain functional.

## Adaptation

The supplied AnimatedList is a generic string list. Do not flatten trade records into plain text.

Instead:

- keep the `AnimatedList` selection/navigation behavior
- render the existing trade-card JSX as the child content for each item
- maintain keyboard selection
- use a compact list item layout
- keep the currently selected trade visually strongest

Recommended:

```jsx
<AnimatedList
  items={tradeItems}
  showGradients
  enableArrowNavigation
  displayScrollbar
  initialSelectedIndex={0}
  itemClassName="..."
/>
```

Do not run two separate global keyboard listeners for the same interaction. Refactor the component if necessary so keyboard ownership is local to the active list.

---

# 4. P0 — Side navigation/breadcrumb becomes LineSidebar

The top of the application currently spends too much space communicating location.

Replace repeated page hierarchy indicators with a persistent or context-aware side LineSidebar.

The provided React Bits `LineSidebar` should be used as the visual interaction pattern.

## Example hierarchy

For dashboard:

```text
01  Command Center
02  Import Operations
03  Export Operations
04  Active Trades
05  Tariff Intelligence
06  Settlement
```

For Marketplace:

```text
01  Marketplace
02  All Commodities
03  Agriculture
04  Spices
05  Textiles
06  Chemicals
```

For Export Catalog:

```text
01  Export Catalog
02  Active Listings
03  Buyer Inquiries
04  Compliance
```

## Important

This is contextual navigation, not a second giant navigation system.

Only show relevant entries for the current workspace.

Clicking a LineSidebar item should:
- navigate to the existing route/section, or
- scroll to the existing section where that is already the current page's model.

Do not create duplicate routes.

---

# 5. P0 — Global header becomes minimal

The reference screenshot demonstrates that the top header should become quiet.

Keep only:

- GLOBEX logo
- organization context
- compact global navigation
- user profile
- mobile menu

Remove or reduce:
- repeated role/status badges
- large explanatory text
- unnecessary dashboard feature indicators
- duplicated Import/Export context

The actual page content should carry the operational context.

---

# 6. P1 — Use PillNav for residual global navigation

Use the supplied React Bits `PillNav` for the remaining global navigation.

The navigation should contain only the most important workspace-level destinations.

Recommended:

```text
Dashboard
Marketplace
Trade Requests
Active Trades
Documents
```

Do not place every possible feature in PillNav.

Move low-frequency destinations into the existing mobile/secondary menu.

## Visual treatment

Adapt the supplied component to GLOBEX:

- dark base
- restrained teal/cyan accent
- no white/light pill system
- compact height
- no oversized uppercase text
- no unnecessary initial-load animation

Use its hover motion for subtle navigation feedback, not spectacle.

---

# 7. P0 — Import/Export mode becomes contextual, not dominant

The screenshot reference shows:

```text
Dual View    ↙ Import Duty    ↗ Export Duty
```

Implement this as a compact mode/control area.

### Rule

`Dual View` is the default dashboard mode.

Clicking:
- Import Duty focuses the import panel
- Export Duty focuses the export panel
- Dual View restores both

Do not navigate away from the dashboard for this interaction.

The mode control must never occupy more visual weight than the operational dashboard itself.

---

# 8. P0 — Marketplace hover-focus blur

When the user hovers over one Marketplace product card:

### Required state

Hovered card:
- remains fully sharp
- slightly increases contrast/elevation
- receives a subtle accent treatment
- remains completely readable

All other cards:
- subtly blur
- slightly dim
- remain visible
- remain interactive

## Recommended values

```css
nonHovered:
  filter: blur(2px);
  opacity: 0.55;
  transform: scale(0.985);

hovered:
  filter: blur(0);
  opacity: 1;
  transform: scale(1.015);
```

Transition:
- 180–240ms
- ease-out

Do not make non-hovered cards unreadably blurred.

## Accessibility

- Never apply the effect permanently on keyboard focus unless equivalent focus styling is provided.
- `:focus-visible` must produce a strong focus state.
- Touch devices must fall back to normal cards without hover-only behavior.

## Implementation

Prefer CSS state/context over a heavy animation library.

A shared `MarketplaceGrid` hover context may track the active card.

Motion can be used only if the existing implementation already uses it.

---

# 9. P1 — Product card hierarchy

The Marketplace card should now read:

```text
Product name
Supplier · location

$ price / tonne
MOQ

Verified · Trust

Inspect Trade
```

Keep HS code but subordinate it.

Detailed compliance/trust information should remain available through existing details.

Do not remove business information.

---

# 10. P0 — SpecularButton becomes the primary CTA system

Use the supplied React Bits `SpecularButton` for high-value primary actions only.

Examples:

- `Open Trade`
- `Inspect Trade`
- `Add Export Listing`
- `New Import RFQ`
- `Register Organization`
- `Sign In & Launch Workspace`

Do NOT use SpecularButton for:
- navigation links
- tertiary links
- every small card action
- every filter control

The special effect should communicate "this is the action I should take now."

## Recommended behavior

- `autoAnimate={false}`
- `followMouse={true}`
- restrained intensity
- GLOBEX cyan/teal line color
- dark base color
- normal focus-visible outline
- no aggressive glow

The supplied component uses `ogl`, so install/use it only once and share the component implementation.

---

# 11. P1 — CTA hierarchy

Each major screen should have:

### One primary CTA
SpecularButton

### One or more secondary actions
standard Ant Design Button

### Tertiary actions
text/link buttons

Do not have multiple visually competing SpecularButtons in the same viewport unless they represent genuinely parallel Import vs Export actions.

For Dual View, the Import and Export primary actions can both use the component only when they are semantically parallel.

---

# 12. P0 — Tariff calculator moves below the operational fold

The tariff calculator remains functional.

On the Dual View dashboard it should sit below the two operational panels.

The user first sees:

1. Import state
2. Export state
3. current actions
4. then tariff intelligence

Keep:
- HS commodity code
- shipment CIF value
- CEPA result
- rule of origin

Do not let the calculator compete with the live trade lists.

---

# 13. P1 — Remove decorative dashboard feature matrix from the first viewport

Cards such as:
- Tariff Intelligence
- Settlement Vault
- Live Logistics
- Compliance AI
- Trust Score
- Arbitration

remain available but move below active operational work.

They are capabilities, not first-priority actions.

Use a lower-priority section or collapsible capability area.

---

# 14. P1 — Reduce repeated status badges inside trade items

Trade state should be communicated by one status indicator.

Prefer:

```text
Step 5 · In transit
```

instead of a large pill plus several secondary technical state labels.

Keep color semantics:
- green = completed/healthy
- cyan = active
- amber = review/warning
- red = blocked/failed
- gray = inactive

---

# 15. P1 — Remove redundant breadcrumbs from the page body

Once LineSidebar is present:

- do not repeat `Dashboard > ...` above every page
- retain one compact page title where required
- use LineSidebar for local hierarchy/context
- preserve back navigation where the route requires it

---

# 16. P1 — Typography split

Use normal UI typography for:
- headings
- product names
- descriptions
- labels
- actions

Use monospace only for:
- Trade IDs
- HS codes
- blockchain/network references
- technical identifiers
- highly technical system states

This remains mandatory across the Dual View.

---

# 17. P1 — Motion discipline

React Bits components add animation. Do not stack animations.

Allowed:
- PillNav hover
- LineSidebar proximity
- AnimatedList item transition
- SpecularButton pointer-follow shine
- Marketplace hover transition

Avoid:
- page-wide parallax
- permanent particles
- multiple simultaneous card tilts
- large scale effects
- continuous movement of operational numbers

---

# 18. P0 — Responsive Dual View

Desktop:
- two equal columns

Tablet:
- two columns if content remains readable
- otherwise vertically stack Import then Export

Mobile:
- one column
- compact mode selector
- LineSidebar becomes horizontal/compact navigation
- AnimatedList remains vertically scrollable
- SpecularButton becomes full-width where appropriate

Do not solve mobile by simply shrinking desktop content.

---

# 19. P0 — Preserve all functionality

No changes to:

- trade creation
- RFQ flows
- marketplace inspection
- export listing creation
- trade requests
- active trade workflow
- document access
- tariff calculation
- authentication
- organization selection
- data sources
- API calls
- database operations
- route semantics

Only presentation and interaction hierarchy change.

---

# 20. Definition of done

- [ ] Dashboard opens in Dual View.
- [ ] Import and Export are two equal operational columns.
- [ ] Large numbers are the primary visual anchors.
- [ ] Active trade lists use AnimatedList behavior.
- [ ] Existing trade actions remain functional.
- [ ] LineSidebar provides page/workspace context.
- [ ] Repeated top-page breadcrumbs are removed.
- [ ] PillNav handles the reduced global navigation.
- [ ] Header is visually quiet.
- [ ] Marketplace hover focuses one card and subtly blurs/dims the rest.
- [ ] Keyboard focus remains fully accessible.
- [ ] SpecularButton is used only for high-value primary CTAs.
- [ ] Tariff calculator remains available below the operational view.
- [ ] Capability cards no longer dominate the first viewport.
- [ ] No business functionality is removed.
- [ ] No accidental horizontal overflow exists.
- [ ] Desktop/tablet/mobile layouts remain usable.
- [ ] Motion is restrained and purposeful.

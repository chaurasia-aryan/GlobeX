# GLOBEX UI/UX Simplification Tasks

## 0. Objective

Reduce cognitive overload, visual noise, duplicated hierarchy, and inconsistent component treatment across GLOBEX without removing or changing any business functionality.

### Non-negotiable constraints

- Do not remove existing routes.
- Do not remove existing business actions.
- Do not change API contracts, database behavior, validation rules, authentication behavior, or trade workflows.
- Do not remove data that is necessary for decision-making; instead use progressive disclosure.
- Do not replace the dark visual identity, cyan/teal accent system, or GLOBEX brand language.
- Do not introduce a large new design system when the existing Ant Design stack can solve the problem.
- Preserve keyboard navigation, accessibility, responsive behavior, and loading/error states.
- Prefer refactoring existing components over creating parallel component implementations.
- No decorative animation should compete with a user's task.

---

# 1. Design diagnosis

## P0 — Global information hierarchy is overloaded

### Evidence
The top navigation simultaneously contains:
- organization selector
- Import Duty
- Export Duty
- Dashboard
- Marketplace
- My Export Listings
- Trade Requests
- Active Trades
- Documents
- global search

This creates too many competing first-level decisions. The navigation also mixes:
1. mode switching,
2. workspace navigation,
3. task navigation,
4. organization context,
5. utility/search.

### Required change
Create a three-tier hierarchy:

**Tier 1 — Workspace mode**
- Import Duty
- Export Duty

**Tier 2 — Primary workspace**
- Dashboard
- Marketplace
- Active Trades
- Trade Requests

**Tier 3 — Secondary**
- My Export Listings
- Documents
- organization/settings utilities

Keep all existing destinations functional, but move low-frequency destinations under a compact `More` menu or contextual sub-navigation.

### Acceptance criteria
- The header has visibly fewer simultaneous navigation items.
- Import/Export remain immediately accessible.
- All existing routes remain reachable within one additional interaction at most.
- The currently active route is visually obvious.
- Organization context is visually separated from navigation.

### Ant Design
- `Menu`
- `Dropdown`
- `Segmented`
- `Tooltip`
- `Space`
- `ConfigProvider`

---

# 2. P0 — Stop using the same visual weight for everything

### Problem
Nearly every card has:
- border
- glow
- rounded container
- small technical label
- status badge
- large numeric/value
- supporting text

Consequently, the UI has no strong foreground/background hierarchy.

### Required change
Use a three-level surface system:

**Level 0:** page background  
**Level 1:** ordinary content containers  
**Level 2:** only active/interactive/important modules

Remove borders and glow from at least 40–60% of currently bordered containers. Use spacing and typography to group ordinary content instead.

### Acceptance criteria
A user can immediately identify:
1. page purpose,
2. primary action,
3. current state,
4. main content,
without scanning every card.

---

# 3. P0 — Standardize component geometry

### Current inconsistency
Buttons, tabs, badges, metric cards and containers have slightly different:
- radii
- heights
- border brightness
- padding
- shadows
- cyan/green treatment

### Required change
Define design tokens and reuse them everywhere.

Recommended tokens:

```ts
radius.sm = 6px
radius.md = 10px
radius.lg = 14px
radius.xl = 18px

control.height.sm = 28px
control.height.md = 36px
control.height.lg = 44px

space.xs = 4px
space.sm = 8px
space.md = 12px
space.lg = 16px
space.xl = 24px
space.2xl = 32px
```

Do not visually customize every component individually.

---

# 4. P0 — Reduce the "terminal/HUD" aesthetic

### Problem
The product currently overuses:
- monospace labels
- all-caps section names
- technical brackets
- micro-status text
- glowing outlines
- neon green/cyan borders

This makes ordinary enterprise workflows look like a command terminal.

### Required change
Use monospace only for:
- HS codes
- trade IDs
- reference numbers
- cryptographic/network identifiers
- system status indicators where technical formatting is useful

Use the primary sans-serif UI font for normal labels, section titles, descriptions, CTAs and user-facing content.

Convert unnecessary all-caps labels to normal title case.

### Acceptance criteria
Technical aesthetics remain recognizable but ordinary user tasks feel like a business application rather than a monitoring console.

---

# 5. P0 — Reduce persistent global search prominence

### Problem
The search field in the top navigation is visually competing with core navigation despite not being the user's primary task in every screen.

### Required change
Replace the persistent wide search input with a compact search trigger:
- search icon
- optional `Search` label
- keyboard shortcut indicator such as `⌘K` / `Ctrl K`

Open a command/search overlay on activation.

### Ant Design
- `Input`
- `Modal`
- `AutoComplete`
- `Dropdown`

Optional lightweight library:
- `cmdk`

### Acceptance criteria
Search remains globally accessible but no longer consumes a large portion of the header.

---

# 6. P0 — Registration and Sign-in screens need stronger focus

## Registration

### Current problem
The form competes with:
- right marketing panel
- institutional access badge
- sign-in/register toggle
- social login
- quick-fill roles
- TLS text
- multiple metadata labels

The user has too many visual objects before completing the primary task.

### Required change
Prioritize:

1. page title
2. one-line explanation
3. form
4. primary CTA
5. alternative authentication
6. secondary utilities

Move `Quick Fill` into a compact `Demo mode` disclosure. Keep it fully functional.

Move TLS messaging into a small security reassurance line near the form footer instead of making it a peer to the form controls.

### Right panel
Keep it, but reduce its visual dominance:
- narrower than the form/content area
- shorter copy
- maximum 3 value propositions
- no giant empty area
- no extra branding repetition

### Sign-in
Make `Forgot Password?` part of the password row and keep it visually subordinate to the submit button.

### Ant Design
- `Form`
- `Input`
- `Input.Password`
- `Select`
- `Checkbox`
- `Divider`
- `Segmented`
- `Collapse`

---

# 7. P1 — Auth toggle should look like one control

### Problem
`Sign In / Register` currently behaves like navigation but looks partly like two separate buttons.

### Required change
Use an Ant Design `Segmented` control or a compact two-state switch.

The selected state should be obvious without looking at color alone.

### Acceptance criteria
The user understands immediately that these are two modes of the same authentication surface.

---

# 8. P1 — Replace social login row with lower-priority alternative auth

### Problem
Google, Azure, and GitHub buttons have the same visual prominence as the main authentication flow.

### Required change
Keep them functional, but make the alternate path visually secondary:
- one row
- lower contrast
- same height
- provider icon + short label
- no decorative borders beyond the required button container

Keep `OR SINGLE SIGN-ON`, but shorten the copy to `Or continue with`.

---

# 9. P0 — Marketplace card density

### Problem
Each marketplace card simultaneously presents:
- product title
- HS code
- supplier
- location
- price
- unit
- MOQ
- verification
- trust
- action

All are visually emphasized.

### Required change
Prioritize the buyer's decision sequence:

**Product → Supplier/location → Price/MOQ → Trust → Action**

Make HS code secondary metadata.

Compress verification/trust into one compact trust line.

Example:

```text
1121 Steam Extra Long Grain Basmati Rice
ABC Global Exports · Mumbai, India

$1,100 / tonne     MOQ 100 t
Verified · 94% trust

[Inspect trade]
```

Do not remove the underlying fields. Show supplementary data in a `Popover`, `Tooltip`, or details drawer.

### Ant Design
- `Card`
- `Tag`
- `Typography`
- `Popover`
- `Drawer`
- `Button`

---

# 10. P1 — Marketplace filter bar

### Problem
Category tabs and search are visually placed inside one large bordered container, creating excessive framing.

### Required change
Use a lighter filter row:
- category `Segmented` / `Tabs`
- search aligned right
- no heavy outer card border

On narrower widths, stack them.

### Acceptance criteria
The filter row reads as one control area rather than a large content card.

---

# 11. P0 — Export Catalog metrics are too dominant

### Problem
Four KPI cards consume substantial vertical space before the user reaches the actual catalog.

### Required change
Retain every metric but compress the KPI area into:
- a compact 4-column `Statistic` strip on desktop,
- 2x2 on tablet,
- 1-column or horizontal scroll on mobile.

Use no decorative icon in every card unless it adds meaning.

### Ant Design
- `Statistic`
- `Flex`
- `Grid`

---

# 12. P1 — Export catalog item rows

### Problem
Large horizontal cards repeat borders and leave significant unused space.

### Required change
Convert each listing to a compact structured row/list item.

Recommended hierarchy:

**Product + HS code**
**Category · Port**
**Compliance tags**
**Availability/action**

Put secondary information inside `Collapse` or a details `Drawer`.

### Ant Design
- `List`
- `Descriptions`
- `Tag`
- `Drawer`
- `Collapse`

---

# 13. P1 — Remove duplicated page navigation signals

### Problem
Breadcrumb + page title + badge + descriptive sentence + context tabs are often present simultaneously.

### Required change
Use:

**Breadcrumb**
→ **Page title + one status badge**
→ **one concise description**

Delete redundant explanatory labels that repeat the page title.

Do not remove useful status information.

---

# 14. P0 — Command Center needs a single primary story

### Problem
The Dashboard currently displays:
- organization context
- role
- EVM status
- two CTAs
- import/export switch
- import/export totals
- intelligence matrix title
- six or more feature cards
- animated/3D treatment

The page feels like a product showcase instead of an operational command center.

### Required change

Above the fold should communicate:

**What is happening?**
**What requires action?**
**What is the primary action?**

Suggested order:

1. compact context bar
2. `Global Trade Command Center`
3. Import/Export mode switch
4. two most important action buttons
5. current trade activity / exceptions
6. operational modules
7. intelligence/features

Move decorative/product capability cards lower on the page.

---

# 15. P0 — Replace the B2B "feature wall" with operational prioritization

### Problem
Cards titled:
- Tariff Intelligence
- Settlement Vault
- Live Logistics
- Compliance AI
- Trust Score
- Arbitration

all appear equally important.

### Required change
Group them into:

**Needs attention**
- compliance exceptions
- documents
- customs issues
- active trade exceptions

**Monitoring**
- logistics
- escrow
- tariff status

**Capabilities**
- trust graph
- arbitration
- AI platform features

Use `Collapse` or tabs for the low-priority capability content.

Do not remove modules or data.

---

# 16. P0 — Active Trades / Import / Export contract lists

### Problem
The active-trade cards use dense technical text and large card containers.

### Required change
Use a consistent list-row pattern:

```text
Trade name                         Value
Route / identifier                 Status
Progress                           Next action
```

The next action must be the strongest interactive element.

Use a compact progress indicator instead of exposing `Step N:` as another large badge.

### Ant Design
- `List`
- `Progress`
- `Tag`
- `Button`
- `Descriptions`

---

# 17. P1 — Stop using "animated list" as a design concept

### Problem
The UI explicitly exposes `ANIMATED LIST` and keyboard hints as if they are product features.

### Required change
Animation should be an implementation detail, not a headline.

Keep keyboard support, but put the hint into a subtle `Tooltip` or context help.

Use motion only for:
- row insertion
- selection
- state transition
- panel expansion

No continuous movement in operational data.

---

# 18. P1 — Tariff calculator needs clearer task sequencing

### Problem
The calculator places technical context, HS code, shipment value, rule-of-origin information and the result in one visual block.

### Required change
Make it read as:

**1. Commodity**
→ **2. Shipment value**
→ **3. Result**

Use a compact result panel to emphasize the calculated saving.

Move the rule-of-origin text into a `Tooltip` / info icon.

### Ant Design
- `Form`
- `Select`
- `InputNumber`
- `Alert`
- `Statistic`
- `Tooltip`

---

# 19. P1 — Reduce copy length

### Problem
Descriptions are often written as product-marketing copy inside operational screens.

### Required change
Use one concise explanatory sentence per module.

Avoid wording such as:
- "AI-powered infrastructure for safer cross-border trade"
- "Cryptographic escrow release triggered automatically upon..."
when the user is already inside the relevant operational workflow.

Move long explanations into:
- `Tooltip`
- `Popover`
- info drawer
- documentation

---

# 20. P0 — Create a consistent action hierarchy

Every screen must have exactly:

### Primary action
Solid/high-contrast cyan/teal button.

### Secondary action
Outlined/neutral button.

### Tertiary action
Text/link button.

Never display two equally strong primary CTAs unless they are genuinely parallel paths.

Examples:
- `Add Export Product` = primary
- `View Trade Inquiries` = secondary
- navigation links = tertiary

---

# 21. P1 — Reduce badges

### Problem
The interface uses many chips for:
- verified
- status
- role
- organization
- category
- compliance
- technical state

### Required change
Use badges only when the state changes decisions.

Use normal text for static metadata.

Target:
- maximum 1–2 prominent badges per content unit
- secondary tags grouped into one subdued line

### Ant Design
- `Tag`
- `Badge`

---

# 22. P1 — Standardize status colors

Use semantic colors consistently:

- Green = verified / complete / healthy
- Blue/cyan = active / in progress
- Amber = review / warning
- Red = blocked / failed
- Gray = inactive / neutral

Do not use green and cyan interchangeably for the same semantic state.

---

# 23. P1 — Remove decorative micro-copy that adds no decision value

Examples from current screens:
- `Institutional Access`
- repeated `EVM Verified`
- repeated `Network Live`
- repeated footer security slogans
- repeated platform taglines

Keep one global brand/security statement and remove duplicates from operational screens.

---

# 24. P1 — Footer simplification

### Problem
Footers contain technical/security micro-copy that competes with the page.

### Required change
Use a minimal footer:
- copyright
- one security/compliance status
- documentation/help

Avoid repeating brand descriptions.

---

# 25. P0 — Fix horizontal overflow

### Evidence
Several screenshots visibly contain horizontal scroll bars.

### Required change
Investigate and eliminate unintended horizontal overflow on:
- Dashboard
- Marketplace
- Export Catalog
- trade operation pages

Do not simply hide overflow with CSS.

Check:
- grid min widths
- fixed card widths
- navigation width
- absolute/floating elements
- oversized containers

### Acceptance criteria
At standard desktop viewport widths, horizontal scroll is absent unless a genuine horizontally scrollable data structure requires it.

---

# 26. P0 — Responsive behavior

At smaller widths:

- collapse global navigation into a compact menu
- convert two-column auth layout to a single-column flow
- stack KPI cards
- turn marketplace grid into 1–2 columns
- move search below filters where necessary
- turn dense horizontal rows into stacked rows
- use `Drawer` for details

Do not simply shrink desktop components.

---

# 27. P1 — Motion system

Use one motion system instead of custom animations per component.

Recommended library:
- `motion` (Motion for React)

Allowed animation patterns:
- 150–220ms enter/exit
- 120–180ms hover/press
- ease-out for entering
- ease-in for exiting
- subtle height/opacity/translate transitions

Avoid:
- constant pulsing
- large scale effects
- parallax in operational screens
- 3D tilt on data cards
- animations that change layout unexpectedly

---

# 28. P1 — Command palette

Add a lightweight global command/search surface.

Use:
- `cmdk`

Commands may include:
- Open Dashboard
- Open Marketplace
- My Export Listings
- Trade Requests
- Active Trades
- Documents
- New Import RFQ
- Add Export Listing

All commands must point to existing functionality/routes.

---

# 29. P1 — Accessibility

Ensure:

- keyboard-visible focus states
- semantic button/link elements
- `aria-label` for icon-only actions
- status is not communicated by color alone
- minimum readable text size
- sufficient contrast
- logical tab order
- focus management inside Drawer/Modal
- Escape closes transient UI

---

# 30. P0 — Build a reusable design system layer

Create shared components instead of styling each page independently.

Recommended shared components:

```text
AppShell
TopNav
WorkspaceSwitcher
PageHeader
PageActions
StatusBadge
MetricStrip
FilterBar
EntityList
EntityListItem
TrustIndicator
TradeStatus
PrimaryButton
SecondaryButton
DetailsDrawer
EmptyState
```

These components should wrap existing Ant Design primitives rather than replace them with custom abstractions everywhere.

---

# 31. Recommended libraries

## Keep / maximize
### Ant Design
Primary component system.

Use:
- `Layout`
- `Menu`
- `Dropdown`
- `Segmented`
- `Form`
- `Input`
- `InputNumber`
- `Select`
- `Card`
- `List`
- `Statistic`
- `Descriptions`
- `Tag`
- `Badge`
- `Progress`
- `Drawer`
- `Modal`
- `Popover`
- `Tooltip`
- `Collapse`
- `Tabs`
- `Empty`
- `Skeleton`

## Add only where required

### Motion
For controlled UI transitions.

### cmdk
For global command/search.

### lucide-react
Only if the current icon system is inconsistent. Do not mix icon families unnecessarily.

## Do not add
Large animation frameworks, multiple UI kits, multiple icon libraries, or extra component libraries for functionality Ant Design already covers.

---

# 32. Visual target

The final interface should feel like:

**Enterprise B2B operations software with a modern trading-tech identity**

not:

**A futuristic dashboard demo filled with HUD panels.**

The visual hierarchy should be:

```text
Page purpose
    ↓
Current state / risk
    ↓
Primary action
    ↓
Relevant data
    ↓
Secondary details
    ↓
Technical metadata
```

Technical information can remain in the system, but it should stop competing with the user's immediate decision.

---

# 33. Definition of done

- [ ] Global navigation reduced to a clear hierarchy.
- [ ] Import/Export mode remains immediately accessible.
- [ ] Global search becomes compact and opens a command/search surface.
- [ ] Auth screens prioritize the form.
- [ ] Auth marketing panel is visually subordinate.
- [ ] Quick Fill remains available but is progressively disclosed.
- [ ] Marketplace cards have one clear information hierarchy.
- [ ] Export catalog metrics are compact.
- [ ] Dashboard prioritizes active work over feature showcasing.
- [ ] Active trade rows emphasize next action.
- [ ] Tariff calculator reads as a 3-step task.
- [ ] Badge usage is reduced.
- [ ] Typography is consistent.
- [ ] Technical monospace is restricted to technical data.
- [ ] Border/glow usage is reduced.
- [ ] Primary/secondary/tertiary actions are consistent.
- [ ] Horizontal overflow is eliminated where accidental.
- [ ] Responsive layout is verified.
- [ ] Motion is subtle and consistent.
- [ ] Accessibility checks pass.
- [ ] No route, API, business rule, or workflow has been removed or altered.

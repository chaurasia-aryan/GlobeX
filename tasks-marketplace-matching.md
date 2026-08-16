# GLOBEX Marketplace ML Matching — Iteration Tasks

## Objective

Redesign the Marketplace recommendation flow so that **Top 10 Buyers is an output of a user-driven ML matching process**, not a static list shown before the user states what they need.

The intended product flow is:

```text
User Need
→ Matching Input
→ Candidate Filtering
→ ML Ranking
→ Top Recommendations
→ Inspect
→ Create Trade Request
```

All existing business logic, APIs, routes, trade-request workflow, and real data behavior must remain intact unless a change is strictly required to support this interaction model.

---

# P0 — Replace Static Top 10 With a User-Intent Flow

### Current problem

The current Marketplace immediately displays a large "Top 10 Global Importers & Verified Demand" list.

This is conceptually wrong because the ranking has no visible input from the user.

### Required change

The initial Marketplace experience must ask what the user needs before presenting recommendations.

Example:

```text
What are you looking for?

Commodity
[ Plastic Bags ]

Quantity
[ 1,000 ] [ kg ]

Destination
[ UAE ]

Optional requirements
[ Recyclable / food grade / etc. ]

[ Find Matching Buyers → ]
```

The exact fields must come from the current backend/domain model.

Do not invent unsupported fields.

### Acceptance criteria

- Top recommendations are not visible before a matching request is submitted.
- The user understands what information drives the recommendation.
- Existing marketplace product discovery remains available.

---

# P0 — Make the ML Matching Pipeline Visible

After the user submits a requirement, show a concise processing flow:

```text
Your requirement
↓
Eligibility filtering
↓
Candidate pool
↓
ML ranking
↓
Top recommendations
```

Do not expose technical ML internals.

Do not show embeddings, vector dimensions, model architecture, or fake confidence values.

The user only needs to understand that the system searches a much larger eligible population before producing a ranked shortlist.

---

# P0 — Candidate Pool Summary

After matching, show a compact summary such as:

```text
7,000 eligible organizations
142 strong matches
10 recommended buyers
```

These values must come from the real backend result.

Never hardcode the screenshot/example values.

Do not render thousands of candidate organizations in the browser merely to show the count.

---

# P0 — Recommended Buyers Section

Only show the ranked buyer recommendation section after a matching request has been processed.

Use a contextual title:

```text
Recommended Buyers
for 1,000 kg of Plastic Bags → UAE
```

or:

```text
Top Buyer Matches
for your requirement
```

Do not use a universal title such as:

```text
Top 10 Global Importers
```

because this is not a universal ranking; it is conditional on user intent.

---

# P0 — Replace Ten Large Buyer Cards With One Ranked Surface

The current design is too cluttered because every buyer contains too many fields and visual elements.

Use one shared ranking/list surface.

Each recommendation should primarily show:

```text
Rank
Buyer
Location
Match score or match quality
One relevant demand signal
Primary action
```

Example:

```text
01  Example Global Trading Ltd.       96% Match
    UAE · Dubai                        18 active RFQs

02  Acme Import Partners              93% Match
    UAE · Abu Dhabi                    11 active RFQs
```

Secondary information goes into a details drawer/modal.

---

# P0 — Use Reaviz Selectively For Ranking

Use Reaviz only where it adds information value.

Preferred visualization:

- `BarList` for ranked buyers
- optional compact trend or demand visualization only when actual data supports it

The ranked visualization should make relative ranking obvious.

Example:

```text
Buyer                     Match
────────────────────────────────
Example Global Trading    ████████████████ 96%
Acme Import Partners      ███████████████  93%
Northstar Imports         ██████████████   91%
```

Use GLOBEX's restrained dark/cyan visual language.

Do not use default purple/demo styling.

Do not turn the page into a dashboard of charts.

---

# P0 — Do Not Overuse Visualization

Avoid:

- multiple charts for the same data
- radar charts with meaningless axes
- donut charts for simple counts
- 3D charts
- glowing graphs
- animated chart backgrounds
- particles
- visual noise

The visualization should answer:

**Why is this buyer ranked above the others?**

Nothing more.

---

# P0 — Recommendation Explanation

Where the ML/backend provides valid ranking reasons, show concise human-readable matching signals:

```text
96% Match

Matches:
✓ Commodity
✓ Quantity
✓ Destination
✓ Active buying demand
```

Only expose criteria that the actual matching logic uses.

Do not fabricate explanations after the fact.

If no feature-level explanation is available, use a simple match quality label:

```text
Strong Match
High Match
Potential Match
```

rather than inventing a percentage.

---

# P0 — Buyer Inspection

Each ranked result must remain interactive.

Primary secondary action:

```text
Inspect Buyer
```

or the current existing inspection action.

The existing inspection experience should continue to show real available data such as:

- buyer organization
- location
- relevant commodity
- activity
- RFQs
- compliance
- verification
- trade compatibility

Do not fabricate missing metrics.

---

# P0 — Create Trade Request From Marketplace

Marketplace remains the entry point for outgoing request creation.

After the user selects a recommendation/product:

```text
Create Trade Request
```

must launch the existing trade-request workflow.

Preserve:

```text
Product
→ Route
→ Requirements
→ Payment
```

Do not rewrite the underlying business logic.

---

# P0 — Preserve Normal Product Marketplace

The ML recommendation layer must not replace normal product discovery.

Marketplace should support two related flows:

```text
Demand-driven matching
"What do I need?"
→ Recommended Buyers

Product discovery
Browse products
→ Inspect Trade
→ Create Trade Request
```

Keep existing:

- category filters
- product search
- product cards
- inspection
- trade creation

---

# P1 — Progressive Disclosure

Initial state:

```text
What are you looking for?
[matching form]
```

Processing state:

```text
Finding matching buyers...
```

Result state:

```text
Candidate summary
→ Recommended Buyers
→ Products
```

Detail state:

```text
Selected buyer/product
→ detail drawer/modal
→ Create Trade Request
```

Do not display all possible information at once.

---

# P1 — Matching Loading State

Use concise messaging:

```text
Finding matching buyers...

Filtering eligible organizations
Ranking relevant opportunities
```

Only show actual processing stages if the backend provides them.

Do not fake percentage progress.

If actual stages are unavailable, use an indeterminate loading state.

---

# P1 — Low/No Match State

If there are no strong recommendations:

```text
No strong matches found.

Try adjusting the commodity, quantity,
destination, or supported requirements.
```

Only suggest adjustments that are actually supported by the current form/backend.

---

# P0 — Candidate Pool Must Stay Server-Side

Do not retrieve/render all thousands of candidates just to calculate or visualize the count on the frontend.

Preferred flow:

```text
frontend requirement
→ backend filtering
→ backend/ML ranking
→ candidate summary + top results
```

Return only what the initial Marketplace result requires.

Use pagination/lazy loading for larger result sets.

---

# P1 — Data Contract

Adapt to the existing backend.

Conceptually the request may contain:

```js
{
  commodity,
  quantity,
  unit,
  destination,
  requirements
}
```

Conceptually the result may contain:

```js
{
  candidateCount,
  strongMatchCount,
  recommendations
}
```

Do not introduce a parallel matching API if an existing API already provides the required functionality.

---

# P1 — Dynamic Recommendation Title

The recommendation title should reflect actual intent.

Examples:

```text
Recommended Buyers
for 1,000 kg Plastic Bags → UAE
```

```text
Best Matches
for Plastic Bags → UAE
```

```text
Top Buyer Matches
for your requirement
```

Do not hardcode a global ranking.

---

# P1 — Example/Demo Data Must Be Fictional

For static/demo/mock content use:

```text
John Doe
Jane Doe
Example Global Trading Ltd.
Acme Import Partners
Northstar Trading Co.
```

Do not use screenshot-specific names such as Rajesh.

Production user and organization names must remain dynamic from authenticated session/backend data.

Never hardcode a personal name into reusable components.

---

# P0 — Marketplace Layout

Recommended layout:

```text
Marketplace

short page description

┌───────────────────────────────────────────────┐
│ WHAT ARE YOU LOOKING FOR?                     │
│                                               │
│ Commodity    Quantity    Destination          │
│ [ Plastic ]  [ 1000kg ]  [ UAE ]             │
│                                               │
│ Optional requirements                         │
│                                               │
│ [ Find Matching Buyers → ]                    │
└───────────────────────────────────────────────┘

MATCHING RESULT
7,000 eligible · 142 strong · 10 recommended

┌───────────────────────────────────────────────┐
│ RECOMMENDED BUYERS                            │
│                                               │
│ Ranked BarList / compact ranked list          │
│                                               │
└───────────────────────────────────────────────┘

PRODUCT MARKETPLACE
Filters · Search

Product cards...
```

Do not give every section equal visual weight.

---

# P0 — Reduce Current Clutter

Remove or subordinate repeated buyer-card metadata:

- multiple certification badges
- repeated location strings
- large dollar amounts when not decision-critical
- several status badges
- duplicated RFQ information

Keep only the most useful information visible.

Everything else belongs in details.

---

# P1 — Reaviz / Reablocks Integration Policy

Use Reaviz when it improves the actual information display.

Preferred:
- `BarList`
- small ranking visualizations
- concise demand trend where meaningful

If generic UI primitives are needed and the project does not already have suitable equivalents, Reablocks may be evaluated for:
- Card
- List
- Badge
- Stepper
- Tabs
- Drawer

Do not replace the existing Ant Design system unnecessarily.

Do not install libraries only for visual novelty.

---

# P0 — Visual Language

Marketplace should feel:

```text
Calm
Dense enough to be useful
Highly scannable
Data-driven
Enterprise-grade
```

Avoid:

```text
Overly glowing
Over-animated
Decorative
Card-heavy
Cyberpunk/HUD-like
```

Use:

- dark navy/black
- restrained cyan/teal
- thin neutral borders
- subtle hover
- strong typography hierarchy
- minimal shadows
- little or no glow

---

# P1 — Performance Requirements

The matching redesign must not increase the current application's performance problems.

Do not:

- render thousands of candidate components
- add document-level mousemove listeners
- add continuous RAF loops
- add WebGL
- add particle systems
- animate every ranked result
- create multiple redundant charts

The matching computation belongs on the backend/ML layer where applicable.

The frontend should receive a compact ranked result.

---

# P0 — Definition of Done

- [ ] Static Top 10 list no longer appears before user input.
- [ ] Marketplace starts with a requirement/matching form.
- [ ] User can specify commodity, quantity, destination, and supported optional requirements.
- [ ] Matching uses real backend/ML data.
- [ ] Candidate pool size is shown from real data.
- [ ] Top recommendations appear only after matching.
- [ ] Recommendation title is contextual to the user's request.
- [ ] Ten large buyer cards are replaced with a compact ranked surface.
- [ ] Reaviz is used selectively if it materially improves ranking comprehension.
- [ ] No excessive visual effects are introduced.
- [ ] Existing product marketplace remains functional.
- [ ] Existing trade request workflow remains functional.
- [ ] Create Trade Request starts from Marketplace.
- [ ] No fake buyer/demand metrics are added.
- [ ] No screenshot-specific personal names remain in static/demo UI.
- [ ] Candidate organizations are not unnecessarily rendered client-side.
- [ ] Loading/empty states are clear.
- [ ] Existing filters/search continue to work.

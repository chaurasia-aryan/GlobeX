# GLOBEX UI/UX — Iteration 5 Tasks

## Objective

Unify the authentication accordion and global top header into one seamless GLOBEX shell.

This iteration has two direct goals:

1. Implement the previously specified accordion-style Sign In/Register authentication surface.
2. Redesign the authenticated top header so it feels larger, calmer, more integrated, and intuitive, with no visible horizontal divider/bottom border.

The application must retain all existing functionality.

---

# 1. P0 — Remove the visible top-header divider

## Current problem

The current authenticated header has a visible horizontal bottom border/divider separating it from the content.

This makes the header feel like an independent strip placed above the application.

## Required change

Remove the visible horizontal border completely.

Do not replace it with:
- another 1px divider
- a glowing line
- a shadow that visually behaves like a divider
- a gradient line

The header should blend into the page background.

Use:
- same or near-identical background tone
- subtle spacing
- visual grouping through alignment and contrast instead of a border

Acceptance criteria:

- no visible horizontal rule beneath the header
- header appears to float naturally over the page
- content starts below it through spacing rather than a separator

---

# 2. P0 — Make the header slightly larger

The current header is visually compressed.

Increase:
- horizontal padding
- vertical height
- logo area
- navigation hit areas
- organization selector breathing room
- profile/menu controls

Do not make the header massive.

Target:

```text
height ≈ 64–76px desktop
```

Use the actual viewport and existing content density to tune the final value.

The header should feel like a primary application shell rather than a browser toolbar.

---

# 3. P0 — Make the header visually seamless

Desired composition:

```text
┌───────────────────────────────────────────────────────────────┐
│  GLOBEX   Organization     Dashboard Marketplace ...   User  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
             no dividing line
```

The header should feel like an extension of the page background.

Use:
- low-contrast dark surface
- no obvious container outline
- no bottom border
- subtle hover states
- clear active route state

Do not introduce large shadows.

---

# 4. P0 — Simplify the header's mental model

The header should answer four things immediately:

1. Where am I?
2. Which workspace am I in?
3. Where can I go?
4. Who am I signed in as?

Recommended order:

```text
GLOBEX
→ Organization
→ Primary navigation
→ Search
→ User
```

Do not place unrelated technical status indicators in the primary header.

Move low-frequency technical information into contextual pages or the user menu.

---

# 5. P1 — Make the primary navigation look like navigation, not individual buttons

Current navigation:

```text
Dashboard
Marketplace
Trade Requests
Active Trades
Documents
```

Keep these destinations.

Make the navigation feel like one coherent navigation group.

Use:
- consistent horizontal spacing
- one active treatment
- quiet inactive states
- no visible border around each item unless required
- stronger active indicator through contrast/background/underline-dot

Do not make every navigation item look like a CTA.

---

# 6. P1 — Increase hit areas without increasing visual clutter

Desktop navigation items should have comfortable click targets.

Use approximately:

```text
horizontal padding: 14–18px
vertical padding: 10–12px
```

Maintain compact visual typography.

The hit area can be larger than the visible text.

---

# 7. P1 — Active navigation state

The active route should be obvious but restrained.

Current example:

```text
Active Trades
```

Recommended:

- slightly elevated dark capsule OR
- subtle text contrast + tiny bottom/accent indicator

Do not use:
- bright neon border
- glow
- oversized background
- multiple indicators

One active signal is enough.

---

# 8. P0 — Header should visually connect to the new auth language

The same design language should be shared across:

- authentication accordion
- top header
- marketplace
- dashboard

Shared principles:

- dark navy/black surface
- teal/cyan accent
- thin neutral borders only where necessary
- no excessive glow
- restrained motion
- spacious alignment
- clear typographic hierarchy

The auth accordion should not feel like one design system and the authenticated header another.

---

# 9. P0 — Authentication accordion

Use the previously specified accordion-style authentication surface.

The form must visually behave like the supplied AccordionGallery reference:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────────────────┐ ┌──────┐ ┌──────┐         │
│  │                              │ │      │ │      │         │
│  │          SIGN IN             │ │REG.  │ │      │         │
│  │                              │ │      │ │      │         │
│  │  Email                       │ │      │ │      │         │
│  │  Password                    │ │      │ │      │         │
│  │                              │ │      │ │      │         │
│  │  [ Sign In ]                 │ │      │ │      │         │
│  └──────────────────────────────┘ └──────┘ └──────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

The active panel expands horizontally while inactive panels remain narrow and partially visible.

Do not replace this with:
- ordinary tabs
- a simple two-button switch
- a vertical Collapse component
- two unrelated full-page routes

---

# 10. P0 — Use the existing AccordionGallery implementation as the interaction basis

Reuse the already provided React Bits `AccordionGallery` concept and implementation pattern.

The component supports:
- active panel expansion
- flex-based expansion
- muted inactive panels
- hover/click/focus
- keyboard arrow navigation
- GSAP transition lifecycle

Do not add another animation system.

Adapt the component so each panel can contain live React authentication content instead of static image content.

Do not use the gallery's sample images.

---

# 11. P0 — Sign In panel

The active Sign In panel must expose the existing fields and actions.

Required content:

```text
Sign in to GLOBEX

Corporate Email
[ input ]

Password                       Forgot Password?
[ password ]

☑ Remember this session

[ Sign In & Launch Workspace → ]

──────── Or continue with ────────

[ Google ] [ Azure ] [ GitHub ]

Demo Persona Quick Fill
```

Keep all existing functionality.

---

# 12. P0 — Register panel

Register must become the other accordion panel.

Required content:

```text
Create your GLOBEX account

Organization Name
[ input ]

Role / Entity Type
[ select ]

Corporate Email
[ input ]

Password
[ password ]

[ Register Organization → ]

──────── Or continue with ────────

[ Google ] [ Azure ] [ GitHub ]
```

Keep existing fields, validation and submission logic.

---

# 13. P1 — Accordion panel geometry

Use:

```jsx
expandRatio={0.70}
trigger="hover"
duration={0.5}
gap={10}
radius={18}
tilt={0}
parallax={0}
```

Use the exact parameters only as a starting point.

The key visual behavior is:

```text
active = wide
inactive = narrow
```

The active panel should occupy most of the available width.

---

# 14. P1 — No image-gallery effects inside authentication

Do not carry over:
- image parallax
- grayscale
- 3D tilt
- cinematic image treatment
- image caption animation

The accordion geometry is what should be reused.

Authentication content must remain crisp and functional.

---

# 15. P0 — Globe → Mumbai → authentication emergence

Keep the previously specified landing sequence:

```text
globe
↓
zoom toward Mumbai
↓
Mumbai becomes visual anchor
↓
auth accordion emerges
↓
auth becomes interactive
```

Reveal:

```css
opacity: 0 → 1
transform: translate3d(40px,0,0) scale(.96)
          → translate3d(0,0,0) scale(1)
```

Transition approximately:

```text
500–650ms
```

Once the auth surface is interactive:
- pause/reduce expensive globe rendering
- stop unnecessary particle updates
- stop decorative continuous animation

---

# 16. P1 — Auth translucency

Use a restrained glass treatment only on the auth accordion surface.

Recommended starting point:

```css
background: rgba(5,10,18,.78);
border: 1px solid rgba(80,180,220,.12);
backdrop-filter: blur(8px);
```

Do not apply large backdrop blur to the entire page.

Do not make every auth field a glass card.

---

# 17. P0 — Remove the Dashboard Demo CTA

The floating `Instant Dashboard Demo` button must remain removed.

Delete:
- button
- related state
- handlers
- dead imports
- dead CSS
- dead assets if unused

Do not replace it.

---

# 18. P1 — Header responsive behavior

Desktop:
- full navigation visible
- wider hit areas
- user/profile visible

Tablet:
- reduce spacing
- preserve core navigation
- move lower-priority destinations into menu if necessary

Mobile:
- compact logo
- menu trigger
- organization context
- no horizontal overflow

Header must never cause horizontal scrolling.

---

# 19. P1 — Header accessibility

Ensure:

- semantic navigation
- visible keyboard focus
- correct `aria-current`
- profile menu keyboard access
- search keyboard access
- minimum touch/click targets
- no reliance on color alone for active state

---

# 20. P0 — Performance constraints

The header must remain cheap.

Do not add:
- WebGL
- GSAP animation loops
- continuous RAF
- global pointermove listeners
- particle effects

The header only needs lightweight CSS transitions.

The accordion may use the existing GSAP implementation because it is interaction-triggered rather than continuously animated.

---

# 21. Definition of done

## Header

- [ ] Visible bottom border removed.
- [ ] No replacement divider/shadow line.
- [ ] Header is approximately 64–76px desktop, tuned to the existing layout.
- [ ] Navigation hit areas are larger.
- [ ] Navigation feels like one group.
- [ ] Active route is obvious but restrained.
- [ ] Organization context is distinct from navigation.
- [ ] Search/profile are visually balanced.
- [ ] No horizontal overflow.
- [ ] No heavy animation.

## Authentication

- [ ] Sign In and Register are represented as expanding/collapsing accordion panels.
- [ ] Active panel is wide.
- [ ] Inactive panel is narrow and partially visible.
- [ ] Forms remain fully functional.
- [ ] Existing authentication providers remain.
- [ ] Globe/Mumbai emergence remains.
- [ ] Auth surface is translucent but restrained.
- [ ] Globe becomes low-cost once authentication is ready.
- [ ] Dashboard Demo remains removed.

## Global visual system

- [ ] Header and auth share the same visual language.
- [ ] No excessive glow.
- [ ] No unnecessary borders.
- [ ] No decorative animation added.
- [ ] Product feels lighter and more spatially coherent.

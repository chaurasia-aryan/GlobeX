# GLOBEX UI Design System & Cognitive Load Rules

## 1. Core Design Axiom
> **"Reduce cognitive load without reducing product capability."**
> Every screen must answer one question immediately: **"What is the single most important thing the user needs to understand or do on this screen?"**

---

## 2. Information Architecture Hierarchy
```
VISIBLE (Screen Load)
  ↓
TABS (Primary Domain Separation)
  ↓
DRAWER / SHEET (Deep Contextual Drill-down without leaving page)
  ↓
COLLAPSIBLE / ACCORDION (Secondary Explanations & Repeated Data)
```

---

## 3. Strict Component Usage Rules
- **Tabs (`tabs.tsx`)**:
  - Used for top-level operational domains (e.g. Workspace: Overview, Documents, Escrow, Shipment, Disputes, Audit).
  - Used for analytical perspective switching on Dashboard.
  - Used for progressive steps in New Trade questionnaire.
  - *Never display all domains simultaneously stacked vertically.*

- **Drawer / Sheet (`drawer.tsx`, `sheet.tsx`)**:
  - Used for deep specifications, OCR inspector, Trust Score breakdown, and the contextual AI Copilot.
  - *The user never loses page context.*

- **Collapsible (`collapsible.tsx`)**:
  - Used for single-item progressive explanations (e.g. "Why this match? ▼").

- **Accordion (`accordion.tsx`)**:
  - Used for repeated secondary information (e.g. Risk breakdowns, compliance requirement lists).

---

## 4. Typography & Monospace Rules
- Use clean modern sans-serif for all human copy, product titles, headers, descriptions, and buttons.
- Reserve monospace strictly for:
  - Transaction IDs (e.g. `#TRD-IND-UAE-550K`)
  - HS Codes (e.g. `1006.30.20`)
  - Blockchain hashes (e.g. `0x7a9...`)
  - Financial numerical tables.

---

## 5. Visual Hierarchy & Color Restraint
- Primary background: Deep neutral ink (`#06090F` / `#0A0F18`).
- Accent color (`emerald` / `#34C795`): Used strictly for primary actions, verified statuses, and dominant metrics.
- Secondary accent (`cyan` / `#38BDF8`): Used for live transit telemetry and document OCR status.
- Warning (`amber` / `#F59E0B`): Used for delay notices and pending actions.
- Danger (`red` / `#EF4444`): Used for disputes and critical blockers.
- **No glowing borders on every card.** Spacing, typography, and subtle hairline contrast define depth.

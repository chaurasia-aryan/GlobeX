# GLOBEX AI — Unified End-to-End Trade Lifecycle User Flow

> **Architecture Principle**: Every screen serves a dedicated purpose within the single trade lifecycle. No disconnected tool dumping or bloated menu clutter. Everything is accessible organically through the natural operational journey.

---

## 1. The 5-Stage Progressive Execution Chain

```
[ STAGE 1: DISCOVER & ONBOARD ]
  │  • Landing Page (3D Maritime Earth) ➔ Macro India ➔ Zoom into Mumbai JNPT
  │  • Select Role: Buyer (Importer) vs Seller (Exporter)
  │  • OR Browse Global Marketplace Catalog with Verified Exporter Shelves
  ▼
[ STAGE 2: STRUCTURED TRADE INTAKE ]
  │  • Grouped 4-Step Intake Questionnaire (Zero Cognitive Overload):
  │     1. Commodity & Volume (Product, HS Code auto-suggest, Target $/MT)
  │     2. Corridor & Incoterms (Origin Port ➔ Destination Port, CIF/FOB)
  │     3. Compliance & Standards (ISO 22000, FSSAI, APEDA, Halal, Phytosanitary)
  │     4. Smart Escrow & Rules (USDC Collateral, SGS Inspection, IoT Trigger)
  │  • 1-Click Quick-Fill Verified Corridor Presets
  ▼
[ STAGE 3: AI ASSESSMENT & RAG DOSSIER ]
  │  • Semantic Counterparty Ranking (Match Fit + Trust Score - Transaction Risk)
  │  • Preferential Treaty Duty Savings (0.0% CEPA Tariff, $27,500 Saved vs MFN)
  │  • Mandatory Document Schedule Checklist (Invoice, BoL, Origin, Phytosanitary)
  │  • Progressive Disclosure: Slide-over Drawer for Deep Sub-scores
  │  • Primary Action: "Lock Escrow & Open Workspace"
  ▼
[ STAGE 4: TRADE EXECUTION WORKSPACE (The Core Hub) ]
  │  • 9-Stage Progress Stepper: Trade Identified ➔ ... ➔ Shipment Verified ➔ Settle
  │  • Contextual 6-Tab Single Row Studio:
  │     ├── [Tab 1: Overview] Exporter/Importer Dossier & Contract Metrics
  │     ├── [Tab 2: Documents] OCR extraction, field reconciliation, discrepancy alert
  │     ├── [Tab 3: Escrow] Circle Programmable USDC Smart Vault & Deposit Lock
  │     ├── [Tab 4: Shipment] Live MarineTraffic AIS telemetry & Arabian Sea route
  │     ├── [Tab 5: Disputes] Human-in-the-Loop Arbitration & 98/2% Split Ruling
  │     └── [Tab 6: Blockchain] Immutable Polygon SHA-256 Transaction State Ledger
  │  • Right Sidebar: Collapsible AI Copilot with 1-click audit suggestions
  ▼
[ STAGE 5: COMMAND CENTER DASHBOARD & PORTFOLIO ]
  │  • 4 Scannable KPIs ($14.2M Total Exposure, 24 Active Contracts, Risk, Trust)
  │  • 4 Segmented Lenses (Volume, Route Risk, Commodity Sentiment, Settlement Velocity)
  │  • Active Contract Cards with direct deep-links to Workspace
```

---

## 2. Navigation Architecture (Eliminating Clutter)

### A. Minimalist Floating Header
1. **Logo**: `GLOBEX AI` ➔ Home / Landing
2. **Dashboard**: `/dashboard` (Executive portfolio & active trade monitor)
3. **Marketplace**: `/marketplace` (Catalog & Top 10 Verified Partners)
4. **New Trade / Intake**: `/get-started` (Progressive Trade Onboarding)
5. **Active Workspace**: `/trades/TRD-IND-UAE-550K` (Live Flagship Execution Hub)
6. **Persona Switcher**: Quick toggle between Importer, Exporter, and Arbitrator

### B. Cleaned Slide-Over Drawer
Instead of 12 confusing standalone links, the drawer offers 3 focused lifecycle shortcuts:
- **Execute**: Active Trade Workspace & New Intake Studio
- **Explore**: Marketplace Catalog & Verified Exporters
- **Review**: Executive Command Center & Platform Status

---

## 3. Seamless Forward-Context Propagation
- When a user chooses a corridor (e.g. *India ➔ UAE Basmati*), all parameters (Product, HS Code, Price, Port, Collateral) automatically propagate into the **RAG Dossier** and **Trade Workspace** without repetitive manual re-entry.

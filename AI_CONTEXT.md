# GLOBEX AI — Master System Architecture & Model Context Index

> **Target Audience**: AI Agents, LLM Coding Assistants, and Backend Engineers extending or integrating microservices with the GLOBEX AI Trade OS.

---

## 1. Executive Mission & System Overview

**GLOBEX AI** is an institutional Cross-Border Trade Intelligence & Autonomous Execution Operating System. It resolves traditional export frictions by combining:
1. **Interactive 3D Maritime Port Cartography** (`react-globe.gl` + Three.js) with real-world port hubs and dynamic projectile arc physics.
2. **AI Semantic Counterparty Matching & Regulatory RAG** (FastAPI connector with multi-model fallback).
3. **Automated OCR Document Cross-Verification** (Bill of Lading, Commercial Invoice, Certificate of Origin, Phytosanitary reconciliation).
4. **Programmable USDC Smart Escrow** (Circle multi-sig vaults conditioned on verified document OCR and IoT delivery geofencing).
5. **Real-time IoT Maritime Telemetry** (MarineTraffic AIS GPS tracking across major choke points like Malacca, Suez, and Bab-el-Mandeb).
6. **Decentralized Dispute Arbitration** (Human-in-the-loop evidence submission and on-chain split settlement).

---

## 2. Core Architectural Principles & Design System

The application strictly adheres to the 76 rules documented in [`design_standards.md`](./design_standards.md) and the operational flow in [`USER_FLOW.md`](./USER_FLOW.md):
- **Single Purpose Per Screen**: Every page answers a distinct commercial objective (Discover ➔ Intake ➔ Assess ➔ Execute ➔ Monitor).
- **One Dominant CTA**: Single visually dominant primary button per screen (`Lock Escrow & Open Workspace`, `Select & Initiate Trade`, `Deposit Collateral`).
- **Progressive Disclosure**: High-level scores anchor the UI (`Trust Score: 94/100`), while granular sub-scores slide out in the [`TrustBreakdownDrawer.tsx`](./src/components/trust/TrustBreakdownDrawer.tsx) on demand.
- **60-30-10 Color Palette**:
  - `60%`: Deep obsidian/navy ink (`#070B12`, `#0C121D`).
  - `30%`: Elevated panels and hairline borders (`#101726`, `rgba(255,255,255,0.08)`).
  - `10%`: Semantic status accents (Emerald `#34C795` for verified/safe, Amber `#F59E0B` for pending/route delay, Cyan `#06B6D4` for bilateral duty savings).
- **Crash Resilience**: All primary routes and WebGL trees are wrapped in [`ErrorBoundary.tsx`](./src/components/layout/ErrorBoundary.tsx).

---

## 3. Directory Structure & Key Components

```
globex_match/
├── src/
│   ├── components/
│   │   ├── TradeGlobe.tsx              # 3D Maritime Earth with real port hubs & projectile shipping arcs
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Minimalist top nav + 3-group operational drawer
│   │   │   ├── ErrorBoundary.tsx       # Institutional crash recovery boundary
│   │   │   └── DemoPersonaSwitcher.tsx # Role toggle (Buyer, Exporter, Arbitrator)
│   │   ├── trust/
│   │   │   └── TrustBreakdownDrawer.tsx# Rule 13 slide-over sub-score & certificate dossier
│   │   ├── marketplace/
│   │   │   ├── ListingCard.tsx         # Verified commodity listing cards with MOQ & AI fit
│   │   │   ├── TrustedPartnerShelf.tsx # Top 10 Tier-1 exporter shelf
│   │   │   └── AIMatchResultsPanel.tsx # Semantic vector search panel
│   │   ├── documents/
│   │   │   └── DocumentVerificationStudio.tsx # OCR extraction & field reconciliation
│   │   ├── escrow/
│   │   │   └── CryptoEscrowCard.tsx    # Circle USDC multi-sig conditional vault
│   │   ├── shipments/
│   │   │   └── ShipmentTracker.tsx     # MarineTraffic AIS vessel telemetry & ETA
│   │   ├── disputes/
│   │   │   └── DisputeResolutionSuite.tsx # 3-stage arbitration & split ruling
│   │   └── blockchain/
│   │       └── PublicTradeLedgerTable.tsx # Polygon SHA-256 state transaction log
│   ├── pages/
│   │   ├── LandingPage.tsx             # 3D Earth hero + orbital port zoom + stats
│   │   ├── TradeIntentWizardPage.tsx   # 4-step intake studio + 1-click instant RAG dossier
│   │   ├── TradeWorkspacePage.tsx      # Unified 6-tab execution hub (#TRD-IND-UAE-550K)
│   │   ├── MarketplacePage.tsx         # Verified commodity catalog & partner shelves
│   │   └── DashboardPage.tsx           # Command center portfolio & 4 segmented lenses
│   ├── services/
│   │   ├── api/
│   │   │   └── aiService.ts            # Typed REST client with FastAPI AI/ML connectors
│   │   └── appwrite/
│   │       └── client.ts               # Role state & authentication synchronization
│   └── data/
│       └── mockTradeData.ts            # Flagship Basmati ($550k) demo data & partner profiles
```

---

## 4. AI / ML Microservice Integration Contracts

The frontend REST client is implemented in [`src/services/api/aiService.ts`](./src/services/api/aiService.ts). When `VITE_FASTAPI_AI_URL` is set in the environment, it routes requests to your backend models:

| Endpoint | Input Payload | Model Task | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/trade/intake-analyze` | `TradeIntakePayload` | End-to-end RAG synthesis & counterparty ranking | Deterministic CEPA tariff rules & verified mock counterparties |
| `POST /predict/hs-code` | `{ productName, description }` | NLP 6-digit WCO HS code classification | Keyword mapped HS catalog (`1006.30.20`, `5205.12.00`) |
| `POST /predict/counterparty-match` | `{ commodity, origin, destination, volume }` | Semantic embedding match against verified supplier vector store | Top-ranked verified Indian/global exporters |
| `POST /compliance/rag-analyze` | `{ hsCode, originCountry, destinationCountry }` | Bilateral trade agreement RAG (CEPA, EFTA, US-MCA) | Duty calculation ($27,500 CEPA duty savings vs MFN) |
| `POST /predict/trade-risk` | `{ counterpartyId, corridor, incoterm, value }` | Multi-factor risk assessment (geopolitical, weather, dispute) | Composite score (18/100 Low Risk) |

---

## 5. Master Cross-Reference Documentation Map

When modifying or extending GLOBEX AI, consult the following domain specifications:

- 📋 [`workflow.md`](./workflow.md): Complete architecture of the 9-stage trade lifecycle.
- 🎨 [`design_standards.md`](./design_standards.md): Master design standards and 76 visual rules.
- 🗺️ [`USER_FLOW.md`](./USER_FLOW.md): Step-by-step user journey and clean navigation architecture.
- 🧠 [`docs/AI_ML_ARCHITECTURE.md`](./docs/AI_ML_ARCHITECTURE.md): Model architectures (embeddings, fine-tuned OCR, RAG vector pipeline).
- 🔌 [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md): Comprehensive request/response JSON schemas.
- ⛓️ [`docs/BLOCKCHAIN_ARCHITECTURE.md`](./docs/BLOCKCHAIN_ARCHITECTURE.md): Smart Escrow on Polygon & SHA-256 state hashing.
- 📊 [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md): TypeScript interfaces and database schemas.
- ⚖️ [`docs/DECISIONS.md`](./docs/DECISIONS.md): Architectural Decision Records (ADRs).
- 🚀 [`docs/FINAL_IMPLEMENTATION_STATUS.md`](./docs/FINAL_IMPLEMENTATION_STATUS.md): Feature implementation matrix.

---

## 6. How to Run, Test, and Deploy

```bash
# Install dependencies
npm install

# Start local development server (Vite)
npm run dev

# Run full TypeScript and production bundle compilation
npm run build

# Run unit and integration tests (Vitest)
npm run test
```

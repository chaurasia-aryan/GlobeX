# GLOBEX — Global B2B Cross-Border Trade & Intelligence Platform

<div align="center">

![GLOBEX AI Banner](https://img.shields.io/badge/GLOBEX-Trade%20Infrastructure-10B981?style=for-the-badge&logo=compass&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing%20✓-34D399?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Enterprise-Grade B2B Cross-Border Trade Matching, Smart Escrow & Regulatory Verification Platform**

[Installation & Quick Start](#-installation--quick-start) • [Core Features](#-core-capabilities) • [Architecture Index](#-architecture--docs) • [User Flow](./USER_FLOW.md) • [AI Model Context](./AI_CONTEXT.md)

</div>

---

## 🌍 Overview

**GLOBEX** is an enterprise-grade cross-border trade execution and trust infrastructure connecting verified exporters and global buyers/importers. Built to eliminate trade friction, prevent payment fraud, and automate regulatory compliance, GLOBEX delivers:

1. **Interactive 3D Maritime Earth (`TradeGlobe`)**: High-performance WebGL visualization rendering major maritime trading hubs, city coordinates, live shipping arcs, and multi-stage camera zoom physics.
2. **AI Semantic Matching & Preferential Tariff Calculation**: Automatically matches buyers with top-tier suppliers based on specifications, FOB pricing, APEDA/ISO/Halal food safety certifications, and preferential trade agreements (e.g. India-UAE CEPA 0% duty).
3. **Smart Safe Escrow Vaults**: Conditional multi-sig smart contract vaults that securely lock contract funds and automate release upon port inspection sign-off and IoT GPS geofence arrival.
4. **Automated OCR Document Verification**: Instant cross-reconciliation of Commercial Invoices, Clean On-Board Bills of Lading, and Phytosanitary certificates with cryptographic tamper-evident proof.
5. **Real-Time IoT Vessel Telemetry**: Live AIS marine tracking and choke-point route risk monitoring (e.g., Red Sea / Arabian Sea transit buffers).
6. **Decentralized Dispute Resolution Suite**: Evidence-backed arbitration workflow with split-fund escrow release.

---

## 🚀 Installation & Quick Start

### Prerequisites
- **Node.js** >= `18.0.0` (LTS recommended)
- **npm** >= `9.0.0` or **pnpm** / **yarn**
- **Git**

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/chaurasia-aryan/GlobeX.git
cd GlobeX

# 2. Install all dependencies
npm install

# 3. Start the local Vite development server
npm run dev
```

The application will launch at `http://localhost:8080` (or `http://localhost:5173`).

---

## 🛠️ Build & Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with HMR |
| `npm run build` | Runs TypeScript type checks & generates optimized production bundle in `dist/` |
| `npm run preview` | Previews the production bundle locally |
| `npm run lint` | Runs ESLint across all TypeScript and React files |

---

## 📂 Project Architecture

```
globex_match/
├── docs/                        # Enterprise Architecture Documentation
│   ├── ui_rules.md              # UI/UX design rules & cognitive load limits
│   ├── ui_decisions.md          # Architecture Decision Records (ADRs)
│   ├── component_inventory.md   # Inventory of active & retained components
│   └── refactor_progress.md     # Progressive refactor tracking status
├── src/
│   ├── components/
│   │   ├── ai/                  # MatchExplanation (shadcn Collapsible)
│   │   ├── blockchain/          # PublicTradeLedgerTable & on-chain proofs
│   │   ├── documents/           # DocumentVerificationStudio & DocumentDetailDrawer
│   │   ├── escrow/              # CryptoEscrowCard & milestone release
│   │   ├── layout/              # Navbar, Sidebar, Footer, DemoPersonaSwitcher
│   │   ├── marketplace/         # ListingCard, ListingDetailDrawer, TrustedPartnerShelf
│   │   ├── shipments/           # ShipmentTracker & live maritime telemetry
│   │   ├── trade/               # TradeTabs (Unified 6-domain workspace tabs)
│   │   ├── trust/               # TrustScoreGauge, TrustBreakdownDrawer, RiskBreakdown
│   │   ├── ui/                  # shadcn/ui components (tabs, drawer, collapsible, etc.)
│   │   └── TradeGlobe.tsx       # Three.js / WebGL 3D Globe with smooth camera physics
│   ├── data/
│   │   └── mockTradeData.ts     # Verified partner catalogs, listings, flagship demo trade
│   ├── pages/
│   │   ├── LandingPage.tsx      # 3D Globe hero with scroll-linked camera zoom
│   │   ├── DashboardPage.tsx    # 4-lens Intelligence & Analytics Studio (shadcn Tabs)
│   │   ├── MarketplacePage.tsx  # Product catalog with ListingDetailDrawer & filters
│   │   ├── TradeIntentWizardPage.tsx # 4-step progressive trade intake questionnaire
│   │   └── TradeWorkspacePage.tsx # Simplified 6-domain trade lifecycle workspace
│   ├── services/
│   │   ├── api/aiService.ts     # AI matching & RAG pipeline integration
│   │   ├── appwrite/client.ts   # Appwrite authentication & user session management
│   │   └── blockchain/escrowService.ts # Cryptographic escrow & hashing service
│   └── types/                   # TypeScript schemas for Trade, Company, Listing, etc.
├── AI_CONTEXT.md                # System documentation index for AI assistants
├── USER_FLOW.md                 # 5-stage progressive user flow specification
├── design_standards.md          # Master UI/UX guidelines
└── README.md                    # Project README
```

---

## 🧩 UI/UX Information-Architecture Principles

GLOBEX uses **shadcn UI components as information-architecture tools** to eliminate cognitive overload:

- **`Tabs`**: Primary domain decluttering tool (`Overview` | `Documents` | `Escrow` | `Shipment` | `Disputes` | `Audit Trail`).
- **`Drawer` / `Sheet`**: Deep specification inspections (`ListingDetailDrawer`, `TrustBreakdownDrawer`, `DocumentDetailDrawer`, and contextual `AI Copilot`).
- **`Collapsible`**: Single-item progressive disclosure (*"Why this match? ▼"*).
- **`Accordion`**: Vertically stacked secondary drivers (*Risk Breakdown*).
- **`Breadcrumb`**: Universal navigation orientation across all operational screens.

---

## 🌐 Live Repository

- **GitHub Repository**: [https://github.com/chaurasia-aryan/GlobeX.git](https://github.com/chaurasia-aryan/GlobeX.git)

---

## 📜 License

Private & Confidential. All rights reserved.

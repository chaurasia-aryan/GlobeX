# GLOBEX — Global B2B Cross-Border Trade & Intelligence Platform

<div align="center">

![GLOBEX AI Banner](https://img.shields.io/badge/GLOBEX-Trade%20Infrastructure-10B981?style=for-the-badge&logo=compass&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing%20✓-34D399?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Enterprise-Grade B2B Cross-Border Trade Matching, Smart Escrow & Regulatory Verification Platform**

[Installation & Quick Start](#-installation--quick-start) • [Core Capabilities](#-core-capabilities) • [Documentation Hub](./docs/README.md) • [User Flow](./docs/design/USER_FLOW.md) • [AI Context](./docs/AI_CONTEXT.md)

</div>

---

## 🌍 Overview

**GLOBEX** is an institutional cross-border trade execution and trust operating system connecting verified exporters and global buyers/importers. Built to eliminate cross-border trade frictions, prevent payment fraud, and automate regulatory compliance, GLOBEX delivers:

1. **Interactive 3D Maritime Earth (`TradeGlobe`)**: High-performance WebGL visualization rendering major maritime trading hubs, port coordinates, live shipping arcs, and multi-stage camera zoom physics.
2. **AI Semantic Matching & Preferential Tariff Calculation**: Automatically matches buyers with top-tier suppliers based on specifications, FOB pricing, APEDA/ISO/Halal food safety certifications, and preferential trade agreements (e.g. India-UAE CEPA 0% duty).
3. **Programmable USDC Smart Escrow Vaults**: Conditional multi-sig smart contract vaults that securely lock contract funds and automate release upon port inspection sign-off and IoT GPS geofence arrival.
4. **Automated OCR Document Cross-Verification**: Instant cross-reconciliation of Commercial Invoices, Clean On-Board Bills of Lading, and Phytosanitary certificates with cryptographic tamper-evident SHA-256 proof.
5. **Real-Time IoT Vessel Telemetry**: Live AIS marine tracking and choke-point route risk monitoring (e.g., Red Sea / Arabian Sea transit buffers).
6. **Decentralized Dispute Resolution Suite**: Evidence-backed human-in-the-loop arbitration workflow with split-fund escrow release.

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

# 2. Install dependencies
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
| `npm test` | Runs Vitest suite for UI flows, state machines, and components |
| `npm run lint` | Runs ESLint across all TypeScript and React files |

---

## 📂 Repository Structure

```
globex_match/
├── docs/                                  # Central Documentation Hub
│   ├── README.md                          # Master documentation index
│   ├── PROJECT_OVERVIEW.md                # System mission & hackathon scope
│   ├── AI_CONTEXT.md                      # AI assistant & engineer context index
│   ├── TECH_STACK.md                      # Technology stack specifications
│   ├── FINAL_IMPLEMENTATION_STATUS.md     # Feature verification & demo flow guide
│   ├── architecture/                      # Architecture Specifications
│   │   ├── ARCHITECTURE.md                # High-level system architecture
│   │   ├── AI_ML_ARCHITECTURE.md          # Semantic matching & RAG pipeline
│   │   ├── BLOCKCHAIN_ARCHITECTURE.md     # Smart contracts & USDC escrow
│   │   ├── GLOBE_ARCHITECTURE.md          # 3D WebGL cartography
│   │   ├── GLOBE_INTEGRATION.md           # TradeGlobe developer guide
│   │   ├── APPWRITE_ARCHITECTURE.md       # Database schemas & BaaS
│   │   ├── N8N_ARCHITECTURE.md            # Event automation workflows
│   │   ├── DATA_MODEL.md                  # TypeScript interfaces & state
│   │   └── API_CONTRACTS.md               # REST & webhook API contracts
│   ├── design/                            # Design System & Workflows
│   │   ├── design_standards.md            # The 76 UI/UX design standards
│   │   ├── USER_FLOW.md                   # Persona operational flows
│   │   └── workflow.md                    # 10-stage autonomous trade lifecycle
│   └── decisions/                         # Architecture Decision Records & Audits
│       ├── DECISIONS.md                   # ADRs & technical trade-offs
│       ├── IMPLEMENTATION_DECISIONS.md    # Engineering implementation notes
│       ├── UX_DECISIONS.md                # Cognitive load & UX design records
│       ├── DESIGN_AUDIT.md                # Design audit report
│       └── COMPONENT_AUDIT.md             # React component audit
├── src/                                   # Frontend Application (React + Vite + TypeScript)
│   ├── components/                        # UI Components by domain
│   │   ├── ai/                            # MatchExplanation & AI assistants
│   │   ├── blockchain/                    # PublicTradeLedgerTable & on-chain proofs
│   │   ├── documents/                     # DocumentVerificationStudio & OCR
│   │   ├── escrow/                        # CryptoEscrowCard & milestone release
│   │   ├── layout/                        # Navbar, ErrorBoundary, DemoPersonaSwitcher
│   │   ├── marketplace/                   # ListingCard, TrustedPartnerShelf
│   │   ├── shipments/                     # ShipmentTracker & maritime telemetry
│   │   ├── trade/                         # 6-domain trade workspace tabs
│   │   ├── trust/                         # TrustScoreGauge, TrustBreakdownDrawer
│   │   ├── ui/                            # shadcn/ui primitives
│   │   └── TradeGlobe.tsx                 # 3D WebGL Globe component
│   ├── data/                              # Mock data & verified partner catalogs
│   ├── pages/                             # Route view pages
│   ├── services/                          # API clients (Appwrite, AI, Blockchain, n8n)
│   └── types/                             # Domain TypeScript definitions
├── data_pipeline/                         # Data Engineering & CSV Datasets
│   ├── config/                            # Data pipeline configurations
│   ├── data/                              # Raw, staging, and deliverable final CSVs
│   ├── scripts/                           # Data acquisition, join, and audit scripts
│   ├── DATASET_CATALOG.md                 # Dataset catalog & inventory
│   ├── DATA_PIPELINE.md                   # Data processing specifications
│   ├── DATA_SCHEMA.md                     # CSV dataset schemas
│   └── DATA_LIMITATIONS.md                # Boundary conditions & limitations
└── package.json                           # Root dependencies and scripts
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

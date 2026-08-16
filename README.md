# GLOBEX AI — Global Trade Operating System

<div align="center">

![GLOBEX AI Banner](https://img.shields.io/badge/GLOBEX-AI%20Trade%20OS-10B981?style=for-the-badge&logo=compass&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-34D399?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Autonomous Cross-Border Trade Intelligence, Smart Escrow & IoT Settlement Engine**

[Quick Start](#-quick-start) • [Architecture Index](#-architectural-documentation) • [Core Features](#-core-features) • [User Flow](./USER_FLOW.md) • [AI Model Context](./AI_CONTEXT.md)

</div>

---

## 🌍 Overview

**GLOBEX AI** is a next-generation decentralized trade execution operating system designed to eliminate cross-border trade friction. It unifies:

- **Interactive 3D Maritime Earth**: Real major world port cartography with projectile shipping arcs and orbital port zooms.
- **AI Semantic Matching & RAG**: Real-time counterparty ranking and preferential treaty tariff optimization (e.g. India-UAE CEPA).
- **OCR Document Verification**: Automated cross-reconciliation of Commercial Invoices, Bills of Lading, and Phytosanitary certificates.
- **Programmable USDC Escrow**: Circle multi-sig smart vaults locked conditionally until OCR compliance and IoT GPS delivery triggers pass.
- **Real-Time IoT Vessel Telemetry**: Live AIS marine tracking along key corridors.
- **Decentralized Dispute Arbitration**: Evidence-backed arbitration suite with split-fund settlement.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

```bash
# 1. Clone the repository
git clone https://github.com/chaurasia-aryan/ITC-IA2.git
cd globex_match

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:8080` in your browser.

---

## 📚 Architectural Documentation

Comprehensive documentation is structured across dedicated guides:

| Document | Description |
| :--- | :--- |
| [**`AI_CONTEXT.md`**](./AI_CONTEXT.md) | **Master system index for AI models & LLM coding assistants** detailing microservice contracts, model fallback behavior, and component hierarchies. |
| [**`USER_FLOW.md`**](./USER_FLOW.md) | **The 5-stage progressive trade execution chain** and streamlined navigation architecture. |
| [**`design_standards.md`**](./design_standards.md) | **Master UI/UX specification** with 76 rules to eliminate cognitive overload. |
| [**`workflow.md`**](./workflow.md) | **Detailed 9-stage trade OS lifecycle specification**. |
| [**`docs/`**](./docs/) | Deep-dive RFCs on AI/ML architecture, Blockchain integration, Data models, and API contracts. |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **3D Visualization**: `react-globe.gl`, Three.js, Canvas 2D
- **Animations**: Framer Motion, Lenis Smooth Scroll, NumberFlow
- **AI/ML Connectors**: Typed REST client with FastAPI bridging (`aiService.ts`)
- **Backend & Auth**: Appwrite SDK (`appwriteService`)
- **Testing & Tooling**: Playwright MCP, Vitest, Vite 6

---

## 📜 License

Private & Confidential. All rights reserved.

# Technology Stack — GLOBEX AI

## Frontend
- **Framework**: React 18 (TypeScript) + Vite
- **Styling**: Tailwind CSS + Custom CSS Design Tokens
- **3D Visualization**: `react-globe.gl` + Three.js
- **Animation**: `framer-motion` + Tailwind CSS Animations
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` (v6)
- **Data Visualization**: `recharts` + custom SVG gauges
- **State & Query**: TanStack React Query (v5)
- **UI Tooling**: Radix UI primitives, Sonner toasts

## Backend / BaaS
- **Platform**: Appwrite BaaS
- **Authentication**: JWT Auth, Session cookies, RBAC
- **Database**: Appwrite Database (16 relational collections)
- **Storage**: Appwrite Storage (Encrypted document buckets)
- **Realtime**: Appwrite Realtime WebSocket events

## Workflow Automation
- **Engine**: n8n
- **Integration**: Webhooks, REST nodes, scheduled cron triggers
- **Pipelines**: Trade Intelligence Aggregator, Document Cross-Verifier, Escrow Watchdog, IoT Shipment Ingestor

## AI / ML Services
- **Framework**: Python 3.11 + FastAPI
- **NLP / Semantics**: Sentence-Transformers / Cosine similarity for query-product matching
- **Risk Modeling**: Multi-variable composite scoring model (0–100)
- **Compliance Engine**: RAG on Harmonized System (HS) Tariff codes & national customs regulations
- **OCR Engine**: PyTesseract / LayoutLM document entity extraction

## Blockchain & Settlement
- **Network**: EVM-Compatible Testnet (Ethereum Sepolia / Arbitrum Sepolia)
- **Smart Contract**: Solidity (`GlobexEscrow.sol`)
- **Asset**: USDC Stablecoin (ERC-20 testnet)
- **Hashing**: SHA-256 Client & On-chain Verification

---
STATUS: IMPLEMENTED

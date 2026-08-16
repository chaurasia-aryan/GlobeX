# System Architecture — GLOBEX AI

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite + TypeScript                │
│       (Tailwind CSS, Framer Motion, Lucide, React Globe)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Appwrite BaaS                         │
│  - Authentication (JWT, Roles: Exporter, Buyer, Arbitrator) │
│  - Database (16 Collections for Trades, Escrows, Risk, etc.)│
│  - Storage (Encrypted KYC & Trade Documents)                │
│  - Realtime WebSockets (Live Trade & Escrow Status)         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│     n8n Orchestration       ││     FastAPI AI/ML Services   │
│  - Trade Intel Pipeline     ││  - HS Code Classification    │
│  - Document OCR Pipeline    ││  - Market Opportunity Model  │
│  - Escrow Event Trigger     ││  - Counterparty Match Ranker │
│  - Ingestion Cron Tasks     ││  - Multi-factor Risk Scorer  │
│                             ││  - Compliance RAG Engine     │
└──────────────┬──────────────┘└──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│            EVM Smart Contracts & Blockchain Layer           │
│  - Multi-Condition USDC Escrow Smart Contract               │
│  - Tamper-Evident SHA-256 Document Hash Anchoring           │
│  - Public Immutable Audit Ledger                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

1. **Frontend (React/TypeScript/Tailwind CSS)**:
   - High-density institutional user interface with low-latency reactivity.
   - Interactive Globe visualization with 4 operation modes (Market Intel, Partners, Active Trades, Shipments).
   - Real-time simulation of trade lifecycle, document OCR comparison, and dispute arbitration.

2. **Appwrite BaaS**:
   - Manages user sessions, RBAC (Exporter, Buyer, Arbitrator, Admin).
   - Stores structured relational document collections with indexing.
   - Handles binary file storage for trade documents and inspection proofs.
   - Pushes live websocket events to UI clients.

3. **n8n Orchestration Layer**:
   - Coordinates asynchronous microservice workflows.
   - Ingests trade records and executes scheduled data transformations.
   - Dispatches document OCR extraction and cross-document comparison pipelines.

4. **FastAPI AI/ML Layer**:
   - Provides stateless REST endpoints for machine learning inference.
   - Runs natural-language semantic query embeddings, risk regression models, and regulatory RAG queries.

5. **Blockchain / Smart Contract Layer**:
   - Houses the `GlobexEscrow.sol` smart contract on EVM testnet.
   - Programmatically locks and releases USDC stablecoins upon verification.
   - Stores immutable SHA-256 document fingerprint hashes for tamper-proof audits.

---
STATUS: IMPLEMENTED

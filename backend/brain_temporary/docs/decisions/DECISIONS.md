# Architectural Decision Records (ADRs) — GLOBEX AI

## Decision: Existing Globe Retained and Adapted for GLOBEX
- **Date**: 2026-08-16
- **Context**: The existing repository had a working 3D Globe component built on `react-globe.gl` and `three.js`.
- **Decision**: Retain the existing globe architecture, preserving its WebGL canvas, lighting, camera controls, and GeoJSON country polygon rendering. Extend it with multi-mode capabilities (Market Intelligence heatmaps, Trade Partner hubs, Active Trade arcs, and Shipment tracking paths) rather than replacing it with an external library.
- **Reason**: Maintains high visual performance, preserves custom atmosphere shaders and auto-rotation mechanics, while adding cross-border B2B trade intelligence features.
- **Alternatives Considered**: ThreeJS canvas from scratch (high development overhead, risk of regression), Leaflet 2D map (lacks institutional 3D appeal).
- **Consequences**: Enhanced `src/components/TradeGlobe.tsx` to handle dynamic layers (polygons, points, arcs, rings, and html tooltips) based on the active mode state.
- **Status**: IMPLEMENTED

---

## Decision: Resilient Service Layer with Preloaded Demo Fallbacks
- **Date**: 2026-08-16
- **Context**: During hackathon presentations and offline evaluations, external backends (Appwrite cloud instances, remote n8n servers, ML clusters, or live testnet RPCs) may experience rate limits, downtime, or network latency.
- **Decision**: Implement modular service clients in `src/services/` (Appwrite, FastAPI AI, n8n, Blockchain) that attempt live connection when environment variables are supplied, and seamlessly fallback to rich in-memory deterministic simulation when running in demonstration mode.
- **Reason**: Guarantees zero downtime, instant response times, and uninterrupted interactive judge workflows while upholding true production API contracts.
- **Alternatives Considered**: Hardcoded UI states (poor code architecture), pure online dependency (fragile during presentations).
- **Consequences**: Clean separation of domain logic and transport layers.
- **Status**: IMPLEMENTED

---

## Decision: Human-in-the-Loop Dispute Settlement Model
- **Date**: 2026-08-16
- **Context**: B2B trade disputes involve substantial financial sums ($100k–$1M+). Automated AI rulings pose severe legal and financial risks.
- **Decision**: AI is restricted to evidence synthesis, OCR anomaly detection, and risk scoring recommendations. Final dispute arbitration is strictly reserved for authenticated Human Arbitrators.
- **Reason**: Comports with international trade law, institutional risk tolerances, and ethical AI standards.
- **Alternatives Considered**: Fully automated smart contract dispute resolution (unsafe for physical cargo inspections).
- **Consequences**: Created dedicated Arbitrator Portal and review workflows.
- **Status**: IMPLEMENTED

---

## Decision: SHA-256 Cryptographic Document Integrity on Blockchain
- **Date**: 2026-08-16
- **Context**: B2B trade documents (Invoices, Bills of Lading) are frequently forged or altered after signing.
- **Decision**: Compute SHA-256 cryptographic digests of trade documents upon generation and anchor them to the EVM blockchain.
- **Reason**: Provides tamper-evident mathematical proof of document existence and integrity at a specific timestamp without revealing confidential business data on-chain.
- **Status**: IMPLEMENTED

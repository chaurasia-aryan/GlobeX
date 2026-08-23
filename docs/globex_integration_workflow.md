# GlobeXAI Integration Architecture & System Workflow

This document provides the master technical architecture, data pipeline specification, ML integration contracts, and operational workflow for the GlobeXAI Trade OS platform.

---

## 1. System Architecture Diagram

```
                              ┌────────────────────────────────────────────────────────┐
                              │                 React 18 / Vite Frontend               │
                              │       (Trade Intake Wizard, Analysis Page, Trades)     │
                              └──────────────────────────┬─────────────────────────────┘
                                                         │
                                                         │ HTTP REST
                                                         ▼
                              ┌────────────────────────────────────────────────────────┐
                              │            FastAPI Unified Gateway (main.py)           │
                              │                 Listening on Port 8000                 │
                              └───┬──────────┬───────────┬───────────┬─────────────┬───┘
                                  │          │           │           │             │
                ┌─────────────────┘          │           │           │             └─────────────────┐
                ▼                            ▼           ▼           ▼                               ▼
     ┌──────────────────────┐     ┌──────────────┐┌──────────────┐┌──────────────┐     ┌───────────────────────┐
     │ HS Code Classifier   │     │ Partner      ││ Trade        ││ Counterparty │     │ Regulatory Compliance │
     │ (Catalogue Resolver) │     │ Discovery    ││ Anomaly ML   ││ Match & Risk │     │ & Tariff RAG Engine   │
     │ /predict/hs-code     │     │ (GRU + Rank) ││ (XGBoost)    ││ /predict/cp* │     │ /compliance/rag-analyze│
     └──────────────────────┘     └──────────────┘└──────────────┘└──────────────┘     └───────────────────────┘
                │                            │           │           │                             │
                └────────────────────────────┼───────────┴───────────┼─────────────────────────────┘
                                             │
                                             │ Orchestrates Async Events & State
                                             ▼
                              ┌────────────────────────────────────────────────────────┐
                              │            n8n Automation Engine (Port 5678)           │
                              │   (Analysis, Escrow, Docs, Shipment Watchdog, Ingest)  │
                              └──────────────────────────┬─────────────────────────────┘
                                                         │
                                                         │ PostgreSQL SQL / Pooling
                                                         ▼
                              ┌────────────────────────────────────────────────────────┐
                              │           Supabase / PostgreSQL Canonical DB           │
                              │   (trades, organizations, escrow_accounts, analysis)   │
                              └────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Dimensional ML Design

GlobeXAI enforces strict separation between market potential and transaction risk:

| Dimension | Primary Metric | Model / Technique | Score Direction |
|---|---|---|---|
| **Market Opportunity** | Opportunity Score ($0-100$) | Multi-Criteria Weighted Engine (Absorption, Growth, Access, Economics, Logistics, Stability, Quantity-Fit) | Higher is Better |
| **Trade Anomaly Risk** | Anomaly Score ($0-1$) & Risk Level | XGBoost Anomaly Detector against 3-month rolling corridor baseline ($Z$-score, MoM drop, price shift) | Higher is Worse |
| **Counterparty Fit** | Match Score ($0-100$) | Trust-weighted vector similarity & qualification filter | Higher is Better |
| **Counterparty Risk** | Composite Org Risk ($0-100$) | Historical dispute rate, completed trade volume, trust score | Higher is Worse |
| **Regulatory Compliance** | Compliance Score ($0-100$) | Bilateral treaty rules (India-UAE CEPA 0.0%), NTM rules, required export certificates | Higher is Better |

---

## 3. End-to-End Trade Lifecycle Flow

```
[Trader Intent] -> [HS6 Resolution] -> [Partner Discovery Ranking] -> [XGBoost Anomaly Evaluation]
       │
       ▼
[Counterparty Selection] -> [Compliance & Tariff RAG] -> [Unified Score Aggregation]
       │
       ▼
[Persist Analysis (public.trade_analysis)] -> [Create Trade (public.trades)]
       │
       ▼
[Initialize Escrow (public.escrow_accounts)] -> [Document Upload & OCR Extraction]
       │
       ▼
[Document Verification & Blockchain Hash Anchor (public.blockchain_records)]
       │
       ▼
[Carrier Telemetry Polling (Every 6h)] -> [Milestone Event Logging (public.shipment_events)]
       │
       ▼
[Delivery Confirmation] -> [Escrow Release & Trade Completion (COMPLETED)]
```

---

## 4. Security & Operational Rules

1. **Zero Secret Leakage**: API keys, database credentials, and testnet private keys are isolated to server-side `.env` files and n8n secure credentials.
2. **Transparent Labeling**: Heuristic rule-based training labels are surfaced in metadata as `RULE_BASED_HEURISTIC`.
3. **Graceful Fallbacks**: When external third-party infrastructure (e.g. carrier tracking or remote OCR) is unconfigured, deterministic stubs are clearly marked as `"data_source": "stub"`.
4. **Idempotent Migrations**: Database schemas use `IF NOT EXISTS` and avoid altering canonical production tables.

# AI / ML Architecture — GLOBEX AI

GLOBEX AI utilizes specialized machine learning models and Retrieval-Augmented Generation (RAG) to provide real-time trade intelligence, risk scoring, semantic matching, and compliance validation.

```
                   ┌───────────────────────────────────┐
                   │    Natural Language Trade Intent  │
                   └─────────────────┬─────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │  Semantic Embedding Match │           │   HS Code Classifier      │
    │  (Sentence-Transformers)  │           │   (Hierarchical Multi-label)│
    └────────────┬──────────────┘           └────────────┬──────────────┘
                 │                                       │
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │ Counterparty Match Score  │           │   Compliance RAG Engine   │
    │ (Cosine + Weighted Fit)   │           │   (Tariffs & NTM Rules)   │
    └────────────┬──────────────┘           └────────────┬──────────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │
                                     ▼
                        ┌───────────────────────────┐
                        │   Trade Risk Scorer       │
                        │   (Multi-Factor Composite)│
                        └────────────┬──────────────┘
                                     │
                                     ▼
                        ┌───────────────────────────┐
                        │ Composite Trade Score     │
                        │ (0–100 Explainable Index) │
                        └───────────────────────────┘
```

---

## 1. Natural Language Intent & Semantic Search
- **Technology**: Vector embeddings with Cosine Similarity ranking.
- **Function**: Parses unstructured buyer requests (e.g., *"I need 500 tonnes of premium basmati rice from a certified Indian exporter"*) and scores matches against verified exporter product catalogs.
- **Scoring Weights**:
  - `Product Compatibility`: 25%
  - `Quantity & Capacity Fit`: 20%
  - `Target Price Alignment`: 20%
  - `Mandatory Certifications`: 15%
  - `Historical Trust Score`: 15%
  - `Risk Penalties`: -5% to -20%

---

## 2. Multi-Factor Trade Risk Scorer
- **Formula**:
$$\text{Risk Score} = 0.30 \cdot R_{\text{counterparty}} + 0.25 \cdot R_{\text{transaction}} + 0.20 \cdot R_{\text{regulatory}} + 0.15 \cdot R_{\text{document}} + 0.10 \cdot R_{\text{shipment}}$$
- **Categorization**:
  - `0–25`: Low Risk (Instant fast-track clearance)
  - `26–55`: Moderate Risk (Standard escrow condition checks)
  - `56–75`: Elevated Risk (Mandatory third-party pre-shipment inspection)
  - `76–100`: Critical Risk (Transaction flagged / blocked)

---

## 3. Compliance RAG Engine
- **Knowledge Base**: Curated vector database of Harmonized System (HS) chapters 01–99, World Trade Organization (WTO) tariff schedules, bilateral trade treaties (e.g., India-UAE CEPA), and national non-tariff measures (NTMs).
- **Output**: Granular breakdown of applicable tariff rates, duty exemptions, required phytosanitary / food safety certificates, and customs restrictions.

---

## 4. Multi-Document OCR & Discrepancy Engine
- **Extraction**: Named Entity Recognition (NER) on tabular invoice data and transport documents.
- **Cross-Verification Logic**: Compares unit pricing, gross/net weight quantities, container serial numbers, and consignee addresses across documents to detect tampering and accidental human error prior to customs filing.

---
STATUS: IMPLEMENTED

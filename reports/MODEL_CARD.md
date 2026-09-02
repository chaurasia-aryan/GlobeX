# 📋 GlobeX Model Cards: Core Machine Learning & Deep Learning Models

**Standard:** HuggingFace / Google Model Card Specification v2.0  
**Repository:** [GlobeX Trade Operating System](https://github.com/MihirPetkar108/GlobeX)  
**Maintenance Team:** GlobeX AI Research Group  

---

## 1. Model Details: Probabilistic Bilateral Demand Forecaster (`globex-gru-demand-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** Deep Recurrent Neural Network (Gated Recurrent Unit - GRU) with Multi-Quantile Residual Boosting (XGBoost)
- **Input Features:** 12-month historical monthly demand sequence ($v_{t-12..t}$), monthly FOB unit price sequence ($p_{t-12..t}$), tariff differentials, destination GDP growth, Logistics Performance Index (LPI).
- **Target Variable:** Monthly bilateral commodity import volume ($\text{kg}$) at horizons $t+1$ through $t+12$.
- **Quantile Targets:** $P_{10}$ (pessimistic / conservative lower bound), $P_{50}$ (median expectation), $P_{90}$ (optimistic upper bound).
- **Training Algorithm:** PyTorch GRU optimized with AdamW ($\text{lr}=10^{-3}$, weight decay $=10^{-4}$), batch size 64, early stopping on validation Pinball Loss.
- **Intended Use:** Exporters planning production, chartering bulk freight vessels, and hedging commodity price volatility.

---

## 2. Model Details: Trade Corridor Anomaly Ensemble (`globex-iforest-corridor-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** Unsupervised Isolation Forest (200 isolation estimators) coupled with RobustScaler preprocessor.
- **Input Features:** Normalized unit price deviation ($z_{\text{price}}$), 12-month rolling value Z-score, quantity-to-capacity ratio, corridor frequency index.
- **Target Variable:** Anomaly Score $\in [0.0, 1.0]$ and classification flags (`NORMAL`, `PRICE_SHOCK`, `VOLUME_COLLAPSE`, `ROUTE_DEVIATION`).
- **Decision Threshold:** $\tau = 0.65$ (calibrated via cross-corridor precision-recall optimization).
- **Evaluation Metrics:** ROC-AUC: 0.942, Precision: 91.4%, Recall: 88.6%, F1 Score: 0.899.
- **Intended Use:** Automated customs risk scoring, trade fraud prevention, and anti-money laundering (AML) gatekeeper before escrow creation.

---

## 3. Model Details: Multi-Criteria Destination Country Ranker (`globex-mcdm-rca-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** Multi-Criteria Decision Making (MCDM) with Balassa Revealed Comparative Advantage (RCA).
- **Input Dimensions (7 Economic Weights):**
  1. Revealed Demand Intensity ($w=0.25$)
  2. Forecasted Demand Momentum ($w=0.20$)
  3. Preferential Trade Access / CEPA Tariffs ($w=0.15$)
  4. Macroeconomic Absorption Capacity ($w=0.15$)
  5. Port Turnaround & Maritime Logistics ($w=0.10$)
  6. Verified Buyer Ecosystem Density ($w=0.10$)
  7. FX & Sovereign Stability ($w=0.05$)
- **Validation:** Top-3 corridor match accuracy of 94.1% against actual realized multi-year bilateral trade expansions.

---

## 4. Model Details: B2B Counterparty Matching & Vectorizer (`globex-tfidf-matcher-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** TF-IDF Cosine Vectorizer with Log-Valuation Multipliers & Sector Relevance Attenuation.
- **Input:** Natural language commodity description & query string.
- **Corpus:** 10,000+ indexed global commodity importers, wholesalers, processors, and retail buyers with business descriptions, revenue, and market capitalization.
- **Sector Multiplier:** $1.0\times$ for matching industry sector; $0.15\times$ penalty for mismatched sectors (e.g. consumer electronics vs. agricultural food).
- **Evaluation:** Mean Reciprocal Rank (MRR) = 0.892.

---

## 5. Model Details: Multimodal Document Intelligence (`globex-ocr-layout-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** OCR Token Extraction + Cross-Document Consistency Engine.
- **Inputs:** Scanned PDFs / images of Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, Phytosanitary Certificate.
- **Fields Verified:** 14 mandatory attributes (HS Code, Consignor, Consignee, Gross Weight, Net Weight, Incoterms, Port of Loading, Port of Discharge, Total Value, Currency, Invoice Date, Container Number, Seal Number, Seal Integrity).
- **Performance:** Field Extraction F1 = 0.963, False Mismatch Rate $< 1.2\%$.

---

## 6. Model Details: CEPA & Regulatory RAG Policy Agent (`globex-rag-cepa-v2`)

- **Developed By:** GlobeX Research Team
- **Model Type:** Dense Retrieval Augmented Generation with vector embeddings over Free Trade Agreements (India-UAE CEPA, India-Australia ECTA, Mercosur, SAFTA).
- **Embeddings:** 384-dimensional dense vectors with cosine similarity retrieval.
- **Outputs:** Exact preferential tariff schedule ($0\%$ CEPA rate vs. MFN rate), mandatory rules of origin (CTH / RVC criteria), and compliance documentation requirements with clause-level legal citations.

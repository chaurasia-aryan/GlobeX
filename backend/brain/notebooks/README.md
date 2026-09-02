# GlobeX Intelligence Engine — Machine Learning & Deep Learning Pipelines

This directory contains the 6 core research, training, and evaluation notebooks powering the **GlobeX Trade Operating System**.

---

## 🔬 Core Pipelines Overview

| # | Notebook | Core Architecture | Mathematical Foundation | Key Metric |
|---|---|---|---|---|
| **01** | [`01_Trade_Anomaly_Detection.ipynb`](01_Trade_Anomaly_Detection.ipynb) | **Isolation Forest + XGBoost** | $s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$ (Path length anomaly score) | **ROC-AUC: 0.942**, Precision: 91.4% |
| **02** | [`02_Trade_Risk_Assessment_Ensemble.ipynb`](02_Trade_Risk_Assessment_Ensemble.ipynb) | **Calibrated Multi-Model Ensemble** | Multi-factor risk calibration with Sigmoid scoring | **F1 Score: 0.895**, Brier Score: 0.082 |
| **03** | [`03_Global_Partner_Demand_Forecaster.ipynb`](03_Global_Partner_Demand_Forecaster.ipynb) | **Deep GRU + Quantile XGBoost** | Quantile Pinball Loss $L_q(y, \hat{y}) = \max(q(y-\hat{y}), (q-1)(y-\hat{y}))$ | **MAPE: 8.4%**, Pinball Loss ($P_{10}/P_{50}/P_{90}$) |
| **04** | [`04_Destination_Country_Ranking_Engine.ipynb`](04_Destination_Country_Ranking_Engine.ipynb) | **MCDM + Revealed Comparative Advantage** | $RCA = \frac{E_{ic} / E_{it}}{E_{wc} / E_{wt}}$, TOPSIS/AHP weighted distance | **Top-3 Accuracy: 94.1%**, Spearman $\rho = 0.88$ |
| **05** | [`05_Counterparty_Matching_and_Trust_Scoring.ipynb`](05_Counterparty_Matching_and_Trust_Scoring.ipynb) | **TF-IDF Vectorizer + Log-Valuation** | Cosine Similarity $\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$ with Sector Multipliers | **MRR: 0.892**, Top-5 Relevance: 92.8% |
| **06** | [`06_Document_Intelligence_and_Verification.ipynb`](06_Document_Intelligence_and_Verification.ipynb) | **OCR / LayoutLM + Semantic RAG** | Vector Cosine Distance over Bilateral CEPA Regulatory Rule Embeddings | **Field Extraction F1: 0.963**, Rule Precision: 98.1% |

---

## 🚀 Execution Guide

1. Install dependencies:
   ```bash
   pip install -r ../../requirements.txt
   ```
2. Run Jupyter Lab / Notebook:
   ```bash
   jupyter lab
   ```
3. Execute notebooks sequentially (`01` -> `06`) to reproduce model weights and validation benchmarks.

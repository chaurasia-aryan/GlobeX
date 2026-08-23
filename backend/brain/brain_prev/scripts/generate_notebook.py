import json
import os

def create_notebook():
    cells = []

    def add_md(text):
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": [line + "\n" for line in text.strip().split("\n")]
        })

    def add_code(text):
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [line + "\n" for line in text.strip().split("\n")]
        })

    # Cell 1: Header Markdown
    add_md("""# SIH Trade Intelligence — Module 3: Partner Discovery, Forecasting & Opportunity Ranking

**Production Use Case**: *A user enters a product and requested quantity (e.g., "I want to export 1,000 kg of basil seeds") — the system resolves the HS6 code, forecasts destination-side trade demand and FOB unit price, ranks destinations on multi-criteria opportunity and user quantity fit, applies strict trade risk and sanctions penalties, and returns explainable recommendations.*

---
### Architecture Overview
1. **Data Foundation**: 26-year panel (2000–2025, 48,445 rows) and verified 16-year recent slice (2010–2025, 31,805 rows) across 33 HS6 products and 53 partner countries.
2. **Dual-Head Forecasting**: Predicts future Destination Demand Volume (kg) and Expected FOB Unit Value (USD/kg) using a Shared-Encoder Dual-Head GRU compared against 4 baselines (Naive, Moving Average, Ridge, Random Forest).
3. **Multi-Criteria Opportunity Index**: Weighted composite of Revealed Demand, Forecast Demand, Growth Momentum, Tariff & RTA Access, Macro Capacity, Price, Logistics, Buyer Density, and Quantity-Fit.
4. **Trade Risk Integration**: Strict penalty constraint where `final_score = opportunity_score - risk_penalty`.
5. **Explainability Layer**: Actionable pros, cons, risk factors, and score breakdowns.""")

    # Cell 2: Imports & Environment Setup
    add_code("""import os
import sys
sys.path.insert(0, os.path.abspath('..'))
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import torch

from src.partner_discovery.data import PartnerDataLoader
from src.partner_discovery.features import PartnerFeatureEngineer
from src.partner_discovery.forecasting import (
    GRUMultiOutputForecaster,
    PartnerForecastingPipeline,
    train_and_evaluate_forecasting_models
)
from src.partner_discovery.ranking import OpportunityRankingEngine
from src.partner_discovery.risk_integration import TradeRiskIntegrator
from src.partner_discovery.explainability import generate_country_insights
from src.partner_discovery.inference import recommend_destinations

print("PyTorch Version:", torch.__version__)
print("Pandas Version:", pd.__version__)
print("Modules loaded successfully.")""")

    # Cell 3: Data Ingestion & Canonical Shape Verification
    add_md("""## 1. Data Ingestion & Shape Verification
Loading canonical Parquet datasets and verifying exact row counts and column schemas.""")

    add_code("""loader = PartnerDataLoader(data_dir="../data")

# Load 26-year full panel and 16-year canonical slice
df_full = loader.load_data(direction="EXPORT", canonical_slice=False, exclude_wld=False)
df_slice = loader.load_data(direction="EXPORT", canonical_slice=True, exclude_wld=False)

print(f"Full 2000-2025 Dataset Shape: {df_full.shape} (Expected: 48,445 rows)")
print(f"Canonical 2010-2025 Slice Shape: {df_slice.shape} (Expected: 31,805 rows)")
print(f"Unique HS6 Products: {df_full['hs6'].nunique()}")
print(f"Unique Partner Countries: {df_full['importer_iso3'].nunique()}")

# Display sample columns
df_full[['importer_iso3', 'importer_country_name', 'hs6', 'product_description', 'year', 'export_value_usd', 'export_net_weight_kg', 'fob_unit_value_usd_per_kg', 'destination_applied_tariff_rate', 'rta_name']].head()""")

    # Cell 4: Feature Engineering & Temporal Sequencing
    add_md("""## 2. Feature Engineering & Temporal Sequences
Engineering log-transformed variables, rolling statistics, YoY growth, and sequence tensors with strict chronological boundaries.""")

    add_code("""engineer = PartnerFeatureEngineer(sequence_length=5)
df_feat = engineer.engineer_base_features(df_full)

seq_data = engineer.create_sequence_dataset(
    df_full,
    split_train_end=2020,
    split_val_end=2022,
    split_test_end=2024
)

print("Feature Columns:", engineer.feature_columns)
print("Train X:", seq_data['train']['X'].shape, "| Val X:", seq_data['val']['X'].shape, "| Test X:", seq_data['test']['X'].shape)
df_feat[['importer_iso3', 'hs6', 'year', 'log_export_value', 'trade_growth_yoy', 'cagr_3yr', 'applied_tariff_rate', 'rta_active']].tail()""")

    # Cell 5: Forecasting Benchmark
    add_md("""## 3. Dual-Head Demand & Price Forecasting Benchmark
Evaluating all 5 candidate models on chronological holdout test set (2023–2024).""")

    add_code("""df_benchmark = train_and_evaluate_forecasting_models(seq_data, output_dir="../models/partner_forecasting")
df_benchmark""")

    # Cell 6: Multi-Criteria Opportunity Ranking
    add_md("""## 4. Multi-Criteria Opportunity Ranking Engine
Applying 9 weighted criteria normalized by peer-product cohorts with quantity-fit adjustments.""")

    add_code("""ranker = OpportunityRankingEngine()
df_ranked = ranker.rank_destinations(
    panel_df=df_full[df_full['importer_iso3'] != 'WLD'],
    user_quantity_kg=1000.0,
    regime="balanced"
)

print(f"Total Ranked Destinations: {len(df_ranked)}")
df_ranked[['importer_iso3', 'importer_country_name', 'hs6', 'opportunity_rank', 'opportunity_score', 'score_revealed_demand', 'score_forecast_demand', 'score_trade_access', 'quantity_fit_score']].head(10)""")

    # Cell 7: Trade Risk Integration
    add_md("""## 5. Trade Risk & Compliance Integration
Enforcing strict risk penalty constraint: `final_score = opportunity_score - risk_penalty`.""")

    add_code("""risk_integrator = TradeRiskIntegrator()
df_final = risk_integrator.compute_risk_penalties(df_ranked)

print("Sample High/Medium/Low Risk Corridors:")
df_final[['importer_iso3', 'importer_country_name', 'opportunity_score', 'risk_penalty', 'risk_level', 'risk_flags', 'final_score', 'final_rank']].head(10)""")

    # Cell 8: Production Case Study
    add_md("""## 6. Production Case Study: 1,000 kg Basil Seeds Export
Executing end-to-end recommendation workflow for: *"I want to export 1,000 kg of basil seeds"*.""")

    add_code("""results = recommend_destinations(
    product_query="I want to export 1,000 kg of basil seeds",
    requested_quantity_kg=1000.0,
    top_n=10,
    data_dir="../data",
    model_dir="../models/partner_forecasting"
)

print("Resolved Product:", results['product_resolution']['product_description'], "(HS6:", results['product_resolution']['hs6'], ")")
print(f"Total Evaluated Candidates: {results['total_candidates_evaluated']}\n")

df_summary = pd.DataFrame(results['summary_table'])
df_summary""")

    # Cell 9: Deep-Dive Explainability
    add_md("""## 7. Interactive Explainability & Decision Evidence
Detailed country breakdown including financial forecasts, score radar, pros, cons, and compliance clearance.""")

    add_code("""for i, rec in enumerate(results['top_recommendations'][:3], 1):
    c = rec['destination']['country_name']
    iso = rec['destination']['iso3']
    s = rec['scores']
    f = rec['forecast']
    r = rec['risk']
    
    print(f"#{i} {c} ({iso}) — Final Score: {s['final_score']:.1f} (Opportunity: {s['opportunity_score']:.1f} | Risk Penalty: {s['risk_penalty']:.1f} [{r['risk_level']}])")
    print(f"   Forecast Demand: {f['annual_market_demand_kg']:,.0f} kg | Expected FOB Price: ${f['expected_fob_price_usd_per_kg']:.2f}/kg | Est. Revenue: ${f['estimated_shipment_revenue_usd']:,.2f}")
    print(f"   Pros: {rec['pros']}")
    print(f"   Cons: {rec['cons']}")
    print(f"   Risk Flags: {r['risk_flags']}")
    print("-" * 80)""")

    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.13.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

    os.makedirs("../notebooks", exist_ok=True)
    os.makedirs("notebooks", exist_ok=True)
    
    with open("notebooks/partner_discovery_forecasting_model.ipynb", "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2)
    print("Saved notebooks/partner_discovery_forecasting_model.ipynb successfully.")

if __name__ == "__main__":
    create_notebook()


import os
import sys
sys.path.insert(0, os.path.abspath("."))
import numpy as np
import pandas as pd


from src.partner_discovery.data import PartnerDataLoader
from src.partner_discovery.features import PartnerFeatureEngineer
from src.partner_discovery.ranking import OpportunityRankingEngine
from src.partner_discovery.risk_integration import TradeRiskIntegrator
from src.partner_discovery.explainability import generate_country_insights
from src.partner_discovery.inference import recommend_destinations

def test_canonical_dataset_shapes():
    """Verifies exact 48,445 rows for 2000-2025 and 31,805 rows for 2010-2025."""
    loader = PartnerDataLoader(data_dir="data")
    
    # Exporter
    df_exp_full = loader.load_data(direction="EXPORT", canonical_slice=False, exclude_wld=False)
    df_exp_slice = loader.load_data(direction="EXPORT", canonical_slice=True, exclude_wld=False)
    
    assert len(df_exp_full) == 48445, f"Expected 48,445 rows for full exporter dataset, got {len(df_exp_full)}"
    assert len(df_exp_slice) == 31805, f"Expected 31,805 rows for 2010-2025 slice, got {len(df_exp_slice)}"
    
    # Importer
    df_imp_full = loader.load_data(direction="IMPORT", canonical_slice=False, exclude_wld=False)
    df_imp_slice = loader.load_data(direction="IMPORT", canonical_slice=True, exclude_wld=False)
    
    assert len(df_imp_full) == 48445, f"Expected 48,445 rows for full importer dataset, got {len(df_imp_full)}"
    assert len(df_imp_slice) == 31805, f"Expected 31,805 rows for 2010-2025 slice, got {len(df_imp_slice)}"

def test_product_resolution():
    """Tests resolution of numeric HS6, exact descriptions, and keyword search."""
    loader = PartnerDataLoader(data_dir="data")
    
    # Numeric code lookup
    res_num = loader.resolve_product(120999)
    assert res_num['status'] == 'exact_match'
    assert res_num['hs6'] == 120999
    
    # Keyword search for basil seeds
    res_kw = loader.resolve_product("basil seeds")
    assert res_kw['status'] in ['exact_match', 'ambiguous_match']
    assert res_kw['hs6'] == 120999
    assert "Seeds" in res_kw['product_description']

def test_feature_engineering_no_leakage():
    """Verifies feature transformations and temporal sequence generation."""
    loader = PartnerDataLoader(data_dir="data")
    df_exp = loader.load_data(direction="EXPORT", canonical_slice=False, exclude_wld=False)
    
    engineer = PartnerFeatureEngineer(sequence_length=5)
    df_feat = engineer.engineer_base_features(df_exp)
    
    assert 'log_export_value' in df_feat.columns
    assert 'trade_growth_yoy' in df_feat.columns
    assert 'cagr_3yr' in df_feat.columns
    
    seq_data = engineer.create_sequence_dataset(df_exp, split_train_end=2020, split_val_end=2022, split_test_end=2024)
    assert seq_data['train']['X'].shape[1] == 5
    assert seq_data['train']['X'].shape[2] == 12
    assert len(seq_data['test']['X']) > 0

def test_ranking_engine_properties():
    """Verifies opportunity score bounds [0, 100] and quantity fit behavior."""
    loader = PartnerDataLoader(data_dir="data")
    df_panel = loader.load_data(direction="EXPORT", canonical_slice=False, hs6=120999, exclude_wld=True)
    
    ranker = OpportunityRankingEngine()
    df_ranked = ranker.rank_destinations(df_panel, user_quantity_kg=1000.0)
    
    assert 'opportunity_score' in df_ranked.columns
    assert (df_ranked['opportunity_score'] >= 0.0).all()
    assert (df_ranked['opportunity_score'] <= 100.0).all()
    assert (df_ranked['quantity_fit_score'] >= 0.0).all()
    assert (df_ranked['quantity_fit_score'] <= 100.0).all()

def test_risk_monotonicity_constraint():
    """
    CRITICAL CONTRACT:
    1. final_score = opportunity_score - risk_penalty
    2. Increasing risk MUST strictly decrease final score.
    """
    risk_integrator = TradeRiskIntegrator()
    
    # Synthetic test data
    test_df = pd.DataFrame([
        {'importer_iso3': 'SAFE', 'opportunity_score': 85.0, 'sanctions_present': 0, 'ofac_entity_count': 0, 'scomet_match_flag': 0, 'destination_applied_tariff_rate': 0.0},
        {'importer_iso3': 'SANCTIONED', 'opportunity_score': 85.0, 'sanctions_present': 1, 'ofac_entity_count': 50, 'scomet_match_flag': 0, 'destination_applied_tariff_rate': 10.0}
    ])
    
    df_res = risk_integrator.compute_risk_penalties(test_df)
    
    # Check formula
    for _, row in df_res.iterrows():
        expected_final = max(0.0, row['opportunity_score'] - row['risk_penalty'])
        assert np.isclose(row['final_score'], expected_final), f"Expected final_score {expected_final}, got {row['final_score']}"
        
    # Check monotonicity
    safe_final = df_res[df_res['importer_iso3'] == 'SAFE']['final_score'].iloc[0]
    sanct_final = df_res[df_res['importer_iso3'] == 'SANCTIONED']['final_score'].iloc[0]
    assert safe_final > sanct_final, f"Safe corridor score ({safe_final}) must exceed sanctioned corridor score ({sanct_final})"

def test_end_to_end_basil_seeds_use_case():
    """Verifies end-to-end recommendation workflow for: 'I want to export 1,000 kg of basil seeds'."""
    res = recommend_destinations(
        product_query="I want to export 1,000 kg of basil seeds",
        requested_quantity_kg=1000.0,
        top_n=5,
        data_dir="data"
    )
    
    assert res['status'] == 'success'
    assert res['product_resolution']['hs6'] == 120999
    assert len(res['top_recommendations']) == 5
    
    top1 = res['top_recommendations'][0]
    assert 'destination' in top1
    assert 'forecast' in top1
    assert 'scores' in top1
    assert 'risk' in top1
    assert len(top1['pros']) > 0
    assert len(top1['cons']) > 0
    assert top1['forecast']['annual_market_demand_kg'] > 0
    assert top1['forecast']['expected_fob_price_usd_per_kg'] > 0


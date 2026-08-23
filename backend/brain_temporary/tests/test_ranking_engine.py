try:
    import pytest
except ImportError:
    pytest = None
import pandas as pd
import numpy as np
import os
import sys

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.ranking.product_resolver import ProductResolver, resolve_product
from src.ranking.feature_engineering import FeatureEngineer
from src.ranking.ranking_engine import DestinationRankingEngine, rank_export_destinations, DEFAULT_WEIGHTS
from src.ranking.ingestion import convert_raw_csv_to_parquet

if pytest is not None:
    @pytest.fixture(scope="session")
    def engine():
        return DestinationRankingEngine()


def test_parquet_file_exists():
    candidates = [
        "backend/brain/processed/01_partner_discovery_india_as_exporter.parquet",
        "data/processed/01_partner_discovery_india_as_exporter.parquet"
    ]
    assert any(os.path.exists(p) for p in candidates), "Processed Parquet file must exist."

def test_product_resolver_exact_hs6(engine):
    res = engine.resolver.resolve(100630)
    assert res['status'] == 'exact_match'
    assert res['hs6'] == 100630
    assert "rice" in res['product_description'].lower()

def test_product_resolver_text_query(engine):
    res = engine.resolver.resolve("Basmati Rice")
    assert res['hs6'] == 100630
    assert "rice" in res['product_description'].lower()

def test_product_resolver_pepper(engine):
    res = engine.resolver.resolve("Pepper")
    assert res['hs6'] == 90411

def test_weights_sum_to_one(engine):
    assert np.isclose(sum(engine.weights.values()), 1.0, atol=1e-5)

def test_invalid_weights_raises():
    bad_weights = {"demand": 0.5, "growth": 0.2}
    with pytest.raises(ValueError, match="Ranking weights must sum to 1.0"):
        DestinationRankingEngine(weights=bad_weights)

def test_wld_exclusion(engine):
    df = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=50)
    assert "WLD" not in df['iso3'].values, "WLD aggregate must be strictly excluded from rankings."
    assert not df.empty

def test_required_columns_present(engine):
    df = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=5)
    expected_cols = [
        'rank', 'country', 'iso3', 'hs6', 'product', 'final_score',
        'demand_score', 'growth_score', 'access_score', 'economic_score',
        'logistics_score', 'buyer_score', 'stability_score', 'risk_adjustment',
        'quantity_fit', 'recent_export_weight_kg', 'recent_export_value_usd',
        'tariff_rate', 'rta', 'risk_flag', 'reason_codes'
    ]
    for col in expected_cols:
        assert col in df.columns, f"Missing required column: {col}"

def test_deterministic_output(engine):
    df1 = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=5)
    df2 = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=5)
    pd.testing.assert_frame_equal(df1, df2)

def test_quantity_fit_modifier(engine):
    # Very small shipment (1,000 kg) vs massive shipment (500,000,000 kg)
    df_small = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=5)
    df_huge = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=500_000_000, top_n=5)
    
    assert (df_small['quantity_fit'] >= df_huge['quantity_fit']).all(), "Larger quantity strain must reduce quantity_fit score."

def test_score_bounds(engine):
    df = engine.rank_destinations(product_query="Basmati Rice", quantity_kg=1000, top_n=20)
    assert (df['final_score'] >= 0.0).all() and (df['final_score'] <= 100.0).all()
    assert (df['demand_score'] >= 0.0).all() and (df['demand_score'] <= 100.0).all()

"""
Automated Unit & Integration Test Suite — Trade Behaviour Risk & Anomaly Detection
Tests feature math, leakage prevention, preprocessor transformations, model loading,
inference execution, threshold policies, explainability, coverage validation, and FastAPI schemas.
"""

import os
import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

# Ensure root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.trade_anomaly.data_loader import (
    load_trade_anomaly_data,
    get_corridor_history,
    get_dataset_coverage,
    validate_and_convert_csv_to_parquet
)
from src.trade_anomaly.feature_pipeline import (
    compute_causal_features_for_df,
    create_chronological_splits,
    TradeAnomalyPreprocessor,
    CORE_NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)
from src.trade_anomaly.models import (
    IsolationForestAnomalyModel,
    XGBoostAnomalyModel,
    PyTorchMLPAutoencoder,
    PyTorchGRUAutoencoder,
    PyTorchTCNAutoencoder,
    PyTorchTransformerAutoencoder,
    build_corridor_sequences
)
from src.trade_anomaly.inference import TradeAnomalyInferenceService
from src.trade_anomaly.api import router, get_inference_service
from fastapi import FastAPI


@pytest.fixture(scope="session")
def raw_data():
    return load_trade_anomaly_data()


@pytest.fixture(scope="session")
def inference_service():
    return TradeAnomalyInferenceService()


@pytest.fixture(scope="session")
def api_client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


# ==========================================
# 1. DATA INGESTION & PARQUET TESTS
# ==========================================
def test_dataset_dimensions_and_integrity(raw_data):
    """Verifies that the ingested dataset matches the exact 12,288 row and 48 period specification."""
    assert len(raw_data) == 12288
    assert raw_data["period"].nunique() == 48
    assert raw_data["partner_iso3"].nunique() == 16
    assert raw_data["hs6"].nunique() == 8
    assert set(raw_data["trade_flow"].unique()) == {"Export", "Import"}
    assert raw_data["anomaly_flag"].sum() == 1145


def test_corridor_history_retrieval(raw_data):
    """Verifies that single-corridor filtering returns exactly 48 sorted monthly observations."""
    corridor = get_corridor_history(raw_data, partner_iso3="ARE", hs6=100630, trade_flow="Export")
    assert len(corridor) == 48
    assert (corridor["period"].diff().dropna() > 0).all()


# ==========================================
# 2. FEATURE ENGINEERING & LEAKAGE TESTS
# ==========================================
def test_causal_rolling_leakage_prevention(raw_data):
    """
    CRITICAL TEST: Ensures that rolling 3-month statistics at time t use strictly t-1, t-2, t-3
    and do NOT include the trade value at time t.
    """
    sample = raw_data[(raw_data["partner_iso3"] == "ARE") & (raw_data["hs6"] == 100630) & (raw_data["trade_flow"] == "Export")].sort_values("period").copy()
    featured = compute_causal_features_for_df(sample)
    
    # Check 4th month (index 3): rolling_mean_3m should equal mean of months 0, 1, 2
    expected_mean_idx3 = sample["trade_value_usd"].iloc[0:3].mean()
    actual_mean_idx3 = featured["rolling_mean_3m"].iloc[3]
    assert np.isclose(actual_mean_idx3, expected_mean_idx3, rtol=1e-4)
    
    # Check that trade_value_usd at index 3 does not affect rolling_mean_3m at index 3
    sample_mutated = sample.copy()
    sample_mutated.iloc[3, sample_mutated.columns.get_loc("trade_value_usd")] *= 100.0
    featured_mutated = compute_causal_features_for_df(sample_mutated)
    assert np.isclose(featured_mutated["rolling_mean_3m"].iloc[3], expected_mean_idx3, rtol=1e-4)


def test_mom_growth_math(raw_data):
    """Verifies that MoM growth calculation matches the exact mathematical definition."""
    sample = raw_data[(raw_data["partner_iso3"] == "USA") & (raw_data["hs6"] == 847130) & (raw_data["trade_flow"] == "Import")].sort_values("period").copy()
    featured = compute_causal_features_for_df(sample)
    
    v0 = sample["trade_value_usd"].iloc[0]
    v1 = sample["trade_value_usd"].iloc[1]
    expected_growth_1 = (v1 - v0) / v0
    assert np.isclose(featured["trade_growth_mom"].iloc[1], expected_growth_1, rtol=1e-4)


# ==========================================
# 3. PREPROCESSOR & SPLIT TESTS
# ==========================================
def test_preprocessor_train_only_fitting(raw_data):
    """Verifies that preprocessor transforms without data leakage and preserves dimension consistency."""
    featured = compute_causal_features_for_df(raw_data)
    train_df, val_df, test_df = create_chronological_splits(featured, train_end_period=202406, val_end_period=202412)
    
    preprocessor = TradeAnomalyPreprocessor(CORE_NUMERICAL_FEATURES, CATEGORICAL_FEATURES)
    preprocessor.fit(train_df)
    
    X_train = preprocessor.transform(train_df)
    X_val = preprocessor.transform(val_df)
    X_test = preprocessor.transform(test_df)
    
    assert X_train.shape[1] == X_val.shape[1] == X_test.shape[1]
    assert not np.isnan(X_train).any()
    assert not np.isnan(X_val).any()
    assert not np.isnan(X_test).any()


# ==========================================
# 4. MODEL LOADING & INFERENCE SERVICE TESTS
# ==========================================
def test_inference_service_valid_prediction(inference_service):
    """Verifies full inference pipeline on a standard valid trade observation."""
    res = inference_service.predict(
        trade_flow="Export",
        hs6=100630,
        partner_country="ARE",
        trade_value_usd=12000000.0,
        quantity=8000000.0,
        quantity_unit="kg",
        period="2025-12"
    )
    
    assert res["status"] == "OK"
    assert "risk" in res
    assert 0.0 <= res["risk"]["anomaly_score"] <= 1.0
    assert res["risk"]["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert res["classification"]["anomaly_type"] in ["NORMAL", "VOLUME_SURGE", "UNEXPECTED_COLLAPSE"]
    assert len(res["signals"]) > 0


def test_inference_service_volume_surge_detection(inference_service):
    """Verifies that an extreme 10x volume surge is flagged as an anomaly with appropriate reason codes."""
    res = inference_service.predict(
        trade_flow="Export",
        hs6=100630,
        partner_country="ARE",
        trade_value_usd=500000000.0, # Massive spike
        quantity=300000000.0,
        quantity_unit="kg",
        period="2025-12"
    )
    assert res["status"] == "OK"
    assert res["risk"]["is_anomaly"] is True
    assert res["classification"]["anomaly_type"] == "VOLUME_SURGE"
    signal_types = [s["signal"] for s in res["signals"]]
    assert any("SURGE" in s or "SPIKE" in s for s in signal_types)


def test_inference_service_insufficient_history(inference_service):
    """Verifies graceful rejection when historical corridor series has insufficient data."""
    res = inference_service.predict(
        trade_flow="Export",
        hs6=999999, # Unsupported HS6
        partner_country="XYZ", # Unsupported partner
        trade_value_usd=100000.0,
        quantity=50000.0
    )
    assert res["status"] == "INSUFFICIENT_HISTORICAL_CONTEXT"
    assert res["error_code"] == "INSUFFICIENT_HISTORY"


def test_inference_service_invalid_input_validation(inference_service):
    """Verifies error responses on negative values or invalid flows."""
    res_val = inference_service.predict(
        trade_flow="Export",
        hs6=100630,
        partner_country="ARE",
        trade_value_usd=-5000.0,
        quantity=100.0
    )
    assert res_val["status"] == "ERROR"
    assert res_val["error_code"] == "INVALID_TRADE_VALUE"
    
    res_flow = inference_service.predict(
        trade_flow="InvalidFlow",
        hs6=100630,
        partner_country="ARE",
        trade_value_usd=5000.0,
        quantity=100.0
    )
    assert res_flow["status"] == "ERROR"
    assert res_flow["error_code"] == "INVALID_TRADE_FLOW"


# ==========================================
# 5. FASTAPI MICROSERVICE ENDPOINT TESTS
# ==========================================
def test_api_health_endpoint(api_client):
    """Tests GET /api/trade-anomaly/health"""
    response = api_client.get("/api/trade-anomaly/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["model_loaded"] is True
    assert data["preprocessor_loaded"] is True


def test_api_coverage_endpoint(api_client):
    """Tests GET /api/trade-anomaly/coverage"""
    response = api_client.get("/api/trade-anomaly/coverage")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert len(data["coverage"]["partners"]) == 16
    assert len(data["coverage"]["hs6_codes"]) == 8


def test_api_predict_endpoint(api_client):
    """Tests POST /api/trade-anomaly/predict"""
    payload = {
        "trade_flow": "Export",
        "hs6": 100630,
        "partner_country": "ARE",
        "trade_value_usd": 85000000.0,
        "quantity": 14000000.0,
        "quantity_unit": "kg",
        "period": "2025-12",
        "transaction_count": 5
    }
    response = api_client.post("/api/trade-anomaly/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "risk" in data
    assert "signals" in data

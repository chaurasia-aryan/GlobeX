import pytest
from src.services.market_opportunity_synthesizer import (
    synthesize_market_pros_cons,
    _fallback_deterministic_synthesis,
    MarketSynthesisResult
)

def test_deterministic_market_synthesis():
    data = {
        "destination": {"country_name": "United Arab Emirates", "iso3": "ARE"},
        "product": {"description": "Basmati Rice"},
        "forecast": {"annual_market_demand_kg": 29000000, "expected_fob_price_usd_per_kg": 1.45},
        "scores": {"final_score": 88.5, "score_trade_access": 90, "score_logistics": 85},
        "risk": {"risk_level": "LOW", "sanctions_active": False, "ofac_count": 0},
        "pros": ["Duty-Free Preferential Access under CEPA."],
        "cons": []
    }
    
    res = _fallback_deterministic_synthesis(data)
    assert isinstance(res, MarketSynthesisResult)
    assert len(res.structured_pros) > 0
    assert len(res.structured_cons) > 0
    assert "United Arab Emirates" in res.executive_summary
    assert res.structured_pros[0].category in ["DEMAND", "TARIFF", "LOGISTICS", "MARKET"]
    assert res.structured_cons[0].severity in ["HIGH", "MEDIUM", "LOW"]
    assert res.negotiation_leverage != ""

def test_synthesize_market_pros_cons_wrapper():
    data = {
        "destination": {"country_name": "United States", "iso3": "USA"},
        "product": {"description": "Organic Black Pepper"},
        "forecast": {"annual_market_demand_kg": 15000000, "expected_fob_price_usd_per_kg": 3.80},
        "scores": {"final_score": 84.0, "score_trade_access": 65, "score_logistics": 95},
        "risk": {"risk_level": "LOW", "sanctions_active": False, "ofac_count": 0},
        "pros": ["High maritime freight connectivity with 44 major container ports."],
        "cons": []
    }
    
    res = synthesize_market_pros_cons(data)
    assert isinstance(res, MarketSynthesisResult)
    assert res.executive_summary != ""
    assert len(res.structured_pros) >= 1

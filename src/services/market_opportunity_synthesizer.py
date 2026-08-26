"""
GlobeXAI Trade OS — LLM Strategic Synthesizer for Market Opportunity & Pros/Cons.

Structures raw quantitative trade signals, SHAP contributions, tariff advantages,
and risk indicators into actionable executive Pros, Cons, and Strategic Verdicts.
Uses local Ollama LLM if available, with a deterministic fallback engine
to guarantee structured JSON outputs at all times.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from src.services.llm_client import generate

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Chief Global Trade Strategist and Economist for GlobeXAI OS.
Your task is to analyze trade metrics, SHAP demand model attributions, tariff preferences, and compliance flags for a destination export corridor from India.
Return a STRICT valid JSON object with executive structured pros, cons, executive verdict, and negotiation leverage.

Required JSON Schema:
{
  "executive_summary": "2-sentence strategic verdict on corridor commercial viability and absorption.",
  "structured_pros": [
    {
      "category": "DEMAND" | "TARIFF" | "LOGISTICS" | "MARKET",
      "title": "Short punchy pro title (e.g. 0% CEPA Duty-Free Access)",
      "description": "Clear rationale based on the numbers and trade agreements.",
      "impact_score": 85
    }
  ],
  "structured_cons": [
    {
      "category": "REGULATORY" | "SANCTIONS" | "PRICE" | "VOLATILITY",
      "title": "Short punchy barrier title (e.g. High Import Tariff Barrier)",
      "description": "Specific friction or compliance risk identified.",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "mitigation": "Tactical exporter mitigation strategy."
    }
  ],
  "negotiation_leverage": "Key commercial leverage point when negotiating FOB/CIF contracts with buyers here."
}
Only output the raw JSON string. Do not include markdown code block backticks."""


class StructuredPro(BaseModel):
    category: str = Field(..., description="DEMAND | TARIFF | LOGISTICS | MARKET")
    title: str
    description: str
    impact_score: Optional[int] = 80


class StructuredCon(BaseModel):
    category: str = Field(..., description="REGULATORY | SANCTIONS | PRICE | VOLATILITY")
    title: str
    description: str
    severity: str = Field(..., description="HIGH | MEDIUM | LOW")
    mitigation: Optional[str] = None


class MarketSynthesisResult(BaseModel):
    model_config = {"protected_namespaces": ()}
    executive_summary: str
    structured_pros: List[StructuredPro]
    structured_cons: List[StructuredCon]
    negotiation_leverage: str
    synthesized_by_llm: bool = True
    model_used: Optional[str] = "gemma2:2b"
    error: Optional[str] = None


def _fallback_deterministic_synthesis(data: Dict[str, Any]) -> MarketSynthesisResult:
    """Deterministic, high-fidelity structuring engine when LLM is offline."""
    dest = data.get("destination", {})
    country_name = dest.get("country_name", "the destination country")
    iso3 = dest.get("iso3", "GLOBAL")
    
    prod = data.get("product", {})
    prod_desc = prod.get("description", "Commodity")
    
    fc = data.get("forecast", {})
    demand_kg = fc.get("annual_market_demand_kg", 0)
    fob_price = fc.get("expected_fob_price_usd_per_kg", 0.0)
    demand_mt = round(demand_kg / 1000)
    
    scores = data.get("scores", {})
    final_score = scores.get("final_score", 75.0)
    trade_access = scores.get("score_trade_access", 60.0)
    logistics = scores.get("score_logistics", 60.0)
    
    risk = data.get("risk", {})
    sanctions = risk.get("sanctions_active", False)
    ofac = risk.get("ofac_count", 0)
    risk_level = risk.get("risk_level", "LOW")
    
    raw_pros = data.get("pros", [])
    raw_cons = data.get("cons", [])
    
    # 1. Structure Pros
    structured_pros: List[StructuredPro] = []
    
    # Demand pro
    if demand_mt > 500:
        structured_pros.append(StructuredPro(
            category="DEMAND",
            title=f"Robust Market Absorption ({demand_mt:,} MT/year)",
            description=f"India has demonstrated consistent export volume with {country_name} absorbing ~{demand_mt:,} MT annually.",
            impact_score=min(98, int(scores.get("score_forecast_demand", 80)))
        ))
    
    # Tariff / Trade access pro
    if trade_access >= 70:
        structured_pros.append(StructuredPro(
            category="TARIFF",
            title="Preferential Treaty Tariff Advantage",
            description=f"Enjoy favorable tariff access and bilateral customs facilitation into {country_name}.",
            impact_score=int(trade_access)
        ))
    else:
        structured_pros.append(StructuredPro(
            category="MARKET",
            title=f"Stable Pricing Anchor (${fob_price:.2f}/kg FOB)",
            description=f"Consistent benchmark pricing provides dependable revenue modeling for Indian exporters.",
            impact_score=75
        ))
        
    # Logistics pro
    if logistics >= 65:
        structured_pros.append(StructuredPro(
            category="LOGISTICS",
            title="Dense Maritime Freight Connectivity",
            description=f"Direct maritime liner routes and established container port turnaround to {iso3}.",
            impact_score=int(logistics)
        ))
        
    # Incorporate any specific raw pros
    for p in raw_pros:
        if "Duty-Free" in p or "preferential" in p.lower() or "margin" in p.lower():
            structured_pros.append(StructuredPro(
                category="TARIFF",
                title="Bilateral Duty Concession / CEPA Protection",
                description=p,
                impact_score=92
            ))
            break
        elif "SHAP" in p or "pushed the demand" in p:
            clean_shap = p.split("(")[0].replace("Model attribution:", "").strip()
            structured_pros.append(StructuredPro(
                category="DEMAND",
                title="Predictive Demand Momentum Driver",
                description=clean_shap,
                impact_score=88
            ))
            break

    # 2. Structure Cons
    structured_cons: List[StructuredCon] = []
    
    if sanctions:
        structured_cons.append(StructuredCon(
            category="SANCTIONS",
            title="Active Sanctions & Compliance Screening",
            description=f"{country_name} is subject to active trade controls or sanctions vigilance.",
            severity="HIGH",
            mitigation="Perform end-to-end OFAC/EU SDN counterparty screening and secure Bank KYC approval prior to shipment."
        ))
    elif ofac > 0:
        structured_cons.append(StructuredCon(
            category="SANCTIONS",
            title=f"OFAC SDN Entity Exposure ({ofac} Listed)",
            description=f"Presence of designated counterparties requires strict intermediary screening.",
            severity="MEDIUM",
            mitigation="Screen consignees and freight forwarders against DGFT and OFAC restricted party lists."
        ))
        
    if trade_access < 50:
        structured_cons.append(StructuredCon(
            category="REGULATORY",
            title="Non-Preferential Customs Duties & Tariffs",
            description="Higher MFN applied customs duties compared to trade treaty partners.",
            severity="MEDIUM",
            mitigation="Factor tariff costs into CIF pricing quotes or explore bonded warehouse transit."
        ))
        
    for c in raw_cons:
        if "SCOMET" in c:
            structured_cons.append(StructuredCon(
                category="REGULATORY",
                title="SCOMET Dual-Use Authorization Required",
                description=c,
                severity="HIGH",
                mitigation="Submit DGFT online authorization filing 30 days prior to customs dispatch."
            ))
            break
        elif "pulled the demand" in c:
            clean_shap = c.split("(")[0].replace("Model attribution:", "").strip()
            structured_cons.append(StructuredCon(
                category="VOLATILITY",
                title="Demand Contraction Signal",
                description=clean_shap,
                severity="LOW",
                mitigation="Stagger order commitments across quarterly tranches."
            ))
            break

    if not structured_cons:
        structured_cons.append(StructuredCon(
            category="VOLATILITY",
            title="Currency & Freight Rate Volatility",
            description="Standard exposure to global ocean container freight rate swings and FX settlement fluctuations.",
            severity="LOW",
            mitigation="Structure contracts with forward FX hedging or USD-denominated Irrevocable Letters of Credit (LC)."
        ))

    # Executive Verdict & Leverage
    summary = (
        f"{country_name} ranks #{data.get('final_rank', 1)} with an Opportunity Score of {final_score:.1f}/100. "
        f"It offers an estimated annual market absorption of {demand_mt:,} MT at a benchmark FOB rate of ${fob_price:.2f}/kg, "
        f"making it a prime corridor for Indian {prod_desc} exports."
    )
    
    leverage = (
        f"Leverage India's agricultural supply reliability and quote on FOB Nhava Sheva/Mundra terms. "
        f"For contracts over 50 MT, request 30% advance with balance against Bill of Lading copy."
    )
    
    return MarketSynthesisResult(
        executive_summary=summary,
        structured_pros=structured_pros[:4],
        structured_cons=structured_cons[:3],
        negotiation_leverage=leverage,
        synthesized_by_llm=False,
        model_used="GlobeX-Deterministic-Strategist-v1"
    )


def synthesize_market_pros_cons(insight_data: Dict[str, Any]) -> MarketSynthesisResult:
    """
    Synthesizes executive structured pros and cons for a market opportunity corridor.
    Tries Ollama LLM first; falls back gracefully to deterministic structuring.
    """
    dest = insight_data.get("destination", {})
    country_name = dest.get("country_name", "the destination")
    iso3 = dest.get("iso3", "")
    prod = insight_data.get("product", {})
    prod_name = prod.get("description", "Commodity")
    fc = insight_data.get("forecast", {})
    scores = insight_data.get("scores", {})
    risk = insight_data.get("risk", {})
    raw_pros = insight_data.get("pros", [])
    raw_cons = insight_data.get("cons", [])

    prompt_payload = {
        "destination_country": f"{country_name} ({iso3})",
        "commodity": prod_name,
        "annual_forecast_demand_mt": round(fc.get("annual_market_demand_kg", 0) / 1000),
        "expected_fob_price_usd_kg": fc.get("expected_fob_price_usd_per_kg", 0),
        "composite_opportunity_score": scores.get("final_score", 80),
        "tariff_access_score": scores.get("score_trade_access", 60),
        "logistics_score": scores.get("score_logistics", 60),
        "risk_level": risk.get("risk_level", "LOW"),
        "sanctions_active": risk.get("sanctions_active", False),
        "ofac_count": risk.get("ofac_count", 0),
        "model_signals": raw_pros + raw_cons
    }

    user_prompt = f"Analyze this export opportunity corridor and generate the structured JSON dossier:\n{json.dumps(prompt_payload, indent=2)}"

    try:
        res = generate(user_prompt, system=SYSTEM_PROMPT, timeout_s=2.0)
        if res.available and res.text:
            cleaned_text = res.text.strip()
            # Strip backticks if LLM included them
            if cleaned_text.startswith("```"):
                cleaned_text = re.sub(r"^```(?:json)?\n?", "", cleaned_text)
                cleaned_text = re.sub(r"\n?```$", "", cleaned_text)
            parsed = json.loads(cleaned_text)
            
            structured_pros = [StructuredPro(**p) for p in parsed.get("structured_pros", [])]
            structured_cons = [StructuredCon(**c) for c in parsed.get("structured_cons", [])]
            
            if structured_pros or structured_cons:
                return MarketSynthesisResult(
                    executive_summary=parsed.get("executive_summary", ""),
                    structured_pros=structured_pros,
                    structured_cons=structured_cons,
                    negotiation_leverage=parsed.get("negotiation_leverage", ""),
                    synthesized_by_llm=True,
                    model_used=res.model
                )
    except Exception as exc:
        logger.info("Ollama LLM synthesis bypassed (%s); falling back to deterministic structuring.", exc)

    return _fallback_deterministic_synthesis(insight_data)

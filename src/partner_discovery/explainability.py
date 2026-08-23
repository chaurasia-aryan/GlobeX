import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

def generate_country_insights(country_row: pd.Series, requested_quantity_kg: Optional[float] = None) -> Dict[str, Any]:
    """
    Generates structured, human-interpretable evidence, pros, cons, and score breakdowns
    for a specific destination country corridor.
    """
    row = country_row.to_dict()
    iso3 = row.get('importer_iso3', row.get('exporter_iso3', 'UNKNOWN'))
    country_name = row.get('importer_country_name', row.get('exporter_country_name', iso3))
    hs6 = row.get('hs6', 0)
    product_desc = row.get('product_description', '')
    
    # Financial & Demand Forecast
    fc_demand = float(row.get('forecast_demand_kg', row.get('export_net_weight_kg', 0.0)))
    fc_price = float(row.get('forecast_fob_price', row.get('fob_unit_value_usd_per_kg', 0.0)))
    user_qty = float(requested_quantity_kg) if requested_quantity_kg is not None and requested_quantity_kg > 0 else fc_demand
    est_shipment_revenue = user_qty * fc_price
    
    # Pros & Cons generation
    pros = []
    cons = []
    
    # RTA & Tariffs
    tariff = float(row.get('destination_applied_tariff_rate', 0.0))
    rta_exists = int(row.get('rta_exists', 0))
    rta_name = str(row.get('rta_name', 'None'))
    pref_margin = float(row.get('tariff_preference_margin', 0.0))
    
    if rta_exists == 1 and tariff == 0.0:
        pros.append(f"Duty-Free Preferential Access (0.0% tariff) under {rta_name}.")
    elif tariff < 5.0:
        pros.append(f"Low applied tariff rate of {tariff:.1f}%.")
    else:
        cons.append(f"Applied tariff barrier of {tariff:.1f}% on import.")
        
    if pref_margin > 0:
        pros.append(f"Tariff preference margin of {pref_margin:.1f}% over non-FTA competitors.")
        
    # Demand & Growth Momentum
    growth = float(row.get('trade_growth_yoy', 0.0)) * 100.0
    cagr = float(row.get('cagr_3yr', 0.0)) * 100.0
    mkt_share = float(row.get('destination_market_share_pct', row.get('destination_market_share', 0.0)))
    
    if mkt_share > 10.0:
        pros.append(f"Major established export destination for India ({mkt_share:.1f}% national export share).")
    if growth > 5.0:
        pros.append(f"Accelerating YoY export volume growth (+{growth:.1f}% YoY).")
    elif growth < -5.0:
        cons.append(f"Recent trade volume deceleration ({growth:.1f}% YoY).")
        
    # Logistics & Ecosystem
    locodes = int(row.get('destination_locode_count', 0))
    ports = int(row.get('destination_port_count', 0))
    buyers = int(row.get('gleif_active_buyer_count', 0))
    
    if ports >= 10:
        pros.append(f"High maritime freight connectivity with {ports} major container ports ({locodes} LOCODE hubs).")
    if buyers >= 50:
        pros.append(f"Established B2B buyer network ({buyers} active verified GLEIF corporate buyers).")
        
    # Risk Assessment
    sanctions = int(row.get('sanctions_present', 0))
    ofac_cnt = int(row.get('ofac_entity_count', 0))
    scomet_match = int(row.get('scomet_match_flag', 0))
    
    if sanctions > 0:
        cons.append("Subject to active international sanctions / trade restrictions.")
    if ofac_cnt > 0:
        cons.append(f"Heightened compliance exposure ({ofac_cnt} OFAC SDN entities registered).")
    if scomet_match > 0:
        cons.append("SCOMET dual-use strategic item requiring DGFT export authorization.")
        
    if not cons:
        cons.append("Standard international logistics and exchange rate fluctuations.")
        
    # Score Breakdown Dict
    scores = {
        'final_score': float(row.get('final_score', 0.0)),
        'opportunity_score': float(row.get('opportunity_score', 0.0)),
        'risk_penalty': float(row.get('risk_penalty', 0.0)),
        'quantity_fit_score': float(row.get('quantity_fit_score', 100.0)),
        'score_revealed_demand': float(row.get('score_revealed_demand', 0.0)),
        'score_forecast_demand': float(row.get('score_forecast_demand', 0.0)),
        'score_growth_momentum': float(row.get('score_growth_momentum', 0.0)),
        'score_trade_access': float(row.get('score_trade_access', 0.0)),
        'score_economic_capacity': float(row.get('score_economic_capacity', 0.0)),
        'score_forecast_price': float(row.get('score_forecast_price', 0.0)),
        'score_logistics': float(row.get('score_logistics', 0.0)),
        'score_buyer_ecosystem': float(row.get('score_buyer_ecosystem', 0.0)),
        'score_stability': float(row.get('score_stability', 0.0))
    }
    
    return {
        'destination': {
            'iso3': iso3,
            'country_name': country_name,
            'region': row.get('region_name', ''),
            'sub_region': row.get('sub_region_name', ''),
            'currency': row.get('currency_code', 'USD')
        },
        'product': {
            'hs6': hs6,
            'description': product_desc
        },
        'forecast': {
            'annual_market_demand_kg': round(fc_demand, 1),
            'expected_fob_price_usd_per_kg': round(fc_price, 2),
            'user_shipment_quantity_kg': round(user_qty, 1),
            'estimated_shipment_revenue_usd': round(est_shipment_revenue, 2)
        },
        'risk': {
            'risk_level': row.get('risk_level', 'LOW'),
            'risk_penalty_points': float(row.get('risk_penalty', 0.0)),
            'risk_flags': row.get('risk_flags', 'COMPLIANT_CLEAR'),
            'sanctions_active': bool(sanctions > 0),
            'ofac_count': ofac_cnt,
            'scomet_controlled': bool(scomet_match > 0)
        },
        'scores': scores,
        'pros': pros,
        'cons': cons
    }


import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Union

from .data import PartnerDataLoader
from .features import PartnerFeatureEngineer
from .forecasting import PartnerForecastingPipeline
from .ranking import OpportunityRankingEngine
from .risk_integration import TradeRiskIntegrator
from .explainability import generate_country_insights

def recommend_destinations(
    product_query: Union[str, int],
    requested_quantity_kg: Optional[float] = None,
    top_n: int = 10,
    regime: str = "balanced",
    data_dir: Optional[str] = None,
    model_dir: str = "models/partner_forecasting"
) -> Dict[str, Any]:
    """
    End-to-End Partner Discovery, Forecasting, and Risk-Adjusted Recommendation Engine.
    
    Example:
        recommend_destinations("basil seeds", requested_quantity_kg=1000.0, top_n=5)
    """
    # 1. Product Resolution
    loader = PartnerDataLoader(data_dir=data_dir)
    res = loader.resolve_product(product_query)
    
    if res['status'] == 'not_found' or res['hs6'] is None:
        return {
            'status': 'error',
            'message': f"Product '{product_query}' could not be resolved to a known HS6 product.",
            'product_resolution': res,
            'recommendations': []
        }
        
    hs6 = res['hs6']
    product_desc = res['product_description']
    
    # 2. Load panel trade dataset for HS6
    df_panel = loader.load_data(direction="EXPORT", canonical_slice=False, hs6=hs6, exclude_wld=True)
    if df_panel.empty:
        return {
            'status': 'error',
            'message': f"No export history found for HS6 {hs6}.",
            'product_resolution': res,
            'recommendations': []
        }
        
    # 3. Forecast generation (using GRU model if saved, else rolling baseline)
    engineer = PartnerFeatureEngineer(sequence_length=5)
    df_feat = engineer.engineer_base_features(df_panel)
    
    latest_year = df_feat['year'].max()
    corridors = df_feat['importer_iso3'].unique()
    
    forecast_rows = []
    
    # Attempt to load GRU pipeline
    gru_pipeline = None
    if os.path.exists(os.path.join(model_dir, "gru_multi_output.pt")):
        try:
            gru_pipeline = PartnerForecastingPipeline(input_dim=len(engineer.feature_columns), hidden_dim=64, num_layers=2)
            gru_pipeline.load(model_dir)
        except Exception:
            gru_pipeline = None
            
    for c_iso3 in corridors:
        sub = df_feat[df_feat['importer_iso3'] == c_iso3].sort_values('year')
        
        # Historical metrics for this specific HS commodity in this destination corridor
        recent_d = sub['export_net_weight_kg'].values[-3:]
        recent_p = sub['fob_unit_value_usd_per_kg'].values[-3:]
        hist_avg_d = float(np.mean(recent_d)) if len(recent_d) > 0 else 50000.0
        hist_avg_p = float(np.median(recent_p)) if len(recent_p) > 0 else 2.50
        
        if len(sub) >= 5 and gru_pipeline is not None:
            seq_x = sub[engineer.feature_columns].values[-5:]
            inp = np.expand_dims(seq_x, axis=0)
            pred_d, pred_p = gru_pipeline.predict(inp)
            fc_d = float(pred_d[0])
            fc_p = float(pred_p[0])
            
            # Ground GRU price to historical corridor trade value when model output is uncalibrated (< $0.10)
            if fc_p < 0.10 or fc_p > 100000.0 or np.isnan(fc_p):
                fc_p = hist_avg_p
                
            # Ground demand forecast to reasonable momentum bounds of historical volume for this HS product
            if fc_d < 100.0 or fc_d > hist_avg_d * 50.0 or np.isnan(fc_d):
                fc_d = hist_avg_d * 1.05
        else:
            # Fallback momentum forecast for this specific HS product
            fc_d = hist_avg_d * 1.05
            fc_p = hist_avg_p
            
        forecast_rows.append({
            'importer_iso3': c_iso3,
            'hs6': hs6,
            'forecast_demand_kg': round(fc_d, 1),
            'forecast_fob_price': round(fc_p, 2)
        })
        
    df_forecast = pd.DataFrame(forecast_rows)
    
    # 4. Multi-Criteria Opportunity Ranking with Quantity-Fit
    ranker = OpportunityRankingEngine()
    df_ranked = ranker.rank_destinations(
        panel_df=df_panel,
        forecast_df=df_forecast,
        user_quantity_kg=requested_quantity_kg,
        regime=regime
    )
    
    # 5. Risk and Compliance Integration (Strict constraint: final_score = opp_score - risk_penalty)
    risk_integrator = TradeRiskIntegrator()
    df_final = risk_integrator.compute_risk_penalties(df_ranked)
    
    # Sort strictly by final_score descending
    df_final = df_final.sort_values('final_score', ascending=False).reset_index(drop=True)
    df_final['final_rank'] = range(1, len(df_final) + 1)
    
    # 6. Format Top-N Recommendations with Explainability
    top_df = df_final.head(top_n).copy()
    
    recommendations = []
    for _, r in top_df.iterrows():
        insights = generate_country_insights(r, requested_quantity_kg=requested_quantity_kg)
        recommendations.append(insights)
        
    return {
        'status': 'success',
        'product_resolution': res,
        'requested_quantity_kg': requested_quantity_kg,
        'regime': regime,
        'total_candidates_evaluated': len(df_final),
        'top_recommendations': recommendations,
        'summary_table': top_df[[
            'final_rank', 'importer_iso3', 'importer_country_name', 'final_score',
            'opportunity_score', 'risk_penalty', 'risk_level', 'forecast_demand_kg',
            'forecast_fob_price', 'destination_applied_tariff_rate', 'rta_name'
        ]].to_dict('records')
    }


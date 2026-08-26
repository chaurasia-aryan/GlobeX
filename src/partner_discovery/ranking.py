import json
import logging
import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

_RANKING_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "backend", "brain", "models", "destination_ranking", "ranking_config.json",
)


def _load_config_weights() -> Optional[Dict[str, float]]:
    """
    Loads `ranking_config.json`'s weights, mapping its dimension names onto
    `OpportunityRankingEngine`'s weight keys. The config has one 'demand'
    dimension; the engine scores revealed (historical) and forecast
    (forward-looking) demand separately, so the config's demand weight is
    split evenly between them rather than silently dropping one half.
    Returns None (never a guessed/partial dict) if the config is missing or
    malformed — callers must fall back to DEFAULT_WEIGHTS, not half-apply this.
    """
    try:
        with open(_RANKING_CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        w = config["weights"]
        demand_half = w["demand"] / 2
        return {
            "revealed_demand": demand_half,
            "forecast_demand": demand_half,
            "trade_access": w["access"],
            "economic_capacity": w["economic_capacity"],
            "growth_momentum": w["growth"],
            "logistics": w["logistics"],
        }
    except (OSError, KeyError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("OpportunityRankingEngine: could not load %s (%s) — using DEFAULT_WEIGHTS.", _RANKING_CONFIG_PATH, exc)
        return None


_MARKET_SHARE_FACTS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "backend", "brain", "datasets", "final", "compliance_data", "current_facts", "destination_market_share.json",
)


def _load_market_share_corrections() -> Dict[Any, float]:
    """
    Loads verified official export-value corrections (APEDA, Tea Board, etc.)
    keyed by (hs6, destination_iso3) -> estimated_export_value_usd. Built
    because a direct check against official government statistics found the
    training panel systematically undercounts Gulf-state trade for several
    corridors (e.g. Saudi Arabia's real basmati-rice share implies ~$986M,
    the panel records ~$4.4M for the same corridor — see
    destination_market_share.json's own 'warning' field for the full context).

    Returns an empty dict (never a guess) if the facts file is missing.
    """
    try:
        with open(_MARKET_SHARE_FACTS_PATH, "r", encoding="utf-8") as f:
            doc = json.load(f)
        corrections: Dict[Any, float] = {}
        for fact in doc.get("facts", []):
            hs6 = fact.get("hs6")
            dest = fact.get("destination")
            value = (fact.get("value") or {}).get("estimated_export_value_usd")
            if hs6 is not None and dest and value is not None:
                corrections[(int(hs6), dest)] = float(value)
        return corrections
    except (OSError, KeyError, ValueError, TypeError, json.JSONDecodeError) as exc:
        logger.warning("OpportunityRankingEngine: could not load %s (%s) — no market-share corrections applied.", _MARKET_SHARE_FACTS_PATH, exc)
        return {}


def _minmax_score(values: np.ndarray) -> np.ndarray:
    """Computes min-max normalized scores mapped strictly to [0.0, 100.0]."""
    if len(values) == 0:
        return np.array([])
    min_v, max_v = np.nanmin(values), np.nanmax(values)
    if max_v <= min_v or np.isnan(min_v) or np.isnan(max_v):
        return np.full(len(values), 50.0)
    scores = ((values - min_v) / (max_v - min_v)) * 100.0
    return np.nan_to_num(scores, nan=50.0)

class OpportunityRankingEngine:
    """
    Computes multi-dimensional market opportunity scores for destination corridors.
    Combines revealed trade absorption, forecasted demand, tariff & RTA preferences,
    macroeconomic capacity, logistics, buyer density, and user shipment quantity-fit.
    """
    # Fallback only, used when ranking_config.json can't be loaded (see
    # _load_config_weights). Kept in sync with that config's validated
    # weights (ranking_bias_diagnosis.ipynb) rather than the old
    # revealed_demand=0.35/forecast_demand=0.25 scheme, which put 75% of the
    # score on existing-market-size signals and mechanically always ranked
    # the same large economies on top regardless of product.
    DEFAULT_WEIGHTS = {
        'revealed_demand': 0.1765,
        'forecast_demand': 0.1765,
        'trade_access': 0.1765,
        'economic_capacity': 0.1176,
        'growth_momentum': 0.2353,
        'logistics': 0.1176
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        if weights is not None:
            self.weights = weights
        else:
            # Config-driven weights (backend/brain/models/destination_ranking/
            # ranking_config.json) take priority over the hardcoded fallback —
            # see ranking_bias_diagnosis.ipynb for why: the hardcoded defaults
            # put 75% of the score on existing-market-size signals, mechanically
            # reproducing the same large-economy countries on every query.
            self.weights = _load_config_weights() or self.DEFAULT_WEIGHTS.copy()

        # Ensure normalized weights sum to 1.0
        total_w = sum(self.weights.values())
        self.weights = {k: v / total_w for k, v in self.weights.items()}

    def compute_quantity_fit_score(self, user_quantity_kg: float, partner_trade_volume_kg: np.ndarray) -> np.ndarray:
        """
        Evaluates how well the user requested shipment volume matches each destination's annual market capacity.
        Returns a score in [0.0, 100.0].
        """
        if user_quantity_kg <= 0:
            return np.full(len(partner_trade_volume_kg), 100.0)
            
        user_log = np.log10(max(1.0, user_quantity_kg))
        market_log = np.log10(np.maximum(1.0, partner_trade_volume_kg))
        
        diff = market_log - user_log
        fit_scores = np.where(
            diff >= 1.0,
            np.minimum(100.0, 80.0 + 20.0 * (1.0 / (1.0 + np.exp(-(diff - 2.0))))),
            np.maximum(10.0, 80.0 - 35.0 * (1.0 - diff))
        )
        return np.clip(fit_scores, 0.0, 100.0)

    @staticmethod
    def _compute_corridor_cagr(df: pd.DataFrame, partner_col: str, years: int = 3, value_col: str = 'export_value_usd') -> pd.DataFrame:
        """
        Real 3-year CAGR of this specific product's export value, per
        destination corridor — computed from the panel's own year-over-year
        history, not a country-level macro constant. `destination_gdp_growth`
        is identical for every product a country imports (confirmed: 7
        countries tied at exactly 4.76%), so weighting "growth" heavily while
        silently falling back to it just picks whichever country has the
        highest overall GDP growth for every single product. This computes
        the thing the weight is actually supposed to measure.

        Returns NaN (never a guessed/defaulted number) for corridors with
        fewer than `years`+1 years of history or a zero/missing start value —
        `_minmax_score` treats NaN as neutral (50), not a penalty.
        """
        max_year = df['year'].max()
        start_year = max_year - years
        end_vals = df[df['year'] == max_year].groupby(partner_col)[value_col].sum()
        start_vals = df[df['year'] == start_year].groupby(partner_col)[value_col].sum()

        cagr = {}
        for country in end_vals.index:
            start_v = start_vals.get(country)
            end_v = end_vals.get(country)
            if start_v is None or end_v is None or start_v <= 0:
                cagr[country] = np.nan
            else:
                cagr[country] = (end_v / start_v) ** (1.0 / years) - 1.0
        return pd.Series(cagr, name='cagr_3yr')

    def rank_destinations(
        self,
        panel_df: pd.DataFrame,
        forecast_df: Optional[pd.DataFrame] = None,
        user_quantity_kg: Optional[float] = None,
        regime: str = "balanced"
    ) -> pd.DataFrame:
        """
        Computes opportunity scores and rankings for candidate destinations.
        """
        df = panel_df.copy()
        partner_col = 'importer_iso3' if 'importer_iso3' in df.columns else 'exporter_iso3'

        # Real per-corridor growth, computed from this product's own history —
        # see _compute_corridor_cagr for why this must not fall back to a
        # country-level macro constant.
        corridor_cagr = self._compute_corridor_cagr(df, partner_col)

        # Filter latest context year (2025)
        max_year = df['year'].max()
        latest = df[df['year'] == max_year].copy()

        if latest.empty:
            latest = df.sort_values('year').groupby([partner_col, 'hs6']).last().reset_index()

        latest = latest.merge(
            corridor_cagr.rename('cagr_3yr').rename_axis(partner_col).reset_index(),
            on=partner_col, how='left',
        )

        # Deduplicate per country corridor taking top trade value record
        latest = latest.sort_values('export_value_usd', ascending=False).groupby([partner_col, 'hs6'], as_index=False).first()
            
        # Merge forecast values if available
        if forecast_df is not None and not forecast_df.empty:
            merge_keys = [partner_col, 'hs6'] if 'hs6' in forecast_df.columns else [partner_col]
            latest = latest.merge(forecast_df, on=merge_keys, how='left', suffixes=('', '_pred'))
            if 'forecast_demand_kg' not in latest.columns and 'export_net_weight_kg_pred' in latest.columns:
                latest['forecast_demand_kg'] = latest['export_net_weight_kg_pred']
            if 'forecast_fob_price' not in latest.columns and 'fob_unit_value_usd_per_kg_pred' in latest.columns:
                latest['forecast_fob_price'] = latest['fob_unit_value_usd_per_kg_pred']
        else:
            latest['forecast_demand_kg'] = latest['export_net_weight_kg'] * 1.05
            latest['forecast_fob_price'] = latest['fob_unit_value_usd_per_kg']
            
        # Apply verified official corrections (APEDA, Tea Board, ...) where the
        # panel's raw export_value_usd is confirmed to undercount a corridor —
        # see _load_market_share_corrections. Only raises the value when the
        # verified figure is higher; never lowers a corridor below what the
        # panel already shows.
        market_corrections = _load_market_share_corrections()
        if market_corrections:
            corrected_value = latest['export_value_usd'].copy()
            for idx, row in latest.iterrows():
                key = (int(row['hs6']), row[partner_col])
                verified = market_corrections.get(key)
                if verified is not None and verified > corrected_value.loc[idx]:
                    corrected_value.loc[idx] = verified
            latest['export_value_usd_corrected'] = corrected_value

            # The ML forecaster's own training history is the same
            # undercounted panel, so forecast_demand_kg inherits the same
            # bias for these corridors (confirmed: Saudi Arabia's revealed
            # demand corrects to the max score, but its forecast score stays
            # near the bottom because the model was trained on ~$4.4M of
            # history, not the real ~$986M). Approximate a corrected weight
            # from the corridor's own (realistic — unit prices for corrected
            # and uncorrected corridors are within the same $1.9-2.2/kg band)
            # unit price, rather than trusting an ML prediction trained on
            # bad history. Labelled as an approximation, not treated as a
            # replacement for retraining the forecaster on corrected data.
            corrected_forecast = latest['forecast_demand_kg'].copy()
            for idx, row in latest.iterrows():
                key = (int(row['hs6']), row[partner_col])
                verified = market_corrections.get(key)
                unit_price = row.get('fob_unit_value_usd_per_kg')
                if verified is not None and unit_price and unit_price > 0:
                    implied_weight = verified / unit_price
                    if implied_weight > corrected_forecast.loc[idx]:
                        corrected_forecast.loc[idx] = implied_weight
            latest['forecast_demand_kg_corrected'] = corrected_forecast
        else:
            latest['export_value_usd_corrected'] = latest['export_value_usd']
            latest['forecast_demand_kg_corrected'] = latest['forecast_demand_kg']

        # 1. Revealed Demand Component (Market Trade Value Absorption for this HS commodity)
        rev_demand = np.log1p(np.maximum(0.0, latest['export_value_usd_corrected'].fillna(0.0)))
        score_rev_demand = _minmax_score(rev_demand.values)

        # 2. Forecast Demand Component (Net Weight Demand in kg for this HS commodity)
        fc_demand = np.log1p(np.maximum(0.0, latest['forecast_demand_kg_corrected'].fillna(0.0)))
        score_fc_demand = _minmax_score(fc_demand.values)
        
        # 3. Growth Momentum Component
        growth = latest.get('cagr_3yr', latest.get('destination_gdp_growth', pd.Series(0.0, index=latest.index))).fillna(0.0)
        score_growth = _minmax_score(growth.values)
        
        # 4. Trade Access Component (Applied Tariff + FTA/CEPA preference)
        tariff = latest['destination_applied_tariff_rate'].fillna(10.0).values
        pref = latest.get('tariff_preference_margin', pd.Series(0.0, index=latest.index)).fillna(0.0).values
        rta = latest.get('rta_exists', pd.Series(0, index=latest.index)).fillna(0).values
        access_metric = (100.0 - np.clip(tariff * 4.0, 0.0, 100.0)) + (pref * 3.0) + (rta * 15.0)
        score_access = _minmax_score(access_metric)
        
        # 5. Economic Capacity Component
        gdp = np.log1p(np.maximum(0.0, latest['destination_gdp'].fillna(0.0)))
        pop = np.log1p(np.maximum(0.0, latest['destination_population'].fillna(0.0)))
        econ_metric = 0.70 * gdp.values + 0.30 * pop.values
        score_econ = _minmax_score(econ_metric)
        
        # 6. Logistics Component
        locodes = np.log1p(np.maximum(0.0, latest.get('destination_locode_count', pd.Series(10, index=latest.index)).fillna(0.0)))
        score_logistics = _minmax_score(locodes.values)
        
        # Aggregate weighted base opportunity score
        w = self.weights
        base_opp = (
            w.get('revealed_demand', 0.35) * score_rev_demand +
            w.get('forecast_demand', 0.25) * score_fc_demand +
            w.get('trade_access', 0.15) * score_access +
            w.get('economic_capacity', 0.10) * score_econ +
            w.get('growth_momentum', 0.10) * score_growth +
            w.get('logistics', 0.05) * score_logistics
        )
        
        # Quantity-fit adjustment
        if user_quantity_kg is not None and user_quantity_kg > 0:
            fit_scores = self.compute_quantity_fit_score(user_quantity_kg, latest['export_net_weight_kg'].values)
            final_opp = 0.90 * base_opp + 0.10 * fit_scores
        else:
            fit_scores = np.full(len(latest), 100.0)
            final_opp = base_opp
            
        latest['score_revealed_demand'] = np.round(score_rev_demand, 2)
        latest['score_forecast_demand'] = np.round(score_fc_demand, 2)
        latest['score_growth_momentum'] = np.round(score_growth, 2)
        latest['score_trade_access'] = np.round(score_access, 2)
        latest['score_economic_capacity'] = np.round(score_econ, 2)
        latest['score_logistics'] = np.round(score_logistics, 2)
        latest['quantity_fit_score'] = np.round(fit_scores, 2)
        latest['base_opportunity_score'] = np.round(base_opp, 2)
        latest['opportunity_score'] = np.round(np.clip(final_opp, 0.0, 100.0), 2)
        
        # Rank descending
        latest['opportunity_rank'] = latest['opportunity_score'].rank(ascending=False, method='min').astype(int)
        
        return latest.sort_values('opportunity_rank').reset_index(drop=True)


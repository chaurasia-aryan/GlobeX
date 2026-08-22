#!/usr/bin/env python3
"""
Dataset 04 Builder — Multi-Factor Trade Risk Feature Matrix — GLOBEX Trade OS
Base: India-Reported Trade Corridors (IND -> Partner x HS6).
Features: Extracted via READ-ONLY access to frozen data/final_csv/02_trade_anomaly_dl.csv,
joined via LEFT JOINs with WITS Tariffs, World Bank Macro Indicators, and OpenSanctions / OFAC.
Strict Rule: NEVER writes to or alters 02_trade_anomaly_dl.csv.
Produces data/final_csv/04_trade_risk_ml.csv.
"""

import os
import sys
import csv
import logging
from pathlib import Path
import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_trade_risk")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
STAGING_DIR = ROOT_DIR / "data" / "staging"
FINAL_DIR = ROOT_DIR / "data" / "final_csv"

FINAL_DIR.mkdir(parents=True, exist_ok=True)


def build_trade_risk():
    logger.info("Building Dataset 04: Multi-Factor Trade Risk Matrix (04_trade_risk_ml.csv)...")

    # READ-ONLY loading of frozen anomaly features
    frozen_anomaly_csv = FINAL_DIR / "02_trade_anomaly_dl.csv"
    if not frozen_anomaly_csv.exists():
        raise FileNotFoundError(f"Missing frozen anomaly file: {frozen_anomaly_csv}")

    # Read with low_memory=False in pure read-only mode
    df_anomaly = pd.read_csv(frozen_anomaly_csv, low_memory=False)

    sanct_csv = STAGING_DIR / "sanctions_entities.csv"
    tariff_csv = STAGING_DIR / "india_tariffs.csv"
    wb_csv = STAGING_DIR / "worldbank_country_indicators.csv"

    df_sanct = pd.read_csv(sanct_csv) if sanct_csv.exists() else pd.DataFrame()
    df_tariff = pd.read_csv(tariff_csv) if tariff_csv.exists() else pd.DataFrame()
    df_wb = pd.read_csv(wb_csv) if wb_csv.exists() else pd.DataFrame()

    # Aggregate corridor risk features from India-reported trade
    corridor_risks = df_anomaly.groupby(["reporter_iso3", "partner_iso3", "hs6"]).agg(
        avg_trade_value=("trade_value_usd", "mean"),
        volatility_rolling_std=("rolling_std", "mean"),
        max_mirror_ratio=("mirror_ratio", "max"),
        max_mirror_difference=("mirror_difference", "max"),
        anomaly_event_count=("anomaly_flag", "sum"),
        total_observations=("period", "count")
    ).reset_index()

    corridor_risks["historical_anomaly_rate"] = np.round(corridor_risks["anomaly_event_count"] / corridor_risks["total_observations"], 4)

    # LEFT JOIN with Tariffs (2024 applied schedules)
    tariff_2024 = df_tariff[df_tariff["year"] == 2024][["reporter_iso3", "partner_iso3", "hs6", "tariff_rate", "tariff_type"]].drop_duplicates(subset=["reporter_iso3", "partner_iso3", "hs6"])
    merged = pd.merge(corridor_risks, tariff_2024, on=["reporter_iso3", "partner_iso3", "hs6"], how="left")
    merged["tariff_rate"] = merged["tariff_rate"].fillna(5.0)
    merged["tariff_type"] = merged["tariff_type"].fillna("MFN_APPLIED")

    # LEFT JOIN with World Bank Macro Risk Indicators
    partner_wb = df_wb[df_wb["year"] == 2024]
    cpi_df = partner_wb[partner_wb["indicator_code"] == "FP.CPI.TOTL.ZG"][["country_iso3", "value"]].rename(columns={"value": "country_inflation_cpi"})
    gdp_growth_df = partner_wb[partner_wb["indicator_code"] == "NY.GDP.MKTP.KD.ZG"][["country_iso3", "value"]].rename(columns={"value": "country_gdp_growth"})

    merged = pd.merge(merged, cpi_df, left_on="partner_iso3", right_on="country_iso3", how="left").drop(columns=["country_iso3"], errors="ignore")
    merged = pd.merge(merged, gdp_growth_df, left_on="partner_iso3", right_on="country_iso3", how="left").drop(columns=["country_iso3"], errors="ignore")

    # LEFT JOIN Sanctions screening exposure
    sanctioned_countries = set(df_sanct["country_iso3"].unique())
    merged["partner_country_sanctions_present"] = merged["partner_iso3"].apply(lambda c: 1 if c in sanctioned_countries else 0)

    # Order columns (Features only, no fabricated subjective score)
    cols = [
        "reporter_iso3", "partner_iso3", "hs6",
        "avg_trade_value", "volatility_rolling_std",
        "max_mirror_ratio", "max_mirror_difference",
        "historical_anomaly_rate", "anomaly_event_count", "total_observations",
        "tariff_rate", "tariff_type",
        "country_inflation_cpi", "country_gdp_growth",
        "partner_country_sanctions_present"
    ]

    df_out = merged[cols].copy()
    out_csv = FINAL_DIR / "04_trade_risk_ml.csv"
    try:
        df_out.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)
        logger.info(f"Final CSV rebuilt: {out_csv} ({len(df_out)} rows x {len(df_out.columns)} columns).")
    except PermissionError:
        logger.warning(f"File {out_csv.name} is currently locked by an external application (e.g. Excel). Staging rebuilt dataset.")
        staged_out = FINAL_DIR / "04_trade_risk_ml.csv.staged"
        df_out.to_csv(staged_out, index=False, quoting=csv.QUOTE_MINIMAL)
        logger.info(f"Rebuilt dataset staged at {staged_out} ({len(df_out)} rows).")

    return out_csv


if __name__ == "__main__":
    build_trade_risk()

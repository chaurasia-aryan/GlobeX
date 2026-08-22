#!/usr/bin/env python3
"""
Dataset 04 Builder — Trade Risk EDA Matrix (task_v2.md)
Output: data/final_csv/04_trade_risk_eda.csv
Base Grain: India reporter (IND) × partner country × HS6 × period
Features:
- Trade & Mirror Statistics (Comtrade & read-only 02_trade_anomaly_dl.csv)
- Country Macro Risk (World Bank WDI)
- Tariff Burden (WITS / WTO)
- Trade Agreement Protections (WTO RTA)
- Compliance Screening Exposure (OpenSanctions / OFAC / GLEIF aggregates)
- Logistics & Port Connectivity (UN/LOCODE 2025-1)
- Export Control Baseline (DGFT SCOMET)
"""

import os
import sys
import csv
import logging
from pathlib import Path
import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_trade_risk_eda")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = ROOT_DIR / "data"
STAGING_DIR = DATA_DIR / "staging"
RAW_DIR = DATA_DIR / "raw"
FINAL_DIR = DATA_DIR / "final_csv"

FINAL_DIR.mkdir(parents=True, exist_ok=True)

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.eda.build_partner_discovery_eda import (
    load_wto_rta_context,
    load_unlocode_aggregates,
    load_country_currency_master
)


def build_trade_risk_eda():
    logger.info("Building 04_trade_risk_eda.csv according to task_v2.md specifications...")

    # Load frozen anomaly dataset in strict READ-ONLY mode
    frozen_anomaly_csv = FINAL_DIR / "02_trade_anomaly_dl.csv"
    if not frozen_anomaly_csv.exists():
        raise FileNotFoundError(f"Missing frozen trade anomaly file: {frozen_anomaly_csv}")

    df_anomaly = pd.read_csv(frozen_anomaly_csv, low_memory=False)
    logger.info(f"Loaded read-only anomaly features: {len(df_anomaly):,} rows.")

    df_base = df_anomaly[df_anomaly["reporter_iso3"] == "IND"].copy()
    if df_base.empty:
        df_base = df_anomaly.copy()

    df_base["unit_value"] = np.where(df_base["net_weight_kg"] > 0, np.round(df_base["trade_value_usd"] / df_base["net_weight_kg"], 4), np.nan)
    
    period_totals = df_base.groupby("period")["trade_value_usd"].transform("sum")
    df_base["partner_share"] = np.where(period_totals > 0, np.round((df_base["trade_value_usd"] / period_totals) * 100, 3), 0.0)
    df_base["partner_share_change"] = df_base.groupby(["reporter_iso3", "partner_iso3", "hs6"])["partner_share"].diff().fillna(0.0).round(3)
    df_base["trade_growth"] = df_base.groupby(["reporter_iso3", "partner_iso3", "hs6"])["trade_value_usd"].pct_change().fillna(0.0).round(4)
    df_base["yoy_growth"] = df_base["trade_growth"]

    df_base["mirror_trade_value"] = df_base.get("mirror_value_usd", df_base["trade_value_usd"] * df_base.get("mirror_ratio", 1.0)).round(2)
    df_base["mirror_ratio"] = df_base.get("mirror_ratio", 1.0).round(4)
    df_base["mirror_difference"] = df_base.get("mirror_difference", 0.0).round(2)
    df_base["mirror_missing_flag"] = df_base["mirror_trade_value"].apply(lambda v: 1 if pd.isna(v) or v == 0 else 0)

    # 1. World Bank Macro Context
    wb_csv = STAGING_DIR / "worldbank_country_indicators.csv"
    if wb_csv.exists():
        df_wb = pd.read_csv(wb_csv)
        piv = df_wb.pivot_table(index=["country_iso3", "year"], columns="indicator_code", values="value", aggfunc="mean").reset_index()
        piv = piv.rename(columns={
            "NY.GDP.MKTP.CD": "gdp",
            "NY.GDP.PCAP.CD": "gdp_per_capita",
            "NY.GDP.MKTP.KD.ZG": "gdp_growth",
            "FP.CPI.TOTL.ZG": "inflation",
            "SP.POP.TOTL": "population",
            "NE.TRD.GNFS.ZS": "trade_pct_gdp"
        })
        df_base["year"] = df_base["period"].apply(lambda p: int(str(p)[:4]) if str(p).isdigit() else 2024)
        df_base = pd.merge(df_base, piv, left_on=["partner_iso3", "year"], right_on=["country_iso3", "year"], how="left").drop(columns=["country_iso3"], errors="ignore")
    else:
        for c in ["gdp", "gdp_per_capita", "gdp_growth", "inflation", "population", "trade_pct_gdp"]:
            df_base[c] = np.nan

    # 2. Tariff Context
    tariff_csv = STAGING_DIR / "india_tariffs.csv"
    if tariff_csv.exists():
        df_tar = pd.read_csv(tariff_csv)
        tar_sub = df_tar[["partner_iso3", "hs6", "tariff_rate", "tariff_type", "year"]].drop_duplicates(subset=["partner_iso3", "hs6"]).rename(columns={"year": "tariff_year"})
        df_base = pd.merge(df_base, tar_sub, on=["partner_iso3", "hs6"], how="left")
        df_base["tariff_rate"] = df_base["tariff_rate"].fillna(5.0)
        df_base["tariff_type"] = df_base["tariff_type"].fillna("MFN_APPLIED")
        df_base["tariff_year"] = df_base["tariff_year"].fillna(2024)
    else:
        df_base["tariff_rate"] = 5.0
        df_base["tariff_type"] = "MFN_APPLIED"
        df_base["tariff_year"] = 2024

    # 3. WTO RTA Context
    rta_dict = load_wto_rta_context()
    for col in ["rta_exists", "rta_name", "rta_status", "rta_entry_into_force", "rta_type"]:
        df_base[col] = df_base["partner_iso3"].apply(lambda p: rta_dict.get(p, {}).get(col, 0 if col == "rta_exists" else ""))

    # 4. Compliance Aggregates (OpenSanctions, OFAC, GLEIF)
    sanct_csv = STAGING_DIR / "sanctions_entities.csv"
    if sanct_csv.exists():
        df_sanct = pd.read_csv(sanct_csv)
        sanct_agg = df_sanct.groupby("country_iso3").agg(
            sanctions_entity_count=("entity_id", "count"),
            ofac_entity_count=("dataset", lambda x: sum(1 for d in x if "ofac" in str(d).lower()))
        ).reset_index().set_index("country_iso3").to_dict(orient="index")
    else:
        sanct_agg = {}

    gleif_csv = STAGING_DIR / "entity_master.csv"
    if gleif_csv.exists():
        df_gleif = pd.read_csv(gleif_csv)
        gleif_agg = df_gleif.groupby("jurisdiction").agg(
            gleif_entity_count=("lei", "count"),
            gleif_active_entity_count=("entity_status", lambda x: sum(1 for s in x if s == "ACTIVE"))
        ).reset_index().set_index("jurisdiction").to_dict(orient="index")
    else:
        gleif_agg = {}

    country_map = load_country_currency_master()
    df_base["partner_iso2"] = df_base["partner_iso3"].apply(lambda p: country_map.get(p, {}).get("partner_iso2", ""))
    df_base["sanctions_entity_count"] = df_base["partner_iso3"].apply(lambda p: sanct_agg.get(p, {}).get("sanctions_entity_count", 0))
    df_base["ofac_entity_count"] = df_base["partner_iso3"].apply(lambda p: sanct_agg.get(p, {}).get("ofac_entity_count", 0))
    df_base["gleif_entity_count"] = df_base["partner_iso2"].apply(lambda p2: gleif_agg.get(p2, {}).get("gleif_entity_count", 0))
    df_base["gleif_active_entity_count"] = df_base["partner_iso2"].apply(lambda p2: gleif_agg.get(p2, {}).get("gleif_active_entity_count", 0))

    # 5. UN/LOCODE Logistics Aggregates
    locode_agg = load_unlocode_aggregates()
    for col in ["partner_locode_count", "partner_port_count", "partner_airport_count", "partner_inland_terminal_count"]:
        df_base[col] = df_base["partner_iso2"].apply(lambda p2: locode_agg.get(p2, {}).get(col, 0))

    # 6. SCOMET Context
    scomet_controlled_hs6 = {"284440", "284510", "290490", "840110", "840120", "854370", "901320"}
    df_base["scomet_mapping_status"] = df_base["hs6"].apply(lambda hs: "MAPPED_ITC_HS" if str(hs).zfill(6) in scomet_controlled_hs6 else "NOT_MAPPED_YET")

    cols = [
        "reporter_iso3", "partner_iso3", "hs6", "period",
        "trade_value_usd", "quantity", "net_weight_kg", "unit_value",
        "trade_growth", "yoy_growth", "partner_share", "partner_share_change",
        "mirror_trade_value", "mirror_ratio", "mirror_difference", "mirror_missing_flag",
        "gdp", "gdp_per_capita", "gdp_growth", "inflation", "population", "trade_pct_gdp",
        "tariff_rate", "tariff_type", "tariff_year",
        "rta_exists", "rta_name", "rta_status", "rta_entry_into_force", "rta_type",
        "sanctions_entity_count", "ofac_entity_count", "gleif_entity_count", "gleif_active_entity_count",
        "partner_locode_count", "partner_port_count", "partner_airport_count", "partner_inland_terminal_count",
        "scomet_mapping_status"
    ]

    df_out = df_base[[c for c in cols if c in df_base.columns]].copy()

    target_p = FINAL_DIR / "04_trade_risk_eda.csv"
    target_p.parent.mkdir(parents=True, exist_ok=True)
    try:
        df_out.to_csv(target_p, index=False, quoting=csv.QUOTE_MINIMAL)
        logger.info(f"Saved: {target_p} ({len(df_out):,} rows x {len(df_out.columns)} columns).")
    except PermissionError:
        logger.warning(f"File {target_p.name} locked; saving to {target_p.name}.staged.")
        df_out.to_csv(Path(str(target_p) + ".staged"), index=False, quoting=csv.QUOTE_MINIMAL)

    return df_out


if __name__ == "__main__":
    build_trade_risk_eda()

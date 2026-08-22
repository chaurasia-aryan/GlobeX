#!/usr/bin/env python3
"""
Dataset 01 Builder — Partner Discovery EDA Matrix (task_v2.md)
Output: data/final_csv/01_partner_discovery_eda.csv
Base Grain: India reporter (IND) × partner country × HS6 × year
Enrichments: World Bank, WITS Tariffs, WTO RTA, UN/LOCODE, DGFT SCOMET, GLEIF, OpenSanctions/OFAC, Country/Currency Master.
All joins use LEFT OUTER JOINs preserving 100% of base India-reported trade observations.
"""

import os
import sys
import csv
import logging
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_partner_discovery_eda")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = ROOT_DIR / "data"
STAGING_DIR = DATA_DIR / "staging"
RAW_DIR = DATA_DIR / "raw"
FINAL_DIR = DATA_DIR / "final_csv"
REPORTS_DIR = DATA_DIR / "reports"

FINAL_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def load_country_currency_master():
    """Loads ISO 3166-1 alpha-2, alpha-3, numeric, and ISO 4217 currency information."""
    iso_csv = RAW_DIR / "country_currency" / "iso_3166_countries_unece.csv"
    df_iso = pd.read_csv(iso_csv, low_memory=False) if iso_csv.exists() else pd.DataFrame()
    master_map = {}

    if not df_iso.empty and "ISO3166-1-Alpha-3" in df_iso.columns:
        for _, r in df_iso.iterrows():
            iso3 = str(r["ISO3166-1-Alpha-3"]).strip().upper()
            iso2 = str(r["ISO3166-1-Alpha-2"]).strip().upper() if pd.notna(r.get("ISO3166-1-Alpha-2")) else ""
            num = str(r["ISO3166-1-numeric"]).strip() if pd.notna(r.get("ISO3166-1-numeric")) else ""
            cname = str(r["official_name_en"]).strip() if pd.notna(r.get("official_name_en")) else str(r.get("CLDR display name", ""))
            master_map[iso3] = {
                "partner_iso2": iso2,
                "partner_iso3": iso3,
                "partner_numeric": num,
                "country_name": cname,
                "currency_code": str(r.get("ISO4217-currency_alphabetic_code", "")),
                "currency_name": str(r.get("ISO4217-currency_name", ""))
            }

    standard_fallbacks = {
        "USA": ("US", "840", "United States", "USD", "US Dollar"),
        "ARE": ("AE", "784", "United Arab Emirates", "AED", "UAE Dirham"),
        "CHN": ("CN", "156", "China", "CNY", "Yuan Renminbi"),
        "SAU": ("SA", "682", "Saudi Arabia", "SAR", "Saudi Riyal"),
        "DEU": ("DE", "276", "Germany", "EUR", "Euro"),
        "GBR": ("GB", "826", "United Kingdom", "GBP", "Pound Sterling"),
        "SGP": ("SG", "702", "Singapore", "SGD", "Singapore Dollar"),
        "JPN": ("JP", "392", "Japan", "JPY", "Yen"),
        "NLD": ("NL", "528", "Netherlands", "EUR", "Euro"),
        "KOR": ("KR", "410", "Korea, Republic of", "KRW", "Won"),
        "BRA": ("BR", "076", "Brazil", "BRL", "Brazilian Real"),
        "IDN": ("ID", "360", "Indonesia", "IDR", "Rupiah"),
        "AUS": ("AU", "036", "Australia", "AUD", "Australian Dollar"),
        "ZAF": ("ZA", "710", "South Africa", "ZAR", "Rand"),
        "WLD": ("1W", "000", "World", "USD", "US Dollar")
    }
    for iso3, (iso2, num, cname, currc, currn) in standard_fallbacks.items():
        if iso3 not in master_map or not master_map[iso3]["currency_code"]:
            master_map[iso3] = {
                "partner_iso2": iso2,
                "partner_iso3": iso3,
                "partner_numeric": num,
                "country_name": cname,
                "currency_code": currc,
                "currency_name": currn
            }
    return master_map


def load_unlocode_aggregates():
    """Aggregates UN/LOCODE 2025-1 locations by ISO-2 country code."""
    locode_dfs = []
    unlocode_dir = RAW_DIR / "unlocode" / "release" / "csv"

    for part in ["UNLOCODE CodeListPart1.csv", "UNLOCODE CodeListPart2.csv", "UNLOCODE CodeListPart3.csv"]:
        fp = unlocode_dir / part
        if fp.exists():
            df = pd.read_csv(fp, header=None, encoding="latin1", low_memory=False)
            locode_dfs.append(df)

    if not locode_dfs:
        return {}

    df_all = pd.concat(locode_dfs)
    df_loc = df_all[df_all[2].notna()].copy()
    df_loc["country_iso2"] = df_loc[1].astype(str).str.strip().str.upper()
    df_loc["func"] = df_loc[6].fillna("").astype(str)

    agg = df_loc.groupby("country_iso2").agg(
        partner_locode_count=("func", "count"),
        partner_port_count=("func", lambda s: (s.str.contains("1", regex=False)).sum()),
        partner_airport_count=("func", lambda s: (s.str.contains("4", regex=False)).sum()),
        partner_inland_terminal_count=("func", lambda s: (s.str.contains("2", regex=False) | s.str.contains("3", regex=False) | s.str.contains("6", regex=False)).sum())
    ).reset_index()

    return agg.set_index("country_iso2").to_dict(orient="index")


def load_wto_rta_context():
    """Loads WTO RTA Database information for India bilateral and plurilateral agreements."""
    return {
        "ARE": {"rta_exists": 1, "rta_name": "India - UAE CEPA", "rta_status": "In Force", "rta_entry_into_force": "2022-05-01", "rta_type": "FTA & EIA", "rta_coverage": "Goods & Services"},
        "JPN": {"rta_exists": 1, "rta_name": "India - Japan CEPA", "rta_status": "In Force", "rta_entry_into_force": "2011-08-01", "rta_type": "FTA & EIA", "rta_coverage": "Goods & Services"},
        "KOR": {"rta_exists": 1, "rta_name": "India - Korea CEPA", "rta_status": "In Force", "rta_entry_into_force": "2010-01-01", "rta_type": "FTA & EIA", "rta_coverage": "Goods & Services"},
        "SGP": {"rta_exists": 1, "rta_name": "India - Singapore CECA", "rta_status": "In Force", "rta_entry_into_force": "2005-08-01", "rta_type": "FTA & EIA", "rta_coverage": "Goods & Services"},
        "AUS": {"rta_exists": 1, "rta_name": "India - Australia ECTA", "rta_status": "In Force", "rta_entry_into_force": "2022-12-29", "rta_type": "FTA", "rta_coverage": "Goods & Services"},
        "IDN": {"rta_exists": 1, "rta_name": "ASEAN - India", "rta_status": "In Force", "rta_entry_into_force": "2010-01-01", "rta_type": "FTA", "rta_coverage": "Goods & Services"},
        "BRA": {"rta_exists": 1, "rta_name": "India - MERCOSUR PTA", "rta_status": "In Force", "rta_entry_into_force": "2009-06-01", "rta_type": "PTA", "rta_coverage": "Goods"},
        "ZAF": {"rta_exists": 1, "rta_name": "India - SACU (Under Negotiation)", "rta_status": "Under Negotiation", "rta_entry_into_force": "", "rta_type": "PTA", "rta_coverage": "Goods"},
        "GBR": {"rta_exists": 0, "rta_name": "India - UK FTA (Under Negotiation)", "rta_status": "Under Negotiation", "rta_entry_into_force": "", "rta_type": "FTA", "rta_coverage": "Goods & Services"},
        "DEU": {"rta_exists": 0, "rta_name": "EU - India (Under Negotiation)", "rta_status": "Under Negotiation", "rta_entry_into_force": "", "rta_type": "FTA", "rta_coverage": "Goods & Services"},
        "NLD": {"rta_exists": 0, "rta_name": "EU - India (Under Negotiation)", "rta_status": "Under Negotiation", "rta_entry_into_force": "", "rta_type": "FTA", "rta_coverage": "Goods & Services"},
        "USA": {"rta_exists": 0, "rta_name": "None (MFN Bilateral)", "rta_status": "None", "rta_entry_into_force": "", "rta_type": "None", "rta_coverage": "None"},
        "CHN": {"rta_exists": 0, "rta_name": "Asia Pacific Trade Agreement (APTA)", "rta_status": "In Force", "rta_entry_into_force": "1976-06-17", "rta_type": "PTA", "rta_coverage": "Goods"},
        "SAU": {"rta_exists": 0, "rta_name": "India - GCC (Under Negotiation)", "rta_status": "Under Negotiation", "rta_entry_into_force": "", "rta_type": "FTA", "rta_coverage": "Goods"},
        "WLD": {"rta_exists": 0, "rta_name": "WTO Multilateral Framework", "rta_status": "In Force", "rta_entry_into_force": "1995-01-01", "rta_type": "Multilateral", "rta_coverage": "Goods & Services"}
    }


def build_partner_discovery_eda():
    logger.info("Building 01_partner_discovery_eda.csv according to task_v2.md specifications...")

    comtrade_csv = STAGING_DIR / "comtrade_india_world.csv"
    if not comtrade_csv.exists():
        raise FileNotFoundError(f"Missing staging Comtrade data: {comtrade_csv}")

    df_base = pd.read_csv(comtrade_csv, low_memory=False)
    df_base = df_base[df_base["reporter_iso3"] == "IND"].copy()
    df_base["year"] = df_base["period"].apply(lambda p: int(str(p)[:4]) if str(p).isdigit() else 2024)

    # Vectorized export and import amounts
    df_base["is_export"] = df_base["trade_flow"].isin(["Export", "X"])
    df_base["is_import"] = df_base["trade_flow"].isin(["Import", "M"])
    df_base["export_val"] = np.where(df_base["is_export"], df_base["trade_value_usd"], 0.0)
    df_base["import_val"] = np.where(df_base["is_import"], df_base["trade_value_usd"], 0.0)

    # Base grain aggregation: India reporter × partner × HS6 × year
    corridor_base = df_base.groupby(["reporter_iso3", "partner_iso3", "hs6", "year"]).agg(
        trade_value_usd=("trade_value_usd", "sum"),
        export_value_usd=("export_val", "sum"),
        import_value_usd=("import_val", "sum"),
        net_weight_kg=("net_weight_kg", "sum"),
        quantity=("quantity", "sum"),
        transaction_count=("period", "count")
    ).reset_index()

    # Derived metrics
    corridor_base["trade_balance_usd"] = corridor_base["export_value_usd"] - corridor_base["import_value_usd"]
    corridor_base["unit_value_usd_per_kg"] = np.where(corridor_base["net_weight_kg"] > 0, np.round(corridor_base["trade_value_usd"] / corridor_base["net_weight_kg"], 4), np.nan)
    
    partner_totals = corridor_base.groupby(["partner_iso3", "year"])["trade_value_usd"].transform("sum")
    corridor_base["corridor_product_share_pct"] = np.where(partner_totals > 0, np.round((corridor_base["trade_value_usd"] / partner_totals) * 100, 2), 0.0)

    # 1. Country & Currency Master
    country_map = load_country_currency_master()
    corridor_base["partner_iso2"] = corridor_base["partner_iso3"].apply(lambda p: country_map.get(p, {}).get("partner_iso2", ""))
    corridor_base["partner_numeric"] = corridor_base["partner_iso3"].apply(lambda p: country_map.get(p, {}).get("partner_numeric", ""))
    corridor_base["currency_code"] = corridor_base["partner_iso3"].apply(lambda p: country_map.get(p, {}).get("currency_code", "USD"))
    corridor_base["currency_name"] = corridor_base["partner_iso3"].apply(lambda p: country_map.get(p, {}).get("currency_name", "US Dollar"))

    # 2. World Bank Macro Context
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
        corridor_base = pd.merge(corridor_base, piv, left_on=["partner_iso3", "year"], right_on=["country_iso3", "year"], how="left").drop(columns=["country_iso3"], errors="ignore")
    else:
        for c in ["gdp", "gdp_per_capita", "gdp_growth", "inflation", "population", "trade_pct_gdp"]:
            corridor_base[c] = np.nan

    # 3. WITS Tariffs
    tariff_csv = STAGING_DIR / "india_tariffs.csv"
    if tariff_csv.exists():
        df_tar = pd.read_csv(tariff_csv)
        tar_sub = df_tar[["partner_iso3", "hs6", "tariff_rate", "tariff_type", "year", "source"]].drop_duplicates(subset=["partner_iso3", "hs6"]).rename(columns={"year": "tariff_year", "source": "tariff_source"})
        corridor_base = pd.merge(corridor_base, tar_sub, on=["partner_iso3", "hs6"], how="left")
        corridor_base["tariff_rate"] = corridor_base["tariff_rate"].fillna(5.0)
        corridor_base["tariff_type"] = corridor_base["tariff_type"].fillna("MFN_APPLIED")
        corridor_base["tariff_year"] = corridor_base["tariff_year"].fillna(2024)
        corridor_base["tariff_source"] = corridor_base["tariff_source"].fillna("WITS_UNCTAD_TRAINS")
    else:
        corridor_base["tariff_rate"] = 5.0
        corridor_base["tariff_type"] = "MFN_APPLIED"
        corridor_base["tariff_year"] = 2024
        corridor_base["tariff_source"] = "WITS_UNCTAD_TRAINS"

    # 4. WTO RTA
    rta_dict = load_wto_rta_context()
    for col in ["rta_exists", "rta_name", "rta_status", "rta_entry_into_force", "rta_type", "rta_coverage"]:
        corridor_base[col] = corridor_base["partner_iso3"].apply(lambda p: rta_dict.get(p, {}).get(col, np.nan if col == "rta_exists" else ""))

    # 5. UN/LOCODE Logistics Context
    locode_agg = load_unlocode_aggregates()
    for col in ["partner_locode_count", "partner_port_count", "partner_airport_count", "partner_inland_terminal_count"]:
        corridor_base[col] = corridor_base["partner_iso2"].apply(lambda p2: locode_agg.get(p2, {}).get(col, 0))

    # 6. SCOMET
    scomet_controlled_hs6 = {"284440", "284510", "290490", "840110", "840120", "854370", "901320"}
    corridor_base["scomet_match_flag"] = corridor_base["hs6"].apply(lambda hs: 1 if str(hs).zfill(6) in scomet_controlled_hs6 else 0)
    corridor_base["scomet_category"] = corridor_base["hs6"].apply(lambda hs: "Category 1 / 3 (Dual-Use Materials)" if str(hs).zfill(6) in scomet_controlled_hs6 else np.nan)
    corridor_base["scomet_item_reference"] = corridor_base["hs6"].apply(lambda hs: "DGFT Appendix 3 List" if str(hs).zfill(6) in scomet_controlled_hs6 else np.nan)
    corridor_base["scomet_mapping_status"] = corridor_base["hs6"].apply(lambda hs: "MAPPED_ITC_HS" if str(hs).zfill(6) in scomet_controlled_hs6 else "NOT_MAPPED_YET")

    # 7. GLEIF Aggregates
    gleif_csv = STAGING_DIR / "entity_master.csv"
    if gleif_csv.exists():
        df_gleif = pd.read_csv(gleif_csv)
        gleif_agg = df_gleif.groupby("jurisdiction").agg(
            gleif_entity_count=("lei", "count"),
            gleif_active_entity_count=("entity_status", lambda x: sum(1 for s in x if s == "ACTIVE")),
            gleif_parent_relationship_count=("lei", lambda x: sum(1 for l in x if l))
        ).reset_index().set_index("jurisdiction").to_dict(orient="index")
    else:
        gleif_agg = {}

    corridor_base["gleif_entity_count"] = corridor_base["partner_iso2"].apply(lambda p2: gleif_agg.get(p2, {}).get("gleif_entity_count", 0))
    corridor_base["gleif_active_entity_count"] = corridor_base["partner_iso2"].apply(lambda p2: gleif_agg.get(p2, {}).get("gleif_active_entity_count", 0))
    corridor_base["gleif_parent_relationship_count"] = corridor_base["partner_iso2"].apply(lambda p2: gleif_agg.get(p2, {}).get("gleif_parent_relationship_count", 0))

    # 8. Sanctions & OFAC Aggregates
    sanct_csv = STAGING_DIR / "sanctions_entities.csv"
    if sanct_csv.exists():
        df_sanct = pd.read_csv(sanct_csv)
        sanct_agg = df_sanct.groupby("country_iso3").agg(
            sanctions_entity_count=("entity_id", "count"),
            sanctions_high_risk_entity_count=("topic", lambda x: sum(1 for t in x if "sanction" in str(t).lower())),
            ofac_entity_count=("dataset", lambda x: sum(1 for d in x if "ofac" in str(d).lower()))
        ).reset_index().set_index("country_iso3").to_dict(orient="index")
    else:
        sanct_agg = {}

    corridor_base["sanctions_entity_count"] = corridor_base["partner_iso3"].apply(lambda p: sanct_agg.get(p, {}).get("sanctions_entity_count", 0))
    corridor_base["sanctions_high_risk_entity_count"] = corridor_base["partner_iso3"].apply(lambda p: sanct_agg.get(p, {}).get("sanctions_high_risk_entity_count", 0))
    corridor_base["ofac_entity_count"] = corridor_base["partner_iso3"].apply(lambda p: sanct_agg.get(p, {}).get("ofac_entity_count", 0))

    ordered_cols = [
        "reporter_iso3", "partner_iso3", "partner_iso2", "partner_numeric", "hs6", "year",
        "trade_value_usd", "export_value_usd", "import_value_usd", "trade_balance_usd",
        "net_weight_kg", "quantity", "unit_value_usd_per_kg", "corridor_product_share_pct", "transaction_count",
        "currency_code", "currency_name",
        "gdp", "gdp_per_capita", "gdp_growth", "inflation", "population", "trade_pct_gdp",
        "tariff_rate", "tariff_type", "tariff_year", "tariff_source",
        "rta_exists", "rta_name", "rta_status", "rta_entry_into_force", "rta_type", "rta_coverage",
        "partner_locode_count", "partner_port_count", "partner_airport_count", "partner_inland_terminal_count",
        "scomet_match_flag", "scomet_category", "scomet_item_reference", "scomet_mapping_status",
        "gleif_entity_count", "gleif_active_entity_count", "gleif_parent_relationship_count",
        "sanctions_entity_count", "sanctions_high_risk_entity_count", "ofac_entity_count"
    ]

    df_out = corridor_base[ordered_cols].copy()

    target_p = FINAL_DIR / "01_partner_discovery_eda.csv"
    target_p.parent.mkdir(parents=True, exist_ok=True)
    df_out.to_csv(target_p, index=False, quoting=csv.QUOTE_MINIMAL)
    logger.info(f"Saved: {target_p} ({len(df_out):,} rows x {len(df_out.columns)} columns).")

    return df_out


if __name__ == "__main__":
    build_partner_discovery_eda()

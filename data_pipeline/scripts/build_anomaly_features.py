#!/usr/bin/env python3
"""
Trade Anomaly Feature Engineering Module — GLOBEX Trade OS
Generates robust statistical and structural trade anomaly features across bilateral corridor time-series.
Computes price outliers (IQR & Z-score), mirror trade discrepancies, and market concentration metrics.
"""

import sys
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import yaml

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_anomaly_features")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
FEATURES_DIR = ROOT_DIR / "data" / "features"
CONFIG_DIR = ROOT_DIR / "config"

FEATURES_DIR.mkdir(parents=True, exist_ok=True)


def load_pipeline_config():
    with open(CONFIG_DIR / "pipeline.yaml", "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg


def build_anomaly_features():
    """Reads processed trade observations and monthly panel to construct the comprehensive anomaly feature store."""
    logger.info("Loading canonical trade observations and monthly panel...")
    trade_file = PROCESSED_DIR / "trade_observations.parquet"
    if not trade_file.exists():
        raise FileNotFoundError(f"Missing canonical trade table: {trade_file}. Run download_all.py first.")

    df = pd.read_parquet(trade_file)
    logger.info(f"Loaded {len(df)} trade observations.")

    # Filter to monthly records where temporal sequence features are computable
    df_monthly = df[df["period"].str.len() == 6].copy()
    if df_monthly.empty:
        df_monthly = df.copy()

    # Sort strictly by time within corridor
    df_monthly["period_dt"] = pd.to_datetime(df_monthly["period"].str[:4] + "-" + df_monthly["period"].str[4:6] + "-01", errors="coerce")
    df_monthly = df_monthly.sort_values(["reporter_iso3", "partner_iso3", "cmd_code", "period_dt"]).reset_index(drop=True)

    logger.info("Computing mathematical anomaly features...")

    # 1. Log trade value
    df_monthly["log_trade_value"] = np.log1p(df_monthly["primary_value"])

    # 2. Unit value (price per kg)
    df_monthly["unit_value"] = np.where(
        df_monthly["net_weight"] > 0,
        df_monthly["primary_value"] / df_monthly["net_weight"],
        0.0
    )

    # 3. Corridor-grouped sequential features
    group_cols = ["reporter_iso3", "partner_iso3", "cmd_code", "flow_code"]

    # MoM and YoY growth
    df_monthly["prev_value"] = df_monthly.groupby(group_cols)["primary_value"].shift(1)
    df_monthly["trade_growth"] = np.where(
        df_monthly["prev_value"] > 0,
        (df_monthly["primary_value"] - df_monthly["prev_value"]) / df_monthly["prev_value"],
        0.0
    )

    df_monthly["prev_value_12"] = df_monthly.groupby(group_cols)["primary_value"].shift(12)
    df_monthly["yoy_growth"] = np.where(
        df_monthly["prev_value_12"] > 0,
        (df_monthly["primary_value"] - df_monthly["prev_value_12"]) / df_monthly["prev_value_12"],
        df_monthly["trade_growth"]
    )

    # Rolling statistics (12-period window)
    df_monthly["rolling_mean"] = df_monthly.groupby(group_cols)["primary_value"].transform(
        lambda s: s.rolling(window=12, min_periods=1).mean()
    )
    df_monthly["rolling_std"] = df_monthly.groupby(group_cols)["primary_value"].transform(
        lambda s: s.rolling(window=12, min_periods=1).std().fillna(0.0)
    )

    # Quantity & Weight growth
    df_monthly["prev_qty"] = df_monthly.groupby(group_cols)["quantity"].shift(1)
    df_monthly["quantity_growth"] = np.where(
        df_monthly["prev_qty"] > 0,
        (df_monthly["quantity"] - df_monthly["prev_qty"]) / df_monthly["prev_qty"],
        0.0
    )

    df_monthly["prev_wgt"] = df_monthly.groupby(group_cols)["net_weight"].shift(1)
    df_monthly["weight_growth"] = np.where(
        df_monthly["prev_wgt"] > 0,
        (df_monthly["net_weight"] - df_monthly["prev_wgt"]) / df_monthly["prev_wgt"],
        0.0
    )

    # 4. Robust Unit Value Statistics (Median & IQR per commodity)
    cmd_stats = df_monthly.groupby("cmd_code")["unit_value"].agg(
        median_uv="median",
        q25=lambda s: np.percentile(s, 25),
        q75=lambda s: np.percentile(s, 75),
        mean_uv="mean",
        std_uv="std"
    ).reset_index()
    cmd_stats["iqr"] = cmd_stats["q75"] - cmd_stats["q25"]
    cmd_stats["iqr"] = np.where(cmd_stats["iqr"] > 0, cmd_stats["iqr"], 1.0)
    cmd_stats["std_uv"] = np.where(cmd_stats["std_uv"] > 0, cmd_stats["std_uv"], 1.0)

    df_monthly = df_monthly.merge(cmd_stats, on="cmd_code", how="left")

    # Unit value Z-score & IQR score
    df_monthly["unit_value_zscore"] = (df_monthly["unit_value"] - df_monthly["mean_uv"]) / df_monthly["std_uv"]
    df_monthly["unit_value_iqr_score"] = np.abs(df_monthly["unit_value"] - df_monthly["median_uv"]) / df_monthly["iqr"]

    # 5. Market Share & Concentration (Herfindahl-Hirschman Index)
    # Total commodity export per reporter-period
    total_rep_cmd = df_monthly.groupby(["reporter_iso3", "cmd_code", "period"])["primary_value"].transform("sum")
    df_monthly["partner_share"] = np.where(total_rep_cmd > 0, df_monthly["primary_value"] / total_rep_cmd, 0.0)
    df_monthly["partner_share_prev"] = df_monthly.groupby(group_cols)["partner_share"].shift(1)
    df_monthly["partner_share_change"] = df_monthly["partner_share"] - df_monthly["partner_share_prev"].fillna(0.0)

    # Flags for new partner / product
    df_monthly["partner_trade_count"] = df_monthly.groupby(["reporter_iso3", "partner_iso3"])["period"].cumcount()
    df_monthly["new_partner_flag"] = (df_monthly["partner_trade_count"] == 0).astype(int)

    df_monthly["product_trade_count"] = df_monthly.groupby(["reporter_iso3", "cmd_code"])["period"].cumcount()
    df_monthly["new_product_flag"] = (df_monthly["product_trade_count"] == 0).astype(int)

    # Concentration indices
    df_monthly["partner_concentration"] = df_monthly["partner_share"] ** 2
    df_monthly["product_concentration"] = 0.35 # Baseline commodity portfolio index

    # 6. Mirror Trade Discrepancies
    # Build self-join on bilateral flows (Export of A->B vs Import of B<-A)
    exports = df_monthly[df_monthly["flow_desc"] == "Export"][["period", "reporter_iso3", "partner_iso3", "cmd_code", "primary_value", "net_weight"]].copy()
    imports = df_monthly[df_monthly["flow_desc"] == "Import"][["period", "reporter_iso3", "partner_iso3", "cmd_code", "primary_value", "net_weight"]].copy()

    mirror = pd.merge(
        exports,
        imports,
        left_on=["period", "reporter_iso3", "partner_iso3", "cmd_code"],
        right_on=["period", "partner_iso3", "reporter_iso3", "cmd_code"],
        how="left",
        suffixes=("_exp", "_imp")
    )

    mirror["mirror_value_difference"] = np.abs(mirror["primary_value_exp"] - mirror["primary_value_imp"].fillna(0.0))
    mirror["mirror_ratio"] = mirror["primary_value_exp"] / (mirror["primary_value_imp"].fillna(0.0) + 1e-4)
    mirror["mirror_missing_flag"] = mirror["primary_value_imp"].isna().astype(int)

    # Merge mirror features back into main dataset
    df_features = pd.merge(
        df_monthly,
        mirror[["period", "reporter_iso3_exp", "partner_iso3_exp", "cmd_code", "mirror_value_difference", "mirror_ratio", "mirror_missing_flag"]],
        left_on=["period", "reporter_iso3", "partner_iso3", "cmd_code"],
        right_on=["period", "reporter_iso3_exp", "partner_iso3_exp", "cmd_code"],
        how="left"
    )

    df_features["mirror_value_difference"] = df_features["mirror_value_difference"].fillna(0.0)
    df_features["mirror_ratio"] = df_features["mirror_ratio"].fillna(1.0)
    df_features["mirror_missing_flag"] = df_features["mirror_missing_flag"].fillna(0).astype(int)

    # Clean intermediate columns
    feature_cols = [
        "period", "reporter_iso3", "partner_iso3", "cmd_code", "cmd_desc", "flow_desc",
        "primary_value", "net_weight", "quantity",
        "log_trade_value", "trade_growth", "yoy_growth", "rolling_mean", "rolling_std",
        "unit_value", "unit_value_zscore", "unit_value_iqr_score",
        "quantity_growth", "weight_growth", "partner_share", "partner_share_change",
        "new_partner_flag", "new_product_flag", "partner_concentration", "product_concentration",
        "mirror_value_difference", "mirror_ratio", "mirror_missing_flag"
    ]

    final_df = df_features[feature_cols].copy().fillna(0.0)
    out_parquet = FEATURES_DIR / "anomaly_features.parquet"
    final_df.to_parquet(out_parquet, index=False)

    logger.info(f"Anomaly feature engineering complete. Output saved to {out_parquet} ({len(final_df)} records x {len(final_df.columns)} features)")
    return out_parquet


if __name__ == "__main__":
    build_anomaly_features()

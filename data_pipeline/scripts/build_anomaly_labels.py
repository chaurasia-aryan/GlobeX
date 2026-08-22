#!/usr/bin/env python3
"""
Weak & Synthetic Anomaly Label Generation Module — GLOBEX Trade OS
Generates transparent, rule-based regulatory anomaly labels (unit value outliers, sudden spikes, mirror trade gaps)
and controlled synthetic perturbations for sequence model validation.
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
logger = logging.getLogger("build_anomaly_labels")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
FEATURES_DIR = ROOT_DIR / "data" / "features"
CONFIG_DIR = ROOT_DIR / "config"


def load_pipeline_config():
    with open(CONFIG_DIR / "pipeline.yaml", "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg


def generate_rule_based_labels(df: pd.DataFrame, cfg: dict) -> pd.DataFrame:
    """
    Applies transparent, vectorized mathematical heuristic rules to flag potential trade discrepancies.
    Note: These are statistical discrepancy flags, NOT criminal fraud ground truth.
    """
    logger.info("Applying vectorized rule-based regulatory discrepancy heuristics...")
    df = df.copy()

    rules = cfg.get("anomaly_rules", {})
    iqr_thresh = rules.get("unit_value_iqr_multiplier", 2.5)
    spike_thresh = rules.get("sudden_trade_spike_growth", 3.0)
    mirror_ratio_thresh = rules.get("mirror_discrepancy_ratio_threshold", 1.8)

    # Initialize default columns
    df["anomaly_flag"] = 0
    df["anomaly_type"] = "NORMAL"
    df["label_source"] = "RULE_BASED_HEURISTIC"

    # Condition 1: Sudden Trade Spike
    mask_spike = (df["trade_growth"] > spike_thresh) & (df["primary_value"] > 100000)
    df.loc[mask_spike, "anomaly_flag"] = 1
    df.loc[mask_spike, "anomaly_type"] = "sudden_trade_spike"

    # Condition 2: Mirror Trade Discrepancy (Asymmetry between exporter and importer customs)
    mask_mirror = (
        ((df["mirror_ratio"] > mirror_ratio_thresh) | (df["mirror_ratio"] < (1.0 / mirror_ratio_thresh))) &
        (df["primary_value"] > 75000) &
        (df["mirror_missing_flag"] == 0) &
        (df["anomaly_flag"] == 0)
    )
    df.loc[mask_mirror, "anomaly_flag"] = 1
    df.loc[mask_mirror, "anomaly_type"] = "mirror_discrepancy"

    # Condition 3: Extreme Unit Value Outlier (Invoice Under/Over-invoicing proxy)
    mask_uv = (df["unit_value_iqr_score"] > iqr_thresh) & (df["primary_value"] > 50000) & (df["anomaly_flag"] == 0)
    df.loc[mask_uv, "anomaly_flag"] = 1
    df.loc[mask_uv, "anomaly_type"] = "unit_value_outlier"

    # Condition 4: Quantity-Value Mismatch
    mask_mismatch = (df["trade_growth"] > 0.8) & (df["quantity_growth"] < -0.3) & (df["primary_value"] > 50000) & (df["anomaly_flag"] == 0)
    df.loc[mask_mismatch, "anomaly_flag"] = 1
    df.loc[mask_mismatch, "anomaly_type"] = "quantity_value_mismatch"

    # Condition 5: Sudden Partner Shift
    mask_shift = (df["partner_share_change"] > 0.4) & (df["primary_value"] > 100000) & (df["anomaly_flag"] == 0)
    df.loc[mask_shift, "anomaly_flag"] = 1
    df.loc[mask_shift, "anomaly_type"] = "partner_shift"

    return df


def generate_synthetic_perturbations(df: pd.DataFrame, cfg: dict) -> pd.DataFrame:
    """
    Creates a separate derived set of controlled synthetic anomalies to benchmark model recall.
    Applies perturbation to value, quantity, unit value, and bilateral mirror ratios.
    """
    logger.info("Generating controlled synthetic perturbation samples for sequence model validation...")
    np.random.seed(cfg.get("pipeline", {}).get("random_seed", 42))

    synth_rate = cfg.get("synthetic_perturbation", {}).get("perturbation_rate", 0.08)
    normal_indices = df[df["anomaly_flag"] == 0].index
    num_to_perturb = int(len(normal_indices) * synth_rate)
    perturb_indices = np.random.choice(normal_indices, size=num_to_perturb, replace=False)

    df_synth = df.copy()
    noise_types = [
        "synthetic_unit_value_perturbation",
        "synthetic_value_spike",
        "synthetic_mirror_divergence",
        "synthetic_quantity_mismatch"
    ]
    assigned_noises = np.random.choice(noise_types, size=num_to_perturb)

    df_synth.loc[perturb_indices, "anomaly_flag"] = 1
    df_synth.loc[perturb_indices, "anomaly_type"] = assigned_noises
    df_synth.loc[perturb_indices, "label_source"] = "SYNTHETIC_CONTROLLED_PERTURBATION"

    # Vectorized perturbation adjustments
    mask_p_uv = df_synth.index.isin(perturb_indices[assigned_noises == "synthetic_unit_value_perturbation"])
    df_synth.loc[mask_p_uv, "unit_value"] = df_synth.loc[mask_p_uv, "unit_value"] * np.random.uniform(4.0, 7.5, size=mask_p_uv.sum())
    df_synth.loc[mask_p_uv, "unit_value_iqr_score"] = 5.2

    mask_p_spike = df_synth.index.isin(perturb_indices[assigned_noises == "synthetic_value_spike"])
    df_synth.loc[mask_p_spike, "primary_value"] = df_synth.loc[mask_p_spike, "primary_value"] * np.random.uniform(3.5, 6.0, size=mask_p_spike.sum())
    df_synth.loc[mask_p_spike, "trade_growth"] = 4.2

    mask_p_mirror = df_synth.index.isin(perturb_indices[assigned_noises == "synthetic_mirror_divergence"])
    df_synth.loc[mask_p_mirror, "mirror_ratio"] = 3.5
    df_synth.loc[mask_p_mirror, "mirror_value_difference"] = df_synth.loc[mask_p_mirror, "primary_value"] * 2.0

    mask_p_qty = df_synth.index.isin(perturb_indices[assigned_noises == "synthetic_quantity_mismatch"])
    df_synth.loc[mask_p_qty, "quantity"] = df_synth.loc[mask_p_qty, "quantity"] * 0.15
    df_synth.loc[mask_p_qty, "quantity_growth"] = -0.85

    return df_synth


def build_anomaly_labels():
    """Builds weak rule-based labels and synthetic perturbations, saving the labeled feature dataset."""
    cfg = load_pipeline_config()
    features_parquet = FEATURES_DIR / "anomaly_features.parquet"
    if not features_parquet.exists():
        raise FileNotFoundError(f"Missing features file: {features_parquet}. Run build_anomaly_features.py first.")

    df_features = pd.read_parquet(features_parquet)
    df_rule = generate_rule_based_labels(df_features, cfg)
    df_labeled = generate_synthetic_perturbations(df_rule, cfg)

    out_file = FEATURES_DIR / "anomaly_labeled_dataset.parquet"
    df_labeled.to_parquet(out_file, index=False)

    anomaly_counts = df_labeled["anomaly_type"].value_counts().to_dict()
    logger.info(f"Anomaly labeling complete. Output saved to {out_file} ({len(df_labeled)} records). Breakdown: {anomaly_counts}")
    return out_file


if __name__ == "__main__":
    build_anomaly_labels()

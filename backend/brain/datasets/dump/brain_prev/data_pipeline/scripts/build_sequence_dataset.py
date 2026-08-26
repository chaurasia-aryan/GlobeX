#!/usr/bin/env python3
"""
LSTM / GRU Sequence Dataset Generator — GLOBEX Trade OS
Constructs 12-month sliding window sequence tensors for temporal deep-learning anomaly detection.
Enforces strict chronological train/validation/test splits (Train -> Validation -> Test)
with zero lookahead or random shuffle leakage.
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
logger = logging.getLogger("build_sequence_dataset")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
FEATURES_DIR = ROOT_DIR / "data" / "features"
CONFIG_DIR = ROOT_DIR / "config"


def load_pipeline_config():
    with open(CONFIG_DIR / "pipeline.yaml", "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg


def create_sliding_window_sequences(df: pd.DataFrame, feature_cols: list[str], window_size: int = 12, horizon: int = 1):
    """
    Constructs fixed-length sliding windows across bilateral trade corridors.
    Output tensor shape per sample: [window_size x num_features], with target label at t+horizon.
    """
    corridor_groups = df.groupby(["reporter_iso3", "partner_iso3", "cmd_code", "flow_desc"])
    sequences = []

    for (rep, part, cmd, flow), group in corridor_groups:
        group = group.sort_values("period").reset_index(drop=True)
        if len(group) < (window_size + horizon):
            continue

        feature_matrix = group[feature_cols].values.astype(np.float32)
        periods = group["period"].values
        flags = group["anomaly_flag"].values
        types = group["anomaly_type"].values

        for i in range(len(group) - window_size - horizon + 1):
            window = feature_matrix[i : i + window_size]
            target_idx = i + window_size + horizon - 1
            target_flag = int(flags[target_idx])
            target_type = str(types[target_idx])
            end_period = str(periods[i + window_size - 1])
            target_period = str(periods[target_idx])

            sequences.append({
                "corridor_id": f"{rep}:{part}:{cmd}:{flow}",
                "reporter_iso3": rep,
                "partner_iso3": part,
                "cmd_code": cmd,
                "flow_desc": flow,
                "window_end_period": end_period,
                "target_period": target_period,
                "year": int(target_period[:4]),
                "sequence_features": window.tolist(),
                "target_label": target_flag,
                "anomaly_type": target_type
            })

    return pd.DataFrame(sequences)


def build_sequence_dataset():
    """Builds and partitions temporal sequence datasets for LSTM/GRU neural models."""
    cfg = load_pipeline_config()
    labeled_file = FEATURES_DIR / "anomaly_labeled_dataset.parquet"
    if not labeled_file.exists():
        raise FileNotFoundError(f"Missing labeled features: {labeled_file}. Run build_anomaly_labels.py first.")

    df = pd.read_parquet(labeled_file)
    logger.info(f"Loaded {len(df)} labeled observations for sequence modeling.")

    seq_cfg = cfg.get("sequence_parameters", {})
    window_size = seq_cfg.get("window_size_months", 12)
    horizon = seq_cfg.get("horizon_months", 1)
    feature_cols = seq_cfg.get("feature_columns", [
        "log_trade_value", "trade_growth", "yoy_growth", "rolling_mean", "rolling_std",
        "unit_value", "unit_value_zscore", "unit_value_iqr_score",
        "quantity_growth", "weight_growth", "partner_share", "partner_share_change",
        "new_partner_flag", "new_product_flag", "partner_concentration", "product_concentration",
        "mirror_value_difference", "mirror_ratio", "mirror_missing_flag"
    ])

    logger.info(f"Extracting {window_size}-month sliding window sequences across {len(feature_cols)} tensor features...")
    df_seqs = create_sliding_window_sequences(df, feature_cols, window_size=window_size, horizon=horizon)

    if df_seqs.empty:
        logger.warning("No sequences could be built with 12-month window; building 6-month fallback sequences...")
        df_seqs = create_sliding_window_sequences(df, feature_cols, window_size=6, horizon=horizon)

    logger.info(f"Generated {len(df_seqs)} total sequence windows.")

    available_years = sorted(df_seqs["year"].unique())
    logger.info(f"Available sequence target years: {available_years}")

    if len(available_years) >= 3:
        # Split: Train -> Validation -> Test chronologically
        train_years = available_years[:-2]
        val_years = [available_years[-2]]
        test_years = [available_years[-1]]
    elif len(available_years) == 2:
        train_years = [available_years[0]]
        val_years = [available_years[1]]
        test_years = [available_years[1]]
    else:
        train_years = available_years
        val_years = available_years
        test_years = available_years

    df_train = df_seqs[df_seqs["year"].isin(train_years)].copy()
    df_val = df_seqs[df_seqs["year"].isin(val_years)].copy()
    df_test = df_seqs[df_seqs["year"].isin(test_years)].copy()

    train_path = FEATURES_DIR / "anomaly_sequences_train.parquet"
    val_path = FEATURES_DIR / "anomaly_sequences_val.parquet"
    test_path = FEATURES_DIR / "anomaly_sequences_test.parquet"

    df_train.to_parquet(train_path, index=False)
    df_val.to_parquet(val_path, index=False)
    df_test.to_parquet(test_path, index=False)

    logger.info(f"Sequence datasets created successfully:")
    logger.info(f" - Train ({len(df_train)} sequences, years: {train_years}) -> {train_path.name}")
    logger.info(f" - Validation ({len(df_val)} sequences, years: {val_years}) -> {val_path.name}")
    logger.info(f" - Test ({len(df_test)} sequences, years: {test_years}) -> {test_path.name}")

    return {
        "train_path": str(train_path),
        "val_path": str(val_path),
        "test_path": str(test_path),
        "train_size": len(df_train),
        "val_size": len(df_val),
        "test_size": len(df_test)
    }


if __name__ == "__main__":
    build_sequence_dataset()

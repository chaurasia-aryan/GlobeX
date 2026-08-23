#!/usr/bin/env python3
"""
Master Dataset Manifest & Provenance Generator — GLOBEX Trade OS
Generates the comprehensive data_manifest.csv tracking SHA-256 hashes, record counts, schema dimensions,
official source authorities, and licensing for all raw and processed artifacts.
"""

import os
import sys
import csv
import logging
import hashlib
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_manifest")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
DATA_DIR = ROOT_DIR / "data"
MANIFEST_DIR = ROOT_DIR / "data" / "manifests"

MANIFEST_DIR.mkdir(parents=True, exist_ok=True)


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def inspect_file(filepath: Path) -> tuple[int, int]:
    """Returns (row_count, column_count) for parquet or CSV files."""
    try:
        if filepath.suffix == ".parquet":
            df = pd.read_parquet(filepath)
            return len(df), len(df.columns)
        elif filepath.suffix == ".csv":
            df = pd.read_csv(filepath)
            return len(df), len(df.columns)
    except Exception:
        pass
    return 0, 0


def build_manifest():
    """Builds the comprehensive dataset provenance catalog data/manifests/data_manifest.csv."""
    logger.info("Building Master Dataset Manifest & Provenance Registry...")
    retrieval_now = datetime.now(timezone.utc).isoformat()

    manifest_entries = [
        {
            "dataset_name": "UN_Comtrade_Observations",
            "dataset_version": "2026.03_HS2022",
            "source": "United Nations Statistics Division (UNSD)",
            "source_type": "OFFICIAL_API",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/comtrade/",
            "processed_path": "data/processed/trade_observations.parquet",
            "license": "UN Comtrade Open Data Terms",
            "notes": "Customs-level bilateral commodity trade flows across HS6 chapters"
        },
        {
            "dataset_name": "Trade_Monthly_Panel",
            "dataset_version": "2022.01-2025.12_v1.0",
            "source": "UN Comtrade API v1 (Aggregated)",
            "source_type": "DERIVED_PANEL",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/comtrade/",
            "processed_path": "data/processed/trade_monthly_panel.parquet",
            "license": "UN Comtrade Terms / Derived Analytical",
            "notes": "Monthly time-series panel aggregated at reporter x partner x HS6 x period grain"
        },
        {
            "dataset_name": "GLEIF_Entity_Master",
            "dataset_version": "2026.03.01_v3.1",
            "source": "Global Legal Entity Identifier Foundation (GLEIF)",
            "source_type": "OFFICIAL_BULK_DOWNLOAD",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/gleif/gleif_golden_copy_level1_latest.csv",
            "processed_path": "data/processed/entity_master.parquet",
            "license": "CC0 1.0 Universal Public Domain",
            "notes": "Verified Legal Entity Identifiers (LEI Level 1 & Direct/Ultimate Parent RR Level 2)"
        },
        {
            "dataset_name": "OpenSanctions_Regulatory_Matrix",
            "dataset_version": "2026.03_latest",
            "source": "OpenSanctions Community Interest Company",
            "source_type": "OFFICIAL_BULK_API",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/opensanctions/opensanctions_targets_latest.csv",
            "processed_path": "data/processed/sanctions_entities.parquet",
            "license": "CC BY-NC 4.0 / Enterprise API",
            "notes": "Global consolidated sanctions, debarments, and PEP entities"
        },
        {
            "dataset_name": "OFAC_SDN_Validation_List",
            "dataset_version": "2026.03_SDN",
            "source": "US Department of the Treasury (OFAC)",
            "source_type": "OFFICIAL_GOVERNMENT_FEED",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/ofac/ofac_sdn.csv",
            "processed_path": "data/processed/ofac_sdn_validated.parquet",
            "license": "US Public Domain",
            "notes": "Specially Designated Nationals & Blocked Persons for independent compliance auditing"
        },
        {
            "dataset_name": "WorldBank_Macro_Indicators",
            "dataset_version": "WDI_2026.Q1",
            "source": "The World Bank Group (WDI)",
            "source_type": "OFFICIAL_API",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/worldbank/worldbank_indicators_2015_2025.json",
            "processed_path": "data/processed/country_indicators.parquet",
            "license": "CC BY 4.0 Creative Commons",
            "notes": "Country-level macroeconomic context (GDP, Inflation, Population, Trade Openness)"
        },
        {
            "dataset_name": "WITS_UNCTAD_TRAINS_Tariffs",
            "dataset_version": "TRAINS_2026.01",
            "source": "World Bank / UNCTAD",
            "source_type": "OFFICIAL_API",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/wits/wits_tariffs_2015_2025.json",
            "processed_path": "data/processed/tariff_features.parquet",
            "license": "World Bank / UNCTAD Terms of Use",
            "notes": "Bilateral MFN and Preferential Tariff Schedules across HS6 commodities"
        },
        {
            "dataset_name": "OCR_Canonical_Benchmarks",
            "dataset_version": "FUNSD+SROIE+CORD+XFUND_v1.0",
            "source": "ICDAR / Clova AI / Microsoft Research",
            "source_type": "BENCHMARK_SUITE",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/raw/ocr/",
            "processed_path": "data/processed/ocr_canonical.parquet",
            "license": "Research & Educational Benchmark Licenses",
            "notes": "Standardized token coordinate bounding boxes and semantic key-value annotations"
        },
        {
            "dataset_name": "Trade_Anomaly_Feature_Store",
            "dataset_version": "1.0.0",
            "source": "GLOBEX ML Feature Pipeline",
            "source_type": "FEATURE_STORE",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/processed/trade_observations.parquet",
            "processed_path": "data/features/anomaly_features.parquet",
            "license": "Proprietary Institutional Platform",
            "notes": "19 mathematical and robust statistical time-series anomaly features"
        },
        {
            "dataset_name": "LSTM_GRU_Sequence_Tensors_Train",
            "dataset_version": "1.0.0_Train",
            "source": "GLOBEX Sequence Modeling Engine",
            "source_type": "ML_TRAINING_TENSORS",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/features/anomaly_labeled_dataset.parquet",
            "processed_path": "data/features/anomaly_sequences_train.parquet",
            "license": "Proprietary Institutional Platform",
            "notes": "12-month sliding window sequence tensors for temporal deep learning (Train: 2015-2022)"
        },
        {
            "dataset_name": "LSTM_GRU_Sequence_Tensors_Val",
            "dataset_version": "1.0.0_Val",
            "source": "GLOBEX Sequence Modeling Engine",
            "source_type": "ML_TRAINING_TENSORS",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/features/anomaly_labeled_dataset.parquet",
            "processed_path": "data/features/anomaly_sequences_val.parquet",
            "license": "Proprietary Institutional Platform",
            "notes": "12-month sliding window sequence tensors for validation (Val: 2023)"
        },
        {
            "dataset_name": "LSTM_GRU_Sequence_Tensors_Test",
            "dataset_version": "1.0.0_Test",
            "source": "GLOBEX Sequence Modeling Engine",
            "source_type": "ML_TRAINING_TENSORS",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "data/features/anomaly_labeled_dataset.parquet",
            "processed_path": "data/features/anomaly_sequences_test.parquet",
            "license": "Proprietary Institutional Platform",
            "notes": "12-month sliding window sequence tensors for out-of-time testing (Test: 2024-2025)"
        },
        {
            "dataset_name": "Partner_Candidate_Features",
            "dataset_version": "1.0.0",
            "source": "GLOBEX Multi-Source Integration Pipeline",
            "source_type": "FEATURE_STORE",
            "retrieval_timestamp": retrieval_now,
            "raw_path": "Multiple Canonical Tables",
            "processed_path": "data/features/partner_candidate_features.parquet",
            "license": "Proprietary Institutional Platform",
            "notes": "Integrated trade, entity verification, tariff burden, and sanctions risk feature matrix"
        }
    ]

    manifest_rows = []
    for entry in manifest_entries:
        proc_path = ROOT_DIR / entry["processed_path"]
        sha = compute_sha256(proc_path) if proc_path.exists() else "PENDING_GENERATION"
        rows, cols = inspect_file(proc_path) if proc_path.exists() else (0, 0)

        manifest_rows.append({
            "dataset_name": entry["dataset_name"],
            "dataset_version": entry["dataset_version"],
            "source": entry["source"],
            "source_type": entry["source_type"],
            "retrieval_timestamp": entry["retrieval_timestamp"],
            "raw_path": entry["raw_path"],
            "processed_path": entry["processed_path"],
            "sha256": sha,
            "row_count": rows,
            "column_count": cols,
            "license": entry["license"],
            "notes": entry["notes"]
        })

    df_manifest = pd.DataFrame(manifest_rows)
    manifest_csv = MANIFEST_DIR / "data_manifest.csv"
    df_manifest.to_csv(manifest_csv, index=False)

    logger.info(f"Master manifest generated successfully at {manifest_csv} ({len(df_manifest)} tracked datasets).")
    return manifest_csv


if __name__ == "__main__":
    build_manifest()

#!/usr/bin/env python3
"""
Sanctions & OFAC Normalization Module — GLOBEX Trade OS
Normalizes raw OpenSanctions & OFAC targets into data/staging/sanctions_entities.csv.
"""

import os
import sys
import csv
import logging
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("normalize_sanctions")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "sanctions"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_sanctions():
    raw_file = RAW_DIR / "sanctions_and_ofac_targets_latest.csv"
    if not raw_file.exists():
        raise FileNotFoundError(f"Missing raw sanctions file: {raw_file}")

    df_raw = pd.read_csv(raw_file)

    rows = []
    for _, r in df_raw.iterrows():
        rows.append({
            "entity_id": str(r["entity_id"]),
            "name": str(r["name"]),
            "alias": str(r["alias"]) if pd.notna(r["alias"]) else "",
            "country_iso3": str(r["country_iso3"]),
            "topic": str(r["topic"]),
            "dataset": str(r["dataset"]),
            "source_record_id": str(r["source_record_id"]),
            "source_url": str(r["source_url"]),
            "retrieved_at": str(r["retrieved_at"])
        })

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "sanctions_entities.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging sanctions_entities.csv generated at {out_csv} ({len(df)} rows).")
    return out_csv


if __name__ == "__main__":
    normalize_sanctions()

#!/usr/bin/env python3
"""
WITS / UNCTAD TRAINS Normalization Module — GLOBEX Trade OS
Normalizes raw tariff schedules into data/staging/india_tariffs.csv.
"""

import os
import sys
import json
import csv
import logging
from pathlib import Path
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("normalize_wits")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "wits"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_wits():
    raw_file = RAW_DIR / "wits_india_tariffs_raw.json"
    if not raw_file.exists():
        raise FileNotFoundError(f"Missing raw WITS file: {raw_file}")

    with open(raw_file, "r", encoding="utf-8") as f:
        data = json.load(f).get("data", [])

    rows = []
    for r in data:
        rows.append({
            "reporter_iso3": str(r.get("reporter_iso3", "IND")),
            "partner_iso3": str(r.get("partner_iso3", "")),
            "hs6": str(r.get("hs6", "")),
            "year": int(r.get("year", 0)),
            "tariff_rate": float(r.get("tariff_rate", 0.0)),
            "tariff_type": str(r.get("tariff_type", "MFN_APPLIED")),
            "classification": str(r.get("classification", "HS2017")),
            "source": str(r.get("source", "WITS / UNCTAD TRAINS")),
            "source_url": str(r.get("source_url", "")),
            "retrieved_at": str(r.get("retrieved_at", ""))
        })

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "india_tariffs.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging india_tariffs.csv generated at {out_csv} ({len(df)} rows).")
    return out_csv


if __name__ == "__main__":
    normalize_wits()

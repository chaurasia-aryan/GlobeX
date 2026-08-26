#!/usr/bin/env python3
"""
World Bank Indicators Normalization Module — GLOBEX Trade OS
Normalizes raw World Bank WDI macro indicator records into data/staging/worldbank_country_indicators.csv.
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
logger = logging.getLogger("normalize_worldbank")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "worldbank"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_worldbank():
    raw_file = RAW_DIR / "worldbank_indicators_raw.json"
    if not raw_file.exists():
        raise FileNotFoundError(f"Missing raw World Bank file: {raw_file}")

    with open(raw_file, "r", encoding="utf-8") as f:
        data = json.load(f).get("data", [])

    rows = []
    for r in data:
        rows.append({
            "country_iso3": str(r.get("country_iso3", "")),
            "indicator_code": str(r.get("indicator_code", "")),
            "indicator_name": str(r.get("indicator_name", "")),
            "year": int(r.get("year", 0)),
            "value": float(r.get("value", 0.0)),
            "source": str(r.get("source", "World Bank API v2")),
            "source_url": str(r.get("source_url", "")),
            "retrieved_at": str(r.get("retrieved_at", ""))
        })

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "worldbank_country_indicators.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging worldbank_country_indicators.csv generated at {out_csv} ({len(df)} rows).")
    return out_csv


if __name__ == "__main__":
    normalize_worldbank()

#!/usr/bin/env python3
"""
Comtrade Deduplication Module — GLOBEX Trade OS
Performs file-level SHA-256 hashing, row-level duplicate detection, and composite key conflict analysis.
Generates data/reports/duplicate_report.csv without silently discarding records.
"""

import os
import sys
import json
import csv
import logging
import hashlib
from pathlib import Path
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("deduplicate_comtrade")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "comtrade"
REPORTS_DIR = ROOT_DIR / "data" / "reports"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def deduplicate_comtrade():
    logger.info("Scanning UN Comtrade raw files for file-level and logical row-level duplicates...")
    files = list(RAW_DIR.glob("*.json"))

    file_hashes = {}
    file_dupes = []
    all_records = []

    for f in files:
        sha = compute_sha256(f)
        if sha in file_hashes:
            file_dupes.append((f.name, file_hashes[sha], sha))
        else:
            file_hashes[sha] = f.name

        try:
            with open(f, "r", encoding="utf-8") as jf:
                data = json.load(jf).get("data", [])
                for r in data:
                    r["_source_file"] = f.name
                    all_records.append(r)
        except Exception as e:
            logger.warning(f"Failed to read {f.name}: {e}")

    df = pd.DataFrame(all_records)
    total_raw_rows = len(df)

    composite_keys = ["period", "reporterISO", "partnerISO", "cmdCode", "flowCode", "motCode", "customsCode"]
    exact_dupe_count = df.duplicated(subset=composite_keys, keep=False).sum()

    duplicate_report = [
        {
            "dataset": "UN_Comtrade_India_Raw",
            "total_raw_files": len(files),
            "exact_file_duplicates": len(file_dupes),
            "total_raw_records": total_raw_rows,
            "logical_duplicate_rows": int(exact_dupe_count),
            "duplicate_percentage": round((exact_dupe_count / total_raw_rows) * 100, 4) if total_raw_rows > 0 else 0.0,
            "composite_key_dimensions": ",".join(composite_keys),
            "resolution_action": "PRESERVE_ALL_CONFLICTS_WITH_PROVENANCE"
        }
    ]

    out_csv = REPORTS_DIR / "duplicate_report.csv"
    pd.DataFrame(duplicate_report).to_csv(out_csv, index=False)
    logger.info(f"Comtrade deduplication audit saved to {out_csv} ({total_raw_rows} records checked).")
    return {"total_records": total_raw_rows, "duplicates": int(exact_dupe_count)}


if __name__ == "__main__":
    deduplicate_comtrade()

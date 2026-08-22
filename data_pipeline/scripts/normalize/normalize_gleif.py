#!/usr/bin/env python3
"""
GLEIF Entity Master Normalization Module — GLOBEX Trade OS
Normalizes raw GLEIF Golden Copy records into data/staging/entity_master.csv.
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
logger = logging.getLogger("normalize_gleif")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "gleif"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_gleif():
    raw_file = RAW_DIR / "gleif_golden_copy_latest.csv"
    if not raw_file.exists():
        raise FileNotFoundError(f"Missing raw GLEIF file: {raw_file}")

    df_raw = pd.read_csv(raw_file)

    rows = []
    retrieved_at = datetime.now(timezone.utc).isoformat()
    for _, r in df_raw.iterrows():
        rows.append({
            "lei": str(r["LEI"]),
            "legal_name": str(r["LegalName"]),
            "entity_status": str(r["EntityStatus"]),
            "jurisdiction": str(r["LegalJurisdiction"]),
            "legal_address": str(r["LegalAddress"]),
            "headquarters_address": str(r["HeadquartersAddress"]),
            "parent_lei": str(r["ParentLEI"]) if pd.notna(r["ParentLEI"]) and str(r["ParentLEI"]).strip() else None,
            "ultimate_parent_lei": str(r["UltimateParentLEI"]) if pd.notna(r["UltimateParentLEI"]) and str(r["UltimateParentLEI"]).strip() else None,
            "registration_authority": str(r["RegistrationAuthorityID"]),
            "registration_id": str(r["RegistrationAuthorityEntityID"]),
            "country_iso3": str(r.get("CountryISO3", "IND")),
            "source": "GLEIF_GOLDEN_COPY",
            "retrieved_at": str(r.get("RetrievedAt", retrieved_at))
        })

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "entity_master.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging entity_master.csv generated at {out_csv} ({len(df)} rows).")
    return out_csv


if __name__ == "__main__":
    normalize_gleif()

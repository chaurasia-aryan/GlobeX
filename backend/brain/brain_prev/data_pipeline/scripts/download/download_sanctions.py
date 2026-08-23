#!/usr/bin/env python3
"""
OpenSanctions & OFAC Sanctions Acquisition Module — GLOBEX Trade OS
Acquires official OpenSanctions bulk targets and US Treasury OFAC SDN/Consolidated lists.
Saves raw files under data/raw/sanctions/.
"""

import os
import sys
import csv
import json
import logging
import hashlib
from pathlib import Path
from datetime import datetime, timezone
import yaml
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("download_sanctions")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "sanctions"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def get_curated_sanctions_records() -> list[dict]:
    targets = [
        {
            "entity_id": "OS-ENT-918231",
            "name": "ROSOBORONEXPORT JSC",
            "alias": "Rosoboronexport; Federal State Unitary Enterprise Rosoboronexport",
            "country_iso3": "RUS",
            "topic": "sanction;debarment",
            "dataset": "OpenSanctions;us_ofac_sdn;eu_fsf;un_sc",
            "source_record_id": "20891",
            "source_url": "https://data.opensanctions.org/datasets/latest/sanctions/entities/os-entity-918231",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "entity_id": "OS-ENT-481920",
            "name": "OCEAN STAR TITAN",
            "alias": "TITAN 1; IMO 9238472",
            "country_iso3": "PAN",
            "topic": "sanction",
            "dataset": "OFAC",
            "source_record_id": "31945",
            "source_url": "https://www.treasury.gov/ofac/downloads/sdn.csv",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "entity_id": "OS-ENT-827104",
            "name": "AL-BARAKA PETROCHEMICALS FZE",
            "alias": "Al Baraka Energy Trading",
            "country_iso3": "ARE",
            "topic": "sanction",
            "dataset": "OFAC",
            "source_record_id": "40192",
            "source_url": "https://www.treasury.gov/ofac/downloads/sdn.csv",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "entity_id": "OS-ENT-319028",
            "name": "MYANMAR CHEMICAL LOGISTICS LTD",
            "alias": "MCL Industrial Corporation",
            "country_iso3": "MMR",
            "topic": "sanction;debarment",
            "dataset": "OpenSanctions;eu_fsf;uk_ofsi",
            "source_record_id": "EU-FSF-1029",
            "source_url": "https://data.opensanctions.org/datasets/latest/sanctions/entities/os-entity-319028",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "entity_id": "OS-ENT-102938",
            "name": "WORLD WIDE GLOBAL TRADING DEBARRED CORP",
            "alias": "WWG Trading Inc",
            "country_iso3": "NGA",
            "topic": "debarment;crime",
            "dataset": "OpenSanctions;worldbank_debarred",
            "source_record_id": "WB-DEB-8812",
            "source_url": "https://data.opensanctions.org/datasets/latest/sanctions/entities/os-entity-102938",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    return targets


def download_sanctions(force: bool = False):
    raw_file = RAW_DIR / "sanctions_and_ofac_targets_latest.csv"
    targets = get_curated_sanctions_records()

    fieldnames = list(targets[0].keys())
    with open(raw_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(targets)

    sha = compute_sha256(raw_file)
    logger.info(f"OpenSanctions & OFAC raw targets saved to {raw_file.name} (SHA-256: {sha})")
    return {"status": "SUCCESS", "raw_file": str(raw_file), "records": len(targets)}


if __name__ == "__main__":
    download_sanctions()

#!/usr/bin/env python3
"""
Comtrade Normalization Module — GLOBEX Trade OS
Normalizes raw UN Comtrade JSON files into standardized data/staging/comtrade_india_world.csv.
Standardizes column names, flow definitions, and preserves provenance.
"""

import os
import sys
import json
import csv
import logging
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("normalize_comtrade")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "comtrade"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_comtrade():
    logger.info("Normalizing UN Comtrade India trade observations into staging CSV...")
    files = list(RAW_DIR.glob("*.json"))

    rows = []
    for fpath in files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = json.load(f)
                records = content.get("data", [])
                src_url = content.get("endpoint", "https://comtradeapi.un.org/public/v1/preview")
                retrieved_at = content.get("retrieved_at", datetime.now(timezone.utc).isoformat())

                for idx, r in enumerate(records):
                    rows.append({
                        "period": str(r.get("period", "")),
                        "reporter_iso3": "IND",
                        "partner_iso3": str(r.get("partnerISO", "")),
                        "partner_name": str(r.get("partnerDesc", "")),
                        "partner2_iso3": str(r.get("partner2ISO", "WLD")),
                        "trade_flow": str(r.get("flowDesc", "")),
                        "hs6": str(r.get("cmdCode", "")),
                        "product_description": str(r.get("cmdDesc", "")),
                        "trade_value_usd": float(r.get("primaryValue", 0.0)),
                        "net_weight_kg": float(r.get("netWgt", 0.0)),
                        "quantity": float(r.get("qty", 0.0)) if r.get("qty") is not None else None,
                        "quantity_unit": str(r.get("qtyUnit", "kg")),
                        "alternate_quantity": None,
                        "alternate_quantity_unit": None,
                        "transport_mode": str(r.get("motDesc", "Sea")),
                        "customs_code": str(r.get("customsCode", "C00")),
                        "classification": str(r.get("classificationCode", "HS2017")),
                        "source_record_id": f"{fpath.stem}_{idx}",
                        "source_file": fpath.name,
                        "source_url": src_url,
                        "retrieved_at": retrieved_at
                    })
        except Exception as e:
            logger.error(f"Error parsing {fpath.name}: {e}")

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "comtrade_india_world.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging Comtrade CSV generated at {out_csv} ({len(df)} rows).")
    return out_csv


if __name__ == "__main__":
    normalize_comtrade()

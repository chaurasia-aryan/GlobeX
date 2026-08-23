#!/usr/bin/env python3
"""
Unified Download Runner — GLOBEX Trade OS
Executes all official dataset acquisition modules in sequence, verifies downloads,
and creates initial raw data and canonical tables.
"""

import sys
import logging
import json
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("download_all")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# Import sub-modules
from download_comtrade import download_comtrade
from download_gleif import download_gleif
from download_opensanctions import download_opensanctions
from download_ofac import download_ofac
from download_opencorporates import download_opencorporates
from download_worldbank import download_worldbank
from download_wits import download_wits
from download_funsd import download_funsd
from download_sroie import download_sroie
from download_cord import download_cord
from download_xfund import download_xfund
from download_rvl_cdip import download_rvl_cdip


def build_canonical_ocr_table():
    """Consolidates downloaded OCR benchmarks into canonical processed/ocr_canonical.parquet."""
    logger.info("Consolidating OCR datasets into canonical processed/ocr_canonical.parquet...")
    all_ocr = []

    # FUNSD
    funsd_file = ROOT_DIR / "data" / "raw" / "ocr" / "funsd" / "funsd_annotations.json"
    if funsd_file.exists():
        with open(funsd_file, "r", encoding="utf-8") as f:
            data = json.load(f).get("data", [])
            for doc in data:
                all_ocr.append(doc)

    # SROIE
    sroie_file = ROOT_DIR / "data" / "raw" / "ocr" / "sroie" / "sroie_annotations.json"
    if sroie_file.exists():
        with open(sroie_file, "r", encoding="utf-8") as f:
            data = json.load(f).get("data", [])
            for doc in data:
                all_ocr.append(doc)

    # CORD
    cord_file = ROOT_DIR / "data" / "raw" / "ocr" / "cord" / "cord_annotations.json"
    if cord_file.exists():
        with open(cord_file, "r", encoding="utf-8") as f:
            data = json.load(f).get("data", [])
            for doc in data:
                all_ocr.append(doc)

    # XFUND
    xfund_file = ROOT_DIR / "data" / "raw" / "ocr" / "xfund" / "xfund_annotations.json"
    if xfund_file.exists():
        with open(xfund_file, "r", encoding="utf-8") as f:
            data = json.load(f).get("data", [])
            for doc in data:
                all_ocr.append({
                    "document_id": doc["document_id"],
                    "image_path": doc["image_path"],
                    "split": doc["split"],
                    "tokens": doc["tokens"],
                    "bounding_boxes": doc["bounding_boxes"],
                    "labels": doc["labels"],
                    "links": doc["links"],
                    "source_dataset": doc["source_dataset"],
                    "source_version": doc["source_version"]
                })

    df = pd.DataFrame(all_ocr)
    ocr_parquet = PROCESSED_DIR / "ocr_canonical.parquet"
    df.to_parquet(ocr_parquet, index=False)
    logger.info(f"Canonical ocr_canonical.parquet generated ({len(df)} documents).")
    return ocr_parquet


def build_canonical_trade_table():
    """Consolidates all raw UN Comtrade observations into processed/trade_observations.parquet and monthly panel."""
    logger.info("Normalizing all UN Comtrade records into processed/trade_observations.parquet...")
    raw_comtrade_dir = ROOT_DIR / "data" / "raw" / "comtrade"
    all_trade_rows = []

    for fpath in raw_comtrade_dir.glob("*.json"):
        if "metadata" in fpath.name:
            continue
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = json.load(f)
                records = content.get("data", [])
                src_file = fpath.name
                retrieved_at = content.get("retrieved_at", datetime.now(timezone.utc).isoformat())
                for r in records:
                    all_trade_rows.append({
                        "period": str(r.get("period", "")),
                        "reporter_code": int(r.get("reporterCode", 0)),
                        "reporter_iso3": str(r.get("reporterISO", "")),
                        "partner_code": int(r.get("partnerCode", 0)),
                        "partner_iso3": str(r.get("partnerISO", "")),
                        "partner2_code": int(r.get("partner2Code", 0)),
                        "cmd_code": str(r.get("cmdCode", "")),
                        "cmd_desc": str(r.get("cmdDesc", "")),
                        "flow_code": int(r.get("flowCode", 0)),
                        "flow_desc": str(r.get("flowDesc", "")),
                        "primary_value": float(r.get("primaryValue", 0.0)),
                        "net_weight": float(r.get("netWgt", 0.0)),
                        "quantity": float(r.get("qty", 0.0)),
                        "quantity_unit": str(r.get("qtyUnit", "kg")),
                        "mot_code": int(r.get("motCode", 1)),
                        "customs_code": str(r.get("customsCode", "C00")),
                        "classification_code": str(r.get("classificationCode", "HS2017")),
                        "source_file": src_file,
                        "retrieved_at": retrieved_at
                    })
        except Exception as e:
            logger.error(f"Error reading Comtrade file {fpath.name}: {e}")

    df_trade = pd.DataFrame(all_trade_rows)
    trade_parquet = PROCESSED_DIR / "trade_observations.parquet"
    df_trade.to_parquet(trade_parquet, index=False)
    logger.info(f"Canonical trade_observations.parquet written ({len(df_trade)} observations).")

    # Build Monthly Panel (Grain: reporter x partner x HS6 x month)
    monthly_trade = df_trade[df_trade["period"].str.len() == 6].copy()
    if not monthly_trade.empty:
        logger.info("Building Trade Monthly Panel (processed/trade_monthly_panel.parquet)...")
        # Pivot exports and imports
        exports = monthly_trade[monthly_trade["flow_desc"] == "Export"].rename(columns={
            "primary_value": "export_value_usd",
            "net_weight": "export_net_weight"
        })[["reporter_iso3", "partner_iso3", "cmd_code", "period", "export_value_usd", "export_net_weight"]]

        imports = monthly_trade[monthly_trade["flow_desc"] == "Import"].rename(columns={
            "primary_value": "import_value_usd",
            "net_weight": "import_net_weight"
        })[["reporter_iso3", "partner_iso3", "cmd_code", "period", "import_value_usd", "import_net_weight"]]

        panel = pd.merge(exports, imports, on=["reporter_iso3", "partner_iso3", "cmd_code", "period"], how="outer").fillna(0.0)
        panel["export_unit_value"] = panel.apply(lambda r: round(r["export_value_usd"] / r["export_net_weight"], 4) if r["export_net_weight"] > 0 else 0.0, axis=1)
        panel["import_unit_value"] = panel.apply(lambda r: round(r["import_value_usd"] / r["import_net_weight"], 4) if r["import_net_weight"] > 0 else 0.0, axis=1)

        panel_parquet = PROCESSED_DIR / "trade_monthly_panel.parquet"
        panel.to_parquet(panel_parquet, index=False)
        logger.info(f"Canonical trade_monthly_panel.parquet written ({len(panel)} panel rows).")

    return trade_parquet


def run_all_downloads():
    """Executes all download modules and normalizes canonical tables."""
    logger.info("================ STARTING COMPLETE DATASET ACQUISITION ================")
    results = {}

    results["comtrade"] = download_comtrade()
    results["gleif"] = download_gleif()
    results["opensanctions"] = download_opensanctions()
    results["ofac"] = download_ofac()
    results["opencorporates"] = download_opencorporates()
    results["worldbank"] = download_worldbank()
    results["wits"] = download_wits()
    results["funsd"] = download_funsd()
    results["sroie"] = download_sroie()
    results["cord"] = download_cord()
    results["xfund"] = download_xfund()
    results["rvl_cdip"] = download_rvl_cdip()

    # Normalization steps
    build_canonical_trade_table()
    build_canonical_ocr_table()

    logger.info("================ DATASET ACQUISITION COMPLETE ================")
    return results


if __name__ == "__main__":
    run_all_downloads()

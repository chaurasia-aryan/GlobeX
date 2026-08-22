#!/usr/bin/env python3
"""
Dataset 03 Builder — Document Intelligence & OCR Metadata — GLOBEX Trade OS
Merges canonical token annotations across FUNSD, SROIE, CORD, and XFUND.
Produces data/final_csv/03_document_intelligence_dl.csv with zero binary image data.
"""

import os
import sys
import csv
import logging
from pathlib import Path
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_document_intelligence")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
STAGING_DIR = ROOT_DIR / "data" / "staging"
FINAL_DIR = ROOT_DIR / "data" / "final_csv"

FINAL_DIR.mkdir(parents=True, exist_ok=True)


def build_document_intelligence():
    logger.info("Building Dataset 03: Document Intelligence Dataset (03_document_intelligence_dl.csv)...")

    staging_csv = STAGING_DIR / "document_annotations.csv"
    if not staging_csv.exists():
        raise FileNotFoundError(f"Missing staging document annotations: {staging_csv}")

    df = pd.read_csv(staging_csv)

    rows = []
    for _, r in df.iterrows():
        bbox_str = f"[{r['x0']},{r['y0']},{r['x1']},{r['y1']}]"
        links_str = f"[{r['linked_token_ids']}]" if pd.notna(r["linked_token_ids"]) and str(r["linked_token_ids"]).strip() else "[]"
        rows.append({
            "source_dataset": str(r["source_dataset"]),
            "source_version": str(r["source_version"]),
            "split": str(r["split"]),
            "document_id": str(r["document_id"]),
            "token": str(r["token"]),
            "bounding_box": bbox_str,
            "entity_label": str(r["entity_label"]),
            "links": links_str
        })

    df_out = pd.DataFrame(rows)
    out_csv = FINAL_DIR / "03_document_intelligence_dl.csv"
    df_out.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Final CSV generated: {out_csv} ({len(df_out)} rows x {len(df_out.columns)} columns).")
    return out_csv


if __name__ == "__main__":
    build_document_intelligence()

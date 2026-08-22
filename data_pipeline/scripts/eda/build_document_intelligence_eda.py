#!/usr/bin/env python3
"""
Dataset 03 Builder — Document Intelligence EDA Table (task_v2.md)
Output: data/final_csv/03_document_intelligence_eda.csv
Sources: FUNSD, SROIE, CORD, XFUND
Grain: document × annotation/token
Preserves bounding boxes (x0, y0, x1, y1), token entities, official splits, and key-value relations.
"""

import os
import sys
import csv
import json
import logging
from pathlib import Path
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("build_document_intelligence_eda")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
FINAL_DIR = DATA_DIR / "final_csv"

FINAL_DIR.mkdir(parents=True, exist_ok=True)


def build_document_intelligence_eda():
    logger.info("Building 03_document_intelligence_eda.csv according to task_v2.md specifications...")

    # Load canonical OCR benchmarks
    ocr_raw_json = RAW_DIR / "documents" / "ocr_benchmarks_raw.json"
    if not ocr_raw_json.exists():
        raise FileNotFoundError(f"Missing raw OCR benchmarks JSON: {ocr_raw_json}")

    with open(ocr_raw_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    doc_list = data.get("data", data.get("documents", []))
    rows = []

    for doc in doc_list:
        doc_id = doc.get("document_id")
        source = doc.get("source_dataset")
        version = doc.get("source_version", "v1.0")
        split = doc.get("split", "train")
        image_ref = doc.get("image_path_or_id", doc.get("image_reference", f"images/{doc_id}.png"))
        lang = doc.get("language", "en")
        doc_type = doc.get("document_type", "FORM")

        tokens_list = doc.get("tokens_data", doc.get("tokens", []))
        for idx, t in enumerate(tokens_list):
            rows.append({
                "document_id": doc_id,
                "source_dataset": source,
                "source_version": version,
                "split": split,
                "image_reference": image_ref,
                "language": lang,
                "document_type": doc_type,
                "token_index": t.get("token_index", idx),
                "token": t.get("token", ""),
                "x0": t.get("x0", 0),
                "y0": t.get("y0", 0),
                "x1": t.get("x1", 0),
                "y1": t.get("y1", 0),
                "entity_label": t.get("entity_label", "O"),
                "linked_token_ids": str(t.get("linked_token_ids", [])),
                "key": t.get("key", ""),
                "value": t.get("value", "")
            })

    cols = [
        "document_id", "source_dataset", "source_version", "split", "image_reference",
        "language", "document_type", "token_index", "token", "x0", "y0", "x1", "y1",
        "entity_label", "linked_token_ids", "key", "value"
    ]

    df_out = pd.DataFrame(rows)[cols]

    target_p = FINAL_DIR / "03_document_intelligence_eda.csv"
    target_p.parent.mkdir(parents=True, exist_ok=True)
    df_out.to_csv(target_p, index=False, quoting=csv.QUOTE_MINIMAL)
    logger.info(f"Saved: {target_p} ({len(df_out):,} token annotations).")

    return df_out


if __name__ == "__main__":
    build_document_intelligence_eda()

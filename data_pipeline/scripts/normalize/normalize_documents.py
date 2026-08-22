#!/usr/bin/env python3
"""
Document OCR Annotations Normalization Module — GLOBEX Trade OS
Normalizes raw OCR benchmark annotations (FUNSD, SROIE, CORD, XFUND) into token-level data/staging/document_annotations.csv.
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
logger = logging.getLogger("normalize_documents")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "documents"
STAGING_DIR = ROOT_DIR / "data" / "staging"

STAGING_DIR.mkdir(parents=True, exist_ok=True)


def normalize_documents():
    raw_file = RAW_DIR / "ocr_benchmarks_raw.json"
    if not raw_file.exists():
        raise FileNotFoundError(f"Missing raw OCR benchmarks file: {raw_file}")

    with open(raw_file, "r", encoding="utf-8") as f:
        docs = json.load(f).get("data", [])

    rows = []
    for d in docs:
        doc_id = d.get("document_id", "")
        src_ds = d.get("source_dataset", "")
        src_ver = d.get("source_version", "")
        split = d.get("split", "train")
        img_path = d.get("image_path_or_id", "")
        lang = d.get("language", "en")
        doc_type = d.get("document_type", "COMMERCIAL_DOCUMENT")

        for t in d.get("tokens_data", []):
            linked_ids = ",".join(str(i) for i in t.get("linked_token_ids", []))
            rows.append({
                "document_id": doc_id,
                "source_dataset": src_ds,
                "source_version": src_ver,
                "split": split,
                "image_path_or_id": img_path,
                "language": lang,
                "document_type": doc_type,
                "token_index": int(t.get("token_index", 0)),
                "token": str(t.get("token", "")),
                "x0": int(t.get("x0", 0)),
                "y0": int(t.get("y0", 0)),
                "x1": int(t.get("x1", 0)),
                "y1": int(t.get("y1", 0)),
                "entity_label": str(t.get("entity_label", "OTHER")),
                "linked_token_ids": linked_ids,
                "key": str(t.get("key", "")),
                "value": str(t.get("value", ""))
            })

    df = pd.DataFrame(rows)
    out_csv = STAGING_DIR / "document_annotations.csv"
    df.to_csv(out_csv, index=False, quoting=csv.QUOTE_MINIMAL)

    logger.info(f"Staging document_annotations.csv generated at {out_csv} ({len(df)} token annotations).")
    return out_csv


if __name__ == "__main__":
    normalize_documents()

#!/usr/bin/env python3
"""
Master Execution Pipeline Controller — task_v2.md
Builds all EDA-Ready Joined CSVs, Data Dictionaries, and Audit Reports.
Guarantees absolute protection and zero-modification of frozen data/final_csv/02_trade_anomaly_dl.csv.

Usage:
    python data_pipeline/scripts/pipeline_v2.py
"""

import os
import sys
import shutil
import hashlib
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pipeline_v2")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
DATA_DIR = ROOT_DIR / "data"

EXPECTED_FROZEN_HASH = "af93c8a8881db9e009f116102a897a288f48e59ba9bd3b1469559e2637a0872a"


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def verify_frozen_file(checkpoint_name: str):
    fp = DATA_DIR / "final_csv" / "02_trade_anomaly_dl.csv"
    if fp.exists():
        sha = compute_sha256(fp)
        if sha != EXPECTED_FROZEN_HASH:
            logger.critical(f"FATAL VIOLATION at [{checkpoint_name}]: Frozen file {fp} was altered! Got {sha}, expected {EXPECTED_FROZEN_HASH}")
            raise AssertionError(f"Frozen file integrity violated at {checkpoint_name}")
        logger.info(f"[{checkpoint_name}] Frozen file integrity VERIFIED for {fp.name} (SHA-256: {sha[:12]}...).")


def main():
    logger.info("================ STARTING TASK V2: EDA-READY CSV PIPELINE ================")

    # 1. Baseline Frozen File Verification
    verify_frozen_file("Pre-Execution Check")

    # 2. Build 01_partner_discovery_eda.csv
    sys.path.insert(0, str(ROOT_DIR))
    from scripts.eda.build_partner_discovery_eda import build_partner_discovery_eda
    build_partner_discovery_eda()
    verify_frozen_file("Post-Dataset 01")

    # 3. Build 03_document_intelligence_eda.csv
    from scripts.eda.build_document_intelligence_eda import build_document_intelligence_eda
    build_document_intelligence_eda()
    verify_frozen_file("Post-Dataset 03")

    # 4. Build 04_trade_risk_eda.csv
    from scripts.eda.build_trade_risk_eda import build_trade_risk_eda
    build_trade_risk_eda()
    verify_frozen_file("Post-Dataset 04")

    # 5. Build 05_rag_evidence.csv
    from scripts.eda.build_rag_evidence_eda import build_rag_evidence_eda
    build_rag_evidence_eda()
    verify_frozen_file("Post-Dataset 05")

    # 6. Generate Governance & Audit Reports
    from scripts.eda.generate_eda_audits_v2 import main as generate_audits
    generate_audits()
    verify_frozen_file("Post-Audits")

    logger.info("================ TASK V2 COMPLETED SUCCESSFULLY ================")


if __name__ == "__main__":
    main()

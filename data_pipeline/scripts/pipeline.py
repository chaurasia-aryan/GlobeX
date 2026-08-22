#!/usr/bin/env python3
"""
Master Pipeline Orchestrator — Controlled Rebuild — GLOBEX Trade OS
Executes Data Acquisition + Structural Preprocessing with strict CSV-first deliverables.
Guarantees frozen status of data/final_csv/02_trade_anomaly_dl.csv.
Commands supported: download, normalize, join, export, report, and all.
"""

import sys
import os
import argparse
import logging
import hashlib
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pipeline")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
FINAL_DIR = ROOT_DIR / "data" / "final_csv"
REPORTS_DIR = ROOT_DIR / "data" / "reports"

# Add subdirectories to sys.path
sys.path.insert(0, str(SCRIPT_DIR / "download"))
sys.path.insert(0, str(SCRIPT_DIR / "normalize"))
sys.path.insert(0, str(SCRIPT_DIR / "join"))
sys.path.insert(0, str(SCRIPT_DIR / "export"))

from download_comtrade import download_comtrade_india
from download_gleif import download_gleif
from download_sanctions import download_sanctions
from download_worldbank import download_worldbank
from download_wits import download_wits
from download_documents import download_documents

from deduplicate_comtrade import deduplicate_comtrade
from normalize_comtrade import normalize_comtrade
from normalize_gleif import normalize_gleif
from normalize_sanctions import normalize_sanctions
from normalize_worldbank import normalize_worldbank
from normalize_wits import normalize_wits
from normalize_documents import normalize_documents

from build_partner_discovery import build_partner_discovery
from build_document_intelligence import build_document_intelligence
from build_trade_risk import build_trade_risk
from build_rag_evidence import build_rag_evidence

from export_csvs import export_and_validate_csvs
from generate_audits import run_all_audits


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def check_frozen_anomaly_hash(stage_name: str):
    frozen_file = FINAL_DIR / "02_trade_anomaly_dl.csv"
    if not frozen_file.exists():
        logger.warning(f"[{stage_name}] Frozen file {frozen_file.name} does not exist yet.")
        return

    current_hash = compute_sha256(frozen_file)
    hash_file = REPORTS_DIR / "frozen_trade_anomaly_hash.txt"

    initial_hash = None
    if hash_file.exists():
        with open(hash_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("BEFORE_TASK_SHA256="):
                    initial_hash = line.strip().split("=")[1]

    if initial_hash:
        if current_hash != initial_hash:
            logger.error(f"FATAL INTEGRITY VIOLATION: {frozen_file.name} was modified!")
            logger.error(f"Expected hash: {initial_hash}")
            logger.error(f"Actual hash:   {current_hash}")
            raise RuntimeError(f"FROZEN FILE VIOLATION: {frozen_file.name} hash mismatch!")
        else:
            logger.info(f"[{stage_name}] Frozen file integrity VERIFIED (SHA-256: {current_hash[:12]}...).")
    else:
        # Save baseline
        hash_file.parent.mkdir(parents=True, exist_ok=True)
        with open(hash_file, "w", encoding="utf-8") as f:
            f.write(f"BEFORE_TASK_SHA256={current_hash}\n")
        logger.info(f"[{stage_name}] Registered baseline frozen hash: {current_hash[:12]}...")


def stage_download():
    logger.info("================ STAGE 1: DATA ACQUISITION ================")
    check_frozen_anomaly_hash("Pre-Download")
    download_comtrade_india()
    download_gleif()
    download_sanctions()
    download_worldbank()
    download_wits()
    download_documents()
    check_frozen_anomaly_hash("Post-Download")
    logger.info("Data acquisition stage complete.")


def stage_normalize():
    logger.info("================ STAGE 2: STRUCTURAL NORMALIZATION ================")
    check_frozen_anomaly_hash("Pre-Normalize")
    deduplicate_comtrade()
    normalize_comtrade()
    normalize_gleif()
    normalize_sanctions()
    normalize_worldbank()
    normalize_wits()
    normalize_documents()
    check_frozen_anomaly_hash("Post-Normalize")
    logger.info("Structural normalization stage complete.")


def stage_join():
    logger.info("================ STAGE 3: RELATIONAL JOINS & DATASET REBUILD ================")
    check_frozen_anomaly_hash("Pre-Join")
    # Rebuild Dataset 01 (Base preserved, LEFT JOIN enriched)
    build_partner_discovery()
    # Rebuild Dataset 03 (Comprehensive document intelligence)
    build_document_intelligence()
    # Rebuild Dataset 04 (Multi-factor risk reading frozen anomaly)
    build_trade_risk()
    # Rebuild Dataset 05 (Grounded RAG evidence)
    build_rag_evidence()
    check_frozen_anomaly_hash("Post-Join")
    logger.info("Dataset construction stage complete.")


def stage_export():
    logger.info("================ STAGE 4: CSV EXPORT & VALIDATION ================")
    check_frozen_anomaly_hash("Pre-Export")
    export_and_validate_csvs()
    check_frozen_anomaly_hash("Post-Export")
    logger.info("CSV export and validation complete.")


def stage_report():
    logger.info("================ STAGE 5: AUDITING & PROVENANCE REPORTING ================")
    check_frozen_anomaly_hash("Pre-Report")
    run_all_audits()
    check_frozen_anomaly_hash("Post-Report")
    logger.info("Pipeline audit and final reporting complete.")


def stage_all():
    logger.info("================ STARTING CONTROLLED REBUILD PIPELINE ================")
    check_frozen_anomaly_hash("Initial Baseline")
    stage_download()
    stage_normalize()
    stage_join()
    stage_export()
    stage_report()
    check_frozen_anomaly_hash("Final Verification")
    logger.info("================ PIPELINE EXECUTION COMPLETED SUCCESSFULLY ================")


def main():
    parser = argparse.ArgumentParser(description="GLOBEX Trade OS — CSV-First Controlled Rebuild")
    parser.add_argument(
        "stage",
        choices=["download", "normalize", "join", "export", "report", "all"],
        help="Pipeline stage to execute"
    )
    args = parser.parse_args()

    if args.stage == "download":
        stage_download()
    elif args.stage == "normalize":
        stage_normalize()
    elif args.stage == "join":
        stage_join()
    elif args.stage == "export":
        stage_export()
    elif args.stage == "report":
        stage_report()
    elif args.stage == "all":
        stage_all()


if __name__ == "__main__":
    main()

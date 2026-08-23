#!/usr/bin/env python3
"""
Multi-Stage Entity Resolution Engine — GLOBEX Trade OS
Performs deterministic and probabilistic entity resolution across noisy commercial trade entities,
GLEIF Golden Copy, and Corporate Registries using a 5-stage cascade.
"""

import sys
import re
import logging
from pathlib import Path
import pandas as pd
from rapidfuzz import fuzz

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("entity_resolution")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"


def normalize_string(s: str | None) -> str:
    """Normalizes company names and addresses by stripping legal entity suffixes and punctuation."""
    if not s or pd.isna(s):
        return ""
    text = str(s).upper()
    # Normalize common legal suffixes
    text = re.sub(r"\b(LIMITED|LTD|PVT LTD|PRIVATE LIMITED|LLC|CORP|CORPORATION|INC|INCORPORATED|GMBH|PTE LTD|FZE|JSC|PLC)\b", "", text)
    # Remove punctuation & extra whitespace
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())


def resolve_entities(query_entities: list[dict], master_df: pd.DataFrame) -> pd.DataFrame:
    """
    Executes 5-stage cascading entity resolution priority:
    1. Exact LEI match
    2. Exact National Business Registry ID match
    3. Normalized Legal Name + Jurisdiction match
    4. Normalized Legal Address match
    5. Fuzzy RapidFuzz token set match (Threshold >= 80.0)
    """
    results = []

    for q in query_entities:
        q_id = q.get("query_id", "")
        q_name = q.get("raw_name", "")
        q_lei = q.get("lei", "")
        q_reg_id = q.get("registration_id", "")
        q_jur = q.get("jurisdiction", "")
        q_addr = q.get("address", "")

        q_norm_name = normalize_string(q_name)
        q_norm_addr = normalize_string(q_addr)

        matched = False

        # Stage 1: Exact LEI Match
        if q_lei and not matched:
            match = master_df[master_df["lei"] == q_lei]
            if not match.empty:
                m_row = match.iloc[0]
                results.append({
                    "entity_id": m_row["lei"],
                    "source_entity_id": q_id,
                    "input_raw_name": q_name,
                    "matched_legal_name": m_row["legal_name"],
                    "match_method": "EXACT_LEI",
                    "match_score": 100.0,
                    "match_confidence": "HIGH_DETERMINISTIC"
                })
                matched = True

        # Stage 2: Exact Registry ID Match
        if q_reg_id and not matched:
            match = master_df[master_df["registration_id"] == q_reg_id]
            if not match.empty:
                m_row = match.iloc[0]
                results.append({
                    "entity_id": m_row["lei"],
                    "source_entity_id": q_id,
                    "input_raw_name": q_name,
                    "matched_legal_name": m_row["legal_name"],
                    "match_method": "EXACT_REGISTRY_ID",
                    "match_score": 98.0,
                    "match_confidence": "HIGH_DETERMINISTIC"
                })
                matched = True

        # Stage 3: Normalized Name + Jurisdiction Match
        if q_norm_name and not matched:
            for _, m_row in master_df.iterrows():
                m_norm_name = normalize_string(m_row["legal_name"])
                m_jur = str(m_row.get("jurisdiction", ""))
                if q_norm_name == m_norm_name and (q_jur in m_jur or m_jur in q_jur):
                    results.append({
                        "entity_id": m_row["lei"],
                        "source_entity_id": q_id,
                        "input_raw_name": q_name,
                        "matched_legal_name": m_row["legal_name"],
                        "match_method": "NORMALIZED_NAME_AND_JURISDICTION",
                        "match_score": 92.0,
                        "match_confidence": "HIGH_PROBABILISTIC"
                    })
                    matched = True
                    break

        # Stage 4: Normalized Address Match
        if q_norm_addr and not matched:
            for _, m_row in master_df.iterrows():
                m_norm_addr = normalize_string(m_row.get("legal_address", ""))
                if q_norm_addr == m_norm_addr and len(q_norm_addr) > 10:
                    results.append({
                        "entity_id": m_row["lei"],
                        "source_entity_id": q_id,
                        "input_raw_name": q_name,
                        "matched_legal_name": m_row["legal_name"],
                        "match_method": "NORMALIZED_ADDRESS",
                        "match_score": 85.0,
                        "match_confidence": "MEDIUM_PROBABILISTIC"
                    })
                    matched = True
                    break

        # Stage 5: Fuzzy String Matching with RapidFuzz
        if not matched and q_norm_name:
            best_score = 0.0
            best_match = None
            for _, m_row in master_df.iterrows():
                m_norm_name = normalize_string(m_row["legal_name"])
                score = fuzz.token_set_ratio(q_norm_name, m_norm_name)
                if score > best_score:
                    best_score = score
                    best_match = m_row

            if best_score >= 75.0 and best_match is not None:
                results.append({
                    "entity_id": best_match["lei"],
                    "source_entity_id": q_id,
                    "input_raw_name": q_name,
                    "matched_legal_name": best_match["legal_name"],
                    "match_method": "FUZZY_RAPIDFUZZ_TOKEN_SET",
                    "match_score": round(float(best_score), 2),
                    "match_confidence": "HIGH_FUZZY" if best_score >= 90 else "MEDIUM_FUZZY"
                })
                matched = True

        if not matched:
            results.append({
                "entity_id": "UNRESOLVED",
                "source_entity_id": q_id,
                "input_raw_name": q_name,
                "matched_legal_name": "NO_RESOLVED_CANDIDATE",
                "match_method": "NONE",
                "match_score": 0.0,
                "match_confidence": "UNMATCHED"
            })

    return pd.DataFrame(results)


def run_entity_resolution():
    """Demonstrates entity resolution across canonical GLEIF master and noisy invoice queries."""
    logger.info("Initializing Entity Resolution Pipeline...")
    master_file = PROCESSED_DIR / "entity_master.parquet"
    if not master_file.exists():
        raise FileNotFoundError(f"Missing master entity table: {master_file}. Run download_gleif.py first.")

    master_df = pd.read_parquet(master_file)

    # Inbound noisy customs/invoice trade queries
    queries = [
        {
            "query_id": "INVOICE_CANDIDATE_01",
            "raw_name": "Bharat Agro Commodities Exp Ltd.",
            "lei": "335800QXYZ9876543210",
            "registration_id": "",
            "jurisdiction": "IN",
            "address": "Sector 18, Karnal"
        },
        {
            "query_id": "INVOICE_CANDIDATE_02",
            "raw_name": "Gulf Agri Foods Trad. L.L.C.",
            "lei": "",
            "registration_id": "DED-CN-1092837",
            "jurisdiction": "AE-DU",
            "address": "Al Masraf Tower, Deira, Dubai"
        },
        {
            "query_id": "INVOICE_CANDIDATE_03",
            "raw_name": "Hindustan Spices and Herbs Pvt Ltd",
            "lei": "",
            "registration_id": "",
            "jurisdiction": "IN-KL",
            "address": "Jew Town Road, Mattancherry, Kochi"
        },
        {
            "query_id": "INVOICE_CANDIDATE_04",
            "raw_name": "Deutsche Specialty Chem Gmbh",
            "lei": "",
            "registration_id": "",
            "jurisdiction": "DE",
            "address": "Kaiser-Wilhelm-Allee Leverkusen"
        },
        {
            "query_id": "INVOICE_CANDIDATE_05",
            "raw_name": "Unknown Ghost Shell Exporter Corp",
            "lei": "",
            "registration_id": "",
            "jurisdiction": "VG",
            "address": "Road Town, Tortola"
        }
    ]

    df_matches = resolve_entities(queries, master_df)
    out_file = PROCESSED_DIR / "entity_resolution_matches.parquet"
    df_matches.to_parquet(out_file, index=False)

    logger.info(f"Entity resolution complete. Resolved matches saved to {out_file} ({len(df_matches)} queries).")
    return out_file


if __name__ == "__main__":
    run_entity_resolution()

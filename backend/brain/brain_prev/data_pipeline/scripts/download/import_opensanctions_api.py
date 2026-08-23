#!/usr/bin/env python3
"""
OpenSanctions Live API Client & Importer — GLOBEX Trade OS

Official OpenSanctions API & Bulk Stream Integration:
- Uses `OPENSANCTIONS_API_KEY` from environment or .env
- Supports live entity search (/search), batch screening (/match), and dataset fetching
- Streams raw JSON/CSV responses to `data/raw/sanctions/`
- Automatically updates `data/staging/sanctions_entities.csv` with standardized provenance
- Logs API queries into `data/manifests/opensanctions_requests.csv`

Usage:
    # 1. Fetch latest sanctions dataset:
    python data_pipeline/scripts/download/import_opensanctions_api.py --fetch-dataset sanctions

    # 2. Search for an entity by name:
    python data_pipeline/scripts/download/import_opensanctions_api.py --search "Rosoboronexport"

    # 3. Screen a specific entity name against sanctions:
    python data_pipeline/scripts/download/import_opensanctions_api.py --screen "Rosoboronexport" --country "RUS"

    # 4. Batch screen all trade candidate exporters:
    python data_pipeline/scripts/download/import_opensanctions_api.py --screen-candidates
"""

import os
import sys
import json
import csv
import time
import argparse
import logging
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

import requests
import pandas as pd
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("opensanctions_api")

# Directory resolution
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw" / "sanctions"
STAGING_DIR = ROOT_DIR / "data" / "staging"
MANIFEST_DIR = ROOT_DIR / "data" / "manifests"

RAW_DIR.mkdir(parents=True, exist_ok=True)
STAGING_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_DIR.mkdir(parents=True, exist_ok=True)

# Load environment variables from .env files
for env_file in [ROOT_DIR / ".env", ROOT_DIR.parent / ".env", Path.home() / ".env"]:
    if env_file.exists():
        load_dotenv(env_file)


class OpenSanctionsClient:
    """Official OpenSanctions API client with authentication, retries, and checkpointing."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.opensanctions.org"):
        self.api_key = api_key or os.getenv("OPENSANCTIONS_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()

        headers = {
            "User-Agent": "GlobexTradeOS/1.0 (Compliance Data Pipeline)",
            "Accept": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"ApiKey {self.api_key}"

        self.session.headers.update(headers)

    def _request(self, method: str, endpoint: str, params: Optional[dict] = None, json_data: Optional[dict] = None, max_retries: int = 4) -> requests.Response:
        """Executes an HTTP request with exponential backoff and error handling."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        delay = 1.0

        for attempt in range(1, max_retries + 1):
            try:
                response = self.session.request(method, url, params=params, json=json_data, timeout=30)

                if response.status_code == 200:
                    return response
                elif response.status_code in (401, 403):
                    logger.error(f"Authentication failed (HTTP {response.status_code}). Please verify your OPENSANCTIONS_API_KEY.")
                    response.raise_for_status()
                elif response.status_code == 429:
                    logger.warning(f"Rate limited by OpenSanctions (HTTP 429). Retrying in {delay:.1f}s (Attempt {attempt}/{max_retries})...")
                    time.sleep(delay)
                    delay *= 2.0
                elif response.status_code >= 500:
                    logger.warning(f"Server error {response.status_code}. Retrying in {delay:.1f}s...")
                    time.sleep(delay)
                    delay *= 2.0
                else:
                    response.raise_for_status()

            except requests.exceptions.RequestException as e:
                logger.warning(f"Request error on {url}: {e}. Retrying in {delay:.1f}s...")
                time.sleep(delay)
                delay *= 2.0

        raise RuntimeError(f"Failed to fetch {url} after {max_retries} attempts.")

    def log_manifest(self, request_id: str, endpoint: str, query: str, status: str, records_count: int, raw_path: Optional[str] = None):
        """Logs query metadata into manifests/opensanctions_requests.csv."""
        manifest_csv = MANIFEST_DIR / "opensanctions_requests.csv"
        file_exists = manifest_csv.exists()

        fieldnames = ["request_id", "endpoint", "query", "status", "records_count", "raw_path", "retrieved_at"]
        row = {
            "request_id": request_id,
            "endpoint": endpoint,
            "query": query,
            "status": status,
            "records_count": records_count,
            "raw_path": str(raw_path) if raw_path else "",
            "retrieved_at": datetime.now(timezone.utc).isoformat()
        }

        with open(manifest_csv, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)

    def search_entities(self, query: str, dataset: str = "sanctions", limit: int = 20) -> List[Dict[str, Any]]:
        """Searches OpenSanctions for entities matching a text query."""
        logger.info(f"Searching OpenSanctions dataset '{dataset}' for query: '{query}'...")
        params = {"q": query, "limit": limit}
        resp = self._request("GET", f"/search/{dataset}", params=params)
        data = resp.json()
        results = data.get("results", [])

        req_id = f"REQ_OS_SEARCH_{hashlib.md5(query.encode()).hexdigest()[:8]}"
        self.log_manifest(req_id, f"/search/{dataset}", query, "SUCCESS", len(results))
        logger.info(f"Found {len(results)} matches for '{query}'.")
        return results

    def screen_entity(self, name: str, country: Optional[str] = None, dataset: str = "sanctions", threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Screens a single company or person name using the /match endpoint."""
        logger.info(f"Screening '{name}' (Country: {country or 'ANY'}) against OpenSanctions '{dataset}'...")
        payload = {
            "queries": {
                "q1": {
                    "schema": "LegalEntity",
                    "properties": {
                        "name": [name],
                    }
                }
            }
        }
        if country:
            payload["queries"]["q1"]["properties"]["country"] = [country]

        resp = self._request("POST", f"/match/{dataset}", json_data=payload)
        data = resp.json()
        responses = data.get("responses", {}).get("q1", {}).get("results", [])

        matches = [r for r in responses if r.get("score", 0.0) >= threshold]
        req_id = f"REQ_OS_MATCH_{hashlib.md5(name.encode()).hexdigest()[:8]}"
        self.log_manifest(req_id, f"/match/{dataset}", f"{name} ({country})", "SUCCESS", len(matches))
        return matches

    def fetch_dataset_targets(self, dataset: str = "sanctions") -> Path:
        """
        Fetches official target entities from OpenSanctions and updates raw JSON/CSV and staging CSV.
        """
        logger.info(f"Importing latest targets for dataset '{dataset}' from official OpenSanctions stream...")
        timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        stream_url = f"https://data.opensanctions.org/datasets/latest/{dataset}/targets.simple.csv"

        headers = {}
        if self.api_key:
            headers["Authorization"] = f"ApiKey {self.api_key}"

        resp = requests.get(stream_url, headers=headers, timeout=60)
        resp.raise_for_status()

        raw_csv_path = RAW_DIR / f"opensanctions_{dataset}_stream_{timestamp_str}.csv"
        with open(raw_csv_path, "wb") as f:
            f.write(resp.content)

        # Compute SHA-256
        h = hashlib.sha256()
        with open(raw_csv_path, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        sha = h.hexdigest()

        # Read and normalize records into staging format
        df_raw = pd.read_csv(raw_csv_path, low_memory=False)
        req_id = f"REQ_OS_STREAM_{dataset.upper()}_{timestamp_str}"
        self.log_manifest(req_id, stream_url, f"dataset={dataset}", "SUCCESS", len(df_raw), str(raw_csv_path))
        logger.info(f"Downloaded OpenSanctions bulk stream to {raw_csv_path.name} (SHA-256: {sha[:12]}..., {len(df_raw):,} records).")

        self._update_staging_from_df(df_raw)
        return raw_csv_path

    def _update_staging_from_df(self, df_raw: pd.DataFrame):
        """Standardizes raw targets stream into data/staging/sanctions_entities.csv."""
        staging_file = STAGING_DIR / "sanctions_entities.csv"
        retrieved_at = datetime.now(timezone.utc).isoformat()

        rows = []
        for _, r in df_raw.iterrows():
            rows.append({
                "entity_id": str(r["id"]),
                "name": str(r["name"]) if pd.notna(r["name"]) else "",
                "alias": str(r["aliases"]) if pd.notna(r["aliases"]) else "",
                "country_iso3": str(r["countries"]).upper() if pd.notna(r["countries"]) else "GLOBAL",
                "topic": str(r["program_ids"]) if pd.notna(r["program_ids"]) else "sanction",
                "dataset": str(r["dataset"]) if pd.notna(r["dataset"]) else "OpenSanctions",
                "source_record_id": str(r["id"]),
                "source_url": f"https://www.opensanctions.org/entities/{r['id']}/",
                "retrieved_at": retrieved_at
            })

        df_new = pd.DataFrame(rows)
        df_new.to_csv(staging_file, index=False, quoting=csv.QUOTE_MINIMAL)
        logger.info(f"Updated canonical staging sanctions database: {staging_file} ({len(df_new):,} entities).")


def main():
    parser = argparse.ArgumentParser(description="OpenSanctions Live API Client & Importer — GLOBEX Trade OS")
    parser.add_argument("--fetch-dataset", default=None, help="Dataset to fetch (e.g. sanctions, peps, default)")
    parser.add_argument("--search", type=str, help="Search for entity name")
    parser.add_argument("--screen", type=str, help="Screen a company name against sanctions")
    parser.add_argument("--country", type=str, help="Country ISO3 code for screening")
    parser.add_argument("--screen-candidates", action="store_true", help="Screen all trade candidate entities")
    parser.add_argument("--api-key", type=str, help="Override API Key (or set OPENSANCTIONS_API_KEY in .env)")

    args = parser.parse_args()
    client = OpenSanctionsClient(api_key=args.api_key)

    if not client.api_key:
        logger.warning("No OPENSANCTIONS_API_KEY found in environment or .env. Using public anonymous mode.")

    if args.search:
        results = client.search_entities(args.search, dataset="sanctions")
        print(f"\nSearch results for '{args.search}':")
        for r in results:
            caption = r.get("caption") or r.get("properties", {}).get("name", [""])[0]
            print(f" - [{r.get('id')}] {caption} ({r.get('schema')}) - Score: {r.get('score')}")
    elif args.screen:
        matches = client.screen_entity(args.screen, country=args.country)
        print(f"\nScreening results for '{args.screen}':")
        if matches:
            for m in matches:
                caption = m.get("caption") or m.get("properties", {}).get("name", [""])[0]
                print(f" [MATCH] Score: {m.get('score'):.2f} | ID: {m.get('id')} | Name: {caption}")
        else:
            print(" [CLEAR] No sanctions match detected above threshold.")
    elif args.screen_candidates:
        candidates = [
            ("BHARAT AGRO COMMODITIES EXPORTS LIMITED", "IND"),
            ("HINDUSTAN SPICES & HERBS TRADING PRIVATE LIMITED", "IND"),
            ("GLOBAL TEXTILE MANUFACTURING & APPAREL CORP", "USA"),
            ("DEUTSCHE SPECIALTY CHEMICALS GMBH", "DEU"),
            ("PACIFIC PETROCHEMICAL & LOGISTICS PTE LTD", "SGP"),
            ("ROSOBORONEXPORT JSC", "RUS"),
            ("OCEAN STAR TITAN", "PAN")
        ]
        print(f"\nScreening {len(candidates)} trade candidates against live OpenSanctions API...")
        for name, country in candidates:
            matches = client.screen_entity(name, country=country)
            status = f"MATCH ({len(matches)} hit)" if matches else "CLEAR"
            print(f" - {name:50s} [{country}]: {status}")
    elif args.fetch_dataset:
        client.fetch_dataset_targets(dataset=args.fetch_dataset)
    else:
        # Default action: run candidate screening
        print("No specific command provided. Running trade candidate compliance screening...")
        candidates = [
            ("BHARAT AGRO COMMODITIES EXPORTS LIMITED", "IND"),
            ("ROSOBORONEXPORT JSC", "RUS"),
            ("OCEAN STAR TITAN", "PAN")
        ]
        for name, country in candidates:
            matches = client.screen_entity(name, country=country)
            status = f"MATCH ({len(matches)} hit)" if matches else "CLEAR"
            print(f" - {name:45s} [{country}]: {status}")


if __name__ == "__main__":
    main()

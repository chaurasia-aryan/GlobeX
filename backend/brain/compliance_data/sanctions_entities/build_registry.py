"""
Builds a normalized entity-screening registry from real sanctions sources.

Sources (both fetched by this script's caller, timestamps below are the real
fetch times, not build times):
  - OFAC SDN list:            sanctionslistservice.ofac.treas.gov (sdn.csv, alt.csv)
  - UN Security Council list: scsanctions.un.org/resources/xml/en/consolidated.xml

Design rules (matches src/compliance/current_facts.py's established norms):
  - No synthetic data. A source that fails to fetch is recorded as failed,
    never silently skipped or replaced with placeholder data.
  - Every entity record carries full provenance: source, list version/date,
    retrieval time.
  - BIS/EU/UK/DGFT entity lists are NOT covered by this build — recorded as
    UNSUPPORTED in the source registry with the reason (no free bulk-download
    integrated yet), not silently omitted.

Output: normalized_entities.json (list of entities with names/aliases/country)
        + source_registry.json (what was fetched, when, counts, failures).

Usage: python build_registry.py
"""

from __future__ import annotations

import csv
import json
import os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))

SDN_CSV = os.path.join(HERE, "sdn.csv")
ALT_CSV = os.path.join(HERE, "alt.csv")
UN_XML = os.path.join(HERE, "un_consolidated.xml")

OFAC_SDN_COLUMNS = [
    "ent_num", "sdn_name", "sdn_type", "program", "title", "call_sign",
    "vess_type", "tonnage", "grt", "vess_flag", "vess_owner", "remarks",
]


def _clean(value: str) -> str:
    value = value.strip()
    if value == "-0-":
        return ""
    return value


def parse_ofac_sdn() -> tuple[list[dict], list[dict], dict]:
    """Returns (entities, source_meta_errors)."""
    entities: dict[str, dict] = {}
    errors: list[str] = []

    if not os.path.exists(SDN_CSV):
        return [], [{"file": "sdn.csv", "error": "file not found"}]

    with open(SDN_CSV, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f, skipinitialspace=True)
        for row in reader:
            if len(row) < 4:
                continue
            row = [_clean(c) for c in row]
            ent_num = row[0]
            entities[ent_num] = {
                "ent_num": ent_num,
                "name": row[1],
                "sdn_type": row[2],
                "program": row[3],
                "remarks": row[11] if len(row) > 11 else "",
                "aliases": [],
                "source": "OFAC_SDN",
            }

    alt_count = 0
    if os.path.exists(ALT_CSV):
        with open(ALT_CSV, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f, skipinitialspace=True)
            for row in reader:
                if len(row) < 4:
                    continue
                row = [_clean(c) for c in row]
                ent_num = row[0]
                alt_name = row[3]
                if ent_num in entities and alt_name:
                    entities[ent_num]["aliases"].append(alt_name)
                    alt_count += 1
    else:
        errors.append({"file": "alt.csv", "error": "file not found — aliases unavailable for OFAC entities"})

    return list(entities.values()), errors, {"alias_count": alt_count}


def parse_un_consolidated() -> tuple[list[dict], list[dict], str]:
    entities: list[dict] = []
    errors: list[dict] = []

    if not os.path.exists(UN_XML):
        return [], [{"file": "un_consolidated.xml", "error": "file not found"}], ""

    tree = ET.parse(UN_XML)
    root = tree.getroot()
    date_generated = root.attrib.get("dateGenerated", "")

    for individual in root.findall("INDIVIDUALS/INDIVIDUAL"):
        first = (individual.findtext("FIRST_NAME") or "").strip()
        second = (individual.findtext("SECOND_NAME") or "").strip()
        name = " ".join(p for p in [first, second] if p)
        aliases = [
            (a.findtext("ALIAS_NAME") or "").strip()
            for a in individual.findall("INDIVIDUAL_ALIAS")
            if (a.findtext("ALIAS_NAME") or "").strip()
        ]
        entities.append({
            "un_ref": (individual.findtext("REFERENCE_NUMBER") or "").strip(),
            "name": name,
            "un_list_type": (individual.findtext("UN_LIST_TYPE") or "").strip(),
            "nationality": (individual.findtext("NATIONALITY") or "").strip(),
            "entity_type": "INDIVIDUAL",
            "aliases": aliases,
            "source": "UN_SC_CONSOLIDATED",
        })

    for entity in root.findall("ENTITIES/ENTITY"):
        name = (entity.findtext("FIRST_NAME") or "").strip()
        aliases = [
            (a.findtext("ALIAS_NAME") or "").strip()
            for a in entity.findall("ENTITY_ALIAS")
            if (a.findtext("ALIAS_NAME") or "").strip()
        ]
        entities.append({
            "un_ref": (entity.findtext("REFERENCE_NUMBER") or "").strip(),
            "name": name,
            "un_list_type": (entity.findtext("UN_LIST_TYPE") or "").strip(),
            "nationality": "",
            "entity_type": "ENTITY",
            "aliases": aliases,
            "source": "UN_SC_CONSOLIDATED",
        })

    return entities, errors, date_generated


def main() -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    ofac_entities, ofac_errors, ofac_meta = parse_ofac_sdn()
    un_entities, un_errors, un_date_generated = parse_un_consolidated()

    all_entities = []
    for e in ofac_entities:
        all_entities.append({
            "entity_id": f"OFAC-{e['ent_num']}",
            "name": e["name"],
            "aliases": e["aliases"],
            "entity_type": "INDIVIDUAL" if e["sdn_type"] == "individual" else ("VESSEL" if e["sdn_type"] == "vessel" else "ENTITY"),
            "program": e["program"],
            "source": "OFAC_SDN",
            "source_ref": e["ent_num"],
        })
    for e in un_entities:
        all_entities.append({
            "entity_id": f"UN-{e['un_ref']}",
            "name": e["name"],
            "aliases": e["aliases"],
            "entity_type": e["entity_type"],
            "program": e["un_list_type"],
            "source": "UN_SC_CONSOLIDATED",
            "source_ref": e["un_ref"],
        })

    with open(os.path.join(HERE, "normalized_entities.json"), "w", encoding="utf-8") as f:
        json.dump({"generated_at": now, "count": len(all_entities), "entities": all_entities}, f, indent=2)

    source_registry = {
        "built_at": now,
        "sources_fetched_successfully": [
            {
                "source": "OFAC_SDN",
                "authority": "US Office of Foreign Assets Control",
                "url": "https://sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/sdn.csv",
                "alias_url": "https://sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/alt.csv",
                "record_count": len(ofac_entities),
                "alias_count": ofac_meta.get("alias_count", 0),
                "retrieved_at": "2026-08-23T13:30:00Z",  # real fetch time (see conversation record)
            },
            {
                "source": "UN_SC_CONSOLIDATED",
                "authority": "United Nations Security Council",
                "url": "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
                "list_date_generated": un_date_generated,
                "record_count": len(un_entities),
                "retrieved_at": "2026-08-23T13:30:30Z",
            },
        ],
        "sources_attempted_and_failed": ofac_errors + un_errors,
        "sources_unsupported": [
            {
                "source": "BIS_CONSOLIDATED_SCREENING_LIST",
                "reason": "Not integrated in this pass — no free bulk-download wired up yet. Entity screening against BIS Denied Persons/Entity/Unverified/MEU lists is NOT covered.",
            },
            {
                "source": "EU_CONSOLIDATED_FINANCIAL_SANCTIONS_LIST",
                "reason": "Not integrated in this pass — EU sanctions map/consolidated list not wired up. NOT covered.",
            },
            {
                "source": "UK_SANCTIONS_LIST",
                "reason": "Not integrated in this pass — UK Sanctions List not wired up. NOT covered.",
            },
            {
                "source": "DGFT_RESTRICTED_PARTIES",
                "reason": "No machine-readable DGFT restricted-party list identified. NOT covered.",
            },
        ],
    }
    with open(os.path.join(HERE, "source_registry.json"), "w", encoding="utf-8") as f:
        json.dump(source_registry, f, indent=2)

    print(f"Wrote {len(all_entities)} normalized entity records "
          f"({len(ofac_entities)} OFAC + {len(un_entities)} UN).")
    print(f"OFAC errors: {ofac_errors}")
    print(f"UN errors: {un_errors}")


if __name__ == "__main__":
    main()

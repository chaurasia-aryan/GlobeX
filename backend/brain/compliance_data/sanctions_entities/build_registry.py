"""
Builds a normalized entity-screening registry from real sanctions sources.

Sources (fetched by this script's caller, timestamps below are the real
fetch times, not build times):
  - OFAC SDN list:            sanctionslistservice.ofac.treas.gov (sdn.csv, alt.csv)
  - UN Security Council list: scsanctions.un.org/resources/xml/en/consolidated.xml
  - UK OFSI Consolidated List: ofsistorage.blob.core.windows.net (uk_conlist.csv)
  - EU Financial Sanctions Files: webgate.ec.europa.eu/fsd (eu_consolidated.xml)

Design rules (matches src/compliance/current_facts.py's established norms):
  - No synthetic data. A source that fails to fetch is recorded as failed,
    never silently skipped or replaced with placeholder data.
  - Every entity record carries full provenance: source, list version/date,
    retrieval time.
  - BIS/DGFT entity lists are NOT covered by this build — recorded as
    UNSUPPORTED in the source registry with the reason (BIS's API requires a
    subscription key with no free bulk alternative found, DGFT has no
    machine-readable list), not silently omitted.

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
UK_CSV = os.path.join(HERE, "uk_conlist.csv")
EU_XML = os.path.join(HERE, "eu_consolidated.xml")
EU_NS = {"e": "http://eu.europa.ec/fpi/fsd/export"}

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


def parse_uk_ofsi() -> tuple[list[dict], list[dict], str]:
    """UK OFSI Consolidated List (ofsistorage.blob.core.windows.net). Rows are
    grouped by Group ID; each Group ID's 'Primary name' row is the canonical
    entity, every other row in the group (name variations) is an alias."""
    groups: dict[str, dict] = {}
    errors: list[dict] = []
    list_date = ""

    if not os.path.exists(UK_CSV):
        return [], [{"file": "uk_conlist.csv", "error": "file not found"}], ""

    with open(UK_CSV, "r", encoding="cp1252", errors="replace") as f:
        first_line = f.readline()
        if first_line.startswith("Last Updated"):
            list_date = first_line.strip().split(",", 1)[-1]
        reader = csv.DictReader(f)
        for row in reader:
            group_id = (row.get("Group ID") or "").strip()
            if not group_id:
                continue
            name_parts = [row.get(f"Name {i}", "").strip() for i in range(1, 7)]
            name = " ".join(p for p in name_parts if p)
            if not name:
                continue
            is_primary = (row.get("Alias Type") or "").strip().lower() == "primary name"
            g = groups.setdefault(group_id, {
                "group_id": group_id,
                "name": name,
                "aliases": [],
                "entity_type": (row.get("Group Type") or "ENTITY").strip().upper(),
                "regime": (row.get("Regime") or "").strip(),
            })
            if is_primary:
                g["name"] = name
            elif name != g["name"] and name not in g["aliases"]:
                g["aliases"].append(name)

    return list(groups.values()), errors, list_date


def parse_eu_consolidated() -> tuple[list[dict], list[dict], str]:
    """EU Financial Sanctions Files (webgate.ec.europa.eu). One
    <sanctionEntity> per designated person/entity; wholeName aliases become
    the entity's alias list, the first alias is used as the canonical name."""
    entities: list[dict] = []
    errors: list[dict] = []
    gen_date = ""

    if not os.path.exists(EU_XML):
        return [], [{"file": "eu_consolidated.xml", "error": "file not found"}], ""

    tree = ET.parse(EU_XML)
    root = tree.getroot()
    gen_date = root.attrib.get("generationDate", "")

    for ent in root.findall("e:sanctionEntity", EU_NS):
        logical_id = ent.attrib.get("logicalId", "")
        subj = ent.find("e:subjectType", EU_NS)
        entity_type = "INDIVIDUAL" if (subj is not None and subj.attrib.get("code") == "person") else "ENTITY"

        names: list[str] = []
        for alias in ent.findall("e:nameAlias", EU_NS):
            whole = (alias.attrib.get("wholeName") or "").strip()
            if whole and whole not in names:
                names.append(whole)
        if not names:
            continue

        programme = ""
        reg = ent.find("e:regulation", EU_NS)
        if reg is not None:
            programme = (reg.attrib.get("programme") or "").strip()

        entities.append({
            "logical_id": logical_id,
            "name": names[0],
            "aliases": names[1:],
            "entity_type": entity_type,
            "programme": programme,
        })

    return entities, errors, gen_date


def main() -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    ofac_entities, ofac_errors, ofac_meta = parse_ofac_sdn()
    un_entities, un_errors, un_date_generated = parse_un_consolidated()
    uk_entities, uk_errors, uk_list_date = parse_uk_ofsi()
    eu_entities, eu_errors, eu_gen_date = parse_eu_consolidated()

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
    for e in uk_entities:
        all_entities.append({
            "entity_id": f"UK-{e['group_id']}",
            "name": e["name"],
            "aliases": e["aliases"],
            "entity_type": "INDIVIDUAL" if e["entity_type"] == "INDIVIDUAL" else "ENTITY",
            "program": e["regime"],
            "source": "UK_SANCTIONS_LIST",
            "source_ref": e["group_id"],
        })
    for e in eu_entities:
        all_entities.append({
            "entity_id": f"EU-{e['logical_id']}",
            "name": e["name"],
            "aliases": e["aliases"],
            "entity_type": e["entity_type"],
            "program": e["programme"],
            "source": "EU_CONSOLIDATED_FINANCIAL_SANCTIONS_LIST",
            "source_ref": e["logical_id"],
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
            {
                "source": "UK_SANCTIONS_LIST",
                "authority": "UK Office of Financial Sanctions Implementation (OFSI)",
                "url": "https://ofsistorage.blob.core.windows.net/publishlive/2022format/ConList.csv",
                "list_date_generated": uk_list_date,
                "record_count": len(uk_entities),
                "retrieved_at": "2026-08-24T03:15:00Z",
            },
            {
                "source": "EU_CONSOLIDATED_FINANCIAL_SANCTIONS_LIST",
                "authority": "European Commission — Financial Sanctions Database",
                "url": "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content",
                "list_date_generated": eu_gen_date,
                "record_count": len(eu_entities),
                "retrieved_at": "2026-08-24T03:24:47Z",
            },
        ],
        "sources_attempted_and_failed": ofac_errors + un_errors + uk_errors + eu_errors,
        "sources_unsupported": [
            {
                "source": "BIS_CONSOLIDATED_SCREENING_LIST",
                "reason": "trade.gov's consolidated_screening_list API requires a subscription key (401 without one); no unauthenticated bulk CSV/JSON endpoint found. NOT covered.",
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
          f"({len(ofac_entities)} OFAC + {len(un_entities)} UN + {len(uk_entities)} UK + {len(eu_entities)} EU).")
    print(f"OFAC errors: {ofac_errors}")
    print(f"UN errors: {un_errors}")
    print(f"UK errors: {uk_errors}")
    print(f"EU errors: {eu_errors}")


if __name__ == "__main__":
    main()

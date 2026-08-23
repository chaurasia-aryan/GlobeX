#!/usr/bin/env python3
"""
Convert all non-CSV datasets (XML, XLSX, Parquet, OCR JSON) in data_pipeline/data
into clean, structured CSV format.
"""

import os
import csv
import json
import logging
import xml.etree.ElementTree as ET
from pathlib import Path
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("convert_to_csv")

BASE_DATA_DIR = Path("data_pipeline/data")


def convert_ofac_xml():
    """Convert OFAC SDN_ENHANCED.XML to CSV."""
    xml_path = BASE_DATA_DIR / "raw" / "ofac" / "SDN_ENHANCED.XML"
    if not xml_path.exists():
        logger.warning(f"OFAC XML not found at {xml_path}")
        return

    logger.info(f"Converting {xml_path} to CSV...")
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Namespace handling
        ns = {}
        if "}" in root.tag:
            ns["ns"] = root.tag.split("}")[0].strip("{")
            prefix = "ns:"
        else:
            prefix = ""

        entries = []
        for entry in root.findall(f".//{prefix}sdnEntry", ns) or root.findall(f".//{prefix}sanctionsEntry", ns) or root.findall(".//sdnEntry"):
            uid = entry.findtext(f"{prefix}uid", default="", namespaces=ns) or entry.findtext("uid", default="")
            first_name = entry.findtext(f"{prefix}firstName", default="", namespaces=ns) or entry.findtext("firstName", default="")
            last_name = entry.findtext(f"{prefix}lastName", default="", namespaces=ns) or entry.findtext("lastName", default="")
            sdn_type = entry.findtext(f"{prefix}sdnType", default="", namespaces=ns) or entry.findtext("sdnType", default="")
            remarks = entry.findtext(f"{prefix}remarks", default="", namespaces=ns) or entry.findtext("remarks", default="")
            
            # Program list
            programs = [p.text for p in (entry.findall(f".//{prefix}program", ns) or entry.findall(".//program")) if p.text]
            prog_str = "; ".join(programs)
            
            # Addresses / Countries
            countries = [c.text for c in (entry.findall(f".//{prefix}country", ns) or entry.findall(".//country")) if c.text]
            country_str = "; ".join(set(countries))

            full_name = f"{first_name} {last_name}".strip() if first_name else last_name

            entries.append({
                "ofac_uid": uid,
                "full_name": full_name,
                "sdn_type": sdn_type,
                "programs": prog_str,
                "countries": country_str,
                "remarks": remarks
            })

        if entries:
            out_csv = BASE_DATA_DIR / "raw" / "ofac" / "sdn_enhanced.csv"
            df = pd.DataFrame(entries)
            df.to_csv(out_csv, index=False)
            logger.info(f"Successfully generated {out_csv} with {len(df):,} OFAC entities.")
    except Exception as e:
        logger.error(f"Error converting OFAC XML: {e}")


def convert_iso_currencies_xml():
    """Convert ISO 4217 XML to CSV."""
    xml_path = BASE_DATA_DIR / "raw" / "country_currency" / "iso_4217_currencies_official.xml"
    if not xml_path.exists():
        return

    logger.info(f"Converting {xml_path} to CSV...")
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        rows = []
        for curr in root.findall(".//CcyNtry"):
            country = curr.findtext("CtryNm", default="").strip()
            ccy_name = curr.findtext("CcyNm", default="").strip()
            ccy_code = curr.findtext("Ccy", default="").strip()
            ccy_num = curr.findtext("CcyNbr", default="").strip()
            ccy_units = curr.findtext("CcyMnrUnts", default="").strip()
            if ccy_code or country:
                rows.append({
                    "country_name": country,
                    "currency_name": ccy_name,
                    "currency_alphabetic_code": ccy_code,
                    "currency_numeric_code": ccy_num,
                    "minor_units": ccy_units
                })
        if rows:
            out_csv = BASE_DATA_DIR / "raw" / "country_currency" / "iso_4217_currencies_official.csv"
            df = pd.DataFrame(rows)
            df.to_csv(out_csv, index=False)
            logger.info(f"Saved {out_csv} ({len(df)} rows).")
    except Exception as e:
        logger.error(f"Error converting ISO 4217 XML: {e}")


def convert_unlocode_xml():
    """Convert UNLOCODE XML if present."""
    xml_path = BASE_DATA_DIR / "raw" / "unlocode" / "release" / "txt" / "UNLOCODE Codelist.xml"
    if not xml_path.exists():
        return
    logger.info(f"Converting {xml_path} to CSV...")
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        rows = []
        for loc in root.findall(".//Location") or root.findall(".//Record"):
            item = {}
            for child in loc:
                item[child.tag] = child.text
            if item:
                rows.append(item)
        if rows:
            out_csv = BASE_DATA_DIR / "raw" / "unlocode" / "release" / "csv" / "unlocode_codelist_from_xml.csv"
            out_csv.parent.mkdir(parents=True, exist_ok=True)
            df = pd.DataFrame(rows)
            df.to_csv(out_csv, index=False)
            logger.info(f"Saved {out_csv} ({len(df)} rows).")
    except Exception as e:
        logger.error(f"Error converting UNLOCODE XML: {e}")


def convert_xlsx_files():
    """Convert classification and WTO XLSX files to CSV."""
    xlsx_files = [
        BASE_DATA_DIR / "raw" / "wto_rta" / "wto_all_rtas_list_latest.xlsx",
        BASE_DATA_DIR / "raw" / "classification" / "hs_bec" / "HS2012-BEC4.xlsx",
        BASE_DATA_DIR / "raw" / "classification" / "hs_isic" / "HS2017-ISIC4.xlsx",
        BASE_DATA_DIR / "raw" / "classification" / "hs_sitc" / "HS2017-SITC3.xlsx"
    ]
    for fp in xlsx_files:
        if fp.exists():
            out_csv = fp.with_suffix(".csv")
            try:
                df = pd.read_excel(fp)
                df.to_csv(out_csv, index=False)
                logger.info(f"Converted {fp.name} -> {out_csv.name} ({len(df):,} rows x {len(df.columns)} cols).")
            except Exception as e:
                logger.error(f"Error converting {fp}: {e}")


def convert_parquet_files():
    """Convert Parquet files in features/ and processed/ to CSV."""
    for sub in ["features", "processed"]:
        folder = BASE_DATA_DIR / sub
        if folder.exists():
            for pfile in folder.glob("*.parquet"):
                out_csv = pfile.with_suffix(".csv")
                try:
                    df = pd.read_parquet(pfile)
                    df.to_csv(out_csv, index=False)
                    logger.info(f"Converted {pfile.name} -> {out_csv.name} ({len(df):,} rows x {len(df.columns)} cols).")
                except Exception as e:
                    logger.error(f"Error converting {pfile}: {e}")


def main():
    logger.info("Starting conversion of non-CSV datasets to CSV...")
    convert_ofac_xml()
    convert_iso_currencies_xml()
    convert_unlocode_xml()
    convert_xlsx_files()
    convert_parquet_files()
    logger.info("All non-CSV conversions complete!")


if __name__ == "__main__":
    main()

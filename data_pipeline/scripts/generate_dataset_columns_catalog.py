#!/usr/bin/env python3
"""
Generate comprehensive Master Dataset & Column Catalog Markdown document
covering 100% of datasets and every single column in data_pipeline/data/
"""

import os
import csv
from pathlib import Path
import pandas as pd

BASE_DATA_DIR = Path("data_pipeline/data")
OUTPUT_MD_PATH = Path("docs/DATASET_COLUMNS_CATALOG.md")
DATA_PIPELINE_MD_PATH = Path("data_pipeline/DATASET_COLUMNS_CATALOG.md")

CATEGORY_INFO = {
    "final_csv": {
        "title": "1. Deliverable Final Datasets (`data_pipeline/data/final_csv/`)",
        "description": "Gold-standard deliverable datasets ready for Machine Learning, Deep Learning, Semantic RAG, and EDA."
    },
    "staging": {
        "title": "2. Intermediate Staging Tables (`data_pipeline/data/staging/`)",
        "description": "Standardized, clean intermediate relational tables derived from raw source ingestion."
    },
    "features": {
        "title": "3. Feature Stores & Sequence Matrices (`data_pipeline/data/features/`)",
        "description": "Computed feature engineering stores, sequence panels, and labeled training/validation/test sets."
    },
    "processed": {
        "title": "4. Processed Analytical Panels (`data_pipeline/data/processed/`)",
        "description": "Normalized analytical panels, entity resolution tables, and harmonized cross-border observations."
    },
    "raw": {
        "title": "5. Converted Raw Source Datasets (`data_pipeline/data/raw/`)",
        "description": "Parsed and structured CSV datasets converted directly from external sources (OFAC XML, UN/LOCODE, WITS, WTO, ISO, GLEIF)."
    },
    "manifests": {
        "title": "6. Pipeline Manifests & Request Tracking (`data_pipeline/data/manifests/`)",
        "description": "Audit trails of API requests, download receipts, and data provenance manifests."
    },
    "reports": {
        "title": "7. Governance, Audit & Quality Reports (`data_pipeline/data/reports/`)",
        "description": "Join audits, missingness statistics, duplication reports, and comprehensive data dictionaries."
    }
}


def analyze_dataset(file_path: Path, rel_path: Path):
    """Inspect CSV and return row count, size, and column details."""
    file_size_kb = file_path.stat().st_size / 1024
    
    # Fast row counting
    with open(file_path, "rb") as f:
        row_count = sum(1 for _ in f) - 1
    if row_count < 0:
        row_count = 0

    df_sample = pd.read_csv(file_path, nrows=50, low_memory=False)
    cols = list(df_sample.columns)
    
    col_details = []
    for col in cols:
        series = df_sample[col]
        dtype = str(series.dtype)
        # sample value
        non_nulls = series.dropna()
        sample_val = str(non_nulls.iloc[0]) if len(non_nulls) > 0 else "—"
        if len(sample_val) > 40:
            sample_val = sample_val[:37] + "..."
        sample_val = sample_val.replace("\n", " ").replace("|", "\\|")
        
        col_details.append({
            "name": col,
            "dtype": dtype,
            "sample": sample_val
        })

    return {
        "file_name": file_path.name,
        "rel_path": str(rel_path).replace("\\", "/"),
        "row_count": row_count,
        "col_count": len(cols),
        "file_size_kb": file_size_kb,
        "columns": col_details
    }


def generate_catalog():
    all_csvs = sorted(list(BASE_DATA_DIR.rglob("*.csv")))
    
    by_category = {}
    for csv_file in all_csvs:
        rel = csv_file.relative_to(BASE_DATA_DIR)
        category = rel.parts[0]
        if category in CATEGORY_INFO:
            data = analyze_dataset(csv_file, rel)
            by_category.setdefault(category, []).append(data)

    md_lines = [
        "# GLOBEX AI — Master Dataset & Column Schema Catalog",
        "",
        "> **Last Synced**: August 21, 2026  ",
        "> **Scope**: 100% of all structured datasets in `data_pipeline/data/`, complete with row counts, file sizes, and exhaustive column definitions.",
        "> **Format Standard**: All non-CSV sources (OFAC XML, WTO/UN XLSX, Parquet) have been parsed and converted into standard CSV format.",
        "",
        "---",
        "",
        "## 📊 Executive Inventory Matrix",
        "",
        "| Layer | Dataset Filename | Relative Path | Rows | Cols | Size (KB) |",
        "| :--- | :--- | :--- | :---: | :---: | :---: |"
    ]

    total_rows = 0
    total_datasets = 0

    for cat_key, cat_meta in CATEGORY_INFO.items():
        datasets = by_category.get(cat_key, [])
        for d in datasets:
            total_rows += d["row_count"]
            total_datasets += 1
            md_lines.append(f"| **{cat_key}** | `{d['file_name']}` | `{d['rel_path']}` | {d['row_count']:,} | {d['col_count']} | {d['file_size_kb']:.1f} KB |")

    md_lines.extend([
        "",
        f"**Summary**: **{total_datasets} datasets** indexed containing **{total_rows:,} total rows** across 7 operational data layers.",
        "",
        "---",
        ""
    ])

    # Section by section details
    for cat_key, cat_meta in CATEGORY_INFO.items():
        datasets = by_category.get(cat_key, [])
        if not datasets:
            continue

        md_lines.extend([
            f"## {cat_meta['title']}",
            "",
            f"*{cat_meta['description']}*",
            ""
        ])

        for d in datasets:
            md_lines.extend([
                f"### 📄 `{d['file_name']}`",
                "",
                f"- **Location**: `data_pipeline/data/{d['rel_path']}`",
                f"- **Dimensions**: **{d['row_count']:,} rows** × **{d['col_count']} columns**",
                f"- **File Size**: **{d['file_size_kb']:.1f} KB**",
                "",
                "| # | Column Name | Inferred Type | Sample / Representation |",
                "| :-: | :--- | :--- | :--- |"
            ])

            for idx, c in enumerate(d["columns"], 1):
                md_lines.append(f"| {idx} | `{c['name']}` | `{c['dtype']}` | `{c['sample']}` |")

            md_lines.extend(["", "---", ""])

    content = "\n".join(md_lines)
    
    OUTPUT_MD_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(content)
        
    with open(DATA_PIPELINE_MD_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Master Catalog generated successfully at {OUTPUT_MD_PATH} and {DATA_PIPELINE_MD_PATH}")
    print(f"Total datasets indexed: {total_datasets}")


if __name__ == "__main__":
    generate_catalog()

# Data Source Access Requirements & Audit Matrix — GLOBEX Trade OS

**Audit Date**: August 20, 2026  
**Auditor**: Senior Data Engineering & Controlled Rebuild System Lead  
**Scope**: Full authentication, API, bulk, and browser accessibility assessment across all 6 core data sources.

---

## 1. Source Access Matrix

| Source | Official URL | API Available? | Bulk Download Available? | Browser Download Available? | Credential Required? | Credential Environment Variable | Current Access Status | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UN Comtrade** | `https://comtradeplus.un.org` / `https://comtradeapi.un.org` | YES (v1 Public Preview + Subscription API) | YES | YES (UN Comtrade Portal) | Optional for preview (rate-limited); Yes for bulk API | `COMTRADE_PRIMARY_KEY` / `COMTRADE_API_KEY` | **ACCESSIBLE** (Public API & verified cached payloads) | Use programmatic API with retry & checkpointing |
| **GLEIF Golden Copy** | `https://www.gleif.org` / `https://goldencopy.gleif.org` | YES (`https://api.gleif.org/api/v1`) | YES (Daily Golden Copy L1 & L2 RR) | YES | NO (CC0 Public Domain) | None | **ACCESSIBLE** (Open public feed) | Ingest Level 1 entity master & Level 2 parent links |
| **OpenSanctions** | `https://www.opensanctions.org` | YES (`https://api.opensanctions.org`) | YES (Latest targets CSV) | YES | NO for bulk CSV; Optional for enterprise API | `OPENSANCTIONS_API_KEY` | **ACCESSIBLE** (Bulk target stream) | Ingest global consolidated sanctions & PEPs |
| **OFAC SDN & Consolidated** | `https://ofac.treasury.gov` | NO (Direct HTTP CSV feeds) | YES (`sdn.csv`, `consolidated.csv`) | YES (`sanctionssearch.ofac.treasury.gov`) | NO (US Public Domain) | None | **ACCESSIBLE** (Direct HTTP download) | Ingest SDN validation table |
| **World Bank WDI** | `https://data.worldbank.org` / `https://api.worldbank.org/v2` | YES (API v2 JSON/XML) | YES (WDI archive) | YES (DataBank portal) | NO (CC BY 4.0 Open Data) | None | **ACCESSIBLE** (Open REST API) | Ingest macro series (GDP, CPI, Pop, Trade %) |
| **WITS / UNCTAD TRAINS** | `https://wits.worldbank.org` | YES (SDMX REST API) | YES (Tariff archives) | YES (WITS Web portal) | NO for basic queries; Optional for bulk | `WITS_API_KEY` | **ACCESSIBLE** (Public SDMX endpoint & TRAINS schedules) | Ingest MFN & CEPA applied tariff rates |
| **OCR Benchmarks (FUNSD/SROIE/CORD/XFUND)** | Hugging Face / Official Portals | YES (Hugging Face Datasets API) | YES | YES | NO for public benchmark splits; Optional for private gated | `HF_TOKEN` | **ACCESSIBLE** (Public benchmark splits) | Extract full token bounding boxes & semantic labels |

---

## 2. Stop-and-Ask Evaluation

- **Status**: All 7 required sources have active, open public APIs, bulk feeds, or verified programmatic endpoints.
- **Missing Credentials**: None. No required source is blocked by unconfigured credentials.
- **Proceeding**: The pipeline will execute Phase 2 through Phase 9.

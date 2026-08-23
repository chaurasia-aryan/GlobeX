# Master Dataset Catalog — GLOBEX Trade Intelligence OS

This document catalogs every official data source, external registry, macro database, and OCR benchmark integrated into the GLOBEX data acquisition engine.

---

## 1. Trade Flow Intelligence

### UN Comtrade (United Nations International Trade Statistics Database)
- **Source Authority**: United Nations Statistics Division (UNSD)
- **Official API Endpoint**: `https://comtradeapi.un.org/public/v1/preview` (Free preview) / `https://comtradeapi.un.org/data/v1/get` (Subscription)
- **Classification**: Harmonized System (HS 2012, HS 2017, HS 2022) at 2, 4, and 6-digit granularity.
- **Coverage**:
  - Annual: 2015–2025
  - Monthly: 2022–2025
- **Key Fields**: Reporter (`reporter_iso3`), Partner (`partner_iso3`), 2nd Partner (`partner2_code`), Commodity Code (`cmd_code`), Flow (`flow_desc`: Export, Import, Re-export, Re-import), Primary Trade Value in USD (`primary_value`), Net Weight in kg (`net_weight`), Quantity (`quantity`), Mode of Transport (`mot_code`), Customs Procedure (`customs_code`).
- **License**: UN Comtrade Terms of Use (Open data for analytical and non-commercial/commercial access with proper citation).

---

## 2. Legal Entity & Corporate Verification

### GLEIF Golden Copy (Global Legal Entity Identifier Foundation)
- **Source Authority**: Global Legal Entity Identifier Foundation (GLEIF)
- **Official URL**: `https://goldencopy.gleif.org/api/v2/golden-copies/publishes` / `https://leidata-preview.gleif.org/api/v1/concatenated-files/latest/lei2/csv`
- **Coverage**: Global ISO 17442 Legal Entity Identifiers (LEI) updated daily.
- **Data Layers**:
  - Level 1 (Who is Who): Entity legal name, status, jurisdiction, legal address, headquarters address, registration authority, registration ID.
  - Level 2 (Who Owns Whom): Direct and ultimate parent LEI relationships (`RR-CDF`).
- **License**: CC0 1.0 Universal (Public Domain Dedication).

### OpenCorporates Registry
- **Source Authority**: OpenCorporates Ltd.
- **Official API**: `https://api.opencorporates.com/v0.4`
- **Coverage**: 200M+ corporate registrations across 140+ jurisdictions.
- **Usage**: Secondary legal entity enrichment (corporate status, incorporation date, registered filings). Skipped gracefully if API key is not supplied.

---

## 3. Sanctions, Debarment & Regulatory Screening

### OpenSanctions
- **Source Authority**: OpenSanctions Community Interest Company
- **Official URL**: `https://data.opensanctions.org/datasets/latest/sanctions/targets.simple.csv`
- **Coverage**: Global sanctions lists (OFAC, EU, UN, UK OFSI, SECO, DFAT, Interpol, World Bank Debarred Firms).
- **Format**: FollowTheMoney (FtM) entity graph + simple consolidated CSV.
- **Key Fields**: Entity ID, Schema (Company, Person, Vessel), Name, Aliases, Topics (`sanction`, `debarment`, `pep`), Countries, Birth/Incorporation Dates, Sanctions Program, Start Date.
- **License**: Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0) with enterprise API licensing.

### OFAC Sanctions Lists (U.S. Department of the Treasury)
- **Source Authority**: Office of Foreign Assets Control (OFAC)
- **Official URL**: `https://www.treasury.gov/ofac/downloads/sdn.csv` & `https://www.treasury.gov/ofac/downloads/consolidated/consolidated.csv`
- **Coverage**: Specially Designated Nationals (SDN) and Consolidated Non-SDN Sanctions Lists.
- **Usage**: Independent regulatory validation, auditability, and distinct OFAC source tracking.

---

## 4. Tariffs & Trade Policy

### WITS / UNCTAD TRAINS
- **Source Authority**: World Bank / UNCTAD (Trade Analysis Information System)
- **Official URL**: `https://wits.worldbank.org/API/V1/SDMX/V21/rest`
- **Coverage**: Bilateral MFN (Most Favored Nation) applied tariffs, preferential trade agreements (e.g., India-UAE CEPA, US-MCA, EFTA), bound rates, and non-tariff measures (NTMs).
- **Grain**: Reporter × Partner × HS6 × Year.

---

## 5. Macroeconomic Context

### World Bank World Development Indicators (WDI)
- **Source Authority**: The World Bank Group
- **Official API**: `https://api.worldbank.org/v2/country/.../indicator/...`
- **Core Indicators**:
  - `NY.GDP.MKTP.CD`: GDP (current USD)
  - `NY.GDP.PCAP.CD`: GDP per capita (current USD)
  - `NY.GDP.MKTP.KD.ZG`: Annual GDP growth (%)
  - `FP.CPI.TOTL.ZG`: Inflation, Consumer Prices (%)
  - `SP.POP.TOTL`: Total Population
  - `NE.TRD.GNFS.ZS`: Trade (% of GDP)
- **License**: CC BY 4.0 (Creative Commons Attribution).

---

## 6. Document Understanding & OCR Benchmarks

### FUNSD (Form Understanding in Noisy Scanned Documents)
- **Source**: Guillaume Jaume et al. / Hugging Face `nielsr/funsd`
- **Task**: Key-Value pair extraction and semantic linking in scanned institutional forms.
- **Splits**: 149 train, 50 test.

### SROIE (Scanned Receipts OCR and Information Extraction)
- **Source**: ICDAR 2019 / Hugging Face `dpl123/sroie`
- **Task**: Token recognition and entity extraction (Company, Date, Address, Total).
- **Splits**: 626 train, 361 test.

### CORD (Consolidated Receipt Dataset for Post-OCR Parsing)
- **Source**: Clova AI / Hugging Face `naver-clova-ix/cord-v2`
- **Task**: Hierarchical receipt key-value parsing with 30 fine-grained semantic labels.

### XFUND (Multilingual Form Understanding)
- **Source**: Microsoft Research / Hugging Face `nielsr/xfund`
- **Languages**: Chinese, Japanese, Spanish, French, German, Italian, Portuguese.

### RVL-CDIP (Ryerson Vision Lab Complex Document Information Processing)
- **Status**: Optional (Requires >40 GB disk space).
- **Task**: 16-class document classification (Letter, Form, Invoice, Bill, etc.).

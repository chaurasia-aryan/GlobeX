# Phase 7 — Current Facts

**Status:** delivered
**Built:** 2026-08-23 (all retrieval timestamps below are UTC and are the real times of the fetches that produced the records)
**Scope decision:** inherited from the orchestrating session — India as exporter only, the ~14 partner countries in the anomaly dataset (tier 1) plus the 51 partner-discovery countries (tier 2), and the 34 HS6 codes actually present in `backend/brain/processed/`.

## 1. What was built

| Artifact | Path |
|---|---|
| Fact record schema (JSON Schema 2020-12) | `backend/brain/compliance_data/current_facts/_schema.json` |
| Source registry (fetched + failed) | `backend/brain/compliance_data/current_facts/sources.json` |
| Scope declaration | `backend/brain/compliance_data/current_facts/scope.json` |
| Tariffs / preferential tariffs | `backend/brain/compliance_data/current_facts/tariffs.json` |
| RTA status + rules of origin | `backend/brain/compliance_data/current_facts/rules_of_origin.json` |
| Export controls + licences | `backend/brain/compliance_data/current_facts/export_controls.json` |
| Country-level sanctions status | `backend/brain/compliance_data/current_facts/country_sanctions_status.json` |
| SPS / TBT measures | `backend/brain/compliance_data/current_facts/sps_tbt.json` |
| Loader + query API | `src/compliance/current_facts.py`, `src/compliance/__init__.py` |

**1,102 fact records**, all validating cleanly against `_schema.json` (0 errors, `jsonschema` Draft 2020-12).

`src/api/compliance_api.py` was **not touched**. Wiring the gate is Phase 8/14's job. No notebook was modified.

### Scope, derived from the real datasets (not assumed)

Globbed from `backend/brain/processed/*.parquet` before any fetching:

* **Exporter:** `IND` only (both `01_partner_discovery_india_as_exporter.parquet` and `02_trade_anomaly.parquet` have a single exporter/reporter value).
* **Tier 1 partners (14)** from `trade_anomaly/02_trade_anomaly.parquet` `partner_iso3`, excluding `IND` and `WLD`: ARE, AUS, BRA, CHN, DEU, GBR, IDN, JPN, KOR, NLD, SAU, SGP, USA, ZAF.
* **Tier 2 partners (51)** from `01_partner_discovery_india_as_exporter.parquet` + `destination_country_ranking_features.parquet` `importer_iso3`, excluding `IND` and `WLD`. (The brief anticipated ~33; the datasets actually carry 53 raw values → 51 real countries.)
* **HS6 (34)**, the union across all three processed datasets: 030617, 090121, 090240, 090411, 100630, 120999, 151190, 270112, 270900, 271019, 280461, 293339, 300490, 310520, 390110, 520512, 610910, 620342, 690721, 710239, 711319, 720839, 730890, 760110, 841199, 847130, 847989, 850440, 851712, 851713, 854143, 870322, 870829, 901890.

## 2. The schema

One JSON object per fact. Required: `fact_id`, `category`, `fact_type`, `authority`, `source_url`, `retrieved_at`, `jurisdiction`, `status`. Also carried: `value`, `unit`, `source_document`, `effective_period{start,end}`, `origin`, `destination`, `hs6`, `version`, `unsupported_reason`, `freshness_policy`, `verification_note`, `raw`.

`category` ∈ tariff, preferential_tariff, rta, rules_of_origin, import_control, export_control, sanctions, licence, sps, tbt, customs, product_restriction, entity_status.

`status` ∈ **CURRENT** (live-fetched, in force at retrieval) · **STALE** (official but the source's newest observation predates the freshness policy) · **SUPERSEDED** · **UNVERIFIED** (obtained, not corroborated against the primary legal source) · **CONFLICT** · **UNSUPPORTED** (no authoritative free source found; `value` is `null` and `unsupported_reason` is mandatory).

Two schema-enforced honesty rules, both verified across all 1,102 records:

* every `retrieved_at` is a real 2026-08-23 fetch timestamp, not a build timestamp;
* no record with `status = UNSUPPORTED` carries a non-null `value`, and every one carries a reason.

## 3. Sources — fetched, failed, skipped

### 3.1 Successfully fetched (8)

| Source | Authority | URL | Retrieved (UTC) |
|---|---|---|---|
| `WTO_RTA_DB` | World Trade Organization | `https://rtais.wto.org/UI/ExportAllRTAList.aspx` (XLSX, 661 RTAs, 26 rows naming India) | 2026-08-23T09:39:31Z |
| `WITS_TRAINS` | World Bank WITS / UNCTAD TRAINS | `https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/...` | 2026-08-23T09:53:07Z |
| `UK_TRADE_TARIFF_API` | HMRC — UK Integrated Online Tariff | `https://www.trade-tariff.service.gov.uk/api/v2/commodities/{code}?filter[geographical_area_id]=IN` | 2026-08-23T09:56:41Z |
| `UK_TARIFF_ROO_SCHEMES` | HMRC — UK Integrated Online Tariff | `https://www.trade-tariff.service.gov.uk/api/v2/rules_of_origin_schemes` | 2026-08-23T10:00:52Z |
| `UAE_MOET_INDIA_CEPA_TEXT` | UAE Ministry of Economy and Tourism | `https://www.moet.gov.ae/documents/20121/1347101/Final+Agreement_UAE+India+CEPA.pdf` (320 pp) | 2026-08-23T10:03:50Z |
| `DGFT_SCOMET_APPENDIX3` | DGFT, Ministry of Commerce & Industry, India | `https://content.dgft.gov.in/Website/append3_0.pdf` (227 pp) | 2026-08-23T09:37:19Z |
| `DGFT_ITCHS_SCHEDULE2` | DGFT, Ministry of Commerce & Industry, India | `https://content.dgft.gov.in/Website/dgftprod/1702ad48-.../Schedule 2 - Export Policy New (1) (1).pdf` (124 pp) | 2026-08-23T10:08:22Z |
| `UN_SC_CONSOLIDATED_LIST` | United Nations Security Council | `https://scsanctions.un.org/resources/xml/en/consolidated.xml` (`dateGenerated=2026-08-22T23:00:03.221Z`) | 2026-08-23T09:59:45Z |

Also fetched and used only as scope evidence, not as fact sources: 23 DGFT ITC(HS) chapter PDFs from `content.dgft.gov.in/Website/Chapter NN.pdf`. On inspection these are **Schedule 1 — Import Policy** (and self-identify as the ITC(HS) 2017 edition), so they do not bear on India-as-exporter and were discarded in favour of the Schedule 2 Export Policy document above.

### 3.2 Attempted and failed (5)

| Source | URL | Result | Consequence |
|---|---|---|---|
| India Dept. of Commerce trade agreements | `commerce.gov.in/international-trade/trade-agreements/` | HTTP 403 via WebFetch, HTTP 404 direct | India's own consolidated FTA list unavailable; **WTO RTA Database substituted** as the authority for RTA status. |
| CBIC customs notifications | `cbic.gov.in/.../csnt39-2022.pdf`, `taxinformation.cbic.gov.in` | 404 / HTML shell, no PDF | The India-side *Customs Tariff (Determination of Origin) Rules* for CEPA/CETA were **not** obtained. Rules of origin are sourced from the treaty text and the UK ORD instead, and every RoO record says so. |
| Australia DFAT AI-ECTA official text | `dfat.gov.au/trade/agreements/in-force/australia-india-ecta/...` | WebFetch 60 s timeout; direct GET connection reset | IND→AUS rules of origin recorded **UNSUPPORTED**. |
| UN sanctions committees page | `main.un.org/securitycouncil/en/sanctions/information` | HTTP 403 | No impact — the machine-readable Consolidated List XML was retrieved instead. |
| WTO RTAIS per-member search | `rtais.wto.org/UI/PublicSearchByMemberResult.aspx?MemberCode=356` | ASP.NET application error | No impact — the AllRTAs XLSX export is the same dataset. |

### 3.3 Deliberately skipped as out of scope

* **Entity-level restricted-party screening** (OFAC SDN matching, UN Consolidated List *entity* matching, BIS Consolidated Screening List). Phase 8. The UN list was fetched here **only** to read the set of country regimes present, not to match names.
* **Non-scope corridors and products.** Nothing was fetched for origins other than IND, for partners outside the 51, or for HS6 outside the 34.
* Global tariff coverage. No attempt at all 200-odd WTO members.

## 4. What the sources actually yielded

### 4.1 RTA status — WTO RTA Database

26 rows name India; the ones touching in-scope partners, all **In Force** unless noted:

| Agreement | In force | In-scope partners |
|---|---|---|
| United Kingdom – India | **2026-07-15** | GBR |
| India – United Arab Emirates | 2022-05-01 | ARE |
| India – Australia | 2022-12-29 | AUS |
| India – Japan | 2011-08-01 | JPN |
| Korea, Rep. – India | 2010-01-01 | KOR |
| India – Malaysia | 2011-07-01 | MYS |
| India – Singapore | 2005-08-01 | SGP |
| ASEAN – India | 2010-01-01 (G) / 2015-07-01 (S) | IDN, MYS, PHL, SGP, THA, VNM |
| Asia Pacific Trade Agreement (APTA) | 1976-06-17; China acceded 2002-01-01 | CHN, KOR |
| MERCOSUR – India | 2009-06-01 | BRA, ARG |
| EFTA – India | **2025-10-01** | CHE |
| GSTP | 1989-04-19 | 19 in-scope partners |
| EU – India | *Early announcement – Under negotiation* | DEU, NLD, FRA, ITA, ESP, … |
| India – SACU | *Early announcement – Under negotiation* | ZAF |

Tier-1 partners with **no** RTA in force: BRA has only the MERCOSUR PTA, DEU/NLD none, SAU none, USA none, ZAF none. Each is recorded explicitly as `RTA_NONE_IN_FORCE` (status CURRENT) rather than left silent.

### 4.2 Tariffs

Two sources with very different standing, and the registry keeps them apart:

* **UK Trade Tariff API — legally in force today, status `CURRENT`.** 84 records. Third-country duties for 31 of 34 HS6, and **31 India-specific tariff-preference measures at 0.00 %, all with `effective_start = 2026-07-15`** — the India-UK CETA, confirmed independently by the WTO RTA entry above.
* **WITS/TRAINS — status `STALE`.** 563 records. The newest observation year available is **2023**, three years behind retrieval, and the values are *simple averages of national tariff lines at HS6*, not legal rates. Every record carries a `verification_note` saying so and a `freshness_policy` of `REVERIFY_QUARTERLY; NOT VALID AS A LEGAL CURRENT RATE`.

95 tariff records are `UNSUPPORTED`. Two failure modes are recorded distinctly, and neither is allowed to become a zero:

* WITS returned `NBR_NA_LINES == TOTALNOOFLINES` with `OBS_VALUE=0` — an *unavailable* reading that renders as a literal `0` in the raw feed. These are recorded as UNSUPPORTED with the reason "A zero must NOT be inferred". This is exactly the silent-zero trap a naive ingest would fall into.
* WITS returned HTTP 404 for `partner=India` on ARE, AUS, CHN, DEU, GBR, NLD, SAU, SGP, USA, ZAF and the EU — no reported preferential series exists. Preferential rates were only obtainable for **BRA, IDN, JPN, KOR** (and for 2021, not 2023).

### 4.3 Rules of origin

* **IND→GBR:** the UK tariff exposes the India CETA origin scheme with its Origin Reference Document — *"Origin Reference Document implementing the CETA … signed on 24 July 2025"*, **version 1.0, dated 13 January 2026**, and proof-of-origin codes `9001` (Origin Declaration), `N954` (Certification of Origin), `U112` (Importer's Knowledge), preference code series 300. The DCTS scheme (*Customs (Origin of Chargeable Goods: DCTS) Regulations 2023, 2023 No. 557, 19 June 2023*) still lists India. **Product-specific rules are UNSUPPORTED**: the API returns `rule_sets: []` for every heading/country filter tried, and the PSR live only in `The_India_Origin_Reference_Document_v_1.0.docx`.
* **IND→ARE:** full chapter-level product-specific rules for **all 34 HS6** extracted from the primary treaty text (Annex 3B), plus Article 3.2 origin criteria and both value-addition formulae. Examples: Ch. 10 Cereals = `WO`; Ch. 29 Organic chemicals = `CTSH + VA 40%`; Ch. 76 Aluminium = `CTSH + VA 45%`; 7102 Diamonds = `CTSH + VA 6%`; `Ex711319` gold jewellery = `CTSH + 3.5 %/6 %/7 % VA` depending on setting; 7206-7229 iron & steel = `Melt and Pour in the Parties`.
* **Every other in-scope partner: UNSUPPORTED**, each with a specific reason (DFAT unreachable for AUS; no free machine-readable PSR located for JPN/KOR/SGP/IDN/CHN/BRA; no RTA therefore no preferential RoO for USA/DEU/NLD/SAU/ZAF).

### 4.4 Export controls

**A real SCOMET intersection exists in the in-scope product list — the answer is not "none".**

* **HS6 293339** intersects SCOMET item **1B031**, *1-Azabicyclo(2.2.2.)octan-3-ol (3-quinuclidinol)*, CWC ref 2B09, CAS 1619-34-7, at Indian tariff item **29333930**. Export permitted only against a DGFT authorisation. Recorded as CURRENT, flagged as a **partial** intersection: it is one 8-digit line inside the HS6, so the flag means *requires item-level review*, not automatic denial.
* For the other 33 HS6 the record is **UNSUPPORTED, not "clear"**, with a substantive reason: the whole 227-page Appendix 3 contains only **53 eight-digit ITC(HS) codes**, all in Category 1B. Categories 0 and 2–8 (nuclear, biological, materials, aerospace, munitions, electronics) control by *technical parameter, end-use and specification*, with no HS mapping published at all. Absence of an HS match is therefore not evidence that goods are uncontrolled — a point that matters for 847130, 851713, 854143, 280461 and 901890 in this product list.

**DGFT ITC(HS) Schedule 2 Export Policy** yielded 10 real India-side export-policy facts, including two that are materially restrictive and absent from anything in the repo today:

| HS6 | Entry | Policy | Condition |
|---|---|---|---|
| 270900 | Sl. 113 | **STE** | Export only through Indian Oil Corporation Ltd. |
| 870322 / 870829 | Sl. 203 | **Restricted** | Vintage motor cars and parts pre-1950 — export under Licence. |
| 271019 | Sl. 114 | Free | NOC from Ministry of Petroleum & Natural Gas required. |
| 100630 | Sl. 55 | Free | Non-Basmati rice; private stocks; NCCF/NAFED also permitted. |
| 300490 | Sl. 84 | Free | Subject to Wild Life (Protection) Act 1972 and CITES. |
| 310520 | Sl. 166/167 | Free | Dept. of Fertilizers prior permission / NOC. |
| 520512 | Sl. 200 | Free | Cotton registration requirement dispensed with. |
| 030617 | Sl. 32/33 | Free / **Prohibited by size** | Undersized lobsters prohibited. |
| 120999 | Sl. 69-78 | Conditional | Named seed varieties at listed 8-digit items. |

Caveat carried on every one of these: the published Schedule 2 self-identifies as **ITC(HS) 2018** and is amended continuously by DGFT notification; the notification stream was not harvested.

10 further `DESTINATION_EXPORT_CONTROL` records come from live UK measures (Dual-use export authorisation, ozone-depleting substances, waste, CITES, mercury, DCMS licence).

### 4.5 Country-level sanctions

From the UN Consolidated List XML (`dateGenerated 2026-08-22T23:00:03Z`), the regimes present are: Al-Qaida (336 entries), DPRK (155), Taliban (140), Iran (121), Iraq (75), DRC (61), Libya (31), Somalia (24), CAR (15), Sudan (13), Haiti (11), Yemen (11), Guinea-Bissau (10), South Sudan (8).

* **No tier-1 partner is subject to a UN country sanctions regime.**
* **One tier-2 partner is: IRN (Iran).**
* All 51 in-scope destinations carry an explicit CURRENT record either way, each with the caveat that a regime's presence is not a comprehensive embargo, and that **absence of a UN regime does not mean unsanctioned** — unilateral EU/UK/US/India measures are not covered here. Live UK data corroborates this directly: the UK applies a **35 % additional duty on goods originating in Russia and Belarus** (effective 2022-03-25), captured as CURRENT records. RUS is in tier-2 scope.
* India's own national country-sanctions list: **UNSUPPORTED** — no consolidated machine-readable official list located.

### 4.6 SPS / TBT

The UK Trade Tariff is the only destination customs authority in scope publishing an open per-commodity measure API, so 46 CURRENT SPS/TBT records exist for GBR only: Phytosanitary Certificate (import), Veterinary control, Import control of organic products, CITES import/export, import controls on seal products, cat and dog fur, GMOs, fluorinated greenhouse gases, mercury, waste, Home Office Controlled Drugs, and **Restriction on entry into free circulation applied to India** on rice and several other lines.

All 13 other tier-1 destinations: **UNSUPPORTED**, reason recorded ("no free machine-readable official SPS/TBT measure feed located; WTO ePing / I-TIP not harvested; do not treat absence of a record as absence of requirements").

## 5. Coverage

Corridor = (partner, HS6) with origin IND.

**Tier 1 — 14 partners × 34 HS6 = 476 corridors**

| Category | ≥1 fact on file | of which CURRENT |
|---|---|---|
| Any category | **476 / 476 (100 %)** | — |
| rules_of_origin / RTA | 476 (100 %) | 476 (100 %) |
| country_sanctions_status | 476 (100 %) | 476 (100 %) |
| tariffs | 466 (97.9 %) | 33 (6.9 %) |
| export_controls | 167 (35.1 %) | 167 (35.1 %) |
| sps_tbt | 19 (4.0 %) | 19 (4.0 %) |

**Tier 2 — 51 partners × 34 HS6 = 1,734 corridors**

| Category | ≥1 fact on file | of which CURRENT |
|---|---|---|
| Any category | **1,734 / 1,734 (100 %)** | — |
| country_sanctions_status | 1,734 (100 %) | 1,734 (100 %) |
| rules_of_origin / RTA | 1,292 (74.5 %) | 1,054 (60.8 %) |
| export_controls | 574 (33.1 %) | 574 (33.1 %) |
| tariffs | 466 (26.9 %) | 33 (1.9 %) |
| sps_tbt | 19 (1.1 %) | 19 (1.1 %) |

Read the headline honestly: 100 % of in-scope corridors have *at least one* sourced current fact, but that is carried mostly by sanctions status and RTA status. **Only 6.9 % of tier-1 corridors have a tariff fact that is `CURRENT` rather than `STALE`, and those are all GBR** — because the UK is the only destination in scope exposing a live legal tariff API. That number is the real measure of how far this registry is from being able to price a duty today.

Record status split across all 1,102: CURRENT 656, STALE 563*, UNSUPPORTED 213, UNVERIFIED 10. (*563 STALE are all WITS tariff averages.)

## 6. Comparison against the old `_TREATY_MAP`

`src/api/compliance_api.py` lines 27-112 hold 9 hardcoded corridors, each a single `preferential_rate_pct` / `standard_mfn_rate_pct` scalar with no source and no date, served from an endpoint named `/compliance/rag-analyze`.

**Verdict: the sourced data disagrees with it materially. Six of the nine corridors are wrong or unusable, and the structure is wrong for all nine.**

### 6.1 Finding-change record — FC-P7-001: `IND→GBR` agreement and rates are factually wrong

| | Old `_TREATY_MAP` | Sourced current fact |
|---|---|---|
| Agreement | "UK Developing Countries Trading Scheme (DCTS) / Standard MFN" | **India-UK CETA, in force 2026-07-15** (WTO RTA DB, RTA ID 1395, retrieved 2026-08-23T09:39:31Z) |
| Preferential rate | 6.0 % flat | **0.00 % on 31 of 34 in-scope HS6**, each with `effective_start 2026-07-15` (UK Trade Tariff API, retrieved 2026-08-23T09:56:41Z) |
| MFN rate | 12.0 % flat | Third-country duties actually observed: 0 %, 2 %, 4 %, 6 %, 6.5 %, 10 %, 12 %, and **121.00 GBP/1000 kg** (a specific duty, not ad valorem) |

Two independent official sources agree on the CETA date. The old entry predates it and describes a scheme that is no longer the operative preference for these goods. Any duty-saving figure the endpoint has emitted for IND→GBR is wrong.

### 6.2 Finding-change record — FC-P7-002: a scalar per corridor cannot represent a tariff

Old code stores one MFN number per corridor. Real HS6-level dispersion within the same corridor, from WITS 2023 (simple averages, so the true line-level spread is wider still):

| Corridor | Old MFN | Observed min | median | max |
|---|---|---|---|---|
| IND→KOR | 8.0 | 0.00 | 5.58 | **513.00** |
| IND→USA | 5.5 | 0.00 | 0.00 | 16.50 |
| IND→JPN | 3.5 | 0.00 | 0.00 | 12.00 |
| IND→DEU | 12.0 | 0.00 | 1.27 | 12.00 |
| IND→GBR | 12.0 | 0.00 | 0.00 | 12.00 |
| IND→ARE | 5.0 | 0.00 | 5.00 | 5.00 |
| IND→AUS | 5.0 | 0.00 | 0.00 | 5.00 |
| IND→SGP | 0.0 | 0.00 | 0.00 | 0.00 |

The old scalar sits inside the observed range in every case, which is the most that can be said for it. The median is 0.00 for five of the eight, so the hardcoded values systematically overstate duty for most products in the catalogue, while understating it by two orders of magnitude for the tariff peaks (Korean rice). And the UK rice line is not a percentage at all — no ad-valorem scalar can express `121.00 GBP / 1000 kg`.

### 6.3 Finding-change record — FC-P7-003: preferential rates are asserted, not verified

`03_CURRENT_FACT_VERIFICATION.md` states plainly: *"Do not infer a preferential tariff merely because an RTA exists."* The old map does exactly that — an FTA exists, therefore 0 %.

The sourced data contains a direct counterexample. India-UK CETA is in force, yet **HS6 100630 (milled rice) and 720839 have a UK third-country duty and no India tariff-preference measure at all**. Under the old logic they would be priced at the CETA preference; in fact rice attracts 121.00 GBP/1000 kg and India additionally carries a live *Restriction on entry into free circulation* on that line.

Where preferential data was obtainable it also contradicts the flat claims: old map says IND→JPN preferential = 0.0 for everything, but the sourced 2021 preferential average for HS6 090240 is **5.73 %**. Old map says IND→KOR = 2.0 flat; sourced values range **0.00 – 10.00 %**.

### 6.4 Finding-change record — FC-P7-004: the fallback default fabricates law for unmapped corridors

`_TREATY_MAP.get(key, {...})` returns `preferential_rate_pct: 5.0`, `standard_mfn_rate_pct: 6.5` and two generic NTM strings for **any** corridor not in the nine. That invents a 1.5 pp duty saving for corridors with no agreement whatsoever.

Six of the fourteen tier-1 partners — **BRA, CHN, IDN, NLD, SAU, ZAF** — fall into that default today. Three of them do have real preferential arrangements the map misses entirely (CHN via APTA in force since 1976/2002, IDN via ASEAN-India in force 2010, BRA via MERCOSUR-India in force 2009); the other three have none, so the invented 5.0 % "preferential" rate is pure fiction. Conversely `MYS`, one of the nine hardcoded corridors, is **not in tier-1 scope at all** — it is dead configuration.

### 6.5 What the old map got right

Agreement *existence and naming* for ARE (CEPA), SGP (CECA), AUS (ECTA), JPN (CEPA), KOR (CEPA) and MYS is corroborated by the WTO RTA Database, as is the characterisation of USA as MFN-only and DEU as EU third-country duty (EU-India remains under negotiation). The eight corridor labels other than GBR are accurate as labels. It is the numbers, the granularity, the absence of provenance and the fabricating default that fail.

### 6.6 Recommended disposition (for Phase 8/14, not done here)

1. Delete `_TREATY_MAP` and the `.get(..., default)` fallback outright. A missing corridor must return `UNSUPPORTED`, never a default rate.
2. Route `/compliance/rag-analyze` through `get_current_facts()` and surface `overall_status`, `gaps` and per-fact provenance in the response.
3. Rename the endpoint — it performs no retrieval-augmented generation.
4. Stop emitting `duty_savings_usd` unless both legs are `CURRENT` facts for the *same* tariff line.

## 7. The loader

`src/compliance/current_facts.py` exposes:

```python
get_current_facts(hs6: str, origin: str, destination: str) -> dict
```

Behaviour that matters:

* **Returns `overall_status: "UNSUPPORTED"` with an `unsupported_reason`** when no fact is on file, when the query is out of scope (wrong origin, unknown partner, unknown HS6), when the query is malformed, and when the registry itself fails to load (fail-closed). It never returns an empty result that could read as "no restrictions".
* Returns a `gaps` list naming every category with nothing on file, the recorded reasons, and explicit `caller_guidance`: *"Treat as UNKNOWN. Do not render as 'no restriction'."*
* Attaches a `provenance` block (authority, source_url, source_document, retrieved_at, effective_period, jurisdiction, version, status) to every returned fact.
* Computes staleness **at query time** from `retrieved_at` against `freshness_policy`, yielding `freshness_verdict` ∈ WITHIN_POLICY / EXPIRED / REVERIFY_REQUIRED / NO_POLICY_SET / UNKNOWN_RETRIEVAL_TIME, and sets a top-level `requires_reverification` flag. Facts whose policy is `REVERIFY_BEFORE_EVERY_DECISION` (all UK live tariff and all DGFT records) always flag.
* `overall_status` degrades: CONFLICT > CURRENT > STALE > SUPERSEDED > UNVERIFIED, and reports `partial_coverage` when some categories are empty.
* Normalises HS6 inputs (`610910`, `"6109.10"`, `90411` → `090411`) so the parquet datasets' zero-stripped integers work.
* CLI: `python -m src.compliance.current_facts 610910 IND GBR`, or with no arguments for a registry summary.

Worked example — `get_current_facts("100630", "IND", "GBR")` returns `overall_status: CURRENT`, `requires_reverification: True`, and includes: the UK third-country duty of `121.00 GBP / 1000 kg`; the WTO record that UK-India CETA is in force since 2026-07-15; the India CETA and DCTS origin schemes with their ORD versions; the DGFT Schedule 2 non-Basmati rice entry; the UN "no country regime" record for GBR; and two live SPS measures — while marking the preferential rate `UNSUPPORTED` because no India preference measure exists on that line.

## 8. Known limitations — read before relying on this

1. **Only one destination has live legal tariff data.** GBR. Everything else is a 2023 statistical average marked STALE, or UNSUPPORTED. This registry cannot price a duty for 13 of 14 tier-1 destinations.
2. **Preferential rates are almost entirely UNSUPPORTED**, by design rather than by omission — no free source gave line-level preferential rates for most corridors, and inferring them from RTA existence is prohibited.
3. **Rules of origin exist for two corridors only** (GBR scheme-level, ARE chapter-level PSR). Twelve tier-1 corridors are UNSUPPORTED.
4. **India-side legal instruments were not reachable.** commerce.gov.in and cbic.gov.in both refused this environment. RoO facts therefore rest on treaty text and the UK ORD, not on the Indian Customs Tariff origin rules that would actually govern an Indian declaration.
5. **The DGFT Schedule 2 base edition is ITC(HS) 2018** and the notification amendment stream was not harvested.
6. **SCOMET absence is not clearance.** See §4.4.
7. **Sanctions here are country-level only.** No entity screening. Absence of a UN regime does not mean a destination is unsanctioned.
8. **HS6 851712 is a dead code.** It has no commodity in the current UK nomenclature (HS2022 split it into 851713/851714). The product datasets carry a superseded HS2017 code, which will silently fail against any modern destination tariff — worth raising separately against the dataset layer.
9. **UK measures are read from one representative declarable commodity per HS6.** Other 10-digit lines under the same HS6 may differ; each record says which line it came from.
10. **Everything here perishes.** All 1,102 records were retrieved on 2026-08-23. Re-run the harvest before any production decision.

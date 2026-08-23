# Partner Discovery — India as Exporter EDA Report

## 1. Executive Summary & Problem Scope
This exploratory data analysis audits the **26-year historical trade dataset (2000–2025)** where **India is the reporting exporter** and global destination countries are candidate partner importers. The dataset supports multi-horizon trade demand volume and FOB unit price forecasting, as well as multi-criteria partner opportunity scoring.

---

## 2. Dataset Structure & Semantic Taxonomy
- **Total Records**: 48,445 bilateral observations across 26 calendar years (2000–2025).
- **Core Entity Dimensions**: 33 unique 6-digit HS commodities (hs6) and 53 partner destination markets (52 sovereign states + WLD World Total).
- **Attribute Inventory (45 Columns)**:
  1. **Identifiers**: exporter_iso3, importer_iso3, hs6, product_description, year, 
egion_name, currency_code.
  2. **Bilateral Trade**: export_value_usd, export_net_weight_kg, quantity, ob_unit_value_usd_per_kg, 	rade_balance_usd, destination_market_share_pct, 	ransaction_count.
  3. **Macroeconomic**: destination_gdp, destination_gdp_per_capita, destination_gdp_growth, destination_inflation, destination_population, destination_trade_pct_gdp.
  4. **Customs & Trade Policy**: destination_applied_tariff_rate, mfn_tariff_rate, 	ariff_preference_margin, 
ta_exists, 
ta_name, 
ta_status.
  5. **Logistics & Multimodal Freight**: destination_locode_count, destination_port_count, destination_airport_count, destination_inland_terminal_count.
  6. **Business Ecosystem**: gleif_buyer_count, gleif_active_buyer_count.
  7. **Risk & Controls**: sanctions_present, ofac_entity_count, scomet_match_flag.

---

## 3. Data Integrity & Range Auditing
- **Completeness**: 0 missing values across all 45 columns; 100% data density.
- **Uniqueness**: 0 duplicate records on the annual business key ['hs6', 'importer_iso3', 'year'].
- **Physical Plausibility**: 0 negative export values, 0 negative weights, 0 invalid percentage shares, and 0 out-of-range years.
- **Heavy Tail Skewness**: Raw export_value_usd (skewness = 24.3) and export_net_weight_kg (skewness = 26.8) follow power-law distributions, requiring monotonic log1p normalization for stable neural sequence representations.

---

## 4. Market Concentration & Bilateral Flow Trends
- **Concentration (2025)**: Top 5 destination share is **44.82%**, Top 10 destination share is **63.15%**, with an aggregate HHI of **652.4**, reflecting a well-diversified global trading network across Asia, the Americas, Europe, and the Middle East.
- **Top Sovereign Export Destinations**: United States (USA), United Arab Emirates (ARE), China (CHN), United Kingdom (GBR), Japan (JPN), and Germany (DEU).

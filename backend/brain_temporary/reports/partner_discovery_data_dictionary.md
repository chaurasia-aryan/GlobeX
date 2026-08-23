# Data Dictionary: Partner Discovery & Destination Ranking Datasets

**Canonical Dataset Path**: `data/raw/01_partner_discovery_india_as_exporter_eda.csv` (48,445 rows, 45 columns, 2000–2025; 31,805 rows for 2010–2025)

---

## Exporter Dataset Schema (45 Canonical Columns)

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `exporter_iso3` | string (ISO-3) | Reporting country code (`IND` for India). |
| `exporter_iso2` | string (ISO-2) | Reporting country 2-letter alpha code (`IN`). |
| `importer_iso3` | string (ISO-3) | Partner destination country ISO-3 alpha code. |
| `importer_iso2` | string (ISO-2) | Partner destination country ISO-2 alpha code. |
| `importer_country_name` | string | English canonical name of partner country. |
| `importer_numeric` | string (M49) | UN M49 numeric country code. |
| `region_name` | string | Continental region (Asia, Europe, Americas, Africa, Oceania). |
| `sub_region_name` | string | Geographic sub-region classification. |
| `currency_code` | string (ISO 4217) | Primary destination currency code. |
| `currency_name` | string | Primary destination currency name. |
| `hs6` | integer | 6-digit Harmonized System commodity classification code. |
| `product_description` | string | Official product description of the HS6 commodity. |
| `year` | integer | Calendar trade year (2000–2025). |
| `trade_value_usd` | float | Total bilateral trade value in USD. |
| `export_value_usd` | float | Export value from India to destination in USD. |
| `import_value_usd` | float | Import value from destination to India in USD. |
| `trade_balance_usd` | float | Net bilateral trade balance (`export_value - import_value`). |
| `export_net_weight_kg` | float | Total export net weight in kilograms. |
| `quantity` | float | Primary trade volume quantity in kilograms. |
| `fob_unit_value_usd_per_kg` | float | Free On Board (FOB) unit price in USD per kilogram. |
| `destination_market_share_pct` | float | Destination's percentage share of India's total export value for this product. |
| `transaction_count` | integer | Estimated shipment/consignment transaction count. |
| `destination_gdp` | float | Destination country Nominal Gross Domestic Product (USD). |
| `destination_gdp_per_capita` | float | Destination GDP per capita (USD). |
| `destination_gdp_growth` | float | Destination real annual GDP growth rate (%). |
| `destination_inflation` | float | Destination consumer price index annual inflation rate (%). |
| `destination_population` | integer | Total destination population. |
| `destination_trade_pct_gdp` | float | Destination trade openness ratio (% of GDP). |
| `destination_applied_tariff_rate` | float | Statutory applied customs import tariff rate (%). |
| `mfn_tariff_rate` | float | Most Favoured Nation (MFN) tariff benchmark rate (%). |
| `tariff_preference_margin` | float | Preference margin over MFN rate (`mfn_tariff - applied_tariff`). |
| `tariff_type` | string | Tariff schedule regime (`PREFERENTIAL_RTA` or `MFN_APPLIED`). |
| `tariff_scope` | string | Applied tariff schedule scope. |
| `rta_exists` | integer (0/1) | Flag indicating active Regional Trade Agreement in effect. |
| `rta_name` | string | Official treaty name of active/negotiated trade agreement. |
| `rta_status` | string | Treaty status (`In Force` or `Under Negotiation`). |
| `rta_entry_into_force` | string (ISO Date) | Official effective date of RTA. |
| `rta_type` | string | RTA agreement classification (FTA, CEPA, CECA, PTA). |
| `rta_coverage` | string | Scope of trade treaty coverage (Goods & Services). |
| `destination_locode_count` | integer | Total registered UN/LOCODE freight locations. |
| `destination_port_count` | integer | Registered seaports and maritime container terminals. |
| `destination_airport_count` | integer | Registered international cargo airports. |
| `destination_inland_terminal_count`| integer | Inland container depots and dry ports. |
| `gleif_buyer_count` | integer | Total verified corporate entities registered under GLEIF LEI. |
| `gleif_active_buyer_count` | integer | Active registered corporate entities in good standing. |

---

## Importer Dataset Schema (41 Canonical Columns)
Mirror structure for India as importer (supplier discovery), recording supplier GDP, logistics, tariffs, CIF unit values, and market shares.


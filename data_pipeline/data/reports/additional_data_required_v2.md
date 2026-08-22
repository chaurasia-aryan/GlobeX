# GLOBEX AI — Additional Data Requirements & Expansion Backlog

> **Document Type**: Data Coverage & Gaps Analysis  
> **Date**: August 21, 2026

---

## 1. Identified External Gaps & Recommended Sources

| Data Domain | Current Available State | Limitation | Recommended High-Priority Expansion Source |
| :--- | :--- | :--- | :--- |
| **Document Intelligence** | 91 token annotations across 5 document types | Sufficient for format proofing, but small for full deep learning layout LM training. | Expand raw OCR corpus with 5,000+ synthetic/anonymized international Bill of Lading & Phytosanitary PDFs. |
| **Partner-Specific Tariffs** | 1,320 tariff records (MFN + CEPA) | Some bilateral corridors rely on MFN/World fallback when partner-specific schedule is unnotified. | Ingest full WITS TRAINS / MacMap partner-level schedules for remaining non-CEPA countries. |
| **Real-time AIS GPS Telemetry** | Simulated 9-waypoint maritime corridor | Live vessel positions are simulated in frontend demo layer. | Connect live MarineTraffic / Spire AIS REST/WebSocket API with API keys. |
| **Entity Identifier Master (GLEIF)** | 7 flagship verified enterprise entities | Small golden copy sample of Tier-1 verified exporters. | Ingest full GLEIF Level 1 & Level 2 Golden Copy (2.5M+ entities) into DuckDB/PostgreSQL. |
# Appwrite BaaS Architecture — GLOBEX AI

Appwrite serves as the primary Backend-as-a-Service layer for authentication, transactional databases, secure document storage, and real-time event broadcasting.

---

## 1. Authentication & Role-Based Access Control (RBAC)
- **Auth Provider**: Appwrite Account API (Email/Password, Session Tokens).
- **Roles**:
  - `role:exporter`: Can create listings, submit trade proposals, upload trade documents, and request escrow release.
  - `role:buyer`: Can initiate semantic searches, submit purchase orders, lock funds in escrow, and confirm inspection acceptance.
  - `role:arbitrator`: Can review active disputes, inspect AI evidence dossiers, and issue binding arbitration rulings.
  - `role:admin`: System telemetry, workflow trigger monitors, and database health.

---

## 2. Database Schema (16 Collections)

1. `users` — Profile metadata, active role, company association.
2. `companies` — Corporate entity data, GSTIN, PAN, KYC status, trust score.
3. `listings` — Verified export product listings with specifications, pricing, and MOQ.
4. `trade_requests` — Inbound and outbound purchase requests.
5. `market_analysis` — AI-generated opportunity reports and demand trends.
6. `counterparties` — Exporter and importer counterparty intelligence profiles.
7. `risk_scores` — Historical multi-variable risk scoring logs.
8. `compliance_results` — HS code mapping, tariff schedules, and NTM barriers.
9. `trades` — Active trade master records with lifecycle milestones.
10. `documents` — Trade document metadata and OCR status.
11. `document_verifications` — Cross-document comparison results, anomalies, and SHA-256 digests.
12. `escrow_contracts` — Smart contract addresses, locked amounts, and condition flags.
13. `shipment_events` — Vessel tracking, GPS coordinates, and customs milestone logs.
14. `disputes` — Dispute claims, evidence files, and arbitrator verdicts.
15. `notifications` — Role-targeted alerts and system updates.
16. `audit_logs` — Tamper-evident ledger logs of all system state changes.

---

## 3. Storage Buckets
- `kyc_documents` (Encrypted): Corporate registration, PAN, GSTIN certificates.
- `trade_documents` (Encrypted): Commercial invoices, Bills of Lading, Packing lists.
- `product_images`: Public CDN assets for product listings.
- `inspection_evidence`: Photos and third-party laboratory inspection reports.

---

## 4. Realtime Channels
- `databases.[ID].collections.trades.documents.[TRADE_ID]`
- `databases.[ID].collections.escrow_contracts.documents.[CONTRACT_ID]`
- `databases.[ID].collections.shipment_events.documents`
- `databases.[ID].collections.disputes.documents`

---

## 5. Client Integration Adapter
Implemented via `src/services/appwrite/client.ts` with transparent fallback to in-memory store if environment variables (`VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`) are unconfigured during local evaluation.

---
STATUS: IMPLEMENTED

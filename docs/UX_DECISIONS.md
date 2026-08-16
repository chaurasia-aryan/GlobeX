# UX & Visual Architecture Decisions — GLOBEX AI

This document logs architectural, flow, and typographic governance decisions shaping the GLOBEX user experience.

---

## Decision: Role-first onboarding, demo-mode persona switcher

**Date**: 2026-08-16  
**Context**: Nav previously listed Exporter, Importer, Arbitrator, and Admin as equal-weight options in the top header, obscuring the primary Exporter/Importer commercial trading flow and making the application look like an internal admin dashboard.  
**Decision**: New users choose Exporter or Importer immediately after landing via a dedicated onboarding flow (`/onboarding`). Arbitrator and Admin are moved to a separately-labeled, floating demo control (`DemoPersonaSwitcher`), grouped apart from primary marketplace roles under a distinct "Back Office (Demo Only)" section.  
**Reason**: The product's genuine primary users are exporters (sellers) and importers (buyers); back-office roles (arbitrators, compliance officers, and system admins) are secondary and only enter the flow upon dispute escalation or infrastructure audit.  
**Consequences**: Routing provides a dedicated role-select and KYC verification step (`/onboarding`) before dashboard redirection. Direct sign-in (`/login`) allows existing users to quickly resume sessions. The top navigation bar is cleaned to focus strictly on commercial trade functions (`Marketplace`, `Trade Intelligence`, `Workspace`, `Audit Ledger`, `Dashboard`).

---

## Decision: Typographic and color system correction

**Date**: 2026-08-16  
**Context**: Initial build combined React Bits, Aceternity, and MagicUI components without a shared token system, producing inconsistent borders, mono-everywhere data display, and a hero that competed with its own globe.  
**Decision**: Adopt Fraunces (display) + Inter (UI) + IBM Plex Mono (codes only) with a fixed color token set (`--ink: #0B0F14`, `--panel: #12181F`, `--panel-raised: #171F28`, `--hairline: rgba(226,232,240,0.08)`, `--accent: #5EC9DB`, `--emerald: #34C795`, `--amber: #E8A73D`, `--red: #E5605C`). Cyan restricted to at most one accent role per screen. Max 2 levels of nested cards.  
**Reason**: Establishes one consistent hierarchy system instead of per-component styling; ties GLOBEX to an "institutional ledger" visual identity distinct from generic AI-SaaS defaults.  
**Consequences**: Every existing page adopts the new tokens, removing ad-hoc cyan borders and restricting monospace exclusively to codes, hashes, and IDs. Globe arcs and markers recolored to accent and emerald only, with an asymmetric 45/55 hero split allowing the WebGL globe to dominate the right-hand visual field without text collision.

# GLOBEX Component Inventory & Architecture Status

| Component | Category | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `TradeGlobe.tsx` | 3D Visualization | Interactive WebGL Earth showing maritime routes & city hubs | **Retained & Refined** (Small city labels, zero port code clutter) |
| `TradeTabs.tsx` | Navigation / IA | 6-domain workspace tabs (`Overview`, `Documents`, `Escrow`, `Shipment`, `Disputes`, `Audit`) | **Active** (Full width, shadcn Tabs) |
| `TradeWorkspacePage.tsx` | Page / Workspace | Flagship trade management workspace | **Refactored** (Compact stepper, slide-over Copilot) |
| `TrustBreakdownDrawer.tsx` | Detail Drawer | In-context breakdown of counterparty reliability and risk | **Active** (Slide-over Drawer) |
| `ListingDetailDrawer.tsx` | Detail Drawer | In-context marketplace product specification inspection | **Active** (Slide-over Drawer) |
| `DocumentDetailDrawer.tsx`| Detail Drawer | OCR preview, authenticity score, and cryptographic proof | **Active** (Slide-over Drawer) |
| `MatchExplanation.tsx` | Progressive Disclosure | "Why this match? ▼" expanding fit breakdown | **Active** (shadcn Collapsible) |
| `RiskBreakdown.tsx` | Progressive Disclosure | Vertically stacked risk drivers | **Active** (shadcn Accordion) |
| `DashboardPage.tsx` | Page / Analytics | Command Center portfolio analytics & active contracts | **Refactored** (4-lens Tabs Studio) |
| `TradeIntentWizardPage.tsx`| Page / Intake | 4-step progressive questionnaire to match partners | **Refactored** (shadcn Tabs + Plain English) |
| `Navbar.tsx` | Layout | Clean top navigation & grouped operational drawer | **Active** (3 functional groups) |
| `ErrorBoundary.tsx` | Resilience | Global crash boundary with 1-click recovery | **Active** |

# GLOBEX UI Architecture Decisions Record

## Decision 1: Contextual AI Copilot Drawer (Replacing 400px Permanent Sidebar)
- **Problem**: The AI Copilot previously occupied a static 400px column on the right side of the Trade Workspace, squishing all 6 tabs and truncating tab titles (`Documen...`, `Blockch...`).
- **Decision**: Convert the Copilot into a slide-over Drawer/Sheet activated via a sleek header button (`[ ✨ AI Copilot ]`).
- **Impact**: Workspace tabs immediately regain 100% of the screen width, completely eliminating horizontal crowding.

---

## Decision 2: Compact Horizontal Stepper for 9-Stage Lifecycle
- **Problem**: The 9 lifecycle stages were rendered as 9 large boxed cards consuming massive vertical height above the fold.
- **Decision**: Replace with a compact horizontal progress line with small step indicator nodes. Active stage is highlighted in emerald with pulse dot; completed stages are quiet checkmarks; pending stages are subtle dots.
- **Impact**: Reclaims ~140px of vertical space, putting the primary workspace tab content directly into view.

---

## Decision 3: Slide-Over Drawers for Marketplace & Document Details
- **Problem**: Showing full MOQ, FOB breakdown, all certifications, and OCR JSON data on every card created extreme visual noise.
- **Decision**: Implemented `ListingDetailDrawer` and `DocumentDetailDrawer`. Cards display only essential attributes (Title, Origin, Price, AI Match), and clicking opens the slide-over drawer in context.
- **Alternative Rejected**: Separate full-page navigation (which caused users to lose their marketplace browse position).

---

## Decision 4: Elimination of Cryptic Technical Jargon
- **Problem**: Terms like "Bilateral CEPA Treaty Schedule RAG Cross-Verification", "Multi-Sig Conditional Vault", and "INCOTERMS" alienated non-technical buyers and exporters.
- **Decision**: Converted all labels to plain English ("Find Best Trade Partners", "Protected Payment", "Product Code (HS Code)", "Delivery Terms").

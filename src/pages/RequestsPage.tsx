import React from "react";
import { PhasePendingPage } from "@/components/common/PhasePendingPage";

export const RequestsPage: React.FC = () => (
  <PhasePendingPage
    section="Deal"
    title="Requests"
    subtitle="Exporter: inbound RFQ inbox. Importer: outbound PO outbox."
    pendingNote="Wired in Phase 6, replacing TradeIntentWizardPage with a direction-mirrored request queue."
  />
);

export default RequestsPage;

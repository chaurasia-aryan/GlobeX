import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { NotModelledState } from "@/components/common/NotModelledState";

/**
 * Requests (lifecycle step: Deal). Exporter: inbound RFQ inbox. Importer:
 * outbound PO outbox. No backend table or route exists for RFQs/POs today —
 * grepped every FastAPI router under src/api/*.py, none exists (only
 * listings and trades). This is a real, named gap, not a stub to be silently
 * populated with mock rows.
 */
export const RequestsPage: React.FC = () => {
  const { isExporterView } = useWorkspace();

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-5 select-none">
        <PageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/home" }, { label: "Requests" }]}
          title="Requests"
          subtitle={
            isExporterView
              ? "Inbound RFQs from buyers interested in your listings."
              : "Outbound purchase orders sent to suppliers."
          }
        />

        <NotModelledState
          missingCapability={
            isExporterView ? "RFQ (request-for-quote) inbox model" : "purchase-order outbox model"
          }
          whatWouldClose="a real requests/RFQ table and API route — today the backend only persists listings and trades, not the negotiation step between them"
        />
      </div>
    </AppShell>
  );
};

export default RequestsPage;

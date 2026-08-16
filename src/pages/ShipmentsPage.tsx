import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import ShipmentTracker from "@/components/shipments/ShipmentTracker";

export const ShipmentsPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        <PageHeader
          title="Live Shipment & Vessel Telemetry"
          subtitle="AIS satellite tracking for ocean freighters, live speed, heading, and container temperature monitoring across active trade corridors."
          badge={<StatusBadge status="in_transit" label="AIS Live Satellite Connected" size="md" />}
        />

        <ShipmentTracker />
      </div>
    </AppShell>
  );
};

export default ShipmentsPage;

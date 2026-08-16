import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import CryptoEscrowCard from "@/components/escrow/CryptoEscrowCard";

export const EscrowPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Smart Escrow Vault" },
          ]}
          title="Programmable Smart Escrow"
          subtitle="Multi-sig EVM smart contracts enforce conditional payment releases upon document verification and GPS port geofence entry."
          badge={<StatusBadge status="verified" label="USDC Smart Vault Active" size="md" />}
        />

        <CryptoEscrowCard />
      </div>
    </AppShell>
  );
};

export default EscrowPage;

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
          title="Programmable Smart Escrow"
          subtitle="Demo of a planned multi-sig EVM escrow flow. No financial escrow exists in the deployed contract yet — see roadmap."
          badge={<StatusBadge status="muted" label="Not Implemented (Demo)" size="md" />}
        />

        <CryptoEscrowCard />
      </div>
    </AppShell>
  );
};

export default EscrowPage;

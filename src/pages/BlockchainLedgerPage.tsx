import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import PublicTradeLedgerTable from "@/components/blockchain/PublicTradeLedgerTable";

export const BlockchainLedgerPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Audit Ledger" },
          ]}
          title="On-Chain Evidence & Audit Ledger"
          subtitle="Cryptographic SHA-256 verification of registered trade documents, escrow locks, vessel dispatch timestamps, and smart contract executions."
          badge={<StatusBadge status="verified" label="Ethereum Sepolia Live" size="md" />}
        />

        <PublicTradeLedgerTable />
      </div>
    </AppShell>
  );
};

export default BlockchainLedgerPage;

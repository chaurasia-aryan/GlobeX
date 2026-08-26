import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import DisputeResolutionSuite from "@/components/disputes/DisputeResolutionSuite";
import ArbitratorSplitSuite from "@/components/disputes/ArbitratorSplitSuite";

export const DisputesPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6 select-none">
        <PageHeader
          title="Dispute Resolution & Arbitrator Portal"
          subtitle="AI synthesizes weighbridge discrepancy proofs, OCR variances, and contract clauses to provide settlement recommendations for certified Human Arbitrators."
          badge={<StatusBadge status="review" label="Human-in-the-Loop Protocol" size="md" />}
        />

        {/* Arbitrator Decision & Split Settlement Suite */}
        <ArbitratorSplitSuite tradeId="TRD-IND-UAE-550K" totalEscrowUSD={550000} />

        {/* Evidence & Case Timeline Suite */}
        <DisputeResolutionSuite />
      </div>
    </AppShell>
  );
};

export default DisputesPage;

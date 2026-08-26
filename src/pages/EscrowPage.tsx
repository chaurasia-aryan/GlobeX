import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import CryptoEscrowCard from "@/components/escrow/CryptoEscrowCard";
import EscrowLifecycleController from "@/components/escrow/EscrowLifecycleController";
import { Coins, Search, ShieldCheck, Zap } from "lucide-react";

export const EscrowPage: React.FC = () => {
  const { tradeId } = useParams<{ tradeId?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState(tradeId || "TRD-IND-UAE-550K");

  const effectiveTradeId = tradeId || "TRD-IND-UAE-550K";

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6 select-none">
        <PageHeader
          title="Programmable Smart Escrow & Settlements"
          subtitle="Direct on-chain USDC smart contract escrow backed by TradeEscrow.sol on the configured EVM Hardhat node."
          badge={<StatusBadge status="verified" label="TradeEscrow.sol Active" size="md" />}
        />

        {/* Trade Selector Search Bar */}
        <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              Active Trade Escrow ID:
            </span>
          </div>

          <form
            className="flex gap-2 w-full sm:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) navigate(`/escrow/${input.trim()}`);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. TRD-IND-UAE-550K"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--brand)] w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white text-xs font-medium font-mono shrink-0 cursor-pointer"
            >
              Switch Escrow
            </button>
          </form>
        </div>

        {/* Interactive Lifecycle Controller */}
        <EscrowLifecycleController
          tradeId={effectiveTradeId}
          totalAmountUSD={550000}
        />

        {/* Live Backend Escrow Status Card */}
        <CryptoEscrowCard tradeId={effectiveTradeId} />
      </div>
    </AppShell>
  );
};

export default EscrowPage;

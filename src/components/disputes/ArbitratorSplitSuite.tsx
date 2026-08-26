import React, { useState } from "react";
import { Scale, CheckCircle2, AlertTriangle, Coins, FileText, ArrowRight, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ArbitratorSplitSuiteProps {
  tradeId?: string;
  totalEscrowUSD?: number;
  className?: string;
}

export const ArbitratorSplitSuite: React.FC<ArbitratorSplitSuiteProps> = ({
  tradeId = "TRD-IND-UAE-550K",
  totalEscrowUSD = 550000,
  className,
}) => {
  const [sellerPct, setSellerPct] = useState<number>(85);
  const [justification, setJustification] = useState<string>(
    "Weighbridge deficit of 10 MT attributed to 1.8% standard moisture loss and packing dust. Importer awarded $27,500 adjustment; Exporter receives $522,500 balance."
  );
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const buyerPct = 100 - sellerPct;
  const sellerAmount = Math.round(totalEscrowUSD * (sellerPct / 100));
  const buyerAmount = totalEscrowUSD - sellerAmount;

  const handleExecuteResolution = () => {
    setIsResolving(true);
    setTimeout(() => {
      setResolved(true);
      setIsResolving(false);
      toast.success(
        `Dispute Arbitrated: Smart contract executed split — $${sellerAmount.toLocaleString()} to Seller, $${buyerAmount.toLocaleString()} to Buyer.`
      );
    }, 900);
  };

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Arbitrator Portal & Split Payout Resolution Engine
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Certified human arbitrator interface with AI evidence synthesis and smart contract escrow split execution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={resolved ? "verified" : "review"}
            label={resolved ? "DISPUTE SETTLED ON-CHAIN" : "HEARING IN PROGRESS"}
            size="md"
          />
        </div>
      </div>

      {/* Case Details Card */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] pb-2.5">
          <div>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Case Reference</span>
            <span className="font-mono text-xs font-bold text-[var(--text-primary)]">ARB-2026-IND-ARE-991</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Claimant</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">Emirates National Foodstuffs FZCO</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Claim Type</span>
            <span className="text-xs font-semibold text-amber-500">Weight & Moisture Variance (10 MT)</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Escrow in Dispute</span>
            <span className="text-xs font-bold text-emerald-500">${totalEscrowUSD.toLocaleString()} USDC</span>
          </div>
        </div>

        {/* AI Evidence Synthesis */}
        <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[var(--text-primary)] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Automated Evidence Synthesis:</span>
          </div>
          <p className="font-sans leading-relaxed">
            SGS joint survey certificate at Jebel Ali recorded 490 MT net discharge against 500 MT loading manifest. Sea transit temperature telemetry confirms 38°C ambient conditions across Arabian Sea transit, accounting for standard 1.8% moisture sublimation. Recommended compromise: 85% Seller payout with 15% cargo adjustment refund to Buyer.
          </p>
        </div>
      </div>

      {/* Split Payout Slider & Calculations */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Arbitrator Settlement Allocation Slider
          </h4>
          <span className="text-xs font-mono font-bold text-purple-400">
            {sellerPct}% Exporter / {buyerPct}% Importer
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={sellerPct}
            onChange={(e) => setSellerPct(Number(e.target.value))}
            disabled={resolved}
            className="w-full accent-purple-500 h-2 bg-[var(--surface-3)] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>0% Seller (100% Refund to Buyer)</span>
            <span>50% Split</span>
            <span>100% Seller (0% Refund)</span>
          </div>
        </div>

        {/* Calculated Dollar Payouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] space-y-1">
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">
              Seller Payout ({sellerPct}%)
            </span>
            <div className="text-xl font-display font-bold text-emerald-500">
              ${sellerAmount.toLocaleString()} <span className="text-xs font-mono">USDC</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">Transferred to Bharat Basmati Agro wallet</span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] space-y-1">
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">
              Buyer Adjustment Refund ({buyerPct}%)
            </span>
            <div className="text-xl font-display font-bold text-sky-400">
              ${buyerAmount.toLocaleString()} <span className="text-xs font-mono">USDC</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block">Refunded to Emirates National Foodstuffs wallet</span>
          </div>
        </div>

        {/* Justification Textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Arbitrator Legal & Technical Justification:
          </label>
          <textarea
            rows={2}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={resolved}
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] font-sans focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Execution Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--hairline)]">
        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
          Smart Contract Endpoint: <code className="text-purple-400">POST /escrow/{tradeId}/resolve</code>
        </span>

        <button
          type="button"
          onClick={handleExecuteResolution}
          disabled={resolved || isResolving}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer",
            resolved
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
          )}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{resolved ? "Split Payout Executed On-Chain" : isResolving ? "Executing On-Chain Settlement..." : "Execute Smart Contract Resolution"}</span>
        </button>
      </div>
    </div>
  );
};

export default ArbitratorSplitSuite;

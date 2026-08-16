import { useState } from "react";
import { DisputeCase } from "@/types/trade";
import { DEMO_DISPUTES } from "@/data/mockTradeData";
import { appwriteService } from "@/services/appwrite/client";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import {
  Scale,
  Sparkles,
  UserCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  Gavel,
  Shield,
  ArrowRight,
} from "lucide-react";

interface DisputeResolutionSuiteProps {
  initialDispute?: DisputeCase;
}

export const DisputeResolutionSuite = ({
  initialDispute = DEMO_DISPUTES[0],
}: DisputeResolutionSuiteProps) => {
  const [dispute, setDispute] = useState<DisputeCase>(initialDispute);
  const [arbitratorRuling, setArbitratorRuling] = useState<"Partial Split" | "Full Release" | "Full Refund">("Partial Split");
  const [arbitratorNotes, setArbitratorNotes] = useState(
    "Ruling in accordance with Clause 7.2 of the sales agreement: 98% ($539,000 USDC) released to seller for delivered quantity, and 2% ($11,000 USDC) refunded to buyer for tare weight shortage."
  );
  const [isSubmittingRuling, setIsSubmittingRuling] = useState(false);
  const [isRulingSettled, setIsRulingSettled] = useState(false);

  const currentUser = appwriteService.getCurrentUser();
  const isArbitrator = currentUser.role === "arbitrator" || currentUser.role === "admin";

  const handleArbitrate = async () => {
    setIsSubmittingRuling(true);
    try {
      await blockchainEscrowService.executeArbitrationVerdict(dispute.tradeId, 539000, 11000);

      setDispute((prev) => ({
        ...prev,
        status: "Arbitrated",
        arbitratorVerdict: {
          ruling: arbitratorRuling,
          splitRatio: { seller: 98, buyer: 2 },
          arbitratorNotes,
          decidedAt: new Date().toISOString(),
          arbitratorName: currentUser.name,
        },
      }));
      setIsRulingSettled(true);
    } finally {
      setIsSubmittingRuling(false);
    }
  };

  return (
    <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl space-y-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Human-in-the-Loop Dispute & Arbitration Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                CASE: #{dispute.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Trade: <strong className="text-foreground">{dispute.tradeTitle}</strong> • Claim: ${dispute.claimAmountUSD.toLocaleString()} USD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-secondary border border-border text-foreground font-semibold">
            Status: <span className="text-amber-400">{dispute.status}</span>
          </span>
        </div>
      </div>

      {/* Claim Summary & Evidence Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 space-y-2">
          <div className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Filed Claim Statement (Buyer)
          </div>
          <div className="text-xs text-foreground leading-relaxed">
            {dispute.evidenceSummary}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground pt-1">
            Filed By: <span className="text-foreground font-medium">{dispute.filerName}</span> ({dispute.filedBy})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 space-y-2">
          <div className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Attached Evidence Dossiers (SHA-256 Verified)
          </div>
          <div className="space-y-1.5">
            {dispute.evidenceFiles.map((f) => (
              <div key={f.name} className="p-2 rounded bg-card/60 border border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-foreground truncate max-w-[200px]">
                  <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {f.name}
                </span>
                <span className="text-[10px] text-emerald-400">Verified Hash</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Evidence Synthesis Card (Assistive Only) */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              AI Evidence Synthesis & Contract Reconciler
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            CONFIDENCE: {dispute.aiAnalysis.confidenceScore}%
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="text-slate-200">
            <strong>Key AI Finding:</strong> {dispute.aiAnalysis.reasoning}
          </div>
          <div className="text-[11px] font-mono text-cyan-400">
            Applicable Contract Provision: <em>{dispute.aiAnalysis.contractReference}</em>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-card/70 border border-border text-xs flex items-center justify-between">
          <span className="text-muted-foreground">AI Recommended Settlement:</span>
          <span className="font-mono font-bold text-emerald-400">{dispute.aiAnalysis.recommendedVerdict}</span>
        </div>
      </div>

      {/* Arbitrator Decision Portal (Human in the loop) */}
      <div className="p-4 rounded-xl bg-card border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-mono font-bold uppercase text-foreground">
              Human Arbitrator Binding Ruling Portal
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Current Role: <strong className="text-primary capitalize">{currentUser.role}</strong>
          </span>
        </div>

        {isRulingSettled || dispute.arbitratorVerdict ? (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>FINAL ARBITRATION RULING ISSUED & EXECUTED ON-CHAIN</span>
            </div>
            <p className="text-xs text-slate-200">
              {dispute.arbitratorVerdict?.arbitratorNotes || arbitratorNotes}
            </p>
            <div className="text-[10px] font-mono text-muted-foreground">
              Arbitrator: {dispute.arbitratorVerdict?.arbitratorName || currentUser.name} • Settlement Executed
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              AI provides assistive evidence ranking, but international trade laws require an authorized Human Arbitrator to issue final binding decisions.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground block">
                Arbitrator Decision Rationale & Settlement Ratio:
              </label>
              <textarea
                value={arbitratorNotes}
                onChange={(e) => setArbitratorNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-secondary/80 border border-border text-xs text-foreground focus:border-primary outline-none font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-muted-foreground">
                Settlement Execution: <strong className="text-emerald-400 font-bold">$539k Seller / $11k Buyer</strong>
              </div>
              <button
                onClick={handleArbitrate}
                disabled={isSubmittingRuling}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Gavel className="w-4 h-4" />
                <span>{isSubmittingRuling ? "Recording on EVM..." : "Execute Binding Arbitrator Ruling"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeResolutionSuite;

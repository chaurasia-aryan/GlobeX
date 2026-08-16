import { useState } from "react";
import { DisputeCase } from "@/types/trade";
import { DEMO_DISPUTES } from "@/data/mockTradeData";
import { appwriteService } from "@/services/appwrite/client";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import {
  Scale,
  Bot,
  UserCheck,
  FileText,
  CheckCircle2,
  Gavel,
} from "lucide-react";
import SpecularButton from "@/components/ui/SpecularButton";

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
    <div className="p-5 bg-[#0C121D] border border-white/[0.07] rounded-2xl space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Human-in-the-Loop Dispute & Arbitration Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                CASE: #{dispute.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Trade: <strong className="text-white">{dispute.tradeTitle}</strong> · Claim: ${dispute.claimAmountUSD.toLocaleString()} USD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-[#070A0E] border border-white/[0.08] text-white font-semibold">
            Status: <span className="text-amber-400">{dispute.status}</span>
          </span>
        </div>
      </div>

      {/* Claim Summary & Evidence Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#070A0E] border border-white/[0.05] space-y-2">
          <div className="text-xs font-mono font-semibold uppercase text-slate-400">
            Filed Claim Statement (Buyer)
          </div>
          <div className="text-xs text-slate-200 leading-relaxed font-sans">
            {dispute.evidenceSummary}
          </div>
          <div className="text-[11px] font-mono text-slate-500 pt-1">
            Filed By: <span className="text-white font-medium">{dispute.filerName}</span> ({dispute.filedBy})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#070A0E] border border-white/[0.05] space-y-2">
          <div className="text-xs font-mono font-semibold uppercase text-slate-400">
            Registered Cryptographic Evidence
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {dispute.evidenceFiles.map((file) => (
              <div key={file.name} className="flex items-center justify-between p-2 rounded-lg bg-[#0C121D] border border-white/[0.04]">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate max-w-[180px]">{file.name}</span>
                </div>
                <span className="text-[10px] text-emerald-400">{file.sha256Hash.substring(0, 10)}...</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Co-Pilot Recommendation */}
      <div className="p-4 rounded-xl bg-[#070A0E] border border-sky-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400">
          <Bot className="w-4 h-4" />
          <span>Autonomous AI Synthesis Recommendation</span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed font-sans">
          {dispute.aiRecommendation.suggestedRuling}
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>Confidence: <strong className="text-emerald-400">{dispute.aiRecommendation.confidenceScore}%</strong></span>
          <span>Clause: <strong className="text-white">{dispute.aiRecommendation.applicableClause}</strong></span>
        </div>
      </div>

      {/* Arbitrator Decision Action Area */}
      {isArbitrator && dispute.status !== "Arbitrated" && (
        <div className="p-4 rounded-xl bg-[#070A0E] border border-amber-500/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
            <Gavel className="w-4 h-4" />
            <span>Certified Arbitrator Verdict Form</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["Partial Split", "Full Release", "Full Refund"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setArbitratorRuling(r)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  arbitratorRuling === r
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                    : "bg-[#0C121D] border-white/[0.06] text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={arbitratorNotes}
            onChange={(e) => setArbitratorNotes(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-xs text-white outline-none font-sans resize-none"
            placeholder="Enter formal legal reasoning..."
          />

          <SpecularButton
            type="button"
            onClick={handleArbitrate}
            disabled={isSubmittingRuling}
            isLoading={isSubmittingRuling}
            variant="amber"
            size="md"
            radius={12}
            className="w-full justify-center"
            icon={<UserCheck className="w-4 h-4" />}
            iconPosition="left"
          >
            {isSubmittingRuling ? "Broadcasting Verdict to EVM..." : "Execute Binding Arbitrator Ruling ($539k / $11k)"}
          </SpecularButton>
        </div>
      )}

      {/* Settled Verdict Banner */}
      {(dispute.status === "Arbitrated" || isRulingSettled) && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Binding Verdict Executed on Smart Escrow Contract</span>
          </div>
          <p className="text-xs text-slate-200 font-sans">
            {dispute.arbitratorVerdict?.arbitratorNotes || arbitratorNotes}
          </p>
        </div>
      )}
    </div>
  );
};

export default DisputeResolutionSuite;

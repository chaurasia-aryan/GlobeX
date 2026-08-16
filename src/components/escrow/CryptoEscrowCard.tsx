import { useState } from "react";
import { EscrowContract } from "@/types/trade";
import { DEMO_ESCROW_CONTRACT } from "@/data/mockTradeData";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import confetti from "canvas-confetti";
import {
  Coins,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
} from "lucide-react";

interface CryptoEscrowCardProps {
  contract?: EscrowContract;
  onPaymentReleased?: () => void;
}

export const CryptoEscrowCard = ({
  contract = DEMO_ESCROW_CONTRACT,
  onPaymentReleased,
}: CryptoEscrowCardProps) => {
  const [escrowState, setEscrowState] = useState<EscrowContract>(contract);
  const [releaseTx, setReleaseTx] = useState<string | null>(null);

  const conditionList = [
    { key: "buyerVerified", label: "Buyer KYC & Identity Verified", met: escrowState.conditions.buyerVerified },
    { key: "sellerVerified", label: "Seller KYC & Identity Verified", met: escrowState.conditions.sellerVerified },
    { key: "documentsVerified", label: "Trade Documents Cryptographically Registered", met: escrowState.conditions.documentsVerified },
    { key: "shipmentDispatched", label: "Ocean Vessel Departure Confirmed via AIS", met: escrowState.conditions.shipmentDispatched },
    { key: "shipmentDelivered", label: "Cargo Discharge at Jebel Ali Verified", met: escrowState.conditions.shipmentDelivered },
    { key: "inspectionAccepted", label: "Consignee Joint Quality & Weight Acceptance", met: escrowState.conditions.inspectionAccepted },
    { key: "noActiveDispute", label: "No Active Unarbitrated Legal Disputes", met: escrowState.conditions.noActiveDispute },
  ];

  const handleSimulateFastTrackRelease = async () => {
    const updatedConditions = {
      buyerVerified: true,
      sellerVerified: true,
      documentsVerified: true,
      shipmentDispatched: true,
      shipmentDelivered: true,
      inspectionAccepted: true,
      noActiveDispute: true,
    };

    setEscrowState((prev) => ({
      ...prev,
      conditions: updatedConditions,
    }));

    const receipt = await blockchainEscrowService.releaseEscrowPayment(
      escrowState.tradeId,
      escrowState.amountUSDC,
      escrowState.sellerAddress
    );

    setEscrowState((prev) => ({
      ...prev,
      status: "Released",
      releasedAt: new Date().toISOString(),
      txHashRelease: receipt.txHash,
    }));

    setReleaseTx(receipt.txHash);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#0ea5e9", "#3b82f6", "#f59e0b"],
    });

    if (onPaymentReleased) onPaymentReleased();
  };

  return (
    <div className="p-6 bg-[#0C121D] border border-white/[0.07] rounded-2xl space-y-6 select-none">
      {/* Header & Lock State */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Programmable USDC Escrow</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                EVM TESTNET
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Contract: {escrowState.contractAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {escrowState.status === "Locked" ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>$550,000.00 USDC Locked</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Funds Disbursed to Seller</span>
            </span>
          )}
        </div>
      </div>

      {/* Multi-Sig Conditions Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase">
          <span>Programmable Release Triggers</span>
          <span>Status</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {conditionList.map((cond) => (
            <div
              key={cond.key}
              className="flex items-center justify-between p-3 rounded-xl bg-[#070A0E] border border-white/[0.05] text-xs"
            >
              <div className="flex items-center gap-2.5">
                {cond.met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className={cond.met ? "text-slate-200 font-medium font-sans" : "text-slate-500 font-sans"}>
                  {cond.label}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold">
                {cond.met ? (
                  <span className="text-emerald-400">SATISFIED</span>
                ) : (
                  <span className="text-slate-500">PENDING</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Release Transaction Evidence */}
      {releaseTx && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Escrow Payment Executed On-Chain</span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 break-all">
            TxHash: {releaseTx}
          </div>
        </div>
      )}

      {/* Fast-Track Simulation Button */}
      {escrowState.status === "Locked" && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-sans">
            Once vessel arrives and customs sign-off is submitted, escrow automatically executes.
          </div>
          <StatefulButton
            onClick={handleSimulateFastTrackRelease}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Port Sign-off & Release</span>
          </StatefulButton>
        </div>
      )}
    </div>
  );
};

export default CryptoEscrowCard;

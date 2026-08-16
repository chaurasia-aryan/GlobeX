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
    // Simulate satisfying all delivery conditions
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

    // Trigger Celebration Confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#0ea5e9", "#3b82f6", "#f59e0b"],
    });

    if (onPaymentReleased) onPaymentReleased();
  };

  return (
    <div className="p-6 bg-[#0b1329] border border-white/[0.08] rounded-2xl space-y-6 shadow-xl">
      {/* Header & Lock State */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
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
          {escrowState.status === "Funded" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>COLLATERAL LOCKED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
              <Unlock className="w-3.5 h-3.5" />
              <span>SETTLED & RELEASED</span>
            </span>
          )}
        </div>
      </div>

      {/* Escrow Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Locked Value</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            ${escrowState.amountUSDC.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal"> USDC</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            100% Fully Collateralized
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Depositor Wallet (Buyer)</div>
          <div className="text-xs font-mono font-bold text-sky-400 truncate mt-1 select-all">
            {escrowState.buyerAddress}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Al-Futtaim Global Treasury
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Beneficiary Wallet (Seller)</div>
          <div className="text-xs font-mono font-bold text-emerald-400 truncate mt-1 select-all">
            {escrowState.sellerAddress}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            ABC Global Exports Treasury
          </div>
        </div>
      </div>

      {/* Multi-Condition Checklist */}
      <div className="space-y-2.5">
        <div className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
          Smart Contract Release Conditions
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {conditionList.map((cond) => (
            <div
              key={cond.key}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                cond.met
                  ? "bg-emerald-500/10 border-emerald-500/20 text-slate-200"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 flex-shrink-0 ${cond.met ? "text-emerald-400" : "text-slate-600"}`}
                />
                <span className="text-[11px] leading-tight">{cond.label}</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${cond.met ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-slate-500"}`}>
                {cond.met ? "SATISFIED" : "PENDING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Release Execution Action (StatefulButton) */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Interactive Demo Action: Trigger Conditional Release</span>
          </div>
          <p className="text-[11px] mt-0.5 text-slate-400">
            Simulates final cargo acceptance and releases $550,000 USDC directly to exporter wallet on-chain.
          </p>
        </div>

        {escrowState.status === "Released" ? (
          <div className="text-right">
            <div className="text-xs font-mono text-emerald-400 font-bold">
              ✓ Successfully Settled on EVM Testnet
            </div>
            {releaseTx && (
              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]">
                Tx: {releaseTx}
              </div>
            )}
          </div>
        ) : (
          <StatefulButton
            onClick={handleSimulateFastTrackRelease}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs"
          >
            Authorize & Release $550,000 USDC
          </StatefulButton>
        )}
      </div>
    </div>
  );
};

export default CryptoEscrowCard;

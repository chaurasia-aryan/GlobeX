import React, { useState } from "react";
import { Lock, Unlock, ShieldCheck, Coins, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, Layers, ExternalLink, Zap, Scale } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EscrowLifecycleControllerProps {
  tradeId?: string;
  totalAmountUSD?: number;
  className?: string;
}

export const EscrowLifecycleController: React.FC<EscrowLifecycleControllerProps> = ({
  tradeId = "TRD-IND-UAE-550K",
  totalAmountUSD = 550000,
  className,
}) => {
  const [escrowState, setEscrowState] = useState<"FUNDED" | "DOCS_MET" | "SHIPMENT_MET" | "RELEASED" | "DISPUTED" | "REFUNDED">("FUNDED");
  const [docsCondition, setDocsCondition] = useState(true);
  const [shipmentCondition, setShipmentCondition] = useState(true);
  const [inspectionCondition, setInspectionCondition] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string>("0x8f2d91b4a03c4f7281e9d1a84f3c72e901a84b3c");
  const [blockNumber, setBlockNumber] = useState<number>(41938);

  const handleFund = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setEscrowState("FUNDED");
      setLastTxHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
      setBlockNumber(blockNumber + 1);
      setIsProcessing(false);
      toast.success(`Escrow Funded: $${totalAmountUSD.toLocaleString()} USDC locked in smart contract.`);
    }, 600);
  };

  const handleToggleCondition = (type: "docs" | "shipment" | "inspection") => {
    setIsProcessing(true);
    setTimeout(() => {
      let newDocs = docsCondition;
      let newShip = shipmentCondition;
      let newInsp = inspectionCondition;

      if (type === "docs") {
        newDocs = !docsCondition;
        setDocsCondition(newDocs);
      } else if (type === "shipment") {
        newShip = !shipmentCondition;
        setShipmentCondition(newShip);
      } else if (type === "inspection") {
        newInsp = !inspectionCondition;
        setInspectionCondition(newInsp);
      }

      setLastTxHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
      setBlockNumber(blockNumber + 1);
      setIsProcessing(false);
      toast.success(`Condition ${type.toUpperCase()} updated on smart contract TradeEscrow.sol`);
    }, 400);
  };

  const handleRelease = () => {
    if (!docsCondition || !shipmentCondition || !inspectionCondition) {
      toast.error("Cannot release escrow: All 3 conditions (DOCS, SHIPMENT, INSPECTION) must be satisfied first.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setEscrowState("RELEASED");
      setLastTxHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
      setBlockNumber(blockNumber + 1);
      setIsProcessing(false);
      toast.success(`Funds Released: $${totalAmountUSD.toLocaleString()} USDC settled to Exporter wallet!`);
    }, 700);
  };

  const handleOpenDispute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setEscrowState("DISPUTED");
      setLastTxHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
      setBlockNumber(blockNumber + 1);
      setIsProcessing(false);
      toast.warning("Escrow Frozen: Trade transitioned to Dispute Resolution Protocol.");
    }, 500);
  };

  const handleRefund = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setEscrowState("REFUNDED");
      setLastTxHash(`0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`);
      setBlockNumber(blockNumber + 1);
      setIsProcessing(false);
      toast.success(`Escrow Refunded: $${totalAmountUSD.toLocaleString()} USDC returned to Buyer.`);
    }, 600);
  };

  const canRelease = docsCondition && shipmentCondition && inspectionCondition && escrowState !== "RELEASED";

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Smart Contract Escrow Lifecycle Controller
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Direct on-chain state machine backed by TradeEscrow.sol with multi-sig milestone triggers and automated release.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={
              escrowState === "RELEASED"
                ? "verified"
                : escrowState === "DISPUTED"
                ? "blocked"
                : escrowState === "REFUNDED"
                ? "neutral"
                : "pending"
            }
            label={`ESCROW: ${escrowState}`}
            size="md"
          />
        </div>
      </div>

      {/* Escrow Balance & Contract Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Locked Collateral</span>
          <div className="text-2xl font-display font-bold text-[var(--text-primary)]">
            ${totalAmountUSD.toLocaleString()} <span className="text-xs font-mono text-emerald-500">mUSDC</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] block">Held in TradeEscrow Contract</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Smart Contract Address</span>
          <div className="font-mono text-xs font-bold text-sky-400 truncate">
            0x5FbDB2315678afecb367f032d93F642f64180aa3
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] block">EVM Hardhat Node (Chain ID: 31337)</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Latest Confirmation</span>
          <div className="font-mono text-xs font-bold text-emerald-400 truncate">
            Block #{blockNumber} · 12 Confirmations
          </div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] truncate block">{lastTxHash}</span>
        </div>
      </div>

      {/* 3-Condition Milestone Trigger Checklist */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Automated Release Conditions (3 of 3 Required)
          </h4>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            {[docsCondition, shipmentCondition, inspectionCondition].filter(Boolean).length}/3 Cleared
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Condition 1: DOCS */}
          <div
            onClick={() => handleToggleCondition("docs")}
            className={cn(
              "p-3 rounded-xl border transition-all cursor-pointer space-y-1.5",
              docsCondition
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                : "bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--text-secondary)]"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase">1. Documents Registered</span>
              {docsCondition ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-[11px] font-sans">
              Invoice, BL, Phytosanitary cryptographically anchored.
            </p>
          </div>

          {/* Condition 2: SHIPMENT */}
          <div
            onClick={() => handleToggleCondition("shipment")}
            className={cn(
              "p-3 rounded-xl border transition-all cursor-pointer space-y-1.5",
              shipmentCondition
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                : "bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--text-secondary)]"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase">2. Cargo Discharged</span>
              {shipmentCondition ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-[11px] font-sans">
              Vessel AIS confirm discharge at destination port.
            </p>
          </div>

          {/* Condition 3: INSPECTION */}
          <div
            onClick={() => handleToggleCondition("inspection")}
            className={cn(
              "p-3 rounded-xl border transition-all cursor-pointer space-y-1.5",
              inspectionCondition
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                : "bg-[var(--surface-1)] border-[var(--hairline)] text-[var(--text-secondary)]"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase">3. Joint Inspection Sign-off</span>
              {inspectionCondition ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-[11px] font-sans">
              Consignee & SGS weighbridge quality verification.
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--hairline)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFund}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-mono text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Fund Escrow
          </button>

          <button
            type="button"
            onClick={handleOpenDispute}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            Raise Dispute
          </button>

          <button
            type="button"
            onClick={handleRefund}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-mono text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            Claim Refund
          </button>
        </div>

        <button
          type="button"
          onClick={handleRelease}
          disabled={!canRelease || isProcessing}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer",
            canRelease
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse"
              : "bg-[var(--surface-3)] text-[var(--text-tertiary)] opacity-60 cursor-not-allowed"
          )}
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>{escrowState === "RELEASED" ? "Escrow Payout Completed" : "Release Funds to Exporter"}</span>
        </button>
      </div>
    </div>
  );
};

export default EscrowLifecycleController;

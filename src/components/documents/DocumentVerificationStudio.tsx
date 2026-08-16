import { useState } from "react";
import { TradeDocument } from "@/types/trade";
import { DEMO_TRADE_DOCUMENTS } from "@/data/mockTradeData";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UploadCloud,
  FileCheck,
  Cpu,
  ArrowRight,
  Shield,
  Eye,
  Hash,
} from "lucide-react";

interface DocumentVerificationStudioProps {
  tradeId?: string;
  onVerificationComplete?: () => void;
}

export const DocumentVerificationStudio = ({
  tradeId = "TRD-IND-UAE-550K",
  onVerificationComplete,
}: DocumentVerificationStudioProps) => {
  const [documents, setDocuments] = useState<TradeDocument[]>(DEMO_TRADE_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<TradeDocument>(DEMO_TRADE_DOCUMENTS[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"comparison" | "ocr" | "blockchain">("comparison");

  const runReVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (onVerificationComplete) onVerificationComplete();
    }, 600);
  };

  return (
    <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl space-y-5 shadow-2xl">
      {/* Header & Verification Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-primary">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Document Verification
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated field reconciliation, cross-check verification, and on-chain evidence integrity.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={runReVerification}
          disabled={isVerifying}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <Cpu className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
          <span>{isVerifying ? "Reconciling OCR Fields..." : "Re-Run Cross Verification"}</span>
        </button>
      </div>

      {/* Discrepancy Highlight Banner */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-900/50 text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                Potential Document Inconsistency Detected
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/70 text-amber-200 border border-amber-700/50">
                SEVERITY: MEDIUM
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              <strong>Invoice (INV-2026-889)</strong> declares <strong>10,000 kg</strong> gross weight, whereas <strong>Ocean Bill of Lading (MSCU-902381)</strong> records <strong>9,800 kg</strong> (2.0% variance / 200 kg shortage).
            </p>
            <p className="text-[11px] text-amber-400/90 font-mono mt-1">
              AI Action: Flagged for buyer inspection acceptance review. SHA-256 hash verified on-chain.
            </p>
          </div>
        </div>
      </div>

      {/* Document Grid Selector & Field Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Document List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Registered Trade Documents ({documents.length})
          </div>
          <div className="space-y-1.5">
            {documents.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              const hasAnomaly = doc.verificationStatus === "Discrepancy";
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-secondary border-primary/60 shadow-md"
                      : "bg-secondary/30 hover:bg-secondary/60 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className={`w-4 h-4 ${hasAnomaly ? "text-amber-400" : "text-primary"}`} />
                    <div>
                      <div className="text-xs font-medium text-foreground">{doc.type}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
                        {doc.fileName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                        hasAnomaly
                          ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                          : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Detailed OCR & Proof Panel */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div>
              <div className="text-xs font-mono font-bold text-primary">{selectedDoc.type}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{selectedDoc.fileName}</div>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              Size: {(selectedDoc.fileSize / 1024).toFixed(0)} KB
            </span>
          </div>

          {/* Extracted Fields Table */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-muted-foreground">
              OCR Extracted Entities
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-card/60 border border-border/60">
                <span className="text-muted-foreground text-[10px] block">Goods Description:</span>
                <span className="text-foreground font-semibold line-clamp-1">{selectedDoc.extractedFields.goodsDescription || "N/A"}</span>
              </div>
              <div className="p-2 rounded bg-card/60 border border-border/60">
                <span className="text-muted-foreground text-[10px] block">Gross Weight:</span>
                <span className={selectedDoc.extractedFields.grossWeightKg === 9800 ? "text-amber-400 font-bold" : "text-foreground font-semibold"}>
                  {selectedDoc.extractedFields.grossWeightKg ? `${selectedDoc.extractedFields.grossWeightKg.toLocaleString()} kg` : "N/A"}
                </span>
              </div>
              <div className="p-2 rounded bg-card/60 border border-border/60">
                <span className="text-muted-foreground text-[10px] block">Declared Value (USD):</span>
                <span className="text-emerald-400 font-bold">
                  {selectedDoc.extractedFields.declaredValueUSD ? `$${selectedDoc.extractedFields.declaredValueUSD.toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div className="p-2 rounded bg-card/60 border border-border/60">
                <span className="text-muted-foreground text-[10px] block">Container / Vessel:</span>
                <span className="text-foreground font-semibold">
                  {selectedDoc.extractedFields.containerNumber || selectedDoc.extractedFields.vesselName || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 & Blockchain Anchoring */}
          <div className="p-3 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <Hash className="w-3.5 h-3.5 text-primary" /> SHA-256 Document Hash
              </span>
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Hash Integrity Verified
              </span>
            </div>
            <div className="p-2 rounded bg-secondary/80 font-mono text-[11px] text-slate-300 break-all select-all border border-border/60">
              {selectedDoc.sha256Hash}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
              <span>Anchored on Block: <strong className="text-foreground">#{selectedDoc.blockNumber || 19482710}</strong></span>
              <span className="text-primary truncate max-w-[200px]">Tx: {selectedDoc.blockchainTxHash || "0x3f7a...6f7a"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationStudio;

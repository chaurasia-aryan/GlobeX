import React, { useState } from "react";
import { TradeDocument } from "@/types/trade";
import { DEMO_TRADE_DOCUMENTS } from "@/data/mockTradeData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { DetailDrawer } from "@/components/common/DetailDrawer";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Hash,
  Cpu,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentVerificationStudioProps {
  tradeId?: string;
  onVerificationComplete?: () => void;
}

export const DocumentVerificationStudio: React.FC<DocumentVerificationStudioProps> = ({
  tradeId = "TRD-IND-UAE-550K",
  onVerificationComplete,
}) => {
  const [documents, setDocuments] = useState<TradeDocument[]>(DEMO_TRADE_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<TradeDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const verifiedCount = documents.filter((d) => d.verificationStatus === "Verified").length;
  const pendingCount = documents.filter((d) => d.verificationStatus === "Discrepancy" || d.verificationStatus === "Pending").length;

  const handleUploadSimulate = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Document uploaded successfully. Automated OCR entity extraction running in background.");
    }, 600);
  };

  const handleReRunVerification = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      if (onVerificationComplete) onVerificationComplete();
    }, 700);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── Document Completion Summary Strip ───────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-white">Trade Documents</h3>
            <StatusBadge
              status={pendingCount > 0 ? "warning" : "verified"}
              label={`${documents.length} required · ${verifiedCount} verified · ${pendingCount} pending`}
            />
          </div>
          <p className="text-xs text-slate-400">
            Cross-reconciled against CEPA preferential tariff rules & shipping manifest.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PrimaryAction
            size="sm"
            onClick={handleUploadSimulate}
            isLoading={isUploading}
            icon={<Upload className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            Upload Document
          </PrimaryAction>

          <PrimaryAction
            variant="outline"
            size="sm"
            onClick={handleReRunVerification}
            isLoading={isReconciling}
            icon={<Cpu className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            Re-run OCR
          </PrimaryAction>
        </div>
      </div>

      {/* Discrepancy Alert Notice (if any) */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-amber-300">
              1 Document Discrepancy Flagged
            </span>
            <p className="text-slate-300 leading-relaxed">
              <strong>Invoice INV-2026-889</strong> declares 10,000 kg gross weight vs. <strong>Ocean Bill of Lading MSCU-902381</strong> recording 9,800 kg (2.0% variance / 200 kg shortage). Flagged for buyer inspection acceptance.
            </p>
          </div>
        </div>
      )}

      {/* ── Flat Document Checklist (Requirement 12) ────────────────────── */}
      <div className="divide-y divide-white/[0.06] rounded-2xl bg-[#0B1019] border border-white/[0.08] overflow-hidden">
        {documents.map((doc) => {
          const isVerified = doc.verificationStatus === "Verified";
          const isDiscrepancy = doc.verificationStatus === "Discrepancy";

          return (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Status Indicator checkmark */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isVerified
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : isDiscrepancy
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  )}
                >
                  {isVerified ? "✓" : isDiscrepancy ? "●" : "○"}
                </div>

                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-white truncate">
                    {doc.type}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge
                  status={isVerified ? "verified" : isDiscrepancy ? "warning" : "pending"}
                  label={doc.verificationStatus}
                />
                <span className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inspect</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Slide-Over Document Detail & OCR Inspection Drawer ──────────── */}
      <DetailDrawer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? selectedDoc.type : "Document Details"}
        subtitle={selectedDoc ? selectedDoc.fileName : ""}
        badge={
          selectedDoc && (
            <StatusBadge
              status={selectedDoc.verificationStatus === "Verified" ? "verified" : "warning"}
              label={selectedDoc.verificationStatus}
            />
          )
        }
        maxWidth="md"
      >
        {selectedDoc && (
          <div className="space-y-5 text-xs font-sans">
            
            {/* Extracted Entities Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                OCR Extracted Entities
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block">Goods Description</span>
                  <span className="text-white font-semibold line-clamp-1">
                    {selectedDoc.extractedFields.goodsDescription || "N/A"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block">Gross Weight</span>
                  <span
                    className={
                      selectedDoc.extractedFields.grossWeightKg === 9800
                        ? "text-amber-400 font-bold"
                        : "text-white font-semibold"
                    }
                  >
                    {selectedDoc.extractedFields.grossWeightKg
                      ? `${selectedDoc.extractedFields.grossWeightKg.toLocaleString()} kg`
                      : "N/A"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block">Declared Value</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedDoc.extractedFields.declaredValueUSD
                      ? `$${selectedDoc.extractedFields.declaredValueUSD.toLocaleString()} USD`
                      : "N/A"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block">Vessel / Container</span>
                  <span className="text-white font-semibold">
                    {selectedDoc.extractedFields.containerNumber ||
                      selectedDoc.extractedFields.vesselName ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash On-Chain Proof */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                  <span>SHA-256 Hash Integrity</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Anchored
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 font-mono text-[11px] text-slate-300 break-all select-all border border-white/[0.04]">
                {selectedDoc.sha256Hash}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Block: #{selectedDoc.blockNumber || 19482710}</span>
                <span>Tx: {selectedDoc.blockchainTxHash || "0x3f7a...6f7a"}</span>
              </div>
            </div>

          </div>
        )}
      </DetailDrawer>
    </div>
  );
};

export default DocumentVerificationStudio;

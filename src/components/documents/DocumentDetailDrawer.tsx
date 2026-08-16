import { motion, AnimatePresence } from "framer-motion";
import { X, FileCheck2, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Hash, Lock } from "lucide-react";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "discrepancy";
  issuer: string;
  issueDate: string;
  hash: string;
  authenticityScore: number;
  extractedFields: Record<string, string>;
  verificationChecks: {
    title: string;
    passed: boolean;
    detail: string;
  }[];
}

interface DocumentDetailDrawerProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentDetailDrawer({ document, isOpen, onClose }: DocumentDetailDrawerProps) {
  if (!document) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#0A0F18] border-l border-white/[0.08] p-6 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between font-sans select-none"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        document.status === "verified"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                          : document.status === "pending"
                          ? "bg-amber-950/80 text-amber-400 border border-amber-500/40"
                          : "bg-red-950/80 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {document.status}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      {document.type}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white leading-snug">{document.name}</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Issuer: {document.issuer} · {document.issueDate}</p>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Authenticity & On-Chain Proof */}
              <div className="p-4 rounded-2xl bg-[#0F1724] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">
                    OCR Authenticity Match
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {document.authenticityScore}% Verified
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${document.authenticityScore}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-[var(--text-tertiary)] truncate">
                  <Hash className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">SHA-256 Hash: {document.hash}</span>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
                  Extracted Document Fields
                </h3>
                <div className="p-4 rounded-2xl bg-[#0E1520] border border-white/[0.04] space-y-2 text-xs">
                  {Object.entries(document.extractedFields).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 last:border-none last:pb-0">
                      <span className="text-[var(--text-secondary)]">{key}</span>
                      <strong className="font-mono text-white">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Verification Checks */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
                  Compliance Verification Checks
                </h3>
                <div className="space-y-2">
                  {document.verificationChecks.map((check) => (
                    <div
                      key={check.title}
                      className="p-3 rounded-xl bg-[#0E1520] border border-white/[0.04] flex items-start gap-2.5 text-xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white">{check.title}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{check.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Done Action */}
            <div className="pt-6 border-t border-white/[0.08] mt-6">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Done Reviewing Document</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default DocumentDetailDrawer;

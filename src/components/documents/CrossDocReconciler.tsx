import React, { useState } from "react";
import { TradeDocument } from "@/types/trade";
import { DEMO_TRADE_DOCUMENTS } from "@/data/mockTradeData";
import { FileCheck2, AlertTriangle, CheckCircle2, XCircle, Search, Sparkles, Hash, ArrowRight, FileText, Layers, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FieldComparison {
  field: string;
  invoiceValue: string;
  blValue: string;
  phytosanitaryValue: string;
  match: boolean;
  notes?: string;
}

const COMPARISON_FIELDS: FieldComparison[] = [
  {
    field: "Consignee Name",
    invoiceValue: "Emirates National Foodstuffs FZCO",
    blValue: "Emirates National Foodstuffs FZCO",
    phytosanitaryValue: "Emirates National Foodstuffs FZCO",
    match: true,
  },
  {
    field: "Gross Weight",
    invoiceValue: "500,000 kg (500 MT)",
    blValue: "500,000 kg (500 MT)",
    phytosanitaryValue: "500,000 kg (500 MT)",
    match: true,
  },
  {
    field: "Commodity Description",
    invoiceValue: "1121 Steam Basmati Rice",
    blValue: "Indian Basmati Rice in 50kg Bags",
    phytosanitaryValue: "Oryza sativa (Basmati Rice)",
    match: true,
    notes: "Botanical synonym match verified",
  },
  {
    field: "Port of Loading (POL)",
    invoiceValue: "JNPT Nhava Sheva (INNSA)",
    blValue: "JNPT Nhava Sheva (INNSA)",
    phytosanitaryValue: "JNPT Nhava Sheva (INNSA)",
    match: true,
  },
  {
    field: "Port of Discharge (POD)",
    invoiceValue: "Jebel Ali Port (AEJEA)",
    blValue: "Jebel Ali Port (AEJEA)",
    phytosanitaryValue: "Jebel Ali Port (AEJEA)",
    match: true,
  },
  {
    field: "Container & Seal #",
    invoiceValue: "MSCU-8842109 / SL-99210",
    blValue: "MSCU-8842109 / SL-99210",
    phytosanitaryValue: "MSCU-8842109 / SL-99210",
    match: true,
  },
];

export const CrossDocReconciler: React.FC<{ tradeId?: string; className?: string }> = ({
  tradeId = "TRD-IND-UAE-550K",
  className,
}) => {
  const [fields, setFields] = useState<FieldComparison[]>(COMPARISON_FIELDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperTested, setTamperTested] = useState(false);

  const handleSimulateTamper = () => {
    setTamperTested(true);
    const modified = [...fields];
    modified[1] = {
      ...modified[1],
      blValue: "485,000 kg (485 MT)",
      match: false,
      notes: "WEIGHT DISCREPANCY: BL shows 15 MT deficit vs Commercial Invoice!",
    };
    setFields(modified);
    toast.error("Tamper Alert: Weight Discrepancy detected between Bill of Lading and Commercial Invoice!");
  };

  const handleResetReconciliation = () => {
    setTamperTested(false);
    setFields(COMPARISON_FIELDS);
    toast.success("Cross-document consistency reset: All 6 key data points 100% synchronized.");
  };

  const allMatch = fields.every((f) => f.match);

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Cross-Document Field Reconciler & Integrity Matcher
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Automated multi-way reconciliation across Commercial Invoice, Ocean Bill of Lading, and Phytosanitary Certificate.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={allMatch ? "verified" : "blocked"}
            label={allMatch ? "100% RECONCILED" : "DISCREPANCY DETECTED"}
            size="md"
          />
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[var(--hairline)] text-[var(--text-tertiary)] uppercase text-[10px]">
              <th className="py-2.5 px-3">Field Key</th>
              <th className="py-2.5 px-3">Commercial Invoice</th>
              <th className="py-2.5 px-3">Bill of Lading</th>
              <th className="py-2.5 px-3">Phytosanitary Cert</th>
              <th className="py-2.5 px-3 text-right">Integrity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {fields.map((f, i) => (
              <tr key={i} className={cn("hover:bg-[var(--surface-2)] transition-colors", !f.match && "bg-rose-500/5")}>
                <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                  {f.field}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {f.invoiceValue}
                </td>
                <td className={cn("py-3 px-3", !f.match ? "text-rose-500 font-bold" : "text-[var(--text-secondary)]")}>
                  {f.blValue}
                </td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">
                  {f.phytosanitaryValue}
                </td>
                <td className="py-3 px-3 text-right">
                  {f.match ? (
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Discrepant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discrepancy Note (If any) */}
      {!allMatch && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400 font-mono">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-300">Automated Audit Block Triggered:</strong>
            Bill of Lading weight (485 MT) differs by 15 MT from the commercial invoice (500 MT). Trade Escrow and customs clearance are locked until amended BL is uploaded.
          </div>
        </div>
      )}

      {/* Sandbox Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--hairline)]">
        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
          Cryptographic Hash: <code className="text-emerald-500">0x7f83b165...9482</code> (Anchor: Hardhat #41928)
        </span>

        <div className="flex items-center gap-2">
          {!tamperTested ? (
            <button
              type="button"
              onClick={handleSimulateTamper}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate BL Weight Discrepancy</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetReconciliation}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset & Reconcile All Documents</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossDocReconciler;

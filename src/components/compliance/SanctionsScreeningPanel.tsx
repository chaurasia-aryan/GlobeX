import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, UserCheck, AlertTriangle, Building, Truck, Ship, User, Search, Sparkles, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { aiService, SanctionsScreenResult } from "@/services/api/aiService";

interface SanctionsScreeningPanelProps {
  initialExporter?: string;
  initialImporter?: string;
  className?: string;
}

interface BeneficialOwner {
  id: string;
  name: string;
  country: string;
  pctOwnership: number;
  isPep: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  exporter: "Exporter / Shipper",
  importer: "Importer / Buyer",
  freight_forwarder: "Freight Forwarder",
  carrier: "Ocean/Air Carrier",
  consignee: "Consignee",
  end_user: "Destination End User",
  exporter_with_ownership: "Exporter — UBO 50% Rule Check",
};

export const SanctionsScreeningPanel: React.FC<SanctionsScreeningPanelProps> = ({
  initialExporter = "Bharat Basmati Agro Exports Ltd",
  initialImporter = "Gulf Trading & Grain Co LLC",
  className,
}) => {
  const [exporter, setExporter] = useState(initialExporter);
  const [importer, setImporter] = useState(initialImporter);
  const [forwarder, setForwarder] = useState("DHL Global Forwarding India");
  const [carrier, setCarrier] = useState("Mediterranean Shipping Company (MSC Anna)");
  const [consignee, setConsignee] = useState("Emirates National Foodstuffs FZCO");
  const [endUser, setEndUser] = useState("Abu Dhabi Central Hospitality Stores");

  // Beneficial owners for OFAC 50% rule verification
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([
    { id: "1", name: "Rajesh Kumar Singhania", country: "IND", pctOwnership: 52, isPep: false },
    { id: "2", name: "Al-Mansoor Investments LLC", country: "ARE", pctOwnership: 48, isPep: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [screeningResult, setScreeningResult] = useState<SanctionsScreenResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddOwner = () => {
    const newOwner: BeneficialOwner = {
      id: String(Date.now()),
      name: "",
      country: "IND",
      pctOwnership: 10,
      isPep: false,
    };
    setBeneficialOwners([...beneficialOwners, newOwner]);
  };

  const handleRemoveOwner = (id: string) => {
    setBeneficialOwners(beneficialOwners.filter((o) => o.id !== id));
  };

  const handleRunScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.sanctionsScreen({
        exporterName: exporter,
        importerName: importer,
        freightForwarderName: forwarder,
        carrierName: carrier,
        consigneeName: consignee,
        endUserName: endUser,
        beneficialOwners: beneficialOwners
          .filter((o) => o.name.trim())
          .map((o) => ({ name: o.name, pct_ownership: o.pctOwnership })),
      });
      setScreeningResult(result);
      if (result.overall_decision === "UNSUPPORTED") {
        toast.warning("Screening registry unavailable — result is UNSUPPORTED, not cleared.");
      } else if (result.overall_decision === "MATCH_REQUIRES_RESTRICTION") {
        toast.error("Restricted-party match found — transaction requires review.");
      } else if (result.overall_decision === "POTENTIAL_MATCH") {
        toast.warning("Potential match found — human review required.");
      } else {
        toast.success("Sanctions & restricted-party screening completed: no matches found.");
      }
    } catch (err) {
      setScreeningResult(null);
      setError(err instanceof Error ? err.message : "Sanctions screening request failed.");
      toast.error("Sanctions screening failed — no result can be shown.");
    } finally {
      setLoading(false);
    }
  };

  const hasViolation = screeningResult?.overall_decision === "MATCH_REQUIRES_RESTRICTION";
  const isUnsupported = screeningResult?.overall_decision === "UNSUPPORTED";
  const totalUboOwnership = beneficialOwners.reduce((acc, o) => acc + (Number(o.pctOwnership) || 0), 0);

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Restricted-Party & Sanctions Screening Engine
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Real-time screening of all 6 transaction parties + Ultimate Beneficial Owners (UBO) against OFAC SDN, UN Security Council, EU, and UK OFSI registries.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--text-tertiary)]">
            OFAC 50% Rule Compliant
          </span>
        </div>
      </div>

      {/* 6-Party Screening Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          1. Transaction Parties (All 6 Roles Required)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Exporter */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>Exporter / Shipper</span>
            </label>
            <input
              type="text"
              value={exporter}
              onChange={(e) => setExporter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {/* Importer */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>Importer / Buyer</span>
            </label>
            <input
              type="text"
              value={importer}
              onChange={(e) => setImporter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {/* Forwarder */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-500" />
              <span>Freight Forwarder</span>
            </label>
            <input
              type="text"
              value={forwarder}
              onChange={(e) => setForwarder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {/* Carrier */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ocean/Air Carrier (Vessel/IMO)</span>
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {/* Consignee */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Consignee (Bill of Lading)</span>
            </label>
            <input
              type="text"
              value={consignee}
              onChange={(e) => setConsignee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          {/* End User */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Destination End User</span>
            </label>
            <input
              type="text"
              value={endUser}
              onChange={(e) => setEndUser(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>
      </div>

      {/* 2. Beneficial Ownership & UBO 50% Rule */}
      <div className="space-y-3 pt-2 border-t border-[var(--hairline)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              2. Ultimate Beneficial Ownership (UBO) Registry
            </h4>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Declare ≥10% equity holders. Screening automatically evaluates composite ownership for OFAC 50% Rule sanctions pass-through.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddOwner}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-mono text-[var(--brand)] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shareholder</span>
          </button>
        </div>

        <div className="space-y-2">
          {beneficialOwners.map((owner, idx) => (
            <div key={owner.id} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Individual / Entity Name"
                  value={owner.name}
                  onChange={(e) => {
                    const next = [...beneficialOwners];
                    next[idx].name = e.target.value;
                    setBeneficialOwners(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={owner.country}
                  onChange={(e) => {
                    const next = [...beneficialOwners];
                    next[idx].country = e.target.value;
                    setBeneficialOwners(next);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] font-mono text-xs text-[var(--text-primary)]"
                >
                  <option value="IND">IND (India)</option>
                  <option value="ARE">ARE (UAE)</option>
                  <option value="USA">USA</option>
                  <option value="SGP">SGP</option>
                  <option value="GBR">GBR</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={owner.pctOwnership}
                  onChange={(e) => {
                    const next = [...beneficialOwners];
                    next[idx].pctOwnership = Number(e.target.value) || 0;
                    setBeneficialOwners(next);
                  }}
                  className="w-16 px-2 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] font-mono text-xs text-[var(--text-primary)] text-right"
                />
                <span className="text-xs font-mono text-[var(--text-secondary)]">% Equity</span>
              </div>

              <div className="sm:col-span-2 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id={`pep-${owner.id}`}
                  checked={owner.isPep}
                  onChange={(e) => {
                    const next = [...beneficialOwners];
                    next[idx].isPep = e.target.checked;
                    setBeneficialOwners(next);
                  }}
                  className="rounded border-[var(--hairline)]"
                />
                <label htmlFor={`pep-${owner.id}`} className="text-[11px] text-[var(--text-secondary)] cursor-pointer">
                  PEP Status
                </label>
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveOwner(owner.id)}
                  className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center px-2 text-[11px] font-mono text-[var(--text-tertiary)]">
            <span>Declared Equity Total: {totalUboOwnership}%</span>
            {totalUboOwnership < 100 && (
              <span className="text-amber-500">Note: Remaining {100 - totalUboOwnership}% held by public or minority float</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleRunScreen}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Screening OFAC / UN / EU Registries..." : "Execute 6-Party Sanctions Screen"}</span>
        </button>
      </div>

      {/* Honest failure state — never silently shown as cleared */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Screening request failed: {error}. No result can be shown — this is not the same as "cleared".</span>
        </div>
      )}

      {/* Screening Results Cards */}
      {screeningResult && (
        <div className="space-y-3 pt-2 border-t border-[var(--hairline)] animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Screening Audit Verdict & Results
            </h4>
            <StatusBadge
              status={hasViolation ? "blocked" : isUnsupported ? "review" : "verified"}
              label={
                hasViolation
                  ? "RESTRICTION REQUIRED"
                  : isUnsupported
                  ? "UNSUPPORTED — REGISTRY UNAVAILABLE"
                  : screeningResult.overall_decision === "POTENTIAL_MATCH"
                  ? "POTENTIAL MATCH — REVIEW REQUIRED"
                  : "SANCTIONS CLEARED (ALL PARTIES)"
              }
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {Object.entries(screeningResult.per_role).map(([role, r]) => (
              <div key={role} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-start justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">
                    {ROLE_LABELS[role] || role}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px] block">
                    {r.query.name}
                  </span>
                  {r.match && r.decision !== "NO_MATCH" && (
                    <span className="text-[10px] text-rose-500 font-mono block mt-0.5">
                      Matched: {r.match.name} ({Math.round(r.match.score * 100)}%)
                    </span>
                  )}
                  {r.ownership_screening && (
                    <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">{r.ownership_screening}</span>
                  )}
                  {r.unsupported_reason && (
                    <span className="text-[10px] text-amber-500 block mt-0.5">{r.unsupported_reason}</span>
                  )}
                </div>

                <span className={cn(
                  "text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0",
                  r.decision === "NO_MATCH"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : r.decision === "UNSUPPORTED"
                    ? "bg-amber-500/10 text-amber-600"
                    : r.decision === "POTENTIAL_MATCH"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-rose-500/10 text-rose-500"
                )}>
                  {r.decision === "NO_MATCH" ? "CLEARED" : r.decision.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SanctionsScreeningPanel;

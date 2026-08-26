import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MapPin, ArrowUpRight, Building2, ShieldCheck, AlertCircle, RefreshCw, Anchor, Users, Globe2, Sparkles } from "lucide-react";
import { aiService, CounterpartyMatchResult } from "@/services/api/aiService";
import { useWorkspace } from "@/context/WorkspaceContext";
import SovereignPortIntelligence from "@/components/trust/SovereignPortIntelligence";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const CounterpartiesIndexPage: React.FC = () => {
  const { isExporterView } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"organizations" | "ports">("organizations");
  const [counterparties, setCounterparties] = useState<CounterpartyMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("ARE");

  const countries = [
    { iso: "ARE", name: "United Arab Emirates" },
    { iso: "IND", name: "India" },
    { iso: "SAU", name: "Saudi Arabia" },
    { iso: "VNM", name: "Vietnam" },
    { iso: "USA", name: "United States" },
    { iso: "DEU", name: "Germany" },
    { iso: "SGP", name: "Singapore" },
  ];

  const fetchPartners = async (iso3: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.semanticMatch("Basmati Rice", 550000, 500, iso3, 100630);
      setCounterparties(res);
    } catch (err: any) {
      setError(err?.message || "Failed to connect to Counterparty Discovery & Sanctions API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(selectedCountry);
  }, [selectedCountry]);

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6 select-none">
        <PageHeader
          breadcrumbs={[{ label: "Discover", href: "/discover" }, { label: "Counterparties" }]}
          title={isExporterView ? "Verified Buyers & Sovereign Port Hubs" : "Verified Suppliers & Sovereign Port Hubs"}
          subtitle={
            isExporterView
              ? "Accredited counterparty buyers evaluated via OFAC/UN sanctions registry, maritime port logs, and multi-factor trust scoring."
              : "Accredited suppliers evaluated via OFAC/UN sanctions registry, maritime port logs, and multi-factor trust scoring."
          }
          badge={<StatusBadge status="verified" label="Dynamic Sovereign Intelligence" size="md" />}
        />

        {/* View Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("organizations")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
              activeTab === "organizations"
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Verified Organizations ({selectedCountry})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ports")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
              activeTab === "ports"
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Sovereign Ports Directory</span>
          </button>
        </div>

        {/* TAB 1: ORGANIZATIONS */}
        {activeTab === "organizations" && (
          <div className="space-y-5">
            {/* Country Filter Chips */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-mono text-[var(--text-secondary)]">Jurisdiction:</span>
              {countries.map((c) => (
                <button
                  key={c.iso}
                  onClick={() => setSelectedCountry(c.iso)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono transition-colors border cursor-pointer",
                    selectedCountry === c.iso
                      ? "bg-sky-500/20 text-sky-700 border-sky-500/40 font-bold"
                      : "bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--hairline)] hover:bg-[var(--surface-3)]"
                  )}
                >
                  {c.name} ({c.iso})
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-rose-300">Counterparty Discovery Service Unavailable</div>
                  <p className="text-rose-200/80 font-mono">{error}</p>
                  <button
                    onClick={() => fetchPartners(selectedCountry)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-800/40 text-rose-200 border border-rose-700/50 hover:bg-rose-800/60 font-mono text-[11px]"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Discovery
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center text-[var(--text-secondary)] font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                <span>Scanning sovereign entity registries &amp; OFAC sanctions database...</span>
              </div>
            )}

            {/* Dynamic Partner Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {counterparties.map((partner) => (
                  <div
                    key={partner.exporterId}
                    className="p-4 sm:p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
                            <Building2 className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{partner.companyName}</h4>
                            <div className="text-[11px] text-[var(--text-secondary)] font-mono flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                              <span>{partner.originCountry}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-bold text-emerald-600">{partner.matchScore}% Fit</div>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">Trust {partner.trustScore}/100</span>
                        </div>
                      </div>

                      {partner.port && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] px-2.5 py-1 rounded bg-[var(--surface-3)] border border-[var(--hairline)]">
                          <Anchor className="w-3 h-3 text-sky-600 shrink-0" />
                          <span className="truncate">Port: {partner.port}</span>
                        </div>
                      )}

                      <p className="text-xs text-[var(--text-secondary)] font-sans line-clamp-2">
                        {partner.explanation}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {partner.certifications?.map((c) => (
                          <span key={c} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--hairline)]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                        Dispute Rate: <strong className="text-emerald-600">{partner.disputeRate || "0.0%"}</strong>
                      </span>
                      <Link
                        to={`/counterparties/${partner.exporterId}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[var(--brand)] hover:underline"
                      >
                        <span>Full KYB Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SOVEREIGN PORTS */}
        {activeTab === "ports" && <SovereignPortIntelligence />}
      </div>
    </AppShell>
  );
};

export default CounterpartiesIndexPage;

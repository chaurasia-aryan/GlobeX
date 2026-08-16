import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { aiService, UnifiedRAGAnalysisResult } from "@/services/api/aiService";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import { Award, FileCheck2, AlertTriangle, Server, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const TradeAnalysisPage: React.FC = () => {
  const [selectedLens, setSelectedLens] = useState<"synthesis" | "regulatory" | "risk" | "api">("synthesis");
  const [analysis, setAnalysis] = useState<UnifiedRAGAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aiService
      .analyzeTradeIntake({
        role: "importer",
        productName: FLAGSHIP_DEMO_TRADE.product,
        hsCode: FLAGSHIP_DEMO_TRADE.hsCode,
        quantity: 500,
        unit: "MT",
        targetPriceUSD: 1100,
        originCountry: "India",
        originPort: "JNPT Nhava Sheva (INNSA)",
        destinationCountry: "UAE",
        destinationPort: "Jebel Ali (AEJEA)",
        incoterm: "CIF",
        requiredCertifications: ["ISO 22000", "FSSAI", "APEDA", "Halal"],
        escrowToken: "USDC",
        inspectionRequired: true,
        inspectionAgent: "SGS International",
      })
      .then((res) => {
        setAnalysis(res);
        setIsLoading(false);
      });
  }, []);

  const apiStatus = aiService.getStatus();

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        
        {/* Page Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Trade Analysis" },
          ]}
          title="Autonomous Trade Intelligence & RAG Synthesizer"
          subtitle={`Simulating ${FLAGSHIP_DEMO_TRADE.title} · India (JNPT) ➔ UAE (Jebel Ali)`}
          badge={<StatusBadge status="verified" label="RAG Pipeline Active" size="md" />}
          action={
            <Link to="/trades/TRD-IND-UAE-550K">
              <PrimaryAction>
                Open Active Trade →
              </PrimaryAction>
            </Link>
          }
        />

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Match Confidence</span>
            <div className="text-xl font-bold text-emerald-400">96%</div>
            <span className="text-[10px] text-slate-500">Sentence-Transformers</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">CEPA Preferential Duty</span>
            <div className="text-xl font-bold text-sky-400">0.0%</div>
            <span className="text-[10px] text-emerald-400">Saved $27,500 vs 5% MFN</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Transaction Risk</span>
            <div className="text-xl font-bold text-emerald-400">18 / 100</div>
            <span className="text-[10px] text-emerald-400">Low Risk Corridor</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Collateral Vault</span>
            <div className="text-xl font-bold text-white">$550,000</div>
            <span className="text-[10px] text-slate-500">USDC Multi-Sig</span>
          </div>
        </div>

        {/* Lens Navigation & Tabs */}
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "synthesis", label: "Supplier Ranking", icon: Award },
                { id: "regulatory", label: "CEPA & Regulatory RAG", icon: FileCheck2 },
                { id: "risk", label: "Risk Drivers", icon: AlertTriangle },
                { id: "api", label: "Model Endpoints", icon: Server },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedLens === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLens(tab.id as any)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-white/[0.1] text-white font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Engine: <strong className="text-emerald-400">{apiStatus.engine}</strong>
            </span>
          </div>

          {/* Tab Content */}
          {selectedLens === "synthesis" && analysis && (
            <div className="space-y-3">
              {analysis.matchingExporters.map((exporter, idx) => (
                <div
                  key={exporter.exporterId}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-bold">#{idx + 1}</span>
                      <h4 className="font-display font-bold text-sm text-white">{exporter.companyName}</h4>
                      {idx === 0 && <StatusBadge status="verified" label="Top Fit" />}
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{exporter.explanation}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-mono font-bold text-emerald-400">
                      {exporter.matchScore}% Match
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Trust {exporter.trustScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedLens === "regulatory" && analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
                  Bilateral Treaty Framework
                </span>
                <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                  <span className="text-slate-400">Treaty</span>
                  <span className="text-white font-medium">{analysis.complianceRAG.tradeAgreement}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                  <span className="text-slate-400">Preferential Tariff</span>
                  <span className="text-emerald-400 font-mono font-bold">{analysis.complianceRAG.tariffRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Duty Savings</span>
                  <span className="text-emerald-400 font-mono font-bold">${analysis.dutySavingsUSD.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Non-Tariff Barriers & Inspection (NTMs)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {analysis.complianceRAG.ntmBarriers.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedLens === "risk" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-slate-400">Counterparty Risk</span>
                <div className="text-base font-bold text-emerald-400">12 / 100 (Low)</div>
                <span className="text-[10px] text-slate-500 font-sans">128 successful trades</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-slate-400">Maritime Transit Risk</span>
                <div className="text-base font-bold text-emerald-400">22 / 100 (Normal)</div>
                <span className="text-[10px] text-slate-500 font-sans">4-day Arabian Sea route</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-slate-400">Document Variance Risk</span>
                <div className="text-base font-bold text-emerald-400">16 / 100 (Low)</div>
                <span className="text-[10px] text-slate-500 font-sans">OCR hash verified</span>
              </div>
            </div>
          )}

          {selectedLens === "api" && (
            <div className="space-y-2 text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px] block">FastAPI AI Microservice Connectors</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {apiStatus.endpoints.map((ep) => (
                  <div key={ep} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-sky-400">{ep}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">POST</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
};

export default TradeAnalysisPage;

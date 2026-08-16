import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { aiService, UnifiedRAGAnalysisResult } from "@/services/api/aiService";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import NumberFlow from "@number-flow/react";
import InteractiveButton from "@/components/ui/interactive-button";
import SpecularButton from "@/components/ui/SpecularButton";
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Coins,
  Ship,
  ArrowRight,
  ChevronRight,
  Server,
  Activity,
  Layers,
  Award,
  CheckCircle2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export const TradeAnalysisPage = () => {
  const [selectedLens, setSelectedLens] = useState<"synthesis" | "regulatory" | "risk" | "api">("synthesis");
  const [analysis, setAnalysis] = useState<UnifiedRAGAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load default flagship analysis from AI Service
    aiService.analyzeTradeIntake({
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
    }).then((res) => {
      setAnalysis(res);
      setIsLoading(false);
    });
  }, []);

  const apiStatus = aiService.getStatus();

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans p-4 sm:p-8 lg:p-12 select-none relative z-10 max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="-mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs text-[var(--text-primary)] font-medium">
              AI Trade Synthesizer & RAG Engine
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Autonomous Trade RAG Synthesizer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
            AI Trade Opportunity Intelligence
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Active evaluation of <strong className="text-white">TRD-IND-UAE-550K</strong> (India ➔ UAE Basmati Corridor)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/get-started">
            <InteractiveButton variant="secondary" size="sm">
              <span>New Intake Questionnaire</span>
            </InteractiveButton>
          </Link>
          <Link to="/trades/TRD-IND-UAE-550K">
            <SpecularButton size="sm" radius={12} lineColor="#34C795" baseColor="#132235">
              <span>Lock Escrow in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </SpecularButton>
          </Link>
        </div>
      </div>

      {/* Top 4 Quick Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">AI Match Confidence</div>
          <div className="text-2xl font-display font-bold text-emerald-400">
            <NumberFlow value={96} />%
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)]">Sentence-Transformers pgvector</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">CEPA Preferential Duty</div>
          <div className="text-2xl font-display font-bold text-cyan-400">0.0%</div>
          <div className="text-[11px] text-emerald-400 font-mono">Saved $27,500 vs 5% MFN</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Transaction Risk Index</div>
          <div className="text-2xl font-display font-bold text-emerald-400">
            <NumberFlow value={18} /> / 100
          </div>
          <div className="text-[11px] text-emerald-300 font-mono">Low Risk Corridor</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Collateral Vault</div>
          <div className="text-2xl font-display font-bold text-white font-mono">$550,000</div>
          <div className="text-[11px] text-[var(--text-tertiary)] font-mono">USDC Multi-Sig on Polygon</div>
        </div>
      </div>

      {/* Grouped Intelligence Studio (Eliminates UI Clutter) */}
      <div className="p-6 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-6">
        
        {/* Lens Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "synthesis", label: "AI Counterparty Ranking", icon: Award },
              { id: "regulatory", label: "Regulatory RAG & CEPA Schedule", icon: FileCheck2 },
              { id: "risk", label: "Multi-Variable Risk Drivers", icon: AlertTriangle },
              { id: "api", label: "Backend Model Endpoints", icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedLens === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLens(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white border border-white/[0.15] shadow-sm font-bold"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-[var(--text-tertiary)]">
            Active Engine: <span className="text-emerald-400">{apiStatus.engine}</span>
          </div>
        </div>

        {/* Tab 1: AI Counterparty Ranking */}
        {selectedLens === "synthesis" && analysis && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-white">AI Synthesis Rationale:</strong> Ranked using formula: <code className="text-emerald-400 font-mono">Score = SemanticFit(25%) + TrustScore(25%) + PriceFit(20%) + Certifications(15%) + VolumeHistory(15%) - TransactionRisk</code>.
            </div>

            <div className="space-y-3">
              {analysis.matchingExporters.map((exporter, idx) => (
                <div
                  key={exporter.exporterId}
                  className={`p-5 rounded-2xl border transition-all ${
                    idx === 0
                      ? "bg-[#111A28] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                      : "bg-[#101726]/80 border-white/[0.06]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-display font-bold text-white">
                          {exporter.companyName}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                            TOP AI MATCH
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-[var(--text-secondary)]">
                        {exporter.originCountry} · {exporter.port} · {exporter.historicalVolumeMT.toLocaleString()} MT Delivered · Historical Dispute Rate: {exporter.disputeRate}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                        {exporter.explanation}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-display font-extrabold text-emerald-400 font-mono">
                        {exporter.matchScore}% Match
                      </div>
                      <div className="text-xs font-mono text-[var(--text-secondary)]">
                        Trust Score: <strong className="text-white">{exporter.trustScore}/100</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Regulatory RAG & CEPA */}
        {selectedLens === "regulatory" && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-3">
              <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold">
                Bilateral Trade Treaty Benefits
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[var(--text-secondary)]">Treaty Framework</span>
                  <span className="text-white font-medium">{analysis.complianceRAG.tradeAgreement}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[var(--text-secondary)]">Applied Preferential Duty</span>
                  <span className="text-emerald-400 font-mono font-bold">{analysis.complianceRAG.tariffRate}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[var(--text-secondary)]">Standard MFN Rate</span>
                  <span className="text-white font-mono">{analysis.complianceRAG.standardMFNRate}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[var(--text-secondary)]">Net Duty Savings</span>
                  <span className="text-emerald-400 font-mono font-bold">${analysis.dutySavingsUSD.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-3">
              <h4 className="text-xs font-mono text-amber-400 uppercase font-bold">
                Non-Tariff Barriers & Permits (NTMs)
              </h4>
              <ul className="space-y-2 text-xs">
                {analysis.complianceRAG.ntmBarriers.map((barrier) => (
                  <li key={barrier} className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{barrier}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Variable Risk */}
        {selectedLens === "risk" && analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-2">
                <div className="text-xs font-mono text-[var(--text-secondary)]">Counterparty Risk</div>
                <div className="text-lg font-mono font-bold text-emerald-400">12 / 100 (Low)</div>
                <p className="text-[11px] text-[var(--text-tertiary)]">128 successful trades on-platform</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-2">
                <div className="text-xs font-mono text-[var(--text-secondary)]">Maritime Transit Risk</div>
                <div className="text-lg font-mono font-bold text-emerald-400">22 / 100 (Normal)</div>
                <p className="text-[11px] text-[var(--text-tertiary)]">Direct 4-day Arabian Sea route</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-2">
                <div className="text-xs font-mono text-[var(--text-secondary)]">Document Discrepancy Risk</div>
                <div className="text-lg font-mono font-bold text-emerald-400">16 / 100 (Low)</div>
                <p className="text-[11px] text-[var(--text-tertiary)]">OCR hash cross-checks enabled</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Backend Model Endpoints */}
        {selectedLens === "api" && (
          <div className="p-5 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h4 className="text-xs font-mono text-emerald-400 uppercase font-bold">
                  FastAPI AI Microservice Connectors
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Connect custom PyTorch, Sentence-Transformers, or LangChain models via REST
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono">
                BASE URL: {apiStatus.baseUrl}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {apiStatus.endpoints.map((ep) => (
                <div key={ep} className="p-3 rounded-xl bg-[#0B1019] border border-white/[0.04] flex items-center justify-between">
                  <span className="text-cyan-400">{ep}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    POST
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default TradeAnalysisPage;

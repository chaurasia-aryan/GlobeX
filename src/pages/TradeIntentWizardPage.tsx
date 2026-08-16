import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { appwriteService } from "@/services/appwrite/client";
import { aiService, TradeIntakePayload, UnifiedRAGAnalysisResult } from "@/services/api/aiService";
import {
  ShoppingBag,
  Building,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Coins,
  Ship,
  RotateCcw,
  Layers,
  Award,
  AlertTriangle,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Globe2,
  Check,
  Building2,
  ExternalLink,
  Home,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import InteractiveButton from "@/components/ui/interactive-button";
import SpecularButton from "@/components/ui/SpecularButton";
import { TrustBreakdownDrawer } from "@/components/trust/TrustBreakdownDrawer";

/* ── Pre-configured Industry Intent Presets ── */
const TRADE_PRESETS: { label: string; description: string; payload: TradeIntakePayload }[] = [
  {
    label: "Basmati Rice to UAE (Flagship CEPA)",
    description: "500 MT Aged 1121 Basmati Rice from JNPT Mumbai to Jebel Ali, Dubai with 0% CEPA duty.",
    payload: {
      role: "importer",
      productName: "1121 Steam Basmati Rice",
      hsCode: "1006.30.20",
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
    },
  },
  {
    label: "Organic Cotton Yarn to Germany",
    description: "25,000 meters combed organic cotton twill from Surat to Hamburg port with GOTS certification.",
    payload: {
      role: "importer",
      productName: "Combed Organic Cotton Yarn",
      hsCode: "5205.23.00",
      quantity: 25000,
      unit: "Meters",
      targetPriceUSD: 14,
      originCountry: "India",
      originPort: "Surat Port (INSUR)",
      destinationCountry: "Germany",
      destinationPort: "Hamburg Port (DEHAM)",
      incoterm: "CIF",
      requiredCertifications: ["GOTS Organic", "OEKO-TEX 100", "ISO 9001"],
      escrowToken: "USDC",
      inspectionRequired: true,
      inspectionAgent: "Bureau Veritas",
    },
  },
  {
    label: "Green Cardamom to Saudi Arabia",
    description: "50 MT Alleppey green cardamom (8mm bold) from Cochin to Jeddah Islamic Port.",
    payload: {
      role: "importer",
      productName: "Grade-A Green Cardamom",
      hsCode: "0904.11.30",
      quantity: 50,
      unit: "MT",
      targetPriceUSD: 9600,
      originCountry: "India",
      originPort: "Cochin Port (INCOK)",
      destinationCountry: "Saudi Arabia",
      destinationPort: "Jeddah Islamic Port (SAJED)",
      incoterm: "CIF",
      requiredCertifications: ["FSSAI", "Spices Board", "Phytosanitary"],
      escrowToken: "USDC",
      inspectionRequired: true,
      inspectionAgent: "Intertek",
    },
  },
  {
    label: "Active Pharma APIs to Singapore",
    description: "20,000 KG pharmaceutical intermediates from Chennai to Port of Singapore under CECA.",
    payload: {
      role: "importer",
      productName: "Pharmaceutical API Intermediates",
      hsCode: "2924.29.00",
      quantity: 20000,
      unit: "KG",
      targetPriceUSD: 31,
      originCountry: "India",
      originPort: "Chennai Port (INMAA)",
      destinationCountry: "Singapore",
      destinationPort: "Port of Singapore (SGSIN)",
      incoterm: "CIF",
      requiredCertifications: ["GMP Certified", "US FDA Compliance", "ISO 13485"],
      escrowToken: "USDC",
      inspectionRequired: true,
      inspectionAgent: "SGS International",
    },
  },
];

const AVAILABLE_CERTIFICATIONS = [
  "ISO 22000",
  "FSSAI",
  "APEDA",
  "Halal",
  "Phytosanitary",
  "GOTS Organic",
  "OEKO-TEX 100",
  "GMP Certified",
  "US FDA Compliance",
  "Rainforest Alliance",
];

export const TradeIntentWizardPage = () => {
  const navigate = useNavigate();

  // Wizard Stages:
  // Auto-detect role from active user session (no annoying barrier every visit)
  const currentUser = appwriteService.getCurrentUser();
  const initialRole: "importer" | "exporter" =
    currentUser.role === "exporter" ? "exporter" : "importer";

  const [role, setRole] = useState<"importer" | "exporter">(initialRole);
  const [activeTab, setActiveTab] = useState<"commodity" | "logistics" | "compliance" | "escrow">("commodity");
  
  // Structured Trade Intake State
  const [intakeForm, setIntakeForm] = useState<TradeIntakePayload>({ ...TRADE_PRESETS[0].payload, role: initialRole });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<UnifiedRAGAnalysisResult | null>(null);
  const [selectedTrustProfile, setSelectedTrustProfile] = useState<any | null>(null);

  const handleToggleRole = () => {
    const nextRole = role === "importer" ? "exporter" : "importer";
    setRole(nextRole);
    appwriteService.setRole(nextRole === "importer" ? "buyer" : "exporter");
    setIntakeForm((prev) => ({ ...prev, role: nextRole }));
  };

  const handleLoadPreset = async (preset: typeof TRADE_PRESETS[0]) => {
    const updatedPayload = { ...preset.payload, role };
    setIntakeForm(updatedPayload);
    setIsSynthesizing(true);
    try {
      const result = await aiService.analyzeTradeIntake(updatedPayload);
      setSynthesisResult(result);
    } catch (err) {
      console.error("AI Synthesis Error:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const toggleCertification = (cert: string) => {
    setIntakeForm((prev) => {
      const exists = prev.requiredCertifications.includes(cert);
      const updated = exists
        ? prev.requiredCertifications.filter((c) => c !== cert)
        : [...prev.requiredCertifications, cert];
      return { ...prev, requiredCertifications: updated };
    });
  };

  const handleRunRAGPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSynthesizing(true);

    try {
      const result = await aiService.analyzeTradeIntake(intakeForm);
      setSynthesisResult(result);
    } catch (err) {
      console.error("AI Synthesis Error:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleReset = () => {
    setSynthesisResult(null);
    setActiveTab("commodity");
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans p-4 sm:p-8 lg:p-12 select-none relative z-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
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
                {role === "importer" ? "Buyer Trade Intake & RAG" : "Exporter Sourcing Intake"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── STRUCTURED QUESTIONNAIRE INTAKE STUDIO (ZERO CLUTTER) ── */}
        {!synthesisResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header with Seamless Inline Role Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    {role === "importer" ? "Importer" : "Exporter"} Intelligence Questionnaire
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)]">
                  Trade Intake Parameters
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Provide exact transaction specifications prior to executing the AI RAG synthesis pipeline.
                </p>
              </div>

              {/* Frictionless 1-Click Role Toggle Pill */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleRole}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-white flex items-center gap-2 transition-all shadow-sm group"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                  <span>
                    Role: <strong className="text-emerald-400 uppercase">{role === "importer" ? "Buyer (Importer)" : "Seller (Exporter)"}</strong>
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] border-l border-white/[0.15] pl-2 group-hover:text-white">
                    Switch ⇄
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Fill Presets Selector */}
            <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant 1-Click Trade Corridors
                </span>
                <span className="text-[11px] text-emerald-400/80 font-mono">Click any corridor to instantly match & launch</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {TRADE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="p-3 rounded-xl bg-[#101726]/90 border border-white/[0.06] hover:border-emerald-500/50 hover:bg-[#131E2E] text-left transition-all group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-display font-bold text-[var(--text-primary)] group-hover:text-emerald-400 truncate">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] truncate pt-0.5 font-sans">
                        {preset.payload.originCountry} ➔ {preset.payload.destinationCountry} · {preset.payload.quantity} {preset.payload.unit}
                      </div>
                    </div>
                    <div className="pt-2 mt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-emerald-400">
                      <span>⚡ Instant Launch</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grouped Stepped Studio (4 Progressive Tabs) */}
            <div className="p-6 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-6">
              
              {/* Tab Navigation Strip */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
                {[
                  { id: "commodity", label: "1. Commodity & Volume", icon: Package },
                  { id: "logistics", label: "2. Corridor & Incoterm", icon: Ship },
                  { id: "compliance", label: "3. Certifications & Standards", icon: ShieldCheck },
                  { id: "escrow", label: "4. Smart Escrow & Rules", icon: Coins },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
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

              {/* Group Tab 1: Commodity & Volume */}
              {activeTab === "commodity" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Commodity / Product Name</label>
                    <input
                      type="text"
                      value={intakeForm.productName}
                      onChange={(e) => setIntakeForm({ ...intakeForm, productName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Auto-Classified HS Code</label>
                    <input
                      type="text"
                      value={intakeForm.hsCode || "1006.30.20"}
                      onChange={(e) => setIntakeForm({ ...intakeForm, hsCode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm font-mono text-emerald-400 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Quantity & Unit</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={intakeForm.quantity}
                        onChange={(e) => setIntakeForm({ ...intakeForm, quantity: Number(e.target.value) })}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm font-mono text-white outline-none"
                      />
                      <select
                        value={intakeForm.unit}
                        onChange={(e) => setIntakeForm({ ...intakeForm, unit: e.target.value as any })}
                        className="px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] text-sm font-mono text-white outline-none"
                      >
                        <option value="MT">MT (Metric Tonnes)</option>
                        <option value="KG">KG (Kilograms)</option>
                        <option value="Meters">Meters (Fabrics)</option>
                        <option value="Units">Units (Machinery)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Target Price (USD per Unit)</label>
                    <input
                      type="number"
                      value={intakeForm.targetPriceUSD}
                      onChange={(e) => setIntakeForm({ ...intakeForm, targetPriceUSD: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm font-mono text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Group Tab 2: Corridor & Logistics */}
              {activeTab === "logistics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Origin Country & Port</label>
                    <input
                      type="text"
                      value={intakeForm.originPort}
                      onChange={(e) => setIntakeForm({ ...intakeForm, originPort: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Destination Country & Port</label>
                    <input
                      type="text"
                      value={intakeForm.destinationPort}
                      onChange={(e) => setIntakeForm({ ...intakeForm, destinationPort: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Preferred INCOTERM</label>
                    <select
                      value={intakeForm.incoterm}
                      onChange={(e) => setIntakeForm({ ...intakeForm, incoterm: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] text-sm text-white outline-none font-mono"
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight — Recommended)</option>
                      <option value="FOB">FOB (Free on Board — Origin Port Handover)</option>
                      <option value="DDP">DDP (Delivered Duty Paid — Door-to-Door)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Estimated Transit Window</label>
                    <div className="px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] text-sm font-mono text-emerald-400">
                      4 to 6 Maritime Days (Direct Arabian Sea Corridor)
                    </div>
                  </div>
                </div>
              )}

              {/* Group Tab 3: Certifications & Standards */}
              {activeTab === "compliance" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-[var(--text-secondary)]">
                      Required Quality, Health & Phytosanitary Standards (Select applicable)
                    </label>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      Exporters failing these certifications will be penalized in AI match scoring
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {AVAILABLE_CERTIFICATIONS.map((cert) => {
                      const isSelected = intakeForm.requiredCertifications.includes(cert);
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCertification(cert)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold shadow-sm"
                              : "bg-[#101726] border border-white/[0.06] text-[var(--text-secondary)] hover:text-white"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                            isSelected ? "bg-emerald-400 text-black font-bold" : "border border-white/[0.2]"
                          }`}>
                            {isSelected ? "✓" : ""}
                          </span>
                          <span>{cert}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group Tab 4: Escrow & Rules */}
              {activeTab === "escrow" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Escrow Collateral Asset</label>
                    <select
                      value={intakeForm.escrowToken}
                      onChange={(e) => setIntakeForm({ ...intakeForm, escrowToken: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] text-sm text-white outline-none font-mono"
                    >
                      <option value="USDC">USDC (Circle Programmable Multi-Sig on Polygon — 0% fee)</option>
                      <option value="USDT">USDT (Tether USD Collateral)</option>
                      <option value="FIAT">FIAT Bank Letter of Credit (Tier-1 Partner)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Independent Inspection Agency</label>
                    <select
                      value={intakeForm.inspectionAgent}
                      onChange={(e) => setIntakeForm({ ...intakeForm, inspectionAgent: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#101726] border border-white/[0.08] text-sm text-white outline-none font-mono"
                    >
                      <option value="SGS International">SGS International (Pre-shipment Weight & Grade)</option>
                      <option value="Bureau Veritas">Bureau Veritas (Phytosanitary & Lab Test)</option>
                      <option value="Intertek">Intertek (Food Safety & Quality)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                    <span className="text-emerald-400 font-mono font-bold">CALCULATED ESCROW COLLATERAL:</span>
                    <div className="text-lg font-mono font-bold text-white">
                      ${(intakeForm.quantity * intakeForm.targetPriceUSD).toLocaleString()} {intakeForm.escrowToken}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Funds remain locked conditionally in the Smart Escrow Vault until OCR documents and IoT delivery geofence triggers are satisfied.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[var(--text-secondary)] font-mono">
                  Contract Estimate: <strong className="text-emerald-400">${(intakeForm.quantity * intakeForm.targetPriceUSD).toLocaleString()} USDC</strong>
                </div>

                <SpecularButton
                  onClick={handleRunRAGPipeline}
                  size="md"
                  radius={14}
                  lineColor="#34C795"
                  baseColor="#101F30"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Execute AI Semantic Matching & RAG Pipeline</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </SpecularButton>
              </div>

            </div>

          </motion.div>
        )}

        {/* ── STAGE 3: RAG SYNTHESIS RESULTS & MATCHING DOSSIER ──────────────── */}
        {synthesisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    AI RAG Synthesis Complete · {synthesisResult.tradeId}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
                  Trade Opportunity Dossier
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Counterparties ranked by Semantic Fit + Historical Trust - Transaction Risk
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSynthesisResult(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Adjust Parameters</span>
                </button>

                <Link to="/trades/TRD-IND-UAE-550K">
                  <SpecularButton size="sm" radius={12} lineColor="#34C795" baseColor="#132235">
                    <span>Lock Escrow & Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </SpecularButton>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
                <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Target HS Classification</div>
                <div className="text-lg font-mono font-bold text-emerald-400">{synthesisResult.hsClassification.hsCode}</div>
                <div className="text-[11px] text-[var(--text-tertiary)] truncate">{synthesisResult.hsClassification.category}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
                <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Preferential CEPA Tariff</div>
                <div className="text-lg font-mono font-bold text-cyan-400">{synthesisResult.complianceRAG.tariffRate} Duty</div>
                <div className="text-[11px] text-emerald-400 font-mono">Saved ${synthesisResult.dutySavingsUSD.toLocaleString()} vs MFN</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
                <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Transaction Risk Index</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {synthesisResult.tradeRisk.compositeScore} / 100 ({synthesisResult.tradeRisk.riskLevel})
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">All 5 risk drivers cleared</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] space-y-1">
                <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Contract Collateral</div>
                <div className="text-lg font-mono font-bold text-white">
                  ${synthesisResult.totalContractValueUSD.toLocaleString()} USDC
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] font-mono">Conditional Multi-Sig Vault</div>
              </div>
            </div>

            {/* Ranked Exporters List */}
            <div className="p-6 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <h3 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Top Ranked Verified Counterparties (AI Match Ranking)</span>
                </h3>
                <span className="text-xs font-mono text-[var(--text-secondary)]">3 Matches Identified</span>
              </div>

              <div className="space-y-3">
                {synthesisResult.matchingExporters.map((exporter, idx) => (
                  <div
                    key={exporter.exporterId}
                    className={`p-5 rounded-2xl border transition-all ${
                      idx === 0
                        ? "bg-[#111A28] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                        : "bg-[#101726]/80 border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)]">
                            {exporter.companyName}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                              TOP AI MATCH
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-[var(--text-secondary)]">
                          {exporter.originCountry} · {exporter.port} · {exporter.historicalVolumeMT.toLocaleString()} MT Delivered · Dispute Rate: {exporter.disputeRate}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                          {exporter.explanation}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xl font-display font-extrabold text-emerald-400 font-mono">
                            {exporter.matchScore}% Match
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                            Trust Score: <strong className="text-white">{exporter.trustScore}/100</strong>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedTrustProfile({
                                  companyName: exporter.companyName,
                                  country: exporter.originCountry,
                                  port: exporter.port,
                                  trustScore: exporter.trustScore,
                                  totalTrades: Math.round(exporter.historicalVolumeMT / 115),
                                  disputeRate: exporter.disputeRate,
                                  subscores: {
                                    counterpartyReliability: 96,
                                    fulfillmentRate: 94,
                                    documentIntegrity: 97,
                                    regulatoryCompliance: 92,
                                  },
                                  certifications: exporter.certifications,
                                  historicalVolumeUSD: `$${(exporter.historicalVolumeMT * 1100).toLocaleString()} USD`,
                                  activeStatus: "Tier-1 Verified Exporter",
                                })
                              }
                              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline block mt-0.5"
                            >
                              View Breakdown →
                            </button>
                          </div>
                        </div>

                        <Link to="/trades/TRD-IND-UAE-550K">
                          <InteractiveButton variant="primary" size="sm">
                            <span>Select & Initiate Trade</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </InteractiveButton>
                        </Link>
                      </div>
                    </div>

                    {/* Certifications Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-white/[0.06]">
                      {exporter.certifications.map((cert) => (
                        <span key={cert} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[var(--text-secondary)]">
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory RAG Documents Checklist */}
            <div className="p-6 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <h3 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  <span>Mandatory Regulatory Documents (India-UAE CEPA Schedule)</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400">OCR Cross-Check Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {synthesisResult.complianceRAG.mandatoryDocuments.map((doc) => (
                  <div key={doc.name} className="p-3.5 rounded-xl bg-[#101726]/80 border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs font-display font-bold text-[var(--text-primary)]">
                      <span>{doc.name}</span>
                      {doc.mandatory && (
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      Issuer: {doc.issuingAuthority}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </div>

      {/* Trust Breakdown Slide-Over Drawer (Rule 13) */}
      <TrustBreakdownDrawer
        isOpen={!!selectedTrustProfile}
        onClose={() => setSelectedTrustProfile(null)}
        profile={selectedTrustProfile}
      />
    </div>
  );
};

export default TradeIntentWizardPage;

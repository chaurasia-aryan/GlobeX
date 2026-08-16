import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { aiService, TradeIntakePayload, UnifiedRAGAnalysisResult } from "@/services/api/aiService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import { DetailDrawer } from "@/components/common/DetailDrawer";
import { TrustBreakdownDrawer } from "@/components/trust/TrustBreakdownDrawer";
import {
  Package,
  Ship,
  ShieldCheck,
  Coins,
  ArrowRight,
  ArrowLeft,
  Award,
  Check,
  Building2,
  FileCheck2,
  Zap,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRADE_PRESETS: { label: string; description: string; payload: TradeIntakePayload }[] = [
  {
    label: "Basmati Rice to UAE",
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
    label: "Organic Cotton to Germany",
    description: "25,000 meters combed organic cotton from Surat to Hamburg port with GOTS certification.",
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
];

export const TradeIntentWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isBuyer, roleLabel } = useWorkspace();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [intakeForm, setIntakeForm] = useState<TradeIntakePayload>({
    ...TRADE_PRESETS[0].payload,
    role: isBuyer ? "importer" : "exporter",
  });

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<UnifiedRAGAnalysisResult | null>(null);
  const [selectedTrustProfile, setSelectedTrustProfile] = useState<any | null>(null);

  const estimatedValue = (intakeForm.quantity || 0) * (intakeForm.targetPriceUSD || 0);

  const handlePresetSelect = (preset: typeof TRADE_PRESETS[0]) => {
    setIntakeForm({
      ...preset.payload,
      role: isBuyer ? "importer" : "exporter",
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRunMatching();
    }
  };

  const handleRunMatching = async () => {
    setIsSynthesizing(true);
    try {
      const res = await aiService.analyzeTradeIntake(intakeForm);
      setSynthesisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const toggleCert = (cert: string) => {
    const list = intakeForm.requiredCertifications || [];
    const updated = list.includes(cert)
      ? list.filter((c) => c !== cert)
      : [...list, cert];
    setIntakeForm({ ...intakeForm, requiredCertifications: updated });
  };

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        
        {/* ── STAGE 1: 4-STEP WIZARD (Only current step expanded) ─────────── */}
        {!synthesisResult ? (
          <div className="space-y-6">
            
            {/* Header */}
            <PageHeader
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: isBuyer ? "New Import" : "Trade Request" },
              ]}
              title={isBuyer ? "Configure New Import" : "Configure Trade Request"}
              subtitle={`Step ${currentStep} of 4 · Specify trade parameters to calculate duties & match verified partners.`}
              badge={
                <StatusBadge
                  status="active"
                  label={`Step ${currentStep} of 4`}
                  size="md"
                />
              }
              action={
                <PrimaryAction
                  onClick={handleNextStep}
                  isLoading={isSynthesizing}
                >
                  {currentStep === 4 ? "Find Best Suppliers →" : "Continue →"}
                </PrimaryAction>
              }
            />

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: "01 Product" },
                { step: 2, label: "02 Route" },
                { step: 3, label: "03 Requirements" },
                { step: 4, label: "04 Payment" },
              ].map((s) => {
                const isCurrent = s.step === currentStep;
                const isPassed = s.step < currentStep;

                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStep(s.step)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer",
                      isCurrent
                        ? "bg-white/[0.08] border-emerald-500/50 text-white font-bold"
                        : isPassed
                        ? "bg-white/[0.02] border-white/[0.06] text-emerald-400"
                        : "bg-transparent border-white/[0.04] text-slate-500 opacity-50"
                    )}
                  >
                    <span>{s.label}</span>
                    {isPassed && <span>✓</span>}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Presets (Single Row) */}
            <div className="p-3 rounded-xl bg-[#0B1019] border border-white/[0.06] flex items-center justify-between gap-3 text-xs overflow-x-auto">
              <span className="text-slate-400 font-mono text-[11px] shrink-0 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Corridors:</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {TRADE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-sans text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded Active Step Container */}
            <div className="p-6 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-6">
              
              {/* STEP 1: PRODUCT */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-display font-bold text-white">01 Product Details</h3>
                    <p className="text-xs text-slate-400">Specify what commodity you are sourcing.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Product Name</label>
                      <input
                        type="text"
                        value={intakeForm.productName}
                        onChange={(e) => setIntakeForm({ ...intakeForm, productName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">HS Code</label>
                      <input
                        type="text"
                        value={intakeForm.hsCode}
                        onChange={(e) => setIntakeForm({ ...intakeForm, hsCode: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs font-mono text-emerald-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Quantity</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={intakeForm.quantity}
                          onChange={(e) => setIntakeForm({ ...intakeForm, quantity: Number(e.target.value) })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs font-mono text-white outline-none"
                        />
                        <select
                          value={intakeForm.unit}
                          onChange={(e) => setIntakeForm({ ...intakeForm, unit: e.target.value as any })}
                          className="px-3 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs font-mono text-slate-300 outline-none"
                        >
                          <option value="MT">Tonnes (MT)</option>
                          <option value="KG">Kilograms (KG)</option>
                          <option value="Meters">Meters</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Unit Price ($ USD)</label>
                      <input
                        type="number"
                        value={intakeForm.targetPriceUSD}
                        onChange={(e) => setIntakeForm({ ...intakeForm, targetPriceUSD: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs font-mono text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ROUTE */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-display font-bold text-white">02 Trade Route & Incoterms</h3>
                    <p className="text-xs text-slate-400">Specify origin port, destination, and shipping terms.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Origin Port / Country</label>
                      <input
                        type="text"
                        value={intakeForm.originPort}
                        onChange={(e) => setIntakeForm({ ...intakeForm, originPort: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Destination Port / Country</label>
                      <input
                        type="text"
                        value={intakeForm.destinationPort}
                        onChange={(e) => setIntakeForm({ ...intakeForm, destinationPort: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-mono text-slate-400">Incoterm Delivery Terms</label>
                      <select
                        value={intakeForm.incoterm}
                        onChange={(e) => setIntakeForm({ ...intakeForm, incoterm: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs text-slate-300 font-mono outline-none"
                      >
                        <option value="CIF">CIF — Cost, Insurance, and Freight to Destination Port (Recommended)</option>
                        <option value="FOB">FOB — Free on Board at Origin Port</option>
                        <option value="DDP">DDP — Delivered Duty Paid to Door</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REQUIREMENTS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-display font-bold text-white">03 Quality & Compliance Requirements</h3>
                    <p className="text-xs text-slate-400">Select certifications required from matching suppliers.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_CERTIFICATIONS.map((cert) => {
                      const isSelected = intakeForm.requiredCertifications?.includes(cert);
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCert(cert)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer",
                            isSelected
                              ? "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-semibold"
                              : "bg-[#101726] border border-white/[0.06] text-slate-400 hover:text-white"
                          )}
                        >
                          <span className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px]", isSelected ? "bg-emerald-400 text-black font-bold" : "border border-slate-600")}>
                            {isSelected ? "✓" : ""}
                          </span>
                          <span>{cert}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-display font-bold text-white">04 Payment Escrow & Inspection</h3>
                    <p className="text-xs text-slate-400">Configure safe multi-sig escrow settlement terms.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Escrow Asset</label>
                      <select
                        value={intakeForm.escrowToken}
                        onChange={(e) => setIntakeForm({ ...intakeForm, escrowToken: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs font-mono text-slate-300 outline-none"
                      >
                        <option value="USDC">USDC (Instant on-chain settlement, 0% fee)</option>
                        <option value="USDT">USDT (Tether USD)</option>
                        <option value="FIAT">Bank Letter of Credit</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Independent Quality Inspector</label>
                      <select
                        value={intakeForm.inspectionAgent}
                        onChange={(e) => setIntakeForm({ ...intakeForm, inspectionAgent: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#101726] border border-white/[0.08] text-xs font-mono text-slate-300 outline-none"
                      >
                        <option value="SGS International">SGS International (Weight & cargo purity)</option>
                        <option value="Bureau Veritas">Bureau Veritas (Lab tests & safety)</option>
                        <option value="Intertek">Intertek (Agri inspection)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Footer: Single clear calculation + Next Action */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-mono">
                  Estimated Trade Value:{" "}
                  <strong className="text-white font-bold text-sm">
                    ${estimatedValue.toLocaleString()} USD
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <PrimaryAction
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      ← Back
                    </PrimaryAction>
                  )}
                  <PrimaryAction
                    size="sm"
                    onClick={handleNextStep}
                    isLoading={isSynthesizing}
                  >
                    {currentStep === 4 ? "Find Best Suppliers →" : "Continue →"}
                  </PrimaryAction>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ── STAGE 2: SUPPLIER MATCHING PAGE (Answers: Who should I trade with?) ── */
          <div className="space-y-6">
            
            {/* Matching Header */}
            <PageHeader
              breadcrumbs={[
                { label: "New Import", href: "/get-started" },
                { label: "Best Suppliers" },
              ]}
              title="Best Suppliers"
              subtitle={`${intakeForm.productName} · ${intakeForm.quantity} ${intakeForm.unit} · ${intakeForm.originCountry} → ${intakeForm.destinationCountry}`}
              badge={<StatusBadge status="verified" label="3 Matches Found" size="md" />}
              action={
                <Link to="/trades/TRD-IND-UAE-550K">
                  <PrimaryAction>
                    Open Active Trade →
                  </PrimaryAction>
                </Link>
              }
              secondaryActions={
                <button
                  type="button"
                  onClick={() => setSynthesisResult(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-sans text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Edit Parameters
                </button>
              }
            />

            {/* Compact Key Stats Row (Tariff savings & risk score once) */}
            <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">HS Classification</span>
                <strong className="text-emerald-400 text-sm">{synthesisResult.hsClassification.hsCode}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Tariff Rate (CEPA)</span>
                <strong className="text-sky-400 text-sm">{synthesisResult.complianceRAG.tariffRate} Free</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Tax Savings</span>
                <strong className="text-emerald-400 text-sm">${synthesisResult.dutySavingsUSD.toLocaleString()} USD</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Value</span>
                <strong className="text-white text-sm">${synthesisResult.totalContractValueUSD.toLocaleString()} USD</strong>
              </div>
            </div>

            {/* Ranked Supplier Cards (Requirement 11) */}
            <Section title="Ranked Suppliers">
              <div className="space-y-3">
                {synthesisResult.matchingExporters.map((exporter, idx) => (
                  <div
                    key={exporter.exporterId}
                    className={cn(
                      "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                      idx === 0
                        ? "bg-[#0C1420] border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                        : "bg-[#0B1019] border-white/[0.06] hover:border-white/[0.12]"
                    )}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-slate-400 font-bold">#{idx + 1}</span>
                        <h3 className="font-display font-bold text-base text-white truncate">
                          {exporter.companyName}
                        </h3>
                        {idx === 0 && (
                          <StatusBadge status="verified" label="Top Recommendation" />
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        {exporter.port} · {exporter.historicalVolumeMT.toLocaleString()} MT delivered · {exporter.disputeRate} disputes
                      </div>

                      <p className="text-xs text-slate-300 font-sans line-clamp-1 pt-0.5">
                        {exporter.explanation}
                      </p>

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
                        className="text-[11px] font-mono text-emerald-400 hover:underline pt-1 inline-block cursor-pointer"
                      >
                        View supplier details →
                      </button>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-mono font-extrabold text-emerald-400">
                          {exporter.matchScore}% Match
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Trust {exporter.trustScore}/100
                        </div>
                      </div>

                      <Link to="/trades/TRD-IND-UAE-550K">
                        <PrimaryAction size="sm">
                          Start Trade →
                        </PrimaryAction>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        )}

      </div>

      {/* Trust Breakdown Slide-Over Drawer */}
      <TrustBreakdownDrawer
        isOpen={!!selectedTrustProfile}
        onClose={() => setSelectedTrustProfile(null)}
        profile={selectedTrustProfile}
      />
    </AppShell>
  );
};

export default TradeIntentWizardPage;

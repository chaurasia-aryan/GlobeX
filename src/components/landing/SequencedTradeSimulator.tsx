import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  FileCheck2,
  ShieldCheck,
  Coins,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  Zap,
  TrendingUp,
  Ship,
  Lock,
} from "lucide-react";
import InteractiveButton from "@/components/ui/interactive-button";

interface StepData {
  id: number;
  stage: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  duration: number;
}

const STEPS: StepData[] = [
  {
    id: 1,
    stage: "STAGE 01",
    title: "Natural Language Ingestion & Parsing",
    subtitle: "AI decomposes unstructured trade requirements into verified bilateral parameters.",
    badge: "SEMANTIC OCR",
    badgeColor: "text-[var(--accent)] bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.2)]",
    duration: 4000,
  },
  {
    id: 2,
    stage: "STAGE 02",
    title: "HS Classification & CEPA Duty Calculation",
    subtitle: "Bilateral free-trade agreements and preferential tariff schedules reconciled in under 40ms.",
    badge: "CEPA 0.0% TARIFF",
    badgeColor: "text-[var(--emerald)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]",
    duration: 4000,
  },
  {
    id: 3,
    stage: "STAGE 03",
    title: "Counterparty Trust & Risk Profiling",
    subtitle: "On-chain trade volume, dispute records, and jurisdictional compliance computed instantly.",
    badge: "96/100 TIER-1 TRUST",
    badgeColor: "text-[var(--gold)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
    duration: 4000,
  },
  {
    id: 4,
    stage: "STAGE 04",
    title: "Programmable USDC Escrow & Delivery Triggers",
    subtitle: "Cryptographic escrow locks funds until AIS vessel satellite sensors confirm berth discharge.",
    badge: "$550,000 COLLATERALIZED",
    badgeColor: "text-[var(--accent)] bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.2)]",
    duration: 4500,
  },
];

export const SequencedTradeSimulator = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50; // update progress every 50ms
    const stepDuration = STEPS[activeStep].duration;
    const increment = (interval / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % STEPS.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep, isPlaying]);

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Control & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
              SEQUENCED AI TRADE WORKFLOW
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-medium text-[var(--text-primary)]">
            Watch trade intelligence execute in real-time
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--panel)] hover:bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[var(--amber)]" />
                <span>Pause Sequence</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[var(--emerald)]" />
                <span>Play Auto-Sequence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4-Step Sequenced Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const isActive = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(idx)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-2 ${
                isActive
                  ? "bg-[var(--panel-raised)] border-[var(--hairline-strong)] shadow-xl"
                  : "bg-[var(--panel)] border-[var(--hairline)] opacity-70 hover:opacity-100"
              }`}
            >
              {/* Active Step Top Indicator */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)]">
                  {step.stage}
                </span>
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emerald)]" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                ) : null}
              </div>

              <div className="font-sans font-semibold text-xs text-[var(--text-primary)] line-clamp-1">
                {step.title}
              </div>

              {/* Progress Bar for Active Tab */}
              {isActive && isPlaying && (
                <div className="w-full bg-[var(--hairline)] h-1 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Stage Showcase Panel */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
        {/* Glow backdrop */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[var(--accent)] opacity-[0.05] blur-3xl rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Top Stage Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${STEPS[activeStep].badgeColor}`}>
                    {STEPS[activeStep].badge}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">•</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">{STEPS[activeStep].stage} OF 04</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-display font-medium text-[var(--text-primary)]">
                  {STEPS[activeStep].title}
                </h4>
              </div>
            </div>

            {/* STAGE CONTENT RENDERS */}
            {activeStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-3">
                  <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Raw Intent Input</div>
                  <div className="p-3.5 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] font-mono text-xs text-[var(--text-primary)] leading-relaxed">
                    &ldquo;Source 500 tonnes premium 1121 steam aged Basmati rice from Nhava Sheva (India) to Jebel Ali (Dubai, UAE) under CEPA agreement.&rdquo;
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--emerald)] pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Entities extracted: Commodity (Rice), Volume (500T), Origin (INNSA), Port (AEJEA)</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">AI Parse Speed</span>
                    <div className="text-3xl font-display font-medium text-[var(--accent)] mt-1">28 ms</div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Validated against WCO Harmonized System 2024 standards.
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-2">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Classified HS Code</span>
                  <div className="font-mono text-lg font-bold text-[var(--accent)]">HS 1006.30.20</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-tight">
                    Semi-milled or wholly milled basmati rice (parboiled/steam processed).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-2">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Bilateral Duty Rate</span>
                  <div className="font-display text-2xl font-medium text-[var(--emerald)]">0.0% CEPA</div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Standard MFN Tariff: 5.0% <br />
                    <strong className="text-[var(--text-primary)]">Est. Savings: $27,500 USD</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-2">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Corridor Feasibility</span>
                  <div className="font-display text-2xl font-medium text-[var(--text-primary)]">94 / 100</div>
                  <p className="text-xs text-[var(--emerald)]">High Growth Bilateral Demand</p>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Top Matched Counterparty</span>
                    <span className="text-[10px] font-mono text-[var(--emerald)] bg-[rgba(16,185,129,0.1)] px-2 py-0.5 rounded">
                      Tier-1 Verified
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-sans font-semibold text-sm text-[var(--text-primary)]">
                      ABC Global Exports Ltd (Mumbai, India)
                    </h5>
                    <p className="text-xs text-[var(--text-secondary)]">
                      342 verified completed export shipments • 0 dispute defaults • APEDA certified
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Composite Trust Rating</span>
                    <span className="text-2xl font-display font-medium text-[var(--emerald)]">96 / 100</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex justify-between"><span>Financial Solvency:</span> <strong className="text-[var(--text-primary)] font-mono">98%</strong></div>
                    <div className="flex justify-between"><span>Logistics Reliability:</span> <strong className="text-[var(--text-primary)] font-mono">95%</strong></div>
                    <div className="flex justify-between"><span>Regulatory Conformity:</span> <strong className="text-[var(--emerald)] font-mono">100%</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Locked Escrow Value</span>
                  <div className="font-display text-2xl font-medium text-[var(--accent)]">$550,000 USDC</div>
                  <p className="text-xs text-[var(--text-secondary)]">Arbitrum L2 Testnet Contract</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Release Condition</span>
                  <div className="font-sans text-xs font-semibold text-[var(--emerald)] flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5" />
                    <span>AIS Berth Discharge Event</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Automatic smart release upon delivery</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Smart Contract ID</span>
                  <div className="font-mono text-xs text-[var(--text-primary)] truncate">0x7F98b2C1...AE49</div>
                  <p className="text-xs text-[var(--text-secondary)]">Audited & Non-Custodial</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer CTA inside simulator */}
        <div className="pt-6 mt-6 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Ready to test this intelligence on your own product or trade corridor?
          </p>

          <Link to="/get-started">
            <InteractiveButton variant="primary" className="h-10 px-5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>Launch Live Trade Intent Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--ink)]" />
            </InteractiveButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SequencedTradeSimulator;

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TradeGlobe, { TradeGlobeRef } from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import AuthShell from "@/components/auth/AuthShell";
import { useAuthContext } from "@/context/AuthContext";
import {
  ShieldCheck,
  BrainCircuit,
  Lock,
  ArrowRight,
  TrendingUp,
  Globe2,
  Sparkles,
  Layers,
  ChevronRight,
  Zap,
  CheckCircle2,
  Cpu,
  BarChart3,
  Building2,
  X,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { appState } = useAuthContext();
  const globeRef = useRef<TradeGlobeRef>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (appState === "DASHBOARD") {
      navigate("/home", { replace: true });
    }
  }, [appState, navigate]);

  const aggregatedData = useMemo(() => aggregateByCountry(SAMPLE_DATA, null), []);

  const metrics = [
    {
      label: "Demand Forecast MAPE",
      value: "8.42%",
      subtext: "vs 24.6% ARIMA baseline",
      trend: "+65% accuracy",
      color: "text-emerald-400",
    },
    {
      label: "Anomaly Detection Precision",
      value: "91.4%",
      subtext: "0.942 ROC-AUC (TreeSHAP)",
      trend: "Tariff fraud defense",
      color: "text-sky-400",
    },
    {
      label: "Customs Turnaround",
      value: "<2 hrs",
      subtext: "reduced from 14 days",
      trend: "-99.2% latency",
      color: "text-indigo-400",
    },
    {
      label: "Collateral Secured",
      value: "$4.25M",
      subtext: "100% milestone-escrowed",
      trend: "Zero counterparty risk",
      color: "text-amber-400",
    },
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: "Deep Bilateral Demand Forecasting",
      desc: "Quantile Recurrent GRU with Pinball Loss (P10, P50, P90) generating probabilistic confidence intervals for commodity demand momentum.",
      tag: "GRU + XGBoost",
      tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Explainable Trade Anomaly Detection",
      desc: "Isolation Forest and XGBoost scoring cross-border shipments in real-time. Uncovers transfer mispricing, quantity spikes, and tariff evasion with TreeSHAP.",
      tag: "Isolation Forest",
      tagColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      icon: Cpu,
      title: "Autonomous Regulatory RAG Engine",
      desc: "Dense-sparse hybrid embeddings over bilateral trade agreements (India-UAE CEPA, ECTA) for automated Bill of Lading and invoice verification.",
      tag: "Hybrid BM25 + Vector",
      tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      icon: Lock,
      title: "Programmable Milestone Escrow",
      desc: "EVM smart contracts with cryptographic milestone gates: funds deposit, Bill of Lading verification, customs clearance, and instant multi-currency payout.",
      tag: "Solidity / Hardhat",
      tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-400 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-sky-500/10 blur-[160px] pointer-events-none -z-10 rounded-full" />

      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#080C14]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white font-bold text-base">G</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">
                Globe<span className="text-emerald-400">X</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link to="/ml-research" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
              <span>Applied AI Hub</span>
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Platform Architecture
            </a>
            <a href="#metrics" className="hover:text-white transition-colors">
              Model Benchmarks
            </a>
            <Link to="/super-admin/login" className="hover:text-white transition-colors">
              Customs &amp; Admin
            </Link>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Live 3D Globe */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>India-UAE CEPA 0% Tariff Optimization · Active</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              The Intelligent Operating System for{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Cross-Border Trade
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Predict bilateral commodity demand with Deep GRU models, automatically screen transfer
              pricing fraud, and execute cryptographic escrow settlements with zero counterparty risk.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Sign In &amp; Launch Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/ml-research"
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <BrainCircuit className="w-4 h-4 text-sky-400" />
                <span>Explore AI Hub</span>
              </Link>
            </div>

            {/* Sample Credentials Card directly on hero */}
            <div className="p-3.5 rounded-xl bg-[#0E1422] border border-white/[0.08] max-w-md">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Demo Access
                </span>
                <span>Role: Aryan Global Trade Ltd</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#151E33] border border-white/[0.05]">
                  <p className="text-[10px] text-slate-400">User ID</p>
                  <p className="font-semibold text-white">aryan@1980</p>
                </div>
                <div className="p-2 rounded-lg bg-[#151E33] border border-white/[0.05]">
                  <p className="text-[10px] text-slate-400">Password</p>
                  <p className="font-semibold text-white">password123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Globe Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[500px] lg:h-[500px] rounded-full border border-emerald-500/20 relative flex items-center justify-center bg-radial from-emerald-500/5 to-transparent">
              <TradeGlobe
                ref={globeRef}
                aggregatedData={aggregatedData}
                selectedCountry="India"
                showArcs={true}
                autoRotate={true}
                disableCountryAutoFocus={true}
              />

              {/* Floating Corridor Card */}
              <div className="absolute -bottom-4 -left-4 sm:bottom-4 sm:left-0 p-3 rounded-xl bg-[#0E1422]/90 backdrop-blur-md border border-white/10 shadow-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">India ⇄ UAE Corridor</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Duty: <span className="text-emerald-400 font-bold">0% (CEPA Tariff)</span> · Transit: 4 Days
                </p>
              </div>

              {/* Floating Escrow Badge */}
              <div className="absolute -top-3 -right-2 sm:top-4 sm:right-2 p-3 rounded-xl bg-[#0E1422]/90 backdrop-blur-md border border-white/10 shadow-2xl space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-white">Smart Escrow Vault</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">
                  $275,000 Locked in Contract
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics & Benchmarks Grid */}
      <section id="metrics" className="py-16 border-y border-white/[0.08] bg-[#0A0F1A]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="p-6 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-slate-400">{m.label}</p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {m.trend}
                  </span>
                </div>
                <p className={`text-3xl font-extrabold tracking-tight ${m.color}`}>
                  {m.value}
                </p>
                <p className="text-xs text-slate-400">{m.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Architecture & Capabilities */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            End-to-End Technology Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Industrial Bilateral Commerce
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            GlobeX replaces antiquated paper Letters of Credit and opaque customs paperwork with
            machine learning pipelines and cryptographic settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-8 rounded-2xl bg-[#0E1422] border border-white/[0.08] hover:border-white/20 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#151E33] border border-white/[0.08] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono border ${f.tagColor}`}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Direct Launch CTA */}
      <section className="py-20 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-[#0A0F1A]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Experience the Future of Bilateral Trade?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Test the live terminal with pre-configured demo credentials or explore the applied AI research benchmarks.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Terminal Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/ml-research"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-sm font-semibold transition-colors"
            >
              View Research Hub
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Authentication Modal Overlay */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0E1422] border border-white/15 rounded-2xl shadow-2xl p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                    G
                  </div>
                  <span className="font-bold text-white text-sm">GlobeX Terminal Access</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Embed AuthShell */}
              <AuthShell onSuccess={() => navigate("/home")} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

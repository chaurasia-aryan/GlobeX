import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { aiService, DestinationCountryInsight } from "@/services/api/aiService";
import {
  LayoutDashboard,
  Compass,
  Lock,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Building2,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

export const DashboardPage: React.FC = () => {
  const { user, activeDirection, setActiveDirection } = useWorkspace();
  const navigate = useNavigate();

  const [topOpportunity, setTopOpportunity] = useState<DestinationCountryInsight | null>(null);
  const [opportunityLoading, setOpportunityLoading] = useState(true);
  const [selectedCorridor, setSelectedCorridor] = useState<"uae" | "usa" | "ksa">("uae");

  useEffect(() => {
    let active = true;
    setOpportunityLoading(true);
    aiService
      .discoverMarketOpportunities("Basmati Rice", 50000, "balanced", 1)
      .then((res) => {
        if (active) {
          setTopOpportunity(res.top_recommendations?.[0] || null);
        }
      })
      .catch(() => {
        if (active) setTopOpportunity(null);
      })
      .finally(() => {
        if (active) setOpportunityLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const corridors = {
    uae: {
      name: "India ⇄ United Arab Emirates",
      treaty: "CEPA Bilateral Agreement",
      dutyRate: "0.0% (Zero-Duty Preferential)",
      transitDays: "4 - 5 Days",
      portOrigin: "Nhava Sheva (JNPT)",
      portDest: "Jebel Ali Port (DXB)",
      activeTrades: 8,
      volume: "$6.45M",
      dutySaved: "$210,000",
      complianceStatus: "Verified 100%",
    },
    usa: {
      name: "India ⇄ United States",
      treaty: "Standard WTO / Most Favoured Nation",
      dutyRate: "3.8% Ad-Valorem",
      transitDays: "18 - 22 Days",
      portOrigin: "Mundra Port (INMUN)",
      portDest: "Port of New York / New Jersey",
      activeTrades: 4,
      volume: "$5.10M",
      dutySaved: "$45,000",
      complianceStatus: "FDA & Phytosanitary Clear",
    },
    ksa: {
      name: "India ⇄ Saudi Arabia",
      treaty: "GCC Preferential Schedule",
      dutyRate: "2.5% Preferential",
      transitDays: "6 - 8 Days",
      portOrigin: "Cochin Port (INCOK)",
      portDest: "Jeddah Islamic Port",
      activeTrades: 2,
      volume: "$3.25M",
      dutySaved: "$129,200",
      complianceStatus: "SASO Certified",
    },
  };

  const activeCorridorData = corridors[selectedCorridor];

  // Active Trades Pipeline
  const activePipelineTrades = [
    {
      id: "TRD-IND-UAE-550K",
      title: "1121 Steam Basmati Rice (500 MT)",
      hsCode: "1006.30.20",
      counterparty: "Al-Bahar Global Logistics FZE",
      country: "UAE",
      flag: "🇦🇪",
      value: "$550,000",
      escrowLocked: "$550,000 (100%)",
      currentStage: 3, // 1: Deposited, 2: BL Verified, 3: In Transit, 4: Settled
      stageText: "Vessel In Transit (MSC ANNA)",
      eta: "3 Days",
      riskScore: "0.02 (Safe)",
    },
    {
      id: "TRD-LTC-CL-992",
      title: "Lithium Carbonate Tech Grade (99.5%)",
      hsCode: "2836.91.00",
      counterparty: "Sociedad Química Minera S.A.",
      country: "Chile",
      flag: "🇨🇱",
      value: "$3,200,000",
      escrowLocked: "$3,200,000 (100%)",
      currentStage: 2,
      stageText: "Bill of Lading Cryptographically Verified",
      eta: "12 Days",
      riskScore: "0.04 (Low)",
    },
    {
      id: "TRD-PEP-IN-442",
      title: "Tellicherry Black Pepper TGSEB",
      hsCode: "0904.11.10",
      counterparty: "Rotterdam Spice Trading BV",
      country: "Netherlands",
      flag: "🇳🇱",
      value: "$410,000",
      escrowLocked: "$410,000 (100%)",
      currentStage: 4,
      stageText: "Customs Cleared · Escrow Settled",
      eta: "Completed",
      riskScore: "0.01 (Clean)",
    },
  ];

  const orgName = user?.companyName || "Aryan Global Trade & Commodity Exports Ltd";

  return (
    <AppShell maxWidth="full" hideRail={false}>
      <div className="space-y-6">
        {/* 1. Header Command Ribbon */}
        <div className="p-6 rounded-2xl bg-[#0E1422] border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Command Center · Live Terminal
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">EVM Smart Escrow Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>{orgName}</span>
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" title="Verified Trade Entity" />
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Primary Trading Node: Nhava Sheva (JNPT), India · Network: Hardhat 31337 (Sepolia Mirror)
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/export-discover"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Destination Screener</span>
              </Link>

              <Link
                to="/ml-research"
                className="px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Applied AI Models</span>
              </Link>

              <Link
                to="/trades"
                className="px-4 py-2 rounded-xl bg-[#151E33] hover:bg-[#1B263E] border border-white/10 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View All 14 Trades</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Top Executive Metric Cards (KPI Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-2 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Active Trade Volume</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                +14.2% MoM
              </span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">$14,800,000</p>
            <p className="text-[11px] text-slate-400 font-mono">14 Active bilateral contracts</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-2 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Escrow Collateral Locked</span>
              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px]">
                100% Backed
              </span>
            </div>
            <p className="text-3xl font-extrabold text-indigo-400 tracking-tight">$4,250,000</p>
            <p className="text-[11px] text-slate-400 font-mono">Cryptographic milestone vault</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-2 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>CEPA Preferential Duty Saved</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                0% Tariff
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">$384,200</p>
            <p className="text-[11px] text-slate-400 font-mono">Tariff exemption under FTA</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-2 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Anomaly Risk Rating</span>
              <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-[10px]">
                TreeSHAP 0.02
              </span>
            </div>
            <p className="text-3xl font-extrabold text-sky-400 tracking-tight">99.2% Clean</p>
            <p className="text-[11px] text-slate-400 font-mono">0 transfer mispricing alerts</p>
          </div>
        </div>

        {/* 3. Interactive Bilateral Corridor Navigator */}
        <div className="p-6 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Bilateral Corridor Intelligence</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live tariff schedules, freight transit velocity, and bilateral treaty optimizations
              </p>
            </div>

            {/* Corridor Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151E33] border border-white/[0.05]">
              <button
                type="button"
                onClick={() => setSelectedCorridor("uae")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedCorridor === "uae"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇦🇪 India ⇄ UAE (CEPA)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor("usa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedCorridor === "usa"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇺🇸 India ⇄ USA
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor("ksa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedCorridor === "ksa"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇸🇦 India ⇄ Saudi
              </button>
            </div>
          </div>

          {/* Active Corridor Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-xl bg-[#151E33] border border-white/[0.06]">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-slate-400">Treaty Framework</p>
              <p className="text-sm font-bold text-white">{activeCorridorData.treaty}</p>
              <p className="text-xs text-emerald-400 font-mono">{activeCorridorData.dutyRate}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-mono text-slate-400">Transit &amp; Ports</p>
              <p className="text-sm font-bold text-white">{activeCorridorData.transitDays}</p>
              <p className="text-xs text-slate-400 font-mono">
                {activeCorridorData.portOrigin} → {activeCorridorData.portDest}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-mono text-slate-400">Active Trade Volume</p>
              <p className="text-sm font-bold text-white">{activeCorridorData.volume}</p>
              <p className="text-xs text-slate-400 font-mono">{activeCorridorData.activeTrades} active shipments</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-mono text-slate-400">Cumulative Duty Saved</p>
              <p className="text-sm font-bold text-emerald-400">{activeCorridorData.dutySaved}</p>
              <p className="text-xs text-slate-400 font-mono">{activeCorridorData.complianceStatus}</p>
            </div>
          </div>
        </div>

        {/* 4. Active Trades Pipeline with Visual Milestone Progress */}
        <div className="p-6 rounded-2xl bg-[#0E1422] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>Live Escrow &amp; Shipment Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400">
                Milestone-gated execution: Funds Locked → Cryptographic BL → Customs Clearance → Payout
              </p>
            </div>
            <Link
              to="/trades"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Trades</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activePipelineTrades.map((trade) => (
              <div
                key={trade.id}
                className="p-4 rounded-xl bg-[#151E33] border border-white/[0.06] hover:border-white/15 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{trade.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{trade.title}</p>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {trade.hsCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Counterparty: <span className="text-slate-200">{trade.counterparty}</span> ({trade.country})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-extrabold text-white font-mono">{trade.value}</p>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Escrow: {trade.escrowLocked}
                      </p>
                    </div>
                    <Link
                      to={`/trades/${trade.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors"
                    >
                      Workspace →
                    </Link>
                  </div>
                </div>

                {/* Visual Milestone Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">{trade.stageText}</span>
                    <span>ETA: {trade.eta}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden flex gap-1 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        trade.currentStage >= 1 ? "bg-emerald-400" : "bg-slate-700"
                      }`}
                      style={{ width: "25%" }}
                      title="Stage 1: Escrow Deposited"
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        trade.currentStage >= 2 ? "bg-emerald-400" : "bg-slate-700"
                      }`}
                      style={{ width: "25%" }}
                      title="Stage 2: Bill of Lading Verified"
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        trade.currentStage >= 3 ? "bg-sky-400" : "bg-slate-700"
                      }`}
                      style={{ width: "25%" }}
                      title="Stage 3: In Transit"
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        trade.currentStage >= 4 ? "bg-emerald-400" : "bg-slate-700"
                      }`}
                      style={{ width: "25%" }}
                      title="Stage 4: Settled"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>1. Escrow Funded</span>
                    <span>2. BL Verified</span>
                    <span>3. In Transit</span>
                    <span>4. Settlement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;

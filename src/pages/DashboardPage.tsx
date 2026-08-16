import React, { useState } from "react";
import { Link } from "react-router-dom";
import { appwriteService } from "@/services/appwrite/client";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import NumberFlow from "@number-flow/react";
import InteractiveButton from "@/components/ui/interactive-button";
import SpecularButton from "@/components/ui/SpecularButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  SwapHoriz as SwapIcon,
  ShieldAlert,
  Brain,
  MoreVertical,
  ArrowRight,
  Ship,
  FileCheck2,
  Coins,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";

export const DashboardPage = () => {
  const user = appwriteService.getCurrentUser();
  const [selectedChartTab, setSelectedChartTab] = useState<"liquidity" | "risk" | "sentiment" | "escrow">("liquidity");
  const [activeMenuTradeId, setActiveMenuTradeId] = useState<string | null>(null);

  const chartTabs = [
    { id: "liquidity", label: "Trade Exposure & Volume", icon: Activity },
    { id: "risk", label: "Risk & Route Monitor", icon: AlertTriangle },
    { id: "sentiment", label: "AI Commodity Sentiment", icon: Brain },
    { id: "escrow", label: "Escrow Settlement Velocity", icon: Coins },
  ] as const;

  return (
    <div className="min-h-screen text-[var(--text-primary)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans select-none">
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
            <span className="text-xs font-mono text-[var(--emerald)] uppercase tracking-wider">
              {user.role} Intelligence Node
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Connected enterprise: <strong className="text-[var(--text-primary)]">{user.companyName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/marketplace">
            <InteractiveButton variant="secondary" size="sm">
              <span>Explore Marketplace</span>
            </InteractiveButton>
          </Link>
          <Link to="/get-started">
            <SpecularButton size="sm" radius={12} lineColor="#34C795" baseColor="#132235">
              <span>Initiate New Trade</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </SpecularButton>
          </Link>
        </div>
      </div>

      {/* ── Top 4 Grouped KPI Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-[var(--text-secondary)] uppercase">
            <span>Total Exposure</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            $<NumberFlow value={14.2} format={{ minimumFractionDigits: 1 }} />M
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.4% vs last week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-[var(--text-secondary)] uppercase">
            <span>Active Contracts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            <NumberFlow value={24} />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            8 Pending Verification
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-[var(--text-secondary)] uppercase">
            <span>Route Risk Index</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-amber-400">
            Moderate
          </div>
          <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
            <span>Red Sea Delay: +36h</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-[var(--text-secondary)] uppercase">
            <span>AI Trust Score</span>
            <Brain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-400">
            <NumberFlow value={94} />%
          </div>
          <div className="text-[11px] font-mono text-[var(--text-secondary)]">
            Model: GLOBEX-OCR-v2
          </div>
        </div>
      </div>

      {/* ── Grouped Graph & Analytics Studio (Using shadcn Tabs) ── */}
      <div className="p-5 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-5">
        <Tabs
          value={selectedChartTab}
          onValueChange={(v) => setSelectedChartTab(v as any)}
          className="w-full space-y-5"
        >
          {/* Studio Header & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Trade Analytics & Route Insights</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Select a tab to view real-time data</p>
            </div>

            {/* Segmented Chart Group Selector using shadcn TabsList */}
            <TabsList className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111824] border border-white/[0.06] h-auto">
              {chartTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/[0.12] data-[state=active]:shadow-sm text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content 1: Exposure & Volume */}
          <TabsContent value="liquidity" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-mono">Monthly Trade Volume</span>
                  <span className="text-emerald-400 font-mono font-bold">$14,240,000 USD</span>
                </div>
                {/* Bar Graph Representation */}
                <div className="h-32 flex items-end justify-between gap-3 pt-4 border-b border-white/[0.06] pb-2">
                  {[
                    { month: "Jan", val: 40, amt: "$1.8M" },
                    { month: "Feb", val: 55, amt: "$2.4M" },
                    { month: "Mar", val: 70, amt: "$3.1M" },
                    { month: "Apr", val: 60, amt: "$2.7M" },
                    { month: "May", val: 85, amt: "$3.9M" },
                    { month: "Jun", val: 100, amt: "$4.5M" },
                  ].map((bar) => (
                    <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[9px] font-mono text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.amt}
                      </div>
                      <div
                        style={{ height: `${bar.val}%` }}
                        className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-emerald-950 to-emerald-500/80 group-hover:to-emerald-400 transition-all cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{bar.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] font-mono">
                  <span>Main Route: India ➔ UAE (74% Volume)</span>
                  <span>Average Settlement Time: 4.2 Hours</span>
                </div>
              </div>

              {/* Volume Distribution Breakdown */}
              <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-display font-bold text-[var(--text-primary)]">Product Breakdown</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Delivered commodity share</p>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Agri & Basmati</span>
                    <span className="text-[var(--text-primary)] font-bold">58%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[58%]" />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[var(--text-secondary)]">Organic Textiles</span>
                    <span className="text-[var(--text-primary)] font-bold">24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full w-[24%]" />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[var(--text-secondary)]">Pharma & Chemicals</span>
                    <span className="text-[var(--text-primary)] font-bold">18%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[18%]" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content 2: Route Risk Monitor */}
          <TabsContent value="risk" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>RED SEA ROUTE NOTICE</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Heavy vessel traffic near Bab-el-Mandeb. AI recommends direct transshipment via UAE corridor for faster customs clearance.
                </p>
                <div className="text-[11px] font-mono text-amber-300 pt-1">
                  Estimated delay buffer: +2 days
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  ARABIAN SEA CORRIDOR (ACTIVE & FAST)
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Mumbai (India) to Dubai (UAE) corridor is operating smoothly with 0 delays. Average customs transit time: 12 minutes.
                </p>
                <div className="text-[11px] font-mono text-emerald-300 pt-1">
                  Status: CLEAR · 0% Tax Free
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content 3: Market Sentiment */}
          <TabsContent value="sentiment" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "1121 Basmati Rice", trend: "+3.2%", status: "High Buyer Demand", score: 94 },
                { name: "Organic Cotton Yarn", trend: "+1.8%", status: "Steady Demand", score: 86 },
                { name: "Active Pharma APIs", trend: "-0.5%", status: "Stable Prices", score: 81 },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-display font-bold text-[var(--text-primary)]">{item.name}</div>
                  <div className="text-[11px] text-emerald-400 font-mono font-semibold">{item.trend} 30-Day Trend</div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{item.status}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab Content 4: Payment Escrow Velocity */}
          <TabsContent value="escrow" className="focus-visible:outline-none">
            <div className="p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-secondary)]">Payment Release Engine</span>
                <span className="text-emerald-400 font-mono font-bold">100% Protected Escrow</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#0B1019] border border-white/[0.04]">
                  <div className="text-lg font-bold font-display text-[var(--text-primary)]">$550,000</div>
                  <div className="text-[10px] font-mono text-[var(--text-tertiary)]">Protected in Active Trade</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1019] border border-white/[0.04]">
                  <div className="text-lg font-bold font-display text-emerald-400">14 Mins</div>
                  <div className="text-[10px] font-mono text-[var(--text-tertiary)]">Avg Settlement Release</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1019] border border-white/[0.04]">
                  <div className="text-lg font-bold font-display text-[var(--text-primary)]">0.00%</div>
                  <div className="text-[10px] font-mono text-[var(--text-tertiary)]">Dispute Rate</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Active Transactions with Discrete Hamburger Action Menus ─────────── */}
      <div className="p-5 rounded-3xl bg-[#0C121D]/90 border border-white/[0.08] backdrop-blur-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Active Trade Contracts</span>
          </h2>
          <Link to="/trades/TRD-IND-UAE-550K" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
            <span>View Flagship Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Transaction Cards with Discrete More Action Menus */}
        <div className="space-y-3">
          
          {/* Card 1: Flagship Demo Trade */}
          <div className="relative p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-display font-bold text-[var(--text-primary)]">
                  {FLAGSHIP_DEMO_TRADE.product}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  {FLAGSHIP_DEMO_TRADE.id} · India (JNPT) ➔ UAE (Jebel Ali)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              <div className="text-left sm:text-right">
                <div className="text-sm font-mono font-bold text-emerald-400">$550,000 USDC</div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Stage 6: In Transit</span>
                </div>
              </div>

              {/* Discrete Action Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuTradeId(activeMenuTradeId === "trade-1" ? null : "trade-1")}
                  className="p-2 rounded-xl bg-[#141F30] border border-white/[0.08] hover:border-white/[0.2] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuTradeId === "trade-1" && (
                  <div className="absolute right-0 top-10 w-48 p-1.5 rounded-xl bg-[#0E1522] border border-white/[0.12] shadow-2xl z-30 space-y-1 text-xs font-sans">
                    <Link
                      to="/trades/TRD-IND-UAE-550K"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-primary)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Workspace</span>
                    </Link>
                    <Link
                      to="/documents"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-white"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audit Documents</span>
                    </Link>
                    <Link
                      to="/escrow"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-white"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Escrow Vault State</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Lithium Carbonate */}
          <div className="relative p-4 rounded-2xl bg-[#101726]/80 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-display font-bold text-[var(--text-primary)]">
                  Lithium Carbonate (Battery Grade 99.5%)
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  TRD-LTC-CL-992 · Chile ➔ Germany (Hamburg)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              <div className="text-left sm:text-right">
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">$3,200,000 USDC</div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Docs OCR Pending</span>
                </div>
              </div>

              {/* Discrete Action Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuTradeId(activeMenuTradeId === "trade-2" ? null : "trade-2")}
                  className="p-2 rounded-xl bg-[#141F30] border border-white/[0.08] hover:border-white/[0.2] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuTradeId === "trade-2" && (
                  <div className="absolute right-0 top-10 w-48 p-1.5 rounded-xl bg-[#0E1522] border border-white/[0.12] shadow-2xl z-30 space-y-1 text-xs font-sans">
                    <Link
                      to="/documents"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-primary)]"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Review OCR Discrepancy</span>
                    </Link>
                    <Link
                      to="/trades/TRD-IND-UAE-550K"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Workspace</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;

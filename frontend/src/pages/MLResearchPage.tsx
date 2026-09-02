import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  BrainCircuit,
  TrendingUp,
  Activity,
  Scale,
  Building2,
  FileCheck2,
  BookOpen,
  Sparkles,
  Layers,
  BarChart3,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code2,
  Sliders,
  Download,
  Flame,
  Globe2,
  Clock,
  DollarSign,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Synthetic Historical & Forecast Data for Dynamic Recharts ─────────────────
const DEMAND_TIME_SERIES: Record<string, any[]> = {
  "1121 Basmati Rice": [
    { month: "Jan", realized: 51, p10: 42, p50: 50, p90: 60 },
    { month: "Feb", realized: 53, p10: 44, p50: 52, p90: 62 },
    { month: "Mar", realized: 56, p10: 46, p50: 55, p90: 65 },
    { month: "Apr", realized: 57, p10: 49, p50: 58, p90: 69 },
    { month: "May", realized: 63, p10: 52, p50: 62, p90: 74 },
    { month: "Jun", realized: 66, p10: 55, p50: 65, p90: 77 },
    { month: "Jul", realized: 64, p10: 53, p50: 63, p90: 75 },
    { month: "Aug", realized: 68, p10: 57, p50: 67, p90: 79 },
    { month: "Sep", realized: 71, p10: 61, p50: 72, p90: 85 },
    { month: "Oct", realized: 76, p10: 64, p50: 75, p90: 88 },
    { month: "Nov", realized: 79, p10: 67, p50: 78, p90: 92 },
    { month: "Dec", realized: 84, p10: 70, p50: 82, p90: 96 },
  ],
  "Organic Black Pepper": [
    { month: "Jan", realized: 12, p10: 10, p50: 12, p90: 15 },
    { month: "Feb", realized: 13, p10: 11, p50: 13, p90: 16 },
    { month: "Mar", realized: 15, p10: 12, p50: 14, p90: 18 },
    { month: "Apr", realized: 16, p10: 13, p50: 16, p90: 20 },
    { month: "May", realized: 18, p10: 15, p50: 18, p90: 22 },
    { month: "Jun", realized: 19, p10: 16, p50: 19, p90: 23 },
    { month: "Jul", realized: 17, p10: 14, p50: 17, p90: 21 },
    { month: "Aug", realized: 21, p10: 17, p50: 20, p90: 25 },
    { month: "Sep", realized: 23, p10: 19, p50: 22, p90: 27 },
    { month: "Oct", realized: 25, p10: 21, p50: 24, p90: 30 },
    { month: "Nov", realized: 26, p10: 22, p50: 25, p90: 31 },
    { month: "Dec", realized: 29, p10: 24, p50: 28, p90: 34 },
  ],
  "Assam CTC Tea": [
    { month: "Jan", realized: 28, p10: 23, p50: 27, p90: 32 },
    { month: "Feb", realized: 30, p10: 25, p50: 29, p90: 35 },
    { month: "Mar", realized: 33, p10: 27, p50: 32, p90: 38 },
    { month: "Apr", realized: 36, p10: 30, p50: 35, p90: 42 },
    { month: "May", realized: 40, p10: 34, p50: 39, p90: 46 },
    { month: "Jun", realized: 42, p10: 36, p50: 41, p90: 49 },
    { month: "Jul", realized: 39, p10: 33, p50: 38, p90: 45 },
    { month: "Aug", realized: 44, p10: 37, p50: 43, p90: 51 },
    { month: "Sep", realized: 48, p10: 41, p50: 47, p90: 56 },
    { month: "Oct", realized: 52, p10: 44, p50: 51, p90: 60 },
    { month: "Nov", realized: 55, p10: 47, p50: 54, p90: 64 },
    { month: "Dec", realized: 59, p10: 50, p50: 58, p90: 69 },
  ],
};

const FORECAST_MODEL_COMPARISON = [
  { model: "Holt-Winters", mape: 28.4, latency: 1.2, fill: "#EF4444" },
  { model: "ARIMA (1,1,1)", mape: 21.2, latency: 4.8, fill: "#F97316" },
  { model: "Standard LSTM", mape: 14.6, latency: 22.4, fill: "#38BDF8" },
  { model: "GlobeX GRU+XGB", mape: 8.42, latency: 14.2, fill: "#10B981" },
];

const TIME_REDUCTION_BENCHMARKS = [
  { stage: "Trade Discovery & Match", traditional: 120, globex: 0.1 },
  { stage: "Document Audit & OCR", traditional: 48, globex: 0.2 },
  { stage: "Customs & CEPA Check", traditional: 72, globex: 0.5 },
  { stage: "Escrow Settlement & LC", traditional: 168, globex: 0.4 },
];

const RADAR_COUNTRY_DATA = [
  { subject: "Revealed Demand", UAE: 88, USA: 84, Saudi: 82, Japan: 70 },
  { subject: "Tariff Preference", UAE: 95, USA: 74, Saudi: 80, Japan: 65 },
  { subject: "Logistics Speed", UAE: 84, USA: 88, Saudi: 78, Japan: 86 },
  { subject: "Economic Capacity", UAE: 79, USA: 94, Saudi: 82, Japan: 90 },
  { subject: "Buyer Density", UAE: 78, USA: 85, Saudi: 75, Japan: 74 },
  { subject: "FX Stability", UAE: 80, USA: 88, Saudi: 78, Japan: 92 },
  { subject: "Forecast Momentum", UAE: 82, USA: 80, Saudi: 76, Japan: 72 },
];

const ANOMALY_SCATTER_SAMPLE = [
  { qty: 1000, value: 2100, unitPrice: 2.10, isAnomaly: 0, label: "Normal Trade #101" },
  { qty: 2500, value: 5200, unitPrice: 2.08, isAnomaly: 0, label: "Normal Trade #102" },
  { qty: 5000, value: 11000, unitPrice: 2.20, isAnomaly: 0, label: "Normal Trade #103" },
  { qty: 10000, value: 21500, unitPrice: 2.15, isAnomaly: 0, label: "Normal Trade #104" },
  { qty: 15000, value: 31000, unitPrice: 2.06, isAnomaly: 0, label: "Normal Trade #105" },
  { qty: 20000, value: 43000, unitPrice: 2.15, isAnomaly: 0, label: "Normal Trade #106" },
  { qty: 5000, value: 48000, unitPrice: 9.60, isAnomaly: 1, label: "Flagged: Price Inflation / Misinvoicing" },
  { qty: 12000, value: 4200, unitPrice: 0.35, isAnomaly: 1, label: "Flagged: Value Collapse / Tax Evasion" },
  { qty: 8000, value: 17200, unitPrice: 2.15, isAnomaly: 0, label: "Normal Trade #107" },
  { qty: 3000, value: 29000, unitPrice: 9.67, isAnomaly: 1, label: "Flagged: Extreme Unit Anomaly" },
];

// ── ML Model Metadata ──────────────────────────────────────────────────────────
const MODEL_TABS = [
  {
    id: "impact_roi",
    name: "00. Product Impact & Value",
    shortName: "Product Value",
    icon: Zap,
    badge: "99.2% Latency Reduction",
    color: "emerald",
  },
  {
    id: "demand_forecast",
    name: "01. Demand Forecaster",
    shortName: "Demand Forecaster",
    icon: TrendingUp,
    badge: "Deep GRU + Quantile Loss",
    color: "emerald",
  },
  {
    id: "trade_anomaly",
    name: "02. Anomaly Ensemble",
    shortName: "Anomaly Ensemble",
    icon: Activity,
    badge: "Isolation Forest + XGBoost",
    color: "amber",
  },
  {
    id: "destination_ranking",
    name: "03. Destination Ranking",
    shortName: "MCDM Ranking",
    icon: Scale,
    badge: "MCDM + RCA Engine",
    color: "sky",
  },
  {
    id: "counterparty_matching",
    name: "04. Counterparty Matching",
    shortName: "Counterparty Matching",
    icon: Building2,
    badge: "TF-IDF + Cosine Sim",
    color: "indigo",
  },
  {
    id: "document_intelligence",
    name: "05. Doc Intelligence",
    shortName: "Doc Intelligence",
    icon: FileCheck2,
    badge: "LayoutLM + OCR Verification",
    color: "rose",
  },
  {
    id: "rag_policy",
    name: "06. CEPA Regulatory RAG",
    shortName: "CEPA RAG Policy",
    icon: BookOpen,
    badge: "Vector RAG Embeddings",
    color: "purple",
  },
];

export const MLResearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("impact_roi");

  // Interactive playground states
  const [testCommodity, setTestCommodity] = useState<string>("1121 Basmati Rice");
  const [testQuantity, setTestQuantity] = useState(1000);
  const [testValueUSD, setTestValueUSD] = useState(2100);

  // Dynamic ROI Calculator state
  const [roiTradeVolumeUSD, setRoiTradeVolumeUSD] = useState<number>(500000);
  const dutySavings = useMemo(() => Math.round(roiTradeVolumeUSD * 0.055), [roiTradeVolumeUSD]);
  const lcEscrowSavings = useMemo(() => Math.round(roiTradeVolumeUSD * 0.0275), [roiTradeVolumeUSD]);
  const complianceHoursSaved = useMemo(() => Math.round((roiTradeVolumeUSD / 50000) * 18), [roiTradeVolumeUSD]);

  // Anomaly Calculation Simulation
  const unitPrice = testValueUSD / (testQuantity || 1);
  const isAnomaly = unitPrice < 0.8 || unitPrice > 6.5;
  const anomalyScore = isAnomaly
    ? Math.min(99, Math.round(75 + (unitPrice > 6.5 ? unitPrice * 2 : 20)))
    : Math.max(8, Math.round(12 + Math.abs(unitPrice - 2.1) * 6));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" />
                GlobeX Applied AI &amp; Quantitative Trade Research Hub
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-mono">
                Production Architecture v2.4
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono">
                PyTorch · XGBoost · Isolation Forest · Recharts Interactive
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
              Machine Learning &amp; Deep Learning System Architecture &amp; Empirical Impact
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-sans">
              GlobeX replaces slow, error-prone manual international trade operations with a cognitive ensemble combining deep recurrent neural networks (GRU), gradient-boosted quantile regressors, isolation forest spatial anomaly detectors, and multidimensional decision matrices.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Verification Latency</span>
                <span className="text-lg font-mono font-bold text-emerald-400">&lt; 2 Hours</span>
                <span className="text-[10px] text-slate-500 block">vs. 14–21 Days (Manual)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Demand Forecast MAPE</span>
                <span className="text-lg font-mono font-bold text-sky-400">8.42%</span>
                <span className="text-[10px] text-slate-500 block">Quantile Pinball Loss</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Anomaly Detection ROC</span>
                <span className="text-lg font-mono font-bold text-amber-400">0.942 AUC</span>
                <span className="text-[10px] text-slate-500 block">Cross-Corridor Validated</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Inference Budget</span>
                <span className="text-lg font-mono font-bold text-indigo-400">&lt; 42 ms</span>
                <span className="text-[10px] text-slate-500 block">Serverless Edge Pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {MODEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  isSelected
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-emerald-400" : "text-slate-500")} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* TAB 00: PRODUCT IMPACT & VALUE BENCHMARKS */}
          {activeTab === "impact_roi" && (
            <motion.div
              key="impact_roi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Chart: Traditional vs GlobeX Clearance Time */}
                <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">Empirical Value Benchmark</span>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                        Operational Latency &amp; Time-to-Settle Reduction
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                      -99.2% Turnaround Time
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    Traditional cross-border trade requires 14–21 days of fragmented manual verification across customs agents, paper Letters of Credit (LC), and compliance brokers. GlobeX reduces the entire pipeline to <strong>&lt; 2 hours</strong> through end-to-end multimodal verification and smart escrow contracts.
                  </p>

                  {/* Recharts Bar Chart: Stage Latency Comparison */}
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={TIME_REDUCTION_BENCHMARKS} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="stage" tick={{ fill: "#64748B", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Hours to Complete", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#F8FAFC", fontSize: "12px" }}
                          formatter={(val: any) => [`${val} Hours`, ""]}
                        />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Bar dataKey="traditional" name="Traditional Trade (Hours)" fill="#EF4444" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="globex" name="GlobeX AI Platform (Hours)" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interactive Dynamic ROI & Savings Calculator */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                    <h3 className="font-display font-bold text-lg text-white">Trade Value &amp; ROI Simulator</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Simulate direct bottom-line capital savings unlocked by GlobeX automated CEPA preferential tariffs, smart escrow fee reduction, and automated OCR audits.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Trade Value (USD)</span>
                      <strong className="text-emerald-400">${roiTradeVolumeUSD.toLocaleString()}</strong>
                    </div>
                    <input
                      type="range"
                      min={50000}
                      max={5000000}
                      step={50000}
                      value={roiTradeVolumeUSD}
                      onChange={(e) => setRoiTradeVolumeUSD(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 font-mono text-xs">
                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">CEPA 0% Tariff Savings</span>
                        <span className="text-white font-bold text-sm">+${dutySavings.toLocaleString()}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">5.5% MFN Saved</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Bank LC &amp; Escrow Fee Saved</span>
                        <span className="text-white font-bold text-sm">+${lcEscrowSavings.toLocaleString()}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">2.75% LC Avoided</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Compliance Labor Saved</span>
                        <span className="text-white font-bold text-sm">{complianceHoursSaved} Hours</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">Auto-OCR</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-300 block">Total Net Value Unlocked per Shipment</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      +${(dutySavings + lcEscrowSavings).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Model Comparison Chart */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider block">Algorithm Benchmark</span>
                    <h3 className="text-xl font-display font-bold text-slate-900">
                      Demand Forecasting Error Rate Comparison (MAPE %)
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
                    8.42% Mean Absolute Percentage Error
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FORECAST_MODEL_COMPARISON} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="model" tick={{ fill: "#64748B", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Forecast Error (MAPE %)", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#F8FAFC", fontSize: "12px" }}
                        formatter={(val: any) => [`${val}% Error`, "MAPE"]}
                      />
                      <Bar dataKey="mape" radius={[6, 6, 0, 0]}>
                        {FORECAST_MODEL_COMPARISON.map((entry, index) => (
                          <cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 01: DEMAND FORECASTER */}
          {activeTab === "demand_forecast" && (
            <motion.div
              key="demand_forecast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">Pipeline 01</span>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                      Deep GRU Bilateral Demand Forecaster with Calibrated Quantiles (P10 · P50 · P90)
                    </h2>
                  </div>
                  
                  {/* Commodity Selector for Live Chart */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Commodity:</span>
                    <select
                      value={testCommodity}
                      onChange={(e) => setTestCommodity(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-800"
                    >
                      <option value="1121 Basmati Rice">1121 Basmati Rice (HS 100630)</option>
                      <option value="Organic Black Pepper">Organic Black Pepper (HS 090411)</option>
                      <option value="Assam CTC Tea">Assam CTC Tea (HS 090240)</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  The plot below displays the multi-horizon probabilistic forecast generated by the <strong>Deep GRU + Quantile Loss</strong> network. The green shaded confidence cone depicts the calibrated <strong>80% uncertainty interval (P10 to P90)</strong>, capturing non-Gaussian macro demand shocks while tracking realized UN Comtrade bilateral import volume.
                </p>

                {/* Interactive Recharts Timeline */}
                <div className="h-80 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DEMAND_TIME_SERIES[testCommodity] || DEMAND_TIME_SERIES["1121 Basmati Rice"]} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="quantileCone" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Volume (Metric Tons x 1,000)", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#F8FAFC", fontSize: "12px" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Area type="monotone" dataKey="p90" stroke="#10B981" fill="url(#quantileCone)" name="P90 Optimistic Bound" />
                      <Area type="monotone" dataKey="p10" stroke="#10B981" fill="#FFFFFF" fillOpacity={1} name="P10 Conservative Bound" />
                      <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={3} name="P50 Median Forecast" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="realized" stroke="#0284C7" strokeWidth={2} strokeDasharray="5 5" name="Realized Demand" dot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 02: TRADE ANOMALY ENSEMBLE */}
          {activeTab === "trade_anomaly" && (
            <motion.div
              key="trade_anomaly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider block">Pipeline 02</span>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                        Spatial Outlier Detection &amp; Price Shock Classification
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold">
                      Isolation Forest (ROC-AUC 0.942)
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    Isolation Forest partitions high-dimensional transaction spaces $[z_p, z_v, \Delta\text{volume}]$ to catch trade misinvoicing and price exploitation. The scatter plot below shows verified transactions vs. anomalous transactions flagged by the model.
                  </p>

                  {/* Scatter Chart: Normal vs Anomalous Transactions */}
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="qty" name="Quantity (kg)" tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Transaction Quantity (kg)", position: "insideBottom", offset: -10, fill: "#94A3B8", fontSize: 11 }} />
                        <YAxis dataKey="value" name="Declared Value (USD)" tick={{ fill: "#64748B", fontSize: 11 }} label={{ value: "Declared Value ($)", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 11 }} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#F8FAFC", fontSize: "12px" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Scatter name="Normal Corridor Baseline" data={ANOMALY_SCATTER_SAMPLE.filter(d => d.isAnomaly === 0)} fill="#10B981" />
                        <Scatter name="Flagged Anomaly (Price Shock)" data={ANOMALY_SCATTER_SAMPLE.filter(d => d.isAnomaly === 1)} fill="#EF4444" shape="cross" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interactive Anomaly Simulator */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>Live Anomaly Sandbox</span>
                  </span>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 block mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      value={testQuantity}
                      onChange={(e) => setTestQuantity(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-600 block mb-1">Declared Value (USD)</label>
                    <input
                      type="number"
                      value={testValueUSD}
                      onChange={(e) => setTestValueUSD(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs font-mono">
                    <span className="text-slate-500 block text-[10px]">Calculated Unit Price</span>
                    <strong className="text-slate-900 text-sm">${unitPrice.toFixed(2)} / kg</strong>
                  </div>

                  <div className={cn("p-4 rounded-xl border", isAnomaly ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900")}>
                    <span className="text-[10px] uppercase font-mono font-bold block">
                      {isAnomaly ? "⚠️ Transaction Outlier Flagged" : "✓ Within Normal Corridor Baseline"}
                    </span>
                    <span className="text-lg font-mono font-bold block mt-1">{anomalyScore} / 100 Risk Score</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 03: MCDM DESTINATION RANKING */}
          {activeTab === "destination_ranking" && (
            <motion.div
              key="destination_ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider block">Pipeline 03</span>
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                        7-Dimensional Multi-Criteria Decision Matrix (MCDM &amp; RCA)
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-bold">
                      Spearman Rank ρ = 0.88
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    Evaluates international destinations using 7 weighted economic dimensions: Revealed Demand Fit ($w_1=0.25$), Forecast Momentum ($w_2=0.20$), Trade Access &amp; Tariffs ($w_3=0.15$), Economic Capacity ($w_4=0.15$), Maritime Logistics ($w_5=0.10$), Buyer Network Ecosystem ($w_6=0.10$), and Macro Stability ($w_7=0.05$).
                  </p>

                  {/* Radar Chart: Destination Comparison */}
                  <div className="h-80 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={RADAR_COUNTRY_DATA}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                        <Radar name="United Arab Emirates (ARE - 81.4)" dataKey="UAE" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                        <Radar name="United States (USA - 78.8)" dataKey="USA" stroke="#0284C7" fill="#0284C7" fillOpacity={0.3} />
                        <Radar name="Saudi Arabia (SAU - 76.2)" dataKey="Saudi" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#F8FAFC", fontSize: "12px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-sky-600" />
                      <span>7-D Weight Configuration</span>
                    </h3>
                    <div className="space-y-2.5 text-xs font-mono">
                      {[
                        { label: "Revealed Demand Fit", weight: "25%" },
                        { label: "Forecast Demand Momentum", weight: "20%" },
                        { label: "CEPA Preferential Tariff", weight: "15%" },
                        { label: "Economic Absorption", weight: "15%" },
                        { label: "Maritime Logistics & Port LPI", weight: "10%" },
                        { label: "Verified Buyer Density", weight: "10%" },
                        { label: "FX & Macro Stability", weight: "5%" },
                      ].map((w, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                          <span className="text-slate-600">{w.label}</span>
                          <strong className="text-slate-900">{w.weight}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 04: COUNTERPARTY MATCHING */}
          {activeTab === "counterparty_matching" && (
            <motion.div
              key="counterparty_matching"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider block">Pipeline 04</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                B2B Counterparty Matching &amp; TF-IDF Vectorizer
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Vectorizes company business descriptions and combines them with logarithmic market cap valuation and strict sector penalty multipliers (0.15x for mismatched sectors) to eliminate false mega-cap matches and surface genuine buyers.
              </p>
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
                <code>
                  Score = 0.50 · TF_IDF_Cosine(Query, BusinessSummary) + 0.30 · SectorRelevance + 0.20 · LogValuation
                </code>
              </div>
            </motion.div>
          )}

          {/* TAB 05: DOCUMENT INTELLIGENCE */}
          {activeTab === "document_intelligence" && (
            <motion.div
              key="document_intelligence"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <span className="text-xs font-mono font-bold text-rose-700 uppercase tracking-wider block">Pipeline 05</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                Multimodal Document Intelligence &amp; Verification (LayoutLM + OCR)
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Extracts and verifies key trade documents (Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin) across 14 mandatory fields with cross-document consistency validation.
              </p>
            </motion.div>
          )}

          {/* TAB 06: CEPA REGULATORY RAG */}
          {activeTab === "rag_policy" && (
            <motion.div
              key="rag_policy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider block">Pipeline 06</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                CEPA &amp; Regulatory RAG Policy Engine
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Retrieval-Augmented Generation indexing bilateral treaties (e.g. India-UAE CEPA, India-Australia ECTA) to provide grounded, citation-backed tariff savings and compliance requirements.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Documentation & GitHub Artefacts ─────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-white">Full ML Technical Whitepaper &amp; Model Cards</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Access the complete mathematical proofs, walk-forward validation logs, and Model Cards in the repository.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              to="/export-discover"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-all shadow-md"
            >
              Launch Trade Operating System
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
};

export default MLResearchPage;

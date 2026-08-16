import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace, DutyMode } from "@/context/WorkspaceContext";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Activity,
  AlertTriangle,
  Brain,
  Ship,
  FileCheck2,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Building2,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  FileText,
  Briefcase,
  Sliders,
  DollarSign,
  Package,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, role, roleLabel, dutyMode, setDutyMode } = useWorkspace();
  const [activeTab, setActiveTab] = useState<DutyMode>(dutyMode || "dual");
  const [selectedHsCode, setSelectedHsCode] = useState("1006.30");
  const [tradeValueCalc, setTradeValueCalc] = useState(500000);
  const [showDutyModal, setShowDutyModal] = useState(false);

  // Sync tab with context if changed externally
  const handleTabChange = (mode: DutyMode) => {
    setActiveTab(mode);
    setDutyMode(mode);
  };

  // Mock Active Import Contracts
  const activeImports = [
    {
      id: "TRD-LTC-CL-992",
      title: "Battery Grade Lithium Carbonate 99.5% (200 MT)",
      route: "Chile (Valparaíso) → India (JNPT)",
      counterparty: "SQM Salar S.A.",
      value: "$3,200,000",
      status: "warning" as const,
      statusLabel: "Step 2: Customs Review",
      dutyType: "Import Duty",
      escrowLocked: "$3,200,000 USD",
      cepaSavings: "$240,000 Saved (0% Tariff)",
      icon: FileCheck2,
    },
    {
      id: "TRD-WHT-CA-501",
      title: "Organic Hard Red Durum Wheat (1,200 MT)",
      route: "Canada (Vancouver) → India (Nhava Sheva)",
      counterparty: "Viterra Canada Inc.",
      value: "$920,000",
      status: "in_transit" as const,
      statusLabel: "Step 4: Sea Transit (AIS Active)",
      dutyType: "Import Duty",
      escrowLocked: "$920,000 USD",
      cepaSavings: "$69,000 Saved",
      icon: Ship,
    },
    {
      id: "TRD-SOL-TW-331",
      title: "Solar Inverter Power Sub-Assemblies (5,000 Units)",
      route: "Taiwan (Kaohsiung) → India (Mundra)",
      counterparty: "Delta Electronics Corp",
      value: "$1,450,000",
      status: "verified" as const,
      statusLabel: "Step 5: Port Staging",
      dutyType: "Import Duty",
      escrowLocked: "$1,450,000 USD",
      cepaSavings: "$108,750 Saved",
      icon: Package,
    },
  ];

  // Mock Active Export Contracts
  const activeExports = [
    {
      id: FLAGSHIP_DEMO_TRADE.id,
      title: `${FLAGSHIP_DEMO_TRADE.product} (500 MT)`,
      route: "India (JNPT) → UAE (Jebel Ali Port)",
      counterparty: "Al-Futtaim Global Trade LLC",
      value: "$550,000",
      status: "in_transit" as const,
      statusLabel: "Step 5: In Transit on MSC ANNA",
      dutyType: "Export Duty",
      escrowLocked: "$550,000 Locked in Vault",
      compliance: "APEDA & FSSAI 100% Certified",
      icon: Ship,
      link: "/trades/TRD-IND-UAE-550K",
    },
    {
      id: "TRD-PEP-IN-442",
      title: "Tellicherry Extra Bold Black Pepper GI-Tagged (150 MT)",
      route: "India (Kochi) → Netherlands (Rotterdam)",
      counterparty: "Nedspice Processing B.V.",
      value: "$410,000",
      status: "verified" as const,
      statusLabel: "Step 3: Phytosanitary Verified",
      dutyType: "Export Duty",
      escrowLocked: "$410,000 Escrow Deposited",
      compliance: "Spices Board & EU MRL Passed",
      icon: FileCheck2,
      link: "/documents",
    },
    {
      id: "TRD-YRN-IN-780",
      title: "Advanced Combed Cotton Yarn Ne 30s-40s (300 MT)",
      route: "India (Surat) → Italy (Genoa Port)",
      counterparty: "Gruppo Albini S.p.A.",
      value: "$880,000",
      status: "draft" as const,
      statusLabel: "Step 4: Bill of Lading Staged",
      dutyType: "Export Duty",
      escrowLocked: "$880,000 LC Confirmed",
      compliance: "OEKO-TEX Standard 100",
      icon: Package,
      link: "/marketplace",
    },
  ];

  return (
    <AppShell maxWidth="xl">
      <div className="space-y-6 select-none">
        
        {/* ── UNIFIED EXECUTIVE HEADER ────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0E1522] to-[#0A0F18] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            {/* Enterprise & Role Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.companyName}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Role: {user.roleTitle || "Admin"}</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EVM Node Active</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Global Trade Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans">
                Manage unified international trade operations. Switch between dual perspective, dedicated import duty sourcing, and export duty sales on a single page.
              </p>
            </div>

            {/* Quick Actions (Both Duties on Same Page) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/trade-requests?duty=import">
                <button className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-display font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-500/10 cursor-pointer">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>+ New Import RFQ</span>
                </button>
              </Link>

              <Link to="/my-listings">
                <button className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-display font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+ Add Export Listing</span>
                </button>
              </Link>
            </div>
          </div>


          {/* ── PERSPECTIVE SELECTOR BAR ────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080D15] border border-white/[0.08] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange("dual")}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
                  activeTab === "dual"
                    ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dual Perspective (Both)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("import")}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
                  activeTab === "import"
                    ? "bg-sky-500/20 border border-sky-500/50 text-sky-300 shadow-md"
                    : "text-slate-400 hover:text-sky-300"
                )}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Import Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("export")}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
                  activeTab === "export"
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-md"
                    : "text-slate-400 hover:text-emerald-300"
                )}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Dashboard</span>
              </button>
            </div>

            {/* Quick KPI summary pill */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Imports: <strong>$8.4M</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Exports: <strong>$14.2M</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* ── COMBINED HIGH-SIGNAL METRICS ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Combined Exposure</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              $22.6M <span className="text-xs font-sans text-slate-400 font-normal">USD</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+$3.1M active this month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Active Contracts</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              32 <span className="text-xs font-sans text-slate-400 font-normal">Trades</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              14 Imports · 18 Exports
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Smart Escrow Locked</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
              $14.2M <span className="text-xs font-sans text-slate-400 font-normal">Safe</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              100% Multi-Sig Safeguarded
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Enterprise Trust Score</span>
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              96 / 100
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Zero Arbitrated Disputes
            </div>
          </div>
        </div>

        {/* ── PROMINENT ACTION CARD: IMMEDIATE HIGH-PRIORITY FLAGGED TRADE ── */}
        <div className="p-5 rounded-2xl bg-[#0C1322] border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                EXPORT SHIPMENT · IN TRANSIT
              </span>
              <span className="text-xs font-mono text-slate-400">#{FLAGSHIP_DEMO_TRADE.id}</span>
            </div>
            <h2 className="text-lg font-display font-bold text-white">
              {FLAGSHIP_DEMO_TRADE.title} — En Route to Jebel Ali Port (UAE)
            </h2>
            <p className="text-xs text-slate-400">
              Vessel MSC ANNA is sailing on schedule. Escrow payment of $550,000 USD is locked. Customs pre-clearance completed with 100% document validation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/trades/TRD-IND-UAE-550K">
              <PrimaryAction size="md">
                Open Active Trade Workspace →
              </PrimaryAction>
            </Link>
          </div>
        </div>

        {/* ── DUAL / IMPORT / EXPORT PANELS ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══════════════════════════════════════════════════════════════════
              DASHBOARD 1: IMPORT DASHBOARD (INBOUND PROCUREMENT & SOURCING)
              ═══════════════════════════════════════════════════════════════════ */}
          {(activeTab === "dual" || activeTab === "import") && (
            <div className={cn("space-y-4", activeTab === "import" && "lg:col-span-2")}>
              
              {/* Import Dashboard Header Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B1322] to-[#080D17] border border-sky-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-mono font-bold uppercase">
                        Import Duty Operations
                      </div>
                      <h2 className="text-lg font-display font-bold text-white">
                        Inbound Procurement & Customs
                      </h2>
                    </div>
                  </div>

                  <Link
                    to="/marketplace"
                    className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Browse Suppliers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Import KPIs */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-[#10192A] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Inbound Value</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-sky-300">$8.4M</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10192A] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Active Imports</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-white">14 Orders</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10192A] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">CEPA Savings</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">$412K</div>
                  </div>
                </div>

                {/* Import Operations Hub */}
                <div className="p-3.5 rounded-2xl bg-[#0D1524] border border-white/[0.06] space-y-2">
                  <div className="text-xs font-display font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Quick Import Operations</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      to="/trade-requests?duty=import"
                      className="p-2.5 rounded-xl bg-[#131E32] hover:bg-[#18263E] border border-white/[0.06] hover:border-sky-500/40 text-slate-200 transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Post Import RFQ</span>
                    </Link>

                    <Link
                      to="/documents"
                      className="p-2.5 rounded-xl bg-[#131E32] hover:bg-[#18263E] border border-white/[0.06] hover:border-sky-500/40 text-slate-200 transition-all flex items-center gap-2"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Verify Supplier KYC</span>
                    </Link>
                  </div>
                </div>

                {/* Inbound Active Shipments List */}
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                    Active Inbound Shipments & Contracts
                  </div>

                  <div className="space-y-2">
                    {activeImports.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#0D1524] border border-white/[0.06] hover:border-sky-500/40 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-display font-bold text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {item.id} • {item.route}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-sky-300">{item.value}</div>
                            <div className="text-[10px] font-mono text-emerald-400">{item.cepaSavings}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                          <StatusBadge status={item.status} label={item.statusLabel} size="sm" />
                          <Link
                            to="/documents"
                            className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <span>Inspect Papers</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              DASHBOARD 2: EXPORT DASHBOARD (OUTBOUND SALES & CATALOG)
              ═══════════════════════════════════════════════════════════════════ */}
          {(activeTab === "dual" || activeTab === "export") && (
            <div className={cn("space-y-4", activeTab === "export" && "lg:col-span-2")}>
              
              {/* Export Dashboard Header Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0A171D] to-[#071216] border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                        Export Duty Operations
                      </div>
                      <h2 className="text-lg font-display font-bold text-white">
                        Outbound Sales & Global Fulfillment
                      </h2>
                    </div>
                  </div>

                  <Link
                    to="/my-listings"
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    <span>My Export Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Export KPIs */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-[#0D1F23] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Outbound Value</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-emerald-300">$14.2M</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1F23] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Active Exports</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-white">18 Orders</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1F23] border border-white/[0.06] text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Escrow Receivables</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-amber-300">$5.85M</div>
                  </div>
                </div>

                {/* Export Operations Hub */}
                <div className="p-3.5 rounded-2xl bg-[#09171C] border border-white/[0.06] space-y-2">
                  <div className="text-xs font-display font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick Export Operations</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      to="/my-listings"
                      className="p-2.5 rounded-xl bg-[#0F2228] hover:bg-[#152D35] border border-white/[0.06] hover:border-emerald-500/40 text-slate-200 transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Product Listing</span>
                    </Link>

                    <Link
                      to="/documents"
                      className="p-2.5 rounded-xl bg-[#0F2228] hover:bg-[#152D35] border border-white/[0.06] hover:border-emerald-500/40 text-slate-200 transition-all flex items-center gap-2"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Apply Chamber COO</span>
                    </Link>
                  </div>

                </div>

                {/* Outbound Active Shipments List */}
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                    Active Outbound Shipments & Contracts
                  </div>

                  <div className="space-y-2">
                    {activeExports.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#09171C] border border-white/[0.06] hover:border-emerald-500/40 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-display font-bold text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {item.id} • {item.route}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-emerald-300">{item.value}</div>
                            <div className="text-[10px] font-mono text-slate-400">{item.escrowLocked}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                          <StatusBadge status={item.status} label={item.statusLabel} size="sm" />
                          <Link
                            to={item.link || "/trades/TRD-IND-UAE-550K"}
                            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Trade</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ── TARIFF & CEPA DUTY SAVINGS CALCULATOR (Hardcoded Frontend Simulation) ── */}
        <div className="p-6 rounded-3xl bg-[#090E17] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
                <Percent className="w-3.5 h-3.5" />
                <span>CEPA Comprehensive Economic Partnership Schedule</span>
              </div>
              <h3 className="text-lg font-display font-bold text-white">
                Live Cross-Border Tariff Calculator (India ⇄ UAE ⇄ Global)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Rule of Origin: Minimum 40% Value Add
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Input 1: HS Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                HS Commodity Code
              </label>
              <select
                value={selectedHsCode}
                onChange={(e) => setSelectedHsCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none cursor-pointer"
              >
                <option value="1006.30">HS 1006.30 - Semi-milled or wholly milled Basmati Rice</option>
                <option value="0904.11">HS 0904.11 - Pepper of the genus Piper (Tellicherry)</option>
                <option value="5205.12">HS 5205.12 - Single cotton yarn uncombed fibers</option>
                <option value="2836.91">HS 2836.91 - Lithium Carbonates Battery Grade</option>
              </select>
            </div>

            {/* Input 2: Trade Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                Shipment CIF Value ($ USD)
              </label>
              <input
                type="number"
                value={tradeValueCalc}
                onChange={(e) => setTradeValueCalc(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#111824] border border-white/[0.08] text-xs text-white outline-none font-mono"
              />
            </div>

            {/* Result Pill */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Standard vs CEPA Rate</div>
                <div className="text-lg font-mono font-bold text-white">
                  ${Math.round(tradeValueCalc * 0.05).toLocaleString()} <span className="text-xs text-emerald-400">Saved (0% Duty)</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
};

export default DashboardPage;


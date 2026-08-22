import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import AnimatedList from "@/components/reactbits/AnimatedList";
import { cn } from "@/lib/utils";
import {
  Coins,
  Brain,
  Ship,
  FileCheck2,
  ArrowRight,
  PlusCircle,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  CheckCircle2,
  Briefcase,
  Info,
  Scale,
  Columns,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DualViewMode = "dual" | "import" | "export";

export const DashboardPage: React.FC = () => {
  const { user } = useWorkspace();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<DualViewMode>("dual");
  const [selectedHsCode, setSelectedHsCode] = useState("1006.30");
  const [tradeValueCalc, setTradeValueCalc] = useState(500000);

  // Inbound / Import Operational Contracts
  const importTrades = [
    {
      id: "TRD-LTC-CL-992",
      title: "Lithium Carbonate 99.5% (200 MT)",
      route: "Chile (Valparaíso) → India (JNPT)",
      counterparty: "SQM Salar S.A.",
      valueUSD: 3200000,
      valueText: "$3.20M",
      status: "warning" as const,
      stepText: "Step 2 · Customs Review",
      paymentState: "Escrow Locked",
      savings: "Saved $240K (0% Duty)",
      actionText: "Inspect Papers",
      actionHref: "/documents",
    },
    {
      id: "TRD-WHT-CA-501",
      title: "Organic Hard Red Wheat (1,200 MT)",
      route: "Canada (Vancouver) → India (Nhava Sheva)",
      counterparty: "Viterra Canada Inc.",
      valueUSD: 920000,
      valueText: "$920K",
      status: "in_transit" as const,
      stepText: "Step 5 · Sea Transit (AIS)",
      paymentState: "Escrow Secured",
      savings: "Saved $69K (CEPA)",
      actionText: "Track Vessel",
      actionHref: "/shipments",
    },
    {
      id: "TRD-SOL-TW-331",
      title: "Solar Inverter Modules (5,000 Pcs)",
      route: "Taiwan (Kaohsiung) → India (Mundra)",
      counterparty: "Delta Electronics Corp",
      valueUSD: 1450000,
      valueText: "$1.45M",
      status: "verified" as const,
      stepText: "Step 4 · Port Staged",
      paymentState: "USDC Collateralized",
      savings: "Saved $108K (0% Tariff)",
      actionText: "Inspect Escrow",
      actionHref: "/escrow",
    },
  ];

  // Outbound / Export Operational Contracts
  const exportTrades = [
    {
      id: FLAGSHIP_DEMO_TRADE.id,
      title: "1121 Steam Basmati Rice (500 MT)",
      route: "India (JNPT) → UAE (Jebel Ali)",
      counterparty: "Example Global Trading Ltd.",
      valueUSD: 550000,
      valueText: "$550K",
      status: "in_transit" as const,
      stepText: "Step 5 · Sailing (MSC ANNA)",
      paymentState: "USDC Escrow Locked",
      savings: "APEDA & FSSAI Certified",
      actionText: "Open Trade",
      actionHref: "/trades/TRD-IND-UAE-550K",
      isFlagged: true,
    },
    {
      id: "TRD-PEP-IN-442",
      title: "Tellicherry Black Pepper (150 MT)",
      route: "India (Kochi) → Netherlands (Rotterdam)",
      counterparty: "Nedspice Processing B.V.",
      valueUSD: 410000,
      valueText: "$410K",
      status: "verified" as const,
      stepText: "Step 3 · Phytosanitary Cleared",
      paymentState: "LC Confirmed",
      savings: "Spices Board Verified",
      actionText: "Review Docs",
      actionHref: "/documents",
    },
    {
      id: "TRD-YRN-IN-780",
      title: "Combed Cotton Yarn (300 MT)",
      route: "India (Surat) → Italy (Genoa Port)",
      counterparty: "Gruppo Albini S.p.A.",
      valueUSD: 880000,
      valueText: "$880K",
      status: "pending" as const,
      stepText: "Step 2 · Manifest Staged",
      paymentState: "Escrow Deposited",
      savings: "OEKO-TEX 100",
      actionText: "Manage Listing",
      actionHref: "/my-listings",
    },
  ];

  // Platform capabilities
  const capabilities = [
    {
      id: "tariff",
      title: "CEPA Preferential Tariff Engine",
      icon: Percent,
      description: "Automated HS code classification and bilateral preferential schedules under India-UAE CEPA partnership.",
      badge: "0% Duty Free",
      statusText: "Operational (40ms response)",
    },
    {
      id: "escrow",
      title: "Smart Escrow Multi-Sig Vault",
      icon: Coins,
      description: "Cryptographic escrow release triggered automatically upon Bill of Lading verification and port customs entry.",
      badge: "$14.2M Locked",
      statusText: "EVM Sepolia Smart Contract",
    },
    {
      id: "logistics",
      title: "Live AIS Vessel & Container Telemetry",
      icon: Ship,
      description: "Real-time vessel position tracking (MSC ANNA en route to Jebel Ali) with IoT container temperature logs.",
      badge: "AIS Stream Active",
      statusText: "Live Satellite Feed",
    },
    {
      id: "compliance",
      title: "Document Verification AI & OCR",
      icon: FileCheck2,
      description: "Zero-error cross-reconciliation across Certificate of Origin, APEDA inspection, and shipping manifests.",
      badge: "100% Validated",
      statusText: "Multi-Model Pipeline",
    },
    {
      id: "trust",
      title: "Enterprise Counterparty Trust Graph",
      icon: Brain,
      description: "Comprehensive risk assessment, verified payment histories, and accreditation scoring across global counterparties.",
      badge: "96/100 Rating",
      statusText: "128 Verified Trades",
    },
    {
      id: "arbitration",
      title: "Human-in-the-Loop Arbitration Protocol",
      icon: Scale,
      description: "Rapid cryptographic evidence submission and certified international trade arbitration resolution.",
      badge: "Zero-Loss SLA",
      statusText: "Licensed Arbitrators",
    },
  ];

  return (
    <AppShell maxWidth="full" className="space-y-6">
      {/* ── CLAYMORPHIC LIGHT DASHBOARD SURFACE (Soft Rounded Nunito Font ONLY for Dashboard) ── */}
      <div className="min-h-screen bg-[#EEF0F5] rounded-[36px] p-5 sm:p-8 space-y-8 text-slate-900 font-dashboard-rounded shadow-[inset_0_3px_8px_rgba(0,0,0,0.03)] border border-slate-300/90">
        
        {/* ── TOP OPERATIONAL COMMAND BAR (High-Contrast Clay Card) ──────────── */}
        <div
          id="command-center"
          className="relative p-6 sm:p-8 rounded-[30px] bg-white border border-slate-300 shadow-[12px_18px_36px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,1)] flex flex-col md:flex-row md:items-start justify-between gap-6 select-none overflow-hidden"
        >
          {/* Pure Orange Glow Backdrop */}
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF5500]/20 to-[#FF7700]/0 blur-3xl pointer-events-none" />

          {/* Context Information */}
          <div className="space-y-2 relative z-10 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-700 font-bold">
              <span className="flex items-center gap-1.5 text-slate-900 font-extrabold bg-[#E5E9F0] px-2.5 py-1 rounded-full border border-slate-300 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] truncate max-w-[160px]">
                <Building2 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                <span className="truncate">{user.companyName}</span>
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-800 font-bold truncate max-w-[140px]">
                
                
              </span>
            
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#0A0F1D] tracking-tight uppercase leading-tight">
              Global Trade <span className="text-[#FF5500]">Command Center</span>
            </h1>
          </div>

          {/* Clay View Mode Selector */}
          <div className="flex items-center p-1 rounded-2xl bg-[#E2E7F0] border border-slate-300 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.08),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] shrink-0 self-start relative z-10">
            <button
              type="button"
              onClick={() => setViewMode("dual")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono font-extrabold transition-all cursor-pointer whitespace-nowrap",
                viewMode === "dual"
                  ? "bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white shadow-[4px_6px_16px_rgba(255,85,0,0.38),inset_0_2px_3px_rgba(255,255,255,0.4)]"
                  : "text-slate-700 hover:text-slate-950"
              )}
            >
              <Columns className="w-3.5 h-3.5 shrink-0" />
              <span>Dual</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("import")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono font-extrabold transition-all cursor-pointer whitespace-nowrap",
                viewMode === "import"
                  ? "bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white shadow-[4px_6px_16px_rgba(255,85,0,0.38),inset_0_2px_3px_rgba(255,255,255,0.4)]"
                  : "text-slate-700 hover:text-slate-950"
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("export")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono font-extrabold transition-all cursor-pointer whitespace-nowrap",
                viewMode === "export"
                  ? "bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white shadow-[4px_6px_16px_rgba(255,85,0,0.38),inset_0_2px_3px_rgba(255,255,255,0.4)]"
                  : "text-slate-700 hover:text-slate-950"
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ── DUAL VIEW OPERATIONAL COLUMNS (High-Contrast Clay Cards) ─────────── */}
        <div
          id="active-contracts"
          className={cn(
            "grid gap-7 items-stretch transition-all duration-200",
            viewMode === "dual" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}
        >
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* ── COLUMN 1: IMPORT DUTY OPERATIONS ──────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {(viewMode === "dual" || viewMode === "import") && (
            <div
              id="import-operations"
              className="p-7 rounded-[30px] bg-white border border-slate-300 shadow-[12px_18px_36px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,1)] flex flex-col justify-between space-y-6 select-none"
            >
              {/* Column Header */}
              <div className="space-y-4 border-b border-slate-200/80 pb-4">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-[#FF5500] shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#0A0F1D] truncate">
                      IMPORT DUTY OPERATIONS
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-orange-100 text-[#FF5500] border border-orange-300 font-extrabold shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    INBOUND RADAR
                  </span>
                </div>

                {/* ── High Contrast Inflated Clay Numbers ───────────────────── */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      Inbound Value
                    </span>
                    <div className="text-lg font-black text-[#0A0F1D] tracking-tight truncate">
                      $8.4M
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold block truncate">
                      CIF Sourced
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      Active Imports
                    </span>
                    <div className="text-lg font-black text-[#FF5500] tracking-tight truncate">
                      14
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold block truncate">
                      Active Orders
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      CEPA Savings
                    </span>
                    <div className="text-lg font-black text-emerald-700 tracking-tight truncate">
                      $412K
                    </div>
                    <span className="text-[9px] text-emerald-700 font-extrabold block truncate">
                      0% Preferential
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Active Inbound Contracts List ──────────────────────────── */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-700 uppercase px-1">
                  <span className="font-black text-xs text-[#0A0F1D]">ACTIVE INBOUND CONTRACTS</span>
                  <span className="text-xs font-black text-[#FF5500]">3 PRIORITY</span>
                </div>

                <AnimatedList
                  items={importTrades}
                  maxHeight="340px"
                  listId="import-trades-list"
                  onItemSelect={(trade) => navigate(trade.actionHref)}
                  renderItem={(trade, _, { selected }) => (
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 shadow-[4px_8px_18px_rgba(0,0,0,0.04)] overflow-hidden",
                        selected
                          ? "bg-orange-100/80 border-orange-400 text-slate-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]"
                          : "bg-[#F5F7FA] border-slate-300 hover:border-[#FF5500] text-slate-900 hover:bg-white"
                      )}
                    >
                      {/* Line 1: Product Title & Value */}
                      <div className="flex items-start justify-between gap-2 overflow-hidden">
                        <div className="space-y-0.5 min-w-0 flex-1 overflow-hidden">
                          <h3 className="font-extrabold text-[11px] text-[#0A0F1D] truncate leading-tight">
                            {trade.title}
                          </h3>
                          <div className="text-[10px] font-mono text-slate-700 font-bold truncate">
                            {trade.route}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono pl-1">
                          <div className="text-[11px] font-black text-[#0A0F1D] whitespace-nowrap">
                            {trade.valueText}
                          </div>
                        </div>
                      </div>

                      {/* Line 2: Status & Action */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                          <div className="min-w-0 overflow-hidden max-w-[140px]">
                            <StatusBadge status={trade.status} label={trade.stepText} size="sm" />
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-600 hover:text-[#FF5500] transition-colors p-0.5 cursor-pointer font-bold shrink-0"
                                aria-label="Trade details summary"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              align="start"
                              className="w-64 p-4 bg-white border border-slate-300 text-xs space-y-2 text-slate-800 shadow-2xl rounded-2xl font-dashboard-rounded"
                            >
                              <div className="font-extrabold text-slate-950 text-xs border-b border-slate-200 pb-2">
                                {trade.title}
                              </div>
                              <div className="text-[11px] font-mono space-y-1 text-slate-700 font-bold">
                                <div>Trade ID: <span className="text-slate-950 font-black">{trade.id}</span></div>
                                <div>Counterparty: <span className="text-[#FF5500] font-black">{trade.counterparty}</span></div>
                                <div>Escrow: <span className="text-emerald-700 font-black">{trade.paymentState}</span></div>
                                <div>Benefit: <span className="text-emerald-700 font-black">{trade.savings}</span></div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <Link
                          to={trade.actionHref}
                          className="text-[10px] font-mono text-[#FF5500] hover:underline flex items-center gap-0.5 font-black shrink-0 whitespace-nowrap"
                        >
                          <span>{trade.actionText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate("/trade-requests?duty=import")}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white font-mono font-black text-xs flex items-center justify-center gap-2.5 shadow-[4px_8px_20px_rgba(255,85,0,0.38),inset_0_2px_3px_rgba(255,255,255,0.4)] hover:shadow-[6px_12px_26px_rgba(255,85,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>NEW IMPORT RFQ →</span>
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* ── COLUMN 2: EXPORT DUTY OPERATIONS ──────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {(viewMode === "dual" || viewMode === "export") && (
            <div
              id="export-operations"
              className="p-7 rounded-[30px] bg-white border border-slate-300 shadow-[12px_18px_36px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,1)] flex flex-col justify-between space-y-6 select-none"
            >
              {/* Column Header */}
              <div className="space-y-4 border-b border-slate-200/80 pb-4">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-[#FF5500] shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#0A0F1D] truncate">
                      EXPORT DUTY OPERATIONS
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-orange-100 text-[#FF5500] border border-orange-300 font-extrabold shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
                    OUTBOUND CATALOG
                  </span>
                </div>

                {/* ── High Contrast Inflated Clay Numbers ───────────────────── */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      Outbound Value
                    </span>
                    <div className="text-lg font-black text-[#0A0F1D] tracking-tight truncate">
                      $14.2M
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold block truncate">
                      Committed
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      Active Exports
                    </span>
                    <div className="text-lg font-black text-[#FF5500] tracking-tight truncate">
                      18
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold block truncate">
                      FOB Shipments
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#E8EDF5] border border-slate-300/80 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-0.5 font-mono overflow-hidden">
                    <span className="text-[9px] text-slate-600 font-black uppercase block truncate">
                      Escrow Vault
                    </span>
                    <div className="text-lg font-black text-sky-700 tracking-tight truncate">
                      $5.85M
                    </div>
                    <span className="text-[9px] text-slate-700 font-bold block truncate">
                      Multi-Sig Locked
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Active Outbound Contracts List ─────────────────────────── */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-700 uppercase px-1">
                  <span className="font-black text-xs text-[#0A0F1D]">ACTIVE OUTBOUND CONTRACTS</span>
                  <span className="text-xs font-black text-[#FF5500]">1 FLAGGED</span>
                </div>

                <AnimatedList
                  items={exportTrades}
                  maxHeight="340px"
                  listId="export-trades-list"
                  onItemSelect={(trade) => navigate(trade.actionHref)}
                  renderItem={(trade, _, { selected }) => (
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 shadow-[4px_8px_18px_rgba(0,0,0,0.04)] overflow-hidden",
                        trade.isFlagged
                          ? "bg-orange-100/90 border-orange-400"
                          : selected
                          ? "bg-orange-100/80 border-orange-400 text-slate-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]"
                          : "bg-[#F5F7FA] border-slate-300 hover:border-[#FF5500] text-slate-900 hover:bg-white"
                      )}
                    >
                      {/* Line 1: Product Title & Value */}
                      <div className="flex items-start justify-between gap-2 overflow-hidden">
                        <div className="space-y-0.5 min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <h3 className="font-extrabold text-[11px] text-[#0A0F1D] truncate leading-tight">
                              {trade.title}
                            </h3>
                            {trade.isFlagged && (
                              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-700 font-bold truncate">
                            {trade.route}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono pl-1">
                          <div className="text-[11px] font-black text-[#0A0F1D] whitespace-nowrap">
                            {trade.valueText}
                          </div>
                        </div>
                      </div>

                      {/* Line 2: Status & Action */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                          <div className="min-w-0 overflow-hidden max-w-[140px]">
                            <StatusBadge status={trade.status} label={trade.stepText} size="sm" />
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-600 hover:text-[#FF5500] transition-colors p-0.5 cursor-pointer font-bold shrink-0"
                                aria-label="Trade details summary"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              align="start"
                              className="w-64 p-4 bg-white border border-slate-300 text-xs space-y-2 text-slate-800 shadow-2xl rounded-2xl font-dashboard-rounded"
                            >
                              <div className="font-extrabold text-slate-950 text-xs border-b border-slate-200 pb-2">
                                {trade.title}
                              </div>
                              <div className="text-[11px] font-mono space-y-1 text-slate-700 font-bold">
                                <div>Trade ID: <span className="text-slate-950 font-black">{trade.id}</span></div>
                                <div>Buyer: <span className="text-[#FF5500] font-black">{trade.counterparty}</span></div>
                                <div>Escrow: <span className="text-emerald-700 font-black">{trade.paymentState}</span></div>
                                <div>Compliance: <span className="text-emerald-700 font-black">{trade.savings}</span></div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <Link
                          to={trade.actionHref}
                          className="text-[10px] font-mono text-[#FF5500] hover:underline flex items-center gap-0.5 font-black shrink-0 whitespace-nowrap"
                        >
                          <span>{trade.actionText}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate("/create-listing")}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white font-mono font-black text-xs flex items-center justify-center gap-2.5 shadow-[4px_8px_20px_rgba(255,85,0,0.38),inset_0_2px_3px_rgba(255,255,255,0.4)] hover:shadow-[6px_12px_26px_rgba(255,85,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>ADD EXPORT PRODUCT →</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── CEPA TARIFF CALCULATOR (High-Contrast Clay Card) ────────────────── */}
        <div
          id="tariff-intelligence"
          className="p-7 rounded-[30px] bg-white border border-slate-300 shadow-[12px_18px_36px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,1)] space-y-5 select-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-black uppercase">
                <Percent className="w-4 h-4" />
                <span>CEPA Bilateral Tariff Engine</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0A0F1D]">
                Live Cross-Border Tariff Calculator
              </h2>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-800 font-black cursor-help bg-[#E2E7F0] px-4 py-2 rounded-full border border-slate-300 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                    <Info className="w-4 h-4 text-[#FF5500]" />
                    <span>Rule of Origin: Min 40% Value-Add</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white border border-slate-300 text-xs text-slate-800 max-w-xs p-3.5 shadow-2xl rounded-2xl font-dashboard-rounded font-bold">
                  Under India-UAE CEPA schedules, products achieving minimum 40% domestic value addition qualify for 0.0% preferential import duties.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 3-Step Sequential Workflow with Clay Inset Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-[#E8EDF5] border border-slate-300 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-2 overflow-hidden">
              <div className="text-[10px] font-mono font-black text-slate-700 flex items-center justify-between gap-2 overflow-hidden">
                <span className="truncate">1. COMMODITY CODE</span>
                <span className="text-[10px] text-[#FF5500] shrink-0">HS CODE</span>
              </div>
              <select
                value={selectedHsCode}
                onChange={(e) => setSelectedHsCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-[11px] text-slate-950 font-black outline-none cursor-pointer shadow-[2px_3px_6px_rgba(0,0,0,0.04)] font-dashboard-rounded"
              >
                <option value="1006.30">HS 1006.30 - Semi-milled Basmati Rice</option>
                <option value="0904.11">HS 0904.11 - Black Pepper (Tellicherry)</option>
                <option value="5205.12">HS 5205.12 - Combed Cotton Yarn</option>
                <option value="2836.91">HS 2836.91 - Lithium Carbonate Battery Grade</option>
              </select>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-[#E8EDF5] border border-slate-300 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] space-y-2 overflow-hidden">
              <div className="text-[10px] font-mono font-black text-slate-700 flex items-center justify-between gap-2 overflow-hidden">
                <span className="truncate">2. SHIPMENT CIF VALUE</span>
                <span className="text-[10px] text-[#FF5500] shrink-0">USD</span>
              </div>
              <input
                type="number"
                value={tradeValueCalc}
                onChange={(e) => setTradeValueCalc(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-[11px] text-slate-950 font-mono font-black outline-none shadow-[2px_3px_6px_rgba(0,0,0,0.04)]"
              />
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-orange-100/90 border border-orange-300 shadow-[inset_3px_3px_6px_rgba(255,85,0,0.12)] flex items-center justify-between gap-3 overflow-hidden">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] font-mono font-black text-[#FF5500] truncate">
                  3. CALCULATED NET SAVINGS
                </div>
                <div className="text-xl font-mono font-black text-[#0A0F1D] truncate">
                  ${Math.round(tradeValueCalc * 0.05).toLocaleString()}{" "}
                  <span className="text-[10px] font-dashboard-rounded text-emerald-700 font-extrabold block leading-tight">
                    (0.0% CEPA vs 5% MFN)
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-white border border-orange-300 flex items-center justify-center text-[#FF5500] shrink-0 shadow-[2px_4px_10px_rgba(255,85,0,0.2)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── PLATFORM INTELLIGENCE SUITE (High Contrast Clay Grid) ──────────── */}
        <div
          id="settlement-vault"
          className="p-7 rounded-[30px] bg-white border border-slate-300 shadow-[12px_18px_36px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,1)] space-y-5 select-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 overflow-hidden">
            <h2 className="text-base font-extrabold text-[#0A0F1D] truncate">
              Platform Intelligence & Verification Suite
            </h2>
            <span className="text-[10px] font-mono text-[#FF5500] font-black shrink-0 whitespace-nowrap">6 CONNECTED SERVICES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="p-5 rounded-2xl bg-[#E8EDF5] border border-slate-300 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] hover:bg-white hover:shadow-[8px_12px_24px_rgba(0,0,0,0.06)] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-[#FF5500] shrink-0 shadow-[2px_4px_8px_rgba(0,0,0,0.05)]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-extrabold text-[#0A0F1D] leading-tight">{cap.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5500] border border-orange-300 shrink-0 whitespace-nowrap">
                      {cap.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-dashboard-rounded font-extrabold">
                    {cap.description}
                  </p>

                  <div className="text-[10px] font-mono font-black text-slate-500 pt-2 border-t border-slate-300/80">
                    {cap.statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;

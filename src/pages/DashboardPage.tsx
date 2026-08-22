import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import SpecularButton from "@/components/ui/SpecularButton";
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
      {/* ── Top Operational Context Bar & Dual View Mode Control ── */}
      <div
        id="command-center"
        className="p-4 sm:p-5 rounded-2xl bg-[#0C121D] border border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
      >
        {/* Context information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {user.companyName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              {user.roleTitle || "Admin"}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EVM Sepolia Synchronized
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
            Global Trade Command Center
          </h1>
        </div>

        {/* Compact Dual View Mode Selector */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#070A0E] border border-white/[0.08] shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("dual")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer",
              viewMode === "dual"
                ? "bg-white/[0.1] text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span>Dual View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("import")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer",
              viewMode === "import"
                ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-sky-300"
            )}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>↙ Import Duty</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("export")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer",
              viewMode === "export"
                ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-emerald-300"
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>↗ Export Duty</span>
          </button>
        </div>
      </div>

      {/* ── PERSISTENT DUAL VIEW OPERATIONAL COLUMNS ── */}
      <div
        id="active-contracts"
        className={cn(
          "grid gap-5 items-stretch transition-all duration-200",
          viewMode === "dual" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        )}
      >
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── COLUMN 1: IMPORT DUTY OPERATIONS ──────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {(viewMode === "dual" || viewMode === "import") && (
          <div
            id="import-operations"
            className="p-5 rounded-2xl bg-[#0C121D] border border-sky-500/20 flex flex-col justify-between space-y-5 select-none"
          >
            {/* Column Header */}
            <div className="space-y-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-300">
                    IMPORT DUTY OPERATIONS
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 border border-sky-800/60 font-bold">
                  INBOUND RADAR
                </span>
              </div>

              {/* ── Large Business Numbers ────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    Inbound Value
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    $8.4M
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    Total CIF Sourced
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    Active Imports
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-sky-300 tracking-tight">
                    14
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    Active Orders
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    CEPA Savings
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">
                    $412K
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400/80 block truncate">
                    0% Preferential
                  </span>
                </div>
              </div>
            </div>

            {/* ── Active Inbound Contracts with AnimatedList ── */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase px-1">
                <span className="font-semibold text-[11px]">ACTIVE INBOUND CONTRACTS</span>
                <span className="text-[10px] text-slate-500">3 Priority</span>
              </div>

              <AnimatedList
                items={importTrades}
                maxHeight="320px"
                listId="import-trades-list"
                onItemSelect={(trade) => navigate(trade.actionHref)}
                renderItem={(trade, _, { selected }) => (
                  <div
                    className={cn(
                      "p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-2.5",
                      selected
                        ? "bg-[#111A29] border-sky-500/40 text-white shadow-sm"
                        : "bg-[#070A0E] border-white/[0.06] hover:border-white/[0.14] text-slate-300 hover:bg-[#111A29]"
                    )}
                  >
                    {/* Line 1: Product / Trade Name, Route & Value */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h3 className="font-display font-bold text-xs sm:text-sm text-white truncate">
                          {trade.title}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {trade.route}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-mono font-bold text-white">
                          {trade.valueText}
                        </div>
                      </div>
                    </div>

                    {/* Line 2: Step N · Status (with Level B Popover) · Next Action */}
                    <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={trade.status} label={trade.stepText} size="sm" />
                        
                        {/* Level B Info Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                              aria-label="Trade details summary"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            align="start"
                            className="w-64 p-3 bg-[#0C121D] border border-white/[0.1] text-xs space-y-1.5 text-slate-300 shadow-xl rounded-xl"
                          >
                            <div className="font-display font-semibold text-white text-xs border-b border-white/[0.06] pb-1">
                              {trade.title}
                            </div>
                            <div className="text-[11px] font-mono space-y-1 text-slate-300">
                              <div>Trade ID: <span className="text-white">{trade.id}</span></div>
                              <div>Counterparty: <span className="text-sky-300">{trade.counterparty}</span></div>
                              <div>Escrow: <span className="text-emerald-400">{trade.paymentState}</span></div>
                              <div>Benefit: <span className="text-emerald-300">{trade.savings}</span></div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Link
                        to={trade.actionHref}
                        className="text-xs font-sans text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                      >
                        <span>{trade.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ── Single Primary CTA: SpecularButton ── */}
            <div className="pt-3 border-t border-white/[0.06]">
              <Link to="/trade-requests?duty=import" className="block">
                <SpecularButton
                  size="md"
                  radius={12}
                  tint="#0B1220"
                  tintOpacity={0.25}
                  blur={4}
                  textColor="#F5F7FA"
                  lineColor="#38BDF8"
                  baseColor="#0C1E32"
                  intensity={0.8}
                  shineSize={9}
                  shineFade={35}
                  thickness={1}
                  speed={0.25}
                  followMouse={true}
                  proximity={180}
                  autoAnimate={false}
                  className="w-full justify-center"
                  icon={<PlusCircle className="w-4 h-4" />}
                  iconPosition="left"
                >
                  New Import RFQ →
                </SpecularButton>
              </Link>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── COLUMN 2: EXPORT DUTY OPERATIONS ──────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {(viewMode === "dual" || viewMode === "export") && (
          <div
            id="export-operations"
            className="p-5 rounded-2xl bg-[#0C121D] border border-emerald-500/20 flex flex-col justify-between space-y-5 select-none"
          >
            {/* Column Header */}
            <div className="space-y-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
                    EXPORT DUTY OPERATIONS
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-bold">
                  OUTBOUND CATALOG
                </span>
              </div>

              {/* ── Large Business Numbers ────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    Outbound Value
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    $14.2M
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    Committed Contracts
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    Active Exports
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">
                    18
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    FOB Shipments
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-medium block">
                    Escrow Vault
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-sky-400 tracking-tight">
                    $5.85M
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    Multi-Sig Locked
                  </span>
                </div>
              </div>
            </div>

            {/* ── Active Outbound Contracts with AnimatedList ── */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase px-1">
                <span className="font-semibold text-[11px]">ACTIVE OUTBOUND CONTRACTS</span>
                <span className="text-[10px] text-slate-500">1 Flagged Ship</span>
              </div>

              <AnimatedList
                items={exportTrades}
                maxHeight="320px"
                listId="export-trades-list"
                onItemSelect={(trade) => navigate(trade.actionHref)}
                renderItem={(trade, _, { selected }) => (
                  <div
                    className={cn(
                      "p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-2.5",
                      trade.isFlagged
                        ? "bg-[#0E1724] border-emerald-500/40"
                        : selected
                        ? "bg-[#111A29] border-emerald-500/40 text-white shadow-sm"
                        : "bg-[#070A0E] border-white/[0.06] hover:border-white/[0.14] text-slate-300 hover:bg-[#111A29]"
                    )}
                  >
                    {/* Line 1: Product / Trade Name, Route & Value */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-xs sm:text-sm text-white truncate">
                            {trade.title}
                          </h3>
                          {trade.isFlagged && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {trade.route}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-mono font-bold text-white">
                          {trade.valueText}
                        </div>
                      </div>
                    </div>

                    {/* Line 2: Step N · Status (with Level B Popover) · Next Action */}
                    <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={trade.status} label={trade.stepText} size="sm" />

                        {/* Level B Info Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                              aria-label="Trade details summary"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            align="start"
                            className="w-64 p-3 bg-[#0C121D] border border-white/[0.1] text-xs space-y-1.5 text-slate-300 shadow-xl rounded-xl"
                          >
                            <div className="font-display font-semibold text-white text-xs border-b border-white/[0.06] pb-1">
                              {trade.title}
                            </div>
                            <div className="text-[11px] font-mono space-y-1 text-slate-300">
                              <div>Trade ID: <span className="text-white">{trade.id}</span></div>
                              <div>Buyer: <span className="text-emerald-300">{trade.counterparty}</span></div>
                              <div>Escrow: <span className="text-emerald-400">{trade.paymentState}</span></div>
                              <div>Compliance: <span className="text-emerald-300">{trade.savings}</span></div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Link
                        to={trade.actionHref}
                        className="text-xs font-sans text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <span>{trade.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ── Single Primary CTA: SpecularButton ── */}
            <div className="pt-3 border-t border-white/[0.06]">
              <Link to="/my-listings" className="block">
                <SpecularButton
                  size="md"
                  radius={12}
                  tint="#0B1220"
                  tintOpacity={0.25}
                  blur={4}
                  textColor="#F5F7FA"
                  lineColor="#10B981"
                  baseColor="#062E24"
                  intensity={0.8}
                  shineSize={9}
                  shineFade={35}
                  thickness={1}
                  speed={0.25}
                  followMouse={true}
                  proximity={180}
                  autoAnimate={false}
                  className="w-full justify-center"
                  icon={<PlusCircle className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Add Export Product →
                </SpecularButton>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ── TARIFF CALCULATOR ── */}
      <div
        id="tariff-intelligence"
        className="p-5 sm:p-6 rounded-2xl bg-[#0C121D] border border-white/[0.07] space-y-4 select-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
              <Percent className="w-3.5 h-3.5" />
              <span>CEPA Bilateral Tariff Engine</span>
            </div>
            <h2 className="text-base font-display font-bold text-white">
              Live Cross-Border Tariff Calculator
            </h2>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 cursor-help bg-[#070A0E] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rule of Origin: Min 40% Value-Add</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#111A29] border border-white/[0.1] text-xs text-slate-300 max-w-xs p-2.5">
                Under India-UAE CEPA schedules, products achieving minimum 40% domestic value addition qualify for 0.0% preferential import duties.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 3-Step Sequential Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Step 1: Commodity Selection */}
          <div className="p-3.5 rounded-xl bg-[#070A0E] border border-white/[0.06] space-y-1.5">
            <div className="text-[11px] font-sans text-slate-400 flex items-center justify-between">
              <span>1. Commodity Code</span>
              <span className="font-mono text-[10px] text-slate-500">HS Code</span>
            </div>
            <select
              value={selectedHsCode}
              onChange={(e) => setSelectedHsCode(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0C121D] border border-white/[0.08] text-xs text-white outline-none cursor-pointer font-sans"
            >
              <option value="1006.30">HS 1006.30 - Semi-milled Basmati Rice</option>
              <option value="0904.11">HS 0904.11 - Black Pepper (Tellicherry)</option>
              <option value="5205.12">HS 5205.12 - Combed Cotton Yarn</option>
              <option value="2836.91">HS 2836.91 - Lithium Carbonate Battery Grade</option>
            </select>
          </div>

          {/* Step 2: Shipment Value */}
          <div className="p-3.5 rounded-xl bg-[#070A0E] border border-white/[0.06] space-y-1.5">
            <div className="text-[11px] font-sans text-slate-400 flex items-center justify-between">
              <span>2. Shipment CIF Value</span>
              <span className="font-mono text-[10px] text-slate-500">USD</span>
            </div>
            <input
              type="number"
              value={tradeValueCalc}
              onChange={(e) => setTradeValueCalc(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-[#0C121D] border border-white/[0.08] text-xs text-white outline-none font-mono"
            />
          </div>

          {/* Step 3: Calculated Result */}
          <div className="p-3.5 rounded-xl bg-[#070A0E] border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] font-sans text-emerald-400 font-semibold">
                3. Calculated Net Savings
              </div>
              <div className="text-lg font-mono font-bold text-white">
                ${Math.round(tradeValueCalc * 0.05).toLocaleString()}{" "}
                <span className="text-xs font-sans text-emerald-400 font-normal">
                  (0.0% CEPA vs 5% MFN)
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SETTLEMENT & PLATFORM CAPABILITY MATRIX ───── */}
      <div
        id="settlement-vault"
        className="p-5 sm:p-6 rounded-2xl bg-[#0C121D] border border-white/[0.07] space-y-4 select-none"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-base font-display font-bold text-white">
            Platform Intelligence & Verification Suite
          </h2>
          <span className="text-xs font-mono text-slate-500">6 Connected Services</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="p-3.5 rounded-xl bg-[#070A0E] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111A29] border border-white/[0.06] flex items-center justify-center text-emerald-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-display font-bold text-white">{cap.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {cap.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {cap.description}
                </p>

                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                  {cap.statusText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;

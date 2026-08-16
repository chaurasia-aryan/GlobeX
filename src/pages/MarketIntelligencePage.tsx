import { useState, useMemo } from "react";
import { MARKET_OPPORTUNITY_COUNTRIES } from "@/data/mockTradeData";
import {
  TrendingUp,
  Sparkles,
  Globe2,
  Percent,
  ArrowRight,
  ShieldCheck,
  Building2,
  Home,
  CheckCircle2,
  Ship,
  Sparkle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TradeGlobe from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import NumberFlow from "@number-flow/react";
import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";

export const MarketIntelligencePage = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("United Arab Emirates");

  const aggregatedData = useMemo(() => aggregateByCountry(SAMPLE_DATA, null), []);

  const activeMarket = useMemo(() => {
    return (
      MARKET_OPPORTUNITY_COUNTRIES.find((c) => c.country === selectedCountry) ||
      MARKET_OPPORTUNITY_COUNTRIES[0]
    );
  }, [selectedCountry]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans select-none relative z-10">
      
      {/* ── Breadcrumb & Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/"
                    className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs text-[var(--text-primary)] font-medium">
                  Market Intelligence
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
                GLOBAL CORRIDOR OPTIMIZATION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-medium tracking-tight text-[var(--text-primary)]">
              <Balancer>Where should you trade next?</Balancer>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              <Balancer>AI-driven opportunity ranking evaluating bilateral import demand, preferential tariff schedules, and freight efficiency.</Balancer>
            </p>
          </div>
        </div>

        {/* Active Corridor Badge */}
        <div className="px-4 py-2.5 rounded-2xl bg-[var(--panel)] border border-[var(--hairline)] flex items-center gap-3 shadow-sm flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--emerald)] animate-pulse" />
          <div className="text-xs">
            <span className="text-[var(--text-tertiary)] font-mono text-[11px]">ACTIVE CORRIDOR: </span>
            <strong className="text-[var(--text-primary)] font-semibold">India ➔ {selectedCountry}</strong>
          </div>
        </div>
      </div>

      {/* ── 3D Globe Visualizer & Focused Deep-Dive Card ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Globe Visualizer */}
        <div className="lg:col-span-7 h-[420px] rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-2xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--panel-raised)]/90 backdrop-blur-md border border-[var(--hairline)] text-xs text-[var(--text-secondary)] font-mono">
            <Globe2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Interactive 3D Corridor Radar</span>
          </div>

          <div className="w-full h-full">
            <TradeGlobe
              aggregatedData={aggregatedData}
              selectedCountry={selectedCountry}
              onCountrySelect={(name) => setSelectedCountry(name)}
              showArcs={true}
              autoRotate={false}
            />
          </div>
        </div>

        {/* Focused Corridor Intelligence Card */}
        <motion.div
          key={activeMarket.country}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-5 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-2xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-5">
            {/* Header with Country and Score */}
            <div className="flex items-start justify-between border-b border-[var(--hairline)] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
                  {activeMarket.iso} CORRIDOR DOSSIER
                </span>
                <h3 className="text-2xl font-display font-medium text-[var(--text-primary)] mt-0.5">
                  {activeMarket.country}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-3xl font-display font-medium text-[var(--emerald)] font-tabular leading-none">
                  <NumberFlow value={activeMarket.opportunityScore} />
                  <span className="text-xs text-[var(--text-tertiary)] font-sans font-normal">/100</span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase mt-1">Opportunity Score</div>
              </div>
            </div>

            {/* Micro-metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Demand Growth</span>
                <div className="text-sm font-semibold text-[var(--emerald)] font-tabular">
                  {activeMarket.demandGrowth}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Preferential Duty</span>
                <div className="text-sm font-semibold text-[var(--accent)] font-mono">
                  {activeMarket.tariffRate}
                </div>
              </div>
            </div>

            {/* High Demand Commodities */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">High-Demand Commodities:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeMarket.topImportCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-sans px-2.5 py-1 rounded-lg bg-[var(--panel-raised)] border border-[var(--hairline)] text-[var(--text-primary)] font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/trade-analysis"
            className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>Simulate Trade in {activeMarket.country}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* ── Decluttered Corridor Selector Grid ─────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Select destination to inspect and rotate 3D radar:</span>
          <span className="font-mono text-[11px]">{MARKET_OPPORTUNITY_COUNTRIES.length} Monitored Trade Corridors</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MARKET_OPPORTUNITY_COUNTRIES.map((dest, idx) => {
            const isSelected = selectedCountry === dest.country;

            return (
              <button
                key={dest.country}
                type="button"
                onClick={() => setSelectedCountry(dest.country)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 group ${
                  isSelected
                    ? "bg-[var(--panel-raised)] border-[var(--accent)] shadow-lg shadow-cyan-950/20 ring-1 ring-[var(--accent)]"
                    : "bg-[var(--panel)] border-[var(--hairline)] hover:border-[var(--hairline-strong)] hover:bg-[var(--panel-raised)]"
                }`}
              >
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] font-bold">
                      0{idx + 1} • {dest.iso}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--emerald)]">
                      {dest.opportunityScore}%
                    </span>
                  </div>
                  <h4 className="font-medium text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {dest.country}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                  <span className="text-[var(--emerald)]">{dest.demandGrowth}</span>
                  <span className="text-[var(--text-tertiary)]">{dest.tariffRate.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligencePage;

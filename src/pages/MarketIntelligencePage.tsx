import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MARKET_OPPORTUNITY_COUNTRIES } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Section } from "@/components/common/Section";
import SpecularButton from "@/components/ui/SpecularButton";
import TradeGlobe from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const MarketIntelligencePage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("United Arab Emirates");
  const aggregatedData = useMemo(() => aggregateByCountry(SAMPLE_DATA, null), []);

  const activeMarket = useMemo(() => {
    return (
      MARKET_OPPORTUNITY_COUNTRIES.find((c) => c.country === selectedCountry) ||
      MARKET_OPPORTUNITY_COUNTRIES[0]
    );
  }, [selectedCountry]);

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-5 select-none">
        
        {/* Page Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Market Intelligence" },
          ]}
          title="Market Opportunity Radar"
          subtitle="AI-driven trade opportunity rankings evaluating bilateral import demand, preferential tariff schedules, and freight efficiency."
          badge={<StatusBadge status="verified" label={`Active: India ➔ ${selectedCountry}`} size="md" />}
          action={
            <Link to="/trade-analysis">
              <PrimaryAction size="sm">
                Simulate Trade in {activeMarket.country} →
              </PrimaryAction>
            </Link>
          }
        />

        {/* 3D Globe + Corridor Spec Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Globe Container */}
          <div className="lg:col-span-7 h-[380px] rounded-2xl border border-white/[0.07] bg-[#0C121D] relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-slate-400">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
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

          {/* Focused Corridor Card */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-white/[0.07] bg-[#0C121D] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                    {activeMarket.iso} CORRIDOR
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-0.5">
                    {activeMarket.country}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {activeMarket.opportunityScore}/100
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">Opportunity Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#070A0E] border border-white/[0.05]">
                  <span className="text-[10px] text-slate-500 uppercase block">Demand Growth</span>
                  <span className="text-emerald-400 font-bold">{activeMarket.demandGrowth}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A0E] border border-white/[0.05]">
                  <span className="text-[10px] text-slate-500 uppercase block">Preferential Duty</span>
                  <span className="text-sky-400 font-bold">{activeMarket.tariffRate}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">High-Demand Commodities</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMarket.topImportCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-md bg-[#070A0E] border border-white/[0.06] text-xs font-sans text-slate-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/trade-analysis" className="block w-full">
              <SpecularButton size="sm" radius={10} className="w-full justify-center">
                Simulate Trade in {activeMarket.country} →
              </SpecularButton>
            </Link>
          </div>

        </div>

        {/* Monitored Trade Corridors Grid */}
        <Section title="Monitored Trade Corridors">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MARKET_OPPORTUNITY_COUNTRIES.map((dest, idx) => {
              const isSelected = selectedCountry === dest.country;
              return (
                <button
                  key={dest.country}
                  type="button"
                  onClick={() => setSelectedCountry(dest.country)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer",
                    isSelected
                      ? "bg-white/[0.08] border-sky-400"
                      : "bg-[#0C121D] border-white/[0.06] hover:border-white/[0.14]"
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>0{idx + 1}</span>
                      <span className="text-emerald-400 font-bold">{dest.opportunityScore}%</span>
                    </div>
                    <div className="text-xs font-display font-semibold text-white truncate">
                      {dest.country}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400">
                    Tariff: <strong className="text-sky-400">{dest.tariffRate}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

      </div>
    </AppShell>
  );
};

export default MarketIntelligencePage;

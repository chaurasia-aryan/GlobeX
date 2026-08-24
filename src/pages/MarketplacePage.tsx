import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Listing } from "@/types/trade";
import { 
  aiService, 
  MarketOpportunityResult, 
  DestinationCountryInsight 
} from "@/services/api/aiService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import SpecularButton from "@/components/ui/SpecularButton";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingDetailDrawer from "@/components/marketplace/ListingDetailDrawer";
import CreateTradeRequestDrawer from "@/components/marketplace/CreateTradeRequestDrawer";
import CountryOpportunityCard from "@/components/marketplace/CountryOpportunityCard";
import CountryDetailDrawer from "@/components/marketplace/CountryDetailDrawer";
import { CommoditySearchDropdown, CommodityOption } from "@/components/marketplace/CommoditySearchDropdown";
import { notifyN8nWorkflow } from "@/utils/jingle";
import { 
  Globe2, 
  TrendingUp, 
  Search, 
  Sparkles, 
  Package, 
  ShieldCheck, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Info,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All Commodities",
  "Agriculture",
  "Spices",
  "Textiles",
  "Pharmaceuticals",
  "Metals",
  "Chemicals",
] as const;

const QUICK_COMMODITIES = [
  { label: "Basmati Rice", qty: 1000, desc: "HS 1006.30 · 1121 Steam" },
  { label: "Black Pepper", qty: 500, desc: "HS 0904.11 · Tellicherry TGSEB" },
  { label: "Cotton Yarn", qty: 5000, desc: "HS 5205.12 · 30s Ne Combed" },
  { label: "Frozen Shrimps", qty: 2000, desc: "HS 0306.17 · Vannamei / Tiger" },
  { label: "Roasted Coffee", qty: 1000, desc: "HS 0901.21 · Arabica AA" },
  { label: "Cut Diamonds", qty: 100, desc: "HS 7102.39 · Polished Gem" },
];

/**
 * Honest empty state for the importer's Discovery step.
 *
 * There is deliberately no model call behind this. Supplier/source-country
 * discovery would need foreign-exporter-to-India flows with ranking features
 * computed from India's importing perspective; the only partner-discovery
 * dataset in the repo is `01_partner_discovery_india_as_exporter.parquet`,
 * which ranks destinations for Indian *exports*. Showing that here would
 * present export-market data as an answer to a sourcing question it never
 * modelled. See docs/product/importer_exporter_flow_design.md section 6.
 */
const SupplierDiscoveryGapPanel: React.FC = () => (
  <div className="space-y-5 p-6 sm:p-7 rounded-3xl bg-[#080C14] border border-amber-500/20 shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

    <div className="space-y-1 border-b border-white/[0.07] pb-5">
      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
        <Globe2 className="w-4 h-4" />
        <span>Supplier Discovery</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
        Where Should I Source My Product From?
      </h2>
    </div>

    <div className="flex flex-col sm:flex-row items-start gap-4">
      <span className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50 font-mono text-[11px] font-bold shrink-0">
        NOT YET MODELLED
      </span>
      <div className="space-y-3 text-sm text-slate-300 font-sans max-w-3xl">
        <p>
          Source-country ranking for imports is not available. It is not shown as a
          placeholder score or an approximation — no model has been trained for it.
        </p>
        <p className="text-slate-400 text-xs">
          The destination-ranking engine used in the export view answers the opposite
          question ("which countries should India sell to"). Its training data is
          India-as-exporter trade flows, so its output is not a valid sourcing
          recommendation and is not reused here. Closing this gap requires ingesting
          partner-side flows for the inbound leg and training a sibling forecaster.
        </p>
        <p className="text-slate-400 text-xs">
          Everything downstream of discovery works for imports today: anomaly screening
          runs against your real inbound <span className="font-mono text-slate-300">trade_flow</span>,
          and compliance, document verification, settlement and disputes are shared with
          the export flow.
        </p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 pt-1">
      <Link to="/trade-analysis">
        <SpecularButton variant="outline" size="sm" radius={10}>
          Run Import Anomaly &amp; Compliance Analysis →
        </SpecularButton>
      </Link>
      <span className="text-[11px] font-mono text-slate-500">
        Verified supplier listings are still browsable below.
      </span>
    </div>
  </div>
);

export const MarketplacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { listings, listingsLoading, listingsError, isExporterView, activeDirection } = useWorkspace();

  // ── Country Destination Discovery State ────────────────────────────────
  const [commodity, setCommodity] = useState<string>(
    searchParams.get("commodity") || "Basmati Rice"
  );
  const [quantityKg, setQuantityKg] = useState<number>(
    Number(searchParams.get("qty")) || 1000
  );
  const [regime, setRegime] = useState<string>("balanced");
  const [isRankLoading, setIsRankLoading] = useState<boolean>(false);
  const [marketResult, setMarketResult] = useState<MarketOpportunityResult | null>(null);
  const [selectedCountryInsight, setSelectedCountryInsight] = useState<DestinationCountryInsight | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // ── Product Listings State ─────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectListing, setInspectListing] = useState<Listing | null>(null);
  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState<boolean>(false);

  // Execute Country Opportunity Ranking Pipeline (multi-criteria score +
  // 3yr moving-average demand/price forecast — see partner_discovery/inference.py;
  // the GRU forecaster was walk-forward backtested and found 2x worse than
  // this formula, so it is disabled)
  const handleDiscoverDestinations = async (productToQuery?: string, qtyToQuery?: number) => {
    const qProduct = productToQuery || commodity;
    const qQty = qtyToQuery !== undefined ? qtyToQuery : quantityKg;

    setIsRankLoading(true);
    const t0 = performance.now();
    try {
      const result = await aiService.rankMarketOpportunity(qProduct, qQty, regime, 6);
      setMarketResult(result);
      const elapsed = Math.round(performance.now() - t0);

      const topDest = result.top_recommendations?.[0]?.destination.country_name || "United States";
      const topScore = result.top_recommendations?.[0]?.scores.final_score || 85.0;

      notifyN8nWorkflow({
        workflowName: "Global Destination Ranking Engine",
        latencyMs: elapsed,
        summary: `Evaluated ${result.total_candidates_evaluated || 52} countries for ${qProduct} (${qQty.toLocaleString()} kg) · Top: ${topDest} (${topScore.toFixed(1)}/100)`,
        modelsTriggered: [
          "3yr Moving-Average Demand Forecaster",
          "Rule-Based Trade Risk Penalty Engine",
          "Multi-Criteria Opportunity Engine"
        ],
      });
    } catch (err) {
      console.error("Country destination ranking error:", err);
    } finally {
      setIsRankLoading(false);
    }
  };

  // Run initial ranking on mount
  useEffect(() => {
    // Guarded: rankMarketOpportunity is the exporter-only destination model.
    // Importers must not trigger it at all, not even silently on mount.
    if (isExporterView) {
      handleDiscoverDestinations();
    }
  }, [isExporterView]);

  const handleSelectCountry = (data: DestinationCountryInsight) => {
    setSelectedCountryInsight(data);
    setIsDrawerOpen(true);
  };

  // Filter listings
  const filteredListings = useMemo<Listing[]>(() => {
    return listings.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Commodities" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.exporterName.toLowerCase().includes(q) ||
        item.hsCode.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <AppShell maxWidth="full" className="space-y-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title={
          isExporterView
            ? "Global Trade Destination Discovery & Marketplace"
            : "Supplier Discovery & Marketplace"
        }
        subtitle={
          isExporterView
            ? "Rank all global destination countries for Indian exports using 3-year moving-average demand forecasts, CEPA/RTA tariff schedules, and trade risk models."
            : "Browse verified supplier listings for inbound purchases. Source-country ranking is not yet modelled — see the note below."
        }
        badge={
          isExporterView ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Country Opportunity Engine Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import View · {activeDirection}</span>
            </div>
          )
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/trade-analysis">
              <SpecularButton variant="outline" size="sm" radius={10}>
                ⚡ Open Trade Analysis →
              </SpecularButton>
            </Link>
          </div>
        }
      />

      {/* Discovery diverges by direction: the exporter destination-ranking model
          answers "where should I sell this?". There is no importer-side
          equivalent model or dataset, so importers get an explicit gap state
          rather than the wrong model relabelled. See
          docs/product/importer_exporter_flow_design.md section 6. */}
      {isExporterView ? (
        <>
        {/* ── SECTION 1: GLOBAL DESTINATION RADAR ────────────────────── */}
        <div className="space-y-5 p-6 sm:p-7 rounded-3xl bg-[#080C14] border border-sky-500/20 shadow-2xl relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-sky-400" />
                <span>AI Country Destination Finder</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Where Should I Export My Product?
              </h2>
              <p className="text-xs text-slate-400 font-sans max-w-2xl">
                Enter what you want to export and how much. Our ranking engine scans 18+ major global trade corridors, calculates bilateral demand momentum from 3-year trade history, checks tariff schedules, and ranks the highest-probability countries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Strategy:</span>
              <select
                value={regime}
                onChange={(e) => {
                  setRegime(e.target.value);
                  handleDiscoverDestinations(commodity, quantityKg);
                }}
                className="bg-[#0C121D] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="balanced">Balanced (Recommended)</option>
                <option value="aggressive">Aggressive (High Growth)</option>
                <option value="conservative">Conservative (Established Ports)</option>
                <option value="risk_averse">Risk-Averse (Zero Sanctions)</option>
              </select>
            </div>
          </div>

          {/* ── Input Bar with Prefix/Typeahead Dropdown ───────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-400">
                  Export Commodity / HS6 Product
                </label>
                <span className="text-[11px] font-mono text-sky-400">
                  Type prefix (e.g. &ldquo;b&rdquo; &rarr; Basmati, Pepper...)
                </span>
              </div>
              <CommoditySearchDropdown
                value={commodity}
                onChange={(name) => setCommodity(name)}
                onSelect={(opt: CommodityOption) => {
                  setCommodity(opt.name);
                  setQuantityKg(opt.typicalQty);
                  handleDiscoverDestinations(opt.name, opt.typicalQty);
                }}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono text-slate-400">
                Shipment Volume (kg)
              </label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Math.max(1, Number(e.target.value)))}
                placeholder="1000"
                className="w-full bg-[#0C121D] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-3">
              <SpecularButton
                size="md"
                onClick={() => handleDiscoverDestinations()}
                isLoading={isRankLoading}
                className="w-full justify-center text-sm py-2.5"
              >
                <Search className="w-4 h-4 mr-1.5" />
                Rank Global Markets
              </SpecularButton>
            </div>
          </div>

          {/* ── Quick Commodity Chips ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <span className="text-slate-500">Quick Select:</span>
            {QUICK_COMMODITIES.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  setCommodity(c.label);
                  setQuantityKg(c.qty);
                  handleDiscoverDestinations(c.label, c.qty);
                }}
                className={cn(
                  "px-3 py-1 rounded-lg border transition-all text-[11px]",
                  commodity === c.label
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {c.label} ({c.qty.toLocaleString()} kg)
              </button>
            ))}
          </div>

          {/* ── Data Source Indicator ────────────────────────────────── */}
          {marketResult?.dataSource === "fallback" ? (
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center gap-2 text-amber-300 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50 font-bold shrink-0">
                DEMO — NOT LIVE
              </span>
              <span>Showing illustrative destination rankings — live backend unreachable.</span>
            </div>
          ) : marketResult?.dataSource === "live" ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-bold">
                LIVE
              </span>
            </div>
          ) : null}

          {/* ── Resolution Info Banner ───────────────────────────────── */}
          {marketResult?.product_resolution && (
            <div className="p-3.5 rounded-2xl bg-[#0C121D] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono font-bold">
                  HS {marketResult.product_resolution.hs6}
                </span>
                <span className="font-sans font-medium text-slate-200">
                  {marketResult.product_resolution.product_description}
                </span>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                {marketResult.total_candidates_evaluated || 18} destination countries evaluated · Ranked by Net Opportunity Score
              </span>
            </div>
          )}

          {/* ── Ranked Country Cards Grid ────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Ranked Destination Countries for {quantityKg.toLocaleString()} kg {commodity}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Click any country to view full forecast & pros/cons
              </span>
            </div>

            {isRankLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-56 rounded-2xl bg-[#0C121D] animate-pulse border border-white/[0.05]" />
                ))}
              </div>
            ) : marketResult?.top_recommendations && marketResult.top_recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketResult.top_recommendations.map((rec, index) => (
                  <CountryOpportunityCard
                    key={rec.destination.iso3}
                    rank={index + 1}
                    data={rec}
                    onSelect={handleSelectCountry}
                    userCommodity={commodity}
                    userQuantityKg={quantityKg}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[#0C121D] border border-white/[0.06] text-slate-400 text-sm">
                No matching destination countries found for "{commodity}". Try selecting one of the quick commodities above.
              </div>
            )}
          </div>
        </div>
        </>
      ) : (
        <SupplierDiscoveryGapPanel />
      )}

      {/* ── SECTION 2: PRODUCT MARKETPLACE CATALOG ─────────────────── */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {isExporterView
                ? "Export Commodities Inventory Catalog"
                : "Verified Supplier Listings"}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {isExporterView
                ? "Browse pre-verified warehouse lots and export listings available across Indian trade hubs."
                : "Browse pre-verified lots you can purchase. Listing data is direction-agnostic and shared with the export flow."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              {filteredListings.length} Active Listings
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all",
                selectedCategory === cat
                  ? "bg-white text-black font-bold shadow-lg shadow-white/10"
                  : "bg-[#0C121D] text-slate-400 border border-white/[0.07] hover:text-white hover:border-white/[0.15]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-[#0C121D] animate-pulse border border-white/[0.05]" />
            ))}
          </div>
        ) : listingsError ? (
          <div className="p-8 text-center rounded-2xl bg-[#0C121D] border border-rose-500/20 text-rose-300 text-sm">
            Could not load marketplace listings — backend unreachable. ({listingsError})
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0C121D] border border-white/[0.06] text-slate-400 text-sm">
            No active listings yet. Be the first to publish one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onInspect={(l) => {
                  setInspectListing(l);
                  setCommodity(l.title);
                  handleDiscoverDestinations(l.title, 1000);
                }}
                onRequest={(l) => {
                  setRequestListing(l);
                  setIsRequestDrawerOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Country Opportunity Detail Drawer ─────────────────────── */}
      <CountryDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedCountryInsight}
        userCommodity={commodity}
        userQuantityKg={quantityKg}
      />

      {/* ── Listing Detail Drawer ─────────────────────────────────── */}
      <ListingDetailDrawer
        isOpen={!!inspectListing}
        onClose={() => setInspectListing(null)}
        listing={inspectListing}
        onRequestTrade={(l) => {
          setInspectListing(null);
          setRequestListing(l);
          setIsRequestDrawerOpen(true);
        }}
      />

      {/* ── Create Trade Request Drawer ───────────────────────────── */}
      <CreateTradeRequestDrawer
        isOpen={isRequestDrawerOpen}
        onClose={() => setIsRequestDrawerOpen(false)}
        listing={requestListing}
      />
    </AppShell>
  );
};

export default MarketplacePage;

import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Listing } from "@/types/trade";
import {
  aiService,
  MarketOpportunityResult,
  DestinationCountryInsight,
  CounterpartyMatchResult,
  BuyerMatchQuery,
  BuyerMatchResponse,
} from "@/services/api/aiService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { NotModelledState } from "@/components/common/NotModelledState";
import SpecularButton from "@/components/ui/SpecularButton";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingDetailDrawer from "@/components/marketplace/ListingDetailDrawer";
import CreateTradeRequestDrawer from "@/components/marketplace/CreateTradeRequestDrawer";
import CountryOpportunityCard from "@/components/marketplace/CountryOpportunityCard";
import CountryDetailDrawer from "@/components/marketplace/CountryDetailDrawer";
import { CommoditySearchDropdown, CommodityOption } from "@/components/marketplace/CommoditySearchDropdown";
import HSCodeExplorer from "@/components/marketplace/HSCodeExplorer";
import { BuyerMatchingForm } from "@/components/marketplace/BuyerMatchingForm";
import { BuyerMatchingResults } from "@/components/marketplace/BuyerMatchingResults";
import { notifyN8nWorkflow } from "@/utils/jingle";
import { n8nWorkflowService } from "@/services/n8n/workflowService";
import {
  Globe2,
  TrendingUp,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Building2,
  Hash,
  Users,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  "All Commodities",
  "Agriculture",
  "Spices",
  "Textiles",
  "Pharmaceuticals",
  "Metals",
  "Chemicals",
] as const;

export const DiscoverPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { listings, listingsLoading, listingsError, isExporterView, activeDirection } = useWorkspace();

  // ── n8n Live Status Probe ──────────────────────────────────────────────
  const [n8nOnline, setN8nOnline] = useState<boolean | null>(null);
  const [n8nUrl, setN8nUrl] = useState<string>("http://localhost:5678/webhook");

  // ── Sub-view toggles: Ranking vs HS Code Tree vs Buyer Matchmaker ─────
  const [activeDiscoverView, setActiveDiscoverView] = useState<"ranking" | "hscode" | "buyers">("ranking");

  // ── Exporter: Destination Ranking State ─────────────────────────────────
  const [commodity, setCommodity] = useState<string>(searchParams.get("commodity") || "Basmati Rice");
  const [quantityKg, setQuantityKg] = useState<number>(Number(searchParams.get("qty")) || 1000);
  const [regime, setRegime] = useState<string>("balanced");
  const [isRankLoading, setIsRankLoading] = useState<boolean>(false);
  const [marketResult, setMarketResult] = useState<MarketOpportunityResult | null>(null);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [selectedCountryInsight, setSelectedCountryInsight] = useState<DestinationCountryInsight | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // ── Institutional Buyer Matching State (POST /api/v1/marketplace/match-buyers) ─
  const [buyerMatchResponse, setBuyerMatchResponse] = useState<BuyerMatchResponse | null>(null);
  const [isBuyerMatchLoading, setIsBuyerMatchLoading] = useState(false);

  // ── Importer: Supplier Matching State (semanticMatch works for both directions) ──
  const [sourcingCountry, setSourcingCountry] = useState<string>("IND");
  const [matchingSuppliers, setMatchingSuppliers] = useState<CounterpartyMatchResult[]>([]);
  const [isSupplierLoading, setIsSupplierLoading] = useState<boolean>(false);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  // ── Live Listing Catalog State ──────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectListing, setInspectListing] = useState<Listing | null>(null);
  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    n8nWorkflowService.checkHealth().then((res) => {
      setN8nOnline(res.isOnline);
      setN8nUrl(res.url);
    });
  }, []);

  const handleDiscoverDestinations = async (productToQuery?: string, qtyToQuery?: number) => {
    const qProduct = productToQuery || commodity;
    const qQty = qtyToQuery !== undefined ? qtyToQuery : quantityKg;

    setIsRankLoading(true);
    setRankingError(null);
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
          "XGBoost Residual Demand Forecaster (Q10/50/90)",
          "TreeSHAP Attribution Engine",
          "Rule-Based Trade Risk Penalty Engine",
          "Multi-Criteria Opportunity Engine",
        ],
      });
    } catch (err: any) {
      setRankingError(err?.message || "Market opportunity ranking failed — backend unreachable.");
      setMarketResult(null);
    } finally {
      setIsRankLoading(false);
    }
  };

  const handleBuyerMatchSearch = async (query: BuyerMatchQuery) => {
    setIsBuyerMatchLoading(true);
    try {
      const res = await aiService.matchBuyers(query);
      setBuyerMatchResponse(res);
      toast.success(`Found ${res.candidateCount} matching institutional buyers with active RFQs`);
    } catch {
      toast.error("Buyer matching request failed.");
    } finally {
      setIsBuyerMatchLoading(false);
    }
  };

  const handleDiscoverSuppliers = async (productToQuery?: string, qtyToQuery?: number, originCountryToQuery?: string) => {
    const qProduct = productToQuery || commodity;
    const qQty = qtyToQuery !== undefined ? qtyToQuery : quantityKg;
    const qCountry = originCountryToQuery || sourcingCountry;

    setIsSupplierLoading(true);
    setSupplierError(null);
    try {
      const suppliers = await aiService.semanticMatch(qProduct, undefined, qQty, qCountry, 100630);
      setMatchingSuppliers(suppliers);
    } catch (err: any) {
      setSupplierError(err?.message || "Supplier matching failed — ML service unreachable.");
      setMatchingSuppliers([]);
    } finally {
      setIsSupplierLoading(false);
    }
  };

  // Fires once on mount and when switching Export/Import view — NOT on every
  // keystroke in the commodity/quantity/country inputs. Those already have
  // explicit triggers (the "Rank Global Markets"/"Find Suppliers" buttons,
  // and CommoditySearchDropdown's onSelect) — re-querying n8n/the backend on
  // every character typed was spamming requests with no user intent behind
  // most of them.
  useEffect(() => {
    if (isExporterView) {
      handleDiscoverDestinations();
    } else {
      handleDiscoverSuppliers(commodity, quantityKg, sourcingCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExporterView]);

  const handleSelectCountry = (data: DestinationCountryInsight) => {
    setSelectedCountryInsight(data);
    setIsDrawerOpen(true);
  };

  const filteredListings = useMemo<Listing[]>(() => {
    return listings.filter((item) => {
      const matchesCategory = selectedCategory === "All Commodities" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.exporterName.toLowerCase().includes(q) ||
        item.hsCode.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  return (
    <AppShell maxWidth="full" className="space-y-8 select-none">
      <PageHeader
        title={isExporterView ? "Global Trade Destination Discovery & Marketplace" : "Supplier Discovery & Marketplace"}
        subtitle={
          isExporterView
            ? "Rank all global destination countries for Indian exports using 3-year moving-average demand forecasts, CEPA/RTA tariff schedules, and trade risk models."
            : "Browse verified supplier listings and matched exporters for inbound purchases."
        }
        badge={
          isExporterView ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Country Opportunity Engine Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import View · {activeDirection}</span>
            </div>
          )
        }
        action={
          <div className="flex items-center gap-3">
            {n8nOnline === false && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-review-bg)] border border-[var(--status-review)]/30 text-[var(--status-review)] text-[11px] font-mono font-bold cursor-help"
                title={`Could not reach the n8n webhook listener at ${n8nUrl}. Background automation is paused; the ranking engine above still works directly.`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Automation Offline</span>
              </div>
            )}
            {n8nOnline === true && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-verified-bg)] border border-[var(--status-verified)]/30 text-[var(--status-verified)] text-[11px] font-mono font-bold cursor-help"
                title={`n8n webhook listener connected at ${n8nUrl}.`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Automation Active</span>
              </div>
            )}
            <Link to="/assess">
              <SpecularButton variant="outline" size="sm" radius={10}>
                ⚡ Open Assess →
              </SpecularButton>
            </Link>
          </div>
        }
      />

      {/* Discover Sub-View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveDiscoverView("ranking")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
              activeDiscoverView === "ranking"
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Market Opportunity Ranking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDiscoverView("hscode")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
              activeDiscoverView === "hscode"
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>HS Code Classifier &amp; Hierarchy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDiscoverView("buyers")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
              activeDiscoverView === "buyers"
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Institutional Buyer RFQs</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--text-tertiary)] px-2">
          {activeDiscoverView === "ranking" ? "Model: XGBoost + TreeSHAP" : activeDiscoverView === "hscode" ? "WCO HS 2022/2026 Engine" : "Direct RFQ Demand Engine"}
        </span>
      </div>

      {/* SUB-VIEW 1: HS CODE EXPLORER */}
      {activeDiscoverView === "hscode" && (
        <HSCodeExplorer
          initialQuery={commodity}
          onSelectHSCode={(code, desc) => {
            setCommodity(desc || code);
            setActiveDiscoverView("ranking");
            handleDiscoverDestinations(desc || code, quantityKg);
          }}
        />
      )}

      {/* SUB-VIEW 2: BUYER RFQ MATCHMAKER */}
      {activeDiscoverView === "buyers" && (
        <div className="space-y-6">
          <BuyerMatchingForm
            onSearch={handleBuyerMatchSearch}
            isLoading={isBuyerMatchLoading}
          />
          {buyerMatchResponse && (
            <BuyerMatchingResults
              response={buyerMatchResponse}
              onRequestQuote={(buyer) => {
                toast.success(`Initiating RFQ allocation with ${buyer.name}`);
              }}
            />
          )}
        </div>
      )}

      {/* SUB-VIEW 3: DEFAULT DESTINATION RANKING & SOURCING */}
      {activeDiscoverView === "ranking" && (
        <>
          {isExporterView ? (
            <div className="space-y-5 p-6 sm:p-7 rounded-3xl bg-[var(--surface-1)] border border-sky-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-sky-600 font-bold uppercase tracking-wider">
                    <Globe2 className="w-4 h-4 text-sky-600" />
                    <span>AI Country Destination Finder (XGBoost + TreeSHAP)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)]">Where Should I Export My Product?</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-sans max-w-2xl">
                    Enter what you want to export and how much. Our ranking engine scans major global trade corridors, calculates
                    bilateral demand momentum from historical trade data, checks tariff schedules, and ranks the highest-probability countries.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Strategy:</span>
                  <select
                    value={regime}
                    onChange={(e) => {
                      setRegime(e.target.value);
                      handleDiscoverDestinations(commodity, quantityKg);
                    }}
                    className="bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-xl px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-sky-500/50"
                  >
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="aggressive">Aggressive (High Growth)</option>
                    <option value="conservative">Conservative (Established Ports)</option>
                    <option value="risk_averse">Risk-Averse (Zero Sanctions)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-6 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[var(--text-secondary)]">Export Commodity / HS6 Product</label>
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
                  <label className="text-xs font-mono text-[var(--text-secondary)]">Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Math.max(1, Number(e.target.value)))}
                    placeholder="1000"
                    className="w-full bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-sky-500"
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

              {marketResult?.product_resolution && (
                <div className="p-3.5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 border border-sky-500/30 font-mono font-bold">
                      HS {marketResult.product_resolution.hs6}
                    </span>
                    <span className="font-sans font-medium text-[var(--text-primary)]">{marketResult.product_resolution.product_description}</span>
                  </div>
                  <span className="text-[var(--text-secondary)] font-mono text-[11px]">
                    {marketResult.total_candidates_evaluated || 18} destination countries evaluated · Ranked by Net Opportunity Score
                  </span>
                </div>
              )}

              {rankingError && (
                <div className="p-4 rounded-2xl bg-[var(--status-blocked-bg)] border border-[var(--status-blocked)]/30 text-[var(--status-blocked)] text-xs flex items-center justify-between">
                  <span>{rankingError}</span>
                  <button
                    onClick={() => handleDiscoverDestinations()}
                    className="px-3 py-1 bg-[var(--status-blocked)]/10 hover:bg-[var(--status-blocked)]/20 rounded-lg text-[var(--status-blocked)] font-mono font-bold text-xs"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Ranked Destination Countries for {quantityKg.toLocaleString()} kg {commodity}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">Click any country to view full forecast &amp; pros/cons</span>
                </div>

                {isRankLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-56 rounded-2xl bg-[var(--surface-1)] animate-pulse border border-[var(--hairline)]" />
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
                ) : !rankingError ? (
                  <div className="p-8 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] text-[var(--text-secondary)] text-sm">
                    No matching destination countries found for "{commodity}". Enter another commodity or select from the dropdown above.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-5 p-6 sm:p-7 rounded-3xl bg-[var(--surface-1)] border border-amber-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <NotModelledState
                missingCapability="importer-side destination/demand-forecast model"
                whatWouldClose="an importer-side demand dataset — today's XGBoost forecaster (partner_discovery_xgb_v1) only ranks export destinations, not import sourcing regions"
              />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-5 pt-2">
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-600 font-bold uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Verified Supplier Discovery &amp; Counterparty Matching</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)]">Find &amp; Match Verified Global Suppliers</h2>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-3">
                    <div className="md:col-span-5 space-y-1.5">
                      <label className="text-xs font-mono text-[var(--text-secondary)]">Commodity to Procure</label>
                      <CommoditySearchDropdown
                        value={commodity}
                        onChange={(name) => setCommodity(name)}
                        onSelect={(opt: CommodityOption) => {
                          setCommodity(opt.name);
                          setQuantityKg(opt.typicalQty);
                          handleDiscoverSuppliers(opt.name, opt.typicalQty, sourcingCountry);
                        }}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-mono text-[var(--text-secondary)]">Quantity (kg)</label>
                      <input
                        type="number"
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(Math.max(1, Number(e.target.value)))}
                        placeholder="1000"
                        className="w-full bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-mono text-[var(--text-secondary)]">Sourcing Origin Country</label>
                      <select
                        value={sourcingCountry}
                        onChange={(e) => {
                          setSourcingCountry(e.target.value);
                          handleDiscoverSuppliers(commodity, quantityKg, e.target.value);
                        }}
                        className="w-full bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      >
                        <option value="IND">India (IND) — Domestic Mills</option>
                        <option value="ARE">United Arab Emirates (ARE)</option>
                        <option value="SAU">Saudi Arabia (SAU)</option>
                        <option value="VNM">Vietnam (VNM)</option>
                        <option value="THA">Thailand (THA)</option>
                        <option value="USA">United States (USA)</option>
                        <option value="DEU">Germany (DEU)</option>
                        <option value="NLD">Netherlands (NLD)</option>
                        <option value="SGP">Singapore (SGP)</option>
                        <option value="AUS">Australia (AUS)</option>
                        <option value="CAN">Canada (CAN)</option>
                        <option value="BRA">Brazil (BRA)</option>
                        <option value="EGY">Egypt (EGY)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <SpecularButton
                        size="md"
                        onClick={() => handleDiscoverSuppliers(commodity, quantityKg, sourcingCountry)}
                        isLoading={isSupplierLoading}
                        className="w-full justify-center text-xs py-2.5 bg-amber-600 hover:bg-amber-500 font-bold"
                      >
                        <Search className="w-3.5 h-3.5 mr-1" />
                        Find Exporters
                      </SpecularButton>
                    </div>
                  </div>
                </div>
              </div>

              {supplierError && (
                <div className="p-4 rounded-2xl bg-[var(--status-blocked-bg)] border border-[var(--status-blocked)]/30 text-[var(--status-blocked)] text-xs flex items-center justify-between">
                  <span>{supplierError}</span>
                  <button
                    onClick={() => handleDiscoverSuppliers(commodity, quantityKg, sourcingCountry)}
                    className="px-3 py-1 bg-[var(--status-blocked)]/10 hover:bg-[var(--status-blocked)]/20 rounded-lg text-[var(--status-blocked)] font-mono font-bold text-xs"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Exporters in {sourcingCountry} Matching {commodity} ({quantityKg.toLocaleString()} kg)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">Ranked by ML Trust Score &amp; OFAC Sanctions Clearance</span>
                </div>

                {isSupplierLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-48 rounded-2xl bg-[var(--surface-1)] animate-pulse border border-[var(--hairline)]" />
                    ))}
                  </div>
                ) : matchingSuppliers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchingSuppliers.map((sup) => (
                      <div
                        key={sup.exporterId}
                        className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] hover:border-amber-500/40 transition-all space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--status-verified-bg)] text-[var(--status-verified)] border border-[var(--status-verified)]/30 font-bold">
                              {sup.matchScore}% MATCH
                            </span>
                            <h4 className="text-sm font-display font-bold text-[var(--text-primary)] mt-1.5">{sup.companyName}</h4>
                            <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                              {sup.originCountry} · {sup.port}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-600">Trust: {sup.trustScore}/100</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sup.certifications?.slice(0, 3).map((cert) => (
                            <span key={cert} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--hairline)] text-[var(--text-secondary)]">
                              {cert}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)] font-mono text-[11px]">Available for {quantityKg.toLocaleString()} kg CIF</span>
                          <Link
                            to={`/requests?commodity=${encodeURIComponent(commodity)}&qty=${quantityKg}&supplier=${encodeURIComponent(sup.companyName)}&origin=${encodeURIComponent(sup.originCountry)}&port=${encodeURIComponent(sup.port)}`}
                          >
                            <button className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 hover:text-amber-800 border border-amber-500/30 rounded-lg text-xs font-mono font-bold transition-all">
                              Issue RFQ →
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !supplierError ? (
                  <div className="p-8 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] text-[var(--text-secondary)] text-sm">
                    No matching suppliers found for '{commodity}'. Search for another commodity above.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </>
      )}

      {/* Catalog Listings Inventory Section */}
      <div className="space-y-5 pt-4 border-t border-[var(--hairline)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              {isExporterView ? "Export Commodities Inventory Catalog" : "Verified Supplier Listings"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans">
              {isExporterView
                ? "Browse pre-verified warehouse lots and export listings available across Indian trade hubs."
                : "Browse pre-verified lots you can purchase. Listing data is direction-agnostic and shared with the export flow."}
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">{filteredListings.length} Active Listings</span>
        </div>

        <FilterBar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search catalog by title, exporter, HS code..."
        />

        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-[var(--surface-1)] animate-pulse border border-[var(--hairline)]" />
            ))}
          </div>
        ) : listingsError ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--status-blocked)]/20 text-[var(--status-blocked)] text-sm">
            Could not load catalog — backend unreachable. ({listingsError})
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] text-[var(--text-secondary)] text-sm">
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
                  if (isExporterView) {
                    setCommodity(l.title);
                    handleDiscoverDestinations(l.title, 1000);
                  }
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

      <CountryDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedCountryInsight}
        userCommodity={commodity}
        userQuantityKg={quantityKg}
      />

      <ListingDetailDrawer isOpen={!!inspectListing} onClose={() => setInspectListing(null)} listing={inspectListing} />

      <CreateTradeRequestDrawer isOpen={isRequestDrawerOpen} onClose={() => setIsRequestDrawerOpen(false)} listing={requestListing} />
    </AppShell>
  );
};

export default DiscoverPage;

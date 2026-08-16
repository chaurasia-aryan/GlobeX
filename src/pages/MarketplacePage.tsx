import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DEMO_LISTINGS, TopBuyer } from "@/data/mockTradeData";
import { Listing } from "@/types/trade";
import { aiService, BuyerMatchQuery, BuyerMatchResponse } from "@/services/api/aiService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import SpecularButton from "@/components/ui/SpecularButton";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingDetailDrawer from "@/components/marketplace/ListingDetailDrawer";
import CreateTradeRequestDrawer from "@/components/marketplace/CreateTradeRequestDrawer";
import BuyerMatchingForm from "@/components/marketplace/BuyerMatchingForm";
import BuyerMatchingResults from "@/components/marketplace/BuyerMatchingResults";
import BuyerDetailDrawer from "@/components/marketplace/BuyerDetailDrawer";
import { PlusCircle, Package } from "lucide-react";

const CATEGORIES = [
  "All Commodities",
  "Agriculture",
  "Spices",
  "Textiles",
  "Pharmaceuticals",
  "Metals",
  "Chemicals",
] as const;

export const MarketplacePage: React.FC = () => {
  const { isBuyer } = useWorkspace();

  // ML Demand Matching State
  const [matchResponse, setMatchResponse] = useState<BuyerMatchResponse | null>(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [inspectBuyer, setInspectBuyer] = useState<TopBuyer | null>(null);
  const [requestBuyer, setRequestBuyer] = useState<TopBuyer | null>(null);

  // Product Listings State
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectListing, setInspectListing] = useState<Listing | null>(null);
  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState<boolean>(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Filter listings
  const filteredListings = useMemo<Listing[]>(() => {
    return DEMO_LISTINGS.filter((item) => {
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

  // Execute ML Matching Pipeline
  const handleRunBuyerMatch = async (query: BuyerMatchQuery) => {
    setIsMatchingLoading(true);
    try {
      const response = await aiService.matchBuyers(query);
      setMatchResponse(response);
    } catch (err) {
      console.error("Buyer matching error:", err);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleOpenCreateRequest = (listing?: Listing) => {
    setRequestBuyer(null);
    setRequestListing(listing || DEMO_LISTINGS[0]);
    setIsRequestDrawerOpen(true);
  };

  const handleCreateRequestForBuyer = (buyer: TopBuyer) => {
    setRequestListing(null);
    setRequestBuyer(buyer);
    setIsRequestDrawerOpen(true);
  };

  return (
    <AppShell maxWidth="full" className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Global Exporters Marketplace"
        subtitle="Discover verified export commodities, query matching importer demand across 7,420+ global organizations, and create escrow-backed trade requests."
        badge={
          <span className="text-xs font-mono text-slate-400">
            {filteredListings.length} products available
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/my-listings">
              <SpecularButton
                variant="outline"
                size="sm"
                radius={10}
              >
                My Export Catalog →
              </SpecularButton>
            </Link>

            <SpecularButton
              size="sm"
              radius={10}
              variant="emerald"
              icon={<PlusCircle className="w-4 h-4" />}
              iconPosition="left"
              onClick={() => handleOpenCreateRequest()}
            >
              Create Trade Request
            </SpecularButton>
          </div>
        }
      />

      {/* ── Section 1: ML Demand Matching Layer (Input -> Candidate Pool -> Ranked Recommendations) ── */}
      <div className="space-y-4">
        {/* Step 1: User Input Requirement Form */}
        <BuyerMatchingForm
          onSearch={handleRunBuyerMatch}
          isLoading={isMatchingLoading}
        />

        {/* Step 2: Contextual Match Results & Ranked BarList Surface (Displayed after search) */}
        {matchResponse && (
          <BuyerMatchingResults
            matchResponse={matchResponse}
            onInspectBuyer={(buyer) => setInspectBuyer(buyer)}
            onCreateTradeRequest={handleCreateRequestForBuyer}
          />
        )}
      </div>

      {/* ── Section 2: Product Marketplace Discovery (Browse Inventory, Search, & Filter) ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Product Marketplace
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Browse verified supplier inventory, check FOB pricing, and inspect export lots.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {filteredListings.length} Active Listings
          </span>
        </div>

        {/* Filter Bar & Search */}
        <FilterBar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search commodity title, exporter name, HS code..."
        />

        {/* Product Listings Grid with Sibling Hover Dimming */}
        {filteredListings.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            onMouseLeave={() => setHoveredCardId(null)}
          >
            {filteredListings.map((listing) => {
              const isHovered = hoveredCardId === listing.id;
              const isDimmed = hoveredCardId !== null && !isHovered;

              return (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isHovered={isHovered}
                  isDimmed={isDimmed}
                  onHover={() => setHoveredCardId(listing.id)}
                  onLeave={() => {
                    if (hoveredCardId === listing.id) setHoveredCardId(null);
                  }}
                  onInspect={(item) => setInspectListing(item)}
                  onRequest={(item) => handleOpenCreateRequest(item)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.08] bg-[#0C121D] space-y-2">
            <p className="text-xs text-slate-400">No matching commodities found.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All Commodities");
                setSearchQuery("");
              }}
              className="text-xs text-emerald-400 hover:underline font-mono cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* ── Drawers & Modals ────────────────────────────────────────── */}

      {/* Slide-Over Buyer Inspection Drawer */}
      <BuyerDetailDrawer
        buyer={inspectBuyer}
        isOpen={!!inspectBuyer}
        onClose={() => setInspectBuyer(null)}
        onCreateTradeRequest={handleCreateRequestForBuyer}
      />

      {/* Slide-Over Listing Detail Drawer (Inspect Trade) */}
      <ListingDetailDrawer
        listing={inspectListing}
        isOpen={!!inspectListing}
        onClose={() => setInspectListing(null)}
      />

      {/* Contextual 4-Step Trade Request Creation Drawer */}
      <CreateTradeRequestDrawer
        listing={requestListing}
        buyer={requestBuyer}
        isOpen={isRequestDrawerOpen}
        onClose={() => {
          setIsRequestDrawerOpen(false);
          setRequestBuyer(null);
          setRequestListing(null);
        }}
      />
    </AppShell>
  );
};

export default MarketplacePage;

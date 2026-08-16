import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DEMO_LISTINGS } from "@/data/mockTradeData";
import { Listing } from "@/types/trade";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import SpecularButton from "@/components/ui/SpecularButton";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingDetailDrawer from "@/components/marketplace/ListingDetailDrawer";
import CreateTradeRequestDrawer from "@/components/marketplace/CreateTradeRequestDrawer";
import MarketplaceBento from "@/components/marketplace/MarketplaceBento";
import { PlusCircle } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inspectListing, setInspectListing] = useState<Listing | null>(null);
  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState<boolean>(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

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

  const handleOpenCreateRequest = (listing?: Listing) => {
    setRequestListing(listing || DEMO_LISTINGS[0]);
    setIsRequestDrawerOpen(true);
  };

  return (
    <AppShell maxWidth="full" className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Global Exporters Marketplace"
        subtitle="Discover verified export commodities, review real importer demand rankings, and create escrow-backed trade requests."
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

      {/* ── Phase 11 & 12: Marketplace Demand Layer Bento (Top 10 Buyers + Corridors) ── */}
      <MarketplaceBento />

      {/* ── Filter Bar & Search (Quiet, Non-glowing horizontal control) ─ */}
      <FilterBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search commodity title, exporter name, HS code..."
      />

      {/* ── Product Listings Grid with Sibling Hover Dimming ────────── */}
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

      {/* Slide-Over Listing Detail Drawer (Inspect Trade) */}
      <ListingDetailDrawer
        listing={inspectListing}
        isOpen={!!inspectListing}
        onClose={() => setInspectListing(null)}
      />

      {/* Contextual 4-Step Trade Request Creation Drawer */}
      <CreateTradeRequestDrawer
        listing={requestListing}
        isOpen={isRequestDrawerOpen}
        onClose={() => setIsRequestDrawerOpen(false)}
      />
    </AppShell>
  );
};

export default MarketplacePage;

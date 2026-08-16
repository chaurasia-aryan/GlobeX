import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DEMO_LISTINGS, TOP_10_TRUSTED_PARTNERS } from "@/data/mockTradeData";
import { Listing } from "@/types/trade";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Section } from "@/components/common/Section";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingDetailDrawer from "@/components/marketplace/ListingDetailDrawer";
import TrustedPartnerShelf from "@/components/marketplace/TrustedPartnerShelf";
import { Search, PlusCircle, X, Award, Store } from "lucide-react";
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

export const MarketplacePage: React.FC = () => {
  const { isBuyer, isExporter } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<string>("All Commodities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "partners">("catalog");

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

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: isExporter ? "My Listings & Catalog" : "Marketplace" },
          ]}
          title={isExporter ? "Export Catalog & Listings" : "Commodity Marketplace"}
          subtitle={
            isExporter
              ? "Manage your active verified export listings, inventory, and FOB prices."
              : "Find verified suppliers and origin-inspected commodities for your import requirement."
          }
          badge={
            <StatusBadge
              status="verified"
              label={`${filteredListings.length} Active Listings`}
              size="md"
            />
          }
          action={
            <Link to="/get-started">
              <PrimaryAction
                icon={<PlusCircle className="w-4 h-4" />}
                iconPosition="left"
              >
                {isExporter ? "Create New Listing" : "Start New Import"}
              </PrimaryAction>
            </Link>
          }
        />

        {/* ── Filter Bar & Search ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B1019] border border-white/[0.08]">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition-colors cursor-pointer",
                  selectedCategory === cat
                    ? "bg-white/[0.1] text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101726] border border-white/[0.08] focus-within:border-white/[0.2] w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, HS code..."
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* ── Product Listings Grid ───────────────────────────────────────── */}
        <Section
          title="Verified Listings"
          subtitle={`Showing ${filteredListings.length} commodities with verified compliance`}
        >
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={(item) => setSelectedListing(item)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.08] space-y-3">
              <p className="text-xs text-slate-400">No matching commodities found</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All Commodities");
                  setSearchQuery("");
                }}
                className="text-xs text-emerald-400 hover:underline font-mono"
              >
                Reset filters
              </button>
            </div>
          )}
        </Section>

      </div>

      {/* Slide-Over Listing Detail Drawer (Level 3 progressive disclosure) */}
      <ListingDetailDrawer
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </AppShell>
  );
};

export default MarketplacePage;

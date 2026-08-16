import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Balancer from "react-wrap-balancer";
import { Link } from "react-router-dom";
import { DEMO_LISTINGS, TOP_10_TRUSTED_PARTNERS } from "@/data/mockTradeData";
import { Listing } from "@/types/trade";
import { FocusCards } from "@/components/ui/focus-cards";
import ListingCard from "@/components/marketplace/ListingCard";
import TrustedPartnerShelf from "@/components/marketplace/TrustedPartnerShelf";
import AIMatchResultsPanel from "@/components/marketplace/AIMatchResultsPanel";
import { LayoutGrid, Sparkles, Award, Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All Assets",
  "Agriculture",
  "Spices",
  "Textiles",
  "Pharmaceuticals",
  "Metals",
  "Industrial",
  "Chemicals",
] as const;

type Category = (typeof CATEGORIES)[number];

export const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All Assets");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAiSearch, setShowAiSearch] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"catalog" | "partners">("catalog");

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filteredListings = useMemo<Listing[]>(() => {
    return DEMO_LISTINGS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Assets" || item.category === selectedCategory;

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
    <div className="min-h-screen text-[var(--text-primary)] p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full font-sans relative z-10">
      
      {/* ── Section 1: Header + Breadcrumb ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/"
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-xs font-sans transition-colors"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-sans text-[var(--text-primary)]">
                  Marketplace
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-dim)] border border-[var(--hairline)] text-[var(--accent)] shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
                <Balancer>Global Trade Marketplace</Balancer>
              </h1>
              <p className="text-xs sm:text-sm font-sans text-[var(--text-secondary)] mt-0.5">
                <Balancer>Verified commodities, AI-matched counterparties, and conditional escrow settlement.</Balancer>
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAiSearch(!showAiSearch)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all border ${
              showAiSearch
                ? "bg-[var(--accent)] text-[var(--ink)] border-[var(--accent)] shadow-md"
                : "bg-[var(--panel)] hover:bg-[var(--panel-raised)] text-[var(--accent)] border-[var(--hairline)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiSearch ? "Close AI Matcher" : "AI Semantic Match"}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAiSearch ? "rotate-180" : ""}`} />
          </button>

          <div className="flex rounded-xl bg-[var(--panel)] border border-[var(--hairline)] p-1">
            <button
              onClick={() => setActiveView("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === "catalog"
                  ? "bg-[var(--panel-raised)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Listings ({DEMO_LISTINGS.length})
            </button>
            <button
              onClick={() => setActiveView("partners")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === "partners"
                  ? "bg-[var(--panel-raised)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Award className="w-3 h-3 text-[var(--emerald)]" />
              <span>Top Partners (10)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Expandable AI Semantic Search ───────────────────────── */}
      <AnimatePresence>
        {showAiSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--panel)] p-1 shadow-2xl">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-wider">
                    AI Semantic Trade Discovery & Counterparty Fit
                  </span>
                </div>
                <button
                  onClick={() => setShowAiSearch(false)}
                  className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <AIMatchResultsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 3: View Toggle Content (Catalog vs Top Partners) ────────── */}
      {activeView === "partners" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Tier-1 Verified Trade Partners
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Ranked by AI Trust Score (0–100), corporate KYC verification, and historical settlement completion.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/60">
              10 Tier-1 Verified Exporters
            </span>
          </div>

          <TrustedPartnerShelf partners={TOP_10_TRUSTED_PARTNERS} showHeader={false} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--panel)] p-3.5 rounded-2xl border border-[var(--hairline)] shadow-sm">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
                    selectedCategory === cat
                      ? "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]/40 shadow-sm"
                      : "bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--panel-raised)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Inline search */}
            <div className="flex items-center gap-2 bg-[var(--panel-raised)] px-3.5 py-2 rounded-xl border border-[var(--hairline)] w-full md:w-80 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commodities, exporters, HS codes…"
                className="bg-transparent border-none outline-none text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Result Count and Active Filters */}
          <div className="flex items-center justify-between px-1 text-xs text-[var(--text-secondary)]">
            <span>
              Showing <strong className="text-[var(--text-primary)] font-medium">{filteredListings.length}</strong> active trade listings
              {selectedCategory !== "All Assets" && ` in ${selectedCategory}`}
            </span>
            {(selectedCategory !== "All Assets" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All Assets");
                  setSearchQuery("");
                }}
                className="text-[var(--accent)] hover:underline font-mono text-[11px]"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Listings Grid (FIXED: FocusCards renders its own 3-col grid without extra wrapper) */}
          {filteredListings.length > 0 ? (
            <FocusCards
              cards={filteredListings}
              renderCard={(listing: Listing, _idx, isHovered) => (
                <ListingCard key={listing.id} listing={listing} isHovered={isHovered} />
              )}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--panel)]/50">
              <div className="w-12 h-12 rounded-full bg-[var(--panel-raised)] border border-[var(--hairline)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                No matching trade assets found
              </p>
              <p className="text-xs text-[var(--text-tertiary)] max-w-xs leading-relaxed">
                Try clearing your search query or selecting "All Assets" to view all available listings.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All Assets");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--ink)] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MarketplacePage;

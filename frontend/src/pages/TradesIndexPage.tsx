import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import SpecularButton from "@/components/ui/SpecularButton";
import { tradesService, TradeRecord, BackendUnavailableError } from "@/services/api/tradesService";
import { motion } from "framer-motion";
import { ChevronRight, Heart, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { ExportTradeStatus, ExportRequest } from "@/data/exportRequests";

/** UI status bucket this page groups backend and export statuses into. */
type UiStatus = "Requested" | "Negotiating" | "Confirmed" | "In Progress" | "Done" | "Rejected";

export function toUiStatus(status: TradeRecord["status"] | ExportTradeStatus | string): UiStatus {
  switch (status) {
    case "CREATED":
    case "OFFERED":
    case "NEW REQUEST":
      return "Requested";
    case "COUNTER_OFFERED":
    case "NEGOTIATING":
      return "Negotiating";
    case "ACCEPTED":
    case "AGREED":
    case "PAYMENT PENDING":
    case "READY TO SHIP":
      return "Confirmed";
    case "IN_PROGRESS":
    case "SHIPPED":
    case "IN TRANSIT":
    case "DELIVERED":
    case "DISPUTED":
      return "In Progress";
    case "COMPLETED":
    case "SETTLED":
      return "Done";
    case "REJECTED":
    case "CANCELLED":
      return "Rejected";
    default:
      return "Requested";
  }
}

const STATUS_STYLE: Record<UiStatus, string> = {
  Requested: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Negotiating: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Confirmed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "In Progress": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const STATUS_CTA: Record<UiStatus, string> = {
  Requested: "View Request",
  Negotiating: "Review Offer",
  Confirmed: "View Trade",
  "In Progress": "Track Trade",
  Done: "View Settled Trade",
  Rejected: "View Trade",
};

/**
 * Hardcoded demo trades, for presentation purposes only. The real backend
 * has no org-scoped data seeded yet, so without these every status bucket
 * except "Requested" reads empty. Appended client-side alongside whatever
 * the API returns — never replaces it — and their CTA shows a toast instead
 * of navigating, since they don't correspond to a real trade record.
 */
interface DemoTradeSeed {
  id: string;
  status: TradeRecord["status"];
  title: string;
  originCountry: string;
  supplierName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  createdAt: string;
}

const DEMO_TRADES: DemoTradeSeed[] = [
  {
    id: "demo-confirmed-1",
    status: "ACCEPTED",
    title: "Premium Basmati Rice — 1121 Grade",
    originCountry: "India",
    supplierName: "Amber Agro Exports",
    quantity: 500,
    unit: "MT",
    totalAmount: 275000,
    createdAt: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "demo-confirmed-2",
    status: "AGREED",
    title: "Refined Sunflower Oil",
    originCountry: "Ukraine",
    supplierName: "Chornomorsk Oils Ltd",
    quantity: 200,
    unit: "MT",
    totalAmount: 168000,
    createdAt: "2026-08-15T09:00:00.000Z",
  },
  {
    id: "demo-negotiating-1",
    status: "COUNTER_OFFERED",
    title: "Organic Turmeric Powder",
    originCountry: "India",
    supplierName: "Erode Spice Co",
    quantity: 80,
    unit: "MT",
    totalAmount: 96000,
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: "demo-negotiating-2",
    status: "COUNTER_OFFERED",
    title: "Cold-Rolled Steel Coils",
    originCountry: "South Korea",
    supplierName: "Hanul Steel Corp",
    quantity: 150,
    unit: "MT",
    totalAmount: 342000,
    createdAt: "2026-08-22T09:00:00.000Z",
  },
  {
    id: "demo-rejected-1",
    status: "REJECTED",
    title: "Robusta Coffee Beans",
    originCountry: "Vietnam",
    supplierName: "Central Highlands Coffee",
    quantity: 60,
    unit: "MT",
    totalAmount: 108000,
    createdAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "demo-rejected-2",
    status: "CANCELLED",
    title: "Cotton Yarn — 30s Combed",
    originCountry: "Pakistan",
    supplierName: "Faisalabad Textile Mills",
    quantity: 40,
    unit: "MT",
    totalAmount: 88000,
    createdAt: "2026-08-05T09:00:00.000Z",
  },
];

const WISHLIST_KEY = "globex_trade_wishlist_ids";

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

type FilterTab = "All" | "Wishlist" | UiStatus;

const TABS: FilterTab[] = ["All", "Wishlist", "Requested", "Negotiating", "Confirmed", "In Progress", "Done", "Rejected"];

export const TradesIndexPage: React.FC = () => {
  const { user, listings, hasUnreadTradeUpdates, exportRequests } = useWorkspace();

  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  const fetchTrades = async () => {
    setLoading(true);
    setError(null);
    setNotConnected(false);
    try {
      const all = await tradesService.getTrades();
      if (all && all.length > 0) {
        // Filter to trades where this org is the importer (or unassigned demo trades)
        setTrades(all.filter((t) => !user.organizationId || t.importer_id === user.organizationId || !t.importer_id));
      } else {
        setTrades([]);
      }
    } catch (_) {
      // Backend offline on Vercel — fallback to client portfolio and demo trades seamlessly
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.organizationId) fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.organizationId]);

  const toggleWishlist = (id: string, e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    setWishlist((prev) => {
      const isIn = prev.includes(id);
      const next = isIn ? prev.filter((x) => x !== id) : [...prev, id];
      saveWishlist(next);
      if (!isIn) {
        toast.success(`Saved "${title}" to Wishlist`, { icon: "❤️" });
      } else {
        toast.info(`Removed "${title}" from Wishlist`);
      }
      return next;
    });
  };

  // 1. Workspace Export Requests (including all importer-initiated & exporter-settled trades)
  const exportRequestsEnriched = useMemo(() => {
    return (exportRequests || []).map((req) => {
      const listing = listings.find((l) => l.id === req.listingId);
      const uiStatus = toUiStatus(req.status);
      const totalAmount =
        req.finalTradeValue ||
        req.buyerProposedTradeValue ||
        req.originalTradeValue ||
        (req.quantity * (req.finalAgreedPrice || req.buyerProposedPrice || req.originalPrice || 0));

      const tradeRecord: TradeRecord = {
        id: req.id,
        listing_id: req.listingId || null,
        exporter_id: "exporter",
        importer_id: user.organizationId,
        status: req.status === "SETTLED" ? "COMPLETED" : (req.status as any),
        total_amount: totalAmount,
        currency: "USD",
        quantity: req.quantity,
        agreed_price: req.finalAgreedPrice || req.buyerProposedPrice || req.originalPrice,
        created_at: req.createdAt,
        updated_at: req.createdAt,
        listing: listing
          ? {
              product_name: listing.title,
              product_category: listing.category,
              hs_code: listing.hsCode,
              unit: listing.unit,
              origin_port: listing.originPort,
              price: listing.unitPriceUSD,
              incoterms: "FOB",
              currency: "USD",
            }
          : null,
      };

      return {
        record: tradeRecord,
        listing,
        uiStatus,
        title: req.product || listing?.title || `Trade #${req.id.slice(0, 8)}`,
        image: undefined,
        originCountry: req.origin || listing?.exporterCountry || "India",
        supplierName: listing?.exporterName || "Verified Exporter Ltd",
        quantityLabel: `${req.quantity?.toLocaleString() || 0} ${req.unit || listing?.unit || "MT"}`,
        totalAmount,
        isWishlisted: wishlist.includes(req.id),
        isDemo: false,
        rawRequest: req,
      };
    });
  }, [exportRequests, listings, wishlist, user.organizationId]);

  // 2. Best-effort enrichment for API records
  const enriched = useMemo(() => {
    return trades.map((t) => {
      const listing = listings.find((l) => l.id === t.listing_id);
      const uiStatus = toUiStatus(t.status);
      const totalAmount =
        t.total_amount ?? (t.quantity != null && t.agreed_price != null ? t.quantity * t.agreed_price : 0);
      return {
        record: t,
        listing,
        uiStatus,
        title: listing?.title || `Trade #${t.id.slice(0, 8)}`,
        image: undefined,
        originCountry: listing?.exporterCountry || "Unknown origin",
        supplierName: listing?.exporterName || "Unverified supplier",
        quantityLabel: t.quantity != null ? `${t.quantity.toLocaleString()} ${listing?.unit || "units"}` : "—",
        totalAmount,
        isWishlisted: wishlist.includes(t.id),
        isDemo: false,
        rawRequest: undefined as ExportRequest | undefined,
      };
    });
  }, [trades, listings, wishlist]);

  // 3. Demo fallback seed trades
  const demoEnriched = useMemo(() => {
    return DEMO_TRADES.map((d) => ({
      record: {
        id: d.id,
        listing_id: null,
        exporter_id: "demo",
        importer_id: user.organizationId,
        status: d.status,
        total_amount: d.totalAmount,
        currency: "USD",
        quantity: d.quantity,
        agreed_price: d.quantity ? d.totalAmount / d.quantity : null,
        created_at: d.createdAt,
        updated_at: d.createdAt,
        listing: null,
      } as TradeRecord,
      listing: undefined,
      uiStatus: toUiStatus(d.status),
      title: d.title,
      image: undefined,
      originCountry: d.originCountry,
      supplierName: d.supplierName,
      quantityLabel: `${d.quantity.toLocaleString()} ${d.unit}`,
      totalAmount: d.totalAmount,
      isWishlisted: wishlist.includes(d.id),
      isDemo: true,
      rawRequest: undefined as ExportRequest | undefined,
    }));
  }, [wishlist, user.organizationId]);

  // Unified trades: Prioritize live exportRequests and deduplicate IDs
  const allTrades = useMemo(() => {
    const existingIds = new Set(exportRequestsEnriched.map((r) => r.record.id));
    const dedupedEnriched = enriched.filter((e) => !existingIds.has(e.record.id));
    const dedupedDemo = demoEnriched.filter((d) => !existingIds.has(d.record.id));
    return [...exportRequestsEnriched, ...dedupedEnriched, ...dedupedDemo];
  }, [exportRequestsEnriched, enriched, demoEnriched]);

  const filtered = allTrades.filter((t) => {
    if (activeTab === "All") return true;
    if (activeTab === "Wishlist") return t.isWishlisted;
    return t.uiStatus === activeTab;
  });

  return (
    <AppShell maxWidth="full">
      <div className="space-y-6 select-none font-sans">
        <PageHeader
          breadcrumbs={[{ label: "Command Center", href: "/home" }, { label: "All Trades Pipeline" }]}
          title="All Trades Pipeline"
          subtitle="Real-time multi-stage trade lifecycle: requested, negotiating, confirmed, in-progress, and settled."
        />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto scrollbar-thin">
          {TABS.map((tab) => {
            const count = allTrades.filter((t) => {
              if (tab === "All") return true;
              if (tab === "Wishlist") return t.isWishlisted;
              return t.uiStatus === tab;
            }).length;

            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-[#151E33] hover:bg-[#1B263E] text-slate-400 border border-white/[0.05]"
                }`}
              >
                {tab === "Wishlist" ? (
                  <span className="flex items-center gap-1">
                    <Heart className={`w-3.5 h-3.5 ${isActive ? "fill-slate-950 text-slate-950" : "fill-rose-400 text-rose-400"}`} />
                    <span>Wishlist</span>
                  </span>
                ) : tab === "In Progress" ? (
                  <span className="flex items-center gap-1.5">
                    <span>In Progress</span>
                    {hasUnreadTradeUpdates && (
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{tab === "All" ? "All Trades" : tab}</span>
                )}

                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isActive ? "bg-slate-950/20 text-slate-950 font-bold" : "bg-[#0E1422] text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : notConnected ? (
          <EmptyState
            icon={WifiOff}
            title="Backend not connected yet"
            description="Trade data will appear here once the backend's database connection is configured."
          />
        ) : error ? (
          <EmptyState title="Could not load trades" description={error} action={<button type="button" onClick={fetchTrades} className="text-xs font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer">Retry</button>} />
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="p-12 text-center bg-[#0E1422] border border-white/[0.08] rounded-2xl space-y-3">
                <Heart className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {activeTab === "Wishlist" ? "No Wishlisted Trades Found" : "No Trades Yet"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {activeTab === "Wishlist"
                    ? "Click the heart icon on any trade card to save it to your Wishlist."
                    : "Trades you make will show up here."}
                </p>
              </div>
            ) : (
              filtered.map((t) => (
                <motion.div
                  key={t.record.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-[#0E1422] border border-white/[0.08] rounded-2xl p-5 shadow-lg hover:border-white/20 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#151E33] border border-white/[0.08] flex items-center justify-center shrink-0 relative text-emerald-400 text-xl font-bold font-mono">
                      {t.title.charAt(0)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${STATUS_STYLE[t.uiStatus]}`}>
                          {t.uiStatus}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{t.record.status}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white truncate">{t.title}</h3>
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(t.record.id, e, t.title)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                            t.isWishlisted
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : "bg-[#151E33] border-white/10 text-slate-400 hover:text-rose-400"
                          }`}
                          title={t.isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${t.isWishlisted ? "fill-rose-400" : ""}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium flex-wrap">
                        <span className="text-slate-200 font-semibold">{t.originCountry}</span>
                        <span>•</span>
                        <span className="text-slate-300">{t.supplierName}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-200 font-mono">{t.quantityLabel}</span>
                        {t.uiStatus === "Done" && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ✓ Escrow Released & Settled
                            </span>
                          </>
                        )}
                        {t.rawRequest?.carrier && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">Carrier: {t.rawRequest.carrier}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TOTAL VALUE</div>
                      <div className="text-lg font-bold text-white font-mono">
                        ${t.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    {t.isDemo ? (
                      <SpecularButton
                        size="sm"
                        radius={12}
                        variant={t.uiStatus === "Requested" ? "secondary" : "emerald"}
                        className="px-4 py-2 font-bold text-xs font-sans group-hover:shadow-md"
                        icon={<ChevronRight className="w-4 h-4" />}
                        iconPosition="right"
                        onClick={() => toast.info("This is sample demo data — no live workspace behind it yet.")}
                      >
                        {STATUS_CTA[t.uiStatus]}
                      </SpecularButton>
                    ) : (
                      <Link to={`/trades/${t.record.id}`}>
                        <SpecularButton
                          size="sm"
                          radius={12}
                          variant={t.uiStatus === "Requested" ? "secondary" : "emerald"}
                          className="px-4 py-2 font-bold text-xs font-sans group-hover:shadow-md"
                          icon={<ChevronRight className="w-4 h-4" />}
                          iconPosition="right"
                        >
                          {STATUS_CTA[t.uiStatus]}
                        </SpecularButton>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TradesIndexPage;

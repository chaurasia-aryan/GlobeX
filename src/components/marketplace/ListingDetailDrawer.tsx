import { Listing } from "@/types/trade";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Box, Anchor, ArrowRight, Building2, MapPin } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Link } from "react-router-dom";
import MatchExplanation from "@/components/ai/MatchExplanation";

interface ListingDetailDrawerProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ListingDetailDrawer({ listing, isOpen, onClose }: ListingDetailDrawerProps) {
  if (!listing) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#0A0F18] border-l border-white/[0.08] p-6 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between font-sans select-none"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                      VERIFIED EXPORT READY
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      HS {listing.hsCode}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white leading-snug">{listing.title}</h2>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{listing.exporterName}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{listing.exporterCity}, {listing.exporterCountry}</span>
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pricing & Order Specifications */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0F1724] border border-white/[0.08]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">FOB Unit Price</span>
                  <div className="text-2xl font-display font-bold text-white">
                    $<NumberFlow value={listing.unitPriceUSD} /> <span className="text-xs font-sans font-normal text-[var(--text-tertiary)]">/ {listing.unit}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Minimum Order (MOQ)</span>
                  <div className="text-xl font-display font-bold text-white font-mono">
                    {listing.minimumOrderQuantity.toLocaleString()} {listing.unit}s
                  </div>
                </div>

                <div className="col-span-2 pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>Origin Port:</span>
                  <strong className="text-white">{listing.originPort}</strong>
                </div>
              </div>

              {/* AI Match Fit (Using Collapsible) */}
              <div className="p-4 rounded-2xl bg-[#0E1520] border border-white/[0.06]">
                <MatchExplanation
                  matchScore={listing.aiMatchScore || 94}
                  productSimilarity={96}
                  priceCompatibility={92}
                  certificationMatch={100}
                />
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
                  Product Description
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[#0E1520] p-4 rounded-2xl border border-white/[0.04]">
                  {listing.description || "Premium export grade commodity verified for international maritime trade with complete phytosanitary and laboratory certifications."}
                </p>
              </div>

              {/* Active Certifications */}
              {listing.certifications && listing.certifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
                    Verified Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Dominant CTA */}
            <div className="pt-6 border-t border-white/[0.08] mt-6">
              <Link to="/trades/TRD-IND-UAE-550K" onClick={onClose}>
                <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg">
                  <span>Start Trade & Lock Escrow ($550k)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default ListingDetailDrawer;

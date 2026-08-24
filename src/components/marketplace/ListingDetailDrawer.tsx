import { Listing } from "@/types/trade";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ArrowRight, Building2, MapPin } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Link } from "react-router-dom";
import MatchExplanation from "@/components/ai/MatchExplanation";
import SpecularButton from "@/components/ui/SpecularButton";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 transition-opacity cursor-pointer"
          />

          {/* Front-Appearing Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-xl max-h-[85vh] bg-[var(--surface-1)] border border-[var(--hairline-strong)] rounded-3xl p-6 sm:p-7 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between font-sans select-none"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--hairline)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--status-verified-bg)] text-emerald-600 border border-emerald-800/60">
                      VERIFIED EXPORT READY
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      HS {listing.hsCode}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-[var(--text-primary)] leading-snug">{listing.title}</h2>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{listing.exporterName}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{listing.exporterCity}, {listing.exporterCountry}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-[var(--surface-3)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pricing & Order Specifications */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">FOB Unit Price</span>
                  <div className="text-2xl font-display font-bold text-[var(--text-primary)]">
                    $<NumberFlow value={listing.unitPriceUSD} /> <span className="text-xs font-sans font-normal text-[var(--text-tertiary)]">/ {listing.unit}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Minimum Order (MOQ)</span>
                  <div className="text-xl font-display font-bold text-[var(--text-primary)] font-mono">
                    {listing.minimumOrderQuantity.toLocaleString()} {listing.unit}s
                  </div>
                </div>

                <div className="col-span-2 pt-2 mt-2 border-t border-[var(--hairline)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>Origin Port:</span>
                  <strong className="text-[var(--text-primary)]">{listing.originPort}</strong>
                </div>
              </div>

              {/* AI Match Fit (Using Collapsible) */}
              <div className="p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)]">
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
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-1)] p-4 rounded-2xl border border-[var(--hairline)]">
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
                        className="px-2.5 py-1 rounded-lg bg-[var(--status-verified-bg)] border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Dominant CTA with SpecularButton */}
            <div className="pt-6 border-t border-[var(--hairline)] mt-6">
              <Link to={`/requests?listingId=${listing.id}`} onClick={onClose} className="block w-full">
                <SpecularButton
                  size="md"
                  radius={12}
                  variant="emerald"
                  className="w-full justify-center"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Request Trade
                </SpecularButton>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ListingDetailDrawer;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NumberFlow from "@number-flow/react";
import { Listing } from "@/types/trade";
import { ArrowRight, MapPin, Sparkles, ShieldCheck, Box, Anchor } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  isHovered?: boolean;
}

export const ListingCard = ({ listing, onSelect }: ListingCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-6 rounded-2xl border border-[var(--hairline)] hover:border-[var(--hairline-strong)] bg-[var(--panel)] hover:bg-[var(--panel-raised)] transition-all duration-200 flex flex-col justify-between min-h-[280px] h-full group shadow-lg select-none"
    >
      <div className="space-y-4">
        {/* Top Header: Hero Title + AI Match Score Pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <h3 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-sans flex-wrap">
              <span className="font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                {listing.exporterName}
              </span>
              <span className="text-[var(--text-tertiary)]">•</span>
              <span className="flex items-center gap-1 text-[var(--text-secondary)] truncate">
                <MapPin className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                {listing.exporterCity}, {listing.exporterCountry}
              </span>
            </div>
          </div>

          {/* AI Match Badge */}
          {listing.aiMatchScore != null && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-mono font-bold">
                <NumberFlow value={listing.aiMatchScore} />%
              </span>
            </div>
          )}
        </div>

        {/* Clean Spec Chips Row (Replaces heavy nested box) */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] text-[var(--text-secondary)] font-mono">
            <span className="text-[var(--text-tertiary)] font-sans">HS:</span> {listing.hsCode}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] text-[var(--text-secondary)]">
            <Box className="w-3 h-3 text-[var(--text-tertiary)]" />
            <strong className="text-[var(--text-primary)] font-semibold">{listing.minimumOrderQuantity.toLocaleString()}</strong> {listing.unit}s MOQ
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] text-[var(--text-secondary)] truncate max-w-[150px]">
            <Anchor className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
            <span className="truncate">{listing.originPort.split(",")[0]}</span>
          </span>
        </div>

        {/* Certification Tags */}
        {listing.certifications && listing.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.certifications.slice(0, 3).map((cert) => (
              <span
                key={cert}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[rgba(52,199,149,0.08)] text-[var(--emerald)] border border-[rgba(52,199,149,0.2)] flex items-center gap-1"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                {cert}
              </span>
            ))}
            {listing.certifications.length > 3 && (
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--ink)] border border-[var(--hairline)]">
                +{listing.certifications.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Prominent Price & Clean Action Button */}
      <div className="pt-4 mt-5 border-t border-[var(--hairline)] flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] block">
            FOB Unit Price
          </span>
          <div className="text-2xl font-display font-bold text-[var(--text-primary)] leading-tight mt-0.5">
            $<NumberFlow value={listing.unitPriceUSD} />
            <span className="text-xs font-sans text-[var(--text-secondary)] font-normal ml-1">
              / {listing.unit}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect && onSelect(listing)}
          className="px-4 py-2 rounded-xl bg-[var(--panel-raised)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[var(--ink)] font-semibold text-xs transition-all flex items-center gap-1.5 border border-[var(--hairline)] group-hover:border-[var(--accent)]/40 shadow-sm cursor-pointer"
        >
          <span>Inspect Trade</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ListingCard;

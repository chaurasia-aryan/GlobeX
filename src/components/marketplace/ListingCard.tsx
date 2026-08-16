import React from "react";
import { Listing } from "@/types/trade";
import { MapPin, ShieldCheck, Info } from "lucide-react";
import SpecularButton from "@/components/ui/SpecularButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  onInspect?: (listing: Listing) => void;
  onRequest?: (listing: Listing) => void;
  isHovered?: boolean;
  isDimmed?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onInspect,
  onRequest,
  isHovered = false,
  isDimmed = false,
  onHover,
  onLeave,
}) => {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      tabIndex={0}
      className={cn(
        "p-4 sm:p-5 rounded-2xl border flex flex-col justify-between h-full select-none space-y-4 focus-visible:ring-1 focus-visible:ring-emerald-400 focus-visible:outline-none transition-[opacity,filter,transform] duration-180 ease-out",
        isHovered
          ? "bg-[#0F1726] border-white/[0.14] opacity-100 filter-none -translate-y-0.5 shadow-lg"
          : isDimmed
          ? "bg-[#0C121D] border-white/[0.05] opacity-60 blur-[1px]"
          : "bg-[#0C121D] border-white/[0.07] hover:border-white/[0.12] opacity-100 filter-none"
      )}
    >
      {/* 1. Level A: Product Title & Supplier Info */}
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-base text-white transition-colors leading-snug line-clamp-2">
          {listing.title}
        </h3>

        {/* 2. Level A: Supplier Name & Location · Level B: Tooltip for HS / Certs */}
        <div className="text-xs text-slate-400 font-sans flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-slate-300 truncate max-w-[140px]">
              {listing.exporterName}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-400 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              {listing.exporterCity}, {listing.exporterCountry}
            </span>
          </div>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                  aria-label="View specifications summary"
                >
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0A0F18] border border-white/[0.1] text-[11px] font-mono text-slate-300 p-2 space-y-1">
                <div>HS Code: {listing.hsCode}</div>
                <div>Port: {listing.originPort || "Origin Port"}</div>
                {listing.certifications && (
                  <div>Certs: {listing.certifications.slice(0, 3).join(", ")}</div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* 3. Level A: Price, MOQ, and Verification */}
      <div className="pt-3 border-t border-white/[0.06] flex items-end justify-between">
        <div>
          <div className="font-mono text-lg font-bold text-white leading-tight">
            ${listing.unitPriceUSD.toLocaleString()}{" "}
            <span className="text-xs font-sans text-slate-400 font-normal">
              / {listing.unit}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            MOQ: {listing.minimumOrderQuantity.toLocaleString()} {listing.unit}
          </div>
        </div>

        {/* Verification Status */}
        <div className="text-right flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified</span>
        </div>
      </div>

      {/* 4. Level A Actions (At most 2) */}
      <div className="pt-1 grid grid-cols-2 gap-2">
        <SpecularButton
          type="button"
          variant="outline"
          size="sm"
          radius={10}
          className="w-full justify-center"
          onClick={() => onInspect && onInspect(listing)}
        >
          <span>Inspect Trade</span>
        </SpecularButton>

        <SpecularButton
          type="button"
          variant="emerald"
          size="sm"
          radius={10}
          className="w-full justify-center font-semibold"
          onClick={() => onRequest && onRequest(listing)}
        >
          <span>Create Request</span>
        </SpecularButton>
      </div>
    </div>
  );
};

export default ListingCard;

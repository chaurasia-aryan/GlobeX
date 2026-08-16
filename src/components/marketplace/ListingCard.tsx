import React from "react";
import { Listing } from "@/types/trade";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  isHovered?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] bg-[#0B1019] hover:bg-[#0E1522] transition-all flex flex-col justify-between h-full group select-none shadow-sm space-y-4">
      {/* Top Header: Title, Category & Location */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
            {listing.title}
          </h3>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            HS {listing.hsCode}
          </span>
        </div>

        <div className="text-xs text-slate-400 font-sans flex items-center gap-1.5 truncate">
          <span className="font-medium text-slate-200">{listing.exporterName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            {listing.exporterCity}, {listing.exporterCountry}
          </span>
        </div>
      </div>

      {/* Middle Specs: Scannable Price & MOQ */}
      <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
        <div>
          <div className="font-mono text-xl font-extrabold text-white leading-tight">
            ${listing.unitPriceUSD.toLocaleString()}{" "}
            <span className="text-xs font-sans text-slate-400 font-normal">
              / {listing.unit}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            MOQ: {listing.minimumOrderQuantity.toLocaleString()} {listing.unit}
          </div>
        </div>

        {/* Verified & Trust Score Tag */}
        <div className="text-right flex flex-col items-end gap-1">
          <StatusBadge status="verified" label="Verified" />
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            {listing.aiMatchScore ? `${listing.aiMatchScore}% Trust` : "94 Trust"}
          </span>
        </div>
      </div>

      {/* Single Clean Primary Action */}
      <div className="pt-2">
        <PrimaryAction
          variant="outline"
          size="sm"
          className="w-full justify-between group-hover:bg-white/[0.08] group-hover:text-white"
          onClick={() => onSelect && onSelect(listing)}
        >
          <span>Inspect Trade</span>
        </PrimaryAction>
      </div>
    </div>
  );
};

export default ListingCard;

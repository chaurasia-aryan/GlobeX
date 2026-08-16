import React from "react";
import { TopBuyer } from "@/data/mockTradeData";
import { BuyerMatchResponse } from "@/services/api/aiService";
import {
  MapPin,
  CheckCircle2,
  Info,
  Eye,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedList from "@/components/reactbits/AnimatedList";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BuyerMatchingResultsProps {
  matchResponse: BuyerMatchResponse | null;
  onInspectBuyer: (buyer: TopBuyer) => void;
  onCreateTradeRequest: (buyer: TopBuyer) => void;
  className?: string;
}

export const BuyerMatchingResults: React.FC<BuyerMatchingResultsProps> = ({
  matchResponse,
  onInspectBuyer,
  onCreateTradeRequest,
  className = "",
}) => {
  if (!matchResponse) return null;

  const { query, candidateCount, strongMatchCount, recommendations } = matchResponse;

  return (
    <div className={cn("w-full space-y-4 font-sans select-none", className)}>
      {/* ── 1. Candidate Pool Summary Metric Strip (Level A Funnel) ───── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0C121D] border border-white/[0.07] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold tracking-wide">
            ML MATCHING FUNNEL
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <strong className="text-white font-mono">{candidateCount.toLocaleString()}</strong>{" "}
            <span>eligible</span>
          </div>
          <span>•</span>
          <div>
            <strong className="text-emerald-400 font-mono">{strongMatchCount}</strong>{" "}
            <span>strong matches</span>
          </div>
          <span>•</span>
          <div>
            <strong className="text-sky-400 font-mono">{recommendations.length}</strong>{" "}
            <span>recommended</span>
          </div>
        </div>
      </div>

      {/* ── 2. Contextual Recommendations Ranked Surface ──────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0C121D] border border-white/[0.07] shadow-lg space-y-4">
        {/* Contextual Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-sm text-white">
              Recommended Buyers for{" "}
              <span className="text-emerald-400">
                {query.quantity ? `${query.quantity.toLocaleString()} ${query.unit}` : ""}{" "}
                {query.commodity}
              </span>{" "}
              ➔{" "}
              <span className="text-sky-400">
                {query.destinationCountry || "Global Corridor"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by verified demand, corridor compatibility, and procurement capacity.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            Top {recommendations.length} Ranked
          </span>
        </div>

        {/* Minimal Ranked Recommendations List (Level A Visible / Level B Popover) */}
        {recommendations.length > 0 ? (
          <AnimatedList
            items={recommendations}
            maxHeight="520px"
            displayScrollbar={true}
            showGradients={true}
            enableArrowNavigation={true}
            onItemSelect={(buyer) => onInspectBuyer(buyer)}
            renderItem={(buyer: TopBuyer, index: number, state: { selected: boolean }) => {
              const matchPercent = buyer.matchScore || 90;

              return (
                <div
                  className={cn(
                    "p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
                    state.selected
                      ? "bg-[#0B1320] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                      : "bg-[#070A0E] border-white/[0.06] hover:border-emerald-500/30 hover:bg-[#090E17]"
                  )}
                >
                  {/* Left: Rank, Name, Location */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors",
                        state.selected
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-white/[0.03] border-white/[0.06] text-emerald-400"
                      )}
                    >
                      {buyer.rank}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                        {buyer.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{buyer.country} · {buyer.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle & Right: Match Score (with Why This Match? Popover) + 2 Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {/* Level B: Match Score with Popover for detailed signals */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-colors cursor-pointer"
                          aria-label="Why this match?"
                        >
                          <span>{matchPercent}% Match</span>
                          <Info className="w-3 h-3 text-emerald-400/80" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="end"
                        className="w-64 p-3 bg-[#0C121D] border border-white/[0.1] text-xs space-y-2 text-slate-300 shadow-xl rounded-xl"
                      >
                        <div className="font-display font-semibold text-white text-xs border-b border-white/[0.06] pb-1.5 flex items-center justify-between">
                          <span>Why this match?</span>
                          <span className="font-mono text-emerald-400 font-bold">{matchPercent}% Score</span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          {buyer.matchSignals?.map((sig, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{sig}</span>
                            </div>
                          )) || (
                            <div className="text-slate-400">High compatibility across corridor and capacity.</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Level A Actions (At most 2) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectBuyer(buyer);
                        }}
                        className="h-7 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTradeRequest(buyer);
                        }}
                        className="h-7 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer active:scale-[0.98]"
                      >
                        <PlusCircle className="w-3 h-3 text-emerald-400" />
                        <span>Create Request</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-white/[0.08] bg-[#070A0E] space-y-2">
            <p className="text-xs text-slate-300 font-semibold">No strong matches found.</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting the commodity name, target volume, destination market, or optional specifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerMatchingResults;

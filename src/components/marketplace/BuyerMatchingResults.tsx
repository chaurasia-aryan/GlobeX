import React from "react";
import { TopBuyer } from "@/data/mockTradeData";
import { BuyerMatchResponse } from "@/services/api/aiService";
import {
  Building2,
  MapPin,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Eye,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedList from "@/components/reactbits/AnimatedList";

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
      {/* ── 1. Compact Candidate Pool Summary Metric Strip ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0C121D] border border-white/[0.07] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold tracking-wide">
            ML MATCHING RESULT
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <strong className="text-white font-mono">{candidateCount.toLocaleString()}</strong>{" "}
            <span>eligible organizations</span>
          </div>
          <span>•</span>
          <div>
            <strong className="text-emerald-400 font-mono">{strongMatchCount}</strong>{" "}
            <span>strong matches</span>
          </div>
          <span>•</span>
          <div>
            <strong className="text-sky-400 font-mono">{recommendations.length}</strong>{" "}
            <span>recommended buyers</span>
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
              Ranked by commodity specification compatibility, corridor logistics, and verified active demand.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            Top {recommendations.length} Ranked
          </span>
        </div>

        {/* Ranked BarList Surface powered by AnimatedList */}
        {recommendations.length > 0 ? (
          <AnimatedList
            items={recommendations}
            maxHeight="620px"
            displayScrollbar={true}
            showGradients={true}
            enableArrowNavigation={true}
            onItemSelect={(buyer) => onInspectBuyer(buyer)}
            renderItem={(buyer: TopBuyer, index: number, state: { selected: boolean }) => {
              const matchPercent = buyer.matchScore || 90;

              return (
                <div
                  className={cn(
                    "p-3.5 rounded-xl border transition-all duration-150 space-y-2.5 group",
                    state.selected
                      ? "bg-[#0B1320] border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/20"
                      : "bg-[#070A0E] border-white/[0.06] hover:border-emerald-500/30 hover:bg-[#090E17]"
                  )}
                >
                  {/* Top Row: Rank, Identity, Match Bar, and Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Rank & Buyer Profile */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors",
                          state.selected
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-white/[0.03] border-white/[0.06] text-emerald-400"
                        )}
                      >
                        {buyer.rank}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                            {buyer.name}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
                            {buyer.verificationBadge}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{buyer.country} · {buyer.city}</span>
                          </span>
                          <span>•</span>
                          <span className="text-slate-300 font-mono">
                            {buyer.activeRFQs} active RFQs (${(buyer.demandValueUSD / 1000000).toFixed(1)}M)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Visual Match Bar (BarList pattern) */}
                    <div className="flex items-center gap-3 min-w-[200px] lg:max-w-xs flex-1">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Match Strength</span>
                          <span className="text-emerald-400 font-bold">{matchPercent}%</span>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                            style={{ width: `${matchPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectBuyer(buyer);
                        }}
                        className="h-8 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateTradeRequest(buyer);
                        }}
                        className="h-8 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Create Trade Request</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Match Signals / Explanation */}
                  {buyer.matchSignals && buyer.matchSignals.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.04] text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500">Signals:</span>
                      {buyer.matchSignals.map((signal, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05] text-slate-300"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span>{signal}</span>
                        </span>
                      ))}
                    </div>
                  )}
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

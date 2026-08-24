import React from "react";
import { DestinationCountryInsight } from "@/services/api/aiService";
import { 
  Globe2, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Ship, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryOpportunityCardProps {
  rank: number;
  data: DestinationCountryInsight;
  onSelect: (data: DestinationCountryInsight) => void;
  userCommodity?: string;
  userQuantityKg?: number;
}

// Map ISO3 to Country Flag Emoji
export const ISO3_FLAG_MAP: Record<string, string> = {
  ARE: "🇦🇪",
  SAU: "🇸🇦",
  USA: "🇺🇸",
  GBR: "🇬🇧",
  SGP: "🇸🇬",
  DEU: "🇩🇪",
  JPN: "🇯🇵",
  ITA: "🇮🇹",
  NLD: "🇳🇱",
  BGD: "🇧🇩",
  IRN: "🇮🇷",
  EGY: "🇪🇬",
  MYS: "🇲🇾",
  IDN: "🇮🇩",
  VNM: "🇻🇳",
  FRA: "🇫🇷",
  ESP: "🇪🇸",
  CAN: "🇨🇦",
  AUS: "🇦🇺",
  IND: "🇮🇳",
};

export const CountryOpportunityCard: React.FC<CountryOpportunityCardProps> = ({
  rank,
  data,
  onSelect,
  userCommodity = "Commodity",
  userQuantityKg = 1000,
}) => {
  const { destination, forecast, scores, risk, pros, cons } = data;
  const flag = ISO3_FLAG_MAP[destination.iso3] || "🌐";
  const finalScore = scores.final_score || 80;
  
  // Format tonnage and currency
  const annualDemandMT = Math.round(forecast.annual_market_demand_kg / 1000).toLocaleString();
  const fobPrice = forecast.expected_fob_price_usd_per_kg.toFixed(2);
  const estRevenue = Math.round(userQuantityKg * forecast.expected_fob_price_usd_per_kg).toLocaleString();

  // Score color tiers
  const getScoreBadge = (score: number) => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (score >= 70) return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    if (score >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  };

  return (
    <div
      onClick={() => onSelect(data)}
      className="group relative rounded-2xl bg-[#0C121D] border border-white/[0.08] hover:border-sky-500/40 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 cursor-pointer flex flex-col justify-between space-y-4"
    >
      {/* ── Top Header Strip ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono font-bold text-xs text-slate-300">
            #{String(rank).padStart(2, "0")}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{flag}</span>
              <h4 className="font-display font-bold text-base text-white group-hover:text-sky-300 transition-colors">
                {destination.country_name}
              </h4>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-slate-400 border border-white/[0.08]">
                {destination.iso3}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {destination.region || "Global Corridor"} · {destination.currency || "USD"} Settlement
            </p>
          </div>
        </div>

        {/* Opportunity Score Pill */}
        <div className="text-right flex flex-col items-end">
          <div className={cn("px-2.5 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1", getScoreBadge(finalScore))}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{finalScore.toFixed(1)} / 100</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Opportunity Score</span>
        </div>
      </div>

      {/* ── Key Forecast Metrics Grid ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 py-2 border-y border-white/[0.06] text-xs">
        <div className="p-2.5 rounded-xl bg-[#070A0E] border border-white/[0.04]">
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Annual Demand</span>
          <span className="font-mono font-bold text-white text-sm">{annualDemandMT} MT</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#070A0E] border border-white/[0.04]">
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Expected FOB</span>
          <span className="font-mono font-bold text-sky-400 text-sm">${fobPrice} / kg</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#070A0E] border border-white/[0.04]">
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Est. Revenue ({userQuantityKg.toLocaleString()} kg)</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">${estRevenue}</span>
        </div>
      </div>

      {/* ── Pros & Cons Snapshot ────────────────────────────────────────── */}
      <div className="space-y-2 text-xs">
        {/* Top Pro */}
        {pros && pros.length > 0 && (
          <div className="flex items-start gap-2 text-emerald-300/90 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{pros[0]}</span>
          </div>
        )}

        {/* Top Con / Caution */}
        {cons && cons.length > 0 && (
          <div className="flex items-start gap-2 text-amber-300/90 font-sans">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{cons[0]}</span>
          </div>
        )}
      </div>

      {/* ── Card Footer CTA ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs font-mono text-slate-400 group-hover:text-sky-300 transition-colors">
        <span className="flex items-center gap-1.5 text-[11px]">
          {scores.risk_penalty > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-bold">
                Risk Penalty: -{scores.risk_penalty} pts [{risk.risk_level || "MEDIUM"}]
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">
                Risk Cleared · 0 Penalty [{risk.risk_level || "LOW"}]
              </span>
            </>
          )}
        </span>

        <span className="flex items-center gap-1 font-bold text-sky-400">
          <span>View Country Dossier</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};

export default CountryOpportunityCard;

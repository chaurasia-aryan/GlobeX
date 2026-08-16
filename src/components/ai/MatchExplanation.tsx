import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Sparkles, CheckCircle2 } from "lucide-react";

interface MatchExplanationProps {
  matchScore?: number;
  productSimilarity?: number;
  priceCompatibility?: number;
  certificationMatch?: number;
  routeCompatibility?: number;
  corridorHistory?: string;
}

export function MatchExplanation({
  matchScore = 94,
  productSimilarity = 96,
  priceCompatibility = 91,
  certificationMatch = 100,
  routeCompatibility = 88,
  corridorHistory = "The exporter has successfully delivered 18 shipments along the India ➔ UAE corridor with zero disputes.",
}: MatchExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-xs font-mono text-[var(--accent)] hover:text-emerald-300 transition-colors group cursor-pointer">
        <span className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Why this match? ({matchScore}%)
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "transform rotate-180 text-emerald-400" : "text-[var(--text-tertiary)]"
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2.5 pb-1 space-y-2 border-t border-white/[0.06] mt-1.5 font-sans">
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span>Product & Spec Similarity</span>
            <span className="font-mono font-bold text-white">{productSimilarity}%</span>
          </div>
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span>Price & Terms Compatibility</span>
            <span className="font-mono font-bold text-white">{priceCompatibility}%</span>
          </div>
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span>Food Safety / Cert Match</span>
            <span className="font-mono font-bold text-emerald-400">{certificationMatch}%</span>
          </div>
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span>Route & Port Readiness</span>
            <span className="font-mono font-bold text-white">{routeCompatibility}%</span>
          </div>
        </div>

        <p className="text-[10px] font-mono text-[var(--text-tertiary)] pt-1 flex items-start gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
          <span>{corridorHistory}</span>
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default MatchExplanation;

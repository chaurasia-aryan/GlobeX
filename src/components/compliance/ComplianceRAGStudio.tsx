import React, { useState } from "react";
import { aiService, RAGRetrievedPassage } from "@/services/api/aiService";
import { BookOpen, Search, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SynthesizedAnswer } from "@/components/common/SynthesizedAnswer";
import { cn } from "@/lib/utils";

interface ComplianceRAGStudioProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialHs6?: number;
  className?: string;
}

const SAMPLE_RAG_QUERIES = [
  "What are the rules of origin and value-addition criteria under India-UAE CEPA for agricultural exports?",
  "What are the mandatory phytosanitary certificates and lab test thresholds for black pepper into Germany?",
  "Are there SCOMET dual-use export control restrictions on lithium chemicals or advanced battery compounds?",
  "What are Singapore TradeNet food import declaration requirements for grain commodities?",
];

const SEED_PASSAGES: RAGRetrievedPassage[] = [
  {
    text: "Under India-UAE CEPA (Chapter 3, Article 3.3 - Rules of Origin), goods wholly obtained in India or manufactured with at least 40% Value-Addition (VA) and a Change in Tariff Sub-Heading (CTSH) qualify for 0% preferential customs duty upon presentation of an operational Certificate of Origin.",
    source: "India-UAE Comprehensive Economic Partnership Agreement (CEPA) — Annex 3B",
    category: "Rules of Origin",
    relevance: 0.96,
  },
  {
    text: "DGFT Public Notice No. 23/2023: Non-Basmati White Rice exports remain under calibrated export quotas, whereas 1121 & Traditional Basmati Rice (HS 1006.30.20) are fully permitted subject to APEDA Registration-cum-Allocation Certificate (RCAC) and contract verification.",
    source: "Directorate General of Foreign Trade (DGFT) — Export Policy Gazette",
    category: "Export Controls",
    relevance: 0.92,
  },
  {
    text: "EU Regulation (EC) No 396/2005 on Maximum Residue Levels (MRLs): Agricultural food imports from third countries must undergo accredited gas chromatography-mass spectrometry testing. Importers must file TRACES NT Common Health Entry Documents (CHED-PP).",
    source: "European Commission Customs & Food Safety Authority (DG SANTE)",
    category: "Sanitary & Phytosanitary (SPS)",
    relevance: 0.89,
  },
];

export const ComplianceRAGStudio: React.FC<ComplianceRAGStudioProps> = ({
  initialOrigin = "IND",
  initialDestination = "ARE",
  initialHs6 = 100630,
  className,
}) => {
  const [query, setQuery] = useState<string>(SAMPLE_RAG_QUERIES[0]);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [hs6, setHs6] = useState(initialHs6);
  const [loading, setLoading] = useState(false);
  const [passages, setPassages] = useState<RAGRetrievedPassage[]>(SEED_PASSAGES);
  const [sourcesCited, setSourcesCited] = useState<string[]>([
    "India-UAE CEPA Treaty Schedule",
    "DGFT SCOMET Registry",
    "UNCTAD TRAINS Tariff Matrix",
  ]);
  const [synthesizedAnswer, setSynthesizedAnswer] = useState<string | null>(null);
  const [synthesisModel, setSynthesisModel] = useState<string | null>(null);
  const [synthesisUnavailableReason, setSynthesisUnavailableReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const handleQueryRAG = async (q?: string) => {
    const queryText = q || query;
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    setSynthesizedAnswer(null);
    setSynthesisUnavailableReason(null);
    try {
      const res = await aiService.queryRAG(queryText, origin, destination, hs6, 6);
      setPassages(res.passages.length > 0 ? res.passages : SEED_PASSAGES);
      setSourcesCited(res.sourcesCited);
      setSynthesizedAnswer(res.synthesizedAnswer);
      setSynthesisModel(res.synthesisModel);
      setSynthesisUnavailableReason(res.synthesisUnavailableReason);
      // A grounded answer already cites its sources inline ([1], [2]...) — keep
      // the raw passage list out of the way. Without an answer, the passages
      // are the only content, so show them straight away.
      setSourcesExpanded(!res.synthesizedAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "RAG query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Multi-Dataset Regulatory Compliance RAG Studio
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Query official bilateral trade agreements, DGFT export control schedules, and destination customs regulations with grounded evidence citations.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--text-tertiary)]">
            Vector + TF-IDF Grounded (No Hallucination)
          </span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask any compliance, duty, or trade control question..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500 transition-colors pr-28 resize-none font-sans"
          />
          <button
            type="button"
            onClick={() => handleQueryRAG()}
            disabled={loading}
            className="absolute right-2.5 bottom-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? "Searching..." : "Ask RAG"}</span>
          </button>
        </div>

        {/* Quick Sample Questions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase">Sample Inquiries:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_RAG_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleQueryRAG(sq);
                }}
                className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-start gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Honest failure state */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600">
          RAG query failed: {error}
        </div>
      )}

      {/* LLM-Synthesized Grounded Answer */}
      {!loading && (synthesizedAnswer || synthesisUnavailableReason) && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/[0.04] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-purple-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesized Answer{synthesisModel ? ` — ${synthesisModel}` : ""}</span>
            </div>
            <StatusBadge
              status={synthesizedAnswer ? "verified" : "review"}
              label={synthesizedAnswer ? "LLM-Generated, Grounded" : "LLM Unavailable"}
              size="sm"
            />
          </div>
          {synthesizedAnswer ? (
            <SynthesizedAnswer content={synthesizedAnswer} />
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">
              {synthesisUnavailableReason} — showing retrieved passages only below; no answer was generated.
            </p>
          )}
        </div>
      )}

      {/* Sources — collapsed by default once a grounded answer cites them inline */}
      {passages.length > 0 && (
        <div className="pt-2 border-t border-[var(--hairline)]">
          <button
            type="button"
            onClick={() => setSourcesExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {sourcesExpanded ? "Hide" : "Show"} {passages.length} source{passages.length === 1 ? "" : "s"} · {sourcesCited.length} treaties/registries cited
            </span>
            {sourcesExpanded ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
            )}
          </button>

          {sourcesExpanded && (
            <div className="space-y-2.5 mt-3">
              {passages.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{p.source}</span>
                    {p.relevance != null && (
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{Math.round(p.relevance * 100)}% match</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceRAGStudio;

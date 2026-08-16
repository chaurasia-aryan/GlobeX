import { useState } from "react";
import { Search, ArrowRight, HelpCircle, CheckCircle2, X } from "lucide-react";
import { Link } from "react-router-dom";

interface AIMatchResultsPanelProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

export const AIMatchResultsPanel = ({
  initialQuery = "I need 500 tonnes of premium basmati rice from a verified Indian exporter with food certifications.",
  onSearch,
}: AIMatchResultsPanelProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [showExplainDrawer, setShowExplainDrawer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const breakdownFactors = [
    { label: "Product Compatibility", score: "+24", max: 25, desc: "1121 Extra Long Grain meets exact grade specification." },
    { label: "Quantity & Capacity Fit", score: "+19", max: 20, desc: "Exporter has 5,000 tonnes ready stock, fulfilling 500t MOQ." },
    { label: "Target Price Fit", score: "+17", max: 20, desc: "$1,100 / tonne aligns within 2.5% of prevailing FOB quotes." },
    { label: "Required Certifications", score: "+14", max: 15, desc: "Active ISO 22000, FSSAI, and Halal credentials on file." },
    { label: "Historical Trust Weight", score: "+12", max: 15, desc: "342 completed shipments with zero unarbitrated disputes." },
    { label: "Risk Mitigation Deduction", score: "-2", max: 0, desc: "Minor deduction for monsoon season maritime transit buffer." },
  ];

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onSearch) onSearch(query);
    }, 300);
  };

  return (
    <div className="p-6 glass-panel space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)]">
          Semantic Trade Search
        </h3>
        <p className="text-xs text-[var(--text-secondary)] font-sans">
          Natural-language trade discovery across verified global suppliers.
        </p>
      </div>

      {/* Query Input */}
      <form onSubmit={handleQuerySubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type cross-border trade intent in natural language..."
            className="flex-1 px-4 py-2.5 glass-panel-raised focus:border-[var(--hairline-strong)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all outline-none font-sans"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="neo-btn px-6 py-2.5 text-[var(--accent)] hover:text-white font-sans font-semibold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <Search className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Matching..." : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Top Ranked Result: Background Shift (Level 2), not nested card */}
      <div className="p-4 glass-panel-raised space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans font-semibold text-[var(--accent)]">TOP RANKED MATCH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
            </div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">
              ABC Global Exports Ltd — 1121 Steam Basmati Rice
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Mumbai, India • FOB $1,100 / tonne • 500 Tonnes available
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-display font-medium text-[var(--accent)] leading-none">
                94%
              </div>
              <div className="text-[10px] font-sans text-[var(--text-tertiary)] uppercase mt-0.5">AI Match</div>
            </div>

            <button
              type="button"
              onClick={() => setShowExplainDrawer(true)}
              className="neo-btn px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-sans flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Breakdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explainability Drawer */}
      {showExplainDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 glass-panel space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <div>
                <h4 className="font-sans font-semibold text-sm text-[var(--text-primary)]">Match Score Breakdown</h4>
                <p className="text-xs text-[var(--text-secondary)]">Weighted scoring analysis for ABC Global Exports</p>
              </div>
              <button
                onClick={() => setShowExplainDrawer(false)}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {breakdownFactors.map((item) => (
                <div
                  key={item.label}
                  className="p-3 glass-panel-raised space-y-1 font-sans"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                    <span className="font-display font-medium text-xs text-[var(--emerald)]">{item.score} pts</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplainDrawer(false)}
                className="neo-btn px-5 py-2 text-xs font-sans text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchResultsPanel;

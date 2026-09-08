import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import {
  Menu,
  Search,
  BrainCircuit,
  Bell,
  ArrowLeftRight,
  Plus,
  ShieldCheck,
  Sparkles,
  Command,
} from "lucide-react";
import { toast } from "sonner";

interface ModernTopBarProps {
  onToggleSidebar: () => void;
}

export const ModernTopBar: React.FC<ModernTopBarProps> = ({ onToggleSidebar }) => {
  const { activeDirection, setActiveDirection, hasUnreadTradeUpdates } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/export-discover?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleToggleDirection = () => {
    const nextDirection = activeDirection === "Export" ? "Import" : "Export";
    setActiveDirection(nextDirection);
    toast.info(`Switched view to ${nextDirection}er mode`);
  };

  // Human-readable breadcrumbs
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/home") return { section: "Workspace", page: "Command Center" };
    if (path.startsWith("/export-discover")) return { section: "Intelligence", page: "Bilateral Corridor AI" };
    if (path.startsWith("/ml-research")) return { section: "Applied AI", page: "Research & Benchmarks" };
    if (path.startsWith("/discover")) return { section: "Marketplace", page: "Global Listings" };
    if (path.startsWith("/trades")) return { section: "Operations", page: "Trades Pipeline" };
    if (path.startsWith("/export-trades")) return { section: "Operations", page: "Export Deals" };
    if (path.startsWith("/escrow")) return { section: "Settlement", page: "Smart Escrow Vaults" };
    if (path.startsWith("/assess")) return { section: "Risk", page: "Trade Risk Screener" };
    if (path.startsWith("/catalog")) return { section: "Inventory", page: "Product Catalog" };
    if (path.startsWith("/counterparties")) return { section: "Directory", page: "Verified Counterparties" };
    return { section: "GlobeX", page: "Terminal" };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 w-full h-15 bg-[var(--surface-1)]/90 backdrop-blur-xl border-b border-[var(--hairline)] px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile menu toggle + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)] truncate">
          <span>GlobeX</span>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{breadcrumb.section}</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Middle: Fast Search Launcher */}
      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md hidden md:flex items-center relative"
      >
        <Search className="w-4 h-4 absolute left-3 text-[var(--text-tertiary)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search HS codes, commodities, trade corridors (e.g. 1006.30, Basmati)..."
          className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[10px] font-mono text-[var(--text-tertiary)] border border-[var(--hairline)]">
          <span>↵</span>
        </div>
      </form>

      {/* Right: Quick Action Badges */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* ML Hub Shortcut */}
        <Link
          to="/ml-research"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium transition-colors"
        >
          <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
          <span>AI Research Hub</span>
        </Link>

        {/* Direction Switcher Toggle */}
        <button
          type="button"
          onClick={handleToggleDirection}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] hover:border-emerald-500/40 text-xs font-mono text-[var(--text-secondary)] hover:text-emerald-400 transition-colors cursor-pointer"
          title="Toggle view perspective"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>{activeDirection} Mode</span>
        </button>

        {/* Notification indicator */}
        <Link
          to="/trades"
          className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
          title="Active Trade Alerts"
        >
          <Bell className="w-4 h-4" />
          {hasUnreadTradeUpdates && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </Link>

        {/* New Trade Launcher */}
        <Link
          to="/export-discover"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Explore Corridors</span>
        </Link>
      </div>
    </header>
  );
};

export default ModernTopBar;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  Store,
  BrainCircuit,
  ShieldAlert,
  Layers,
  TrendingUp,
  Lock,
  Building2,
  Package,
  ArrowLeftRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  hasUpdate?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const ModernSidebar: React.FC<{
  onCloseMobile?: () => void;
  className?: string;
}> = ({ onCloseMobile, className }) => {
  const { user, logout, activeDirection, setActiveDirection, hasUnreadTradeUpdates } = useWorkspace();
  const location = useLocation();

  const handleToggleDirection = () => {
    const nextDirection = activeDirection === "Export" ? "Import" : "Export";
    setActiveDirection(nextDirection);
    toast.info(`Switched active view to ${nextDirection}er mode`);
  };

  const sections: NavSection[] = [
    {
      title: "Core Workspace",
      items: [
        {
          key: "dashboard",
          label: "Command Center",
          href: "/home",
          icon: LayoutDashboard,
        },
        {
          key: "discover",
          label: "Bilateral Corridor AI",
          href: "/export-discover",
          icon: Compass,
          badge: "CEPA 0%",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
        {
          key: "marketplace",
          label: "Global Marketplace",
          href: "/discover",
          icon: Store,
        },
      ],
    },
    {
      title: "Intelligence & Risk",
      items: [
        {
          key: "ml-research",
          label: "Applied AI Hub",
          href: "/ml-research",
          icon: BrainCircuit,
          badge: "Live Models",
          badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        },
        {
          key: "assess",
          label: "Trade Risk Screener",
          href: "/assess",
          icon: ShieldAlert,
        },
      ],
    },
    {
      title: "Operations & Settlement",
      items: [
        {
          key: "trades",
          label: "All Trades Pipeline",
          href: "/trades",
          icon: Layers,
          hasUpdate: hasUnreadTradeUpdates,
        },
        {
          key: "export-trades",
          label: "Export Outbound",
          href: "/export-trades",
          icon: TrendingUp,
        },
        {
          key: "escrow",
          label: "Programmable Escrow",
          href: "/escrow",
          icon: Lock,
          badge: "EVM Vault",
          badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        },
        {
          key: "catalog",
          label: "Product Catalog",
          href: "/catalog",
          icon: Package,
        },
        {
          key: "counterparties",
          label: "Verified Counterparties",
          href: "/counterparties",
          icon: Building2,
        },
      ],
    },
  ];

  const orgName = user?.companyName || "Aryan Global Trade & Commodity Exports Ltd";

  return (
    <aside
      className={cn(
        "w-64 h-full flex flex-col bg-[var(--surface-1)] border-r border-[var(--hairline)] select-none shrink-0 transition-all",
        className
      )}
    >
      {/* 1. Header Brand & Protocol Badge */}
      <div className="p-4 border-b border-[var(--hairline)]">
        <Link
          to="/home"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg tracking-tight">G</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                Globe<span className="text-emerald-400">X</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] truncate font-mono">
              Bilateral Trade OS
            </p>
          </div>
        </Link>

        {/* Organization Card with Status Indicator */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {orgName}
              </span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" title="Verified Trade Entity" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hardhat 31337
            </span>
            <button
              type="button"
              onClick={handleToggleDirection}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--surface-3)] hover:bg-emerald-500/20 hover:text-emerald-300 text-[var(--text-tertiary)] transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-2.5 h-2.5" />
              <span>{activeDirection}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/home" && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/10 font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors shrink-0",
                          isActive
                            ? "text-emerald-400"
                            : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.hasUpdate && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-mono border",
                            item.badgeColor
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer Profile & Action Bar */}
      <div className="p-3 border-t border-[var(--hairline)] bg-[var(--surface-0)]/60">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {user?.name || "Aryan"}
              </p>
              <p className="text-[10px] text-emerald-400/80 font-mono truncate">
                Admin · Verified
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
              toast.success("Signed out successfully");
            }}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ModernSidebar;

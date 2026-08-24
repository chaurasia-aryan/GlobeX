import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Compass, Gauge, ShieldCheck, Handshake, Landmark } from "lucide-react";

interface RailStep {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefixes: string[];
}

/**
 * Direction-aware lifecycle rail. Same five stages for every org — only the
 * label text forks on `activeDirection`. Route targets follow the Phase-4
 * route table (App.tsx).
 */
interface LifecycleRailProps {
  /** Renders as an always-visible block instead of the desktop-only rail (used inside the mobile drawer). */
  mobile?: boolean;
}

export const LifecycleRail: React.FC<LifecycleRailProps> = ({ mobile = false }) => {
  const { isExporterView } = useWorkspace();
  const location = useLocation();

  const steps: RailStep[] = [
    {
      key: "discover",
      label: isExporterView ? "Discover Markets" : "Discover Suppliers",
      href: "/discover",
      icon: Compass,
      matchPrefixes: ["/discover", "/catalog"],
    },
    {
      key: "assess",
      label: isExporterView ? "Assess Trade" : "Assess Purchase",
      href: "/assess",
      icon: Gauge,
      matchPrefixes: ["/assess"],
    },
    {
      key: "verify",
      label: "Counterparties",
      href: "/counterparties",
      icon: ShieldCheck,
      matchPrefixes: ["/counterparties"],
    },
    {
      key: "deal",
      label: isExporterView ? "Trade Requests" : "Purchase Orders",
      href: "/requests",
      icon: Handshake,
      matchPrefixes: ["/requests", "/trades"],
    },
    {
      key: "settle",
      label: "Settle",
      href: "/escrow",
      icon: Landmark,
      matchPrefixes: ["/escrow", "/disputes", "/ledger"],
    },
  ];

  return (
    <nav
      aria-label="Trade lifecycle"
      className={cn(
        "flex-col gap-1 py-4 pr-3",
        mobile ? "flex w-full" : "hidden lg:flex w-56 shrink-0 border-r border-[var(--hairline)]"
      )}
    >
      {steps.map((step) => {
        const isActive = step.matchPrefixes.some((p) => location.pathname.startsWith(p));
        const Icon = step.icon;
        return (
          <Link
            key={step.key}
            to={step.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors",
              isActive
                ? "bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--brand)]" : "text-[var(--text-tertiary)]")} />
            <span className="truncate">{step.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default LifecycleRail;

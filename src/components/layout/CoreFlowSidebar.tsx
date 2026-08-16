import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LineSidebar, { LineSidebarItem } from "@/components/ui/LineSidebar";
import { cn } from "@/lib/utils";

export interface CoreFlowSidebarProps {
  className?: string;
}

export const CANONICAL_CORE_FLOW_ITEMS: (LineSidebarItem & { routeKey: string })[] = [
  {
    label: "Command Center",
    href: "/dashboard",
    routeKey: "dashboard",
  },
  {
    label: "Trade Discovery",
    href: "/marketplace",
    routeKey: "discovery",
  },
  {
    label: "Trade Requests",
    href: "/trade-requests",
    routeKey: "requests",
  },
  {
    label: "Active Trades",
    href: "/trades/TRD-IND-UAE-550K",
    routeKey: "trades",
  },
  {
    label: "Documents",
    href: "/documents",
    routeKey: "documents",
  },
  {
    label: "Settlement",
    href: "/escrow",
    routeKey: "settlement",
  },
];

export const CoreFlowSidebar: React.FC<CoreFlowSidebarProps> = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active flow step based on current URL path
  const getActiveIndex = (): number => {
    const path = location.pathname;

    if (path === "/dashboard") return 0;
    if (
      path.startsWith("/marketplace") ||
      path.startsWith("/my-listings") ||
      path.startsWith("/export-catalog") ||
      path.startsWith("/market-intelligence") ||
      path.startsWith("/trade-analysis")
    ) {
      return 1;
    }
    if (
      path.startsWith("/trade-requests") ||
      path.startsWith("/trade-intent") ||
      path.startsWith("/get-started")
    ) {
      return 2;
    }
    if (
      path.startsWith("/trades") ||
      path.startsWith("/counterparties") ||
      path.startsWith("/shipments")
    ) {
      return 3;
    }
    if (path.startsWith("/documents")) return 4;
    if (
      path.startsWith("/escrow") ||
      path.startsWith("/blockchain") ||
      path.startsWith("/disputes") ||
      path.startsWith("/arbitrator")
    ) {
      return 5;
    }

    return 0;
  };

  const activeIndex = getActiveIndex();

  const handleItemSelect = (item: string | LineSidebarItem, index: number) => {
    const targetItem = CANONICAL_CORE_FLOW_ITEMS[index];
    if (targetItem?.href) {
      navigate(targetItem.href);
    }
  };

  return (
    <aside
      className={cn(
        "hidden xl:block w-48 shrink-0 sticky top-20 pt-1 select-none",
        className
      )}
      aria-label="Core Trade Workflow Navigation"
    >
      <div className="space-y-3">
        <div className="px-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Trade Lifecycle
        </div>

        <LineSidebar
          items={CANONICAL_CORE_FLOW_ITEMS}
          accentColor="#19D3AE"
          textColor="#8FA3B8"
          markerColor="#2A3948"
          activeColor="#19D3AE"
          showIndex={true}
          showMarker={true}
          proximityRadius={90}
          maxShift={16}
          markerLength={38}
          itemGap={12}
          fontSize={0.82}
          activeIndex={activeIndex}
          onItemSelect={handleItemSelect}
        />
      </div>
    </aside>
  );
};

export default CoreFlowSidebar;

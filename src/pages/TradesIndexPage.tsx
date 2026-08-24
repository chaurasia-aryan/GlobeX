import React from "react";
import { Link } from "react-router-dom";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowUpRight, Workflow } from "lucide-react";

/**
 * Active Trades index (lifecycle step 3).
 *
 * There is no trades API consumed by the frontend yet (see
 * docs/product/user_flow.md §4a — a real, live-tested `trades_api.py`
 * exists, but no route calls it). Until that integration lands, this page
 * honestly lists the single demo trade the rest of the app already uses
 * (`FLAGSHIP_DEMO_TRADE`) rather than fabricating additional fake rows, so
 * every user has somewhere real to browse into instead of being sent
 * straight to a hardcoded trade ID.
 */
export const TradesIndexPage: React.FC = () => {
  const trade = FLAGSHIP_DEMO_TRADE;

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-5 select-none">
        <PageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/home" }, { label: "Active Trades" }]}
          title="Active Trades"
          subtitle="Trades your organization currently has in progress."
        />

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2">
          <Link
            to={`/trades/${trade.id}`}
            className="flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Workflow className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{trade.title}</div>
                <div className="text-xs text-slate-400 font-mono truncate">
                  {trade.id} · {trade.exporterName} &rarr; {trade.importerName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status="active" label={trade.status} />
              <span className="text-xs font-mono text-slate-400">
                {trade.currency} {trade.contractValueUSD.toLocaleString()}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </Link>
        </div>

        <p className="text-xs text-slate-500 px-1">
          This list currently shows one demonstration trade. Once the trade workspace is
          wired to the backend persistence API, this page will list every trade your
          organization is party to.
        </p>
      </div>
    </AppShell>
  );
};

export default TradesIndexPage;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aiService, TradeRecord } from "@/services/api/aiService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ArrowUpRight, Workflow } from "lucide-react";

/**
 * Active Trades index (lifecycle step 3).
 *
 * `GET /api/v1/trades` (src/api/trades_api.py::list_trades) is real but is
 * NOT scoped to the caller's org server-side — it returns every trade in the
 * system. This page filters client-side against the workspace's
 * organizationId. The table itself has no title/port/HS-code columns, so
 * rows show only what's really there (id, counterpart id, amount, status,
 * date) rather than fabricating a trade "title".
 */
export const TradesIndexPage: React.FC = () => {
  const { user } = useWorkspace();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    aiService
      .getTrades({ limit: 100 })
      .then((records) => {
        const mine = user.organizationId
          ? records.filter(
              (t) => t.exporterId === user.organizationId || t.importerId === user.organizationId
            )
          : records;
        setTrades(mine);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load trades."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.organizationId]);

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-5 select-none">
        <PageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/home" }, { label: "Active Trades" }]}
          title="Active Trades"
          subtitle="Trades your organization currently has in progress."
        />

        {loading ? (
          <LoadingSkeleton variant="row" count={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : trades.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="No active trades"
            description="Trades your organization is party to will appear here once created."
          />
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface-1)] p-2">
            {trades.map((trade) => {
              const direction = trade.exporterId === user.organizationId ? "Export" : "Import";
              return (
                <Link
                  key={trade.id}
                  to={`/trades/${trade.id}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] hover:bg-[var(--surface-2)] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--status-verified-bg)] flex items-center justify-center shrink-0" style={{ color: "var(--status-verified)" }}>
                      <Workflow className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {direction} · Trade {trade.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] font-mono truncate">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={trade.status} label={trade.status} />
                    {trade.totalAmount != null && (
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {trade.currency || "USD"} {trade.totalAmount.toLocaleString()}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--brand)] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TradesIndexPage;

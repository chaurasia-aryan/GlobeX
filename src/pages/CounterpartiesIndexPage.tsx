import React from "react";
import { Link } from "react-router-dom";
import { TOP_10_TRUSTED_PARTNERS } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MapPin, ArrowUpRight, Building2 } from "lucide-react";

/**
 * Counterparties index. `/counterparties/:id` previously had no way to be
 * browsed into (see docs/product/user_flow.md §4b) — this lists the same
 * demo partner directory (`TOP_10_TRUSTED_PARTNERS`) the detail page and
 * marketplace already use, each linking through to its detail route.
 */
export const CounterpartiesIndexPage: React.FC = () => {
  return (
    <AppShell maxWidth="lg">
      <div className="space-y-5 select-none">
        <PageHeader
          breadcrumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "Counterparties" }]}
          title="Counterparties"
          subtitle="Trading partners and their trust / risk profiles."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOP_10_TRUSTED_PARTNERS.map((partner) => (
            <Link
              key={partner.id}
              to={`/counterparties/${partner.id}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{partner.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{partner.city}, {partner.country}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={partner.kycStatus} size="sm" />
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default CounterpartiesIndexPage;

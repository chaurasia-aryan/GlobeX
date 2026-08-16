import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import {
  Coins,
  Activity,
  AlertTriangle,
  Brain,
  Ship,
  FileCheck2,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  MapPin,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, isBuyer, isExporter, roleLabel, roleAccentColor } = useWorkspace();

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <PageHeader
          section={roleLabel}
          title="Command Center"
          subtitle={`Connected enterprise: ${user.companyName} (${user.country})`}
          badge={
            <StatusBadge
              status="verified"
              label="EVM Protocol Connected"
              size="md"
            />
          }
          action={
            <Link to="/get-started">
              <PrimaryAction
                icon={<PlusCircle className="w-4 h-4" />}
                iconPosition="left"
              >
                {isBuyer ? "New Import Trade" : "New Export Listing"}
              </PrimaryAction>
            </Link>
          }
        />

        {/* ── High-Signal Portfolio KPIs ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Total Exposure</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              $14.2M <span className="text-xs font-sans text-slate-400 font-normal">USD</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+2.4% this month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Active Contracts</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              24 <span className="text-xs font-sans text-slate-400 font-normal">Trades</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              8 in Transit · 16 in Customs
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>Action Items</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
              1 Flagged
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Weight variance in Trade #889
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
              <span>AI Trust Index</span>
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              94 / 100
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Zero Arbitrated Disputes
            </div>
          </div>

        </div>

        {/* ── Primary Immediate Decision Card (WHAT SHOULD I DO NEXT?) ─────── */}
        <div className="p-5 rounded-2xl bg-[#0C121D] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE SHIPMENT · STEP 5 OF 6
              </span>
              <span className="text-xs font-mono text-slate-400">#{FLAGSHIP_DEMO_TRADE.id}</span>
            </div>
            <h2 className="text-lg font-display font-bold text-white">
              {FLAGSHIP_DEMO_TRADE.title} — In Transit across Arabian Sea
            </h2>
            <p className="text-xs text-slate-400">
              Vessel MSC ANNA is on schedule. Arrival at Jebel Ali Port in 2 days. 100% verified documents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/trades/TRD-IND-UAE-550K">
              <PrimaryAction size="md">
                Open Active Trade →
              </PrimaryAction>
            </Link>
          </div>
        </div>

        {/* ── Active Trade Contracts (Flat List, No Nested Boxes) ──────────── */}
        <Section
          title="Active Trade Contracts"
          subtitle="Real-time execution status, customs status, and escrow locks"
          action={
            <Link
              to="/marketplace"
              className="text-xs font-mono text-emerald-400 hover:underline"
            >
              Browse Marketplace →
            </Link>
          }
        >
          <div className="divide-y divide-white/[0.06] rounded-2xl bg-[#0B1019] border border-white/[0.08] overflow-hidden">
            
            {/* Trade 1: Flagship */}
            <Link
              to="/trades/TRD-IND-UAE-550K"
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Ship className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-display font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {FLAGSHIP_DEMO_TRADE.product} (500 MT)
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>{FLAGSHIP_DEMO_TRADE.id}</span>
                    <span>•</span>
                    <span>India (JNPT) → UAE (Jebel Ali)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-mono font-bold text-white">$550,000 USD</div>
                  <div className="text-[11px] font-mono text-emerald-400">Escrow Protected</div>
                </div>

                <StatusBadge status="in_transit" label="Step 5: In Transit" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            {/* Trade 2: Lithium Carbonate */}
            <Link
              to="/documents"
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-display font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    Battery Grade Lithium Carbonate 99.5%
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span>TRD-LTC-CL-992</span>
                    <span>•</span>
                    <span>Chile → Germany (Hamburg)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-mono font-bold text-white">$3,200,000 USD</div>
                  <div className="text-[11px] font-mono text-amber-400">OCR Variance</div>
                </div>

                <StatusBadge status="warning" label="Step 2: Docs Review" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

          </div>
        </Section>

      </div>
    </AppShell>
  );
};

export default DashboardPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import SpecularButton from "@/components/ui/SpecularButton";
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Filter,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RequestStatus = "New" | "Under Review" | "Quoted" | "Accepted" | "Rejected" | "Expired";

interface InboundTradeRequest {
  id: string;
  buyerName: string;
  buyerCountry: string;
  buyerCity: string;
  productName: string;
  hsCode: string;
  quantityMT: number;
  targetPriceUSD: number;
  totalValueUSD: number;
  route: string;
  incoterm: string;
  status: RequestStatus;
  receivedAge: string;
  complianceCertifications: string[];
  escrowToken: string;
}

const INBOUND_REQUESTS_DATA: InboundTradeRequest[] = [
  {
    id: "RFQ-2026-8801",
    buyerName: "Al-Futtaim Global Trade LLC",
    buyerCountry: "UAE",
    buyerCity: "Dubai",
    productName: "1121 Steam Extra Long Grain Basmati Rice",
    hsCode: "1006.30.20",
    quantityMT: 500,
    targetPriceUSD: 1100,
    totalValueUSD: 550000,
    route: "Mumbai (JNPT) ➔ Dubai (Jebel Ali)",
    incoterm: "CIF",
    status: "Under Review",
    receivedAge: "2 hours ago",
    complianceCertifications: ["APEDA", "FSSAI", "ISO 22000", "Halal"],
    escrowToken: "USDC",
  },
  {
    id: "RFQ-2026-8802",
    buyerName: "Jeddah Food Merchants Co.",
    buyerCountry: "Saudi Arabia",
    buyerCity: "Jeddah",
    productName: "Sugandha White Sella Basmati Rice",
    hsCode: "1006.30.20",
    quantityMT: 200,
    targetPriceUSD: 940,
    totalValueUSD: 188000,
    route: "Mumbai (JNPT) ➔ Jeddah Islamic Port",
    incoterm: "CIF",
    status: "New",
    receivedAge: "5 hours ago",
    complianceCertifications: ["Phytosanitary", "SASO", "Halal"],
    escrowToken: "USDC",
  },
  {
    id: "RFQ-2026-8803",
    buyerName: "Bremen Grain Processing B.V.",
    buyerCountry: "Germany",
    buyerCity: "Bremen",
    productName: "Organic Durum Wheat Grain Milling Grade",
    hsCode: "1001.19.00",
    quantityMT: 300,
    targetPriceUSD: 360,
    totalValueUSD: 108000,
    route: "Kandla (INIXY) ➔ Hamburg Port",
    incoterm: "CIF",
    status: "Quoted",
    receivedAge: "1 day ago",
    complianceCertifications: ["EU Organic", "Non-GMO", "USDA Organic"],
    escrowToken: "USDC",
  },
  {
    id: "RFQ-2026-8804",
    buyerName: "Gruppo Albini Milano SpA",
    buyerCountry: "Italy",
    buyerCity: "Milan",
    productName: "Combed Organic Cotton Yarn Ne 30s",
    hsCode: "5205.23.00",
    quantityMT: 80,
    targetPriceUSD: 4200,
    totalValueUSD: 336000,
    route: "Surat ➔ Genoa Port",
    incoterm: "FOB",
    status: "Accepted",
    receivedAge: "3 days ago",
    complianceCertifications: ["GOTS Organic", "OEKO-TEX 100"],
    escrowToken: "USDC",
  },
];

export const TradeIntentWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWorkspace();
  const [requests, setRequests] = useState<InboundTradeRequest[]>(INBOUND_REQUESTS_DATA);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedRequest, setSelectedRequest] = useState<InboundTradeRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "All") return true;
    return r.status === statusFilter;
  });

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "New":
        return <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 text-[10px] font-mono font-bold">New</span>;
      case "Under Review":
        return <span className="px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/60 text-[10px] font-mono font-bold">Under Review</span>;
      case "Quoted":
        return <span className="px-2 py-0.5 rounded-full bg-sky-950/70 text-sky-400 border border-sky-800/60 text-[10px] font-mono font-bold">Quoted</span>;
      case "Accepted":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono font-bold">Accepted</span>;
      case "Rejected":
        return <span className="px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-400 border border-rose-800/60 text-[10px] font-mono font-bold">Rejected</span>;
      case "Expired":
        return <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-mono">Expired</span>;
    }
  };

  return (
    <AppShell maxWidth="full" className="space-y-6">
      {/* ── Page Header: Strict Received-Only Semantics ───────────────── */}
      <PageHeader
        title="Trade Requests"
        subtitle="Review trade requests received by your organization."
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{requests.filter((r) => r.status === "New" || r.status === "Under Review").length} Inbound Requests Pending</span>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/marketplace">
              <SpecularButton
                variant="outline"
                size="sm"
                radius={10}
              >
                Explore Marketplace →
              </SpecularButton>
            </Link>
          </div>
        }
      />

      {/* ── Status Filters Row (Quiet, clean horizontal control) ───────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0C121D] border border-white/[0.07]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["All", "New", "Under Review", "Quoted", "Accepted", "Rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer",
                statusFilter === status
                  ? "bg-white/[0.1] text-white font-semibold border border-white/[0.12]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Showing {filteredRequests.length} received inquiries
        </span>
      </div>

      {/* ── Received Request List ─────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredRequests.map((rfq) => (
          <div
            key={rfq.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#0C121D] border border-white/[0.07] hover:border-white/[0.12] transition-colors space-y-4 font-sans select-none"
          >
            {/* Top Row: Buyer, Product, Value, Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">{rfq.id}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-white font-medium">{rfq.buyerName}</strong>
                    <span className="text-slate-400">({rfq.buyerCountry})</span>
                  </div>
                  <span>·</span>
                  {getStatusBadge(rfq.status)}
                </div>

                <h3 className="font-display font-bold text-base text-white">
                  {rfq.quantityMT.toLocaleString()} MT · {rfq.productName}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{rfq.route} ({rfq.incoterm})</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{rfq.receivedAge}</span>
                  </span>
                </div>
              </div>

              {/* Right: Value & Currency */}
              <div className="text-left sm:text-right shrink-0 space-y-0.5">
                <div className="text-lg font-mono font-bold text-emerald-400">
                  ${rfq.totalValueUSD.toLocaleString()} USD
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  ${rfq.targetPriceUSD.toLocaleString()} / MT · {rfq.escrowToken}
                </div>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Compliance:</span>
              {rfq.complianceCertifications.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-md bg-[#070A0E] border border-white/[0.05] text-[10px] font-mono text-slate-300"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Bottom Actions Row: Actual Business Responses */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(rfq.id, "Accepted")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  Accept & Lock Escrow
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(rfq.id, "Quoted")}
                  className="px-3 py-1.5 rounded-xl bg-sky-950/50 hover:bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Submit Quotation
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(rfq.id, "Rejected")}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>

              <Link to="/trades/TRD-IND-UAE-550K">
                <SpecularButton
                  size="xs"
                  radius={10}
                  variant="outline"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Review Staged Contract
                </SpecularButton>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default TradeIntentWizardPage;

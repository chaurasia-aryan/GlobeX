import { useParams, Link } from "react-router-dom";
import { TOP_10_TRUSTED_PARTNERS } from "@/data/mockTradeData";
import TrustScoreGauge from "@/components/trust/TrustScoreGauge";
import TradeRiskCompositeCard from "@/components/risk/TradeRiskCompositeCard";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Award,
  History,
  FileCheck2,
  Mail,
  Coins,
  ArrowRight,
  Home,
} from "lucide-react";

export const CounterpartyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const partner = TOP_10_TRUSTED_PARTNERS.find((p) => p.id === id) || TOP_10_TRUSTED_PARTNERS[0];

  return (
    <div className="min-h-screen text-[var(--text-primary)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full select-none font-sans relative z-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              <Home className="w-3.5 h-3.5" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/marketplace" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              Marketplace
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs text-[var(--text-primary)] font-medium max-w-[200px] truncate">
              {partner.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 bg-card/90 border-border/80 rounded-2xl shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-bold">
                KYC VERIFIED TIER-1
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">REG: {partner.registrationNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{partner.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {partner.city}, {partner.country}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {partner.contactEmail}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Historical Trade Volume</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400">
              ${(partner.totalTradeVolumeUSD / 1000000).toFixed(1)}M USD
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {partner.description}
        </p>

        {/* Credentials & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Years in Operation</div>
            <div className="text-lg font-mono font-bold text-foreground">{partner.yearsActive} Years</div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Completed Shipments</div>
            <div className="text-lg font-mono font-bold text-foreground">{partner.tradeHistoryCount} Trades</div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Arbitrated Disputes</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{partner.disputeCount} Disputes</div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">GSTIN / Tax ID</div>
            <div className="text-xs font-mono font-bold text-foreground truncate">{partner.gstin || "VERIFIED"}</div>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-1.5 pt-2">
          <div className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Verified Accreditations & Quality Certifications
          </div>
          <div className="flex flex-wrap gap-2">
            {partner.certifications.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>{c}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Risk Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustScoreGauge score={partner.trustScore} title="Institutional Trust Score" />
        <TradeRiskCompositeCard score={partner.riskScore} />
      </div>
    </div>
  );
};

export default CounterpartyDetailPage;

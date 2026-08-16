import { useParams, Link } from "react-router-dom";
import { DEMO_LISTINGS, TOP_10_TRUSTED_PARTNERS } from "@/data/mockTradeData";
import TrustScoreGauge from "@/components/trust/TrustScoreGauge";
import TradeRiskCompositeCard from "@/components/risk/TradeRiskCompositeCard";
import ComplianceChecklistWidget from "@/components/compliance/ComplianceChecklistWidget";
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
  MapPin,
  ShieldCheck,
  Package,
  Calendar,
  Anchor,
  FileCheck2,
  Coins,
  ArrowRight,
  Home,
} from "lucide-react";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const listing = DEMO_LISTINGS.find((p) => p.id === id) || DEMO_LISTINGS[0];
  const supplier = TOP_10_TRUSTED_PARTNERS.find((c) => c.id === listing.exporterId) || TOP_10_TRUSTED_PARTNERS[0];

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
              {listing.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Product Header Card */}
      <div className="glass-panel p-6 bg-card/90 border-border/80 rounded-2xl shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-primary border border-border">
                {listing.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                VERIFIED EXPORT READY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{listing.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{listing.exporterName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {listing.exporterCity}, {listing.exporterCountry}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">FOB Unit Price</div>
              <div className="text-2xl font-mono font-extrabold text-foreground">
                ${listing.unitPriceUSD.toLocaleString()}{" "}
                <span className="text-xs text-muted-foreground font-normal">/ {listing.unit}</span>
              </div>
            </div>

            <Link
              to="/trades/TRD-IND-UAE-550K"
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <Coins className="w-4 h-4" />
              <span>Initiate Trade ($550k)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Overview & Technical Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">HS Classification</div>
            <div className="text-sm font-mono font-bold text-foreground">{listing.hsCode}</div>
            <div className="text-[10px] font-mono text-emerald-400">0% CEPA Tariff Rate</div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Minimum Order Qty (MOQ)</div>
            <div className="text-sm font-mono font-bold text-foreground">
              {listing.minimumOrderQuantity} {listing.unit}s
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">Available: {listing.availableQuantity.toLocaleString()} {listing.unit}s</div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Origin Port / Logistics</div>
            <div className="text-sm font-mono font-bold text-foreground truncate">{listing.originPort}</div>
            <div className="text-[10px] font-mono text-primary">Lead Time: {listing.leadTimeDays} Days</div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">AI Match Fit</div>
            <div className="text-sm font-mono font-bold text-cyan-400">{listing.aiMatchScore || 94}% Compatibility</div>
            <div className="text-[10px] font-mono text-muted-foreground">Full Specs Match</div>
          </div>
        </div>

        {/* Detailed Specs Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Product Specifications & Laboratory Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            {Object.entries(listing.specs).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">{key}:</span>
                <span className="font-bold text-foreground">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-1.5 pt-2">
          <div className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Accreditations & Certificates
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.certifications.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs font-mono font-medium text-foreground flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>{c}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Trust & Risk Assessment Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustScoreGauge score={supplier.trustScore} title="Supplier Trust Dossier" />
        <TradeRiskCompositeCard score={supplier.riskScore} />
      </div>

      {/* Regulatory & Compliance Widget */}
      <ComplianceChecklistWidget hsCode={listing.hsCode} productName={listing.title} />
    </div>
  );
};

export default ProductDetailPage;

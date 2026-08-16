import DisputeResolutionSuite from "@/components/disputes/DisputeResolutionSuite";
import { Scale, Gavel, ShieldAlert, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const DisputesPage = () => {
  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--text-primary)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full select-none font-sans">
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
            <BreadcrumbPage className="text-xs text-[var(--text-primary)] font-medium">
              Disputes & Arbitration
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            HUMAN-IN-THE-LOOP ARBITRATION
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Dispute Resolution & Arbitrator Portal
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          AI synthesizes weighbridge discrepancy proofs, OCR variances, and contract clauses to provide settlement recommendations. Authorized Human Arbitrators issue legally binding verdicts.
        </p>
      </div>

      <DisputeResolutionSuite />
    </div>
  );
};

export default DisputesPage;

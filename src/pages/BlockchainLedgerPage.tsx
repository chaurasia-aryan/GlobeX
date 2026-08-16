import PublicTradeLedgerTable from "@/components/blockchain/PublicTradeLedgerTable";
import { Database, ShieldCheck, Hash, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const BlockchainLedgerPage = () => {
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
              Blockchain Audit Ledger
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
            ON-CHAIN AUDIT TRAIL
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Public Trade & Evidence Ledger
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Verify cryptographic proof of document registration, escrow locks, vessel dispatch timestamps, and smart contract payment executions.
        </p>
      </div>

      <PublicTradeLedgerTable />
    </div>
  );
};

export default BlockchainLedgerPage;

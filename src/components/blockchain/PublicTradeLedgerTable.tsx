import { useState } from "react";
import { AuditLogEntry } from "@/types/trade";
import { DEMO_AUDIT_LOGS } from "@/data/mockTradeData";
import { Database, ShieldCheck, ExternalLink, CheckCircle2, Hash, Layers } from "lucide-react";

interface PublicTradeLedgerTableProps {
  logs?: AuditLogEntry[];
}

export const PublicTradeLedgerTable = ({ logs = DEMO_AUDIT_LOGS }: PublicTradeLedgerTableProps) => {
  return (
    <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Public Immutable Trade & Evidence Ledger
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                EVM PROOF-OF-STAKE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cryptographic SHA-256 fingerprint anchoring for tamper-evident trade milestone auditing.
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-muted-foreground">
          Live Network: <strong className="text-foreground">Ethereum Sepolia</strong> • Gas: <span className="text-cyan-400">12 Gwei</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
              <th className="pb-3 px-3">Event Type</th>
              <th className="pb-3 px-3">Timestamp (UTC)</th>
              <th className="pb-3 px-3">Block Number</th>
              <th className="pb-3 px-3">Transaction Hash</th>
              <th className="pb-3 px-3">Signer Address</th>
              <th className="pb-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-secondary/40 transition-colors">
                <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{log.event}</span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">{log.timestamp}</td>
                <td className="py-3 px-3 text-cyan-400 font-bold">#{log.blockNumber}</td>
                <td className="py-3 px-3 text-primary truncate max-w-[140px] select-all">
                  {log.txHash}
                </td>
                <td className="py-3 px-3 text-muted-foreground truncate max-w-[120px] select-all">
                  {log.signerAddress}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{log.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicTradeLedgerTable;

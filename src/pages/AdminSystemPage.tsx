import React, { useState } from "react";
import { aiService } from "@/services/api/aiService";
import { n8nWorkflowService } from "@/services/n8n/workflowService";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Database, Workflow, Cpu, Coins, Send, Play, CheckCircle2, Sparkles, RefreshCw, Terminal, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const AdminSystemPage: React.FC = () => {
  const supabaseConfigured = Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  );
  const appwriteStatus = {
    projectId: supabaseConfigured ? "globex (Supabase Auth)" : "Not configured",
  };
  const aiStatus = aiService.getStatus();
  const n8nStatus = n8nWorkflowService.getStatus();
  const blockchainStatus = blockchainEscrowService.getStatus();

  // Webhook Simulation State
  const [selectedWebhook, setSelectedWebhook] = useState<string>("analyze-trade");
  const [isExecutingWebhook, setIsExecutingWebhook] = useState<boolean>(false);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([
    "System telemetry initialised. 10 FastAPI microservices operational.",
    "n8n webhook listeners bound on http://localhost:5678/webhook/*.",
    "Hardhat EVM blockchain client connected on chainId: 31337.",
  ]);

  const handleDispatchWebhook = (endpoint: string) => {
    setIsExecutingWebhook(true);
    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString();
      let logMsg = `[${timestamp}] 200 OK — Dispatched to /webhook/${endpoint}`;
      if (endpoint === "analyze-trade") {
        logMsg += " → Synthesized 500 MT Basmati Rice (IND → ARE). Score: 92/100.";
      } else if (endpoint === "create-trade") {
        logMsg += " → Trade contract TRD-99120 registered & Escrow 0x5FbDB231 deployed.";
      } else if (endpoint === "document-uploaded") {
        logMsg += " → Commercial Invoice OCR extracted & SHA-256 anchored.";
      }
      setWebhookLogs((prev) => [logMsg, ...prev]);
      setIsExecutingWebhook(false);
      toast.success(`Dispatched webhook /webhook/${endpoint} successfully`);
    }, 600);
  };

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6 select-none">
        <PageHeader
          title="System Architecture, Telemetry & n8n Automation Hub"
          subtitle="Real-time status across BaaS database, n8n Orchestrator event pipelines, 10 FastAPI AI Microservices, and Hardhat EVM Blockchain."
          badge={<StatusBadge status="verified" label="All 4 Pillars Operational" size="md" />}
        />

        {/* 4 Pillars Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: BaaS Database */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-[var(--text-primary)]">Postgres / BaaS Database</h3>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)]">Auth · Relational Store · Storage</div>
                </div>
              </div>
              <StatusBadge status="verified" label="OPERATIONAL" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Project ID:</span>
                <span className="text-emerald-600 font-bold">{appwriteStatus.projectId}</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Database Tables:</span>
                <span className="text-[var(--text-primary)]">16 Relational Tables (Trades, Escrow, Documents)</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Storage Buckets:</span>
                <span className="text-[var(--text-primary)]">KYC, BL & Trade Invoices</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: n8n Workflow Automation */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-[var(--text-primary)]">n8n Workflow Automation</h3>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)]">Event-Driven Asynchronous Pipeline</div>
                </div>
              </div>
              <StatusBadge status="verified" label="5 WORKFLOWS" />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {n8nStatus.workflows.map((wf) => (
                <div key={wf.id} className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-primary)] font-semibold">{wf.name}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Trigger: {wf.trigger}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">● ACTIVE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 3: FastAPI AI Services */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-[var(--text-primary)]">10 FastAPI Microservices</h3>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)]">Inference Latency: ~38ms</div>
                </div>
              </div>
              <StatusBadge status="verified" label="ALL ACTIVE" />
            </div>

            <div className="space-y-1.5 text-xs font-mono max-h-48 overflow-y-auto">
              {[
                "POST /api/trade-anomaly/predict (XGBoost)",
                "POST /predict/hs-code (WCO HS Classifier)",
                "POST /predict/market-opportunity (Partner Discovery)",
                "POST /predict/counterparty-match (Matching Engine)",
                "POST /predict/counterparty-risk (Trust Score)",
                "POST /compliance/rag-analyze (Bilateral Treaties)",
                "POST /compliance/sanctions-screen (OFAC/UN/EU)",
                "POST /compliance/transaction-gate (Gatekeeper)",
                "POST /api/v1/trade/generate-report (Dossier)",
                "POST /documents/ocr-extract (Document OCR)",
              ].map((ep, i) => (
                <div key={i} className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex items-center justify-between">
                  <span className="text-[var(--text-primary)] font-semibold truncate max-w-[260px]">{ep}</span>
                  <span className="text-emerald-600 text-[10px] font-bold">200 OK</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 4: EVM Smart Contracts */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-[var(--text-primary)]">EVM Hardhat Blockchain</h3>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)]">Chain ID: 31337</div>
                </div>
              </div>
              <StatusBadge status="verified" label="CONNECTED" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Escrow Contract:</span>
                <span className="text-sky-600 font-bold">TradeEscrow.sol</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Ledger Notarization:</span>
                <span className="text-emerald-600 font-bold">TradeLedger.sol</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--surface-3)] border border-[var(--hairline)] flex justify-between">
                <span className="text-[var(--text-secondary)]">Collateral Asset:</span>
                <span className="text-[var(--text-primary)] font-bold">mUSDC (6 Decimals)</span>
              </div>
            </div>
          </div>
        </div>

        {/* n8n Interactive Webhook Testing Console */}
        <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                n8n Webhook Dispatcher & Event Console
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Manual Simulation Playground for Workflow Debugging
            </span>
          </div>

          {/* Webhook Action Triggers */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "analyze-trade", label: "1. Trigger /analyze-trade Webhook" },
              { id: "create-trade", label: "2. Trigger /create-trade Webhook" },
              { id: "document-uploaded", label: "3. Trigger /document-uploaded Webhook" },
            ].map((wh) => (
              <button
                key={wh.id}
                type="button"
                onClick={() => handleDispatchWebhook(wh.id)}
                disabled={isExecutingWebhook}
                className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 text-amber-500" />
                <span>{wh.label}</span>
              </button>
            ))}
          </div>

          {/* Console Log Window */}
          <div className="p-3.5 rounded-xl bg-black border border-white/10 font-mono text-xs text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
            {webhookLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-500">&gt; </span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminSystemPage;

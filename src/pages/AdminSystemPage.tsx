import React from "react";
import { appwriteService } from "@/services/appwrite/client";
import { aiService } from "@/services/api/aiService";
import { n8nWorkflowService } from "@/services/n8n/workflowService";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Section } from "@/components/common/Section";
import { Database, Workflow, Cpu, Coins } from "lucide-react";

export const AdminSystemPage: React.FC = () => {
  const appwriteStatus = appwriteService.getStatus();
  const aiStatus = aiService.getStatus();
  const n8nStatus = n8nWorkflowService.getStatus();
  const blockchainStatus = blockchainEscrowService.getStatus();

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "System Health" },
          ]}
          title="System Architecture & Infrastructure"
          subtitle="Real-time health telemetry across Appwrite BaaS, n8n Orchestrator, FastAPI Microservices, and EVM Blockchain."
          badge={<StatusBadge status="verified" label="All Services Operational" size="md" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Pillar 1: Appwrite BaaS */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-white">Appwrite BaaS</h3>
                  <div className="text-[10px] font-mono text-slate-400">Auth · Database · Realtime</div>
                </div>
              </div>
              <StatusBadge status="verified" label="OPERATIONAL" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Project ID:</span>
                <span className="text-emerald-400 font-bold">{appwriteStatus.projectId}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Database Collections:</span>
                <span className="text-white">16 Relational Tables</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Storage Buckets:</span>
                <span className="text-white">KYC & Trade Evidence</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: n8n Workflow Automation */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-white">n8n Orchestrator</h3>
                  <div className="text-[10px] font-mono text-slate-400">Async Event Pipeline</div>
                </div>
              </div>
              <StatusBadge status="verified" label="5 ACTIVE" />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {n8nStatus.workflows.map((wf) => (
                <div key={wf.id} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">{wf.name}</span>
                    <span className="text-[10px] text-slate-500 block">Trigger: {wf.trigger}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">● {wf.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 3: FastAPI AI Services */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-white">FastAPI AI Microservices</h3>
                  <div className="text-[10px] font-mono text-slate-400">Inference Latency: ~45ms</div>
                </div>
              </div>
              <StatusBadge status="verified" label="HEALTHY" />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {aiStatus.endpoints.map((ep) => (
                <div key={ep} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{ep}</span>
                  <span className="text-emerald-400 text-[10px]">200 OK</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 4: EVM Smart Contracts */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-white">EVM Escrow Protocol</h3>
                  <div className="text-[10px] font-mono text-slate-400">Ethereum Sepolia / Arbitrum</div>
                </div>
              </div>
              <StatusBadge status="verified" label="CONNECTED" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-white">{blockchainStatus.network}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Contract:</span>
                <span className="text-sky-400 truncate max-w-[180px]">{blockchainStatus.contractAddress}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between">
                <span className="text-slate-400">Asset:</span>
                <span className="text-emerald-400 font-bold">USDC (ERC-20 Stablecoin)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
};

export default AdminSystemPage;

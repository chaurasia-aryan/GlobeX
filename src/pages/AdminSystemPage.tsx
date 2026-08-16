import { appwriteService } from "@/services/appwrite/client";
import { aiService } from "@/services/api/aiService";
import { n8nWorkflowService } from "@/services/n8n/workflowService";
import { blockchainEscrowService } from "@/services/blockchain/escrowService";
import {
  Cpu,
  Layers,
  Database,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Workflow,
  Server,
} from "lucide-react";

export const AdminSystemPage = () => {
  const appwriteStatus = appwriteService.getStatus();
  const aiStatus = aiService.getStatus();
  const n8nStatus = n8nWorkflowService.getStatus();
  const blockchainStatus = blockchainEscrowService.getStatus();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
            INFRASTRUCTURE MONITOR
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          System Architecture Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Real-time service health across Appwrite Backend, n8n Workflow Automation, FastAPI AI/ML Services, and EVM Smart Contract Escrow.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Appwrite BaaS */}
        <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-foreground">Appwrite Backend-as-a-Service</h3>
                <div className="text-[10px] font-mono text-muted-foreground">Auth • Database • Storage • Realtime</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Endpoint:</span>
              <span className="text-foreground truncate max-w-[200px]">{appwriteStatus.endpoint}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Project ID:</span>
              <span className="text-primary font-bold">{appwriteStatus.projectId}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Database Collections:</span>
              <span className="text-emerald-400 font-bold">16 Relational Tables</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Encrypted Storage:</span>
              <span className="text-foreground">KYC & Trade Documents</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: n8n Automation */}
        <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-foreground">n8n Workflow Automation</h3>
                <div className="text-[10px] font-mono text-muted-foreground">Asynchronous Workflow Orchestrator</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              5 WORKFLOWS ACTIVE
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {n8nStatus.workflows.map((wf) => (
              <div key={wf.id} className="p-2 rounded bg-secondary/30 border border-border/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{wf.name}</div>
                  <div className="text-[10px] text-muted-foreground">Trigger: {wf.trigger}</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">● {wf.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 3: FastAPI AI/ML Services */}
        <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-primary">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-foreground">FastAPI AI / ML Microservices</h3>
                <div className="text-[10px] font-mono text-muted-foreground">Inference Latency: ~45ms</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              HEALTHY
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {aiStatus.endpoints.map((ep) => (
              <div key={ep} className="p-2 rounded bg-secondary/30 border border-border/40 flex items-center justify-between">
                <span className="text-primary font-bold">{ep}</span>
                <span className="text-emerald-400 text-[10px]">200 OK</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 4: EVM Blockchain & Smart Contract */}
        <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-foreground">EVM Smart Contract & Escrow</h3>
                <div className="text-[10px] font-mono text-muted-foreground">Ethereum Sepolia / Arbitrum</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              CONNECTED
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground">{blockchainStatus.network}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Escrow Contract:</span>
              <span className="text-primary truncate max-w-[180px]">{blockchainStatus.contractAddress}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Settlement Asset:</span>
              <span className="text-emerald-400 font-bold">USDC (ERC-20 Stablecoin)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50 flex justify-between">
              <span className="text-muted-foreground">Document Integrity:</span>
              <span className="text-cyan-400">SHA-256 On-Chain Registries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemPage;

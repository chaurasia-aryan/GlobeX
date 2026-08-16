import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentVerificationStudio from "@/components/documents/DocumentVerificationStudio";
import CryptoEscrowCard from "@/components/escrow/CryptoEscrowCard";
import ShipmentTracker from "@/components/shipments/ShipmentTracker";
import DisputeResolutionSuite from "@/components/disputes/DisputeResolutionSuite";
import PublicTradeLedgerTable from "@/components/blockchain/PublicTradeLedgerTable";
import { AgentChat } from "@/components/agent-elements/agent-chat";
import type { Message } from "@/components/agent-elements/types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Ship,
  FileCheck2,
  Coins,
  Scale,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Home,
  Building2,
  MapPin,
  Hash,
  TrendingUp,
  Award,
  Bot,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

const lifecycleStages = [
  { name: "Trade Identified", completed: true },
  { name: "Counterparty Verified", completed: true },
  { name: "Compliance Verified", completed: true },
  { name: "Contract Created", completed: true },
  { name: "Escrow Funded ($550k)", completed: true },
  { name: "Shipment Dispatched", completed: true },
  { name: "Documents Submitted", completed: true },
  { name: "Shipment Verified", completed: false, current: true },
  { name: "Payment Released", completed: false },
];

const TABS = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "documents", label: "Documents", icon: FileCheck2 },
  { id: "escrow", label: "Escrow", icon: Coins },
  { id: "shipment", label: "Shipment", icon: Ship },
  { id: "disputes", label: "Disputes", icon: Scale },
  { id: "blockchain", label: "Blockchain", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StatPill({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: React.ReactNode;
  color?: "emerald" | "amber" | "accent" | "default";
}) {
  const colorMap = {
    emerald: "text-[var(--emerald)] bg-[rgba(52,199,149,0.08)] border-[rgba(52,199,149,0.2)]",
    amber: "text-[var(--amber)] bg-[rgba(255,196,0,0.08)] border-[rgba(255,196,0,0.2)]",
    accent: "text-[var(--accent)] bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.2)]",
    default: "text-[var(--text-primary)] bg-[var(--panel-raised)] border-[var(--hairline)]",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2 flex flex-col gap-0.5", colorMap[color])}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-mono font-bold">{value}</span>
    </div>
  );
}

function OverviewTab({ trade, onOpenTrustDrawer }: { trade: typeof FLAGSHIP_DEMO_TRADE; onOpenTrustDrawer?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">
                Exporter (Seller)
              </span>
            </div>
            <button
              onClick={onOpenTrustDrawer}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
            >
              <span>View Breakdown →</span>
            </button>
          </div>
          <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{trade.exporterName}</h3>
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{trade.exporterAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Ship className="w-3.5 h-3.5 shrink-0" />
              <span>{trade.exporterPort}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            <div onClick={onOpenTrustDrawer} className="cursor-pointer">
              <StatPill label="Trust Score" value={<NumberFlow value={trade.trustScore} />} color="emerald" />
            </div>
            <StatPill label="Risk Score" value={<NumberFlow value={trade.riskScore} />} color="amber" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">
              Importer (Buyer)
            </span>
          </div>
          <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{trade.importerName}</h3>
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{trade.importerAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Ship className="w-3.5 h-3.5 shrink-0" />
              <span>{trade.importerPort}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            <StatPill label="Country" value={trade.importerCountry} color="accent" />
            <StatPill label="Status" value="KYC Verified" color="emerald" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">
            Trade Metrics
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatPill label="Contract Value" value={`$${trade.contractValueUSD.toLocaleString()} USDC`} color="accent" />
          <StatPill label="Quantity" value={`${trade.quantity} ${trade.unit}`} color="default" />
          <StatPill label="HS Code" value={<span className="font-mono">{trade.hsCode}</span>} color="default" />
          <StatPill label="Lifecycle Stage" value={trade.lifecycleStage} color="amber" />
          <StatPill label="Trade Score" value={<NumberFlow value={trade.tradeScore} />} color="emerald" />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">
            Smart Contract & Product
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">Product</p>
            <p className="text-sm font-sans text-[var(--text-primary)]">{trade.productName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">Contract Address</p>
            <p className="text-xs font-mono text-[var(--accent)] truncate">{trade.smartContractAddress}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">Escrow Status</p>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--emerald)]" />
              <span className="text-sm font-mono text-[var(--emerald)]">{trade.escrowStatus}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">Documents</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emerald)]" />
              <span className="text-sm font-mono text-[var(--text-primary)]">
                {trade.verifiedDocumentsCount}/{trade.documentsCount} Verified
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-[var(--amber)]" />
              <span className="text-xs font-mono text-[var(--amber)]">1 Discrepancy</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { TrustBreakdownDrawer } from "@/components/trust/TrustBreakdownDrawer";

export const TradeWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trade = FLAGSHIP_DEMO_TRADE;

  useEffect(() => {
    if (id !== "TRD-IND-UAE-550K") {
      navigate("/trades/TRD-IND-UAE-550K", { replace: true });
    }
  }, [id, navigate]);

  const getInitialTab = (): TabId => {
    const hash = window.location.hash.replace("#", "") as TabId;
    const valid = TABS.map((t) => t.id);
    return valid.includes(hash) ? hash : "overview";
  };

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const [chatOpen, setChatOpen] = useState(true);
  const [isTrustDrawerOpen, setIsTrustDrawerOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "assistant",
      content:
        "Hello! I am your Global Trade AI Copilot. I've automatically verified the shipping documents for this 500 Tonnes Basmati Rice export.\n\n**Status:**\n- \u2705 Commercial Invoice Verified\n- \u2705 Bill of Lading (Clean On-Board)\n- \u2705 CEPA Duty Free Form Validated\n\nThe smart contract escrow is fully funded with **$550,000 USDC**. How can I assist you with this corridor today?",
      createdAt: new Date(),
    },
  ]);
  const [status, setStatus] = useState<"idle" | "streaming" | "submitted">("idle");

  const handleSend = (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setStatus("streaming");
    setTimeout(() => {
      const newAgentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I have audited the Blockchain Ledger for this transaction. The smart contract (0x789b...A409) is fully collateralized and awaiting final shipment telemetry from Jebel Ali Port before releasing funds.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newAgentMsg]);
      setStatus("idle");
    }, 1500);
  };

  const suggestions = [
    { label: "Verify Bill of Lading", value: "Can you verify the latest Bill of Lading?" },
    { label: "Check Escrow Status", value: "What is the status of the USDC escrow?" },
    { label: "Audit Customs Clearance", value: "Audit the UAE customs clearance documents." },
  ];

  return (
    <div className="min-h-screen text-[var(--text-primary)] px-4 sm:px-8 lg:px-10 py-6 space-y-5 max-w-[1600px] mx-auto w-full select-none font-sans relative z-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs text-[var(--text-primary)] font-medium">
              Workspace #{trade.id}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[rgba(52,199,149,0.12)] text-[var(--emerald)] border border-[rgba(52,199,149,0.2)] font-bold">
              ACTIVE ESCROW LOCKED
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">ID: #{trade.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            {trade.title}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Exporter:{" "}
            <strong className="text-[var(--text-primary)]">
              {trade.exporterName} ({trade.exporterCountry})
            </strong>{" "}
            {"\u27a1"} Importer:{" "}
            <strong className="text-[var(--text-primary)]">
              {trade.importerName} ({trade.importerCountry})
            </strong>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Contract Value</div>
            <div className="text-2xl font-mono font-extrabold text-[var(--text-primary)]">
              ${trade.contractValueUSD.toLocaleString()}{" "}
              <span className="text-xs text-[var(--accent)] font-bold">USDC</span>
            </div>
          </div>
          <button
            onClick={() => setChatOpen((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all",
              chatOpen
                ? "border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,212,255,0.08)]"
                : "border-[var(--hairline)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            )}
            aria-label={chatOpen ? "Collapse AI chat" : "Expand AI chat"}
          >
            {chatOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] p-4 space-y-2">
        <div className="text-[10px] font-mono font-semibold uppercase text-[var(--text-secondary)] tracking-wider px-1">
          Trade Execution Lifecycle
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={stage.name}
              className={cn(
                "p-2 rounded-lg border text-center text-xs font-mono transition-all flex flex-col justify-between",
                stage.completed
                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                  : stage.current
                  ? "bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-[var(--panel-raised)] border-[var(--hairline)] text-[var(--text-secondary)] opacity-50"
              )}
            >
              <div className="text-[10px] text-[var(--text-secondary)] font-bold">0{idx + 1}</div>
              <div className="text-[10px] leading-tight font-medium my-1">{stage.name}</div>
              <div className="text-[9px] font-bold">
                {stage.completed ? "\u2713 DONE" : stage.current ? "\u25cf ACTIVE" : "PENDING"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as TabId);
              window.history.replaceState(null, "", `#${v}`);
            }}
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-[var(--panel)] border border-[var(--hairline)] p-1 rounded-xl mb-5 w-full">
              {TABS.map(({ id: tabId, label, icon: Icon }) => (
                <TabsTrigger
                  key={tabId}
                  value={tabId}
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-xs font-mono py-2 px-2 rounded-lg transition-all",
                    "data-[state=active]:bg-[var(--panel-raised)] data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-[var(--text-secondary)] data-[state=inactive]:hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <OverviewTab trade={trade} onOpenTrustDrawer={() => setIsTrustDrawerOpen(true)} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <DocumentVerificationStudio tradeId={trade.id} />
              </motion.div>
            </TabsContent>

            <TabsContent value="escrow" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <CryptoEscrowCard />
              </motion.div>
            </TabsContent>

            <TabsContent value="shipment" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <ShipmentTracker />
              </motion.div>
            </TabsContent>

            <TabsContent value="disputes" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <DisputeResolutionSuite />
              </motion.div>
            </TabsContent>

            <TabsContent value="blockchain" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <PublicTradeLedgerTable />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        <AnimatePresence initial={false}>
          {chatOpen && (
            <motion.aside
              key="chat-panel"
              initial={{ opacity: 0, width: 0, x: 40 }}
              animate={{ opacity: 1, width: 384, x: 0 }}
              exit={{ opacity: 0, width: 0, x: 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden shrink-0"
            >
              <div className="w-96 rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-xl overflow-hidden flex flex-col h-[680px]">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--hairline)] bg-[var(--panel-raised)] shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-[var(--text-primary)] tracking-wider">
                      TRADE COPILOT
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-secondary)]">
                    <Award className="w-3 h-3 text-[var(--accent)]" />
                    <span>AI Confidence: 94%</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden p-2">
                  <AgentChat
                    messages={messages}
                    onSend={handleSend}
                    status={status}
                    onStop={() => setStatus("idle")}
                    suggestions={suggestions}
                    emptyStatePosition="center"
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Trust Breakdown Slide-over Drawer (Rule 13) */}
      <TrustBreakdownDrawer
        isOpen={isTrustDrawerOpen}
        onClose={() => setIsTrustDrawerOpen(false)}
      />
    </div>
  );
};

export default TradeWorkspacePage;

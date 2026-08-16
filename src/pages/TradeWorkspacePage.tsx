import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import TrustBreakdownDrawer from "@/components/trust/TrustBreakdownDrawer";
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
  Building2,
  MapPin,
  Bot,
  X,
  ArrowRight,
  ExternalLink,
  Award,
} from "lucide-react";

// Compact Lifecycle Stage Definition
const LIFECYCLE_STAGES = [
  { step: "01", name: "Identified", status: "completed" },
  { step: "02", name: "Verified", status: "completed" },
  { step: "03", name: "Compliance", status: "completed" },
  { step: "04", name: "Contract", status: "completed" },
  { step: "05", name: "Escrow Funded", status: "completed" },
  { step: "06", name: "Dispatched", status: "completed" },
  { step: "07", name: "Documents", status: "completed" },
  { step: "08", name: "In Transit", status: "active" },
  { step: "09", name: "Settled", status: "pending" },
] as const;

const TABS = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "documents", label: "Documents", icon: FileCheck2 },
  { id: "escrow", label: "Escrow", icon: Coins },
  { id: "shipment", label: "Shipment", icon: Ship },
  { id: "disputes", label: "Disputes", icon: Scale },
  { id: "blockchain", label: "Audit Trail", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Overview Tab Component (Clean & High-Signal) ──────────────────────────────
function OverviewTab({
  trade,
  onOpenTrustDrawer,
  onSelectTab,
}: {
  trade: typeof FLAGSHIP_DEMO_TRADE;
  onOpenTrustDrawer: () => void;
  onSelectTab: (tab: TabId) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 font-sans"
    >
      {/* Entity Summary: Exporter & Importer (2 Compact Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exporter Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0C121D]/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                Exporter (Seller)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenTrustDrawer}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Score Details →</span>
            </button>
          </div>

          <div>
            <h3 className="font-display font-bold text-base text-white">{trade.exporterName}</h3>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{trade.exporterAddress}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              onClick={onOpenTrustDrawer}
              className="p-2.5 rounded-xl bg-[#101726] border border-white/[0.04] cursor-pointer hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Trust Score</div>
              <div className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1">
                <NumberFlow value={trade.trustScore} /> <span className="text-xs text-[var(--text-tertiary)]">/ 100</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#101726] border border-white/[0.04]">
              <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Safety Level</div>
              <div className="text-lg font-mono font-bold text-cyan-400">Very Safe</div>
            </div>
          </div>
        </div>

        {/* Importer Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0C121D]/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                Importer (Buyer)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-bold">
              KYC VERIFIED
            </span>
          </div>

          <div>
            <h3 className="font-display font-bold text-base text-white">{trade.importerName}</h3>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{trade.importerAddress}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#101726] border border-white/[0.04]">
              <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Destination Port</div>
              <div className="text-sm font-mono font-bold text-white truncate">{trade.importerPort}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#101726] border border-white/[0.04]">
              <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Buyer History</div>
              <div className="text-sm font-mono font-bold text-emerald-400">42 Trades · 0% Dispute</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Quick Metrics Row */}
      <div className="p-4 rounded-2xl bg-[#0F1724] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Quantity</span>
          <strong className="text-sm text-white font-bold">{trade.quantity.toLocaleString()} MT</strong>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Product Code (HS)</span>
          <strong className="text-sm text-emerald-400 font-bold">{trade.hsCode}</strong>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Tariff Rate</span>
          <strong className="text-sm text-cyan-400 font-bold">0.0% (CEPA Free)</strong>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Payment Escrow</span>
          <strong className="text-sm text-emerald-400 font-bold">Protected in Vault</strong>
        </div>
      </div>

      {/* Action Shortcut Banner */}
      <div className="p-4 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Vessel MSC ANNA in Transit (Arabian Sea)</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">Estimated arrival at Jebel Ali: in 2 days. Documents 100% verified.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab("shipment")}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white transition-colors"
          >
            Track Shipment →
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("documents")}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
          >
            Check Documents →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Trade Workspace Page ────────────────────────────────────────────────
export const TradeWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trade = FLAGSHIP_DEMO_TRADE;

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    return TABS.some((t) => t.id === hash) ? hash : "overview";
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [isTrustDrawerOpen, setIsTrustDrawerOpen] = useState(false);

  useEffect(() => {
    if (id && id !== trade.id) {
      navigate(`/trades/${trade.id}`, { replace: true });
    }
  }, [id, navigate, trade.id]);

  // Copilot messages state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am your Global Trade AI Assistant. I've automatically verified the shipping papers for this 500 Tonnes Basmati Rice trade.\n\n✓ Commercial Invoice: Verified\n✓ Bill of Lading: Clean On-Board\n✓ Phytosanitary: APEDA Certified\n\nVessel MSC ANNA is currently crossing the Arabian Sea on schedule.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const suggestions = [
    { id: "sug-1", label: "Check vessel ETA in Dubai", value: "Check vessel ETA in Dubai" },
    { id: "sug-2", label: "Inspect escrow unlock conditions", value: "Inspect escrow unlock conditions" },
    { id: "sug-3", label: "View Certificate of Origin hash", value: "View Certificate of Origin hash" },
  ];

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStatus("streaming");

    setTimeout(() => {
      let reply = "Trade parameter verified against CEPA schedule rules with 100% consistency.";
      if (text.toLowerCase().includes("vessel") || text.toLowerCase().includes("eta")) {
        reply = "Vessel MSC ANNA (IMO 9400234) is currently 320 nautical miles from Jebel Ali Port, Dubai. Speed: 16.4 knots. No choke point delays detected.";
      } else if (text.toLowerCase().includes("escrow") || text.toLowerCase().includes("unlock")) {
        reply = "The $550,000 USD escrow will automatically release to ABC Global Exports upon SGS inspection sign-off and Jebel Ali customs geofence confirmation.";
      }
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStatus("idle");
    }, 900);
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-sans select-none relative z-10">
      
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs font-mono text-[var(--text-primary)] font-bold">
              Trade #{trade.id}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Workspace Page Header (Streamlined & Calm) ───────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Protected Escrow Locked</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              #{trade.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
            {trade.title}
          </h1>

          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
            <span>Exporter: <strong className="text-white">{trade.exporterName}</strong> ({trade.exporterCountry})</span>
            <span>➔</span>
            <span>Importer: <strong className="text-white">{trade.importerName}</strong> ({trade.importerCountry})</span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase block">
              Contract Value
            </span>
            <div className="text-2xl font-mono font-extrabold text-white">
              ${trade.contractValueUSD.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">USD</span>
            </div>
          </div>

          {/* Contextual AI Copilot Button (Opens Slide-over Drawer) */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500/10 border border-white/[0.12] hover:border-emerald-500/40 text-xs font-semibold text-white hover:text-emerald-300 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* ── Compact Horizontal Trade Lifecycle Stepper (Section 15) ──────────── */}
      <div className="p-3.5 rounded-2xl bg-[#0C121D]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 sm:pb-0 scrollbar-none">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <div key={stage.step} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    isActive
                      ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold shadow-sm"
                      : isCompleted
                      ? "bg-[#101726] border border-white/[0.04] text-[var(--text-secondary)]"
                      : "bg-transparent text-[var(--text-tertiary)] opacity-40"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    isActive
                      ? "bg-emerald-400 text-black font-bold animate-pulse"
                      : isCompleted
                      ? "bg-emerald-950 text-emerald-400 font-bold"
                      : "border border-white/[0.15]"
                  }`}>
                    {isCompleted ? "✓" : isActive ? "●" : stage.step}
                  </span>
                  <span>{stage.name}</span>
                </div>

                {idx < LIFECYCLE_STAGES.length - 1 && (
                  <span className="text-[var(--text-tertiary)] opacity-30 text-xs">➔</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full-Width 6-Domain Workspace Tabs (Section 16) ────────────────── */}
      <div className="w-full space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as TabId);
            window.history.replaceState(null, "", `#${v}`);
          }}
          className="w-full space-y-6"
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-[#090E17]/90 border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-xl w-full">
            {TABS.map(({ id: tabId, label, icon: Icon }) => (
              <TabsTrigger
                key={tabId}
                value={tabId}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl transition-all data-[state=active]:bg-white/[0.1] data-[state=active]:text-white data-[state=active]:shadow-sm text-[var(--text-secondary)] hover:text-white cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <OverviewTab
              trade={trade}
              onOpenTrustDrawer={() => setIsTrustDrawerOpen(true)}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                window.history.replaceState(null, "", `#${tab}`);
              }}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <DocumentVerificationStudio tradeId={trade.id} />
            </motion.div>
          </TabsContent>

          <TabsContent value="escrow" className="mt-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <CryptoEscrowCard />
            </motion.div>
          </TabsContent>

          <TabsContent value="shipment" className="mt-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <ShipmentTracker />
            </motion.div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <DisputeResolutionSuite />
            </motion.div>
          </TabsContent>

          <TabsContent value="blockchain" className="mt-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <PublicTradeLedgerTable />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Slide-Over Contextual AI Copilot Drawer (Section 17) ─────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0F18] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col justify-between font-sans select-none"
            >
              {/* Copilot Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0E1522]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white tracking-wider">TRADE COPILOT</h3>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">AI Confidence: 94% · Trade #{trade.id}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Copilot Body */}
              <div className="flex-1 overflow-hidden p-3 bg-[#080D15]">
                <AgentChat
                  messages={messages}
                  onSend={handleSend}
                  status={status}
                  onStop={() => setStatus("idle")}
                  suggestions={suggestions}
                  emptyStatePosition="center"
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Slide-Over Trust Score Breakdown Drawer (Rule 13) ────────────────── */}
      <TrustBreakdownDrawer
        isOpen={isTrustDrawerOpen}
        onClose={() => setIsTrustDrawerOpen(false)}
        profile={{
          companyName: trade.exporterName,
          country: trade.exporterCountry,
          port: trade.exporterPort,
          trustScore: trade.trustScore,
          totalTrades: 128,
          disputeRate: "0.0%",
          subscores: {
            counterpartyReliability: 96,
            fulfillmentRate: 94,
            documentIntegrity: 97,
            regulatoryCompliance: 92,
          },
          certifications: ["APEDA Certified", "FSSAI Food Grade", "ISO 22000"],
          historicalVolumeUSD: "$14.2M USD",
          activeStatus: "Tier-1 Verified Exporter",
        }}
      />
    </div>
  );
};

export default TradeWorkspacePage;

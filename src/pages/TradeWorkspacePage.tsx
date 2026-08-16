import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FLAGSHIP_DEMO_TRADE } from "@/data/mockTradeData";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { TradeProgress } from "@/components/common/TradeProgress";
import { TradeSummary } from "@/components/common/TradeSummary";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PrimaryAction } from "@/components/common/PrimaryAction";
import { Section } from "@/components/common/Section";
import { DetailDrawer } from "@/components/common/DetailDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentVerificationStudio from "@/components/documents/DocumentVerificationStudio";
import CryptoEscrowCard from "@/components/escrow/CryptoEscrowCard";
import ShipmentTracker from "@/components/shipments/ShipmentTracker";
import DisputeResolutionSuite from "@/components/disputes/DisputeResolutionSuite";
import PublicTradeLedgerTable from "@/components/blockchain/PublicTradeLedgerTable";
import { AgentChat } from "@/components/agent-elements/agent-chat";
import type { Message } from "@/components/agent-elements/types";
import { TrustBreakdownDrawer } from "@/components/trust/TrustBreakdownDrawer";
import {
  Ship,
  FileCheck2,
  Coins,
  Scale,
  Database,
  Layers,
  Bot,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "documents", label: "Documents", icon: FileCheck2 },
  { id: "payment", label: "Payment & Escrow", icon: Coins },
  { id: "shipment", label: "Shipment", icon: Ship },
  { id: "disputes", label: "Disputes", icon: Scale },
  { id: "blockchain", label: "Audit Trail", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const TradeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trade = FLAGSHIP_DEMO_TRADE;

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    return TABS.some((t) => t.id === hash) ? hash : "overview";
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [trustDrawerOpen, setTrustDrawerOpen] = useState(false);

  useEffect(() => {
    if (id && id !== trade.id) {
      navigate(`/trades/${trade.id}`, { replace: true });
    }
  }, [id, navigate, trade.id]);

  // AI Copilot state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Trade parameters verified for 500 MT Basmati Rice.\n\n✓ Commercial Invoice: Verified\n✓ Bill of Lading: Clean On-Board\n✓ Phytosanitary: APEDA Certified\n\nVessel MSC ANNA is currently crossing the Arabian Sea on schedule (ETA: 2 days).",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");

  const handleSendMessage = (text: string) => {
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
        reply = "Vessel MSC ANNA (IMO 9400234) is 320 nautical miles from Jebel Ali Port. Current speed: 16.4 knots. No delays detected.";
      } else if (text.toLowerCase().includes("escrow") || text.toLowerCase().includes("unlock")) {
        reply = "The $550,000 USD escrow releases automatically upon SGS inspection sign-off and Jebel Ali customs entry.";
      }
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStatus("idle");
    }, 700);
  };

  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
    window.history.replaceState(null, "", `#${newTab}`);
  };

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6">
        
        {/* ── Page Header (Answers: Where am I? What am I doing?) ─────────── */}
        <PageHeader
          breadcrumbs={[
            { label: "Active Trades", href: "/dashboard" },
            { label: `Trade #${trade.id}` },
          ]}
          title={`Trade #${trade.id}`}
          subtitle={
            <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs text-slate-400">
              <span className="text-white font-medium">{trade.title}</span>
              <span>•</span>
              <span>{trade.originCountry} → {trade.destinationCountry}</span>
              <span>•</span>
              <span>Step 5 of 6</span>
            </div>
          }
          badge={<StatusBadge status="in_transit" label="In Transit" size="md" />}
          action={
            <PrimaryAction
              onClick={() => handleTabChange("shipment")}
              icon={<Ship className="w-4 h-4" />}
              iconPosition="left"
            >
              Track Shipment →
            </PrimaryAction>
          }
          secondaryActions={
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-sans font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Copilot</span>
            </button>
          }
        />

        {/* ── Trade Progress: Single Source of Truth ─────────────────────── */}
        <TradeProgress
          currentStepIndex={4} // Step 5: Ship (0-indexed: 4)
          onStepClick={(idx) => {
            if (idx === 4) handleTabChange("shipment");
            if (idx === 3) handleTabChange("payment");
            if (idx === 1) handleTabChange("documents");
          }}
        />

        {/* ── Trade Summary (Compact Key Metrics Grid) ───────────────────── */}
        <TradeSummary
          exporterName={trade.exporterName}
          exporterCountry={trade.exporterCountry}
          importerName={trade.importerName}
          importerCountry={trade.importerCountry}
          valueUSD={trade.contractValueUSD}
          quantity={`${trade.quantity.toLocaleString()} MT`}
          eta="2 days (On Schedule)"
          paymentStatus="Escrow Protected"
        />

        {/* ── Workspace Tabs & Content ───────────────────────────────────── */}
        <div className="space-y-6 pt-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => handleTabChange(v as TabId)}
            className="w-full space-y-6"
          >
            {/* Flat Tab Switcher Bar */}
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 rounded-xl bg-[#090E17] border border-white/[0.08] gap-1">
              {TABS.map(({ id: tabId, label, icon: Icon }) => (
                <TabsTrigger
                  key={tabId}
                  value={tabId}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB 1: OVERVIEW (Essential summary & next action only) */}
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none space-y-6">
              
              {/* Primary Next Action Banner */}
              <div className="p-4 rounded-2xl bg-[#0C121D] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-white">
                      Vessel MSC ANNA in Transit (Arabian Sea)
                    </h4>
                    <p className="text-xs text-slate-400">
                      ETA Jebel Ali: in 2 days. Cargo papers 100% verified. Next action: Monitor port arrival.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PrimaryAction
                    size="sm"
                    onClick={() => handleTabChange("shipment")}
                  >
                    Track Vessel →
                  </PrimaryAction>
                </div>
              </div>

              {/* Counterparty Overview (Flat 2-column layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Exporter Detail */}
                <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                    <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">
                      Exporter (Seller)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTrustDrawerOpen(true)}
                      className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      Trust Score 94/100 →
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white">{trade.exporterName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{trade.exporterAddress}</span>
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Origin Port: <strong className="text-slate-200">{trade.exporterPort}</strong></span>
                    <span className="text-emerald-400 font-semibold">Tier-1 Verified</span>
                  </div>
                </div>

                {/* Importer Detail */}
                <div className="p-5 rounded-2xl bg-[#0B1019] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                    <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">
                      Importer (Buyer)
                    </span>
                    <StatusBadge status="verified" label="KYC Verified" />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white">{trade.importerName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{trade.importerAddress}</span>
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-slate-400 font-mono flex items-center justify-between">
                    <span>Destination Port: <strong className="text-slate-200">{trade.importerPort}</strong></span>
                    <span className="text-sky-400 font-semibold">42 Trades · 0 Disputes</span>
                  </div>
                </div>

              </div>

              {/* Trade Details Quick Spec */}
              <div className="p-4 rounded-2xl bg-[#0B1019] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Commodity Code</span>
                  <strong className="text-emerald-400 text-sm">{trade.hsCode}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Tariff Schedule</span>
                  <strong className="text-sky-400 text-sm">0.0% (CEPA Free)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Delivery Terms</span>
                  <strong className="text-white text-sm">{trade.incoterm} Jebel Ali</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Quality Inspector</span>
                  <strong className="text-emerald-400 text-sm">SGS International</strong>
                </div>
              </div>

            </TabsContent>

            {/* TAB 2: DOCUMENTS */}
            <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
              <DocumentVerificationStudio tradeId={trade.id} />
            </TabsContent>

            {/* TAB 3: PAYMENT & ESCROW */}
            <TabsContent value="payment" className="mt-0 focus-visible:outline-none">
              <CryptoEscrowCard />
            </TabsContent>

            {/* TAB 4: SHIPMENT */}
            <TabsContent value="shipment" className="mt-0 focus-visible:outline-none">
              <ShipmentTracker />
            </TabsContent>

            {/* TAB 5: DISPUTES */}
            <TabsContent value="disputes" className="mt-0 focus-visible:outline-none">
              <DisputeResolutionSuite />
            </TabsContent>

            {/* TAB 6: BLOCKCHAIN AUDIT TRAIL */}
            <TabsContent value="blockchain" className="mt-0 focus-visible:outline-none">
              <PublicTradeLedgerTable />
            </TabsContent>

          </Tabs>
        </div>

      </div>

      {/* ── Slide-Over Contextual AI Copilot Drawer ───────────────────────── */}
      <DetailDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Trade AI Copilot"
        subtitle={`Live assistance for Trade #${trade.id}`}
        badge={<StatusBadge status="active" label="94% Confidence" />}
        maxWidth="md"
      >
        <div className="h-[520px]">
          <AgentChat
            messages={messages}
            onSend={handleSendMessage}
            status={status}
            onStop={() => setStatus("idle")}
            suggestions={[
              { id: "1", label: "Check vessel ETA in Dubai", value: "Check vessel ETA in Dubai" },
              { id: "2", label: "Inspect escrow release conditions", value: "Inspect escrow release conditions" },
              { id: "3", label: "View Certificate of Origin hash", value: "View Certificate of Origin hash" },
            ]}
            emptyStatePosition="center"
          />
        </div>
      </DetailDrawer>

      {/* ── Slide-Over Trust Breakdown Drawer ─────────────────────────────── */}
      <TrustBreakdownDrawer
        isOpen={trustDrawerOpen}
        onClose={() => setTrustDrawerOpen(false)}
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
    </AppShell>
  );
};

export default TradeWorkspacePage;

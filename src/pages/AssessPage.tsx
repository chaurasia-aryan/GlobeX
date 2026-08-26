import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import { MetricDial } from "@/components/common/MetricDial";
import { SourceRef } from "@/components/common/SourceRef";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { SynthesizedAnswer } from "@/components/common/SynthesizedAnswer";
import { aiService, TradeRiskAnalysis, ComplianceAnalysis } from "@/services/api/aiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradeAnomalySandbox from "@/components/compliance/TradeAnomalySandbox";
import TariffCalculatorCard from "@/components/compliance/TariffCalculatorCard";
import SanctionsScreeningPanel from "@/components/compliance/SanctionsScreeningPanel";
import ComplianceRAGStudio from "@/components/compliance/ComplianceRAGStudio";
import TradeReportGeneratorModal from "@/components/compliance/TradeReportGeneratorModal";
import {
  Gauge,
  Percent,
  ShieldAlert,
  BookOpen,
  FileText,
  Sparkles,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function riskLevelToStatus(level: TradeRiskAnalysis["riskLevel"]): StatusVariant {
  switch (level) {
    case "LOW":
      return "verified";
    case "MODERATE":
      return "pending";
    case "ELEVATED":
      return "review";
    case "CRITICAL":
      return "blocked";
    default:
      return "pending";
  }
}

function dialTone(value: number | null, riskLevel: TradeRiskAnalysis["riskLevel"]): "verified" | "review" | "blocked" | "neutral" {
  if (value == null) return "neutral";
  return riskLevelToStatus(riskLevel) === "blocked" ? "blocked" : riskLevelToStatus(riskLevel) === "review" ? "review" : "verified";
}

export const AssessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { activeDirection } = useWorkspace();

  const commodity = searchParams.get("commodity") || "Basmati Rice";
  const origin = searchParams.get("origin") || "IND";
  const destination = searchParams.get("destination") || "ARE";
  const quantityKg = Number(searchParams.get("qty")) || 1000;
  const tradeValueUSD = Number(searchParams.get("value")) || 500000;

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [risk, setRisk] = useState<TradeRiskAnalysis | null>(null);
  const [compliance, setCompliance] = useState<ComplianceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const hs = await aiService.classifyHSCode(commodity, `${quantityKg} kg`, origin, destination);
      const hs6Int = parseInt(hs.hsCode.replace(/\D/g, "").slice(0, 6), 10) || 100630;

      const anomaly = await aiService.predictTradeAnomaly(activeDirection, hs6Int, destination, tradeValueUSD, quantityKg, "kg");
      const [riskResult, complianceResult] = await Promise.all([
        aiService.analyzeTradeRisk(commodity, origin, destination, tradeValueUSD, hs6Int, anomaly),
        aiService.analyzeCompliance(hs.hsCode, origin, destination, tradeValueUSD, []),
      ]);

      setRisk(riskResult);
      setCompliance(complianceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade assessment failed — one or more models unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commodity, origin, destination, quantityKg, tradeValueUSD, activeDirection]);

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-6 select-none">
        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            breadcrumbs={[{ label: "Assess" }]}
            title="Comprehensive Trade Risk & Regulatory Studio"
            subtitle={`${commodity} · ${origin} → ${destination} · ${quantityKg.toLocaleString()} kg (${activeDirection})`}
            badge={risk ? <StatusBadge status={riskLevelToStatus(risk.riskLevel)} label={`Risk: ${risk.riskLevel}`} size="md" /> : undefined}
          />

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Full Trade Dossier</span>
          </button>
        </div>

        {/* Feature Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-xl gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2 text-xs font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>Risk Overview</span>
            </TabsTrigger>

            <TabsTrigger value="anomaly" className="flex items-center gap-2 py-2 text-xs font-mono">
              <Gauge className="w-3.5 h-3.5" />
              <span>Anomaly Sandbox</span>
            </TabsTrigger>

            <TabsTrigger value="tariffs" className="flex items-center gap-2 py-2 text-xs font-mono">
              <Percent className="w-3.5 h-3.5" />
              <span>Treaties & Tariffs</span>
            </TabsTrigger>

            <TabsTrigger value="sanctions" className="flex items-center gap-2 py-2 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Sanctions & UBO</span>
            </TabsTrigger>

            <TabsTrigger value="rag" className="flex items-center gap-2 py-2 text-xs font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Compliance RAG</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-5">
            {loading ? (
              <LoadingSkeleton variant="card" count={2} />
            ) : error ? (
              <ErrorState message={error} onRetry={runAssessment} />
            ) : risk && compliance ? (
              <>
                {/* Tariff Treaty Summary Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] space-y-2">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                    <span className="text-[var(--text-secondary)]">
                      Tariff: <strong className="text-[var(--text-primary)]">{compliance.tariffRate}</strong>{" "}
                      <span className="text-[var(--text-tertiary)]">(MFN {compliance.standardMFNRate})</span>
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      Agreement: <strong className="text-[var(--text-primary)]">{compliance.tradeAgreement}</strong>
                    </span>
                    {compliance.estimatedSavingsUSD != null && (
                      <span className="text-emerald-600 font-bold">
                        Est. savings: ${compliance.estimatedSavingsUSD.toLocaleString()} USD
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">{compliance.disclaimer}</p>
                  {compliance.sourcesCited && compliance.sourcesCited.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {compliance.sourcesCited.map((s) => (
                        <SourceRef key={s} citation={s} />
                      ))}
                    </div>
                  )}
                </div>

                {/* LLM-Synthesized Compliance Answer */}
                {(compliance.synthesizedAnswer || compliance.synthesisUnavailableReason) && (
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-500">
                        Synthesized Answer{compliance.synthesisModel ? ` — ${compliance.synthesisModel}` : ""}
                      </span>
                      <StatusBadge
                        status={compliance.synthesizedAnswer ? "verified" : "review"}
                        label={compliance.synthesizedAnswer ? "LLM-Generated, Grounded" : "LLM Unavailable"}
                        size="sm"
                      />
                    </div>
                    {compliance.synthesizedAnswer ? (
                      <SynthesizedAnswer content={compliance.synthesizedAnswer} />
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)]">{compliance.synthesisUnavailableReason} — showing the rule-based tariff/document data above only.</p>
                    )}
                  </div>
                )}

                {/* 6 Result Dimensions Metric Dials */}
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                    Six Evaluated Risk Dimensions (ML + Rules Model)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)]">
                    <MetricDial label="Composite" value={risk.compositeScore} tone={dialTone(risk.compositeScore, risk.riskLevel)} className="mx-auto" />
                    <MetricDial label="Counterparty Risk" value={risk.subscores.counterpartyRisk} tone={dialTone(risk.subscores.counterpartyRisk, risk.riskLevel)} className="mx-auto" />
                    <MetricDial label="Transaction Risk" value={risk.subscores.transactionRisk} tone={dialTone(risk.subscores.transactionRisk, risk.riskLevel)} className="mx-auto" />
                    <MetricDial label="Regulatory Risk" value={risk.subscores.regulatoryRisk} tone={dialTone(risk.subscores.regulatoryRisk, risk.riskLevel)} className="mx-auto" />
                    <MetricDial label="Document Integrity" value={risk.subscores.documentIntegrity} tone={dialTone(risk.subscores.documentIntegrity, risk.riskLevel)} className="mx-auto" />
                    <MetricDial label="Shipment Risk" value={risk.subscores.shipmentRisk} tone={dialTone(risk.subscores.shipmentRisk, risk.riskLevel)} className="mx-auto" />
                  </div>
                </div>

                {/* Recommendation and Key Drivers */}
                <div className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] space-y-2">
                  <div className="text-xs font-bold text-[var(--text-primary)]">{risk.recommendation}</div>
                  {risk.keyDrivers.length > 0 && (
                    <ul className="text-xs text-[var(--text-secondary)] list-disc list-inside space-y-1">
                      {risk.keyDrivers.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Mandatory Documents Strip */}
                {compliance.mandatoryDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Mandatory Clearance Documents ({compliance.mandatoryDocuments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {compliance.mandatoryDocuments.map((doc) => (
                        <div key={doc.name} className="p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-1)] text-xs flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">{doc.name}</div>
                            <div className="text-[10px] text-[var(--text-tertiary)]">Authority: {doc.issuingAuthority}</div>
                          </div>
                          {doc.mandatory && <StatusBadge status="review" label="Required" size="sm" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </TabsContent>

          {/* TAB 2: ANOMALY SANDBOX */}
          <TabsContent value="anomaly">
            <TradeAnomalySandbox
              initialHs6={100630}
              initialPartner={destination}
              initialValue={tradeValueUSD}
              initialQty={quantityKg}
              initialFlow={activeDirection as "Export" | "Import"}
            />
          </TabsContent>

          {/* TAB 3: TREATIES & TARIFFS */}
          <TabsContent value="tariffs">
            <TariffCalculatorCard
              initialOrigin={origin}
              initialDestination={destination}
              initialHsCode="1006.30"
              initialValueUSD={tradeValueUSD}
            />
          </TabsContent>

          {/* TAB 4: SANCTIONS & UBO */}
          <TabsContent value="sanctions">
            <SanctionsScreeningPanel
              initialExporter="Bharat Basmati Agro Exports Ltd"
              initialImporter="Emirates National Foodstuffs FZCO"
            />
          </TabsContent>

          {/* TAB 5: COMPLIANCE RAG */}
          <TabsContent value="rag">
            <ComplianceRAGStudio
              initialOrigin={origin}
              initialDestination={destination}
              initialHs6={100630}
            />
          </TabsContent>
        </Tabs>

        {/* 1-Click Trade Dossier Modal */}
        <TradeReportGeneratorModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          defaultProduct={commodity}
          defaultOrigin={origin}
          defaultDestination={destination}
          defaultQuantityKg={quantityKg}
          defaultValueUSD={tradeValueUSD}
        />
      </div>
    </AppShell>
  );
};

export default AssessPage;

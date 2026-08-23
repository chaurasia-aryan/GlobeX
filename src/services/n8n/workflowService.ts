/**
 * n8n Workflow Automation Service Client
 * Routes trade lifecycle events through the n8n webhook orchestration layer.
 *
 * Integration Rules:
 * - Real calls are attempted first when VITE_N8N_WEBHOOK_URL is set
 * - Development fallback is ONLY used when the env var is NOT set
 * - Fallback is clearly identified as "FALLBACK" in the status field
 * - A broken real backend NEVER appears as successful via the fallback
 */

export interface WorkflowExecutionResult {
  workflowId: string;
  workflowName: string;
  executionId: string;
  status: "SUCCESS" | "RUNNING" | "FAILED" | "PARTIAL" | "UNAVAILABLE" | "FALLBACK";
  startedAt: string;
  finishedAt: string;
  nodesExecuted: number;
  payloadOutput: Record<string, any>;
  /** Present only when status is FALLBACK: warns the UI that this is not a real result */
  fallbackReason?: string;
  /** Backend latency in ms when using real calls */
  latencyMs?: number;
}

/**
 * Payload for the Analyze Trade n8n webhook.
 * Maps directly to the Set — Normalize Input node in the workflow.
 */
export interface AnalyzeTradePayload {
  product: string;
  origin_country: string;
  destination_country?: string;
  quantity_kg: number;
  target_price_usd?: number;
  certifications?: string[];
  trade_flow?: "Export" | "Import";
  regime?: "balanced" | "aggressive" | "conservative" | "risk_averse";
  top_n?: number;
  reference_date?: string;
  user_id?: string;
  org_id?: string;
}

class N8nWorkflowService {
  private webhookBaseUrl: string;
  private isRealBackend: boolean;

  constructor() {
    const envUrl = (import.meta as any).env?.VITE_N8N_WEBHOOK_URL;
    this.isRealBackend = !!envUrl;
    this.webhookBaseUrl = envUrl || "https://n8n.internal.globex.ai/webhook";
  }

  private get isDev(): boolean {
    return !this.isRealBackend;
  }

  /**
   * POST to an n8n webhook and return the result.
   * Returns UNAVAILABLE (not FAILED) if the server is unreachable.
   */
  private async callWebhook(
    path: string,
    body: Record<string, unknown>,
    workflowId: string,
    workflowName: string
  ): Promise<WorkflowExecutionResult> {
    const startedAt = new Date().toISOString();
    const t0 = performance.now();

    try {
      const response = await fetch(`${this.webhookBaseUrl}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });

      const latencyMs = Math.round(performance.now() - t0);

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        return {
          workflowId,
          workflowName,
          executionId: `exec_${Date.now()}`,
          status: "FAILED",
          startedAt,
          finishedAt: new Date().toISOString(),
          nodesExecuted: 0,
          payloadOutput: {
            error: `HTTP ${response.status}`,
            detail: errBody.slice(0, 500),
          },
          latencyMs,
        };
      }

      const data = await response.json();
      return {
        workflowId,
        workflowName,
        executionId: data.execution_id || `exec_${Date.now()}`,
        status: "SUCCESS",
        startedAt,
        finishedAt: new Date().toISOString(),
        nodesExecuted: data.nodes_executed || 1,
        payloadOutput: data,
        latencyMs,
      };
    } catch (err: any) {
      // Distinguish network-unreachable from unexpected errors
      const isNetworkError =
        err?.name === "AbortError" ||
        err?.name === "TypeError" ||
        String(err).includes("fetch");
      return {
        workflowId,
        workflowName,
        executionId: `exec_${Date.now()}`,
        status: "UNAVAILABLE",
        startedAt,
        finishedAt: new Date().toISOString(),
        nodesExecuted: 0,
        payloadOutput: {
          error: isNetworkError ? "n8n unreachable" : String(err),
          hint: "Set VITE_N8N_WEBHOOK_URL and ensure n8n is running.",
        },
        latencyMs: Math.round(performance.now() - t0),
      };
    }
  }

  /**
   * Development-only fallback. Only invoked when VITE_N8N_WEBHOOK_URL is NOT set.
   * Always clearly marks itself as FALLBACK so the UI can show an appropriate warning.
   */
  private devFallback(
    workflowId: string,
    workflowName: string,
    payloadOutput: Record<string, unknown>
  ): WorkflowExecutionResult {
    return {
      workflowId,
      workflowName,
      executionId: `dev_${Date.now()}`,
      status: "FALLBACK",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      nodesExecuted: 0,
      payloadOutput,
      fallbackReason:
        "VITE_N8N_WEBHOOK_URL not set. This is development mock data. Set the env var and restart to use real n8n.",
    };
  }

  // ──────────────────────────────────────────────────────────────
  // Workflow 1: Trade Intelligence / Analyze Trade
  // ──────────────────────────────────────────────────────────────

  /**
   * Triggers the full AI Trade Analysis n8n workflow.
   * Webhook path: POST /webhook/analyze-trade
   *
   * The workflow calls:
   *   HS Classifier → Market Opportunity → Trade Anomaly →
   *   Counterparty Match → Compliance → Aggregate → Persist
   */
  public async triggerTradeIntelligenceWorkflow(
    payload: AnalyzeTradePayload
  ): Promise<WorkflowExecutionResult> {
    if (this.isDev) {
      return this.devFallback("wf_trade_intelligence_01", "Trade Intelligence", {
        note: "Set VITE_N8N_WEBHOOK_URL to call real n8n",
        input: payload,
      });
    }
    return this.callWebhook(
      "analyze-trade",
      payload as unknown as Record<string, unknown>,
      "wf_trade_intelligence_01",
      "WF-01: End-to-End Trade Intelligence Aggregator"
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Workflow 2: Document Verification
  // ──────────────────────────────────────────────────────────────

  public async triggerDocumentVerificationWorkflow(
    tradeId: string,
    documentUrl: string,
    documentType: string = "COMMERCIAL_INVOICE",
    uploaderOrgId?: string
  ): Promise<WorkflowExecutionResult> {
    if (this.isDev) {
      return this.devFallback("wf_doc_verification_02", "Document Verification", {
        note: "Set VITE_N8N_WEBHOOK_URL to call real n8n",
        trade_id: tradeId,
      });
    }
    return this.callWebhook(
      "document-uploaded",
      { trade_id: tradeId, document_url: documentUrl, document_type: documentType, uploader_org_id: uploaderOrgId },
      "wf_doc_verification_02",
      "WF-02: Document OCR & Blockchain Verification"
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Workflow 3: Trade Creation + Escrow
  // ──────────────────────────────────────────────────────────────

  public async triggerEscrowLifecycleWorkflow(
    tradeId: string,
    counterpartyOrgId: string,
    eventData?: Record<string, unknown>
  ): Promise<WorkflowExecutionResult> {
    if (this.isDev) {
      return this.devFallback("wf_escrow_manager_03", "Trade + Escrow Creation", {
        note: "Set VITE_N8N_WEBHOOK_URL to call real n8n",
        trade_id: tradeId,
      });
    }
    return this.callWebhook(
      "create-trade",
      { trade_id: tradeId, counterparty_org_id: counterpartyOrgId, ...eventData },
      "wf_escrow_manager_03",
      "WF-03: Trade Creation + Escrow"
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Workflow 4: Shipment Tracking (note: this is a scheduled n8n
  // workflow; this endpoint is for manual trigger/status check)
  // ──────────────────────────────────────────────────────────────

  public async triggerShipmentIngestionWorkflow(
    voyageNumber: string
  ): Promise<WorkflowExecutionResult> {
    if (this.isDev) {
      return this.devFallback("wf_shipment_ingest_04", "Shipment Tracking", {
        note: "Shipment polling is a scheduled n8n workflow (every 6h). Set VITE_N8N_WEBHOOK_URL for status.",
        voyage_number: voyageNumber,
      });
    }
    return this.callWebhook(
      "shipment-status",
      { voyage_number: voyageNumber },
      "wf_shipment_ingest_04",
      "WF-04: Shipment Tracking & Settlement"
    );
  }

  public getStatus() {
    return {
      webhookBaseUrl: this.webhookBaseUrl,
      isRealBackend: this.isRealBackend,
      note: this.isDev
        ? "Development mode — set VITE_N8N_WEBHOOK_URL to enable real n8n calls"
        : "Production mode — calling real n8n instance",
      activeWorkflowsCount: 5,
      workflows: [
        { id: "wf_01", name: "Trade Intelligence Aggregator", trigger: "POST /analyze-trade", status: "ACTIVE" },
        { id: "wf_02", name: "Document OCR & Verification", trigger: "POST /document-uploaded", status: "ACTIVE" },
        { id: "wf_03", name: "Trade Creation + Escrow", trigger: "POST /create-trade", status: "ACTIVE" },
        { id: "wf_04", name: "Shipment Polling & Settlement", trigger: "Scheduled 6h", status: "ACTIVE" },
        { id: "wf_05", name: "Trade Data Ingestion", trigger: "Daily 02:00 UTC", status: "ACTIVE" },
      ],
    };
  }
}

export const n8nWorkflowService = new N8nWorkflowService();

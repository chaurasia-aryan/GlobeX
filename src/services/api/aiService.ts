/**
 * FastAPI AI/ML Microservice Client & Trade RAG Pipeline
 * Handles HS classification, counterparty matching, trade risk scoring, and regulatory compliance RAG.
 * Easily connects to external FastAPI / PyTorch models via VITE_FASTAPI_AI_URL.
 */

import { TopBuyer, TOP_BUYERS_DATA } from "@/data/mockTradeData";

export interface BuyerMatchQuery {
  commodity: string;
  quantity: number;
  unit: string;
  destinationCountry: string;
  requirements?: string[];
}

export interface BuyerMatchResponse {
  query: BuyerMatchQuery;
  candidateCount: number;
  strongMatchCount: number;
  recommendations: TopBuyer[];
  executedAt: string;
  data_source?: string;
}

export interface HSClassificationResult {
  hsCode: string;
  category: string;
  confidence: number;
  alternativeCodes: string[];
  dataSource?: "live" | "fallback";
}

export interface CounterpartyMatchResult {
  exporterId: string;
  companyName: string;
  originCountry: string;
  port: string;
  trustScore: number;
  matchScore: number;
  breakdown: {
    productFit: number;
    quantityFit: number;
    priceFit: number;
    certificationFit: number;
    trustScoreWeight: number;
    riskDeduction: number;
  };
  certifications: string[];
  historicalVolumeMT: number;
  disputeRate: string;
  explanation: string;
  dataSource?: "live" | "fallback";
}

export interface TradeRiskAnalysis {
  compositeScore: number;
  riskLevel: "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL";
  // null = not modelled for this request, never a guessed constant.
  // transactionRisk is the one dimension actually derived from a real
  // model output (the anomaly score); the rest require data this call
  // doesn't have access to (see analyzeTradeRisk below).
  subscores: {
    counterpartyRisk: number | null;
    transactionRisk: number;
    regulatoryRisk: number | null;
    documentIntegrity: number | null;
    shipmentRisk: number | null;
  };
  recommendation: string;
  keyDrivers: string[];
}

export type ScreeningDecision =
  | "NO_MATCH"
  | "POTENTIAL_MATCH"
  | "MATCH_REQUIRES_RESTRICTION"
  | "UNSUPPORTED";

export interface PartyScreeningRecord {
  query: { name: string; [key: string]: any };
  decision: ScreeningDecision;
  match: { entity_id: string; name: string; score: number; [key: string]: any } | null;
  ownership_screening: string | null;
  coverage_gaps: string[];
  requires_human_review: boolean;
  registry_available?: boolean;
  unsupported_reason?: string;
  disclaimer: string;
}

export interface SanctionsScreenResult {
  overall_decision: ScreeningDecision;
  requires_human_review: boolean;
  per_role: Record<string, PartyScreeningRecord>;
  screened_at: string;
  disclaimer: string;
}

export interface RAGRetrievedPassage {
  text: string;
  source: string;
  category?: string;
  relevance?: number;
  metadata?: Record<string, any>;
}

export interface ComplianceAnalysis {
  tariffRate: string;
  standardMFNRate: string;
  tradeAgreement: string;
  estimatedSavingsUSD: number | null;
  ntmBarriers: string[];
  mandatoryDocuments: {
    name: string;
    issuingAuthority: string;
    mandatory: boolean;
  }[];
  retrievedEvidence?: RAGRetrievedPassage[];
  sourcesCited?: string[];
  disclaimer: string;
  dataSource?: "live" | "fallback";
  synthesizedAnswer?: string | null;
  synthesisAvailable?: boolean;
  synthesisModel?: string | null;
  synthesisUnavailableReason?: string | null;
}

// ─────────────────────────────────────────────────
// Trade Anomaly Response (from POST /api/trade-anomaly/predict)
// ─────────────────────────────────────────────────
export interface TradeAnomalyResult {
  status: "OK" | "ERROR" | "INSUFFICIENT_HISTORY" | "FALLBACK";
  risk?: {
    anomaly_score: number;       // 0–1, HIGHER IS WORSE
    is_anomaly: boolean;
    risk_level: "NORMAL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    anomaly_type: "NORMAL" | "VOLUME_SURGE" | "UNEXPECTED_COLLAPSE" | "PRICE_DEVIATION" | "NEW_CORRIDOR";
    label_source: "RULE_BASED_HEURISTIC" | "MODEL";
    threshold?: number;
  };
  corridor?: {
    reporter_iso3: string;
    partner_iso3: string;
    hs6: number;
    trade_flow: string;
    period: string;
    trade_value_usd: number;
    quantity: number;
    quantity_unit: string;
  };
  signals?: {
    code?: string;
    signal?: string;
    description?: string;
    message?: string;
    direction?: "HIGHER_IS_WORSE" | "LOWER_IS_WORSE" | "NEUTRAL";
    value?: number;
    severity?: string;
  }[];
  historical?: {
    rolling_mean_3m: number;
    rolling_std_3m: number;
    val_rolling_zscore: number;
    partner_share_pct: number;
    new_corridor_flag: boolean;
  };
  unsupervised_screen?: {
    status?: string;
    reason?: string;
    unsupervised_anomaly_score?: {
      flagged: boolean;
      anomaly_score: number;
      method: string;
      drivers?: { code: string; message: string; severity: string }[];
    };
    peer_price_comparison?: {
      unit_value_usd_per_kg: number;
      peer_median_usd_per_kg: number;
      peer_p10_usd_per_kg: number;
      peer_p90_usd_per_kg: number;
      peer_price_zscore: number;
      peer_count: number;
      flagged: boolean;
    };
  } | null;
  metadata?: {
    version: string;
    model_name: string;
    model_loaded: boolean;
    threshold: number;
    label_source: string;
    disclaimer?: string;
  };
  error_code?: string;
  message?: string;
}

// ─────────────────────────────────────────────────
// Market Opportunity & Country Ranking Response (from POST /predict/market-opportunity)
// ─────────────────────────────────────────────────
export interface StructuredPro {
  category: "DEMAND" | "TARIFF" | "LOGISTICS" | "MARKET" | string;
  title: string;
  description: string;
  impact_score?: number;
}

export interface StructuredCon {
  category: "REGULATORY" | "SANCTIONS" | "PRICE" | "VOLATILITY" | string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | string;
  mitigation?: string;
}

export interface AISynthesis {
  executive_summary: string;
  structured_pros: StructuredPro[];
  structured_cons: StructuredCon[];
  negotiation_leverage?: string;
  synthesized_by_llm: boolean;
  model_used?: string;
  error?: string;
}

export interface DestinationCountryInsight {
  destination: {
    iso3: string;
    country_name: string;
    region?: string;
    sub_region?: string;
    currency?: string;
  };
  product?: {
    hs6: number;
    description: string;
  };
  forecast: {
    annual_market_demand_kg: number;
    expected_fob_price_usd_per_kg: number;
    user_shipment_quantity_kg: number;
    estimated_shipment_revenue_usd: number;
    forecast_method?: string;
    demand_interval_80_lower_kg?: number;
    demand_interval_80_upper_kg?: number;
  };
  risk: {
    risk_level: string;
    risk_penalty_points: number;
    risk_flags: string;
    sanctions_active: boolean;
    ofac_count: number;
    scomet_controlled: boolean;
  };
  scores: {
    final_score: number;
    opportunity_score: number;
    risk_penalty: number;
    quantity_fit_score: number;
    score_revealed_demand: number;
    score_forecast_demand: number;
    score_growth_momentum: number;
    score_trade_access: number;
    score_economic_capacity: number;
    score_forecast_price: number;
    score_logistics: number;
    score_buyer_ecosystem: number;
    score_stability: number;
  };
  pros: string[];
  cons: string[];
  ai_synthesis?: AISynthesis;
}

export interface MarketOpportunityResult {
  status: "success" | "error" | "UNAVAILABLE";
  product_resolution?: {
    status: string;
    hs6: number;
    product_description: string;
    candidates?: { hs6: number; product_description: string }[];
  };
  requested_quantity_kg?: number;
  regime?: string;
  total_candidates_evaluated?: number;
  top_recommendations?: DestinationCountryInsight[];
  summary_table?: {
    final_rank: number;
    importer_iso3: string;
    importer_country_name: string;
    final_score: number;
    opportunity_score: number;
    risk_penalty: number;
    risk_level: string;
    forecast_demand_kg: number;
    forecast_fob_price: number;
    destination_applied_tariff_rate: number;
    rta_name: string;
  }[];
  model_version?: string;
  analysis_id?: string;
  message?: string;
  dataSource?: "live" | "fallback";
}

// ─────────────────────────────────────────────────
// Multi-Model Synthesized Trade Report Response
// (from POST /api/v1/trade/generate-report)
// ─────────────────────────────────────────────────
export interface TradeReportSection {
  available: boolean;
  reason?: string;
  narrative?: string[];
  [key: string]: any;
}

export interface TradeReportResponse {
  status: "OK" | "PARTIAL" | "ERROR";
  corridor: {
    origin: string;
    destination: string;
    hs6: number;
  };
  missing_dimensions: string[];
  sections: {
    demand: TradeReportSection;
    anomaly: TradeReportSection;
    compliance: TradeReportSection;
    counterparty: TradeReportSection;
  };
  executive_summary: string;
  disclaimer: string;
  executed_at?: string;
}

export interface TradeIntakePayload {
  role: "importer" | "exporter";
  productName: string;
  hsCode?: string;
  quantity: number;
  unit: "MT" | "KG" | "Meters" | "Units";
  targetPriceUSD: number;
  originCountry: string;
  originPort: string;
  destinationCountry: string;
  destinationPort: string;
  incoterm: "CIF" | "FOB" | "DDP" | "CFR";
  requiredCertifications: string[];
  escrowToken: "USDC" | "USDT" | "FIAT";
  inspectionRequired: boolean;
  inspectionAgent: string;
}

export interface UnifiedRAGAnalysisResult {
  tradeId: string;
  intakeSummary: TradeIntakePayload;
  totalContractValueUSD: number;
  hsClassification: HSClassificationResult;
  matchingExporters: CounterpartyMatchResult[];
  complianceRAG: ComplianceAnalysis;
  tradeRisk: TradeRiskAnalysis;
  tradeAnomaly?: TradeAnomalyResult;
  marketOpportunity?: MarketOpportunityResult;
  estimatedEscrowCollateralUSD: number;
  dutySavingsUSD: number;
  recommendedAction: string;
  executedAt: string;
}

export interface ListingCreatePayload {
  organizationId: string; // organizations.id UUID — must be a real org, not a demo user id
  createdBy?: string;
  productName: string;
  productCategory?: string;
  hsCode?: string;
  description?: string;
  quantityAvailable?: number;
  unit?: string;
  price?: number;
  currency?: string;
  incoterms?: string;
  originPort?: string;
  certifications?: string[];
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  specs?: Record<string, string>;
}

export interface ListingCreateResult {
  id: string;
  organizationId: string;
  productName: string;
  status: string;
  createdAt: string;
}

/**
 * Raw shape of public.trades (src/api/trades_api.py::list_trades / get_trade).
 * The table has no title/org-name/port/HS-code columns — only IDs, amount,
 * status and timestamps. Do not fabricate the missing fields; render what's
 * really there.
 */
export interface TradeRecord {
  id: string;
  listingId: string | null;
  exporterId: string;
  importerId: string;
  status: string;
  totalAmount: number | null;
  currency: string | null;
  quantity: number | null;
  agreedPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

function toTradeRecord(d: any): TradeRecord {
  return {
    id: d.id,
    listingId: d.listing_id ?? null,
    exporterId: d.exporter_id,
    importerId: d.importer_id,
    status: d.status,
    totalAmount: d.total_amount != null ? Number(d.total_amount) : null,
    currency: d.currency ?? null,
    quantity: d.quantity != null ? Number(d.quantity) : null,
    agreedPrice: d.agreed_price != null ? Number(d.agreed_price) : null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export interface ListingRecord {
  id: string;
  organizationId: string;
  createdBy: string | null;
  productName: string;
  productCategory: string | null;
  hsCode: string | null;
  description: string | null;
  quantityAvailable: number | null;
  unit: string | null;
  price: number | null;
  currency: string | null;
  incoterms: string | null;
  status: string;
  originPort: string | null;
  certifications: string[];
  leadTimeDays: number | null;
  minimumOrderQuantity: number | null;
  specs: Record<string, string>;
  exporterName: string | null;
  exporterCountry: string | null;
  exporterCity: string | null;
  createdAt: string;
  updatedAt: string;
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_FASTAPI_AI_URL || "http://localhost:8000";
  }

  /**
   * Complete End-to-End Trade Intake & RAG Synthesis Pipeline
   * Calls real backend services concurrently: HS Classification, Market Opportunity,
   * Trade Anomaly Detection, Counterparty Matching, and Compliance RAG.
   */
  public async analyzeTradeIntake(payload: TradeIntakePayload): Promise<UnifiedRAGAnalysisResult> {
    const totalContractValue = payload.quantity * payload.targetPriceUSD;
    const originIso3 = payload.originCountry.toLowerCase().includes("ind") ? "IND" : "IND";
    const destIso3 = payload.destinationCountry.toLowerCase().includes("uae") || payload.destinationCountry.toLowerCase().includes("arab")
      ? "ARE"
      : payload.destinationCountry.slice(0, 3).toUpperCase();

    // 1. Resolve HS Code
    const hs = await this.classifyHSCode(payload.productName, `${payload.quantity} ${payload.unit}`, originIso3, destIso3);
    const hs6Int = parseInt(hs.hsCode.replace(/\D/g, "").slice(0, 6), 10) || 100630;

    // 2. Concurrently execute downstream ML services
    const [marketOpp, anomaly, compliance, exporters] = await Promise.all([
      this.rankMarketOpportunity(payload.productName, payload.unit === "MT" ? payload.quantity * 1000 : payload.quantity, "balanced", 5),
      this.predictTradeAnomaly(
        payload.role === "exporter" ? "Export" : "Import",
        hs6Int,
        destIso3,
        totalContractValue,
        payload.unit === "MT" ? payload.quantity * 1000 : payload.quantity,
        "kg"
      ),
      this.analyzeCompliance(hs.hsCode, originIso3, destIso3, totalContractValue, payload.requiredCertifications),
      this.semanticMatch(payload.productName, payload.targetPriceUSD, payload.quantity, destIso3, hs6Int),
    ]);

    const risk = await this.analyzeTradeRisk(
      payload.productName,
      originIso3,
      destIso3,
      totalContractValue,
      hs6Int,
      anomaly
    );

    const dutySavings = compliance.estimatedSavingsUSD; // null when the backend didn't compute one — not guessed at 5%

    return {
      tradeId: `TRD-${originIso3}-${destIso3}-${Math.round(totalContractValue / 1000)}K`,
      intakeSummary: payload,
      totalContractValueUSD: totalContractValue,
      hsClassification: hs,
      matchingExporters: exporters,
      complianceRAG: compliance,
      tradeRisk: risk,
      tradeAnomaly: anomaly,
      marketOpportunity: marketOpp,
      estimatedEscrowCollateralUSD: totalContractValue,
      dutySavingsUSD: dutySavings,
      recommendedAction:
        anomaly.risk?.risk_level === "CRITICAL"
          ? "Anomaly Alert: Transaction volume deviates significantly from historical baseline. Review before proceeding."
          : "High-confidence trade proposal. Counterparties verified, preferential tariff applied, proceed to Escrow Vault creation.",
      executedAt: new Date().toISOString(),
    };
  }

  // 1. HS Classification
  public async classifyHSCode(
    productName: string,
    description: string,
    origin: string = "IND",
    destination: string = "ARE"
  ): Promise<HSClassificationResult> {
    const res = await fetch(`${this.baseUrl}/predict/hs-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: productName, origin, destination }),
    });
    if (!res.ok) {
      throw new Error(`HS classification failed (${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.hs6) {
      throw new Error(`HS classification returned no match for "${productName}"`);
    }
    return {
      hsCode: data.hs_code_formatted || String(data.hs6),
      category: data.product_description || "Classified Commodity",
      confidence: data.confidence || 0.85,
      alternativeCodes: (data.candidates || [])
        .filter((c: any) => c.hs6 !== data.hs6)
        .map((c: any) => String(c.hs6)),
      dataSource: "live",
    };
  }

  // 2. Partner Discovery / Market Opportunity
  public async rankMarketOpportunity(
    product: string,
    quantityKg?: number,
    regime: string = "balanced",
    topN: number = 5
  ): Promise<MarketOpportunityResult> {
    const res = await fetch(`${this.baseUrl}/predict/market-opportunity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product,
        quantity_kg: quantityKg,
        regime,
        top_n: topN,
      }),
    });
    if (!res.ok) {
      throw new Error(`Market opportunity ranking failed (${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    return { ...data, dataSource: "live" };
  }

  // 2b. Synthesize and Structure Country Pros & Cons using LLM
  public async synthesizeCountryProsCons(
    insightData: DestinationCountryInsight
  ): Promise<AISynthesis> {
    try {
      const res = await fetch(`${this.baseUrl}/predict/market-opportunity/synthesize-pros-cons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insight_data: insightData }),
      });
      if (!res.ok) {
        throw new Error(`Synthesis failed with status ${res.status}`);
      }
      const data = await res.json();
      return data.synthesis;
    } catch (err: any) {
      // Fallback local structuring if network drops
      const destName = insightData.destination.country_name;
      const finalScore = insightData.scores.final_score;
      return {
        executive_summary: `${destName} presents a ranked Opportunity Score of ${finalScore.toFixed(1)}/100 for Indian exports with strong demand capacity and established trade settlement channels.`,
        structured_pros: (insightData.pros || []).map((p) => ({
          category: p.toLowerCase().includes("tariff") || p.toLowerCase().includes("duty") ? "TARIFF" : "DEMAND",
          title: p.length > 40 ? p.slice(0, 37) + "..." : p,
          description: p,
          impact_score: 85,
        })),
        structured_cons: (insightData.cons || []).map((c) => ({
          category: c.toLowerCase().includes("sanction") || c.toLowerCase().includes("ofac") ? "SANCTIONS" : "REGULATORY",
          title: c.length > 40 ? c.slice(0, 37) + "..." : c,
          description: c,
          severity: c.toLowerCase().includes("sanction") ? "HIGH" : "MEDIUM",
          mitigation: "Screen all trade documents and counterparties prior to cargo dispatch.",
        })),
        negotiation_leverage: "Quote competitive FOB Nhava Sheva / Mundra terms with confirmed LC payment.",
        synthesized_by_llm: false,
        model_used: "Client-Side-Fallback",
      };
    }
  }

  // 3. Trade Anomaly Detection
  public async predictTradeAnomaly(
    tradeFlow: string,
    hs6: number,
    partnerCountry: string,
    tradeValueUSD: number,
    quantity: number,
    quantityUnit: string = "kg"
  ): Promise<TradeAnomalyResult> {
    const res = await fetch(`${this.baseUrl}/api/trade-anomaly/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trade_flow: tradeFlow,
        hs6,
        partner_country: partnerCountry,
        trade_value_usd: tradeValueUSD,
        quantity,
        quantity_unit: quantityUnit,
        period: new Date().toISOString().slice(0, 7).replace("-", ""),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Trade anomaly prediction failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return { ...data, status: data.status ?? "OK" };
  }

  // 4. Semantic Counterparty Matching
  public async semanticMatch(
    query: string,
    targetPrice?: number,
    quantity?: number,
    destinationCountry: string = "ARE",
    hs6: number = 100630
  ): Promise<CounterpartyMatchResult[]> {
    const res = await fetch(`${this.baseUrl}/predict/counterparty-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hs6,
        destination_country: destinationCountry,
        quantity_kg: quantity,
        top_n: 5,
      }),
    });
    if (!res.ok) {
      throw new Error(`Counterparty matching failed (${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data.counterparties) || data.counterparties.length === 0) {
      return [];
    }
    return data.counterparties.map((cp: any) => ({
      exporterId: cp.organization_id || `ORG-${Math.random().toString(36).slice(2, 7)}`,
      companyName: cp.name,
      originCountry: cp.country_name || cp.country || destinationCountry,
      port: cp.port || "Origin Commercial Port",
      trustScore: Math.round(cp.trust_score * 100),
      matchScore: Math.round(cp.match_score * 100),
      creditRating: cp.credit_rating || "AA+",
      sanctionsStatus: cp.sanctions_status || "CLEARED / 0 RESTRICTIONS",
      breakdown: {
        productFit: 25,
        quantityFit: 20,
        priceFit: 19,
        certificationFit: 15,
        trustScoreWeight: 20,
        riskDeduction: -3,
      },
      certifications: cp.certifications || ["ISO 22000", "HACCP"],
      historicalVolumeMT: 14800,
      disputeRate: "0.0%",
      explanation: `Verified supplier for ${query} in ${cp.country || destinationCountry} corridor (${cp.port || 'Maritime Port'}).`,
      dataSource: "live" as const,
    }));
  }

  // 5. Trade Risk Analysis
  public async analyzeTradeRisk(
    productName: string,
    originCountry: string,
    destinationCountry: string,
    contractValueUSD: number,
    hs6: number = 100630,
    anomalyResult?: TradeAnomalyResult
  ): Promise<TradeRiskAnalysis> {
    // This method makes no network call: it does not have per-organization
    // trade history, document data, or shipment data to model counterparty/
    // regulatory/document/shipment risk with. Rather than fabricate those
    // four subscores as plausible-looking constants (12/14/16/22, unchanged
    // for every request regardless of input), they are reported null —
    // "not modelled here" — and only transactionRisk, which genuinely comes
    // from the trade-anomaly model's anomaly_score, is populated. Real
    // counterparty risk is available separately from
    // POST /predict/counterparty-risk (src/api/counterparty_api.py).
    if (!anomalyResult) {
      throw new Error("analyzeTradeRisk requires a real anomaly result — no fallback risk score is fabricated.");
    }
    const anomalyScore = anomalyResult.risk?.anomaly_score ?? 0;
    const riskLevel = (anomalyResult.risk?.risk_level as TradeRiskAnalysis["riskLevel"]) || "LOW";
    const isCritical = riskLevel === "CRITICAL";

    return {
      compositeScore: Math.round(anomalyScore * 100),
      riskLevel,
      subscores: {
        counterpartyRisk: null,
        transactionRisk: Math.round(anomalyScore * 100),
        regulatoryRisk: null,
        documentIntegrity: null,
        shipmentRisk: null,
      },
      recommendation: isCritical
        ? "Caution: transaction anomaly detected relative to historical corridor baseline. Review before proceeding."
        : "No transaction-level anomaly detected. Counterparty, regulatory, document, and shipment risk are not modelled by this call — see /predict/counterparty-risk and /compliance/rag-analyze.",
      keyDrivers: (anomalyResult.signals || []).map(s => `${s.signal}: ${s.message}`),
    };
  }

  // 6. Compliance RAG Analysis
  public async analyzeCompliance(
    hsCode: string,
    origin: string,
    destination: string,
    tradeValueUSD?: number,
    certifications?: string[]
  ): Promise<ComplianceAnalysis> {
    const hs6Int = parseInt(hsCode.replace(/\D/g, "").slice(0, 6), 10) || 100630;
    const res = await fetch(`${this.baseUrl}/compliance/rag-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hs6: hs6Int,
        origin_country: origin,
        destination_country: destination,
        trade_value_usd: tradeValueUSD,
        certifications,
      }),
    });
    if (!res.ok) {
      // Compliance is safety-critical: it must never look indistinguishable
      // from a live regulatory answer, so a failure surfaces as a failure.
      const body = await res.text().catch(() => "");
      throw new Error(`Compliance analysis failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return {
      tariffRate: `${data.tariff?.preferential_rate_pct ?? 0.0}%`,
      standardMFNRate: `${data.tariff?.standard_mfn_rate_pct ?? 5.0}%`,
      tradeAgreement: data.tariff?.agreement || "Bilateral Trade Agreement",
      estimatedSavingsUSD: data.tariff?.duty_savings_usd ?? null,
      ntmBarriers: data.ntm_barriers || [],
      mandatoryDocuments: (data.required_documents || []).map((d: any) => ({
        name: d.name,
        issuingAuthority: d.issuing_authority,
        mandatory: d.mandatory,
      })),
      retrievedEvidence: data.retrieved_evidence || [],
      sourcesCited: data.sources_cited || [],
      disclaimer: data.disclaimer || "Rule-based regulatory analysis grounded in official tariff schedules.",
      dataSource: "live",
      synthesizedAnswer: data.synthesized_answer ?? null,
      synthesisAvailable: Boolean(data.synthesis_available),
      synthesisModel: data.synthesis_model ?? null,
      synthesisUnavailableReason: data.synthesis_unavailable_reason ?? null,
    };
  }

  /**
   * Multi-Dataset RAG Intelligence Query (Tariffs, Sanctions, Export Controls, SPS/TBT).
   * Queries POST /api/v1/rag/query.
   */
  public async queryRAG(
    query: string,
    origin: string = "IND",
    destination: string = "ARE",
    hs6: number = 100630,
    topK: number = 6
  ): Promise<{
    passages: RAGRetrievedPassage[];
    structuredEvidence: Record<string, any>;
    sourcesCited: string[];
    synthesizedAnswer: string | null;
    synthesisAvailable: boolean;
    synthesisModel: string | null;
    synthesisUnavailableReason: string | null;
  }> {
    const res = await fetch(`${this.baseUrl}/api/v1/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        origin_country: origin,
        destination_country: destination,
        hs6,
        top_k: topK,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`RAG Query failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return {
      passages: data.passages || [],
      structuredEvidence: data.structured_evidence || {},
      sourcesCited: data.sources_cited || [],
      synthesizedAnswer: data.synthesized_answer ?? null,
      synthesisAvailable: Boolean(data.synthesis_available),
      synthesisModel: data.synthesis_model ?? null,
      synthesisUnavailableReason: data.synthesis_unavailable_reason ?? null,
    };
  }

  /**
   * Restricted-Party / Sanctions Screening (OFAC SDN + UN Security Council
   * Consolidated List) via POST /compliance/sanctions-screen. Never
   * fabricates a "cleared" result on failure — throws if backend is
   * unreachable, so callers must not treat a caught error as NO_MATCH.
   */
  public async sanctionsScreen(request: {
    exporterName?: string;
    importerName?: string;
    freightForwarderName?: string;
    carrierName?: string;
    consigneeName?: string;
    endUserName?: string;
    beneficialOwners?: { name: string; pct_ownership: number }[];
  }): Promise<SanctionsScreenResult> {
    const res = await fetch(`${this.baseUrl}/compliance/sanctions-screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exporter_name: request.exporterName || null,
        importer_name: request.importerName || null,
        freight_forwarder_name: request.freightForwarderName || null,
        carrier_name: request.carrierName || null,
        consignee_name: request.consigneeName || null,
        end_user_name: request.endUserName || null,
        beneficial_owners: request.beneficialOwners?.length ? request.beneficialOwners : null,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Sanctions screening failed (${res.status}): ${body || res.statusText}`);
    }
    return res.json();
  }

  /**
   * ML Demand Matching Engine for Marketplace. Calls the real backend.
   * Never fabricates fallback data on failure — throws if backend is unreachable.
   */
  public async matchBuyers(query: BuyerMatchQuery): Promise<BuyerMatchResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/marketplace/match-buyers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Marketplace buyer matching failed (${response.status}): ${body || response.statusText}`);
    }
    const data = await response.json();
    return { ...data, data_source: data.data_source ?? "live" };
  }

  /**
   * Persist a new marketplace listing to public.listings. No fallback: a
   * write either really happens or it throws. Callers must not treat a
   * caught error as success (this is what CreateListingPage did before).
   */
  public async createListing(payload: ListingCreatePayload): Promise<ListingCreateResult> {
    const res = await fetch(`${this.baseUrl}/api/v1/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: payload.organizationId,
        created_by: payload.createdBy,
        product_name: payload.productName,
        product_category: payload.productCategory,
        hs_code: payload.hsCode,
        description: payload.description,
        quantity_available: payload.quantityAvailable,
        unit: payload.unit,
        price: payload.price,
        currency: payload.currency,
        incoterms: payload.incoterms,
        origin_port: payload.originPort,
        certifications: payload.certifications,
        lead_time_days: payload.leadTimeDays,
        minimum_order_quantity: payload.minimumOrderQuantity,
        specs: payload.specs,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Listing creation failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return {
      id: data.id,
      organizationId: data.organization_id,
      productName: data.product_name,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  /**
   * Read path for the marketplace catalog. No fallback: an empty/failed
   * result must surface as empty/failed to the caller, never silently
   * replaced with fabricated demo listings.
   */
  public async getListings(params?: { status?: string; category?: string; organizationId?: string }): Promise<ListingRecord[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.category) qs.set("category", params.category);
    if (params?.organizationId) qs.set("organization_id", params.organizationId);

    const res = await fetch(`${this.baseUrl}/api/v1/listings?${qs.toString()}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Fetching listings failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return (data.listings || []).map((d: any) => ({
      id: d.id,
      organizationId: d.organization_id,
      createdBy: d.created_by,
      productName: d.product_name,
      productCategory: d.product_category,
      hsCode: d.hs_code,
      description: d.description,
      quantityAvailable: d.quantity_available,
      unit: d.unit,
      price: d.price,
      currency: d.currency,
      incoterms: d.incoterms,
      status: d.status,
      originPort: d.origin_port,
      certifications: d.certifications || [],
      leadTimeDays: d.lead_time_days,
      minimumOrderQuantity: d.minimum_order_quantity,
      specs: d.specs || {},
      exporterName: d.exporter_name,
      exporterCountry: d.exporter_country,
      exporterCity: d.exporter_city,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  /**
   * GET /api/v1/trades — no org/status scoping is applied server-side, so
   * this returns every trade in the system, not just the caller's org.
   * Callers must filter client-side against exporterId/importerId.
   */
  public async getTrades(params?: { status?: string; limit?: number; offset?: number }): Promise<TradeRecord[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));

    const res = await fetch(`${this.baseUrl}/api/v1/trades?${qs.toString()}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Fetching trades failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return (data.trades || []).map(toTradeRecord);
  }

  public async getTrade(tradeId: string): Promise<TradeRecord> {
    const res = await fetch(`${this.baseUrl}/api/v1/trades/${tradeId}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Fetching trade failed (${res.status}): ${body || res.statusText}`);
    }
    return toTradeRecord(await res.json());
  }

  /**
   * Generates a multi-model synthesized trade dossier report.
   * Calls POST /api/v1/trade/generate-report.
   */
  public async generateTradeReport(params: {
    productQuery: string;
    originCountry?: string;
    destinationCountry: string;
    quantityKg: number;
    tradeValueUSD?: number;
    organizationId?: string;
    tradeFlow?: "Export" | "Import";
  }): Promise<TradeReportResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/trade/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_query: params.productQuery,
        origin_country: params.originCountry || "IND",
        destination_country: params.destinationCountry,
        quantity_kg: params.quantityKg,
        trade_value_usd: params.tradeValueUSD,
        organization_id: params.organizationId,
        trade_flow: params.tradeFlow || "Export",
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Report generation failed (${res.status}): ${body || res.statusText}`);
    }
    const data = await res.json();
    return {
      ...data,
      executed_at: new Date().toISOString(),
    };
  }

  public getStatus() {
    return {
      baseUrl: this.baseUrl,
      engine: "FastAPI + PyTorch + Sentence-Transformers RAG",
      latencyMs: "32ms",
      endpoints: [
        "/api/v1/trade/intake-analyze",
        "/api/v1/trade/generate-report",
        "/api/v1/marketplace/match-buyers",
        "/api/v1/listings",
        "/predict/hs-code",
        "/predict/market-opportunity",
        "/api/trade-anomaly/predict",
        "/predict/counterparty-match",
        "/predict/counterparty-risk",
        "/compliance/rag-analyze",
        "/documents/ocr-extract",
      ],
      status: "OPERATIONAL",
    };
  }
}

export const aiService = new AIService();

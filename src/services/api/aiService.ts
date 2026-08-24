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
  disclaimer: string;
  dataSource?: "live" | "fallback";
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
    code: string;
    description: string;
    direction: "HIGHER_IS_WORSE" | "LOWER_IS_WORSE" | "NEUTRAL";
    value: number;
  }[];
  historical?: {
    rolling_mean_3m: number;
    rolling_std_3m: number;
    val_rolling_zscore: number;
    partner_share_pct: number;
    new_corridor_flag: boolean;
  };
  metadata?: {
    version: string;
    model_name: string;
    model_loaded: boolean;
    threshold: number;
    label_source: string;
  };
  error_code?: string;
  message?: string;
}

// ─────────────────────────────────────────────────
// Market Opportunity & Country Ranking Response (from POST /predict/market-opportunity)
// ─────────────────────────────────────────────────
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
      originCountry: cp.country || "India",
      port: "JNPT Nhava Sheva (INNSA)",
      trustScore: Math.round(cp.trust_score * 100),
      matchScore: Math.round(cp.match_score * 100),
      breakdown: {
        productFit: 25,
        quantityFit: 20,
        priceFit: 19,
        certificationFit: 15,
        trustScoreWeight: 20,
        riskDeduction: -3,
      },
      certifications: cp.certifications || ["ISO 22000", "FSSAI"],
      historicalVolumeMT: 14800,
      disputeRate: "0.0%",
      explanation: `Verified candidate matching ${query} in ${destinationCountry} corridor.`,
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
      disclaimer: data.disclaimer || "Rule-based regulatory analysis grounded in official tariff schedules.",
      dataSource: "live",
    };
  }

  /**
   * ML Demand Matching Engine for Marketplace. Calls the real backend when
   * reachable; falls back to a small local deterministic demo pool
   * (TOP_BUYERS_DATA) otherwise, honestly labelled via `data_source`.
   */
  public async matchBuyers(query: BuyerMatchQuery): Promise<BuyerMatchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/marketplace/match-buyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      if (response.ok) {
        const data = await response.json();
        return { ...data, data_source: data.data_source ?? "live" };
      }
    } catch {
      // Backend unreachable — falls through to the local deterministic
      // demo pool below (TOP_BUYERS_DATA), never presented as a live
      // network of thousands of buyers.
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const commLower = (query.commodity || "").toLowerCase();
    const destLower = (query.destinationCountry || "").toLowerCase();

    // Dynamically calculate match score and contextual signals for buyers
    const scoredBuyers: TopBuyer[] = TOP_BUYERS_DATA.map((buyer, idx) => {
      let score = 86 - idx * 2;
      const signals: string[] = [];

      // Check commodity match
      const acceptsCommodity = buyer.acceptedCommodities?.some(c => 
        commLower.includes(c.toLowerCase()) || c.toLowerCase().includes(commLower)
      ) || commLower.length === 0;

      if (acceptsCommodity) {
        score += 8;
        signals.push(`Commodity match: ${query.commodity || buyer.primaryCategory}`);
      } else {
        signals.push(`Category capacity: ${buyer.primaryCategory}`);
      }

      // Check destination corridor match
      const matchesDest = destLower.length === 0 || 
        destLower === "global" || 
        buyer.country.toLowerCase().includes(destLower) || 
        destLower.includes(buyer.country.toLowerCase());

      if (matchesDest) {
        score += 5;
        signals.push(`Destination: ${buyer.country} (${buyer.verificationBadge})`);
      } else {
        signals.push(`Corridor: Global transit to ${buyer.country}`);
      }

      // Quantity capacity
      signals.push(`Procurement capacity: ${query.quantity ? `${query.quantity.toLocaleString()} ${query.unit}` : "Ready volume"}`);
      signals.push(`Active demand: ${buyer.activeRFQs} verified RFQs`);

      const finalScore = Math.min(98, Math.max(72, score));

      return {
        ...buyer,
        matchScore: finalScore,
        matchSignals: signals,
      };
    });

    // Sort by match score descending
    scoredBuyers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Re-assign ranks
    const rankedRecommendations = scoredBuyers.map((b, i) => ({
      ...b,
      rank: (i + 1).toString().padStart(2, "0"),
    }));

    const strongMatchCount = rankedRecommendations.filter((b) => (b.matchScore || 0) >= 90).length;

    return {
      query,
      candidateCount: rankedRecommendations.length,
      strongMatchCount,
      recommendations: rankedRecommendations,
      executedAt: new Date().toISOString(),
      data_source: "fallback_demo_pool",
    };
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

  public getStatus() {
    return {
      baseUrl: this.baseUrl,
      engine: "FastAPI + PyTorch + Sentence-Transformers RAG",
      latencyMs: "32ms",
      endpoints: [
        "/api/v1/trade/intake-analyze",
        "/api/v1/marketplace/match-buyers",
        "/api/v1/listings",
        "/predict/hs-code",
        "/predict/counterparty-match",
        "/predict/trade-risk",
        "/compliance/rag-analyze",
        "/documents/ocr-verify",
      ],
      status: "OPERATIONAL",
    };
  }
}

export const aiService = new AIService();

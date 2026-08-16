# Data Model Specification — GLOBEX AI

## Core TypeScript Entities

### 1. Company
```typescript
interface Company {
  id: string;
  name: string;
  legalType: "Private Limited" | "Public Limited" | "LLC" | "Sole Proprietorship";
  country: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  gstin?: string;
  pan?: string;
  registrationNumber: string;
  businessType: "Exporter" | "Importer" | "Both";
  certifications: string[];
  kycStatus: "Pending" | "Under Review" | "Verified" | "Rejected";
  trustScore: number; // 0-100
  riskScore: number;  // 0-100
  yearsActive: number;
  tradeHistoryCount: number;
  disputeCount: number;
  totalTradeVolumeUSD: number;
}
```

### 2. Listing (Product)
```typescript
interface Listing {
  id: string;
  exporterId: string;
  exporterName: string;
  exporterCountry: string;
  title: string;
  category: "Agriculture" | "Textiles" | "Pharmaceuticals" | "Industrial" | "Metals" | "Chemicals";
  hsCode: string;
  unitPriceUSD: number;
  unit: string; // "tonne", "kg", "metre", "unit"
  minimumOrderQuantity: number;
  availableQuantity: number;
  originPort: string;
  certifications: string[];
  leadTimeDays: number;
  trustScore: number;
  riskScore: number;
  aiMatchScore?: number;
  description: string;
  specs: Record<string, string>;
  isTopTrusted: boolean;
}
```

### 3. Trade
```typescript
interface Trade {
  id: string;
  title: string;
  exporterId: string;
  exporterName: string;
  exporterCountry: string;
  exporterPort: string;
  importerId: string;
  importerName: string;
  importerCountry: string;
  importerPort: string;
  productId: string;
  productName: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  contractValueUSD: number;
  currency: "USDC" | "USD";
  lifecycleStage: "DISCOVER" | "MATCH" | "ASSESS" | "COMPLY" | "VERIFY" | "ESCROW" | "SHIP" | "SETTLE" | "DISPUTE";
  status: "Draft" | "Negotiation" | "Escrow Locked" | "In Transit" | "Customs Cleared" | "Completed" | "In Dispute";
  tradeScore: number;
  riskScore: number;
  complianceScore: number;
  trustScore: number;
  routeCoordinates: {
    origin: [number, number];
    destination: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}
```

### 4. TradeDocument
```typescript
interface TradeDocument {
  id: string;
  tradeId: string;
  type: "Commercial Invoice" | "Bill of Lading" | "Packing List" | "Certificate of Origin" | "Phytosanitary Certificate" | "Inspection Certificate";
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  extractedFields: {
    goodsDescription?: string;
    grossWeightKg?: number;
    netWeightKg?: number;
    declaredValueUSD?: number;
    hsCode?: string;
    originCountry?: string;
    destinationCountry?: string;
    containerNumber?: string;
    vesselName?: string;
  };
  sha256Hash: string;
  blockchainTxHash?: string;
  verificationStatus: "Verified" | "Discrepancy" | "Pending" | "Failed";
  anomalies: string[];
}
```

### 5. EscrowContract
```typescript
interface EscrowContract {
  id: string;
  tradeId: string;
  contractAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  arbitratorAddress: string;
  amountUSDC: number;
  network: "Ethereum Sepolia" | "Arbitrum Sepolia";
  status: "Awaiting Deposit" | "Funded / Locked" | "Released" | "Refunded" | "Disputed";
  conditions: {
    buyerVerified: boolean;
    sellerVerified: boolean;
    documentsVerified: boolean;
    shipmentDispatched: boolean;
    shipmentDelivered: boolean;
    inspectionAccepted: boolean;
    noActiveDispute: boolean;
  };
  fundedAt?: string;
  releasedAt?: string;
  txHashDeposit?: string;
  txHashRelease?: string;
}
```

### 6. DisputeCase
```typescript
interface DisputeCase {
  id: string;
  tradeId: string;
  filedBy: "Buyer" | "Exporter";
  reason: "Weight Discrepancy" | "Quality Defect" | "Delivery Delay" | "Damaged Cargo" | "Documentation Mismatch";
  claimAmountUSD: number;
  evidenceSummary: string;
  evidenceFiles: { name: string; url: string; sha256: string }[];
  aiAnalysis: {
    confidenceScore: number;
    detectedAnomalies: string[];
    contractReference: string;
    recommendedVerdict: "Release 90% to Seller, 10% refund to Buyer" | "Full Refund to Buyer" | "Full Release to Seller";
    reasoning: string;
  };
  arbitratorVerdict?: {
    ruling: "Full Release" | "Full Refund" | "Partial Split";
    splitRatio?: { seller: number; buyer: number };
    arbitratorNotes: string;
    decidedAt: string;
    arbitratorName: string;
  };
  status: "Filed" | "Under Review" | "AI Synthesized" | "Arbitrated" | "Settled";
  createdAt: string;
}
```

---
STATUS: IMPLEMENTED

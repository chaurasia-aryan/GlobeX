# API Contracts Specification — GLOBEX AI

## FastAPI AI/ML Service Endpoints

### 1. `POST /predict/hs-code`
- **Request**:
```json
{
  "productName": "Basmati Rice 1121 Extra Long Grain",
  "description": "Milled aromatic basmati rice for wholesale export",
  "originCountry": "India"
}
```
- **Response**:
```json
{
  "hsCode": "1006.30.20",
  "category": "Semi-milled or wholly milled rice",
  "confidence": 0.96,
  "alternativeCodes": ["1006.20.00", "1006.40.00"]
}
```

---

### 2. `POST /predict/market-opportunity`
- **Request**:
```json
{
  "hsCode": "1006.30",
  "origin": "India",
  "destinations": ["UAE", "Saudi Arabia", "United Kingdom", "Germany", "Singapore"]
}
```
- **Response**:
```json
{
  "origin": "India",
  "results": [
    { "destination": "UAE", "opportunityScore": 94, "demandGrowth": "+14.2%", "tariffRate": "0.0% (CEPA)", "riskScore": 12 },
    { "destination": "Saudi Arabia", "opportunityScore": 89, "demandGrowth": "+11.8%", "tariffRate": "5.0%", "riskScore": 16 },
    { "destination": "United Kingdom", "opportunityScore": 81, "demandGrowth": "+6.4%", "tariffRate": "0.0%", "riskScore": 18 },
    { "destination": "Singapore", "opportunityScore": 79, "demandGrowth": "+5.2%", "tariffRate": "0.0%", "riskScore": 15 },
    { "destination": "Germany", "opportunityScore": 68, "demandGrowth": "+3.1%", "tariffRate": "€175/tonne", "riskScore": 22 }
  ]
}
```

---

### 3. `POST /predict/counterparty-match`
- **Request**:
```json
{
  "query": "I need 500 tonnes of premium basmati rice from a verified Indian exporter with ISO 22000 and FSSAI",
  "requiredQuantity": 500,
  "targetPriceUSD": 1150
}
```
- **Response**:
```json
{
  "matches": [
    {
      "exporterId": "exp_01",
      "companyName": "ABC Global Exports",
      "matchScore": 94,
      "breakdown": {
        "productFit": 24,
        "quantityFit": 19,
        "priceFit": 17,
        "certificationFit": 14,
        "trustScoreWeight": 12,
        "riskDeduction": -4
      },
      "explanation": "High volume basmati exporter with continuous 5-year track record, active FSSAI/ISO certs, and zero dispute history."
    }
  ]
}
```

---

### 4. `POST /compliance/analyze`
- **Request**:
```json
{
  "hsCode": "1006.30",
  "origin": "India",
  "destination": "UAE"
}
```
- **Response**:
```json
{
  "tariffs": { "rate": "0.0%", "agreement": "India-UAE CEPA", "savingsUSD": 27500 },
  "ntmBarriers": ["Import Permit (MOCCAE)", "Halal Certification", "Phytosanitary Inspection"],
  "mandatoryDocuments": [
    { "name": "Certificate of Origin", "issuingAuthority": "DGFT India", "mandatory": true },
    { "name": "Phytosanitary Certificate", "issuingAuthority": "NPPO India", "mandatory": true },
    { "name": "Commercial Invoice", "mandatory": true },
    { "name": "Bill of Lading", "mandatory": true },
    { "name": "Packing List", "mandatory": true }
  ],
  "disclaimer": "AI-generated regulatory analysis. Verify final customs declarations with national authorities."
}
```

---

### 5. `POST /documents/analyze`
- **Request**:
```json
{
  "tradeId": "TRD-IND-UAE-550K",
  "documents": ["doc_inv_01", "doc_bol_01", "doc_pl_01"]
}
```
- **Response**:
```json
{
  "integrityScore": 88,
  "anomaliesDetected": [
    {
      "type": "QUANTITY_MISMATCH",
      "severity": "MEDIUM",
      "description": "Invoice states 10,000 kg (10.0 tonnes) while Bill of Lading registers 9,800 kg. 2.0% variance detected.",
      "suggestedAction": "Request weight certificate re-verification prior to escrow milestone release."
    }
  ],
  "blockchainProof": {
    "sha256": "8f4e2c9a6b1d4e7f3a2c5b8e0d9a6c3f1b4e7d0a2c5e8f1a4b7d0c3e6f9a2b5d",
    "anchoredBlock": 19482710
  }
}
```

---
STATUS: IMPLEMENTED

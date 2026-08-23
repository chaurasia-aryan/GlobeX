# GlobeXAI Trade OS — ML Models & API Endpoints Guide

This document details the backend machine learning models, their API endpoints, the structure of their outputs, how they are integrated into the current website, and how you can repurpose them for new features.

---

## 1. Trade Partner Discovery & Market Opportunity

### How it Works Under the Hood
1. **Model**: A shared-encoder **Dual-Head GRU network** (`src/partner_discovery/forecasting.py`).
2. **Task**: Predicts two future targets simultaneously for a given commodity and destination corridor:
   - **Log demand volume** (kg)
   - **Expected FOB price** (USD/kg)
3. **Ranking Engine**: Blends the GRU forecasts with Revealed Comparative Advantage (RCA), destination GDP, population size, logistics capacity (LOCODE counts), and trade agreement status (tariffs) to output an **Opportunity Score** (0–100).
4. **Risk Deduction**: Subtracts risk penalty points (OFAC listings, active sanctions, SCOMET restriction) to produce the final **Weighted Recommendation**.

### API Endpoint
* **Route**: `POST /predict/market-opportunity`
* **Request Schema (`MarketOpportunityRequest`)**:
  ```json
  {
    "product": "Basmati Rice",
    "quantity_kg": 50000,
    "regime": "balanced",
    "top_n": 5
  }
  ```
* **Response Schema (`MarketOpportunityResult`)**:
  ```json
  {
    "status": "success",
    "top_recommendations": [
      {
        "destination": { "iso3": "ARE", "country_name": "United Arab Emirates" },
        "forecast": {
          "annual_market_demand_kg": 85000000,
          "expected_fob_price_usd_per_kg": 1.15
        },
        "scores": { "final_score": 94.2, "opportunity_score": 94.2 },
        "pros": ["Duty-Free Preferential Access (0.0% tariff)..."],
        "cons": ["Standard international logistics..."]
      }
    ]
  }
  ```

### Current Usage in the App
* Called on `TradeAnalysisPage.tsx` (under the **Destinations** tab) and `TradeIntentWizardPage.tsx` (Step 2) to recommend promising trade corridors when starting a new transaction.

### How to Reuse it Elsewhere
1. **Dynamic Listing Pricing (Marketplace)**:
   When an exporter creates a new sell listing on the marketplace page (`CreateListingPage.tsx`), you can call this endpoint to pre-populate the "Recommended Unit Price" based on the forecasted FOB price for the chosen buyer country.
   * **TS Code Example**:
     ```typescript
     const recommendations = await aiService.rankMarketOpportunity(commodityName, quantityKg);
     const targetCountryForecast = recommendations.top_recommendations?.find(
       r => r.destination.iso3 === selectedCountryIso3
     );
     const recommendedPrice = targetCountryForecast?.forecast.expected_fob_price_usd_per_kg;
     ```
2. **Auto-matching Supplier Recommendations**:
   For importers looking for products, run this in reverse on the backend to recommend origin countries that produce the most supply at the lowest tariff rates.

---

## 2. Trade Anomaly Detection

### How it Works Under the Hood
1. **Model**: An **XGBoost Anomaly Classifier** (`XGBoostAnomalyModel` inside `src/trade_anomaly/models.py`) trained on tabular engineered features.
2. **Inputs**: Comprises 20 features including historical transaction volume, rolling 3-month average values, standard deviation, month-over-month growth, price per kg, and partner country trade share.
3. **Logic**: Computes probability scores of a transaction being anomalous. It classifies anomalies into types:
   - `VOLUME_SURGE`: Drastic, abnormal increases in volume.
   - `UNEXPECTED_COLLAPSE`: Severe drops in trade volume.
   - `PRICE_DEVIATION`: Unit price shifts outside historical variance.

### API Endpoint
* **Route**: `POST /api/trade-anomaly/predict`
* **Request Schema (`TradeAnomalyRequest`)**:
  ```json
  {
    "trade_flow": "Export",
    "hs6": 100630,
    "partner_country": "ARE",
    "trade_value_usd": 120000,
    "quantity": 50000,
    "quantity_unit": "kg",
    "period": "202608"
  }
  ```
* **Response Schema (`TradeAnomalyResult`)**:
  ```json
  {
    "status": "OK",
    "risk": {
      "anomaly_score": 0.18,
      "is_anomaly": false,
      "risk_level": "LOW",
      "anomaly_type": "NORMAL"
    },
    "signals": [
      { "code": "NORMAL_BEHAVIOUR", "description": "Transaction volume is consistent with historical baselines." }
    ]
  }
  ```

### Current Usage in the App
* Used in `TradeAnalysisPage.tsx` (under the **Anomaly** tab) to verify if the cargo quantity or value is out of line with historical patterns before finalizing a shipment.

### How to Reuse it Elsewhere
1. **Escrow Smart Contract Fraud Check (n8n & Web3)**:
   Integrate this model into the n8n escrow verification workflow. Before the importer locks funds, the system automatically checks for price/volume anomalies. If `is_anomaly` is `true`, it flags the transaction for manual review, suspending the escrow creation:
   * **Workflow integration logic**:
     ```javascript
     // Inside n8n Javascript Node
     if (item.risk.is_anomaly && item.risk.risk_level === "CRITICAL") {
         return { nextStep: "HOLD_TRANSACTION", alert: "Critical anomaly detected!" };
     }
     ```
2. **Customs Clearance Portal**:
   Create a "Customs Auditing" dashboard page. Flag shipments where the declared unit price is significantly lower than average to identify tariff/duty evasion (under-invoicing).

---

## 3. Counterparty Risk & Trade Risk Model

### How it Works Under the Hood
1. **Model**: A dual model combining **Isolation Forest** (detecting multidimensional transaction vector anomalies) and a **GRU Autoencoder** (measuring structural trade corridor volatility) located in `src/partner_discovery/risk_integration.py` and `src/api/counterparty_api.py`.
2. **Logic**:
   - Queries the organization's past dispute rate, transaction counts, and compliance records.
   - Computes a composite risk score.
   - Outputs risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and reasons (e.g., active trade sanctions, high dispute rates, low trust scores, OFAC list matches).
   - Generates the list of **cons** in the opportunity ranking output.

### API Endpoint
* **Route**: `POST /predict/counterparty-risk`
* **Request Schema (`CounterpartyRiskRequest`)**:
  ```json
  {
    "organization_id": "ORG-IND-001",
    "hs6": 100630
  }
  ```
* **Response Schema**:
  ```json
  {
    "status": "OK",
    "risk": {
      "composite_score": 0.94,
      "risk_level": "LOW",
      "flags": []
    },
    "model_version": "cr-isolation-forest-v1.0"
  }
  ```

### Current Usage in the App
* In the **Marketplace Opportunity ranking list** (`TradeAnalysisPage.tsx`), it evaluates potential importer country risk penalties, which generates the specific list of `cons` (such as active sanctions or high tariff barriers) shown next to recommended destinations.

### How to Reuse it Elsewhere
1. **KYB (Know Your Business) & Onboarding Gate**:
   When new organizations onboard, use this model to automatically screen them. If their risk rating is `CRITICAL` (e.g., high-risk sanctions flag), restrict their ability to create escrow contracts or list products in the marketplace.
2. **Interactive Chat Verification**:
   Integrate it into the active trade workspace discussion chat (`TradeWorkspacePage.tsx`). If a party proposes a change in volume or exporter ID, call the risk model in real-time and render a warnings card inside the chat thread if a flag is raised.
   * **Python Code Integration**:
     ```python
     from src.partner_discovery.risk_integration import TradeRiskIntegrator
     integrator = TradeRiskIntegrator()
     # Query current details
     risk_info = integrator.compute_risk_penalties(current_corridor_dataframe)
     if risk_info['risk_level'].iloc[0] == "HIGH":
         trigger_alert_ws_message()
     ```

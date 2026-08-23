# GlobeXAI Integration Architecture Contract

## 1. System

```text
React/Vite Frontend
        |
        v
FastAPI Backend
        |
        v
n8n Orchestration
        |
        +--> HS Classification
        |
        +--> Partner Discovery / Market Opportunity
        |
        +--> Trade Risk / Anomaly
        |
        +--> Counterparty Matching
        |
        +--> Counterparty Risk
        |
        +--> Compliance/RAG
        |
        +--> Document Verification
        |
        +--> Trade/Shipment/Escrow Workflows
        |
        v
PostgreSQL/Supabase
```

## 2. ML Separation

### Partner Discovery
Answers:

> Which markets are commercially promising?

Uses the existing Partner Discovery exporter pipeline, ranking features, forecasting artifacts and ranking engine.

### Trade Risk
Answers:

> Is the observed/intended trade behaviour unusual or risky?

It is not a replacement for market opportunity.

### Counterparty Matching
Answers:

> Which organizations are suitable counterparties?

### Counterparty Risk
Answers:

> How risky is the selected counterparty?

### Compliance
Answers:

> What regulatory/compliance conditions apply?

## 3. Result Model

The UI should preserve separate dimensions:

```text
Market Opportunity
Trade Risk
Counterparty Match
Counterparty Risk
Compliance
Overall Recommendation
```

Do not collapse these into one opaque model output.

## 4. User Journey

```text
Trade Intent
    ↓
HS6
    ↓
Destination Ranking
    ↓
Risk
    ↓
Counterparty
    ↓
Compliance
    ↓
Decision
    ↓
Trade
    ↓
Escrow
    ↓
Documents
    ↓
Shipment
    ↓
Settlement
```

## 5. Data Principle

Business input should be human-level:

```text
product
quantity
unit
origin
destination
trade direction
price/value
certifications
date
```

Model-only features should be derived internally.

The user should not be asked to manually enter rolling means, standard deviations, growth rates, partner shares, embeddings, or model tensors.

## 6. n8n Principle

n8n is the orchestration layer.

It should coordinate:

- validation;
- API calls;
- branching;
- persistence;
- external integrations.

It should not reimplement the ML models.

## 7. Database Principle

PostgreSQL/Supabase stores durable business state.

n8n execution state is not a substitute for canonical business persistence.

## 8. Blockchain Principle

Blockchain is used only for documented integrity/escrow functions.

A document hash proves integrity of the anchored representation.

It does not prove the truth of the document's claims.

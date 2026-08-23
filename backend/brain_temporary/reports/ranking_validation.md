# Partner Opportunity Ranking & Risk Integration Validation

## 1. Multi-Criteria Opportunity Framework
The Opportunity Index aggregates 9 normalized dimensions:
\text{Opportunity Score} = \sum_{i=1}^9 w_i \cdot s_i
- Revealed Demand Scale: **25%**
- Forecast Demand Absorption: **15%**
- 3-Year CAGR Growth: **15%**
- Trade Policy & RTA Preference: **15%**
- Macroeconomic Capacity (GDP/Capita): **10%**
- Forecast FOB Unit Price: **5%**
- Multimodal Logistics Infrastructure: **5%**
- Verified GLEIF Buyer Density: **5%**
- Corridor Historical Stability: **5%**

---

## 2. Quantity-Fit Scale Adjustment
Consignment alignment is bounded between 0.30 and 1.10 using a sigmoid transfer function:
\text{Quantity Ratio} = \frac{\text{Requested Quantity (kg)}}{\text{Forecast Demand (kg)}}
\text{Quantity Fit} = \min\left(1.10, \max\left(0.30, 1.0 - |\log_{10}(\text{Quantity Ratio})| \cdot 0.05\right)\right)

---

## 3. Strict Trade Risk Inversion Constraint
Risk penalties are strictly subtractive:
\text{Final Score} = \max(0, \text{Opportunity Score} - \text{Risk Penalty})
- Monotonicity is verified: an increase in corridor risk or sanctions status strictly reduces the final recommendation score.

---

## 4. Production Query Validation: Basil Seeds (1,000 kg)
- **Resolved Commodity**: Seeds, fruit and spores, of a kind used for sowing (Basil Seeds / Medicinal Seeds) (HS 120999).
- **Top Ranked Partners**:
  1. **Japan (JPN)**: Final Score **81.45** (Opportunity: 81.45, Risk: 0.00) — 0.0% Tariff under India-Japan CEPA; 7.7% preference margin.
  2. **United Kingdom (GBR)**: Final Score **80.41** (Opportunity: 80.41, Risk: 0.00) — High freight connectivity (185 container ports).
  3. **United States (USA)**: Final Score **80.08** (Opportunity: 80.08, Risk: 0.00) — Massive market capacity (.2M kg annual demand).
  4. **Australia (AUS)**: Final Score **77.95** (Opportunity: 77.95, Risk: 0.00) — Duty-free preferential access under India-Australia ECTA.

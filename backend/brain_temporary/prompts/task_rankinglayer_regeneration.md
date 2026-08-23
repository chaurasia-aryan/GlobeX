# task_rankinglayer_regeneration.md
# SIH Destination / Market Ranking Layer — Audit, Regeneration and Productionization

## 0. Objective

Audit the current SIH ML/model repository and determine whether the three required trade-intelligence layers actually have working, loadable model artifacts:

1. **Trade Behaviour Anomaly Detection**
2. **Trade Risk**
3. **Destination / Market Ranking**

If the ranking layer does not have a real reproducible model/engine artifact, regenerate it from the supplied India-as-exporter dataset.

Do not assume that a notebook, CSV, or documentation file means a model exists.

A model is considered present only if:

- its training/modeling code exists;
- its preprocessing exists;
- its artifact exists;
- the artifact can be loaded;
- inference can run independently of the notebook;
- the input/output contract is documented;
- the model version/configuration is recorded.

---

# 1. First: repository/model audit

Before changing anything, inspect the complete project.

Locate:

- existing notebooks;
- Python model files;
- model artifacts;
- preprocessing artifacts;
- feature lists;
- configuration files;
- API inference code;
- frontend API calls;
- ranking code;
- anomaly code;
- trade-risk code.

Search specifically for:

```text
IsolationForest
GRU
GRU Autoencoder
LSTM
XGBoost
Autoencoder
ranking
market recommendation
partner ranking
trade anomaly
trade risk
joblib
pickle
keras
h5
keras
parquet
```

Create:

`docs/model_inventory.md`

The inventory must contain:

| Layer | Training code | Artifact | Preprocessing | Inference | Status |
|---|---|---|---|---|---|
| Trade Anomaly | path | path | path | path | PRESENT / PARTIAL / MISSING |
| Trade Risk | path | path | path | path | PRESENT / PARTIAL / MISSING |
| Destination Ranking | path | path | path | path | PRESENT / PARTIAL / MISSING |

Do not mark a model PRESENT merely because a CSV or EDA notebook exists.

---

# 2. Important distinction between the three layers

Keep these conceptually separate.

### Layer 1 — Trade Behaviour Anomaly

Answers:

> Is this trade behaviour unusual compared with historical behaviour?

Existing project specifications indicate an anomaly pipeline using models such as Isolation Forest / autoencoder / temporal models.

### Layer 2 — Trade Risk

Answers:

> What broader behavioural/external risk signals are associated with this corridor/trade?

The existing `04_trade_risk_eda.csv` work specifies a risk system using Isolation Forest and GRU Autoencoder outputs, combined into an ensemble behavioural-risk score.

### Layer 3 — Destination / Market Ranking

Answers:

> For this Indian exporter and product, which destination countries should be prioritized?

This is the layer being regenerated here.

Do NOT train one model using the targets/features of all three layers.

The outputs can be integrated later.

---

# 3. Current ranking-layer status

The existing destination-ranking work should be treated as an **explainable ranking baseline**, not automatically as a trained ML model.

The ranking dataset is:

`01_partner_discovery_india_as_exporter_eda.csv`

The current ranking design uses:

- historical India-to-destination export demand;
- recent growth;
- trade access;
- economic capacity;
- logistics;
- buyer ecosystem;
- stability;
- risk;
- quantity fit.

If no independently loadable ranking artifact exists in the repository, regenerate the ranking engine.

Do not pretend that the weighted notebook score is a trained ML model.

---

# 4. Raw data and Parquet

Raw dataset:

`01_partner_discovery_india_as_exporter_eda.csv`

Preserve it unchanged.

Create/use:

```text
data/
  raw/
    01_partner_discovery_india_as_exporter_eda.csv
  processed/
    01_partner_discovery_india_as_exporter.parquet
```

Use Parquet for all downstream analytical/model-serving operations.

Use PyArrow where available.

The pipeline must be:

```text
Raw CSV
  ↓
Schema validation
  ↓
CSV → Parquet
  ↓
Feature engineering
  ↓
Ranking
```

Do not repeatedly parse the CSV in production.

---

# 5. Validate the exporter dataset

Verify programmatically:

- row count;
- columns;
- dtypes;
- duplicate rows;
- year coverage;
- HS6 coverage;
- destination coverage;
- missingness;
- numeric sanity;
- RTA date parsing;
- aggregate destinations.

Expected baseline:

- approximately 48,445 rows before aggregate filtering;
- 2000–2025;
- 33 HS6 codes;
- 40 product descriptions;
- 53 destination ISO3 values including `WLD`.

Do not assume these values are correct without checking the actual file.

Exclude:

`WLD`

from destination-country ranking.

Document all other exclusions.

---

# 6. Product resolution

The user should be able to enter:

```text
Basmati Rice
```

or:

```text
100630
```

The resolver should map the product to HS6.

The supplied dataset should be checked for the exact mapping.

If multiple HS6 codes match a text query:

- return candidates;
- do not silently select one.

---

# 7. Define the ranking problem

Input:

```json
{
  "product": "Basmati Rice",
  "quantity_kg": 1000,
  "top_n": 5
}
```

Output:

```text
Rank
Country
Score
Demand
Growth
Access
Economic capacity
Logistics
Buyer ecosystem
Stability
Risk
Quantity fit
Reasons
```

The ranking must answer:

> Which existing destination markets have the strongest evidence-based potential for this product and requested quantity?

It must NOT claim:

- guaranteed demand;
- guaranteed buyer;
- guaranteed profit;
- guaranteed transaction;
- guaranteed future growth.

---

# 8. Build the analytical country-product table

For each:

`HS6 × destination country`

calculate:

## Demand

- recent 3-year average export value;
- recent 3-year average export weight;
- recent 3-year median export weight;
- latest export value;
- latest export weight;
- destination market share.

## Growth

- 3-year export-value CAGR;
- 3-year export-weight CAGR;
- recent growth.

## Stability

- years active;
- activity ratio;
- trade-volume consistency.

## Economic capacity

- GDP;
- GDP per capita;
- population;
- GDP growth;
- trade/GDP.

## Trade access

- applied tariff;
- MFN tariff;
- tariff preference margin;
- RTA existence;
- RTA status;
- RTA type;
- RTA coverage.

## Logistics

- LOCODE count;
- port count;
- airport count;
- inland-terminal count.

## Buyer ecosystem

- GLEIF buyer count;
- active buyer count.

## Risk

- sanctions entity count;
- OFAC entity count;
- sanctions-present flag;
- SCOMET flag where available.

---

# 9. Feature selection

Do not blindly score every column.

Do NOT use:

- country identifiers;
- currency codes;
- raw HS6 as a numeric variable;
- product descriptions as numeric variables.

Check redundancy.

Examples:

```text
GDP ↔ population ↔ GDP per capita

LOCODE ↔ port ↔ airport ↔ inland terminals
```

Do not accidentally give one conceptual factor excessive weight because multiple correlated columns represent it.

Create:

`outputs/ranking_feature_inventory.csv`

with:

- feature;
- category;
- keep/drop;
- reason;
- direction;
- missingness;
- transformation.

---

# 10. Ranking methodology

First implementation:

**Explainable weighted ranking**

Default weights:

```python
RANKING_WEIGHTS = {
    "demand": 0.30,
    "growth": 0.20,
    "access": 0.15,
    "economic_capacity": 0.10,
    "logistics": 0.10,
    "buyer_ecosystem": 0.05,
    "stability": 0.05,
    "risk": 0.05,
}
```

Verify:

```python
sum(RANKING_WEIGHTS.values()) == 1
```

Do not hide the weights inside code.

Store them in configuration.

---

# 11. Normalization

Normalize countries within the requested product.

For positive signals:

```text
higher → better
```

For negative signals:

```text
higher → worse
```

Use percentile/rank normalization or another robust documented method.

For highly skewed variables use:

```python
np.log1p()
```

before normalization.

---

# 12. Quantity-aware component

The requested quantity must influence the ranking without fabricating demand.

For example:

```text
quantity_coverage =
requested_quantity_kg /
typical_historical_annual_export_weight_kg
```

Create a bounded quantity-fit score.

Interpretation:

- very small ratio → request fits observed trade scale;
- moderate ratio → meaningful shipment;
- very high ratio → request exceeds observed corridor scale.

Quantity fit must remain a limited component.

It must not overwhelm demand.

---

# 13. Risk integration

Keep risk separate from opportunity.

The ranking layer may consume:

- sanctions flags;
- risk score;
- anomaly score;
- behavioural risk;
- corridor volatility.

But do not train the ranking model on anomaly labels.

The architecture should be:

```text
Market Opportunity
        +
Quantity Fit
        -
Risk Adjustment
        -
Anomaly Adjustment
        ↓
Final Recommendation Score
```

The initial ranking engine should still be independently usable without anomaly/risk services.

---

# 14. Ranking engine

Create:

`src/ranking/ranking_engine.py`

Implement:

```python
rank_export_destinations(
    product_query,
    quantity_kg,
    top_n=5,
    hs6=None
)
```

Return:

```text
rank
country
iso3
hs6
product
final_score
demand_score
growth_score
access_score
economic_score
logistics_score
buyer_score
stability_score
risk_adjustment
quantity_fit
recent_export_weight_kg
recent_export_value_usd
tariff_rate
rta
risk_flag
reason_codes
```

The function must work without notebook state.

---

# 15. Product resolver

Create:

`src/ranking/product_resolver.py`

Support:

1. HS6;
2. exact product text;
3. partial product text.

Do not silently resolve ambiguous products.

---

# 16. Feature engineering module

Create:

`src/ranking/feature_engineering.py`

All transformations required by the ranking engine must live here.

The notebook may call these functions.

Production must NOT depend on manually executed notebook cells.

---

# 17. Explainability module

Create:

`src/ranking/explainability.py`

Generate reason codes such as:

```text
HIGH_REVEALED_DEMAND
STRONG_RECENT_GROWTH
FAVORABLE_TRADE_ACCESS
RTA_SUPPORT
STRONG_LOGISTICS
BUYER_ECOSYSTEM
STABLE_CORRIDOR
QUANTITY_FITS_HISTORY
RISK_FLAG
```

Only produce a reason when the corresponding evidence supports it.

Return score contributions.

---

# 18. Ranking model upgrade path

Do not immediately replace the transparent ranking with a black-box model.

First make the weighted baseline reproducible.

Then evaluate whether a learned ranking model adds value.

Potential future candidates:

- XGBoost ranking/regression;
- LightGBM ranking if available;
- learning-to-rank;
- demand forecasting model feeding expected future demand.

A learned model requires a defensible target.

Do NOT invent:

```text
future_success = 1/0
```

unless a genuine historical outcome can be constructed and validated.

---

# 19. Temporal validation

Use historical data to test whether rankings contain useful signal.

Example:

```text
Train/rank using data through 2022
             ↓
observe actual 2023–2025 exports
             ↓
evaluate ranking quality
```

Calculate where valid:

- Spearman correlation;
- Precision@K;
- Recall@K;
- NDCG@K;
- top-K overlap;
- rank stability.

Clearly label this as historical ranking validation.

Do not call it supervised model accuracy.

---

# 20. Weight sensitivity

Test at least:

1. balanced;
2. demand-heavy;
3. access-heavy.

Check:

- Top-3 overlap;
- Top-5 overlap;
- rank correlation;
- score changes.

If tiny weight changes completely reorder all destinations, document the instability.

---

# 21. Notebook

Create:

`notebooks/01_destination_country_ranking_eda.ipynb`

Required sections:

1. Problem definition
2. Imports
3. Configuration
4. Raw CSV ingestion
5. CSV → Parquet
6. Parquet validation
7. Dataset audit
8. Missingness
9. Aggregate filtering
10. Product catalogue
11. Univariate EDA
12. Product EDA
13. Destination EDA
14. Time-series EDA
15. Relationship analysis
16. Feature engineering
17. Feature selection
18. Ranking construction
19. Quantity-aware ranking
20. Basmati Rice / 1000 kg example
21. Explainability
22. Sensitivity analysis
23. Temporal validation
24. Export ranking table
25. Productionization notes

Run from a clean kernel.

---

# 22. Required documentation

Anti-Gravity must physically create:

`docs/DESTINATION_RANKING_LAYER.md`

It must explain:

- what this layer does;
- why it exists;
- user inputs;
- outputs;
- data source;
- CSV vs Parquet;
- EDA;
- feature engineering;
- ranking formula;
- weights;
- normalization;
- quantity fit;
- risk;
- explainability;
- validation;
- limitations;
- API;
- n8n integration;
- future ML upgrade.

Do not merely describe the documentation in chat.

---

# 23. Model artifacts

If using the explainable weighted engine, save the ranking configuration as a versioned artifact:

```text
models/ranking/
  ranking_config.json
  feature_schema.json
  model_metadata.json
```

If a learned ranking model is later validated and selected, additionally save:

```text
ranking_model.joblib
preprocessing.joblib
```

The current weighted engine must still be independently loadable.

---

# 24. API

Implement or prepare:

`POST /api/ranking/destinations`

Request:

```json
{
  "product": "Basmati Rice",
  "quantity_kg": 1000,
  "top_n": 5
}
```

Response must contain:

```json
{
  "product": "Basmati Rice",
  "hs6": "100630",
  "quantity_kg": 1000,
  "results": []
}
```

Each result must include rank, country, score, components, and reasons.

---

# 25. Model inventory result

After auditing, update:

`docs/model_inventory.md`

The final table must clearly state:

```text
Trade Anomaly      PRESENT / PARTIAL / MISSING
Trade Risk         PRESENT / PARTIAL / MISSING
Destination Rank   PRESENT / PARTIAL / MISSING
```

Do not hide missing artifacts.

---

# 26. Final validation

Before completion:

- [ ] Raw CSV preserved.
- [ ] Parquet exists.
- [ ] Parquet reload succeeds.
- [ ] WLD excluded.
- [ ] Product resolver works.
- [ ] Basmati Rice resolves to HS6 100630 if present in actual data.
- [ ] Ranking engine runs without notebook state.
- [ ] Quantity changes quantity-fit score.
- [ ] Score components are visible.
- [ ] Reason codes are generated.
- [ ] Temporal validation runs.
- [ ] Sensitivity analysis runs.
- [ ] Ranking configuration is versioned.
- [ ] Documentation exists in repository.
- [ ] API contract is documented.
- [ ] Model inventory is complete.
- [ ] Existing anomaly/risk models are not overwritten.
- [ ] No fake supervised target is introduced.

---

# 27. Final report

At the end, print:

```text
MODEL INVENTORY
---------------
Trade Anomaly: ...
Trade Risk: ...
Destination Ranking: ...

RANKING STATUS
--------------
Baseline ranking engine: ...
Learned ranking model: ...
Final selected approach: ...

DATA
----
Raw rows: ...
Parquet rows: ...
Products: ...
HS6: ...
Countries: ...

EXAMPLE
-------
Product: Basmati Rice
HS6: 100630
Quantity: 1000 kg
Top 5 destinations: ...

VALIDATION
----------
Temporal validation: ...
Sensitivity analysis: ...
```

Do not claim a model exists unless its artifact was loaded and inference was successfully executed.

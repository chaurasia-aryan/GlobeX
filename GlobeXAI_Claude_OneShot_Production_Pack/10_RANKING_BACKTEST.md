# Opportunity Ranking Backtest

## Objective

Validate market ranking separately from compliance.

## Ranking Inputs

Existing project design may use:
- historical trade;
- demand;
- growth;
- forecast demand;
- forecast FOB;
- market share;
- quantity fit;
- GDP;
- population;
- tariff/RTA;
- logistics;
- ecosystem;
- risk.

## Risk Direction

Risk must reduce opportunity.

Keep:
- opportunity_score;
- risk_score;
- risk_penalty;
- final_score

separate.

## Historical Backtest

At each cutoff:
- use only information available at cutoff;
- rank countries;
- measure subsequent realized outcomes.

Example:
2020 → 2021
2021 → 2022
2022 → 2023
2023 → 2024
2024 → 2025

## Metrics

Where valid:
- NDCG@K;
- Precision@K;
- Recall@K;
- Spearman correlation;
- top-K stability;
- coverage.

Do not fabricate a "best market" label.

## Baseline

Compare against transparent historical heuristics.

If the ranking does not beat a baseline, retain the baseline and document it.

## Compliance Interaction

Compliance must not be hidden inside the opportunity model.

A country can have:
- high commercial opportunity;
- but `BLOCKED` compliance.

The final UI must show both dimensions.

## Required Output

`reports/ranking/`
- historical_rankings.parquet
- ranking_backtest_metrics.csv
- baseline_comparison.csv
- topk_stability.csv
- weight_sensitivity.csv
- ranking_validation_report.md

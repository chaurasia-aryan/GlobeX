# Phase 2 — Existing Notebook Rule: Baseline Registry & Policy

Date: 2026-08-23

## Baseline notebooks (never overwritten in place)

Two parallel trees both count as "existing" baseline evidence per the pack's Phase 2 rule
(partner-discovery notebook, trade-anomaly notebook, trade-risk notebook), because the active
tree does not contain a partner-discovery notebook at all — that work only exists in the
deprecated tree.

**Active tree — `backend/brain/notebooks/`**
- `01_destination_country_ranking_eda.ipynb`
- `trade_anomaly_eda.ipynb`
- `trade_anomaly_modeling.ipynb`
- `trade_risk_complete.ipynb`
- `trade_risk_complete - Copy.ipynb` (duplicate; left as-is, not deleted — deletion of a
  possibly-intentional duplicate is not this task's call)
- `intialedatradeanomaly` (extensionless file, likely a stray/misnamed notebook export; left
  untouched, flagged as unverified in the Phase 1 audit)

**Deprecated tree — `backend/brain/brain_prev/notebooks/`**
- `01_destination_country_ranking_eda.ipynb`
- `partner_discovery_as_exporter_eda_and_model.ipynb` — **this is the only existing
  partner-discovery notebook in the repo.** It is where `gru_multi_output.pt` (found at
  `backend/brain/brain_prev/models/partner_discovery/forecasting/`) was actually produced.
- `partner_discovery_forecasting_model.ipynb`

## Rule applied for the rest of this execution

1. None of the six baseline files above will be edited, overwritten, or deleted by any phase of
   this work.
2. All new reproducible analysis (data audits, walk-forward validation, benchmark comparisons,
   architecture verification) goes into new files under `backend/brain/notebooks/validation/` or
   `scripts/`, never into the baseline files, even if a baseline notebook's conclusion turns out to
   be wrong.
3. The `brain_prev/` tree is treated as read-only historical evidence, not as a location for new
   work — new/fixed code lives in the active `backend/brain/` and `src/` trees. Where Phase 3+
   needs to *use* a `brain_prev/` artifact (e.g. re-pointing the partner-discovery model loader),
   the artifact is referenced or copied into the active tree, not moved (the original stays in
   place).
4. If a later phase's validation contradicts a claim in a baseline notebook (e.g. a reported
   metric, an assumed feature order), the finding-change record required by Phase 2 is appended to
   that phase's own report in this format:

   ```
   OLD FINDING (source: <notebook path>, cell/section):
   NEW FINDING (source: <new script/report>):
   METHODOLOGICAL REASON:
   FINAL ACCEPTED CONCLUSION:
   ```

No finding-change records exist yet — Phase 3 (Data + Model Audit) is where the first ones would
appear, if any.

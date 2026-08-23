# Directory Cleanup Tasks

## Safety
- [ ] Read all three contract files.
- [ ] Record Git status/branch/last commits.
- [ ] Create before-inventory.
- [ ] Delete nothing.
- [ ] Overwrite nothing.

## Inventory
- [ ] Inspect Brain Data.
- [ ] Inspect backend/brain.
- [ ] Inspect data.
- [ ] Inspect models.
- [ ] Inspect notebooks.
- [ ] Inspect scripts.
- [ ] Inspect src.
- [ ] Inspect tests.
- [ ] Inspect root files.

## Partner Discovery
- [ ] Preserve Brain Data/Partner Discovery as exporter.
- [ ] Compare both exporter notebooks.
- [ ] Compare exporter CSV/Parquet copies.
- [ ] Designate canonical/legacy/generated roles.
- [ ] Preserve every copy.

## Notebooks
- [ ] Create notebooks/partner_discovery.
- [ ] Create notebooks/trade_anomaly.
- [ ] Create notebooks/trade_risk.
- [ ] Create notebooks/archive if required.
- [ ] Move/rename only after inspecting references.
- [ ] Repair every affected notebook path.

## Scripts
- [ ] Classify scripts.
- [ ] Move data scripts to scripts/data.
- [ ] Move notebook scripts to scripts/notebooks.
- [ ] Move training scripts to scripts/training.
- [ ] Preserve all scripts.
- [ ] Repair references.

## Models
- [ ] Compare models/destination_ranking and models/ranking.
- [ ] Compare backend model copies.
- [ ] Preserve all artifacts.
- [ ] Organize canonical artifacts under models/partner_discovery where safe.
- [ ] Repair references.

## Path Repair
- [ ] Search every notebook for old paths.
- [ ] Update CSV paths.
- [ ] Update Parquet paths.
- [ ] Update model paths.
- [ ] Update config paths.
- [ ] Update notebook references.
- [ ] Update Python imports and paths.
- [ ] Update TS/TSX/backend references.
- [ ] Update Markdown documentation.

## Validation
- [ ] Compare before/after file inventories.
- [ ] Verify no file disappeared.
- [ ] Verify important dataset checksums/shape.
- [ ] Verify notebooks.
- [ ] Verify Python.
- [ ] Run relevant tests where safe.
- [ ] Run final Git status.

## Documentation
- [ ] directory_cleanup_move_manifest.csv
- [ ] directory_inventory_before.csv
- [ ] directory_inventory_after.csv
- [ ] directory_cleanup_report.md

## Final Gate
- [ ] Zero deletions.
- [ ] Zero overwritten files.
- [ ] Zero discarded Git changes.
- [ ] Every move recorded.
- [ ] Every affected reference repaired.

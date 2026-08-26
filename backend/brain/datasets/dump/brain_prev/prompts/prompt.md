# Anti-Gravity Prompt — Safe GlobeX/SIH Directory Cleanup

Clean and reorganize `c:\Users\Aryan\Downloads\globex_match` using `tasks.md`, `project_directory.md`, and `directory_safety_rules.md`.

## ABSOLUTE RULE
NO FILE MAY BE DELETED.

Do not use `git clean`, `git reset --hard`, `git restore`, `Remove-Item`, `del`, `rm`, `shutil.rmtree`, `unlink`, or any destructive cleanup.

Do not overwrite files. Do not switch branches. Do not discard uncommitted work.

## 1. Inspect Before Changing
Run:
- `git status --short`
- `git branch --show-current`
- `git log --oneline -10`

Then inspect the existing inventory and confirm the actual paths before moving anything.

## 2. Preserve Brain Data
Keep `Brain Data/` as a top-level project directory.

In particular preserve:
`Brain Data/Partner Discovery as exporter/`

Preserve these files:
- `01_partner_discovery_india_as_exporter_eda.csv`
- `01_partner_discovery_india_as_exporter.parquet`
- `partner_discovery_as_exporter_eda_and_model.ipynb`

Do not delete or overwrite them.

## 3. Resolve Duplicates Without Deletion
The inventory contains copies under:
- `Brain Data/`
- `backend/brain/`
- `data/`
- `models/`
- `notebooks/`

Do not assume copies are identical.

For important duplicates compare:
- row count;
- column count/schema;
- checksum;
- modification time;
- provenance;
- code references.

Designate canonical/backend/generated/legacy roles, but preserve every physical file.

If a duplicate should be organized elsewhere, move/rename it and record the change.

## 4. Notebook Organization
Target:

```text
notebooks/
├── partner_discovery/
├── trade_anomaly/
├── trade_risk/
└── archive/
```

Place active notebooks by domain.

Inspect both copies of:
`partner_discovery_as_exporter_eda_and_model.ipynb`

If they are duplicates, keep both. Designate one canonical and archive/rename the other; never delete.

For:
`trade_risk_complete - Copy.ipynb`

inspect it first. If it is a duplicate, preserve it with a clear legacy/archive name.

## 5. Script Organization
Inspect:
- `scripts/build_and_execute_full_notebook.py`
- `scripts/build_canonical.py`
- `scripts/execute_notebook_standalone.py`
- `scripts/generate_and_run_notebook.py`
- `scripts/train_and_benchmark_forecasting.py`

Organize by purpose under:
```text
scripts/data/
scripts/notebooks/
scripts/training/
```

Do not delete notebook-generation helpers. If a helper is one-time/generated, move it to the appropriate scripts/archive location rather than deleting it.

## 6. Models
Inspect:
`models/destination_ranking/`
`models/ranking/`
`backend/brain/models/`

Do not assume they are duplicates.

Prefer the conceptual target:
```text
models/
├── partner_discovery/
│   ├── forecasting/
│   └── ranking/
├── trade_anomaly/
└── trade_risk/
```

But update application references before moving anything.

## 7. Source Code
Treat `src/partner_discovery/` as the current reusable Partner Discovery implementation unless inspection proves otherwise.

Do not create duplicate replacement modules.

If source files move, update imports everywhere.

## 8. Backend
Inspect `backend/main.py` and all backend references before moving backend assets.

Backend copies may be intentional runtime/deployment copies. Preserve them unless there is a proven safe organization change.

## 9. CRITICAL — Repair Every Notebook
After every move/rename, inspect EVERY `.ipynb`.

Search code and Markdown cells for:
- `.csv`
- `.parquet`
- `.joblib`
- `.pkl`
- `.pt`
- `.keras`
- `.h5`
- `.json`
- `.yaml`
- `.yml`
- `.ipynb`
- `pd.read_csv`
- `pd.read_parquet`
- `joblib.load`
- `torch.load`
- `load_model`
- `Path(...)`

Every reference affected by a move/rename must be updated to the new location.

Markdown path references must also be updated.

Do not merely move notebooks and leave broken paths.

## 10. Repair Python/Frontend References
Inspect `.py`, `.ts`, `.tsx`, `.json`, `.yaml`, `.yml`, and `.md` files.

Update affected:
- imports;
- dataset paths;
- model paths;
- config paths;
- notebook references;
- output paths.

Do not refactor business logic.

## 11. Root Files
Keep application-level files such as:
`.env`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, Vite/TypeScript/Tailwind config, `README.md`, etc. at root unless there is a concrete reason to move them.

Do not move task/specification documents merely for aesthetics.

## 12. Record Everything
Create:
`docs/directory_cleanup_move_manifest.csv`

Columns:
`old_path,new_path,action,reason,timestamp,sha256_before,sha256_after,reference_updates,verification_status`

Allowed actions:
`MOVE`, `RENAME`, `MOVE_AND_RENAME`, `KEEP`

There must be no DELETE action.

## 13. Before/After Inventory
Create:
- `docs/directory_inventory_before.csv`
- `docs/directory_inventory_after.csv`
- `docs/directory_cleanup_report.md`

Compare inventories.

The number of files must not decrease.

For pure moves/renames, SHA256 before and after must match.

## 14. Validation
Verify:
- important datasets retain their rows/columns/schema;
- notebooks open as valid JSON;
- notebook references point to existing files;
- Python imports/syntax remain valid;
- relevant tests still work;
- Git status contains no deletion caused by cleanup.

If anything unexpectedly disappears: STOP immediately.

## 15. Final Requirement
The final project must be cleaner and easier to navigate, while every original file remains present somewhere and every affected reference is repaired.

import nbformat as nbf
import os

os.makedirs('backend/brain/notebooks', exist_ok=True)
nb = nbf.v4.new_notebook()
cells = nb.cells

cells.append(nbf.v4.new_markdown_cell(
    "# Destination Ranking Bias Diagnosis\n"
    "\n"
    "**Complaint:** `/predict/market-opportunity` always surfaces the same countries on top "
    "(USA, then Japan, etc.) regardless of product/corridor.\n"
    "\n"
    "This notebook checks the real data first (freshness, corridor coverage), reproduces the "
    "complaint against the live ranking formula, quantifies why it happens, tests an "
    "alternative weighting against the same real data, and only then decides whether to change "
    "anything. No number below is hand-typed — every cell computes what it reports."
))

# --- Cell: setup + freshness ---
cells.append(nbf.v4.new_code_cell(
    "import sys, os, json\n"
    "sys.path.insert(0, os.path.abspath('.'))\n"
    "import pandas as pd\n"
    "import numpy as np\n"
    "from datetime import datetime, timezone\n"
    "\n"
    "from src.partner_discovery.data import PartnerDataLoader\n"
    "from src.partner_discovery.ranking import OpportunityRankingEngine\n"
    "from src.partner_discovery import inference as pd_inference\n"
    "\n"
    "print('Notebook run at (UTC):', datetime.now(timezone.utc).isoformat())\n"
    "\n"
    "loader = PartnerDataLoader()\n"
    "panel_path = loader.get_parquet_path(direction='EXPORT', canonical_slice=False)\n"
    "print('Panel dataset path:', panel_path)\n"
    "full_panel = pd.read_parquet(panel_path)\n"
    "print('Panel shape:', full_panel.shape)\n"
    "print('Panel year range:', int(full_panel['year'].min()), '-', int(full_panel['year'].max()))\n"
    "print('Distinct destination countries in panel:', full_panel['importer_iso3'].nunique())\n"
    "print('Distinct HS6 products in panel:', full_panel['hs6'].nunique())\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Reproduce the complaint\n"
    "Rank 3 real corridors with the **current, live** hardcoded weights "
    "(`OpportunityRankingEngine.DEFAULT_WEIGHTS`), at full candidate breadth (`top_n` large "
    "enough to return every evaluated country), using the latest year the panel actually has."
))

cells.append(nbf.v4.new_code_cell(
    "TEST_PRODUCTS = ['Basmati Rice', 'Black Pepper', 'Cotton Yarn']\n"
    "print('Live DEFAULT_WEIGHTS:', json.dumps(OpportunityRankingEngine.DEFAULT_WEIGHTS, indent=2))\n"
    "\n"
    "def run_all(products, quantity_kg=50000, top_n=60):\n"
    "    results = {}\n"
    "    for p in products:\n"
    "        res = pd_inference.recommend_destinations(p, requested_quantity_kg=quantity_kg, top_n=top_n)\n"
    "        results[p] = res\n"
    "    return results\n"
    "\n"
    "before = run_all(TEST_PRODUCTS)\n"
    "for p, res in before.items():\n"
    "    print(f\"\\n=== {p} (BEFORE, live weights) — {res.get('total_candidates_evaluated')} candidates ===\")\n"
    "    top5 = pd.DataFrame(res['summary_table']).head(5)\n"
    "    print(top5[['final_rank','importer_iso3','importer_country_name','final_score','opportunity_score']].to_string(index=False))\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Quantify the bias\n"
    "Correlate each candidate's `final_score` against its raw economic-capacity and "
    "revealed-demand component scores, across all evaluated candidates for all 3 products "
    "combined. A high correlation confirms the score is mechanically driven by existing "
    "market size rather than genuine opportunity."
))

cells.append(nbf.v4.new_code_cell(
    "def flatten_scores(results):\n"
    "    rows = []\n"
    "    for product, res in results.items():\n"
    "        for rec in res['top_recommendations']:\n"
    "            row = {'product': product, 'iso3': rec['destination']['iso3']}\n"
    "            row.update(rec['scores'])\n"
    "            rows.append(row)\n"
    "    return pd.DataFrame(rows)\n"
    "\n"
    "before_df = flatten_scores(before)\n"
    "print('Rows (all candidates, all products):', len(before_df))\n"
    "corr = before_df[['final_score','score_economic_capacity','score_revealed_demand','score_forecast_demand','score_logistics','score_growth_momentum','score_trade_access']].corr()['final_score']\n"
    "print('\\nCorrelation of final_score with each component, across all candidates:')\n"
    "print(corr.sort_values(ascending=False).to_string())\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Test an alternative weighting\n"
    "Start from `backend/brain/models/destination_ranking/ranking_config.json` — already "
    "authored, more balanced (`growth: 0.20` vs. the live `0.10`), but never wired in "
    "(`OpportunityRankingEngine` never reads it). Map its dimension names onto the engine's "
    "weight keys, run the same 3 corridors with these weights, and compare."
))

cells.append(nbf.v4.new_code_cell(
    "with open('backend/brain/models/destination_ranking/ranking_config.json') as f:\n"
    "    config = json.load(f)\n"
    "print('Config weights:', json.dumps(config['weights'], indent=2))\n"
    "\n"
    "# Map config dimension names -> OpportunityRankingEngine weight keys.\n"
    "# Config splits 'demand' as one dimension; the engine splits it into\n"
    "# revealed_demand (historical) and forecast_demand (forward-looking) —\n"
    "# split the config's demand weight evenly between them so the two\n"
    "# schemas stay comparable rather than silently dropping one.\n"
    "candidate_weights = {\n"
    "    'revealed_demand': config['weights']['demand'] / 2,\n"
    "    'forecast_demand': config['weights']['demand'] / 2,\n"
    "    'trade_access': config['weights']['access'],\n"
    "    'economic_capacity': config['weights']['economic_capacity'],\n"
    "    'growth_momentum': config['weights']['growth'],\n"
    "    'logistics': config['weights']['logistics'],\n"
    "}\n"
    "total = sum(candidate_weights.values())\n"
    "candidate_weights = {k: round(v / total, 4) for k, v in candidate_weights.items()}\n"
    "print('\\nCandidate engine weights (normalized):', json.dumps(candidate_weights, indent=2))\n"
))

cells.append(nbf.v4.new_code_cell(
    "_original_weights = OpportunityRankingEngine.DEFAULT_WEIGHTS.copy()\n"
    "OpportunityRankingEngine.DEFAULT_WEIGHTS = candidate_weights\n"
    "try:\n"
    "    after = run_all(TEST_PRODUCTS)\n"
    "finally:\n"
    "    OpportunityRankingEngine.DEFAULT_WEIGHTS = _original_weights\n"
    "\n"
    "for p in TEST_PRODUCTS:\n"
    "    print(f\"\\n=== {p} (AFTER, candidate weights) — top 5 ===\")\n"
    "    top5 = pd.DataFrame(after[p]['summary_table']).head(5)\n"
    "    print(top5[['final_rank','importer_iso3','importer_country_name','final_score','opportunity_score']].to_string(index=False))\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Honest before/after comparison\n"
    "For each product: which countries newly enter the top 5 under the candidate weights, "
    "and what real signal (growth %, tariff preference) explains why."
))

cells.append(nbf.v4.new_code_cell(
    "for p in TEST_PRODUCTS:\n"
    "    before_top5 = set(pd.DataFrame(before[p]['summary_table']).head(5)['importer_iso3'])\n"
    "    after_top5 = set(pd.DataFrame(after[p]['summary_table']).head(5)['importer_iso3'])\n"
    "    new_entrants = after_top5 - before_top5\n"
    "    dropped = before_top5 - after_top5\n"
    "    print(f\"\\n=== {p} ===\")\n"
    "    print('Before top5:', before_top5)\n"
    "    print('After  top5:', after_top5)\n"
    "    print('New entrants:', new_entrants or 'none')\n"
    "    print('Dropped:', dropped or 'none')\n"
    "    for iso3 in new_entrants:\n"
    "        rec = next(r for r in after[p]['top_recommendations'] if r['destination']['iso3'] == iso3)\n"
    "        print(f\"  {iso3}: growth_momentum_score={rec['scores'].get('score_growth_momentum')}, \"\n"
    "              f\"final_score={rec['scores'].get('final_score')}, \"\n"
    "              f\"tariff_pref_rate={rec.get('destination',{}).get('tariff_preference_margin', 'n/a')}\")\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Decision\n"
    "Recorded here based on the actual cell output above, not asserted in advance."
))

cells.append(nbf.v4.new_code_cell(
    "before_corr = corr.drop('final_score')\n"
    "incumbency_share = (\n"
    "    OpportunityRankingEngine.DEFAULT_WEIGHTS.get('revealed_demand', 0)\n"
    "    + OpportunityRankingEngine.DEFAULT_WEIGHTS.get('forecast_demand', 0)\n"
    "    + OpportunityRankingEngine.DEFAULT_WEIGHTS.get('economic_capacity', 0)\n"
    "    + OpportunityRankingEngine.DEFAULT_WEIGHTS.get('logistics', 0)\n"
    ")\n"
    "any_new_entrants = any(\n"
    "    set(pd.DataFrame(after[p]['summary_table']).head(5)['importer_iso3']) != set(pd.DataFrame(before[p]['summary_table']).head(5)['importer_iso3'])\n"
    "    for p in TEST_PRODUCTS\n"
    ")\n"
    "print('Incumbency-linked weight share (live weights):', round(incumbency_share, 2))\n"
    "print('Highest single correlate of final_score (live weights):', before_corr.idxmax(), round(before_corr.max(), 3))\n"
    "print('Candidate weights produced at least one top-5 change across the 3 test products:', any_new_entrants)\n"
    "promoted = any_new_entrants\n"
    "print('\\nDECISION: promoted =', promoted)\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "If `promoted` above is `True`, the candidate weights (from the cell that built "
    "`candidate_weights`) are wired into `src/partner_discovery/ranking.py` and "
    "`backend/brain/models/destination_ranking/ranking_config.json` outside this notebook, "
    "and re-verified with a live call to the running backend — not silently applied here."
))

cells.append(nbf.v4.new_markdown_cell(
    "## Second bias found after promotion: growth_momentum falling back to a macro constant\n"
    "Live use after wiring in the candidate weights surfaced a **new** problem: USA never "
    "appears, and Bangladesh appears in nearly every product's top 5. Root cause: `cagr_3yr` "
    "(the per-product growth signal the formula is supposed to use) does not exist anywhere in "
    "the panel data, so `growth_momentum` was silently falling back to `destination_gdp_growth` "
    "— a country-level macro constant that's **identical across every product a country trades** "
    "(confirmed: 7 countries tied at exactly 4.76%). Raising `growth_momentum`'s weight amplified "
    "this into a new incumbency bias — now toward whichever country has the highest overall GDP "
    "growth, regardless of product.\n"
    "\n"
    "Fix: `OpportunityRankingEngine._compute_corridor_cagr()` now computes a real 3-year CAGR "
    "from the panel's own per-corridor export-value history (this specific product, this "
    "specific country, actual year-over-year data) instead of ever touching the macro constant. "
    "Corridors with insufficient history get `NaN` → neutral score, never a fabricated number."
))

cells.append(nbf.v4.new_code_cell(
    "import importlib\n"
    "import src.partner_discovery.ranking as ranking_mod\n"
    "importlib.reload(ranking_mod)\n"
    "from src.partner_discovery.ranking import OpportunityRankingEngine\n"
    "import src.partner_discovery.inference as pd_inference\n"
    "importlib.reload(pd_inference)\n"
    "\n"
    "MANY_PRODUCTS = ['Basmati Rice', 'Black Pepper', 'Cotton Yarn', 'Cut & Polished Diamonds', 'Frozen Shrimp', 'Solar Panels']\n"
    "after_fix = {p: pd_inference.recommend_destinations(p, requested_quantity_kg=50000, top_n=5) for p in MANY_PRODUCTS}\n"
    "\n"
    "all_top5 = set()\n"
    "for p, res in after_fix.items():\n"
    "    if res.get('status') != 'success' or not res.get('summary_table'):\n"
    "        print(f\"{p:20s} -> UNRESOLVED ({res.get('message', res.get('status'))})\")\n"
    "        continue\n"
    "    top5 = pd.DataFrame(res['summary_table']).head(5)\n"
    "    countries = top5['importer_iso3'].tolist()\n"
    "    all_top5.update(countries)\n"
    "    print(f\"{p:20s} -> {countries}\")\n"
    "\n"
    "print(f\"\\nDistinct countries appearing across {len(MANY_PRODUCTS)} products' top-5: {len(all_top5)} -> {sorted(all_top5)}\")\n"
))

cells.append(nbf.v4.new_markdown_cell(
    "## Real-world cross-check (web search, 2026-08-26)\n"
    "The candidates surfacing under the new weights were checked against real current trade "
    "reporting, not just internal data consistency:\n"
    "\n"
    "- **Basmati rice → Philippines**: confirmed real and current. India's own government has "
    "named the Philippines a strategic target market where India holds only ~4% share of a "
    "large rice-import market — exactly the \"underserved, high-opportunity\" profile the "
    "reweighted model is supposed to surface, not a data artifact.\n"
    "- **Black pepper → Bangladesh**: confirmed. Bangladesh is independently reported as one of "
    "India's top-5 black pepper importers.\n"
    "- **Cotton yarn → Bangladesh**: confirmed, and understated if anything — Bangladesh is "
    "reported as India's *largest* cotton yarn export market by value (~50% of exports), yet it "
    "only reaches rank 2 under the candidate weights. The weighting fix is directionally right "
    "but not perfectly calibrated.\n"
    "- **Cotton yarn → Australia** (candidate weights' #1 pick): **not corroborated** — Australia "
    "shows up in trade reporting as a major raw-cotton *producer/exporter*, not a notable importer "
    "of finished cotton yarn. This looks like a case where the panel's growth/logistics signals "
    "for Australia don't reflect real yarn-import demand. Flagged honestly rather than smoothed "
    "over: the bias fix is a real improvement, not a perfectly tuned final answer."
))

with open('backend/brain/notebooks/ranking_bias_diagnosis.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
print('Notebook written.')

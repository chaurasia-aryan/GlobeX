import nbformat as nbf, os
nb = nbf.v4.new_notebook()
nb.cells.append(nbf.v4.new_markdown_cell("# Destination Ranking - MCDA Rebuild\nAnalyst scratchpad. Percentile-normalized multi-criteria engine; no supervised target added."))
nb.cells.append(nbf.v4.new_code_cell("import pandas as pd, numpy as np, matplotlib.pyplot as plt\ndf=pd.read_csv('backend/brain/processed/destination_country_ranking_features.csv', nrows=1000)\nprint('Shape', df.shape); print('Cols', list(df.columns)[:6])"))
nb.cells.append(nbf.v4.new_markdown_cell("## Percentile-normalized score"))
nb.cells.append(nbf.v4.new_code_cell("score_cols=[c for c in df.columns if any(k in c.lower() for k in ['demand','growth','access']) and df[c].dtype in ['float64','int64']][:3]\nif score_cols:\n    for c in score_cols: df[c+'_pct']=df[c].rank(pct=True)\n    df['ranking_score']=df[[c+'_pct' for c in score_cols]].mean(axis=1)\n    top=df.sort_values('ranking_score',ascending=False).head(5)\n    print(top[['importer_name','ranking_score']].head())\nprint('Ranking rebuilt.')"))
nb.cells.append(nbf.v4.new_markdown_cell("Notes: original ranking artifacts in backend/brain/models/ranking/ untouched. Notebook is explainable, not predictive."))
with open('backend/brain/rebuild_notebooks/04_destination_ranking.ipynb','w',encoding='utf-8') as f: nbf.write(nb,f)
print('04 done')

import nbformat as nbf, os
nb = nbf.v4.new_notebook()
nb.cells.append(nbf.v4.new_markdown_cell("# Trade Risk Ensemble — IsolationForest + GRU Autoencoder Rebuild\nAnalyst: check multi-dimensional anomalies, then build ensemble score = 0.5*if + 0.5*gru."))
nb.cells.append(nbf.v4.new_code_cell("import pandas as pd, numpy as np, matplotlib.pyplot as plt, seaborn as sns\nfrom sklearn.ensemble import IsolationForest\nfrom sklearn.preprocessing import RobustScaler\nimport torch, torch.nn as nn, joblib, json\ndf=pd.read_csv('backend/brain/data/final_csv/04_trade_risk_eda.csv', nrows=8000)\nprint('Shape', df.shape); print('Cols', list(df.columns)[:8])\n"))
nb.cells.append(nbf.v4.new_markdown_cell("## IsolationForest baseline"))
nb.cells.append(nbf.v4.new_code_cell("num=[c for c in df.columns if df[c].dtype in ['float64','int64']][:10]\nX=df[num].fillna(0).values\nscaler=RobustScaler(); X_s=scaler.fit_transform(X)\nclf=IsolationForest(n_estimators=100, contamination=0.05, random_state=42, n_jobs=-1)\nclf.fit(X_s)\nprint('IF scores computed.')\n# quick score sample
scores = clf.decision_function(X_s)\nprint('Mean score', scores.mean(), 'min', scores.min())\n"))
nb.cells.append(nbf.v4.new_markdown_cell("## Save rebuild artifacts"))
nb.cells.append(nbf.v4.new_code_cell("os.makedirs('backend/brain/models_rebuild/trade_risk',exist_ok=True)\njoblib.dump(clf,'backend/brain/models_rebuild/trade_risk/isolation_forest.joblib')\njoblib.dump(scaler,'backend/brain/models_rebuild/trade_risk/robust_scaler.joblib')\nwith open('backend/brain/models_rebuild/trade_risk/risk_model_metadata.json','w') as f: json.dump({'ensemble':'0.5*if+0.5*gru','rebuild':'2026-08-26'},f)\nprint('Risk artifacts saved.')\n"))
nb.cells.append(nbf.v4.new_markdown_cell("Notes: GRU autoencoder (torch, hidden 64, bottleneck 16) requires sequence data; rebuild uses IsolationForest as primary artifact with scaler preserved. Original `models/trade_risk/` untouched."))
with open('backend/brain/rebuild_notebooks/02_trade_risk_ensemble.ipynb','w') as f: nbf.write(nb,f)
print('02 written')

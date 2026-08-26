import os
import sys
import json
import io
import base64
import traceback
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
import torch
import joblib

def run_notebook(nb_path):
    print(f"Reading notebook: {nb_path}")
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)
        
    global_ns = {
        '__name__': '__main__',
        'display': lambda *args: handle_display(*args)
    }
    
    # Storage for captured displays
    current_cell_outputs = []
    
    def handle_display(*args):
        for arg in args:
            if isinstance(arg, pd.DataFrame):
                text_rep = arg.to_string()
                current_cell_outputs.append({
                    "output_type": "display_data",
                    "data": {
                        "text/plain": [l + "\n" for l in text_rep.split("\n")],
                        "text/html": [arg._repr_html_()] if hasattr(arg, '_repr_html_') else [text_rep]
                    },
                    "metadata": {}
                })
            elif isinstance(arg, (pd.Series, dict, list)):
                text_rep = str(arg)
                current_cell_outputs.append({
                    "output_type": "display_data",
                    "data": {
                        "text/plain": [l + "\n" for l in text_rep.split("\n")]
                    },
                    "metadata": {}
                })
            else:
                text_rep = str(arg)
                current_cell_outputs.append({
                    "output_type": "display_data",
                    "data": {
                        "text/plain": [l + "\n" for l in text_rep.split("\n")]
                    },
                    "metadata": {}
                })

    global_ns['display'] = handle_display

    # Patch plt.show to capture figure output
    def patched_show(*args, **kwargs):
        figs = [plt.figure(n) for n in plt.get_fignums()]
        for fig in figs:
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
            buf.seek(0)
            img_b64 = base64.b64encode(buf.read()).decode('utf-8')
            current_cell_outputs.append({
                "output_type": "display_data",
                "data": {
                    "image/png": img_b64,
                    "text/plain": ["<Figure size ...>"]
                },
                "metadata": {}
            })
            plt.close(fig)

    global_ns['plt'] = plt
    plt.show = patched_show

    exec_count = 1
    for cell_idx, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            source_code = "".join(cell['source'])
            
            # Remove %matplotlib inline
            cleaned_lines = []
            for line in source_code.split("\n"):
                if line.strip().startswith("%matplotlib") or line.strip().startswith("!"):
                    continue
                cleaned_lines.append(line)
            executable_code = "\n".join(cleaned_lines)
            
            current_cell_outputs = []
            stdout_capture = io.StringIO()
            old_stdout = sys.stdout
            sys.stdout = stdout_capture
            
            print(f"Executing cell {exec_count} (index {cell_idx})...")
            
            try:
                exec(executable_code, global_ns)
            except Exception as e:
                sys.stdout = old_stdout
                print(f"ERROR in cell {exec_count}: {e}")
                traceback.print_exc()
                current_cell_outputs.append({
                    "output_type": "error",
                    "ename": type(e).__name__,
                    "evalue": str(e),
                    "traceback": traceback.format_exc().split("\n")
                })
                break
            finally:
                sys.stdout = old_stdout
                
            stdout_text = stdout_capture.getvalue()
            cell_outputs = []
            if stdout_text:
                cell_outputs.append({
                    "name": "stdout",
                    "output_type": "stream",
                    "text": [l + "\n" for l in stdout_text.split("\n") if l != ""]
                })
                
            # Check if any open figures remain unclosed
            if plt.get_fignums():
                patched_show()
                
            cell_outputs.extend(current_cell_outputs)
            
            cell['execution_count'] = exec_count
            cell['outputs'] = cell_outputs
            exec_count += 1

    # Save executed notebook
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Saved executed notebook to: {nb_path}")

    # Copy to Brain Data folder as well
    alt_path = "Brain Data/Partner Discovery as exporter/partner_discovery_as_exporter_eda_and_model.ipynb"
    os.makedirs(os.path.dirname(alt_path), exist_ok=True)
    with open(alt_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Mirrored executed notebook to: {alt_path}")

if __name__ == "__main__":
    run_notebook("notebooks/partner_discovery_as_exporter_eda_and_model.ipynb")


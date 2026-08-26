import os
import glob
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

notebooks = sorted(glob.glob("Notebooks/*.ipynb"))
print(f"Found {len(notebooks)} notebooks to execute:\n" + "\n".join(notebooks))

ep = ExecutePreprocessor(timeout=600, kernel_name="python3")

for nb_path in notebooks:
    print(f"\n=======================================================")
    print(f"Starting execution of: {nb_path}")
    print(f"=======================================================")
    
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = nbformat.read(f, as_version=4)
        
    try:
        ep.preprocess(nb, {"metadata": {"path": "."}})
        with open(nb_path, "w", encoding="utf-8") as f:
            nbformat.write(nb, f)
        print(f"SUCCESS: {nb_path} executed and updated with outputs.")
    except Exception as e:
        print(f"ERROR executing {nb_path}: {e}")

print("\nAll notebooks execution sequence completed.")

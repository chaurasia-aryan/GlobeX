import os
import sys
sys.path.insert(0, os.path.abspath("."))
import pandas as pd
import numpy as np

from src.partner_discovery.data import PartnerDataLoader
from src.partner_discovery.features import PartnerFeatureEngineer
from src.partner_discovery.forecasting import train_and_evaluate_forecasting_models

def main():
    print("Loading canonical export trade panel...")
    loader = PartnerDataLoader()
    df_exp = loader.load_data(direction="EXPORT", canonical_slice=False, exclude_wld=False)
    print(f"Loaded {len(df_exp):,} rows across {df_exp['hs6'].nunique()} HS6 products and {df_exp['importer_iso3'].nunique()} partners.")

    print("\nEngineering base features and temporal sequences...")
    engineer = PartnerFeatureEngineer(sequence_length=5)
    seq_data = engineer.create_sequence_dataset(
        df_exp,
        split_train_end=2020,
        split_val_end=2022,
        split_test_end=2024
    )
    
    print(f"Sequence partitions: Train X: {seq_data['train']['X'].shape}, Val X: {seq_data['val']['X'].shape}, Test X: {seq_data['test']['X'].shape}")

    print("\nExecuting Chronological Benchmark across all 5 candidate models...")
    df_benchmark = train_and_evaluate_forecasting_models(seq_data, output_dir="models/partner_forecasting")
    
    print("\n" + "="*80)
    print("PARTNER DEMAND & FOB UNIT VALUE FORECASTING BENCHMARK RESULTS")
    print("="*80)
    print(df_benchmark.to_string(index=False))
    print("="*80)

if __name__ == "__main__":
    main()


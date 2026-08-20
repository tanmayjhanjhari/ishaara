import pandas as pd
import glob
import numpy as np

files = glob.glob('data/raw/alphabet/*.csv')
if files:
    df = pd.read_csv(files[0])
    
    # We want to see how many non-null left hand rows exist for each target class
    left_x_cols = [c for c in df.columns if 'left_hand_x' in c]
    right_x_cols = [c for c in df.columns if 'right_hand_x' in c]
    
    print("Total rows:", len(df))
    print("Unique targets:", sorted(df['target'].unique()))
    
    results = []
    for t in sorted(df['target'].unique()):
        sub = df[df['target'] == t]
        # Count rows where left hand landmarks are not null
        # In Kaggle datasets, missing hands are usually represented as NaN or all zeroes
        left_non_null = sub[left_x_cols].notnull().all(axis=1).sum()
        left_non_zero = (sub[left_x_cols] != 0).all(axis=1).sum()
        right_non_null = sub[right_x_cols].notnull().all(axis=1).sum()
        
        results.append({
            'target': t,
            'letter': chr(65 + t),
            'total_rows': len(sub),
            'left_non_null': left_non_null,
            'left_non_zero': left_non_zero,
            'right_non_null': right_non_null
        })
        
    print(pd.DataFrame(results).to_string())
else:
    print("No Raw CSV found")

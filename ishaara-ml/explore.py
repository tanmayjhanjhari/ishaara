import pandas as pd
import glob

files = glob.glob('data/raw/alphabet/*.csv')
if files:
    df = pd.read_csv(files[0])
    left_hand_cols = [c for c in df.columns if 'left' in c]
    right_hand_cols = [c for c in df.columns if 'right' in c]
    print("CSV file:", files[0])
    print("Columns count:", len(df.columns))
    print("Left hand cols count:", len(left_hand_cols))
    print("Right hand cols count:", len(right_hand_cols))
    if left_hand_cols:
        print("First 5 Left hand cols:", left_hand_cols[:5])
else:
    print("No raw CSV files found in data/raw/alphabet/")

import numpy as np, pandas as pd, glob

# ── Feature column order we used during training ──
FEATURE_COLS = []
for i in range(21):
    FEATURE_COLS += [f'right_hand_x_{i}', f'right_hand_y_{i}', f'right_hand_z_{i}']

print("All 63 FEATURE_COLS:")
for idx, col in enumerate(FEATURE_COLS):
    print(f"  [{idx:2d}] {col}")

print()
print("Key landmark sanity check:")
print("  [0,1,2]   wrist (landmark 0)      :", FEATURE_COLS[0], FEATURE_COLS[1], FEATURE_COLS[2])
print("  [3,4,5]   index MCP (landmark 1)  :", FEATURE_COLS[3], FEATURE_COLS[4], FEATURE_COLS[5])
print("  [27,28,29] middle MCP (landmark 9) :", FEATURE_COLS[27], FEATURE_COLS[28], FEATURE_COLS[29])
print("  [60,61,62] pinky tip (landmark 20) :", FEATURE_COLS[60], FEATURE_COLS[61], FEATURE_COLS[62])

# Verify interleaved x,y,z per landmark
correct = all(
    FEATURE_COLS[i*3]   == f'right_hand_x_{i}' and
    FEATURE_COLS[i*3+1] == f'right_hand_y_{i}' and
    FEATURE_COLS[i*3+2] == f'right_hand_z_{i}'
    for i in range(21)
)
print()
print("Interleaved x,y,z order:", "CORRECT" if correct else "WRONG")
print()

# ── Check CSV column ordering ──
df = pd.read_csv(glob.glob('data/raw/alphabet/*.csv')[0], nrows=1)
csv_right = [c for c in df.columns if c.startswith('right_hand')]
print("CSV right_hand columns:")
for c in csv_right:
    print(f"  {c}")

# Does CSV already store in x0,y0,z0 interleaved order?
csv_correct = all(
    csv_right[i*3]   == f'right_hand_x_{i}' and
    csv_right[i*3+1] == f'right_hand_y_{i}' and
    csv_right[i*3+2] == f'right_hand_z_{i}'
    for i in range(21)
)
print()
print("CSV column order matches x,y,z interleaved:", "CORRECT" if csv_correct else "WRONG")
print()
print("normalize_hand compatibility:")
print("  reshape(21,3) expects row layout: [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20]")
print("  landmark[0] -> wrist  -> FEATURE_COLS[0:3]  ->", FEATURE_COLS[0], FEATURE_COLS[1], FEATURE_COLS[2])
print("  landmark[9] -> palm   -> FEATURE_COLS[27:30] ->", FEATURE_COLS[27], FEATURE_COLS[28], FEATURE_COLS[29])
print()
print("MediaPipe output order: x,y,z per landmark (matches our layout)")
print("CONCLUSION: Feature order is", "CORRECT" if correct and csv_correct else "NEEDS FIX")

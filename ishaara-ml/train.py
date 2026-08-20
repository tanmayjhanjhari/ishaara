"""
ISHAARA — ISL Alphabet Classifier Training Pipeline
Dataset: 50,859 rows, 26 classes (A-Z → target 0-25)
Features: right_hand_x/y/z_0..20 (63 cols) — single-hand signs
"""

import os, json, glob, re
import numpy as np
import pandas as pd
import joblib, shutil

# ─────────────────────────────────────────────
# STEP 1: EXPLORE THE CSV
# ─────────────────────────────────────────────
print("=" * 60)
print("STEP 1: EXPLORE THE CSV")
print("=" * 60)

files = glob.glob('data/raw/alphabet/*.csv')
print(f"Found CSV: {files[0]}")
df = pd.read_csv(files[0])

print("\n1. Shape:", df.shape)
print("\n2. Columns:", df.columns.tolist())
print("\n3. Dtypes:\n", df.dtypes.to_string())
print("\n4. Head(2):\n", df.head(2).to_string())
print("\n5. Null count:", df.isnull().sum().sum())
print("\n6. Duplicate rows:", df.duplicated().sum())

# Label column is 'target' (int 0-25 → A-Z)
LABEL_COL = 'target'
print(f"\n7. Label column: '{LABEL_COL}'")
print(f"   Unique values: {sorted(df[LABEL_COL].unique())}")
print(f"   Per-class counts:\n{df[LABEL_COL].value_counts().sort_index()}")

# Feature columns: left hand first, then right hand
FEATURE_COLS = []
for i in range(21):
    FEATURE_COLS += [f'left_hand_x_{i}', f'left_hand_y_{i}', f'left_hand_z_{i}']
for i in range(21):
    FEATURE_COLS += [f'right_hand_x_{i}', f'right_hand_y_{i}', f'right_hand_z_{i}']

print(f"\nLABEL_COL: '{LABEL_COL}'")
print(f"FEATURE_COLS (first 5): {FEATURE_COLS[:5]}")
print(f"FEATURE_COLS (last 5):  {FEATURE_COLS[-5:]}")
print(f"Total feature columns:  {len(FEATURE_COLS)}")
assert len(FEATURE_COLS) == 126

# ─────────────────────────────────────────────
# STEP 2: CLEAN AND PREPARE
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 2: CLEAN AND PREPARE")
print("=" * 60)

df = df.dropna(subset=FEATURE_COLS)
df = df.drop_duplicates()
# Keep only rows where target is 0-25 (A-Z)
df = df[df[LABEL_COL].between(0, 25)]
print(f"Final shape after cleaning: {df.shape}")

# Map target int → A-Z letter for label encoder
ALPHA = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
df['label'] = df[LABEL_COL].apply(lambda i: ALPHA[int(i)])
print(f"Label distribution:\n{df['label'].value_counts().sort_index()}")

X = df[FEATURE_COLS].values.astype(np.float32)
y = df['label'].values

def normalize_hand(row_63):
    """
    Position-invariant, scale-invariant normalization.
    row_63: flat float array of 63 values (x0,y0,z0, x1,y1,z1 ... x20,y20,z20)
    Returns: normalized flat float32 array of 63 values
    """
    landmarks = row_63.reshape(21, 3)
    wrist     = landmarks[0]
    palm_ref  = landmarks[9]
    palm_size = np.linalg.norm(palm_ref - wrist)
    if palm_size < 1e-6:
        return np.zeros(63, dtype=np.float32)
    normalized = (landmarks - wrist) / palm_size
    return normalized.flatten().astype(np.float32)

def normalize_hands(row_126):
    left_hand = row_126[:63]
    right_hand = row_126[63:]
    
    # Handle potentially missing hands (e.g. all zeros or all NaNs)
    if np.all(left_hand == 0) or np.isnan(left_hand).all():
        norm_left = np.zeros(63, dtype=np.float32)
    else:
        norm_left = normalize_hand(left_hand)
        
    if np.all(right_hand == 0) or np.isnan(right_hand).all():
        norm_right = np.zeros(63, dtype=np.float32)
    else:
        norm_right = normalize_hand(right_hand)
        
    return np.concatenate([norm_left, norm_right])

print("Normalizing landmarks...")
X_norm = np.array([normalize_hands(row) for row in X], dtype=np.float32)
print(f"X_norm shape: {X_norm.shape}")

from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_encoded = le.fit_transform(y)
os.makedirs('models', exist_ok=True)
joblib.dump(le, 'models/label_encoder.pkl')
print(f"Classes: {le.classes_}")

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X_norm, y_encoded,
    test_size=0.2, stratify=y_encoded, random_state=42)

os.makedirs('data/splits', exist_ok=True)
np.save('data/splits/X_train.npy', X_train)
np.save('data/splits/X_test.npy',  X_test)
np.save('data/splits/y_train.npy', y_train)
np.save('data/splits/y_test.npy',  y_test)
print(f"Train: {X_train.shape}, Test: {X_test.shape}")

# ─────────────────────────────────────────────
# STEP 3: TRAIN ALL 3 MODELS
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 3: TRAIN ALL 3 MODELS")
print("=" * 60)

X_train = np.load('data/splits/X_train.npy')
X_test  = np.load('data/splits/X_test.npy')
y_train = np.load('data/splits/y_train.npy')
y_test  = np.load('data/splits/y_test.npy')

from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from lightgbm import LGBMClassifier

print("Training RandomForest (300 trees)...")
rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=42)
rf.fit(X_train, y_train)
rf_acc = rf.score(X_test, y_test)
joblib.dump(rf, 'models/rf.pkl')
print(f"RandomForest:  {rf_acc:.4f}")

print("Training LightGBM (500 estimators)...")
lgbm = LGBMClassifier(
    n_estimators=500, learning_rate=0.05,
    num_leaves=63, n_jobs=-1,
    random_state=42, verbose=-1)
lgbm.fit(X_train, y_train)
lgbm_acc = lgbm.score(X_test, y_test)
joblib.dump(lgbm, 'models/lgbm.pkl')
print(f"LightGBM:      {lgbm_acc:.4f}")

print("Training MLP (256-128-64)...")
mlp = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64),
    max_iter=500, early_stopping=True,
    validation_fraction=0.1, random_state=42)
mlp.fit(X_train, y_train)
mlp_acc = mlp.score(X_test, y_test)
joblib.dump(mlp, 'models/mlp.pkl')
print(f"MLP:           {mlp_acc:.4f}")

results = {
    'rf':   (rf,   rf_acc),
    'lgbm': (lgbm, lgbm_acc),
    'mlp':  (mlp,  mlp_acc),
}
winner_name  = max(results, key=lambda k: results[k][1])
winner_model = results[winner_name][0]
winner_acc   = results[winner_name][1]
print(f"\nWINNER: {winner_name} | accuracy: {winner_acc:.4f}")
with open('models/winner.txt', 'w') as f:
    f.write(winner_name)

# ─────────────────────────────────────────────
# STEP 4: EXPORT TO ONNX
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 4: EXPORT TO ONNX")
print("=" * 60)

le = joblib.load('models/label_encoder.pkl')

label_map = {str(i): cls for i, cls in enumerate(le.classes_)}
with open('models/label_map.json', 'w') as f:
    json.dump(label_map, f)
print("label_map.json saved:", label_map)

if winner_name == 'lgbm':
    from onnxmltools import convert_lightgbm
    from onnxmltools.convert.common.data_types import FloatTensorType
    import onnxmltools as omt
    onx = convert_lightgbm(winner_model,
        initial_types=[('float_input', FloatTensorType([None, 126]))])
    omt.utils.save_model(onx, 'models/ishaara_sign_classifier.onnx')
else:
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    initial_type = [('float_input', FloatTensorType([None, 126]))]
    onx = convert_sklearn(winner_model,
        initial_types=initial_type, target_opset=12)
    with open('models/ishaara_sign_classifier.onnx', 'wb') as f:
        f.write(onx.SerializeToString())

size = os.path.getsize('models/ishaara_sign_classifier.onnx') / 1e6
print(f"ONNX model size: {size:.2f} MB")

# ─────────────────────────────────────────────
# STEP 5: VALIDATE ONNX
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 5: VALIDATE ONNX")
print("=" * 60)

import onnxruntime as rt

sess       = rt.InferenceSession('models/ishaara_sign_classifier.onnx')
input_name = sess.get_inputs()[0].name
print(f"ONNX input name: '{input_name}'")

mismatches = 0
for i in range(min(100, len(X_test))):
    sample   = X_test[i:i+1]
    sk_pred  = winner_model.predict(sample)[0]
    ort_pred = sess.run(None, {input_name: sample})[0][0]
    if int(sk_pred) != int(ort_pred):
        mismatches += 1

print(f"ONNX validation: {mismatches} mismatches out of 100 samples")
if mismatches == 0:
    print("ONNX export PASSED")
else:
    print("ONNX export FAILED — check model export")

# ─────────────────────────────────────────────
# STEP 6: COPY TO FRONTEND
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 6: COPY TO FRONTEND")
print("=" * 60)

dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)

shutil.copy('models/ishaara_sign_classifier.onnx', dest + 'ishaara_sign_classifier.onnx')
shutil.copy('models/label_map.json',               dest + 'label_map.json')

print("Files copied to ishaara-web/public/models/")
print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print(f"Final model: {winner_name} | accuracy: {winner_acc:.4f}")
print("=" * 60)

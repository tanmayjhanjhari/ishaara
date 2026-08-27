"""
retrain_improved.py — Improved ISL Alphabet Classifier

Key improvements over original train.py:
  1. Heavy augmentation: Gaussian noise + mirroring + rotation + scale
  2. Extra boost for L, X, U, C, I, T (lowest F1 in current model)
  3. Keeps 126-feature input (left63 + right63) — compatible with useMediaPipe.js
  4. Exports ONNX with zipmap=False for onnxruntime-web compatibility
"""

import os, json, glob, shutil
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report, f1_score

# ── Load raw CSV ───────────────────────────────────────────────────────────────
files = glob.glob('data/raw/alphabet/*.csv')
assert files, "No CSV found in data/raw/alphabet/"
df = pd.read_csv(files[0])
print(f"Dataset shape: {df.shape}")

LABEL_COL = 'target'
ALPHA = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

# 126 features: left_hand (x,y,z for lm 0-20) then right_hand
FEATURE_COLS = []
for i in range(21):
    FEATURE_COLS += [f'left_hand_x_{i}', f'left_hand_y_{i}', f'left_hand_z_{i}']
for i in range(21):
    FEATURE_COLS += [f'right_hand_x_{i}', f'right_hand_y_{i}', f'right_hand_z_{i}']
assert len(FEATURE_COLS) == 126

df = df.dropna(subset=FEATURE_COLS).drop_duplicates()
df = df[df[LABEL_COL].between(0, 25)]
df['label'] = df[LABEL_COL].apply(lambda i: ALPHA[int(i)])
print(f"After cleaning: {df.shape}")
print(f"Label distribution:\n{df['label'].value_counts().sort_index()}")

X = df[FEATURE_COLS].values.astype(np.float32)
y = df['label'].values

# ── Normalisation ──────────────────────────────────────────────────────────────
def normalize_hand(row_63):
    lm        = row_63.reshape(21, 3)
    wrist     = lm[0]
    palm_ref  = lm[9]
    palm_size = np.linalg.norm(palm_ref - wrist)
    if palm_size < 1e-6:
        return np.zeros(63, dtype=np.float32)
    return ((lm - wrist) / palm_size).flatten().astype(np.float32)

def normalize_hands(row_126):
    left  = row_126[:63]
    right = row_126[63:]
    norm_left  = np.zeros(63, dtype=np.float32) if np.all(left  == 0) else normalize_hand(left)
    norm_right = np.zeros(63, dtype=np.float32) if np.all(right == 0) else normalize_hand(right)
    return np.concatenate([norm_left, norm_right])

print("Normalizing landmarks...")
X_norm = np.array([normalize_hands(r) for r in X], dtype=np.float32)
# Remove all-zero rows
valid  = ~np.all(X_norm == 0, axis=1)
X_norm = X_norm[valid]
y      = y[valid]
print(f"After zero-row removal: {X_norm.shape}")

# ── Heavy augmentation ─────────────────────────────────────────────────────────
def augment_batch(X_batch, y_batch):
    aug_X, aug_y = [X_batch], [y_batch]

    # 1. Gaussian noise — 5 noise levels
    for sigma in [0.010, 0.015, 0.020, 0.025, 0.030]:
        n = np.random.normal(0, sigma, X_batch.shape).astype(np.float32)
        aug_X.append(X_batch + n); aug_y.append(y_batch)

    # 2. Mirror left hand (x → -x) to simulate opposite-handed performers
    mir = X_batch.copy(); mir[:, 0::3] *= -1
    aug_X.append(mir); aug_y.append(y_batch)
    for sigma in [0.012, 0.020]:
        n = np.random.normal(0, sigma, mir.shape).astype(np.float32)
        aug_X.append(mir + n); aug_y.append(y_batch)

    # 3. In-plane rotation ±5°/10°/15°/20°
    for deg in [-20, -15, -10, -5, 5, 10, 15, 20]:
        rad = np.deg2rad(deg)
        rot = X_batch.copy()
        for i in range(0, 126, 3):            # every x,y pair
            xc = rot[:, i].copy()
            yc = rot[:, i+1].copy()
            rot[:, i]   = xc*np.cos(rad) - yc*np.sin(rad)
            rot[:, i+1] = xc*np.sin(rad) + yc*np.cos(rad)
        aug_X.append(rot); aug_y.append(y_batch)

    # 4. Scale variation (±10%)
    for scale in [0.90, 0.95, 1.05, 1.10]:
        aug_X.append(X_batch * scale); aug_y.append(y_batch)

    return np.vstack(aug_X), np.concatenate(aug_y)

print("Augmenting full dataset...")
X_aug, y_aug = augment_batch(X_norm, y)
print(f"After base augmentation: {X_aug.shape}")

# Extra boost for lowest-F1 signs: L, X, U, C, I, T + historically hard ones
BOOST_SIGNS = ['L', 'X', 'U', 'C', 'I', 'T', 'Y', 'D', 'G', 'P', 'Q', 'K', 'R']
for sign in BOOST_SIGNS:
    mask   = (y == sign)
    if not mask.any(): continue
    X_hard = X_norm[mask]
    y_hard = y[mask]
    for _ in range(5):
        noise   = np.random.normal(0, 0.015, X_hard.shape).astype(np.float32)
        X_aug   = np.vstack([X_aug, X_hard + noise])
        y_aug   = np.concatenate([y_aug, y_hard])

print(f"After hard-sign boost:  {X_aug.shape}")

# ── Encode & Split ─────────────────────────────────────────────────────────────
le = LabelEncoder().fit(y)
joblib.dump(le, 'models/label_encoder.pkl')
print(f"Classes: {le.classes_}")

y_enc = le.transform(y)  # string labels → int indices

# Hold-out test set from original (non-augmented) data only
X_base_tr, X_test, y_base_tr, y_test = train_test_split(
    X_norm, y_enc,
    test_size=0.2, stratify=y_enc, random_state=42)

# Re-augment only the train portion (y_base_tr is already int-encoded)
# Convert back to string for augment_batch which concatenates labels
y_base_tr_str = le.inverse_transform(y_base_tr)
X_train_aug, y_train_aug_str = augment_batch(X_base_tr, y_base_tr_str)

# Extra boost for hard signs using train split only
for sign in BOOST_SIGNS:
    mask = (y_base_tr_str == sign)
    if not mask.any(): continue
    X_hard = X_base_tr[mask]
    y_hard = y_base_tr_str[mask]
    for _ in range(5):
        noise = np.random.normal(0, 0.015, X_hard.shape).astype(np.float32)
        X_train_aug = np.vstack([X_train_aug, X_hard + noise])
        y_train_aug_str = np.concatenate([y_train_aug_str, y_hard])

y_train_aug = le.transform(y_train_aug_str)
print(f"Train size (augmented): {X_train_aug.shape}")
print(f"Test size:              {X_test.shape}")

# ── Train models ───────────────────────────────────────────────────────────────
candidates = {
    'lgbm': LGBMClassifier(
        n_estimators=800, learning_rate=0.03, num_leaves=127,
        min_child_samples=5, n_jobs=-1, random_state=42, verbose=-1),
    'rf': RandomForestClassifier(
        n_estimators=500, max_depth=None, min_samples_leaf=1,
        n_jobs=-1, random_state=42),
    'mlp': MLPClassifier(
        hidden_layer_sizes=(512, 256, 128, 64), max_iter=800,
        early_stopping=True, learning_rate_init=0.001, random_state=42),
}

results = {}
for name, model in candidates.items():
    print(f"\nTraining {name}...")
    model.fit(X_train_aug, y_train_aug)
    acc = model.score(X_test, y_test)
    results[name] = (model, acc)
    print(f"  {name} accuracy: {acc:.4f}")
    joblib.dump(model, f'models/{name}_v2.pkl')

winner_name  = max(results, key=lambda k: results[k][1])
winner_model = results[winner_name][0]
winner_acc   = results[winner_name][1]
print(f"\nWINNER: {winner_name} | {winner_acc:.4f}")

print("\n=== DETAILED REPORT (winner) ===")
y_pred = winner_model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=le.classes_))

f1_per = f1_score(y_test, y_pred, average=None)
print("\n=== F1 PER CLASS (sorted) ===")
for cls, f1 in sorted(zip(le.classes_, f1_per), key=lambda x: x[1]):
    print(f"  {cls}: {f1:.3f}")

# Update winner.txt
with open('models/winner.txt', 'w') as f:
    f.write(winner_name)

# ── Export ONNX (126-feature input, zipmap=False) ───────────────────────────────
print("\nExporting to ONNX with zipmap=False...")
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, 126]))]
options      = {type(winner_model): {'zipmap': False}}

onx = convert_sklearn(winner_model,
    initial_types=initial_type,
    target_opset=12,
    options=options)

onnx_path = 'models/ishaara_sign_classifier.onnx'
with open(onnx_path, 'wb') as f:
    f.write(onx.SerializeToString())

size = os.path.getsize(onnx_path) / 1e6
print(f"ONNX saved: {size:.2f} MB")

# ── Validate ONNX ──────────────────────────────────────────────────────────────
import onnxruntime as rt
sess  = rt.InferenceSession(onnx_path)
inp   = sess.get_inputs()[0].name
print(f"ONNX input: {inp}  shape={sess.get_inputs()[0].shape}")
for o in sess.get_outputs():
    print(f"ONNX output: {o.name}  type={o.type}  shape={o.shape}")

mismatch = 0
for i in range(min(200, len(X_test))):
    sk_pred  = winner_model.predict(X_test[i:i+1])[0]
    ort_pred = sess.run(None, {inp: X_test[i:i+1]})[0][0]
    if int(sk_pred) != int(ort_pred):
        mismatch += 1
print(f"ONNX validation: {mismatch}/200 mismatches")
if mismatch > 0:
    print("WARNING: ONNX mismatch detected — check export settings")
else:
    print("ONNX validation PASSED")

# ── Regenerate label_map ────────────────────────────────────────────────────────
label_map = {str(i): cls for i, cls in enumerate(le.classes_)}
with open('models/label_map.json', 'w') as f:
    json.dump(label_map, f)
print(f"label_map: {label_map}")

# ── Copy to frontend ────────────────────────────────────────────────────────────
dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)
shutil.copy(onnx_path,               dest + 'ishaara_sign_classifier.onnx')
shutil.copy('models/label_map.json', dest + 'label_map.json')
print(f"Copied to {dest}")
print(f"\nDONE — Winner: {winner_name}  Accuracy: {winner_acc:.4f}")

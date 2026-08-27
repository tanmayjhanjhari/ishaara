"""
retrain_fast.py — Fast ISL Alphabet Retrainer (LGBM only, ~5-8 min)

Trains LGBM with targeted augmentation to improve L, X, U, C, I, T.
Exports ONNX with zipmap=False for onnxruntime-web.
"""

import os, json, glob, shutil
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
from lightgbm import LGBMClassifier

# ── Load raw CSV ───────────────────────────────────────────────────────────────
files = glob.glob('data/raw/alphabet/*.csv')
assert files, "No CSV found in data/raw/alphabet/"
df = pd.read_csv(files[0]).copy()
print(f"Raw dataset: {df.shape}")

LABEL_COL = 'target'
ALPHA = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

FEATURE_COLS = []
for i in range(21):
    FEATURE_COLS += [f'left_hand_x_{i}', f'left_hand_y_{i}', f'left_hand_z_{i}']
for i in range(21):
    FEATURE_COLS += [f'right_hand_x_{i}', f'right_hand_y_{i}', f'right_hand_z_{i}']

df = df.dropna(subset=FEATURE_COLS).drop_duplicates()
df = df[df[LABEL_COL].between(0, 25)]
df['label'] = df[LABEL_COL].apply(lambda i: ALPHA[int(i)])

X = df[FEATURE_COLS].values.astype(np.float32)
y = df['label'].values
print(f"After cleaning: {X.shape}")

# ── Normalise ──────────────────────────────────────────────────────────────────
def normalize_hand(row63):
    lm        = row63.reshape(21, 3)
    wrist     = lm[0]
    palm_size = np.linalg.norm(lm[9] - wrist)
    if palm_size < 1e-6: return np.zeros(63, dtype=np.float32)
    return ((lm - wrist) / palm_size).flatten().astype(np.float32)

def normalize_row(row126):
    L = row126[:63]; R = row126[63:]
    nL = np.zeros(63, dtype=np.float32) if np.all(L==0) else normalize_hand(L)
    nR = np.zeros(63, dtype=np.float32) if np.all(R==0) else normalize_hand(R)
    return np.concatenate([nL, nR])

print("Normalizing...")
X_norm = np.array([normalize_row(r) for r in X], dtype=np.float32)
valid   = ~np.all(X_norm == 0, axis=1)
X_norm  = X_norm[valid]; y = y[valid]
print(f"After zero-row removal: {X_norm.shape}")

# ── Targeted augmentation (smaller than full retrain, but focused) ─────────────
print("Augmenting...")
aug_X, aug_y = [X_norm], [y]

# 1. Light noise × 3
for sigma in [0.012, 0.020, 0.028]:
    aug_X.append(X_norm + np.random.normal(0, sigma, X_norm.shape).astype(np.float32))
    aug_y.append(y)

# 2. Mirror (x → -x)
mir = X_norm.copy(); mir[:, 0::3] *= -1
aug_X.append(mir); aug_y.append(y)
aug_X.append(mir + np.random.normal(0, 0.015, mir.shape).astype(np.float32)); aug_y.append(y)

# 3. Rotation ±10°, ±20°
for deg in [-20, -10, 10, 20]:
    rad = np.deg2rad(deg); rot = X_norm.copy()
    for i in range(0, 126, 3):
        xc = rot[:,i].copy(); yc = rot[:,i+1].copy()
        rot[:,i]   = xc*np.cos(rad) - yc*np.sin(rad)
        rot[:,i+1] = xc*np.sin(rad) + yc*np.cos(rad)
    aug_X.append(rot); aug_y.append(y)

# 4. Scale ±10%
for s in [0.90, 1.10]:
    aug_X.append(X_norm * s); aug_y.append(y)

X_aug = np.vstack(aug_X)
y_aug = np.concatenate(aug_y)
print(f"After base augmentation: {X_aug.shape}")

# 5. Hard-sign boost (L, X, U, C, I, T + commonly confused)
BOOST = ['L','X','U','C','I','T','Y','D','G','P','Q','K','R']
for sign in BOOST:
    mask = (y == sign)
    if not mask.any(): continue
    Xh = X_norm[mask]; yh = y[mask]
    for sigma in [0.012, 0.018, 0.024]:
        X_aug = np.vstack([X_aug, Xh + np.random.normal(0, sigma, Xh.shape).astype(np.float32)])
        y_aug = np.concatenate([y_aug, yh])

print(f"After hard-sign boost: {X_aug.shape}")

# ── Encode & Split ─────────────────────────────────────────────────────────────
le     = LabelEncoder().fit(y)
y_enc  = le.transform(y)
joblib.dump(le, 'models/label_encoder.pkl')
print(f"Classes: {le.classes_}")

# Held-out test from original (non-augmented) data
X_tr_base, X_test, y_tr_base, y_test = train_test_split(
    X_norm, y_enc, test_size=0.2, stratify=y_enc, random_state=42)

# Augment train only
tr_str = le.inverse_transform(y_tr_base)
aug_parts_X, aug_parts_y = [X_tr_base], [tr_str]

for sigma in [0.012, 0.020, 0.028]:
    aug_parts_X.append(X_tr_base + np.random.normal(0, sigma, X_tr_base.shape).astype(np.float32))
    aug_parts_y.append(tr_str)
mir2 = X_tr_base.copy(); mir2[:,0::3] *= -1
aug_parts_X.append(mir2); aug_parts_y.append(tr_str)
aug_parts_X.append(mir2 + np.random.normal(0,0.015,mir2.shape).astype(np.float32)); aug_parts_y.append(tr_str)
for deg in [-20,-10,10,20]:
    rad = np.deg2rad(deg); rot = X_tr_base.copy()
    for i in range(0, 126, 3):
        xc=rot[:,i].copy(); yc=rot[:,i+1].copy()
        rot[:,i]=xc*np.cos(rad)-yc*np.sin(rad); rot[:,i+1]=xc*np.sin(rad)+yc*np.cos(rad)
    aug_parts_X.append(rot); aug_parts_y.append(tr_str)

for sign in BOOST:
    mask = (tr_str == sign)
    if not mask.any(): continue
    Xh = X_tr_base[mask]; yh = tr_str[mask]
    for sigma in [0.012, 0.018, 0.024]:
        aug_parts_X.append(Xh + np.random.normal(0,sigma,Xh.shape).astype(np.float32))
        aug_parts_y.append(yh)

X_train = np.vstack(aug_parts_X)
y_train = le.transform(np.concatenate(aug_parts_y))
print(f"Train: {X_train.shape}   Test: {X_test.shape}")

# ── Train LGBM only ────────────────────────────────────────────────────────────
print("\nTraining LightGBM...")
model = LGBMClassifier(
    n_estimators=600, learning_rate=0.05, num_leaves=127,
    min_child_samples=5, n_jobs=-1, random_state=42, verbose=1)
model.fit(X_train, y_train,
          eval_set=[(X_test, y_test)],
          callbacks=[])

acc = model.score(X_test, y_test)
print(f"\nLGBM accuracy: {acc:.4f}")

joblib.dump(model, 'models/lgbm_v2.pkl')
with open('models/winner.txt','w') as f: f.write('lgbm')

print("\n=== CLASSIFICATION REPORT ===")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("\n=== F1 PER CLASS (worst first) ===")
f1s = f1_score(y_test, y_pred, average=None)
for cls, f1 in sorted(zip(le.classes_, f1s), key=lambda x: x[1]):
    print(f"  {cls}: {f1:.3f}")

# ── Export ONNX ────────────────────────────────────────────────────────────────
print("\nExporting ONNX (zipmap=False)...")
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

onx = convert_sklearn(model,
    initial_types=[('float_input', FloatTensorType([None, 126]))],
    target_opset=12,
    options={type(model): {'zipmap': False}})

onnx_path = 'models/ishaara_sign_classifier.onnx'
with open(onnx_path, 'wb') as f: f.write(onx.SerializeToString())
print(f"ONNX size: {os.path.getsize(onnx_path)/1e6:.1f} MB")

# ── Validate ONNX ──────────────────────────────────────────────────────────────
import onnxruntime as rt
sess = rt.InferenceSession(onnx_path)
inp  = sess.get_inputs()[0].name
mismatch = sum(
    int(model.predict(X_test[i:i+1])[0]) != int(sess.run(None,{inp:X_test[i:i+1]})[0][0])
    for i in range(min(200, len(X_test))))
print(f"ONNX validation: {mismatch}/200 mismatches  {'PASSED' if mismatch==0 else 'WARNING'}")

# ── label_map ──────────────────────────────────────────────────────────────────
label_map = {str(i): cls for i, cls in enumerate(le.classes_)}
with open('models/label_map.json','w') as f: json.dump(label_map, f)
print(f"label_map written")

# ── Copy to frontend ────────────────────────────────────────────────────────────
dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)
shutil.copy(onnx_path,               dest + 'ishaara_sign_classifier.onnx')
shutil.copy('models/label_map.json', dest + 'label_map.json')
print(f"\nCopied to {dest}")
print(f"\n✅ DONE — LGBM accuracy: {acc:.4f}")

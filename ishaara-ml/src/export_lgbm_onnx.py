"""
export_lgbm_onnx.py — Export the trained lgbm_v2.pkl to ONNX using onnxmltools.
Requires: pip install onnxmltools
"""

import os, json, shutil
import joblib, numpy as np

# ── Register LightGBM converter with skl2onnx ─────────────────────────────────
import onnxmltools
from onnxmltools.convert import convert_lightgbm
from onnxmltools.convert.common.data_types import FloatTensorType
import lightgbm as lgb


# ── Load model ─────────────────────────────────────────────────────────────────
model = joblib.load('models/lgbm_v2.pkl')
le    = joblib.load('models/label_encoder.pkl')
print(f"Loaded lgbm_v2.pkl  classes: {le.classes_}")

# ── Convert to ONNX via onnxmltools native LightGBM conversion ────────────────
print("Converting to ONNX...")
onx = convert_lightgbm(
    model,
    initial_types=[('float_input', FloatTensorType([None, 126]))],
    target_opset=12
)

onnx_path = 'models/ishaara_sign_classifier.onnx'
with open(onnx_path, 'wb') as f:
    f.write(onx.SerializeToString())

size_mb = os.path.getsize(onnx_path) / 1e6
print(f"ONNX saved: {onnx_path}  ({size_mb:.1f} MB)")

# ── Validate ───────────────────────────────────────────────────────────────────
import onnxruntime as rt
sess    = rt.InferenceSession(onnx_path)
inp_name = sess.get_inputs()[0].name
print(f"Input:  {inp_name}  {sess.get_inputs()[0].shape}")
for o in sess.get_outputs():
    print(f"Output: {o.name}  type={o.type}  shape={o.shape}")

# Quick sanity test
X_test = np.load('data/splits/X_test.npy').astype(np.float32)
y_test = np.load('data/splits/y_test.npy')

sk_preds  = model.predict(X_test[:200])
ort_preds = sess.run(None, {inp_name: X_test[:200]})[0]
mismatch  = sum(int(a) != int(b) for a, b in zip(sk_preds, ort_preds))
print(f"ONNX validation: {mismatch}/200 mismatches  {'✅ PASSED' if mismatch == 0 else '⚠️  WARNING'}")

# ── label_map ──────────────────────────────────────────────────────────────────
label_map = {str(i): cls for i, cls in enumerate(le.classes_)}
with open('models/label_map.json', 'w') as f:
    json.dump(label_map, f)
print(f"label_map.json written")

# ── Copy to frontend ────────────────────────────────────────────────────────────
dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)
shutil.copy(onnx_path,               dest + 'ishaara_sign_classifier.onnx')
shutil.copy('models/label_map.json', dest + 'label_map.json')
print(f"\n✅ Copied to {dest}")
print(f"   ishaara_sign_classifier.onnx  ({size_mb:.1f} MB)")
print(f"   label_map.json")
print(f"\nDONE — new model is live in the frontend!")

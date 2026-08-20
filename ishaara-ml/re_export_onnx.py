"""
Re-export the MLP model to ONNX with zipmap=False.

By default skl2onnx exports output_probability as a ZipMap (dict sequence),
which onnxruntime-web cannot read as a tensor (.data throws ERROR_CODE 9).
Setting zipmap=False forces a plain Float32 probability tensor instead.
"""

import joblib, json, shutil, os
import numpy as np

# ── Load winner model ──────────────────────────────────────────────────────────
winner_name = open('models/winner.txt').read().strip()
print(f'Winner model: {winner_name}')
assert winner_name == 'mlp', \
    f"This script is for sklearn MLP. Got: {winner_name}. LightGBM needs onnxmltools."

model = joblib.load(f'models/{winner_name}.pkl')
le    = joblib.load('models/label_encoder.pkl')

print(f'Classes ({len(le.classes_)}): {le.classes_}')
print(f'Input features: 126 (63 left + 63 right)')

# ── Re-export with zipmap=False ─────────────────────────────────────────────────
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, 126]))]

# zipmap=False → output_probability is Float32 tensor [batch, n_classes]
# instead of a ZipMap (Sequence of Maps) which browser ONNX can't read
options = {type(model): {'zipmap': False}}

print('Re-exporting to ONNX with zipmap=False...')
onx = convert_sklearn(
    model,
    initial_types=initial_type,
    target_opset=12,
    options=options
)

onnx_path = 'models/ishaara_sign_classifier.onnx'
with open(onnx_path, 'wb') as f:
    f.write(onx.SerializeToString())

size = os.path.getsize(onnx_path) / 1e6
print(f'ONNX saved: {size:.2f} MB')

# ── Validate output shape ───────────────────────────────────────────────────────
import onnxruntime as rt

sess       = rt.InferenceSession(onnx_path)
input_name = sess.get_inputs()[0].name
print(f'Input:  {input_name}  shape={sess.get_inputs()[0].shape}')
for o in sess.get_outputs():
    print(f'Output: {o.name}  type={o.type}  shape={o.shape}')

# Quick sanity check
dummy = np.zeros((1, 126), dtype=np.float32)
dummy[0, 63] = 1.0  # non-zero right-hand
out = sess.run(None, {input_name: dummy})
print(f'Dummy inference — label={out[0]}, prob shape={out[1].shape}, max_prob={out[1].max():.3f}')
print('Validation PASSED — output_probability is now a float tensor!')

# ── Copy to frontend ────────────────────────────────────────────────────────────
dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)
shutil.copy(onnx_path, dest + 'ishaara_sign_classifier.onnx')
print(f'Copied to {dest}')
print('Done!')

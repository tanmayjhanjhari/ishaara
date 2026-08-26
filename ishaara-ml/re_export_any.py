"""
Re-export the WINNING model (RF or MLP) to ONNX with zipmap=False.

zipmap=False forces output_probability to be a plain Float32 tensor [batch, n_classes]
instead of a ZipMap (Sequence of Maps) which onnxruntime-web cannot read via .data.
"""

import joblib, json, shutil, os
import numpy as np

# ── Load winner ────────────────────────────────────────────────────────────────
winner_name = open('models/winner.txt').read().strip()
print(f'Winner model: {winner_name}')

model = joblib.load(f'models/{winner_name}.pkl')
le    = joblib.load('models/label_encoder.pkl')

print(f'Classes ({len(le.classes_)}): {le.classes_}')
print(f'Input features: 126 (63 left + 63 right)')

# ── Export to ONNX ─────────────────────────────────────────────────────────────
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, 126]))]
options      = {type(model): {'zipmap': False}}

print(f'Exporting {winner_name} to ONNX with zipmap=False...')
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

# ── Validate ───────────────────────────────────────────────────────────────────
import onnxruntime as rt

sess       = rt.InferenceSession(onnx_path)
input_name = sess.get_inputs()[0].name
print(f'Input:  {input_name}  shape={sess.get_inputs()[0].shape}')
for o in sess.get_outputs():
    print(f'Output: {o.name}  type={o.type}  shape={o.shape}')

# Quick sanity check with a non-zero sample
X_test = np.load('data/splits/X_test.npy')
sample = X_test[0:1]
out    = sess.run(None, {input_name: sample})
print(f'Inference OK  label={out[0]}  prob_shape={out[1].shape}  max_prob={float(out[1].max()):.3f}')

# Verify "probabilities" output is accessible as array (not ZipMap)
assert isinstance(out[1], np.ndarray), "ERROR: output_probability is still a dict/ZipMap!"
print('✅ output_probability is a plain float tensor — onnxruntime-web compatible!')

# ── Label map (regenerate to stay in sync) ─────────────────────────────────────
label_map = {str(i): cls for i, cls in enumerate(le.classes_)}
with open('models/label_map.json', 'w') as f:
    json.dump(label_map, f)
print(f'label_map.json: {label_map}')

# ── Copy to frontend ───────────────────────────────────────────────────────────
dest = '../ishaara-web/public/models/'
os.makedirs(dest, exist_ok=True)
shutil.copy(onnx_path,              dest + 'ishaara_sign_classifier.onnx')
shutil.copy('models/label_map.json', dest + 'label_map.json')
print(f'Copied to {dest}')
print('Done!')

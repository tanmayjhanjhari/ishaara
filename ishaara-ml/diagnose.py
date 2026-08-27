import joblib, numpy as np
from sklearn.metrics import classification_report, confusion_matrix, f1_score

model  = joblib.load('models/rf.pkl')   # current winner
le     = joblib.load('models/label_encoder.pkl')
X_test = np.load('data/splits/X_test.npy')
y_test = np.load('data/splits/y_test.npy')

y_pred = model.predict(X_test)
print("=== CLASSIFICATION REPORT (current rf model) ===")
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("\n=== F1 PER CLASS (sorted worst first) ===")
f1_per = f1_score(y_test, y_pred, average=None)
pairs  = sorted(zip(le.classes_, f1_per), key=lambda x: x[1])
for cls, f1 in pairs:
    print(f"  {cls}: {f1:.3f}")

print("\n=== CONFUSION PAIRS (> 2 misclassifications) ===")
cm = confusion_matrix(y_test, y_pred)
for i, true_cls in enumerate(le.classes_):
    for j, pred_cls in enumerate(le.classes_):
        if i != j and cm[i][j] > 2:
            print(f"  {true_cls} predicted as {pred_cls}: {cm[i][j]} times")

print("\n=== OVERALL ACCURACY ===")
print(f"  Accuracy: {(y_pred == y_test).mean():.4f}")
print(f"  X_test shape: {X_test.shape}  (left63 + right63)")
print(f"  Feature layout: left_hand[0:63] + right_hand[63:126]")

# Check what % of training data has non-zero left vs right
left_nonzero  = (X_test[:, :63] != 0).any(axis=1).mean()
right_nonzero = (X_test[:, 63:] != 0).any(axis=1).mean()
print(f"  Samples with non-zero LEFT  hand: {left_nonzero:.1%}")
print(f"  Samples with non-zero RIGHT hand: {right_nonzero:.1%}")

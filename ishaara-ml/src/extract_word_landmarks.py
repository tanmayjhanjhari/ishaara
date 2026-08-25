import pandas as pd
import numpy as np
import os
import glob
import json

base = 'data/raw/words/keypoints'

def extract_representative_frame(parquet_file):
  try:
    df = pd.read_parquet(parquet_file)
  except Exception as e:
    print(f"Error reading {parquet_file}: {e}")
    return None
    
  if df.empty:
    return None
  
  frames = df['frame'].unique()
  if len(frames) == 0:
    return None
    
  mid_frame = frames[len(frames) // 2]
  
  best_frame = None
  best_score = -1
  
  for f in frames:
    f_df = df[df['frame'] == f]
    hands_df = f_df[f_df['type'].isin(['left_hand', 'right_hand'])]
    valid_count = hands_df['x'].notna().sum()
    
    dist_from_mid = abs(f - mid_frame)
    score = valid_count * 1000 - dist_from_mid
    
    if score > best_score:
      best_score = score
      best_frame = f
      
  if best_frame is None:
    return None
    
  f_df = df[df['frame'] == best_frame]
  
  # Extract left hand
  left_df = f_df[(f_df['type'] == 'left_hand') & (f_df['landmark_index'].between(0, 20))].sort_values('landmark_index')
  left_lms = []
  if not left_df.empty and left_df['x'].notna().all() and len(left_df) == 21:
    for _, row in left_df.iterrows():
      left_lms.append({'x': float(row['x']), 'y': float(row['y']), 'z': float(row['z'])})
  else:
    left_lms = [{'x': 0.0, 'y': 0.0, 'z': 0.0} for _ in range(21)]
    
  # Extract right hand
  right_df = f_df[(f_df['type'] == 'right_hand') & (f_df['landmark_index'].between(0, 20))].sort_values('landmark_index')
  right_lms = []
  if not right_df.empty and right_df['x'].notna().all() and len(right_df) == 21:
    for _, row in right_df.iterrows():
      right_lms.append({'x': float(row['x']), 'y': float(row['y']), 'z': float(row['z'])})
  else:
    right_lms = [{'x': 0.0, 'y': 0.0, 'z': 0.0} for _ in range(21)]
    
  return {
    'left_hand': left_lms,
    'right_hand': right_lms
  }

word_landmarks = {}
for category in os.listdir(base):
  cat_path = os.path.join(base, category)
  if not os.path.isdir(cat_path): continue
  for word in os.listdir(cat_path):
    word_path = os.path.join(cat_path, word)
    files     = glob.glob(os.path.join(word_path, '*.parquet'))
    if not files: continue
    
    frames = []
    for f in files:
      lm = extract_representative_frame(f)
      if lm: frames.append(lm)
      
    if frames:
      avg_left = []
      avg_right = []
      for idx in range(21):
        xs_l = [fr['left_hand'][idx]['x'] for fr in frames]
        ys_l = [fr['left_hand'][idx]['y'] for fr in frames]
        zs_l = [fr['left_hand'][idx]['z'] for fr in frames]
        avg_left.append({
          'x': float(np.mean(xs_l)),
          'y': float(np.mean(ys_l)),
          'z': float(np.mean(zs_l))
        })
        
        xs_r = [fr['right_hand'][idx]['x'] for fr in frames]
        ys_r = [fr['right_hand'][idx]['y'] for fr in frames]
        zs_r = [fr['right_hand'][idx]['z'] for fr in frames]
        avg_right.append({
          'x': float(np.mean(xs_r)),
          'y': float(np.mean(ys_r)),
          'z': float(np.mean(zs_r))
        })
        
      word_landmarks[word] = {
        'category':            category,
        'reference_landmarks': {
          'left_hand': avg_left,
          'right_hand': avg_right
        },
        'recording_count':     len(frames)
      }
      print(f"Processed: {category}/{word} ({len(frames)} recordings)")

# Ensure output directory exists
os.makedirs('models', exist_ok=True)
with open('models/word_landmarks.json', 'w') as f:
  json.dump(word_landmarks, f, indent=2)
print(f"\nSaved {len(word_landmarks)} word landmarks to models/word_landmarks.json")

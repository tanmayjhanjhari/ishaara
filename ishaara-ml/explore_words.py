import pandas as pd
import os
import glob

word_data = {}
base = 'data/raw/words/keypoints'

for category in os.listdir(base):
  cat_path = os.path.join(base, category)
  if not os.path.isdir(cat_path): continue
  for word in os.listdir(cat_path):
    word_path = os.path.join(cat_path, word)
    if not os.path.isdir(word_path): continue
    files = glob.glob(os.path.join(word_path, '*.parquet'))
    if files:
      df = pd.read_parquet(files[0])
      word_data[word] = {
        'category': category,
        'files':    len(files),
        'columns':  list(df.columns),
        'shape':    df.shape
      }

print(f"Total words: {len(word_data)}")
for word, info in list(word_data.items())[:10]:
  print(f"  {info['category']}/{word}: {info['files']} videos, shape {info['shape']}")
if len(word_data) > 0:
  print("\nColumn sample:", list(word_data.values())[0]['columns'][:10])

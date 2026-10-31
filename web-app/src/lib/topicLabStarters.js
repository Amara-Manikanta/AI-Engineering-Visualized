/**
 * Engaging, real-world starter Python templates for each topic page.
 * When a user opens the Python Lab on any topic, if they haven't saved custom code yet,
 * they get a clean, ready-to-run template specifically for that topic with an interesting dataset.
 */

import { SAMPLE_DATASETS } from './sampleDatasets';

export const TOPIC_STARTERS = {
  // 1. Linear Regression: LLM Model Size vs Peak GPU VRAM
  '/ml/linear-regression': SAMPLE_DATASETS.find((d) => d.id === 'llm-vram').pythonCode,

  // 2. Multiple Linear Regression: Rush-Hour Pizza Delivery
  '/ml/multiple-regression': SAMPLE_DATASETS.find((d) => d.id === 'pizza-delivery').pythonCode,

  // 3. Logistic Regression: SpaceX Falcon 9 Booster Ocean Landing
  '/ml/logistic-regression': SAMPLE_DATASETS.find((d) => d.id === 'spacex-landing').pythonCode,

  // 4. Decision Trees: AI Prompt Injection Detection
  '/ml/decision-trees': SAMPLE_DATASETS.find((d) => d.id === 'cybersecurity-prompt-injection').pythonCode,

  // 5. Random Forests: SpaceX Recovery with Ensembles
  '/ml/random-forests': `# Dataset: SpaceX Rocket Recovery with Random Forests
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 100
payload = np.random.uniform(2000, 16000, n)
wind_speed = np.random.uniform(5, 45, n) # km/h
waves = np.random.uniform(0.5, 5.0, n)     # meters
reused = np.random.choice([0, 1], n, p=[0.3, 0.7])

# Landing success threshold
score = 4.0 - 0.00025 * payload - 0.05 * wind_speed - 0.8 * waves + np.random.randn(n)*0.3
landed = (score > 0).astype(int)

df = pd.DataFrame({
    'payload_kg': np.round(payload),
    'wind_kmh': np.round(wind_speed, 1),
    'waves_m': np.round(waves, 1),
    'core_reused': reused,
    'success': landed
})

X = df[['payload_kg', 'wind_kmh', 'waves_m', 'core_reused']]
y = df['success']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

rf = RandomForestClassifier(n_estimators=50, random_state=42)
rf.fit(X_train, y_train)

print(f"Random Forest Test Accuracy: {rf.score(X_test, y_test)*100:.1f}%")
print("\\nFeature Importances in Rocket Recovery:")
for col, imp in sorted(zip(X.columns, rf.feature_importances_), key=lambda x: x[1], reverse=True):
    print(f"  {col:15s}: {imp*100:.1f}%")
`,

  // 6. K-Means / Clustering: Superhero Combat Archetypes
  '/ml/clustering': SAMPLE_DATASETS.find((d) => d.id === 'superhero-archetypes').pythonCode,

  // 7. Dimensionality Reduction: Spotify Music Audio Map (PCA)
  '/ml/dimensionality-reduction': SAMPLE_DATASETS.find((d) => d.id === 'spotify-genres').pythonCode,

  // 8. Transformers / Attention: Scaled Dot-Product Attention in NumPy
  '/ml/transformers': `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Practice: Scaled Dot-Product Attention in NumPy
def softmax(x):
    e = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e / np.sum(e, axis=-1, keepdims=True)

tokens = ["The", "neural", "network", "generates", "code"]
seq_len = len(tokens)
d_k = 4 # Key dimension

np.random.seed(42)
Q = np.random.randn(seq_len, d_k)
K = np.random.randn(seq_len, d_k)
V = np.random.randn(seq_len, d_k)

# Attention(Q, K, V) = softmax( (Q @ K.T) / sqrt(d_k) ) @ V
raw_scores = (Q @ K.T) / np.sqrt(d_k)
attention_weights = softmax(raw_scores)
context = attention_weights @ V

print("Attention Distribution (Row 0: 'The' attending to other words):")
for tok, w in zip(tokens, attention_weights[0]):
    print(f"  '{tok}': {w:.3f}")

# Plot heatmap
plt.figure(figsize=(6, 4.5))
plt.imshow(attention_weights, cmap='magma', interpolation='nearest')
plt.colorbar(label='Attention Weight')
plt.xticks(range(seq_len), tokens, rotation=35)
plt.yticks(range(seq_len), tokens)
plt.title('Self-Attention Heatmap')
plt.tight_layout()
`,

  // 9. RAG Chunking: AI Engineering Corpus Chunker
  '/rag/chunking': `def chunk_document(text, chunk_size=24, overlap=6):
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk_words = words[i:i + chunk_size]
        if not chunk_words:
            break
        chunks.append({
            'chunk_id': len(chunks) + 1,
            'word_count': len(chunk_words),
            'text': " ".join(chunk_words)
        })
        if i + chunk_size >= len(words):
            break
    return chunks

doc = (
    "In Retrieval-Augmented Generation (RAG), chunking determines the granular boundary "
    "of knowledge retrieval. If chunks are too small (e.g. 50 tokens), semantic context is lost. "
    "If chunks are too large (e.g. 2000 tokens), the vector embedding becomes diluted with noise. "
    "A standard production practice is sliding-window chunking with 256 tokens and 32 token overlap, "
    "ensuring sentence boundaries and multi-hop facts remain intact across chunk edges."
)

chunks = chunk_document(doc, chunk_size=22, overlap=5)
print(f"=== Document Chunker Result ({len(chunks)} Chunks) ===")
for c in chunks:
    print(f"\\n[Chunk #{c['chunk_id']} | {c['word_count']} words]")
    print(f'"{c["text"]}"')
`,

  // 10. Vector Search & RAG
  '/rag/retrieval': SAMPLE_DATASETS.find((d) => d.id === 'rag-corpus-semantic').pythonCode,
  '/rag/vector-dbs': SAMPLE_DATASETS.find((d) => d.id === 'rag-corpus-semantic').pythonCode,
  '/embeddings': SAMPLE_DATASETS.find((d) => d.id === 'rag-corpus-semantic').pythonCode,
};

export function getStarterCodeForPage(pathname, title = '') {
  if (TOPIC_STARTERS[pathname]) {
    return TOPIC_STARTERS[pathname];
  }

  // Default universal starter for any other topic
  return `# Python Practice Lab for: ${title || 'This Topic'}
# Write and run your code below with NumPy, Scikit-learn, Pandas, or Matplotlib.

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

print("Python Lab ready for ${title || 'Topic'}!")
`;
}

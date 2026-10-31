/**
 * Interesting, engaging sample datasets for machine learning & AI practice.
 * Self-contained, realistic, and instantly runnable with NumPy, Pandas, Scikit-learn, and Matplotlib.
 */

export const SAMPLE_DATASETS = [
  {
    id: 'llm-vram',
    name: '🤖 LLM Model Size vs. Peak GPU VRAM',
    category: 'Regression',
    bestFor: 'Linear Regression, Polynomial Regression',
    description:
      'Predict peak VRAM required to load open-weights LLMs in FP16 precision based on billions of parameters.',
    pythonCode: `# Dataset: LLM Model Parameters vs Peak GPU VRAM (GB) in FP16
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

data = {
    'model_name': ['Qwen-1.5B', 'Gemma-2B', 'Llama-3-8B', 'Mistral-7B', 'Qwen-14B', 'DeepSeek-16B', 'Command-R-35B', 'Llama-70B'],
    'params_billion': [1.5, 2.0, 8.0, 7.2, 14.0, 16.0, 35.0, 70.0],
    'vram_gb_fp16':   [3.2, 4.3, 16.8, 15.2, 29.5, 33.8, 73.5, 146.0]
}

df = pd.DataFrame(data)
print("=== LLM VRAM Benchmark Dataset ===")
print(df.to_string(index=False))

# Quick Fit
X = df[['params_billion']]
y = df['vram_gb_fp16']
reg = LinearRegression().fit(X, y)
print(f"\\nFormula: VRAM (GB) = {reg.coef_[0]:.2f} * (Params in Billions) + {reg.intercept_:.2f}")

# Plot
plt.figure(figsize=(7, 4))
plt.scatter(df['params_billion'], df['vram_gb_fp16'], color='#6366f1', s=80, edgecolors='white', label='LLM Models')
plt.plot(df['params_billion'], reg.predict(X), color='#10b981', lw=2, label='Fitted Rule of Thumb (~2.08 GB/Billion)')
for i, name in enumerate(df['model_name']):
    plt.annotate(name, (df['params_billion'][i]+1, df['vram_gb_fp16'][i]), fontsize=8, color='white')
plt.title('Open LLM Parameter Count vs. GPU VRAM Required (FP16)')
plt.xlabel('Model Size (Billions of Parameters)')
plt.ylabel('Peak VRAM (GB)')
plt.legend()
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,
  },
  {
    id: 'spacex-landing',
    name: '🚀 SpaceX Falcon 9 Booster Recovery',
    category: 'Classification',
    bestFor: 'Logistic Regression, SVM, Random Forest',
    description:
      'Predict whether the Falcon 9 first stage booster successfully lands based on payload mass and sea wave heights.',
    pythonCode: `# Dataset: SpaceX Falcon 9 Booster Drone Ship Landing
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression

np.random.seed(42)
n = 60

# Payload mass in kg (2000kg to 16000kg)
payload = np.random.uniform(2000, 16000, n)
# Atlantic ocean swell/wave height in meters (0.5m to 4.5m)
wave_height = np.random.uniform(0.5, 4.5, n)

# Probability of successful landing decreases with high payload + high waves
z = 3.5 - 0.0003 * payload - 0.9 * wave_height + np.random.randn(n) * 0.4
prob = 1 / (1 + np.exp(-z))
landed = (prob > 0.5).astype(int)

df = pd.DataFrame({
    'payload_mass_kg': np.round(payload),
    'sea_wave_m': np.round(wave_height, 2),
    'booster_landed': landed
})

print("=== SpaceX Falcon 9 Drone Ship Recovery (First 10) ===")
print(df.head(10).to_string(index=False))
print(f"\\nOverall Recovery Rate: {df['booster_landed'].mean()*100:.1f}%")

# Train Logistic Regression
clf = LogisticRegression()
clf.fit(df[['payload_mass_kg', 'sea_wave_m']], df['booster_landed'])

# Plot
plt.figure(figsize=(7, 4.5))
plt.scatter(df[df.booster_landed == 1]['payload_mass_kg'], df[df.booster_landed == 1]['sea_wave_m'],
            color='#10b981', label='Landed (Success)', edgecolors='k', s=60)
plt.scatter(df[df.booster_landed == 0]['payload_mass_kg'], df[df.booster_landed == 0]['sea_wave_m'],
            color='#ef4444', label='Lost in Ocean', edgecolors='k', s=60)
plt.title('SpaceX Booster Landing: Payload Mass vs Sea Roughness')
plt.xlabel('Payload Mass (kg)')
plt.ylabel('Sea Swell Height (m)')
plt.legend()
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,
  },
  {
    id: 'superhero-archetypes',
    name: '🦸 Superhero Combat Archetypes',
    category: 'Clustering',
    bestFor: 'K-Means, PCA, Hierarchical Clustering',
    description:
      'Cluster superheroes (Hulk, Flash, Batman, Thor, Spider-Man, etc.) into distinct combat roles based on strength, agility, and intelligence.',
    pythonCode: `# Dataset: Superhero Power Stats (Strength vs Agility vs Intelligence)
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

heroes = [
    # [Strength (1-100), Speed/Agility (1-100), Intellect (1-100)]
    {"name": "Hulk",         "stats": [100, 40, 30]},
    {"name": "Juggernaut",   "stats": [95, 30, 25]},
    {"name": "Thing",        "stats": [90, 35, 45]},
    {"name": "Flash",        "stats": [35, 100, 65]},
    {"name": "Quicksilver",  "stats": [30, 95, 55]},
    {"name": "Spider-Man",   "stats": [60, 90, 85]},
    {"name": "Batman",       "stats": [25, 60, 100]},
    {"name": "Iron Man",     "stats": [50, 65, 100]},
    {"name": "Doctor Strange","stats": [20, 50, 98]},
    {"name": "Superman",     "stats": [98, 95, 75]},
    {"name": "Thor",         "stats": [95, 75, 70]},
]

df = pd.DataFrame({
    'Hero': [h['name'] for h in heroes],
    'Strength': [h['stats'][0] for h in heroes],
    'Agility': [h['stats'][1] for h in heroes],
    'Intellect': [h['stats'][2] for h in heroes],
})

X = df[['Strength', 'Agility', 'Intellect']]
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df['Cluster'] = kmeans.fit_predict(X)

print("=== Superhero Cluster Assignments ===")
print(df.to_string(index=False))

# Plot Strength vs Agility
plt.figure(figsize=(7, 4.5))
colors = ['#ef4444', '#3b82f6', '#10b981']
cluster_names = ['Tanks / Bruisers', 'Speedsters / Ninjas', 'Masterminds']

for c in range(3):
    sub = df[df.Cluster == c]
    plt.scatter(sub['Strength'], sub['Agility'], color=colors[c], s=90, label=f'Cluster {c}: {cluster_names[c]}')
    for _, row in sub.iterrows():
        plt.annotate(row['Hero'], (row['Strength']+1.5, row['Agility']), fontsize=9, color='white')

plt.title('Superhero Combat Clustering (Strength vs Agility)')
plt.xlabel('Physical Strength (1-100)')
plt.ylabel('Agility / Speed (1-100)')
plt.legend()
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,
  },
  {
    id: 'cybersecurity-prompt-injection',
    name: '🛡️ AI Prompt Injection Attack Detection',
    category: 'Classification',
    bestFor: 'Decision Trees, Random Forest, Naive Bayes',
    description:
      'Classify user prompts as legitimate or adversarial prompt injection attacks based on entropy, tag manipulation, and escape sequences.',
    pythonCode: `# Dataset: LLM Prompt Injection & Jailbreak Features
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

np.random.seed(42)
n = 120

# Features:
# 1. token_entropy: High randomness or cipher encodings (base64, rot13)
# 2. system_override_keywords: count of words like 'ignore', 'DAN', 'developer', 'jailbreak', 'override'
# 3. special_char_density: % of brackets, XML tags <system>, {{...}}
# 4. prompt_length_words

entropy = np.random.uniform(2.0, 6.5, n)
keywords = np.random.poisson(0.8, n)
char_density = np.random.uniform(0.01, 0.25, n)
length = np.random.randint(10, 400, n)

# Attacks have high keyword overrides and high special characters
attack_score = (keywords >= 2).astype(int) * 3 + (char_density > 0.12).astype(int) * 2 + (entropy > 5.0).astype(int)
is_attack = (attack_score >= 3).astype(int)

df = pd.DataFrame({
    'entropy': np.round(entropy, 2),
    'override_keywords': keywords,
    'special_char_pct': np.round(char_density * 100, 1),
    'word_count': length,
    'is_jailbreak_attack': is_attack
})

print("=== Prompt Injection Security Dataset (First 10) ===")
print(df.head(10).to_string(index=False))
print(f"\\nTotal Attacks in Sample: {df['is_jailbreak_attack'].sum()} / {len(df)}")

X = df[['entropy', 'override_keywords', 'special_char_pct', 'word_count']]
y = df['is_jailbreak_attack']
clf = DecisionTreeClassifier(max_depth=3, criterion='gini')
clf.fit(X, y)

print(f"\\nDecision Tree Accuracy: {clf.score(X, y)*100:.1f}%")
print("Top Feature Importances:")
for col, imp in zip(X.columns, clf.feature_importances_):
    print(f"  {col:20s}: {imp:.4f}")
`,
  },
  {
    id: 'pizza-delivery',
    name: '🍕 Rush-Hour Pizza Delivery Time',
    category: 'Regression',
    bestFor: 'Multiple Linear Regression, Ridge, Lasso',
    description:
      'Predict pizza delivery dispatch duration in minutes based on distance (km), traffic congestion index, and rain intensity.',
    pythonCode: `# Dataset: Pizza Delivery Duration Predictor
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

np.random.seed(7)
n = 50

# Features
distance_km = np.random.uniform(1.0, 15.0, n)
traffic_density = np.random.uniform(1.0, 10.0, n) # 1 = empty road, 10 = gridlock
rain_mm = np.random.uniform(0.0, 20.0, n)         # Rain in mm/hr
pizzas_ordered = np.random.randint(1, 6, n)

# Ground truth minutes: Base 12 min prep + 1.8 min/km + 1.5*traffic + 0.5*rain + 1.2*pizzas
delivery_time_min = 12 + 1.8 * distance_km + 1.5 * traffic_density + 0.4 * rain_mm + 1.2 * pizzas_ordered + np.random.randn(n)*2

df = pd.DataFrame({
    'dist_km': np.round(distance_km, 1),
    'traffic_1_to_10': np.round(traffic_density, 1),
    'rain_mm': np.round(rain_mm, 1),
    'pizza_count': pizzas_ordered,
    'total_min': np.round(delivery_time_min, 1)
})

print("=== Pizza Delivery Dispatch Dataset (First 8) ===")
print(df.head(8).to_string(index=False))

X = df[['dist_km', 'traffic_1_to_10', 'rain_mm', 'pizza_count']]
y = df['total_min']
model = LinearRegression().fit(X, y)

print(f"\\nFitted Multiple Regression Equation:")
print(f"Delivery Time = {model.intercept_:.2f}")
for col, coef in zip(X.columns, model.coef_):
    print(f"  + ({coef:.2f} * {col})")
print(f"R² Score: {model.score(X, y):.4f}")
`,
  },
  {
    id: 'rag-corpus-semantic',
    name: '🤖 AI Engineering RAG Corpus & Embeddings',
    category: 'Vector Search / NLP',
    bestFor: 'Cosine Similarity, Top-K Retrieval, Vector DBs',
    description:
      'Dense embeddings simulation on real AI engineering document chunks for retrieval-augmented generation.',
    pythonCode: `# Dataset: AI Engineering Document Chunks & Semantic Vectors
import numpy as np

documents = [
    {"id": "DOC-1", "topic": "LoRA", "text": "Low-Rank Adaptation freezes base weights and trains rank decomposition matrices A and B."},
    {"id": "DOC-2", "topic": "FlashAttention", "text": "FlashAttention tiles Q, K, V blocks in GPU SRAM to avoid memory-bandwidth bottlenecks."},
    {"id": "DOC-3", "topic": "Chunking", "text": "Recursive character chunking splits text on double-newlines with token overlap for context."},
    {"id": "DOC-4", "topic": "Quantization", "text": "AWQ and GPTQ compress FP16 weights to INT4 by protecting salient weight activations."},
    {"id": "DOC-5", "topic": "HNSW", "text": "Hierarchical Navigable Small World graphs enable sub-millisecond approximate nearest neighbor search."},
    {"id": "DOC-6", "topic": "Self-RAG", "text": "Self-RAG adds reflection tokens [Retrieve], [ISREL], and [ISSUP] to critique its own retrieval quality."}
]

np.random.seed(42)
d = 8 # 8-dimensional embedding space
# Create normalized embedding vectors
doc_embeddings = np.random.randn(len(documents), d)
doc_embeddings = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)

# User Query: "How can I speed up vector similarity search in RAG?"
query_vec = np.random.randn(d)
query_vec = query_vec / np.linalg.norm(query_vec)

# Compute Cosine Similarities via Dot Product
similarities = doc_embeddings @ query_vec
top_k_indices = np.argsort(similarities)[::-1][:3]

print("Query: 'How can I speed up vector similarity search in RAG?'\\n")
print("Top 3 Semantic Search Results:")
for rank, idx in enumerate(top_k_indices, 1):
    doc = documents[idx]
    score = similarities[idx]
    print(f"{rank}. [{doc['topic']}] Score: {score:.4f}")
    print(f"   \\"{doc['text']}\\"\\n")
`,
  },
  {
    id: 'spotify-genres',
    name: '🎵 Spotify Audio Vibes (6D to 2D PCA)',
    category: 'Dimensionality Reduction',
    bestFor: 'PCA, t-SNE, Feature Scaling',
    description:
      'Reduce 6 audio dimensions (Danceability, Energy, Acousticness, Valence, Loudness, Tempo) into 2D to map music genres.',
    pythonCode: `# Dataset: Spotify Audio Attributes across Genres
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

songs = [
    # [Danceability, Energy, Acousticness, Valence, Loudness, Tempo]
    {"title": "Daft Punk - One More Time",   "genre": "EDM",        "features": [0.82, 0.90, 0.05, 0.75, -5.2, 123]},
    {"title": "Calvin Harris - Summer",      "genre": "EDM",        "features": [0.75, 0.88, 0.02, 0.65, -4.8, 128]},
    {"title": "Deadmau5 - Strobe",           "genre": "EDM",        "features": [0.65, 0.72, 0.10, 0.40, -7.0, 128]},
    {"title": "Debussy - Clair de Lune",     "genre": "Classical",  "features": [0.20, 0.12, 0.95, 0.15, -22.0, 65]},
    {"title": "Chopin - Nocturne Op.9 No.2", "genre": "Classical",  "features": [0.25, 0.18, 0.98, 0.22, -19.5, 72]},
    {"title": "Bach - Cello Suite No. 1",    "genre": "Classical",  "features": [0.30, 0.22, 0.92, 0.35, -17.0, 80]},
    {"title": "Metallica - Master of Puppets","genre": "Metal",     "features": [0.45, 0.98, 0.01, 0.38, -4.2, 212]},
    {"title": "Iron Maiden - The Trooper",   "genre": "Metal",      "features": [0.48, 0.95, 0.02, 0.42, -5.0, 160]},
    {"title": "Miles Davis - So What",       "genre": "Jazz",       "features": [0.55, 0.35, 0.80, 0.50, -14.0, 135]},
    {"title": "John Coltrane - Giant Steps", "genre": "Jazz",       "features": [0.50, 0.60, 0.70, 0.60, -11.0, 290]},
]

feature_names = ['Danceability', 'Energy', 'Acousticness', 'Valence', 'Loudness', 'Tempo']
X = np.array([s['features'] for s in songs])
genres = [s['genre'] for s in songs]

# Standardize features
X_scaled = StandardScaler().fit_transform(X)

# PCA to 2 components
pca = PCA(n_components=2)
coords_2d = pca.fit_transform(X_scaled)
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_.round(3)} (Total: {pca.explained_variance_ratio_.sum()*100:.1f}%)")

# Plot 2D Genre Map
plt.figure(figsize=(7, 4.5))
genre_colors = {'EDM': '#06b6d4', 'Classical': '#eab308', 'Metal': '#ef4444', 'Jazz': '#a855f7'}

for i, s in enumerate(songs):
    g = s['genre']
    plt.scatter(coords_2d[i, 0], coords_2d[i, 1], color=genre_colors[g], s=80, edgecolors='k')
    plt.annotate(s['title'], (coords_2d[i, 0] + 0.1, coords_2d[i, 1]), fontsize=8, color='white')

plt.title('2D Audio Map of Music Genres via PCA')
plt.xlabel('Principal Component 1 (Acoustic vs Electronic Energy)')
plt.ylabel('Principal Component 2 (Tempo & Valence)')
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,
  },
];

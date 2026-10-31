import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  Cpu,
} from 'lucide-react';
import GuideLayout from '../components/GuideLayout';
import CodeBlock from '../components/CodeBlock';
import { getPythonEnvironment, isNativePythonAvailable } from '../lib/pythonRunner';

const LAB_RECIPES = [
  {
    id: 'linear-regression',
    category: 'Classical ML',
    title: 'Linear Regression & Gradient Descent',
    difficulty: 'Beginner',
    formula: 'y = m * X + b  |  Loss = (1/N) * sum((y_pred - y)^2)',
    description:
      'Train a univariate linear regression model using batch gradient descent from scratch in NumPy, and visualize both the fitted line and the cost curve over epochs.',
    starterCode: `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# 1. Synthetic Dataset
np.random.seed(42)
X = 2 * np.random.rand(50, 1)
y = 4 + 3 * X + np.random.randn(50, 1) * 0.5

# 2. Gradient Descent Parameters
m = 0.0          # Initial slope
b = 0.0          # Initial intercept
lr = 0.05        # Learning rate
epochs = 150
loss_history = []

# 3. Training Loop
n = len(X)
for epoch in range(epochs):
    y_pred = m * X + b
    error = y_pred - y
    mse = np.mean(error ** 2)
    loss_history.append(mse)

    # Compute gradients
    dm = (2 / n) * np.sum(error * X)
    db = (2 / n) * np.sum(error)

    # Update weights
    m -= lr * dm
    b -= lr * db

print(f"Optimal Line: y = {m:.4f} * x + {b:.4f}")
print(f"Final Mean Squared Error: {loss_history[-1]:.4f}")

# 4. Visualizations
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

# Plot 1: Fitted Line
ax1.scatter(X, y, color='cyan', alpha=0.7, label='Data points')
ax1.plot(X, m * X + b, color='coral', lw=2.5, label=f'Fit: y={m:.2f}x+{b:.2f}')
ax1.set_title('Linear Regression Fit')
ax1.set_xlabel('X')
ax1.set_ylabel('y')
ax1.legend()
ax1.grid(True, alpha=0.2)

# Plot 2: Loss Convergence
ax2.plot(range(epochs), loss_history, color='lime', lw=2)
ax2.set_title('MSE Loss vs. Epochs')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('Loss')
ax2.grid(True, alpha=0.2)

plt.tight_layout()
`,
  },
  {
    id: 'logistic-regression',
    category: 'Classical ML',
    title: 'Logistic Regression & Decision Boundary',
    difficulty: 'Intermediate',
    formula: 'sigma(z) = 1 / (1 + exp(-z))  |  BCE Loss',
    description:
      'Implement the Sigmoid activation and Binary Cross-Entropy loss. Train on 2D synthetic clusters and plot the classification decision boundary.',
    starterCode: `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

np.random.seed(10)

# 1. Generate 2-class 2D dataset
n_samples = 40
class_0 = np.random.randn(n_samples, 2) + np.array([-1.5, -1.5])
class_1 = np.random.randn(n_samples, 2) + np.array([1.5, 1.5])

X = np.vstack([class_0, class_1])
y = np.hstack([np.zeros(n_samples), np.ones(n_samples)])

# Add bias column
X_b = np.c_[np.ones((len(X), 1)), X]

# 2. Sigmoid function
def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -250, 250)))

# 3. Train with Gradient Descent
weights = np.zeros(X_b.shape[1])
lr = 0.1
epochs = 200

for epoch in range(epochs):
    probs = sigmoid(X_b @ weights)
    gradient = (1 / len(X)) * (X_b.T @ (probs - y))
    weights -= lr * gradient

preds = (sigmoid(X_b @ weights) >= 0.5).astype(int)
acc = np.mean(preds == y) * 100
print(f"Trained Weights [b, w1, w2]: {np.round(weights, 4)}")
print(f"Classification Accuracy: {acc:.1f}%")

# 4. Plot Decision Boundary
plt.figure(figsize=(7, 4.5))
plt.scatter(class_0[:, 0], class_0[:, 1], color='#ef4444', label='Class 0', edgecolors='k', s=50)
plt.scatter(class_1[:, 0], class_1[:, 1], color='#3b82f6', label='Class 1', edgecolors='k', s=50)

# Boundary: b + w1*x1 + w2*x2 = 0  =>  x2 = -(b + w1*x1) / w2
x_vals = np.linspace(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 100)
y_vals = -(weights[0] + weights[1] * x_vals) / weights[2]
plt.plot(x_vals, y_vals, 'w--', lw=2, label='Decision Boundary')

plt.title('Logistic Regression Decision Boundary')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.legend()
plt.grid(True, alpha=0.2)
`,
  },
  {
    id: 'kmeans-clustering',
    category: 'Unsupervised ML',
    title: 'K-Means Clustering from Scratch',
    difficulty: 'Intermediate',
    formula: 'min sum || x_i - mu_c ||^2',
    description:
      'Implement centroid assignment and centroid update steps from scratch in pure NumPy, and plot the discovered clusters with centroids.',
    starterCode: `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

np.random.seed(42)

# 1. Create 3 distinct 2D Gaussian clusters
c1 = np.random.randn(30, 2) + np.array([2, 2])
c2 = np.random.randn(30, 2) + np.array([-2, 2])
c3 = np.random.randn(30, 2) + np.array([0, -2])
X = np.vstack([c1, c2, c3])

# 2. K-Means algorithm
k = 3
# Randomly initialize centroids from points
initial_idx = np.random.choice(len(X), k, replace=False)
centroids = X[initial_idx]

for iteration in range(10):
    # Step A: Compute Euclidean distance to all centroids
    distances = np.linalg.norm(X[:, np.newaxis, :] - centroids, axis=2)
    labels = np.argmin(distances, axis=1)

    # Step B: Recompute centroids as cluster means
    new_centroids = np.array([X[labels == j].mean(axis=0) for j in range(k)])
    if np.allclose(centroids, new_centroids):
        print(f"Converged at iteration {iteration + 1}!")
        break
    centroids = new_centroids

print("Final Centroids:")
for idx, c in enumerate(centroids):
    print(f"  Cluster {idx}: x={c[0]:.2f}, y={c[1]:.2f} (count={np.sum(labels == idx)})")

# 3. Plot clusters
colors = ['#ec4899', '#06b6d4', '#eab308']
plt.figure(figsize=(7, 4.5))
for j in range(k):
    cluster_pts = X[labels == j]
    plt.scatter(cluster_pts[:, 0], cluster_pts[:, 1], color=colors[j], alpha=0.7, label=f'Cluster {j}')

plt.scatter(centroids[:, 0], centroids[:, 1], color='white', marker='*', s=250, edgecolor='black', lw=1.5, label='Centroids')
plt.title('K-Means Clustering (3 Clusters)')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend()
plt.grid(True, alpha=0.2)
`,
  },
  {
    id: 'decision-tree-gini',
    category: 'Classical ML',
    title: 'Decision Tree: Gini Impurity & Best Split',
    difficulty: 'Intermediate',
    formula: 'Gini = 1 - sum(p_i^2)',
    description:
      'Code the Gini impurity function and evaluate split candidates on a feature to find the threshold that gives maximum Information Gain.',
    starterCode: `import numpy as np

# 1. Gini Impurity function
def gini_impurity(y):
    if len(y) == 0:
        return 0.0
    _, counts = np.unique(y, return_counts=True)
    probs = counts / len(y)
    return 1.0 - np.sum(probs ** 2)

# 2. Sample 1D feature (Study Hours) and Labels (Passed Exam: 0 or 1)
study_hours = np.array([1.0, 1.5, 2.0, 3.0, 3.5, 4.0, 5.0, 6.0, 7.5, 8.0])
passed =      np.array([0,   0,   0,   0,   1,   0,   1,   1,   1,   1  ])

base_gini = gini_impurity(passed)
print(f"Initial Dataset Gini Impurity: {base_gini:.4f}")

# 3. Find Best Split Threshold
best_gain = -1
best_thresh = None

for i in range(len(study_hours) - 1):
    thresh = (study_hours[i] + study_hours[i+1]) / 2.0
    left_mask = study_hours <= thresh
    right_mask = ~left_mask

    y_left = passed[left_mask]
    y_right = passed[right_mask]

    n = len(passed)
    weighted_gini = (len(y_left)/n) * gini_impurity(y_left) + (len(y_right)/n) * gini_impurity(y_right)
    info_gain = base_gini - weighted_gini

    print(f"Threshold <= {thresh:.2f} hrs -> Left:{len(y_left)}, Right:{len(y_right)} -> Info Gain: {info_gain:.4f}")

    if info_gain > best_gain:
        best_gain = info_gain
        best_thresh = thresh

print(f"\\n--> Best Split Threshold: {best_thresh:.2f} hours (Gain = {best_gain:.4f})")
`,
  },
  {
    id: 'transformer-attention',
    category: 'Deep Learning & GenAI',
    title: 'Self-Attention Mechanism in NumPy',
    difficulty: 'Advanced',
    formula: 'Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V',
    description:
      'Implement the scaled dot-product self-attention mechanism from the "Attention Is All You Need" paper in pure NumPy, and plot the attention heatmap matrix.',
    starterCode: `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# 1. Softmax helper
def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

# 2. Tokens in a sample sentence
tokens = ["The", "robot", "saw", "the", "stars"]
seq_len = len(tokens)
d_model = 8  # Embedding dimension
d_k = 4      # Key/Query dimension

np.random.seed(7)
# Simulated token embeddings (Seq_Len x D_model)
X = np.random.randn(seq_len, d_model)

# Projection weight matrices
W_q = np.random.randn(d_model, d_k)
W_k = np.random.randn(d_model, d_k)
W_v = np.random.randn(d_model, d_k)

# Compute Queries, Keys, Values
Q = X @ W_q
K = X @ W_k
V = X @ W_v

# 3. Scaled Dot-Product Attention Scores
# (Q @ K.T) / sqrt(d_k)
raw_scores = (Q @ K.T) / np.sqrt(d_k)
attention_weights = softmax(raw_scores, axis=-1)

# Context Output
context = attention_weights @ V

print(f"Tokens: {tokens}")
print("Attention Weights Matrix shape:", attention_weights.shape)
print("\\nFirst token attention distribution:")
for tok, weight in zip(tokens, attention_weights[0]):
    print(f"  '{tok}': {weight:.4f}")

# 4. Plot Attention Heatmap
plt.figure(figsize=(6, 5))
plt.imshow(attention_weights, cmap='viridis', interpolation='nearest')
plt.colorbar(label='Attention Weight')
plt.xticks(range(seq_len), tokens, rotation=45)
plt.yticks(range(seq_len), tokens)
plt.title('Self-Attention Heatmap')
plt.xlabel('Keys (Attended To)')
plt.ylabel('Queries (Source)')
plt.tight_layout()
`,
  },
  {
    id: 'rag-vector-search',
    category: 'GenAI & RAG',
    title: 'Vector Embeddings & Cosine Retrieval',
    difficulty: 'Intermediate',
    formula: 'Cosine Sim = (A . B) / (||A|| * ||B||)',
    description:
      'Simulate a dense vector search index. Compute cosine similarities between a user query vector and document embeddings, and return the Top-K ranked matches.',
    starterCode: `import numpy as np

# 1. Document corpus
documents = [
    "Dense retrieval uses bi-encoder transformers to generate vector embeddings.",
    "BM25 is a sparse keyword matching algorithm based on TF-IDF term frequency.",
    "Chunking splits large documents into semantic passages with token overlap.",
    "Cosine similarity measures the angle between normalized vectors in high dimensions.",
    "HyDE generates hypothetical document answers before querying vector databases."
]

# 2. Simulated 8-dimensional semantic embeddings
np.random.seed(99)
doc_vectors = np.random.randn(len(documents), 8)
# Normalize vectors to unit length
doc_vectors = doc_vectors / np.linalg.norm(doc_vectors, axis=1, keepdims=True)

# Query: "How does vector similarity search work?"
query_vector = np.random.randn(8)
query_vector = query_vector / np.linalg.norm(query_vector)

# 3. Cosine Similarity via Dot Product (since vectors are unit-normalized)
similarities = doc_vectors @ query_vector

# Rank Top-K documents
top_k = 3
ranked_indices = np.argsort(similarities)[::-1][:top_k]

print("Query: 'How does vector similarity search work?'\\n")
print(f"Top {top_k} Most Relevant Documents:")
for rank, idx in enumerate(ranked_indices, 1):
    score = similarities[idx]
    print(f"{rank}. [Score: {score:.4f}] {documents[idx]}")
`,
  },
  {
    id: 'rag-chunking-algo',
    category: 'GenAI & RAG',
    title: 'RAG Text Chunking with Overlap',
    difficulty: 'Beginner',
    formula: 'Step Size = Chunk Size - Overlap',
    description:
      'Build a sliding window passage chunker with configurable token overlap to preserve contextual continuity across chunk boundaries.',
    starterCode: `def chunk_text(text, chunk_size=20, overlap=5):
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    
    if step <= 0:
        raise ValueError("chunk_size must be strictly greater than overlap")
        
    for i in range(0, len(words), step):
        chunk_words = words[i:i + chunk_size]
        if not chunk_words:
            break
        chunks.append({
            'chunk_id': len(chunks) + 1,
            'start_idx': i,
            'end_idx': i + len(chunk_words),
            'text': " ".join(chunk_words),
            'word_count': len(chunk_words)
        })
        if i + chunk_size >= len(words):
            break
            
    return chunks

sample_article = (
    "Retrieval-Augmented Generation bridges the knowledge cutoff of pre-trained large language models "
    "by retrieving external documents from private vector databases. In naive RAG pipelines, "
    "documents are indexed into fixed-size chunks, embedded with dense embedding models, "
    "and stored in vector stores such as Pinecone, Qdrant, or Chroma. When a user asks a prompt, "
    "the query is embedded and matched against top-k similar chunks using cosine similarity."
)

chunks = chunk_text(sample_article, chunk_size=16, overlap=4)

print(f"Total Chunks Created: {len(chunks)}")
for c in chunks:
    print(f"\\n[Chunk #{c['chunk_id']} | Words: {c['word_count']} | Range: {c['start_idx']}-{c['end_idx']}]")
    print(f'"{c["text"]}"')
`,
  },
  {
    id: 'scratchpad',
    category: 'Custom Playground',
    title: 'Empty Python ML Scratchpad',
    difficulty: 'Freeform',
    formula: 'Write any Python code with NumPy, Scikit-learn, Pandas, Matplotlib',
    description:
      'A blank notebook cell connected to your Anaconda Python runtime. Experiment freely with any machine learning model or data visualization.',
    starterCode: `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn import datasets

# Load iris dataset as a quick playground test
iris = datasets.load_iris()
X = iris.data
y = iris.target

print(f"Iris Dataset loaded: {X.shape[0]} samples, {X.shape[1]} features.")
print(f"Classes: {iris.target_names.tolist()}")

# Plot first 2 features (Sepal Length vs Sepal Width)
plt.figure(figsize=(6, 4))
scatter = plt.scatter(X[:, 0], X[:, 1], c=y, cmap='plasma', edgecolors='k', alpha=0.8)
plt.title('Iris Feature Scatter')
plt.xlabel(iris.feature_names[0])
plt.ylabel(iris.feature_names[1])
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,
  },
];

export default function MlCodeLab() {
  const [selectedRecipe, setSelectedRecipe] = useState(LAB_RECIPES[0]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [envInfo, setEnvInfo] = useState(null);
  const [checkingEnv, setCheckingEnv] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPythonEnvironment().then((info) => {
      if (mounted) {
        setEnvInfo(info);
        setCheckingEnv(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ['All', 'Classical ML', 'Unsupervised ML', 'Deep Learning & GenAI', 'GenAI & RAG', 'Custom Playground'];

  const filteredRecipes =
    activeCategory === 'All'
      ? LAB_RECIPES
      : LAB_RECIPES.filter((r) => r.category === activeCategory);

  const toc = [
    { label: 'Environment Status', hash: 'status' },
    { label: 'Select ML Concept', hash: 'select' },
    { label: 'Interactive Code Cell', hash: 'cell' },
    { label: 'Practice Challenges', hash: 'challenges' },
  ];

  return (
    <GuideLayout
      title="ML & AI Code Lab"
      intro="Interactive Python notebook for writing, experimenting, and mastering machine learning algorithms and GenAI architectures."
      toc={toc}
    >
      {/* Environment Status Badge */}
      <section id="status" className="mb-8 scroll-mt-24">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/20 via-black to-emerald-950/20 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>macOS Native Python Execution</span>
                  {isNativePythonAvailable() ? (
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Connected
                    </span>
                  ) : (
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Browser Mode
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  {envInfo?.ok
                    ? `Python ${envInfo.version} (${envInfo.pythonPath})`
                    : checkingEnv
                    ? 'Probing Python environment...'
                    : 'Active in macOS desktop app'}
                </p>
              </div>
            </div>

            {/* Packages Ready Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[0.6875rem] font-mono">
              {['numpy', 'sklearn', 'matplotlib', 'pandas', 'scipy'].map((pkg) => (
                <span
                  key={pkg}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {pkg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concept Selector */}
      <section id="select" className="mb-6 scroll-mt-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Select Practice Concept</span>
          </h2>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg border whitespace-nowrap font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'border-indigo-500/60 bg-indigo-500/20 text-white'
                  : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipe Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredRecipes.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => setSelectedRecipe(recipe)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/50'
                    : 'border-white/5 bg-[#141414] hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between text-[0.65rem] font-mono text-gray-400 mb-1">
                  <span>{recipe.category}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded ${
                      recipe.difficulty === 'Beginner'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : recipe.difficulty === 'Intermediate'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-indigo-400 bg-indigo-500/10'
                    }`}
                  >
                    {recipe.difficulty}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white line-clamp-1">
                  {recipe.title}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Code Cell */}
      <section id="cell" className="mb-10 scroll-mt-24">
        <div className="rounded-2xl border border-white/10 bg-[#0e0f10] p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
            <div>
              <div className="text-[0.6875rem] font-mono text-indigo-400 uppercase tracking-wider">
                {selectedRecipe.category}
              </div>
              <h2 className="text-lg font-bold text-white">{selectedRecipe.title}</h2>
            </div>
            <div className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
              <code>{selectedRecipe.formula}</code>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {selectedRecipe.description}
          </p>

          {/* Interactive Code Block */}
          <div className="pt-2">
            <CodeBlock
              key={selectedRecipe.id}
              language="python"
              code={selectedRecipe.starterCode}
              maxHeight="420px"
              runnable={true}
            />
          </div>
        </div>
      </section>

      {/* Practice Challenges Section */}
      <section id="challenges" className="mb-12 scroll-mt-24">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Challenges for this Concept</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">1.</span>
              <span>
                <strong>Tweak Hyperparameters:</strong> Click <strong>Edit</strong> on the cell above, adjust values like <code>lr = 0.5</code> or <code>epochs = 50</code>, and observe how the loss curve or classification boundary changes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">2.</span>
              <span>
                <strong>Add Noise or Outliers:</strong> Modify the synthetic data generation to add extreme outliers (e.g. <code>y[0] += 25</code>) and see how sensitive the model is.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">3.</span>
              <span>
                <strong>Keyboard Shortcut:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-gray-300 font-mono text-[0.65rem]">⌘ + Enter</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-gray-300 font-mono text-[0.65rem]">Ctrl + Enter</kbd>) anytime inside the editor to re-run instantly.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </GuideLayout>
  );
}

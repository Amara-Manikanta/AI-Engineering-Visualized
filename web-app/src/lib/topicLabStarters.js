/**
 * Default starter Python templates for each topic page.
 * When a user opens the Python Lab on any topic, if they haven't saved custom code yet,
 * they get a clean, ready-to-run template specifically for that topic.
 */

export const TOPIC_STARTERS = {
  '/ml/linear-regression': `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Practice: Fit a linear regression line using Gradient Descent
X = np.array([1, 2, 3, 4, 5, 6, 7, 8], dtype=float)
y = np.array([2.1, 3.9, 4.8, 6.2, 7.1, 8.9, 9.5, 11.2], dtype=float)

m = 0.0          # slope
b = 0.0          # intercept
lr = 0.02        # learning rate
epochs = 150
n = len(X)

for epoch in range(epochs):
    y_pred = m * X + b
    error = y_pred - y
    # Compute gradients
    dm = (2 / n) * np.sum(X * error)
    db = (2 / n) * np.sum(error)
    # Update
    m -= lr * dm
    b -= lr * db

print(f"Optimal line: y = {m:.3f}x + {b:.3f}")
print(f"Mean Squared Error: {np.mean((m * X + b - y) ** 2):.4f}")

# Plot fit
plt.figure(figsize=(6, 3.5))
plt.scatter(X, y, color='cyan', label='Data')
plt.plot(X, m * X + b, color='coral', lw=2, label=f'Fit: {m:.2f}x + {b:.2f}')
plt.legend()
plt.title('Linear Regression Fit')
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,

  '/ml/logistic-regression': `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

# Practice: Train Logistic Regression and plot decision boundary
X, y = make_classification(n_samples=80, n_features=2, n_informative=2, n_redundant=0, random_state=42)

clf = LogisticRegression()
clf.fit(X, y)

print(f"Weights (w1, w2): {clf.coef_[0].round(3)}")
print(f"Intercept (b):    {clf.intercept_[0]:.3f}")
print(f"Accuracy:         {clf.score(X, y) * 100:.1f}%")

# Plot boundary
plt.figure(figsize=(6, 4))
plt.scatter(X[y == 0, 0], X[y == 0, 1], color='#ef4444', label='Class 0', alpha=0.8)
plt.scatter(X[y == 1, 0], X[y == 1, 1], color='#3b82f6', label='Class 1', alpha=0.8)

# Decision boundary line: w1*x1 + w2*x2 + b = 0 => x2 = -(w1*x1 + b)/w2
w1, w2 = clf.coef_[0]
b = clf.intercept_[0]
x_line = np.linspace(X[:, 0].min(), X[:, 0].max(), 100)
y_line = -(w1 * x_line + b) / w2
plt.plot(x_line, y_line, 'w--', lw=2, label='Decision Boundary')

plt.title('Logistic Regression Decision Boundary')
plt.legend()
plt.grid(True, alpha=0.2)
plt.tight_layout()
`,

  '/ml/decision-trees': `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_iris

# Practice: Train a Decision Tree and inspect feature splits
iris = load_iris()
X = iris.data
y = iris.target

clf = DecisionTreeClassifier(max_depth=3, criterion='gini', random_state=42)
clf.fit(X, y)

print(f"Tree Depth: {clf.get_depth()}")
print(f"Number of Leaves: {clf.get_n_leaves()}")
print(f"Accuracy: {clf.score(X, y) * 100:.1f}%\\n")

print("Feature Importances:")
for name, imp in zip(iris.feature_names, clf.feature_importances_):
    print(f"  {name:25s}: {imp:.4f}")
`,

  '/ml/clustering': `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

# Practice: K-Means clustering and centroid discovery
np.random.seed(42)
c1 = np.random.randn(30, 2) + np.array([2, 2])
c2 = np.random.randn(30, 2) + np.array([-2, 2])
c3 = np.random.randn(30, 2) + np.array([0, -2])
X = np.vstack([c1, c2, c3])

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)
centers = kmeans.cluster_centers_

plt.figure(figsize=(6, 4))
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis', alpha=0.7)
plt.scatter(centers[:, 0], centers[:, 1], color='red', marker='X', s=200, label='Centroids')
plt.title('K-Means Clustering (3 Clusters)')
plt.legend()
plt.grid(True, alpha=0.2)
plt.tight_layout()

print("Cluster Centroids:\\n", np.round(centers, 3))
`,

  '/ml/knn': `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_wine

# Practice: K-Nearest Neighbors classification
data = load_wine()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.3, random_state=42)

for k in [1, 3, 5, 7, 9]:
    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(X_train, y_train)
    acc = knn.score(X_test, y_test)
    print(f"K = {k} -> Test Accuracy: {acc * 100:.1f}%")
`,

  '/ml/transformers': `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Practice: Scaled Dot-Product Attention in NumPy
def softmax(x):
    e = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e / np.sum(e, axis=-1, keepdims=True)

tokens = ["AI", "Visualised", "Engineering", "Lab"]
seq_len = len(tokens)
d_k = 4

np.random.seed(42)
Q = np.random.randn(seq_len, d_k)
K = np.random.randn(seq_len, d_k)
V = np.random.randn(seq_len, d_k)

# Attention = softmax(Q @ K.T / sqrt(d_k)) @ V
scores = (Q @ K.T) / np.sqrt(d_k)
attention_weights = softmax(scores)
context = attention_weights @ V

print("Attention Weights Matrix:\\n", np.round(attention_weights, 3))

# Plot heatmap
plt.figure(figsize=(5, 4))
plt.imshow(attention_weights, cmap='plasma')
plt.colorbar()
plt.xticks(range(seq_len), tokens, rotation=30)
plt.yticks(range(seq_len), tokens)
plt.title('Self-Attention Weights')
plt.tight_layout()
`,

  '/rag/chunking': `def chunk_text(text, chunk_size=20, overlap=5):
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = words[i:i + chunk_size]
        if not chunk:
            break
        chunks.append({
            'id': len(chunks) + 1,
            'text': " ".join(chunk),
            'length': len(chunk)
        })
        if i + chunk_size >= len(words):
            break
    return chunks

passage = (
    "Retrieval-Augmented Generation bridges the knowledge cutoff of LLMs "
    "by retrieving external documents from vector databases. Chunking splits "
    "documents into semantic passages with overlap to preserve context."
)

chunks = chunk_text(passage, chunk_size=10, overlap=3)
print(f"Created {len(chunks)} Chunks:")
for c in chunks:
    print(f"Chunk #{c['id']} ({c['length']} words): '{c['text']}'")
`,
};

export function getStarterCodeForPage(pathname, title = '') {
  if (TOPIC_STARTERS[pathname]) {
    return TOPIC_STARTERS[pathname];
  }

  // Default universal starter for any other topic
  return `import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Python Practice Lab for: ${title || 'This Topic'}
# Write and run your code below with NumPy, Scikit-learn, Pandas, or Matplotlib.

print("Running Python in ${title || 'Topic Lab'}...")
`;
}

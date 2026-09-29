/**
 * Knowledge checks for the pages added after the original question bank:
 * evaluation, regularisation, clustering, serving, safety, deployment and the
 * rest. quizBank.js merges these into QUIZZES, so every page still calls
 * questionsFor(id) the same way.
 *
 * Same style rules as quizBank.js, plus two more learned from auditing it:
 * the right answer should not be the longest option, and its position in the
 * array should vary (KnowledgeCheck shuffles on display anyway).
 */

export const EXTRA_QUIZZES = [
  {
    id: "ml-evaluation",
    topic: "Evaluation",
    label: "Evaluation Metrics",
    path: "/ml/evaluation-metrics",
    icon: "🎯",
    tone: "indigo",
    questions: [
      {
        q: "A fraud model has 99.5% accuracy on data where 0.5% of transactions are fraud. What can you conclude?",
        options: [
          "It catches almost all fraud",
          "Nothing yet — predicting 'not fraud' for everything scores the same",
          "It is well calibrated",
          "Its precision is at least 99%",
        ],
        answer: 1,
        why: "With 0.5% positives, the trivial all-negative classifier is 99.5% accurate. Accuracy says nothing about how much fraud is caught; look at recall, precision and the PR curve.",
      },
      {
        q: "You lower the decision threshold of a classifier. What usually happens?",
        options: [
          "Precision rises and recall falls",
          "Both rise",
          "Recall rises and precision falls",
          "The ROC-AUC changes",
        ],
        answer: 2,
        why: "More cases are flagged, so more real positives are caught (recall up) along with more false alarms (precision down). AUC summarises all thresholds and does not change when you pick one.",
      },
      {
        q: "Why can ROC-AUC look excellent on a problem with 1 positive per 1,000 cases while the flagged list is mostly false alarms?",
        options: [
          "The false-positive rate is divided by the huge number of negatives, so many false alarms still look like a tiny rate",
          "ROC-AUC is computed only on positives",
          "ROC curves ignore the threshold",
          "AUC is only valid for balanced data",
        ],
        answer: 0,
        why: "FPR = FP / all negatives. With 999 negatives per positive, even an FPR of 1% produces about 10 false alarms per real case. Precision exposes that; ROC does not.",
      },
      {
        q: "A three-class model is excellent on two large classes and poor on a small one. Which F1 average makes the problem most visible?",
        options: ["Micro", "Weighted", "Accuracy", "Macro"],
        answer: 3,
        why: "Macro gives each class equal weight, so the small class counts as much as the big ones. Micro equals accuracy for single-label problems, and weighted is dominated by the large classes.",
      },
      {
        q: "You standardise features using the mean and variance of the whole dataset, then run 5-fold cross-validation. What is wrong?",
        options: [
          "Nothing, scaling is harmless",
          "Test-fold statistics leaked into training, so the CV score is optimistic",
          "Standardisation should use the median",
          "Cross-validation needs at least 10 folds",
        ],
        answer: 1,
        why: "Every preprocessing step that learns from data must be fit inside each training fold. A Pipeline does that automatically; fitting on everything first leaks information from the validation folds.",
      },
    ],
  },
  {
    id: "ml-regularization",
    topic: "Regularisation",
    label: "Bias, Variance & Regularisation",
    path: "/ml/regularization",
    icon: "🎚️",
    tone: "purple",
    questions: [
      {
        q: "Training error is 2% and validation error is 25%. Which change is least likely to help?",
        options: [
          "Collecting more training data",
          "A stronger L2 penalty",
          "Adding more polynomial features",
          "Early stopping",
        ],
        answer: 2,
        why: "A large train–validation gap is high variance. More data, stronger regularisation and early stopping all reduce variance; adding features increases capacity and usually widens the gap.",
      },
      {
        q: "Why does lasso produce exactly-zero coefficients when ridge does not?",
        options: [
          "Lasso uses a larger λ by default",
          "The |w| penalty has a corner at zero, so the optimum often sits exactly there",
          "Ridge cannot be solved in closed form",
          "Lasso standardises features and ridge does not",
        ],
        answer: 1,
        why: "The L1 penalty's slope does not vanish near zero, so small coefficients are pushed all the way to zero. The L2 penalty's slope shrinks with w, so coefficients approach zero but never reach it.",
      },
      {
        q: "Two strongly correlated features both predict the target. What does ridge tend to do with them?",
        options: [
          "Keep one and zero the other",
          "Zero both",
          "Give all the weight to the one with larger variance",
          "Spread the weight between them",
        ],
        answer: 3,
        why: "Splitting weight between correlated features lowers Σw² for the same fit, so ridge shares it. Lasso tends to pick one somewhat arbitrarily; elastic net combines both behaviours.",
      },
      {
        q: "You have a budget of 20 trials to tune 5 hyperparameters, only two of which matter much. Why is random search usually better than grid search here?",
        options: [
          "It explores many more distinct values of each important hyperparameter",
          "It is guaranteed to find the global optimum",
          "It needs no validation set",
          "Grid search cannot tune continuous values",
        ],
        answer: 0,
        why: "A grid repeats the same few values of each hyperparameter across combinations. Random draws give a new value of every hyperparameter on every trial, which matters when a few of them dominate.",
      },
    ],
  },
  {
    id: "ml-clustering",
    topic: "Clustering",
    label: "Clustering",
    path: "/ml/clustering",
    icon: "🫧",
    tone: "emerald",
    questions: [
      {
        q: "Why can't you pick k for k-means by choosing the k with the lowest inertia?",
        options: [
          "Inertia is not defined for k > 10",
          "Inertia rises with k",
          "Inertia always falls as k grows, reaching zero when every point is its own cluster",
          "Inertia depends on the random seed only",
        ],
        answer: 2,
        why: "More centroids always sit closer to the points. That is why you look for an elbow, or use a measure like silhouette that penalises clusters that are close together.",
      },
      {
        q: "Your data forms two interlocking crescents plus scattered outliers. Which method fits best?",
        options: ["k-means with k = 2", "DBSCAN or HDBSCAN", "PCA", "Ward-linkage agglomerative clustering"],
        answer: 1,
        why: "Density-based methods follow arbitrary shapes and label sparse points as noise. k-means and Ward linkage both favour compact, roughly spherical groups.",
      },
      {
        q: "You run k-means on customer data with income in dollars and age in years, unscaled. What happens?",
        options: [
          "Nothing — k-means is scale-invariant",
          "Age dominates because it has fewer distinct values",
          "The algorithm fails to converge",
          "Income dominates the distances, so clusters are essentially income bands",
        ],
        answer: 3,
        why: "A difference of 10,000 dollars dwarfs a difference of 30 years in Euclidean distance. Standardise features before any distance-based method.",
      },
      {
        q: "What does a Gaussian mixture model give you that k-means does not?",
        options: [
          "A probability of membership in each cluster, and elliptical cluster shapes",
          "Automatic choice of the number of clusters",
          "Guaranteed global optimum",
          "Robustness to unscaled features",
        ],
        answer: 0,
        why: "GMMs fit a covariance per component and assign soft probabilities. k still has to be chosen (BIC helps), and EM can also land in local optima.",
      },
    ],
  },
  {
    id: "ml-dimensionality",
    topic: "Dimensionality",
    label: "Dimensionality Reduction",
    path: "/ml/dimensionality-reduction",
    icon: "🗜️",
    tone: "purple",
    questions: [
      {
        q: "Why should features usually be standardised before PCA?",
        options: [
          "PCA only accepts values between 0 and 1",
          "Otherwise the feature with the largest units dominates the variance and the first component",
          "It makes the eigenvalues sum to one",
          "Standardisation removes outliers",
        ],
        answer: 1,
        why: "PCA looks for directions of maximum variance. A feature measured in thousands has far more raw variance than one measured in fractions, so without scaling PCA mostly rediscovers the big-unit feature.",
      },
      {
        q: "In a UMAP plot, cluster A looks twice as far from B as from C. What can you conclude?",
        options: [
          "A is twice as similar to C as to B",
          "B is an outlier cluster",
          "UMAP has failed to converge",
          "Very little — between-cluster distances in UMAP and t-SNE are not reliable",
        ],
        answer: 3,
        why: "Both methods preserve local neighbourhoods and distort global geometry. Gaps and cluster sizes are not to scale; check distances in the original or PCA space instead.",
      },
      {
        q: "The first 3 of 50 principal components explain 96% of the variance. What does that suggest?",
        options: [
          "The data lies close to a 3-dimensional linear subspace",
          "The other 47 features are useless and can be deleted",
          "The data has exactly 3 clusters",
          "A neural network is required",
        ],
        answer: 0,
        why: "Components are combinations of all the original features, so it does not mean 47 columns can be dropped — it means most of the variation lives in 3 directions.",
      },
      {
        q: "What does the curse of dimensionality do to nearest-neighbour search on random data?",
        options: [
          "Makes it exact",
          "Makes it faster",
          "The nearest and farthest points become almost equally distant",
          "Has no effect if the data is normalised",
        ],
        answer: 2,
        why: "As dimensions grow, pairwise distances concentrate around the same value, so the contrast that 'nearest' relies on disappears. Real data escapes this only because it lies on lower-dimensional structure.",
      },
    ],
  },
  {
    id: "ml-optimization",
    topic: "Optimisation",
    label: "Gradient Descent & Adam",
    path: "/ml/optimization",
    icon: "⛰️",
    tone: "amber",
    questions: [
      {
        q: "On a long, narrow valley, plain gradient descent zig-zags and makes slow progress. What does momentum change?",
        options: [
          "It averages gradients over time, so the oscillating components cancel and the consistent direction builds speed",
          "It uses second derivatives to jump straight to the minimum",
          "It increases the learning rate each step",
          "It adds random noise to escape the valley",
        ],
        answer: 0,
        why: "Momentum keeps a running sum of gradients. Across the valley the sign flips each step and cancels; along it the sign is steady and accumulates.",
      },
      {
        q: "Training loss becomes NaN a few hundred steps in. What is the most likely first fix?",
        options: [
          "Add more layers",
          "Increase the batch size tenfold",
          "Lower the learning rate, add warmup and clip the gradient norm",
          "Switch from Adam to SGD",
        ],
        answer: 2,
        why: "Exploding updates from a too-large step are the usual cause. Lowering η, warming it up and capping the gradient norm address that directly.",
      },
      {
        q: "Why do transformer training recipes start with a learning-rate warmup?",
        options: [
          "Warmup makes the final model smaller",
          "Early gradients and Adam's variance estimates are unreliable, so large early steps can destabilise training",
          "GPUs run faster at low learning rates",
          "It replaces the need for weight decay",
        ],
        answer: 1,
        why: "At initialisation the network and the optimiser's running statistics are poorly calibrated. Ramping the rate up over the first steps avoids a destructive early update.",
      },
      {
        q: "What distinguishes AdamW from Adam with L2 regularisation?",
        options: [
          "AdamW has no momentum",
          "AdamW only works with SGD",
          "AdamW uses a fixed learning rate",
          "Weight decay is applied directly to the weights instead of being added to the gradient and rescaled",
        ],
        answer: 3,
        why: "With Adam, an L2 term added to the gradient gets divided by the adaptive scale, so heavily-updated weights are barely decayed. Decoupling the decay restores the intended regularisation.",
      },
    ],
  },
  {
    id: "rag-ingestion",
    topic: "RAG",
    label: "Data Ingestion",
    path: "/rag/ingestion",
    icon: "📥",
    tone: "emerald",
    questions: [
      {
        q: "Half the pages loaded from a batch of PDFs have empty page_content. What is the most likely cause?",
        options: [
          "The embedding model rejected them",
          "They are scanned images, and the text-only loader has nothing to extract without OCR",
          "The chunk size is too small",
          "LangChain skips pages over a size limit",
        ],
        answer: 1,
        why: "Text-layer parsers like PyPDF read embedded text. A scanned page has none, so you need an OCR-capable loader (Unstructured hi_res, Docling, Azure Document Intelligence, Textract).",
      },
      {
        q: "Your PDFs are full of pricing tables, and answers about prices are poor. What should you change first?",
        options: [
          "Use a larger embedding model",
          "Increase top-k at retrieval",
          "Switch to a layout-aware parser that keeps tables as tables",
          "Lower the LLM temperature",
        ],
        answer: 2,
        why: "A text-only parser flattens a table into loose words, so the row–column relationship is gone before chunking. No retrieval or model change can restore it.",
      },
      {
        q: "Where should a document's author, ticket ID and access group go?",
        options: [
          "In metadata, so they can filter and cite without being embedded as noise",
          "At the top of page_content, so the embedding captures them",
          "In a separate database only",
          "Nowhere — loaders discard them",
        ],
        answer: 0,
        why: "Metadata travels with every chunk into the vector store, where it can filter searches (including by permission) and support citations. IDs in page_content just add noise to the embedding.",
      },
      {
        q: "You re-run ingestion nightly and the vector store keeps growing with duplicate chunks. What fixes it?",
        options: [
          "Delete the vector store and reload everything each night",
          "Use lazy_load() instead of load()",
          "Lower the chunk overlap",
          "Track what was written with LangChain's indexing API and a record manager, keyed on each document's source",
        ],
        answer: 3,
        why: "The indexing API hashes chunks and records them per source, so unchanged chunks are skipped, changed documents replaced and — in full mode — deleted documents removed.",
      },
    ],
  },
  {
    id: "ml-features",
    topic: "Features",
    label: "Feature Engineering",
    path: "/ml/feature-engineering",
    icon: "🛠️",
    tone: "amber",
    questions: [
      {
        q: "A salary column has one extreme outlier. Which scaler keeps the ordinary values well spread out?",
        options: ["Min–max scaling", "Robust scaling (median and IQR)", "Standard scaling", "No scaling is ever needed"],
        answer: 1,
        why: "Min–max uses the maximum and standardisation uses the mean and σ, all of which one outlier drags. The median and interquartile range barely move.",
      },
      {
        q: "Which model family does not need its numeric features scaled?",
        options: ["k-nearest neighbours", "Logistic regression with an L2 penalty", "Gradient-boosted trees", "Support vector machines"],
        answer: 2,
        why: "Trees split on thresholds of one feature at a time, so any monotone rescaling produces the same splits. Distance- and penalty-based models are all scale-sensitive.",
      },
      {
        q: "You target-encode a zip-code column using the whole training set, including each row's own label. What goes wrong?",
        options: [
          "Rare zip codes leak their own label into the feature, so the model overfits to it",
          "The encoder cannot handle numeric categories",
          "Target encoding only works for regression",
          "Nothing, as long as you use cross-validation afterwards",
        ],
        answer: 0,
        why: "A zip code seen once is encoded as exactly its label. Smooth toward the global mean and compute encodings out-of-fold to prevent it.",
      },
      {
        q: "When should SMOTE be applied in a cross-validated pipeline?",
        options: [
          "Once, to the whole dataset before splitting",
          "Only to the test set",
          "After predicting, to rebalance the outputs",
          "Only to the training portion of each fold",
        ],
        answer: 3,
        why: "Synthetic points built before splitting are interpolated from rows that end up in validation folds, which leaks information and inflates scores.",
      },
    ],
  },
];

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TOPICS = [
  { group: 'Data & Statistics', tone: 'text-teal-400', border: 'hover:border-teal-500/50', items: [
    { t: 'Data Sourcing', d: 'Where data comes from, representation biases, and sampling strategies.', path: '/ml/data-sourcing', icon: '📥' },
    { t: 'Data Cleaning', d: 'Handling missing values, deduplication, imputation, and outlier treatment.', path: '/ml/data-cleaning', icon: '🧹' },
    { t: 'Data Analysis (EDA)', d: 'Measures of central tendency, dispersion, skewness, and kurtosis.', path: '/ml/data-analysis', icon: '🔎' },
    { t: 'Bivariate Analysis', d: 'Pearson/Spearman correlation, crosstabs, scatter plots, and confounders.', path: '/ml/bivariate-analysis', icon: '🔗' },
    { t: 'Inferential Statistics', d: 'Confidence intervals, sampling error, standard error, and population inference.', path: '/ml/inferential-statistics', icon: '📏' },
    { t: 'Central Limit Theorem', d: 'Why sample averages converge to Gaussian distributions regardless of underlying shape.', path: '/ml/central-limit-theorem', icon: '🔔' },
    { t: 'Hypothesis Testing', d: 'Null/Alternative hypotheses, p-values, Type I/II errors, and A/B test design.', path: '/ml/hypothesis-testing', icon: '⚖️' },
  ]},
  { group: 'Foundations & Features', tone: 'text-indigo-400', border: 'hover:border-indigo-500/50', items: [
    { t: 'Supervised Learning', d: 'Mapping inputs to known outputs with ground-truth labels.', path: '/ml/supervised', icon: '🎯' },
    { t: 'Unsupervised Learning', d: 'Extracting patterns, clusters, and low-dimensional manifolds without labels.', path: '/ml/unsupervised', icon: '🧭' },
    { t: 'Feature Engineering', d: 'Scaling, one-hot encoding, interaction terms, target encoding, and embeddings.', path: '/ml/feature-engineering', icon: '⚙️' },
    { t: 'Dimensionality Reduction', d: 'PCA, t-SNE, UMAP, and curse-of-dimensionality mitigation.', path: '/ml/dimensionality-reduction', icon: '📉' },
    { t: 'Regularization', d: 'L1 Lasso (sparsity), L2 Ridge (weight decay), and ElasticNet penalties.', path: '/ml/regularization', icon: '🛡️' },
    { t: 'Optimization & Gradients', d: 'Stochastic Gradient Descent, Momentum, RMSprop, Adam, and learning rate schedules.', path: '/ml/optimization', icon: '⚡' },
    { t: 'Evaluation Metrics', d: 'Precision, Recall, F1, ROC-AUC, PR-AUC, Log-Loss, MSE, RMSE, and R².', path: '/ml/evaluation-metrics', icon: '📊' },
  ]},
  { group: 'Regression', tone: 'text-emerald-400', border: 'hover:border-emerald-500/50', items: [
    { t: 'Linear Regression', d: 'Ordinary Least Squares, closed-form normal equation, and cost surface.', path: '/ml/linear-regression', icon: '📈' },
    { t: 'Multiple Linear Regression', d: 'Multi-feature linear combinations, multicollinearity, and VIF diagnosis.', path: '/ml/multiple-regression', icon: '🧮' },
    { t: 'Time Series Forecasting', d: 'ARIMA, exponential smoothing, seasonality, lag features, and stationarity.', path: '/ml/time-series', icon: '⏱️' },
  ]},
  { group: 'Classification', tone: 'text-blue-400', border: 'hover:border-blue-500/50', items: [
    { t: 'Logistic Regression', d: 'Sigmoid activation, log-odds transformation, and binary cross-entropy loss.', path: '/ml/logistic-regression', icon: '🔀' },
    { t: 'Naive Bayes', d: "Bayes' theorem with conditional independence assumptions across features.", path: '/ml/naive-bayes', icon: '📨' },
    { t: 'Decision Trees', d: 'Recursive binary splitting via Gini impurity, Information Gain, and pruning.', path: '/ml/decision-trees', icon: '🌳' },
    { t: 'k-Nearest Neighbours', d: 'Instance-based lazy learning using Euclidean, Manhattan, and cosine distances.', path: '/ml/knn', icon: '📍' },
    { t: 'Support Vector Machines', d: 'Maximum-margin hyperplanes, support vectors, and non-linear kernel tricks.', path: '/ml/svm', icon: '📐' },
  ]},
  { group: 'Ensembles & Modern Tabular', tone: 'text-amber-400', border: 'hover:border-amber-500/50', items: [
    { t: 'Random Forests', d: 'Bagging (bootstrap aggregation) and random feature subspace projection.', path: '/ml/random-forests', icon: '🌲' },
    { t: 'Gradient Boosting & XGBoost', d: 'Sequential residual fitting, second-order Taylor expansion, and regularization.', path: '/ml/xgboost', icon: '🚀' },
    { t: 'Clustering', d: 'K-Means centroid convergence, Hierarchical agglomeration, and DBSCAN density.', path: '/ml/clustering', icon: '🫧' },
    { t: 'Anomaly Detection', d: 'Isolation Forests, One-Class SVM, Local Outlier Factor, and autoencoders.', path: '/ml/anomaly-detection', icon: '🚨' },
    { t: 'Recommendation Systems', d: 'Collaborative filtering, matrix factorization (SVD), and two-tower embeddings.', path: '/ml/recommenders', icon: '🎁' },
  ]},
  { group: 'Deep Learning & Sequences', tone: 'text-purple-400', border: 'hover:border-purple-500/50', items: [
    { t: 'Deep Learning Foundations', d: 'Multi-layer perceptrons, activation functions (ReLU, GELU), and backprop.', path: '/ml/deep-learning', icon: '🧠' },
    { t: 'CNNs', d: '2D convolutional kernels, feature maps, pooling, and inductive bias for vision.', path: '/ml/cnn', icon: '🖼️' },
    { t: 'RNNs & LSTMs', d: 'Hidden state recurrence, vanishing gradients, forget gates, and cell states.', path: '/ml/rnn', icon: '🔁' },
    { t: 'GANs', d: 'Minimax game between generator and discriminator networks.', path: '/ml/gans', icon: '🎭' },
    { t: 'Graph Neural Networks', d: 'Message passing, node embeddings, and relational graph convolutions.', path: '/ml/graph-neural-networks', icon: '🕸️' },
    { t: 'NLP Foundations', d: 'Tokenization, TF-IDF, N-grams, Word2Vec, GloVe, and sequence modeling.', path: '/ml/nlp', icon: '💬' },
    { t: 'Transformers', d: 'Self-attention, Multi-head projections, QKV cross-attention, and LLM backbones.', path: '/ml/transformers', icon: '⚡' },
    { t: 'Mamba & State Space Models', d: 'Linear-time sequence modeling with selective continuous state spaces.', path: '/ml/mamba', icon: '🐍' },
    { t: 'RWKV Architecture', d: 'Receptance Weighted Key Value — RNN efficiency with Transformer quality.', path: '/ml/rwkv', icon: '🔄' },
    { t: 'Transfer Learning', d: 'Pretraining on web-scale datasets followed by task-specific fine-tuning.', path: '/ml/transfer-learning', icon: '🎓' },
  ]},
  { group: 'Reinforcement Learning & LLM Alignment', tone: 'text-rose-400', border: 'hover:border-rose-500/50', items: [
    { t: 'Reinforcement Learning', d: 'Markov Decision Processes, Q-learning, Policy Gradients, and Actor-Critic.', path: '/ml/reinforcement-learning', icon: '🕹️' },
    { t: 'RLHF', d: 'Reward model training from human pairwise preferences, followed by PPO.', path: '/ml/rlhf', icon: '👍' },
    { t: 'DPO & Direct Alignment', d: 'Implicit reward derivation eliminating the separate RL policy training loop.', path: '/ml/dpo', icon: '⚖️' },
    { t: 'GRPO & RLVR', d: 'Group relative policy optimization with verifiable automated reward functions.', path: '/ml/grpo', icon: '🧮' },
    { t: 'RLAIF & Constitutional AI', d: 'Self-improving alignment steered by structured constitutional principles.', path: '/ml/rlaif', icon: '📜' },
    { t: 'MLOps & Production Systems', d: 'Model registries, feature stores, CI/CD for ML, data drift, and latency monitoring.', path: '/mlops', icon: '🏭' },
  ]},
];

const PARADIGMS = [
  {
    id: 'supervised',
    title: 'Supervised Learning',
    tag: 'Labeled Data (X → Y)',
    color: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500/40',
    icon: '🎯',
    tagline: 'Learning a predictive mapping from known input-output pairs.',
    dataNature: 'Dataset contains both features X and ground-truth target labels y: D = {(x₁, y₁), ..., (xₙ, yₙ)}',
    lossObj: 'min_θ (1/N) ∑ L(f_θ(xᵢ), yᵢ)',
    subtypes: [
      { name: 'Regression', desc: 'Predicting continuous numerical targets (e.g., house price, temperature, stock return)', ex: 'Linear Regression, XGBoost Regressor' },
      { name: 'Classification', desc: 'Predicting discrete categories or probability distributions (e.g., spam vs ham, disease status)', ex: 'Logistic Regression, Random Forest, SVM' }
    ],
    mathNote: 'Loss functions penalize discrepancy between prediction ŷ and true y (e.g., Mean Squared Error for regression, Cross-Entropy for classification).'
  },
  {
    id: 'unsupervised',
    title: 'Unsupervised Learning',
    tag: 'Unlabeled Structure (X only)',
    color: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/40',
    icon: '🧭',
    tagline: 'Discovering hidden geometric structures, clusters, and manifolds without supervision.',
    dataNature: 'Dataset consists strictly of inputs X with zero outcome labels: D = {x₁, ..., xₙ}',
    lossObj: 'max P(X) or min reconstruction_error(X, g(f(X)))',
    subtypes: [
      { name: 'Clustering', desc: 'Grouping similar samples into k clusters based on distance or density metrics', ex: 'K-Means, DBSCAN, Gaussian Mixture Models' },
      { name: 'Dimensionality Reduction', desc: 'Projecting high-dimensional spaces to compact latent spaces while preserving variance or neighborhood relations', ex: 'PCA, t-SNE, UMAP, Autoencoders' }
    ],
    mathNote: 'Objective functions maximize variance explained, minimize intra-cluster inertia, or minimize autoencoder reconstruction loss.'
  },
  {
    id: 'self-supervised',
    title: 'Self-Supervised Learning',
    tag: 'The Engine of Modern LLMs & Gen AI',
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-500/40',
    icon: '⚡',
    tagline: 'Generating pseudo-labels from the data itself to learn web-scale foundation representations.',
    dataNature: 'Raw unlabeled text, images, or audio where one part of the input is hidden to predict another part.',
    lossObj: 'min_θ -∑ log P(x_t | x_<t; θ) [Autoregressive Next-Token Loss]',
    subtypes: [
      { name: 'Autoregressive (Causal)', desc: 'Predicting token xₜ given preceding context x₁...xₜ₋₁ (GPT, Llama, Claude)', ex: 'Next-Token Language Modeling' },
      { name: 'Masked Representation', desc: 'Predicting masked portions of the input given surrounding bidirectional context', ex: 'BERT, RoBERTa, Masked Autoencoders (MAE)' },
      { name: 'Contrastive Learning', desc: 'Pulling together positive pairs (augmented views of same image) while repelling negative pairs', ex: 'CLIP, SimCLR, MoCo' }
    ],
    mathNote: 'Enables training on trillions of raw tokens without human labeling costs, providing the universal weights for modern AI.'
  },
  {
    id: 'reinforcement',
    title: 'Reinforcement Learning',
    tag: 'Agent ↔ Environment (Reward Optimization)',
    color: 'from-rose-600 to-amber-600',
    border: 'border-rose-500/40',
    icon: '🕹️',
    tagline: 'Learning optimal policies through sequential trial-and-error actions and delayed environmental rewards.',
    dataNature: 'Markov Decision Process trajectories: τ = (s₀, a₀, r₀, s₁, a₁, r₁, ...)',
    lossObj: 'max_θ E_τ~π_θ [ ∑_{t=0}^T γᵗ r(s_t, a_t) ]',
    subtypes: [
      { name: 'Value-Based', desc: 'Learning expected cumulative future returns Q(s, a) from any state-action pair', ex: 'DQN, Double DQN, Q-Learning' },
      { name: 'Policy-Based / Actor-Critic', desc: 'Directly optimizing parameterized policy distribution π_θ(a|s) using policy gradient theorem', ex: 'PPO, SAC, A2C' },
      { name: 'RLHF & Alignment', desc: 'Aligning foundation LLMs using human feedback preference reward models and PPO/GRPO', ex: 'InstructGPT, DeepSeek-R1 GRPO' }
    ],
    mathNote: 'Balances the exploration-exploitation dilemma; discounted reward sum guides long-term strategic decision-making.'
  }
];

const METRICS = [
  { name: 'Accuracy', formula: '(TP + TN) / (TP + TN + FP + FN)', when: 'Balanced classification datasets only. Deceptive when classes are imbalanced.' },
  { name: 'Precision', formula: 'TP / (TP + FP)', when: 'Cost of False Positives is extreme (e.g., spam filter, stock trade execution).' },
  { name: 'Recall (Sensitivity)', formula: 'TP / (TP + FN)', when: 'Cost of False Negatives is critical (e.g., cancer diagnosis, fraud detection).' },
  { name: 'F1-Score', formula: '2 · (Precision · Recall) / (Precision + Recall)', when: 'Harmonic mean balancing precision and recall on imbalanced datasets.' },
  { name: 'ROC-AUC', formula: 'Area under True Positive Rate vs False Positive Rate curve', when: 'Evaluating classification ranking performance across all decision thresholds.' },
  { name: 'Mean Squared Error (MSE)', formula: '(1/N) ∑ (yᵢ - ŷᵢ)²', when: 'Regression tasks where large outlier errors must be penalised quadratically.' },
  { name: 'Mean Absolute Error (MAE)', formula: '(1/N) ∑ |yᵢ - ŷᵢ|', when: 'Robust regression where errors are weighted linearly without squaring outliers.' },
  { name: 'R² (Coefficient of Determination)', formula: '1 - (SS_res / SS_tot)', when: 'Proportion of target variance explained by the model compared to baseline mean.' },
];

export default function MlIndex() {
  const [activeParadigm, setActiveParadigm] = useState('supervised');
  const [modelComplexity, setModelComplexity] = useState(2); // 1 = underfit, 2 = sweet spot, 3 = overfit
  const [gdStep, setGdStep] = useState(0);

  const selectedParadigm = PARADIGMS.find(p => p.id === activeParadigm) || PARADIGMS[0];

  const toc = [
    { label: 'What is Machine Learning?', hash: 'what-is-ml' },
    { label: 'The 4 Core Paradigms', hash: 'four-paradigms' },
    { label: 'Mathematical Formulation', hash: 'math-optimization' },
    { label: 'Bias-Variance Tradeoff', hash: 'bias-variance' },
    { label: 'Production ML Workflow', hash: 'ml-workflow' },
    { label: 'Model Evaluation Metrics', hash: 'evaluation-metrics' },
    { label: 'End-to-End Python Pipeline', hash: 'python-blueprint' },
    { label: 'Curriculum & Guides', hash: 'curriculum' },
  ];

  return (
    <GuideLayout
      title="Machine Learning Engineering: The Core Blueprint"
      intro="From statistical learning theory and empirical loss optimization to self-supervised foundation pretraining and reinforcement alignment. Your comprehensive engineering masterguide."
      toc={toc}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">

        {/* SECTION 1: WHAT IS MACHINE LEARNING? */}
        <motion.section variants={itemVariants} id="what-is-ml" className="scroll-mt-24">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#121218] via-[#0d0d12] to-[#07070a] border border-white/10 shadow-2xl overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Foundational Mental Model</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Software 1.0 vs Software 2.0: The Machine Learning Paradigm Shift
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-4xl mb-8">
              In classical computing (Software 1.0), human engineers write explicit procedural rules: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">Rules + Data = Answers</span>. 
              In Machine Learning (Software 2.0), we invert the pipeline: <span className="text-indigo-300 font-mono bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">Data + Answers = Rules (Model Parameters)</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-black/50 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-gray-400">Traditional Software 1.0</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">Manual Rules</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    Input: Telemetry Data (Speed, Braking)
                  </div>
                  <div className="text-center text-gray-500">➕</div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    Explicit Logic: <span className="text-amber-300">if speed &gt; 80 and rain == True: brake()</span>
                  </div>
                  <div className="text-center text-gray-500">⬇️</div>
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
                    Output: Deterministic Answer
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  Fails exponentially when real-world complexity explodes (e.g., self-driving vision, voice recognition, natural language reasoning).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-black/50 to-purple-950/30 border border-indigo-500/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-indigo-300">Machine Learning (Software 2.0)</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Learned Weights θ</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    Input: Raw High-Dimensional Data (Pixels, Audio, Text)
                  </div>
                  <div className="text-center text-gray-500">➕</div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    Known Targets / Objectives: Ground-truth outcomes or Self-Supervision
                  </div>
                  <div className="text-center text-indigo-400">⬇️ (Gradient Descent Optimization)</div>
                  <div className="p-3 rounded-lg bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 font-bold">
                    Output: Optimal Model Weights θ ∈ ℝᵈ (The Program)
                  </div>
                </div>
                <p className="text-xs text-indigo-200/80 mt-4 leading-relaxed">
                  The computer searches through parameter space to synthesize an optimal program that generalizes to unseen edge cases.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: THE 4 PARADIGMS INTERACTIVE EXPLORER */}
        <motion.section variants={itemVariants} id="four-paradigms" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">The 4 Core Paradigms of Machine Learning</h2>
              <p className="text-sm text-gray-400 mt-1">Every machine learning system operates within one of these mathematical frameworks.</p>
            </div>
          </div>

          {/* Paradigm Selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {PARADIGMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveParadigm(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeParadigm === p.id
                    ? 'bg-white/10 border-indigo-400 shadow-lg shadow-indigo-500/20'
                    : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="font-bold text-sm text-white">{p.title}</div>
                <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{p.tag}</div>
              </button>
            ))}
          </div>

          {/* Active Paradigm Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedParadigm.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className={`p-6 md:p-8 rounded-3xl bg-[#111116] border ${selectedParadigm.border} relative shadow-2xl overflow-hidden`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedParadigm.icon}</span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">{selectedParadigm.title}</h3>
                    <p className="text-xs text-indigo-400 font-mono">{selectedParadigm.tagline}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
                  {selectedParadigm.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                  <div>
                    <div className="text-xs font-mono uppercase text-gray-400 mb-1">Dataset Nature & Supervision:</div>
                    <p className="text-sm text-gray-200 font-mono bg-white/5 p-3 rounded-xl border border-white/5">
                      {selectedParadigm.dataNature}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-gray-400 mb-1">Mathematical Objective Formulation:</div>
                    <p className="text-sm text-emerald-400 font-mono bg-black/80 p-3 rounded-xl border border-emerald-500/30">
                      {selectedParadigm.lossObj}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    ℹ️ {selectedParadigm.mathNote}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-mono uppercase text-gray-400">Sub-Categories & Archetypes:</div>
                  {selectedParadigm.subtypes.map((sub, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{sub.name}</span>
                        <span className="text-[11px] font-mono text-indigo-300">{sub.ex}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{sub.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* SECTION 3: MATHEMATICAL FORMULATION & GRADIENT DESCENT */}
        <motion.section variants={itemVariants} id="math-optimization" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              The Engine: Empirical Risk Minimization & Gradient Descent
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              How machines actually "learn": by calculating gradients of an error function with respect to weights and taking descent steps.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-300">
                  <div className="text-indigo-400 font-bold mb-2">// 1. Parameterized Function Hypothesis</div>
                  ŷ = f_θ(x) = W · x + b
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-300">
                  <div className="text-emerald-400 font-bold mb-2">// 2. Loss Function (MSE for Regression)</div>
                  L(θ) = (1 / 2N) ∑ (ŷᵢ - yᵢ)²
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-300">
                  <div className="text-purple-400 font-bold mb-2">// 3. Parameter Update via Gradient Descent</div>
                  θ := θ - η · ∇_θ L(θ)
                  <div className="text-gray-500 mt-1">where η is the learning rate, and ∇ is the vector of partial derivatives</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setGdStep((s) => (s + 1) % 5)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/25"
                  >
                    <span>Step Gradient Descent ({gdStep}/4)</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setGdStep(0)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Gradient Descent Loss Bowl Visualization */}
              <div className="p-6 rounded-2xl bg-black/70 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-xs font-mono uppercase text-gray-400 mb-3 tracking-wider">
                  2D Convex Loss Landscape L(θ)
                </div>
                <svg viewBox="0 0 320 200" className="w-full max-w-[320px] overflow-visible">
                  {/* Parabolic Loss Curve */}
                  <path
                    d="M 20 30 Q 160 210 300 30"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                  />
                  {/* Global Minimum Line */}
                  <line x1="160" y1="120" x2="160" y2="180" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1" />
                  <text x="160" y="195" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace">Optimal θ*</text>

                  {/* Iteration points */}
                  {[
                    { x: 40, y: 48, label: 'θ₀ (Init)' },
                    { x: 75, y: 88, label: 'θ₁' },
                    { x: 115, y: 112, label: 'θ₂' },
                    { x: 142, y: 119, label: 'θ₃' },
                    { x: 160, y: 120, label: 'θ₄ (Min)' },
                  ].map((pt, i) => (
                    <g key={i}>
                      {i <= gdStep && (
                        <>
                          <circle cx={pt.x} cy={pt.y} r={i === gdStep ? "6" : "4"} fill={i === gdStep ? "#ec4899" : "#818cf8"} />
                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill={i === gdStep ? "#ec4899" : "#9ca3af"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            {pt.label}
                          </text>
                        </>
                      )}
                    </g>
                  ))}
                </svg>
                <div className="text-xs text-gray-400 font-mono mt-3 text-center">
                  {gdStep === 0 && "Step 0: Random initialization with high loss."}
                  {gdStep === 1 && "Step 1: Large negative gradient steep slope → takes large stride."}
                  {gdStep === 2 && "Step 2: Slope flattens → step size automatically shrinks."}
                  {gdStep === 3 && "Step 3: Fine-tuning near the global minimum basin."}
                  {gdStep === 4 && "Step 4: Converged at optimal weights θ* where ∇L(θ) ≈ 0."}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 4: THE BIAS-VARIANCE TRADEOFF */}
        <motion.section variants={itemVariants} id="bias-variance" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Generalization & The Bias-Variance Tradeoff</h2>
                <p className="text-sm text-gray-400 mt-1">The fundamental dilemma of machine learning: underfitting vs overfitting.</p>
              </div>

              {/* Complexity Slider Controls */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10">
                {[
                  { level: 1, label: 'Underfit (High Bias)' },
                  { level: 2, label: 'Sweet Spot (Optimal)' },
                  { level: 3, label: 'Overfit (High Variance)' }
                ].map((btn) => (
                  <button
                    key={btn.level}
                    onClick={() => setModelComplexity(btn.level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      modelComplexity === btn.level
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Fit Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="bg-black/70 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                <div className="text-xs font-mono uppercase text-gray-400 mb-2">Model Decision Surface vs Real Data</div>
                <svg viewBox="0 0 300 180" className="w-full max-w-[320px]">
                  {/* Training Data points */}
                  {[
                    [30, 140], [60, 110], [90, 80], [120, 100], [150, 60],
                    [180, 75], [210, 45], [240, 50], [270, 25]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#60a5fa" />
                  ))}

                  {/* Underfit Line (Degree 1) */}
                  {modelComplexity === 1 && (
                    <line x1="20" y1="130" x2="280" y2="50" stroke="#f43f5e" strokeWidth="3" />
                  )}

                  {/* Optimal Curve (Degree 2-3) */}
                  {modelComplexity === 2 && (
                    <path d="M 20 150 Q 120 70 280 25" fill="none" stroke="#10b981" strokeWidth="3" />
                  )}

                  {/* Overfit Crazy Polynomial */}
                  {modelComplexity === 3 && (
                    <path
                      d="M 20 160 C 40 100, 55 120, 60 110 C 70 95, 80 70, 90 80 C 105 90, 110 115, 120 100 C 135 85, 140 50, 150 60 C 165 70, 175 85, 180 75 C 195 65, 200 35, 210 45 C 225 55, 235 60, 240 50 C 255 40, 260 10, 270 25"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                  )}
                </svg>
                <div className="text-xs font-mono mt-3 text-center">
                  {modelComplexity === 1 && <span className="text-rose-400 font-bold">Underfitting: Model hypothesis space is too weak to capture signal (high training error, high test error).</span>}
                  {modelComplexity === 2 && <span className="text-emerald-400 font-bold">Optimal Generalization: Model captures the true underlying physical manifold while ignoring stochastic noise.</span>}
                  {modelComplexity === 3 && <span className="text-amber-400 font-bold">Overfitting: Model memorized individual noise points (zero training error, catastrophic test error).</span>}
                </div>
              </div>

              {/* Theoretical Decomposition */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <div className="text-xs font-mono text-gray-400 uppercase mb-1">Expected Test Error Equation:</div>
                  <div className="text-sm font-mono text-purple-300 font-bold">
                    E[(y - f̂(x))²] = Bias[f̂(x)]² + Var[f̂(x)] + σ²_noise
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <strong className="text-white block mb-1">Combat Underfitting:</strong>
                    <ul className="text-gray-400 space-y-1 list-disc list-inside">
                      <li>Increase model capacity (depth, width)</li>
                      <li>Add polynomial/interaction features</li>
                      <li>Decrease regularization penalty λ</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <strong className="text-white block mb-1">Combat Overfitting:</strong>
                    <ul className="text-gray-400 space-y-1 list-disc list-inside">
                      <li>Collect more training samples</li>
                      <li>L1/L2 Regularization (weight decay)</li>
                      <li>Dropout &amp; Early Stopping</li>
                      <li>Tree pruning &amp; max depth limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5: THE PRODUCTION MACHINE LEARNING WORKFLOW */}
        <motion.section variants={itemVariants} id="ml-workflow" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">The End-to-End Production ML Workflow</h2>
            <p className="text-sm text-gray-400 mt-1">Real-world AI engineering is 80% data architecture, pipelines, and validation rigor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Data Collection & Audit',
                desc: 'Ingest raw sources, verify schema drift, audit selection bias, and check class imbalances.',
                link: '/ml/data-sourcing',
                color: 'border-teal-500/30'
              },
              {
                step: '02',
                title: 'Data Cleaning & Preprocessing',
                desc: 'Deterministic imputation, outlier clipping, deduplication, and datetime parsing.',
                link: '/ml/data-cleaning',
                color: 'border-cyan-500/30'
              },
              {
                step: '03',
                title: 'Feature Engineering',
                desc: 'StandardScaler, Quantile transformations, Target Encoding, and dimensionality reduction.',
                link: '/ml/feature-engineering',
                color: 'border-indigo-500/30'
              },
              {
                step: '04',
                title: 'Leakage-Free Splitting',
                desc: 'Train / Validation / Test temporal or stratified splitting BEFORE fitting any scaler or imputer.',
                link: '/ml/supervised',
                color: 'border-blue-500/30'
              },
              {
                step: '05',
                title: 'Model Selection & Baseline',
                desc: 'Establish a heuristic baseline, then evaluate linear models, boosted trees, and neural networks.',
                link: '/ml/xgboost',
                color: 'border-purple-500/30'
              },
              {
                step: '06',
                title: 'Hyperparameter Tuning',
                desc: 'Bayesian optimization (Optuna), Stratified K-Fold cross-validation, and early stopping.',
                link: '/ml/optimization',
                color: 'border-pink-500/30'
              },
              {
                step: '07',
                title: 'Rigorous Offline Evaluation',
                desc: 'PR-AUC, Confusion Matrix, calibration curves, and subgroup fairness slices.',
                link: '/ml/evaluation-metrics',
                color: 'border-rose-500/30'
              },
              {
                step: '08',
                title: 'Serving & Drift Monitoring',
                desc: 'ONNX runtime packaging, latency SLA checks, feature drift (Evidently AI), and retraining triggers.',
                link: '/mlops',
                color: 'border-emerald-500/30'
              },
            ].map((st) => (
              <div key={st.step} className={`p-5 rounded-2xl bg-[#111116] border ${st.color} flex flex-col justify-between hover:border-white/30 transition-all`}>
                <div>
                  <div className="font-mono text-xs font-bold text-gray-500 mb-2">STAGE {st.step}</div>
                  <h3 className="font-bold text-white text-base mb-2">{st.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{st.desc}</p>
                </div>
                <Link to={st.link} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  Explore Guide <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: MODEL EVALUATION METRICS MATRIX */}
        <motion.section variants={itemVariants} id="evaluation-metrics" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Model Evaluation Metrics Matrix</h2>
            <p className="text-sm text-gray-400 mb-6">Choosing the wrong metric means optimizing for the wrong objective. Reference guide:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 bg-white/5">
                    <th className="p-3">Metric</th>
                    <th className="p-3">Formula / Definition</th>
                    <th className="p-3">When to Prioritize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {METRICS.map((m, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-indigo-300 whitespace-nowrap">{m.name}</td>
                      <td className="p-3 text-emerald-400">{m.formula}</td>
                      <td className="p-3 text-gray-300 font-sans">{m.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* SECTION 7: END-TO-END PYTHON CODE BLUEPRINT */}
        <motion.section variants={itemVariants} id="python-blueprint" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0e0e13] border border-white/10 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Production Scikit-Learn Pipeline Blueprint</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">Leakage-proof ColumnTransformer + Cross-Validation Pipeline</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Python 3.11+ / Scikit-Learn
              </span>
            </div>

            <div className="bg-black/80 rounded-2xl p-5 border border-white/10 overflow-x-auto font-mono text-xs text-gray-300 leading-relaxed">
              <pre>{`import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

# 1. Load Dataset
df = pd.read_csv("telecom_churn.csv")
X = df.drop(columns=["churn_label", "customer_id"])
y = df["churn_label"]

# 2. Strict Train / Test Split BEFORE any preprocessing to avoid Data Leakage
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# 3. Define Preprocessing Pipeline per column type
num_features = ["monthly_charges", "total_usage", "tenure_months"]
cat_features = ["contract_type", "payment_method", "tech_support"]

num_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

cat_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
])

preprocessor = ColumnTransformer(transformers=[
    ("num", num_transformer, num_features),
    ("cat", cat_transformer, cat_features)
])

# 4. Assemble Full Classifier Pipeline
model_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", HistGradientBoostingClassifier(random_state=42, max_iter=200))
])

# 5. Stratified 5-Fold Cross Validation on Training Set Only
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model_pipeline, X_train, y_train, cv=cv, scoring="roc_auc")
print(f"5-Fold CV ROC-AUC: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

# 6. Fit Final Model and Score on Unseen Held-out Test Set
model_pipeline.fit(X_train, y_train)
y_probs = model_pipeline.predict_proba(X_test)[:, 1]
print(f"Test Set ROC-AUC: {roc_auc_score(y_test, y_probs):.4f}")`}</pre>
            </div>
          </div>
        </motion.section>

        {/* SECTION 8: FULL CURRICULUM DIRECTORY */}
        <motion.section variants={itemVariants} id="curriculum" className="scroll-mt-24">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Full Machine Learning Curriculum &amp; Topic Guides</h2>
            <p className="text-sm text-gray-400 mt-1">Explore individual algorithms, mathematical proofs, and interactive visual explainers.</p>
          </div>

          <div className="space-y-8">
            {TOPICS.map((group) => (
              <div key={group.group}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${group.tone}`}>{group.group}</h3>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((it) => (
                    <motion.div key={it.path} whileHover={{ y: -3 }}>
                      <Link
                        to={it.path}
                        className={`group block h-full p-4 rounded-xl border border-white/10 bg-white/5 ${group.border} hover:bg-white/[0.08] transition-colors`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="text-xl">{it.icon}</span>
                          <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">{it.t}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed m-0">{it.d}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </motion.div>
    </GuideLayout>
  );
}

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

const LIFECYCLE_STAGES = [
  {
    step: '01',
    title: 'Problem Framing & Scoping',
    subtitle: 'Define the objective before writing a line of code',
    icon: '🎯',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
    simpleExplain: 'Decide what you want to predict and whether machine learning is even the right solution. If a 10-line SQL rule or simple formula solves it reliably, do not build a complex model.',
    keyQuestion: 'What business KPI are we trying to lift? Is this a classification, regression, or ranking task?',
    input: 'Business requirements & historical domain expertise',
    output: 'Clear measurable target metric (e.g., reduce false churn alerts by 15%)',
    pitfall: 'Building a complex neural network when a simple rule or logistic regression is faster and more interpretable.'
  },
  {
    step: '02',
    title: 'Data Collection & Ingestion',
    subtitle: 'Sourcing the fuel for learning',
    icon: '📥',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-400',
    simpleExplain: 'Gather raw data from databases, logs, external APIs, or sensors. Good data beats clever algorithms every time: "Garbage In, Garbage Out".',
    keyQuestion: 'Is the data representative of real production users, or is it heavily skewed?',
    input: 'Raw event streams, relational DB tables, CSV dumps, API webhooks',
    output: 'Raw unified dataset stored in a data lake or warehouse',
    pitfall: 'Selection bias — collecting data only from active, happy users while trying to predict user cancellations.'
  },
  {
    step: '03',
    title: 'Data Cleaning & Preprocessing',
    subtitle: 'Fixing missing values, noise, and outliers',
    icon: '🧹',
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400',
    simpleExplain: 'Real-world data is messy: sensors break, users leave fields blank, and typos abound. Here we impute missing values, remove duplicates, and normalize scales.',
    keyQuestion: 'Are missing values random, or does the absence of data itself carry a hidden signal?',
    input: 'Messy raw tables with NaNs, inconsistent text, and extreme outliers',
    output: 'Clean, sanitized tabular arrays or tokenized text collections',
    pitfall: 'Data leakage: imputing missing values or scaling features using the whole dataset before splitting into train/test.'
  },
  {
    step: '04',
    title: 'Feature Engineering & Selection',
    subtitle: 'Translating raw columns into predictive signals',
    icon: '⚙️',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    simpleExplain: 'Models cannot read raw timestamps or text directly. We convert dates into "day_of_week" or "is_holiday", transform text into embeddings, and create interaction ratios.',
    keyQuestion: 'What domain-specific features expose the causal pattern to the algorithm?',
    input: 'Clean features (e.g., timestamp, price, city, user_clicks)',
    output: 'High-signal numeric feature matrix ready for matrix multiplication',
    pitfall: 'The "Curse of Dimensionality" — adding hundreds of noisy features that drown out the true predictive signal.'
  },
  {
    step: '05',
    title: 'Model Training & Baseline',
    subtitle: 'Teaching the algorithm by minimizing loss',
    icon: '🧠',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400',
    simpleExplain: 'First, establish a dead-simple baseline (like always predicting the average). Then train candidate models (Decision Trees, XGBoost, Neural Nets) and adjust parameters via gradient descent.',
    keyQuestion: 'Does our sophisticated model significantly beat a dumb baseline or simple logistic regression?',
    input: 'Training feature set X_train with known labels y_train',
    output: 'Fitted model parameters (weights θ) that minimize training error',
    pitfall: 'Skipping simple baselines and jumping directly to a massive deep learning architecture that takes days to train.'
  },
  {
    step: '06',
    title: 'Offline Evaluation & Validation',
    subtitle: 'Checking if the model truly generalizes to unseen cases',
    icon: '📊',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-400',
    simpleExplain: 'Never test a model on data it has already seen! Evaluate on a hold-out test set using metrics that match the business cost of mistakes (e.g., False Positives vs False Negatives).',
    keyQuestion: 'Did the model learn real patterns, or did it just memorize the training data (overfitting)?',
    input: 'Held-out test set X_test and ground-truth y_test',
    output: 'Validation scorecard: Precision, Recall, F1, ROC-AUC, Confusion Matrix',
    pitfall: 'Optimizing only for raw accuracy on imbalanced data (e.g. 99% accuracy on a fraud detector that predicts no fraud ever).'
  },
  {
    step: '07',
    title: 'Deployment & Model Serving',
    subtitle: 'Putting the intelligence into customer hands',
    icon: '🚀',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    simpleExplain: 'Package the model into an API service, microservice, or on-device runtime so applications can send inputs and receive predictions in real-time or offline batches.',
    keyQuestion: 'What is our latency budget? Do we need real-time streaming (<20ms) or nightly batch scoring?',
    input: 'Serialized model artifacts (.onnx, .pkl, weights) and inference pipeline',
    output: 'Live HTTPS REST / gRPC endpoint or embedded mobile binary',
    pitfall: 'Training-serving skew: where inference data transformations differ slightly from training preprocessing.'
  },
  {
    step: '08',
    title: 'Drift Monitoring & Retraining',
    subtitle: 'Keeping the model healthy as the real world changes',
    icon: '📡',
    color: 'from-red-500/20 to-rose-500/20 border-red-500/40 text-red-400',
    simpleExplain: 'Models decay over time because human behaviors, economic conditions, and trends shift. We monitor incoming data distributions and automatically trigger retraining when accuracy dips.',
    keyQuestion: 'Has our input data changed (Data Drift) or has the underlying relationship changed (Concept Drift)?',
    input: 'Production telemetry logs, user feedback, and prediction distributions',
    output: 'Automated drift alerts, model health dashboards, and retraining triggers',
    pitfall: 'Silent failure: the model continues returning predictions with 200 OK HTTP codes while its predictions are completely outdated.'
  }
];

const REAL_APPLICATIONS = [
  {
    category: 'Healthcare & Medicine',
    icon: '🏥',
    color: 'border-red-500/30 bg-red-950/10',
    examples: [
      { title: 'Medical Imaging', desc: 'Detecting tumors and fractures in X-rays and MRI scans faster and with comparable accuracy to expert radiologists.' },
      { title: 'Drug Discovery', desc: 'Predicting molecular binding affinities to discover new life-saving pharmaceutical compounds in days instead of years (e.g. AlphaFold).' },
      { title: 'Patient Risk Stratification', desc: 'Predicting which ICU patients are at high risk of sepsis or cardiac arrest hours before symptoms appear.' }
    ]
  },
  {
    category: 'Finance & Banking',
    icon: '💳',
    color: 'border-emerald-500/30 bg-emerald-950/10',
    examples: [
      { title: 'Real-Time Fraud Detection', desc: 'Evaluating billions of card swipes in under 50 milliseconds using anomaly detection to stop stolen cards.' },
      { title: 'Credit Risk Scoring', desc: 'Assessing default probability using historical repayment data to automate loan approvals fairly.' },
      { title: 'Algorithmic Trading', desc: 'Processing millisecond market order books and sentiment signals to balance liquidity and hedge risks.' }
    ]
  },
  {
    category: 'Autonomous Systems & Mobility',
    icon: '🚗',
    color: 'border-indigo-500/30 bg-indigo-950/10',
    examples: [
      { title: 'Self-Driving Vehicles', desc: 'Combining computer vision, LiDAR, and reinforcement learning to navigate lanes, pedestrians, and traffic signals.' },
      { title: 'Warehouse Robotics', desc: 'Reinforcement learning policies guiding autonomous robots to pick, pack, and sort goods inside fulfillment centers.' },
      { title: 'Smart Grid & Traffic Management', desc: 'Optimizing traffic light timing and predicting electrical grid load to prevent blackouts.' }
    ]
  },
  {
    category: 'E-Commerce & Digital Media',
    icon: '🛍️',
    color: 'border-amber-500/30 bg-amber-950/10',
    examples: [
      { title: 'Personalized Recommendations', desc: 'Two-tower embeddings and collaborative filtering powering Netflix film suggestions and Spotify playlists.' },
      { title: 'Dynamic Pricing', desc: 'Adjusting airline and rideshare prices based on real-time supply, demand, weather, and historical patterns.' },
      { title: 'Visual Search', desc: 'Letting shoppers snap a photo of a coat in public to find exact or similar items in online stores.' }
    ]
  },
  {
    category: 'Natural Language & Everyday AI',
    icon: '💬',
    color: 'border-purple-500/30 bg-purple-950/10',
    examples: [
      { title: 'Foundation LLMs & Assistants', desc: 'Transformer architectures generating coherent prose, answering questions, and writing software (ChatGPT, Claude).' },
      { title: 'Real-Time Speech Translation', desc: 'Translating spoken voice across languages with preserved vocal inflection and low latency.' },
      { title: 'Spam & Abuse Filtering', desc: 'Classifying phishing emails, toxic comments, and synthetic bot swarms before users ever see them.' }
    ]
  }
];

const LIMITATIONS = [
  {
    title: 'Data Hunger & "Garbage In, Garbage Out"',
    icon: '🗑️',
    badge: 'Data Dependency',
    color: 'text-amber-400 border-amber-500/30',
    desc: 'A machine learning model cannot magically extract intelligence from poor data. If your training data is incomplete, outdated, or filled with human errors, the model will faithfully learn and multiply those mistakes.',
    example: 'A chatbot trained on toxic internet forums quickly begins repeating toxic and defamatory insults.'
  },
  {
    title: 'The "Black Box" Problem (Explainability)',
    icon: '📦',
    badge: 'Interpretability',
    color: 'text-rose-400 border-rose-500/30',
    desc: 'Deep neural networks and ensemble models contain millions or billions of parameters. While they produce highly accurate outputs, human engineers often cannot explain exactly *why* a particular loan was denied or a diagnosis was suggested.',
    example: 'A hospital cannot deploy a cancer predictor if doctors cannot verify the clinical reasoning behind a high-risk score.'
  },
  {
    title: 'Historical Bias & Algorithmic Unfairness',
    icon: '⚖️',
    badge: 'Ethics & Fairness',
    color: 'text-red-400 border-red-500/30',
    desc: 'Machine learning models learn from the past. If historical hiring decisions, policing records, or medical trials favored certain demographics, the algorithm learns that bias as a "valid pattern" and perpetuates systemic inequality.',
    example: 'An automated resume screening model penalizes female candidates because past tech executive hires were 90% male.'
  },
  {
    title: 'Fragility & Vulnerability to Edge Cases',
    icon: '💥',
    badge: 'Brittleness',
    color: 'text-purple-400 border-purple-500/30',
    desc: 'Unlike human common sense, machine learning models lack genuine real-world understanding. Tiny perturbations invisible to the human eye (adversarial noise) or novel lighting conditions can cause a vision model to hallucinate wildly.',
    example: 'A self-driving car mistaking an overturned white delivery truck for an empty horizon under direct morning glare.'
  },
  {
    title: 'Data Drift & Concept Drift',
    icon: '⏳',
    badge: 'Temporal Decay',
    color: 'text-cyan-400 border-cyan-500/40',
    desc: 'Software 1.0 code runs identically for decades. But ML models quietly rot over time because the real world changes. Consumer behavior, financial laws, vocabulary, and medical viruses all evolve, rendering static models obsolete.',
    example: 'E-commerce demand forecasting models broke completely during COVID-19 because consumer shopping habits changed overnight.'
  },
  {
    title: 'Correlation is NOT Causation',
    icon: '🔗',
    badge: 'Causal Blindness',
    color: 'text-blue-400 border-blue-500/30',
    desc: 'ML models identify statistical correlations, not causal mechanisms. Just because two variables correlate in the data does not mean changing one causes the other. Intervening based on raw correlations can lead to catastrophic business errors.',
    example: 'Ice cream consumption strongly correlates with shark attacks (both peak in summer), but banning ice cream will not protect swimmers.'
  }
];

export default function MlIndex() {
  const [activeParadigm, setActiveParadigm] = useState('supervised');
  const [activeSupervisedType, setActiveSupervisedType] = useState('classification'); // 'classification' or 'regression'
  const [activeLifecycleIndex, setActiveLifecycleIndex] = useState(0);
  const [gdStep, setGdStep] = useState(0);
  const [rlStep, setRlStep] = useState(0);
  const [programmingMode, setProgrammingMode] = useState('traditional'); // 'traditional' or 'ml'

  const activeStage = LIFECYCLE_STAGES[activeLifecycleIndex];

  const toc = [
    { label: 'Introduction to Machine Learning', hash: 'what-is-ml' },
    { label: 'Traditional vs ML Mindset', hash: 'traditional-vs-ml' },
    { label: 'Types of ML (Core Paradigms)', hash: 'types-of-ml' },
    { label: 'The ML Workflow & Lifecycle', hash: 'ml-lifecycle' },
    { label: 'Real-World Applications', hash: 'applications' },
    { label: 'Limitations & Pitfalls', hash: 'limitations' },
    { label: 'Full 37-Topic Learning Roadmap', hash: 'curriculum' },
  ];

  return (
    <GuideLayout
      title="Introduction to Machine Learning"
      intro="Understand the core fundamentals: how machines learn from data, the three core paradigms (supervised, unsupervised, and reinforcement learning), the end-to-end production lifecycle, and real-world applications & limitations."
      toc={toc}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">

        {/* SECTION 1: WHAT IS MACHINE LEARNING? (UNDERSTAND THE FUNDAMENTALS) */}
        <motion.section variants={itemVariants} id="what-is-ml" className="scroll-mt-24">
          <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#12121c] via-[#0d0d14] to-[#07070a] border border-indigo-500/30 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Chapter 1: The Core Fundamentals</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              What is Machine Learning?
            </h2>
            
            <div className="prose prose-invert max-w-none text-gray-300 text-base md:text-lg leading-relaxed mb-8 space-y-4">
              <p>
                At its simplest, <strong className="text-white font-semibold">Machine Learning (ML)</strong> is the science of teaching computers how to perform tasks <span className="text-indigo-300 font-semibold underline decoration-indigo-500/50">without explicitly programming them</span> for every single possibility.
              </p>
              <p className="text-gray-400 text-sm md:text-base">
                Instead of a software engineer sitting down and writing millions of nested <code className="text-pink-300 bg-pink-950/40 px-1.5 py-0.5 rounded">if / else</code> rules to recognize a cat, spot a fraudulent credit card transaction, or translate a sentence, we feed the machine <strong className="text-white">thousands or millions of examples (data)</strong>. The computer automatically identifies the subtle mathematical patterns, builds an internal model, and improves its accuracy through experience.
              </p>
            </div>

            {/* The 3 Pillars of ML */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-white text-base mb-1">1. The Data (Experience)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The fuel of learning. Whether images, historical stock prices, customer logs, or text passages, data provides the real-world evidence of cause and effect.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-bold text-white text-base mb-1">2. The Model (Hypothesis)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A mathematical function with millions of tunable knobs called <strong className="text-indigo-300 font-mono">weights (θ)</strong>. It takes inputs and calculates an estimated prediction.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-white text-base mb-1">3. The Loss & Optimizer (Learning)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The error gauge. When the model makes a mistake, the <strong className="text-emerald-300">Loss Function</strong> measures how bad the error is, and the <strong className="text-emerald-300">Optimizer (Gradient Descent)</strong> nudges the weights to do better next time.
                </p>
              </div>
            </div>

            {/* Arthur Samuel / Tom Mitchell quote box */}
            <div className="mt-8 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs md:text-sm text-indigo-200/90 leading-relaxed flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong className="text-white block mb-0.5">The Formal Definition (Tom Mitchell, 1997):</strong>
                <em>"A computer program is said to <strong>learn</strong> from experience <strong>E</strong> with respect to some class of tasks <strong>T</strong> and performance measure <strong>P</strong>, if its performance at tasks in <strong>T</strong>, as measured by <strong>P</strong>, improves with experience <strong>E</strong>."</em>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: TRADITIONAL PROGRAMMING VS MACHINE LEARNING */}
        <motion.section variants={itemVariants} id="traditional-vs-ml" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#101016] border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Traditional Programming vs Machine Learning
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  How the fundamental paradigm shifts from writing code to discovering code through data.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10">
                <button
                  onClick={() => setProgrammingMode('traditional')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    programmingMode === 'traditional'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Traditional (Software 1.0)
                </button>
                <button
                  onClick={() => setProgrammingMode('ml')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    programmingMode === 'ml'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Machine Learning (Software 2.0)
                </button>
              </div>
            </div>

            {/* Interactive Visual Comparison Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Box */}
              <div className={`p-6 rounded-2xl border transition-all ${
                programmingMode === 'traditional'
                  ? 'bg-gradient-to-br from-red-950/20 to-black/60 border-red-500/50 shadow-lg shadow-red-500/10'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    <h3 className="font-bold text-white text-base">Traditional Programming</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">Rules + Data = Answers</span>
                </div>

                <div className="space-y-3 font-mono text-xs mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                    <span className="text-gray-500">1. INPUT:</span> Telemetry Data (e.g. Speed: 95 km/h, Rain: Yes)
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-amber-300">
                    <span className="text-gray-500">2. HUMAN RULES:</span> if speed &gt; 80 and rain == True: brake()
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
                    <span className="text-gray-500">3. OUTPUT:</span> Decision: Apply Brakes
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">Strength:</strong> 100% deterministic, transparent, and perfect for accounting, payroll, or predictable logic.<br />
                  <strong className="text-red-400">Limitation:</strong> Completely fails when rules cannot be codified by hand (e.g. detecting a pedestrian in rainy night glare, understanding sarcasm, or recognizing human voices).
                </p>
              </div>

              {/* Machine Learning Box */}
              <div className={`p-6 rounded-2xl border transition-all ${
                programmingMode === 'ml'
                  ? 'bg-gradient-to-br from-indigo-950/30 via-[#11111e] to-purple-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h3 className="font-bold text-white text-base">Machine Learning</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Data + Answers = Rules</span>
                </div>

                <div className="space-y-3 font-mono text-xs mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                    <span className="text-gray-500">1. INPUT:</span> 100,000 Driving Camera Videos &amp; Sensor Logs
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-purple-300">
                    <span className="text-gray-500">2. GROUND TRUTH:</span> Human Driver Steering &amp; Braking Actions
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 font-bold">
                    <span className="text-gray-500">3. LEARNED OUTPUT:</span> Trained Weights θ (The Model / Program)
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">Strength:</strong> Automatically finds complex, non-linear relationships in high-dimensional data (pixels, audio, embeddings).<br />
                  <strong className="text-indigo-400">Generalization:</strong> When shown a brand new street it has never seen, the learned model accurately predicts when to brake.
                </p>
              </div>
            </div>

            {/* Interactive Gradient Descent Stepper: How the Machine Adjusts its Parameters */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>⚡ How Does the Machine Actually "Learn"?</span>
                    <span className="text-xs font-mono font-normal text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Gradient Descent in Action</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click the button below to watch the model step-by-step roll down the error bowl to reach the optimal parameter weights.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGdStep((s) => (s + 1) % 5)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/25"
                  >
                    <span>Take Descent Step ({gdStep}/4)</span>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 block mb-1">// Mathematical Update Formula:</span>
                    <div className="text-indigo-300 font-bold">θ_new = θ_old - (Learning_Rate · Error_Gradient)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                    {gdStep === 0 && <span className="text-pink-400">Step 0 (Random Guess): Error is massive! The model has no idea what it is doing.</span>}
                    {gdStep === 1 && <span className="text-amber-400">Step 1 (First Adjustment): Steep slope detected! Takes a large corrective leap down.</span>}
                    {gdStep === 2 && <span className="text-yellow-300">Step 2 (Halfway): Error is shrinking fast. The slope is flattening out.</span>}
                    {gdStep === 3 && <span className="text-teal-300">Step 3 (Fine-tuning): Approaching the bottom of the error basin. Smaller steps.</span>}
                    {gdStep === 4 && <span className="text-emerald-400 font-bold">Step 4 (Converged): Reached the minimum possible error (Optimal Weights θ*). Training complete!</span>}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <svg viewBox="0 0 320 180" className="w-full max-w-[320px] overflow-visible">
                    {/* Parabolic Loss Curve */}
                    <path d="M 20 25 Q 160 200 300 25" fill="none" stroke="#6366f1" strokeWidth="3" />
                    {/* Optimal Minimum Line */}
                    <line x1="160" y1="112" x2="160" y2="165" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1" />
                    <text x="160" y="177" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace">Minimum Error θ*</text>

                    {/* Step Points */}
                    {[
                      { x: 35, y: 40, label: 'θ₀ (Bad)' },
                      { x: 75, y: 82, label: 'θ₁' },
                      { x: 115, y: 105, label: 'θ₂' },
                      { x: 142, y: 111, label: 'θ₃' },
                      { x: 160, y: 112, label: 'θ₄ (Best)' },
                    ].map((pt, i) => (
                      <g key={i}>
                        {i <= gdStep && (
                          <>
                            <circle cx={pt.x} cy={pt.y} r={i === gdStep ? "7" : "4"} fill={i === gdStep ? "#ec4899" : "#818cf8"} />
                            <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill={i === gdStep ? "#ec4899" : "#9ca3af"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                              {pt.label}
                            </text>
                          </>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 3: TYPES OF MACHINE LEARNING (SUPERVISED, UNSUPERVISED, REINFORCEMENT) */}
        <motion.section variants={itemVariants} id="types-of-ml" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <span>Core Paradigms</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white">
                Types of Machine Learning
              </h2>
              <p className="text-sm text-gray-400 mt-1 max-w-3xl">
                Every machine learning system in the world falls into one of three primary learning paradigms, defined by how much guidance (supervision) the machine receives.
              </p>
            </div>
          </div>

          {/* 3 Major Paradigm Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => setActiveParadigm('supervised')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeParadigm === 'supervised'
                  ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-blue-400 shadow-xl shadow-blue-500/20'
                  : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🎯</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Labeled Data</span>
              </div>
              <div className="font-extrabold text-base text-white">1. Supervised Learning</div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Learning with a teacher. The dataset provides inputs paired with the correct ground-truth answers.
              </p>
            </button>

            <button
              onClick={() => setActiveParadigm('unsupervised')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeParadigm === 'unsupervised'
                  ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border-emerald-400 shadow-xl shadow-emerald-500/20'
                  : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🧭</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Unlabeled Data</span>
              </div>
              <div className="font-extrabold text-base text-white">2. Unsupervised Learning</div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Finding hidden structure without a teacher. The machine groups similar data points and uncovers patterns on its own.
              </p>
            </button>

            <button
              onClick={() => setActiveParadigm('reinforcement')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeParadigm === 'reinforcement'
                  ? 'bg-gradient-to-br from-rose-900/40 to-amber-900/30 border-rose-400 shadow-xl shadow-rose-500/20'
                  : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🕹️</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Rewards &amp; Penalties</span>
              </div>
              <div className="font-extrabold text-base text-white">3. Reinforcement Learning</div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Learning by trial and error. An agent interacts with an environment, getting rewarded for good actions and penalized for mistakes.
              </p>
            </button>
          </div>

          {/* PARADIGM 1: SUPERVISED LEARNING DEEP DIVE */}
          {activeParadigm === 'supervised' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-3xl bg-[#111118] border border-blue-500/40 shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>🎯 Supervised Learning: Learning with a Teacher</span>
                  </h3>
                  <p className="text-xs text-blue-300 font-mono mt-1">Given inputs X and known answers Y, learn a mapping function f(X) ≈ Y</p>
                </div>
                <div className="flex gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
                  <button
                    onClick={() => setActiveSupervisedType('classification')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSupervisedType === 'classification'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Classification (Categories)
                  </button>
                  <button
                    onClick={() => setActiveSupervisedType('regression')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSupervisedType === 'regression'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Regression (Numbers)
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                In supervised learning, every row in your dataset includes both the <strong>features (inputs)</strong> and the <strong>target label (the correct answer)</strong>. 
                The model compares its guess to the true label, calculates its mistake, and improves.
              </p>

              {/* Sub-Type Visual Demo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                {activeSupervisedType === 'classification' ? (
                  <>
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Task Type: Classification
                      </div>
                      <h4 className="text-lg font-bold text-white">Predicting Discrete Categories</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        The target is a class or label. The model draws a <strong className="text-blue-300">Decision Boundary</strong> that separates one category from another.
                      </p>
                      <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                        <li><strong>Spam Filter:</strong> Predict if email is <span className="text-red-400">Spam</span> or <span className="text-emerald-400">Not Spam</span>.</li>
                        <li><strong>Healthcare:</strong> Predict if tumor is <span className="text-red-400">Malignant</span> or <span className="text-emerald-400">Benign</span>.</li>
                        <li><strong>Vision:</strong> Classify image as <span className="text-blue-400">Cat</span>, <span className="text-amber-400">Dog</span>, or <span className="text-purple-400">Bird</span>.</li>
                      </ul>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-gray-300">
                        <strong>Common Algorithms:</strong> Logistic Regression, Decision Trees, Random Forests, Support Vector Machines (SVM).
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase">Decision Boundary Visualization</div>
                      <svg viewBox="0 0 280 200" className="w-full max-w-[280px]">
                        {/* Background shading for classes */}
                        <polygon points="0,0 280,0 280,110 0,170" fill="rgba(59, 130, 246, 0.1)" />
                        <polygon points="0,170 280,110 280,200 0,200" fill="rgba(239, 68, 68, 0.1)" />

                        {/* Decision Boundary Line */}
                        <line x1="0" y1="170" x2="280" y2="110" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,3" />
                        <text x="140" y="130" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">Decision Boundary</text>

                        {/* Class A: Blue circles */}
                        {[[30, 40], [50, 70], [80, 50], [100, 90], [140, 40], [180, 60], [210, 30], [240, 70]].map(([x, y], i) => (
                          <circle key={`a-${i}`} cx={x} cy={y} r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
                        ))}
                        <text x="50" y="30" fill="#60a5fa" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Class A (Legitimate)</text>

                        {/* Class B: Red squares */}
                        {[[30, 185], [70, 180], [110, 160], [150, 175], [190, 140], [220, 165], [250, 135]].map(([x, y], i) => (
                          <rect key={`b-${i}`} x={x - 4} y={y - 4} width="9" height="9" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                        ))}
                        <text x="200" y="190" fill="#f87171" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Class B (Spam)</text>
                      </svg>
                      <span className="text-[10px] text-gray-500 font-mono mt-2">New incoming points are classified based on which side they land on</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Task Type: Regression
                      </div>
                      <h4 className="text-lg font-bold text-white">Predicting Continuous Numbers</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        The target is a continuous numeric quantity. The model fits a trendline or curve that minimizes the distance to all data points.
                      </p>
                      <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                        <li><strong>Real Estate:</strong> Predict home selling price based on square footage and location.</li>
                        <li><strong>Weather:</strong> Predict tomorrow's temperature in Celsius.</li>
                        <li><strong>Retail:</strong> Forecast inventory demand for winter coats next month.</li>
                      </ul>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-gray-300">
                        <strong>Common Algorithms:</strong> Linear Regression, Ridge/Lasso, Gradient Boosted Trees (XGBoost), Neural Networks.
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase">Continuous Trendline Fit</div>
                      <svg viewBox="0 0 280 200" className="w-full max-w-[280px]">
                        {/* Axes */}
                        <line x1="30" y1="170" x2="260" y2="170" stroke="#4b5563" strokeWidth="1.5" />
                        <line x1="30" y1="170" x2="30" y2="20" stroke="#4b5563" strokeWidth="1.5" />
                        <text x="145" y="190" fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="middle">Square Footage (Feature X)</text>
                        <text x="15" y="90" fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="middle" transform="rotate(-90, 15, 90)">Price ($) (Target Y)</text>

                        {/* Best Fit Line */}
                        <line x1="30" y1="155" x2="250" y2="40" stroke="#10b981" strokeWidth="2.5" />

                        {/* Scatter points and residual error lines */}
                        {[
                          [50, 135], [75, 140], [100, 105], [130, 115],
                          [160, 80], [185, 95], [210, 50], [240, 55]
                        ].map(([x, y], i) => {
                          const expectedY = 155 - ((x - 30) / 220) * 115;
                          return (
                            <g key={i}>
                              {/* Residual error dashed line */}
                              <line x1={x} y1={y} x2={x} y2={expectedY} stroke="#f43f5e" strokeDasharray="2,2" strokeWidth="1" />
                              <circle cx={x} cy={y} r="4" fill="#38bdf8" />
                            </g>
                          );
                        })}
                      </svg>
                      <span className="text-[10px] text-gray-500 font-mono mt-2">Dashed red lines show errors (residuals) minimized by Least Squares</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* PARADIGM 2: UNSUPERVISED LEARNING DEEP DIVE */}
          {activeParadigm === 'unsupervised' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-3xl bg-[#111118] border border-emerald-500/40 shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>🧭 Unsupervised Learning: Discovering Hidden Patterns</span>
                  </h3>
                  <p className="text-xs text-emerald-300 font-mono mt-1">Given raw data X with zero answers or labels, uncover natural groupings and structures</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Most data in the real world is unlabeled because labeling requires millions of hours of human labor. 
                Unsupervised algorithms inspect the mathematical geometry and density of data points to find natural clusters, anomalies, and underlying axes.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      <span>🫧 1. Clustering (Customer Segmentation)</span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Automatically grouping customers into personas based on purchasing behavior (e.g. "Bargain Hunters", "Tech Enthusiasts", "Infrequent Shoppers") without pre-existing labels.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      <span>📉 2. Dimensionality Reduction (PCA &amp; t-SNE)</span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Compressing datasets with 500 columns down to 2 or 3 essential dimensions so humans can visualize them, while keeping 95% of the information.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      <span>🚨 3. Anomaly &amp; Fraud Detection</span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Learning what "normal" data looks like. Any data point that sits in an empty, low-density region is flagged as an anomaly or intrusion.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                  <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase">K-Means Cluster Discovery</div>
                  <svg viewBox="0 0 280 200" className="w-full max-w-[280px]">
                    {/* Cluster 1: Green */}
                    <circle cx="70" cy="65" r="45" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" strokeDasharray="3,3" />
                    <circle cx="70" cy="65" r="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                    {[[50, 50], [80, 55], [60, 80], [90, 75], [65, 45]].map(([x, y], i) => (
                      <circle key={`c1-${i}`} cx={x} cy={y} r="3.5" fill="#34d399" />
                    ))}
                    <text x="70" y="30" fill="#34d399" fontSize="9" fontFamily="monospace" textAnchor="middle">Cluster 1 (Budget)</text>

                    {/* Cluster 2: Blue */}
                    <circle cx="210" cy="60" r="45" fill="rgba(59, 130, 246, 0.12)" stroke="#3b82f6" strokeDasharray="3,3" />
                    <circle cx="210" cy="60" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                    {[[190, 45], [225, 50], [200, 75], [230, 70], [215, 40]].map(([x, y], i) => (
                      <circle key={`c2-${i}`} cx={x} cy={y} r="3.5" fill="#60a5fa" />
                    ))}
                    <text x="210" y="30" fill="#60a5fa" fontSize="9" fontFamily="monospace" textAnchor="middle">Cluster 2 (Enterprise)</text>

                    {/* Cluster 3: Purple */}
                    <circle cx="140" cy="150" r="40" fill="rgba(168, 85, 247, 0.12)" stroke="#a855f7" strokeDasharray="3,3" />
                    <circle cx="140" cy="150" r="6" fill="#a855f7" stroke="#fff" strokeWidth="1.5" />
                    {[[125, 140], [155, 145], [135, 165], [150, 160]].map(([x, y], i) => (
                      <circle key={`c3-${i}`} cx={x} cy={y} r="3.5" fill="#c084fc" />
                    ))}
                    <text x="140" y="185" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">Cluster 3 (Casual)</text>

                    {/* Anomaly Outlier */}
                    <circle cx="255" cy="170" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                    <text x="255" y="160" fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="middle">🚨 Outlier</text>
                  </svg>
                  <span className="text-[10px] text-gray-500 font-mono mt-2">Centroids (large dots) calculate the center of mass for each natural grouping</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PARADIGM 3: REINFORCEMENT LEARNING DEEP DIVE */}
          {activeParadigm === 'reinforcement' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-3xl bg-[#111118] border border-rose-500/40 shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>🕹️ Reinforcement Learning: Learning by Trial and Error</span>
                  </h3>
                  <p className="text-xs text-rose-300 font-mono mt-1">An Agent interacts with an Environment to maximize cumulative reward signals</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRlStep((s) => (s + 1) % 4)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Simulate Action ({rlStep}/3)</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => setRlStep(0)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Reinforcement Learning (RL) has no dataset of correct answers. Instead, like a dog learning tricks with treats, the <strong>Agent</strong> takes <strong>Actions</strong> in an <strong>Environment</strong>, receives <strong>Rewards (+10)</strong> or <strong>Penalties (-10)</strong>, and learns an optimal strategy (<strong className="text-rose-300">Policy</strong>).
              </p>

              {/* The Feedback Loop + Interactive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                    <div className="text-rose-400 font-bold mb-2">// The Core 4 Elements of RL:</div>
                    <div className="space-y-1.5 text-gray-300">
                      <div><strong className="text-white">1. Agent:</strong> The learner / decision-maker (e.g. Robot, AlphaGo, Self-driving car).</div>
                      <div><strong className="text-white">2. Environment:</strong> The world the agent lives in (e.g. Chess board, road, video game).</div>
                      <div><strong className="text-white">3. Action (A):</strong> What the agent decides to do (e.g. Move Left, Turn Steering Wheel, Buy Stock).</div>
                      <div><strong className="text-white">4. Reward (R):</strong> Feedback score (+10 for reaching goal, -50 for crashing).</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200/90 leading-relaxed">
                    <strong>Modern Breakthrough: RLHF</strong><br />
                    Reinforcement Learning with Human Feedback (RLHF) and GRPO is the secret sauce that turned raw foundation LLMs into helpful, aligned conversational models like ChatGPT and Claude!
                  </div>
                </div>

                {/* Interactive Agent Grid World */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                  <div className="text-[11px] font-mono text-gray-400 mb-3 uppercase">Grid World: Agent Pathfinding</div>
                  
                  <div className="grid grid-cols-4 gap-2 w-full max-w-[240px] mb-3">
                    {[
                      { idx: 0, content: rlStep === 0 ? '🤖' : '', bg: 'bg-white/5' },
                      { idx: 1, content: rlStep === 1 ? '🤖' : '', bg: 'bg-white/5' },
                      { idx: 2, content: '🔥', bg: 'bg-red-950/40 border border-red-500/30' },
                      { idx: 3, content: '', bg: 'bg-white/5' },

                      { idx: 4, content: '', bg: 'bg-white/5' },
                      { idx: 5, content: rlStep === 2 ? '🤖' : '', bg: 'bg-white/5' },
                      { idx: 6, content: rlStep === 3 ? '🤖' : '', bg: 'bg-white/5' },
                      { idx: 7, content: '🏆', bg: 'bg-emerald-950/40 border border-emerald-500/40' },
                    ].map((cell) => (
                      <div
                        key={cell.idx}
                        className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${cell.bg}`}
                      >
                        {cell.content}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-mono text-gray-400 text-center">
                    {rlStep === 0 && "Step 0: Agent starts at cell (0,0). Goal: Reach 🏆 without touching 🔥."}
                    {rlStep === 1 && "Step 1: Moves Right. Sees fire ahead (-50 penalty risk!). Policy steers agent down."}
                    {rlStep === 2 && "Step 2: Moves Down to bypass the hazard. Cumulative reward = 0."}
                    {rlStep === 3 && "Step 3: Moves Right to goal! Reward = +100. Policy updates weights to favor this path!"}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* SECTION 4: THE ML WORKFLOW AND LIFECYCLE */}
        <motion.section variants={itemVariants} id="ml-lifecycle" className="scroll-mt-24">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <span>Engineering Architecture</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              The Machine Learning Workflow &amp; Lifecycle
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Building real-world ML is not just calling <code className="text-indigo-300 font-mono">model.fit()</code>. It is an 8-stage cyclical engineering pipeline from problem formulation to continuous production drift monitoring.
            </p>
          </div>

          {/* Interactive Stepper Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            {LIFECYCLE_STAGES.map((st, idx) => (
              <button
                key={st.step}
                onClick={() => setActiveLifecycleIndex(idx)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeLifecycleIndex === idx
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 scale-[1.03]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-lg mb-1">{st.icon}</div>
                <div className="text-[10px] font-mono font-bold">STAGE {st.step}</div>
                <div className="text-[11px] font-bold line-clamp-1">{st.title.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {/* Active Lifecycle Stage Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/15 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-3 rounded-2xl bg-white/5 border border-white/10">{activeStage.icon}</span>
                  <div>
                    <div className="text-xs font-mono font-bold text-indigo-400">STAGE {activeStage.step} OF 08</div>
                    <h3 className="text-2xl font-black text-white">{activeStage.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{activeStage.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-sm text-gray-200 leading-relaxed">
                {activeStage.simpleExplain}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-gray-400 uppercase block mb-1">Key Guiding Question:</span>
                  <div className="text-indigo-300 font-sans text-sm font-semibold">{activeStage.keyQuestion}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-red-400 uppercase block mb-1">Common Critical Pitfall:</span>
                  <div className="text-gray-300 font-sans">{activeStage.pitfall}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-emerald-400 uppercase block mb-1">Expected Stage Inputs:</span>
                  <div className="text-gray-300 font-sans">{activeStage.input}</div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-cyan-400 uppercase block mb-1">Deliverable Outputs:</span>
                  <div className="text-gray-300 font-sans">{activeStage.output}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* SECTION 5: REAL-WORLD APPLICATIONS OF MACHINE LEARNING */}
        <motion.section variants={itemVariants} id="applications" className="scroll-mt-24">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span>Practical Impact</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Real-World Applications of Machine Learning
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Machine learning is no longer a research curiosity — it is the invisible intelligence driving modern healthcare, banking, transportation, and daily consumer software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REAL_APPLICATIONS.map((app) => (
              <div
                key={app.category}
                className={`p-6 rounded-3xl border ${app.color} flex flex-col justify-between hover:border-white/30 transition-all shadow-xl`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{app.icon}</span>
                    <h3 className="text-lg font-black text-white">{app.category}</h3>
                  </div>

                  <div className="space-y-4">
                    {app.examples.map((ex, i) => (
                      <div key={i} className="text-xs">
                        <strong className="text-white block mb-0.5">{ex.title}</strong>
                        <p className="text-gray-400 leading-relaxed">{ex.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 6: LIMITATIONS AND CHALLENGES OF ML */}
        <motion.section variants={itemVariants} id="limitations" className="scroll-mt-24">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-rose-400">
              <span>Critical Engineering Realism</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Limitations &amp; Challenges of Machine Learning
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              A good engineer knows what a tool can do; a great engineer knows where it breaks. Machine learning is not magic, and deploying it uncritically leads to dangerous failures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LIMITATIONS.map((lim, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#111116] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{lim.icon}</span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/5 border ${lim.color}`}>
                      {lim.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white mb-2">{lim.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">{lim.desc}</p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] text-gray-400">
                  <strong className="text-rose-400 block mb-0.5">Real-world Caution:</strong>
                  {lim.example}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SECTION 7: FULL CURRICULUM ROADMAP & TOPICS DIRECTORY */}
        <motion.section variants={itemVariants} id="curriculum" className="scroll-mt-24">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <span>Full Curriculum</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">Machine Learning Curriculum &amp; Topic Guides</h2>
            <p className="text-sm text-gray-400 mt-1">Explore individual algorithms, mathematical formulations, and interactive visual explainers across all 37 topics.</p>
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};



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
    title: 'Cleaning',
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
    desc: 'Traditional rule-based code runs identically for decades. But ML models quietly rot over time because the real world changes. Consumer behavior, financial laws, vocabulary, and medical patterns all evolve, rendering static models obsolete.',
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
  const [learningRate, setLearningRate] = useState(0.40);
  const [gdStep, setGdStep] = useState(0);
  const [rlStep, setRlStep] = useState(0);
  const [programmingMode, setProgrammingMode] = useState('traditional'); // 'traditional' or 'ml'

  const activeStage = LIFECYCLE_STAGES[activeLifecycleIndex];

  // 1D Convex Quadratic Loss: L(theta) = (theta - 2.0)^2
  // Gradient: dL/dtheta = 2 * (theta - 2.0), optimal theta* = 2.0
  const targetTheta = 2.0;
  const initialTheta = -1.2;

  // Mathematically compute step-by-step points from actual gradient formula
  const gdHistory = [];
  let tVal = initialTheta;
  for (let s = 0; s <= 7; s++) {
    const loss = (tVal - targetTheta) ** 2;
    const grad = 2 * (tVal - targetTheta);
    const stepDelta = -learningRate * grad;
    const nextVal = tVal + stepDelta;
    const nextLoss = (nextVal - targetTheta) ** 2;
    gdHistory.push({
      step: s,
      theta: tVal,
      loss: loss,
      grad: grad,
      delta: stepDelta,
      nextTheta: nextVal,
      nextLoss: nextLoss,
    });
    tVal = nextVal;
  }

  const currentGd = gdHistory[gdStep] || gdHistory[0];


  const toc = [
    { label: 'Introduction to Machine Learning', hash: 'what-is-ml' },
    { label: 'Traditional vs ML Mindset', hash: 'traditional-vs-ml' },
    { label: 'Gradient Descent Visualisation', hash: 'gradient-descent' },
    { label: 'Has the Model Learned? Generalisation', hash: 'training-vs-generalisation' },
    { label: 'Types of ML (Core Paradigms)', hash: 'types-of-ml' },
    { label: 'The ML Workflow & Lifecycle', hash: 'ml-lifecycle' },
    { label: 'Real-World Applications', hash: 'applications' },
    { label: 'Limitations & Pitfalls', hash: 'limitations' },
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
                <strong className="text-white font-semibold">Machine Learning (ML)</strong> is a branch of Artificial Intelligence that enables computers to learn patterns from data and use those patterns to make predictions or decisions on new, unseen examples.
              </p>
              <p className="text-gray-400 text-sm md:text-base">
                Instead of manually writing rules for every possible situation, we provide data and a learning algorithm that builds a model. During training, the model adjusts its internal parameters to improve its performance on a specific task.
              </p>
            </div>

            {/* The 3 Pillars of ML */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-white text-base mb-1">1. The Data (Experience)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Data provides examples from which a model can learn useful patterns and relationships. Depending on the task, it may include images, text, sensor readings, historical prices, or customer records.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-bold text-white text-base mb-1">2. The Model (Hypothesis)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A model is a mathematical function with learnable parameters. It transforms inputs into predictions. Simple models may have only a few parameters, while large neural networks can have billions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-white text-base mb-1">3. The Loss & Optimizer (Learning)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A loss function measures how well the model's predictions match the target values. During training, an optimisation algorithm updates the model's parameters to reduce the loss (for example, using gradient descent).
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
                  Traditional (Explicit Rules)
                </button>
                <button
                  onClick={() => setProgrammingMode('ml')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    programmingMode === 'ml'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Machine Learning (Learned Patterns)
                </button>
              </div>
            </div>

            {/* Complementary Note */}
            <div className="mb-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs md:text-sm text-gray-300 leading-relaxed flex items-start gap-3">
              <span className="text-xl">🤝</span>
              <div>
                <strong className="text-white block mb-0.5">Complementary Approaches:</strong>
                Traditional programming and machine learning are complementary approaches. Explicit rules are often preferable when requirements are well-defined, while machine learning is useful when patterns are difficult to specify manually.
                <span className="text-gray-400 block text-xs mt-1">
                  (Note: Informal labels like "Software 1.0" and "Software 2.0" are sometimes used as helpful mental analogies for this contrast, rather than formal engineering versions.)
                </span>
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
                    <span className="text-gray-500">1. INPUT:</span> Incoming Email (Subject, Sender, Body)
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-amber-300">
                    <span className="text-gray-500">2. EXPLICIT RULES:</span> if "wire transfer" in body and sender not in address_book: flag_suspicious()
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
                    <span className="text-gray-500">3. OUTPUT:</span> Deterministic Decision: Flag as Suspicious
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">When to use:</strong> Ideal when the business logic is strict, clear, and unambiguous (e.g. blocking known blocked domains, tax brackets, or input validation).<br />
                  <strong className="text-red-400">Trade-off:</strong> Difficult to maintain when edge cases multiply or attackers modify phrasing (e.g. "w-i-r-e transfer"), requiring constant manual updates.
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
                    <span className="text-gray-500">1. INPUT:</span> Historical Dataset of Labeled Emails (Legitimate &amp; Phishing)
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-purple-300">
                    <span className="text-gray-500">2. LEARNING ALGORITHM:</span> Analyzes Vocabulary Frequencies, Headers, and Context
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 font-bold">
                    <span className="text-gray-500">3. LEARNED OUTPUT:</span> Trained Model (Estimates Spam Probability: 98.4%)
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">When to use:</strong> Excels when patterns are nuanced, high-dimensional, or evolving (e.g. natural language, vision, anomaly detection).<br />
                  <strong className="text-indigo-400">Trade-off:</strong> Requires representative training data, careful evaluation, and ongoing monitoring to catch data drift.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION: GRADIENT DESCENT VISUALISATION */}
        <motion.section variants={itemVariants} id="gradient-descent" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#101017] border border-white/10 shadow-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Interactive Engine &amp; Intuition</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Gradient Descent Visualisation: Learning by Optimization
                </h2>
                <p className="text-sm text-gray-400 mt-1 max-w-3xl">
                  How does a machine learning model actually learn? By turning internal dials called <strong>weights</strong> to minimize an error score called <strong>loss</strong>. Below is a simple everyday example followed by the mathematical simulation.
                </p>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGdStep((s) => Math.min(s + 1, 7))}
                  disabled={gdStep >= 7}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                    gdStep >= 7
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
                  }`}
                >
                  <span>Take Step ({gdStep}/7)</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setGdStep(0)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Reset (t=0)
                </button>
              </div>
            </div>

            {/* Small Definition of Gradient Descent */}
            <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">⛰️</span>
                <span>What is Gradient Descent?</span>
              </h3>
              <p className="text-gray-300">
                <strong className="text-white">Gradient Descent</strong> is an optimization algorithm that trains machine learning models by iteratively tweaking their parameters to minimize prediction errors.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-3 text-xs font-mono">
                <div className="flex-1 p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-indigo-300 font-bold block mb-0.5">1. Gradient (The Slope)</span>
                  <span className="text-gray-400">Calculates which direction the prediction error is increasing or decreasing.</span>
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-purple-300 font-bold block mb-0.5">2. Descent (Going Downhill)</span>
                  <span className="text-gray-400">Takes small steps in the opposite direction (downhill) to bring that error to zero.</span>
                </div>
              </div>
            </div>

            {/* Intuition: Everyday Real-World Example */}
            <div className="mb-8 p-6 md:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#12121e] to-purple-950/30 border border-indigo-500/30 shadow-lg">
              {/* The Scenario Banner */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs md:text-sm text-gray-300 leading-relaxed mb-5 flex items-start gap-3">
                <span className="text-2xl">🚖</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <strong className="text-white text-sm">Example: Predicting Cab / Auto Fares</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Real-World Intuition
                    </span>
                  </div>
                  Suppose you want to build an AI to predict the fare of a cab ride based on trip distance in kilometers (km).
                  In reality, the fare is <span className="text-emerald-400 font-bold font-mono">₹2.00 per km</span> (so 1 km = ₹2.00, 5 km = ₹10.00). 
                  <span className="text-amber-300 font-semibold"> But our AI starts completely blank! It does not know the ₹2.00 rule.</span>
                </div>
              </div>

              {/* 3 Step Intuition Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Weight */}
                <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-indigo-300 mb-2">
                      <span className="text-lg">🎛️</span>
                      <span>1. The Weight (θ) = The Tunable Dial</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      A <strong className="text-white">weight</strong> (represented by θ) is simply the internal dial the model turns to make predictions:
                    </p>
                    <div className="my-2.5 p-2 rounded bg-white/5 font-mono text-[11px] text-indigo-200 text-center border border-white/5">
                      Predicted Fare = θ × Distance (km)
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      At first, the model sets the dial randomly—say, at <code className="text-rose-300 font-mono">θ = -1.20</code>. For a 1-km ride, it absurdly predicts <strong className="text-rose-400">-₹1.20</strong> (the driver pays you!).
                    </p>
                  </div>
                </div>

                {/* 2. Loss */}
                <div className="p-4 rounded-xl bg-black/60 border border-purple-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-purple-300 mb-2">
                      <span className="text-lg">📉</span>
                      <span>2. The Loss (L) = The Mistake Meter</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      The <strong className="text-white">loss function</strong> is an error penalty measuring how wrong the model&apos;s prediction was compared to reality (₹2.00):
                    </p>
                    <div className="my-2.5 p-2 rounded bg-white/5 font-mono text-[11px] text-purple-200 text-center border border-white/5">
                      Loss = (Prediction - ₹2.00)²
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      When <code className="text-rose-300 font-mono">θ = -1.20</code>, the error penalty is <strong className="text-rose-400">(-3.20)² = 10.24</strong> (massive mistake).
                      When <code className="text-emerald-300 font-mono">θ = 2.00</code>, the error penalty is <strong className="text-emerald-400 font-mono">(0.00)² = 0.00</strong> (perfection!).
                    </p>
                  </div>
                </div>

                {/* 3. Gradient Descent */}
                <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-emerald-300 mb-2">
                      <span className="text-lg">🏔️</span>
                      <span>3. Gradient Descent = Rolling Downhill</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      The AI cannot see the true rate (₹2.00) in advance. It is like a blindfolded hiker in a foggy valley, feeling the slope (gradient) under their boots:
                    </p>
                    <div className="my-2.5 p-2 rounded bg-white/5 font-mono text-[11px] text-emerald-200 text-center border border-white/5">
                      New θ = Old θ - (Step × Slope)
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      If the slope says &quot;you underpriced&quot;, turn the dial <strong className="text-emerald-400">UP</strong>. If &quot;you overpriced&quot;, turn it <strong className="text-rose-400">DOWN</strong>. It rolls down until the error hits zero!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Cab Fare Simulation Status Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚖</span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                    Live Cab Fare Model Prediction (1-km Ride):
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">Formula:</span>
                    <code className="text-xs font-mono font-bold text-indigo-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Fare = ({currentGd.theta.toFixed(2)}) × 1 km
                    </code>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-mono font-extrabold text-white">
                      Predicted:{' '}
                      <span className={Math.abs(currentGd.theta - 2.0) < 0.05 ? 'text-emerald-400' : 'text-indigo-300'}>
                        {currentGd.theta >= 0 ? `₹${currentGd.theta.toFixed(2)}` : `-₹${Math.abs(currentGd.theta).toFixed(2)}`}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">(Actual: <strong className="text-emerald-400">₹2.00</strong>)</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {Math.abs(currentGd.theta - 2.0) < 0.05 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span>🎯</span> Optimal Rate Found! (Loss = 0.00)
                  </span>
                ) : currentGd.theta < 2.0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span>⚠️</span> Underpricing by ₹{(2.0 - currentGd.theta).toFixed(2)} → Slope pushes dial UP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <span>⚠️</span> Overpricing by ₹{(currentGd.theta - 2.0).toFixed(2)} → Slope pushes dial DOWN
                  </span>
                )}
              </div>
            </div>

            {/* Learning Rate Controls */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    1. Choose Step Size / Learning Rate (η):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Small (η = 0.08)', val: 0.08, desc: 'Slow, cautious descent' },
                      { label: 'Suitable (η = 0.40)', val: 0.40, desc: 'Fast, stable convergence' },
                      { label: 'Excessively Large (η = 1.08)', val: 1.08, desc: 'Overshoots & oscillates' },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        onClick={() => {
                          setLearningRate(btn.val);
                          setGdStep(0);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          Math.abs(learningRate - btn.val) < 0.01
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400">Manual η:</span>
                  <input
                    type="range"
                    min="0.04"
                    max="1.14"
                    step="0.02"
                    value={learningRate}
                    onChange={(e) => {
                      setLearningRate(parseFloat(e.target.value));
                      setGdStep(0);
                    }}
                    className="w-32 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-300 w-12 text-right">
                    {learningRate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Readouts & Mathematical Values */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Parameter θ (Price Dial)</span>
                <span className="text-white text-sm font-bold">{currentGd.theta.toFixed(3)}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {currentGd.theta >= 0 ? `₹${currentGd.theta.toFixed(2)}` : `-₹${Math.abs(currentGd.theta).toFixed(2)}`}/km (Target: ₹2.00)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Current Loss L(θ) (Mistake)</span>
                <span className="text-purple-300 text-sm font-bold">{currentGd.loss.toFixed(3)}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">L = (θ - 2.0)² error penalty</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Gradient ∇L = 2(θ - 2) (Slope)</span>
                <span className={`text-sm font-bold ${currentGd.grad < 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {currentGd.grad >= 0 ? '+' : ''}{currentGd.grad.toFixed(3)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {currentGd.grad < 0 ? 'Negative: underpricing (raise θ)' : 'Positive: overpricing (lower θ)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <span className="text-gray-500 block text-[10px] uppercase">Step: Δθ = -η · ∇L (Dial Turn)</span>
                <span className={`text-sm font-bold ${currentGd.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentGd.delta >= 0 ? '+' : ''}{currentGd.delta.toFixed(3)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Next θ = {currentGd.nextTheta.toFixed(3)}</span>
              </div>
            </div>

            {/* Visual Loss Bowl + Deep Explanations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
              {/* SVG Canvas */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase tracking-wider">
                  Loss Curve L(θ) = (θ - 2.0)² (Mistake Landscape)
                </div>

                <svg viewBox="0 0 360 210" className="w-full max-w-[360px] overflow-visible">
                  {/* Parabolic Loss Curve */}
                  <path
                    d={Array.from({ length: 41 }, (_, i) => {
                      const t = -2.5 + i * (9.0 / 40);
                      const l = (t - 2.0) ** 2;
                      const x = 180 + (t - 2.0) * 38;
                      const y = 175 - Math.min(l, 11.5) * 13;
                      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />

                  {/* Underpricing / Overpricing Zones */}
                  <text x="65" y="45" fill="#f59e0b" fontSize="8" fontFamily="monospace">← Underpricing (θ &lt; ₹2)</text>
                  <text x="295" y="45" textAnchor="end" fill="#f43f5e" fontSize="8" fontFamily="monospace">Overpricing (θ &gt; ₹2) →</text>

                  {/* Optimal Minimum Line */}
                  <line x1="180" y1="30" x2="180" y2="185" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1.5" />
                  <text x="180" y="200" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Optimal θ* = 2.0 (₹2/km, 0 error)
                  </text>

                  {/* Trajectory Trail */}
                  {gdStep > 0 && (
                    <polyline
                      points={gdHistory.slice(0, gdStep + 1).map((h) => {
                        const clampedT = Math.max(-2.5, Math.min(6.5, h.theta));
                        const clampedL = Math.min(11.5, (clampedT - 2.0) ** 2);
                        const x = 180 + (clampedT - 2.0) * 38;
                        const y = 175 - clampedL * 13;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  )}

                  {/* Past Step Markers */}
                  {gdHistory.slice(0, gdStep + 1).map((h, i) => {
                    const clampedT = Math.max(-2.5, Math.min(6.5, h.theta));
                    const clampedL = Math.min(11.5, (clampedT - 2.0) ** 2);
                    const x = 180 + (clampedT - 2.0) * 38;
                    const y = 175 - clampedL * 13;
                    const isCurrent = i === gdStep;

                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isCurrent ? '7' : '4'}
                          fill={isCurrent ? '#ec4899' : '#818cf8'}
                          stroke={isCurrent ? '#fff' : 'none'}
                          strokeWidth={isCurrent ? '2' : '0'}
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fill={isCurrent ? '#ec4899' : '#9ca3af'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          t={h.step}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="text-[10px] text-gray-500 font-mono mt-3 text-center">
                  Trajectory: {gdHistory.slice(0, gdStep + 1).map(h => `θ${h.step}=${h.theta.toFixed(2)}`).join(' → ')}
                </div>
              </div>

              {/* Step Explanations & Overshoot Insights */}
              <div className="space-y-3 text-xs">
                {/* Step Update Equation */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono">
                  <div className="text-gray-400 mb-1">// Mathematical Update Calculation:</div>
                  <div className="text-indigo-300 font-bold">
                    θ_{gdStep + 1} = {currentGd.theta.toFixed(3)} - ({learningRate.toFixed(2)} · {currentGd.grad >= 0 ? '+' : ''}{currentGd.grad.toFixed(3)}) = {currentGd.nextTheta.toFixed(3)}
                  </div>
                  <div className="text-gray-400 mt-1">
                    Loss: <span className="text-purple-300 font-bold">{currentGd.loss.toFixed(3)}</span> → <span className="text-emerald-300 font-bold">{currentGd.nextLoss.toFixed(3)}</span> (ΔL = {(currentGd.nextLoss - currentGd.loss).toFixed(3)})
                  </div>
                </div>

                {/* Why it moves in this direction */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 leading-relaxed text-gray-300">
                  <strong className="text-white block mb-1">Why does parameter θ change direction?</strong>
                  {currentGd.theta < 2.0 ? (
                    <span>
                      Since the price dial θ ({currentGd.theta.toFixed(2)}) is to the left of 2.0, the model is <strong className="text-amber-300">underpricing</strong> the ride (₹{currentGd.theta.toFixed(2)} vs the true ₹2.00). 
                      The slope (gradient) is <span className="text-cyan-400 font-mono font-bold">negative</span> ({currentGd.grad.toFixed(2)}). 
                      Subtracting a negative gradient results in an <span className="text-emerald-400 font-bold">addition</span> (+{currentGd.delta.toFixed(2)}), turning the price dial upward toward the ₹2.00 valley.
                    </span>
                  ) : (
                    <span>
                      Since the price dial θ ({currentGd.theta.toFixed(2)}) is to the right of 2.0, the model is <strong className="text-rose-300">overpricing</strong> the ride (₹{currentGd.theta.toFixed(2)} vs the true ₹2.00). 
                      The slope is <span className="text-amber-400 font-mono font-bold">positive</span> ({currentGd.grad.toFixed(2)}). 
                      Subtracting a positive gradient results in a <span className="text-rose-400 font-bold">reduction</span> ({currentGd.delta.toFixed(2)}), turning the price dial downward toward the ₹2.00 valley.
                    </span>
                  )}
                </div>

                {/* Overshooting Alert or Convergence */}
                {learningRate > 0.6 ? (
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-rose-200/90 leading-relaxed">
                    <strong className="text-rose-400 block mb-1">⚠️ Why does it overshoot or diverge?</strong>
                    With an excessively large learning rate (η = {learningRate.toFixed(2)}), the step size <code className="text-white font-mono">|η · ∇L|</code> is larger than twice the distance to the minimum. The update leaps completely over the valley to the opposite wall. Because η &gt; 1.0, each bounce lands higher than the last, causing wild oscillations or divergence!
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">✅ Stable Convergence</strong>
                    With a suitable learning rate (η = {learningRate.toFixed(2)}), the update step automatically shrinks as the gradient flattens near the minimum, settling smoothly into the optimal parameter θ* = 2.000 (₹2.00 / km).
                  </div>
                )}
              </div>
            </div>

            {/* Note on Real-World Multidimensional Landscapes */}
            <div className="mt-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs md:text-sm text-gray-300 leading-relaxed flex items-start gap-3">
              <span className="text-xl">🌐</span>
              <div>
                <strong className="text-white block mb-0.5">Real-World Note: Multidimensional Loss Landscapes</strong>
                In this visual demonstration, our model has only 1 parameter (the price dial θ). In real-world machine learning, models have thousands to billions of parameters! The loss landscape is a complex, high-dimensional surface with hills, ravines, and saddle points. However, the fundamental law remains identical: the algorithm computes partial derivatives for every parameter and takes a step in the direction of steepest descent.
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION: HAS THE MODEL ACTUALLY LEARNED? (TRAINING VS GENERALISATION) */}
        <motion.section variants={itemVariants} id="training-vs-generalisation" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Crucial Conceptual Bridge</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Has the Model Actually Learned? Training vs Generalisation
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-4xl">
              Watching gradient descent reduce loss on training examples is satisfying, but it raises a vital question: <strong className="text-white">is minimizing training error alone enough?</strong>
              <br /><br />
              In machine learning, the goal is <span className="text-purple-300 font-semibold underline decoration-purple-500/40">never</span> to merely memorize the data the computer has already seen. The true objective is <strong className="text-white">generalisation</strong>—learning underlying patterns that allow the model to make accurate predictions on new, unseen examples.
            </p>

            {/* Model A vs Model B Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Model A Card */}
              <div className="p-6 rounded-2xl bg-black/50 border border-red-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase text-red-400">Model A: The Memorizer (Overfit)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-300 border border-red-500/20">Poor Generalisation</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Training Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">99.4% (Near Zero Error)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 flex justify-between items-center">
                      <span className="text-gray-400">Unseen Test Score:</span>
                      <span className="text-rose-400 font-bold text-sm">54.2% (Fails on New Data!)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-white">What happened:</strong> Model A memorized the exact training examples, including random noise, typos, and flukes—like a student who memorized the answers to practice questions without understanding the concepts. When presented with new questions, it fails.
                  </p>
                </div>
              </div>

              {/* Model B Card */}
              <div className="p-6 rounded-2xl bg-black/50 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400">Model B: The Pattern Learner</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Strong Generalisation</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Training Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">91.5%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex justify-between items-center">
                      <span className="text-gray-400">Unseen Test Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">90.8% (Performs Consistently!)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-white">What happened:</strong> Model B captured the true underlying signal and generalized relationships. It doesn't score 100% on the training set, but it performs reliably on brand-new examples in the real world.
                  </p>
                </div>
              </div>
            </div>

            {/* Train / Test Split Key Takeaway */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs md:text-sm text-purple-200/90 leading-relaxed flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <div>
                <strong className="text-white block mb-0.5">The Key Takeaway for Machine Learning Engineers:</strong>
                Never evaluate a model only on the data it was trained on. In practice, we always split historical data into a <strong>Training Set</strong> (used by the optimization algorithm to learn parameters) and a separate holdout <strong>Test Set</strong> (used as an honest, unbiased exam to measure real-world generalisation).
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
                Learns from labelled examples containing inputs and their corresponding target outputs. The model learns a relationship that can be used to predict outputs for new inputs.
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
                Finds useful structures or patterns in data without predefined target labels. Common tasks include clustering and dimensionality reduction.
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
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Reward Optimization</span>
              </div>
              <div className="font-extrabold text-base text-white">3. Reinforcement Learning</div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                An agent learns a decision-making policy by interacting with an environment and receiving rewards. The goal is to maximise cumulative reward over time.
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
                In Reinforcement Learning (RL), an <strong>Agent</strong> learns a decision-making policy by interacting with an <strong>Environment</strong> and receiving <strong>Rewards</strong>. The goal is to maximise cumulative reward over time.
                <br /><br />
                <span className="text-xs text-gray-400 italic">
                  Note: In reinforcement learning, rewards are not necessarily immediate (they can be delayed across long trajectories), and explicit penalties are not required in every formulation—an agent can learn effectively purely by seeking positive rewards.
                </span>
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

      </motion.div>
    </GuideLayout>
  );
}

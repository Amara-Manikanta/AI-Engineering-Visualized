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
              <span>CHAPTER 1: THE CORE FUNDAMENTALS</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              What is Machine Learning?
            </h2>
            
            <div className="prose prose-invert max-w-none text-gray-300 text-base md:text-lg leading-relaxed mb-8 space-y-4">
              <p>
                <strong className="text-white font-semibold">Machine Learning (ML)</strong> is the science of teaching computers to recognize patterns in data so they can make decisions on their own.
              </p>
              <p className="text-gray-400 text-sm md:text-base">
                Instead of a human writing every single rule (e.g., &quot;If price &gt; 10, then expensive&quot;), we show the computer thousands of examples, and it figures out the rules itself.
              </p>
            </div>

            {/* The 3 Pillars of ML */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-white text-base mb-1">1. The Data (Experience)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The &quot;textbook&quot; the computer studies. It contains the examples (images, numbers, text) used to learn.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-bold text-white text-base mb-1">2. The Model (The Brain)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The mathematical structure that holds the patterns. It takes an input and produces a guess.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-white text-base mb-1">3. The Loss (The Score)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A score that tells the computer how wrong its guess was. The goal is to make this score as small as possible.
                </p>
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
                  Traditional (Rules)
                </button>
                <button
                  onClick={() => setProgrammingMode('ml')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    programmingMode === 'ml'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Machine Learning (Data)
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
                <h3 className="font-bold text-white text-base mb-4">
                  Traditional: You provide the Rules
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                    <span className="text-gray-400 font-bold">INPUT:</span> Data
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <span className="text-amber-400 font-bold">RULES:</span> if (email contains &apos;win money&apos;) -&gt; Spam
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="text-emerald-400 font-bold">OUTPUT:</span> Decision
                  </div>
                </div>
              </div>

              {/* Machine Learning Box */}
              <div className={`p-6 rounded-2xl border transition-all ${
                programmingMode === 'ml'
                  ? 'bg-gradient-to-br from-indigo-950/30 via-[#11111e] to-purple-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}>
                <h3 className="font-bold text-white text-base mb-4">
                  Machine Learning: You provide the Answers
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                    <span className="text-gray-400 font-bold">INPUT:</span> Data + Correct Answers
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    <span className="text-indigo-400 font-bold">ALGORITHM:</span> Finds patterns in data
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
                    <span className="text-purple-400 font-bold">OUTPUT:</span> The Rules (The Model)
                  </div>
                </div>
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
                  <span>INTERACTIVE ENGINE &amp; INTUITION</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Gradient Descent: How the Model Learns
                </h2>
                <p className="text-sm text-gray-400 mt-1 max-w-3xl">
                  To learn, a model needs to minimize its mistakes. We use two key concepts: the <strong className="text-purple-300 font-semibold">Loss Function</strong> (how much we missed by) and the <strong className="text-indigo-300 font-semibold">Gradient</strong> (which way to turn the dial to fix it).
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
                  Reset
                </button>
              </div>
            </div>

            {/* 2 Key Concepts: Loss Function & Gradient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Card 1: Loss Function */}
              <div className="p-5 rounded-2xl bg-[#141422] border border-indigo-500/30">
                <div className="flex items-center gap-2 font-bold text-white text-base mb-2">
                  <span className="text-indigo-400">⏹️</span>
                  <span>1. The Loss Function (The &quot;Mistake Meter&quot;)</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  The Loss Function is a single number that represents how wrong the model is.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  If the model predicts a cab fare of ₹5.50 but the real fare is ₹2.00, the &quot;Mistake Meter&quot; (Loss) goes up. If the prediction is exactly ₹2.00, the Loss is 0.
                </p>
                <div className="text-xs font-mono font-bold text-indigo-300">
                  Goal: Get the Loss as zero.
                </div>
              </div>

              {/* Card 2: The Gradient */}
              <div className="p-5 rounded-2xl bg-[#141422] border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-white text-base mb-2">
                  <span className="text-emerald-400">⏺️</span>
                  <span>2. The Gradient (The &quot;Directional Compass&quot;)</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  The Gradient is the slope of the error. It tells the model which direction to move its internal &apos;dials&apos; (weights) to make the error smaller.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">
                  If the slope is <span className="text-rose-400 font-semibold">positive</span>, the error is increasing: we must turn the dial <span className="text-emerald-400 font-semibold underline">down</span>.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  If the slope is <span className="text-cyan-400 font-semibold">negative</span>, the error is decreasing: we must turn the dial <span className="text-emerald-400 font-semibold underline">up</span>.
                </p>
              </div>
            </div>

            {/* Live Cab Fare Simulation Status Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚖</span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
                    CURRENT MODEL GUESS (FOR 1KM RIDE):
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-gray-300">
                      Fare = {currentGd.theta.toFixed(2)} * 1km = <span className={Math.abs(currentGd.theta - 2.0) < 0.05 ? 'text-emerald-400 font-bold' : 'text-indigo-300 font-bold'}>
                        {currentGd.theta >= 0 ? `₹${currentGd.theta.toFixed(2)}` : `-₹${Math.abs(currentGd.theta).toFixed(2)}`}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">(Target <strong className="text-emerald-400">₹2.00</strong>)</span>
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
                    <span>⚠️</span> Underpricing -&gt; Turn Dial UP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <span>⚠️</span> Overpricing -&gt; Turn Dial DOWN
                  </span>
                )}
              </div>
            </div>

            {/* Step Size (Learning Rate) Controls */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    STEP SIZE (LEARNING RATE η):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Small (Slow)', val: 0.08 },
                      { label: 'Ideal (Fast)', val: 0.40 },
                      { label: 'Huge (Chaos)', val: 1.08 },
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

            {/* The Error Valley Loss Curve & Math Update */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
              {/* SVG Canvas */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-[11px] font-mono text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  THE &quot;ERROR VALLEY&quot; (LOSS CURVE)
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
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />

                  {/* Optimal Minimum Line */}
                  <line x1="180" y1="30" x2="180" y2="185" stroke="#ffffff" strokeDasharray="3,3" strokeWidth="1.5" />
                  <text x="180" y="200" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="monospace">
                    Optimal (Error = 0)
                  </text>

                  {/* Current Position Marker */}
                  {(() => {
                    const clampedT = Math.max(-2.5, Math.min(6.5, currentGd.theta));
                    const clampedL = Math.min(11.5, (clampedT - 2.0) ** 2);
                    const x = 180 + (clampedT - 2.0) * 38;
                    const y = 175 - clampedL * 13;
                    return (
                      <g>
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill="#ec4899"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fill="#ec4899"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          t={gdStep}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Step Explanations & Math Update Box */}
              <div className="space-y-3 text-xs">
                {/* Math Update Box */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono">
                  <div className="text-gray-400 mb-1">// The Math Update:</div>
                  <div className="text-indigo-300 font-bold">
                    New Dial = {currentGd.theta.toFixed(3)} - ({learningRate.toFixed(2)} * {currentGd.grad >= 0 ? '+' : ''}{currentGd.grad.toFixed(3)}) = {currentGd.nextTheta.toFixed(3)}
                  </div>
                  <div className="text-gray-300 mt-1">
                    Loss: <span className="text-purple-300 font-bold">{currentGd.loss.toFixed(3)}</span> -&gt; <span className="text-emerald-300 font-bold">{currentGd.nextLoss.toFixed(3)}</span>
                  </div>
                </div>

                {/* Why did the dial move? */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 leading-relaxed text-gray-300">
                  <strong className="text-white block mb-1">Why did the dial move?</strong>
                  {currentGd.theta < 2.0 ? (
                    <span>
                      The model is underpricing. The slope is negative. Subtracting a negative number makes the dial go UP.
                    </span>
                  ) : (
                    <span>
                      The model is overpricing. The slope is positive. Subtracting a positive number makes the dial go DOWN.
                    </span>
                  )}
                </div>

                {/* Stable Learning / Chaos Badge */}
                {learningRate > 0.6 ? (
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-rose-200/90 leading-relaxed">
                    <strong className="text-rose-400 block mb-1">⚠️ Overshooting / Chaos</strong>
                    With an excessively large learning rate, the step size leaps completely over the valley, causing wild oscillations!
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 leading-relaxed">
                    <strong className="text-emerald-400 flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Stable Learning
                    </strong>
                    The model is taking controlled steps toward the bottom of the valley.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION: TRAINING VS GENERALISATION */}
        <motion.section variants={itemVariants} id="training-vs-generalisation" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>CRUCIAL CONCEPTUAL BRIDGE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Training vs Generalisation
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-4xl">
              Minimizing error on your training data is easy—you can just memorize it. The real goal is <strong className="text-white">Generalisation</strong>: the ability to perform well on data the model has <em className="text-white font-semibold">never seen before</em>.
            </p>

            {/* Model A vs Model B Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model A Card */}
              <div className="p-6 rounded-2xl bg-black/50 border border-red-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase text-red-400">MODEL A: THE MEMORIZER (OVERFIT)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 font-bold">Bad</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Training Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">99.4%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 flex justify-between items-center">
                      <span className="text-gray-400">New Data Score:</span>
                      <span className="text-rose-400 font-bold text-sm">54.2%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Like a student who memorizes the answers to a practice test but doesn&apos;t understand the math. They fail the real exam.
                  </p>
                </div>
              </div>

              {/* Model B Card */}
              <div className="p-6 rounded-2xl bg-black/50 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400">MODEL B: THE LEARNER (GENERALISED)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">Good</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">Training Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">91.5%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex justify-between items-center">
                      <span className="text-gray-400">New Data Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">90.8%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Like a student who learns the underlying logic. They might not get 100% on practice, but they ace the real exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 5: TYPES OF MACHINE LEARNING */}
        <motion.section variants={itemVariants} id="types-of-ml" className="scroll-mt-24">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <span>CORE PARADIGMS</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Types of Machine Learning
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              How much guidance does the machine receive?
            </p>
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
                Learning with a &quot;Teacher&quot;. You give the machine the questions AND the correct answers.
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
                Learning by &quot;Discovery&quot;. You give the machine data with NO answers and ask it to find patterns.
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
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Trial &amp; Error</span>
              </div>
              <div className="font-extrabold text-base text-white">3. Reinforcement Learning</div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Learning by &quot;Experience&quot;. An agent tries actions and gets &quot;Rewards&quot; or &quot;Penalties&quot; to learn the best path.
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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-2xl font-black text-white">
                    Supervised Learning
                  </h3>
                </div>
                <div className="flex gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
                  <button
                    onClick={() => setActiveSupervisedType('classification')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSupervisedType === 'classification'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Classification (Categories)
                  </button>
                  <button
                    onClick={() => setActiveSupervisedType('regression')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSupervisedType === 'regression'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Regression (Numbers)
                  </button>
                </div>
              </div>

              <div className="text-xs text-blue-300 font-mono mb-2">
                Goal: Learn the relationship between Inputs (X) and Answers (Y)
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Think of this as a student with an answer key. The student makes a guess, checks the key, sees the error, and adjusts.
              </p>

              {/* Sub-Type Visual Demo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                {activeSupervisedType === 'classification' ? (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Predicting Categories</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        The model draws a &quot;boundary&quot; to separate groups (e.g., Spam vs. Not Spam).
                      </p>
                      <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                        <li><strong>Email:</strong> Is this Spam or Inbox?</li>
                        <li><strong>Medical:</strong> Is this tumor Benign or Malignant?</li>
                      </ul>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                      <svg viewBox="0 0 280 180" className="w-full max-w-[280px]">
                        {/* Class A: Blue circles */}
                        {[[40, 40], [70, 50], [90, 75], [120, 45], [150, 70], [180, 35], [210, 60], [240, 50]].map(([x, y], i) => (
                          <circle key={`a-${i}`} cx={x} cy={y} r="5" fill="#38bdf8" />
                        ))}

                        {/* Decision Boundary Line */}
                        <line x1="20" y1="130" x2="260" y2="90" stroke="#ffffff" strokeWidth="2" strokeDasharray="4,4" />

                        {/* Class B: Orange squares */}
                        {[[30, 150], [60, 160], [100, 145], [140, 155], [170, 135], [200, 145], [230, 125]].map(([x, y], i) => (
                          <rect key={`b-${i}`} x={x - 4} y={y - 4} width="8" height="8" fill="#fb923c" />
                        ))}
                      </svg>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Predicting Continuous Numbers</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        The model fits a &quot;line&quot; to the data to predict values like price or temperature.
                      </p>
                      <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                        <li><strong>Real Estate:</strong> Predicting house price based on size.</li>
                        <li><strong>Weather:</strong> Predicting tomorrow&apos;s temperature.</li>
                      </ul>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                      <svg viewBox="0 0 280 180" className="w-full max-w-[280px]">
                        {/* Axes */}
                        <line x1="30" y1="150" x2="250" y2="150" stroke="#6b7280" strokeWidth="1.5" />
                        <line x1="30" y1="150" x2="30" y2="30" stroke="#6b7280" strokeWidth="1.5" />

                        {/* Best Fit Line */}
                        <line x1="30" y1="140" x2="245" y2="45" stroke="#34d399" strokeWidth="2.5" />

                        {/* Scatter points and residual error lines */}
                        {[
                          [45, 130], [65, 132], [95, 108], [120, 115],
                          [150, 85], [175, 95], [205, 55], [230, 60]
                        ].map(([x, y], i) => {
                          const expectedY = 140 - ((x - 30) / 215) * 95;
                          return (
                            <g key={i}>
                              <line x1={x} y1={y} x2={x} y2={expectedY} stroke="#f43f5e" strokeDasharray="2,2" strokeWidth="1" />
                              <circle cx={x} cy={y} r="4" fill="#38bdf8" />
                            </g>
                          );
                        })}
                      </svg>
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧭</span>
                <h3 className="text-2xl font-black text-white">
                  Unsupervised Learning
                </h3>
              </div>

              <div className="text-xs text-emerald-300 font-mono mb-2">
                Goal: Find hidden structures in data with NO answers provided.
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Think of this as sorting a giant pile of mixed Lego bricks. You don&apos;t know what they are supposed to be, but you can group them by color, size, or shape.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      <span>🫧 Clustering</span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Grouping customers into &quot;Big Spenders&quot; vs &quot;Window Shoppers&quot; based on behavior.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                      <span>🚨 Anomaly Detection</span>
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Finding the one &quot;weird&quot; transaction in a million normal ones (Fraud Detection).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
                  <svg viewBox="0 0 280 180" className="w-full max-w-[280px]">
                    {/* Cluster 1: Green dotted circle */}
                    <circle cx="85" cy="85" r="45" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
                    {[[85, 85], [70, 75], [95, 70], [75, 100], [95, 95], [85, 65]].map(([x, y], i) => (
                      <circle key={`u1-${i}`} cx={x} cy={y} r={i === 0 ? "5" : "3.5"} fill="#34d399" />
                    ))}

                    {/* Cluster 2: Blue dotted circle */}
                    <circle cx="195" cy="80" r="45" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,4" />
                    {[[195, 80], [180, 70], [210, 75], [185, 95], [205, 95], [195, 60]].map(([x, y], i) => (
                      <circle key={`u2-${i}`} cx={x} cy={y} r={i === 0 ? "5" : "3.5"} fill="#60a5fa" />
                    ))}

                    {/* Anomaly Outlier */}
                    <circle cx="250" cy="155" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🕹️</span>
                  <h3 className="text-2xl font-black text-white">
                    Reinforcement Learning
                  </h3>
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
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="text-xs text-rose-300 font-mono mb-2">
                Goal: Maximize &quot;Rewards&quot; through trial and error.
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Think of training a dog. You don&apos;t give it a manual; you give it a treat when it sits and say &quot;No&quot; when it jumps. Eventually, it learns the behavior that gets the most treats.
              </p>

              {/* The Feedback Loop + Interactive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                  <div className="text-gray-400 font-bold mb-2">// The Loop:</div>
                  <div className="space-y-1.5 text-gray-300">
                    <div><strong className="text-white">1. Agent:</strong> The learner (The Dog).</div>
                    <div><strong className="text-white">2. Environment:</strong> The world (The Living Room).</div>
                    <div><strong className="text-white">3. Actions:</strong> What it does (Sit, Jump, Bark).</div>
                    <div><strong className="text-white">4. Reward:</strong> Feedback (+Treat, -No!).</div>
                  </div>
                </div>

                {/* Interactive Agent Grid World */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/70 border border-white/10">
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
                    Start: Reach 🏆 without touching 🔥.
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
              <span>ENGINEERING ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              The ML Lifecycle
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Building ML is a continuous loop, not a one-time task.
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

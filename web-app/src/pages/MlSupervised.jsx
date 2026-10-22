import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import CodeBlock from '../components/CodeBlock';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------------------------------------------------------------------
   Regression vs Classification — the two shapes of supervised learning
--------------------------------------------------------------------------- */

function RegVsClassVisual() {
  const regPts = [[15, 78], [28, 70], [38, 64], [50, 52], [60, 46], [72, 34], [84, 26]];
  const classA = [[22, 30], [30, 22], [18, 44], [34, 38], [26, 54], [40, 28]];
  const classB = [[62, 72], [72, 64], [58, 58], [78, 74], [68, 50], [82, 60]];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-sm font-semibold text-emerald-400 mb-1">Regression → a number</div>
        <div className="text-[0.6875rem] text-gray-500 mb-3">Fit a line; predict a continuous value.</div>
        <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1.4' }}>
          <line x1="8" y1="92" x2="96" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="8" y1="8" x2="8" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="82" x2="90" y2="22" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,2" />
          {regPts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" fill="#34d399" />
          ))}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 text-center">e.g. "this house → $412,000"</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-sm font-semibold text-blue-400 mb-1">Classification → a category</div>
        <div className="text-[0.6875rem] text-gray-500 mb-3">Draw a boundary; predict which side.</div>
        <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: '1.4' }}>
          <line x1="8" y1="92" x2="96" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="8" y1="8" x2="8" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="20" y1="88" x2="88" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
          {classA.map(([x, y], i) => (
            <circle key={`a${i}`} cx={x} cy={y} r="2.6" fill="#818cf8" />
          ))}
          {classB.map(([x, y], i) => (
            <rect key={`b${i}`} x={x - 2.2} y={y - 2.2} width="4.4" height="4.4" rx="1" fill="#f472b6" />
          ))}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 text-center">e.g. "this email → spam"</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Under / good / over fit
--------------------------------------------------------------------------- */

function FitVisual() {
  const pts = [[14, 70], [26, 58], [34, 66], [46, 48], [56, 54], [66, 38], [78, 44], [88, 30]];
  const panels = [
    { title: 'Underfit', tone: 'text-rose-400', border: 'border-rose-500/30', line: 'M 12 66 L 90 40', dash: false, sub: 'Too simple — misses the trend (high bias).' },
    { title: 'Good fit', tone: 'text-emerald-400', border: 'border-emerald-500/30', line: 'M 12 70 Q 50 40 90 32', dash: false, sub: 'Captures the trend, ignores the noise.' },
    { title: 'Overfit', tone: 'text-amber-400', border: 'border-amber-500/30', line: 'M 14 70 L 26 58 L 34 66 L 46 48 L 56 54 L 66 38 L 78 44 L 88 30', dash: false, sub: 'Memorises every point — fails on new data (high variance).' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {panels.map((p) => (
        <div key={p.title} className={`rounded-xl border ${p.border} bg-black/40 p-4`}>
          <div className={`text-sm font-semibold mb-2 ${p.tone}`}>{p.title}</div>
          <svg viewBox="0 0 100 90" className="w-full">
            <path d={p.line} fill="none" stroke="currentColor" className={p.tone} strokeWidth="1.5" />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" fill="#9ca3af" />
            ))}
          </svg>
          <div className="text-[0.6875rem] text-gray-500 mt-1 leading-relaxed">{p.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   K-fold cross validation
--------------------------------------------------------------------------- */

function KFoldVisual() {
  const k = 5;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="space-y-2">
        {Array.from({ length: k }).map((_, fold) => (
          <div key={fold} className="flex items-center gap-3">
            <span className="text-[0.625rem] font-mono text-gray-500 w-14 shrink-0">Round {fold + 1}</span>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: k }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: fold * 0.08 + i * 0.02 }}
                  className={`flex-1 h-7 rounded flex items-center justify-center text-[0.5625rem] font-bold ${
                    i === fold
                      ? 'bg-amber-500/25 border border-amber-500/50 text-amber-200'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300/70'
                  }`}
                >
                  {i === fold ? 'TEST' : 'train'}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[0.6875rem] text-gray-500 mt-4 leading-relaxed mb-0">
        The data is split into {k} folds. Each round holds out a different fold for testing and trains on the other
        four — so every row gets used for validation exactly once. Averaging the {k} scores gives a far more reliable
        estimate than a single train/test split.
      </p>
    </div>
  );
}

const ALGOS = [
  { name: 'Logistic Regression', task: 'Classification', note: 'Linear, fast, interpretable baseline for binary problems.' },
  { name: 'Decision Tree', task: 'Both', note: 'Human-readable if/else splits; prone to overfitting alone.' },
  { name: 'Random Forest', task: 'Both', note: 'Ensemble of trees — strong, robust default for tabular data.' },
  { name: 'Gradient Boosting (XGBoost)', task: 'Both', note: 'Sequential trees correcting errors; wins most tabular benchmarks.' },
  { name: 'SVM', task: 'Classification', note: 'Finds the maximum-margin boundary; great for high-dim, small data.' },
  { name: 'k-Nearest Neighbours', task: 'Both', note: 'Predicts from the closest examples; no training, slow to query.' },
  { name: 'Naive Bayes', task: 'Classification', note: 'Probabilistic, assumes independent features; strong for text.' },
  { name: 'Neural Network', task: 'Both', note: 'Learns complex non-linear patterns; needs more data and tuning.' },
];

const toc = [
  { label: 'How It Works', hash: '#how' },
  { label: 'Regression vs Classification', hash: '#reg-vs-class' },
  { label: 'Classification Types', hash: '#classification-details' },
  { label: 'Algorithm Cheat Sheet', hash: '#algorithms' },
  { label: 'Overfitting & Underfitting', hash: '#fit' },
  { label: 'Evaluation & Cross-Validation', hash: '#evaluation' },
];

export default function MlSupervised() {
  return (
    <GuideLayout
      title="Supervised Learning"
      intro="Models trained on labelled data — every example comes with the right answer, and the model learns the mapping from input to output."
      toc={toc}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="how" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">How It Works</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            "Supervised" means the training data carries the answers. Each example is a pair of{' '}
            <strong className="text-white">features → label</strong>: the pixels of an image and the word "cat", the
            attributes of a house and its sale price. The model's whole job is to learn the function that turns the
            first into the second, so that it can predict the label for inputs it has never seen.
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-mono">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-center">
              Labelled data<br /><span className="text-gray-500">(features + answers)</span>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 text-center">
              Training<br /><span className="text-indigo-300/70">learn the mapping</span>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-center">
              Model
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-center">
              Predict<br /><span className="text-emerald-300/70">on new inputs</span>
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="reg-vs-class" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Regression vs Classification</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            Supervised problems come in two shapes, decided entirely by the type of label you are predicting: a
            continuous number, or a discrete category.
          </p>
          <RegVsClassVisual />
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="classification-details" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Classification Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: 'Binary', d: 'Exactly two classes.', ex: 'Spam vs not-spam, fraud vs legit', tone: 'border-blue-500/30' },
              { t: 'Multi-class', d: 'One label from many options.', ex: 'Digit 0–9, animal species', tone: 'border-purple-500/30' },
              { t: 'Multi-label', d: 'Several labels at once.', ex: 'Photo tagged "beach" + "sunset"', tone: 'border-teal-500/30' },
            ].map((c) => (
              <div key={c.t} className={`p-5 rounded-xl border ${c.tone} bg-white/5`}>
                <h3 className="font-semibold text-white mb-1">{c.t}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{c.d}</p>
                <div className="text-[0.6875rem] text-gray-500 italic">{c.ex}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="algorithms" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Algorithm Cheat Sheet</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Algorithm</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Task</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">In one line</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {ALGOS.map((a, i) => (
                  <tr key={a.name} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                    <td className="p-3 border-b border-white/5 font-semibold text-gray-200">{a.name}</td>
                    <td className="p-3 border-b border-white/5">
                      <span className={`text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        a.task === 'Classification' ? 'border-blue-500/40 text-blue-300' : a.task === 'Both' ? 'border-gray-500/40 text-gray-300' : 'border-emerald-500/40 text-emerald-300'
                      }`}>{a.task}</span>
                    </td>
                    <td className="p-3 border-b border-white/5 text-xs">{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Starting point for tabular data: try Gradient Boosting (XGBoost / LightGBM). It is the most reliable winner
            outside of images and text, where neural networks dominate.
          </p>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="fit" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Overfitting & Underfitting</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            The central tension in supervised learning. A model that is too simple misses the real pattern
            (underfitting); one that is too complex memorises the training noise and fails on new data (overfitting).
            The goal is the model in the middle — and the only way to know which you have is to test on data the model
            never saw.
          </p>
          <FitVisual />
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="evaluation" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Evaluation & Cross-Validation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-2">Training vs test accuracy</h3>
              <p className="text-xs text-gray-400 leading-relaxed m-0">
                High training accuracy alone means nothing — a model can memorise. What matters is{' '}
                <strong className="text-gray-200">out-of-sample</strong> accuracy on a held-out test set. A big gap
                between the two is the signature of overfitting.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-2">Regression error metrics</h3>
              <ul className="text-xs text-gray-400 leading-relaxed space-y-1">
                <li><strong className="text-gray-200">R²</strong> — fraction of variance explained (1.0 = perfect).</li>
                <li><strong className="text-gray-200">MAE</strong> — average absolute error, in original units.</li>
                <li><strong className="text-gray-200">MSE / RMSE</strong> — squared error; punishes big misses harder.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3 text-gray-200">K-Fold Cross-Validation</h3>
          <p className="text-gray-400 leading-relaxed mb-4 max-w-3xl text-sm">
            A single train/test split can be lucky or unlucky. K-fold rotates the test set across the whole dataset so
            every row is validated once — giving a stable estimate of true performance.
          </p>
          <KFoldVisual />

          <div className="mt-4">
            <CodeBlock language="python" maxHeight="360px">
              <code>
                <span className="text-pink-400">from</span> sklearn.model_selection <span className="text-pink-400">import</span> KFold, cross_val_score{'\n'}
                <span className="text-pink-400">from</span> sklearn.linear_model <span className="text-pink-400">import</span> LogisticRegression{'\n'}
                <span className="text-pink-400">from</span> sklearn.datasets <span className="text-pink-400">import</span> load_iris{'\n\n'}
                X, y = load_iris(return_X_y=<span className="text-orange-300">True</span>){'\n'}
                model = LogisticRegression(max_iter=<span className="text-orange-300">200</span>){'\n'}
                kf = KFold(n_splits=<span className="text-orange-300">5</span>, shuffle=<span className="text-orange-300">True</span>, random_state=<span className="text-orange-300">42</span>){'\n\n'}
                scores = cross_val_score(model, X, y, cv=kf){'\n'}
                <span className="text-blue-400">print</span>(<span className="text-green-300">{'f"Mean CV accuracy: {scores.mean():.2f} ± {scores.std():.2f}"'}</span>)
              </code>
            </CodeBlock>
          </div>
        </motion.section>
      </motion.div>
    </GuideLayout>
  );
}

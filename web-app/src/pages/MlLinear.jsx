import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

const DATA = [
  { x: 1, y: 2.1 }, { x: 2, y: 3.9 }, { x: 3, y: 4.8 }, { x: 4, y: 6.2 },
  { x: 5, y: 7.1 }, { x: 6, y: 8.9 }, { x: 7, y: 9.5 }, { x: 8, y: 11.2 },
];

function leastSquares(data) {
  const n = data.length;
  const sumX = data.reduce((s, p) => s + p.x, 0);
  const sumY = data.reduce((s, p) => s + p.y, 0);
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = data.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export default function MlLinear() {
  const best = useMemo(() => leastSquares(DATA), []);
  const [m, setM] = useState(1);
  const [b, setB] = useState(1);

  const width = 560, height = 320, pad = 36;
  const xMax = 9, yMax = 13;
  const toSvgX = (x) => pad + (x / xMax) * (width - pad * 2);
  const toSvgY = (y) => height - pad - (y / yMax) * (height - pad * 2);

  const mse = useMemo(() => {
    const errs = DATA.map((p) => Math.pow(p.y - (m * p.x + b), 2));
    return errs.reduce((s, e) => s + e, 0) / DATA.length;
  }, [m, b]);

  const bestMse = useMemo(() => {
    const errs = DATA.map((p) => Math.pow(p.y - (best.slope * p.x + best.intercept), 2));
    return errs.reduce((s, e) => s + e, 0) / DATA.length;
  }, [best]);

  const toc = [
    { label: "What is Linear Regression?", hash: "overview" },
    { label: "Fit the Line Yourself", hash: "interactive" },
    { label: "The Cost Function", hash: "cost" },
    { label: "Gradient Descent", hash: "gradient-descent" },
    { label: "Assumptions & R²", hash: "assumptions" },
  ];

  return (
    <GuideLayout
      title="Linear Regression"
      intro="The simplest supervised learning model: fit a straight line that best predicts a continuous value from one input feature."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Linear regression assumes the relationship between an input <code className="bg-gray-800 px-1 rounded text-pink-400">x</code> and
          output <code className="bg-gray-800 px-1 rounded text-pink-400">y</code> is a straight line:
          <code className="bg-gray-800 px-1.5 py-0.5 rounded text-pink-400 mx-1">y = mx + b</code>.
          Training means finding the slope <code className="text-indigo-300">m</code> and intercept <code className="text-indigo-300">b</code> that
          minimize the average squared distance between the line and every real data point.
        </p>
      </section>

      <section id="interactive" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Fit the Line Yourself</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          Drag the sliders to change the slope and intercept. Watch the Mean Squared Error (MSE) — that number is exactly
          what gradient descent is trying to minimize automatically.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-col items-center">
          <svg width={width} height={height} className="max-w-full">
            {/* axes */}
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#374151" />
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#374151" />
            {/* data points */}
            {DATA.map((p, i) => (
              <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={5} fill="#38BDF8" />
            ))}
            {/* residual lines */}
            {DATA.map((p, i) => (
              <line
                key={`r-${i}`}
                x1={toSvgX(p.x)} y1={toSvgY(p.y)}
                x2={toSvgX(p.x)} y2={toSvgY(m * p.x + b)}
                stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="3,3" opacity={0.6}
              />
            ))}
            {/* fitted line */}
            <motion.line
              x1={toSvgX(0)} y1={toSvgY(b)}
              x2={toSvgX(xMax)} y2={toSvgY(m * xMax + b)}
              stroke="#818CF8" strokeWidth={3}
            />
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md mt-4">
            <div>
              <label className="text-sm text-gray-300 font-semibold">Slope (m) = {m.toFixed(2)}</label>
              <input type="range" min="-1" max="3" step="0.05" value={m} onChange={(e) => setM(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Intercept (b) = {b.toFixed(2)}</label>
              <input type="range" min="-5" max="10" step="0.1" value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="bg-rose-900/20 border border-rose-500/30 px-4 py-2 rounded-lg text-sm">
              Your MSE: <strong className="text-rose-300">{mse.toFixed(3)}</strong>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm">
              Best possible MSE: <strong className="text-emerald-300">{bestMse.toFixed(3)}</strong> (m={best.slope.toFixed(2)}, b={best.intercept.toFixed(2)})
            </div>
            <button
              onClick={() => { setM(parseFloat(best.slope.toFixed(2))); setB(parseFloat(best.intercept.toFixed(2))); }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Snap to Best Fit
            </button>
          </div>
        </div>
      </section>

      <section id="cost" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Cost Function</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          The dashed red lines above are <strong className="text-white">residuals</strong> — the gap between the prediction and
          the real value. Squaring and averaging them gives Mean Squared Error, the standard cost function for regression:
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 mb-4">
          MSE = (1/n) · Σ (y_i − ŷ_i)² &nbsp;&nbsp;where&nbsp;&nbsp; ŷ_i = m·x_i + b
        </div>
        <p className="text-gray-400 text-sm">Squaring does two things: it makes all errors positive, and it penalizes large errors far more than small ones — a point twice as far off contributes 4x the cost.</p>
      </section>

      <section id="gradient-descent" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Gradient Descent</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          For simple linear regression there's a closed-form solution (what "Snap to Best Fit" used above). For most
          real models, you instead nudge <code className="text-indigo-300">m</code> and <code className="text-indigo-300">b</code> a
          little in the direction that reduces MSE, repeatedly, until it stops improving:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
            <div className="text-sm font-semibold text-white mb-1">Rolling downhill on the cost curve</div>
            <div className="text-[0.6875rem] text-gray-500 mb-3">Each step moves against the gradient toward lower MSE.</div>
            <svg viewBox="0 0 200 130" className="w-full">
              {/* parabola (cost vs a parameter) */}
              <path d="M 20 20 Q 100 170 180 20" fill="none" stroke="#374151" strokeWidth="2" />
              {/* descending steps */}
              {[
                { x: 34, y: 44 }, { x: 52, y: 74 }, { x: 72, y: 96 }, { x: 92, y: 106 }, { x: 100, y: 108 },
              ].map((p, i, arr) => (
                <g key={i}>
                  {i < arr.length - 1 && (
                    <line x1={p.x} y1={p.y} x2={arr[i + 1].x} y2={arr[i + 1].y} stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                  )}
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={i === arr.length - 1 ? 5 : 3.5}
                    fill={i === arr.length - 1 ? '#34d399' : '#818cf8'}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.25 }}
                  />
                </g>
              ))}
              <text x="100" y="126" textAnchor="middle" fill="#6b7280" fontSize="8">parameter value →</text>
              <text x="12" y="16" fill="#6b7280" fontSize="8">cost</text>
            </svg>
            <div className="text-[0.6875rem] text-gray-500 mt-1 leading-relaxed">
              The <span className="text-emerald-400">green</span> point is the minimum — the best-fit line. The{' '}
              <strong className="text-gray-300">learning rate</strong> sets the step size: too small crawls, too large
              overshoots and diverges.
            </div>
          </div>

          <CodeBlock language="python" maxHeight="320px" code={`for epoch in range(num_epochs):
    y_pred = m * X + b
    error = y_pred - y

    # gradients: which way is downhill?
    dm = (2/n) * sum(X * error)   # wrt slope
    db = (2/n) * sum(error)       # wrt intercept

    # take a step against the gradient
    m -= learning_rate * dm
    b -= learning_rate * db`} />
        </div>
      </section>

      <section id="assumptions" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Assumptions & R² Score</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="font-bold text-gray-200 mb-2">Core Assumptions</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li><strong className="text-white">Linearity:</strong> the true relationship is approximately a straight line.</li>
              <li><strong className="text-white">Homoscedasticity:</strong> residual variance is roughly constant across x.</li>
              <li><strong className="text-white">Independence:</strong> errors aren't correlated with each other.</li>
              <li><strong className="text-white">Normality:</strong> residuals are roughly normally distributed.</li>
            </ul>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="font-bold text-gray-200 mb-2">R² (Coefficient of Determination)</h3>
            <p className="text-sm text-gray-300 mb-2">Measures how much of the variance in y is explained by the model, from 0 (no better than predicting the mean) to 1 (perfect fit).</p>
            <code className="text-indigo-300 text-sm bg-black/40 px-2 py-1 rounded block">R² = 1 − (SS_residual / SS_total)</code>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">When one line isn't enough:</strong> if the relationship curves, add
            polynomial terms; if several inputs drive the output, move to{' '}
            <a href="#/ml/multiple-regression" className="text-blue-400 hover:underline">
              Multiple Regression
            </a>
            . If you are predicting a category rather than a number, the sibling model is{' '}
            <a href="#/ml/logistic-regression" className="text-blue-400 hover:underline">
              Logistic Regression
            </a>
            .
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

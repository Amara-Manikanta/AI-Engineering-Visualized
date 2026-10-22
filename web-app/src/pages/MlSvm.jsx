import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Support Vector Machines — the margin is a real number, so compute it.

   Everything below works on the same fixed 2D dataset. The boundary is a line
   you steer with two sliders (angle + offset); the page then measures the true
   perpendicular distance from every point to that line, finds the closest one
   per class, and reports the margin. No canned figures.
-------------------------------------------------------------------------- */

// Two linearly separable clouds, hand-placed so the geometry is legible.
const POINTS = [
  { x: 1.2, y: 2.4, c: 0 },
  { x: 1.8, y: 1.5, c: 0 },
  { x: 2.6, y: 3.1, c: 0 },
  { x: 0.9, y: 3.6, c: 0 },
  { x: 2.2, y: 2.0, c: 0 },
  { x: 3.1, y: 1.9, c: 0 },
  { x: 5.4, y: 5.0, c: 1 },
  { x: 6.2, y: 4.1, c: 1 },
  { x: 6.8, y: 5.8, c: 1 },
  { x: 5.9, y: 6.4, c: 1 },
  { x: 7.3, y: 4.7, c: 1 },
  { x: 4.9, y: 5.7, c: 1 },
];

const VIEW = 420; // svg is square in data units 0..8
const SPAN = 8;
const toPx = (v) => (v / SPAN) * VIEW;
const toPy = (v) => VIEW - (v / SPAN) * VIEW;

function MarginExplorer() {
  // Deliberately starts separating but not optimal, so there is something to find.
  const [angle, setAngle] = useState(62); // degrees, direction of the normal
  const [offset, setOffset] = useState(0.5); // shifts the line along its normal

  const geom = useMemo(() => {
    // Boundary: w·x + b = 0, with w the unit normal.
    const rad = (angle * Math.PI) / 180;
    const wx = Math.cos(rad);
    const wy = Math.sin(rad);
    // Anchor the line near the middle of the data, then shift by `offset`.
    const cx = 4;
    const cy = 4;
    const b = -(wx * cx + wy * cy) + offset;

    const signed = POINTS.map((p) => ({ ...p, d: wx * p.x + wy * p.y + b }));

    // Class 0 should sit on the negative side, class 1 on the positive side.
    const neg = signed.filter((p) => p.c === 0);
    const pos = signed.filter((p) => p.c === 1);
    const worstNeg = Math.max(...neg.map((p) => p.d)); // closest / most wrong
    const worstPos = Math.min(...pos.map((p) => p.d));

    const separates = worstNeg < 0 && worstPos > 0;
    const margin = separates ? Math.min(-worstNeg, worstPos) : 0;
    const misclassified = signed.filter((p) => (p.c === 0 ? p.d > 0 : p.d < 0)).length;

    // Support vectors: the points sitting exactly on the margin (within a hair).
    const eps = 1e-6;
    const supports = separates
      ? signed.filter((p) => Math.abs(Math.abs(p.d) - margin) < 1e-3 + eps)
      : [];

    return { wx, wy, b, signed, margin, misclassified, separates, supports };
  }, [angle, offset]);

  // Two endpoints of the boundary line clipped to the 0..8 box (approximate but
  // ample: we just march far along the line direction from its foot point).
  const line = useMemo(() => {
    const { wx, wy, b } = geom;
    const dx = -wy;
    const dy = wx;
    const fx = -b * wx;
    const fy = -b * wy;
    const L = 20;
    return { x1: fx - dx * L, y1: fy - dy * L, x2: fx + dx * L, y2: fy + dy * L, dx, dy };
  }, [geom]);

  const shift = (k) => ({
    x1: line.x1 + geom.wx * k,
    y1: line.y1 + geom.wy * k,
    x2: line.x2 + geom.wx * k,
    y2: line.y2 + geom.wy * k,
  });

  const up = shift(geom.margin);
  const down = shift(-geom.margin);

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">Steer the boundary, watch the margin</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Any line that separates these two clouds classifies the training set perfectly. An SVM does not want any
        separating line — it wants the one whose nearest point on either side is as far away as possible. Move the
        sliders and the widest-margin line announces itself.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 items-start">
        <div className="rounded-xl bg-black/50 border border-white/10 p-3">
          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="w-full h-auto">
            {/* grid */}
            {[1, 2, 3, 4, 5, 6, 7].map((g) => (
              <g key={g}>
                <line x1={toPx(g)} y1="0" x2={toPx(g)} y2={VIEW} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1={toPy(g)} x2={VIEW} y2={toPy(g)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </g>
            ))}

            {/* margin band */}
            {geom.separates && geom.margin > 0 && (
              <polygon
                points={`${toPx(up.x1)},${toPy(up.y1)} ${toPx(up.x2)},${toPy(up.y2)} ${toPx(down.x2)},${toPy(down.y2)} ${toPx(down.x1)},${toPy(down.y1)}`}
                fill="rgba(99,102,241,0.13)"
              />
            )}

            {/* margin edges */}
            {geom.separates && geom.margin > 0 && (
              <>
                <line x1={toPx(up.x1)} y1={toPy(up.y1)} x2={toPx(up.x2)} y2={toPy(up.y2)} stroke="rgba(129,140,248,0.55)" strokeWidth="1.5" strokeDasharray="5 4" />
                <line x1={toPx(down.x1)} y1={toPy(down.y1)} x2={toPx(down.x2)} y2={toPy(down.y2)} stroke="rgba(129,140,248,0.55)" strokeWidth="1.5" strokeDasharray="5 4" />
              </>
            )}

            {/* the boundary itself */}
            <line
              x1={toPx(line.x1)}
              y1={toPy(line.y1)}
              x2={toPx(line.x2)}
              y2={toPy(line.y2)}
              stroke={geom.separates ? "#a5b4fc" : "#f87171"}
              strokeWidth="2.5"
            />

            {/* points */}
            {geom.signed.map((p, i) => {
              const isSupport = geom.supports.includes(p);
              const wrong = p.c === 0 ? p.d > 0 : p.d < 0;
              const fill = p.c === 0 ? "#34d399" : "#fbbf24";
              return (
                <g key={i}>
                  {isSupport && (
                    <circle cx={toPx(p.x)} cy={toPy(p.y)} r="12" fill="none" stroke="#a5b4fc" strokeWidth="2" />
                  )}
                  <circle
                    cx={toPx(p.x)}
                    cy={toPy(p.y)}
                    r="7"
                    fill={fill}
                    stroke={wrong ? "#f87171" : "rgba(0,0,0,0.6)"}
                    strokeWidth={wrong ? 3 : 2}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <label className="block mb-4">
            <span className="text-xs uppercase tracking-wide text-gray-500">Boundary angle</span>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-500"
            />
            <span className="font-mono text-indigo-300 text-sm">{angle}°</span>
          </label>

          <label className="block mb-5">
            <span className="text-xs uppercase tracking-wide text-gray-500">Shift along the normal</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-500"
            />
            <span className="font-mono text-indigo-300 text-sm">{offset.toFixed(2)}</span>
          </label>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-3">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Margin (each side)</div>
            <div className="text-3xl font-bold font-mono text-indigo-300">{geom.margin.toFixed(3)}</div>
            <div className="text-[0.6875rem] text-gray-500 mt-1">distance to the closest point</div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Misclassified</div>
            <div className={`text-3xl font-bold font-mono ${geom.misclassified ? "text-rose-400" : "text-emerald-400"}`}>
              {geom.misclassified}
            </div>
          </div>

          {geom.separates ? (
            <p className="text-xs text-emerald-300/90 leading-relaxed m-0">
              Circled points are the <strong>support vectors</strong> — the only ones touching the margin. Drag the
              rest anywhere inside their cloud and the boundary would not move at all.
            </p>
          ) : (
            <p className="text-xs text-rose-300/90 leading-relaxed m-0">
              This line does not separate the classes. The margin is undefined until every point is on its own side.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 text-xs text-gray-500 font-mono">
        boundary: {geom.wx.toFixed(3)}·x₁ {geom.wy < 0 ? "−" : "+"} {Math.abs(geom.wy).toFixed(3)}·x₂{" "}
        {geom.b < 0 ? "−" : "+"} {Math.abs(geom.b).toFixed(3)} = 0
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   The kernel trick, done literally: 1D data that no threshold can split,
   lifted to 2D by adding x² as a second coordinate. Then a line works.
-------------------------------------------------------------------------- */

const LINE_1D = [-3.1, -2.4, -1.8, -1.1, 1.0, 1.7, 2.5, 3.2, -0.4, 0.3, 0.6, -0.6];
const inner = (x) => Math.abs(x) < 0.8; // the class that sits in the middle

function KernelLift() {
  const [lifted, setLifted] = useState(false);

  const W = 460;
  const H = 240;
  const pad = 34;
  const sx = (x) => pad + ((x + 4) / 8) * (W - pad * 2);
  const sy = (y) => H - pad - (y / 11) * (H - pad * 2);

  // In lifted space, x² < 0.64 separates the inner class. Draw that threshold.
  const cut = 0.64;

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.07] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h3 className="text-purple-400 font-bold m-0">The kernel trick, taken literally</h3>
        <button
          onClick={() => setLifted((v) => !v)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 transition-colors"
        >
          {lifted ? "Collapse to 1D" : "Lift to 2D with x²"}
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        On the line below, the amber class sits in the middle and the green class on both ends. No single threshold can
        split them. Add one made-up coordinate — <span className="font-mono text-purple-300">x² </span> — and a
        straight line separates them cleanly.
      </p>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* axes */}
          <line x1={pad} y1={sy(0)} x2={W - pad} y2={sy(0)} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          {lifted && <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={pad - 10} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />}
          <text x={W - pad} y={sy(0) + 18} fill="#6b7280" fontSize="11" textAnchor="end" fontFamily="monospace">x</text>
          {lifted && <text x={sx(0) + 8} y={pad - 2} fill="#a78bfa" fontSize="11" fontFamily="monospace">x²</text>}

          {/* separating line, only meaningful once lifted */}
          {lifted && (
            <line x1={pad} y1={sy(cut)} x2={W - pad} y2={sy(cut)} stroke="#c4b5fd" strokeWidth="2" strokeDasharray="6 4" />
          )}

          {LINE_1D.map((x, i) => (
            <circle
              key={i}
              cx={sx(x)}
              cy={lifted ? sy(x * x) : sy(0)}
              r="7"
              fill={inner(x) ? "#fbbf24" : "#34d399"}
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="2"
              style={{ transition: "cy 600ms cubic-bezier(.4,0,.2,1)" }}
            />
          ))}
        </svg>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        The actual trick is that you never build that second coordinate. A kernel function returns the dot product{" "}
        <span className="font-mono text-gray-400">K(a, b) = φ(a)·φ(b)</span> in the lifted space directly, so an
        infinite-dimensional lift costs the same as a finite one. The optimiser only ever needs dot products.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const KERNELS = [
  {
    n: "Linear",
    f: "K(a, b) = aᵀb",
    d: "No lift at all. Fast, interpretable, and the right default when features already outnumber samples — text classification with tf-idf being the classic case.",
    box: "border-blue-500/25 bg-blue-500/[0.07]",
    label: "text-blue-400",
  },
  {
    n: "RBF (Gaussian)",
    f: "K(a, b) = exp(−γ‖a − b‖²)",
    d: "The general-purpose choice. Lifts into an infinite-dimensional space where almost anything is separable. γ sets how far a single training point's influence reaches.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
  {
    n: "Polynomial",
    f: "K(a, b) = (γ aᵀb + r)ᵈ",
    d: "Models feature interactions up to degree d explicitly. Useful when you believe products of features matter, but numerically fragile at high degree.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
];

export default function MlSvm() {
  const toc = [
    { label: "The Problem", hash: "problem" },
    { label: "Maximise the Margin", hash: "margin" },
    { label: "Support Vectors", hash: "supports" },
    { label: "Soft Margin & C", hash: "soft" },
    { label: "The Kernel Trick", hash: "kernel" },
    { label: "Choosing a Kernel", hash: "kernels" },
    { label: "In Code", hash: "code" },
    { label: "When to Reach for It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="Support Vector Machines"
      intro="Of all the lines that separate two classes, pick the one furthest from both. That single idea — plus a trick for curved boundaries — is the whole algorithm."
      toc={toc}
    >
      <section id="problem" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          Suppose two classes are separable by a straight line. There are infinitely many such lines, and every one of
          them scores 100% on the training data. They are not equally good. A line that skims past a training point
          will misclassify the very next sample that lands slightly on the other side of it.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Logistic regression picks a boundary by maximising likelihood, which does not directly care how close the
          boundary sits to the data. An SVM makes distance the objective: it maximises the gap between the boundary
          and the nearest point of each class.
        </p>
      </section>

      <section id="margin" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Maximise the Margin</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The margin is the perpendicular distance from the boundary to the closest training point. Widening it is the
          entire training objective.
        </p>
        <MarginExplorer />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">What is being optimised</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Write the boundary as <span className="font-mono text-gray-300">wᵀx + b = 0</span>. Scale w so the
              closest points satisfy <span className="font-mono text-gray-300">|wᵀx + b| = 1</span>. The margin is then{" "}
              <span className="font-mono text-gray-300">1/‖w‖</span>, so maximising the margin means minimising ‖w‖.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Why that is a good problem</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Minimising ‖w‖² subject to linear constraints is a convex quadratic program. There is exactly one
              optimum and no local minima to get stuck in — a rare guarantee among classifiers, and the reason SVMs
              behave so predictably on small datasets.
            </p>
          </div>
        </div>
      </section>

      <section id="supports" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Support Vectors</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          The circled points in the explorer above are the support vectors. They are the only training data the final
          model depends on. Delete every other point and retrain, and you get the identical boundary.
        </p>
        <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
          <p className="text-sm text-indigo-100 leading-relaxed m-0">
            <strong>Two practical consequences.</strong> The model is compact — prediction cost scales with the number
            of support vectors, not the size of the training set. And it is sensitive in a specific way: adding one
            point deep inside a cloud changes nothing, while adding one near the boundary can move it. Outliers close
            to the frontier are the failure mode to watch.
          </p>
        </div>
      </section>

      <section id="soft" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Soft Margin and the C Parameter</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Real data is rarely cleanly separable, and demanding zero training errors on noisy data produces a
          contorted boundary. The soft-margin formulation allows violations and charges for them. C is the price.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
            <div className="font-semibold mb-1.5 text-amber-400">Small C — tolerant</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Violations are cheap, so the optimiser buys a wider margin by letting some points sit inside it or on the
              wrong side. Smoother boundary, more bias, less variance. This is the setting for noisy data.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-semibold mb-1.5 text-rose-400">Large C — strict</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Violations are expensive, so the boundary bends to classify every training point correctly. Narrow
              margin, low bias, high variance. As C → ∞ you recover the hard-margin SVM and its overfitting.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            C and the RBF γ interact, so they must be tuned together on a grid rather than one at a time. A common
            starting sweep is C ∈ {"{"}0.1, 1, 10, 100{"}"} against γ ∈ {"{"}0.001, 0.01, 0.1, 1{"}"}.
          </p>
        </div>
      </section>

      <section id="kernel" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Kernel Trick</h2>
        <KernelLift />
      </section>

      <section id="kernels" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Choosing a Kernel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KERNELS.map((k) => (
            <div key={k.n} className={`p-5 rounded-xl border ${k.box}`}>
              <div className={`font-bold mb-1 ${k.label}`}>{k.n}</div>
              <div className="text-[0.6875rem] font-mono text-gray-500 mb-2.5">{k.f}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{k.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Scale your features first.</strong> Every kernel here is built from dot products or distances, so a
            feature measured in thousands will drown one measured in fractions. Standardising is not optional
            preprocessing for an SVM — it changes which boundary you get.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

# Scaling belongs inside the pipeline so the search never leaks test statistics.
pipe = make_pipeline(
    StandardScaler(),
    SVC(kernel="rbf", class_weight="balanced", probability=False),
)

grid = GridSearchCV(
    pipe,
    {
        "svc__C":     [0.1, 1, 10, 100],
        "svc__gamma": [1e-3, 1e-2, 1e-1, 1],
    },
    cv=5,
    scoring="f1_macro",
    n_jobs=-1,
)
grid.fit(X_train, y_train)

print(grid.best_params_)
print("support vectors:", grid.best_estimator_[-1].n_support_)

# decision_function gives the signed distance to the boundary — far more
# useful than predict() when you need to threshold on confidence.
scores = grid.decision_function(X_test)`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Note <span className="font-mono text-gray-400">probability=False</span>. Turning it on runs an internal
          five-fold Platt calibration that multiplies training time and can disagree with{" "}
          <span className="font-mono text-gray-400">predict()</span>. If you need calibrated probabilities, wrap the
          fitted model in <span className="font-mono text-gray-400">CalibratedClassifierCV</span> instead.
        </p>
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Reach for It</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Good fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Small to medium datasets — up to roughly tens of thousands of rows.</li>
              <li>High-dimensional data, especially when features outnumber samples.</li>
              <li>Clear margin between classes, or a boundary you expect to be smooth.</li>
              <li>Text classification with sparse tf-idf features and a linear kernel.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Poor fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Large datasets — kernel SVM training is roughly quadratic to cubic in rows.</li>
              <li>Heavily mixed classes where no margin exists to maximise.</li>
              <li>When you need probabilities or feature importances out of the box.</li>
              <li>Mixed categorical and numeric tabular data — use trees instead.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            On tabular problems the honest default in 2026 is a gradient-boosted tree, not an SVM — see{" "}
            <a href="#/ml/xgboost" className="text-blue-400 hover:underline">XGBoost</a> and{" "}
            <a href="#/ml/random-forests" className="text-blue-400 hover:underline">Random Forests</a>. SVMs remain the
            better tool when dimensionality is high and rows are few, which is exactly where trees struggle.
          </p>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("ml-svm")} />
    </GuideLayout>
  );
}

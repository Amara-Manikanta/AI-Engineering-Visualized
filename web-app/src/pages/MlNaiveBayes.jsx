import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { normPdf, fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "naive bayes", "naive bias", "naïve bayes", "Bayes theorem", "prior", "posterior", "likelihood", "evidence",
  "conditional independence", "spam filter", "Laplace smoothing", "additive smoothing", "zero frequency problem",
  "MultinomialNB", "GaussianNB", "BernoulliNB", "ComplementNB", "text classification", "base rate fallacy",
  "false positive paradox",
];

/* ---------------------------------------------------------------------------
   The medical-test puzzle: 10,000 people, one test, a rare condition.
--------------------------------------------------------------------------- */

function TestPuzzle() {
  const [prev, setPrev] = useState(1);
  const [sens, setSens] = useState(95);
  const [spec, setSpec] = useState(95);
  const N = 10000;
  const sick = (N * prev) / 100;
  const tp = sick * (sens / 100);
  const fn = sick - tp;
  const fp = (N - sick) * (1 - spec / 100);
  const tn = N - sick - fp;
  const ppv = tp / (tp + fp);

  // 400-dot grid, each dot ≈ 25 people, ordered TP, FN, FP, TN
  const dots = 400;
  const per = N / dots;
  const nTP = Math.round(tp / per);
  const nFN = Math.round(fn / per);
  const nFP = Math.round(fp / per);
  const colour = (i) => (i < nTP ? "#fb7185" : i < nTP + nFN ? "#fbbf24" : i < nTP + nFN + nFP ? "#60a5fa" : "#334155");

  return (
    <Panel tone="rose" title="You test positive. How worried should you be?">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        A condition affects some share of people. A test catches most sick people (sensitivity) and clears most healthy
        people (specificity). Each dot is 25 people out of 10,000.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div>
          <svg viewBox="0 0 360 184" className="w-full h-auto block max-w-xl">
            {Array.from({ length: dots }, (_, i) => (
              <circle key={i} cx={6 + (i % 40) * 8.8} cy={6 + Math.floor(i / 40) * 17.5} r="3.4" fill={colour(i)} style={{ transition: "fill 250ms" }} />
            ))}
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-gray-400 mt-2">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 mr-1" />sick, test positive ({Math.round(tp)})</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-1" />sick, missed ({Math.round(fn)})</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 mr-1" />healthy, false alarm ({Math.round(fp)})</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-600 mr-1" />healthy, cleared ({Math.round(tn)})</span>
          </div>
        </div>
        <div className="space-y-3">
          <Slider tone="rose" label="Prevalence (prior)" value={prev} min={0.1} max={20} step={0.1} onChange={setPrev} format={(v) => `${v.toFixed(1)}%`} />
          <Slider tone="rose" label="Sensitivity P(+ | sick)" value={sens} min={50} max={99.9} step={0.1} onChange={setSens} format={(v) => `${v.toFixed(1)}%`} />
          <Slider tone="rose" label="Specificity P(− | healthy)" value={spec} min={50} max={99.9} step={0.1} onChange={setSpec} format={(v) => `${v.toFixed(1)}%`} />
          <Metric label="P(sick | positive)" value={pct(ppv)} tone="rose" sub={`${Math.round(tp)} true positives out of ${Math.round(tp + fp)} positives`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With 1% prevalence and a 95%/95% test, a positive result means only about a 16% chance of being sick: the 5%
        false-alarm rate applied to 9,900 healthy people swamps the 95 real cases. Ignoring the prior like this is
        the base-rate fallacy. Bayes' theorem is the correction — and the whole of Naive Bayes is this calculation,
        repeated for every feature.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A spam filter, trained on ten emails, computed in full.
--------------------------------------------------------------------------- */

const CORPUS = {
  spam: [
    "win a free prize now",
    "free money claim your prize today",
    "limited offer win cash now",
    "claim free gift card now",
    "cheap loans win money fast",
  ],
  ham: [
    "meeting moved to monday morning",
    "can you review the report today",
    "lunch with the team on friday",
    "please send the project report",
    "call me about the meeting now",
  ],
};

const tokenize = (s) => s.toLowerCase().match(/[a-z]+/g) || [];

const MODEL = (() => {
  const counts = { spam: {}, ham: {} };
  const totals = { spam: 0, ham: 0 };
  const vocab = new Set();
  Object.entries(CORPUS).forEach(([c, docs]) =>
    docs.forEach((d) =>
      tokenize(d).forEach((w) => {
        counts[c][w] = (counts[c][w] || 0) + 1;
        totals[c] += 1;
        vocab.add(w);
      }),
    ),
  );
  return { counts, totals, vocab, V: vocab.size };
})();

const EXAMPLES = ["claim your free prize now", "please review the report", "free lunch with the team on friday", "win free cash meeting"];

function SpamFilter() {
  const [msg, setMsg] = useState(EXAMPLES[0]);
  const [alpha, setAlpha] = useState(1);

  const res = useMemo(() => {
    const { counts, totals, vocab, V } = MODEL;
    const words = tokenize(msg);
    const known = words.filter((w) => vocab.has(w));
    const unknown = words.filter((w) => !vocab.has(w));
    const p = (w, c) => ((counts[c][w] || 0) + alpha) / (totals[c] + alpha * V);
    const rows = known.map((w) => {
      const ps = p(w, "spam");
      const ph = p(w, "ham");
      return { w, cs: counts.spam[w] || 0, ch: counts.ham[w] || 0, ps, ph, llr: Math.log(ps) - Math.log(ph) };
    });
    const prior = Math.log(0.5) - Math.log(0.5);
    let logOdds = prior;
    let spamZero = false;
    let hamZero = false;
    rows.forEach((r) => {
      if (r.ps === 0) spamZero = true;
      if (r.ph === 0) hamZero = true;
      if (r.ps > 0 && r.ph > 0) logOdds += r.llr;
    });
    let post;
    if (spamZero && hamZero) post = NaN;
    else if (spamZero) post = 0;
    else if (hamZero) post = 1;
    else post = 1 / (1 + Math.exp(-logOdds));
    return { rows, unknown, logOdds, post, spamZero, hamZero };
  }, [msg, alpha]);

  const maxAbs = Math.max(1, ...res.rows.map((r) => (Number.isFinite(r.llr) ? Math.abs(r.llr) : 0)));
  const verdict = Number.isNaN(res.post) ? "undefined (0 ÷ 0)" : res.post >= 0.5 ? "SPAM" : "not spam";

  return (
    <Panel tone="indigo" title="A spam filter trained on ten emails">
      <details className="mb-4 text-xs text-gray-400">
        <summary className="cursor-pointer text-indigo-300">Show the training emails ({MODEL.V} distinct words)</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {Object.entries(CORPUS).map(([c, docs]) => (
            <div key={c} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className={`font-semibold mb-1 ${c === "spam" ? "text-rose-300" : "text-emerald-300"}`}>{c} ({MODEL.totals[c]} words)</div>
              {docs.map((d) => (
                <div key={d} className="font-mono">"{d}"</div>
              ))}
            </div>
          ))}
        </div>
      </details>

      <label className="block mb-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Type a message</span>
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="w-full mt-1 bg-black/50 border border-white/15 rounded-lg px-3 py-2 font-mono text-sm text-white"
        />
      </label>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {EXAMPLES.map((e) => (
          <button key={e} onClick={() => setMsg(e)} className="px-2.5 py-1 rounded-md text-[0.6875rem] border border-white/10 bg-white/5 text-gray-400 hover:text-white">
            {e}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 mb-3">
        <table className="w-full text-xs sm:text-sm font-mono min-w-[520px]">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="p-2 font-normal">word</th>
              <th className="p-2 font-normal">in spam</th>
              <th className="p-2 font-normal">in ham</th>
              <th className="p-2 font-normal">P(w|spam)</th>
              <th className="p-2 font-normal">P(w|ham)</th>
              <th className="p-2 font-normal w-40">evidence</th>
            </tr>
          </thead>
          <tbody>
            {res.rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-2 text-white">{r.w}</td>
                <td className="p-2 text-rose-300">{r.cs}</td>
                <td className="p-2 text-emerald-300">{r.ch}</td>
                <td className={`p-2 ${r.ps === 0 ? "text-amber-300" : "text-gray-300"}`}>{r.ps.toFixed(3)}</td>
                <td className={`p-2 ${r.ph === 0 ? "text-amber-300" : "text-gray-300"}`}>{r.ph.toFixed(3)}</td>
                <td className="p-2">
                  {Number.isFinite(r.llr) ? (
                    <div className="relative h-3 bg-white/5 rounded">
                      <div className="absolute top-0 bottom-0 w-px bg-white/30 left-1/2" />
                      <div
                        className={`absolute top-0 bottom-0 rounded ${r.llr >= 0 ? "bg-rose-400/80" : "bg-emerald-400/80"}`}
                        style={r.llr >= 0 ? { left: "50%", width: `${(r.llr / maxAbs) * 50}%` } : { right: "50%", width: `${(-r.llr / maxAbs) * 50}%` }}
                      />
                    </div>
                  ) : (
                    <span className="text-amber-300">{r.llr > 0 ? "+∞ spam" : "−∞ ham"}</span>
                  )}
                </td>
              </tr>
            ))}
            {res.rows.length === 0 && (
              <tr><td colSpan="6" className="p-3 text-gray-500">No known words yet — the prior (50/50) is all the model has.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {res.unknown.length > 0 && (
        <div className="text-[0.6875rem] text-gray-500 mb-3">Ignored, never seen in training: {res.unknown.join(", ")}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
        <Slider label="Laplace smoothing α" value={alpha} min={0} max={2} step={0.1} onChange={setAlpha} format={(v) => v.toFixed(1)} />
        <div className="grid grid-cols-2 gap-2 sm:w-72">
          <Metric label="P(spam | message)" value={Number.isNaN(res.post) ? "—" : pct(res.post)} tone={res.post >= 0.5 ? "rose" : "emerald"} />
          <Metric label="Verdict" value={verdict} tone={res.post >= 0.5 ? "rose" : "emerald"} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Each bar is log P(w|spam) − log P(w|ham): how much that word pushes toward spam (right, rose) or ham (left,
        green). Naive Bayes just adds them up. Now pick <em>win free cash meeting</em> and drag α to 0. "meeting" never
        appeared in spam and "win" never appeared in ham, so each word rules a whole class out and the model is left
        dividing zero by zero. One unseen word should not veto all the other evidence — that is the zero-frequency
        problem, and adding α to every count (Laplace smoothing) is the fix.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Gaussian Naive Bayes on one continuous feature, with a movable prior.
--------------------------------------------------------------------------- */

function GaussianLab() {
  const [prior, setPrior] = useState(50);
  const [x, setX] = useState(170);
  const A = { mu: 150, sd: 18, name: "apple", color: "#34d399" };
  const O = { mu: 195, sd: 24, name: "orange", color: "#fbbf24" };
  const pO = prior / 100;
  const post = (v) => {
    const a = (1 - pO) * normPdf(v, A.mu, A.sd);
    const o = pO * normPdf(v, O.mu, O.sd);
    return o / (a + o);
  };
  // Decision boundary: where the posterior crosses 0.5 between the two means
  let boundary = null;
  for (let v = 100; v <= 260; v += 0.25) {
    if (post(v) >= 0.5) {
      boundary = v;
      break;
    }
  }
  const W = 360;
  const H = 190;
  const lo = 90;
  const hi = 270;
  const sx = (v) => 10 + ((v - lo) / (hi - lo)) * (W - 20);
  const peak = 0.95 * Math.max(normPdf(A.mu, A.mu, A.sd), normPdf(O.mu, O.mu, O.sd)); // tallest curve the prior allows
  const syD = (y) => 110 - (y / peak) * 90;
  const syP = (p) => 180 - p * 50;
  const path = (f, sy) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const v = lo + ((hi - lo) * i) / 120;
      d += `${i ? "L" : "M"}${sx(v).toFixed(1)},${sy(f(v)).toFixed(1)}`;
    }
    return d;
  };

  return (
    <Panel tone="amber" title="Gaussian Naive Bayes — apples or oranges by weight">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <path d={path((v) => (1 - pO) * normPdf(v, A.mu, A.sd), syD)} fill="none" stroke={A.color} strokeWidth="2" />
        <path d={path((v) => pO * normPdf(v, O.mu, O.sd), syD)} fill="none" stroke={O.color} strokeWidth="2" />
        <text x={sx(A.mu)} y="14" fill={A.color} fontSize="11" textAnchor="middle">apple × prior</text>
        <text x={sx(O.mu) + 20} y="28" fill={O.color} fontSize="11" textAnchor="middle">orange × prior</text>
        <line x1="10" y1="110" x2={W - 10} y2="110" stroke="rgba(255,255,255,0.15)" />
        <path d={path(post, syP)} fill="none" stroke="#a78bfa" strokeWidth="2" />
        <line x1="10" y1={syP(0.5)} x2={W - 10} y2={syP(0.5)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
        <text x="12" y={syP(1) - 3} fill="#a78bfa" fontSize="11">P(orange | weight)</text>
        {boundary && <line x1={sx(boundary)} y1="4" x2={sx(boundary)} y2="182" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="5 3" />}
        <line x1={sx(x)} y1="4" x2={sx(x)} y2="182" stroke="#e5e7eb" strokeWidth="2" />
        <circle cx={sx(x)} cy={syP(post(x))} r="4.5" fill="#e5e7eb" />
      </svg>
      <div className="flex justify-between text-[0.6875rem] text-gray-500 mb-4 max-w-xl"><span>90 g</span><span>180 g</span><span>270 g</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="amber" label="Fruit weight" value={x} min={100} max={260} onChange={setX} format={(v) => `${v} g`} />
        <Slider tone="amber" label="Share of oranges in the crate (prior)" value={prior} min={5} max={95} onChange={setPrior} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="P(orange | weight)" value={pct(post(x))} tone="amber" />
        <Metric label="Prediction" value={post(x) >= 0.5 ? "orange" : "apple"} />
        <Metric label="Boundary" value={boundary ? `${fmt(boundary, 0)} g` : "—"} tone="rose" sub="pink dashed line" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Gaussian NB fits one mean and one variance per class per feature. The class curves are those densities scaled
        by the prior. Make oranges rare (drag the prior to 10%) and the boundary slides right: a fruit has to be much
        heavier before "orange" wins. That is the prior doing its job.
      </p>
    </Panel>
  );
}

const VARIANTS = [
  { n: "MultinomialNB", tone: "indigo", d: "Word counts or other count features. The classic text classifier and the model in the spam filter above." },
  { n: "BernoulliNB", tone: "blue", d: "Binary features: is the word present or not. Also penalises the absence of words, which helps on short texts." },
  { n: "GaussianNB", tone: "amber", d: "Continuous features, each assumed normal within a class. Fast baseline for small tabular datasets." },
  { n: "ComplementNB", tone: "purple", d: "Estimates each class from all the other classes' data. More stable than Multinomial on imbalanced text data." },
  { n: "CategoricalNB", tone: "emerald", d: "Categorical features with a few levels each (colour, city, plan), without one-hot encoding." },
];

export default function MlNaiveBayes() {
  const toc = [
    { label: "Bayes' Theorem", hash: "bayes" },
    { label: "The Medical Test Puzzle", hash: "puzzle" },
    { label: "From Bayes to a Classifier", hash: "classifier" },
    { label: "Build a Spam Filter", hash: "spam" },
    { label: "Gaussian Naive Bayes", hash: "gaussian" },
    { label: "Variants", hash: "variants" },
    { label: "Why 'Naive' Still Works", hash: "why" },
    { label: "In Code", hash: "code" },
    { label: "When to Use It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="Naive Bayes"
      intro="A classifier built directly on Bayes' theorem, with one bold simplification: treat every feature as independent given the class. It trains in a single pass, needs little data, and is still a strong baseline for text."
      toc={toc}
    >
      <Section id="bayes" title="Bayes' Theorem" lead="Bayes' theorem turns 'how likely is this evidence if the hypothesis is true?' into 'how likely is the hypothesis, now that I have seen the evidence?'.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm sm:text-base text-gray-200 text-center mb-5">
          P(class | data) = P(data | class) · P(class) / P(data)
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card title="Posterior" tone="purple"><p>P(class | data) — what you want: the class probability after seeing the features.</p></Card>
          <Card title="Likelihood" tone="indigo"><p>P(data | class) — how typical these features are for that class. Learned from training data.</p></Card>
          <Card title="Prior" tone="amber"><p>P(class) — how common the class is before looking. The class frequencies in training.</p></Card>
          <Card title="Evidence" tone="teal"><p>P(data) — the same for every class, so for choosing a class it can be ignored.</p></Card>
        </div>
      </Section>

      <Section id="puzzle" title="The Medical Test Puzzle" lead="The best way to feel what a prior does.">
        <TestPuzzle />
      </Section>

      <Section id="classifier" title="From Bayes to a Classifier" lead="For a classifier, the 'data' is a feature vector x₁ … xₙ. Estimating P(x₁, …, xₙ | class) directly is hopeless — with 1,000 vocabulary words there are 2¹⁰⁰⁰ possible combinations. So Naive Bayes assumes the features are independent within each class:">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 text-center mb-5 overflow-x-auto">
          P(class | x) ∝ P(class) · P(x₁|class) · P(x₂|class) · … · P(xₙ|class)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Training is counting" tone="emerald"><p>For each class, count how often each feature value appears. No gradient descent, no iterations — one pass over the data.</p></Card>
          <Card title="Predict with logs" tone="indigo"><p>Multiplying hundreds of small probabilities underflows to zero, so implementations add log-probabilities instead.</p></Card>
          <Card title="Pick the largest" tone="purple"><p>Compute the score for every class and choose the highest. Normalise the scores if you want probabilities.</p></Card>
        </div>
      </Section>

      <Section id="spam" title="Build a Spam Filter" lead="Multinomial Naive Bayes, computed in full on a tiny training set. Every number in the table comes from counting words in the ten training emails.">
        <SpamFilter />
      </Section>

      <Section id="gaussian" title="Gaussian Naive Bayes" lead="For continuous features, replace word counts with a normal distribution per class.">
        <GaussianLab />
      </Section>

      <Section id="variants" title="Variants" lead="The same recipe with a different model for P(feature | class).">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VARIANTS.map((v) => (
            <Card key={v.n} title={v.n} tone={v.tone}><p>{v.d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="why" title="Why 'Naive' Still Works" lead="Words in an email are obviously not independent — 'free' and 'prize' travel together. Naive Bayes classifies well anyway.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="Ranking survives, calibration does not" tone="emerald">
            <p>Correlated features get counted twice, pushing scores to extremes. The <em>order</em> of the classes usually stays right, so accuracy is fine — but the probabilities are overconfident. Type "free free free" into the filter above and watch.</p>
          </Card>
          <Card title="Low variance" tone="indigo">
            <p>So few parameters that it rarely overfits, which is why it often beats more flexible models when you have only hundreds of examples.</p>
          </Card>
        </div>
        <Note tone="amber">
          If you need trustworthy probabilities — for thresholds or risk scores — wrap the model in{" "}
          <span className="font-mono">CalibratedClassifierCV</span>, or use{" "}
          <a href="#/ml/logistic-regression" className="text-blue-400 hover:underline">logistic regression</a>, which
          learns feature weights jointly and handles correlated features properly.
        </Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

emails = ["win a free prize now", "meeting moved to monday morning", ...]
labels = ["spam", "ham", ...]

spam_filter = make_pipeline(
    CountVectorizer(lowercase=True, ngram_range=(1, 2)),   # word + bigram counts
    MultinomialNB(alpha=1.0),                              # alpha = Laplace smoothing
)
spam_filter.fit(emails, labels)

spam_filter.predict(["claim your free prize"])          # ['spam']
spam_filter.predict_proba(["claim your free prize"])    # overconfident — see above

# Which words carry the most spam evidence?
vec, nb = spam_filter.named_steps.values()
log_ratio = nb.feature_log_prob_[1] - nb.feature_log_prob_[0]   # classes sorted: ham, spam
top = log_ratio.argsort()[-10:]
print(vec.get_feature_names_out()[top])

# Continuous features
gnb = GaussianNB()               # learns a mean and variance per class per feature
print(cross_val_score(gnb, X_numeric, y, cv=5).mean())`}
        />
      </Section>

      <Section id="when" title="When to Use It">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Good fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Text classification: spam, sentiment, topic, support-ticket routing.</li>
              <li>Very small training sets, or a baseline you need in minutes.</li>
              <li>High-dimensional sparse data with many features.</li>
              <li>Streaming data — counts update incrementally with <span className="font-mono">partial_fit</span>.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Poor fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>When you need calibrated probabilities out of the box.</li>
              <li>Strongly interacting features, where the combination matters more than each alone.</li>
              <li>Large tabular datasets — gradient-boosted trees will usually win.</li>
              <li>Continuous features that are far from normal, with GaussianNB.</li>
            </ul>
          </div>
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-classic")} />
    </GuideLayout>
  );
}

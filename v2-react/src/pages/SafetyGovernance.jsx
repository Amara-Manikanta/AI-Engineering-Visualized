import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { normCdf, pct, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "responsible AI", "AI governance", "fairness", "bias audit", "demographic parity", "equal opportunity",
  "equalized odds", "disparate impact", "privacy", "PII", "differential privacy", "epsilon", "Laplace mechanism",
  "federated learning", "watermarking", "LLM watermark", "green list", "C2PA", "content credentials", "provenance",
  "EU AI Act", "high-risk AI", "general-purpose AI", "NIST AI RMF", "ISO 42001", "model cards", "datasheets",
  "copyright", "model licence", "AI regulation",
];

/* ---------------------------------------------------------------------------
   Fairness with two groups whose base rates differ. Scores are N(0,1) for
   negatives and N(2,1) for positives in both groups; each group has its own
   threshold. All rates are exact normal CDFs.
--------------------------------------------------------------------------- */

const GROUPS = { A: { base: 0.5 }, B: { base: 0.25 } };
const SEP = 2;

function rates(t, base) {
  const tpr = 1 - normCdf(t - SEP);
  const fpr = 1 - normCdf(t);
  return { tpr, fpr, sel: base * tpr + (1 - base) * fpr, prec: (base * tpr) / (base * tpr + (1 - base) * fpr) };
}

function solveThreshold(target, f) {
  let lo = -4;
  let hi = 6;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function FairnessLab() {
  const [tA, setTA] = useState(1);
  const [tB, setTB] = useState(1);
  const a = rates(tA, GROUPS.A.base);
  const b = rates(tB, GROUPS.B.base);
  const gap = (x, y) => Math.abs(x - y);
  const row = (label, x, y, what) => (
    <tr className="border-t border-white/5">
      <td className="p-2 text-gray-300">{label}<div className="text-[0.625rem] text-gray-500">{what}</div></td>
      <td className="p-2 font-mono text-indigo-200">{pct(x)}</td>
      <td className="p-2 font-mono text-amber-200">{pct(y)}</td>
      <td className={`p-2 font-mono ${gap(x, y) < 0.02 ? "text-emerald-300" : "text-rose-300"}`}>{gap(x, y) < 0.02 ? "≈ equal" : `gap ${pct(gap(x, y))}`}</td>
    </tr>
  );
  return (
    <Panel tone="indigo" title="Loan approvals for two groups: pick your fairness definition">
      <p className="text-sm text-gray-400 mb-4">
        The model is equally accurate for both groups, but 50% of group A would repay versus 25% of group B. Each group
        gets its own approval threshold.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left text-xs">
              <tr><th className="p-2 font-normal">Criterion</th><th className="p-2 font-normal">Group A</th><th className="p-2 font-normal">Group B</th><th className="p-2 font-normal" /></tr>
            </thead>
            <tbody>
              {row("Selection rate", a.sel, b.sel, "demographic parity: approve equal shares")}
              {row("True positive rate", a.tpr, b.tpr, "equal opportunity: equal chance for qualified applicants")}
              {row("False positive rate", a.fpr, b.fpr, "with TPR: equalised odds")}
              {row("Precision", a.prec, b.prec, "predictive parity: approvals equally reliable")}
            </tbody>
          </table>
        </div>
        <div className="space-y-3">
          <Slider label="Threshold, group A" value={tA} min={-1} max={3} step={0.02} onChange={setTA} format={(v) => v.toFixed(2)} />
          <Slider tone="amber" label="Threshold, group B" value={tB} min={-1} max={3} step={0.02} onChange={setTB} format={(v) => v.toFixed(2)} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setTA(1); setTB(1); }}>Same threshold</Button>
            <Button tone="emerald" onClick={() => setTB(solveThreshold(a.sel, (t) => rates(t, GROUPS.B.base).sel))}>Equal selection</Button>
            <Button tone="purple" onClick={() => setTB(solveThreshold(a.tpr, (t) => rates(t, GROUPS.B.base).tpr))}>Equal TPR</Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Try each button. One shared threshold gives equal true- and false-positive rates but very different
        approval shares and precision. Forcing equal selection breaks equal opportunity; equalising TPR breaks
        demographic parity and precision. When base rates differ, these criteria cannot all hold at once (a known
        impossibility result), so choosing one is a policy decision about which error matters — to be made with
        domain experts and affected people, and documented — not a purely technical setting.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Differential privacy: release a count with Laplace noise of scale 1/ε.
   Compare the output distribution with and without one person in the data.
--------------------------------------------------------------------------- */

const laplace = (x, mu, b) => Math.exp(-Math.abs(x - mu) / b) / (2 * b);

function PrivacyLab() {
  const [eps, setEps] = useState(0.5);
  const b = 1 / eps;
  const n = 120;
  const W = 360;
  const H = 150;
  const lo = n - 12;
  const hi = n + 13;
  const sx = (x) => 10 + ((x - lo) / (hi - lo)) * (W - 20);
  const peak = laplace(0, 0, b);
  const sy = (y) => H - 20 - (y / peak) * (H - 34);
  const path = (mu) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = lo + ((hi - lo) * i) / 160;
      d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(laplace(x, mu, b)).toFixed(1)}`;
    }
    return d;
  };
  return (
    <Panel tone="emerald" title="Differential privacy: noisy enough that one person cannot be detected">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <path d={path(n)} fill="rgba(52,211,153,0.15)" stroke="#34d399" strokeWidth="2" />
          <path d={path(n + 1)} fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="10" y1={H - 20} x2={W - 10} y2={H - 20} stroke="rgba(255,255,255,0.2)" />
          <text x={sx(n)} y={H - 6} fill="#6b7280" fontSize="10" textAnchor="middle">{n}</text>
          <text x="12" y="14" fill="#34d399" fontSize="10">released count, you are not in the data (true = 120)</text>
          <text x="12" y="28" fill="#fbbf24" fontSize="10">released count, you are in it (true = 121)</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="emerald" label="Privacy budget ε" value={eps} min={0.05} max={3} step={0.05} onChange={setEps} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Noise scale 1/ε" value={fmt(b, 1)} tone="emerald" sub="typical error ± this" />
            <Metric label="Max likelihood ratio" value={`e^ε = ${fmt(Math.exp(eps), 2)}`} sub="how much any output can favour one world" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        An analyst sees only the noisy count. The two curves are the output distributions with and without you;
        where they overlap, no output can reveal whether you took part. The guarantee is that any output is at most
        e^ε times more likely in one world than the other. Small ε means strong privacy and noisy answers; large ε
        means accurate answers and weaker protection. The same idea, applied to gradients during training
        (DP-SGD), bounds how much a model can memorise any one record.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Green-list watermark detection (Kirchenbauer et al., 2023): a watermarked
   generator favours a pseudo-random "green" subset of tokens; the detector
   counts green tokens and computes a z-score.
--------------------------------------------------------------------------- */

function WatermarkLab() {
  const [tokens, setTokens] = useState(200);
  const [green, setGreen] = useState(0.4);
  const gamma = 0.25;
  const g = Math.round(green * tokens);
  const z = (g - gamma * tokens) / Math.sqrt(tokens * gamma * (1 - gamma));
  const flagged = z > 4;
  return (
    <Panel tone="amber" title="Detecting a text watermark with a z-test">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-5 items-center">
        <div className="space-y-4">
          <Slider tone="amber" label="Tokens in the text" value={tokens} min={10} max={600} step={10} onChange={setTokens} />
          <Slider tone="amber" label="Share of 'green' tokens observed" value={green} min={0.15} max={0.7} step={0.01} onChange={setGreen} format={(v) => pct(v, 0)} />
          <p className="text-xs text-gray-400 m-0">Unwatermarked text lands on green about 25% of the time by chance; a watermarked generator pushes that higher. Editing or paraphrasing pulls it back toward 25%.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Green tokens" value={`${g} / ${tokens}`} />
          <Metric label="z-score" value={fmt(z, 1)} tone={flagged ? "rose" : "emerald"} sub={flagged ? "watermarked (z > 4)" : "not detected"} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        At each step the previous token seeds a random split of the vocabulary; the generator adds a small bonus to
        the green half. A detector with the key recomputes the splits and counts. With 40% green tokens, 50 tokens
        are not enough evidence but 200 are overwhelming — detection needs length. Short texts, heavy editing and
        paraphrasing weaken it, which is why watermarks are one provenance signal, not proof.
      </p>
    </Panel>
  );
}

export default function SafetyGovernance() {
  const toc = [
    { label: "What Responsible AI Covers", hash: "scope" },
    { label: "Fairness", hash: "fairness" },
    { label: "Privacy", hash: "privacy" },
    { label: "Provenance & Watermarking", hash: "provenance" },
    { label: "Regulation & Standards", hash: "regulation" },
    { label: "Documentation", hash: "documentation" },
    { label: "A Practical Checklist", hash: "checklist" },
  ];

  return (
    <GuideLayout
      title="Responsible AI & Governance"
      intro="The parts of building AI that are not about accuracy: measuring and choosing fairness criteria, protecting personal data with differential privacy, marking generated content, and the regulations and standards — EU AI Act, NIST AI RMF, ISO 42001 — that increasingly require all of it."
      toc={toc}
    >
      <Section id="scope" title="What Responsible AI Covers" lead="A system can be accurate on average and still harm specific groups, leak personal data, mislead people about what is synthetic, or break the law. Governance is the process that catches these before and after launch.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Fairness" tone="indigo"><p>Errors and outcomes should not fall unjustly on particular groups.</p></Card>
          <Card title="Privacy" tone="emerald"><p>Personal data is minimised, protected, and not memorised or leaked by models.</p></Card>
          <Card title="Transparency" tone="amber"><p>People know when they deal with AI or AI-generated content, and decisions can be explained.</p></Card>
          <Card title="Accountability" tone="rose"><p>Someone owns each system, its risks are assessed, and there is a way to contest outcomes.</p></Card>
        </div>
        <Note tone="indigo">For alignment, jailbreaks and red teaming see <a href="#/safety" className="text-blue-400 hover:underline">Safety & Alignment</a> and <a href="#/safety/red-teaming" className="text-blue-400 hover:underline">Red Teaming & Prompt Injection</a>.</Note>
      </Section>

      <Section id="fairness" title="Fairness" lead="There is no single definition of a fair classifier. The common ones conflict, and the lab shows why.">
        <FairnessLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Measure by group" tone="indigo"><p>Report error rates, selection rates and calibration per group — including intersections — not only overall accuracy.</p></Card>
          <Card title="Look upstream" tone="amber"><p>Most unfairness comes from data: who is under-represented, whose labels reflect past biased decisions, which proxies (postcode, name) stand in for protected attributes. See <a href="#/ml/data-sourcing" className="text-blue-400 hover:underline">Data Sourcing</a>.</p></Card>
          <Card title="LLMs too" tone="purple"><p>Test generative systems with paired prompts that differ only in a name, gender or dialect, and compare the outputs.</p></Card>
        </div>
      </Section>

      <Section id="privacy" title="Privacy">
        <PrivacyLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Minimise & redact PII" tone="emerald"><p>Detect and strip or mask personal data before it reaches training sets, logs, prompts and vector stores. Collect only what the task needs.</p></Card>
          <Card title="Federated learning" tone="indigo"><p>Train where the data lives — phones, hospitals — and share only model updates, often combined with secure aggregation and differential privacy.</p></Card>
          <Card title="Memorisation" tone="rose"><p>Large models can reproduce rare training strings verbatim. Deduplicate data, filter secrets, and test for extraction.</p></Card>
        </div>
      </Section>

      <Section id="provenance" title="Provenance & Watermarking">
        <WatermarkLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <Card title="Content credentials (C2PA)" tone="amber"><p>Cryptographically signed metadata that records how a file was created and edited. Robust when preserved, but easily stripped by re-encoding or screenshots.</p></Card>
          <Card title="Invisible watermarks (Google SynthID)" tone="indigo"><p>Signals embedded in the pixels, audio or token choices themselves (such as Google DeepMind's SynthID). They survive more transformations than metadata without warping text quality or perplexity. <a href="#/radar?issue=21" className="text-indigo-400 hover:underline font-semibold block mt-1.5">Read our deep dive: Google SynthID in AI Engineering Radar →</a></p></Card>
        </div>
      </Section>

      <Section id="regulation" title="Regulation & Standards" lead="An overview for orientation, not legal advice. Rules and timelines change; confirm current requirements for your jurisdiction.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="EU AI Act" tone="indigo">
            <p>A risk-based law. <strong>Unacceptable</strong> uses (such as social scoring) are banned; <strong>high-risk</strong> systems (in hiring, credit, education, critical infrastructure and similar) need risk management, data governance, logging, human oversight and conformity assessment; <strong>limited-risk</strong> systems carry transparency duties (disclose chatbots and deepfakes); the rest is minimal risk. Providers of general-purpose AI models have their own documentation and copyright obligations.</p>
            <p>It entered into force in August 2024 with obligations phasing in over several years — prohibitions first, then general-purpose model duties, then high-risk requirements. Check the current timeline, as parts have been under revision.</p>
          </Card>
          <Card title="NIST AI Risk Management Framework" tone="emerald"><p>A voluntary US framework organised around four functions — <strong>Govern, Map, Measure, Manage</strong> — with a companion profile for generative AI. Widely used as the structure for internal AI risk programmes.</p></Card>
          <Card title="ISO/IEC 42001" tone="purple"><p>A certifiable management-system standard for AI, in the style of ISO 27001 for security: policies, roles, risk assessment and continual improvement for an organisation's AI.</p></Card>
          <Card title="Everything else still applies" tone="amber"><p>Data protection (GDPR and similar), anti-discrimination, consumer protection, sector rules in finance and health, and copyright all apply to AI systems, whatever AI-specific rules exist.</p></Card>
        </div>
      </Section>

      <Section id="documentation" title="Documentation">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Model cards" tone="indigo"><p>Intended use, out-of-scope uses, training data summary, evaluation results broken down by group, known limitations.</p></Card>
          <Card title="Datasheets for datasets" tone="emerald"><p>Why and how the data was collected, who is in it, consent and licensing, known gaps and biases.</p></Card>
          <Card title="System cards & impact assessments" tone="amber"><p>For a deployed product: risks identified, mitigations, red-team findings, monitoring plan, and who to contact.</p></Card>
        </div>
      </Section>

      <Section id="checklist" title="A Practical Checklist">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["Classify the use", "Is it in a high-risk domain? Who could be harmed, and how?"],
            ["Name an owner", "One accountable person or team per system."],
            ["Test by group", "Per-group error rates and paired-prompt tests before launch."],
            ["Protect data", "PII redaction, retention limits, access controls on logs and vector stores."],
            ["Disclose", "Tell users when they interact with AI or see generated content."],
            ["Keep a human path", "Appeals, overrides and escalation for consequential decisions."],
            ["Monitor after launch", "Drift, complaints and incidents — with a way to roll back."],
            ["Write it down", "Model card, data sheet and risk assessment, kept current."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("safety-governance")} />
    </GuideLayout>
  );
}

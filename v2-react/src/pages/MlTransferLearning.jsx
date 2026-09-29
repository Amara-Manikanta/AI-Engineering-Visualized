import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { rng, randn, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "transfer learning", "pretraining", "fine-tuning", "feature extraction", "frozen backbone", "linear probe",
  "domain adaptation", "self-supervised learning", "SSL", "contrastive learning", "SimCLR", "CLIP",
  "masked modelling", "masked language modelling", "BERT", "MAE", "next-token prediction", "representation learning",
  "embeddings", "few labels", "label efficiency", "foundation models",
];

/* ---------------------------------------------------------------------------
   200-dimensional data whose class signal lives in a hidden 3-D subspace,
   buried in noise. "Pretraining" = learn that subspace from 2,000 unlabelled
   points (top principal components). Then train logistic regression with n
   labels on raw features vs the learned 3-D representation.
--------------------------------------------------------------------------- */

const D = 200;
const K = 3;

const WORLD = (() => {
  const r = rng(31);
  // A random orthonormal 3-D basis inside 200-D (Gram–Schmidt).
  const basis = [];
  for (let k = 0; k < K; k++) {
    let v = Array.from({ length: D }, () => randn(r));
    basis.forEach((b) => {
      const d = v.reduce((s, x, i) => s + x * b[i], 0);
      v = v.map((x, i) => x - d * b[i]);
    });
    const n = Math.hypot(...v);
    basis.push(v.map((x) => x / n));
  }
  const sample = (n) =>
    Array.from({ length: n }, () => {
      const z = [randn(r) * 3, randn(r) * 3, randn(r) * 3];
      const label = z[0] + 0.8 * z[1] - 0.5 * z[2] + randn(r) * 0.3 > 0 ? 1 : 0;
      const x = Array.from({ length: D }, (_, i) => z[0] * basis[0][i] + z[1] * basis[1][i] + z[2] * basis[2][i] + randn(r) * 1.6);
      return { x, label };
    });
  return { unlabelled: sample(2000), train: sample(400), test: sample(1000) };
})();

// Top-K principal directions by power iteration with deflation.
const ENCODER = (() => {
  const X = WORLD.unlabelled.map((p) => p.x);
  const mean = Array.from({ length: D }, (_, j) => X.reduce((s, x) => s + x[j], 0) / X.length);
  const C = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => X.reduce((s, x) => s + (x[i] - mean[i]) * (x[j] - mean[j]), 0) / (X.length - 1)));
  const r = rng(2);
  const comps = [];
  for (let k = 0; k < K; k++) {
    let v = Array.from({ length: D }, () => r() - 0.5);
    for (let it = 0; it < 200; it++) {
      let w = C.map((row) => row.reduce((s, c, j) => s + c * v[j], 0));
      comps.forEach((u) => {
        const d = w.reduce((s, x, i) => s + x * u[i], 0);
        w = w.map((x, i) => x - d * u[i]);
      });
      const n = Math.hypot(...w);
      v = w.map((x) => x / n);
    }
    comps.push(v);
  }
  return (x) => comps.map((u) => u.reduce((s, c, i) => s + c * (x[i] - mean[i]), 0));
})();

function trainLogistic(rows, dim, epochs = 300, lr = 0.1, l2 = 0.01) {
  const w = new Array(dim).fill(0);
  let b = 0;
  for (let e = 0; e < epochs; e++) {
    const gw = new Array(dim).fill(0);
    let gb = 0;
    rows.forEach(({ f, label }) => {
      const z = f.reduce((s, x, i) => s + x * w[i], b);
      const p = 1 / (1 + Math.exp(-z));
      const err = p - label;
      for (let i = 0; i < dim; i++) gw[i] += err * f[i];
      gb += err;
    });
    for (let i = 0; i < dim; i++) w[i] -= lr * (gw[i] / rows.length + l2 * w[i]);
    b -= (lr * gb) / rows.length;
  }
  return (f) => (f.reduce((s, x, i) => s + x * w[i], b) > 0 ? 1 : 0);
}

const accuracy = (predict, rows) => rows.filter((r) => predict(r.f) === r.label).length / rows.length;

function experiment(n) {
  const scaleRaw = (x) => x.map((v) => v / 3);
  const trainRaw = WORLD.train.slice(0, n).map((p) => ({ f: scaleRaw(p.x), label: p.label }));
  const testRaw = WORLD.test.map((p) => ({ f: scaleRaw(p.x), label: p.label }));
  const trainRep = WORLD.train.slice(0, n).map((p) => ({ f: ENCODER(p.x).map((v) => v / 3), label: p.label }));
  const testRep = WORLD.test.map((p) => ({ f: ENCODER(p.x).map((v) => v / 3), label: p.label }));
  return {
    raw: accuracy(trainLogistic(trainRaw, D), testRaw),
    rep: accuracy(trainLogistic(trainRep, K), testRep),
  };
}

const NS = [6, 10, 20, 40, 80, 160, 400];

function LabelEfficiencyLab() {
  const curve = useMemo(() => NS.map((n) => ({ n, ...experiment(n) })), []);
  const [idx, setIdx] = useState(1);
  const cur = curve[idx];
  const W = 360;
  const H = 170;
  const x = (n) => 26 + (Math.log(n / 6) / Math.log(400 / 6)) * (W - 40);
  const y = (a) => H - 22 - ((a - 0.5) / 0.5) * (H - 34);
  const line = (k) => curve.map((c, i) => `${i ? "L" : "M"}${x(c.n)},${y(c[k])}`).join("");
  return (
    <Panel tone="emerald" title="Pretrain on unlabelled data, then learn from a handful of labels">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <path d={line("raw")} fill="none" stroke="#94a3b8" strokeWidth="2" />
          <path d={line("rep")} fill="none" stroke="#34d399" strokeWidth="2.4" />
          {curve.map((c) => (
            <text key={c.n} x={x(c.n)} y={H - 6} fill="#6b7280" fontSize="10" textAnchor="middle">{c.n}</text>
          ))}
          {[0.5, 0.75, 1].map((a) => (
            <text key={a} x="22" y={y(a) + 3} fill="#6b7280" fontSize="9" textAnchor="end">{Math.round(a * 100)}%</text>
          ))}
          <line x1={x(cur.n)} y1="6" x2={x(cur.n)} y2={H - 22} stroke="#e5e7eb" strokeDasharray="3 3" />
          <text x={W - 8} y="14" fill="#34d399" fontSize="10" textAnchor="end">learned 3-D representation</text>
          <text x={W - 8} y="28" fill="#94a3b8" fontSize="10" textAnchor="end">raw 200-D features</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="emerald" label="Labelled examples" value={idx} min={0} max={NS.length - 1} onChange={setIdx} format={(v) => NS[v]} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Raw features" value={pct(cur.raw, 0)} />
            <Metric label="Pretrained features" value={pct(cur.rep, 0)} tone="emerald" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The class depends on three hidden factors spread across 200 noisy features. The “pretraining” step never sees
        a label: it learns from 2,000 unlabelled points which directions carry structure (here simply their top
        principal components). With that representation, logistic regression is accurate from very few labels;
        on the raw 200 features it needs many more examples to reach the same accuracy, and the two converge as
        labels become plentiful. Neither passes about 82%: that ceiling is the noise built into the problem. Large models do the same at vastly greater scale — which is why a pretrained
        backbone plus a few hundred labels routinely beats training from scratch on thousands.
      </p>
    </Panel>
  );
}

export default function MlTransferLearning() {
  const toc = [
    { label: "The Idea", hash: "idea" },
    { label: "Label Efficiency Lab", hash: "lab" },
    { label: "Ways to Transfer", hash: "ways" },
    { label: "Self-Supervised Learning", hash: "ssl" },
    { label: "Contrastive Learning", hash: "contrastive" },
    { label: "When Transfer Fails", hash: "fails" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Transfer & Self-Supervised Learning"
      intro="Why almost nobody trains from scratch any more: reuse what a model learned on huge unlabelled data, adapt it with a few labels, and the self-supervised objectives — masking, next-token prediction, contrastive learning — that make pretraining possible."
      toc={toc}
    >
      <Section id="idea" title="The Idea" lead="Labels are expensive; raw data is nearly free. Learn general-purpose representations from the raw data first, then spend your labels teaching only the task-specific part.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Pretrain once" tone="indigo"><p>A large model learns edges, textures and object parts from images, or grammar and facts from text — knowledge useful for many tasks.</p></Card>
          <Card title="Adapt many times" tone="emerald"><p>Reuse that backbone for your task with a small labelled set: a new classifier head, or light fine-tuning.</p></Card>
          <Card title="Foundation models" tone="purple"><p>LLMs, vision encoders and speech models are this idea taken to the extreme — one pretrained model, adapted to thousands of uses. See <a href="#/genai/fine-tuning" className="text-blue-400 hover:underline">Fine-tuning</a>.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Label Efficiency Lab" lead="A real experiment, run in your browser: representation learned without labels versus raw features.">
        <LabelEfficiencyLab />
      </Section>

      <Section id="ways" title="Ways to Transfer">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Feature extraction" tone="indigo"><p>Freeze the backbone, use its embeddings as inputs to a simple model (a “linear probe”). Fast, needs few labels, cannot adapt features.</p></Card>
          <Card title="Fine-tune the head, then more" tone="emerald"><p>Train the new head first, then unfreeze upper layers with a small learning rate. Lower layers hold generic features and change least.</p></Card>
          <Card title="Full fine-tuning" tone="amber"><p>Update everything. Best when you have plenty of in-domain data; risks forgetting (see <a href="#/genai/model-merging" className="text-blue-400 hover:underline">Forgetting</a>).</p></Card>
          <Card title="Parameter-efficient" tone="purple"><p>Train small adapters or LoRA matrices on a frozen model — near full fine-tuning quality at a fraction of the memory. See <a href="#/genai/peft" className="text-blue-400 hover:underline">PEFT</a>.</p></Card>
        </div>
      </Section>

      <Section id="ssl" title="Self-Supervised Learning" lead="Pretraining needs a training signal without human labels. Self-supervision creates one from the data itself, by hiding part of the input and predicting it.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Next-token prediction" tone="indigo"><p>Predict the next word from the ones before. The objective behind GPT-style LLMs — simple, and it scales.</p></Card>
          <Card title="Masked modelling" tone="purple"><p>Hide words (BERT) or image patches (MAE) and reconstruct them from context. Produces strong bidirectional encoders.</p></Card>
          <Card title="Contrastive & joint embedding" tone="emerald"><p>Pull two views of the same thing together and push different things apart — below.</p></Card>
        </div>
      </Section>

      <Section id="contrastive" title="Contrastive Learning">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Two views of one example" tone="indigo"><p>SimCLR-style methods take one image, make two random augmentations (crop, colour jitter, blur), and train the encoder so their embeddings match while differing from every other image in the batch.</p></Card>
          <Card title="Across modalities" tone="purple"><p>CLIP treats an image and its caption as the two views, producing a shared image–text space. Text-embedding models for <a href="#/rag/embeddings" className="text-blue-400 hover:underline">RAG</a> are trained the same way on (query, relevant passage) pairs.</p></Card>
        </div>
      </Section>

      <Section id="fails" title="When Transfer Fails">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Domain gap" tone="rose"><p>A model pretrained on web photos may transfer poorly to X-rays or satellite images. Domain-specific pretraining or continued pretraining on unlabelled in-domain data helps.</p></Card>
          <Card title="Negative transfer" tone="amber"><p>Sometimes the source task actively misleads. Always compare against a from-scratch baseline when data is plentiful.</p></Card>
          <Card title="Inherited bias" tone="indigo"><p>Whatever biases the pretraining data carried come along. Evaluate the adapted model on your population. See <a href="#/safety/governance" className="text-blue-400 hover:underline">Governance</a>.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import torch, torchvision

# Pretrained backbone, new head for 5 classes
model = torchvision.models.resnet50(weights="IMAGENET1K_V2")
for p in model.parameters():
    p.requires_grad = False                                # stage 1: freeze everything…
model.fc = torch.nn.Linear(model.fc.in_features, 5)       # …except a new head

opt = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)
train(model, opt, epochs=5)

# Stage 2: unfreeze the last block and fine-tune gently
for p in model.layer4.parameters():
    p.requires_grad = True
opt = torch.optim.AdamW([
    {"params": model.layer4.parameters(), "lr": 1e-5},
    {"params": model.fc.parameters(),     "lr": 1e-4},
])
train(model, opt, epochs=5)

# Text: frozen embeddings + a linear probe is often a strong baseline
# X = embedding_model.encode(texts); LogisticRegression().fit(X, labels)`}
        />
        <Note tone="indigo">Start with the linear probe. If it is nearly good enough, fine-tuning is rarely worth its cost.</Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-transfer")} />
    </GuideLayout>
  );
}

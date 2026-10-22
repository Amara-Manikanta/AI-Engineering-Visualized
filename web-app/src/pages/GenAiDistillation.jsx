import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Distillation's central trick is a softmax with a temperature divisor. The
   panel below computes softmax(z / T) for real logits and shows the entropy,
   so "dark knowledge" stops being a slogan and becomes a number that moves.
-------------------------------------------------------------------------- */

const CLASSES = [
  { n: "dog", z: 6.2 },
  { n: "wolf", z: 4.1 },
  { n: "cat", z: 1.4 },
  { n: "horse", z: -0.3 },
  { n: "car", z: -2.8 },
  { n: "boat", z: -3.5 },
];

const BARS = [
  "bg-emerald-500",
  "bg-emerald-600",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-600",
  "bg-rose-600",
];

function softmax(zs, T) {
  const scaled = zs.map((z) => z / T);
  const mx = Math.max(...scaled);
  const ex = scaled.map((s) => Math.exp(s - mx));
  const sum = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / sum);
}

function TemperaturePanel() {
  const [T, setT] = useState(1);

  const { probs, entropy, maxEntropy, top2Ratio } = useMemo(() => {
    const p = softmax(
      CLASSES.map((c) => c.z),
      T
    );
    const H = -p.reduce((a, x) => a + (x > 0 ? x * Math.log(x) : 0), 0);
    const sorted = [...p].sort((a, b) => b - a);
    return {
      probs: p,
      entropy: H,
      maxEntropy: Math.log(CLASSES.length),
      top2Ratio: sorted[0] / sorted[1],
    };
  }, [T]);

  return (
    <div className="rounded-2xl border border-teal-500/25 bg-teal-500/[0.07] p-6">
      <h3 className="text-teal-400 font-bold mb-1">Temperature, and what it exposes</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        These are one image's logits from a teacher network. At T = 1 the answer is "dog" and everything else rounds
        to nothing. Raise T and the teacher's real opinion appears: it thinks a wolf is a near miss and a boat is not.
        That comparative judgement is the signal a hard label throws away.
      </p>

      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">Temperature T</span>
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={T}
          onChange={(e) => setT(Number(e.target.value))}
          className="w-full mt-2 accent-teal-500"
        />
        <span className="font-mono text-teal-300 text-sm">{T.toFixed(1)}</span>
      </label>

      <div className="space-y-2 mb-5">
        {CLASSES.map((c, i) => (
          <div key={c.n} className="flex items-center gap-3">
            <div className="w-14 text-xs text-gray-400 text-right font-mono shrink-0">{c.n}</div>
            <div className="w-12 text-[0.625rem] text-gray-600 font-mono text-right shrink-0">z={c.z}</div>
            <div className="flex-1 h-6 bg-black/40 rounded-md overflow-hidden border border-white/5">
              <div
                className={`h-full ${BARS[i]} transition-all duration-200`}
                style={{ width: `${Math.max(probs[i] * 100, 0.4)}%` }}
              />
            </div>
            <div className="w-20 text-xs font-mono text-gray-300 text-right shrink-0">
              {probs[i] < 0.0001 ? probs[i].toExponential(1) : (probs[i] * 100).toFixed(2) + "%"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Entropy</div>
          <div className="text-2xl font-bold font-mono text-teal-300">{entropy.toFixed(3)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">max is {maxEntropy.toFixed(3)} for 6 classes</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Top vs runner-up</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{top2Ratio.toFixed(1)}×</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">how lopsided the answer is</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Signal in the tail</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {((1 - probs[0]) * 100).toFixed(1)}%
          </div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">probability mass outside the top class</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        At T = 1 almost all the mass sits on one class and the gradient carries almost no information about the
        others. Around T = 4 the wolf and cat probabilities become large enough to train on. Push T too high and
        everything flattens toward a uniform distribution, which is equally uninformative in the opposite direction.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const KINDS = [
  {
    n: "Response distillation",
    d: "Match the teacher's output distribution. The classic form, and the only one that works when the teacher is a black-box API — you can only see what it says.",
    box: "border-teal-500/25 bg-teal-500/[0.07]",
    label: "text-teal-400",
  },
  {
    n: "Feature distillation",
    d: "Match intermediate hidden states, not just the final layer. Richer signal, but needs white-box access and some way to align mismatched layer widths.",
    box: "border-blue-500/25 bg-blue-500/[0.07]",
    label: "text-blue-400",
  },
  {
    n: "Relational distillation",
    d: "Match the geometry: preserve the distances between examples in representation space rather than any individual output. Robust to architectural differences between teacher and student.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
];

export default function GenAiDistillation() {
  const toc = [
    { label: "The Idea", hash: "idea" },
    { label: "Dark Knowledge", hash: "dark" },
    { label: "The Loss Function", hash: "loss" },
    { label: "Kinds of Distillation", hash: "kinds" },
    { label: "Distilling LLMs", hash: "llms" },
    { label: "In Code", hash: "code" },
    { label: "What It Costs You", hash: "limits" },
  ];

  return (
    <GuideLayout
      title="Knowledge Distillation"
      intro="Train a small model to imitate a large one. It reliably beats training the same small model on the original labels — and the reason why is worth understanding."
      toc={toc}
    >
      <section id="idea" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A large teacher model is trained normally. A small student is then trained to reproduce the teacher's
          outputs rather than the ground-truth labels. The surprising and repeatable result is that the student ends
          up better than an identical model trained on the labels directly.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">unlabelled inputs</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-purple-900/20 border border-purple-500/40 rounded-full text-purple-300">teacher (large)</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-teal-900/20 border border-teal-500/40 rounded-full text-teal-300">soft targets</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">student (small)</span>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Note what the pipeline needs: unlabelled inputs. Distillation converts a labelling problem into an
            inference problem, which is usually the cheaper of the two.
          </p>
        </div>
      </section>

      <section id="dark" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Dark Knowledge</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A hard label says "this is a dog" and nothing more. The teacher's full distribution says "dog, and by the
          way this looks somewhat like a wolf and nothing like a boat". Those relative magnitudes encode what the
          teacher learned about how the classes relate — and they are what the student is really learning from.
        </p>
        <TemperaturePanel />
      </section>

      <section id="loss" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Loss Function</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Training combines two objectives: match the teacher's softened distribution, and get the ground-truth answer
          right when you have one.
        </p>
        <div className="p-5 rounded-xl border border-teal-500/25 bg-teal-500/[0.07] mb-5">
          <div className="font-mono text-sm text-teal-200 text-center mb-4">
            L = α · T² · KL(teacher_T ‖ student_T) + (1 − α) · CE(y, student)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
            <div>
              <div className="font-semibold text-white mb-1">The KL term</div>
              Pulls the student's softened distribution toward the teacher's. This is where dark knowledge transfers.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">The T² factor</div>
              Softening divides the logits by T, which shrinks the gradients by roughly T². Multiplying back keeps the
              two terms comparable when you change T.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">The CE term</div>
              Ordinary supervised loss against the real label. Drop it entirely when you have no labels, which is
              common for LLM distillation.
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Both distributions must use the same T.</strong> Softening only the teacher makes the KL term
            compare two different things and quietly wrecks training. At inference the student runs at T = 1 as
            normal.
          </p>
        </div>
      </section>

      <section id="kinds" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Kinds of Distillation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {KINDS.map((k) => (
            <div key={k.n} className={`p-5 rounded-xl border ${k.box}`}>
              <div className={`font-semibold mb-1.5 ${k.label}`}>{k.n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{k.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="llms" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Distilling LLMs</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          For language models the practice has shifted. Most teams do not have teacher logits, so they distil from the
          text the teacher produces instead.
        </p>
        <div className="space-y-3 mb-5">
          {[
            [
              "Sequence-level distillation",
              "Generate teacher completions for a large prompt set and fine-tune the student on them as ordinary text. Simple, works with any API, and is what most open 'distilled' models actually are.",
            ],
            [
              "Rationale distillation",
              "Have the teacher produce its reasoning, not just its answer, and train the student on both. A small model taught to show its work substantially outperforms one taught only the final answer.",
            ],
            [
              "Preference distillation",
              "Use the teacher to rank candidate outputs and train the student with DPO on those pairs. Transfers judgement rather than content.",
            ],
            [
              "On-policy distillation",
              "Sample from the student, have the teacher score or correct those samples, and train on them. Fixes the mismatch where the student is trained only on text it would never have generated itself.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-white mb-1">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
          <p className="text-sm text-rose-200 leading-relaxed m-0">
            <strong>Check the terms of service first.</strong> Most commercial model providers prohibit using their
            outputs to train a competing model. This is a licensing question before it is a technical one, and it has
            been litigated.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch
import torch.nn.functional as F

def distillation_loss(student_logits, teacher_logits, labels, T=4.0, alpha=0.9):
    """Hinton-style KD. Both distributions softened by the same T."""
    # log_softmax on the student, softmax on the teacher: what KLDivLoss expects.
    s = F.log_softmax(student_logits / T, dim=-1)
    t = F.softmax(teacher_logits / T, dim=-1)

    # T**2 restores the gradient scale that dividing the logits removed.
    kd = F.kl_div(s, t, reduction="batchmean") * (T * T)

    if labels is None:                 # no ground truth: pure imitation
        return kd

    ce = F.cross_entropy(student_logits, labels)
    return alpha * kd + (1.0 - alpha) * ce


# Teacher runs in eval mode with no gradients — it is a fixed target.
teacher.eval()
for x, y in loader:
    with torch.no_grad():
        t_logits = teacher(x)
    s_logits = student(x)

    loss = distillation_loss(s_logits, t_logits, y, T=4.0, alpha=0.9)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Two easy mistakes are visible here. Forgetting <span className="font-mono text-gray-400">no_grad</span> on
          the teacher wastes memory building a graph you will never use, and{" "}
          <span className="font-mono text-gray-400">reduction="batchmean"</span> is required —{" "}
          <span className="font-mono text-gray-400">"mean"</span> divides by the number of elements rather than the
          number of examples and silently scales your loss by the vocabulary size.
        </p>
      </section>

      <section id="limits" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What It Costs You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">What you gain</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>A model that is smaller and faster by a large factor.</li>
              <li>Deployment on hardware the teacher could never fit.</li>
              <li>Training signal without human labels.</li>
              <li>Better accuracy than the same architecture trained on labels alone.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">What you give up</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>The teacher's ceiling — the student rarely exceeds it.</li>
              <li>Breadth. Students narrow to the distribution they were distilled on.</li>
              <li>Inherited errors, confidently reproduced with no way to notice.</li>
              <li>Robustness on inputs the distillation set did not cover.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Distillation is one of three ways to make a model smaller, and they compose.{" "}
            <a href="#/genai/quantization" className="text-blue-400 hover:underline">Quantization</a> shrinks the
            numbers, pruning removes weights, and distillation shrinks the architecture itself. Doing all three is
            normal.{" "}
            <a href="#/models/phi" className="text-blue-400 hover:underline">Phi-4</a> is worth reading next as a
            model built largely on teacher-generated data.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   (IA)³ learns three scaling vectors and multiplies activations by them.
   The parameter count against LoRA is a one-line comparison, so compute it.
-------------------------------------------------------------------------- */

const ACTS = [0.8, 0.6, 0.9, 0.4, 0.7, 0.85, 0.5, 0.65];

function ScalingPanel() {
  const [l, setL] = useState([1.4, 0.3, 1.0, 0.7, 1.9, 0.1, 1.1, 0.5]);
  const acts = ACTS;

  const out = useMemo(() => ACTS.map((a, i) => a * l[i]), [l]);
  const set = (i, v) => setL((p) => p.map((x, j) => (j === i ? v : x)));

  const Bar = ({ v, max, color }) => (
    <div className="h-4 bg-black/40 rounded border border-white/5 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-150`} style={{ width: `${Math.min((v / max) * 100, 100)}%` }} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.07] p-6">
      <h3 className="text-blue-400 font-bold mb-1">Scale, don't add</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Every other method here adds something to the model. (IA)³ multiplies. One learned scalar per channel,
        applied elementwise — it can amplify a feature, suppress it, or leave it alone, and that is the entire
        expressive range.
      </p>

      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-x-3 gap-y-2 items-center mb-5 text-xs">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">ch</div>
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">activation</div>
        <div className="text-[0.625rem] uppercase tracking-wide text-blue-400">learned ℓ</div>
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">scale</div>
        <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400">result</div>
        <div />
        {acts.map((a, i) => (
          <React.Fragment key={i}>
            <div className="font-mono text-[0.625rem] text-gray-600">{i}</div>
            <Bar v={a} max={1} color="bg-gray-500/70" />
            <div className="font-mono text-[0.625rem] text-blue-300 w-8 text-right">{l[i].toFixed(2)}</div>
            <input
              type="range" min="0" max="2" step="0.05" value={l[i]}
              onChange={(e) => set(i, Number(e.target.value))}
              className="w-full accent-blue-500 h-1"
            />
            <Bar v={out[i]} max={2} color="bg-emerald-500/70" />
            <div className="font-mono text-[0.625rem] text-emerald-300 w-9 text-right">{out[i].toFixed(2)}</div>
          </React.Fragment>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-sm text-gray-400 leading-relaxed m-0">
          Drag a slider to zero and that channel is switched off entirely. Push it to two and the feature is
          doubled. Note what is impossible: no slider can make one channel depend on another. (IA)³ can reweight
          features the model already has, and it can never build a new one from a combination — which is exactly the
          trade for being this small.
        </p>
      </div>
    </div>
  );
}

function ParamCompare() {
  const [layers, setLayers] = useState(32);
  const d = 4096;
  const dFf = 11008;
  const rank = 8;

  const ia3 = layers * (d + d + dFf);              // l_k, l_v, l_ff
  const lora = layers * 4 * rank * (d + d);        // q,k,v,o adapters
  const full = 7e9;

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">How small is small</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Three vectors per layer against four low-rank matrix pairs. On a 7B-class model:
      </p>
      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">Layers</span>
        <input type="range" min="8" max="80" step="1" value={layers}
          onChange={(e) => setLayers(Number(e.target.value))} className="w-full mt-2 accent-emerald-500" />
        <span className="font-mono text-emerald-300 text-sm">{layers}</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-blue-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-blue-400 mb-1">(IA)³</div>
          <div className="text-2xl font-bold font-mono text-blue-300">{(ia3 / 1e3).toFixed(0)}K</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{((ia3 / full) * 100).toFixed(4)}% of the model</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">LoRA at r=8</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{(lora / 1e6).toFixed(1)}M</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{((lora / full) * 100).toFixed(3)}% of the model</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">Ratio</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{(lora / ia3).toFixed(0)}×</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">smaller than LoRA</div>
        </div>
      </div>
    </div>
  );
}

export default function GenAiIa3() {
  const toc = [
    { label: "The Idea", hash: "idea" },
    { label: "Three Vectors", hash: "vectors" },
    { label: "Scaling in Action", hash: "scaling" },
    { label: "Parameter Count", hash: "count" },
    { label: "Strengths and Limits", hash: "limits" },
    { label: "In Code", hash: "code" },
    { label: "When to Use It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="(IA)³ — Infused Adapter by Inhibiting and Amplifying Inner Activations"
      intro="The smallest method in the family. Three learned vectors per layer, multiplied into the activations — no matrices, no added parameters in the forward path."
      toc={toc}
    >
      <section id="idea" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          The name unpacks into the method: <strong className="text-white">inhibiting and amplifying inner
          activations</strong>. Rather than learning what to add to the model, (IA)³ learns which of the model's
          existing internal features to turn up and which to turn down.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The assumption is that a pretrained model already contains the capabilities a new task needs, just badly
          balanced for it. If that holds, reweighting is enough and you never need to introduce new structure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-gray-600/40 bg-white/[0.03]">
            <div className="font-semibold text-gray-300 mb-2">LoRA — additive</div>
            <div className="font-mono text-xs text-gray-500 mb-2">h = Wx + BAx</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Learns a new low-rank transformation and adds its output in. Can build combinations of features that
              were not there before.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/[0.08]">
            <div className="font-semibold text-blue-400 mb-2">(IA)³ — multiplicative</div>
            <div className="font-mono text-xs text-gray-500 mb-2">h = ℓ ⊙ (Wx)</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Learns a per-channel gain on what the layer already computed. Cannot create a new feature, only
              rebalance existing ones.
            </p>
          </div>
        </div>
      </section>

      <section id="vectors" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Vectors</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Per transformer block, (IA)³ introduces exactly three learned vectors, each applied elementwise.
        </p>
        <div className="space-y-3">
          {[
            ["ℓ_k", "Scales the keys in attention", "Changes which positions the query finds relevant, by reweighting the channels the dot product is computed over.", "border-indigo-500/30 bg-indigo-500/[0.08]", "text-indigo-400"],
            ["ℓ_v", "Scales the values in attention", "Changes what gets copied forward once a position has been attended to.", "border-blue-500/30 bg-blue-500/[0.08]", "text-blue-400"],
            ["ℓ_ff", "Scales the feed-forward intermediate", "Applied after the nonlinearity in the MLP, where most of a transformer's parameters and much of its factual content live.", "border-emerald-500/30 bg-emerald-500/[0.08]", "text-emerald-400"],
          ].map(([sym, what, d, box, tone]) => (
            <div key={sym} className={`p-5 rounded-xl border ${box}`}>
              <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                <span className={`font-mono font-bold text-lg ${tone}`}>{sym}</span>
                <span className="text-sm font-semibold text-white">{what}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            All three initialise to ones, so the adapted model starts out identical to the base — the same stability
            property that makes LoRA's zero-initialised B work.
          </p>
        </div>
      </section>

      <section id="scaling" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Scaling in Action</h2>
        <ScalingPanel />
      </section>

      <section id="count" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Parameter Count</h2>
        <ParamCompare />
      </section>

      <section id="limits" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Strengths and Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>By far the smallest artefact — kilobytes, not megabytes.</li>
              <li>Merges into the weights, so zero inference overhead.</li>
              <li>Strong in few-shot settings; this is the regime it was designed for.</li>
              <li>Very hard to overfit, because there is so little capacity to overfit with.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Limits</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Cannot learn feature interactions — only per-channel gains.</li>
              <li>Hits a ceiling on tasks needing genuinely new behaviour.</li>
              <li>Less tooling and fewer trained checkpoints than LoRA.</li>
              <li>The capacity is fixed; there is no rank knob to turn up.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The honest summary:</strong> (IA)³ came out of the T-Few work on few-shot learning, where its
            tiny capacity is a virtue because there is barely any data to fit. On a general instruction-tuning run
            with plenty of examples, LoRA's extra capacity usually wins.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from peft import IA3Config, get_peft_model, TaskType

config = IA3Config(
    task_type=TaskType.CAUSAL_LM,
    # Where the scaling vectors attach.
    target_modules=["k_proj", "v_proj", "down_proj"],
    # Which of those are feed-forward — they are scaled AFTER the
    # nonlinearity, so the library needs to be told which is which.
    feedforward_modules=["down_proj"],
)

model = get_peft_model(base, config)
model.print_trainable_parameters()
# trainable params: ~0.01% of the model

# There is no rank to tune. The only real lever is which modules you
# target — which makes it unusually quick to get working, and means
# there is nothing to turn up when it is not good enough.

merged = model.merge_and_unload()   # folds in; no inference cost`}
        />
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Use It</h2>
        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Reach for (IA)³ when you have very few examples, or when you need hundreds of task variants and the
            per-task artefact size genuinely matters. For anything resembling ordinary fine-tuning, start with{" "}
            <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a> and only drop down to
            this if the adapter size is a real constraint. The full comparison is on{" "}
            <a href="#/genai/peft" className="text-blue-400 hover:underline">the PEFT family page</a>.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

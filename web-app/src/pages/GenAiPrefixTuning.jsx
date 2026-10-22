import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   The prompt-based family adds learned vectors rather than learned weights.
   The cost that matters is context: virtual tokens occupy real positions.
-------------------------------------------------------------------------- */

const VARIANTS = {
  "Prompt tuning": { layers: 1, where: "input embeddings only", note: "Simplest. Only competitive at very large model scale." },
  "Prefix tuning": { layers: 32, where: "K and V at every layer", note: "Deeper influence, more parameters." },
  "P-tuning v2": { layers: 32, where: "K and V at every layer", note: "Prefix tuning generalised to understanding tasks." },
};

function ContextCostPanel() {
  const [variant, setVariant] = useState("Prefix tuning");
  const [nTokens, setNTokens] = useState(20);
  const [ctx, setCtx] = useState(4096);

  const v = VARIANTS[variant];
  const dModel = 4096;

  const calc = useMemo(() => {
    // Prompt tuning: one embedding per virtual token.
    // Prefix tuning: a key and a value vector per token per layer.
    const perToken = v.layers === 1 ? dModel : 2 * dModel * v.layers;
    const params = nTokens * perToken;
    const usable = ctx - nTokens;
    return { params, perToken, usable, pctCtx: (nTokens / ctx) * 100 };
  }, [v, nTokens, ctx]);

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6">
      <h3 className="text-amber-400 font-bold mb-1">Virtual tokens cost real context</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        These methods prepend learned vectors to the sequence. They are not text and have no token ids, but they sit
        in genuine sequence positions — so every one of them is a position your prompt no longer has.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Variant</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(VARIANTS).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <span className="text-[0.6875rem] text-gray-600">{v.where}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Virtual tokens</span>
          <input type="range" min="1" max="100" step="1" value={nTokens}
            onChange={(e) => setNTokens(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
          <span className="font-mono text-amber-300 text-sm">{nTokens}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Context window</span>
          <select
            value={ctx}
            onChange={(e) => setCtx(Number(e.target.value))}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {[2048, 4096, 8192, 32768].map((c) => <option key={c} value={c}>{c.toLocaleString()}</option>)}
          </select>
        </label>
      </div>

      {/* the sequence, with the prefix occupying the front */}
      <div className="mb-4">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">One sequence</div>
        <div className="flex h-9 rounded-lg overflow-hidden border border-white/10 bg-black/40">
          <div
            className="bg-amber-500/70 flex items-center justify-center text-[0.625rem] font-mono text-black font-bold transition-all"
            style={{ width: `${Math.max(calc.pctCtx, 1.5)}%` }}
          >
            {calc.pctCtx > 8 ? "prefix" : ""}
          </div>
          <div className="flex-1 flex items-center justify-center text-[0.625rem] font-mono text-gray-500">
            your actual prompt — {calc.usable.toLocaleString()} tokens left
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-1">Trainable parameters</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{(calc.params / 1e6).toFixed(2)}M</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{calc.perToken.toLocaleString()} per virtual token</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Context consumed</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{calc.pctCtx.toFixed(2)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">every single request</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Depth of influence</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{v.layers === 1 ? "input" : "all layers"}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{v.note}</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Switch between prompt tuning and prefix tuning at the same token count. The parameter figure jumps by
        roughly sixty-four times, because prefix tuning stores a key and a value vector at every layer rather than
        one embedding at the input. That is the price of influencing the whole stack rather than just the entrance.
      </p>
    </div>
  );
}

export default function GenAiPrefixTuning() {
  const toc = [
    { label: "A Different Idea", hash: "idea" },
    { label: "The Three Variants", hash: "variants" },
    { label: "The Context Cost", hash: "cost" },
    { label: "Why Reparameterisation", hash: "reparam" },
    { label: "In Code", hash: "code" },
    { label: "Where It Stands", hash: "status" },
  ];

  return (
    <GuideLayout
      title="Prefix Tuning & P-Tuning"
      intro="Leave every weight frozen and learn the input instead. Soft prompts are vectors the model reads as instructions, found by gradient descent rather than written by a human."
      toc={toc}
    >
      <section id="idea" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A Different Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Every other method in this family modifies weights. This one does not touch them at all. It adds trainable
          vectors to the <em>activations</em> — continuous embeddings prepended to the sequence, optimised by
          gradient descent while the entire model stays frozen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-gray-600/40 bg-white/[0.03]">
            <div className="font-semibold text-gray-300 mb-2">A hard prompt</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              "You are a helpful legal assistant." Real tokens, discrete, human-readable. You search for a good one
              by trying wordings — a discrete search over a space with no gradient.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.08]">
            <div className="font-semibold text-amber-400 mb-2">A soft prompt</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Twenty vectors in embedding space that correspond to no words at all. They are not constrained to the
              vocabulary, so they can express instructions no sentence could — and you find them with gradients.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            This is the smallest-footprint family in PEFT. The base model is untouched, so a single copy serves
            every task and switching task means swapping a handful of vectors.
          </p>
        </div>
      </section>

      <section id="variants" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Three Variants</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          They are usually conflated. The difference is where the learned vectors are injected, and it matters.
        </p>
        <div className="space-y-4">
          {[
            ["Prompt tuning", "Input embeddings only", "The minimal version: prepend learned vectors at the embedding layer and let them propagate. Fewest parameters of anything here. Its weakness is well documented — it only becomes competitive at very large model scale, and is unreliable below roughly 10B parameters.", "border-emerald-500/30 bg-emerald-500/[0.08]", "text-emerald-400"],
            ["Prefix tuning", "Keys and values at every layer", "Prepends learned key and value vectors to the attention of every layer, not just the input. Each layer gets its own prefix, so the influence does not have to survive propagation from the entrance. Substantially more parameters, and substantially more reliable.", "border-amber-500/30 bg-amber-500/[0.08]", "text-amber-400"],
            ["P-tuning v2", "Keys and values at every layer", "Essentially prefix tuning applied to natural language understanding tasks, where the earlier prompt-tuning results had been weak. The contribution is largely the demonstration that deep prefixes work across scales and tasks, not a new mechanism.", "border-indigo-500/30 bg-indigo-500/[0.08]", "text-indigo-400"],
          ].map(([n, where, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className={`font-bold ${tone}`}>{n}</span>
                <span className="font-mono text-[0.6875rem] text-gray-500">{where}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Context Cost</h2>
        <ContextCostPanel />
      </section>

      <section id="reparam" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why Reparameterisation</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Optimising the prefix vectors directly turns out to be unstable — training is sensitive to the learning
          rate and often diverges. Both the prefix tuning and P-tuning papers solve it the same way: do not train
          the vectors, train a small network that produces them.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          {[
            ["small trainable embedding", "text-gray-300 border-gray-700 bg-black/40"],
            ["MLP or LSTM", "text-amber-300 border-amber-500/40 bg-amber-900/20"],
            ["the actual prefix vectors", "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"],
          ].map(([label, cls], i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-gray-600">→</span>}
              <span className={`px-3 py-1.5 border rounded-full ${cls}`}>{label}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The reparameterisation network is discarded after training — you keep only the prefix vectors it
            produced. It exists purely to make the optimisation well behaved, which is a recurring pattern worth
            recognising: when direct optimisation of a small parameter set is unstable, over-parameterise it during
            training and throw the scaffolding away.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from peft import PrefixTuningConfig, PromptTuningConfig, TaskType, get_peft_model

# --- Prefix tuning: K/V prefixes at every layer -------------------------
prefix = PrefixTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=20,        # 20 positions gone from every prompt
    prefix_projection=True,       # the reparameterisation MLP; stabilises training
)

# --- Prompt tuning: input embeddings only -------------------------------
prompt = PromptTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=20,
    # Initialising from real text beats random init, especially on smaller
    # models — it starts the search somewhere the model already understands.
    prompt_tuning_init="TEXT",
    prompt_tuning_init_text="Classify the sentiment of this review:",
    tokenizer_name_or_path="meta-llama/Llama-3.1-8B",
)

model = get_peft_model(base, prefix)
model.print_trainable_parameters()

# Budget the context: num_virtual_tokens is subtracted from every request,
# forever. At 100 tokens on a 2k window that is 5% of your prompt gone.`}
        />
      </section>

      <section id="status" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where It Stands</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Honestly: largely displaced by LoRA for most practical work. LoRA reaches better quality, does not consume
          context, and merges to zero inference cost. The prompt-based family survives where its specific properties
          matter.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Still the right choice when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>The base model must remain provably bit-identical.</li>
              <li>You need hundreds of tasks and the smallest possible per-task artefact.</li>
              <li>You are serving many tasks in one batch — prefixes batch naturally.</li>
              <li>You only have API-level access to activations, not weights.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Reach for LoRA instead when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Quality is what you are optimising for.</li>
              <li>Context is tight and you cannot spare the positions.</li>
              <li>You want to merge away the inference overhead.</li>
              <li>Your model is under ~10B, where prompt tuning is unreliable.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Compare with <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a>, and see{" "}
            <a href="#/genai/peft" className="text-blue-400 hover:underline">the PEFT family</a> for how all six
            methods line up.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

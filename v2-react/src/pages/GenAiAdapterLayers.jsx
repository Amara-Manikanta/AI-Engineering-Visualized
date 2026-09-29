import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Adapter layers sit IN the forward path. LoRA sits BESIDE it. That single
   topological difference explains the latency, the merging, and why LoRA won.
-------------------------------------------------------------------------- */

function SerialVsParallel() {
  const [mode, setMode] = useState("serial");
  const serial = mode === "serial";

  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h3 className="text-rose-400 font-bold m-0">In the path, or beside it</h3>
        <div className="flex gap-2">
          {[
            ["serial", "Adapter layers"],
            ["parallel", "LoRA"],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                mode === v
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        The same trainable bottleneck, wired two different ways. This is the whole difference between the two
        methods, and everything else follows from it.
      </p>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-4">
        <svg viewBox="0 0 620 200" className="w-full h-auto min-w-[540px]">
          <defs>
            <marker id="al-a" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.4)" />
            </marker>
          </defs>

          <circle cx="34" cy="100" r="15" fill="rgba(129,140,248,0.18)" stroke="#818cf8" strokeWidth="2" />
          <text x="34" y="106" textAnchor="middle" fontSize="13" fill="#c7d2fe" fontFamily="monospace">x</text>

          {serial ? (
            <>
              <line x1="50" y1="100" x2="96" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#al-a)" />
              <rect x="100" y="70" width="130" height="60" rx="9" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <text x="165" y="96" textAnchor="middle" fontSize="12" fill="#e5e7eb" fontFamily="monospace">Frozen sublayer</text>
              <text x="165" y="114" textAnchor="middle" fontSize="9" fill="#60a5fa">🔒 attention or MLP</text>

              <line x1="230" y1="100" x2="276" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#al-a)" />
              <rect x="280" y="66" width="140" height="68" rx="9" fill="rgba(244,114,182,0.2)" stroke="#f472b6" strokeWidth="2.5" />
              <text x="350" y="90" textAnchor="middle" fontSize="12" fill="#fbcfe8" fontFamily="monospace" fontWeight="bold">Adapter</text>
              <text x="350" y="106" textAnchor="middle" fontSize="9" fill="#f9a8d4" fontFamily="monospace">down → GeLU → up</text>
              <text x="350" y="122" textAnchor="middle" fontSize="9" fill="#f472b6">🔥 trainable</text>

              <line x1="420" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#al-a)" />
              <text x="460" y="88" textAnchor="middle" fontSize="9" fill="#f472b6" fontFamily="monospace">+latency</text>
            </>
          ) : (
            <>
              <line x1="50" y1="100" x2="78" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M78,100 L78,52 L126,52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#al-a)" />
              <path d="M78,100 L78,150 L126,150" fill="none" stroke="#34d399" strokeWidth="2" markerEnd="url(#al-a)" />

              <rect x="130" y="24" width="180" height="56" rx="9" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <text x="220" y="48" textAnchor="middle" fontSize="12" fill="#e5e7eb" fontFamily="monospace">Frozen sublayer</text>
              <text x="220" y="66" textAnchor="middle" fontSize="9" fill="#60a5fa">🔒 W₀</text>

              <rect x="130" y="126" width="180" height="48" rx="9" fill="rgba(52,211,153,0.18)" stroke="#34d399" strokeWidth="2.5" />
              <text x="220" y="148" textAnchor="middle" fontSize="12" fill="#a7f3d0" fontFamily="monospace" fontWeight="bold">B · A</text>
              <text x="220" y="164" textAnchor="middle" fontSize="9" fill="#34d399">🔥 trainable, runs in parallel</text>

              <path d="M310,52 L400,52 L400,88" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M310,150 L400,150 L400,112" fill="none" stroke="#34d399" strokeWidth="2" />
              <circle cx="400" cy="100" r="14" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="2" />
              <text x="400" y="106" textAnchor="middle" fontSize="15" fill="#fde68a" fontFamily="monospace">+</text>
              <line x1="414" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" markerEnd="url(#al-a)" />
              <text x="460" y="88" textAnchor="middle" fontSize="9" fill="#34d399" fontFamily="monospace">mergeable</text>
            </>
          )}

          <circle cx="520" cy="100" r="15" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" strokeWidth="2" />
          <text x="520" y="106" textAnchor="middle" fontSize="13" fill="#fde68a" fontFamily="monospace">h</text>
        </svg>
      </div>

      <div
        className={`p-4 rounded-xl border ${
          serial ? "border-rose-500/30 bg-rose-500/[0.1]" : "border-emerald-500/30 bg-emerald-500/[0.1]"
        }`}
      >
        <p className={`text-sm leading-relaxed m-0 ${serial ? "text-rose-200" : "text-emerald-200"}`}>
          {serial ? (
            <>
              <strong>Sequential.</strong> The adapter is a stage the data must pass through, so its compute adds to
              the critical path of every forward pass. And because it contains a nonlinearity, there is no algebra
              that folds it into the frozen weights — the latency is permanent.
            </>
          ) : (
            <>
              <strong>Parallel.</strong> The adapter computes alongside the frozen path and the two are summed.
              Both are linear, so B·A can be added into W₀ once and the branch disappears entirely. Inference then
              costs exactly what the base model cost.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function LatencyPanel() {
  const [layers, setLayers] = useState(32);
  const [perAdapter, setPerAdapter] = useState(0.08); // ms
  const base = 22; // ms per token, illustrative
  const added = layers * 2 * perAdapter; // two sublayers per block
  const pct = (added / base) * 100;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6">
      <h3 className="text-amber-400 font-bold mb-1">The latency that never goes away</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Two adapters per transformer block, every block, every token. Individually tiny; multiplied by depth, not
        tiny. These are illustrative numbers — the shape is the point.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Transformer blocks</span>
          <input type="range" min="8" max="80" step="1" value={layers}
            onChange={(e) => setLayers(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
          <span className="font-mono text-amber-300 text-sm">{layers}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Cost per adapter (ms)</span>
          <input type="range" min="0.02" max="0.3" step="0.01" value={perAdapter}
            onChange={(e) => setPerAdapter(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
          <span className="font-mono text-amber-300 text-sm">{perAdapter.toFixed(2)}</span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Base latency</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{base.toFixed(1)} ms</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">Added by adapters</div>
          <div className="text-2xl font-bold font-mono text-rose-300">+{added.toFixed(2)} ms</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{layers * 2} adapter passes</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-1">Overhead</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{pct.toFixed(1)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">LoRA merged: 0%</div>
        </div>
      </div>
    </div>
  );
}

export default function GenAiAdapterLayers() {
  const toc = [
    { label: "The Original", hash: "original" },
    { label: "The Bottleneck Block", hash: "block" },
    { label: "Serial vs Parallel", hash: "serial" },
    { label: "The Latency Cost", hash: "latency" },
    { label: "What It Got Right", hash: "legacy" },
    { label: "In Code", hash: "code" },
    { label: "Where It Stands", hash: "status" },
  ];

  return (
    <GuideLayout
      title="Adapter Layers"
      intro="The method that started parameter-efficient fine-tuning, in 2019. Largely displaced now — and the reason why is the most useful thing about it."
      toc={toc}
    >
      <section id="original" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Original</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Before LoRA, before prefix tuning, there were adapters. The 2019 Houlsby paper asked whether you could
          adapt BERT to a new task by inserting small trainable modules between the existing layers and freezing
          everything else. The answer was yes, within a fraction of a percent of full fine-tuning on GLUE, while
          training about 3% of the parameters.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Every method on the other pages here is a descendant of that result. It established the central claim of
          the whole field: you do not need to move most of the weights.
        </p>
        <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.08]">
          <p className="text-sm text-indigo-100 leading-relaxed m-0">
            Worth reading for the idea rather than for use. LoRA takes the same bottleneck and rewires it, and that
            rewiring is what made the difference.
          </p>
        </div>
      </section>

      <section id="block" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Bottleneck Block</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          An adapter is a small autoencoder-shaped module, inserted after each transformer sublayer.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          {[
            ["input (d)", "text-gray-300 border-gray-700 bg-black/40"],
            ["down-project to m", "text-rose-300 border-rose-500/40 bg-rose-900/20"],
            ["GeLU", "text-amber-300 border-amber-500/40 bg-amber-900/20"],
            ["up-project to d", "text-rose-300 border-rose-500/40 bg-rose-900/20"],
            ["+ residual", "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"],
          ].map(([label, cls], i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-gray-600">→</span>}
              <span className={`px-3 py-1.5 border rounded-full ${cls}`}>{label}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Familiar shape</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Down to a small dimension m, then back up. That is the same bottleneck LoRA uses — the rank r and the
              adapter width m play the same role.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">One crucial difference</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              There is a <strong className="text-white">nonlinearity in the middle</strong>. That makes the adapter
              strictly more expressive than a low-rank linear map — and it is exactly what makes it impossible to
              merge away.
            </p>
          </div>
        </div>
      </section>

      <section id="serial" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Serial vs Parallel</h2>
        <SerialVsParallel />
      </section>

      <section id="latency" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Latency Cost</h2>
        <LatencyPanel />
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Why this was fatal.</strong> A few percent of extra latency sounds tolerable until you are
            serving at scale, where it is a few percent more hardware forever. LoRA offered the same quality at zero
            steady-state cost, and the field moved almost immediately.
          </p>
        </div>
      </section>

      <section id="legacy" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What It Got Right</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["The core claim", "Adapting a model needs far fewer parameters than training one. Everything downstream assumes this, and adapters proved it first.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
            ["The bottleneck shape", "Down-project, transform, up-project. LoRA, (IA)³ and the rest all reuse this skeleton.", "border-indigo-500/25 bg-indigo-500/[0.07]", "text-indigo-400"],
            ["Near-identity initialisation", "Adapters initialise close to a no-op so training starts from the base model. LoRA's zero-initialised B is the same idea, refined.", "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-semibold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch.nn as nn

class Adapter(nn.Module):
    """Houlsby-style bottleneck adapter, inserted after a frozen sublayer."""

    def __init__(self, d_model, bottleneck=64):
        super().__init__()
        self.down = nn.Linear(d_model, bottleneck)
        self.act = nn.GELU()                    # <- why this cannot be merged
        self.up = nn.Linear(bottleneck, d_model)

        # Near-identity at initialisation: up starts at zero, so the adapter
        # is a no-op on step one and training begins from the base model.
        nn.init.zeros_(self.up.weight)
        nn.init.zeros_(self.up.bias)

    def forward(self, x):
        return x + self.up(self.act(self.down(x)))   # residual around it

# Inserted INTO the path, after each sublayer:
#   h = adapter(sublayer(x))
#
# Compare LoRA, which sits BESIDE it:
#   h = sublayer(x) + B @ A @ x
#
# Both branches of the LoRA form are linear, so they collapse into one
# matrix. The GELU above means the adapter form never can.`}
        />
      </section>

      <section id="status" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where It Stands</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Displaced by LoRA for general fine-tuning, and worth knowing anyway. The nonlinearity that costs it the
          merge also buys real expressiveness, which is why adapter-style modules still appear in multi-task and
          multi-lingual setups where you deliberately want separable, composable modules rather than one fused
          weight matrix.
        </p>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Read <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a> next to see the same
            bottleneck rewired in parallel, or{" "}
            <a href="#/genai/peft" className="text-blue-400 hover:underline">the PEFT family</a> for how the six
            methods compare.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

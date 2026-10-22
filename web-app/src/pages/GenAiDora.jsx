import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   DoRA splits a weight into magnitude and direction and updates them
   separately. That is a geometric claim about vectors, so the panel does the
   geometry: a real 2D weight column, a real update, and the two decompositions
   computed side by side.

       W = m · (V / ‖V‖)     m = ‖W‖ (a learned scalar per column)
       LoRA:  W + BA                    — magnitude and direction move together
       DoRA:  m · (V + BA)/‖V + BA‖     — direction from the update, scale from m
-------------------------------------------------------------------------- */

const W0 = { x: 3.0, y: 1.2 }; // the frozen weight column
const norm = (v) => Math.hypot(v.x, v.y);
const unit = (v) => { const n = norm(v) || 1; return { x: v.x / n, y: v.y / n }; };
const deg = (v) => (Math.atan2(v.y, v.x) * 180) / Math.PI;

function DecompositionPanel() {
  const [ux, setUx] = useState(-0.9);
  const [uy, setUy] = useState(1.5);
  const [m, setM] = useState(1.0);

  const g = useMemo(() => {
    const upd = { x: ux, y: uy };                    // BA, the low-rank update
    const lora = { x: W0.x + upd.x, y: W0.y + upd.y };

    // DoRA: direction comes from the updated vector, magnitude from learned m.
    const dir = unit(lora);
    const mag = norm(W0) * m;                        // m scales the original norm
    const dora = { x: dir.x * mag, y: dir.y * mag };

    return {
      upd, lora, dora,
      base: { mag: norm(W0), ang: deg(W0) },
      loraS: { mag: norm(lora), ang: deg(lora) },
      doraS: { mag: norm(dora), ang: deg(dora) },
    };
  }, [ux, uy, m]);

  const S = 46;   // px per unit
  const CX = 210; // origin
  const CY = 230;
  const px = (v) => CX + v.x * S;
  const py = (v) => CY - v.y * S;

  const Arrow = ({ v, color, label, width = 2.5, dash }) => (
    <g>
      <line x1={CX} y1={CY} x2={px(v)} y2={py(v)} stroke={color} strokeWidth={width} strokeDasharray={dash} markerEnd={`url(#dora-${color.replace("#", "")})`} />
      <text x={px(v) + 8} y={py(v) - 6} fill={color} fontSize="11" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  );

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.07] p-6">
      <h3 className="text-purple-400 font-bold mb-1">Magnitude and direction, pulled apart</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        One column of a weight matrix, drawn as a vector. Move the low-rank update and watch what each method does:
        LoRA changes length and angle together because it just adds. DoRA takes only the <em>angle</em> from the
        update and sets the length from its own learned scalar.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <div className="rounded-xl bg-black/50 border border-white/10 p-2">
          <svg viewBox="0 0 420 300" className="w-full h-auto">
            <defs>
              {["#9ca3af", "#60a5fa", "#a78bfa", "#34d399"].map((c) => (
                <marker key={c} id={`dora-${c.replace("#", "")}`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={c} />
                </marker>
              ))}
            </defs>

            {[-2, -1, 1, 2, 3, 4].map((t) => (
              <g key={t}>
                <line x1={CX + t * S} y1="10" x2={CX + t * S} y2="290" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="10" y1={CY - t * S} x2="410" y2={CY - t * S} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </g>
            ))}
            <line x1="10" y1={CY} x2="410" y2={CY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1={CX} y1="10" x2={CX} y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {/* the circle of constant magnitude DoRA is constrained to */}
            <circle cx={CX} cy={CY} r={g.doraS.mag * S} fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="3 4" />

            <Arrow v={W0} color="#9ca3af" label="W₀" width={2} />
            <Arrow v={g.lora} color="#60a5fa" label="LoRA" />
            <Arrow v={g.dora} color="#a78bfa" label="DoRA" />

            {/* the update itself, drawn from the tip of W0 */}
            <line
              x1={px(W0)} y1={py(W0)} x2={px(g.lora)} y2={py(g.lora)}
              stroke="#34d399" strokeWidth="1.8" strokeDasharray="4 3"
            />
            <text x={(px(W0) + px(g.lora)) / 2 + 6} y={(py(W0) + py(g.lora)) / 2} fill="#34d399" fontSize="10" fontFamily="monospace">BA</text>
          </svg>
        </div>

        <div>
          {[
            ["Update x (BA)", ux, setUx, -3, 3, 0.05],
            ["Update y (BA)", uy, setUy, -3, 3, 0.05],
            ["DoRA magnitude m", m, setM, 0.3, 2, 0.01],
          ].map(([label, val, set, min, max, step]) => (
            <label key={label} className="block mb-4">
              <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full mt-2 accent-purple-500"
              />
              <span className="font-mono text-purple-300 text-sm">{val.toFixed(2)}</span>
            </label>
          ))}

          <div className="space-y-2">
            {[
              ["W₀ (frozen)", g.base, "text-gray-400"],
              ["LoRA result", g.loraS, "text-blue-300"],
              ["DoRA result", g.doraS, "text-purple-300"],
            ].map(([n, v, tone]) => (
              <div key={n} className="p-3 rounded-lg bg-black/40 border border-white/10">
                <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">{n}</div>
                <div className={`font-mono text-xs ${tone}`}>
                  ‖·‖ = {v.mag.toFixed(3)} · θ = {v.ang.toFixed(1)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-sm text-gray-400 leading-relaxed m-0">
          Set m = 1.00 and drag the update around. The blue arrow's length swings wildly — LoRA cannot change
          direction without also changing magnitude. The purple arrow stays pinned to the dashed circle, because
          DoRA's length is decided by m alone. Now move m and the direction does not budge. That separation is the
          entire method.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function GenAiDora() {
  const toc = [
    { label: "The Observation", hash: "observation" },
    { label: "The Decomposition", hash: "decomposition" },
    { label: "See the Geometry", hash: "geometry" },
    { label: "Why It Helps", hash: "why" },
    { label: "What It Costs", hash: "cost" },
    { label: "In Code", hash: "code" },
    { label: "When to Use It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="DoRA — Weight-Decomposed Low-Rank Adaptation"
      intro="Split each weight into a magnitude and a direction, and let the low-rank update steer only the direction. A small change to LoRA that closes much of the gap to full fine-tuning at low rank."
      toc={toc}
    >
      <section id="observation" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Observation</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          The DoRA authors measured how magnitude and direction change during full fine-tuning versus during LoRA,
          and found the two behave differently. Full fine-tuning makes many small, largely <em>independent</em>
          adjustments to length and angle. LoRA's updates show a strong coupling between them — it cannot move one
          without dragging the other.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          That coupling is not a bug in the implementation; it is what adding a matrix does. If the fitting
          behaviour of full fine-tuning is what you want to imitate, you have to give the method a way to move those
          two quantities separately.
        </p>
        <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-500/[0.08]">
          <p className="text-sm text-purple-100 leading-relaxed m-0">
            DoRA is best understood as a diagnosis first and a method second. The method is three extra lines; the
            contribution is noticing which degree of freedom LoRA was missing.
          </p>
        </div>
      </section>

      <section id="decomposition" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Decomposition</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Any vector is a length times a unit vector. Apply that per column of the weight matrix.
        </p>
        <div className="space-y-3 mb-5">
          {[
            ["Split the frozen weight", "W₀ = m · (V / ‖V‖)", "m is a vector of column norms — one trainable scalar per output dimension. V is the frozen direction.", "border-gray-600/40 bg-white/[0.03]", "text-gray-300"],
            ["LoRA, for comparison", "W′ = W₀ + BA", "The sum changes both length and angle at once. There is no way to adjust one alone.", "border-blue-500/30 bg-blue-500/[0.08]", "text-blue-400"],
            ["DoRA", "W′ = m · (V + BA) / ‖V + BA‖", "The low-rank update steers the direction; re-normalising strips whatever length it added. m then sets the length independently.", "border-purple-500/30 bg-purple-500/[0.08]", "text-purple-400"],
          ].map(([t, eq, d, box, tone]) => (
            <div key={t} className={`p-5 rounded-xl border ${box}`}>
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className={`text-sm font-semibold ${tone}`}>{t}</span>
                <span className="font-mono text-sm text-white">{eq}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The re-normalisation is the whole trick. Without it, DoRA is LoRA with a redundant scalar. With it, the
            adapter's contribution to length is discarded and m becomes the only thing that controls magnitude.
          </p>
        </div>
      </section>

      <section id="geometry" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">See the Geometry</h2>
        <DecompositionPanel />
      </section>

      <section id="why" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why It Helps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Stronger at low rank", "The gap between DoRA and LoRA is widest at r = 4 or 8, and narrows as rank grows. Extra rank eventually buys LoRA the freedom that the decomposition gives DoRA for free.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
            ["More like full fine-tuning", "The learning pattern — how magnitude and direction co-vary over training — tracks full fine-tuning much more closely than LoRA's does.", "border-indigo-500/25 bg-indigo-500/[0.07]", "text-indigo-400"],
            ["Still merges cleanly", "The final weight is an ordinary matrix, so you can fold it into the base and serve with zero inference overhead, exactly as with LoRA.", "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-semibold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What It Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Parameters: barely anything</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              One extra scalar per output column on top of the LoRA matrices. On a 4096×4096 projection that is
              4,096 numbers against the adapter's 65,536 — about 6% more trainable parameters.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Training time: noticeably more</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              The norm has to be computed in the forward pass and differentiated through in the backward pass, every
              step. Expect a real slowdown per step — the usual reported range is tens of percent.
            </p>
          </div>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from peft import LoraConfig, get_peft_model

# DoRA is a flag on LoraConfig, not a separate config class.
config = LoraConfig(
    r=8,                      # DoRA's advantage is largest at LOW rank
    lora_alpha=16,
    use_dora=True,            # <- the whole difference
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    task_type="CAUSAL_LM",
)

model = get_peft_model(base, config)

# What use_dora=True changes, conceptually:
#
#   LoRA:  W' = W0 + (alpha/r) * B @ A
#
#   DoRA:  V  = W0 + (alpha/r) * B @ A      # direction candidate
#          W' = m * V / V.norm(dim=0, keepdim=True)
#
# m is initialised to the column norms of W0, so step one reproduces the
# base model exactly — the same property that makes LoRA stable.

merged = model.merge_and_unload()   # still folds into a plain matrix`}
        />
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Use It</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Worth it when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You are memory-constrained to a low rank and want more from it.</li>
              <li>LoRA has plateaued below the quality you need.</li>
              <li>Training time is cheaper for you than GPU memory.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Skip it when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You can simply afford a higher rank — that closes most of the gap.</li>
              <li>Training throughput is your bottleneck.</li>
              <li>You have not yet measured a plain LoRA baseline.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Start from <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a>, measure, and
            reach for DoRA only if low rank is a constraint you cannot lift. It composes with{" "}
            <a href="#/genai/peft/qlora" className="text-blue-400 hover:underline">QLoRA</a> — a quantised base with
            DoRA adapters is a supported configuration.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

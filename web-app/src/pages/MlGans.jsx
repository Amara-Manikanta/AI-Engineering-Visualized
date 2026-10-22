import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   A GAN small enough to actually run in the page.

   The generator is a single Gaussian with two learnable parameters (mean and
   spread). The discriminator is not learned — it is set to its optimum,
   D*(x) = p_real(x) / (p_real(x) + p_gen(x)), which is what the discriminator
   converges to given enough capacity. With D at its optimum the generator's
   objective is exactly the Jensen–Shannon divergence between the two
   distributions, so we descend that directly by numerical gradient.

   Everything drawn below is computed from those formulas on a 241-point grid.
-------------------------------------------------------------------------- */

const XS = Array.from({ length: 241 }, (_, i) => -6 + i * 0.05);
const DX = 0.05;

const npdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

const REAL = {
  unimodal: (x) => npdf(x, 0, 0.7),
  bimodal: (x) => 0.5 * npdf(x, -2, 0.5) + 0.5 * npdf(x, 2, 0.5),
};

// Jensen–Shannon divergence between the real density and N(mu, sigma).
function jsd(realFn, mu, sigma) {
  let d = 0;
  for (const x of XS) {
    const p = realFn(x) + 1e-12;
    const q = npdf(x, mu, sigma) + 1e-12;
    const m = 0.5 * (p + q);
    d += 0.5 * (p * Math.log(p / m) + q * Math.log(q / m)) * DX;
  }
  return d;
}

// Train the two generator parameters by gradient descent on that divergence.
function train(mode, steps, lr) {
  const realFn = REAL[mode];
  let mu = 3.4;
  let logS = Math.log(1.7);
  const loss = [];

  for (let i = 0; i < steps; i++) {
    const h = 1e-3;
    const gMu = (jsd(realFn, mu + h, Math.exp(logS)) - jsd(realFn, mu - h, Math.exp(logS))) / (2 * h);
    const gS =
      (jsd(realFn, mu, Math.exp(logS + h)) - jsd(realFn, mu, Math.exp(logS - h))) / (2 * h);
    mu -= lr * gMu;
    logS -= lr * gS;
    logS = Math.max(Math.log(0.15), Math.min(Math.log(3), logS));
    loss.push(jsd(realFn, mu, Math.exp(logS)));
  }

  const sigma = Math.exp(logS);
  return { mu, sigma, loss, divergence: jsd(realFn, mu, sigma), realFn };
}

const W = 560;
const H = 230;
const PAD = 42;

function GanLab() {
  const [mode, setMode] = useState("unimodal");
  const [steps, setSteps] = useState(0);
  const lr = 0.5;

  const fit = useMemo(() => train(mode, steps, lr), [mode, steps]);

  const curves = useMemo(() => {
    const real = XS.map((x) => fit.realFn(x));
    const gen = XS.map((x) => npdf(x, fit.mu, fit.sigma));
    const disc = XS.map((x, i) => (real[i] + 1e-9) / (real[i] + gen[i] + 2e-9));
    const yMax = Math.max(...real, ...gen, 0.1) * 1.15;
    return { real, gen, disc, yMax };
  }, [fit]);

  const px = (x) => PAD + ((x + 6) / 12) * (W - PAD * 2);
  const py = (y) => H - PAD - (y / curves.yMax) * (H - PAD * 1.5);
  const pyD = (d) => H - PAD - d * (H - PAD * 1.5); // discriminator is already 0..1

  const pathOf = (arr, fy) => XS.map((x, i) => `${i ? "L" : "M"}${px(x)},${fy(arr[i])}`).join(" ");

  const accuracy = useMemo(() => {
    // What fraction of the time the optimal discriminator is right, integrated
    // over both distributions. 0.5 means it has nothing left to work with.
    let correct = 0;
    for (let i = 0; i < XS.length; i++) {
      const p = curves.real[i];
      const q = curves.gen[i];
      correct += (Math.max(p, q) / 2) * DX;
    }
    return correct;
  }, [curves]);

  return (
    <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/[0.07] p-6">
      <h3 className="text-fuchsia-400 font-bold mb-1">A two-parameter GAN, trained in your browser</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Blue is the real data distribution. Pink is what the generator produces. The dashed line is the optimal
        discriminator — its height at each x is the probability it assigns to "this sample is real". Drag the slider
        to run training steps.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ["unimodal", "One mode"],
          ["bimodal", "Two modes"],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setSteps(0);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              mode === m
                ? "border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-200"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={PAD} y1={pyD(0.5)} x2={W - PAD} y2={pyD(0.5)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 5" />

          <path d={`${pathOf(curves.real, py)} L${px(6)},${py(0)} L${px(-6)},${py(0)} Z`} fill="rgba(96,165,250,0.18)" />
          <path d={pathOf(curves.real, py)} fill="none" stroke="#60a5fa" strokeWidth="2.5" />

          <path d={`${pathOf(curves.gen, py)} L${px(6)},${py(0)} L${px(-6)},${py(0)} Z`} fill="rgba(232,121,249,0.18)" />
          <path d={pathOf(curves.gen, py)} fill="none" stroke="#e879f9" strokeWidth="2.5" />

          <path d={pathOf(curves.disc, pyD)} fill="none" stroke="#a3a3a3" strokeWidth="1.8" strokeDasharray="6 4" />

          <text x={PAD} y={PAD - 20} fill="#60a5fa" fontSize="11" fontFamily="monospace">real data</text>
          <text x={PAD + 80} y={PAD - 20} fill="#e879f9" fontSize="11" fontFamily="monospace">generator</text>
          <text x={PAD + 175} y={PAD - 20} fill="#a3a3a3" fontSize="11" fontFamily="monospace">discriminator</text>
        </svg>
      </div>

      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">Training steps</span>
        <input
          type="range"
          min="0"
          max="300"
          step="1"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          className="w-full mt-2 accent-fuchsia-500"
        />
        <span className="font-mono text-fuchsia-300 text-sm">{steps}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">JS divergence</div>
          <div className="text-2xl font-bold font-mono text-fuchsia-300">{fit.divergence.toFixed(4)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">0 = distributions match</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Discriminator accuracy</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{(accuracy * 100).toFixed(1)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">50% = it is guessing</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Generator</div>
          <div className="text-lg font-bold font-mono text-fuchsia-300">
            μ={fit.mu.toFixed(2)} σ={fit.sigma.toFixed(2)}
          </div>
        </div>
      </div>

      {mode === "bimodal" && steps > 60 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.1]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Watch where it settled.</strong> The divergence stops falling well above zero. The real data has
            two peaks and the generator can only make one Gaussian, so the best it can do is spread wide enough to
            straddle both — putting most of its mass in the gap between them, where there is no real data at all.
            Real mode collapse has a different cause: the generator finds one output that fools the current
            discriminator and stops exploring. What this shows is the simpler failure underneath it — a generator
            whose family cannot represent the target, converging anyway.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const FAILURES = [
  {
    n: "Mode collapse",
    d: "The generator finds one output that reliably fools the discriminator and emits variations of only that. Symptom: samples all look alike. Mitigations: minibatch discrimination, unrolled updates, or switch to a Wasserstein loss.",
    box: "border-rose-500/25 bg-rose-500/[0.07]",
    label: "text-rose-400",
  },
  {
    n: "Discriminator wins",
    d: "If D gets too good too fast it outputs near-zero for everything fake, and the generator's gradient vanishes. Mitigations: the non-saturating generator loss, label smoothing, or fewer D steps per G step.",
    box: "border-amber-500/25 bg-amber-500/[0.07]",
    label: "text-amber-400",
  },
  {
    n: "No convergence",
    d: "The two losses oscillate forever because this is a minimax game, not a minimisation. There is no loss curve that going down means progress. You judge GANs by looking at samples and by FID.",
    box: "border-indigo-500/25 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
  },
];

export default function MlGans() {
  const toc = [
    { label: "The Adversarial Idea", hash: "idea" },
    { label: "The Training Loop", hash: "loop" },
    { label: "Run One", hash: "lab" },
    { label: "Why They Are Hard", hash: "hard" },
    { label: "The Variants", hash: "variants" },
    { label: "In Code", hash: "code" },
    { label: "GANs vs Diffusion", hash: "diffusion" },
  ];

  return (
    <GuideLayout
      title="Generative Adversarial Networks"
      intro="Two networks trained against each other: one invents data, the other calls the fakes. Neither has a target to copy — the signal comes entirely from the opponent."
      toc={toc}
    >
      <section id="idea" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Adversarial Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Generating realistic data is hard to write a loss function for. Pixel-wise error between a generated face
          and a real one punishes a perfectly plausible face that happens to differ, and rewards a blurry average of
          all faces. The adversarial answer is to stop writing the loss and learn it instead.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/[0.07]">
            <div className="font-bold text-fuchsia-400 mb-2">Generator G</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Takes a random noise vector and outputs a sample. It never sees the real data at all. Its only feedback
              is how convincingly it fooled the discriminator.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/[0.07]">
            <div className="font-bold text-blue-400 mb-2">Discriminator D</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              An ordinary binary classifier: real or generated. As it improves it becomes a sharper critic, which
              raises the bar the generator must clear.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The discriminator is a learned loss function. That is the whole insight, and it is why GANs produce sharp
            output where a pixel-error objective produces blur.
          </p>
        </div>
      </section>

      <section id="loop" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Training Loop</h2>
        <div className="space-y-3 mb-6">
          {[
            ["1", "Train D on a real batch", "Show the discriminator real samples, labelled real. Standard supervised step."],
            ["2", "Train D on a fake batch", "Generate samples, label them fake, update D. G is frozen for both of these."],
            ["3", "Train G through D", "Generate again, but now label the fakes real and backpropagate through the frozen discriminator into G. The gradient tells G which direction makes its output more convincing."],
            ["4", "Repeat, and keep neither too far ahead", "The balance between the two is the whole difficulty. Progress requires both to stay roughly matched."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400 font-bold flex items-center justify-center text-sm">
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
          <p className="text-sm text-indigo-100 leading-relaxed m-0">
            Step three uses the <strong>non-saturating</strong> form in practice: maximise log D(G(z)) rather than
            minimise log(1 − D(G(z))). The two have the same optimum, but the original saturates precisely when the
            generator is bad and most needs a gradient.
          </p>
        </div>
      </section>

      <section id="lab" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Run One</h2>
        <GanLab />
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          One simplification worth naming: the discriminator here is placed at its analytic optimum rather than
          trained by gradient descent alongside the generator. That makes the demo stable and the maths exact, but it
          removes the instability that defines real GAN training — where D is always slightly wrong and always moving.
        </p>
      </section>

      <section id="hard" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why They Are Hard</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Ordinary training descends toward a minimum. GAN training seeks a Nash equilibrium between two players, and
          gradient descent has no guarantee of finding one. These are the three failures you will actually meet.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FAILURES.map((f) => (
            <div key={f.n} className={`p-5 rounded-xl border ${f.box}`}>
              <div className={`font-semibold mb-1.5 ${f.label}`}>{f.n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="variants" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Variants Worth Knowing</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Variant</th>
                <th className="px-4 py-3 font-semibold text-white">What it changed</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["DCGAN", "Established the convolutional architecture conventions — strided convolutions, batch norm, no fully-connected layers — that made GANs trainable at all."],
                ["WGAN / WGAN-GP", "Replaced the JS divergence with the Wasserstein distance, which gives usable gradients even when the two distributions barely overlap. The loss finally correlates with sample quality."],
                ["Conditional GAN", "Feeds a class label to both networks, so you can ask for a specific category instead of a random sample."],
                ["Pix2Pix / CycleGAN", "Image-to-image translation. CycleGAN's contribution was learning it without paired examples, using a cycle-consistency constraint."],
                ["StyleGAN", "Injects style at every resolution rather than only at the input. Still the reference point for photorealistic face synthesis and controllable latent editing."],
              ].map(([n, d]) => (
                <tr key={n} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-fuchsia-300 whitespace-nowrap align-top">{n}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch
import torch.nn as nn

bce = nn.BCEWithLogitsLoss()
opt_d = torch.optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_g = torch.optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))

for real in loader:
    bs = real.size(0)
    z = torch.randn(bs, latent_dim, device=device)
    fake = G(z)

    # --- Discriminator: real should score high, fake should score low ---
    opt_d.zero_grad()
    # 0.9 instead of 1.0 is one-sided label smoothing — it stops D from
    # becoming overconfident and starving G of gradient.
    loss_real = bce(D(real), torch.full((bs, 1), 0.9, device=device))
    # detach so this step does not backpropagate into the generator
    loss_fake = bce(D(fake.detach()), torch.zeros(bs, 1, device=device))
    (loss_real + loss_fake).backward()
    opt_d.step()

    # --- Generator: non-saturating loss, fakes labelled real ---
    opt_g.zero_grad()
    loss_g = bce(D(fake), torch.ones(bs, 1, device=device))
    loss_g.backward()
    opt_g.step()`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Two details do most of the work here: <span className="font-mono text-gray-400">betas=(0.5, 0.999)</span>,
          because Adam's default momentum destabilises adversarial training, and the{" "}
          <span className="font-mono text-gray-400">.detach()</span> on the fake batch, without which the
          discriminator step would also update the generator in the wrong direction.
        </p>
      </section>

      <section id="diffusion" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">GANs vs Diffusion</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Diffusion models took over image generation because they train with a stable regression objective —
          predicting the noise added to an image — rather than a minimax game. No mode collapse, no balancing act,
          and better coverage of the data distribution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/[0.07]">
            <div className="font-semibold text-fuchsia-400 mb-2">GANs still win on</div>
            <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5">
              <li>Speed — one forward pass per sample, against dozens of denoising steps.</li>
              <li>Real-time and on-device generation.</li>
              <li>Super-resolution and image enhancement.</li>
              <li>Smooth, editable latent spaces (StyleGAN).</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/[0.07]">
            <div className="font-semibold text-blue-400 mb-2">Diffusion wins on</div>
            <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5">
              <li>Sample diversity and coverage of the full distribution.</li>
              <li>Training stability — it is a supervised regression problem.</li>
              <li>Text conditioning at scale.</li>
              <li>Peak fidelity on hard, varied datasets.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The adversarial idea did not disappear with the architecture. A learned critic supplying the training
            signal is exactly what reward models do in{" "}
            <a href="#/genai/fine-tuning" className="text-blue-400 hover:underline">RLHF</a>, and the current fast
            diffusion samplers distil many steps into one using an adversarial objective.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

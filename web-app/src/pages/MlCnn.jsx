import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Convolution, computed. The kernels below are applied numerically to a real
   grayscale grid and the output values are the arithmetic, not a picture of it.
-------------------------------------------------------------------------- */

// A 10×10 grayscale "image": a bright square with a soft diagonal edge.
const IMG = (() => {
  const g = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 10; c++) {
      const box = r >= 2 && r <= 7 && c >= 2 && c <= 7 ? 0.85 : 0.1;
      const diag = c - r > 1 ? 0.25 : 0;
      row.push(Math.min(1, box + diag));
    }
    g.push(row);
  }
  return g;
})();

const KERNELS = {
  "Vertical edge": [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ],
  "Horizontal edge": [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ],
  Blur: [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ],
  Sharpen: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
};

function convolve(img, k) {
  const n = img.length;
  const out = [];
  for (let r = 1; r < n - 1; r++) {
    const row = [];
    for (let c = 1; c < n - 1; c++) {
      let s = 0;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) s += img[r + i][c + j] * k[i + 1][j + 1];
      row.push(s);
    }
    out.push(row);
  }
  return out;
}

const cell = (v, min, max) => {
  const t = max === min ? 0.5 : (v - min) / (max - min);
  const g = Math.round(t * 235) + 10;
  return `rgb(${g},${g},${g})`;
};

function Grid({ data, size = 22, highlight, radius = 1, onHover }) {
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  return (
    <div className="inline-block">
      {data.map((row, r) => (
        <div key={r} className="flex">
          {row.map((v, c) => {
            const on =
              highlight && Math.abs(r - highlight[0]) <= radius && Math.abs(c - highlight[1]) <= radius;
            return (
              <div
                key={c}
                onMouseEnter={onHover ? () => onHover([r, c]) : undefined}
                style={{ width: size, height: size, background: cell(v, min, max) }}
                className={`border ${on ? "border-amber-400" : "border-black/40"} ${onHover ? "cursor-crosshair" : ""}`}
                title={v.toFixed(2)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ConvolutionLab() {
  const [kernelName, setKernelName] = useState("Vertical edge");
  const [pos, setPos] = useState([4, 4]);
  const kernel = KERNELS[kernelName];

  const out = useMemo(() => convolve(IMG, kernel), [kernel]);

  // The one output value under the cursor, spelled out term by term.
  const [r, c] = pos;
  const clampR = Math.min(Math.max(r, 1), 8);
  const clampC = Math.min(Math.max(c, 1), 8);
  const terms = [];
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const px = IMG[clampR + i][clampC + j];
      const kv = kernel[i + 1][j + 1];
      sum += px * kv;
      terms.push({ px, kv });
    }
  }

  return (
    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.07] p-6">
      <h3 className="text-blue-400 font-bold mb-1">One kernel, slid across one image</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Hover the input grid. The nine highlighted pixels get multiplied by the nine kernel weights and summed into a
        single output pixel. That is the whole operation — repeated at every position, which is what the right-hand
        grid shows.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {Object.keys(KERNELS).map((k) => (
          <button
            key={k}
            onClick={() => setKernelName(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              kernelName === k
                ? "border-blue-500/50 bg-blue-500/20 text-blue-200"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6 justify-center mb-5">
        <div className="text-center">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">Input 10×10</div>
          <Grid data={IMG} highlight={[clampR, clampC]} onHover={setPos} />
        </div>

        <div className="text-center">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-2">Kernel 3×3</div>
          <div className="inline-block rounded-lg border border-amber-500/30 bg-black/40 p-1.5">
            {kernel.map((row, i) => (
              <div key={i} className="flex">
                {row.map((v, j) => (
                  <div
                    key={j}
                    className="w-11 h-11 flex items-center justify-center text-[0.6875rem] font-mono text-amber-200 border border-amber-500/20"
                  >
                    {Number.isInteger(v) ? v : v.toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">Output 8×8</div>
          <Grid data={out} highlight={[clampR - 1, clampC - 1]} radius={0} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-white/10">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">
          Output pixel at row {clampR - 1}, col {clampC - 1}
        </div>
        <div className="font-mono text-[0.6875rem] text-gray-400 leading-relaxed break-words">
          {terms.map((t, i) => (
            <span key={i}>
              {i > 0 && " + "}
              {t.px.toFixed(2)}×{Number.isInteger(t.kv) ? t.kv : t.kv.toFixed(2)}
            </span>
          ))}
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-blue-300">= {sum.toFixed(3)}</div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        The vertical-edge kernel returns near zero everywhere the neighbourhood is flat, and spikes only where
        brightness changes left-to-right. Nobody wrote "find an edge" — it falls out of the arithmetic. In a real CNN
        these nine weights are not chosen by hand; they are learned by backpropagation.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ShapeCalculator() {
  const [size, setSize] = useState(32);
  const [k, setK] = useState(3);
  const [stride, setStride] = useState(1);
  const [pad, setPad] = useState(1);

  const out = Math.floor((size + 2 * pad - k) / stride) + 1;
  const valid = out > 0;

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.07] p-6">
      <h3 className="text-purple-400 font-bold mb-1">Output size — the formula you will actually need</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Most CNN bugs are shape mismatches. There is one formula and it is worth internalising:{" "}
        <span className="font-mono text-purple-300">out = ⌊(in + 2·pad − kernel) / stride⌋ + 1</span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          ["Input size", size, setSize, 8, 64, 1],
          ["Kernel", k, setK, 1, 7, 2],
          ["Stride", stride, setStride, 1, 4, 1],
          ["Padding", pad, setPad, 0, 3, 1],
        ].map(([label, val, set, min, max, step]) => (
          <label key={label} className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full mt-2 accent-purple-500"
            />
            <span className="font-mono text-purple-300 text-sm">{val}</span>
          </label>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">
          {size}×{size} → convolution →
        </div>
        <div className={`text-3xl font-bold font-mono ${valid ? "text-purple-300" : "text-rose-400"}`}>
          {valid ? `${out}×${out}` : "invalid"}
        </div>
        <div className="text-[0.6875rem] text-gray-500 mt-1 font-mono">
          ⌊({size} + 2·{pad} − {k}) / {stride}⌋ + 1
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Set kernel 3, stride 1, padding 1 and the size is preserved exactly. That combination is so common it has a
        name — "same" padding — and it is why 3×3 kernels dominate modern architectures.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function MlCnn() {
  const toc = [
    { label: "Why Not a Dense Layer", hash: "why" },
    { label: "The Convolution", hash: "conv" },
    { label: "Three Big Ideas", hash: "ideas" },
    { label: "Pooling", hash: "pooling" },
    { label: "Output Shapes", hash: "shapes" },
    { label: "A Full Architecture", hash: "arch" },
    { label: "In Code", hash: "code" },
    { label: "Where CNNs Stand Now", hash: "now" },
  ];

  return (
    <GuideLayout
      title="Convolutional Neural Networks"
      intro="A small window of weights slid across an image, reused at every position. That one constraint is what made computer vision work."
      toc={toc}
    >
      <section id="why" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why Not Just Use a Dense Layer?</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Flatten a modest 224×224 colour image and you have 150,528 inputs. A single fully-connected layer of 1,000
          units on top of that needs over 150 million weights — for one layer, on one small image. The parameter count
          alone makes it untrainable.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Worse, it throws away the thing that makes an image an image. Flattening tells the network nothing about
          which pixels were neighbours, so a cat shifted three pixels right is, to a dense layer, an entirely
          different input it has to learn about separately.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-semibold text-rose-400 mb-2">Dense layer on pixels</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Parameters scale with image size.</li>
              <li>No notion of adjacency.</li>
              <li>Must relearn every feature at every position.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-semibold text-emerald-400 mb-2">Convolutional layer</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Parameters scale with kernel size only.</li>
              <li>Adjacency is built into the operation.</li>
              <li>A feature learned once applies everywhere.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="conv" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Convolution</h2>
        <ConvolutionLab />
      </section>

      <section id="ideas" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Big Ideas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              n: "Local receptive fields",
              d: "Each output looks at a small patch, not the whole image. Nearby pixels are related; distant ones usually are not, and the architecture encodes that prior directly.",
              box: "border-blue-500/25 bg-blue-500/[0.07]",
              label: "text-blue-400",
            },
            {
              n: "Weight sharing",
              d: "The same nine weights are used at every position. An edge detector learned in the top-left corner works in the bottom-right for free — and the parameter count stops depending on image size.",
              box: "border-emerald-500/25 bg-emerald-500/[0.07]",
              label: "text-emerald-400",
            },
            {
              n: "Hierarchy",
              d: "Early layers find edges. Middle layers combine edges into textures and parts. Late layers combine parts into objects. Nobody designs that ladder; stacking convolutions produces it.",
              box: "border-purple-500/25 bg-purple-500/[0.07]",
              label: "text-purple-400",
            },
          ].map((i) => (
            <div key={i.n} className={`p-5 rounded-xl border ${i.box}`}>
              <div className={`font-semibold mb-1.5 ${i.label}`}>{i.n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{i.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            A layer does not learn one kernel but many — typically 32 to 512 of them, each producing its own output
            channel. One might respond to vertical edges, another to a particular colour gradient. The next layer
            convolves across all of those channels at once.
          </p>
        </div>
      </section>

      <section id="pooling" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Pooling</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Pooling downsamples: take each 2×2 block and keep only its maximum. The feature map halves in each
          dimension, which cuts computation and — more importantly — makes the representation tolerant of small
          shifts. Whether the edge was at pixel 8 or pixel 9 stops mattering.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Max pooling</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Keeps the strongest activation in each block. The standard choice: it answers "was this feature present
              anywhere nearby" which is usually the question that matters.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Strided convolution instead</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Many modern architectures drop pooling entirely and downsample with stride-2 convolutions, letting the
              network learn how to reduce resolution rather than hard-coding the maximum.
            </p>
          </div>
        </div>
      </section>

      <section id="shapes" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Output Shapes</h2>
        <ShapeCalculator />
      </section>

      <section id="arch" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A Full Architecture</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Nearly every classification CNN follows the same shape: spatial dimensions shrink while channel count grows,
          then a head turns the final feature map into class scores.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          {[
            ["224×224×3", "text-gray-300 border-gray-700 bg-black/40"],
            ["conv+pool", "text-blue-300 border-blue-500/40 bg-blue-900/20"],
            ["112×112×64", "text-gray-300 border-gray-700 bg-black/40"],
            ["conv+pool", "text-blue-300 border-blue-500/40 bg-blue-900/20"],
            ["56×56×128", "text-gray-300 border-gray-700 bg-black/40"],
            ["conv+pool", "text-blue-300 border-blue-500/40 bg-blue-900/20"],
            ["7×7×512", "text-gray-300 border-gray-700 bg-black/40"],
            ["global pool + fc", "text-purple-300 border-purple-500/40 bg-purple-900/20"],
            ["1000 classes", "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"],
          ].map(([label, cls], i) => (
            <React.Fragment key={label + i}>
              {i > 0 && <span className="text-gray-600">→</span>}
              <span className={`px-3 py-1.5 border rounded-full ${cls}`}>{label}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The one architectural idea worth knowing beyond this:</strong> residual connections. Adding the
            input of a block to its output (<span className="font-mono">y = f(x) + x</span>) gives gradients a path
            that skips the block entirely, which is what made networks past ~20 layers trainable. Every serious vision
            model since has used them, and so does every transformer.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, n_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # 3 -> 32 channels, "same" padding keeps 32x32
            nn.Conv2d(3, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                    # 32x32 -> 16x16

            nn.Conv2d(32, 64, 3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                    # 16x16 -> 8x8

            nn.Conv2d(64, 128, 3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
        )
        # Global average pooling instead of flatten: the head no longer
        # depends on input resolution, and it costs far fewer parameters.
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.head = nn.Linear(128, n_classes)

    def forward(self, x):
        x = self.features(x)
        x = self.pool(x).flatten(1)
        return self.head(x)`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Note <span className="font-mono text-gray-400">bias=False</span> on every convolution followed by batch
          norm. Batch norm subtracts the mean immediately after, so the bias term has no effect and is pure wasted
          parameters.
        </p>
      </section>

      <section id="now" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where CNNs Stand Now</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Vision transformers overtook CNNs on the largest benchmarks by dropping the locality prior and letting
          attention learn relationships from data. That works when you have enormous datasets. Below that scale the
          convolutional prior is genuinely useful information, and CNNs still win.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Still the right choice</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Modest datasets — thousands to hundreds of thousands of images.</li>
              <li>Edge and mobile deployment, where efficiency decides.</li>
              <li>Medical and scientific imaging with limited labelled data.</li>
              <li>Dense prediction: segmentation, super-resolution, denoising.</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-gray-200 font-semibold mb-2">Reach for attention instead</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Very large-scale pretraining is available to you.</li>
              <li>Long-range relationships across the whole image matter.</li>
              <li>You want one architecture across image, text, and audio.</li>
              <li>See <a href="#/ml/transformers" className="text-blue-400 hover:underline">Transformers</a>.</li>
            </ul>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("dl-cnn")} />
    </GuideLayout>
  );
}

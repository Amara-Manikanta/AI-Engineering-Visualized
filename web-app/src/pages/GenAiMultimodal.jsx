import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import CodeBlock from "../components/CodeBlock";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { rng, randn, normPdf, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "multimodal", "generative models", "diffusion models", "denoising diffusion", "DDPM", "noise schedule",
  "latent diffusion", "Stable Diffusion", "flow matching", "rectified flow", "classifier-free guidance", "CFG",
  "guidance scale", "DiT", "diffusion transformer", "VAE", "variational autoencoder", "latent space",
  "Vision Transformer", "ViT", "patch embeddings", "CLIP", "contrastive learning", "text-to-image",
  "text-to-video", "video generation", "speech recognition", "ASR", "Whisper", "text-to-speech", "TTS",
  "music generation", "world models", "FID", "CLIP score",
];

/* ---------------------------------------------------------------------------
   Forward diffusion on a 12×12 image: x_t = √ᾱ_t · x₀ + √(1−ᾱ_t) · ε,
   with a cosine schedule. The model's job is the reverse direction.
--------------------------------------------------------------------------- */

const SIZE = 12;
const IMAGE = Array.from({ length: SIZE * SIZE }, (_, i) => {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const d = Math.hypot(r - 5.5, c - 5.5);
  return d < 3.2 ? 1 : d < 4.6 ? -0.2 : -1; // a bright disc on a dark background
});
const NOISE = (() => {
  const r = rng(12);
  return IMAGE.map(() => randn(r));
})();
const alphaBar = (t) => Math.cos(((t + 0.008) / 1.008) * (Math.PI / 2)) ** 2;

function DiffusionLab() {
  const [t, setT] = useState(0.3);
  const ab = alphaBar(t);
  const xt = IMAGE.map((x0, i) => Math.sqrt(ab) * x0 + Math.sqrt(1 - ab) * NOISE[i]);
  const snr = ab / (1 - ab);
  const cell = 16;
  const shade = (v) => {
    const g = Math.round(Math.max(0, Math.min(1, (v + 1.6) / 3.2)) * 255);
    return `rgb(${g},${g},${Math.min(255, g + 20)})`;
  };
  const grid = (vals) => (
    <svg viewBox={`0 0 ${SIZE * cell} ${SIZE * cell}`} className="w-full h-auto block rounded-md border border-white/10">
      {vals.map((v, i) => (
        <rect key={i} x={(i % SIZE) * cell} y={Math.floor(i / SIZE) * cell} width={cell} height={cell} fill={shade(v)} />
      ))}
    </svg>
  );
  return (
    <Panel tone="indigo" title="The forward process: add noise until nothing is left">
      <div className="grid grid-cols-3 gap-3 max-w-lg mb-4">
        <div><div className="text-[0.6875rem] text-gray-500 mb-1">clean x₀</div>{grid(IMAGE)}</div>
        <div><div className="text-[0.6875rem] text-gray-500 mb-1">noisy x_t</div>{grid(xt)}</div>
        <div><div className="text-[0.6875rem] text-gray-500 mb-1">pure noise ε</div>{grid(NOISE)}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
        <Slider label="Diffusion time t (0 = clean, 1 = noise)" value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Signal kept √ᾱ" value={fmt(Math.sqrt(ab), 2)} tone="indigo" />
          <Metric label="SNR" value={snr > 100 ? ">100" : fmt(snr, 2)} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Training is simple: pick a clean image, a random time t and random noise, build x_t exactly as shown, and
        train a network to predict the noise ε from x_t and t. Generation runs it backwards — start from pure
        noise and repeatedly remove the predicted noise, a little at a time. Because the forward process is
        known in closed form, every training example costs one noising step, not a whole chain.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Classifier-free guidance on 1-D Gaussians. The guided score
   s = s_uncond + w·(s_cond − s_uncond) corresponds to another Gaussian,
   so its effect can be drawn exactly.
--------------------------------------------------------------------------- */

const U = { mu: 0, sd: 2 }; // "any image"
const C = { mu: 2, sd: 1 }; // "images matching the prompt"

function guided(w) {
  const pu = 1 / U.sd ** 2;
  const pc = 1 / C.sd ** 2;
  const prec = (1 - w) * pu + w * pc;
  const mu = ((1 - w) * pu * U.mu + w * pc * C.mu) / prec;
  return { mu, sd: 1 / Math.sqrt(prec) };
}

function GuidanceLab() {
  const [w, setW] = useState(1);
  const g = useMemo(() => guided(w), [w]);
  const W = 360;
  const H = 150;
  const lo = -6;
  const hi = 8;
  const sx = (x) => 10 + ((x - lo) / (hi - lo)) * (W - 20);
  const peak = normPdf(g.mu, g.mu, g.sd);
  const sy = (y) => H - 20 - (y / Math.max(peak, normPdf(0, 0, C.sd))) * (H - 30);
  const curve = (mu, sd) => {
    let d = "";
    for (let i = 0; i <= 140; i++) {
      const x = lo + ((hi - lo) * i) / 140;
      d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(normPdf(x, mu, sd)).toFixed(1)}`;
    }
    return d;
  };
  return (
    <Panel tone="amber" title="Guidance scale: diversity traded for prompt adherence">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <path d={curve(U.mu, U.sd)} fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d={curve(C.mu, C.sd)} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <path d={curve(g.mu, g.sd)} fill="none" stroke="#fbbf24" strokeWidth="2.6" />
          <line x1="10" y1={H - 20} x2={W - 10} y2={H - 20} stroke="rgba(255,255,255,0.2)" />
          <text x="12" y="14" fill="#6b7280" fontSize="10">unconditional</text>
          <text x="12" y="28" fill="#60a5fa" fontSize="10">conditional (w = 1)</text>
          <text x="12" y="42" fill="#fbbf24" fontSize="10">sampled with guidance w</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="amber" label="Guidance scale w" value={w} min={0} max={10} step={0.5} onChange={setW} format={(v) => v.toFixed(1)} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Centre" value={fmt(g.mu, 2)} tone="amber" sub="prompt's centre is 2.00" />
            <Metric label="Spread (σ)" value={fmt(g.sd, 2)} sub="lower = less diverse" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The same network predicts noise with and without the prompt; guidance extrapolates from the unconditional
        prediction past the conditional one. In this exact Gaussian toy, w = 0 samples anything, w = 1 samples the
        prompt's distribution faithfully, and larger w pushes samples beyond it and squeezes their spread: images
        match the prompt more strongly but look more alike, and at extreme values they become oversaturated.
        Typical text-to-image settings sit around 3–8.
      </p>
    </Panel>
  );
}

function PatchLab() {
  const [res, setRes] = useState(224);
  const [patch, setPatch] = useState(16);
  const n = Math.floor(res / patch);
  const tokens = n * n;
  return (
    <Panel tone="emerald" title="How a vision transformer reads an image">
      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-5 items-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto block rounded-md">
          <rect width="200" height="200" fill="url(#vitGrad)" />
          <defs>
            <linearGradient id="vitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1e3a8a" />
              <stop offset="1" stopColor="#065f46" />
            </linearGradient>
          </defs>
          {Array.from({ length: Math.min(n, 40) + 1 }, (_, i) => (
            <g key={i}>
              <line x1={(i * 200) / Math.min(n, 40)} y1="0" x2={(i * 200) / Math.min(n, 40)} y2="200" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
              <line y1={(i * 200) / Math.min(n, 40)} x1="0" y2={(i * 200) / Math.min(n, 40)} x2="200" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider tone="emerald" label="Image resolution" value={res} min={112} max={1024} step={16} onChange={setRes} format={(v) => `${v}×${v}`} />
            <Slider tone="emerald" label="Patch size" value={patch} min={8} max={32} step={2} onChange={setPatch} format={(v) => `${v}×${v} px`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Patches per side" value={n} />
            <Metric label="Image tokens" value={tokens.toLocaleString()} tone="emerald" sub={`attention cost ∝ ${(tokens * tokens).toLocaleString()} pairs`} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            Each patch is flattened and linearly projected into a token embedding; the transformer then attends
            over patches exactly as it attends over words. Doubling resolution quadruples the tokens — which is
            why vision-language models downscale, tile, or compress images, and why images can be expensive in an
            LLM's context.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export default function GenAiMultimodal() {
  const toc = [
    { label: "Beyond Text", hash: "beyond" },
    { label: "Seeing: Vision Transformers & CLIP", hash: "vision" },
    { label: "Generating: VAEs & Latent Space", hash: "vae" },
    { label: "Diffusion Models", hash: "diffusion" },
    { label: "Classifier-Free Guidance", hash: "guidance" },
    { label: "Modern Image & Video Generation", hash: "modern" },
    { label: "Audio & Speech", hash: "audio" },
    { label: "World Models", hash: "world" },
    { label: "Evaluating & Deploying", hash: "evaluating" },
  ];

  return (
    <GuideLayout
      title="Multimodal & Generative Models"
      intro="How models see, draw, speak and simulate: vision transformers and CLIP, VAEs and latent space, diffusion and classifier-free guidance computed live, latent diffusion and video, speech models, and world models."
      toc={toc}
    >
      <Section id="beyond" title="Beyond Text" lead="The same few ideas — tokens, transformers, embeddings shared across modalities — now cover images, audio and video, both as input and output.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Understanding" tone="indigo"><p>Vision-language models read images, documents, charts and video frames alongside text. See <a href="#/llms/types#vlm" className="text-blue-400 hover:underline">VLMs</a>.</p></Card>
          <Card title="Generation" tone="purple"><p>Diffusion and flow models turn text into images, video and audio; autoregressive models increasingly generate images too.</p></Card>
          <Card title="Any-to-any" tone="emerald"><p>Natively multimodal models take and produce several modalities in one conversation — real-time voice being the most visible.</p></Card>
        </div>
      </Section>

      <Section id="vision" title="Seeing: Vision Transformers & CLIP">
        <PatchLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <Card title="CLIP: a shared space for images and text" tone="indigo"><p>Train an image encoder and a text encoder together on hundreds of millions of image–caption pairs, pulling matching pairs together and pushing mismatches apart (contrastive learning). The result: an image and its description land near each other, enabling zero-shot classification, image search and text conditioning for generators.</p></Card>
          <Card title="From encoders to VLMs" tone="emerald"><p>A vision-language model feeds a vision encoder's patch embeddings through a small projector into an LLM's input sequence, so the LLM can reason over image tokens alongside text.</p></Card>
        </div>
      </Section>

      <Section id="vae" title="Generating: VAEs & Latent Space">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Autoencoder" tone="indigo"><p>Compress an input to a small code and reconstruct it. The code is a learned summary, but random codes decode to garbage.</p></Card>
          <Card title="Variational autoencoder" tone="purple"><p>Forces codes to follow a smooth, known distribution, so you can sample a random code and decode a plausible new example — and interpolate between examples.</p></Card>
          <Card title="Why it matters now" tone="emerald"><p>Modern image and video generators run in a VAE's compressed latent space rather than on raw pixels — many times cheaper. Compare the adversarial approach in <a href="#/ml/gans" className="text-blue-400 hover:underline">GANs</a>.</p></Card>
        </div>
      </Section>

      <Section id="diffusion" title="Diffusion Models" lead="Learn to undo noise, then create by denoising from pure noise.">
        <DiffusionLab />
      </Section>

      <Section id="guidance" title="Classifier-Free Guidance">
        <GuidanceLab />
      </Section>

      <Section id="modern" title="Modern Image & Video Generation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Latent diffusion" tone="indigo"><p>Encode images with a VAE, diffuse in the small latent space, decode at the end. The basis of Stable Diffusion and most open image models.</p></Card>
          <Card title="Diffusion transformers & flow matching" tone="purple"><p>The denoising network is now usually a transformer over latent patches (DiT), trained with flow matching — learning straight paths from noise to data — which needs fewer sampling steps.</p></Card>
          <Card title="Video" tone="amber"><p>The same machinery over spacetime patches of video latents. Keeping objects and motion consistent across frames is the central difficulty, and generation is expensive.</p></Card>
          <Card title="Control & editing" tone="emerald"><p>Image prompts, masks, depth or pose maps (ControlNet-style conditioning), and LoRA fine-tunes of a style or subject steer generation beyond text.</p></Card>
        </div>
      </Section>

      <Section id="audio" title="Audio & Speech">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Speech recognition" tone="indigo"><p>Encoder–decoder transformers over log-mel spectrograms (Whisper is the well-known open example) transcribe and translate speech, robust to accents and noise.</p></Card>
          <Card title="Text-to-speech" tone="emerald"><p>Modern TTS predicts discrete audio tokens from a neural codec, or uses diffusion/flow over spectrograms, then a vocoder. A few seconds of reference audio can clone a voice — hence consent and watermarking matter.</p></Card>
          <Card title="Speech-to-speech" tone="purple"><p>Voice agents either chain ASR → LLM → TTS (simple, modular) or use a native audio model (lower latency, keeps tone and interruptions).</p></Card>
        </div>
      </Section>

      <Section id="world" title="World Models" lead="Models that predict how an environment will change in response to actions — learned simulators.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="What they are for" tone="indigo"><p>Training and testing agents and robots in imagined environments, planning by imagining outcomes before acting, and interactive generated worlds for games and simulation.</p></Card>
          <Card title="How they relate" tone="amber"><p>Video generators already learn a lot of physics from data; action-conditioned models (predicting the next frame given a control input) turn that into an interactive simulator. Consistency over long horizons is still hard.</p></Card>
        </div>
      </Section>

      <Section id="evaluating" title="Evaluating & Deploying">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Metrics" tone="indigo"><p>FID compares feature statistics of generated and real images; CLIP score checks prompt alignment. Both are rough; human preference studies remain the standard.</p></Card>
          <Card title="Provenance" tone="rose"><p>Label and watermark generated media (for example C2PA content credentials). See <a href="#/safety/governance" className="text-blue-400 hover:underline">Responsible AI & Governance</a>.</p></Card>
          <Card title="Rights & consent" tone="amber"><p>Training data licensing, likeness and voice rights, and platform policies on synthetic media all apply.</p></Card>
        </div>
        <CodeBlock
          language="python"
          code={`import torch
from diffusers import AutoPipelineForText2Image

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16).to("cuda")

image = pipe(
    prompt="a watercolour lighthouse at dawn",
    guidance_scale=6.0,          # classifier-free guidance
    num_inference_steps=30,      # denoising steps
    generator=torch.Generator("cuda").manual_seed(7),
).images[0]
image.save("lighthouse.png")`}
        />
        <Note tone="indigo">Model names and defaults change quickly; check the model card for recommended guidance and step counts.</Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-multimodal")} />
    </GuideLayout>
  );
}

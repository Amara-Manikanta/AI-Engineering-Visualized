import React from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { AS_OF } from "../data/modelProfiles";
import { Card, Note } from "../components/VizKit";
import { GenerationDemo, Anatomy, ParamCounter, ComputeCalc, Families } from "../components/modeltypes/LlmDemos";
import { PatchDemo, ImageTokenCalc, ClipLab } from "../components/modeltypes/VlmDemos";
import { OvertrainChart, DeviceFit, Cascade } from "../components/modeltypes/SlmDemos";
import { RouterDemo, MoeCalc, MoeModels } from "../components/modeltypes/MoeDemos";
import { TokenVsConcept, Compounding } from "../components/modeltypes/OtherDemos";

export const SEARCH_KEYWORDS = [
  "model types", "LLM", "large language model", "VLM", "vision language model", "multimodal", "SLM",
  "small language model", "on-device model", "MoE", "mixture of experts", "router", "active parameters",
  "LCM", "large concept model", "SONAR", "LAM", "large action model", "computer use", "next token prediction",
  "temperature", "top-p", "parameter count", "KV cache", "image tokens", "vision encoder", "CLIP", "SigLIP",
  "patches", "Chinchilla", "tokens per parameter", "distillation", "load balancing", "expert parallelism",
];

/* One section header per model type, so each old URL can land on its section. */
function TypeSection({ id, icon, name, full, lead, children }) {
  return (
    <section id={id} className="mb-20 scroll-mt-24">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-white m-0">{name}</h2>
          <div className="text-xs uppercase tracking-wide text-gray-500">{full}</div>
        </div>
      </div>
      {lead && <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">{lead}</p>}
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function Sub({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

const TABLE = [
  ["LLM", "#llm", "text → text", "Predict the next token with a large transformer", "General assistants, writing, code, reasoning", "Claude Opus 5.5, GPT-6 Astra, Gemini 3.8 Flash"],
  ["VLM", "#vlm", "image + text → text", "Cut the image into patches and feed them in as tokens", "Documents, charts, screenshots, photos", "Gemini 3.8 Flash, Llama 4, Gemma 4, Phi-4-reasoning-vision"],
  ["SLM", "#slm", "text → text, on small hardware", "Few parameters, trained long, often distilled", "On-device, private, cheap high-volume tasks", "Gemma 4 E2B/E4B, Phi-4, Ministral 3, Llama 3.2 1B/3B"],
  ["MoE", "#moe", "same as an LLM", "Only a few expert sub-networks run per token", "Frontier quality at lower serving cost", "DeepSeek-V4, Qwen3.8-Max, gpt-oss, Llama 4"],
  ["LCM", "#lcm", "text → text via sentence vectors", "Predict the next sentence embedding, not token", "Research: multilingual, long-form planning", "Meta's Large Concept Model (2024)"],
  ["LAM", "#lam", "screen / tools → actions", "Trained on action trajectories, run in a loop", "Computer use, agents that act", "GPT-6 Astra computer use, Claude computer use, xLAM"],
  ["Decision", "#decision", "options → probabilities", "Score answers you supply; never generate text", "Routing, classification with calibrated confidence", "Jev, Laya"],
];

export default function LlmModelTypes() {
  const toc = [
    { label: "The Landscape", hash: "landscape" },
    { label: "LLM — Large Language Model", hash: "llm" },
    { label: "VLM — Vision Language Model", hash: "vlm" },
    { label: "SLM — Small Language Model", hash: "slm" },
    { label: "MoE — Mixture of Experts", hash: "moe" },
    { label: "LCM — Large Concept Model", hash: "lcm" },
    { label: "LAM — Large Action Model", hash: "lam" },
    { label: "Decision Models", hash: "decision" },
    { label: "Today's Model Families", hash: "today" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Model Types"
      intro="LLM, VLM, SLM, MoE, LCM, LAM — what each label means, how each works inside, and when to reach for it. One page, with a working demo for each."
      toc={toc}
    >
      {/* ------------------------------------------------------------------ */}
      <section id="landscape" className="mb-20 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Landscape</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          These labels are not rival species. They describe different <em>axes</em> of the same kind of model, so one
          model often carries several: Gemma 4 26B A4B is at once a mixture of experts, fairly small, and able to read
          images.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card title="Size" tone="emerald"><p>SLM ↔ LLM. How many parameters, and so where it can run.</p></Card>
          <Card title="Architecture" tone="amber"><p>Dense ↔ MoE. Does every parameter work on every token?</p></Card>
          <Card title="Input" tone="blue"><p>Text-only ↔ VLM. Can it read images (or audio, video)?</p></Card>
          <Card title="Output unit" tone="purple"><p>Tokens (LLM), sentence vectors (LCM), actions (LAM), or a choice (decision models).</p></Card>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">In → out</th>
                <th className="p-3">Core idea</th>
                <th className="p-3">Use it for</th>
                <th className="p-3">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {TABLE.map(([t, href, io, idea, use, ex]) => (
                <tr key={t}>
                  <td className="p-3"><a href={`#/llms/types${href}`} className="text-blue-400 font-semibold hover:underline">{t}</a></td>
                  <td className="p-3 font-mono text-xs text-gray-300">{io}</td>
                  <td className="p-3">{idea}</td>
                  <td className="p-3">{use}</td>
                  <td className="p-3 text-gray-300">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="llm"
        icon="💬"
        name="LLM"
        full="Large Language Model"
        lead="A transformer trained on trillions of tokens to predict the next token. That one skill, learned at scale, is the base every other type on this page builds on."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Architecture" tone="purple"><p>A decoder-only <a href="#/ml/transformers" className="text-blue-400 hover:underline">transformer</a>: identical blocks stacked dozens deep, each letting every token look back at all earlier tokens.</p></Card>
          <Card title="Data" tone="amber"><p>Trillions of tokens of web text, books, code and papers — and increasingly synthetic data written by other models.</p></Card>
          <Card title="Objective" tone="indigo"><p>Predict the next token. Doing it well across so much text forces the model to learn grammar, facts, reasoning patterns and code.</p></Card>
        </div>
        <Sub title="Generation, token by token">
          <GenerationDemo />
        </Sub>
        <Sub title="What is inside">
          <Anatomy />
        </Sub>
        <Sub title="Where the parameters are">
          <ParamCounter />
        </Sub>
        <Sub title="How an LLM is made">
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 list-none p-0">
            {[
              ["Pretraining", "Next-token prediction on trillions of tokens — months of GPU time. The source of knowledge and general ability.", "#/models/training"],
              ["Supervised fine-tuning", "Example conversations teach the assistant format and instruction following.", "#/genai/fine-tuning"],
              ["Preference tuning", "RLHF, DPO or AI feedback teach it which answers people prefer.", "#/ml/rlhf"],
              ["Reasoning RL", "RL on checkable problems teaches it to think step by step first.", "#/ml/grpo"],
            ].map(([t, d, href], i) => (
              <li key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xs font-mono text-indigo-300 mb-1">stage {i + 1}</div>
                <a href={href} className="text-sm font-semibold text-white hover:text-blue-300">{t} →</a>
                <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-0">{d}</p>
              </li>
            ))}
          </ol>
        </Sub>
        <Sub title="How much compute training takes">
          <ComputeCalc />
        </Sub>
        <Sub title="Strengths and limits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
              <h4 className="text-emerald-400 font-semibold mb-2">Good at</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
                <li>Writing, rewriting, summarising and translating.</li>
                <li>Writing, explaining and debugging code.</li>
                <li>Step-by-step reasoning, especially with a thinking budget.</li>
                <li>Structured output (JSON) and calling tools — the basis of <a href="#/agents" className="text-blue-400 hover:underline">agents</a>.</li>
              </ul>
            </div>
            <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
              <h4 className="text-rose-400 font-semibold mb-2">Limits</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
                <li><strong className="text-white">Hallucination</strong> — trained for plausible text, not true text. Ground it with <a href="#/rag" className="text-blue-400 hover:underline">RAG</a>.</li>
                <li><strong className="text-white">Knowledge cutoff</strong> — knows nothing after its training data unless you supply it.</li>
                <li><strong className="text-white">No memory</strong> between calls; the conversation is re-sent every time.</li>
                <li><strong className="text-white">Token blindness</strong> — sees subword tokens, so counting letters trips it up.</li>
              </ul>
            </div>
          </div>
        </Sub>
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="vlm"
        icon="👁️"
        name="VLM"
        full="Vision Language Model"
        lead="An LLM that can also read images. The trick is to turn an image into tokens — vectors the language model treats exactly like words — so the same attention that reads a sentence can read a chart."
      >
        <Sub title="How an image becomes tokens">
          <PatchDemo />
        </Sub>
        <Sub title="Three ways to join vision and language">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Projector (adapter)" tone="blue"><p>A pretrained vision encoder, a small MLP projector, and an existing LLM. Image tokens are simply prepended to the text. Cheap to build; used by LLaVA and most open VLMs.</p></Card>
            <Card title="Cross-attention" tone="purple"><p>New attention layers inside the LLM look at the image features, while the original weights stay frozen. Used by DeepMind's Flamingo and Llama 3.2 Vision.</p></Card>
            <Card title="Native (early fusion)" tone="emerald"><p>Trained on interleaved images and text from the start, with no bolted-on encoder stage. Gemini and Llama 4 are described as natively multimodal.</p></Card>
          </div>
        </Sub>
        <Sub title="Where the vision encoder comes from">
          <ClipLab />
        </Sub>
        <Sub title="What an image costs">
          <ImageTokenCalc />
        </Sub>
        <Sub title="How VLMs are trained">
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 list-none p-0">
            {[
              ["Align", "Freeze the vision encoder and the LLM; train only the projector on image–caption pairs so image tokens land in the right place."],
              ["Instruction-tune", "Unfreeze and train on visual questions, charts, OCR, documents, screenshots and multi-turn conversations about images."],
              ["Preference-tune", "As for text models — RLHF or DPO, including penalties for describing things that are not in the image."],
            ].map(([t, d], i) => (
              <li key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xs font-mono text-blue-300 mb-1">stage {i + 1}</div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-0">{d}</p>
              </li>
            ))}
          </ol>
        </Sub>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strong at</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Reading documents, receipts and forms (OCR plus understanding).</li>
              <li>Charts, tables, diagrams and slides.</li>
              <li>Screenshots and interfaces — the basis of computer use.</li>
              <li>Describing and answering questions about photos.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Still weak at</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Counting many objects, and precise spatial relations.</li>
              <li>Small text in a downscaled image — crop or tile it.</li>
              <li>Hallucinating objects that "should" be in a scene.</li>
              <li>Text hidden in images can carry prompt injections.</li>
            </ul>
          </div>
        </div>
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="slm"
        icon="🐣"
        name="SLM"
        full="Small Language Model"
        lead="Roughly anything under about 15 billion parameters — small enough to run on a laptop, a single consumer GPU, or a phone. There is no official cut-off; what matters is where it can run."
      >
        <Sub title="Why small models got good">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <Card title="Train far longer" tone="emerald"><p>Many more tokens per parameter than the "compute-optimal" rule suggests — chart below.</p></Card>
            <Card title="Learn from a bigger model" tone="indigo"><p><a href="#/genai/distillation" className="text-blue-400 hover:underline">Distillation</a> from a large teacher's outputs or probabilities. Meta built Llama 3.2 1B and 3B by pruning and distilling larger Llamas.</p></Card>
            <Card title="Better data" tone="amber"><p>Microsoft's Phi models showed carefully filtered and synthetic "textbook-quality" data can stand in for sheer volume.</p></Card>
          </div>
          <OvertrainChart />
        </Sub>
        <Sub title="Will it run on my device?">
          <DeviceFit />
        </Sub>
        <Sub title="Using a small model to cut costs">
          <Cascade />
        </Sub>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Reach for an SLM when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Data must stay on the device or inside your network.</li>
              <li>You need low latency or offline use.</li>
              <li>The task is narrow — classification, extraction, routing — and you can fine-tune.</li>
              <li>Knowledge comes from retrieval, so the model mostly needs to read well.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Expect weaker</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>World knowledge — fewer parameters store fewer facts.</li>
              <li>Long, multi-step reasoning and agent tasks.</li>
              <li>Following long, complex instructions exactly.</li>
              <li>Rare languages and specialist domains, unless fine-tuned.</li>
            </ul>
          </div>
        </div>
        <Note tone="indigo">
          Related: <a href="#/genai/quantization" className="text-blue-400 hover:underline">Quantization</a> makes them fit,{" "}
          <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a> makes fine-tuning them cheap, and the{" "}
          <a href="#/models/gemma" className="text-blue-400 hover:underline">Gemma</a> and{" "}
          <a href="#/models/phi" className="text-blue-400 hover:underline">Phi</a> pages cover two small-model families in depth.
        </Note>
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="moe"
        icon="🧩"
        name="MoE"
        full="Mixture of Experts"
        lead="In a dense model every parameter works on every token. A mixture of experts replaces each feed-forward block with many smaller 'expert' networks and a router that sends each token to only a few of them — so the model can be enormous while each token pays for a small slice."
      >
        <Sub title="Routing, live">
          <RouterDemo />
        </Sub>
        <Sub title="The two numbers that matter">
          <MoeCalc />
        </Sub>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">What you gain</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>More knowledge capacity per unit of compute.</li>
              <li>Cheaper training and faster generation than a dense model of the same quality.</li>
              <li>A path to trillion-parameter models that can still be served.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">What you pay</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Memory for every expert, used or not.</li>
              <li>Communication: experts spread across GPUs must swap tokens every layer.</li>
              <li>Balancing the router, and less stable fine-tuning.</li>
              <li>Worse efficiency at small batch sizes, where tokens scatter across experts.</li>
            </ul>
          </div>
        </div>
        <Note tone="amber">
          <strong>Do experts specialise by topic?</strong> Mostly not. Mistral's analysis of Mixtral found no clear
          "maths expert" or "biology expert"; routing followed syntax more than subject — for example, similar code
          tokens going to the same experts. Newer designs (DeepSeek's many fine-grained experts plus always-on shared
          experts) aim for sharper specialisation.
        </Note>
        <MoeModels />
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="lcm"
        icon="🪐"
        name="LCM"
        full="Large Concept Model"
        lead="A research direction from Meta (December 2024): instead of predicting the next token, predict the next sentence — represented as a vector in SONAR, a multilingual sentence-embedding space covering about 200 languages. The idea is to plan at the level of ideas, the way people outline before they write."
      >
        <TokenVsConcept />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Promise" tone="emerald"><p>Far fewer generation steps for long text, and one model that works in any language the embedding space covers.</p></Card>
          <Card title="Difficulty" tone="amber"><p>Many different sentences could plausibly come next. Averaging them gives a blurry vector, so Meta's best version generates the next embedding by diffusion, sampling one plausible sentence.</p></Card>
          <Card title="Status" tone="rose"><p>A research prototype scaled to 7B parameters and tested mainly on summarisation. No production model works this way today — worth knowing, not worth building on yet.</p></Card>
        </div>
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <TypeSection
        id="lam"
        icon="🎬"
        name="LAM"
        full="Large Action Model"
        lead="A model whose output is an action — a click, a keystroke, an API call — executed in a loop until a task is done. The term was popularised by the Rabbit R1 device in 2024 and is partly marketing: in practice a LAM is usually an LLM or VLM trained on action trajectories, running inside an agent loop."
      >
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 list-none p-0">
          {[
            ["Perceive", "A screenshot, the page structure, or a tool's result."],
            ["Decide", "Choose the next action and its arguments, as structured output."],
            ["Act", "The harness clicks, types, scrolls or calls the API."],
            ["Observe", "Check the new state. Did it work? Adjust and repeat."],
          ].map(([t, d], i) => (
            <li key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-xs font-mono text-rose-300 mb-1">{i + 1}</div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-0">{d}</p>
            </li>
          ))}
        </ol>
        <Compounding />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="How they are trained" tone="indigo"><p>Recorded human demonstrations, synthetic trajectories, screenshot-to-coordinate grounding data, and increasingly RL in sandboxed environments where success can be checked — see <a href="#/ml/grpo" className="text-blue-400 hover:underline">GRPO</a>.</p></Card>
          <Card title="Keep them safe" tone="rose"><p>Web pages can contain instructions aimed at the model. Run agents in sandboxes, give them least-privilege credentials, and require a human confirmation before anything irreversible — sending, paying, deleting.</p></Card>
        </div>
        <Note tone="indigo">
          The practical side — tool calling, agent loops, frameworks and debugging — is covered in{" "}
          <a href="#/agents/tool-calling" className="text-blue-400 hover:underline">Tool Calling</a> and{" "}
          <a href="#/agents" className="text-blue-400 hover:underline">AI Agents</a>. Benchmarks to watch: OSWorld
          (desktop tasks), WebArena (websites), SWE-bench (fixing real GitHub issues) and τ-bench (tool use with
          customers).
        </Note>
      </TypeSection>

      {/* ------------------------------------------------------------------ */}
      <section id="decision" className="mb-20 scroll-mt-24">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🎯</span>
          <h2 className="text-2xl font-bold text-white m-0">Decision Models</h2>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          The opposite of a generator: you supply the possible answers and the model returns a calibrated probability
          for each, in one forward pass. Fast, always on-schema, and never writes free text. Jev (TypeSafe AI) and the
          open-source Laya are the current examples.
        </p>
        <a href="#/genai/decision-models" className="inline-block px-4 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm font-semibold hover:bg-emerald-500/20">
          Decision Models — Jev and Laya, with demos →
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="today" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-3">Today's Model Families</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Current flagship of every major family as of {AS_OF}, with whether its weights are downloadable. Each card
          opens the family's page: lineup, weights and training pipeline.
        </p>
        <Families />
      </section>

      <section id="code" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import base64, anthropic

client = anthropic.Anthropic()

# LLM: text in, text out
msg = client.messages.create(
    model="claude-opus-5-5", max_tokens=300,
    messages=[{"role": "user", "content": "Why is the sky blue? One sentence."}],
)

# VLM: an image block alongside the text
img = base64.standard_b64encode(open("chart.png", "rb").read()).decode()
msg = client.messages.create(
    model="claude-opus-5-5", max_tokens=500,
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img}},
        {"type": "text", "text": "What is the trend in this chart?"},
    ]}],
)

# SLM: run a small open model locally (Ollama: ollama pull llama3.2:3b)
import ollama
reply = ollama.chat(model="llama3.2:3b", messages=[{"role": "user", "content": "Classify: 'refund not received' → billing / tech / sales"}])

# MoE: loads like any other model — but budget memory for ALL experts
from transformers import AutoModelForCausalLM
moe = AutoModelForCausalLM.from_pretrained("openai/gpt-oss-20b", torch_dtype="auto", device_map="auto")`}
        />
      </section>

      <KnowledgeCheck questions={questionsFor("genai-model-types")} />
    </GuideLayout>
  );
}

import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Cpu, Layers, Eye, Code2, Database, Music, Wrench, Compass, DollarSign, Award, HardDrive, Globe, ShieldAlert, Table, AlertTriangle, FileCode, Terminal, Sparkles } from 'lucide-react';

export default function LlmIndex() {
  const toc = [
    { label: "1. What are AI Models?", hash: "#what-are-ai-models" },
    { label: "2. Foundation vs Fine-Tuned Models", hash: "#foundation-vs-finetuned" },
    { label: "3. Model Families (OpenAI, Claude, Gemini, Llama, Qwen, DeepSeek, Mistral, Grok)", hash: "#model-families" },
    { label: "4. Closed Models vs Open-Weight Models", hash: "#closed-vs-open" },
    { label: "5. Dense Models vs MoE Models", hash: "#dense-vs-moe" },
    { label: "6. Reasoning Models (o1, DeepSeek-R1)", hash: "#reasoning-models" },
    { label: "7. Multimodal Models (Vision & Audio)", hash: "#multimodal-models" },
    { label: "8. Coding Models", hash: "#coding-models" },
    { label: "9. Embedding Models", hash: "#embedding-models" },
    { label: "10. Audio, Image, Video & Speech Models", hash: "#media-models" },
    { label: "11. Tool-Use & Agent Models", hash: "#tool-use-agents" },
    { label: "12. Model Selection Guide", hash: "#selection-guide" },
    { label: "13. Cost, Latency & Context Window", hash: "#cost-latency-context" },
    { label: "14. Benchmarks & Evaluation (MMLU, ELO)", hash: "#benchmarks-eval" },
    { label: "15. Running Models Locally (Ollama, vLLM)", hash: "#running-locally" },
    { label: "16. Model APIs & Aggregators", hash: "#model-apis" },
    { label: "17. Safety, Moderation & Guardrails", hash: "#safety-guardrails" },
    { label: "18. Model Comparison Table", hash: "#comparison-table" },
    { label: "19. Common Mistakes to Avoid", hash: "#common-mistakes" },
    { label: "20. Model Types in Depth", hash: "#model-types" }
  ];

  const MODEL_TYPES = [
    { n: "LLM", full: "Large Language Model", p: "#/llms/types#llm", icon: "💬", d: "The general-purpose text model everything else is defined against.", box: "border-indigo-500/30 bg-indigo-500/[0.08]", label: "text-indigo-400" },
    { n: "VLM", full: "Vision Language Model", p: "#/llms/types#vlm", icon: "👁️", d: "Reads images alongside text, in one shared representation.", box: "border-blue-500/30 bg-blue-500/[0.08]", label: "text-blue-400" },
    { n: "SLM", full: "Small Language Model", p: "#/llms/types#slm", icon: "🐣", d: "Small enough to run on your own hardware, and surprisingly capable.", box: "border-emerald-500/30 bg-emerald-500/[0.08]", label: "text-emerald-400" },
    { n: "MoE", full: "Mixture of Experts", p: "#/llms/types#moe", icon: "🧩", d: "Huge parameter count, only a fraction of it active per token.", box: "border-amber-500/30 bg-amber-500/[0.08]", label: "text-amber-400" },
    { n: "LCM", full: "Large Concept Model", p: "#/llms/types#lcm", icon: "🪐", d: "Predicts whole concepts rather than the next token.", box: "border-purple-500/30 bg-purple-500/[0.08]", label: "text-purple-400" },
    { n: "LAM", full: "Large Action Model", p: "#/llms/types#lam", icon: "🎬", d: "Trained to take actions in software, not just describe them.", box: "border-rose-500/30 bg-rose-500/[0.08]", label: "text-rose-400" },
    { n: "Decision", full: "Decision Models — Jev, Laya", p: "#/genai/decision-models", icon: "🎯", d: "Picks from answers you supply in one forward pass, with a calibrated probability. Never writes text.", box: "border-emerald-500/30 bg-emerald-500/[0.08]", label: "text-emerald-400" },
  ];

  return (
    <GuideLayout
      title="AI & LLM Models Master Guide"
      intro="Comprehensive technical reference for AI models — covering architecture families, open vs closed weights, MoE vs dense, reasoning models, local execution, cost optimization, and selection benchmarks."
      toc={toc}
    >
      {/* 1. WHAT ARE AI MODELS */}
      <section id="what-are-ai-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">1. What are AI Models?</h2>
            <p className="text-xs text-gray-400">Mathematical neural networks trained to compress patterns and predict probability distributions</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          An AI model is a complex mathematical function composed of millions to hundreds of billions of tunable numerical weights and biases arranged in neural network layers. During pre-training on massive multi-terabyte datasets, the model learns to compress human knowledge by predicting missing tokens, image pixels, or audio waveforms. When presented with a user prompt, the model calculates a conditional probability distribution over its vocabulary to generate coherent, contextually accurate output text or multimodal content.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> next_token_prediction.py</span>
            <span>Mathematical Concept</span>
          </div>
          <pre className="text-emerald-300 mb-3 whitespace-pre-wrap">{`# Probability P(next_token | context)
context = "Retrieval Augmented Generation reduces"
# Model computes logits across 100,000 token vocabulary:
# P("hallucinations" | context) = 0.84
# P("speed" | context)          = 0.09
# P("cost" | context)           = 0.04`}</pre>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Sample Output:</div>
            <code>Generated Next Token: "hallucinations" (Probability: 84%)</code>
          </div>
        </div>
      </section>

      {/* 2. FOUNDATION VS FINE-TUNED */}
      <section id="foundation-vs-finetuned" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">2. Foundation Models vs Fine-Tuned Models</h2>
            <p className="text-xs text-gray-400">Raw base pre-trained checkpoints vs task-aligned post-trained checkpoints (SFT, RLHF, DPO)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          **Foundation Models (Base Checkpoints)** are trained on raw internet text to perform general text completion, but they often ramble or repeat text instead of answering questions directly. **Fine-Tuned Models (Instruct/Chat Checkpoints)** undergo Post-Training using Supervised Fine-Tuning (SFT), Reinforcement Learning from Human Feedback (RLHF), or Direct Preference Optimization (DPO) to transform raw completion models into helpful, safe, instruction-following conversational assistants.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-indigo-300 block mb-1">🏗️ Base Foundation Model</span>
            <span className="text-[0.6875rem] text-gray-400 block mb-2">Raw next-token prediction without instruction alignment.</span>
            <code className="text-gray-300 bg-black/60 p-2 rounded block font-mono text-[0.625rem]">
              Prompt: "Write a poem about Python"<br/>
              Output: "Write a poem about C++. Write a poem about Java..."
            </code>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-300 block mb-1">⚡ Post-Tuned Instruct Model</span>
            <span className="text-[0.6875rem] text-gray-400 block mb-2">Aligned with SFT, DPO, and RLHF for direct task execution.</span>
            <code className="text-gray-300 bg-black/60 p-2 rounded block font-mono text-[0.625rem]">
              Prompt: "Write a poem about Python"<br/>
              Output: "Indented blocks and readable code, Python leads the AI road..."
            </code>
          </div>
        </div>
      </section>

      {/* 3. MODEL FAMILIES */}
      <section id="model-families" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">3. Major Model Families</h2>
            <p className="text-xs text-gray-400">OpenAI, Anthropic, Google, Meta, Alibaba, DeepSeek, Mistral, and xAI ecosystems</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The global AI landscape is driven by seven dominant model families, each with distinct architectural philosophies, context window capabilities, pricing structures, and licensing models:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-green-400 block">GPT (OpenAI)</span>
            <span className="text-[0.625rem] text-gray-400">Industry standard proprietary models: GPT-4o, GPT-4o-mini, o1, o3-mini. Excellent API ecosystem & tool calling.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-orange-400 block">Claude (Anthropic)</span>
            <span className="text-[0.625rem] text-gray-400">Premier coding & reasoning models: Claude 3.5 Sonnet, 3.5 Haiku, 3 Opus. Superior code syntax & computer use.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-blue-400 block">Gemini (Google)</span>
            <span className="text-[0.625rem] text-gray-400">Massive 2M+ token context windows: Gemini 1.5 Pro, 1.5 Flash, 2.0 Flash. Native multimodal video & audio parsing.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-cyan-400 block">Llama (Meta)</span>
            <span className="text-[0.625rem] text-gray-400">Open-weight foundation series: Llama 3.3 70B, Llama 3.1 405B, 3.2 Vision. Powers open-source self-hosting.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-purple-400 block">Qwen (Alibaba)</span>
            <span className="text-[0.625rem] text-gray-400">High-performance open weights: Qwen2.5 72B, Qwen2.5-Coder. Tops open coding & multilingual benchmarks.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-400 block">DeepSeek</span>
            <span className="text-[0.625rem] text-gray-400">Ultra-efficient MoE & reasoning models: DeepSeek-V3 (671B), DeepSeek-R1. Open weights with low training costs.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-amber-400 block">Mistral</span>
            <span className="text-[0.625rem] text-gray-400">High efficiency & European data sovereignty: Mistral Large, Mixtral 8x22B. Flexible open-weight and API models.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-slate-300 block">Grok (xAI)</span>
            <span className="text-[0.625rem] text-gray-400">Real-time social data & uncensored personality: Grok-2, Grok-3. Native X (Twitter) integration.</span>
          </div>
        </div>
      </section>

      {/* 4. CLOSED VS OPEN WEIGHTS */}
      <section id="closed-vs-open" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <HardDrive size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">4. Closed Models vs Open-Weight Models</h2>
            <p className="text-xs text-gray-400">Hosted API endpoints vs self-hostable downloadable weights (GGUF, Safetensors)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          **Closed Proprietary Models** (GPT-4o, Claude 3.5 Sonnet) are hosted on managed cloud infrastructure accessed via REST APIs. They offer state-of-the-art accuracy without infrastructure management, but carry data privacy concerns and pay-per-token pricing. **Open-Weight Models** (Llama 3.3, DeepSeek-R1, Qwen2.5) allow downloading full numerical weight matrices (`.safetensors`), enabling 100% offline self-hosting, custom fine-tuning, and zero vendor lock-in.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-cyan-300 block mb-1">☁️ Closed Models (APIs)</span>
            <ul className="list-disc list-inside text-[0.6875rem] text-gray-400 space-y-1">
              <li>Zero GPU hardware required</li>
              <li>State-of-the-art reasoning benchmarks</li>
              <li>Pay-per-token API consumption cost</li>
              <li>Vendor data privacy policies apply</li>
            </ul>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-300 block mb-1">💻 Open-Weight Models (Self-Hosted)</span>
            <ul className="list-disc list-inside text-[0.6875rem] text-gray-400 space-y-1">
              <li>100% data privacy & air-gapped security</li>
              <li>Custom LoRA / QLoRA fine-tuning flexibility</li>
              <li>Fixed hardware cost regardless of token volume</li>
              <li>Requires local GPU RAM (VRAM) or CPU inference</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. DENSE VS MOE */}
      <section id="dense-vs-moe" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">5. Dense Models vs Mixture of Experts (MoE)</h2>
            <p className="text-xs text-gray-400">100% parameter activation per token vs sparse router activation</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          In **Dense Models** (e.g., Llama 3 70B), every single parameter in the neural network is activated for every generated token. In **Mixture of Experts (MoE)** models (e.g., Mixtral 8x7B, DeepSeek-V3), a gating router network dynamically selects only a subset of expert sub-networks (e.g., 2 out of 8 experts, or 37B active out of 671B total parameters) for each token. This yields massive model intelligence while executing at high inference speeds with dramatically reduced compute requirements.
        </p>
      </section>

      {/* 6. REASONING MODELS */}
      <section id="reasoning-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">6. Reasoning Models (Chain-of-Thought)</h2>
            <p className="text-xs text-gray-400">Test-time compute scaling: OpenAI o1, o3-mini, and DeepSeek-R1</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Reasoning models spend extra "thinking time" (test-time compute) generating invisible internal Chain-of-Thought (CoT) tokens before producing their final response. Trained using Large-Scale Reinforcement Learning (RL), models like OpenAI **o1**, **o3-mini**, and **DeepSeek-R1** self-correct errors, verify mathematical proofs, and evaluate edge cases prior to outputting answers.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> reasoning_execution.py</span>
            <span>Reasoning Pattern</span>
          </div>
          <pre className="text-amber-300 mb-3 whitespace-pre-wrap">{`# Internal Chain-of-Thought (Invisible Thinking Phase)
<thought>
1. Identify mathematical constraints in prompt.
2. Evaluate potential edge cases (division by zero, negative integers).
3. Validate proof steps before emitting final answer.
</thought>

# Final Output Response
Result: 42 (Verified step-by-step)`}</pre>
        </div>
      </section>

      {/* 7. MULTIMODAL MODELS */}
      <section id="multimodal-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Eye size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">7. Multimodal Models (Vision & Text)</h2>
            <p className="text-xs text-gray-400">Native processing of text, images, diagrams, documents, and UI screenshots</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Vision Language Models (VLMs) like **GPT-4o**, **Gemini 1.5 Pro**, and **Claude 3.5 Sonnet** process visual inputs directly alongside text. Instead of relying on separate OCR tools, native multimodal models project image patches into the same embedding space as text tokens, allowing them to read complex financial charts, transcribe handwritten notes, parse UI screenshots, and analyze architectural diagrams.
        </p>
      </section>

      {/* 8. CODING MODELS */}
      <section id="coding-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">8. Specialized Coding Models</h2>
            <p className="text-xs text-gray-400">DeepSeek-Coder, Qwen2.5-Coder, Claude 3.5 Sonnet for code completion and refactoring</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Coding models are specifically fine-tuned on billions of source code repositories, commit histories, and technical documentation. Models like **Claude 3.5 Sonnet**, **DeepSeek-Coder-V2**, and **Qwen2.5-Coder-32B** excel at multi-file codebase refactoring, Fill-In-the-Middle (FIM) code completion, unit test generation, and bug fixing across dozens of programming languages.
        </p>
      </section>

      {/* 9. EMBEDDING MODELS */}
      <section id="embedding-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">9. Embedding Models</h2>
            <p className="text-xs text-gray-400">Converting text into dense numerical vectors for semantic vector search (`text-embedding-3`, `BGE-m3`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Embedding models convert arbitrary text strings into fixed-length dense numerical vectors (e.g., 1536 floats). Unlike generative models that output text tokens, embedding models output high-dimensional spatial coordinates. Related semantic concepts map closer together in vector space, underpinning semantic search retrieval in RAG architectures.
        </p>
      </section>

      {/* 10. MEDIA MODELS */}
      <section id="media-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Music size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">10. Audio, Image, Video & Speech Models</h2>
            <p className="text-xs text-gray-400">Whisper (ASR), FLUX / Midjourney (Image), Sora / Runway (Video), ElevenLabs (TTS)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Generative AI extends beyond text to specialized media domains: **Speech-to-Text (ASR)** models like Whisper transcribe audio; **Text-to-Image** models like FLUX.1 and Stable Diffusion generate photorealistic imagery; **Video Generation** models like Sora and Kling construct video sequences; and **Text-to-Speech (TTS)** engines like ElevenLabs clone voice audio with human nuance.
        </p>
      </section>

      {/* 11. TOOL USE AND AGENTS */}
      <section id="tool-use-agents" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">11. Tool-Use & Agent Models</h2>
            <p className="text-xs text-gray-400">Structured JSON function calling, ReAct execution loops, and external API invocation</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Agentic models are trained to output structured JSON tool calls instead of plain conversational text when facing complex queries. When given tool definitions (e.g., `web_search`, `execute_sql`), the model pauses generation and emits a structured function call payload, allowing execution engines to run external tools and pass results back into the model's context loop.
        </p>
      </section>

      {/* 12. SELECTION GUIDE */}
      <section id="selection-guide" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">12. Model Selection Guide</h2>
            <p className="text-xs text-gray-400">Decision matrix balancing latency, accuracy, cost, context window, and data privacy</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Choosing the right model requires matching architectural trade-offs to your specific production requirements. Use this decision matrix:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-amber-300 font-bold block mb-1">🎯 Complex Reasoning / Math</span>
            <span className="text-gray-400 text-[0.625rem]">Choose: OpenAI o1 / o3-mini or DeepSeek-R1</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-amber-300 font-bold block mb-1">💻 Heavy Coding & Refactoring</span>
            <span className="text-gray-400 text-[0.625rem]">Choose: Claude 3.5 Sonnet or Qwen2.5-Coder-32B</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-amber-300 font-bold block mb-1">⚡ Fast / Low-Cost High-Volume</span>
            <span className="text-gray-400 text-[0.625rem]">Choose: GPT-4o-mini, Gemini 1.5 Flash, or Llama 3.2 3B</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-amber-300 font-bold block mb-1">🔒 Air-Gapped Data Privacy</span>
            <span className="text-gray-400 text-[0.625rem]">Choose: Llama 3.3 70B, Qwen2.5 72B (Self-Hosted)</span>
          </div>
        </div>
      </section>

      {/* 13. COST LATENCY CONTEXT */}
      <section id="cost-latency-context" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">13. Cost, Latency & Context Window</h2>
            <p className="text-xs text-gray-400">Token pricing, Time-To-First-Token (TTFT), Tokens-Per-Second (TPS), 128k to 2M context sizes</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Production model performance depends on three core metrics: **Context Window** (how much text the model can process, e.g., 128k to 2M tokens), **Latency** (measured as TTFT for initial response and TPS for streaming speed), and **Cost** (input vs output token pricing per 1M tokens). Prompt caching can reduce input token costs by up to 80-90% on long repetitive contexts.
        </p>
      </section>

      {/* 14. BENCHMARKS */}
      <section id="benchmarks-eval" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">14. Benchmarks & Evaluation</h2>
            <p className="text-xs text-gray-400">MMLU, HumanEval, GSM8K, MATH, and LMSYS Chatbot Arena ELO ratings</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          AI capabilities are measured against standardized benchmarks: **MMLU** (general knowledge), **HumanEval** (Python coding accuracy), **GSM8K & MATH** (mathematical problem solving), and **LMSYS Chatbot Arena ELO** (crowdsourced blind A/B preference testing).
        </p>
      </section>

      {/* 15. RUNNING LOCALLY */}
      <section id="running-locally" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <HardDrive size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">15. Running Models Locally</h2>
            <p className="text-xs text-gray-400">Ollama, vLLM, LM Studio, llama.cpp, and GGUF quantization</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Self-hosting models locally eliminates third-party API costs and guarantees 100% data privacy. Tools like **Ollama** and **LM Studio** provide effortless single-command execution on Mac/PC, while high-throughput serving engines like **vLLM** utilize PagedAttention for production server deployments.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><Terminal size={12} /> Local Terminal Commands</span>
            <span>Ollama CLI</span>
          </div>
          <pre className="text-cyan-300 mb-3 whitespace-pre-wrap">{`# Run Llama 3.3 locally in 1 command
$ ollama run llama3.3:70b

# Run DeepSeek-R1 reasoning model locally
$ ollama run deepseek-r1:14b`}</pre>
        </div>
      </section>

      {/* 16. MODEL APIS */}
      <section id="model-apis" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">16. Model APIs & Aggregators</h2>
            <p className="text-xs text-gray-400">OpenAI SDK, Anthropic SDK, OpenRouter, LiteLLM unified interfaces</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Developers interface with model APIs via official provider SDKs or unified router proxy tools like **LiteLLM** and **OpenRouter**, which allow switching between 100+ underlying models using a single standardized OpenAI-compatible API signature.
        </p>
      </section>

      {/* 17. SAFETY & GUARDRAILS */}
      <section id="safety-guardrails" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">17. Safety, Moderation & Guardrail Models</h2>
            <p className="text-xs text-gray-400">Llama-Guard, NeMo Guardrails, OpenAI Moderation API, and prompt injection defense</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Production AI systems employ auxiliary guardrail models (like Meta's **Llama-Guard 3**) to inspect user prompts and model responses for jailbreak attempts, prompt injections, toxic content, and sensitive PII leaks before passing data to main application logic.
        </p>
      </section>

      {/* 18. COMPARISON TABLE */}
      <section id="comparison-table" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Table size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">18. Model Comparison Matrix</h2>
            <p className="text-xs text-gray-400">Comparing top flagship and open-weight models across key engineering parameters</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/60 text-purple-300 border-b border-white/10">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Open Weights?</th>
                <th className="p-3">Context Window</th>
                <th className="p-3">Cost / 1M (In/Out)</th>
                <th className="p-3">Primary Best Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Claude 3.5 Sonnet</td>
                <td className="p-3">Anthropic</td>
                <td className="p-3 text-red-400">No (Closed)</td>
                <td className="p-3">200k</td>
                <td className="p-3">$3.00 / $15.00</td>
                <td className="p-3 text-emerald-400">Coding & Agentic Work</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">GPT-4o</td>
                <td className="p-3">OpenAI</td>
                <td className="p-3 text-red-400">No (Closed)</td>
                <td className="p-3">128k</td>
                <td className="p-3">$2.50 / $10.00</td>
                <td className="p-3 text-emerald-400">General Intelligence & Vision</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Gemini 1.5 Pro</td>
                <td className="p-3">Google</td>
                <td className="p-3 text-red-400">No (Closed)</td>
                <td className="p-3 text-cyan-300 font-bold">2,000k (2M)</td>
                <td className="p-3">$1.25 / $5.00</td>
                <td className="p-3 text-emerald-400">Massive Document / Video RAG</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">DeepSeek-R1</td>
                <td className="p-3">DeepSeek</td>
                <td className="p-3 text-emerald-400 font-bold">Yes (MIT)</td>
                <td className="p-3">128k</td>
                <td className="p-3">$0.55 / $2.19</td>
                <td className="p-3 text-emerald-400">Reasoning & Math</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Llama 3.3 70B</td>
                <td className="p-3">Meta</td>
                <td className="p-3 text-emerald-400 font-bold">Yes (Llama 3)</td>
                <td className="p-3">128k</td>
                <td className="p-3">$0.40 / $0.40</td>
                <td className="p-3 text-emerald-400">Self-Hosted Enterprise RAG</td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">Grok-2</td>
                <td className="p-3">xAI</td>
                <td className="p-3 text-red-400">No (Closed)</td>
                <td className="p-3">128k</td>
                <td className="p-3">$2.00 / $10.00</td>
                <td className="p-3 text-emerald-400">Real-time Social Knowledge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 19. COMMON MISTAKES */}
      <section id="common-mistakes" className="mb-16 scroll-mt-24 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">19. Common Mistakes to Avoid</h2>
            <p className="text-xs text-gray-400">Avoid these frequent production pitfalls when selecting and deploying models</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-red-400 block mb-1">❌ 1. Defaulting to Oversized Flagship Models</span>
            <span className="text-gray-300 text-[0.6875rem]">Using expensive models like GPT-4o for simple classification or summarization tasks inflates latency and costs. Use smaller models like GPT-4o-mini or Llama 3.2 3B instead.</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-red-400 block mb-1">❌ 2. Ignoring Prompt Context Caching</span>
            <span className="text-gray-300 text-[0.6875rem]">Resending massive static system prompts or document context without enabling API prompt caching wastes 80%+ of token costs unnecessarily.</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-red-400 block mb-1">❌ 3. Hardcoding Provider-Specific Prompts</span>
            <span className="text-gray-300 text-[0.6875rem]">Tuning prompts tightly to one provider's specific quirk creates severe vendor lock-in. Use standardized system prompts and abstraction layers like LiteLLM.</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-red-400 block mb-1">❌ 4. Neglecting Rate Limits & Retries</span>
            <span className="text-gray-300 text-[0.6875rem]">Failing to wrap API calls in exponential backoff retry handlers (like `tenacity`) leads to application crashes when hitting 429 rate limits.</span>
          </div>
        </div>
      </section>

      {/* 20. MODEL TYPES IN DEPTH */}
      <section id="model-types" className="mb-8 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-3">20. Model Types in Depth</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The sections above treat these as categories. Each one also has its own page, covering the architecture and
          the tradeoff it exists to make.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODEL_TYPES.map((t) => (
            <a
              key={t.n}
              href={t.p}
              className={`block p-5 rounded-xl border transition-colors no-underline hover:brightness-125 ${t.box}`}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className={`font-bold ${t.label}`}>{t.n}</div>
              <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500 mb-2">{t.full}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{t.d}</p>
            </a>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}

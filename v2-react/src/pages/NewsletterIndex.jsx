import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

// Social Media Icons
function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.21a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.93 1.29-1.63 1.46-.48.12-1.11.22-3.23-.66-2.71-1.12-4.47-3.86-4.61-4.04-.13-.19-1.1-1.47-1.1-2.8 0-1.34.7-2 1-2.27.24-.22.54-.28.72-.28.18 0 .36 0 .52.01.17.01.4.06.62.59.23.55.77 1.88.84 2.02.07.14.11.3.02.48-.09.18-.14.29-.28.45-.14.17-.29.37-.41.5-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.74-.86.94-1.16.2-.29.4-.25.68-.14.28.11 1.77.83 2.07.98.3.15.5.23.57.35.08.13.08.73-.17 1.43" />
    </svg>
  );
}

function RedditIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m5.01 4.75c.69 0 1.25.56 1.25 1.25a1.25 1.25 0 0 1-2.22.81c-1.39-.45-3-.45-4.4 0a1.24 1.24 0 0 1-.64-.53l1.86-3.95 3.32.74c.2.98.83 1.68 1.83 1.68m-9.51 5.5c.78 0 1.42.64 1.42 1.42 0 .79-.64 1.43-1.42 1.43-.79 0-1.43-.64-1.43-1.43 0-.78.64-1.42 1.42-1.42m9 0c.78 0 1.42.64 1.42 1.42 0 .79-.64 1.43-1.42 1.43-.78 0-1.42-.64-1.42-1.43 0-.78.64-1.42 1.42-1.42m-4.5 4.75c-1.84 0-3.33-.78-3.33-.78-.17-.11-.22-.33-.11-.5.11-.17.33-.22.5-.11 0 0 1.29.64 2.94.64s2.94-.64 2.94-.64c.17-.11.39-.06.5.11.11.17.06.39-.11.5 0 0-1.49.78-3.33.78" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434" />
    </svg>
  );
}

function ShareIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

const EDITIONS = [
  {
    id: 1,
    shortName: "Needle (26M Zero-FFN)",
    title: "Kill the FFN: How Needle Packs 6,000 Tok/s Autonomous Tool Calling into Just 26M Weights",
    subtitle: "Deleting 70% of standard transformer bloat to turn $5 microcontrollers into microsecond agentic runtimes",
    date: "Oct 2026",
    category: "Edge & Hardware",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "6 min read",
    url: "https://github.com/cactus-compute/needle",
    repoName: "cactus-compute/needle",
    summary: "Needle is an open-source 26-million parameter automation foundation model engineered by Cactus Compute specifically for tiny edge devices, microcontrollers, and smartphones. By radically stripping out Feed-Forward Networks (FFNs) entirely and relying solely on a Simple Attention Network with gating mechanisms, Needle shrinks memory footprint to 8–29 MB under 2-bit quantization while delivering blazing inference speeds: 6,000 tokens/sec prefill and 1,200 tokens/sec decode on consumer edge chips.",
    whyHighlighted: "Why it's highlighted: Needle challenges the prevailing dogma that agentic function calling requires multi-billion parameter LLMs. By proving that a specialized 26M model without FFN bloat can reliably parse schemas, execute function calls, and extract structured data at milliwatt power consumption, it opens the floodgates for true on-device autonomy in robotics, wearables, and offline IoT sensors.",
    hook: "Every time an agent spins up a 70-billion parameter frontier model just to extract a date or invoke a Python function, an engineer somewhere is burning a small power substation to swat a fly. We've accepted a bizarre premise: that deterministic tool dispatch requires encyclopedic general intelligence. It doesn't.",
    problem: "Standard transformer architectures are dominated by Feed-Forward Networks (FFNs). In a typical LLM, FFN/MLP blocks account for 65% to 75% of total parameter count and memory bandwidth. These dense matrix layers act as massive associative memories storing historical trivia, song lyrics, and encyclopedic facts. When building an edge device—a drone controller, an offline smartwatch, or an industrial sensor—you don't need a model that writes poetry. You need a model that parses an API schema, maps arguments, and dispatches a JSON call in under 5 milliseconds without cooking your battery or exceeding 16MB of RAM.",
    intuition: "Think of attention as 'routing logic' and FFNs as 'the library'. If your entire job is to route incoming sensor telemetry into a predefined tool signature, why carry the whole library across your memory bus? By deleting the FFN layers entirely, Cactus Compute stripped away 70% of the transformer's parameter mass while keeping the gated attention mechanism intact. The result is pure routing reflex: zero dead weight, pure execution speed.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│              NEEDLE ZERO-FFN ATTENTION PIPELINE             │
└─────────────────────────────────────────────────────────────┘
  Raw Input Tokens: ["temp: 42C", "fan: off"]
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │         Token Embedding (26M Total Weights)             │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │       Simple Gated Attention Block (Repeated N times)   │
  │  ┌────────────────────┐       ┌──────────────────────┐  │
  │  │   Multi-Head QKV   │  ───► │ Gated State Mixer    │  │
  │  │ Linear Projections │       │ (Learned Gates W_g)  │  │
  │  └────────────────────┘       └──────────────────────┘  │
  │               │                           │             │
  │               └─────────────┬─────────────┘             │
  │                             ▼                           │
  │                 [ Residual Add & Norm ]                 │
  │                             │                           │
  │     ❌ NO FEED-FORWARD NETWORK (FFN Layer Omitted!)      │
  │        (Saves ~70% VRAM & Eliminates Matrix Bloat)      │
  └─────────────────────────────┬───────────────────────────┘
                                │
                                ▼
  Structured Tool Dispatch / JSON Output (1,200 tok/s decode)
  -> {"tool": "set_cooling_fan", "speed": 100}`,
    technicalExplanation: "Needle's architecture replaces standard dense MLP blocks with a Simple Attention Network augmented with learned gating mechanisms (W_g). At 2-bit quantization, the entire model fits into an 8MB memory footprint—small enough to reside directly in fast on-chip SRAM or SPI flash on Cortex-M microcontrollers. In autoregressive decoding, memory bandwidth is the primary bottleneck (Bandwidth = tokens/sec × bytes per weight). By reducing parameter read overhead by ~90%, Needle delivers 6,000 tokens/sec prefill and 1,200 tokens/sec decode on consumer edge silicon.",
    experiment: `# Clone and run Needle edge benchmark locally:
git clone https://github.com/cactus-compute/needle.git && cd needle
pip install -r requirements.txt
python -m needle.bench --quant 2bit --prompt "sensor_alert: temp_high trigger: cooling"

# Terminal Output:
# [Needle-26M] Model loaded in: 12ms (SRAM footprint: 8.2MB)
# Prefill: 6,120 tok/s | Decode: 1,240 tok/s | Output: {"tool":"fan_boost","rpm":3500}`,
    takeaways: [
      "Architectural Specialization: Generalist LLMs waste 70% of memory on trivia FFN layers that agent tool-callers never use.",
      "Bandwidth is the Bottleneck: In edge decoding, inference speed is memory-bandwidth bounded; reducing parameter weight bytes directly scales tok/s.",
      "Sub-10MB SRAM Residency: 2-bit quantization allows full agent models to execute inside microcontrollers without external DRAM chips.",
      "Hierarchical Agent Design: Use Needle for sub-5ms reflex tool dispatch; invoke frontier reasoning models only when multi-step planning is required."
    ],
    nextBridge: "Needle proves that 26M models can handle edge dispatch. But what happens when you need to fine-tune an 8B model on your own local desk without renting a cloud GPU cluster? That brings us to Issue #2: Layer Streaming with Soup...",
    specs: {
      "Parameters": "26 Million",
      "Model Size": "8 MB (2-bit) / 29 MB (8-bit)",
      "Inference Speed": "6,000 tok/s prefill, 1,200 tok/s decode",
      "Architecture": "Simple Attention Network (No FFNs)",
      "Target Devices": "Phones, Wearables, ESP32/Cortex-M, Edge Robots"
    },
    highlights: ["Zero-FFN", "26M Params", "Edge Tool Calling", "2-Bit Quant", "6000 tok/s"],
    featured: true
  },
  {
    id: 2,
    shortName: "Soup (4GB Layer Streaming)",
    title: "Cracking the GPU Monopoly: How Soup Fine-Tunes 8B Frontier LLMs on Everyday 4GB Laptops",
    subtitle: "Bypassing $20K cloud clusters with asynchronous RAM-to-VRAM PCIe layer streaming and declarative YAML",
    date: "Oct 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "7 min read",
    url: "https://github.com/MakazhanAlpamys/Soup",
    repoName: "MakazhanAlpamys/Soup",
    summary: "Soup is a groundbreaking open-source CLI tool (soup-cli) created by Makazhan Alpamys that shatters the hardware barriers of post-training. Traditional fine-tuning of an 8-billion parameter model demands 16GB to 24GB of dedicated VRAM even with LoRA. Soup introduces 'Layer Streaming', a technique that keeps inactive transformer decoder layers in standard system RAM and dynamically streams only the currently active forward/backward layers into GPU VRAM just-in-time, allowing an 8B model to be trained on an ordinary 4GB laptop GPU.",
    whyHighlighted: "Why it's highlighted: Democratizes model training. By consolidating data preparation, hyperparameter configuration, training execution, and evaluation into a single declarative YAML file executed by one command ('soup train'), Soup eliminates multi-GPU cluster dependencies and makes fine-tuning accessible to any developer on everyday consumer laptops.",
    hook: "The dirty secret of modern AI engineering is that post-training has become a luxury sport. Trying to fine-tune an 8-billion parameter model usually hits you with a brutal choice: buy a $2,000 GPU, spend thousands renting H100s, or give up. Soup completely shatters that monopoly.",
    problem: "Even with Parameter-Efficient Fine-Tuning (LoRA/QLoRA), training an 8B model requires holding model weights, activation checkpoints, optimizer states (AdamW), and gradients in VRAM. This instantly exceeds 16GB–24GB of video memory. If your laptop has a mobile RTX 3050 or RTX 4050 with 4GB VRAM, standard PyTorch scripts fail immediately with the dreaded 'CUDA out of memory' error.",
    intuition: "Here is the mental model: A transformer is a linear sequence of layers (Layer 0 to Layer 31). When your GPU is computing the activations for Layer 3, why are Layers 4 through 31 sitting idle in expensive VRAM? They don't need to be there! Soup treats GPU VRAM not as a permanent warehouse, but as an active computational staging buffer. Inactive layers sleep in cheap DDR5 system RAM and stream across PCIe just in time.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 SOUP LAYER STREAMING RUNTIME                │
└─────────────────────────────────────────────────────────────┘
  [ System RAM (DDR5) - 16GB Host Memory ]
  ├── Layer 00  Layer 01  Layer 02  Layer 03  ... Layer 31
  └── Inactive Weights & AdamW States Buffered in RAM
                         │
                         ▼  (Async PCIe Ring Buffer Stream)
  ┌─────────────────────────────────────────────────────────┐
  │         GPU VRAM (Only 4GB Required Buffer!)            │
  │                                                         │
  │    [ Active Layer L_i Forward/Backward Pass ]           │
  │         ├── Compute Activation / Gradients              │
  │         └── Sync Local LoRA Adapter Weights             │
  │                                                         │
  │    [ Async Pre-fetch Layer L_{i+1} via CUDA Streams ]   │
  └─────────────────────────┬───────────────────────────────┘
                            │
                            ▼
      Write-back Gradients to RAM ──► Stream Next Layer`,
    technicalExplanation: "Soup-cli uses a dual-CUDA stream ring buffer over the PCIe bus. While CUDA Stream 0 executes the forward/backward kernel for layer L_i, CUDA Stream 1 asynchronously pre-fetches the weights of layer L_{i+1} from host pinned memory into GPU VRAM. As soon as layer L_i completes, its gradients are streamed back to system RAM to update the optimizer states, and its VRAM space is instantly recycled. Memory stays flat below 3.8GB throughout the entire training epoch.",
    experiment: `# Install soup-cli and run an 8B training job on a 4GB laptop GPU:
pip install soup-cli
cat <<EOF > train.yaml
model: meta-llama/Llama-3-8B
target_vram: 4GB
adapter: lora
dataset: custom_tool_dataset.jsonl
EOF

soup train --config train.yaml
# Peak VRAM: 3.74 GB | Epoch 1/3 Loss: 1.28 -> 0.84 | Cloud Cost: $0.00`,
    takeaways: [
      "Memory Tiering Over Hardware Scaling: Decouple parameter capacity from GPU VRAM by treating host DDR5 RAM as cold storage.",
      "Asynchronous PCIe Overlap: Double-buffering hides memory copy latency behind GPU tensor core computation.",
      "Single-Command Declarative Pipelines: Replacing sprawling PyTorch scripts with declarative YAML makes post-training reproducible.",
      "Local Sovereign Training: Fine-tune proprietary enterprise data without exposing datasets to third-party cloud APIs."
    ],
    nextBridge: "Now you can train your own models on a $500 laptop. But when it comes to writing code with agents, why are we still paying $20/month per seat for Cursor or Copilot? In Issue #3, we dissect Freebuff's multi-agent swarm...",
    specs: {
      "Supported Models": "Llama-3 8B, Qwen-2.5 7B, Mistral 7B",
      "Min Hardware": "4 GB VRAM Laptop GPU + 16 GB System RAM",
      "Core Technique": "Layer Streaming (PCIe Ring Buffer)",
      "Configuration": "Single YAML declarative spec ('soup-cli')",
      "Stack": "Python, PyTorch, C++ Streaming CUDA Kernels"
    },
    highlights: ["Layer Streaming", "4GB VRAM Training", "soup-cli", "8B Fine-tuning", "LoRA"],
    featured: false
  },
  {
    id: 3,
    shortName: "Freebuff (Multi-Agent Swarm)",
    title: "The Death of $20/mo Coding Seats: Inside Freebuff's Ad-Subsidized Multi-Agent Swarm",
    subtitle: "Why pay monthly IDE fees? Orchestrating AST pickers, diff planners, and syntax guards funded by unobtrusive terminal ads",
    date: "Oct 2026",
    category: "Developer Tools",
    categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    readTime: "5 min read",
    url: "https://github.com/CodebuffAI/freebuff",
    repoName: "CodebuffAI/freebuff",
    summary: "Freebuff is an open-source, ad-supported multi-agent software engineering framework developed by CodebuffAI. While commercial coding assistants like Cursor and GitHub Copilot require recurring monthly fees or personal API keys, Freebuff unlocks multi-agent coding for everyone by subsidizing model inference with lightweight, non-intrusive text ads. Built as a high-performance TypeScript monorepo running on Bun, it orchestrates specialized sub-agents for file selection, planning, syntax editing, and code review.",
    whyHighlighted: "Why it's highlighted: Eliminates economic friction in AI developer tooling while advancing multi-agent architecture. Instead of relying on a single monolithic LLM prompt, Freebuff demonstrates how a team of specialized micro-agents running on modern open models can outperform expensive proprietary coding assistants without requiring a credit card.",
    hook: "AI coding assistants went from magical prototypes to monthly subscription tollbooths faster than any developer tool in history. But worse than the $20/month price tag is the architectural flaw: stuffing your entire repo into a single mega-prompt and praying the LLM doesn't hallucinate your codebase into broken syntax.",
    problem: "Monolithic coding assistants treat software engineering as a single prompt-response loop. A single model is asked to search the repo, plan the architecture, edit multiple files, and verify syntax all in one shot. The result is context pollution, forgotten edge cases, and massive token waste. Meanwhile, developers are locked into recurring SaaS subscriptions or personal API billing meters.",
    intuition: "When a real software engineer builds a feature, they don't do everything simultaneously in their head. First, they find the relevant files (AST search). Then, they plan the architectural changes. Then, they write precise diffs. Finally, they run the linter and compiler. Freebuff mirrors this exact human team choreography by splitting work across specialized sub-agents running on ultra-fast Bun and open frontier models.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│             FREEBUFF MULTI-AGENT CHOREOGRAPHY               │
└─────────────────────────────────────────────────────────────┘
  Developer Request: "Add Redis cache with TTL to /api/users"
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                 Freebuff Orchestrator                   │
  └───────┬───────────────────┬───────────────────┬─────────┘
          │                   │                   │
          ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │File Picker│       │Architecture│      │Research & │
    │Agent (AST)│       │  Planner  │       │ Docs Agent│
    └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │    Code Editor Agent    │
                 │ (Atomic unified diffs)  │
                 └────────────┬────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │  Reviewer / Lint Guard  │
                 └────────────┬────────────┘
                              ▼
            Verified Pull Request (Cost: $0.00 / Free)`,
    technicalExplanation: "Freebuff is built as a high-performance TypeScript monorepo on the Bun runtime using '@codebuff/sdk'. The File Picker agent runs Tree-sitter AST queries to pinpoint exact function dependencies rather than dumping entire files into the prompt. The Editor agent emits strict unidiff blocks that are checked by a local Lint Guard agent before disk writes. The frontier token costs (GLM-5.3 Flash, Sol-6.1) are subsidized by clean, non-intrusive terminal text ads, completely eliminating developer paywalls.",
    experiment: `# Launch Freebuff in your terminal on any repo:
npx freebuff
# Terminal Prompt:
# ? What feature do you want to build? "Refactor auth middleware to use JWT"
# -> FilePicker: scanned 48 files, selected auth.ts & routes.ts (AST match)
# -> Planner: draft architectural schema
# -> Editor: applied 2 atomic diffs
# -> LintGuard: oxlint 0 errors | TypeScript compile OK!`,
    takeaways: [
      "Sub-Agent Specialization Wins: Dividing file discovery, planning, editing, and linting beats monolithic single-agent prompts.",
      "AST-Targeted Context: Use Tree-sitter symbol graphs instead of dumping thousands of raw source lines into context.",
      "Zero Paywall Economics: Ethical, non-tracking terminal ads can democratize frontier AI developer tools without credit cards.",
      "Atomic Diff Verification: Always run an automated lint guard before committing agent-generated code edits."
    ],
    nextBridge: "Freebuff proves how code synthesis transforms software repositories. But what about the research papers behind these AI algorithms? Why are scientific papers still trapped in static PDFs? In Issue #4, we explore Papermorph...",
    specs: {
      "Architecture": "Coordinated Sub-Agent Swarm (Picker + Planner + Editor + Reviewer)",
      "Runtime": "TypeScript / Bun + '@codebuff/sdk'",
      "Cost Model": "Free & Open-Source (Funded via unobtrusive terminal text ads)",
      "Supported LLMs": "GLM 5.3 Flash, Sol 6.1, Ollama Local Models",
      "Integrations": "Terminal CLI, Web Sandbox, Git Checkpoint Reverts"
    },
    highlights: ["Multi-Agent", "Bun Runtime", "No Credit Card", "Ad-Funded", "AST Parsing"],
    featured: false
  },
  {
    id: 4,
    shortName: "Papermorph (PDF to Living Code)",
    title: "Never Read a Static arXiv PDF Again: Papermorph Compiles Research Papers into Living Code",
    subtitle: "Why code generation crushes video diffusion: turning dense equations and proofs into interactive HTML5 simulators",
    date: "Oct 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "6 min read",
    url: "https://github.com/DozenTwelve/Papermorph",
    repoName: "DozenTwelve/Papermorph",
    summary: "Papermorph is an innovative open-source AI transformation engine by DozenTwelve that takes dense, static academic research PDFs (such as arXiv papers) and compiles them into interactive, narrated, and animated web learning experiences. Rather than generating bloated, uneditable video files using diffusion models, Papermorph leverages Claude Opus to extract core equations, generate storyboards, synthesize narration scripts, and emit pure HTML5/SVG/JavaScript animations and interactive knowledge check quizzes.",
    whyHighlighted: "Why it's highlighted: Scientific publishing has remained trapped in static, two-column black-and-white PDF formats for over three decades. Papermorph demonstrates that generative code synthesis is vastly superior to generative video for technical comprehension: interactive code is lightweight (kilobytes vs gigabytes), searchable, accessible, and provides live parameter exploration.",
    hook: "Academic research has been trapped in the same medium for 350 years: two columns of black text on white paper. We invented neural networks, quantum computing, and space exploration, yet we still communicate scientific breakthroughs using static PDF pages where equations remain frozen formulas instead of interactive experiments.",
    problem: "Recent attempts to modernize scientific communication have focused on AI video diffusion—generating 5-minute video summaries. But video is the wrong medium for technical engineering: videos are multi-gigabyte files, non-searchable, hallucinate mathematical equations, cannot be edited, and offer zero interactivity. You can't adjust a slider in an MP4 to see how a learning rate changes loss.",
    intuition: "The true superpower of generative AI is not video pixels—it is code synthesis. A research paper is an algorithmic recipe. Papermorph decompiles that recipe into living HTML5, SVG vectors, and JavaScript sliders. Instead of watching an animation of attention weights, you drag a slider and watch the softmax probabilities recalculate in real time. It turns passive reading into active intuition.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│               PAPERMORPH TRANSFORMATION PIPELINE            │
└─────────────────────────────────────────────────────────────┘
  Static arXiv PDF (Dense text, equations, static figures)
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                 Semantic Decomposition                  │
  │    • LaTeX Equation Parser   • Figure & Caption OCR     │
  │    • Core Thesis Extraction  • Proof & Lemma Graph      │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │            Curriculum & Storyboard Generator            │
  │    • Chapter Breakdown       • Narration Voice Script   │
  │    • Interactive Widget Spec • Checkpoint Quizzes       │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │               Pure Code Compilation Engine              │
  │    • HTML5 / Canvas Vector Animation Scripts            │
  │    • Web Audio Narration Synchronization                │
  │    • Interactive Math Sliders & Parametric Graphs       │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  Deployable Interactive Course (Lightweight 120KB Static HTML5)`,
    technicalExplanation: "Papermorph extracts LaTeX equations, OCR captions, and lemma dependency trees from arXiv PDFs. Using Claude Opus prompt engineering with strict JSON output schemas, it converts mathematical formulations into parametric JavaScript functions. Visuals are rendered via SVG and HTML5 Canvas, narration audio is synced using the Web Audio API, and the entire output is compiled into a single static 120KB bundle that loads in 40 milliseconds with zero server dependencies.",
    experiment: `# Transform an arXiv paper into an interactive web app:
git clone https://github.com/DozenTwelve/Papermorph.git && cd Papermorph
npm install
npm run morph -- --url https://arxiv.org/abs/1706.03762 # "Attention Is All You Need"
# Generated: ./dist/transformer-interactive.html (142 KB bundle with live attention sliders!)`,
    takeaways: [
      "Code Generation Over Video Diffusion: Interactive code is 1,000x smaller in bandwidth and 100x more educational than generated video.",
      "Deconstruct LaTeX into Functions: Equations shouldn't be static symbols; they should be executable JavaScript sliders.",
      "Zero-Backend Portability: Compiling to standalone static HTML5 ensures scientific materials remain accessible forever.",
      "Active Pedagogy Builds Intuition: Adjusting parameters live teaches concepts 10x faster than reading passive text."
    ],
    nextBridge: "Papermorph shows the power of 2D interactive code for research papers. But what happens when you push browser graphics to the limits of 3D spatial biology? In Issue #5, we inspect Human-Atlas...",
    specs: {
      "Input Format": "Academic PDFs, arXiv URLs, Whitepapers",
      "Output Format": "Interactive HTML5/CSS/SVG Web Apps + Narration + Quizzes",
      "Generation Engine": "Claude Opus structured prompt skills & code synthesis",
      "Rendering Tech": "SVG, HTML5 Canvas, Web Audio API, Tailwind CSS",
      "Bandwidth Efficiency": "100x smaller payload than generated video"
    },
    highlights: ["PDF to Interactive", "Code-First Visuals", "Research Papers", "Interactive Quizzes"],
    featured: false
  },
  {
    id: 5,
    shortName: "Human-Atlas (3D WebGL)",
    title: "2,234 Meshes at 60 FPS: Dissecting the Human Body in Pure WebGL with Human-Atlas",
    subtitle: "Zero installs, real-time raycasting, and exploded organ physics: pushing browser scene graphs to biomedical CAD fidelity",
    date: "Oct 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "5 min read",
    url: "https://github.com/ashemag/human-atlas",
    repoName: "ashemag/human-atlas",
    summary: "Human-Atlas is a phenomenal open-source 3D biological exploration application created by ashemag. Built completely on React, TypeScript, and Three.js, it renders an intricate 3D anatomical model of the human body composed of 2,234 individually selectable meshes derived from the BodyParts3D anatomical database. Users can explore 15 discrete physiological systems (skeletal, cardiovascular, nervous, muscular, etc.), toggle an exploded view to study anatomical relationships, and inspect individual organs at 60 FPS in any modern web browser.",
    whyHighlighted: "Why it's highlighted: Sets a high-water mark for spatial visualization on the web. It demonstrates how modern WebGL optimizations, glTF geometry compression, and declarative React-Three-Fiber scene graphs can deliver medical-grade interactive 3D visualizations without requiring multi-gigabyte desktop software or closed proprietary licenses.",
    hook: "Until recently, exploring anatomical 3D geometry meant installing 20GB desktop software or subscribing to enterprise CAD suites. Most developers assumed that rendering thousands of detailed biomedical meshes in a standard web browser would choke Chrome and crash the GPU. Human-Atlas proves that modern WebGL engineering can achieve 60 FPS desktop-grade fidelity right inside a browser tab.",
    problem: "Rendering intricate spatial systems on the web typically suffers from three major bottlenecks: massive geometric asset payloads that take minutes to load, slow CPU-to-GPU draw call thrashing when thousands of distinct objects are present, and sluggish raycasting collision detection that lags when a user hovers over microscopic organs or bones.",
    intuition: "The secret lies in treating 3D scene graphs with the same discipline as database indexing. Instead of brute-forcing thousands of independent mesh objects, Human-Atlas combines DRACO geometry compression, Bounding Volume Hierarchy (BVH) spatial indexing, and bitwise layer masking. It proves our project's core motto: when you make internal physical structures visible and interactive, learning becomes effortless.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                HUMAN-ATLAS 3D WEBGL ARCHITECTURE            │
└─────────────────────────────────────────────────────────────┘
  Browser Viewport (React Canvas + WebGL 2.0 Context)
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                 Three.js Scene Graph Engine             │
  │  ├── Camera Controller (OrbitControls / Smooth Damping) │
  │  ├── InstancedMesh & DRACO Compressed Geometries        │
  │  └── Raycaster Selection & Bounding Volume Hierarchy    │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                15 System Filter Matrices                │
  │  [Skeletal]  [Muscular]  [Cardiovascular]  [Nervous]... │
  │        ├── Visibility Masks (Bitwise Layer Toggles)     │
  │        └── Dynamic Opacity & Material Shader Blending   │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │              Exploded View Vector Engine                │
  │   Pos_exploded = Pos_original + λ * Vector_Displace_i   │
  │   (Reveals internal organs with interactive sliders)    │
  └─────────────────────────────────────────────────────────┘`,
    technicalExplanation: "Human-Atlas indexes 2,234 discrete anatomical parts from the BodyParts3D dataset. Geometric meshes are compressed using DRACO algorithms, shrinking gigabytes of raw vertex data to just a few megabytes. The exploded view mode calculates normal displacement vectors on the fly, allowing organs to expand outward seamlessly without geometric clipping. Real-time raycasting utilizes a BVH tree to resolve mouse intersections in under 1 millisecond.",
    experiment: `# Run Human-Atlas locally and inspect WebGL draw performance:
git clone https://github.com/ashemag/human-atlas.git && cd human-atlas
npm install && npm run dev
# Open http://localhost:5173 -> Open Chrome DevTools (Rendering -> FPS meter)
# Drag Exploded View slider: Observe constant 60 FPS across 2,234 meshes!`,
    takeaways: [
      "DRACO Geometry Compression: Compress complex 3D meshes by 90% to deliver desktop-grade 3D assets over web connections.",
      "BVH Spatial Indexing: Never raycast raw polygon arrays; use bounding volume hierarchies for microsecond user clicks.",
      "Bitwise System Masking: Use GPU shader visibility layers to toggle 15 anatomical systems instantly without garbage collection spikes.",
      "Zero-Install Spatial Access: High-performance 3D visualization belongs in the open web, not locked behind closed proprietary software."
    ],
    nextBridge: "Human-Atlas pushes spatial WebGL to 2,234 meshes. But what about frontier AI models with 180 billion weights? Can you run a 180B model without a server farm? In Issue #6, we break down Qwen3.8-Flash-Next...",
    specs: {
      "Mesh Count": "2,234 selectable anatomical components",
      "Anatomical Systems": "15 systems (Skeletal, Muscular, Vascular, Neural, etc.)",
      "Tech Stack": "React, TypeScript, Three.js, WebGL, Vite",
      "Key Features": "Exploded View, Raycasting Mesh Inspector, System Filters",
      "Deployment": "100% Client-side static website"
    },
    highlights: ["Three.js", "WebGL", "2,234 Meshes", "Exploded View", "Human Anatomy"],
    featured: false
  },
  {
    id: 6,
    shortName: "Qwen3.8-Flash-Next (180B MoE)",
    title: "180 Billion Weights, Only 6B Active: The Mind-Bending Architecture of Qwen3.8-Flash-Next",
    subtitle: "The 1M-context titan that runs on consumer hardware: fusing a 51B offloadable N-gram table with multi-token speculative forecasting",
    date: "Sep 2026",
    category: "Frontier Models",
    categoryColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    readTime: "8 min read",
    url: "https://huggingface.co/Qwen",
    repoName: "Qwen / Alibaba Cloud",
    summary: "Qwen3.8-Flash-Next is Alibaba's cutting-edge 180-billion-parameter Mixture-of-Experts (MoE) experimental preview model. Despite housing 180B parameters on disk, it employs a radical three-part hybrid architecture: a 125B MoE transformer backbone, a 51B N-gram embedding lookup table, and a 4B Multi-Token Prediction (MTP) head. By routing tokens to only top-2 experts per layer, it activates a mere 6B parameters per token during forward passes—delivering frontier coding and reasoning intelligence at high inference speeds with a native 1-million token context window.",
    whyHighlighted: "Why it's highlighted: Architectural efficiency breakthrough. The 51B N-gram lookup table can be offloaded onto system DDR RAM or NVMe storage while only the active 6B compute path runs on GPU/NPU cores. Enthusiasts have successfully run this 180B-class model on 64GB Apple Silicon Macs, proving that ultra-sparse architectures can outpace dense models while cutting operational serving costs by 80%.",
    hook: "For years, the AI scaling law felt like a brute-force equation: double the parameters, double the GPUs, double the power bill. But what if you could pack 180 billion parameters of frontier reasoning into memory while computing only 6 billion parameters per token during inference? Welcome to the frontier of ultra-sparse Mixture-of-Experts.",
    problem: "Dense frontier models (70B, 120B, 405B) activate every single parameter for every single token. Whether the model is writing complex Rust concurrency code or just outputting a comma, it burns the same massive compute budget. This makes frontier models prohibitively slow and expensive to host for production agent workloads with large 1-million-token context windows.",
    intuition: "Think of an expert hospital. When a patient walks in with a sore knee, you don't convene all 200 doctors on staff to diagnose them. You route the patient to the top-2 orthopedic specialists. Qwen3.8-Flash-Next houses 180 billion total weights, but routes each token to just 2 specialized experts (~6B active compute). Furthermore, it predicts 3 sequential tokens at once and offloads static linguistic phrases to an N-gram table!",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│             QWEN3.8-FLASH-NEXT 3-TIER ARCHITECTURE          │
└─────────────────────────────────────────────────────────────┘
  Input Prompt (Up to 1,000,000 Tokens)
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │  Tier 1: 51B N-Gram Lookup Table (Offloadable to RAM)   │
  │  Rapid phrase & syntax hash table for instant indexing  │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │       Tier 2: 125B Sparse MoE Core Backbone             │
  │                                                         │
  │     Expert 1   Expert 2   Expert 3  ...  Expert 64      │
  │        ▲          ▲                                     │
  │        └── Router Selects Top-2 Experts ONLY!           │
  │            (Only ~6B active compute per token!)         │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │  Tier 3: 4B Multi-Token Prediction (MTP) Speculative Head│
  │  Forecasts Token_{t+1}, Token_{t+2}, Token_{t+3} at once│
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
      Blazing 3x Generation Speed (150+ tok/s Local)`,
    technicalExplanation: "Qwen3.8-Flash-Next uses a 3-tier hybrid setup: a 125B MoE backbone (64 experts, Top-2 routing), a 51B static N-gram lookup table, and a 4B Multi-Token Prediction (MTP) speculative head. The 51B N-gram table contains static phrase representations that require zero GPU tensor compute; they can be mapped to host DDR RAM or NVMe storage. The MTP head predicts tokens t+1, t+2, t+3 simultaneously in a single forward pass, tripling effective decoding throughput while preserving full 1M-token context fidelity.",
    experiment: `# Inspect Qwen MoE router distributions via vLLM or llama.cpp:
python -c "
import torch
experts_total = 64
active_experts = 2
compute_ratio = active_experts / experts_total
print(f'Total MoE Capacity: 180B | Active Compute: {180 * compute_ratio:.1f}B (~6B)')
print(f'Compute Reduction Factor: {1 / compute_ratio:.1f}x less FLOPs per token!')
"
# Output: Total MoE Capacity: 180B | Active Compute: 5.6B | Compute Reduction: 32.0x less FLOPs!`,
    takeaways: [
      "Sparsity is the Future of Scale: Total model capacity gives world knowledge, but sparse routing keeps inference latency low.",
      "Multi-Token Prediction (MTP): Forecasting multiple tokens concurrently breaks the sequential autoregressive decode bottleneck.",
      "Offloadable N-Gram Memories: Static linguistic lookup tables can sit in cheap system RAM, saving precious GPU tensor cores.",
      "1M Context Efficiency: Sparse activation dramatically reduces KV-cache pressure and cross-attention computational complexity."
    ],
    nextBridge: "Sparse MoE architectures let you run 180B-class models on a desktop workstation. But what if you need to run a 120B model completely offline inside your pocket? That brings us to Issue #7: Tiiny AI Pocket Lab...",
    specs: {
      "Total Parameters": "180 Billion (125B MoE + 51B N-gram table + 4B MTP head)",
      "Active Parameters": "~6 Billion per token",
      "Context Window": "1,000,000 tokens native",
      "Routing Strategy": "Top-2 Expert Routing + Multi-Token Prediction",
      "Local Hardware": "Runnable on 64GB Mac / PC with RAM offloading"
    },
    highlights: ["180B MoE", "6B Active", "1M Context", "Multi-Token Prediction", "N-Gram Table"],
    featured: false
  },
  {
    id: 7,
    shortName: "Tiiny AI (80GB Pocket Rig)",
    title: "An 80GB Supercomputer in Your Pocket: Running 120B Models Offline on 300g of Silicon",
    subtitle: "Total data sovereignty: custom ARMv9 silicon and TiinyOS running sovereign frontier intelligence anywhere at 15 Watts",
    date: "Sep 2026",
    category: "Edge & Hardware",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "6 min read",
    url: "https://tiiny.ai",
    repoName: "tiiny.ai",
    summary: "The Tiiny AI Pocket Lab is a palm-sized personal AI supercomputer manufactured by Tiiny AI. Weighing just 300 grams, this portable hardware unit packs 80GB of high-speed unified LPDDR5X memory, a 12-core ARMv9.2 custom processor with integrated tensor accelerators, and a 1TB high-endurance NVMe SSD. Powered by the proprietary TiinyOS microkernel, it runs massive 70B to 120B parameter language models and autonomous agent workflows entirely locally without internet access, subscription fees, or data leaks.",
    whyHighlighted: "Why it's highlighted: The pinnacle of sovereign edge AI hardware. While cloud providers charge premium hourly rates and monitor API telemetry, Tiiny Pocket proves that desktop-grade 80GB unified memory bandwidth can fit in a pocket, offering journalists, security researchers, and developers complete data sovereignty and air-gapped agent operations anywhere in the world.",
    hook: "Every token you send to a cloud API is an act of trust: you trust the provider not to log your prompt, not to change their pricing, not to throttle your rate limits, and not to cut you off during a network outage. What if you could hold an 80GB personal supercomputer in your palm that runs 120B models completely air-gapped from the internet?",
    problem: "Frontier 70B and 120B models have historically required multiple full-size desktop GPUs (dual RTX 4090s or Mac Studio workstations) weighing over 15 kilograms and pulling 700+ Watts from the wall. Portable laptops typically cap unified memory at 16GB or 32GB, locking mobile developers and security researchers out of true local frontier intelligence.",
    intuition: "The constraint was never the size of the processor; it was memory architecture. Standard PCs separate CPU memory from GPU memory over a PCIe bottleneck. Tiiny Pocket uses a unified high-bandwidth LPDDR5X memory pool where the CPU and custom neural tensor accelerators share 80GB of unified space with zero copying. Encased in a 300-gram aluminum chassis running at 15 Watts, it is true sovereign edge computing.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 TIINY POCKET HARDWARE ARCHITECTURE          │
└─────────────────────────────────────────────────────────────┘
  Pocket Chassis (Aluminum Unibody, 300g, 15-45W Thermal Design)
                         │
  ┌──────────────────────┴──────────────────────────────────┐
  │                                                         │
  │  ┌───────────────────────┐   ┌────────────────────────┐ │
  │  │ 12-Core ARMv9.2 CPU   │   │  80GB LPDDR5X Unified  │ │
  │  │  + Neural Processing  │◄─►│  High-Bandwidth RAM    │ │
  │  │  Accelerator Cores    │   │  (Runs 120B Models!)   │ │
  │  └───────────────────────┘   └────────────────────────┘ │
  │               ▲                          ▲              │
  │               │                          │              │
  │  ┌────────────┴──────────┐   ┌───────────┴────────────┐ │
  │  │ 1TB High-Endurance    │   │ TiinyOS Microkernel    │ │
  │  │ NVMe SSD Model Vault  │   │ Direct Memory Access   │ │
  │  └───────────────────────┘   └────────────────────────┘ │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  100% Air-Gapped Offline Local Agent Gateway (Localhost API)`,
    technicalExplanation: "The Tiiny hardware features 80GB of high-speed unified LPDDR5X memory delivering over 400 GB/s bandwidth. Powered by a custom 12-core ARMv9.2 SoC with dedicated matrix units, the system draws just 15W to 45W. TiinyOS is a stripped-down microkernel that eliminates traditional Linux page caching overhead, allowing quantized GGUF/AWQ model weights to be memory-mapped into tensor accelerators in milliseconds. It serves an OpenAI-compatible API daemon on localhost with zero external network connectivity.",
    experiment: `# Query the Tiiny Pocket offline API over USB-C or local Wi-Fi:
curl http://tiiny.local:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.3-70b-instruct-q4",
    "messages": [{"role": "user", "content": "Analyze encrypted telemetry payload"}]
  }'
# Response latency: 18ms first token | 32 tok/s decode | Internet connection: DISCONNECTED (100% Offline)`,
    takeaways: [
      "Unified Memory Architecture is King: True edge AI performance comes from shared CPU/NPU memory pools with zero bus copies.",
      "Absolute Data Sovereignty: Sensitive medical records, legal documents, and security exploits should never leave local hardware.",
      "Thermals and Efficiency: ARMv9 silicon running at 15W-45W can match previous-generation 500W server racks.",
      "Offline Agent Resilience: Mission-critical autonomous agents must operate seamlessly during power outages or disconnected environments."
    ],
    nextBridge: "Having 80GB in your pocket is incredible. But even with an 80GB supercomputer, why burn power asking a generative LLM to answer simple binary classification questions? In Issue #8, we examine Laya's sub-10ms System 1 layer...",
    specs: {
      "Unified Memory": "80 GB LPDDR5X (High-bandwidth unified memory)",
      "Processor": "12-Core ARMv9.2 with Custom Neural Accelerators",
      "Storage": "1 TB High-Speed NVMe Gen4 SSD",
      "Operating System": "TiinyOS (Zero-copy unified memory kernel)",
      "Form Factor": "Pocket-sized, ~300 grams, 15W-45W power draw"
    },
    highlights: ["80GB RAM", "120B Models Offline", "ARMv9.2", "300g Hardware", "Data Sovereignty"],
    featured: false
  },
  {
    id: 8,
    shortName: "Laya (Sub-10ms System 1)",
    title: "Stop Using 70B LLMs as If-Else Routers: Laya's Sub-10ms 'System 1' Decision Engine",
    subtitle: "Slash 90% off API latency and bills with single-forward-pass ModernBERT probability calibration and zero hallucination",
    date: "Aug 2026",
    category: "Frontier Models",
    categoryColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    readTime: "5 min read",
    url: "https://huggingface.co/convaiinnovations/laya",
    repoName: "convaiinnovations/laya",
    summary: "Laya is an open-source non-autoregressive decision model developed by Convai Innovations. Unlike standard generative LLMs that waste compute by predicting text token-by-token, Laya is designed as a fast 'System 1' cognitive layer built on a ModernBERT-large backbone (~322M-421M parameters). In a single forward pass taking under 10 milliseconds, Laya consumes complex state (support tickets, JSON payloads, tool outputs) and returns structured categorical choices, numerical scores, or calibrated probabilities.",
    whyHighlighted: "Why it's highlighted: Solves the latency and cost crisis of agent routing. Orchestrating multi-agent systems often wastes 500ms and dollars calling frontier 70B generative models just to answer binary questions like 'Is this query safe?' or 'Which tool should handle this?'. Laya performs these exact decisions in under 10ms with mathematical probability calibration and zero generative hallucination.",
    hook: "How many times has your agent architecture called a 70B model just to ask: 'Is this query about billing or technical support?' Or 'Is this input a prompt injection attack?' Every time you do that, you wait 800 milliseconds and pay frontier token prices for an answer that should take 8 milliseconds. It's time to stop using generative LLMs as glorified if-else statements.",
    problem: "Autoregressive generative LLMs generate answers token by sequential token. Even if the answer is just the single word 'Billing', the model must compute the full autoregressive forward pass, generate output tokens, format JSON, and risk hallucinating invalid syntax. In complex multi-agent swarms with 20 routing checkpoints, this generative latency stacks up, creating sluggish 10-second agent experiences and astronomical API invoices.",
    intuition: "Daniel Kahneman won the Nobel Prize for describing human cognition as two distinct modes: 'System 1' (fast, instinctive, instantaneous pattern recognition) and 'System 2' (slow, deliberate, analytical reasoning). When you see a stop sign, you don't write an essay in your head—you hit the brakes in 200 milliseconds. Laya is the AI equivalent of System 1: a 322M ModernBERT model that evaluates state in a single forward pass, emitting calibrated decisions without slow token generation.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 LAYA DUAL-PROCESS AGENT PIPELINE            │
└─────────────────────────────────────────────────────────────┘
  Incoming User Request / Tool Payload
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │      System 1: LAYA (322M ModernBERT Single Pass)       │
  │                                                         │
  │  • Intent Choice:   [Billing / Technical / Threat]      │
  │  • Urgency Score:   [0.94 / 1.0]                        │
  │  • Safety Valid:    [P(safe) = 0.998]                   │
  │                                                         │
  │  ⏱️ Latency: < 10ms  |  💰 Cost: $0.00001               │
  └──────────────────────┬──────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
  [ Simple Routing Path ]        [ Complex Reasoning Path ]
  Direct Database Query /        Forward to System 2 Frontier LLM
  Instant Cached Response        (Only when deliberate CoT needed)
  (80% of requests handled)      (Saves 80% Token Billing & Latency)`,
    technicalExplanation: "Laya is built on ModernBERT-large (~322M to 421M parameters). Instead of an autoregressive causal decoder, it uses an encoder architecture with specialized decision heads that emit three distinct output types in a single forward pass: Choices (discrete categorical enums), Scores (continuous floats 0–100), and Nouls (rigorously calibrated probabilities P in [0, 1]). Running via ONNX runtime on standard CPUs or low-cost GPUs, inference completes in 4 to 8 milliseconds with zero generative hallucination.",
    experiment: `# Test sub-10ms decision routing with Laya in Python:
pip install laya-sdk onnxruntime
python -c "
import time
from laya import LayaClassifier
clf = LayaClassifier.load('convai/laya-routing-v1')
start = time.perf_counter()
decision = clf.decide('User request: reset password immediately', choices=['auth', 'billing', 'docs'])
latency = (time.perf_counter() - start) * 1000
print(f'Choice: {decision.choice} | Confidence: {decision.confidence:.3f} | Latency: {latency:.2f}ms')
"
# Output: Choice: auth | Confidence: 0.998 | Latency: 6.42ms (Single CPU core!)`,
    takeaways: [
      "Dual-Process Cognition in AI: Pair fast non-autoregressive System 1 classifiers with deliberate System 2 generative reasoners.",
      "Kill Autoregressive Latency for Routing: Categorical routing and security guardrails should never take more than 10 milliseconds.",
      "Mathematically Calibrated Probabilities: Softmax outputs calibrated to empirical ground-truth accuracy eliminate subjective LLM confidence.",
      "90% Cost & Latency Reduction: Filtering out trivial queries before frontier LLMs slashes enterprise cloud infrastructure bills."
    ],
    nextBridge: "Laya accelerates agent routing decisions. But once your agents start executing dozens of tools, another bottleneck strikes: giant tool outputs that clog the context window. In Issue #9, we look at Headroom...",
    specs: {
      "Model Backbone": "ModernBERT-large (~322M to 421M parameters)",
      "Inference Latency": "< 10 ms (Single forward pass)",
      "Output Format": "Choice (Enum), Score (Float), Noul (Calibrated Probability)",
      "Compute Requirements": "Runs on standard CPU or entry-level GPU via ONNX",
      "License": "Apache 2.0 Open Source"
    },
    highlights: ["Non-Autoregressive", "System 1", "ModernBERT", "10ms Latency", "Zero Hallucination"],
    featured: false
  },
  {
    id: 9,
    shortName: "Headroom (Rust Token Killer)",
    title: "The Rust Token Killer: Slashing 95% of Agent Context Bloat Before Your LLM Forgets",
    subtitle: "Curing 'Lost in the Middle' attention failure: how an ultra-fast MCP proxy expands coding agent working memory by 5x",
    date: "Aug 2026",
    category: "Developer Tools",
    categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    readTime: "6 min read",
    url: "https://github.com/headroomlabs-ai/headroom",
    repoName: "headroomlabs-ai/headroom",
    summary: "Headroom is an essential open-source context compression proxy, SDK, and Model Context Protocol (MCP) server engineered by Headroomlabs AI. As coding agents like Claude Code, Cursor, and Aider run commands and query databases, their context windows become clogged with voluminous JSON outputs, build logs, and duplicate RAG chunks. Headroom acts as an intelligent intermediary, using its 'Rust Token Killer' (RTK) and semantic deduplication algorithms to shrink incoming payloads by 60% to 95% while preserving 100% of functional accuracy.",
    whyHighlighted: "Why it's highlighted: Direct solution to context degradation and spiraling API costs. Unchecked token accumulation triggers the 'Lost in the Middle' attention failure in LLMs. Headroom prevents context bloat, expands effective conversation depth by 5x, and cuts developer token costs by up to 80% with a drop-in proxy.",
    hook: "Here is the fastest way to break a coding agent: have it run a test suite, fetch a git status, or read a package-lock.json. A single bash command returns 30,000 tokens of verbose terminal noise, ANSI escape codes, and nested JSON. Your agent's context window is instantly flooded, its attention degrades, it forgets what it was doing, and your API bill spikes by $5.00.",
    problem: "The 'Lost in the Middle' phenomenon is an empirical reality of LLM attention: as prompt token count grows beyond 20,000 tokens, the model's ability to recall instructions located in the middle of the context degrades sharply. Coding tools (Claude Code, Cursor, Aider) routinely ingest uncompressed build logs, giant API responses, and redundant documentation that contain 95% useless boilerplate and only 5% signal.",
    intuition: "Context is the working memory of an agent. You wouldn't memorize every single comma in a dictionary just to look up one definition. Headroom sits as an invisible proxy between the agent and its tools. Using a high-speed native Rust engine, it intercepts incoming tool payloads, strips whitespace and ANSI codes, collapses redundant JSON hierarchies, extracts relevant error stack traces, and delivers pure compressed signal to the LLM.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 HEADROOM TOKEN COMPRESSION PIPELINE         │
└─────────────────────────────────────────────────────────────┘
  Agent Tool Command (e.g. 'cat 500-line package-lock.json' or 'npm test')
                         │
                         ▼  (Raw Output: 45,000 Tokens)
  ┌─────────────────────────────────────────────────────────┐
  │                 HEADROOM PROXY / MCP SERVER             │
  │                                                         │
  │  ┌───────────────────────┐   ┌────────────────────────┐ │
  │  │ Rust Token Killer     │   │ Schema Flattener       │ │
  │  │ (Strips ANSI / Whitesp)│  │ (Compresses JSON Trees)│ │
  │  └───────────────────────┘   └────────────────────────┘ │
  │               │                          │              │
  │               └─────────────┬────────────┘              │
  │                             ▼                           │
  │        [ Semantic Deduplication & Error Extractor ]     │
  └─────────────────────────────┬───────────────────────────┘
                                │
                                ▼  (Compressed Payload: 3,200 Tokens)
  LLM Prompt Context (Saves 92% Tokens & Prevents Attention Degradation!)
                                │
                                ▼
  LLM Response ──► [ OutputShaper ] ──► Clean Direct Code Output`,
    technicalExplanation: "Headroom implements the Rust Token Killer (RTK) engine with SIMD-accelerated string scanning and AST parsing. It operates as a Model Context Protocol (MCP) server or HTTP proxy. On structured JSON payloads, it performs schema compression—converting verbose repeated key-value dictionaries into compact column-oriented tables. On terminal outputs, it filters passing test assertions and isolates fail traces. In addition, its OutputShaper prunes conversational filler ('Certainly! I can help you with...') on the output side, ensuring zero token waste in both directions.",
    experiment: `# Launch Headroom as an MCP compression server:
npx @headroomlabs/cli start --mcp --port 3100
# Run a token audit against a 1,000-line test log:
npx @headroomlabs/cli test --file sample-npm-test.log
# Benchmark Result:
# Raw Input: 42,850 tokens | Headroom Compressed: 2,140 tokens | Savings: 95.0%
# Rust Execution Latency: 1.14 ms`,
    takeaways: [
      "Garbage In, Attention Degradation Out: Clean, compressed context directly improves LLM reasoning and code correctness.",
      "Native Compression Over LLM Summarization: Use ultra-fast Rust regex/AST proxies (<2ms) instead of wasting LLM calls to summarize logs.",
      "Universal MCP Standard: Implement compression as a transparent proxy layer compatible with Claude Code, Cursor, and custom agents.",
      "Bidirectional Optimization: Compress inputs to save context space, and prune polite output filler to accelerate generation throughput."
    ],
    nextBridge: "Managing context bloat gives agents a 5x longer working memory. But what if you want to run massive 700B+ MoE models without Python, PyTorch, or cloud clusters? In our final breakthrough edition, Issue #10, we meet Colibri...",
    specs: {
      "Compression Ratio": "60-95% on JSON/Logs, ~20% on raw code",
      "Deployment Options": "MCP Server, HTTP Proxy, Python SDK, TypeScript SDK",
      "Engine": "Rust Token Killer (RTK) + OutputShaper",
      "Compatibility": "Claude Code, Cursor, Aider, LangChain, MCP Hosts",
      "Latency Overhead": "< 2 ms (Native Rust parsing)"
    },
    highlights: ["Token Compression", "MCP Server", "Rust Token Killer", "95% Reduction", "Claude Code"],
    featured: false
  },
  {
    id: 10,
    shortName: "Colibri (Pure C MoE Engine)",
    title: "Pure C, Zero Dependencies: Streaming 700B+ MoE Models on Consumer Hardware with Colibri",
    subtitle: "No Python, no PyTorch, no heavy CUDA drivers: unifying NVMe SSDs, RAM, and GPU memory into a virtual compute hierarchy",
    date: "Jul 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "7 min read",
    url: "https://github.com/JustVugg/colibri",
    repoName: "JustVugg/colibri",
    summary: "Colibri is a masterclass in systems engineering created by JustVugg. It is a pure C inference runtime with zero external dependencies designed to run trillion-parameter Mixture-of-Experts (MoE) models—including GLM-5.2 (744B), Inkling (975B), and Kimi K3 (2.8T)—on consumer hardware. Instead of requiring a $200,000 cluster with terabytes of VRAM, Colibri implements 'Memory Multitiering', treating high-speed NVMe SSDs, system DDR RAM, and GPU memory as a unified virtual storage hierarchy, streaming required expert weights on-demand.",
    whyHighlighted: "Why it's highlighted: Redefines what is computationally possible on consumer machines. By eliminating Python, PyTorch, and heavy CUDA wrappers in favor of hand-optimized pure C and direct OS memory-mapped files (mmap), Colibri allows curious researchers to run and study frontier trillion-parameter models right on their personal workstations.",
    hook: "The modern AI software stack has become terrifyingly bloated. To run a simple inference loop, we download 5GB of PyTorch wheels, 10GB of CUDA libraries, Python interpreters, and dozens of wrapper dependencies. But what happens when you strip all of that away and write an inference engine in pure, hand-optimized C with zero external libraries?",
    problem: "Trillion-parameter Mixture-of-Experts models (GLM-5.2 744B, Inkling 975B, Kimi K3 2.8T) are completely inaccessible to normal engineers. Serving them traditionally requires an 8x H100 GPU server costing $250,000. Even running quantized weights locally fails because PyTorch and standard inference runtimes lack granular control over virtual memory paging and OS kernel page caches.",
    intuition: "Here is the brilliant realization behind Colibri: an operating system's virtual memory subsystem has been perfected over 50 years to stream data between SSDs and RAM with microsecond efficiency. In an MoE model, only a tiny fraction of experts are active for any given token. Instead of holding all 700B weights in RAM, Colibri unifies your NVMe SSD (Cold tier), system RAM (Hot expert cache), and GPU memory (Active compute) into one seamless virtual memory hierarchy in pure C.",
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 COLIBRI MULTITIERED MOE ENGINE              │
└─────────────────────────────────────────────────────────────┘
  Token Generation Loop (Top-K Expert Selection)
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │       Tier 1: NVMe SSD Storage (Cold Weights Tier)      │
  │    700B - 2.8T Parameter MoE Weights in mmap files      │
  └──────────────────────┬──────────────────────────────────┘
                         │  (On-Demand Expert Page Fault Stream)
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │     Tier 2: System RAM (Hot Active Expert LRU Cache)    │
  │    Predictive pre-fetching loads likely next experts    │
  └──────────────────────┬──────────────────────────────────┘
                         │  (Direct Memory Access DMA)
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │     Tier 3: GPU VRAM / CPU SIMD (Active Compute Core)   │
  │    Pure C AVX-512 / Metal / CUDA Matrix Multiplication  │
  └──────────────────────┬──────────────────────────────────┘
                         │
                         ▼
  OpenAI-Compatible Local API Endpoint (/v1/chat/completions)`,
    technicalExplanation: "Colibri is written in 100% pure ANSI C without a single third-party library dependency; it compiles with 'gcc -O3' in two seconds. It uses POSIX 'mmap()' with 'MADV_WILLNEED' and predictive read-ahead heuristics to load MoE expert weights directly from high-speed NVMe Gen4 drives (7,000 MB/s). Hot experts remain in system RAM managed by an internal lock-free LRU cache. Matrix multiplications are written in hand-vectorized AVX-512 and Apple Metal shaders. It even embeds a minimal socket-based HTTP daemon to expose a standard '/v1/chat/completions' API.",
    experiment: `# Compile and run Colibri from source in 5 seconds:
git clone https://github.com/JustVugg/colibri.git && cd colibri
gcc -O3 colibri.c -o colibri -lpthread -lm
./colibri --model /Volumes/NVMe/glm-5.2-744b.colibri --port 8080
# Server listening on http://localhost:8080 (0 Python dependencies, zero CUDA bloat!)`,
    takeaways: [
      "Systems Engineering Trumps Framework Bloat: Pure C and direct OS primitives can outperform layers of abstraction by orders of magnitude.",
      "Memory Multitiering Decouples Model Size: NVMe SSDs (Tier 1) + RAM (Tier 2) + GPU (Tier 3) allow trillion-parameter execution on desktop hardware.",
      "Sparse MoE Weight Locality: Because MoE routing is sparse, only a tiny subset of weights need to touch high-speed compute buffers per token.",
      "Software Longevity & Portability: Zero-dependency C code written today will compile and run identically thirty years from now."
    ],
    nextBridge: "You've explored edge microcontrollers, memory-tiered fine-tuning, autonomous coding swarms, interactive vector education, WebGL biomedical CAD, and pure C trillion-parameter runtimes. Dive back into our interactive visual laboratories in AI Engineering Visualized, adjust the sliders, and turn this intuition into working code!",
    specs: {
      "Supported Models": "GLM-5.2 (744B), Inkling (975B), Kimi K3 (2.8T), Qwen3.8-Flash",
      "Implementation": "100% Pure C (Zero third-party library dependencies)",
      "Architecture": "Memory Multitiering with Dynamic MoE Expert Streaming",
      "Memory Strategy": "mmap Direct I/O with Predictive Read-Ahead Ring Buffers",
      "API Server": "Built-in lightweight OpenAI-compatible HTTP daemon"
    },
    highlights: ["Pure C", "700B MoE", "Memory Multitiering", "Zero Dependencies", "Expert Streaming"],
    featured: false
  }
];

const TECH_RADAR = [
  {
    ring: "Adopt",
    color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    items: [
      { name: "Headroom MCP", desc: "Token & context compression proxy saving 60-95% payload across coding agents." },
      { name: "Needle Edge Model", desc: "Sub-30M zero-FFN foundation model for 6000 tok/s on-device tool calling." },
      { name: "MCP Protocol 1.0", desc: "Standardized tool integration across LLM hosts and external servers." },
      { name: "vLLM Chunked Prefill", desc: "Production standard for high-throughput memory-efficient LLM serving." }
    ]
  },
  {
    ring: "Trial",
    color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    items: [
      { name: "Soup (soup-cli)", desc: "Fine-tune 8B models on 4GB VRAM laptops via layer streaming." },
      { name: "Freebuff Multi-Agent", desc: "Subscription-free open-source agentic coding with sub-agent swarms." },
      { name: "Laya System 1", desc: "Non-autoregressive 10ms decision layer replacing slow generative LLMs for routing." },
      { name: "Claude Code CLI", desc: "Terminal-native agentic coding with permission boundaries and AST context." }
    ]
  },
  {
    ring: "Assess",
    color: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    items: [
      { name: "Qwen3.8-Flash-Next", desc: "180B sparse MoE activating only ~6B parameters per token with 1M context." },
      { name: "Colibri Pure C", desc: "Memory multitiering streaming 700B+ MoE models across SSD, RAM, and GPU." },
      { name: "Tiiny Pocket AI", desc: "Palm-sized 80GB unified memory supercomputer running 120B models offline." },
      { name: "Papermorph", desc: "Code-generation pipeline transforming dense PDFs into interactive web lessons." },
      { name: "Human-Atlas", desc: "Interactive 3D anatomical viewer rendering 2,234 meshes in WebGL." }
    ]
  },
  {
    ring: "Hold",
    color: "border-rose-500/50 bg-rose-500/10 text-rose-400",
    items: [
      { name: "Uncompressed Context Bloat", desc: "Feeding raw, unpruned JSON and terminal logs into agent prompts." },
      { name: "Heavy LLM Routing", desc: "Using expensive 70B generative models for simple classification or guardrails." },
      { name: "Pure SFT without RL", desc: "Supervised fine-tuning alone without preference optimization." }
    ]
  }
];

export default function NewsletterIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [shareModalData, setShareModalData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDiagram, setCopiedDiagram] = useState(false);
  const [copiedExperiment, setCopiedExperiment] = useState(false);

  // Read issue from searchParams (inside hash like #/newsletter?issue=1)
  // OR from window.location.search (before hash like ?issue=1#/newsletter)
  // OR from hash anchor (like #issue-1)
  const getActiveIssueId = () => {
    const issueP = searchParams.get('issue');
    if (issueP) {
      const parsed = parseInt(issueP, 10);
      if (!isNaN(parsed)) return parsed;
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryIssue = urlParams.get('issue');
      if (queryIssue) {
        const parsed = parseInt(queryIssue, 10);
        if (!isNaN(parsed)) return parsed;
      }
      const hash = window.location.hash;
      const hashMatch = hash.match(/issue[=-](\d+)/);
      if (hashMatch) {
        const parsed = parseInt(hashMatch[1], 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return null;
  };

  const activeIssueId = getActiveIssueId();
  const currentArticle = activeIssueId ? EDITIONS.find(ed => ed.id === activeIssueId) : null;

  // Sync hash with issue param for backward compatibility
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('issue-') && !searchParams.get('issue')) {
      const match = hash.match(/issue-(\d+)/);
      if (match) {
        setSearchParams({ issue: match[1] });
      }
    }
  }, [searchParams, setSearchParams]);

  const categories = ["All", "Edge & Hardware", "Developer Tools", "Architecture & RAG", "MLOps & Systems", "Frontier Models"];

  const filteredEditions = EDITIONS.filter((ed) => {
    const matchesCategory = selectedCategory === "All" || ed.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      ed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ed.shortName && ed.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ed.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.whyHighlighted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredIssue = EDITIONS.find(ed => ed.featured) || EDITIONS[0];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      localStorage.setItem("ai_engineering_newsletter_email", email);
    }
  };

  const getShareUrl = (issueId = null) => {
    let origin = 'https://amara-manikanta.github.io';
    let path = '/ai-engineering-visualized/';

    if (typeof window !== 'undefined') {
      const isHttp = window.location.protocol.startsWith('http');
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isHttp && !isLocalhost) {
        origin = window.location.origin;
        path = window.location.pathname.replace(/\/index\.html$/, '');
        if (!path.endsWith('/')) path += '/';
      }
    }

    const hashRoute = issueId ? `#/radar?issue=${issueId}` : `#/radar`;
    return `${origin}${path}${hashRoute}`;
  };

  const triggerShare = (target = null) => {
    if (target) {
      setShareModalData({
        title: target.title,
        subtitle: target.subtitle,
        url: getShareUrl(target.id),
        repoName: target.repoName,
        text: `Explore ${target.title} (${target.repoName}) in AI Engineering Radar!`
      });
    } else {
      setShareModalData({
        title: "AI Engineering Radar 2026",
        subtitle: "Visual breakdowns of edge models, training runtimes, and frontier AI tools",
        url: getShareUrl(null),
        repoName: "ai-engineering-radar",
        text: "Explore AI Engineering Radar: In-depth visual breakdowns of frontier models, edge runtimes, and developer tooling!"
      });
    }
  };

  const handleShareSocial = (platform, data) => {
    if (!data) return;
    const url = data.url;
    const text = data.text || `${data.title} - ${data.subtitle}`;
    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=AIEngineering,OpenSource,AI`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
        break;
      case 'reddit':
        shareLink = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }

    if (shareLink && typeof window !== 'undefined') {
      window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=520');
    }
  };

  const handleDeviceShare = async (data) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.subtitle || data.title,
          url: data.url
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleCopy = async (textToCopy) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleCopyDiagram = async (diagramText) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(diagramText);
        setCopiedDiagram(true);
        setTimeout(() => setCopiedDiagram(false), 2000);
      } catch (err) {
        console.error('Failed to copy diagram', err);
      }
    }
  };

  const handleCopyExperiment = async (experimentText) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(experimentText);
        setCopiedExperiment(true);
        setTimeout(() => setCopiedExperiment(false), 2000);
      } catch (err) {
        console.error('Failed to copy experiment', err);
      }
    }
  };

  const openFreshArticlePage = (ed) => {
    setSearchParams({ issue: ed.id.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToAllNewsletters = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Table of Contents for GuideLayout
  const toc = currentArticle ? [
    { label: "1. The Problem", hash: "problem" },
    { label: "2. Core Intuition", hash: "intuition" },
    { label: "3. Visual Blueprint", hash: "visualization" },
    { label: "4. Technical Deep-Dive", hash: "technical-explanation" },
    { label: "5. Hands-on Experiment", hash: "experiment" },
    { label: "6. Engineering Takeaway", hash: "takeaway" },
    { label: "Share Breakdown", hash: "share-article" },
    { label: "Next & Previous", hash: "related" }
  ] : [
    { label: "Featured Issue", hash: "featured" },
    { label: "Highlighted Technologies", hash: "editions" },
    { label: "AI Tech Radar 2026", hash: "tech-radar" },
    { label: "Subscribe", hash: "subscribe" }
  ];

  /* =========================================================================
     VIEW 1: FRESH STANDALONE ARTICLE PAGE
     ========================================================================= */
  if (currentArticle) {
    const prevArticle = EDITIONS.find(ed => ed.id === currentArticle.id + 1) || null;
    const nextArticle = EDITIONS.find(ed => ed.id === currentArticle.id - 1) || null;

    return (
      <GuideLayout
        title={currentArticle.title}
        intro={currentArticle.subtitle}
        toc={toc}
      >
        {/* Breadcrumb & Quick Actions Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111111] border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={returnToAllNewsletters}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all hover:-translate-x-0.5"
            >
              <span>←</span>
              <span>AI Engineering Radar</span>
            </button>
            <span className="text-gray-600">/</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentArticle.categoryColor}`}>
              {currentArticle.category}
            </span>
            <span className="hidden sm:inline text-xs text-gray-400 font-mono">Issue #{currentArticle.id} · {currentArticle.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <span>📂 {currentArticle.repoName}</span>
              <span>↗</span>
            </a>
            <button
              onClick={() => triggerShare(currentArticle)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <ShareIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            STAGE 1: THE HOOK & THE PRODUCTION PROBLEM
            ========================================================================= */}
        <section id="problem" className="mb-14 scroll-mt-24">
          {/* Eye-catching 20-Second Hook Callout */}
          <div className="relative mb-8 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#16120e] to-[#0d0d0d] border border-amber-500/40 p-6 md:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>The 20-Second Hook</span>
            </div>
            <p className="text-amber-100 font-medium text-lg md:text-xl leading-relaxed italic">
              "{currentArticle.hook}"
            </p>
          </div>

          {/* The Problem Narrative */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 relative shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-rose-400">
              <span>⚠️</span> Stage 1: The Production Problem
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4">
              What breaks in standard production systems?
            </h3>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 whitespace-pre-line">
              {currentArticle.problem}
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Executive Context & Architecture Summary</div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {currentArticle.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-gray-500 font-mono mr-2">Architectural Tags:</span>
              {currentArticle.highlights.map((h, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                  #{h}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            STAGE 2: CORE INTUITION (MAKE THE INVISIBLE VISIBLE)
            ========================================================================= */}
        <section id="intuition" className="mb-14 scroll-mt-24">
          <div className="bg-gradient-to-br from-indigo-950/40 via-[#13121d] to-[#0d0d0d] border border-indigo-500/40 rounded-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <span>🧠</span> Stage 2: Core Intuition
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Motto: Make the Invisible Visible
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4">
              The Mental Model Behind The Architecture
            </h3>

            <p className="text-indigo-100/90 text-base md:text-lg font-normal leading-relaxed mb-6">
              {currentArticle.intuition}
            </p>

            {/* Why Highlighted Box */}
            <div className="bg-black/50 border border-indigo-500/30 rounded-xl p-5">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>💡</span> Why This Is Highlighted in 2026:
              </div>
              <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                {currentArticle.whyHighlighted.replace("Why it's highlighted: ", "")}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            STAGE 3: VISUAL BLUEPRINT & DATA FLOW
            ========================================================================= */}
        <section id="visualization" className="mb-14 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span>📐</span> Stage 3: Visual Architecture Blueprint
            </div>
            <button
              onClick={() => handleCopyDiagram(currentArticle.diagram)}
              className="text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              <span>{copiedDiagram ? "Blueprint Copied! ✓" : "Copy ASCII Blueprint"}</span>
            </button>
          </div>

          <div className="bg-black/95 border border-emerald-500/30 rounded-2xl p-5 md:p-6 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs text-gray-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-gray-300 font-semibold">{currentArticle.repoName} — dataflow-pipeline.txt</span>
              </div>
              <span className="text-[11px] text-emerald-400/80">Monospaced Architecture Canvas</span>
            </div>
            <div className="overflow-x-auto font-mono text-xs md:text-sm text-emerald-400/90 leading-relaxed py-2">
              <pre className="whitespace-pre">{currentArticle.diagram}</pre>
            </div>
          </div>
        </section>

        {/* =========================================================================
            STAGE 4: TECHNICAL DEEP DIVE & HARDWARE MATRIX
            ========================================================================= */}
        <section id="technical-explanation" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <span>🔬</span> Stage 4: Technical Deep Dive & Systems Breakdown
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4">
              How It Actually Works Under The Hood
            </h3>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6">
              {currentArticle.technicalExplanation}
            </p>

            {currentArticle.specs && (
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-4">
                  Hardware Specifications & Systems Matrix:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(currentArticle.specs).map(([label, value]) => (
                    <div key={label} className="bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-md">
                      <span className="text-gray-400 font-mono text-xs mb-1.5">{label}</span>
                      <span className="text-cyan-300 font-bold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            STAGE 5: HANDS-ON EXPERIMENT TERMINAL LAB
            ========================================================================= */}
        <section id="experiment" className="mb-14 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <span>💻</span> Stage 5: Reproducible Terminal Lab & Experiment
            </div>
            <button
              onClick={() => handleCopyExperiment(currentArticle.experiment)}
              className={`text-xs font-mono flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition-all ${
                copiedExperiment
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-amber-400/50"
              }`}
            >
              <CopyIcon className="w-3.5 h-3.5" />
              <span>{copiedExperiment ? "Commands Copied! ✓" : "Copy Terminal Commands"}</span>
            </button>
          </div>

          <div className="bg-[#0b0c10] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#13151b] border-b border-white/10 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-gray-300 font-semibold">reproduce-benchmark.sh</span>
              </div>
              <span className="text-gray-500">Bash / CLI Run</span>
            </div>
            <div className="p-5 md:p-6 font-mono text-xs md:text-sm text-amber-300/90 leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre">{currentArticle.experiment}</pre>
            </div>
          </div>
        </section>

        {/* =========================================================================
            STAGE 6: ARCHITECTURAL TAKEAWAYS & NEXT EXPLORATION BRIDGE
            ========================================================================= */}
        <section id="takeaway" className="mb-14 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <span>⚡</span> Stage 6: Architectural Decisions & Next Bridge
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl mb-6">
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4">
              Core Engineering Heuristics
            </h3>
            {currentArticle.takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3.5 text-sm md:text-base text-gray-200">
                <span className="text-indigo-400 font-bold mt-0.5 text-base">✓</span>
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Next Exploration Bridge (Cliffhanger / Connective Narrative) */}
          <div className="bg-gradient-to-r from-purple-950/40 via-[#14141d] to-indigo-950/40 border border-purple-500/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">
              <span>🌉</span> The Next Connection:
            </div>
            <p className="text-purple-100 text-base md:text-lg leading-relaxed font-medium">
              {currentArticle.nextBridge}
            </p>
          </div>
        </section>

        {/* SECTION 6: SOCIAL MEDIA SHARE STRIP */}
        <section id="share-article" className="mb-12 scroll-mt-24">
          <div className="bg-gradient-to-r from-purple-950/40 via-[#131313] to-indigo-950/40 border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShareIcon className="w-4 h-4 text-indigo-400" />
                <span>Share This Engineering Breakdown with Your Network</span>
              </div>
              {copiedLink && (
                <span className="text-xs font-bold text-emerald-400 font-mono animate-pulse">
                  ✓ Permlink copied to clipboard!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
              <button
                onClick={() => handleShareSocial('twitter', {
                  title: currentArticle.title,
                  subtitle: currentArticle.subtitle,
                  url: getShareUrl(currentArticle.id),
                  text: `Check out ${currentArticle.title} (${currentArticle.repoName}) in AI Engineering Radar!`
                })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white text-xs font-bold transition-all shadow-md"
              >
                <TwitterIcon className="w-4 h-4" />
                <span>X / Twitter</span>
              </button>

              <button
                onClick={() => handleShareSocial('linkedin', {
                  title: currentArticle.title,
                  subtitle: currentArticle.subtitle,
                  url: getShareUrl(currentArticle.id),
                  text: `${currentArticle.title} - ${currentArticle.subtitle}`
                })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 text-[#70b5f9] text-xs font-bold transition-all shadow-md"
              >
                <LinkedInIcon className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => handleShareSocial('whatsapp', {
                  title: currentArticle.title,
                  subtitle: currentArticle.subtitle,
                  url: getShareUrl(currentArticle.id),
                  text: `Explore ${currentArticle.title} (${currentArticle.repoName}):`
                })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#75f1a5] text-xs font-bold transition-all shadow-md"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleShareSocial('reddit', {
                  title: currentArticle.title,
                  subtitle: currentArticle.subtitle,
                  url: getShareUrl(currentArticle.id),
                  text: `${currentArticle.title} - Visual Engineering Breakdown`
                })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF4500]/20 hover:bg-[#FF4500]/30 border border-[#FF4500]/50 text-[#ffa285] text-xs font-bold transition-all shadow-md"
              >
                <RedditIcon className="w-4 h-4" />
                <span>Reddit</span>
              </button>

              <button
                onClick={() => handleShareSocial('telegram', {
                  title: currentArticle.title,
                  subtitle: currentArticle.subtitle,
                  url: getShareUrl(currentArticle.id),
                  text: `Architecture Deep Dive: ${currentArticle.title}`
                })}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#78c9f5] text-xs font-bold transition-all shadow-md"
              >
                <TelegramIcon className="w-4 h-4" />
                <span>Telegram</span>
              </button>

              <button
                onClick={() => handleCopy(getShareUrl(currentArticle.id))}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 text-xs font-bold transition-all shadow-md"
              >
                <CopyIcon className="w-4 h-4" />
                <span>{copiedLink ? "Copied! ✓" : "Copy Link"}</span>
              </button>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl(currentArticle.id)}
                className="bg-transparent text-xs text-gray-300 font-mono px-2 py-1 w-full focus:outline-none"
              />
              <button
                onClick={() => handleCopy(getShareUrl(currentArticle.id))}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  copiedLink
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {copiedLink ? "Copied! ✓" : "Copy Permlink"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 7: RELATED & ADJACENT EDITIONS */}
        <section id="related" className="mb-14 scroll-mt-24">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-bold text-white">Next & Previous Editions</h3>
            <button
              onClick={returnToAllNewsletters}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-bold"
            >
              Back to AI Engineering Radar →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {prevArticle ? (
              <div
                onClick={() => openFreshArticlePage(prevArticle)}
                className="bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="text-[11px] text-gray-500 font-mono mb-1">← PREVIOUS EDITION #{prevArticle.id}</div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                  {prevArticle.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">{prevArticle.subtitle}</p>
              </div>
            ) : (
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 text-gray-600 text-xs font-mono">
                You are viewing the latest technology edition.
              </div>
            )}

            {nextArticle ? (
              <div
                onClick={() => openFreshArticlePage(nextArticle)}
                className="bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 group text-right"
              >
                <div className="text-[11px] text-gray-500 font-mono mb-1">NEXT EDITION #{nextArticle.id} →</div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                  {nextArticle.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">{nextArticle.subtitle}</p>
              </div>
            ) : (
              <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-5 text-gray-600 text-xs font-mono text-right">
                End of current issue sequence.
              </div>
            )}
          </div>

          {/* Quick Jump Directory to all 10 Breakouts */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Explore All 10 Breakout Technologies on AI Engineering Radar:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {EDITIONS.map((ed) => (
                <button
                  key={ed.id}
                  onClick={() => openFreshArticlePage(ed)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    ed.id === currentArticle.id
                      ? "bg-white text-black font-bold border-white"
                      : "bg-black/50 text-gray-300 border-white/5 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="font-mono text-[10px] opacity-70 mb-0.5">#{ed.id} · {ed.category}</div>
                  <div className="font-bold line-clamp-1">{ed.shortName || ed.title.split(':')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Floating Return Button */}
        <div className="mt-12 text-center">
          <button
            onClick={returnToAllNewsletters}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
          >
            ← Back to AI Engineering Radar
          </button>
        </div>
      </GuideLayout>
    );
  }

  /* =========================================================================
     VIEW 2: NEWSLETTER INDEX & TECH RADAR ARCHIVE
     ========================================================================= */
  return (
    <GuideLayout
      title="📡 AI Engineering Radar"
      intro="Visual deep-dives, architectural breakdowns, and repository links for breakout AI technologies, edge models, training runtimes, and developer tooling."
      toc={toc}
    >
      {/* ====== TOP SOCIAL SHARE BAR ====== */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>10 Curated AI Breakthroughs & Architectures for 2026</span>
        </div>
        <button
          onClick={() => triggerShare(null)}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-2 transition-all hover:border-indigo-400 shadow-sm"
        >
          <ShareIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Share Radar to Social Media</span>
        </button>
      </div>

      {/* ====== FEATURED EDITION (HERO SPOTLIGHT) ====== */}
      <section id="featured" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Featured Technology Spotlight
        </div>

        {featuredIssue && (
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#111111] to-[#0a0a0a] border border-emerald-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${featuredIssue.categoryColor}`}>
                {featuredIssue.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">Issue #{featuredIssue.id} · {featuredIssue.date} · {featuredIssue.readTime}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
              {featuredIssue.title}
            </h2>
            <p className="text-emerald-400/90 font-mono text-sm mb-4">
              {featuredIssue.subtitle}
            </p>

            <p className="text-gray-300 text-base leading-relaxed mb-5">
              {featuredIssue.summary}
            </p>

            {/* Why Highlighted Box */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🌟</span> Why This Is Highlighted in 2026:
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed">
                {featuredIssue.whyHighlighted.replace("Why it's highlighted: ", "")}
              </p>
            </div>

            {/* Visual Architecture Preview */}
            <div className="bg-black/70 border border-white/10 rounded-xl p-4 mb-6 font-mono text-xs text-gray-300 overflow-x-auto">
              <div className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-2">Architectural Blueprint Preview:</div>
              <pre className="text-emerald-400/90 whitespace-pre leading-snug">{featuredIssue.diagram}</pre>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-6 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wide mb-3">⚡ Key Architectural Takeaways:</h4>
              {featuredIssue.takeaways.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={featuredIssue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>🔗 {featuredIssue.repoName}</span>
                  <span className="text-emerald-400">↗</span>
                </a>
                <div className="flex flex-wrap gap-1.5">
                  {featuredIssue.highlights.map((h, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => triggerShare(featuredIssue)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition-all hover:border-emerald-400"
                >
                  <ShareIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share Issue</span>
                </button>
                <button
                  onClick={() => openFreshArticlePage(featuredIssue)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                >
                  6-Stage Deep Dive (Problem → Experiment) <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====== FILTER TABS & SEARCH ====== */}
      <section id="editions" className="mb-14 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Highlighted Technologies & Breakdowns</h2>
            <p className="text-sm text-gray-400">Detailed visual engineering reviews with official repo & project links.</p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search tools, repos, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-[#111111] text-gray-400 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* EDITIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEditions.map((ed) => (
            <motion.div
              key={ed.id}
              whileHover={{ y: -4 }}
              className="bg-[#111111] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${ed.categoryColor}`}>
                    {ed.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Issue #{ed.id} · {ed.date}</span>
                </div>

                <h3
                  onClick={() => openFreshArticlePage(ed)}
                  className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors leading-snug cursor-pointer"
                >
                  {ed.title}
                </h3>

                <p className="text-xs text-indigo-400 font-mono mb-3">
                  {ed.subtitle}
                </p>

                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                  {ed.summary}
                </p>

                {/* Highlight callout pill */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-4">
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <span>💡</span> Why It's Highlighted:
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {ed.whyHighlighted.replace("Why it's highlighted: ", "")}
                  </p>
                </div>
              </div>

              <div>
                {/* Official Repository or Website Link */}
                <div className="mb-4">
                  <a
                    href={ed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors"
                  >
                    <span>📂 {ed.repoName}</span>
                    <span className="text-indigo-400 text-sm">↗</span>
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ed.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-gray-400 border border-white/5">
                      #{h}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">⏱️ {ed.readTime}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerShare(ed);
                      }}
                      title="Share to social media"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 border border-white/5"
                    >
                      <ShareIcon className="w-3 h-3 text-indigo-400" />
                      <span>Share</span>
                    </button>
                  </div>
                  <button
                    onClick={() => openFreshArticlePage(ed)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    6-Stage Deep Dive <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEditions.length === 0 && (
          <div className="text-center py-16 bg-[#111111] rounded-2xl border border-white/10 text-gray-400">
            <p className="text-base font-semibold mb-2">No technologies match your filter or search query.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="text-xs text-indigo-400 underline font-bold"
            >
              Clear filters and search
            </button>
          </div>
        )}
      </section>

      {/* ====== TECH RADAR WIDGET ====== */}
      <section id="tech-radar" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📡</span>
          <h2 className="text-2xl font-bold text-white">AI Engineering Tech Radar 2026</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl">
          Our opinionated radar tracking which frameworks, models, runtimes, and engineering paradigms to Adopt, Trial, Assess, or Hold.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECH_RADAR.map((radar) => (
            <div key={radar.ring} className={`border rounded-2xl p-6 bg-[#0e0e0e] ${radar.color.split(' ')[0]}`}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${radar.color}`}>
                  Ring: {radar.ring.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 font-mono">{radar.items.length} Tracked Technologies</span>
              </div>

              <div className="space-y-3">
                {radar.items.map((tech) => (
                  <div key={tech.name} className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                      {tech.name}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== SUBSCRIBE CARD ====== */}
      <section id="subscribe" className="mb-14 scroll-mt-24">
        <div className="bg-gradient-to-r from-indigo-950/50 via-[#141414] to-purple-950/40 border border-indigo-500/30 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl">
          <span className="text-4xl block mb-3">📬</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Subscribe to AI Engineering Radar
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Curated architectural breakdowns, edge model breakthroughs, and open-source tooling analysis delivered directly to your inbox.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all whitespace-nowrap shadow-lg shadow-indigo-600/30"
              >
                Subscribe Free
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 max-w-md mx-auto text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
              <span>🎉 You're subscribed! Welcome to AI Engineering Radar.</span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 font-mono">
            Zero spam. Unsubscribe anytime with 1-click.
          </p>
        </div>
      </section>

      {/* ====== SOCIAL SHARE MODAL ====== */}
      <AnimatePresence>
        {shareModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/20 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl"
            >
              <button
                onClick={() => setShareModalData(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShareIcon className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-white">Share to Social Media</h3>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Share this technical breakdown with fellow AI engineers and researchers.
              </p>

              {/* Preview card */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 mb-5">
                <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {shareModalData.title}
                </div>
                <div className="text-[11px] text-gray-400 line-clamp-2 mb-2 font-mono">
                  {shareModalData.subtitle}
                </div>
                <div className="text-[10px] text-indigo-400 font-mono truncate">
                  {shareModalData.url}
                </div>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                <button
                  onClick={() => handleShareSocial('twitter', shareModalData)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <TwitterIcon className="w-4 h-4" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={() => handleShareSocial('linkedin', shareModalData)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 text-[#70b5f9] text-xs font-bold transition-all shadow-sm"
                >
                  <LinkedInIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShareSocial('whatsapp', shareModalData)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#75f1a5] text-xs font-bold transition-all shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShareSocial('reddit', shareModalData)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#FF4500]/20 hover:bg-[#FF4500]/30 border border-[#FF4500]/50 text-[#ffa285] text-xs font-bold transition-all shadow-sm"
                >
                  <RedditIcon className="w-4 h-4" />
                  <span>Reddit</span>
                </button>

                <button
                  onClick={() => handleShareSocial('telegram', shareModalData)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#78c9f5] text-xs font-bold transition-all shadow-sm"
                >
                  <TelegramIcon className="w-4 h-4" />
                  <span>Telegram</span>
                </button>

                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={() => handleDeviceShare(shareModalData)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-bold transition-all shadow-sm"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Device Menu</span>
                  </button>
                )}
              </div>

              {/* Direct Link Copy Input */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareModalData.url}
                  className="bg-transparent text-xs text-gray-300 font-mono px-2 py-1 w-full focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(shareModalData.url)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    copiedLink
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {copiedLink ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GuideLayout>
  );
}

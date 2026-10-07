import React, { useState, useEffect } from 'react';
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
      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m5.01 4.75c.69 0 1.25.56 1.25 1.25a1.25 1.25 0 0 1-2.22.81c-1.39-.45-3-.45-4.4 0a1.24 1.24 0 0 1-.64-.53l1.86-3.95 3.32.74c.2.98.83 1.68 1.83 1.68m-9.51 5.5c.78 0 1.42.64 1.42 1.42 0 .79-.64 1.43-1.42 1.43-.79 0-1.43-.64-1.43-1.43 0-.78.64-1.42 1.43-1.42m9 0c.78 0 1.42.64 1.42 1.42 0 .79-.64 1.43-1.42 1.43-.78 0-1.42-.64-1.42-1.43 0-.78.64-1.42 1.42-1.42m-4.5 4.75c-1.84 0-3.33-.78-3.33-.78-.17-.11-.22-.33-.11-.5.11-.17.33-.22.5-.11 0 0 1.29.64 2.94.64s2.94-.64 2.94-.64c.17-.11.39-.06.5.11.11.17.06.39-.11.5 0 0-1.49.78-3.33.78" />
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
    title: "Needle: 26M Parameter Zero-FFN Automation Foundation Model for Edge Devices",
    subtitle: "Eliminating Feed-Forward Networks for 6,000 tok/s Edge Tool Calling",
    date: "Oct 2026",
    category: "Edge & Hardware",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "6 min read",
    url: "https://github.com/cactus-compute/needle",
    repoName: "cactus-compute/needle",
    summary: "Needle is an open-source 26-million parameter automation foundation model engineered by Cactus Compute specifically for tiny edge devices, microcontrollers, and smartphones. By radically stripping out Feed-Forward Networks (FFNs) entirely and relying solely on a Simple Attention Network with gating mechanisms, Needle shrinks memory footprint to 8–29 MB under 2-bit quantization while delivering blazing inference speeds: 6,000 tokens/sec prefill and 1,200 tokens/sec decode on consumer edge chips.",
    whyHighlighted: "Why it's highlighted: Needle challenges the prevailing dogma that agentic function calling requires multi-billion parameter LLMs. By proving that a specialized 26M model without FFN bloat can reliably parse schemas, execute function calls, and extract structured data at milliwatt power consumption, it opens the floodgates for true on-device autonomy in robotics, wearables, and offline IoT sensors.",
    takeaways: [
      "Zero-FFN Architecture: Replaces dense MLP/FFN blocks (which consume 65-75% of model weights) with gated simple linear attention layers.",
      "Extreme Speed on Consumer Silicon: Reaches 6,000 tok/s prefill and 1,200 tok/s decode on Apple Silicon, Snapdragon, and embedded ARM chips.",
      "Ultra-Compact 8-29MB Footprint: 2-bit quantized weights fit entirely inside on-chip SRAM or low-cost microcontrollers.",
      "Tuned for Tool Calling: Pretrained exclusively for function schemas, JSON extraction, and deterministic tool dispatch."
    ],
    specs: {
      "Parameters": "26 Million",
      "Model Size": "8 MB (2-bit) / 29 MB (8-bit)",
      "Inference Speed": "6,000 tok/s prefill, 1,200 tok/s decode",
      "Architecture": "Simple Attention Network (No FFNs)",
      "Target Devices": "Phones, Wearables, ESP32/Cortex-M, Edge Robots"
    },
    diagram: `┌─────────────────────────────────────────────────────────────┐
│              NEEDLE ZERO-FFN ATTENTION PIPELINE             │
└─────────────────────────────────────────────────────────────┘
  Input Tokens ──► Token Embedding (26M Total Weights)
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
  Structured Tool Dispatch / JSON Output (1,200 tok/s decode)`,
    highlights: ["Zero-FFN", "26M Params", "Edge Tool Calling", "2-Bit Quant", "6000 tok/s"],
    featured: true
  },
  {
    id: 2,
    title: "Soup (soup-cli): Fine-Tuning 8B LLMs on 4GB VRAM Laptops via Layer Streaming",
    subtitle: "Breaking the GPU Training Monopoly with Memory Tiering & Single-Command YAML",
    date: "Oct 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "7 min read",
    url: "https://github.com/MakazhanAlpamys/Soup",
    repoName: "MakazhanAlpamys/Soup",
    summary: "Soup is a groundbreaking open-source CLI tool (soup-cli) created by Makazhan Alpamys that shatters the hardware barriers of post-training. Traditional fine-tuning of an 8-billion parameter model demands 16GB to 24GB of dedicated VRAM even with LoRA. Soup introduces 'Layer Streaming', a technique that keeps inactive transformer decoder layers in standard system RAM and dynamically streams only the currently active forward/backward layers into GPU VRAM just-in-time, allowing an 8B model to be trained on an ordinary 4GB laptop GPU.",
    whyHighlighted: "Why it's highlighted: Democratizes model training. By consolidating data preparation, hyperparameter configuration, training execution, and evaluation into a single declarative YAML file executed by one command ('soup train'), Soup eliminates multi-GPU cluster dependencies and makes fine-tuning accessible to any developer on everyday consumer laptops.",
    takeaways: [
      "Layer Streaming Engine: Only 1-2 transformer layers reside in GPU VRAM simultaneously; inactive weights remain in host DDR4/DDR5 system RAM.",
      "4GB VRAM Capability: Fine-tunes Llama-3-8B and Qwen-2.5-7B models on entry-level laptop GPUs (RTX 3050/4050 mobile).",
      "Unified Post-Training Pipeline: End-to-end data formatting, LoRA adapter injection, checkpointing, and evaluation defined in one YAML config.",
      "Zero Cloud Dependency: Complete privacy and local offline training without renting expensive cloud compute instances."
    ],
    specs: {
      "Supported Models": "Llama-3 8B, Qwen-2.5 7B, Mistral 7B",
      "Min Hardware": "4 GB VRAM Laptop GPU + 16 GB System RAM",
      "Core Technique": "Layer Streaming (PCIe Ring Buffer)",
      "Configuration": "Single YAML declarative spec ('soup-cli')",
      "Stack": "Python, PyTorch, C++ Streaming CUDA Kernels"
    },
    diagram: `┌─────────────────────────────────────────────────────────────┐
│                 SOUP LAYER STREAMING RUNTIME                │
└─────────────────────────────────────────────────────────────┘
  [ System RAM (DDR5) - Host Memory ]
  ├── Layer 00  Layer 01  Layer 02  Layer 03  ... Layer 31
  └── All Inactive Weights & Optimizer States Stored Here
                         │
                         ▼  (High-Speed PCIe Async Stream)
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
      Write-back Gradients to RAM ──► Next Layer Stream`,
    highlights: ["Layer Streaming", "4GB VRAM Training", "soup-cli", "8B Fine-tuning", "LoRA"],
    featured: false
  },
  {
    id: 3,
    title: "Freebuff: Open-Source Multi-Agent Coding Framework Funded by Non-Intrusive Ads",
    subtitle: "Subscription-Free Agentic Engineering with Specialized Sub-Agent Choreography",
    date: "Oct 2026",
    category: "Developer Tools",
    categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    readTime: "5 min read",
    url: "https://github.com/CodebuffAI/freebuff",
    repoName: "CodebuffAI/freebuff",
    summary: "Freebuff is an open-source, ad-supported multi-agent software engineering framework developed by CodebuffAI. While commercial coding assistants like Cursor and GitHub Copilot require recurring monthly fees or personal API keys, Freebuff unlocks multi-agent coding for everyone by subsidizing model inference with lightweight, non-intrusive text ads. Built as a high-performance TypeScript monorepo running on Bun, it orchestrates specialized sub-agents for file selection, planning, syntax editing, and code review.",
    whyHighlighted: "Why it's highlighted: Eliminates economic friction in AI developer tooling while advancing multi-agent architecture. Instead of relying on a single monolithic LLM prompt, Freebuff demonstrates how a team of specialized micro-agents running on modern open models can outperform expensive proprietary coding assistants without requiring a credit card.",
    takeaways: [
      "Sub-Agent Choreography: Divides complex coding requests across specialized File Pickers, Architecture Planners, Code Editors, and Reviewers.",
      "Zero Paywall Access: Uses clean text ads in the terminal to subsidize frontier inference tokens (GLM-5.3 Flash, Sol-6.1).",
      "Bun & TypeScript Runtime: Ultra-fast local execution leveraging '@codebuff/sdk' with native LSP AST symbol parsing.",
      "Multi-Environment Support: Operates seamlessly in terminal CLI, local web sandboxes, and VS Code extension environments."
    ],
    specs: {
      "Architecture": "Coordinated Sub-Agent Swarm (Picker + Planner + Editor + Reviewer)",
      "Runtime": "TypeScript / Bun + '@codebuff/sdk'",
      "Cost Model": "Free & Open-Source (Funded via unobtrusive terminal text ads)",
      "Supported LLMs": "GLM 5.3 Flash, Sol 6.1, Ollama Local Models",
      "Integrations": "Terminal CLI, Web Sandbox, Git Checkpoint Reverts"
    },
    diagram: `┌─────────────────────────────────────────────────────────────┐
│             FREEBUFF MULTI-AGENT CHOREOGRAPHY               │
└─────────────────────────────────────────────────────────────┘
  Developer Prompt: "Add JWT Auth and Refresh Middleware"
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────┐
  │                Freebuff Orchestrator                    │
  └───────┬───────────────────┬───────────────────┬─────────┘
          │                   │                   │
          ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │File Picker│       │ Architecture│     │Research & │
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
                Tested & Verified Pull Request`,
    highlights: ["Multi-Agent", "Bun Runtime", "No Credit Card", "Ad-Funded", "AST Parsing"],
    featured: false
  },
  {
    id: 4,
    title: "Papermorph: Compiling Academic PDFs into Interactive Animated Web Courses",
    subtitle: "Rethinking Scientific Publishing via Code Generation Instead of Heavy Diffusion",
    date: "Oct 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "6 min read",
    url: "https://github.com/DozenTwelve/Papermorph",
    repoName: "DozenTwelve/Papermorph",
    summary: "Papermorph is an innovative open-source AI transformation engine by DozenTwelve that takes dense, static academic research PDFs (such as arXiv papers) and compiles them into interactive, narrated, and animated web learning experiences. Rather than generating bloated, uneditable video files using diffusion models, Papermorph leverages Claude Opus to extract core equations, generate storyboards, synthesize narration scripts, and emit pure HTML5/SVG/JavaScript animations and interactive knowledge check quizzes.",
    whyHighlighted: "Why it's highlighted: Scientific publishing has remained trapped in static, two-column black-and-white PDF formats for over three decades. Papermorph demonstrates that generative code synthesis is vastly superior to generative video for technical comprehension: interactive code is lightweight (kilobytes vs gigabytes), searchable, accessible, and provides live parameter exploration.",
    takeaways: [
      "Code Generation over Video Diffusion: Emits pure SVG/Canvas animations and audio narration instead of multi-gigabyte MP4s.",
      "Automated Pedagogy Pipeline: Extracts foundational concepts, generates storyboard frames, produces scripts, and drafts quizzes.",
      "Interactive Equation Decompilation: Converts LaTeX math into dynamic sliders and visual geometry visualizations.",
      "Self-Contained Static Output: Compiles into lightweight static web artifacts ready to host anywhere with zero backend requirements."
    ],
    specs: {
      "Input Format": "Academic PDFs, arXiv URLs, Whitepapers",
      "Output Format": "Interactive HTML5/CSS/SVG Web Apps + Narration + Quizzes",
      "Generation Engine": "Claude Opus structured prompt skills & code synthesis",
      "Rendering Tech": "SVG, HTML5 Canvas, Web Audio API, Tailwind CSS",
      "Bandwidth Efficiency": "100x smaller payload than generated video"
    },
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
  Deployable Interactive Course (Lightweight Static HTML5)`,
    highlights: ["PDF to Interactive", "Code-First Visuals", "Research Papers", "Interactive Quizzes"],
    featured: false
  },
  {
    id: 5,
    title: "Human-Atlas: Web-Based 3D Human Anatomy Explorer Powered by React & Three.js",
    subtitle: "2,234 Selectable BodyParts3D Meshes with Exploded Views in Pure WebGL",
    date: "Oct 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "5 min read",
    url: "https://github.com/ashemag/human-atlas",
    repoName: "ashemag/human-atlas",
    summary: "Human-Atlas is a phenomenal open-source 3D biological exploration application created by ashemag. Built completely on React, TypeScript, and Three.js, it renders an intricate 3D anatomical model of the human body composed of 2,234 individually selectable meshes derived from the BodyParts3D anatomical database. Users can explore 15 discrete physiological systems (skeletal, cardiovascular, nervous, muscular, etc.), toggle an exploded view to study anatomical relationships, and inspect individual organs at 60 FPS in any modern web browser.",
    whyHighlighted: "Why it's highlighted: Sets a high-water mark for spatial visualization on the web. It demonstrates how modern WebGL optimizations, glTF geometry compression, and declarative React-Three-Fiber scene graphs can deliver medical-grade interactive 3D visualizations without requiring multi-gigabyte desktop software or closed proprietary licenses.",
    takeaways: [
      "2,234 Anatomical Meshes: Full human anatomy modeled with high geometric fidelity sourced from BodyParts3D data.",
      "15 Organ Systems: Instant toggling and opacity blending across Skeletal, Muscular, Nervous, Circulatory, and Lymphatic systems.",
      "Exploded View Mode: Algorithmic displacement vectors push anatomical components outward along normal axes to reveal interior structures.",
      "Zero-Install Client-Side WebGL: Runs entirely in browser memory as a static web application without server-side rendering latency."
    ],
    specs: {
      "Mesh Count": "2,234 selectable anatomical components",
      "Anatomical Systems": "15 systems (Skeletal, Muscular, Vascular, Neural, etc.)",
      "Tech Stack": "React, TypeScript, Three.js, WebGL, Vite",
      "Key Features": "Exploded View, Raycasting Mesh Inspector, System Filters",
      "Deployment": "100% Client-side static website"
    },
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
    highlights: ["Three.js", "WebGL", "2,234 Meshes", "Exploded View", "Human Anatomy"],
    featured: false
  },
  {
    id: 6,
    title: "Qwen3.8-Flash-Next: 180B Sparse MoE Model with N-Gram Table & Multi-Token Prediction",
    subtitle: "Activating Only 6B Parameters per Token with 1M Native Context Window",
    date: "Sep 2026",
    category: "Frontier Models",
    categoryColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    readTime: "8 min read",
    url: "https://huggingface.co/Qwen",
    repoName: "Qwen / Alibaba Cloud",
    summary: "Qwen3.8-Flash-Next is Alibaba's cutting-edge 180-billion-parameter Mixture-of-Experts (MoE) experimental preview model. Despite housing 180B parameters on disk, it employs a radical three-part hybrid architecture: a 125B MoE transformer backbone, a 51B N-gram embedding lookup table, and a 4B Multi-Token Prediction (MTP) head. By routing tokens to only top-2 experts per layer, it activates a mere 6B parameters per token during forward passes—delivering frontier coding and reasoning intelligence at high inference speeds with a native 1-million token context window.",
    whyHighlighted: "Why it's highlighted: Architectural efficiency breakthrough. The 51B N-gram lookup table can be offloaded onto system DDR RAM or NVMe storage while only the active 6B compute path runs on GPU/NPU cores. Enthusiasts have successfully run this 180B-class model on 64GB Apple Silicon Macs, proving that ultra-sparse architectures can outpace dense models while cutting operational serving costs by 80%.",
    takeaways: [
      "Ultra-Sparse Activation: Houses 180B parameters overall but computes only ~6B active parameters per token.",
      "Multi-Token Prediction (MTP): 4B prediction head forecasts 2-4 sequential tokens concurrently, doubling decoding throughput.",
      "Static N-Gram Embedding Table: 51B parameters dedicated to fast n-gram lookups, offloadable to host RAM or high-speed NVMe.",
      "1,000,000 Token Context Window: Seamless retrieval across entire software codebases and technical documentation suites."
    ],
    specs: {
      "Total Parameters": "180 Billion (125B MoE + 51B N-gram table + 4B MTP head)",
      "Active Parameters": "~6 Billion per token",
      "Context Window": "1,000,000 tokens native",
      "Routing Strategy": "Top-2 Expert Routing + Multi-Token Prediction",
      "Local Hardware": "Runnable on 64GB Mac / PC with RAM offloading"
    },
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
    highlights: ["180B MoE", "6B Active", "1M Context", "Multi-Token Prediction", "N-Gram Table"],
    featured: false
  },
  {
    id: 7,
    title: "Tiiny AI Pocket Lab: World's Smallest 80GB Personal AI Supercomputer",
    subtitle: "Running 120B Models Offline on 300g Custom Hardware with TiinyOS",
    date: "Sep 2026",
    category: "Edge & Hardware",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "6 min read",
    url: "https://tiiny.ai",
    repoName: "tiiny.ai",
    summary: "The Tiiny AI Pocket Lab is a palm-sized personal AI supercomputer manufactured by Tiiny AI. Weighing just 300 grams, this portable hardware unit packs 80GB of high-speed unified LPDDR5X memory, a 12-core ARMv9.2 custom processor with integrated tensor accelerators, and a 1TB high-endurance NVMe SSD. Powered by the proprietary TiinyOS microkernel, it runs massive 70B to 120B parameter language models and autonomous agent workflows entirely locally without internet access, subscription fees, or data leaks.",
    whyHighlighted: "Why it's highlighted: The pinnacle of sovereign edge AI hardware. While cloud providers charge premium hourly rates and monitor API telemetry, Tiiny Pocket proves that desktop-grade 80GB unified memory bandwidth can fit in a pocket, offering journalists, security researchers, and developers complete data sovereignty and air-gapped agent operations anywhere in the world.",
    takeaways: [
      "80GB LPDDR5X Unified Memory: Massive unified memory pool fits large 70B-120B quantized models in memory with zero cloud offloading.",
      "12-Core ARMv9.2 Silicon: Custom thermal-throttling architecture balances power consumption between 15W and 45W.",
      "TiinyOS AI Microkernel: Stripped-down Linux OS optimized for zero-overhead direct memory model loading and instant wake.",
      "Guinness World Record Holder: Formally recognized as the world's smallest personal AI supercomputer (300g form factor).",
    ],
    specs: {
      "Unified Memory": "80 GB LPDDR5X (High-bandwidth unified memory)",
      "Processor": "12-Core ARMv9.2 with Custom Neural Accelerators",
      "Storage": "1 TB High-Speed NVMe Gen4 SSD",
      "Operating System": "TiinyOS (Zero-copy unified memory kernel)",
      "Form Factor": "Pocket-sized, ~300 grams, 15W-45W power draw"
    },
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
    highlights: ["80GB RAM", "120B Models Offline", "ARMv9.2", "300g Hardware", "Data Sovereignty"],
    featured: false
  },
  {
    id: 8,
    title: "Laya Model: Non-Autoregressive 'System 1' Fast Decision Layer for Agent Routing",
    subtitle: "ModernBERT-Based Single-Forward-Pass Decisions with Calibrated Probabilities",
    date: "Aug 2026",
    category: "Frontier Models",
    categoryColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    readTime: "5 min read",
    url: "https://huggingface.co/convaiinnovations/laya",
    repoName: "convaiinnovations/laya",
    summary: "Laya is an open-source non-autoregressive decision model developed by Convai Innovations. Unlike standard generative LLMs that waste compute by predicting text token-by-token, Laya is designed as a fast 'System 1' cognitive layer built on a ModernBERT-large backbone (~322M-421M parameters). In a single forward pass taking under 10 milliseconds, Laya consumes complex state (support tickets, JSON payloads, tool outputs) and returns structured categorical choices, numerical scores, or calibrated probabilities.",
    whyHighlighted: "Why it's highlighted: Solves the latency and cost crisis of agent routing. Orchestrating multi-agent systems often wastes 500ms and dollars calling frontier 70B generative models just to answer binary questions like 'Is this query safe?' or 'Which tool should handle this?'. Laya performs these exact decisions in under 10ms with mathematical probability calibration and zero generative hallucination.",
    takeaways: [
      "Non-Autoregressive Execution: Evaluates full prompts and questions in a single forward pass without sequential token loops.",
      "Calibrated Decision Types: Emits discrete Choices, continuous Scores (0-100), and calibrated probabilities (P(true)) directly.",
      "ModernBERT Backbone: 322M-421M parameter model runs at negligible CPU/GPU cost in local edge or server nodes.",
      "Frontline Guardrail: Ideal for prompt injection defense, urgency classification, and agentic intent routing before expensive LLMs."
    ],
    specs: {
      "Model Backbone": "ModernBERT-large (~322M to 421M parameters)",
      "Inference Latency": "< 10 ms (Single forward pass)",
      "Output Format": "Choice (Enum), Score (Float), Noul (Calibrated Probability)",
      "Compute Requirements": "Runs on standard CPU or entry-level GPU via ONNX",
      "License": "Apache 2.0 Open Source"
    },
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
    highlights: ["Non-Autoregressive", "System 1", "ModernBERT", "10ms Latency", "Zero Hallucination"],
    featured: false
  },
  {
    id: 9,
    title: "Headroom: Context Compression Proxy & MCP Server for Coding Agents",
    subtitle: "Slashing Agent Token Bloat by 60–95% with Rust Token Killer & OutputShaper",
    date: "Aug 2026",
    category: "Developer Tools",
    categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    readTime: "6 min read",
    url: "https://github.com/headroomlabs-ai/headroom",
    repoName: "headroomlabs-ai/headroom",
    summary: "Headroom is an essential open-source context compression proxy, SDK, and Model Context Protocol (MCP) server engineered by Headroomlabs AI. As coding agents like Claude Code, Cursor, and Aider run commands and query databases, their context windows become clogged with voluminous JSON outputs, build logs, and duplicate RAG chunks. Headroom acts as an intelligent intermediary, using its 'Rust Token Killer' (RTK) and semantic deduplication algorithms to shrink incoming payloads by 60% to 95% while preserving 100% of functional accuracy.",
    whyHighlighted: "Why it's highlighted: Direct solution to context degradation and spiraling API costs. Unchecked token accumulation triggers the 'Lost in the Middle' attention failure in LLMs. Headroom prevents context bloat, expands effective conversation depth by 5x, and cuts developer token costs by up to 80% with a drop-in proxy.",
    takeaways: [
      "60% to 95% Compression on Structured Data: Flattens verbose JSON, strips repetitive terminal ansi codes, and extracts key log lines.",
      "Rust Token Killer (RTK): Blazing high-speed native Rust engine parses and optimizes ASTs and prompt tokens in microseconds.",
      "Universal MCP Server Integration: Plugs into Claude Code, Cursor, Aider, and GitHub Copilot CLI as a standard MCP tool proxy.",
      "OutputShaper Response Pruning: Trims chatty LLM preambles ('Sure, I can help with that!') on the response side to eliminate wasted tokens."
    ],
    specs: {
      "Compression Ratio": "60-95% on JSON/Logs, ~20% on raw code",
      "Deployment Options": "MCP Server, HTTP Proxy, Python SDK, TypeScript SDK",
      "Engine": "Rust Token Killer (RTK) + OutputShaper",
      "Compatibility": "Claude Code, Cursor, Aider, LangChain, MCP Hosts",
      "Latency Overhead": "< 2 ms (Native Rust parsing)"
    },
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
    highlights: ["Token Compression", "MCP Server", "Rust Token Killer", "95% Reduction", "Claude Code"],
    featured: false
  },
  {
    id: 10,
    title: "Colibri: Pure C Multitiered Inference Engine Running 700B+ MoE Models Locally",
    subtitle: "Zero-Dependency Expert Streaming Across SSD, System RAM, and GPU VRAM",
    date: "Jul 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "7 min read",
    url: "https://github.com/JustVugg/colibri",
    repoName: "JustVugg/colibri",
    summary: "Colibri is a masterclass in systems engineering created by JustVugg. It is a pure C inference runtime with zero external dependencies designed to run trillion-parameter Mixture-of-Experts (MoE) models—including GLM-5.2 (744B), Inkling (975B), and Kimi K3 (2.8T)—on consumer hardware. Instead of requiring a $200,000 cluster with terabytes of VRAM, Colibri implements 'Memory Multitiering', treating high-speed NVMe SSDs, system DDR RAM, and GPU memory as a unified virtual storage hierarchy, streaming required expert weights on-demand.",
    whyHighlighted: "Why it's highlighted: Redefines what is computationally possible on consumer machines. By eliminating Python, PyTorch, and heavy CUDA wrappers in favor of hand-optimized pure C and direct OS memory-mapped files (mmap), Colibri allows curious researchers to run and study frontier trillion-parameter models right on their personal workstations.",
    takeaways: [
      "Pure C with Zero Dependencies: No Python, no heavy PyTorch wheels; compiles with standard 'gcc' or 'clang' in seconds.",
      "Memory Multitiering: Unifies NVMe SSD (Cold Weights), RAM (Hot Expert Cache), and GPU VRAM (Active Compute Buffer).",
      "Dynamic Expert Streaming: Only reads the specific sparse MoE experts needed for the current token from disk/RAM on the fly.",
      "OpenAI Compatible Gateway: Built-in minimal HTTP daemon exposes '/v1/chat/completions' for direct compatibility with open-webui and dev tools."
    ],
    specs: {
      "Supported Models": "GLM-5.2 (744B), Inkling (975B), Kimi K3 (2.8T), Qwen3.8-Flash",
      "Implementation": "100% Pure C (Zero third-party library dependencies)",
      "Architecture": "Memory Multitiering with Dynamic MoE Expert Streaming",
      "Memory Strategy": "mmap Direct I/O with Predictive Read-Ahead Ring Buffers",
      "API Server": "Built-in lightweight OpenAI-compatible HTTP daemon"
    },
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [expandedEdition, setExpandedEdition] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync hash with modal for deep-linked sharing (#issue-1, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#issue-')) {
        const issueId = parseInt(hash.replace('#issue-', ''), 10);
        const found = EDITIONS.find((ed) => ed.id === issueId);
        if (found) {
          setExpandedEdition(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const categories = ["All", "Edge & Hardware", "Developer Tools", "Architecture & RAG", "MLOps & Systems", "Frontier Models"];

  const filteredEditions = EDITIONS.filter((ed) => {
    const matchesCategory = selectedCategory === "All" || ed.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      ed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (typeof window !== 'undefined') {
      const base = `${window.location.origin}${window.location.pathname}`;
      return issueId ? `${base}#issue-${issueId}` : base;
    }
    return issueId 
      ? `https://ai-visualised-engineering.web.app/newsletter#issue-${issueId}`
      : `https://ai-visualised-engineering.web.app/newsletter`;
  };

  const triggerShare = (target = null) => {
    if (target) {
      setShareModalData({
        title: target.title,
        subtitle: target.subtitle,
        url: getShareUrl(target.id),
        repoName: target.repoName,
        text: `Explore ${target.title} (${target.repoName}) in AI Visualised Engineering Digest!`
      });
    } else {
      setShareModalData({
        title: "AI Visualised Engineering Digest & Tech Radar 2026",
        subtitle: "Visual breakdowns of edge models, training runtimes, and frontier AI tools",
        url: getShareUrl(null),
        repoName: "ai-visualised-engineering",
        text: "Explore AI Visualised Engineering Digest: In-depth visual breakdowns of frontier models, edge runtimes, and developer tooling!"
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

  const handleOpenEdition = (ed) => {
    setExpandedEdition(ed);
    if (typeof window !== 'undefined') {
      window.location.hash = `#issue-${ed.id}`;
    }
  };

  const handleCloseEdition = () => {
    setExpandedEdition(null);
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#issue-')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const toc = [
    { label: "Featured Issue", hash: "featured" },
    { label: "Highlighted Technologies", hash: "editions" },
    { label: "AI Tech Radar 2026", hash: "tech-radar" },
    { label: "Subscribe", hash: "subscribe" }
  ];

  return (
    <GuideLayout
      title="📰 AI Engineering Digest & Tech Radar"
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
          <span>Share Digest to Social Media</span>
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
                  onClick={() => handleOpenEdition(featuredIssue)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                >
                  Full Architecture & Specs <span>→</span>
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

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors leading-snug">
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
                    onClick={() => handleOpenEdition(ed)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    Architecture & Deep Dive <span>→</span>
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
            Subscribe to AI Visualised Engineering Digest
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
              <span>🎉 You're subscribed! Welcome to AI Visualised Engineering.</span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 font-mono">
            Zero spam. Unsubscribe anytime with 1-click.
          </p>
        </div>
      </section>

      {/* ====== EXPAND MODAL FOR EDITION DETAILS ====== */}
      <AnimatePresence>
        {expandedEdition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-white/20 rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={handleCloseEdition}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${expandedEdition.categoryColor}`}>
                  {expandedEdition.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">Issue #{expandedEdition.id} · {expandedEdition.date} · {expandedEdition.readTime}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-1">
                {expandedEdition.title}
              </h2>
              <p className="text-indigo-400 font-mono text-sm mb-4">
                {expandedEdition.subtitle}
              </p>

              {/* Direct Link Banner */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                  <span className="text-emerald-400">●</span>
                  <span>Official Project / Repo:</span>
                  <span className="text-white font-bold">{expandedEdition.repoName}</span>
                </div>
                <a
                  href={expandedEdition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                >
                  <span>Open Official URL</span>
                  <span>↗</span>
                </a>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {expandedEdition.summary}
              </p>

              {/* Why Highlighted Section */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>💡</span> Why This Is Highlighted in 2026:
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {expandedEdition.whyHighlighted.replace("Why it's highlighted: ", "")}
                </p>
              </div>

              {/* Visual Architecture Diagram */}
              {expandedEdition.diagram && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>📐</span> Architectural Flow & Data Pipeline:
                  </h4>
                  <div className="bg-black/70 border border-white/10 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre leading-relaxed">{expandedEdition.diagram}</pre>
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              {expandedEdition.specs && (
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">🛠️ Technical Specifications:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(expandedEdition.specs).map(([key, val]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-2 flex flex-col">
                        <span className="text-gray-400 font-mono text-[10px]">{key}</span>
                        <span className="text-white font-semibold mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Key Architectural Takeaways:</h4>
                {expandedEdition.takeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                    <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Social Media Share Strip Inside Modal */}
              <div className="bg-gradient-to-r from-purple-950/30 via-black to-indigo-950/30 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShareIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Share This Breakdown to Social Media:</span>
                  </div>
                  {copiedLink && (
                    <span className="text-xs font-bold text-emerald-400 font-mono animate-pulse">
                      ✓ Link copied to clipboard!
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleShareSocial('twitter', {
                      title: expandedEdition.title,
                      subtitle: expandedEdition.subtitle,
                      url: getShareUrl(expandedEdition.id),
                      text: `Check out ${expandedEdition.title} (${expandedEdition.repoName}) in AI Visualised Engineering!`
                    })}
                    className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                    <span>X (Twitter)</span>
                  </button>

                  <button
                    onClick={() => handleShareSocial('linkedin', {
                      title: expandedEdition.title,
                      subtitle: expandedEdition.subtitle,
                      url: getShareUrl(expandedEdition.id),
                      text: `${expandedEdition.title} - ${expandedEdition.subtitle}`
                    })}
                    className="px-3 py-1.5 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 text-[#70b5f9] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    onClick={() => handleShareSocial('whatsapp', {
                      title: expandedEdition.title,
                      subtitle: expandedEdition.subtitle,
                      url: getShareUrl(expandedEdition.id),
                      text: `Look at ${expandedEdition.title} (${expandedEdition.repoName}):`
                    })}
                    className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#75f1a5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleShareSocial('reddit', {
                      title: expandedEdition.title,
                      subtitle: expandedEdition.subtitle,
                      url: getShareUrl(expandedEdition.id),
                      text: `${expandedEdition.title} - Architectural Breakdown`
                    })}
                    className="px-3 py-1.5 rounded-lg bg-[#FF4500]/20 hover:bg-[#FF4500]/30 border border-[#FF4500]/50 text-[#ffa285] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RedditIcon className="w-3.5 h-3.5" />
                    <span>Reddit</span>
                  </button>

                  <button
                    onClick={() => handleShareSocial('telegram', {
                      title: expandedEdition.title,
                      subtitle: expandedEdition.subtitle,
                      url: getShareUrl(expandedEdition.id),
                      text: `Architecture Deep Dive: ${expandedEdition.title}`
                    })}
                    className="px-3 py-1.5 rounded-lg bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#78c9f5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <TelegramIcon className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={() => handleCopy(getShareUrl(expandedEdition.id))}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "Copied! ✓" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {expandedEdition.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400 font-mono border border-white/5">
                      #{h}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={expandedEdition.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Visit {expandedEdition.repoName}</span>
                    <span>↗</span>
                  </a>
                  <button
                    onClick={handleCloseEdition}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                  >
                    Close Edition
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

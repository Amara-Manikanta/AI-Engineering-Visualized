# AI Visualised Engineering 🤖

<p align="center">
  <img src="v2-react/public/model-comparison.png" alt="AI Visualised Engineering Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <strong>The open-source visual interactive atlas for modern AI Engineering.</strong><br>
  Explore machine learning, generative models, RAG pipelines, autonomous agent swarms, cloud infrastructure, and production MLOps through live interactive labs, animated architecture blueprints, and deep-dive technical reviews.
</p>

<p align="center">
  <a href="https://amara-manikanta.github.io/ai-engineering-visualized/#/"><img src="https://img.shields.io/badge/Live%20Platform-GitHub%20Pages-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/Amara-Manikanta/ai-engineering-visualized/releases"><img src="https://img.shields.io/badge/macOS%20Desktop%20App-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS App" /></a>
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 What Makes AI Visualised Engineering Unique?

Most AI tutorials provide static text or high-level code snippets without showing how mathematical models behave internally. **AI Visualised Engineering** is built around **interactive pedagogy**:

- 🎛️ **Live Parameter Laboratories**: Adjust sliders to see cost surfaces warp, attention weights shift, decision trees branch, and token probabilities recalculate live in your browser.
- 📐 **Visual Architecture Blueprints**: Monospaced ASCII dataflows, 3D WebGL scene graphs, and system sequence charts revealing internal token routing and memory tiering.
- 📡 **Tech Radar & 2026 Engineering Digest**: Opinionated tracking of emerging models and runtimes classified into **Adopt**, **Trial**, **Assess**, and **Hold**.
- 🧠 **54 Interactive Knowledge Checks**: Real-world interview questions, scenario drills, and mock AI Architect certification exams.
- ⚡ **Zero-Latency ⌘K Global Search**: Client-side fuzzy search indexing over 172 pages, 1,180 sections, and 1,420 keywords in under 5 milliseconds.
- 🖥️ **Desktop Native Application**: Fully packaged macOS desktop application with native window chrome, dark-mode optimization, and offline capability.

---

## 📰 Tech Radar & Highlighted Breakthroughs

Our dedicated **Newsletter & Tech Radar** features deep architectural breakdowns with official repository links and visual dataflow blueprints:

| Technology | Category | Focus & Key Innovation |
|---|---|---|
| [**Needle**](https://github.com/cactus-compute/needle) | Edge & Hardware | **Kill the FFN (26M Autonomous Edge Model)**: Eliminates Feed-Forward Networks entirely for 6,000 tok/s prefill & 1,200 tok/s decode on edge microcontrollers. |
| [**Soup (`soup-cli`)**](https://github.com/MakazhanAlpamys/Soup) | MLOps & Systems | **Cracking the GPU Monopoly (4GB Layer Streaming)**: Streams inactive decoder layers between host RAM and GPU VRAM, enabling 8B LLM fine-tuning on consumer laptops. |
| [**Freebuff**](https://github.com/CodebuffAI/freebuff) | Developer Tools | **The Death of $20/mo Coding Seats (Multi-Agent Swarm)**: Decomposes coding workflows into specialized AST pickers, planners, diff editors, and reviewers funded via unobtrusive text ads. |
| [**Papermorph**](https://github.com/DozenTwelve/Papermorph) | Architecture & RAG | **Never Read a Static arXiv PDF Again (PDF to Living Code)**: Compiles dense academic research PDFs into narrated, animated HTML5/SVG web experiences rather than heavy video diffusion. |
| [**Human-Atlas**](https://github.com/ashemag/human-atlas) | Spatial & 3D Web | **2,234 Meshes at 60 FPS (Pure WebGL Anatomy)**: High-fidelity 3D anatomical viewer with raycasted organ selection, 15 physiological systems, and exploded views in Three.js. |
| [**Qwen3.8-Flash-Next**](https://huggingface.co/Qwen) | Frontier Models | **180B Weights, Only 6B Active (Sparse MoE Titan)**: 3-tier architecture with a 125B MoE backbone, 51B offloadable N-gram table, and 4B Multi-Token Prediction head with 1M context. |
| [**Tiiny Pocket AI**](https://tiiny.ai) | Edge & Hardware | **An 80GB Supercomputer in Your Pocket (Sovereign Edge Rig)**: 300g pocket hardware with 80GB LPDDR5X unified memory running 100B–120B parameter models completely offline. |
| [**Laya Model**](https://huggingface.co/convaiinnovations/laya) | Frontier Models | **Stop Using 70B LLMs as If-Else Routers (Sub-10ms System 1)**: 322M ModernBERT model executing in <10ms to emit calibrated probabilities and choices with zero hallucination. |
| [**Headroom**](https://github.com/headroomlabs-ai/headroom) | Developer Tools | **The Rust Token Killer (95% Context Compression)**: Strips 60–95% of token bloat from tool logs and JSON outputs using Rust Token Killer (RTK) and OutputShaper. |
| [**Colibri**](https://github.com/JustVugg/colibri) | MLOps & Systems | **Pure C, Zero Dependencies (Trillion-Parameter MoE Streaming)**: Zero-dependency C runtime streaming 700B+ MoE weights across SSD mmap, system RAM, and GPU VRAM. |

---

## 🗺️ Complete Curriculum & Knowledge Map

### 🐍 1. Python for AI & High-Performance Engineering
- **Python Foundations**: Memory model, variable binding, execution model, garbage collection.
- **Data Structures**: Hash maps, deque, set operations, algorithmic complexity.
- **OOP & Advanced Features**: Dunder methods, metaclasses, decorators, generators, context managers.
- **Async & System Tooling**: `asyncio` event loop, coroutines, thread/process pools, GIL internals.
- **Data Science Stack**: Vectorized NumPy operations, Pandas indexing, scikit-learn pipelines.
- **Regular Expressions**: Deterministic finite automata (DFA), lookaheads, tokenization patterns.

### 🤖 2. Machine Learning & Mathematics
- **Data Foundations & Statistics**: Sourcing, data cleaning, exploratory data analysis (EDA), bivariate analysis, Central Limit Theorem, hypothesis testing.
- **Foundations**: Supervised vs Unsupervised, feature engineering, evaluation metrics (ROC-AUC, F1, Log Loss), Bias–Variance tradeoff, L1/L2 regularization, optimization (SGD to AdamW).
- **Classical Models**: Linear & Multiple Regression, Logistic Regression, Naive Bayes, K-Nearest Neighbors (KNN), Decision Trees (Gini/Entropy), Support Vector Machines (SVM).
- **Ensembles**: Random Forests (Bagging), XGBoost (Gradient Boosting), LightGBM.
- **Deep Learning**: Perceptrons, Multi-Layer Perceptrons (MLP), Backpropagation, CNNs (Computer Vision), RNNs & LSTMs, Transformers (Self-Attention, Multi-Head Attention), State Space Models (SSM/Mamba), RWKV, GANs, Transfer Learning, Graph Neural Networks (GNN).
- **Reinforcement Learning & Alignment**: Markov Decision Processes (MDP), PPO, RLHF, Direct Preference Optimization (DPO), Group Relative Policy Optimization (GRPO), Constitutional AI (RLAIF).

### ✨ 3. Generative AI & Frontier Models
- **How LLMs Work**: Byte-Pair Encoding (BPE), SentencePiece, KV-Cache mechanics, decoding strategies (Top-p, Top-k, Temperature, Speculative Decoding), System 2 reasoning models.
- **Model Architectures**: Dense LLMs, Vision-Language Models (VLMs), Small Language Models (SLMs), Mixture-of-Experts (MoE), Large Concept Models (LCM), Large Action Models (LAM).
- **Model Adaptation & PEFT**: Parameter-Efficient Fine-Tuning, LoRA, QLoRA (4-bit NormalFloat), DoRA, Prefix Tuning, (IA)³, Adapter Layers, Model Merging (SLERP, TIES, DARE).
- **Efficiency & Serving**: Quantization (GPTQ, AWQ, GGUF, FP8/FP4), vLLM Serving (PagedAttention, Chunked Prefill), Tensor Parallelism, Pipeline Parallelism.
- **Safety & Governance**: Red teaming, prompt injection attacks, jailbreak defenses, guardrail pipelines, responsible AI governance.

### 🔍 4. Retrieval-Augmented Generation (RAG)
- **Ingestion & Indexing**: Document Loaders (PDF, HTML, Markdown, Audio), Chunking Strategies (Semantic, Recursive, Markdown-aware), Embedding Models, Vector Databases (Pinecone, Qdrant, Chroma, Milvus).
- **Query-Time Optimization**: Dense vs Sparse Retrieval, Hybrid Search, Cohere/BGE Reranking, Matryoshka Embeddings, Contextual Compression, Text-to-SQL.
- **8 RAG Architecture Variants**:
  1. *Naive RAG* (Basic retrieve-and-read)
  2. *Advanced RAG* (Pre-retrieval routing + post-retrieval reranking)
  3. *Hybrid RAG* (Dense vector + BM25 keyword fusion)
  4. *GraphRAG* (Entity-relationship extraction + community summarization)
  5. *Agentic RAG* (Dynamic query decomposition and iterative tool looping)
  6. *Corrective RAG (CRAG)* (Confidence evaluation with web search fallback)
  7. *Self-RAG* (Reflective tokens for retrieval and critique verification)
  8. *Multimodal RAG* (Interleaved vision, table, and text vector spaces)

### 🕸️ 5. Autonomous Agents & Protocols
- **Building Blocks**: Function calling, tool dispatch schemas, context engineering, computer use, browser automation, memory structures (short-term buffer vs vector long-term).
- **Protocols & Standards**: Model Context Protocol (MCP 1.0), Agent-to-Agent (A2A) communication protocol.
- **Multi-Agent Orchestration**: LangChain, LangGraph (cyclic state machines), AutoGen, CrewAI, multi-agent debate and consensus.

### ☁️ 6. Cloud & Production MLOps
- **Cloud AI Platforms**: AWS (Bedrock, SageMaker), Azure (Azure OpenAI, AI Foundry), Google Cloud (Vertex AI).
- **Cloud Infrastructure**: VMs, IAM, Networking, Load Balancers, Object Storage, Containerization (AKS/ECS).
- **Production Systems**: Latency optimization, cost modeling, LLM-as-a-Judge evals, CI/CD for prompts, drift detection.

---

## 📁 Repository Structure

```text
ai-engineering-visualized/
├── .github/
│   └── workflows/
│       ├── ci.yml            # Linting (oxlint) + content checks + build validation
│       └── deploy.yml        # Zero-downtime automated deployment to GitHub Pages
├── notebooks/                # Accompanying Jupyter notebooks (LangChain LCEL, loaders)
├── legacy/                   # Archived static HTML prototypes (reference only)
└── v2-react/                 # Modern React 19 single-page application & Electron source
    ├── electron/
    │   ├── main.cjs          # Electron desktop main process (window management & menu)
    │   └── preload.js        # Context isolation bridge
    ├── public/
    │   ├── 404.html          # SPA route redirector for GitHub Pages
    │   └── favicon.svg       # Brand icon
    ├── scripts/
    │   ├── build-search-index.mjs  # Pre-computes searchIndex.json (172+ pages)
    │   └── check-content.mjs       # Static analyzer for routes, links & quiz integrity
    ├── src/
    │   ├── components/       # GuideLayout, GlobalHeader, Footer, VizKit UI lab widgets
    │   ├── config/           # Navigation trees, topic maps, and learning paths
    │   ├── data/             # Quiz banks (54 sets), glossary (198 terms), search index
    │   ├── pages/            # 175 interactive educational guides and labs
    │   └── App.jsx           # Lazy-loaded HashRouter route definitions
    └── package.json          # Dependencies and automation scripts
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm**: v10+

### 1. Clone the Repository
```bash
git clone https://github.com/Amara-Manikanta/ai-engineering-visualized.git
cd ai-engineering-visualized/v2-react
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Build, Lint & Verification Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Builds search index and compiles the production bundle into `dist/`. |
| `npm run lint` | Runs `oxlint` with `--deny-warnings` for ultra-fast zero-warning enforcement. |
| `npm run check` | Static analyzer verifying all 175 routes, internal links, TOC anchors, and quizzes. |
| `npm run search:index` | Re-indexes all 172 guides and sections into `src/data/searchIndex.json`. |
| `npm run electron:dev` | Runs Vite dev server concurrently with Electron desktop shell. |
| `npm run electron:build` | Packages the desktop application for macOS (DMG & Zip). |

---

## 🖥️ macOS Desktop Application

The application is fully configured as a standalone desktop app using Electron:

- **Download Pre-Built App**: Check the [Releases](https://github.com/Amara-Manikanta/ai-engineering-visualized/releases) page for `.dmg` and `.zip` installers.
- **Build Locally**:
  ```bash
  cd v2-react
  npm run electron:build:mac
  ```
  The packaged bundle will be generated in `v2-react/release/mac-arm64/AI Visualised Engineering.app`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/amazing-visualizer`).
3. Ensure all tests and linters pass:
   ```bash
   npm run lint && npm run check && npm run build
   ```
4. Commit your changes (`git commit -m 'feat: add interactive transformer KV-cache lab'`).
5. Push to the branch (`git push origin feature/amazing-visualizer`).
6. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <strong>Built with care by <a href="https://github.com/Amara-Manikanta">Amara Manikanta Dileep</a></strong><br>
  <em>AI Visualised Engineering — Empowering the next generation of AI systems builders.</em>
</p>

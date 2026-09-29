# AI Engineering Visualized 🤖

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=for-the-badge&logo=github)](https://Amara-Manikanta.github.io/ai-engineering-visualized)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

An interactive, visual study site for AI engineering: machine learning, generative AI, RAG, agents, models, cloud and the Python that ties them together. Most guides have a live lab: you move a slider and the maths recomputes in the browser.

## Repository layout

| Path | What it is |
| --- | --- |
| [`v2-react/`](v2-react/) | The live site: a React 19 + Vite single-page app. See its [README](v2-react/README.md) for development. |
| [`notebooks/`](notebooks/) | Jupyter notebooks that accompany the guides (LangChain LCEL, document loaders). |
| [`legacy/`](legacy/) | The original static HTML version, kept for reference. It is not deployed. |

## What's covered

- **Python**: foundations, data structures, OOP, async and tooling, NumPy/Pandas/scikit-learn, regex, and patterns for AI code.
- **Machine learning**
  - *Foundations*: data sourcing, cleaning, EDA and statistics; evaluation metrics, regularisation, optimisation and feature engineering.
  - *Classical models*: regression, Naive Bayes, KNN, decision trees, SVMs, random forests and XGBoost.
  - *Unsupervised and applied*: clustering, dimensionality reduction, anomaly detection, time series and recommenders.
  - *Deep learning*: neural networks, CNNs, RNNs, GANs, transformers, transfer learning and graph neural networks.
  - *Reinforcement learning and alignment*: reinforcement learning, RLHF, DPO and GRPO.
- **Generative AI**
  - *How LLMs work*: tokenization, decoding and reasoning models.
  - *Adapting models*: PEFT/LoRA, distillation and model merging.
  - *Efficiency*: quantization, distributed training and serving.
  - Also multimodal generation, and safety topics including red teaming and governance.
- **RAG**
  - *Build the index*: data ingestion with LangChain loaders, chunking, embeddings, indexing and vector databases.
  - *Query time*: advanced retrieval, late interaction, compression and text-to-SQL.
  - *Ship it*: evaluation and production.
  - Eight RAG architecture variants.
- **Agents**: agent architecture, tool calling, MCP, multi-agent systems, LangChain/LangGraph, framework comparison, agent SDKs and debugging.
- **Models**: closed and open-weight model families, model types, selection and training.
- **Cloud and build**: Azure and AWS fundamentals, cloud AI platforms (Bedrock, AI Foundry, Vertex AI), LLM apps in production, MLOps and projects.
- **Learn**
  - Learning paths with saved progress, and a topic map of how the guides connect.
  - Knowledge checks, including mock Claude architect certification questions and interview questions.
  - A glossary of 180+ terms, and ⌘K search across every page and section.

## Quick start

```bash
cd v2-react
npm ci
npm run dev        # http://localhost:5173
```

## Deployment

Pushes to `main` build `v2-react/` and deploy it to GitHub Pages (`.github/workflows/deploy.yml`). Pull requests and pushes to other branches run CI (`.github/workflows/ci.yml`). The deploy workflow runs the same four checks before it publishes:

- lint;
- the content check (routes, links, table-of-contents anchors, quiz data);
- a check that the search index is up to date;
- a production build.

---

Built by Amara Manikanta Dileep. © 2026 AI Engineering Visualized

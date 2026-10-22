/**
 * Model family profiles: current lineup, weights, and training pipeline.
 *
 * One record per family, rendered by <ModelProfile> on each family page and
 * compared side by side on /models/training.
 *
 * Accuracy rules for this file:
 *  - Lineups were checked against the vendor's announcements on AS_OF.
 *  - Training detail comes from published technical reports. Where a vendor
 *    has not disclosed something, it is listed under `undisclosed` rather than
 *    guessed. Frontier closed models disclose very little; say so.
 *  - Every family carries its sources so a reader can check.
 */

export const AS_OF = "25 September 2026";

/** Training methods, keyed so families can be compared. */
export const METHODS = {
  pretrain: {
    name: "Pretraining",
    short: "Predict the next token over trillions of tokens of text (and often images, audio, video).",
    detail:
      "Builds general capability: grammar, facts, reasoning patterns, code. By far the most compute-intensive stage. The model that comes out can continue text but does not follow instructions or hold a conversation.",
  },
  sft: {
    name: "Supervised fine-tuning (SFT)",
    short: "Train on curated prompt-and-ideal-response pairs.",
    detail:
      "Teaches the format of being an assistant — answering the question asked, following instructions, using a chat template. Cheap relative to pretraining, and the step that turns a text-continuer into something you can talk to.",
  },
  "rlhf-ppo": {
    name: "RLHF with PPO",
    short: "Humans rank answers, a reward model learns those rankings, the model is optimised against it.",
    detail:
      "The recipe OpenAI's InstructGPT made standard in 2022. Needs three models in memory during training — the policy, a reward model, and a value model — which is what later methods set out to remove. A KL penalty keeps the model from drifting too far from its SFT starting point while chasing reward.",
  },
  dpo: {
    name: "Direct Preference Optimization (DPO)",
    short: "Learn straight from 'answer A beats answer B' pairs, with no separate reward model.",
    detail:
      "Rewrites the RLHF objective so the preference data trains the model directly. Simpler and more stable than PPO, which is why open-model teams adopted it widely. Often run offline on a fixed set of pairs.",
  },
  grpo: {
    name: "GRPO",
    short: "Sample a group of answers, score them, and reward each relative to the group average.",
    detail:
      "Group Relative Policy Optimization, introduced by DeepSeek. Drops the value model entirely: the baseline is just the mean score of the group sampled for the same prompt. Cheaper than PPO and well suited to tasks with checkable answers like maths and code.",
  },
  rlaif: {
    name: "Constitutional AI / RLAIF",
    short: "The model critiques and revises its own answers against written principles; AI feedback supplements human labels.",
    detail:
      "Anthropic's method, published in 2022. A written constitution states the principles; the model is trained to critique and rewrite its outputs against them, and AI-generated preference labels train the reward model alongside human ones. Makes the values explicit and auditable rather than implicit in thousands of rater judgements.",
  },
  "reasoning-rl": {
    name: "Reasoning RL",
    short: "Reinforcement learning that rewards correct final answers after a long chain of thought.",
    detail:
      "The step behind 'thinking' models. The model learns to spend tokens reasoning before it answers, rewarded on whether the answer is right. This is where effort levels and thinking budgets come from.",
  },
  "rejection-sampling": {
    name: "Rejection sampling",
    short: "Generate many answers, keep only the best, and fine-tune on those.",
    detail:
      "A cheap way to bootstrap better training data from the model itself: sample several responses per prompt, filter with a reward model or a checker, and train on the survivors. Often alternated with DPO over several rounds.",
  },
  distill: {
    name: "Distillation",
    short: "Train a smaller model to imitate a larger one's outputs or probabilities.",
    detail:
      "How most small models in a family are made now. The student learns from the teacher's full output distribution or its generated text, which carries more signal than raw labels. See the Distillation guide.",
  },
  synthetic: {
    name: "Synthetic data",
    short: "Pretraining or fine-tuning data written by other models rather than collected.",
    detail:
      "Used everywhere to some degree; central to Phi. Lets a team construct the exact curriculum it wants, at the risk of inheriting the generator's blind spots.",
  },
};

export const PROFILES = {
  claude: {
    maker: "Anthropic",
    lineup: [
      { name: "Claude Opus 5.5", tag: "newest", released: "22 Sep 2026", role: "Newest. First of the 5.5 family; Anthropic reports it outperforms Fable 5.1 on many benchmarks.", spec: "$4 / $20 per M tokens" },
      { name: "Claude Fable 5.1", tag: "largest", released: "1 Sep 2026", role: "Largest generally available model — coding, knowledge work, long-running tasks.", spec: "$10 / $50 per M tokens · effort Low → Max" },
      { name: "Claude Mythos 5.1", released: "1 Sep 2026", role: "The same model as Fable 5.1 with different safeguards, for vetted cybersecurity and life-sciences work only.", spec: "Trusted access programmes" },
      { name: "Claude Opus 5 · Sonnet 5 · Haiku 4.5", released: "earlier 2026", role: "Previous generation, still available. Sonnet 5.5 and Haiku 5.5 have been announced as coming.", spec: "" },
    ],
    weights: {
      status: "closed",
      licence: "Proprietary — API and apps only",
      detail: "No Claude model has released weights. Architecture and parameter counts are not published.",
    },
    stages: [
      { m: "pretrain", note: "Public web text, licensed data, data from users who opted in, and synthetic data. Scale not disclosed." },
      { m: "sft", note: "Instruction-following and assistant behaviour." },
      { m: "rlhf-ppo", note: "Human preference feedback trains a reward model." },
      { m: "rlaif", note: "Constitutional AI: critique-and-revise against written principles, with AI preference labels." },
      { m: "reasoning-rl", note: "Extended thinking and the effort levels exposed in Fable 5.1." },
    ],
    signature: "rlaif",
    undisclosed: ["Parameter count", "Architecture", "Training token count", "Exact data mix"],
    sources: [
      { label: "Anthropic — Claude Opus 5.5", url: "https://www.anthropic.com/claude-opus-5-5" },
      { label: "Anthropic — Fable 5.1 and Mythos 5.1", url: "https://www.anthropic.com/claude-fable-and-mythos-5-1" },
      { label: "Constitutional AI paper (2022)", url: "https://arxiv.org/abs/2212.08073" },
    ],
  },

  gpt: {
    maker: "OpenAI",
    lineup: [
      { name: "GPT-6 Astra", tag: "flagship", released: "3 Sep 2026", role: "Flagship. State of the art on computer use, browsing, software engineering and science, per OpenAI.", spec: "" },
      { name: "GPT-6 Sol", tag: "newest", released: "22 Sep 2026", role: "Everyday work; more reasoning than Luna, much cheaper than Astra.", spec: "$2 / $10 per M tokens" },
      { name: "GPT-6 Luna", tag: "newest", released: "22 Sep 2026", role: "Fast, high-volume work — summarising, extraction, quick questions.", spec: "$0.10 / $0.50 per M tokens" },
      { name: "gpt-oss-120b · gpt-oss-20b", released: "Aug 2025", role: "OpenAI's open-weight models — mixture-of-experts, runnable locally.", spec: "Apache 2.0" },
    ],
    weights: {
      status: "mixed",
      licence: "GPT line proprietary · gpt-oss under Apache 2.0",
      detail: "The GPT-6 models are API-only. The separate gpt-oss family is fully open-weight. Parameter counts for GPT-4 onward are not published; GPT-3 was 175B.",
    },
    stages: [
      { m: "pretrain", note: "Scale and data mix not disclosed since GPT-3." },
      { m: "sft", note: "Demonstrations of good assistant responses." },
      { m: "rlhf-ppo", note: "InstructGPT (2022) defined this recipe: SFT → reward model → PPO." },
      { m: "reasoning-rl", note: "Since the o-series: large-scale RL on long chains of thought." },
    ],
    signature: "rlhf-ppo",
    extra: "OpenAI says Sol and Luna were developed using methods similar to Astra's. Beyond that, the GPT-6 training process is not described publicly.",
    undisclosed: ["Parameter counts (GPT-4 onward)", "Architecture of the GPT-6 models", "Training data and token counts", "Whether Sol and Luna are distilled from Astra"],
    sources: [
      { label: "OpenAI — GPT-6 Astra", url: "https://openai.com/index/gpt-6-astra/" },
      { label: "OpenAI — GPT-6 Sol and Luna", url: "https://openai.com/index/introducing-gpt-6-sol-and-luna/" },
      { label: "TechCrunch — Sol and Luna launch", url: "https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/" },
      { label: "InstructGPT paper (2022)", url: "https://arxiv.org/abs/2203.02155" },
    ],
  },

  gemini: {
    maker: "Google DeepMind",
    lineup: [
      { name: "Gemini 3.8 Flash", tag: "newest", released: "2 Sep 2026", role: "Newest. Tuned for long-horizon coding and agents; deliberately spends more thinking tokens than 3.7 Flash.", spec: "$0.75 / $3.75 per M tokens until 31 Dec 2026, then $1.50 / $7.50 · 1M context" },
      { name: "Gemini 3.8 Flash Cyber", released: "2 Sep 2026", role: "Security-specialised sibling for vulnerability detection and patching. Restricted to vetted defenders.", spec: "Restricted access" },
      { name: "Gemini 3.1 Pro (preview)", tag: "current Pro", released: "19 Feb 2026", role: "Current Pro-tier model; deep reasoning and very long context.", spec: "1M context" },
      { name: "Gemini 3.7 Flash", released: "Aug 2026", role: "Previous Flash; Google recommends staying on it for efficiency-first workloads.", spec: "" },
    ],
    weights: {
      status: "closed",
      licence: "Proprietary — API and apps only",
      detail: "Gemini weights are not released. Google's open-weight family is Gemma, which shares research with Gemini.",
    },
    stages: [
      { m: "pretrain", note: "Natively multimodal from the start — text, image, audio, video and code trained together on TPUs, rather than vision bolted on later." },
      { m: "sft", note: "Instruction tuning." },
      { m: "rlhf-ppo", note: "Reinforcement learning from human feedback." },
      { m: "reasoning-rl", note: "Thinking models reason before answering; 3.8 Flash trades more thinking for accuracy." },
    ],
    signature: "pretrain",
    extra: "Google's Gemini 1.5 report described a sparse mixture-of-experts architecture. Google describes 3.8 Flash as the same foundation as its predecessor, accelerated by long-running agentic loops.",
    undisclosed: ["Parameter counts", "Current architecture details", "Training data and token counts"],
    sources: [
      { label: "Google — Gemini 3.8 Flash and 3.8 Flash Cyber", url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/" },
      { label: "Gemini API release notes", url: "https://ai.google.dev/gemini-api/docs/changelog" },
    ],
  },

  llama: {
    maker: "Meta",
    lineup: [
      { name: "Muse Glimmer", tag: "newest open", released: "10 Aug 2026", role: "30B dense multimodal model built for local agents; distilled from Meta's closed Muse Spark. Ships with a speculative-decoding drafter.", spec: "Apache 2.0 · 128K context · under 20 GB at ~4-bit" },
      { name: "Muse Spark", released: "2026", role: "Meta's closed frontier model — the teacher Glimmer is distilled from.", spec: "Closed" },
      { name: "Llama 4 Scout · Maverick", released: "5 Apr 2025", role: "Meta's first natively multimodal, mixture-of-experts Llamas. Behemoth was announced but never released.", spec: "Llama 4 Community License" },
      { name: "Llama 3.1 / 3.3", released: "2024", role: "Dense 8B, 70B and 405B; still the most widely fine-tuned open base models.", spec: "Llama Community License" },
    ],
    weights: {
      status: "mixed",
      licence: "Llama Community License (Llama 3, 4) · Apache 2.0 (Muse Glimmer) · closed (Muse Spark)",
      detail: "The Llama licences allow commercial use but are not open-source licences: they carry an acceptable-use policy and extra terms above 700 million monthly users. Muse Glimmer marked Meta's return to a genuinely permissive licence after a pause on open releases.",
    },
    stages: [
      { m: "pretrain", note: "Llama 3: over 15 trillion tokens, dense, grouped-query attention. Llama 4: mixture-of-experts with text and image tokens fused from the first layer, trained in FP8." },
      { m: "sft", note: "Llama 4 deliberately kept this light, finding heavy SFT over-constrained the model." },
      { m: "rejection-sampling", note: "Llama 3: sample many answers, keep the best, retrain — several rounds." },
      { m: "dpo", note: "Llama 3 alternated rejection sampling with DPO; Llama 4 used online RL, then a light DPO pass." },
      { m: "distill", note: "Muse Glimmer is distilled from Muse Spark." },
    ],
    signature: "dpo",
    undisclosed: ["Muse Spark's size and training", "Muse Glimmer's training data"],
    sources: [
      { label: "Meta — Introducing Muse Glimmer", url: "https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model" },
      { label: "The Llama 3 Herd of Models (2024)", url: "https://arxiv.org/abs/2407.21783" },
      { label: "InfoQ — Muse Glimmer", url: "https://www.infoq.com/news/2026/08/meta-muse-glimmer/" },
    ],
  },

  qwen: {
    maker: "Alibaba",
    lineup: [
      { name: "Qwen3.8-Max (open: Qwen3.8-2.4T-A95B)", tag: "flagship", released: "2 Aug 2026 · weights 13 Aug", role: "Flagship mixture-of-experts: 2.4 trillion total parameters, 95 billion active per token. The first open release at this scale.", spec: "Apache 2.0" },
      { name: "Qwen3.8-27B", released: "14 Aug 2026", role: "Dense sibling that runs on far less hardware.", spec: "Apache 2.0" },
      { name: "Qwen3.6", released: "Apr 2026", role: "Previous generation.", spec: "Apache 2.0" },
      { name: "Qwen3.5 family", released: "Feb–Mar 2026", role: "Open-weight line alongside the proprietary Qwen3.5-Plus.", spec: "" },
    ],
    weights: {
      status: "open",
      licence: "Apache 2.0 for the open releases",
      detail: "Qwen is the most prolific open-weight family, from sub-1B models to the 2.4T flagship. Some Plus and Max tiers launch API-first before or instead of open weights.",
    },
    stages: [
      { m: "pretrain", note: "Qwen3: about 36 trillion tokens across 119 languages." },
      { m: "sft", note: "Stage 1 of Qwen3 post-training: a long chain-of-thought 'cold start'." },
      { m: "dpo", note: "Qwen2.5 aligned on preference pairs with offline DPO before any online RL." },
      { m: "grpo", note: "Online RL with GRPO from Qwen2.5 onward; Qwen3 used it for its reasoning stage, then fused thinking and non-thinking modes and ran general-purpose RL." },
      { m: "distill", note: "Smaller Qwen3 models are distilled from the flagship ('strong-to-weak')." },
    ],
    signature: "distill",
    extra: "Qwen3's four-stage recipe produced one model that can either think step by step or answer directly, switched per request.",
    undisclosed: ["Qwen3.8 training data and token count"],
    sources: [
      { label: "Qwen3 technical report", url: "https://arxiv.org/abs/2505.09388" },
      { label: "Qwen — Wikipedia (release history)", url: "https://en.wikipedia.org/wiki/Qwen" },
      { label: "Quartz — Qwen3.8-Max launch", url: "https://qz.com/alibaba-qwen38-max-ai-model-launch-080326" },
    ],
  },

  deepseek: {
    maker: "DeepSeek",
    lineup: [
      { name: "DeepSeek-V4-Pro", tag: "flagship", released: "24 Apr 2026 · GA 13 Aug", role: "Flagship mixture-of-experts: 1.6 trillion total, 49 billion active per token.", spec: "MIT · 1M context · 384K max output" },
      { name: "DeepSeek-V4-Flash", released: "24 Apr 2026 · 0731 update", role: "Cheaper sibling: 284 billion total, 13 billion active.", spec: "MIT · 1M context" },
      { name: "DeepSeek-R1", released: "Jan 2025", role: "The reasoning model that made GRPO famous.", spec: "MIT" },
      { name: "DeepSeek-V3", released: "Dec 2024", role: "671B total / 37B active; the base R1 was built on.", spec: "" },
    ],
    weights: {
      status: "open",
      licence: "MIT",
      detail: "Every major DeepSeek model is open-weight under the MIT licence — among the most permissive terms of any frontier-scale lab.",
    },
    stages: [
      { m: "pretrain", note: "V3: 14.8 trillion tokens, in FP8, with multi-head latent attention, auxiliary-loss-free expert load balancing and multi-token prediction. About 2.8 million H800 GPU-hours." },
      { m: "sft", note: "R1: a small 'cold start' set of long reasoning examples. R1-Zero skipped this entirely." },
      { m: "grpo", note: "R1: large-scale RL with GRPO on checkable maths and code. R1-Zero showed reasoning can emerge from RL alone." },
      { m: "rejection-sampling", note: "R1: sample from the RL model, keep the good answers, fine-tune again." },
      { m: "distill", note: "R1's reasoning was distilled into smaller Qwen and Llama models." },
    ],
    signature: "grpo",
    undisclosed: ["V4 training token count and full recipe"],
    sources: [
      { label: "DeepSeek — V4 release notes", url: "https://api-docs.deepseek.com/news/news260424/" },
      { label: "DeepSeek-V4-Pro on Hugging Face", url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro" },
      { label: "DeepSeek-V3 technical report", url: "https://arxiv.org/abs/2412.19437" },
      { label: "DeepSeek-R1 paper", url: "https://arxiv.org/abs/2501.12948" },
    ],
  },

  mistral: {
    maker: "Mistral AI",
    lineup: [
      { name: "Mistral Large 3", tag: "flagship", released: "2026", role: "Flagship general-purpose model.", spec: "" },
      { name: "Mistral Medium 3.5", released: "2026", role: "Balanced cost and capability.", spec: "" },
      { name: "Mistral Small 4 · Ministral 3", released: "2026", role: "Small and edge-sized models.", spec: "" },
      { name: "Specialists", released: "2026", role: "Voxtral (speech), OCR 4.1, Leanstral 1.5 (Lean 4 proofs), Shieldstral 1.0 (safety).", spec: "" },
    ],
    weights: {
      status: "mixed",
      licence: "Varies by model — many under Apache 2.0, some API-only or under Mistral's own licences",
      detail: "Mistral built its reputation on open releases (Mistral 7B, Mixtral) and still ships many open models, but check each model card: licences differ across the lineup.",
    },
    stages: [
      { m: "pretrain", note: "Architecture is published; data is not. Mistral 7B introduced sliding-window attention with grouped-query attention. Mixtral 8×7B was a sparse mixture of experts: 46.7B total, 12.9B active." },
      { m: "sft", note: "Instruction tuning; details largely unpublished." },
      { m: "dpo", note: "Preference tuning on the instruct models; exact recipe unpublished." },
    ],
    signature: "pretrain",
    undisclosed: ["Training data", "Token counts", "Post-training recipe", "Parameter counts for several current models"],
    sources: [
      { label: "Mistral — changelog", url: "https://docs.mistral.ai/resources/changelogs" },
      { label: "Mistral AI — Wikipedia", url: "https://en.wikipedia.org/wiki/Mistral_AI" },
    ],
  },

  grok: {
    maker: "xAI",
    lineup: [
      { name: "Grok 4.6", tag: "newest", released: "12 Aug 2026", role: "Current default across Grok plans — xAI calls it its most intelligent and fastest model.", spec: "Knowledge cutoff 1 Feb 2026" },
      { name: "Grok 4.5", released: "8 Jul 2026", role: "Coding, agents and knowledge work.", spec: "" },
      { name: "Grok 5", released: "not released", role: "In training; no committed release date as of this writing.", spec: "" },
      { name: "Grok-1 (open weights)", released: "Mar 2024", role: "314B mixture-of-experts base model, 2 of 8 experts active per token.", spec: "Apache 2.0" },
    ],
    weights: {
      status: "mixed",
      licence: "Current models proprietary · older generations released",
      detail: "xAI open-sourced Grok-1's base weights under Apache 2.0 and later released older Grok 2 weights. Current Grok 4.x models are closed.",
    },
    stages: [
      { m: "pretrain", note: "Trained on xAI's Colossus supercomputer. Scale and data for current models not disclosed." },
      { m: "sft", note: "Instruction tuning." },
      { m: "reasoning-rl", note: "xAI has emphasised reinforcement-learning compute on a scale comparable to pretraining since Grok 4." },
    ],
    signature: "reasoning-rl",
    undisclosed: ["Parameter counts for Grok 3 onward", "Training data", "Post-training recipe"],
    sources: [
      { label: "xAI — news", url: "https://x.ai/news" },
      { label: "Grok — Wikipedia", url: "https://en.wikipedia.org/wiki/Grok_(chatbot)" },
    ],
  },

  gemma: {
    maker: "Google DeepMind",
    lineup: [
      { name: "Gemma 4 31B (dense)", tag: "flagship", released: "2 Apr 2026", role: "Flagship open model; ranks near the top of open leaderboards against far larger models.", spec: "Apache 2.0 · up to 256K context" },
      { name: "Gemma 4 26B A4B (MoE)", released: "2 Apr 2026", role: "Mixture of experts with about 4B active — large-model quality at small-model speed.", spec: "Apache 2.0" },
      { name: "Gemma 4 12B Unified", released: "Jun 2026", role: "Added mid-cycle; text, image and audio input.", spec: "Apache 2.0" },
      { name: "Gemma 4 E2B · E4B", released: "2 Apr 2026", role: "'Effective' 2B and 4B sizes for phones and edge devices, with audio input.", spec: "Apache 2.0" },
    ],
    weights: {
      status: "open",
      licence: "Apache 2.0 (from Gemma 4)",
      detail: "A notable change: Gemma 1 to 3 used Google's own Gemma Terms of Use. Gemma 4 moved to Apache 2.0, a standard open-source licence. Multimodal, 140+ languages.",
    },
    stages: [
      { m: "pretrain", note: "Built from Gemini research. Gemma 3's 27B saw about 14 trillion tokens; interleaved local and global attention layers keep the KV cache small." },
      { m: "distill", note: "Since Gemma 2, smaller models learn from a larger teacher's full output distribution rather than from raw next-token labels." },
      { m: "sft", note: "Instruction tuning, also distilled from instruction-tuned teachers." },
      { m: "rlhf-ppo", note: "Reinforcement learning from human and model feedback." },
    ],
    signature: "distill",
    undisclosed: ["Gemma 4 token counts per size"],
    sources: [
      { label: "Google — Gemma 4", url: "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/" },
      { label: "Gemma 4 model card", url: "https://ai.google.dev/gemma/docs/core/model_card_4" },
    ],
  },

  phi: {
    maker: "Microsoft",
    lineup: [
      { name: "Phi-4-reasoning-vision-15B", tag: "newest", released: "Mar 2026", role: "Latest release: reasoning over text and images in a small footprint.", spec: "" },
      { name: "Phi-4 (14B)", released: "Dec 2024", role: "The model that made the small-model case — maths and reasoning well above its size.", spec: "MIT" },
      { name: "Phi-5", released: "not released", role: "Discussed in the community, but not officially released as of this writing.", spec: "" },
    ],
    weights: {
      status: "open",
      licence: "MIT",
      detail: "Phi models are released under the MIT licence — about as permissive as licences get.",
    },
    stages: [
      { m: "synthetic", note: "The defining choice: 'textbook-quality' data written by larger teacher models, plus web data filtered hard for educational value. Phi-4 trained on roughly 10 trillion tokens." },
      { m: "pretrain", note: "Dense 14B for Phi-4." },
      { m: "sft", note: "Instruction tuning." },
      { m: "dpo", note: "Phi-4 used 'pivotal token search': find the individual tokens that most change the chance of a correct answer, and build preference pairs around them." },
    ],
    signature: "synthetic",
    undisclosed: ["Details of the 2026 reasoning-vision model's training"],
    sources: [
      { label: "Phi-4 technical report", url: "https://arxiv.org/abs/2412.08905" },
      { label: "Phi — Wikipedia", url: "https://en.wikipedia.org/wiki/Phi_(language_model)" },
    ],
  },

  commandr: {
    maker: "Cohere",
    lineup: [
      { name: "Command A+", tag: "newest", released: "20 May 2026", role: "Current flagship: sparse mixture of experts, 218B total and 25B active; text and image in, 48 languages. Runs on as few as two H100s at 4-bit.", spec: "Apache 2.0 · 128K context" },
      { name: "Command A", released: "Mar 2025", role: "Previous flagship.", spec: "" },
      { name: "Command R+ (104B)", released: "2024", role: "The RAG-focused model this page was originally written about.", spec: "CC-BY-NC — non-commercial" },
    ],
    weights: {
      status: "open",
      licence: "Apache 2.0 (Command A+) · CC-BY-NC (older Command R+)",
      detail: "A significant change: Command R+ weights were non-commercial, so production use needed a Cohere licence. Command A+ is Apache 2.0, free for commercial use.",
    },
    stages: [
      { m: "pretrain", note: "Scale and data not disclosed." },
      { m: "sft", note: "Heavily weighted toward grounded answering with span-level citations, and multi-step tool use." },
      { m: "rlhf-ppo", note: "Preference tuning, including rewarding abstention when the documents do not contain the answer." },
    ],
    signature: "sft",
    undisclosed: ["Training data", "Token counts", "Post-training specifics"],
    sources: [
      { label: "Cohere — Introducing Command A+", url: "https://cohere.com/blog/command-a-plus" },
      { label: "Cohere docs — Command A+", url: "https://docs.cohere.com/docs/command-a-plus" },
    ],
  },
};

export const FAMILY_ORDER = ["claude", "gpt", "gemini", "llama", "qwen", "deepseek", "mistral", "grok", "gemma", "phi", "commandr"];
export const FAMILY_NAMES = {
  claude: "Claude", gpt: "GPT", gemini: "Gemini", llama: "Llama / Muse", qwen: "Qwen", deepseek: "DeepSeek",
  mistral: "Mistral", grok: "Grok", gemma: "Gemma", phi: "Phi", commandr: "Cohere Command",
};
export const FAMILY_PATHS = {
  claude: "/models/anthropic", gpt: "/models/gpt", gemini: "/models/gemini", llama: "/models/llama", qwen: "/models/qwen",
  deepseek: "/models/deepseek", mistral: "/models/mistral", grok: "/models/grok", gemma: "/models/gemma",
  phi: "/models/phi", commandr: "/models/command-r",
};

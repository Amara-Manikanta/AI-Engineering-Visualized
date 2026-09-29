/**
 * Shared question bank.
 *
 * Each topic's questions are imported both by the dedicated /quizzes page and
 * by the individual guide pages, so a question is written once and appears in
 * both places. `path` is where the material lives.
 *
 * Style rule for questions here: test whether the reader understood *why*,
 * not whether they memorised a term. Every distractor should be something a
 * reasonable person might believe.
 */

import { EXTRA_QUIZZES } from "./quizExtra.js";

export const QUIZZES = [
  {
    id: "ml-ensembles",
    topic: "Ensembles",
    label: "Random Forests & Boosting",
    path: "/ml/random-forests",
    icon: "🌲",
    tone: "amber",
    questions: [
      {
        q: "A random forest's trees are individually deep and overfit. Why is that the design rather than a flaw?",
        options: [
          "Deep trees train faster than shallow ones",
          "Averaging cancels variance but cannot fix bias, so each learner should be low-bias",
          "Deep trees are more interpretable when combined",
          "Shallow trees cannot handle categorical features",
        ],
        answer: 1,
        why: "Averaging independent errors drives variance down, and it leaves bias roughly where it was. So you want learners as flexible as possible, each overfitting in a different direction, and let the average cancel the noise. Boosting makes the opposite bet: weak, high-bias learners corrected sequentially.",
      },
      {
        q: "You raise a random forest from 100 to 1000 trees and accuracy barely moves. What does the ensemble variance formula say is happening?",
        options: [
          "The trees have become correlated with each other",
          "The variance floor is ρσ², which no number of trees removes",
          "The model has run out of training data",
          "n_estimators has a hard internal limit",
        ],
        answer: 1,
        why: "Variance of the average is ρσ² + (1−ρ)σ²/n. Only the second term shrinks with n. Past a few hundred trees it is already negligible and you are sitting on the floor set by ρ. Lowering ρ — which is exactly what random feature selection at each split does — is the only lever left.",
      },
      {
        q: "Which statement about adding more trees is true?",
        options: [
          "Both random forests and gradient boosting overfit with too many trees",
          "Neither overfits with more trees",
          "A random forest is mostly safe; a boosted model will overfit",
          "A boosted model is mostly safe; a random forest will overfit",
        ],
        answer: 2,
        why: "Bagged trees are averaged, so extra trees mainly cost time. Boosted trees are summed, each one fitting the previous residuals, so the model keeps growing in complexity and will eventually fit noise. That asymmetry is why boosting needs early stopping and bagging does not.",
      },
      {
        q: "What does out-of-bag scoring give you?",
        options: [
          "A faster training algorithm",
          "A validation estimate without holding out a separate set",
          "A way to handle missing values",
          "Better calibrated probabilities",
        ],
        answer: 1,
        why: "Each bootstrap sample leaves roughly a third of rows unused for that tree. Scoring each row using only the trees that never saw it produces an honest held-out estimate at no extra data cost. It is close to cross-validation for free.",
      },
    ],
  },
  {
    id: "ml-svm",
    topic: "SVM",
    label: "Support Vector Machines",
    path: "/ml/svm",
    icon: "📐",
    tone: "indigo",
    questions: [
      {
        q: "Two boundaries both classify every training point correctly. Why does an SVM prefer the one further from the data?",
        options: [
          "It trains faster",
          "A wider margin tolerates more perturbation before a new point is misclassified",
          "It uses fewer support vectors",
          "It guarantees a linearly separable dataset",
        ],
        answer: 1,
        why: "Training accuracy cannot distinguish them, so you need another criterion. Distance to the nearest point is a proxy for how much a test point can differ before crossing the boundary. Maximising it is a generalisation argument, not a fitting one.",
      },
      {
        q: "What does the kernel trick actually avoid doing?",
        options: [
          "Computing the coordinates in the high-dimensional space",
          "Storing the training data",
          "Solving an optimisation problem",
          "Scaling the input features",
        ],
        answer: 0,
        why: "The optimiser only ever needs dot products between points. A kernel returns the dot product in the lifted space directly, so the lift is never materialised. That is what makes an infinite-dimensional feature space affordable.",
      },
      {
        q: "You have very noisy, overlapping classes. Which way do you move C?",
        options: [
          "Up, to force correct classification of every point",
          "Down, to buy a wider margin by tolerating violations",
          "C has no effect on noisy data",
          "Set C to exactly 1 always",
        ],
        answer: 1,
        why: "Large C makes violations expensive, so the boundary contorts to fit noise. Small C buys a wider, smoother margin at the cost of some training errors — which is what you want when those errors are noise rather than signal.",
      },
    ],
  },
  {
    id: "dl-cnn",
    topic: "CNNs",
    label: "Convolutional Networks",
    path: "/ml/cnn",
    icon: "🖼️",
    tone: "blue",
    questions: [
      {
        q: "Weight sharing in a convolutional layer means the same kernel is applied everywhere. What is the main consequence?",
        options: [
          "Training converges in fewer epochs",
          "A feature learned at one position works at every position, and parameters stop scaling with image size",
          "The network becomes fully interpretable",
          "Pooling is no longer necessary",
        ],
        answer: 1,
        why: "Two things at once. Translation equivariance means an edge detector works anywhere without relearning, and the parameter count depends only on kernel size and channel count rather than on resolution. That is why a convolutional layer is tractable where a dense layer on pixels is not.",
      },
      {
        q: "Input 32×32, kernel 3, stride 1, padding 1. What is the output size?",
        options: ["30×30", "32×32", "34×34", "16×16"],
        answer: 1,
        why: "⌊(32 + 2·1 − 3) / 1⌋ + 1 = 32. Kernel 3 with padding 1 and stride 1 preserves spatial size exactly, which is why that combination — 'same' padding — is so common in modern architectures.",
      },
      {
        q: "Why do residual connections matter for deep CNNs?",
        options: [
          "They reduce the parameter count",
          "They give gradients a path that skips the block, making very deep networks trainable",
          "They replace the need for pooling",
          "They make the network translation invariant",
        ],
        answer: 1,
        why: "Writing a block as y = f(x) + x means the gradient reaches x through the identity term even when f's gradient is tiny. That is the same structural idea as an LSTM's cell state, and it is what took usable depth past about twenty layers.",
      },
    ],
  },
  {
    id: "dl-rnn",
    topic: "RNNs",
    label: "RNNs & LSTMs",
    path: "/ml/rnn",
    icon: "🔁",
    tone: "rose",
    questions: [
      {
        q: "Why does a vanilla RNN struggle to learn dependencies 50 steps apart?",
        options: [
          "The hidden state is too small to store them",
          "Backpropagation multiplies by the recurrent weight once per step, so the gradient decays or explodes exponentially",
          "The tanh activation saturates immediately",
          "Sequences that long exceed the batch size",
        ],
        answer: 1,
        why: "The gradient reaching step 1 from step t scales roughly as wᵗ. Anything below 1 vanishes exponentially, anything above explodes. At 50 steps with w = 0.9 the signal is about 0.005 of its original size — no learning reaches that far back.",
      },
      {
        q: "What specifically makes the LSTM cell state a better gradient path?",
        options: [
          "It is larger than the hidden state",
          "It is updated by gated addition, so the backward path is a multiplication by the forget gate alone",
          "It uses ReLU instead of tanh",
          "It is reset at every timestep",
        ],
        answer: 1,
        why: "c_t = f_t ⊙ c_(t−1) + i_t ⊙ c̃_t. The route from c_(t−1) to c_t involves no weight matrix — only the forget gate. If the network learns to hold that gate near 1, gradients pass through nearly unchanged.",
      },
      {
        q: "Gradient clipping is standard practice. Which problem does it solve?",
        options: [
          "Vanishing gradients",
          "Exploding gradients",
          "Both equally",
          "Neither; it speeds up training",
        ],
        answer: 1,
        why: "Clipping caps the norm of a gradient that has grown too large, which is cheap and effective. It does nothing for vanishing, because you cannot restore information from a signal already multiplied down to zero. That needed an architectural fix.",
      },
    ],
  },
  {
    id: "genai-peft",
    topic: "PEFT",
    label: "PEFT & LoRA",
    path: "/genai/peft",
    icon: "🎛️",
    tone: "indigo",
    questions: [
      {
        q: "LoRA initialises B to zero and A randomly. Why does B start at zero?",
        options: [
          "To save memory during the first epoch",
          "So the adapter is a no-op at step one and training begins from the unmodified base model",
          "Because zero is the optimal final value",
          "To prevent the rank from collapsing",
        ],
        answer: 1,
        why: "B·A is zero when B is zero, so the model at step one is exactly the pretrained model. Training starts from a known-good point rather than from randomly damaged weights, which is why LoRA needs no repair warmup.",
      },
      {
        q: "Which saving from LoRA most often decides whether a project is feasible?",
        options: [
          "The small adapter file size",
          "The reduced optimiser and gradient memory during training",
          "Faster inference",
          "Smaller training datasets",
        ],
        answer: 1,
        why: "Gradients and Adam moments exist only for trainable parameters. Cutting trainable parameters by three orders of magnitude removes most of the training-time memory, which is what moves a large fine-tune onto hardware you actually have. Inference speed is unchanged, and the file size is merely convenient.",
      },
      {
        q: "Quality is short. You can either double the rank or attach adapters to more modules. Which usually helps more?",
        options: [
          "Double the rank",
          "Attach to more modules at the same rank",
          "They are equivalent",
          "Neither; increase the learning rate",
        ],
        answer: 1,
        why: "Published ablations consistently favour breadth over depth here. Adding the MLP projections to an attention-only configuration typically beats doubling r on attention alone, for a similar parameter budget.",
      },
    ],
  },
  {
    id: "genai-tokens",
    topic: "Tokenization",
    label: "Tokenization",
    path: "/genai/tokenization",
    icon: "🔤",
    tone: "purple",
    questions: [
      {
        q: "Why can a subword tokenizer never produce an out-of-vocabulary token?",
        options: [
          "Its vocabulary contains every word in the language",
          "Unknown words decompose into smaller known pieces, down to single characters or bytes",
          "It replaces unknown words with the nearest known word",
          "It rejects inputs containing unknown words",
        ],
        answer: 1,
        why: "The vocabulary includes all the atomic units, so any string has at least one valid segmentation. A rare word simply costs more tokens. Byte-level BPE takes this further and can encode literally any byte sequence.",
      },
      {
        q: "BPE and WordPiece differ in one line. What is it?",
        options: [
          "BPE works on characters, WordPiece on words",
          "BPE merges the most frequent pair; WordPiece merges the pair that most increases likelihood",
          "BPE is greedy, WordPiece is exhaustive",
          "WordPiece cannot handle non-English text",
        ],
        answer: 1,
        why: "WordPiece scores candidates by freq(ab) / (freq(a)·freq(b)), which asks whether a pair co-occurs more than chance would predict. BPE just counts. The second question is better at distinguishing a real morpheme from two common pieces that happen to sit next to each other.",
      },
      {
        q: "A model struggles to count the letters in a word. What is the actual cause?",
        options: [
          "Insufficient training data on spelling",
          "The model never sees individual letters — the word arrives as two or three subword chunks",
          "The attention mechanism cannot count",
          "The tokenizer strips repeated letters",
        ],
        answer: 1,
        why: "It is a representation problem, not a reasoning one. You are asking about something that is not in the input the model receives. No amount of prompting fixes it; spelling the word out with spaces does, because that changes the tokenization.",
      },
    ],
  },
  {
    id: "rag-core",
    topic: "RAG",
    label: "RAG & Retrieval",
    path: "/rag/fundamentals",
    icon: "🔍",
    tone: "blue",
    questions: [
      {
        q: "When is fine-tuning the wrong tool for adding company knowledge to a model?",
        options: [
          "Whenever the company is small",
          "When the knowledge changes, or answers must cite a source",
          "When you have more than 1000 documents",
          "Fine-tuning is always wrong for knowledge",
        ],
        answer: 1,
        why: "Weights cannot be cited and cannot be updated without retraining. If the facts move or an answer has to point at its source, retrieval is the right mechanism. For a small, fixed, unattributed body of facts, fine-tuning is defensible.",
      },
      {
        q: "Your RAG answers are poor. What should you measure first?",
        options: [
          "End-to-end answer quality",
          "Retrieval quality on its own, such as recall at k",
          "Model latency",
          "Embedding dimension",
        ],
        answer: 1,
        why: "End-to-end quality cannot tell you whether retrieval missed the document or generation ignored it. Those have completely different fixes. Score the retriever separately and you know which half to work on.",
      },
      {
        q: "Contextual compression cuts context by 60%. Besides cost, what else usually improves?",
        options: [
          "Retrieval recall",
          "Answer accuracy, because models attend less reliably to the middle of a long context",
          "Embedding quality",
          "Index build time",
        ],
        answer: 1,
        why: "The lost-in-the-middle effect is well documented and does not go away with larger context windows. Less padding means less middle for the relevant material to get buried in, so accuracy often rises even where budget was never the constraint.",
      },
      {
        q: "You fine-tune a model on clean question/answer pairs, then deploy it in a RAG pipeline. What is the likely failure?",
        options: [
          "The model becomes slower",
          "The model answers from its weights and underuses the retrieved context",
          "Retrieval stops working",
          "Embeddings become incompatible",
        ],
        answer: 1,
        why: "You trained it on prompts with no context, so it learned to answer without one. Training examples must be shaped like production prompts — retrieved documents included — or tuning actively undermines the retrieval you built.",
      },
    ],
  },
  {
    id: "agents-core",
    topic: "Agents",
    label: "Agents & Reliability",
    path: "/agents",
    icon: "🕸️",
    tone: "emerald",
    questions: [
      {
        q: "Each step of your agent succeeds 95% of the time. It runs 10 steps. Roughly what is the end-to-end success rate?",
        options: ["95%", "85%", "60%", "50%"],
        answer: 2,
        why: "0.95¹⁰ ≈ 0.599. Errors compound multiplicatively, which is why agent engineering is mostly about shortening runs, verifying intermediate results, and making steps retryable rather than about finding a better prompt.",
      },
      {
        q: "What distinguishes A2A from MCP?",
        options: [
          "A2A is faster",
          "MCP connects an agent to its tools; A2A connects an agent to autonomous peer agents",
          "A2A replaces MCP",
          "MCP is for local use, A2A for cloud",
        ],
        answer: 1,
        why: "Different axes. MCP exposes tools that execute what they are told. A2A exposes skills belonging to an autonomous peer that decides how to do the work. A single system commonly uses both — A2A sideways, MCP downward.",
      },
      {
        q: "Which failure mode is most dangerous in production?",
        options: [
          "An infinite loop",
          "A tool call that raises an exception",
          "A run that completes successfully with a wrong answer",
          "Context window overflow",
        ],
        answer: 2,
        why: "The other three are visible: something hangs, errors, or truncates. A silently wrong answer looks identical to a correct one from the outside. That is why you assert on outputs rather than on completion.",
      },
      {
        q: "Why do conversational multi-agent frameworks need a hard turn cap more urgently than sequential ones?",
        options: [
          "Their models are more expensive",
          "Each agent typically sees the whole transcript, so cost grows roughly with the square of the turn count",
          "They cannot detect completion",
          "They use more memory on the client",
        ],
        answer: 1,
        why: "Turn 12 sends turns 1 through 11 as input. Summed over a run, input tokens grow quadratically in turns. An agent loop that does not terminate does not just hang — it bills the whole time.",
      },
    ],
  },
  {
    id: "arch-mamba",
    topic: "Mamba",
    label: "Mamba & State Space Models",
    path: "/ml/mamba",
    icon: "🐍",
    tone: "emerald",
    questions: [
      {
        q: "A linear recurrence looks inherently sequential. How does Mamba train in parallel anyway?",
        options: [
          "It approximates the recurrence with attention during training",
          "The step composition is associative, so it computes as a tree of depth log n",
          "It trains on short sequences only",
          "It caches the state from the previous epoch",
        ],
        answer: 1,
        why: "Two consecutive steps compose into one equivalent step, and that composition is associative. Associativity is exactly what a parallel scan needs — the same reason a running total of a million numbers does not take a million sequential steps.",
      },
      {
        q: "What does a small Δ mean for a given token?",
        options: [
          "The token is processed faster",
          "Ā approaches 1, so the state passes through almost unchanged and the token is largely ignored",
          "The token is dropped from the sequence",
          "The state is reset",
        ],
        answer: 1,
        why: "Ā = exp(ΔA) with A negative, so small Δ pushes Ā toward 1 — the state is preserved and barely anything new is written. Read Δ as 'how much time this token represents'. Small Δ is the model holding still.",
      },
      {
        q: "Making Δ, B and C input-dependent gave Mamba selectivity. What did it cost?",
        options: [
          "Nothing — it is strictly better",
          "The model could no longer run recurrently at inference",
          "The sequence stopped being a convolution, so the FFT shortcut was lost",
          "Training became non-differentiable",
        ],
        answer: 2,
        why: "With fixed matrices the whole sequence is a convolution computable by FFT. Once parameters vary per token that shortcut disappears, which is why Mamba needed a hardware-aware parallel scan. That trade is what the paper is really about.",
      },
      {
        q: "Where do transformers still clearly beat Mamba?",
        options: [
          "Throughput on long sequences",
          "Memory use during generation",
          "Exact recall of a specific token from far back in the context",
          "Training parallelism",
        ],
        answer: 2,
        why: "A fixed-size state is a lossy summary of everything seen. Attention keeps every key and value, so verbatim retrieval is free. This is precisely why production systems interleave a few attention layers among mostly Mamba layers.",
      },
    ],
  },
  {
    id: "arch-rwkv",
    topic: "RWKV",
    label: "RWKV",
    path: "/ml/rwkv",
    icon: "🔄",
    tone: "blue",
    questions: [
      {
        q: "What does RWKV remove from attention to make recurrence possible?",
        options: [
          "The value vectors",
          "The query — a past token's weight no longer depends on the current token",
          "The softmax normalisation",
          "The feed-forward network",
        ],
        answer: 1,
        why: "The query is what couples every pair of positions and forces you to keep all past keys. Without it, a past token's contribution depends only on its own key and its distance, which factorises into an exponential decay that a running accumulator can maintain.",
      },
      {
        q: "How does RWKV encode position?",
        options: [
          "Rotary position embeddings",
          "Learned absolute position vectors",
          "Exponential decay with distance, at a learned rate per channel",
          "It does not encode position",
        ],
        answer: 2,
        why: "The term exp(−(t−1−i)·w) is the whole positional mechanism. Because w is learned per channel, one layer holds many timescales at once — some channels track the last two tokens, others carry information for hundreds.",
      },
      {
        q: "What is u, the bonus term, for?",
        options: [
          "It normalises the output",
          "It stops the current token from being decayed as if it were one step in the past",
          "It controls the learning rate",
          "It gates the channel-mixing layer",
        ],
        answer: 1,
        why: "Without u the present token would be treated as already one step old and faded accordingly, which measurably hurts. Note that u applies only while the token is current — it is not carried into the state.",
      },
      {
        q: "A naive implementation of the recurrent form produces NaNs within a few hundred tokens. Why?",
        options: [
          "The state grows without bound",
          "exp(k) overflows; implementations must track a running maximum and work relative to it",
          "The decay becomes negative",
          "Gradients vanish",
        ],
        answer: 1,
        why: "Those exponentials overflow fast in fp16. Real implementations keep a running max exponent and store everything relative to it, the same trick as a numerically stable softmax. It is an implementation detail that decides whether the architecture works at all.",
      },
    ],
  },
];

QUIZZES.push({
  id: "efficiency",
  topic: "Efficiency",
  label: "Efficient Inference",
  path: "/efficiency",
  icon: "⚡",
  tone: "amber",
  questions: [
    {
      q: "You quantize a 70B model to 4-bit, then still run out of memory at 128k context. What did you miss?",
      options: [
        "Quantization does not apply to all layers",
        "The KV cache grows with context and can exceed the weights",
        "4-bit needs more memory than fp16 at long context",
        "The tokenizer holds the extra memory",
      ],
      answer: 1,
      why: "Weights are fixed once you pick a precision; the cache grows linearly with every token. At long context it routinely dwarfs the weights. This is the single most common capacity-planning mistake, and the fix is a KV-side technique, not a weight-side one.",
    },
    {
      q: "Mixtral holds 46.7B parameters but activates about 12.9B per token. How much memory do you need?",
      options: [
        "Enough for 12.9B — only active experts load",
        "Enough for all 46.7B — every expert must be resident",
        "Enough for 12.9B plus the router",
        "It depends on the batch size",
      ],
      answer: 1,
      why: "Sparsity is not compression. The router can send the next token to any expert, so all of them stay in memory. Mixture of experts buys compute and latency, never RAM — planning capacity from the active count comes up short by roughly four times here.",
    },
    {
      q: "Which pair does NOT stack usefully?",
      options: [
        "4-bit weights + KV quantization",
        "Prompt caching + speculative decoding",
        "A linear architecture + KV-cache compression",
        "Quantization + mixture of experts",
      ],
      answer: 2,
      why: "Mamba and RWKV carry a fixed-size state and have no KV cache at all, so there is nothing for a cache-compression technique to act on. Savings across different budgets multiply; savings aimed at the same budget usually overlap.",
    },
    {
      q: "Why does prompt caching break when you put a timestamp at the top of your system prompt?",
      options: [
        "Timestamps are not tokenizable",
        "It matches on an exact prefix, so a change early invalidates everything after it",
        "The cache only stores the last 1000 tokens",
        "It disables the attention mask",
      ],
      answer: 1,
      why: "Cached entries are the KV values for a specific token prefix. Change a character near the start and every subsequent position differs, so the whole cache is void. Put stable text first and volatile text last.",
    },
  ],
});

QUIZZES.push({
  id: "data-prep",
  topic: "Data",
  label: "Data Sourcing, Cleaning & Analysis",
  path: "/ml/data-sourcing",
  icon: "🧹",
  tone: "emerald",
  questions: [
    {
      q: "Your survey only reaches customers who used the app this week. You grow it from 200 to 20,000 responses. What happens to the bias in your satisfaction estimate?",
      options: [
        "It shrinks by a factor of ten",
        "It disappears once n passes 1,000",
        "It stays the same — only the spread of the estimate shrinks",
        "It grows, because big samples amplify bias",
      ],
      answer: 2,
      why: "Sample size controls variance, not bias. Every one of those 20,000 people comes from the same filtered group, so the estimate converges — precisely — on the wrong number. Fix the sampling method, not the count.",
    },
    {
      q: "Two annotators agree on 92% of fraud labels. About 95% of items are not fraud. What should you check before trusting the labels?",
      options: [
        "Nothing — 92% agreement is excellent",
        "Cohen's kappa, because two people who both say 'not fraud' almost always will agree by chance",
        "Whether the annotators were paid enough",
        "The number of features in the dataset",
      ],
      answer: 1,
      why: "When one class dominates, chance agreement is huge. Kappa subtracts it out. Agreement of 92% on a 95/5 split can correspond to a kappa near zero — the annotators may not agree on a single actual fraud case.",
    },
    {
      q: "An income column has a mean of ₹5.4 lakh and a median of ₹67,000. What is the most likely explanation?",
      options: [
        "The data is left-skewed",
        "A few extreme values (or errors) are dragging the mean up",
        "The median was computed incorrectly",
        "Income is normally distributed",
      ],
      answer: 1,
      why: "The mean uses every value, so a handful of huge incomes — or a typo like an extra three zeros — pull it far above the typical value. The median ignores how extreme the extremes are. A gap this large is a cue to look for outliers.",
    },
    {
      q: "You fill missing values with the column median, computed on the full dataset, then split into train and test. What is wrong?",
      options: [
        "Nothing, the median is robust",
        "The median should have been the mean",
        "Test-set values influenced a statistic used in training — a small leak",
        "Imputation must always happen after model training",
      ],
      answer: 2,
      why: "Any statistic learned from data — medians, scaling parameters, outlier fences — must be fitted on training data only and then reused on test data. Otherwise the test set is no longer unseen. Putting the imputer inside a scikit-learn Pipeline makes this automatic.",
    },
    {
      q: "High earners tend to skip the income question. Which statement is right?",
      options: [
        "The data is missing completely at random, so dropping rows is fine",
        "Median imputation will fix it",
        "It is missing not at random: every simple method is biased, so flag it and state the limitation",
        "It cannot affect a model",
      ],
      answer: 2,
      why: "When missingness depends on the missing value itself (MNAR), the observed values are systematically lower than the truth, and anything estimated from them inherits that. Predicting from related columns helps partially; an indicator column lets the model use the missingness itself.",
    },
    {
      q: "Pearson's r between two variables is 0.02. What can you conclude?",
      options: [
        "The variables are unrelated",
        "There is no straight-line relationship — there could still be a strong curved one",
        "One variable causes the other",
        "The data contains outliers",
      ],
      answer: 1,
      why: "Pearson's r only measures linear association. A perfect U-shape gives r ≈ 0 because the rising and falling halves cancel. Plot the scatter before concluding anything — Anscombe's quartet is the classic demonstration.",
    },
    {
      q: "Ice cream sales strongly predict drownings. Which is true?",
      options: [
        "Reducing ice cream sales would reduce drownings",
        "The correlation must be a data error",
        "Both follow temperature — fine for prediction, useless for deciding what to change",
        "Drownings cause ice cream sales",
      ],
      answer: 2,
      why: "A confounder drives both. The correlation is real and can genuinely help predict drownings, but intervening on ice cream does nothing. Questions of the form 'if we change X, will Y change?' need causal evidence, usually an experiment.",
    },
  ],
});

QUIZZES.push({
  id: "stats-inference",
  topic: "Statistics",
  label: "Inference, CLT & Hypothesis Tests",
  path: "/ml/hypothesis-testing",
  icon: "📊",
  tone: "blue",
  questions: [
    {
      q: "A 95% confidence interval for average commute is 48–56 minutes. What does the 95% refer to?",
      options: [
        "There is a 95% chance the true mean is between 48 and 56",
        "95% of commuters take 48–56 minutes",
        "95% of intervals built by this method would contain the true mean",
        "The sample mean is 95% accurate",
      ],
      answer: 2,
      why: "The true mean is fixed; this particular interval either contains it or not. The 95% describes the procedure's long-run hit rate. It is also not about individual commuters — that would be a much wider prediction interval.",
    },
    {
      q: "You want to halve the margin of error of a survey. How many more people do you need?",
      options: ["Twice as many", "Four times as many", "Ten times as many", "It depends on the population size"],
      answer: 1,
      why: "The margin of error scales with 1/√n. Halving it means √n must double, so n must quadruple. For a random sample the population size barely matters, which surprises most people.",
    },
    {
      q: "What does the Central Limit Theorem actually promise?",
      options: [
        "Large datasets are normally distributed",
        "The mean of a large enough sample is approximately normal, with spread σ/√n, whatever the population's shape (given finite variance)",
        "Every statistic, including the median and max, becomes normal",
        "Samples of 30 are always enough",
      ],
      answer: 1,
      why: "It is a statement about averages, not about the data. Your incomes stay skewed; the average of many incomes becomes bell-shaped. It needs finite variance (the Cauchy distribution breaks it), and 30 is only a rough rule — skewed data needs more.",
    },
    {
      q: "A test gives p = 0.03. Which reading is correct?",
      options: [
        "There is a 3% chance the null hypothesis is true",
        "There is a 97% chance the effect is real",
        "If there were no effect, data at least this extreme would turn up about 3% of the time",
        "The effect is small",
      ],
      answer: 2,
      why: "A p-value is P(data this extreme | H₀), not P(H₀ | data). Turning one into the other needs prior information the test does not use. It also says nothing about how large the effect is.",
    },
    {
      q: "A team checks 20 metrics after an experiment. One shows p = 0.04 and gets reported as the win. What is the problem?",
      options: [
        "Nothing, 0.04 is below 0.05",
        "With 20 tests, about one false positive is expected even if nothing changed",
        "They should have used a one-sided test",
        "p-values cannot be computed for 20 metrics",
      ],
      answer: 1,
      why: "At α = 0.05, twenty independent tests of nothing produce at least one 'significant' result about 64% of the time. Choose one primary metric in advance, or correct for multiple comparisons (Bonferroni: use 0.05/20).",
    },
    {
      q: "An A/B test with 800,000 users finds conversion rose from 10.0% to 10.2%, p = 0.003. What should you conclude?",
      options: [
        "The change is a huge success",
        "The lift is probably real, but whether 0.2 points is worth it is a separate, practical question",
        "The result is invalid because the sample is too large",
        "Nothing, because p-values over 0.001 are unreliable",
      ],
      answer: 1,
      why: "Statistical significance only says the effect is unlikely to be zero. With enough data, trivially small effects become significant. The confidence interval for the lift tells you the plausible size, which is what the business decision needs.",
    },
    {
      q: "You lower α from 0.05 to 0.01 and keep the same sample size. What happens?",
      options: [
        "Both error rates fall",
        "False positives become rarer, but you miss more real effects (power falls)",
        "Power rises",
        "Nothing changes except the p-value",
      ],
      answer: 1,
      why: "A stricter threshold moves the critical value outward. Fewer false alarms, but more real effects fall short of it — Type II error rises. Only more data, or a larger true effect, reduces both at once.",
    },
  ],
});

QUIZZES.push({
  id: "ml-classic",
  topic: "Regression & Classification",
  label: "Linear, Logistic & Naive Bayes",
  path: "/ml/multiple-regression",
  icon: "📈",
  tone: "indigo",
  questions: [
    {
      q: "In a house-price model, the bedrooms coefficient is +$68,000 on its own but −$12,000 once square feet is added. Which is right?",
      options: [
        "The first — the second is a fitting error",
        "The second — the first is a fitting error",
        "Both: the first compares houses of any size, the second holds size fixed",
        "Neither, because the sign flipped",
      ],
      answer: 2,
      why: "Bedrooms and area are correlated, so on its own the bedrooms coefficient mostly measures the value of extra space. In the multiple model it means one more bedroom for a house of the same size — smaller rooms — which can genuinely lower the price. Coefficients depend on what else is in the model.",
    },
    {
      q: "You add a column of pure random numbers to a regression. What happens to R² and adjusted R² on the training data?",
      options: [
        "Both fall",
        "R² rises slightly (or stays the same); adjusted R² usually falls",
        "Both rise",
        "Neither changes",
      ],
      answer: 1,
      why: "Least squares can always use an extra column to shave a little training error, so R² never decreases. Adjusted R² charges a penalty per feature and only rises when a feature explains more than chance would. Held-out error is the honest judge.",
    },
    {
      q: "Two features have VIFs of 7 and 7. What does that tell you?",
      options: [
        "The model's predictions are wrong",
        "Each feature is largely predictable from the other, so their individual coefficients are unstable",
        "Both features should be dropped",
        "The residuals are not normal",
      ],
      answer: 1,
      why: "VIF = 1/(1 − R²) from regressing a feature on the others; 7 means R² ≈ 0.86. Predictions can still be good, but the model cannot cleanly split credit between them, so their coefficients have wide intervals. Combine them, drop one, or regularise.",
    },
    {
      q: "A logistic regression coefficient for 'number of support tickets' is 0.7. What does it mean?",
      options: [
        "Each extra ticket adds 0.7 to the churn probability",
        "Each extra ticket adds 70 percentage points to churn probability",
        "Each extra ticket multiplies the odds of churning by e^0.7 ≈ 2",
        "Customers with tickets churn 70% of the time",
      ],
      answer: 2,
      why: "The model is linear in log-odds, so β adds to the log-odds and multiplies the odds by e^β. The effect on probability depends on the starting point — near 0.5 it is large, near 0 or 1 it is small — which is why odds ratios are the standard way to report it.",
    },
    {
      q: "Your fraud model has 95% accuracy on data where 5% of transactions are fraud. What should you check?",
      options: [
        "Nothing, 95% is excellent",
        "Precision and recall on the fraud class — predicting 'never fraud' also scores 95%",
        "Whether the learning rate was too high",
        "The R² of the model",
      ],
      answer: 1,
      why: "With imbalanced classes, accuracy is dominated by the majority. Recall tells you how much fraud you catch, precision how many of your flags are real. Then pick a threshold based on what a miss and a false alarm each cost.",
    },
    {
      q: "A disease affects 1% of people. A test is 95% sensitive and 95% specific. You test positive. Roughly how likely are you to have it?",
      options: ["95%", "About 50%", "About 16%", "1%"],
      answer: 2,
      why: "Of 10,000 people, 100 are sick and 95 test positive. Of the 9,900 healthy, 5% — 495 — also test positive. So 95 of 590 positives are real: about 16%. The prior matters enormously; ignoring it is the base-rate fallacy, and Bayes' theorem is the correction.",
    },
    {
      q: "Why does Naive Bayes use Laplace smoothing?",
      options: [
        "To speed up training",
        "So a word never seen with a class does not give that class a probability of exactly zero",
        "To make the features independent",
        "To normalise the features",
      ],
      answer: 1,
      why: "Probabilities are multiplied, so a single zero wipes out all other evidence. Adding α to every count gives unseen words a small, non-zero probability. It is the fix for the zero-frequency problem.",
    },
    {
      q: "Naive Bayes assumes words are independent given the class, which is clearly false. What is the usual consequence?",
      options: [
        "The classifier stops working",
        "Class rankings stay good but the probabilities are overconfident",
        "It becomes slower to train",
        "It overfits badly on small data",
      ],
      answer: 1,
      why: "Correlated words are counted as separate evidence, pushing scores to extremes. The most likely class is usually still right, so accuracy holds up, but the probabilities are poorly calibrated. Calibrate them, or use logistic regression when you need trustworthy probabilities.",
    },
  ],
});

QUIZZES.push({
  id: "rl-alignment",
  topic: "Reinforcement Learning",
  label: "RL, RLHF, DPO & GRPO",
  path: "/ml/rlhf",
  icon: "🎯",
  tone: "rose",
  questions: [
    {
      q: "A bandit agent with ε = 0 keeps pulling machine 1, which pays 25% of the time, while machine 3 pays 62%. Why?",
      options: [
        "Its learning rate is too high",
        "It never explores, so it never collects enough evidence about the better machine",
        "Machine 3 is broken",
        "Greedy agents always find the best arm eventually",
      ],
      answer: 1,
      why: "A purely greedy agent exploits whatever currently looks best. If machine 1 paid early, its estimate beats the untried machines and they are never pulled again. Some exploration is the price of discovering something better.",
    },
    {
      q: "Q-learning is called off-policy. What does that mean in practice?",
      options: [
        "It does not use a policy at all",
        "It learns the value of the best (greedy) behaviour while acting with a different, exploratory one",
        "It can only learn from a human's demonstrations",
        "It must discard data after every update",
      ],
      answer: 1,
      why: "The update uses max Q(s′, ·) — the value of the best next action — regardless of which action the ε-greedy agent actually takes next. So it learns the optimal route even while still taking random steps, and can learn from replayed old experience.",
    },
    {
      q: "Why does RLHF collect comparisons ('A is better than B') instead of asking people to score answers from 1 to 10?",
      options: [
        "Scores cannot be used to train a model",
        "Comparisons are faster and far more consistent between people than absolute scores",
        "Comparisons need no labellers",
        "PPO can only read comparisons",
      ],
      answer: 1,
      why: "People disagree wildly on what a '7' means but agree much more on which of two answers is better. The Bradley–Terry model turns those comparisons into a scalar reward model, which is what RL needs.",
    },
    {
      q: "What is the KL penalty in RLHF for?",
      options: [
        "It speeds up training",
        "It keeps the policy close to the SFT model, limiting how far it can exploit the reward model's blind spots",
        "It replaces the reward model",
        "It reduces the size of the model",
      ],
      answer: 1,
      why: "The reward model is an imperfect proxy. Optimise it without limit and the policy drifts into answers the proxy over-scores — length, flattery — while true quality falls. The KL term charges for every step away from the reference, so the policy only moves where the reward gain is worth it.",
    },
    {
      q: "What does DPO remove from the RLHF pipeline?",
      options: [
        "The preference data",
        "The reference model",
        "The separate reward model and the RL sampling loop — the policy's own log-probabilities act as an implicit reward",
        "The supervised fine-tuning stage",
      ],
      answer: 2,
      why: "The RLHF objective has a closed-form optimum, so the reward can be written as β·log π/π_ref. Substituting into the Bradley–Terry model gives a supervised loss on preference pairs. You still need pairs, a reference model and usually an SFT starting point.",
    },
    {
      q: "In GRPO, all 8 sampled answers to a prompt are correct and get the same reward. What does the model learn from that prompt?",
      options: [
        "A lot — every answer is reinforced",
        "Nothing — every advantage is zero, because each answer equals the group average",
        "It learns to make the answers longer",
        "It is penalised for being too easy",
      ],
      answer: 1,
      why: "GRPO's baseline is the group mean. If every answer scores the same, reward minus mean is zero for all of them. The same is true when all are wrong. Learning signal only exists on prompts the model sometimes solves, which is why training data is filtered by difficulty.",
    },
    {
      q: "What does PPO's clipping of the probability ratio achieve?",
      options: [
        "It makes the policy deterministic",
        "It removes the incentive to change the policy by more than a small amount in one update, keeping training stable",
        "It normalises the rewards",
        "It prevents the value model from overfitting",
      ],
      answer: 1,
      why: "Once π_new/π_old moves outside [1−ε, 1+ε] in the direction the advantage favours, the objective goes flat and the gradient disappears. Large, destabilising jumps get no reward — the same mechanism used when PPO fine-tunes language models.",
    },
    {
      q: "An AI judge picks the first answer it reads 70% of the time, whichever it is. How should you use it to label preference data?",
      options: [
        "Always put the better answer first",
        "Ask twice with the order swapped and keep only verdicts that agree",
        "Use a smaller judge model",
        "Ignore it — position bias averages out",
      ],
      answer: 1,
      why: "Position bias turns order into a hidden input. Evaluating both orders exposes it: consistent verdicts reflect the answers, inconsistent ones reflect the order and should be dropped or sent to a person.",
    },
  ],
});

QUIZZES.push({
  id: "genai-model-types",
  topic: "Model Types",
  label: "LLM, VLM, SLM, MoE & more",
  path: "/llms/types",
  icon: "🧩",
  tone: "purple",
  questions: [
    {
      q: "Llama 4 Maverick has about 400B total parameters and 17B active per token. At 8-bit, roughly how much memory do its weights need?",
      options: ["About 17 GB", "About 400 GB", "About 34 GB", "It depends only on context length"],
      answer: 1,
      why: "Any token can be routed to any expert, so every expert must be resident. MoE gives you the compute cost of the active size and the memory cost of the total size.",
    },
    {
      q: "Why does a full-HD screenshot cost so many more tokens than a small thumbnail when sent to a VLM?",
      options: [
        "Larger files are billed by the megabyte",
        "The image is cut into fixed-size patches, and each patch (or small group) becomes a token",
        "Screenshots contain hidden text",
        "VLMs re-encode images several times",
      ],
      answer: 1,
      why: "Tokens scale with the number of patches, which scales with pixel area. That is why cropping to the relevant region is the cheapest optimisation for vision workloads.",
    },
    {
      q: "Chinchilla suggests about 20 training tokens per parameter, yet Llama 3 8B was trained on 15 trillion tokens. Why?",
      options: [
        "Chinchilla was wrong",
        "The extra data was mostly duplicates",
        "Serving cost dominates: a smaller model trained longer is cheaper to run for billions of requests",
        "Bigger datasets make models smaller",
      ],
      answer: 2,
      why: "Chinchilla's rule optimises the training budget alone. Once a model will be used heavily, spending more on training to get a smaller model that is just as good saves far more at inference time.",
    },
    {
      q: "In a large dense LLM such as Llama 3 70B, where do most of the parameters live?",
      options: ["The embedding table", "The attention layers", "The MLP (feed-forward) layers", "The tokenizer"],
      answer: 2,
      why: "Each block's MLP expands to a hidden size several times the model width with three weight matrices, so the MLPs hold roughly two-thirds of the parameters. The vocabulary is a small share in big models.",
    },
    {
      q: "What does a Large Concept Model predict at each step?",
      options: [
        "The next token",
        "The next sentence, as a vector in a language-independent embedding space",
        "The next action on screen",
        "A probability for each answer you supply",
      ],
      answer: 1,
      why: "Meta's LCM works on sentence embeddings (SONAR), then a decoder writes each sentence out — in any supported language. It is a research prototype, not a production architecture.",
    },
    {
      q: "An action model completes each step correctly 95% of the time. Roughly how often does it finish a 20-step task?",
      options: ["95%", "About 80%", "About 36%", "About 5%"],
      answer: 2,
      why: "Errors compound: 0.95²⁰ ≈ 0.36. This is why agents check the result of each action and recover from mistakes rather than relying on per-step accuracy alone.",
    },
    {
      q: "Which statement about model 'types' is accurate?",
      options: [
        "A model is exactly one type — LLM, VLM, SLM or MoE",
        "They describe different axes — size, architecture, input, output — so one model can be several at once",
        "MoE models cannot read images",
        "Small models are always dense",
      ],
      answer: 1,
      why: "Gemma 4 26B A4B, for example, is a mixture of experts, relatively small, and multimodal. The labels answer different questions about the same model.",
    },
  ],
});

QUIZZES.push(...EXTRA_QUIZZES);

export const findQuiz = (id) => QUIZZES.find((q) => q.id === id);
export const questionsFor = (id) => findQuiz(id)?.questions ?? [];

/* ─────────────────────────────────────────────────────────
   RAG from Scratch — script.js
   ───────────────────────────────────────────────────────── */

/* ── NAV SCROLL & HAMBURGER ─────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  highlightNavLink();
});

const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('open');
  });
}

function highlightNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ── SMOOTH SCROLL HELPER ───────────────────────────────── */
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/* ── SCROLL REVEAL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.note-card, .ta-card, .why-card, .ps-item, .pt-section').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ════════════════════════════════════════════════════════════
   ANIMATION ENGINE
   ════════════════════════════════════════════════════════════ */

class StepAnimator {
  constructor(config) {
    this.steps = config.steps;
    this.currentStep = 0;
    this.totalSteps = config.steps.length;
    this.labelEl = document.getElementById(config.labelId);
    this.explainerEl = document.getElementById(config.explainerId);
    this.playBtn = document.getElementById(config.playBtnId);
    this.dotsEl = document.getElementById(config.dotsId);
    this.playInterval = null;
    this.isPlaying = false;
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    this.buildDots();
    this.init();
  }

  init() {
    this.goToStep(0);
  }

  buildDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = '';
    for (let i = 0; i < this.totalSteps; i++) {
      if (i > 0) {
        const conn = document.createElement('div');
        conn.className = 'step-dot-connector';
        conn.dataset.conn = i;
        this.dotsEl.appendChild(conn);
      }
      const dot = document.createElement('div');
      dot.className = 'step-dot';
      dot.textContent = i + 1;
      dot.title = this.steps[i]?.explainer?.title || `Step ${i + 1}`;
      dot.addEventListener('click', () => this.goToStep(i));
      dot.dataset.dot = i;
      this.dotsEl.appendChild(dot);
    }
  }

  updateDots(index) {
    if (!this.dotsEl) return;
    this.dotsEl.querySelectorAll('.step-dot').forEach(dot => {
      const i = parseInt(dot.dataset.dot);
      dot.classList.remove('dot-active', 'dot-done');
      if (i < index)  dot.classList.add('dot-done');
      if (i === index) dot.classList.add('dot-active');
    });
    this.dotsEl.querySelectorAll('.step-dot-connector').forEach(conn => {
      const i = parseInt(conn.dataset.conn);
      conn.classList.toggle('conn-done', i <= index);
    });
  }

  goToStep(index) {
    if (index < 0) index = 0;
    if (index >= this.totalSteps) index = this.totalSteps - 1;
    this.currentStep = index;

    // 1. Gather and reset all nodes and arrows across all steps
    const allNodes = new Set();
    const allArrows = new Set();
    this.steps.forEach(s => {
      s.nodes?.forEach(n => allNodes.add(n));
      s.arrows?.forEach(a => allArrows.add(a));
    });

    allNodes.forEach(nodeId => {
      const el = document.getElementById(nodeId);
      if (el) el.classList.remove('active', 'done');
    });
    allArrows.forEach(arrId => {
      const el = document.getElementById(arrId);
      if (el) el.classList.remove('active');
    });

    // 2. Highlight current step's elements
    const currentStepDef = this.steps[index];
    if (currentStepDef) {
      if (currentStepDef.nodes && currentStepDef.nodes.length > 0) {
        currentStepDef.nodes.forEach((nodeId, idx) => {
          const el = document.getElementById(nodeId);
          if (!el) return;
          if (idx === currentStepDef.nodes.length - 1) {
            el.classList.add('active');
          } else {
            el.classList.add('done');
          }
        });
      }
      currentStepDef.arrows?.forEach(arrId => {
        const el = document.getElementById(arrId);
        if (el) el.classList.add('active');
      });
    }

    // Update label
    if (this.labelEl) {
      this.labelEl.textContent = `Step ${index + 1} of ${this.totalSteps}`;
      this.labelEl.classList.remove('pop');
      void this.labelEl.offsetWidth; // reflow to restart animation
      this.labelEl.classList.add('pop');
      setTimeout(() => this.labelEl.classList.remove('pop'), 300);
    }

    // Update step dots
    this.updateDots(index);

    // Update explainer
    const step = this.steps[index];
    if (step?.explainer && this.explainerEl) {
      const p = step.explainer;
      const numEl = this.explainerEl.querySelector('[id$="-se-num"]');
      const titleEl = this.explainerEl.querySelector('[id$="-se-title"]');
      const descEl = this.explainerEl.querySelector('[id$="-se-desc"]');
      const keyEl = this.explainerEl.querySelector('[id$="-se-key"]');
      if (numEl) numEl.textContent = `Step ${index + 1}`;
      if (titleEl) titleEl.textContent = p.title;
      if (descEl) descEl.textContent = p.desc;
      if (keyEl) keyEl.innerHTML = `<span class="se-key-label">Key insight:</span> ${p.key}`;
      this.explainerEl.style.borderLeftColor = p.color || 'var(--idx)';
    }

    // Special side effects
    step?.sideEffect?.();
  }

  next() {
    if (this.currentStep < this.totalSteps - 1) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.stopPlay();
    }
  }

  prev() {
    this.goToStep(this.currentStep - 1);
  }

  reset() {
    this.stopPlay();
    this.goToStep(0);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stopPlay();
    } else {
      this.startPlay();
    }
  }

  startPlay() {
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.textContent = '⏸ Pause';
      this.playBtn.classList.add('playing');
    }
    if (this.currentStep >= this.totalSteps - 1) {
      this.goToStep(0);
    } else {
      this.next();
    }
    this.playInterval = setInterval(() => {
      if (this.currentStep < this.totalSteps - 1) {
        this.next();
      } else {
        this.stopPlay();
      }
    }, 2000);
  }

  stopPlay() {
    this.isPlaying = false;
    if (this.playBtn) {
      this.playBtn.textContent = '▶ Play';
      this.playBtn.classList.remove('playing');
    }
    clearInterval(this.playInterval);
  }
}

/* ── INDEXING ANIMATION ─────────────────────────────────── */
let idxAnim = null;
if (document.getElementById("idx-explainer")) {
  idxAnim = new StepAnimator({
  labelId: 'idx-step-label',
  explainerId: 'idx-explainer',
  playBtnId: 'idx-play-btn',
  steps: [
    {
      nodes: ['idx-pdf'],
      arrows: [],
      explainer: {
        title: 'Document Input',
        desc: 'Start with any document — PDFs, Word files, web pages, or text files. These are your knowledge sources that you want the AI to be able to query and reason over. The richer and more accurate the content, the better the RAG system performs.',
        key: 'The quality and structure of your source documents directly impacts the quality of RAG responses.',
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['idx-pdf', 'idx-txt'],
      arrows: ['idx-arr1'],
      explainer: {
        title: 'Parsing the Document',
        desc: 'A document parser reads the PDF and extracts all text content. Tools like PyMuPDF, pdfplumber, or LangChain document loaders handle this. The result is plain text — ready for the next processing step.',
        key: 'Clean parsing is critical. Poor parsing = noisy chunks = bad retrieval.',
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['idx-pdf', 'idx-txt', 'idx-chunks'],
      arrows: ['idx-arr1', 'idx-arr2'],
      explainer: {
        title: 'Chunking the Text',
        desc: 'The full text is split into smaller, overlapping chunks (typically 256–1024 tokens each). Overlapping ensures no information is lost at boundaries. Each chunk should be semantically focused — ideally covering one complete idea or topic.',
        key: 'Chunk size is a key hyperparameter. Too large = noisy context. Too small = missing context.',
        color: 'var(--ret)'
      }
    },
    {
      nodes: ['idx-pdf', 'idx-txt', 'idx-chunks', 'idx-emb-model'],
      arrows: ['idx-arr1', 'idx-arr2', 'idx-arr3'],
      explainer: {
        title: 'Embedding Model',
        desc: 'Each chunk is passed through an embedding model (like OpenAI text-embedding-ada-002, BAAI/bge, or Cohere). The model converts the text into a dense numerical vector — a list of hundreds or thousands of floating-point numbers that encode the semantic meaning.',
        key: 'Semantically similar texts produce numerically similar vectors — this is the magic that powers semantic search.',
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['idx-pdf', 'idx-txt', 'idx-chunks', 'idx-emb-model', 'idx-embeddings'],
      arrows: ['idx-arr1', 'idx-arr2', 'idx-arr3', 'idx-arr4'],
      explainer: {
        title: 'Vector Embeddings Created',
        desc: 'Each chunk now has a corresponding embedding vector (e.g. 1536 numbers for OpenAI). These vectors live in a high-dimensional space where proximity = semantic similarity. A question about "car insurance" will be close to chunks about "auto coverage" — even without matching words.',
        key: 'Embeddings capture meaning, not just keywords. This enables true semantic understanding.',
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['idx-pdf', 'idx-txt', 'idx-chunks', 'idx-emb-model', 'idx-embeddings', 'idx-milvus'],
      arrows: ['idx-arr1', 'idx-arr2', 'idx-arr3', 'idx-arr4', 'idx-arr5'],
      explainer: {
        title: 'Stored in Vector Database',
        desc: 'The embeddings (and the original chunk text as metadata) are stored in a vector database like Milvus. These databases are specially optimized for Approximate Nearest Neighbor (ANN) search — finding the most similar vectors to a query vector in milliseconds, even across millions of entries.',
        key: 'Indexing is done ONCE (or when documents change). Retrieval happens in real-time per query.',
        color: 'var(--idx)'
      }
    }
  ]
});
}

/* ── RETRIEVAL ANIMATION ─────────────────────────────────── */
let retAnim = null;
if (document.getElementById("ret-explainer")) {
  retAnim = new StepAnimator({
  labelId: 'ret-step-label',
  explainerId: 'ret-explainer',
  playBtnId: 'ret-play-btn',
  steps: [
    {
      nodes: ['ret-user'],
      arrows: [],
      explainer: {
        title: 'User Asks a Question',
        desc: 'A user types a natural language question. This is the query that drives the entire retrieval process. The system needs to find the most relevant pieces of information from the knowledge base to answer this question accurately.',
        key: 'RAG is query-driven — retrieval happens fresh for every user question, in real time.',
        color: 'var(--gen)'
      }
    },
    {
      nodes: ['ret-user', 'ret-query'],
      arrows: ['ret-arr1'],
      explainer: {
        title: 'The Query',
        desc: 'The user\'s natural language question is captured as a string. Unlike keyword search, this system understands the meaning and intent behind the question — not just the exact words used. So "What are flu symptoms?" and "signs of influenza" would retrieve similar results.',
        key: 'RAG understands semantic intent — meaning matters more than exact word matching.',
        color: 'var(--ret)'
      }
    },
    {
      nodes: ['ret-user', 'ret-query', 'ret-emb-model'],
      arrows: ['ret-arr1', 'ret-arr2'],
      explainer: {
        title: 'Encoding the Query',
        desc: 'The query text is passed through the SAME embedding model that was used during indexing. This is critical — both the document chunks and the query must live in the same vector space for comparison to be meaningful.',
        key: 'Always use the same embedding model for both indexing and retrieval — never mix models!',
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['ret-user', 'ret-query', 'ret-emb-model', 'ret-emb-vec'],
      arrows: ['ret-arr1', 'ret-arr2', 'ret-arr3'],
      explainer: {
        title: 'Query Embedding Vector',
        desc: 'The embedding model outputs a dense vector for the query — for example [0.23, -0.41, 0.87, 0.12, ...] with hundreds to thousands of dimensions. This vector represents the semantic meaning of the query in the same space as the indexed document chunks.',
        key: 'A single vector encodes the full meaning of your question — ready for lightning-fast comparison.',
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['ret-user', 'ret-query', 'ret-emb-model', 'ret-emb-vec', 'ret-milvus'],
      arrows: ['ret-arr1', 'ret-arr2', 'ret-arr3', 'ret-arr4'],
      explainer: {
        title: 'Semantic Search in Milvus',
        desc: 'The query vector is sent to Milvus (the vector database). Milvus computes the cosine similarity between the query vector and ALL stored chunk vectors — finding the mathematically closest ones. This is semantic search: finding meaning, not keywords.',
        key: 'Cosine similarity measures the angle between vectors — small angle = high semantic similarity.',
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['ret-user', 'ret-query', 'ret-emb-model', 'ret-emb-vec', 'ret-milvus', 'ret-chunks'],
      arrows: ['ret-arr1', 'ret-arr2', 'ret-arr3', 'ret-arr4', 'ret-arr5'],
      explainer: {
        title: 'Relevant Chunks Returned',
        desc: 'Milvus returns the Top-K most semantically similar chunks (typically 3–10). These chunks contain the information most relevant to answering the user\'s question. They are passed forward to the Augmentation stage where they become the context for the LLM.',
        key: 'Only the most relevant chunks are retrieved — keeping the context focused and the LLM prompt concise.',
        color: 'var(--gen)'
      }
    }
  ]
});
}

/* ── AUGMENTED ANIMATION ──────────────────────────────── */
let augAnim = null;
if (document.getElementById("aug-explainer")) {
  augAnim = new StepAnimator({
  labelId: 'aug-step-label',
  explainerId: 'aug-explainer',
  playBtnId: 'aug-play-btn',
  steps: [
    {
      nodes: ['aug-chunks'],
      arrows: [],
      explainer: {
        title: 'Retrieved Chunks Ready',
        desc: 'The relevant chunks retrieved from the vector database are now available. These chunks contain the factual information needed to answer the user\'s query accurately. They represent the "knowledge" the LLM will use to construct its response.',
        key: 'The "A" in RAG stands for Augmented — we augment the LLM\'s knowledge with retrieved real-world context.',
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['aug-chunks', 'aug-context', 'aug-uquery'],
      arrows: ['aug-arr1'],
      explainer: {
        title: 'Combining Chunks + Query',
        desc: 'The retrieved chunks are assembled into a Context block, and the user\'s original query is kept alongside. The context might include metadata like source document name and page number to enable citations later. Both pieces are now ready to be merged into a prompt.',
        key: 'Good context assembly adds source metadata (filename, page) so the LLM can provide citations.',
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['aug-chunks', 'aug-context', 'aug-uquery', 'aug-prompt'],
      arrows: ['aug-arr1', 'aug-arr2'],
      explainer: {
        title: 'Final Augmented Prompt',
        desc: 'The context and the user query are combined into a single structured prompt: System instructions + Retrieved context + User question. This complete prompt is what gets sent to the LLM. The system message explicitly instructs the LLM to answer ONLY from the provided context.',
        key: 'Prompt engineering here is crucial — the right instructions prevent hallucinations and keep answers grounded.',
        color: 'var(--aug)'
      }
    }
  ]
});
}

/* ── GENERATION ANIMATION ───────────────────────────────── */
let genAnim = null;
if (document.getElementById("gen-explainer")) {
  genAnim = new StepAnimator({
  labelId: 'gen-step-label',
  explainerId: 'gen-explainer',
  playBtnId: 'gen-play-btn',
  steps: [
    {
      nodes: ['gen-prompt'],
      arrows: [],
      explainer: {
        title: 'Augmented Prompt Ready',
        desc: 'The complete prompt — containing the system message, retrieved context chunks, and user\'s question — is ready to be sent to the Large Language Model. This is the culmination of the indexing and retrieval pipeline.',
        key: 'The LLM doesn\'t need to memorize facts — it reads the context and reasons over it in real time.',
        color: 'var(--gen)'
      }
    },
    {
      nodes: ['gen-prompt', 'gen-llm'],
      arrows: ['gen-arr1'],
      explainer: {
        title: 'LLM Processing',
        desc: 'The prompt is sent to a Large Language Model — GPT-4, Claude, Gemini, or an open-source model like Llama. The LLM reads the entire prompt including the context and generates a response token by token, staying grounded in the provided information.',
        key: 'Any sufficiently capable LLM works. RAG is model-agnostic — swap the LLM without changing the pipeline.',
        color: 'var(--gen)'
      },
      sideEffect: () => {
        document.getElementById('typewriter-demo').style.display = 'block';
        replayTypewriter();
      }
    },
    {
      nodes: ['gen-prompt', 'gen-llm', 'gen-response'],
      arrows: ['gen-arr1', 'gen-arr2'],
      explainer: {
        title: 'Grounded Response Generated',
        desc: 'The LLM outputs a coherent, natural language response based ONLY on the retrieved context. No hallucinations — if the answer isn\'t in the context, the model says "I don\'t know." The response can also include source citations for transparency.',
        key: 'RAG responses are grounded, verifiable, and citable — a massive improvement over base LLM answers.',
        color: 'var(--gen)'
      }
    }
  ]
});
}

/* ── TYPEWRITER EFFECT ──────────────────────────────────── */
const typewriterResponses = [
  "Based on the provided context, the return policy allows returns within **30 days of purchase** with a valid receipt. Refunds are processed within 5–7 business days to your original payment method. Items must be in original condition with all tags attached for a full refund.\n\n📎 Source: policy.pdf, §2.3",
  "According to the context, **photosynthesis** is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. The reaction occurs in the chloroplasts and can be summarized as: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.\n\n📎 Source: biology_textbook.pdf, Chapter 4",
  "Based on the retrieved context, **machine learning** is a subset of artificial intelligence where systems learn patterns from data rather than following explicitly programmed rules. Models are trained on datasets, adjust their parameters to minimize error, and generalize to make predictions on new, unseen data.\n\n📎 Source: ml_intro.pdf, p.12"
];

let selectedQueryIndex = 0;

function selectQuery(btn, index) {
  document.querySelectorAll('.dq-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedQueryIndex = index;
  document.getElementById('demo-response').style.display = 'none';
}

function replayTypewriter() {
  const content = document.getElementById('tw-content');
  if (!content) return;
  const text = typewriterResponses[selectedQueryIndex] || typewriterResponses[0];
  content.innerHTML = '';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  content.appendChild(cursor);

  const interval = setInterval(() => {
    if (i < text.length) {
      cursor.insertAdjacentText('beforebegin', text[i]);
      i++;
    } else {
      clearInterval(interval);
      cursor.remove();
    }
  }, 18);
}

/* ── FULL PIPELINE DEMO ─────────────────────────────────── */
const queries = [
  "What is the return policy?",
  "Explain photosynthesis",
  "How does machine learning work?"
];

const demoResponses = [
  "Based on the retrieved context, the return policy allows returns within **30 days** of purchase with a valid receipt. Refunds are processed within 5–7 business days to the original payment method. Items must be in original condition with all tags attached for a full refund.",
  "According to the retrieved documents, photosynthesis is the process by which green plants convert sunlight, water, and CO₂ into glucose and oxygen, occurring in the chloroplasts of plant cells.",
  "Machine learning, as described in the retrieved context, is a branch of AI where systems learn from data to make predictions or decisions without being explicitly programmed for each task."
];

let demoRunning = false;

async function runFullDemo() {
  if (demoRunning) return;
  demoRunning = true;

  const btn = document.getElementById('demo-run-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Running...';

  const response = document.getElementById('demo-response');
  response.style.display = 'none';

  // Reset all nodes
  const allFpNodes = document.querySelectorAll('.fp-node, .fp-stage');
  allFpNodes.forEach(n => n.classList.remove('active'));

  const stages = [
    { stageId: 'fp-idx', nodes: ['fp-pdf', 'fp-txt', 'fp-chunks2', 'fp-emb', 'fp-db'], delay: 300 },
    { stageId: 'fp-ret', nodes: ['fp-user2', 'fp-query2', 'fp-encode', 'fp-search', 'fp-relchunks'], delay: 300 },
    { stageId: 'fp-aug', nodes: ['fp-chunks3', 'fp-uquery3', 'fp-prompt3'], delay: 400 },
    { stageId: 'fp-gen', nodes: ['fp-prompt4', 'fp-llm2', 'fp-resp'], delay: 400 }
  ];

  for (const stage of stages) {
    document.getElementById(stage.stageId)?.classList.add('active');
    for (const nodeId of stage.nodes) {
      await sleep(stage.delay);
      const nodeEl = document.getElementById(nodeId);
      if (nodeEl) {
        nodeEl.classList.add('active');
        nodeEl.style.transform = 'scale(1.08)';
        setTimeout(() => { nodeEl.style.transform = ''; }, 400);
      }
    }
    await sleep(500);
  }

  // Show response
  await sleep(500);
  const q = queries[selectedQueryIndex];
  const r = demoResponses[selectedQueryIndex];
  document.getElementById('dr-query-display').textContent = '❓ ' + q;
  document.getElementById('dr-time').textContent = `${(Math.random() * 0.8 + 0.4).toFixed(2)}s`;
  document.getElementById('demo-response').style.display = 'block';

  // Typewrite the response
  const drText = document.getElementById('dr-text');
  drText.innerHTML = '';
  let i = 0;
  await new Promise(resolve => {
    const iv = setInterval(() => {
      if (i < r.length) { drText.textContent += r[i]; i++; }
      else { clearInterval(iv); resolve(); }
    }, 16);
  });

  btn.disabled = false;
  btn.textContent = '▶ Run Again';
  demoRunning = false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── VERTICAL ARROWS FIX ────────────────────────────────── */
// Some arrows between rows need vertical styling
document.querySelectorAll('.vertical-arrow').forEach(el => {
  const line = el.querySelector('.arrow-line');
  if (line) {
    line.style.width = '2px';
    line.style.height = '40px';
    line.style.background = 'linear-gradient(180deg, var(--border2), var(--idx))';
    line.style.margin = '0 auto';
  }
  const after = el.querySelector('.arrow-line::after');
});

/* ── PIPELINE CANVAS LAYOUT FOR INDEXING ───────────────── */
// Indexing has a 2-row layout, let's handle it with CSS already defined
// The "top row" has: PDF → TXT → Chunks
// Then up to Embedding Model
// Then down to Embeddings → (left) Milvus

/* ── ACTIVE NAV ON LOAD ─────────────────────────────────── */
window.addEventListener('load', highlightNavLink);

/* ── KEYBOARD NAVIGATION ────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  const focused = document.activeElement;
  if (focused && focused.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    // Next step in whichever section is visible
  }
});

/* ── PARTICLE BACKGROUND (subtle dots) ─────────────────── */
function createParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: rgba(99,102,241,${Math.random() * 0.4 + 0.1});
      border-radius: 50%;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      animation: particleDrift ${Math.random() * 10 + 8}s ease-in-out infinite ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 0;
    `;
    hero.querySelector('.hero-bg').appendChild(p);
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes particleDrift {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
    33% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(1.5); opacity: 0.6; }
    66% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0.8); opacity: 0.2; }
  }
`;
document.head.appendChild(style);
createParticles();

/* ── PIPELINE CANVAS RESPONSIVE HELPERS ─────────────────── */
function adjustLayout() {
  const w = window.innerWidth;
  document.querySelectorAll('.arrow-line').forEach(el => {
    if (w < 480) {
      el.style.width = '2px';
      el.style.height = '28px';
    } else if (w < 768) {
      el.style.width = '30px';
      el.style.height = '2px';
    } else {
      el.style.width = '';
      el.style.height = '';
    }
  });
}
window.addEventListener('resize', adjustLayout);
adjustLayout();

/* ── HOVER TOOLTIP POSITIONING FIX ──────────────────────── */
document.querySelectorAll('.node').forEach(node => {
  const tooltip = node.querySelector('.node-tooltip');
  if (!tooltip) return;
  node.addEventListener('mouseenter', () => {
    const rect = node.getBoundingClientRect();
    if (rect.top < 120) {
      tooltip.style.bottom = 'auto';
      tooltip.style.top = 'calc(100% + 12px)';
    } else {
      tooltip.style.bottom = 'calc(100% + 12px)';
      tooltip.style.top = 'auto';
    }
  });
});

/* ── PROGRESS BAR ───────────────────────────────────────── */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 64px; left: 0; height: 3px; width: 0%;
  background: linear-gradient(90deg, var(--idx), #8b5cf6, var(--ret));
  z-index: 999; transition: width 0.1s; border-radius: 0 2px 2px 0;
`;
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total * 100) + '%';
});

console.log('%c 🤖 RAG from Scratch — Interactive Explainer', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%c Built with ❤️ | Navigate sections and interact with animations!', 'color: #94a3b8; font-size: 12px;');

// ─── TAB SWITCHING LOGIC ───
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
});

// ─── MCP ANIMATION LOGIC ───
let mcpAnim = null;
if (document.getElementById("mcp-explainer")) {
  mcpAnim = new StepAnimator({
  steps: [
    {
      nodes: ['mcp-user'],
      arrows: [],
      explainer: {
        title: "User Request",
        desc: "The user asks Claude a question that requires external information.",
        key: "The LLM cannot access local files or databases on its own.",
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['mcp-user', 'mcp-llm'],
      arrows: ['mcp-arr1'],
      explainer: {
        title: "LLM Reasoning",
        desc: "Claude decides it needs to use a tool to answer the question and formats a tool call.",
        key: "The LLM generates a JSON-formatted tool call instruction.",
        color: 'var(--ret)'
      }
    },
    {
      nodes: ['mcp-user', 'mcp-llm', 'mcp-client'],
      arrows: ['mcp-arr1', 'mcp-arr2'],
      explainer: {
        title: "MCP Client",
        desc: "The host application (like Claude Desktop) acts as the MCP Client, receiving the tool call and routing it.",
        key: "The client manages connections to various MCP servers.",
        color: 'var(--aug)'
      }
    },
    {
      nodes: ['mcp-user', 'mcp-llm', 'mcp-client', 'mcp-server'],
      arrows: ['mcp-arr1', 'mcp-arr2', 'mcp-arr3'],
      explainer: {
        title: "MCP Server",
        desc: "The request is passed via JSON-RPC to the appropriate MCP Server (e.g., a SQLite or GitHub server).",
        key: "Servers are lightweight and can be built in any language.",
        color: 'var(--gen)'
      }
    },
    {
      nodes: ['mcp-user', 'mcp-llm', 'mcp-client', 'mcp-server', 'mcp-data'],
      arrows: ['mcp-arr1', 'mcp-arr2', 'mcp-arr3', 'mcp-arr4'],
      explainer: {
        title: "Tool Execution",
        desc: "The server executes the code locally, fetching the required data, and returns the result back through the chain.",
        key: "Execution happens locally and securely.",
        color: '#f97316'
      }
    }
  ],
  labelId: 'mcp-step-label',
  explainerId: 'mcp-explainer',
  playBtnId: 'mcp-play-btn',
  dotsId: 'mcp-dots'
});
}

// ─── LANGGRAPH ANIMATION ───
let lgAnim = null;
if (document.getElementById("lg-explainer")) {
  lgAnim = new StepAnimator({
  steps: [
    {
      nodes: ['lg-start'],
      arrows: [],
      explainer: {
        title: "Graph Starts",
        desc: "The LangGraph runtime starts execution at the __start__ entrypoint. The initial user message is passed into the graph as input.",
        key: "Every LangGraph app has a designated start node that receives the initial input.",
        color: 'var(--gen)'
      }
    },
    {
      nodes: ['lg-start', 'lg-state'],
      arrows: ['lg-arr1'],
      explainer: {
        title: "State Initialized",
        desc: "A shared State object (TypedDict) is created and populated with the input. Every node in the graph reads from and writes to this same state object.",
        key: "State is the single source of truth — all nodes communicate through it.",
        color: 'var(--ret)'
      }
    },
    {
      nodes: ['lg-start', 'lg-state', 'lg-agent'],
      arrows: ['lg-arr1', 'lg-arr2'],
      explainer: {
        title: "Agent Node (LLM) Runs",
        desc: "The LLM agent node reads the current state (messages), reasons about what to do next, and decides: either call a tool or give a final answer.",
        key: "The agent is just a function: State in → State out. The LLM decides what happens next.",
        color: 'var(--idx)'
      }
    },
    {
      nodes: ['lg-start', 'lg-state', 'lg-agent', 'lg-tools'],
      arrows: ['lg-arr1', 'lg-arr2', 'lg-arr3'],
      explainer: {
        title: "Conditional Edge — Tool Call Detected",
        desc: "A conditional edge function checks if the LLM's response contains tool calls. If yes, it routes to the Tool Node. If no, it routes to __end__ and returns the final answer.",
        key: "Conditional edges are how LangGraph implements if/else branching in agent workflows.",
        color: '#f97316'
      }
    },
    {
      nodes: ['lg-start', 'lg-state', 'lg-agent', 'lg-tools', 'lg-end'],
      arrows: ['lg-arr1', 'lg-arr2', 'lg-arr3', 'lg-arr4'],
      explainer: {
        title: "Tool Executes & Loops Back",
        desc: "The Tool Node executes the requested tool (e.g., search, code runner, database query), adds the result to state, and routes back to the Agent Node — creating a cycle.",
        key: "Cycles are LangGraph's superpower. The agent can tool-call as many times as needed before finishing.",
        color: 'var(--aug)'
      }
    }
  ],
  labelId: 'lg-step-label',
  explainerId: 'lg-explainer',
  playBtnId: 'lg-play-btn',
  dotsId: 'lg-dots'
});
}

/* ── EMBEDDINGS ANIMATION ───────────────────────────────── */
let embAnim = null;
if (document.getElementById("emb-step-label")) {
  embAnim = new StepAnimator({
  labelId: "emb-step-label",
  explainerId: "emb-explainer",
  playBtnId: "emb-play-btn",
  dotsId: "emb-dots",
  steps: [
    {
      nodes: ["emb-word"],
      arrows: [],
      explainer: {
        title: "Raw Text Input",
        desc: "A word or sentence is fed into the system.",
        key: "Computers can't do math on letters, so we must translate.",
        color: "var(--idx)"
      }
    },
    {
      nodes: ["emb-word", "emb-model"],
      arrows: ["emb-arr1"],
      explainer: {
        title: "Embedding Model",
        desc: "The text passes through a neural network (e.g., text-embedding-ada-002) which transforms it into a mathematical representation.",
        key: "The model encodes semantic meaning, not just the characters.",
        color: "var(--aug)"
      }
    },
    {
      nodes: ["emb-word", "emb-model", "emb-vector"],
      arrows: ["emb-arr1", "emb-arr2"],
      explainer: {
        title: "Dense Vector Output",
        desc: "The model outputs a dense vector of floating-point numbers (e.g., 1536 dimensions). This vector represents the meaning in a high-dimensional space.",
        key: "Similar concepts will produce vectors that point in similar directions.",
        color: "var(--gen)"
      }
    }
  ]
});
}

function calculateSimilarity() {
  const sentA = document.getElementById("sent-a").value;
  const sentB = document.getElementById("sent-b").value;
  const scoreVal = document.getElementById("score-val");
  const scoreFill = document.getElementById("score-fill");
  
  if (!sentA || !sentB) {
    scoreVal.textContent = "--";
    scoreFill.style.width = "0%";
    return;
  }
  
  const sim = Math.random() * (0.95 - 0.5) + 0.5;
  const percentage = (sim * 100).toFixed(1);
  scoreVal.textContent = percentage;
  scoreFill.style.width = percentage + "%";
}

/* ═══════════════════════════════════════════════════════════
   MEGA-NAV INTERACTION — v2 (fixed positioning + split nav)
   ═══════════════════════════════════════════════════════════ */
(function initMegaNav() {
  const items = document.querySelectorAll('.mnav-item.has-dd');

  function closeAll() {
    items.forEach(item => {
      item.classList.remove('open');
      const btn = item.querySelector('.mnav-arrow-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      const dd = item.querySelector('.mnav-dropdown');
      if (dd) { dd.style.top = ''; dd.style.left = ''; }
    });
    overlay.classList.remove('active');
  }

  // No JS positioning needed, CSS handles absolute positioning

  // Invisible overlay catches outside clicks
  const overlay = document.createElement('div');
  overlay.className = 'mnav-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', closeAll);

  items.forEach(item => {
    // Toggle via the arrow button only (for mobile/click support)
    const arrowBtn = item.querySelector('.mnav-arrow-btn');
    if (arrowBtn) {
      arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isOpen = item.classList.contains('open');
        closeAll();
        if (!isOpen) {
          item.classList.add('open');
          arrowBtn.setAttribute('aria-expanded', 'true');
          overlay.classList.add('active');
        }
      });
    }
  });

  window.addEventListener('resize', closeAll);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  // Header scroll shadow
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Mobile hamburger ─────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobile-drawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      closeAll();
    });
  }

  // Mobile accordion groups
  document.querySelectorAll('.mobile-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.mobile-group').classList.toggle('open');
    });
  });
})();

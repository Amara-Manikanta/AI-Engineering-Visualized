/* ══════════════════════════════════════════════════════════
   TRANSFORMERS — transformers.js
   All interactive animations for the page
   ══════════════════════════════════════════════════════════ */

/* ── 1. NEURAL NETWORK HERO CANVAS ──────────────────────── */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODES = [];
  const COUNT = 80;

  for (let i = 0; i < COUNT; i++) {
    NODES.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: ['#6366f1','#ec4899','#10b981','#f59e0b'][Math.floor(Math.random()*4)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const dx = NODES[i].x - NODES[j].x;
        const dy = NODES[i].y - NODES[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.25 - dist/480})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(NODES[i].x, NODES[i].y);
          ctx.lineTo(NODES[j].x, NODES[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    NODES.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── 2. GEN AI BOX PARTICLES ─────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('ga-particles');
  if (!container) return;

  function spawnParticle() {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: 4px; height: 4px;
      border-radius: 50%;
      background: ${['#6366f1','#ec4899','#10b981','#f59e0b'][Math.floor(Math.random()*4)]};
      left: ${Math.random()*100}%;
      top: ${Math.random()*100}%;
      animation: particleFade ${1.5 + Math.random()*2}s ease-in-out infinite;
      animation-delay: ${Math.random()*2}s;
      pointer-events: none;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFade {
      0% { opacity:0; transform: scale(0); }
      50% { opacity:1; transform: scale(1.5); }
      100% { opacity:0; transform: scale(0) translateY(-15px); }
    }
  `;
  document.head.appendChild(style);

  setInterval(spawnParticle, 200);
})();

/* ── 3. LM TOKEN PREDICTION DEMO ─────────────────────────── */
(function initLMDemo() {
  const sentences = [
    { tokens: ['The', 'quick', 'brown', 'fox', 'jumps', 'over'], next: 'the', candidates: [{w:'the',p:85},{w:'a',p:8},{w:'his',p:4},{w:'every',p:3}] },
    { tokens: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the'], next: 'lazy', candidates: [{w:'lazy',p:72},{w:'sleeping',p:15},{w:'big',p:8},{w:'old',p:5}] },
    { tokens: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy'], next: 'dog', candidates: [{w:'dog',p:88},{w:'cat',p:7},{w:'fence',p:3},{w:'hound',p:2}] },
    { tokens: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'], next: '.', candidates: [{w:'.',p:91},{w:'!',p:6},{w:',',p:2},{w:'?',p:1}] },
  ];
  let step = 0;

  const sentEl = document.getElementById('lm-demo-sentence');
  const candEl = document.getElementById('lm-candidates');
  const btn = document.getElementById('lm-next-btn');
  if (!sentEl || !btn) return;

  function renderStep(s) {
    const data = sentences[s];

    sentEl.innerHTML = data.tokens.map((t, i) => {
      const cls = i < data.tokens.length - 1 ? 'tok tok-done' : 'tok tok-done';
      return `<span class="${cls}">${t}</span>`;
    }).join('') + `<span class="tok tok-active" id="tok-current">???</span>`;

    candEl.innerHTML = data.candidates.map(c =>
      `<div class="lm-cand" style="--bar-width:${c.p}%"><span>${c.w}</span><strong>${c.p}%</strong></div>`
    ).join('');

    btn.textContent = s < sentences.length - 1 ? 'Next Token →' : 'Restart ↺';
  }

  function advance() {
    const data = sentences[step];
    const activeSpan = document.getElementById('tok-current');
    if (activeSpan) {
      activeSpan.textContent = data.next;
      activeSpan.className = 'tok tok-new';
    }

    setTimeout(() => {
      step = (step + 1) % sentences.length;
      if (step === 0) {
        // Reset
        sentEl.innerHTML = sentences[0].tokens.slice(0, 5).map(t => `<span class="tok tok-done">${t}</span>`).join('') + `<span class="tok tok-active" id="tok-current">over</span>`;
        candEl.innerHTML = sentences[0].candidates.map(c =>
          `<div class="lm-cand" style="--bar-width:${c.p}%"><span>${c.w}</span><strong>${c.p}%</strong></div>`
        ).join('');
        btn.textContent = 'Next Token →';
      } else {
        renderStep(step);
      }
    }, 500);
  }

  renderStep(step);
  btn.addEventListener('click', advance);
})();

/* ── 4. TRANSFORMER ARCHITECTURE STEPS ───────────────────── */
(function initArchDiagram() {
  let currentStep = 1;
  const TOTAL = 5;

  const blockIds = ['arch-block-docs', 'arch-block-enc', 'arch-block-emb', 'arch-block-dec', 'arch-block-prompt'];
  const expIds = ['arch-exp-1', 'arch-exp-2', 'arch-exp-3', 'arch-exp-4', 'arch-exp-5'];
  const stepNum = document.getElementById('arch-step-num');
  const prevBtn = document.getElementById('arch-prev');
  const nextBtn = document.getElementById('arch-next');

  if (!prevBtn || !nextBtn) return;

  function update() {
    blockIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', i + 1 === currentStep);
    });
    expIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', i + 1 !== currentStep);
    });
    if (stepNum) stepNum.textContent = currentStep;
    prevBtn.disabled = currentStep === 1;
    nextBtn.textContent = currentStep === TOTAL ? 'Restart ↺' : 'Next Step →';
  }

  nextBtn.addEventListener('click', () => {
    currentStep = currentStep === TOTAL ? 1 : currentStep + 1;
    update();
  });
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; update(); }
  });

  // Block click
  blockIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { currentStep = i + 1; update(); });
  });

  update();
})();

/* ── 5. TOKENIZATION DEMO ────────────────────────────────── */
(function initTokenizer() {
  const input = document.getElementById('tok-input');
  const btn = document.getElementById('tok-btn');
  const tokOut = document.getElementById('tok-tokens');
  const idsOut = document.getElementById('tok-ids');
  const statsEl = document.getElementById('tok-stats');
  if (!btn) return;

  const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#f43f5e'];

  function tokenize(text) {
    // Simple word + punctuation tokenizer (simulates BPE-style splitting)
    const words = text.match(/\w+|[^\s\w]/g) || [];
    const result = [];
    words.forEach(word => {
      if (word.length > 6) {
        // Split long words into sub-tokens
        const mid = Math.ceil(word.length / 2);
        result.push(word.slice(0, mid), word.slice(mid));
      } else {
        result.push(word);
      }
    });
    return result;
  }

  function render() {
    const text = input.value.trim();
    if (!text) return;
    const tokens = tokenize(text);
    const ids = tokens.map((_, i) => 1000 + i * 37 + Math.floor(Math.random() * 30));

    statsEl.innerHTML = `<strong>${tokens.length}</strong> tokens | <strong>${text.length}</strong> chars | ~<strong>${Math.ceil(tokens.length/0.75)}</strong> chars/token`;

    tokOut.innerHTML = '';
    tokens.forEach((tok, i) => {
      const chip = document.createElement('span');
      chip.className = 'tok-chip-item';
      chip.textContent = tok;
      chip.style.background = COLORS[i % COLORS.length] + '25';
      chip.style.color = COLORS[i % COLORS.length];
      chip.style.border = `1px solid ${COLORS[i % COLORS.length]}60`;
      chip.style.animationDelay = `${i * 0.05}s`;
      tokOut.appendChild(chip);
    });

    idsOut.textContent = 'Token IDs: [' + ids.join(', ') + ']';
  }

  btn.addEventListener('click', render);
  render(); // initial
})();

/* ── 6. EMBEDDING CANVAS ─────────────────────────────────── */
(function initEmbCanvas() {
  const canvas = document.getElementById('emb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Word clusters (2D projection of semantic space)
  const words = [
    // Animals
    { label:'dog', x:0.3, y:0.3, color:'#6366f1' },
    { label:'cat', x:0.35, y:0.25, color:'#6366f1' },
    { label:'puppy', x:0.28, y:0.38, color:'#6366f1' },
    { label:'kitten', x:0.38, y:0.2, color:'#6366f1' },
    // Royalty
    { label:'king', x:0.65, y:0.3, color:'#f59e0b' },
    { label:'queen', x:0.72, y:0.25, color:'#f59e0b' },
    { label:'prince', x:0.68, y:0.38, color:'#f59e0b' },
    // Tech
    { label:'AI', x:0.5, y:0.65, color:'#10b981' },
    { label:'machine', x:0.57, y:0.7, color:'#10b981' },
    { label:'model', x:0.45, y:0.72, color:'#10b981' },
    { label:'data', x:0.52, y:0.78, color:'#10b981' },
    // Food
    { label:'apple', x:0.2, y:0.7, color:'#ec4899' },
    { label:'mango', x:0.15, y:0.77, color:'#ec4899' },
    { label:'orange', x:0.25, y:0.75, color:'#ec4899' },
  ];

  let hoveredWord = null;

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Draw connections within clusters
    const clusters = [
      words.slice(0,4),   // animals
      words.slice(4,7),   // royalty
      words.slice(7,11),  // tech
      words.slice(11,14)  // food
    ];
    clusters.forEach(cluster => {
      cluster.forEach((w1, i) => {
        cluster.slice(i+1).forEach(w2 => {
          ctx.beginPath();
          ctx.strokeStyle = w1.color + '30';
          ctx.lineWidth = 1;
          ctx.moveTo(w1.x * W, w1.y * H);
          ctx.lineTo(w2.x * W, w2.y * H);
          ctx.stroke();
        });
      });
    });

    // Draw words
    words.forEach(w => {
      const x = w.x * W, y = w.y * H;
      const isHovered = hoveredWord === w;
      const r = isHovered ? 8 : 5;

      // Glow
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = w.color + '20';
        ctx.fill();
      }

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = w.color;
      ctx.fill();

      // Label
      ctx.font = isHovered ? 'bold 13px Inter' : '11px Inter';
      ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(w.label, x, y - r - 5);
    });

    // Cluster labels
    const clusterLabels = [
      { label:'Animals', x:0.32, y:0.13, color:'#6366f1' },
      { label:'Royalty', x:0.68, y:0.14, color:'#f59e0b' },
      { label:'Technology', x:0.52, y:0.58, color:'#10b981' },
      { label:'Fruits', x:0.2, y:0.63, color:'#ec4899' },
    ];
    clusterLabels.forEach(l => {
      ctx.font = 'bold 10px Inter';
      ctx.fillStyle = l.color + 'aa';
      ctx.textAlign = 'center';
      ctx.fillText(l.label.toUpperCase(), l.x * W, l.y * H);
    });
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    hoveredWord = words.find(w => {
      const dx = w.x - mx, dy = w.y - my;
      return Math.sqrt(dx*dx + dy*dy) < 0.04;
    }) || null;

    canvas.style.cursor = hoveredWord ? 'pointer' : 'crosshair';
    draw();
  });

  canvas.addEventListener('mouseleave', () => { hoveredWord = null; draw(); });

  draw();
})();

/* ── 7. ATTENTION HEATMAP ────────────────────────────────── */
(function initAttention() {
  const canvas = document.getElementById('attn-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  const N = TOKENS.length;

  // Pre-defined attention patterns (per query token)
  const PATTERNS = [
    [0.9, 0.05, 0.02, 0.01, 0.01, 0.01],   // "The" → mostly self
    [0.05, 0.6,  0.25, 0.04, 0.03, 0.03],  // "cat" → cat, sat (subject-verb)
    [0.03, 0.35, 0.5,  0.06, 0.03, 0.03],  // "sat" → cat, sat
    [0.02, 0.05, 0.1,  0.7,  0.06, 0.07],  // "on" → on, mat (preposition)
    [0.5,  0.02, 0.02, 0.04, 0.4,  0.02],  // "the" → The, the (same word)
    [0.02, 0.1,  0.1,  0.3,  0.05, 0.43],  // "mat" → mat, on
  ];

  let selectedWord = null;
  const size = 400;
  const margin = 60;
  const cellSize = (size - margin) / N;

  function drawGrid(selected) {
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const pattern = selected !== null ? PATTERNS[selected] : null;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = margin + c * cellSize;
        const y = margin + r * cellSize;

        let alpha = 0.08;
        if (pattern) {
          // When a query (row) is selected, show what each query attends to (cols)
          // Actually let me think: row = query, col = key
          // Show the selected word as query → show attention to all other words
          if (r === selected) {
            alpha = Math.pow(pattern[c], 0.6) * 0.85 + 0.05;
          } else {
            alpha = 0.04;
          }
        }

        const hue = selected !== null && r === selected ? 240 : 200;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
      }
    }

    // Axis labels
    ctx.font = '12px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    TOKENS.forEach((t, i) => {
      ctx.fillText(t, margin + i * cellSize + cellSize / 2, margin - 10);
    });

    ctx.textAlign = 'right';
    TOKENS.forEach((t, i) => {
      ctx.fillStyle = i === selected ? '#a5b4fc' : 'rgba(255,255,255,0.6)';
      ctx.font = i === selected ? 'bold 12px Inter' : '12px Inter';
      ctx.fillText(t, margin - 8, margin + i * cellSize + cellSize / 2 + 4);
    });

    // Highlight selected row
    if (selected !== null) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin + selected * cellSize, N * cellSize - 2, cellSize - 2);
    }
  }

  drawGrid(null);

  // Word click handlers
  document.querySelectorAll('.attn-word').forEach((el, i) => {
    el.addEventListener('click', () => {
      if (selectedWord === i) {
        selectedWord = null;
        el.classList.remove('selected');
        drawGrid(null);
        document.getElementById('attn-info').innerHTML = '<p>👆 Click a word above to see its attention pattern.</p>';
      } else {
        document.querySelectorAll('.attn-word').forEach(w => w.classList.remove('selected'));
        el.classList.add('selected');
        selectedWord = i;
        drawGrid(i);

        const topK = PATTERNS[i].map((p, idx) => ({ w: TOKENS[idx], p }))
          .sort((a,b) => b.p - a.p).slice(0, 3);

        document.getElementById('attn-info').innerHTML = `
          <p>When predicting from <strong style="color:#a5b4fc">"${TOKENS[i]}"</strong>, the model attends most to:</p>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            ${topK.map(t => `
              <span style="padding:6px 12px;background:rgba(99,102,241,0.15);border-radius:8px;color:#c7d2fe;font-size:0.85rem;font-weight:600">
                "${t.w}" (${(t.p*100).toFixed(0)}%)
              </span>
            `).join('')}
          </div>
        `;
      }
    });
  });
})();

/* ── 8. SMOOTH SCROLL SUB-NAV ────────────────────────────── */
document.querySelectorAll('.sub-nav a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

console.log('%c🤖 Transformers & Gen AI — AI Engineering Visualized', 'color:#6366f1;font-size:14px;font-weight:bold;');

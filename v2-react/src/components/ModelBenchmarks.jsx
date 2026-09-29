import React, { useState } from 'react';

/* Snapshot of Artificial Analysis leaderboard numbers. One row per model so all
   three metrics (and the trade-off view) stay in sync. Colours are per vendor. */
const VENDOR = {
  Anthropic: '#d97757',
  OpenAI: '#cbd5e1',
  Google: '#10b981',
  xAI: '#8b5cf6',
  Moonshot: '#6366f1',
  Zhipu: '#3b82f6',
  Meta: '#0ea5e9',
  DeepSeek: '#06b6d4',
  MiniMax: '#ec4899',
  NVIDIA: '#84cc16',
};

const MODELS = [
  { name: 'Claude Opus 5 (max)', vendor: 'Anthropic', intel: 61, speed: 56, cost: 2.34 },
  { name: 'Claude Fable 5', vendor: 'Anthropic', intel: 60, speed: 74, cost: 3.15 },
  { name: 'GPT-5.6 Sol (max)', vendor: 'OpenAI', intel: 59, speed: 71, cost: 1.23 },
  { name: 'Kimi K3 (max)', vendor: 'Moonshot', intel: 57, speed: 36, cost: 0.86 },
  { name: 'Grok 4.5 (high)', vendor: 'xAI', intel: 54, speed: 61, cost: 0.36 },
  { name: 'GLM-5.2 (max)', vendor: 'Zhipu', intel: 51, speed: 189, cost: 0.57 },
  { name: 'Muse Spark 1.1 (xhigh)', vendor: 'Meta', intel: 51, speed: 212, cost: 0.29 },
  { name: 'Gemini 3.6 Flash', vendor: 'Google', intel: 50, speed: 215, cost: 0.56 },
  { name: 'DeepSeek V4 Flash', vendor: 'DeepSeek', intel: 50, speed: 113, cost: 0.03 },
  { name: 'MiniMax-M3', vendor: 'MiniMax', intel: 44, speed: 84, cost: 0.14 },
  { name: 'Nemotron 3 Ultra', vendor: 'NVIDIA', intel: 38, speed: 131, cost: 0.38 },
  { name: 'gpt-oss-120b (high)', vendor: 'OpenAI', intel: 24, speed: 199, cost: 0.08 },
];

const METRICS = {
  intel: {
    label: 'Intelligence',
    unit: 'index',
    better: 'Higher is better',
    fmt: (v) => String(v),
    what: 'A composite score that averages many evaluations — reasoning, maths, coding, knowledge and instruction following — into one number.',
    read: 'Treat gaps of 2–3 points as noise. The suffix in brackets is the reasoning-effort setting the model was run at: the same model at "low" effort scores lower but answers faster and cheaper.',
  },
  speed: {
    label: 'Speed',
    unit: 'output tokens / s',
    better: 'Higher is better',
    fmt: (v) => `${v} tok/s`,
    what: 'How many output tokens per second the model streams once it has started answering.',
    read: 'It ignores time-to-first-token and thinking time. A reasoning model can stream fast yet still take a long time to answer because it writes many hidden thinking tokens first. Speed also varies by provider and load.',
  },
  cost: {
    label: 'Cost per task',
    unit: 'USD',
    better: 'Lower is better',
    fmt: (v) => `$${v.toFixed(2)}`,
    what: 'The average dollar cost to run the benchmark tasks: price per token multiplied by how many tokens the model actually used, thinking included.',
    read: 'This is more honest than list price. A model with cheap tokens that thinks for a long time can cost more per task than a pricier model that answers concisely.',
  },
};

function Bars({ metric }) {
  const m = METRICS[metric];
  const sorted = [...MODELS].sort((a, b) => (metric === 'cost' ? a[metric] - b[metric] : b[metric] - a[metric]));
  const max = Math.max(...MODELS.map((d) => d[metric]));
  return (
    <div className="space-y-1.5">
      {sorted.map((d) => (
        <div key={d.name} className="grid grid-cols-[minmax(0,10.5rem)_1fr] sm:grid-cols-[12rem_1fr] items-center gap-3">
          <div className="text-xs text-gray-300 truncate text-right" title={d.name}>
            {d.name}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-5 rounded-r-md transition-all duration-500"
              style={{ width: `${Math.max((d[metric] / max) * 85, 1.5)}%`, backgroundColor: VENDOR[d.vendor] }}
            />
            <span className="text-xs font-mono text-gray-200 whitespace-nowrap">{m.fmt(d[metric])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hand-placed labels where points crowd together: [text-anchor, dx, dy].
const LABEL_AT = {
  'Claude Opus 5 (max)': ['end', -9, -8],
  'Claude Fable 5': ['end', -9, 15],
  'GPT-5.6 Sol (max)': ['end', -10, 4],
  'Muse Spark 1.1 (xhigh)': ['end', -9, -8],
  'GLM-5.2 (max)': ['start', 9, -5],
  'Gemini 3.6 Flash': ['start', 9, 12],
  'DeepSeek V4 Flash': ['start', 4, 18],
};

/* Intelligence vs cost on a log axis: the useful models sit up and to the left. */
function TradeOff() {
  const W = 640, H = 360, L = 48, R = 20, T = 20, B = 44;
  const lo = Math.log10(0.02), hi = Math.log10(5);
  const x = (c) => L + ((Math.log10(c) - lo) / (hi - lo)) * (W - L - R);
  const y = (v) => T + (1 - (v - 20) / (65 - 20)) * (H - T - B);
  // A model is on the frontier if nothing else is both cheaper and smarter.
  const frontier = new Set(
    MODELS.filter((a) => !MODELS.some((b) => b !== a && b.cost <= a.cost && b.intel >= a.intel && (b.cost < a.cost || b.intel > a.intel))).map((d) => d.name)
  );
  const front = MODELS.filter((d) => frontier.has(d.name)).sort((a, b) => a.cost - b.cost);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Intelligence against cost per task">
        {[0.03, 0.1, 0.3, 1, 3].map((c) => (
          <g key={c}>
            <line x1={x(c)} x2={x(c)} y1={T} y2={H - B} stroke="#ffffff10" />
            <text x={x(c)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="#9ca3af">${c}</text>
          </g>
        ))}
        {[30, 40, 50, 60].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#ffffff10" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{v}</text>
          </g>
        ))}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#9ca3af">Cost per task (USD, log scale) →</text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" fontSize="11" fill="#9ca3af" transform={`rotate(-90 14 ${(T + H - B) / 2})`}>Intelligence →</text>
        <polyline
          points={front.map((d) => `${x(d.cost)},${y(d.intel)}`).join(' ')}
          fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 4"
        />
        {MODELS.map((d) => {
          const cx = x(d.cost), cy = y(d.intel);
          const [anchor, dx, dy] = LABEL_AT[d.name] ?? ['start', 9, 4];
          return (
            <g key={d.name}>
              <circle cx={cx} cy={cy} r={frontier.has(d.name) ? 6 : 4.5} fill={VENDOR[d.vendor]} />
              <text x={cx + dx} y={cy + dy} textAnchor={anchor} fontSize="10.5" fill="#d1d5db">{d.name}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-gray-400 leading-relaxed mt-2">
        The dashed line is the <strong className="text-gray-200">cost–quality frontier</strong>: models that nothing else beats on
        both axes at once. Everything below the line is dominated — some other model is at least as smart for less money.
      </p>
    </div>
  );
}

export default function ModelBenchmarks() {
  const [view, setView] = useState('intel');
  const m = METRICS[view];
  const tabs = [...Object.entries(METRICS).map(([k, v]) => [k, v.label]), ['trade', 'Intelligence vs cost']];

  return (
    <div className="mt-8 border border-white/10 bg-[#111111] p-5 sm:p-6 rounded-xl text-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h3 className="text-xl font-bold text-white m-0">Performance Benchmarks</h3>
        <span className="text-xs text-gray-500">Snapshot — model names may trail the lineups above</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5" role="tablist">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={view === k}
            onClick={() => setView(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              view === k ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-100' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'trade' ? (
        <TradeOff />
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">{m.unit} · {m.better}</p>
          <Bars metric={view} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[0.625rem] uppercase tracking-wide text-indigo-300 mb-1">What it measures</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{m.what}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[0.625rem] uppercase tracking-wide text-amber-300 mb-1">How to read it</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{m.read}</p>
            </div>
          </div>
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
        {Object.entries(VENDOR).map(([v, c]) => (
          <span key={v} className="flex items-center gap-1.5 text-[0.6875rem] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
            {v}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-800 pt-3 text-xs text-gray-400">
        Source and latest numbers:{' '}
        <a href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
          artificialanalysis.ai
        </a>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, fmt } from "../lib/stats";
import useReducedMotion from "../lib/useReducedMotion";

export const SEARCH_KEYWORDS = [
  "reinforcement learning", "RL", "agent", "environment", "reward", "policy", "value function", "Q-value",
  "Q-learning", "Bellman equation", "exploration vs exploitation", "epsilon-greedy", "multi-armed bandit",
  "discount factor", "gamma", "Markov decision process", "MDP", "policy gradient", "REINFORCE", "actor-critic",
  "PPO", "proximal policy optimization", "clipped objective", "DQN", "gridworld", "reward hacking", "gymnasium",
];

/* ---------------------------------------------------------------------------
   The agent–environment loop, cycling through its three beats.
--------------------------------------------------------------------------- */

const LOOP = [
  { t: "observe", d: "The agent sees state sₜ — here, its square on the grid." },
  { t: "act", d: "Its policy π picks an action aₜ — say, move right." },
  { t: "feedback", d: "The environment returns reward rₜ₊₁ and the next state sₜ₊₁. Repeat." },
];

function AgentLoop() {
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 1400);
    return () => clearInterval(id);
  }, [reduced]);
  const hot = (i) => (phase === i ? 1 : 0.25);
  return (
    <Panel tone="indigo" title="The loop every RL problem shares">
      <svg viewBox="0 0 360 150" className="w-full h-auto block max-w-xl mx-auto">
        <defs>
          <marker id="rl-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#a5b4fc" />
          </marker>
        </defs>
        <rect x="14" y="45" width="100" height="60" rx="12" fill="rgba(129,140,248,0.15)" stroke="#818cf8" strokeWidth="2" />
        <text x="64" y="72" fill="#e0e7ff" fontSize="13" textAnchor="middle" fontWeight="700">Agent</text>
        <text x="64" y="90" fill="#a5b4fc" fontSize="11" textAnchor="middle">policy π</text>
        <rect x="246" y="45" width="100" height="60" rx="12" fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth="2" />
        <text x="296" y="72" fill="#d1fae5" fontSize="13" textAnchor="middle" fontWeight="700">Environment</text>
        <text x="296" y="90" fill="#6ee7b7" fontSize="11" textAnchor="middle">world rules</text>
        <path d="M114,58 C170,20 190,20 246,58" fill="none" stroke="#a5b4fc" strokeWidth="2.5" markerEnd="url(#rl-arrow)" opacity={hot(1)} style={{ transition: "opacity 300ms" }} />
        <text x="180" y="22" fill="#c7d2fe" fontSize="12" textAnchor="middle" opacity={hot(1)}>action aₜ</text>
        <path d="M246,92 C190,130 170,130 114,92" fill="none" stroke="#a5b4fc" strokeWidth="2.5" markerEnd="url(#rl-arrow)" opacity={Math.max(hot(2), hot(0))} style={{ transition: "opacity 300ms" }} />
        <text x="180" y="140" fill="#c7d2fe" fontSize="12" textAnchor="middle" opacity={Math.max(hot(2), hot(0))}>state sₜ₊₁ , reward rₜ₊₁</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {LOOP.map((l, i) => (
          <button key={l.t} onClick={() => setPhase(i)} aria-pressed={phase === i} className={`text-left rounded-lg border p-2 text-xs transition-colors ${phase === i ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-100" : "border-white/10 bg-white/5 text-gray-500"}`}>
            <div className="font-semibold uppercase tracking-wide text-[0.6875rem] mb-0.5">{l.t}</div>
            {l.d}
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Multi-armed bandit: four slot machines, ε-greedy.
--------------------------------------------------------------------------- */

const ARMS = [0.25, 0.45, 0.62, 0.38];
const BEST = Math.max(...ARMS);

function runBandit(eps, steps, r) {
  const q = [0, 0, 0, 0];
  const n = [0, 0, 0, 0];
  let total = 0;
  for (let t = 0; t < steps; t++) {
    let a;
    if (r() < eps) a = Math.floor(r() * 4);
    else {
      const m = Math.max(...q);
      const best = [0, 1, 2, 3].filter((i) => q[i] === m);
      a = best[Math.floor(r() * best.length)];
    }
    const rew = r() < ARMS[a] ? 1 : 0;
    n[a] += 1;
    q[a] += (rew - q[a]) / n[a];
    total += rew;
  }
  return total / steps;
}

function BanditLab() {
  const [eps, setEps] = useState(0.1);
  const [st, setSt] = useState({ q: [0, 0, 0, 0], n: [0, 0, 0, 0], total: 0, t: 0, hist: [] });
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [compare, setCompare] = useState(null);
  const r = useRef(rng(9));

  const pull = (k, forced) =>
    setSt((s) => {
      const q = [...s.q];
      const n = [...s.n];
      let total = s.total;
      const hist = [...s.hist];
      for (let i = 0; i < k; i++) {
        let a = forced;
        if (a === undefined) {
          if (r.current() < eps) a = Math.floor(r.current() * 4);
          else {
            const m = Math.max(...q);
            const best = [0, 1, 2, 3].filter((j) => q[j] === m);
            a = best[Math.floor(r.current() * best.length)];
          }
        }
        const rew = r.current() < ARMS[a] ? 1 : 0;
        n[a] += 1;
        q[a] += (rew - q[a]) / n[a];
        total += rew;
        hist.push((s.t + i + 1) * BEST - total);
      }
      return { q, n, total, t: s.t + k, hist };
    });

  useEffect(() => {
    if (!playing) return undefined;
    if (st.t >= 1000) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => pull(10), 30);
    return () => clearTimeout(id);
  }, [playing, st.t]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setPlaying(false);
    r.current = rng(Math.floor(Math.random() * 1e6));
    setSt({ q: [0, 0, 0, 0], n: [0, 0, 0, 0], total: 0, t: 0, hist: [] });
  };

  const runCompare = () => {
    const rr = rng(123);
    setCompare([0, 0.01, 0.1, 0.3].map((e) => ({ e, avg: Array.from({ length: 200 }, () => runBandit(e, 1000, rr)).reduce((a, b) => a + b, 0) / 200 })));
  };

  const hmax = Math.max(10, ...st.hist);
  const colors = ["#818cf8", "#60a5fa", "#34d399", "#fbbf24"];

  return (
    <Panel
      tone="amber"
      title="Four slot machines. Which one pays best?"
      actions={
        <>
          <Button tone="amber" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "▶ Let the agent play"}</Button>
          <Button tone="amber" onClick={reset}>Reset</Button>
          <Button tone="amber" onClick={() => setReveal((v) => !v)}>{reveal ? "Hide" : "Reveal"} true odds</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Each machine pays 1 with a hidden probability. The agent keeps a running average of what each has paid and,
        with probability ε, tries a random machine instead of the best-looking one. You can also pull an arm yourself.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {ARMS.map((p, i) => (
          <button key={i} onClick={() => pull(1, i)} className="rounded-xl border border-white/10 bg-black/40 p-3 text-left hover:bg-white/5">
            <div className="text-xs text-gray-500 mb-1">Machine {i + 1} · pulled {st.n[i]}×</div>
            <div className="h-16 relative rounded bg-white/5 overflow-hidden mb-1">
              <div className="absolute bottom-0 left-0 right-0" style={{ height: `${st.q[i] * 100}%`, background: colors[i], opacity: 0.7, transition: "height 150ms" }} />
              {reveal && <div className="absolute left-0 right-0 border-t-2 border-dashed border-pink-400" style={{ bottom: `${p * 100}%` }} />}
            </div>
            <div className="font-mono text-sm text-white">est. {st.q[i].toFixed(2)}</div>
            {reveal && <div className="font-mono text-[0.6875rem] text-pink-300">true {p.toFixed(2)}</div>}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end mb-4">
        <Slider tone="amber" label="Exploration rate ε" value={eps} min={0} max={0.5} step={0.01} onChange={setEps} format={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-3 gap-2 sm:w-80">
          <Metric label="Pulls" value={st.t} />
          <Metric label="Reward / pull" value={st.t ? fmt(st.total / st.t, 3) : "—"} tone="emerald" sub={`best possible ${BEST}`} />
          <Metric label="Regret" value={fmt(st.t * BEST - st.total, 0)} tone="rose" sub="vs always best" />
        </div>
      </div>
      <svg viewBox="0 0 360 70" className="w-full h-auto block rounded-lg bg-black/40 border border-white/10 mb-4">
        {st.hist.length > 1 && (
          <path d={st.hist.map((h, i) => `${i ? "L" : "M"}${(4 + (i / 1000) * 352).toFixed(1)},${(64 - (h / hmax) * 56).toFixed(1)}`).join("")} fill="none" stroke="#fb7185" strokeWidth="1.8" />
        )}
        <text x="6" y="12" fill="#6b7280" fontSize="11">cumulative regret over 1,000 pulls</text>
      </svg>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Button tone="amber" onClick={runCompare}>Compare ε over 200 runs</Button>
        {compare && (
          <div className="flex flex-wrap gap-2">
            {compare.map((c) => (
              <span key={c.e} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-300">
                ε={c.e}: <span className="text-emerald-300">{c.avg.toFixed(3)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        With ε = 0 the agent is purely greedy: it locks onto the first machine that pays and may never discover a
        better one. Too much exploration wastes pulls on machines it already knows are bad. The comparison shows
        average reward per pull over 1,000 pulls; a small ε wins. Every RL agent faces this trade-off.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Tabular Q-learning on a 5×5 gridworld.
--------------------------------------------------------------------------- */

const GW = 5;
const START = [0, 4];
const GOAL = [4, 0];
const PIT = [3, 1];
const WALLS = ["1,1", "1,2", "3,3"];
const ACTIONS = [
  { d: [0, -1], s: "↑", n: "up" },
  { d: [1, 0], s: "→", n: "right" },
  { d: [0, 1], s: "↓", n: "down" },
  { d: [-1, 0], s: "←", n: "left" },
];
const key = (c, r) => `${c},${r}`;
const isGoal = (c, r) => c === GOAL[0] && r === GOAL[1];
const isPit = (c, r) => c === PIT[0] && r === PIT[1];
const blankQ = () => Object.fromEntries(Array.from({ length: GW * GW }, (_, i) => [key(i % GW, Math.floor(i / GW)), [0, 0, 0, 0]]));

function stepEnv([c, r], a) {
  const [dc, dr] = ACTIONS[a].d;
  let nc = c + dc;
  let nr = r + dr;
  if (nc < 0 || nc >= GW || nr < 0 || nr >= GW || WALLS.includes(key(nc, nr))) {
    nc = c;
    nr = r;
  }
  if (isGoal(nc, nr)) return { s: [nc, nr], rew: 10, done: true };
  if (isPit(nc, nr)) return { s: [nc, nr], rew: -10, done: true };
  return { s: [nc, nr], rew: -0.1, done: false };
}

function GridLab() {
  const [gamma, setGamma] = useState(0.9);
  const [eps, setEps] = useState(0.2);
  const alpha = 0.5;
  const [Q, setQ] = useState(blankQ);
  const [episodes, setEpisodes] = useState(0);
  const [agent, setAgent] = useState(START);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastEp, setLastEp] = useState(null);
  const [watching, setWatching] = useState(false);
  const r = useRef(rng(77));
  const live = useRef({ s: START, steps: 0, ret: 0 });

  const choose = (q, s) => {
    if (r.current() < eps) return Math.floor(r.current() * 4);
    const vals = q[key(...s)];
    const m = Math.max(...vals);
    const best = [0, 1, 2, 3].filter((i) => vals[i] === m);
    return best[Math.floor(r.current() * best.length)];
  };

  // One Q-learning update; mutates q in place and reports the arithmetic.
  const learn = (q, s, a) => {
    const { s: s2, rew, done } = stepEnv(s, a);
    const old = q[key(...s)][a];
    const next = done ? 0 : Math.max(...q[key(...s2)]);
    const target = rew + gamma * next;
    q[key(...s)][a] = old + alpha * (target - old);
    return { s2, rew, done, info: { s, a, old, rew, next, nw: q[key(...s)][a] } };
  };

  const trainMany = (k) => {
    const q = JSON.parse(JSON.stringify(Q));
    let info = null;
    let steps = 0;
    let ret = 0;
    for (let e = 0; e < k; e++) {
      let s = START;
      steps = 0;
      ret = 0;
      for (let t = 0; t < 60; t++) {
        const a = choose(q, s);
        const res = learn(q, s, a);
        info = res.info;
        steps++;
        ret += res.rew;
        s = res.s2;
        if (res.done) break;
      }
    }
    setQ(q);
    setEpisodes((n) => n + k);
    setLastUpdate(info);
    setLastEp({ steps, ret });
    setAgent(START);
  };

  useEffect(() => {
    if (!watching) return undefined;
    const id = setTimeout(() => {
      const q = JSON.parse(JSON.stringify(Q));
      const a = choose(q, live.current.s);
      const res = learn(q, live.current.s, a);
      live.current = { s: res.s2, steps: live.current.steps + 1, ret: live.current.ret + res.rew };
      setQ(q);
      setAgent(res.s2);
      setLastUpdate(res.info);
      if (res.done || live.current.steps >= 60) {
        setWatching(false);
        setEpisodes((n) => n + 1);
        setLastEp({ steps: live.current.steps, ret: live.current.ret });
      }
    }, 160);
    return () => clearTimeout(id);
  }, [watching, Q]); // eslint-disable-line react-hooks/exhaustive-deps

  const watch = () => {
    live.current = { s: START, steps: 0, ret: 0 };
    setAgent(START);
    setWatching(true);
  };
  const reset = () => {
    setWatching(false);
    setQ(blankQ());
    setEpisodes(0);
    setAgent(START);
    setLastUpdate(null);
    setLastEp(null);
    r.current = rng(77);
  };

  // Greedy path from the start, to show what has been learned.
  const path = useMemo(() => {
    const out = [];
    let s = START;
    for (let i = 0; i < 16; i++) {
      const vals = Q[key(...s)];
      if (vals.every((v) => v === 0)) break;
      const a = vals.indexOf(Math.max(...vals));
      const { s: s2, done } = stepEnv(s, a);
      out.push(s2);
      s = s2;
      if (done) break;
    }
    return out;
  }, [Q]);
  const reached = path.length && isGoal(...path[path.length - 1]);

  const C = 64;
  const shade = (v) => (v > 0 ? `rgba(52,211,153,${Math.min(0.75, v / 12)})` : v < 0 ? `rgba(251,113,133,${Math.min(0.75, -v / 6)})` : "rgba(255,255,255,0.03)");

  return (
    <Panel
      tone="emerald"
      title="Q-learning finds its way through a gridworld"
      actions={
        <>
          <Button tone="emerald" onClick={watch} disabled={watching}>▶ Watch 1 episode</Button>
          <Button tone="emerald" onClick={() => trainMany(50)} disabled={watching}>Train 50 episodes</Button>
          <Button tone="emerald" onClick={reset}>Reset</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Start bottom-left, reach the flag (+10), avoid the pit (−10). Every move costs −0.1. The agent knows nothing
        about the map; it only sees rewards. Cell colour is the best Q-value there; arrows are the action it currently
        rates highest.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-5 items-start">
        <svg viewBox={`0 0 ${GW * C} ${GW * C}`} className="w-full h-auto block max-w-[340px] rounded-xl border border-white/10">
          {Array.from({ length: GW * GW }, (_, i) => {
            const c = i % GW;
            const rr = Math.floor(i / GW);
            const k = key(c, rr);
            const wall = WALLS.includes(k);
            const vals = Q[k];
            const v = Math.max(...vals);
            const best = vals.indexOf(v);
            const known = !vals.every((x) => x === 0);
            return (
              <g key={k}>
                <rect x={c * C + 1} y={rr * C + 1} width={C - 2} height={C - 2} rx="6" fill={wall ? "#1f2937" : isGoal(c, rr) ? "rgba(52,211,153,0.35)" : isPit(c, rr) ? "rgba(251,113,133,0.35)" : shade(v)} stroke="rgba(255,255,255,0.08)" />
                {isGoal(c, rr) && <text x={c * C + C / 2} y={rr * C + C / 2 + 8} fontSize="24" textAnchor="middle">🏁</text>}
                {isPit(c, rr) && <text x={c * C + C / 2} y={rr * C + C / 2 + 8} fontSize="24" textAnchor="middle">🕳️</text>}
                {!wall && !isGoal(c, rr) && !isPit(c, rr) && known && (
                  <>
                    <text x={c * C + C / 2} y={rr * C + C / 2 + 2} fill="#e5e7eb" fontSize="20" textAnchor="middle">{ACTIONS[best].s}</text>
                    <text x={c * C + C / 2} y={rr * C + C - 8} fill="#9ca3af" fontSize="11" textAnchor="middle">{v.toFixed(1)}</text>
                  </>
                )}
              </g>
            );
          })}
          {reached && path.map(([c, rr], i) => <circle key={i} cx={c * C + C / 2} cy={rr * C + 12} r="3" fill="#fbbf24" />)}
          <circle cx={agent[0] * C + C / 2} cy={agent[1] * C + C / 2} r="13" fill="#818cf8" stroke="#e0e7ff" strokeWidth="2" style={{ transition: "cx 140ms, cy 140ms" }} />
        </svg>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider tone="emerald" label="Discount γ" value={gamma} min={0.5} max={0.99} step={0.01} onChange={setGamma} format={(v) => v.toFixed(2)} />
            <Slider tone="emerald" label="Exploration ε" value={eps} min={0} max={0.6} step={0.05} onChange={setEps} format={(v) => v.toFixed(2)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Episodes" value={episodes} />
            <Metric label="Last episode" value={lastEp ? `${lastEp.steps} steps` : "—"} sub={lastEp ? `return ${fmt(lastEp.ret, 1)}` : ""} />
            <Metric label="Greedy path" value={reached ? `${path.length} moves` : "not yet"} tone={reached ? "emerald" : "rose"} sub="yellow dots" />
          </div>
          <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs leading-relaxed">
            <div className="text-gray-500 mb-1">Q(s,a) ← Q(s,a) + α [ r + γ·max Q(s′,·) − Q(s,a) ]</div>
            {lastUpdate ? (
              <div className="text-gray-200 break-words">
                Q(({lastUpdate.s.join(",")}), {ACTIONS[lastUpdate.a].n}) = {fmt(lastUpdate.old)} + 0.5 × [{fmt(lastUpdate.rew, 1)} + {gamma.toFixed(2)} × {fmt(lastUpdate.next)} − {fmt(lastUpdate.old)}] ={" "}
                <span className="text-emerald-300">{fmt(lastUpdate.nw)}</span>
              </div>
            ) : (
              <div className="text-gray-500">No updates yet — watch an episode.</div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The first episodes are random wandering; reward information only exists next to the flag. Each episode it
        leaks one step further back, because every update borrows the value of the next square — that is the Bellman
        equation at work. Within about 20 episodes the arrows form a route and the greedy path appears — 8 moves, the
        shortest possible. Q-learning is{" "}
        <em>off-policy</em>: it learns the best route even while its ε-greedy behaviour still takes random steps.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Discounting: how much a reward t steps away is worth now.
--------------------------------------------------------------------------- */

function DiscountLab() {
  const [g, setG] = useState(0.9);
  const T = 30;
  return (
    <Panel tone="blue" title="How much is a future reward worth today?">
      <div className="flex items-end gap-[3px] h-28 mb-2">
        {Array.from({ length: T }, (_, t) => (
          <div key={t} className="flex-1 bg-blue-500/60 rounded-t" style={{ height: `${Math.pow(g, t) * 100}%`, transition: "height 200ms" }} title={`t=${t}: ${Math.pow(g, t).toFixed(3)}`} />
        ))}
      </div>
      <div className="flex justify-between text-[0.6875rem] text-gray-500 mb-4"><span>now</span><span>30 steps away</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
        <Slider tone="blue" label="Discount factor γ" value={g} min={0} max={0.99} step={0.01} onChange={setG} format={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2 sm:w-64">
          <Metric label="Worth of +1 at t=10" value={fmt(Math.pow(g, 10), 3)} tone="blue" />
          <Metric label="Effective horizon" value={g < 1 ? `~${fmt(1 / (1 - g), 0)} steps` : "∞"} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The agent maximises the return G = r₁ + γr₂ + γ²r₃ + …. γ near 0 makes it short-sighted; near 1 it plans far
        ahead but learns more slowly, because credit has to travel further back. 1 / (1 − γ) is a handy estimate of
        how many steps it effectively looks ahead.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   PPO's clipped objective as a function of the probability ratio.
--------------------------------------------------------------------------- */

function ClipLab() {
  const [eps, setEps] = useState(0.2);
  const [sign, setSign] = useState(1);
  const W = 360;
  const H = 180;
  const sx = (r) => 30 + (r / 2) * (W - 44);
  const sy = (v) => H / 2 - v * 38;
  const L = (r) => Math.min(r * sign, Math.max(1 - eps, Math.min(1 + eps, r)) * sign);
  let d = "";
  let raw = "";
  for (let i = 0; i <= 100; i++) {
    const r = (i / 100) * 2;
    d += `${i ? "L" : "M"}${sx(r).toFixed(1)},${sy(L(r)).toFixed(1)}`;
    raw += `${i ? "L" : "M"}${sx(r).toFixed(1)},${sy(r * sign).toFixed(1)}`;
  }
  return (
    <Panel tone="purple" title="PPO's clipped objective">
      <div className="mb-4">
        <Segmented tone="purple" value={sign} onChange={setSign} options={[{ v: 1, label: "Action was better than expected (A > 0)" }, { v: -1, label: "Worse than expected (A < 0)" }]} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <rect x={sx(1 - eps)} y="8" width={sx(1 + eps) - sx(1 - eps)} height={H - 30} fill="rgba(167,139,250,0.12)" />
        <line x1="30" y1={sy(0)} x2={W - 14} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
        <line x1={sx(1)} y1="8" x2={sx(1)} y2={H - 22} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
        <path d={raw} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={d} fill="none" stroke="#c4b5fd" strokeWidth="3" />
        {[0, 0.5, 1, 1.5, 2].map((t) => (
          <text key={t} x={sx(t)} y={H - 6} fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
        ))}
        <text x={W - 14} y={H - 22} fill="#9ca3af" fontSize="11" textAnchor="end">ratio r = π_new / π_old</text>
      </svg>
      <Slider tone="purple" label="Clip range ε" value={eps} min={0.05} max={0.5} step={0.01} onChange={setEps} format={(v) => v.toFixed(2)} />
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Dashed grey: the plain policy-gradient objective r·A, which rewards pushing the ratio as far as it will go.
        Purple: PPO's min(r·A, clip(r, 1−ε, 1+ε)·A). Once the new policy has moved more than ε from the old one in the
        helpful direction, the objective goes flat — no gradient, no incentive to move further in one update. That
        single trick keeps training stable, and it is the same PPO used to fine-tune language models in{" "}
        <a href="#/ml/rlhf" className="text-blue-400 hover:underline">RLHF</a>.
      </p>
    </Panel>
  );
}

const FAMILIES = [
  ["Value-based", "Learn Q(s, a), act greedily on it.", "Q-learning, SARSA, DQN (Atari from pixels, 2015)", "emerald"],
  ["Policy gradient", "Learn the policy π(a|s) directly; push up actions that led to high return.", "REINFORCE", "indigo"],
  ["Actor–critic", "A policy (actor) plus a value estimate (critic) that reduces the noise in its updates.", "A2C, PPO, SAC", "purple"],
  ["Model-based", "Learn or use a model of the environment and plan with it.", "AlphaZero, MuZero, Dreamer", "amber"],
];

export default function MlReinforcement() {
  const toc = [
    { label: "Learning From Reward", hash: "idea" },
    { label: "The Agent–Environment Loop", hash: "loop" },
    { label: "Explore vs Exploit", hash: "bandit" },
    { label: "Q-learning (interactive)", hash: "qlearning" },
    { label: "Discounting", hash: "discount" },
    { label: "Algorithm Families", hash: "families" },
    { label: "Policy Gradients & PPO", hash: "ppo" },
    { label: "Where RL Is Used", hash: "uses" },
    { label: "What Makes RL Hard", hash: "hard" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Reinforcement Learning"
      intro="Learning by trial and error. No labelled answers — an agent acts, the world responds with rewards, and over many attempts it learns which actions pay off in the long run."
      toc={toc}
    >
      <Section id="idea" title="Learning From Reward" lead="Supervised learning is told the right answer for every example. Reinforcement learning is only told how well it did — often much later — and must work out which of its actions deserve the credit.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Supervised" tone="blue"><p>Input → correct label. "This image is a cat."</p></Card>
          <Card title="Unsupervised" tone="purple"><p>Input only → find structure. "These customers form three groups."</p></Card>
          <Card title="Reinforcement" tone="emerald"><p>Action → reward, sometimes delayed. "You won the game, 80 moves later."</p></Card>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["State s", "What the agent observes now."],
            ["Action a", "What it can do."],
            ["Reward r", "A number saying how good that step was."],
            ["Policy π", "Its strategy: state → action (or probabilities)."],
            ["Return G", "Total future reward, discounted by γ."],
            ["Value V(s)", "Expected return from a state, following π."],
            ["Q-value Q(s,a)", "Expected return from taking a in s, then following π."],
            ["Episode", "One run from start to a terminal state."],
          ].map(([t, d]) => (
            <div key={t} className="p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-white font-mono">{t}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="loop" title="The Agent–Environment Loop" lead="Formally this is a Markov decision process (MDP): the next state and reward depend only on the current state and action, not on the full history.">
        <AgentLoop />
      </Section>

      <Section id="bandit" title="Explore or Exploit?" lead="The simplest RL problem has one state and several actions. It already contains the central dilemma: use what you know, or try something that might be better.">
        <BanditLab />
      </Section>

      <Section id="qlearning" title="Q-learning" lead="Q-learning learns the value of every action in every state from experience, using one rule: nudge Q(s,a) toward the reward you just got plus the discounted value of where you landed.">
        <GridLab />
      </Section>

      <Section id="discount" title="Discounting the Future">
        <DiscountLab />
      </Section>

      <Section id="families" title="Algorithm Families">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {FAMILIES.map(([t, d, ex, tone]) => (
            <Card key={t} title={t} tone={tone}>
              <p>{d}</p>
              <p className="text-xs text-gray-400">Examples: {ex}</p>
            </Card>
          ))}
        </div>
        <Note tone="indigo">
          <strong>On-policy vs off-policy.</strong> On-policy methods (SARSA, PPO) learn only from data produced by the
          current policy, so old experience is thrown away after each update. Off-policy methods (Q-learning, DQN, SAC)
          can learn from any experience, including a replay buffer of old episodes — more data-efficient, harder to
          stabilise.
        </Note>
      </Section>

      <Section id="ppo" title="Policy Gradients and PPO" lead="Instead of learning values and acting greedily, learn the policy directly. The policy-gradient theorem says: increase the log-probability of each action in proportion to its advantage — how much better it turned out than expected.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 text-center mb-5 overflow-x-auto">
          ∇J(θ) = E[ ∇ log π<sub>θ</sub>(a|s) · A(s, a) ]
        </div>
        <ClipLab />
      </Section>

      <Section id="uses" title="Where RL Is Used">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Games" tone="indigo"><p>DeepMind's AlphaGo beat Lee Sedol 4–1 at Go in 2016; AlphaZero then learned chess, shogi and Go from self-play alone.</p></Card>
          <Card title="LLM post-training" tone="emerald"><p>RLHF, DPO and GRPO turn a text predictor into a helpful assistant and teach reasoning models to think before answering. See <a href="#/ml/rlhf" className="text-blue-400 hover:underline">RLHF</a>.</p></Card>
          <Card title="Robotics and control" tone="amber"><p>Locomotion and manipulation, usually trained in simulation first and then transferred to real hardware.</p></Card>
          <Card title="Recommendations and ads" tone="purple"><p>Bandits choose which item or headline to show, balancing exploration of new items against known winners.</p></Card>
          <Card title="Operations" tone="teal"><p>DeepMind reported cutting the energy used to cool Google data centres by up to 40% with an RL-based controller (2016).</p></Card>
          <Card title="Agents" tone="rose"><p>Agents that browse, code and use tools are increasingly trained with RL on tasks whose success can be checked automatically.</p></Card>
        </div>
      </Section>

      <Section id="hard" title="What Makes RL Hard">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Reward hacking" tone="rose"><p>The agent optimises the reward you wrote, not the one you meant. OpenAI's CoastRunners boat learned to circle forever collecting bonus targets instead of finishing the race. It is the same failure RLHF has to fight.</p></Card>
          <Card title="Credit assignment" tone="amber"><p>A game is won after 80 moves. Which moves mattered? Delayed reward makes learning slow and noisy.</p></Card>
          <Card title="Sample inefficiency" tone="indigo"><p>Agents often need millions of episodes — fine in a simulator, impossible on a real robot or with real customers.</p></Card>
          <Card title="Instability" tone="purple"><p>The data depends on the policy, which depends on the data. Small changes can snowball, which is why methods like PPO limit how far each update can move.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import numpy as np
import gymnasium as gym

# Tabular Q-learning on FrozenLake (a 4x4 gridworld with slippery ice)
env = gym.make("FrozenLake-v1", is_slippery=True)
Q = np.zeros((env.observation_space.n, env.action_space.n))
alpha, gamma, eps = 0.1, 0.99, 0.1
rng = np.random.default_rng(0)

for episode in range(20_000):
    s, _ = env.reset()
    done = False
    while not done:
        a = env.action_space.sample() if rng.random() < eps else int(Q[s].argmax())
        s2, r, terminated, truncated, _ = env.step(a)
        target = r + (0 if terminated else gamma * Q[s2].max())
        Q[s, a] += alpha * (target - Q[s, a])          # the Bellman update
        s, done = s2, terminated or truncated

print("greedy policy:", Q.argmax(axis=1).reshape(4, 4))

# Deep RL: PPO on CartPole with Stable-Baselines3
from stable_baselines3 import PPO
model = PPO("MlpPolicy", "CartPole-v1", clip_range=0.2, verbose=0)
model.learn(total_timesteps=100_000)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rl-alignment")} />
    </GuideLayout>
  );
}

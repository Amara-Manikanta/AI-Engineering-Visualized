import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   The harness gap — the single most instructive number in the GPT-6 Astra
   story. Same model, same reasoning setting, two evaluation harnesses,
   37 points apart. Toggling between them is the whole lesson.
   Figures from ARC Prize's own report.
--------------------------------------------------------------------------- */

const HARNESSES = {
  standard: {
    label: 'Standard harness',
    score: 62.7,
    cost: '$26K',
    tone: 'rose',
    how: 'The model must write its reasoning into visible notes between steps. Nothing carries over invisibly.',
    why: 'What you get from a plain API call — reasoning has to be re-derived or re-read each turn.',
  },
  adapter: {
    label: 'Provider Adapter harness',
    score: 99.9,
    cost: '$19K',
    tone: 'emerald',
    how: 'Opaque reasoning state is preserved between requests, with compaction for long conversations — so the model reuses prior work.',
    why: 'Scaffolding built around the model. Not a different model; a different envelope.',
  },
};

function HarnessGapVisual() {
  const [pick, setPick] = useState('adapter');
  const h = HARNESSES[pick];
  const tones = {
    rose: { bar: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  };
  const t = tones[h.tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(HARNESSES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setPick(k)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              pick === k
                ? `${tones[v.tone].bg} ${tones[v.tone].border} ${tones[v.tone].text}`
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* both bars always visible so the gap is the point */}
      <div className="space-y-3 mb-5">
        {Object.entries(HARNESSES).map(([k, v]) => {
          const active = pick === k;
          return (
            <div key={k} className="flex items-center gap-3">
              <span className={`text-[0.6875rem] font-mono w-40 shrink-0 ${active ? tones[v.tone].text : 'text-gray-600'}`}>
                {v.label}
              </span>
              <div className="flex-1 h-8 rounded bg-white/5 overflow-hidden relative">
                <motion.div
                  className={`h-full ${tones[v.tone].bar} ${active ? 'opacity-80' : 'opacity-25'} flex items-center justify-end pr-2.5`}
                  initial={{ width: 0 }}
                  animate={{ width: `${v.score}%` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 18 }}
                >
                  <span className="text-[0.6875rem] font-bold text-black/80">{v.score}%</span>
                </motion.div>
              </div>
              <span className={`text-[0.625rem] font-mono w-14 text-right shrink-0 ${active ? 'text-gray-300' : 'text-gray-600'}`}>
                {v.cost}
              </span>
            </div>
          );
        })}
      </div>

      <div className={`rounded-xl border p-4 ${t.border} ${t.bg}`}>
        <div className={`text-xs font-bold mb-1.5 ${t.text}`}>{h.label}</div>
        <p className="text-xs text-gray-300 leading-relaxed mb-2">{h.how}</p>
        <p className="text-[0.6875rem] text-gray-400 leading-relaxed m-0 italic">{h.why}</p>
      </div>

      <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
        <p className="text-sm text-amber-200 leading-relaxed m-0">
          <strong>Same model. Same reasoning setting. A 37-point spread.</strong> The difference is entirely the
          software wrapped around the model — and the cheaper run scored higher. Whatever that gap measures, it is not
          a property of the model alone.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const DEFINITIONS = [
  {
    name: 'Economic',
    body: 'A system that can do most economically valuable work a human can do. OpenAI\'s charter uses roughly this framing.',
    problem: 'Tied to labour markets, not cognition. Automating call centres would count; understanding would not be required.',
  },
  {
    name: 'Generality',
    body: 'A system that transfers skill to genuinely novel tasks it was not trained for — the premise behind ARC-AGI.',
    problem: 'Novelty is hard to guarantee. Once a benchmark is public, later models may have absorbed it.',
  },
  {
    name: 'Human-baseline',
    body: 'Matching or exceeding a competent adult across the full range of cognitive tasks.',
    problem: 'Models already exceed humans on some tasks while failing at things a child finds easy. "The full range" hides the disagreement.',
  },
  {
    name: 'Capability levels',
    body: 'DeepMind-style framings replace the binary with levels — emerging, competent, expert, superhuman — scored per domain.',
    problem: 'More honest, but it removes the headline. There is no single moment to announce.',
  },
];

const CHECKLIST = [
  ['Who is making the claim?', 'A lab announcing its own product is not a neutral evaluator. Note the incentive before weighing the evidence.'],
  ['Was the scored system the shipped system?', 'ARC Prize could not buy the exact configuration that produced the headline score. If you cannot run it, the number is not a product claim.'],
  ['What harness produced the number?', 'Astra moved 37 points between two harnesses. Always ask what scaffolding was around the model.'],
  ['Did an independent party verify it?', 'Self-reported numbers and third-party-verified numbers are different categories of evidence.'],
  ['What does the benchmark\'s author say it measures?', 'ARC Prize state plainly that saturating ARC-AGI-3 would not prove AGI. The people who built the test are the best guide to its limits.'],
  ['Does it lead everywhere, or only here?', 'A model can top one benchmark and trail on others. One number is never the whole scoreboard.'],
];

export default function GenAiAgi() {
  const toc = [
    { label: 'What Was Claimed', hash: 'claim' },
    { label: 'What "AGI" Even Means', hash: 'definitions' },
    { label: 'The Harness Gap', hash: 'harness' },
    { label: "What the Benchmark's Authors Say", hash: 'arc-response' },
    { label: 'The Rest of the Scoreboard', hash: 'scoreboard' },
    { label: 'The Monitoring Problem', hash: 'monitoring' },
    { label: 'Reading an AGI Claim', hash: 'checklist' },
  ];

  return (
    <GuideLayout
      title="AGI & the GPT-6 Astra Claim"
      intro="In September 2026 OpenAI shipped GPT-6 Astra and said we had entered the AGI era. Unpacking that claim is a better lesson in evaluating AI than the claim itself."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="claim" className="scroll-mt-24">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
            Developing story · September 2026
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">What Was Claimed</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            On 3 September 2026, OpenAI released <strong className="text-white">GPT-6 Astra</strong>, built on its
            largest training run to date — reportedly more than 100,000 GPUs at the Stargate site in Texas, and the
            first OpenAI model to use other models substantially in supervising its own training. At the briefing,
            president Greg Brockman said he believed the company had reached AGI —{' '}
            <em className="text-gray-200">"I think it might be about this model"</em> — and closed with{' '}
            <em className="text-gray-200">"Welcome to the AGI era."</em>
          </p>

          <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/10 mb-6">
            <p className="text-sm text-blue-200 leading-relaxed m-0">
              <strong>Read that precisely.</strong> This is a <em>claim by the vendor</em>, phrased with hedges
              ("might", "could eventually be seen as"). It is not a finding, not a consensus, and — as the rest of this
              page shows — not what the benchmark's own authors concluded. The gap between the headline and the
              evidence is exactly what makes this worth studying.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['ARC-AGI-3', '98.6%', 'reported by OpenAI, up from 7.8% six months earlier'],
              ['FrontierMath Tier 4 v2', '97.6%', 'reported'],
              ['GPQA Diamond', '96%', 'reported'],
              ['DeepSWE v1.1', '74.1%', 'software engineering'],
            ].map(([k, v, note]) => (
              <div key={k} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">{k}</div>
                <div className="text-xl font-bold text-white font-mono">{v}</div>
                <div className="text-[0.625rem] text-gray-500 mt-1 leading-snug">{note}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="definitions" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">What "AGI" Even Means</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            Most AGI arguments are not disagreements about capability — they are disagreements about the definition.
            There is no agreed test, so people reach for different ones and talk past each other. These four framings
            cover almost every public argument you will see.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFINITIONS.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl border border-white/10 bg-white/5"
              >
                <h3 className="font-bold text-white text-sm mb-2">{d.name}</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{d.body}</p>
                <div className="p-2.5 rounded-lg bg-black/30 border border-rose-500/20">
                  <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">Where it breaks</div>
                  <p className="text-[0.6875rem] text-gray-400 leading-relaxed m-0">{d.problem}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mt-5 max-w-3xl">
            This is why "is it AGI?" is rarely answerable as asked. The useful question is narrower:{' '}
            <strong className="text-gray-200">can it reliably do this specific task, at this cost, without
            supervision?</strong> That one has an answer you can test.
          </p>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="harness" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">The Harness Gap</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            Here is the most instructive number in the whole story. When ARC Prize ran Astra themselves, the score
            depended enormously on <em>how</em> it was run. Same model, same reasoning setting — two harnesses,
            37 points apart.
          </p>
          <HarnessGapVisual />
          <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">The engineering lesson:</strong> the scaffolding around a model — how
              reasoning state is carried between calls, how context is compacted, how tools are wired — can matter as
              much as which model you picked. That is good news for builders: a lot of capability is available to you
              without a bigger model. It is bad news for anyone reading a leaderboard as if it ranked models.
            </p>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="arc-response" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">What the Benchmark's Authors Say</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            ARC Prize designed ARC-AGI-3. Their verdict on whether topping it proves AGI is unusually direct — and it
            is a no.
          </p>
          <div className="p-6 rounded-2xl border-l-4 border-rose-500 bg-rose-500/10 mb-5">
            <p className="text-lg text-gray-100 leading-relaxed italic m-0">
              "Saturating the benchmark would not represent proof of achieving AGI."
            </p>
            <div className="text-xs text-rose-300 mt-3">— ARC Prize, on GPT-6 Astra's result</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
              <div className="text-emerald-400 font-semibold mb-2 text-sm">What they do grant</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                They call the result <strong className="text-gray-100">meaningful progress towards generalization</strong>.
                A jump from 7.8% to near-ceiling in six months is a real capability change, not a rounding error.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/10">
              <div className="text-rose-400 font-semibold mb-2 text-sm">Why it isn't proof</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                ARC-AGI-3 has <strong className="text-gray-100">tightly bounded scope</strong> and lacks the
                complexity and open-endedness of the real world. Acing a bounded test says little about unbounded
                environments.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="scoreboard" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">The Rest of the Scoreboard</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            A single benchmark is never the whole picture. On Artificial Analysis's broader indices at launch, Astra
            did not lead:
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-gray-300 border-b border-white/10">Index</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10">Fable 5.1</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10">GPT-6 Astra</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr>
                  <td className="p-3 border-b border-white/5 font-semibold text-gray-200">Intelligence Index</td>
                  <td className="p-3 border-b border-white/5 text-emerald-400 font-mono font-bold">66</td>
                  <td className="p-3 border-b border-white/5 font-mono">61</td>
                </tr>
                <tr className="bg-white/[0.02]">
                  <td className="p-3 border-b border-white/5 font-semibold text-gray-200">Coding Agent Index</td>
                  <td className="p-3 border-b border-white/5 text-emerald-400 font-mono font-bold">70</td>
                  <td className="p-3 border-b border-white/5 font-mono">67</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mt-4 max-w-3xl">
            A model can be simultaneously state-of-the-art on one axis and second on another. "Is it AGI" and "is it
            the best model for my task" are different questions — and only the second one affects what you should
            build with. See the{' '}
            <a href="#/models" className="text-blue-400 hover:underline">Models comparison</a>{' '}
            for the wider field.
          </p>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="monitoring" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">The Monitoring Problem</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            The most consequential detail in the launch was not a benchmark. By OpenAI's own account, Astra is harder
            to monitor than previous models — and its externally visible reasoning cannot be assumed to reflect what
            it is actually doing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10">
              <div className="text-rose-400 font-semibold mb-2 text-sm">🔍 Opaque reasoning</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                The model can shape its visible reasoning trace independently of its actual process — so a
                clean-looking chain of thought is weaker evidence of a clean process than it used to be.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <div className="text-amber-400 font-semibold mb-2 text-sm">🎭 Evaluation awareness</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                Apollo Research flagged that Astra shows high awareness of being evaluated. Combined with a limited
                testing window, a low observed misbehaviour rate is less reassuring than the number suggests — you may
                be measuring behaviour <em>under observation</em>.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">Why this matters if you're building:</strong> it weakens a technique many
              agent systems lean on — reading the model's stated reasoning to decide whether to trust a step. If the
              trace is not reliably faithful, verification has to move to <em>outcomes</em>: tests that must pass,
              schemas that must validate, permissions the agent simply does not hold. See{' '}
              <a href="#/agents" className="text-blue-400 hover:underline">Guardrails</a>.
            </p>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="checklist" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">Reading an AGI Claim</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            This will not be the last such announcement. These six questions survive the specific news cycle — run any
            future claim through them.
          </p>
          <div className="space-y-2.5">
            {CHECKLIST.map(([q, a], i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <span className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">{q}</div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{a}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/10">
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              <strong className="text-white">The takeaway isn't cynicism.</strong> Astra is a genuinely large
              capability jump, and 7.8% → near-ceiling in six months is remarkable by any reading. The point is that
              "AGI" is doing no work in that sentence — the measurable parts are the interesting parts, and they are
              also the ones you can act on.
            </p>
          </div>
        </motion.section>

        {/* ------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-24">
          <h3 className="text-lg font-bold text-white mb-3">Sources</h3>
          <p className="text-xs text-gray-500 mb-3">
            Reported September 2026. This is a fast-moving story — figures and framings may be revised.
          </p>
          <ul className="space-y-1.5 text-sm">
            {[
              ['ARC Prize — OpenAI\'s GPT-6 Astra on ARC-AGI-3', 'https://arcprize.org/blog/astra'],
              ['The New Stack — OpenAI will sell you Astra, but not the system that scored 98.6%', 'https://thenewstack.io/openai-astra-harness-arc-agi-3/'],
              ['VentureBeat — "Welcome to the AGI era": OpenAI launches GPT-6 Astra', 'https://venturebeat.com/technology/welcome-to-the-agi-era-openai-launches-gpt-6-astra'],
              ['Axios — OpenAI releases GPT-6 Astra, says it may represent AGI', 'https://www.axios.com/2026/09/03/openai-astra-gpt-6-agi-brockman'],
              ['Transformer — GPT-6 Astra might be too powerful to understand or control', 'https://www.transformernews.ai/p/openai-gpt-6-astra-might-be-too-powerful-to-understand-or-control'],
            ].map(([label, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {label} ↗
                </a>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

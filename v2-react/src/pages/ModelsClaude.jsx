import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const features = [
  { num: "1", title: "CLAUDE.md", icon: "📄", color: "orange", desc: "Project memory file — custom rules, stack info, and commands Claude reads every session." },
  { num: "2", title: "Permissions", icon: "🔒", color: "cyan", desc: "Control what Claude can and can't touch — whitelist or block tools per session." },
  { num: "3", title: "Plan Mode", icon: "📝", color: "purple", desc: "Review the plan before Claude acts — approve, edit, or reject each step first." },
  { num: "4", title: "Checkpoints", icon: "⏱️", color: "green", desc: "Revert to any point in time — automatic git snapshots let you undo any mistake." },
  { num: "5", title: "Skills", icon: "🛠️", color: "orange", desc: "Reusable instructions Claude follows automatically — store in .claude/skills/." },
  { num: "6", title: "Hooks", icon: "⚡", color: "cyan", desc: "Run custom logic at key moments — shell scripts on PreToolUse, PostToolUse events." },
  { num: "7", title: "MCP", icon: "🔌", color: "green", desc: "Connect Claude to any external tool — databases, APIs, and services via Model Context Protocol." },
  { num: "8", title: "Plugins", icon: "🧩", color: "pink", desc: "Extend Claude with third-party integrations — add tools without writing custom code." },
  { num: "9", title: "Context", icon: "🧠", color: "green", desc: "Feed Claude what it needs and manage the current context — files, history, and rules." },
  { num: "10", title: "Slash Commands", icon: "⌨️", color: "purple", desc: "Trigger actions with a single command — store templates in .claude/commands/." },
  { num: "11", title: "Compaction", icon: "🗜️", color: "cyan", desc: "Compress long conversations to save tokens — keep context fresh without losing key info." },
  { num: "12", title: "Subagents", icon: "🤖", color: "purple", desc: "Spawn parallel agents for complex tasks — divide and conquer multi-step workflows." }
];

const getColorClass = (color) => {
  const colors = {
    orange: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    cyan: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    purple: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    green: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    pink: "border-pink-500/50 bg-pink-500/10 text-pink-400"
  };
  return colors[color] || colors.orange;
};

const getHeaderColorClass = (color) => {
  const colors = {
    orange: "bg-orange-500/20 text-orange-200 border-b border-orange-500/30",
    cyan: "bg-cyan-500/20 text-cyan-200 border-b border-cyan-500/30",
    purple: "bg-purple-500/20 text-purple-200 border-b border-purple-500/30",
    green: "bg-emerald-500/20 text-emerald-200 border-b border-emerald-500/30",
    pink: "bg-pink-500/20 text-pink-200 border-b border-pink-500/30"
  };
  return colors[color] || colors.orange;
};

export default function ModelsClaude() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'How Claude Is Trained', hash: 'training' },
    { label: 'Architecture', hash: 'architecture' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
    { label: 'Claude Code (Agent CLI)', hash: 'claude-code' },
  ];

  return (
    <GuideLayout title="Claude (Anthropic)" intro="The model line built around Constitutional AI — training a model to critique and revise its own outputs against a written set of principles." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🧠</span>
          <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/30">Anthropic · Closed Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Claude is Anthropic's flagship model line, built by the team that co-authored the original InstructGPT/RLHF
          research at OpenAI before founding Anthropic to focus explicitly on AI safety. That focus shows up directly
          in training method (Constitutional AI, below) and in product behavior — long-context reasoning, careful tool
          use, and being purpose-built for agentic coding workflows like Claude Code.
        </p>
      </section>

      <ModelLineup id="claude" />

      <ModelWeights id="claude" />

      <ModelPipeline id="claude" name="Claude" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Claude Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Claude follows pretrain → SFT → alignment like the rest of the field. Its alignment stage is where it
          diverges: instead of relying purely on large volumes of human-ranked comparisons, Anthropic pioneered
          <strong className="text-white"> Constitutional AI (CAI)</strong> — teaching the model to police itself against a written
          set of principles.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Constitutional AI Loop</h3>
          <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono">SFT Model generates a response</div>
            <div className="text-gray-500">↓</div>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(251,146,60,0)', '0 0 16px rgba(251,146,60,0.4)', '0 0 0px rgba(251,146,60,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="px-4 py-2 bg-orange-900/20 border border-orange-500/40 rounded-lg text-orange-300 text-sm font-bold"
            >
              📜 Model critiques its own response against the "constitution"
            </motion.div>
            <div className="text-gray-500">↓</div>
            <div className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono">Model revises its own response to better fit the principles</div>
            <div className="text-gray-500">↓ repeat, then fine-tune on the revised examples (SL-CAI) ↓</div>
            <div className="px-4 py-2 bg-emerald-900/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm font-bold">AI-generated preference data trains a reward model → RLAIF (RL from AI Feedback)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-orange-900/10 border border-orange-500/20 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2 text-sm">📜 The "Constitution"</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              A written set of principles (drawing on sources like human rights frameworks and platform guidelines)
              instructing the model to prefer responses that are more helpful, honest, and harmless. Humans write the
              constitution once; the model applies it to itself at scale.
            </p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-2 text-sm">🤖 RLAIF vs RLHF</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Classic RLHF needs humans to rank huge numbers of response pairs. RLAIF has the model itself (guided by
              the constitution) generate much of that preference data instead — humans define the values once, AI
              feedback scales the labeling.
            </p>
          </div>
        </div>

        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
          <h3 className="text-indigo-400 font-semibold mb-3">🔑 The Key Differentiator: Self-Critique Instead of Human-Only Judging</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Where standard RLHF makes "what's a good response?" entirely a matter of what human raters happen to
            prefer in the moment, Constitutional AI makes the underlying values <strong className="text-gray-100">explicit and
            written down</strong> — and has the model reason about and apply those values to its own outputs before any
            reinforcement learning happens. This is also what Claude's "harmlessness" tuning is built on: the model
            learns to recognize and revise problematic outputs itself, rather than only being told after the fact by a
            human rater which of two responses was worse.
          </p>
        </div>
      </section>

      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📚', title: 'Long-Context Reasoning', desc: 'Context windows large enough to hold entire codebases or document sets, with strong recall across the whole window rather than just the ends.' },
            { icon: '🛠️', title: 'Agentic Tool Use', desc: 'Purpose-tuned for long tool-use chains — reading files, running commands, calling APIs across many sequential steps without losing the thread.' },
            { icon: '🖥️', title: 'Computer Use', desc: 'Can perceive a screen and control a mouse/keyboard directly, extending tool use beyond APIs to any GUI application.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Leading agentic coding performance — long tool-use chains, large codebases.</li>
              <li>Careful, well-calibrated behavior on sensitive or ambiguous requests.</li>
              <li>Strong long-document and long-context recall.</li>
              <li>Purpose-built developer tooling (Claude Code, Agent SDK).</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Closed weights — no self-hosting or on-prem deployment.</li>
              <li>Smaller multimodal generation surface than GPT (no native image generation).</li>
              <li>Frontier tier pricing is a real cost factor at high volume.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Agentic coding assistants', 'Long-document analysis & summarization', 'Safety-sensitive customer-facing products'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>

      <section id="claude-code" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Claude Code (Agent CLI) Features</h2>
        <p className="text-gray-400 mb-8">Anthropic released <strong className="text-white">Claude Code</strong>, a terminal-native AI agent tool. Here are the 12 features you need to know to master it:</p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={fadeUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`rounded-xl border backdrop-blur-sm overflow-hidden flex flex-col ${getColorClass(f.color).split(' ')[0]} bg-[#0a0a0a]/80`}
            >
              <div className={`px-4 py-2 font-bold flex items-center gap-3 ${getHeaderColorClass(f.color)}`}>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/30 text-sm">
                  {f.num}
                </span>
                {f.title}
              </div>
              <div className="p-5 flex-1 flex flex-col items-start gap-3">
                <div className={`text-4xl ${getColorClass(f.color).split(' ')[2]}`}>
                  {f.icon}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

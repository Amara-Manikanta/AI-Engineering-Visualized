import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

export default function PromptingIndex() {
  const toc = [
    { label: 'Prompt Engineering', hash: '#prompt-engineering' },
    { label: 'Techniques', hash: '#techniques' },
    { label: 'Best Practices', hash: '#best-practices' }
  ];

  return (
    <GuideLayout
      title="Prompt Engineering"
      intro="The Art of Talking to AI."
      toc={toc}
    >
      <section id="prompt-engineering" className="mb-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-pink-400 uppercase bg-pink-500/10 rounded-full border border-pink-500/20">
            Prompt Engineering
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">✍️ The Art of Talking to AI</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Prompt engineering is the skill of designing inputs to get the best outputs from LLMs. A better prompt = dramatically better results — no training required.
          </p>
        </div>

        <div id="techniques" className="grid grid-cols-1 gap-8 mb-12">
          {/* 1. Zero-Shot */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">01</span>Zero-Shot Prompting</h3>
            <p className="text-gray-400 mb-4">Directly instruct the model with no examples. Relies entirely on the model's pre-trained knowledge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <div className="text-red-400 font-bold mb-2">❌ Weak</div>
                <div className="font-mono text-sm text-gray-300">"Translate this."</div>
              </div>
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                <div className="text-green-400 font-bold mb-2">✅ Strong</div>
                <div className="font-mono text-sm text-gray-300">"Translate the following English text to French. Preserve the formal tone.<br/><br/>Text: 'The meeting has been rescheduled.'"</div>
              </div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Be specific about task, format, audience, and tone.
            </div>
          </motion.div>

          {/* 2. Few-Shot */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">02</span>Few-Shot Prompting</h3>
            <p className="text-gray-400 mb-4">Provide 2-5 input→output examples before your actual question. The model learns the pattern from your examples.</p>
            <div className="p-4 bg-black/40 rounded-xl font-mono text-sm text-gray-300 border border-gray-700 space-y-2 mb-4">
              <div><span className="text-gray-500">Example 1:</span> Sentiment("I love it!") → Positive</div>
              <div><span className="text-gray-500">Example 2:</span> Sentiment("Terrible service") → Negative</div>
              <div className="text-blue-300"><span className="text-gray-500">Query:</span> Sentiment("It was okay, I guess") → ?</div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Use 3-5 diverse examples covering edge cases.
            </div>
          </motion.div>

          {/* 3. Chain of Thought */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">03</span>Chain-of-Thought (CoT)</h3>
            <p className="text-gray-400 mb-4">Ask the model to reason step-by-step before giving the final answer. Dramatically improves accuracy on complex tasks.</p>
            <div className="flex flex-col items-center gap-2 p-4 bg-black/40 rounded-xl border border-gray-700 mb-4">
              <div className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">🤔 Think step by step...</div>
              <div className="text-gray-600">↓</div>
              <div className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">📝 Step 1: Identify known values</div>
              <div className="text-gray-600">↓</div>
              <div className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">📝 Step 2: Apply formula</div>
              <div className="text-gray-600">↓</div>
              <div className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">📝 Step 3: Verify result</div>
              <div className="text-gray-600">↓</div>
              <div className="px-3 py-1 bg-green-900/50 border border-green-700 text-green-300 rounded text-sm font-bold">✅ Final Answer</div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Add "Let's think step by step" or "Think before answering".
            </div>
          </motion.div>

          {/* 4. Role Prompting */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">04</span>Role Prompting</h3>
            <p className="text-gray-400 mb-4">Assign a persona or expert role to the model. It "becomes" that expert and adjusts its tone, depth, and knowledge accordingly.</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="px-4 py-2 bg-blue-900/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm">👨‍⚕️ "You are a senior cardiologist..."</div>
              <div className="px-4 py-2 bg-purple-900/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm">👩‍💻 "You are a 10x Python engineer..."</div>
              <div className="px-4 py-2 bg-amber-900/30 border border-amber-500/30 text-amber-300 rounded-lg text-sm">🎓 "You are a Socratic philosophy professor..."</div>
              <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg text-sm">🔒 "You are a cybersecurity expert..."</div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Combine role + task + format for best results.
            </div>
          </motion.div>

          {/* 5. Tree of Thoughts */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">05</span>Tree of Thoughts (ToT)</h3>
            <p className="text-gray-400 mb-4">The model explores <strong>multiple reasoning branches</strong> simultaneously, evaluates each path, and selects the best one — like a chess player thinking several moves ahead.</p>
            <div className="flex flex-col items-center p-4 bg-black/40 rounded-xl border border-gray-700 mb-4">
              <div className="px-4 py-2 bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 rounded-lg mb-4">Problem</div>
              <div className="flex gap-4 w-full justify-center">
                <div className="flex flex-col items-center">
                  <div className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm mb-2">Path A</div>
                  <div className="text-red-400 text-xs">Dead end ✗</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm mb-2">Path B</div>
                  <div className="text-green-400 text-xs font-bold">✅ Best answer</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm mb-2">Path C</div>
                  <div className="text-red-400 text-xs">Dead end ✗</div>
                </div>
              </div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Best for complex problem-solving, puzzles, and planning tasks.
            </div>
          </motion.div>

          {/* 6. ReAct */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">06</span>ReAct Prompting</h3>
            <p className="text-gray-400 mb-4">Interleave <strong>Reasoning</strong> and <strong>Action</strong>. The model thinks out loud, takes an action (e.g., search), observes the result, then reasons again. The backbone of modern AI agents.</p>
            <div className="p-4 bg-black/40 rounded-xl border border-gray-700 space-y-2 font-mono text-sm mb-4">
              <div className="text-gray-400">💭 Thought: I need to find today's stock price</div>
              <div className="text-blue-400">⚡ Action: search("AAPL stock price today")</div>
              <div className="text-purple-400">👁️ Observation: AAPL = $195.32</div>
              <div className="text-gray-400">💭 Thought: Now I can answer the question</div>
              <div className="text-green-400 font-bold">✅ Answer: Apple's stock is $195.32</div>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 This is what powers LangGraph and tool-using agents.
            </div>
          </motion.div>

          {/* 7. Structured Output */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2"><span className="text-gray-500 mr-2">07</span>Structured Output</h3>
            <p className="text-gray-400 mb-4">Force the model to return output in a specific format — JSON, XML, Markdown tables, or custom schemas. Essential for programmatic use.</p>
            <div className="p-4 bg-black/40 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 mb-4 overflow-x-auto">
              <pre>{`"Return ONLY valid JSON:
{
  \\"sentiment\\": \\"positive|negative|neutral\\",
  \\"confidence\\": 0.0-1.0,
  \\"reason\\": \\"one sentence\\"
}"`}</pre>
            </div>
            <div className="text-sm text-yellow-400/90 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              💡 Use with OpenAI's <code>response_format</code> or Pydantic models for reliability.
            </div>
          </motion.div>
        </div>

        <div id="best-practices" className="p-8 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">⚡ Golden Rules of Prompt Engineering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Be specific and unambiguous</div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Give context and background</div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Specify output format</div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Define the audience</div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Iterate and refine</div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">✅ Use delimiters (""" or XML tags)</div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Assume the model knows context</div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Use vague instructions</div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Ask too many things at once</div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Ignore system prompts</div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Forget to validate output</div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">❌ Use negatives (say what TO do)</div>
            </div>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("prompting")} />
    </GuideLayout>
  );
}

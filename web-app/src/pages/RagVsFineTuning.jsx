import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   A decision tree you walk, not a flowchart you squint at. Each node asks one
   question; the answer either lands on a verdict or moves to the next node.
-------------------------------------------------------------------------- */

const VERDICTS = {
  prompt: {
    title: "Start with prompting",
    tone: "border-blue-500/40 bg-blue-500/[0.1]",
    label: "text-blue-400",
    body: "Neither RAG nor fine-tuning yet. A better prompt, a few examples, and a clearer output schema solve more problems than either, at a fraction of the effort. You also cannot tell whether retrieval or tuning helps until you have a prompting baseline to compare against.",
    next: ["Write 20 evaluation cases before touching the prompt.", "Try few-shot examples and an explicit output format.", "Only move on once you can point at what the baseline gets wrong."],
  },
  rag: {
    title: "RAG",
    tone: "border-emerald-500/40 bg-emerald-500/[0.1]",
    label: "text-emerald-400",
    body: "The model needs facts it does not have, and those facts change or must be attributable. Retrieval injects them at query time, so updating knowledge means updating an index rather than retraining anything.",
    next: ["Start at /rag/fundamentals and get a naive pipeline working end to end.", "Measure retrieval quality separately from answer quality.", "Add re-ranking and compression only once you can measure the effect."],
  },
  ft: {
    title: "Fine-tuning",
    tone: "border-indigo-500/40 bg-indigo-500/[0.1]",
    label: "text-indigo-400",
    body: "The model knows enough but behaves wrong — wrong format, wrong tone, wrong conventions, or too verbose for the latency budget. That is a behaviour problem, and behaviour is what fine-tuning changes.",
    next: ["Use LoRA before full fine-tuning; see /genai/peft.", "A few thousand consistent examples beats a hundred thousand noisy ones.", "Hold out a test set the tuning run never sees."],
  },
  both: {
    title: "Both",
    tone: "border-purple-500/40 bg-purple-500/[0.1]",
    label: "text-purple-400",
    body: "You need current, citable facts and a specific behaviour. These are orthogonal problems with orthogonal solutions, so use both: retrieval supplies the knowledge, a tuned adapter supplies the format and tone.",
    next: ["Build and measure the RAG pipeline first — it usually moves the number more.", "Then fine-tune on examples that include retrieved context in the prompt.", "Tuning on context-free examples teaches the model to ignore the context."],
  },
  neither: {
    title: "Neither — this is a data problem",
    tone: "border-amber-500/40 bg-amber-500/[0.1]",
    label: "text-amber-400",
    body: "Without evaluation data you cannot tell whether any change helped, and without source documents there is nothing to retrieve or tune on. Any approach chosen now is a guess you will not be able to check.",
    next: ["Collect 50 to 100 real queries with correct answers.", "Find out where the ground truth actually lives today.", "Come back once you can score a baseline."],
  },
};

const TREE = {
  start: {
    q: "Do you have evaluation data — real queries with known-good answers?",
    a: [
      { label: "Yes, or I can collect it", to: "baseline" },
      { label: "No", to: "neither" },
    ],
  },
  baseline: {
    q: "Have you tried careful prompting with few-shot examples yet?",
    a: [
      { label: "Yes, and it is not enough", to: "gap" },
      { label: "Not properly", to: "prompt" },
    ],
  },
  gap: {
    q: "What is the baseline actually getting wrong?",
    a: [
      { label: "It states wrong or outdated facts", to: "knowledge" },
      { label: "The facts are fine, the form is wrong", to: "behaviour" },
      { label: "Both", to: "both" },
    ],
  },
  knowledge: {
    q: "Does that knowledge change, or need to be cited?",
    a: [
      { label: "Yes to either", to: "rag" },
      { label: "No — it is stable and unattributed", to: "stable" },
    ],
  },
  stable: {
    q: "How much of it is there?",
    a: [
      { label: "A large corpus", to: "rag" },
      { label: "A small fixed body of facts", to: "ft" },
    ],
  },
  behaviour: {
    q: "How many examples of the behaviour you want can you produce?",
    a: [
      { label: "Thousands", to: "ft" },
      { label: "A few dozen", to: "prompt" },
    ],
  },
};

function DecisionWalk() {
  const [path, setPath] = useState(["start"]);
  const current = path[path.length - 1];
  const node = TREE[current];
  const verdict = VERDICTS[current];

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-indigo-400 font-bold m-0">Walk the decision</h3>
        {path.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPath((p) => p.slice(0, -1))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/15 bg-white/5 text-gray-300 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setPath(["start"])}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/15 bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              Start over
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb of answered questions */}
      {path.length > 1 && (
        <ol className="space-y-1.5 mb-5 pl-0 list-none m-0">
          {path.slice(0, -1).map((step, i) => (
            <li key={step} className="flex gap-2 text-xs text-gray-500">
              <span className="text-gray-700 font-mono shrink-0">{i + 1}.</span>
              <span>
                {TREE[step].q}{" "}
                <span className="text-indigo-300">
                  → {TREE[step].a.find((x) => x.to === path[i + 1])?.label}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {node && (
        <div>
          <div className="text-lg font-semibold text-white mb-4">{node.q}</div>
          <div className="flex flex-wrap gap-3">
            {node.a.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setPath((p) => [...p, opt.to])}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/25 hover:border-indigo-500/50 transition-colors text-left"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {verdict && (
        <div className={`p-5 rounded-xl border ${verdict.tone}`}>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Verdict</div>
          <div className={`text-2xl font-bold mb-3 ${verdict.label}`}>{verdict.title}</div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{verdict.body}</p>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">What to do next</div>
          <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5 m-0">
            {verdict.next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const ROWS = [
  ["What it changes", "What the model knows at answer time", "How the model behaves"],
  ["Updating knowledge", "Re-index a document — minutes", "Retrain — hours to days"],
  ["Attribution", "Natural: cite the retrieved source", "Impossible: knowledge is in the weights"],
  ["Upfront cost", "Embedding the corpus, plus a vector store", "GPU time and a curated training set"],
  ["Per-query cost", "Higher — retrieved context is input tokens", "Lower — no extra context needed"],
  ["Latency", "Adds a retrieval hop before generation", "None added"],
  ["Data needed", "Documents, no labels required", "Thousands of input/output examples"],
  ["Failure mode", "Retrieves the wrong thing, answers from it", "Confidently wrong with no way to trace why"],
  ["Access control", "Enforceable per-document at query time", "Baked in for everyone, permanently"],
];

export default function RagVsFineTuning() {
  const toc = [
    { label: "The Wrong Question", hash: "wrong" },
    { label: "Decision Tree", hash: "tree" },
    { label: "Side by Side", hash: "table" },
    { label: "Using Both", hash: "both" },
    { label: "Cost in Practice", hash: "cost" },
    { label: "Common Mistakes", hash: "mistakes" },
  ];

  return (
    <GuideLayout
      title="RAG vs Fine-tuning"
      intro="They solve different problems and are not alternatives. The useful question is what your baseline is getting wrong."
      toc={toc}
    >
      <section id="wrong" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Wrong Question</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          "Should we use RAG or fine-tune?" is asked constantly and answers nothing, because the two address
          unrelated deficits. One supplies knowledge the model lacks. The other changes behaviour the model already
          has. Asking which is better is like asking whether a dictionary beats an accent coach.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-bold text-emerald-400 mb-2">RAG changes what it knows</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Facts arrive in the prompt at query time. Knowledge stays external, versionable, permission-checked, and
              citable. Change a document and the next answer changes.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
            <div className="font-bold text-indigo-400 mb-2">Fine-tuning changes how it acts</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Format, tone, verbosity, domain conventions, reliability of structured output. Behaviour is learned into
              the weights and applies without spending any context.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The most common expensive mistake</strong> is fine-tuning to teach facts. It technically works and
            it is a bad trade: the facts go stale the moment the run finishes, cannot be cited, cannot be
            permission-scoped, and cost a retraining cycle to correct. Retrieval does all of that better.
          </p>
        </div>
      </section>

      <section id="tree" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Decision Tree</h2>
        <DecisionWalk />
      </section>

      <section id="table" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Side by Side</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white"> </th>
                <th className="px-4 py-3 font-semibold text-emerald-400">RAG</th>
                <th className="px-4 py-3 font-semibold text-indigo-400">Fine-tuning</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {ROWS.map(([k, a, b]) => (
                <tr key={k} className="border-t border-white/10">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap align-top">{k}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{a}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="both" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Using Both</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Mature systems usually end up with both, in this order. Build retrieval first, because it typically moves
          the number more and it tells you what the tuned model will need to handle.
        </p>
        <div className="space-y-3 mb-5">
          {[
            ["1", "Baseline with prompting", "Establish what an off-the-shelf model does with a good prompt. Every later claim is measured against this."],
            ["2", "Add retrieval", "Fix the factual errors. Measure retrieval quality on its own — recall at k — before measuring answers."],
            ["3", "Fine-tune on retrieved context", "Now tune for format and tone, using training examples that include retrieved documents in the prompt."],
            ["4", "Re-measure everything", "Tuning can degrade how well the model uses context. If it does, your training examples did not look like production."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold flex items-center justify-center text-sm">
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-500/[0.07]">
          <p className="text-sm text-purple-100 leading-relaxed m-0">
            Step three carries the subtle failure. If you fine-tune on clean question-and-answer pairs with no
            retrieved context, you teach the model to answer from its weights. In production it then ignores the
            documents you worked hard to retrieve. Train on prompts shaped exactly like the ones you will serve.
          </p>
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Cost in Practice</h2>
        <CodeBlock
          language="text"
          code={`A rough shape for a 10,000-document corpus and 100k queries/month.
Order of magnitude only — hardware, model, and corpus all move these.

RAG
  one-off    embed 10k docs                        a few dollars
  monthly    vector store (managed, small tier)    tens of dollars
  monthly    extra input tokens for context        the dominant term
  latency    +50 to 300ms retrieval hop
  update     re-embed changed docs                 seconds to minutes

Fine-tuning (LoRA on an open model)
  one-off    curate ~5k examples                   the real cost: human time
  one-off    GPU hours for the run                 tens of dollars
  monthly    serving the adapter                   same as base model
  latency    unchanged
  update     full retrain                          hours, plus re-evaluation

The line that decides it is usually neither of the dollar figures.
It is "how often does the knowledge change" and "must we cite a source".`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Note which row dominates RAG's bill: input tokens, every query, forever. That is what makes{" "}
          <a href="#/rag/compression" className="text-blue-400 hover:underline">contextual compression</a> a cost
          lever rather than a nicety.
        </p>
      </section>

      <section id="mistakes" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Common Mistakes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Fine-tuning to inject facts", "Works, goes stale immediately, cannot be cited or scoped. Almost always the wrong tool."],
            ["Building RAG for a fixed 20-page manual", "Just put it in the prompt. A retrieval pipeline for content that fits in context is machinery with no purpose."],
            ["Skipping the prompting baseline", "Without it you cannot say whether anything you built helped, and a meaningful share of the time prompting alone was enough."],
            ["Measuring only end-to-end answers", "When quality is poor you cannot tell whether retrieval missed or generation ignored what it got. Score the retriever separately."],
            ["Tuning on context-free examples", "Teaches the model to answer from memory and disregard retrieved documents. Include the context in training prompts."],
            ["Treating the choice as permanent", "Start with retrieval, add tuning when a behaviour gap shows up in the evaluation set. It is a sequence, not a fork."],
          ].map(([t, d]) => (
            <div key={t} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
              <div className="text-sm font-semibold text-rose-300 mb-1">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("rag-core")} />
    </GuideLayout>
  );
}

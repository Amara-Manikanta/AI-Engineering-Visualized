import React, { useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default function MlNlp() {
  const [lexStep, setLexStep] = useState(0);
  const [spamStep, setSpamStep] = useState(0);
  const [synStep, setSynStep] = useState(0);
  const [spellStep, setSpellStep] = useState(0);
  const [inputText, setInputText] = useState(
    "Artificial Intelligence and Machine Learning are transforming modern technology. AI agents utilize Large Language Models (LLMs) to perform reasoning, while Retrieval-Augmented Generation (RAG) connects LLMs to external vector databases for grounded context. Python is the dominant language for building neural networks, training models, and deploying production AI systems."
  );

  const playLexical = async () => {
    setLexStep(0);
    await sleep(100);
    setLexStep(1); // row 1
    await sleep(800);
    setLexStep(2); // arrow 1
    await sleep(400);
    setLexStep(3); // tokens
    await sleep(800);
    setLexStep(4); // fade stopwords
    await sleep(600);
    setLexStep(5); // arrow 2
    await sleep(400);
    setLexStep(6); // stems
  };

  const playSpam = async () => {
    setSpamStep(0);
    await sleep(100);
    setSpamStep(1);
    await sleep(800);
    setSpamStep(2);
    await sleep(400);
    setSpamStep(3);
    await sleep(800);
    setSpamStep(4);
    await sleep(400);
    setSpamStep(5);
    await sleep(1000);
    setSpamStep(6);
    await sleep(400);
    setSpamStep(7);
  };

  const playSyn = async () => {
    setSynStep(0);
    await sleep(100);
    setSynStep(1); // The + DET
    await sleep(1200);
    setSynStep(2); // ->
    await sleep(400);
    setSynStep(3); // fox + NOUN
    await sleep(1200);
    setSynStep(4); // ->
    await sleep(400);
    setSynStep(5); // jumps + VERB
  };

  const playSpell = async () => {
    setSpellStep(0);
    await sleep(100);
    setSpellStep(1);
    await sleep(800);
    setSpellStep(2);
    await sleep(400);
    setSpellStep(3);
    await sleep(600);
    setSpellStep(4);
    await sleep(800);
    setSpellStep(5);
    await sleep(400);
    setSpellStep(6);
    await sleep(1000);
    setSpellStep(7);
    await sleep(400);
    setSpellStep(8);
  };

  const toc = [
    { label: "The NLP Pipeline", hash: "pipeline" },
    { label: "Text Preprocessing", hash: "preprocessing" },
    { label: "Tokenization & TF-IDF", hash: "lexical" },
    { label: "N-grams", hash: "ngrams" },
    { label: "Text Vectorization", hash: "vectorization" },
    { label: "Spam Detection", hash: "spam" },
    { label: "Syntactic Processing", hash: "syntactic" },
    { label: "Named Entity Recognition", hash: "ner" },
    { label: "Sentiment Analysis", hash: "sentiment" },
    { label: "Topic Modeling", hash: "topics" },
    { label: "Spell Corrector", hash: "spell" },
    { label: "Word Cloud & Frequency", hash: "wordcloud" },
    { label: "Classical → Transformers", hash: "modern" }
  ];

  const Node = ({ children, visible, highlight, danger, faded, className="" }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20, scale: highlight ? 1.05 : 1 }}
      className={`px-6 py-3 bg-[#111] border-2 rounded-lg font-mono text-[0.95rem] font-semibold text-center relative transition-colors duration-300 ${
        highlight ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
        danger ? 'border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
        'border-gray-800 text-gray-300'
      } ${faded ? 'opacity-20' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );

  const Arrow = ({ visible }) => (
    <motion.div 
      animate={{ opacity: visible ? 1 : 0 }}
      className="text-gray-500 text-2xl mx-2"
    >
      ↓
    </motion.div>
  );
  
  const ArrowRight = ({ visible }) => (
    <motion.div 
      animate={{ opacity: visible ? 1 : 0 }}
      className="text-gray-500 text-2xl mx-2"
    >
      →
    </motion.div>
  );

  const PosTag = ({ children, visible }) => (
    <motion.div 
      animate={{ opacity: visible ? 1 : 0 }}
      className="absolute -top-6 left-1/2 -translate-x-1/2 text-[0.7rem] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded"
    >
      {children}
    </motion.div>
  );

  return (
    <GuideLayout
      title="Natural Language Processing"
      intro="Interactive explorations of the algorithms that allow machines to understand, process, and generate human language."
      toc={toc}
    >
      {/* ================= THE NLP PIPELINE ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="pipeline"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">The NLP Pipeline</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Almost every classical NLP system follows the same shape: take messy human text, clean and normalize it,
          convert it to numbers, then run a model on those numbers. Each stage below is a decision point that quietly
          determines how well everything downstream works.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 overflow-x-auto">
          <div className="flex items-stretch gap-2 min-w-[720px]">
            {[
              { t: 'Raw text', d: '"The cats aren\'t running!"', tone: 'border-gray-700 bg-white/5 text-gray-300' },
              { t: 'Preprocess', d: 'lowercase, strip, normalize', tone: 'border-blue-500/40 bg-blue-500/10 text-blue-200' },
              { t: 'Tokenize', d: 'split into units', tone: 'border-purple-500/40 bg-purple-500/10 text-purple-200' },
              { t: 'Vectorize', d: 'text → numbers', tone: 'border-amber-500/40 bg-amber-500/10 text-amber-200' },
              { t: 'Model', d: 'classify / tag / rank', tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.t}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                  className={`flex-1 rounded-xl border p-4 text-center ${s.tone}`}
                >
                  <div className="font-bold text-sm mb-1">{s.t}</div>
                  <div className="text-[0.625rem] opacity-75 font-mono leading-snug">{s.d}</div>
                </motion.div>
                {i < arr.length - 1 && <div className="flex items-center text-gray-600 text-xl shrink-0">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
          <p className="text-sm text-blue-200 leading-relaxed m-0">
            <strong>Modern LLMs collapse most of this.</strong> A transformer takes near-raw text (subword tokens) and
            learns representations end to end — no stopword lists, no stemming. Classical NLP is still worth
            understanding because it is cheaper, fully interpretable, and often good enough for filtering, search, and
            preprocessing <em>before</em> an LLM ever sees the text.
          </p>
        </div>
      </motion.section>

      {/* ================= PREPROCESSING ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="preprocessing"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Text Preprocessing</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Raw text is inconsistent: casing varies, punctuation clings to words, and the same concept appears in a dozen
          surface forms. Preprocessing shrinks that variation so the model sees signal instead of spelling.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="space-y-2.5">
            {[
              { step: 'Original', text: 'The Cats aren’t   RUNNING quickly!! <br>', tone: 'text-gray-400' },
              { step: 'Strip markup', text: 'The Cats aren’t   RUNNING quickly!!', tone: 'text-gray-300' },
              { step: 'Lowercase', text: 'the cats aren’t   running quickly!!', tone: 'text-gray-300' },
              { step: 'Expand contractions', text: 'the cats are not   running quickly!!', tone: 'text-gray-300' },
              { step: 'Remove punctuation', text: 'the cats are not   running quickly', tone: 'text-gray-300' },
              { step: 'Collapse whitespace', text: 'the cats are not running quickly', tone: 'text-gray-200' },
              { step: 'Remove stopwords', text: 'cats running quickly', tone: 'text-amber-200' },
              { step: 'Lemmatize', text: 'cat run quickly', tone: 'text-emerald-300' },
            ].map((r, i) => (
              <motion.div
                key={r.step}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 sm:w-44 shrink-0">{r.step}</span>
                <code className={`font-mono text-sm px-3 py-1.5 rounded bg-black/40 border border-white/10 ${r.tone}`}>
                  {r.text}
                </code>
              </motion.div>
            ))}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-3">Stemming vs Lemmatization</h3>
        <p className="text-gray-300 mb-4 max-w-3xl">
          Both reduce words to a base form, but they work very differently — and picking the wrong one is a common
          early mistake.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-800 mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Word</th>
                <th className="px-4 py-3 text-left text-amber-400 border-b border-gray-800">Stemming (Porter)</th>
                <th className="px-4 py-3 text-left text-emerald-400 border-b border-gray-800">Lemmatization</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 font-mono text-xs">
              {[
                ['running', 'run', 'run'],
                ['studies', 'studi ⚠️', 'study'],
                ['better', 'better', 'good ✓'],
                ['was', 'wa ⚠️', 'be'],
                ['caring', 'care', 'care'],
                ['mice', 'mice', 'mouse ✓'],
              ].map(([w, s, l], i) => (
                <tr key={w} className={i % 2 ? 'bg-gray-900/30' : ''}>
                  <td className="px-4 py-2.5 border-b border-gray-900 text-gray-200">{w}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{s}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
            <div className="text-sm font-semibold text-amber-300 mb-1">Stemming — chop by rules</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Fast, dictionary-free suffix stripping. Can produce non-words ("studi"), but that is fine when you only
              need consistent keys for matching. Use it for search indexes at scale.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <div className="text-sm font-semibold text-emerald-300 mb-1">Lemmatization — look up real forms</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Uses a vocabulary and part-of-speech to return real dictionary words ("better" → "good"). Slower, but
              required when the output must be human-readable or fed to another linguistic step.
            </p>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="420px" code={`import re, unicodedata
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer

STOP = set(stopwords.words("english"))
stemmer, lemmatizer = PorterStemmer(), WordNetLemmatizer()

def preprocess(text: str, mode: str = "lemma") -> list[str]:
    text = unicodedata.normalize("NFKC", text)      # curly quotes -> plain
    text = re.sub(r"<[^>]+>", " ", text)            # strip HTML tags
    text = text.lower()
    text = re.sub(r"[^a-z0-9\\s']", " ", text)       # drop punctuation
    text = re.sub(r"\\s+", " ", text).strip()        # collapse whitespace

    tokens = [t for t in text.split() if t not in STOP and len(t) > 1]

    if mode == "stem":
        return [stemmer.stem(t) for t in tokens]
    return [lemmatizer.lemmatize(t, pos="v") for t in tokens]

preprocess("The Cats aren't RUNNING quickly!! <br>")
# -> ['cat', 'run', 'quickly']`} />

        <div className="mt-4 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10">
          <p className="text-sm text-rose-200 leading-relaxed m-0">
            <strong>Don't preprocess blindly.</strong> Removing stopwords destroys negation — "not good" and "good"
            both become "good", which will wreck a sentiment model. And for transformer models you should do almost
            none of this: they need the original casing and punctuation to work properly.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="lexical"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Tokenization & TF-IDF</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Before a machine learning model can understand text, it must be broken down into chunks (tokens) and converted into numerical formats. This process removes noise like stopwords and standardizes words through stemming.
        </p>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 flex flex-col items-center min-h-[250px]">
          <div className="flex gap-4 flex-wrap justify-center mb-5">
            <Node visible={lexStep >= 1}>"The quick brown fox is running!"</Node>
          </div>
          <Arrow visible={lexStep >= 2} />
          <div className="flex gap-4 flex-wrap justify-center mb-5 mt-2">
            <Node visible={lexStep >= 3} faded={lexStep >= 4}>The</Node>
            <Node visible={lexStep >= 3}>quick</Node>
            <Node visible={lexStep >= 3}>brown</Node>
            <Node visible={lexStep >= 3}>fox</Node>
            <Node visible={lexStep >= 3} faded={lexStep >= 4}>is</Node>
            <Node visible={lexStep >= 3}>running</Node>
          </div>
          <Arrow visible={lexStep >= 5} />
          <div className="flex gap-4 flex-wrap justify-center mb-5 mt-2">
            <Node visible={lexStep >= 6}>quick</Node>
            <Node visible={lexStep >= 6}>brown</Node>
            <Node visible={lexStep >= 6}>fox</Node>
            <Node visible={lexStep >= 6} highlight={lexStep >= 6}>run</Node>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors" onClick={playLexical}>Play Animation</button>
            <button className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors" onClick={() => setLexStep(0)}>Reset</button>
          </div>
        </div>
      </motion.section>

      {/* ================= N-GRAMS ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="ngrams"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">N-grams</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Single words throw away word order — "not good" and "good not" look identical to a bag of words. N-grams fix
          this by treating <em>sequences</em> of N adjacent tokens as units, so short phrases become features in their
          own right.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">
            Sliding a window over: <code className="text-gray-300 font-mono normal-case">"the food was not good"</code>
          </div>
          {[
            { n: 1, name: 'Unigrams', tone: 'border-blue-500/40 bg-blue-500/10 text-blue-200', grams: ['the', 'food', 'was', 'not', 'good'] },
            { n: 2, name: 'Bigrams', tone: 'border-purple-500/40 bg-purple-500/10 text-purple-200', grams: ['the food', 'food was', 'was not', 'not good'] },
            { n: 3, name: 'Trigrams', tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200', grams: ['the food was', 'food was not', 'was not good'] },
          ].map((row, ri) => (
            <div key={row.n} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-300">{row.name}</span>
                <span className="text-[0.625rem] font-mono text-gray-600">N={row.n} · {row.grams.length} features</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.grams.map((g, i) => (
                  <motion.span
                    key={g}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: ri * 0.15 + i * 0.05 }}
                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs ${
                      g === 'not good' || g === 'was not good' ? 'border-rose-500/60 bg-rose-500/20 text-rose-200 font-bold' : row.tone
                    }`}
                  >
                    {g}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[0.6875rem] text-gray-500 mt-4 mb-0 leading-relaxed">
            Notice the highlighted <code className="text-rose-300">"not good"</code> — it only exists as a feature once
            N ≥ 2. That single bigram is the difference between a sentiment model that works and one that reads this
            review as positive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <div className="text-emerald-400 font-semibold mb-2 text-sm">What you gain</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Local word order and negation ("not good")</li>
              <li>• Fixed phrases as single concepts ("New York", "machine learning")</li>
              <li>• Better accuracy on short texts where context is scarce</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/10">
            <div className="text-rose-400 font-semibold mb-2 text-sm">What it costs</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Feature count explodes — vocabulary grows combinatorially</li>
              <li>• Severe sparsity: most n-grams appear once in the whole corpus</li>
              <li>• Still blind to long-range dependencies (that needs attention)</li>
            </ul>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="320px" code={`from sklearn.feature_extraction.text import CountVectorizer

# ngram_range=(1, 2) keeps BOTH unigrams and bigrams
vec = CountVectorizer(ngram_range=(1, 2), min_df=2)
X = vec.fit_transform(["the food was not good", "the food was good"])

print(vec.get_feature_names_out())
# ['food' 'food was' 'good' 'the' 'the food' 'was' 'was good' 'was not']

# min_df=2 drops n-grams appearing in fewer than 2 documents —
# essential, or the sparse tail will dominate your feature space.`} />
      </motion.section>

      {/* ================= VECTORIZATION ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="vectorization"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Text Vectorization</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Models need numbers. There are three broad generations of turning text into vectors, and they trade
          interpretability for semantic power.
        </p>

        {/* Document-term matrix visual */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6 overflow-x-auto">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Bag-of-Words document-term matrix</div>
          <table className="text-xs font-mono border-collapse min-w-[420px]">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500 font-normal"> </th>
                {['cat', 'dog', 'run', 'fast'].map((w) => (
                  <th key={w} className="p-2 text-indigo-300 font-semibold">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { d: 'doc 1: "cat run"', v: [1, 0, 1, 0] },
                { d: 'doc 2: "dog run fast"', v: [0, 1, 1, 1] },
                { d: 'doc 3: "cat cat dog"', v: [2, 1, 0, 0] },
              ].map((row) => (
                <tr key={row.d}>
                  <td className="p-2 text-gray-400 whitespace-nowrap pr-4">{row.d}</td>
                  {row.v.map((n, i) => (
                    <td key={i} className="p-2 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded ${
                        n === 0 ? 'bg-white/5 text-gray-600' : n === 1 ? 'bg-indigo-500/25 text-indigo-200' : 'bg-indigo-500/50 text-white font-bold'
                      }`}>{n}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[0.6875rem] text-gray-500 mt-3 mb-0">
            One row per document, one column per vocabulary word. Real matrices are ~30,000 columns wide and over 99%
            zeros — which is why they are stored as sparse matrices.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Method</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">What the numbers mean</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Captures meaning?</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Use when</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-xs">
              <tr>
                <td className="px-4 py-3 border-b border-gray-900 text-gray-200 font-semibold">Bag of Words</td>
                <td className="px-4 py-3 border-b border-gray-900">Raw count of each word</td>
                <td className="px-4 py-3 border-b border-gray-900 text-rose-400">No — "great" and "excellent" are unrelated</td>
                <td className="px-4 py-3 border-b border-gray-900">Fast baselines, tiny datasets</td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="px-4 py-3 border-b border-gray-900 text-gray-200 font-semibold">TF-IDF</td>
                <td className="px-4 py-3 border-b border-gray-900">Count, down-weighted by how common the word is across all docs</td>
                <td className="px-4 py-3 border-b border-gray-900 text-rose-400">No, but it finds <em>distinctive</em> words</td>
                <td className="px-4 py-3 border-b border-gray-900">Search, keyword extraction, strong classical baseline</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-900 text-gray-200 font-semibold">Word2Vec / GloVe</td>
                <td className="px-4 py-3 border-b border-gray-900">Dense ~300-dim vector learned from co-occurrence</td>
                <td className="px-4 py-3 border-b border-gray-900 text-amber-400">Yes, but one fixed vector per word</td>
                <td className="px-4 py-3 border-b border-gray-900">Word similarity, older embedding pipelines</td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="px-4 py-3 border-b border-gray-900 text-gray-200 font-semibold">Transformer embeddings</td>
                <td className="px-4 py-3 border-b border-gray-900">Dense vector that changes with surrounding context</td>
                <td className="px-4 py-3 border-b border-gray-900 text-emerald-400">Yes — "bank" differs by sentence</td>
                <td className="px-4 py-3 border-b border-gray-900">Semantic search, RAG, anything modern</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-6">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">The key limitation of the first two:</strong> they are
            <em> lexical</em> — matching depends on the exact word appearing. A search for "car" will never match a
            document that only says "automobile". That single gap is the whole reason embeddings and{' '}
            <a href="#/rag/fundamentals" className="text-blue-400 hover:underline">RAG</a>{' '}
            exist. See the{' '}
            <a href="#/rag/embeddings" className="text-blue-400 hover:underline">Embeddings guide</a>{' '}
            for how dense vectors solve it.
          </p>
        </div>

        <CodeBlock language="python" maxHeight="380px" code={`from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

docs = ["cat run", "dog run fast", "cat cat dog"]

# 1. Bag of Words — raw counts
bow = CountVectorizer()
print(bow.fit_transform(docs).toarray())
# [[1 0 0 1]
#  [0 1 1 1]
#  [2 1 0 0]]

# 2. TF-IDF — rare words weigh more, ubiquitous words weigh less
tfidf = TfidfVectorizer()
X = tfidf.fit_transform(docs)

# Which words does TF-IDF think are most distinctive in doc 3?
import numpy as np
names = tfidf.get_feature_names_out()
row = X[2].toarray()[0]
print(sorted(zip(names, row.round(3)), key=lambda p: -p[1])[:3])
# [('cat', 0.885), ('dog', 0.465), ('fast', 0.0)]`} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="spam"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Spam Detection Pipeline</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Using a Naive Bayes Classifier on Bag-of-Words representations allows us to determine if a message is Ham (normal) or Spam based on term probabilities.
        </p>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 flex flex-col items-center min-h-[250px]">
          <div className="flex items-center flex-wrap justify-center gap-2">
            <Node visible={spamStep >= 1}>"WINNER!! Claim prize now!"</Node>
            <ArrowRight visible={spamStep >= 2} />
            <Node visible={spamStep >= 3}>[0, 1, 0, 1, 1...]</Node>
            <ArrowRight visible={spamStep >= 4} />
            <Node visible={spamStep >= 5} highlight={spamStep >= 5}>
              <div>Naive Bayes</div>
              <div className="text-xs opacity-70">P(Spam|Text)</div>
            </Node>
            <ArrowRight visible={spamStep >= 6} />
            <Node visible={spamStep >= 7} danger={spamStep >= 7}>SPAM</Node>
          </div>
          <div className="flex gap-3 mt-10">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors" onClick={playSpam}>Play Animation</button>
            <button className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors" onClick={() => setSpamStep(0)}>Reset</button>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16" 
        id="syntactic"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Syntactic Processing (POS Tagging)</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Understanding grammatical structure is crucial. Hidden Markov Models (HMM) and the Viterbi Algorithm calculate the most probable sequence of tags for a given sentence.
        </p>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 flex flex-col items-center min-h-[250px]">
          <div className="flex items-center flex-wrap justify-center gap-4 mt-8">
            <Node visible={synStep >= 1}>
              The
              <PosTag visible={synStep >= 1}>DET</PosTag>
            </Node>
            <ArrowRight visible={synStep >= 2} />
            <Node visible={synStep >= 3}>
              fox
              <PosTag visible={synStep >= 3}>NOUN</PosTag>
            </Node>
            <ArrowRight visible={synStep >= 4} />
            <Node visible={synStep >= 5}>
              jumps
              <PosTag visible={synStep >= 5}>VERB</PosTag>
            </Node>
          </div>
          <div className="flex gap-3 mt-12">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors" onClick={playSyn}>Play Animation</button>
            <button className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors" onClick={() => setSynStep(0)}>Reset</button>
          </div>
        </div>
      </motion.section>

      {/* ================= NER ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="ner"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Named Entity Recognition (NER)</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          POS tagging tells you a word is a noun. NER goes further and tells you <em>what real-world thing</em> it
          refers to — a person, a company, a date, an amount. It is the bridge from unstructured text to structured
          records you can put in a database.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">Tagged sentence</div>
          <div className="flex flex-wrap items-end gap-x-2 gap-y-6 text-lg leading-loose">
            {[
              { w: 'Satya Nadella', t: 'PERSON', c: 'bg-blue-500/20 border-blue-500/50 text-blue-200', lc: 'bg-blue-500 text-black' },
              { w: 'announced that', t: null },
              { w: 'Microsoft', t: 'ORG', c: 'bg-purple-500/20 border-purple-500/50 text-purple-200', lc: 'bg-purple-500 text-black' },
              { w: 'will invest', t: null },
              { w: '$10 billion', t: 'MONEY', c: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200', lc: 'bg-emerald-500 text-black' },
              { w: 'in', t: null },
              { w: 'OpenAI', t: 'ORG', c: 'bg-purple-500/20 border-purple-500/50 text-purple-200', lc: 'bg-purple-500 text-black' },
              { w: 'by', t: null },
              { w: 'January 2026', t: 'DATE', c: 'bg-amber-500/20 border-amber-500/50 text-amber-200', lc: 'bg-amber-500 text-black' },
              { w: '.', t: null },
            ].map((tok, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative inline-block"
              >
                {tok.t ? (
                  <>
                    <span className={`px-2 py-1 rounded-md border font-medium ${tok.c}`}>{tok.w}</span>
                    <span className={`absolute -top-5 left-0 text-[0.5625rem] font-bold px-1.5 py-0.5 rounded ${tok.lc}`}>
                      {tok.t}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">{tok.w}</span>
                )}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Standard entity types</h3>
            <div className="flex flex-wrap gap-2">
              {[
                ['PERSON', 'people'], ['ORG', 'companies'], ['GPE', 'countries/cities'],
                ['DATE', 'absolute or relative'], ['MONEY', 'monetary values'], ['PRODUCT', 'objects'],
                ['EVENT', 'named events'], ['LAW', 'named documents'],
              ].map(([t, d]) => (
                <span key={t} className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <span className="font-mono font-bold text-indigo-300">{t}</span>
                  <span className="text-gray-500 ml-1.5">{d}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Why it's genuinely hard</h3>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>• <strong className="text-gray-200">Ambiguity:</strong> "Apple" the company vs the fruit — only context decides.</li>
              <li>• <strong className="text-gray-200">Multi-token spans:</strong> "New York Times" is one entity, not three.</li>
              <li>• <strong className="text-gray-200">Nesting:</strong> "Bank of England" contains a location inside an org.</li>
              <li>• <strong className="text-gray-200">Novelty:</strong> new companies and products appear constantly.</li>
            </ul>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="380px" code={`import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Satya Nadella announced that Microsoft will invest "
          "$10 billion in OpenAI by January 2026.")

for ent in doc.ents:
    print(f"{ent.text:<18} {ent.label_:<8} {spacy.explain(ent.label_)}")

# Satya Nadella      PERSON   People, including fictional
# Microsoft          ORG      Companies, agencies, institutions
# $10 billion        MONEY    Monetary values, including unit
# OpenAI             ORG      Companies, agencies, institutions
# January 2026       DATE     Absolute or relative dates

# Turn free text into a structured record:
record = {ent.label_: ent.text for ent in doc.ents}`} />

        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">Where this shows up in AI engineering:</strong> NER is how you extract
            metadata during{' '}
            <a href="#/rag/data-prep" className="text-blue-400 hover:underline">RAG data prep</a>{' '}
            — pulling dates, authors, and companies out of documents so you can filter on them at retrieval time. It is
            also the classic way to redact PII before sending text to a third-party model.
          </p>
        </div>
      </motion.section>

      {/* ================= SENTIMENT ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="sentiment"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Sentiment Analysis</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Classifying the emotional polarity of text — positive, negative, or neutral. It looks like the easiest NLP
          task and is deceptively hard, because meaning flips on small words.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">Polarity scores</div>
          <div className="space-y-3">
            {[
              { t: '"This is absolutely fantastic!"', s: 0.92, ok: true },
              { t: '"The food was good."', s: 0.44, ok: true },
              { t: '"It arrived on Tuesday."', s: 0.0, ok: true },
              { t: '"The food was not good."', s: -0.42, ok: true },
              { t: '"Terrible. Complete waste of money."', s: -0.88, ok: true },
              { t: '"Oh great, another delay."', s: 0.68, ok: false, note: 'sarcasm — model gets this wrong' },
            ].map((r, i) => {
              const pct = ((r.s + 1) / 2) * 100;
              return (
                <motion.div
                  key={r.t}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span className={`text-xs font-mono sm:w-72 shrink-0 ${r.ok ? 'text-gray-300' : 'text-rose-300'}`}>
                    {r.t}
                  </span>
                  <div className="flex-1 h-5 rounded bg-white/5 relative overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />
                    <motion.div
                      className={`absolute top-0 bottom-0 ${r.s >= 0 ? 'bg-emerald-500/60' : 'bg-rose-500/60'}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.abs(pct - 50)}%`, left: r.s >= 0 ? '50%' : `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.15, type: 'spring', stiffness: 70 }}
                    />
                  </div>
                  <span className={`text-xs font-mono w-14 text-right shrink-0 ${r.s >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {r.s > 0 ? '+' : ''}{r.s.toFixed(2)}
                  </span>
                  {r.note && <span className="text-[0.625rem] text-rose-400 sm:w-44">⚠ {r.note}</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { t: 'Lexicon-based', d: 'Look up each word in a sentiment dictionary (VADER, TextBlob) and combine scores. No training data needed, handles emoji and intensifiers.', tone: 'border-blue-500/25 bg-blue-500/10', label: 'text-blue-400' },
            { t: 'Classical ML', d: 'TF-IDF features into logistic regression or Naive Bayes, trained on labelled reviews. Strong and cheap when you have in-domain data.', tone: 'border-purple-500/25 bg-purple-500/10', label: 'text-purple-400' },
            { t: 'Transformer', d: 'Fine-tuned BERT or an LLM prompt. Handles negation, context, and mixed sentiment far better — at higher cost per call.', tone: 'border-emerald-500/25 bg-emerald-500/10', label: 'text-emerald-400' },
          ].map((c) => (
            <div key={c.t} className={`p-5 rounded-xl border ${c.tone}`}>
              <div className={`font-semibold text-sm mb-1.5 ${c.label}`}>{c.t}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 mb-6">
          <div className="text-sm font-semibold text-rose-300 mb-2">What breaks sentiment models</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
            <div>• <strong className="text-gray-100">Negation:</strong> "not good" — needs bigrams or context</div>
            <div>• <strong className="text-gray-100">Sarcasm:</strong> "Oh great, another delay"</div>
            <div>• <strong className="text-gray-100">Comparison:</strong> "better than their last awful one"</div>
            <div>• <strong className="text-gray-100">Mixed:</strong> "great screen, terrible battery"</div>
            <div>• <strong className="text-gray-100">Domain:</strong> "unpredictable" is bad for a car, good for a thriller</div>
            <div>• <strong className="text-gray-100">Emoji/slang:</strong> "this slaps 🔥" is positive</div>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="400px" code={`# --- Option 1: lexicon-based, no training required ---
from nltk.sentiment.vader import SentimentIntensityAnalyzer

sia = SentimentIntensityAnalyzer()
print(sia.polarity_scores("The food was not good."))
# {'neg': 0.31, 'neu': 0.69, 'pos': 0.0, 'compound': -0.3412}
# VADER handles negation and intensifiers out of the box.

# --- Option 2: classical ML with bigrams (captures "not good") ---
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

clf = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2)),   # bigrams are essential here
    LogisticRegression(max_iter=1000),
)
clf.fit(train_texts, train_labels)

# --- Option 3: transformer, best accuracy ---
from transformers import pipeline

sentiment = pipeline("sentiment-analysis")
print(sentiment("The food was not good."))
# [{'label': 'NEGATIVE', 'score': 0.9998}]`} />
      </motion.section>

      {/* ================= TOPIC MODELING ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="topics"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Topic Modeling</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Given thousands of documents and no labels, what are they <em>about</em>? Topic modeling is unsupervised —
          it discovers clusters of words that tend to co-occur, and each discovered "topic" is a probability
          distribution over the vocabulary. You name the topics yourself by reading their top words.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">
            LDA over a news corpus — 3 discovered topics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Topic 0', guess: '→ you\'d call this "Finance"', tone: 'text-emerald-400', bar: 'bg-emerald-500', words: [['market', 0.041], ['shares', 0.033], ['profit', 0.028], ['quarter', 0.022], ['investors', 0.018]] },
              { name: 'Topic 1', guess: '→ "Sports"', tone: 'text-blue-400', bar: 'bg-blue-500', words: [['season', 0.038], ['team', 0.035], ['coach', 0.026], ['match', 0.021], ['players', 0.017]] },
              { name: 'Topic 2', guess: '→ "Technology"', tone: 'text-purple-400', bar: 'bg-purple-500', words: [['model', 0.044], ['data', 0.036], ['software', 0.025], ['chip', 0.020], ['users', 0.016]] },
            ].map((t, ti) => (
              <div key={t.name}>
                <div className={`font-bold text-sm mb-0.5 ${t.tone}`}>{t.name}</div>
                <div className="text-[0.625rem] text-gray-600 mb-3 italic">{t.guess}</div>
                <div className="space-y-1.5">
                  {t.words.map((w, wi) => (
                    <div key={w[0]} className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-mono text-gray-400 w-20 shrink-0">{w[0]}</span>
                      <div className="flex-1 h-3 rounded bg-white/5 overflow-hidden">
                        <motion.div
                          className={`h-full ${t.bar} opacity-70`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(w[1] / 0.044) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: ti * 0.12 + wi * 0.05 }}
                        />
                      </div>
                      <span className="text-[0.5625rem] font-mono text-gray-600 w-9 text-right">{w[1].toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[0.6875rem] text-gray-500 mt-4 mb-0 leading-relaxed">
            The algorithm never sees the labels "Finance" or "Sports" — it only finds that these words cluster
            together. Naming the topics is a human judgement call, which is why topic modeling is exploratory rather
            than a finished classifier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <h3 className="font-semibold text-white text-sm mb-2">LDA (Latent Dirichlet Allocation)</h3>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              The classic. Assumes each document is a mixture of topics, and each topic a mixture of words. Works on
              counts, so it needs a decent corpus and careful preprocessing — and you must choose the number of topics
              upfront.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <h3 className="font-semibold text-white text-sm mb-2">BERTopic (modern)</h3>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Embeds documents with a transformer, reduces dimensionality with UMAP, clusters with HDBSCAN, then
              labels clusters with class-based TF-IDF. Handles short text far better and discovers the topic count
              itself.
            </p>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="380px" code={`from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer

# LDA works on raw counts, not TF-IDF
vec = CountVectorizer(max_df=0.95, min_df=2, stop_words="english")
X = vec.fit_transform(documents)

lda = LatentDirichletAllocation(n_components=3, random_state=42)
lda.fit(X)

names = vec.get_feature_names_out()
for idx, topic in enumerate(lda.components_):
    top = [names[i] for i in topic.argsort()[-5:][::-1]]
    print(f"Topic {idx}: {', '.join(top)}")

# Topic 0: market, shares, profit, quarter, investors
# Topic 1: season, team, coach, match, players
# Topic 2: model, data, software, chip, users

# How much of each topic is in document 0?
print(lda.transform(X[0]).round(2))   # -> [[0.91 0.04 0.05]]`} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mb-16"
        id="spell"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Spell Corrector (Edit Distance)</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Calculating the Levenshtein Distance (minimum insertions, deletions, substitutions) allows models to generate candidate corrections, which are then scored by a Language Model.
        </p>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 flex flex-col items-center min-h-[250px]">
          <div className="flex items-center flex-wrap justify-center gap-2">
            <Node visible={spellStep >= 1} danger={spellStep >= 1}>"speling"</Node>
            <ArrowRight visible={spellStep >= 2} />
            <Node visible={spellStep >= 3} className="text-left">
              <div>Candidates:</div>
              <div className={`text-xs mt-1 transition-colors ${spellStep >= 4 ? 'text-emerald-400' : 'text-gray-400'}`}>spelling (Dist: 1)</div>
              <div className="text-xs text-gray-400">peeling (Dist: 2)</div>
            </Node>
            <ArrowRight visible={spellStep >= 5} />
            <Node visible={spellStep >= 6}>
              <div>LM Prob:</div>
              <div className="text-xs opacity-70">P(spelling) &gt; P(peeling)</div>
            </Node>
            <ArrowRight visible={spellStep >= 7} />
            <Node visible={spellStep >= 8} highlight={spellStep >= 8}>"spelling"</Node>
          </div>
          <div className="flex gap-3 mt-10">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors" onClick={playSpell}>Play Animation</button>
            <button className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors" onClick={() => setSpellStep(0)}>Reset</button>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section" 
        id="wordcloud"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Word Cloud & Frequency Analysis</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Word clouds visualize the frequency of terms in a document by making the physical size of each word proportional to its occurrence rate. Before plotting, common "stopwords" (such as <em>the</em>, <em>is</em>, <em>and</em>) are filtered out, and symbols are stripped to keep only meaningful vocabulary.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Interactive Generator */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white">Interactive Word Cloud</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input Text</label>
              <textarea 
                className="w-full h-32 bg-[#141414] border border-gray-800 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste some text here..."
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-2">Presets:</span>
              <button 
                className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs text-gray-300 transition-colors"
                onClick={() => setInputText("Artificial Intelligence and Machine Learning are transforming modern technology. AI agents utilize Large Language Models (LLMs) to perform reasoning, while Retrieval-Augmented Generation (RAG) connects LLMs to external vector databases for grounded context. Python is the dominant language for building neural networks, training models, and deploying production AI systems.")}
              >
                AI & RAG
              </button>
              <button 
                className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs text-gray-300 transition-colors"
                onClick={() => setInputText("React is a popular JavaScript library for building user interfaces. Components render dynamic UI layouts, managing state and props reactively. Tailwind CSS provides utility-first styling, and Vite offers fast dev builds and optimized production bundlers. Framer Motion enables smooth micro-animations and physics-based transitions.")}
              >
                Frontend Tech
              </button>
              <button 
                className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs text-gray-300 transition-colors"
                onClick={() => setInputText("Data science involves parsing structured tables and matrices. NumPy optimizes vectorized mathematics, performing calculations on multi-dimensional array structures. Pandas simplifies data manipulation with robust DataFrames, cleaning datasets for predictive machine learning models in Scikit-Learn.")}
              >
                Data Science
              </button>
            </div>

            {/* Generated Word Cloud Render */}
            <div className="bg-[#141414] border border-gray-950 rounded-lg p-6 min-h-[220px] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 overflow-hidden select-none">
              {(() => {
                const defaultStopwords = new Set([
                  "the", "a", "an", "is", "are", "was", "were", "and", "or", "but", "to", "in", 
                  "on", "at", "for", "with", "of", "by", "that", "this", "these", "those", "i", 
                  "you", "he", "she", "it", "they", "we", "us", "them", "my", "your", "his", 
                  "her", "its", "our", "their", "be", "been", "have", "has", "had", "do", "does", 
                  "did", "will", "would", "can", "could", "should", "as", "from", "about", "into"
                ]);

                const cleanText = inputText.toLowerCase().replace(/[^\w\s-]/g, "");
                const words = cleanText.split(/\s+/).filter(w => w.length > 2 && !defaultStopwords.has(w));
                const counts = {};
                words.forEach(w => {
                  counts[w] = (counts[w] || 0) + 1;
                });
                
                const sortedWords = Object.entries(counts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 25);

                const maxCount = sortedWords.length > 0 ? sortedWords[0][1] : 1;
                
                const cloudWords = sortedWords.map(([word, count]) => {
                  const ratio = count / maxCount;
                  const fontSize = 0.95 + ratio * 1.55;
                  const colors = [
                    "text-indigo-400", "text-purple-400", "text-pink-400", 
                    "text-emerald-400", "text-sky-400", "text-amber-400",
                    "text-rose-400", "text-cyan-400"
                  ];
                  const hash = word.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const color = colors[hash % colors.length];
                  return { word, count, fontSize, color };
                });

                const displayWords = [...cloudWords].sort((a, b) => a.word.localeCompare(b.word));

                if (displayWords.length === 0) {
                  return <span className="text-xs text-gray-500 italic">No significant words found. Try typing more text.</span>;
                }

                return displayWords.map(({ word, count, fontSize, color }, idx) => (
                  <motion.span
                    key={word}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: idx * 0.01 }}
                    className={`${color} hover:text-white transition-colors cursor-pointer select-none font-bold`}
                    style={{ fontSize: `${fontSize}rem` }}
                    title={`Count: ${count}`}
                  >
                    {word}
                  </motion.span>
                ));
              })()}
            </div>
          </div>

          {/* Python Example Code */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Python Implementation</h3>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded font-mono font-medium">wordcloud</span>
            </div>
            
            <CodeBlock language="python" maxHeight="460px">
              <code>
                <span className="text-gray-500"># Install dependencies: pip install wordcloud matplotlib</span>{"\n"}
                <span className="text-pink-400">import</span> matplotlib.pyplot <span className="text-pink-400">as</span> plt{"\n"}
                <span className="text-pink-400">from</span> wordcloud <span className="text-pink-400">import</span> WordCloud, STOPWORDS{"\n\n"}
                <span className="text-gray-500"># 1. Define text content</span>{"\n"}
                text = <span className="text-emerald-400">"""AI engineering is transforming software development. AI agents use tool-calling and RAG to retrieve information, process context, and output structured reasoning."""</span>{"\n\n"}
                <span className="text-gray-500"># 2. Add custom stop words to filter out</span>{"\n"}
                stopwords = set(STOPWORDS){"\n"}
                stopwords.update([<span className="text-emerald-400">"use"</span>, <span className="text-emerald-400">"process"</span>]){"\n\n"}
                <span className="text-gray-500"># 3. Initialize and generate the Word Cloud</span>{"\n"}
                wordcloud = WordCloud({"\n"}
                {"    "}width=<span className="text-amber-400">800</span>,{"\n"}
                {"    "}height=<span className="text-amber-400">400</span>,{"\n"}
                {"    "}background_color=<span className="text-emerald-400">'black'</span>,{"\n"}
                {"    "}stopwords=stopwords,{"\n"}
                {"    "}colormap=<span className="text-emerald-400">'cool'</span>,{"\n"}
                {"    "}min_font_size=<span className="text-amber-400">10</span>{"\n"}
                ).generate(text){"\n\n"}
                <span className="text-gray-500"># 4. Display the rendering plot using Matplotlib</span>{"\n"}
                plt.figure(figsize=(<span className="text-amber-400">10, 5</span>)){"\n"}
                plt.imshow(wordcloud, interpolation=<span className="text-emerald-400">'bilinear'</span>){"\n"}
                plt.axis(<span className="text-emerald-400">"off"</span>){"\n"}
                plt.show()
              </code>
            </CodeBlock>
          </div>
        </div>
      </motion.section>

      {/* ================= CLASSICAL -> TRANSFORMERS ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="guide-section mt-16"
        id="modern"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Classical NLP → Transformers</h2>
        <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
          Everything above is <em>feature engineering</em>: humans deciding which properties of text matter, then
          handing those features to a model. Transformers removed that step — they learn representations directly from
          raw text. Here is what changed, and what stayed useful.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6 overflow-x-auto">
          <div className="flex items-stretch gap-3 min-w-[680px]">
            {[
              { era: '1990s–2000s', t: 'Rules & counts', d: 'Regex, BoW, TF-IDF, Naive Bayes. Fully interpretable, no semantics.', tone: 'border-gray-700 bg-white/5 text-gray-300' },
              { era: '2013–2017', t: 'Word embeddings', d: 'Word2Vec, GloVe. Words gain meaning, but one fixed vector each.', tone: 'border-blue-500/40 bg-blue-500/10 text-blue-200' },
              { era: '2018–2020', t: 'Contextual + RNN', d: 'ELMo, LSTMs, BERT. A word\'s vector finally depends on its sentence.', tone: 'border-purple-500/40 bg-purple-500/10 text-purple-200' },
              { era: '2020–now', t: 'Large LMs', d: 'GPT-class models. One model handles every task via prompting.', tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.t}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex-1 rounded-xl border p-4 ${s.tone}`}
                >
                  <div className="text-[0.5625rem] font-mono uppercase tracking-wide opacity-60 mb-1">{s.era}</div>
                  <div className="font-bold text-sm mb-1.5">{s.t}</div>
                  <div className="text-[0.625rem] opacity-80 leading-snug">{s.d}</div>
                </motion.div>
                {i < arr.length - 1 && <div className="flex items-center text-gray-600 text-xl shrink-0">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <div className="text-emerald-400 font-semibold mb-3">Still reach for classical NLP when</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• You need millisecond latency on millions of documents</li>
              <li>• The budget is near zero — TF-IDF costs nothing to run</li>
              <li>• You must explain exactly why a decision was made</li>
              <li>• Filtering or deduplicating <em>before</em> an expensive LLM call</li>
              <li>• Keyword search where exact terms matter (see hybrid retrieval)</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/10">
            <div className="text-blue-400 font-semibold mb-3">Reach for transformers when</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Meaning matters more than exact wording</li>
              <li>• The task needs real context — negation, sarcasm, coreference</li>
              <li>• You have little or no labelled training data</li>
              <li>• One model must handle many different tasks</li>
              <li>• You're building semantic search or RAG</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">These are not rivals in practice.</strong> A production system often uses
            regex to clean text, TF-IDF/BM25 for a fast first-pass filter, and a transformer only on the surviving
            candidates — the hybrid pattern described in{' '}
            <a href="#/rag/advanced-retrieval" className="text-blue-400 hover:underline">
              Advanced Retrieval
            </a>
            . Next: see how the architecture itself works in the{' '}
            <a href="#/ml/transformers" className="text-blue-400 hover:underline">
              Transformers deep-dive
            </a>
            .
          </p>
        </div>
      </motion.section>
    </GuideLayout>
  );
}

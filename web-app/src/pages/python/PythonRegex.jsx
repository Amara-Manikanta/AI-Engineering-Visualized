import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../../components/GuideLayout';
import CodeBlock from '../../components/CodeBlock';

/* ---------------------------------------------------------------------------
   Live regex tester — runs the real JS engine, so results are genuine.
   Python's `re` and JS RegExp share the same core syntax for everything
   taught here; differences are called out in the notes below.
--------------------------------------------------------------------------- */

const PRESETS = [
  {
    name: 'Email',
    pattern: String.raw`[\w.+-]+@[\w-]+\.[\w.]+`,
    flags: 'g',
    text: 'Contact ada@example.com or grace.hopper+navy@navy.mil.\nInvalid: not@an, @nope.com',
  },
  {
    name: 'Capture groups',
    pattern: String.raw`(\d{4})-(\d{2})-(\d{2})`,
    flags: 'g',
    text: 'Released 2024-11-02, patched 2025-03-17.\nBad date: 24-1-2',
  },
  {
    name: 'Named groups',
    pattern: String.raw`(?<user>\w+)@(?<domain>[\w.]+)`,
    flags: 'g',
    text: 'ada@example.com and linus@kernel.org',
  },
  {
    name: 'Log parsing',
    pattern: String.raw`^(\w+)\s+\[(\d{3})\]\s+(.*)$`,
    flags: 'gm',
    text: 'GET [200] /api/users\nPOST [404] /api/missing\nDELETE [500] /api/crash',
  },
  {
    name: 'Greedy vs lazy',
    pattern: String.raw`<.+?>`,
    flags: 'g',
    text: '<b>bold</b> and <i>italic</i>',
  },
  {
    name: 'Word boundary',
    pattern: String.raw`\bcat\b`,
    flags: 'gi',
    text: 'The cat sat. Concatenate is not a cat. CAT scan.',
  },
];

const ALL_FLAGS = [
  { f: 'g', label: 'global', desc: 'find all matches, not just the first' },
  { f: 'i', label: 'ignore case', desc: 'a matches A' },
  { f: 'm', label: 'multiline', desc: '^ and $ match at each line' },
  { f: 's', label: 'dotall', desc: '. also matches newline' },
];

function RegexTester() {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [text, setText] = useState(PRESETS[0].text);

  const loadPreset = (p) => {
    setPattern(p.pattern);
    setFlags(p.flags);
    setText(p.text);
  };

  const toggleFlag = (f) =>
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, '') : cur + f));

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const re = new RegExp(pattern, flags);
      if (flags.includes('g')) {
        return { matches: [...text.matchAll(re)], error: null };
      }
      const m = re.exec(text);
      return { matches: m ? [m] : [], error: null };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, text]);

  // Split the text into highlighted / plain segments
  const segments = useMemo(() => {
    if (error || matches.length === 0) return [{ t: text, hit: false }];
    const out = [];
    let cursor = 0;
    matches.forEach((m) => {
      if (m.index === undefined) return;
      if (m.index > cursor) out.push({ t: text.slice(cursor, m.index), hit: false });
      out.push({ t: m[0], hit: true });
      cursor = m.index + (m[0].length || 1); // guard zero-length matches
    });
    if (cursor < text.length) out.push({ t: text.slice(cursor), hit: false });
    return out;
  }, [matches, text, error]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      {/* presets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              pattern === p.pattern
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* pattern input */}
      <label className="block text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1.5">Pattern</label>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-600 font-mono text-lg">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          className={`flex-1 bg-[#141414] border rounded-lg px-3 py-2.5 font-mono text-sm text-indigo-200 outline-none focus:border-indigo-500/60 ${
            error ? 'border-rose-500/60' : 'border-gray-800'
          }`}
        />
        <span className="text-gray-600 font-mono text-lg">/</span>
        <span className="font-mono text-sm text-amber-300 w-10">{flags}</span>
      </div>

      {/* flags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_FLAGS.map((f) => (
          <button
            key={f.f}
            onClick={() => toggleFlag(f.f)}
            title={f.desc}
            className={`px-2.5 py-1 rounded-md border text-[0.6875rem] font-mono transition-colors ${
              flags.includes(f.f)
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
            }`}
          >
            {f.f} <span className="opacity-60">{f.label}</span>
          </button>
        ))}
      </div>

      {/* test text */}
      <label className="block text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1.5">Test string</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={4}
        className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2.5 font-mono text-sm text-gray-300 outline-none focus:border-indigo-500/60 resize-y mb-4"
      />

      {/* result */}
      {error ? (
        <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs font-mono text-rose-300">
          Invalid pattern: {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.625rem] uppercase tracking-wide text-gray-500">Result</span>
            <span className={`text-xs font-mono ${matches.length ? 'text-emerald-400' : 'text-gray-600'}`}>
              {matches.length} match{matches.length === 1 ? '' : 'es'}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#141414] border border-gray-800 font-mono text-sm whitespace-pre-wrap break-words mb-4">
            {segments.map((s, i) =>
              s.hit ? (
                <mark key={i} className="bg-emerald-500/30 text-emerald-100 rounded px-0.5 border-b-2 border-emerald-500">
                  {s.t}
                </mark>
              ) : (
                <span key={i} className="text-gray-500">{s.t}</span>
              )
            )}
          </div>

          {/* capture groups */}
          {matches.length > 0 && (matches[0].length > 1 || matches[0].groups) && (
            <div>
              <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">Captured groups</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {matches.slice(0, 8).map((m, mi) => (
                  <div key={mi} className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="text-gray-600 w-12 shrink-0">#{mi + 1}</span>
                    {m.slice(1).map((g, gi) => (
                      <span key={gi} className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-200">
                        <span className="text-indigo-400/70 mr-1">
                          {m.groups
                            ? Object.keys(m.groups)[gi] ?? gi + 1
                            : gi + 1}:
                        </span>
                        {g === undefined ? <em className="text-gray-600">undefined</em> : g}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const SYNTAX = [
  {
    group: 'Character classes',
    tone: 'text-blue-400',
    rows: [
      ['.', 'any character except newline', 'a.c → abc, a7c'],
      [String.raw`\d`, 'digit [0-9]', String.raw`\d\d → 42`],
      [String.raw`\w`, 'word char [a-zA-Z0-9_]', String.raw`\w+ → hello_1`],
      [String.raw`\s`, 'whitespace (space, tab, newline)', String.raw`a\sb → "a b"`],
      [String.raw`\D \W \S`, 'negated versions of the above', String.raw`\D → any non-digit`],
      ['[abc]', 'any one of a, b, or c', '[aeiou] → a vowel'],
      ['[^abc]', 'any character except a, b, c', '[^0-9] → non-digit'],
      ['[a-z]', 'range', '[A-Za-z] → any letter'],
    ],
  },
  {
    group: 'Quantifiers',
    tone: 'text-purple-400',
    rows: [
      ['*', '0 or more', 'ab* → a, ab, abbb'],
      ['+', '1 or more', 'ab+ → ab, abbb (not a)'],
      ['?', '0 or 1 (optional)', 'colou?r → color, colour'],
      ['{3}', 'exactly 3', String.raw`\d{3} → 123`],
      ['{2,4}', 'between 2 and 4', String.raw`\d{2,4} → 12, 1234`],
      ['{2,}', '2 or more', String.raw`\d{2,} → 12, 123456`],
      ['*? +? ??', 'lazy — match as few as possible', '<.+?> → <b>'],
    ],
  },
  {
    group: 'Anchors & boundaries',
    tone: 'text-emerald-400',
    rows: [
      ['^', 'start of string (or line with m)', '^Hello'],
      ['$', 'end of string (or line with m)', 'world$'],
      [String.raw`\b`, 'word boundary', String.raw`\bcat\b → "cat", not "concat"`],
      [String.raw`\B`, 'not a word boundary', String.raw`\Bcat → "concat"`],
    ],
  },
  {
    group: 'Groups & alternation',
    tone: 'text-amber-400',
    rows: [
      ['(abc)', 'capturing group', '(\\d+)-(\\d+) → two groups'],
      ['(?:abc)', 'non-capturing group', 'group without saving it'],
      ['(?P<name>…)', 'named group (Python syntax)', "m.group('year')"],
      ['a|b', 'alternation — a or b', 'cat|dog'],
      [String.raw`\1`, 'backreference to group 1', String.raw`(\w)\1 → doubled letter`],
    ],
  },
  {
    group: 'Lookarounds',
    tone: 'text-rose-400',
    rows: [
      ['(?=abc)', 'positive lookahead — followed by', String.raw`\d+(?= USD)`],
      ['(?!abc)', 'negative lookahead — not followed by', String.raw`\d+(?! USD)`],
      ['(?<=abc)', 'positive lookbehind — preceded by', '(?<=\\$)\\d+'],
      ['(?<!abc)', 'negative lookbehind — not preceded by', '(?<!\\$)\\d+'],
    ],
  },
];

export default function PythonRegex() {
  const toc = [
    { label: 'What Regex Is (and Isn\'t)', hash: '#what' },
    { label: 'Interactive Tester', hash: '#tester' },
    { label: 'Syntax Reference', hash: '#syntax' },
    { label: 'Greedy vs Lazy', hash: '#greedy' },
    { label: 'Groups & Capturing', hash: '#groups' },
    { label: 'The Python re Module', hash: '#re-module' },
    { label: 'Pattern Cookbook', hash: '#cookbook' },
    { label: 'Performance & Pitfalls', hash: '#pitfalls' },
  ];

  return (
    <GuideLayout
      title="Regular Expressions"
      intro="A tiny language for describing text patterns — the fastest way to find, validate, extract, and clean strings in Python."
      toc={toc}
    >
      <div className="space-y-16">
        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="what" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">What Regex Is (and Isn't)</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            A regular expression is a compact pattern that describes a <em>set of strings</em>. Instead of writing
            loops and index arithmetic to find every date in a document, you describe the shape of a date once and let
            the engine do the scanning. In AI engineering it shows up constantly — cleaning scraped text, parsing logs,
            validating model output, and chunking documents before embedding.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
              <div className="text-emerald-400 font-semibold mb-3">✅ Great for</div>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li>• Validating format (emails, IDs, postcodes)</li>
                <li>• Extracting structured bits from semi-structured text</li>
                <li>• Search &amp; replace with captured groups</li>
                <li>• Splitting on complex delimiters</li>
                <li>• Stripping junk during text preprocessing</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/10">
              <div className="text-rose-400 font-semibold mb-3">❌ The wrong tool for</div>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li>• Parsing HTML or XML — use a real parser</li>
                <li>• Nested structures (JSON, code) — regex can't count depth</li>
                <li>• Anything needing semantic understanding</li>
                <li>• Full email RFC validation — the real spec is monstrous</li>
                <li>• Logic a plain <code className="text-gray-400">str.split()</code> would express more clearly</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
            <p className="text-sm text-amber-200 leading-relaxed m-0">
              <strong>The readability rule:</strong> a regex is write-once, read-many. If a pattern needs more than a
              line or two, use <code className="font-mono">re.VERBOSE</code> to split it across lines with comments — or
              replace it with plain string methods. A clever regex nobody can maintain is a liability.
            </p>
          </div>
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="tester" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-2 text-gray-100">Interactive Tester</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-3xl">
            A real regex engine running live. Pick a preset or type your own pattern — matches highlight as you type,
            and captured groups appear underneath. Toggle the flags to see exactly what each one changes.
          </p>
          <RegexTester />
          <p className="text-xs text-gray-500 mt-3">
            This runs the JavaScript engine. The syntax shown here is shared with Python's{' '}
            <code className="text-gray-400">re</code>, with two differences noted below: Python writes named groups as{' '}
            <code className="text-gray-400">(?P&lt;name&gt;…)</code>, and uses flags like{' '}
            <code className="text-gray-400">re.IGNORECASE</code> instead of trailing letters.
          </p>
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="syntax" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Syntax Reference</h2>
          <div className="space-y-6">
            {SYNTAX.map((sec) => (
              <div key={sec.group}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${sec.tone}`}>{sec.group}</h3>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-sm border-collapse">
                    <tbody className="text-gray-400">
                      {sec.rows.map(([sym, desc, ex], i) => (
                        <tr key={sym} className={i % 2 ? 'bg-gray-900/30' : ''}>
                          <td className="px-4 py-2.5 border-b border-gray-900 font-mono text-indigo-300 whitespace-nowrap w-32">{sym}</td>
                          <td className="px-4 py-2.5 border-b border-gray-900 text-xs">{desc}</td>
                          <td className="px-4 py-2.5 border-b border-gray-900 font-mono text-[0.6875rem] text-gray-600 whitespace-nowrap">{ex}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="greedy" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Greedy vs Lazy</h2>
          <p className="text-gray-300 mb-6 max-w-3xl">
            By default quantifiers are <strong className="text-white">greedy</strong>: they consume as much as
            possible, then backtrack only if the rest of the pattern fails. Adding <code className="text-amber-300 font-mono">?</code>{' '}
            makes them <strong className="text-white">lazy</strong> — matching as little as possible. This single
            character is the most common source of "why does my regex grab too much?".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-rose-400">Greedy</span>
                <code className="text-xs font-mono text-gray-400">&lt;.+&gt;</code>
              </div>
              <div className="font-mono text-sm mb-2">
                <mark className="bg-rose-500/30 text-rose-100 rounded px-0.5">&lt;b&gt;bold&lt;/b&gt;</mark>
              </div>
              <p className="text-[0.6875rem] text-gray-500 leading-relaxed m-0">
                <code>.+</code> swallows everything to the last <code>&gt;</code> — one giant match spanning both tags.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-black/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-emerald-400">Lazy</span>
                <code className="text-xs font-mono text-gray-400">&lt;.+?&gt;</code>
              </div>
              <div className="font-mono text-sm mb-2">
                <mark className="bg-emerald-500/30 text-emerald-100 rounded px-0.5">&lt;b&gt;</mark>
                <span className="text-gray-500">bold</span>
                <mark className="bg-emerald-500/30 text-emerald-100 rounded px-0.5">&lt;/b&gt;</mark>
              </div>
              <p className="text-[0.6875rem] text-gray-500 leading-relaxed m-0">
                <code>.+?</code> stops at the first <code>&gt;</code> — two separate, correct matches.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Try it yourself: load the <strong className="text-gray-400">"Greedy vs lazy"</strong> preset in the tester
            above and delete the <code className="text-amber-300">?</code>.
          </p>
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="groups" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Groups & Capturing</h2>
          <p className="text-gray-300 mb-6 max-w-3xl">
            Parentheses do two jobs: they group parts of a pattern, and they <em>capture</em> what matched so you can
            pull it out afterwards. Capturing is what turns regex from a search tool into an extraction tool.
          </p>
          <CodeBlock language="python" maxHeight="460px" code={`import re

log = "2024-11-02 ERROR Payment failed for user_9931"

# --- Numbered groups ---
m = re.search(r"(\\d{4})-(\\d{2})-(\\d{2}) (\\w+) (.*)", log)
m.group(0)   # whole match: '2024-11-02 ERROR Payment failed for user_9931'
m.group(1)   # '2024'
m.groups()   # ('2024', '11', '02', 'ERROR', 'Payment failed for user_9931')

# --- Named groups: far more readable ---
pattern = r"(?P<date>\\d{4}-\\d{2}-\\d{2}) (?P<level>\\w+) (?P<msg>.*)"
m = re.search(pattern, log)
m.group("level")      # 'ERROR'
m.groupdict()         # {'date': '2024-11-02', 'level': 'ERROR', 'msg': '...'}

# --- Non-capturing group (?:...) — group without storing ---
# Use when you need alternation but don't want the noise in .groups()
re.findall(r"(?:cat|dog)s?", "cats and dogs")     # ['cats', 'dogs']

# --- Backreference: find doubled words ---
re.search(r"\\b(\\w+)\\s+\\1\\b", "this is is a typo").group()   # 'is is'

# --- Groups in substitution ---
re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3/\\2/\\1", "2024-11-02")
# '02/11/2024'`} />
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="re-module" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">The Python <code className="text-indigo-300">re</code> Module</h2>

          <div className="overflow-x-auto rounded-xl border border-gray-800 mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Function</th>
                  <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Returns</th>
                  <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Use it when</th>
                </tr>
              </thead>
              <tbody className="text-gray-400 text-xs">
                {[
                  ['re.search()', 'first Match anywhere, or None', 'You want to find something in the string'],
                  ['re.match()', 'Match only at the START, or None', 'Checking a prefix — a common gotcha'],
                  ['re.fullmatch()', 'Match only if the WHOLE string fits', 'Validation — usually what you actually want'],
                  ['re.findall()', 'list of strings (or tuples if groups)', 'You just need all the values'],
                  ['re.finditer()', 'iterator of Match objects', 'You need positions or groups, memory-efficient'],
                  ['re.sub()', 'new string with replacements', 'Search and replace, cleaning text'],
                  ['re.split()', 'list split on the pattern', 'Delimiters more complex than one character'],
                  ['re.compile()', 'reusable Pattern object', 'The pattern runs in a loop — compile once'],
                ].map(([fn, ret, use], i) => (
                  <tr key={fn} className={i % 2 ? 'bg-gray-900/30' : ''}>
                    <td className="px-4 py-2.5 border-b border-gray-900 font-mono text-indigo-300 whitespace-nowrap">{fn}</td>
                    <td className="px-4 py-2.5 border-b border-gray-900">{ret}</td>
                    <td className="px-4 py-2.5 border-b border-gray-900">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock language="python" maxHeight="480px" code={`import re

text = "Order #1042 shipped. Order #1099 pending."

# search — first match anywhere
re.search(r"#(\\d+)", text).group(1)          # '1042'

# match vs fullmatch — the classic gotcha
re.match(r"\\d+", "123abc")                   # matches! (only checks the start)
re.fullmatch(r"\\d+", "123abc")               # None  <- use this to VALIDATE

# findall — just the values
re.findall(r"#(\\d+)", text)                  # ['1042', '1099']

# finditer — when you need positions
for m in re.finditer(r"#(\\d+)", text):
    print(m.group(1), m.span())              # 1042 (6, 11) ...

# sub — with a function for dynamic replacement
re.sub(r"#(\\d+)", lambda m: f"#{int(m.group(1)) + 1}", text)
# 'Order #1043 shipped. Order #1100 pending.'

# split on a complex delimiter
re.split(r"\\s*[,;|]\\s*", "a , b;c |d")       # ['a', 'b', 'c', 'd']

# compile — do this when the pattern runs in a loop
ORDER_RE = re.compile(r"#(\\d+)")
for line in lines:
    if (m := ORDER_RE.search(line)):
        process(m.group(1))

# VERBOSE — make a long pattern readable
phone = re.compile(r"""
    (\\+\\d{1,2}\\s?)?      # optional country code
    \\(?\\d{3}\\)?[\\s.-]?   # area code, optional parens
    \\d{3}[\\s.-]?\\d{4}     # the number
""", re.VERBOSE)`} />

          <div className="mt-4 p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
            <p className="text-sm text-blue-200 leading-relaxed m-0">
              <strong>Always use raw strings.</strong> Write <code className="font-mono">r"\d+"</code>, not{' '}
              <code className="font-mono">"\d+"</code>. Without the <code className="font-mono">r</code>, Python
              processes backslash escapes first and your pattern silently becomes something else — the single most
              common regex bug in Python.
            </p>
          </div>
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="cookbook" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Pattern Cookbook</h2>
          <p className="text-gray-300 mb-6 max-w-3xl">
            Practical patterns, several of which show up directly in the{' '}
            <a href="#/ml/nlp" className="text-blue-400 hover:underline">NLP preprocessing pipeline</a>.
          </p>
          <CodeBlock language="python" maxHeight="520px" code={`import re

# ---------- Validation (note fullmatch) ----------
EMAIL   = r"[\\w.+-]+@[\\w-]+\\.[\\w.]+"
URL     = r"https?://[^\\s<>\\"]+"
IPV4    = r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"
ISO_DATE= r"\\d{4}-\\d{2}-\\d{2}"
HEXCOL  = r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b"

bool(re.fullmatch(EMAIL, "ada@example.com"))     # True

# ---------- Text cleaning for NLP ----------
def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)          # strip HTML tags
    text = re.sub(URL, " ", text)                 # drop URLs
    text = re.sub(r"[^\\w\\s']", " ", text)         # keep words/apostrophes
    text = re.sub(r"\\s+", " ", text)              # collapse whitespace
    return text.strip().lower()

# ---------- Extraction ----------
# Money amounts, using lookbehind so '$' isn't captured
re.findall(r"(?<=\\$)[\\d,]+(?:\\.\\d{2})?", "Total $1,299.00 and $45")
# ['1,299.00', '45']

# Hashtags and mentions
re.findall(r"[@#]\\w+", "ping @ada about #regex")   # ['@ada', '#regex']

# Sentence splitting (naive but useful — beware "Dr. Smith")
re.split(r"(?<=[.!?])\\s+", "One. Two! Three?")     # ['One.', 'Two!', 'Three?']

# ---------- Redacting PII before sending to an LLM ----------
def redact(text: str) -> str:
    text = re.sub(EMAIL, "[EMAIL]", text)
    text = re.sub(r"\\b\\d{3}-\\d{2}-\\d{4}\\b", "[SSN]", text)
    text = re.sub(r"\\b(?:\\d[ -]?){13,16}\\b", "[CARD]", text)
    return text

redact("Mail ada@x.com or call 555-12-3456")
# 'Mail [EMAIL] or call [SSN]'`} />
        </motion.section>

        {/* -------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="pitfalls" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Performance & Pitfalls</h2>

          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10 mb-5">
            <h3 className="text-rose-400 font-semibold mb-2">💣 Catastrophic backtracking (ReDoS)</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              Nested quantifiers can make the engine try an exponential number of paths. The pattern below is fine on
              short input and effectively hangs forever on a slightly longer one — a real denial-of-service vector if
              the pattern or the input comes from a user.
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs space-y-1.5">
              <div><span className="text-rose-400">✗ dangerous:</span> <span className="text-gray-300">{String.raw`(a+)+$`}</span> against <span className="text-gray-500">"aaaaaaaaaaaaaaaaaaaaaaX"</span></div>
              <div><span className="text-emerald-400">✓ safe:</span> <span className="text-gray-300">{String.raw`a+$`}</span> — no nested quantifier</div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mt-3 mb-0">
              Avoid quantifiers inside quantified groups, prefer specific character classes over{' '}
              <code className="text-gray-300">.*</code>, and never build a pattern out of untrusted input.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { t: 'Forgetting the raw string', d: 'Use r"..." always. Otherwise Python eats your backslashes before the regex engine sees them.', tone: 'border-amber-500/25 bg-amber-500/10', label: 'text-amber-400' },
              { t: 'match() instead of fullmatch()', d: 're.match(r"\\d+", "123abc") succeeds — it only anchors the start. For validation you almost always want fullmatch().', tone: 'border-amber-500/25 bg-amber-500/10', label: 'text-amber-400' },
              { t: 'Unescaped dots in literals', d: 'r"1.2" matches "1x2". Escape it: r"1\\.2" — or use re.escape() for user-supplied literals.', tone: 'border-blue-500/25 bg-blue-500/10', label: 'text-blue-400' },
              { t: 'Recompiling in a loop', d: 'Python caches recent patterns, but compile() once at module level makes intent (and cost) explicit.', tone: 'border-blue-500/25 bg-blue-500/10', label: 'text-blue-400' },
              { t: 'Parsing HTML with regex', d: 'Nested tags cannot be expressed by a regular language. Use BeautifulSoup or lxml.', tone: 'border-rose-500/25 bg-rose-500/10', label: 'text-rose-400' },
              { t: 'Unicode assumptions', d: '\\w matches Unicode letters by default in Python 3 — "café" works, but \\b behaves differently with emoji and CJK text.', tone: 'border-purple-500/25 bg-purple-500/10', label: 'text-purple-400' },
            ].map((p) => (
              <div key={p.t} className={`p-4 rounded-xl border ${p.tone}`}>
                <div className={`text-sm font-semibold mb-1 ${p.label}`}>{p.t}</div>
                <p className="text-xs text-gray-300 leading-relaxed m-0">{p.d}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

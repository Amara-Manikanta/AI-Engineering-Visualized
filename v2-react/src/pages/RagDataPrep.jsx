import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   Stage 1: the five-stage ingestion pipeline, clickable
--------------------------------------------------------------------------- */

const STAGES = [
  {
    id: 'load',
    icon: '📥',
    name: 'Load',
    tone: 'border-blue-500/40 bg-blue-500/10',
    text: 'text-blue-400',
    one: 'Pull raw bytes from wherever they live.',
    detail:
      'Connect to the source system and fetch the file. This sounds trivial and is where most production pipelines actually break — auth tokens expire, APIs paginate, Sharepoint permissions differ per user, and the "one folder of PDFs" turns out to be 40GB across three drives.',
    watch: 'Handle incremental sync from day one. Re-indexing an entire corpus because you have no way to detect what changed is the most common early mistake.',
  },
  {
    id: 'parse',
    icon: '🔍',
    name: 'Parse',
    tone: 'border-purple-500/40 bg-purple-500/10',
    text: 'text-purple-400',
    one: 'Turn bytes into structured text.',
    detail:
      'Extract the actual text, preserving structure where it carries meaning. A PDF is not text — it is drawing instructions for glyphs at coordinates. Naive extraction of a two-column research paper interleaves the columns into nonsense; naive extraction of a table produces a stream of numbers with no rows.',
    watch: 'This stage sets your quality ceiling. Garbage parsing cannot be recovered by better chunking, better embeddings, or a better model.',
  },
  {
    id: 'clean',
    icon: '🧹',
    name: 'Clean',
    tone: 'border-emerald-500/40 bg-emerald-500/10',
    text: 'text-emerald-400',
    one: 'Strip the noise that pollutes embeddings.',
    detail:
      'Remove boilerplate that repeats across every page — nav bars, cookie banners, headers, footers, page numbers. These add no meaning but do add tokens, and because they repeat identically everywhere they actively distort embeddings by making unrelated chunks look similar to each other.',
    watch: 'Be conservative. Over-aggressive cleaning that strips legal disclaimers or footnotes deletes real answers.',
  },
  {
    id: 'enrich',
    icon: '🏷️',
    name: 'Enrich',
    tone: 'border-amber-500/40 bg-amber-500/10',
    text: 'text-amber-400',
    one: 'Attach the metadata you will filter on later.',
    detail:
      'Capture source URL, author, date, document type, page number, and any access-control identifiers. Metadata is what makes filtered retrieval possible — "only search 2024 policies", "only documents this user can see" — and it is what lets you cite sources in the final answer.',
    watch: 'You cannot add metadata retroactively without re-indexing. Capture more than you think you need.',
  },
  {
    id: 'normalize',
    icon: '📐',
    name: 'Normalize',
    tone: 'border-rose-500/40 bg-rose-500/10',
    text: 'text-rose-400',
    one: 'Convert everything to one consistent format.',
    detail:
      'Standardize on a single representation — usually Markdown — so that downstream chunking sees one format instead of six. Markdown is the pragmatic choice because its headings give a recursive splitter natural boundaries, and LLMs read it natively.',
    watch: 'Tables should become Markdown tables, not flattened text. A table that loses its rows loses its meaning entirely.',
  },
];

function PipelineVisual({ active, setActive }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
        {STAGES.map((s, i) => {
          const isActive = active.id === s.id;
          return (
            <React.Fragment key={s.id}>
              <motion.button
                onClick={() => setActive(s)}
                whileHover={{ y: -3 }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex-1 min-w-[110px] rounded-xl border p-4 text-center transition-all ${
                  isActive ? `${s.tone} ring-2 ring-white/50` : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <div className={`text-sm font-bold ${isActive ? s.text : 'text-gray-300'}`}>{s.name}</div>
                <div className="text-[0.625rem] text-gray-500 mt-1 leading-snug">{s.one}</div>
              </motion.button>
              {i < STAGES.length - 1 && (
                <div className="flex items-center text-gray-600 text-xl shrink-0">→</div>
              )}
            </React.Fragment>
          );
        })}
        <div className="flex items-center text-gray-600 text-xl shrink-0">→</div>
        <div className="flex items-center shrink-0">
          <div className="px-3 py-2 rounded-lg border border-dashed border-white/20 text-[0.6875rem] text-gray-500 text-center">
            to Chunking
          </div>
        </div>
      </div>

        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className={`mt-5 rounded-xl border p-5 ${active.tone}`}
        >
          <div className={`font-bold mb-2 ${active.text}`}>
            {active.icon} {active.name}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{active.detail}</p>
          <div className="p-3 rounded-lg bg-black/30 border border-white/10">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Watch out for</div>
            <div className="text-xs text-gray-300 leading-relaxed">{active.watch}</div>
          </div>
        </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Before/after cleaning demo
--------------------------------------------------------------------------- */

const DIRTY_LINES = [
  { t: 'Home | Products | Pricing | About | Contact', kind: 'nav' },
  { t: '<div class="content"><p>&nbsp;</p>', kind: 'html' },
  { t: 'Refunds are issued within 30 days of', kind: 'keep' },
  { t: 'purchase, provided the item is unused.', kind: 'keep' },
  { t: '', kind: 'blank' },
  { t: '     ', kind: 'blank' },
  { t: 'Contact support@acme.com for help.', kind: 'keep' },
  { t: '</div><footer>© 2024 Acme Corp.</footer>', kind: 'html' },
  { t: 'Page 4 of 27', kind: 'boiler' },
  { t: 'Weâ€™ve updated our policy', kind: 'encoding' },
];

const KIND_META = {
  nav: { label: 'nav boilerplate', tone: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  html: { label: 'markup', tone: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  blank: { label: 'whitespace', tone: 'text-gray-500 bg-white/5 border-white/10' },
  boiler: { label: 'page furniture', tone: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  encoding: { label: 'mojibake', tone: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  keep: { label: 'real content', tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

function CleaningDemo() {
  const [cleaned, setCleaned] = useState(false);

  const cleanLines = [
    'Refunds are issued within 30 days of purchase, provided the item is unused.',
    'Contact support@acme.com for help.',
  ];

  const dirtyTokens = DIRTY_LINES.reduce((a, l) => a + Math.ceil(l.t.length / 4), 0);
  const cleanTokens = cleanLines.reduce((a, l) => a + Math.ceil(l.length / 4), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-semibold text-white">Scraped HTML page → clean text</div>
          <div className="text-xs text-gray-500">Same document, before and after the cleaning stage.</div>
        </div>
        <button
          onClick={() => setCleaned((c) => !c)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            cleaned
              ? 'bg-white/5 border-white/15 text-gray-300 hover:border-white/30'
              : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
          }`}
        >
          {cleaned ? '↺ Show raw' : '🧹 Clean it'}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4 min-h-[240px] font-mono text-xs">
          {!cleaned ? (
            <motion.div key="dirty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              {DIRTY_LINES.map((l, i) => {
                const meta = KIND_META[l.kind];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`text-[0.5625rem] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0 w-28 text-center ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                    <span className={l.kind === 'keep' ? 'text-gray-200' : 'text-gray-600 line-through'}>
                      {l.t || <span className="italic opacity-50">(empty line)</span>}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="clean" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {cleanLines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="text-emerald-100 leading-relaxed"
                >
                  {l}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="pt-3 mt-3 border-t border-white/10 text-[0.6875rem] text-gray-500 leading-relaxed not-italic"
              >
                Mojibake fixed (<span className="text-purple-400">Weâ€™ve</span> →{' '}
                <span className="text-emerald-400">We've</span>), markup stripped, boilerplate dropped, whitespace
                collapsed.
              </motion.div>
            </motion.div>
          )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Lines', from: DIRTY_LINES.length, to: cleanLines.length },
          { label: '~Tokens', from: dirtyTokens, to: cleanTokens },
          { label: 'Signal ratio', from: '20%', to: '100%' },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">{s.label}</div>
            <div className="text-sm font-mono">
              <span className="text-gray-500">{s.from}</span>
              <span className="text-gray-600 mx-1.5">→</span>
              <motion.span
                key={String(cleaned)}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-emerald-400 font-bold"
              >
                {s.to}
              </motion.span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[0.6875rem] text-gray-500 mt-3 leading-relaxed mb-0">
        The token reduction is the least interesting win. The real one is that the nav bar and footer no longer appear
        in <em>every single chunk</em> in your index — which was quietly making every document look similar to every
        other document.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export default function RagDataPrep() {
  const [activeStage, setActiveStage] = useState(STAGES[0]);

  const toc = [
    { label: 'Why This Stage Decides Everything', hash: 'why' },
    { label: 'The Ingestion Pipeline', hash: 'pipeline' },
    { label: 'Document Loaders', hash: 'document-loaders' },
    { label: 'Parsing & OCR', hash: 'parsing-ocr' },
    { label: 'Data Cleaning (interactive)', hash: 'data-cleaning' },
    { label: 'Metadata Extraction', hash: 'metadata' },
    { label: 'File Formats & Parsers', hash: 'formats' },
  ];

  return (
    <GuideLayout
      title="Data Preparation"
      intro="Getting unstructured data ready for the vector database — the least glamorous stage, and the one that sets the ceiling for everything downstream."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="why"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Why This Stage Decides Everything</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Teams spend weeks tuning chunk sizes and comparing embedding models while feeding the pipeline text that
            was mangled at extraction. Every stage after this one inherits whatever mistakes happen here — and none of
            them can undo the damage.
          </p>

          <div className="p-6 rounded-2xl border border-white/10 bg-black/40 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {[
                { l: 'Bad extraction', d: 'columns interleaved, table flattened', tone: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
                { l: 'Perfect chunking', d: "can't fix scrambled text", tone: 'border-white/10 bg-white/5 text-gray-500' },
                { l: 'Best embeddings', d: 'faithfully encode nonsense', tone: 'border-white/10 bg-white/5 text-gray-500' },
                { l: 'Frontier LLM', d: 'confidently misreads it', tone: 'border-white/10 bg-white/5 text-gray-500' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.l}>
                  <div className={`flex-1 rounded-lg border p-3.5 ${s.tone}`}>
                    <div className="text-xs font-bold mb-1">{s.l}</div>
                    <div className="text-[0.625rem] opacity-80 leading-snug">{s.d}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex items-center justify-center text-gray-600 shrink-0">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-rose-300">
              Errors here propagate all the way down — and get harder to diagnose at every step.
            </div>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="pipeline"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">The Ingestion Pipeline</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Five stages sit between a raw file and a chunk-ready document. Click any stage for what it does and where
            it commonly goes wrong.
          </p>
          <PipelineVisual active={activeStage} setActive={setActiveStage} />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="document-loaders"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Document Loaders</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            A loader is a thin adapter that turns "a thing in some system" into a uniform{' '}
            <code className="px-1.5 py-0.5 bg-gray-800 rounded text-blue-300 font-mono text-sm">Document</code> object
            with <code className="px-1.5 py-0.5 bg-gray-800 rounded text-blue-300 font-mono text-sm">page_content</code>{' '}
            and <code className="px-1.5 py-0.5 bg-gray-800 rounded text-blue-300 font-mono text-sm">metadata</code>.
            LangChain and LlamaIndex ship hundreds of them, so you rarely write your own. For the loader to use
            with each format — PDFs, scans, Office files, web pages, JSON, code, SaaS tools and databases — with
            working LangChain code, see{' '}
            <a href="#/rag/ingestion" className="text-blue-400 hover:underline">Data Ingestion</a>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: '📄', t: 'Files', d: 'PDF, DOCX, PPTX, CSV, Markdown, plain text, EPUB', ex: 'PyPDFLoader, UnstructuredFileLoader' },
              { icon: '☁️', t: 'SaaS & knowledge bases', d: 'Notion, Confluence, Google Drive, Slack, Jira, Sharepoint', ex: 'NotionDBLoader, ConfluenceLoader' },
              { icon: '🗄️', t: 'Databases & object stores', d: 'Postgres, MongoDB, S3, GCS, Azure Blob', ex: 'S3DirectoryLoader, SQLDatabaseLoader' },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="text-2xl mb-2.5">{c.icon}</div>
                <div className="font-semibold text-white text-sm mb-1.5">{c.t}</div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2.5">{c.d}</p>
                <div className="text-[0.625rem] font-mono text-blue-300 bg-black/30 rounded px-2 py-1.5 border border-blue-500/20">
                  {c.ex}
                </div>
              </motion.div>
            ))}
          </div>

          <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto">
{`from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

loader = DirectoryLoader(
    "./docs", glob="**/*.pdf",
    loader_cls=PyPDFLoader,
    show_progress=True,
)
docs = loader.load()

# Every loader returns the same shape, whatever the source:
docs[0].page_content   # -> "Refunds are issued within 30 days..."
docs[0].metadata       # -> {'source': './docs/policy.pdf', 'page': 3}`}
          </pre>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="parsing-ocr"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Parsing & OCR</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            PDFs are the hard case, and they are also most of your corpus. A PDF does not store paragraphs — it stores
            instructions to draw glyphs at coordinates. Reconstructing reading order from that is genuinely difficult,
            and it fails in specific, recognizable ways.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10">
              <div className="text-rose-400 font-semibold mb-3 text-sm">Where naive parsing breaks</div>
              <ul className="space-y-2 text-xs text-gray-300">
                {[
                  ['Two-column layouts', 'Text extracted left-to-right across both columns, interleaving two unrelated sentences.'],
                  ['Tables', 'Cells flattened into an undifferentiated number stream — rows and headers lost.'],
                  ['Scanned pages', 'No text layer at all. Extraction returns an empty string and the document silently vanishes.'],
                  ['Headers & footers', 'Repeated on every page, polluting every chunk.'],
                  ['Ligatures', '"ﬁ" and "ﬂ" extracted as single glyphs that break word matching.'],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-rose-400 shrink-0">✗</span>
                    <span>
                      <strong className="text-gray-200">{t}:</strong> {d}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="text-emerald-400 font-semibold mb-3 text-sm">Tooling, cheapest first</div>
              <div className="space-y-2.5">
                {[
                  ['PyPDF / pdfplumber', 'Fast, free, fine for simple single-column text PDFs.'],
                  ['Unstructured.io', 'Layout-aware. Detects titles, tables, and lists as distinct elements.'],
                  ['Tesseract OCR', 'Open-source OCR for scanned pages. Quality depends heavily on scan resolution.'],
                  ['Cloud Document AI', 'AWS Textract / Azure Document Intelligence / Google Document AI — best table and form extraction, priced per page.'],
                  ['Vision LLMs', 'Send the page image to a multimodal model and ask for Markdown. Excellent on messy layouts; slowest and priciest.'],
                ].map(([t, d], i) => (
                  <div key={t} className="flex gap-2.5 items-start">
                    <span className="text-[0.625rem] font-mono text-emerald-400 bg-black/30 rounded px-1.5 py-0.5 border border-emerald-500/25 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-300 leading-relaxed">
                      <strong className="text-gray-200">{t}</strong> — {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
            <p className="text-sm text-blue-200 leading-relaxed m-0">
              <strong>Sanity check worth running once:</strong> extract text from 20 random documents and actually read
              the output. Not a length check — read it. Teams routinely discover their entire scanned-PDF corpus has
              been indexing as empty strings for months, because nothing errored.
            </p>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="data-cleaning"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Data Cleaning</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Raw extracted text carries a lot that is not content. Toggle the demo below to see what a cleaning pass
            removes from a typical scraped page.
          </p>
          <CleaningDemo />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="metadata"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Metadata Extraction</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Metadata is what turns a similarity search into a real query engine. It powers filtered retrieval, access
            control, citations, and freshness ranking — and none of it can be added later without a full re-index.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">A chunk, fully enriched</div>
              <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-xs overflow-x-auto m-0">
<span className="text-gray-500">{'{'}</span>{'\n'}
{'  '}<span className="text-blue-300">"page_content"</span>: <span className="text-emerald-300">"Refunds are issued within 30 days..."</span>,{'\n'}
{'  '}<span className="text-blue-300">"metadata"</span>: <span className="text-gray-500">{'{'}</span>{'\n'}
{'    '}<span className="text-purple-300">"source"</span>: <span className="text-amber-200">"policies/refunds.pdf"</span>,{'\n'}
{'    '}<span className="text-purple-300">"page"</span>: <span className="text-rose-300">4</span>,{'\n'}
{'    '}<span className="text-purple-300">"title"</span>: <span className="text-amber-200">"Refund Policy"</span>,{'\n'}
{'    '}<span className="text-purple-300">"doc_type"</span>: <span className="text-amber-200">"policy"</span>,{'\n'}
{'    '}<span className="text-purple-300">"last_modified"</span>: <span className="text-amber-200">"2024-11-02"</span>,{'\n'}
{'    '}<span className="text-purple-300">"department"</span>: <span className="text-amber-200">"billing"</span>,{'\n'}
{'    '}<span className="text-purple-300">"acl_groups"</span>: [<span className="text-amber-200">"support"</span>, <span className="text-amber-200">"finance"</span>],{'\n'}
{'    '}<span className="text-purple-300">"chunk_index"</span>: <span className="text-rose-300">2</span>{'\n'}
{'  '}<span className="text-gray-500">{'}'}</span>{'\n'}
<span className="text-gray-500">{'}'}</span>
              </pre>
            </div>

            <div className="space-y-3">
              {[
                { icon: '🔒', t: 'Access control', d: 'Filter on acl_groups at query time so the retriever physically cannot return documents the user is not allowed to see. Doing this in the prompt instead is a security bug — the model will leak it.', tone: 'border-rose-500/30 bg-rose-500/10 text-rose-400' },
                { icon: '📅', t: 'Freshness filtering', d: 'last_modified lets you exclude superseded policies, or boost recent documents when several versions exist.', tone: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
                { icon: '🔗', t: 'Citations', d: 'source + page is what lets the final answer say "according to refunds.pdf, page 4" — the single biggest driver of user trust.', tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
                { icon: '🎯', t: 'Scoped search', d: 'doc_type and department let an agent narrow the search space before embedding similarity is ever computed.', tone: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
              ].map((c, i) => (
                <motion.div
                  key={c.t}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-4 rounded-xl border ${c.tone}`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {c.icon} {c.t}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed m-0">{c.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="formats"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">File Formats & Which Parser to Use</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Format</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Difficulty</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Recommended parser</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">The catch</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {[
                  ['.txt / .md', 'Trivial', 'Built-in', 'None. Markdown is the ideal target format.', 'emerald'],
                  ['.html', 'Easy', 'BeautifulSoup, trafilatura', 'Must strip nav/footer boilerplate or it pollutes every chunk.', 'emerald'],
                  ['.docx', 'Easy', 'python-docx, Unstructured', 'Tracked changes and comments may be extracted as body text.', 'emerald'],
                  ['.csv / .xlsx', 'Medium', 'Pandas → Markdown tables', 'Row-per-chunk loses headers. Repeat the header in each chunk.', 'amber'],
                  ['.pdf (text)', 'Medium', 'PyPDF, pdfplumber', 'Multi-column layouts interleave. Check reading order.', 'amber'],
                  ['.pdf (scanned)', 'Hard', 'Tesseract, Cloud Document AI', 'No text layer — silently yields empty strings if unhandled.', 'rose'],
                  ['.pptx', 'Hard', 'python-pptx, Unstructured', 'Meaning often lives in images and layout, not the text boxes.', 'rose'],
                  ['Images / diagrams', 'Hard', 'Vision LLM captioning', 'Needs a multimodal model to describe content before indexing.', 'rose'],
                ].map(([fmt, diff, parser, catch_, tone], i) => {
                  const tones = { emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400' };
                  return (
                    <tr key={fmt} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                      <td className="p-3 border-b border-white/5 font-mono text-xs text-gray-200">{fmt}</td>
                      <td className={`p-3 border-b border-white/5 text-xs font-semibold ${tones[tone]}`}>{diff}</td>
                      <td className="p-3 border-b border-white/5 text-xs">{parser}</td>
                      <td className="p-3 border-b border-white/5 text-xs">{catch_}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              Once your documents are loaded, parsed, cleaned, enriched, and normalized, they are ready to be split.
              Continue to{' '}
              <a href="#/rag/chunking" className="text-blue-400 hover:underline">
                Chunking
              </a>{' '}
              to decide how.
            </p>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

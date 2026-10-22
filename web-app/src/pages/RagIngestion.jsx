import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Card, Note, Section, Segmented, Button } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "data ingestion", "data injection", "ingestion pipeline", "document loaders", "LangChain loaders", "Document object",
  "page_content", "metadata", "PyPDFLoader", "PyMuPDFLoader", "PDFPlumberLoader", "UnstructuredLoader", "Unstructured",
  "DoclingLoader", "Docling", "LlamaParse", "Azure Document Intelligence", "Amazon Textract", "OCR", "scanned PDF",
  "Docx2txtLoader", "Word documents", "PowerPoint", "Excel", "CSVLoader", "JSONLoader", "jq", "WebBaseLoader",
  "RecursiveUrlLoader", "SitemapLoader", "web scraping", "Markdown", "MarkdownHeaderTextSplitter", "GitLoader",
  "code ingestion", "ConfluenceLoader", "NotionDBLoader", "GoogleDriveLoader", "S3DirectoryLoader", "SQLDatabaseLoader",
  "YoutubeLoader", "DirectoryLoader", "lazy_load", "BaseLoader", "custom loader", "indexing API", "RecordManager",
  "incremental ingestion", "deduplication",
];

/* ---------------------------------------------------------------------------
   One three-page PDF, loaded three different ways. The point is that the
   loader decides the *shape* of what reaches the chunker: one Document per
   page, one per layout element, or one Markdown document with structure kept.
--------------------------------------------------------------------------- */

const PAGES = [
  { title: "Refund Policy", lines: ["1. Eligibility", "Items may be returned within 30 days of delivery.", "Page 1 of 3 · ACME Confidential"] },
  { title: "", lines: ["2. Fees", "| Item | Restocking fee |", "| Electronics | 15% |", "| Clothing | 0% |", "Page 2 of 3 · ACME Confidential"] },
  { title: "", lines: ["3. How to request", "Open a ticket at support.acme.com.", "Page 3 of 3 · ACME Confidential"] },
];

const OUTPUTS = {
  pypdf: {
    label: "PyPDFLoader",
    note: "One Document per page, text only. Fast and dependency-light. Tables become loose lines of text, and the repeated footer lands in every page's content — clean it before chunking.",
    docs: [
      { content: "Refund Policy\n1. Eligibility\nItems may be returned within 30 days of delivery.\nPage 1 of 3 · ACME Confidential", meta: { source: "refund_policy.pdf", page: 0 } },
      { content: "2. Fees\nItem Restocking fee\nElectronics 15%\nClothing 0%\nPage 2 of 3 · ACME Confidential", meta: { source: "refund_policy.pdf", page: 1 } },
      { content: "3. How to request\nOpen a ticket at support.acme.com.\nPage 3 of 3 · ACME Confidential", meta: { source: "refund_policy.pdf", page: 2 } },
    ],
  },
  unstructured: {
    label: "UnstructuredLoader",
    note: "Partitions the file into typed elements — Title, NarrativeText, Table, Footer — each its own Document. You can drop footers by category, and tables arrive as tables (with HTML in metadata on the hi_res strategy).",
    docs: [
      { content: "Refund Policy", meta: { category: "Title", page_number: 1 } },
      { content: "Items may be returned within 30 days of delivery.", meta: { category: "NarrativeText", page_number: 1 } },
      { content: "Item Restocking fee Electronics 15% Clothing 0%", meta: { category: "Table", page_number: 2, text_as_html: "<table>…</table>" } },
      { content: "Open a ticket at support.acme.com.", meta: { category: "NarrativeText", page_number: 3 } },
      { content: "Page 3 of 3 · ACME Confidential", meta: { category: "Footer", page_number: 3 } },
    ],
  },
  docling: {
    label: "DoclingLoader (Markdown export)",
    note: "A layout-aware parser that exports the whole file as Markdown: headings stay headings and the table stays a table, and page furniture like the footer is dropped. A header-aware splitter can then chunk by section.",
    docs: [
      {
        content: "# Refund Policy\n\n## 1. Eligibility\nItems may be returned within 30 days of delivery.\n\n## 2. Fees\n| Item | Restocking fee |\n|---|---|\n| Electronics | 15% |\n| Clothing | 0% |\n\n## 3. How to request\nOpen a ticket at support.acme.com.",
        meta: { source: "refund_policy.pdf" },
      },
    ],
  },
};

function LoaderLab() {
  const [loader, setLoader] = useState("pypdf");
  const [run, setRun] = useState(0);
  const out = OUTPUTS[loader];

  return (
    <Panel tone="indigo" title="Same PDF, three loaders, three different sets of Documents">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Segmented
          value={loader}
          onChange={(v) => {
            setLoader(v);
            setRun((r) => r + 1);
          }}
          options={Object.entries(OUTPUTS).map(([v, o]) => ({ v, label: o.label }))}
        />
        <Button tone="purple" onClick={() => setRun((r) => r + 1)}>
          ↻ Load again
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_40px_minmax(0,1fr)] gap-4 items-start">
        {/* The source file */}
        <div className="space-y-2">
          <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500">refund_policy.pdf</div>
          {PAGES.map((p, i) => (
            <div key={i} className="rounded-md border border-red-500/40 bg-red-950/30 p-2.5 font-mono text-[0.625rem] leading-relaxed text-gray-300">
              {p.title && <div className="text-red-200 font-bold text-[0.6875rem] mb-0.5">{p.title}</div>}
              {p.lines.map((l, j) => (
                <div key={j} className={l.startsWith("Page") ? "text-gray-500 border-t border-white/10 mt-1 pt-1" : l.startsWith("|") ? "text-amber-200" : ""}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* The loader arrow */}
        <div className="flex lg:flex-col items-center justify-center gap-2 lg:pt-20 text-indigo-300">
          <motion.div
            key={`arrow-${run}`}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{ opacity: [0.2, 1, 1], scale: [0.8, 1.15, 1] }}
            transition={{ duration: 0.6 }}
            className="text-2xl lg:rotate-0 rotate-90"
          >
            ➜
          </motion.div>
        </div>

        {/* The resulting Documents */}
        <div>
          <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500 mb-2">
            loader.load() → list[Document] · <span className="text-indigo-300">{out.docs.length} Document{out.docs.length === 1 ? "" : "s"}</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {out.docs.map((d, i) => (
                <motion.div
                  key={`${loader}-${run}-${i}`}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/[0.06] p-2.5 font-mono text-[0.6875rem]"
                >
                  <div className="text-gray-500">Document(</div>
                  <div className="pl-3 text-gray-200 whitespace-pre-wrap break-words">
                    <span className="text-indigo-300">page_content</span>="{d.content.length > 170 ? d.content.slice(0, 170) + "…" : d.content}",
                  </div>
                  <div className="pl-3 text-gray-400 break-words">
                    <span className="text-emerald-300">metadata</span>={JSON.stringify(d.meta)}
                  </div>
                  <div className="text-gray-500">)</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed mt-4 mb-0">{out.note}</p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Format explorer: which loader, what it returns, what goes wrong.
--------------------------------------------------------------------------- */

const FORMATS = [
  {
    id: "pdf",
    icon: "📄",
    name: "PDF (digital)",
    loaders: "PyPDFLoader · PyMuPDFLoader · PDFPlumberLoader · UnstructuredLoader · DoclingLoader",
    returns: "One Document per page (PyPDF, PyMuPDF, pdfplumber); per element (Unstructured); whole-file Markdown (Docling).",
    watch: "Multi-column layouts read in the wrong order; repeated headers and footers; tables flattened into loose words; hyphenated line breaks.",
    code: `from langchain_community.document_loaders import PyMuPDFLoader

docs = PyMuPDFLoader("refund_policy.pdf").load()
print(len(docs), docs[0].metadata)      # one per page; source, page, title, author…

# Tables matter? Use a layout-aware parser instead:
# from langchain_community.document_loaders import PDFPlumberLoader
# from langchain_docling import DoclingLoader  # pip install langchain-docling`,
  },
  {
    id: "scan",
    icon: "🖨️",
    name: "Scanned PDF / images",
    loaders: "UnstructuredLoader (strategy='hi_res' or 'ocr_only') · AzureAIDocumentIntelligenceLoader · AmazonTextractPDFLoader · DoclingLoader (OCR)",
    returns: "Text produced by OCR, usually with layout elements and page numbers.",
    watch: "A plain PDF loader returns empty strings for scans — check for pages with no text. OCR is slow and costs money on cloud services; budget for it and cache results.",
    code: `from langchain_unstructured import UnstructuredLoader   # pip install langchain-unstructured

docs = UnstructuredLoader(
    "scanned_invoice.pdf",
    strategy="hi_res",          # layout model + OCR; 'fast' skips OCR
).load()

# Managed OCR with table and key-value extraction:
# from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader
# AzureAIDocumentIntelligenceLoader(api_endpoint=..., api_key=..., file_path=...,
#                                   api_model="prebuilt-layout").load()   # returns Markdown`,
  },
  {
    id: "office",
    icon: "📝",
    name: "Word · PowerPoint · Excel",
    loaders: "Docx2txtLoader · UnstructuredWordDocumentLoader · UnstructuredPowerPointLoader · UnstructuredExcelLoader · DoclingLoader",
    returns: "Docx2txt: the whole document as one Document. Unstructured: one Document per file, or per element with mode='elements'.",
    watch: "Speaker notes, comments and tracked changes may or may not be included. Spreadsheets are tables, not prose — often better loaded as rows (CSV) or queried with SQL.",
    code: `from langchain_community.document_loaders import (
    Docx2txtLoader, UnstructuredPowerPointLoader, UnstructuredExcelLoader)

word   = Docx2txtLoader("handbook.docx").load()
slides = UnstructuredPowerPointLoader("q3_review.pptx", mode="elements").load()
sheet  = UnstructuredExcelLoader("pricing.xlsx", mode="elements").load()
# Excel elements carry metadata["text_as_html"] with the table structure`,
  },
  {
    id: "csv",
    icon: "📊",
    name: "CSV & tabular",
    loaders: "CSVLoader · DataFrameLoader",
    returns: "One Document per row, formatted as 'column: value' lines.",
    watch: "Row-per-document works for FAQs and catalogues. For numeric questions ('average price by region') retrieval is the wrong tool — give the model SQL or pandas instead (see Text-to-SQL).",
    code: `from langchain_community.document_loaders import CSVLoader

docs = CSVLoader(
    "faq.csv",
    source_column="url",                        # becomes metadata["source"]
    metadata_columns=["category", "updated"],   # kept out of the embedded text
    content_columns=["question", "answer"],
).load()
print(docs[0].page_content)   # "question: How do I…\\nanswer: …"`,
  },
  {
    id: "web",
    icon: "🌐",
    name: "Web pages & sites",
    loaders: "WebBaseLoader · RecursiveUrlLoader · SitemapLoader · AsyncChromiumLoader (JS-rendered pages)",
    returns: "One Document per URL with source, title and language in metadata.",
    watch: "Navigation, cookie banners and footers pollute every page — restrict parsing to the article body. Respect robots.txt and rate limits; JavaScript-heavy sites need a headless browser.",
    code: `import bs4
from langchain_community.document_loaders import WebBaseLoader, SitemapLoader

docs = WebBaseLoader(
    web_paths=["https://docs.example.com/refunds"],
    bs_kwargs={"parse_only": bs4.SoupStrainer(["article", "main"])},  # body only
).load()

# A whole documentation site via its sitemap:
site = SitemapLoader("https://docs.example.com/sitemap.xml",
                     filter_urls=[r"https://docs\\.example\\.com/guides/.*"]).load()`,
  },
  {
    id: "md",
    icon: "📘",
    name: "Markdown & HTML docs",
    loaders: "TextLoader / UnstructuredMarkdownLoader · BSHTMLLoader · then MarkdownHeaderTextSplitter / HTMLHeaderTextSplitter",
    returns: "The raw text; the header-aware splitter then produces one chunk per section with the headings in metadata.",
    watch: "Headings are free structure — keep them. A chunk that carries 'Refunds > Fees' in its metadata retrieves far better than an anonymous paragraph.",
    code: `from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter

text = TextLoader("README.md", encoding="utf-8").load()[0].page_content
splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")])
sections = splitter.split_text(text)
print(sections[1].metadata)    # {'h1': 'Refund Policy', 'h2': '2. Fees'}`,
  },
  {
    id: "json",
    icon: "🧾",
    name: "JSON & JSONL",
    loaders: "JSONLoader (with a jq schema)",
    returns: "One Document per element selected by the jq expression.",
    watch: "Pick the text field explicitly and move IDs, dates and authors into metadata, or they get embedded as noise. Needs the jq package.",
    code: `from langchain_community.document_loaders import JSONLoader

def meta(record: dict, metadata: dict) -> dict:
    metadata.update(ticket_id=record["id"], created=record["created_at"])
    return metadata

docs = JSONLoader(
    "tickets.jsonl",
    jq_schema=".",              # each line is one record
    content_key="body",         # the text to embed
    json_lines=True,
    metadata_func=meta,
).load()`,
  },
  {
    id: "code",
    icon: "💻",
    name: "Code repositories",
    loaders: "GitLoader · GenericLoader + LanguageParser",
    returns: "One Document per file (GitLoader), or per top-level function/class (LanguageParser).",
    watch: "Split code on syntax, not character counts — a chunk cut mid-function is useless. Exclude vendored, generated and binary files.",
    code: `from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language

docs = GenericLoader.from_filesystem(
    "./my_repo/src",
    glob="**/*",
    suffixes=[".py"],
    parser=LanguageParser(language=Language.PYTHON),   # one Document per function/class
).load()`,
  },
  {
    id: "saas",
    icon: "☁️",
    name: "SaaS & cloud storage",
    loaders: "ConfluenceLoader · NotionDBLoader · GoogleDriveLoader (langchain-google-community) · S3DirectoryLoader · SharePointLoader",
    returns: "One Document per page or file, with the source URL and service IDs in metadata.",
    watch: "Permissions: the vector store must not become a way around them. Store the access-control list in metadata and filter on it at query time. Schedule re-syncs.",
    code: `from langchain_community.document_loaders import ConfluenceLoader, S3DirectoryLoader

pages = ConfluenceLoader(
    url="https://acme.atlassian.net/wiki",
    username="bot@acme.com", api_key=CONFLUENCE_TOKEN,
    space_key="SUPPORT", include_attachments=False,
).load()

files = S3DirectoryLoader("acme-knowledge-base", prefix="policies/").load()`,
  },
  {
    id: "db",
    icon: "🗄️",
    name: "Databases",
    loaders: "SQLDatabaseLoader · MongodbLoader",
    returns: "One Document per result row of your query.",
    watch: "Load descriptive text (product descriptions, notes) for retrieval; keep numbers and aggregates in the database and query them live.",
    code: `from langchain_community.document_loaders import SQLDatabaseLoader
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("postgresql://reader@db/shop")
docs = SQLDatabaseLoader(
    "SELECT sku, name, description FROM products WHERE active",
    db=db,
    page_content_mapper=lambda row: f"{row['name']}: {row['description']}",
    metadata_mapper=lambda row: {"sku": row["sku"]},
).load()`,
  },
  {
    id: "av",
    icon: "🎧",
    name: "Audio & video",
    loaders: "YoutubeLoader · AssemblyAIAudioTranscriptLoader · OpenAIWhisperParser",
    returns: "The transcript as text, optionally split by time with timestamps in metadata.",
    watch: "Transcripts have no punctuation or headings to split on — chunk by time windows and keep timestamps so answers can link to the moment in the video.",
    code: `from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=VIDEO_ID",
    add_video_info=False,   # needs youtube-transcript-api
).load()`,
  },
];

function FormatExplorer() {
  const [id, setId] = useState("pdf");
  const f = FORMATS.find((x) => x.id === id);
  return (
    <Panel tone="emerald" title="Pick a source format">
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FORMATS.map((x) => (
          <button
            key={x.id}
            onClick={() => setId(x.id)}
            aria-pressed={id === x.id}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              id === x.id ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200" : "border-white/10 bg-white/5 text-gray-400 hover:text-gray-200"
            }`}
          >
            <span className="mr-1">{x.icon}</span>
            {x.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-black/30 border border-white/10">
              <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">LangChain loaders</div>
              <div className="text-xs text-emerald-200 font-mono leading-relaxed">{f.loaders}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/10">
              <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">What you get back</div>
              <div className="text-xs text-gray-300 leading-relaxed">{f.returns}</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/[0.07] border border-rose-500/25">
              <div className="text-[0.625rem] uppercase tracking-wide text-rose-300/80 mb-1">Watch out for</div>
              <div className="text-xs text-gray-300 leading-relaxed">{f.watch}</div>
            </div>
          </div>
          <CodeBlock language="python" code={f.code} />
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}

const PDF_PARSERS = [
  { n: "PyPDFLoader", speed: "Fast", tables: "Poor", ocr: "No", out: "Text per page", when: "Clean, text-only PDFs; quick prototypes" },
  { n: "PyMuPDFLoader", speed: "Very fast", tables: "Poor", ocr: "No", out: "Text per page + rich metadata", when: "Large volumes of digital PDFs" },
  { n: "PDFPlumberLoader", speed: "Medium", tables: "Fair", ocr: "No", out: "Text per page", when: "PDFs with simple tables" },
  { n: "UnstructuredLoader", speed: "Slow (hi_res)", tables: "Good", ocr: "Yes", out: "Typed elements", when: "Mixed layouts, scans, need to drop headers/footers" },
  { n: "DoclingLoader", speed: "Slow", tables: "Very good", ocr: "Yes", out: "Markdown / chunks", when: "Complex layouts, tables, keeping structure" },
  { n: "Azure Doc Intelligence · Textract · LlamaParse", speed: "Network-bound", tables: "Very good", ocr: "Yes", out: "Markdown / JSON", when: "Scans, forms and invoices at scale; costs per page" },
];

export default function RagIngestion() {
  const toc = [
    { label: "Where Ingestion Fits", hash: "where" },
    { label: "The Document Object", hash: "document" },
    { label: "Loader Lab", hash: "lab" },
    { label: "Format Explorer", hash: "formats" },
    { label: "Choosing a PDF Parser", hash: "pdf" },
    { label: "Loading a Whole Folder", hash: "folder" },
    { label: "Metadata That Pays Off", hash: "metadata" },
    { label: "Re-ingesting Without Duplicates", hash: "incremental" },
    { label: "Writing a Custom Loader", hash: "custom" },
    { label: "Checklist", hash: "checklist" },
  ];

  return (
    <GuideLayout
      title="Data Ingestion with LangChain"
      intro="The first step of every RAG system: getting knowledge out of PDFs, Office files, web pages, databases and SaaS tools and into clean LangChain Documents — with the right loader for each format, useful metadata, and re-runs that don't duplicate."
      toc={toc}
    >
      <Section id="where" title="Where Ingestion Fits" lead="Retrieval can only return what ingestion put into the index. A table that was flattened, a scan that was never OCR'd, or a page that was loaded twice is lost or noisy for good — no prompt or model upgrade downstream can recover it.">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-5">
          {[
            ["Sources", "bg-white/5 border-white/15 text-gray-300"],
            ["Load & extract", "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-400/40"],
            ["Clean", "bg-white/5 border-white/15 text-gray-300"],
            ["Chunk", "bg-white/5 border-white/15 text-gray-300"],
            ["Embed", "bg-white/5 border-white/15 text-gray-300"],
            ["Store", "bg-white/5 border-white/15 text-gray-300"],
          ].map(([t, cls], i, arr) => (
            <React.Fragment key={t}>
              <span className={`px-3 py-1.5 rounded-lg border ${cls}`}>{t}</span>
              {i < arr.length - 1 && <span className="text-gray-600">→</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="What LangChain gives you" tone="emerald"><p>Hundreds of <em>document loaders</em> behind one interface: every loader returns a list of <span className="font-mono">Document</span> objects, so the rest of the pipeline never cares whether the source was a PDF, a web page or a database.</p></Card>
          <Card title="What it doesn't do for you" tone="amber"><p>Pick the parser that fits your documents, clean the text, and decide what goes into metadata. Loaders extract; judgment about quality is still yours.</p></Card>
          <Card title="Where this sits" tone="indigo"><p>This page is the "load & extract" step. <a href="#/rag/data-prep" className="text-blue-400 hover:underline">Data Prep</a> covers cleaning, <a href="#/rag/chunking" className="text-blue-400 hover:underline">Chunking</a> the next step, and <a href="#/rag/indexing" className="text-blue-400 hover:underline">Indexing</a> the whole flow.</p></Card>
        </div>
      </Section>

      <Section id="document" title="The Document Object" lead="Everything a loader produces has the same two fields. Getting them right is most of ingestion.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="page_content: str" tone="indigo"><p>The text that will be chunked, embedded and shown to the model. Keep it to the meaningful text — no navigation, boilerplate or IDs.</p></Card>
          <Card title="metadata: dict" tone="emerald"><p>Everything else: source, page, section, dates, authors, permissions. Not embedded, but stored with every chunk, so it can filter searches and power citations.</p></Card>
        </div>
        <CodeBlock
          language="python"
          code={`from langchain_core.documents import Document

doc = Document(
    page_content="Items may be returned within 30 days of delivery.",
    metadata={"source": "refund_policy.pdf", "page": 0, "section": "1. Eligibility"},
)

loader.load()        # list[Document], all in memory
loader.lazy_load()   # generator of Documents — use it for large collections`}
        />
        <Note tone="indigo">
          A deeper tour of the loader interface (load vs lazy_load, loaders vs splitters) is on the{" "}
          <a href="#/agents/document-loaders" className="text-blue-400 hover:underline">Document Loaders</a> page.
        </Note>
      </Section>

      <Section id="lab" title="Loader Lab" lead="The loader you choose decides the shape of what reaches the chunker. Switch loaders and watch the same three-page PDF come out differently.">
        <LoaderLab />
      </Section>

      <Section id="formats" title="Format Explorer" lead="The recommended loaders for each kind of source, what they return, the usual trap, and working code.">
        <FormatExplorer />
        <p className="text-xs text-gray-500 mt-3">
          Most loaders live in <span className="font-mono">langchain-community</span>; some have their own packages
          (<span className="font-mono">langchain-unstructured</span>, <span className="font-mono">langchain-docling</span>,{" "}
          <span className="font-mono">langchain-google-community</span>). Each needs its parser installed too — the error
          message names it.
        </p>
      </Section>

      <Section id="pdf" title="Choosing a PDF Parser" lead="PDFs are the most common source and the most varied. There is no single best parser — match it to your documents.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Parser</th>
                <th className="p-3 font-medium">Speed</th>
                <th className="p-3 font-medium">Tables</th>
                <th className="p-3 font-medium">OCR</th>
                <th className="p-3 font-medium">Output</th>
                <th className="p-3 font-medium">Best for</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {PDF_PARSERS.map((p) => (
                <tr key={p.n} className="border-t border-white/5">
                  <td className="p-3 font-mono text-xs text-white">{p.n}</td>
                  <td className="p-3 text-xs">{p.speed}</td>
                  <td className="p-3 text-xs">{p.tables}</td>
                  <td className="p-3 text-xs">{p.ocr}</td>
                  <td className="p-3 text-xs">{p.out}</td>
                  <td className="p-3 text-xs text-gray-400">{p.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note tone="amber">
          Before choosing, open twenty real documents and look at what each parser returns. The ratings above are
          typical, not guarantees; your documents' layouts decide.
        </Note>
      </Section>

      <Section id="folder" title="Loading a Whole Folder" lead="Real knowledge bases are mixed folders. Route each file extension to the right loader, stream the results, and record which files failed.">
        <CodeBlock
          language="python"
          code={`from pathlib import Path
from langchain_community.document_loaders import (
    PyMuPDFLoader, Docx2txtLoader, CSVLoader, TextLoader, UnstructuredPowerPointLoader)

LOADERS = {
    ".pdf":  PyMuPDFLoader,
    ".docx": Docx2txtLoader,
    ".pptx": UnstructuredPowerPointLoader,
    ".csv":  CSVLoader,
    ".md":   lambda p: TextLoader(p, encoding="utf-8"),
    ".txt":  lambda p: TextLoader(p, encoding="utf-8"),
}

def load_folder(root: str):
    failed = []
    for path in Path(root).rglob("*"):
        make = LOADERS.get(path.suffix.lower())
        if make is None or not path.is_file():
            continue
        try:
            for doc in make(str(path)).lazy_load():      # stream, don't hold everything
                doc.metadata.update(source=str(path), file_type=path.suffix.lower())
                if doc.page_content.strip():             # skip empty pages (e.g. unOCR'd scans)
                    yield doc
        except Exception as err:                         # one bad file must not stop the run
            failed.append((str(path), repr(err)))
    if failed:
        print(f"{len(failed)} files failed:", failed[:5])

# Single format? DirectoryLoader does the same in one line:
# DirectoryLoader("./kb", glob="**/*.pdf", loader_cls=PyMuPDFLoader,
#                 show_progress=True, use_multithreading=True).load()`}
        />
      </Section>

      <Section id="metadata" title="Metadata That Pays Off" lead="Metadata is stored with every chunk. Add it at load time, when you still know where the text came from.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Source & location" tone="indigo"><p>File path or URL, page number, section heading. Powers citations — "see page 4 of the refund policy".</p></Card>
          <Card title="Freshness" tone="emerald"><p>Created and updated dates. Filter out superseded versions, or prefer recent ones when documents conflict.</p></Card>
          <Card title="Access control" tone="rose"><p>Which users or groups may see this document. Filter on it at query time so RAG never leaks what a user could not open.</p></Card>
          <Card title="Type & product" tone="amber"><p>doc_type, product, region, language — cheap filters that shrink the search space before vector similarity.</p></Card>
          <Card title="A stable ID" tone="purple"><p>A deterministic ID per source document (path or URL) so re-ingestion can update and delete, not just append.</p></Card>
          <Card title="Keep it out of the text" tone="blue"><p>IDs, timestamps and tags inside page_content get embedded as noise. Put them in metadata instead.</p></Card>
        </div>
      </Section>

      <Section id="incremental" title="Re-ingesting Without Duplicates" lead="Documents change. Running the pipeline again should update changed files, skip unchanged ones and remove deleted ones — not append a second copy of everything.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Hash each chunk" tone="indigo"><p>LangChain's indexing API hashes content plus metadata and records what it has written, so unchanged chunks are skipped.</p></Card>
          <Card title="Know the source" tone="emerald"><p>Tell it which metadata key identifies the source document, so it knows which old chunks belong to a changed file.</p></Card>
          <Card title="Pick a cleanup mode" tone="amber"><p><span className="font-mono">incremental</span> replaces chunks of documents you re-send; <span className="font-mono">full</span> also deletes anything not seen in this run.</p></Card>
        </div>
        <CodeBlock
          language="python"
          code={`from langchain_core.indexing import index
# SQLRecordManager's import path depends on your LangChain version:
#   LangChain 0.x: from langchain.indexes import SQLRecordManager
#   LangChain 1.x: from langchain_classic.indexes import SQLRecordManager
from langchain_classic.indexes import SQLRecordManager

record_manager = SQLRecordManager("pgvector/kb", db_url="sqlite:///ingest_records.db")
record_manager.create_schema()

result = index(
    chunks,                       # the split Documents, each with metadata["source"]
    record_manager,
    vector_store,
    cleanup="incremental",        # or "full" for a complete re-sync
    source_id_key="source",
)
print(result)   # {'num_added': 12, 'num_updated': 0, 'num_skipped': 340, 'num_deleted': 9}`}
        />
      </Section>

      <Section id="custom" title="Writing a Custom Loader" lead="No loader for your internal system? Subclass BaseLoader and yield Documents; everything downstream works unchanged.">
        <CodeBlock
          language="python"
          code={`from typing import Iterator
import requests
from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document

class TicketLoader(BaseLoader):
    """Loads resolved support tickets from an internal API."""

    def __init__(self, base_url: str, token: str, since: str):
        self.base_url, self.token, self.since = base_url, token, since

    def lazy_load(self) -> Iterator[Document]:
        page = 1
        while True:
            r = requests.get(f"{self.base_url}/tickets",
                             params={"status": "resolved", "since": self.since, "page": page},
                             headers={"Authorization": f"Bearer {self.token}"}, timeout=30)
            r.raise_for_status()
            items = r.json()["items"]
            if not items:
                return
            for t in items:
                yield Document(
                    page_content=f"Q: {t['subject']}\\n{t['body']}\\n\\nResolution: {t['resolution']}",
                    metadata={"source": f"ticket:{t['id']}", "product": t["product"],
                              "updated": t["updated_at"], "team": t["team"]},
                )
            page += 1

docs = list(TicketLoader("https://support.internal/api", TOKEN, since="2026-01-01").lazy_load())`}
        />
      </Section>

      <Section id="checklist" title="Checklist">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["Inspect the output", "Print twenty loaded Documents from real files before building anything on top of them."],
            ["Catch empty pages", "Zero-length page_content usually means a scan that needs OCR, or a parser failure."],
            ["Strip the furniture", "Repeated headers, footers, navigation and cookie banners — remove them before chunking."],
            ["Keep tables as tables", "Use a layout-aware parser or keep the HTML/Markdown table; flattened tables answer nothing."],
            ["Stream large sources", "lazy_load() and batch writes to the vector store instead of load() on a million files."],
            ["Log failures, keep going", "One corrupt file should be reported, not stop the run."],
            ["Metadata at load time", "Source, page, section, dates, permissions, and a stable ID."],
            ["Make re-runs idempotent", "Use the indexing API or your own hashes so updates don't duplicate."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("rag-ingestion")} />
    </GuideLayout>
  );
}

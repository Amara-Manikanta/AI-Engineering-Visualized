import GuideLayout from "../components/GuideLayout";
import { motion } from "framer-motion";

export default function DocumentLoaders() {
  const toc = [
    { label: "1. What is a Loader?", hash: "#what-is" },
    { label: "2. Why are they needed?", hash: "#why-loaders" },
    { label: "3. The Document Object", hash: "#doc-object" },
    { label: "3.1 page_content", hash: "#page-content", indent: true },
    { label: "3.2 metadata", hash: "#metadata", indent: true },
    { label: "4. Loading Pipeline", hash: "#pipeline" },
    { label: "5. Types of Loaders", hash: "#types" },
    { label: "6. load() vs lazy_load()", hash: "#methods" },
    { label: "7. Loader vs Splitter", hash: "#loader-vs-splitter" },
    { label: "8. End-to-End Example", hash: "#example" },
    { label: "9. Best Practices", hash: "#best-practices" }
  ];

  return (
    <GuideLayout 
      title="Document Loaders"
      intro="The foundational entry point for injecting proprietary data into the LangChain and RAG ecosystems."
      toc={toc}
    >
      <section id="what-is" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">1. What is a Document Loader?</h2>
        <p className="text-gray-400 leading-relaxed">
          A Document Loader is a class in LangChain responsible for ingesting data from a source (a file, a database, a web page, an S3 bucket) and converting it into a standardized <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">Document</code> format that the rest of the LangChain ecosystem can understand.
        </p>
      </section>

      <section id="why-loaders" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">2. Why are Document Loaders needed?</h2>
        <p className="text-gray-400 leading-relaxed">
          Language Models only understand plain text strings. However, your proprietary data lives in complex formats: PDFs, CSVs, Notion pages, Slack channels, and HTML. Document Loaders abstract away the complex parsing libraries (like <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">pypdf</code>, <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">beautifulsoup</code>, or <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">pandas</code>) required to extract text from these sources.
        </p>
      </section>

      <section id="doc-object" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">3. LangChain Document Object</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          Every Document Loader, regardless of the source, returns one or more <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">Document</code> objects. This standardization is crucial for downstream tasks like Text Splitting and Embeddings.
        </p>
        
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`class Document:
    page_content: str
    metadata: dict`}
        </div>

        <h4 id="page-content" className="text-lg font-bold text-indigo-400 mt-6 mb-2">3.1 page_content</h4>
        <p className="text-gray-400 leading-relaxed mb-4">
          This is the raw, extracted text content from the source file. It is stripped of non-text formatting (like PDF binary data) but retains the semantic structure (newlines, paragraphs).
        </p>

        <h4 id="metadata" className="text-lg font-bold text-indigo-400 mt-6 mb-2">3.2 metadata</h4>
        <p className="text-gray-400 leading-relaxed mb-4">
          A dictionary containing crucial provenance information. This is used later during retrieval to filter results (e.g., "Only search documents where <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">year=2024</code>"). Typical metadata includes:
        </p>
        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-1">
          <li><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">source</code>: The filepath or URL.</li>
          <li><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">page</code>: The page number (for PDFs).</li>
          <li><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">author</code>: The document creator.</li>
        </ul>
      </section>

      <section id="pipeline" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">4. Document Loading Pipeline</h2>
        <p className="text-gray-400 leading-relaxed mb-6">Here is a visual representation of how raw files are ingested:</p>
        
        <div className="bg-[#141414] border border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-center gap-6 overflow-hidden">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] border-2 border-orange-500/50 rounded-xl p-6 text-center font-bold relative z-10 w-48 text-gray-200"
            >
              <span className="block text-3xl mb-2">📄</span>
              Raw PDF / Webpage
            </motion.div>

            <div className="relative w-20 h-1 bg-white/10 rotate-90 md:rotate-0 my-4 md:my-0">
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-indigo-500 rounded-sm"
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a1a] border-2 border-blue-500/50 rounded-xl p-6 text-center font-bold relative z-10 w-48 text-gray-200"
            >
              <span className="block text-3xl mb-2">⚙️</span>
              PyPDFLoader
            </motion.div>

            <div className="relative w-20 h-1 bg-white/10 rotate-90 md:rotate-0 my-4 md:my-0">
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-indigo-500 rounded-sm"
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1a1a1a] border-2 border-green-500/50 rounded-xl p-6 text-center font-bold relative z-10 w-56 text-gray-200"
            >
              <span className="block text-3xl mb-2">📦</span>
              Document Object<br/>
              <span className="text-xs font-normal text-gray-400">(page_content, metadata)</span>
            </motion.div>
        </div>
      </section>

      <section id="types" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">5. Types of Document Loaders</h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          LangChain provides hundreds of specialized loaders. Here are the most common:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-gray-200">
              <tr>
                <th className="border border-white/10 p-3 font-semibold">Loader Class</th>
                <th className="border border-white/10 p-3 font-semibold">Source</th>
                <th className="border border-white/10 p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">TextLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">.txt</code></td>
                <td className="border border-white/10 p-3">The simplest loader. Reads a raw text file into a single Document.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">PyPDFLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">.pdf</code></td>
                <td className="border border-white/10 p-3">Uses <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">pypdf</code>. Returns one Document per page, making metadata tracking easy.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">CSVLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">.csv</code></td>
                <td className="border border-white/10 p-3">Loads each row of a CSV as a distinct Document, ideal for tabular Q&A.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">Docx2txtLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">.docx</code></td>
                <td className="border border-white/10 p-3">Extracts text from Microsoft Word documents.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">WebBaseLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">http://...</code></td>
                <td className="border border-white/10 p-3">Uses <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">urllib</code> and <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">BeautifulSoup</code> to scrape and parse HTML text from a URL.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">DirectoryLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">folder/</code></td>
                <td className="border border-white/10 p-3">Loads all files within a specific local directory, optionally filtering by glob patterns.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">JSONLoader</code></td>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">.json</code></td>
                <td className="border border-white/10 p-3">Uses <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">jq</code> syntax to extract specific nested fields from JSON files.</td>
              </tr>
              <tr>
                <td className="border border-white/10 p-3"><code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">UnstructuredLoader</code></td>
                <td className="border border-white/10 p-3">Any</td>
                <td className="border border-white/10 p-3">Uses the <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">unstructured</code> package to automatically parse PDFs, images, and PPTs using OCR.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="methods" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">6. load() vs lazy_load() vs aload()</h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          Document Loaders expose different execution methods based on memory constraints:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-lg text-center">
            <div className="font-mono font-bold text-indigo-400 mb-2">.load()</div>
            <p className="text-sm text-gray-400">Loads all documents into memory at once. Returns a <code className="bg-white/5 px-1 py-0.5 rounded text-indigo-300">List[Document]</code>. Dangerous for massive datasets.</p>
          </div>
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-lg text-center">
            <div className="font-mono font-bold text-indigo-400 mb-2">.lazy_load()</div>
            <p className="text-sm text-gray-400">Returns a Python Generator. Yields Documents one-by-one, preventing Out-Of-Memory errors.</p>
          </div>
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-lg text-center">
            <div className="font-mono font-bold text-indigo-400 mb-2">.aload()</div>
            <p className="text-sm text-gray-400">The asynchronous version of <code className="bg-white/5 px-1 py-0.5 rounded text-indigo-300">.load()</code>, useful when loading from APIs or cloud sources.</p>
          </div>
        </div>
      </section>

      <section id="loader-vs-splitter" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">7. Document Loader vs Text Splitter</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          It's important not to confuse Loaders with Chunkers (Splitters).
        </p>
        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
          <li><strong>Document Loaders</strong> pull the raw data into LangChain memory. A loader might return a single 100-page Document, or 100 1-page Documents.</li>
          <li><strong>Text Splitters</strong> (like <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">RecursiveCharacterTextSplitter</code>) take those loaded Documents and slice them into mathematically sized chunks (e.g., 500 tokens) so they fit inside an LLM's context window.</li>
        </ul>
      </section>

      <section id="example" className="border-b border-white/10 pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">8. Code Examples</h2>
        
        <h4 className="text-lg font-bold text-indigo-400 mt-6 mb-2">8.1 Using load()</h4>
        <p className="text-gray-400 leading-relaxed mb-4">
          Here is how you load a PDF, inspect its metadata, and pass it to a Text Splitter:
        </p>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Initialize Loader
loader = PyPDFLoader("annual_report.pdf")

# 2. Load the Document objects (all at once)
docs = loader.load()

print(f"Loaded {len(docs)} pages.")
print(f"Metadata of page 1: {docs[0].metadata}")

# 3. Split into manageable chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)`}
        </div>

        <h4 className="text-lg font-bold text-indigo-400 mt-8 mb-2">8.2 Using lazy_load()</h4>
        <p className="text-gray-400 leading-relaxed mb-4">
          For large datasets, use a generator to process one document at a time and avoid out-of-memory errors:
        </p>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`# 1. Initialize Loader
loader = PyPDFLoader("massive_report.pdf")

# 2. Process documents lazily as a generator
for doc in loader.lazy_load():
    print(f"Processing page {doc.metadata['page']}...")
    
    # Split or insert into Vector DB one-by-one to save memory
    # chunks = splitter.split_documents([doc])`}
        </div>

        <h4 className="text-lg font-bold text-indigo-400 mt-8 mb-2">8.3 Using aload()</h4>
        <p className="text-gray-400 leading-relaxed mb-4">
          For asynchronous operations (like handling concurrent requests in a web server):
        </p>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`import asyncio
from langchain_community.document_loaders import PyPDFLoader

async def load_docs_async():
    loader = PyPDFLoader("annual_report.pdf")
    
    # Await the async load method
    docs = await loader.aload()
    print(f"Async loaded {len(docs)} pages.")

# asyncio.run(load_docs_async())`}
        </div>
      </section>

      <section id="best-practices" className="pb-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">9. Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-lg">
            <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">✅ DO</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
              <li>Use <code className="bg-white/5 px-1 py-0.5 rounded text-emerald-300">lazy_load()</code> when processing thousands of files.</li>
              <li>Inject custom tags into <code className="bg-white/5 px-1 py-0.5 rounded text-emerald-300">metadata</code> immediately after loading to help with vector search filtering later.</li>
              <li>Use <code className="bg-white/5 px-1 py-0.5 rounded text-emerald-300">UnstructuredLoader</code> for messy enterprise PDFs that contain embedded tables and images.</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
            <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">❌ DON'T</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
              <li>Don't pass raw <code className="bg-white/5 px-1 py-0.5 rounded text-red-300">Document</code> objects directly into an embedding model without running them through a <code className="bg-white/5 px-1 py-0.5 rounded text-red-300">TextSplitter</code> first.</li>
              <li>Don't use <code className="bg-white/5 px-1 py-0.5 rounded text-red-300">WebBaseLoader</code> for client-side rendered Single Page Applications (React/Vue) as it won't render JavaScript. Use a headless browser loader instead.</li>
            </ul>
          </div>
        </div>
      </section>
    </GuideLayout>
  );
}

/**
 * Content for the five RAG-variant pages, which previously carried only an
 * animation and no explanation. Kept in one file so the five read consistently
 * and so the comparison between them stays honest.
 */

export const VARIANT_TOC = [
  { label: "The Animation", hash: "anim" },
  { label: "How It Works", hash: "how" },
  { label: "What It Costs", hash: "cost" },
  { label: "When to Use It", hash: "when" },
  { label: "In Code", hash: "code" },
  { label: "Read Next", hash: "next" },
];

export const NAIVE = {
  how: [
    { t: "Chunk and embed once, offline", d: "Split every document into fixed-size pieces, embed each one, and store the vectors. This happens at index time and is the only expensive step." },
    { t: "Embed the query with the same model", d: "The query must go through the identical embedding model. A mismatch here produces vectors in different spaces and retrieval that looks random." },
    { t: "Take the top k by cosine similarity", d: "Nearest-neighbour search returns the k closest chunks. No re-ranking, no filtering, no query rewriting — the raw similarity ordering is the answer." },
    { t: "Concatenate and generate", d: "Paste the chunks into the prompt above the question and let the model write. Everything retrieved goes in, relevant or not." },
  ],
  cost: {
    latency: "One embedding call plus one vector search. Typically 50 to 200ms on top of generation.",
    calls: "One embedding, one generation. The cheapest possible RAG.",
    complexity: "An afternoon. Roughly thirty lines with any framework, or none at all.",
  },
  good: [
    "Establishing the baseline every other variant is measured against.",
    "Homogeneous documents where one chunk usually holds a whole answer.",
    "Queries that share vocabulary with the source text.",
    "Proving the idea works before investing in the pipeline.",
  ],
  bad: [
    "Questions needing facts combined from several documents.",
    "Queries phrased differently from the corpus — acronyms, jargon, synonyms.",
    "Corpora with heavy near-duplicate boilerplate.",
    "Anywhere a wrong answer has real consequences and nothing checks the retrieval.",
  ],
  note: "Build this first even if you know you need more. Every later improvement has to be justified against a number, and this is the number. Teams that skip the baseline usually cannot say whether their re-ranker helped.",
  code: {
    language: "python",
    source: `from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate

# --- index time: done once ---
chunks = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=50
).split_documents(docs)

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
store = FAISS.from_documents(chunks, embeddings)

# --- query time ---
prompt = ChatPromptTemplate.from_template(
    "Answer using ONLY the context. If it is not there, say so.\\n\\n"
    "Context:\\n{context}\\n\\nQuestion: {question}"
)

def answer(question, k=4):
    hits = store.similarity_search(question, k=k)
    context = "\\n\\n".join(d.page_content for d in hits)
    chain = prompt | ChatOpenAI(model="gpt-4o-mini")
    return chain.invoke({"context": context, "question": question}).content

# The same embedding model must be used for documents and queries.
# Mismatching them is the single most common naive-RAG bug.`,
  },
  next: [
    { label: "Chunking", path: "#/rag/chunking", why: "The decision that most determines whether this baseline works at all." },
    { label: "Advanced RAG", path: "#/rag/advanced-rag", why: "What to add once you can measure what the baseline misses." },
    { label: "RAG Evaluation", path: "#/rag/evaluation", why: "How to get the number this baseline is worth." },
  ],
};

export const ADVANCED = {
  how: [
    { t: "Pre-retrieval: rewrite the query", d: "Expand acronyms, generate paraphrases, or decompose a multi-part question into separate searches. The user's phrasing is rarely the best search string." },
    { t: "Retrieve wider than you need", d: "Pull 20 to 50 candidates rather than 4. Recall is cheap at this stage and irrecoverable later — anything missed here can never be ranked back in." },
    { t: "Hybrid search", d: "Run dense vector search and sparse keyword search together, then fuse the rankings. Dense catches meaning, sparse catches exact identifiers and rare terms that embeddings blur away." },
    { t: "Post-retrieval: re-rank properly", d: "A cross-encoder reads the query and each candidate together rather than comparing two independent vectors. Much more accurate, much slower, which is why it runs on 30 candidates and not the whole index." },
    { t: "Compress and order", d: "Strip irrelevant sentences, drop near-duplicates, and place the strongest material at the start and end of the context rather than the middle." },
  ],
  cost: {
    latency: "Adds 200ms to 2s depending on whether query rewriting uses a model call.",
    calls: "Two to four, plus a re-ranker. Several times the naive baseline.",
    complexity: "Days, not hours. Each stage needs its own measurement to justify it.",
  },
  good: [
    "The naive baseline measurably misses documents you know exist.",
    "Users phrase questions differently from how the corpus is written.",
    "The corpus mixes prose with identifiers, codes, or product numbers.",
    "Answer quality is worth more than 500ms of latency.",
  ],
  bad: [
    "You have not measured the naive baseline yet.",
    "Retrieval is already finding the right chunk and generation is the weak link.",
    "Strict latency budgets where a re-ranker will not fit.",
    "A corpus small enough to put entirely in the context window.",
  ],
  note: "Add one stage at a time and measure after each. Teams routinely ship four improvements at once, see a gain, and never learn that three of them did nothing — or that one of them actively hurt.",
  code: {
    language: "python",
    source: `from langchain.retrievers import EnsembleRetriever, ContextualCompressionRetriever
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 1. Hybrid: dense for meaning, sparse for exact terms.
dense  = store.as_retriever(search_kwargs={"k": 25})
sparse = BM25Retriever.from_documents(chunks); sparse.k = 25

hybrid = EnsembleRetriever(
    retrievers=[dense, sparse],
    weights=[0.6, 0.4],       # tune on your own eval set, not on intuition
)

# 2. Re-rank with a cross-encoder, then keep only the best few.
reranker = CrossEncoderReranker(
    model=HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base"),
    top_n=5,
)

retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=hybrid,
)

# Measure each stage separately. "Recall@25 before rerank" and
# "precision@5 after" are different numbers with different fixes.`,
  },
  next: [
    { label: "Advanced Retrieval", path: "#/rag/advanced-retrieval", why: "Hybrid search, HyDE and re-ranking in full detail." },
    { label: "Contextual Compression", path: "#/rag/compression", why: "The post-retrieval stage that cuts cost and raises accuracy." },
    { label: "RAG Evaluation", path: "#/rag/evaluation", why: "Required, or you cannot tell which stage earned its place." },
  ],
};

export const SELF = {
  how: [
    { t: "The model decides whether to retrieve at all", d: "It emits a Retrieve token. Many questions need no documents — asking for a summary of the conversation, or basic arithmetic — and searching anyway only adds noise and latency." },
    { t: "It grades each retrieved passage", d: "An IsRelevant token per document. Passages that score poorly are dropped before they reach generation, so a bad retrieval does not automatically become a bad answer." },
    { t: "It checks its own claims against the source", d: "An IsSupported token asserts whether each generated segment is actually backed by the cited passage. This is the step that attacks hallucination directly." },
    { t: "It rates its own usefulness", d: "An IsUseful token scores whether the answer addresses the question. Candidate answers can be generated in parallel and ranked by these scores." },
  ],
  cost: {
    latency: "Higher and variable. Reflection adds generation steps, and the count depends on the query.",
    calls: "One to many. The model may retrieve several times or not at all.",
    complexity: "High. The reflection tokens must be trained in, so this needs a fine-tuned model rather than prompting.",
  },
  good: [
    "Mixed workloads where some questions need retrieval and some do not.",
    "Domains where an unsupported claim is expensive.",
    "You can fine-tune, or can use a model already trained with these tokens.",
    "You want the citation check to be part of generation rather than a separate pass.",
  ],
  bad: [
    "Prompting-only setups — the reflection tokens are a training artefact.",
    "Tight, predictable latency budgets.",
    "Every query genuinely needs retrieval, so the adaptive step buys nothing.",
    "A simpler grader step would get most of the benefit for far less work.",
  ],
  note: "The idea that generalises beyond Self-RAG is worth taking even if you never fine-tune a model: grade retrieved passages before generating, and check generated claims against their sources. You can approximate both with ordinary model calls today.",
  code: {
    language: "python",
    source: `# Approximating Self-RAG's behaviour with a standard model and structured output.
# The real method trains reflection tokens into the model; this gets much of
# the benefit with prompting, at the cost of extra calls.

from pydantic import BaseModel, Field

class Grade(BaseModel):
    relevant: bool = Field(description="Does this passage help answer the question?")
    reason: str

class Support(BaseModel):
    supported: bool = Field(description="Is every claim backed by the context?")
    unsupported_claims: list[str]

grader  = llm.with_structured_output(Grade)
checker = llm.with_structured_output(Support)

def self_rag(question):
    if not needs_retrieval(question):          # step 1: retrieve or not
        return llm.invoke(question).content

    docs = retriever.invoke(question)

    keep = [d for d in docs                     # step 2: grade each passage
            if grader.invoke(f"Q: {question}\\nPassage: {d.page_content}").relevant]
    if not keep:
        return "The documents do not contain an answer to that."

    answer = generate(question, keep)

    check = checker.invoke(f"Context: {keep}\\nAnswer: {answer}")  # step 3
    if not check.supported:
        return regenerate_conservatively(question, keep, check.unsupported_claims)
    return answer`,
  },
  next: [
    { label: "Corrective RAG", path: "#/rag/crag", why: "The same grading idea, with a fallback when documents score badly." },
    { label: "Agentic RAG", path: "#/rag/agentic-rag", why: "Hands the whole loop to an agent rather than to trained tokens." },
    { label: "RAG Evaluation", path: "#/rag/evaluation", why: "Faithfulness is the metric this variant is optimising." },
  ],
};

export const CRAG = {
  how: [
    { t: "Retrieve normally", d: "Start with ordinary vector search. Corrective RAG is a layer on top of whatever retriever you already have, not a replacement for it." },
    { t: "Grade the results", d: "A lightweight evaluator scores retrieved documents against the query and returns one of three verdicts: correct, ambiguous, or incorrect." },
    { t: "Correct means refine", d: "Decompose the good documents into smaller strips, discard the irrelevant ones, and recombine. Even good retrievals carry padding." },
    { t: "Incorrect means look elsewhere", d: "Discard the retrieval entirely and fall back to web search, or another corpus. This is the move that gives the method its name — it does not generate from documents it has judged bad." },
    { t: "Ambiguous means both", d: "Combine the refined internal documents with external results, on the grounds that neither source alone is trustworthy here." },
  ],
  cost: {
    latency: "Adds a grader call always, plus a web search when the grade is poor.",
    calls: "Two normally, three or more when correction triggers.",
    complexity: "Moderate. The grader is a small prompted model; the fallback needs a second source wired in.",
  },
  good: [
    "Your corpus has genuine gaps and you have a sensible fallback source.",
    "Answering from bad documents is worse than answering slowly.",
    "Query distribution is wide enough that some questions fall outside the corpus.",
    "You already log retrieval quality and know how often it fails.",
  ],
  bad: [
    "A closed domain where the web is not an acceptable source.",
    "Retrieval already succeeds nearly always — you are paying a grader for nothing.",
    "Strict latency budgets, since the correction path is the slow one.",
    "Regulated settings where every source must come from an approved corpus.",
  ],
  note: "The grader is the whole system, and a bad grader makes things worse rather than better. Measure it on its own before trusting it: label a hundred real retrievals as good or bad by hand, and check the grader agrees.",
  code: {
    language: "python",
    source: `from pydantic import BaseModel, Field
from typing import Literal

class Verdict(BaseModel):
    grade: Literal["correct", "ambiguous", "incorrect"]
    reason: str = Field(description="One sentence.")

grader = small_llm.with_structured_output(Verdict)   # use a CHEAP model here

GRADE_PROMPT = """Question: {q}

Retrieved documents:
{docs}

Grade the retrieval:
- correct:   the documents clearly contain the answer
- ambiguous: partially relevant, but incomplete
- incorrect: the documents do not address the question"""

def corrective_rag(question):
    docs = retriever.invoke(question)
    v = grader.invoke(GRADE_PROMPT.format(q=question, docs=format_docs(docs)))

    if v.grade == "correct":
        context = refine(docs)                       # strip-and-recombine
    elif v.grade == "incorrect":
        context = web_search(rewrite_for_search(question))
    else:
        context = refine(docs) + web_search(rewrite_for_search(question))

    return generate(question, context)

# Log every verdict. The distribution of grades over a week tells you
# whether the problem is your corpus, your chunking, or your embeddings.`,
  },
  next: [
    { label: "Self-RAG", path: "#/rag/self-rag", why: "The same grading instinct, trained into the model instead." },
    { label: "Advanced Retrieval", path: "#/rag/advanced-retrieval", why: "Often fixes the retrieval failures before a grader is needed." },
    { label: "Agentic RAG", path: "#/rag/agentic-rag", why: "Generalises the fallback into a full decision loop." },
  ],
};

export const MULTIMODAL = {
  how: [
    { t: "Decide what each modality becomes", d: "Two approaches. Either embed images and text into one shared vector space, or caption every image with a vision model and retrieve over text. The second is less elegant and often works better." },
    { t: "Parse documents structurally, not as text", d: "A PDF is not a string. Tables, figures, and charts must be extracted as objects, because flattening a table into prose destroys exactly the relationships the table existed to express." },
    { t: "Index a summary, return the original", d: "Store an embedded text summary of each image or table, but keep a pointer to the raw asset. Retrieval happens on the summary; generation receives the actual image." },
    { t: "Let a vision model read the retrieved image", d: "The final generation step takes the raw image alongside the text. A caption written at index time cannot anticipate every question that will be asked about the figure." },
  ],
  cost: {
    latency: "Higher. Vision model calls are slower than text, at both index and query time.",
    calls: "One or more vision calls per query, plus captioning for every asset at index time.",
    complexity: "The highest of the variants here. Parsing is the hard part, and it is unglamorous work.",
  },
  good: [
    "Technical documentation where diagrams carry information the text does not.",
    "Financial and scientific reports built around tables and charts.",
    "Product catalogues, where the picture is the content.",
    "Slide decks, which are close to unusable when flattened to text.",
  ],
  bad: [
    "Corpora where images are decorative and the text is complete.",
    "Tight budgets — vision calls cost substantially more than text.",
    "Anywhere a good table parser alone would solve the actual problem.",
    "Before you have measured how often answers actually depend on a figure.",
  ],
  note: "Most of the difficulty is not multimodal retrieval, it is document parsing. Teams routinely build an elegant image-embedding pipeline on top of a PDF parser that silently mangles every table, and then wonder why the numbers are wrong.",
  code: {
    language: "python",
    source: `from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.storage import InMemoryStore
import uuid, base64

# Index a SUMMARY, keep a pointer to the ORIGINAL. The summary is what gets
# embedded and searched; the original image is what the model finally sees.
store = InMemoryStore()
retriever = MultiVectorRetriever(
    vectorstore=vectorstore, docstore=store, id_key="doc_id"
)

def index_image(image_bytes):
    b64 = base64.b64encode(image_bytes).decode()
    summary = vision_llm.invoke([{
        "role": "user",
        "content": [
            {"type": "text", "text":
             "Describe this figure for retrieval. Name the variables, axes, "
             "units and the trend. Be specific — this text is what gets searched."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}"}},
        ],
    }]).content

    doc_id = str(uuid.uuid4())
    vectorstore.add_documents([Document(page_content=summary,
                                        metadata={"doc_id": doc_id})])
    store.mset([(doc_id, b64)])      # the raw image, retrievable later

# At query time the retriever returns the raw image, not the summary,
# so the vision model can answer questions the caption never anticipated.`,
  },
  next: [
    { label: "Data Prep", path: "#/rag/data-prep", why: "Parsing is where multimodal RAG actually succeeds or fails." },
    { label: "Chunking", path: "#/rag/chunking", why: "Tables and figures break every naive splitting strategy." },
    { label: "Embeddings", path: "#/rag/embeddings", why: "What a shared image-and-text vector space really means." },
  ],
};

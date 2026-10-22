import React from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import AdvancedFlowchart from "../components/AdvancedFlowchart";
import * as charts from "../data/flowcharts";

export default function RagFundamentals() {
  const toc = [
    { label: "What is RAG?", hash: "what-is-rag" },
    { label: "Why RAG?", hash: "why-rag" },
    { label: "Architecture", hash: "architecture" },
    { label: "Advantages", hash: "advantages" },
    { label: "Limitations", hash: "limitations" },
    { label: "vs Fine-tuning", hash: "vs-finetuning" },
    { label: "vs Long Context", hash: "vs-longcontext" },
    { label: "Use Cases", hash: "use-cases" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <GuideLayout
      title="RAG Fundamentals"
      intro="Core concepts behind Retrieval-Augmented Generation."
      toc={toc}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.section variants={itemVariants}>
          <h2 id="what-is-rag" className="text-2xl font-semibold mb-4 text-white">What is RAG?</h2>
          <p className="text-gray-300 leading-relaxed">
            Retrieval-Augmented Generation (RAG) is an architecture that provides Large Language Models (LLMs) with external, factual data retrieved from a custom knowledge base before they generate a response. This grounds the AI in reality rather than relying solely on its pre-trained weights.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="why-rag" className="text-2xl font-semibold mb-4 text-white">Why RAG?</h2>
          <p className="text-gray-300 leading-relaxed">
            LLMs have two major flaws: they hallucinate facts and their knowledge is frozen in time. RAG solves both by forcing the model to cite retrieved documents, allowing for real-time updates without retraining.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="architecture" className="text-2xl font-semibold mb-4 text-white">RAG Architecture & Pipeline</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A standard RAG pipeline operates in two distinct phases:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-6">
            <li><strong className="text-white">Phase 1 (Indexing):</strong> Documents are loaded, chunked, converted into vector embeddings, and stored in a vector database.</li>
            <li><strong className="text-white">Phase 2 (Retrieval & Generation):</strong> A user's query is converted to a vector, the DB finds the most semantically similar chunks, and these chunks are injected into the LLM's prompt to answer the query.</li>
          </ul>
          <p className="text-sm text-gray-400 mb-3">The diagram below shows Phase 2 end to end — the same query → embed → search → generate flow every RAG variant on this site builds on:</p>
          <AdvancedFlowchart nodes={charts.naiveRag.nodes} edges={charts.naiveRag.edges} currentStep={10} />
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="advantages" className="text-2xl font-semibold mb-4 text-white">Advantages of RAG</h2>
          <p className="text-gray-300 leading-relaxed">
            RAG offers high accuracy, verifiable citations, the ability to restrict access via metadata filtering, and vastly lower costs compared to fine-tuning.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="limitations" className="text-2xl font-semibold mb-4 text-white">Limitations of RAG</h2>
          <p className="text-gray-300 leading-relaxed">
            RAG struggles with tasks requiring a holistic understanding of a massive document (e.g. "summarize this entire book"), heavily relies on chunking strategies, and introduces latency during the retrieval step.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="vs-finetuning" className="text-2xl font-semibold mb-4 text-white">RAG vs Fine-tuning</h2>
          <p className="text-gray-300 leading-relaxed">
            Fine-tuning is for changing <em className="italic text-gray-200">behavior, tone, or format</em>. RAG is for updating <em className="italic text-gray-200">knowledge and facts</em>. They are often used together.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="vs-longcontext" className="text-2xl font-semibold mb-4 text-white">RAG vs Long Context Models</h2>
          <p className="text-gray-300 leading-relaxed">
            While models now support 1M+ tokens, stuffing everything into context is expensive, slow, and suffers from "lost in the middle" degradation. RAG remains cheaper, faster, and more precise for factual retrieval.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 id="use-cases" className="text-2xl font-semibold mb-4 text-white">Ideal Use Cases</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li><strong>Internal Knowledge Bases:</strong> Q&A over company wikis or technical docs.</li>
            <li><strong>Customer Support:</strong> AI agents that search support tickets to solve issues.</li>
            <li><strong>Legal/Medical Analysis:</strong> Summarizing or querying massive regulatory/case law documents.</li>
          </ul>
        </motion.section>
      </motion.div>
    </GuideLayout>
  );
}

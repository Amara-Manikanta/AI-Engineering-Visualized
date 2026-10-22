import React from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import { Link } from "react-router-dom";

export default function GenAiIndex() {
  const toc = [
    { label: "Core Concepts", hash: "concepts" }
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
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <GuideLayout
      title="Generative AI"
      intro="Deep dive into AI Models, Inference, Prompt Engineering, Embeddings, Fine-tuning, and Quantization."
      toc={toc}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <motion.section id="concepts" variants={itemVariants} className="scroll-mt-24">
          <h2 className="text-3xl font-bold mb-8 text-white">Explore Core Concepts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* AI Models */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/llms">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">AI Models</h3>
                <p className="text-gray-400 mb-6 text-sm">Understand how large language models are trained and how they work under the hood.</p>
                <div className="text-blue-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>
            
            {/* LLM Inference */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/llm-inference">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">LLM Inference</h3>
                <p className="text-gray-400 mb-6 text-sm">Learn about the mechanics of generating tokens, from decoding strategies to KV caching.</p>
                <div className="text-purple-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>
            
            {/* Prompt Engineering */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/prompting">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-green-400 transition-colors">Prompt Engineering</h3>
                <p className="text-gray-400 mb-6 text-sm">Master techniques like Few-Shot, Chain of Thought, and ReAct to get better outputs.</p>
                <div className="text-green-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Embeddings */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/embeddings">
                <div className="text-4xl mb-4">🔢</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">Embeddings</h3>
                <p className="text-gray-400 mb-6 text-sm">See how text is converted into high-dimensional vectors to capture semantic meaning.</p>
                <div className="text-indigo-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Fine-tuning */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/genai/fine-tuning">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors">Fine-tuning</h3>
                <p className="text-gray-400 mb-6 text-sm">Explore methods like LoRA and QLoRA for efficiently adapting models to new tasks.</p>
                <div className="text-orange-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Quantization */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/genai/quantization">
                <div className="text-4xl mb-4">🗜️</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-pink-400 transition-colors">Quantization</h3>
                <p className="text-gray-400 mb-6 text-sm">Learn how model weights are compressed from 16-bit to 8-bit or 4-bit to run on local hardware.</p>
                <div className="text-pink-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* PEFT & LoRA */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/genai/peft">
                <div className="text-4xl mb-4">🎛️</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">PEFT & LoRA</h3>
                <p className="text-gray-400 mb-6 text-sm">Fine-tune a 70B model by training 0.1% of it. Work out the parameter and memory savings yourself.</p>
                <div className="text-indigo-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Distillation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/genai/distillation">
                <div className="text-4xl mb-4">🧪</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-teal-400 transition-colors">Distillation</h3>
                <p className="text-gray-400 mb-6 text-sm">Train a small model to imitate a large one, and see what temperature exposes in the teacher's answer.</p>
                <div className="text-teal-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Tokenization */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/genai/tokenization">
                <div className="text-4xl mb-4">🔤</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">Tokenization</h3>
                <p className="text-gray-400 mb-6 text-sm">Train a BPE tokenizer merge by merge, and see why models miscount letters.</p>
                <div className="text-purple-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Efficient Inference */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-colors group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Link to="/efficiency">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-amber-400 transition-colors">Efficient Inference</h3>
                <p className="text-gray-400 mb-6 text-sm">How a 70B model ends up on a laptop. Budget the memory yourself and see which techniques actually stack.</p>
                <div className="text-amber-400 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Explore <span className="ml-1">→</span>
                </div>
              </Link>
            </motion.div>

          </div>
        </motion.section>
      </motion.div>
    </GuideLayout>
  );
}

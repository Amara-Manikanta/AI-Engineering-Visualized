import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import VariantNotes from '../components/VariantNotes';
import { VARIANT_TOC, CRAG } from '../data/ragVariants';

export default function RagCrag() {
  const toc = VARIANT_TOC;
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timeout;
    if (isPlaying && step < 5) {
      timeout = setTimeout(() => setStep(s => s + 1), 2000);
    } else if (step >= 5) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, step]);

  const handlePlay = () => {
    if (step >= 5) setStep(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  return (
    <GuideLayout
      title="Corrective RAG (CRAG)"
      intro="Evaluates its own retrieval. If the DB lacks the answer, it triggers a web search fallback."
      toc={toc}
    >
      <div className="space-y-12">
        <section id="anim" >
          {/* Detailed visual pipeline canvas exactly as it was in the HTML */}
          <div className="relative h-[450px] bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden mb-6">
            
            <motion.div 
              className="absolute left-[5%] top-[50%] -translate-y-[50%] w-[60px] p-2.5 bg-indigo-600 text-white text-center rounded-lg"
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Query
            </motion.div>
            
            <motion.div 
              className="absolute left-[16%] top-[50%] -translate-y-[50%]"
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              className="absolute left-[20%] top-[50%] -translate-y-[50%] w-[80px] p-2.5 bg-cyan-600 text-white text-center rounded-lg"
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Vector DB
            </motion.div>
            
            <motion.div 
              className="absolute left-[33%] top-[50%] -translate-y-[50%]"
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              className="absolute left-[37%] top-[50%] -translate-y-[50%] w-[100px] p-2.5 bg-orange-500 text-white text-center rounded-lg"
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Evaluator<br/><span className="text-[0.7em]">Relevant?</span>
            </motion.div>
            
            <motion.div 
              className="absolute left-[52%] top-[35%] -rotate-[30deg] text-red-500 font-bold"
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              ➔ No
            </motion.div>

            <motion.div 
              className="absolute left-[52%] top-[65%] rotate-[30deg] text-emerald-500 font-bold"
              animate={{ opacity: 0 }} /* Hidden in this specific path */
              transition={{ duration: 0.5 }}
            >
              ➔ Yes
            </motion.div>
            
            <motion.div 
              className="absolute left-[65%] top-[20%] w-[100px] p-2.5 bg-blue-600 text-white text-center rounded-lg"
              animate={{ opacity: step >= 4 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Web Search<br/><span className="text-[0.7em]">Tavily / Google</span>
            </motion.div>
            
            <motion.div 
              className="absolute left-[80%] top-[35%] rotate-[30deg]"
              animate={{ opacity: step >= 5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              className="absolute left-[85%] top-[50%] -translate-y-[50%] w-[60px] p-2.5 bg-emerald-600 text-white text-center rounded-lg"
              animate={{ opacity: step >= 5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              LLM
            </motion.div>

            <motion.div 
              className="absolute bottom-5 left-5 right-5 text-center text-gray-400 text-[0.95em] h-[40px]"
              animate={{ opacity: 1 }}
            >
              {step === 0 && "Click Play to see CRAG evaluating its own data."}
              {step === 1 && "1. Standard vector retrieval occurs."}
              {step === 2 && "2. An Evaluator model scores the retrieved documents. Are they relevant?"}
              {step === 3 && "3. Result: Red (Not relevant). The internal database does not have the answer."}
              {step === 4 && "4. CORRECTIVE ACTION: The system triggers an external Web Search to find the missing facts."}
              {step >= 5 && "5. The web results are used to generate the final accurate answer."}
            </motion.div>
          </div>
          
          <div className="flex justify-center gap-3">
            <button 
              onClick={handlePlay}
              className="px-6 py-2.5 rounded-full font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {step >= 5 ? '▶ Replay' : '▶ Play Animation'}
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full font-semibold bg-transparent border border-gray-700 text-gray-300 hover:bg-white/5"
            >
              ↺ Reset
            </button>
          </div>
        </section>
      </div>
      <VariantNotes {...CRAG} />
    </GuideLayout>
  );
}

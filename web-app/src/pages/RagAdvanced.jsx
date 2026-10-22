import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import VariantNotes from "../components/VariantNotes";
import { VARIANT_TOC, ADVANCED } from "../data/ragVariants";

export default function RagAdvanced() {
  const toc = VARIANT_TOC;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { show: [], desc: "Click Play to see Advanced RAG optimization." },
    { show: ["a-q"], desc: "1. A vague user query arrives." },
    { show: ["a-q", "a-arr1", "a-rewrite"], desc: "2. Pre-retrieval: An LLM rewrites the query to be highly specific." },
    { show: ["a-q", "a-arr1", "a-rewrite", "a-arr2", "a-vdb"], desc: "3. The DB searches for the optimal query, pulling a large net of 100 documents." },
    { show: ["a-q", "a-arr1", "a-rewrite", "a-arr2", "a-vdb", "a-arr3", "a-rerank"], desc: "4. Post-retrieval: A Cross-Encoder heavily scrutinizes and scores all 100 documents." },
    { show: ["a-q", "a-arr1", "a-rewrite", "a-arr2", "a-vdb", "a-arr3", "a-rerank", "a-arr4", "a-top3"], desc: "5. Only the absolute Top 3 most relevant documents survive the filter." },
    { show: ["a-q", "a-arr1", "a-rewrite", "a-arr2", "a-vdb", "a-arr3", "a-rerank", "a-arr4", "a-top3", "a-arr5", "a-llm"], desc: "6. The highly precise context is sent to the LLM for generation." }
  ];

  useEffect(() => {
    let timeout;
    if (playing && step < steps.length - 1) {
      timeout = setTimeout(() => {
        setStep((s) => s + 1);
      }, 1800);
    } else if (step === steps.length - 1) {
      setPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [playing, step, steps.length]);

  const handlePlay = () => {
    if (playing) return;
    if (step >= steps.length - 1) {
      setStep(0);
      setTimeout(() => {
        setStep(1);
        setPlaying(true);
      }, 300);
    } else {
      if (step === 0) setStep(1);
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setPlaying(false);
    setStep(0);
  };

  const isVisible = (id) => steps[step].show.includes(id);

  return (
    <GuideLayout
      title="Advanced RAG"
      intro="Fixes Naive RAG by optimizing the query before search, and re-ranking the results after search."
      toc={toc}
    >
      <motion.section id="anim" className="guide-section">
        <div 
          className="pipeline-canvas adv-canvas" 
          style={{ position: "relative", height: "500px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}
        >
            
            {/* Nodes */}
            <motion.div 
              id="a-q" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-q") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)", width: "100px", padding: "10px", background: "var(--surface)", border: "2px solid var(--primary)", textAlign: "center", borderRadius: "8px" }}
            >
              Bad Query
            </motion.div>
            
            <motion.div 
              id="a-arr1" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-arr1") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "21%", top: "50%", transform: "translateY(-50%)" }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="a-rewrite" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-rewrite") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "25%", top: "50%", transform: "translateY(-50%)", width: "120px", padding: "10px", background: "var(--purple)", color: "white", textAlign: "center", borderRadius: "8px" }}
            >
              LLM<br/><span style={{ fontSize: "0.7em" }}>Query Rewrite</span>
            </motion.div>
            
            <motion.div 
              id="a-arr2" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-arr2") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "44%", top: "50%", transform: "translateY(-50%)" }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="a-vdb" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-vdb") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "48%", top: "20%", width: "120px", padding: "10px", background: "var(--cyan)", color: "white", textAlign: "center", borderRadius: "8px" }}
            >
              Vector DB<br/><span style={{ fontSize: "0.7em" }}>Retrieve Top 100</span>
            </motion.div>
            
            <motion.div 
              id="a-arr3" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-arr3") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "53%", top: "35%", transform: "rotate(90deg)" }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="a-rerank" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-rerank") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "48%", top: "50%", transform: "translateY(-50%)", width: "120px", padding: "10px", background: "var(--orange)", color: "white", textAlign: "center", borderRadius: "8px" }}
            >
              Cross-Encoder<br/><span style={{ fontSize: "0.7em" }}>Re-ranker</span>
            </motion.div>
            
            <motion.div 
              id="a-arr4" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-arr4") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "67%", top: "50%", transform: "translateY(-50%)" }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="a-top3" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-top3") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "71%", top: "50%", transform: "translateY(-50%)", width: "100px", padding: "10px", background: "var(--surface)", border: "2px dashed var(--orange)", textAlign: "center", borderRadius: "8px" }}
            >
              Top 3<br/><span style={{ fontSize: "0.7em" }}>Filtered</span>
            </motion.div>
            
            <motion.div 
              id="a-arr5" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-arr5") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "87%", top: "50%", transform: "translateY(-50%)" }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="a-llm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible("a-llm") ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", left: "91%", top: "50%", transform: "translateY(-50%)", width: "70px", padding: "10px", background: "var(--green)", color: "white", textAlign: "center", borderRadius: "8px" }}
            >
              LLM
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                id="a-desc"
                style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px", textAlign: "center", color: "var(--text2)", fontSize: "0.95em", height: "40px" }}
              >
                {steps[step].desc}
              </motion.div>
            </AnimatePresence>
        </div>
        
        <div className="canvas-controls" style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button 
            className="btn btn-primary" 
            id="a-play" 
            onClick={handlePlay}
            style={{ padding: "10px 24px", borderRadius: "24px", border: "none", cursor: "pointer", fontWeight: "600", background: "var(--primary)", color: "white" }}
          >
            {playing ? "Playing..." : step >= steps.length - 1 ? "▶ Replay" : "▶ Play Animation"}
          </button>
          <button 
            className="btn btn-secondary" 
            id="a-reset" 
            onClick={handleReset}
            style={{ padding: "10px 24px", borderRadius: "24px", border: "1px solid var(--border)", cursor: "pointer", fontWeight: "600", background: "var(--surface)", color: "var(--text)" }}
          >
            ↺ Reset
          </button>
        </div>
      </motion.section>
      <VariantNotes {...ADVANCED} />
    </GuideLayout>
  );
}

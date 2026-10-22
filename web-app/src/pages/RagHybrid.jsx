import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

export default function RagHybrid() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const toc = [];

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    let currentStep = step >= 5 ? 0 : step;
    
    const interval = setInterval(() => {
      currentStep++;
      setStep(currentStep);
      if (currentStep >= 5) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 1800);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <GuideLayout
      title="Hybrid RAG"
      intro="Combines semantic Vector search with exact keyword BM25 search to get the best of both worlds."
      toc={toc}
    >
      <div className="guide-header">
        <span className="guide-tag">Architecture Type</span>
        <h1 className="guide-title">Hybrid RAG</h1>
        <p className="guide-intro">Combines semantic Vector search with exact keyword BM25 search to get the best of both worlds.</p>
      </div>
      
      <section className="guide-section">
        <div className="pipeline-canvas" style={{position: 'relative', height: '450px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px'}}>
            
            <motion.div id="h-q" style={{position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)', width: '100px', padding: '10px', background: 'var(--surface)', border: '2px solid var(--primary)', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 1 ? 1 : 0 }}>Query<br/><span style={{fontSize: '0.7em'}}>"UUID-54A error"</span></motion.div>
            
            <motion.div id="h-arr-up" style={{position: 'absolute', left: '21%', top: '35%', transform: 'rotate(-30deg)', transition: 'all 0.5s'}} animate={{ opacity: step >= 2 ? 1 : 0 }}>➔</motion.div>
            <motion.div id="h-arr-dn" style={{position: 'absolute', left: '21%', top: '65%', transform: 'rotate(30deg)', transition: 'all 0.5s'}} animate={{ opacity: step >= 2 ? 1 : 0 }}>➔</motion.div>
            
            <motion.div id="h-bm25" style={{position: 'absolute', left: '25%', top: '20%', width: '120px', padding: '10px', background: 'var(--blue)', color: 'white', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 2 ? 1 : 0 }}>BM25<br/><span style={{fontSize: '0.7em'}}>Keyword Match</span></motion.div>
            
            <motion.div id="h-vdb" style={{position: 'absolute', left: '25%', top: '70%', width: '120px', padding: '10px', background: 'var(--cyan)', color: 'white', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 2 ? 1 : 0 }}>Vector DB<br/><span style={{fontSize: '0.7em'}}>Semantic Match</span></motion.div>
            
            <motion.div id="h-res1" style={{position: 'absolute', left: '48%', top: '20%', width: '80px', padding: '8px', border: '1px solid var(--blue)', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 3 ? 1 : 0 }}>Results A</motion.div>
            <motion.div id="h-res2" style={{position: 'absolute', left: '48%', top: '70%', width: '80px', padding: '8px', border: '1px solid var(--cyan)', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 3 ? 1 : 0 }}>Results B</motion.div>
            
            <motion.div id="h-arr-f1" style={{position: 'absolute', left: '62%', top: '35%', transform: 'rotate(30deg)', transition: 'all 0.5s'}} animate={{ opacity: step >= 4 ? 1 : 0 }}>➔</motion.div>
            <motion.div id="h-arr-f2" style={{position: 'absolute', left: '62%', top: '65%', transform: 'rotate(-30deg)', transition: 'all 0.5s'}} animate={{ opacity: step >= 4 ? 1 : 0 }}>➔</motion.div>
            
            <motion.div id="h-rrf" style={{position: 'absolute', left: '65%', top: '50%', transform: 'translateY(-50%)', width: '120px', padding: '10px', background: 'var(--purple)', color: 'white', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 4 ? 1 : 0 }}>RRF<br/><span style={{fontSize: '0.7em'}}>Reciprocal Rank Fusion</span></motion.div>
            
            <motion.div id="h-arr-final" style={{position: 'absolute', left: '84%', top: '50%', transform: 'translateY(-50%)', transition: 'all 0.5s'}} animate={{ opacity: step >= 5 ? 1 : 0 }}>➔</motion.div>
            
            <motion.div id="h-llm" style={{position: 'absolute', left: '88%', top: '50%', transform: 'translateY(-50%)', width: '60px', padding: '10px', background: 'var(--green)', color: 'white', textAlign: 'center', borderRadius: '8px', transition: 'all 0.5s'}} animate={{ opacity: step >= 5 ? 1 : 0 }}>LLM</motion.div>

            <div id="h-desc" style={{position: 'absolute', bottom: '20px', left: '20px', right: '20px', textAlign: 'center', color: 'var(--text2)', fontSize: '0.95em', height: '40px', transition: 'opacity 0.3s ease', opacity: 1}}>
              {step === 0 && "Click Play to see Hybrid Search in action."}
              {step === 1 && "1. User asks a query containing a specific exact ID or code."}
              {step === 2 && "2. The query is sent to BOTH a Keyword index (BM25) and a Semantic Vector index."}
              {step === 3 && "3. BM25 finds the exact ID. Vector DB finds documents with similar meanings."}
              {step === 4 && "4. Reciprocal Rank Fusion combines both lists into a single ranked list."}
              {step >= 5 && "5. The perfectly balanced context is sent to the LLM."}
            </div>
        </div>
        
        <div className="canvas-controls" style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
          <button className="btn btn-primary" id="h-play" style={{padding: '10px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--primary)', color: 'white'}} onClick={handlePlay} disabled={isPlaying}>
            {step >= 5 ? '▶ Replay' : '▶ Play Animation'}
          </button>
          <button className="btn btn-secondary" id="h-reset" style={{padding: '10px 24px', borderRadius: '24px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, background: 'var(--surface)', color: 'var(--text)'}} onClick={handleReset}>
            ↺ Reset
          </button>
        </div>
      </section>
    </GuideLayout>
  );
}

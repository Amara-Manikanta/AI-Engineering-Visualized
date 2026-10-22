import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

export default function RagGraph() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const toc = [];

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    let currentStep = step >= 4 ? 0 : step;
    
    const interval = setInterval(() => {
      currentStep++;
      setStep(currentStep);
      if (currentStep >= 4) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 2000);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <GuideLayout
      title="Graph RAG"
      intro="Retrieves connected entities (nodes and edges) from a Knowledge Graph rather than disjointed chunks."
      toc={toc}
    >
      <div className="space-y-12">
        <div className="guide-header">
          <span className="guide-tag">Architecture Type</span>
          <h1 className="guide-title">Graph RAG</h1>
          <p className="guide-intro">Retrieves connected entities (nodes and edges) from a Knowledge Graph rather than disjointed chunks.</p>
        </div>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="guide-section px-5">
          <div className="pipeline-canvas" style={{position:'relative', height:'450px', background:'var(--surface, #111)', border:'1px solid var(--border, #333)', borderRadius:'16px', overflow:'hidden', marginBottom:'24px'}}>
            
            <motion.div 
              id="g-node1"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'20%', top:'30%', width:'80px', height:'80px', borderRadius:'50%', background:'var(--blue, #3b82f6)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.8em', textAlign:'center'}}
            >
              Company X
            </motion.div>
            
            <motion.div 
              id="g-node2"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'50%', top:'30%', width:'80px', height:'80px', borderRadius:'50%', background:'var(--purple, #a855f7)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.8em', textAlign:'center'}}
            >
              Holding Corp
            </motion.div>
            
            <motion.div 
              id="g-node3"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'80%', top:'50%', width:'80px', height:'80px', borderRadius:'50%', background:'var(--cyan, #06b6d4)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.8em', textAlign:'center'}}
            >
              Person Y
            </motion.div>
            
            <motion.div 
              id="g-edge1"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'35%', top:'38%', width:'15%', height:'2px', background:'var(--text, #d1d5db)'}}
            />
            
            <motion.div 
              id="g-label1"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'38%', top:'33%', fontSize:'0.7em', color:'var(--text, #d1d5db)'}}
            >
              [Owned By]
            </motion.div>
            
            <motion.div 
              id="g-edge2"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'65%', top:'45%', width:'15%', height:'2px', background:'var(--text, #d1d5db)', transform:'rotate(20deg)'}}
            />
            
            <motion.div 
              id="g-label2"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'68%', top:'47%', fontSize:'0.7em', color:'var(--text, #d1d5db)'}}
            >
              [Owned By]
            </motion.div>
            
            <motion.div 
              id="g-ans"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 4 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{position:'absolute', left:'50%', top:'80%', transform:'translateX(-50%)', padding:'10px 20px', background:'var(--green, #10b981)', color:'white', borderRadius:'8px', fontWeight:'bold'}}
            >
              LLM: "Person Y owns Company X"
            </motion.div>

            <div id="g-desc" style={{position:'absolute', bottom:'20px', left:'20px', right:'20px', textAlign:'center', color:'var(--text2, #9ca3af)', fontSize:'0.95em', height:'40px', transition:'opacity 0.3s ease'}}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {step === 0 && "Click Play to traverse the Knowledge Graph."}
                  {step === 1 && '1. Query: "Who ultimately owns Company X?" Node identified.'}
                  {step === 2 && '2. The Graph DB traverses the relationship to find it is owned by Holding Corp.'}
                  {step === 3 && '3. Traversing further, it finds Holding Corp is owned by Person Y.'}
                  {step >= 4 && '4. The LLM connects the dots across multiple documents to answer the question perfectly.'}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          <div className="canvas-controls" style={{display:'flex', gap:'12px', justifyContent:'center'}}>
            <button 
              className="btn btn-primary" 
              id="g-play" 
              onClick={handlePlay}
              disabled={isPlaying}
              style={{padding:'10px 24px', borderRadius:'24px', border:'none', cursor:'pointer', fontWeight:600, background:'var(--primary, #6366f1)', color:'white', opacity: isPlaying ? 0.5 : 1}}
            >
              {step >= 4 ? '▶ Replay' : '▶ Play Animation'}
            </button>
            <button 
              className="btn btn-secondary" 
              id="g-reset" 
              onClick={handleReset}
              style={{padding:'10px 24px', borderRadius:'24px', border:'1px solid var(--border, #333)', cursor:'pointer', fontWeight:600, background:'var(--surface, #222)', color:'var(--text, #d1d5db)'}}
            >
              ↺ Reset
            </button>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

export default function RagAgentic() {
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
    }, 2200);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <GuideLayout
      title="Agentic RAG"
      intro="An autonomous LLM agent uses Vector Search as a Tool, deciding when and how to search iteratively."
      toc={toc}
    >
      <div className="guide-header">
        <span className="guide-tag">Architecture Type</span>
        <h1 className="guide-title">Agentic RAG</h1>
        <p className="guide-intro">An autonomous LLM agent uses Vector Search as a Tool, deciding when and how to search iteratively.</p>
      </div>
      
      <section className="guide-section">
        <div className="pipeline-canvas" style={{ position: 'relative', height: '500px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            
            <motion.div id="ag-q" style={{ position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)', width: '60px', padding: '10px', background: 'var(--surface)', border: '2px solid var(--primary)', textAlign: 'center', borderRadius: '8px', zIndex: 2 }}
                initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>Task</motion.div>
            
            <motion.div id="ag-arr1" style={{ position: 'absolute', left: '16%', top: '50%', transform: 'translateY(-50%)' }}
                initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>➔</motion.div>
            
            <motion.div id="ag-agent" style={{ position: 'absolute', left: '20%', top: '50%', width: '100px', padding: '20px 10px', background: 'var(--purple)', color: 'white', textAlign: 'center', borderRadius: '50%', fontWeight: 'bold', zIndex: 2 }}
                initial={{ opacity: 0, y: '-50%', scale: 1 }} 
                animate={{ 
                    opacity: step >= 1 ? 1 : 0,
                    y: '-50%',
                    scale: step === 4 ? [1, 1.1, 1] : 1
                }} 
                transition={step === 4 ? { duration: 0.4 } : { duration: 0.5 }}>AGENT</motion.div>
            
            <motion.div id="ag-loop-up" style={{ position: 'absolute', left: '25%', top: '15%', width: '40%', height: '100px', borderTop: '2px dashed var(--purple)', borderRight: '2px dashed var(--purple)', borderTopRightRadius: '20px', zIndex: 1 }}
                initial={{ opacity: 0 }} animate={{ opacity: (step === 2 || step === 4) ? 1 : 0 }} transition={{ duration: 0.5 }}></motion.div>
            
            <motion.div id="ag-loop-dn" style={{ position: 'absolute', left: '25%', top: '65%', width: '40%', height: '100px', borderBottom: '2px dashed var(--purple)', borderRight: '2px dashed var(--purple)', borderBottomRightRadius: '20px', zIndex: 1 }}
                initial={{ opacity: 0 }} animate={{ opacity: (step === 3 || step === 4) ? 1 : 0 }} transition={{ duration: 0.5 }}></motion.div>
            
            <motion.div id="ag-tool" style={{ position: 'absolute', left: '60%', top: '50%', transform: 'translateY(-50%)', width: '100px', padding: '10px', background: 'var(--cyan)', color: 'white', textAlign: 'center', borderRadius: '8px', zIndex: 2 }}
                initial={{ opacity: 0 }} animate={{ opacity: (step >= 2 && step <= 4) ? 1 : 0 }} transition={{ duration: 0.5 }}>Vector DB<br/><span style={{ fontSize: '0.7em' }}>Tool Call</span></motion.div>
            
            <motion.div id="ag-eval" style={{ position: 'absolute', left: '40%', top: '30%', padding: '5px', background: 'var(--orange)', color: 'white', fontSize: '0.8em', borderRadius: '4px', zIndex: 3 }}
                initial={{ opacity: 0 }} animate={{ opacity: (step === 2 || step === 4) ? 1 : 0 }} transition={{ duration: 0.5 }}>
                {step === 4 ? '3. "Still need X"' : '1. "I need more info"'}
            </motion.div>
            
            <motion.div id="ag-result" style={{ position: 'absolute', left: '40%', top: '60%', padding: '5px', background: 'var(--green)', color: 'white', fontSize: '0.8em', borderRadius: '4px', zIndex: 3 }}
                initial={{ opacity: 0 }} animate={{ opacity: (step === 3 || step === 4) ? 1 : 0 }} transition={{ duration: 0.5 }}>
                {step === 4 ? '4. Returns X' : '2. Returns Context'}
            </motion.div>
            
            <motion.div id="ag-arr-fin" style={{ position: 'absolute', left: '33%', top: '50%', transform: 'translateY(-50%)' }}
                initial={{ opacity: 0 }} animate={{ opacity: step >= 5 ? 1 : 0 }} transition={{ duration: 0.5 }}>➔</motion.div>
            
            <motion.div id="ag-final" style={{ position: 'absolute', left: '38%', top: '50%', transform: 'translateY(-50%)', width: '80px', padding: '10px', background: 'var(--green)', color: 'white', textAlign: 'center', borderRadius: '8px' }}
                initial={{ opacity: 0 }} animate={{ opacity: step >= 5 ? 1 : 0 }} transition={{ duration: 0.5 }}>Final Answer</motion.div>

            <motion.div id="ag-desc" style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', textAlign: 'center', color: 'var(--text2)', fontSize: '0.95em', height: '40px' }}
                initial={{ opacity: 1 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {step === 0 && "Click Play to watch the Agent loop."}
                {step === 1 && "1. A complex task is given to the Agent."}
                {step === 2 && "2. The Agent reasons it lacks info, and calls the Vector DB tool."}
                {step === 3 && "3. The DB returns context. The Agent reads it and evaluates if it is enough."}
                {step === 4 && "4. (Looping) The Agent realizes it needs one more piece of data, and calls the tool again."}
                {step >= 5 && "5. Having collected all necessary context over multiple loops, it generates the Final Answer."}
            </motion.div>
        </div>
        
        <div className="canvas-controls" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary" id="ag-play" style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--primary)', color: 'white' }} onClick={handlePlay}>
            {step >= 5 ? '▶ Replay' : '▶ Play Animation'}
          </button>
          <button className="btn btn-secondary" id="ag-reset" style={{ padding: '10px 24px', borderRadius: '24px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600, background: 'var(--surface)', color: 'var(--text)' }} onClick={handleReset}>
            ↺ Reset
          </button>
        </div>
      </section>
    </GuideLayout>
  );
}

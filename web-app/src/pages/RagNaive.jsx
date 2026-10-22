import React, { useState, useEffect } from 'react';
import GuideLayout from '../components/GuideLayout';
import VariantNotes from '../components/VariantNotes';
import { VARIANT_TOC, NAIVE } from '../data/ragVariants';
import { motion, AnimatePresence } from 'framer-motion';

const toc = VARIANT_TOC;

const RagNaive = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { show: ['n-query'], desc: '1. The user asks a question.' },
    { show: ['n-arrow1', 'n-embed'], desc: '2. The text is passed to an Embedding Model.' },
    { show: ['n-arrow2', 'n-vdb'], desc: '3. A similarity search is run against the Vector Database.' },
    { show: ['n-arrow3', 'n-prompt'], desc: '4. The top results (context) are injected into the Prompt.' },
    { show: ['n-arrow4', 'n-llm'], desc: '5. The LLM generates an answer grounded in the context.' }
  ];

  useEffect(() => {
    let timeout;
    if (playing && step < steps.length) {
      timeout = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 1500);
    } else if (step >= steps.length) {
      setPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [playing, step, steps.length]);

  const handlePlay = () => {
    if (playing) return;
    if (step >= steps.length) {
      setStep(0);
    }
    setPlaying(true);
    setStep(1);
  };

  const handleReset = () => {
    setPlaying(false);
    setStep(0);
  };

  const visibleNodes = steps.slice(0, step).flatMap(s => s.show);
  const currentDesc = step > 0 && step <= steps.length ? steps[step - 1].desc : 'Click Play to see the Naive RAG pipeline in action.';

  return (
    <GuideLayout
      title="Naive RAG"
      intro="The baseline Retrieve-Read-Generate loop. Simple, but prone to failure on complex queries."
      toc={toc}
    >
      <section id="anim" className="guide-section">
        <div 
          className="pipeline-canvas naive-canvas" 
          style={{ position: 'relative', height: '450px', background: 'var(--surface, #111)', border: '1px solid var(--border, #333)', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}
        >
          
          <motion.div 
            className="n-node" 
            id="n-query" 
            initial={{ opacity: 0, scale: 0.8, y: '-50%' }}
            animate={{ 
              opacity: visibleNodes.includes('n-query') ? 1 : 0, 
              scale: visibleNodes.includes('n-query') ? 1 : 0.8,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '5%', top: '50%', width: '120px', textAlign: 'center', padding: '12px', background: 'var(--primary, #2563eb)', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            User Query
          </motion.div>
          
          <motion.div 
            className="n-arrow" 
            id="n-arrow1" 
            initial={{ opacity: 0, y: '-50%', x: -10 }}
            animate={{ 
              opacity: visibleNodes.includes('n-arrow1') ? 1 : 0, 
              x: visibleNodes.includes('n-arrow1') ? 0 : -10,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '23%', top: '50%', color: 'var(--text, #d1d5db)', fontWeight: 'bold' }}
          >
            ➔
          </motion.div>
          
          <motion.div 
            className="n-node" 
            id="n-embed" 
            initial={{ opacity: 0, scale: 0.8, y: '-50%' }}
            animate={{ 
              opacity: visibleNodes.includes('n-embed') ? 1 : 0, 
              scale: visibleNodes.includes('n-embed') ? 1 : 0.8,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '30%', top: '50%', width: '120px', textAlign: 'center', padding: '12px', background: 'var(--purple, #9333ea)', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            Embed Model
          </motion.div>
          
          <motion.div 
            className="n-arrow" 
            id="n-arrow2" 
            initial={{ opacity: 0, y: '-50%', x: -10 }}
            animate={{ 
              opacity: visibleNodes.includes('n-arrow2') ? 1 : 0, 
              x: visibleNodes.includes('n-arrow2') ? 0 : -10,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '48%', top: '50%', color: 'var(--text, #d1d5db)', fontWeight: 'bold' }}
          >
            ➔
          </motion.div>
          
          <motion.div 
            className="n-node" 
            id="n-vdb" 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: visibleNodes.includes('n-vdb') ? 1 : 0, 
              scale: visibleNodes.includes('n-vdb') ? 1 : 0.8,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '55%', top: '20%', width: '120px', textAlign: 'center', padding: '12px', background: 'var(--cyan, #0891b2)', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            Vector DB<br/><span style={{ fontSize: '0.7em', fontWeight: '400' }}>Top-K Search</span>
          </motion.div>
          
          <motion.div 
            className="n-arrow" 
            id="n-arrow3" 
            initial={{ opacity: 0, y: -10, rotate: 90 }}
            animate={{ 
              opacity: visibleNodes.includes('n-arrow3') ? 1 : 0, 
              y: visibleNodes.includes('n-arrow3') ? 0 : -10,
              rotate: 90 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '62%', top: '38%', color: 'var(--text, #d1d5db)', fontWeight: 'bold' }}
          >
            ➔
          </motion.div>
          
          <motion.div 
            className="n-node" 
            id="n-prompt" 
            initial={{ opacity: 0, scale: 0.8, y: '-50%' }}
            animate={{ 
              opacity: visibleNodes.includes('n-prompt') ? 1 : 0, 
              scale: visibleNodes.includes('n-prompt') ? 1 : 0.8,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '55%', top: '50%', width: '120px', textAlign: 'center', padding: '12px', background: 'var(--orange, #ea580c)', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            Prompt Builder<br/><span style={{ fontSize: '0.7em', fontWeight: '400' }}>Context + Query</span>
          </motion.div>
          
          <motion.div 
            className="n-arrow" 
            id="n-arrow4" 
            initial={{ opacity: 0, y: '-50%', x: -10 }}
            animate={{ 
              opacity: visibleNodes.includes('n-arrow4') ? 1 : 0, 
              x: visibleNodes.includes('n-arrow4') ? 0 : -10,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '73%', top: '50%', color: 'var(--text, #d1d5db)', fontWeight: 'bold' }}
          >
            ➔
          </motion.div>
          
          <motion.div 
            className="n-node" 
            id="n-llm" 
            initial={{ opacity: 0, scale: 0.8, y: '-50%' }}
            animate={{ 
              opacity: visibleNodes.includes('n-llm') ? 1 : 0, 
              scale: visibleNodes.includes('n-llm') ? 1 : 0.8,
              y: '-50%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '80%', top: '50%', width: '120px', textAlign: 'center', padding: '12px', background: 'var(--green, #16a34a)', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            LLM<br/><span style={{ fontSize: '0.7em', fontWeight: '400' }}>Generation</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              id="n-desc"
              key={currentDesc}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', textAlign: 'center', color: 'var(--text2, #9ca3af)', fontSize: '0.95em', height: '40px' }}
            >
              {currentDesc}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="canvas-controls" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary" 
            id="n-play" 
            onClick={handlePlay}
            style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: '600', background: 'var(--primary, #2563eb)', color: 'white' }}
          >
            {step >= steps.length ? '▶ Replay' : '▶ Play Animation'}
          </button>
          <button 
            className="btn btn-secondary" 
            id="n-reset" 
            onClick={handleReset}
            style={{ padding: '10px 24px', borderRadius: '24px', border: '1px solid var(--border, #333)', cursor: 'pointer', fontWeight: '600', background: 'var(--surface, #111)', color: 'var(--text, #d1d5db)' }}
          >
            ↺ Reset
          </button>
        </div>
      </section>
      <VariantNotes {...NAIVE} />
    </GuideLayout>
  );
};

export default RagNaive;

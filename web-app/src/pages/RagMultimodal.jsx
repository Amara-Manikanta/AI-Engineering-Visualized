import React, { useState, useEffect } from 'react';
import GuideLayout from '../components/GuideLayout';
import VariantNotes from '../components/VariantNotes';
import { VARIANT_TOC, MULTIMODAL } from '../data/ragVariants';
import { motion, AnimatePresence } from 'framer-motion';

const toc = VARIANT_TOC;

const RagMultimodal = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { show: ['m-img', 'm-txt'], desc: '1. User uploads a photo of a part and asks "How do I fix this?"' },
    { show: ['m-arr1', 'm-arr2', 'm-clip'], desc: '2. A multimodal embedder (like CLIP) embeds both into the same vector space.' },
    { show: ['m-arr3', 'm-db'], desc: '3. DB searches for similar images (diagrams) AND matching text (manuals).' },
    { show: ['m-arr4', 'm-vlm'], desc: '4. The retrieved diagrams and text are fed into a Vision-Language Model to generate the answer.' }
  ];

  useEffect(() => {
    let timeout;
    if (playing && step < steps.length) {
      timeout = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 2200);
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
  const currentDesc = step > 0 && step <= steps.length ? steps[step - 1].desc : 'Click Play to see Multi-modal retrieval.';

  return (
    <GuideLayout
      title="Multi-modal RAG"
      intro="Retrieves images, video frames, and text simultaneously into a Vision-Language Model."
      toc={toc}
    >
      <section id="anim" className="guide-section">
        <div className="pipeline-canvas" style={{position: 'relative', height: '450px', background: 'var(--surface, #111)', border: '1px solid var(--border, #333)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px'}}>
            
            <motion.div id="m-img" style={{position: 'absolute', left: '5%', top: '30%', padding: '10px', border: '2px dashed var(--text2, gray)', textAlign: 'center', borderRadius: '8px'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-img') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              🖼️<br/><span style={{fontSize: '0.7em'}}>Image Upload</span>
            </motion.div>
            <motion.div id="m-txt" style={{position: 'absolute', left: '5%', top: '60%', padding: '10px', border: '2px solid var(--text2, gray)', textAlign: 'center', borderRadius: '8px'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-txt') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              📝<br/><span style={{fontSize: '0.7em'}}>Text Query</span>
            </motion.div>
            
            <motion.div id="m-arr1" style={{position: 'absolute', left: '18%', top: '45%', transform: 'rotate(15deg)'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-arr1') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >➔</motion.div>
            <motion.div id="m-arr2" style={{position: 'absolute', left: '18%', top: '55%', transform: 'rotate(-15deg)'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-arr2') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >➔</motion.div>
            
            <motion.div id="m-clip" style={{position: 'absolute', left: '25%', top: '50%', transform: 'translateY(-50%)', width: '100px', padding: '10px', background: 'var(--cyan, #06b6d4)', color: 'white', textAlign: 'center', borderRadius: '8px'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-clip') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              CLIP Embedder<br/><span style={{fontSize: '0.7em'}}>Shared Space</span>
            </motion.div>
            
            <motion.div id="m-arr3" style={{position: 'absolute', left: '42%', top: '50%', transform: 'translateY(-50%)'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-arr3') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >➔</motion.div>
            
            <motion.div id="m-db" style={{position: 'absolute', left: '48%', top: '50%', transform: 'translateY(-50%)', width: '100px', padding: '10px', background: 'var(--blue, #2563eb)', color: 'white', textAlign: 'center', borderRadius: '8px'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-db') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Vector DB<br/><span style={{fontSize: '0.7em'}}>Find Images & Text</span>
            </motion.div>
            
            <motion.div id="m-arr4" style={{position: 'absolute', left: '65%', top: '50%', transform: 'translateY(-50%)'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-arr4') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >➔</motion.div>
            
            <motion.div id="m-vlm" style={{position: 'absolute', left: '75%', top: '50%', transform: 'translateY(-50%)', width: '80px', padding: '10px', background: 'var(--purple, #9333ea)', color: 'white', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('m-vlm') ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              VLM<br/><span style={{fontSize: '0.7em'}}>(GPT-4o)</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div id="m-desc" style={{position: 'absolute', bottom: '20px', left: '20px', right: '20px', textAlign: 'center', color: 'var(--text2, #ccc)', fontSize: '0.95em', height: '40px'}}
                key={currentDesc}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentDesc}
              </motion.div>
            </AnimatePresence>
        </div>
        
        <div className="canvas-controls" style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
          <button className="btn btn-primary" id="m-play" onClick={handlePlay} style={{padding: '10px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--primary, #3b82f6)', color: 'white'}}>
            {step >= steps.length ? '▶ Replay' : '▶ Play Animation'}
          </button>
          <button className="btn btn-secondary" id="m-reset" onClick={handleReset} style={{padding: '10px 24px', borderRadius: '24px', border: '1px solid var(--border, #333)', cursor: 'pointer', fontWeight: 600, background: 'var(--surface, #111)', color: 'var(--text, #fff)'}}>
            ↺ Reset
          </button>
        </div>
      </section>
      <VariantNotes {...MULTIMODAL} />
    </GuideLayout>
  );
};

export default RagMultimodal;

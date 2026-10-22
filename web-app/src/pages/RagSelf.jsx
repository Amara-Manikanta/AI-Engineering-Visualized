import React, { useState, useEffect } from 'react';
import GuideLayout from '../components/GuideLayout';
import VariantNotes from '../components/VariantNotes';
import { VARIANT_TOC, SELF } from '../data/ragVariants';
import { motion, AnimatePresence } from 'framer-motion';

const toc = VARIANT_TOC;

const RagSelf = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = [
    { 
      show: ['s-tok1'], 
      desc: '1. The model starts generating, but outputs a [Retrieve=Yes] token, triggering a search.' 
    },
    { 
      show: ['s-tok2'], 
      desc: '2. After reading context, it outputs [Is_Relevant=Yes], confirming the data is useful.' 
    },
    { 
      show: ['s-tok3'], 
      desc: '3. While generating the answer, it outputs [Is_Supported=Fully], confirming no hallucinations.' 
    },
    { 
      show: ['s-arr', 's-ans'], 
      desc: '4. The final, fully-verified answer is delivered.' 
    }
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
  const currentDesc = step > 0 && step <= steps.length 
    ? steps[step - 1].desc 
    : 'Click Play to see Self-RAG generate reflection tokens.';

  return (
    <GuideLayout
      title="Self-RAG"
      intro="The model uses special reflection tokens to critique its own retrieval and generation."
      toc={toc}
    >
      <section id="anim" className="guide-section">
        <div 
          className="pipeline-canvas" 
          style={{ 
            position: 'relative', 
            height: '450px', 
            background: 'var(--surface, #1a1a1a)', 
            border: '1px solid var(--border, #333)', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            marginBottom: '24px' 
          }}
        >
            
            <div 
              id="s-llm" 
              style={{ 
                position: 'absolute', 
                left: '10%', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '100px', 
                padding: '20px 10px', 
                background: 'var(--primary, #3b82f6)', 
                color: 'white', 
                textAlign: 'center', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                opacity: 1, 
                zIndex: 2 
              }}
            >
              Self-RAG LLM
            </div>
            
            <motion.div 
              id="s-tok1" 
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('s-tok1') ? 1 : 0 }} 
              transition={{ duration: 0.5 }} 
              style={{ 
                position: 'absolute', 
                left: '35%', 
                top: '30%', 
                padding: '8px', 
                background: 'var(--surface, #1a1a1a)', 
                border: '2px solid var(--purple, #a855f7)', 
                color: 'var(--purple, #a855f7)', 
                borderRadius: '16px', 
                fontWeight: 'bold', 
                fontSize: '0.8em' 
              }}
            >
              [Retrieve]
            </motion.div>
            
            <motion.div 
              id="s-tok2" 
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('s-tok2') ? 1 : 0 }} 
              transition={{ duration: 0.5 }} 
              style={{ 
                position: 'absolute', 
                left: '50%', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                padding: '8px', 
                background: 'var(--surface, #1a1a1a)', 
                border: '2px solid var(--cyan, #06b6d4)', 
                color: 'var(--cyan, #06b6d4)', 
                borderRadius: '16px', 
                fontWeight: 'bold', 
                fontSize: '0.8em' 
              }}
            >
              [Is_Relevant]
            </motion.div>
            
            <motion.div 
              id="s-tok3" 
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('s-tok3') ? 1 : 0 }} 
              transition={{ duration: 0.5 }} 
              style={{ 
                position: 'absolute', 
                left: '65%', 
                top: '70%', 
                padding: '8px', 
                background: 'var(--surface, #1a1a1a)', 
                border: '2px solid var(--green, #22c55e)', 
                color: 'var(--green, #22c55e)', 
                borderRadius: '16px', 
                fontWeight: 'bold', 
                fontSize: '0.8em' 
              }}
            >
              [Is_Supported]
            </motion.div>
            
            <motion.div 
              id="s-arr" 
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('s-arr') ? 1 : 0 }} 
              transition={{ duration: 0.5 }} 
              style={{ 
                position: 'absolute', 
                left: '80%', 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }}
            >
              ➔
            </motion.div>
            
            <motion.div 
              id="s-ans" 
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleNodes.includes('s-ans') ? 1 : 0 }} 
              transition={{ duration: 0.5 }} 
              style={{ 
                position: 'absolute', 
                left: '85%', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '60px', 
                padding: '10px', 
                background: 'var(--green, #22c55e)', 
                color: 'white', 
                textAlign: 'center', 
                borderRadius: '8px' 
              }}
            >
              Answer
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                id="s-desc"
                key={currentDesc}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  position: 'absolute', 
                  bottom: '20px', 
                  left: '20px', 
                  right: '20px', 
                  textAlign: 'center', 
                  color: 'var(--text2, #a1a1aa)', 
                  fontSize: '0.95em', 
                  height: '40px' 
                }}
              >
                {currentDesc}
              </motion.div>
            </AnimatePresence>
        </div>
        
        <div 
          className="canvas-controls" 
          style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center' 
          }}
        >
          <button 
            className="btn btn-primary" 
            id="s-play" 
            onClick={handlePlay} 
            style={{ 
              padding: '10px 24px', 
              borderRadius: '24px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 600, 
              background: 'var(--primary, #3b82f6)', 
              color: 'white' 
            }}
          >
            {step >= steps.length ? '▶ Replay' : '▶ Play Animation'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            id="s-reset" 
            onClick={handleReset} 
            style={{ 
              padding: '10px 24px', 
              borderRadius: '24px', 
              border: '1px solid var(--border, #333)', 
              cursor: 'pointer', 
              fontWeight: 600, 
              background: 'var(--surface, #1a1a1a)', 
              color: 'var(--text, #e5e5e5)' 
            }}
          >
            ↺ Reset
          </button>
        </div>
      </section>
      <VariantNotes {...SELF} />
    </GuideLayout>
  );
};

export default RagSelf;

// Shared node styles
const styles = {
  query: { type: 'default', bg: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' },
  model: { type: 'default', bg: '#4C1D95', borderColor: '#8B5CF6', color: '#E9D5FF' },
  db: { type: 'db' },
  agent: { type: 'agent' },
  diamond: { type: 'diamond' },
  output: { type: 'circle' }
};

export const naiveRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 100, width: 80, height: 40, ...styles.query },
    { id: 'embed', label: 'Embedding\nModel', x: 150, y: 100, width: 100, height: 50, ...styles.model },
    { id: 'db', label: 'Vector DB', x: 300, y: 100, width: 100, height: 60, ...styles.db, content: 'Dense Results' },
    { id: 'llm', label: 'LLM', x: 450, y: 100, width: 80, height: 50, ...styles.model },
    { id: 'ans', label: 'Answer', x: 580, y: 100, width: 80, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'embed', animated: true, type: 'straight' },
    { source: 'embed', target: 'db', animated: true, type: 'straight' },
    { source: 'db', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const vectorlessRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 100, width: 80, height: 40, ...styles.query, content: 'Keywords' },
    { id: 'search', label: 'Lexical Search', x: 150, y: 100, width: 100, height: 50, bg: '#065F46', borderColor: '#34D399', color: '#A7F3D0' },
    { id: 'db', label: 'Keyword Index\n(e.g. Elasticsearch)', x: 300, y: 100, width: 120, height: 60, ...styles.db, content: 'Sparse Results' },
    { id: 'llm', label: 'LLM', x: 470, y: 100, width: 80, height: 50, ...styles.model },
    { id: 'ans', label: 'Answer', x: 600, y: 100, width: 80, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'search', animated: true, type: 'straight' },
    { source: 'search', target: 'db', animated: true, type: 'straight' },
    { source: 'db', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const vectorVsVectorless = {
  nodes: [
    { id: 'q1', label: 'Vector RAG Query', x: 20, y: 60, width: 120, height: 40, ...styles.query },
    { id: 'e1', label: 'Embedding', x: 180, y: 60, width: 100, height: 40, ...styles.model },
    { id: 'vdb', label: 'Vector DB', x: 320, y: 60, width: 100, height: 40, ...styles.db },
    
    { id: 'q2', label: 'Vectorless Query', x: 20, y: 160, width: 120, height: 40, ...styles.query },
    { id: 'bm25', label: 'BM25 Search', x: 180, y: 160, width: 100, height: 40, bg: '#065F46', borderColor: '#34D399', color: '#A7F3D0' },
    { id: 'sql', label: 'SQL DB', x: 320, y: 160, width: 100, height: 40, ...styles.db },
    
    { id: 'llm', label: 'LLM', x: 470, y: 110, width: 80, height: 60, ...styles.model },
    { id: 'ans', label: 'Answer', x: 600, y: 110, width: 80, height: 60, ...styles.output }
  ],
  edges: [
    { source: 'q1', target: 'e1', animated: true, type: 'straight' },
    { source: 'e1', target: 'vdb', animated: true, type: 'straight' },
    { source: 'vdb', target: 'llm', animated: true, type: 'curved' },
    
    { source: 'q2', target: 'bm25', animated: true, type: 'straight' },
    { source: 'bm25', target: 'sql', animated: true, type: 'straight' },
    { source: 'sql', target: 'llm', animated: true, type: 'curved' },
    
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const hybridRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 120, width: 80, height: 40, ...styles.query },
    
    { id: 'embed', label: 'Embedding', x: 150, y: 50, width: 90, height: 40, ...styles.model },
    { id: 'vdb', label: 'Vector DB', x: 280, y: 50, width: 90, height: 50, ...styles.db, content: 'Dense' },
    
    { id: 'bm25', label: 'BM25 Index', x: 150, y: 190, width: 90, height: 40, bg: '#065F46', borderColor: '#34D399', color: '#A7F3D0' },
    { id: 'sdb', label: 'Sparse DB', x: 280, y: 190, width: 90, height: 50, ...styles.db, content: 'Sparse' },
    
    { id: 'rrf', label: 'Reciprocal\nRank Fusion', x: 420, y: 120, width: 100, height: 50, bg: '#9D174D', borderColor: '#F472B6', color: '#FCE7F3' },
    { id: 'topk', label: 'Top-K', x: 550, y: 120, width: 60, height: 40, ...styles.query },
    { id: 'llm', label: 'LLM', x: 640, y: 120, width: 60, height: 40, ...styles.model },
    { id: 'ans', label: 'Answer', x: 730, y: 120, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'embed', animated: true, type: 'curved' },
    { source: 'q', target: 'bm25', animated: true, type: 'curved' },
    
    { source: 'embed', target: 'vdb', animated: true, type: 'straight' },
    { source: 'bm25', target: 'sdb', animated: true, type: 'straight' },
    
    { source: 'vdb', target: 'rrf', animated: true, type: 'curved' },
    { source: 'sdb', target: 'rrf', animated: true, type: 'curved' },
    
    { source: 'rrf', target: 'topk', animated: true, type: 'straight' },
    { source: 'topk', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const agenticRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 150, width: 80, height: 40, ...styles.query },
    { id: 'planner', label: 'Planner\nAgent', x: 150, y: 150, width: 90, height: 50, ...styles.agent },
    
    { id: 't1', label: 'Vector Search', x: 300, y: 50, width: 100, height: 40, bg: '#0369A1', borderColor: '#38BDF8', color: '#E0F2FE' },
    { id: 't2', label: 'Web Search', x: 300, y: 150, width: 100, height: 40, bg: '#0369A1', borderColor: '#38BDF8', color: '#E0F2FE' },
    { id: 't3', label: 'SQL Tool', x: 300, y: 250, width: 100, height: 40, bg: '#0369A1', borderColor: '#38BDF8', color: '#E0F2FE' },
    
    { id: 'reasoner', label: 'Reasoner\nAgent', x: 450, y: 150, width: 90, height: 50, ...styles.agent },
    { id: 'ans', label: 'Answer', x: 600, y: 150, width: 80, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'planner', animated: true, type: 'straight' },
    { source: 'planner', target: 't1', animated: true, type: 'curved' },
    { source: 'planner', target: 't2', animated: true, type: 'straight' },
    { source: 'planner', target: 't3', animated: true, type: 'curved' },
    
    { source: 't1', target: 'reasoner', animated: true, type: 'curved' },
    { source: 't2', target: 'reasoner', animated: true, type: 'straight' },
    { source: 't3', target: 'reasoner', animated: true, type: 'curved' },
    
    { source: 'reasoner', target: 'ans', animated: true, type: 'straight' },
    
    // Feedback loop
    { source: 'reasoner', target: 'planner', animated: true, type: 'custom', path: 'M 495 200 C 495 320, 195 320, 195 200', color: '#FCD34D', dashed: true }
  ]
};

export const graphRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 150, width: 70, height: 40, ...styles.query },
    { id: 'ext', label: 'Entity\nExtractor', x: 120, y: 150, width: 80, height: 50, bg: '#B45309', borderColor: '#FBBF24', color: '#FEF3C7' },
    
    // Knowledge Graph Circle
    { id: 'kg_center', label: 'Knowledge\nGraph', x: 280, y: 140, width: 80, height: 80, type: 'circle', bg: 'transparent', borderColor: '#374151', color: '#9CA3AF' },
    { id: 'n1', label: 'Person', x: 240, y: 80, width: 60, height: 30, ...styles.output },
    { id: 'n2', label: 'Company', x: 340, y: 80, width: 70, height: 30, ...styles.output },
    { id: 'n3', label: 'Location', x: 370, y: 150, width: 70, height: 30, ...styles.output },
    { id: 'n4', label: 'Tech', x: 340, y: 220, width: 60, height: 30, ...styles.output },
    { id: 'n5', label: 'Project', x: 240, y: 220, width: 60, height: 30, ...styles.output },
    
    { id: 'sub', label: 'Subgraph\nRetrieval', x: 480, y: 150, width: 80, height: 50, ...styles.db },
    { id: 'sum', label: 'Community\nSummaries', x: 600, y: 150, width: 90, height: 50, bg: '#0F766E', borderColor: '#2DD4BF', color: '#CCFBF1' },
    { id: 'llm', label: 'LLM', x: 730, y: 150, width: 60, height: 40, ...styles.model },
    { id: 'ans', label: 'Answer', x: 820, y: 150, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'ext', animated: true, type: 'straight' },
    { source: 'ext', target: 'kg_center', animated: true, type: 'straight' },
    { source: 'n1', target: 'n2', type: 'straight', color: '#4B5563' },
    { source: 'n2', target: 'n3', type: 'straight', color: '#4B5563' },
    { source: 'n3', target: 'n4', type: 'straight', color: '#4B5563' },
    { source: 'n4', target: 'n5', type: 'straight', color: '#4B5563' },
    { source: 'n5', target: 'n1', type: 'straight', color: '#4B5563' },
    
    { source: 'kg_center', target: 'sub', animated: true, type: 'straight' },
    { source: 'sub', target: 'sum', animated: true, type: 'straight' },
    { source: 'sum', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const crag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 120, width: 60, height: 40, ...styles.query },
    { id: 'ret', label: 'Retriever', x: 110, y: 120, width: 80, height: 40, ...styles.db },
    { id: 'docs', label: 'Docs', x: 220, y: 120, width: 60, height: 40, ...styles.query },
    { id: 'eval', label: 'Evaluator\nGrader', x: 310, y: 110, width: 80, height: 60, ...styles.diamond },
    
    { id: 'llm1', label: 'LLM', x: 470, y: 40, width: 60, height: 40, ...styles.model },
    { id: 'rewrite', label: 'Query\nRewriter', x: 470, y: 120, width: 80, height: 40, bg: '#B45309', borderColor: '#FBBF24', color: '#FEF3C7' },
    { id: 'web', label: 'Web\nSearch', x: 470, y: 200, width: 80, height: 40, bg: '#0369A1', borderColor: '#38BDF8', color: '#E0F2FE' },
    
    { id: 'llm2', label: 'LLM', x: 590, y: 200, width: 60, height: 40, ...styles.model },
    { id: 'ans1', label: 'Answer', x: 590, y: 40, width: 60, height: 40, ...styles.output },
    { id: 'ans2', label: 'Answer', x: 690, y: 200, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'ret', animated: true, type: 'straight' },
    { source: 'ret', target: 'docs', animated: true, type: 'straight' },
    { source: 'docs', target: 'eval', animated: true, type: 'straight' },
    
    // Correct
    { source: 'eval', target: 'llm1', animated: true, type: 'curved', color: '#10B981' },
    { source: 'llm1', target: 'ans1', animated: true, type: 'straight', color: '#10B981' },
    
    // Ambiguous
    { source: 'eval', target: 'rewrite', animated: true, type: 'straight', color: '#F59E0B' },
    { source: 'rewrite', target: 'ret', animated: true, type: 'custom', path: 'M 510 160 C 510 280, 150 280, 150 160', color: '#F59E0B', dashed: true },
    
    // Incorrect
    { source: 'eval', target: 'web', animated: true, type: 'curved', color: '#EF4444' },
    { source: 'web', target: 'llm2', animated: true, type: 'straight', color: '#EF4444' },
    { source: 'llm2', target: 'ans2', animated: true, type: 'straight', color: '#EF4444' }
  ]
};

export const multimodalRag = {
  nodes: [
    { id: 't1', label: 'Text', x: 20, y: 40, width: 60, height: 40, ...styles.query },
    { id: 't2', label: 'Images', x: 20, y: 100, width: 60, height: 40, ...styles.query },
    { id: 't3', label: 'Tables', x: 20, y: 160, width: 60, height: 40, ...styles.query },
    
    { id: 'clip', label: 'Multimodal\nEmbedding (CLIP)', x: 140, y: 90, width: 140, height: 60, ...styles.model },
    { id: 'idx', label: 'Unified\nVector Index', x: 330, y: 90, width: 100, height: 60, ...styles.db },
    
    { id: 'ret', label: 'Retrieval', x: 480, y: 100, width: 80, height: 40, ...styles.query },
    { id: 'vlm', label: 'Vision LLM', x: 610, y: 100, width: 80, height: 40, ...styles.model },
    { id: 'ans', label: 'Answer', x: 740, y: 100, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 't1', target: 'clip', animated: true, type: 'curved' },
    { source: 't2', target: 'clip', animated: true, type: 'straight' },
    { source: 't3', target: 'clip', animated: true, type: 'curved' },
    
    { source: 'clip', target: 'idx', animated: true, type: 'straight' },
    { source: 'idx', target: 'ret', animated: true, type: 'straight' },
    { source: 'ret', target: 'vlm', animated: true, type: 'straight' },
    { source: 'vlm', target: 'ans', animated: true, type: 'straight' }
  ]
};

// ... we will add advanced and self-rag later if needed or just provide simple ones.
export const advancedRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 100, width: 60, height: 40, ...styles.query },
    { id: 'rew', label: 'Rewrite', x: 110, y: 100, width: 70, height: 40, bg: '#B45309', borderColor: '#FBBF24', color: '#FEF3C7' },
    { id: 'embed', label: 'Embed', x: 210, y: 100, width: 70, height: 40, ...styles.model },
    { id: 'db', label: 'Vector DB', x: 310, y: 100, width: 80, height: 50, ...styles.db },
    { id: 'rerank', label: 'Reranker', x: 420, y: 100, width: 70, height: 40, bg: '#9D174D', borderColor: '#F472B6', color: '#FCE7F3' },
    { id: 'llm', label: 'LLM', x: 520, y: 100, width: 60, height: 40, ...styles.model },
    { id: 'ans', label: 'Answer', x: 610, y: 100, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'rew', animated: true, type: 'straight' },
    { source: 'rew', target: 'embed', animated: true, type: 'straight' },
    { source: 'embed', target: 'db', animated: true, type: 'straight' },
    { source: 'db', target: 'rerank', animated: true, type: 'straight' },
    { source: 'rerank', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'ans', animated: true, type: 'straight' }
  ]
};

export const selfRag = {
  nodes: [
    { id: 'q', label: 'Query', x: 20, y: 100, width: 60, height: 40, ...styles.query },
    { id: 'ret', label: 'Retriever', x: 110, y: 100, width: 80, height: 40, ...styles.db },
    { id: 'gen', label: 'Generator', x: 230, y: 100, width: 80, height: 40, ...styles.model },
    { id: 'crit', label: 'Critique\n[ISUSE]', x: 350, y: 90, width: 80, height: 60, ...styles.diamond },
    { id: 'ans', label: 'Final\nAnswer', x: 480, y: 100, width: 60, height: 40, ...styles.output }
  ],
  edges: [
    { source: 'q', target: 'ret', animated: true, type: 'straight' },
    { source: 'ret', target: 'gen', animated: true, type: 'straight' },
    { source: 'gen', target: 'crit', animated: true, type: 'straight' },
    { source: 'crit', target: 'ans', animated: true, type: 'straight', color: '#10B981' },
    { source: 'crit', target: 'ret', animated: true, type: 'custom', path: 'M 390 150 C 390 220, 150 220, 150 140', color: '#EF4444', dashed: true }
  ]
};

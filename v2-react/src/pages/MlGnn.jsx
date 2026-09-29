import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { rng, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "graph neural networks", "GNN", "message passing", "graph convolutional network", "GCN", "GraphSAGE",
  "graph attention network", "GAT", "node classification", "link prediction", "graph classification",
  "over-smoothing", "adjacency matrix", "node embeddings", "knowledge graphs", "molecules", "fraud rings",
  "PyTorch Geometric", "DGL",
];

/* ---------------------------------------------------------------------------
   Two communities of 14 nodes each, densely connected inside and sparsely
   across. Two nodes are labelled (+1 and −1); everything else starts at 0.
   Each round replaces every node's value with the degree-normalised mean of
   itself and its neighbours — the propagation step inside a GCN.
--------------------------------------------------------------------------- */

const GRAPH = (() => {
  const r = rng(40);
  const n = 28;
  const community = Array.from({ length: n }, (_, i) => (i < 14 ? 0 : 1));
  const edges = [];
  const has = new Set();
  const add = (a, b) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !has.has(k)) {
      has.add(k);
      edges.push([a, b]);
    }
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const same = community[i] === community[j];
      if (r() < (same ? 0.22 : 0.025)) add(i, j);
    }
  }
  // make sure everyone has at least one neighbour in their own community
  for (let i = 0; i < n; i++) if (!edges.some(([a, b]) => a === i || b === i)) add(i, community[i] === 0 ? (i + 1) % 14 : 14 + ((i - 13) % 14));
  const pos = Array.from({ length: n }, (_, i) => {
    const c = community[i];
    const k = i % 14;
    const angle = (k / 14) * Math.PI * 2 + r() * 0.3;
    const rad = 0.2 + r() * 0.12;
    return { x: (c === 0 ? 0.28 : 0.72) + Math.cos(angle) * rad, y: 0.5 + Math.sin(angle) * rad };
  });
  return { n, community, edges, pos, labelled: { 3: 1, 20: -1 } };
})();

function propagate(rounds) {
  const { n, edges, labelled } = GRAPH;
  const nbrs = Array.from({ length: n }, (_, i) => [i]); // self-loop, as in GCN's A + I
  edges.forEach(([a, b]) => {
    nbrs[a].push(b);
    nbrs[b].push(a);
  });
  const deg = nbrs.map((l) => l.length);
  let h = Array.from({ length: n }, (_, i) => labelled[i] ?? 0);
  const history = [h];
  for (let t = 0; t < rounds; t++) {
    h = h.map((_, i) => nbrs[i].reduce((s, j) => s + h[j] / Math.sqrt(deg[i] * deg[j]), 0)); // D^-1/2 (A+I) D^-1/2 h
    history.push(h);
  }
  return history;
}

const MAX_ROUNDS = 40;
const HISTORY = propagate(MAX_ROUNDS);

const accuracyAt = (h) => {
  const { community } = GRAPH;
  // Predict community 0 for positive values, 1 for negative; nodes still at exactly 0 count as wrong.
  return community.filter((c, i) => (c === 0 ? h[i] > 0 : h[i] < 0)).length / community.length;
};

function spread(h) {
  const m = h.reduce((a, b) => a + b, 0) / h.length;
  return Math.sqrt(h.reduce((s, v) => s + (v - m) ** 2, 0) / h.length) / (Math.max(...h.map(Math.abs)) || 1);
}

function MessagePassingLab() {
  const [rounds, setRounds] = useState(2);
  const h = HISTORY[rounds];
  const acc = useMemo(() => HISTORY.map(accuracyAt), []);
  const maxAbs = Math.max(...h.map(Math.abs)) || 1;
  const S = 320;
  const colour = (v) => {
    const t = v / maxAbs;
    if (Math.abs(t) < 1e-9) return "#374151";
    return t > 0 ? `rgba(96,165,250,${0.25 + 0.75 * t})` : `rgba(251,113,133,${0.25 + 0.75 * -t})`;
  };
  const W = 320;
  const H = 110;
  const x = (k) => 20 + (k / MAX_ROUNDS) * (W - 30);
  const y = (a) => H - 16 - ((a - 0.4) / 0.6) * (H - 26);

  return (
    <Panel tone="indigo" title="Message passing: labels spread along edges">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-md h-auto block rounded-lg bg-black/30 border border-white/10">
          {GRAPH.edges.map(([a, b], i) => (
            <line key={i} x1={GRAPH.pos[a].x * S} y1={GRAPH.pos[a].y * S} x2={GRAPH.pos[b].x * S} y2={GRAPH.pos[b].y * S} stroke={GRAPH.community[a] !== GRAPH.community[b] ? "rgba(251,191,36,0.6)" : "rgba(255,255,255,0.15)"} />
          ))}
          {GRAPH.pos.map((p, i) => (
            <g key={i}>
              <circle cx={p.x * S} cy={p.y * S} r={GRAPH.labelled[i] !== undefined ? 9 : 6.5} fill={colour(h[i])} stroke={GRAPH.labelled[i] !== undefined ? "#fff" : "rgba(0,0,0,0.6)"} strokeWidth={GRAPH.labelled[i] !== undefined ? 2 : 1} />
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <Slider label="Message-passing rounds (layers)" value={rounds} min={0} max={MAX_ROUNDS} onChange={setRounds} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Nodes classified correctly" value={pct(acc[rounds], 0)} tone="indigo" />
            <Metric label="Spread of values" value={spread(h).toFixed(2)} sub="0 = all nodes identical" />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
            <path d={acc.map((a, k) => `${k ? "L" : "M"}${x(k)},${y(a)}`).join("")} fill="none" stroke="#818cf8" strokeWidth="2" />
            <line x1={x(rounds)} y1="4" x2={x(rounds)} y2={H - 16} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x="20" y={H - 3} fill="#6b7280" fontSize="10">0 rounds</text>
            <text x={W - 10} y={H - 3} fill="#6b7280" fontSize="10" textAnchor="end">{MAX_ROUNDS}</text>
            <text x={W - 10} y="12" fill="#818cf8" fontSize="10" textAnchor="end">accuracy by rounds</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Only the two outlined nodes have labels (blue +, red −). Each round, every node takes the degree-normalised
        average of itself and its neighbours — exactly the propagation inside a graph convolutional network. After a
        few rounds the labels have spread through their own communities, and the few cross-community edges (amber)
        barely leak. Keep going and the values keep blending until every node looks alike and the accuracy
        falls back: that is over-smoothing, and it is why most GNNs use only two to four layers.
      </p>
    </Panel>
  );
}

export default function MlGnn() {
  const toc = [
    { label: "Data That Is a Graph", hash: "graphs" },
    { label: "Message Passing", hash: "message" },
    { label: "Message Passing Lab", hash: "lab" },
    { label: "GNN Architectures", hash: "architectures" },
    { label: "Tasks & Applications", hash: "tasks" },
    { label: "Practical Notes", hash: "practical" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Graph Neural Networks"
      intro="Learning on networks — social graphs, molecules, transactions, knowledge graphs — where the connections carry as much information as the nodes: message passing computed live, GCN, GraphSAGE and GAT, and the tasks they solve."
      toc={toc}
    >
      <Section id="graphs" title="Data That Is a Graph" lead="Rows in a table are independent; nodes in a graph are not. A user's friends, an account's counterparties or an atom's neighbours tell you a great deal about it.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Social & communication" tone="indigo"><p>Who follows, messages or pays whom.</p></Card>
          <Card title="Molecules" tone="emerald"><p>Atoms as nodes, bonds as edges — predicting properties for drug and materials discovery.</p></Card>
          <Card title="Transactions" tone="rose"><p>Accounts, cards and devices linked by payments; fraud rings show up as suspicious structures.</p></Card>
          <Card title="Knowledge graphs" tone="purple"><p>Entities and typed relations — also the backbone of <a href="#/rag/graph-rag" className="text-blue-400 hover:underline">Graph RAG</a>.</p></Card>
        </div>
      </Section>

      <Section id="message" title="Message Passing" lead="Every GNN layer does the same three things for each node: gather messages from its neighbours, aggregate them, and update its own representation.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 space-y-1 overflow-x-auto mb-5">
          <div>{"h_v⁽ˡ⁺¹⁾ = UPDATE( h_v⁽ˡ⁾ , AGGREGATE({ MESSAGE(h_u⁽ˡ⁾) : u ∈ neighbours(v) }) )"}</div>
          <div className="text-gray-500">GCN, in matrix form:  H⁽ˡ⁺¹⁾ = σ( D̃^-½ Ã D̃^-½ H⁽ˡ⁾ W⁽ˡ⁾ ),  Ã = A + I</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Receptive field" tone="indigo"><p>After k layers a node's representation depends on everything within k hops — like a CNN's receptive field, but along edges.</p></Card>
          <Card title="Order doesn't matter" tone="emerald"><p>Aggregation uses sum, mean or max, so the result is the same however the neighbours are listed.</p></Card>
          <Card title="Shared weights" tone="amber"><p>The same W is used at every node, so one model works on graphs of any size and shape.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Message Passing Lab" lead="Semi-supervised node classification on a 28-node graph, computed in your browser.">
        <MessagePassingLab />
      </Section>

      <Section id="architectures" title="GNN Architectures">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="GCN" tone="indigo"><p>Degree-normalised averaging of neighbour features followed by a linear layer. Simple and strong; needs the whole graph at training time.</p></Card>
          <Card title="GraphSAGE" tone="emerald"><p>Samples a fixed number of neighbours and learns the aggregator, so it scales to huge graphs and embeds nodes it never saw during training.</p></Card>
          <Card title="GAT" tone="purple"><p>Learns attention weights over neighbours, so important neighbours count more than others — attention restricted to graph edges.</p></Card>
        </div>
        <Note tone="indigo">A transformer can be seen as a GNN on a fully connected graph of tokens. Graph transformers add positional information about graph structure to get the best of both.</Note>
      </Section>

      <Section id="tasks" title="Tasks & Applications">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Node classification" tone="indigo"><p>Label nodes from their features and neighbourhood: fraudulent accounts, bot detection, paper topics.</p></Card>
          <Card title="Link prediction" tone="emerald"><p>Score whether an edge should exist: friend and product recommendations, drug–target interactions, knowledge-graph completion. See <a href="#/ml/recommenders" className="text-blue-400 hover:underline">Recommenders</a>.</p></Card>
          <Card title="Graph classification" tone="amber"><p>Pool node representations into one vector per graph: molecular property prediction, program analysis.</p></Card>
        </div>
      </Section>

      <Section id="practical" title="Practical Notes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Few layers" tone="rose"><p>Over-smoothing makes deep GNNs worse, not better. Two or three layers, residual connections and normalisation are typical.</p></Card>
          <Card title="Try a baseline first" tone="amber"><p>Hand-built graph features (degree, PageRank, neighbour aggregates) fed to gradient boosting are a strong, fast baseline — often hard to beat on tabular-style problems.</p></Card>
          <Card title="Split carefully" tone="indigo"><p>Edges leak information across train/test splits. For link prediction, hide the test edges from the graph used for message passing.</p></Card>
          <Card title="Scale" tone="emerald"><p>Neighbour sampling and mini-batching (GraphSAGE, cluster-based batching) are needed once graphs reach millions of nodes.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import torch
import torch.nn.functional as F
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv

data = Planetoid(root="data", name="Cora")[0]      # citation graph, 7 topics, few labels

class GCN(torch.nn.Module):
    def __init__(self, n_in, n_hidden, n_out):
        super().__init__()
        self.conv1 = GCNConv(n_in, n_hidden)
        self.conv2 = GCNConv(n_hidden, n_out)       # two layers = two hops
    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.5, training=self.training)
        return self.conv2(x, edge_index)

model = GCN(data.num_features, 16, 7)
opt = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
for epoch in range(200):
    model.train(); opt.zero_grad()
    out = model(data.x, data.edge_index)
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])   # only labelled nodes
    loss.backward(); opt.step()

pred = model(data.x, data.edge_index).argmax(dim=1)
print((pred[data.test_mask] == data.y[data.test_mask]).float().mean())`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-gnn")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "recommender systems", "recommendation engine", "collaborative filtering", "content-based filtering",
  "matrix factorization", "latent factors", "ALS", "alternating least squares", "user-user similarity",
  "item-item similarity", "implicit feedback", "explicit ratings", "cold start", "two-tower model",
  "candidate generation", "ranking", "re-ranking", "NDCG", "precision at k", "recall at k", "MAP",
  "popularity bias", "filter bubble", "A/B testing",
];

/* ---------------------------------------------------------------------------
   Six users, six films, some ratings missing. Matrix factorisation learns a
   k-dimensional vector per user and per film by gradient descent on the known
   ratings only, then fills in the blanks with their dot products.
--------------------------------------------------------------------------- */

const USERS = ["Asha", "Ben", "Chen", "Dara", "Eli", "Fay"];
const FILMS = ["Alien", "Arrival", "Interstellar", "Notting Hill", "Amélie", "Before Sunrise"];
// 0 = not rated. Two tastes: sci-fi (first three) and romance (last three).
const R = [
  [5, 4, 5, 1, 0, 1],
  [4, 5, 0, 2, 1, 0],
  [5, 0, 4, 0, 2, 1],
  [1, 2, 1, 5, 4, 0],
  [0, 1, 2, 4, 5, 5],
  [2, 0, 1, 5, 0, 4],
];

function factorise(k, lambda, epochs = 400, seed = 4) {
  const r = rng(seed);
  const U = USERS.map(() => Array.from({ length: k }, () => (r() - 0.5) * 0.2));
  const V = FILMS.map(() => Array.from({ length: k }, () => (r() - 0.5) * 0.2));
  const known = [];
  R.forEach((row, i) => row.forEach((v, j) => v && known.push([i, j, v])));
  const mu = known.reduce((s, x) => s + x[2], 0) / known.length;
  const bu = new Array(USERS.length).fill(0);
  const bi = new Array(FILMS.length).fill(0);
  const lr = 0.03;
  for (let e = 0; e < epochs; e++) {
    for (const [i, j, v] of known) {
      const pred = mu + bu[i] + bi[j] + U[i].reduce((s, x, f) => s + x * V[j][f], 0);
      const err = v - pred;
      bu[i] += lr * (err - lambda * bu[i]);
      bi[j] += lr * (err - lambda * bi[j]);
      for (let f = 0; f < k; f++) {
        const u = U[i][f];
        U[i][f] += lr * (err * V[j][f] - lambda * u);
        V[j][f] += lr * (err * u - lambda * V[j][f]);
      }
    }
  }
  const predict = (i, j) => Math.max(1, Math.min(5, mu + bu[i] + bi[j] + U[i].reduce((s, x, f) => s + x * V[j][f], 0)));
  const rmse = Math.sqrt(known.reduce((s, [i, j, v]) => s + (predict(i, j) - v) ** 2, 0) / known.length);
  return { U, V, predict, rmse };
}

function MatrixLab() {
  const [k, setK] = useState(1);
  const [lambda, setLambda] = useState(0.05);
  const [show, setShow] = useState("filled");
  const model = useMemo(() => factorise(k, lambda), [k, lambda]);
  const cellColour = (v) => `rgba(129,140,248,${0.1 + ((v - 1) / 4) * 0.7})`;

  return (
    <Panel tone="indigo" title="Fill in the blanks with matrix factorisation">
      <div className="flex flex-wrap items-end gap-5 mb-4">
        <Segmented
          value={show}
          onChange={setShow}
          options={[
            { v: "known", label: "Known ratings" },
            { v: "filled", label: "With predictions" },
          ]}
        />
        <div className="w-44"><Slider label="latent factors k" value={k} min={1} max={4} onChange={setK} /></div>
        <div className="w-44"><Slider label="regularisation λ" value={lambda} min={0} max={0.3} step={0.01} onChange={setLambda} format={(v) => v.toFixed(2)} /></div>
        <Metric label="Fit RMSE (known)" value={fmt(model.rmse)} tone="indigo" />
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs sm:text-sm font-mono border-separate border-spacing-1 min-w-[520px]">
          <thead>
            <tr>
              <th />
              {FILMS.map((f, j) => (
                <th key={f} className={`px-1 font-normal ${j < 3 ? "text-sky-300" : "text-rose-300"}`}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u, i) => (
              <tr key={u}>
                <td className="pr-2 text-gray-400">{u}</td>
                {FILMS.map((_, j) => {
                  const v = R[i][j];
                  const p = model.predict(i, j);
                  if (v) {
                    return (
                      <td key={j} className="w-16 h-10 text-center rounded-md text-white" style={{ background: cellColour(v) }}>
                        {v}
                      </td>
                    );
                  }
                  return (
                    <td key={j} className="w-16 h-10 text-center rounded-md border border-dashed border-amber-400/60" style={{ background: show === "filled" ? cellColour(p) : "transparent" }}>
                      {show === "filled" ? <span className="text-amber-200 font-bold">{p.toFixed(1)}</span> : <span className="text-gray-600">?</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500 mb-1">Learned user vectors (first factor)</div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {USERS.map((u, i) => (
              <span key={u} className={model.U[i][0] > 0 ? "text-sky-300" : "text-rose-300"}>
                {u} {model.U[i][0] >= 0 ? "+" : ""}{model.U[i][0].toFixed(2)}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500 mb-1">Learned film vectors (first factor)</div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {FILMS.map((f, j) => (
              <span key={f} className={model.V[j][0] > 0 ? "text-sky-300" : "text-rose-300"}>
                {f.split(" ")[0]} {model.V[j][0] >= 0 ? "+" : ""}{model.V[j][0].toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Nobody told the model which films are sci-fi. With k = 1, the single learned factor separates the two
        tastes on its own — users and films on the same side get high predicted ratings, opposite sides low ones
        (the sign is arbitrary). Ben has never rated Interstellar, and the model predicts he will love it. Now
        raise k: the fit to the 27 known ratings gets tighter (RMSE heads toward 0) while the predictions for the
        blanks get worse — Ben's Interstellar falls below 3. Extra factors spent on so little data mostly
        memorise noise. Each prediction is global mean + user bias + film bias + user·film vectors.
      </p>
    </Panel>
  );
}

const STAGES = [
  { n: "Candidate generation", d: "From millions of items, fetch a few hundred plausible ones fast: a two-tower model (user and item embeddings, nearest-neighbour search), co-visitation counts, 'more from this creator'.", t: "indigo" },
  { n: "Ranking", d: "A heavier model scores each candidate with rich features — user history, item metadata, context like time and device — predicting click, watch time or purchase.", t: "purple" },
  { n: "Re-ranking & rules", d: "Adjust the final list for diversity, freshness, fairness to creators, business rules and already-seen items.", t: "amber" },
];

export default function MlRecommenders() {
  const toc = [
    { label: "The Problem", hash: "problem" },
    { label: "Content vs Collaborative", hash: "approaches" },
    { label: "Matrix Factorisation Lab", hash: "lab" },
    { label: "Implicit Feedback", hash: "implicit" },
    { label: "Cold Start", hash: "cold" },
    { label: "Production Architecture", hash: "architecture" },
    { label: "Evaluating Recommendations", hash: "evaluation" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Recommender Systems"
      intro="How products, films and posts get chosen for you: content-based and collaborative filtering, matrix factorisation learned live, the cold-start problem, and the retrieve-then-rank architecture behind large-scale recommenders."
      toc={toc}
    >
      <Section id="problem" title="The Problem" lead="A user–item matrix with millions of rows and columns, almost entirely empty. The job is to predict which of the blanks this user would like most — and to show a handful of them.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Sparse" tone="indigo"><p>A typical user has interacted with far less than 1% of the catalogue. Most of the signal is missing.</p></Card>
          <Card title="Ranking, not rating" tone="emerald"><p>Getting a predicted 3.2 vs 3.4 right matters less than putting the right five items at the top of the list.</p></Card>
          <Card title="Feedback loops" tone="rose"><p>Users can only click what they were shown, so the model's past choices shape its future training data.</p></Card>
        </div>
      </Section>

      <Section id="approaches" title="Content vs Collaborative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Content-based" tone="amber"><p>Recommend items similar to ones the user liked, using item features — genre, text, <a href="#/rag/embeddings" className="text-blue-400 hover:underline">embeddings</a>. Works for brand-new items; tends to recommend more of the same.</p></Card>
          <Card title="Collaborative filtering" tone="indigo"><p>"People who liked what you liked also liked…". Uses only the interaction matrix, so it finds non-obvious connections — but knows nothing about new users or items.</p></Card>
          <Card title="Hybrid" tone="purple"><p>What production systems do: collaborative signals plus content features plus context, in one learned model.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Matrix Factorisation Lab" lead="Trained in your browser by stochastic gradient descent on the known ratings only.">
        <MatrixLab />
      </Section>

      <Section id="implicit" title="Implicit Feedback" lead="Star ratings are rare. Most real data is implicit: clicks, plays, purchases, dwell time.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="No negatives" tone="rose"><p>A missing click might mean "not interested" or "never saw it". Models treat unobserved items as weak negatives, often by sampling them.</p></Card>
          <Card title="Confidence, not rating" tone="emerald"><p>Implicit ALS weights each observed interaction by a confidence (more plays, more confidence) rather than predicting a score.</p></Card>
        </div>
      </Section>

      <Section id="cold" title="Cold Start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="New user" tone="indigo"><p>Ask a few onboarding questions, start with popular or trending items, and use context (location, device, referral) until history accumulates.</p></Card>
          <Card title="New item" tone="amber"><p>Collaborative filtering cannot score an item nobody has touched. Use content embeddings, and deliberately show new items to some users to gather data.</p></Card>
          <Card title="Explore vs exploit" tone="emerald"><p>Always recommending the current best guess starves everything else of data. Bandit methods reserve some traffic for exploration — see <a href="#/ml/reinforcement-learning" className="text-blue-400 hover:underline">RL</a>.</p></Card>
        </div>
      </Section>

      <Section id="architecture" title="Production Architecture" lead="Scoring every item for every request is impossible at scale, so large recommenders work in stages, each narrowing the list with a more expensive model.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {STAGES.map((s, i) => (
            <Card key={s.n} title={`${i + 1}. ${s.n}`} tone={s.t}><p>{s.d}</p></Card>
          ))}
        </div>
        <Note tone="indigo">
          The candidate-generation stage is the same machinery as RAG retrieval: embed, then approximate
          nearest-neighbour search in a <a href="#/rag/vector-dbs" className="text-blue-400 hover:underline">vector index</a>. LLMs are increasingly
          used to write item descriptions, explain recommendations and handle conversational requests.
        </Note>
      </Section>

      <Section id="evaluation" title="Evaluating Recommendations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Precision / recall @ k" tone="indigo"><p>Of the top k shown, how many were relevant; of all relevant items, how many made the top k.</p></Card>
          <Card title="NDCG @ k" tone="purple"><p>Rewards putting the most relevant items highest, with a logarithmic discount by position.</p></Card>
          <Card title="Beyond accuracy" tone="amber"><p>Coverage, diversity, novelty and popularity bias. A list of best-sellers scores well offline and teaches the user nothing.</p></Card>
          <Card title="Online A/B tests" tone="emerald"><p>Offline metrics only approximate the real goal. The decision comes from a controlled experiment on engagement or revenue.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`# Implicit-feedback matrix factorisation with the 'implicit' library
import numpy as np, scipy.sparse as sp
from implicit.als import AlternatingLeastSquares

# rows = users, cols = items, values = play counts
user_items = sp.csr_matrix((plays, (user_idx, item_idx)))
model = AlternatingLeastSquares(factors=64, regularization=0.05, iterations=20)
model.fit(user_items * 20)                      # confidence = alpha × count

ids, scores = model.recommend(user_id, user_items[user_id], N=10,
                              filter_already_liked_items=True)

# Evaluate on a time-based holdout: train on the past, test on the next week
from implicit.evaluation import ndcg_at_k
print(ndcg_at_k(model, train_matrix, test_matrix, K=10))`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-recommenders")} />
    </GuideLayout>
  );
}

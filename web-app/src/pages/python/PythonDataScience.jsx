import React, { useState } from 'react';
import GuideLayout from '../../components/GuideLayout';
import { CodeSnippet } from '../../components/CodeBlock';

/* ---------------------------------------------------------------------------
   Broadcasting: shows the smaller array being stretched to match the larger,
   including the case where the shapes are incompatible and NumPy raises.
--------------------------------------------------------------------------- */

const BROADCAST_CASES = [
  {
    label: '(3,3) + scalar',
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    bShape: 'scalar',
    b: [[10]],
    stretched: [[10, 10, 10], [10, 10, 10], [10, 10, 10]],
    ok: true,
    note: 'A single value is stretched across every element. No memory is actually copied — NumPy just reuses the value.',
  },
  {
    label: '(3,3) + (1,3) row',
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    bShape: 'row',
    b: [[10, 20, 30]],
    stretched: [[10, 20, 30], [10, 20, 30], [10, 20, 30]],
    ok: true,
    note: 'The row is duplicated down each of the 3 rows. Trailing dimension matches (3 == 3), so it broadcasts.',
  },
  {
    label: '(3,3) + (3,1) column',
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    bShape: 'col',
    b: [[10], [20], [30]],
    stretched: [[10, 10, 10], [20, 20, 20], [30, 30, 30]],
    ok: true,
    note: 'The column is duplicated across each of the 3 columns. Dimension of size 1 is the one that stretches.',
  },
  {
    label: '(3,3) + (2,) ✗',
    a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    bShape: 'bad',
    b: [[10, 20]],
    stretched: null,
    ok: false,
    note: 'Trailing dimensions are 3 and 2 — neither matches nor equals 1, so NumPy raises ValueError instead of guessing.',
  },
];

function BroadcastVisual() {
  const [pick, setPick] = useState(0);
  const c = BROADCAST_CASES[pick];

  const Grid = ({ data, tone, dim }) => (
    <div className="inline-block">
      <div className="flex flex-col gap-1">
        {data.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((v, ci) => (
              <div
                key={ci}
                className={`w-8 h-8 rounded flex items-center justify-center text-[0.6875rem] font-mono border ${tone} ${
                  dim ? 'opacity-45' : ''
                }`}
              >
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 mb-4">
      <div className="flex flex-wrap gap-2 mb-5">
        {BROADCAST_CASES.map((bc, i) => (
          <button
            key={bc.label}
            onClick={() => setPick(i)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[0.6875rem] transition-colors ${
              pick === i
                ? bc.ok
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {bc.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-[0.625rem] text-gray-500 mb-1.5 font-mono">A (3,3)</div>
          <Grid data={c.a} tone="bg-blue-500/15 border-blue-500/40 text-blue-200" />
        </div>

        <div className="text-2xl text-gray-600 pt-4">+</div>

        <div className="text-center">
          <div className="text-[0.625rem] text-gray-500 mb-1.5 font-mono">
            B {c.bShape === 'scalar' ? '()' : c.bShape === 'row' ? '(1,3)' : c.bShape === 'col' ? '(3,1)' : '(2,)'}
          </div>
          <Grid data={c.b} tone="bg-amber-500/20 border-amber-500/50 text-amber-200" />
        </div>

        <div className={`text-2xl pt-4 ${c.ok ? 'text-gray-600' : 'text-rose-500'}`}>{c.ok ? '→' : '✗'}</div>

        <div className="text-center">
          <div className="text-[0.625rem] text-gray-500 mb-1.5 font-mono">
            {c.ok ? 'B stretched to (3,3)' : 'ValueError'}
          </div>
          {c.ok ? (
            <Grid data={c.stretched} tone="bg-emerald-500/15 border-emerald-500/40 text-emerald-200" />
          ) : (
            <div className="w-[104px] h-[104px] rounded border border-dashed border-rose-500/50 bg-rose-500/5 flex items-center justify-center text-[0.625rem] text-rose-300 text-center px-2">
              shapes not
              <br />
              alignable
            </div>
          )}
        </div>
      </div>

      <p className={`text-[0.6875rem] leading-relaxed mt-4 mb-0 text-center ${c.ok ? 'text-gray-400' : 'text-rose-300'}`}>
        {c.note}
      </p>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1.5">The rule</div>
        <p className="text-[0.6875rem] text-gray-400 leading-relaxed m-0">
          Compare shapes right to left. Two dimensions are compatible when they are{' '}
          <strong className="text-gray-200">equal</strong> or one of them is{' '}
          <strong className="text-gray-200">1</strong>. Anything else raises.
        </p>
      </div>
    </div>
  );
}
import { Terminal, FileCode, LineChart, Cpu, Database, BarChart2, Sigma, Box } from 'lucide-react';

export default function PythonDataScience() {
  const toc = [
    { label: "59. Data Science Ecosystem", hash: "#ds-ecosystem" },
    { label: "60. NumPy ndarray & Reshaping", hash: "#numpy-arrays" },
    { label: "61. Vectorization & Broadcasting", hash: "#broadcasting" },
    { label: "62. Cosine Similarity & Norms", hash: "#cosine-sim" },
    { label: "63. Pandas Series & DataFrames", hash: "#pandas-dataframes" },
    { label: "64. Pandas Data Cleaning", hash: "#pandas-cleaning" },
    { label: "65. Pandas groupby & Merging", hash: "#pandas-groupby" },
    { label: "66. Matplotlib Figures & Plots", hash: "#matplotlib" },
    { label: "67. Seaborn Heatmaps & Stats", hash: "#seaborn" },
    { label: "68. Scikit-Learn Preprocessing", hash: "#sklearn-preprocessing" },
    { label: "69. Scikit-Learn Model Workflow", hash: "#sklearn-workflow" }
  ];

  return (
    <GuideLayout
      title="Module 5: Python for Data Science & ML"
      intro="Granular technical reference for NumPy array math, Pandas DataFrames, Matplotlib & Seaborn visualizations, and Scikit-Learn ML workflows."
      toc={toc}
    >
      {/* 51. DS ECOSYSTEM */}
      <section id="ds-ecosystem" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Sigma size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">59. Python Data Science Stack Overview</h2>
            <p className="text-xs text-gray-400">The core stack: NumPy, Pandas, SciPy, Matplotlib, Seaborn, Scikit-Learn</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The Python scientific computing stack forms the core foundation for modern AI and Machine Learning engineering. Libraries like NumPy, Pandas, SciPy, Matplotlib, Seaborn, and Scikit-Learn combine Python's simple, expressive syntax with underlying C, C++, and Fortran compiled backends to deliver fast execution speeds on large numerical datasets.
        </p>
      </section>

      {/* 52. NUMPY ARRAYS */}
      <section id="numpy-arrays" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">60. NumPy `ndarray` Creation & Reshaping</h2>
            <p className="text-xs text-gray-400">Contiguous C-memory arrays, dimensions (`ndim`), shapes (`shape`), and `.reshape()`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          NumPy's fundamental data structure is `ndarray`, a multi-dimensional array stored in contiguous C-level memory buffers. Array attributes like `.shape` (dimensions tuple) and `.ndim` (number of axes) define array structure, while `.reshape()` alters dimensions without making expensive data copies in memory.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-indigo-400"><FileCode size={12} /> 52_numpy_shape.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-indigo-300 mb-3 whitespace-pre-wrap">{`import numpy as np

arr = np.arange(12)  # 1D array of 0 to 11
matrix = arr.reshape(3, 4)  # Reshape to 3 rows, 4 columns

print("Matrix Shape:", matrix.shape)
print("Dimensions:", matrix.ndim)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Matrix Shape: (3, 4)<br/>Dimensions: 2</code>
          </div>
        </div>
      </section>

      {/* 53. BROADCASTING */}
      <section id="broadcasting" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">61. Vectorization & Broadcasting Rules</h2>
            <p className="text-xs text-gray-400">Performing fast element-wise arithmetic without slow Python for-loops</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Vectorization replaces slow Python loops with hardware SIMD (Single Instruction Multiple Data) parallel instructions. Broadcasting allows NumPy to perform arithmetic operations on arrays of differing shapes by automatically stretching smaller dimensions across larger ones, provided trailing dimensions match or equal 1. Nothing is actually copied — NumPy simulates the stretch, which is why broadcasting is free.
        </p>

        <BroadcastVisual />

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 53_broadcasting.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`import numpy as np

matrix = np.array([[10, 20], [30, 40]])
scalar = 5

# Broadcasting scalar across all elements in C
result = matrix * scalar
print(result)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>{`[[ 50 100]\n [150 200]]`}</code>
          </div>
        </div>
      </section>

      {/* 54. COSINE SIMILARITY */}
      <section id="cosine-sim" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sigma size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">62. Cosine Similarity & Vector Norms</h2>
            <p className="text-xs text-gray-400">Computing vector dot products (`np.dot`, `@`) and Euclidean L2 norms (`linalg.norm`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Cosine similarity measures the orientation angle between two embedding vectors regardless of their magnitude. It is computed by dividing the vector dot product (`vec_a @ vec_b`) by the product of their L2 Euclidean norms (`np.linalg.norm()`). This calculation forms the core metric for semantic search retrieval in vector databases.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 54_cosine.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`import numpy as np

vec_a = np.array([1.0, 2.0, 3.0])
vec_b = np.array([2.0, 3.0, 4.0])

dot = vec_a @ vec_b
norm_a = np.linalg.norm(vec_a)
norm_b = np.linalg.norm(vec_b)

sim = dot / (norm_a * norm_b)
print(f"Cosine Similarity: {sim:.4f}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Cosine Similarity: 0.9926</code>
          </div>
        </div>
      </section>

      {/* 55. PANDAS DATAFRAMES */}
      <section id="pandas-dataframes" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">63. Pandas Series & DataFrames</h2>
            <p className="text-xs text-gray-400">Creation, index alignment, row/column selection with `.loc` and `.iloc`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Pandas offers two primary data structures: `Series` (1D labeled arrays) and `DataFrame` (2D tabular datasets with row/column index alignment). The `.loc[]` property retrieves data by explicit label names, whereas `.iloc[]` accesses rows and columns by zero-based integer index positions.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 55_pandas.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`import pandas as pd

df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "score": [88, 92, 95]
}, index=["id_1", "id_2", "id_3"])

# Selection by label (.loc) vs integer position (.iloc)
print(df.loc["id_2", "score"])`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>92</code>
          </div>
        </div>
      </section>

      {/* 56. PANDAS CLEANING */}
      <section id="pandas-cleaning" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">64. Pandas Data Cleaning</h2>
            <p className="text-xs text-gray-400">Handling nulls (`isna`, `dropna`, `fillna`), deduplication (`drop_duplicates`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Real-world data requires extensive cleaning prior to model ingestion. Methods like `.isna()` identify null values, `.fillna()` imputes missing data with statistical metrics (mean/median), `.dropna()` drops incomplete records, and `.drop_duplicates()` eliminates redundant rows.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> 56_cleaning.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`import pandas as pd
import numpy as np

df = pd.DataFrame({"score": [90, np.nan, 80]})
clean_df = df.fillna(df["score"].mean())

print(clean_df)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>{`   score\n0   90.0\n1   85.0\n2   80.0`}</code>
          </div>
        </div>
      </section>

      {/* 57. PANDAS GROUPBY */}
      <section id="pandas-groupby" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">65. Pandas `groupby()` & Merging</h2>
            <p className="text-xs text-gray-400">Aggregating grouped data (`mean`, `sum`, `count`) and joining tables (`pd.merge`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The `.groupby()` method implements the split-apply-combine pattern, partitioning datasets into groups, applying aggregation metrics (`sum`, `mean`, `count`), and combining results. `pd.merge()` merges separate DataFrames based on matching key columns using database-style inner, outer, left, or right joins.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-teal-400"><FileCode size={12} /> 57_groupby.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-teal-300 mb-3 whitespace-pre-wrap">{`import pandas as pd

df = pd.DataFrame({
    "cat": ["A", "B", "A", "B"],
    "val": [10, 20, 30, 40]
})

res = df.groupby("cat")["val"].sum()
print(res)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>{`cat\nA    40\nB    60\nName: val, dtype: int64`}</code>
          </div>
        </div>
      </section>

      {/* 58. MATPLOTLIB */}
      <section id="matplotlib" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <LineChart size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">66. Matplotlib Figures & Plots</h2>
            <p className="text-xs text-gray-400">Creating figures, line plots, scatter plots, labels, legends, and saving images</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Matplotlib is Python's foundational plotting library. Using `plt.figure()` and `plt.subplots()`, developers construct line charts, scatter plots, and histograms, configuring custom titles, axis labels, and color palettes before saving high-resolution figures via `plt.savefig()`.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-rose-400"><FileCode size={12} /> 58_matplotlib.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-rose-300 mb-3 whitespace-pre-wrap">{`import matplotlib.pyplot as plt

plt.figure(figsize=(6, 3))
plt.plot([1, 2, 3], [10, 20, 30], label="Accuracy")
plt.xlabel("Epochs")
plt.ylabel("Score")
plt.legend()
plt.savefig("chart.png")
print("Chart generated.")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Chart generated.</code>
          </div>
        </div>
      </section>

      {/* 59. SEABORN */}
      <section id="seaborn" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <BarChart2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">67. Seaborn Statistical Visualizations</h2>
            <p className="text-xs text-gray-400">High-level statistical graphics, heatmaps (`sns.heatmap`), matrix correlation plots</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Built on top of Matplotlib, Seaborn provides a high-level interface for rendering attractive statistical graphics. Functions like `sns.heatmap()` visualize correlation matrices and attention maps, while `sns.histplot()` displays statistical distributions with minimal code boilerplate.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-pink-400"><FileCode size={12} /> 59_seaborn.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-pink-300 mb-3 whitespace-pre-wrap">{`import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt

matrix = np.random.rand(4, 4)
sns.heatmap(matrix, annot=True, cmap="viridis")
plt.savefig("heatmap.png")
print("Heatmap saved.")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Heatmap saved.</code>
          </div>
        </div>
      </section>

      {/* 60. SCIKIT PREPROCESSING */}
      <section id="sklearn-preprocessing" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">68. Scikit-Learn Preprocessing</h2>
            <p className="text-xs text-gray-400">Scaling features (`StandardScaler`), encoding categorical data (`OneHotEncoder`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Machine learning algorithms perform best when numerical features are scaled to similar ranges. `StandardScaler` standardizes features to zero mean and unit variance ($Z$-score scaling), while `OneHotEncoder` converts categorical text labels into binary indicator vectors suitable for linear models and neural networks.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 60_scaler.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-blue-300 mb-3 whitespace-pre-wrap">{`from sklearn.preprocessing import StandardScaler
import numpy as np

data = np.array([[1.0, 100.0], [2.0, 200.0]])
scaler = StandardScaler()
scaled = scaler.fit_transform(data)

print("Scaled Mean:", scaled.mean(axis=0))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Scaled Mean: [0. 0.]</code>
          </div>
        </div>
      </section>

      {/* 61. SCIKIT WORKFLOW */}
      <section id="sklearn-workflow" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">69. Scikit-Learn Model Workflow</h2>
            <p className="text-xs text-gray-400">Splitting (`train_test_split`), model fitting (`fit`), predicting (`predict`), and evaluation</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Scikit-Learn standardizes machine learning model development across estimators. The canonical workflow begins with `train_test_split()`, followed by model initialization (`model = LogisticRegression()`), training (`model.fit(X_train, y_train)`), inference (`model.predict(X_test)`), and accuracy metric evaluation.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 61_workflow.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=100, n_features=4, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)

acc = model.score(X_test, y_test)
print(f"Test Accuracy: {acc * 100:.0f}%")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Test Accuracy: 100%</code>
          </div>
        </div>
      </section>
    </GuideLayout>
  );
}

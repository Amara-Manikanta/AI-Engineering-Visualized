import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import CodeBlock from '../components/CodeBlock';

const toc = [
  { label: 'What Is Deep Learning?', hash: 'overview' },
  { label: 'How Deep Learning Learns', hash: 'how-it-works' },
  { label: 'From Machine Learning to Deep Learning', hash: 'comparison' },
  { label: 'What Is a Neural Network?', hash: 'neural-network' },
  { label: 'Anatomy of a Neural Network', hash: 'anatomy' },
  { label: 'Explore a Single Neuron', hash: 'neuron' },
  { label: 'Activation Functions', hash: 'activations' },
  { label: 'Forward Propagation', hash: 'forward' },
  { label: 'Loss and Backpropagation', hash: 'training' },
  { label: 'Build Your Mental Model', hash: 'summary' },
];

const cardClass =
  'rounded-2xl border border-white/10 bg-white/[0.035] p-5';

const headingClass =
  'text-xl font-semibold tracking-tight text-white md:text-2xl';

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5 py-8">
      <h2 className={headingClass}>{title}</h2>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

function Formula({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-indigo-400/20 bg-indigo-400/[0.06] px-4 py-4 text-center font-mono text-sm text-indigo-200">
      {children}
    </div>
  );
}

function DeepLearningLayers() {
  const layers = [
    { title: 'Input', subtitle: 'Raw data', color: '#38bdf8' },
    { title: 'Early features', subtitle: 'Simple patterns', color: '#818cf8' },
    { title: 'Deep features', subtitle: 'Complex patterns', color: '#c084fc' },
    { title: 'Output', subtitle: 'Prediction', color: '#34d399' },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {layers.map((layer, index) => (
        <React.Fragment key={layer.title}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
            className="relative rounded-2xl border p-4"
            style={{
              borderColor: `${layer.color}55`,
              background: `${layer.color}0d`,
            }}
          >
            <div
              className="mb-3 h-2 w-12 rounded-full"
              style={{ background: layer.color }}
            />
            <div className="font-semibold text-white">{layer.title}</div>
            <div className="mt-1 text-sm text-white/55">
              {layer.subtitle}
            </div>
          </motion.div>

          {index < layers.length - 1 && (
            <div className="flex items-center justify-center text-xl text-white/40 md:hidden">
              ↓
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function NeuralNetworkDiagram() {
  const layers = [
    { x: 65, nodes: 3, label: 'Input' },
    { x: 190, nodes: 4, label: 'Hidden 1' },
    { x: 315, nodes: 4, label: 'Hidden 2' },
    { x: 440, nodes: 2, label: 'Output' },
  ];

  const positions = layers.map((layer, layerIndex) => {
    const spacing = 40;
    const totalHeight = (layer.nodes - 1) * spacing;

    return {
      ...layer,
      layerIndex,
      points: Array.from({ length: layer.nodes }, (_, nodeIndex) => ({
        x: layer.x,
        y: 130 - totalHeight / 2 + nodeIndex * spacing,
        id: `${layerIndex}-${nodeIndex}`,
      })),
    };
  });

  const edges = positions.slice(0, -1).flatMap((layer, i) =>
    layer.points.flatMap((source) =>
      positions[i + 1].points.map((target) => ({
        source,
        target,
        id: `${source.id}-${target.id}`,
      }))
    )
  );

  const colors = ['#38bdf8', '#818cf8', '#c084fc', '#34d399'];

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1020] p-3">
      <svg
        viewBox="0 0 500 205"
        className="mx-auto w-full min-w-[420px] max-w-3xl"
        role="img"
        aria-label="Neural network with an input layer, two hidden layers, and an output layer"
      >
        <defs>
          <marker
            id="network-arrow"
            markerWidth="5"
            markerHeight="5"
            refX="4"
            refY="2.5"
            orient="auto"
          >
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#64748b" />
          </marker>
        </defs>

        {edges.map((edge) => (
          <motion.line
            key={edge.id}
            x1={edge.source.x + 12}
            y1={edge.source.y}
            x2={edge.target.x - 12}
            y2={edge.target.y}
            stroke="#64748b"
            strokeOpacity="0.48"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        ))}

        {positions.map((layer, i) => (
          <g key={layer.label}>
            {layer.points.map((point) => (
              <g key={point.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="11"
                  fill={`${colors[i]}22`}
                  stroke={colors[i]}
                  strokeWidth="1.5"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={colors[i]}
                />
              </g>
            ))}

            <text
              x={layer.x}
              y="190"
              textAnchor="middle"
              fill={colors[i]}
              fontSize="10"
              fontWeight="600"
            >
              {layer.label}
            </text>
          </g>
        ))}
      </svg>

      <p className="px-3 pb-2 text-center text-xs text-white/45">
        Every connecting line represents a learnable weight. Each circle
        represents a neuron.
      </p>
    </div>
  );
}

function SingleNeuronExplorer() {
  const [inputs, setInputs] = useState([0.8, 0.4, 0.9]);
  const [weights, setWeights] = useState([0.7, -0.3, 0.5]);
  const [bias, setBias] = useState(0.1);
  const [activation, setActivation] = useState('sigmoid');

  const z = inputs.reduce(
    (sum, input, i) => sum + input * weights[i],
    bias
  );

  const output =
    activation === 'relu'
      ? Math.max(0, z)
      : activation === 'tanh'
        ? Math.tanh(z)
        : 1 / (1 + Math.exp(-z));

  const updateArray = (setter, array, index, value) => {
    setter(array.map((item, i) => (i === index ? value : item)));
  };

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        <Pill>3 inputs</Pill>
        <Pill>3 weights</Pill>
        <Pill>1 bias</Pill>
        <Pill>1 output</Pill>
      </div>

      <div className="overflow-x-auto rounded-xl bg-[#0b1020] p-3">
        <svg
          viewBox="0 0 440 190"
          className="mx-auto w-full min-w-[330px] max-w-2xl"
          role="img"
          aria-label="Three inputs connect to one neuron, which produces an output"
        >
          {inputs.map((input, i) => {
            const y = 45 + i * 50;
            return (
              <g key={i}>
                <line
                  x1="82"
                  y1={y}
                  x2="204"
                  y2="95"
                  stroke={weights[i] >= 0 ? '#818cf8' : '#fb7185'}
                  strokeWidth="2"
                  strokeOpacity="0.85"
                />
                <circle cx="42" cy={y} r="20" fill="#38bdf822" stroke="#38bdf8" />
                <text x="42" y={y + 4} fill="white" fontSize="12" textAnchor="middle">
                  {input.toFixed(1)}
                </text>
                <text x="137" y={y - 7} fill="#c4b5fd" fontSize="10" textAnchor="middle">
                  w{i + 1}={weights[i].toFixed(1)}
                </text>
              </g>
            );
          })}

          <circle cx="225" cy="95" r="27" fill="#818cf822" stroke="#a5b4fc" strokeWidth="2" />
          <text x="225" y="100" fill="white" fontSize="15" textAnchor="middle">Σ</text>

          <line x1="252" y1="95" x2="317" y2="95" stroke="#34d399" strokeWidth="2" />
          <circle cx="354" cy="95" r="25" fill="#34d39920" stroke="#34d399" strokeWidth="2" />
          <text x="354" y="99" fill="white" fontSize="12" textAnchor="middle">
            {output.toFixed(2)}
          </text>
          <text x="354" y="139" fill="#6ee7b7" fontSize="11" textAnchor="middle">
            Output
          </text>
          <text x="225" y="145" fill="#a5b4fc" fontSize="11" textAnchor="middle">
            Bias = {bias.toFixed(1)}
          </text>
        </svg>
      </div>

      <Formula>
        z = x₁w₁ + x₂w₂ + x₃w₃ + b
      </Formula>

      <div className="space-y-4">
        {inputs.map((input, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="text-sm text-white/75">
              Input x{i + 1}: <strong>{input.toFixed(1)}</strong>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={input}
                onChange={(e) =>
                  updateArray(inputsSetter, inputs, i, Number(e.target.value))
                }
                className="mt-2 w-full accent-sky-400"
              />
            </label>

            <label className="text-sm text-white/75">
              Weight w{i + 1}: <strong>{weights[i].toFixed(1)}</strong>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={weights[i]}
                onChange={(e) =>
                  updateArray(weightsSetter, weights, i, Number(e.target.value))
                }
                className="mt-2 w-full accent-violet-400"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-white/75">
          Bias: <strong>{bias.toFixed(1)}</strong>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={bias}
            onChange={(e) => setBias(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-400"
          />
        </label>

        <label className="text-sm text-white/75">
          Activation function
          <select
            value={activation}
            onChange={(e) => setActivation(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#151a2b] p-2 text-white"
          >
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={cardClass}>
          <p className="text-xs text-white/50">Weighted sum z</p>
          <p className="mt-2 text-2xl font-semibold text-white">{z.toFixed(3)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs text-white/50">Activation</p>
          <p className="mt-2 text-2xl font-semibold text-violet-300">{activation}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs text-white/50">Neuron output</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {output.toFixed(3)}
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-white/60">
        Change an input, weight, or bias. The weighted sum and neuron output
        update immediately. This is the basic computation performed by a
        neuron.
      </p>
    </div>
  );

  function inputsSetter(next) {
    setInputs(next);
  }

  function weightsSetter(next) {
    setWeights(next);
  }
}

function ActivationExplorer() {
  const [x, setX] = useState(0.5);
  const sigmoid = 1 / (1 + Math.exp(-x));
  const relu = Math.max(0, x);
  const tanh = Math.tanh(x);

  const functions = [
    { name: 'Sigmoid', value: sigmoid, color: '#38bdf8', range: '0 to 1' },
    { name: 'ReLU', value: relu, color: '#a78bfa', range: '0 to infinity' },
    { name: 'Tanh', value: tanh, color: '#34d399', range: '-1 to 1' },
  ];

  const plot = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 80; i++) {
      const value = -4 + (i / 80) * 8;
      points.push({
        x: 30 + i * 4,
        value,
        sigmoid: 1 / (1 + Math.exp(-value)),
        relu: Math.max(0, value),
        tanh: Math.tanh(value),
      });
    }
    return points;
  }, []);

  const it_toY = (value) => 110 - value * 22;

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:p-6">
      <div className="overflow-x-auto rounded-xl bg-[#0b1020] p-3">
        <svg viewBox="0 0 380 155" className="mx-auto w-full min-w-[300px] max-w-2xl">
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="30"
              x2="350"
              y1={20 + i * 27}
              y2={20 + i * 27}
              stroke="#334155"
              strokeWidth="0.7"
            />
          ))}

          {[
            { key: 'sigmoid', color: '#38bdf8' },
            { key: 'relu', color: '#a78bfa' },
            { key: 'tanh', color: '#34d399' },
          ].map((fn) => (
            <polyline
              key={fn.key}
              fill="none"
              stroke={fn.color}
              strokeWidth="2"
              points={plot
                .map((p) => {
                  const v = fn.key === 'relu' ? Math.min(p.relu, 4) : p[fn.key];
                  const y = fn.key === 'tanh'
                    ? 80 - v * 45
                    : fn.key === 'relu'
                      ? 125 - v * 25
                      : 130 - v * 100;
                  return `${p.x},${y}`;
                })
                .join(' ')}
            />
          ))}

          <line x1="190" y1="15" x2="190" y2="135" stroke="#94a3b8" strokeDasharray="3 3" />
          <text x="30" y="148" fill="#94a3b8" fontSize="9">−4</text>
          <text x="190" y="148" fill="#94a3b8" fontSize="9" textAnchor="middle">0</text>
          <text x="350" y="148" fill="#94a3b8" fontSize="9" textAnchor="end">4</text>
        </svg>
        <div className="flex flex-wrap justify-center gap-4 pb-2 text-xs">
          {functions.map((fn) => (
            <span key={fn.name} style={{ color: fn.color }}>● {fn.name}</span>
          ))}
        </div>
      </div>

      <label className="block text-sm text-white/75">
        Explore an input value: <strong>{x.toFixed(1)}</strong>
        <input
          type="range"
          min="-4"
          max="4"
          step="0.1"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          className="mt-3 w-full accent-violet-400"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        {functions.map((fn) => (
          <div key={fn.name} className={cardClass}>
            <p className="text-sm text-white/60">{fn.name}</p>
            <p className="my-2 text-2xl font-semibold" style={{ color: fn.color }}>
              {fn.value.toFixed(3)}
            </p>
            <p className="text-xs text-white/45">Output range: {fn.range}</p>
          </div>
        ))}
      </div>

      <p className="text-sm leading-6 text-white/60">
        Activation functions introduce non-linearity. Without suitable
        non-linear activations, stacking ordinary linear layers cannot learn
        more complex functions than a single linear transformation.
      </p>
    </div>
  );
}

function TrainingFlow() {
  const steps = [
    {
      number: '01',
      title: 'Forward pass',
      text: 'Send inputs through the network to produce a prediction.',
      color: '#38bdf8',
    },
    {
      number: '02',
      title: 'Calculate loss',
      text: 'Compare the prediction with the correct answer.',
      color: '#fbbf24',
    },
    {
      number: '03',
      title: 'Backpropagation',
      text: 'Calculate how each parameter contributed to the error.',
      color: '#c084fc',
    },
    {
      number: '04',
      title: 'Update weights',
      text: 'Use an optimizer to adjust parameters and reduce future loss.',
      color: '#34d399',
    },
  ];

  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, i) => (
          <button
            key={step.number}
            onClick={() => setActive(i)}
            className="rounded-xl border p-4 text-left transition"
            style={{
              borderColor: active === i ? step.color : 'rgba(255,255,255,0.1)',
              background: active === i ? `${step.color}15` : 'rgba(255,255,255,0.025)',
            }}
          >
            <div className="text-xs" style={{ color: step.color }}>
              STEP {step.number}
            </div>
            <div className="mt-2 font-semibold text-white">{step.title}</div>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
      >
        <p className="text-lg font-semibold text-white">
          {steps[active].title}
        </p>
        <p className="mt-2 leading-7 text-white/65">{steps[active].text}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((step, i) => (
            <button
              key={step.number}
              onClick={() => setActive(i)}
              className="rounded-lg border px-3 py-2 text-sm text-white/75"
              style={{
                borderColor: i === active ? step.color : 'rgba(255,255,255,0.1)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function MlDeepLearning() {
  return (
    <GuideLayout
      title="Deep Learning"
      subtitle="From learning patterns in data to understanding neural networks, one step at a time."
      toc={toc}
    >
      <div className="space-y-2">
        <Pill>Beginner → Intermediate</Pill>
        <Pill>Interactive visualisations</Pill>
      </div>

      <Section id="overview" title="1. What Is Deep Learning?">
        <p className="text-base leading-8 text-white/70">
          Deep learning is a branch of machine learning that uses neural
          networks with multiple layers to learn patterns from data. Instead
          of manually describing every useful feature, we give the model
          examples and let it learn useful representations during training.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-3 text-2xl">🖼️</div>
            <h3 className="font-semibold text-white">Example: Recognising a cat</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              A deep-learning model can learn visual patterns from labelled
              images. Early layers may respond to edges and textures; deeper
              layers can combine these into shapes and object-level patterns.
            </p>
          </div>
          <div className={cardClass}>
            <div className="mb-3 text-2xl">🗣️</div>
            <h3 className="font-semibold text-white">Example: Understanding speech</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Models learn patterns in audio and language to help recognise
              speech, transcribe words, translate languages, or generate
              responses.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white">
          Why is it called deep?
        </h3>
        <p className="leading-7 text-white/65">
          The word <strong className="text-white">deep</strong> refers to the
          multiple computational layers between input and output. A network
          with many useful layers can build increasingly complex
          representations. More layers do not automatically make a model
          better; the architecture, data, and training process matter too.
        </p>

        <DeepLearningLayers />
      </Section>

      <Section id="how-it-works" title="2. How Does Deep Learning Learn?">
        <p className="leading-7 text-white/65">
          Imagine teaching a model to distinguish cats from dogs. You provide
          training images and their correct labels. The network predicts a
          label, measures its error, and adjusts its internal parameters.
          Repeating this process helps it make better predictions on data it
          has not seen before.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['1. Data', 'Examples such as images, text, audio, or numbers.'],
            ['2. Model', 'A neural network with trainable weights and biases.'],
            ['3. Training', 'An optimisation process that adjusts those parameters.'],
          ].map(([title, text]) => (
            <div key={title} className={cardClass}>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4">
          <p className="font-semibold text-amber-200">Important distinction</p>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Training is when the model adjusts its parameters using examples.
            Inference is when the trained model uses those parameters to make
            a prediction on new input.
          </p>
        </div>
      </Section>

      <Section
        id="comparison"
        title="3. Traditional Machine Learning vs Deep Learning"
      >
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-white/5 text-white">
              <tr>
                <th className="p-3">Aspect</th>
                <th className="p-3">Traditional ML</th>
                <th className="p-3">Deep Learning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/65">
              <tr>
                <td className="p-3">Features</td>
                <td className="p-3">Often engineered manually</td>
                <td className="p-3">Often learned from data</td>
              </tr>
              <tr>
                <td className="p-3">Data needs</td>
                <td className="p-3">Can work well on smaller datasets</td>
                <td className="p-3">Often benefits from more data</td>
              </tr>
              <tr>
                <td className="p-3">Compute</td>
                <td className="p-3">Often lower</td>
                <td className="p-3">Can be substantially higher</td>
              </tr>
              <tr>
                <td className="p-3">Examples</td>
                <td className="p-3">Decision trees, random forests</td>
                <td className="p-3">CNNs, Transformers, deep MLPs</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-6 text-white/50">
          These are general tendencies, not strict rules. Some traditional
          machine-learning models handle large datasets, and some deep-learning
          models can learn from relatively small datasets with suitable
          techniques.
        </p>
      </Section>

      <Section id="neural-network" title="4. What Is a Neural Network?">
        <p className="leading-7 text-white/65">
          A neural network is a computational model made of connected units
          called <strong className="text-white">neurons</strong>. Each neuron
          combines inputs using weights and a bias, then applies an activation
          function. A network connects many neurons so that their combined
          calculations can learn complex relationships.
        </p>

        <NeuralNetworkDiagram />

        <div className="grid gap-3 md:grid-cols-3">
          <div className={cardClass}>
            <h3 className="font-semibold text-sky-300">Input layer</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Receives the data, such as pixels, measurements, or numerical
              features.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="font-semibold text-violet-300">Hidden layers</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Transform information into useful intermediate representations.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="font-semibold text-emerald-300">Output layer</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Produces the final result, such as a class score or a numerical
              prediction.
            </p>
          </div>
        </div>
      </Section>

      <Section id="anatomy" title="5. Anatomy of a Neural Network">
        <p className="leading-7 text-white/65">
          Four concepts explain most of a basic feed-forward network:
        </p>

        <div className="space-y-3">
          {[
            {
              title: 'Inputs (x)',
              text: 'The values provided to the neuron. For a house-price model, these might be area, number of rooms, and location features.',
            },
            {
              title: 'Weights (w)',
              text: 'Learnable numbers that control how strongly each input contributes. A weight can be positive, negative, or close to zero.',
            },
            {
              title: 'Bias (b)',
              text: 'A learnable offset that lets the neuron shift its response instead of relying only on the inputs.',
            },
            {
              title: 'Activation function f',
              text: 'Transforms the weighted sum. Non-linear activations allow stacked layers to represent more complex patterns.',
            },
          ].map((item, i) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 font-semibold text-indigo-300">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <Formula>
          z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b
        </Formula>
        <Formula>
          Output = f(z)
        </Formula>
      </Section>

      <Section id="neuron" title="6. Explore a Single Neuron">
        <p className="leading-7 text-white/65">
          Move the sliders to see how changing an input, weight, or bias
          changes the neuron's result. This is a live calculation, not a
          trained model.
        </p>
        <SingleNeuronExplorer />
      </Section>

      <Section id="activations" title="7. Activation Functions">
        <p className="leading-7 text-white/65">
          A neuron first computes a weighted sum. Its activation function
          transforms that number before passing it to the next layer.
        </p>
        <ActivationExplorer />

        <div className="grid gap-3 md:grid-cols-3">
          <div className={cardClass}>
            <h3 className="font-semibold text-sky-300">Sigmoid</h3>
            <Formula>σ(x) = 1 / (1 + e⁻ˣ)</Formula>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Maps values between 0 and 1. Often useful for a binary
              classification output, though hidden layers commonly use other
              activations.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="font-semibold text-violet-300">ReLU</h3>
            <Formula>f(x) = max(0, x)</Formula>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Outputs zero for negative inputs and the input itself for
              positive values. Common in many hidden layers.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="font-semibold text-emerald-300">Tanh</h3>
            <Formula>f(x) = tanh(x)</Formula>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Maps values between -1 and 1, with zero as its central point.
            </p>
          </div>
        </div>
      </Section>

      <Section id="forward" title="8. Forward Propagation">
        <p className="leading-7 text-white/65">
          Forward propagation is the process of moving input data through each
          layer to calculate a prediction. Every layer uses the previous
          layer's outputs as its inputs.
        </p>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['Input', 'Receive features'],
            ['Transform', 'Multiply by weights'],
            ['Activate', 'Apply a non-linear function'],
            ['Predict', 'Produce the output'],
          ].map(([title, text], i) => (
            <div key={title} className={cardClass}>
              <p className="text-xs text-white/40">STEP {i + 1}</p>
              <h3 className="mt-2 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-white/60">{text}</p>
              {i < 3 && (
                <div className="mt-3 text-indigo-300">↓</div>
              )}
            </div>
          ))}
        </div>

        <Formula>
          ŷ = f(Wx + b)
        </Formula>

        <p className="text-sm leading-6 text-white/55">
          For a multi-layer network, this transformation is repeated through
          the layers. The notation is simplified: real networks may use
          matrices, vectors, and different activation functions at each layer.
        </p>
      </Section>

      <Section id="training" title="9. Loss and Backpropagation">
        <p className="leading-7 text-white/65">
          A prediction is not enough. During supervised training, we compare
          it with the target and calculate a loss. Backpropagation computes
          gradients that describe how the loss changes with the parameters.
          An optimiser uses those gradients to update weights and biases.
        </p>

        <TrainingFlow />

        <Formula>
          New weight = Old weight − Learning rate × Gradient
        </Formula>

        <div className={cardClass}>
          <h3 className="font-semibold text-white">What does the learning rate do?</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            It controls the size of each parameter update. If updates are too
            large, training can become unstable. If they are too small,
            learning may be slow. Training usually repeats this process over
            many batches and epochs.
          </p>
        </div>

        <CodeBlock language="python">
{`# Simplified PyTorch training loop
for inputs, targets in dataloader:
    predictions = model(inputs)
    loss = loss_function(predictions, targets)

    optimizer.zero_grad()
    loss.backward()  # Calculate gradients
    optimizer.step() # Update parameters`}
</CodeBlock>
</Section>
</GuideLayout>
  );
}
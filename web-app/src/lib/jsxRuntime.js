import * as React from 'react';
import * as FramerMotion from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import { transform } from 'sucrase';

// Internal modules and data imported across guide pages
import * as stats from './stats';
import * as VizKit from '../components/VizKit';
import KnowledgeCheck from '../components/KnowledgeCheck';
import * as quizBank from '../data/quizBank';
import * as flowcharts from '../data/flowcharts';
import * as glossary from '../data/glossary';
import * as modelProfiles from '../data/modelProfiles';
import * as ragVariants from '../data/ragVariants';
import * as progress from './progress';
import * as questionFormat from './questionFormat';
import * as useReducedMotion from './useReducedMotion';
import ModelBenchmarks from '../components/ModelBenchmarks';
import ModelProfile from '../components/ModelProfile';
import InterviewCards from '../components/InterviewCards';
import PromptPractice from '../components/PromptPractice';
import AdvancedFlowchart from '../components/AdvancedFlowchart';
import VariantNotes from '../components/VariantNotes';

// Safe proxy for Lucide icons so AI hallucinations don't crash the renderer
const safeLucide = new Proxy(LucideIcons, {
  get(target, prop) {
    if (typeof prop === 'string' && prop in target) {
      return target[prop];
    }
    // Return a generic fallback icon component if not found
    return target.Sparkles || target.HelpCircle || (() => null);
  },
});

// A lightweight pass-through GuideLayout for sandboxed preview components
function SandboxGuideLayout({ title, intro, children }) {
  return React.createElement(
    'div',
    { className: 'sandbox-embedded-page space-y-6' },
    title
      ? React.createElement(
          'div',
          { className: 'mb-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20' },
          React.createElement('h2', { className: 'text-xl sm:text-2xl font-black text-white' }, title),
          intro
            ? React.createElement('p', { className: 'text-xs sm:text-sm text-indigo-200/80 mt-1' }, intro)
            : null
        )
      : null,
    React.createElement('div', { className: 'space-y-6' }, children)
  );
}

// Universal safe fallback proxy for any unknown or missing imports
function createSafeDummy(name = 'Component') {
  const dummyFn = function SafeDummy(props = {}) {
    return props?.children || null;
  };
  dummyFn.displayName = `SafeDummy_${name}`;

  return new Proxy(dummyFn, {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return target;
      if (typeof prop === 'string') {
        return createSafeDummy(`${name}_${prop}`);
      }
      return undefined;
    },
    apply(target, thisArg, args) {
      const first = args[0];
      if (first && typeof first === 'object' && 'children' in first) {
        return first.children || null;
      }
      // Return a harmless numeric/function generator so calls like rng() or randn() don't fail
      return () => 0.5;
    },
  });
}

const asModule = (mod) => {
  if (!mod) return createSafeDummy();
  if (typeof mod === 'function') {
    mod.default = mod;
    mod.__esModule = true;
    return mod;
  }
  if (typeof mod === 'object') {
    if (!('default' in mod)) {
      try {
        mod.default = mod;
      } catch {
        /* ignore if sealed */
      }
    }
    try {
      mod.__esModule = true;
    } catch {
      /* ignore if sealed */
    }
  }
  return mod;
};

/**
 * Cleans code pasted from LLMs (stripping markdown fences like ```jsx ... ```)
 */
export function cleanCodeForCompilation(rawCode) {
  if (!rawCode) return '';
  let code = rawCode.trim();

  // Strip markdown code fences if present
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:jsx|javascript|tsx|ts)?\r?\n?/, '');
    code = code.replace(/\r?\n?```\s*$/, '').trim();
  }

  // Ensure export default exists
  if (!code.includes('export default') && !code.includes('module.exports')) {
    const fnMatch = code.match(/function\s+([A-Z]\w+)/);
    if (fnMatch) {
      code += `\nexport default ${fnMatch[1]};`;
    }
  }

  return code;
}

/**
 * Transpiles and evaluates JSX source code in-browser
 * Returns { Component, error }
 */
export function compileAndEvaluate(rawCode) {
  const cleanCode = cleanCodeForCompilation(rawCode);
  if (!cleanCode) {
    return { Component: null, error: 'Empty code provided.' };
  }

  try {
    // 1. Transform JSX and ES Imports using Sucrase
    const transpiled = transform(cleanCode, {
      transforms: ['jsx', 'imports'],
      production: true,
    }).code;

    // 2. Build local module scope & require implementation
    const exports = {};
    const module = { exports };

    const scopeMap = {};

    const registerModule = (keys, mod) => {
      const wrapped = asModule(mod);
      keys.forEach((k) => {
        scopeMap[k] = wrapped;
      });
    };

    // Third-party essentials
    registerModule(['react', 'react/jsx-runtime'], React);
    registerModule(['framer-motion'], FramerMotion);
    registerModule(['lucide-react'], safeLucide);
    registerModule(['react-router-dom'], ReactRouterDOM);

    // Layout and common visual components
    registerModule(['../components/GuideLayout', './components/GuideLayout', 'GuideLayout'], SandboxGuideLayout);
    registerModule(['../components/CodeBlock', './components/CodeBlock', 'CodeBlock'], CodeBlock);
    registerModule(['../components/VizKit', './components/VizKit', 'VizKit'], VizKit);
    registerModule(['../components/KnowledgeCheck', './components/KnowledgeCheck', 'KnowledgeCheck'], KnowledgeCheck);
    registerModule(['../components/ModelBenchmarks', './components/ModelBenchmarks', 'ModelBenchmarks'], ModelBenchmarks);
    registerModule(['../components/ModelProfile', './components/ModelProfile', 'ModelProfile'], ModelProfile);
    registerModule(['../components/InterviewCards', './components/InterviewCards', 'InterviewCards'], InterviewCards);
    registerModule(['../components/PromptPractice', './components/PromptPractice', 'PromptPractice'], PromptPractice);
    registerModule(['../components/AdvancedFlowchart', './components/AdvancedFlowchart', 'AdvancedFlowchart'], AdvancedFlowchart);
    registerModule(['../components/VariantNotes', './components/VariantNotes', 'VariantNotes'], VariantNotes);

    // Data banks & statistics
    registerModule(['../lib/stats', './stats', 'stats', 'lib/stats'], stats);
    registerModule(['../data/quizBank', './quizBank', 'quizBank', 'data/quizBank'], quizBank);
    registerModule(['../data/flowcharts', './flowcharts', 'flowcharts', 'data/flowcharts'], flowcharts);
    registerModule(['../data/glossary', './glossary', 'glossary', 'data/glossary'], glossary);
    registerModule(['../data/modelProfiles', './modelProfiles', 'modelProfiles', 'data/modelProfiles'], modelProfiles);
    registerModule(['../data/ragVariants', './ragVariants', 'ragVariants', 'data/ragVariants'], ragVariants);
    registerModule(['../lib/progress', './progress', 'progress', 'lib/progress'], progress);
    registerModule(['../lib/questionFormat', './questionFormat', 'questionFormat', 'lib/questionFormat'], questionFormat);
    registerModule(['../lib/useReducedMotion', './useReducedMotion', 'useReducedMotion', 'lib/useReducedMotion'], useReducedMotion);

    const customRequire = (moduleName) => {
      if (scopeMap[moduleName]) return scopeMap[moduleName];

      const base = moduleName.split('/').pop().replace(/\.jsx?$/, '');
      if (scopeMap[base]) return scopeMap[base];

      const cleanPath = moduleName.replace(/^\.\.?\//, '').replace(/\.jsx?$/, '');
      if (scopeMap[cleanPath]) return scopeMap[cleanPath];

      // Fallback safe dummy proxy so unmapped imports/icons/helpers never crash the preview
      return createSafeDummy(base);
    };

    // 3. Evaluate transformed code
    const evaluator = new Function(
      'React',
      'require',
      'module',
      'exports',
      'useState',
      'useEffect',
      'useMemo',
      'useCallback',
      'useRef',
      'useId',
      'motion',
      'AnimatePresence',
      transpiled
    );

    evaluator(
      React,
      customRequire,
      module,
      exports,
      React.useState,
      React.useEffect,
      React.useMemo,
      React.useCallback,
      React.useRef,
      React.useId,
      FramerMotion.motion,
      FramerMotion.AnimatePresence
    );

    const ResultComponent = exports.default || module.exports.default || module.exports;

    if (!ResultComponent || typeof ResultComponent !== 'function') {
      return {
        Component: null,
        error: 'The compiled code did not export a valid React component function.',
      };
    }

    return { Component: ResultComponent, error: null };
  } catch (err) {
    return {
      Component: null,
      error: err.message || String(err),
    };
  }
}

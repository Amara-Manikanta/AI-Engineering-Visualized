import * as React from 'react';
import * as FramerMotion from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import { transform } from 'sucrase';

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

    const scopeMap = {
      react: React,
      'react/jsx-runtime': React,
      'framer-motion': FramerMotion,
      'lucide-react': safeLucide,
      'react-router-dom': ReactRouterDOM,
      '../components/GuideLayout': SandboxGuideLayout,
      './components/GuideLayout': SandboxGuideLayout,
      '../components/CodeBlock': CodeBlock,
      './components/CodeBlock': CodeBlock,
    };

    const customRequire = (moduleName) => {
      if (scopeMap[moduleName]) return scopeMap[moduleName];

      const base = moduleName.split('/').pop().replace(/\.jsx?$/, '');
      if (scopeMap[base]) return scopeMap[base];

      // If it looks like a component import, return a pass-through dummy
      return { default: ({ children }) => children || null };
    };

    // 3. Evaluate transformed code
    // Parameters available to the evaluated script:
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

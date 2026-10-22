# AI Visualised Engineering — Application Source ⚛️

This directory contains the complete source code for the **AI Visualised Engineering** interactive web platform and macOS desktop application.

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Framer Motion**, and **Electron**.

---

## ⚡ Quick Start

```bash
# Install exact dependencies
npm ci

# Start the local development server (with Hot Module Replacement)
npm run dev

# Open http://localhost:5173
```

---

## 📜 Available NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Launches local development server on `http://localhost:5173`. |
| `npm run build` | Compiles the search index and runs production Vite build into `dist/`. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs `oxlint` with zero-warning tolerance (`--deny-warnings`). |
| `npm run check` | Static content analyzer ensuring all 175 routes, internal links, TOC anchors, and quizzes are valid. |
| `npm run search:index` | Re-scans all 172 guide pages and regenerates `src/data/searchIndex.json`. |
| `npm run electron:dev` | Launches Vite dev server and hot-reloading Electron desktop window concurrently. |
| `npm run electron:build` | Packages production desktop application into `release/`. |
| `npm run electron:build:mac` | Builds macOS `.dmg` and `.zip` installer bundles for Apple Silicon. |

---

## 📁 Source Tree Architecture

```text
v2-react/
├── electron/
│   ├── main.cjs               # Electron main process (frameless window, menu, URL handling)
│   ├── preload.js             # Context isolation bridge
│   ├── icon.icns / icon.png   # Desktop application icons
├── public/
│   ├── 404.html               # GitHub Pages SPA redirect handler
│   ├── favicon.svg            # Browser tab icon
│   └── model-comparison.png   # Architectural hero preview
├── scripts/
│   ├── build-search-index.mjs # Pre-computes instant ⌘K search index
│   └── check-content.mjs      # AST verification script (runs in CI)
├── src/
│   ├── components/
│   │   ├── GlobalHeader.jsx   # Top navigation bar with multi-level dropdown menus
│   │   ├── GuideLayout.jsx    # Standard guide page layout (TOC, reading progress, breadcrumbs)
│   │   ├── Footer.jsx         # Global footer
│   │   └── VizKit.jsx         # Interactive visual lab components (Sliders, Panels, Metrics, Cards)
│   ├── config/
│   │   ├── navigation.js      # Primary curriculum navigation structure
│   │   └── pythonNavigation.js # Dedicated Python curriculum structure
│   ├── data/
│   │   ├── glossary.js        # 198 searchable AI engineering definitions
│   │   ├── quizBank.js        # Comprehensive knowledge check banks
│   │   ├── quizExtra.js       # Additional architectural quiz drills
│   │   └── searchIndex.json   # Generated fuzzy search database
│   ├── lib/
│   │   ├── pageOrder.js       # Adjacent page next/previous resolver
│   │   ├── progress.js        # LocalStorage reading progress state
│   │   └── stats.js           # Mathematical & statistical helpers for visual labs
│   ├── pages/                 # 175 interactive guides, visual labs, and AI Engineering Radar
│   │   ├── NewsletterIndex.jsx# AI Engineering Radar, Breakout 10 Deep Dives & Social Share
│   │   └── ...
│   ├── App.jsx                # Root HashRouter & lazy-loaded route manifest
│   ├── index.css              # Global styles & Tailwind CSS v4 directives
│   └── main.jsx               # Application entry point
├── package.json
└── vite.config.js             # Vite configuration with relative base support
```

---

## 🛠️ How to Add a New Educational Guide

1. **Create the Guide Component**:
   Create `src/pages/MyNewTopic.jsx` utilizing `GuideLayout`:
   ```jsx
   import React from 'react';
   import GuideLayout from '../components/GuideLayout';

   export const SEARCH_KEYWORDS = ["my topic", "concepts"];

   export default function MyNewTopic() {
     const toc = [
       { label: "Overview", hash: "overview" },
       { label: "Interactive Lab", hash: "lab" }
     ];

     return (
       <GuideLayout
         title="My New Topic"
         intro="Interactive explanation of..."
         toc={toc}
       >
         <section id="overview">...</section>
         <section id="lab">...</section>
       </GuideLayout>
     );
   }
   ```

2. **Register Route**:
   In `src/App.jsx`, add a lazy import and `<Route path="/category/my-topic" element={<MyNewTopic />} />`.

3. **Add Navigation Link**:
   In `src/config/navigation.js`, add `{ name: "My New Topic", path: "/category/my-topic" }` under the appropriate curriculum section.

4. **Verify & Build**:
   ```bash
   npm run search:index && npm run check && npm run lint && npm run build
   ```

---

## 🔒 Code Quality & CI Policy

All pull requests and pushes to `main` must pass:
1. `npx oxlint --deny-warnings` (zero lint warnings permitted).
2. `npm run check` (all 175 routes, TOC anchors, and quiz structures verified).
3. `npm run build` (search index verification & production bundle compilation).

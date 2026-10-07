# AI Visualised Engineering — site source

React 19, Vite 8, Tailwind CSS v4, framer-motion and React Router (`HashRouter`, so it works on GitHub Pages and in Electron).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Rebuilds the search index, then runs a production build into `dist/`. |
| `npm run lint` | oxlint. CI runs it with `--deny-warnings`. |
| `npm run check` | Content checks: every nav link has a route, internal links resolve, every table-of-contents entry has a matching section id, and quiz, glossary and `questions/` files parse. |
| `npm run search:index` | Regenerates `src/data/searchIndex.json`. CI fails if it is stale, so run it after changing page titles, intros, sections or `SEARCH_KEYWORDS`. |
| `npm run electron:dev` / `electron:build` | Run or package the desktop app. |

## Where things live

- `src/pages/`: one component per guide. Each guide renders inside `GuideLayout` (title, intro, contents, section sidebar, mark-as-read, previous/next) and exports `SEARCH_KEYWORDS`.
- `src/components/VizKit.jsx`: shared lab building blocks (`Panel`, `Slider`, `Metric`, `Card`, `Note`, `Section`, …). `src/lib/stats.js` has the maths helpers.
- `src/config/navigation.js`: the header menus. Menu order also sets the section sidebar and previous/next links.
- `src/App.jsx`: routes (lazy-loaded pages).
- `src/data/quizBank.js`, `quizExtra.js`: per-page knowledge checks, looked up with `questionsFor(id)`.
- `src/data/glossary.js`: glossary terms.
- `questions/*.txt`: extra question sets in a plain-text format (see `src/lib/questionFormat.js`), bundled into the Knowledge Checks page.

## Adding a guide

1. Create `src/pages/MyGuide.jsx` using `GuideLayout`, with an `id` on each section that matches its contents entry.
2. Add a lazy import and route in `src/App.jsx`, and a menu entry in `src/config/navigation.js`.
3. Optionally add a quiz to `quizExtra.js`, glossary terms, a topic-map node (`src/pages/TopicGraph.jsx`) and a learning-path step (`src/pages/RoadmapsIndex.jsx`).
4. Run `npm run search:index && npm run check && npm run lint && npm run build`.

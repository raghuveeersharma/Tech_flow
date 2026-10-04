# How Data & AI Work: An Interactive Visual Guide

An interactive, frontend-only visual guide to how data and AI work gets done. When the app opens it asks
**which domain you want to understand**. Pick one and you get a canvas showing that domain's flow, with one
running example (an order, a customer, a payment, a question...) that changes at every stage.

| Domain | You follow |
| --- | --- |
| **Data Engineering** | an e-commerce order moving through a pipeline |
| **Data Analytics** | a business question turning into a decision |
| **Data Science** | a customer going from raw row to churn prediction |
| **AI / Machine Learning** | a card payment scored by a fraud model in production |
| **Generative AI & LLMs** | a customer question answered by a RAG assistant |

Each stage is a node; click it to see what happens, how, why it matters, which tools are used and how the
record changes. Every domain has three cumulative levels (Basic / Medium / Advanced).

No backend, no API calls, no database. All content lives in local data files.

**Stack:** Vite · React 18 · @xyflow/react (React Flow) · framer-motion · Tailwind CSS 3 · lucide-react

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static bundle in ./dist
npm run preview    # serve the production build locally
npm run validate   # check every domain's data files (schema, layout, edges, sample data)
```

Requires Node 18+.

## Using the app

| Action | Result |
| --- | --- |
| Pick a domain card on the first screen | Opens that domain (link: `#/data-science`, etc.). **All domains** or the browser Back button returns to the list. |
| **Basic / Medium / Advanced** buttons | Cumulative levels (6 → 12 → 20 nodes). New nodes spring in (80 ms stagger), new edges draw in, existing nodes slide to their new positions, the view re-fits in 600 ms. |
| Click a node (or Tab to it and press Enter) | Glowing ring in the category color, other nodes dim to 60 %, connected edges light up, detail panel opens. |
| **Overview / Example data** tabs | Explanation + tools + common problems, or a before/after JSON diff of the order at that stage. |
| Click the canvas, the ✕ button, or press **Esc** | Closes the panel. |
| **Play data flow** | A packet travels the main path and each stage's example data opens for ~2 s. |

Diff colors in *Example data*: **green** = added, **yellow** = modified, **red strikethrough** = removed.

On screens narrower than 768 px the canvas goes full width, nodes show icon + short label, the detail panel
becomes a bottom sheet (60 % height) and the level buttons stay at the bottom.
`prefers-reduced-motion` disables the idle float, hover pulse and travelling particles.

## Project structure

```
src/
  App.jsx                    picker <-> workspace routing (hash based, e.g. #/ai-ml)
  main.jsx
  index.css                  Tailwind + node/edge/React Flow/picker styling
  data/
    domains/
      index.js               registry of all domains (display order)
      <domain-id>/           one folder per domain
        index.js             name, tagline, example, title, level descriptions
        categories.js        color + icon + label per category
        nodes.js             node definitions, details and the "play" paths
        edges.js             edges (with level / removedAt)
        sampleData.js        the running example and its before/after state per node
    ui.js                    every piece of UI copy (no hardcoded text in components)
    icons.js                 the icon names data files may use -> lucide components
    grid.js                  g(col,row) layout helper (310 x 170 cells)
    layout.js                panel width, sheet ratio, play timing
  components/
    DomainPicker.jsx         the "which domain?" landing screen
    Workspace.jsx            canvas + panel + level switcher for one domain
    FlowCanvas.jsx           React Flow wrapper, level transitions, fit-view
    PipelineNode.jsx         custom node (glass card, float, glow, a11y)
    AnimatedEdge.jsx         custom edge with constant-speed glowing particles
    DetailPanel.jsx          side panel / bottom sheet (role="dialog")
    SampleDataView.jsx       before/after JSON viewer with diff highlighting
    LevelSwitcher.jsx        Basic / Medium / Advanced + Play button
    Legend.jsx               category legend (top-left)
  hooks/
    useVisibleGraph.js       filters a domain's nodes/edges by level, resolves positions, mobile layout
    useMediaQuery.js
scripts/
  validate-data.mjs          npm run validate [-- <domain-id>]
```

## Editing the content

Everything you see is data:

- **Add a domain:** copy a folder in `src/data/domains/`, fill in its five files, register it in
  `src/data/domains/index.js`, then run `npm run validate -- <domain-id>`. The validator checks the schema,
  stage counts per level, overlapping nodes, orphan nodes, edges that run behind other nodes, play paths and
  that every stage's sample data really changes.
- **Add or edit a node** in the domain's `nodes.js`. `level` is the first level where it appears; `position`
  is its layout position (use `g(col,row)`), and `positionByLevel` can override it for later levels (nodes slide
  there when the level changes). Add a matching `sampleKey` entry in `sampleData.js`; omit `sampleKey` and the
  *Example data* tab is hidden automatically.
- **Add an edge** in `edges.js`. Use `removedAt` to retire an edge when a richer path replaces it.
  Handle sides are chosen automatically from the relative node positions.
- **Change colors / icons** in the domain's `categories.js` (hex colors; icon names must exist in `icons.js`).
- **Change any UI wording** in `src/data/ui.js` (shared text) or the domain's `index.js` (domain text).

## Deploy

The build is a plain static site (`dist/`), so any static host works.

**Vercel**
1. Push the repo to GitHub and import it in Vercel.
2. Framework preset: *Vite*. Build command `npm run build`, output directory `dist` (already in `vercel.json`).

**Netlify**
1. Push the repo and add it as a new site, or drag the `dist/` folder into Netlify Drop.
2. Build command `npm run build`, publish directory `dist` (already in `netlify.toml`).

**CLI**
```bash
npx vercel --prod        # or: npx netlify deploy --prod --dir=dist
```

## Accessibility notes

- Nodes are focusable buttons (`Tab`), `Enter`/`Space` opens the panel, `aria-pressed` reflects selection.
- Level and Play buttons use `aria-pressed`; the detail panel is `role="dialog"` with labelled tabs.
- Focus moves into the panel when it opens and returns to the node when it closes.
- Animations respect `prefers-reduced-motion`.

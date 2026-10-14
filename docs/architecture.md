# Architecture

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8, `@vitejs/plugin-react` |
| UI | React 18 (JavaScript, no TypeScript) |
| Canvas | `@xyflow/react` 12 (React Flow) |
| Animation | `framer-motion` 14 plus CSS keyframes and SVG SMIL |
| Styling | Tailwind CSS 3 with a small `index.css` for node/edge/React Flow styling |
| Icons | `lucide-react` (only a curated subset is imported, see `src/data/icons.js`) |
| State | `useState` / `useMemo` only, no state library |
| Hosting | Any static host (`dist/`); `vercel.json` and `netlify.toml` included |

## Folder structure

```
src/
  main.jsx                 entry; wraps App in MotionConfig reducedMotion="user"
  App.jsx                  picker <-> workspace routing (hash based)
  index.css                Tailwind layers, React Flow theme, node/edge/picker CSS, reduced motion
  data/
    domains/
      index.js             registry (display order of the picker)
      <domain-id>/         categories.js, nodes.js, edges.js, sampleData.js, index.js
    ui.js                  all shared UI copy + fill() template helper
    icons.js               allow-list of lucide icons (iconMap / getIcon)
    grid.js                g(col,row) layout helper (310 x 170 cells)
    layout.js              panel width, sheet ratio, play timing
  components/
    DomainPicker.jsx       landing screen
    Workspace.jsx          one domain: header, canvas, legend, panel, level switcher, play state
    FlowCanvas.jsx         React Flow wrapper + transition engine + fit/pan logic
    PipelineNode.jsx       custom node
    AnimatedEdge.jsx       custom edge (draw-in, particles, packet, label)
    DetailPanel.jsx        side panel / full-screen on phones
    SampleDataView.jsx     before/after diff viewer
    LevelSwitcher.jsx      Basic/Medium/Advanced + Play
    Legend.jsx             category legend
  hooks/
    useVisibleGraph.js     domain + level + viewport -> React Flow nodes/edges
    useMediaQuery.js
scripts/validate-data.mjs  data validator (npm run validate)
docs/                      this documentation
```

## Component tree

```
App
├─ DomainPicker                      (no domain in the URL hash)
└─ Workspace  key=domain.id          (a domain is selected)
   ├─ header (back button, title, subtitle)
   ├─ FlowCanvas  -> ReactFlowProvider -> ReactFlow
   │    ├─ PipelineNode (custom node type "pipeline")
   │    ├─ AnimatedEdge (custom edge type "animated")
   │    └─ Background, Controls, MiniMap
   ├─ Legend
   ├─ DetailPanel -> SampleDataView   (when a node is selected)
   └─ LevelSwitcher
```

## Data flow

```
domains/<id>/*  --(registry)-->  domain object
        │
        ▼
useVisibleGraph(domain, level, isMobile)
  • keeps nodes with level <= selected level
  • keeps edges with level <= selected and not yet removedAt
  • resolves each node position for the level (positionByLevel fallback chain)
  • transposes+compresses positions on phones
  • picks edge handle sides from relative positions
        │  { nodes, edges } (the "target" graph)
        ▼
FlowCanvas.useTransitionGraph(target)
  • keeps leaving nodes/edges mounted flagged `exiting` for 450 ms
  • assigns stagger delays to new nodes (80 ms apart) and edges
  • animates persisting nodes to new positions (700 ms)
        │  live nodes/edges
        ▼
FlowCanvas decoration (selection, dimming, highlighted edges, packet)
        │
        ▼
ReactFlow -> PipelineNode / AnimatedEdge
```

## State ownership

| State | Owner | Notes |
| --- | --- | --- |
| `domainId` | `App` | mirrors `location.hash` (`#/<id>`); `popstate` keeps it in sync |
| `level`, `selectedId`, `tab`, `playIndex` | `Workspace` | reset automatically because `Workspace` is remounted per domain |
| Rendered node/edge list, animated positions | `FlowCanvas` (`useTransitionGraph`) | derived from the target graph |
| Panel open/closed | derived: `selectedId != null` | |
| Legend open/closed, tab underline | local component state | |

`Workspace` closes the panel if the selected node is not part of the new level, and stops play mode on any manual
interaction.

## Key modules

- **`useVisibleGraph`** is pure and memoised on `[domain, level, isMobile]`. It also exports `levelIndex`, `LEVEL_IDS`
  and `NODE_SIZE`.
- **`useTransitionGraph`** (inside `FlowCanvas.jsx`) is the transition engine. All timing constants live at the top
  of that file (`EXIT_MS=450`, `SLIDE_MS=700`, `FIT_MS=600`).
- **`AnimatedEdge`** measures its path with `getTotalLength()` and sets particle duration to `length / 90` px/s so
  speed is constant across edges.
- **`DetailPanel`** receives the whole `domain` object so it can look up categories, sample data and float-field
  formatting without importing any domain directly. Components never import a specific domain.

## Build and deploy

- `npm run build` outputs `dist/` (a single JS chunk of about 836 kB, 276 kB gzipped; `chunkSizeWarningLimit` is
  raised to 900 in `vite.config.js`).
- Routing is hash based, so no server-side rewrite rules are needed.
- `vercel.json` and `netlify.toml` set the build command and output directory.

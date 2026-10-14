# Decisions, gotchas and limitations

## Design decisions

| Decision | Reason |
| --- | --- |
| Each domain is a self-contained data folder; components never import a domain | New domains need no component changes; one validator covers all |
| `Workspace` is remounted per domain (`key`) | Level, selection, tab and play state reset for free; canvas starts clean |
| Hash routing (`#/<id>`) | Works on any static host with no rewrite rules; Back button works |
| One shared layout for Medium and Advanced, Basic as a single row | Adding levels only adds nodes; existing nodes barely move, which reads as "the same diagram growing" |
| Edge handle sides derived from node positions | Authors only place nodes; edges route themselves, including in the mobile layout |
| Node sliding done in JS, not CSS | React Flow computes edge endpoints from state, so CSS-animated nodes would leave edges jumping ahead |
| Leaving nodes kept mounted for 450 ms with `exiting` | React Flow removes DOM immediately, which would skip exit animations |
| Panel overlays the canvas instead of resizing it | The canvas keeps its size; only the view pans to reveal a selected node |
| SVG SMIL `animateMotion` for particles | Constant speed along any bezier path with no per-frame JS; trivially disabled for reduced motion |
| Curated icon allow-list | Tree-shaking keeps the bundle small; the validator can reject unknown icons |
| All copy in data files | Meets the "no hardcoded text in components" rule and makes translation possible later |
| Mobile layout = transposed, compressed desktop layout | One source of layout truth; portrait screens read top to bottom |

## Gotchas found while building

- **React Flow disables pointer events on nodes** that are not selectable, draggable or clickable. The node card sets
  `pointer-events: auto` itself and handles its own click and keyboard events.
- **`getNodesBounds`** must be taken from `useReactFlow()` (`rf.getNodesBounds`), otherwise React Flow logs a console
  warning.
- **Two competing viewport changes** (a refit and a "reveal selected node" pan) cancel each other; refitting happens
  only on level or layout changes, and revealing only on selection changes.
- **Playwright cannot "stably" click a floating node** because the idle float never stops; use a forced click in tests.
- **framer-motion logs a dev-only warning** when the OS has reduced motion enabled; it is absent in production builds.
- **`pkill -f vite` can match its own shell** when run from a command containing the word "vite".

## Known limitations

- The content is illustrative. Sample numbers are plausible and internally consistent but not real measurements.
- Layouts are hand-placed. The validator checks overlaps and straight-line edge crossings, but not aesthetics.
  Data Engineering still reports 5 warnings (edges passing behind a node, one sample with 15 fields).
- In dense Advanced layouts some edges cross; on phones the Advanced diagrams are small and meant to be pinch-zoomed.
- Single JS chunk (about 836 kB, 276 kB gzipped). Per-domain lazy loading would reduce first load but the picker
  currently reads each domain's nodes for its preview.
- Automated browser checks were run ad hoc with Playwright during development; there is no test suite in the repo.
- Language is English only (though all copy is isolated in data files).
- Hash routing means deep links are not indexable as separate pages.

## Possible next steps

- Per-domain code splitting with lightweight picker metadata.
- A committed Playwright smoke test that walks every domain and level.
- Subject-matter review of the written content, especially the AI-drafted domains.
- Additional domains (for example Cybersecurity or Cloud/DevOps) using the same schema.
- Optional deep link to a node and level, such as `#/ai-ml/advanced/model_registry`.

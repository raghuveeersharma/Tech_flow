# Data model

Everything shown in the UI is data in `src/data/`. A **domain** is a folder with five files.

```
src/data/domains/<id>/
  index.js        metadata + assembles the other four
  categories.js   category -> { label, color, icon }
  nodes.js        nodes[] and playPaths
  subNodes.js     optional sub-steps per node: { nodeId: [ {id,label,shortLabel,icon,summary,whatHappens,howItHappens[],tools?,commonProblems?} ] }
  edges.js        edges[]
  sampleData.js   sampleData{} and floatFields[]
```

## Domain (`index.js` default export)

| Field | Meaning |
| --- | --- |
| `id` | URL slug (`#/<id>`), same as the folder name |
| `name`, `tagline`, `description` | picker card text |
| `icon`, `color` | picker card icon (key of `icons.js`) and accent color (`#rrggbb`) |
| `example` | "You'll follow: ..." line on the card |
| `title`, `subtitle` | workspace header |
| `sampleHeading` | heading above the before/after viewer |
| `levelDescriptions` | `{ basic, medium, advanced }` tooltips on the level buttons |
| `categories`, `nodes`, `edges`, `sampleData`, `floatFields`, `playPaths` | the content |

## Categories

```js
export const categories = {
  storage: { label: "Storage", color: "#fbbf24", icon: "HardDrive" },
};
```

Key order is the legend order. Colors must be hex (they are used in inline styles, SVG strokes and the minimap).

## Node

```js
{
  id: "ingestion",              // snake_case, unique within the domain
  level: "basic",               // first level where it appears: basic | medium | advanced
  category: "ingestion",        // key of categories
  label: "Ingestion",           // desktop label (<= 36 chars recommended)
  shortLabel: "Ingest",         // phone label (<= 12 chars)
  icon: "ArrowDownToLine",      // must exist in icons.js
  position: g(1, 1),            // layout position at its first level
  positionByLevel: { medium: g(2, 2) },   // optional, only for levels AFTER `level`
  details: {
    summary,                    // one sentence
    whatHappens,                // 2-4 sentences
    howItHappens: [],           // 3-6 steps
    whyImportant,               // 2-3 sentences
    tools: [{ name, type, note }],   // 3-5 real tools
    commonProblems: [],         // 3-4 pitfalls
  },
  sampleKey: "ingestion",       // key into sampleData; omit and the Example tab is hidden
}
```

Position resolution: for level L, use the nearest `positionByLevel` entry at or before L (walking back to the
first level), otherwise `position`. Nodes whose resolved position changes between levels slide there.

## Edge

```js
{ id: "e-source-ingestion", source: "source", target: "ingestion", level: "basic", label: "raw events", removedAt?: "medium" }
```

- `level`: first level where the edge appears (not earlier than either endpoint).
- `removedAt`: first level where it disappears, because a richer path replaces it.
- `label` shows on the edge at desktop width (<= 18 chars recommended).
- Handle sides are **not** stored: they are computed from the relative node positions (horizontal if
  `|dx| >= |dy|`, otherwise vertical).

## Sample data

```js
sampleData[sampleKey] = {
  note: "plain-language explanation of what changes",
  input:  null | { flat object },
  output: { flat object },
}
export const floatFields = ["amount"];   // integer values for these keys render as 1499.0
```

The viewer diffs `input` against `output` by top-level key: new key = green *added*, changed value = yellow
*modified*, missing key = red struck *removed*. Values should be strings, numbers, booleans, null or arrays of
primitives (nested objects are only shown as JSON). `input: null` means "this is where the record is born".

## Play paths

`playPaths = { basic: [ids], medium: [ids], advanced: [ids] }` is the ordered route of the "Play data flow" packet.
Ids must be visible at that level, with no repeats; consecutive ids should have a direct edge so the packet can
travel along it.

## Layout grid

`g(col, row)` returns `{ x: col * 310, y: row * 170 }`. Desktop node cards are 210 x 78, so a cell leaves room for
edge labels. Convention: **Basic** is a single horizontal row (same `y`); Medium and Advanced share one 2D layout of
about 6 columns x 4 rows, with basic nodes moving via `positionByLevel.medium`.

## Validator rules (`npm run validate`)

Errors (fail the command)

- Domain metadata present; icon names exist in `icons.js`; colors are hex; level descriptions present.
- At least 3 categories; each has label, hex color and valid icon.
- Node ids unique snake_case; valid level and category; `shortLabel` <= 12 chars; `positionByLevel` only for later
  levels; details complete (minimum lengths, 3-6 steps, >= 3 tools with name/type/note, >= 3 problems); `sampleKey`
  resolves.
- Counts: Basic 5-6 nodes, Medium adds 4-8, Advanced adds 4-9.
- Edges: unique ids, valid endpoints and levels, label present, `removedAt` after `level`, not before its nodes.
- Per level: no overlapping nodes, no node without an edge, Basic nodes share one `y`, play path has >= 5 visible,
  non-repeating nodes.
- Sample data: output is an object, input is null or an object, note >= 80 chars, input differs from output.

Warnings (reported, do not fail)

- Edge whose straight line passes behind another node; very wide/tall layout; long labels; two categories sharing a
  color; sample output with more than 14 fields; play hops with no direct edge; no `input: null` stage in Basic.

`npm run validate -- <id>` validates one domain, even before it is registered.

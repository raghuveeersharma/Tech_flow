# Adding or editing content

## Edit existing content

| To change | Edit |
| --- | --- |
| A stage's explanation, tools or problems | `src/data/domains/<id>/nodes.js` |
| The example record at a stage | `.../sampleData.js` |
| Which stages connect | `.../edges.js` |
| Colors, legend names | `.../categories.js` |
| Picker card or header text, level tooltips | `.../index.js` |
| Buttons, panel headings, picker copy shared by all domains | `src/data/ui.js` |
| Allowed icons | `src/data/icons.js` |

After any change run `npm run validate -- <id>`.

## Add a domain

1. **Copy** an existing folder in `src/data/domains/` (for example `ai-ml`) to `src/data/domains/<new-id>/`.
2. **`index.js`**: set `id`, `name`, `tagline`, `description`, `icon`, `color`, `example`, `title`, `subtitle`,
   `sampleHeading`, and the three `levelDescriptions`.
3. **`categories.js`**: 5-7 categories with distinct colors that read on a near-black background.
4. **`nodes.js`**:
   - Basic: 6 nodes in one row, `g(0,1)` to `g(5,1)`, as a linear chain.
   - Medium: add 5-6 nodes; move Basic nodes that need to with `positionByLevel: { medium: g(c, r) }`.
   - Advanced: add 5-7 nodes at their final cell. Medium and Advanced share one layout.
   - Write the full `details` for every node and a `sampleKey`.
   - Export `playPaths` for all three levels.
5. **`edges.js`**: Basic chain first, then Medium and Advanced edges. Use `removedAt` for Basic edges a richer path
   replaces.
6. **`sampleData.js`**: pick ONE running example; share constants and spread them so consecutive stages stay
   consistent; every stage must visibly change; the first stage uses `input: null`. Export `floatFields`.
7. **Register** it in `src/data/domains/index.js` (import and add to `domains`; array order is picker order).
8. **Validate**: `npm run validate -- <new-id>` until there are 0 errors and ideally 0 warnings.
9. **Look at it**: `npm run dev`, open the domain, step through all three levels, open a few panels, press Play.
   The validator cannot judge visual quality.

## Layout tips

- Prefer edges between neighbouring cells (horizontal or vertical); long diagonals cross other edges.
- Keep a loop or "return" edge in an otherwise empty column or row.
- Control-plane nodes (monitoring, governance, orchestration) work well on the top or bottom row.
- A long edge across an empty row is fine; across other nodes it will be reported as a warning.
- Node labels over about 36 characters or category labels over about 22 characters are truncated.

## Adding an icon

Import it from `lucide-react` in `src/data/icons.js` and add it to both the import list and `iconMap`. Icons are
imported by name (not `import *`) to keep the bundle tree-shaken.

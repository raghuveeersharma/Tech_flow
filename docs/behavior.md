# Behavior

## Navigation

- No hash: the **domain picker** is shown. `#/<domain-id>` opens that domain.
- Picking a card or pressing **All domains** uses `history.pushState`, so the browser Back/Forward buttons work.
- An unknown hash falls back to the picker.

## Levels

Three cumulative buttons below the canvas (Basic / Medium / Advanced). The active button is highlighted, has
`aria-pressed`, and shows a node-count badge ("12 nodes").

On switching **up**: new nodes spring in (scale 0.6 to 1, opacity 0 to 1) staggered by 80 ms; new edges draw in
(path length 0 to 1) after the nodes; persisting nodes slide to their new positions over 700 ms; the view refits
over 600 ms.

On switching **down**: leaving nodes and edges fade and scale out and are unmounted after 450 ms. If the selected
node leaves, the panel closes.

Rapid clicking is safe: elements are keyed by id, the slide animation is cancelled and restarted from the current
positions, and the exit timer is reset on every change.

## Selecting a node

- Click, or Tab to a node and press Enter or Space.
- The selected node gets a glowing ring in its category color; all other nodes dim to 60 % opacity; edges
  connected to it are highlighted and others fade.
- The detail panel opens (right side on desktop, full screen on phones) with a header (icon, label, category
  badge), then an **Overview** tab (what happens, how, why, tools, common problems) and an **Example data** tab
  (hidden if the node has no sample data).
- If the node would sit behind the panel, the view pans just enough to reveal it (zoom is unchanged).
- Close with the X button, a click on the canvas background, or Esc. Focus returns to the previously focused element.

## Example data viewer

Input and output blocks with a legend. Added fields are green, modified yellow, removed red with strikethrough,
unchanged dimmed. A summary line shows the counts, and a "What changed" callout explains the stage in plain
language. Long values wrap.

## Play data flow

The button steps through the domain's `playPaths[level]`. Each step selects the node, switches to the Example data
tab and moves a highlighted packet along the edge from the previous node (800 ms). A step lasts 2.2 s. It stops at
the end or on any manual action (node click, tab change, level change, close, Esc, Stop).

## Animation

| Element | Technique |
| --- | --- |
| Node entrance/exit | framer-motion spring on an outer wrapper |
| Idle float (+-3 px, 3 s) | CSS keyframes on an inner wrapper, per-node phase from a hash of the id |
| Hover pulse | CSS `drop-shadow` keyframes |
| Edge draw-in | framer-motion `pathLength` |
| Particles | SVG `<animateMotion>`; 1-3 per edge; duration = path length / 90 px/s (constant speed) |
| Play packet | `<animateMotion begin="indefinite">` started with `beginElement()` |
| Node sliding | JS interpolation of node positions (so edges follow), not CSS transitions |
| Picker spark | CSS keyframes |

`prefers-reduced-motion`: `MotionConfig reducedMotion="user"` disables transform animations; the idle float and
hover pulse are removed in CSS; particles are not rendered; node sliding jumps instead of animating.

## Responsive layout

Breakpoint: 768 px (`useMediaQuery("(max-width: 767px)")` plus Tailwind `md:`).

| | Desktop | Phone |
| --- | --- | --- |
| Node card | 210 x 78, icon + label + category | 98 x 86, icon + short label |
| Layout | landscape grid | the same layout transposed (`x' = y * 0.8`, `y' = x * 0.5`) so it reads top to bottom |
| Panel | 440 px side panel | full screen over the canvas |
| Legend | open, wraps in a pill | collapsed by default |
| Minimap | bottom-left | hidden |
| Zoom controls | vertical | horizontal |
| Level buttons | below canvas | below canvas, always visible; Play button full width |
| Edge labels | shown | hidden |

The panel body scrolls independently and the canvas never resizes when the panel opens (the panel overlays it).
After each level change the graph is fitted with extra bottom room for the minimap or controls.

## Accessibility

- Nodes are focusable `role="button"` elements with `aria-pressed` and a label including category and a hint;
  React Flow's own node focus is turned off to avoid double tab stops.
- Level buttons and Play use `aria-pressed`; the legend toggle uses `aria-expanded`.
- The panel is `role="dialog"` with `aria-labelledby`; tabs use `role="tablist"`, `tab`, `tabpanel`.
- Visible focus rings; Esc closes the panel; color is never the only signal in the diff (each row also has a
  `+`, `~` or `-` marker).
- Exiting nodes are `aria-hidden` and removed from the tab order.

## Text and content rules

Components contain no hardcoded copy. Shared strings are in `src/data/ui.js`; domain text is in each domain's files.
`fill("{count} nodes", { count })` handles templates.

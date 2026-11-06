import { useMemo } from "react";
import { NODE_SIZE } from "./useVisibleGraph";
import { fill, ui } from "../data/ui";

/** Id used on the canvas for a sub-node, so it can never clash with a top-level node id. */
export const subNodeId = (parentId, subId) => `${parentId}__${subId}`;

const PER_ROW = 4;
const CELL_W = 310;
const CELL_H = 170;

// Chain layout: left-to-right, wrapping into a snake (row 2 runs right-to-left) so edges stay short.
function chainPosition(i, count) {
  const row = Math.floor(i / PER_ROW);
  const inRow = i % PER_ROW;
  const rowLen = Math.min(PER_ROW, count - row * PER_ROW);
  const col = row % 2 === 0 ? inRow : rowLen - 1 - inRow;
  return { x: col * CELL_W, y: row * CELL_H };
}

/** Turns a sub-node definition into the same shape a top-level node has, so the detail panel can show it. */
export function toPanelNode(parent, sub, index, count) {
  return {
    id: subNodeId(parent.id, sub.id),
    category: parent.category,
    label: sub.label,
    shortLabel: sub.shortLabel,
    icon: sub.icon,
    isSub: true,
    parentLabel: parent.label,
    stepLabel: fill(ui.subSteps.stepOf, { current: index + 1, total: count }),
    details: sub,
  };
}

/** The graph shown while a node is "split": its sub-steps as a chain, same shape as useVisibleGraph's result. */
export function useSubGraph(domain, parent, isMobile) {
  return useMemo(() => {
    const subs = parent ? domain.subNodes?.[parent.id] : null;
    if (!subs?.length) return null;
    const size = isMobile ? NODE_SIZE.mobile : NODE_SIZE.desktop;
    const color = domain.categories[parent.category].color;

    const nodes = subs.map((sub, i) => {
      const base = chainPosition(i, subs.length);
      return {
        id: subNodeId(parent.id, sub.id),
        type: "pipeline",
        position: isMobile ? { x: 0, y: i * 150 } : base,
        width: size.width,
        height: size.height,
        data: {
          label: sub.label,
          shortLabel: sub.shortLabel,
          icon: sub.icon,
          category: parent.category,
          categoryLabel: fill(ui.subSteps.stepOf, { current: i + 1, total: subs.length }),
          color,
          summary: sub.summary,
        },
      };
    });

    const edges = nodes.slice(1).map((n, i) => {
      const a = nodes[i].position;
      const b = n.position;
      const horizontal = isMobile ? false : Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      const [sourceHandle, targetHandle] = horizontal
        ? b.x >= a.x ? ["s-r", "t-l"] : ["s-l", "t-r"]
        : ["s-b", "t-t"];
      return {
        id: `${nodes[i].id}->${n.id}`,
        source: nodes[i].id,
        target: n.id,
        type: "animated",
        sourceHandle,
        targetHandle,
        data: { label: undefined, color },
      };
    });

    return { nodes, edges };
  }, [domain, parent, isMobile]);
}

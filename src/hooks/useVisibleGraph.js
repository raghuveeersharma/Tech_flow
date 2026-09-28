import { useMemo } from "react";
import { ui } from "../data/ui";

export const LEVEL_IDS = ui.levels.map((l) => l.id);
export const levelIndex = (id) => LEVEL_IDS.indexOf(id);

// Rendered node size (flow units). Mobile nodes are compact: icon + short label.
export const NODE_SIZE = {
  desktop: { width: 210, height: 78 },
  mobile: { width: 98, height: 86 },
};

function resolvePosition(def, level) {
  const li = levelIndex(level);
  for (let i = li; i > 0; i--) {
    const p = def.positionByLevel?.[LEVEL_IDS[i]];
    if (p) return p;
  }
  return def.position;
}

// The desktop layout is landscape. On a portrait phone we transpose it (and compress it)
// so the same graph reads top-to-bottom instead of left-to-right.
function toMobile(p) {
  return { x: p.y * 0.8, y: p.x * 0.5 };
}

// Pick which side of each node an edge leaves/enters, based on relative position.
function pickHandles(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ["s-r", "t-l"] : ["s-l", "t-r"];
  }
  return dy >= 0 ? ["s-b", "t-t"] : ["s-t", "t-b"];
}

/**
 * Returns the nodes and edges visible at `level`, already shaped for React Flow.
 * Levels are cumulative: a node/edge is visible if its level <= selected level,
 * and an edge with `removedAt` disappears once that level is reached.
 */
export function useVisibleGraph(domain, level, isMobile) {
  return useMemo(() => {
    const { nodes: nodeDefs, edges: edgeDefs, categories } = domain;
    const li = levelIndex(level);
    const size = isMobile ? NODE_SIZE.mobile : NODE_SIZE.desktop;

    const visibleDefs = nodeDefs.filter((n) => levelIndex(n.level) <= li);
    const positions = {};

    const nodes = visibleDefs.map((def) => {
      const base = resolvePosition(def, level);
      const position = isMobile ? toMobile(base) : { x: base.x, y: base.y };
      positions[def.id] = position;
      return {
        id: def.id,
        type: "pipeline",
        position,
        width: size.width,
        height: size.height,
        data: {
          label: def.label,
          shortLabel: def.shortLabel,
          icon: def.icon,
          category: def.category,
          categoryLabel: categories[def.category].label,
          color: categories[def.category].color,
          summary: def.details.summary,
        },
      };
    });

    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

    const edges = edgeDefs
      .filter((e) => {
        if (levelIndex(e.level) > li) return false;
        if (e.removedAt && levelIndex(e.removedAt) <= li) return false;
        return positions[e.source] && positions[e.target];
      })
      .map((e) => {
        const [sourceHandle, targetHandle] = pickHandles(positions[e.source], positions[e.target]);
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "animated",
          sourceHandle,
          targetHandle,
          data: {
            label: e.label,
            color: nodeById[e.source].data.color,
          },
        };
      });

    return { nodes, edges };
  }, [domain, level, isMobile]);
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { animate, useReducedMotion } from "framer-motion";
import PipelineNode from "./PipelineNode";
import AnimatedEdge from "./AnimatedEdge";
import { ui } from "../data/ui";
import { PANEL_WIDTH, SHEET_RATIO } from "../data/layout";

const nodeTypes = { pipeline: PipelineNode };
const edgeTypes = { animated: AnimatedEdge };

const EXIT_MS = 450; // how long leaving nodes/edges stay mounted so their exit animation can play
const SLIDE_MS = 700;
const FIT_MS = 600;

const toPositionMap = (nodes) => Object.fromEntries(nodes.map((n) => [n.id, n.position]));

/**
 * Keeps nodes/edges that are leaving the graph mounted (flagged `exiting`) for a moment so they can
 * animate out, staggers the entrance of new ones and slides persisting nodes to their new positions.
 * Everything is keyed by id and cancels cleanly, so rapid level switching never leaves stale elements.
 */
function useTransitionGraph(target) {
  const reduceMotion = useReducedMotion();
  const [rendered, setRendered] = useState(() => ({
    nodes: target.nodes.map((n, i) => ({ ...n, exiting: false, enterDelay: i * 0.08 })),
    edges: target.edges.map((e, i) => ({ ...e, exiting: false, enterDelay: 0.35 + i * 0.06 })),
  }));
  const [positions, setPositions] = useState(() => toPositionMap(target.nodes));
  const posRef = useRef(positions);
  const slideRef = useRef(null);
  const exitTimer = useRef(null);

  useEffect(() => {
    // ---- 1. which elements are new / persisting / leaving ----
    setRendered((prev) => {
      const nodeIds = new Set(target.nodes.map((n) => n.id));
      const edgeIds = new Set(target.edges.map((e) => e.id));
      const prevNodes = new Map(prev.nodes.map((n) => [n.id, n]));
      const prevEdges = new Map(prev.edges.map((e) => [e.id, e]));

      let newNodeCount = 0;
      const nodes = target.nodes.map((n) => {
        const p = prevNodes.get(n.id);
        if (p && !p.exiting) return { ...n, exiting: false, enterDelay: p.enterDelay };
        return { ...n, exiting: false, enterDelay: newNodeCount++ * 0.08 };
      });
      let newEdgeCount = 0;
      const edgeBase = 0.3 + Math.min(newNodeCount, 6) * 0.04;
      const edges = target.edges.map((e) => {
        const p = prevEdges.get(e.id);
        if (p && !p.exiting) return { ...e, exiting: false, enterDelay: p.enterDelay };
        return { ...e, exiting: false, enterDelay: edgeBase + newEdgeCount++ * 0.07 };
      });

      const leavingNodes = prev.nodes.filter((n) => !nodeIds.has(n.id)).map((n) => ({ ...n, exiting: true }));
      const leavingEdges = prev.edges.filter((e) => !edgeIds.has(e.id)).map((e) => ({ ...e, exiting: true }));
      return { nodes: [...nodes, ...leavingNodes], edges: [...edges, ...leavingEdges] };
    });

    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setRendered((prev) => ({
        nodes: prev.nodes.filter((n) => !n.exiting),
        edges: prev.edges.filter((e) => !e.exiting),
      }));
    }, EXIT_MS);

    // ---- 2. slide persisting nodes to their new positions ----
    slideRef.current?.stop();
    const start = { ...posRef.current };
    const end = toPositionMap(target.nodes);
    target.nodes.forEach((n) => {
      if (!start[n.id]) start[n.id] = end[n.id]; // brand new nodes appear in place
    });
    const moving = target.nodes.some((n) => start[n.id].x !== end[n.id].x || start[n.id].y !== end[n.id].y);

    if (!moving || reduceMotion) {
      posRef.current = { ...start, ...end };
      setPositions(posRef.current);
    } else {
      slideRef.current = animate(0, 1, {
        duration: SLIDE_MS / 1000,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (t) => {
          const next = { ...start };
          target.nodes.forEach((n) => {
            const a = start[n.id];
            const b = end[n.id];
            next[n.id] = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          });
          posRef.current = next;
          setPositions(next);
        },
      });
    }
  }, [target, reduceMotion]);

  useEffect(
    () => () => {
      slideRef.current?.stop();
      clearTimeout(exitTimer.current);
    },
    [],
  );

  const nodes = useMemo(
    () => rendered.nodes.map((n) => ({ ...n, position: positions[n.id] ?? n.position })),
    [rendered.nodes, positions],
  );
  return { nodes, edges: rendered.edges };
}

function FlowCanvasInner({ graph, isMobile, selectedId, onSelect, onClose, packetEdge, panelOpen, level }) {
  const rf = useReactFlow();
  const wrapperRef = useRef(null);
  const live = useTransitionGraph(graph);

  // ---- decorate with selection state ----
  const nodes = useMemo(
    () =>
      live.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === selectedId,
          dimmed: selectedId != null && n.id !== selectedId,
          exiting: n.exiting,
          enterDelay: n.enterDelay,
          onSelect,
        },
      })),
    [live.nodes, selectedId, onSelect],
  );

  const edges = useMemo(
    () =>
      live.edges.map((e) => {
        const connected = selectedId != null && (e.source === selectedId || e.target === selectedId);
        const isPacket = packetEdge?.id === e.id;
        return {
          ...e,
          data: {
            ...e.data,
            highlighted: connected,
            dimmed: selectedId != null && !connected && !isPacket,
            exiting: e.exiting,
            enterDelay: e.enterDelay,
            packet: isPacket,
            packetKey: isPacket ? packetEdge.key : undefined,
          },
        };
      }),
    [live.edges, selectedId, packetEdge],
  );

  // Keep the latest panel state in a ref so a level change can fit the graph into the area the panel leaves free.
  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;

  // ---- fit the view (animated) after every level change / layout change ----
  useEffect(() => {
    const timer = setTimeout(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const open = panelOpenRef.current && rect;
      const right = open && !isMobile ? PANEL_WIDTH : 0;
      const bottom = open && isMobile ? Math.round(rect.height * SHEET_RATIO) : 0;
      const edge = isMobile ? 16 : 48;
      // Room under the graph for the zoom controls (phones) or the minimap (desktop) so they never cover a node.
      const controlsRoom = isMobile ? 36 : 64;
      rf.fitBounds(rf.getNodesBounds(graph.nodes), {
        duration: FIT_MS,
        padding: {
          top: `${edge + (isMobile ? 40 : 40)}px`,
          left: `${edge}px`,
          right: `${edge + right}px`,
          bottom: `${edge + bottom + controlsRoom}px`,
        },
      });
    }, 60);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, isMobile, graph]);

  // ---- when a node is selected, make sure it isn't hidden behind the panel ----
  useEffect(() => {
    if (!selectedId || !wrapperRef.current) return;
    const node = graph.nodes.find((n) => n.id === selectedId);
    if (!node) return;
    const timer = setTimeout(() => {
      const rect = wrapperRef.current.getBoundingClientRect();
      const { x, y, zoom } = rf.getViewport();
      const visibleW = rect.width - (isMobile ? 0 : PANEL_WIDTH);
      const visibleH = isMobile ? rect.height * (1 - SHEET_RATIO) : rect.height;
      const margin = 28;
      const sx = node.position.x * zoom + x;
      const sy = node.position.y * zoom + y;
      const w = node.width * zoom;
      const h = node.height * zoom;
      let nx = x;
      let ny = y;
      if (sx < margin) nx += margin - sx;
      else if (sx + w > visibleW - margin) nx -= sx + w - (visibleW - margin);
      if (sy < margin) ny += margin - sy;
      else if (sy + h > visibleH - margin) ny -= sy + h - (visibleH - margin);
      if (nx !== x || ny !== y) rf.setViewport({ x: nx, y: ny, zoom }, { duration: 500 });
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const miniMapColor = useCallback((n) => n.data.color ?? "#64748b", []);

  return (
    <div ref={wrapperRef} className="absolute inset-0" role="region" aria-label={ui.canvas.ariaLabel}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode="dark"
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        minZoom={0.15}
        maxZoom={1.6}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        onPaneClick={onClose}
        zoomOnDoubleClick={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.3} color="#334155" />
        <Controls showInteractive={false} position="bottom-left" orientation={isMobile ? "horizontal" : "vertical"} />
        <MiniMap
          position="bottom-left"
          style={{ marginLeft: 62, width: 150, height: 96 }}
          className="max-md:!hidden"
          pannable
          zoomable
          nodeColor={miniMapColor}
          nodeStrokeWidth={0}
          nodeBorderRadius={6}
          maskColor="rgba(2, 6, 23, 0.72)"
          ariaLabel={ui.canvas.miniMapLabel}
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Undo2 } from "lucide-react";
import FlowCanvas from "./FlowCanvas";
import DetailPanel from "./DetailPanel";
import LevelSwitcher from "./LevelSwitcher";
import Legend from "./Legend";
import { useVisibleGraph } from "../hooks/useVisibleGraph";
import { subNodeId, toPanelNode, useSubGraph } from "../hooks/useSubGraph";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { getIcon } from "../data/icons";
import { fill, ui } from "../data/ui";
import { PLAY_STEP_MS } from "../data/layout";

/** The canvas, panel and level switcher for ONE domain. Mounted with key={domain.id}, so state resets per domain. */
export default function Workspace({ domain, onBack }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [level, setLevel] = useState(ui.levels[0].id);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("info");
  const [playIndex, setPlayIndex] = useState(-1); // -1 = not playing

  const nodeById = useMemo(() => Object.fromEntries(domain.nodes.map((n) => [n.id, n])), [domain]);
  const [expandedId, setExpandedId] = useState(null); // node currently split into its sub-steps
  const mainGraph = useVisibleGraph(domain, level, isMobile);
  const expandedNode = expandedId ? nodeById[expandedId] : null;
  const subGraph = useSubGraph(domain, expandedNode, isMobile);
  const graph = subGraph ?? mainGraph;
  const playing = playIndex >= 0;
  const path = domain.playPaths[level];

  // A selected id is either a top-level node or (while split) one of the expanded node's sub-steps.
  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    if (subGraph) {
      const subs = domain.subNodes[expandedNode.id];
      const i = subs.findIndex((s) => subNodeId(expandedNode.id, s.id) === selectedId);
      return i >= 0 ? toPanelNode(expandedNode, subs[i], i, subs.length) : null;
    }
    return nodeById[selectedId] ?? null;
  }, [selectedId, subGraph, domain, expandedNode, nodeById]);
  const subCount = selectedNode && !selectedNode.isSub ? (domain.subNodes?.[selectedNode.id]?.length ?? 0) : 0;
  const DomainIcon = getIcon(domain.icon);

  const stopPlaying = useCallback(() => setPlayIndex(-1), []);

  const close = useCallback(() => {
    setSelectedId(null);
    setPlayIndex(-1);
  }, []);

  const select = useCallback((id) => {
    setPlayIndex(-1);
    setTab("info");
    setSelectedId(id);
  }, []);

  const expand = useCallback((id) => {
    setPlayIndex(-1);
    setSelectedId(null);
    setExpandedId(id);
  }, []);

  // Merge the sub-steps back into their node and reopen its card.
  const collapse = useCallback(() => {
    setSelectedId(expandedId);
    setExpandedId(null);
    setTab("info");
  }, [expandedId]);

  const changeLevel = useCallback((id) => {
    setPlayIndex(-1);
    setExpandedId(null);
    setLevel(id);
  }, []);

  // If the selected node is not part of the new level, close the panel.
  useEffect(() => {
    if (selectedId && !graph.nodes.some((n) => n.id === selectedId)) close();
  }, [graph, selectedId, close]);

  // Esc closes the panel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (selectedId) close();
      else if (expandedId) collapse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, collapse, selectedId, expandedId]);

  // "Play data flow": step through the path, opening each stage's example data.
  useEffect(() => {
    if (playIndex < 0) return undefined;
    setSelectedId(path[playIndex]);
    setTab("data");
    const timer = setTimeout(() => {
      setPlayIndex((i) => (i + 1 < path.length ? i + 1 : -1));
    }, PLAY_STEP_MS);
    return () => clearTimeout(timer);
  }, [playIndex, path]);

  const togglePlay = useCallback(() => {
    setExpandedId(null);
    setPlayIndex((i) => (i >= 0 ? -1 : 0));
  }, []);

  // The edge the packet is currently travelling along.
  const packetEdge = useMemo(() => {
    if (!playing || playIndex === 0) return null;
    const edge = mainGraph.edges.find((e) => e.source === path[playIndex - 1] && e.target === path[playIndex]);
    return edge ? { id: edge.id, key: `${level}-${playIndex}` } : null;
  }, [playing, playIndex, mainGraph, path, level]);

  const activeCategories = useMemo(() => [...new Set(graph.nodes.map((n) => n.data.category))], [graph]);

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-start gap-3 border-b border-white/5 px-4 py-3 md:px-8 md:py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={ui.header.backLabel}
          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 md:px-3 md:text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="max-sm:hidden">{ui.header.back}</span>
        </button>
        <div className="min-w-0">
          <h1
            className="flex items-start gap-2 text-lg font-extrabold tracking-tight md:items-center md:text-2xl"
            style={{ color: domain.color }}
          >
            <DomainIcon className="mt-0.5 h-5 w-5 shrink-0 md:mt-0 md:h-6 md:w-6" aria-hidden="true" />
            <span className="line-clamp-2 bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text leading-tight text-transparent">
              {domain.title}
            </span>
          </h1>
          <p className="mt-0.5 line-clamp-2 max-w-3xl text-[11px] leading-snug text-slate-400 md:text-sm">
            {domain.subtitle}
          </p>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <FlowCanvas
          graph={graph}
          level={level}
          isMobile={isMobile}
          selectedId={selectedId}
          onSelect={select}
          onClose={close}
          packetEdge={packetEdge}
          panelOpen={!!selectedNode}
        />
        {expandedNode && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
            <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 py-1 pl-1 pr-4 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={collapse}
                aria-label={ui.subSteps.backLabel}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 outline-none transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                {ui.subSteps.back}
              </button>
              <span className="truncate text-xs font-medium text-slate-300">
                {fill(ui.subSteps.viewing, { parent: expandedNode.label })}
              </span>
            </div>
          </div>
        )}
        <Legend
          key={isMobile ? "m" : "d"}
          categories={domain.categories}
          activeCategories={activeCategories}
          defaultOpen={!isMobile}
        />

        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              key="detail-panel"
              domain={domain}
              node={selectedNode}
              tab={tab}
              onTabChange={(t) => {
                stopPlaying();
                setTab(t);
              }}
              onClose={close}
              onExpand={() => expand(selectedNode.id)}
              subCount={subCount}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>
      </main>

      <LevelSwitcher
        level={level}
        descriptions={domain.levelDescriptions}
        onChange={changeLevel}
        nodeCount={mainGraph.nodes.length}
        playing={playing}
        playStep={playIndex + 1}
        playTotal={path.length}
        onTogglePlay={togglePlay}
      />
    </div>
  );
}

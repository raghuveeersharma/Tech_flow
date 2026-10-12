import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, Lightbulb, ListOrdered, Split, Wrench, X } from "lucide-react";
import SampleDataView from "./SampleDataView";
import { getIcon } from "../data/icons";
import { fill, ui } from "../data/ui";
import { PANEL_WIDTH } from "../data/layout";

const text = { ...ui.panel, subSteps: ui.subSteps };

function Section({ icon: Icon, title, color, children }) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Overview({ node, color }) {
  const { details } = node;
  return (
    <div className="space-y-6">
      <Section icon={Info} title={text.sections.what} color={color}>
        <p className="text-sm leading-relaxed text-slate-300">{details.whatHappens}</p>
      </Section>

      <Section icon={ListOrdered} title={text.sections.how} color={color}>
        <ol className="space-y-2">
          {details.howItHappens.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-300">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: `${color}26`, color }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {details.whyImportant && (
        <Section icon={Lightbulb} title={text.sections.why} color={color}>
          <p className="text-sm leading-relaxed text-slate-300">{details.whyImportant}</p>
        </Section>
      )}

      {details.tools?.length > 0 && (
      <Section icon={Wrench} title={text.sections.tools} color={color}>
        <ul className="grid gap-2">
          {details.tools.map((tool) => (
            <li key={tool.name} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-slate-100">{tool.name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: `${color}22`, color }}
                >
                  {tool.type}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{tool.note}</p>
            </li>
          ))}
        </ul>
      </Section>
      )}

      {details.commonProblems?.length > 0 && (
      <Section icon={AlertTriangle} title={text.sections.problems} color={color}>
        <ul className="space-y-1.5">
          {details.commonProblems.map((problem) => (
            <li key={problem} className="flex gap-2 text-sm leading-relaxed text-slate-300">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/80" />
              <span>{problem}</span>
            </li>
          ))}
        </ul>
      </Section>
      )}
    </div>
  );
}

function SubStepsAction({ count, color, onExpand }) {
  const has = count > 0;
  return (
    <div className="shrink-0 px-5 pb-3">
      <button
        type="button"
        disabled={!has}
        onClick={onExpand}
        aria-describedby="substeps-note"
        className="flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-sky-400 enabled:hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          borderColor: has ? `${color}66` : "rgba(255,255,255,0.1)",
          background: has ? `${color}1f` : "rgba(255,255,255,0.03)",
          color: has ? color : "#94a3b8",
        }}
      >
        <Split className="h-4 w-4" aria-hidden="true" />
        {has ? fill(text.subSteps.button, { count }) : ui.subSteps.disabledButton}
      </button>
      <p id="substeps-note" className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
        {!has && <Info className="h-3 w-3 shrink-0" aria-hidden="true" />}
        {has ? ui.subSteps.hint : ui.subSteps.none}
      </p>
    </div>
  );
}

export default function DetailPanel({ domain, node, tab, onTabChange, onClose, onExpand, subCount = 0, isMobile }) {
  const panelRef = useRef(null);
  const category = domain.categories[node.category];
  const color = category.color;
  const Icon = getIcon(node.icon);
  const sample = !node.isSub && node.sampleKey ? domain.sampleData[node.sampleKey] : null;
  const activeTab = sample ? tab : "info";
  const titleId = `panel-title-${node.id}`;

  // Move focus into the dialog when it opens and give it back to the node when it closes.
  useEffect(() => {
    const previous = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, []);

  const tabs = sample ? ["info", "data"] : [];

  return (
    <motion.aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="absolute z-20 flex flex-col overflow-hidden border-white/10 bg-slate-900/90 shadow-2xl shadow-black/50 outline-none backdrop-blur-xl max-md:inset-0 md:bottom-0 md:right-0 md:top-0 md:border-l"
      style={isMobile ? undefined : { width: PANEL_WIDTH, maxWidth: "100%" }}
      initial={isMobile ? { y: "100%" } : { x: "100%" }}
      animate={{ x: 0, y: 0 }}
      exit={isMobile ? { y: "100%" } : { x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
    >
      {/* accent line in the category color */}
      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <header className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}22`, color }}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-lg font-bold leading-tight text-slate-50">
            {node.label}
          </h2>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: `${color}22`, color }}
          >
            {node.isSub ? node.stepLabel : category.label}
          </span>
          {node.isSub && <p className="mt-1 text-[11px] text-slate-500">{fill(ui.subSteps.partOf, { parent: node.parentLabel })}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={text.close}
          className="-mr-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <p className="shrink-0 px-5 pb-3 text-sm text-slate-400">{node.details.summary}</p>

      {!node.isSub && <SubStepsAction count={subCount} color={color} onExpand={onExpand} />}

      {tabs.length > 0 && (
        <div role="tablist" aria-label={text.tablistLabel} className="flex shrink-0 gap-1 border-b border-white/10 px-4">
          {tabs.map((id) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls="panel-body"
                onClick={() => onTabChange(id)}
                className="relative px-3 pb-2.5 pt-1 text-sm font-medium outline-none transition focus-visible:text-white"
                style={{ color: selected ? color : "#94a3b8" }}
              >
                {text.tabs[id]}
                {selected && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                    style={{ background: color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* The body scrolls on its own; the canvas behind never changes size. */}
      <div
        id="panel-body"
        role={tabs.length ? "tabpanel" : undefined}
        aria-labelledby={tabs.length ? `tab-${activeTab}` : undefined}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${node.id}-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "data" && sample ? (
              <SampleDataView
                sample={sample}
                color={color}
                floatFields={domain.floatFields}
                heading={domain.sampleHeading}
              />
            ) : (
              <Overview node={node} color={color} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

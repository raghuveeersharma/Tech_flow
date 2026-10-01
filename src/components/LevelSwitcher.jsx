import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import { fill, ui } from "../data/ui";

export default function LevelSwitcher({ level, descriptions, onChange, nodeCount, playing, playStep, playTotal, onTogglePlay }) {
  return (
    <div className="shrink-0 border-t border-white/10 bg-slate-950/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={ui.levelSwitcher.groupLabel} className="flex flex-1 gap-1.5 rounded-2xl bg-white/[0.04] p-1 md:flex-none">
          {ui.levels.map((l) => {
            const active = l.id === level;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={active}
                title={descriptions[l.id]}
                onClick={() => onChange(l.id)}
                className={`relative flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 md:flex-none md:px-5 ${active ? "flex-[1.8]" : "flex-1"}`}
                style={{ color: active ? "#f8fafc" : "#94a3b8" }}
              >
                {active && (
                  <motion.span
                    layoutId="level-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/40 to-violet-500/40 ring-1 ring-sky-300/40"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
                {active && (
                  <motion.span
                    key={nodeCount}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold"
                  >
                    {fill(ui.levelSwitcher.nodeCount, { count: nodeCount })}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={playing}
          title={ui.play.hint}
          className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 outline-none transition hover:bg-emerald-400/20 focus-visible:ring-2 focus-visible:ring-emerald-300 max-md:w-full max-md:justify-center"
        >
          {playing ? <Square className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          <span>{playing ? ui.play.stop : ui.play.start}</span>
          {playing && (
            <span className="text-xs font-normal text-emerald-300/80" aria-live="polite">
              {fill(ui.play.status, { current: playStep, total: playTotal })}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getIcon } from "../data/icons";
import { domains } from "../data/domains";
import { levelIndex } from "../hooks/useVisibleGraph";
import { fill, ui } from "../data/ui";

const text = ui.picker;

// Number of stages visible at each (cumulative) level.
const stageCounts = (domain) =>
  ui.levels.map((l) => domain.nodes.filter((n) => levelIndex(n.level) <= levelIndex(l.id)).length);

// A tiny preview of the basic flow: one dot per stage, colored by category, with a travelling spark.
function FlowPreview({ domain }) {
  const stages = domain.nodes.filter((n) => n.level === ui.levels[0].id);
  return (
    <div className="relative flex items-center justify-between px-1 py-2" aria-hidden="true">
      <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-white/10" />
      <span
        className="preview-spark absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
        style={{ background: domain.color, boxShadow: `0 0 10px 2px ${domain.color}` }}
      />
      {stages.map((n) => {
        const color = domain.categories[n.category].color;
        return (
          <span
            key={n.id}
            className="relative h-3.5 w-3.5 rounded-md ring-2 ring-slate-900"
            style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
          />
        );
      })}
    </div>
  );
}

export default function DomainPicker({ onPick }) {
  return (
    <div className="picker-bg h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-5 py-10 md:px-8 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/80">{text.eyebrow}</p>
          <h1 className="mt-3 bg-gradient-to-r from-sky-300 via-emerald-300 to-violet-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-5xl">
            {text.heading}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 md:text-base">{text.subtitle}</p>
        </motion.header>

        <ul className="mt-10 flex flex-wrap justify-center gap-4 md:mt-14">
          {domains.map((domain, i) => {
            const Icon = getIcon(domain.icon);
            const counts = stageCounts(domain);
            return (
              <motion.li
                key={domain.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.15 + i * 0.08 }}
                className="flex w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
              >
                <motion.button
                  type="button"
                  onClick={() => onPick(domain.id)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.985 }}
                  className="domain-card group flex w-full flex-col gap-4 rounded-3xl p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{ "--c": domain.color, "--c-glow": `${domain.color}55` }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: `${domain.color}22`, color: domain.color }}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold leading-tight text-slate-50">{domain.name}</h2>
                      <p className="mt-1 text-sm leading-snug text-slate-400">{domain.tagline}</p>
                    </div>
                  </div>

                  <p className="text-[13px] leading-relaxed text-slate-300">{domain.description}</p>

                  <FlowPreview domain={domain} />

                  <div className="mt-auto space-y-3">
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider" style={{ color: domain.color }}>
                        {text.follow}
                      </span>
                      <span className="text-slate-500"> · </span>
                      {domain.example}
                    </p>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <ul className="flex flex-wrap gap-1" aria-label={text.levelsLabel}>
                        {ui.levels.map((l, idx) => (
                          <li
                            key={l.id}
                            className="whitespace-nowrap rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-slate-300"
                            title={fill(text.stages, { count: counts[idx] })}
                          >
                            {l.label} <span style={{ color: domain.color }}>{counts[idx]}</span>
                          </li>
                        ))}
                      </ul>
                      <span
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
                        style={{ color: domain.color }}
                      >
                        {text.explore}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-xs text-slate-500">{text.footer}</p>
      </div>
    </div>
  );
}

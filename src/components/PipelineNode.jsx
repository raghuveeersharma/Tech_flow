import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { getIcon } from "../data/icons";
import { ui } from "../data/ui";

const SIDES = [
  ["r", Position.Right],
  ["l", Position.Left],
  ["t", Position.Top],
  ["b", Position.Bottom],
];

const hiddenHandle = { opacity: 0, pointerEvents: "none", width: 1, height: 1, minWidth: 0, minHeight: 0 };

// Deterministic "random" phase so every node floats out of sync with the others.
function floatPhase(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 3000;
  return h;
}

function PipelineNode({ id, data }) {
  const color = data.color;
  const Icon = getIcon(data.icon);
  const { selected, dimmed, exiting, enterDelay = 0, onSelect } = data;

  const activate = () => {
    if (!exiting) onSelect(id);
  };

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={exiting ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
      transition={
        exiting
          ? { duration: 0.3, ease: "easeIn" }
          : { type: "spring", stiffness: 260, damping: 20, delay: enterDelay }
      }
      aria-hidden={exiting || undefined}
    >
      <div className="node-float h-full w-full" style={{ animationDelay: `-${floatPhase(id)}ms` }}>
        <div
          role="button"
          tabIndex={exiting ? -1 : 0}
          aria-pressed={!!selected}
          aria-label={`${data.label}. ${data.categoryLabel}. ${ui.canvas.nodeHint}`}
          onClick={activate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activate();
            }
          }}
          className="node-card flex h-full w-full cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2 max-md:flex-col max-md:justify-center max-md:gap-1 max-md:px-1.5"
          style={{
            "--c": color,
            "--c-glow": `${color}88`,
            opacity: dimmed ? 0.6 : 1,
          }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl max-md:h-9 max-md:w-9"
            style={{ background: `${color}22`, color }}
          >
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </span>

          {/* Desktop: full label + category. Mobile: icon + short label. */}
          <span className="min-w-0 flex-1 max-md:hidden">
            <span className="line-clamp-2 block text-[13px] font-semibold leading-tight text-slate-100">{data.label}</span>
            <span
              className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-wider"
              style={{ color }}
            >
              {data.categoryLabel}
            </span>
          </span>
          <span className="hidden max-w-full truncate text-center text-[11px] font-semibold leading-tight text-slate-100 max-md:block">
            {data.shortLabel}
          </span>
        </div>
      </div>

      {SIDES.map(([key, position]) => (
        <Handle key={`s-${key}`} id={`s-${key}`} type="source" position={position} isConnectable={false} style={hiddenHandle} />
      ))}
      {SIDES.map(([key, position]) => (
        <Handle key={`t-${key}`} id={`t-${key}`} type="target" position={position} isConnectable={false} style={hiddenHandle} />
      ))}
    </motion.div>
  );
}

export default memo(PipelineNode);

import { ArrowDown, Sparkles } from "lucide-react";
import { fill, ui } from "../data/ui";

const text = ui.sampleView;

const STATUS_STYLE = {
  added: {
    row: "border-emerald-400 bg-emerald-400/10 text-emerald-200",
    mark: "+",
  },
  modified: {
    row: "border-amber-300 bg-amber-300/10 text-amber-100",
    mark: "~",
  },
  removed: {
    row: "border-red-400 bg-red-400/10 text-red-300",
    mark: "−",
    strike: true,
  },
  unchanged: {
    row: "border-transparent text-slate-400",
    mark: " ",
  },
};

function formatValue(key, value, floatFields) {
  if (typeof value === "number" && Number.isInteger(value) && floatFields.includes(key)) {
    return value.toFixed(1);
  }
  if (Array.isArray(value)) return `[${value.map((v) => JSON.stringify(v)).join(", ")}]`;
  return JSON.stringify(value);
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function buildRows(input, output) {
  const inputRows = Object.keys(input ?? {}).map((key) => ({
    key,
    value: input[key],
    status: !(key in output) ? "removed" : same(input[key], output[key]) ? "unchanged" : "modified",
  }));
  const outputRows = Object.keys(output).map((key) => ({
    key,
    value: output[key],
    status: !input || !(key in input) ? "added" : same(input[key], output[key]) ? "unchanged" : "modified",
  }));
  return { inputRows, outputRows };
}

function Block({ title, rows, color, floatFields }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
      <div
        className="border-b border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {title}
      </div>
      <div className="overflow-x-auto py-1.5 font-mono text-[12px] leading-relaxed">
        <div className="px-3 text-slate-500">{"{"}</div>
        {rows.map((row) => {
          const style = STATUS_STYLE[row.status];
          return (
            <div
              key={row.key}
              data-status={row.status}
              className={`flex gap-2 whitespace-nowrap border-l-2 py-px pl-2.5 pr-3 ${style.row}`}
            >
              <span aria-hidden="true" className="w-3 shrink-0 select-none text-center font-bold">
                {style.mark}
              </span>
              <span className={style.strike ? "line-through decoration-red-400/80" : ""}>
                <span className="opacity-80">&quot;{row.key}&quot;</span>
                <span className="text-slate-500">: </span>
                <span>{formatValue(row.key, row.value, floatFields)}</span>
              </span>
            </div>
          );
        })}
        <div className="px-3 text-slate-500">{"}"}</div>
      </div>
    </div>
  );
}

export default function SampleDataView({ sample, color, floatFields = [], heading }) {
  const { inputRows, outputRows } = buildRows(sample.input, sample.output);
  const added = outputRows.filter((r) => r.status === "added").length;
  const modified = outputRows.filter((r) => r.status === "modified").length;
  const removed = inputRows.filter((r) => r.status === "removed").length;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">{heading}</h3>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400" aria-label={text.whatChanged}>
        {["added", "modified", "removed", "unchanged"].map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 rounded-sm border-l-2 ${STATUS_STYLE[status].row}`}
              style={status === "unchanged" ? { background: "#334155" } : undefined}
            />
            {text.legend[status]}
          </li>
        ))}
      </ul>

      {sample.input ? (
        <Block title={text.input} rows={inputRows} color="#94a3b8" floatFields={floatFields} />
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-xs text-slate-400">
          {text.noInput}
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ArrowDown className="h-4 w-4" style={{ color }} aria-hidden="true" />
        <span>{fill(text.summary, { added, modified, removed })}</span>
      </div>

      <Block title={text.output} rows={outputRows} color={color} floatFields={floatFields} />

      {sample.note && (
        <div
          className="flex gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] leading-relaxed text-slate-300"
          style={{ borderColor: `${color}55`, background: `${color}12` }}
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden="true" />
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
              {text.whatChanged}
            </div>
            {sample.note}
          </div>
        </div>
      )}
    </div>
  );
}

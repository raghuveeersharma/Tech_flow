import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ui } from "../data/ui";

export default function Legend({ categories, activeCategories, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const items = Object.keys(categories).filter((id) => activeCategories.includes(id));

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-slate-900/75 text-xs shadow-lg backdrop-blur-md md:max-w-[760px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? ui.legend.hide : ui.legend.show}
          className="flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {ui.legend.title}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden="true" />
        </button>
        {open && (
          <ul className="contents">
            {items.map((id) => {
              const c = categories[id];
              return (
                <li key={id} className="flex items-center gap-1.5 text-slate-300">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.color, boxShadow: `0 0 8px ${c.color}99` }}
                  />
                  {c.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

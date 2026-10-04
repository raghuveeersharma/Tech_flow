// Color + icon + label for every node category in this domain.
// The key order is the order shown in the legend.
// Colors are plain hex so they can be used in inline styles, SVG strokes and the MiniMap.
export const categories = {
  data: { label: "Data & Features", color: "#38bdf8", icon: "Database" }, // sky
  training: { label: "Training & Experiments", color: "#a78bfa", icon: "FlaskConical" }, // violet
  validation: { label: "Evaluation & Registry", color: "#fbbf24", icon: "BadgeCheck" }, // amber
  serving: { label: "Serving & Release", color: "#34d399", icon: "Rocket" }, // emerald
  monitoring: { label: "Monitoring & Feedback", color: "#fb7185", icon: "Activity" }, // rose
  automation: { label: "Automation & CI/CD", color: "#22d3ee", icon: "Workflow" }, // cyan
  responsible: { label: "Responsible AI", color: "#f472b6", icon: "ShieldCheck" }, // pink
};

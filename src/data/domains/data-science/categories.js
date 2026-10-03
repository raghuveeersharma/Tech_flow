// Color + icon + label for every node category in this domain.
// The key order is the order shown in the legend.
// Colors are plain hex so they can be used in inline styles, SVG strokes and the MiniMap.
export const categories = {
  problem: { label: "Problem & Question", color: "#38bdf8", icon: "Compass" }, // sky
  data: { label: "Data", color: "#34d399", icon: "Database" }, // emerald
  explore: { label: "Exploration & Features", color: "#fbbf24", icon: "Microscope" }, // amber
  modeling: { label: "Modelling", color: "#a78bfa", icon: "BrainCircuit" }, // violet
  evaluation: { label: "Evaluation & Trust", color: "#fb7185", icon: "ShieldCheck" }, // rose
  decision: { label: "Causal & Decisions", color: "#f472b6", icon: "Target" }, // pink
  delivery: { label: "Delivery & Monitoring", color: "#fb923c", icon: "Rocket" }, // orange
};

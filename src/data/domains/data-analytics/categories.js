// Color + icon + label for every node category in this domain.
// The key order is the order shown in the legend.
// Colors are plain hex so they can be used in inline styles, SVG strokes and the MiniMap.
export const categories = {
  framing: { label: "Framing", color: "#a3e635", icon: "Target" }, // lime
  data: { label: "Data Access & Prep", color: "#38bdf8", icon: "Database" }, // sky
  analysis: { label: "Analysis", color: "#a78bfa", icon: "Microscope" }, // violet
  experiment: { label: "Experimentation", color: "#fbbf24", icon: "FlaskConical" }, // amber
  communication: { label: "Communication", color: "#f472b6", icon: "BarChart3" }, // pink
  monitoring: { label: "Forecast & Monitor", color: "#22d3ee", icon: "Siren" }, // cyan
  decision: { label: "Decision & Action", color: "#fb923c", icon: "Handshake" }, // orange
};

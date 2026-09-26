// Color + icon + label for every node category in this domain.
// The key order is the order shown in the legend.
// Colors are plain hex so they can be used in inline styles, SVG strokes and the MiniMap.
export const categories = {
  source: { label: "Source", color: "#38bdf8", icon: "Database" }, // sky
  ingestion: { label: "Ingestion", color: "#34d399", icon: "ArrowDownToLine" }, // emerald
  storage: { label: "Storage", color: "#fbbf24", icon: "HardDrive" }, // amber
  processing: { label: "Processing", color: "#a78bfa", icon: "Cog" }, // violet
  quality: { label: "Quality & Monitoring", color: "#fb7185", icon: "ShieldCheck" }, // rose
  orchestration: { label: "Orchestration", color: "#22d3ee", icon: "Workflow" }, // cyan
  serving: { label: "Serving", color: "#f472b6", icon: "BarChart3" }, // pink
  governance: { label: "Governance", color: "#818cf8", icon: "Lock" }, // slate / indigo
  ml: { label: "Machine Learning", color: "#fb923c", icon: "BrainCircuit" }, // orange
};

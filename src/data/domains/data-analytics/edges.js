// Edge schema:
// { id, source, target, level, label, removedAt? }
//   level     - first level at which the edge appears
//   removedAt - optional: first level at which the edge disappears (it is replaced by a richer path)
export const edges = [
  // ---------- BASIC ----------
  {
    id: "e-business_question-data_extraction",
    source: "business_question",
    target: "data_extraction",
    level: "basic",
    removedAt: "medium",
    label: "scoped question",
  },
  { id: "e-data_extraction-data_cleaning", source: "data_extraction", target: "data_cleaning", level: "basic", label: "raw rows" },
  { id: "e-data_cleaning-exploration", source: "data_cleaning", target: "exploration", level: "basic", label: "tidy table" },
  {
    id: "e-exploration-analysis",
    source: "exploration",
    target: "analysis",
    level: "basic",
    removedAt: "medium",
    label: "hypotheses",
  },
  { id: "e-analysis-visualization", source: "analysis", target: "visualization", level: "basic", label: "key numbers" },

  // ---------- MEDIUM ----------
  { id: "e-business_question-kpi_definitions", source: "business_question", target: "kpi_definitions", level: "medium", label: "metric to define" },
  {
    id: "e-kpi_definitions-data_extraction",
    source: "kpi_definitions",
    target: "data_extraction",
    level: "medium",
    removedAt: "advanced",
    label: "agreed definition",
  },
  { id: "e-exploration-segmentation", source: "exploration", target: "segmentation", level: "medium", label: "slice the data" },
  { id: "e-segmentation-analysis", source: "segmentation", target: "analysis", level: "medium", label: "segment results" },
  { id: "e-analysis-ab_testing", source: "analysis", target: "ab_testing", level: "medium", label: "fix to test" },
  { id: "e-ab_testing-visualization", source: "ab_testing", target: "visualization", level: "medium", label: "lift result" },
  { id: "e-visualization-dashboard_automation", source: "visualization", target: "dashboard_automation", level: "medium", label: "automate refresh" },
  { id: "e-visualization-storytelling", source: "visualization", target: "storytelling", level: "medium", label: "chart + insight" },
  { id: "e-storytelling-decision_review", source: "storytelling", target: "decision_review", level: "medium", label: "recommendation" },

  // ---------- ADVANCED ----------
  { id: "e-kpi_definitions-semantic_layer", source: "kpi_definitions", target: "semantic_layer", level: "advanced", label: "publish metric" },
  { id: "e-semantic_layer-data_extraction", source: "semantic_layer", target: "data_extraction", level: "advanced", label: "governed metrics" },
  { id: "e-segmentation-root_cause", source: "segmentation", target: "root_cause", level: "advanced", label: "suspect slice" },
  { id: "e-root_cause-ab_testing", source: "root_cause", target: "ab_testing", level: "advanced", label: "cause to fix" },
  { id: "e-experimentation_platform-ab_testing", source: "experimentation_platform", target: "ab_testing", level: "advanced", label: "random assignment" },
  { id: "e-dashboard_automation-forecasting", source: "dashboard_automation", target: "forecasting", level: "advanced", label: "metric history" },
  { id: "e-dashboard_automation-anomaly_alerts", source: "dashboard_automation", target: "anomaly_alerts", level: "advanced", label: "live metrics" },
  { id: "e-forecasting-anomaly_alerts", source: "forecasting", target: "anomaly_alerts", level: "advanced", label: "expected range" },
  { id: "e-anomaly_alerts-decision_automation", source: "anomaly_alerts", target: "decision_automation", level: "advanced", label: "alert fires" },
  { id: "e-decision_review-decision_automation", source: "decision_review", target: "decision_automation", level: "advanced", label: "approved playbook" },
];

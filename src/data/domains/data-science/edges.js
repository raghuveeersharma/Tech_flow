// Edge schema:
// { id, source, target, level, label, removedAt? }
//   level     - first level at which the edge appears
//   removedAt - optional: first level at which the edge disappears (it is replaced by a richer path)
export const edges = [
  // ---------- BASIC ----------
  { id: "e-problem_framing-data_collection", source: "problem_framing", target: "data_collection", level: "basic", label: "data needed" },
  { id: "e-data_collection-cleaning", source: "data_collection", target: "cleaning", level: "basic", label: "raw table" },
  { id: "e-cleaning-eda", source: "cleaning", target: "eda", level: "basic", label: "clean table" },
  {
    id: "e-eda-model_training",
    source: "eda",
    target: "model_training",
    level: "basic",
    removedAt: "medium",
    label: "ready to model",
  },
  {
    id: "e-model_training-evaluation",
    source: "model_training",
    target: "evaluation",
    level: "basic",
    removedAt: "medium",
    label: "predictions",
  },

  // ---------- MEDIUM ----------
  { id: "e-eda-feature_engineering", source: "eda", target: "feature_engineering", level: "medium", label: "feature ideas" },
  { id: "e-feature_engineering-data_split", source: "feature_engineering", target: "data_split", level: "medium", label: "feature matrix" },
  { id: "e-data_split-model_training", source: "data_split", target: "model_training", level: "medium", label: "training set" },
  { id: "e-model_training-tuning", source: "model_training", target: "tuning", level: "medium", label: "baseline model" },
  { id: "e-tuning-evaluation", source: "tuning", target: "evaluation", level: "medium", label: "best model" },
  { id: "e-evaluation-interpretation", source: "evaluation", target: "interpretation", level: "medium", label: "test results" },
  { id: "e-interpretation-communication", source: "interpretation", target: "communication", level: "medium", label: "explanations" },
  { id: "e-model_training-experiment_tracking", source: "model_training", target: "experiment_tracking", level: "medium", label: "log params" },
  { id: "e-tuning-experiment_tracking", source: "tuning", target: "experiment_tracking", level: "medium", label: "log every trial" },
  { id: "e-evaluation-experiment_tracking", source: "evaluation", target: "experiment_tracking", level: "medium", label: "log metrics" },

  // ---------- ADVANCED ----------
  { id: "e-eda-causal_inference", source: "eda", target: "causal_inference", level: "advanced", label: "hypotheses" },
  { id: "e-interpretation-causal_inference", source: "interpretation", target: "causal_inference", level: "advanced", label: "drivers to test" },
  { id: "e-causal_inference-uplift_modeling", source: "causal_inference", target: "uplift_modeling", level: "advanced", label: "effect estimates" },
  { id: "e-uplift_modeling-communication", source: "uplift_modeling", target: "communication", level: "advanced", label: "who to target" },
  { id: "e-cleaning-forecasting", source: "cleaning", target: "forecasting", level: "advanced", label: "monthly counts" },
  { id: "e-forecasting-communication", source: "forecasting", target: "communication", level: "advanced", label: "volume outlook" },
  { id: "e-interpretation-fairness_audit", source: "interpretation", target: "fairness_audit", level: "advanced", label: "scores by group" },
  { id: "e-fairness_audit-communication", source: "fairness_audit", target: "communication", level: "advanced", label: "bias findings" },
  { id: "e-communication-production_handoff", source: "communication", target: "production_handoff", level: "advanced", label: "approved model" },
  { id: "e-production_handoff-monitoring", source: "production_handoff", target: "monitoring", level: "advanced", label: "live scoring" },
  { id: "e-monitoring-problem_framing", source: "monitoring", target: "problem_framing", level: "advanced", label: "reopen question" },
];

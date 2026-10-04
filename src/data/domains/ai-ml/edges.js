// Edge schema:
// { id, source, target, level, label, removedAt? }
//   level     - first level at which the edge appears
//   removedAt - optional: first level at which the edge disappears (it is replaced by a richer path)
export const edges = [
  // ---------- BASIC ----------
  { id: "e-data_labeling-data_prep", source: "data_labeling", target: "data_prep", level: "basic", label: "labeled rows" },
  {
    id: "e-data_prep-training",
    source: "data_prep",
    target: "training",
    level: "basic",
    removedAt: "medium",
    label: "clean dataset",
  },
  { id: "e-training-evaluation", source: "training", target: "evaluation", level: "basic", label: "trained model" },
  {
    id: "e-evaluation-deployment",
    source: "evaluation",
    target: "deployment",
    level: "basic",
    removedAt: "medium",
    label: "approved model",
  },
  { id: "e-deployment-monitoring", source: "deployment", target: "monitoring", level: "basic", label: "prediction logs" },

  // ---------- MEDIUM ----------
  { id: "e-data_prep-feature_store", source: "data_prep", target: "feature_store", level: "medium", label: "clean rows" },
  {
    id: "e-feature_store-training",
    source: "feature_store",
    target: "training",
    level: "medium",
    label: "training features",
  },
  {
    id: "e-training-experiment_tracking",
    source: "training",
    target: "experiment_tracking",
    level: "medium",
    label: "params & metrics",
  },
  {
    id: "e-experiment_tracking-model_registry",
    source: "experiment_tracking",
    target: "model_registry",
    level: "medium",
    label: "best run",
  },
  { id: "e-evaluation-model_registry", source: "evaluation", target: "model_registry", level: "medium", label: "passing model" },
  {
    id: "e-model_registry-cicd",
    source: "model_registry",
    target: "cicd",
    level: "medium",
    removedAt: "advanced",
    label: "release candidate",
  },
  {
    id: "e-cicd-deployment",
    source: "cicd",
    target: "deployment",
    level: "medium",
    removedAt: "advanced",
    label: "container image",
  },
  {
    id: "e-feature_store-batch_inference",
    source: "feature_store",
    target: "batch_inference",
    level: "medium",
    label: "offline features",
  },
  { id: "e-batch_inference-monitoring", source: "batch_inference", target: "monitoring", level: "medium", label: "score logs" },
  {
    id: "e-monitoring-drift_detection",
    source: "monitoring",
    target: "drift_detection",
    level: "medium",
    label: "live feature stats",
  },

  // ---------- ADVANCED ----------
  { id: "e-automl_hpo-training", source: "automl_hpo", target: "training", level: "advanced", label: "trial settings" },
  {
    id: "e-training-distributed_training",
    source: "training",
    target: "distributed_training",
    level: "advanced",
    label: "scale out",
  },
  {
    id: "e-distributed_training-evaluation",
    source: "distributed_training",
    target: "evaluation",
    level: "advanced",
    label: "trained weights",
  },
  { id: "e-model_registry-governance", source: "model_registry", target: "governance", level: "advanced", label: "model card" },
  { id: "e-governance-cicd", source: "governance", target: "cicd", level: "advanced", label: "approved release" },
  { id: "e-cicd-safe_rollout", source: "cicd", target: "safe_rollout", level: "advanced", label: "staged release" },
  { id: "e-safe_rollout-deployment", source: "safe_rollout", target: "deployment", level: "advanced", label: "winning version" },
  {
    id: "e-deployment-explainability",
    source: "deployment",
    target: "explainability",
    level: "advanced",
    label: "score + features",
  },
  {
    id: "e-explainability-governance",
    source: "explainability",
    target: "governance",
    level: "advanced",
    label: "reason evidence",
  },
  { id: "e-drift_detection-retraining", source: "drift_detection", target: "retraining", level: "advanced", label: "drift alert" },
  { id: "e-retraining-data_labeling", source: "retraining", target: "data_labeling", level: "advanced", label: "fresh labels" },
  { id: "e-model_registry-edge_deploy", source: "model_registry", target: "edge_deploy", level: "advanced", label: "ONNX export" },
];

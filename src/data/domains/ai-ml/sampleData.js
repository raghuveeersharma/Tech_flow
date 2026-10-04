// One card payment (T-90431) followed through the ML lifecycle, with a before/after state for every stage.
// The viewer diffs `input` against `output` (top level keys) and highlights:
//   green = added, yellow = modified, red strike = removed.
// Objects change shape on purpose: a payment becomes a training row, a training run, a registry entry,
// a prediction request/response and finally a metrics summary.

// ---- shared constants so consecutive stages stay consistent ----
const DATASET = "txn-2026-10@v14";
const MODEL = "fraud-detector";
const MODEL_VERSION = `${MODEL}:7`;
const ARTIFACT = "s3://ml-artifacts/fraud/run-4821/model.json";
const HYPERPARAMS = "max_depth=6, lr=0.08, trees=400";

// ---- 1. the payment, captured and labeled ----
const labeled = {
  txn_id: "T-90431",
  amount: 249.99,
  currency: "USD",
  mcc: "5732",
  card_country: "US",
  ip_country: "br",
  device_id: "dev_7f3a",
  ts: "2026-10-14T02:14:09Z",
  is_fraud: 1,
  label_source: "chargeback",
  labeled_at: "2026-11-02",
};

// ---- 2. cleaned, validated and assigned to a split ----
const prepared = {
  txn_id: "T-90431",
  amount: 249.99,
  merchant_cat: "electronics",
  card_country: "US",
  ip_country: "BR",
  device_id: "dev_7f3a",
  ts: "2026-10-14T02:14:09Z",
  is_fraud: 1,
  split: "train",
  dataset_version: DATASET,
  dq_status: "passed",
};

// ---- 3. turned into model features (the values the model actually reads) ----
const featureRow = {
  txn_id: "T-90431",
  is_fraud: 1,
  split: "train",
  dataset_version: DATASET,
  amount: 249.99,
  merchant_cat: "electronics",
  hour_utc: 2,
  is_foreign_ip: 1,
  device_age_days: 0,
  txns_last_1h: 4,
  amount_vs_avg_30d: 6.2,
  feature_view: "txn_features_v3",
};

// ---- 4. a training run ----
const trainRun = {
  run_id: "run-4821",
  dataset_version: DATASET,
  model_type: "xgboost",
  hyperparams: HYPERPARAMS,
  train_auc: 0.986,
  status: "trained",
  artifact: ARTIFACT,
};

// ---- 5. the same run after evaluation on the held-out test set ----
const evaluated = {
  ...trainRun,
  status: "evaluated",
  test_auc: 0.972,
  precision: 0.91,
  recall: 0.78,
  decision_threshold: 0.85,
  verdict: "beats production model (AUC 0.961)",
};

// ---- 6. the registered version ----
const registered = {
  model_name: MODEL,
  version: 7,
  run_id: "run-4821",
  dataset_version: DATASET,
  model_type: "xgboost",
  test_auc: 0.972,
  precision: 0.91,
  recall: 0.78,
  decision_threshold: 0.85,
  artifact: ARTIFACT,
  alias: "candidate",
};

// ---- 7. a live prediction request and its response ----
const request = {
  txn_id: "T-90431",
  amount: 249.99,
  merchant_cat: "electronics",
  hour_utc: 2,
  is_foreign_ip: 1,
  device_age_days: 0,
  txns_last_1h: 4,
  amount_vs_avg_30d: 6.2,
};

const response = {
  ...request,
  fraud_score: 0.91,
  decision: "DECLINE",
  model_version: MODEL_VERSION,
  latency_ms: 23,
};

const predictionLog = {
  txn_id: "T-90431",
  fraud_score: 0.91,
  decision: "DECLINE",
  model_version: MODEL_VERSION,
  latency_ms: 23,
};

// Fields that should always render with a decimal point (e.g. 250 -> 250.0)
export const floatFields = ["amount", "amount_vs_avg_30d", "size_mb"];

export const sampleData = {
  // ===================== BASIC =====================
  data_labeling: {
    note: "A card payment is captured by the checkout system. About three weeks later the bank's chargeback report confirms that the cardholder never made it, so the row gains a label (is_fraud = 1) and a note of where the label came from. That label turns a plain log line into a training example.",
    input: null,
    output: labeled,
  },

  data_prep: {
    note: "The labeled row is cleaned and frozen into dataset version txn-2026-10@v14. Merchant code 5732 becomes the readable group 'electronics', the lower-case country 'br' from the geo-IP lookup is fixed to 'BR', the data checks pass and the row is assigned to the training split. Columns the model must never see, such as the label source and label date, are dropped so they cannot leak the answer.",
    input: labeled,
    output: prepared,
  },

  training: {
    note: "The payment is now just one of roughly 96 million training rows. After 400 boosted trees it has left no trace of its own, only a tiny nudge in the model's rules. What comes out is a run record: the settings used, the dataset version, a training AUC of 0.986 and a pointer to the saved model file.",
    input: {
      txn_id: "T-90431",
      split: "train",
      is_fraud: 1,
      dataset_version: DATASET,
      feature_count: 7,
    },
    output: trainRun,
  },

  evaluation: {
    note: "The trained model is scored on a frozen test set it has never seen. Test AUC is 0.972, a little below the training AUC, which is normal. At the 0.85 decline threshold precision is 0.91 and recall is 0.78. That beats the production model (AUC 0.961), so the run passes the quality gate.",
    input: trainRun,
    output: evaluated,
  },

  deployment: {
    note: "The model is now live behind an endpoint. To keep one story we replay the features of T-90431 as if the payment were arriving right now. The model returns a fraud score of 0.91 in 23 ms, and because that is above the 0.85 decline threshold the checkout receives the decision DECLINE plus the model version that made it.",
    input: request,
    output: response,
  },

  monitoring: {
    note: "Monitoring never looks at a single payment: T-90431 disappears into an hourly summary. Between 10:00 and 11:00 UTC the model served 48,210 requests with a p95 latency of 41 ms, declined 1.1% of payments and raised no alert. This healthy baseline is what later hours and days are compared against.",
    input: predictionLog,
    output: {
      window: "2026-11-06 10:00-11:00 UTC",
      model_version: MODEL_VERSION,
      requests: 48210,
      p95_latency_ms: 41,
      error_rate: 0.0004,
      avg_fraud_score: 0.043,
      decline_rate: 0.011,
      review_rate: 0.034,
      alert: "none",
    },
  },

  // ===================== MEDIUM =====================
  feature_store: {
    note: "The feature store turns the cleaned payment into the values the model actually reads, using only facts known at 02:14 UTC. It adds how many payments this card made in the last hour (4), how large this one is versus the card's 30-day average (6.2 times), the device's age (0 days) and a foreign-IP flag. It also records which feature view produced them.",
    input: prepared,
    output: featureRow,
  },

  experiment_tracking: {
    note: "The training run is logged on the tracking server with everything needed to reproduce it: the Git commit of the code (a3f9c1e), the dataset version and the settings. The server also ranks it against the team's other experiments, showing this was the best of 14 runs.",
    input: trainRun,
    output: {
      ...trainRun,
      status: "logged",
      experiment: "fraud-detection",
      git_commit: "a3f9c1e",
      rank: "1 of 14 runs",
    },
  },

  model_registry: {
    note: "The run that passed evaluation is registered as version 7 of the model 'fraud-detector'. The registry keeps a trimmed record that links back to the source run and dataset, stores the test metrics and threshold, and tags the version with the alias 'candidate' until it is approved for release.",
    input: evaluated,
    output: registered,
  },

  cicd: {
    note: "A release pipeline picks up the candidate, runs 42 automated tests, checks the AUC gate and builds a container image tagged with the model version. The raw artifact path is replaced by an image, and the release is marked ready to deploy to the production target.",
    input: {
      model_name: MODEL,
      version: 7,
      run_id: "run-4821",
      test_auc: 0.972,
      artifact: ARTIFACT,
      alias: "candidate",
    },
    output: {
      model_name: MODEL,
      version: 7,
      run_id: "run-4821",
      test_auc: 0.972,
      alias: "candidate",
      image: "registry.acme.ai/fraud-detector:7",
      pipeline_run: "ci-5532",
      checks_passed: ["schema check", "unit tests 42/42", "AUC gate >= 0.95", "latency under 50 ms"],
      deploy_target: "prod-us-east",
      release_status: "ready to deploy",
    },
  },

  batch_inference: {
    note: "Overnight, a batch job re-scores a whole day of payments, here the day of T-90431, using historical features from the offline store. The same model and features give the same score as the live endpoint (0.91), and the row is written to a table with a risk band so analysts can work through the riskiest payments first.",
    input: {
      txn_id: "T-90431",
      amount: 249.99,
      amount_vs_avg_30d: 6.2,
      txns_last_1h: 4,
      device_age_days: 0,
      is_foreign_ip: 1,
    },
    output: {
      txn_id: "T-90431",
      amount: 249.99,
      amount_vs_avg_30d: 6.2,
      txns_last_1h: 4,
      device_age_days: 0,
      is_foreign_ip: 1,
      model_version: MODEL_VERSION,
      batch_job: "rescore-2026-10-14",
      fraud_score: 0.91,
      risk_band: "high",
      written_to: "warehouse.fraud_scores",
    },
  },

  drift_detection: {
    note: "Three weeks after launch, on Black Friday, shoppers make far more payments per hour. The drift check compares live data with the training data: txns_last_1h averages 1.9 instead of 0.8, which gives a Population Stability Index (PSI) of 0.31. That is above the common 0.25 alarm level, so an alert is raised.",
    input: {
      model_version: MODEL_VERSION,
      feature: "txns_last_1h",
      reference_window: "training data (Oct 2026)",
      current_window: "2026-11-27 (Black Friday)",
      reference_mean: 0.8,
      current_mean: 1.9,
    },
    output: {
      model_version: MODEL_VERSION,
      feature: "txns_last_1h",
      reference_window: "training data (Oct 2026)",
      current_window: "2026-11-27 (Black Friday)",
      reference_mean: 0.8,
      current_mean: 1.9,
      psi: 0.31,
      drift_status: "DRIFT",
      other_drifting_features: ["amount", "hour_utc"],
      alert: "page ml-oncall",
    },
  },

  // ===================== ADVANCED =====================
  automl_hpo: {
    note: "Instead of guessing settings by hand, a search study runs 60 trials of XGBoost with different depths, learning rates and tree counts. Trial 41 gives the best validation AUC (0.973), and its settings are exactly the ones used in the training run.",
    input: {
      study: "fraud-hpo-17",
      model_type: "xgboost",
      metric: "val_auc",
      search_space: "max_depth 3-10, lr 0.01-0.3, trees 100-800",
      trial_budget: 60,
    },
    output: {
      study: "fraud-hpo-17",
      model_type: "xgboost",
      metric: "val_auc",
      search_space: "max_depth 3-10, lr 0.01-0.3, trees 100-800",
      trials_run: 60,
      best_trial: 41,
      best_params: HYPERPARAMS,
      best_val_auc: 0.973,
    },
  },

  distributed_training: {
    note: "The training job is spread over 8 GPUs, each reading its own 12-million-row slice of the 96 million training rows. The run that took 210 minutes on one 16-core CPU machine now finishes in 18 minutes, and model quality (train AUC 0.986) is unchanged.",
    input: {
      run_id: "run-4821",
      dataset_version: DATASET,
      model_type: "xgboost",
      workers: 1,
      device: "16-core CPU",
      train_minutes: 210,
    },
    output: {
      run_id: "run-4821",
      dataset_version: DATASET,
      model_type: "xgboost",
      workers: 8,
      device: "8x A100 GPU",
      train_minutes: 18,
      rows_per_worker: 12000000,
      train_auc: 0.986,
    },
  },

  safe_rollout: {
    note: "Version 7 is released in stages. In shadow mode it silently scored T-90431 at 0.91 while the current champion, version 6, gave only 0.62 (REVIEW). The canary now sends 5% of live traffic to version 7, and the early A/B result shows it catches 8% more fraud, so the next step is to ramp up.",
    input: {
      model_name: MODEL,
      candidate_version: 7,
      champion_version: 6,
      mode: "idle",
      candidate_traffic_pct: 0,
    },
    output: {
      model_name: MODEL,
      candidate_version: 7,
      champion_version: 6,
      mode: "canary",
      candidate_traffic_pct: 5,
      shadow_days: 2,
      example_txn: "T-90431",
      champion_score: 0.62,
      candidate_score: 0.91,
      ab_verdict: "v7 catches 8% more fraud",
      next_step: "ramp to 25%",
    },
  },

  explainability: {
    note: "The decline needs a reason. SHAP splits the score into a contribution per feature, starting from the model's average (-4.7 in log-odds, about 0.9% fraud) and adding the biggest pushes: foreign IP, a brand-new device, four payments in an hour and an unusually large amount. With +0.2 from smaller features the total is +2.3, which is a probability of 0.91.",
    input: {
      txn_id: "T-90431",
      fraud_score: 0.91,
      decision: "DECLINE",
      model_version: MODEL_VERSION,
    },
    output: {
      txn_id: "T-90431",
      fraud_score: 0.91,
      decision: "DECLINE",
      model_version: MODEL_VERSION,
      base_value: -4.7,
      top_reasons: [
        "is_foreign_ip=1 (+2.4)",
        "device_age_days=0 (+2.0)",
        "txns_last_1h=4 (+1.5)",
        "amount_vs_avg_30d=6.2 (+0.9)",
      ],
      reason_code: "NEW_DEVICE_FOREIGN_IP",
    },
  },

  governance: {
    note: "Before release, version 7 goes through a review. The record attaches a model card, shows that the false-positive-rate gap between regions is 1.2 points against an allowed limit of 2.0, confirms no personal data is used as a feature, and stores the approval with an audit id so the decision can be traced later.",
    input: {
      model_name: MODEL,
      version: 7,
      test_auc: 0.972,
      alias: "candidate",
    },
    output: {
      model_name: MODEL,
      version: 7,
      test_auc: 0.972,
      alias: "candidate",
      model_card: "cards/fraud-detector-v7.md",
      fpr_gap_by_region: "1.2 pts (limit 2.0)",
      pii_features: "none",
      approval: "approved by model risk team",
      audit_id: "GOV-2026-114",
    },
  },

  retraining: {
    note: "The drift alert starts the retraining pipeline on its own. It builds dataset txn-2026-11@v15 from the latest labeled payments and trains a candidate (version 8). Both models are tested on the new data: version 7 has slipped to AUC 0.941 while version 8 reaches 0.967, so the candidate is sent to a canary release.",
    input: {
      model_version: MODEL_VERSION,
      feature: "txns_last_1h",
      psi: 0.31,
      drift_status: "DRIFT",
    },
    output: {
      pipeline_run: "retrain-2026-11-28",
      trigger: "PSI 0.31 > 0.25 on txns_last_1h",
      model_version: MODEL_VERSION,
      new_dataset_version: "txn-2026-11@v15",
      candidate_version: 8,
      current_auc_new_data: 0.941,
      candidate_auc_new_data: 0.967,
      next_step: "start canary for version 8",
    },
  },

  edge_deploy: {
    note: "The registered model is exported to the ONNX format and shrunk from 14.2 MB to 2.1 MB so it fits on a card terminal. It now scores locally in 4 ms with no network call, and a parity check confirms its scores match the server model's to within 0.0003.",
    input: {
      model_name: MODEL,
      version: 7,
      format: "xgboost json",
      size_mb: 14.2,
      runtime: "server (Python)",
    },
    output: {
      model_name: MODEL,
      version: 7,
      format: "onnx",
      size_mb: 2.1,
      runtime: "ONNX Runtime",
      target: "card terminals + Android app",
      local_latency_ms: 4,
      parity_max_diff: 0.0003,
    },
  },
};

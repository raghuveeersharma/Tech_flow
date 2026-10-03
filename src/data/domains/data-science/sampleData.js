// One customer (C-20817) and one question ("will they churn in the next 30 days?"), with a before/after state
// for every stage of the data science workflow.
// The viewer diffs `input` against `output` (top level keys) and highlights:
//   green = added, yellow = modified, red strike = removed.
// `note` explains the change in plain language.
// Some stages work on the whole population or on the model rather than on the single customer
// (EDA segment, tuning, forecasting ...); those samples say so in their note.

// ---- the record as it moves through the workflow (kept as constants so stages stay consistent) ----
const problemSpec = {
  customer_id: "C-20817",
  question: "Will this customer cancel in the next 30 days?",
  target: "churned_30d",
  decision: "Retention call before renewal",
  success_metric: "Recall >= 0.70 at precision >= 0.50",
  baseline_churn_rate: 0.26,
  snapshot_date: "2026-08-31",
  sources: ["crm", "billing", "usage_logs", "support_desk"],
};

const collectionRequest = {
  customer_id: "C-20817",
  snapshot_date: "2026-08-31",
  sources: ["crm", "billing", "usage_logs", "support_desk"],
};

// Raw: text numbers, day-first dates, inconsistent case, MB units, a missing age.
const rawRow = {
  customer_id: "C-20817",
  snapshot_date: "2026-08-31",
  signup_date: "12/02/2024",
  contract: "month-to-month",
  internet_service: "fiber optic",
  monthly_charges: "$89.90",
  data_used: "59800 MB",
  support_calls_90d: "4",
  age: null,
  churned_30d: "Yes",
};

// Clean: typed, standardised, tenure derived, age imputed with the median and flagged.
const cleanedRow = {
  customer_id: "C-20817",
  tenure_months: 30,
  contract: "Month-to-month",
  internet_service: "Fiber optic",
  monthly_charges: 89.9,
  data_used_gb: 58.4,
  support_calls_90d: 4,
  age: 41,
  age_imputed: true,
  churned_30d: 1,
};

// EDA adds what we learned about the customer's segment.
const exploredRow = {
  ...cleanedRow,
  segment: "Month-to-month + Fiber optic",
  segment_churn_rate: 0.47,
};

// Feature engineering: numeric columns only, plus the label. Target-derived columns are dropped.
const featureVector = {
  customer_id: "C-20817",
  tenure_months: 30,
  monthly_charges: 89.9,
  data_used_gb: 58.4,
  support_calls_90d: 4,
  age: 41,
  contract_month_to_month: 1,
  internet_fiber_optic: 1,
  charges_per_gb: 1.54,
  high_support_calls: 1,
  churned_30d: 1,
};

const splitRow = { ...featureVector, split: "test" };

// The customer, waiting for a model (this is a held-out test row).
const waitingForModel = {
  customer_id: "C-20817",
  split: "test",
  churned_30d: 1,
  model: null,
  churn_probability: null,
};

const scored = {
  customer_id: "C-20817",
  split: "test",
  churned_30d: 1,
  model: "XGBClassifier",
  n_train_rows: 5040,
  churn_probability: 0.81,
};

const evaluated = {
  ...scored,
  predicted_churn: 1,
  outcome: "true positive",
  test_auc: 0.86,
  precision: 0.6,
  recall: 0.73,
  f1: 0.66,
};

const drivers = [
  "contract_month_to_month = 1: +0.82",
  "support_calls_90d = 4: +0.74",
  "monthly_charges = 89.9: +0.41",
  "internet_fiber_optic = 1: +0.33",
];

const defaultParams = {
  model: "XGBClassifier",
  learning_rate: 0.3,
  max_depth: 6,
  n_estimators: 100,
  cv_auc: 0.851,
};

const tunedParams = {
  model: "XGBClassifier",
  learning_rate: 0.05,
  max_depth: 4,
  n_estimators: 300,
  cv_auc: 0.868,
};

// Fields that should always render with a decimal point (e.g. 90 -> 90.0)
export const floatFields = ["monthly_charges", "data_used_gb", "annual_value_at_risk", "churn_probability", "baseline_churn_rate"];

export const sampleData = {
  problem_framing: {
    note: "The vague worry 'we are losing customers' becomes a precise, answerable question. It now has a definition of the target (cancels within 30 days of the snapshot date), the decision it supports, a success bar to clear and the sources needed. Our running example is customer C-20817.",
    input: null,
    output: problemSpec,
  },

  data_collection: {
    note: "A SQL query joins the CRM, billing, usage and support systems for customer C-20817 as of the snapshot date, and attaches the outcome from the cancellations table. The request is replaced by one raw row, still messy: amounts are text, the date is day-first, the age is missing. In total 7,200 customers were pulled this way.",
    input: collectionRequest,
    output: rawRow,
  },

  cleaning: {
    note: "Text becomes numbers ('$89.90' to 89.9, 'Yes' to 1), the day-first date 12/02/2024 becomes a tenure of 30 months at the snapshot date, 59,800 MB becomes 58.4 GB and the spellings are standardised. The missing age is filled with the median (41) and flagged so the model knows it was a guess.",
    input: rawRow,
    output: cleanedRow,
  },

  eda: {
    note: "Exploration places the customer in context. Across all 7,200 customers 26% churn, but month-to-month fiber customers like C-20817 churn 47% of the time, and customers with three or more support calls churn 41% versus 19% for the rest. These are hypotheses to model, not conclusions.",
    input: cleanedRow,
    output: exploredRow,
  },

  feature_engineering: {
    note: "Categories become 0/1 columns (contract_month_to_month, internet_fiber_optic) and domain knowledge adds charges_per_gb (89.9 / 58.4 = 1.54) and a high_support_calls flag. The segment churn rate is dropped on purpose: it was computed from the answer and would leak it to the model.",
    input: exploredRow,
    output: featureVector,
  },

  data_split: {
    note: "Each customer is randomly assigned to train (70%), validation (15%) or test (15%), keeping about 26% churners in every part. C-20817 lands in the test set, so the model will never learn from this row and its outcome stays locked away until the final evaluation.",
    input: featureVector,
    output: splitRow,
  },

  model_training: {
    note: "XGBoost learns from the 5,040 training customers and then scores the held-out row for C-20817. The nine feature values go in as numbers and the model returns a churn probability of 0.81. The model never saw this customer while learning.",
    input: waitingForModel,
    output: scored,
  },

  tuning: {
    note: "This stage works on the model, not on a single customer. Forty Optuna trials with 5-fold cross-validation replace the default settings with a slower, shallower and larger ensemble (learning rate 0.05, depth 4, 300 trees), lifting the cross-validated AUC from 0.851 to 0.868.",
    input: { ...defaultParams, trials: 0 },
    output: { ...tunedParams, trials: 40 },
  },

  experiment_tracking: {
    note: "The tuned run is saved to the tracking server. The settings and score stay the same, but the run now gets an id, the git commit of the code, the version of the dataset and a stage label, so the result can be reproduced and compared with every other run later.",
    input: tunedParams,
    output: {
      ...tunedParams,
      run_id: "run_7f3a2c",
      experiment: "churn-30d",
      git_commit: "a91c4e2",
      data_version: "customers_v7",
      stage: "candidate",
    },
  },

  evaluation: {
    note: "On the 1,080 test customers (281 real churners) the model flags 342 customers and 205 of them truly leave: precision 0.60 and recall 0.73, with an AUC of 0.86. That clears the target set during framing. C-20817 (score 0.81, above the 0.50 threshold, really churned) is a true positive.",
    input: scored,
    output: evaluated,
  },

  interpretation: {
    note: "SHAP splits the 0.81 score into feature contributions (in log-odds units). Starting from the average prediction (-1.05), the month-to-month contract adds 0.82 and the four support calls add 0.74, while a tenure of 30 months pulls the risk down by 0.22. The pieces sum to the model's output.",
    input: { customer_id: "C-20817", model: "XGBClassifier", churn_probability: 0.81 },
    output: {
      customer_id: "C-20817",
      model: "XGBClassifier",
      churn_probability: 0.81,
      shap_base_value: -1.05,
      top_drivers: drivers,
      protective_factors: ["tenure_months = 30: -0.22"],
      shap_other_features: 0.42,
    },
  },

  communication: {
    note: "The technical output is translated for the retention team. The probability becomes a risk tier, the SHAP drivers become one plain sentence, and a concrete action and the money at stake (12 x 89.9 in yearly charges) are added. The business gets a decision, not a chart.",
    input: {
      customer_id: "C-20817",
      churn_probability: 0.81,
      top_drivers: drivers,
    },
    output: {
      customer_id: "C-20817",
      churn_probability: 0.81,
      risk_tier: "High",
      reason: "Month-to-month contract and 4 support calls in 90 days",
      action: "Retention call within 7 days with a contract-upgrade offer",
      audience: "Retention team",
      annual_value_at_risk: 1078.8,
    },
  },

  causal_inference: {
    note: "This stage works on a population question. Customers with 3 or more support calls churn 22 points more often than the rest, but they also differ in tenure, plan and price. After adjusting for those confounders the effect shrinks to 9 points, and a placebo test supports it. C-20817 (4 calls) is in the treated group.",
    input: {
      treatment: "support_calls_90d >= 3",
      outcome: "churned_30d",
      naive_effect: 0.22,
      adjusted_effect: null,
      confounders: [],
    },
    output: {
      treatment: "support_calls_90d >= 3",
      outcome: "churned_30d",
      naive_effect: 0.22,
      adjusted_effect: 0.09,
      ci_95: "0.05 to 0.13",
      confounders: ["tenure_months", "monthly_charges", "internet_service"],
      refutation: "placebo test passed",
    },
  },

  uplift_modeling: {
    note: "A randomised A/B test of the 12-month-contract offer trains a model that predicts churn with and without the offer. For C-20817 the risk would fall from 0.81 to 0.62, an uplift of 0.19, which makes the customer a persuadable worth the cost of the offer.",
    input: { customer_id: "C-20817", churn_probability: 0.81 },
    output: {
      customer_id: "C-20817",
      churn_probability: 0.81,
      churn_probability_if_offered: 0.62,
      uplift: 0.19,
      segment: "persuadable",
      recommended_offer: "12-month contract, 10% off",
    },
  },

  forecasting: {
    note: "This stage works on monthly totals instead of one customer. Twenty-four months of renewal-window churn counts feed a seasonal SARIMAX model, which predicts about 4,820 churners next month with an 80% range of 4,430 to 5,210. That is roughly 26% of the 18,500 customers up for renewal.",
    input: {
      metric: "renewal_window_churners_per_month",
      history_months: 24,
      last_month: 4610,
    },
    output: {
      metric: "renewal_window_churners_per_month",
      history_months: 24,
      last_month: 4610,
      forecast_next_month: 4820,
      interval_80: "4430 to 5210",
      method: "SARIMAX (1,1,1)(1,1,0,12)",
      backtest_mape: 0.042,
    },
  },

  fairness_audit: {
    note: "Audited by age band, the model catches 76% of churners aged under 65 (C-20817 is 41) but only 58% of customers aged 65 and over, a gap of 18 points against a tolerance of 5. A fairness-constrained retrain shrinks the gap to 4 points while overall recall stays near 0.73.",
    input: {
      attribute: "age_band",
      recall_under_65: 0.76,
      recall_65_plus: 0.58,
      recall_gap: 0.18,
      status: "fail",
      mitigation: null,
    },
    output: {
      attribute: "age_band",
      recall_under_65: 0.74,
      recall_65_plus: 0.7,
      recall_gap: 0.04,
      status: "pass",
      mitigation: "Fairlearn ExponentiatedGradient (equalized odds)",
    },
  },

  production_handoff: {
    note: "The approved run is registered as version 3 of the churn model, packaged with its feature code and promoted from candidate to production. It now scores renewal-window customers every night and answers single requests at a documented endpoint in about 38 ms (95th percentile).",
    input: {
      run_id: "run_7f3a2c",
      model: "XGBClassifier",
      test_auc: 0.86,
      registry_version: null,
      stage: "candidate",
    },
    output: {
      run_id: "run_7f3a2c",
      model: "XGBClassifier",
      test_auc: 0.86,
      registry_name: "churn-30d",
      registry_version: 3,
      stage: "production",
      endpoint: "POST /v1/churn/score",
      p95_latency_ms: 38,
    },
  },

  monitoring: {
    note: "Ten weeks after launch a price change shifts the distribution of monthly charges (PSI jumps from 0.04 to 0.31, above the 0.25 alarm line) and live recall, measured as 30-day outcomes arrive, falls from 0.73 to 0.64. The status turns to alert and a retraining run is requested, which restarts the cycle at the question.",
    input: {
      model_version: 3,
      weeks_since_launch: 1,
      psi_monthly_charges: 0.04,
      live_recall: 0.73,
      status: "healthy",
      action: "none",
    },
    output: {
      model_version: 3,
      weeks_since_launch: 10,
      psi_monthly_charges: 0.31,
      live_recall: 0.64,
      status: "alert",
      action: "retrain on latest 12 months",
    },
  },
};

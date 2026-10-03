// One running example: "Why did weekly revenue in Indore drop?", with a before/after state for every stage.
// The viewer diffs `input` against `output` (top level keys) and highlights:
//   green = added, yellow = modified, red strike = removed.
// `note` explains the change in plain language.
//
// The numbers tell ONE story and add up:
//   week 2026-W43 (19-25 Oct): 8,000 orders x INR 155 = INR 12,40,000
//   week 2026-W44 (26 Oct-1 Nov): 6,400 orders x INR 155 = INR 9,92,000  (down INR 2,48,000 = 20.0%)
//   Android orders 4,000 -> 2,400 (down 40.0%), iOS and web unchanged, Android sessions flat at 40,000
//   Android app v5.1 converts 10.0% of sessions, v5.2 (released 27 Oct, half of sessions) converts 2.0%
//   -> 20,000 x 10.0% + 20,000 x 2.0% = 2,400 Android orders in W44

// ---- the question and its metric definition ----
const question = {
  request: "Why did weekly revenue in Indore drop?",
  asked_by: "Regional sales manager",
  city: "Indore",
  metric: "revenue",
  period: "2026-W44",
  compare_to: "2026-W43",
  decision: "Fix the cause or pause Indore ad spend",
};

const defined = {
  ...question,
  metric: "net_revenue_inr",
  metric_formula: "SUM(amount) of delivered orders",
  excludes: "cancelled, refunded, test orders",
  week_rule: "Mon to Sun, IST",
  owner: "Finance analytics",
};

// ---- the extract and the cleaned table ----
const extracted = {
  city: "Indore",
  weeks: "2026-W43 and 2026-W44",
  source_table: "warehouse.orders",
  filter: "LOWER(city) = 'indore' AND iso_week IN (43, 44)",
  rows: 14962,
  amount_format: "text",
  city_spellings: 3,
  null_platform: 214,
};

const cleaned = {
  ...extracted,
  source_table: "scratch.orders_indore_clean",
  rows: 14400,
  amount_format: "number",
  city_spellings: 1,
  null_platform: 0,
  duplicates_removed: 180,
  test_orders_removed: 60,
  undelivered_removed: 322,
};

// ---- what exploration and analysis find ----
const finding = {
  source_table: "scratch.orders_indore_clean",
  rows: 14400,
  revenue_w43: 1240000,
  revenue_w44: 992000,
  orders_w43: 8000,
  orders_w44: 6400,
  avg_order_value_inr: 155,
  drop_started: "2026-10-27",
  pattern: "Orders fell, order value stayed flat",
  hypothesis: "Something stopped some customers from ordering",
};

const weeklyTotals = {
  revenue_w43: 1240000,
  revenue_w44: 992000,
  orders_w43: 8000,
  orders_w44: 6400,
};

const result = {
  ...weeklyTotals,
  revenue_change_inr: -248000,
  revenue_change_pct: -20.0,
  orders_effect_inr: -248000,
  basket_effect_inr: 0,
  normal_weekly_swing_pct: 4.0,
  android_orders_change_pct: -40.0,
  android_share_of_drop_pct: 100.0,
};

// ---- the chart and the story ----
const chart = {
  revenue_change_pct: -20.0,
  android_orders_change_pct: -40.0,
  android_share_of_drop_pct: 100.0,
  chart_type: "line: daily orders by platform",
  title: "Android orders fell 40% after the 27 Oct release",
  annotation: "App v5.2 released 27 Oct",
  insight: "All of the ₹2.48 lakh drop comes from Android",
  audience: "Regional sales manager",
};

const recommendation = "Ship the v5.2.1 payment fix to all Android users";

// Fields that should always render with a decimal point (e.g. 1240000 -> 1240000.0, 4 -> 4.0)
export const floatFields = [
  "revenue_w43",
  "revenue_w44",
  "revenue_change_inr",
  "orders_effect_inr",
  "basket_effect_inr",
  "avg_order_value_inr",
  "revenue_change_pct",
  "normal_weekly_swing_pct",
  "android_orders_change_pct",
  "android_share_of_drop_pct",
  "android_sessions_change_pct",
  "android_v51_conv_pct",
  "android_v52_conv_pct",
  "android_v52_session_share_pct",
  "ios_orders_change_pct",
  "web_orders_change_pct",
  "control_conv_pct",
  "variant_conv_pct",
  "lift_pp",
  "payment_success_v51_pct",
  "payment_success_v52_pct",
  "last_actual",
  "forecast_no_fix",
  "forecast_with_fix",
  "forecast_range_pct",
];

export const sampleData = {
  business_question: {
    note: "The request arrived as one line in a chat message. After a short call the analyst wrote it up as a scoped brief: which city, which two weeks to compare and the decision the answer will support. Nothing has been queried yet.",
    input: null,
    output: question,
  },

  kpi_definitions: {
    note: "The loose word 'revenue' is replaced by one precise metric, net_revenue_inr, with its formula, its exclusions, the week boundaries and an owner who signs it off. Every later query and chart will use exactly this definition.",
    input: question,
    output: defined,
  },

  data_extraction: {
    note: "The brief becomes a query against the orders table. 14,962 Indore order rows come back for the two weeks, and a first look at the result already shows problems to fix: amounts stored as text, three spellings of the city and 214 rows with no platform.",
    input: {
      city: "Indore",
      period: "2026-W44",
      compare_to: "2026-W43",
    },
    output: extracted,
  },

  data_cleaning: {
    note: "Cleaning removes 180 duplicate rows, 60 internal test orders and 322 orders that were never delivered, leaving 14,400 rows. Amounts become real numbers, the three city spellings become one and the 214 missing platforms are filled in from the sessions table.",
    input: extracted,
    output: cleaned,
  },

  exploration: {
    note: "Summary statistics and a daily chart show that orders fell from 8,000 to 6,400 while the average order value stayed at ₹155, so revenue fell by exactly the same 20%. The drop starts on Tuesday 27 October, which turns 'revenue is down' into 'orders fell from a specific date'.",
    input: {
      source_table: "scratch.orders_indore_clean",
      rows: 14400,
    },
    output: finding,
  },

  segmentation: {
    note: "Cutting the orders by platform and app version shows where the drop lives. Android traffic is flat and iOS and web are unchanged, but Android users on app version 5.2 turn only 2.0% of their sessions into orders, against 10.0% on version 5.1.",
    input: {
      orders_w43: 8000,
      orders_w44: 6400,
      segments: "none (all Indore orders)",
    },
    output: {
      orders_w43: 8000,
      orders_w44: 6400,
      segments: "platform x app_version",
      android_sessions_change_pct: 0.0,
      android_v51_conv_pct: 10.0,
      android_v52_conv_pct: 2.0,
      android_v52_session_share_pct: 50.0,
      ios_orders_change_pct: 0.0,
      web_orders_change_pct: 0.0,
    },
  },

  analysis: {
    note: "The analyst puts exact numbers on the change: revenue is down ₹2,48,000 (20.0%) and all of it comes from fewer orders, because basket value did not move. A normal week moves about 4.0%, so this is a real change, and Android orders account for all of it.",
    input: weeklyTotals,
    output: result,
  },

  visualization: {
    note: "The result becomes a chart plus a sentence. A line chart of daily orders by platform with a marker on the 27 October release lets the manager see the story in seconds, and the title states the conclusion instead of just naming the metric.",
    input: {
      revenue_change_pct: -20.0,
      android_orders_change_pct: -40.0,
      android_share_of_drop_pct: 100.0,
    },
    output: chart,
  },

  ab_testing: {
    note: "A planned test of the fix has run and been read out. The 5.2.1 variant converts 9.6% of sessions against 2.0% for the control, a lift of 7.6 percentage points that is far beyond chance, so the recommendation is to ship it.",
    input: {
      experiment: "upi_checkout_fix_v521",
      audience: "Android v5.2 users in Indore",
      split: "50/50",
      primary_metric: "checkout conversion",
      status: "planned",
    },
    output: {
      experiment: "upi_checkout_fix_v521",
      audience: "Android v5.2 users in Indore",
      split: "50/50",
      primary_metric: "checkout conversion",
      status: "finished",
      users_per_group: 10000,
      control_conv_pct: 2.0,
      variant_conv_pct: 9.6,
      lift_pp: 7.6,
      p_value: "<0.001",
      decision: "ship variant",
    },
  },

  dashboard_automation: {
    note: "A weekly manual spreadsheet export is replaced by a dashboard that refreshes itself every morning from the cleaned orders table. More people can use it and it gains filters for platform and app version.",
    input: {
      dashboard: "Indore weekly revenue",
      refresh: "manual Excel export",
      last_updated: "2026-11-02",
      shared_with: 3,
    },
    output: {
      dashboard: "Indore weekly revenue",
      refresh: "daily at 06:00 IST",
      last_updated: "2026-11-06 06:00",
      shared_with: 24,
      filters: ["city", "platform", "app_version"],
      data_source: "analytics.orders_clean",
    },
  },

  storytelling: {
    note: "The chart is wrapped in a short narrative. The title changes from a description ('Android orders fell 40%...') into a decision ('Fix the Android checkout bug...'), and context, business impact and a clear ask are added around it.",
    input: {
      title: "Android orders fell 40% after the 27 Oct release",
      insight: "All of the ₹2.48 lakh drop comes from Android",
      audience: "Regional sales manager",
    },
    output: {
      title: "Fix the Android checkout bug to win back ₹2.48 lakh a week",
      insight: "All of the ₹2.48 lakh drop comes from Android",
      audience: "Regional sales manager",
      context: "Indore revenue fell from ₹12.4 lakh to ₹9.92 lakh in week 44",
      so_what: "Without a fix we keep losing ₹2.48 lakh a week",
      recommendation,
      ask: "Approve rollout by Monday 9 Nov",
    },
  },

  decision_review: {
    note: "After the readout the recommendation becomes a recorded decision with an owner, a deadline, a success metric and a follow-up review date. Its status moves from proposed to approved, and the analyst now has something to check next week.",
    input: {
      recommendation,
      owner: null,
      due: null,
      success_metric: null,
      status: "proposed",
    },
    output: {
      recommendation,
      owner: "Android lead",
      due: "2026-11-09",
      success_metric: "Android orders back to 4,000 a week",
      review_on: "2026-11-16",
      status: "approved",
    },
  },

  semantic_layer: {
    note: "The metric definition is published as a governed metric. It gets a semantic model, a list of dimensions it can be sliced by and a built-in filter, so any connected tool that asks for net_revenue_inr by name gets the same number.",
    input: {
      metric: "net_revenue_inr",
      metric_formula: "SUM(amount) of delivered orders",
      owner: "Finance analytics",
    },
    output: {
      metric: "net_revenue_inr",
      metric_formula: "SUM(amount) of delivered orders",
      owner: "Finance analytics",
      semantic_model: "orders",
      dimensions: ["city", "platform", "app_version", "week"],
      filter: "status = 'delivered'",
      certified: true,
      exposed_to: ["Looker Studio", "Metabase", "Jupyter"],
    },
  },

  forecasting: {
    note: "A model trained on two years of weekly revenue projects week 45. With no fix revenue stays near ₹9.9 lakh; with the fix, using the lift measured in the A/B test, it recovers to about ₹12.25 lakh. Both numbers come with an uncertainty range.",
    input: {
      metric: "net_revenue_inr",
      history_weeks: 104,
      last_actual: 992000,
    },
    output: {
      metric: "net_revenue_inr",
      history_weeks: 104,
      last_actual: 992000,
      model: "Prophet",
      horizon: "2026-W45",
      forecast_no_fix: 990000,
      forecast_with_fix: 1225000,
      forecast_range_pct: 5.0,
    },
  },

  root_cause: {
    note: "The funnel shows that the break is at the payment step: 95.0% of payment attempts succeed on app version 5.1 but only 19.0% on version 5.2. Traffic, pricing and outages are ruled out, so the cause is the UPI payment screen in the new release.",
    input: {
      symptom: "Android orders fell 40% in Indore",
      suspect_slice: "app v5.2 (released 27 Oct)",
      android_v51_conv_pct: 10.0,
      android_v52_conv_pct: 2.0,
    },
    output: {
      symptom: "Android orders fell 40% in Indore",
      suspect_slice: "app v5.2 (released 27 Oct)",
      android_v51_conv_pct: 10.0,
      android_v52_conv_pct: 2.0,
      funnel_step_with_drop: "payment",
      payment_success_v51_pct: 95.0,
      payment_success_v52_pct: 19.0,
      cause: "UPI payment screen fails on app v5.2",
      ruled_out: ["traffic", "pricing", "outage"],
      confidence: "high",
    },
  },

  anomaly_alerts: {
    note: "A monitor scores each hour of Indore Android orders against an expected band. For 8 pm on 27 October the expected value was 52 orders with a lower limit of 37, but only 31 arrived, a z-score of -4.2, so an alert goes to the growth channel.",
    input: {
      metric: "indore_android_orders_per_hour",
      hour: "2026-10-27 20:00 IST",
      observed: 31,
      status: "unchecked",
    },
    output: {
      metric: "indore_android_orders_per_hour",
      hour: "2026-10-27 20:00 IST",
      observed: 31,
      expected: 52,
      lower_limit: 37,
      z_score: -4.2,
      status: "anomaly",
      alert_sent_to: "#growth-alerts",
    },
  },

  experimentation_platform: {
    note: "The experiment is registered on the platform instead of being wired up by hand. It gains hashed random assignment, a sample size of 10,000 per group, guardrail metrics and an automatic split check, and its status moves from draft to running.",
    input: {
      experiment: "upi_checkout_fix_v521",
      audience: "Android v5.2 users in Indore",
      split: "50/50",
      status: "draft",
    },
    output: {
      experiment: "upi_checkout_fix_v521",
      audience: "Android v5.2 users in Indore",
      split: "50/50",
      status: "running",
      assignment: "hash(user_id + experiment)",
      sample_per_group: 10000,
      min_detectable_effect_pp: 0.6,
      guardrails: ["crash_rate", "orders_per_session"],
      srm_check: "pass",
    },
  },

  decision_automation: {
    note: "A rule connects the alert to an action. When the anomaly lasts two hours in a row the system pages the Android on-call engineer, opens a ticket and pauses Indore app ads, so the status moves from waiting to executed within minutes.",
    input: {
      alert: "Indore Android orders anomaly",
      z_score: -4.2,
      rule: "z < -3 for 2 hours in a row",
      action: null,
      status: "waiting",
    },
    output: {
      alert: "Indore Android orders anomaly",
      z_score: -4.2,
      rule: "z < -3 for 2 hours in a row",
      action: "page on-call, open ticket, pause Indore app ads",
      status: "executed",
      ticket: "BUG-2041",
      notified_in_min: 3,
    },
  },
};

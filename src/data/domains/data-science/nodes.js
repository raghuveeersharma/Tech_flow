// Node schema:
// {
//   id, level, category, label, shortLabel, icon,
//   position,                // layout used at the first level the node appears
//   positionByLevel?,        // optional overrides: { medium: {x,y}, advanced: {x,y} } (falls back to the previous level)
//   details: { summary, whatHappens, howItHappens[], whyImportant, tools[{name,type,note}], commonProblems[] },
//   sampleKey
// }
// `level` is the FIRST level at which the node appears (levels are cumulative).
import { g } from "../../grid";

export const nodes = [
  // =====================================================================
  // BASIC
  // =====================================================================
  {
    id: "problem_framing",
    level: "basic",
    category: "problem",
    label: "Problem Framing",
    shortLabel: "Frame",
    icon: "CircleHelp",
    position: g(0, 1),
    details: {
      summary: "Turns a vague business worry into a precise question that data can answer.",
      whatHappens:
        "Before any code is written, the data scientist sits down with the business to turn 'we are losing customers' into something measurable. That means choosing exactly what to predict (will this customer cancel in the next 30 days?), who it applies to, which decision the answer will trigger and how success will be judged. A clear frame also decides whether machine learning is the right tool at all.",
      howItHappens: [
        "Interview the stakeholders (retention team, finance, product) to learn which decision the prediction will support.",
        "Translate the worry into a target variable with a precise definition: churned_30d = 1 if the customer cancels within 30 days of the snapshot date.",
        "Fix the prediction moment (the snapshot date) so only information known on that day can be used as input.",
        "Agree on a success metric and a baseline to beat, for example recall of at least 0.70 at precision of at least 0.50 against a 26% base churn rate.",
        "List the data needed, check privacy rules and find out who owns each source.",
      ],
      whyImportant:
        "A model that answers the wrong question is useless however accurate it is. Spending a day sharpening the question prevents weeks of rework, and fixing the prediction moment early stops later stages from accidentally using information from the future.",
      tools: [
        { name: "Machine Learning Canvas", type: "Planning template", note: "One page that records the decision, target, metric, data and risks before any work starts" },
        { name: "Stakeholder interviews", type: "Technique", note: "Find out which action the prediction will actually change" },
        { name: "Notion / Confluence", type: "Documentation", note: "Write down the agreed target definition so it cannot silently drift" },
        { name: "Baseline rules", type: "Technique", note: "The overall churn rate or a simple rule gives the number every model has to beat" },
      ],
      commonProblems: [
        "The target is vague ('churn'), so different teams count different customers as churned.",
        "Using information that would not exist at prediction time, such as a 'cancellation requested' flag (data leakage).",
        "No clear action is tied to the prediction, so even a perfect model changes nothing.",
        "Success is judged by accuracy, which looks great when 74% of customers never churn anyway.",
      ],
    },
    sampleKey: "problem_framing",
  },
  {
    id: "data_collection",
    level: "basic",
    category: "data",
    label: "Data Collection",
    shortLabel: "Collect",
    icon: "DatabaseZap",
    position: g(1, 1),
    details: {
      summary: "Pulls the customer's data together from billing, usage, CRM and support systems.",
      whatHappens:
        "The data scientist finds every source that describes the customer and joins them into one table with one row per customer on the snapshot date. In practice that means writing SQL against the warehouse, calling an API or asking another team for an export. The result is deliberately raw: the goal is to get everything in one place before judging its quality.",
      howItHappens: [
        "Write SQL against the warehouse to pull contract and billing tables for customers in the renewal window.",
        "Join usage logs and support-ticket counts on customer_id, keeping only records dated before the snapshot.",
        "Attach the label: did the customer cancel within the following 30 days?",
        "Save the pulled table as a versioned file or table so the analysis can be repeated later.",
        "Write a data dictionary: what each column means, its unit and who owns it.",
      ],
      whyImportant:
        "A model can only learn from what you give it. Missing sources, joins that duplicate rows or labels pulled from the wrong date silently cap how good the final model can ever be, so the collection step sets the ceiling for everything downstream.",
      tools: [
        { name: "SQL (BigQuery, Snowflake, PostgreSQL)", type: "Query language", note: "Pull and join tables straight from the warehouse" },
        { name: "pandas", type: "Python library", note: "read_sql and read_csv load query results into a DataFrame, a table held in memory" },
        { name: "Jupyter Notebook", type: "Interactive environment", note: "Mix queries, notes and results in one readable document" },
        { name: "requests", type: "Python library", note: "Fetch CRM or third-party data that is not in the warehouse yet" },
        { name: "DVC (Data Version Control)", type: "Data versioning", note: "Records exactly which version of the data a model was trained on" },
      ],
      commonProblems: [
        "A join that duplicates customers, so one person appears in the table three times.",
        "Label leakage: pulling the cancellation date and then also features recorded after it.",
        "Sampling only active customers, which hides everyone who already left (survivorship bias).",
        "A one-off CSV export that nobody can reproduce when the data needs refreshing.",
      ],
    },
    sampleKey: "data_collection",
  },
  {
    id: "cleaning",
    level: "basic",
    category: "data",
    label: "Cleaning & Preparation",
    shortLabel: "Clean",
    icon: "Eraser",
    position: g(2, 1),
    details: {
      summary: "Fixes types, units, spellings and missing values so the table can be trusted.",
      whatHappens:
        "Raw data is full of surprises: numbers stored as text, dates in day/month order, the same category spelled three ways, usage in MB for some rows and GB for others, and blanks where a value is missing. Cleaning turns the table into consistent, correctly typed columns and records every decision, because each choice (such as filling a missing age with the median) quietly shapes what the model learns.",
      howItHappens: [
        "Convert text to numbers: '$89.90' becomes 89.9 and the label 'Yes' becomes 1.",
        "Parse dates with an explicit day-first format and derive tenure in months from the signup date and the snapshot date.",
        "Standardise units and spellings: 59800 MB becomes 58.4 GB and 'fiber optic' becomes 'Fiber optic'.",
        "Handle missing values: fill age with the median (41) and add an age_imputed flag so the model can tell it was a guess.",
        "Remove duplicate customer rows and check simple rules such as tenure >= 0 and charges > 0.",
      ],
      whyImportant:
        "Garbage in, garbage out. A column that mixes MB and GB can distort every statistic and every model built on it. Writing down each cleaning decision also lets a colleague reproduce your results and lets you notice when next month's data breaks the rules.",
      tools: [
        { name: "pandas", type: "Python library", note: "to_datetime, astype, fillna and drop_duplicates do most of the work" },
        { name: "scikit-learn SimpleImputer", type: "Imputation", note: "Fills missing values with a median or mean learned from training rows only" },
        { name: "Great Expectations", type: "Data validation", note: "Declare rules such as 'tenure_months must be >= 0' and fail loudly when they break" },
        { name: "OpenRefine", type: "Interactive cleaning", note: "Clusters near-duplicate spellings in messy text columns" },
      ],
      commonProblems: [
        "Filling missing values with the mean of the whole dataset, which leaks test-set information into training.",
        "Day/month confusion: 12/02/2024 silently read as 2 December instead of 12 February.",
        "Dropping every row with a missing value and losing a large, non-random group of customers.",
        "Cleaning done by hand in a spreadsheet, so it cannot be repeated on next month's data.",
      ],
    },
    sampleKey: "cleaning",
  },
  {
    id: "eda",
    level: "basic",
    category: "explore",
    label: "Exploratory Analysis (EDA)",
    shortLabel: "EDA",
    icon: "ScanSearch",
    position: g(3, 1),
    details: {
      summary: "Looks at the data with summaries and charts to find patterns, problems and ideas.",
      whatHappens:
        "Exploratory data analysis is the detective phase. The data scientist plots distributions, compares churners with loyal customers and checks how columns relate to each other and to the target. The goal is to understand the data, spot problems such as outliers or imbalance and form hypotheses worth modelling, for example that month-to-month fiber customers with many support calls leave far more often.",
      howItHappens: [
        "Summarise every column with df.describe() and check the target balance (about 26% of customers churn).",
        "Plot histograms and box plots to see skew and outliers in monthly charges, tenure and data usage.",
        "Compare churn rates across groups: month-to-month contracts churn 40% of the time, two-year contracts only 5%.",
        "Draw a correlation heatmap and scatter plots to see which numeric columns move together or duplicate each other.",
        "Write down hypotheses: customers with 3 or more support calls churn 41% of the time versus 19% for the rest.",
      ],
      whyImportant:
        "EDA is where you catch the mistakes no algorithm will warn you about: a column that secretly contains the answer, a group that is barely represented, a unit error. It also builds the intuition you need later to judge whether the model's behaviour makes sense.",
      tools: [
        { name: "pandas", type: "Python library", note: "describe, groupby and crosstab answer most first questions" },
        { name: "Matplotlib", type: "Plotting library", note: "The base layer for histograms, scatter plots and custom charts" },
        { name: "Seaborn", type: "Statistical plotting", note: "Heatmaps, box plots and pair plots in a single line" },
        { name: "ydata-profiling", type: "Automated profiling", note: "Generates a full HTML report of every column with one call (formerly pandas-profiling)" },
        { name: "Plotly", type: "Interactive charts", note: "Zoomable charts for sharing exploration with colleagues" },
      ],
      commonProblems: [
        "Mistaking correlation for causation and promising something the data cannot prove.",
        "Looking only at averages, which hide skewed groups and outliers.",
        "Leakage columns such as 'cancellation_reason' that make the exploration look wonderful.",
        "Checking so many charts and groups that a pattern appears by pure chance (multiple comparisons).",
      ],
    },
    sampleKey: "eda",
  },
  {
    id: "model_training",
    level: "basic",
    category: "modeling",
    label: "Model Training",
    shortLabel: "Train",
    icon: "BrainCircuit",
    position: g(4, 1),
    positionByLevel: { medium: g(5, 2) },
    details: {
      summary: "Fits an algorithm to labelled examples so it learns to turn customer data into a churn probability.",
      whatHappens:
        "Training means showing the algorithm thousands of past customers together with what happened to them, so it can learn the patterns that link their characteristics to churn. The algorithm adjusts its internal numbers to make fewer mistakes on the training rows. The result is a model: a function that takes a customer row and returns a probability between 0 and 1. A simple baseline is trained first so every fancier model has a number to beat.",
      howItHappens: [
        "Hold some rows back as a test set the model never sees while it learns.",
        "Turn text categories into numbers (one-hot encoding) inside a scikit-learn Pipeline so the same steps run again at prediction time.",
        "Fit a simple baseline such as logistic regression, then a stronger model such as XGBoost with model.fit(X_train, y_train).",
        "The algorithm repeatedly adjusts its parameters (tree splits and weights) to reduce a loss function such as log-loss.",
        "Call predict_proba on held-out customers to get churn probabilities, for example 0.81 for C-20817.",
      ],
      whyImportant:
        "This is the step that turns historical data into something that can predict the future. Starting with a transparent baseline shows how much a complex model really adds, and keeping a test set aside from the very beginning is what makes an honest performance number possible later.",
      tools: [
        { name: "scikit-learn", type: "ML library", note: "LogisticRegression, RandomForestClassifier and Pipelines with one consistent API" },
        { name: "XGBoost", type: "Gradient boosting", note: "A strong default for tabular data like customer tables" },
        { name: "LightGBM", type: "Gradient boosting", note: "Very fast on large tables and handles categorical columns natively" },
        { name: "statsmodels", type: "Statistical modelling", note: "Logit models give interpretable coefficients and p-values" },
      ],
      commonProblems: [
        "Overfitting: the model memorises the training customers and fails on new ones.",
        "Class imbalance: with few churners, a model that always says 'stays' still looks accurate.",
        "Data leakage: a feature or an imputer that has seen test rows makes results look better than they are.",
        "Jumping straight to a complex model without a simple baseline to compare against.",
      ],
    },
    sampleKey: "model_training",
  },
  {
    id: "evaluation",
    level: "basic",
    category: "evaluation",
    label: "Evaluation & Insights",
    shortLabel: "Evaluate",
    icon: "Gauge",
    position: g(5, 1),
    positionByLevel: { medium: g(4, 3) },
    details: {
      summary: "Measures how well the model works on customers it has never seen.",
      whatHappens:
        "The model is scored on the held-out test set, where the real answers are known but the model has never seen them. Precision (of the customers we flag, how many really leave), recall (of the customers who really leave, how many we catch) and AUC (how well the model ranks risky customers above safe ones) are compared with the baseline and with the target agreed during framing. The data scientist also studies the kinds of mistakes, since a false alarm and a missed churner cost the business different amounts.",
      howItHappens: [
        "Run the final model once on the untouched test set to get a probability for every customer.",
        "Pick a decision threshold (for example 0.50) that turns probabilities into churn or stay predictions.",
        "Build the confusion matrix and compute precision, recall, F1 and ROC AUC.",
        "Compare the numbers with the baseline and with the target from the framing step.",
        "Inspect the errors: which churners are missed, and what do those customers have in common?",
      ],
      whyImportant:
        "Evaluation tells you whether the model is good enough to act on, and in what way it is wrong. Without a fair test, a model that merely memorised the past can look brilliant and then disappoint the first time it meets real customers.",
      tools: [
        { name: "scikit-learn metrics", type: "Metrics library", note: "precision_recall_curve, roc_auc_score, confusion_matrix and classification_report" },
        { name: "Yellowbrick", type: "Visual diagnostics", note: "ROC, precision-recall and threshold plots in one line each" },
        { name: "Matplotlib", type: "Plotting library", note: "Custom curves and confusion matrices for the report" },
        { name: "scikit-learn CalibrationDisplay", type: "Calibration", note: "Checks whether 'about 80% likely' really means 8 in 10" },
      ],
      commonProblems: [
        "Reporting accuracy on an imbalanced problem, where predicting 'nobody churns' already scores about 74%.",
        "Tuning the model again and again on the test set, which turns it into a second training set.",
        "Keeping the default 0.5 threshold although a missed churner costs far more than an extra phone call.",
        "Probabilities that are not calibrated, so a score of 0.8 does not really mean 80%.",
      ],
    },
    sampleKey: "evaluation",
  },

  // =====================================================================
  // MEDIUM
  // =====================================================================
  {
    id: "feature_engineering",
    level: "medium",
    category: "explore",
    label: "Feature Engineering",
    shortLabel: "Features",
    icon: "Wand2",
    position: g(4, 1),
    details: {
      summary: "Builds the numeric columns that describe the customer to the model.",
      whatHappens:
        "Algorithms only understand numbers, so categories such as 'Month-to-month' must be encoded and raw columns reshaped into signals the model can use. This is where domain knowledge enters: ratios such as price per gigabyte, flags such as 'three or more support calls', or counts over a time window. Good features often improve a model more than switching to a fancier algorithm.",
      howItHappens: [
        "Encode categories as numbers: contract becomes contract_month_to_month = 1 (one-hot encoding).",
        "Create ratios and flags from domain knowledge: charges_per_gb = 89.9 / 58.4 = 1.54 and high_support_calls = 1 when calls >= 3.",
        "Aggregate behaviour over time windows, such as support calls in the last 30 and 90 days.",
        "Scale or transform skewed numbers (log, standardisation) when the algorithm needs it.",
        "Drop near-duplicate columns and anything computed from the target, such as the segment churn rate found in EDA.",
        "Wrap the steps in a pipeline so they are fitted on training rows only and reused unchanged in production.",
      ],
      whyImportant:
        "Features are the language you use to describe a customer to the model. Smart features let simple models perform well and make complex ones more stable. Because the same code must later run in production, careless features are a major source of bugs between a notebook and a live system.",
      tools: [
        { name: "pandas", type: "Python library", note: "groupby, rolling windows and merges build most hand-made features" },
        { name: "scikit-learn ColumnTransformer", type: "Preprocessing", note: "Applies the right encoder or scaler to each column inside one pipeline" },
        { name: "Feature-engine", type: "Feature library", note: "Ready-made transformers for rare categories, outliers and encoding that follow the scikit-learn API" },
        { name: "Featuretools", type: "Automated features", note: "Deep Feature Synthesis builds aggregates across related tables automatically" },
      ],
      commonProblems: [
        "Target leakage: a feature computed with information from after the prediction date.",
        "Fitting scalers or encoders on the full dataset instead of only on training rows.",
        "Hundreds of features that mostly add noise and make the model harder to explain.",
        "Features that work in the notebook but cannot be computed in time in production.",
      ],
    },
    sampleKey: "feature_engineering",
  },
  {
    id: "data_split",
    level: "medium",
    category: "modeling",
    label: "Train / Validation / Test Split",
    shortLabel: "Split",
    icon: "Split",
    position: g(5, 1),
    details: {
      summary: "Divides the data so models are tuned and judged on rows they have not memorised.",
      whatHappens:
        "To know how a model will behave on future customers, you must test it on customers it has not learned from. The data is divided into a training set (to learn from), a validation set (to compare and tune models) and a test set locked away until the very end. Cross-validation repeats the train and validation split several times so the estimate does not depend on one lucky split.",
      howItHappens: [
        "Randomly assign each customer to train (70%), validation (15%) or test (15%), stratified so every part keeps about 26% churners.",
        "Split by time instead when the model will predict the future: train on older customers, test on newer ones.",
        "Keep all rows that belong to one customer in the same part so the model cannot peek at the same person.",
        "Set up k-fold cross-validation (for example 5 folds) on the training data for stable comparisons.",
        "Lock the test set away and use it exactly once, at the end.",
      ],
      whyImportant:
        "A model scored on its own training data will always look good. The split is the only protection against fooling yourself, and it costs almost nothing. Splitting badly, for example letting one customer appear on both sides, is one of the most common reasons results collapse after launch.",
      tools: [
        { name: "scikit-learn train_test_split", type: "Utility", note: "One call with stratify=y keeps the churn rate equal in every part" },
        { name: "StratifiedKFold / GroupKFold", type: "Cross-validation", note: "Stratified keeps class balance; Group keeps each customer inside one fold" },
        { name: "TimeSeriesSplit", type: "Cross-validation", note: "Always trains on the past and validates on the future" },
        { name: "imbalanced-learn", type: "Resampling library", note: "SMOTE and under-sampling, applied to training folds only" },
      ],
      commonProblems: [
        "A random split of time-ordered data lets the model learn from the future and overstate performance.",
        "The same customer in train and test through duplicate rows, so the model recognises people instead of patterns.",
        "Oversampling (SMOTE) before splitting, which copies test information into training.",
        "Using the test set repeatedly to choose between models, which quietly turns it into validation data.",
      ],
    },
    sampleKey: "data_split",
  },
  {
    id: "tuning",
    level: "medium",
    category: "modeling",
    label: "Hyperparameter Tuning",
    shortLabel: "Tune",
    icon: "SlidersHorizontal",
    position: g(5, 3),
    details: {
      summary: "Searches for the model settings that give the best validation score.",
      whatHappens:
        "Every algorithm has dials that the data scientist sets rather than the data, called hyperparameters (for XGBoost: learning rate, tree depth and number of trees). Tuning tries many combinations, scores each one with cross-validation and keeps the best. Smart search methods such as Bayesian optimisation find a good setting in tens of trials instead of thousands.",
      howItHappens: [
        "Choose which hyperparameters to tune and sensible ranges, such as learning_rate 0.01 to 0.3 and max_depth 3 to 8.",
        "Pick a search strategy: grid search, random search or Bayesian optimisation with Optuna.",
        "For each trial, train with 5-fold cross-validation and record the mean validation AUC.",
        "Use early stopping and pruning to abandon trials that are clearly losing.",
        "Keep the best setting: learning_rate 0.05, max_depth 4 and 300 trees lift the cross-validated AUC from 0.851 to 0.868.",
      ],
      whyImportant:
        "Default settings are rarely the best ones, and a little tuning often delivers a clear gain without any extra data. Tuning is also where over-optimism creeps in, so the discipline is to tune on validation folds only and leave the test set untouched.",
      tools: [
        { name: "Optuna", type: "Bayesian optimisation", note: "Define a search space in Python; prunes poor trials and ships a live dashboard" },
        { name: "scikit-learn GridSearchCV / RandomizedSearchCV", type: "Search utilities", note: "Simple exhaustive or random search wired into cross-validation" },
        { name: "Hyperopt", type: "Search library", note: "Tree-structured Parzen estimator search, popular with Spark workloads" },
        { name: "Ray Tune", type: "Distributed tuning", note: "Runs hundreds of trials in parallel across a cluster" },
      ],
      commonProblems: [
        "Tuning against the test set, so the final score is optimistic.",
        "A huge search for a gain of 0.002 AUC, which is smaller than the noise between folds.",
        "Search ranges that are too narrow, so the best value sits on the edge of the range.",
        "Forgetting to fix random seeds, so the 'best' result cannot be reproduced.",
      ],
    },
    sampleKey: "tuning",
  },
  {
    id: "experiment_tracking",
    level: "medium",
    category: "modeling",
    label: "Experiment Tracking",
    shortLabel: "Track",
    icon: "ClipboardList",
    position: g(4, 2),
    details: {
      summary: "Records every training run (code, data, settings and results) so nothing is lost.",
      whatHappens:
        "A data scientist may run hundreds of experiments in a few weeks. Experiment tracking logs, for each run, the parameters, the metrics, the version of the code and data and the saved model file, so any result can be compared, reproduced or rolled back. Instead of notebooks named final_v7_REAL, the team gets a searchable history of what was tried and what worked.",
      howItHappens: [
        "Start a run and log the hyperparameters, for example learning_rate=0.05, max_depth=4 and n_estimators=300.",
        "Log metrics during and after training, such as a validation AUC of 0.868.",
        "Record the git commit, the dataset version and the Python environment.",
        "Save artifacts: the fitted model, key plots and the list of features.",
        "Compare runs side by side in a UI and tag the best one as a candidate for release.",
      ],
      whyImportant:
        "Science that cannot be reproduced is just anecdote. Tracking lets you answer 'which setting gave that 0.868?' months later, lets teammates build on each other's work instead of repeating it, and gives engineers and auditors an exact record of how the model was made.",
      tools: [
        { name: "MLflow", type: "Open-source tracking", note: "mlflow.log_param and log_metric, a UI to compare runs and a model registry" },
        { name: "Weights & Biases", type: "Hosted tracking", note: "Rich live dashboards, run comparison and hyperparameter sweeps" },
        { name: "DVC", type: "Versioning", note: "Git-style versions of data and experiments stored next to the code" },
        { name: "Comet", type: "Hosted tracking", note: "Experiment logging, comparison and model monitoring in one platform" },
      ],
      commonProblems: [
        "Logging only the final score, so nobody knows which settings produced it.",
        "Forgetting to log the dataset version, so the same code gives different numbers next month.",
        "Hundreds of unnamed runs with no tags or notes, which makes the history unsearchable.",
        "A tracking server open to everyone, or sensitive customer data saved inside artifacts.",
      ],
    },
    sampleKey: "experiment_tracking",
  },
  {
    id: "interpretation",
    level: "medium",
    category: "evaluation",
    label: "Model Interpretation",
    shortLabel: "Explain",
    icon: "Eye",
    position: g(3, 3),
    details: {
      summary: "Explains why the model scored a customer the way it did.",
      whatHappens:
        "A churn probability on its own is hard to trust or act on. Interpretation tools break a prediction into the contribution of each feature, so a retention agent can see that C-20817 scores 0.81 mainly because of a month-to-month contract and four support calls. Global views of feature importance also show which signals the model relies on overall and expose nonsense, such as a feature that should not matter ranking first.",
      howItHappens: [
        "Compute global importance: which features move the predictions most across all customers.",
        "Compute SHAP values for single customers: each feature gets a positive or negative push relative to the average prediction.",
        "Plot summary (beeswarm), dependence and waterfall charts to see the direction and shape of each effect.",
        "Sanity-check the top drivers against domain knowledge and look for anything suspicious ranking high.",
        "Translate the technical output into plain-language reasons for the business.",
      ],
      whyImportant:
        "People only act on predictions they understand, and regulators increasingly expect reasons for automated decisions. Interpretation is also a debugging tool: a model that leans on a leaky or meaningless feature reveals itself here, before it reaches production.",
      tools: [
        { name: "SHAP", type: "Explainability library", note: "Shapley-value explanations for any model, with a fast exact version for tree models" },
        { name: "LIME", type: "Local explanations", note: "Fits a small, readable model around one prediction to explain it" },
        { name: "scikit-learn permutation_importance", type: "Model-agnostic importance", note: "Shuffles one column at a time and measures how much the score drops" },
        { name: "InterpretML", type: "Glass-box models", note: "Explainable Boosting Machines are accurate and readable by design" },
      ],
      commonProblems: [
        "Treating an explanation as proof of cause: SHAP describes the model, not the real world.",
        "Importance rankings distorted by correlated features that share the credit between them.",
        "Very slow SHAP runs on large data because no sample or tree explainer was used.",
        "Showing business users raw log-odds numbers instead of plain statements.",
      ],
    },
    sampleKey: "interpretation",
  },
  {
    id: "communication",
    level: "medium",
    category: "delivery",
    label: "Communicating Results",
    shortLabel: "Communicate",
    icon: "Presentation",
    position: g(2, 3),
    details: {
      summary: "Turns model output into a clear recommendation that people can act on.",
      whatHappens:
        "The best analysis is wasted if the audience does not understand or trust it. The data scientist translates metrics and charts into the language of the decision: how many customers are at risk, why, what to do and how confident we are. The output is usually a short report, a dashboard or a presentation, together with the honest limits of the analysis.",
      howItHappens: [
        "Start from the decision and write the one-sentence recommendation first.",
        "Translate metrics into business terms: 'we catch about 3 in 4 churners and 6 in 10 flagged customers really would leave'.",
        "Show two or three clear charts instead of every plot, with labelled axes and plain titles.",
        "State assumptions, uncertainty and limitations: what the model cannot tell us.",
        "Present to stakeholders, collect feedback and agree the next steps and owners.",
      ],
      whyImportant:
        "A model only creates value when someone changes a decision because of it. Clear communication builds trust, surfaces misunderstandings early and gets the work adopted. Overstating certainty does the opposite and costs credibility the first time a prediction misses.",
      tools: [
        { name: "Streamlit", type: "App framework", note: "Build a small interactive app for stakeholders in pure Python" },
        { name: "Quarto", type: "Reproducible reports", note: "Turns notebooks and code into polished HTML, PDF or slides" },
        { name: "Tableau / Power BI", type: "BI dashboards", note: "Share results with people who never open a notebook" },
        { name: "PowerPoint / Google Slides", type: "Presentations", note: "Still the main format for decision meetings" },
      ],
      commonProblems: [
        "Opening with methodology and burying the recommendation on slide twelve.",
        "Quoting AUC to people who think in customers and money.",
        "Ignoring uncertainty, so a forecast sounds like a promise.",
        "Charts with truncated axes or too many colours that mislead or confuse.",
      ],
    },
    sampleKey: "communication",
  },

  // =====================================================================
  // ADVANCED
  // =====================================================================
  {
    id: "causal_inference",
    level: "advanced",
    category: "decision",
    label: "Causal Inference",
    shortLabel: "Causal",
    icon: "GitBranch",
    position: g(3, 2),
    details: {
      summary: "Separates what really causes churn from what merely goes along with it.",
      whatHappens:
        "Charts and models show that customers who call support often also churn often, but that does not prove the calls cause the churn: unhappy customers on expensive plans might both call more and leave more. Causal inference uses study design and statistics to estimate what would happen if we changed one thing while everything else stayed the same. Here the naive 22-point gap shrinks to about 9 points once we adjust for tenure, plan and price.",
      howItHappens: [
        "State the causal question precisely: does having 3 or more support calls raise the chance of churning within 30 days?",
        "Draw a causal graph of your assumptions and name the confounders (tenure, plan, price) that influence both calls and churn.",
        "Estimate the effect with a method that adjusts for them: regression, matching, propensity-score weighting or double machine learning.",
        "Report an effect size with a confidence interval, not just a yes or no.",
        "Run refutation checks such as a placebo treatment or a random extra confounder to see whether the estimate survives.",
      ],
      whyImportant:
        "Business decisions are about interventions: if we fix long support waits, how many customers will we keep? Only causal reasoning answers that, and acting on a plain correlation can burn a whole budget on a lever that does nothing.",
      tools: [
        { name: "DoWhy", type: "Causal inference library", note: "Four explicit steps: model, identify, estimate and refute" },
        { name: "EconML", type: "Heterogeneous effects", note: "Double machine learning and causal forests from Microsoft Research" },
        { name: "statsmodels", type: "Regression toolkit", note: "OLS and logistic regression with robust errors for adjusted estimates" },
        { name: "DAGitty", type: "Causal diagram tool", note: "Draw the assumed causal graph and list which variables to adjust for" },
      ],
      commonProblems: [
        "Missing confounders: any important variable that was not measured biases the answer.",
        "Adjusting for the wrong variables (colliders or mediators) and creating bias instead of removing it.",
        "Treating observational data as if it came from a randomised experiment.",
        "Wide confidence intervals that nobody reports, so a weak effect sounds certain.",
      ],
    },
    sampleKey: "causal_inference",
  },
  {
    id: "uplift_modeling",
    level: "advanced",
    category: "decision",
    label: "Uplift Modelling & A/B Test",
    shortLabel: "Uplift",
    icon: "TrendingUp",
    position: g(2, 2),
    details: {
      summary: "Finds the customers an offer would actually change, and proves it with an experiment.",
      whatHappens:
        "A churn score says who is likely to leave, not who can be persuaded to stay. Some customers stay anyway, some leave whatever we do, a few react badly to being contacted, and a persuadable group stays only if we make an offer. Uplift modelling, trained on a randomised A/B test of the offer, predicts for each customer how much the offer changes their churn probability, so the budget goes to the persuadables.",
      howItHappens: [
        "Run a randomised experiment: a random half of at-risk customers get the 12-month contract offer, the rest are the control group.",
        "Train a model that estimates churn probability with and without the offer for each customer (two-model approach or causal forest).",
        "Compute uplift = churn probability without the offer minus churn probability with it, then rank customers by uplift.",
        "Validate on held-out experiment data with an uplift or Qini curve.",
        "Roll out to the top slice and keep a small random holdout to confirm the lift in a follow-up A/B test.",
      ],
      whyImportant:
        "Retention offers cost money, and every one given to a sure thing or a lost cause is wasted. Targeting by uplift instead of by risk score often keeps the same number of customers for a fraction of the cost, and the follow-up A/B test is the only convincing proof that the programme works.",
      tools: [
        { name: "CausalML", type: "Uplift library", note: "Uplift trees and the S, T and X meta-learners from Uber" },
        { name: "EconML", type: "Causal ML library", note: "Causal forests that estimate a separate effect for every customer" },
        { name: "scikit-uplift", type: "Uplift library", note: "Uplift approaches plus Qini and uplift-curve metrics (imported as sklift)" },
        { name: "statsmodels", type: "Statistics toolkit", note: "Power analysis and proportion tests to size and read the A/B test" },
        { name: "Statsig / Optimizely", type: "Experimentation platform", note: "Handles random assignment, guardrail metrics and result dashboards" },
      ],
      commonProblems: [
        "Non-random assignment to the offer, which makes the treated and control groups incomparable.",
        "An experiment too small to detect the expected lift, giving a noisy 'it works' result.",
        "Ranking by churn score and calling it uplift, which targets sure things and lost causes.",
        "Spillover and novelty effects: customers talk to each other, so the control group is contaminated.",
      ],
    },
    sampleKey: "uplift_modeling",
  },
  {
    id: "forecasting",
    level: "advanced",
    category: "decision",
    label: "Time-Series Forecasting",
    shortLabel: "Forecast",
    icon: "LineChart",
    position: g(1, 2),
    details: {
      summary: "Predicts how many customers will churn next month, for planning.",
      whatHappens:
        "The churn model says which customers might leave; planning teams also need to know how many will leave to size the retention team and estimate revenue at risk. Forecasting turns the history of monthly churn counts into a prediction with an uncertainty range, taking trend, yearly seasonality (more cancellations after a holiday promotion ends) and known events into account.",
      howItHappens: [
        "Aggregate the cleaned data into a regular series, such as renewal-window churners per month for 24 months.",
        "Plot the series and decompose it into trend, seasonality and noise.",
        "Choose a model: seasonal ARIMA (SARIMAX), exponential smoothing or Prophet, plus a naive 'same month last year' baseline.",
        "Backtest on rolling time windows, never random splits, and compare errors such as MAPE.",
        "Forecast the next period with an 80% prediction interval: about 4,820 churners, between 4,430 and 5,210.",
      ],
      whyImportant:
        "Staffing, budgets and revenue targets depend on volumes, not on individual scores. A forecast with an honest range lets the business plan for the likely case and prepare for the bad one, and a surprising miss is an early signal that something in the market has changed.",
      tools: [
        { name: "statsmodels", type: "Statistical models", note: "SARIMAX and exponential smoothing with clear diagnostics" },
        { name: "Prophet", type: "Forecasting library", note: "Handles trend, holidays and yearly seasonality with little tuning" },
        { name: "sktime", type: "Time-series ML", note: "One scikit-learn-style interface for forecasting, backtesting and evaluation" },
        { name: "StatsForecast", type: "Fast statistical forecasting", note: "AutoARIMA and AutoETS across thousands of series in seconds" },
      ],
      commonProblems: [
        "Random train and test splits that leak the future into the past and flatter the model.",
        "Ignoring one-off events (a price rise, an outage) that distort the trend.",
        "Reporting a single number without a prediction interval.",
        "Too little history to see yearly seasonality, which needs at least two full cycles.",
      ],
    },
    sampleKey: "forecasting",
  },
  {
    id: "fairness_audit",
    level: "advanced",
    category: "evaluation",
    label: "Fairness & Bias Audit",
    shortLabel: "Fairness",
    icon: "Scale",
    position: g(3, 4),
    details: {
      summary: "Checks that the model does not work much worse for some groups of people.",
      whatHappens:
        "Average performance can hide a model that is far less accurate for one group. In the audit, the data scientist splits the test results by sensitive attributes such as age band and compares metrics like recall and false-positive rate between groups. If the gaps are larger than the agreed tolerance, mitigations such as reweighting or fairness-constrained training are applied and the trade-off with overall performance is checked again.",
      howItHappens: [
        "Choose the groups to audit and the fairness question, for example: is recall for customers aged 65 and over close to recall for everyone else?",
        "Split the test predictions by group and compute recall, precision and false-positive rate for each.",
        "Quantify the gaps and compare them with an agreed tolerance such as 0.05.",
        "Look for proxy features (a postcode column standing in for ethnicity) using SHAP and correlation checks.",
        "Apply a mitigation, then re-measure both the group gaps and the overall performance.",
        "Document the findings and decisions in a model card for sign-off.",
      ],
      whyImportant:
        "A model that quietly fails for one group causes real harm, such as missed retention offers or worse service, and creates legal and reputational risk. Auditing before launch is far cheaper than discovering the gap in a news story or a regulator's letter.",
      tools: [
        { name: "Fairlearn", type: "Fairness toolkit", note: "MetricFrame compares metrics by group; mitigation algorithms such as ExponentiatedGradient" },
        { name: "AI Fairness 360", type: "Fairness toolkit", note: "IBM's collection of bias metrics and mitigation algorithms" },
        { name: "Aequitas", type: "Bias audit toolkit", note: "Produces a readable audit report of group disparities" },
        { name: "Model Cards", type: "Documentation practice", note: "A standard one-page record of intended use, performance by group and limits" },
      ],
      commonProblems: [
        "Removing the sensitive column and assuming the model is now fair, while proxies keep the same signal.",
        "Auditing one metric only, although equal recall and equal precision cannot always both be achieved.",
        "Groups too small to measure, so gaps are either noise or invisible.",
        "A mitigation that conflicts with law or company policy, such as using a protected attribute directly in decisions.",
      ],
    },
    sampleKey: "fairness_audit",
  },
  {
    id: "production_handoff",
    level: "advanced",
    category: "delivery",
    label: "Hand-off to Production",
    shortLabel: "Deploy",
    icon: "Rocket",
    position: g(1, 3),
    details: {
      summary: "Packages the approved model so engineers can run it reliably on live customers.",
      whatHappens:
        "A notebook model is not yet a product. In the hand-off the data scientist and ML engineers register the approved model, package the feature code with it and deploy it either as a nightly batch job that scores every customer in the renewal window or as a real-time API. They agree on inputs, outputs, latency, tests and who is on call, so that scores reliably land where the retention team works.",
      howItHappens: [
        "Register the winning run in a model registry with a version number and a stage (candidate, staging, production).",
        "Package the model together with its exact preprocessing code into a container or pipeline artifact.",
        "Add tests: the input schema, a handful of known customers with expected scores, and performance and fairness gates.",
        "Deploy as a batch job or a real-time endpoint, using a shadow or canary release to compare with the current process.",
        "Write the hand-over: model card, runbook, owners and the retraining plan.",
      ],
      whyImportant:
        "Many promising models never leave the notebook because nobody planned how to run, test and own them. A clean hand-off turns months of analysis into a service the business can rely on, and stops data science and engineering from blaming each other when something fails.",
      tools: [
        { name: "MLflow Model Registry", type: "Model registry", note: "Versioned models with stage transitions such as Staging and Production" },
        { name: "Docker", type: "Containers", note: "Freezes the model, libraries and code into one runnable image" },
        { name: "FastAPI", type: "Web framework", note: "Serves predictions as a documented REST endpoint with input validation" },
        { name: "BentoML", type: "Model serving", note: "Packages a trained model into a deployable service with batching built in" },
        { name: "Amazon SageMaker / Vertex AI", type: "Managed ML platform", note: "Managed endpoints and batch scoring on AWS and Google Cloud" },
      ],
      commonProblems: [
        "Training-serving skew: the live feature code differs from the notebook code, so scores quietly change.",
        "Pickled models tied to one library version that break when the environment is rebuilt.",
        "No owner or on-call plan, so when scores stop arriving nobody notices for weeks.",
        "Building a real-time API when a simple nightly batch would have been cheaper and enough.",
      ],
    },
    sampleKey: "production_handoff",
  },
  {
    id: "monitoring",
    level: "advanced",
    category: "delivery",
    label: "Drift & Performance Monitoring",
    shortLabel: "Monitor",
    icon: "Activity",
    position: g(0, 3),
    details: {
      summary: "Watches the live model for changing data and falling accuracy.",
      whatHappens:
        "The world changes after launch: prices rise, a competitor appears, a new product is sold. When live data stops looking like the training data (data drift), or the link between features and churn changes (concept drift), the model slowly gets worse without raising any error. Monitoring compares live inputs and scores with the training baseline every day and compares predictions with real outcomes as they arrive 30 days later.",
      howItHappens: [
        "Log every live input and score together with the model version.",
        "Compare live feature distributions with the training baseline using the Population Stability Index (PSI) or a Kolmogorov-Smirnov test.",
        "When true outcomes arrive 30 days later, compute live recall and precision and compare them with the launch values.",
        "Alert when thresholds are crossed, for example PSI above 0.25 or recall dropping by more than five points.",
        "Trigger a review or retraining on fresh data and revisit the original problem framing if the business has changed.",
      ],
      whyImportant:
        "A deployed model is not finished; it ages. Without monitoring you learn that predictions went bad when the quarterly numbers disappoint, long after the damage started. Monitoring turns model decay into routine maintenance and closes the loop back to the first stage: is this still the right question?",
      tools: [
        { name: "Evidently", type: "Open-source monitoring", note: "Data drift, target drift and model-quality reports in a few lines of Python" },
        { name: "NannyML", type: "Performance estimation", note: "Estimates model performance before labels arrive" },
        { name: "whylogs", type: "Data logging", note: "Lightweight statistical profiles of live data that are cheap to store and compare" },
        { name: "Prometheus + Grafana", type: "Metrics and dashboards", note: "Tracks latency, error rate and custom drift metrics with alerting" },
      ],
      commonProblems: [
        "Waiting for labels: churn is only known 30 days later, so performance problems show up late unless drift is watched too.",
        "Too many noisy alerts, until the team learns to ignore all of them.",
        "Comparing with the wrong baseline, such as last week instead of the training data.",
        "Retraining automatically on drifted data without checking it, which can bake the problem into the model.",
      ],
    },
    sampleKey: "monitoring",
  },
];

// The path the "Play data flow" packet follows at each level (node ids, in order).
export const playPaths = {
  basic: ["problem_framing", "data_collection", "cleaning", "eda", "model_training", "evaluation"],
  medium: [
    "problem_framing",
    "data_collection",
    "cleaning",
    "eda",
    "feature_engineering",
    "data_split",
    "model_training",
    "tuning",
    "evaluation",
    "interpretation",
    "communication",
  ],
  advanced: [
    "problem_framing",
    "data_collection",
    "cleaning",
    "eda",
    "feature_engineering",
    "data_split",
    "model_training",
    "tuning",
    "evaluation",
    "interpretation",
    "causal_inference",
    "uplift_modeling",
    "communication",
    "production_handoff",
    "monitoring",
  ],
};

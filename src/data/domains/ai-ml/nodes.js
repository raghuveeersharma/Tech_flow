// Node schema:
// {
//   id, level, category, label, shortLabel, icon,
//   position,                // layout used at the first level the node appears
//   positionByLevel?,        // optional overrides: { medium: {x,y}, advanced: {x,y} } (falls back to the previous level)
//   details: { summary, whatHappens, howItHappens[], whyImportant, tools[{name,type,note}], commonProblems[] },
//   sampleKey
// }
// `level` is the FIRST level at which the node appears (levels are cumulative).
//
// Layout (medium and advanced share one grid, columns 0-5 and rows 0-3):
//   row 0:                         AutoML(3)   Tracking(4)   Edge(5)
//   row 1 (build):  Label Prep Features Train Evaluate Registry
//   row 2:                  Batch(2) GPU Train(3) Explain(4) Governance(5)
//   row 3 (run):    Retrain Drift Monitor Deploy Rollout CI/CD
import { g } from "../../grid";

export const nodes = [
  // =====================================================================
  // BASIC
  // =====================================================================
  {
    id: "data_labeling",
    level: "basic",
    category: "data",
    label: "Data Collection & Labeling",
    shortLabel: "Labeling",
    icon: "Tags",
    position: g(0, 1),
    details: {
      summary: "Collects raw payments and attaches the known answer (fraud or legitimate) so a model can learn from them.",
      whatHappens:
        "Supervised machine learning learns from examples where the right answer is already known. For fraud detection, the checkout system logs every card payment, and weeks later the answer arrives: the cardholder disputes the charge (a chargeback) or a fraud analyst confirms it. Joining each payment with that outcome, called a label, turns a plain log line into a training example.",
      howItHappens: [
        "The checkout service writes every payment (amount, merchant, card country, device, time) to an event log or table.",
        "Labels arrive later from several sources: chargeback reports from the bank, decisions by analysts in a review queue and reports from customers.",
        "A labeling job joins each payment to its outcome by transaction id and marks it fraud (1) or legitimate (0).",
        "Because fewer than 1% of payments are fraud, the team tracks the class imbalance and may ask analysts to label extra borderline cases in an annotation tool.",
        "Quality rules check the labels: a second reviewer for hard cases, a maximum label delay and no conflicting labels for one transaction.",
      ],
      whyImportant:
        "A model can never be better than its labels. If chargebacks arrive late or reviewers disagree, the model learns a blurry picture of fraud. Teams that invest in clean, well-documented labels often gain more accuracy than teams that only try fancier algorithms.",
      tools: [
        { name: "Label Studio", type: "Open-source annotation", note: "Web UI for analyst review queues and custom labeling tasks" },
        { name: "Labelbox", type: "Managed labeling platform", note: "Labeling workflows with reviewer consensus and quality metrics" },
        { name: "Amazon SageMaker Ground Truth", type: "Managed labeling service", note: "Human labelers plus automatic pre-labeling on AWS" },
        { name: "Snorkel", type: "Weak supervision", note: "Write labeling functions to label large volumes programmatically" },
        { name: "Apache Kafka", type: "Event streaming", note: "Captures raw payment events as they happen" },
      ],
      commonProblems: [
        "Label delay: chargebacks can take 30 to 90 days, so the newest payments have no label yet.",
        "Label noise: analysts disagree, or a genuine purchase is later disputed and wrongly marked as fraud.",
        "Extreme class imbalance: only a handful of fraud rows among hundreds of legitimate ones.",
        "Selection bias: declined payments never get an outcome, so the model never learns whether they were really fraud.",
      ],
    },
    sampleKey: "data_labeling",
  },
  {
    id: "data_prep",
    level: "basic",
    category: "data",
    label: "Data Preparation",
    shortLabel: "Data Prep",
    icon: "Eraser",
    position: g(1, 1),
    details: {
      summary: "Cleans, validates and splits the labeled data into versioned training and test sets.",
      whatHappens:
        "Labeled data is rarely ready to learn from. This stage removes duplicates, fixes formats (for example upper-casing country codes and translating merchant category codes into readable groups), handles missing values and checks the data against expectations. It then splits the rows into training, validation and test sets and freezes them as a numbered dataset version, so any model can be traced back to the exact data it saw.",
      howItHappens: [
        "Load the labeled payments for the chosen date range and drop exact duplicates by transaction id.",
        "Standardise values: convert currencies, upper-case country codes and map merchant category code 5732 to the group 'electronics'.",
        "Run data validation rules (no empty amounts, countries on the allowed list, fraud rate in the expected range) and stop the job if they fail.",
        "Split by time rather than at random: older payments for training and the newest weeks for testing, so the test imitates the future.",
        "Save the result as a versioned dataset (txn-2026-10@v14) with a record of the code and raw files that produced it.",
      ],
      whyImportant:
        "Mistakes made here silently poison everything that follows. A split that leaks future information into training makes the model look brilliant in testing and fail in production. Versioned, validated datasets also make results reproducible, which matters when an auditor or teammate asks what data a model was trained on.",
      tools: [
        { name: "pandas", type: "Python library", note: "Cleaning and reshaping tables that fit on one machine" },
        { name: "Great Expectations", type: "Data validation", note: "Declare rules such as 'amount is never null' and get a pass/fail report" },
        { name: "DVC", type: "Data version control", note: "Git-style versions of datasets, stored in cloud storage" },
        { name: "Apache Spark", type: "Distributed engine", note: "Prepares hundreds of millions of rows across a cluster" },
        { name: "scikit-learn", type: "Python library", note: "train_test_split and preprocessing pipelines that can be reused at serving time" },
      ],
      commonProblems: [
        "Data leakage: a column that is only known after the fact, such as a chargeback flag, sneaks in as an input.",
        "Random splits on time-ordered data, which hide how the model behaves on genuinely new payments.",
        "Dropping rows with missing values and quietly changing the fraud rate of the dataset.",
        "Unversioned data (final_v2_really_final.csv), so nobody can reproduce a training run.",
      ],
    },
    sampleKey: "data_prep",
  },
  {
    id: "training",
    level: "basic",
    category: "training",
    label: "Model Training",
    shortLabel: "Training",
    icon: "Brain",
    position: g(2, 1),
    positionByLevel: { medium: g(3, 1) },
    details: {
      summary: "A learning algorithm studies the labeled payments and adjusts itself until it can tell fraud from normal behavior.",
      whatHappens:
        "Training is where the model actually learns. The algorithm (here a gradient-boosted tree model) looks at each training row, makes a guess, compares it with the true label and nudges its internal settings to make fewer mistakes. This repeats across hundreds of small decision trees until the errors stop shrinking. The result is a model artifact: a file that holds the learned rules.",
      howItHappens: [
        "A training job starts in a reproducible environment (a container with fixed library versions) and loads the dataset version.",
        "Choose a model family and starting hyperparameters, the settings you pick before learning begins, such as tree depth and learning rate.",
        "Fit the model: each round adds a new decision tree that corrects the mistakes of the previous ones, with extra weight on the rare fraud rows.",
        "Use a validation set to stop early when the score stops improving, which prevents overfitting (memorising the training rows).",
        "Save the trained model, its settings and the training metrics as an artifact with a run id such as run-4821.",
      ],
      whyImportant:
        "Training turns data into the thing that makes decisions, so it has to be repeatable. If nobody can rerun a training job and get the same model, you cannot debug a bad result or safely improve it. Good teams treat training as a pipeline written as code, not as a notebook someone ran once.",
      tools: [
        { name: "XGBoost", type: "Gradient boosting", note: "Fast, accurate trees and a strong default for tabular data like payments" },
        { name: "LightGBM", type: "Gradient boosting", note: "Very fast on large tables with many features" },
        { name: "scikit-learn", type: "ML library", note: "Classical algorithms with one consistent API, good for baselines" },
        { name: "PyTorch", type: "Deep learning framework", note: "Flexible neural networks, for example sequence models over a card's history" },
        { name: "TensorFlow", type: "Deep learning framework", note: "Neural networks with a mature path to production and mobile" },
      ],
      commonProblems: [
        "Overfitting: excellent training scores but poor results on new payments.",
        "Ignoring class imbalance, so the model learns to say 'not fraud' every time and still looks 99% accurate.",
        "Runs that cannot be reproduced because seeds, library versions or the data were not recorded.",
        "Training on a laptop in a different environment from production, which causes surprises later.",
      ],
    },
    sampleKey: "training",
  },
  {
    id: "evaluation",
    level: "basic",
    category: "validation",
    label: "Evaluation",
    shortLabel: "Evaluation",
    icon: "Target",
    position: g(3, 1),
    positionByLevel: { medium: g(4, 1) },
    details: {
      summary: "Measures on unseen payments whether the model is good enough, and better than what is already in production.",
      whatHappens:
        "Evaluation tests the trained model on rows it has never seen, using the true labels as an answer key. For fraud, plain accuracy is useless because 99% of payments are legitimate, so teams look at precision (of the payments flagged, how many were really fraud), recall (of all real fraud, how many were caught) and AUC (how well the model ranks fraud above normal payments). The numbers are compared with the current production model and with business limits.",
      howItHappens: [
        "Score the held-out test set, which was frozen during data preparation and never used for training.",
        "Compute metrics: AUC, precision and recall at the chosen decision threshold (here 0.85) and a confusion matrix.",
        "Slice the results by country, merchant category and amount range to find groups where the model is weak.",
        "Compare against the production model (the champion) and against a simple baseline rule.",
        "Apply a pass/fail gate, for example AUC of at least 0.95 and precision of at least 0.90, and store the verdict next to the run.",
      ],
      whyImportant:
        "A model that looks great on its training data can still fail in the real world. Evaluation is the last cheap place to catch that: declining a good customer costs revenue and trust, while missing fraud costs money. A clear, automated gate also stops a worse model from replacing a better one by accident.",
      tools: [
        { name: "scikit-learn metrics", type: "Python library", note: "roc_auc_score, precision_recall_curve and confusion matrices" },
        { name: "MLflow Evaluate", type: "Evaluation framework", note: "Computes metrics and plots and compares a model with a baseline" },
        { name: "Evidently", type: "Reports and tests", note: "Model quality reports with pass/fail test suites" },
        { name: "Deepchecks", type: "Testing library", note: "Validation suites that flag leakage, weak segments and overfitting" },
        { name: "TensorFlow Model Analysis", type: "Sliced evaluation", note: "Metrics broken down by feature slices at scale" },
      ],
      commonProblems: [
        "Judging by accuracy, which looks excellent even for a model that never flags fraud.",
        "Tuning the model or threshold repeatedly on the test set, so the test no longer measures anything.",
        "Good overall numbers that hide a bad slice, such as one country or one merchant type.",
        "Very few fraud cases in the test set, so recall swings widely from one run to the next.",
      ],
    },
    sampleKey: "evaluation",
  },
  {
    id: "deployment",
    level: "basic",
    category: "serving",
    label: "Deployment (Model Serving)",
    shortLabel: "Serving",
    icon: "Rocket",
    position: g(4, 1),
    positionByLevel: { medium: g(3, 3) },
    details: {
      summary: "Puts the model behind a real-time API so the checkout can get a fraud score in milliseconds.",
      whatHappens:
        "A model file does nothing until an application can call it. Deployment wraps the model in a service with an HTTP or gRPC endpoint. When a payment arrives, the checkout sends its features, the model returns a fraud score between 0 and 1, and simple business rules turn the score into a decision: APPROVE, REVIEW or DECLINE. The whole round trip must finish in tens of milliseconds because a customer is waiting.",
      howItHappens: [
        "Package the model, its code and library dependencies into a container image.",
        "Run the container on a serving platform that exposes an endpoint and adds or removes copies as traffic changes.",
        "The checkout service sends a request containing the payment's features.",
        "The model returns a score such as 0.91, and thresholds turn it into a decision (below 0.30 APPROVE, 0.30 to 0.85 REVIEW, 0.85 or more DECLINE).",
        "Every request, score and decision is logged together with the model version for later monitoring.",
      ],
      whyImportant:
        "This is the moment the model starts affecting real customers and real money. Latency, availability and correct versioning matter as much as accuracy: a perfect model that times out blocks every payment, and an unlabeled version makes incidents impossible to debug.",
      tools: [
        { name: "KServe", type: "Kubernetes model serving", note: "Standard inference service with autoscaling and canary support" },
        { name: "BentoML", type: "Model packaging and serving", note: "Turns a model into a Python API and a container image" },
        { name: "NVIDIA Triton Inference Server", type: "High-performance server", note: "Serves many frameworks with batching and GPU support" },
        { name: "Amazon SageMaker Endpoints", type: "Managed serving", note: "Fully managed real-time endpoints on AWS" },
        { name: "TorchServe", type: "PyTorch serving", note: "Official serving tool for PyTorch models" },
      ],
      commonProblems: [
        "Latency spikes from cold starts, oversized models or slow lookups of input features.",
        "Training-serving skew: features computed differently online than they were in training.",
        "No agreed fallback when the model is down, so payments fail or all pass unchecked.",
        "Thresholds hard-coded in application code, so changing them needs a full release.",
      ],
    },
    sampleKey: "deployment",
  },
  {
    id: "monitoring",
    level: "basic",
    category: "monitoring",
    label: "Monitoring",
    shortLabel: "Monitoring",
    icon: "Activity",
    position: g(5, 1),
    positionByLevel: { medium: g(2, 3) },
    details: {
      summary: "Watches the live system and the model's behavior so outages and quality problems are caught early.",
      whatHappens:
        "Once the model is live the work is not finished, because its environment keeps changing. Monitoring collects prediction logs and turns them into dashboards and alerts. It watches system health (latency, errors, traffic) and model behavior (average fraud score, share of declines, input values) and, when real outcomes arrive later, the actual precision and recall.",
      howItHappens: [
        "The endpoint emits metrics for every request: latency, status code and model version.",
        "Prediction logs (inputs, score, decision) are written to a log store or stream.",
        "A job aggregates the logs per hour: request count, 95th percentile latency, average score and decline rate.",
        "Alert rules compare each number with its normal range and notify the on-call engineer through Slack or a paging tool when one breaks.",
        "As chargebacks arrive, the delayed ground truth is joined back to the predictions to measure true quality over time.",
      ],
      whyImportant:
        "Unlike ordinary software, a model can be running perfectly and still be wrong, because it fails silently when the world changes. Monitoring is how you notice before customers or the finance team do, and it supplies the evidence for the next round of training.",
      tools: [
        { name: "Prometheus", type: "Metrics database", note: "Collects latency, error and traffic metrics from the endpoint" },
        { name: "Grafana", type: "Dashboards", note: "Dashboards and alert rules over Prometheus or log data" },
        { name: "Evidently", type: "ML monitoring", note: "Open-source reports and monitors for data and model quality" },
        { name: "Arize AI", type: "ML observability", note: "Hosted platform for tracking performance and troubleshooting models" },
        { name: "WhyLabs", type: "ML observability", note: "Lightweight data profiles with whylogs and alerting" },
      ],
      commonProblems: [
        "Watching only servers (latency, CPU) and never the quality of the predictions.",
        "Delayed labels, so true accuracy is unknown for weeks after a problem starts.",
        "Alert fatigue from thresholds that fire on normal daily and weekly patterns.",
        "Inputs are not logged, so nobody can investigate a bad decision afterwards.",
      ],
    },
    sampleKey: "monitoring",
  },

  // =====================================================================
  // MEDIUM
  // =====================================================================
  {
    id: "feature_store",
    level: "medium",
    category: "data",
    label: "Feature Store",
    shortLabel: "Features",
    icon: "DatabaseZap",
    position: g(2, 1),
    details: {
      summary: "A shared catalogue of ready-made model inputs (features) that training and live serving read from the same definitions.",
      whatHappens:
        "A feature is a measurable fact fed to the model, such as 'how many payments this card made in the last hour' or 'how many times larger than usual this amount is'. A feature store computes each feature once, keeps it for both large offline training jobs and millisecond online lookups, and guarantees that both use identical logic. That removes a classic bug in which a model trains on one definition and is served another.",
      howItHappens: [
        "Engineers define each feature once in code, with its source table, owner and calculation (for example a rolling one-hour count per card).",
        "A pipeline computes the values from raw events and writes them to an offline store, such as a warehouse or lake, for training.",
        "The latest values are copied to a low-latency online store such as Redis or DynamoDB for live requests.",
        "For training, the store does a point-in-time join: each payment receives the feature values as they were at that exact moment, never later ones.",
        "Other teams discover and reuse features through a catalogue with documentation and freshness checks.",
      ],
      whyImportant:
        "Feature code written separately for training and serving almost always drifts apart, and the model quietly underperforms. A feature store gives one source of truth, saves each team from rebuilding the same features and makes point-in-time correctness the default instead of something people must remember.",
      tools: [
        { name: "Feast", type: "Open-source feature store", note: "Defines features in code and serves them offline and online" },
        { name: "Tecton", type: "Managed feature platform", note: "Real-time and streaming features with managed pipelines" },
        { name: "Hopsworks", type: "Feature store platform", note: "Feature store with built-in versioning and monitoring" },
        { name: "Amazon SageMaker Feature Store", type: "Managed feature store", note: "Offline and online stores integrated with AWS" },
        { name: "Vertex AI Feature Store", type: "Managed feature store", note: "Serves features from BigQuery on Google Cloud" },
      ],
      commonProblems: [
        "Training-serving skew: the online feature is calculated differently from the one used in training.",
        "Point-in-time leakage: using today's value of a feature to explain a payment from last month.",
        "Stale online values when the feature pipeline falls behind, so the model sees old data.",
        "Feature sprawl: hundreds of features with no owner, no documentation and no usage tracking.",
      ],
    },
    sampleKey: "feature_store",
  },
  {
    id: "experiment_tracking",
    level: "medium",
    category: "training",
    label: "Experiment Tracking",
    shortLabel: "Experiments",
    icon: "LineChart",
    position: g(4, 0),
    details: {
      summary: "Records every training run's settings, data version, code and results so runs can be compared and reproduced.",
      whatHappens:
        "Teams run dozens or hundreds of training experiments while searching for a better model. Experiment tracking is the lab notebook that keeps them straight. For each run it stores the hyperparameters, the dataset version, the Git commit of the code, the metrics and the produced files, so anyone can compare runs side by side and rerun the best one exactly.",
      howItHappens: [
        "The training code calls a small logging API at the start of a run, which opens a new run with a unique id.",
        "It logs parameters (tree depth, learning rate), the dataset version and the Git commit hash.",
        "During and after training it logs metrics such as train and validation AUC, step by step if useful.",
        "Output files (model, plots, feature importance) are stored as artifacts attached to the run.",
        "A web UI lets people sort, filter and chart runs and tag the best one for registration.",
      ],
      whyImportant:
        "Without tracking, the best model lives in someone's memory and a notebook called final_v3. With it, results are reproducible, teammates build on each other's work instead of repeating it, and you can show exactly how a production model was produced.",
      tools: [
        { name: "MLflow Tracking", type: "Open-source tracking", note: "Logs parameters, metrics and artifacts with a simple Python API" },
        { name: "Weights & Biases", type: "Hosted tracking", note: "Rich dashboards for comparing runs and sharing results" },
        { name: "Neptune", type: "Hosted tracking", note: "Metadata store for large numbers of runs" },
        { name: "Comet", type: "Hosted tracking", note: "Experiment comparison with model production monitoring" },
        { name: "TensorBoard", type: "Training visualizer", note: "Live loss and metric curves for TensorFlow and PyTorch jobs" },
      ],
      commonProblems: [
        "The data version or code commit is not logged, so a good run cannot be reproduced.",
        "Hundreds of runs with no names or tags, which makes the best one impossible to find.",
        "Only the final metric is logged, hiding how the run behaved while it trained.",
        "Runs trained on different datasets are compared as if the numbers were equal.",
      ],
    },
    sampleKey: "experiment_tracking",
  },
  {
    id: "model_registry",
    level: "medium",
    category: "validation",
    label: "Model Registry",
    shortLabel: "Registry",
    icon: "PackageCheck",
    position: g(5, 1),
    details: {
      summary: "A versioned library of approved models with a clear label for which one is the current production model.",
      whatHappens:
        "The registry is the catalogue of finished models. When a run passes evaluation, its artifact is registered under a model name (fraud-detector) and receives a version number. Each version links back to its run, data and metrics, and carries a label such as 'candidate' or 'champion' that deployment tools read to know which version to serve. Rolling back means pointing the label at the previous version.",
      howItHappens: [
        "A passing run registers its artifact under a model name, which creates a new version (version 7).",
        "The registry stores links to the source run, the dataset version, the metrics and the model signature (expected inputs and outputs).",
        "People or automation add aliases or tags such as 'candidate' and 'champion' as the model moves toward production.",
        "Deployment and batch jobs ask the registry for 'the champion version' instead of using a hard-coded file path.",
        "Every change is logged with who made it and when, which gives an audit trail.",
      ],
      whyImportant:
        "Without a registry, teams share models through file paths and chat messages and nobody is sure which version is live. A registry makes releases, rollbacks and audits routine: you can answer 'which model scored this payment last Tuesday?' in seconds.",
      tools: [
        { name: "MLflow Model Registry", type: "Open-source registry", note: "Versions and aliases linked to the tracked run" },
        { name: "Amazon SageMaker Model Registry", type: "Managed registry", note: "Model packages with approval status on AWS" },
        { name: "Vertex AI Model Registry", type: "Managed registry", note: "Central model versions for Google Cloud deployments" },
        { name: "Weights & Biases Registry", type: "Hosted registry", note: "Links registered models to the experiments that built them" },
        { name: "Azure Machine Learning registries", type: "Managed registry", note: "Share models across workspaces and teams on Azure" },
      ],
      commonProblems: [
        "Promoting models by hand with no checks, so an untested version reaches production.",
        "Overwriting a version instead of creating a new one, which destroys the audit trail.",
        "Missing metadata, so nobody knows which data or code produced a version.",
        "The registry says one version is champion while a different one is actually deployed.",
      ],
    },
    sampleKey: "model_registry",
  },
  {
    id: "cicd",
    level: "medium",
    category: "automation",
    label: "CI/CD for ML",
    shortLabel: "CI/CD",
    icon: "GitBranch",
    position: g(5, 3),
    details: {
      summary: "Automatically tests the model, packages it and releases it through the same gated pipeline used for software.",
      whatHappens:
        "CI/CD for machine learning (continuous integration and continuous delivery) applies the discipline of software releases to models. When a new version is registered, an automated pipeline checks the code, the data and the model, builds a container image and deploys it to a test environment before production. Nothing reaches customers unless every check passes, and every release is repeatable.",
      howItHappens: [
        "A trigger fires: a pull request on the training code or a new model version in the registry.",
        "Unit tests check the code and data tests check the schema and value ranges.",
        "Model tests run a performance gate (AUC of at least 0.95), a latency test and a check that known payments get the expected scores.",
        "The pipeline builds a container image, tags it with the model version and pushes it to an image registry.",
        "It deploys to a staging environment, runs smoke tests and, on success, marks the release ready for production.",
      ],
      whyImportant:
        "Manual releases are slow and error-prone, and a bad model can cost real money within minutes. Automated gates make shipping fast and safe at the same time, and turn a rollback into a button press instead of an emergency.",
      tools: [
        { name: "GitHub Actions", type: "CI/CD service", note: "Workflows that test code and models on every pull request" },
        { name: "GitLab CI/CD", type: "CI/CD service", note: "Pipelines defined in a single YAML file next to the code" },
        { name: "Jenkins", type: "Automation server", note: "Self-hosted pipelines with a huge plugin ecosystem" },
        { name: "Argo CD", type: "GitOps deployment", note: "Keeps the cluster in sync with the versions declared in Git" },
        { name: "CML (Continuous Machine Learning)", type: "CI for ML", note: "Posts training metrics and plots as comments on pull requests" },
      ],
      commonProblems: [
        "Tests that cover the code but never the data or the quality of the model.",
        "Flaky tests that people learn to ignore until a real failure slips through.",
        "Pipelines that take hours, so people find ways to skip them.",
        "A staging environment whose data looks nothing like production.",
      ],
    },
    sampleKey: "cicd",
  },
  {
    id: "batch_inference",
    level: "medium",
    category: "serving",
    label: "Batch Inference",
    shortLabel: "Batch",
    icon: "Clock",
    position: g(2, 2),
    details: {
      summary: "Scores large piles of records on a schedule, the alternative to answering one payment at a time in real time.",
      whatHappens:
        "Real-time serving answers one payment in milliseconds, but many jobs do not need that. Batch inference runs the same model over millions of rows at once, for example overnight, and writes the scores to a table. Teams use it to rank accounts for analyst review, to re-score history with a new model or to feed dashboards. It is cheaper and simpler than real time because nobody waits for each answer.",
      howItHappens: [
        "A scheduler starts the job at a fixed time or when a new model version is released.",
        "The job reads the day's rows with their historical feature values from the offline feature store.",
        "It loads the champion model from the registry once and scores the data in large chunks, often in parallel.",
        "Scores and risk bands are written to a warehouse table together with the model version and the job id.",
        "Downstream users, such as the analyst review queue, reports and monitoring, read from that table.",
      ],
      whyImportant:
        "Choosing between batch and real-time is one of the first design decisions in any ML product. Batch is far cheaper and easier to operate, while real time is needed only when a decision must be made instantly. Running both from the same model and features also lets you spot mismatches between them.",
      tools: [
        { name: "Apache Spark", type: "Distributed batch engine", note: "Scores very large tables in parallel across a cluster" },
        { name: "Apache Airflow", type: "Workflow scheduler", note: "Runs the scoring job on a schedule with retries and alerts" },
        { name: "Amazon SageMaker Batch Transform", type: "Managed batch scoring", note: "Runs a model over files in S3 without a permanent endpoint" },
        { name: "Vertex AI batch prediction", type: "Managed batch scoring", note: "Scores BigQuery tables or files with a registered model" },
        { name: "Ray Data", type: "Distributed data processing", note: "Streams data through a model on many CPUs or GPUs" },
      ],
      commonProblems: [
        "Stale scores: yesterday's batch results are used for decisions that need fresh information.",
        "Batch and online features are computed differently, so the same payment gets two different scores.",
        "A job fails halfway and leaves a table that is part new and part old.",
        "Nobody records which model version produced which scores.",
      ],
    },
    sampleKey: "batch_inference",
  },
  {
    id: "drift_detection",
    level: "medium",
    category: "monitoring",
    label: "Drift Detection",
    shortLabel: "Drift",
    icon: "TrendingUp",
    position: g(1, 3),
    details: {
      summary: "Detects when live data or model behavior has moved away from what the model was trained on.",
      whatHappens:
        "Models assume that tomorrow looks like the data they learned from. Data drift is when the inputs change, for instance more payments per hour during a holiday sale. Concept drift is when the link between inputs and fraud changes, for instance when criminals invent a new trick. Drift detection compares live feature distributions with a reference sample from training and raises an alert when the gap passes a limit, often before quality metrics show any damage.",
      howItHappens: [
        "Pick a reference window, usually the training data, and a current window such as the last 24 hours.",
        "For each feature, measure the distance between the two distributions with a statistical test or a score such as the Population Stability Index (PSI) or the Kolmogorov-Smirnov test.",
        "Compare the score with a threshold; a PSI above 0.25 is a common rule of thumb for a large shift.",
        "Also track the distribution of the model's scores and, when labels arrive, the real precision and recall.",
        "Send an alert listing the drifting features so a person can investigate or start a retraining run.",
      ],
      whyImportant:
        "Drift is the most common reason a good model slowly goes bad. Fraud labels arrive weeks late, so waiting for accuracy numbers would mean weeks of silent losses, while drift checks give an early warning within hours.",
      tools: [
        { name: "Evidently", type: "Open-source drift reports", note: "Drift tests per feature with ready-made reports" },
        { name: "WhyLabs", type: "ML observability", note: "Profiles data with whylogs and alerts on distribution changes" },
        { name: "Arize AI", type: "ML observability", note: "Drift monitors with root-cause views per feature" },
        { name: "NannyML", type: "Performance estimation", note: "Estimates model quality even before labels arrive" },
        { name: "Alibi Detect", type: "Drift and outlier library", note: "Statistical drift detectors for tabular, text and image data" },
      ],
      commonProblems: [
        "Too many alerts because normal seasonality, such as weekends, is treated as drift.",
        "Alerting on every feature instead of the ones the model really depends on.",
        "A stale reference window that no longer represents what 'normal' means.",
        "Drift is detected but nobody has written down what to do about it.",
      ],
    },
    sampleKey: "drift_detection",
  },

  // =====================================================================
  // ADVANCED
  // =====================================================================
  {
    id: "automl_hpo",
    level: "advanced",
    category: "training",
    label: "AutoML & Hyperparameter Search",
    shortLabel: "AutoML/HPO",
    icon: "SlidersHorizontal",
    position: g(3, 0),
    details: {
      summary: "Automatically tries many model settings and keeps the best, instead of tuning by hand.",
      whatHappens:
        "Hyperparameters are the knobs you set before training, such as tree depth or learning rate. Finding good values by hand is slow, so a search tool runs many trials: each trial trains a model with different settings and reports a validation score. Smarter methods use the results of earlier trials to choose the next ones. AutoML goes further and also tries different model families and preprocessing steps.",
      howItHappens: [
        "Define a search space: the allowed range for each setting, such as depth 3 to 10 and learning rate 0.01 to 0.3.",
        "A search algorithm (random, Bayesian or evolutionary) proposes a set of values for each trial.",
        "Each trial runs a training job and reports a validation metric, often on many machines at once.",
        "Poor trials are stopped early (pruning) to save compute.",
        "The best settings are logged to experiment tracking and handed to the final training run.",
      ],
      whyImportant:
        "A well-tuned model can gain several points of recall at no extra data cost, and automation frees data scientists from repetitive trial and error. Logging every trial also makes the search reproducible instead of lucky.",
      tools: [
        { name: "Optuna", type: "Hyperparameter search", note: "Bayesian search with pruning of unpromising trials" },
        { name: "Ray Tune", type: "Distributed tuning", note: "Runs many trials in parallel across a cluster" },
        { name: "Hyperopt", type: "Hyperparameter search", note: "Long-standing Python library for Bayesian optimization" },
        { name: "AutoGluon", type: "AutoML", note: "Trains and ensembles many models with a few lines of code" },
        { name: "H2O AutoML", type: "AutoML", note: "Automatic model selection with a leaderboard of results" },
      ],
      commonProblems: [
        "Tuning against the test set, which makes the final scores look better than reality.",
        "A huge search space that burns compute for tiny gains.",
        "A lucky trial that cannot be reproduced because the random seed was not recorded.",
        "Settings that overfit one validation split and stop helping on new data.",
      ],
    },
    sampleKey: "automl_hpo",
  },
  {
    id: "distributed_training",
    level: "advanced",
    category: "training",
    label: "Distributed / GPU Training",
    shortLabel: "GPU Train",
    icon: "Network",
    position: g(3, 2),
    details: {
      summary: "Spreads a large training job across many machines or GPUs so it finishes in minutes instead of hours.",
      whatHappens:
        "When the dataset or model grows too big for one machine, training is split up. In data parallelism each worker holds a copy of the model and learns from its own slice of the rows, and the workers share their updates so they stay in sync. In model parallelism the model itself is cut up across devices. GPUs help because they perform thousands of simple calculations at the same time.",
      howItHappens: [
        "A cluster scheduler reserves workers (for example 8 GPUs) and starts the same training code on each of them.",
        "The dataset is sharded so each worker reads a different slice, such as 12 million rows each.",
        "After each step the workers exchange their updates (gradients or tree statistics) over a fast network.",
        "Checkpoints are saved regularly so a crashed worker does not cost hours of work.",
        "The workers produce one final model artifact and one set of metrics.",
      ],
      whyImportant:
        "Faster training means more experiments per day and a quicker reaction when the world changes. But distributed jobs cost real money and are harder to debug, so teams scale out only when a single machine is truly the bottleneck.",
      tools: [
        { name: "Ray Train", type: "Distributed training", note: "Scales PyTorch, XGBoost and others across a cluster" },
        { name: "Horovod", type: "Distributed training", note: "Data-parallel training across GPUs using ring all-reduce" },
        { name: "PyTorch DistributedDataParallel", type: "Framework feature", note: "Built-in multi-GPU and multi-node training for PyTorch" },
        { name: "DeepSpeed", type: "Training optimizer", note: "Memory-saving techniques for very large neural networks" },
        { name: "XGBoost on Dask", type: "Distributed boosting", note: "Trains gradient-boosted trees on data spread across workers" },
      ],
      commonProblems: [
        "GPUs sit idle waiting for data because storage or the input pipeline is too slow.",
        "One slow or failed worker stalls the whole job.",
        "Results differ slightly from single-machine runs because of batch sizes or non-determinism.",
        "Idle clusters left running overnight and a surprising cloud bill.",
      ],
    },
    sampleKey: "distributed_training",
  },
  {
    id: "safe_rollout",
    level: "advanced",
    category: "serving",
    label: "Shadow / Canary / A-B Rollout",
    shortLabel: "Rollout",
    icon: "Split",
    position: g(4, 3),
    details: {
      summary: "Introduces a new model gradually and compares it with the old one on real traffic before it takes over.",
      whatHappens:
        "Offline tests cannot prove how a model behaves on live traffic, so risky models are released in steps. In shadow mode the new model scores every payment silently while the old one makes the decisions. In a canary release it makes real decisions for a small slice of traffic, say 5%. An A/B test compares the two groups on business metrics. If the new model wins, traffic grows to 100%; if not, it is switched off in seconds.",
      howItHappens: [
        "Deploy the new version next to the current champion; a router or service mesh controls how traffic is split.",
        "Shadow phase: copy each request to the new model, log both scores and do not act on the new one.",
        "Canary phase: send a small share (for example 5%) of live payments to the new model and watch errors, latency and decline rate.",
        "Compare fraud caught, false declines and revenue between old and new with a statistical test.",
        "Ramp up in steps (5%, 25%, 100%), or roll back automatically if a guardrail metric is breached.",
      ],
      whyImportant:
        "In fraud, a bad release can block thousands of good customers within minutes. Gradual rollouts limit the damage and provide proof from real traffic that the new model is genuinely better, not just better on old data.",
      tools: [
        { name: "KServe canary rollouts", type: "Model serving feature", note: "Splits traffic between model revisions with a percentage setting" },
        { name: "Argo Rollouts", type: "Progressive delivery", note: "Canary and blue-green releases with automatic analysis" },
        { name: "Istio", type: "Service mesh", note: "Weighted traffic routing and request mirroring for shadow tests" },
        { name: "Flagger", type: "Progressive delivery", note: "Automates canary promotion based on metrics" },
        { name: "Amazon SageMaker shadow testing", type: "Managed shadow tests", note: "Mirrors live traffic to a new variant and compares the results" },
      ],
      commonProblems: [
        "An A/B test stopped early on too little data, so a random swing is mistaken for a win.",
        "Fraud labels arrive weeks late, so rollout results are only provisional.",
        "Shadow traffic doubles compute cost and can add latency if done carelessly.",
        "No rollback criteria agreed in advance, so nobody dares to switch the model off.",
      ],
    },
    sampleKey: "safe_rollout",
  },
  {
    id: "explainability",
    level: "advanced",
    category: "responsible",
    label: "Explainability",
    shortLabel: "Explain",
    icon: "Lightbulb",
    position: g(4, 2),
    details: {
      summary: "Shows which input values pushed a prediction up or down so decisions can be explained to people.",
      whatHappens:
        "A fraud score of 0.91 is not very helpful by itself: analysts need to know why, customers may ask why their payment was declined and regulators may require reasons. Explainability methods break a prediction into contributions from each input. For tree models, SHAP gives each feature a value that shows how far it moved the score away from the model's average.",
      howItHappens: [
        "For each scored payment, run an explainer against the model; SHAP's TreeExplainer is fast for tree models.",
        "The explainer returns a contribution per feature: positive values push toward fraud, negative values toward legitimate.",
        "The largest contributors are kept, for example a device that is 0 days old and an IP country that differs from the card country.",
        "They are mapped to human-readable reason codes shown to analysts or used in customer communication.",
        "Averaged over many payments, the contributions give a global picture of what the model relies on.",
      ],
      whyImportant:
        "Explanations build trust with analysts, help debug the model (a surprising top feature often exposes a data bug) and may be legally required for automated decisions about people. They also reveal leakage: if a feature that would not exist at decision time dominates, something is wrong.",
      tools: [
        { name: "SHAP", type: "Explanation library", note: "Per-prediction and global feature contributions, fast for tree models" },
        { name: "LIME", type: "Explanation library", note: "Explains one prediction by fitting a simple model around it" },
        { name: "Captum", type: "PyTorch interpretability", note: "Attribution methods for neural networks" },
        { name: "InterpretML", type: "Interpretable models", note: "Glass-box models and explanation dashboards" },
        { name: "Vertex Explainable AI", type: "Managed explanations", note: "Feature attributions returned with online predictions on Google Cloud" },
      ],
      commonProblems: [
        "Explanations are presented as the cause of fraud when they only describe what the model does.",
        "Slow explainers added to the real-time path, so latency suffers; compute them asynchronously instead.",
        "Correlated features share credit in confusing ways.",
        "Reason codes that reveal too much, which helps fraudsters adapt.",
      ],
    },
    sampleKey: "explainability",
  },
  {
    id: "governance",
    level: "advanced",
    category: "responsible",
    label: "Responsible AI & Governance",
    shortLabel: "Governance",
    icon: "Scale",
    position: g(5, 2),
    details: {
      summary: "Reviews, documents and controls models so they are fair, safe, compliant and auditable.",
      whatHappens:
        "Before a model that influences people's money is released, an approval step checks it against company policy and the law. Reviewers compare performance across groups to find unfair gaps, confirm that no forbidden or sensitive data was used, read the model card (a short document describing purpose, data, limits and metrics) and record who approved it. The audit trail lets the company reproduce and defend any decision later.",
      howItHappens: [
        "The registered model version is automatically attached to a model card with its data, metrics and intended use.",
        "Fairness checks compare error rates across groups, such as regions, and test the gaps against an agreed limit.",
        "Privacy and compliance checks confirm that no personal data or prohibited attributes are used as features.",
        "A model risk reviewer or committee approves, rejects or requests changes, and the decision is stored with an audit id.",
        "Approved versions move on to CI/CD; approvals are re-checked on a schedule and after major changes.",
      ],
      whyImportant:
        "Models make decisions about real people, and mistakes can mean unfair treatment, fines or lost trust. Regulations such as the EU AI Act and financial model-risk rules expect documentation and human oversight, and building governance into the pipeline is cheaper than scrambling after an incident.",
      tools: [
        { name: "Fairlearn", type: "Fairness toolkit", note: "Measures and reduces performance gaps between groups" },
        { name: "AI Fairness 360", type: "Fairness toolkit", note: "IBM's library of bias metrics and mitigation algorithms" },
        { name: "Model Card Toolkit", type: "Documentation", note: "Generates model cards from metadata and evaluation results" },
        { name: "Amazon SageMaker Clarify", type: "Bias and explainability", note: "Bias reports and feature attributions inside SageMaker" },
        { name: "Credo AI", type: "Governance platform", note: "Policy checks and approval workflows for AI systems" },
      ],
      commonProblems: [
        "Governance treated as paperwork at the very end, so it is rushed or skipped.",
        "Fairness metrics chosen without agreeing which definition of fairness matters for the business.",
        "Model cards that go stale after retraining.",
        "Approvals that are not tied to the exact version that gets deployed.",
      ],
    },
    sampleKey: "governance",
  },
  {
    id: "retraining",
    level: "advanced",
    category: "automation",
    label: "Automated Retraining Pipeline",
    shortLabel: "Retrain",
    icon: "RefreshCw",
    position: g(0, 3),
    details: {
      summary: "Rebuilds, tests and proposes a fresh model automatically when drift or a schedule demands it.",
      whatHappens:
        "Models age. A retraining pipeline closes the loop: a trigger (a drift alert, a poor quality metric or a calendar schedule) starts an orchestrated run that pulls the newest labeled data, prepares it, trains and evaluates a new model, and registers it if it beats the current champion. A person or an automated rule then decides whether to start a canary release. The cycle repeats without anyone rebuilding anything by hand.",
      howItHappens: [
        "A trigger fires: a drift alert, a drop in measured precision or a weekly or monthly schedule.",
        "An orchestrator starts the pipeline, which builds a new dataset version from the latest labeled payments.",
        "The pipeline repeats the same data preparation, feature and training steps used for the original model, with tuned settings.",
        "It evaluates the candidate on fresh data and compares it with the current champion using the same quality gate.",
        "If the candidate wins, it is registered as a new version and a canary release begins; otherwise the result is logged and the champion stays.",
      ],
      whyImportant:
        "Retraining by hand is slow, easy to forget and impossible to do reliably at scale. Automating the loop keeps models fresh and shortens the gap between 'the world changed' and 'the model adapted' from weeks to days, while the evaluation gate keeps it safe.",
      tools: [
        { name: "Kubeflow Pipelines", type: "ML pipeline orchestrator", note: "Defines training workflows as containerized steps on Kubernetes" },
        { name: "Apache Airflow", type: "Workflow scheduler", note: "Triggers retraining on a schedule or when an alert arrives" },
        { name: "Vertex AI Pipelines", type: "Managed pipelines", note: "Runs Kubeflow-style pipelines as a managed Google Cloud service" },
        { name: "Amazon SageMaker Pipelines", type: "Managed pipelines", note: "Step-based ML workflows with built-in model registration" },
        { name: "Metaflow", type: "Python workflow framework", note: "Human-friendly Python flows that scale out to cloud compute" },
      ],
      commonProblems: [
        "Retraining on new data with no quality gate, which can put a worse model into production.",
        "Label delay: the newest payments have no labels yet, so fresh data is thin.",
        "Retraining so often that cost and churn outweigh the benefit.",
        "Feedback loops: the model's own decisions shape the data it will learn from next.",
      ],
    },
    sampleKey: "retraining",
  },
  {
    id: "edge_deploy",
    level: "advanced",
    category: "serving",
    label: "Edge / On-device Deployment",
    shortLabel: "Edge",
    icon: "Cpu",
    position: g(5, 0),
    details: {
      summary: "Runs a compact version of the model directly on phones or card terminals, even without a network.",
      whatHappens:
        "Sometimes the model must run where the data is: on a phone, a payment terminal or a vehicle. The model is converted into a portable, compact format and shipped to the device, which scores locally in a few milliseconds with no network round trip and keeps working offline. Because the device is small, the model is shrunk and carefully tested to give the same answers as the server version.",
      howItHappens: [
        "Export the registered model to a portable format such as ONNX (or TensorFlow Lite for TensorFlow models).",
        "Shrink it with pruning or quantization (storing numbers with fewer bits) when size matters.",
        "Check parity: score a test set on the device runtime and compare with the server's scores.",
        "Package it into the app or terminal firmware, or deliver it as a downloadable update with a version number.",
        "The device runs inference locally and sends only summary logs back when it is online.",
      ],
      whyImportant:
        "On-device inference cuts latency, protects privacy because raw data stays on the device, and keeps working on a poor connection. The price is that you now maintain many copies of the model in the wild, so version control and safe updates matter even more.",
      tools: [
        { name: "ONNX Runtime", type: "Cross-platform runtime", note: "Runs models exported to ONNX on servers, phones and embedded devices" },
        { name: "TensorFlow Lite", type: "Mobile runtime", note: "Compact runtime for TensorFlow models on Android, iOS and microcontrollers" },
        { name: "Core ML", type: "Apple runtime", note: "Runs models efficiently on iPhone and iPad hardware" },
        { name: "ExecuTorch", type: "PyTorch on-device runtime", note: "Deploys PyTorch models to phones and embedded hardware" },
        { name: "NVIDIA TensorRT", type: "Inference optimizer", note: "Optimizes models for NVIDIA edge GPUs" },
      ],
      commonProblems: [
        "The converted model scores differently from the server model because of unsupported operations or rounding.",
        "Devices stuck on old model versions because updates are not forced or tracked.",
        "No monitoring of models you cannot see, so quality problems stay hidden.",
        "Tight memory and battery limits that rule out the model you actually trained.",
      ],
    },
    sampleKey: "edge_deploy",
  },
];

// One ordered walk through each level, following the same payment through the main path.
export const playPaths = {
  basic: ["data_labeling", "data_prep", "training", "evaluation", "deployment", "monitoring"],
  medium: [
    "data_labeling",
    "data_prep",
    "feature_store",
    "training",
    "evaluation",
    "model_registry",
    "cicd",
    "deployment",
    "monitoring",
    "drift_detection",
  ],
  advanced: [
    "data_labeling",
    "data_prep",
    "feature_store",
    "training",
    "distributed_training",
    "evaluation",
    "model_registry",
    "governance",
    "cicd",
    "safe_rollout",
    "deployment",
    "monitoring",
    "drift_detection",
    "retraining",
  ],
};

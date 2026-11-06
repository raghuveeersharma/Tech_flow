// Optional sub-steps for a node: { [nodeId]: [ { id, label, shortLabel, icon, summary, whatHappens, howItHappens[], whyImportant?, tools?[], commonProblems?[] } ] }
// A node listed here gets an enabled "See sub-steps" button; every other node shows it disabled.
// Sub-steps run in order (they are drawn as a chain). Icons must exist in icons.js.

export const subNodes = {
  cleaning: [
    {
      id: "audit", label: "Audit the raw data", shortLabel: "Audit", icon: "FileSearch",
      summary: "Measure how messy the data is.",
      whatHappens: "Missing rates, wrong types and impossible values are counted so the cleaning plan is based on facts.",
      howItHappens: ["Check data types.", "Count nulls per column.", "Find impossible values such as negative ages."],
      tools: [{ name: "pandas", type: "Python", note: "info(), describe()" }],
    },
    {
      id: "impute", label: "Impute or drop", shortLabel: "Impute", icon: "Wand2",
      summary: "Fill gaps in a way that does not leak the answer.",
      whatHappens: "Missing values are filled using statistics learned from training data only, so the model never sees information from the future.",
      howItHappens: ["Choose median, mode or a model-based fill.", "Fit the filler on training rows only.", "Add a 'was missing' flag if absence is informative."],
      commonProblems: ["Imputing before splitting leaks information."],
    },
    {
      id: "fix_types", label: "Fix types and labels", shortLabel: "Types", icon: "Braces",
      summary: "Make columns the right type with consistent categories.",
      whatHappens: "Dates become dates, numbers become numbers and category spellings are unified so each real value has exactly one name.",
      howItHappens: ["Parse dates and numbers.", "Map spelling variants to one label.", "Remove stray whitespace."],
    },
    {
      id: "outliers", label: "Treat outliers", shortLabel: "Outliers", icon: "Crosshair",
      summary: "Cap or keep extreme values on purpose.",
      whatHappens: "Extreme values can dominate a model. Each is checked and either corrected, capped or kept with a reason.",
      howItHappens: ["Detect with IQR or z-score.", "Review the biggest cases.", "Cap (winsorize) where justified."],
    },
  ],
  model_training: [
    {
      id: "baseline", label: "Build a baseline", shortLabel: "Baseline", icon: "Flag",
      summary: "Start with the simplest model so you know what to beat.",
      whatHappens: "A trivial model (for example, predict the most common outcome) sets the minimum bar. Any real model must be clearly better.",
      howItHappens: ["Predict the majority class.", "Record its score.", "Use it as the reference line."],
    },
    {
      id: "choose", label: "Choose algorithms", shortLabel: "Choose", icon: "Boxes",
      summary: "Pick a few candidate models that fit the data.",
      whatHappens: "Logistic regression, random forests and gradient boosting suit tabular data differently. A short list is trained and compared.",
      howItHappens: ["Pick 2-4 algorithms.", "Match them to data size and need for explanation.", "Keep the setup identical for fairness."],
      tools: [{ name: "scikit-learn", type: "Library", note: "Many models, one API" }, { name: "XGBoost", type: "Library", note: "Strong on tables" }],
    },
    {
      id: "fit", label: "Fit on training data", shortLabel: "Fit", icon: "Cpu",
      summary: "Let each model learn patterns from the training set.",
      whatHappens: "The algorithm adjusts its internal numbers to reduce its mistakes on the training rows.",
      howItHappens: ["Feed in features and labels.", "Optimize the loss function.", "Stop when improvement flattens."],
      commonProblems: ["Overfitting: perfect on training, poor on new data."],
    },
    {
      id: "validate", label: "Cross-validate", shortLabel: "Validate", icon: "Repeat",
      summary: "Check stability across several data splits.",
      whatHappens: "The data is split several ways and the model is scored each time, giving a more honest picture than one lucky split.",
      howItHappens: ["Split into k folds.", "Train on k-1, score on the rest.", "Average the scores and note the spread."],
    },
  ],
};

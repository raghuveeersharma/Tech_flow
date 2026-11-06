// Optional sub-steps for a node: { [nodeId]: [ { id, label, shortLabel, icon, summary, whatHappens, howItHappens[], whyImportant?, tools?[], commonProblems?[] } ] }
// A node listed here gets an enabled "See sub-steps" button; every other node shows it disabled.
// Sub-steps run in order (they are drawn as a chain). Icons must exist in icons.js.

export const subNodes = {
  deployment: [
    {
      id: "package", label: "Package the model", shortLabel: "Package", icon: "Package",
      summary: "Bundle the model and its code into a container.",
      whatHappens: "The model file, preprocessing code and dependencies are packaged into one image so it behaves the same everywhere.",
      howItHappens: ["Export the model.", "Add the preprocessing code.", "Build a versioned container image."],
      tools: [{ name: "Docker", type: "Container", note: "Reproducible runtime" }, { name: "ONNX", type: "Format", note: "Portable model format" }],
    },
    {
      id: "serve", label: "Expose an API", shortLabel: "Serve", icon: "Server",
      summary: "Let other systems request predictions.",
      whatHappens: "A prediction service accepts a transaction, runs the model and returns a score within a few milliseconds.",
      howItHappens: ["Load the model at startup.", "Validate each request.", "Return the score as JSON."],
      tools: [{ name: "KServe", type: "Serving", note: "Kubernetes model serving" }, { name: "FastAPI", type: "Framework", note: "Simple Python API" }],
    },
    {
      id: "scale", label: "Scale and balance", shortLabel: "Scale", icon: "Network",
      summary: "Add copies of the service when traffic grows.",
      whatHappens: "Several replicas sit behind a load balancer and are added or removed automatically as payment volume changes.",
      howItHappens: ["Run multiple replicas.", "Route requests with a load balancer.", "Autoscale on CPU or latency."],
      tools: [{ name: "Kubernetes HPA", type: "Autoscaling", note: "Scale on load" }],
    },
    {
      id: "health", label: "Health checks", shortLabel: "Health", icon: "Activity",
      summary: "Verify the service is ready before sending traffic.",
      whatHappens: "Readiness and liveness probes make sure a broken instance is replaced and never receives real payments.",
      howItHappens: ["Run a test prediction at startup.", "Probe the endpoint regularly.", "Restart or remove failing instances."],
      commonProblems: ["Model loads but returns wrong scores because of a feature mismatch."],
    },
  ],
  data_prep: [
    {
      id: "clean", label: "Clean the records", shortLabel: "Clean", icon: "Eraser",
      summary: "Remove errors and duplicates from the training data.",
      whatHappens: "Bad rows are fixed or removed so the model does not learn from mistakes.",
      howItHappens: ["Drop duplicates.", "Fix wrong types.", "Handle missing values."],
    },
    {
      id: "features", label: "Create features", shortLabel: "Features", icon: "Sparkles",
      summary: "Turn raw fields into signals a model can use.",
      whatHappens: "Raw payment fields become useful numbers such as 'transactions in the last hour' or 'distance from home'.",
      howItHappens: ["Aggregate over time windows.", "Encode categories.", "Scale numeric values."],
      tools: [{ name: "Feast", type: "Feature store", note: "Reusable features" }],
    },
    {
      id: "split", label: "Split the data", shortLabel: "Split", icon: "Split",
      summary: "Separate training, validation and test sets.",
      whatHappens: "Data is split by time so the model is always tested on newer transactions than it trained on, like real life.",
      howItHappens: ["Order by date.", "Cut into train, validation and test.", "Never touch the test set until the end."],
      commonProblems: ["Random splits leak future information."],
    },
    {
      id: "balance", label: "Balance the classes", shortLabel: "Balance", icon: "Scale",
      summary: "Handle the rarity of fraud examples.",
      whatHappens: "Fraud is under 1% of payments. Class weights or resampling stop the model from simply predicting 'not fraud' every time.",
      howItHappens: ["Measure the class ratio.", "Apply weights or resampling to training data only.", "Keep validation data untouched."],
    },
  ],
};

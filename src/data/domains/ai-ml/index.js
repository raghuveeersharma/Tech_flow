import { categories } from "./categories";
import { nodes, playPaths } from "./nodes";
import { subNodes } from "./subNodes";
import { edges } from "./edges";
import { sampleData, floatFields } from "./sampleData";

export default {
  id: "ai-ml",
  name: "AI / Machine Learning",
  tagline: "Build, ship and maintain models that run in the real world",
  description:
    "Follow the machine learning lifecycle: label data, train and evaluate models, deploy them and keep them accurate with monitoring.",
  icon: "BrainCircuit",
  color: "#fb923c",
  example: "A card payment checked by a fraud-detection model",
  title: "How an ML Model Goes From Data to Production",
  subtitle:
    "Follow one card payment through the machine learning lifecycle. Click a node to see what happens, how, and with which tools.",
  sampleHeading: "One payment, stage by stage",
  levelDescriptions: {
    basic: "The core ML lifecycle: data, training, evaluation, deployment and monitoring",
    medium: "Adds a feature store, experiment tracking, a model registry, CI/CD and drift detection",
    advanced: "Adds distributed training, AutoML, safe rollouts, explainability, automated retraining and responsible AI",
  },
  categories,
  nodes,
  subNodes,
  edges,
  sampleData,
  floatFields,
  playPaths,
};

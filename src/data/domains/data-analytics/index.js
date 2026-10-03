import { categories } from "./categories";
import { nodes, playPaths } from "./nodes";
import { edges } from "./edges";
import { sampleData, floatFields } from "./sampleData";

export default {
  id: "data-analytics",
  name: "Data Analytics",
  tagline: "Turn data into answers and decisions people can act on",
  description:
    "Start from a business question, find the data, clean it, explore it and present a clear insight that changes what the team does next.",
  icon: "LineChart",
  color: "#34d399",
  example: "A business question: why did weekly revenue drop in Indore?",
  title: "How Analysts Turn Data Into Decisions",
  subtitle:
    "Follow one business question from the first conversation to a decision. Click a node to see what the analyst does, how, and with which tools.",
  sampleHeading: "One question, stage by stage",
  levelDescriptions: {
    basic: "The six steps of almost every analysis, from question to insight",
    medium: "Adds metric definitions, segmentation, experiments, automated dashboards and storytelling",
    advanced: "Adds forecasting, causal analysis, anomaly alerts, a semantic layer and decision automation",
  },
  categories,
  nodes,
  edges,
  sampleData,
  floatFields,
  playPaths,
};

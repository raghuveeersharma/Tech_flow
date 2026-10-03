import { categories } from "./categories";
import { nodes, playPaths } from "./nodes";
import { edges } from "./edges";
import { sampleData, floatFields } from "./sampleData";

export default {
  id: "data-science",
  name: "Data Science",
  tagline: "Use statistics and machine learning to predict and explain",
  description:
    "Frame a problem, prepare data, explore patterns, engineer features and train and evaluate a model that answers a real question.",
  icon: "FlaskConical",
  color: "#a78bfa",
  example: "A customer: will they stop buying (churn)?",
  title: "How a Data Scientist Turns a Question Into a Model",
  subtitle:
    "Follow one customer record from a business question to a trained, explained model. Click a node to see what happens, how, and with which tools.",
  sampleHeading: "One customer, stage by stage",
  levelDescriptions: {
    basic: "The core loop: frame, collect, clean, explore, train and evaluate",
    medium: "Adds feature engineering, proper validation, tuning, experiment tracking and interpretation",
    advanced: "Adds causal inference, uplift modelling, fairness checks, drift monitoring and the hand-off to production",
  },
  categories,
  nodes,
  edges,
  sampleData,
  floatFields,
  playPaths,
};

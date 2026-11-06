import { categories } from "./categories";
import { nodes, playPaths } from "./nodes";
import { subNodes } from "./subNodes";
import { edges } from "./edges";
import { sampleData, floatFields } from "./sampleData";

export default {
  id: "data-engineering",
  name: "Data Engineering",
  tagline: "Collect, move and shape raw data so everyone can trust it",
  description:
    "Build the pipelines that carry data from apps and databases into a warehouse, ready for analysis and machine learning.",
  icon: "Database",
  color: "#38bdf8",
  example: "An e-commerce order",
  title: "How Data Flows: From Source to Insight",
  subtitle:
    "Follow one e-commerce order as it travels through every stage of a data pipeline. Click a node to see what happens, how, and with which tools.",
  sampleHeading: "One order, before and after",
  levelDescriptions: {
    basic: "The six core stages every pipeline has",
    medium: "Adds orchestration, streaming, quality checks, medallion layers, dbt and a catalog",
    advanced: "Adds CDC, stream processing, lakehouse tables, ML, observability, governance and reverse ETL",
  },
  categories,
  nodes,
  subNodes,
  edges,
  sampleData,
  floatFields,
  playPaths,
};

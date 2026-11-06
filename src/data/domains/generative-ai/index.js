import { categories } from "./categories";
import { nodes, playPaths } from "./nodes";
import { subNodes } from "./subNodes";
import { edges } from "./edges";
import { sampleData, floatFields } from "./sampleData";

export default {
  id: "generative-ai",
  name: "Generative AI & LLMs",
  tagline: "Build assistants that read, reason and write using large language models",
  description:
    "See how a question becomes a grounded answer: documents are split and embedded, relevant passages are retrieved and a language model writes the reply.",
  icon: "Sparkles",
  color: "#f472b6",
  example: "A customer asking a support assistant about refunds",
  title: "How a Generative AI Assistant Answers Your Question",
  subtitle:
    "Follow one customer question through a retrieval-augmented LLM application. Click a node to see what happens, how, and with which tools.",
  sampleHeading: "One question, stage by stage",
  levelDescriptions: {
    basic: "The basic RAG loop: ingest documents, embed, retrieve and generate",
    medium: "Adds reranking, prompt assembly, guardrails, caching, memory and evaluation",
    advanced: "Adds agents and tools, fine-tuning, hybrid search, multimodal input, LLM observability and model routing",
  },
  categories,
  nodes,
  subNodes,
  edges,
  sampleData,
  floatFields,
  playPaths,
};

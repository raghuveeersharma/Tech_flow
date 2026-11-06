// Edge schema: { id, source, target, level, label, removedAt? }
// Read the Basic row left to right as the life of ONE request. The offline indexing work
// (documents -> chunks -> vectors) appears as its own node at Medium level.
export const edges = [
  // ---------- BASIC ----------
  { id: "e-user_question-embedding", source: "user_question", target: "embedding", level: "basic", removedAt: "medium", label: "text to vector" },
  { id: "e-embedding-vector_db", source: "embedding", target: "vector_db", level: "basic", label: "query vector" },
  { id: "e-vector_db-retrieval", source: "vector_db", target: "retrieval", level: "basic", removedAt: "advanced", label: "nearest chunks" },
  { id: "e-retrieval-generation", source: "retrieval", target: "generation", level: "basic", removedAt: "medium", label: "context" },
  { id: "e-generation-answer", source: "generation", target: "answer", level: "basic", removedAt: "medium", label: "draft reply" },

  // ---------- MEDIUM ----------
  { id: "e-user_question-semantic_cache", source: "user_question", target: "semantic_cache", level: "medium", label: "check cache" },
  { id: "e-semantic_cache-embedding", source: "semantic_cache", target: "embedding", level: "medium", label: "cache miss" },
  { id: "e-semantic_cache-answer", source: "semantic_cache", target: "answer", level: "medium", label: "cache hit" },
  { id: "e-doc_ingestion-embedding", source: "doc_ingestion", target: "embedding", level: "medium", label: "offline: chunks" },
  { id: "e-retrieval-reranking", source: "retrieval", target: "reranking", level: "medium", label: "candidates" },
  { id: "e-reranking-prompt_assembly", source: "reranking", target: "prompt_assembly", level: "medium", label: "best chunks" },
  { id: "e-conversation_memory-prompt_assembly", source: "conversation_memory", target: "prompt_assembly", level: "medium", label: "chat history" },
  { id: "e-prompt_assembly-generation", source: "prompt_assembly", target: "generation", level: "medium", label: "full prompt" },
  { id: "e-generation-guardrails", source: "generation", target: "guardrails", level: "medium", label: "draft answer" },
  { id: "e-guardrails-answer", source: "guardrails", target: "answer", level: "medium", label: "checked answer" },

  // ---------- ADVANCED ----------
  { id: "e-multimodal-user_question", source: "multimodal", target: "user_question", level: "advanced", label: "image + text" },
  { id: "e-vector_db-hybrid_search", source: "vector_db", target: "hybrid_search", level: "advanced", label: "vector hits" },
  { id: "e-hybrid_search-retrieval", source: "hybrid_search", target: "retrieval", level: "advanced", label: "fused hits" },
  { id: "e-generation-agents_tools", source: "generation", target: "agents_tools", level: "advanced", label: "tool calls" },
  { id: "e-fine_tuning-model_routing", source: "fine_tuning", target: "model_routing", level: "advanced", label: "tuned model" },
  { id: "e-model_routing-generation", source: "model_routing", target: "generation", level: "advanced", label: "chosen model" },
  { id: "e-answer-evaluation", source: "answer", target: "evaluation", level: "advanced", label: "sampled answers" },
  { id: "e-evaluation-llm_observability", source: "evaluation", target: "llm_observability", level: "advanced", label: "quality scores" },
];

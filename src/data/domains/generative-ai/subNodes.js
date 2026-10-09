// Optional sub-steps for a node: { [nodeId]: [ { id, label, shortLabel, icon, summary, whatHappens, howItHappens[], whyImportant?, tools?[], commonProblems?[] } ] }
// A node listed here gets an enabled "See sub-steps" button; every other node shows it disabled.
// Sub-steps run in order (they are drawn as a chain). Icons must exist in icons.js.

export const subNodes = {
  doc_ingestion: [
    {
      id: "load", label: "Load documents", shortLabel: "Load", icon: "FileText",
      summary: "Read PDFs, web pages and wikis into plain text.",
      whatHappens: "Loaders extract text from every source and keep its title, URL and date so answers can cite where they came from.",
      howItHappens: ["Fetch the files or pages.", "Extract text and tables.", "Keep source metadata."],
      tools: [{ name: "Unstructured", type: "Parser", note: "PDFs, HTML, Office files" }, { name: "LlamaIndex loaders", type: "Library", note: "Many connectors" }],
    },
    {
      id: "clean", label: "Clean the text", shortLabel: "Clean", icon: "Eraser",
      summary: "Strip headers, footers and boilerplate.",
      whatHappens: "Noise such as page numbers and menus is removed so it does not pollute search results.",
      howItHappens: ["Remove repeating headers and footers.", "Fix broken line wraps.", "Drop empty pages."],
    },
    {
      id: "chunk", label: "Split into chunks", shortLabel: "Chunk", icon: "Scissors",
      summary: "Cut long documents into small, meaningful pieces.",
      whatHappens: "A model can only read so much at once. Documents are cut into pieces of a few hundred words, with small overlaps so ideas are not cut in half.",
      howItHappens: ["Split on headings and paragraphs.", "Aim for 200-500 tokens.", "Overlap neighbours slightly."],
      commonProblems: ["Chunks too small lose context; too large dilute the match."],
    },
    {
      id: "index", label: "Embed and index", shortLabel: "Index", icon: "DatabaseZap",
      summary: "Turn chunks into vectors and store them.",
      whatHappens: "Each chunk becomes a vector of numbers capturing its meaning and is stored with its metadata, ready to be searched.",
      howItHappens: ["Send chunks to an embedding model.", "Upsert vectors with metadata.", "Record the index version."],
      tools: [{ name: "OpenAI / Cohere embeddings", type: "Model", note: "Text to vectors" }, { name: "Pinecone / pgvector", type: "Vector DB", note: "Similarity search" }],
    },
  ],
  retrieval: [
    {
      id: "embed_query", label: "Embed the question", shortLabel: "Embed", icon: "Binary",
      summary: "Turn the question into a vector.",
      whatHappens: "The question is converted by the same embedding model used for the documents, so both live in the same meaning space.",
      howItHappens: ["Clean the question.", "Call the embedding model.", "Get a vector back."],
    },
    {
      id: "search", label: "Search the index", shortLabel: "Search", icon: "Search",
      summary: "Find the chunks closest in meaning.",
      whatHappens: "The vector database returns the nearest chunks by similarity, often combined with keyword search for exact terms.",
      howItHappens: ["Run a nearest-neighbour search.", "Apply filters such as product or date.", "Return the top 20 candidates."],
      tools: [{ name: "HNSW index", type: "Algorithm", note: "Fast approximate search" }],
    },
    {
      id: "select", label: "Select the best", shortLabel: "Select", icon: "ListChecks",
      summary: "Keep only the most relevant few chunks.",
      whatHappens: "Candidates are scored again and trimmed to the handful that best fit the question and the prompt size limit.",
      howItHappens: ["Rank the candidates.", "Remove near-duplicates.", "Keep the top 3-5."],
      commonProblems: ["Irrelevant chunks make the model confidently wrong."],
    },
  ],
};

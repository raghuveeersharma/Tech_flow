// Generative AI & LLMs: a retrieval-augmented generation (RAG) support assistant.
// Basic reads left to right as the life of one request. Medium adds the offline indexing and the
// production safeguards. Advanced adds smarter search, evaluation, agents and customization.
import { g } from "../../grid";

export const nodes = [
  // =====================================================================
  // BASIC
  // =====================================================================
  {
    id: "user_question",
    level: "basic",
    category: "input",
    label: "User Question",
    shortLabel: "Question",
    icon: "MessageSquare",
    position: g(0, 1),
    details: {
      summary: "The natural-language question a person types or speaks to the assistant.",
      whatHappens:
        "Everything starts with a person asking something in their own words: 'Can I get a refund if my headphones arrive damaged?' Unlike a database query there is no fixed format. The text can be vague, misspelled, too short or packed with several questions at once. The application captures it along with some context, such as which chat session it belongs to.",
      howItHappens: [
        "The customer types a message into a chat widget, a Slack bot or a mobile app.",
        "The front end sends it to the backend together with a session id and a timestamp.",
        "The backend applies basic checks such as length limits, rate limits and authentication.",
        "The raw text is handed to the next stage exactly as typed, mistakes included.",
      ],
      whyImportant:
        "The quality of the whole system is capped by how well it understands this first message. Real users write sloppy, ambiguous questions, so every later stage is designed to be forgiving. Capturing a session id also makes it possible to follow the question through the pipeline when something goes wrong.",
      tools: [
        { name: "Chainlit", type: "Chat UI framework", note: "Quickly builds a chat front end for Python LLM apps" },
        { name: "Vercel AI SDK", type: "Frontend toolkit", note: "Streaming chat components for React and Next.js apps" },
        { name: "Slack Bolt", type: "Bot framework", note: "Brings the assistant into the channels people already use" },
        { name: "Gradio", type: "Demo UI", note: "A fast way to put a model behind a simple web interface" },
      ],
      commonProblems: [
        "Vague or very short questions that need clarification before they can be answered.",
        "Prompt injection: users who type instructions meant to hijack the assistant.",
        "Questions in a different language than the documents are written in.",
        "No rate limiting, so a single script can run up a large bill.",
      ],
    },
    sampleKey: "user_question",
  },
  {
    id: "embedding",
    level: "basic",
    category: "knowledge",
    label: "Embeddings",
    shortLabel: "Embed",
    icon: "Binary",
    position: g(1, 1),
    details: {
      summary: "Turns text into a list of numbers that captures its meaning.",
      whatHappens:
        "Computers cannot compare meaning directly, so an embedding model converts a piece of text into a vector, a fixed-length list of numbers such as 768 values. Sentences with similar meaning get similar vectors, even if they share no words: 'refund for broken headphones' lands near 'money back for damaged earphones'. The same model is used for the documents earlier and for the question now.",
      howItHappens: [
        "The text is cleaned: whitespace is trimmed and obvious noise is removed.",
        "It is split into tokens, the small pieces of words that models read.",
        "The embedding model, a neural network, reads the tokens and outputs one vector for the whole text.",
        "The vector is normalised so that similarity can be measured with a simple dot product or cosine.",
        "The vector is passed on to be compared with the stored document vectors.",
      ],
      whyImportant:
        "Embeddings are what make search by meaning possible, instead of search by exact keywords. If the question and the documents are embedded with different models, or the model is poor at your language or domain, relevant passages are never found, and no later step can fix that.",
      tools: [
        { name: "OpenAI Embeddings API", type: "Hosted model", note: "Simple API for general-purpose text embeddings" },
        { name: "Cohere Embed", type: "Hosted model", note: "Strong multilingual embeddings with a managed API" },
        { name: "sentence-transformers", type: "Open-source library", note: "Run models such as E5 and BGE on your own hardware" },
        { name: "Voyage AI", type: "Hosted model", note: "Retrieval-focused embedding models, including domain-tuned ones" },
      ],
      commonProblems: [
        "Using different embedding models for indexing and querying, which silently breaks search.",
        "Changing the embedding model without re-embedding every stored document.",
        "Weak performance on jargon, product codes or non-English text.",
        "Long inputs truncated by the model's token limit, so the end of the text is ignored.",
      ],
    },
    sampleKey: "embedding",
  },
  {
    id: "vector_db",
    level: "basic",
    category: "knowledge",
    label: "Vector Database",
    shortLabel: "Vector DB",
    icon: "Database",
    position: g(2, 1),
    details: {
      summary: "Stores every document chunk as a vector and finds the closest ones fast.",
      whatHappens:
        "A vector database holds the embedding of every chunk of your knowledge base, next to the original text and metadata such as title and date. Given the question vector, it finds the stored vectors that are nearest to it. Checking every vector one by one would be too slow at scale, so it uses approximate nearest neighbour indexes that search millions of vectors in milliseconds.",
      howItHappens: [
        "Chunk vectors were stored earlier, together with their text and metadata.",
        "An index (such as HNSW) organises the vectors so that neighbours are quick to find.",
        "The question vector arrives with a top-k value, for example 3.",
        "The database measures cosine similarity and returns the ids and scores of the k closest chunks.",
        "Optional metadata filters (language, product, date) narrow the search before it runs.",
      ],
      whyImportant:
        "This is the assistant's long-term memory. It lets a language model with a small context window draw on thousands of documents by fetching only the relevant few. Search speed and accuracy here set the floor for answer quality and response time.",
      tools: [
        { name: "Pinecone", type: "Managed vector database", note: "Serverless service with no infrastructure to run" },
        { name: "Qdrant", type: "Open-source vector database", note: "Fast, with rich filtering and sparse vector support" },
        { name: "Weaviate", type: "Open-source vector database", note: "Built-in hybrid search and modular embedding integrations" },
        { name: "pgvector", type: "PostgreSQL extension", note: "Adds vector search to a database you already run" },
        { name: "Chroma", type: "Open-source vector database", note: "Lightweight and popular for prototypes and local development" },
      ],
      commonProblems: [
        "Stale data: documents change but their vectors are never refreshed.",
        "Approximate search that occasionally misses the best match if the index is tuned too aggressively.",
        "Memory costs that grow quickly with the number of vectors and dimensions.",
        "No metadata filters, so users receive passages from the wrong product or region.",
      ],
    },
    sampleKey: "vector_db",
  },
  {
    id: "retrieval",
    level: "basic",
    category: "retrieval",
    label: "Retrieval",
    shortLabel: "Retrieve",
    icon: "Search",
    position: g(3, 1),
    details: {
      summary: "Chooses which passages are good enough to hand to the language model.",
      whatHappens:
        "The database returns ids and similarity scores. Retrieval is the logic around that: it drops matches below a quality threshold, fetches the real text of the chunks that remain, removes duplicates and stops when the context would get too long. What is left is the evidence the model will be allowed to use.",
      howItHappens: [
        "Receive the top-k ids and similarity scores from the vector database.",
        "Discard hits below the minimum score, such as 0.7, because weak matches add noise.",
        "Load the text and source title of each remaining chunk.",
        "Remove near-duplicate passages and keep the total within a token budget.",
        "Return the context as an ordered list of passages with their sources.",
      ],
      whyImportant:
        "A model can only be as accurate as the evidence it receives. Too little context and it guesses; too much irrelevant context and it gets distracted or becomes slow and expensive. Most 'the AI got it wrong' problems in RAG systems are retrieval problems, not model problems.",
      tools: [
        { name: "LlamaIndex", type: "RAG framework", note: "Retrievers, query engines and postprocessors out of the box" },
        { name: "LangChain", type: "LLM framework", note: "Retriever abstractions that work with most vector databases" },
        { name: "Haystack", type: "Open-source framework", note: "Pipeline-style building blocks for search and question answering" },
        { name: "Elasticsearch / OpenSearch", type: "Search engines", note: "Keyword retrieval that can sit beside or replace vectors" },
      ],
      commonProblems: [
        "Threshold set too high (answers 'I don't know') or too low (irrelevant text gets in).",
        "Chunks that were cut mid-thought, so the retrieved text lacks the key sentence.",
        "Several near-identical chunks that crowd out other useful information.",
        "Not logging what was retrieved, which makes wrong answers impossible to debug.",
      ],
    },
    sampleKey: "retrieval",
  },
  {
    id: "generation",
    level: "basic",
    category: "generation",
    label: "LLM Generation",
    shortLabel: "LLM",
    icon: "Sparkles",
    position: g(4, 1),
    positionByLevel: { medium: g(5, 2) },
    details: {
      summary: "A large language model writes the answer using the retrieved context.",
      whatHappens:
        "A large language model (LLM) is a neural network trained on huge amounts of text to predict the next token. Given a prompt that contains the instructions, the retrieved passages and the question, it writes a reply one token at a time. Because the evidence is inside the prompt, the model can answer from your documents, which it was never trained on. This is retrieval-augmented generation, or RAG.",
      howItHappens: [
        "Build a prompt that holds the instructions, the context passages and the question.",
        "Send it to the model with settings such as temperature (low means more predictable) and a maximum length.",
        "The model reads the prompt within its context window, the maximum text it can see at once.",
        "It generates the answer token by token, usually streamed back as it is written.",
        "The reply and usage details (tokens, latency) are returned to the application.",
      ],
      whyImportant:
        "This is the step that turns found passages into a clear, human answer. Without retrieved context, a model fills gaps with confident-sounding inventions called hallucinations. Giving it the right evidence and telling it to stay inside it is the single biggest lever for factual answers.",
      tools: [
        { name: "OpenAI API", type: "Hosted LLM", note: "GPT family models behind a widely supported API" },
        { name: "Anthropic Claude API", type: "Hosted LLM", note: "Claude models with long context windows and strong instruction following" },
        { name: "Google Gemini API", type: "Hosted LLM", note: "Gemini models, including multimodal input" },
        { name: "Llama / Mistral", type: "Open-weight models", note: "Models you can host yourself for control over data and cost" },
        { name: "vLLM / Ollama", type: "Serving tools", note: "Run open models efficiently on your own servers or laptop" },
      ],
      commonProblems: [
        "Hallucinations when the context lacks the answer and the model fills the gap anyway.",
        "Context window overflow when too many passages are included.",
        "High latency and cost for long prompts and long answers.",
        "Answers that change from run to run because temperature is set too high.",
      ],
    },
    sampleKey: "generation",
  },
  {
    id: "answer",
    level: "basic",
    category: "generation",
    label: "Answer with Sources",
    shortLabel: "Answer",
    icon: "BadgeCheck",
    position: g(5, 1),
    positionByLevel: { medium: g(3, 2) },
    details: {
      summary: "Delivers the final reply with citations the user can verify.",
      whatHappens:
        "The generated text is turned into the response the customer actually sees. Citation markers are attached and linked to the source documents, formatting is applied and the reply is streamed or sent. Showing where an answer came from lets people check it, and builds trust in a system that can occasionally be wrong.",
      howItHappens: [
        "Match the claims in the answer to the chunks that supported them.",
        "Add citation markers such as [1] and the matching source titles and links.",
        "Strip internal details like chunk ids and prompts that users should never see.",
        "Format the text for the channel (chat, email, voice) and send it, often streamed.",
        "Record the delivery time and ask for feedback with a thumbs up or down.",
      ],
      whyImportant:
        "People trust an answer much more when they can see the source, and it lets them catch mistakes. For support, legal or medical topics, a cited answer is often a requirement. The feedback collected here is also the cheapest source of data for improving the system.",
      tools: [
        { name: "LlamaIndex citation engines", type: "RAG framework", note: "Return answers with the source passages attached" },
        { name: "LangChain structured output", type: "Output parsing", note: "Forces the model to return an answer plus a list of sources" },
        { name: "Vercel AI SDK", type: "Streaming UI", note: "Streams tokens to the screen as they are generated" },
        { name: "JSON-schema structured outputs", type: "Model feature", note: "Guarantees the reply follows a defined format" },
      ],
      commonProblems: [
        "Citations that point to documents which do not actually support the claim.",
        "Waiting for the full answer instead of streaming, so the app feels slow.",
        "Leaking internal prompts, ids or system text into the reply.",
        "No feedback button, so there is no way to learn which answers failed.",
      ],
    },
    sampleKey: "answer",
  },

  // =====================================================================
  // MEDIUM
  // =====================================================================
  {
    id: "semantic_cache",
    level: "medium",
    category: "retrieval",
    label: "Semantic Cache",
    shortLabel: "Cache",
    icon: "Zap",
    position: g(0, 2),
    details: {
      summary: "Reuses a stored answer when a nearly identical question was already asked.",
      whatHappens:
        "Many users ask the same thing in different words. A semantic cache embeds each incoming question and checks whether a very similar one has already been answered. If the similarity is above a strict threshold the stored answer is returned immediately, skipping retrieval and the model call, so it is faster and costs nothing. Otherwise the request carries on.",
      howItHappens: [
        "Embed the incoming question with the same model used elsewhere.",
        "Search the cache for the nearest previous question.",
        "Compare the similarity score with a high threshold, for example 0.92.",
        "On a hit, return the stored answer directly; on a miss, continue to retrieval.",
        "After a miss is answered, store the new question and answer with an expiry time.",
      ],
      whyImportant:
        "LLM calls are the slowest and most expensive part of the system. A good cache can cut a large share of the traffic and brings answers back in milliseconds. It must be tuned carefully, because a threshold that is too loose returns a wrong answer to a question that merely looks similar.",
      tools: [
        { name: "GPTCache", type: "Open-source cache", note: "Semantic caching layer for LLM applications" },
        { name: "Redis (vector search)", type: "In-memory database", note: "Fast storage with built-in vector similarity" },
        { name: "LiteLLM caching", type: "Gateway feature", note: "Caches responses at the gateway across all your apps" },
        { name: "LangChain caching", type: "Framework feature", note: "Plug-in caches for exact and semantic matches" },
      ],
      commonProblems: [
        "Threshold too low, so 'cancel my order' returns the answer for 'track my order'.",
        "Cached answers that outlive a policy change because nothing expires them.",
        "Sharing a cache between users when answers depend on private account data.",
        "Never measuring the hit rate, so nobody knows whether the cache pays off.",
      ],
    },
    sampleKey: "semantic_cache",
  },
  {
    id: "doc_ingestion",
    level: "medium",
    category: "knowledge",
    label: "Document Ingestion & Chunking",
    shortLabel: "Ingest",
    icon: "FileText",
    position: g(1, 0),
    details: {
      summary: "Loads documents offline and cuts them into searchable pieces.",
      whatHappens:
        "Before any question can be answered, the knowledge base has to be built. Documents such as web pages, PDFs and wiki articles are loaded, cleaned of menus and markup, and split into chunks of a few hundred tokens. Each chunk is then embedded and stored. This runs offline on a schedule, not when a user asks.",
      howItHappens: [
        "Connectors pull in content from websites, PDFs, drives and wikis.",
        "Parsers extract clean text and keep structure such as headings and tables.",
        "A splitter cuts the text into chunks of about 200 tokens with a small overlap.",
        "Metadata (title, URL, section, updated date) is attached to every chunk.",
        "Each chunk is sent to the embedding model and saved to the vector database.",
      ],
      whyImportant:
        "Chunking decides what the system can find. Too large and chunks mix several topics, which dilutes the match; too small and they lose the context needed to make sense. The most common cause of a poor RAG system is bad data preparation, not a weak model.",
      tools: [
        { name: "Unstructured", type: "Document parsing", note: "Extracts text from PDFs, HTML, Word files and more" },
        { name: "LlamaParse", type: "Document parsing", note: "Handles complex layouts and tables in PDFs" },
        { name: "LangChain text splitters", type: "Chunking library", note: "Recursive, token-based and semantic splitting strategies" },
        { name: "Apache Tika", type: "Content extraction", note: "Detects and extracts text from hundreds of file formats" },
      ],
      commonProblems: [
        "Tables and PDFs parsed into garbled text that cannot be searched.",
        "Navigation menus and cookie banners embedded as if they were content.",
        "Chunks split in the middle of a sentence or a list.",
        "Re-indexing everything on each run instead of only what changed.",
      ],
    },
    sampleKey: "doc_ingestion",
  },
  {
    id: "reranking",
    level: "medium",
    category: "retrieval",
    label: "Reranking",
    shortLabel: "Rerank",
    icon: "ListChecks",
    position: g(4, 1),
    details: {
      summary: "A second, more careful model reorders the candidates by true relevance.",
      whatHappens:
        "Vector search is fast but rough: it compares two pre-computed vectors. A reranker is slower but sharper. A cross-encoder model reads the question and one candidate passage together and scores how well the passage answers the question. Only the top few are kept. A common setup retrieves 20 candidates and reranks them down to the best 3 to 5.",
      howItHappens: [
        "Retrieve a generous set of candidates, for example the top 20.",
        "Pair the question with each candidate and feed every pair to the cross-encoder.",
        "The model outputs a relevance score for each pair.",
        "Sort by that score and keep only the top few passages.",
        "Pass the reordered passages on to the prompt.",
      ],
      whyImportant:
        "The right passage is often in the candidates but not in first place. Reranking fixes the order, which matters because models pay more attention to what comes first, and keeps the prompt short and cheap. It is one of the most effective upgrades to a basic RAG system.",
      tools: [
        { name: "Cohere Rerank", type: "Hosted reranker", note: "Managed API that scores and reorders passages" },
        { name: "BGE reranker", type: "Open-source cross-encoder", note: "Strong self-hosted reranking models" },
        { name: "sentence-transformers CrossEncoder", type: "Library", note: "Run and fine-tune cross-encoders in Python" },
        { name: "Jina Reranker", type: "Hosted / open model", note: "Multilingual reranking with long-document support" },
      ],
      commonProblems: [
        "Reranking too many candidates, which adds noticeable latency.",
        "A reranker trained on a different domain that misjudges your documents.",
        "Throwing away the retriever's scores instead of combining the two signals.",
        "Skipping evaluation, so nobody knows whether reranking actually helps.",
      ],
    },
    sampleKey: "reranking",
  },
  {
    id: "conversation_memory",
    level: "medium",
    category: "input",
    label: "Conversation Memory",
    shortLabel: "Memory",
    icon: "History",
    position: g(5, 0),
    details: {
      summary: "Keeps track of earlier messages so follow-up questions make sense.",
      whatHappens:
        "A language model has no memory between calls: each request starts blank. To hold a conversation, the application stores earlier turns and includes the relevant parts in every new prompt. Because long histories would fill the context window, older turns are usually condensed into a short summary, and only the latest turns are kept word for word.",
      howItHappens: [
        "Every question and answer is saved under the session id.",
        "On a new message, the recent turns are loaded.",
        "Turns beyond a limit are summarised into a few sentences by a model.",
        "Key facts such as the order number are extracted and kept.",
        "The summary and the latest turns are passed to the prompt builder.",
      ],
      whyImportant:
        "Without memory, 'what about the blue one?' or 'my headphones' is meaningless. Good memory makes the assistant feel natural and saves users from repeating themselves. Handled badly, it wastes tokens on old chatter, or worse, leaks one user's details into another's session.",
      tools: [
        { name: "LangGraph checkpointers", type: "State storage", note: "Persist conversation state per thread" },
        { name: "Redis", type: "Fast store", note: "Keeps recent turns with automatic expiry" },
        { name: "Zep", type: "Memory service", note: "Stores, summarises and searches long-term chat history" },
        { name: "mem0", type: "Memory layer", note: "Extracts and stores facts about users across sessions" },
      ],
      commonProblems: [
        "Sending the whole history every turn, which burns tokens and slows replies.",
        "Summaries that drop an important detail such as the order number.",
        "Mixing up sessions so one user sees another's information.",
        "Storing personal data indefinitely without a retention policy.",
      ],
    },
    sampleKey: "conversation_memory",
  },
  {
    id: "prompt_assembly",
    level: "medium",
    category: "generation",
    label: "Prompt Assembly",
    shortLabel: "Prompt",
    icon: "Puzzle",
    position: g(5, 1),
    details: {
      summary: "Combines instructions, context, history and the question into one prompt.",
      whatHappens:
        "The prompt is the only thing the model sees, so it has to be built carefully. A template combines fixed instructions (role, tone, 'answer only from the context, otherwise say you don't know'), the reranked passages, the conversation summary and the user's question. The builder counts tokens and trims the least important parts if the result would not fit.",
      howItHappens: [
        "Load a versioned prompt template with the system instructions.",
        "Insert the best passages first, each labelled with its source.",
        "Add the conversation summary and the current question.",
        "Count tokens and drop the lowest-ranked passages if over the limit.",
        "Send the finished prompt to the model.",
      ],
      whyImportant:
        "Small wording changes in a prompt can change accuracy and tone dramatically. Keeping prompts as versioned templates, not strings scattered in code, lets teams test and improve them safely. A clear instruction to stay within the context is the cheapest guard against hallucination.",
      tools: [
        { name: "LangChain prompt templates", type: "Framework", note: "Reusable, parameterised prompts with partial variables" },
        { name: "Jinja2", type: "Templating", note: "Plain templates stored and versioned outside the code" },
        { name: "tiktoken", type: "Token counter", note: "Counts tokens so prompts stay inside the context window" },
        { name: "DSPy", type: "Prompt optimization", note: "Optimises prompts against a metric instead of by hand" },
      ],
      commonProblems: [
        "Prompts edited in production with no versioning or way to roll back.",
        "Passages pasted in with no labels, so citations become impossible.",
        "Overflowing the context window and silently truncating the question.",
        "User text placed where it can override the system instructions.",
      ],
    },
    sampleKey: "prompt_assembly",
  },
  {
    id: "guardrails",
    level: "medium",
    category: "safety",
    label: "Guardrails",
    shortLabel: "Guardrails",
    icon: "ShieldCheck",
    position: g(4, 2),
    details: {
      summary: "Checks answers for safety, privacy and grounding before they are shown.",
      whatHappens:
        "Guardrails are automatic checks around the model. Input guardrails look for prompt injection, abuse and personal data in the question. Output guardrails check the draft answer: is every claim supported by the retrieved sources (grounding), does it contain personal data, is it toxic, is it off-topic? Answers that fail are blocked, rewritten or replaced with a safe fallback.",
      howItHappens: [
        "Scan the incoming question for attacks and sensitive data.",
        "After generation, compare each claim in the draft with the retrieved passages.",
        "Detect and mask personal information such as emails and card numbers.",
        "Run classifiers for toxicity, policy violations and off-topic content.",
        "Pass, rewrite or block the answer, and log the decision.",
      ],
      whyImportant:
        "A model that is right 98% of the time is still wrong for hundreds of users at scale, and one harmful or leaked answer can damage a brand or break the law. Guardrails make the failure modes predictable and give the business a way to say what the assistant must never do.",
      tools: [
        { name: "NeMo Guardrails", type: "Open-source toolkit", note: "Define conversation rules and safety flows in configuration" },
        { name: "Guardrails AI", type: "Validation framework", note: "Validators for format, safety and factual checks on outputs" },
        { name: "Llama Guard", type: "Safety classifier", note: "A model trained to classify unsafe prompts and responses" },
        { name: "Microsoft Presidio", type: "PII detection", note: "Finds and anonymises personal data in text" },
        { name: "OpenAI Moderation API", type: "Hosted classifier", note: "Flags harmful content categories in text" },
      ],
      commonProblems: [
        "Over-blocking, so legitimate questions are refused and users lose trust.",
        "Checks that only run on the question, not on the generated answer.",
        "A grounding check that is too lenient to catch subtle invented details.",
        "Guardrail latency that adds a second or more to every reply.",
      ],
    },
    sampleKey: "guardrails",
  },

  // =====================================================================
  // ADVANCED
  // =====================================================================
  {
    id: "hybrid_search",
    level: "advanced",
    category: "retrieval",
    label: "Hybrid Search",
    shortLabel: "Hybrid",
    icon: "Combine",
    position: g(3, 0),
    details: {
      summary: "Combines keyword search and vector search to find what either would miss.",
      whatHappens:
        "Vector search understands meaning but can overlook exact terms such as product codes, error messages or names. Keyword search (BM25) is the opposite: precise on exact words, blind to synonyms. Hybrid search runs both and merges the two ranked lists, commonly with reciprocal rank fusion, so a passage that ranks well in either list, or in both, rises to the top.",
      howItHappens: [
        "Send the question to the vector index and to a keyword index at the same time.",
        "Each returns its own ranked list of chunk ids.",
        "Fuse the lists, for example by summing 1 / (rank + 60) for each chunk.",
        "Sort by the fused score and keep the best candidates.",
        "Pass them on to retrieval and, optionally, to the reranker.",
      ],
      whyImportant:
        "Real questions mix meaning and exact terms: 'error E-4012 on my router' needs both. Hybrid search is a cheap way to improve recall without changing the model, and it is often the first thing teams add when users report that obvious documents were not found.",
      tools: [
        { name: "Elasticsearch / OpenSearch", type: "Search engine", note: "BM25 keyword search with vector support in the same engine" },
        { name: "Weaviate hybrid search", type: "Vector database feature", note: "Blends keyword and vector scores with a single parameter" },
        { name: "Qdrant sparse vectors", type: "Vector database feature", note: "Stores keyword-style sparse vectors beside dense ones" },
        { name: "Vespa", type: "Search platform", note: "Large-scale hybrid ranking with custom scoring" },
      ],
      commonProblems: [
        "Keeping two indexes that drift out of sync after updates.",
        "Poorly chosen fusion weights that let one signal drown out the other.",
        "Tokenisation differences that make keyword search miss the same word in another form.",
        "Higher cost and latency from querying two systems.",
      ],
    },
    sampleKey: "hybrid_search",
  },
  {
    id: "multimodal",
    level: "advanced",
    category: "input",
    label: "Multimodal Input",
    shortLabel: "Multimodal",
    icon: "Image",
    position: g(0, 0),
    details: {
      summary: "Lets users send images, audio or documents, not just text.",
      whatHappens:
        "Customers often show a problem instead of describing it: a photo of a cracked ear cup, a screenshot of an error, a voice note. Multimodal models and helper tools convert other kinds of input into something the pipeline can use: speech is transcribed to text, images are described in words or embedded, and scanned pages are read with OCR.",
      howItHappens: [
        "Detect the type of each attachment (image, audio, PDF).",
        "Transcribe audio with a speech-to-text model.",
        "Describe images with a vision-language model, or extract text from them with OCR.",
        "Merge the description with the typed text into one enriched question.",
        "Hand the combined question to the normal text pipeline.",
      ],
      whyImportant:
        "Evidence is often visual or spoken, and forcing people to type it out loses detail and patience. Multimodal input also makes the assistant usable for people who cannot easily type. The cost is more things that can go wrong, such as misread images and sensitive data hidden in photos.",
      tools: [
        { name: "Vision-capable LLMs", type: "Hosted models", note: "Claude, GPT and Gemini families accept images alongside text" },
        { name: "Whisper", type: "Speech-to-text", note: "Open model that transcribes audio in many languages" },
        { name: "Tesseract OCR", type: "Text extraction", note: "Reads text out of scanned pages and screenshots" },
        { name: "CLIP", type: "Image-text embeddings", note: "Puts images and text in the same vector space for search" },
      ],
      commonProblems: [
        "The model misreads or invents details that are not in the image.",
        "Personal data such as faces or addresses captured in uploaded photos.",
        "Very large files that make requests slow and expensive.",
        "Poor audio quality that produces wrong transcripts nobody notices.",
      ],
    },
    sampleKey: "multimodal",
  },
  {
    id: "agents_tools",
    level: "advanced",
    category: "adaptation",
    label: "Agents & Tool Use",
    shortLabel: "Agents",
    icon: "Bot",
    position: g(5, 3),
    details: {
      summary: "Lets the model decide to call tools and take actions, not just write text.",
      whatHappens:
        "In an agent setup the model is given a list of tools, such as 'look up an order', 'create a return' or 'run a SQL query', each described by a name and a set of parameters. When appropriate the model replies with a structured tool call instead of text. The application runs the tool, returns the result, and the model continues, repeating until the task is done.",
      howItHappens: [
        "Define tools with a name, a description and a JSON schema for the arguments.",
        "Send the tool list to the model along with the conversation.",
        "The model chooses a tool and outputs its arguments as structured data.",
        "The application validates the arguments and runs the tool.",
        "The result goes back to the model, which plans the next step or writes the final reply.",
      ],
      whyImportant:
        "This moves the assistant from answering questions to getting things done: starting a return, booking a slot, updating a ticket. It also opens real risks, because a wrong action has consequences. Agents need limited permissions, confirmation for risky steps and a cap on how many steps they may take.",
      tools: [
        { name: "OpenAI function calling / tool use", type: "Model feature", note: "Structured tool calls supported by major model providers" },
        { name: "LangGraph", type: "Agent framework", note: "Stateful, controllable agent workflows as graphs" },
        { name: "Model Context Protocol (MCP)", type: "Open standard", note: "A common way to expose tools and data to many AI apps" },
        { name: "LlamaIndex agents", type: "Agent framework", note: "Agents that combine retrieval and tools" },
        { name: "CrewAI", type: "Multi-agent framework", note: "Teams of role-based agents working on a task together" },
      ],
      commonProblems: [
        "Calling the wrong tool, or passing invented arguments.",
        "Endless loops where the agent keeps retrying a failing step.",
        "Tools with too much permission, so one mistake deletes or sends the wrong thing.",
        "Prompt injection through tool results, such as a web page that gives the model orders.",
      ],
    },
    sampleKey: "agents_tools",
  },
  {
    id: "fine_tuning",
    level: "advanced",
    category: "adaptation",
    label: "Fine-tuning",
    shortLabel: "Fine-tune",
    icon: "SlidersHorizontal",
    position: g(3, 3),
    details: {
      summary: "Adapts a base model to your tone, format or domain with extra training.",
      whatHappens:
        "Prompting and RAG change what the model is told. Fine-tuning changes the model itself. Starting from a pre-trained base model, you train it further on examples of the behaviour you want, such as thousands of past support replies in your brand voice. Parameter-efficient methods such as LoRA train only a small add-on, called an adapter, which is cheap and easy to swap.",
      howItHappens: [
        "Collect and clean hundreds to thousands of high-quality example conversations.",
        "Format them as prompt and ideal-response pairs and hold some back for testing.",
        "Train a LoRA adapter on top of a frozen base model.",
        "Measure loss and task-specific scores on the held-out examples.",
        "Register the adapter and deploy it behind the routing layer.",
      ],
      whyImportant:
        "Fine-tuning is good for style, format and specialist behaviour, such as a consistent tone or a strict output schema. It is a poor way to add new facts, which is what RAG is for, and it needs good data and ongoing maintenance. Many teams try prompting and RAG first and fine-tune only when those hit a limit.",
      tools: [
        { name: "Hugging Face PEFT / TRL", type: "Training libraries", note: "LoRA and supervised fine-tuning for open models" },
        { name: "Axolotl", type: "Training framework", note: "Config-driven fine-tuning of open-weight models" },
        { name: "Unsloth", type: "Training optimiser", note: "Faster, lower-memory LoRA training on a single GPU" },
        { name: "OpenAI fine-tuning API", type: "Hosted service", note: "Fine-tune supported hosted models without managing GPUs" },
      ],
      commonProblems: [
        "Small or noisy training data that teaches the model bad habits.",
        "Trying to teach facts that change, which are then out of date within weeks.",
        "Overfitting: the model parrots training examples and loses general ability.",
        "No test set, so nobody can tell whether the tuned model is actually better.",
      ],
    },
    sampleKey: "fine_tuning",
  },
  {
    id: "model_routing",
    level: "advanced",
    category: "adaptation",
    label: "Model Routing & Gateway",
    shortLabel: "Routing",
    icon: "Route",
    position: g(4, 3),
    details: {
      summary: "A single entry point that picks the right model for each request.",
      whatHappens:
        "Not every question needs the biggest model. An LLM gateway sits between your application and the model providers. It looks at each request, estimates how hard it is, and routes simple ones to a small, fast, cheap model and hard ones to a larger model. It also handles retries, fallbacks when a provider is down, rate limits and usage tracking.",
      howItHappens: [
        "The application sends all model calls to the gateway instead of to a provider.",
        "A router classifies the request by difficulty, length or topic.",
        "It picks a model according to cost, speed and quality rules.",
        "If the call fails or the answer fails a check, it falls back to another model.",
        "Usage, cost and errors are recorded for every request.",
      ],
      whyImportant:
        "Model prices differ by an order of magnitude, so sending easy traffic to a small model cuts cost and latency a lot with little loss in quality. A gateway also removes lock-in to one provider and gives one place to enforce budgets, keys and policies.",
      tools: [
        { name: "LiteLLM", type: "Open-source gateway", note: "One OpenAI-style API in front of many providers" },
        { name: "Portkey", type: "AI gateway", note: "Routing, fallbacks, caching and observability in one layer" },
        { name: "OpenRouter", type: "Model marketplace", note: "Access to many models through one API and key" },
        { name: "Cloudflare AI Gateway", type: "Managed gateway", note: "Caching, rate limiting and analytics for model calls" },
      ],
      commonProblems: [
        "A router that sends hard questions to the weak model and quality drops unnoticed.",
        "Different models that respond differently to the same prompt format.",
        "The gateway itself becoming a single point of failure.",
        "Fallback chains that quietly double the cost when a model is flaky.",
      ],
    },
    sampleKey: "model_routing",
  },
  {
    id: "evaluation",
    level: "advanced",
    category: "safety",
    label: "Evaluation",
    shortLabel: "Evaluate",
    icon: "Gauge",
    position: g(2, 3),
    details: {
      summary: "Measures answer quality automatically so changes can be tested, not guessed.",
      whatHappens:
        "How do you know a new prompt, model or chunk size made things better? Evaluation answers that with numbers. A test set of real questions with known good answers is run through the system, and the results are scored for faithfulness (does the answer match the sources?), relevance (does it address the question?) and retrieval quality. Often another LLM acts as the judge.",
      howItHappens: [
        "Build a test set of real questions with reference answers and sources.",
        "Run each question through the full pipeline and record the output and retrieved context.",
        "Score metrics such as faithfulness, answer relevance and context precision.",
        "Compare the scores with the previous version and block releases that regress.",
        "Sample live traffic regularly to catch drift in production.",
      ],
      whyImportant:
        "Language model output is fuzzy, so a change that fixes one question can break ten others, and nobody notices without measurement. Evaluation turns tuning from opinion into engineering and is what allows teams to improve a system safely over time.",
      tools: [
        { name: "RAGAS", type: "RAG evaluation", note: "Metrics for faithfulness, relevance and retrieval quality" },
        { name: "TruLens", type: "Evaluation and tracking", note: "Feedback functions that score each step of a chain" },
        { name: "DeepEval", type: "Test framework", note: "Unit-test style assertions for LLM outputs" },
        { name: "promptfoo", type: "Prompt testing", note: "Compare prompts and models side by side on a test set" },
        { name: "LangSmith evaluations", type: "Evaluation platform", note: "Datasets, experiments and LLM-as-judge scoring" },
      ],
      commonProblems: [
        "A test set too small or too easy to reveal real weaknesses.",
        "LLM judges that favour longer answers or their own style.",
        "Optimising for the metric until it no longer matches what users value.",
        "Evaluating once at launch and never again as documents and users change.",
      ],
    },
    sampleKey: "evaluation",
  },
  {
    id: "llm_observability",
    level: "advanced",
    category: "ops",
    label: "LLM Observability (LLMOps)",
    shortLabel: "Observe",
    icon: "Activity",
    position: g(1, 3),
    details: {
      summary: "Records every step of every request so problems can be traced and fixed.",
      whatHappens:
        "A single answer involves many steps, such as caching, embedding, search, reranking, prompt building, generation and checks, and any one can be the cause of a bad reply. Observability tools record each request as a trace made of timed spans, with inputs, outputs, token counts and cost. Teams use them to debug failures, watch latency and spend, and collect user feedback.",
      howItHappens: [
        "Instrument the pipeline so every step reports a span to a tracing backend.",
        "Each trace stores the prompt, retrieved passages, answer, timings and token counts.",
        "Cost is calculated per request from token usage.",
        "User feedback such as thumbs up and down is attached to the trace.",
        "Dashboards and alerts show latency, errors, cost and quality over time.",
      ],
      whyImportant:
        "Without traces, a wrong answer is a mystery: was the right document not found, was the prompt badly built, or did the model ignore the context? With traces it takes a minute to see. Observability also keeps spending visible, which matters because LLM costs grow silently with usage.",
      tools: [
        { name: "LangSmith", type: "Tracing platform", note: "Traces, datasets and evaluations for LangChain and other stacks" },
        { name: "Langfuse", type: "Open-source observability", note: "Self-hostable tracing, prompt management and cost tracking" },
        { name: "Arize Phoenix", type: "Open-source observability", note: "Trace exploration and evaluation for LLM applications" },
        { name: "Helicone", type: "Proxy-based monitoring", note: "Logs and analyses requests by routing them through a proxy" },
        { name: "OpenTelemetry", type: "Tracing standard", note: "Vendor-neutral instrumentation that works with many backends" },
      ],
      commonProblems: [
        "Logging prompts that contain personal data without protecting or expiring them.",
        "Traces that capture the final answer but not the retrieved passages.",
        "Alerting on averages, which hides a slow tail that real users feel.",
        "Collecting feedback but never feeding it back into the test set.",
      ],
    },
    sampleKey: "llm_observability",
  },
];

// The path the "Play data flow" packet follows at each level (node ids, in order).
export const playPaths = {
  basic: ["user_question", "embedding", "vector_db", "retrieval", "generation", "answer"],
  medium: [
    "user_question",
    "semantic_cache",
    "embedding",
    "vector_db",
    "retrieval",
    "reranking",
    "prompt_assembly",
    "generation",
    "guardrails",
    "answer",
  ],
  advanced: [
    "user_question",
    "semantic_cache",
    "embedding",
    "vector_db",
    "hybrid_search",
    "retrieval",
    "reranking",
    "prompt_assembly",
    "generation",
    "guardrails",
    "answer",
    "evaluation",
    "llm_observability",
  ],
};

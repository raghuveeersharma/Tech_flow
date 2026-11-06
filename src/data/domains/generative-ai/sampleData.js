// One customer question to a support assistant, plus the help-centre knowledge it searches.
// The viewer diffs `input` against `output` (top level keys):
//   green = added, yellow = modified, red strike = removed.

// ---- shared constants so consecutive stages stay consistent ----
const SESSION = "S-7712";
const QUESTION = "Can I get a refund if my headphones arrive damaged?";
const RAW_TEXT = "  can i get a refund if my headphones arrive damaged??  ";
const VECTOR = "[0.12, -0.48, 0.07, 0.31, …]";

// two help-centre chunks that answer the question
const T02 = "Refunds go to the original payment method within 5-7 business days of receiving the return.";
const T04 = "Damaged items can be returned for a full refund within 30 days of delivery. Attach a photo of the damage.";

const HISTORY = "Order O-4410 (wireless headphones) was delivered on 2026-11-05.";
const SYSTEM = "You are the support assistant for AcmeAudio. Answer only from the context.";

const ANSWER =
  "Yes. Damaged items can be returned for a full refund within 30 days of delivery. Please attach a photo of the damage. The refund goes to your original payment method within 5-7 business days of us receiving the return.";

// Fields that should always render with a decimal point (e.g. 1 -> 1.0)
export const floatFields = ["faithfulness", "answer_relevance", "context_precision", "style_match"];

export const sampleData = {
  user_question: {
    note: "The question exactly as the customer typed it into the chat widget: all lower case, a doubled question mark and stray spaces around it. Real user input is messy, and everything after this step has to cope with that.",
    input: null,
    output: {
      session_id: SESSION,
      channel: "web-chat",
      asked_at: "2026-11-06T09:41:07Z",
      text: RAW_TEXT,
    },
  },

  embedding: {
    note: "The text is tidied (trimmed, capitalised, one question mark) and sent to an embedding model. It returns a vector: a list of 768 numbers that captures the meaning of the sentence. Questions that mean the same thing end up with vectors that point in nearly the same direction.",
    input: {
      session_id: SESSION,
      channel: "web-chat",
      asked_at: "2026-11-06T09:41:07Z",
      text: RAW_TEXT,
    },
    output: {
      session_id: SESSION,
      channel: "web-chat",
      asked_at: "2026-11-06T09:41:07Z",
      text: QUESTION,
      embedding_model: "e5-base",
      dims: 768,
      vector: VECTOR,
    },
  },

  vector_db: {
    note: "The vector database compares the question vector with every stored chunk vector using cosine similarity and returns the three closest. The generic refund-timing chunk scores slightly higher than the damaged-items chunk, and a shipping chunk comes in a distant third.",
    input: {
      session_id: SESSION,
      query_vector: VECTOR,
      top_k: 3,
      collection: "help-center",
      metric: "cosine",
    },
    output: {
      session_id: SESSION,
      top_k: 3,
      collection: "help-center",
      hit_ids: ["refund-02", "refund-04", "shipping-07"],
      scores: [0.89, 0.86, 0.62],
      search_ms: 12,
    },
  },

  retrieval: {
    note: "Retrieval turns raw hits into usable context. Anything below the 0.7 similarity cut-off (the shipping chunk) is dropped, and the text of the chunks that pass is fetched and joined together, along with a count of how many tokens it will use.",
    input: {
      session_id: SESSION,
      hit_ids: ["refund-02", "refund-04", "shipping-07"],
      scores: [0.89, 0.86, 0.62],
      min_score: 0.7,
    },
    output: {
      session_id: SESSION,
      min_score: 0.7,
      kept_ids: ["refund-02", "refund-04"],
      dropped_ids: ["shipping-07"],
      context: `${T02} ${T04}`,
      context_tokens: 42,
    },
  },

  generation: {
    note: "The language model receives the instructions, the retrieved context and the question, and writes an answer one token at a time. Because the context is inside the prompt, it answers from the real policy instead of guessing. The call used 119 prompt tokens, wrote 51 and took 1.8 seconds.",
    input: {
      session_id: SESSION,
      system: SYSTEM,
      context: `${T04} ${T02}`,
      question: QUESTION,
      temperature: 0.2,
      max_tokens: 300,
    },
    output: {
      session_id: SESSION,
      system: SYSTEM,
      context: `${T04} ${T02}`,
      question: QUESTION,
      temperature: 0.2,
      max_tokens: 300,
      answer: ANSWER,
      prompt_tokens: 119,
      completion_tokens: 51,
      latency_ms: 1840,
    },
  },

  answer: {
    note: "The reply is formatted for the customer: citation markers are added to the text and the source titles are attached so they can click through and verify it. The internal chunk ids disappear, and the delivery time shows the whole round trip took about 2.5 seconds.",
    input: {
      session_id: SESSION,
      answer: ANSWER,
      source_ids: ["refund-04", "refund-02"],
    },
    output: {
      session_id: SESSION,
      answer: `${ANSWER} [1][2]`,
      sources: ["Refund Policy: damaged items", "Refund Policy: payout timing"],
      delivered_at: "2026-11-06T09:41:10Z",
      total_ms: 2510,
    },
  },

  // ----------------------------- MEDIUM -----------------------------
  semantic_cache: {
    note: "Before spending money on a model call, the cache looks for a similar question that was already answered. The closest one is about broken earphones and scores 0.82, below the 0.92 threshold, so this is a cache miss and the request continues down the pipeline.",
    input: {
      session_id: SESSION,
      question: QUESTION,
      threshold: 0.92,
      nearest_cached: null,
      similarity: null,
      cache_hit: null,
    },
    output: {
      session_id: SESSION,
      question: QUESTION,
      threshold: 0.92,
      nearest_cached: "Do I get my money back for broken earphones?",
      similarity: 0.82,
      cache_hit: false,
    },
  },

  doc_ingestion: {
    note: "This happens offline, long before any question. The Refund Policy web page is downloaded, stripped of HTML and cut into overlapping chunks of about 200 tokens. Our refund-04 chunk is one of the 12 pieces. Each chunk is then embedded and stored.",
    input: {
      doc_id: "refund-policy",
      source_url: "help.acmeaudio.com/refunds",
      format: "html",
      raw_chars: 4820,
      chunk_size: null,
      chunk_count: null,
    },
    output: {
      doc_id: "refund-policy",
      source_url: "help.acmeaudio.com/refunds",
      format: "text",
      raw_chars: 4820,
      chunk_size: 200,
      overlap: 30,
      chunk_count: 12,
      example_chunk_id: "refund-04",
      example_text: T04,
    },
  },

  reranking: {
    note: "A cross-encoder reads the question together with each candidate and scores how well the chunk actually answers it. The damaged-items chunk jumps from second to first place (0.97), and the generic payout chunk is demoted to a supporting role (0.64).",
    input: {
      session_id: SESSION,
      question: QUESTION,
      kept_ids: ["refund-02", "refund-04"],
      retriever_scores: [0.89, 0.86],
    },
    output: {
      session_id: SESSION,
      question: QUESTION,
      ranked_ids: ["refund-04", "refund-02"],
      rerank_scores: [0.97, 0.64],
    },
  },

  conversation_memory: {
    note: "The assistant remembers earlier turns of this chat. Two earlier messages are condensed into a short summary that says which order the customer means, so 'my headphones' is understood without asking again.",
    input: {
      session_id: SESSION,
      stored_turns: 2,
      history_summary: null,
      history_tokens: null,
    },
    output: {
      session_id: SESSION,
      stored_turns: 2,
      history_summary: HISTORY,
      history_tokens: 17,
    },
  },

  prompt_assembly: {
    note: "All the ingredients are combined into one prompt: fixed instructions are added, the best chunk goes first and the conversation summary is included. The final token count (119) is checked against the model's limit before anything is sent.",
    input: {
      session_id: SESSION,
      question: QUESTION,
      context: `${T04} ${T02}`,
      history_summary: HISTORY,
    },
    output: {
      session_id: SESSION,
      question: QUESTION,
      context: `${T04} ${T02}`,
      history_summary: HISTORY,
      system: SYSTEM,
      prompt_tokens: 119,
      token_limit: 8000,
    },
  },

  guardrails: {
    note: "The draft answer is checked before the customer sees it. A grounding check confirms every claim appears in the retrieved sources (score 0.96), a scan finds no personal data, and the verdict is 'pass'. A failing answer would be blocked or rewritten here.",
    input: {
      session_id: SESSION,
      answer: ANSWER,
      context_ids: ["refund-04", "refund-02"],
      grounded: null,
      pii_found: null,
      verdict: null,
    },
    output: {
      session_id: SESSION,
      answer: ANSWER,
      context_ids: ["refund-04", "refund-02"],
      grounded: true,
      grounding_score: 0.96,
      pii_found: false,
      verdict: "pass",
    },
  },

  // ----------------------------- ADVANCED -----------------------------
  hybrid_search: {
    note: "Vector search is good at meaning but can miss exact words. Hybrid search also runs a keyword (BM25) search and merges the two ranked lists with reciprocal rank fusion. The damaged-items chunk was found by both, so it moves to the top.",
    input: {
      session_id: SESSION,
      vector_hits: ["refund-02", "refund-04", "shipping-07"],
      keyword_hits: null,
      fused_ids: null,
      method: null,
    },
    output: {
      session_id: SESSION,
      vector_hits: ["refund-02", "refund-04", "shipping-07"],
      keyword_hits: ["refund-04", "refund-02"],
      fused_ids: ["refund-04", "refund-02", "shipping-07"],
      method: "reciprocal rank fusion",
    },
  },

  multimodal: {
    note: "The customer also attaches a photo of the damaged headphones. A vision model describes the image in words, so the rest of the pipeline can use it like any other text. The question is now handled as text plus image.",
    input: {
      session_id: SESSION,
      text: RAW_TEXT,
      attachment: "damaged_headphones.jpg",
      image_caption: null,
      modality: "text",
    },
    output: {
      session_id: SESSION,
      text: RAW_TEXT,
      attachment: "damaged_headphones.jpg",
      image_caption: "Wireless headphones with a cracked left ear cup",
      modality: "text+image",
    },
  },

  agents_tools: {
    note: "The customer follows up with 'Start the return for me.' Instead of only writing text, the model decides to call a tool. It picks create_return, fills in the arguments from the conversation and gets back a return number to report.",
    input: {
      session_id: SESSION,
      goal: "Start a return for order O-4410",
      tool: null,
      tool_args: null,
      tool_result: null,
      status: "planning",
    },
    output: {
      session_id: SESSION,
      goal: "Start a return for order O-4410",
      tool: "create_return",
      tool_args: "order=O-4410, reason=damaged",
      tool_result: "RMA-30912 created",
      status: "done",
    },
  },

  fine_tuning: {
    note: "The base model is good at general language but does not sound like AcmeAudio. A small LoRA adapter is trained on 1,800 past support replies. It adjusts a tiny fraction of the weights, and the tone-match score on held-out examples reaches 0.94.",
    input: {
      base_model: "open-instruct-7b",
      method: null,
      train_examples: null,
      adapter: null,
      eval_loss: null,
      style_match: null,
    },
    output: {
      base_model: "open-instruct-7b",
      method: "LoRA",
      train_examples: 1800,
      adapter: "acme-support-v1",
      eval_loss: 0.91,
      style_match: 0.94,
    },
  },

  model_routing: {
    note: "A gateway decides which model should handle each request. This is a short policy lookup, so it goes to a small, fast and cheap model, with a larger model as a fallback if the answer fails a check. Harder questions would take the other route.",
    input: {
      session_id: SESSION,
      prompt_tokens: 119,
      difficulty: null,
      model: null,
      fallback: null,
      reason: null,
    },
    output: {
      session_id: SESSION,
      prompt_tokens: 119,
      difficulty: "simple",
      model: "small-chat-model",
      fallback: "large-chat-model",
      reason: "policy lookup, short answer",
    },
  },

  evaluation: {
    note: "A sample of real answers is scored automatically by an LLM judge. Faithfulness (does the answer stick to the sources?), answer relevance and context precision all come out high, so this answer passes. Falling scores over time would flag a problem before customers complain.",
    input: {
      session_id: SESSION,
      answer: ANSWER,
      context_ids: ["refund-04", "refund-02"],
      faithfulness: null,
      answer_relevance: null,
      context_precision: null,
      passed: null,
    },
    output: {
      session_id: SESSION,
      answer: ANSWER,
      context_ids: ["refund-04", "refund-02"],
      faithfulness: 0.97,
      answer_relevance: 0.95,
      context_precision: 1,
      passed: true,
    },
  },

  llm_observability: {
    note: "Every request is recorded as a trace: each step with its timing and token counts. This one had 6 steps and used 170 tokens in total (119 in, 51 out), and generation was the slowest step. The customer's thumbs-up is attached to the same trace.",
    input: {
      trace_id: null,
      session_id: SESSION,
      spans: null,
      total_ms: null,
      tokens_total: null,
      slowest_span: null,
      user_feedback: null,
    },
    output: {
      trace_id: "tr-91c2",
      session_id: SESSION,
      spans: 6,
      total_ms: 2510,
      tokens_total: 170,
      slowest_span: "generation (1840 ms)",
      user_feedback: "thumbs_up",
    },
  },
};

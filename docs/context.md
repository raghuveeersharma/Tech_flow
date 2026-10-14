# Context

## Purpose

Data and AI work is hard to picture from a list of tool names. This app shows it as a **flow diagram**: each stage
is a node, and **one example record** (an order, a customer, a payment, a question) travels through every stage and
visibly changes. Clicking a node explains what happens, how, why it matters, which tools are used, and what
typically goes wrong, and shows a before/after view of the example record.

## Audience

Beginners to intermediate learners: people entering data engineering, analytics, data science, ML or generative AI,
and non-specialists who want to understand how those teams work. Copy is written in plain English and defines
jargon on first use.

## Scope

In scope

- A static, frontend-only site (deployable to Vercel or Netlify).
- A domain picker, then an interactive canvas per domain with three levels of depth.
- Complete written content for every stage (no placeholders).

Out of scope

- Any backend, API, database, user accounts or analytics.
- Live data or real tool integrations: all sample data is hand-written and illustrative.

## How the project came about

1. It began as a single-domain app (Data Engineering) built to a written brief: React Flow canvas, a detail panel,
   three levels, animated edges, a sample-data diff viewer.
2. It was then generalised: a domain picker was added and each domain became a self-contained data package.
3. Four more domains were authored against a shared schema and a validator.

## The five domains

| Domain id | Name | Running example | Stages (B / M / A) |
| --- | --- | --- | --- |
| `data-engineering` | Data Engineering | an e-commerce order (`A1001`) moving through a pipeline | 6 / 12 / 20 |
| `data-analytics` | Data Analytics | the question "why did weekly revenue in Indore drop?" | 6 / 12 / 18 |
| `data-science` | Data Science | customer `C-20817` and "will they churn?" | 6 / 12 / 18 |
| `ai-ml` | AI / Machine Learning | card payment `T-90431` scored by a fraud model | 6 / 12 / 19 |
| `generative-ai` | Generative AI & LLMs | the question "Can I get a refund if my headphones arrive damaged?" | 6 / 12 / 19 |

Levels are cumulative: Medium shows Basic plus Medium stages; Advanced shows everything.

## Content caveats

- Numbers in sample data are illustrative but kept internally consistent within a domain (for example, metrics that
  reconcile with a confusion matrix, token counts that add up).
- Tool names reflect the ecosystem at the time of writing. Product families are named rather than exact model
  versions, because those go stale quickly.
- Several domains were drafted by AI agents against the schema and then machine-validated; a human subject-matter
  review of the prose is still advisable before publishing widely.

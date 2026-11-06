# Documentation

Developer documentation for the **Data & AI Visual Guide**, a static React app that teaches how the work in
five domains flows, using one running example per domain.

| Document | What it covers |
| --- | --- |
| [context.md](context.md) | Why the project exists, who it is for, scope, the five domains and their running examples |
| [architecture.md](architecture.md) | Tech stack, folder structure, component tree, data flow, state, build and deploy |
| [data-model.md](data-model.md) | Schemas for domains, categories, nodes, edges and sample data, plus the rules the validator enforces |
| [behavior.md](behavior.md) | Interaction, level transitions, animation, responsive layout, accessibility |
| [adding-a-domain.md](adding-a-domain.md) | Step-by-step guide to adding or editing content |
| [decisions.md](decisions.md) | Design decisions with reasons, gotchas found along the way, known limitations |

Quick facts

- No backend, no API calls, no database. All text lives in `src/data/`.
- Run `npm run dev`, `npm run build`, `npm run preview`, `npm run validate`.
- Five domains: Data Engineering, Data Analytics, Data Science, AI / Machine Learning, Generative AI & LLMs.
- Every domain has three cumulative levels: Basic, Medium, Advanced (95 stages in total).

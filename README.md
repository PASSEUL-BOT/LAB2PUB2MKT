# LAB2PUB v2

A clean-foundation rebuild of LAB2PUB: a bridge from laboratory data to
publication (`Experiment → Data → Analysis → Finding → Figure/Table →
Manuscript Section → Publication`).

This is the **Phase 1–3 foundation**: application shell, semantic data
model, mock data layer, core pages, and an AI provider abstraction ready
for a real model to be wired in. It was built without network access, so
`node_modules` was never installed here — install locally before running.

## Stack

- **Next.js 14** (App Router) + **TypeScript** — routing, server/client components
- **Tailwind CSS** — design system (tokens in `tailwind.config.ts`)
- No external state library yet — Phase 2 uses server-rendered mock data;
  add one (Zustand/Redux/Query) when real interactivity lands in Phase 4

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy via GitHub

1. `git init && git checkout -b lab2pub-v2`
2. `git add . && git commit -m "LAB2PUB v2: foundation (shell, data model, AI abstraction)"`
3. Create a repo on GitHub, then:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin lab2pub-v2
   ```
4. Deploy the branch on Vercel (or any Next.js host) by importing the repo —
   no environment variables are required for the current mock-data build.
   When a real AI provider is wired in (see below), add its API key as an
   environment variable there rather than committing it.

## Project structure

```
app/                  Routes (App Router) — one folder per page
  projects/[id]/      Dynamic project detail route
components/
  layout/              Shell, Sidebar, Header
  ui/                  Button, Card, Badge, Table, Modal, Empty/Loading/ErrorState
lib/
  types.ts             Semantic content model (Project, Paper, Author, Experiment,
                        ResearchTopic, Method, Result, Figure/Table, Reference)
  mock-data.ts         In-memory DataStore implementing lib/types.ts — swap this
                        file for a real API client without touching pages
  ai/
    types.ts            AIProvider / AIRequest / AIResponse contract
    index.ts             runAI() — the one entry point pages should call
    providers/           mock-provider.ts (active), anthropic-provider.ts and
                          openai-provider.ts (stubs, throw until implemented)
```

## Design system

Tokens live in `tailwind.config.ts` and `app/globals.css`:
- Colors: `ink` (#14213D, text), `paper` (#FAFAF7, background), `teal`
  (#0F6E6E, primary action/data), `amber` (#B8860B, warnings only), `slate`
  (secondary text/borders)
- Type: Source Serif 4 for headings/titles, IBM Plex Sans for UI and body

## What's real vs. mocked

**Implemented:**
- Full semantic data model (`lib/types.ts`) covering every entity in the spec
- Mock data service (`lib/mock-data.ts`) — swappable for a real API/DB layer
- Application shell: sidebar nav, header, responsive layout
- Reusable UI primitives: buttons, cards, badges, tables, modal, empty/loading/error states
- Pages: Dashboard, Projects (list + detail), Experiments, Papers, Pipeline
- AI provider abstraction (`lib/ai/`) with a working mock provider and
  ready-to-implement Anthropic/OpenAI stubs

**Still mocked / not yet built:**
- No real database or API — `lib/mock-data.ts` is in-memory and resets on reload
- No auth boundary — every page is currently public
- AI providers other than `mock` throw until an SDK call is implemented
  server-side in `lib/ai/providers/*.ts`
- No create/edit forms yet — Phase 4 (Functional Workflows) adds real
  state transitions (create project, move an experiment through the
  pipeline, etc.)
- No tests

## Next recommended build step

Phase 4: wire up forms and mutations against a real backend (or a local
database via an ORM) so the pipeline stages actually move, replacing
`lib/mock-data.ts`'s static `getStore()` with real reads/writes.

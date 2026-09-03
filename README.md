# Writely — Grammar Autocorrector

A full-stack tool that detects and corrects grammar, spelling, punctuation and
style issues, paraphrases text, and scores writing quality — with accounts and
saved history. Built from scratch: React + Vite + Tailwind on the frontend,
Node/Express with a hand-written grammar engine on the backend.

## Features

- **Check Grammar** — paste or upload text, run it through a rule-based
  grammar/spelling/punctuation/style engine, see inline highlighted errors and
  an expandable corrections list with explanations and confidence scores.
- **Paraphrase** — rewrite text in five registers (Simple, Professional,
  Formal, Concise, Natural) using sentence templates and a mode-aware
  thesaurus.
- **Style Guide** — a Writing Score plus 8 metrics: clarity, sentence length,
  repeated words, passive voice, tone, formality, readability, word choice.
- **History** — every grammar check made while signed in is saved with the
  original text, corrected text, and error counts. Sign-in required, matching
  the provided design.
- **Accounts** — email/password sign up and sign in, JWT-based sessions,
  bcrypt-hashed passwords.

## Project structure

```
grammar-autocorrector/
├── frontend/            React + Vite + Tailwind CSS v4
│   └── src/
│       ├── pages/        CheckGrammar, Paraphrase, StyleGuide, History, SignIn, SignUp
│       ├── components/   Navbar, TrustBar, AuthCard, FormField, grammar/*
│       ├── context/      AuthContext (JWT session handling)
│       └── lib/api.js    Typed fetch wrapper for the backend
└── backend/              Node + Express (ESM)
    ├── routes/           auth, grammar, paraphrase, style, history
    ├── middleware/auth.js JWT verification (required + optional)
    ├── utils/
    │   ├── grammarEngine.js   Rule-based grammar/spelling/punctuation/style checker
    │   ├── paraphraser.js     Template + thesaurus-based paraphrasing
    │   ├── styleAnalyzer.js   Readability, passive voice, tone, etc.
    │   └── db.js              Simple JSON-file persistence (no external DB needed)
    └── data/db.json      Created automatically on first run
```

## Quick start

Requires **Node.js 18+**.

```bash
# 1. Install everything (root, frontend, backend)
npm run install:all

# 2. Copy the backend environment file and set a real JWT secret
cp backend/.env.example backend/.env
# then edit backend/.env and set JWT_SECRET to a long random string

# 3. Run both the backend (port 4000) and frontend (port 5173) together
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*`
requests to the backend automatically (see `frontend/vite.config.js`), so you
don't need to configure CORS origins for local development.

To run them separately instead:

```bash
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:5173
```

### Production build

```bash
npm run build:frontend        # outputs frontend/dist
node backend/server.js        # serve the API; set PORT/JWT_SECRET via env
```

Deploy `frontend/dist` as a static site (Vercel, Netlify, S3, etc.) and point
its `/api` requests at wherever you host `backend/` (Render, Railway, Fly.io,
a VPS with `pm2`, etc.). Update the frontend's API base URL if the backend
isn't reachable at a relative `/api` path in production, or put both behind
the same reverse proxy.

## How the grammar engine works

Rather than depending on a paid third-party API, `backend/utils/grammarEngine.js`
implements real detection rules from scratch:

- **Irregular verb misuse** — `has/have/had` followed by a simple-past form
  whose participle differs (`has went` → `went`, since the correct participle
  is "gone", not "went").
- **Regularized irregular verbs** — a curated dictionary catches ESL-style
  errors like `buyed` → `bought`, `goed` → `went`, `catched` → `caught`.
- **Subject–verb agreement** — `they/we/you was` → `were`, `he/she/it were` →
  `was`, `I/you/we/they has` → `have`, `he/she/it do` → `does`.
- **Spelling** — ~70 common misspellings (`recieve`, `definately`,
  `seperate`, …) plus a doubled-final-letter heuristic (`tastyy` → `tasty`).
- **Homophones** — contextual `their/there`, `your/you're`, `its/it's`,
  `then/than` checks based on the surrounding words.
- **Punctuation** — double spaces, space-before-punctuation, missing
  capitalization at sentence starts.
- **Style** — comma-splice detection (`friend, we had` → `friend and we
  had`), double negatives, and (in **Formal** mode) contractions flagged for
  expansion.

Each match becomes a correction with a `type` (`grammar` / `spelling` /
`style` / `punctuation`), an `offset`/`length` into the original text, a
plain-English `explanation`, and a `confidence` score — exactly what the
frontend needs to underline the right span and populate the corrections
panel. This keeps the whole app **fully functional offline, with zero API
keys required.**

### Swapping in a stronger grammar/paraphrase engine (optional)

The rule-based engine handles the error types described in the brief well,
but it isn't a full NLP parser. If you want higher coverage:

- Wire `backend/routes/grammar.js` to call the free
  [LanguageTool API](https://languagetool.org/http-api/) (`POST
  https://api.languagetool.org/v2/check`) and map its `matches[]` to the same
  `{ type, original, suggestion, explanation, offset, length, confidence }`
  shape the frontend expects.
- Or call the Anthropic/OpenAI API from `paraphrase.js` /
  `grammar.js` for LLM-quality rewrites, using the existing rule-based engine
  as an always-available fallback if the API call fails or no key is set.

Both are drop-in replacements — the frontend doesn't need to change at all
since it only talks to your `/api/*` endpoints.

## Design

The UI matches the provided mockups: a near-black surface palette, a warm
peach accent (`#EEC49A`), Playfair Display for the "WRITELY" wordmark and
headings, and Lora for the writing surface itself. Error types are
color-coded per the legend — grammar (red), spelling (orange), style
(yellow), punctuation (purple).

## Environment variables (backend)

| Variable     | Default                         | Notes                                  |
|--------------|----------------------------------|-----------------------------------------|
| `PORT`       | `4000`                           | API port                                |
| `JWT_SECRET` | `dev-only-secret-change-me`      | **Change this before deploying.**       |

## Notes

- Data is stored in `backend/data/db.json`, created automatically on first
  run. This is intentionally simple (no database server to install) — swap in
  Postgres/SQLite/Mongo by replacing `backend/utils/db.js` if you need
  multi-instance deployment.
- Passwords are hashed with bcrypt; sessions are stateless JWTs valid for 30
  days.

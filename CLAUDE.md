# CLAUDE.md

Guidance for Claude Code (and other contributors) working in this repository.

## Project: DocuMind

A document-aware RAG (Retrieval-Augmented Generation) chat app. Users upload
PDFs / DOCX / TXT / PPTX, the backend chunks + embeds them into a FAISS index,
and then answers questions with grounded citations using one of several LLM
providers (Groq, OpenAI, OpenRouter, Gemini, Ollama, Anthropic).

## Architecture

```
main.py                       Launcher. Re-execs into ./.venv if present, then
                              spawns: uvicorn backend.api:app --port 8000

backend/                      FastAPI service
  api.py                      HTTP endpoints (/upload, /ask, /clear, /documents,
                              /history, /stats, /search, /providers, /settings/providers)
  rag_engine.py               ConversationalRAG: embeddings + FAISS + provider fan-out
  llm_provider.py             LLMProvider: per-vendor clients, health checks,
                              60s working-providers cache
  doc_loader.py               UniversalDocLoader: PDF / DOCX / TXT / PPTX → chunks
  config.py                   Config class. Reads .env, exposes Config.reload_from_env()
  models.py                   SQLAlchemy ORM: Conversation, User + helper functions
  static/                     Built-in vanilla-JS test UI (served at GET /)
  history_db.py, histroy_db.py   DEAD CODE (see CLEANUP.md)

frontend/                     Vite + React 19 + Tailwind 4 + lucide-react
  src/pages/                  Top-level routes (Dashboard, Settings, Setup, ...)
  src/components/             Reusable UI
  src/lib/api.ts              Single HTTP client. Exposes toCanonicalProvider()
  src/lib/setupState.ts       localStorage helpers for first-time setup
  src/context/                Theme, Tour, User context providers

data/                         Runtime artifacts (gitignored)
  faiss_index/                Persistent FAISS vector store
  uploads/                    Where uploaded source files live (formerly project root)
  conversation_history.db     SQLite history

.env                          Real API keys (gitignored)
.env.template                 Reference for what to set in .env
```

## Running

```powershell
# 1. Backend (port 8000)
python main.py

# 2. Frontend dev server (port 3000, proxies /api -> localhost:8000)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. First-time users land on `/setup` and must enter
one provider API key before being redirected to `/dashboard`.

`PERSIST_FAISS=true` in `.env` keeps the index between restarts; `false` wipes
both the index and the upload directory on startup (development mode).

## Key conventions

- **Backend canonical provider names** are: `groq | openai | openrouter | gemini | ollama | anthropic`. The frontend's UI labels (e.g. "Google Gemini", "Claude 3.5") are translated by `toCanonicalProvider()` in `frontend/src/lib/api.ts`. Never send raw UI labels to `/settings/providers`.
- **Upload location** is `Config.UPLOAD_DIR` (default `data/uploads/`). Never write `temp_*` files into the project root.
- **History DB** is accessed exclusively through `backend/models.py`. `history_db.py` / `histroy_db.py` are dead legacy modules.
- **Working-provider list** is cached for 60s inside `LLMProvider`. After any `/settings/providers` update the cache is force-refreshed.
- **Frontend HTTP** always goes through `frontend/src/lib/api.ts`; do not call `fetch` directly except inside that file (Dashboard's `/api/providers` polling is the only intentional exception).

## When changing things

- Adding a provider? Update three places: `LLMProvider._init_providers` + `_sync_env_from_config` (backend) and `toCanonicalProvider` (frontend).
- Adding an endpoint? Mirror the type in `frontend/src/lib/api.ts` so callers stay typed.
- Changing chunking? `Config.CHUNK_SIZE`, `Config.CHUNK_OVERLAP`, `Config.TOP_K_CHUNKS` are all env-overridable. Don't hardcode.

## Gotchas

- `PROVIDER_PRIORITY=openai` (single value) means the system never falls back to other providers, even if they have valid keys. If `/ask` returns "API key unauthorized" check `.env` first.
- The Windows shell here is PowerShell; `&&` chaining is invalid (use `;` or separate calls).
- `data/`, `*.log`, `temp_*`, `__pycache__/` and `**/.env` are all gitignored. Don't commit them.

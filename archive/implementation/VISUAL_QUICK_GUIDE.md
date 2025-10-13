# 🎯 Quick Visual Guide

## Before vs After

### ❌ BEFORE (Confusing)
```
┌─────────────────────────────────────────┐
│  Which frontend should I use?           │
│                                         │
│  1. app.py (root)        ← Direct RAG  │
│  2. frontend/app_api.py  ← API client  │
│  3. frontend/admin.py    ← Analytics   │
│                                         │
│  😕 Too many choices!                   │
└─────────────────────────────────────────┘
```

### ✅ AFTER (Clear)
```
┌─────────────────────────────────────────┐
│  Clear separation:                      │
│                                         │
│  1. frontend/app_api.py  ← MAIN UI     │
│     (Upload docs, ask questions)        │
│                                         │
│  2. frontend/admin.py    ← ADMIN       │
│     (Analytics, charts, export)         │
│                                         │
│  😊 Simple and clear!                   │
└─────────────────────────────────────────┘
```

---

## How to Run

### 🚀 Option 1: One Command (Recommended)
```
┌──────────────────────────────────┐
│  $ python main.py                │
├──────────────────────────────────┤
│                                  │
│  ✅ Checks dependencies          │
│  ✅ Checks configuration          │
│  ✅ Starts backend (8000)        │
│  ✅ Starts frontend (8501)       │
│  ✅ Monitors everything          │
│                                  │
│  Press Ctrl+C to stop all        │
└──────────────────────────────────┘
```

### 🔧 Option 2: Manual (Advanced)
```
┌──────────────────────────────────┐
│  Terminal 1:                     │
│  $ uvicorn backend.api:app       │
│     --reload --port 8000         │
├──────────────────────────────────┤
│  Terminal 2:                     │
│  $ streamlit run                 │
│     frontend/app_api.py          │
├──────────────────────────────────┤
│  Terminal 3: (Optional)          │
│  $ streamlit run                 │
│     frontend/admin.py            │
│     --server.port 8502           │
└──────────────────────────────────┘
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USER                             │
└────────────┬────────────────────────────────────────┘
             │
             │  python main.py
             ▼
┌─────────────────────────────────────────────────────┐
│                   MAIN.PY                           │
│              (Unified Launcher)                     │
│                                                     │
│  ✅ Dependency Check                                │
│  ✅ Config Validation                               │
│  🚀 Start Backend                                   │
│  🚀 Start Frontend                                  │
│  👀 Monitor Processes                               │
│  🛑 Clean Shutdown                                  │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
       ▼                          ▼
┌─────────────────┐      ┌──────────────────┐
│  BACKEND API    │      │  FRONTEND UI     │
│  (Port 8000)    │◄────►│  (Port 8501)     │
│                 │ REST │                  │
│ FastAPI         │ API  │ Streamlit        │
│ • 8 Endpoints   │      │ • Upload Docs    │
│ • RAG Engine    │      │ • Q&A Chat       │
│ • Database      │      │ • History        │
│ • Multi-LLM     │      │ • Sources        │
└─────────────────┘      └──────────────────┘
       ▲
       │ REST API
       │
┌──────────────────┐
│ ADMIN DASHBOARD  │
│  (Port 8502)     │
│                  │
│ Streamlit        │
│ • Analytics      │
│ • Charts         │
│ • Export CSV     │
│ • Search         │
└──────────────────┘
```

---

## File Structure

```
📁 RAG/
│
├── 🚀 main.py                    ← START HERE!
│
├── ⚙️ backend/
│   ├── api.py                   ← FastAPI endpoints
│   ├── rag_engine.py            ← RAG logic
│   ├── llm_provider.py          ← Multi-LLM
│   ├── doc_loader.py            ← Document processing
│   ├── models.py                ← Database ORM
│   └── config.py                ← Configuration
│
├── 🖥️ frontend/
│   ├── app_api.py               ← MAIN UI ⭐
│   └── admin.py                 ← ADMIN DASHBOARD 📊
│
├── 🔐 .env                       ← Your API keys
├── 📦 requirements.txt
└── 💾 conversation_history.db
```

---

## Workflow

```
┌─────────────────────────────────────────────┐
│  Step 1: Setup (First Time Only)           │
├─────────────────────────────────────────────┤
│  1. pip install -r requirements.txt         │
│  2. cp .env.template .env                   │
│  3. Edit .env (add API keys)                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Step 2: Run System                         │
├─────────────────────────────────────────────┤
│  $ python main.py                           │
│                                             │
│  Output:                                    │
│  🔍 Checking dependencies... ✅             │
│  🔍 Checking configuration... ✅            │
│  🚀 Starting backend... ✅                  │
│  🚀 Starting frontend... ✅                 │
│                                             │
│  ✅ RAG SYSTEM RUNNING                      │
│  📍 Frontend: http://localhost:8501         │
│  📍 Backend:  http://localhost:8000         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Step 3: Use System                         │
├─────────────────────────────────────────────┤
│  Main UI (8501):                            │
│  • Upload PDF/DOCX/TXT                      │
│  • Ask questions                            │
│  • Get AI answers with sources              │
│                                             │
│  Admin Dashboard (8502):                    │
│  • View analytics                           │
│  • Export data                              │
│  • Search conversations                     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Step 4: Stop System                        │
├─────────────────────────────────────────────┤
│  Press Ctrl+C in terminal                   │
│                                             │
│  Output:                                    │
│  🛑 Shutting down servers...                │
│    Stopping Backend... ✅                   │
│    Stopping Frontend... ✅                  │
│  ✅ Shutdown complete                       │
└─────────────────────────────────────────────┘
```

---

## Quick Reference

| What | Command | URL |
|------|---------|-----|
| **Start Everything** | `python main.py` | - |
| **Main UI** | Auto-started | http://localhost:8501 |
| **Admin Dashboard** | `streamlit run frontend/admin.py --server.port 8502` | http://localhost:8502 |
| **API Docs** | Auto-started | http://localhost:8000/docs |
| **Stop Everything** | `Ctrl+C` | - |

---

## Key Points

### ✅ Two Frontends Only
1. **frontend/app_api.py** - Main Q&A interface
2. **frontend/admin.py** - Analytics dashboard

### ✅ main.py Benefits
- One command to start everything
- Automatic dependency checking
- Automatic configuration validation
- Process monitoring
- Graceful shutdown

### ✅ Clean Architecture
- Backend API (FastAPI)
- Frontend UIs (Streamlit)
- Database (SQLite + SQLAlchemy)
- Multi-LLM support (Groq/OpenRouter/OpenAI)

---

## Troubleshooting

```
┌─────────────────────────────────────────────┐
│  Problem: Dependencies missing              │
├─────────────────────────────────────────────┤
│  Solution:                                  │
│  $ pip install -r requirements.txt          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Problem: .env file not found               │
├─────────────────────────────────────────────┤
│  Solution:                                  │
│  $ cp .env.template .env                    │
│  Then edit .env and add API keys            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Problem: Port already in use               │
├─────────────────────────────────────────────┤
│  Solution:                                  │
│  Kill process using that port, or           │
│  Change port in main.py                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Problem: Backend won't start               │
├─────────────────────────────────────────────┤
│  Solution:                                  │
│  Check API keys in .env                     │
│  Check backend/config.py                    │
│  Run manually to see errors:                │
│  $ uvicorn backend.api:app --reload         │
└─────────────────────────────────────────────┘
```

---

**Ready to use your simplified RAG system! 🚀**

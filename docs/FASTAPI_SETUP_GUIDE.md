# 🚀 FastAPI Backend - Setup & Testing Guide

**Last Updated:** October 3, 2025  
**Status:** FastAPI backend deployed with SQLite conversation history

---

## 📦 Installation

### 1. Install Dependencies

```powershell
# From project root
pip install -r requirements.txt
```

**New packages added for FastAPI backend:**
- `fastapi` - Modern web framework for building APIs
- `uvicorn[standard]` - ASGI server for running FastAPI
- `pydantic` - Data validation using Python type annotations
- `python-dotenv` - Load environment variables from .env

**Existing packages:**
- `streamlit` - Frontend UI
- `langchain-*` - LLM orchestration
- `faiss-cpu` - Vector database
- `sentence-transformers` - Embeddings
- `PyPDF2`, `python-docx`, `python-pptx` - Document loaders

---

## ⚙️ Configuration

### 2. Setup `.env` File

Create or update your `.env` file in the project root:

```env
# API Keys (required)
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key_here
OPENAI_API_KEY=sk-your_openai_key_here

# Models (optional - defaults shown)
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_MODEL=meta-llama/llama-3.3-8b-instruct:free
OPENAI_MODEL=gpt-4o-mini

# Chunking (optional)
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Retrieval (optional)
TOP_K_CHUNKS=4

# Embedding (optional)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# FAISS Persistence (optional)
PERSIST_FAISS=false
FAISS_PERSIST_DIR=faiss_index

# Provider Priority (NEW - optional)
PROVIDER_PRIORITY=groq,openrouter,openai

# History Database (NEW - optional)
HISTORY_DB_PATH=conversation_history.db
```

### 3. Verify Configuration

```powershell
# Test that config loads properly
python -c "from backend.config import Config; print('API Keys loaded:', bool(Config.GROQ_API_KEY)); print('Provider Priority:', Config.PROVIDER_PRIORITY)"
```

**Expected output:**
```
API Keys loaded: True
Provider Priority: ['groq', 'openrouter', 'openai']
```

---

## 🏃 Running the FastAPI Backend

### 4. Start the API Server

```powershell
# From project root (P:\Projects\RAG)
uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
```

**Command breakdown:**
- `backend.api:app` - Python module path to FastAPI app
- `--reload` - Auto-reload on code changes (dev mode)
- `--host 0.0.0.0` - Accept connections from any IP (use 127.0.0.1 for local-only)
- `--port 8000` - Port to run on

**Expected output:**
```
INFO:     Will watch for changes in these directories: ['P:\\Projects\\RAG']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. Access Interactive API Documentation

Once the server is running, open your browser:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.

---

## 🧪 Testing the API

### Endpoint Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload documents for indexing |
| `/ask` | POST | Ask a question about uploaded docs |
| `/clear` | POST | Clear FAISS index and conversation history |
| `/history` | GET | Retrieve conversation history |
| `/init` | POST | Re-initialize database and folders |

---

### Test 1: Initialize Database

```powershell
curl -X POST "http://localhost:8000/init" -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "status": "initialized",
  "db_path": "conversation_history.db"
}
```

---

### Test 2: Upload Documents

**Using curl (PowerShell):**
```powershell
# Upload a single PDF
curl -X POST "http://localhost:8000/upload" `
  -F "files=@C:\path\to\document.pdf"

# Upload multiple files
curl -X POST "http://localhost:8000/upload" `
  -F "files=@C:\path\to\doc1.pdf" `
  -F "files=@C:\path\to\doc2.docx"
```

**Using Python requests:**
```python
import requests

files = [
    ('files', open('document.pdf', 'rb')),
    ('files', open('report.docx', 'rb'))
]
response = requests.post('http://localhost:8000/upload', files=files)
print(response.json())
```

**Expected response:**
```json
{
  "status": "ok",
  "files_indexed": ["temp_document.pdf", "temp_report.docx"]
}
```

---

### Test 3: Ask Questions

**Using curl (PowerShell):**
```powershell
curl -X POST "http://localhost:8000/ask" `
  -H "Content-Type: application/json" `
  -d '{\"question\":\"What is the main idea of the document?\"}'
```

**Using Python requests:**
```python
import requests

response = requests.post(
    'http://localhost:8000/ask',
    json={"question": "What is the main idea of the document?"}
)
result = response.json()
print("Answer:", result['answer'])
print("Sources:", result['sources'])
print("Provider:", result['meta']['provider'])
```

**Expected response:**
```json
{
  "answer": "The main idea is... [citations included]",
  "sources": [
    "[document.pdf, page 1, chunk 1]",
    "[document.pdf, page 2, chunk 3]"
  ],
  "meta": {
    "timestamp": "2025-10-03T14:30:45.123456Z",
    "provider": "fusion:groq+openrouter",
    "duration_s": 2.34,
    "status": "ok"
  }
}
```

---

### Test 4: View Conversation History

```powershell
# Get last 100 conversations (default)
curl -X GET "http://localhost:8000/history"

# Get last 10 conversations
curl -X GET "http://localhost:8000/history?limit=10"
```

**Expected response:**
```json
{
  "count": 5,
  "entries": [
    {
      "id": 5,
      "timestamp": "2025-10-03T14:30:45.123456Z",
      "question": "What is the main idea?",
      "answer": "The main idea is...",
      "sources": ["[document.pdf, page 1, chunk 1]"],
      "provider": "fusion:groq+openrouter",
      "duration_s": 2.34,
      "status": "ok"
    },
    ...
  ]
}
```

---

### Test 5: Clear Everything

```powershell
curl -X POST "http://localhost:8000/clear"
```

**Expected response:**
```json
{
  "status": "cleared"
}
```

This will:
- ✅ Clear FAISS vector index
- ✅ Clear conversation history (in-memory)
- ✅ Delete SQLite database file
- ✅ Remove temporary files
- ✅ Re-initialize empty database

---

## 🔍 Advanced Testing

### Test Provider Priority

**Test 1: Default priority (groq → openrouter → openai)**
```powershell
curl -X POST "http://localhost:8000/ask" `
  -H "Content-Type: application/json" `
  -d '{\"question\":\"Test provider priority\"}'
```

Check the `meta.provider` field in response - should be `"groq"` or `"fusion:groq+openrouter"` if both available.

**Test 2: Change priority via .env**
```env
# Edit .env file
PROVIDER_PRIORITY=openrouter,groq,openai
```

Restart server and re-test - should now prefer OpenRouter.

---

### Test Rate Limit Handling

If you hit rate limits, the system will:
1. Try alternative providers in priority order
2. Return error message if all providers fail
3. Log detailed error information

**Example error response:**
```json
{
  "answer": "[GROQ rate limit exceeded]; [OPENROUTER API authentication failed]",
  "sources": [...],
  "meta": {
    "provider": "none",
    "status": "error"
  }
}
```

---

### Test Persistence

**With PERSIST_FAISS=false (default):**
```powershell
# 1. Upload documents
curl -X POST "http://localhost:8000/upload" -F "files=@doc.pdf"

# 2. Ask question (works)
curl -X POST "http://localhost:8000/ask" -d '{\"question\":\"Test\"}'

# 3. Restart server (Ctrl+C, then uvicorn again)
# 4. Ask question (fails - no documents)
curl -X POST "http://localhost:8000/ask" -d '{\"question\":\"Test\"}'
# Response: "No documents loaded."
```

**With PERSIST_FAISS=true:**
```env
# Edit .env
PERSIST_FAISS=true
```

```powershell
# 1. Upload documents
curl -X POST "http://localhost:8000/upload" -F "files=@doc.pdf"

# 2. Restart server
# 3. Ask question (still works - loaded from disk)
curl -X POST "http://localhost:8000/ask" -d '{\"question\":\"Test\"}'
```

---

## 📊 Monitoring & Debugging

### Check Server Logs

The FastAPI server logs will show:
- ✅ Provider selection: `"Using provider groq (cascade)"`
- ✅ Fusion attempts: `"Fusion successful (fusion:groq+openrouter) in 2.34s"`
- ✅ Errors: `"Provider groq rate limit exceeded"`
- ✅ File uploads: `"document.pdf -> 15 chunks"`

### Check Database Contents

```powershell
# Install SQLite browser (optional)
# Or use Python
python -c "import sqlite3; con = sqlite3.connect('conversation_history.db'); print(con.execute('SELECT COUNT(*) FROM conversations').fetchone())"
```

### Check FAISS Index

```powershell
# Check if index exists
Test-Path faiss_index

# Count vectors (requires Python)
python -c "from backend.rag_engine import ConversationalRAG; rag = ConversationalRAG(); print('Vectors:', rag.vectorstore.index.ntotal if rag.vectorstore else 0)"
```

---

## 🔧 Troubleshooting

### Issue: "No module named 'backend'"

**Solution:** Run uvicorn from project root, not from `backend/` folder.

```powershell
# Wrong (from backend/ folder)
cd backend
uvicorn api:app

# Correct (from project root)
cd P:\Projects\RAG
uvicorn backend.api:app --reload
```

---

### Issue: "Port 8000 already in use"

**Solution:** Use a different port or kill existing process.

```powershell
# Use different port
uvicorn backend.api:app --reload --port 8001

# Or find and kill process on port 8000
netstat -ano | findstr :8000
# Note the PID, then:
taskkill /PID <pid> /F
```

---

### Issue: "No documents loaded"

**Solutions:**
1. Upload documents via `/upload` endpoint first
2. Enable `PERSIST_FAISS=true` if you want documents to survive restarts
3. Check that FAISS index was created: `Test-Path faiss_index`

---

### Issue: "No LLM providers available"

**Solutions:**
1. Check that `.env` has at least one API key set
2. Verify keys are valid (test with simple API call)
3. Check logs for provider initialization errors

```powershell
# Verify config
python -c "from backend.config import Config; print('Groq:', bool(Config.GROQ_API_KEY)); print('OpenRouter:', bool(Config.OPENROUTER_API_KEY))"
```

---

### Issue: Database locked errors

**Solution:** Only one process can write to SQLite at a time.

```powershell
# Close any open database connections
# Or use a different database file for testing
HISTORY_DB_PATH=test_history.db uvicorn backend.api:app --reload
```

---

## 🎯 Next Steps

You mentioned three options - here's my recommendation:

### **Option A: Streamlit → API Integration** ⭐ RECOMMENDED FIRST

**Why:** Separates concerns, enables scaling, maintains backward compatibility.

**What I'll create:**
- `frontend/app_api.py` - Streamlit UI that calls FastAPI endpoints
- Keep existing `frontend/app.py` (direct RAG) as backup
- Toggle between modes via environment variable

**Benefits:**
- ✅ No breaking changes
- ✅ Can run frontend/backend on different servers
- ✅ Easy to add more frontends later (Gradio, React, etc.)

---

### **Option B: SQLAlchemy ORM** 🔧 NICE TO HAVE

**Why:** Better for complex queries, relationships, migrations.

**Current:** Raw SQL with `sqlite3`  
**After:** SQLAlchemy models with Alembic migrations

**Benefits:**
- ✅ Type-safe database operations
- ✅ Easy to add relationships (users, sessions, documents)
- ✅ Database migration support
- ⚠️ More complex for simple use case

**Recommendation:** Defer unless you're adding users/auth/complex queries.

---

### **Option C: Admin Dashboard** 📊 HIGH VALUE

**Why:** Visibility into system usage, debugging, analytics.

**What I'll create:**
- `frontend/admin.py` - Streamlit admin panel
- Features:
  - 📈 Conversation history with filters (date, provider, status)
  - 📊 Analytics: queries/day, provider usage breakdown, avg response time
  - 🔍 Search conversations by keyword
  - 🗑️ Delete individual conversations
  - 📥 Export history to CSV/JSON

**Benefits:**
- ✅ Understand user behavior
- ✅ Debug production issues
- ✅ Monitor system health
- ✅ Demonstrate ROI to stakeholders

---

## 🗳️ My Recommendation

**Do this order:**

1. **Option A (30 min)** - Streamlit → API integration
   - Immediate value: Decoupled architecture
   - Low risk: Keep both versions running

2. **Option C (2 hours)** - Admin dashboard
   - High value: Visibility and analytics
   - Useful for debugging and monitoring

3. **Option B (skip for now)** - SQLAlchemy
   - Defer until you need complex queries
   - Current raw SQL is fine for simple operations

---

## 🚀 Ready to Implement?

**Pick one:**
- **"A"** - Create Streamlit app that calls FastAPI endpoints
- **"C"** - Create admin dashboard for conversation history
- **"AC"** - Create both (recommended, ~2.5 hours total)
- **"Wait"** - I want to test the API manually first

Let me know and I'll provide the code immediately! 🎯

# ⚡ FastAPI Quick Reference Card

## 🚀 Quick Start (30 seconds)

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup .env file
# Add your API keys to .env file

# 3. Start server
uvicorn backend.api:app --reload --port 8000

# 4. Open browser
# http://localhost:8000/docs
```

---

## 📋 Common Commands

### Start Server
```powershell
# Development (auto-reload)
uvicorn backend.api:app --reload --port 8000

# Production (no reload)
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --workers 4

# Different port
uvicorn backend.api:app --reload --port 8001
```

### Test Endpoints
```powershell
# Initialize database
curl -X POST http://localhost:8000/init

# Upload document
curl -X POST http://localhost:8000/upload -F "files=@document.pdf"

# Ask question
curl -X POST http://localhost:8000/ask -H "Content-Type: application/json" -d '{\"question\":\"Summarize this\"}'

# View history
curl http://localhost:8000/history

# Clear all
curl -X POST http://localhost:8000/clear
```

---

## 🎯 API Endpoints

| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/docs` | GET | Swagger UI | - |
| `/init` | POST | Initialize DB | - |
| `/upload` | POST | Upload docs | `multipart/form-data` |
| `/ask` | POST | Ask question | `{"question": "..."}` |
| `/history` | GET | Get history | `?limit=100` |
| `/clear` | POST | Clear all | - |

---

## ⚙️ Environment Variables

```env
# Required
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...

# Optional (with defaults)
PROVIDER_PRIORITY=groq,openrouter,openai
PERSIST_FAISS=false
HISTORY_DB_PATH=conversation_history.db
CHUNK_SIZE=1000
TOP_K_CHUNKS=4
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `uvicorn backend.api:app --port 8001` |
| No module 'backend' | Run from project root, not backend/ |
| No documents loaded | Upload files via `/upload` first |
| Database locked | Close other DB connections |
| No providers | Check API keys in `.env` |

---

## 📊 Response Format

**Successful /ask response:**
```json
{
  "answer": "The answer with citations...",
  "sources": ["[doc.pdf, page 1, chunk 1]"],
  "meta": {
    "timestamp": "2025-10-03T14:30:45Z",
    "provider": "fusion:groq+openrouter",
    "duration_s": 2.34,
    "status": "ok"
  }
}
```

**Error response:**
```json
{
  "detail": "Error message here"
}
```

---

## 🔍 Monitoring

**Check server logs:**
```
INFO - Using provider groq (cascade)
INFO - Fusion successful (fusion:groq+openrouter) in 2.34s
WARNING - Provider groq rate limit exceeded
INFO - document.pdf -> 15 chunks
```

**Check database:**
```powershell
python -c "import sqlite3; print(sqlite3.connect('conversation_history.db').execute('SELECT COUNT(*) FROM conversations').fetchone())"
```

**Check FAISS index:**
```powershell
Test-Path faiss_index  # Should return True if docs loaded
```

---

## 🎓 Next Steps

1. ✅ Test all endpoints manually
2. ✅ Configure provider priority
3. 🔄 Integrate Streamlit with API
4. 📊 Add admin dashboard
5. 🔐 Add authentication
6. 🚀 Deploy to production

---

**Full documentation:** See `FASTAPI_SETUP_GUIDE.md`

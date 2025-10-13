# 🤖 AI Documind - RAG System (Production Ready)

Advanced Retrieval-Augmented Generation system with FastAPI backend, Streamlit frontend, and SQLAlchemy ORM.

## 🚀 Quick Start

### **Option 1: Unified Launcher (Recommended)**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.template .env
# Edit .env with your API keys

# 3. Run everything with one command
python main.py
```

This will start:
- ✅ FastAPI backend at `http://localhost:8000`
- ✅ Streamlit frontend at `http://localhost:8501`
- ✅ API documentation at `http://localhost:8000/docs`

### **Option 2: Manual Launch**

```bash
# Terminal 1: Start backend
uvicorn backend.api:app --reload --port 8000

# Terminal 2: Start frontend
streamlit run app.py --server.port 8501
```

---

## 📁 Project Structure

```
RAG/
├── main.py                    # 🚀 Unified launcher (starts backend + frontend)
├── app.py                     # 📱 Streamlit frontend (direct RAG mode)
├── requirements.txt           # 📦 Python dependencies
├── .env                       # 🔐 Configuration (API keys, settings)
│
├── backend/                   # 🔧 Backend services
│   ├── api.py                # FastAPI REST API endpoints
│   ├── rag_engine.py         # RAG core logic (LangChain + FAISS)
│   ├── llm_provider.py       # Multi-provider LLM orchestration
│   ├── doc_loader.py         # Document processing (PDF/DOCX/PPTX/TXT)
│   ├── config.py             # Configuration management
│   ├── models.py             # SQLAlchemy ORM models
│   └── history_db.py         # Legacy SQL (kept for compatibility)
│
├── frontend/                  # 🎨 Frontend applications
│   ├── app_api.py            # Streamlit API client (calls backend via HTTP)
│   └── admin.py              # Admin dashboard (analytics & monitoring)
│
├── faiss_index/              # 💾 Vector database storage
├── conversation_history.db    # 🗄️ SQLite database
└── docs/                      # 📚 Documentation
    ├── FASTAPI_SETUP_GUIDE.md
    ├── PHASE2_ANALYSIS.md
    └── ...
```

---

## 🛠️ Available Applications

### 1. **Main Frontend** (`app.py`)
- Direct RAG mode (no API calls)
- Document upload & indexing
- Conversational Q&A
- Source citations

**Run:** `streamlit run app.py`

### 2. **API Client Frontend** (`frontend/app_api.py`)
- Uses FastAPI backend via HTTP
- Enables frontend/backend separation
- Production-ready architecture

**Run:** `streamlit run frontend/app_api.py`

### 3. **Admin Dashboard** (`frontend/admin.py`)
- 📊 Analytics & statistics
- 📜 Conversation history browser
- 🔍 Search & filter conversations
- 📥 Export to CSV/JSON
- ⚡ Performance metrics

**Run:** `streamlit run frontend/admin.py`

### 4. **FastAPI Backend** (`backend/api.py`)
- RESTful API endpoints
- Swagger docs at `/docs`
- SQLAlchemy ORM integration

**Run:** `uvicorn backend.api:app --reload`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload & index documents |
| `POST` | `/ask` | Ask questions |
| `GET` | `/history` | Get conversation history (with filters) |
| `POST` | `/clear` | Clear all data |
| `POST` | `/init` | Initialize database |
| `GET` | `/stats` | Get analytics statistics |
| `GET` | `/search?q=term` | Search conversations |

**Full API docs:** `http://localhost:8000/docs`

---

## ⚙️ Configuration (`.env`)

```bash
# LLM Provider API Keys
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
OPENAI_API_KEY=your_openai_key

# Provider Priority (comma-separated)
PROVIDER_PRIORITY=groq,openrouter,openai

# Embedding Model
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Vector Database
FAISS_PERSIST_DIR=faiss_index
PERSIST_FAISS=true

# Database
HISTORY_DB_PATH=conversation_history.db

# Chunking
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Retrieval
TOP_K=4

# API
API_BASE_URL=http://localhost:8000
```

---

## 📋 Implementation Status

### ✅ **Phase 1: Backend Core** (COMPLETE)
- Multi-provider LLM support (Groq/OpenRouter/OpenAI)
- FAISS vector database with persistence
- Document processing (PDF/DOCX/PPTX/TXT)
- Configurable chunking & retrieval
- Error handling & fallbacks

### ✅ **Phase 2: Production Features** (COMPLETE)

#### **Option A: API Client Architecture** ✅
- FastAPI REST backend
- Streamlit API client (`frontend/app_api.py`)
- Frontend/backend separation
- **Files:** `backend/api.py`, `frontend/app_api.py`

#### **Option B: SQLAlchemy ORM** ✅
- Database models with SQLAlchemy
- Advanced querying (filters, pagination, search)
- Statistics & analytics
- **Files:** `backend/models.py` (replaces `history_db.py`)

#### **Option C: Admin Dashboard** ✅
- Analytics dashboard with charts
- Conversation history browser
- Search & filter capabilities
- CSV/JSON export
- Performance metrics
- **Files:** `frontend/admin.py`

### 🎯 **Additional Features**
- **Unified Launcher:** `main.py` starts both backend & frontend
- **Health checks:** `/health` endpoint
- **CORS middleware:** Configured for local dev
- **Logging:** Structured logging throughout

---

## 🧪 Testing

### 1. **Test Backend API**

```bash
# Start backend
uvicorn backend.api:app --reload

# Test health
curl http://localhost:8000/health

# Upload document
curl -X POST http://localhost:8000/upload \
  -F "files=@document.pdf"

# Ask question
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'

# Get history
curl http://localhost:8000/history?limit=10

# Get stats
curl http://localhost:8000/stats

# Search
curl "http://localhost:8000/search?q=topic&limit=20"
```

### 2. **Test Frontend Apps**

```bash
# Test main app
streamlit run app.py

# Test API client
streamlit run frontend/app_api.py

# Test admin dashboard
streamlit run frontend/admin.py
```

### 3. **Test Unified Launcher**

```bash
python main.py
# Opens both backend (8000) and frontend (8501)
```

---

## 📊 Database Schema (SQLAlchemy)

```python
class Conversation(Base):
    id: int (PK, autoincrement)
    timestamp: datetime (indexed)
    question: text
    answer: text
    sources: text (JSON)
    provider: varchar(50) (indexed)
    duration_s: float
    status: varchar(20) (indexed)
```

**Features:**
- Automatic timestamps
- JSON source storage
- Indexed fields for fast queries
- Pagination support
- Filter by provider/status
- Full-text search

---

## 🔧 Advanced Usage

### **Custom Provider Priority**

```bash
# Set in .env
PROVIDER_PRIORITY=openai,groq,openrouter

# Or use environment variable
export PROVIDER_PRIORITY=groq,openai
```

### **Database Queries (ORM)**

```python
from backend.models import list_conversations, get_conversation_stats

# Get last 50 conversations from Groq
history = list_conversations(limit=50, provider="groq")

# Get statistics
stats = get_conversation_stats()
# Returns: {total, providers: {groq: {count, avg_duration}}, statuses: {...}}

# Search
results = search_conversations("topic", limit=20)
```

### **Direct RAG Usage**

```python
from backend.rag_engine import ConversationalRAG

rag = ConversationalRAG()
rag.add_documents(["document.pdf"])
result = rag.ask("What is this about?")

print(result["answer"])
print(result["sources"])  # [{source, page, score}, ...]
print(result["meta"])     # {provider, duration_s, timestamp}
```

---

## 🚀 Deployment

### **Development**
```bash
python main.py
```

### **Production**

```bash
# Backend (with multiple workers)
uvicorn backend.api:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (headless mode)
streamlit run frontend/app_api.py --server.port 8501 --server.headless true

# Admin Dashboard (internal only)
streamlit run frontend/admin.py --server.port 8502 --server.headless true
```

### **Docker** (TODO)

```dockerfile
# Dockerfile example
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **API won't start** | Check ports (8000) not in use: `netstat -ano | findstr :8000` |
| **Frontend can't connect** | Ensure backend running & `API_BASE_URL` in .env correct |
| **No LLM response** | Verify API keys in `.env` |
| **Database errors** | Delete `conversation_history.db` and restart |
| **FAISS errors** | Delete `faiss_index/` folder |
| **Import errors** | `pip install -r requirements.txt` |

---

## 📚 Documentation

- **Setup Guide:** `FASTAPI_SETUP_GUIDE.md`
- **Quick Reference:** `FASTAPI_QUICK_REFERENCE.md`
- **Phase 2 Analysis:** `PHASE2_ANALYSIS.md`
- **API Docs:** `http://localhost:8000/docs` (when running)

---

## 🎯 Next Steps

1. ✅ **Test Everything:** Run `python main.py` and verify all components
2. 🔧 **Configure .env:** Add your API keys and adjust settings
3. 📊 **Explore Admin Dashboard:** View analytics at `http://localhost:8502`
4. 🚀 **Production Deploy:** Use uvicorn with workers + reverse proxy (nginx)
5. 🐳 **Dockerize:** Create Docker Compose setup for easy deployment

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📧 Support

- **Issues:** Open GitHub issue
- **Documentation:** See `docs/` folder
- **API Docs:** `http://localhost:8000/docs`

---

**Built with ❤️ using FastAPI, LangChain, FAISS, and Streamlit**

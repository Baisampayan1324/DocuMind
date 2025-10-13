# 🎯 Visual System Overview

## 🏗️ System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          USER INTERFACES                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐      │
│  │   app.py    │  │ app_api.py   │  │    admin.py        │      │
│  │  (Direct)   │  │ (API Client) │  │   (Dashboard)      │      │
│  │  Port 8501  │  │  Port 8501   │  │   Port 8502        │      │
│  └──────┬──────┘  └──────┬───────┘  └──────┬─────────────┘      │
│         │                │                  │                    │
│         │                │                  │                    │
│         │         HTTP   │           HTTP   │                    │
│         │         REST   │           REST   │                    │
│         │                │                  │                    │
└─────────┼────────────────┼──────────────────┼────────────────────┘
          │                │                  │
          │                ▼                  │
          │     ┌──────────────────────┐     │
          │     │   FastAPI Backend    │     │
          │     │   (backend/api.py)   │     │
          │     │     Port 8000        │     │
          │     │                      │     │
          │     │  8 REST Endpoints:   │     │
          │     │  • /health           │     │
          │     │  • /upload           │     │
          │     │  • /ask              │     │
          │     │  • /history          │     │
          │     │  • /stats            │     │
          │     │  • /search           │     │
          │     │  • /clear            │     │
          │     │  • /init             │     │
          │     └──────────┬───────────┘     │
          │                │                  │
          ▼                ▼                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│              ┌────────────────────────────────┐                  │
│              │   ConversationalRAG Engine     │                  │
│              │    (rag_engine.py)             │                  │
│              └────────┬───────────────────────┘                  │
│                       │                                          │
│       ┌───────────────┼────────────────┐                        │
│       │               │                │                        │
│       ▼               ▼                ▼                        │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐                │
│  │   LLM    │  │  Document  │  │   FAISS     │                │
│  │ Provider │  │   Loader   │  │  Retriever  │                │
│  │          │  │            │  │             │                │
│  │ • Groq   │  │ • PDF      │  │ • Vector    │                │
│  │ • OR     │  │ • DOCX     │  │   Search    │                │
│  │ • OpenAI │  │ • PPTX     │  │ • Top-K     │                │
│  │          │  │ • TXT      │  │             │                │
│  └──────────┘  └────────────┘  └─────────────┘                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  SQLite + ORM    │  │ FAISS Index  │  │   Temp Files     │  │
│  │                  │  │              │  │                  │  │
│  │ • Conversations  │  │ • Vectors    │  │ • temp_*.pdf     │  │
│  │ • Timestamps     │  │ • Metadata   │  │ • temp_*.docx    │  │
│  │ • Sources (JSON) │  │ • Persist    │  │ • temp_*.txt     │  │
│  │ • Provider       │  │              │  │                  │  │
│  │ • Duration       │  │              │  │                  │  │
│  │ • Status         │  │              │  │                  │  │
│  │                  │  │              │  │                  │  │
│  │ SQLAlchemy ORM   │  │ faiss_index/ │  │ Temp directory   │  │
│  │ models.py        │  │              │  │                  │  │
│  └──────────────────┘  └──────────────┘  └──────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Modes

### **Mode 1: Unified Development (Recommended)**

```
┌─────────────────────────────────────────┐
│         python main.py                  │
│                                         │
│  Starts both:                           │
│  ┌─────────────────────────────────┐   │
│  │  FastAPI Backend (8000)         │   │
│  │  Streamlit Frontend (8501)      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  One command, everything runs!          │
└─────────────────────────────────────────┘
```

### **Mode 2: Production Architecture**

```
┌──────────────────────────────────────────────┐
│  Terminal 1:                                 │
│  uvicorn backend.api:app --workers 4        │
│  (Backend only, scalable)                   │
└──────────────────────────────────────────────┘
                    ▲
                    │ HTTP REST
                    │
┌──────────────────────────────────────────────┐
│  Terminal 2:                                 │
│  streamlit run frontend/app_api.py          │
│  (Frontend only, uses API)                  │
└──────────────────────────────────────────────┘
                    ▲
                    │
                    │
┌──────────────────────────────────────────────┐
│  Terminal 3 (Optional):                      │
│  streamlit run frontend/admin.py            │
│  (Analytics dashboard)                       │
└──────────────────────────────────────────────┘
```

### **Mode 3: Direct RAG (Quick Testing)**

```
┌─────────────────────────────────────────┐
│    streamlit run app.py                 │
│                                         │
│  Single process:                        │
│  • No backend needed                    │
│  • Direct RAG instantiation             │
│  • Fastest startup                      │
│  • Good for quick tests                 │
└─────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### **Document Upload Flow**

```
User                Frontend              API                 RAG Engine          FAISS
 │                     │                   │                      │                │
 │  Upload PDF        │                   │                      │                │
 ├───────────────────>│                   │                      │                │
 │                    │  POST /upload     │                      │                │
 │                    ├──────────────────>│                      │                │
 │                    │                   │  add_documents()     │                │
 │                    │                   ├─────────────────────>│                │
 │                    │                   │                      │  Load PDF      │
 │                    │                   │                      ├───────────┐    │
 │                    │                   │                      │           │    │
 │                    │                   │                      │<──────────┘    │
 │                    │                   │                      │  Chunk text    │
 │                    │                   │                      ├───────────┐    │
 │                    │                   │                      │           │    │
 │                    │                   │                      │<──────────┘    │
 │                    │                   │                      │  Embed chunks  │
 │                    │                   │                      ├───────────┐    │
 │                    │                   │                      │           │    │
 │                    │                   │                      │<──────────┘    │
 │                    │                   │                      │  Store vectors │
 │                    │                   │                      ├───────────────>│
 │                    │                   │                      │                │
 │                    │                   │     Success          │                │
 │                    │                   │<─────────────────────┤                │
 │                    │   Response        │                      │                │
 │                    │<──────────────────┤                      │                │
 │   Success message  │                   │                      │                │
 │<───────────────────┤                   │                      │                │
```

### **Question Answering Flow**

```
User              Frontend         API              RAG           LLM        FAISS      DB(ORM)
 │                   │              │                │             │           │           │
 │  "What is...?"   │              │                │             │           │           │
 ├─────────────────>│              │                │             │           │           │
 │                  │ POST /ask    │                │             │           │           │
 │                  ├─────────────>│                │             │           │           │
 │                  │              │  ask()         │             │           │           │
 │                  │              ├───────────────>│             │           │           │
 │                  │              │                │  Embed Q    │           │           │
 │                  │              │                ├────────┐    │           │           │
 │                  │              │                │        │    │           │           │
 │                  │              │                │<───────┘    │           │           │
 │                  │              │                │  Search     │           │           │
 │                  │              │                ├─────────────────────────>│           │
 │                  │              │                │             │   Top-K   │           │
 │                  │              │                │<─────────────────────────┤           │
 │                  │              │                │  Build prompt            │           │
 │                  │              │                ├────────┐    │           │           │
 │                  │              │                │        │    │           │           │
 │                  │              │                │<───────┘    │           │           │
 │                  │              │                │  Call LLM   │           │           │
 │                  │              │                ├────────────>│           │           │
 │                  │              │                │   Answer    │           │           │
 │                  │              │                │<────────────┤           │           │
 │                  │              │                │             │           │           │
 │                  │              │  {answer,      │             │           │           │
 │                  │              │   sources,     │             │           │           │
 │                  │              │   meta}        │             │           │           │
 │                  │              │<───────────────┤             │           │           │
 │                  │              │                │             │           │           │
 │                  │              │  save_conversation()         │           │           │
 │                  │              ├─────────────────────────────────────────────────────>│
 │                  │              │                │             │           │  Insert   │
 │                  │              │<─────────────────────────────────────────────────────┤
 │                  │  Response    │                │             │           │           │
 │                  │<─────────────┤                │             │           │           │
 │  Display answer  │              │                │             │           │           │
 │<─────────────────┤              │                │             │           │           │
```

---

## 🎯 Component Interaction Matrix

| Component | Calls → | Called By ← | Data Flow |
|-----------|---------|-------------|-----------|
| **Frontend (app.py)** | RAG Engine | User | Direct instantiation |
| **Frontend (app_api.py)** | Backend API | User | HTTP requests |
| **Frontend (admin.py)** | Backend API | User | HTTP GET (read-only) |
| **Backend API** | RAG Engine, ORM | Frontends | REST endpoints |
| **RAG Engine** | LLM Provider, Doc Loader, FAISS | API, Direct | Orchestration |
| **LLM Provider** | Groq/OR/OpenAI APIs | RAG Engine | Provider priority |
| **Doc Loader** | PyPDF2, python-docx | RAG Engine | Document parsing |
| **FAISS** | - | RAG Engine | Vector storage |
| **ORM (models.py)** | SQLite | Backend API | Database operations |

---

## 📂 File Dependency Map

```
main.py
  └─> backend/api.py
  └─> frontend/app.py

backend/api.py
  ├─> backend/rag_engine.py
  ├─> backend/models.py (ORM)
  └─> backend/config.py

backend/rag_engine.py
  ├─> backend/llm_provider.py
  ├─> backend/doc_loader.py
  └─> backend/config.py

backend/models.py
  └─> backend/config.py

frontend/app.py
  └─> backend/rag_engine.py (direct import)

frontend/app_api.py
  └─> requests → backend/api.py (HTTP)

frontend/admin.py
  └─> requests → backend/api.py (HTTP)

backend/llm_provider.py
  └─> backend/config.py

backend/doc_loader.py
  └─> backend/config.py
```

---

## 🗄️ Database Schema (SQLAlchemy)

```sql
┌──────────────────────────────────────────────┐
│         TABLE: conversations                 │
├──────────────────────────────────────────────┤
│                                              │
│  id              INTEGER PRIMARY KEY         │
│                  AUTOINCREMENT               │
│                                              │
│  timestamp       DATETIME NOT NULL           │
│                  DEFAULT CURRENT_TIMESTAMP   │
│                  INDEX: idx_timestamp        │
│                                              │
│  question        TEXT NOT NULL               │
│                                              │
│  answer          TEXT NOT NULL               │
│                                              │
│  sources         TEXT (JSON)                 │
│                  Example: [                  │
│                    {                         │
│                      "source": "doc.pdf",    │
│                      "page": 3,              │
│                      "score": 0.85           │
│                    }                         │
│                  ]                           │
│                                              │
│  provider        VARCHAR(50)                 │
│                  VALUES: groq, openrouter,   │
│                          openai              │
│                  INDEX: idx_provider         │
│                                              │
│  duration_s      FLOAT                       │
│                  Response time in seconds    │
│                                              │
│  status          VARCHAR(20)                 │
│                  VALUES: success, error      │
│                  INDEX: idx_status           │
│                                              │
└──────────────────────────────────────────────┘

Indexes:
  • PRIMARY KEY on id
  • INDEX on timestamp (for chronological queries)
  • INDEX on provider (for filtering)
  • INDEX on status (for success rate)

Common Queries:
  • Recent conversations: ORDER BY timestamp DESC LIMIT N
  • By provider: WHERE provider = 'groq'
  • Success rate: WHERE status = 'success'
  • Search: WHERE question LIKE '%term%' OR answer LIKE '%term%'
  • Paginate: LIMIT N OFFSET M
```

---

## 🔄 Request/Response Examples

### **1. Upload Document**

**Request:**
```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data

files: document.pdf (binary)
```

**Response:**
```json
{
  "status": "ok",
  "files_processed": 1,
  "filenames": ["document.pdf"]
}
```

---

### **2. Ask Question**

**Request:**
```http
POST /ask HTTP/1.1
Content-Type: application/json

{
  "question": "What are the key findings?"
}
```

**Response:**
```json
{
  "answer": "The key findings are: 1) Performance improved by 30%...",
  "sources": [
    {
      "source": "document.pdf",
      "page": 5,
      "score": 0.87
    },
    {
      "source": "document.pdf",
      "page": 12,
      "score": 0.82
    }
  ],
  "meta": {
    "provider": "groq",
    "duration_s": 2.34,
    "timestamp": "2025-10-03T10:30:00Z",
    "status": "success"
  }
}
```

---

### **3. Get History (Filtered)**

**Request:**
```http
GET /history?limit=10&provider=groq&status=success HTTP/1.1
```

**Response:**
```json
[
  {
    "id": 42,
    "timestamp": "2025-10-03T10:30:00Z",
    "question": "What are the key findings?",
    "answer": "The key findings are...",
    "sources": [...],
    "provider": "groq",
    "duration_s": 2.34,
    "status": "success"
  },
  ...
]
```

---

### **4. Get Statistics**

**Request:**
```http
GET /stats HTTP/1.1
```

**Response:**
```json
{
  "total_conversations": 150,
  "providers": {
    "groq": {
      "count": 100,
      "avg_duration_s": 1.85
    },
    "openrouter": {
      "count": 30,
      "avg_duration_s": 3.12
    },
    "openai": {
      "count": 20,
      "avg_duration_s": 2.45
    }
  },
  "statuses": {
    "success": 145,
    "error": 5
  }
}
```

---

### **5. Search Conversations**

**Request:**
```http
GET /search?q=performance&limit=20 HTTP/1.1
```

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 42,
      "question": "What about performance improvements?",
      "answer": "Performance improved by 30%...",
      ...
    },
    ...
  ]
}
```

---

## 🎨 Frontend Screenshots (Text Representation)

### **Main Frontend (app.py)**

```
┌─────────────────────────────────────────────────────────┐
│                    AI Documind                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📄 Document Management                                 │
│  ┌────────────────────────┐                            │
│  │ 🔄 Reset Session       │                            │
│  └────────────────────────┘                            │
│                                                         │
│  Upload PDFs, DOCX, PPTX, or TXT                       │
│  [Drag & Drop or Browse]                               │
│                                                         │
│  ✅ Loaded 1 file(s)                                    │
│  📄 document.pdf                                        │
│                                                         │
│  ┌────────────────────────┐                            │
│  │ 🗑️ Clear All Documents │                            │
│  └────────────────────────┘                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 User: What are the key findings?                    │
│                                                         │
│  🤖 Assistant: The key findings are:                    │
│     1. Performance improved by 30%                      │
│     2. Cost reduced by 25%                             │
│     3. User satisfaction up 40%                        │
│                                                         │
│     📚 Sources:                                         │
│     - document.pdf (Page 5, Score: 0.87)              │
│     - document.pdf (Page 12, Score: 0.82)             │
│                                                         │
│     🤖 groq | ⏱️ 2.34s                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Ask a question about your documents...                │
│  [Type here...]                                        │
└─────────────────────────────────────────────────────────┘
```

---

### **Admin Dashboard (frontend/admin.py)**

```
┌─────────────────────────────────────────────────────────┐
│            📊 RAG System Admin Dashboard                │
│            Connected to: http://localhost:8000          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ API Connected      [🔄 Refresh]  [🗑️ Clear All]     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                      📈 Overview                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Total Conversations    Avg Response    Success   Active│
│        150                 2.1s          96.7%     7    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [📅 Timeline] [🤖 Providers] [⚡ Performance] [📋 Details]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Conversations Over Time                                │
│  ▂▃▅▇▇▆▄▃▂  (Line chart)                               │
│                                                         │
│  Activity by Hour of Day                                │
│  ▁▁▂▃▅▇█▇▅▃▂▁  (Bar chart)                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    📥 Data Export                       │
├─────────────────────────────────────────────────────────┤
│  [📊 Export to CSV]    [📋 Export to JSON]              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Flow

```
.env.template
    │
    ├─ Copy to .env
    │
    ▼
.env file
    │
    ├─ Loaded by python-dotenv
    │
    ▼
backend/config.py
    │
    ├─ Config class with defaults
    │
    ├─> PROVIDER_PRIORITY parsing
    │   (comma-separated → list)
    │
    ├─> All components read Config
    │
    ▼
┌────────────────────────────────────┐
│  Runtime Configuration             │
│                                    │
│  • LLM Provider priority order     │
│  • Database path                   │
│  • FAISS persistence settings      │
│  • Chunking parameters             │
│  • API base URL                    │
└────────────────────────────────────┘
```

---

## 🎯 Summary

This visual guide shows:

1. **Architecture** - How components interact
2. **Data Flow** - How information moves through the system
3. **Database Schema** - How conversations are stored
4. **Deployment Modes** - Different ways to run the system
5. **API Examples** - Request/response formats
6. **Frontend Layouts** - What users see
7. **Configuration** - How settings are managed

**Use this as a reference when:**
- Understanding how the system works
- Debugging issues
- Planning new features
- Explaining to team members
- Designing integrations

**🚀 Start with `python main.py` and explore!**

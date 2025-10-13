# DocuMind — AI RAG Chat System

> **Enterprise-grade Retrieval-Augmented Generation (RAG) system** with multi-LLM support, FastAPI backend, and Streamlit frontend

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)](https://streamlit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Development](#-development)

---

## 🌟 Overview

**AI Documind** is a production-ready **Retrieval-Augmented Generation (RAG)** system that allows you to **chat with your documents** using AI. Upload PDFs, Word documents, PowerPoint presentations, or text files, and ask questions - the AI will answer based on your documents with **source citations**.

### What Makes This Special?

- ✅ **Multi-LLM Support** - Works with Groq, OpenRouter, and OpenAI with automatic fallback
- ✅ **Production-Ready** - FastAPI backend with REST API, perfect for scaling
- ✅ **Smart Document Processing** - Handles PDF, DOCX, PPTX, TXT with intelligent chunking
- ✅ **Vector Search** - FAISS-powered semantic search for accurate retrieval
- ✅ **Source Citations** - Every answer includes references to source documents
- ✅ **Analytics Dashboard** - Track conversations, provider usage, and trends
- ✅ **Persistent Storage** - SQLite database for conversation history
- ✅ **React-Ready** - Backend API works with any frontend (Streamlit → React migration ready)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- At least ONE API key (Groq, OpenRouter, or OpenAI)
- 4GB RAM minimum (for embeddings)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd AI-Documind

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys
cp .env.template .env
# Edit .env and add your API key(s)
```

### Configuration (.env file)

```env
# At least ONE API key required
GROQ_API_KEY=gsk_xxxxxxxxxxxxx              # Recommended (free, fast)
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx      # Alternative
OPENAI_API_KEY=sk-xxxxxxxxxxxxx             # Fallback

# Optional: Persist vector store
PERSIST_FAISS=true

# Optional: Provider priority
PROVIDER_PRIORITY=groq,openrouter,openai
```

### Run the Application

```bash
python main.py
```

That's it! The application will:
1. ✅ Start FastAPI backend on port 8000
2. ✅ Start Streamlit frontend on port 8501  
3. ✅ Open your browser automatically

**Access**: http://localhost:8501

---

## ✨ Features

### Core Capabilities

#### 🤖 Multi-LLM Support
- **Groq** - Lightning-fast inference with Llama models (FREE)
- **OpenRouter** - Access to 100+ models via unified API
- **OpenAI** - GPT-4, GPT-3.5 for high-quality responses
- **Automatic Fallback** - If one provider fails, automatically uses the next

#### 📄 Document Processing
- **PDF** - Extract text from any PDF file
- **DOCX** - Microsoft Word documents
- **PPTX** - PowerPoint presentations  
- **TXT** - Plain text files
- **Smart Chunking** - Splits documents into optimal chunks (1000 chars, 200 overlap)
- **Metadata Preservation** - Tracks source file and chunk IDs

#### 🔍 Advanced Retrieval
- **FAISS Vector Store** - Fast, efficient semantic search
- **HuggingFace Embeddings** - `all-MiniLM-L6-v2` model
- **Top-K Retrieval** - Returns 4 most relevant chunks by default
- **Persistent Storage** - Optional FAISS index saving

#### 💬 Intelligent Q&A
- **Context-Aware** - Uses retrieved chunks to answer questions
- **Source Citations** - Every answer includes document references
- **Streaming Support** - Real-time response streaming (future feature)
- **Conversation History** - Track all interactions

#### 📊 Analytics Dashboard
- **Conversation History** - View all past Q&A pairs
- **Provider Statistics** - See which LLMs are used most
- **Model Distribution** - Charts showing model usage
- **Search & Filter** - Find specific conversations
- **CSV Export** - Download conversation data

---

## 🏗️ Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────┐
│                        User Interface                          │
│                  Streamlit (Port 8501)                         │
│                                                                │
│  ┌──────────────┐              ┌──────────────┐              │
│  │   Main App   │              │    Admin     │              │
│  │  (Q&A Chat)  │              │  (Analytics) │              │
│  └──────┬───────┘              └──────┬───────┘              │
└─────────┼──────────────────────────────┼──────────────────────┘
          │                              │
          │  HTTP REST API               │  HTTP REST API
          ▼                              ▼
┌───────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                            │
│                     (Port 8000)                                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Endpoints (/upload, /ask, /history, /stats, etc) │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │                                           │
│                   ▼                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              RAG Engine (rag_engine.py)                 │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Document   │  │     FAISS    │  │     LLM      │ │  │
│  │  │    Loader    │─▶│  VectorStore │─▶│   Provider   │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Data Storage                          │  │
│  │                                                          │  │
│  │  ┌──────────────┐              ┌──────────────┐        │  │
│  │  │conversation_ │              │  faiss_index │        │  │
│  │  │  history.db  │              │      /       │        │  │
│  │  │  (SQLite)    │              │  (Vectors)   │        │  │
│  │  └──────────────┘              └──────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘

```

### Data Flow

```
┌─────────────┐
│   Document  │
│   Upload    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  1. Document Loader  │  ◄── Extracts text from PDF/DOCX/PPTX/TXT
│     (doc_loader.py)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  2. Text Cleaning    │  ◄── Removes extra whitespace, fixes formatting
│     (UniversalDoc    │
│      Loader)         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  3. Text Chunking    │  ◄── Splits into 1000-char chunks (200 overlap)
│     (Recursive       │
│      Splitter)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  4. Generate         │  ◄── HuggingFace all-MiniLM-L6-v2
│     Embeddings       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  5. Store in FAISS   │  ◄── Vector database for semantic search
│     (faiss_index/)   │
└──────────────────────┘
```

```
┌─────────────┐
│   Question  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  1. Embed Question   │  ◄── Convert question to vector
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  2. Search FAISS     │  ◄── Find Top 4 similar chunks
│     (Similarity)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  3. Build Prompt     │  ◄── Combine question + context
│     (with Context)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  4. Call LLM         │  ◄── Groq → OpenRouter → OpenAI
│     (Multi-Provider) │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  5. Parse Response   │  ◄── Extract answer + sources
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  6. Save to DB       │  ◄── conversation_history.db
│     (SQLite)         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  7. Return to User   │  ◄── Answer + Source Citations
└──────────────────────┘
```

---

## 📁 Project Structure

```
AI-Documind/
├── 🚀 main.py                    # Unified launcher - RUN THIS!
├── 📦 requirements.txt           # All Python dependencies
├── 🔐 .env                       # API keys (create from template)
├── 🔐 .env.template              # Template for .env file
├── 📋 .gitignore                 # Git ignore rules
│
├── ⚙️  backend/                  # FastAPI Backend
│   ├── 📄 README.md              # ← DETAILED BACKEND DOCS
│   ├── 🔌 api.py                 # REST API endpoints (8 routes)
│   ├── 🧠 rag_engine.py          # Core RAG pipeline orchestration
│   ├── 🤖 llm_provider.py        # Multi-LLM manager (Groq/OR/OAI)
│   ├── 📖 doc_loader.py          # Universal document processor
│   ├── 💾 history_db.py          # SQLite conversation storage
│   ├── ⚙️  config.py              # Central configuration (.env loader)
│   ├── 🗃️  models.py              # SQLAlchemy ORM models
│   ├── � requirements.txt       # Backend-specific dependencies
│   │
│   └── 💾 data/                  # Runtime data (auto-generated)
│       ├── conversation_history.db  # SQLite database
│       └── faiss_index/             # Vector embeddings
│           ├── index.faiss
│           └── index.pkl
│
├── �🖥️  frontend/                 # Streamlit Frontend
│   ├── 📄 README.md              # ← DETAILED FRONTEND DOCS
│   ├── 💬 app_api.py             # Main UI (Q&A chat interface)
│   └── 📊 admin.py               # Admin dashboard (analytics)
│
├── 📚 docs/                      # Documentation
│   ├── 🚀 QUICK_START.md         # Quick setup guide
│   ├── 🏗️  ARCHITECTURE.md        # System architecture details
│   ├── 🔌 FASTAPI_QUICK_REFERENCE.md  # API endpoints reference
│   ├── 🚢 DEPLOYMENT.md          # Production deployment guide
│   └── � FASTAPI_SETUP_GUIDE.md # FastAPI setup details
│
└── 📦 archive/                   # Historical files (optional)
    ├── deprecated/               # Old code (not used)
    ├── phase2_planning/          # Planning documents
    ├── implementation/           # Implementation notes
    ├── fixes/                    # Bug fix documentation
    └── test/                     # Test utilities
```

### Key Files Explained

| File | Purpose | When to Use |
|------|---------|-------------|
| `main.py` | **Unified launcher** - Starts both backend + frontend | **Run this to start everything** |
| `backend/README.md` | **Detailed backend architecture** - How RAG works, data flow, API details | **Read this to understand backend** |
| `frontend/README.md` | **Detailed frontend architecture** - UI components, API integration | **Read this to understand frontend** |
| `backend/config.py` | **Configuration manager** - Loads .env, validates settings | **Modify to change defaults** |
| `backend/data/conversation_history.db` | **SQLite database** - All conversation history | **Query this for analytics** |
| `backend/data/faiss_index/` | **Vector database** - Document embeddings | **Delete to reindex documents** |
| `.env` | **Sensitive config** - API keys, secrets | **Create from .env.template** |

---

## 🔍 How It Works

### 1. Document Upload Process

**User Perspective:**
1. Upload PDF/DOCX/PPTX/TXT files via Streamlit UI
2. Click "Upload Documents"
3. See success message with file count

**Behind the Scenes:**

```python
# 1. Frontend sends files to backend
POST http://localhost:8000/upload
Content-Type: multipart/form-data
files: [file1.pdf, file2.docx]

# 2. Backend processes each file
for file in uploaded_files:
    # a. Save to temp folder
    temp_path = save_temp_file(file)
    
    # b. Load document (detect format, extract text)
    text = UniversalDocLoader.load_document(temp_path)
    
    # c. Clean text (remove extra spaces, fix line breaks)
    clean_text = UniversalDocLoader.clean_text(text)
    
    # d. Chunk text (1000 chars, 200 overlap)
    chunks = UniversalDocLoader.chunk_text(clean_text, metadata={"source": file.name})
    
    # e. Generate embeddings (HuggingFace model)
    embeddings = HuggingFaceEmbeddings("all-MiniLM-L6-v2")
    vectors = embeddings.embed_documents([chunk.page_content for chunk in chunks])
    
    # f. Store in FAISS vector database
    vectorstore.add_documents(chunks)
    
    # g. Save FAISS index to disk (if PERSIST_FAISS=true)
    vectorstore.save_local("backend/data/faiss_index")
    
    # h. Delete temp file
    os.remove(temp_path)

# 3. Return success response
{"status": "success", "files_processed": ["file1.pdf", "file2.docx"]}
```

**Why Chunking?**
- LLMs have token limits (can't process entire documents)
- Smaller chunks = more precise retrieval
- Overlap ensures context isn't lost at chunk boundaries

### 2. Question-Answer Process

**User Perspective:**
1. Type question in chat input
2. Press Enter
3. See AI answer with source citations

**Behind the Scenes:**

```python
# 1. Frontend sends question to backend
POST http://localhost:8000/ask
{
    "question": "What is the main topic of the document?",
    "provider": "groq"  # optional
}

# 2. Backend RAG pipeline
def query_async(question):
    # a. Embed the question
    question_vector = embeddings.embed_query(question)
    
    # b. Search FAISS for similar chunks (Top 4)
    similar_chunks = vectorstore.similarity_search(question, k=4)
    
    # c. Build prompt with context
    context = "\n\n".join([chunk.page_content for chunk in similar_chunks])
    prompt = f"""Based on the following context, answer the question.
    
Context:
{context}

Question: {question}

Answer:"""
    
    # d. Call LLM (try Groq, fallback to OpenRouter, then OpenAI)
    try:
        llm = llm_provider.get_llm("groq")
        response = llm.invoke(prompt)
    except:
        try:
            llm = llm_provider.get_llm("openrouter")
            response = llm.invoke(prompt)
        except:
            llm = llm_provider.get_llm("openai")
            response = llm.invoke(prompt)
    
    # e. Extract sources from chunks
    sources = [
        {
            "source": chunk.metadata["source"],
            "chunk_id": chunk.metadata["chunk_id"],
            "content": chunk.page_content[:200]  # First 200 chars
        }
        for chunk in similar_chunks
    ]
    
    # f. Save to database
    history_db.save_conversation(
        question=question,
        answer=response.content,
        sources=sources,
        provider_used="groq",
        model_used="llama-3.1-8b-instant"
    )
    
    # g. Return response
    return {
        "answer": response.content,
        "sources": sources,
        "provider_used": "groq",
        "model_used": "llama-3.1-8b-instant"
    }

# 3. Frontend displays answer with sources
```

**Why Multi-LLM?**
- **Reliability**: If one provider is down, others work
- **Cost Optimization**: Use free Groq first, paid OpenAI as fallback
- **Flexibility**: Easy to switch providers without code changes

### 3. Database Storage

**Why SQLite?**
- ✅ **No separate database server** - Embedded in application
- ✅ **ACID compliant** - Transactional integrity
- ✅ **Easy to query** - Standard SQL
- ✅ **Perfect for analytics** - Admin dashboard queries this
- ✅ **Portable** - Single file, easy to backup

**Schema:**
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources TEXT,           -- JSON array
    provider_used TEXT,
    model_used TEXT
);
```

**Location:** `backend/data/conversation_history.db`

**Queried By:** Admin dashboard for analytics

---

## 🔧 Configuration

### Environment Variables (.env)

Create `.env` file from template:
```bash
cp .env.template .env
```

**Required Settings:**
```env
# API Keys - At least ONE required
GROQ_API_KEY=gsk_xxxxxxxxxxxxx              # Get from https://console.groq.com
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx      # Get from https://openrouter.ai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx             # Get from https://platform.openai.com
```

**Optional Settings:**
```env
# Model Selection (defaults shown)
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_MODEL=meta-llama/llama-3.3-8b-instruct:free
OPENAI_MODEL=gpt-4o-mini

# Chunking Parameters
CHUNK_SIZE=1000          # Characters per chunk
CHUNK_OVERLAP=200        # Overlap between chunks

# Retrieval
TOP_K_CHUNKS=4           # Number of chunks to retrieve

# Embedding Model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Storage Paths
FAISS_PERSIST_DIR=data/faiss_index
HISTORY_DB_PATH=data/conversation_history.db

# Persistence
PERSIST_FAISS=true       # Save FAISS index to disk

# Provider Priority (fallback order)
PROVIDER_PRIORITY=groq,openrouter,openai
```

### API Keys - How to Get Them

#### Groq (Recommended - FREE & FAST)
1. Visit https://console.groq.com
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy key to `.env` as `GROQ_API_KEY`

**Why Groq?**
- ✅ FREE (no credit card required)
- ✅ FAST (optimized inference)
- ✅ Good quality (Llama 3.1)

#### OpenRouter (Alternative - FREE tier available)
1. Visit https://openrouter.ai
2. Sign up for account
3. Go to Keys section
4. Create new API key
5. Copy key to `.env` as `OPENROUTER_API_KEY`

**Why OpenRouter?**
- ✅ Access to 100+ models
- ✅ FREE tier available
- ✅ Pay only for what you use

#### OpenAI (Fallback - PAID)
1. Visit https://platform.openai.com
2. Sign up for account
3. Add payment method
4. Go to API Keys
5. Create new secret key
6. Copy key to `.env` as `OPENAI_API_KEY`

**When to use OpenAI?**
- Need highest quality responses
- Have existing OpenAI credits
- Primary providers are down

---

## 🎮 Usage

### Method 1: Unified Launcher (Recommended)

```bash
python main.py
```

**What happens:**
1. ✅ Checks dependencies
2. ✅ Validates .env file exists
3. ✅ Starts FastAPI backend (port 8000)
4. ✅ Waits for backend initialization
5. ✅ Starts Streamlit frontend (port 8501)
6. ✅ Opens browser automatically

**Access:**
- Main UI: http://localhost:8501
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Method 2: Manual Start (Advanced)

**Terminal 1 - Backend:**
```bash
uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
streamlit run frontend/app_api.py --server.port 8501
```

**Terminal 3 - Admin Dashboard (Optional):**
```bash
streamlit run frontend/admin.py --server.port 8502
```

### Using the Main UI

**1. Upload Documents**
- Click "Browse files" in sidebar
- Select PDF, DOCX, PPTX, or TXT files
- Can upload multiple files at once
- Click "Upload Documents"
- Wait for success message

**2. Ask Questions**
- Type question in chat input at bottom
- Press Enter or click send
- Wait for AI response
- View answer with source citations

**3. View Sources**
- Click on "📄 Sources" expander
- See which documents were used
- View exact text excerpts
- Check chunk IDs for traceability

**4. Clear History**
- Click "🗑️ Clear History" in sidebar
- Confirms before clearing
- Clears chat UI and backend history

### Using the Admin Dashboard

```bash
streamlit run frontend/admin.py --server.port 8502
```

**Access:** http://localhost:8502

**Features:**
- ✅ **Conversation History Table** - All Q&A pairs with timestamps
- ✅ **Provider Statistics** - Pie chart of LLM usage
- ✅ **Model Distribution** - Bar chart of models used
- ✅ **Search Conversations** - Find specific questions/answers
- ✅ **Filter by Date** - View conversations from specific time period
- ✅ **CSV Export** - Download full history

### Using the REST API

**View API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Example API Calls:**

```bash
# Health check
curl http://localhost:8000/health

# Upload document
curl -X POST "http://localhost:8000/upload" \
  -F "files=@document.pdf"

# Ask question
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is RAG?", "provider": "groq"}'

# Get history
curl http://localhost:8000/history

# Clear history
curl -X POST http://localhost:8000/clear-history
```

---

## 📖 Documentation

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[backend/README.md](backend/README.md)** | **Complete backend architecture** - How RAG works, data flow, API details, troubleshooting | **MUST READ** to understand system |
| **[frontend/README.md](frontend/README.md)** | **Complete frontend architecture** - UI components, API integration, session management | **MUST READ** for frontend dev |
| [docs/QUICK_START.md](docs/QUICK_START.md) | Quick 3-step setup guide | First-time setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | High-level system design | Understanding system |
| [docs/FASTAPI_QUICK_REFERENCE.md](docs/FASTAPI_QUICK_REFERENCE.md) | API endpoint reference | API integration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide | Going to production |

**⭐ Most Important:** 
- `backend/README.md` - Explains **how the RAG system works internally**
- `frontend/README.md` - Explains **how the UI communicates with backend**

---

## 📊 Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.100+ | REST API framework - async, fast, auto-docs |
| **Uvicorn** | Latest | ASGI server for FastAPI |
| **LangChain** | Latest | RAG framework - chunking, prompts, chains |
| **FAISS** | CPU | Vector database - fast similarity search |
| **HuggingFace** | Latest | Embeddings model (all-MiniLM-L6-v2) |
| **SQLite** | 3.x | Conversation history database |
| **SQLAlchemy** | 2.x | ORM for database operations |
| **Pydantic** | 2.x | Data validation and settings |
| **Python-dotenv** | Latest | Environment variable loading |

### LLM Providers

| Provider | Library | Purpose |
|----------|---------|---------|
| **Groq** | langchain-groq | Primary LLM (fast, free) |
| **OpenRouter** | langchain-openai | Fallback LLM (100+ models) |
| **OpenAI** | langchain-openai | Secondary fallback (high quality) |

### Document Processing

| Library | Purpose |
|---------|---------|
| **PyPDF2** | PDF text extraction |
| **python-docx** | Word document processing |
| **python-pptx** | PowerPoint processing |

### Frontend

| Technology | Purpose |
|-----------|---------|
| **Streamlit** | Web UI framework |
| **Requests** | HTTP client for API calls |
| **Pandas** | Data manipulation (admin dashboard) |
| **Plotly** | Charts and visualizations |

---

## 🛠️ Development

### Project Setup

```bash
# Clone repository
git clone <repository-url>
cd RAG

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup pre-commit hooks (optional)
pip install pre-commit
pre-commit install
```

### Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=backend --cov=frontend tests/

# Run specific test file
python -m pytest tests/test_rag_engine.py
```

### Code Quality

```bash
# Format code
black backend/ frontend/

# Lint code
flake8 backend/ frontend/

# Type checking
mypy backend/ frontend/
```

### Adding New Features

**1. New API Endpoint:**
```python
# backend/api.py

@app.post("/new-endpoint")
async def new_feature(data: RequestModel):
    # Your code here
    return {"status": "success"}
```

**2. New Document Format:**
```python
# backend/doc_loader.py

@staticmethod
def _load_new_format(path: str) -> str:
    # Load and return text
    return extracted_text
```

**3. New LLM Provider:**
```python
# backend/llm_provider.py

if Config.NEW_PROVIDER_API_KEY:
    try:
        self.providers["new_provider"] = NewProviderChat(
            model=Config.NEW_PROVIDER_MODEL
        )
    except Exception as e:
        logger.warning(f"New provider init failed: {e}")
```

### Debugging

**Enable Debug Logging:**
```python
# backend/config.py

import logging
logging.basicConfig(level=logging.DEBUG)
```

**Check Backend Logs:**
```bash
# Terminal running uvicorn will show logs
# Look for ERROR or WARNING messages
```

**Check Database:**
```bash
# Open SQLite database
sqlite3 backend/data/conversation_history.db

# View conversations
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

# Count conversations
SELECT COUNT(*) FROM conversations;
```

**Inspect FAISS Index:**
```python
# Python console
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
vectorstore = FAISS.load_local("backend/data/faiss_index", embeddings)

# Check number of vectors
print(vectorstore.index.ntotal)
```

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete production deployment guide.

**Quick Deploy Options:**

### Docker (Recommended)

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000 8501

CMD ["python", "main.py"]
```

```bash
# Build and run
docker build -t ai-documind .
docker run -p 8000:8000 -p 8501:8501 --env-file .env ai-documind
```

### Railway / Render / Heroku

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### AWS / GCP / Azure

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for cloud-specific guides

---

## 🔮 Future Enhancements

- [ ] Streaming responses
- [ ] Multi-user support with authentication
- [ ] React frontend migration
- [ ] Docker Compose setup
- [ ] Vector database alternatives (Pinecone, Weaviate)
- [ ] Advanced RAG (HyDE, Multi-Query)
- [ ] File management (delete documents)
- [ ] Conversation threads
- [ ] Export conversations to PDF

---

## 🤝 Contributing

Contributions welcome! Please:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit**: `git commit -m "Add amazing feature"`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

**Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 💬 Support

### Documentation
- Backend: [backend/README.md](backend/README.md)
- Frontend: [frontend/README.md](frontend/README.md)
- Docs folder: [docs/](docs/)

### Issues
- Check existing issues first
- Provide detailed reproduction steps
- Include error logs and environment details

### Community
- GitHub Discussions for questions
- Issues for bug reports
- Pull Requests for contributions

---

## 🎯 Quick Links

- 📚 **[Backend Architecture](backend/README.md)** - Deep dive into RAG system
- 🖥️ **[Frontend Architecture](frontend/README.md)** - UI and API integration
- 🚀 **[Quick Start](docs/QUICK_START.md)** - Get running in 3 steps
- 🔌 **[API Reference](docs/FASTAPI_QUICK_REFERENCE.md)** - All endpoints
- 🏗️ **[Architecture](docs/ARCHITECTURE.md)** - System design
- 🚢 **[Deployment](docs/DEPLOYMENT.md)** - Production guide

---

**Ready to chat with your documents? 🚀**

```bash
python main.py
```

Then open http://localhost:8501 and start asking questions!

---

Made with ❤️ using FastAPI, Streamlit, and LangChain

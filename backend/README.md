# Backend Architecture - RAG System# Backend - AI Documind Core Engine



## 📋 OverviewThe backend provides the core RAG (Retrieval-Augmented Generation) functionality, document processing, and multi-LLM orchestration for the AI Documind system.



# Backend Architecture - AI Documind

## 📋 Overview

The backend is a **FastAPI-based REST API** that implements a complete **Retrieval-Augmented Generation (RAG)** pipeline for **AI Documind**. It processes documents, stores them in a vector database, and provides intelligent question-answering using multiple LLM providers.## 📁 Structure



---```

backend/

## 🏗️ Architecture Flow├── __init__.py          # Package initialization

├── config.py           # Configuration (models, settings; loads keys from .env)

```├── config.py.template  # Template for non-secret defaults (optional)

┌─────────────────────────────────────────────────────────────────┐├── doc_loader.py       # Universal document loader (PDF, DOCX, PPTX, TXT)

│                         FastAPI Backend                         │├── llm_provider.py     # Multi-LLM provider management

├─────────────────────────────────────────────────────────────────┤├── rag_engine.py       # Core RAG engine with FAISS vectorstore

│                                                                 │└── __pycache__/        # Python bytecode cache (auto-generated)

│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │```

│  │   Document   │────▶│  Embedding   │────▶│    FAISS     │   │

│  │    Loader    │     │   (HF Model) │     │  VectorStore │   │## 🔧 Components

│  └──────────────┘     └──────────────┘     └──────────────┘   │

│         │                                          │            │### Configuration (`config.py`)

│         │                                          ▼            │

│         │                                   ┌──────────────┐   │Centralized configuration management for:

│         │                                   │   Semantic   │   │- **API Keys**: Groq, OpenRouter, and OpenAI API keys

│         │                                   │    Search    │   │- **Models**: LLM model specifications and versions

│         │                                   └──────────────┘   │- **Chunking**: Document chunk size and overlap settings

│         │                                          │            │- **Retrieval**: Number of chunks to retrieve for context

│         ▼                                          ▼            │- **Embeddings**: Sentence transformer model configuration

│  ┌──────────────┐                          ┌──────────────┐   │- **Storage**: FAISS index persistence settings

│  │     Text     │                          │  Retrieved   │   │

│  │   Chunking   │                          │   Context    │   │**Security Note**: Never commit real API keys. Use `.env` for secrets and commit only `.env.template`.

│  └──────────────┘                          └──────────────┘   │

│                                                    │            │### Document Loader (`doc_loader.py`)

│                                                    ▼            │

│                                             ┌──────────────┐   │Universal document processing engine supporting:

│                                             │     LLM      │   │- **PDF**: PyPDF2-based text extraction

│                                             │   Provider   │   │- **DOCX**: python-docx for Word document processing

│                                             │ (Groq/OR/OAI)│   │- **PPTX**: python-pptx for PowerPoint slide extraction

│                                             └──────────────┘   │- **TXT**: Plain text file handling

│                                                    │            │

│                                                    ▼            │Features:

│                                             ┌──────────────┐   │- Automatic text cleaning and normalization

│                                             │   Response   │   │- Configurable chunking with overlap

│                                             └──────────────┘   │- Metadata preservation

└─────────────────────────────────────────────────────────────────┘- Error handling for unsupported formats

```

### LLM Provider (`llm_provider.py`)

---

Multi-provider LLM orchestration:

## 📂 File Structure & Responsibilities- **Groq**: Fast inference with Llama models

- **OpenRouter**: Access to multiple model providers

### **1. `config.py` - Central Configuration Manager**- **OpenAI**: GPT models (optional)



**Purpose**: Load and validate all configuration from environment variablesFeatures:

- Automatic provider initialization

**Key Features**:- Health checking and fallback logic

- ✅ Loads `.env` file using `python-dotenv`- Environment variable management

- ✅ Type-safe parsing (converts strings to int, list, etc.)- Error handling and logging

- ✅ Provides defaults for all settings

- ✅ Validates API keys availability### RAG Engine (`rag_engine.py`)



**Configuration Categories**:Core retrieval-augmented generation system:

- **Vector Store**: FAISS for efficient similarity search

| Category | Variables | Description |- **Embeddings**: HuggingFace sentence transformers

|----------|-----------|-------------|- **Intelligent Fusion**: Multi-LLM response combination

| **API Keys** | `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY` | LLM provider authentication |- **Smart Cascade**: Automatic fallback between providers

| **Models** | `GROQ_MODEL`, `OPENROUTER_MODEL`, `OPENAI_MODEL` | Model selection per provider |- **Rate Limiting**: Built-in delay handling

| **Chunking** | `CHUNK_SIZE`, `CHUNK_OVERLAP` | Text splitting parameters |- **Fresh Start**: No persistent storage by design

| **Retrieval** | `TOP_K_CHUNKS` | Number of chunks to retrieve |

| **Embedding** | `EMBEDDING_MODEL` | HuggingFace model for embeddings |## 🚀 Key Features

| **Storage** | `FAISS_PERSIST_DIR`, `HISTORY_DB_PATH` | File paths for persistence |

| **Persistence** | `PERSIST_FAISS` | Enable/disable FAISS saving |### Intelligent Multi-LLM Fusion

| **Priority** | `PROVIDER_PRIORITY` | LLM fallback order |

The system combines responses from multiple LLMs:

**Example Usage**:1. **Parallel Processing**: Queries both Groq and OpenRouter simultaneously

```python2. **Smart Validation**: Filters out error responses and rate limit messages

from backend.config import Config3. **Intelligent Combination**: Merges valid responses for optimal answers

4. **Cascade Fallback**: Uses best available provider if combination fails

# Access configuration

print(Config.GROQ_API_KEY)  # API key from .env### Rate Limit Handling

print(Config.CHUNK_SIZE)    # 1000 (default) or custom from .env

print(Config.PROVIDER_PRIORITY)  # ['groq', 'openrouter', 'openai']Built-in protection against API rate limits:

```- Automatic delays between API calls

- Error detection and retry logic

---- User-friendly rate limit messages

- Graceful degradation

### **2. `doc_loader.py` - Universal Document Processor**

### Document Processing Pipeline

**Purpose**: Load and process various document formats into clean text

1. **Load**: Universal document loading with format detection

**Supported Formats**:2. **Clean**: Text normalization and formatting

- 📄 **PDF** - Using `PyPDF2`3. **Chunk**: Configurable text splitting with overlap

- 📝 **TXT** - Plain text files4. **Embed**: Sentence transformer vectorization

- 📘 **DOCX** - Microsoft Word documents5. **Index**: FAISS vectorstore creation

- 📊 **PPTX** - PowerPoint presentations6. **Retrieve**: Similarity search for relevant chunks

7. **Generate**: Multi-LLM response generation

**Processing Pipeline**:

## 🔧 Configuration

```

Document File### Environment Setup (preferred)

     │

     ▼1. Copy environment template (Windows PowerShell):

┌─────────────────┐   ```powershell

│  Format Handler │  ◄── Detects file extension   Copy-Item ..\.env.template ..\.env

└─────────────────┘   ```

     │2. Edit `../.env` and set:

     ▼   ```dotenv

┌─────────────────┐   GROQ_API_KEY=your_groq_key

│  Text Extraction│  ◄── Extracts all text content   OPENROUTER_API_KEY=your_openrouter_key

└─────────────────┘   PERSIST_FAISS=true

     │   ```

     ▼

┌─────────────────┐### Model Configuration

│  Text Cleaning  │  ◄── Removes extra whitespace, fixes line breaks

└─────────────────┘```python

     │# Current working models

     ▼GROQ_MODEL = "llama-3.1-8b-instant"

┌─────────────────┐OPENROUTER_MODEL = "meta-llama/llama-3.3-8b-instruct:free"

│  Text Chunking  │  ◄── Splits into overlapping chunks```

└─────────────────┘

     │You can override these via `.env` without changing code:

     ▼```dotenv

  LangChain DocumentsGROQ_MODEL=llama-3.1-8b-instant

```OPENROUTER_MODEL=meta-llama/llama-3.3-8b-instruct:free

OPENAI_MODEL=gpt-4o-mini

**Key Methods**:```



```python### Performance Tuning

# Load document to raw text

text = UniversalDocLoader.load_document("file.pdf")```python

# Document processing

# Clean text (remove extra spaces, fix line breaks)CHUNK_SIZE = 1000

clean = UniversalDocLoader.clean_text(text)CHUNK_OVERLAP = 200



# Chunk into LangChain Documents# Retrieval

chunks = UniversalDocLoader.chunk_text(clean, metadata={"source": "file.pdf"})TOP_K_CHUNKS = 4

```

# Embeddings

**Chunking Strategy**:EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

- Uses `RecursiveCharacterTextSplitter` for intelligent splitting

- Respects sentence/paragraph boundariesThese can also be configured from `.env` as integers/strings:

- Maintains context with overlapping chunks```dotenv

- Adds metadata (source, chunk_id) to each chunkCHUNK_SIZE=1000

CHUNK_OVERLAP=200

---TOP_K_CHUNKS=4

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

### **3. `llm_provider.py` - Multi-Provider LLM Manager**```

```

**Purpose**: Manage multiple LLM providers with automatic fallback

## 🧪 Testing

**Supported Providers**:

1. **Groq** - Fast inference with Llama modelsRun the API validator from the test directory:

2. **OpenRouter** - Access to multiple models via unified API```bash

3. **OpenAI** - GPT models (optional fallback)cd ../test

python test_apis.py

**Features**:```

- ✅ **Automatic Fallback**: If primary provider fails, tries next in priority

- ✅ **Provider Testing**: Check which providers are working## 🔌 Integration

- ✅ **Dynamic Selection**: Choose provider at runtime

- ✅ **Environment-Based Config**: API keys from `.env`The backend is designed for easy integration:



**How It Works**:```python

from backend.rag_engine import ConversationalRAG

```python

from backend.llm_provider import LLMProvider# Initialize RAG system

rag = ConversationalRAG()

provider = LLMProvider()

# Add documents

# Get preferred provider (based on PROVIDER_PRIORITY)rag.add_documents(["document1.pdf", "document2.txt"])

llm = provider.get_llm()  # Returns first available: groq → openrouter → openai

# Ask questions

# Get specific providerresult = rag.ask("What is the main topic?")

groq_llm = provider.get_llm("groq")print(result["answer"])  # AI-generated answer

print(result["sources"])  # Source citations

# Test provider connectivity```

working = provider.get_working_providers()  # ['groq', 'openrouter']

```## 🚨 Error Handling



**Provider Initialization**:Comprehensive error handling for:

1. Reads API keys from `Config`- API key validation

2. Sets environment variables for each SDK- Network connectivity issues

3. Initializes LangChain wrappers (`ChatGroq`, `ChatOpenAI`)- Rate limiting

4. Logs success/failure for each provider- Document processing failures

- Model loading errors

**Priority Order** (configurable via `.env`):

```## 🔒 Security

PROVIDER_PRIORITY=groq,openrouter,openai

```- API keys never logged or exposed

- Secure configuration template system

---- Input validation and sanitization

- No persistent sensitive data storage

### **4. `rag_engine.py` - Core RAG Pipeline**

## 📊 Performance

**Purpose**: Orchestrate the complete RAG workflow

- **Fast Inference**: Optimized for real-time responses

**Main Class**: `ConversationalRAG`- **Memory Efficient**: Fresh start design prevents memory leaks

- **Scalable**: Configurable chunk sizes and retrieval limits

**Initialization Flow**:- **Reliable**: Multi-provider fallbacks ensure availability</content>

<parameter name="filePath">P:\Projects\RAG\backend\README.md
```
ConversationalRAG()
     │
     ├─▶ Initialize HuggingFace Embeddings (all-MiniLM-L6-v2)
     │
     ├─▶ Initialize LLMProvider (Groq/OpenRouter/OpenAI)
     │
     ├─▶ Load FAISS index (if PERSIST_FAISS=true)
     │   └─▶ Or cleanup old index (if PERSIST_FAISS=false)
     │
     └─▶ Initialize conversation history []
```

**Core Methods**:

#### **1. Document Ingestion**
```python
async def ingest_documents_async(file_paths: List[str], batch_size: int = 5)
```
- Loads multiple documents in parallel
- Cleans and chunks text
- Generates embeddings
- Stores in FAISS vectorstore
- Optionally persists to disk

**Process**:
```
Files → ThreadPool → Load+Clean+Chunk → Embeddings → FAISS → Save (optional)
```

#### **2. Question Answering**
```python
async def query_async(question: str, provider: Optional[str] = None) -> dict
```
- Retrieves relevant chunks using semantic search
- Constructs prompt with context
- Calls LLM with fallback logic
- Returns structured response

**Process**:
```
Question → Embed → FAISS Search (Top K) → Build Prompt → LLM → Response
```

**Response Format**:
```json
{
  "answer": "The AI-generated answer",
  "sources": [
    {
      "source": "document.pdf",
      "chunk_id": "1",
      "content": "Original text snippet..."
    }
  ],
  "provider_used": "groq",
  "model_used": "llama-3.1-8b-instant"
}
```

#### **3. Conversation History**
```python
def get_conversation_history() -> List[dict]
def clear_history()
```
- Maintains in-memory conversation log
- Used for context-aware responses (future feature)

---

### **5. `history_db.py` - SQLite Conversation Storage**

**Purpose**: Persist conversation history to SQLite database

**Database Schema**:
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources TEXT,           -- JSON array of sources
    provider_used TEXT,
    model_used TEXT
)
```

**Location**: `backend/data/conversation_history.db`

**Why SQLite?**
- ✅ Lightweight (no separate database server)
- ✅ Serverless (embedded in application)
- ✅ Transactional (ACID compliance)
- ✅ Perfect for analytics and history tracking
- ✅ Easy to query with standard SQL

**Usage**:
```python
from backend.history_db import HistoryDB

db = HistoryDB()

# Save conversation
db.save_conversation(
    question="What is RAG?",
    answer="RAG is...",
    sources=[...],
    provider_used="groq",
    model_used="llama-3.1-8b-instant"
)

# Retrieve history
history = db.get_all_conversations()
```

**Frontend Integration**:
- Admin dashboard queries this DB for analytics
- Shows conversation trends, provider usage, etc.

---

### **6. `api.py` - FastAPI REST Endpoints**

**Purpose**: Expose RAG functionality via HTTP API

**Endpoints**:

#### **1. Health Check**
```http
GET /health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T12:00:00Z"
}
```

#### **2. Upload Documents**
```http
POST /upload
Content-Type: multipart/form-data

files: [file1.pdf, file2.docx, ...]
```

**Process**:
1. Receives files via multipart upload
2. Saves temporarily to `backend/temp/`
3. Calls `rag_engine.ingest_documents_async()`
4. Deletes temp files
5. Returns success/failure

Response:
```json
{
  "status": "success",
  "message": "3 documents processed successfully",
  "files_processed": ["file1.pdf", "file2.docx", "file3.txt"]
}
```

#### **3. Ask Question**
```http
POST /ask
Content-Type: application/json

{
  "question": "What is the main topic?",
  "provider": "groq"  // optional
}
```

**Process**:
1. Validates request
2. Calls `rag_engine.query_async()`
3. Saves to history DB
4. Returns answer with sources

Response:
```json
{
  "answer": "The main topic is...",
  "sources": [
    {
      "source": "document.pdf",
      "chunk_id": "2",
      "content": "Relevant excerpt..."
    }
  ],
  "provider_used": "groq",
  "model_used": "llama-3.1-8b-instant"
}
```

#### **4. Get History**
```http
GET /history
```

Returns all conversations from SQLite database

#### **5. Clear History**
```http
POST /clear-history
```

Clears in-memory and database history

---

## 🗄️ Data Storage & Database

### **Where Runtime Data is Stored**

All runtime-generated data is stored in the **`data/` folder** at the project root (NOT inside `backend/`).

**Why at project root?**
- The `data/` folder contains **outputs** generated by the backend
- It's **project-level data**, not backend code
- Makes it clear these are **runtime artifacts**, not source code
- Easy to backup/restore independently from code

### **`data/` Folder Contents**

```
data/
├── conversation_history.db    # SQLite database
└── faiss_index/               # Vector embeddings
    ├── index.faiss           # FAISS index file
    └── index.pkl             # Metadata pickle
```

---

### **1. `conversation_history.db` - SQLite Database**

**Purpose**: Persistent storage for all Q&A interactions

**What It Stores**:
- Every question asked by users
- AI-generated answers
- Source citations (which documents were used)
- Provider used (Groq, OpenRouter, OpenAI)
- Model used (llama-3.1-8b-instant, etc.)
- Timestamp of conversation

**Database Schema**:
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,              -- When was this asked?
    question TEXT NOT NULL,                -- User's question
    answer TEXT NOT NULL,                  -- AI's answer
    sources TEXT,                          -- JSON array of source documents
    provider_used TEXT,                    -- Which LLM provider (groq/openrouter/openai)
    model_used TEXT                        -- Which model (llama-3.1-8b-instant, etc.)
);
```

**Example Data**:
| id | timestamp | question | answer | provider_used | model_used |
|----|-----------|----------|--------|---------------|------------|
| 1 | 2025-10-03 12:00:00 | What is RAG? | RAG is Retrieval-Augmented Generation... | groq | llama-3.1-8b-instant |
| 2 | 2025-10-03 12:05:30 | How does it work? | It combines retrieval and generation... | groq | llama-3.1-8b-instant |

**Why SQLite?**
- ✅ **No separate database server needed** - Embedded in the application
- ✅ **Serverless** - Just a file on disk
- ✅ **ACID compliant** - Transactional integrity (no data loss)
- ✅ **Perfect for analytics** - Easy to query with SQL
- ✅ **Portable** - Single file, easy to backup/share
- ✅ **Fast** - Optimized for read-heavy workloads
- ✅ **Standard SQL** - Everyone knows how to query it

**What It's Used For**:
1. **Admin Dashboard** - Powers the analytics view
   - Shows conversation history table
   - Generates charts (provider usage, model distribution)
   - Enables search and filtering
   - Provides CSV export

2. **Analytics** - Track usage patterns
   - Which questions are asked most?
   - Which LLM provider is used most?
   - Which documents are referenced most?
   - When are peak usage times?

3. **Debugging** - Troubleshoot issues
   - See exact questions that failed
   - Check which provider was used
   - Review source citations
   - Analyze response quality

**How to Query It**:
```bash
# Open database
sqlite3 data/conversation_history.db

# View recent conversations
SELECT timestamp, question, provider_used 
FROM conversations 
ORDER BY timestamp DESC 
LIMIT 10;

# Count conversations by provider
SELECT provider_used, COUNT(*) as count 
FROM conversations 
GROUP BY provider_used;

# Find conversations about specific topic
SELECT * FROM conversations 
WHERE question LIKE '%RAG%' 
OR answer LIKE '%RAG%';
```

**Managed By**: `backend/history_db.py` (HistoryDB class)

**Size**: ~1KB per conversation (grows with usage)

**Cleanup**: Delete the file to reset all history

---

### **2. `faiss_index/` - Vector Embeddings**

**Purpose**: Stores document embeddings for fast semantic search

**What It Stores**:
- Vector representations of document chunks
- Metadata (source file, chunk ID)
- FAISS index structure for similarity search

**Contents**:
```
faiss_index/
├── index.faiss    # Binary FAISS index (vector database)
└── index.pkl      # Metadata pickle (chunk text, source info)
```

**Why FAISS?**
- ✅ **Fast** - Optimized for billion-scale vector search
- ✅ **Efficient** - Low memory footprint
- ✅ **Offline** - Works without internet/external services
- ✅ **Free** - No API costs
- ✅ **Local** - Your data stays on your machine

**What It's Used For**:
1. **Semantic Search** - Find relevant document chunks
   - User asks: "What is the main topic?"
   - FAISS finds: Top 4 chunks most similar to question
   - Backend uses: These chunks as context for LLM

2. **Document Retrieval** - Connect answers to sources
   - Each chunk has metadata (source file, chunk ID)
   - When FAISS returns chunks, we get source citations
   - User sees: "Answer based on document.pdf, chunk 3"

**How It Works**:
```python
# 1. Document Upload
document_text = "RAG is a technique..."
chunks = chunk_text(document_text)  # Split into 1000-char pieces

# 2. Generate Embeddings
embeddings = HuggingFaceEmbeddings("all-MiniLM-L6-v2")
vectors = embeddings.embed_documents(chunks)  # Convert text → numbers

# 3. Store in FAISS
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("data/faiss_index")  # Save to disk

# 4. Later: Search
question = "What is RAG?"
question_vector = embeddings.embed_query(question)
similar_chunks = vectorstore.similarity_search(question, k=4)  # Find top 4
```

**Managed By**: `backend/rag_engine.py` (ConversationalRAG class)

**Size**: ~10MB per 100 pages of documents

**Cleanup**: Delete folder to reindex all documents

**Persistence**:
- If `PERSIST_FAISS=true` in `.env`: Saved to disk, reloaded on restart
- If `PERSIST_FAISS=false`: Kept in memory only, lost on restart

---

## 🔄 How Backend Uses This Data

### **During Document Upload**:
```python
# backend/api.py - /upload endpoint

1. Receive files from frontend
2. Process documents → chunks
3. Generate embeddings
4. Store in FAISS → data/faiss_index/
5. Return success
```

### **During Question Answering**:
```python
# backend/api.py - /ask endpoint

1. Receive question from frontend
2. Embed question
3. Search FAISS (data/faiss_index/) → Get relevant chunks
4. Build prompt with chunks
5. Call LLM → Get answer
6. Save to SQLite (data/conversation_history.db)
7. Return answer + sources
```

### **During Analytics**:
```python
# backend/api.py - /history endpoint

1. Receive request from admin dashboard
2. Query SQLite (data/conversation_history.db)
3. Return conversation data
4. Frontend displays charts/tables
```

---

## 📊 Example Usage Scenarios

### **Scenario 1: Debugging a Bad Answer**

```bash
# 1. User reports: "AI gave wrong answer"
# 2. Check database to see what happened

sqlite3 data/conversation_history.db

SELECT timestamp, question, answer, provider_used, sources
FROM conversations
WHERE question LIKE '%specific question%';

# 3. Analyze:
# - Was the right provider used?
# - What sources were retrieved?
# - Did we get relevant chunks?
```

### **Scenario 2: Analyzing Provider Performance**

```bash
# Which provider gives best results?

SELECT 
    provider_used,
    COUNT(*) as conversations,
    AVG(LENGTH(answer)) as avg_answer_length
FROM conversations
GROUP BY provider_used;

# Result:
# groq         | 150 | 250
# openrouter   | 50  | 280
# openai       | 10  | 320
```

### **Scenario 3: Backup Important Conversations**

```bash
# Export all conversations to CSV
sqlite3 data/conversation_history.db

.headers on
.mode csv
.output conversations_backup.csv
SELECT * FROM conversations;
.quit

# Now you have a CSV file with all Q&A history
```

### **Scenario 4: Reset System**

```bash
# Clear all data and start fresh

# Delete database
Remove-Item data/conversation_history.db

# Delete vector index  
Remove-Item data/faiss_index -Recurse

# On next run, backend will recreate empty database
# You'll need to re-upload documents
```

---

## 🔍 Troubleshooting Data Issues

### **Problem**: Database locked error
**Cause**: Multiple processes trying to write simultaneously  
**Solution**: Only run one backend instance at a time

### **Problem**: FAISS index not found
**Cause**: Index not persisted or deleted  
**Solution**: Upload documents again to rebuild index

### **Problem**: Database file corrupted
**Cause**: Improper shutdown or disk error  
**Solution**: Delete `conversation_history.db`, will recreate automatically

### **Problem**: Running out of disk space
**Cause**: Too many conversations or large documents  
**Solution**: 
- Archive old database: `mv data/conversation_history.db data/conversation_history_backup.db`
- Clear FAISS index if needed: `rm -r data/faiss_index`

---

## 💡 Key Takeaways

**About `data/` Folder**:
- ✅ Located at **project root** (not inside `backend/`)
- ✅ Contains **runtime outputs** (database + vectors)
- ✅ **Gitignored** (doesn't go to version control)
- ✅ **Auto-created** by backend on first run
- ✅ **Portable** - Copy folder to backup/migrate data

**About SQLite Database**:
- ✅ Stores **all conversations** for analytics
- ✅ Used by **admin dashboard** for charts/tables
- ✅ Can be **queried directly** with SQL
- ✅ **Serverless** - no installation needed

**About FAISS Index**:
- ✅ Stores **document embeddings** for search
- ✅ Used by **RAG engine** to find relevant chunks
- ✅ **Optional persistence** (controlled by `PERSIST_FAISS`)
- ✅ **Rebuild anytime** by re-uploading documents

---

## 🔄 Complete Request Flow

### **Document Upload Flow**

```
Frontend (Streamlit)
     │
     │ POST /upload (multipart/form-data)
     ▼
FastAPI Endpoint (/upload)
     │
     ├─▶ Save files to backend/temp/
     │
     ▼
RAG Engine (ingest_documents_async)
     │
     ├─▶ Load documents (UniversalDocLoader)
     │
     ├─▶ Clean text
     │
     ├─▶ Chunk text (1000 chars, 200 overlap)
     │
     ├─▶ Generate embeddings (HuggingFace)
     │
     ├─▶ Store in FAISS vectorstore
     │
     ├─▶ Save FAISS index to backend/data/faiss_index/
     │
     └─▶ Delete temp files
```

### **Question-Answer Flow**

```
Frontend (Streamlit)
     │
     │ POST /ask {"question": "..."}
     ▼
FastAPI Endpoint (/ask)
     │
     ▼
RAG Engine (query_async)
     │
     ├─▶ Embed question (HuggingFace)
     │
     ├─▶ Search FAISS (Top 4 chunks)
     │
     ├─▶ Build prompt with context
     │
     ├─▶ Call LLM (Groq → OpenRouter → OpenAI)
     │
     ├─▶ Parse response
     │
     └─▶ Return {answer, sources, provider}
     │
     ▼
History DB (save_conversation)
     │
     └─▶ Save to backend/data/conversation_history.db
     │
     ▼
Response to Frontend
```

---

## 🔧 Configuration via `.env`

Create `.env` file in project root:

```env
# API Keys (at least one required)
GROQ_API_KEY=your_groq_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
OPENAI_API_KEY=your_openai_key_here

# Model Selection
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_MODEL=meta-llama/llama-3.3-8b-instruct:free
OPENAI_MODEL=gpt-4o-mini

# Chunking Parameters
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Retrieval
TOP_K_CHUNKS=4

# Embedding Model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Storage (relative to project root)
FAISS_PERSIST_DIR=data/faiss_index
HISTORY_DB_PATH=data/conversation_history.db

# Persistence Toggle
PERSIST_FAISS=true

# Provider Priority (comma-separated)
PROVIDER_PRIORITY=groq,openrouter,openai
```

---

## 🚀 Running the Backend

### **Standalone Mode** (API only)
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run with uvicorn
uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
```

Access API docs: http://localhost:8000/docs

### **Unified Mode** (with Frontend)
```bash
# From project root
python main.py
```

This starts both backend (port 8000) and frontend (port 8501)

---

## 📊 Dependencies

```
fastapi              # Web framework
uvicorn             # ASGI server
pydantic            # Data validation
python-dotenv       # Environment variables
langchain           # RAG framework
langchain-community # Vector stores
langchain-groq      # Groq LLM wrapper
langchain-openai    # OpenAI wrapper
sentence-transformers  # Embeddings
faiss-cpu           # Vector database
PyPDF2              # PDF processing
python-docx         # DOCX processing
python-pptx         # PPTX processing
```

---

## 🔍 Troubleshooting

### **Problem**: FAISS index not persisting
**Solution**: Set `PERSIST_FAISS=true` in `.env`

### **Problem**: LLM provider fails
**Solution**: Check API key in `.env`, verify provider priority order

### **Problem**: Documents not loading
**Solution**: Check file format support, verify file path accessibility

### **Problem**: Database locked error
**Solution**: Only one process should access SQLite at a time. Restart backend.

---

## 🎯 Key Design Decisions

1. **Why FAISS?** - Fast, efficient, works offline (no external DB needed)
2. **Why SQLite?** - Lightweight, serverless, perfect for conversation history
3. **Why Multiple LLM Providers?** - Redundancy, cost optimization, flexibility
4. **Why Separate data/ folder?** - Clear separation of code vs runtime artifacts
5. **Why FastAPI?** - Modern, async, auto-generated docs, easy frontend integration

---

## 📚 Further Reading

- **API Reference**: See `docs/FASTAPI_QUICK_REFERENCE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Deployment**: See `docs/DEPLOYMENT.md`

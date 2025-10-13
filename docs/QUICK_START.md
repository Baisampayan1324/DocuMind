# 🚀 Quick Start Guide

## Prerequisites
- Python 3.9+
- API key for at least one LLM provider (Groq/OpenRouter/OpenAI)

---

## ⚡ 3-Step Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure API Keys
```bash
# Copy template
cp .env.template .env

# Edit .env and add your API keys
# At least ONE is required:
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx  
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

### 3. Run the System
```bash
python main.py
```

---

## 🎯 Access the UI

| Interface | URL | Purpose |
|-----------|-----|---------|
| **Main UI** | http://localhost:8501 | Upload docs & ask questions |
| **Admin Dashboard** | http://localhost:8502 | Analytics & conversation history |
| **API Docs** | http://localhost:8000/docs | Swagger API documentation |

---

## 💡 Usage

### Upload Documents
1. Open http://localhost:8501
2. Click "Browse files" in sidebar
3. Upload PDF, DOCX, TXT, or PPTX files
4. Wait for processing

### Ask Questions
1. Type your question in the input box
2. Click "Ask" button
3. Get AI answer with source citations
4. View response time and provider used

### View Analytics
1. Run `streamlit run frontend/admin.py --server.port 8502`
2. Open http://localhost:8502
3. View metrics, charts, and conversation history
4. Export data to CSV

---

## 🛑 Stop the System

Press `Ctrl+C` in the terminal where you ran `python main.py`

---

## 🔧 Advanced: Manual Start

If you prefer to run components separately:

```bash
# Terminal 1: Backend
uvicorn backend.api:app --reload --port 8000

# Terminal 2: Frontend
streamlit run frontend/app_api.py

# Terminal 3: Admin (optional)
streamlit run frontend/admin.py --server.port 8502
```

---

## 📚 Next Steps

- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- **API Reference:** See [API_REFERENCE.md](API_REFERENCE.md) for endpoint details
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

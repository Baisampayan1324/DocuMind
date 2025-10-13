# 🎯 Quick Launch Guide

## 🚀 Start Everything in One Command

```bash
python main.py
```

**What happens:**
1. ✅ Checks dependencies (FastAPI, Streamlit, etc.)
2. ✅ Verifies `.env` configuration exists
3. ✅ Starts FastAPI backend on port 8000
4. ✅ Starts Streamlit frontend on port 8501
5. ✅ Shows live status of both servers

**Access Points:**
- **Frontend UI:** http://localhost:8501
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Admin Dashboard:** Run separately with `streamlit run frontend/admin.py --server.port 8502`

**Stop Everything:** Press `Ctrl+C` in the terminal

---

## 🎨 Launch Modes

### **Mode 1: Unified (Recommended)**
```bash
python main.py
```
- Starts both backend + frontend
- Best for local development
- Easy monitoring

### **Mode 2: API Client Architecture**
```bash
# Terminal 1: Backend
uvicorn backend.api:app --reload --port 8000

# Terminal 2: API Frontend
streamlit run frontend/app_api.py --server.port 8501

# Terminal 3 (Optional): Admin Dashboard
streamlit run frontend/admin.py --server.port 8502
```
- Proper frontend/backend separation
- Scales independently
- Production-like architecture

### **Mode 3: Direct RAG (No API)**
```bash
streamlit run app.py
```
- Single process (no backend needed)
- Fastest startup
- Good for quick testing

---

## 📊 Access Different Apps

| App | Command | Port | URL |
|-----|---------|------|-----|
| **Main Frontend** | `streamlit run app.py` | 8501 | http://localhost:8501 |
| **API Client** | `streamlit run frontend/app_api.py` | 8501 | http://localhost:8501 |
| **Admin Dashboard** | `streamlit run frontend/admin.py` | 8502 | http://localhost:8502 |
| **Backend API** | `uvicorn backend.api:app --reload` | 8000 | http://localhost:8000 |
| **API Docs** | (backend must be running) | 8000 | http://localhost:8000/docs |

---

## ⚙️ Pre-Launch Checklist

### 1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

### 2. **Configure Environment**
```bash
# Copy template
cp .env.template .env

# Edit .env and add:
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PROVIDER_PRIORITY=groq,openrouter,openai
```

### 3. **Verify Setup**
```bash
# Run unified launcher
python main.py

# Should see:
# ✅ All dependencies installed
# ✅ Configuration file found
# ✅ Backend running at http://localhost:8000
# ✅ Frontend running at http://localhost:8501
```

---

## 🐛 Troubleshooting Launch Issues

### **Error: "Module not found"**
```bash
pip install -r requirements.txt
```

### **Error: "Port already in use"**
```bash
# Windows: Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different ports:
uvicorn backend.api:app --port 8001
streamlit run app.py --server.port 8502
```

### **Error: ".env file not found"**
```bash
cp .env.template .env
# Then edit .env with your API keys
```

### **Backend starts but frontend can't connect**
```bash
# Check API_BASE_URL in .env
# Should be: API_BASE_URL=http://localhost:8000

# Test backend manually:
curl http://localhost:8000/health
```

### **FAISS errors on startup**
```bash
# Delete vector database and restart
Remove-Item -Recurse -Force faiss_index
python main.py
```

### **Database errors**
```bash
# Delete SQLite database and restart
Remove-Item conversation_history.db
python main.py
```

---

## 💡 Tips

1. **Development:** Use `python main.py` for fastest startup
2. **Testing API:** Use http://localhost:8000/docs for interactive testing
3. **Monitoring:** Open admin dashboard at port 8502 while working
4. **Production:** Use Mode 2 (separate backend/frontend processes)
5. **Quick Restart:** `Ctrl+C` to stop, then `python main.py` again

---

## 📈 Recommended Workflow

```bash
# Day 1: Setup
pip install -r requirements.txt
cp .env.template .env
# Edit .env with API keys

# Day 2+: Daily Development
python main.py
# Work in browser at localhost:8501
# View analytics at localhost:8502 (if needed)

# Production Deployment
# Use Mode 2 with separate processes + nginx reverse proxy
```

---

**🎉 You're ready to launch! Run `python main.py` now.**

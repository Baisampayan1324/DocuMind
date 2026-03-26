# backend/api.py
import os
import shutil
import tempfile
import logging
import hashlib
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime

from .config import Config
from .rag_engine import ConversationalRAG
from . import models  # SQLAlchemy ORM models

logger = logging.getLogger("backend.api")
logger.setLevel(logging.INFO)

app = FastAPI(title="AI Documind RAG API")

# Allow CORS for local frontend testing; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust to specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single RAG engine instance for the app
RAG = ConversationalRAG()

# Ensure DB exists on startup
@app.on_event("startup")
def startup_event():
    models.init_db()
    logger.info("History DB initialized")
    # Create faiss dir if needed
    Path(Config.FAISS_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
    logger.info("Backend startup complete.")

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: List[Dict]
    meta: Dict[str, Any]

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class SigninRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: Dict[str, Any]
    token: str

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def _generate_token(email: str) -> str:
    return hashlib.sha256(f"{email}:{datetime.utcnow().isoformat()}".encode('utf-8')).hexdigest()

@app.get("/", response_class=HTMLResponse, summary="Basic backend test page", tags=["admin"])
def basic_test_page():
        """Serve a minimal HTML page for testing backend health without a frontend app."""
        return """
<!doctype html>
<html lang=\"en\">
<head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>DocuMind Backend Test</title>
    <style>
        body { font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f3f6fb; color: #1b2533; }
        .wrap { max-width: 760px; margin: 40px auto; background: #fff; border: 1px solid #d7e1ef; border-radius: 12px; padding: 20px; }
        h1 { margin: 0 0 8px; }
        p { margin: 0 0 14px; color: #4b5b73; }
        label { display: block; margin: 10px 0 6px; font-weight: 600; }
        input { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #c7d3e5; border-radius: 8px; }
        button { margin-top: 14px; border: 0; border-radius: 8px; padding: 10px 14px; background: #0f5dd7; color: #fff; font-weight: 700; cursor: pointer; }
        .out { margin-top: 14px; padding: 12px; border: 1px solid #d7e1ef; border-radius: 8px; background: #fbfdff; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class=\"wrap\">
        <h1>Backend Test Page</h1>
        <p>Use this basic HTML page to check if your backend endpoint is working.</p>

        <label for=\"base\">Backend URL</label>
        <input id=\"base\" value=\"http://localhost:8000\" />

        <label for=\"path\">Path</label>
        <input id=\"path\" value=\"/health\" />

        <button id=\"run\" type=\"button\">Check</button>
        <div id=\"out\" class=\"out\">No check performed yet.</div>
    </div>

    <script>
        document.getElementById('run').addEventListener('click', async function () {
            var base = document.getElementById('base').value.trim().replace(/\/+$/, '');
            var path = document.getElementById('path').value.trim();
            if (!path.startsWith('/')) path = '/' + path;
            var url = base + path;
            var out = document.getElementById('out');
            var start = performance.now();
            out.textContent = 'Checking ' + url + ' ...';

            try {
                var response = await fetch(url);
                var body = await response.text();
                var ms = Math.round(performance.now() - start);
                out.textContent =
                    'URL: ' + url + '\n' +
                    'Status: ' + response.status + '\n' +
                    'Latency: ' + ms + ' ms\n\n' +
                    'Response:\n' + body;
            } catch (err) {
                out.textContent = 'Request failed: ' + err;
            }
        });
    </script>
</body>
</html>
        """

@app.get("/health", summary="Health check", tags=["admin"])
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/init", summary="Initialize DB and storage", tags=["admin"])
def init_all():
    models.init_db()
    Path(Config.FAISS_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
    return {"status": "ok"}

@app.post("/upload", summary="Upload files and index them", tags=["docs"])
async def upload(files: List[UploadFile] = File(...)):
    """
    Upload one or more files. They are saved temporarily and passed to RAG.add_documents().
    Files are written as temp_{originalname} in the working directory.
    """
    saved_paths = []
    filenames = []
    try:
        for u in files:
            contents = await u.read()
            filename = u.filename or "unknown"
            safe_name = f"temp_{Path(filename).name}"
            path = Path(safe_name)
            with open(path, "wb") as f:
                f.write(contents)
            saved_paths.append(str(path))
            filenames.append(filename)
        
        # Add to RAG
        RAG.add_documents(saved_paths)
        
        return {
            "status": "ok",
            "files_processed": len(saved_paths),
            "filenames": filenames
        }
    except Exception as e:
        logger.exception("Upload failed: %s", e)
        raise HTTPException(status_code=500, detail="File upload/indexing failed")

@app.post("/auth/signup", response_model=AuthResponse, summary="Create user account", tags=["auth"])
def auth_signup(req: SignupRequest):
    if not req.name.strip() or not req.email.strip() or not req.password.strip():
        raise HTTPException(status_code=400, detail="Name, email and password are required")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    password_hash = _hash_password(req.password)
    created_user = models.create_user(req.name, req.email, password_hash)
    if not created_user:
        raise HTTPException(status_code=409, detail="Email is already registered")

    return {
        "user": created_user,
        "token": _generate_token(created_user['email'])
    }

@app.post("/auth/signin", response_model=AuthResponse, summary="Sign in user", tags=["auth"])
def auth_signin(req: SigninRequest):
    if not req.email.strip() or not req.password.strip():
        raise HTTPException(status_code=400, detail="Email and password are required")

    password_hash = _hash_password(req.password)
    user = models.authenticate_user(req.email, password_hash)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user": user,
        "token": _generate_token(user['email'])
    }

@app.post("/ask", response_model=AskResponse, summary="Ask a question of the indexed documents", tags=["query"])
def ask(req: AskRequest):
    """
    Ask a question. Returns answer, sources and metadata (provider, time).
    The result is saved into the conversation history DB automatically.
    """
    try:
        res = RAG.ask(req.question)
        # RAG.ask returns {"answer":..., "sources": [...], "meta": {...}}
        meta = res.get("meta") or {}
        
        # Save to database using ORM
        models.save_conversation(
            question=req.question,
            answer=res.get("answer", ""),
            sources=res.get("sources", []),
            provider=meta.get("provider", "unknown"),
            duration_s=meta.get("duration_s", 0.0),
            status=meta.get("status", "success")
        )
        
        return {
            "answer": res.get("answer", ""),
            "sources": res.get("sources", []),
            "meta": meta
        }
    except Exception as e:
        logger.exception("Ask failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to generate answer")

@app.post("/clear", summary="Clear FAISS index and history", tags=["admin"])
def clear_all():
    """Clear all documents and conversation history"""
    try:
        RAG.clear_index()
        
        # Delete all conversations using ORM
        models.delete_all_conversations()
        
        # Clean up temp files
        import glob
        for temp_file in glob.glob("temp_*"):
            try:
                Path(temp_file).unlink()
            except:
                pass
        
        return {"status": "cleared"}
    except Exception as e:
        logger.exception("Clear failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to clear index/history")

@app.get("/history", summary="List historical conversation entries", tags=["admin"])
def get_history(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    provider: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Get conversation history with optional filters
    
    Args:
        limit: Maximum number of entries (1-1000)
        offset: Number of entries to skip (pagination)
        provider: Filter by provider (optional)
        status: Filter by status (optional)
    """
    try:
        entries = models.list_conversations(
            limit=limit,
            offset=offset,
            provider=provider,
            status=status
        )
        return entries
    except Exception as e:
        logger.exception("History fetch failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to read history")

@app.get("/stats", summary="Get conversation statistics", tags=["analytics"])
def get_stats():
    """Get analytics and statistics about conversations"""
    try:
        stats = models.get_conversation_stats()
        return stats
    except Exception as e:
        logger.exception("Stats fetch failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get stats")

@app.get("/search", summary="Search conversations", tags=["admin"])
def search_conversations(q: str = Query(..., min_length=1), limit: int = Query(50, ge=1, le=500)):
    """
    Search conversations by question or answer content
    
    Args:
        q: Search term
        limit: Maximum results (1-500)
    """
    try:
        results = models.search_conversations(search_term=q, limit=limit)
        return {"count": len(results), "results": results}
    except Exception as e:
        logger.exception("Search failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to search")

@app.get("/docs", summary="List uploaded documents", tags=["docs"])
def list_uploaded_docs():
    """List files previously uploaded and stored as temp_* in app working directory."""
    try:
        docs: List[Dict[str, Any]] = []
        for item in Path('.').glob('temp_*'):
            if not item.is_file():
                continue
            stat = item.stat()
            docs.append({
                "name": item.name.replace("temp_", "", 1),
                "stored_name": item.name,
                "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "size": stat.st_size,
            })

        docs.sort(key=lambda x: x["uploaded_at"], reverse=True)
        return {"count": len(docs), "documents": docs}
    except Exception as e:
        logger.exception("List docs failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to list uploaded documents")

@app.get("/docs/download", summary="Download uploaded document", tags=["docs"])
def download_uploaded_doc(name: str = Query(..., min_length=1)):
    """Download a previously uploaded document by original filename."""
    safe_name = Path(name).name
    stored_path = Path(f"temp_{safe_name}")

    if not stored_path.exists() or not stored_path.is_file():
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(path=str(stored_path), filename=safe_name)

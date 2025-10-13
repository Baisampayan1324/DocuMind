# backend/api.py
import os
import shutil
import tempfile
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
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

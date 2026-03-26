# backend/api.py
import os
import shutil
import tempfile
import logging
import hashlib
import re
import threading
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import datetime

from .config import Config
from .rag_engine import ConversationalRAG
from . import models

logger = logging.getLogger("backend.api")
logger.setLevel(logging.INFO)

app = FastAPI(title="AI Documind RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAG = ConversationalRAG()

@app.on_event("startup")
def startup_event():
    models.init_db()
    logger.info("History DB initialized")
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


class ProviderCredential(BaseModel):
    provider: str
    key: str = ""


class ProviderSettingsUpdateRequest(BaseModel):
    api_keys: List[ProviderCredential] = Field(default_factory=list)
    provider_priority: List[str] = Field(default_factory=list)
    models: Dict[str, str] = Field(default_factory=dict)
    ollama_base_url: Optional[str] = None


_ENV_WRITE_LOCK = threading.Lock()


def _canonical_provider_name(raw_name: str) -> str:
    normalized = (raw_name or "").strip().lower()
    mapping = {
        "groq": "groq",
        "openai": "openai",
        "openrouter": "openrouter",
        "gemini": "gemini",
        "ollama": "ollama",
        "anthropic": "anthropic",
    }
    return mapping.get(normalized, normalized)


def _provider_key_env_name(provider: str) -> Optional[str]:
    mapping = {
        "groq": "GROQ_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "openai": "OPENAI_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "ollama": "OLLAMA_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY"
    }
    return mapping.get(provider)


def _provider_model_env_name(provider: str) -> Optional[str]:
    mapping = {
        "groq": "GROQ_MODEL",
        "openrouter": "OPENROUTER_MODEL",
        "openai": "OPENAI_MODEL",
        "gemini": "GEMINI_MODEL",
        "ollama": "OLLAMA_MODEL"
    }
    return mapping.get(provider)


def _update_env_file(env_updates: Dict[str, str]) -> Path:
    root = Path(__file__).resolve().parent.parent
    env_file = root / ".env"
    existing_lines: List[str] = []
    if env_file.exists():
        existing_lines = env_file.read_text(encoding="utf-8").splitlines()

    key_line_index: Dict[str, int] = {}
    key_pattern = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=")
    for idx, line in enumerate(existing_lines):
        match = key_pattern.match(line)
        if match:
            key_line_index[match.group(1)] = idx

    for key, value in env_updates.items():
        safe_value = value.replace("\n", " ").strip()
        rendered = f"{key}={safe_value}"
        if key in key_line_index:
            existing_lines[key_line_index[key]] = rendered
        else:
            existing_lines.append(rendered)

    content = "\n".join(existing_lines).rstrip() + "\n"
    env_file.write_text(content, encoding="utf-8")
    return env_file

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def _generate_token(email: str) -> str:
    return hashlib.sha256(f"{email}:{datetime.utcnow().isoformat()}".encode('utf-8')).hexdigest()


@app.post("/settings/providers", summary="Update provider keys and models", tags=["admin"])
def update_provider_settings(payload: ProviderSettingsUpdateRequest):
    """
    Dynamically update provider credentials/model config.
    - Persists values to .env
    - Updates process environment
    - Reloads Config and provider clients at runtime
    """
    env_updates: Dict[str, str] = {}
    updated_keys: List[str] = []

    for item in payload.api_keys:
        provider = _canonical_provider_name(item.provider)
        env_name = _provider_key_env_name(provider)
        if not env_name:
            continue

        if provider == "ollama" and item.key and item.key.startswith(("http://", "https://")):
            env_updates["OLLAMA_BASE_URL"] = item.key.strip()
            updated_keys.append("OLLAMA_BASE_URL")
            continue

        env_updates[env_name] = item.key.strip()
        updated_keys.append(env_name)

    if payload.ollama_base_url:
        env_updates["OLLAMA_BASE_URL"] = payload.ollama_base_url.strip()
        updated_keys.append("OLLAMA_BASE_URL")

    for raw_provider, model_name in payload.models.items():
        provider = _canonical_provider_name(raw_provider)
        env_name = _provider_model_env_name(provider)
        if not env_name:
            continue
        env_updates[env_name] = model_name.strip()
        updated_keys.append(env_name)

    if payload.provider_priority:
        canonical_priority = [_canonical_provider_name(p) for p in payload.provider_priority]
        canonical_priority = [p for p in canonical_priority if p]
        env_updates["PROVIDER_PRIORITY"] = ",".join(canonical_priority)
        updated_keys.append("PROVIDER_PRIORITY")

    if not env_updates:
        return {
            "status": "no-op",
            "message": "No supported provider settings found in payload",
            "available_providers": list(RAG.llm_provider.providers.keys())
        }

    with _ENV_WRITE_LOCK:
        env_file = _update_env_file(env_updates)
        for key, value in env_updates.items():
            os.environ[key] = value

        Config.reload_from_env()
        RAG.llm_provider.reload_providers()

    return {
        "status": "ok",
        "updated": sorted(set(updated_keys)),
        "env_file": str(env_file),
        "available_providers": list(RAG.llm_provider.providers.keys()),
        "provider_priority": Config.PROVIDER_PRIORITY
    }

@app.get("/", summary="Basic backend test page", tags=["admin"])
def basic_test_page():
    """Serve the built-in UI for upload, query, and performance checks."""
    static_index = Path(__file__).resolve().parent / "static" / "index.html"
    if not static_index.exists():
        raise HTTPException(status_code=500, detail="UI file not found")
    return FileResponse(path=str(static_index), media_type="text/html")

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

# backend/api.py
import os
import logging
import re
import threading
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import datetime

# Token counting
try:
    import tiktoken
except ImportError:
    tiktoken = None

from .config import Config
from .rag_engine import ConversationalRAG
from . import models

logger = logging.getLogger("backend.api")
logger.setLevel(logging.INFO)

app = FastAPI(title="AI Documind RAG API")

# Allow origins from env (comma-separated); fall back to * for local dev
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS: list[str] = (
    [o.strip() for o in _raw_origins.split(",") if o.strip()]
    if _raw_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """Render health-check endpoint — returns 200 when the service is ready."""
    return {"status": "ok"}


RAG = ConversationalRAG()

# ─── Token Counting Helper ───────────────────────────────────────────

def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """
    Count tokens in text using tiktoken
    Falls back to rough estimation if tiktoken unavailable
    """
    if not tiktoken:
        # Rough estimation: 1 token ≈ 4 chars
        return len(text) // 4
    
    try:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except Exception:
        # Fallback to rough estimate
        return len(text) // 4

def _upload_dir() -> Path:
    """Return the configured upload directory, creating it if needed."""
    upload_dir = Path(Config.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _migrate_legacy_temp_files() -> int:
    """
    One-time cleanup: move any stray temp_* files from the project root
    (the legacy upload location) into the new UPLOAD_DIR. Returns the count moved.
    """
    moved = 0
    root = Path(__file__).resolve().parent.parent
    dest = _upload_dir()
    for legacy in root.glob("temp_*"):
        if not legacy.is_file():
            continue
        try:
            target = dest / legacy.name
            if target.exists():
                legacy.unlink()
            else:
                legacy.replace(target)
            moved += 1
        except Exception as e:
            logger.warning("Could not migrate legacy temp file %s: %s", legacy, e)
    if moved:
        logger.info("Migrated %d legacy temp_* file(s) from project root into %s", moved, dest)
    return moved


@app.on_event("startup")
def startup_event():
    models.init_db()
    logger.info("History DB initialized")
    Path(Config.FAISS_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
    _upload_dir()
    _migrate_legacy_temp_files()
    logger.info("Backend startup complete.")

class AskRequest(BaseModel):
    question: str
    provider: Optional[str] = None

class AskResponse(BaseModel):
    answer: str
    sources: List[Dict]
    meta: Dict[str, Any]
    tokens_used: int = 0


class ConversationStatsResponse(BaseModel):
    total_conversations: int
    providers: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    statuses: Dict[str, int] = Field(default_factory=dict)


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
        # Re-run health checks immediately so the next /ask uses the fresh list.
        working_after = RAG.llm_provider.get_working_providers(force_refresh=True)

    return {
        "status": "ok",
        "updated": sorted(set(updated_keys)),
        "env_file": str(env_file),
        "available_providers": list(RAG.llm_provider.providers.keys()),
        "provider_priority": Config.PROVIDER_PRIORITY,
        "working_providers": working_after,
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
    Upload one or more files. Each file is stored under UPLOAD_DIR using its
    original filename (with path components stripped) and indexed by RAG.
    """
    saved_paths: List[str] = []
    filenames: List[str] = []
    upload_dir = _upload_dir()
    try:
        for u in files:
            contents = await u.read()
            filename = Path(u.filename or "unknown").name  # strip any path components
            target = upload_dir / filename
            with open(target, "wb") as f:
                f.write(contents)
            saved_paths.append(str(target))
            filenames.append(filename)

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
    Ask a question. Returns answer, sources, metadata, and token count.
    The result is saved into the conversation history DB automatically.
    """
    start_time = time.time()
    try:
        res = RAG.ask(req.question, provider=req.provider)
        # RAG.ask returns {"answer":..., "sources": [...], "meta": {...}}
        meta = res.get("meta") or {}

        # Count tokens for question + answer
        question_tokens = count_tokens(req.question)
        answer_tokens = count_tokens(res.get("answer", ""))
        total_tokens = question_tokens + answer_tokens

        # Calculate actual elapsed time
        elapsed_time = time.time() - start_time
        meta["duration_s"] = elapsed_time

        # Legacy data may have "temp_"-prefixed source names; strip for display.
        cleaned_sources = []
        for src in res.get("sources", []):
            cleaned_src = dict(src)
            if isinstance(cleaned_src.get("source"), str) and cleaned_src["source"].startswith("temp_"):
                cleaned_src["source"] = cleaned_src["source"].replace("temp_", "", 1)
            cleaned_sources.append(cleaned_src)

        # Save to database using ORM
        models.save_conversation(
            question=req.question,
            answer=res.get("answer", ""),
            sources=cleaned_sources,
            provider=meta.get("provider", "unknown"),
            duration_s=elapsed_time,
            status=meta.get("status", "success")
        )

        return AskResponse(
            answer=res.get("answer", ""),
            sources=cleaned_sources,
            meta=meta,
            tokens_used=total_tokens
        )
    except Exception as e:
        logger.exception("Ask failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to generate answer")

@app.post("/clear", summary="Clear FAISS index and history", tags=["admin"])
def clear_all():
    """Clear all documents and conversation history"""
    try:
        RAG.clear_index()
        models.delete_all_conversations()

        # Remove every uploaded file from the upload directory.
        upload_dir = _upload_dir()
        for item in upload_dir.iterdir():
            if item.is_file():
                try:
                    item.unlink()
                except Exception:
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

@app.get("/stats", response_model=ConversationStatsResponse, summary="Get conversation statistics", tags=["analytics"])
def get_stats():
    """Get analytics and statistics about conversations"""
    try:
        stats = models.get_conversation_stats()
        return ConversationStatsResponse(
            total_conversations=stats.get('total_conversations', 0),
            providers=stats.get('providers', {}),
            statuses=stats.get('statuses', {})
        )
    except Exception as e:
        logger.exception("Stats fetch failed: %s", e)
        # Return empty stats instead of error to prevent JSON parsing issues
        return ConversationStatsResponse(
            total_conversations=0,
            providers={},
            statuses={}
        )

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

@app.get("/documents", summary="List uploaded documents", tags=["docs"])
def list_uploaded_docs():
    """List files stored in the upload directory."""
    try:
        docs: List[Dict[str, Any]] = []
        upload_dir = _upload_dir()
        for item in upload_dir.iterdir():
            if not item.is_file():
                continue
            stat = item.stat()
            docs.append({
                "name": item.name,
                "stored_name": item.name,
                "uploaded_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "size": stat.st_size,
            })

        docs.sort(key=lambda x: x["uploaded_at"], reverse=True)
        return {"count": len(docs), "documents": docs}
    except Exception as e:
        logger.exception("List docs failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to list uploaded documents")

@app.get("/documents/download", summary="Download uploaded document", tags=["docs"])
def download_uploaded_doc(name: str = Query(..., min_length=1)):
    """Download a previously uploaded document by its original filename."""
    safe_name = Path(name).name
    upload_dir = _upload_dir()
    stored_path = upload_dir / safe_name

    if not stored_path.exists() or not stored_path.is_file():
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(path=str(stored_path), filename=safe_name)


@app.get("/providers", summary="List available AI providers and status", tags=["admin"])
def list_providers():
    """Returns a list of all providers configured and their health status."""
    return RAG.llm_provider.get_working_providers()

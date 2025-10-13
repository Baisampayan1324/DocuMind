"""
backend/config.py
Central configuration with .env overrides and type-safe parsing
"""
import os
import logging
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

def _get_int_env(name: str, default: int) -> int:
    val = os.getenv(name)
    if val is None or str(val).strip() == "":
        return default
    try:
        return int(val)
    except (TypeError, ValueError):
        # Fall back to default on bad input
        logger.warning(f"Invalid int for {name}='{val}', using default {default}")
        return default

def _parse_provider_priority(val: Optional[str]) -> List[str]:
    if not val:
        return []
    # Accept comma separated values, strip whitespace and ignore empties
    parts = [p.strip().lower() for p in val.split(",") if p.strip()]
    return parts

class Config:
    # API Keys - Load from environment variables for security
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # None if not set
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")  # None if not set
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Optional

    # Models - Env override with defaults
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-8b-instruct:free")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Chunking (type-safe from env)
    CHUNK_SIZE = _get_int_env("CHUNK_SIZE", 1000)
    CHUNK_OVERLAP = _get_int_env("CHUNK_OVERLAP", 200)

    # Retrieval (type-safe)
    TOP_K_CHUNKS = _get_int_env("TOP_K_CHUNKS", 4)

    # Embedding
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

    # FAISS index storage
    FAISS_PERSIST_DIR = os.getenv("FAISS_PERSIST_DIR", "data/faiss_index")

    # Persistence toggle - Enable/disable FAISS index saving
    PERSIST_FAISS = os.getenv("PERSIST_FAISS", "false").lower() == "true"

    # Provider priority (comma-separated), e.g. "groq,openrouter,openai"
    PROVIDER_PRIORITY = _parse_provider_priority(os.getenv("PROVIDER_PRIORITY", "groq,openrouter,openai"))

    # History database path
    HISTORY_DB_PATH = os.getenv("HISTORY_DB_PATH", "data/conversation_history.db")


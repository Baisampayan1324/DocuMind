# ── HuggingFace Spaces — DocuMind Backend ────────────────────────────────────
# Docker Space running FastAPI on port 7860 (HF Spaces default).
# Free CPU tier: 2 vCPU · 16 GB RAM → enough for torch + sentence-transformers.
# Follows HF Spaces Docker guidelines: non-root user uid 1000.

FROM python:3.11-slim

# System deps for faiss-cpu, lxml, python-docx, python-pptx
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces requires a non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# ── Install Python dependencies ──────────────────────────────────────────────
COPY --chown=user requirements.txt requirements.txt

# CPU-only torch saves ~1.5 GB image size; HF Spaces CPU tier has no GPU
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# ── Copy application source ───────────────────────────────────────────────────
COPY --chown=user backend/ ./backend/
COPY --chown=user main.py .

# ── Runtime env defaults (override via HF Space Secrets) ─────────────────────
ENV PYTHONUNBUFFERED=1 \
    EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2 \
    CHUNK_SIZE=1000 \
    CHUNK_OVERLAP=200 \
    TOP_K=4 \
    PERSIST_FAISS=false \
    FAISS_PERSIST_DIR=/tmp/faiss_index \
    HISTORY_DB_PATH=/tmp/conversation_history.db \
    PROVIDER_PRIORITY=groq,openrouter,openai,gemini,ollama

# HF Spaces listens on 7860
EXPOSE 7860

CMD ["python", "-m", "uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "7860"]

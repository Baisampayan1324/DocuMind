# backend/rag_engine.py
import logging
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate

from .config import Config
from .doc_loader import UniversalDocLoader
from .llm_provider import LLMProvider

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ConversationalRAG:
    def __init__(self):
        # initialize embeddings using configurable model
        self.embeddings = self._initialize_embeddings()
        self.vectorstore: Optional[FAISS] = None
        self.llm_provider = LLMProvider()
        self.history: List[Dict] = []

        # If persistence enabled, load index; otherwise run cleanup
        if Config.PERSIST_FAISS:
            self._load_faiss_index()
        else:
            self._cleanup_on_startup()

    def _initialize_embeddings(self):
        """Initialize embeddings with fallback; uses Config.EMBEDDING_MODEL."""
        model_name = getattr(Config, "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        try:
            return HuggingFaceEmbeddings(
                model_name=model_name,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": False}
            )
        except Exception as e:
            logger.warning("Embeddings init (with device) failed: %s. Trying simpler init.", e)
            try:
                return HuggingFaceEmbeddings(model_name=model_name)
            except Exception as e2:
                logger.error("Embeddings init failed entirely: %s", e2)
                raise

    def _cleanup_on_startup(self):
        """Remove temp files and non-persistent index files (only used when not persisting)."""
        import os
        import glob
        import shutil

        path = Path(Config.FAISS_PERSIST_DIR)
        if path.exists() and not Config.PERSIST_FAISS:
            try:
                shutil.rmtree(path)
                logger.info("Removed existing FAISS index on startup (fresh start).")
            except Exception as e:
                logger.warning("Could not remove FAISS index: %s", e)

        # Clean up temp files
        for temp_file in glob.glob("temp_*"):
            try:
                os.remove(temp_file)
                logger.info("Removed leftover temporary file: %s", temp_file)
            except Exception as e:
                logger.debug("Could not remove %s: %s", temp_file, e)

    def _load_faiss_index(self):
        if not Config.PERSIST_FAISS:
            return
        try:
            index_path = Path(Config.FAISS_PERSIST_DIR)
            if index_path.exists():
                self.vectorstore = FAISS.load_local(str(index_path), self.embeddings, allow_dangerous_deserialization=True)
                logger.info("Loaded FAISS index from %s", index_path)
        except Exception as e:
            logger.warning("Failed to load FAISS index: %s", e)

    def _save_faiss_index(self):
        if not Config.PERSIST_FAISS or not self.vectorstore:
            return
        try:
            index_path = Path(Config.FAISS_PERSIST_DIR)
            index_path.mkdir(parents=True, exist_ok=True)
            self.vectorstore.save_local(str(index_path))
            logger.info("Saved FAISS index to %s", index_path)
        except Exception as e:
            logger.warning("Could not save FAISS index: %s", e)

    def add_documents(self, file_paths: List[str]):
        all_chunks = []
        for f in file_paths:
            try:
                file_path = Path(f)
                file_ext = file_path.suffix.lower()

                if file_ext == ".pdf":
                    chunks = UniversalDocLoader.chunk_pdf_by_pages(f, {"source": file_path.name})
                else:
                    raw = UniversalDocLoader.load_document(f)
                    clean = UniversalDocLoader.clean_text(raw)
                    chunks = UniversalDocLoader.chunk_text(clean, {"source": file_path.name})

                all_chunks.extend(chunks)
                logger.info("%s -> %d chunks", f, len(chunks))
            except Exception as e:
                logger.error("Error loading %s: %s", f, e)

        if not all_chunks:
            return

        if not self.vectorstore:
            self.vectorstore = FAISS.from_documents(all_chunks, self.embeddings)
        else:
            self.vectorstore.add_documents(all_chunks)

        # Save index if configured
        self._save_faiss_index()

    def ask(self, question: str) -> Dict:
        if not self.vectorstore:
            return {"answer": "No documents loaded.", "sources": []}

        start_ts = datetime.utcnow()
        docs = self.vectorstore.similarity_search(question, k=Config.TOP_K_CHUNKS)

        # Build context + citations
        context_parts = []
        citations = []
        for i, d in enumerate(docs, 1):
            chunk_id = d.metadata.get("chunk_id", str(i))
            source = d.metadata.get("source", "unknown")
            page_number = d.metadata.get("page_number")
            
            # Create citation as dictionary for API compatibility
            citation_dict = {
                "source": source,
                "page": page_number if page_number else None,
                "chunk_id": chunk_id
            }
            citations.append(citation_dict)
            
            # Create citation string for context
            if page_number:
                citation_str = f"[{source}, page {page_number}, chunk {chunk_id}]"
            else:
                citation_str = f"[{source}, chunk {chunk_id}]"
            context_parts.append(f"{d.page_content}\n(Citation: {citation_str})")

        context = "\n\n".join(context_parts)

        # Get provider priority list of working providers
        working_providers = self.llm_provider.get_working_providers()
        if not working_providers:
            # No working providers; return friendly message and log
            logger.error("No working LLM providers available.")
            return {"answer": "No LLM providers are available. Please check your API keys and configuration.", "sources": citations}

        # Execute fusion or single-provider answer respecting provider priority
        answer, chosen_provider, duration_s = self._get_answer_with_priority(context, question, working_providers)

        # Save richer history
        entry = {
            "timestamp": start_ts.isoformat() + "Z",
            "q": question,
            "a": answer,
            "sources": citations,
            "provider": chosen_provider,
            "duration_s": duration_s,
            "status": "ok" if not answer.startswith("[") else "error"
        }
        self.history.append(entry)

        return {"answer": answer, "sources": citations, "meta": entry}

    def _get_answer_with_priority(self, context: str, question: str, providers: List[str]):
        """
        Try to get a combined answer using available providers in priority order.
        - If multiple providers available (first two), attempt parallel fusion.
        - Otherwise fall back to the first available provider.
        Returns (answer, chosen_provider, duration_seconds).
        """
        start = datetime.utcnow()
        chosen = None
        try:
            # If at least two providers are available, attempt parallel fetch then fusion
            if len(providers) >= 2:
                p1, p2 = providers[0], providers[1]
                logger.debug("Attempting parallel calls to %s and %s", p1, p2)
                with ThreadPoolExecutor(max_workers=2) as ex:
                    futures = {
                        ex.submit(self._get_single_llm_answer, context, question, p): p
                        for p in (p1, p2)
                    }
                    results = {}
                    for fut in as_completed(futures):
                        prov = futures[fut]
                        try:
                            results[prov] = fut.result()
                        except Exception as e:
                            logger.warning("Provider %s call raised: %s", prov, e)
                            results[prov] = ""

                a1 = results.get(p1, "")
                a2 = results.get(p2, "")

                valid1 = a1 and not a1.startswith("[") and "rate limit" not in a1.lower()
                valid2 = a2 and not a2.startswith("[") and "rate limit" not in a2.lower()

                if valid1 and valid2:
                    # Combine using first available combiner (prefer p1)
                    combiner = p1 if p1 in self.llm_provider.providers else p2
                    combined = self._combine_answers(a1, a2, question, combiner)
                    chosen = f"fusion:{p1}+{p2}"
                    dur = (datetime.utcnow() - start).total_seconds()
                    logger.info("Fusion successful (%s) in %.2fs", chosen, dur)
                    return combined, chosen, dur

                # Smart cascade: prefer first valid
                if valid1:
                    chosen = p1
                    dur = (datetime.utcnow() - start).total_seconds()
                    logger.info("Using provider %s (cascade)", p1)
                    return a1, chosen, dur
                if valid2:
                    chosen = p2
                    dur = (datetime.utcnow() - start).total_seconds()
                    logger.info("Using provider %s (cascade)", p2)
                    return a2, chosen, dur

                # If neither valid, try remaining providers in order (if any)
                for p in providers[2:]:
                    ans = self._get_single_llm_answer(context, question, p)
                    if ans and not ans.startswith("[") and "rate limit" not in ans.lower():
                        chosen = p
                        dur = (datetime.utcnow() - start).total_seconds()
                        logger.info("Using provider %s (fallback)", p)
                        return ans, chosen, dur

                # If all failed, return aggregated error messages
                dur = (datetime.utcnow() - start).total_seconds()
                aggregated = []
                for p, val in results.items():
                    if val:
                        aggregated.append(f"{p}: {val}")
                return ("API Error(s): " + "; ".join(aggregated)) if aggregated else ("No valid responses from providers."), "none", dur

            else:
                # Single provider available
                p = providers[0]
                ans = self._get_single_llm_answer(context, question, p)
                dur = (datetime.utcnow() - start).total_seconds()
                chosen = p
                logger.info("Using single provider %s in %.2fs", p, dur)
                return ans, chosen, dur

        except Exception as e:
            dur = (datetime.utcnow() - start).total_seconds()
            logger.error("Error in _get_answer_with_priority: %s", e)
            return f"System error: {str(e)[:200]}", "error", dur

    def _get_single_llm_answer(self, context: str, question: str, provider: str) -> str:
        """Get answer from a single LLM provider with robust error handling"""
        try:
            llm = self.llm_provider.get_llm(provider)
            prompt = PromptTemplate(
                input_variables=["context", "question"],
                template=(
                    "Use the following context to answer the question.\n"
                    "Always cite the sources at the end of your answer using the given citations.\n\n"
                    "Context:\n{context}\n\nQuestion: {question}\nAnswer:"
                )
            )

            # Use modern invoke() instead of deprecated run()
            from langchain_core.runnables import RunnableSequence
            chain = prompt | llm
            response = chain.invoke({"context": context, "question": question})

            # Handle different response formats
            if hasattr(response, 'content'):
                answer = response.content
            else:
                answer = str(response)

            return answer.strip()
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"{provider} failed: {error_msg}")

            # Check for specific error types
            if "403" in error_msg or "Forbidden" in error_msg:
                logger.error(f"{provider} API key may be invalid or expired")
                return f"[{provider.upper()} API authentication failed - please check API key]"
            elif "401" in error_msg or "Unauthorized" in error_msg:
                logger.error(f"{provider} API key unauthorized")
                return f"[{provider.upper()} API key unauthorized]"
            elif "429" in error_msg or "rate limit" in error_msg.lower():
                logger.error(f"{provider} rate limit exceeded")
                return f"[{provider.upper()} rate limit exceeded]"
            else:
                return f"[{provider.upper()} error: {error_msg[:100]}]"

    def _combine_answers(self, a1: str, a2: str, question: str, combiner_provider: str) -> str:
        """
        Combine two answers using the combiner_provider (prefer combiner_provider).
        If combiner fails, fallback to a1.
        """
        try:
            combiner_llm = self.llm_provider.get_llm(combiner_provider)
            fusion_prompt = PromptTemplate(
                input_variables=["question", "answer1", "answer2"],
                template=(
                    "You are an expert at combining multiple AI responses into one optimal answer.\n"
                    "Given the question and two different AI responses, create the best possible combined answer.\n\n"
                    "Question: {question}\n\n"
                    "Response 1: {answer1}\n\n"
                    "Response 2: {answer2}\n\n"
                    "Combined Optimal Answer (keep all citations, be comprehensive but concise):"
                )
            )
            chain = fusion_prompt | combiner_llm
            res = chain.invoke({"question": question, "answer1": a1, "answer2": a2})
            return getattr(res, "content", str(res)).strip()
        except Exception as e:
            logger.warning("Fusion using %s failed: %s - returning first answer", combiner_provider, e)
            return a1

    def clear_index(self):
        """Clear FAISS index, conversation history, and temporary files"""
        import os
        import glob
        import shutil

        self.vectorstore = None
        self.history = []

        path = Path(Config.FAISS_PERSIST_DIR)
        if path.exists():
            try:
                shutil.rmtree(path)
                logger.info("Removed FAISS index from disk")
            except Exception as e:
                logger.warning("Could not remove FAISS index: %s", e)

        for temp_file in glob.glob("temp_*"):
            try:
                os.remove(temp_file)
                logger.info("Removed temporary file: %s", temp_file)
            except Exception as e:
                logger.warning("Could not remove %s: %s", temp_file, e)

        logger.info("Cleared index, history, and temporary files")

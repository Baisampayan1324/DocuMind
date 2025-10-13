# Phase 2 Quick Action Checklist

## ✅ Already Complete (Can Skip)

- [x] Provider orchestration with priority logic
- [x] Multi-LLM intelligent fusion (parallel processing)
- [x] Enriched history tracking (question, answer, sources, provider, timestamp)
- [x] Comprehensive logging (provider selection, response times, errors)
- [x] Security (env-based API keys)
- [x] FAISS persistence toggle
- [x] Model configuration via .env
- [x] Error categorization (401, 403, 429)
- [x] Graceful fallbacks
- [x] Citation tracking with page numbers

---

## 🚀 Quick Wins (Do Today - 1 hour)

### 1. Provider Priority Config (30 min)
**File:** `backend/config.py`
```python
# Add after line 33
PROVIDER_PRIORITY = os.getenv("PROVIDER_PRIORITY", "groq,openrouter,openai").split(",")
```

**File:** `backend/rag_engine.py`
```python
# Replace line 178
provider_priority = Config.PROVIDER_PRIORITY
```

**File:** `.env.template`
```dotenv
# Add after OPENROUTER_MODEL
PROVIDER_PRIORITY=groq,openrouter,openai
```

**Test:**
```powershell
python -c "from backend.config import Config; print(Config.PROVIDER_PRIORITY)"
```

---

### 2. Export History Method (15 min)
**File:** `backend/rag_engine.py`

Add after `clear_index()` method:
```python
def export_history(self, filepath: str = "conversation_history.json") -> str:
    """Export conversation history to JSON file"""
    import json
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(self.history, f, indent=2)
    logger.info(f"History exported to {filepath}")
    return filepath

def import_history(self, filepath: str):
    """Import conversation history from JSON file"""
    import json
    with open(filepath, 'r', encoding='utf-8') as f:
        self.history = json.load(f)
    logger.info(f"History imported from {filepath}")
```

**Test:**
```python
rag.export_history("test_history.json")
```

---

### 3. Index Stats Method (20 min)
**File:** `backend/rag_engine.py`

Add after `clear_index()` method:
```python
def get_stats(self) -> Dict:
    """Get comprehensive RAG system statistics"""
    stats = {
        "system": {
            "vectorstore_loaded": self.vectorstore is not None,
            "persist_enabled": Config.PERSIST_FAISS,
            "embedding_model": Config.EMBEDDING_MODEL
        },
        "providers": {
            "available": list(self.llm_provider.providers.keys()),
            "priority": ["groq", "openrouter", "openai"]  # Or Config.PROVIDER_PRIORITY
        },
        "conversations": {
            "total": len(self.history),
            "last_query": self.history[-1]["timestamp"] if self.history else None
        },
        "index": {}
    }
    
    if self.vectorstore:
        try:
            stats["index"] = {
                "total_vectors": self.vectorstore.index.ntotal,
                "dimension": self.vectorstore.index.d
            }
        except:
            stats["index"] = {"status": "unavailable"}
    
    return stats
```

**Test:**
```python
import json
print(json.dumps(rag.get_stats(), indent=2))
```

---

## 📋 High Impact Features (Do This Week - 16 hours)

### 4. Multi-Turn Context (4 hours)

**File:** `backend/rag_engine.py`

Update `ask()` method signature:
```python
def ask(self, question: str, use_history: bool = False, max_history: int = 3) -> Dict:
```

Add after line 142 (before retrieving documents):
```python
# Build conversation context if requested
conversation_context = ""
if use_history and len(self.history) > 0:
    recent_history = self.history[-max_history:]
    context_parts = []
    for entry in recent_history:
        context_parts.append(f"Previous Q: {entry['question']}")
        context_parts.append(f"Previous A: {entry['answer'][:200]}...")
    conversation_context = "\n".join(context_parts) + "\n\n"
```

Update prompt to include history:
```python
# In _get_single_llm_answer, update template
template = (
    "{conversation_context}"
    "Use the following context to answer the question.\n"
    "Always cite the sources at the end of your answer using the given citations.\n\n"
    "Context:\n{context}\n\nQuestion: {question}\nAnswer:"
)
```

**Test:**
```python
rag.add_documents(["doc.pdf"])
r1 = rag.ask("What is AI?")
r2 = rag.ask("Can you elaborate?", use_history=True)  # Uses previous context
```

---

### 5. Index Management Methods (4 hours)

**File:** `backend/rag_engine.py`

Add tracking in `__init__`:
```python
def __init__(self):
    # ... existing code ...
    self.document_metadata = {}  # Track loaded documents
```

Update `add_documents()` to track metadata:
```python
def add_documents(self, file_paths: List[str]):
    all_chunks = []
    for f in file_paths:
        try:
            file_path = Path(f)
            # ... existing code ...
            
            all_chunks.extend(chunks)
            
            # Track metadata
            self.document_metadata[file_path.name] = {
                "path": str(file_path),
                "chunks": len(chunks),
                "added_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"{f} → {len(chunks)} chunks")
```

Add new methods:
```python
def list_documents(self) -> List[Dict]:
    """List all loaded documents with metadata"""
    return [
        {
            "filename": name,
            "chunks": meta["chunks"],
            "added_at": meta["added_at"],
            "path": meta["path"]
        }
        for name, meta in self.document_metadata.items()
    ]

def remove_document(self, filename: str) -> bool:
    """Remove a specific document from the index (requires rebuild)"""
    if filename not in self.document_metadata:
        logger.warning(f"Document {filename} not found in index")
        return False
    
    # For now, removing requires clearing and rebuilding
    # TODO: Implement selective removal
    logger.warning("Removing specific documents requires index rebuild")
    return False

def get_index_info(self) -> Dict:
    """Get detailed index information"""
    if not self.vectorstore:
        return {"status": "no_index"}
    
    return {
        "status": "loaded",
        "total_vectors": self.vectorstore.index.ntotal,
        "embedding_dimension": self.vectorstore.index.d,
        "total_documents": len(self.document_metadata),
        "documents": self.list_documents(),
        "persistence_enabled": Config.PERSIST_FAISS,
        "persist_dir": Config.FAISS_PERSIST_DIR
    }
```

**Test:**
```python
rag.add_documents(["doc1.pdf", "doc2.txt"])
print(rag.list_documents())
print(rag.get_index_info())
```

---

### 6. Advanced Prompt Templates (3 hours)

**File:** `backend/prompts.py` (NEW FILE)

```python
"""
Prompt templates for RAG system
Role-based prompts for consistent, high-quality responses
"""

class PromptTemplates:
    """Centralized prompt template management"""
    
    ANSWER_GENERATOR = """You are an expert research assistant helping users understand documents.

YOUR ROLE:
- Answer questions accurately using ONLY the provided context
- Always cite sources using the exact citation format provided
- Be concise yet comprehensive
- If information is not in the context, explicitly state that

RULES:
1. Base your answer ONLY on the context - do not use external knowledge
2. Include inline citations for every factual claim using this format: [Source Name, page X, chunk Y]
3. If the context doesn't contain enough information, say: "I cannot find sufficient information about [topic] in the provided documents."
4. Maintain a professional, helpful tone

Context:
{context}

Question: {question}

Answer (with inline citations):"""

    ANSWER_GENERATOR_WITH_HISTORY = """You are an expert research assistant helping users understand documents.

CONVERSATION HISTORY:
{conversation_context}

CURRENT CONTEXT:
{context}

YOUR ROLE:
- Consider previous conversation for context
- Answer the current question using the provided context
- Maintain conversation coherence
- Always cite sources

Question: {question}

Answer (with inline citations):"""

    FUSION_COMBINER = """You are an expert at synthesizing multiple AI responses into one optimal answer.

TASK: Combine the two responses below into the best possible answer.

RULES:
1. Preserve ALL citations from both responses
2. Eliminate redundancy and contradictions
3. Maintain a natural, coherent flow
4. Prioritize accuracy and completeness

Question: {question}

Response 1 (Primary):
{answer1}

Response 2 (Secondary):
{answer2}

Combined Optimal Answer (comprehensive, well-cited, concise):"""

    SUMMARIZER = """You are a document summarization expert.

Create a concise, informative summary of the following content.

RULES:
1. Capture key points and main ideas
2. Maintain factual accuracy
3. Be concise (3-5 sentences)
4. Preserve critical details

Content:
{content}

Summary:"""

    CITATION_VALIDATOR = """Review this answer and ensure proper citation formatting.

TASK: Check that all factual claims have citations in the format: [Source, page X, chunk Y]

Original Answer:
{answer}

Available Citations:
{citations}

Validated Answer (with corrected citations):"""
```

**File:** `backend/rag_engine.py`

Update imports:
```python
from .prompts import PromptTemplates
```

Update `_get_single_llm_answer()`:
```python
def _get_single_llm_answer(
    self, 
    context: str, 
    question: str, 
    provider: str,
    conversation_context: str = ""
) -> str:
    """Get answer from a single LLM provider with robust error handling"""
    try:
        llm = self.llm_provider.get_llm(provider)
        
        # Choose template based on whether we have conversation history
        if conversation_context:
            template = PromptTemplates.ANSWER_GENERATOR_WITH_HISTORY
            prompt = PromptTemplate(
                input_variables=["conversation_context", "context", "question"],
                template=template
            )
            input_vars = {
                "conversation_context": conversation_context,
                "context": context,
                "question": question
            }
        else:
            template = PromptTemplates.ANSWER_GENERATOR
            prompt = PromptTemplate(
                input_variables=["context", "question"],
                template=template
            )
            input_vars = {
                "context": context,
                "question": question
            }
        
        # Use modern invoke() instead of deprecated run()
        chain = prompt | llm
        response = chain.invoke(input_vars)
        
        # ... rest of existing code ...
```

Update `_combine_answers()`:
```python
def _combine_answers(self, groq_answer: str, openrouter_answer: str, question: str) -> str:
    """Intelligently combine two answers using AI fusion"""
    try:
        combiner_llm = self.llm_provider.get_llm("groq")
        
        fusion_prompt = PromptTemplate(
            input_variables=["question", "answer1", "answer2"],
            template=PromptTemplates.FUSION_COMBINER
        )
        
        # ... rest of existing code ...
```

**Test:**
```python
# Prompts are automatically used in ask() method
result = rag.ask("What is machine learning?")
# Should have better citation quality and consistency
```

---

### 7. Hybrid Retrieval (8 hours)

**File:** `backend/requirements.txt`

Add:
```
rank_bm25
```

**File:** `backend/rag_engine.py`

Add imports:
```python
from rank_bm25 import BM25Okapi
import numpy as np
```

Add to `__init__`:
```python
def __init__(self):
    # ... existing code ...
    self.bm25_index = None
    self.all_documents = []  # Store for BM25
```

Update `add_documents()`:
```python
def add_documents(self, file_paths: List[str]):
    all_chunks = []
    for f in file_paths:
        # ... existing code ...
        all_chunks.extend(chunks)
    
    if not all_chunks:
        return
    
    # Store all documents for BM25
    self.all_documents.extend(all_chunks)
    
    # Build BM25 index
    tokenized_docs = [doc.page_content.lower().split() for doc in self.all_documents]
    self.bm25_index = BM25Okapi(tokenized_docs)
    
    # ... existing FAISS code ...
```

Add hybrid retrieval method:
```python
def _hybrid_search(self, question: str, k: int = None) -> List:
    """
    Hybrid search combining semantic (FAISS) and keyword (BM25) retrieval
    
    Args:
        question: Query string
        k: Number of results (default: Config.TOP_K_CHUNKS)
    
    Returns:
        List of documents sorted by combined score
    """
    if k is None:
        k = Config.TOP_K_CHUNKS
    
    # Get semantic results from FAISS
    semantic_docs = self.vectorstore.similarity_search_with_score(question, k=k*2)
    
    # Get keyword results from BM25
    tokenized_query = question.lower().split()
    bm25_scores = self.bm25_index.get_scores(tokenized_query)
    
    # Get top k BM25 results
    top_bm25_indices = np.argsort(bm25_scores)[::-1][:k*2]
    
    # Combine scores (normalize to 0-1 range)
    doc_scores = {}
    
    # Add semantic scores (already normalized by FAISS distance)
    for doc, score in semantic_docs:
        doc_id = id(doc)
        # Convert distance to similarity (lower distance = higher similarity)
        similarity = 1 / (1 + score)
        doc_scores[doc_id] = {
            'doc': doc,
            'semantic': similarity * 0.7,  # 70% weight
            'keyword': 0
        }
    
    # Add BM25 scores
    max_bm25 = max(bm25_scores) if max(bm25_scores) > 0 else 1
    for idx in top_bm25_indices:
        doc = self.all_documents[idx]
        doc_id = id(doc)
        normalized_bm25 = bm25_scores[idx] / max_bm25
        
        if doc_id in doc_scores:
            doc_scores[doc_id]['keyword'] = normalized_bm25 * 0.3  # 30% weight
        else:
            doc_scores[doc_id] = {
                'doc': doc,
                'semantic': 0,
                'keyword': normalized_bm25 * 0.3
            }
    
    # Calculate combined scores and sort
    ranked_docs = []
    for doc_id, scores in doc_scores.items():
        combined_score = scores['semantic'] + scores['keyword']
        ranked_docs.append((scores['doc'], combined_score))
    
    ranked_docs.sort(key=lambda x: x[1], reverse=True)
    
    # Return top k documents
    return [doc for doc, score in ranked_docs[:k]]
```

Update `ask()` to use hybrid search:
```python
def ask(self, question: str, use_hybrid: bool = True) -> Dict:
    if not self.vectorstore:
        return {...}
    
    # Use hybrid search if enabled and BM25 index exists
    if use_hybrid and self.bm25_index:
        docs = self._hybrid_search(question, k=Config.TOP_K_CHUNKS)
        logger.info("Using hybrid retrieval (semantic + keyword)")
    else:
        docs = self.vectorstore.similarity_search(question, k=Config.TOP_K_CHUNKS)
        logger.info("Using pure semantic retrieval")
    
    # ... rest of existing code ...
```

**Test:**
```python
rag.add_documents(["doc.pdf"])
result = rag.ask("machine learning", use_hybrid=True)
# Should retrieve better results for keyword-heavy queries
```

---

## 📊 Progress Tracking

Update this checklist as you complete items:

- [ ] Provider priority config (.env)
- [ ] Export/import history methods
- [ ] Index stats method
- [ ] Multi-turn context support
- [ ] Document tracking metadata
- [ ] List/remove/info methods
- [ ] Advanced prompt templates (prompts.py)
- [ ] Hybrid retrieval (BM25 + FAISS)

---

## 🧪 Testing After Each Change

```powershell
# Test imports
python -c "from backend.rag_engine import ConversationalRAG; print('OK')"

# Run comprehensive test
python test_refactored_ask.py

# Check for errors
python -m py_compile backend\rag_engine.py
python -m py_compile backend\prompts.py
```

---

## 📝 Notes

- Install rank_bm25: `pip install rank-bm25`
- Backup your code before major changes
- Test each feature independently
- Update .env.template with new variables
- Document changes in CHANGELOG.md

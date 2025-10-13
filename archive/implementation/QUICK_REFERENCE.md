# Quick Reference: Refactored ask() Method

## New Return Format

```python
result = rag.ask("What is cloud computing?")

# Available fields:
result["answer"]      # str - The generated answer
result["sources"]     # List[str] - Citations like "[doc.pdf, page 1, chunk 1]"
result["provider"]    # str - Provider used (e.g., "groq+openrouter", "groq", None)
result["timestamp"]   # str - ISO 8601 timestamp "2025-10-02T18:49:29.333756"
```

## Provider Values

| Value | Meaning |
|-------|---------|
| `"groq"` | Single provider (Groq only) |
| `"openrouter"` | Single provider (OpenRouter only) |
| `"openai"` | Single provider (OpenAI only) |
| `"groq+openrouter"` | Intelligent fusion of both |
| `"openrouter+openai"` | Fusion of these two |
| `None` | No provider available (error state) |

## History Structure

```python
rag.history[0] = {
    "question": "What is cloud computing?",
    "answer": "Cloud computing is...",
    "sources": ["[doc.pdf, page 1, chunk 1]", ...],
    "provider": "groq+openrouter",
    "timestamp": "2025-10-02T18:49:29.333756"
}
```

## Provider Priority

Current order:
1. **Groq** (fastest, primary)
2. **OpenRouter** (free tier Llama 3.3)
3. **OpenAI** (fallback)

## Code Examples

### Display Provider in UI

```python
result = rag.ask(question)
st.write(result["answer"])
st.caption(f"🤖 Provider: {result['provider']} | ⏰ {result['timestamp']}")
```

### Filter History by Provider

```python
groq_queries = [h for h in rag.history if h["provider"] == "groq"]
fusion_queries = [h for h in rag.history if "+" in h.get("provider", "")]
```

### Export History

```python
import json
with open("history.json", "w") as f:
    json.dump(rag.history, f, indent=2)
```

### Count Provider Usage

```python
from collections import Counter
provider_counts = Counter(h["provider"] for h in rag.history)
print(provider_counts)
# Output: Counter({'groq+openrouter': 5, 'groq': 2, 'openrouter': 1})
```

## Logging Output

```
INFO - ✅ Question answered using provider: groq+openrouter
INFO - ✨ Intelligent Fusion (groq+openrouter) completed in 2.34s
INFO - ✅ GROQ response used (fallback) in 1.12s
INFO - 🎯 Using single available provider: groq
```

## Error Handling

```python
result = rag.ask("What is AI?")

if result["provider"] is None:
    print("⚠️ No providers available!")
    print(f"Error: {result['answer']}")
else:
    print(f"✅ Answer from {result['provider']}")
```

## Common Patterns

### Check if Fusion Happened

```python
is_fusion = "+" in result.get("provider", "")
if is_fusion:
    print("Used multiple AI models for better quality!")
```

### Track Response Times

```python
from datetime import datetime

start = datetime.utcnow()
result = rag.ask("question")
end = datetime.utcnow()

print(f"Total time: {(end - start).total_seconds():.2f}s")
print(f"Provider: {result['provider']}")
```

### Audit Trail

```python
# Generate audit report
print("=== RAG Session Audit ===")
for i, h in enumerate(rag.history, 1):
    print(f"\n{i}. {h['timestamp']}")
    print(f"   Q: {h['question'][:50]}...")
    print(f"   Provider: {h['provider']}")
    print(f"   Citations: {len(h['sources'])}")
```

## Migration from Old Code

```python
# Old code (still works!)
result = rag.ask("question")
answer = result["answer"]

# New code (recommended)
result = rag.ask("question")
answer = result["answer"]
provider = result["provider"]  # New!
timestamp = result["timestamp"]  # New!
```

## Testing

```powershell
# Run the refactoring test
python test_refactored_ask.py

# Expected: All checks pass
```

## Troubleshooting

| Issue | Check |
|-------|-------|
| Provider always None | Verify .env has API keys |
| Always same provider | Check other providers' API keys |
| No timestamp | Check datetime import |
| Empty history | History is in-memory (not persisted) |

## Future: Make Priority Configurable

Add to `.env`:
```dotenv
PROVIDER_PRIORITY=openrouter,groq,openai
```

Then update code to read from config.

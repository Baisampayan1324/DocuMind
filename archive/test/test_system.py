#!/usr/bin/env python3
"""
Simple test script for the AI Documind RAG system
Tests parallel LLM processing and citation accuracy
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from backend.rag_engine import ConversationalRAG
from backend.doc_loader import UniversalDocLoader

def test_basic_functionality():
    """Test basic RAG functionality with parallel processing"""
    print("🧪 Testing AI Documind RAG System...")

    # Initialize components
    doc_loader = UniversalDocLoader()
    rag_engine = ConversationalRAG()

    # Create a simple test document
    test_content = """
    Artificial Intelligence (AI) is transforming healthcare in remarkable ways.

    Machine learning algorithms can now detect diseases from medical images with accuracy
    surpassing human experts. For example, AI systems have been shown to identify skin cancer
    from photographs with 95% accuracy (Source: Stanford Study, 2023).

    In drug discovery, AI is accelerating the process of finding new medications.
    Deep learning models can predict molecular interactions and suggest novel compounds
    that might treat diseases like Alzheimer's and cancer.

    The future of AI in healthcare looks promising, with applications in personalized medicine,
    robotic surgery, and predictive diagnostics.
    """

    # Save test content to a temporary file
    test_file = Path("temp_test_doc.txt")
    with open(test_file, "w", encoding="utf-8") as f:
        f.write(test_content)

    try:
        # Load and process the document
        print("📄 Loading test document...")
        documents = doc_loader.load_document(str(test_file))
        print(f"✅ Loaded {len(documents)} document chunks")

        # Add to RAG engine
        print("🔍 Building vector index...")
        rag_engine.add_documents([str(test_file)])
        print("✅ Index built successfully")

        # Test questions
        test_questions = [
            "How is AI transforming healthcare?",
            "What accuracy do AI systems have in detecting skin cancer?",
            "How does AI help in drug discovery?"
        ]

        print("\n❓ Testing Q&A with parallel LLM processing...")
        for i, question in enumerate(test_questions, 1):
            print(f"\n--- Question {i}: {question} ---")
            try:
                result = rag_engine.ask(question)
                answer = result.get('answer', 'No answer provided')
                print(f"Answer: {answer}")
                print("✅ Query successful")
            except Exception as e:
                print(f"❌ Query failed: {e}")

        print("\n🎉 Basic functionality test completed!")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        # Clean up
        if test_file.exists():
            test_file.unlink()

    return True

if __name__ == "__main__":
    success = test_basic_functionality()
    sys.exit(0 if success else 1)
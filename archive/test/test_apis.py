#!/usr/bin/env python3
"""
API Key Validator for RAG System
This script tests your API keys and suggests solutions
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_groq_api():
    """Test Groq API connection"""
    try:
        from langchain_groq import ChatGroq
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            return False, "No API key found"
            
        # Set environment variable
        os.environ["GROQ_API_KEY"] = api_key
        
        # Test connection
        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)  # Use smaller model for testing
        response = llm.invoke("Hello")
        
        return True, f"✅ Groq API working! Response: {response.content[:50]}..."
        
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            return False, "❌ 403 Forbidden - API key invalid or expired"
        elif "401" in error_msg:
            return False, "❌ 401 Unauthorized - API key invalid"
        elif "429" in error_msg:
            return False, "❌ 429 Rate Limited - Too many requests"
        else:
            return False, f"❌ Error: {error_msg[:100]}"

def test_openrouter_api():
    """Test OpenRouter API connection"""
    try:
        from langchain_openai import ChatOpenAI
        api_key = os.getenv("OPENROUTER_API_KEY")
        
        if not api_key:
            return False, "No API key found"
            
        # Set environment variable
        os.environ["OPENAI_API_KEY"] = api_key
        
        # Test connection with a free model
        llm = ChatOpenAI(
            model="meta-llama/llama-3.2-3b-instruct:free",  # Free model
            base_url="https://openrouter.ai/api/v1",
            temperature=0
        )
        response = llm.invoke("Hello")
        
        return True, f"✅ OpenRouter API working! Response: {response.content[:50]}..."
        
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            return False, "❌ 403 Forbidden - API key invalid or expired"
        elif "401" in error_msg:
            return False, "❌ 401 Unauthorized - API key invalid"
        elif "429" in error_msg:
            return False, "❌ 429 Rate Limited - Too many requests"
        else:
            return False, f"❌ Error: {error_msg[:100]}"

def get_new_api_keys_info():
    """Provide information on how to get new API keys"""
    return """
🔑 How to get NEW API Keys:

1. **Groq API (Free):**
   - Visit: https://console.groq.com/
   - Sign up for free account
   - Go to API Keys section
   - Create new API key
   - Free tier: 30 requests/minute

2. **OpenRouter API (Free tier available):**
   - Visit: https://openrouter.ai/
   - Sign up for free account
   - Go to Keys section
   - Create new API key
   - Free models available (limited usage)

3. **Alternative FREE Options:**
   - Ollama (local models): https://ollama.ai/
   - Hugging Face Inference API: https://huggingface.co/inference-api
   - Google Colab with free models

📝 Update your .env file with new keys:
GROQ_API_KEY=your_new_groq_key_here
OPENROUTER_API_KEY=your_new_openrouter_key_here
"""

def main():
    print("🔍 Testing API Keys...")
    print("=" * 50)
    
    # Test Groq
    print("Testing Groq API...")
    groq_working, groq_msg = test_groq_api()
    print(f"Groq: {groq_msg}")
    
    print("\nTesting OpenRouter API...")
    openrouter_working, openrouter_msg = test_openrouter_api()
    print(f"OpenRouter: {openrouter_msg}")
    
    print("\n" + "=" * 50)
    
    if not groq_working and not openrouter_working:
        print("❌ Both APIs failed! You need new API keys.")
        print(get_new_api_keys_info())
    elif groq_working and not openrouter_working:
        print("✅ Groq working, OpenRouter failed.")
        print("You can use Groq-only mode or get a new OpenRouter key.")
    elif not groq_working and openrouter_working:
        print("✅ OpenRouter working, Groq failed.")
        print("You can use OpenRouter-only mode or get a new Groq key.")
    else:
        print("🎉 Both APIs working perfectly!")

if __name__ == "__main__":
    main()
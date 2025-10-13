"""
Streamlit Frontend - API Client Mode
Uses FastAPI backend via HTTP requests instead of direct RAG instantiation
This enables proper frontend/backend separation for scaling
"""

import streamlit as st
import requests
import os
from typing import List, Dict, Optional

# Must be the first Streamlit command
st.set_page_config(page_title="AI Documind - API Mode", layout="wide")

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

st.title("🤖 AI Documind")
st.caption("Connected to FastAPI backend")

# Check API connectivity
def check_api_health() -> bool:
    """Check if API is reachable"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "api_connected" not in st.session_state:
    st.session_state.api_connected = check_api_health()

# Show connection status
if st.session_state.api_connected:
    st.sidebar.success(f"✅ Connected to {API_BASE_URL}")
else:
    st.sidebar.error(f"❌ Cannot reach API at {API_BASE_URL}")
    st.sidebar.warning("⚠️ Make sure backend is running: `uvicorn backend.api:app --reload`")

# Sidebar controls
st.sidebar.header("📄 Document Management")

# Reconnect button
if st.sidebar.button("🔄 Reconnect to API"):
    st.session_state.api_connected = check_api_health()
    if st.session_state.api_connected:
        st.sidebar.success("✅ Reconnected!")
    else:
        st.sidebar.error("❌ Still cannot connect")

# File uploader
uploaded_files = st.sidebar.file_uploader(
    "Upload PDFs, DOCX, PPTX, or TXT",
    type=["pdf", "docx", "pptx", "txt"],
    accept_multiple_files=True
)

if uploaded_files and st.session_state.api_connected:
    with st.spinner("📤 Uploading documents to backend..."):
        try:
            # Prepare files for upload
            files = [
                ("files", (file.name, file.getvalue(), file.type))
                for file in uploaded_files
            ]
            
            # Upload to API
            response = requests.post(
                f"{API_BASE_URL}/upload",
                files=files,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                st.sidebar.success(f"✅ Uploaded {result['files_processed']} file(s)")
                st.sidebar.markdown("**Current Documents:**")
                for filename in result['filenames']:
                    st.sidebar.markdown(f"📄 {filename}")
                
                # Clear chat on new upload
                st.session_state.messages = []
            else:
                st.sidebar.error(f"❌ Upload failed: {response.text}")
        
        except Exception as e:
            st.sidebar.error(f"❌ Error uploading: {str(e)}")

# Clear documents button
if st.sidebar.button("🗑️ Clear All Documents"):
    if st.session_state.api_connected:
        try:
            response = requests.post(f"{API_BASE_URL}/clear", timeout=10)
            if response.status_code == 200:
                st.session_state.messages = []
                st.sidebar.success("✅ Documents cleared!")
            else:
                st.sidebar.error(f"❌ Clear failed: {response.text}")
        except Exception as e:
            st.sidebar.error(f"❌ Error: {str(e)}")

# View conversation history
if st.sidebar.checkbox("📜 View History (from DB)", value=False):
    if st.session_state.api_connected:
        try:
            response = requests.get(f"{API_BASE_URL}/history?limit=50", timeout=10)
            if response.status_code == 200:
                history = response.json()
                st.sidebar.markdown(f"### 💬 Last {len(history)} Conversations")
                
                for entry in history[:10]:  # Show last 10
                    with st.sidebar.expander(f"🕒 {entry['timestamp'][:19]}"):
                        st.markdown(f"**Q:** {entry['question'][:100]}...")
                        st.markdown(f"**Provider:** {entry['provider']}")
                        st.markdown(f"**Duration:** {entry['duration_s']:.2f}s")
                        st.markdown(f"**Status:** {entry['status']}")
            else:
                st.sidebar.error("❌ Could not load history")
        except Exception as e:
            st.sidebar.error(f"❌ Error: {str(e)}")

# Display chat messages
for i, message in enumerate(st.session_state.messages):
    if message["role"] == "user":
        st.markdown(f"**👤 You:** {message['content']}")
    else:
        st.markdown(f"**🤖 Assistant:** {message['content']}")
        
        # Show sources if available
        if "sources" in message and message["sources"]:
            with st.expander("📚 Sources"):
                for source in message["sources"]:
                    # Handle dict format
                    if isinstance(source, dict):
                        source_text = source.get("source", "unknown")
                        page = source.get("page")
                        chunk_id = source.get("chunk_id", "")
                        if page:
                            st.markdown(f"- **{source_text}** (Page {page}, Chunk {chunk_id})")
                        else:
                            st.markdown(f"- **{source_text}** (Chunk {chunk_id})")
                    else:
                        st.markdown(f"- {source}")
        
        # Show metadata if available
        if "meta" in message:
            meta = message["meta"]
            st.caption(f"🤖 {meta.get('provider', 'unknown')} | ⏱️ {meta.get('duration_s', 0):.2f}s")
    
    st.markdown("---")

# Chat input (backward compatible)
prompt = st.text_input("Ask a question about your documents...", key="question_input", disabled=not st.session_state.api_connected)
ask_button = st.button("Ask", disabled=not st.session_state.api_connected)

if ask_button and prompt:
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    st.markdown(f"**👤 You:** {prompt}")
    st.markdown("---")
    
    # Get response from API
    with st.spinner("🤔 Thinking..."):
        try:
            response = requests.post(
                f"{API_BASE_URL}/ask",
                json={"question": prompt},
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result["answer"]
                sources = result.get("sources", [])
                meta = result.get("meta", {})
                
                # Display answer
                st.markdown(f"**🤖 Assistant:** {answer}")
                
                # Display sources
                if sources:
                    with st.expander("📚 Sources"):
                        for source in sources:
                            # Handle dict format
                            if isinstance(source, dict):
                                source_text = source.get("source", "unknown")
                                page = source.get("page")
                                chunk_id = source.get("chunk_id", "")
                                if page:
                                    st.markdown(f"- **{source_text}** (Page {page}, Chunk {chunk_id})")
                                else:
                                    st.markdown(f"- **{source_text}** (Chunk {chunk_id})")
                            else:
                                st.markdown(f"- {source}")
                
                # Display metadata
                st.caption(f"🤖 {meta.get('provider', 'unknown')} | ⏱️ {meta.get('duration_s', 0):.2f}s")
                
                # Save to session
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": sources,
                    "meta": meta
                })
            
            else:
                error_msg = f"❌ API Error ({response.status_code}): {response.text}"
                st.error(error_msg)
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": error_msg
                })
        
        except Exception as e:
            error_msg = f"❌ Request failed: {str(e)}"
            st.error(error_msg)
            st.session_state.messages.append({
                "role": "assistant",
                "content": error_msg
            })

# Footer
st.sidebar.markdown("---")
st.sidebar.caption(f"**API Endpoint:** {API_BASE_URL}")
st.sidebar.caption("**Mode:** API Client (Scalable)")

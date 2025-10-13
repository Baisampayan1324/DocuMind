import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st

# Must be the first Streamlit command
st.set_page_config(page_title="AI Documind", layout="wide")

st.title("AI Documind")

# Clean up any leftover temporary files on app start
def cleanup_temp_files():
    """Clean up temporary files and FAISS index files"""
    import glob
    
    # Clean temp files
    temp_files = glob.glob("temp_*")
    for temp_file in temp_files:
        try:
            os.remove(temp_file)
        except:
            pass
    
    # Clean FAISS index files
    faiss_files = glob.glob("faiss_index*")
    for faiss_file in faiss_files:
        try:
            os.remove(faiss_file)
        except:
            pass
    
    # Clean any other cache files
    cache_files = glob.glob("*.pkl") + glob.glob("*.cache")
    for cache_file in cache_files:
        try:
            os.remove(cache_file)
        except:
            pass

# Always start fresh - no persistent session state
if "app_initialized" not in st.session_state:
    cleanup_temp_files()
    st.session_state.app_initialized = True
    # Initialize fresh message list
    st.session_state.messages = []

# Initialize chat messages if not exists
if "messages" not in st.session_state:
    st.session_state.messages = []

# Initialize RAG lazily - only when needed
def get_rag_instance():
    """Get or create RAG instance with comprehensive testing"""
    if "rag" not in st.session_state:
        try:
            with st.spinner("🔧 Initializing and testing AI system..."):
                # Import here to avoid early initialization
                from backend.rag_engine import ConversationalRAG
                
                # Initialize RAG system
                rag_temp = ConversationalRAG()
                
                # Test API connectivity silently
                try:
                    test_result = rag_temp.ask("Hello")
                    # Only show success after all tests pass
                    st.session_state.rag = rag_temp
                    st.success("✅ AI system ready!")
                except Exception as e:
                    st.error(f"❌ API test failed: {str(e)[:100]}...")
                    return None
                        
        except Exception as e:
            st.error(f"❌ Failed to initialize AI system: {str(e)}")
            st.error("💡 Try refreshing the page or check your API keys")
            return None
    return st.session_state.rag

# Reset session function
def reset_session():
    """Reset the entire session"""
    # Clear everything from session state
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    
    # Clean up temp files
    cleanup_temp_files()
    st.sidebar.success("✅ Session reset!")

# Sidebar for file uploads and controls
st.sidebar.header("� Document Management")

# Reset Session button (single button)
if st.sidebar.button("🔄 Reset Session"):
    reset_session()
    st.experimental_rerun()

# File uploader
uploaded_files = st.sidebar.file_uploader(
    "Upload PDFs, DOCX, PPTX, or TXT",
    type=["pdf", "docx", "pptx", "txt"],
    accept_multiple_files=True
)

if uploaded_files:
    # Get RAG instance (lazy initialization)
    rag = get_rag_instance()
    if rag is None:
        st.error("❌ Cannot process files - AI system failed to initialize")
    else:
        # Clear existing index and messages when new files are uploaded
        rag.clear_index()
        st.session_state.messages = []
        cleanup_temp_files()
        
        temp_files = []
        for file in uploaded_files:
            path = f"temp_{file.name}"
            with open(path, "wb") as f:
                f.write(file.getbuffer())
            temp_files.append(path)

        rag.add_documents(temp_files)
        st.sidebar.success(f"✅ Loaded {len(temp_files)} file(s)")
        
        # Show loaded files
        st.sidebar.markdown("**Current Documents:**")
        for file in uploaded_files:
            st.sidebar.markdown(f"📄 {file.name}")

# Clear Documents button
if st.sidebar.button("🗑️ Clear All Documents"):
    rag = get_rag_instance()
    if rag is not None:
        # Clear everything in the RAG system
        rag.clear_index()
        st.session_state.messages = []
        cleanup_temp_files()
        
        # Clear uploaded files from session state if they exist
        if "uploaded_files" in st.session_state:
            del st.session_state["uploaded_files"]
        
    st.sidebar.success("✅ All documents and chat cleared!")

# Show conversation history in sidebar
if st.sidebar.checkbox("Show Chat History", value=False):
    st.sidebar.markdown("### 💬 Current Session Chat")
    if st.session_state.messages:
        for i in range(0, len(st.session_state.messages), 2):
            if i+1 < len(st.session_state.messages):
                q_num = (i//2) + 1
                user_msg = st.session_state.messages[i]["content"]
                ai_msg = st.session_state.messages[i+1]["content"]
                st.sidebar.markdown(f"**Q{q_num}:** {user_msg[:40]}...")
                st.sidebar.markdown(f"**A{q_num}:** {ai_msg[:50]}...")
                st.sidebar.markdown("---")
    else:
        st.sidebar.markdown("*No conversation in this session*")

# Main chat interface
st.markdown("### 💬 Chat with your documents")

# Display chat messages
for message in st.session_state.messages:
    if message["role"] == "user":
        st.markdown(f"**🙋 You:** {message['content']}")
    else:
        st.markdown(f"**🤖 AI Assistant:** {message['content']}")
        
        # Show sources for assistant messages
        if "sources" in message and message["sources"]:
            with st.expander("📚 Sources"):
                for i, source in enumerate(message["sources"], 1):
                    # Handle both dict and string formats for backward compatibility
                    if isinstance(source, dict):
                        source_text = source.get("source", "unknown")
                        page = source.get("page")
                        chunk_id = source.get("chunk_id", "")
                        if page:
                            st.markdown(f"**Source {i}:** {source_text}, page {page}, chunk {chunk_id}")
                        else:
                            st.markdown(f"**Source {i}:** {source_text}, chunk {chunk_id}")
                    else:
                        st.markdown(f"**Source {i}:** {source}")
    st.markdown("---")

# Chat input with dual support (Enter key + Send button)
st.markdown("#### Ask your question:")

# Initialize session state 
if "processing" not in st.session_state:
    st.session_state.processing = False

# Simple form-based approach
with st.form("question_form", clear_on_submit=True):
    prompt = st.text_input(
        "Ask your question:",
        placeholder="Ask me anything about your documents...",
        key="question_input"
    )
    submitted = st.form_submit_button("📤 Send")

# Process the submission
if submitted and prompt and prompt.strip():
    if not st.session_state.processing:
        st.session_state.processing = True

        # Get RAG instance
        rag = get_rag_instance()

        if rag is None:
            st.error("❌ Cannot answer questions - AI system failed to initialize")
            st.session_state.processing = False
        else:
            # Add user message immediately
            user_message = {"role": "user", "content": prompt}
            st.session_state.messages.append(user_message)

            # Show the user message right away
            st.markdown(f"**🙋 You:** {prompt}")
            st.markdown("---")

            # Get AI response
            with st.spinner("🧠 Processing with multiple AI models..."):
                try:
                    result = rag.ask(prompt)

                    # Add assistant response
                    assistant_message = {
                        "role": "assistant", 
                        "content": result["answer"],
                        "sources": result.get("sources", [])
                    }
                    st.session_state.messages.append(assistant_message)

                    # Display the response immediately
                    st.markdown(f"**🤖 AI Assistant:** {result['answer']}")
                    if result.get("sources"):
                        with st.expander("📚 Sources"):
                            for i, source in enumerate(result["sources"], 1):
                                # Handle both dict and string formats for backward compatibility
                                if isinstance(source, dict):
                                    source_text = source.get("source", "unknown")
                                    page = source.get("page")
                                    chunk_id = source.get("chunk_id", "")
                                    if page:
                                        st.markdown(f"**Source {i}:** {source_text}, page {page}, chunk {chunk_id}")
                                    else:
                                        st.markdown(f"**Source {i}:** {source_text}, chunk {chunk_id}")
                                else:
                                    st.markdown(f"**Source {i}:** {source}")
                    st.markdown("---")

                except Exception as e:
                    error_msg = f"Sorry, I encountered an error: {str(e)}"
                    st.error(f"Error processing question: {str(e)}")
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": error_msg,
                        "sources": []
                    })
                    st.markdown(f"**🤖 AI Assistant:** {error_msg}")
                    st.markdown("---")

        st.session_state.processing = False

# Instructions for fresh start
if not st.session_state.messages:
    st.info("""
    🚀 **Welcome to your AI Personal Documentation Chat System!**
    
    **Fresh Start Features:**
    - 🆕 No persistent data - each session starts completely fresh
    - 🗑️ Use "Clear All Documents" to remove all uploaded files and reset chat
    - 🔄 Use "Reset Session" for a complete restart (like refreshing the page)
    
    **How to use:**
    1. Upload your documents using the sidebar
    2. Ask questions about your documents
    3. Get intelligent answers from multiple AI models working together
    
    **Multi-AI Intelligence:**
    - Powered by both Groq and OpenRouter APIs
    - Intelligent fusion of multiple model responses
    - 4-5 second response time for optimal answers
    """)

# Footer
st.markdown("---")
st.markdown("*💡 This system uses intelligent fusion of multiple AI models for optimal responses*")
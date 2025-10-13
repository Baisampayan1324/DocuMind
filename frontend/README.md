# Frontend Architecture - AI Documind# Frontend Architecture - Streamlit UI# Frontend - AI Documind Web Interface



## 📋 Overview



The frontend is a **Streamlit-based web application** that provides an intuitive interface for **AI Documind**. It communicates with the FastAPI backend via **REST API calls**, enabling complete separation of concerns and easy scalability.## 📋 OverviewA modern, responsive Streamlit web application for document upload, chat, and AI-powered Q&A with your documents.



---



## 🏗️ ArchitectureThe frontend is a **Streamlit-based web application** that provides an intuitive interface for interacting with the RAG system. It communicates with the FastAPI backend via **REST API calls**, enabling complete separation of concerns and easy scalability.## 📁 Structure



```

┌─────────────────────────────────────────────────────────┐

│              AI Documind - Streamlit Frontend           │---```

│                    (Port 8501)                          │

├─────────────────────────────────────────────────────────┤frontend/

│                                                         │

│  ┌──────────────┐         ┌──────────────┐            │## 🏗️ Architecture├── app.py              # Main Streamlit application

│  │   Main App   │         │    Admin     │            │

│  │  (app_api.py)│         │  (admin.py)  │            │└── README.md          # This documentation

│  │              │         │              │            │

│  │  - Upload    │         │  - Analytics │            │``````

│  │  - Q&A       │         │  - History   │            │

│  │  - Chat UI   │         │  - Stats     │            │┌─────────────────────────────────────────────────────────┐

│  └──────────────┘         └──────────────┘            │

│         │                        │                     ││                   Streamlit Frontend                    │## 🎨 Features

│         │  HTTP Requests         │  HTTP Requests     │

│         ▼                        ▼                     ││                    (Port 8501)                          │

│  ┌─────────────────────────────────────────┐          │

│  │        FastAPI Backend                  │          │├─────────────────────────────────────────────────────────┤### User Interface

│  │         (Port 8000)                     │          │

│  │                                         │          ││                                                         │- **Clean Design**: Modern, wide-layout Streamlit interface

│  │  /upload  /ask  /history  /health      │          │

│  └─────────────────────────────────────────┘          ││  ┌──────────────┐         ┌──────────────┐            │- **Responsive**: Optimized for desktop and mobile viewing

└─────────────────────────────────────────────────────────┘

```│  │   Main App   │         │    Admin     │            │- **Intuitive**: Simple upload-and-chat workflow



---│  │  (app_api.py)│         │  (admin.py)  │            │



## 📂 File Structure│  │              │         │              │            │### Document Management



### **1. `app_api.py` - Main Q&A Interface**│  │  - Upload    │         │  - Analytics │            │- **Multi-format Support**: PDF, DOCX, PPTX, TXT files



**Purpose**: Primary user interface for document upload and question-answering│  │  - Q&A       │         │  - History   │            │- **Real-time Upload**: Instant document processing feedback



**Key Features**:│  │  - Chat UI   │         │  - Stats     │            │- **Session Management**: Fresh start functionality

- ✅ Document upload (PDF, DOCX, PPTX, TXT)

- ✅ Real-time chat interface│  └──────────────┘         └──────────────┘            │- **File Validation**: Automatic format checking and error handling

- ✅ Source citations for answers

- ✅ API connectivity status│         │                        │                     │

- ✅ Session state management

│         │  HTTP Requests         │  HTTP Requests     │### Chat Interface

**UI Components**:

│         ▼                        ▼                     │- **Real-time Responses**: Immediate AI answer display

| Section | Description |

|---------|-------------|│  ┌─────────────────────────────────────────┐          │- **Source Citations**: Expandable source references

| **Sidebar** | API connection status, document upload, clear history |

| **Main Area** | Chat messages, question input, answer display |│  │        FastAPI Backend                  │          │- **Message History**: Persistent conversation during session

| **Sources** | Expandable citations showing document excerpts |

│  │         (Port 8000)                     │          │- **Error Handling**: User-friendly error messages

---

│  │                                         │          │

### **2. `admin.py` - Analytics Dashboard**

│  │  /upload  /ask  /history  /health      │          │### Session Management

**Purpose**: Administrative interface for viewing conversation history and analytics

│  └─────────────────────────────────────────┘          │- **Fresh Start**: No persistent data between sessions

**Key Features**:

- ✅ Full conversation history table└─────────────────────────────────────────────────────────┘- **Automatic Cleanup**: Temporary file removal on startup

- ✅ Provider usage statistics

- ✅ Model distribution charts```- **Clear Functions**: Manual document and chat clearing

- ✅ Conversation trends over time

- ✅ Export capabilities- **Memory Efficient**: Prevents accumulation of old data



**Metrics Displayed**:---

- Total conversations count

- Provider breakdown (Groq, OpenRouter, OpenAI)## 🚀 Quick Start

- Model usage distribution

- Conversation timestamps## 📂 File Structure

- Question/answer pairs with sources

### Prerequisites

---

### **1. `app_api.py` - Main Q&A Interface**- Python 3.8+

## 🔄 Complete Workflow

- Backend properly configured with API keys

### **1. Application Startup**

**Purpose**: Primary user interface for document upload and question-answering- Streamlit installed

```

User runs: streamlit run frontend/app_api.py

     │

     ▼**Key Features**:### Running the Application

Streamlit App Initializes

     │- ✅ Document upload (PDF, DOCX, PPTX, TXT)

     ├─▶ Set page config (title="AI Documind", layout="wide")

     │- ✅ Real-time chat interface```bash

     ├─▶ Initialize session state:

     │   - messages = []- ✅ Source citations for answerscd frontend

     │   - api_connected = False

     │- ✅ API connectivity statusstreamlit run app.py

     ├─▶ Check API health:

     │   GET http://localhost:8000/health- ✅ Session state management```

     │

     └─▶ Display connection status in sidebar

```

**UI Components**:The application will start on `http://localhost:8501` (or next available port).

---



### **2. Document Upload Flow**

| Section | Description |## 💡 Usage Guide

```

User selects files in sidebar|---------|-------------|

     │

     ▼| **Sidebar** | API connection status, document upload, clear history |### Basic Workflow

User clicks "Upload Documents"

     │| **Main Area** | Chat messages, question input, answer display |

     ▼

Frontend (app_api.py)| **Sources** | Expandable citations showing document excerpts |1. **Start Fresh**: Application automatically cleans up on launch

     │

     ├─▶ Prepare multipart/form-data2. **Upload Documents**: Use sidebar file uploader for multiple documents

     │

     ├─▶ POST http://localhost:8000/upload---3. **Ask Questions**: Type questions in the main chat area

     │   Content-Type: multipart/form-data

     │   Body: files=[file1.pdf, file2.docx, ...]4. **View Responses**: Read AI answers with expandable source citations

     │

     ▼### **2. `admin.py` - Analytics Dashboard**5. **Continue Conversation**: Ask follow-up questions about your documents

Backend Processes Documents

     │

     ├─▶ Save to temp folder

     ├─▶ Load + Clean + Chunk**Purpose**: Administrative interface for viewing conversation history and analytics### Advanced Features

     ├─▶ Generate embeddings

     ├─▶ Store in FAISS

     └─▶ Delete temp files

     │**Key Features**:#### Document Management

     ▼

Response to Frontend- ✅ Full conversation history table- **Batch Upload**: Upload multiple files simultaneously

     │

     └─▶ Display success message:- ✅ Provider usage statistics- **Format Support**: PDF, Word, PowerPoint, and text files

         "✅ 3 documents uploaded successfully"

```- ✅ Model distribution charts- **Progress Feedback**: Real-time loading status



**Code Implementation**:- ✅ Conversation trends over time- **File Listing**: See all currently loaded documents

```python

# frontend/app_api.py- ✅ Export capabilities



files = st.file_uploader("Upload documents", accept_multiple_files=True)#### Chat Features



if st.button("Upload Documents"):**Metrics Displayed**:- **Context Awareness**: AI remembers conversation context

    # Prepare files for upload

    files_data = [("files", (f.name, f.read(), f.type)) for f in files]- Total conversations count- **Source Verification**: Click sources to see document references

    

    # Send to backend- Provider breakdown (Groq, OpenRouter, OpenAI)- **Error Recovery**: Graceful handling of API issues

    response = requests.post(

        f"{API_BASE_URL}/upload",- Model usage distribution- **Rate Limit Handling**: User-friendly rate limit messages

        files=files_data

    )- Conversation timestamps

    

    if response.status_code == 200:- Question/answer pairs with sources#### Session Controls

        st.success("Documents uploaded!")

    else:- **Clear Documents**: Remove all uploaded files and reset chat

        st.error("Upload failed")

```---- **Fresh Sessions**: Each browser refresh starts completely clean



---- **History View**: Sidebar chat history summary



### **3. Question-Answer Flow**## 🔄 Complete Workflow



```## 🏗️ Architecture

User types question in chat input

     │### **1. Application Startup**

     ▼

Frontend (app_api.py)### Application Structure

     │

     ├─▶ Add user message to session state```

     │

     ├─▶ Display user message in chatUser runs: streamlit run frontend/app_api.py```python

     │

     ├─▶ POST http://localhost:8000/ask     │# Main Components

     │   Content-Type: application/json

     │   Body: {"question": "What is AI Documind?", "provider": "groq"}     ▼├── Page Configuration      # Streamlit setup and layout

     │

     ▼Streamlit App Initializes├── Session Management      # Fresh start and cleanup logic

Backend Processes Question

     │     │├── Document Upload         # File handling and processing

     ├─▶ Embed question

     ├─▶ Search FAISS (Top 4 chunks)     ├─▶ Set page config (title, layout)├── Chat Interface          # Message display and input

     ├─▶ Build prompt with context

     ├─▶ Call LLM (Groq → OpenRouter → OpenAI)     │├── RAG Integration         # Backend engine communication

     ├─▶ Parse response

     └─▶ Save to history DB     ├─▶ Initialize session state:└── UI Components           # Sidebar, forms, and displays

     │

     ▼     │   - messages = []```

Response to Frontend

     │     │   - api_connected = False

     ├─▶ {

     │     "answer": "AI Documind is...",     │### Key Functions

     │     "sources": [{...}],

     │     "provider_used": "groq",     ├─▶ Check API health:

     │     "model_used": "llama-3.1-8b-instant"

     │   }     │   GET http://localhost:8000/health#### Session Management

     │

     ▼     │```python

Frontend Displays Answer

     │     └─▶ Display connection status in sidebar# Automatic cleanup on startup

     ├─▶ Add assistant message to session state

     │```cleanup_temp_files()  # Remove old temp files

     ├─▶ Display answer in chat

     │st.session_state.messages = []  # Fresh message history

     └─▶ Show sources in expandable section:

         📄 Source: document.pdf (Chunk 2)---```

         "Original text excerpt..."

```



**Code Implementation**:### **2. Document Upload Flow**#### Document Processing

```python

# frontend/app_api.py```python



# User input```# Lazy RAG initialization

if question := st.chat_input("Ask a question"):

    # Display user messageUser selects files in sidebarrag = get_rag_instance()  # Initialize only when needed

    st.session_state.messages.append({"role": "user", "content": question})

         │rag.add_documents(file_paths)  # Process uploaded files

    # Call API

    response = requests.post(     ▼```

        f"{API_BASE_URL}/ask",

        json={"question": question, "provider": selected_provider}User clicks "Upload Documents"

    )

         │#### Chat Processing

    if response.status_code == 200:

        data = response.json()     ▼```python

        

        # Display assistant messageFrontend (app_api.py)# Form-based input for reliability

        st.session_state.messages.append({

            "role": "assistant",     │with st.form("question_form", clear_on_submit=True):

            "content": data["answer"],

            "sources": data["sources"],     ├─▶ Prepare multipart/form-data    prompt = st.text_input("Ask your question:")

            "provider": data["provider_used"]

        })     │    submitted = st.form_submit_button("📤 Send")

```

     ├─▶ POST http://localhost:8000/upload```

---

     │   Content-Type: multipart/form-data

### **4. History Viewing Flow (Admin Dashboard)**

     │   Body: files=[file1.pdf, file2.docx, ...]## 🔧 Configuration

```

User opens admin.py     │

     │

     ▼     ▼### Streamlit Settings

Frontend (admin.py)

     │Backend Processes Documents

     ├─▶ GET http://localhost:8000/history

     │     │The application uses these Streamlit configurations:

     ▼

Backend Queries SQLite Database     ├─▶ Save to temp folder- **Page Title**: "AI Documind"

     │

     ├─▶ SELECT * FROM conversations ORDER BY timestamp DESC     ├─▶ Load + Clean + Chunk- **Layout**: Wide layout for optimal space usage

     │

     └─▶ Return list of conversations     ├─▶ Generate embeddings- **Theme**: Default Streamlit theme

     │

     ▼     ├─▶ Store in FAISS

Response to Frontend

     │     └─▶ Delete temp files### Backend Integration

     ├─▶ [

     │     {     │

     │       "id": 1,

     │       "timestamp": "2025-10-03 12:00:00",     ▼The frontend communicates with the backend through:

     │       "question": "What is AI Documind?",

     │       "answer": "AI Documind is...",Response to Frontend- **Import Path**: Relative imports from parent directory

     │       "sources": [...],

     │       "provider_used": "groq",     │- **Lazy Loading**: RAG engine initialized only when documents are uploaded

     │       "model_used": "llama-3.1-8b-instant"

     │     },     └─▶ Display success message:- **Error Handling**: Graceful degradation when backend unavailable

     │     ...

     │   ]         "✅ 3 documents uploaded successfully"

     │

     ▼```## 🎯 User Experience

Frontend Displays Analytics

     │

     ├─▶ Total conversations: 42

     │**Code Implementation**:### Design Principles

     ├─▶ Provider distribution chart:

     │   Groq: 70%```python

     │   OpenRouter: 25%

     │   OpenAI: 5%# frontend/app_api.py1. **Simplicity**: One-click document upload and chat

     │

     ├─▶ Conversation table with filters2. **Reliability**: Form-based input prevents submission issues

     │

     └─▶ Download button (CSV export)files = st.file_uploader("Upload documents", accept_multiple_files=True)3. **Transparency**: Show processing status and sources

```

4. **Fresh Start**: No confusing persistent state

---

if st.button("Upload Documents"):

## 🔌 API Integration Details

    # Prepare files for upload### Error Handling

### **Base URL Configuration**

    files_data = [("files", (f.name, f.read(), f.type)) for f in files]

```python

# frontend/app_api.py    - **API Errors**: Clear error messages with retry suggestions



API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")    # Send to backend- **File Errors**: Format validation and helpful error messages

```

    response = requests.post(- **Network Issues**: Graceful handling of connectivity problems

**Environment Variable**:

```env        f"{API_BASE_URL}/upload",- **Rate Limits**: User-friendly rate limit notifications

# .env file (optional, defaults to localhost)

API_BASE_URL=http://localhost:8000        files=files_data

```

    )## 🔍 Troubleshooting

For production deployment:

```env    

API_BASE_URL=https://your-backend.com

```    if response.status_code == 200:### Common Issues



---        st.success("Documents uploaded!")



### **API Endpoints Used**    else:#### "AI system failed to initialize"



#### **1. Health Check**        st.error("Upload failed")- Check backend API key configuration

```python

response = requests.get(f"{API_BASE_URL}/health", timeout=2)```- Verify internet connectivity

# Returns: {"status": "healthy", "timestamp": "..."}

```- Run API tests: `python test/test_apis.py`



**Used For**:---

- Connection status indicator

- Startup validation#### No responses to questions

- Reconnect button

### **3. Question-Answer Flow**- Ensure documents are uploaded first

---

- Check for API rate limits

#### **2. Document Upload**

```python```- Verify backend is properly configured

files_data = [("files", (f.name, f.read(), f.type)) for f in uploaded_files]

response = requests.post(User types question in chat input

    f"{API_BASE_URL}/upload",

    files=files_data     │#### File upload failures

)

# Returns: {"status": "success", "files_processed": [...]}     ▼- Check file format support (PDF, DOCX, PPTX, TXT)

```

Frontend (app_api.py)- Verify file is not corrupted

**Used For**:

- Sidebar file uploader     │- Ensure file size is within limits

- Batch document processing

     ├─▶ Add user message to session state

---

     │### Debug Mode

#### **3. Ask Question**

```python     ├─▶ Display user message in chat

response = requests.post(

    f"{API_BASE_URL}/ask",     │For development debugging:

    json={"question": question, "provider": "groq"}

)     ├─▶ POST http://localhost:8000/ask```python

# Returns: {

#   "answer": "...",     │   Content-Type: application/json# Add to app.py for debug output

#   "sources": [{...}],

#   "provider_used": "groq",     │   Body: {"question": "What is RAG?", "provider": "groq"}st.write(f"Debug: RAG instance: {rag is not None}")

#   "model_used": "..."

# }     │st.write(f"Debug: Messages count: {len(st.session_state.messages)}")

```

     ▼```

**Used For**:

- Main chat interfaceBackend Processes Question

- Real-time Q&A

     │## 🚀 Deployment

---

     ├─▶ Embed question

#### **4. Get History**

```python     ├─▶ Search FAISS (Top 4 chunks)### Local Development

response = requests.get(f"{API_BASE_URL}/history")

# Returns: [{"id": 1, "timestamp": "...", "question": "...", ...}, ...]     ├─▶ Build prompt with context```bash

```

     ├─▶ Call LLM (Groq/OpenRouter/OpenAI)cd frontend

**Used For**:

- Admin dashboard     ├─▶ Parse responsestreamlit run app.py

- Analytics display

     └─▶ Save to history DB```

---

     │

#### **5. Clear History**

```python     ▼The application will start on `http://localhost:8501` (or next available port).

response = requests.post(f"{API_BASE_URL}/clear-history")

# Returns: {"status": "success"}Response to Frontend

```

     │### Production Deployment (Future Work)

**Used For**:

- Sidebar "Clear History" button     ├─▶ {- **WSGI Server**: gunicorn or uWSGI for production serving

- Reset conversation state

     │     "answer": "RAG is...",- **Docker Containerization**: Containerized deployment

---

     │     "sources": [{...}],- **Load Balancing**: Multi-instance deployment with reverse proxy

## 📊 Session State Management

     │     "provider_used": "groq",- **SSL/TLS**: HTTPS certificate configuration

Streamlit uses **session state** to maintain data across reruns:

     │     "model_used": "llama-3.1-8b-instant"

```python

# Initialize session state     │   }## 🔧 Customization

if "messages" not in st.session_state:

    st.session_state.messages = []     │



if "api_connected" not in st.session_state:     ▼### Current Customizations

    st.session_state.api_connected = False

Frontend Displays Answer

# Add message to history

st.session_state.messages.append({     │#### Basic UI Styling

    "role": "user",

    "content": "What is AI Documind?"     ├─▶ Add assistant message to session state```python

})

     │# Add to app.py for basic styling

# Display all messages

for msg in st.session_state.messages:     ├─▶ Display answer in chatst.markdown("""

    with st.chat_message(msg["role"]):

        st.write(msg["content"])     │<style>

```

     └─▶ Show sources in expandable section:    .main { padding: 2rem; }

**Session State Variables**:

         📄 Source: document.pdf (Chunk 2)    .stButton>button { border-radius: 8px; }

| Variable | Type | Purpose |

|----------|------|---------|         "Original text excerpt..."</style>

| `messages` | List[dict] | Chat history (user + assistant messages) |

| `api_connected` | bool | Backend connection status |```""", unsafe_allow_html=True)

| `uploaded_files` | List[File] | Currently uploaded files |

```

---

**Code Implementation**:

## 🎨 UI Components

```python#### Sidebar Enhancements

### **Chat Interface**

# frontend/app_api.py```python

```python

# Display chat history# Add to app.py for sidebar statistics

for msg in st.session_state.messages:

    with st.chat_message(msg["role"]):# User inputst.sidebar.markdown("### 📊 Session Info")

        st.write(msg["content"])

        if question := st.chat_input("Ask a question"):st.sidebar.metric("Messages", len(st.session_state.messages))

        # Show sources if available

        if "sources" in msg:    # Display user messageif 'uploaded_files' in st.session_state:

            with st.expander("📄 Sources"):

                for src in msg["sources"]:    st.session_state.messages.append({"role": "user", "content": question})    st.sidebar.metric("Files", len(st.session_state.uploaded_files))

                    st.caption(f"**{src['source']}** (Chunk {src['chunk_id']})")

                    st.text(src["content"])    ```



# User input    # Call API

if question := st.chat_input("Ask a question about your documents"):

    # Process question...    response = requests.post(### Future Enhancements (Not Yet Implemented)

```

        f"{API_BASE_URL}/ask",

---

        json={"question": question, "provider": selected_provider}#### Advanced UI Themes

### **File Uploader**

    )- Custom color schemes and themes

```python

uploaded_files = st.file_uploader(    - Dark/light mode toggle

    "Upload documents to AI Documind",

    type=["pdf", "docx", "pptx", "txt"],    if response.status_code == 200:- Brand-specific styling

    accept_multiple_files=True

)        data = response.json()



if st.button("Upload Documents"):        #### Feature Extensions

    if uploaded_files:

        # Send to backend...        # Display assistant message- **Chat Export**: Download conversation history as text/JSON

    else:

        st.warning("Please select files first")        st.session_state.messages.append({- **Document Preview**: Thumbnail previews of uploaded files

```

            "role": "assistant",- **Advanced Search**: Filter and search through chat history

---

            "content": data["answer"],- **User Authentication**: Login system for multi-user support

### **Connection Status**

            "sources": data["sources"],

```python

if st.session_state.api_connected:            "provider": data["provider_used"]#### Mobile Optimization

    st.sidebar.success(f"✅ Connected to {API_BASE_URL}")

else:        })- Progressive Web App (PWA) capabilities

    st.sidebar.error(f"❌ Cannot reach API")

    st.sidebar.warning("⚠️ Make sure backend is running")```- Offline document caching



# Reconnect button- Touch gesture support

if st.sidebar.button("🔄 Reconnect"):

    st.session_state.api_connected = check_api_health()---

    st.rerun()

```## � Mobile Compatibility



---### **4. History Viewing Flow (Admin Dashboard)**



## 🚀 Running the FrontendThe application works on mobile devices through Streamlit's responsive design:



### **Standalone Mode** (requires backend running separately)```- **Responsive Layout**: Adapts to different screen sizes



```bashUser opens admin.py- **Touch-Friendly**: Standard web interface works on touch devices

# Terminal 1: Start backend

uvicorn backend.api:app --reload --port 8000     │- **Readable Text**: Default Streamlit styling is mobile-compatible



# Terminal 2: Start frontend     ▼

streamlit run frontend/app_api.py --server.port 8501

```Frontend (admin.py)*Future: Enhanced mobile experience with PWA features*



---     │



### **Unified Mode** (automatic startup)     ├─▶ GET http://localhost:8000/history## �🔒 Security Considerations



```bash     │

# Starts both backend + frontend

python main.py     ▼- No sensitive data stored in browser

```

Backend Queries SQLite Database- API keys handled server-side only

This automatically:

1. Starts FastAPI backend on port 8000     │- Input validation prevents malicious uploads

2. Waits 3 seconds for initialization

3. Starts Streamlit frontend on port 8501     ├─▶ SELECT * FROM conversations ORDER BY timestamp DESC- Automatic cleanup prevents data accumulation</content>

4. Opens browser automatically

     │<parameter name="filePath">P:\Projects\RAG\frontend\README.md

---     └─▶ Return list of conversations

     │

### **Admin Dashboard**     ▼

Response to Frontend

```bash     │

# Run admin interface (requires backend running)     ├─▶ [

streamlit run frontend/admin.py --server.port 8502     │     {

```     │       "id": 1,

     │       "timestamp": "2025-10-03 12:00:00",

Access at: http://localhost:8502     │       "question": "What is RAG?",

     │       "answer": "RAG is...",

---     │       "sources": [...],

     │       "provider_used": "groq",

## 🔧 Configuration     │       "model_used": "llama-3.1-8b-instant"

     │     },

### **Environment Variables**     │     ...

     │   ]

```env     │

# .env file     ▼

Frontend Displays Analytics

# Backend URL (change for production)     │

API_BASE_URL=http://localhost:8000     ├─▶ Total conversations: 42

     │

# Streamlit settings (optional)     ├─▶ Provider distribution chart:

STREAMLIT_SERVER_PORT=8501     │   Groq: 70%

STREAMLIT_SERVER_HEADLESS=false     │   OpenRouter: 25%

```     │   OpenAI: 5%

     │

---     ├─▶ Conversation table with filters

     │

### **Streamlit Config**     └─▶ Download button (CSV export)

```

Create `.streamlit/config.toml` for customization:

---

```toml

[theme]## 🔌 API Integration Details

primaryColor = "#FF4B4B"

backgroundColor = "#FFFFFF"### **Base URL Configuration**

secondaryBackgroundColor = "#F0F2F6"

textColor = "#262730"```python

font = "sans serif"# frontend/app_api.py



[server]API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

port = 8501```

headless = false

```**Environment Variable**:

```env

---# .env file (optional, defaults to localhost)

API_BASE_URL=http://localhost:8000

## 📦 Dependencies```



```For production deployment:

streamlit           # Web framework```env

requests            # HTTP client for API callsAPI_BASE_URL=https://your-backend.com

pandas              # Data manipulation (admin dashboard)```

plotly              # Charts (admin dashboard)

python-dotenv       # Environment variables---

```

### **API Endpoints Used**

Install with:

```bash#### **1. Health Check**

pip install -r requirements.txt```python

```response = requests.get(f"{API_BASE_URL}/health", timeout=2)

# Returns: {"status": "healthy", "timestamp": "..."}

---```



## 🔍 Troubleshooting**Used For**:

- Connection status indicator

### **Problem**: "Cannot reach API" error- Startup validation

**Solution**: - Reconnect button

1. Check if backend is running: `http://localhost:8000/health`

2. Verify `API_BASE_URL` in `.env`---

3. Click "🔄 Reconnect" button

#### **2. Document Upload**

---```python

files_data = [("files", (f.name, f.read(), f.type)) for f in uploaded_files]

### **Problem**: File upload failsresponse = requests.post(

**Solution**:    f"{API_BASE_URL}/upload",

1. Check file format is supported (PDF, DOCX, PPTX, TXT)    files=files_data

2. Verify file size (< 200MB))

3. Check backend logs for errors# Returns: {"status": "success", "files_processed": [...]}

```

---

**Used For**:

### **Problem**: Chat history disappears- Sidebar file uploader

**Solution**:- Batch document processing

- Session state clears on page refresh (by design)

- Use admin dashboard to view persistent history---

- History is saved in SQLite database

#### **3. Ask Question**

---```python

response = requests.post(

### **Problem**: Slow response times    f"{API_BASE_URL}/ask",

**Solution**:    json={"question": question, "provider": "groq"}

1. Check backend processing time)

2. Reduce `TOP_K_CHUNKS` in backend config# Returns: {

3. Use faster LLM provider (Groq is fastest)#   "answer": "...",

#   "sources": [{...}],

---#   "provider_used": "groq",

#   "model_used": "..."

## 🎯 Key Design Decisions# }

```

1. **Why API Mode?** - Enables scaling, separation of concerns, easy React migration

2. **Why Streamlit?** - Rapid prototyping, built-in components, Python-based**Used For**:

3. **Why Session State?** - Maintains chat history across reruns without database- Main chat interface

4. **Why Separate Admin?** - Keeps main interface simple, specialized analytics view- Real-time Q&A

5. **Why Requests Library?** - Simple, reliable HTTP client for API calls

---

---

#### **4. Get History**

## 🔮 Future Migration to React```python

response = requests.get(f"{API_BASE_URL}/history")

The current architecture is **React-ready**:# Returns: [{"id": 1, "timestamp": "...", "question": "...", ...}, ...]

```

1. **Backend API**: Already RESTful, no changes needed

2. **Frontend Logic**: Simple HTTP calls to same endpoints**Used For**:

3. **State Management**: Use React hooks (useState, useEffect)- Admin dashboard

4. **UI Components**: Replace Streamlit with React components- Analytics display



**Migration Steps**:---

```

1. Keep backend unchanged (FastAPI)#### **5. Clear History**

2. Create React app: npx create-react-app ai-documind-frontend```python

3. Replace API calls:response = requests.post(f"{API_BASE_URL}/clear-history")

   - fetch('http://localhost:8000/upload')# Returns: {"status": "success"}

   - fetch('http://localhost:8000/ask')```

4. Build chat UI with React components

5. Deploy React app separately from backend**Used For**:

```- Sidebar "Clear History" button

- Reset conversation state

**Benefits**:

- ✅ Backend already prepared (REST API)---

- ✅ No backend changes required

- ✅ Same API endpoints work for both frontends## 📊 Session State Management

- ✅ Can run Streamlit and React simultaneously for testing

Streamlit uses **session state** to maintain data across reruns:

---

```python

## 📚 Further Reading# Initialize session state

if "messages" not in st.session_state:

- **Backend API**: See `backend/README.md`    st.session_state.messages = []

- **API Reference**: See `docs/FASTAPI_QUICK_REFERENCE.md`

- **Architecture**: See `docs/ARCHITECTURE.md`if "api_connected" not in st.session_state:

- **Streamlit Docs**: https://docs.streamlit.io    st.session_state.api_connected = False



---# Add message to history

st.session_state.messages.append({

**Ready to start using AI Documind? Run `python main.py` and chat with your documents! 🚀**    "role": "user",

    "content": "What is RAG?"
})

# Display all messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
```

**Session State Variables**:

| Variable | Type | Purpose |
|----------|------|---------|
| `messages` | List[dict] | Chat history (user + assistant messages) |
| `api_connected` | bool | Backend connection status |
| `uploaded_files` | List[File] | Currently uploaded files |

---

## 🎨 UI Components

### **Chat Interface**

```python
# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
        
        # Show sources if available
        if "sources" in msg:
            with st.expander("📄 Sources"):
                for src in msg["sources"]:
                    st.caption(f"**{src['source']}** (Chunk {src['chunk_id']})")
                    st.text(src["content"])

# User input
if question := st.chat_input("Ask a question"):
    # Process question...
```

---

### **File Uploader**

```python
uploaded_files = st.file_uploader(
    "Upload documents",
    type=["pdf", "docx", "pptx", "txt"],
    accept_multiple_files=True
)

if st.button("Upload Documents"):
    if uploaded_files:
        # Send to backend...
    else:
        st.warning("Please select files first")
```

---

### **Connection Status**

```python
if st.session_state.api_connected:
    st.sidebar.success(f"✅ Connected to {API_BASE_URL}")
else:
    st.sidebar.error(f"❌ Cannot reach API")
    st.sidebar.warning("⚠️ Make sure backend is running")

# Reconnect button
if st.sidebar.button("🔄 Reconnect"):
    st.session_state.api_connected = check_api_health()
    st.rerun()
```

---

## 🚀 Running the Frontend

### **Standalone Mode** (requires backend running separately)

```bash
# Terminal 1: Start backend
uvicorn backend.api:app --reload --port 8000

# Terminal 2: Start frontend
streamlit run frontend/app_api.py --server.port 8501
```

---

### **Unified Mode** (automatic startup)

```bash
# Starts both backend + frontend
python main.py
```

This automatically:
1. Starts FastAPI backend on port 8000
2. Waits 3 seconds for initialization
3. Starts Streamlit frontend on port 8501
4. Opens browser automatically

---

### **Admin Dashboard**

```bash
# Run admin interface (requires backend running)
streamlit run frontend/admin.py --server.port 8502
```

Access at: http://localhost:8502

---

## 🔧 Configuration

### **Environment Variables**

```env
# .env file

# Backend URL (change for production)
API_BASE_URL=http://localhost:8000

# Streamlit settings (optional)
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_HEADLESS=false
```

---

### **Streamlit Config**

Create `.streamlit/config.toml` for customization:

```toml
[theme]
primaryColor = "#FF4B4B"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"

[server]
port = 8501
headless = false
```

---

## 📦 Dependencies

```
streamlit           # Web framework
requests            # HTTP client for API calls
pandas              # Data manipulation (admin dashboard)
plotly              # Charts (admin dashboard)
python-dotenv       # Environment variables
```

Install with:
```bash
pip install -r requirements.txt
```

---

## 🔍 Troubleshooting

### **Problem**: "Cannot reach API" error
**Solution**: 
1. Check if backend is running: `http://localhost:8000/health`
2. Verify `API_BASE_URL` in `.env`
3. Click "🔄 Reconnect" button

---

### **Problem**: File upload fails
**Solution**:
1. Check file format is supported (PDF, DOCX, PPTX, TXT)
2. Verify file size (< 200MB)
3. Check backend logs for errors

---

### **Problem**: Chat history disappears
**Solution**:
- Session state clears on page refresh (by design)
- Use admin dashboard to view persistent history
- History is saved in SQLite database

---

### **Problem**: Slow response times
**Solution**:
1. Check backend processing time
2. Reduce `TOP_K_CHUNKS` in backend config
3. Use faster LLM provider (Groq is fastest)

---

## 🎯 Key Design Decisions

1. **Why API Mode?** - Enables scaling, separation of concerns, easy React migration
2. **Why Streamlit?** - Rapid prototyping, built-in components, Python-based
3. **Why Session State?** - Maintains chat history across reruns without database
4. **Why Separate Admin?** - Keeps main interface simple, specialized analytics view
5. **Why Requests Library?** - Simple, reliable HTTP client for API calls

---

## 🔮 Future Migration to React

The current architecture is **React-ready**:

1. **Backend API**: Already RESTful, no changes needed
2. **Frontend Logic**: Simple HTTP calls to same endpoints
3. **State Management**: Use React hooks (useState, useEffect)
4. **UI Components**: Replace Streamlit with React components

**Migration Steps**:
```
1. Keep backend unchanged (FastAPI)
2. Create React app: npx create-react-app rag-frontend
3. Replace API calls:
   - fetch('http://localhost:8000/upload')
   - fetch('http://localhost:8000/ask')
4. Build chat UI with React components
5. Deploy React app separately from backend
```

**Benefits**:
- ✅ Backend already prepared (REST API)
- ✅ No backend changes required
- ✅ Same API endpoints work for both frontends
- ✅ Can run Streamlit and React simultaneously for testing

---

## 📚 Further Reading

- **Backend API**: See `backend/README.md`
- **API Reference**: See `docs/FASTAPI_QUICK_REFERENCE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Streamlit Docs**: https://docs.streamlit.io

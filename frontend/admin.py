"""
Admin Dashboard for RAG System
Analytics, monitoring, and conversation history management
"""

import streamlit as st
import requests
import pandas as pd
import json
import time
from datetime import datetime
from typing import List, Dict
import os

st.set_page_config(page_title="AIDocmind Admin Dashboard", layout="wide", page_icon="📊")

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

st.title("📊 AIDocmind Admin Dashboard")
st.caption(f"Connected to: {API_BASE_URL}")

# Check API connectivity
@st.cache(ttl=5, allow_output_mutation=True)
def check_api_health() -> bool:
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

# Fetch conversation history
@st.cache(ttl=10, allow_output_mutation=True)
def fetch_history(limit: int = 1000) -> List[Dict]:
    try:
        response = requests.get(f"{API_BASE_URL}/history?limit={limit}", timeout=10)
        if response.status_code == 200:
            return response.json()
        return []
    except:
        return []

# Connection status
col1, col2, col3 = st.columns([2, 1, 1])
with col1:
    if check_api_health():
        st.success("✅ API Connected")
    else:
        st.error("❌ API Disconnected")

with col2:
    refresh_button = st.button("🔄 Refresh Data")
    if refresh_button:
        # Force refresh by creating new session state key
        import time
        st.session_state['refresh_time'] = time.time()

with col3:
    if st.button("🗑️ Clear All Data"):
        confirm = st.checkbox("⚠️ Confirm deletion", key="confirm_delete")
        if confirm:
            try:
                response = requests.post(f"{API_BASE_URL}/clear", timeout=10)
                if response.status_code == 200:
                    st.success("✅ Data cleared!")
                    st.session_state['refresh_time'] = time.time()
            except Exception as e:
                st.error(f"❌ Error: {e}")

st.markdown("---")

# Fetch data
history = fetch_history(1000)

if not history:
    st.warning("⚠️ No conversation history found. Start chatting to see analytics!")
    st.stop()

# Convert to DataFrame
df = pd.DataFrame(history)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['date'] = df['timestamp'].dt.date
df['hour'] = df['timestamp'].dt.hour

# Overview Metrics
st.header("📈 Overview")
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Total Conversations", len(df))

with col2:
    avg_duration = df['duration_s'].mean()
    st.metric("Avg Response Time", f"{avg_duration:.2f}s")

with col3:
    success_rate = (df['status'] == 'success').sum() / len(df) * 100
    st.metric("Success Rate", f"{success_rate:.1f}%")

with col4:
    unique_days = df['date'].nunique()
    st.metric("Active Days", unique_days)

st.markdown("---")

# Charts Section
st.header("📊 Analytics")

tab1, tab2, tab3, tab4 = st.tabs(["📅 Timeline", "🤖 Providers", "⚡ Performance", "📋 Details"])

with tab1:
    st.subheader("Conversations Over Time")
    
    # Daily conversation count
    daily_counts = df.groupby('date').size().reset_index(name='count')
    st.line_chart(daily_counts.set_index('date'))
    
    # Hourly heatmap
    st.subheader("Activity by Hour of Day")
    hourly_counts = df.groupby('hour').size()
    st.bar_chart(hourly_counts)

with tab2:
    st.subheader("Provider Usage")
    
    col1, col2 = st.columns(2)
    
    with col1:
        provider_counts = df['provider'].value_counts()
        st.bar_chart(provider_counts)
    
    with col2:
        st.markdown("**Provider Statistics:**")
        for provider in df['provider'].unique():
            provider_df = df[df['provider'] == provider]
            avg_time = provider_df['duration_s'].mean()
            success = (provider_df['status'] == 'success').sum()
            total = len(provider_df)
            
            st.markdown(f"**{provider}**")
            st.markdown(f"- Calls: {total}")
            st.markdown(f"- Avg Time: {avg_time:.2f}s")
            st.markdown(f"- Success: {success}/{total} ({success/total*100:.1f}%)")
            st.markdown("---")

with tab3:
    st.subheader("Performance Metrics")
    
    # Response time distribution
    st.markdown("**Response Time Distribution**")
    st.bar_chart(df['duration_s'].value_counts().sort_index())
    
    # Performance by provider
    st.markdown("**Average Response Time by Provider**")
    provider_perf = df.groupby('provider')['duration_s'].mean().sort_values()
    st.bar_chart(provider_perf)
    
    # Slowest queries
    st.markdown("**🐌 Slowest Queries (Top 10)**")
    slowest = df.nlargest(10, 'duration_s')[['timestamp', 'question', 'provider', 'duration_s']]
    st.dataframe(slowest)

with tab4:
    st.subheader("Conversation Details")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    
    with col1:
        filter_provider = st.multiselect(
            "Filter by Provider",
            options=df['provider'].unique().tolist(),
            default=df['provider'].unique().tolist()
        )
    
    with col2:
        filter_status = st.multiselect(
            "Filter by Status",
            options=df['status'].unique().tolist(),
            default=df['status'].unique().tolist()
        )
    
    with col3:
        min_duration = st.slider(
            "Min Duration (s)",
            min_value=0.0,
            max_value=float(df['duration_s'].max()),
            value=0.0
        )
    
    # Apply filters
    filtered_df = df[
        (df['provider'].isin(filter_provider)) &
        (df['status'].isin(filter_status)) &
        (df['duration_s'] >= min_duration)
    ]
    
    st.markdown(f"**Showing {len(filtered_df)} / {len(df)} conversations**")
    
    # Search
    search_query = st.text_input("🔍 Search in questions/answers", "")
    if search_query:
        filtered_df = filtered_df[
            filtered_df['question'].str.contains(search_query, case=False, na=False) |
            filtered_df['answer'].str.contains(search_query, case=False, na=False)
        ]
        st.markdown(f"**Found {len(filtered_df)} matching conversations**")
    
    # Display table
    display_df = filtered_df[['timestamp', 'question', 'answer', 'provider', 'duration_s', 'status']].copy()
    display_df['question'] = display_df['question'].str[:100] + "..."
    display_df['answer'] = display_df['answer'].str[:100] + "..."
    
    st.dataframe(
        display_df.sort_values('timestamp', ascending=False),
        height=400
    )
    
    # Detailed view
    st.markdown("---")
    st.subheader("🔍 Detailed Conversation View")
    
    if len(filtered_df) > 0:
        selected_idx = st.selectbox(
            "Select conversation to view",
            options=range(len(filtered_df)),
            format_func=lambda i: f"{filtered_df.iloc[i]['timestamp']} - {filtered_df.iloc[i]['question'][:50]}..."
        )
        
        selected = filtered_df.iloc[selected_idx]
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**📝 Question:**")
            st.info(selected['question'])
            
            st.markdown("**💡 Answer:**")
            st.success(selected['answer'])
        
        with col2:
            st.markdown("**📊 Metadata:**")
            st.json({
                "ID": int(selected['id']),
                "Timestamp": str(selected['timestamp']),
                "Provider": selected['provider'],
                "Duration": f"{selected['duration_s']:.2f}s",
                "Status": selected['status']
            })
            
            st.markdown("**📚 Sources:**")
            try:
                sources = json.loads(selected['sources']) if isinstance(selected['sources'], str) else selected['sources']
                if sources:
                    for i, src in enumerate(sources, 1):
                        # Handle new dict format with source, page, chunk_id
                        if isinstance(src, dict):
                            source_text = src.get('source', 'N/A')
                            page = src.get('page')
                            chunk_id = src.get('chunk_id', '')
                            if page:
                                st.markdown(f"{i}. **{source_text}** (Page {page}, Chunk {chunk_id})")
                            else:
                                st.markdown(f"{i}. **{source_text}** (Chunk {chunk_id})")
                        else:
                            # Fallback for string format
                            st.markdown(f"{i}. {src}")
                else:
                    st.markdown("_No sources_")
            except Exception as e:
                st.markdown(f"_Could not parse sources: {e}_")

st.markdown("---")

# Export Section
st.header("📥 Data Export")

col1, col2 = st.columns(2)

with col1:
    if st.button("📊 Export to CSV"):
        csv = df.to_csv(index=False)
        st.download_button(
            label="⬇️ Download CSV",
            data=csv,
            file_name=f"rag_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )

with col2:
    if st.button("📋 Export to JSON"):
        json_data = df.to_json(orient='records', date_format='iso')
        st.download_button(
            label="⬇️ Download JSON",
            data=json_data,
            file_name=f"rag_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            mime="application/json"
        )

# Footer
st.markdown("---")
st.caption("💡 **Tip:** Use filters and search to find specific conversations. Refresh data every 10 seconds automatically.")

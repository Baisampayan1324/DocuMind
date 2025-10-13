"""
Database Models using SQLAlchemy ORM
Replaces raw SQL with proper ORM for scalability
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import List, Optional, Dict, Generator
import json
from backend.config import Config

# Create base class
Base = declarative_base()

class Conversation(Base):
    """Conversation history model"""
    __tablename__ = 'conversations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)  # JSON string
    provider = Column(String(50), nullable=True, index=True)
    duration_s = Column(Float, nullable=True)
    status = Column(String(20), nullable=True, index=True)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp is not None else None,  # type: ignore
            'question': self.question,
            'answer': self.answer,
            'sources': json.loads(self.sources) if self.sources is not None else [],  # type: ignore
            'provider': self.provider,
            'duration_s': self.duration_s,
            'status': self.status
        }

# Database engine and session factory
engine = create_engine(f'sqlite:///{Config.HISTORY_DB_PATH}', echo=False)
SessionLocal = sessionmaker(bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def save_conversation(
    question: str,
    answer: str,
    sources: List[Dict],
    provider: str,
    duration_s: float,
    status: str = "success"
) -> Optional[int]:
    """
    Save conversation to database using ORM
    
    Args:
        question: User question
        answer: AI answer
        sources: List of source documents
        provider: LLM provider used
        duration_s: Response time in seconds
        status: Status of the conversation
    
    Returns:
        Conversation ID if successful, None otherwise
    """
    try:
        db = SessionLocal()
        
        conversation = Conversation(
            question=question,
            answer=answer,
            sources=json.dumps(sources),
            provider=provider,
            duration_s=duration_s,
            status=status
        )
        
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        conv_id: int = conversation.id  # type: ignore
        db.close()
        
        return conv_id
    
    except Exception as e:
        print(f"Error saving conversation: {e}")
        return None

def list_conversations(
    limit: int = 100,
    offset: int = 0,
    provider: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict]:
    """
    List conversations with filters
    
    Args:
        limit: Maximum number of conversations to return
        offset: Number of conversations to skip
        provider: Filter by provider (optional)
        status: Filter by status (optional)
    
    Returns:
        List of conversation dictionaries
    """
    try:
        db = SessionLocal()
        
        query = db.query(Conversation)
        
        # Apply filters
        if provider:
            query = query.filter(Conversation.provider == provider)
        if status:
            query = query.filter(Conversation.status == status)
        
        # Order by timestamp descending (newest first)
        query = query.order_by(Conversation.timestamp.desc())
        
        # Apply pagination
        conversations = query.offset(offset).limit(limit).all()
        
        result = [conv.to_dict() for conv in conversations]
        db.close()
        
        return result
    
    except Exception as e:
        print(f"Error listing conversations: {e}")
        return []

def get_conversation_by_id(conversation_id: int) -> Optional[Dict]:
    """Get single conversation by ID"""
    try:
        db = SessionLocal()
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        
        if conversation:
            result = conversation.to_dict()
            db.close()
            return result
        
        db.close()
        return None
    
    except Exception as e:
        print(f"Error getting conversation: {e}")
        return None

def delete_all_conversations() -> bool:
    """Delete all conversations"""
    try:
        db = SessionLocal()
        db.query(Conversation).delete()
        db.commit()
        db.close()
        return True
    
    except Exception as e:
        print(f"Error deleting conversations: {e}")
        return False

def get_conversation_stats() -> Dict:
    """Get conversation statistics"""
    try:
        db = SessionLocal()
        
        total = db.query(Conversation).count()
        
        stats = {
            'total_conversations': total,
            'providers': {},
            'statuses': {}
        }
        
        # Provider stats
        from sqlalchemy import func
        provider_stats = db.query(
            Conversation.provider,
            func.count(Conversation.id).label('count'),
            func.avg(Conversation.duration_s).label('avg_duration')
        ).group_by(Conversation.provider).all()
        
        for provider, count, avg_duration in provider_stats:
            stats['providers'][provider or 'unknown'] = {
                'count': count,
                'avg_duration_s': float(avg_duration) if avg_duration else 0
            }
        
        # Status stats
        status_stats = db.query(
            Conversation.status,
            func.count(Conversation.id).label('count')
        ).group_by(Conversation.status).all()
        
        for status, count in status_stats:
            stats['statuses'][status or 'unknown'] = count
        
        db.close()
        return stats
    
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {}

def search_conversations(search_term: str, limit: int = 50) -> List[Dict]:
    """
    Search conversations by question or answer content
    
    Args:
        search_term: Term to search for
        limit: Maximum results
    
    Returns:
        List of matching conversations
    """
    try:
        db = SessionLocal()
        
        conversations = db.query(Conversation).filter(
            (Conversation.question.contains(search_term)) |
            (Conversation.answer.contains(search_term))
        ).order_by(Conversation.timestamp.desc()).limit(limit).all()
        
        result = [conv.to_dict() for conv in conversations]
        db.close()
        
        return result
    
    except Exception as e:
        print(f"Error searching conversations: {e}")
        return []

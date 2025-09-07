from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db, ChatSession, ChatMessage, User
from ..models.schemas import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageResponse,
    QueryRequest, MultiAgentResponse
)
from ..routes.auth import get_current_user
from ..agents.orchestrator import orchestrator
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat session"""
    chat_session = ChatSession(
        session_name=session_data.session_name,
        user_id=current_user.id
    )
    
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    
    return chat_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all chat sessions for the current user"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific chat session"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return session

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages in a chat session"""
    # Verify session belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return messages

@router.post("/query", response_model=MultiAgentResponse)
async def process_query(
    query_data: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process a query using the multi-agent system"""
    
    # Verify session belongs to user if provided
    if query_data.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == query_data.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    
    try:
        # Process query through multi-agent system
        result = await orchestrator.process_query(
            query=query_data.query,
            max_chunks=query_data.max_chunks,
            include_metadata=query_data.include_metadata
        )
        
        # Save messages to database if session is provided
        if query_data.session_id:
            # Save user message
            user_message = ChatMessage(
                session_id=query_data.session_id,
                message_type="user",
                content=query_data.query
            )
            db.add(user_message)
            
            # Save assistant response
            assistant_metadata = {
                "decision": result.final_response.decision,
                "confidence_score": result.final_response.confidence_score,
                "processing_time_ms": result.total_processing_time_ms,
                "sources_count": len(result.final_response.sources),
                "agent_steps": len(result.agent_steps)
            }
            
            assistant_message = ChatMessage(
                session_id=query_data.session_id,
                message_type="assistant",
                content=result.final_response.justification,
                message_metadata=json.dumps(assistant_metadata)
            )
            db.add(assistant_message)
            
            # Update session timestamp
            session.updated_at = db.query(ChatMessage).filter(
                ChatMessage.session_id == query_data.session_id
            ).order_by(ChatMessage.created_at.desc()).first().created_at
            
            db.commit()
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat session and all its messages"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    try:
        # Delete all messages in the session
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        
        # Delete the session
        db.delete(session)
        db.commit()
        
        return {"message": "Chat session deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete chat session: {str(e)}"
        )

@router.get("/pipeline/status")
async def get_pipeline_status(current_user: User = Depends(get_current_user)):
    """Get the status of the multi-agent pipeline"""
    return orchestrator.get_pipeline_status()

@router.get("/pipeline/validate")
async def validate_pipeline(current_user: User = Depends(get_current_user)):
    """Validate that the multi-agent pipeline is working correctly"""
    return await orchestrator.validate_pipeline()
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Document Schemas
class DocumentBase(BaseModel):
    filename: str
    original_filename: str

class DocumentCreate(DocumentBase):
    file_path: str
    file_size: int
    content_type: str

class DocumentResponse(DocumentBase):
    id: int
    processing_status: str
    created_at: datetime
    owner_id: int
    
    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document_id: int
    processing_status: str

# Chat Schemas
class ChatSessionCreate(BaseModel):
    session_name: str

class ChatSessionResponse(BaseModel):
    id: int
    session_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    session_id: int
    message_type: str = "user"

class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    message_type: str
    message_metadata: Optional[Dict[Any, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Query Processing Schemas
class QueryRequest(BaseModel):
    query: str
    session_id: Optional[int] = None
    max_chunks: int = 10
    include_metadata: bool = True

class SourceClause(BaseModel):
    clause_text: str
    document_name: str
    page_number: Optional[int] = None
    confidence_score: float

class QueryResponse(BaseModel):
    decision: str  # approved, rejected, requires_more_info
    amount: Optional[float] = None
    justification: str
    sources: List[SourceClause]
    confidence_score: float
    processing_time_ms: int

# Agent Response Schemas
class AgentStep(BaseModel):
    agent_name: str
    action: str
    reasoning: str
    output: Dict[Any, Any]

class MultiAgentResponse(BaseModel):
    final_response: QueryResponse
    agent_steps: List[AgentStep]
    total_processing_time_ms: int

# Health Check
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, str]
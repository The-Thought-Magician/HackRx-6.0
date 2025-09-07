import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db, Document, User
from ..models.schemas import DocumentResponse, DocumentUploadResponse
from ..routes.auth import get_current_user
from ..services.qdrant_service import qdrant_service
from ..core.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document to the knowledge base"""
    
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {file.size} exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create database record
        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file.size,
            content_type=file.content_type,
            processing_status="pending",
            owner_id=current_user.id
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Process and upload to Trieve (async)
        try:
            document.processing_status = "processing"
            db.commit()
            
            chunk_ids = await qdrant_service.upload_file_chunks(
                file_path=file_path,
                document_id=document.id,
                filename=file.filename
            )
            
            # Update document with chunk IDs
            document.trieve_chunk_ids = ",".join(chunk_ids) if chunk_ids else ""
            document.processing_status = "completed"
            db.commit()
            
        except Exception as e:
            document.processing_status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process document: {str(e)}"
            )
        
        return DocumentUploadResponse(
            message="Document uploaded and processed successfully",
            document_id=document.id,
            processing_status=document.processing_status
        )
        
    except Exception as e:
        # Clean up file if database operation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for the current user"""
    documents = db.query(Document).filter(Document.owner_id == current_user.id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Remove file from disk
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # TODO: Remove chunks from Trieve
        # This would require implementing a delete_chunks method in trieve_service
        
        # Remove from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reprocess a document (e.g., if processing failed)"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on disk"
        )
    
    try:
        document.processing_status = "processing"
        db.commit()
        
        chunk_ids = await qdrant_service.upload_file_chunks(
            file_path=document.file_path,
            document_id=document.id,
            filename=document.original_filename
        )
        
        document.trieve_chunk_ids = ",".join(chunk_ids) if chunk_ids else ""
        document.processing_status = "completed"
        db.commit()
        
        return {
            "message": "Document reprocessed successfully",
            "processing_status": document.processing_status
        }
        
    except Exception as e:
        document.processing_status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reprocess document: {str(e)}"
        )
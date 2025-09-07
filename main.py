from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core.config import settings
from src.models.database import create_tables
from src.routes import auth, documents, chat, health
from src.services.qdrant_service import qdrant_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Insurance RAG API...")
    
    # Create database tables
    create_tables()
    print("Database tables created/verified")
    
    yield
    
    # Shutdown
    print("Shutting down Insurance RAG API...")
    await qdrant_service.close()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent RAG system for insurance document processing",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Insurance RAG API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

@app.get("/api")
async def api_info():
    """API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_version": settings.API_V1_STR,
        "endpoints": {
            "authentication": f"{settings.API_V1_STR}/auth",
            "documents": f"{settings.API_V1_STR}/documents",
            "chat": f"{settings.API_V1_STR}/chat",
            "health": f"{settings.API_V1_STR}/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
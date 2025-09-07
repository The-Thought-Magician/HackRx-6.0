from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from ..models.database import get_db
from ..models.schemas import HealthCheck
from ..core.config import settings

router = APIRouter(prefix="/health", tags=["health"])

def _gather_health(db: Session) -> HealthCheck:
    """Internal reusable health aggregation."""
    # Database connectivity (SQLAlchemy 2.0 compatible)
    try:
        db.execute(text("SELECT 1"))
        database_status = "healthy"
    except Exception:  # noqa: BLE001 - broad for health reporting
        database_status = "unhealthy"

    qdrant_status = "configured" if settings.QDRANT_URL else "not_configured"
    openai_status = "configured" if settings.OPENAI_API_KEY else "not_configured"

    return HealthCheck(
        status="healthy" if database_status == "healthy" else "unhealthy",
        timestamp=datetime.now(),
        version=settings.VERSION,
        services={
            "database": database_status,
            "qdrant": qdrant_status,
            "openai": openai_status,
            "file_upload": "healthy" if settings.UPLOAD_DIR else "not_configured",
        },
    )


@router.get("/", response_model=HealthCheck)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint (trailing slash)."""
    return _gather_health(db)


@router.get("", include_in_schema=False)
async def health_check_no_slash(db: Session = Depends(get_db)):
    """Health check endpoint (no trailing slash) to avoid 307 redirects."""
    return _gather_health(db)
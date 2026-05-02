from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=HealthResponse)
def health_check():
    """
    Check API health status.
    """
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        project_name=settings.PROJECT_NAME
    )

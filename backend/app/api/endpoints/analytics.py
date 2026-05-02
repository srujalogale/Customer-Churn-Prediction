from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analytics import AnalyticsOverview
from app.services.analytics import analytics_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get aggregated analytics overview including churn rate and high-risk customers.
    """
    return analytics_service.get_overview(db)

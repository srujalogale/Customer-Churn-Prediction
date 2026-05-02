from fastapi import APIRouter
from app.api.endpoints import health, auth, customers, ml, analytics

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(ml.router, tags=["ml"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

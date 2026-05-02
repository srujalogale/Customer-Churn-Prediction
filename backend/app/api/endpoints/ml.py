from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.ml import ChurnPredictionRequest, ChurnPredictionResponse
from app.services.ml import ml_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/predict-churn", response_model=ChurnPredictionResponse)
def predict_churn_endpoint(
    request: ChurnPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Predict churn for arbitrary customer data.
    """
    try:
        return ml_service.predict_from_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-risk/{customer_id}", response_model=ChurnPredictionResponse)
def get_customer_risk(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get churn prediction for an existing customer by ID.
    """
    try:
        prediction = ml_service.predict_for_customer(db, customer_id)
        if not prediction:
            raise HTTPException(status_code=404, detail="Customer not found")
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

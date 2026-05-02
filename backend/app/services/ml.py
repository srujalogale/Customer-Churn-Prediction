from sqlalchemy.orm import Session
from app.ml.predict import predict_churn
from app.schemas.ml import ChurnPredictionRequest, ChurnPredictionResponse
from app.services.customer import customer_service

class MLService:
    def predict_from_data(self, data: ChurnPredictionRequest) -> ChurnPredictionResponse:
        result = predict_churn(
            inactivity_days=data.inactivity_days,
            total_transactions=data.total_transactions,
            usage_frequency=data.usage_frequency
        )
        return ChurnPredictionResponse(
            churn_probability=result["churn_probability"],
            risk_level=result["risk_level"]
        )
        
    def predict_for_customer(self, db: Session, customer_id: str) -> ChurnPredictionResponse:
        customer = customer_service.get_customer(db, customer_id)
        if not customer:
            return None
        
        # Calculate inactivity days (example logic)
        from datetime import datetime
        last_date = customer.last_active or customer.signup_date
        inactivity_days = (datetime.utcnow() - last_date).days if last_date else 0
        
        result = predict_churn(
            inactivity_days=inactivity_days,
            total_transactions=customer.total_transactions or 0,
            usage_frequency=customer.usage_frequency or 0.0
        )
        
        return ChurnPredictionResponse(
            churn_probability=result["churn_probability"],
            risk_level=result["risk_level"]
        )

ml_service = MLService()

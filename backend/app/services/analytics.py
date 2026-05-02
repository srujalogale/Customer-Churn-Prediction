from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.ml.predict import get_model
import numpy as np
from datetime import datetime

class AnalyticsService:
    def get_overview(self, db: Session) -> dict:
        # Efficiently query only the required columns
        customers_data = db.query(
            Customer.last_active,
            Customer.signup_date,
            Customer.total_transactions,
            Customer.usage_frequency
        ).all()
        
        total_customers = len(customers_data)
        if total_customers == 0:
            return {
                "churn_rate": 0.0,
                "total_customers": 0,
                "high_risk_customers": 0
            }
            
        features = []
        now = datetime.utcnow()
        for c in customers_data:
            last_date = c.last_active or c.signup_date
            inactivity_days = (now - last_date).days if last_date else 0
            features.append([
                inactivity_days,
                c.total_transactions or 0,
                c.usage_frequency or 0.0
            ])
            
        # Convert to numpy array for fast vectorized prediction
        features_array = np.array(features)
        
        model = get_model()
        # predict_proba returns probabilities for class 0 and class 1
        probabilities = model.predict_proba(features_array)[:, 1]
        
        churned_count = np.sum(probabilities > 0.5)
        high_risk_count = np.sum(probabilities > 0.8)
        
        churn_rate = (churned_count / total_customers) * 100
        
        return {
            "churn_rate": round(float(churn_rate), 2),
            "total_customers": total_customers,
            "high_risk_customers": int(high_risk_count)
        }

analytics_service = AnalyticsService()

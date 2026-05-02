from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    churn_rate: float
    total_customers: int
    high_risk_customers: int

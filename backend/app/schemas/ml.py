from pydantic import BaseModel

class ChurnPredictionRequest(BaseModel):
    inactivity_days: int
    total_transactions: int
    usage_frequency: float

class ChurnPredictionResponse(BaseModel):
    churn_probability: float
    risk_level: str

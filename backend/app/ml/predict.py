import joblib
import os
import numpy as np

# Load model globally so it's only loaded once when the module is imported
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")

# Initialize model variable
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run train_model.py first.")
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_churn(inactivity_days: int, total_transactions: int, usage_frequency: float) -> dict:
    """
    Predict churn probability and determine risk level.
    """
    model = get_model()
    
    # Prepare features in the exact order: [inactivity_days, total_transactions, usage_frequency]
    features = np.array([[inactivity_days, total_transactions, usage_frequency]])
    
    # Get probability of positive class (churn)
    probability = float(model.predict_proba(features)[0][1])
    
    # Determine risk level
    if probability < 0.33:
        risk_level = "low"
    elif probability < 0.66:
        risk_level = "medium"
    else:
        risk_level = "high"
        
    return {
        "churn_probability": probability,
        "risk_level": risk_level
    }

import numpy as np
import joblib
import os
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

def generate_synthetic_data(num_samples=1000):
    """
    Generate synthetic data for churn prediction.
    Features: inactivity_days, total_transactions, usage_frequency
    """
    np.random.seed(42)
    
    # Feature 1: inactivity_days (0 to 365 days)
    inactivity_days = np.random.randint(0, 365, num_samples)
    
    # Feature 2: total_transactions (0 to 500)
    total_transactions = np.random.randint(0, 500, num_samples)
    
    # Feature 3: usage_frequency (0.0 to 10.0 per month)
    usage_frequency = np.random.uniform(0.0, 10.0, num_samples)
    
    # Target: churn (0 or 1)
    # Higher inactivity, lower transactions, and lower usage frequency -> higher chance of churn
    logit = (inactivity_days * 0.02) - (total_transactions * 0.01) - (usage_frequency * 0.5)
    
    # Convert logit to probability
    probabilities = 1 / (1 + np.exp(-logit))
    
    # Generate labels based on probabilities
    y = (probabilities > 0.5).astype(int)
    
    # Combine features into X
    X = np.column_stack((inactivity_days, total_transactions, usage_frequency))
    
    return X, y

def train_and_save_model():
    X, y = generate_synthetic_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Save the model
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "model.pkl")
    joblib.dump(model, model_path)
    print(f"Model successfully trained and saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()

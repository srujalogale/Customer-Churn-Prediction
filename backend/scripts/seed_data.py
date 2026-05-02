import os
import sys
import random
import uuid
from datetime import datetime, timedelta

# Add the parent directory to sys.path to allow importing app modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.models.customer import Customer
# Import user to ensure the table gets created as well
from app.models.user import User

def generate_random_name():
    first_names = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn"]
    last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def generate_realistic_customer():
    name = generate_random_name()
    email = f"{name.lower().replace(' ', '.')}.{random.randint(1, 99999)}@example.com"
    
    # Realistic distribution of user states
    user_state = random.choices(["active", "at_risk", "inactive"], weights=[0.6, 0.2, 0.2])[0]
    
    now = datetime.utcnow()
    
    # Signup date between 30 and 1000 days ago
    signup_days_ago = random.randint(30, 1000)
    signup_date = now - timedelta(days=signup_days_ago)
    
    if user_state == "active":
        last_active = now - timedelta(days=random.randint(0, 14))
        total_transactions = random.randint(20, 500)
        usage_frequency = random.uniform(3.0, 10.0)
    elif user_state == "at_risk":
        last_active = now - timedelta(days=random.randint(15, 60))
        total_transactions = random.randint(5, 50)
        usage_frequency = random.uniform(0.5, 3.0)
    else: # inactive
        last_active = now - timedelta(days=random.randint(61, 365))
        total_transactions = random.randint(0, 20)
        usage_frequency = random.uniform(0.0, 0.5)
        
    return Customer(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        signup_date=signup_date,
        last_active=last_active,
        total_transactions=total_transactions,
        usage_frequency=round(usage_frequency, 2)
    )

def seed():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        customer_count = db.query(Customer).count()
        if customer_count > 0:
            print(f"Database already contains {customer_count} customers. Skipping seed.")
            return

        num_customers = random.randint(500, 1000)
        print(f"Generating {num_customers} synthetic customers with realistic distributions...")
        
        customers = [generate_realistic_customer() for _ in range(num_customers)]
        
        # Batch insert for efficiency
        db.bulk_save_objects(customers)
        db.commit()
        
        print(f"Successfully seeded {num_customers} customers!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()

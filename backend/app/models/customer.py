import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float
from app.models.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    signup_date = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, nullable=True)
    total_transactions = Column(Integer, default=0)
    usage_frequency = Column(Float, default=0.0)

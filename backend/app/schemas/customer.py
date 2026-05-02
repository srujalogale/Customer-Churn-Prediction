from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    total_transactions: Optional[int] = 0
    usage_frequency: Optional[float] = 0.0

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    signup_date: datetime
    last_active: Optional[datetime] = None

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    total: int
    items: list[CustomerResponse]

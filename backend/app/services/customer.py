from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate
from typing import Optional

class CustomerService:
    def get_customer(self, db: Session, customer_id: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    def get_customer_by_email(self, db: Session, email: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.email == email).first()

    def get_customers(self, db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[Customer]]:
        total = db.query(Customer).count()
        items = db.query(Customer).offset(skip).limit(limit).all()
        return total, items

    def create_customer(self, db: Session, customer_in: CustomerCreate) -> Customer:
        db_customer = Customer(
            name=customer_in.name,
            email=customer_in.email,
            total_transactions=customer_in.total_transactions,
            usage_frequency=customer_in.usage_frequency
        )
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

customer_service = CustomerService()

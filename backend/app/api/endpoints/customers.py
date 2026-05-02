from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerListResponse
from app.services.customer import customer_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=CustomerListResponse)
def read_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve customers with pagination.
    """
    total, items = customer_service.get_customers(db, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new customer.
    """
    customer = customer_service.get_customer_by_email(db, email=customer_in.email)
    if customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    return customer_service.create_customer(db=db, customer_in=customer_in)

@router.get("/{customer_id}", response_model=CustomerResponse)
def read_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific customer by ID.
    """
    customer = customer_service.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core import security
from typing import Optional

class AuthService:
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        hashed_password = security.get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        if not security.verify_password(password, user.password_hash):
            return None
        return user

auth_service = AuthService()

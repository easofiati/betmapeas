from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean, Column, DateTime, Enum as SQLEnum, ForeignKey,
    Integer, String, Table, Text
)
from sqlalchemy.dialects.postgresql import UUID as SQLUUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy.sql import func, text

from app.db.database import Base
from app.schemas.user import UserRole # This is the Enum for roles

if TYPE_CHECKING:
    # Forward declaration for type hinting relationships
    pass

# Define UserModel first
class UserModel(Base):
    __tablename__ = "users"
    __table_args__ = {"comment": "Tabela de usuários do sistema"}

    id: Mapped[UUID] = mapped_column(SQLUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()"))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, server_default=text("true"))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default=text("false"))
    verification_token: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    password_reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default=text("false"))
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    date_joined: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roles: Mapped[List["UserRoleModel"]] = relationship(
        "UserRoleModel",
        secondary="user_roles", # Use string reference
        primaryjoin='foreign(user_roles.c.user_id) == UserModel.id',
        secondaryjoin='foreign(user_roles.c.role) == UserRoleModel.role',
        back_populates="users",
        lazy="selectin",
        collection_class=set
        # cascade="all, delete", # Consider if this is needed, can cause issues with passive_deletes
        # passive_deletes=True
    )

    def __repr__(self) -> str:
        return f"<UserModel(id={self.id}, email='{self.email}')>"

    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email.split('@')[0]

    def get_roles_enums(self) -> set[UserRole]:
        return {role_model.role for role_model in self.roles}

    def has_role(self, role_to_check: UserRole) -> bool:
        return role_to_check in self.get_roles_enums()

    def has_any_role(self, *roles_to_check: UserRole) -> bool:
        user_enums = self.get_roles_enums()
        return any(r in user_enums for r in roles_to_check)

    def has_all_roles(self, *roles_to_check: UserRole) -> bool:
        user_enums = self.get_roles_enums()
        return all(r in user_enums for r in roles_to_check)

    def is_admin(self) -> bool:
        return self.is_superuser or self.has_role(UserRole.ADMIN)

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> Optional["UserModel"]:
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> Optional["UserModel"]:
        from app.utils.security import verify_password # Import correto
        user = cls.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def to_dict(self) -> dict:
        return {
            "id": str(self.id), "email": self.email, "first_name": self.first_name,
            "last_name": self.last_name, "is_active": self.is_active, "is_verified": self.is_verified,
            "is_superuser": self.is_superuser,
            "roles": [role_enum.value for role_enum in self.get_roles_enums()],
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "date_joined": self.date_joined.isoformat(),
            "created_at": self.created_at.isoformat(), "updated_at": self.updated_at.isoformat(),
        }

# Define UserRoleModel (for role metadata)
class UserRoleModel(Base):
    __tablename__ = "user_roles_info"
    __table_args__ = {"comment": "Informações adicionais sobre os papéis de usuário (descrição, permissões específicas)"}

    # Use the UserRole Enum from app.schemas.user for the 'role' column
    # Ensure the enum type in the database has a unique name if create_type=True
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum_type", create_type=True), # Unified DB enum type name
        primary_key=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    permissions: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True, server_default="{}") # Default to empty array
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel",
        secondary="user_roles", # Use string reference
        primaryjoin='foreign(user_roles.c.role) == UserRoleModel.role',
        secondaryjoin='foreign(user_roles.c.user_id) == UserModel.id',
        back_populates="roles",
        lazy="selectin" # Changed from "dynamic" as selectin is often preferred for many-to-many
    )

    def __repr__(self) -> str:
        return f"<UserRoleModel(role='{self.role.value}')>" # Use .value for Enum

    @classmethod
    def get_role_info(cls, db: Session, role_enum_val: UserRole) -> Optional["UserRoleModel"]:
        return db.query(cls).filter(cls.role == role_enum_val).first()

    @classmethod
    def get_all_roles_info(cls, db: Session) -> list["UserRoleModel"]:
        return db.query(cls).all()

# Define the association table user_roles last
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", SQLUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    # Ensure the enum type in the database has a unique name if create_type=True
    Column("role", SQLEnum(UserRole, name="user_role_enum_type", create_type=True), ForeignKey("user_roles_info.role", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    comment="Tabela de associação para relacionamento muitos-para-muitos entre UserModel e UserRoleModel"
)
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import JSON
from sqlmodel import Column, Field, Relationship, SQLModel


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    UPI = "upi"
    NET_BANKING = "net_banking"
    WALLET = "wallet"
    STRIPE = "stripe"


class Payment(SQLModel, table=True):
    """Payment transactions"""

    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(foreign_key="auth_users.id", index=True)
    course_id: int = Field(foreign_key="courses.id", index=True)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)

    # Payment details
    amount: float
    currency: str = Field(default="INR")
    discount_amount: float = Field(default=0.0)
    final_amount: float
    platform_fee: float = Field(default=0.0)
    teacher_payout: float

    # Payment method and status
    method: PaymentMethod
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)

    # External payment gateway references
    transaction_id: Optional[str] = Field(unique=True, index=True)
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None

    # Additional data
    payment_metadata: dict = Field(sa_column=Column(JSON), default={})

    # Refund information
    refund_amount: float = Field(default=0.0)
    refund_reason: Optional[str] = None
    refunded_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

    # Relationships
    enrollment: Optional["Enrollment"] = Relationship(back_populates="payment")


class PaymentCreate(SQLModel):
    """Schema for creating a payment"""

    course_id: int
    method: PaymentMethod
    amount: float


class PaymentUpdate(SQLModel):
    """Schema for updating a payment"""

    status: Optional[PaymentStatus] = None
    gateway_payment_id: Optional[str] = None
    transaction_id: Optional[str] = None


class PaymentResponse(SQLModel):
    """Schema for payment response"""

    id: int
    student_id: int
    course_id: int
    amount: float
    currency: str
    final_amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

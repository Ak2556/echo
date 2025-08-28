"""
Payment service for handling payment processing.
"""
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.payment import Payment, PaymentStatus, PaymentMethod
from ..core.exceptions import NotFoundException, ValidationException


class PaymentService:
    """Service class for payment processing"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_payment_intent(
        self,
        amount: float,
        currency: str,
        order_id: Optional[int] = None,
        course_id: Optional[int] = None,
        customer_id: int = None,
        payment_method: PaymentMethod = PaymentMethod.STRIPE
    ) -> Dict[str, Any]:
        """Create a payment intent"""
        if amount <= 0:
            raise ValidationException("Amount must be positive")
        
        # Generate transaction ID
        transaction_id = f"TXN-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate platform fee (2.5% + ₹3)
        platform_fee = (amount * 0.025) + 3.0
        teacher_payout = amount - platform_fee
        
        # Create payment record
        payment = Payment(
            student_id=customer_id,
            course_id=course_id,
            teacher_id=None,  # Will be set based on course/order
            amount=amount,
            currency=currency,
            final_amount=amount,
            platform_fee=platform_fee,
            teacher_payout=teacher_payout,
            method=payment_method,
            status=PaymentStatus.PENDING,
            transaction_id=transaction_id
        )
        
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        
        # In a real implementation, you would integrate with payment gateways here
        # For now, return a mock payment intent
        return {
            "payment_id": payment.id,
            "transaction_id": transaction_id,
            "amount": amount,
            "currency": currency,
            "status": "pending",
            "client_secret": f"pi_{uuid.uuid4().hex}",
            "payment_url": f"https://checkout.stripe.com/pay/{uuid.uuid4().hex}"
        }
    
    async def confirm_payment(
        self,
        payment_id: int,
        gateway_payment_id: str,
        gateway_order_id: Optional[str] = None
    ) -> Payment:
        """Confirm a payment"""
        payment = await self.db.get(Payment, payment_id)
        if not payment:
            raise NotFoundException("Payment not found")

        if payment.status != PaymentStatus.PENDING:
            raise ValidationException("Payment is not in pending status")
        
        payment.status = PaymentStatus.COMPLETED
        payment.gateway_payment_id = gateway_payment_id
        payment.gateway_order_id = gateway_order_id
        payment.completed_at = datetime.now(timezone.utc)
        payment.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(payment)
        
        return payment
    
    async def fail_payment(
        self,
        payment_id: int,
        reason: Optional[str] = None
    ) -> Payment:
        """Mark payment as failed"""
        payment = await self.db.get(Payment, payment_id)
        if not payment:
            raise NotFoundException("Payment not found")
        
        payment.status = PaymentStatus.FAILED
        payment.updated_at = datetime.now(timezone.utc)
        
        if reason:
            payment.payment_metadata = payment.payment_metadata or {}
            payment.payment_metadata["failure_reason"] = reason
        
        await self.db.commit()
        await self.db.refresh(payment)
        
        return payment
    
    async def refund_payment(
        self,
        payment_id: int,
        refund_amount: float,
        reason: str
    ) -> Payment:
        """Process a refund"""
        payment = await self.db.get(Payment, payment_id)
        if not payment:
            raise NotFoundException("Payment not found")

        if payment.status != PaymentStatus.COMPLETED:
            raise ValidationException("Can only refund completed payments")

        if refund_amount > payment.final_amount:
            raise ValidationException("Refund amount cannot exceed payment amount")
        
        payment.status = PaymentStatus.REFUNDED
        payment.refund_amount = refund_amount
        payment.refund_reason = reason
        payment.refunded_at = datetime.now(timezone.utc)
        payment.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(payment)
        
        return payment
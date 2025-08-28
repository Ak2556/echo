"""
Unit tests for payment service.
"""

import pytest
from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime
from app.services.payment_service import PaymentService
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.core.exceptions import NotFoundException, ValidationException


class TestPaymentService:
    """Tests for PaymentService class."""

    @pytest.mark.asyncio
    async def test_create_payment_intent_success(self):
        """Test creating a payment intent successfully."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Mock database operations
        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.create_payment_intent(
            amount=1000.0,
            currency="INR",
            order_id=1,
            course_id=1,
            customer_id=1,
            payment_method=PaymentMethod.STRIPE
        )

        assert "payment_id" in result
        assert "transaction_id" in result
        assert result["amount"] == 1000.0
        assert result["currency"] == "INR"
        assert result["status"] == "pending"
        assert "client_secret" in result
        assert "payment_url" in result

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_payment_intent_negative_amount(self):
        """Test creating payment intent with negative amount."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        with pytest.raises(ValidationException, match="Amount must be positive"):
            await service.create_payment_intent(
                amount=-100.0,
                currency="INR",
                customer_id=1
            )

    @pytest.mark.asyncio
    async def test_create_payment_intent_zero_amount(self):
        """Test creating payment intent with zero amount."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        with pytest.raises(ValidationException, match="Amount must be positive"):
            await service.create_payment_intent(
                amount=0.0,
                currency="INR",
                customer_id=1
            )

    @pytest.mark.asyncio
    async def test_create_payment_intent_fee_calculation(self):
        """Test platform fee and teacher payout calculation."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        amount = 1000.0
        result = await service.create_payment_intent(
            amount=amount,
            currency="INR",
            customer_id=1
        )

        # Verify the payment object was created with correct calculations
        # Platform fee = 2.5% + ₹3 = (1000 * 0.025) + 3 = 28.0
        # Teacher payout = 1000 - 28 = 972.0
        payment_arg = mock_db.add.call_args[0][0]
        assert payment_arg.amount == 1000.0
        assert payment_arg.platform_fee == 28.0
        assert payment_arg.teacher_payout == 972.0

    @pytest.mark.asyncio
    async def test_confirm_payment_success(self):
        """Test confirming a payment successfully."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Mock payment
        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.PENDING

        mock_db.get = AsyncMock(return_value=mock_payment)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.confirm_payment(
            payment_id=1,
            gateway_payment_id="gw_123",
            gateway_order_id="order_456"
        )

        assert result == mock_payment
        assert mock_payment.status == PaymentStatus.COMPLETED
        assert mock_payment.gateway_payment_id == "gw_123"
        assert mock_payment.gateway_order_id == "order_456"
        assert mock_payment.completed_at is not None
        assert mock_payment.updated_at is not None

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_confirm_payment_not_found(self):
        """Test confirming non-existent payment."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_db.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundException, match="Payment not found"):
            await service.confirm_payment(
                payment_id=999,
                gateway_payment_id="gw_123"
            )

    @pytest.mark.asyncio
    async def test_confirm_payment_not_pending(self):
        """Test confirming payment that's not in pending status."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Mock payment with completed status
        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.COMPLETED

        mock_db.get = AsyncMock(return_value=mock_payment)

        with pytest.raises(ValidationException, match="Payment is not in pending status"):
            await service.confirm_payment(
                payment_id=1,
                gateway_payment_id="gw_123"
            )

    @pytest.mark.asyncio
    async def test_fail_payment_success(self):
        """Test marking payment as failed."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Mock payment
        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.PENDING
        mock_payment.payment_metadata = {}

        mock_db.get = AsyncMock(return_value=mock_payment)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.fail_payment(
            payment_id=1,
            reason="Insufficient funds"
        )

        assert result == mock_payment
        assert mock_payment.status == PaymentStatus.FAILED
        assert mock_payment.updated_at is not None
        assert mock_payment.payment_metadata["failure_reason"] == "Insufficient funds"

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_fail_payment_no_reason(self):
        """Test failing payment without reason."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.PENDING
        mock_payment.payment_metadata = None

        mock_db.get = AsyncMock(return_value=mock_payment)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.fail_payment(payment_id=1)

        assert result == mock_payment
        assert mock_payment.status == PaymentStatus.FAILED

    @pytest.mark.asyncio
    async def test_fail_payment_not_found(self):
        """Test failing non-existent payment."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_db.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundException, match="Payment not found"):
            await service.fail_payment(payment_id=999)

    @pytest.mark.asyncio
    async def test_refund_payment_success(self):
        """Test refunding a payment successfully."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Mock payment
        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.COMPLETED
        mock_payment.final_amount = 1000.0

        mock_db.get = AsyncMock(return_value=mock_payment)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.refund_payment(
            payment_id=1,
            refund_amount=500.0,
            reason="Customer request"
        )

        assert result == mock_payment
        assert mock_payment.status == PaymentStatus.REFUNDED
        assert mock_payment.refund_amount == 500.0
        assert mock_payment.refund_reason == "Customer request"
        assert mock_payment.refunded_at is not None
        assert mock_payment.updated_at is not None

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_refund_payment_not_found(self):
        """Test refunding non-existent payment."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_db.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundException, match="Payment not found"):
            await service.refund_payment(
                payment_id=999,
                refund_amount=100.0,
                reason="Test"
            )

    @pytest.mark.asyncio
    async def test_refund_payment_not_completed(self):
        """Test refunding payment that's not completed."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.PENDING

        mock_db.get = AsyncMock(return_value=mock_payment)

        with pytest.raises(ValidationException, match="Can only refund completed payments"):
            await service.refund_payment(
                payment_id=1,
                refund_amount=100.0,
                reason="Test"
            )

    @pytest.mark.asyncio
    async def test_refund_payment_exceeds_amount(self):
        """Test refunding more than payment amount."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.COMPLETED
        mock_payment.final_amount = 1000.0

        mock_db.get = AsyncMock(return_value=mock_payment)

        with pytest.raises(ValidationException, match="Refund amount cannot exceed payment amount"):
            await service.refund_payment(
                payment_id=1,
                refund_amount=1500.0,
                reason="Test"
            )

    @pytest.mark.asyncio
    async def test_full_refund(self):
        """Test refunding full payment amount."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.COMPLETED
        mock_payment.final_amount = 1000.0

        mock_db.get = AsyncMock(return_value=mock_payment)
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        result = await service.refund_payment(
            payment_id=1,
            refund_amount=1000.0,
            reason="Full refund"
        )

        assert result == mock_payment
        assert mock_payment.refund_amount == 1000.0


class TestPaymentServiceIntegration:
    """Integration tests for payment service."""

    @pytest.mark.asyncio
    async def test_payment_lifecycle(self):
        """Test complete payment lifecycle."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        # Create payment intent
        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        intent = await service.create_payment_intent(
            amount=1000.0,
            currency="INR",
            customer_id=1
        )

        assert intent["status"] == "pending"

        # Confirm payment
        mock_payment = Mock(spec=Payment)
        mock_payment.status = PaymentStatus.PENDING
        mock_db.get = AsyncMock(return_value=mock_payment)

        confirmed = await service.confirm_payment(
            payment_id=1,
            gateway_payment_id="gw_123"
        )

        assert confirmed.status == PaymentStatus.COMPLETED

    @pytest.mark.asyncio
    async def test_different_payment_methods(self):
        """Test creating payments with different methods."""
        mock_db = AsyncMock()
        service = PaymentService(mock_db)

        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Test with different payment methods
        methods = [
            PaymentMethod.STRIPE,
            PaymentMethod.CREDIT_CARD,
            PaymentMethod.DEBIT_CARD,
            PaymentMethod.UPI,
            PaymentMethod.NET_BANKING,
            PaymentMethod.WALLET
        ]

        for method in methods:
            result = await service.create_payment_intent(
                amount=1000.0,
                currency="INR",
                customer_id=1,
                payment_method=method
            )

            assert result["status"] == "pending"
            payment_arg = mock_db.add.call_args[0][0]
            assert payment_arg.method == method

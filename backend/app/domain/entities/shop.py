"""
Domain entities for shop functionality.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional


class ProductCategory(str, Enum):
    BOOKS = "books"
    STATIONERY = "stationery"
    ELECTRONICS = "electronics"
    EDUCATIONAL_TOOLS = "educational_tools"
    UNIFORMS = "uniforms"
    BAGS = "bags"
    DIGITAL_CONTENT = "digital_content"
    SUBSCRIPTIONS = "subscriptions"


class ProductStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    RETURNED = "returned"


@dataclass
class ProductEntity:
    """Product domain entity"""

    id: Optional[int]
    seller_id: int
    name: str
    description: str
    category: ProductCategory
    price: float
    stock_quantity: int
    status: ProductStatus
    sku: str
    slug: str
    images: List[str]
    tags: List[str]
    is_digital: bool
    requires_shipping: bool
    average_rating: float
    total_reviews: int
    total_sales: int
    created_at: datetime
    updated_at: datetime

    def is_available(self) -> bool:
        """Check if product is available for purchase"""
        return self.status == ProductStatus.ACTIVE and (
            not self.requires_shipping or self.stock_quantity > 0
        )

    def calculate_sale_price(self, discount_percentage: float = 0.0) -> float:
        """Calculate sale price with discount"""
        if discount_percentage > 0:
            return self.price * (1 - discount_percentage / 100)
        return self.price

    def can_fulfill_quantity(self, quantity: int) -> bool:
        """Check if we can fulfill the requested quantity"""
        if self.is_digital:
            return True
        return self.stock_quantity >= quantity

    def reduce_stock(self, quantity: int) -> None:
        """Reduce stock quantity"""
        if not self.is_digital:
            self.stock_quantity = max(0, self.stock_quantity - quantity)

    def add_stock(self, quantity: int) -> None:
        """Add stock quantity"""
        if not self.is_digital:
            self.stock_quantity += quantity


@dataclass
class CartItemEntity:
    """Cart item domain entity"""

    id: Optional[int]
    cart_id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    created_at: datetime

    def update_quantity(self, new_quantity: int, unit_price: float) -> None:
        """Update quantity and recalculate total"""
        self.quantity = new_quantity
        self.unit_price = unit_price
        self.total_price = unit_price * new_quantity


@dataclass
class CartEntity:
    """Shopping cart domain entity"""

    id: Optional[int]
    user_id: int
    items: List[CartItemEntity]
    total_items: int
    total_amount: float
    created_at: datetime
    updated_at: datetime

    def add_item(self, product: ProductEntity, quantity: int) -> None:
        """Add item to cart"""
        # Check if item already exists
        existing_item = next((item for item in self.items if item.product_id == product.id), None)

        if existing_item:
            new_quantity = existing_item.quantity + quantity
            existing_item.update_quantity(new_quantity, product.price)
        else:
            new_item = CartItemEntity(
                id=None,
                cart_id=self.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                total_price=product.price * quantity,
                created_at=datetime.utcnow(),
            )
            self.items.append(new_item)

        self.recalculate_totals()

    def remove_item(self, product_id: int) -> None:
        """Remove item from cart"""
        self.items = [item for item in self.items if item.product_id != product_id]
        self.recalculate_totals()

    def update_item_quantity(self, product_id: int, quantity: int, unit_price: float) -> None:
        """Update item quantity"""
        item = next((item for item in self.items if item.product_id == product_id), None)
        if item:
            if quantity <= 0:
                self.remove_item(product_id)
            else:
                item.update_quantity(quantity, unit_price)
                self.recalculate_totals()

    def recalculate_totals(self) -> None:
        """Recalculate cart totals"""
        self.total_items = sum(item.quantity for item in self.items)
        self.total_amount = sum(item.total_price for item in self.items)

    def clear(self) -> None:
        """Clear all items from cart"""
        self.items = []
        self.total_items = 0
        self.total_amount = 0.0

    def is_empty(self) -> bool:
        """Check if cart is empty"""
        return len(self.items) == 0


@dataclass
class OrderItemEntity:
    """Order item domain entity"""

    id: Optional[int]
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    discount_amount: float
    product_name: str
    product_sku: str
    product_image: Optional[str]


@dataclass
class OrderEntity:
    """Order domain entity"""

    id: Optional[int]
    customer_id: int
    order_number: str
    status: OrderStatus
    items: List[OrderItemEntity]
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    shipping_address: Dict
    billing_address: Dict
    payment_status: str
    payment_method: Optional[str]
    customer_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    def calculate_totals(self) -> None:
        """Calculate order totals"""
        self.subtotal = sum(item.total_price for item in self.items)
        self.total_amount = (
            self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount
        )

    def can_be_cancelled(self) -> bool:
        """Check if order can be cancelled"""
        return self.status in [OrderStatus.PENDING, OrderStatus.CONFIRMED]

    def can_be_refunded(self) -> bool:
        """Check if order can be refunded"""
        return self.status in [OrderStatus.DELIVERED, OrderStatus.SHIPPED]

    def mark_as_shipped(self, tracking_number: Optional[str] = None) -> None:
        """Mark order as shipped"""
        if self.status == OrderStatus.PROCESSING:
            self.status = OrderStatus.SHIPPED
            self.updated_at = datetime.utcnow()

    def mark_as_delivered(self) -> None:
        """Mark order as delivered"""
        if self.status == OrderStatus.SHIPPED:
            self.status = OrderStatus.DELIVERED
            self.updated_at = datetime.utcnow()

    def cancel_order(self, reason: Optional[str] = None) -> None:
        """Cancel the order"""
        if self.can_be_cancelled():
            self.status = OrderStatus.CANCELLED
            self.updated_at = datetime.utcnow()


@dataclass
class ProductReviewEntity:
    """Product review domain entity"""

    id: Optional[int]
    product_id: int
    customer_id: int
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_verified_purchase: bool
    helpful_count: int
    is_approved: bool
    created_at: datetime

    def is_valid_rating(self) -> bool:
        """Check if rating is valid"""
        return 1 <= self.rating <= 5

    def approve(self) -> None:
        """Approve the review"""
        self.is_approved = True

    def mark_helpful(self) -> None:
        """Increment helpful count"""
        self.helpful_count += 1

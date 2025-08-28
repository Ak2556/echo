from sqlmodel import SQLModel, Field, Relationship, Column
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import JSON
from ..utils.database_compat import get_vector_column


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


class Product(SQLModel, table=True):
    """Product model for the shop"""
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: str = Field(foreign_key="auth_users.id", index=True)

    # Basic information
    name: str = Field(index=True)
    description: str
    short_description: Optional[str] = None
    category: ProductCategory = Field(index=True)
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    sku: str = Field(unique=True, index=True)

    # Pricing
    price: float
    currency: str = Field(default="INR")
    discount_percentage: float = Field(default=0.0)
    sale_price: Optional[float] = None
    cost_price: Optional[float] = None

    # Inventory
    stock_quantity: int = Field(default=0)
    min_stock_level: int = Field(default=5)
    max_stock_level: int = Field(default=1000)
    track_inventory: bool = Field(default=True)

    # Physical attributes
    weight: Optional[float] = None  # in kg
    dimensions: Optional[dict] = Field(sa_column=Column(JSON), default={})  # length, width, height
    color: Optional[str] = None
    size: Optional[str] = None

    # Media
    images: List[str] = Field(sa_column=Column(JSON), default=[])
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None

    # SEO and metadata
    tags: List[str] = Field(sa_column=Column(JSON), default=[])
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: str = Field(unique=True, index=True)

    # Status and visibility
    status: ProductStatus = Field(default=ProductStatus.DRAFT)
    is_featured: bool = Field(default=False)
    is_digital: bool = Field(default=False)
    requires_shipping: bool = Field(default=True)

    # Statistics
    total_sales: int = Field(default=0)
    total_revenue: float = Field(default=0.0)
    average_rating: float = Field(default=0.0)
    total_reviews: int = Field(default=0)
    view_count: int = Field(default=0)

    # Shipping
    shipping_weight: Optional[float] = None
    shipping_class: Optional[str] = None
    free_shipping: bool = Field(default=False)

    # Vector embedding for AI recommendations
    embedding: Optional[List[float]] = Field(
        sa_column=get_vector_column(1536),
        default=None
    )

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

    # Relationships
    seller: "User" = Relationship()
    order_items: List["OrderItem"] = Relationship(back_populates="product")
    reviews: List["ProductReview"] = Relationship(back_populates="product")
    cart_items: List["CartItem"] = Relationship(back_populates="product")


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    RETURNED = "returned"


class Order(SQLModel, table=True):
    """Order model for shop purchases"""
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: str = Field(foreign_key="auth_users.id", index=True)
    order_number: str = Field(unique=True, index=True)

    # Order details
    status: OrderStatus = Field(default=OrderStatus.PENDING, index=True)
    subtotal: float
    tax_amount: float = Field(default=0.0)
    shipping_amount: float = Field(default=0.0)
    discount_amount: float = Field(default=0.0)
    total_amount: float

    # Payment
    payment_status: str = Field(default="pending")
    payment_method: Optional[str] = None

    # Shipping information
    shipping_address: dict = Field(sa_column=Column(JSON))
    billing_address: dict = Field(sa_column=Column(JSON))
    shipping_method: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

    # Notes and metadata
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    order_metadata: dict = Field(sa_column=Column(JSON), default={})

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    # Relationships
    customer: "User" = Relationship()
    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    """Individual items in an order"""
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id", index=True)
    product_id: int = Field(foreign_key="products.id", index=True)

    # Item details
    quantity: int
    unit_price: float
    total_price: float
    discount_amount: float = Field(default=0.0)

    # Product snapshot (in case product details change)
    product_name: str
    product_sku: str
    product_image: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    order: Order = Relationship(back_populates="items")
    product: Product = Relationship(back_populates="order_items")


class Cart(SQLModel, table=True):
    """Shopping cart for users"""
    __tablename__ = "carts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="auth_users.id", unique=True, index=True)

    # Cart metadata
    session_id: Optional[str] = None
    total_items: int = Field(default=0)
    total_amount: float = Field(default=0.0)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: "User" = Relationship()
    items: List["CartItem"] = Relationship(back_populates="cart")


class CartItem(SQLModel, table=True):
    """Items in a shopping cart"""
    __tablename__ = "cart_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="carts.id", index=True)
    product_id: int = Field(foreign_key="products.id", index=True)

    # Item details
    quantity: int
    unit_price: float
    total_price: float

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    cart: Cart = Relationship(back_populates="items")
    product: Product = Relationship(back_populates="cart_items")


class ProductReview(SQLModel, table=True):
    """Product reviews and ratings"""
    __tablename__ = "product_reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", index=True)
    customer_id: str = Field(foreign_key="auth_users.id", index=True)

    # Review details
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    title: Optional[str] = None
    comment: Optional[str] = None
    
    # Review metadata
    is_verified_purchase: bool = Field(default=False)
    helpful_count: int = Field(default=0)
    reported_count: int = Field(default=0)
    is_approved: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    product: Product = Relationship(back_populates="reviews")
    customer: "User" = Relationship()


# Pydantic schemas for API

class ProductCreate(SQLModel):
    """Schema for creating a product"""
    name: str
    description: str
    short_description: Optional[str] = None
    category: ProductCategory
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    price: float
    stock_quantity: int = 0
    weight: Optional[float] = None
    dimensions: Optional[dict] = {}
    tags: List[str] = []
    is_digital: bool = False
    requires_shipping: bool = True


class ProductUpdate(SQLModel):
    """Schema for updating a product"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatus] = None
    discount_percentage: Optional[float] = None


class ProductResponse(SQLModel):
    """Schema for product response"""
    id: int
    name: str
    slug: str
    description: str
    category: ProductCategory
    price: float
    sale_price: Optional[float]
    stock_quantity: int
    images: List[str]
    average_rating: float
    total_reviews: int
    status: ProductStatus
    created_at: datetime


class CartItemCreate(SQLModel):
    """Schema for adding item to cart"""
    product_id: int
    quantity: int


class CartItemUpdate(SQLModel):
    """Schema for updating cart item"""
    quantity: int


class OrderCreate(SQLModel):
    """Schema for creating an order"""
    shipping_address: dict
    billing_address: dict
    shipping_method: Optional[str] = None
    customer_notes: Optional[str] = None


class ProductReviewCreate(SQLModel):
    """Schema for creating a product review"""
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
"""
Repository interfaces for shop functionality.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from ..entities.shop import CartEntity, OrderEntity, ProductEntity, ProductReviewEntity


class ProductRepositoryInterface(ABC):
    """Interface for product repository"""

    @abstractmethod
    async def create(self, product: ProductEntity) -> ProductEntity:
        """Create a new product"""
        pass

    @abstractmethod
    async def get_by_id(self, product_id: int) -> Optional[ProductEntity]:
        """Get product by ID"""
        pass

    @abstractmethod
    async def get_by_sku(self, sku: str) -> Optional[ProductEntity]:
        """Get product by SKU"""
        pass

    @abstractmethod
    async def get_by_slug(self, slug: str) -> Optional[ProductEntity]:
        """Get product by slug"""
        pass

    @abstractmethod
    async def update(self, product: ProductEntity) -> ProductEntity:
        """Update product"""
        pass

    @abstractmethod
    async def delete(self, product_id: int) -> bool:
        """Delete product"""
        pass

    @abstractmethod
    async def list_products(
        self,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        search: Optional[str] = None,
        seller_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> List[ProductEntity]:
        """List products with filters"""
        pass

    @abstractmethod
    async def search_products(
        self, query: str, filters: Dict[str, Any] = None, skip: int = 0, limit: int = 100
    ) -> List[ProductEntity]:
        """Search products"""
        pass

    @abstractmethod
    async def get_featured_products(self, limit: int = 10) -> List[ProductEntity]:
        """Get featured products"""
        pass

    @abstractmethod
    async def get_related_products(self, product_id: int, limit: int = 5) -> List[ProductEntity]:
        """Get related products"""
        pass

    @abstractmethod
    async def update_stock(self, product_id: int, quantity_change: int) -> bool:
        """Update product stock"""
        pass

    @abstractmethod
    async def get_low_stock_products(self, threshold: int = 5) -> List[ProductEntity]:
        """Get products with low stock"""
        pass


class CartRepositoryInterface(ABC):
    """Interface for cart repository"""

    @abstractmethod
    async def create(self, cart: CartEntity) -> CartEntity:
        """Create a new cart"""
        pass

    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[CartEntity]:
        """Get cart by user ID"""
        pass

    @abstractmethod
    async def update(self, cart: CartEntity) -> CartEntity:
        """Update cart"""
        pass

    @abstractmethod
    async def delete(self, cart_id: int) -> bool:
        """Delete cart"""
        pass

    @abstractmethod
    async def add_item(self, cart_id: int, product_id: int, quantity: int) -> bool:
        """Add item to cart"""
        pass

    @abstractmethod
    async def update_item_quantity(self, cart_id: int, product_id: int, quantity: int) -> bool:
        """Update item quantity in cart"""
        pass

    @abstractmethod
    async def remove_item(self, cart_id: int, product_id: int) -> bool:
        """Remove item from cart"""
        pass

    @abstractmethod
    async def clear_cart(self, cart_id: int) -> bool:
        """Clear all items from cart"""
        pass

    @abstractmethod
    async def get_cart_total(self, cart_id: int) -> float:
        """Get cart total amount"""
        pass


class OrderRepositoryInterface(ABC):
    """Interface for order repository"""

    @abstractmethod
    async def create(self, order: OrderEntity) -> OrderEntity:
        """Create a new order"""
        pass

    @abstractmethod
    async def get_by_id(self, order_id: int) -> Optional[OrderEntity]:
        """Get order by ID"""
        pass

    @abstractmethod
    async def get_by_order_number(self, order_number: str) -> Optional[OrderEntity]:
        """Get order by order number"""
        pass

    @abstractmethod
    async def update(self, order: OrderEntity) -> OrderEntity:
        """Update order"""
        pass

    @abstractmethod
    async def delete(self, order_id: int) -> bool:
        """Delete order"""
        pass

    @abstractmethod
    async def list_orders(
        self,
        customer_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> List[OrderEntity]:
        """List orders with filters"""
        pass

    @abstractmethod
    async def get_customer_orders(
        self, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[OrderEntity]:
        """Get orders for a specific customer"""
        pass

    @abstractmethod
    async def update_status(self, order_id: int, status: str) -> bool:
        """Update order status"""
        pass

    @abstractmethod
    async def get_orders_by_status(self, status: str) -> List[OrderEntity]:
        """Get orders by status"""
        pass

    @abstractmethod
    async def get_sales_analytics(
        self, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get sales analytics"""
        pass


class ProductReviewRepositoryInterface(ABC):
    """Interface for product review repository"""

    @abstractmethod
    async def create(self, review: ProductReviewEntity) -> ProductReviewEntity:
        """Create a new review"""
        pass

    @abstractmethod
    async def get_by_id(self, review_id: int) -> Optional[ProductReviewEntity]:
        """Get review by ID"""
        pass

    @abstractmethod
    async def update(self, review: ProductReviewEntity) -> ProductReviewEntity:
        """Update review"""
        pass

    @abstractmethod
    async def delete(self, review_id: int) -> bool:
        """Delete review"""
        pass

    @abstractmethod
    async def get_product_reviews(
        self, product_id: int, skip: int = 0, limit: int = 100, rating_filter: Optional[int] = None
    ) -> List[ProductReviewEntity]:
        """Get reviews for a product"""
        pass

    @abstractmethod
    async def get_customer_reviews(
        self, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[ProductReviewEntity]:
        """Get reviews by a customer"""
        pass

    @abstractmethod
    async def get_average_rating(self, product_id: int) -> float:
        """Get average rating for a product"""
        pass

    @abstractmethod
    async def get_rating_distribution(self, product_id: int) -> Dict[int, int]:
        """Get rating distribution for a product"""
        pass

    @abstractmethod
    async def mark_helpful(self, review_id: int) -> bool:
        """Mark review as helpful"""
        pass

    @abstractmethod
    async def approve_review(self, review_id: int) -> bool:
        """Approve review"""
        pass

    @abstractmethod
    async def get_pending_reviews(self) -> List[ProductReviewEntity]:
        """Get pending reviews for moderation"""
        pass

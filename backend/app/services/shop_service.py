"""
Shop service for business logic.
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload

from ..models.shop import (
    Product, ProductCreate, ProductUpdate, ProductStatus, ProductCategory,
    Cart, CartItem, Order, OrderItem, OrderStatus,
    ProductReview, ProductReviewCreate
)
from ..auth.models import User
from ..core.exceptions import NotFoundException, ValidationException, APIException


class ShopService:
    """Service class for shop functionality"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # Product methods
    async def create_product(self, product_data: ProductCreate, seller_id: int) -> Product:
        """Create a new product"""
        # Generate SKU and slug
        sku = f"PROD-{uuid.uuid4().hex[:8].upper()}"
        slug = self._generate_slug(product_data.name)
        
        # Ensure unique slug
        slug = await self._ensure_unique_slug(slug)
        
        product = Product(
            seller_id=seller_id,
            sku=sku,
            slug=slug,
            **product_data.model_dump()
        )
        
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        
        return product
    
    async def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        result = await self.db.execute(
            select(Product).where(Product.id == product_id)
        )
        return result.scalar_one_or_none()
    
    async def get_product_by_slug(self, slug: str) -> Optional[Product]:
        """Get product by slug"""
        result = await self.db.execute(
            select(Product).where(Product.slug == slug)
        )
        return result.scalar_one_or_none()
    
    async def update_product(self, product_id: int, product_data: ProductUpdate) -> Product:
        """Update product"""
        product = await self.get_product_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(product)
        
        return product
    
    async def delete_product(self, product_id: int) -> bool:
        """Delete product"""
        product = await self.get_product_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        
        await self.db.delete(product)
        await self.db.commit()
        
        return True
    
    async def list_products(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        filters: Dict[str, Any] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        include_inactive: bool = False
    ) -> List[Product]:
        """List products with filtering and sorting"""
        query = select(Product)
        
        # Apply filters
        if not include_inactive:
            query = query.where(Product.status == ProductStatus.ACTIVE)
        
        if filters:
            if "category" in filters:
                query = query.where(Product.category == filters["category"])
            if "seller_id" in filters:
                query = query.where(Product.seller_id == filters["seller_id"])
            if "status" in filters:
                query = query.where(Product.status == filters["status"])
            if "min_price" in filters:
                query = query.where(Product.price >= filters["min_price"])
            if "max_price" in filters:
                query = query.where(Product.price <= filters["max_price"])
        
        # Apply search
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.tags.contains([search])
                )
            )
        
        # Apply sorting
        sort_column = getattr(Product, sort_by, Product.created_at)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def search_products(
        self,
        query: str,
        filters: Dict[str, Any] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Search products"""
        return await self.list_products(
            skip=skip,
            limit=limit,
            search=query,
            filters=filters
        )
    
    async def get_featured_products(self, limit: int = 10) -> List[Product]:
        """Get featured products"""
        result = await self.db.execute(
            select(Product)
            .where(
                and_(
                    Product.status == ProductStatus.ACTIVE,
                    Product.is_featured == True
                )
            )
            .order_by(desc(Product.total_sales))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_related_products(self, product_id: int, limit: int = 5) -> List[Product]:
        """Get related products based on category and tags"""
        product = await self.get_product_by_id(product_id)
        if not product:
            return []
        
        result = await self.db.execute(
            select(Product)
            .where(
                and_(
                    Product.id != product_id,
                    Product.status == ProductStatus.ACTIVE,
                    Product.category == product.category
                )
            )
            .order_by(desc(Product.average_rating))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update_product_stock(self, product_id: int, quantity_change: int) -> bool:
        """Update product stock"""
        product = await self.get_product_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        
        if not product.is_digital:
            new_stock = product.stock_quantity + quantity_change
            if new_stock < 0:
                raise ValidationException("Insufficient stock")
            
            product.stock_quantity = new_stock
            
            # Update status if out of stock
            if new_stock == 0:
                product.status = ProductStatus.OUT_OF_STOCK
            elif product.status == ProductStatus.OUT_OF_STOCK and new_stock > 0:
                product.status = ProductStatus.ACTIVE
        
        await self.db.commit()
        return True
    
    # Cart methods
    async def get_user_cart(self, user_id: int) -> Cart:
        """Get or create user cart"""
        result = await self.db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.user_id == user_id)
        )
        cart = result.scalar_one_or_none()
        
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)
        
        return cart
    
    async def add_to_cart(self, user_id: int, product_id: int, quantity: int) -> CartItem:
        """Add item to cart"""
        if quantity <= 0:
            raise ValidationException("Quantity must be positive")
        
        # Get product and validate
        product = await self.get_product_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        
        if product.status != ProductStatus.ACTIVE:
            raise ValidationException("Product is not available")
        
        if not product.is_digital and product.stock_quantity < quantity:
            raise ValidationException("Insufficient stock")
        
        # Get or create cart
        cart = await self.get_user_cart(user_id)
        
        # Check if item already exists in cart
        result = await self.db.execute(
            select(CartItem)
            .where(
                and_(
                    CartItem.cart_id == cart.id,
                    CartItem.product_id == product_id
                )
            )
        )
        cart_item = result.scalar_one_or_none()
        
        if cart_item:
            # Update existing item
            new_quantity = cart_item.quantity + quantity
            if not product.is_digital and product.stock_quantity < new_quantity:
                raise ValidationException("Insufficient stock")
            
            cart_item.quantity = new_quantity
            cart_item.total_price = cart_item.unit_price * new_quantity
        else:
            # Create new item
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                unit_price=product.price,
                total_price=product.price * quantity
            )
            self.db.add(cart_item)
        
        # Update cart totals
        await self._update_cart_totals(cart.id)
        
        await self.db.commit()
        await self.db.refresh(cart_item)
        
        return cart_item
    
    async def update_cart_item(self, user_id: int, product_id: int, quantity: int) -> CartItem:
        """Update cart item quantity"""
        if quantity < 0:
            raise ValidationException("Quantity cannot be negative")
        
        cart = await self.get_user_cart(user_id)
        
        result = await self.db.execute(
            select(CartItem)
            .where(
                and_(
                    CartItem.cart_id == cart.id,
                    CartItem.product_id == product_id
                )
            )
        )
        cart_item = result.scalar_one_or_none()
        
        if not cart_item:
            raise NotFoundException("Cart item not found")
        
        if quantity == 0:
            # Remove item
            await self.db.delete(cart_item)
        else:
            # Update quantity
            product = await self.get_product_by_id(product_id)
            if not product.is_digital and product.stock_quantity < quantity:
                raise ValidationException("Insufficient stock")
            
            cart_item.quantity = quantity
            cart_item.total_price = cart_item.unit_price * quantity
        
        # Update cart totals
        await self._update_cart_totals(cart.id)
        
        await self.db.commit()
        
        return cart_item if quantity > 0 else None
    
    async def remove_from_cart(self, user_id: int, product_id: int) -> bool:
        """Remove item from cart"""
        cart = await self.get_user_cart(user_id)
        
        result = await self.db.execute(
            select(CartItem)
            .where(
                and_(
                    CartItem.cart_id == cart.id,
                    CartItem.product_id == product_id
                )
            )
        )
        cart_item = result.scalar_one_or_none()
        
        if cart_item:
            await self.db.delete(cart_item)
            await self._update_cart_totals(cart.id)
            await self.db.commit()
        
        return True
    
    async def clear_cart(self, user_id: int) -> bool:
        """Clear all items from cart"""
        cart = await self.get_user_cart(user_id)
        
        await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart.id)
        )
        
        cart.total_items = 0
        cart.total_amount = 0.0
        cart.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        return True
    
    # Order methods
    async def create_order_from_cart(
        self,
        user_id: int,
        shipping_address: Dict,
        billing_address: Dict,
        shipping_method: Optional[str] = None,
        customer_notes: Optional[str] = None
    ) -> Order:
        """Create order from cart"""
        cart = await self.get_user_cart(user_id)
        
        if not cart.items:
            raise ValidationException("Cart is empty")
        
        # Generate order number
        order_number = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate totals
        subtotal = sum(item.total_price for item in cart.items)
        tax_amount = subtotal * 0.18  # 18% GST
        shipping_amount = 50.0 if subtotal < 500 else 0.0  # Free shipping above 500
        total_amount = subtotal + tax_amount + shipping_amount
        
        # Create order
        order = Order(
            customer_id=user_id,
            order_number=order_number,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            shipping_address=shipping_address,
            billing_address=billing_address,
            shipping_method=shipping_method,
            customer_notes=customer_notes
        )
        
        self.db.add(order)
        await self.db.flush()  # Get order ID
        
        # Create order items
        for cart_item in cart.items:
            product = cart_item.product
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                total_price=cart_item.total_price,
                product_name=product.name,
                product_sku=product.sku,
                product_image=product.thumbnail_url
            )
            self.db.add(order_item)
            
            # Update product stock
            if not product.is_digital:
                await self.update_product_stock(product.id, -cart_item.quantity)
        
        # Clear cart
        await self.clear_cart(user_id)
        
        await self.db.commit()
        await self.db.refresh(order)
        
        return order
    
    async def get_order_by_id(self, order_id: int) -> Optional[Order]:
        """Get order by ID"""
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_orders(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[OrderStatus] = None
    ) -> List[Order]:
        """Get user orders"""
        query = select(Order).where(Order.customer_id == user_id)
        
        if status:
            query = query.where(Order.status == status)
        
        query = query.order_by(desc(Order.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def list_orders(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[OrderStatus] = None,
        customer_id: Optional[int] = None
    ) -> List[Order]:
        """List all orders (admin)"""
        query = select(Order)
        
        if status:
            query = query.where(Order.status == status)
        if customer_id:
            query = query.where(Order.customer_id == customer_id)
        
        query = query.order_by(desc(Order.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_order_status(
        self,
        order_id: int,
        status: OrderStatus,
        tracking_number: Optional[str] = None
    ) -> Order:
        """Update order status"""
        order = await self.get_order_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        
        order.status = status
        order.updated_at = datetime.now(timezone.utc)
        
        if tracking_number:
            order.tracking_number = tracking_number
        
        if status == OrderStatus.SHIPPED:
            order.shipped_at = datetime.now(timezone.utc)
        elif status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(order)
        
        return order
    
    async def cancel_order(self, order_id: int) -> Order:
        """Cancel order"""
        order = await self.get_order_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        
        if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
            raise ValidationException("Order cannot be cancelled")
        
        # Restore product stock
        for item in order.items:
            product = await self.get_product_by_id(item.product_id)
            if product and not product.is_digital:
                await self.update_product_stock(item.product_id, item.quantity)
        
        order.status = OrderStatus.CANCELLED
        order.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(order)
        
        return order
    
    # Review methods
    async def create_product_review(
        self,
        product_id: int,
        customer_id: int,
        rating: int,
        title: Optional[str] = None,
        comment: Optional[str] = None,
        is_verified_purchase: bool = False
    ) -> ProductReview:
        """Create product review"""
        if not (1 <= rating <= 5):
            raise ValidationException("Rating must be between 1 and 5")
        
        # Check if user already reviewed this product
        result = await self.db.execute(
            select(ProductReview)
            .where(
                and_(
                    ProductReview.product_id == product_id,
                    ProductReview.customer_id == customer_id
                )
            )
        )
        existing_review = result.scalar_one_or_none()
        
        if existing_review:
            raise ValidationException("You have already reviewed this product")
        
        review = ProductReview(
            product_id=product_id,
            customer_id=customer_id,
            rating=rating,
            title=title,
            comment=comment,
            is_verified_purchase=is_verified_purchase
        )
        
        self.db.add(review)
        
        # Update product rating
        await self._update_product_rating(product_id)
        
        await self.db.commit()
        await self.db.refresh(review)
        
        return review
    
    async def get_product_reviews(
        self,
        product_id: int,
        skip: int = 0,
        limit: int = 100,
        rating_filter: Optional[int] = None
    ) -> List[ProductReview]:
        """Get product reviews"""
        query = select(ProductReview).where(
            and_(
                ProductReview.product_id == product_id,
                ProductReview.is_approved == True
            )
        )
        
        if rating_filter:
            query = query.where(ProductReview.rating == rating_filter)
        
        query = query.order_by(desc(ProductReview.created_at)).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_product_review_stats(self, product_id: int) -> Dict[str, Any]:
        """Get product review statistics"""
        result = await self.db.execute(
            select(
                func.count(ProductReview.id).label("total_reviews"),
                func.avg(ProductReview.rating).label("average_rating"),
                func.count(ProductReview.id).filter(ProductReview.rating == 5).label("five_star"),
                func.count(ProductReview.id).filter(ProductReview.rating == 4).label("four_star"),
                func.count(ProductReview.id).filter(ProductReview.rating == 3).label("three_star"),
                func.count(ProductReview.id).filter(ProductReview.rating == 2).label("two_star"),
                func.count(ProductReview.id).filter(ProductReview.rating == 1).label("one_star"),
            )
            .where(
                and_(
                    ProductReview.product_id == product_id,
                    ProductReview.is_approved == True
                )
            )
        )
        stats = result.first()
        
        return {
            "total_reviews": stats.total_reviews or 0,
            "average_rating": float(stats.average_rating or 0),
            "rating_distribution": {
                "5": stats.five_star or 0,
                "4": stats.four_star or 0,
                "3": stats.three_star or 0,
                "2": stats.two_star or 0,
                "1": stats.one_star or 0,
            }
        }
    
    async def has_user_purchased_product(self, user_id: int, product_id: int) -> bool:
        """Check if user has purchased a product"""
        result = await self.db.execute(
            select(OrderItem)
            .join(Order)
            .where(
                and_(
                    Order.customer_id == user_id,
                    OrderItem.product_id == product_id,
                    Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
                )
            )
        )
        return result.scalar_one_or_none() is not None
    
    async def get_sales_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get sales analytics"""
        query = select(
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("total_revenue"),
            func.avg(Order.total_amount).label("average_order_value"),
            func.count(Order.id).filter(Order.status == OrderStatus.DELIVERED).label("completed_orders"),
            func.count(Order.id).filter(Order.status == OrderStatus.CANCELLED).label("cancelled_orders"),
        )
        
        if start_date:
            query = query.where(Order.created_at >= start_date)
        if end_date:
            query = query.where(Order.created_at <= end_date)
        
        result = await self.db.execute(query)
        stats = result.first()
        
        return {
            "total_orders": stats.total_orders or 0,
            "total_revenue": float(stats.total_revenue or 0),
            "average_order_value": float(stats.average_order_value or 0),
            "completed_orders": stats.completed_orders or 0,
            "cancelled_orders": stats.cancelled_orders or 0,
            "completion_rate": (stats.completed_orders / stats.total_orders * 100) if stats.total_orders else 0
        }
    
    # Helper methods
    def _generate_slug(self, name: str) -> str:
        """Generate URL slug from product name"""
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
        slug = re.sub(r'\s+', '-', slug.strip())
        return slug
    
    async def _ensure_unique_slug(self, slug: str) -> str:
        """Ensure slug is unique"""
        original_slug = slug
        counter = 1
        
        while True:
            result = await self.db.execute(
                select(Product).where(Product.slug == slug)
            )
            if not result.scalar_one_or_none():
                break
            
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug
    
    async def _update_cart_totals(self, cart_id: int) -> None:
        """Update cart totals"""
        result = await self.db.execute(
            select(
                func.sum(CartItem.quantity).label("total_items"),
                func.sum(CartItem.total_price).label("total_amount")
            )
            .where(CartItem.cart_id == cart_id)
        )
        totals = result.first()
        
        cart = await self.db.get(Cart, cart_id)
        cart.total_items = totals.total_items or 0
        cart.total_amount = float(totals.total_amount or 0)
        cart.updated_at = datetime.now(timezone.utc)
    
    async def _update_product_rating(self, product_id: int) -> None:
        """Update product average rating"""
        result = await self.db.execute(
            select(
                func.avg(ProductReview.rating).label("average_rating"),
                func.count(ProductReview.id).label("total_reviews")
            )
            .where(
                and_(
                    ProductReview.product_id == product_id,
                    ProductReview.is_approved == True
                )
            )
        )
        stats = result.first()
        
        product = await self.db.get(Product, product_id)
        product.average_rating = float(stats.average_rating or 0)
        product.total_reviews = stats.total_reviews or 0
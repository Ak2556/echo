"""
Shop API endpoints for e-commerce functionality.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ....models.shop import (
    Product, ProductCreate, ProductUpdate, ProductResponse,
    Cart, CartItem, CartItemCreate, CartItemUpdate,
    Order, OrderCreate, OrderStatus,
    ProductReview, ProductReviewCreate,
    ProductCategory, ProductStatus
)
from ....auth.models import User
from ....core.database import get_db
from ....auth.dependencies import get_current_user, get_current_active_user
from ....services.shop_service import ShopService
from ....services.payment_service import PaymentService

router = APIRouter()
security = HTTPBearer()


# Product endpoints
@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[ProductCategory] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[ProductStatus] = ProductStatus.ACTIVE,
    sort_by: str = Query("created_at", pattern="^(name|price|created_at|rating|sales)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db)
):
    """List products with filtering and sorting"""
    shop_service = ShopService(db)
    
    filters = {}
    if category:
        filters["category"] = category
    if min_price is not None:
        filters["min_price"] = min_price
    if max_price is not None:
        filters["max_price"] = max_price
    if status:
        filters["status"] = status
    
    products = await shop_service.list_products(
        skip=skip,
        limit=limit,
        search=search,
        filters=filters,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return products


@router.get("/products/featured", response_model=List[ProductResponse])
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get featured products"""
    shop_service = ShopService(db)
    products = await shop_service.get_featured_products(limit=limit)
    return products


@router.get("/products/categories")
async def get_product_categories():
    """Get available product categories"""
    return {
        "categories": [
            {"value": category.value, "label": category.value.replace("_", " ").title()}
            for category in ProductCategory
        ]
    }


@router.get("/products/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=2),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[ProductCategory] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search products"""
    shop_service = ShopService(db)
    
    filters = {}
    if category:
        filters["category"] = category
    
    products = await shop_service.search_products(
        query=q,
        filters=filters,
        skip=skip,
        limit=limit
    )
    return products


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get product by ID"""
    shop_service = ShopService(db)
    product = await shop_service.get_product_by_id(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.get("/products/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get product by slug"""
    shop_service = ShopService(db)
    product = await shop_service.get_product_by_slug(slug)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.get("/products/{product_id}/related", response_model=List[ProductResponse])
async def get_related_products(
    product_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Get related products"""
    shop_service = ShopService(db)
    products = await shop_service.get_related_products(product_id, limit=limit)
    return products


@router.post("/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product (seller only)"""
    shop_service = ShopService(db)
    
    # Check if user can create products (seller/admin)
    if current_user.role not in ["teacher", "admin"]:  # Teachers can sell products
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create products"
        )
    
    product = await shop_service.create_product(
        product_data=product_data,
        seller_id=current_user.id
    )
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update product (seller/admin only)"""
    shop_service = ShopService(db)
    
    # Check ownership or admin
    product = await shop_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product"
        )
    
    updated_product = await shop_service.update_product(product_id, product_data)
    return updated_product


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete product (seller/admin only)"""
    shop_service = ShopService(db)
    
    # Check ownership or admin
    product = await shop_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product"
        )
    
    await shop_service.delete_product(product_id)
    return {"message": "Product deleted successfully"}


# Cart endpoints
@router.get("/cart")
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's cart"""
    shop_service = ShopService(db)
    cart = await shop_service.get_user_cart(current_user.id)
    return cart


@router.post("/cart/items")
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add item to cart"""
    shop_service = ShopService(db)
    
    cart_item = await shop_service.add_to_cart(
        user_id=current_user.id,
        product_id=item_data.product_id,
        quantity=item_data.quantity
    )
    
    return {"message": "Item added to cart", "cart_item": cart_item}


@router.put("/cart/items/{product_id}")
async def update_cart_item(
    product_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update cart item quantity"""
    shop_service = ShopService(db)
    
    cart_item = await shop_service.update_cart_item(
        user_id=current_user.id,
        product_id=product_id,
        quantity=item_data.quantity
    )
    
    return {"message": "Cart item updated", "cart_item": cart_item}


@router.delete("/cart/items/{product_id}")
async def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove item from cart"""
    shop_service = ShopService(db)
    
    await shop_service.remove_from_cart(
        user_id=current_user.id,
        product_id=product_id
    )
    
    return {"message": "Item removed from cart"}


@router.delete("/cart")
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear cart"""
    shop_service = ShopService(db)
    
    await shop_service.clear_cart(current_user.id)
    return {"message": "Cart cleared"}


# Order endpoints
@router.post("/orders")
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create order from cart"""
    shop_service = ShopService(db)
    payment_service = PaymentService(db)
    
    # Create order from cart
    order = await shop_service.create_order_from_cart(
        user_id=current_user.id,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address,
        shipping_method=order_data.shipping_method,
        customer_notes=order_data.customer_notes
    )
    
    # Create payment intent
    payment_intent = await payment_service.create_payment_intent(
        amount=order.total_amount,
        currency="INR",
        order_id=order.id,
        customer_id=current_user.id
    )
    
    return {
        "order": order,
        "payment_intent": payment_intent
    }


@router.get("/orders")
async def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's orders"""
    shop_service = ShopService(db)
    
    orders = await shop_service.get_user_orders(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status
    )
    
    return orders


@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order by ID"""
    shop_service = ShopService(db)
    
    order = await shop_service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check ownership or admin
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel order"""
    shop_service = ShopService(db)
    
    order = await shop_service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check ownership
    if order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    cancelled_order = await shop_service.cancel_order(order_id)
    return {"message": "Order cancelled", "order": cancelled_order}


# Product Review endpoints
@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    rating: Optional[int] = Query(None, ge=1, le=5),
    db: AsyncSession = Depends(get_db)
):
    """Get product reviews"""
    shop_service = ShopService(db)
    
    reviews = await shop_service.get_product_reviews(
        product_id=product_id,
        skip=skip,
        limit=limit,
        rating_filter=rating
    )
    
    return reviews


@router.post("/products/{product_id}/reviews")
async def create_product_review(
    product_id: int,
    review_data: ProductReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create product review"""
    shop_service = ShopService(db)
    
    # Check if user has purchased the product
    has_purchased = await shop_service.has_user_purchased_product(
        user_id=current_user.id,
        product_id=product_id
    )
    
    if not has_purchased:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review products you have purchased"
        )
    
    review = await shop_service.create_product_review(
        product_id=product_id,
        customer_id=current_user.id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        is_verified_purchase=True
    )
    
    return {"message": "Review created", "review": review}


@router.get("/products/{product_id}/reviews/stats")
async def get_product_review_stats(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get product review statistics"""
    shop_service = ShopService(db)
    
    stats = await shop_service.get_product_review_stats(product_id)
    return stats


# Admin endpoints
@router.get("/admin/products")
async def admin_list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    seller_id: Optional[int] = None,
    product_status: Optional[ProductStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin: List all products"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    shop_service = ShopService(db)

    filters = {}
    if seller_id:
        filters["seller_id"] = seller_id
    if product_status:
        filters["status"] = product_status
    
    products = await shop_service.list_products(
        skip=skip,
        limit=limit,
        filters=filters,
        include_inactive=True
    )
    
    return products


@router.get("/admin/orders")
async def admin_list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    order_status: Optional[OrderStatus] = None,
    customer_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin: List all orders"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    shop_service = ShopService(db)

    orders = await shop_service.list_orders(
        skip=skip,
        limit=limit,
        status=order_status,
        customer_id=customer_id
    )
    
    return orders


@router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: int,
    order_status: OrderStatus = Query(..., alias="status"),
    tracking_number: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin: Update order status"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    shop_service = ShopService(db)

    order = await shop_service.update_order_status(
        order_id=order_id,
        status=order_status,
        tracking_number=tracking_number
    )
    
    return {"message": "Order status updated", "order": order}


@router.get("/admin/analytics/sales")
async def get_sales_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin: Get sales analytics"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    shop_service = ShopService(db)
    
    analytics = await shop_service.get_sales_analytics(
        start_date=start_date,
        end_date=end_date
    )
    
    return analytics
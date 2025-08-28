"""
Integration tests for Shop API endpoints.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status
from datetime import datetime, timezone

from app.models.shop import (
    Product, ProductCreate, ProductUpdate, ProductResponse,
    Cart, CartItem, Order, OrderStatus,
    ProductReview, ProductCategory, ProductStatus
)
from app.auth.models import User


@pytest.fixture
def seller_user():
    """Create seller user"""
    return User(
        id="seller-user-uuid-1",
        email="seller@test.com",
        username="seller",
        full_name="Seller User",
        role="teacher",  # Teachers can sell products
        is_active=True,
        email_verified=True,
        is_locked=False,
        token_version=1,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def student_user():
    """Create student user"""
    return User(
        id="student-user-uuid-2",
        email="student@test.com",
        username="student",
        full_name="Student User",
        role="student",
        is_active=True,
        email_verified=True,
        is_locked=False,
        token_version=1,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def admin_user():
    """Create admin user"""
    return User(
        id="admin-user-uuid-3",
        email="admin@test.com",
        username="admin",
        full_name="Admin User",
        role="admin",
        is_active=True,
        email_verified=True,
        is_locked=False,
        token_version=1,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def sample_product():
    """Create sample product"""
    return Product(
        id=1,
        seller_id="seller-user-uuid-1",
        name="Test Product",
        slug="test-product",
        description="Test Description",
        price=99.99,
        category=ProductCategory.BOOKS,
        status=ProductStatus.ACTIVE,
        stock_quantity=10,
        sku="TEST-001",
        images=["image1.jpg"],
        average_rating=4.5,
        total_reviews=10,
        total_sales=5,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def mock_shop_service():
    """Mock shop service"""
    service = MagicMock()
    # Make all methods async mocks
    for attr_name in dir(service):
        attr = getattr(service, attr_name)
        if callable(attr) and not attr_name.startswith('_'):
            setattr(service, attr_name, AsyncMock())
    return service


class TestProductEndpoints:
    """Tests for product endpoints"""

    @pytest.mark.asyncio
    async def test_list_products_success(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test listing products successfully"""
        mock_shop_service.list_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1
        assert response.json()[0]["name"] == "Test Product"

    @pytest.mark.asyncio
    async def test_list_products_with_filters(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test listing products with filters"""
        mock_shop_service.list_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get(
                "/api/v1/shop/products",
                params={
                    "category": ProductCategory.BOOKS.value,
                    "min_price": 50.0,
                    "max_price": 150.0,
                    "sort_by": "price",
                    "sort_order": "asc"
                }
            )

        assert response.status_code == status.HTTP_200_OK
        mock_shop_service.list_products.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_featured_products(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test getting featured products"""
        mock_shop_service.get_featured_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/featured")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_get_product_categories(self, client: AsyncClient):
        """Test getting product categories"""
        response = await client.get("/api/v1/shop/products/categories")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0

    @pytest.mark.asyncio
    async def test_search_products(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test searching products"""
        mock_shop_service.search_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get(
                "/api/v1/shop/products/search",
                params={"q": "test"}
            )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_search_products_with_category(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test searching products with category filter"""
        mock_shop_service.search_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get(
                "/api/v1/shop/products/search",
                params={
                    "q": "test",
                    "category": ProductCategory.BOOKS.value
                }
            )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_get_product_by_id_success(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test getting product by ID successfully"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=sample_product)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/1")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == 1

    @pytest.mark.asyncio
    async def test_get_product_by_id_not_found(self, client: AsyncClient, mock_shop_service):
        """Test getting non-existent product"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_get_product_by_slug_success(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test getting product by slug successfully"""
        mock_shop_service.get_product_by_slug = AsyncMock(return_value=sample_product)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/slug/test-product")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["slug"] == "test-product"

    @pytest.mark.asyncio
    async def test_get_product_by_slug_not_found(self, client: AsyncClient, mock_shop_service):
        """Test getting non-existent product by slug"""
        mock_shop_service.get_product_by_slug = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/slug/nonexistent")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_get_related_products(self, client: AsyncClient, mock_shop_service, sample_product):
        """Test getting related products"""
        mock_shop_service.get_related_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/1/related")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_create_product_as_seller(self, client: AsyncClient, mock_shop_service, seller_user, sample_product, override_auth):
        """Test creating product as seller"""
        mock_shop_service.create_product = AsyncMock(return_value=sample_product)

        product_data = {
            "name": "New Product",
            "description": "New Description",
            "price": 99.99,
            "category": ProductCategory.BOOKS.value,
            "stock_quantity": 10
        }

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.post("/api/v1/shop/products", json=product_data)

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_create_product_as_student_forbidden(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test creating product as student (should fail)"""
        product_data = {
            "name": "New Product",
            "description": "New Description",
            "price": 99.99,
            "category": ProductCategory.BOOKS.value,
            "stock_quantity": 10
        }

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.post("/api/v1/shop/products", json=product_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_update_product_as_owner(self, client: AsyncClient, mock_shop_service, seller_user, sample_product, override_auth):
        """Test updating product as owner"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=sample_product)
        updated_product = Product(**sample_product.model_dump())
        updated_product.name = "Updated Product"
        mock_shop_service.update_product = AsyncMock(return_value=updated_product)

        update_data = {"name": "Updated Product"}

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.put("/api/v1/shop/products/1", json=update_data)

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_update_product_not_owner(self, client: AsyncClient, mock_shop_service, student_user, sample_product, override_auth):
        """Test updating product by non-owner (should fail)"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=sample_product)

        update_data = {"name": "Updated Product"}

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.put("/api/v1/shop/products/1", json=update_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_update_product_not_found(self, client: AsyncClient, mock_shop_service, seller_user, override_auth):
        """Test updating non-existent product"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=None)

        update_data = {"name": "Updated Product"}

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.put("/api/v1/shop/products/999", json=update_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_product_as_owner(self, client: AsyncClient, mock_shop_service, seller_user, sample_product, override_auth):
        """Test deleting product as owner"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=sample_product)
        mock_shop_service.delete_product = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.delete("/api/v1/shop/products/1")

        assert response.status_code == status.HTTP_200_OK
        assert "deleted successfully" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_delete_product_not_owner(self, client: AsyncClient, mock_shop_service, student_user, sample_product, override_auth):
        """Test deleting product by non-owner (should fail)"""
        mock_shop_service.get_product_by_id = AsyncMock(return_value=sample_product)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.delete("/api/v1/shop/products/1")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestCartEndpoints:
    """Tests for cart endpoints"""

    @pytest.mark.asyncio
    async def test_get_cart(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test getting user cart"""
        mock_cart = Cart(
            id=1,
            user_id=student_user.id,
            items=[],
            total_items=0,
            total_amount=0.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.get_user_cart = AsyncMock(return_value=mock_cart)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/cart")

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_add_to_cart(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test adding item to cart"""
        mock_cart_item = CartItem(
            id=1,
            cart_id=1,
            product_id=1,
            quantity=2,
            unit_price=99.99,
            total_price=199.98,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.add_to_cart = AsyncMock(return_value=mock_cart_item)

        item_data = {"product_id": 1, "quantity": 2}

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.post("/api/v1/shop/cart/items", json=item_data)

        assert response.status_code == status.HTTP_200_OK
        assert "added to cart" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_update_cart_item(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test updating cart item quantity"""
        mock_cart_item = CartItem(
            id=1,
            cart_id=1,
            product_id=1,
            quantity=5,
            unit_price=99.99,
            total_price=499.95,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.update_cart_item = AsyncMock(return_value=mock_cart_item)

        update_data = {"quantity": 5}

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.put("/api/v1/shop/cart/items/1", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        assert "updated" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_remove_from_cart(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test removing item from cart"""
        mock_shop_service.remove_from_cart = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.delete("/api/v1/shop/cart/items/1")

        assert response.status_code == status.HTTP_200_OK
        assert "removed from cart" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_clear_cart(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test clearing cart"""
        mock_shop_service.clear_cart = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.delete("/api/v1/shop/cart")

        assert response.status_code == status.HTTP_200_OK
        assert "Cart cleared" in response.json()["message"]


class TestOrderEndpoints:
    """Tests for order endpoints"""

    @pytest.mark.asyncio
    async def test_create_order(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test creating order from cart"""
        mock_order = Order(
            id=1,
            customer_id=student_user.id,
            order_number="ORD-20241123-001",
            status=OrderStatus.PENDING,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.create_order_from_cart = AsyncMock(return_value=mock_order)

        mock_payment_service = MagicMock()
        mock_payment_service.create_payment_intent = AsyncMock(return_value={"id": "pi_123"})

        order_data = {
            "shipping_address": {"street": "123 Main St", "city": "Test City", "country": "USA"},
            "billing_address": {"street": "123 Main St", "city": "Test City", "country": "USA"},
            "shipping_method": "standard"
        }

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with patch('app.api.v1.endpoints.shop.PaymentService', return_value=mock_payment_service):
                with override_auth(student_user):
                    response = await client.post("/api/v1/shop/orders", json=order_data)

        assert response.status_code == status.HTTP_200_OK
        assert "order" in response.json()
        assert "payment_intent" in response.json()

    @pytest.mark.asyncio
    async def test_get_user_orders(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test getting user orders"""
        mock_orders = [
            Order(
                id=1,
                customer_id=student_user.id,
                order_number="ORD-20241123-001",
                status=OrderStatus.DELIVERED,
                subtotal=99.99,
                tax_amount=10.00,
                shipping_amount=5.00,
                total_amount=114.99,
                shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
                billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        ]
        mock_shop_service.get_user_orders = AsyncMock(return_value=mock_orders)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/orders")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_get_user_orders_with_status_filter(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test getting user orders with status filter"""
        mock_shop_service.get_user_orders = AsyncMock(return_value=[])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get(
                    "/api/v1/shop/orders",
                    params={"status": OrderStatus.DELIVERED.value}
                )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_get_order_as_owner(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test getting order as owner"""
        mock_order = Order(
            id=1,
            customer_id=student_user.id,
            order_number="ORD-20241123-001",
            status=OrderStatus.DELIVERED,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.get_order_by_id = AsyncMock(return_value=mock_order)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/orders/1")

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_get_order_not_owner(self, client: AsyncClient, mock_shop_service, seller_user, override_auth):
        """Test getting order by non-owner (should fail)"""
        mock_order = Order(
            id=1,
            customer_id="different-user-uuid",  # Different user
            order_number="ORD-20241123-001",
            status=OrderStatus.DELIVERED,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.get_order_by_id = AsyncMock(return_value=mock_order)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.get("/api/v1/shop/orders/1")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_order_not_found(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test getting non-existent order"""
        mock_shop_service.get_order_by_id = AsyncMock(return_value=None)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/orders/999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_cancel_order_as_owner(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test cancelling order as owner"""
        mock_order = Order(
            id=1,
            customer_id=student_user.id,
            order_number="ORD-20241123-001",
            status=OrderStatus.PENDING,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        cancelled_order = Order(**mock_order.model_dump())
        cancelled_order.status = OrderStatus.CANCELLED

        mock_shop_service.get_order_by_id = AsyncMock(return_value=mock_order)
        mock_shop_service.cancel_order = AsyncMock(return_value=cancelled_order)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.post("/api/v1/shop/orders/1/cancel")

        assert response.status_code == status.HTTP_200_OK
        assert "cancelled" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_cancel_order_not_owner(self, client: AsyncClient, mock_shop_service, seller_user, override_auth):
        """Test cancelling order by non-owner (should fail)"""
        mock_order = Order(
            id=1,
            customer_id="different-user-uuid",
            order_number="ORD-20241123-001",
            status=OrderStatus.PENDING,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.get_order_by_id = AsyncMock(return_value=mock_order)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(seller_user):
                response = await client.post("/api/v1/shop/orders/1/cancel")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestReviewEndpoints:
    """Tests for product review endpoints"""

    @pytest.mark.asyncio
    async def test_get_product_reviews(self, client: AsyncClient, mock_shop_service):
        """Test getting product reviews"""
        mock_reviews = [
            ProductReview(
                id=1,
                product_id=1,
                customer_id="student-user-uuid-2",
                rating=5,
                title="Great product!",
                comment="Love it!",
                is_verified_purchase=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        ]
        mock_shop_service.get_product_reviews = AsyncMock(return_value=mock_reviews)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/1/reviews")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_get_product_reviews_with_rating_filter(self, client: AsyncClient, mock_shop_service):
        """Test getting product reviews with rating filter"""
        mock_shop_service.get_product_reviews = AsyncMock(return_value=[])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get(
                "/api/v1/shop/products/1/reviews",
                params={"rating": 5}
            )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_create_product_review_success(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test creating product review after purchase"""
        mock_review = ProductReview(
            id=1,
            product_id=1,
            customer_id=student_user.id,
            rating=5,
            title="Great!",
            comment="Excellent product",
            is_verified_purchase=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        mock_shop_service.has_user_purchased_product = AsyncMock(return_value=True)
        mock_shop_service.create_product_review = AsyncMock(return_value=mock_review)

        review_data = {
            "rating": 5,
            "title": "Great!",
            "comment": "Excellent product"
        }

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.post("/api/v1/shop/products/1/reviews", json=review_data)

        assert response.status_code == status.HTTP_200_OK
        assert "Review created" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_create_product_review_not_purchased(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test creating review without purchase (should fail)"""
        mock_shop_service.has_user_purchased_product = AsyncMock(return_value=False)

        review_data = {
            "rating": 5,
            "title": "Great!",
            "comment": "Excellent product"
        }

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.post("/api/v1/shop/products/1/reviews", json=review_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_product_review_stats(self, client: AsyncClient, mock_shop_service):
        """Test getting product review statistics"""
        mock_stats = {
            "average_rating": 4.5,
            "total_reviews": 10,
            "rating_distribution": {
                "5": 6,
                "4": 2,
                "3": 1,
                "2": 1,
                "1": 0
            }
        }
        mock_shop_service.get_product_review_stats = AsyncMock(return_value=mock_stats)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            response = await client.get("/api/v1/shop/products/1/reviews/stats")

        assert response.status_code == status.HTTP_200_OK
        assert "average_rating" in response.json()


class TestAdminEndpoints:
    """Tests for admin endpoints"""

    @pytest.mark.asyncio
    async def test_admin_list_products_success(self, client: AsyncClient, mock_shop_service, admin_user, sample_product, override_auth):
        """Test admin listing all products"""
        mock_shop_service.list_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.get("/api/v1/shop/admin/products")

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_admin_list_products_non_admin(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test non-admin accessing admin endpoint (should fail)"""
        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/admin/products")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_admin_list_products_with_filters(self, client: AsyncClient, mock_shop_service, admin_user, sample_product, override_auth):
        """Test admin listing products with filters"""
        mock_shop_service.list_products = AsyncMock(return_value=[sample_product])

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.get(
                    "/api/v1/shop/admin/products",
                    params={"seller_id": 1, "status": ProductStatus.ACTIVE.value}
                )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_admin_list_orders_success(self, client: AsyncClient, mock_shop_service, admin_user, override_auth):
        """Test admin listing all orders"""
        mock_orders = [
            Order(
                id=1,
                customer_id="student-user-uuid-2",
                order_number="ORD-20241123-001",
                status=OrderStatus.DELIVERED,
                subtotal=99.99,
                tax_amount=10.00,
                shipping_amount=5.00,
                total_amount=114.99,
                shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
                billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        ]
        mock_shop_service.list_orders = AsyncMock(return_value=mock_orders)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.get("/api/v1/shop/admin/orders")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1

    @pytest.mark.asyncio
    async def test_admin_list_orders_non_admin(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test non-admin accessing admin orders (should fail)"""
        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/admin/orders")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_admin_update_order_status_success(self, client: AsyncClient, mock_shop_service, admin_user, override_auth):
        """Test admin updating order status"""
        mock_order = Order(
            id=1,
            customer_id="student-user-uuid-2",
            order_number="ORD-20241123-001",
            status=OrderStatus.SHIPPED,
            subtotal=99.99,
            tax_amount=10.00,
            shipping_amount=5.00,
            total_amount=114.99,
            tracking_number="TRACK123",
            shipping_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            billing_address={"street": "123 Main St", "city": "Test City", "country": "USA"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_shop_service.update_order_status = AsyncMock(return_value=mock_order)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.put(
                    "/api/v1/shop/admin/orders/1/status",
                    params={
                        "status": OrderStatus.SHIPPED.value,
                        "tracking_number": "TRACK123"
                    }
                )

        assert response.status_code == status.HTTP_200_OK
        assert "status updated" in response.json()["message"]

    @pytest.mark.asyncio
    async def test_admin_update_order_status_non_admin(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test non-admin updating order status (should fail)"""
        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.put(
                    "/api/v1/shop/admin/orders/1/status",
                    params={"status": OrderStatus.SHIPPED.value}
                )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_get_sales_analytics_success(self, client: AsyncClient, mock_shop_service, admin_user, override_auth):
        """Test getting sales analytics"""
        mock_analytics = {
            "total_sales": 10000.0,
            "total_orders": 50,
            "average_order_value": 200.0,
            "top_products": []
        }
        mock_shop_service.get_sales_analytics = AsyncMock(return_value=mock_analytics)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.get("/api/v1/shop/admin/analytics/sales")

        assert response.status_code == status.HTTP_200_OK
        assert "total_sales" in response.json()

    @pytest.mark.asyncio
    async def test_get_sales_analytics_with_date_range(self, client: AsyncClient, mock_shop_service, admin_user, override_auth):
        """Test getting sales analytics with date range"""
        mock_analytics = {"total_sales": 5000.0}
        mock_shop_service.get_sales_analytics = AsyncMock(return_value=mock_analytics)

        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(admin_user):
                response = await client.get(
                    "/api/v1/shop/admin/analytics/sales",
                    params={
                        "start_date": "2024-01-01",
                        "end_date": "2024-12-31"
                    }
                )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.asyncio
    async def test_get_sales_analytics_non_admin(self, client: AsyncClient, mock_shop_service, student_user, override_auth):
        """Test non-admin accessing sales analytics (should fail)"""
        with patch('app.api.v1.endpoints.shop.ShopService', return_value=mock_shop_service):
            with override_auth(student_user):
                response = await client.get("/api/v1/shop/admin/analytics/sales")

        assert response.status_code == status.HTTP_403_FORBIDDEN

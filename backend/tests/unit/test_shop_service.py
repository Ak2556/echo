"""
Comprehensive unit tests for shop service.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timezone
from app.services.shop_service import ShopService
from app.core.exceptions import NotFoundException, ValidationException, APIException
from app.models.shop import (
    Product, Order, Cart, CartItem, OrderItem, ProductStatus, OrderStatus,
    ProductCreate, ProductUpdate, ProductReview, ProductReviewCreate, ProductCategory
)


class TestShopService:
    """Tests for ShopService class."""

    def test_shop_service_creation(self):
        """Test ShopService creation."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)
        assert service is not None
        assert service.db is mock_db

    @pytest.mark.asyncio
    async def test_create_product_success(self):
        """Test creating product successfully."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        product_data = ProductCreate(
            name="Test Product",
            description="Test description",
            category=ProductCategory.BOOKS,
            price=99.99,
            stock_quantity=10
        )

        # Mock ensure_unique_slug
        with patch.object(service, '_ensure_unique_slug', new_callable=AsyncMock, return_value="test-product"):
            result = await service.create_product(product_data, seller_id="1")

            assert result is not None
            assert result.name == "Test Product"
            assert result.seller_id == "1"
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_product_by_id_success(self):
        """Test getting product by ID successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_product.status = ProductStatus.ACTIVE

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_product
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_by_id(1)

        assert result is mock_product
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_product_by_id_not_found(self):
        """Test getting product by ID when not found."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_by_id(999)
        assert result is None

    @pytest.mark.asyncio
    async def test_get_product_by_slug_success(self):
        """Test getting product by slug successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.slug = "test-product"

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_product
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_by_slug("test-product")

        assert result is mock_product
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_success(self):
        """Test updating product successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.name = "Original Product"

        # Mock get_product_by_id to return the product
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            update_data = ProductUpdate(name="Updated Product", price=149.99)

            result = await service.update_product(1, update_data)

            assert result is mock_product
            assert mock_product.name == "Updated Product"
            assert mock_product.price == 149.99
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_not_found(self):
        """Test updating product when not found."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        # Mock get_product_by_id to return None
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=None):
            update_data = ProductUpdate(name="Updated Product")

            with pytest.raises(NotFoundException):
                await service.update_product(999, update_data)

    @pytest.mark.asyncio
    async def test_delete_product_success(self):
        """Test deleting product successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1

        # Mock get_product_by_id to return the product
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.delete_product(1)

            assert result is True
            mock_db.delete.assert_called_once_with(mock_product)
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_product_not_found(self):
        """Test deleting product when not found."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        # Mock get_product_by_id to return None
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=None):
            with pytest.raises(NotFoundException):
                await service.delete_product(999)

    @pytest.mark.asyncio
    async def test_list_products_success(self):
        """Test listing products successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product), Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_products(skip=0, limit=10)

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_products_with_filters(self):
        """Test listing products with filters."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        filters = {
            "category": ProductCategory.BOOKS,
            "seller_id": 1,
            "status": ProductStatus.ACTIVE,
            "min_price": 10.0,
            "max_price": 100.0
        }
        result = await service.list_products(skip=0, limit=10, filters=filters)

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_products_with_search(self):
        """Test listing products with search query."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_products(search="test", skip=0, limit=10)

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_products_include_inactive(self):
        """Test listing products including inactive ones."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product), Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_products(include_inactive=True)

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_products_sort_ascending(self):
        """Test listing products with ascending sort."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_products(sort_by="price", sort_order="asc")

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_products_success(self):
        """Test searching products successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product), Mock(spec=Product)]

        # Mock list_products method
        with patch.object(service, 'list_products', new_callable=AsyncMock, return_value=mock_products):
            result = await service.search_products("test query")

            assert result == mock_products

    @pytest.mark.asyncio
    async def test_search_products_with_filters(self):
        """Test searching products with filters."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product)]

        filters = {"category": ProductCategory.BOOKS}

        # Mock list_products method
        with patch.object(service, 'list_products', new_callable=AsyncMock, return_value=mock_products):
            result = await service.search_products("test", filters=filters, skip=0, limit=20)

            assert result == mock_products

    @pytest.mark.asyncio
    async def test_get_featured_products_success(self):
        """Test getting featured products successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_products = [Mock(spec=Product), Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_products
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_featured_products(limit=5)

        assert result == mock_products
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_related_products_success(self):
        """Test getting related products successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.category = ProductCategory.BOOKS

        mock_related = [Mock(spec=Product), Mock(spec=Product)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_related
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.get_related_products(1, limit=5)

            assert result == mock_related
            mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_related_products_no_product(self):
        """Test getting related products when product not found."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=None):
            result = await service.get_related_products(999)

            assert result == []

    @pytest.mark.asyncio
    async def test_update_product_stock_success(self):
        """Test updating product stock successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.stock_quantity = 10
        mock_product.is_digital = False
        mock_product.status = ProductStatus.ACTIVE

        # Mock get_product_by_id to return the product
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.update_product_stock(1, 5)

            assert result is True
            assert mock_product.stock_quantity == 15
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_stock_to_zero(self):
        """Test updating product stock to zero (out of stock)."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.stock_quantity = 10
        mock_product.is_digital = False
        mock_product.status = ProductStatus.ACTIVE

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.update_product_stock(1, -10)

            assert result is True
            assert mock_product.stock_quantity == 0
            assert mock_product.status == ProductStatus.OUT_OF_STOCK
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_stock_from_out_of_stock(self):
        """Test updating product stock from out of stock to active."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.stock_quantity = 0
        mock_product.is_digital = False
        mock_product.status = ProductStatus.OUT_OF_STOCK

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.update_product_stock(1, 5)

            assert result is True
            assert mock_product.stock_quantity == 5
            assert mock_product.status == ProductStatus.ACTIVE
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_stock_digital_product(self):
        """Test updating digital product stock (should not change)."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.stock_quantity = 0
        mock_product.is_digital = True

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            result = await service.update_product_stock(1, 5)

            assert result is True
            assert mock_product.stock_quantity == 0  # Should not change for digital
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_product_stock_insufficient(self):
        """Test updating product stock with insufficient quantity."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.stock_quantity = 5
        mock_product.is_digital = False

        # Mock get_product_by_id to return the product
        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with pytest.raises(ValidationException):
                await service.update_product_stock(1, -10)

    @pytest.mark.asyncio
    async def test_update_product_stock_not_found(self):
        """Test updating stock for non-existent product."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=None):
            with pytest.raises(NotFoundException):
                await service.update_product_stock(999, 5)

    # Cart Tests
    @pytest.mark.asyncio
    async def test_get_user_cart_existing(self):
        """Test getting existing user cart."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.user_id = "123"

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_user_cart("123")

        assert result is mock_cart
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_cart_create_new(self):
        """Test creating new user cart when none exists."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        # Mock execute to return None (no existing cart)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Mock refresh to do nothing
        mock_db.refresh = AsyncMock()

        result = await service.get_user_cart("123")

        # Should have created a new cart and added it
        assert result is not None
        assert result.user_id == "123"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_to_cart_success(self):
        """Test adding item to cart successfully."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.status = ProductStatus.ACTIVE
        mock_product.is_digital = False
        mock_product.stock_quantity = 10
        mock_product.price = 99.99

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.user_id = "123"

        # Mock no existing cart item
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
                with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                    result = await service.add_to_cart("123", 1, 2)

                    assert result.product_id == 1
                    assert result.quantity == 2
                    assert result.unit_price == 99.99
                    assert result.total_price == 199.98
                    mock_db.add.assert_called()
                    mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_to_cart_update_existing_item(self):
        """Test adding to cart updates existing item."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.status = ProductStatus.ACTIVE
        mock_product.is_digital = False
        mock_product.stock_quantity = 10
        mock_product.price = 99.99

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.user_id = "123"

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.quantity = 2
        mock_cart_item.unit_price = 99.99

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
                with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                    result = await service.add_to_cart("123", 1, 3)

                    assert result.quantity == 5
                    assert result.total_price == 499.95
                    mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_to_cart_existing_item_insufficient_stock(self):
        """Test adding to existing cart item when total would exceed stock."""
        from app.models.shop import ProductStatus
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_product.status = ProductStatus.ACTIVE
        mock_product.is_digital = False  # Physical product with stock tracking
        mock_product.stock_quantity = 10
        mock_product.price = 99.99

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.user_id = "123"

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.quantity = 8  # Already have 8 in cart

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
                # Try to add 5 more (total would be 13, exceeds stock of 10)
                with pytest.raises(ValidationException, match="Insufficient stock"):
                    await service.add_to_cart("123", 1, 5)

    @pytest.mark.asyncio
    async def test_add_to_cart_invalid_quantity(self):
        """Test adding to cart with invalid quantity."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with pytest.raises(ValidationException, match="Quantity must be positive"):
            await service.add_to_cart("123", 1, 0)

        with pytest.raises(ValidationException, match="Quantity must be positive"):
            await service.add_to_cart("123", 1, -1)

    @pytest.mark.asyncio
    async def test_add_to_cart_product_not_found(self):
        """Test adding to cart with non-existent product."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=None):
            with pytest.raises(NotFoundException, match="Product not found"):
                await service.add_to_cart("123", 999, 1)

    @pytest.mark.asyncio
    async def test_add_to_cart_product_not_active(self):
        """Test adding to cart with inactive product."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.status = ProductStatus.INACTIVE

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with pytest.raises(ValidationException, match="Product is not available"):
                await service.add_to_cart("123", 1, 1)

    @pytest.mark.asyncio
    async def test_add_to_cart_insufficient_stock(self):
        """Test adding to cart with insufficient stock."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.status = ProductStatus.ACTIVE
        mock_product.is_digital = False
        mock_product.stock_quantity = 2

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with pytest.raises(ValidationException, match="Insufficient stock"):
                await service.add_to_cart("123", 1, 5)

    @pytest.mark.asyncio
    async def test_add_to_cart_digital_product_no_stock_check(self):
        """Test adding digital product to cart (no stock check)."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.status = ProductStatus.ACTIVE
        mock_product.is_digital = True
        mock_product.stock_quantity = 0
        mock_product.price = 29.99

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
            with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
                with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                    result = await service.add_to_cart("123", 1, 1)
                    assert result.product_id == 1

    @pytest.mark.asyncio
    async def test_update_cart_item_success(self):
        """Test updating cart item quantity successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.product_id = 1
        mock_cart_item.unit_price = 99.99

        mock_product = Mock(spec=Product)
        mock_product.is_digital = False
        mock_product.stock_quantity = 10

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
                with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                    result = await service.update_cart_item("123", 1, 3)

                    assert result.quantity == 3
                    assert result.total_price == pytest.approx(299.97, rel=1e-5)
                    mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_cart_item_remove_when_zero(self):
        """Test updating cart item to zero quantity removes it."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.product_id = 1

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                result = await service.update_cart_item("123", 1, 0)

                assert result is None
                mock_db.delete.assert_called_once_with(mock_cart_item)
                mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_cart_item_negative_quantity(self):
        """Test updating cart item with negative quantity."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with pytest.raises(ValidationException, match="Quantity cannot be negative"):
            await service.update_cart_item("123", 1, -1)

    @pytest.mark.asyncio
    async def test_update_cart_item_not_found(self):
        """Test updating non-existent cart item."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with pytest.raises(NotFoundException, match="Cart item not found"):
                await service.update_cart_item("123", 999, 2)

    @pytest.mark.asyncio
    async def test_update_cart_item_insufficient_stock(self):
        """Test updating cart item with insufficient stock."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.product_id = 1

        mock_product = Mock(spec=Product)
        mock_product.is_digital = False
        mock_product.stock_quantity = 2

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
                with pytest.raises(ValidationException, match="Insufficient stock"):
                    await service.update_cart_item("123", 1, 5)

    @pytest.mark.asyncio
    async def test_remove_from_cart_success(self):
        """Test removing item from cart successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_cart_item = Mock(spec=CartItem)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_cart_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, '_update_cart_totals', new_callable=AsyncMock):
                result = await service.remove_from_cart("123", 1)

                assert result is True
                mock_db.delete.assert_called_once_with(mock_cart_item)
                mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_remove_from_cart_item_not_found(self):
        """Test removing non-existent item from cart."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            result = await service.remove_from_cart("123", 999)
            assert result is True

    @pytest.mark.asyncio
    async def test_clear_cart_success(self):
        """Test clearing cart successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.total_items = 5
        mock_cart.total_amount = 500.0

        mock_result = Mock()
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            result = await service.clear_cart("123")

            assert result is True
            assert mock_cart.total_items == 0
            assert mock_cart.total_amount == 0.0
            mock_db.commit.assert_called_once()

    # Order Tests
    @pytest.mark.asyncio
    async def test_create_order_from_cart_success(self):
        """Test creating order from cart successfully."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_product.sku = "TEST-SKU"
        mock_product.thumbnail_url = "image.jpg"
        mock_product.is_digital = False

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.product = mock_product
        mock_cart_item.product_id = 1
        mock_cart_item.quantity = 2
        mock_cart_item.unit_price = 100.0
        mock_cart_item.total_price = 200.0

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.items = [mock_cart_item]

        shipping_address = {"street": "123 Main St", "city": "Test City"}
        billing_address = {"street": "123 Main St", "city": "Test City"}

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, 'update_product_stock', new_callable=AsyncMock):
                with patch.object(service, 'clear_cart', new_callable=AsyncMock):
                    result = await service.create_order_from_cart(
                        "123", shipping_address, billing_address
                    )

                    assert result is not None
                    assert result.customer_id == "123"
                    assert result.subtotal == 200.0
                    assert result.total_amount == 236.0 + 50.0  # 18% tax + 50 shipping
                    mock_db.add.assert_called()
                    mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_order_from_cart_free_shipping(self):
        """Test creating order with free shipping (above threshold)."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_product.sku = "TEST-SKU"
        mock_product.thumbnail_url = "image.jpg"
        mock_product.is_digital = False

        mock_cart_item = Mock(spec=CartItem)
        mock_cart_item.product = mock_product
        mock_cart_item.product_id = 1
        mock_cart_item.quantity = 6
        mock_cart_item.unit_price = 100.0
        mock_cart_item.total_price = 600.0

        mock_cart = Mock(spec=Cart)
        mock_cart.id = 1
        mock_cart.items = [mock_cart_item]

        shipping_address = {"street": "123 Main St"}
        billing_address = {"street": "123 Main St"}

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with patch.object(service, 'update_product_stock', new_callable=AsyncMock):
                with patch.object(service, 'clear_cart', new_callable=AsyncMock):
                    result = await service.create_order_from_cart(
                        "123", shipping_address, billing_address
                    )

                    assert result.shipping_amount == 0.0  # Free shipping

    @pytest.mark.asyncio
    async def test_create_order_from_cart_empty_cart(self):
        """Test creating order from empty cart."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_cart = Mock(spec=Cart)
        mock_cart.items = []

        with patch.object(service, 'get_user_cart', new_callable=AsyncMock, return_value=mock_cart):
            with pytest.raises(ValidationException, match="Cart is empty"):
                await service.create_order_from_cart("123", {}, {})

    @pytest.mark.asyncio
    async def test_get_order_by_id_success(self):
        """Test getting order by ID successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order = Mock(spec=Order)
        mock_order.id = 1

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_order
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_order_by_id(1)

        assert result is mock_order
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_orders_success(self):
        """Test getting user orders successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_orders = [Mock(spec=Order), Mock(spec=Order)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_orders
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_user_orders("123", skip=0, limit=10)

        assert result == mock_orders
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_orders_with_status_filter(self):
        """Test getting user orders with status filter."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_orders = [Mock(spec=Order)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_orders
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_user_orders("123", status=OrderStatus.DELIVERED)

        assert result == mock_orders
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_orders_success(self):
        """Test listing all orders successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_orders = [Mock(spec=Order), Mock(spec=Order)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_orders
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_orders(skip=0, limit=10)

        assert result == mock_orders
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_orders_with_filters(self):
        """Test listing orders with filters."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_orders = [Mock(spec=Order)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_orders
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.list_orders(
            status=OrderStatus.PENDING,
            customer_id="123"
        )

        assert result == mock_orders
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_order_status_success(self):
        """Test updating order status successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order = Mock(spec=Order)
        mock_order.id = 1
        mock_order.status = OrderStatus.PENDING

        # Mock get_order_by_id to return the order
        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=mock_order):
            result = await service.update_order_status(1, OrderStatus.CONFIRMED)

            assert result is mock_order
            assert mock_order.status == OrderStatus.CONFIRMED
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_order_status_with_tracking(self):
        """Test updating order status with tracking number."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order = Mock(spec=Order)
        mock_order.id = 1
        mock_order.status = OrderStatus.CONFIRMED

        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=mock_order):
            result = await service.update_order_status(
                1, OrderStatus.SHIPPED, tracking_number="TRACK123"
            )

            assert mock_order.status == OrderStatus.SHIPPED
            assert mock_order.tracking_number == "TRACK123"
            assert hasattr(mock_order, 'shipped_at')

    @pytest.mark.asyncio
    async def test_update_order_status_to_delivered(self):
        """Test updating order status to delivered."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order = Mock(spec=Order)
        mock_order.id = 1
        mock_order.status = OrderStatus.SHIPPED

        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=mock_order):
            result = await service.update_order_status(1, OrderStatus.DELIVERED)

            assert mock_order.status == OrderStatus.DELIVERED
            assert hasattr(mock_order, 'delivered_at')

    @pytest.mark.asyncio
    async def test_update_order_status_not_found(self):
        """Test updating order status when order not found."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        # Mock get_order_by_id to return None
        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=None):
            with pytest.raises(NotFoundException):
                await service.update_order_status(999, OrderStatus.CONFIRMED)

    @pytest.mark.asyncio
    async def test_cancel_order_success(self):
        """Test cancelling order successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)
        mock_product.is_digital = False

        mock_order_item = Mock(spec=OrderItem)
        mock_order_item.product_id = 1
        mock_order_item.quantity = 2

        mock_order = Mock(spec=Order)
        mock_order.id = 1
        mock_order.status = OrderStatus.PENDING
        mock_order.items = [mock_order_item]

        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=mock_order):
            with patch.object(service, 'get_product_by_id', new_callable=AsyncMock, return_value=mock_product):
                with patch.object(service, 'update_product_stock', new_callable=AsyncMock):
                    result = await service.cancel_order(1)

                    assert result.status == OrderStatus.CANCELLED
                    mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_order_not_found(self):
        """Test cancelling non-existent order."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=None):
            with pytest.raises(NotFoundException, match="Order not found"):
                await service.cancel_order(999)

    @pytest.mark.asyncio
    async def test_cancel_order_invalid_status(self):
        """Test cancelling order with invalid status."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order = Mock(spec=Order)
        mock_order.id = 1
        mock_order.status = OrderStatus.DELIVERED

        with patch.object(service, 'get_order_by_id', new_callable=AsyncMock, return_value=mock_order):
            with pytest.raises(ValidationException, match="Order cannot be cancelled"):
                await service.cancel_order(1)

    # Review Tests
    @pytest.mark.asyncio
    async def test_create_product_review_success(self):
        """Test creating product review successfully."""
        mock_db = AsyncMock()
        # Configure add as a regular Mock since it's synchronous in SQLAlchemy
        mock_db.add = Mock()
        service = ShopService(mock_db)

        # Mock no existing review
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch.object(service, '_update_product_rating', new_callable=AsyncMock):
            result = await service.create_product_review(
                product_id=1,
                customer_id="123",
                rating=5,
                title="Great Product",
                comment="Loved it!"
            )

            assert result.product_id == 1
            assert result.customer_id == "123"
            assert result.rating == 5
            mock_db.add.assert_called()
            mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_product_review_invalid_rating(self):
        """Test creating review with invalid rating."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        with pytest.raises(ValidationException, match="Rating must be between 1 and 5"):
            await service.create_product_review(1, 123, 0)

        with pytest.raises(ValidationException, match="Rating must be between 1 and 5"):
            await service.create_product_review(1, 123, 6)

    @pytest.mark.asyncio
    async def test_create_product_review_duplicate(self):
        """Test creating duplicate review."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_existing_review = Mock(spec=ProductReview)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_existing_review
        mock_db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(ValidationException, match="You have already reviewed this product"):
            await service.create_product_review(1, 123, 5)

    @pytest.mark.asyncio
    async def test_get_product_reviews_success(self):
        """Test getting product reviews successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_reviews = [Mock(spec=ProductReview), Mock(spec=ProductReview)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_reviews
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_reviews(1)

        assert result == mock_reviews
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_product_reviews_with_rating_filter(self):
        """Test getting product reviews with rating filter."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_reviews = [Mock(spec=ProductReview)]

        mock_scalars = Mock()
        mock_scalars.all.return_value = mock_reviews
        mock_result = Mock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_reviews(1, rating_filter=5)

        assert result == mock_reviews
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_product_review_stats_success(self):
        """Test getting product review statistics."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.total_reviews = 10
        mock_stats.average_rating = 4.5
        mock_stats.five_star = 5
        mock_stats.four_star = 3
        mock_stats.three_star = 1
        mock_stats.two_star = 1
        mock_stats.one_star = 0

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_review_stats(1)

        assert result["total_reviews"] == 10
        assert result["average_rating"] == 4.5
        assert result["rating_distribution"]["5"] == 5
        assert result["rating_distribution"]["1"] == 0

    @pytest.mark.asyncio
    async def test_get_product_review_stats_no_reviews(self):
        """Test getting review stats for product with no reviews."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.total_reviews = None
        mock_stats.average_rating = None
        mock_stats.five_star = None
        mock_stats.four_star = None
        mock_stats.three_star = None
        mock_stats.two_star = None
        mock_stats.one_star = None

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_product_review_stats(1)

        assert result["total_reviews"] == 0
        assert result["average_rating"] == 0.0

    @pytest.mark.asyncio
    async def test_has_user_purchased_product_true(self):
        """Test checking if user has purchased product - returns True."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_order_item = Mock(spec=OrderItem)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_order_item
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.has_user_purchased_product("123", 456)

        assert result is True
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_has_user_purchased_product_false(self):
        """Test checking if user has purchased product - returns False."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.has_user_purchased_product("123", 456)

        assert result is False
        mock_db.execute.assert_called_once()

    # Analytics Tests
    @pytest.mark.asyncio
    async def test_get_sales_analytics_success(self):
        """Test getting sales analytics successfully."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        # Mock the analytics result
        mock_stats = Mock()
        mock_stats.total_orders = 100
        mock_stats.total_revenue = 10000.0
        mock_stats.average_order_value = 100.0
        mock_stats.completed_orders = 80
        mock_stats.cancelled_orders = 5

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_sales_analytics()

        assert result["total_orders"] == 100
        assert result["total_revenue"] == 10000.0
        assert result["average_order_value"] == 100.0
        assert result["completed_orders"] == 80
        assert result["cancelled_orders"] == 5
        assert result["completion_rate"] == 80.0
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_sales_analytics_with_date_range(self):
        """Test getting sales analytics with date range."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.total_orders = 50
        mock_stats.total_revenue = 5000.0
        mock_stats.average_order_value = 100.0
        mock_stats.completed_orders = 40
        mock_stats.cancelled_orders = 2

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_sales_analytics(
            start_date="2024-01-01",
            end_date="2024-12-31"
        )

        assert result["total_orders"] == 50
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_sales_analytics_no_orders(self):
        """Test getting sales analytics with no orders."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.total_orders = None
        mock_stats.total_revenue = None
        mock_stats.average_order_value = None
        mock_stats.completed_orders = None
        mock_stats.cancelled_orders = None

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service.get_sales_analytics()

        assert result["total_orders"] == 0
        assert result["total_revenue"] == 0.0
        assert result["completion_rate"] == 0


class TestShopServiceHelperMethods:
    """Tests for shop service helper methods."""

    def test_generate_slug_basic(self):
        """Test basic slug generation."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        slug = service._generate_slug("Simple Product")
        assert slug == "simple-product"

    def test_generate_slug_special_characters(self):
        """Test slug generation with special characters."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        slug = service._generate_slug("Product with @#$% Special Characters!")
        assert slug == "product-with-special-characters"

    def test_generate_slug_multiple_spaces(self):
        """Test slug generation with multiple spaces."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        slug = service._generate_slug("Product    with    multiple    spaces")
        assert slug == "product-with-multiple-spaces"

    def test_generate_slug_empty_string(self):
        """Test slug generation with empty string."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        slug = service._generate_slug("")
        assert slug == ""

    def test_generate_slug_numbers(self):
        """Test slug generation with numbers."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        slug = service._generate_slug("Product 123 Version 2.0")
        assert slug == "product-123-version-20"

    @pytest.mark.asyncio
    async def test_ensure_unique_slug_already_unique(self):
        """Test ensuring slug uniqueness when slug is already unique."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        result = await service._ensure_unique_slug("unique-slug")

        assert result == "unique-slug"
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_ensure_unique_slug_duplicate(self):
        """Test ensuring slug uniqueness when slug exists."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)

        # First call returns existing product, second returns None
        mock_result1 = Mock()
        mock_result1.scalar_one_or_none.return_value = mock_product
        mock_result2 = Mock()
        mock_result2.scalar_one_or_none.return_value = None

        mock_db.execute = AsyncMock(side_effect=[mock_result1, mock_result2])

        result = await service._ensure_unique_slug("duplicate-slug")

        assert result == "duplicate-slug-1"
        assert mock_db.execute.call_count == 2

    @pytest.mark.asyncio
    async def test_ensure_unique_slug_multiple_duplicates(self):
        """Test ensuring slug uniqueness with multiple duplicates."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_product = Mock(spec=Product)

        # Return existing products for first 3 calls, then None
        mock_result1 = Mock()
        mock_result1.scalar_one_or_none.return_value = mock_product
        mock_result2 = Mock()
        mock_result2.scalar_one_or_none.return_value = mock_product
        mock_result3 = Mock()
        mock_result3.scalar_one_or_none.return_value = mock_product
        mock_result4 = Mock()
        mock_result4.scalar_one_or_none.return_value = None

        mock_db.execute = AsyncMock(side_effect=[
            mock_result1, mock_result2, mock_result3, mock_result4
        ])

        result = await service._ensure_unique_slug("popular-slug")

        assert result == "popular-slug-3"
        assert mock_db.execute.call_count == 4

    @pytest.mark.asyncio
    async def test_update_cart_totals(self):
        """Test updating cart totals."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_totals = Mock()
        mock_totals.total_items = 5
        mock_totals.total_amount = 500.0

        mock_cart = Mock(spec=Cart)

        mock_result = Mock()
        mock_result.first.return_value = mock_totals
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.get = AsyncMock(return_value=mock_cart)

        await service._update_cart_totals(1)

        assert mock_cart.total_items == 5
        assert mock_cart.total_amount == 500.0
        mock_db.get.assert_called_once_with(Cart, 1)

    @pytest.mark.asyncio
    async def test_update_cart_totals_empty_cart(self):
        """Test updating cart totals for empty cart."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_totals = Mock()
        mock_totals.total_items = None
        mock_totals.total_amount = None

        mock_cart = Mock(spec=Cart)

        mock_result = Mock()
        mock_result.first.return_value = mock_totals
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.get = AsyncMock(return_value=mock_cart)

        await service._update_cart_totals(1)

        assert mock_cart.total_items == 0
        assert mock_cart.total_amount == 0.0

    @pytest.mark.asyncio
    async def test_update_product_rating(self):
        """Test updating product rating."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.average_rating = 4.5
        mock_stats.total_reviews = 10

        mock_product = Mock(spec=Product)

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.get = AsyncMock(return_value=mock_product)

        await service._update_product_rating(1)

        assert mock_product.average_rating == 4.5
        assert mock_product.total_reviews == 10
        mock_db.get.assert_called_once_with(Product, 1)

    @pytest.mark.asyncio
    async def test_update_product_rating_no_reviews(self):
        """Test updating product rating with no reviews."""
        mock_db = AsyncMock()
        service = ShopService(mock_db)

        mock_stats = Mock()
        mock_stats.average_rating = None
        mock_stats.total_reviews = None

        mock_product = Mock(spec=Product)

        mock_result = Mock()
        mock_result.first.return_value = mock_stats
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.get = AsyncMock(return_value=mock_product)

        await service._update_product_rating(1)

        assert mock_product.average_rating == 0.0
        assert mock_product.total_reviews == 0

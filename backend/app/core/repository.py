"""
Enhanced CRUD Repository Pattern with advanced features.
Provides a generic base for all CRUD operations with caching, filtering, and optimization.
"""
import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from datetime import datetime, timezone
from sqlalchemy import and_, or_, desc, asc, func, text, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import SQLModel

from app.core.redis import get_redis
from app.core.logging import get_logger
from app.core.exceptions import NotFoundException, ValidationException

logger = get_logger(__name__)

# Generic type for SQLModel
ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)


class FilterOperator:
    """Filter operators for advanced querying."""
    EQ = "eq"           # Equal
    NE = "ne"           # Not equal
    GT = "gt"           # Greater than
    GTE = "gte"         # Greater than or equal
    LT = "lt"           # Less than
    LTE = "lte"         # Less than or equal
    IN = "in"           # In list
    NOT_IN = "not_in"   # Not in list
    LIKE = "like"       # SQL LIKE
    ILIKE = "ilike"     # Case insensitive LIKE
    IS_NULL = "is_null" # Is NULL
    IS_NOT_NULL = "is_not_null"  # Is NOT NULL
    BETWEEN = "between" # Between two values


class SortOrder:
    """Sort order constants."""
    ASC = "asc"
    DESC = "desc"


class PaginationParams:
    """Pagination parameters."""
    def __init__(
        self,
        page: int = 1,
        size: int = 20,
        max_size: int = 100,
        cursor: Optional[str] = None,
    ):
        self.page = max(1, page)
        self.size = min(max(1, size), max_size)
        self.offset = (self.page - 1) * self.size
        self.cursor = cursor


class FilterParams:
    """Advanced filtering parameters."""
    def __init__(
        self,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        date_range: Optional[Dict[str, datetime]] = None,
    ):
        self.filters = filters or {}
        self.search = search
        self.search_fields = search_fields or []
        self.date_range = date_range


class SortParams:
    """Sorting parameters."""
    def __init__(
        self,
        sort_by: Optional[str] = None,
        sort_order: str = SortOrder.DESC,
        secondary_sort: Optional[Dict[str, str]] = None,
    ):
        self.sort_by = sort_by
        self.sort_order = sort_order
        self.secondary_sort = secondary_sort or {}


class QueryResult:
    """Query result with metadata."""
    def __init__(
        self,
        items: List[ModelType],
        total: int,
        page: int,
        size: int,
        has_next: bool = False,
        has_prev: bool = False,
        next_cursor: Optional[str] = None,
    ):
        self.items = items
        self.total = total
        self.page = page
        self.size = size
        self.has_next = has_next
        self.has_prev = has_prev
        self.next_cursor = next_cursor
        self.total_pages = (total + size - 1) // size if size > 0 else 0


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType], ABC):
    """
    Enhanced base repository with advanced CRUD operations.
    """
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
        self.redis = None  # Will be injected
        self._cache_ttl = 300  # 5 minutes default
        
    async def _get_redis(self):
        """Get Redis instance."""
        if not self.redis:
            self.redis = await get_redis()
        return self.redis
    
    def _get_cache_key(self, prefix: str, identifier: Union[str, int]) -> str:
        """Generate cache key."""
        return f"{self.model.__tablename__}:{prefix}:{identifier}"
    
    async def _cache_get(self, key: str) -> Optional[Any]:
        """Get from cache."""
        try:
            redis = await self._get_redis()
            return await redis.get(key)
        except Exception as e:
            logger.warning("Cache get failed", key=key, error=str(e))
            return None
    
    async def _cache_set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set cache value."""
        try:
            redis = await self._get_redis()
            await redis.set(key, value, ttl=ttl or self._cache_ttl)
        except Exception as e:
            logger.warning("Cache set failed", key=key, error=str(e))
    
    async def _cache_delete(self, key: str) -> None:
        """Delete from cache."""
        try:
            redis = await self._get_redis()
            await redis.delete(key)
        except Exception as e:
            logger.warning("Cache delete failed", key=key, error=str(e))
    
    async def _invalidate_cache_pattern(self, pattern: str) -> None:
        """Invalidate cache keys matching pattern."""
        try:
            redis = await self._get_redis()
            # This would need Redis SCAN in production
            # For now, we'll just log the pattern
            logger.info("Cache pattern invalidated", pattern=pattern)
        except Exception as e:
            logger.warning("Cache pattern invalidation failed", pattern=pattern, error=str(e))
    
    def _apply_filters(self, query, filters: FilterParams):
        """Apply filters to query."""
        if not filters.filters:
            return query
        
        conditions = []
        
        for field, filter_config in filters.filters.items():
            if not hasattr(self.model, field):
                continue
                
            column = getattr(self.model, field)
            
            if isinstance(filter_config, dict):
                operator = filter_config.get("operator", FilterOperator.EQ)
                value = filter_config.get("value")
            else:
                operator = FilterOperator.EQ
                value = filter_config
            
            if value is None and operator not in [FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL]:
                continue
            
            # Apply operator
            if operator == FilterOperator.EQ:
                conditions.append(column == value)
            elif operator == FilterOperator.NE:
                conditions.append(column != value)
            elif operator == FilterOperator.GT:
                conditions.append(column > value)
            elif operator == FilterOperator.GTE:
                conditions.append(column >= value)
            elif operator == FilterOperator.LT:
                conditions.append(column < value)
            elif operator == FilterOperator.LTE:
                conditions.append(column <= value)
            elif operator == FilterOperator.IN:
                if isinstance(value, (list, tuple)) and value:
                    conditions.append(column.in_(value))
            elif operator == FilterOperator.NOT_IN:
                if isinstance(value, (list, tuple)) and value:
                    conditions.append(~column.in_(value))
            elif operator == FilterOperator.LIKE:
                conditions.append(column.like(f"%{value}%"))
            elif operator == FilterOperator.ILIKE:
                conditions.append(column.ilike(f"%{value}%"))
            elif operator == FilterOperator.IS_NULL:
                conditions.append(column.is_(None))
            elif operator == FilterOperator.IS_NOT_NULL:
                conditions.append(column.is_not(None))
            elif operator == FilterOperator.BETWEEN:
                if isinstance(value, (list, tuple)) and len(value) == 2:
                    conditions.append(column.between(value[0], value[1]))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        return query
    
    def _apply_search(self, query, filters: FilterParams):
        """Apply search to query."""
        if not filters.search or not filters.search_fields:
            return query
        
        search_conditions = []
        search_term = f"%{filters.search}%"
        
        for field in filters.search_fields:
            if hasattr(self.model, field):
                column = getattr(self.model, field)
                search_conditions.append(column.ilike(search_term))
        
        if search_conditions:
            query = query.where(or_(*search_conditions))
        
        return query
    
    def _apply_date_range(self, query, filters: FilterParams):
        """Apply date range filter."""
        if not filters.date_range:
            return query
        
        date_field = filters.date_range.get("field", "created_at")
        start_date = filters.date_range.get("start")
        end_date = filters.date_range.get("end")
        
        if hasattr(self.model, date_field):
            column = getattr(self.model, date_field)
            
            if start_date:
                query = query.where(column >= start_date)
            if end_date:
                query = query.where(column <= end_date)
        
        return query
    
    def _apply_sorting(self, query, sort_params: SortParams):
        """Apply sorting to query."""
        if not sort_params.sort_by:
            # Default sort by id desc
            if hasattr(self.model, "id"):
                return query.order_by(desc(self.model.id))
            return query
        
        if not hasattr(self.model, sort_params.sort_by):
            return query
        
        column = getattr(self.model, sort_params.sort_by)
        
        if sort_params.sort_order == SortOrder.ASC:
            query = query.order_by(asc(column))
        else:
            query = query.order_by(desc(column))
        
        # Apply secondary sorting
        for field, order in sort_params.secondary_sort.items():
            if hasattr(self.model, field):
                sec_column = getattr(self.model, field)
                if order == SortOrder.ASC:
                    query = query.order_by(asc(sec_column))
                else:
                    query = query.order_by(desc(sec_column))
        
        return query
    
    async def create(
        self,
        obj_in: CreateSchemaType,
        commit: bool = True,
        refresh: bool = True,
    ) -> ModelType:
        """Create a new record."""
        try:
            # Convert Pydantic model to dict
            if hasattr(obj_in, "model_dump"):
                obj_data = obj_in.model_dump()
            else:
                obj_data = obj_in.dict()
            
            # Add timestamps if model supports them
            if hasattr(self.model, "created_at"):
                obj_data["created_at"] = datetime.now(timezone.utc)
            if hasattr(self.model, "updated_at"):
                obj_data["updated_at"] = datetime.now(timezone.utc)
            
            # Create model instance
            db_obj = self.model(**obj_data)
            
            # Add to session
            self.db.add(db_obj)
            
            if commit:
                await self.db.commit()
            
            if refresh:
                await self.db.refresh(db_obj)
            
            # Invalidate related caches
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            logger.info("Record created", model=self.model.__name__, id=getattr(db_obj, "id", None))
            return db_obj
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to create record", model=self.model.__name__, error=str(e))
            raise ValidationException(f"Failed to create {self.model.__name__}: {str(e)}")
    
    async def get_by_id(
        self,
        id: Any,
        use_cache: bool = True,
        relationships: Optional[List[str]] = None,
    ) -> Optional[ModelType]:
        """Get record by ID with caching."""
        cache_key = self._get_cache_key("id", id)
        
        # Try cache first
        if use_cache:
            cached_result = await self._cache_get(cache_key)
            if cached_result:
                return cached_result
        
        try:
            # Build query
            query = select(self.model).where(self.model.id == id)
            
            # Add relationships if specified
            if relationships:
                for rel in relationships:
                    if hasattr(self.model, rel):
                        query = query.options(selectinload(getattr(self.model, rel)))
            
            # Execute query
            result = await self.db.execute(query)
            db_obj = result.scalar_one_or_none()
            
            # Cache result
            if db_obj and use_cache:
                await self._cache_set(cache_key, db_obj)
            
            return db_obj
            
        except Exception as e:
            logger.error("Failed to get record by ID", model=self.model.__name__, id=id, error=str(e))
            return None
    
    async def get_multi(
        self,
        pagination: PaginationParams,
        filters: Optional[FilterParams] = None,
        sort_params: Optional[SortParams] = None,
        relationships: Optional[List[str]] = None,
    ) -> QueryResult:
        """Get multiple records with advanced filtering and pagination."""
        try:
            # Build base query
            query = select(self.model)
            count_query = select(func.count(self.model.id))
            
            # Apply filters
            if filters:
                query = self._apply_filters(query, filters)
                query = self._apply_search(query, filters)
                query = self._apply_date_range(query, filters)
                
                count_query = self._apply_filters(count_query, filters)
                count_query = self._apply_search(count_query, filters)
                count_query = self._apply_date_range(count_query, filters)
            
            # Get total count
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Apply sorting
            if sort_params:
                query = self._apply_sorting(query, sort_params)
            
            # Add relationships
            if relationships:
                for rel in relationships:
                    if hasattr(self.model, rel):
                        query = query.options(selectinload(getattr(self.model, rel)))
            
            # Apply pagination
            query = query.offset(pagination.offset).limit(pagination.size)
            
            # Execute query
            result = await self.db.execute(query)
            items = result.scalars().all()
            
            # Calculate pagination metadata
            has_next = pagination.offset + pagination.size < total
            has_prev = pagination.page > 1
            
            return QueryResult(
                items=list(items),
                total=total,
                page=pagination.page,
                size=pagination.size,
                has_next=has_next,
                has_prev=has_prev,
            )
            
        except Exception as e:
            logger.error("Failed to get multiple records", model=self.model.__name__, error=str(e))
            raise ValidationException(f"Failed to query {self.model.__name__}: {str(e)}")
    
    async def update(
        self,
        id: Any,
        obj_in: UpdateSchemaType,
        commit: bool = True,
        refresh: bool = True,
    ) -> Optional[ModelType]:
        """Update a record."""
        try:
            # Get existing record
            db_obj = await self.get_by_id(id, use_cache=False)
            if not db_obj:
                raise NotFoundException(f"{self.model.__name__} with id {id} not found")
            
            # Convert update data
            if hasattr(obj_in, "model_dump"):
                update_data = obj_in.model_dump(exclude_unset=True)
            else:
                update_data = obj_in.dict(exclude_unset=True)
            
            # Add updated timestamp
            if hasattr(self.model, "updated_at"):
                update_data["updated_at"] = datetime.now(timezone.utc)
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            if commit:
                await self.db.commit()
            
            if refresh:
                await self.db.refresh(db_obj)
            
            # Invalidate caches
            await self._cache_delete(self._get_cache_key("id", id))
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            logger.info("Record updated", model=self.model.__name__, id=id)
            return db_obj
            
        except NotFoundException:
            raise
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to update record", model=self.model.__name__, id=id, error=str(e))
            raise ValidationException(f"Failed to update {self.model.__name__}: {str(e)}")
    
    async def delete(
        self,
        id: Any,
        soft_delete: bool = True,
        commit: bool = True,
    ) -> bool:
        """Delete a record (soft delete by default)."""
        try:
            db_obj = await self.get_by_id(id, use_cache=False)
            if not db_obj:
                raise NotFoundException(f"{self.model.__name__} with id {id} not found")
            
            if soft_delete and hasattr(self.model, "deleted_at"):
                # Soft delete
                setattr(db_obj, "deleted_at", datetime.now(timezone.utc))
                if hasattr(self.model, "updated_at"):
                    setattr(db_obj, "updated_at", datetime.now(timezone.utc))
            else:
                # Hard delete
                await self.db.delete(db_obj)
            
            if commit:
                await self.db.commit()
            
            # Invalidate caches
            await self._cache_delete(self._get_cache_key("id", id))
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            logger.info("Record deleted", model=self.model.__name__, id=id, soft=soft_delete)
            return True
            
        except NotFoundException:
            raise
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to delete record", model=self.model.__name__, id=id, error=str(e))
            raise ValidationException(f"Failed to delete {self.model.__name__}: {str(e)}")
    
    async def bulk_create(
        self,
        objects: List[CreateSchemaType],
        batch_size: int = 1000,
        commit: bool = True,
    ) -> List[ModelType]:
        """Bulk create records."""
        try:
            created_objects = []
            
            for i in range(0, len(objects), batch_size):
                batch = objects[i:i + batch_size]
                batch_objects = []
                
                for obj_in in batch:
                    if hasattr(obj_in, "model_dump"):
                        obj_data = obj_in.model_dump()
                    else:
                        obj_data = obj_in.dict()
                    
                    # Add timestamps
                    if hasattr(self.model, "created_at"):
                        obj_data["created_at"] = datetime.now(timezone.utc)
                    if hasattr(self.model, "updated_at"):
                        obj_data["updated_at"] = datetime.now(timezone.utc)
                    
                    db_obj = self.model(**obj_data)
                    batch_objects.append(db_obj)
                
                # Add batch to session
                self.db.add_all(batch_objects)
                created_objects.extend(batch_objects)
            
            if commit:
                await self.db.commit()
            
            # Invalidate caches
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            logger.info("Bulk create completed", model=self.model.__name__, count=len(created_objects))
            return created_objects
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to bulk create", model=self.model.__name__, error=str(e))
            raise ValidationException(f"Failed to bulk create {self.model.__name__}: {str(e)}")
    
    async def bulk_update(
        self,
        updates: List[Dict[str, Any]],
        commit: bool = True,
    ) -> int:
        """Bulk update records."""
        try:
            if not updates:
                return 0
            
            # Add updated timestamp to all updates
            if hasattr(self.model, "updated_at"):
                for update_data in updates:
                    update_data["updated_at"] = datetime.now(timezone.utc)
            
            # Execute bulk update
            stmt = update(self.model)
            result = await self.db.execute(stmt, updates)
            
            if commit:
                await self.db.commit()
            
            # Invalidate caches
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            updated_count = result.rowcount
            logger.info("Bulk update completed", model=self.model.__name__, count=updated_count)
            return updated_count
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to bulk update", model=self.model.__name__, error=str(e))
            raise ValidationException(f"Failed to bulk update {self.model.__name__}: {str(e)}")
    
    async def bulk_delete(
        self,
        ids: List[Any],
        soft_delete: bool = True,
        commit: bool = True,
    ) -> int:
        """Bulk delete records."""
        try:
            if not ids:
                return 0
            
            if soft_delete and hasattr(self.model, "deleted_at"):
                # Soft delete
                stmt = (
                    update(self.model)
                    .where(self.model.id.in_(ids))
                    .values(
                        deleted_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc) if hasattr(self.model, "updated_at") else None
                    )
                )
            else:
                # Hard delete
                stmt = delete(self.model).where(self.model.id.in_(ids))
            
            result = await self.db.execute(stmt)
            
            if commit:
                await self.db.commit()
            
            # Invalidate caches
            await self._invalidate_cache_pattern(f"{self.model.__tablename__}:*")
            
            deleted_count = result.rowcount
            logger.info("Bulk delete completed", model=self.model.__name__, count=deleted_count, soft=soft_delete)
            return deleted_count
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to bulk delete", model=self.model.__name__, error=str(e))
            raise ValidationException(f"Failed to bulk delete {self.model.__name__}: {str(e)}")
    
    async def exists(self, id: Any) -> bool:
        """Check if record exists."""
        try:
            query = select(self.model.id).where(self.model.id == id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none() is not None
        except Exception:
            return False
    
    async def count(self, filters: Optional[FilterParams] = None) -> int:
        """Count records with optional filters."""
        try:
            query = select(func.count(self.model.id))
            
            if filters:
                query = self._apply_filters(query, filters)
                query = self._apply_search(query, filters)
                query = self._apply_date_range(query, filters)
            
            result = await self.db.execute(query)
            return result.scalar()
            
        except Exception as e:
            logger.error("Failed to count records", model=self.model.__name__, error=str(e))
            return 0
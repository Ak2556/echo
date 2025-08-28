"""
Enhanced Service Layer with business logic, validation, and caching.
Provides a base service class with common operations and patterns.
"""
import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.repository import (
    BaseRepository, 
    FilterParams, 
    PaginationParams, 
    SortParams, 
    QueryResult,
    ModelType,
    CreateSchemaType,
    UpdateSchemaType
)
from app.core.redis import get_redis, cache
from app.core.logging import get_logger
from app.core.exceptions import (
    ValidationException, 
    NotFoundException, 
    ConflictException,
    create_success_response
)

logger = get_logger(__name__)


class ValidationRule:
    """Validation rule for business logic."""
    def __init__(
        self,
        field: str,
        rule: callable,
        message: str,
        severity: str = "error"  # error, warning
    ):
        self.field = field
        self.rule = rule
        self.message = message
        self.severity = severity


class BusinessRule:
    """Business rule for complex validation."""
    def __init__(
        self,
        name: str,
        condition: callable,
        message: str,
        action: str = "reject"  # reject, warn, log
    ):
        self.name = name
        self.condition = condition
        self.message = message
        self.action = action


class AuditEntry:
    """Audit trail entry."""
    def __init__(
        self,
        entity_type: str,
        entity_id: Any,
        action: str,
        user_id: Optional[str] = None,
        changes: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.action = action
        self.user_id = user_id
        self.changes = changes or {}
        self.metadata = metadata or {}
        self.timestamp = datetime.now(timezone.utc)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType], ABC):
    """
    Enhanced base service with business logic, validation, and caching.
    """
    
    def __init__(
        self,
        repository: BaseRepository[ModelType, CreateSchemaType, UpdateSchemaType],
        db: AsyncSession,
    ):
        self.repository = repository
        self.db = db
        self.redis = None
        self._validation_rules: List[ValidationRule] = []
        self._business_rules: List[BusinessRule] = []
        self._audit_enabled = True
        
    async def _get_redis(self):
        """Get Redis instance."""
        if not self.redis:
            self.redis = await get_redis()
        return self.redis
    
    def add_validation_rule(self, rule: ValidationRule) -> None:
        """Add validation rule."""
        self._validation_rules.append(rule)
    
    def add_business_rule(self, rule: BusinessRule) -> None:
        """Add business rule."""
        self._business_rules.append(rule)
    
    async def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> Dict[str, List[str]]:
        """Validate data against rules."""
        errors = {}
        warnings = {}
        
        for rule in self._validation_rules:
            if rule.field in data or not is_update:
                value = data.get(rule.field)
                try:
                    if not rule.rule(value):
                        if rule.severity == "error":
                            if rule.field not in errors:
                                errors[rule.field] = []
                            errors[rule.field].append(rule.message)
                        else:
                            if rule.field not in warnings:
                                warnings[rule.field] = []
                            warnings[rule.field].append(rule.message)
                except Exception as e:
                    logger.error("Validation rule failed", field=rule.field, error=str(e))
        
        return {"errors": errors, "warnings": warnings}
    
    async def _check_business_rules(self, data: Dict[str, Any], existing_data: Optional[Dict[str, Any]] = None) -> List[str]:
        """Check business rules."""
        violations = []
        
        for rule in self._business_rules:
            try:
                context = {"data": data, "existing": existing_data}
                if not rule.condition(context):
                    if rule.action == "reject":
                        violations.append(rule.message)
                    elif rule.action == "warn":
                        logger.warning("Business rule violation", rule=rule.name, message=rule.message)
                    else:
                        logger.info("Business rule triggered", rule=rule.name, message=rule.message)
            except Exception as e:
                logger.error("Business rule check failed", rule=rule.name, error=str(e))
        
        return violations
    
    async def _audit_action(self, audit_entry: AuditEntry) -> None:
        """Record audit entry."""
        if not self._audit_enabled:
            return
        
        try:
            # In a real implementation, this would save to an audit table
            logger.info(
                "Audit entry",\n                entity_type=audit_entry.entity_type,\n                entity_id=audit_entry.entity_id,\n                action=audit_entry.action,\n                user_id=audit_entry.user_id,\n                changes=audit_entry.changes,\n                metadata=audit_entry.metadata,\n                timestamp=audit_entry.timestamp.isoformat(),\n            )\n        except Exception as e:\n            logger.error("Failed to record audit entry", error=str(e))\n    \n    async def _before_create(self, data: CreateSchemaType, user_id: Optional[str] = None) -> CreateSchemaType:\n        \"\"\"Hook called before create operation.\"\"\"\n        return data\n    \n    async def _after_create(self, obj: ModelType, user_id: Optional[str] = None) -> ModelType:\n        \"\"\"Hook called after create operation.\"\"\"\n        return obj\n    \n    async def _before_update(self, id: Any, data: UpdateSchemaType, existing: ModelType, user_id: Optional[str] = None) -> UpdateSchemaType:\n        \"\"\"Hook called before update operation.\"\"\"\n        return data\n    \n    async def _after_update(self, obj: ModelType, changes: Dict[str, Any], user_id: Optional[str] = None) -> ModelType:\n        \"\"\"Hook called after update operation.\"\"\"\n        return obj\n    \n    async def _before_delete(self, id: Any, existing: ModelType, user_id: Optional[str] = None) -> None:\n        \"\"\"Hook called before delete operation.\"\"\"\n        pass\n    \n    async def _after_delete(self, id: Any, user_id: Optional[str] = None) -> None:\n        \"\"\"Hook called after delete operation.\"\"\"\n        pass\n    \n    @cache(ttl=300, key_prefix=\"service_get\")\n    async def get_by_id(\n        self,\n        id: Any,\n        user_id: Optional[str] = None,\n        relationships: Optional[List[str]] = None,\n    ) -> Optional[ModelType]:\n        \"\"\"Get entity by ID with caching.\"\"\"\n        try:\n            obj = await self.repository.get_by_id(id, relationships=relationships)\n            \n            if obj:\n                # Check access permissions if needed\n                if not await self._check_read_permission(obj, user_id):\n                    raise NotFoundException(f\"Entity with id {id} not found\")\n            \n            return obj\n            \n        except Exception as e:\n            logger.error("Failed to get entity by ID", id=id, error=str(e))\n            raise\n    \n    async def get_multi(\n        self,\n        pagination: PaginationParams,\n        filters: Optional[FilterParams] = None,\n        sort_params: Optional[SortParams] = None,\n        user_id: Optional[str] = None,\n        relationships: Optional[List[str]] = None,\n    ) -> QueryResult:\n        \"\"\"Get multiple entities with filtering and pagination.\"\"\"\n        try:\n            # Apply user-specific filters if needed\n            if filters and user_id:\n                filters = await self._apply_user_filters(filters, user_id)\n            \n            result = await self.repository.get_multi(\n                pagination=pagination,\n                filters=filters,\n                sort_params=sort_params,\n                relationships=relationships,\n            )\n            \n            # Filter results based on permissions\n            if user_id:\n                filtered_items = []\n                for item in result.items:\n                    if await self._check_read_permission(item, user_id):\n                        filtered_items.append(item)\n                result.items = filtered_items\n                result.total = len(filtered_items)  # Adjust total for filtered results\n            \n            return result\n            \n        except Exception as e:\n            logger.error("Failed to get multiple entities", error=str(e))\n            raise\n    \n    async def create(\n        self,\n        obj_in: CreateSchemaType,\n        user_id: Optional[str] = None,\n        skip_validation: bool = False,\n    ) -> ModelType:\n        \"\"\"Create new entity with validation and audit.\"\"\"\n        try:\n            # Pre-create hook\n            obj_in = await self._before_create(obj_in, user_id)\n            \n            # Convert to dict for validation\n            if hasattr(obj_in, \"model_dump\"):\n                data = obj_in.model_dump()\n            else:\n                data = obj_in.dict()\n            \n            # Validate data\n            if not skip_validation:\n                validation_result = await self._validate_data(data)\n                if validation_result[\"errors\"]:\n                    raise ValidationException(\n                        \"Validation failed\",\n                        field_errors=validation_result[\"errors\"]\n                    )\n                \n                # Check business rules\n                violations = await self._check_business_rules(data)\n                if violations:\n                    raise ValidationException(f\"Business rule violations: {'; '.join(violations)}\")\n            \n            # Check create permission\n            if not await self._check_create_permission(data, user_id):\n                raise ValidationException(\"Insufficient permissions to create entity\")\n            \n            # Create entity\n            obj = await self.repository.create(obj_in)\n            \n            # Post-create hook\n            obj = await self._after_create(obj, user_id)\n            \n            # Audit\n            await self._audit_action(AuditEntry(\n                entity_type=self.repository.model.__name__,\n                entity_id=getattr(obj, \"id\", None),\n                action=\"create\",\n                user_id=user_id,\n                changes=data,\n            ))\n            \n            logger.info(\"Entity created\", entity_type=self.repository.model.__name__, id=getattr(obj, \"id\", None))\n            return obj\n            \n        except (ValidationException, NotFoundException):\n            raise\n        except Exception as e:\n            logger.error(\"Failed to create entity\", error=str(e))\n            raise ValidationException(f\"Failed to create entity: {str(e)}\")\n    \n    async def update(\n        self,\n        id: Any,\n        obj_in: UpdateSchemaType,\n        user_id: Optional[str] = None,\n        skip_validation: bool = False,\n    ) -> Optional[ModelType]:\n        \"\"\"Update entity with validation and audit.\"\"\"\n        try:\n            # Get existing entity\n            existing = await self.repository.get_by_id(id, use_cache=False)\n            if not existing:\n                raise NotFoundException(f\"Entity with id {id} not found\")\n            \n            # Check update permission\n            if not await self._check_update_permission(existing, user_id):\n                raise ValidationException(\"Insufficient permissions to update entity\")\n            \n            # Pre-update hook\n            obj_in = await self._before_update(id, obj_in, existing, user_id)\n            \n            # Convert to dict for validation\n            if hasattr(obj_in, \"model_dump\"):\n                update_data = obj_in.model_dump(exclude_unset=True)\n            else:\n                update_data = obj_in.dict(exclude_unset=True)\n            \n            # Validate data\n            if not skip_validation:\n                validation_result = await self._validate_data(update_data, is_update=True)\n                if validation_result[\"errors\"]:\n                    raise ValidationException(\n                        \"Validation failed\",\n                        field_errors=validation_result[\"errors\"]\n                    )\n                \n                # Check business rules\n                existing_data = existing.dict() if hasattr(existing, \"dict\") else existing.__dict__\n                violations = await self._check_business_rules(update_data, existing_data)\n                if violations:\n                    raise ValidationException(f\"Business rule violations: {'; '.join(violations)}\")\n            \n            # Track changes for audit\n            changes = {}\n            for field, new_value in update_data.items():\n                old_value = getattr(existing, field, None)\n                if old_value != new_value:\n                    changes[field] = {\"old\": old_value, \"new\": new_value}\n            \n            # Update entity\n            obj = await self.repository.update(id, obj_in)\n            \n            # Post-update hook\n            obj = await self._after_update(obj, changes, user_id)\n            \n            # Audit\n            if changes:\n                await self._audit_action(AuditEntry(\n                    entity_type=self.repository.model.__name__,\n                    entity_id=id,\n                    action=\"update\",\n                    user_id=user_id,\n                    changes=changes,\n                ))\n            \n            logger.info(\"Entity updated\", entity_type=self.repository.model.__name__, id=id, changes=len(changes))\n            return obj\n            \n        except (ValidationException, NotFoundException):\n            raise\n        except Exception as e:\n            logger.error(\"Failed to update entity\", id=id, error=str(e))\n            raise ValidationException(f\"Failed to update entity: {str(e)}\")\n    \n    async def delete(\n        self,\n        id: Any,\n        user_id: Optional[str] = None,\n        soft_delete: bool = True,\n    ) -> bool:\n        \"\"\"Delete entity with audit.\"\"\"\n        try:\n            # Get existing entity\n            existing = await self.repository.get_by_id(id, use_cache=False)\n            if not existing:\n                raise NotFoundException(f\"Entity with id {id} not found\")\n            \n            # Check delete permission\n            if not await self._check_delete_permission(existing, user_id):\n                raise ValidationException(\"Insufficient permissions to delete entity\")\n            \n            # Pre-delete hook\n            await self._before_delete(id, existing, user_id)\n            \n            # Delete entity\n            success = await self.repository.delete(id, soft_delete=soft_delete)\n            \n            # Post-delete hook\n            await self._after_delete(id, user_id)\n            \n            # Audit\n            await self._audit_action(AuditEntry(\n                entity_type=self.repository.model.__name__,\n                entity_id=id,\n                action=\"delete\" if not soft_delete else \"soft_delete\",\n                user_id=user_id,\n            ))\n            \n            logger.info(\"Entity deleted\", entity_type=self.repository.model.__name__, id=id, soft=soft_delete)\n            return success\n            \n        except (ValidationException, NotFoundException):\n            raise\n        except Exception as e:\n            logger.error(\"Failed to delete entity\", id=id, error=str(e))\n            raise ValidationException(f\"Failed to delete entity: {str(e)}\")\n    \n    async def bulk_create(\n        self,\n        objects: List[CreateSchemaType],\n        user_id: Optional[str] = None,\n        batch_size: int = 1000,\n        skip_validation: bool = False,\n    ) -> List[ModelType]:\n        \"\"\"Bulk create entities.\"\"\"\n        try:\n            # Validate all objects first\n            if not skip_validation:\n                for i, obj_in in enumerate(objects):\n                    data = obj_in.model_dump() if hasattr(obj_in, \"model_dump\") else obj_in.dict()\n                    validation_result = await self._validate_data(data)\n                    if validation_result[\"errors\"]:\n                        raise ValidationException(\n                            f\"Validation failed for object {i}\",\n                            field_errors=validation_result[\"errors\"]\n                        )\n            \n            # Check bulk create permission\n            if not await self._check_bulk_create_permission(user_id):\n                raise ValidationException(\"Insufficient permissions for bulk create\")\n            \n            # Create entities\n            created_objects = await self.repository.bulk_create(objects, batch_size=batch_size)\n            \n            # Audit\n            await self._audit_action(AuditEntry(\n                entity_type=self.repository.model.__name__,\n                entity_id=\"bulk\",\n                action=\"bulk_create\",\n                user_id=user_id,\n                metadata={\"count\": len(created_objects)},\n            ))\n            \n            logger.info(\"Bulk create completed\", entity_type=self.repository.model.__name__, count=len(created_objects))\n            return created_objects\n            \n        except (ValidationException, NotFoundException):\n            raise\n        except Exception as e:\n            logger.error(\"Failed to bulk create entities\", error=str(e))\n            raise ValidationException(f\"Failed to bulk create entities: {str(e)}\")\n    \n    async def bulk_delete(\n        self,\n        ids: List[Any],\n        user_id: Optional[str] = None,\n        soft_delete: bool = True,\n    ) -> int:\n        \"\"\"Bulk delete entities.\"\"\"\n        try:\n            # Check bulk delete permission\n            if not await self._check_bulk_delete_permission(user_id):\n                raise ValidationException(\"Insufficient permissions for bulk delete\")\n            \n            # Delete entities\n            deleted_count = await self.repository.bulk_delete(ids, soft_delete=soft_delete)\n            \n            # Audit\n            await self._audit_action(AuditEntry(\n                entity_type=self.repository.model.__name__,\n                entity_id=\"bulk\",\n                action=\"bulk_delete\" if not soft_delete else \"bulk_soft_delete\",\n                user_id=user_id,\n                metadata={\"count\": deleted_count, \"ids\": ids},\n            ))\n            \n            logger.info(\"Bulk delete completed\", entity_type=self.repository.model.__name__, count=deleted_count)\n            return deleted_count\n            \n        except (ValidationException, NotFoundException):\n            raise\n        except Exception as e:\n            logger.error(\"Failed to bulk delete entities\", error=str(e))\n            raise ValidationException(f\"Failed to bulk delete entities: {str(e)}\")\n    \n    async def count(\n        self,\n        filters: Optional[FilterParams] = None,\n        user_id: Optional[str] = None,\n    ) -> int:\n        \"\"\"Count entities with optional filters.\"\"\"\n        try:\n            # Apply user-specific filters if needed\n            if filters and user_id:\n                filters = await self._apply_user_filters(filters, user_id)\n            \n            return await self.repository.count(filters)\n            \n        except Exception as e:\n            logger.error(\"Failed to count entities\", error=str(e))\n            return 0\n    \n    async def exists(self, id: Any) -> bool:\n        \"\"\"Check if entity exists.\"\"\"\n        return await self.repository.exists(id)\n    \n    # Permission check methods (to be overridden by subclasses)\n    \n    async def _check_read_permission(self, obj: ModelType, user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can read the entity.\"\"\"\n        return True  # Default: allow all reads\n    \n    async def _check_create_permission(self, data: Dict[str, Any], user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can create the entity.\"\"\"\n        return True  # Default: allow all creates\n    \n    async def _check_update_permission(self, obj: ModelType, user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can update the entity.\"\"\"\n        return True  # Default: allow all updates\n    \n    async def _check_delete_permission(self, obj: ModelType, user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can delete the entity.\"\"\"\n        return True  # Default: allow all deletes\n    \n    async def _check_bulk_create_permission(self, user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can perform bulk create.\"\"\"\n        return True  # Default: allow bulk creates\n    \n    async def _check_bulk_delete_permission(self, user_id: Optional[str]) -> bool:\n        \"\"\"Check if user can perform bulk delete.\"\"\"\n        return True  # Default: allow bulk deletes\n    \n    async def _apply_user_filters(self, filters: FilterParams, user_id: str) -> FilterParams:\n        \"\"\"Apply user-specific filters.\"\"\"\n        return filters  # Default: no additional filters\n    \n    # Utility methods\n    \n    def create_response(\n        self,\n        data: Any = None,\n        message: str = \"Success\",\n        meta: Optional[Dict[str, Any]] = None,\n    ) -> Dict[str, Any]:\n        \"\"\"Create standardized response.\"\"\"\n        return create_success_response(data=data, message=message, meta=meta)
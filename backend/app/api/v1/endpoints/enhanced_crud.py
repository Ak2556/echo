"""Enhanced CRUD API endpoints with advanced features.

This file provides a single, clean implementation of an enhanced CRUD router used
across the application. The router delegates data operations to a provided
`BaseService` implementation and exposes create/read/update/delete, bulk
operations, import/export and utility endpoints.
"""

from typing import Any, Dict, List, Optional, Type, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
import json

from app.core.database import get_db
from app.core.service import BaseService
from app.core.repository import (
    FilterParams,
    PaginationParams,
    SortParams,
    FilterOperator,
    SortOrder,
)
from app.core.exceptions import (
    create_success_response,
    ValidationException,
    NotFoundException,
)
from app.core.logging import get_logger
from app.auth.dependencies import get_current_user, get_current_active_user

logger = get_logger(__name__)


class FilterParam(BaseModel):
    field: str = Field(..., description="Field to filter on")
    operator: str = Field(FilterOperator.EQ, description="Filter operator")
    value: Any = Field(..., description="Filter value")


class SortParam(BaseModel):
    field: str = Field(..., description="Field to sort by")
    order: str = Field(SortOrder.DESC, description="Sort order (asc/desc)")


class BulkCreateRequest(BaseModel):
    items: List[Dict[str, Any]] = Field(..., description="Items to create")
    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size for processing")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkUpdateRequest(BaseModel):
    updates: List[Dict[str, Any]] = Field(..., description="Updates to apply")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkDeleteRequest(BaseModel):
    ids: List[Union[int, str]] = Field(..., description="IDs to delete")
    soft_delete: bool = Field(True, description="Use soft delete")


class SearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    fields: List[str] = Field([], description="Fields to search in")
    filters: List[FilterParam] = Field([], description="Additional filters")
    sort: List[SortParam] = Field([], description="Sort parameters")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")


class ExportRequest(BaseModel):
    format: str = Field("csv", description="Export format (csv, json)")
    filters: List[FilterParam] = Field([], description="Filters to apply")
    fields: Optional[List[str]] = Field(None, description="Fields to include")
    sort: List[SortParam] = Field([], description="Sort parameters")


class ImportRequest(BaseModel):
    format: str = Field("csv", description="Import format (csv, json)")
    data: str = Field(..., description="Data to import")
    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size")
    skip_validation: bool = Field(False, description="Skip validation")
    update_existing: bool = Field(False, description="Update existing records")


class EnhancedCRUDRouter:
    """Enhanced CRUD router with advanced features.

    Instantiate with a `service_class` that implements the required async
    operations (get_multi, get_by_id, create, update, delete, bulk_create,
    bulk_delete, count, exists). The router exposes endpoints under the given
    `prefix` and `tags`.
    """

    def __init__(
        self,
        service_class: Type[BaseService],
        prefix: str,
        tags: List[str],
        create_schema: Type[BaseModel],
        update_schema: Type[BaseModel],
        response_schema: Type[BaseModel],
        dependencies: Optional[List] = None,
    ):
        self.service_class = service_class
        self.create_schema = create_schema
        self.update_schema = update_schema
        self.response_schema = response_schema

        self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])
        self._setup_routes()

    def _setup_routes(self) -> None:
        # Basic CRUD
        self.router.add_api_route("/", self._list_items, methods=["GET"], response_model=Dict[str, Any])
        self.router.add_api_route("/", self._create_item, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/{item_id}", self._get_item, methods=["GET"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._update_item, methods=["PUT"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._patch_item, methods=["PATCH"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._delete_item, methods=["DELETE"], response_model=Dict[str, Any])

        # Advanced
        self.router.add_api_route("/search", self._search_items, methods=["POST"], response_model=Dict[str, Any])
        self.router.add_api_route("/bulk", self._bulk_create, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/bulk", self._bulk_update, methods=["PUT"], response_model=Dict[str, Any])
        self.router.add_api_route("/bulk", self._bulk_delete, methods=["DELETE"], response_model=Dict[str, Any])

        # Data
        self.router.add_api_route("/export", self._export_data, methods=["POST"], response_class=StreamingResponse)
        self.router.add_api_route("/import", self._import_data, methods=["POST"], response_model=Dict[str, Any])

        # Utilities
        self.router.add_api_route("/count", self._count_items, methods=["GET"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}/exists", self._check_exists, methods=["GET"], response_model=Dict[str, Any])

    def _get_service(self, db: AsyncSession) -> BaseService:
        return self.service_class(db)

    def _parse_filters(self, filters: List[FilterParam]) -> FilterParams:
        fd: Dict[str, Any] = {}
        for f in filters:
            fd[f.field] = {"operator": f.operator, "value": f.value}
        return FilterParams(filters=fd)

    def _parse_sort(self, sort_params: List[SortParam]) -> SortParams:
        if not sort_params:
            return SortParams()
        primary = sort_params[0]
        secondary = {p.field: p.order for p in sort_params[1:]} if len(sort_params) > 1 else {}
        return SortParams(sort_by=primary.field, sort_order=primary.order, secondary_sort=secondary)

    async def _list_items(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), search: Optional[str] = Query(None), search_fields: Optional[str] = Query(None), sort_by: Optional[str] = Query(None), sort_order: str = Query(SortOrder.DESC), include_deleted: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=page, size=size)
            filters = FilterParams(search=search, search_fields=search_fields.split(",") if search_fields else [])
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)
            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
            return create_success_response(data={"items": [item.dict() if hasattr(item, "dict") else item for item in result.items], "pagination": {"page": result.page, "size": result.size, "total": result.total, "total_pages": result.total_pages, "has_next": result.has_next, "has_prev": result.has_prev}}, message="Items retrieved successfully")
        except Exception as e:
            logger.error("Failed to list items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_item(self, item_id: Union[int, str], include_relationships: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
        try:
            service = self._get_service(db)
            rel = getattr(service, "default_relationships", []) if include_relationships else None
            item = await service.get_by_id(id=item_id, user_id=getattr(current_user, "id", None), relationships=rel)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item retrieved successfully")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _create_item(self, item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            create_data = self.create_schema(**item_data)
            item = await service.create(obj_in=create_data, user_id=getattr(current_user, "id", None))
            background_tasks.add_task(self._post_create_processing, item_id=getattr(item, "id", None), user_id=getattr(current_user, "id", None))
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item created successfully")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to create item", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _update_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            update_data = self.update_schema(**item_data)
            item = await service.update(id=item_id, obj_in=update_data, user_id=getattr(current_user, "id", None))
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            background_tasks.add_task(self._post_update_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item updated successfully")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to update item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _patch_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        return await self._update_item(item_id, item_data, background_tasks, db, current_user)

    async def _delete_item(self, item_id: Union[int, str], background_tasks: BackgroundTasks, soft_delete: bool = Query(True, description="Use soft delete"), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            success = await service.delete(id=item_id, user_id=getattr(current_user, "id", None), soft_delete=soft_delete)
            if not success:
                raise HTTPException(status_code=404, detail="Item not found")
            background_tasks.add_task(self._post_delete_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
            return create_success_response(message="Item deleted successfully")
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to delete item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _search_items(self, search_request: SearchRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=search_request.page, size=search_request.size)
            filters = self._parse_filters(search_request.filters)
            filters.search = search_request.query
            filters.search_fields = search_request.fields
            sort_params = self._parse_sort(search_request.sort)
            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
            return create_success_response(data={"items": [item.dict() if hasattr(item, "dict") else item for item in result.items], "pagination": {"page": result.page, "size": result.size, "total": result.total, "total_pages": result.total_pages, "has_next": result.has_next, "has_prev": result.has_prev}, "search": {"query": search_request.query, "fields": search_request.fields}}, message="Search completed successfully")
        except Exception as e:
            logger.error("Failed to search items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_create(self, bulk_request: BulkCreateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            create_objects = [self.create_schema(**it) for it in bulk_request.items]
            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=bulk_request.batch_size, skip_validation=bulk_request.skip_validation)
            background_tasks.add_task(self._post_bulk_create_processing, count=len(items), user_id=getattr(current_user, "id", None))
            return create_success_response(data={"created_count": len(items), "items": [item.dict() if hasattr(item, "dict") else item for item in items[:10]]}, message=f"Successfully created {len(items)} items")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to bulk create items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_update(self, bulk_request: BulkUpdateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            updated_count = 0
            for u in bulk_request.updates:
                item_id = u.pop("id", None)
                if item_id:
                    update_schema = self.update_schema(**u)
                    res = await service.update(id=item_id, obj_in=update_schema, user_id=getattr(current_user, "id", None), skip_validation=bulk_request.skip_validation)
                    if res:
                        updated_count += 1
            return create_success_response(data={"updated_count": updated_count}, message=f"Successfully updated {updated_count} items")
        except Exception as e:
            logger.error("Failed to bulk update items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_delete(self, bulk_request: BulkDeleteRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            deleted_count = await service.bulk_delete(ids=bulk_request.ids, user_id=getattr(current_user, "id", None), soft_delete=bulk_request.soft_delete)
            return create_success_response(data={"deleted_count": deleted_count}, message=f"Successfully deleted {deleted_count} items")
        except Exception as e:
            logger.error("Failed to bulk delete items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _export_data(self, export_request: ExportRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
        try:
            service = self._get_service(db)
            filters = self._parse_filters(export_request.filters)
            sort_params = self._parse_sort(export_request.sort)
            pagination = PaginationParams(page=1, size=10000)
            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
            if export_request.format.lower() == "csv":
                return await self._generate_csv_export(result.items, export_request.fields)
            if export_request.format.lower() == "json":
                return await self._generate_json_export(result.items, export_request.fields)
            raise HTTPException(status_code=400, detail="Unsupported export format")
        except Exception as e:
            logger.error("Failed to export data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _import_data(self, import_request: ImportRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            if import_request.format.lower() == "csv":
                items_data = await self._parse_csv_import(import_request.data)
            elif import_request.format.lower() == "json":
                items_data = await self._parse_json_import(import_request.data)
            else:
                raise HTTPException(status_code=400, detail="Unsupported import format")
            create_objects = [self.create_schema(**it) for it in items_data]
            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=import_request.batch_size, skip_validation=import_request.skip_validation)
            return create_success_response(data={"imported_count": len(items), "total_processed": len(items_data)}, message=f"Successfully imported {len(items)} items")
        except Exception as e:
            logger.error("Failed to import data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _count_items(self, search: Optional[str] = Query(None), include_deleted: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
        try:
            service = self._get_service(db)
            filters = FilterParams(search=search)
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
            count = await service.count(filters=filters, user_id=getattr(current_user, "id", None))
            return create_success_response(data={"count": count}, message="Count retrieved successfully")
        except Exception as e:
            logger.error("Failed to count items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _check_exists(self, item_id: Union[int, str], db: AsyncSession = Depends(get_db)):
        try:
            service = self._get_service(db)
            exists = await service.exists(item_id)
            return create_success_response(data={"exists": exists}, message="Existence check completed")
        except Exception as e:
            logger.error("Failed to check existence", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _generate_csv_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        output = io.StringIO()
        if not items:
            output.write("No data to export\n")
        else:
            if fields:
                fieldnames = fields
            else:
                first = items[0]
                fieldnames = list(first.dict().keys()) if hasattr(first, "dict") else list(vars(first).keys())
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for item in items:
                row = item.dict() if hasattr(item, "dict") else (vars(item) if hasattr(item, "__dict__") else dict(item))
                if fields:
                    row = {k: v for k, v in row.items() if k in fields}
                writer.writerow(row)
        output.seek(0)
        return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})

    async def _generate_json_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        export_data = []
        for item in items:
            data = item.dict() if hasattr(item, "dict") else (vars(item) if hasattr(item, "__dict__") else dict(item))
            if fields:
                data = {k: v for k, v in data.items() if k in fields}
            export_data.append(data)
        json_data = json.dumps(export_data, default=str, indent=2)
        return StreamingResponse(io.BytesIO(json_data.encode()), media_type="application/json", headers={"Content-Disposition": "attachment; filename=export.json"})

    async def _parse_csv_import(self, csv_data: str) -> List[Dict[str, Any]]:
        csv_file = io.StringIO(csv_data)
        reader = csv.DictReader(csv_file)
        return [dict(row) for row in reader]

    async def _parse_json_import(self, json_data: str) -> List[Dict[str, Any]]:
        data = json.loads(json_data)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return [data]
        raise ValueError("Invalid JSON format for import")

    async def _post_create_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-create processing", item_id=item_id, user_id=user_id)

    async def _post_update_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-update processing", item_id=item_id, user_id=user_id)

    async def _post_delete_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-delete processing", item_id=item_id, user_id=user_id)

    async def _post_bulk_create_processing(self, count: int, user_id: Optional[str]):
        logger.info("Post-bulk-create processing", count=count, user_id=user_id)

Enhanced CRUD API endpoints with advanced features.
Provides a base router class with comprehensive CRUD operations.
"""
from typing import Any, Dict, List, Optional, Type, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
import json

from app.core.database import get_db
from app.core.service import BaseService
from app.core.repository import (
    FilterParams,
    PaginationParams,
    SortParams,
    FilterOperator,
    SortOrder,
)
from app.core.exceptions import (
    create_success_response,
    create_error_response,
    ValidationException,
    NotFoundException,
)
from app.core.logging import get_logger
from app.auth.dependencies import get_current_user, get_current_active_user

logger = get_logger(__name__)


class FilterParam(BaseModel):
    field: str = Field(..., description="Field to filter on")
    operator: str = Field(FilterOperator.EQ, description="Filter operator")
    value: Any = Field(..., description="Filter value")


class SortParam(BaseModel):
    field: str = Field(..., description="Field to sort by")
    order: str = Field(SortOrder.DESC, description="Sort order (asc/desc)")


class BulkCreateRequest(BaseModel):
    items: List[Dict[str, Any]] = Field(..., description="Items to create")
    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size for processing")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkUpdateRequest(BaseModel):
    updates: List[Dict[str, Any]] = Field(..., description="Updates to apply")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkDeleteRequest(BaseModel):
    ids: List[Union[int, str]] = Field(..., description="IDs to delete")
    soft_delete: bool = Field(True, description="Use soft delete")


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    fields: List[str] = Field([], description="Fields to search in")
    filters: List[FilterParam] = Field([], description="Additional filters")
    sort: List[SortParam] = Field([], description="Sort parameters")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")


class ExportRequest(BaseModel):
    format: str = Field("csv", description="Export format (csv, json, xlsx)")
    filters: List[FilterParam] = Field([], description="Filters to apply")
    fields: Optional[List[str]] = Field(None, description="Fields to include")
    sort: List[SortParam] = Field([], description="Sort parameters")


class ImportRequest(BaseModel):
    format: str = Field("csv", description="Import format (csv, json)")
    data: str = Field(..., description="Data to import")
    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size")
    skip_validation: bool = Field(False, description="Skip validation")
    update_existing: bool = Field(False, description="Update existing records")


class EnhancedCRUDRouter:
    """Enhanced CRUD router with advanced features."""

    def __init__(
        self,
        service_class: Type[BaseService],
        prefix: str,
        tags: List[str],
        create_schema: Type[BaseModel],
        update_schema: Type[BaseModel],
        response_schema: Type[BaseModel],
        dependencies: Optional[List] = None,
    ):
        self.service_class = service_class
        self.create_schema = create_schema
        self.update_schema = update_schema
        self.response_schema = response_schema

        self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])
        self._setup_routes()

    def _setup_routes(self):
        # Basic CRUD
        self.router.add_api_route("/", self._list_items, methods=["GET"], response_model=Dict[str, Any])
        self.router.add_api_route("/", self._create_item, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/{item_id}", self._get_item, methods=["GET"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._update_item, methods=["PUT"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._patch_item, methods=["PATCH"], response_model=Dict[str, Any])
        self.router.add_api_route("/{item_id}", self._delete_item, methods=["DELETE"], response_model=Dict[str, Any])

        # Advanced
        self.router.add_api_route("/search", self._search_items, methods=["POST"], response_model=Dict[str, Any])
        self.router.add_api_route("/bulk", self._bulk_create, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/bulk", self._bulk_update, methods=["PUT"], response_model=Dict[str, Any])
        self.router.add_api_route("/bulk", self._bulk_delete, methods=["DELETE"], response_model=Dict[str, Any])

        # Data ops
        self.router.add_api_route("/export", self._export_data, methods=["POST"], response_class=StreamingResponse)
        self.router.add_api_route("/import", self._import_data, methods=["POST"], response_model=Dict[str, Any])

        # Utilities
        self.router.add_api_route("/count", self._count_items, methods=["GET"], response_model=Dict[str, Any])
        from typing import Any, Dict, List, Optional, Type, Union
        from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
        from fastapi.responses import StreamingResponse
        from pydantic import BaseModel, Field
        from sqlalchemy.ext.asyncio import AsyncSession
        import csv
        import io
        import json

        from app.core.database import get_db
        from app.core.service import BaseService
        from app.core.repository import (
            FilterParams,
            PaginationParams,
            SortParams,
            FilterOperator,
            SortOrder,
        )
        from app.core.exceptions import (
            create_success_response,
            create_error_response,
            ValidationException,
            NotFoundException,
        )
        from app.core.logging import get_logger
        from app.auth.dependencies import get_current_user, get_current_active_user

        logger = get_logger(__name__)


        class FilterParam(BaseModel):
            field: str = Field(..., description="Field to filter on")
            operator: str = Field(FilterOperator.EQ, description="Filter operator")
            value: Any = Field(..., description="Filter value")


        class SortParam(BaseModel):
            field: str = Field(..., description="Field to sort by")
            order: str = Field(SortOrder.DESC, description="Sort order (asc/desc)")


        class BulkCreateRequest(BaseModel):
            items: List[Dict[str, Any]] = Field(..., description="Items to create")
            batch_size: int = Field(1000, ge=1, le=5000, description="Batch size for processing")
            skip_validation: bool = Field(False, description="Skip validation for faster processing")


        class BulkUpdateRequest(BaseModel):
            updates: List[Dict[str, Any]] = Field(..., description="Updates to apply")
            skip_validation: bool = Field(False, description="Skip validation for faster processing")


        class BulkDeleteRequest(BaseModel):
            ids: List[Union[int, str]] = Field(..., description="IDs to delete")
            soft_delete: bool = Field(True, description="Use soft delete")


        class SearchRequest(BaseModel):
            query: Optional[str] = Field(None, min_length=1, description="Search query")
            fields: List[str] = Field([], description="Fields to search in")
            filters: List[FilterParam] = Field([], description="Additional filters")
            sort: List[SortParam] = Field([], description="Sort parameters")
            page: int = Field(1, ge=1, description="Page number")
            size: int = Field(20, ge=1, le=100, description="Page size")


        class ExportRequest(BaseModel):
            format: str = Field("csv", description="Export format (csv, json)")
            filters: List[FilterParam] = Field([], description="Filters to apply")
            fields: Optional[List[str]] = Field(None, description="Fields to include")
            sort: List[SortParam] = Field([], description="Sort parameters")


        class ImportRequest(BaseModel):
            format: str = Field("csv", description="Import format (csv, json)")
            data: str = Field(..., description="Data to import")
            batch_size: int = Field(1000, ge=1, le=5000, description="Batch size")
            skip_validation: bool = Field(False, description="Skip validation")
            update_existing: bool = Field(False, description="Update existing records")


        class EnhancedCRUDRouter:
            """Enhanced CRUD router with advanced features."""

            def __init__(
                self,
                service_class: Type[BaseService],
                prefix: str,
                tags: List[str],
                create_schema: Type[BaseModel],
                update_schema: Type[BaseModel],
                response_schema: Type[BaseModel],
                dependencies: Optional[List] = None,
            ):
                self.service_class = service_class
                self.create_schema = create_schema
                self.update_schema = update_schema
                self.response_schema = response_schema

                self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])
                self._setup_routes()

            def _setup_routes(self):
                # Basic CRUD operations
                self.router.add_api_route("/", self._list_items, methods=["GET"], response_model=Dict[str, Any])
                self.router.add_api_route(
                    "/",
                    self._create_item,
                    methods=["POST"],
                    response_model=Dict[str, Any],
                    status_code=status.HTTP_201_CREATED,
                )
                self.router.add_api_route("/{item_id}", self._get_item, methods=["GET"], response_model=Dict[str, Any])
                self.router.add_api_route("/{item_id}", self._update_item, methods=["PUT"], response_model=Dict[str, Any])
                self.router.add_api_route("/{item_id}", self._patch_item, methods=["PATCH"], response_model=Dict[str, Any])
                self.router.add_api_route("/{item_id}", self._delete_item, methods=["DELETE"], response_model=Dict[str, Any])

                # Advanced operations
                self.router.add_api_route("/search", self._search_items, methods=["POST"], response_model=Dict[str, Any])
                self.router.add_api_route(
                    "/bulk",
                    self._bulk_create,
                    methods=["POST"],
                    response_model=Dict[str, Any],
                    status_code=status.HTTP_201_CREATED,
                )
                self.router.add_api_route("/bulk", self._bulk_update, methods=["PUT"], response_model=Dict[str, Any])
                self.router.add_api_route("/bulk", self._bulk_delete, methods=["DELETE"], response_model=Dict[str, Any])

                # Data operations
                self.router.add_api_route("/export", self._export_data, methods=["POST"], response_class=StreamingResponse)
                self.router.add_api_route("/import", self._import_data, methods=["POST"], response_model=Dict[str, Any])

                # Utility operations
                self.router.add_api_route("/count", self._count_items, methods=["GET"], response_model=Dict[str, Any])
                self.router.add_api_route("/{item_id}/exists", self._check_exists, methods=["GET"], response_model=Dict[str, Any])

            def _get_service(self, db: AsyncSession) -> BaseService:
                return self.service_class(db)

            def _parse_filters(self, filters: List[FilterParam]) -> FilterParams:
                filter_dict: Dict[str, Any] = {}
                for f in filters:
                    filter_dict[f.field] = {"operator": f.operator, "value": f.value}
                return FilterParams(filters=filter_dict)

            def _parse_sort(self, sort_params: List[SortParam]) -> SortParams:
                if not sort_params:
                    return SortParams()
                primary = sort_params[0]
                secondary = {p.field: p.order for p in sort_params[1:]}
                return SortParams(sort_by=primary.field, sort_order=primary.order, secondary_sort=secondary)

            async def _list_items(
                self,
                page: int = Query(1, ge=1, description="Page number"),
                size: int = Query(20, ge=1, le=100, description="Page size"),
                search: Optional[str] = Query(None, description="Search query"),
                search_fields: Optional[str] = Query(None, description="Comma-separated search fields"),
                sort_by: Optional[str] = Query(None, description="Sort field"),
                sort_order: str = Query(SortOrder.DESC, description="Sort order"),
                include_deleted: bool = Query(False, description="Include soft-deleted items"),
                db: AsyncSession = Depends(get_db),
                current_user = Depends(get_current_user),
            ):
                try:
                    service = self._get_service(db)
                    pagination = PaginationParams(page=page, size=size)
                    filters = FilterParams(search=search, search_fields=search_fields.split(",") if search_fields else [])
                    if not include_deleted:
                        if not filters.filters:
                            filters.filters = {}
                        filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
                    sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)
                    result = await service.get_multi(
                        pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None)
                    )
                    return create_success_response(
                        data={
                            "items": [item.dict() if hasattr(item, "dict") else item for item in result.items],
                            "pagination": {
                                "page": result.page,
                                "size": result.size,
                                "total": result.total,
                                "total_pages": result.total_pages,
                                "has_next": result.has_next,
                                "has_prev": result.has_prev,
                            },
                        },
                        message="Items retrieved successfully",
                    )
                except Exception as e:
                    logger.error("Failed to list items", error=str(e))
                    raise HTTPException(status_code=500, detail=str(e))

            async def _get_item(
                self,
                item_id: Union[int, str],
                include_relationships: bool = Query(False, description="Include related data"),
                db: AsyncSession = Depends(get_db),
                current_user = Depends(get_current_user),
            ):
                try:
                    service = self._get_service(db)
                    relationships = getattr(service, "default_relationships", []) if include_relationships else None
                    item = await service.get_by_id(id=item_id, user_id=getattr(current_user, "id", None), relationships=relationships)
                    if not item:
                        raise HTTPException(status_code=404, detail="Item not found")
                    return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item retrieved successfully")
                except HTTPException:
                    raise
                except Exception as e:
                    logger.error("Failed to get item", item_id=item_id, error=str(e))
                    raise HTTPException(status_code=500, detail=str(e))

            async def _create_item(
                self,
                item_data: dict,
                background_tasks: BackgroundTasks,
                db: AsyncSession = Depends(get_db),
                current_user = Depends(get_current_active_user),
            ):
                try:
                    service = self._get_service(db)
                    create_data = self.create_schema(**item_data)
                    item = await service.create(obj_in=create_data, user_id=getattr(current_user, "id", None))
                    background_tasks.add_task(self._post_create_processing, item_id=getattr(item, "id", None), user_id=getattr(current_user, "id", None))
                    return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item created successfully")
                except ValidationException as e:
                    raise HTTPException(status_code=422, detail=str(e))
                except Exception as e:
                    logger.error("Failed to create item", error=str(e))
                    raise HTTPException(status_code=500, detail=str(e))

            async def _update_item(
                self,
                item_id: Union[int, str],
                item_data: dict,
                background_tasks: BackgroundTasks,
                db: AsyncSession = Depends(get_db),
                current_user = Depends(get_current_active_user),
            ):
                try:
                    service = self._get_service(db)
                    update_data = self.update_schema(**item_data)
                    item = await service.update(id=item_id, obj_in=update_data, user_id=getattr(current_user, "id", None))
                    if not item:
                        raise HTTPException(status_code=404, detail="Item not found")
                    background_tasks.add_task(self._post_update_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
                    return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item updated successfully")
                except ValidationException as e:
                    raise HTTPException(status_code=422, detail=str(e))
                except NotFoundException as e:
                    raise HTTPException(status_code=404, detail=str(e))
                except Exception as e:
                    logger.error("Failed to update item", item_id=item_id, error=str(e))
                    raise HTTPException(status_code=500, detail=str(e))

            async def _patch_item(
                self,
                item_id: Union[int, str],
                item_data: dict,
                background_tasks: BackgroundTasks,
                db: AsyncSession = Depends(get_db),
                current_user = Depends(get_current_active_user),
            ):
                return await self._update_item(item_id, item_data, background_tasks, db, current_user)

            async def _delete_item(
                """Enhanced CRUD API endpoints with advanced features.
                Provides a base router class with comprehensive CRUD operations.
                """

                from typing import Any, Dict, List, Optional, Type, Union
                from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
                from fastapi.responses import StreamingResponse
                from pydantic import BaseModel, Field
                from sqlalchemy.ext.asyncio import AsyncSession
                import csv
                import io
                import json

                from app.core.database import get_db
                from app.core.service import BaseService
                from app.core.repository import (
                    FilterParams,
                    PaginationParams,
                    SortParams,
                    FilterOperator,
                    SortOrder,
                )
                from app.core.exceptions import (
                    create_success_response,
                    create_error_response,
                    ValidationException,
                    NotFoundException,
                )
                from app.core.logging import get_logger
                from app.auth.dependencies import get_current_user, get_current_active_user

                logger = get_logger(__name__)


                class FilterParam(BaseModel):
                    field: str = Field(..., description="Field to filter on")
                    operator: str = Field(FilterOperator.EQ, description="Filter operator")
                    value: Any = Field(..., description="Filter value")


                class SortParam(BaseModel):
                    field: str = Field(..., description="Field to sort by")
                    order: str = Field(SortOrder.DESC, description="Sort order (asc/desc)")


                class BulkCreateRequest(BaseModel):
                    items: List[Dict[str, Any]] = Field(..., description="Items to create")
                    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size for processing")
                    skip_validation: bool = Field(False, description="Skip validation for faster processing")


                class BulkUpdateRequest(BaseModel):
                    updates: List[Dict[str, Any]] = Field(..., description="Updates to apply")
                    skip_validation: bool = Field(False, description="Skip validation for faster processing")


                class BulkDeleteRequest(BaseModel):
                    ids: List[Union[int, str]] = Field(..., description="IDs to delete")
                    soft_delete: bool = Field(True, description="Use soft delete")


                class SearchRequest(BaseModel):
                    query: Optional[str] = Field(None, min_length=1, description="Search query")
                    fields: List[str] = Field([], description="Fields to search in")
                    filters: List[FilterParam] = Field([], description="Additional filters")
                    sort: List[SortParam] = Field([], description="Sort parameters")
                    page: int = Field(1, ge=1, description="Page number")
                    size: int = Field(20, ge=1, le=100, description="Page size")


                class ExportRequest(BaseModel):
                    format: str = Field("csv", description="Export format (csv, json)")
                    filters: List[FilterParam] = Field([], description="Filters to apply")
                    fields: Optional[List[str]] = Field(None, description="Fields to include")
                    sort: List[SortParam] = Field([], description="Sort parameters")


                class ImportRequest(BaseModel):
                    format: str = Field("csv", description="Import format (csv, json)")
                    data: str = Field(..., description="Data to import")
                    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size")
                    skip_validation: bool = Field(False, description="Skip validation")
                    update_existing: bool = Field(False, description="Update existing records")


                class EnhancedCRUDRouter:
                    """Enhanced CRUD router with advanced features."""

                    def __init__(
                        self,
                        service_class: Type[BaseService],
                        prefix: str,
                        tags: List[str],
                        create_schema: Type[BaseModel],
                        update_schema: Type[BaseModel],
                        response_schema: Type[BaseModel],
                        dependencies: Optional[List] = None,
                    ):
                        self.service_class = service_class
                        self.create_schema = create_schema
                        self.update_schema = update_schema
                        self.response_schema = response_schema

                        self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])
                        self._setup_routes()

                    def _setup_routes(self):
                        # Basic CRUD
                        self.router.add_api_route("/", self._list_items, methods=["GET"], response_model=Dict[str, Any])
                        self.router.add_api_route("/", self._create_item, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
                        self.router.add_api_route("/{item_id}", self._get_item, methods=["GET"], response_model=Dict[str, Any])
                        self.router.add_api_route("/{item_id}", self._update_item, methods=["PUT"], response_model=Dict[str, Any])
                        self.router.add_api_route("/{item_id}", self._patch_item, methods=["PATCH"], response_model=Dict[str, Any])
                        self.router.add_api_route("/{item_id}", self._delete_item, methods=["DELETE"], response_model=Dict[str, Any])

                        # Advanced
                        self.router.add_api_route("/search", self._search_items, methods=["POST"], response_model=Dict[str, Any])
                        self.router.add_api_route("/bulk", self._bulk_create, methods=["POST"], response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
                        self.router.add_api_route("/bulk", self._bulk_update, methods=["PUT"], response_model=Dict[str, Any])
                        self.router.add_api_route("/bulk", self._bulk_delete, methods=["DELETE"], response_model=Dict[str, Any])

                        # Data
                        self.router.add_api_route("/export", self._export_data, methods=["POST"], response_class=StreamingResponse)
                        self.router.add_api_route("/import", self._import_data, methods=["POST"], response_model=Dict[str, Any])

                        # Utilities
                        self.router.add_api_route("/count", self._count_items, methods=["GET"], response_model=Dict[str, Any])
                        self.router.add_api_route("/{item_id}/exists", self._check_exists, methods=["GET"], response_model=Dict[str, Any])

                    def _get_service(self, db: AsyncSession) -> BaseService:
                        return self.service_class(db)

                    def _parse_filters(self, filters: List[FilterParam]) -> FilterParams:
                        fd: Dict[str, Any] = {}
                        for f in filters:
                            fd[f.field] = {"operator": f.operator, "value": f.value}
                        return FilterParams(filters=fd)

                    def _parse_sort(self, sort_params: List[SortParam]) -> SortParams:
                        if not sort_params:
                            return SortParams()
                        primary = sort_params[0]
                        secondary = {p.field: p.order for p in sort_params[1:]} if len(sort_params) > 1 else {}
                        return SortParams(sort_by=primary.field, sort_order=primary.order, secondary_sort=secondary)

                    async def _list_items(self, page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100), search: Optional[str] = Query(None), search_fields: Optional[str] = Query(None), sort_by: Optional[str] = Query(None), sort_order: str = Query(SortOrder.DESC), include_deleted: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
                        try:
                            service = self._get_service(db)
                            pagination = PaginationParams(page=page, size=size)
                            filters = FilterParams(search=search, search_fields=search_fields.split(",") if search_fields else [])
                            if not include_deleted:
                                if not filters.filters:
                                    filters.filters = {}
                                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
                            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)
                            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
                            return create_success_response(data={"items": [item.dict() if hasattr(item, "dict") else item for item in result.items], "pagination": {"page": result.page, "size": result.size, "total": result.total, "total_pages": result.total_pages, "has_next": result.has_next, "has_prev": result.has_prev}}, message="Items retrieved successfully")
                        except Exception as e:
                            logger.error("Failed to list items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _get_item(self, item_id: Union[int, str], include_relationships: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
                        try:
                            service = self._get_service(db)
                            rel = getattr(service, "default_relationships", []) if include_relationships else None
                            item = await service.get_by_id(id=item_id, user_id=getattr(current_user, "id", None), relationships=rel)
                            if not item:
                                raise HTTPException(status_code=404, detail="Item not found")
                            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item retrieved successfully")
                        except HTTPException:
                            raise
                        except Exception as e:
                            logger.error("Failed to get item", item_id=item_id, error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _create_item(self, item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            create_data = self.create_schema(**item_data)
                            item = await service.create(obj_in=create_data, user_id=getattr(current_user, "id", None))
                            background_tasks.add_task(self._post_create_processing, item_id=getattr(item, "id", None), user_id=getattr(current_user, "id", None))
                            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item created successfully")
                        except ValidationException as e:
                            raise HTTPException(status_code=422, detail=str(e))
                        except Exception as e:
                            logger.error("Failed to create item", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _update_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            update_data = self.update_schema(**item_data)
                            item = await service.update(id=item_id, obj_in=update_data, user_id=getattr(current_user, "id", None))
                            if not item:
                                raise HTTPException(status_code=404, detail="Item not found")
                            background_tasks.add_task(self._post_update_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
                            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item updated successfully")
                        except ValidationException as e:
                            raise HTTPException(status_code=422, detail=str(e))
                        except NotFoundException as e:
                            raise HTTPException(status_code=404, detail=str(e))
                        except Exception as e:
                            logger.error("Failed to update item", item_id=item_id, error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _patch_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        return await self._update_item(item_id, item_data, background_tasks, db, current_user)

                    async def _delete_item(self, item_id: Union[int, str], background_tasks: BackgroundTasks, soft_delete: bool = Query(True, description="Use soft delete"), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            success = await service.delete(id=item_id, user_id=getattr(current_user, "id", None), soft_delete=soft_delete)
                            if not success:
                                raise HTTPException(status_code=404, detail="Item not found")
                            background_tasks.add_task(self._post_delete_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
                            return create_success_response(message="Item deleted successfully")
                        except NotFoundException as e:
                            raise HTTPException(status_code=404, detail=str(e))
                        except Exception as e:
                            logger.error("Failed to delete item", item_id=item_id, error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _search_items(self, search_request: SearchRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
                        try:
                            service = self._get_service(db)
                            pagination = PaginationParams(page=search_request.page, size=search_request.size)
                            filters = self._parse_filters(search_request.filters)
                            filters.search = search_request.query
                            filters.search_fields = search_request.fields
                            sort_params = self._parse_sort(search_request.sort)
                            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
                            return create_success_response(data={"items": [item.dict() if hasattr(item, "dict") else item for item in result.items], "pagination": {"page": result.page, "size": result.size, "total": result.total, "total_pages": result.total_pages, "has_next": result.has_next, "has_prev": result.has_prev}, "search": {"query": search_request.query, "fields": search_request.fields}}, message="Search completed successfully")
                        except Exception as e:
                            logger.error("Failed to search items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _bulk_create(self, bulk_request: BulkCreateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            create_objects = [self.create_schema(**it) for it in bulk_request.items]
                            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=bulk_request.batch_size, skip_validation=bulk_request.skip_validation)
                            background_tasks.add_task(self._post_bulk_create_processing, count=len(items), user_id=getattr(current_user, "id", None))
                            return create_success_response(data={"created_count": len(items), "items": [item.dict() if hasattr(item, "dict") else item for item in items[:10]]}, message=f"Successfully created {len(items)} items")
                        except ValidationException as e:
                            raise HTTPException(status_code=422, detail=str(e))
                        except Exception as e:
                            logger.error("Failed to bulk create items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _bulk_update(self, bulk_request: BulkUpdateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            updated_count = 0
                            for u in bulk_request.updates:
                                item_id = u.pop("id", None)
                                if item_id:
                                    update_schema = self.update_schema(**u)
                                    res = await service.update(id=item_id, obj_in=update_schema, user_id=getattr(current_user, "id", None), skip_validation=bulk_request.skip_validation)
                                    if res:
                                        updated_count += 1
                            return create_success_response(data={"updated_count": updated_count}, message=f"Successfully updated {updated_count} items")
                        except Exception as e:
                            logger.error("Failed to bulk update items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _bulk_delete(self, bulk_request: BulkDeleteRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            deleted_count = await service.bulk_delete(ids=bulk_request.ids, user_id=getattr(current_user, "id", None), soft_delete=bulk_request.soft_delete)
                            return create_success_response(data={"deleted_count": deleted_count}, message=f"Successfully deleted {deleted_count} items")
                        except Exception as e:
                            logger.error("Failed to bulk delete items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _export_data(self, export_request: ExportRequest, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
                        try:
                            service = self._get_service(db)
                            filters = self._parse_filters(export_request.filters)
                            sort_params = self._parse_sort(export_request.sort)
                            pagination = PaginationParams(page=1, size=10000)
                            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
                            if export_request.format.lower() == "csv":
                                return await self._generate_csv_export(result.items, export_request.fields)
                            if export_request.format.lower() == "json":
                                return await self._generate_json_export(result.items, export_request.fields)
                            raise HTTPException(status_code=400, detail="Unsupported export format")
                        except Exception as e:
                            logger.error("Failed to export data", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _import_data(self, import_request: ImportRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_active_user)):
                        try:
                            service = self._get_service(db)
                            if import_request.format.lower() == "csv":
                                items_data = await self._parse_csv_import(import_request.data)
                            elif import_request.format.lower() == "json":
                                items_data = await self._parse_json_import(import_request.data)
                            else:
                                raise HTTPException(status_code=400, detail="Unsupported import format")
                            create_objects = [self.create_schema(**it) for it in items_data]
                            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=import_request.batch_size, skip_validation=import_request.skip_validation)
                            return create_success_response(data={"imported_count": len(items), "total_processed": len(items_data)}, message=f"Successfully imported {len(items)} items")
                        except Exception as e:
                            logger.error("Failed to import data", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _count_items(self, search: Optional[str] = Query(None), include_deleted: bool = Query(False), db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
                        try:
                            service = self._get_service(db)
                            filters = FilterParams(search=search)
                            if not include_deleted:
                                if not filters.filters:
                                    filters.filters = {}
                                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
                            count = await service.count(filters=filters, user_id=getattr(current_user, "id", None))
                            return create_success_response(data={"count": count}, message="Count retrieved successfully")
                        except Exception as e:
                            logger.error("Failed to count items", error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _check_exists(self, item_id: Union[int, str], db: AsyncSession = Depends(get_db)):
                        try:
                            service = self._get_service(db)
                            exists = await service.exists(item_id)
                            return create_success_response(data={"exists": exists}, message="Existence check completed")
                        except Exception as e:
                            logger.error("Failed to check existence", item_id=item_id, error=str(e))
                            raise HTTPException(status_code=500, detail=str(e))

                    async def _generate_csv_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
                        output = io.StringIO()
                        if not items:
                            output.write("No data to export\n")
                        else:
                            if fields:
                                fieldnames = fields
                            else:
                                first = items[0]
                                fieldnames = list(first.dict().keys()) if hasattr(first, "dict") else list(first.__dict__.keys())
                            writer = csv.DictWriter(output, fieldnames=fieldnames)
                            writer.writeheader()
                            for item in items:
                                row = item.dict() if hasattr(item, "dict") else item.__dict__
                                if fields:
                                    row = {k: v for k, v in row.items() if k in fields}
                                writer.writerow(row)
                        output.seek(0)
                        return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})

                    async def _generate_json_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
                        export_data = []
                        for item in items:
                            data = item.dict() if hasattr(item, "dict") else item.__dict__
                            if fields:
                                data = {k: v for k, v in data.items() if k in fields}
                            export_data.append(data)
                        json_data = json.dumps(export_data, default=str, indent=2)
                        return StreamingResponse(io.BytesIO(json_data.encode()), media_type="application/json", headers={"Content-Disposition": "attachment; filename=export.json"})

                    async def _parse_csv_import(self, csv_data: str) -> List[Dict[str, Any]]:
                        csv_file = io.StringIO(csv_data)
                        reader = csv.DictReader(csv_file)
                        return [dict(row) for row in reader]

                    async def _parse_json_import(self, json_data: str) -> List[Dict[str, Any]]:
                        data = json.loads(json_data)
                        if isinstance(data, list):
                            return data
                        if isinstance(data, dict):
                            return [data]
                        raise ValueError("Invalid JSON format for import")

                    async def _post_create_processing(self, item_id: Any, user_id: Optional[str]):
                        logger.info("Post-create processing", item_id=item_id, user_id=user_id)

                    async def _post_update_processing(self, item_id: Any, user_id: Optional[str]):
                        logger.info("Post-update processing", item_id=item_id, user_id=user_id)

                    async def _post_delete_processing(self, item_id: Any, user_id: Optional[str]):
                        logger.info("Post-delete processing", item_id=item_id, user_id=user_id)

                    async def _post_bulk_create_processing(self, count: int, user_id: Optional[str]):
                        logger.info("Post-bulk-create processing", count=count, user_id=user_id)
        primary = sort_params[0]
        secondary = {p.field: p.order for p in sort_params[1:]} if len(sort_params) > 1 else {}
        return SortParams(sort_by=primary.field, sort_order=primary.order, secondary_sort=secondary)

    async def _list_items(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        size: int = Query(20, ge=1, le=100, description="Page size"),
        search: Optional[str] = Query(None, description="Search query"),
        search_fields: Optional[str] = Query(None, description="Comma-separated search fields"),
        sort_by: Optional[str] = Query(None, description="Sort field"),
        sort_order: str = Query(SortOrder.DESC, description="Sort order"),
        include_deleted: bool = Query(False, description="Include soft-deleted items"),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=page, size=size)
            filters = FilterParams(search=search, search_fields=search_fields.split(",") if search_fields else [])

            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}

            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)

            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))

            return create_success_response(
                data={
                    "items": [item.dict() if hasattr(item, "dict") else item for item in result.items],
                    "pagination": {
                        "page": result.page,
                        "size": result.size,
                        "total": result.total,
                        "total_pages": result.total_pages,
                        "has_next": result.has_next,
                        "has_prev": result.has_prev,
                    },
                },
                message="Items retrieved successfully",
            )

        except Exception as e:
            logger.error("Failed to list items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_item(self, item_id: Union[int, str], include_relationships: bool = Query(False), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
        try:
            service = self._get_service(db)
            relationships = getattr(service, "default_relationships", []) if include_relationships else None
            item = await service.get_by_id(id=item_id, user_id=getattr(current_user, "id", None), relationships=relationships)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item retrieved successfully")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _create_item(self, item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            create_data = self.create_schema(**item_data)
            item = await service.create(obj_in=create_data, user_id=getattr(current_user, "id", None))
            background_tasks.add_task(self._post_create_processing, item_id=getattr(item, "id", None), user_id=getattr(current_user, "id", None))
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item created successfully")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to create item", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _update_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            update_data = self.update_schema(**item_data)
            item = await service.update(id=item_id, obj_in=update_data, user_id=getattr(current_user, "id", None))
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            background_tasks.add_task(self._post_update_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
            return create_success_response(data=item.dict() if hasattr(item, "dict") else item, message="Item updated successfully")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to update item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _patch_item(self, item_id: Union[int, str], item_data: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        return await self._update_item(item_id, item_data, background_tasks, db, current_user)

    async def _delete_item(self, item_id: Union[int, str], background_tasks: BackgroundTasks, soft_delete: bool = Query(True, description="Use soft delete"), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            success = await service.delete(id=item_id, user_id=getattr(current_user, "id", None), soft_delete=soft_delete)
            if not success:
                raise HTTPException(status_code=404, detail="Item not found")
            background_tasks.add_task(self._post_delete_processing, item_id=item_id, user_id=getattr(current_user, "id", None))
            return create_success_response(message="Item deleted successfully")
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to delete item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _search_items(self, search_request: SearchRequest, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=search_request.page, size=search_request.size)
            filters = self._parse_filters(search_request.filters)
            filters.search = search_request.query
            filters.search_fields = search_request.fields
            sort_params = self._parse_sort(search_request.sort)
            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
            return create_success_response(
                data={
                    "items": [item.dict() if hasattr(item, "dict") else item for item in result.items],
                    "pagination": {
                        "page": result.page,
                        "size": result.size,
                        "total": result.total,
                        "total_pages": result.total_pages,
                        "has_next": result.has_next,
                        "has_prev": result.has_prev,
                    },
                    "search": {"query": search_request.query, "fields": search_request.fields},
                },
                message="Search completed successfully",
            )
        except Exception as e:
            logger.error("Failed to search items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_create(self, bulk_request: BulkCreateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            create_objects = [self.create_schema(**d) for d in bulk_request.items]
            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=bulk_request.batch_size, skip_validation=bulk_request.skip_validation)
            background_tasks.add_task(self._post_bulk_create_processing, count=len(items), user_id=getattr(current_user, "id", None))
            return create_success_response(data={"created_count": len(items), "items": [item.dict() if hasattr(item, "dict") else item for item in items[:10]]}, message=f"Successfully created {len(items)} items")
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to bulk create items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_update(self, bulk_request: BulkUpdateRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            updated_count = 0
            for upd in bulk_request.updates:
                item_id = upd.pop("id", None)
                if item_id:
                    update_schema = self.update_schema(**upd)
                    res = await service.update(id=item_id, obj_in=update_schema, user_id=getattr(current_user, "id", None), skip_validation=bulk_request.skip_validation)
                    if res:
                        updated_count += 1
            return create_success_response(data={"updated_count": updated_count}, message=f"Successfully updated {updated_count} items")
        except Exception as e:
            logger.error("Failed to bulk update items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _bulk_delete(self, bulk_request: BulkDeleteRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            deleted_count = await service.bulk_delete(ids=bulk_request.ids, user_id=getattr(current_user, "id", None), soft_delete=bulk_request.soft_delete)
            return create_success_response(data={"deleted_count": deleted_count}, message=f"Successfully deleted {deleted_count} items")
        except Exception as e:
            logger.error("Failed to bulk delete items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _export_data(self, export_request: ExportRequest, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
        try:
            service = self._get_service(db)
            filters = self._parse_filters(export_request.filters)
            sort_params = self._parse_sort(export_request.sort)
            pagination = PaginationParams(page=1, size=10000)
            result = await service.get_multi(pagination=pagination, filters=filters, sort_params=sort_params, user_id=getattr(current_user, "id", None))
            if export_request.format.lower() == "csv":
                return await self._generate_csv_export(result.items, export_request.fields)
            if export_request.format.lower() == "json":
                return await self._generate_json_export(result.items, export_request.fields)
            raise HTTPException(status_code=400, detail="Unsupported export format")
        except Exception as e:
            logger.error("Failed to export data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _import_data(self, import_request: ImportRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
        try:
            service = self._get_service(db)
            if import_request.format.lower() == "csv":
                items_data = await self._parse_csv_import(import_request.data)
            elif import_request.format.lower() == "json":
                items_data = await self._parse_json_import(import_request.data)
            else:
                raise HTTPException(status_code=400, detail="Unsupported import format")

            create_objects = [self.create_schema(**d) for d in items_data]
            items = await service.bulk_create(objects=create_objects, user_id=getattr(current_user, "id", None), batch_size=import_request.batch_size, skip_validation=import_request.skip_validation)
            return create_success_response(data={"imported_count": len(items), "total_processed": len(items_data)}, message=f"Successfully imported {len(items)} items")
        except Exception as e:
            logger.error("Failed to import data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _count_items(self, search: Optional[str] = Query(None), include_deleted: bool = Query(False), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
        try:
            service = self._get_service(db)
            filters = FilterParams(search=search)
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
            count = await service.count(filters=filters, user_id=getattr(current_user, "id", None))
            return create_success_response(data={"count": count}, message="Count retrieved successfully")
        except Exception as e:
            logger.error("Failed to count items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _check_exists(self, item_id: Union[int, str], db: AsyncSession = Depends(get_db)):
        try:
            service = self._get_service(db)
            exists = await service.exists(item_id)
            return create_success_response(data={"exists": exists}, message="Existence check completed")
        except Exception as e:
            logger.error("Failed to check existence", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _generate_csv_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        output = io.StringIO()
        if not items:
            output.write("No data to export\n")
        else:
            if fields:
                fieldnames = fields
            else:
                first = items[0]
                fieldnames = list(first.dict().keys()) if hasattr(first, "dict") else list(first.__dict__.keys())
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for item in items:
                row = item.dict() if hasattr(item, "dict") else item.__dict__
                if fields:
                    row = {k: v for k, v in row.items() if k in fields}
                writer.writerow(row)
        output.seek(0)
        return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})

    async def _generate_json_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        export_data = []
        for item in items:
            data = item.dict() if hasattr(item, "dict") else item.__dict__
            if fields:
                data = {k: v for k, v in data.items() if k in fields}
            export_data.append(data)
        json_data = json.dumps(export_data, default=str, indent=2)
        return StreamingResponse(io.BytesIO(json_data.encode()), media_type="application/json", headers={"Content-Disposition": "attachment; filename=export.json"})

    async def _parse_csv_import(self, csv_data: str) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        csv_file = io.StringIO(csv_data)
        reader = csv.DictReader(csv_file)
        for row in reader:
            items.append(dict(row))
        return items

    async def _parse_json_import(self, json_data: str) -> List[Dict[str, Any]]:
        data = json.loads(json_data)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return [data]
        raise ValueError("Invalid JSON format for import")

    async def _post_create_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-create processing", item_id=item_id, user_id=user_id)

    async def _post_update_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-update processing", item_id=item_id, user_id=user_id)

    async def _post_delete_processing(self, item_id: Any, user_id: Optional[str]):
        logger.info("Post-delete processing", item_id=item_id, user_id=user_id)

    async def _post_bulk_create_processing(self, count: int, user_id: Optional[str]):
        logger.info("Post-bulk-create processing", count=count, user_id=user_id)
    """
    Enhanced CRUD router with advanced features.
    """
    
    def __init__(
        self,
        service_class: Type[BaseService],
        prefix: str,
        tags: List[str],
        create_schema: Type[BaseModel],
        update_schema: Type[BaseModel],
        response_schema: Type[BaseModel],
        dependencies: Optional[List] = None,
    ):
        self.service_class = service_class
        self.create_schema = create_schema
        self.update_schema = update_schema
        self.response_schema = response_schema
        
        self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup all CRUD routes."""
        
        # Basic CRUD operations
        self.router.add_api_route(
            "/",
            self._list_items,
            methods=["GET"],
            response_model=Dict[str, Any],
            summary="List items with filtering and pagination",
        )
        
        self.router.add_api_route(
            "/",
            self._create_item,
            methods=["POST"],
            response_model=Dict[str, Any],
            status_code=status.HTTP_201_CREATED,
            summary="Create a new item",
        )
        
        self.router.add_api_route(
            "/{item_id}",
            self._get_item,
            methods=["GET"],
            response_model=Dict[str, Any],
            summary="Get item by ID",
        )
        
        self.router.add_api_route(
            "/{item_id}",
            self._update_item,
            methods=["PUT"],
            response_model=Dict[str, Any],
            summary="Update item",
        )
        
        self.router.add_api_route(
            "/{item_id}",
            self._patch_item,
            methods=["PATCH"],
            response_model=Dict[str, Any],
            summary="Partially update item",
        )
        
        self.router.add_api_route(
            "/{item_id}",
            self._delete_item,
            methods=["DELETE"],
            response_model=Dict[str, Any],
            summary="Delete item",
        )
        
        # Advanced operations
        self.router.add_api_route(
            "/search",
            self._search_items,
            methods=["POST"],
            response_model=Dict[str, Any],
            summary="Advanced search with filters",
        )
        
        self.router.add_api_route(
            "/bulk",
            self._bulk_create,
            methods=["POST"],
            response_model=Dict[str, Any],
            status_code=status.HTTP_201_CREATED,
            summary="Bulk create items",
        )
        
        self.router.add_api_route(
            "/bulk",
            self._bulk_update,
            methods=["PUT"],
            response_model=Dict[str, Any],
            summary="Bulk update items",
        )
        
        self.router.add_api_route(
            "/bulk",
            self._bulk_delete,
            methods=["DELETE"],
            response_model=Dict[str, Any],
            summary="Bulk delete items",
        )
        
        # Data operations
        self.router.add_api_route(
            "/export",
            self._export_data,
            methods=["POST"],
            response_class=StreamingResponse,
            summary="Export data",
        )
        
        self.router.add_api_route(
            "/import",
            self._import_data,
            methods=["POST"],
            response_model=Dict[str, Any],
            summary="Import data",
        )
        
        # Utility operations
        self.router.add_api_route(
            "/count",
            self._count_items,
            methods=["GET"],
            response_model=Dict[str, Any],
            summary="Count items with filters",
        )
        
        self.router.add_api_route(
            "/{item_id}/exists",
            self._check_exists,
            methods=["GET"],
            response_model=Dict[str, Any],
            summary="Check if item exists",
        )
    
    def _get_service(self, db: AsyncSession) -> BaseService:
        """Get service instance."""
        return self.service_class(db)
    
    def _parse_filters(self, filters: List[FilterParam]) -> FilterParams:
        """Parse filter parameters."""
        filter_dict = {}
        
        for filter_param in filters:
            filter_dict[filter_param.field] = {
                "operator": filter_param.operator,
                "value": filter_param.value,
            }
        
        return FilterParams(filters=filter_dict)
    
    def _parse_sort(self, sort_params: List[SortParam]) -> SortParams:
        """Parse sort parameters."""
        if not sort_params:
            return SortParams()
        
        primary_sort = sort_params[0]
        secondary_sort = {}
        
        for sort_param in sort_params[1:]:
            secondary_sort[sort_param.field] = sort_param.order
        
        return SortParams(
            sort_by=primary_sort.field,
            sort_order=primary_sort.order,
            secondary_sort=secondary_sort,
        )
    
    async def _list_items(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        size: int = Query(20, ge=1, le=100, description="Page size"),
        search: Optional[str] = Query(None, description="Search query"),
        search_fields: Optional[str] = Query(None, description="Comma-separated search fields"),
        sort_by: Optional[str] = Query(None, description="Sort field"),
        sort_order: str = Query(SortOrder.DESC, description="Sort order"),
        include_deleted: bool = Query(False, description="Include soft-deleted items"),
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        """List items with filtering and pagination."""
        try:
            service = self._get_service(db)
            
            # Setup pagination
            pagination = PaginationParams(page=page, size=size)
            
            # Setup filters
            filters = FilterParams(
                search=search,
                search_fields=search_fields.split(",") if search_fields else [],
            )
            
            # Add soft delete filter
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {
                    "operator": FilterOperator.IS_NULL,
                    "value": None,
                }
            
            # Setup sorting
            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)
            
            # Get results
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data={
                    "items": [item.dict() if hasattr(item, "dict") else item for item in result.items],
                    "pagination": {
                        "page": result.page,
                        "size": result.size,
                        "total": result.total,
                        "total_pages": result.total_pages,
                        "has_next": result.has_next,
                        "has_prev": result.has_prev,
                    },
                },
                message="Items retrieved successfully",
            )
            
        except Exception as e:
            logger.error("Failed to list items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _get_item(
        self,
        item_id: Union[int, str],
        include_relationships: bool = Query(False, description="Include related data"),
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        """Get item by ID."""
        try:
            service = self._get_service(db)
            
            relationships = None
            if include_relationships:
                # This would be configured per service
                relationships = getattr(service, "default_relationships", [])
            
            item = await service.get_by_id(
                id=item_id,
                user_id=getattr(current_user, "id", None),
                relationships=relationships,
            )
            
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            
            return create_success_response(
                data=item.dict() if hasattr(item, "dict") else item,
                message="Item retrieved successfully",
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _create_item(
        self,
        item_data: dict,  # Will be validated by the service
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Create a new item."""
        try:
            service = self._get_service(db)
            
            # Convert dict to schema
            create_data = self.create_schema(**item_data)
            
            item = await service.create(
                obj_in=create_data,
                user_id=getattr(current_user, "id", None),
            )
            
            # Background task for post-creation processing
            background_tasks.add_task(
                self._post_create_processing,
                item_id=getattr(item, "id", None),
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data=item.dict() if hasattr(item, "dict") else item,
                message="Item created successfully",
            )
            
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to create item", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _update_item(
        self,
        item_id: Union[int, str],
        item_data: dict,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Update item."""
        try:
            service = self._get_service(db)
            
            # Convert dict to schema
            update_data = self.update_schema(**item_data)
            
            item = await service.update(
                id=item_id,
                obj_in=update_data,
                user_id=getattr(current_user, "id", None),
            )
            
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            
            # Background task for post-update processing
            background_tasks.add_task(
                self._post_update_processing,
                item_id=item_id,
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data=item.dict() if hasattr(item, "dict") else item,
                message="Item updated successfully",
            )
            
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to update item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _patch_item(
        self,
        item_id: Union[int, str],
        item_data: dict,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Partially update item."""
        # Same as update but with partial data
        return await self._update_item(item_id, item_data, background_tasks, db, current_user)
    
    async def _delete_item(
        self,
        item_id: Union[int, str],
        soft_delete: bool = Query(True, description="Use soft delete"),
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Delete item."""
        try:
            service = self._get_service(db)
            
            success = await service.delete(
                id=item_id,
                user_id=getattr(current_user, "id", None),
                soft_delete=soft_delete,
            )
            
            if not success:
                raise HTTPException(status_code=404, detail="Item not found")
            
            # Background task for post-deletion processing
            background_tasks.add_task(
                self._post_delete_processing,
                item_id=item_id,
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                message="Item deleted successfully",
            )
            
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to delete item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _search_items(
        self,
        search_request: SearchRequest,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        """Advanced search with filters."""
        try:
            service = self._get_service(db)
            
            # Setup pagination
            pagination = PaginationParams(page=search_request.page, size=search_request.size)
            
            # Setup filters
            filters = self._parse_filters(search_request.filters)
            filters.search = search_request.query
            filters.search_fields = search_request.fields
            
            # Setup sorting
            sort_params = self._parse_sort(search_request.sort)
            
            # Get results
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data={
                    "items": [item.dict() if hasattr(item, "dict") else item for item in result.items],
                    "pagination": {
                        "page": result.page,
                        "size": result.size,
                        "total": result.total,
                        "total_pages": result.total_pages,
                        "has_next": result.has_next,
                        "has_prev": result.has_prev,
                    },
                    "search": {
                        "query": search_request.query,
                        "fields": search_request.fields,
                    },
                },
                message="Search completed successfully",
            )
            
        except Exception as e:
            logger.error("Failed to search items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _bulk_create(
        self,
        bulk_request: BulkCreateRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Bulk create items."""
        try:
            service = self._get_service(db)
            
            # Convert items to schemas
            create_objects = []
            for item_data in bulk_request.items:
                create_objects.append(self.create_schema(**item_data))
            
            items = await service.bulk_create(
                objects=create_objects,
                user_id=getattr(current_user, "id", None),
                batch_size=bulk_request.batch_size,
                skip_validation=bulk_request.skip_validation,
            )
            
            # Background task for post-creation processing
            background_tasks.add_task(
                self._post_bulk_create_processing,
                count=len(items),
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data={
                    "created_count": len(items),
                    "items": [item.dict() if hasattr(item, "dict") else item for item in items[:10]],  # Return first 10
                },
                message=f"Successfully created {len(items)} items",
            )
            
        except ValidationException as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.error("Failed to bulk create items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _bulk_update(
        self,
        bulk_request: BulkUpdateRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Bulk update items."""
        try:
            service = self._get_service(db)
            
            # This would need to be implemented in the service layer
            # For now, we'll do individual updates
            updated_count = 0
            
            for update_data in bulk_request.updates:
                item_id = update_data.pop("id", None)
                if item_id:
                    update_schema = self.update_schema(**update_data)
                    result = await service.update(
                        id=item_id,
                        obj_in=update_schema,
                        user_id=getattr(current_user, "id", None),
                        skip_validation=bulk_request.skip_validation,
                    )
                    if result:
                        updated_count += 1
            
            return create_success_response(
                data={"updated_count": updated_count},
                message=f"Successfully updated {updated_count} items",
            )
            
        except Exception as e:
            logger.error("Failed to bulk update items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _bulk_delete(
        self,
        bulk_request: BulkDeleteRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Bulk delete items."""
        try:
            service = self._get_service(db)
            
            deleted_count = await service.bulk_delete(
                ids=bulk_request.ids,
                user_id=getattr(current_user, "id", None),
                soft_delete=bulk_request.soft_delete,
            )
            
            return create_success_response(
                data={"deleted_count": deleted_count},
                message=f"Successfully deleted {deleted_count} items",
            )
            
        except Exception as e:
            logger.error("Failed to bulk delete items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _export_data(
        self,
        export_request: ExportRequest,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        """Export data."""
        try:
            service = self._get_service(db)
            
            # Setup filters and sorting
            filters = self._parse_filters(export_request.filters)
            sort_params = self._parse_sort(export_request.sort)
            
            # Get all data (with reasonable limit)
            pagination = PaginationParams(page=1, size=10000)  # Max 10k records
            
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            
            # Generate export data
            if export_request.format.lower() == "csv":
                return await self._generate_csv_export(result.items, export_request.fields)
            elif export_request.format.lower() == "json":
                return await self._generate_json_export(result.items, export_request.fields)
            else:
                raise HTTPException(status_code=400, detail="Unsupported export format")
            
        except Exception as e:
            logger.error("Failed to export data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _import_data(
        self,
        import_request: ImportRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_active_user),
    ):
        """Import data."""
        try:
            service = self._get_service(db)
            
            # Parse import data
            if import_request.format.lower() == "csv":
                items_data = await self._parse_csv_import(import_request.data)
            elif import_request.format.lower() == "json":
                items_data = await self._parse_json_import(import_request.data)
            else:
                raise HTTPException(status_code=400, detail="Unsupported import format")
            
            # Convert to schemas
            create_objects = []
            for item_data in items_data:
                create_objects.append(self.create_schema(**item_data))
            
            # Import data
            items = await service.bulk_create(
                objects=create_objects,
                user_id=getattr(current_user, "id", None),
                batch_size=import_request.batch_size,
                skip_validation=import_request.skip_validation,
            )
            
            return create_success_response(
                data={
                    "imported_count": len(items),
                    "total_processed": len(items_data),
                },
                message=f"Successfully imported {len(items)} items",
            )
            
        except Exception as e:
            logger.error("Failed to import data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _count_items(
        self,
        search: Optional[str] = Query(None, description="Search query"),
        include_deleted: bool = Query(False, description="Include soft-deleted items"),
        db: AsyncSession = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        """Count items with filters."""
        try:
            service = self._get_service(db)
            
            filters = FilterParams(search=search)
            
            # Add soft delete filter
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {
                    "operator": FilterOperator.IS_NULL,
                    "value": None,
                }
            
            count = await service.count(
                filters=filters,
                user_id=getattr(current_user, "id", None),
            )
            
            return create_success_response(
                data={"count": count},
                message="Count retrieved successfully",
            )
            
        except Exception as e:
            logger.error("Failed to count items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _check_exists(
        self,
        item_id: Union[int, str],
        db: AsyncSession = Depends(get_db),
    ):
        """Check if item exists."""
        try:
            service = self._get_service(db)
            
            exists = await service.exists(item_id)
            
            return create_success_response(
                data={"exists": exists},
                message="Existence check completed",
            )
            
        except Exception as e:
            logger.error("Failed to check existence", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))
    
    # Helper methods for data processing
    
    async def _generate_csv_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        """Generate CSV export."""
        output = io.StringIO()
        
        if not items:
            output.write("No data to export\n")
        else:
            # Get field names
            if fields:
                fieldnames = fields
            else:
                first_item = items[0]
                if hasattr(first_item, "dict"):
                    fieldnames = list(first_item.dict().keys())
                else:
                    fieldnames = list(first_item.__dict__.keys())
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in items:
                if hasattr(item, "dict"):
                    row_data = item.dict()
                else:
                    row_data = item.__dict__
                
                # Filter fields if specified
                if fields:
                    row_data = {k: v for k, v in row_data.items() if k in fields}
                
                writer.writerow(row_data)
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=export.csv"},
        )
    
    async def _generate_json_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:
        """Generate JSON export."""
        export_data = []
        
        for item in items:
            if hasattr(item, "dict"):
                item_data = item.dict()
            else:
                item_data = item.__dict__
            
            # Filter fields if specified
            if fields:
                item_data = {k: v for k, v in item_data.items() if k in fields}
            
            export_data.append(item_data)
        
        json_data = json.dumps(export_data, default=str, indent=2)
        
        return StreamingResponse(
            io.BytesIO(json_data.encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=export.json"},
        )
    
    async def _parse_csv_import(self, csv_data: str) -> List[Dict[str, Any]]:
        """Parse CSV import data."""
        items = []
        csv_file = io.StringIO(csv_data)
        reader = csv.DictReader(csv_file)
        
        for row in reader:
            items.append(dict(row))
        
        return items
    
    async def _parse_json_import(self, json_data: str) -> List[Dict[str, Any]]:
        """Parse JSON import data."""
        data = json.loads(json_data)
        
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        else:
            raise ValueError("Invalid JSON format for import")
    
    # Background task methods
    
    async def _post_create_processing(self, item_id: Any, user_id: Optional[str]):
        """Post-creation processing."""
        logger.info("Post-create processing", item_id=item_id, user_id=user_id)
    
    async def _post_update_processing(self, item_id: Any, user_id: Optional[str]):
        """Post-update processing."""
        logger.info("Post-update processing", item_id=item_id, user_id=user_id)
    
    async def _post_delete_processing(self, item_id: Any, user_id: Optional[str]):
        """Post-deletion processing."""
        logger.info("Post-delete processing", item_id=item_id, user_id=user_id)
    
    async def _post_bulk_create_processing(self, count: int, user_id: Optional[str]):
        """Post-bulk-creation processing."""
        logger.info("Post-bulk-create processing", count=count, user_id=user_id)
from typing import Any, Dict, List, Optional, Type, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
import json

from app.core.database import get_db
from app.core.service import BaseService
from app.core.repository import (
    FilterParams, 
    PaginationParams, 
    SortParams, 
    FilterOperator,
    SortOrder
)
from app.core.exceptions import (
    create_success_response,
    create_error_response,
    ValidationException,
    NotFoundException,
)
from app.core.logging import get_logger
from app.auth.dependencies import get_current_user, get_current_active_user

logger = get_logger(__name__)


class FilterParam(BaseModel):
    """Filter parameter model."""
    field: str = Field(..., description="Field to filter on")
    operator: str = Field(FilterOperator.EQ, description="Filter operator")
    value: Any = Field(..., description="Filter value")


class SortParam(BaseModel):
    """Sort parameter model."""
    field: str = Field(..., description="Field to sort by")
    order: str = Field(SortOrder.DESC, description="Sort order (asc/desc)")


class BulkCreateRequest(BaseModel):
    """Bulk create request model."""
    items: List[Dict[str, Any]] = Field(..., description="Items to create")
    batch_size: int = Field(1000, ge=1, le=5000, description="Batch size for processing")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkUpdateRequest(BaseModel):
    """Bulk update request model."""
    updates: List[Dict[str, Any]] = Field(..., description="Updates to apply")
    skip_validation: bool = Field(False, description="Skip validation for faster processing")


class BulkDeleteRequest(BaseModel):
    """Bulk delete request model."""
    ids: List[Union[int, str]] = Field(..., description="IDs to delete")
    soft_delete: bool = Field(True, description="Use soft delete")


class SearchRequest(BaseModel):
    """Advanced search request model."""
    query: str = Field(..., min_length=1, description="Search query")
    fields: List[str] = Field([], description="Fields to search in")
    filters: List[FilterParam] = Field([], description="Additional filters")
    sort: List[SortParam] = Field([], description="Sort parameters")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")


class ExportRequest(BaseModel):
    """Data export request model."""
    format: str = Field(\"csv\", description=\"Export format (csv, json, xlsx)\")
    filters: List[FilterParam] = Field([], description=\"Filters to apply\")\n    fields: Optional[List[str]] = Field(None, description=\"Fields to include\")\n    sort: List[SortParam] = Field([], description=\"Sort parameters\")\n\n\nclass ImportRequest(BaseModel):\n    \"\"\"Data import request model.\"\"\"\n    format: str = Field(\"csv\", description=\"Import format (csv, json)\")\n    data: str = Field(..., description=\"Data to import\")\n    batch_size: int = Field(1000, ge=1, le=5000, description=\"Batch size\")\n    skip_validation: bool = Field(False, description=\"Skip validation\")\n    update_existing: bool = Field(False, description=\"Update existing records\")\n\n\nclass EnhancedCRUDRouter:\n    \"\"\"\n    Enhanced CRUD router with advanced features.\n    \"\"\"\n    \n    def __init__(\n        self,\n        service_class: Type[BaseService],\n        prefix: str,\n        tags: List[str],\n        create_schema: Type[BaseModel],\n        update_schema: Type[BaseModel],\n        response_schema: Type[BaseModel],\n        dependencies: Optional[List] = None,\n    ):\n        self.service_class = service_class\n        self.create_schema = create_schema\n        self.update_schema = update_schema\n        self.response_schema = response_schema\n        \n        self.router = APIRouter(prefix=prefix, tags=tags, dependencies=dependencies or [])\n        self._setup_routes()\n    \n    def _setup_routes(self):\n        \"\"\"Setup all CRUD routes.\"\"\"\n        \n        # Basic CRUD operations\n        self.router.add_api_route(\n            \"/\",\n            self._list_items,\n            methods=[\"GET\"],\n            response_model=Dict[str, Any],\n            summary=\"List items with filtering and pagination\",\n        )\n        \n        self.router.add_api_route(\n            \"/\",\n            self._create_item,\n            methods=[\"POST\"],\n            response_model=Dict[str, Any],\n            status_code=status.HTTP_201_CREATED,\n            summary=\"Create a new item\",\n        )\n        \n        self.router.add_api_route(\n            \"/{item_id}\",\n            self._get_item,\n            methods=[\"GET\"],\n            response_model=Dict[str, Any],\n            summary=\"Get item by ID\",\n        )\n        \n        self.router.add_api_route(\n            \"/{item_id}\",\n            self._update_item,\n            methods=[\"PUT\"],\n            response_model=Dict[str, Any],\n            summary=\"Update item\",\n        )\n        \n        self.router.add_api_route(\n            \"/{item_id}\",\n            self._patch_item,\n            methods=[\"PATCH\"],\n            response_model=Dict[str, Any],\n            summary=\"Partially update item\",\n        )\n        \n        self.router.add_api_route(\n            \"/{item_id}\",\n            self._delete_item,\n            methods=[\"DELETE\"],\n            response_model=Dict[str, Any],\n            summary=\"Delete item\",\n        )\n        \n        # Advanced operations\n        self.router.add_api_route(\n            \"/search\",\n            self._search_items,\n            methods=[\"POST\"],\n            response_model=Dict[str, Any],\n            summary=\"Advanced search with filters\",\n        )\n        \n        self.router.add_api_route(\n            \"/bulk\",\n            self._bulk_create,\n            methods=[\"POST\"],\n            response_model=Dict[str, Any],\n            status_code=status.HTTP_201_CREATED,\n            summary=\"Bulk create items\",\n        )\n        \n        self.router.add_api_route(\n            \"/bulk\",\n            self._bulk_update,\n            methods=[\"PUT\"],\n            response_model=Dict[str, Any],\n            summary=\"Bulk update items\",\n        )\n        \n        self.router.add_api_route(\n            \"/bulk\",\n            self._bulk_delete,\n            methods=[\"DELETE\"],\n            response_model=Dict[str, Any],\n            summary=\"Bulk delete items\",\n        )\n        \n        # Data operations\n        self.router.add_api_route(\n            \"/export\",\n            self._export_data,\n            methods=[\"POST\"],\n            response_class=StreamingResponse,\n            summary=\"Export data\",\n        )\n        \n        self.router.add_api_route(\n            \"/import\",\n            self._import_data,\n            methods=[\"POST\"],\n            response_model=Dict[str, Any],\n            summary=\"Import data\",\n        )\n        \n        # Utility operations\n        self.router.add_api_route(\n            \"/count\",\n            self._count_items,\n            methods=[\"GET\"],\n            response_model=Dict[str, Any],\n            summary=\"Count items with filters\",\n        )\n        \n        self.router.add_api_route(\n            \"/{item_id}/exists\",\n            self._check_exists,\n            methods=[\"GET\"],\n            response_model=Dict[str, Any],\n            summary=\"Check if item exists\",\n        )\n    \n    def _get_service(self, db: AsyncSession) -> BaseService:\n        \"\"\"Get service instance.\"\"\"\n        return self.service_class(db)\n    \n    def _parse_filters(self, filters: List[FilterParam]) -> FilterParams:\n        \"\"\"Parse filter parameters.\"\"\"\n        filter_dict = {}\n        \n        for filter_param in filters:\n            filter_dict[filter_param.field] = {\n                \"operator\": filter_param.operator,\n                \"value\": filter_param.value,\n            }\n        \n        return FilterParams(filters=filter_dict)\n    \n    def _parse_sort(self, sort_params: List[SortParam]) -> SortParams:\n        \"\"\"Parse sort parameters.\"\"\"\n        if not sort_params:\n            return SortParams()\n        \n        primary_sort = sort_params[0]\n        secondary_sort = {}\n        \n        for sort_param in sort_params[1:]:\n            secondary_sort[sort_param.field] = sort_param.order\n        \n        return SortParams(\n            sort_by=primary_sort.field,\n            sort_order=primary_sort.order,\n            secondary_sort=secondary_sort,\n        )\n    \n    async def _list_items(\n        self,\n        page: int = Query(1, ge=1, description=\"Page number\"),\n        size: int = Query(20, ge=1, le=100, description=\"Page size\"),\n        search: Optional[str] = Query(None, description=\"Search query\"),\n        search_fields: Optional[str] = Query(None, description=\"Comma-separated search fields\"),\n        sort_by: Optional[str] = Query(None, description=\"Sort field\"),\n        sort_order: str = Query(SortOrder.DESC, description=\"Sort order\"),\n        include_deleted: bool = Query(False, description=\"Include soft-deleted items\"),\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_user),\n    ):\n        \"\"\"List items with filtering and pagination.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Setup pagination\n            pagination = PaginationParams(page=page, size=size)\n            \n            # Setup filters\n            filters = FilterParams(\n                search=search,\n                search_fields=search_fields.split(\",\") if search_fields else [],\n            )\n            \n            # Add soft delete filter\n            if not include_deleted:\n                if not filters.filters:\n                    filters.filters = {}\n                filters.filters[\"deleted_at\"] = {\n                    \"operator\": FilterOperator.IS_NULL,\n                    \"value\": None,\n                }\n            \n            # Setup sorting\n            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)\n            \n            # Get results\n            result = await service.get_multi(\n                pagination=pagination,\n                filters=filters,\n                sort_params=sort_params,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data={\n                    \"items\": [item.dict() if hasattr(item, \"dict\") else item for item in result.items],\n                    \"pagination\": {\n                        \"page\": result.page,\n                        \"size\": result.size,\n                        \"total\": result.total,\n                        \"total_pages\": result.total_pages,\n                        \"has_next\": result.has_next,\n                        \"has_prev\": result.has_prev,\n                    },\n                },\n                message=\"Items retrieved successfully\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to list items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _get_item(\n        self,\n        item_id: Union[int, str],\n        include_relationships: bool = Query(False, description=\"Include related data\"),\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_user),\n    ):\n        \"\"\"Get item by ID.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            relationships = None\n            if include_relationships:\n                # This would be configured per service\n                relationships = getattr(service, \"default_relationships\", [])\n            \n            item = await service.get_by_id(\n                id=item_id,\n                user_id=getattr(current_user, \"id\", None),\n                relationships=relationships,\n            )\n            \n            if not item:\n                raise HTTPException(status_code=404, detail=\"Item not found\")\n            \n            return create_success_response(\n                data=item.dict() if hasattr(item, \"dict\") else item,\n                message=\"Item retrieved successfully\",\n            )\n            \n        except HTTPException:\n            raise\n        except Exception as e:\n            logger.error(\"Failed to get item\", item_id=item_id, error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _create_item(\n        self,\n        item_data: dict,  # Will be validated by the service\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Create a new item.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Convert dict to schema\n            create_data = self.create_schema(**item_data)\n            \n            item = await service.create(\n                obj_in=create_data,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            # Background task for post-creation processing\n            background_tasks.add_task(\n                self._post_create_processing,\n                item_id=getattr(item, \"id\", None),\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data=item.dict() if hasattr(item, \"dict\") else item,\n                message=\"Item created successfully\",\n            )\n            \n        except ValidationException as e:\n            raise HTTPException(status_code=422, detail=str(e))\n        except Exception as e:\n            logger.error(\"Failed to create item\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _update_item(\n        self,\n        item_id: Union[int, str],\n        item_data: dict,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Update item.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Convert dict to schema\n            update_data = self.update_schema(**item_data)\n            \n            item = await service.update(\n                id=item_id,\n                obj_in=update_data,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            if not item:\n                raise HTTPException(status_code=404, detail=\"Item not found\")\n            \n            # Background task for post-update processing\n            background_tasks.add_task(\n                self._post_update_processing,\n                item_id=item_id,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data=item.dict() if hasattr(item, \"dict\") else item,\n                message=\"Item updated successfully\",\n            )\n            \n        except ValidationException as e:\n            raise HTTPException(status_code=422, detail=str(e))\n        except NotFoundException as e:\n            raise HTTPException(status_code=404, detail=str(e))\n        except Exception as e:\n            logger.error(\"Failed to update item\", item_id=item_id, error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _patch_item(\n        self,\n        item_id: Union[int, str],\n        item_data: dict,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Partially update item.\"\"\"\n        # Same as update but with partial data\n        return await self._update_item(item_id, item_data, background_tasks, db, current_user)\n    \n    async def _delete_item(\n        self,\n        item_id: Union[int, str],\n        soft_delete: bool = Query(True, description=\"Use soft delete\"),\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Delete item.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            success = await service.delete(\n                id=item_id,\n                user_id=getattr(current_user, \"id\", None),\n                soft_delete=soft_delete,\n            )\n            \n            if not success:\n                raise HTTPException(status_code=404, detail=\"Item not found\")\n            \n            # Background task for post-deletion processing\n            background_tasks.add_task(\n                self._post_delete_processing,\n                item_id=item_id,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                message=\"Item deleted successfully\",\n            )\n            \n        except NotFoundException as e:\n            raise HTTPException(status_code=404, detail=str(e))\n        except Exception as e:\n            logger.error(\"Failed to delete item\", item_id=item_id, error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _search_items(\n        self,\n        search_request: SearchRequest,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_user),\n    ):\n        \"\"\"Advanced search with filters.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Setup pagination\n            pagination = PaginationParams(page=search_request.page, size=search_request.size)\n            \n            # Setup filters\n            filters = self._parse_filters(search_request.filters)\n            filters.search = search_request.query\n            filters.search_fields = search_request.fields\n            \n            # Setup sorting\n            sort_params = self._parse_sort(search_request.sort)\n            \n            # Get results\n            result = await service.get_multi(\n                pagination=pagination,\n                filters=filters,\n                sort_params=sort_params,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data={\n                    \"items\": [item.dict() if hasattr(item, \"dict\") else item for item in result.items],\n                    \"pagination\": {\n                        \"page\": result.page,\n                        \"size\": result.size,\n                        \"total\": result.total,\n                        \"total_pages\": result.total_pages,\n                        \"has_next\": result.has_next,\n                        \"has_prev\": result.has_prev,\n                    },\n                    \"search\": {\n                        \"query\": search_request.query,\n                        \"fields\": search_request.fields,\n                    },\n                },\n                message=\"Search completed successfully\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to search items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _bulk_create(\n        self,\n        bulk_request: BulkCreateRequest,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Bulk create items.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Convert items to schemas\n            create_objects = []\n            for item_data in bulk_request.items:\n                create_objects.append(self.create_schema(**item_data))\n            \n            items = await service.bulk_create(\n                objects=create_objects,\n                user_id=getattr(current_user, \"id\", None),\n                batch_size=bulk_request.batch_size,\n                skip_validation=bulk_request.skip_validation,\n            )\n            \n            # Background task for post-creation processing\n            background_tasks.add_task(\n                self._post_bulk_create_processing,\n                count=len(items),\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data={\n                    \"created_count\": len(items),\n                    \"items\": [item.dict() if hasattr(item, \"dict\") else item for item in items[:10]],  # Return first 10\n                },\n                message=f\"Successfully created {len(items)} items\",\n            )\n            \n        except ValidationException as e:\n            raise HTTPException(status_code=422, detail=str(e))\n        except Exception as e:\n            logger.error(\"Failed to bulk create items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _bulk_update(\n        self,\n        bulk_request: BulkUpdateRequest,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Bulk update items.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # This would need to be implemented in the service layer\n            # For now, we'll do individual updates\n            updated_count = 0\n            \n            for update_data in bulk_request.updates:\n                item_id = update_data.pop(\"id\", None)\n                if item_id:\n                    update_schema = self.update_schema(**update_data)\n                    result = await service.update(\n                        id=item_id,\n                        obj_in=update_schema,\n                        user_id=getattr(current_user, \"id\", None),\n                        skip_validation=bulk_request.skip_validation,\n                    )\n                    if result:\n                        updated_count += 1\n            \n            return create_success_response(\n                data={\"updated_count\": updated_count},\n                message=f\"Successfully updated {updated_count} items\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to bulk update items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _bulk_delete(\n        self,\n        bulk_request: BulkDeleteRequest,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Bulk delete items.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            deleted_count = await service.bulk_delete(\n                ids=bulk_request.ids,\n                user_id=getattr(current_user, \"id\", None),\n                soft_delete=bulk_request.soft_delete,\n            )\n            \n            return create_success_response(\n                data={\"deleted_count\": deleted_count},\n                message=f\"Successfully deleted {deleted_count} items\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to bulk delete items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _export_data(\n        self,\n        export_request: ExportRequest,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_user),\n    ):\n        \"\"\"Export data.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Setup filters and sorting\n            filters = self._parse_filters(export_request.filters)\n            sort_params = self._parse_sort(export_request.sort)\n            \n            # Get all data (with reasonable limit)\n            pagination = PaginationParams(page=1, size=10000)  # Max 10k records\n            \n            result = await service.get_multi(\n                pagination=pagination,\n                filters=filters,\n                sort_params=sort_params,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            # Generate export data\n            if export_request.format.lower() == \"csv\":\n                return await self._generate_csv_export(result.items, export_request.fields)\n            elif export_request.format.lower() == \"json\":\n                return await self._generate_json_export(result.items, export_request.fields)\n            else:\n                raise HTTPException(status_code=400, detail=\"Unsupported export format\")\n            \n        except Exception as e:\n            logger.error(\"Failed to export data\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _import_data(\n        self,\n        import_request: ImportRequest,\n        background_tasks: BackgroundTasks,\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_active_user),\n    ):\n        \"\"\"Import data.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            # Parse import data\n            if import_request.format.lower() == \"csv\":\n                items_data = await self._parse_csv_import(import_request.data)\n            elif import_request.format.lower() == \"json\":\n                items_data = await self._parse_json_import(import_request.data)\n            else:\n                raise HTTPException(status_code=400, detail=\"Unsupported import format\")\n            \n            # Convert to schemas\n            create_objects = []\n            for item_data in items_data:\n                create_objects.append(self.create_schema(**item_data))\n            \n            # Import data\n            items = await service.bulk_create(\n                objects=create_objects,\n                user_id=getattr(current_user, \"id\", None),\n                batch_size=import_request.batch_size,\n                skip_validation=import_request.skip_validation,\n            )\n            \n            return create_success_response(\n                data={\n                    \"imported_count\": len(items),\n                    \"total_processed\": len(items_data),\n                },\n                message=f\"Successfully imported {len(items)} items\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to import data\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _count_items(\n        self,\n        search: Optional[str] = Query(None, description=\"Search query\"),\n        include_deleted: bool = Query(False, description=\"Include soft-deleted items\"),\n        db: AsyncSession = Depends(get_db),\n        current_user = Depends(get_current_user),\n    ):\n        \"\"\"Count items with filters.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            filters = FilterParams(search=search)\n            \n            # Add soft delete filter\n            if not include_deleted:\n                if not filters.filters:\n                    filters.filters = {}\n                filters.filters[\"deleted_at\"] = {\n                    \"operator\": FilterOperator.IS_NULL,\n                    \"value\": None,\n                }\n            \n            count = await service.count(\n                filters=filters,\n                user_id=getattr(current_user, \"id\", None),\n            )\n            \n            return create_success_response(\n                data={\"count\": count},\n                message=\"Count retrieved successfully\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to count items\", error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    async def _check_exists(\n        self,\n        item_id: Union[int, str],\n        db: AsyncSession = Depends(get_db),\n    ):\n        \"\"\"Check if item exists.\"\"\"\n        try:\n            service = self._get_service(db)\n            \n            exists = await service.exists(item_id)\n            \n            return create_success_response(\n                data={\"exists\": exists},\n                message=\"Existence check completed\",\n            )\n            \n        except Exception as e:\n            logger.error(\"Failed to check existence\", item_id=item_id, error=str(e))\n            raise HTTPException(status_code=500, detail=str(e))\n    \n    # Helper methods for data processing\n    \n    async def _generate_csv_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:\n        \"\"\"Generate CSV export.\"\"\"\n        output = io.StringIO()\n        \n        if not items:\n            output.write(\"No data to export\\n\")\n        else:\n            # Get field names\n            if fields:\n                fieldnames = fields\n            else:\n                first_item = items[0]\n                if hasattr(first_item, \"dict\"):\n                    fieldnames = list(first_item.dict().keys())\n                else:\n                    fieldnames = list(first_item.__dict__.keys())\n            \n            writer = csv.DictWriter(output, fieldnames=fieldnames)\n            writer.writeheader()\n            \n            for item in items:\n                if hasattr(item, \"dict\"):\n                    row_data = item.dict()\n                else:\n                    row_data = item.__dict__\n                \n                # Filter fields if specified\n                if fields:\n                    row_data = {k: v for k, v in row_data.items() if k in fields}\n                \n                writer.writerow(row_data)\n        \n        output.seek(0)\n        \n        return StreamingResponse(\n            io.BytesIO(output.getvalue().encode()),\n            media_type=\"text/csv\",\n            headers={\"Content-Disposition\": \"attachment; filename=export.csv\"},\n        )\n    \n    async def _generate_json_export(self, items: List, fields: Optional[List[str]]) -> StreamingResponse:\n        \"\"\"Generate JSON export.\"\"\"\n        export_data = []\n        \n        for item in items:\n            if hasattr(item, \"dict\"):\n                item_data = item.dict()\n            else:\n                item_data = item.__dict__\n            \n            # Filter fields if specified\n            if fields:\n                item_data = {k: v for k, v in item_data.items() if k in fields}\n            \n            export_data.append(item_data)\n        \n        json_data = json.dumps(export_data, default=str, indent=2)\n        \n        return StreamingResponse(\n            io.BytesIO(json_data.encode()),\n            media_type=\"application/json\",\n            headers={\"Content-Disposition\": \"attachment; filename=export.json\"},\n        )\n    \n    async def _parse_csv_import(self, csv_data: str) -> List[Dict[str, Any]]:\n        \"\"\"Parse CSV import data.\"\"\"\n        items = []\n        csv_file = io.StringIO(csv_data)\n        reader = csv.DictReader(csv_file)\n        \n        for row in reader:\n            items.append(dict(row))\n        \n        return items\n    \n    async def _parse_json_import(self, json_data: str) -> List[Dict[str, Any]]:\n        \"\"\"Parse JSON import data.\"\"\"\n        data = json.loads(json_data)\n        \n        if isinstance(data, list):\n            return data\n        elif isinstance(data, dict):\n            return [data]\n        else:\n            raise ValueError(\"Invalid JSON format for import\")\n    \n    # Background task methods\n    \n    async def _post_create_processing(self, item_id: Any, user_id: Optional[str]):\n        \"\"\"Post-creation processing.\"\"\"\n        logger.info(\"Post-create processing\", item_id=item_id, user_id=user_id)\n    \n    async def _post_update_processing(self, item_id: Any, user_id: Optional[str]):\n        \"\"\"Post-update processing.\"\"\"\n        logger.info(\"Post-update processing\", item_id=item_id, user_id=user_id)\n    \n    async def _post_delete_processing(self, item_id: Any, user_id: Optional[str]):\n        \"\"\"Post-deletion processing.\"\"\"\n        logger.info(\"Post-delete processing\", item_id=item_id, user_id=user_id)\n    \n    async def _post_bulk_create_processing(self, count: int, user_id: Optional[str]):\n        \"\"\"Post-bulk-creation processing.\"\"\"\n        logger.info(\"Post-bulk-create processing\", count=count, user_id=user_id)
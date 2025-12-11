"""Enhanced CRUD API endpoints with advanced features.

This file provides a single, clean implementation of an enhanced CRUD router used
across the application. The router delegates data operations to a provided
`BaseService` implementation and exposes create/read/update/delete, bulk
operations, import/export and utility endpoints.
"""

import csv
import io
import json
from typing import Any, Dict, List, Optional, Type, Union

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user, get_current_user
from app.core.database import get_db
from app.core.exceptions import (
    NotFoundException,
    ValidationException,
    create_success_response,
)
from app.core.logging import get_logger
from app.core.repository import (
    FilterOperator,
    FilterParams,
    PaginationParams,
    SortOrder,
    SortParams,
)
from app.core.service import BaseService

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
        self.router.add_api_route(
            "/", self._list_items, methods=["GET"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/",
            self._create_item,
            methods=["POST"],
            response_model=Dict[str, Any],
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "/{item_id}", self._get_item, methods=["GET"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/{item_id}", self._update_item, methods=["PUT"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/{item_id}", self._patch_item, methods=["PATCH"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/{item_id}", self._delete_item, methods=["DELETE"], response_model=Dict[str, Any]
        )

        # Advanced
        self.router.add_api_route(
            "/search", self._search_items, methods=["POST"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/bulk",
            self._bulk_create,
            methods=["POST"],
            response_model=Dict[str, Any],
            status_code=status.HTTP_201_CREATED,
        )
        self.router.add_api_route(
            "/bulk", self._bulk_update, methods=["PUT"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/bulk", self._bulk_delete, methods=["DELETE"], response_model=Dict[str, Any]
        )

        # Data
        self.router.add_api_route(
            "/export", self._export_data, methods=["POST"], response_class=StreamingResponse
        )
        self.router.add_api_route(
            "/import", self._import_data, methods=["POST"], response_model=Dict[str, Any]
        )

        # Utilities
        self.router.add_api_route(
            "/count", self._count_items, methods=["GET"], response_model=Dict[str, Any]
        )
        self.router.add_api_route(
            "/{item_id}/exists", self._check_exists, methods=["GET"], response_model=Dict[str, Any]
        )

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

    async def _list_items(
        self,
        page: int = Query(1, ge=1),
        size: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None),
        search_fields: Optional[str] = Query(None),
        sort_by: Optional[str] = Query(None),
        sort_order: str = Query(SortOrder.DESC),
        include_deleted: bool = Query(False),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=page, size=size)
            filters = FilterParams(
                search=search, search_fields=search_fields.split(",") if search_fields else []
            )
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
            sort_params = SortParams(sort_by=sort_by, sort_order=sort_order)
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            return create_success_response(
                data={
                    "items": [
                        item.dict() if hasattr(item, "dict") else item for item in result.items
                    ],
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
        include_relationships: bool = Query(False),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            rel = getattr(service, "default_relationships", []) if include_relationships else None
            item = await service.get_by_id(
                id=item_id, user_id=getattr(current_user, "id", None), relationships=rel
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
        item_data: dict,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            create_data = self.create_schema(**item_data)
            item = await service.create(
                obj_in=create_data, user_id=getattr(current_user, "id", None)
            )
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
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            update_data = self.update_schema(**item_data)
            item = await service.update(
                id=item_id, obj_in=update_data, user_id=getattr(current_user, "id", None)
            )
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
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
        current_user=Depends(get_current_active_user),
    ):
        return await self._update_item(item_id, item_data, background_tasks, db, current_user)

    async def _delete_item(
        self,
        item_id: Union[int, str],
        background_tasks: BackgroundTasks,
        soft_delete: bool = Query(True, description="Use soft delete"),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            success = await service.delete(
                id=item_id, user_id=getattr(current_user, "id", None), soft_delete=soft_delete
            )
            if not success:
                raise HTTPException(status_code=404, detail="Item not found")
            background_tasks.add_task(
                self._post_delete_processing,
                item_id=item_id,
                user_id=getattr(current_user, "id", None),
            )
            return create_success_response(message="Item deleted successfully")
        except NotFoundException as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error("Failed to delete item", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _search_items(
        self,
        search_request: SearchRequest,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            pagination = PaginationParams(page=search_request.page, size=search_request.size)
            filters = self._parse_filters(search_request.filters)
            filters.search = search_request.query
            filters.search_fields = search_request.fields
            sort_params = self._parse_sort(search_request.sort)
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            return create_success_response(
                data={
                    "items": [
                        item.dict() if hasattr(item, "dict") else item for item in result.items
                    ],
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

    async def _bulk_create(
        self,
        bulk_request: BulkCreateRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            create_objects = [self.create_schema(**it) for it in bulk_request.items]
            items = await service.bulk_create(
                objects=create_objects,
                user_id=getattr(current_user, "id", None),
                batch_size=bulk_request.batch_size,
                skip_validation=bulk_request.skip_validation,
            )
            background_tasks.add_task(
                self._post_bulk_create_processing,
                count=len(items),
                user_id=getattr(current_user, "id", None),
            )
            return create_success_response(
                data={
                    "created_count": len(items),
                    "items": [
                        item.dict() if hasattr(item, "dict") else item for item in items[:10]
                    ],
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
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            updated_count = 0
            for u in bulk_request.updates:
                item_id = u.pop("id", None)
                if item_id:
                    update_schema = self.update_schema(**u)
                    res = await service.update(
                        id=item_id,
                        obj_in=update_schema,
                        user_id=getattr(current_user, "id", None),
                        skip_validation=bulk_request.skip_validation,
                    )
                    if res:
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
        current_user=Depends(get_current_active_user),
    ):
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
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            filters = self._parse_filters(export_request.filters)
            sort_params = self._parse_sort(export_request.sort)
            pagination = PaginationParams(page=1, size=10000)
            result = await service.get_multi(
                pagination=pagination,
                filters=filters,
                sort_params=sort_params,
                user_id=getattr(current_user, "id", None),
            )
            if export_request.format.lower() == "csv":
                return await self._generate_csv_export(result.items, export_request.fields)
            if export_request.format.lower() == "json":
                return await self._generate_json_export(result.items, export_request.fields)
            raise HTTPException(status_code=400, detail="Unsupported export format")
        except Exception as e:
            logger.error("Failed to export data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _import_data(
        self,
        import_request: ImportRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_active_user),
    ):
        try:
            service = self._get_service(db)
            if import_request.format.lower() == "csv":
                items_data = await self._parse_csv_import(import_request.data)
            elif import_request.format.lower() == "json":
                items_data = await self._parse_json_import(import_request.data)
            else:
                raise HTTPException(status_code=400, detail="Unsupported import format")
            create_objects = [self.create_schema(**it) for it in items_data]
            items = await service.bulk_create(
                objects=create_objects,
                user_id=getattr(current_user, "id", None),
                batch_size=import_request.batch_size,
                skip_validation=import_request.skip_validation,
            )
            return create_success_response(
                data={"imported_count": len(items), "total_processed": len(items_data)},
                message=f"Successfully imported {len(items)} items",
            )
        except Exception as e:
            logger.error("Failed to import data", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _count_items(
        self,
        search: Optional[str] = Query(None),
        include_deleted: bool = Query(False),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
    ):
        try:
            service = self._get_service(db)
            filters = FilterParams(search=search)
            if not include_deleted:
                if not filters.filters:
                    filters.filters = {}
                filters.filters["deleted_at"] = {"operator": FilterOperator.IS_NULL, "value": None}
            count = await service.count(filters=filters, user_id=getattr(current_user, "id", None))
            return create_success_response(
                data={"count": count}, message="Count retrieved successfully"
            )
        except Exception as e:
            logger.error("Failed to count items", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _check_exists(self, item_id: Union[int, str], db: AsyncSession = Depends(get_db)):
        try:
            service = self._get_service(db)
            exists = await service.exists(item_id)
            return create_success_response(
                data={"exists": exists}, message="Existence check completed"
            )
        except Exception as e:
            logger.error("Failed to check existence", item_id=item_id, error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def _generate_csv_export(
        self, items: List, fields: Optional[List[str]]
    ) -> StreamingResponse:
        output = io.StringIO()
        if not items:
            output.write("No data to export\n")
        else:
            if fields:
                fieldnames = fields
            else:
                first = items[0]
                fieldnames = (
                    list(first.dict().keys())
                    if hasattr(first, "dict")
                    else list(vars(first).keys())
                )
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for item in items:
                row = (
                    item.dict()
                    if hasattr(item, "dict")
                    else (vars(item) if hasattr(item, "__dict__") else dict(item))
                )
                if fields:
                    row = {k: v for k, v in row.items() if k in fields}
                writer.writerow(row)
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=export.csv"},
        )

    async def _generate_json_export(
        self, items: List, fields: Optional[List[str]]
    ) -> StreamingResponse:
        export_data = []
        for item in items:
            data = (
                item.dict()
                if hasattr(item, "dict")
                else (vars(item) if hasattr(item, "__dict__") else dict(item))
            )
            if fields:
                data = {k: v for k, v in data.items() if k in fields}
            export_data.append(data)
        json_data = json.dumps(export_data, default=str, indent=2)
        return StreamingResponse(
            io.BytesIO(json_data.encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=export.json"},
        )

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

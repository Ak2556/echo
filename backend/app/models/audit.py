"""
Audit Trail Models for tracking all CRUD operations.
Provides comprehensive audit logging for compliance and debugging.
"""
from sqlmodel import SQLModel, Field, Column
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import JSON, Index


class AuditAction(str, Enum):
    """Audit action types."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    SOFT_DELETE = "soft_delete"
    BULK_CREATE = "bulk_create"
    BULK_UPDATE = "bulk_update"
    BULK_DELETE = "bulk_delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    SEARCH = "search"


class AuditSeverity(str, Enum):
    """Audit severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AuditLog(SQLModel, table=True):
    """Comprehensive audit log for all system operations."""
    __tablename__ = "audit_logs"
    
    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Core audit fields
    entity_type: str = Field(index=True, description="Type of entity (table name)")
    entity_id: Optional[str] = Field(index=True, description="ID of the affected entity")
    action: AuditAction = Field(index=True, description="Action performed")
    
    # User information
    user_id: Optional[str] = Field(index=True, description="ID of user who performed action")
    user_email: Optional[str] = Field(description="Email of user who performed action")
    user_role: Optional[str] = Field(description="Role of user who performed action")
    
    # Request information
    request_id: Optional[str] = Field(index=True, description="Unique request identifier")
    session_id: Optional[str] = Field(description="User session identifier")
    ip_address: Optional[str] = Field(description="IP address of the request")
    user_agent: Optional[str] = Field(description="User agent string")
    
    # Change tracking
    old_values: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"Previous values before change\"\n    )\n    new_values: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"New values after change\"\n    )\n    changed_fields: Optional[list] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"List of fields that were changed\"\n    )\n    \n    # Additional metadata\n    metadata: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"Additional context and metadata\"\n    )\n    \n    # Categorization\n    severity: AuditSeverity = Field(default=AuditSeverity.LOW, description=\"Severity level\")\n    category: Optional[str] = Field(description=\"Audit category (e.g., 'security', 'data')\")\n    tags: Optional[list] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"Tags for categorization\"\n    )\n    \n    # Status and flags\n    success: bool = Field(default=True, description=\"Whether the operation was successful\")\n    error_message: Optional[str] = Field(description=\"Error message if operation failed\")\n    is_sensitive: bool = Field(default=False, description=\"Whether this contains sensitive data\")\n    \n    # Timing\n    timestamp: datetime = Field(\n        default_factory=lambda: datetime.now(timezone.utc),\n        index=True,\n        description=\"When the action occurred\"\n    )\n    duration_ms: Optional[int] = Field(description=\"Operation duration in milliseconds\")\n    \n    # Compliance and retention\n    retention_date: Optional[datetime] = Field(description=\"When this record can be deleted\")\n    compliance_flags: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        default=None, \n        description=\"Compliance-related flags and data\"\n    )\n    \n    # Indexes for performance\n    __table_args__ = (\n        Index(\"idx_audit_entity_action\", \"entity_type\", \"action\"),\n        Index(\"idx_audit_user_timestamp\", \"user_id\", \"timestamp\"),\n        Index(\"idx_audit_entity_id_timestamp\", \"entity_id\", \"timestamp\"),\n        Index(\"idx_audit_timestamp_severity\", \"timestamp\", \"severity\"),\n    )\n\n\nclass AuditLogCreate(SQLModel):\n    \"\"\"Schema for creating audit log entries.\"\"\"\n    entity_type: str\n    entity_id: Optional[str] = None\n    action: AuditAction\n    user_id: Optional[str] = None\n    user_email: Optional[str] = None\n    user_role: Optional[str] = None\n    request_id: Optional[str] = None\n    session_id: Optional[str] = None\n    ip_address: Optional[str] = None\n    user_agent: Optional[str] = None\n    old_values: Optional[Dict[str, Any]] = None\n    new_values: Optional[Dict[str, Any]] = None\n    changed_fields: Optional[list] = None\n    metadata: Optional[Dict[str, Any]] = None\n    severity: AuditSeverity = AuditSeverity.LOW\n    category: Optional[str] = None\n    tags: Optional[list] = None\n    success: bool = True\n    error_message: Optional[str] = None\n    is_sensitive: bool = False\n    duration_ms: Optional[int] = None\n\n\nclass AuditLogResponse(SQLModel):\n    \"\"\"Schema for audit log responses.\"\"\"\n    id: int\n    entity_type: str\n    entity_id: Optional[str]\n    action: AuditAction\n    user_id: Optional[str]\n    user_email: Optional[str]\n    timestamp: datetime\n    success: bool\n    severity: AuditSeverity\n    category: Optional[str]\n    changed_fields: Optional[list]\n    metadata: Optional[Dict[str, Any]]\n\n\nclass AuditLogFilter(SQLModel):\n    \"\"\"Schema for filtering audit logs.\"\"\"\n    entity_type: Optional[str] = None\n    entity_id: Optional[str] = None\n    action: Optional[AuditAction] = None\n    user_id: Optional[str] = None\n    severity: Optional[AuditSeverity] = None\n    category: Optional[str] = None\n    success: Optional[bool] = None\n    start_date: Optional[datetime] = None\n    end_date: Optional[datetime] = None\n    search: Optional[str] = None\n\n\nclass AuditSummary(SQLModel):\n    \"\"\"Schema for audit summary statistics.\"\"\"\n    total_entries: int\n    actions_summary: Dict[str, int]\n    severity_summary: Dict[str, int]\n    user_activity: Dict[str, int]\n    entity_activity: Dict[str, int]\n    success_rate: float\n    date_range: Dict[str, datetime]\n\n\nclass SecurityEvent(SQLModel, table=True):\n    \"\"\"Security-specific audit events.\"\"\"\n    __tablename__ = \"security_events\"\n    \n    id: Optional[int] = Field(default=None, primary_key=True)\n    \n    # Event details\n    event_type: str = Field(index=True, description=\"Type of security event\")\n    severity: AuditSeverity = Field(index=True, description=\"Event severity\")\n    description: str = Field(description=\"Event description\")\n    \n    # User and session\n    user_id: Optional[str] = Field(index=True, description=\"Affected user ID\")\n    session_id: Optional[str] = Field(description=\"Session identifier\")\n    \n    # Network information\n    ip_address: Optional[str] = Field(index=True, description=\"Source IP address\")\n    user_agent: Optional[str] = Field(description=\"User agent string\")\n    geolocation: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        description=\"Geolocation data\"\n    )\n    \n    # Event data\n    event_data: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        description=\"Additional event data\"\n    )\n    \n    # Risk assessment\n    risk_score: Optional[int] = Field(description=\"Risk score (0-100)\")\n    threat_indicators: Optional[list] = Field(\n        sa_column=Column(JSON), \n        description=\"Threat indicators\"\n    )\n    \n    # Response\n    action_taken: Optional[str] = Field(description=\"Action taken in response\")\n    resolved: bool = Field(default=False, description=\"Whether event is resolved\")\n    resolved_at: Optional[datetime] = Field(description=\"When event was resolved\")\n    resolved_by: Optional[str] = Field(description=\"Who resolved the event\")\n    \n    # Timing\n    timestamp: datetime = Field(\n        default_factory=lambda: datetime.now(timezone.utc),\n        index=True\n    )\n    \n    # Indexes\n    __table_args__ = (\n        Index(\"idx_security_event_type_timestamp\", \"event_type\", \"timestamp\"),\n        Index(\"idx_security_severity_timestamp\", \"severity\", \"timestamp\"),\n        Index(\"idx_security_user_timestamp\", \"user_id\", \"timestamp\"),\n        Index(\"idx_security_ip_timestamp\", \"ip_address\", \"timestamp\"),\n    )\n\n\nclass DataAccessLog(SQLModel, table=True):\n    \"\"\"Detailed logging for data access (GDPR compliance).\"\"\"\n    __tablename__ = \"data_access_logs\"\n    \n    id: Optional[int] = Field(default=None, primary_key=True)\n    \n    # Access details\n    data_type: str = Field(index=True, description=\"Type of data accessed\")\n    data_id: str = Field(index=True, description=\"ID of data accessed\")\n    access_type: str = Field(description=\"Type of access (read, export, etc.)\")\n    \n    # User information\n    user_id: str = Field(index=True, description=\"User who accessed data\")\n    user_role: str = Field(description=\"Role of accessing user\")\n    \n    # Legal basis (GDPR)\n    legal_basis: Optional[str] = Field(description=\"Legal basis for data access\")\n    purpose: Optional[str] = Field(description=\"Purpose of data access\")\n    \n    # Data details\n    fields_accessed: Optional[list] = Field(\n        sa_column=Column(JSON), \n        description=\"Specific fields accessed\"\n    )\n    data_volume: Optional[int] = Field(description=\"Amount of data accessed\")\n    \n    # Context\n    request_context: Optional[Dict[str, Any]] = Field(\n        sa_column=Column(JSON), \n        description=\"Request context\"\n    )\n    \n    # Timing\n    timestamp: datetime = Field(\n        default_factory=lambda: datetime.now(timezone.utc),\n        index=True\n    )\n    \n    # Retention (GDPR)\n    retention_period: Optional[int] = Field(description=\"Retention period in days\")\n    auto_delete_date: Optional[datetime] = Field(description=\"When to auto-delete this log\")\n    \n    # Indexes\n    __table_args__ = (\n        Index(\"idx_data_access_user_timestamp\", \"user_id\", \"timestamp\"),\n        Index(\"idx_data_access_type_timestamp\", \"data_type\", \"timestamp\"),\n        Index(\"idx_data_access_data_id\", \"data_id\"),\n    )\n\n\n# Audit configuration\nclass AuditConfig:\n    \"\"\"Configuration for audit logging.\"\"\"\n    \n    # What to audit\n    AUDIT_READS = False  # Usually disabled for performance\n    AUDIT_WRITES = True\n    AUDIT_DELETES = True\n    AUDIT_BULK_OPERATIONS = True\n    AUDIT_AUTHENTICATION = True\n    AUDIT_AUTHORIZATION_FAILURES = True\n    \n    # Sensitive data handling\n    MASK_SENSITIVE_FIELDS = True\n    SENSITIVE_FIELDS = [\n        \"password\", \"token\", \"secret\", \"key\", \"ssn\", \n        \"credit_card\", \"bank_account\", \"phone\", \"email\"\n    ]\n    \n    # Retention\n    DEFAULT_RETENTION_DAYS = 2555  # 7 years\n    SECURITY_EVENT_RETENTION_DAYS = 3650  # 10 years\n    DATA_ACCESS_RETENTION_DAYS = 1095  # 3 years\n    \n    # Performance\n    BATCH_SIZE = 1000\n    ASYNC_LOGGING = True\n    \n    # Compliance\n    GDPR_COMPLIANCE = True\n    SOX_COMPLIANCE = False\n    HIPAA_COMPLIANCE = False
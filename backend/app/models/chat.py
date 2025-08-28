from sqlmodel import SQLModel, Field, Relationship, Column
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import JSON


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    VIDEO = "video"
    AUDIO = "audio"
    SYSTEM = "system"


class ChatRoomType(str, Enum):
    DIRECT = "direct"
    GROUP = "group"
    COURSE = "course"


class ChatRoom(SQLModel, table=True):
    """Chat room for teacher-student or group communication"""
    __tablename__ = "chat_rooms"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: Optional[int] = Field(foreign_key="courses.id", index=True, default=None)
    teacher_id: str = Field(foreign_key="teachers.id", index=True)

    # Room details
    room_type: ChatRoomType = Field(default=ChatRoomType.DIRECT)
    name: Optional[str] = None
    description: Optional[str] = None

    # Participants (list of user IDs)
    participants: List[int] = Field(sa_column=Column(JSON), default=[])

    # Status
    is_active: bool = Field(default=True)
    is_archived: bool = Field(default=False)

    # Last activity
    last_message_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    # Note: Relationships removed to avoid circular dependency issues
    # teacher: "Teacher" = Relationship(back_populates="chat_rooms")
    messages: List["ChatMessage"] = Relationship(back_populates="room")


class ChatMessage(SQLModel, table=True):
    """Individual chat messages"""
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="chat_rooms.id", index=True)
    sender_id: str = Field(foreign_key="auth_users.id", index=True)

    # Message content
    message_type: MessageType = Field(default=MessageType.TEXT)
    content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None

    # Status
    is_read: bool = Field(default=False)
    read_at: Optional[datetime] = None
    is_edited: bool = Field(default=False)
    edited_at: Optional[datetime] = None
    is_deleted: bool = Field(default=False)
    deleted_at: Optional[datetime] = None

    # Reply functionality
    reply_to_id: Optional[int] = Field(foreign_key="chat_messages.id", default=None)

    # Reactions
    reactions: dict = Field(sa_column=Column(JSON), default={})

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    room: ChatRoom = Relationship(back_populates="messages")
    # Note: User relationship removed as auth User model doesn't have chat_messages relationship


class ChatMessageCreate(SQLModel):
    """Schema for creating a chat message"""
    room_id: int
    message_type: MessageType = MessageType.TEXT
    content: str
    reply_to_id: Optional[int] = None


class ChatMessageResponse(SQLModel):
    """Schema for chat message response"""
    id: int
    room_id: int
    sender_id: int
    message_type: MessageType
    content: str
    file_url: Optional[str]
    is_read: bool
    is_edited: bool
    reply_to_id: Optional[int]
    created_at: datetime


class ChatRoomCreate(SQLModel):
    """Schema for creating a chat room"""
    course_id: Optional[int] = None
    teacher_id: int
    room_type: ChatRoomType = ChatRoomType.DIRECT
    name: Optional[str] = None
    participants: List[int] = []


class ChatRoomResponse(SQLModel):
    """Schema for chat room response"""
    id: int
    course_id: Optional[int]
    teacher_id: int
    room_type: ChatRoomType
    name: Optional[str]
    participants: List[int]
    is_active: bool
    last_message_at: Optional[datetime]
    created_at: datetime

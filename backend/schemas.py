from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RoomCreate(BaseModel):
    language: Optional[str] = "python"


class RoomResponse(BaseModel):
    roomId: str
    code: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    suggestion: str
    confidence: float


class WebSocketMessage(BaseModel):
    type: str  # "code_update", "cursor_position", "user_join", "user_leave"
    code: Optional[str] = None
    cursorPosition: Optional[int] = None
    userId: Optional[str] = None
    language: Optional[str] = None

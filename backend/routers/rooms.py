from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import RoomCreate, RoomResponse
from services.room_service import RoomService

router = APIRouter()


@router.post("/rooms", response_model=RoomResponse, status_code=201)
async def create_room(
    room_data: RoomCreate = RoomCreate(),
    db: Session = Depends(get_db)
):
    """
    Create a new collaborative coding room.
    Returns a unique room ID that users can share to join.
    """
    room_service = RoomService(db)
    room = room_service.create_room(language=room_data.language)
    
    return RoomResponse(
        roomId=room.room_id,
        code=room.code,
        language=room.language,
        created_at=room.created_at
    )


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, db: Session = Depends(get_db)):
    """
    Get room details by room ID.
    """
    room_service = RoomService(db)
    room = room_service.get_room(room_id)
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return RoomResponse(
        roomId=room.room_id,
        code=room.code,
        language=room.language,
        created_at=room.created_at
    )

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.websocket_service import WebSocketManager
from services.room_service import RoomService
import json

router = APIRouter()
manager = WebSocketManager()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for real-time collaborative coding.
    Handles connection, disconnection, and message broadcasting.
    """
    # Accept connection and get user info
    user_info = await manager.connect(websocket, room_id)
    user_id = user_info["user_id"]
    is_host = user_info["is_host"]
    
    # Get database session
    db = next(get_db())
    room_service = RoomService(db)
    
    # Verify room exists
    room = room_service.get_room(room_id)
    if not room:
        await websocket.close(code=4004, reason="Room not found")
        return
    
    # Send current room state to newly connected user
    user_count = manager.get_room_user_count(room_id)
    users_list = manager.get_room_users(room_id)
    
    await websocket.send_json({
        "type": "init",
        "code": room.code,
        "language": room.language,
        "roomId": room_id,
        "userCount": user_count,
        "userId": user_id,
        "isHost": is_host,
        "users": users_list
    })
    
    # Notify others that a user joined and send updated user list
    await manager.broadcast(room_id, {
        "type": "user_join",
        "message": "A user joined the room",
        "userCount": user_count,
        "userId": user_id,
        "users": users_list
    }, exclude=websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "code_update":
                # Update room code in database
                new_code = message.get("code", "")
                room_service.update_room_code(room_id, new_code)
                
                # Broadcast to all other users in the room
                await manager.broadcast(room_id, message, exclude=websocket)
            
            elif message.get("type") == "cursor_position":
                # Broadcast cursor position to others
                await manager.broadcast(room_id, message, exclude=websocket)
            
            else:
                # Broadcast any other message type
                await manager.broadcast(room_id, message, exclude=websocket)
    
    except WebSocketDisconnect:
        # Handle disconnection
        disconnected_user_id = manager.disconnect(websocket, room_id)
        
        # Notify others that a user left with updated count and list
        user_count = manager.get_room_user_count(room_id)
        users_list = manager.get_room_users(room_id)
        
        await manager.broadcast(room_id, {
            "type": "user_leave",
            "message": "A user left the room",
            "userCount": user_count,
            "userId": disconnected_user_id,
            "users": users_list
        })
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id)
    
    finally:
        db.close()

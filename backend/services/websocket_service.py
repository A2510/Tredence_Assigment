from fastapi import WebSocket
from typing import Dict, List, Set
import json
import uuid


class WebSocketManager:
    """
    Manages WebSocket connections for real-time collaboration.
    Maintains a mapping of rooms to connected clients.
    """
    
    def __init__(self):
        # Dictionary mapping room_id to list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Track connection count per room
        self.room_user_count: Dict[str, int] = {}
        
        # Track user info: websocket -> {user_id, room_id, is_host}
        self.user_info: Dict[WebSocket, dict] = {}
        
        # Track host per room
        self.room_hosts: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str) -> dict:
        """Accept and register a new WebSocket connection to a room"""
        await websocket.accept()
        
        # Generate unique user ID
        user_id = str(uuid.uuid4())[:8]
        
        # Check if this is the first user (host)
        is_host = room_id not in self.active_connections or len(self.active_connections[room_id]) == 0
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.room_user_count[room_id] = 0
            self.room_hosts[room_id] = user_id
        
        self.active_connections[room_id].append(websocket)
        self.room_user_count[room_id] += 1
        
        # Store user info
        self.user_info[websocket] = {
            "user_id": user_id,
            "room_id": room_id,
            "is_host": is_host
        }
        
        print(f"User {user_id} connected to room {room_id}. Total users: {self.room_user_count[room_id]}")
        
        return {
            "user_id": user_id,
            "is_host": is_host
        }
    
    def disconnect(self, websocket: WebSocket, room_id: str) -> str:
        """Remove a WebSocket connection from a room"""
        user_id = None
        
        if websocket in self.user_info:
            user_id = self.user_info[websocket]["user_id"]
            del self.user_info[websocket]
        
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
                self.room_user_count[room_id] -= 1
                
                print(f"User {user_id} disconnected from room {room_id}. Remaining users: {self.room_user_count[room_id]}")
                
                # Clean up empty rooms
                if len(self.active_connections[room_id]) == 0:
                    del self.active_connections[room_id]
                    del self.room_user_count[room_id]
                    if room_id in self.room_hosts:
                        del self.room_hosts[room_id]
                    print(f"Room {room_id} is now empty and removed")
        
        return user_id
    
    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket = None):
        """
        Broadcast a message to all connections in a room.
        Optionally exclude a specific connection (e.g., the sender).
        """
        if room_id not in self.active_connections:
            return
        
        # Get list of connections to broadcast to
        connections = self.active_connections[room_id]
        
        # Send message to all connections except the excluded one
        disconnected = []
        for connection in connections:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to connection: {e}")
                    disconnected.append(connection)
        
        # Clean up any disconnected connections
        for connection in disconnected:
            self.disconnect(connection, room_id)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    def get_room_user_count(self, room_id: str) -> int:
        """Get the number of users currently in a room"""
        return self.room_user_count.get(room_id, 0)
    
    def get_all_rooms(self) -> List[str]:
        """Get list of all active room IDs"""
        return list(self.active_connections.keys())
    
    def get_room_users(self, room_id: str) -> List[dict]:
        """Get list of all users in a room with their info"""
        if room_id not in self.active_connections:
            return []
        
        users = []
        for ws in self.active_connections[room_id]:
            if ws in self.user_info:
                info = self.user_info[ws]
                users.append({
                    "user_id": info["user_id"],
                    "is_host": info["is_host"]
                })
        return users

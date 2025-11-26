from sqlalchemy.orm import Session
from models import Room
import uuid
import string
import random


class RoomService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_room_id(self, length: int = 8) -> str:
        """Generate a random room ID"""
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for _ in range(length))
    
    def create_room(self, language: str = "python") -> Room:
        """Create a new room with a unique room ID"""
        # Generate unique room ID
        while True:
            room_id = self.generate_room_id()
            existing_room = self.db.query(Room).filter(Room.room_id == room_id).first()
            if not existing_room:
                break
        
        # Create room
        room = Room(
            room_id=room_id,
            language=language,
            code=self._get_default_code(language)
        )
        
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        
        return room
    
    def get_room(self, room_id: str) -> Room:
        """Get room by room ID"""
        return self.db.query(Room).filter(Room.room_id == room_id).first()
    
    def update_room_code(self, room_id: str, code: str) -> Room:
        """Update room code"""
        room = self.get_room(room_id)
        if room:
            room.code = code
            self.db.commit()
            self.db.refresh(room)
        return room
    
    def _get_default_code(self, language: str) -> str:
        """Get default code template based on language"""
        templates = {
            "python": "# Welcome to Real-Time Pair Programming!\n# Start coding here...\n\ndef hello_world():\n    print('Hello, World!')\n",
            "javascript": "// Welcome to Real-Time Pair Programming!\n// Start coding here...\n\nfunction helloWorld() {\n    console.log('Hello, World!');\n}\n",
            "typescript": "// Welcome to Real-Time Pair Programming!\n// Start coding here...\n\nfunction helloWorld(): void {\n    console.log('Hello, World!');\n}\n",
            "java": "// Welcome to Real-Time Pair Programming!\n// Start coding here...\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n",
            "cpp": "// Welcome to Real-Time Pair Programming!\n// Start coding here...\n\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}\n"
        }
        
        return templates.get(language, "# Start coding here...\n")

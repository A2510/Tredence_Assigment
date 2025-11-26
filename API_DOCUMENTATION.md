# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
No authentication required (as per assignment specifications).

## Endpoints

### 1. Root
Get API information.

**Endpoint**: `GET /`

**Response**:
```json
{
  "message": "Real-Time Pair Programming API",
  "version": "1.0.0",
  "endpoints": {
    "create_room": "POST /api/rooms",
    "autocomplete": "POST /api/autocomplete",
    "websocket": "WS /ws/{room_id}"
  }
}
```

### 2. Health Check
Check if API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy"
}
```

### 3. Create Room
Create a new collaborative coding room.

**Endpoint**: `POST /api/rooms`

**Request Body**:
```json
{
  "language": "python"  // Optional: "python", "javascript", "typescript", "java", "cpp"
}
```

**Response** (201 Created):
```json
{
  "roomId": "abc12345",
  "code": "# Welcome to Real-Time Pair Programming!\n# Start coding here...\n\ndef hello_world():\n    print('Hello, World!')\n",
  "language": "python",
  "created_at": "2025-11-26T12:34:56.789Z"
}
```

### 4. Get Room
Retrieve room details by room ID.

**Endpoint**: `GET /api/rooms/{room_id}`

**Parameters**:
- `room_id` (path): The unique room identifier

**Response** (200 OK):
```json
{
  "roomId": "abc12345",
  "code": "print('Hello, World!')",
  "language": "python",
  "created_at": "2025-11-26T12:34:56.789Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Room not found"
}
```

### 5. Autocomplete
Get AI-powered code completion suggestion (mocked).

**Endpoint**: `POST /api/autocomplete`

**Request Body**:
```json
{
  "code": "def hello",
  "cursorPosition": 9,
  "language": "python"
}
```

**Response** (200 OK):
```json
{
  "suggestion": "function_name(param1, param2):\n    pass",
  "confidence": 0.85
}
```

**Confidence Levels**:
- `0.7 - 1.0`: High confidence (exact pattern match)
- `0.5 - 0.69`: Medium confidence (partial match)
- `0.3 - 0.49`: Low confidence (generic suggestion)
- `< 0.3`: Very low (usually not displayed)

### 6. WebSocket Connection
Real-time collaborative coding via WebSocket.

**Endpoint**: `WS /ws/{room_id}`

**Parameters**:
- `room_id` (path): The unique room identifier

**Connection Flow**:
1. Client connects to WebSocket endpoint
2. Server sends initial room state
3. Client sends code updates
4. Server broadcasts to all other clients in room

**Message Types**:

#### Server → Client Messages

**Initial State**:
```json
{
  "type": "init",
  "code": "# Current room code...",
  "language": "python",
  "roomId": "abc12345"
}
```

**Code Update**:
```json
{
  "type": "code_update",
  "code": "print('Updated code')",
  "language": "python"
}
```

**User Joined**:
```json
{
  "type": "user_join",
  "message": "A user joined the room"
}
```

**User Left**:
```json
{
  "type": "user_leave",
  "message": "A user left the room"
}
```

#### Client → Server Messages

**Send Code Update**:
```json
{
  "type": "code_update",
  "code": "print('My code')",
  "language": "python"
}
```

**Send Cursor Position** (optional):
```json
{
  "type": "cursor_position",
  "cursorPosition": 42
}
```

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes
- `200 OK`: Successful GET/POST
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting
No rate limiting implemented in this prototype.

## CORS
All origins are allowed in development mode. Configure for production use.

## Examples

### Python
```python
import requests
import json

# Create room
response = requests.post('http://localhost:8000/api/rooms', 
                        json={'language': 'python'})
room = response.json()
print(f"Room ID: {room['roomId']}")

# Get autocomplete
response = requests.post('http://localhost:8000/api/autocomplete',
                        json={
                            'code': 'def ',
                            'cursorPosition': 4,
                            'language': 'python'
                        })
suggestion = response.json()
print(f"Suggestion: {suggestion['suggestion']}")
```

### JavaScript
```javascript
// Create room
fetch('http://localhost:8000/api/rooms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'python' })
})
  .then(res => res.json())
  .then(data => console.log('Room ID:', data.roomId));

// WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/abc12345');
ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'code_update',
    code: 'console.log("Hello");',
    language: 'javascript'
  }));
};
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### PowerShell
```powershell
# Create room
$body = @{ language = "python" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:8000/api/rooms' `
                              -Method Post `
                              -ContentType 'application/json' `
                              -Body $body
Write-Host "Room ID: $($response.roomId)"

# Get room
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/rooms/$($response.roomId)" `
                              -Method Get
Write-Host "Code: $($response.code)"
```

## Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to test all endpoints directly from your browser.

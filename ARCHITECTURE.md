# Architecture Deep Dive

## System Overview

The Real-Time Pair Programming application is built using a client-server architecture with WebSocket support for real-time synchronization.

```
┌─────────────┐         HTTP/WS          ┌─────────────┐
│   Browser   │◄────────────────────────►│   FastAPI   │
│   (React)   │                          │   Backend   │
└─────────────┘                          └──────┬──────┘
                                                │
                                                │
                                         ┌──────▼──────┐
                                         │  PostgreSQL │
                                         │   Database  │
                                         └─────────────┘
```

## Backend Architecture

### Layer Structure

```
┌──────────────────────────────────────────┐
│         FastAPI Application              │
├──────────────────────────────────────────┤
│  Routers (HTTP/WebSocket Endpoints)      │
│  ├─ rooms.py        (Room CRUD)          │
│  ├─ autocomplete.py (AI Suggestions)     │
│  └─ websocket.py    (Real-time Sync)     │
├──────────────────────────────────────────┤
│  Services (Business Logic)               │
│  ├─ room_service.py                      │
│  ├─ autocomplete_service.py              │
│  └─ websocket_service.py                 │
├──────────────────────────────────────────┤
│  Models & Schemas                        │
│  ├─ models.py       (SQLAlchemy)         │
│  └─ schemas.py      (Pydantic)           │
├──────────────────────────────────────────┤
│  Database Layer                          │
│  └─ database.py     (SQLAlchemy Engine)  │
└──────────────────────────────────────────┘
```

### WebSocket Flow

```
1. Client Connection
   └─> ws.connect('/ws/room123')
       └─> WebSocketManager.connect()
           ├─> Store connection in active_connections
           ├─> Send initial room state
           └─> Broadcast user_join to others

2. Code Update
   └─> Client sends: { type: 'code_update', code: '...' }
       └─> WebSocket handler receives message
           ├─> Update database (room_service)
           └─> Broadcast to all others in room
               └─> WebSocketManager.broadcast()

3. Client Disconnection
   └─> WebSocket closes
       └─> WebSocketManager.disconnect()
           ├─> Remove from active_connections
           └─> Broadcast user_leave to others
```

### Room Service Logic

```python
class RoomService:
    def create_room():
        1. Generate unique room ID (8 chars)
        2. Check uniqueness in database
        3. Create Room model with default code
        4. Save to database
        5. Return room details
    
    def get_room():
        1. Query database by room_id
        2. Return room or None
    
    def update_room_code():
        1. Get room from database
        2. Update code field
        3. Commit to database
        4. Return updated room
```

### Autocomplete Service Logic

```python
class AutocompleteService:
    def get_suggestion(code, cursor, language):
        1. Extract text before cursor
        2. Get last line of code
        3. Match against predefined patterns
        4. Return suggestion with confidence score
        
    Patterns:
        - "def " → function template
        - "class " → class template
        - "if " → if block template
        - "for " → for loop template
        - etc.
```

## Frontend Architecture

### Component Hierarchy

```
App
├─ Router
│  ├─ Home
│  │  └─ Room creation/joining UI
│  └─ Room
│     ├─ CodeEditor
│     │  ├─ Textarea (code input)
│     │  └─ Autocomplete display
│     └─ StatusBar
│        ├─ Connection status
│        └─ User count
```

### State Management (Redux)

```
Store
├─ editorSlice
│  ├─ code: string
│  ├─ language: string
│  ├─ cursorPosition: number
│  ├─ autocompleteSuggestion: string?
│  └─ isLoadingSuggestion: boolean
│
└─ roomSlice
   ├─ roomId: string?
   ├─ isConnected: boolean
   ├─ connectionError: string?
   └─ userCount: number
```

### Data Flow

```
1. User Types in Editor
   └─> handleCodeChange()
       ├─> dispatch(setCode(newCode))
       ├─> sendMessage({ type: 'code_update', code })
       └─> requestAutocomplete(code, cursor)
           └─> debounce 600ms
               └─> API call to /autocomplete
                   └─> dispatch(setAutocompleteSuggestion())

2. Receive WebSocket Message
   └─> useWebSocket hook
       └─> ws.onmessage
           └─> Parse message type
               ├─ 'code_update' → dispatch(setCode())
               ├─ 'user_join' → dispatch(incrementUserCount())
               └─ 'user_leave' → dispatch(decrementUserCount())

3. Accept Autocomplete
   └─> handleKeyDown(Tab/Enter)
       └─> Insert suggestion at cursor
       └─> dispatch(clearAutocompleteSuggestion())
```

## Database Schema

### Rooms Table

```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) UNIQUE NOT NULL,
    code TEXT DEFAULT '# Start coding here...',
    language VARCHAR(20) DEFAULT 'python',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_room_id ON rooms(room_id);
```

## Synchronization Strategy

### Last-Write-Wins (Current Implementation)

```
Time: 0ms        500ms       1000ms
User A: types "hello"        
User B:           types "world"
Result: "world" (B's change overwrites A's)
```

**Pros**:
- Simple to implement
- No complex conflict resolution
- Fast performance

**Cons**:
- Can lose changes
- Not ideal for >2 users
- No merge capability

### Operational Transformation (Future)

```
Time: 0ms        500ms       1000ms
User A: insert("hello", 0)
User B:           insert("world", 0)

Transform:
- A's operation: insert("hello", 0)
- B's operation: insert("world", 0)
  → Transformed: insert("world", 5)

Result: "helloworld"
```

## API Request Flow

### Create Room

```
Client Request
    POST /api/rooms
    { "language": "python" }
        ↓
FastAPI Router (rooms.py)
    @router.post("/rooms")
        ↓
Room Service
    create_room(language)
        ↓
SQLAlchemy ORM
    INSERT INTO rooms...
        ↓
PostgreSQL Database
        ↓
Response
    { "roomId": "abc123", ... }
        ↓
Client
```

### WebSocket Message

```
Client
    ws.send({ type: 'code_update', code: '...' })
        ↓
WebSocket Handler (websocket.py)
    receive_text()
        ↓
Parse JSON
        ↓
Room Service
    update_room_code(room_id, code)
        ↓
Database
    UPDATE rooms SET code = ...
        ↓
WebSocket Manager
    broadcast(room_id, message, exclude=sender)
        ↓
All Other Clients in Room
    ws.send(message)
```

## Performance Considerations

### Current Performance

- **WebSocket Latency**: < 50ms (local network)
- **Database Query**: < 10ms (small dataset)
- **Autocomplete API**: < 100ms (mocked)
- **Room Creation**: < 100ms

### Bottlenecks

1. **Database Updates**: Every code change writes to DB
2. **No Caching**: Room data fetched on every request
3. **Single Server**: No horizontal scaling
4. **No Message Queue**: Direct WebSocket broadcasts

### Optimization Strategies

1. **Batch Database Writes**:
   - Buffer changes in memory
   - Write every 5 seconds or on disconnect
   - Reduces DB load by 90%+

2. **Redis Cache**:
   - Cache room state in Redis
   - Update database asynchronously
   - Sub-millisecond read times

3. **Message Queue (RabbitMQ/Kafka)**:
   - Decouple WebSocket from database
   - Enable horizontal scaling
   - Better reliability

4. **CDN for Frontend**:
   - Serve static assets from CDN
   - Reduce server load
   - Better global performance

## Security Considerations

### Current Security Posture

- ✅ CORS configured (development mode)
- ✅ Pydantic validation on inputs
- ❌ No authentication
- ❌ No authorization
- ❌ No rate limiting
- ❌ No input sanitization
- ❌ No HTTPS enforcement

### Production Security Checklist

1. **Authentication**:
   - JWT tokens
   - OAuth2 integration
   - Session management

2. **Authorization**:
   - Room ownership
   - Access control lists
   - Invite-only rooms

3. **Input Validation**:
   - Sanitize code content
   - Limit message size
   - Rate limiting per user

4. **Network Security**:
   - HTTPS/WSS only
   - CORS whitelist
   - DDoS protection

5. **Data Protection**:
   - Encrypt sensitive data
   - Secure database connections
   - Regular backups

## Monitoring & Observability

### Recommended Metrics

1. **Application Metrics**:
   - Active WebSocket connections
   - Rooms created per minute
   - Average room lifetime
   - Code updates per second

2. **Performance Metrics**:
   - API response time (p50, p95, p99)
   - WebSocket message latency
   - Database query time
   - CPU and memory usage

3. **Business Metrics**:
   - Daily active users
   - Average session duration
   - Popular programming languages
   - Autocomplete acceptance rate

### Logging Strategy

```python
# Structured logging
logger.info("Room created", extra={
    "room_id": room_id,
    "language": language,
    "user_ip": request.client.host
})

logger.error("WebSocket error", extra={
    "room_id": room_id,
    "error": str(e),
    "connection_count": connection_count
})
```

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────┐
│   Cloudflare│  (CDN + DDoS protection)
│     CDN     │
└──────┬──────┘
       │
┌──────▼──────┐
│   Nginx     │  (Reverse proxy + Load balancer)
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│API-1│ │API-2│  (FastAPI instances)
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
┌──────▼──────┐
│   Redis     │  (WebSocket state)
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │  (Persistent storage)
│  (Primary)  │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │  (Replica)
│  (Replica)  │
└─────────────┘
```

## Testing Strategy

### Unit Tests
- Service layer logic
- Autocomplete pattern matching
- Room ID generation
- Message parsing

### Integration Tests
- API endpoints
- Database operations
- WebSocket connections
- State synchronization

### E2E Tests
- Full user flow
- Multi-user scenarios
- Reconnection handling
- Browser compatibility

## Conclusion

This architecture provides a solid foundation for a pair-programming application. The modular design allows for easy extension and maintenance, while the chosen technologies (FastAPI, React, WebSocket) provide excellent developer experience and performance characteristics.

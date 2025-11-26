# Real-Time Pair Programming Application

A full-stack collaborative coding platform that enables real-time pair programming with WebSocket synchronization and AI-powered autocomplete suggestions.

## Features

- **Real-Time Collaboration**: Multiple users can edit code simultaneously in the same room
- **WebSocket Synchronization**: Instant updates across all connected clients
- **AI Autocomplete**: Mocked intelligent code suggestions (600ms debounce)
- **Room Management**: Create and join coding sessions via unique room IDs
- **Persistent Storage**: PostgreSQL database for room state and code persistence
- **Multiple Language Support**: Python, JavaScript, TypeScript, Java, C++
- **Modern UI**: Clean, VS Code-inspired interface
- **Live Status**: Connection status and user count display

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework with async support
- **WebSockets**: Real-time bidirectional communication
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server

## Architecture

### Project Structure

```
assignment/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration and session management
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic schemas for request/response validation
│   ├── routers/
│   │   ├── rooms.py           # Room creation and retrieval endpoints
│   │   ├── autocomplete.py    # AI autocomplete endpoint
│   │   └── websocket.py       # WebSocket connection handler
│   ├── services/
│   │   ├── room_service.py    # Room business logic
│   │   ├── autocomplete_service.py  # Mocked AI suggestion logic
│   │   └── websocket_service.py     # WebSocket connection management
│   ├── requirements.txt        # Python dependencies
│   └── .env.example           # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # Application entry point
│   │   ├── App.tsx            # Root component with routing
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Landing page with room creation/joining
│   │   │   └── Room.tsx       # Collaborative coding room
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx # Main code editor component
│   │   │   └── StatusBar.tsx  # Connection status display
│   │   ├── store/
│   │   │   ├── store.ts       # Redux store configuration
│   │   │   └── slices/
│   │   │       ├── editorSlice.ts  # Editor state management
│   │   │       └── roomSlice.ts    # Room connection state
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts     # WebSocket connection hook
│   │   │   └── useAutocomplete.ts  # Autocomplete logic hook
│   │   └── services/
│   │       └── api.ts         # API client functions
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

### Architecture Design

#### Backend Architecture

1. **Layered Architecture**:
   - **Routers**: Handle HTTP/WebSocket requests and responses
   - **Services**: Business logic and data operations
   - **Models**: Database schema definitions
   - **Schemas**: Request/response validation

2. **WebSocket Manager**:
   - Maintains active connections per room
   - Broadcasts messages to all room participants
   - Handles connection/disconnection events
   - Implements last-write-wins synchronization

3. **Database Layer**:
   - SQLAlchemy ORM for type-safe queries
   - Automatic table creation on startup
   - PostgreSQL primary relational database

#### Frontend Architecture

1. **Component-Based Design**:
   - Reusable React components
   - Custom hooks for business logic
   - Separation of concerns (UI vs logic)

2. **State Management**:
   - Redux Toolkit for global state
   - Slices for editor and room state
   - Actions for state mutations

3. **Real-Time Communication**:
   - Custom useWebSocket hook
   - Automatic reconnection on disconnect
   - Message type-based routing

## Setup Instructions

### Option 1: Docker (Recommended - Easiest!)

**Prerequisites:**
- Docker Desktop installed and running

**Quick Start:**
```powershell
# One command to run everything!
docker-compose up --build
```

That's it! The application will be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

Or use the automated script:
```powershell
.\docker-start.ps1
```

**See [DOCKER.md](DOCKER.md) for complete Docker documentation.**

---

### Option 2: Manual Setup

**Prerequisites:**
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and update the `DATABASE_URL` (example: `postgresql://username:password@localhost:5432/pairprogramming`).

6. **Create PostgreSQL database**:
   ```bash
   createdb pairprogramming
   ```

7. **Run the server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at: `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` if your backend is not on `http://localhost:8000`

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The application will be available at: `http://localhost:3000`

## Usage

### Creating a Room

1. Open the application at `http://localhost:3000`
2. Click "Create Room" button
3. You'll be redirected to a new room with a unique ID
4. Share the room ID or URL with collaborators

### Joining a Room

1. Open the application
2. Enter the room ID in the "Join Existing Room" section
3. Click "Join Room"
4. Start coding collaboratively!

### Using Autocomplete

1. Start typing in the code editor
2. After 600ms of inactivity, autocomplete suggestions appear
3. Press `Tab` or `Enter` to accept the suggestion
4. Press `Escape` to dismiss

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms/{room_id}` | Get room details |
| POST | `/api/autocomplete` | Get autocomplete suggestion |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `/ws/{room_id}` | WebSocket connection for real-time collaboration |

### Request/Response Examples

**Create Room**:
```bash
POST /api/rooms
Content-Type: application/json

{
  "language": "python"
}

Response:
{
  "roomId": "abc123",
  "code": "# Welcome to Real-Time Pair Programming!...",
  "language": "python",
  "created_at": "2025-11-26T12:00:00Z"
}
```

**Autocomplete**:
```bash
POST /api/autocomplete
Content-Type: application/json

{
  "code": "def ",
  "cursorPosition": 4,
  "language": "python"
}

Response:
{
  "suggestion": "function_name(param1, param2):\n    pass",
  "confidence": 0.85
}
```

**WebSocket Messages**:
```json
// Code Update
{
  "type": "code_update",
  "code": "print('Hello, World!')",
  "language": "python"
}

// User Join
{
  "type": "user_join",
  "message": "A user joined the room"
}

// User Leave
{
  "type": "user_leave",
  "message": "A user left the room"
}
```

## Testing

### Testing Backend with Postman/cURL

1. **Create a room**:
   ```bash
   curl -X POST http://localhost:8000/api/rooms \
     -H "Content-Type: application/json" \
     -d '{"language": "python"}'
   ```

2. **Get autocomplete**:
   ```bash
   curl -X POST http://localhost:8000/api/autocomplete \
     -H "Content-Type: application/json" \
     -d '{"code": "def ", "cursorPosition": 4, "language": "python"}'
   ```

3. **Test WebSocket** (using websocat or browser console):
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/ws/abc123');
   ws.onmessage = (event) => console.log(event.data);
   ws.send(JSON.stringify({
     type: 'code_update',
     code: 'print("test")',
     language: 'python'
   }));
   ```

## Design Decisions

### Backend Design

1. **FastAPI over Flask/Django**:
   - Native async/await support
   - Built-in WebSocket support
   - Automatic API documentation
   - High performance with Uvicorn

2. **Service Layer Pattern**:
   - Separation of business logic from routing
   - Easier testing and maintenance
   - Reusable service methods

3. **Last-Write-Wins Synchronization**:
   - Simple and effective for MVP
   - No complex Operational Transformation needed
   - Acceptable for 2-3 concurrent users

4. **In-Memory WebSocket State + Database Persistence**:
   - Fast real-time updates in memory
   - Database for persistence and recovery
   - Hybrid approach for best performance

### Frontend Design

1. **Redux Toolkit over Context API**:
   - Better dev tools
   - More predictable state updates
   - Easier to debug and test

2. **Custom Hooks Pattern**:
   - Reusable WebSocket logic
   - Separation of concerns
   - Cleaner component code

3. **Debounced Autocomplete**:
   - 600ms delay prevents excessive API calls
   - Better user experience
   - Reduced server load

4. **Textarea over Monaco Editor**:
   - Lighter weight for MVP
   - Faster implementation
   - Easier to customize

## Improvements with More Time

### High Priority

1. **Operational Transformation (OT) or CRDT**:
   - Proper conflict resolution
   - Support for simultaneous edits
   - Better handling of concurrent changes

2. **Authentication & Authorization**:
   - User accounts and login
   - Room ownership and permissions
   - Access control lists

3. **Enhanced Code Editor**:
   - Syntax highlighting with Monaco Editor or CodeMirror
   - Line numbers
   - Code folding
   - Multiple file support

4. **Real AI Autocomplete**:
   - Integration with OpenAI Codex or GitHub Copilot
   - Context-aware suggestions
   - Multi-line completions

### Medium Priority

5. **Cursor Position Sharing**:
   - Show other users' cursors
   - Display user names/colors
   - Selection highlighting

6. **Chat Feature**:
   - Built-in messaging
   - Code snippet sharing
   - Voice/video call integration

7. **Code Execution**:
   - In-browser code runner
   - Support for multiple languages
   - Output display

8. **Room Persistence Controls**:
   - Room expiration settings
   - Archive old rooms
   - Export code history

### Low Priority

9. **Testing**:
   - Unit tests for services
   - Integration tests for API
   - E2E tests for UI
   - WebSocket connection tests

10. **Performance Optimizations**:
    - Redis for WebSocket state
    - CDN for frontend assets
    - Database indexing
    - Connection pooling

11. **Monitoring & Logging**:
    - Application metrics
    - Error tracking (Sentry)
    - Performance monitoring
    - Usage analytics

12. **Deployment**:
    - Docker containers
    - Kubernetes orchestration
    - CI/CD pipeline
    - Production environment setup

## Known Limitations

1. **Concurrent Editing**:
   - Uses simple last-write-wins strategy
   - No conflict resolution for simultaneous edits
   - May lose changes if multiple users type at once

2. **Scalability**:
   - In-memory WebSocket state doesn't scale horizontally
   - No load balancing for WebSocket connections
   - Single server limitation

3. **Basic Code Editor**:
   - No syntax highlighting
   - No line numbers
   - Limited editor features

4. **Mocked Autocomplete**:
   - Rule-based suggestions only
   - No machine learning
   - Limited context awareness

5. **No Authentication**:
   - Anyone can join any room
   - No user identification
   - No permission system

6. **Room Cleanup**:
   - Rooms persist indefinitely
   - No automatic cleanup
   - Database can grow large

7. **Network Issues**:
   - Basic reconnection logic
   - No offline support
   - No conflict resolution after disconnect

8. **Browser Compatibility**:
   - Tested only on Chrome/Edge
   - May have issues on older browsers
   - No mobile optimization

## Troubleshooting

### Backend Issues

**Database Connection Error**:
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Confirm the `DATABASE_URL` points to the running PostgreSQL instance

**WebSocket Connection Failed**:
- Ensure CORS is properly configured
- Check firewall settings
- Verify port 8000 is not in use

### Frontend Issues

**Cannot Connect to Backend**:
- Verify backend is running on port 8000
- Check `.env` file has correct API URL
- Clear browser cache

**Autocomplete Not Working**:
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure code editor has focus

## License

This project is created for educational and assessment purposes.



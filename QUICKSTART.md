
# Quick Start Guide

## Fastest Way to Run (Docker)

If Docker Desktop is installed, bring up the whole stack with one command:

```powershell
docker-compose up --build
```

Useful follow-up commands:

```powershell
# Run in background
docker-compose up -d

# View aggregated logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

Prefer a scripted start on Windows?

```powershell
./docker-start.ps1
```

The app will be live at http://localhost:3000 (frontend) and http://localhost:8000 (backend).



## Test the Application

1. Open `http://localhost:3000`
2. Click "Create Room"
3. Open another browser window/tab
4. Copy the room ID and join from the second window
5. Type in one window - see updates in the other

## API Testing

### Using Browser Dev Console

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/YOUR_ROOM_ID');
ws.onmessage = (e) => console.log('Received:', e.data);
ws.onopen = () => console.log('Connected!');
ws.send(JSON.stringify({
  type: 'code_update',
  code: 'print("Hello from console!")',
  language: 'python'
}));
```

### Using PowerShell (curl alternative)

```powershell
# Create Room
Invoke-RestMethod -Uri 'http://localhost:8000/api/rooms' -Method Post -ContentType 'application/json' -Body '{"language":"python"}'

# Get Autocomplete
Invoke-RestMethod -Uri 'http://localhost:8000/api/autocomplete' -Method Post -ContentType 'application/json' -Body '{"code":"def ","cursorPosition":4,"language":"python"}'
```

## Common Issues

### Port Already in Use

Backend:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Frontend:
```
Vite automatically tries the next available port
```

### PostgreSQL Connection Refused

```powershell
# Verify container/service is running
psql -U postgres -h localhost -c "\l" "postgres"

# Double-check DATABASE_URL in backend/.env
```

### Module Import Errors

Make sure you're in the correct directory:
- Backend commands run from `/backend`
- Frontend commands run from `/frontend`

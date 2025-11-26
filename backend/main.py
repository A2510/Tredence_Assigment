from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import rooms, autocomplete, websocket
from database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Real-Time Pair Programming API",
    description="A collaborative coding platform with WebSocket support",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms.router, prefix="/api", tags=["rooms"])
app.include_router(autocomplete.router, prefix="/api", tags=["autocomplete"])
app.include_router(websocket.router, tags=["websocket"])


@app.get("/")
async def root():
    return {
        "message": "Real-Time Pair Programming API",
        "version": "1.0.0",
        "endpoints": {
            "create_room": "POST /api/rooms",
            "autocomplete": "POST /api/autocomplete",
            "websocket": "WS /ws/{room_id}"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

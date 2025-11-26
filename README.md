# Real-Time Pair Programming Application

Lightweight FastAPI + React stack for synchronous pair programming with mocked autocomplete.

## How to Run the Services

- **Docker (recommended)**: `docker-compose up --build` (or `./docker-start.ps1`). This starts PostgreSQL, FastAPI on `:8000`, and the React build behind Nginx on `:3000`.
- **Manual backend**: `cd backend`, create/activate venv, `pip install -r requirements.txt`, copy `.env.example` to `.env` and point `DATABASE_URL` at PostgreSQL, `createdb pairprogramming`, run `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.
- **Manual frontend**: `cd frontend`, `npm install`, `npm run dev`, then browse to `http://localhost:3000`.

## Architecture & Design

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL. Routes call service classes, WebSocket manager broadcasts real-time edits, persistence handled through a single `Room` model.
- **Frontend**: React + TypeScript + Redux Toolkit. `Home` creates/joins rooms, `Room` hosts a textarea editor, WebSocket hook pushes edits, state kept in `editorSlice` and `roomSlice`.
- **Communication**: REST for room CRUD/autocomplete, WebSocket `/ws/{roomId}` for real-time code + presence. Last-write-wins avoids complex CRDTs for this MVP.

## Improvements with More Time

1. Real operational-transform or CRDT engine so simultaneous edits never clobber each other.
2. Authentication/authorization and named participants (host, guests) with role-based controls.
3. Replace textarea with Monaco/CodeMirror including syntax highlighting, tabs, and shared cursors.
4. Swap mocked autocomplete for an actual model integration (OpenAI/Copilot-like experience).
5. Hardening: automated tests, CI/CD, logging/metrics, and a deployable Kubernetes/GitOps story.

## Known Limitations

1. Last-write-wins means concurrent typing can overwrite text.
2. Single FastAPI instance keeps WebSocket state in memory; no horizontal scaling.
3. Autocomplete is mocked/deterministic and only runs after a 600 ms debounce.
4. No authentication—anyone with a room URL can connect; rooms never expire.
5. Editor is plain text: no syntax highlighting, no cursor sharing, no history/undo sync.



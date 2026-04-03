# Project Context & Coding Guidelines

This file serves as a global state and rules reference for the AI and developers working on this project. 
Always refer to this to avoid repeating past mistakes.

### 1. FastAPI Routing & Trailing Slashes (CORS Issues)
When configuring endpoints in FastAPI via an `APIRouter` with a defined prefix (e.g., `prefix="/api/v1/chat"`), **avoid using `@router.post("/")`** unless explicitly matching a URL that physically includes a trailing slash from the client.
- **Why:** `router.post("/")` registers the route strictly as `/api/v1/chat/`. If the frontend (Axios/Fetch) queries `/api/v1/chat` (without the trailing slash), FastAPI defaults to sending a `307 Temporary Redirect`.
- **The Issue:** A 307 redirect on POST requests without explicit CORS headers will fail the browser's preflight checks, causing the frontend request to silently hang or fail without clear logs.
- **The Fix:** Use `@router.post("")` to match exactly the non-trailing slash prefix, or explicitly ensure the frontend's request URL ends with a trailing slash.

### 2. Backend Service Migrations & Thread Locking
When changing `.env` secrets or completing library migrations (e.g. from Gemini to Groq API) for the backend:
- Always ensure the Uvicorn/Python server is cleanly restarted.
- Lingering background `python` processes from old test runs can keep ports bound (like Port 8000), while internally deadlocked (e.g., hanging on synchronous AMQP connection setups or missing config states), leading to complete application unresponsiveness.
- Do a full process cleanup (`taskkill /F /IM python.exe` on Windows if working locally) before starting the updated development server.

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import analysis, reports, technicians, repair_requests

settings = get_settings()

app = FastAPI(
    title="RepairConnect API",
    description="AI-powered repair assistance platform backend.",
    version="1.0.0",
)

# ---- CORS -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Static files (processed images in demo/local mode) ---------------
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(os.path.join(STATIC_DIR, "processed"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ---- Routers ------------------------------------------------------------
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(technicians.router)
app.include_router(repair_requests.router)


# ---- Global error handling: never leak raw tracebacks to the frontend ---
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again in a moment."},
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_mode": "live" if settings.gemini_available else "demo",
        "database_mode": "supabase" if settings.supabase_available else "in_memory",
        "maps_mode": "google_maps" if settings.maps_available else "sample_data_fallback",
    }


@app.get("/")
def root():
    return {"message": "RepairConnect API is running. See /docs for API documentation."}

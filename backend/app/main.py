from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, SessionLocal
from app.services.seed_service import seed_database
from app.api import health, records, reconcile

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions: Initialize database tables & seed initial demo data
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RECORD FUSE — Duplicate Patient Record Merge Without Timeline Loss",
    lifespan=lifespan
)

# Configure CORS for React frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, tags=["Health"])
app.include_router(records.router)
app.include_router(reconcile.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to RECORD FUSE API",
        "health_check": "/health",
        "records_api": "/api/records",
        "reconcile_api": "/api/reconcile",
        "seed_api": "/api/records/seed",
        "documentation": "/docs"
    }

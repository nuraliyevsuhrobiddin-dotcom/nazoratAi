from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import create_indexes
from app.routers import auth, places, reports, stats


logger = logging.getLogger(__name__)
app = FastAPI(title="Nazorat AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    try:
        await create_indexes()
    except Exception as exc:
        logger.warning("Database indexes were not created during startup: %s", exc)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(places.router)
app.include_router(stats.router)

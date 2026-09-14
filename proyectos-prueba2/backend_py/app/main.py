"""Entrypoint FastAPI -- equivalente a backend/src/index.js."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .notas_router import router as notas_router

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notas_router, prefix="/api/notas")

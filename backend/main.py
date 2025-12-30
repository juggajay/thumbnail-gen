from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

app = FastAPI(title="Thumbnail Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from routes.templates import router as templates_router
from routes.generate import router as generate_router
app.include_router(templates_router)
app.include_router(generate_router)

# Serve static files (assets and outputs)
data_dir = Path(os.getenv("DATA_DIR", "./data"))
if (data_dir / "assets").exists():
    app.mount("/static/assets", StaticFiles(directory=data_dir / "assets"), name="assets")
if (data_dir / "outputs").exists():
    app.mount("/static/outputs", StaticFiles(directory=data_dir / "outputs"), name="outputs")


@app.get("/health")
def health_check():
    return {"status": "healthy"}

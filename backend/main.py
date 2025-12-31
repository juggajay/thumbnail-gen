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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        os.getenv("FRONTEND_URL", ""),  # Railway frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from routes.templates import router as templates_router
from routes.assets import router as assets_router
from routes.outputs import router as outputs_router
from routes.generate import router as generate_router
from routes.analyze import router as analyze_router

app.include_router(templates_router)
app.include_router(assets_router)
app.include_router(outputs_router)
app.include_router(generate_router)
app.include_router(analyze_router)

# Ensure data directories exist
data_dir = Path(os.getenv("DATA_DIR", "./data"))
(data_dir / "templates").mkdir(parents=True, exist_ok=True)
(data_dir / "assets" / "backgrounds").mkdir(parents=True, exist_ok=True)
(data_dir / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
(data_dir / "assets" / "overlays").mkdir(parents=True, exist_ok=True)
(data_dir / "assets" / "subjects").mkdir(parents=True, exist_ok=True)
(data_dir / "assets" / "keeper").mkdir(parents=True, exist_ok=True)
(data_dir / "outputs").mkdir(parents=True, exist_ok=True)

# Serve static files (assets and outputs)
app.mount("/static/assets", StaticFiles(directory=data_dir / "assets"), name="assets")
app.mount("/static/outputs", StaticFiles(directory=data_dir / "outputs"), name="outputs")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

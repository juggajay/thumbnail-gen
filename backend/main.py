from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routes.outputs import router as outputs_router

load_dotenv()

app = FastAPI(title="Thumbnail Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(outputs_router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}

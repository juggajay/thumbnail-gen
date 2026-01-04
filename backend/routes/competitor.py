from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.competitor_analyzer import competitor_analyzer

router = APIRouter(prefix="/api/competitor", tags=["competitor"])


class AnalyzeChannelRequest(BaseModel):
    channel_id: str
    channel_name: str
    max_videos: int = 50


@router.post("/analyze")
async def analyze_channel(request: AnalyzeChannelRequest):
    """Analyze a competitor channel's thumbnails."""
    if not competitor_analyzer.is_available():
        raise HTTPException(
            status_code=503,
            detail="Competitor analysis not available. Set GEMINI_API_KEY."
        )

    result = await competitor_analyzer.analyze_channel(
        request.channel_id,
        request.channel_name,
        request.max_videos
    )
    return result


@router.get("/niche/{niche}")
async def get_niche_profile(niche: str):
    """Get a stored niche profile."""
    profile = competitor_analyzer.load_niche_profile(niche)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Niche profile '{niche}' not found")
    return profile


@router.get("/niches")
async def list_niches():
    """List all available niche profiles."""
    return {"niches": competitor_analyzer.list_niches()}

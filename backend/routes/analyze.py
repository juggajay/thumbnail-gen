from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import base64

from services.thumbnail_analyzer import thumbnail_analyzer

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


class AnalysisContext(BaseModel):
    niche: str = "general"
    target_audience: str = "general YouTube viewers"
    channel_style: str = "not specified"
    competitors: str = ""
    video_title: str = ""
    target_emotion: str = "curiosity"


class AnalyzeRequest(BaseModel):
    image: str  # base64 encoded PNG
    context: Optional[AnalysisContext] = None


@router.post("")
async def analyze_thumbnail(request: AnalyzeRequest):
    """Analyze a thumbnail image for CTR optimization."""
    # 1. Check if analyzer is available (API key configured)
    if not thumbnail_analyzer.is_available():
        raise HTTPException(
            status_code=503,
            detail="Thumbnail analysis not available. Set GEMINI_API_KEY in environment."
        )

    # 2. Decode base64 image
    try:
        image_bytes = base64.b64decode(request.image)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 image data: {str(e)}"
        )

    # Validate that we got actual image data
    if len(image_bytes) < 100:
        raise HTTPException(
            status_code=400,
            detail="Image data is too small to be a valid image"
        )

    # 3. Extract context parameters
    context = request.context or AnalysisContext()

    # 4. Call thumbnail_analyzer.analyze() with context
    try:
        result = await thumbnail_analyzer.analyze(
            image_bytes=image_bytes,
            niche=context.niche if context.niche != "general" else None,
            target_audience=context.target_audience if context.target_audience != "general YouTube viewers" else None,
            channel_style=context.channel_style if context.channel_style != "not specified" else None,
            competitors=context.competitors if context.competitors else None,
            video_title=context.video_title if context.video_title else None,
            target_emotion=context.target_emotion if context.target_emotion != "curiosity" else None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

    # 5. Check for error in result
    if result.get("error") and result.get("error_message"):
        raise HTTPException(
            status_code=500,
            detail=result.get("error_message", "Unknown analysis error")
        )

    return result

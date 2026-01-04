from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.headline_scorer import headline_scorer

router = APIRouter(prefix="/api/headline", tags=["headline"])


class HeadlineScoreRequest(BaseModel):
    text: str
    niche: Optional[str] = None


class HeadlineScoreResponse(BaseModel):
    overall_score: int
    length_score: int
    readability_score: int
    power_words_score: int
    issues: list[str]
    suggestions: list[str]


@router.post("/score", response_model=HeadlineScoreResponse)
async def score_headline(request: HeadlineScoreRequest):
    """Score a hook/headline text for CTR optimization."""
    # TODO: Load niche profile if niche is provided
    niche_profile = None

    result = headline_scorer.score(request.text, niche_profile)

    return HeadlineScoreResponse(
        overall_score=result.overall_score,
        length_score=result.length_score,
        readability_score=result.readability_score,
        power_words_score=result.power_words_score,
        issues=result.issues,
        suggestions=result.suggestions
    )

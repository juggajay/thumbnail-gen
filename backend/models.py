from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class ZonePosition(BaseModel):
    x: int
    y: int
    width: int
    height: int


class TextSize(BaseModel):
    min: int = 48
    max: int = 96
    auto: bool = True


class TextEffects(BaseModel):
    stroke_color: str = "#000000"
    stroke_width: int = 4
    shadow_color: str = "#000000"
    shadow_blur: int = 8
    shadow_offset: tuple[int, int] = (2, 2)


class TextZone(BaseModel):
    type: Literal["text"] = "text"
    position: ZonePosition
    font: str = "Impact"
    size: TextSize = TextSize()
    color_rules: dict[str, str] = {"default": "#FFFFFF"}
    effects: TextEffects = TextEffects()


class BadgeZone(BaseModel):
    type: Literal["badge"] = "badge"
    position: ZonePosition
    variants: dict[str, str] = {}
    visible_when: Optional[str] = None


class ImageZone(BaseModel):
    type: Literal["image"] = "image"
    position: ZonePosition
    mapping: dict[str, str] = {}


class AIConfig(BaseModel):
    prompt_template: str = ""
    negative_prompt: str = "text, words, watermark, blurry"
    fallback_prompt: str = "abstract dark background"


class BackgroundConfig(BaseModel):
    mode: Literal["fixed", "ai"] = "fixed"
    fixed_images: list[str] = []
    selection: Literal["first", "rotate", "random"] = "first"
    ai_config: AIConfig = AIConfig()


class CanvasConfig(BaseModel):
    width: int = 1280
    height: int = 720


class Template(BaseModel):
    id: str
    name: str
    pipeline: str
    version: int = 1
    canvas: CanvasConfig = CanvasConfig()
    background: BackgroundConfig = BackgroundConfig()
    zones: dict[str, TextZone | BadgeZone | ImageZone] = {}
    overlays: list[str] = []
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class TemplateCreate(BaseModel):
    name: str
    pipeline: str


class GenerateRequest(BaseModel):
    template_id: str
    episode_id: str
    data: dict
    variants: int = 1
    webhook_url: Optional[str] = None


class GenerateResponse(BaseModel):
    job_id: str
    status: str
    outputs: list[dict] = []

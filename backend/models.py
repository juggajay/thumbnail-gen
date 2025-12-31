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


class TextBackground(BaseModel):
    enabled: bool = False
    color: str = "#000000"
    opacity: float = 0.7
    padding: int = 20
    border_radius: int = 0


class TextZone(BaseModel):
    type: Literal["text"] = "text"
    position: ZonePosition
    font: str = "Impact"
    size: TextSize = TextSize()
    color_rules: dict[str, str] = {"default": "#FFFFFF"}
    effects: TextEffects = TextEffects()
    # Layout mode
    layout_mode: Literal["horizontal", "stacked-words", "stacked-chars", "rotated"] = "horizontal"
    rotation: int = 0  # degrees, only used when layout_mode is "rotated"
    align: Literal["left", "center", "right"] = "center"
    valign: Literal["top", "middle", "bottom"] = "middle"
    # Typography
    letter_spacing: int = 0  # extra pixels between characters
    line_height: float = 1.2  # multiplier for multi-line text
    stack_gap: int = 0  # extra pixels between stacked words/chars
    transform: Literal["none", "uppercase", "lowercase"] = "none"
    # Visual
    opacity: float = 1.0  # 0.0 to 1.0
    text_background: TextBackground = TextBackground()


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
    # Background positioning
    offset_x: int = 0  # horizontal offset in pixels (positive = move image right, content appears to shift left)
    offset_y: int = 0  # vertical offset in pixels (positive = move image down, content appears to shift up)
    scale: float = 1.0  # scale multiplier (1.0 = fit to canvas, >1 = zoom in)


class CanvasConfig(BaseModel):
    width: int = 1280
    height: int = 720


class SubjectConfig(BaseModel):
    """Foreground subject layer - PNG with transparency that sits between background and text"""
    enabled: bool = False
    image: str = ""  # filename of the subject PNG
    # Positioning (relative to canvas center)
    offset_x: int = 0
    offset_y: int = 0
    scale: float = 1.0  # 1.0 = original size
    # Optional adjustments
    flip_horizontal: bool = False
    opacity: float = 1.0


class Template(BaseModel):
    id: str
    name: str
    pipeline: str
    version: int = 1
    canvas: CanvasConfig = CanvasConfig()
    background: BackgroundConfig = BackgroundConfig()
    subject: SubjectConfig = SubjectConfig()  # Foreground layer (PNG cutout)
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

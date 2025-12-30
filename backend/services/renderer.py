from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
from typing import Optional
import io
import os

from models import Template, TextZone, BadgeZone, ImageZone
from services.storage import storage


class RendererService:
    def __init__(self):
        self.default_font = "arial.ttf"
        self.fonts_cache: dict[str, ImageFont.FreeTypeFont] = {}

    def render(
        self,
        template: Template,
        episode_data: dict,
        background_override: Optional[str] = None,
    ) -> bytes:
        # Create canvas
        canvas = Image.new("RGB", (template.canvas.width, template.canvas.height), "#1a1a1a")

        # Load background
        background = self._load_background(template, background_override)
        if background:
            background = background.resize((template.canvas.width, template.canvas.height))
            canvas.paste(background, (0, 0))

        # Render zones
        draw = ImageDraw.Draw(canvas)

        for zone_name, zone in template.zones.items():
            value = episode_data.get(zone_name, "")

            if isinstance(zone, TextZone) or (isinstance(zone, dict) and zone.get("type") == "text"):
                zone_obj = zone if isinstance(zone, TextZone) else TextZone(**zone)
                self._render_text_zone(canvas, draw, zone_obj, value, episode_data)
            elif isinstance(zone, BadgeZone) or (isinstance(zone, dict) and zone.get("type") == "badge"):
                zone_obj = zone if isinstance(zone, BadgeZone) else BadgeZone(**zone)
                self._render_badge_zone(canvas, zone_obj, value, episode_data)
            elif isinstance(zone, ImageZone) or (isinstance(zone, dict) and zone.get("type") == "image"):
                zone_obj = zone if isinstance(zone, ImageZone) else ImageZone(**zone)
                self._render_image_zone(canvas, zone_obj, value)

        # Apply overlays
        canvas = self._apply_overlays(canvas, template.overlays)

        # Export to bytes
        buffer = io.BytesIO()
        canvas.save(buffer, format="PNG", quality=95)
        buffer.seek(0)
        return buffer.getvalue()

    def _load_background(self, template: Template, override: Optional[str] = None) -> Optional[Image.Image]:
        bg_config = template.background

        if override:
            path = storage.get_asset_path("backgrounds", override)
            if path:
                return Image.open(path).convert("RGB")

        if bg_config.mode == "fixed" and bg_config.fixed_images:
            filename = bg_config.fixed_images[0]
            path = storage.get_asset_path("backgrounds", filename)
            if path:
                return Image.open(path).convert("RGB")

        return None

    def _render_text_zone(
        self,
        canvas: Image.Image,
        draw: ImageDraw.Draw,
        zone: TextZone,
        value: str,
        episode_data: dict,
    ):
        if not value:
            return

        # Determine color based on rules
        color = zone.color_rules.get("default", "#FFFFFF")
        for key, rule_color in zone.color_rules.items():
            if key != "default" and episode_data.get("severity") == key:
                color = rule_color
                break

        # Get font
        font = self._get_font(zone.font, zone.size.max)

        # Auto-size text if enabled
        if zone.size.auto:
            font = self._auto_size_font(
                value,
                zone.font,
                zone.size.min,
                zone.size.max,
                zone.position.width,
            )

        # Calculate position (center in zone)
        bbox = draw.textbbox((0, 0), value, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = zone.position.x + (zone.position.width - text_width) // 2
        y = zone.position.y + (zone.position.height - text_height) // 2

        # Draw stroke (outline)
        if zone.effects.stroke_width > 0:
            for dx in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                for dy in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                    if dx != 0 or dy != 0:
                        draw.text(
                            (x + dx, y + dy),
                            value,
                            font=font,
                            fill=zone.effects.stroke_color,
                        )

        # Draw main text
        draw.text((x, y), value, font=font, fill=color)

    def _render_badge_zone(
        self,
        canvas: Image.Image,
        zone: BadgeZone,
        value: str,
        episode_data: dict,
    ):
        if zone.visible_when:
            severity = episode_data.get("severity", "")
            if "CRITICAL" in zone.visible_when and severity != "CRITICAL":
                if "HIGH" in zone.visible_when and severity != "HIGH":
                    return

        badge_file = zone.variants.get(value, zone.variants.get("default"))
        if not badge_file:
            return

        path = storage.get_asset_path("overlays", badge_file)
        if not path:
            return

        badge = Image.open(path).convert("RGBA")
        canvas.paste(badge, (zone.position.x, zone.position.y), badge)

    def _render_image_zone(
        self,
        canvas: Image.Image,
        zone: ImageZone,
        value: str,
    ):
        image_file = zone.mapping.get(value, zone.mapping.get("default"))
        if not image_file:
            return

        path = storage.get_asset_path("backgrounds", image_file)
        if not path:
            return

        img = Image.open(path).convert("RGBA")
        img = img.resize((zone.position.width, zone.position.height))
        canvas.paste(img, (zone.position.x, zone.position.y), img)

    def _apply_overlays(self, canvas: Image.Image, overlays: list[str]) -> Image.Image:
        for overlay in overlays:
            if overlay == "vignette" or overlay == "vignette_subtle":
                canvas = self._apply_vignette(canvas, strength=0.3 if "subtle" in overlay else 0.5)
            elif overlay == "grain":
                canvas = self._apply_grain(canvas)
        return canvas

    def _apply_vignette(self, image: Image.Image, strength: float = 0.5) -> Image.Image:
        width, height = image.size
        mask = Image.new("L", (width, height), 255)
        draw = ImageDraw.Draw(mask)
        center_x, center_y = width // 2, height // 2
        max_radius = (center_x ** 2 + center_y ** 2) ** 0.5

        for i in range(int(max_radius), 0, -1):
            alpha = int(255 * (1 - (i / max_radius) ** 2 * strength))
            draw.ellipse(
                [center_x - i, center_y - i, center_x + i, center_y + i],
                fill=alpha,
            )

        vignette = Image.new("RGB", (width, height), (0, 0, 0))
        result = Image.composite(image, vignette, mask)
        return result

    def _apply_grain(self, image: Image.Image, amount: float = 0.1) -> Image.Image:
        import random
        pixels = image.load()
        width, height = image.size

        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y][:3]
                noise = random.randint(-int(255 * amount), int(255 * amount))
                r = max(0, min(255, r + noise))
                g = max(0, min(255, g + noise))
                b = max(0, min(255, b + noise))
                pixels[x, y] = (r, g, b)

        return image

    def _get_font(self, font_name: str, size: int) -> ImageFont.FreeTypeFont:
        cache_key = f"{font_name}_{size}"
        if cache_key in self.fonts_cache:
            return self.fonts_cache[cache_key]

        custom_path = storage.get_asset_path("fonts", f"{font_name}.ttf")
        if custom_path:
            font = ImageFont.truetype(str(custom_path), size)
        else:
            try:
                font = ImageFont.truetype(font_name, size)
            except OSError:
                try:
                    font = ImageFont.truetype("arial.ttf", size)
                except OSError:
                    font = ImageFont.load_default()

        self.fonts_cache[cache_key] = font
        return font

    def _auto_size_font(
        self,
        text: str,
        font_name: str,
        min_size: int,
        max_size: int,
        max_width: int,
    ) -> ImageFont.FreeTypeFont:
        for size in range(max_size, min_size - 1, -2):
            font = self._get_font(font_name, size)
            bbox = font.getbbox(text)
            text_width = bbox[2] - bbox[0]
            if text_width <= max_width:
                return font
        return self._get_font(font_name, min_size)


# Singleton
renderer = RendererService()

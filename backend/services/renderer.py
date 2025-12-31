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

        # Load background with offset and scale
        background = self._load_background(template, background_override)
        if background:
            bg_config = template.background
            offset_x = getattr(bg_config, 'offset_x', 0) or 0
            offset_y = getattr(bg_config, 'offset_y', 0) or 0
            bg_scale = getattr(bg_config, 'scale', 1.0) or 1.0

            # Calculate scaled dimensions
            canvas_w, canvas_h = template.canvas.width, template.canvas.height
            scaled_w = int(canvas_w * bg_scale)
            scaled_h = int(canvas_h * bg_scale)

            # Resize background to scaled dimensions
            background = background.resize((scaled_w, scaled_h), Image.LANCZOS)

            # Calculate paste position (centered with offset)
            paste_x = (canvas_w - scaled_w) // 2 + offset_x
            paste_y = (canvas_h - scaled_h) // 2 + offset_y

            # Paste background (handles negative positions and overflow)
            canvas.paste(background, (paste_x, paste_y))

        # Render subject layer (foreground PNG between background and text)
        self._render_subject(canvas, template)

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

    def _render_subject(self, canvas: Image.Image, template: Template):
        """Render the subject layer (PNG cutout between background and text)."""
        subject = getattr(template, 'subject', None)
        if not subject:
            return

        # Check if subject is enabled and has an image
        enabled = getattr(subject, 'enabled', False)
        image_name = getattr(subject, 'image', '')
        if not enabled or not image_name:
            return

        # Load the subject PNG from subjects folder
        path = storage.get_asset_path("subjects", image_name)
        if not path:
            return

        try:
            subject_img = Image.open(path).convert("RGBA")
        except Exception:
            return

        # Get positioning parameters
        offset_x = getattr(subject, 'offset_x', 0) or 0
        offset_y = getattr(subject, 'offset_y', 0) or 0
        scale = getattr(subject, 'scale', 1.0) or 1.0
        flip_horizontal = getattr(subject, 'flip_horizontal', False)
        opacity = getattr(subject, 'opacity', 1.0)
        if opacity is None:
            opacity = 1.0

        # Apply horizontal flip if needed
        if flip_horizontal:
            subject_img = subject_img.transpose(Image.FLIP_LEFT_RIGHT)

        # Apply scale
        if scale != 1.0:
            new_width = int(subject_img.width * scale)
            new_height = int(subject_img.height * scale)
            subject_img = subject_img.resize((new_width, new_height), Image.LANCZOS)

        # Apply opacity if not fully opaque
        if opacity < 1.0:
            # Modify the alpha channel
            r, g, b, a = subject_img.split()
            a = a.point(lambda x: int(x * opacity))
            subject_img = Image.merge("RGBA", (r, g, b, a))

        # Calculate paste position (centered on canvas with offset)
        canvas_w, canvas_h = canvas.size
        paste_x = (canvas_w - subject_img.width) // 2 + offset_x
        paste_y = (canvas_h - subject_img.height) // 2 + offset_y

        # Paste subject onto canvas with transparency
        canvas.paste(subject_img, (paste_x, paste_y), subject_img)

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

        # Apply text transform
        transform = getattr(zone, 'transform', 'none')
        if transform == "uppercase":
            value = value.upper()
        elif transform == "lowercase":
            value = value.lower()

        # Determine color based on rules
        color = zone.color_rules.get("default", "#FFFFFF")
        for key, rule_color in zone.color_rules.items():
            if key != "default" and episode_data.get("severity") == key:
                color = rule_color
                break

        # Get layout and styling values
        layout_mode = getattr(zone, 'layout_mode', 'horizontal')
        rotation = getattr(zone, 'rotation', 0)
        letter_spacing = getattr(zone, 'letter_spacing', 0)
        stack_gap = getattr(zone, 'stack_gap', 0)
        align = getattr(zone, 'align', 'center')
        valign = getattr(zone, 'valign', 'middle')
        opacity = getattr(zone, 'opacity', 1.0)
        text_bg = getattr(zone, 'text_background', None)

        # Handle stacked text modes
        if layout_mode == "stacked-words":
            self._render_stacked_text(canvas, draw, zone, value.split(), color, stack_gap, letter_spacing, align, valign, text_bg)
            return
        elif layout_mode == "stacked-chars":
            self._render_stacked_text(canvas, draw, zone, list(value), color, stack_gap, letter_spacing, align, valign, text_bg)
            return

        # For rotated text, we render to a separate layer then rotate
        if layout_mode == "rotated" and rotation != 0:
            self._render_rotated_text(canvas, zone, value, color, episode_data)
            return

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
                letter_spacing,
            )

        # Calculate text dimensions
        if letter_spacing > 0:
            text_width = self._get_text_width_with_spacing(value, font, letter_spacing)
            bbox = font.getbbox("Ay")
            text_height = bbox[3] - bbox[1]
        else:
            bbox = draw.textbbox((0, 0), value, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

        # Calculate position based on alignment
        if align == "left":
            x = zone.position.x
        elif align == "right":
            x = zone.position.x + zone.position.width - text_width
        else:  # center
            x = zone.position.x + (zone.position.width - text_width) // 2

        if valign == "top":
            y = zone.position.y
        elif valign == "bottom":
            y = zone.position.y + zone.position.height - text_height
        else:  # middle
            y = zone.position.y + (zone.position.height - text_height) // 2

        # Draw text background if enabled
        if text_bg and text_bg.enabled:
            padding = text_bg.padding
            bg_opacity = int(text_bg.opacity * 255)
            bg_color = self._hex_to_rgba(text_bg.color, bg_opacity)

            overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)

            bg_rect = [
                x - padding,
                y - padding,
                x + text_width + padding,
                y + text_height + padding,
            ]

            if text_bg.border_radius > 0:
                overlay_draw.rounded_rectangle(bg_rect, radius=text_bg.border_radius, fill=bg_color)
            else:
                overlay_draw.rectangle(bg_rect, fill=bg_color)

            canvas.paste(Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB"), (0, 0))
            draw = ImageDraw.Draw(canvas)

        # Draw with letter spacing or normal
        if letter_spacing > 0:
            self._draw_text_with_spacing(draw, x, y, value, font, color, letter_spacing, zone.effects)
        else:
            # Draw stroke (outline)
            if zone.effects.stroke_width > 0:
                for dx in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                    for dy in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                        if dx != 0 or dy != 0:
                            draw.text((x + dx, y + dy), value, font=font, fill=zone.effects.stroke_color)

            # Draw main text
            draw.text((x, y), value, font=font, fill=color)

    def _render_rotated_text(
        self,
        canvas: Image.Image,
        zone: TextZone,
        value: str,
        color: str,
        episode_data: dict,
    ):
        rotation = zone.rotation
        letter_spacing = getattr(zone, 'letter_spacing', 0)

        # Create a larger transparent layer to render text
        max_dim = max(zone.position.width, zone.position.height) * 2
        text_layer = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
        text_draw = ImageDraw.Draw(text_layer)

        # Get font
        font = self._get_font(zone.font, zone.size.max)
        if zone.size.auto:
            # For rotated text, use height as width constraint for vertical text
            constraint = zone.position.height if abs(rotation) == 90 else zone.position.width
            font = self._auto_size_font(value, zone.font, zone.size.min, zone.size.max, constraint, letter_spacing)

        # Calculate text size
        if letter_spacing > 0:
            text_width = self._get_text_width_with_spacing(value, font, letter_spacing)
        else:
            bbox = text_draw.textbbox((0, 0), value, font=font)
            text_width = bbox[2] - bbox[0]
        bbox = font.getbbox("Ay")
        text_height = bbox[3] - bbox[1]

        # Draw text centered in layer
        text_x = (max_dim - text_width) // 2
        text_y = (max_dim - text_height) // 2

        if letter_spacing > 0:
            self._draw_text_with_spacing(text_draw, text_x, text_y, value, font, color, letter_spacing, zone.effects)
        else:
            # Draw stroke
            if zone.effects.stroke_width > 0:
                for dx in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                    for dy in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                        if dx != 0 or dy != 0:
                            text_draw.text((text_x + dx, text_y + dy), value, font=font, fill=zone.effects.stroke_color)
            text_draw.text((text_x, text_y), value, font=font, fill=color)

        # Rotate the layer
        rotated = text_layer.rotate(-rotation, expand=True, resample=Image.BICUBIC)

        # Calculate paste position (center of zone)
        zone_center_x = zone.position.x + zone.position.width // 2
        zone_center_y = zone.position.y + zone.position.height // 2
        paste_x = zone_center_x - rotated.width // 2
        paste_y = zone_center_y - rotated.height // 2

        # Paste onto canvas
        canvas.paste(rotated, (paste_x, paste_y), rotated)

    def _render_stacked_text(
        self,
        canvas: Image.Image,
        draw: ImageDraw.Draw,
        zone: TextZone,
        parts: list[str],
        color: str,
        stack_gap: int,
        letter_spacing: int,
        align: str,
        valign: str,
        text_bg,
    ):
        """Render text parts stacked vertically (each word or character on its own line)."""
        if not parts:
            return

        # Filter out empty parts
        parts = [p for p in parts if p.strip()]
        if not parts:
            return

        # Get font and calculate dimensions for each part
        font = self._get_font(zone.font, zone.size.max)

        # Calculate total height and individual line dimensions
        line_heights = []
        line_widths = []
        for part in parts:
            if letter_spacing > 0:
                w = self._get_text_width_with_spacing(part, font, letter_spacing)
            else:
                bbox = draw.textbbox((0, 0), part, font=font)
                w = bbox[2] - bbox[0]
            bbox = font.getbbox("Ay")
            h = bbox[3] - bbox[1]
            line_widths.append(w)
            line_heights.append(h)

        total_height = sum(line_heights) + stack_gap * (len(parts) - 1)
        max_line_width = max(line_widths) if line_widths else 0

        # Calculate starting Y based on vertical alignment
        if valign == "top":
            start_y = zone.position.y
        elif valign == "bottom":
            start_y = zone.position.y + zone.position.height - total_height
        else:  # middle
            start_y = zone.position.y + (zone.position.height - total_height) // 2

        # Draw text background if enabled
        if text_bg and text_bg.enabled:
            padding = text_bg.padding
            bg_opacity = int(text_bg.opacity * 255)
            bg_color = self._hex_to_rgba(text_bg.color, bg_opacity)

            overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)

            # Calculate background rect around all stacked text
            if align == "left":
                bg_x = zone.position.x
            elif align == "right":
                bg_x = zone.position.x + zone.position.width - max_line_width
            else:
                bg_x = zone.position.x + (zone.position.width - max_line_width) // 2

            bg_rect = [
                bg_x - padding,
                start_y - padding,
                bg_x + max_line_width + padding,
                start_y + total_height + padding,
            ]

            if text_bg.border_radius > 0:
                overlay_draw.rounded_rectangle(bg_rect, radius=text_bg.border_radius, fill=bg_color)
            else:
                overlay_draw.rectangle(bg_rect, fill=bg_color)

            canvas.paste(Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB"), (0, 0))
            draw = ImageDraw.Draw(canvas)

        # Draw each line
        current_y = start_y
        for i, part in enumerate(parts):
            line_width = line_widths[i]
            line_height = line_heights[i]

            # Calculate X based on horizontal alignment
            if align == "left":
                x = zone.position.x
            elif align == "right":
                x = zone.position.x + zone.position.width - line_width
            else:  # center
                x = zone.position.x + (zone.position.width - line_width) // 2

            # Draw with letter spacing or normal
            if letter_spacing > 0:
                self._draw_text_with_spacing(draw, x, current_y, part, font, color, letter_spacing, zone.effects)
            else:
                # Draw stroke (outline)
                if zone.effects.stroke_width > 0:
                    for dx in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                        for dy in range(-zone.effects.stroke_width, zone.effects.stroke_width + 1):
                            if dx != 0 or dy != 0:
                                draw.text((x + dx, current_y + dy), part, font=font, fill=zone.effects.stroke_color)

                # Draw main text
                draw.text((x, current_y), part, font=font, fill=color)

            current_y += line_height + stack_gap

    def _get_text_width_with_spacing(self, text: str, font: ImageFont.FreeTypeFont, spacing: int) -> int:
        total = 0
        for i, char in enumerate(text):
            bbox = font.getbbox(char)
            total += bbox[2] - bbox[0]
            if i < len(text) - 1:
                total += spacing
        return total

    def _draw_text_with_spacing(
        self,
        draw: ImageDraw.Draw,
        x: int,
        y: int,
        text: str,
        font: ImageFont.FreeTypeFont,
        color: str,
        spacing: int,
        effects,
    ):
        current_x = x
        for char in text:
            # Draw stroke for each character
            if effects.stroke_width > 0:
                for dx in range(-effects.stroke_width, effects.stroke_width + 1):
                    for dy in range(-effects.stroke_width, effects.stroke_width + 1):
                        if dx != 0 or dy != 0:
                            draw.text((current_x + dx, y + dy), char, font=font, fill=effects.stroke_color)

            # Draw character
            draw.text((current_x, y), char, font=font, fill=color)

            # Advance position
            bbox = font.getbbox(char)
            char_width = bbox[2] - bbox[0]
            current_x += char_width + spacing

    def _hex_to_rgba(self, hex_color: str, alpha: int = 255) -> tuple:
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b, alpha)

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
        letter_spacing: int = 0,
    ) -> ImageFont.FreeTypeFont:
        for size in range(max_size, min_size - 1, -2):
            font = self._get_font(font_name, size)
            if letter_spacing > 0:
                text_width = self._get_text_width_with_spacing(text, font, letter_spacing)
            else:
                bbox = font.getbbox(text)
                text_width = bbox[2] - bbox[0]
            if text_width <= max_width:
                return font
        return self._get_font(font_name, min_size)


# Singleton
renderer = RendererService()

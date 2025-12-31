# Thumbnail Generator Integration Guide - The Keeper Channel

## Overview

A local REST API for generating YouTube thumbnails. The Keeper channel uses AI-generated backgrounds (Imagen 3) with text overlays for Southern Gothic horror stories.

**Base URL:** `http://localhost:8000`
**API Docs:** `http://localhost:8000/docs`

---

## Quick Start for The Keeper

### 1. Create a Template (One-Time Setup)

```bash
curl -X POST http://localhost:8000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "keeper-v1",
    "pipeline": "youtube-stories"
  }'
```

Response:
```json
{
  "id": "keeper-v1",
  "name": "keeper-v1",
  "pipeline": "youtube-stories",
  "version": 1,
  "canvas": {"width": 1280, "height": 720},
  "background": {
    "mode": "fixed",
    "fixed_images": [],
    "selection": "first",
    "ai_config": {
      "prompt_template": "",
      "negative_prompt": "",
      "fallback_prompt": ""
    }
  },
  "zones": {},
  "overlays": [],
  "created_at": "...",
  "updated_at": "..."
}
```

### 2. Configure Template for AI Backgrounds

```bash
curl -X PUT http://localhost:8000/api/templates/keeper-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "background": {
      "mode": "ai",
      "fixed_images": [],
      "selection": "first",
      "ai_config": {
        "prompt_template": "Cinematic Southern Gothic scene, {mood} atmosphere, {setting}, dark moody lighting, horror aesthetic, no text, no words, photorealistic",
        "negative_prompt": "text, words, letters, watermark, logo, bright colors, cartoon, anime",
        "fallback_prompt": "Dark atmospheric Southern Gothic mansion at night, moody fog, horror aesthetic"
      }
    },
    "zones": {
      "title": {
        "type": "text",
        "position": {"x": 50, "y": 520, "width": 1180, "height": 180},
        "font": "Georgia",
        "size": {"min": 48, "max": 84, "auto": true},
        "color_rules": {
          "default": "#FFFFFF",
          "haunted": "#E8DCC4",
          "dark": "#C0C0C0"
        },
        "effects": {
          "stroke_color": "#000000",
          "stroke_width": 3,
          "shadow_color": "#000000",
          "shadow_blur": 12,
          "shadow_offset": [3, 3]
        },
        "rotation": 0,
        "align": "center",
        "valign": "middle",
        "letter_spacing": 0,
        "transform": "uppercase"
      }
    },
    "overlays": ["vignette"]
  }'
```

### 3. Generate a Thumbnail

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "keeper-v1",
    "episode_id": "EP-001",
    "data": {
      "title": "The House That Watched",
      "mood": "haunted",
      "setting": "abandoned plantation house with Spanish moss"
    },
    "variants": 1
  }'
```

Response:
```json
{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [
    {
      "path": "/static/outputs/EP-001-keeper-v1-1.png",
      "filename": "EP-001-keeper-v1-1.png",
      "size": "youtube",
      "dimensions": [1280, 720]
    }
  ]
}
```

### 4. Download the Thumbnail

```
GET http://localhost:8000/static/outputs/EP-001-keeper-v1-1.png
```

Or programmatically:
```python
import requests

response = requests.get("http://localhost:8000/static/outputs/EP-001-keeper-v1-1.png")
with open("thumbnail.png", "wb") as f:
    f.write(response.content)
```

---

## API Reference

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create new template |
| GET | `/api/templates/{id}` | Get template by ID |
| PUT | `/api/templates/{id}` | Update template |
| DELETE | `/api/templates/{id}` | Delete template |
| POST | `/api/templates/{id}/duplicate` | Duplicate template |

### Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate thumbnail(s) |
| GET | `/api/generate/{job_id}/status` | Check job status |
| POST | `/api/generate/preview` | Generate preview (base64) |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List all assets |
| POST | `/api/assets/{type}` | Upload asset (backgrounds/fonts/overlays) |
| DELETE | `/api/assets/{type}/{filename}` | Delete asset |

### Outputs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/outputs` | List generated thumbnails |
| DELETE | `/api/outputs/{filename}` | Delete output |

---

## Text Zone Schema

Each text zone supports extensive formatting options:

```json
{
  "type": "text",
  "position": {"x": 50, "y": 520, "width": 1180, "height": 180},
  "font": "Georgia",
  "size": {"min": 48, "max": 84, "auto": true},
  "color_rules": {"default": "#FFFFFF"},
  "effects": {
    "stroke_color": "#000000",
    "stroke_width": 3,
    "shadow_color": "#000000",
    "shadow_blur": 12,
    "shadow_offset": [3, 3]
  },
  "rotation": 0,
  "align": "center",
  "valign": "middle",
  "letter_spacing": 0,
  "transform": "none",
  "opacity": 1.0,
  "text_background": {
    "enabled": false,
    "color": "#000000",
    "opacity": 0.7,
    "padding": 20,
    "border_radius": 0
  }
}
```

### Text Zone Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rotation` | int | `0` | Rotation in degrees: `0`, `90`, `-90`, `180`, `45`, `-45` |
| `align` | string | `"center"` | Horizontal alignment: `"left"`, `"center"`, `"right"` |
| `valign` | string | `"middle"` | Vertical alignment: `"top"`, `"middle"`, `"bottom"` |
| `letter_spacing` | int | `0` | Extra pixels between characters (try 10-20 for dramatic effect) |
| `transform` | string | `"none"` | Text transform: `"none"`, `"uppercase"`, `"lowercase"` |
| `opacity` | float | `1.0` | Text opacity (0.0 to 1.0) |
| `text_background.enabled` | bool | `false` | Show colored bar behind text |
| `text_background.color` | string | `"#000000"` | Background bar color |
| `text_background.opacity` | float | `0.7` | Background bar opacity |
| `text_background.padding` | int | `20` | Padding around text in background |

### Example: Vertical Text on Left Side

```json
{
  "side_title": {
    "type": "text",
    "position": {"x": 20, "y": 100, "width": 80, "height": 520},
    "font": "Impact",
    "size": {"min": 24, "max": 48, "auto": true},
    "color_rules": {"default": "#FFFFFF"},
    "effects": {"stroke_color": "#000000", "stroke_width": 2, "shadow_color": "#000000", "shadow_blur": 8, "shadow_offset": [2, 2]},
    "rotation": -90,
    "align": "center",
    "valign": "middle",
    "letter_spacing": 8,
    "transform": "uppercase"
  }
}
```

---

## Data Schema for The Keeper

When calling `/api/generate`, the `data` object should include:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `title` | Yes | Story title (renders in title zone) | `"The House That Watched"` |
| `mood` | Yes | Mood for AI background prompt | `"haunted"`, `"dark"`, `"mysterious"`, `"dread"` |
| `setting` | Yes | Scene description for AI background | `"abandoned plantation house"` |
| `keeper_expression` | No | Reserved for future Keeper face overlay | `"mysterious"`, `"knowing"` |

### Mood Values and Their Effects

| Mood | Background Style | Text Color |
|------|------------------|------------|
| `haunted` | Ghostly, ethereal fog | `#E8DCC4` (aged paper) |
| `dark` | Deep shadows, minimal light | `#C0C0C0` (silver) |
| `mysterious` | Fog, obscured details | `#FFFFFF` (white) |
| `dread` | Oppressive, claustrophobic | `#FFFFFF` (white) |

---

## Python Integration Example

```python
import requests
import time
from pathlib import Path

class ThumbnailGenerator:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url

    def generate_keeper_thumbnail(
        self,
        episode_id: str,
        title: str,
        mood: str,
        setting: str,
        output_path: str = None
    ) -> str:
        """
        Generate a thumbnail for The Keeper channel.

        Args:
            episode_id: Unique episode identifier (e.g., "EP-001")
            title: Story title to display
            mood: Mood for background generation (haunted/dark/mysterious/dread)
            setting: Scene description for AI background
            output_path: Optional local path to save thumbnail

        Returns:
            URL path to generated thumbnail
        """
        # Request thumbnail generation
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "template_id": "keeper-v1",
                "episode_id": episode_id,
                "data": {
                    "title": title,
                    "mood": mood,
                    "setting": setting
                },
                "variants": 1
            }
        )
        response.raise_for_status()
        result = response.json()

        # Poll for completion if processing
        job_id = result["job_id"]
        while result["status"] == "processing":
            time.sleep(1)
            status_response = requests.get(
                f"{self.base_url}/api/generate/{job_id}/status"
            )
            result = status_response.json()

        if result["status"] != "complete":
            raise Exception(f"Generation failed: {result}")

        # Get output path
        output_url = result["outputs"][0]["path"]
        full_url = f"{self.base_url}{output_url}"

        # Download if output_path specified
        if output_path:
            img_response = requests.get(full_url)
            Path(output_path).write_bytes(img_response.content)

        return full_url


# Usage
if __name__ == "__main__":
    generator = ThumbnailGenerator()

    thumbnail_url = generator.generate_keeper_thumbnail(
        episode_id="EP-042",
        title="The Whispering Walls",
        mood="haunted",
        setting="decrepit Victorian parlor with dusty furniture and cracked mirrors",
        output_path="./thumbnails/EP-042.png"
    )

    print(f"Thumbnail generated: {thumbnail_url}")
```

---

## Webhook Integration (Optional)

For async pipelines, provide a webhook URL to receive completion notification:

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "keeper-v1",
    "episode_id": "EP-001",
    "data": {
      "title": "The House That Watched",
      "mood": "haunted",
      "setting": "abandoned plantation house"
    },
    "variants": 1,
    "webhook_url": "http://your-pipeline:8080/thumbnail-ready"
  }'
```

Your webhook will receive:
```json
{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [
    {
      "path": "/static/outputs/EP-001-keeper-v1-1.png",
      "filename": "EP-001-keeper-v1-1.png",
      "size": "youtube",
      "dimensions": [1280, 720]
    }
  ]
}
```

---

## File Locations

| Item | Path |
|------|------|
| Generated thumbnails | `C:\Users\jayso\thumbnail\data\outputs\` |
| Templates (JSON) | `C:\Users\jayso\thumbnail\data\templates\` |
| Background images | `C:\Users\jayso\thumbnail\data\assets\backgrounds\` |
| Custom fonts | `C:\Users\jayso\thumbnail\data\assets\fonts\` |

---

## Troubleshooting

### "Template not found"
Create the template first with POST `/api/templates`

### AI background generation fails
- Check GEMINI_API_KEY in `.env`
- Check backend logs for errors
- Fallback prompt will be used automatically

### Text too small/large
The renderer auto-sizes text to fit the zone. Adjust `size.min` and `size.max` in template if needed.

---

## Starting the Service

```bash
cd C:\Users\jayso\thumbnail
start.bat
```

Or manually:
```bash
cd C:\Users\jayso\thumbnail\backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Service must be running for API calls to work.

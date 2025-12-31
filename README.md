# ThumbGen - YouTube Thumbnail Generator

A local tool for creating professional YouTube thumbnails with a web UI and REST API for automation.

**Features:**
- Visual template editor with live preview
- Fixed backgrounds OR AI-generated backgrounds (Google Imagen 3)
- Auto-sizing text with stroke/shadow effects
- REST API for pipeline automation
- Local storage (no database needed)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using the UI](#using-the-ui)
3. [API Reference](#api-reference)
4. [Python Integration](#python-integration)
5. [Template Configuration](#template-configuration)
6. [File Locations](#file-locations)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies (First Time Only)

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure API Key (Optional - for AI backgrounds)

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Start the App

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

### 4. Open in Browser

- **UI**: http://localhost:5173 (or 5174 if 5173 is busy)
- **API Docs**: http://localhost:8000/docs

---

## Using the UI

### Your First Thumbnail (5 Steps)

| Step | Action |
|------|--------|
| 1 | Click **"+ New"** in the sidebar to create a template |
| 2 | Go to **Assets** tab, drag an image into Backgrounds |
| 3 | Back to **Editor**, click **Background** tab, select your image |
| 4 | Click **Zones** tab, click **"+ Add Zone"** for text |
| 5 | Enter test data at bottom, click **Generate** |

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Editor]  [Assets]  [Outputs]  [Settings]     <- Top tabs  │
├──────────┬────────────────────────────┬─────────────────────┤
│ Template │                            │  Background tab     │
│   List   │      Canvas Preview        │  Zones tab          │
│          │                            │                     │
│ + New    │                            │  (config panels)    │
├──────────┴────────────────────────────┴─────────────────────┤
│  Episode ID: [____]  headline: [____]   [Preview] [Generate]│
└─────────────────────────────────────────────────────────────┘
                                                    [?] <- Help
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Template** | A reusable design recipe - defines background, text position, colors |
| **Zone** | A slot where content appears (text zone for headlines) |
| **Background Mode** | "Fixed" uses uploaded images, "AI" generates unique backgrounds |
| **Data** | The episode-specific info (title, severity, etc.) that fills the template |

### Background Modes

**Fixed Images** (Recommended to start)
- Use images you upload
- Consistent look across episodes
- Good for: Cybersecurity channel with host photos

**AI Generated**
- Creates unique backgrounds per episode using Imagen 3
- Requires GEMINI_API_KEY in .env
- Good for: The Keeper with different story moods

---

## API Reference

Base URL: `http://localhost:8000`

### Generate Thumbnail

```bash
POST /api/generate
Content-Type: application/json

{
  "template_id": "keeper-v1",
  "episode_id": "EP-001",
  "data": {
    "title": "The House That Watched",
    "mood": "haunted",
    "setting": "abandoned plantation house"
  },
  "variants": 1
}
```

**Response:**
```json
{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [
    {
      "path": "/static/outputs/EP-001-keeper-v1-1.png",
      "filename": "EP-001-keeper-v1-1.png",
      "dimensions": [1280, 720]
    }
  ]
}
```

### Download Result

```
GET http://localhost:8000/static/outputs/EP-001-keeper-v1-1.png
```

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Templates** |
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/{id}` | Get template |
| PUT | `/api/templates/{id}` | Update template |
| DELETE | `/api/templates/{id}` | Delete template |
| **Assets** |
| GET | `/api/assets` | List all assets |
| POST | `/api/assets/{type}` | Upload asset (backgrounds/fonts/overlays/keeper) |
| DELETE | `/api/assets/{type}/{filename}` | Delete asset |
| **Generation** |
| POST | `/api/generate` | Generate thumbnail |
| GET | `/api/generate/{job_id}/status` | Check job status |
| POST | `/api/generate/preview` | Generate preview (base64) |
| **Outputs** |
| GET | `/api/outputs` | List generated thumbnails |
| DELETE | `/api/outputs/{filename}` | Delete output |

---

## Python Integration

### Basic Usage

```python
import requests

def generate_thumbnail(template_id, episode_id, data):
    response = requests.post(
        "http://localhost:8000/api/generate",
        json={
            "template_id": template_id,
            "episode_id": episode_id,
            "data": data
        }
    )
    result = response.json()
    return f"http://localhost:8000{result['outputs'][0]['path']}"

# Example: The Keeper
url = generate_thumbnail(
    template_id="keeper-v1",
    episode_id="EP-042",
    data={
        "title": "The Whispering Walls",
        "mood": "haunted",
        "setting": "decrepit Victorian parlor"
    }
)
print(f"Thumbnail: {url}")
```

### Full Client Class

```python
import requests
import time
from pathlib import Path

class ThumbnailGenerator:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url

    def generate(self, template_id, episode_id, data, save_path=None):
        """Generate a thumbnail and optionally save it locally."""

        # Request generation
        response = requests.post(
            f"{self.base_url}/api/generate",
            json={
                "template_id": template_id,
                "episode_id": episode_id,
                "data": data,
                "variants": 1
            }
        )
        response.raise_for_status()
        result = response.json()

        # Wait for completion if processing
        while result["status"] == "processing":
            time.sleep(1)
            result = requests.get(
                f"{self.base_url}/api/generate/{result['job_id']}/status"
            ).json()

        if result["status"] != "complete":
            raise Exception(f"Generation failed: {result}")

        # Get output URL
        output_path = result["outputs"][0]["path"]
        full_url = f"{self.base_url}{output_path}"

        # Download if save_path specified
        if save_path:
            img = requests.get(full_url)
            Path(save_path).write_bytes(img.content)

        return full_url

    def list_templates(self):
        """Get all available templates."""
        return requests.get(f"{self.base_url}/api/templates").json()


# Usage
gen = ThumbnailGenerator()

# The Keeper episode
gen.generate(
    template_id="keeper-v1",
    episode_id="EP-042",
    data={"title": "The Whispering Walls", "mood": "haunted"},
    save_path="./thumbnails/EP-042.png"
)

# Cybersecurity episode
gen.generate(
    template_id="cyber-v1",
    episode_id="2025-01-15-ep47",
    data={"headline": "EXCHANGE SERVER RCE", "severity": "CRITICAL"},
    save_path="./thumbnails/2025-01-15.png"
)
```

### Webhook Integration

For async pipelines, provide a webhook URL:

```python
requests.post("http://localhost:8000/api/generate", json={
    "template_id": "keeper-v1",
    "episode_id": "EP-001",
    "data": {"title": "The House That Watched"},
    "webhook_url": "http://your-pipeline:8080/thumbnail-ready"
})
```

Your webhook receives:
```json
{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [{"path": "/static/outputs/...", "filename": "..."}]
}
```

---

## Template Configuration

### Template Schema

```json
{
  "id": "keeper-v1",
  "name": "The Keeper Template",
  "pipeline": "youtube-stories",
  "canvas": {"width": 1280, "height": 720},

  "background": {
    "mode": "ai",
    "fixed_images": [],
    "selection": "first",
    "ai_config": {
      "prompt_template": "Cinematic Southern Gothic scene, {mood} atmosphere, {setting}",
      "negative_prompt": "text, words, watermark, bright colors",
      "fallback_prompt": "Dark atmospheric Southern Gothic mansion"
    }
  },

  "zones": {
    "title": {
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
      }
    }
  },

  "overlays": ["vignette"]
}
```

### Background Modes

| Mode | Config | Use Case |
|------|--------|----------|
| Fixed | `"mode": "fixed"`, list images in `fixed_images` | Consistent branding |
| AI | `"mode": "ai"`, set prompts in `ai_config` | Unique per episode |

### Zone Types

| Type | Description |
|------|-------------|
| `text` | Auto-sizing text with font, color, stroke, shadow |
| `badge` | Image selected by data value (e.g., severity badge) |
| `image` | Dynamic image from mapping (e.g., Keeper expressions) |

### Data Variables

In AI prompts, use `{variable}` placeholders:
```
"prompt_template": "Scene with {mood} feeling, {setting}"
```

When generating with `data: {"mood": "haunted", "setting": "old house"}`, the prompt becomes:
```
"Scene with haunted feeling, old house"
```

---

## File Locations

```
thumbnail/
├── backend/                 # Python FastAPI server
├── frontend/                # React UI
├── data/                    # All your data (gitignored)
│   ├── templates/           # Template JSON files
│   ├── assets/
│   │   ├── backgrounds/     # Uploaded background images
│   │   ├── fonts/           # Custom fonts
│   │   ├── overlays/        # Vignettes, grain, etc.
│   │   └── keeper/          # Keeper expression cutouts
│   └── outputs/             # Generated thumbnails
├── docs/                    # Documentation
│   ├── getting-started.md   # UI guide
│   └── integration-guide-keeper.md  # API guide
├── .env                     # API keys (create from .env.example)
├── start.bat                # Windows startup
└── start.sh                 # Mac/Linux startup
```

---

## Troubleshooting

### App won't start

**Problem:** `start.bat` doesn't work

**Solution:** Run manually:
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

### Preview is blank

**Problem:** Canvas shows nothing

**Solution:**
1. Go to Background tab
2. Make sure an image is selected (has cyan checkmark)
3. If using AI mode, check that GEMINI_API_KEY is set in .env

---

### 404 errors in console

**Problem:** API calls failing

**Solution:** Make sure the backend is running on port 8000. Check the backend terminal for errors.

---

### AI backgrounds not generating

**Problem:** Falls back to dark gradient

**Solutions:**
1. Check `.env` has valid `GEMINI_API_KEY`
2. Check backend logs for "Imagen generation error"
3. Your API key may not have Imagen access - use Fixed mode instead

---

### Text too small

**Problem:** Headline is tiny and unreadable

**Solutions:**
1. Increase `Max Size` in zone settings
2. Use shorter headlines (3-5 words)
3. Text auto-shrinks to fit - if it's too long, it gets small

---

### Port already in use

**Problem:** "Port 5173 is in use"

**Solution:** Frontend will try 5174. Check the terminal output for the actual URL.

---

### Changes not saving

**Problem:** Template changes disappear

**Solution:** Changes save automatically when you modify settings. Check `data/templates/` for the JSON files. If backend crashed, restart it.

---

## Environment Variables

```bash
# .env file
GEMINI_API_KEY=your_key_here    # Required for AI backgrounds
PORT=8000                        # Backend port (optional)
DATA_DIR=./data                  # Data directory (optional)
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI (Python) |
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Image Processing | Pillow |
| AI Generation | Google Imagen 3 (Gemini API) |
| Storage | Local filesystem (JSON + files) |

---

## Support

- **In-app help:** Click the `?` button (bottom-right)
- **API docs:** http://localhost:8000/docs (when running)
- **Source files:** Check `docs/` folder for detailed guides

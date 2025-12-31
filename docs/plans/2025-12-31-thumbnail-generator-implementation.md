# Thumbnail Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local web app for creating YouTube thumbnails with a zone-based editor and REST API for autonomous pipeline integration.

**Architecture:** FastAPI backend handles template CRUD, asset management, and thumbnail rendering. React frontend provides an interactive editor with live preview. Local filesystem stores all data (templates as JSON, assets as files).

**Tech Stack:** FastAPI, React + TypeScript, Pillow (image processing), Google Generative AI (Imagen 3), Vite, TailwindCSS

---

## Phase 1: Project Setup

### Task 1: Initialize Project Structure

**Files:**
- Create: `backend/main.py`
- Create: `backend/requirements.txt`
- Create: `frontend/package.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `start.sh`

**Step 1: Create directory structure**

```bash
mkdir -p backend/routes backend/services
mkdir -p frontend/src/components frontend/src/pages
mkdir -p data/templates data/assets/backgrounds data/assets/fonts data/assets/overlays data/outputs
```

**Step 2: Create backend requirements.txt**

Create `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
pillow==10.2.0
google-generativeai==0.8.3
python-dotenv==1.0.0
pydantic==2.5.3
httpx==0.26.0
```

**Step 3: Create .env.example**

Create `.env.example`:
```
GEMINI_API_KEY=your_api_key_here
PORT=8000
DATA_DIR=./data
```

**Step 4: Create .gitignore**

Create `.gitignore`:
```
# Environment
.env
__pycache__/
*.pyc
node_modules/
.venv/
venv/

# Data (user content)
data/templates/*
data/assets/*
data/outputs/*
data/config.json
!data/templates/.gitkeep
!data/assets/.gitkeep
!data/outputs/.gitkeep

# Build
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
```

**Step 5: Create gitkeep files**

```bash
touch data/templates/.gitkeep
touch data/assets/backgrounds/.gitkeep
touch data/assets/fonts/.gitkeep
touch data/assets/overlays/.gitkeep
touch data/outputs/.gitkeep
```

**Step 6: Create minimal backend entry point**

Create `backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Thumbnail Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**Step 7: Verify backend starts**

Run:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Expected: Server starts, visit http://localhost:8000/health returns `{"status":"healthy"}`

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: initialize project structure with FastAPI backend"
```

---

### Task 2: Initialize React Frontend

**Files:**
- Create: `frontend/` (via Vite)
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/tailwind.config.js`

**Step 1: Create Vite React project**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: Configure Tailwind**

Replace `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 3: Add Tailwind to CSS**

Replace `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-900 text-white;
}
```

**Step 4: Create minimal App**

Replace `frontend/src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Thumbnail Generator</h1>
      <p className="text-gray-400">Loading...</p>
    </div>
  );
}

export default App;
```

**Step 5: Verify frontend starts**

```bash
npm run dev
```

Expected: Opens at http://localhost:5173 showing "Thumbnail Generator" heading

**Step 6: Install additional dependencies**

```bash
npm install axios react-dropzone zustand
npm install -D @types/node
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: initialize React frontend with Vite and Tailwind"
```

---

## Phase 2: Storage Service & Data Models

### Task 3: Create Storage Service

**Files:**
- Create: `backend/services/storage.py`
- Create: `backend/models.py`

**Step 1: Create Pydantic models**

Create `backend/models.py`:
```python
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
```

**Step 2: Create storage service**

Create `backend/services/storage.py`:
```python
import json
import os
import shutil
from pathlib import Path
from typing import Optional
from datetime import datetime
import uuid

from models import Template, TemplateCreate


class StorageService:
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.templates_dir = self.data_dir / "templates"
        self.assets_dir = self.data_dir / "assets"
        self.outputs_dir = self.data_dir / "outputs"
        self._ensure_dirs()

    def _ensure_dirs(self):
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "backgrounds").mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "fonts").mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "overlays").mkdir(parents=True, exist_ok=True)
        self.outputs_dir.mkdir(parents=True, exist_ok=True)

    # Templates
    def list_templates(self) -> list[Template]:
        templates = []
        for f in self.templates_dir.glob("*.json"):
            with open(f) as file:
                data = json.load(file)
                templates.append(Template(**data))
        return sorted(templates, key=lambda t: t.updated_at, reverse=True)

    def get_template(self, template_id: str) -> Optional[Template]:
        path = self.templates_dir / f"{template_id}.json"
        if not path.exists():
            return None
        with open(path) as f:
            return Template(**json.load(f))

    def create_template(self, data: TemplateCreate) -> Template:
        template_id = str(uuid.uuid4())[:8]
        template = Template(
            id=template_id,
            name=data.name,
            pipeline=data.pipeline,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        self._save_template(template)
        return template

    def update_template(self, template_id: str, updates: dict) -> Optional[Template]:
        template = self.get_template(template_id)
        if not template:
            return None
        template_dict = template.model_dump()
        template_dict.update(updates)
        template_dict["updated_at"] = datetime.now()
        updated = Template(**template_dict)
        self._save_template(updated)
        return updated

    def delete_template(self, template_id: str) -> bool:
        path = self.templates_dir / f"{template_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False

    def duplicate_template(self, template_id: str, new_name: str) -> Optional[Template]:
        template = self.get_template(template_id)
        if not template:
            return None
        new_id = str(uuid.uuid4())[:8]
        new_template = template.model_copy()
        new_template.id = new_id
        new_template.name = new_name
        new_template.created_at = datetime.now()
        new_template.updated_at = datetime.now()
        self._save_template(new_template)
        return new_template

    def _save_template(self, template: Template):
        path = self.templates_dir / f"{template.id}.json"
        with open(path, "w") as f:
            json.dump(template.model_dump(mode="json"), f, indent=2, default=str)

    # Assets
    def list_assets(self, asset_type: str) -> list[dict]:
        asset_dir = self.assets_dir / asset_type
        if not asset_dir.exists():
            return []
        assets = []
        for f in asset_dir.iterdir():
            if f.is_file() and not f.name.startswith("."):
                assets.append({
                    "id": f.stem,
                    "filename": f.name,
                    "path": str(f),
                    "type": asset_type,
                    "size": f.stat().st_size,
                })
        return assets

    def save_asset(self, asset_type: str, filename: str, content: bytes) -> dict:
        asset_dir = self.assets_dir / asset_type
        asset_dir.mkdir(parents=True, exist_ok=True)
        path = asset_dir / filename
        with open(path, "wb") as f:
            f.write(content)
        return {
            "id": path.stem,
            "filename": filename,
            "path": str(path),
            "type": asset_type,
        }

    def delete_asset(self, asset_type: str, filename: str) -> bool:
        path = self.assets_dir / asset_type / filename
        if path.exists():
            path.unlink()
            return True
        return False

    def get_asset_path(self, asset_type: str, filename: str) -> Optional[Path]:
        path = self.assets_dir / asset_type / filename
        return path if path.exists() else None

    # Outputs
    def list_outputs(self) -> list[dict]:
        outputs = []
        for f in self.outputs_dir.glob("*.png"):
            outputs.append({
                "id": f.stem,
                "filename": f.name,
                "path": str(f),
                "size": f.stat().st_size,
                "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            })
        return sorted(outputs, key=lambda o: o["created_at"], reverse=True)

    def save_output(self, filename: str, content: bytes) -> dict:
        path = self.outputs_dir / filename
        with open(path, "wb") as f:
            f.write(content)
        return {
            "id": path.stem,
            "filename": filename,
            "path": str(path),
        }

    def delete_output(self, filename: str) -> bool:
        path = self.outputs_dir / filename
        if path.exists():
            path.unlink()
            return True
        return False

    def get_output_path(self, filename: str) -> Optional[Path]:
        path = self.outputs_dir / filename
        return path if path.exists() else None


# Singleton instance
storage = StorageService(os.getenv("DATA_DIR", "./data"))
```

**Step 3: Verify imports work**

```bash
cd backend
python -c "from services.storage import storage; print('Storage service OK')"
```

Expected: Prints "Storage service OK"

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add storage service and Pydantic models"
```

---

### Task 4: Create Template Routes

**Files:**
- Create: `backend/routes/templates.py`
- Modify: `backend/main.py`

**Step 1: Create templates router**

Create `backend/routes/__init__.py`:
```python
# Routes package
```

Create `backend/routes/templates.py`:
```python
from fastapi import APIRouter, HTTPException
from models import Template, TemplateCreate
from services.storage import storage

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[Template])
def list_templates():
    return storage.list_templates()


@router.post("", response_model=Template)
def create_template(data: TemplateCreate):
    return storage.create_template(data)


@router.get("/{template_id}", response_model=Template)
def get_template(template_id: str):
    template = storage.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=Template)
def update_template(template_id: str, updates: dict):
    template = storage.update_template(template_id, updates)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.delete("/{template_id}")
def delete_template(template_id: str):
    if not storage.delete_template(template_id):
        raise HTTPException(status_code=404, detail="Template not found")
    return {"status": "deleted"}


@router.post("/{template_id}/duplicate", response_model=Template)
def duplicate_template(template_id: str, new_name: str = "Copy"):
    template = storage.duplicate_template(template_id, new_name)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
```

**Step 2: Register router in main.py**

Update `backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

app = FastAPI(title="Thumbnail Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from routes.templates import router as templates_router

app.include_router(templates_router)

# Serve static files (assets and outputs)
data_dir = Path(os.getenv("DATA_DIR", "./data"))
app.mount("/static/assets", StaticFiles(directory=data_dir / "assets"), name="assets")
app.mount("/static/outputs", StaticFiles(directory=data_dir / "outputs"), name="outputs")


@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**Step 3: Test templates API**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

In another terminal:
```bash
# Create template
curl -X POST http://localhost:8000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Template", "pipeline": "test"}'

# List templates
curl http://localhost:8000/api/templates
```

Expected: Template created and listed successfully

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add templates API routes"
```

---

### Task 5: Create Assets Routes

**Files:**
- Create: `backend/routes/assets.py`
- Modify: `backend/main.py`

**Step 1: Create assets router**

Create `backend/routes/assets.py`:
```python
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from services.storage import storage

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("")
def list_all_assets():
    return {
        "backgrounds": storage.list_assets("backgrounds"),
        "fonts": storage.list_assets("fonts"),
        "overlays": storage.list_assets("overlays"),
    }


@router.get("/{asset_type}")
def list_assets(asset_type: str):
    if asset_type not in ["backgrounds", "fonts", "overlays"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")
    return storage.list_assets(asset_type)


@router.post("/{asset_type}")
async def upload_asset(asset_type: str, file: UploadFile = File(...)):
    if asset_type not in ["backgrounds", "fonts", "overlays"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    content = await file.read()
    result = storage.save_asset(asset_type, file.filename, content)
    return result


@router.delete("/{asset_type}/{filename}")
def delete_asset(asset_type: str, filename: str):
    if not storage.delete_asset(asset_type, filename):
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"status": "deleted"}


@router.get("/{asset_type}/{filename}")
def get_asset(asset_type: str, filename: str):
    path = storage.get_asset_path(asset_type, filename)
    if not path:
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(path)
```

**Step 2: Register assets router**

Update `backend/main.py` imports:
```python
from routes.templates import router as templates_router
from routes.assets import router as assets_router

app.include_router(templates_router)
app.include_router(assets_router)
```

**Step 3: Test assets API**

```bash
# Upload a test image (use any PNG/JPG you have)
curl -X POST http://localhost:8000/api/assets/backgrounds \
  -F "file=@/path/to/test-image.png"

# List assets
curl http://localhost:8000/api/assets
```

Expected: Asset uploaded and listed successfully

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add assets API routes"
```

---

### Task 6: Create Outputs Routes

**Files:**
- Create: `backend/routes/outputs.py`
- Modify: `backend/main.py`

**Step 1: Create outputs router**

Create `backend/routes/outputs.py`:
```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.storage import storage

router = APIRouter(prefix="/api/outputs", tags=["outputs"])


@router.get("")
def list_outputs():
    return storage.list_outputs()


@router.get("/{filename}")
def get_output(filename: str):
    path = storage.get_output_path(filename)
    if not path:
        raise HTTPException(status_code=404, detail="Output not found")
    return FileResponse(path)


@router.delete("/{filename}")
def delete_output(filename: str):
    if not storage.delete_output(filename):
        raise HTTPException(status_code=404, detail="Output not found")
    return {"status": "deleted"}
```

**Step 2: Register outputs router**

Update `backend/main.py` imports:
```python
from routes.templates import router as templates_router
from routes.assets import router as assets_router
from routes.outputs import router as outputs_router

app.include_router(templates_router)
app.include_router(assets_router)
app.include_router(outputs_router)
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add outputs API routes"
```

---

## Phase 3: Rendering Engine

### Task 7: Create Renderer Service

**Files:**
- Create: `backend/services/renderer.py`

**Step 1: Create renderer service**

Create `backend/services/renderer.py`:
```python
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
            # For now, just use the first image
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
        # Check visibility condition
        if zone.visible_when:
            # Simple evaluation - check if severity matches
            severity = episode_data.get("severity", "")
            if "CRITICAL" in zone.visible_when and severity != "CRITICAL":
                if "HIGH" in zone.visible_when and severity != "HIGH":
                    return

        # Get badge variant
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

        # Create radial gradient mask
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

        # Apply vignette
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

        # Try to load custom font
        custom_path = storage.get_asset_path("fonts", f"{font_name}.ttf")
        if custom_path:
            font = ImageFont.truetype(str(custom_path), size)
        else:
            # Fall back to system font
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
```

**Step 2: Test renderer**

```bash
cd backend
python -c "from services.renderer import renderer; print('Renderer OK')"
```

Expected: Prints "Renderer OK"

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add thumbnail renderer service"
```

---

### Task 8: Create Imagen Service

**Files:**
- Create: `backend/services/imagen.py`

**Step 1: Create Imagen service**

Create `backend/services/imagen.py`:
```python
import google.generativeai as genai
from PIL import Image
import io
import os
from typing import Optional


class ImagenService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        self.model = None

    def _get_model(self):
        if not self.model:
            # Use Imagen 3 model
            self.model = genai.ImageGenerationModel("imagen-3.0-generate-002")
        return self.model

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1280,
        height: int = 720,
    ) -> Optional[bytes]:
        try:
            model = self._get_model()

            # Build full prompt
            full_prompt = prompt
            if negative_prompt:
                full_prompt += f". Avoid: {negative_prompt}"

            # Generate image
            response = model.generate_images(
                prompt=full_prompt,
                number_of_images=1,
                aspect_ratio="16:9",  # YouTube thumbnail ratio
                safety_filter_level="block_only_high",
            )

            if response.images:
                # Get first image
                image = response.images[0]

                # Convert to bytes
                buffer = io.BytesIO()
                image._pil_image.save(buffer, format="PNG")
                buffer.seek(0)
                return buffer.getvalue()

            return None

        except Exception as e:
            print(f"Imagen generation error: {e}")
            return None

    def is_available(self) -> bool:
        return bool(os.getenv("GEMINI_API_KEY"))


# Singleton
imagen = ImagenService()
```

**Step 2: Test Imagen service (without API call)**

```bash
cd backend
python -c "from services.imagen import imagen; print(f'Imagen available: {imagen.is_available()}')"
```

Expected: Prints availability status based on whether API key is set

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Imagen 3 service for AI background generation"
```

---

### Task 9: Create Generate Routes

**Files:**
- Create: `backend/routes/generate.py`
- Modify: `backend/main.py`

**Step 1: Create generate router**

Create `backend/routes/generate.py`:
```python
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
import uuid
import httpx

from models import GenerateRequest, GenerateResponse, Template
from services.storage import storage
from services.renderer import renderer
from services.imagen import imagen

router = APIRouter(prefix="/api/generate", tags=["generate"])

# Simple in-memory job tracking
jobs: dict[str, dict] = {}


@router.post("", response_model=GenerateResponse)
async def generate_thumbnail(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
):
    # Validate template exists
    template = storage.get_template(request.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create job
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "status": "processing",
        "outputs": [],
        "error": None,
    }

    # Run generation in background
    background_tasks.add_task(
        _generate_task,
        job_id,
        template,
        request,
    )

    return GenerateResponse(job_id=job_id, status="processing")


@router.get("/{job_id}/status", response_model=GenerateResponse)
def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    return GenerateResponse(
        job_id=job_id,
        status=job["status"],
        outputs=job["outputs"],
    )


@router.post("/preview")
async def preview_thumbnail(
    template_id: str,
    episode_data: dict,
    background_override: Optional[str] = None,
):
    """Generate a preview without saving to outputs"""
    template = storage.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    try:
        image_bytes = renderer.render(template, episode_data, background_override)

        # Return as base64 for preview
        import base64
        return {
            "image": base64.b64encode(image_bytes).decode("utf-8"),
            "format": "png",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_task(
    job_id: str,
    template: Template,
    request: GenerateRequest,
):
    try:
        outputs = []

        for i in range(request.variants):
            # Check if we need AI background
            background_override = None
            if template.background.mode == "ai" and imagen.is_available():
                # Build prompt from template
                prompt = template.background.ai_config.prompt_template.format(
                    **request.data
                )

                # Generate AI background
                bg_bytes = imagen.generate(
                    prompt=prompt,
                    negative_prompt=template.background.ai_config.negative_prompt,
                    width=template.canvas.width,
                    height=template.canvas.height,
                )

                if bg_bytes:
                    # Save temporary background
                    bg_filename = f"_temp_{job_id}_{i}.png"
                    storage.save_asset("backgrounds", bg_filename, bg_bytes)
                    background_override = bg_filename

            # Render thumbnail
            image_bytes = renderer.render(template, request.data, background_override)

            # Save output
            variant_suffix = f"-{i+1}" if request.variants > 1 else ""
            filename = f"{request.episode_id}-{template.id}{variant_suffix}.png"
            result = storage.save_output(filename, image_bytes)

            outputs.append({
                "path": result["path"],
                "filename": result["filename"],
                "size": "youtube",
                "dimensions": [template.canvas.width, template.canvas.height],
            })

            # Clean up temp background
            if background_override and background_override.startswith("_temp_"):
                storage.delete_asset("backgrounds", background_override)

        # Update job status
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["outputs"] = outputs

        # Call webhook if provided
        if request.webhook_url:
            async with httpx.AsyncClient() as client:
                try:
                    await client.post(
                        request.webhook_url,
                        json={
                            "job_id": job_id,
                            "status": "complete",
                            "outputs": outputs,
                        },
                    )
                except Exception as e:
                    print(f"Webhook error: {e}")

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
```

**Step 2: Register generate router**

Update `backend/main.py` imports:
```python
from routes.templates import router as templates_router
from routes.assets import router as assets_router
from routes.outputs import router as outputs_router
from routes.generate import router as generate_router

app.include_router(templates_router)
app.include_router(assets_router)
app.include_router(outputs_router)
app.include_router(generate_router)
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add thumbnail generation API with preview support"
```

---

## Phase 4: React Frontend

### Task 10: Create API Client

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/types.ts`

**Step 1: Create types**

Create `frontend/src/api/types.ts`:
```typescript
export interface ZonePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextSize {
  min: number;
  max: number;
  auto: boolean;
}

export interface TextEffects {
  stroke_color: string;
  stroke_width: number;
  shadow_color: string;
  shadow_blur: number;
  shadow_offset: [number, number];
}

export interface TextZone {
  type: "text";
  position: ZonePosition;
  font: string;
  size: TextSize;
  color_rules: Record<string, string>;
  effects: TextEffects;
}

export interface BadgeZone {
  type: "badge";
  position: ZonePosition;
  variants: Record<string, string>;
  visible_when?: string;
}

export interface ImageZone {
  type: "image";
  position: ZonePosition;
  mapping: Record<string, string>;
}

export type Zone = TextZone | BadgeZone | ImageZone;

export interface AIConfig {
  prompt_template: string;
  negative_prompt: string;
  fallback_prompt: string;
}

export interface BackgroundConfig {
  mode: "fixed" | "ai";
  fixed_images: string[];
  selection: "first" | "rotate" | "random";
  ai_config: AIConfig;
}

export interface CanvasConfig {
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  pipeline: string;
  version: number;
  canvas: CanvasConfig;
  background: BackgroundConfig;
  zones: Record<string, Zone>;
  overlays: string[];
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  filename: string;
  path: string;
  type: string;
  size?: number;
}

export interface Output {
  id: string;
  filename: string;
  path: string;
  size: number;
  created_at: string;
}

export interface GenerateRequest {
  template_id: string;
  episode_id: string;
  data: Record<string, string>;
  variants?: number;
  webhook_url?: string;
}

export interface GenerateResponse {
  job_id: string;
  status: string;
  outputs: Array<{
    path: string;
    filename: string;
    size: string;
    dimensions: [number, number];
  }>;
}
```

**Step 2: Create API client**

Create `frontend/src/api/client.ts`:
```typescript
import axios from "axios";
import type {
  Template,
  Asset,
  Output,
  GenerateRequest,
  GenerateResponse,
} from "./types";

const API_BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
});

// Templates
export const templates = {
  list: () => api.get<Template[]>("/api/templates").then((r) => r.data),

  get: (id: string) => api.get<Template>(`/api/templates/${id}`).then((r) => r.data),

  create: (data: { name: string; pipeline: string }) =>
    api.post<Template>("/api/templates", data).then((r) => r.data),

  update: (id: string, data: Partial<Template>) =>
    api.put<Template>(`/api/templates/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/templates/${id}`),

  duplicate: (id: string, newName: string) =>
    api
      .post<Template>(`/api/templates/${id}/duplicate?new_name=${encodeURIComponent(newName)}`)
      .then((r) => r.data),
};

// Assets
export const assets = {
  list: () =>
    api
      .get<{ backgrounds: Asset[]; fonts: Asset[]; overlays: Asset[] }>("/api/assets")
      .then((r) => r.data),

  upload: (type: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Asset>(`/api/assets/${type}`, formData).then((r) => r.data);
  },

  delete: (type: string, filename: string) =>
    api.delete(`/api/assets/${type}/${filename}`),

  getUrl: (type: string, filename: string) =>
    `${API_BASE}/static/assets/${type}/${filename}`,
};

// Outputs
export const outputs = {
  list: () => api.get<Output[]>("/api/outputs").then((r) => r.data),

  delete: (filename: string) => api.delete(`/api/outputs/${filename}`),

  getUrl: (filename: string) => `${API_BASE}/static/outputs/${filename}`,
};

// Generate
export const generate = {
  thumbnail: (data: GenerateRequest) =>
    api.post<GenerateResponse>("/api/generate", data).then((r) => r.data),

  status: (jobId: string) =>
    api.get<GenerateResponse>(`/api/generate/${jobId}/status`).then((r) => r.data),

  preview: (templateId: string, data: Record<string, string>) =>
    api
      .post<{ image: string; format: string }>("/api/generate/preview", null, {
        params: { template_id: templateId, episode_data: JSON.stringify(data) },
      })
      .then((r) => r.data),
};

export default {
  templates,
  assets,
  outputs,
  generate,
};
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add TypeScript API client for frontend"
```

---

### Task 11: Create Store (State Management)

**Files:**
- Create: `frontend/src/store/index.ts`

**Step 1: Create Zustand store**

Create `frontend/src/store/index.ts`:
```typescript
import { create } from "zustand";
import type { Template, Asset, Output } from "../api/types";
import api from "../api/client";

interface AppState {
  // Templates
  templates: Template[];
  selectedTemplate: Template | null;
  loadTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => Promise<void>;
  createTemplate: (name: string, pipeline: string) => Promise<Template>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName: string) => Promise<Template>;

  // Assets
  assets: {
    backgrounds: Asset[];
    fonts: Asset[];
    overlays: Asset[];
  };
  loadAssets: () => Promise<void>;
  uploadAsset: (type: string, file: File) => Promise<Asset>;
  deleteAsset: (type: string, filename: string) => Promise<void>;

  // Outputs
  outputs: Output[];
  loadOutputs: () => Promise<void>;
  deleteOutput: (filename: string) => Promise<void>;

  // Editor state
  previewData: Record<string, string>;
  setPreviewData: (data: Record<string, string>) => void;
  previewImage: string | null;
  generatePreview: () => Promise<void>;

  // Generation
  isGenerating: boolean;
  generateThumbnail: (episodeId: string, data: Record<string, string>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Templates
  templates: [],
  selectedTemplate: null,

  loadTemplates: async () => {
    const templates = await api.templates.list();
    set({ templates });
  },

  selectTemplate: async (id) => {
    if (!id) {
      set({ selectedTemplate: null, previewImage: null });
      return;
    }
    const template = await api.templates.get(id);
    set({ selectedTemplate: template, previewImage: null });
  },

  createTemplate: async (name, pipeline) => {
    const template = await api.templates.create({ name, pipeline });
    await get().loadTemplates();
    return template;
  },

  updateTemplate: async (id, data) => {
    await api.templates.update(id, data);
    await get().loadTemplates();
    if (get().selectedTemplate?.id === id) {
      await get().selectTemplate(id);
    }
  },

  deleteTemplate: async (id) => {
    await api.templates.delete(id);
    if (get().selectedTemplate?.id === id) {
      set({ selectedTemplate: null });
    }
    await get().loadTemplates();
  },

  duplicateTemplate: async (id, newName) => {
    const template = await api.templates.duplicate(id, newName);
    await get().loadTemplates();
    return template;
  },

  // Assets
  assets: {
    backgrounds: [],
    fonts: [],
    overlays: [],
  },

  loadAssets: async () => {
    const assets = await api.assets.list();
    set({ assets });
  },

  uploadAsset: async (type, file) => {
    const asset = await api.assets.upload(type, file);
    await get().loadAssets();
    return asset;
  },

  deleteAsset: async (type, filename) => {
    await api.assets.delete(type, filename);
    await get().loadAssets();
  },

  // Outputs
  outputs: [],

  loadOutputs: async () => {
    const outputs = await api.outputs.list();
    set({ outputs });
  },

  deleteOutput: async (filename) => {
    await api.outputs.delete(filename);
    await get().loadOutputs();
  },

  // Editor
  previewData: {
    headline: "SAMPLE HEADLINE",
    severity: "CRITICAL",
  },
  previewImage: null,

  setPreviewData: (data) => set({ previewData: data }),

  generatePreview: async () => {
    const { selectedTemplate, previewData } = get();
    if (!selectedTemplate) return;

    try {
      const result = await api.generate.preview(selectedTemplate.id, previewData);
      set({ previewImage: `data:image/png;base64,${result.image}` });
    } catch (error) {
      console.error("Preview error:", error);
    }
  },

  // Generation
  isGenerating: false,

  generateThumbnail: async (episodeId, data) => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) return;

    set({ isGenerating: true });
    try {
      const response = await api.generate.thumbnail({
        template_id: selectedTemplate.id,
        episode_id: episodeId,
        data,
        variants: 1,
      });

      // Poll for completion
      let status = response;
      while (status.status === "processing") {
        await new Promise((r) => setTimeout(r, 1000));
        status = await api.generate.status(response.job_id);
      }

      await get().loadOutputs();
    } finally {
      set({ isGenerating: false });
    }
  },
}));
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Zustand store for state management"
```

---

### Task 12: Create Layout Components

**Files:**
- Create: `frontend/src/components/Layout/Sidebar.tsx`
- Create: `frontend/src/components/Layout/Header.tsx`

**Step 1: Create Sidebar**

Create `frontend/src/components/Layout/Sidebar.tsx`:
```tsx
import { useStore } from "../../store";
import { useState } from "react";

export function Sidebar() {
  const {
    templates,
    selectedTemplate,
    selectTemplate,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useStore();

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPipeline, setNewPipeline] = useState("cybersecurity");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const template = await createTemplate(newName, newPipeline);
    await selectTemplate(template.id);
    setShowNew(false);
    setNewName("");
  };

  const handleDuplicate = async (id: string, name: string) => {
    const newTemplate = await duplicateTemplate(id, `${name} (Copy)`);
    await selectTemplate(newTemplate.id);
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Templates</h2>
        <button
          onClick={() => setShowNew(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          + New Template
        </button>
      </div>

      {showNew && (
        <div className="p-4 border-b border-gray-700 bg-gray-750">
          <input
            type="text"
            placeholder="Template name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded mb-2 text-sm"
          />
          <select
            value={newPipeline}
            onChange={(e) => setNewPipeline(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded mb-2 text-sm"
          >
            <option value="cybersecurity">Cybersecurity</option>
            <option value="keeper">The Keeper</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-750 ${
              selectedTemplate?.id === template.id ? "bg-gray-700" : ""
            }`}
            onClick={() => selectTemplate(template.id)}
          >
            <div className="font-medium text-sm">{template.name}</div>
            <div className="text-xs text-gray-400">{template.pipeline}</div>
            {selectedTemplate?.id === template.id && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(template.id, template.name);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this template?")) {
                      deleteTemplate(template.id);
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create Header**

Create `frontend/src/components/Layout/Header.tsx`:
```tsx
interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: "editor", label: "Editor" },
    { id: "assets", label: "Assets" },
    { id: "outputs", label: "Outputs" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Thumbnail Generator</h1>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded text-sm ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

**Step 3: Create index exports**

Create `frontend/src/components/Layout/index.ts`:
```typescript
export { Sidebar } from "./Sidebar";
export { Header } from "./Header";
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Sidebar and Header layout components"
```

---

### Task 13: Create Editor Components

**Files:**
- Create: `frontend/src/components/Editor/Canvas.tsx`
- Create: `frontend/src/components/Editor/ZoneEditor.tsx`
- Create: `frontend/src/components/Editor/PreviewPanel.tsx`
- Create: `frontend/src/components/Editor/DataInputs.tsx`

**Step 1: Create Canvas component**

Create `frontend/src/components/Editor/Canvas.tsx`:
```tsx
import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";

export function Canvas() {
  const { selectedTemplate, previewImage } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-850 text-gray-500">
        Select a template to start editing
      </div>
    );
  }

  const { canvas, background } = selectedTemplate;
  const aspectRatio = canvas.width / canvas.height;

  // Get background image URL
  let backgroundUrl = "";
  if (background.mode === "fixed" && background.fixed_images.length > 0) {
    backgroundUrl = assetsApi.getUrl("backgrounds", background.fixed_images[0]);
  }

  return (
    <div className="flex-1 p-4 bg-gray-850 overflow-auto">
      <div
        className="mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-xl"
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: `${aspectRatio}`,
        }}
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : backgroundUrl ? (
          <img
            src={backgroundUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            No background set
          </div>
        )}
      </div>
      <div className="text-center mt-2 text-sm text-gray-500">
        {canvas.width} x {canvas.height}
      </div>
    </div>
  );
}
```

**Step 2: Create ZoneEditor component**

Create `frontend/src/components/Editor/ZoneEditor.tsx`:
```tsx
import { useStore } from "../../store";
import type { TextZone } from "../../api/types";

export function ZoneEditor() {
  const { selectedTemplate, updateTemplate } = useStore();

  if (!selectedTemplate) return null;

  const updateZone = (zoneName: string, updates: Partial<TextZone>) => {
    const currentZone = selectedTemplate.zones[zoneName];
    if (!currentZone) return;

    updateTemplate(selectedTemplate.id, {
      zones: {
        ...selectedTemplate.zones,
        [zoneName]: { ...currentZone, ...updates },
      },
    });
  };

  const addZone = () => {
    const zoneName = `zone_${Object.keys(selectedTemplate.zones).length + 1}`;
    updateTemplate(selectedTemplate.id, {
      zones: {
        ...selectedTemplate.zones,
        [zoneName]: {
          type: "text",
          position: { x: 50, y: 500, width: 1180, height: 150 },
          font: "Impact",
          size: { min: 48, max: 96, auto: true },
          color_rules: { default: "#FFFFFF" },
          effects: {
            stroke_color: "#000000",
            stroke_width: 4,
            shadow_color: "#000000",
            shadow_blur: 8,
            shadow_offset: [2, 2],
          },
        },
      },
    });
  };

  const removeZone = (zoneName: string) => {
    const { [zoneName]: _, ...remaining } = selectedTemplate.zones;
    updateTemplate(selectedTemplate.id, { zones: remaining });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Zones</h3>
        <button
          onClick={addZone}
          className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          + Add Zone
        </button>
      </div>

      {Object.entries(selectedTemplate.zones).map(([name, zone]) => (
        <div key={name} className="mb-4 p-3 bg-gray-750 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{name}</span>
            <button
              onClick={() => removeZone(name)}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Remove
            </button>
          </div>

          {zone.type === "text" && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <label className="text-gray-400 text-xs">Font</label>
                <input
                  type="text"
                  value={(zone as TextZone).font}
                  onChange={(e) => updateZone(name, { font: e.target.value })}
                  className="w-full bg-gray-700 px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Max Size</label>
                <input
                  type="number"
                  value={(zone as TextZone).size.max}
                  onChange={(e) =>
                    updateZone(name, {
                      size: { ...(zone as TextZone).size, max: +e.target.value },
                    })
                  }
                  className="w-full bg-gray-700 px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Default Color</label>
                <input
                  type="color"
                  value={(zone as TextZone).color_rules.default || "#FFFFFF"}
                  onChange={(e) =>
                    updateZone(name, {
                      color_rules: {
                        ...(zone as TextZone).color_rules,
                        default: e.target.value,
                      },
                    })
                  }
                  className="w-full h-8 bg-gray-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Stroke Width</label>
                <input
                  type="number"
                  value={(zone as TextZone).effects.stroke_width}
                  onChange={(e) =>
                    updateZone(name, {
                      effects: {
                        ...(zone as TextZone).effects,
                        stroke_width: +e.target.value,
                      },
                    })
                  }
                  className="w-full bg-gray-700 px-2 py-1 rounded"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Create PreviewPanel component**

Create `frontend/src/components/Editor/PreviewPanel.tsx`:
```tsx
import { useStore } from "../../store";

const PREVIEW_SIZES = [
  { name: "Full", width: 1280, height: 720, scale: 1 },
  { name: "Search", width: 360, height: 202, scale: 0.28 },
  { name: "Mobile", width: 168, height: 94, scale: 0.13 },
];

export function PreviewPanel() {
  const { previewImage } = useStore();

  if (!previewImage) {
    return (
      <div className="p-4">
        <h3 className="font-semibold mb-4">Size Preview</h3>
        <p className="text-gray-500 text-sm">
          Generate a preview to see how your thumbnail looks at different sizes
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Size Preview</h3>
      <div className="space-y-4">
        {PREVIEW_SIZES.map((size) => (
          <div key={size.name}>
            <div className="text-xs text-gray-400 mb-1">
              {size.name} ({size.width}x{size.height})
            </div>
            <div
              className="bg-gray-800 rounded overflow-hidden inline-block"
              style={{ width: size.width * (size.scale < 1 ? 2 : 0.5) }}
            >
              <img
                src={previewImage}
                alt={`${size.name} preview`}
                className="w-full"
              />
            </div>
            {size.name === "Mobile" && (
              <div className="text-xs text-yellow-500 mt-1">
                Check text readability at this size
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create DataInputs component**

Create `frontend/src/components/Editor/DataInputs.tsx`:
```tsx
import { useStore } from "../../store";

export function DataInputs() {
  const {
    selectedTemplate,
    previewData,
    setPreviewData,
    generatePreview,
    generateThumbnail,
    isGenerating,
  } = useStore();

  if (!selectedTemplate) return null;

  const handlePreview = () => {
    generatePreview();
  };

  const handleGenerate = () => {
    const episodeId = `${new Date().toISOString().split("T")[0]}-preview`;
    generateThumbnail(episodeId, previewData);
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="font-semibold mb-4">Test Data</h3>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-400">Headline</label>
          <input
            type="text"
            value={previewData.headline || ""}
            onChange={(e) =>
              setPreviewData({ ...previewData, headline: e.target.value })
            }
            className="w-full bg-gray-700 px-3 py-2 rounded mt-1"
            placeholder="MAIL SERVER CRITICAL"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Severity</label>
          <select
            value={previewData.severity || ""}
            onChange={(e) =>
              setPreviewData({ ...previewData, severity: e.target.value })
            }
            className="w-full bg-gray-700 px-3 py-2 rounded mt-1"
          >
            <option value="">None</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePreview}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium"
          >
            Preview
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Create index export**

Create `frontend/src/components/Editor/index.ts`:
```typescript
export { Canvas } from "./Canvas";
export { ZoneEditor } from "./ZoneEditor";
export { PreviewPanel } from "./PreviewPanel";
export { DataInputs } from "./DataInputs";
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Editor components (Canvas, ZoneEditor, PreviewPanel, DataInputs)"
```

---

### Task 14: Create Assets and Outputs Pages

**Files:**
- Create: `frontend/src/components/Assets/AssetLibrary.tsx`
- Create: `frontend/src/components/Outputs/OutputHistory.tsx`

**Step 1: Create AssetLibrary**

Create `frontend/src/components/Assets/AssetLibrary.tsx`:
```tsx
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";

export function AssetLibrary() {
  const { assets, uploadAsset, deleteAsset, selectedTemplate, updateTemplate } =
    useStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[], type: string) => {
      for (const file of acceptedFiles) {
        await uploadAsset(type, file);
      }
    },
    [uploadAsset]
  );

  const bgDropzone = useDropzone({
    onDrop: (files) => onDrop(files, "backgrounds"),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  });

  const fontDropzone = useDropzone({
    onDrop: (files) => onDrop(files, "fonts"),
    accept: { "font/*": [".ttf", ".otf", ".woff", ".woff2"] },
  });

  const selectBackground = (filename: string) => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, {
      background: {
        ...selectedTemplate.background,
        fixed_images: [filename],
      },
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Asset Library</h2>

      {/* Backgrounds */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Backgrounds</h3>
        <div
          {...bgDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer mb-4 ${
            bgDropzone.isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <input {...bgDropzone.getInputProps()} />
          <p className="text-gray-400">
            Drop images here or click to upload
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {assets.backgrounds.map((asset) => (
            <div
              key={asset.id}
              className="relative group rounded-lg overflow-hidden bg-gray-800"
            >
              <img
                src={assetsApi.getUrl("backgrounds", asset.filename)}
                alt={asset.filename}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => selectBackground(asset.filename)}
                  className="bg-blue-600 px-2 py-1 rounded text-xs"
                >
                  Use
                </button>
                <button
                  onClick={() => deleteAsset("backgrounds", asset.filename)}
                  className="bg-red-600 px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>
              <div className="p-2 text-xs truncate">{asset.filename}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Fonts</h3>
        <div
          {...fontDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer mb-4 ${
            fontDropzone.isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <input {...fontDropzone.getInputProps()} />
          <p className="text-gray-400">
            Drop font files here or click to upload
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {assets.fonts.map((asset) => (
            <div
              key={asset.id}
              className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
            >
              <span className="text-sm truncate">{asset.filename}</span>
              <button
                onClick={() => deleteAsset("fonts", asset.filename)}
                className="text-red-400 hover:text-red-300 text-xs ml-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Overlays */}
      <div>
        <h3 className="font-semibold mb-3">Overlays</h3>
        <div className="grid grid-cols-4 gap-4">
          {assets.overlays.map((asset) => (
            <div
              key={asset.id}
              className="relative group rounded-lg overflow-hidden bg-gray-800"
            >
              <img
                src={assetsApi.getUrl("overlays", asset.filename)}
                alt={asset.filename}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deleteAsset("overlays", asset.filename)}
                  className="bg-red-600 px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>
              <div className="p-2 text-xs truncate">{asset.filename}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create OutputHistory**

Create `frontend/src/components/Outputs/OutputHistory.tsx`:
```tsx
import { useStore } from "../../store";
import { outputs as outputsApi } from "../../api/client";

export function OutputHistory() {
  const { outputs, deleteOutput } = useStore();

  const handleDownload = (filename: string) => {
    const url = outputsApi.getUrl(filename);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Generated Thumbnails</h2>
        <span className="text-gray-400 text-sm">{outputs.length} outputs</span>
      </div>

      {outputs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No thumbnails generated yet
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {outputs.map((output) => (
            <div
              key={output.id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <img
                src={outputsApi.getUrl(output.filename)}
                alt={output.filename}
                className="w-full aspect-video object-cover"
              />
              <div className="p-3">
                <div className="text-sm font-medium truncate mb-1">
                  {output.filename}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(output.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(output.filename)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this output?")) {
                        deleteOutput(output.filename);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create index exports**

Create `frontend/src/components/Assets/index.ts`:
```typescript
export { AssetLibrary } from "./AssetLibrary";
```

Create `frontend/src/components/Outputs/index.ts`:
```typescript
export { OutputHistory } from "./OutputHistory";
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add AssetLibrary and OutputHistory components"
```

---

### Task 15: Wire Up Main App

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Update App.tsx**

Replace `frontend/src/App.tsx`:
```tsx
import { useEffect, useState } from "react";
import { useStore } from "./store";
import { Sidebar, Header } from "./components/Layout";
import { Canvas, ZoneEditor, PreviewPanel, DataInputs } from "./components/Editor";
import { AssetLibrary } from "./components/Assets";
import { OutputHistory } from "./components/Outputs";

function App() {
  const [activeTab, setActiveTab] = useState("editor");
  const { loadTemplates, loadAssets, loadOutputs } = useStore();

  useEffect(() => {
    loadTemplates();
    loadAssets();
    loadOutputs();
  }, [loadTemplates, loadAssets, loadOutputs]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex overflow-hidden">
          {activeTab === "editor" && (
            <>
              <div className="flex-1 flex flex-col">
                <Canvas />
              </div>
              <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                <ZoneEditor />
                <DataInputs />
              </div>
              <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                <PreviewPanel />
              </div>
            </>
          )}

          {activeTab === "assets" && (
            <div className="flex-1 overflow-y-auto">
              <AssetLibrary />
            </div>
          )}

          {activeTab === "outputs" && (
            <div className="flex-1 overflow-y-auto">
              <OutputHistory />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold mb-6">Settings</h2>
              <div className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Set in .env file"
                    disabled
                    className="w-full bg-gray-700 px-3 py-2 rounded opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    API key is configured via .env file for security
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
```

**Step 2: Test the full app**

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Expected: Full UI loads at http://localhost:5173 with sidebar, editor, assets, and outputs tabs working

**Step 3: Commit**

```bash
git add .
git commit -m "feat: wire up main App with all components"
```

---

### Task 16: Create Start Script

**Files:**
- Create: `start.sh`
- Create: `start.bat` (Windows)

**Step 1: Create start.sh**

Create `start.sh`:
```bash
#!/bin/bash

echo "Starting Thumbnail Generator..."

# Check for .env
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please add your GEMINI_API_KEY to .env"
fi

# Start backend
echo "Starting backend..."
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Thumbnail Generator is running!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
```

**Step 2: Create start.bat**

Create `start.bat`:
```batch
@echo off
echo Starting Thumbnail Generator...

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please add your GEMINI_API_KEY to .env
)

echo Starting backend...
start "Backend" cmd /c "cd backend && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /c "cd frontend && npm install -q && npm run dev"

echo.
echo Thumbnail Generator is running!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
pause
```

**Step 3: Make executable**

```bash
chmod +x start.sh
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add start scripts for easy launch"
```

---

## Phase 5: Background Configuration

### Task 17: Add Background Mode UI

**Files:**
- Create: `frontend/src/components/Editor/BackgroundConfig.tsx`
- Modify: `frontend/src/components/Editor/index.ts`
- Modify: `frontend/src/App.tsx`

**Step 1: Create BackgroundConfig**

Create `frontend/src/components/Editor/BackgroundConfig.tsx`:
```tsx
import { useStore } from "../../store";
import { assets as assetsApi } from "../../api/client";

export function BackgroundConfig() {
  const { selectedTemplate, updateTemplate, assets } = useStore();

  if (!selectedTemplate) return null;

  const { background } = selectedTemplate;

  const setMode = (mode: "fixed" | "ai") => {
    updateTemplate(selectedTemplate.id, {
      background: { ...background, mode },
    });
  };

  const setFixedImage = (filename: string) => {
    const images = background.fixed_images.includes(filename)
      ? background.fixed_images.filter((f) => f !== filename)
      : [...background.fixed_images, filename];
    updateTemplate(selectedTemplate.id, {
      background: { ...background, fixed_images: images },
    });
  };

  const setAIPrompt = (prompt_template: string) => {
    updateTemplate(selectedTemplate.id, {
      background: {
        ...background,
        ai_config: { ...background.ai_config, prompt_template },
      },
    });
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h3 className="font-semibold mb-3">Background</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("fixed")}
          className={`flex-1 py-2 rounded text-sm ${
            background.mode === "fixed"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Fixed Image
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 py-2 rounded text-sm ${
            background.mode === "ai"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          AI Generated
        </button>
      </div>

      {background.mode === "fixed" && (
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Select backgrounds (click to toggle)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {assets.backgrounds.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setFixedImage(asset.filename)}
                className={`cursor-pointer rounded overflow-hidden border-2 ${
                  background.fixed_images.includes(asset.filename)
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={assetsApi.getUrl("backgrounds", asset.filename)}
                  alt={asset.filename}
                  className="w-full aspect-video object-cover"
                />
              </div>
            ))}
          </div>
          {assets.backgrounds.length === 0 && (
            <p className="text-xs text-gray-500">
              No backgrounds uploaded. Go to Assets tab to upload.
            </p>
          )}
        </div>
      )}

      {background.mode === "ai" && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Prompt Template
          </label>
          <textarea
            value={background.ai_config.prompt_template}
            onChange={(e) => setAIPrompt(e.target.value)}
            placeholder="Dramatic {severity} cybersecurity scene..."
            className="w-full bg-gray-700 px-3 py-2 rounded text-sm h-24 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {"{variable}"} for dynamic values from episode data
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Export BackgroundConfig**

Update `frontend/src/components/Editor/index.ts`:
```typescript
export { Canvas } from "./Canvas";
export { ZoneEditor } from "./ZoneEditor";
export { PreviewPanel } from "./PreviewPanel";
export { DataInputs } from "./DataInputs";
export { BackgroundConfig } from "./BackgroundConfig";
```

**Step 3: Add to App**

Update the editor section in `frontend/src/App.tsx`:
```tsx
import { Canvas, ZoneEditor, PreviewPanel, DataInputs, BackgroundConfig } from "./components/Editor";

// ... in the editor tab section:
{activeTab === "editor" && (
  <>
    <div className="flex-1 flex flex-col">
      <Canvas />
    </div>
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <BackgroundConfig />
      <ZoneEditor />
      <DataInputs />
    </div>
    <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <PreviewPanel />
    </div>
  </>
)}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add BackgroundConfig component for fixed/AI mode selection"
```

---

## Summary

**Plan complete and saved to `docs/plans/2025-12-31-thumbnail-generator-implementation.md`.**

### What This Builds

1. **FastAPI Backend** with routes for templates, assets, outputs, and generation
2. **React Frontend** with zone-based editor, asset library, and output history
3. **Renderer Service** using Pillow for text/badge compositing
4. **Imagen Service** for AI background generation
5. **Local Storage** using JSON files and filesystem

### Key Features Implemented

- Template CRUD with duplication
- Fixed background OR AI-generated background modes
- Zone-based text editing with auto-sizing
- Color rules based on severity
- Asset upload/management
- Output history with download/delete
- Preview at multiple YouTube sizes
- Webhook support for pipeline integration

### Two Execution Options

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

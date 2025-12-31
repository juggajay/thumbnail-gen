# YouTube Thumbnail Generator - System Design

**Date:** 2025-12-31
**Status:** Approved
**Pipelines:** Cybersecurity (youtube), The Keeper (youtube-stories), Future pipelines

---

## Overview

A unified thumbnail generator with a local web UI for designing templates and a REST API for autonomous pipeline integration. Supports both fixed background images and AI-generated backgrounds via Google Imagen 3.

### Goals

1. Create professional, CTR-optimized thumbnails
2. Lock down format/style through interactive UI
3. Run autonomously once templates are finalized
4. Support multiple pipelines with different styles
5. Enable rapid experimentation for new channels

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THUMBNAIL GENERATOR (Local)                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   React UI  │
                              │  (Editor)   │
                              └──────┬──────┘
                                     │
                                     ▼
┌──────────────┐              ┌─────────────┐
│   Pipeline   │─────────────▶│   FastAPI   │
│   (caller)   │    REST      │   Backend   │
└──────────────┘              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             ┌───────────┐   ┌─────────────────────────────┐
             │  Imagen 3 │   │      Local Folders          │
             │  (Gemini) │   │                             │
             └───────────┘   │  ./data                     │
                             │   ├── templates/            │
                             │   ├── assets/               │
                             │   ├── outputs/              │
                             │   └── config.json           │
                             └─────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI (Python) |
| Frontend | React + TypeScript |
| Image Processing | Pillow / Cairo |
| AI Generation | Google Imagen 3 (Gemini API) |
| Storage | Local filesystem (JSON + files) |

### No External Dependencies

- No PostgreSQL
- No Redis
- No Docker required
- Just Python + Node.js

---

## Folder Structure

```
thumbnail/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── routes/
│   │   ├── templates.py        # CRUD for templates
│   │   ├── assets.py           # Upload/delete assets
│   │   ├── generate.py         # Thumbnail generation
│   │   └── outputs.py          # View/delete outputs
│   ├── services/
│   │   ├── renderer.py         # Core rendering logic
│   │   ├── imagen.py           # Gemini Imagen 3 client
│   │   └── storage.py          # Local file operations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/         # Zone-based canvas editor
│   │   │   ├── AssetLibrary/   # Manage uploads
│   │   │   ├── TemplateList/   # View/select templates
│   │   │   ├── SizePreview/    # YouTube size previews
│   │   │   └── OutputHistory/  # View/delete generated
│   │   └── pages/
│   │       ├── index.tsx       # Main editor
│   │       └── settings.tsx    # API key config
│   └── package.json
│
├── data/                       # All persistent data (gitignored)
│   ├── templates/              # Saved template JSON files
│   ├── assets/
│   │   ├── backgrounds/        # Uploaded background images
│   │   ├── fonts/              # Custom fonts
│   │   └── overlays/           # Vignettes, grain, etc.
│   ├── outputs/                # Generated thumbnails
│   └── config.json             # Settings
│
├── .env                        # API keys (gitignored)
├── .env.example                # Template
└── start.sh                    # One-command startup
```

---

## UI Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REACT UI                                       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────┐  ┌────────────────┐  │
│  │  Template   │  │         EDITOR CANVAS           │  │  SIZE PREVIEW  │  │
│  │    List     │  │  ┌─────────────────────────┐    │  │                │  │
│  │             │  │  │                         │    │  │  [Full 1280]   │  │
│  │  • cyber-v1 │  │  │     Background Zone     │    │  │  [Search 360]  │  │
│  │  • cyber-v2 │  │  │   (fixed OR ai-gen)     │    │  │  [Mobile 168]  │  │
│  │  • keeper-v1│  │  │                         │    │  │                │  │
│  │             │  │  ├─────────────────────────┤    │  │  ⚠ Text too    │  │
│  │  [+ New]    │  │  │ ██ HEADLINE ZONE ██     │    │  │    small at    │  │
│  │             │  │  │ (auto-sizing text)      │    │  │    mobile!     │  │
│  └─────────────┘  │  └─────────────────────────┘    │  └────────────────┘  │
│                   │                                 │                       │
│                   │  [Generate] [3 Variants] [Save] │                       │
│                   └─────────────────────────────────┘                       │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │        ASSET LIBRARY            │  │       OUTPUT HISTORY            │  │
│  │  Backgrounds: [+] 🗑            │  │  • 2025-01-15-ep01.png  🗑      │  │
│  │    • hosts-desk.png             │  │  • 2025-01-14-ep02.png  🗑      │  │
│  │    • hosts-desk-blue.png        │  │  • 2025-01-13-ep03.png  🗑      │  │
│  │  Fonts: [+]                     │  │                                 │  │
│  │  Keeper Expressions: (8 locked) │  │  [Export All] [Clear Old]       │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key UI Features

| Feature | Purpose |
|---------|---------|
| Zone-based editor | Structured regions for text, badges, images |
| Size preview panel | See thumbnail at actual YouTube sizes |
| Readability warnings | Alert when text too small for mobile |
| Asset library | Upload/manage backgrounds, fonts |
| Template list | Quick switch between templates |
| Output history | View/delete generated thumbnails |
| Variant generation | Create 2-3 options for A/B testing |
| Template duplication | Quick copy for experimentation |

---

## Template Schema

```json
{
  "id": "cyber-v1",
  "name": "Cybersecurity Main",
  "pipeline": "cybersecurity",
  "version": 1,

  "canvas": {
    "width": 1280,
    "height": 720
  },

  "background": {
    "mode": "fixed",
    "fixed_images": [
      "hosts-desk.png",
      "hosts-desk-blue.png",
      "hosts-desk-red.png"
    ],
    "selection": "rotate",

    "ai_config": {
      "prompt_template": "Dramatic cybersecurity scene, {severity} threat, dark tech aesthetic",
      "negative_prompt": "text, words, watermark",
      "fallback_prompt": "abstract dark tech background"
    }
  },

  "zones": {
    "headline": {
      "type": "text",
      "position": { "x": 50, "y": 580, "width": 1180, "height": 120 },
      "font": "Impact",
      "size": { "min": 48, "max": 96, "auto": true },
      "color_rules": {
        "CRITICAL": "#FF0000",
        "HIGH": "#FF6600",
        "default": "#FFFFFF"
      },
      "effects": {
        "stroke": { "color": "#000000", "width": 4 },
        "shadow": { "color": "#000000", "blur": 8, "offset": [2, 2] }
      }
    },
    "severity_badge": {
      "type": "badge",
      "position": { "x": 1100, "y": 30 },
      "visible_when": "severity in ['CRITICAL', 'HIGH']"
    }
  },

  "overlays": ["vignette_subtle"],

  "export_sizes": {
    "youtube": [1280, 720],
    "twitter": [1200, 675],
    "instagram": [1080, 1080]
  }
}
```

### Background Modes

| Mode | Use Case |
|------|----------|
| `fixed` | Use uploaded image(s), optional rotation |
| `ai` | Generate via Imagen 3 from prompt template |
| `hybrid` | AI background + fixed overlays |

### Zone Types

| Type | Description |
|------|-------------|
| `text` | Dynamic text with auto-sizing, color rules, effects |
| `badge` | Pre-made badge images selected by data value |
| `image` | Dynamic image selection (e.g., Keeper expressions) |
| `static` | Fixed overlay element |

---

## API Endpoints

### Templates

```
GET    /api/templates              # List all templates
POST   /api/templates              # Create new template
GET    /api/templates/:id          # Get template details
PUT    /api/templates/:id          # Update template
DELETE /api/templates/:id          # Delete template
POST   /api/templates/:id/duplicate # Copy template
```

### Assets

```
GET    /api/assets                 # List all assets
POST   /api/assets/upload          # Upload new asset
DELETE /api/assets/:id             # Delete asset
```

### Generation

```
POST   /api/generate               # Generate thumbnail (async)
GET    /api/generate/:job_id/status # Check job status
```

### Outputs

```
GET    /api/outputs                # List generated thumbnails
GET    /api/outputs/:id            # Get specific output
DELETE /api/outputs/:id            # Delete output
POST   /api/outputs/export         # Export to multiple sizes
```

---

## Pipeline Integration (Autonomous Mode)

### Request

```json
POST /api/generate
{
  "template_id": "cyber-v1",
  "episode_id": "2025-01-15-ep47",
  "data": {
    "headline": "EXCHANGE SERVER RCE",
    "severity": "CRITICAL",
    "cve_id": "CVE-2025-1234"
  },
  "variants": 1,
  "webhook_url": "http://localhost:8000/pipeline/thumbnail-ready"
}
```

### Immediate Response

```json
{
  "job_id": "abc123",
  "status": "processing"
}
```

### Webhook Callback (when complete)

```json
POST {webhook_url}
{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [
    {
      "path": "data/outputs/2025-01-15-ep47.png",
      "size": "youtube",
      "dimensions": [1280, 720]
    }
  ]
}
```

### Polling Alternative

```json
GET /api/generate/abc123/status

{
  "job_id": "abc123",
  "status": "complete",
  "outputs": [...]
}
```

---

## Generation Logic

```
INPUT:  template_id + episode_data
OUTPUT: thumbnail PNG(s)

STEP 1: LOAD TEMPLATE
        ├── Read template JSON
        ├── Load associated assets (fonts, overlays)
        └── Parse zone definitions

STEP 2: RESOLVE BACKGROUND
        ├── If mode == "fixed":
        │   └── Select from fixed_images (rotate or specified)
        ├── If mode == "ai":
        │   ├── Build prompt from template + episode_data
        │   ├── Call Imagen 3 API
        │   └── Handle failures with fallback_prompt
        └── Cache result for identical inputs

STEP 3: RENDER ZONES (bottom to top)
        ├── For each zone:
        │   ├── TEXT: Apply font, auto-size, color rules, effects
        │   ├── BADGE: Select variant by data value
        │   ├── IMAGE: Select from mapping (e.g., expressions)
        │   └── Position at zone coordinates

STEP 4: APPLY OVERLAYS
        └── Vignette, grain, gradients per template config

STEP 5: EXPORT
        ├── Save primary size (1280x720)
        ├── Generate additional sizes if configured
        └── Return paths + metadata
```

---

## Pipeline-Specific Configurations

### Cybersecurity Pipeline

**Default template settings:**
- Background mode: `fixed`
- Multiple host images for rotation
- Color-coded severity (CRITICAL=red, HIGH=orange)
- Bold Impact font for headlines

**Expected data fields:**
```json
{
  "headline": "MAIL SERVER CRITICAL",
  "severity": "CRITICAL",
  "cve_id": "CVE-2025-1234",
  "episode_date": "2025-01-15"
}
```

### The Keeper Pipeline

**Default template settings:**
- Background mode: `ai` (unique per story)
- Expression selector for 8 Keeper faces
- Atmospheric overlays (vignette, grain)
- Serif font for story titles

**Expected data fields:**
```json
{
  "title": "The House That Watched",
  "mood": "haunted",
  "keeper_expression": "mysterious",
  "episode_id": "EP-001"
}
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Imagen API failure | Retry 2x, then use fallback_prompt, then use solid color |
| Imagen content filter | Use fallback_prompt |
| Rate limit hit | Queue with exponential backoff |
| Missing asset | Return error, don't generate |
| Invalid template | Return validation errors |
| Long headline overflow | Auto-shrink to min size, then truncate with "..." |

---

## File Naming Convention

Generated thumbnails follow this pattern:

```
{episode_id}-{template_id}-{variant}.png

Examples:
- 2025-01-15-ep47-cyber-v1-1.png
- EP-001-keeper-v1-1.png
- EP-001-keeper-v1-2.png (variant 2)
```

---

## Environment Variables

```bash
# .env (gitignored)
GEMINI_API_KEY=your_key_here

# Optional
PORT=8000
DATA_DIR=./data
```

---

## Startup

```bash
# First time setup
cp .env.example .env
# Add your GEMINI_API_KEY

# Install dependencies
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..

# Run (development)
./start.sh

# Or manually:
# Terminal 1: cd backend && uvicorn main:app --reload
# Terminal 2: cd frontend && npm run dev
```

Access UI at `http://localhost:3000`

---

## Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| Template versioning | Medium | Rollback to previous versions |
| YouTube CTR analytics | Low | Pull performance data |
| Batch regeneration | Low | Update all thumbnails at once |
| Cloud backup sync | Low | Optional S3/GCS backup |
| Keyboard shortcuts | Low | Power user features |

---

## Summary

This system provides:

1. **Interactive UI** for designing and previewing thumbnails
2. **REST API** for autonomous pipeline integration
3. **Flexible templates** supporting fixed and AI-generated backgrounds
4. **Zone-based editing** with auto-sizing text and readability checks
5. **Size previews** showing actual YouTube display sizes
6. **Local-first storage** with no external dependencies
7. **Extensible design** for adding new pipelines easily

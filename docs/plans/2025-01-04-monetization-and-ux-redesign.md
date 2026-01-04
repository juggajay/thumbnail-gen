# ThumbGen Pro: Monetization & UX Redesign

**Date:** 2025-01-04
**Status:** Design Complete - Ready for Implementation

---

## Executive Summary

Transform ThumbGen from a thumbnail generator into a monetizable SaaS product with:
1. **Freemium model** with packaged tiers (no pay-per-use)
2. **Headline Helper** with real-time scoring based on research-backed rules
3. **Competitor Analyzer** to extract niche patterns from other channels
4. **Redesigned UX** with Generate Mode (90% of use) vs Design Mode (template setup)
5. **Queue system** unifying manual and API-driven generation

---

## Part 1: Target Audience & Value Proposition

### Primary Users

| Segment | Description | Key Need |
|---------|-------------|----------|
| **Solo YouTubers** | Individual creators without design skills | Professional thumbnails, fast |
| **Automation Creators** | Running content pipelines (like cybersecurity/keeper channels) | Hands-off generation via API |

### Core Differentiators

1. **Template Lock-in** - Set up once, generate forever with consistent style
2. **True Automation** - API-first design for pipeline integration
3. **CTR Optimization** - Built-in analyzer catches problems before publishing

### Value Proposition

> "Design your thumbnail template once. Generate professional, CTR-optimized thumbnails forever—manually or via API."

---

## Part 2: Monetization Structure

### Model: Freemium with Packaged Tiers

No pay-per-use complexity. Users upgrade for features, not credits.

### Free Tier

| Feature | Included |
|---------|----------|
| Template editor | Full access, unlimited templates |
| Fixed backgrounds | Unlimited (use your own images) |
| Manual generation | Unlimited through UI |
| Multi-size export | YouTube, Twitter, Instagram |
| Local storage | All data stays on your machine |
| Basic headline scoring | Length, readability checks |

### Pro Tier ($X/month)

| Feature | Included |
|---------|----------|
| Everything in Free | ✓ |
| AI backgrounds | Unlimited (Google Imagen 3) |
| Thumbnail analyzer | CTR analysis with Gemini 2.5 Flash |
| Headline helper (full) | Niche-specific scoring + AI suggestions |
| Competitor analyzer | Extract patterns from any channel |
| API access | Unlimited calls |
| Webhook callbacks | Pipeline integration |
| Batch generation | 10-50 thumbnails per request |
| Priority support | Direct access |

### Enterprise Tier (Custom)

| Feature | Included |
|---------|----------|
| Everything in Pro | ✓ |
| Multi-channel support | Manage multiple brands |
| Team access | Multiple users |
| Custom integrations | Dedicated support |
| SLA guarantees | Uptime commitments |

---

## Part 3: New Features

### 3.1 Headline Helper

**Purpose:** Help users write better thumbnail hooks using the same research-backed rules that power the existing analyzer.

**Knowledge Base (from existing `thumbnail_analyzer.py`):**
- MrBeast's rules: 3 words max, readable at mobile size
- VidIQ data: Power words, emotional triggers
- Mobile reality: 48pt minimum, 160x90px test size

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   HEADLINE HELPER                                                           │
│   ──────────────                                                            │
│                                                                             │
│   1. User types hook text                                                   │
│                     │                                                       │
│                     ▼                                                       │
│   2. Real-time scoring (debounced 300ms)                                   │
│      ├── Length score (word count vs niche patterns)                       │
│      ├── Readability score (will it fit at mobile size?)                   │
│      ├── Power words score (contains high-impact words?)                   │
│      └── Niche fit score (matches competitor patterns?)                    │
│                     │                                                       │
│                     ▼                                                       │
│   3. Visual feedback                                                        │
│      ├── Score bar (0-100%)                                                │
│      ├── Issue list (what's wrong)                                         │
│      └── Suggestions (click to apply)                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Scoring Dimensions:**

| Dimension | Weight | Source |
|-----------|--------|--------|
| Length | 30% | Universal rules (2-4 words optimal) |
| Readability | 25% | Calculated (chars, mobile fit) |
| Power Words | 25% | Niche profile from analyzer |
| Emotional Pull | 20% | Niche patterns (urgency, curiosity, etc.) |

**Free vs Pro:**
- **Free:** Length + Readability scoring (universal rules)
- **Pro:** Niche-specific scoring + AI-generated alternatives

### 3.2 Competitor Analyzer

**Purpose:** Extract thumbnail patterns from competitor channels to power niche-specific headline scoring.

**How It Works:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   COMPETITOR ANALYZER                                                       │
│   ───────────────────                                                       │
│                                                                             │
│   1. User inputs channel URL(s)                                            │
│                     │                                                       │
│                     ▼                                                       │
│   2. Fetch videos via YouTube Data API                                     │
│      GET /youtube/v3/search?channelId=...                                  │
│                     │                                                       │
│                     ▼                                                       │
│   3. Get thumbnail URLs                                                     │
│      https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg                    │
│                     │                                                       │
│                     ▼                                                       │
│   4. Extract hook text via Gemini 3.0 Flash Vision                        │
│      "What text appears on this YouTube thumbnail?"                        │
│                     │                                                       │
│                     ▼                                                       │
│   5. Compute patterns                                                       │
│      ├── Average word count                                                │
│      ├── Common power words                                                │
│      ├── Capitalization style                                              │
│      ├── Emotional tone                                                    │
│      └── Use of numbers                                                    │
│                     │                                                       │
│                     ▼                                                       │
│   6. Save niche profile                                                     │
│      data/analytics/niche-profiles/{niche}.json                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Niche Profile Schema:**

```json
{
  "niche": "cybersecurity",
  "updated_at": "2025-01-04T10:30:00Z",
  "analyzed_channels": [
    {"name": "NetworkChuck", "videos_analyzed": 50},
    {"name": "John Hammond", "videos_analyzed": 50}
  ],
  "patterns": {
    "word_count": { "avg": 3.2, "best_range": [2, 4] },
    "capitalization": "ALL_CAPS",
    "power_words": {
      "CRITICAL": 0.32,
      "EXPLOIT": 0.28,
      "HACK": 0.22,
      "STOP": 0.18,
      "WARNING": 0.15
    },
    "uses_numbers": 0.35,
    "emotional_tone": ["urgency", "danger", "technical"]
  }
}
```

### 3.3 Queue System

**Purpose:** Unify manual (UI) and automated (API) thumbnail generation with optional review step.

**Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   INPUT                     QUEUE                      OUTPUT               │
│   ─────                     ─────                      ──────               │
│                                                                             │
│   ┌─────────┐          ┌─────────────┐          ┌─────────────┐            │
│   │ Quick   │          │             │          │  Download   │            │
│   │ Generate│─────────▶│  Pending    │─────────▶│             │            │
│   │ (UI)    │          │  Review     │          │  Webhook    │            │
│   └─────────┘          │  Approved   │          │             │            │
│                        │             │          │  Upload     │            │
│   ┌─────────┐          │             │          └─────────────┘            │
│   │ API     │─────────▶│             │                                     │
│   │ Call    │          │             │                                     │
│   └─────────┘          └─────────────┘                                     │
│                               │                                             │
│                        ┌──────┴──────┐                                     │
│                        │ Auto-approve│                                     │
│                        │ [ON/OFF]    │                                     │
│                        └─────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Queue Item States:**
- `processing` - Currently generating
- `pending` - Awaiting review (if auto-approve OFF)
- `approved` - Ready for download/webhook
- `failed` - Generation failed

---

## Part 4: UX Redesign

### 4.1 Design Philosophy

**Core Insight:** Users do two fundamentally different things:

| Activity | Frequency | Mindset |
|----------|-----------|---------|
| **Design** (set up template) | Rarely | Creative, exploratory |
| **Generate** (make thumbnail) | Constantly | Task-focused, want speed |

**These should feel like two different modes of the same app.**

### 4.2 Aesthetic Direction: "Creative Command Center"

Dark, moody, professional—but with personality. Think high-tech control room meets creative studio.

**Color System:**

```css
:root {
  /* Backgrounds - deep, layered */
  --bg-void: #050506;         /* Deepest black */
  --bg-deep: #0a0a0c;         /* Primary background */
  --bg-surface: #111114;      /* Cards, panels */
  --bg-elevated: #18181c;     /* Hover states, inputs */
  --bg-overlay: #1f1f24;      /* Modals, dropdowns */

  /* Borders - subtle definition */
  --border-subtle: #1f1f24;
  --border-default: #2a2a30;
  --border-strong: #3a3a42;

  /* Text - high contrast hierarchy */
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --text-muted: #52525b;

  /* Accent - electric cyan (stands out on dark) */
  --accent: #22d3ee;
  --accent-hover: #06b6d4;
  --accent-glow: rgba(34, 211, 238, 0.15);
  --accent-strong: #67e8f9;

  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Gradients */
  --gradient-glow: radial-gradient(ellipse at 50% 0%, var(--accent-glow), transparent 70%);
  --gradient-surface: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%);
}
```

**Typography:**

```css
:root {
  /* Display - bold, distinctive */
  --font-display: 'Space Grotesk', 'SF Pro Display', system-ui;

  /* Body - clean, readable */
  --font-body: 'IBM Plex Sans', 'SF Pro Text', system-ui;

  /* Mono - for technical elements */
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

Wait - the skill says avoid Space Grotesk. Let me pick something more distinctive:

```css
:root {
  /* Display - Distinctive, modern geometric */
  --font-display: 'Sora', 'Outfit', sans-serif;

  /* Body - Humanist, readable */
  --font-body: 'Plus Jakarta Sans', 'Source Sans 3', sans-serif;

  /* Mono - for technical elements */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 4.3 Layout Structure

**Current vs New:**

```
CURRENT:                              NEW:
┌────────────────────────────────┐    ┌────────────────────────────────┐
│ Header [Editor|Assets|...]     │    │ Header [Template ▼] [Gen|Design]│
├────────┬───────────────────────┤    ├────────────────────────────────┤
│        │                       │    │                                │
│Sidebar │    Canvas + Editor    │    │      MODE-SPECIFIC CONTENT     │
│        │                       │    │                                │
│        │                       │    │      (Generate or Design)      │
│        │                       │    │                                │
└────────┴───────────────────────┘    └────────────────────────────────┘
                                                               │
                                                      Queue slides in ─┘
```

### 4.4 Header Redesign

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────┐                                                                   │
│  │ ◆ THUMB  │   Cybersecurity v1 ▼    ┌─────────────────────┐     ┌──────────┐│
│  │   GEN    │                         │ ▣ Generate │ Design │     │ Queue(2) ││
│  └──────────┘                         └─────────────────────┘     └──────────┘│
│                                              ▲                                  │
│                                        Mode toggle                              │
│                                     (pill selector)                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- **Logo simplified** - Clean mark + wordmark
- **Template selector** - Dropdown in header (not sidebar)
- **Mode toggle** - Primary navigation (Generate | Design)
- **Queue badge** - Shows pending items, opens slide-out panel
- **Removed tabs** - Assets/Outputs/Settings become secondary (accessed via menu or sidebar in Design mode)

### 4.5 Generate Mode

This is where 90% of time is spent. Must be **frictionless**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌───────────────────────────────────┐  ┌───────────────────────────────────┐ │
│   │                                   │  │                                   │ │
│   │         DATA INPUT                │  │         LIVE PREVIEW              │ │
│   │                                   │  │                                   │ │
│   │  Episode ID                       │  │   ┌───────────────────────────┐   │ │
│   │  ┌─────────────────────────────┐  │  │   │                           │   │ │
│   │  │ 2025-01-04-ep47             │  │  │   │                           │   │ │
│   │  └─────────────────────────────┘  │  │   │      THUMBNAIL            │   │ │
│   │                                   │  │   │      PREVIEW               │   │ │
│   │  Hook                             │  │   │      (live updates)        │   │ │
│   │  ┌─────────────────────────────┐  │  │   │                           │   │ │
│   │  │ CRITICAL EXCHANGE RCE       │  │  │   │                           │   │ │
│   │  └─────────────────────────────┘  │  │   └───────────────────────────┘   │ │
│   │  ┌─────────────────────────────┐  │  │                                   │ │
│   │  │ ████████████████░░░░ 82%    │  │  │   Size Previews                   │ │
│   │  │ ✓ Good length (3 words)     │  │  │   ┌────────┐ ┌────────┐           │ │
│   │  │ ✓ Power word: CRITICAL      │  │  │   │ Search │ │ Mobile │           │ │
│   │  │ ⚠ Consider: EXPLOIT, HACK   │  │  │   │  360px │ │  168px │           │ │
│   │  └─────────────────────────────┘  │  │   └────────┘ └────────┘           │ │
│   │                                   │  │                                   │ │
│   │  Severity                         │  │   ⚠️ Text may be hard to read    │ │
│   │  ┌─────────────────────────────┐  │  │      on mobile                    │ │
│   │  │ ● CRITICAL  ○ HIGH  ○ MED   │  │  │                                   │ │
│   │  └─────────────────────────────┘  │  │   ─────────────────────────────── │ │
│   │                                   │  │                                   │ │
│   │  ┌─────────────────────────────┐  │  │   🤖 For automation:              │ │
│   │  │                             │  │  │   ▶ Show API request              │ │
│   │  │      ✨ GENERATE            │  │  │                                   │ │
│   │  │                             │  │  │                                   │ │
│   │  └─────────────────────────────┘  │  │                                   │ │
│   │                                   │  │                                   │ │
│   │  ☐ Generate 3 variants            │  │                                   │ │
│   │  ☐ Use AI background              │  │                                   │ │
│   │                                   │  │                                   │ │
│   └───────────────────────────────────┘  └───────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Form auto-generates from template schema**
   - Template has a "hook" zone → form shows "Hook" field
   - Template has a "severity" enum → form shows radio buttons

2. **Headline Helper inline**
   - Score bar appears below hook field
   - Updates as you type (debounced)
   - Click suggestions to apply

3. **Live preview updates instantly**
   - No "Preview" button needed
   - Debounced 300ms after typing stops

4. **Size previews always visible**
   - Shows how it looks at YouTube sizes
   - Warnings appear automatically

5. **API section collapsed by default**
   - New users don't see it
   - Power users expand to copy request

6. **One big Generate button**
   - Unmissable, high contrast
   - Keyboard shortcut: `Cmd/Ctrl + Enter`

### 4.6 Design Mode

Full editor for template setup. More complex, but used infrequently.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Header]                                                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │                             CANVAS                                      │   │
│  │                                                                         │   │
│  │    ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │    │                                                                 │ │   │
│  │    │                    [Background Image]                           │ │   │
│  │    │                                                                 │ │   │
│  │    │         ┌─────────────────┐                                     │ │   │
│  │    │         │ ┈ BADGE ┈┈┈┈┈┈ ○│ ← resize handle                    │ │   │
│  │    │         └─────────────────┘                                     │ │   │
│  │    │                                                                 │ │   │
│  │    │   ┌────────────────────────────────────────────────────────┐   │ │   │
│  │    │   │ ═══════════ HOOK (selected) ═══════════════════════ ○ │   │ │   │
│  │    │   └────────────────────────────────────────────────────────┘   │ │   │
│  │    │                                                                 │ │   │
│  │    └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                         │   │
│  │    Toolbar: [Move BG] [Move Subject] [Zone: hook ▼] [Draw]             │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PROPERTIES (contextual - shows selected zone)                          │   │
│  │                                                                         │   │
│  │  Zone: hook                                          Type: text         │   │
│  │                                                                         │   │
│  │  Position        Typography        Colors           Effects             │   │
│  │  ┌────┬────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │X:50│Y:50│    │Font: Impact  │  │Text: #FFFFFF │  │Stroke: 4px   │   │   │
│  │  │W:  │H:  │    │Size: 48-96   │  │Rule: severity│  │Shadow: 8px   │   │   │
│  │  └────┴────┘    │Transform: UP │  └──────────────┘  └──────────────┘   │   │
│  │                 └──────────────┘                                        │   │
│  │  [+ Add Zone]                                                           │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────┐            │
│  │  SIDEBAR TABS: [Background] [Subject] [Assets] [Outputs]      │            │
│  └────────────────────────────────────────────────────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Canvas is interactive**
   - Click zones to select
   - Drag to reposition
   - Corner handles to resize

2. **Properties panel is contextual**
   - Shows only what's relevant to selection
   - Nothing selected → template settings

3. **Horizontal property layout**
   - Less scrolling than current vertical layout
   - Grouped by concern (Position, Typography, Colors, Effects)

4. **Secondary tabs at bottom**
   - Background, Subject, Assets, Outputs
   - Not cluttering main view

### 4.7 Queue Panel (Slide-Out)

Slides in from right when clicking Queue badge:

```
┌────────────────────────────────────────┐ ┌────────────────────────────────┐
│                                        │ │  Queue                     [×] │
│                                        │ │                                │
│                                        │ │  ┌──────────────────────────┐ │
│       MAIN CONTENT                     │ │  │ ┌─────┐                  │ │
│       (dimmed)                         │ │  │ │thumb│ EP-047            │ │
│                                        │ │  │ └─────┘ CRITICAL EXCHANGE │ │
│                                        │ │  │         2 min ago      ✓  │ │
│                                        │ │  │         [Download]        │ │
│                                        │ │  └──────────────────────────┘ │
│                                        │ │                                │
│                                        │ │  ┌──────────────────────────┐ │
│                                        │ │  │ ┌─────┐                  │ │
│                                        │ │  │ │thumb│ EP-046            │ │
│                                        │ │  │ └─────┘ AUTH BYPASS       │ │
│                                        │ │  │         Just now       ⏳ │ │
│                                        │ │  │         [Approve] [×]     │ │
│                                        │ │  └──────────────────────────┘ │
│                                        │ │                                │
│                                        │ │  ────────────────────────────  │
│                                        │ │                                │
│                                        │ │  Auto-approve                  │
│                                        │ │  ┌────────────────────────┐   │
│                                        │ │  │ ●●●●●●●●○○○ ON         │   │
│                                        │ │  └────────────────────────┘   │
│                                        │ │                                │
└────────────────────────────────────────┘ └────────────────────────────────┘
```

### 4.8 Template Selector (Dropdown Modal)

Click template name in header → modal appears:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                        ┌────────────────────────────────────┐                  │
│                        │  Your Templates    [+ New Template] │                  │
│                        ├────────────────────────────────────┤                  │
│                        │                                    │                  │
│                        │  ┌──────────┐ ┌──────────┐         │                  │
│                        │  │  [img]   │ │  [img]   │         │                  │
│                        │  │          │ │          │         │                  │
│                        │  │ Cyber v1 │ │ Cyber v2 │         │                  │
│                        │  │ ████████ │ │          │         │                  │
│                        │  └──────────┘ └──────────┘         │                  │
│                        │                                    │                  │
│                        │  ──────────────────────────────    │                  │
│                        │  Recent                            │                  │
│                        │  Cyber v1 • Keeper Stories         │                  │
│                        │                                    │                  │
│                        └────────────────────────────────────┘                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.9 First-Time Experience

On first launch:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│                         ┌─────────────────────────────────┐                    │
│                         │                                 │                    │
│                         │        ◆ THUMBGEN               │                    │
│                         │                                 │                    │
│                         │   Professional thumbnails       │                    │
│                         │   in seconds, not hours.        │                    │
│                         │                                 │                    │
│                         │   ┌───────────────────────────┐ │                    │
│                         │   │                           │ │                    │
│                         │   │   📦 Start with Preset    │ │                    │
│                         │   │                           │ │                    │
│                         │   │   Get going in 30 seconds │ │                    │
│                         │   │                           │ │                    │
│                         │   └───────────────────────────┘ │                    │
│                         │                                 │                    │
│                         │   ┌───────────────────────────┐ │                    │
│                         │   │                           │ │                    │
│                         │   │   🎨 Blank Canvas         │ │                    │
│                         │   │                           │ │                    │
│                         │   │   Full control, your way  │ │                    │
│                         │   │                           │ │                    │
│                         │   └───────────────────────────┘ │                    │
│                         │                                 │                    │
│                         │   Skip, I know what I'm doing   │                    │
│                         │                                 │                    │
│                         └─────────────────────────────────┘                    │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**"Start with Preset"** → Preset gallery:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                           Choose Your Style                                     │
│                                                                                 │
│   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│   │                │ │                │ │                │ │                │  │
│   │   [preview]    │ │   [preview]    │ │   [preview]    │ │   [preview]    │  │
│   │                │ │                │ │                │ │                │  │
│   │     NEWS       │ │    GAMING      │ │   TUTORIAL     │ │    STORY       │  │
│   │                │ │                │ │                │ │                │  │
│   │  Bold & urgent │ │   Energetic    │ │  Clean & clear │ │   Cinematic    │  │
│   │                │ │                │ │                │ │                │  │
│   └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘  │
│                                                                                 │
│                                [← Back]                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Visual Design Details

### 5.1 Component Styling

**Buttons:**

```css
/* Primary (Generate) */
.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: var(--bg-void);
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 10px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.1) inset,
    0 4px 20px var(--accent-glow);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.2) inset,
    0 8px 30px var(--accent-glow);
}

/* Secondary */
.btn-secondary {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--bg-overlay);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
```

**Inputs:**

```css
.input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input::placeholder {
  color: var(--text-muted);
}
```

**Score Bar (Headline Helper):**

```css
.score-bar {
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background 0.3s ease;
}

.score-bar-fill[data-score="excellent"] {
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
}

.score-bar-fill[data-score="good"] {
  background: var(--success);
}

.score-bar-fill[data-score="needs-work"] {
  background: var(--warning);
}

.score-bar-fill[data-score="poor"] {
  background: var(--error);
}
```

### 5.2 Animations

**Mode Transition:**

```css
.mode-content {
  animation: modeIn 0.3s ease-out;
}

@keyframes modeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Queue Slide:**

```css
.queue-panel {
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.queue-panel.open {
  transform: translateX(0);
}
```

**Live Preview Update:**

```css
.preview-image {
  transition: opacity 0.2s ease;
}

.preview-image.updating {
  opacity: 0.7;
}
```

**Generate Button Pulse (when ready):**

```css
.btn-generate-ready {
  animation: gentlePulse 2s ease-in-out infinite;
}

@keyframes gentlePulse {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--accent-glow);
  }
  50% {
    box-shadow: 0 0 0 8px transparent;
  }
}
```

### 5.3 Micro-Interactions

| Element | Trigger | Effect |
|---------|---------|--------|
| Generate button | Click | Ripple + spinner |
| Preview | Content change | Crossfade (200ms) |
| Queue item | Added | Slide from right |
| Mode toggle | Click | Content fade-swap |
| Zone on canvas | Hover | Subtle highlight |
| Score bar | Score change | Smooth width + color |
| Template card | Hover | Lift + shadow |
| Dropdown | Open | Scale from origin |

---

## Part 6: Data Storage

### 6.1 New Directory Structure

```
data/
├── templates/                      # Existing
│   └── {template-id}.json
├── assets/                         # Existing
│   ├── backgrounds/
│   ├── fonts/
│   ├── overlays/
│   └── subjects/
├── outputs/                        # Existing
│   └── {episode-id}-{template-id}.png
├── analytics/                      # NEW
│   └── niche-profiles/
│       ├── cybersecurity.json
│       ├── gaming.json
│       └── ...
├── queue/                          # NEW
│   ├── pending/
│   │   └── {job-id}.json
│   └── completed/
│       └── {job-id}.json
└── config.json                     # Existing
```

### 6.2 Niche Profile Schema

```typescript
interface NicheProfile {
  niche: string;
  updated_at: string;
  analyzed_channels: {
    name: string;
    channel_id: string;
    videos_analyzed: number;
  }[];
  patterns: {
    word_count: {
      avg: number;
      min: number;
      max: number;
      best_range: [number, number];
    };
    capitalization: 'ALL_CAPS' | 'Title Case' | 'mixed';
    power_words: Record<string, number>;  // word -> frequency
    uses_numbers: number;  // 0-1 percentage
    emotional_tone: string[];
  };
}
```

### 6.3 Queue Item Schema

```typescript
interface QueueItem {
  id: string;
  template_id: string;
  episode_id: string;
  data: Record<string, string>;
  status: 'processing' | 'pending' | 'approved' | 'failed';
  source: 'ui' | 'api';
  created_at: string;
  completed_at?: string;
  output_path?: string;
  error?: string;
}
```

---

## Part 7: Backend Changes

### 7.1 New Services

**`backend/services/headline_scorer.py`**

```python
class HeadlineScorer:
    """Scores hook text based on research-backed rules and niche patterns."""

    def __init__(self):
        self.universal_rules = UniversalRules()
        self.niche_profiles = NicheProfileLoader()

    def score(self, text: str, niche: str = None) -> HeadlineScore:
        """
        Score a hook text.

        Returns:
            HeadlineScore with overall score, dimension scores,
            issues list, and suggestions.
        """
        pass

    def get_suggestions(self, text: str, niche: str = None) -> list[str]:
        """Generate alternative hook suggestions."""
        pass
```

**`backend/services/competitor_analyzer.py`**

```python
class CompetitorAnalyzer:
    """Analyzes competitor thumbnails to extract niche patterns."""

    def __init__(self):
        self.youtube_client = YouTubeDataClient()
        self.vision_client = GeminiVisionClient()  # Gemini 3.0 Flash

    async def analyze_channel(self, channel_url: str, max_videos: int = 50) -> NichePatterns:
        """
        Analyze thumbnails from a YouTube channel.

        1. Fetch video list
        2. Get thumbnail URLs
        3. Extract hook text via Vision
        4. Compute patterns
        """
        pass

    async def save_niche_profile(self, niche: str, patterns: NichePatterns):
        """Save patterns to niche profile file."""
        pass
```

**`backend/services/queue_manager.py`**

```python
class QueueManager:
    """Manages the thumbnail generation queue."""

    def __init__(self):
        self.queue_dir = Path("./data/queue")
        self.auto_approve = True  # Default setting

    async def add(self, job: QueueJob) -> str:
        """Add a job to the queue. Returns job ID."""
        pass

    async def process_next(self):
        """Process the next pending job."""
        pass

    async def approve(self, job_id: str):
        """Approve a pending job."""
        pass

    async def get_pending(self) -> list[QueueItem]:
        """Get all pending jobs."""
        pass
```

### 7.2 New Routes

**`backend/routes/headline.py`**

```python
router = APIRouter(prefix="/api/headline", tags=["headline"])

@router.post("/score")
async def score_headline(request: HeadlineScoreRequest) -> HeadlineScore:
    """Score a hook text for CTR optimization."""
    pass

@router.post("/suggest")
async def suggest_headlines(request: HeadlineSuggestRequest) -> list[str]:
    """Generate alternative hook suggestions using AI."""
    pass
```

**`backend/routes/competitor.py`**

```python
router = APIRouter(prefix="/api/competitor", tags=["competitor"])

@router.post("/analyze")
async def analyze_channel(request: AnalyzeChannelRequest) -> AnalysisResult:
    """Analyze a competitor channel's thumbnails."""
    pass

@router.get("/niche/{niche}")
async def get_niche_profile(niche: str) -> NicheProfile:
    """Get stored niche profile."""
    pass

@router.get("/niches")
async def list_niches() -> list[str]:
    """List all available niche profiles."""
    pass
```

**`backend/routes/queue.py`**

```python
router = APIRouter(prefix="/api/queue", tags=["queue"])

@router.get("")
async def get_queue() -> list[QueueItem]:
    """Get all queue items."""
    pass

@router.post("/{job_id}/approve")
async def approve_job(job_id: str):
    """Approve a pending job."""
    pass

@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete/cancel a job."""
    pass

@router.patch("/settings")
async def update_queue_settings(settings: QueueSettings):
    """Update queue settings (auto-approve, etc.)."""
    pass
```

---

## Part 8: Frontend Changes

### 8.1 New Components

```
frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx          # MODIFY - add mode toggle, template selector
│   │   ├── Sidebar.tsx         # MODIFY - only show in Design mode
│   │   └── QueuePanel.tsx      # NEW - slide-out queue
│   ├── Generate/               # NEW
│   │   ├── GenerateMode.tsx    # Main generate mode container
│   │   ├── DataForm.tsx        # Auto-generated form from template schema
│   │   ├── HeadlineInput.tsx   # Input with scoring
│   │   ├── LivePreview.tsx     # Real-time preview
│   │   ├── SizePreview.tsx     # Size comparison
│   │   └── ApiPanel.tsx        # Collapsible API request display
│   ├── Design/                 # REFACTOR from Editor/
│   │   ├── DesignMode.tsx      # Main design mode container
│   │   ├── Canvas.tsx          # Existing, enhanced
│   │   ├── PropertiesPanel.tsx # Contextual properties
│   │   └── ...
│   ├── Analyze/                # NEW
│   │   ├── CompetitorAnalyzer.tsx
│   │   └── NicheSelector.tsx
│   ├── Onboarding/             # NEW
│   │   ├── Welcome.tsx
│   │   └── PresetGallery.tsx
│   └── ...
├── hooks/
│   ├── useHeadlineScore.ts     # NEW - real-time scoring hook
│   ├── useQueue.ts             # NEW - queue state management
│   └── ...
└── store/
    ├── index.ts                # MODIFY - add mode, queue state
    └── ...
```

### 8.2 Store Changes

```typescript
interface AppState {
  // Existing
  templates: Template[];
  selectedTemplate: Template | null;
  assets: Assets;
  outputs: Output[];
  previewData: Record<string, string>;
  previewImage: string | null;
  isGenerating: boolean;

  // NEW
  mode: 'generate' | 'design';
  setMode: (mode: 'generate' | 'design') => void;

  queue: QueueItem[];
  queuePanelOpen: boolean;
  autoApprove: boolean;
  loadQueue: () => Promise<void>;
  approveJob: (jobId: string) => Promise<void>;

  nicheProfiles: Record<string, NicheProfile>;
  activeNiche: string | null;
  loadNicheProfiles: () => Promise<void>;

  headlineScore: HeadlineScore | null;
  scoreHeadline: (text: string) => Promise<void>;

  isFirstTime: boolean;
  completeOnboarding: () => void;
}
```

---

## Part 9: Implementation Order

### Phase 1: Core UX Restructure (Week 1)

1. **Header redesign** - Mode toggle, template selector dropdown
2. **Generate Mode** - New component with form + preview
3. **Design Mode** - Refactor existing editor
4. **Mode switching** - Smooth transition between modes
5. **Store updates** - Mode state, form data binding

### Phase 2: Headline Helper (Week 2)

1. **Backend:** `headline_scorer.py` with universal rules
2. **Frontend:** `HeadlineInput.tsx` with inline scoring
3. **Real-time scoring** - Debounced updates as user types
4. **Suggestions UI** - Clickable alternatives

### Phase 3: Competitor Analyzer (Week 2-3)

1. **Backend:** `competitor_analyzer.py` with Gemini Vision
2. **Backend:** YouTube Data API integration
3. **Frontend:** Analyzer UI in Design mode
4. **Niche profiles** - Storage and loading
5. **Integrate with Headline Helper** - Niche-specific scoring

### Phase 4: Queue System (Week 3)

1. **Backend:** `queue_manager.py`
2. **Frontend:** `QueuePanel.tsx` slide-out
3. **API integration** - Jobs from API go to queue
4. **Auto-approve toggle** - Settings management

### Phase 5: Polish & Onboarding (Week 4)

1. **Onboarding flow** - First-time wizard, presets
2. **Animations** - Mode transitions, micro-interactions
3. **Visual polish** - Colors, typography, spacing
4. **Keyboard shortcuts** - Power user features

---

## Part 10: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Generate thumbnail |
| `Cmd/Ctrl + D` | Switch to Design mode |
| `Cmd/Ctrl + G` | Switch to Generate mode |
| `Cmd/Ctrl + K` | Open template selector |
| `Cmd/Ctrl + Q` | Toggle Queue panel |
| `Tab` | Next field |
| `Escape` | Close modal/panel |
| `Cmd/Ctrl + S` | Save template (Design mode) |
| `Cmd/Ctrl + Z` | Undo (Design mode) |

---

## Appendix A: Font Loading

Add to `frontend/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

---

## Appendix B: Environment Variables

```env
# Existing
GEMINI_API_KEY=your-gemini-api-key

# New
YOUTUBE_API_KEY=your-youtube-data-api-key
```

---

## Summary

This design transforms ThumbGen into a monetizable product by:

1. **Restructuring UX** around Generate (frequent) vs Design (rare) modes
2. **Adding Headline Helper** for real-time hook scoring using research-backed rules
3. **Adding Competitor Analyzer** to extract niche-specific patterns
4. **Unifying generation** via Queue system for both manual and API use
5. **Polishing visuals** with distinctive typography, colors, and animations

The result is a tool that feels premium, works effortlessly for daily use, and provides genuine value worth paying for.

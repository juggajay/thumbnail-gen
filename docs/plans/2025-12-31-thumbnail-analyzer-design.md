# Thumbnail CTR Analyzer - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI-powered thumbnail analysis that provides fact-based CTR feedback with scores and actionable fixes.

**Architecture:** Slide-out panel with Gemini 3 Vision integration. Analyzes rendered thumbnail against researched CTR principles, returns scorecard with category breakdowns and specific fixes.

**Tech Stack:** Gemini 3 Flash (vision), React slide-out panel, FastAPI endpoint, localStorage for persistent settings.

---

## User Flow

1. User clicks "Analyze" toggle button (left edge of canvas)
2. Panel slides out from left (400px wide)
3. User optionally enters video context (title/topic, target emotion)
4. User clicks "Analyze" button
5. System captures current canvas as PNG
6. Sends to Gemini 3 Vision with: image + persistent context + video context
7. AI returns structured JSON with scores and recommendations
8. Panel displays scorecard with overall score, top priorities, category breakdowns
9. User makes edits, clicks "Re-Analyze" to check improvements
10. Panel can be toggled open/closed while editing

---

## Data Structures

### Persistent Settings (localStorage)

```typescript
interface AnalysisSettings {
  niche: string;              // "true_crime", "gaming", "tech", etc.
  targetAudience: string;     // "25-45, true crime enthusiasts"
  channelStyle: string;       // "dark_moody", "bright_bold", etc.
  competitors: string;        // "JCS, MrBallen, That Chapter"
}
```

### Per-Thumbnail Context

```typescript
interface VideoContext {
  title: string;              // "The Man That Wasn't - unsolved disappearance"
  targetEmotion: string;      // "unease", "curiosity", "shock", etc.
}
```

### Analysis Result

```typescript
interface AnalysisResult {
  overall_score: number;      // 1-10
  verdict: string;            // "Strong mood, text needs mobile optimization"
  top_priorities: Priority[];
  categories: CategoryResult[];
  generated_at: string;
}

interface Priority {
  issue: string;
  fix: string;
  impact: "high" | "medium" | "low";
}

interface CategoryResult {
  name: string;
  score: number;
  status: "excellent" | "good" | "needs_work" | "poor";
  summary: string;
  why_it_matters: string;
  whats_working: string[];
  whats_not: string[];
  fixes: string[];
}
```

---

## Analysis Categories (Ordered by CTR Impact)

| Priority | Category | What AI Evaluates |
|----------|----------|-------------------|
| Critical | **Mobile Readability** | How thumbnail looks at 160x90px browse size. Text legibility, face visibility, overall clarity at small scale. |
| Critical | **Face & Emotion** | Face visibility (should be 40-60% of frame), expression intensity, eye contact, emotion clarity. |
| High | **Visual Simplicity** | Element count (max 3), clutter, clear focal point, competing elements. |
| High | **Text Effectiveness** | Word count (max 4), size, contrast, placement, does it add context image doesn't provide, not covering face. |
| Medium | **Contrast & Pop** | Subject-background separation, color impact, pattern interrupt potential, stands out in feed. |
| Medium | **Curiosity Factor** | Creates intrigue, unanswered questions, "I need to click" feeling, curiosity gap. |

---

## UI Design

### Panel Layout (400px, slides from left)

```
┌─────────────────────────────────┐
│ ✕  THUMBNAIL ANALYSIS        ⚙️ │  ← Header: close + settings
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │      OVERALL SCORE          │ │
│ │         7.4/10              │ │  ← Large circular score
│ │      ●●●●●●●○○○             │ │
│ │  "Good - text needs work"   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 📱 MOBILE PREVIEW               │
│ ┌────────────┐                  │
│ │  160x90    │ ← Actual size    │
│ └────────────┘                  │
│ Can you read text? See face?    │
├─────────────────────────────────┤
│ 🎯 TOP PRIORITIES               │
│ ┌─────────────────────────────┐ │
│ │ 🔴 Increase text size 40%   │ │
│ │ 🔴 Move text off face       │ │
│ │ 🟡 Add stroke to text       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ BREAKDOWN                    ▼  │
│ ┌─────────────────────────────┐ │
│ │ 📱 Mobile Readability  5/10 │ │
│ │ Text illegible at browse... │ │
│ │ 💡 Why: 70% of viewers...   │ │
│ │ ✅ Face visible             │ │
│ │ ❌ Text too small           │ │
│ │ 🔧 Fixes:                   │ │
│ │    • Reduce to 2-3 words    │ │
│ │    • Increase size 40%      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 😮 Face & Emotion      8/10 │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│        ... more categories      │
├─────────────────────────────────┤
│ 📝 VIDEO CONTEXT                │
│ ┌─────────────────────────────┐ │
│ │ Title/topic of video...     │ │
│ └─────────────────────────────┘ │
│ Target Emotion: [Unease     ▼]  │
├─────────────────────────────────┤
│      [ ⚡ Analyze Thumbnail ]   │
└─────────────────────────────────┘
```

### Settings Modal

```
┌─────────────────────────────────────────────┐
│ ⚙️  ANALYSIS SETTINGS                    ✕  │
├─────────────────────────────────────────────┤
│ CHANNEL NICHE                               │
│ [ True Crime                            ▼ ] │
│                                             │
│ TARGET AUDIENCE                             │
│ [ 25-45, true crime enthusiasts, mostly   ] │
│ [ female, binge-watchers                  ] │
│                                             │
│ CHANNEL STYLE                               │
│ [ Dark & Moody                          ▼ ] │
│                                             │
│ COMPETITORS (optional)                      │
│ [ JCS, MrBallen, That Chapter             ] │
├─────────────────────────────────────────────┤
│              [ Save Settings ]              │
└─────────────────────────────────────────────┘
```

### Niche Options
- True Crime
- Gaming
- Tech/Reviews
- Commentary/Essays
- Vlogs
- Education
- Finance
- Horror/Scary
- Reactions
- Documentary
- Custom...

### Channel Style Options
- Dark & Moody
- Bright & Bold
- Clean & Minimal
- Chaotic & Energetic
- Cinematic
- Custom...

### Target Emotion Options
- Curiosity
- Shock
- Fear
- Excitement
- Unease/Mystery
- Outrage
- Intrigue

### Score Colors
- 1-4: Red (poor)
- 5-6: Yellow (needs work)
- 7-8: Green (good)
- 9-10: Blue/Gold (excellent)

---

## API Design

### Endpoint

```
POST /api/analyze
Content-Type: application/json

Request:
{
  "image": "base64-encoded-png",
  "context": {
    "niche": "true_crime",
    "target_audience": "25-45, true crime enthusiasts",
    "channel_style": "dark_moody",
    "competitors": "JCS, MrBallen, That Chapter",
    "video_title": "The Man That Wasn't - unsolved disappearance",
    "target_emotion": "unease"
  }
}

Response:
{
  "overall_score": 7.2,
  "verdict": "Strong Southern Gothic mood. Text needs mobile optimization.",
  "top_priorities": [
    {
      "issue": "Text too small for mobile viewing",
      "fix": "Increase text size by 40% or reduce to 2 words",
      "impact": "high"
    },
    {
      "issue": "Text partially covers subject's face",
      "fix": "Move text to left third, keep face clear",
      "impact": "high"
    }
  ],
  "categories": [
    {
      "name": "Mobile Readability",
      "score": 5,
      "status": "needs_work",
      "summary": "Text becomes illegible at YouTube browse size",
      "why_it_matters": "70% of YouTube viewers browse on mobile where your thumbnail displays at just 160x90 pixels. If they can't read it in under 1 second, they scroll past.",
      "whats_working": [
        "Face clearly visible at small size",
        "Good subject-background contrast"
      ],
      "whats_not": [
        "Text too small - illegible below 300px width",
        "5 words competing for attention"
      ],
      "fixes": [
        "Reduce text to 2-3 words maximum",
        "Increase text size by 40%",
        "Add thicker stroke (4-6px) for contrast"
      ]
    }
    // ... more categories
  ],
  "generated_at": "2025-12-31T14:30:00Z"
}
```

---

## Gemini Vision Integration

### Model
- **Primary:** `gemini-3-flash-preview` (fast, good for iterative analysis)
- **Fallback:** `gemini-3-pro-preview` (if more thorough analysis needed)

### Configuration
```python
response = client.models.generate_content(
    model='gemini-3-flash-preview',
    contents=[
        types.Part.from_bytes(data=image_data, mime_type='image/png'),
        ANALYSIS_PROMPT
    ],
    config=types.GenerateContentConfig(
        temperature=0.3,
        response_mime_type='application/json',
    )
)
```

### Prompt Structure

The system prompt will be loaded with:

1. **Role:** YouTube thumbnail CTR expert consultant
2. **Research Data:**
   - MrBeast's thumbnail rules (3 elements max, faces dominate, high contrast)
   - VidIQ data (faces +38% CTR, 4 words max, emotion 2x engagement)
   - Eye-tracking studies (face first, then text, then background)
   - Mobile-first principles (160x90 browse size)
3. **User Context:** Niche, audience, style, competitors, video info
4. **Output Schema:** Strict JSON format for parsing
5. **Instructions:** Be specific, give measurable feedback, prioritize by impact

---

## File Structure

```
backend/
├── routes/
│   └── analyze.py              # POST /api/analyze endpoint
├── services/
│   └── thumbnail_analyzer.py   # Gemini Vision integration + prompt

frontend/src/
├── components/
│   └── Analysis/
│       ├── AnalysisPanel.tsx       # Main slide-out panel
│       ├── AnalysisToggle.tsx      # Left-edge toggle button
│       ├── OverallScore.tsx        # Circular score display
│       ├── MobilePreview.tsx       # 160x90 thumbnail preview
│       ├── TopPriorities.tsx       # Priority fixes list
│       ├── CategoryBreakdown.tsx   # Expandable category sections
│       ├── VideoContextForm.tsx    # Title + emotion inputs
│       └── AnalysisSettings.tsx    # Settings modal
├── api/
│   └── client.ts               # Add analyze.thumbnail() method
└── store/
    └── index.ts                # Add analysis state slice
```

---

## State Management

### Store Additions

```typescript
// Zustand store additions
interface AnalysisState {
  // Panel state
  isPanelOpen: boolean;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;

  // Video context (per-thumbnail)
  videoTitle: string;
  targetEmotion: string;

  // Actions
  togglePanel: () => void;
  setVideoContext: (title: string, emotion: string) => void;
  analyzeThumb: () => Promise<void>;
  clearResult: () => void;
}

// Persistent settings (localStorage, separate from store)
// Loaded on app init, saved on settings change
```

---

## Implementation Notes

1. **Canvas Capture:** Use existing canvas element, render to PNG blob for API
2. **Panel Animation:** CSS transform with 200ms ease transition
3. **Keyboard Shortcut:** `Ctrl+Shift+A` to toggle panel
4. **Error Handling:** Show error in panel if API fails, allow retry
5. **Loading State:** Skeleton UI while analyzing (~3-5 seconds)
6. **Re-analyze:** Clear previous result, show loading, fetch new

---

## Future Enhancements (Not V1)

- A/B comparison mode (compare two thumbnail versions)
- History tracking (see score improvements over time)
- Competitor analysis (upload competitor thumbnails to compare)
- Auto-suggestions (AI proposes text alternatives)
- Export report as PDF

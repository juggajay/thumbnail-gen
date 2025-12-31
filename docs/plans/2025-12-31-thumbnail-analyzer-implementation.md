# Thumbnail CTR Analyzer - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered thumbnail analysis panel that provides CTR scores and actionable fixes using Gemini 3 Vision.

**Architecture:** Slide-out panel (left side) with Gemini 3 Flash Vision integration. Backend endpoint captures thumbnail image, sends to AI with context, returns structured JSON scorecard. Frontend displays scores, priorities, and category breakdowns.

**Tech Stack:** Python/FastAPI backend, Gemini 3 Flash Vision API, React/TypeScript frontend, Zustand state management, localStorage for persistent settings.

---

## Task 1: Backend - Thumbnail Analyzer Service

**Files:**
- Create: `backend/services/thumbnail_analyzer.py`

**Step 1: Create the analyzer service with Gemini Vision integration**

```python
import os
import json
from typing import Optional
from google import genai
from google.genai import types

# CTR Research-based analysis prompt
ANALYSIS_PROMPT = '''You are an expert YouTube thumbnail analyst. Analyze this thumbnail for Click-Through Rate (CTR) optimization.

CONTEXT:
- Channel Niche: {niche}
- Target Audience: {target_audience}
- Channel Style: {channel_style}
- Competitors: {competitors}
- Video Title/Topic: {video_title}
- Target Emotion: {target_emotion}

RESEARCH-BASED CRITERIA:

1. MOBILE READABILITY (Critical)
- 70% of YouTube views are mobile
- Thumbnails display at 160x90px in browse
- Text must be readable at small size
- Face must be recognizable at small size

2. FACE & EMOTION (Critical)
- Faces increase CTR by 38%
- Face should occupy 40-60% of frame
- Strong emotions (shock, fear, curiosity) double engagement
- Eye contact or looking at subject matter

3. VISUAL SIMPLICITY (High Impact)
- MrBeast rule: Maximum 3 elements
- One clear focal point
- No clutter or competing elements
- Clear visual hierarchy

4. TEXT EFFECTIVENESS (High Impact)
- Maximum 4 words
- Must add context image doesn't provide
- Never cover the face
- High contrast (stroke/shadow required)
- Large enough for mobile

5. CONTRAST & POP (Medium Impact)
- Subject must separate from background
- High contrast colors
- Pattern interrupt - stand out in feed
- Consider what competitors look like

6. CURIOSITY FACTOR (Medium Impact)
- Creates unanswered question
- "I need to click to find out"
- Curiosity gap between thumbnail and title
- Intrigue without confusion

Analyze the thumbnail and return ONLY valid JSON in this exact format:
{{
  "overall_score": <number 1-10>,
  "verdict": "<one sentence summary>",
  "top_priorities": [
    {{
      "issue": "<specific problem>",
      "fix": "<specific actionable fix>",
      "impact": "high|medium|low"
    }}
  ],
  "categories": [
    {{
      "name": "Mobile Readability",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>", "<point>"],
      "whats_not": ["<point>", "<point>"],
      "fixes": ["<specific fix>", "<specific fix>"]
    }},
    {{
      "name": "Face & Emotion",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>"],
      "whats_not": ["<point>"],
      "fixes": ["<specific fix>"]
    }},
    {{
      "name": "Visual Simplicity",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>"],
      "whats_not": ["<point>"],
      "fixes": ["<specific fix>"]
    }},
    {{
      "name": "Text Effectiveness",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>"],
      "whats_not": ["<point>"],
      "fixes": ["<specific fix>"]
    }},
    {{
      "name": "Contrast & Pop",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>"],
      "whats_not": ["<point>"],
      "fixes": ["<specific fix>"]
    }},
    {{
      "name": "Curiosity Factor",
      "score": <number 1-10>,
      "status": "excellent|good|needs_work|poor",
      "summary": "<one sentence>",
      "why_it_matters": "<educational explanation>",
      "whats_working": ["<point>"],
      "whats_not": ["<point>"],
      "fixes": ["<specific fix>"]
    }}
  ]
}}

Be specific and actionable. Give real feedback, not generic advice. If something is bad, say so clearly.
If arrays would be empty, use empty array []. Never use null.'''


class ThumbnailAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None

    def _get_client(self):
        if not self.client and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        return self.client

    def analyze(
        self,
        image_data: bytes,
        niche: str = "general",
        target_audience: str = "general YouTube viewers",
        channel_style: str = "not specified",
        competitors: str = "not specified",
        video_title: str = "not specified",
        target_emotion: str = "curiosity",
    ) -> Optional[dict]:
        """Analyze a thumbnail image and return CTR feedback."""
        try:
            client = self._get_client()
            if not client:
                return self._error_response("No API key configured")

            # Build the prompt with context
            prompt = ANALYSIS_PROMPT.format(
                niche=niche,
                target_audience=target_audience,
                channel_style=channel_style,
                competitors=competitors,
                video_title=video_title,
                target_emotion=target_emotion,
            )

            # Call Gemini Vision
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=image_data, mime_type="image/png"),
                    prompt,
                ],
                config=types.GenerateContentConfig(
                    temperature=0.3,
                ),
            )

            # Parse JSON response
            response_text = response.text.strip()

            # Handle markdown code blocks if present
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                # Remove first line (```json) and last line (```)
                response_text = "\n".join(lines[1:-1])

            result = json.loads(response_text)
            return result

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response was: {response.text[:500] if response else 'None'}")
            return self._error_response(f"Failed to parse AI response")
        except Exception as e:
            print(f"Analysis error: {e}")
            return self._error_response(str(e))

    def _error_response(self, message: str) -> dict:
        """Return a structured error response."""
        return {
            "overall_score": 0,
            "verdict": f"Analysis failed: {message}",
            "top_priorities": [],
            "categories": [],
            "error": message,
        }

    def is_available(self) -> bool:
        return bool(self.api_key)


# Singleton
thumbnail_analyzer = ThumbnailAnalyzer()
```

**Step 2: Verify the service file is created**

Run: `ls -la backend/services/thumbnail_analyzer.py`

**Step 3: Commit**

```bash
git add backend/services/thumbnail_analyzer.py
git commit -m "feat: add thumbnail analyzer service with Gemini Vision"
```

---

## Task 2: Backend - Analysis API Endpoint

**Files:**
- Create: `backend/routes/analyze.py`
- Modify: `backend/main.py`

**Step 1: Create the analyze route**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import base64

from services.thumbnail_analyzer import thumbnail_analyzer

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


class AnalysisContext(BaseModel):
    niche: str = "general"
    target_audience: str = "general YouTube viewers"
    channel_style: str = "not specified"
    competitors: str = ""
    video_title: str = ""
    target_emotion: str = "curiosity"


class AnalyzeRequest(BaseModel):
    image: str  # base64 encoded PNG
    context: AnalysisContext


@router.post("")
async def analyze_thumbnail(request: AnalyzeRequest):
    """Analyze a thumbnail image for CTR optimization."""
    if not thumbnail_analyzer.is_available():
        raise HTTPException(
            status_code=503,
            detail="Analysis not available. GEMINI_API_KEY not configured.",
        )

    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

    # Run analysis
    result = thumbnail_analyzer.analyze(
        image_data=image_data,
        niche=request.context.niche,
        target_audience=request.context.target_audience,
        channel_style=request.context.channel_style,
        competitors=request.context.competitors,
        video_title=request.context.video_title,
        target_emotion=request.context.target_emotion,
    )

    if result is None:
        raise HTTPException(status_code=500, detail="Analysis failed")

    if "error" in result and result.get("overall_score") == 0:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
```

**Step 2: Register the router in main.py**

Add to `backend/main.py` imports:
```python
from routes.analyze import router as analyze_router
```

Add after other router includes:
```python
app.include_router(analyze_router)
```

**Step 3: Test the endpoint is registered**

Run: `curl http://localhost:8000/docs`
Check that `/api/analyze` endpoint appears in Swagger docs.

**Step 4: Commit**

```bash
git add backend/routes/analyze.py backend/main.py
git commit -m "feat: add /api/analyze endpoint for thumbnail analysis"
```

---

## Task 3: Frontend - API Client

**Files:**
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/api/types.ts`

**Step 1: Add types for analysis**

Add to `frontend/src/api/types.ts`:

```typescript
// Analysis types
export interface AnalysisContext {
  niche: string;
  target_audience: string;
  channel_style: string;
  competitors: string;
  video_title: string;
  target_emotion: string;
}

export interface AnalysisPriority {
  issue: string;
  fix: string;
  impact: "high" | "medium" | "low";
}

export interface AnalysisCategory {
  name: string;
  score: number;
  status: "excellent" | "good" | "needs_work" | "poor";
  summary: string;
  why_it_matters: string;
  whats_working: string[];
  whats_not: string[];
  fixes: string[];
}

export interface AnalysisResult {
  overall_score: number;
  verdict: string;
  top_priorities: AnalysisPriority[];
  categories: AnalysisCategory[];
  error?: string;
}
```

**Step 2: Add analyze function to API client**

Add to `frontend/src/api/client.ts`:

```typescript
import type { AnalysisContext, AnalysisResult } from './types';

// Add to exports
export const analyze = {
  thumbnail: (imageBase64: string, context: AnalysisContext) =>
    api
      .post<AnalysisResult>("/api/analyze", {
        image: imageBase64,
        context,
      })
      .then((r) => r.data),
};
```

**Step 3: Commit**

```bash
git add frontend/src/api/client.ts frontend/src/api/types.ts
git commit -m "feat: add analysis API client and types"
```

---

## Task 4: Frontend - Store Updates

**Files:**
- Modify: `frontend/src/store/index.ts`

**Step 1: Add analysis state to the store**

Add these types and state to the store:

```typescript
import type { AnalysisResult, AnalysisContext } from '../api/types';

// Add to StoreState interface
interface StoreState {
  // ... existing state ...

  // Analysis panel state
  analysisPanel: {
    isOpen: boolean;
    isAnalyzing: boolean;
    result: AnalysisResult | null;
    error: string | null;
  };
  videoContext: {
    title: string;
    emotion: string;
  };

  // Analysis actions
  toggleAnalysisPanel: () => void;
  setAnalysisPanelOpen: (open: boolean) => void;
  setVideoContext: (title: string, emotion: string) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysisError: (error: string | null) => void;
}

// Add initial state
const initialAnalysisPanel = {
  isOpen: false,
  isAnalyzing: false,
  result: null,
  error: null,
};

const initialVideoContext = {
  title: '',
  emotion: 'curiosity',
};

// Add to create() function
analysisPanel: initialAnalysisPanel,
videoContext: initialVideoContext,

toggleAnalysisPanel: () =>
  set((state) => ({
    analysisPanel: {
      ...state.analysisPanel,
      isOpen: !state.analysisPanel.isOpen,
    },
  })),

setAnalysisPanelOpen: (open) =>
  set((state) => ({
    analysisPanel: { ...state.analysisPanel, isOpen: open },
  })),

setVideoContext: (title, emotion) =>
  set({ videoContext: { title, emotion } }),

setAnalyzing: (analyzing) =>
  set((state) => ({
    analysisPanel: { ...state.analysisPanel, isAnalyzing: analyzing },
  })),

setAnalysisResult: (result) =>
  set((state) => ({
    analysisPanel: { ...state.analysisPanel, result, error: null },
  })),

setAnalysisError: (error) =>
  set((state) => ({
    analysisPanel: { ...state.analysisPanel, error, isAnalyzing: false },
  })),
```

**Step 2: Commit**

```bash
git add frontend/src/store/index.ts
git commit -m "feat: add analysis panel state to store"
```

---

## Task 5: Frontend - Analysis Panel Component

**Files:**
- Create: `frontend/src/components/Analysis/AnalysisPanel.tsx`

**Step 1: Create the main panel component**

```typescript
import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { analyze } from '../../api/client';
import type { AnalysisContext } from '../../api/types';
import { OverallScore } from './OverallScore';
import { MobilePreview } from './MobilePreview';
import { TopPriorities } from './TopPriorities';
import { CategoryBreakdown } from './CategoryBreakdown';

// Load settings from localStorage
const loadSettings = (): Omit<AnalysisContext, 'video_title' | 'target_emotion'> => {
  try {
    const saved = localStorage.getItem('analysisSettings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    niche: 'general',
    target_audience: 'general YouTube viewers',
    channel_style: 'not specified',
    competitors: '',
  };
};

const saveSettings = (settings: Omit<AnalysisContext, 'video_title' | 'target_emotion'>) => {
  localStorage.setItem('analysisSettings', JSON.stringify(settings));
};

export function AnalysisPanel() {
  const {
    analysisPanel,
    videoContext,
    setVideoContext,
    setAnalyzing,
    setAnalysisResult,
    setAnalysisError,
    setAnalysisPanelOpen,
  } = useStore();

  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);

  // Save settings when changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const captureCanvas = async (): Promise<string | null> => {
    // Find the canvas preview element and capture it
    const canvasContainer = document.querySelector('[data-canvas-preview]') as HTMLElement;
    if (!canvasContainer) {
      console.error('Canvas container not found');
      return null;
    }

    try {
      // Use html2canvas or similar - for now, we'll use the rendered output
      // This is a simplified version - in production you'd render the actual thumbnail
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(canvasContainer, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setCanvasDataUrl(dataUrl);
      // Return just the base64 part (remove "data:image/png;base64,")
      return dataUrl.split(',')[1];
    } catch (e) {
      console.error('Failed to capture canvas:', e);
      return null;
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const imageBase64 = await captureCanvas();
      if (!imageBase64) {
        throw new Error('Failed to capture thumbnail image');
      }

      const context: AnalysisContext = {
        ...settings,
        video_title: videoContext.title,
        target_emotion: videoContext.emotion,
      };

      const result = await analyze.thumbnail(imageBase64, context);
      setAnalysisResult(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Analysis failed';
      setAnalysisError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const { isOpen, isAnalyzing, result, error } = analysisPanel;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setAnalysisPanelOpen(!isOpen)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 px-2 py-4 rounded-r-lg transition-all ${
          isOpen
            ? 'bg-purple-600 text-white'
            : 'bg-surface-elevated text-white/70 hover:text-white border border-l-0 border-border'
        }`}
        title="Toggle Analysis Panel"
      >
        <span className="writing-mode-vertical text-xs font-medium">
          {isOpen ? '◀ ANALYZE' : '▶ ANALYZE'}
        </span>
      </button>

      {/* Panel */}
      <div
        className={`fixed left-0 top-0 h-full w-[400px] bg-surface-deep border-r border-border z-30 transform transition-transform duration-200 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-white font-semibold">Thumbnail Analysis</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-white/50 hover:text-white transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => setAnalysisPanelOpen(false)}
                className="p-2 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Results or Empty State */}
            {result ? (
              <>
                <OverallScore score={result.overall_score} verdict={result.verdict} />
                <MobilePreview imageUrl={canvasDataUrl} />
                <TopPriorities priorities={result.top_priorities} />
                <CategoryBreakdown categories={result.categories} />
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">
                  Click "Analyze" to get CTR feedback on your thumbnail
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer - Context & Analyze Button */}
          <div className="border-t border-border p-4 space-y-3">
            {/* Video Context */}
            <div>
              <label className="block text-xs text-white/50 mb-1">Video Title/Topic</label>
              <input
                type="text"
                value={videoContext.title}
                onChange={(e) => setVideoContext(e.target.value, videoContext.emotion)}
                placeholder="What is this video about?"
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Target Emotion</label>
              <select
                value={videoContext.emotion}
                onChange={(e) => setVideoContext(videoContext.title, e.target.value)}
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="curiosity">Curiosity</option>
                <option value="shock">Shock</option>
                <option value="fear">Fear</option>
                <option value="excitement">Excitement</option>
                <option value="unease">Unease/Mystery</option>
                <option value="outrage">Outrage</option>
                <option value="intrigue">Intrigue</option>
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                isAnalyzing
                  ? 'bg-purple-600/50 text-white/70 cursor-wait'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {result ? 'Re-Analyze' : 'Analyze Thumbnail'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onSave={(newSettings) => {
              setSettings(newSettings);
              setShowSettings(false);
            }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </>
  );
}

// Settings Modal Component
interface SettingsModalProps {
  settings: Omit<AnalysisContext, 'video_title' | 'target_emotion'>;
  onSave: (settings: Omit<AnalysisContext, 'video_title' | 'target_emotion'>) => void;
  onClose: () => void;
}

function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [form, setForm] = useState(settings);

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface-elevated rounded-lg border border-border w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-white font-medium">Analysis Settings</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Channel Niche</label>
            <select
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              className="w-full px-3 py-2 bg-surface-deep border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="general">General</option>
              <option value="true_crime">True Crime</option>
              <option value="gaming">Gaming</option>
              <option value="tech">Tech/Reviews</option>
              <option value="commentary">Commentary/Essays</option>
              <option value="vlogs">Vlogs</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="horror">Horror/Scary</option>
              <option value="reactions">Reactions</option>
              <option value="documentary">Documentary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Target Audience</label>
            <textarea
              value={form.target_audience}
              onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
              placeholder="e.g., 25-45, true crime enthusiasts, binge-watchers"
              rows={2}
              className="w-full px-3 py-2 bg-surface-deep border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Channel Style</label>
            <select
              value={form.channel_style}
              onChange={(e) => setForm({ ...form, channel_style: e.target.value })}
              className="w-full px-3 py-2 bg-surface-deep border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="not specified">Not Specified</option>
              <option value="dark_moody">Dark & Moody</option>
              <option value="bright_bold">Bright & Bold</option>
              <option value="clean_minimal">Clean & Minimal</option>
              <option value="chaotic_energetic">Chaotic & Energetic</option>
              <option value="cinematic">Cinematic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Competitors (optional)</label>
            <input
              type="text"
              value={form.competitors}
              onChange={(e) => setForm({ ...form, competitors: e.target.value })}
              placeholder="e.g., JCS, MrBallen, That Chapter"
              className="w-full px-3 py-2 bg-surface-deep border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/Analysis/AnalysisPanel.tsx
git commit -m "feat: add main analysis panel component"
```

---

## Task 6: Frontend - Score Components

**Files:**
- Create: `frontend/src/components/Analysis/OverallScore.tsx`
- Create: `frontend/src/components/Analysis/MobilePreview.tsx`
- Create: `frontend/src/components/Analysis/TopPriorities.tsx`
- Create: `frontend/src/components/Analysis/CategoryBreakdown.tsx`

**Step 1: Create OverallScore component**

```typescript
// frontend/src/components/Analysis/OverallScore.tsx

interface OverallScoreProps {
  score: number;
  verdict: string;
}

export function OverallScore({ score, verdict }: OverallScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-blue-400 border-blue-400';
    if (score >= 7) return 'text-green-400 border-green-400';
    if (score >= 5) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 9) return 'bg-blue-400/10';
    if (score >= 7) return 'bg-green-400/10';
    if (score >= 5) return 'bg-yellow-400/10';
    return 'bg-red-400/10';
  };

  return (
    <div className={`p-4 rounded-lg ${getScoreBg(score)}`}>
      <div className="flex items-center gap-4">
        <div
          className={`w-20 h-20 rounded-full border-4 ${getScoreColor(score)} flex items-center justify-center`}
        >
          <span className={`text-2xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
            {score.toFixed(1)}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-white/50 mb-1">Overall Score</div>
          <div className="text-white font-medium">{verdict}</div>
          <div className="flex gap-0.5 mt-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < score ? getScoreColor(score).split(' ')[0].replace('text-', 'bg-') : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create MobilePreview component**

```typescript
// frontend/src/components/Analysis/MobilePreview.tsx

interface MobilePreviewProps {
  imageUrl: string | null;
}

export function MobilePreview({ imageUrl }: MobilePreviewProps) {
  return (
    <div className="p-3 bg-surface-elevated rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-white/50 uppercase font-medium">Mobile Preview</span>
      </div>
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Mobile preview"
            className="rounded"
            style={{ width: '160px', height: '90px', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="bg-surface-deep rounded flex items-center justify-center"
            style={{ width: '160px', height: '90px' }}
          >
            <span className="text-white/30 text-xs">No preview</span>
          </div>
        )}
        <div className="text-xs text-white/40">
          <p>Actual size viewers see</p>
          <p>when browsing YouTube</p>
          <p className="mt-1 text-white/60">160 × 90 px</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create TopPriorities component**

```typescript
// frontend/src/components/Analysis/TopPriorities.tsx

import type { AnalysisPriority } from '../../api/types';

interface TopPrioritiesProps {
  priorities: AnalysisPriority[];
}

export function TopPriorities({ priorities }: TopPrioritiesProps) {
  if (!priorities || priorities.length === 0) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-white/50';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">🎯</span>
        <span className="text-xs text-white/50 uppercase font-medium">Top Priorities</span>
      </div>
      <div className="space-y-2">
        {priorities.map((priority, index) => (
          <div
            key={index}
            className="p-3 bg-surface-elevated rounded-lg border border-border"
          >
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${getImpactColor(priority.impact)}`} />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{priority.issue}</p>
                <p className="text-white/60 text-xs mt-1">→ {priority.fix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create CategoryBreakdown component**

```typescript
// frontend/src/components/Analysis/CategoryBreakdown.tsx

import { useState } from 'react';
import type { AnalysisCategory } from '../../api/types';

interface CategoryBreakdownProps {
  categories: AnalysisCategory[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!categories || categories.length === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-blue-400';
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-blue-500/20 text-blue-400';
      case 'good':
        return 'bg-green-500/20 text-green-400';
      case 'needs_work':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'poor':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/50';
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Mobile')) return '📱';
    if (name.includes('Face')) return '😮';
    if (name.includes('Simplicity')) return '✨';
    if (name.includes('Text')) return '📝';
    if (name.includes('Contrast')) return '🎨';
    if (name.includes('Curiosity')) return '🤔';
    return '📊';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50 uppercase font-medium">Breakdown</span>
      </div>
      <div className="space-y-2">
        {categories.map((category) => {
          const isExpanded = expanded === category.name;
          return (
            <div
              key={category.name}
              className="bg-surface-elevated rounded-lg border border-border overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : category.name)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(category.name)}</span>
                  <span className="text-white text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                    {category.score}/10
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                  {/* Summary & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white/70 text-sm">{category.summary}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(category.status)}`}>
                      {category.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Why It Matters */}
                  <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                    <p className="text-xs text-purple-300">
                      <span className="font-medium">💡 Why this matters:</span> {category.why_it_matters}
                    </p>
                  </div>

                  {/* What's Working */}
                  {category.whats_working && category.whats_working.length > 0 && (
                    <div>
                      <p className="text-xs text-green-400 font-medium mb-1">✅ What's Working</p>
                      <ul className="space-y-1">
                        {category.whats_working.map((item, i) => (
                          <li key={i} className="text-xs text-white/60 pl-3">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What's Not */}
                  {category.whats_not && category.whats_not.length > 0 && (
                    <div>
                      <p className="text-xs text-red-400 font-medium mb-1">❌ What's Not</p>
                      <ul className="space-y-1">
                        {category.whats_not.map((item, i) => (
                          <li key={i} className="text-xs text-white/60 pl-3">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fixes */}
                  {category.fixes && category.fixes.length > 0 && (
                    <div>
                      <p className="text-xs text-blue-400 font-medium mb-1">🔧 Fixes</p>
                      <ul className="space-y-1">
                        {category.fixes.map((fix, i) => (
                          <li key={i} className="text-xs text-white/60 pl-3">→ {fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 5: Create index file for exports**

```typescript
// frontend/src/components/Analysis/index.ts
export { AnalysisPanel } from './AnalysisPanel';
export { OverallScore } from './OverallScore';
export { MobilePreview } from './MobilePreview';
export { TopPriorities } from './TopPriorities';
export { CategoryBreakdown } from './CategoryBreakdown';
```

**Step 6: Commit**

```bash
git add frontend/src/components/Analysis/
git commit -m "feat: add analysis score display components"
```

---

## Task 7: Frontend - Integration

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Editor/Canvas.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Add AnalysisPanel to App.tsx**

Add import at top:
```typescript
import { AnalysisPanel } from './components/Analysis';
```

Add component inside the main layout (after Sidebar, before main content):
```typescript
<AnalysisPanel />
```

**Step 2: Add data attribute to Canvas for capture**

In Canvas.tsx, add `data-canvas-preview` attribute to the canvas container div:
```typescript
<div
  ref={canvasRef}
  data-canvas-preview  // Add this attribute
  className={`relative bg-surface...`}
```

**Step 3: Add CSS for vertical text**

Add to `frontend/src/index.css`:
```css
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

**Step 4: Install html2canvas**

Run: `cd frontend && npm install html2canvas`

**Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/Editor/Canvas.tsx frontend/src/index.css frontend/package.json frontend/package-lock.json
git commit -m "feat: integrate analysis panel into app"
```

---

## Task 8: Testing & Polish

**Step 1: Start both servers**

Backend: `cd backend && python -m uvicorn main:app --reload`
Frontend: `cd frontend && npm run dev`

**Step 2: Test the flow**

1. Open the app at http://localhost:5173
2. Select a template with background and text
3. Click the "ANALYZE" toggle on the left edge
4. Panel should slide out
5. Enter a video title/topic
6. Click "Analyze Thumbnail"
7. Wait for results (~5-10 seconds)
8. Verify scorecard displays with all categories
9. Click settings gear, verify settings modal works
10. Make an edit, click "Re-Analyze"

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete thumbnail CTR analyzer feature"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Backend analyzer service | `thumbnail_analyzer.py` |
| 2 | API endpoint | `analyze.py`, `main.py` |
| 3 | Frontend API client | `client.ts`, `types.ts` |
| 4 | Store updates | `store/index.ts` |
| 5 | Main panel component | `AnalysisPanel.tsx` |
| 6 | Score components | `OverallScore.tsx`, `MobilePreview.tsx`, `TopPriorities.tsx`, `CategoryBreakdown.tsx` |
| 7 | Integration | `App.tsx`, `Canvas.tsx`, `index.css` |
| 8 | Testing | Manual verification |

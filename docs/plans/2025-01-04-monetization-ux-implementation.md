# ThumbGen Pro: Monetization & UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform ThumbGen into a monetizable SaaS with Generate/Design modes, headline helper, competitor analyzer, and queue system.

**Architecture:** Mode-based UX (Generate for daily use, Design for template setup) with real-time headline scoring powered by existing analyzer logic, competitor pattern extraction via Gemini 3.0 Flash Vision, and unified queue for manual + API generation.

**Tech Stack:** React + TypeScript + Zustand (frontend), FastAPI + Python (backend), Gemini 3.0 Flash (AI), YouTube Data API (competitor analysis), TailwindCSS (styling)

**Design Doc:** `docs/plans/2025-01-04-monetization-and-ux-redesign.md`

---

## Phase 1: Core UX Restructure

### Task 1.1: Update Color System & Typography

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`

**Step 1: Add Google Fonts to index.html**

In `frontend/index.html`, add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Step 2: Update Tailwind config with new fonts**

In `frontend/tailwind.config.js`, extend theme:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Keep existing, add new accent
        'accent-cyan': {
          DEFAULT: '#22d3ee',
          hover: '#06b6d4',
          glow: 'rgba(34, 211, 238, 0.15)',
          strong: '#67e8f9',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 3: Update CSS variables in index.css**

Add/update in `frontend/src/index.css`:

```css
:root {
  /* Existing colors - keep them */

  /* New accent variant */
  --accent-cyan: #22d3ee;
  --accent-cyan-hover: #06b6d4;
  --accent-cyan-glow: rgba(34, 211, 238, 0.15);
}

/* Add font classes */
.font-display {
  font-family: 'Sora', system-ui, sans-serif;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
```

**Step 4: Verify fonts load**

Run: `cd frontend && npm run dev`
Open browser, inspect element, verify Sora font is available.

**Step 5: Commit**

```bash
git add frontend/index.html frontend/src/index.css frontend/tailwind.config.js
git commit -m "style: add new typography and color system"
```

---

### Task 1.2: Add Mode State to Store

**Files:**
- Modify: `frontend/src/store/index.ts` (or `frontend/src/store.ts`)

**Step 1: Read current store structure**

First, understand the current store shape by reading the file.

**Step 2: Add mode state and actions**

Add to the store interface and implementation:

```typescript
// Add to interface
interface AppState {
  // ... existing state ...

  // Mode state
  mode: 'generate' | 'design';
  setMode: (mode: 'generate' | 'design') => void;

  // Queue panel state
  queuePanelOpen: boolean;
  setQueuePanelOpen: (open: boolean) => void;
  toggleQueuePanel: () => void;
}

// Add to create() implementation
mode: 'generate',
setMode: (mode) => set({ mode }),

queuePanelOpen: false,
setQueuePanelOpen: (open) => set({ queuePanelOpen: open }),
toggleQueuePanel: () => set((state) => ({ queuePanelOpen: !state.queuePanelOpen })),
```

**Step 3: Verify store compiles**

Run: `cd frontend && npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add frontend/src/store.ts
git commit -m "feat: add mode and queue panel state to store"
```

---

### Task 1.3: Create Mode Toggle Component

**Files:**
- Create: `frontend/src/components/Layout/ModeToggle.tsx`

**Step 1: Create the ModeToggle component**

```typescript
import { useStore } from '../../store';

export function ModeToggle() {
  const { mode, setMode } = useStore();

  return (
    <div className="flex items-center bg-surface-deep rounded-lg p-1">
      <button
        onClick={() => setMode('generate')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'generate'
            ? 'bg-accent text-surface-deep shadow-lg shadow-accent/20'
            : 'text-white/60 hover:text-white hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate
      </button>
      <button
        onClick={() => setMode('design')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'design'
            ? 'bg-accent text-surface-deep shadow-lg shadow-accent/20'
            : 'text-white/60 hover:text-white hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
        Design
      </button>
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/components/Layout/ModeToggle.tsx
git commit -m "feat: create ModeToggle component"
```

---

### Task 1.4: Create Template Selector Dropdown

**Files:**
- Create: `frontend/src/components/Layout/TemplateSelector.tsx`

**Step 1: Create the TemplateSelector component**

```typescript
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';

export function TemplateSelector() {
  const { templates, selectedTemplate, selectTemplate } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface-elevated hover:bg-surface-overlay border border-border rounded-lg text-sm font-medium text-white transition-colors"
      >
        <span className="max-w-[200px] truncate">
          {selectedTemplate?.name || 'Select Template'}
        </span>
        <svg
          className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Your Templates
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {templates.length === 0 ? (
              <div className="text-center py-6 text-white/30 text-sm">
                No templates yet
              </div>
            ) : (
              <div className="space-y-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      selectTemplate(template.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-surface-overlay border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${
                        selectedTemplate?.id === template.id ? 'text-accent' : 'text-white'
                      }`}>
                        {template.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        v{template.version}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 mt-0.5 block">
                      {template.pipeline}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `cd frontend && npm run build`

**Step 3: Commit**

```bash
git add frontend/src/components/Layout/TemplateSelector.tsx
git commit -m "feat: create TemplateSelector dropdown component"
```

---

### Task 1.5: Create Queue Badge Component

**Files:**
- Create: `frontend/src/components/Layout/QueueBadge.tsx`

**Step 1: Create the QueueBadge component**

```typescript
import { useStore } from '../../store';

export function QueueBadge() {
  const { toggleQueuePanel, queuePanelOpen } = useStore();

  // TODO: Replace with actual queue count from store
  const queueCount = 0;

  return (
    <button
      onClick={toggleQueuePanel}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        queuePanelOpen
          ? 'bg-accent text-surface-deep'
          : 'bg-surface-elevated hover:bg-surface-overlay border border-border text-white/70 hover:text-white'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      Queue
      {queueCount > 0 && (
        <span className="bg-accent text-surface-deep text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {queueCount}
        </span>
      )}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/Layout/QueueBadge.tsx
git commit -m "feat: create QueueBadge component"
```

---

### Task 1.6: Redesign Header Component

**Files:**
- Modify: `frontend/src/components/Layout/Header.tsx`

**Step 1: Rewrite Header with new layout**

Replace entire content of `frontend/src/components/Layout/Header.tsx`:

```typescript
import { ModeToggle } from './ModeToggle';
import { TemplateSelector } from './TemplateSelector';
import { QueueBadge } from './QueueBadge';
import { useStore } from '../../store';

export function Header() {
  const { selectedTemplate } = useStore();

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold font-display tracking-tight">
          <span className="text-accent">Thumb</span>
          <span className="text-white/80">Gen</span>
        </h1>
      </div>

      {/* Center: Template Selector + Mode Toggle */}
      <div className="flex items-center gap-4">
        {selectedTemplate && <TemplateSelector />}
        <ModeToggle />
      </div>

      {/* Right: Queue + Status */}
      <div className="flex items-center gap-4">
        <QueueBadge />
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white/40">API Connected</span>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Update Header export if needed**

Ensure the component is exported correctly.

**Step 3: Verify it compiles**

Run: `cd frontend && npm run build`

**Step 4: Commit**

```bash
git add frontend/src/components/Layout/Header.tsx
git commit -m "feat: redesign Header with mode toggle and template selector"
```

---

### Task 1.7: Create Generate Mode Container

**Files:**
- Create: `frontend/src/components/Generate/GenerateMode.tsx`
- Create: `frontend/src/components/Generate/index.ts`

**Step 1: Create the GenerateMode component**

Create `frontend/src/components/Generate/GenerateMode.tsx`:

```typescript
import { useStore } from '../../store';
import { DataInputs } from '../Editor/DataInputs';
import { Canvas } from '../Editor/Canvas';
import { PreviewPanel } from '../Editor/PreviewPanel';

export function GenerateMode() {
  const { selectedTemplate } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Select a Template</h2>
          <p className="text-white/50 text-sm">
            Choose a template from the dropdown above to start generating thumbnails.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left: Data Input Form */}
      <div className="w-96 border-r border-border flex flex-col bg-surface">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white font-display">Generate Thumbnail</h2>
          <p className="text-sm text-white/50 mt-1">Fill in the data and click generate</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DataInputs />
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-surface-deep">
          <div className="max-w-3xl w-full">
            <Canvas />
          </div>
        </div>
        <div className="border-t border-border bg-surface">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create index export**

Create `frontend/src/components/Generate/index.ts`:

```typescript
export { GenerateMode } from './GenerateMode';
```

**Step 3: Commit**

```bash
git add frontend/src/components/Generate/
git commit -m "feat: create GenerateMode container component"
```

---

### Task 1.8: Create Design Mode Container

**Files:**
- Create: `frontend/src/components/Design/DesignMode.tsx`
- Create: `frontend/src/components/Design/index.ts`

**Step 1: Create the DesignMode component**

Create `frontend/src/components/Design/DesignMode.tsx`:

```typescript
import { useStore } from '../../store';
import { Sidebar } from '../Layout/Sidebar';
import { Canvas } from '../Editor/Canvas';
import { ZoneEditor } from '../Editor/ZoneEditor';
import { PreviewPanel } from '../Editor/PreviewPanel';
import { DataInputs } from '../Editor/DataInputs';

export function DesignMode() {
  const { selectedTemplate, templates } = useStore();

  if (!selectedTemplate) {
    return (
      <div className="h-full flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            {templates.length === 0 ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-3 font-display">Create Your First Template</h2>
                <p className="text-white/60 text-sm">
                  Click "+ New Template" in the sidebar to get started.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 font-display">Select a Template</h2>
                <p className="text-white/50 text-sm">
                  Choose a template from the sidebar to start editing.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <Canvas />
        </div>
        <div className="border-t border-border">
          <DataInputs />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l border-border flex flex-col bg-surface">
        <div className="flex-1 overflow-auto">
          <ZoneEditor />
        </div>
        <div className="border-t border-border">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create index export**

Create `frontend/src/components/Design/index.ts`:

```typescript
export { DesignMode } from './DesignMode';
```

**Step 3: Commit**

```bash
git add frontend/src/components/Design/
git commit -m "feat: create DesignMode container component"
```

---

### Task 1.9: Update App.tsx with Mode Switching

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Rewrite App.tsx with mode-based routing**

```typescript
import { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Layout/Header';
import { GenerateMode } from './components/Generate';
import { DesignMode } from './components/Design';
import { AssetLibrary } from './components/Assets/AssetLibrary';
import { OutputHistory } from './components/Outputs/OutputHistory';
import { HelpButton } from './components/Help/HelpModal';
import { AnalysisPanel } from './components/Analysis';

function App() {
  const { mode, loadTemplates, loadAssets, loadOutputs } = useStore();

  useEffect(() => {
    loadTemplates();
    loadAssets();
    loadOutputs();
  }, [loadTemplates, loadAssets, loadOutputs]);

  return (
    <div className="min-h-screen bg-surface-deep flex flex-col font-body">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto">
          {mode === 'generate' && <GenerateMode />}
          {mode === 'design' && <DesignMode />}
        </main>
      </div>

      <HelpButton />
      <AnalysisPanel />
    </div>
  );
}

export default App;
```

**Step 2: Verify application runs**

Run: `cd frontend && npm run dev`
Open browser, verify mode toggle works and switches between Generate/Design views.

**Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: implement mode-based routing in App"
```

---

### Task 1.10: Create Queue Panel Component

**Files:**
- Create: `frontend/src/components/Queue/QueuePanel.tsx`
- Create: `frontend/src/components/Queue/index.ts`

**Step 1: Create QueuePanel component**

Create `frontend/src/components/Queue/QueuePanel.tsx`:

```typescript
import { useStore } from '../../store';

interface QueueItem {
  id: string;
  episodeId: string;
  hook: string;
  status: 'processing' | 'pending' | 'approved' | 'failed';
  createdAt: string;
  thumbnailUrl?: string;
}

// Placeholder data - will be replaced with real queue
const mockQueue: QueueItem[] = [];

export function QueuePanel() {
  const { queuePanelOpen, setQueuePanelOpen } = useStore();

  return (
    <>
      {/* Backdrop */}
      {queuePanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setQueuePanelOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-surface-deep border-l border-border z-50 flex flex-col transition-transform duration-300 ease-out ${
          queuePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-white font-display">Queue</h2>
          <button
            onClick={() => setQueuePanelOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Queue Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockQueue.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No items in queue</p>
              <p className="text-xs mt-1">Generated thumbnails will appear here</p>
            </div>
          ) : (
            mockQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface border border-border rounded-lg"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-9 bg-surface-elevated rounded overflow-hidden flex-shrink-0">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.hook}</p>
                    <p className="text-xs text-white/40">{item.episodeId}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.status === 'approved' && (
                      <span className="text-green-400">✓</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-yellow-400">⏳</span>
                    )}
                    {item.status === 'processing' && (
                      <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Auto-approve</span>
            <button className="w-12 h-6 bg-accent rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
          <p className="text-xs text-white/40 mt-1">
            When on, API-generated thumbnails skip review
          </p>
        </div>
      </div>
    </>
  );
}
```

**Step 2: Create index export**

Create `frontend/src/components/Queue/index.ts`:

```typescript
export { QueuePanel } from './QueuePanel';
```

**Step 3: Add QueuePanel to App.tsx**

In `frontend/src/App.tsx`, add import and render:

```typescript
import { QueuePanel } from './components/Queue';

// In the return, add before </div>:
<QueuePanel />
```

**Step 4: Commit**

```bash
git add frontend/src/components/Queue/ frontend/src/App.tsx
git commit -m "feat: create QueuePanel slide-out component"
```

---

## Phase 2: Headline Helper

### Task 2.1: Create Headline Scorer Backend Service

**Files:**
- Create: `backend/services/headline_scorer.py`

**Step 1: Create the headline scorer service**

```python
"""
Headline Scorer Service

Scores YouTube thumbnail hook text based on research-backed rules.
Uses the same knowledge base as the thumbnail analyzer.
"""

from dataclasses import dataclass
from typing import Optional
import re


@dataclass
class HeadlineScore:
    """Result of scoring a headline."""
    overall_score: int  # 0-100
    length_score: int
    readability_score: int
    power_words_score: int
    issues: list[str]
    suggestions: list[str]


# Research-backed rules (from MrBeast, VidIQ data)
OPTIMAL_WORD_COUNT = (2, 4)
MAX_WORD_COUNT = 5
MIN_CHARS_PER_WORD = 2  # Avoid single-letter words
MAX_CHARS_FOR_MOBILE = 25  # Rough limit for mobile readability

# Universal power words that drive CTR
POWER_WORDS = {
    "urgency": ["NOW", "JUST", "BREAKING", "URGENT", "FINALLY", "NEW"],
    "danger": ["CRITICAL", "WARNING", "STOP", "NEVER", "DANGER", "ALERT"],
    "curiosity": ["SECRET", "HIDDEN", "TRUTH", "REVEALED", "WHY", "HOW"],
    "shock": ["INSANE", "SHOCKING", "WTF", "UNBELIEVABLE", "CRAZY", "EXPOSED"],
    "value": ["FREE", "EASY", "FAST", "SIMPLE", "BEST", "ULTIMATE"],
    "action": ["HACK", "EXPLOIT", "ATTACK", "DESTROY", "FOUND", "DISCOVERED"],
}

ALL_POWER_WORDS = set()
for words in POWER_WORDS.values():
    ALL_POWER_WORDS.update(words)


class HeadlineScorer:
    """Scores hook text based on research-backed rules."""

    def score(self, text: str, niche_profile: Optional[dict] = None) -> HeadlineScore:
        """
        Score a hook text.

        Args:
            text: The hook/headline text
            niche_profile: Optional niche-specific patterns from competitor analysis

        Returns:
            HeadlineScore with overall score, dimension scores, issues, and suggestions
        """
        text = text.strip()
        if not text:
            return HeadlineScore(
                overall_score=0,
                length_score=0,
                readability_score=0,
                power_words_score=0,
                issues=["No text provided"],
                suggestions=["Enter a hook to get feedback"]
            )

        words = text.split()
        word_count = len(words)
        char_count = len(text)
        upper_text = text.upper()

        issues = []
        suggestions = []

        # --- Length Score (30%) ---
        if word_count < OPTIMAL_WORD_COUNT[0]:
            length_score = 70  # Too short
            issues.append(f"Very short ({word_count} word{'s' if word_count != 1 else ''}) — consider adding impact")
        elif word_count <= OPTIMAL_WORD_COUNT[1]:
            length_score = 100  # Perfect
        elif word_count <= MAX_WORD_COUNT:
            length_score = 80  # Acceptable
            issues.append(f"Slightly long ({word_count} words) — top performers use 2-4 words")
        else:
            length_score = max(20, 100 - (word_count - MAX_WORD_COUNT) * 15)
            issues.append(f"Too long ({word_count} words) — aim for 3-4 words max")
            # Suggest shorter version
            if word_count > 4:
                short_version = " ".join(words[:4])
                suggestions.append(f'Try: "{short_version}"')

        # --- Readability Score (25%) ---
        if char_count <= MAX_CHARS_FOR_MOBILE:
            readability_score = 100
        elif char_count <= 35:
            readability_score = 75
            issues.append("May be hard to read on mobile")
        else:
            readability_score = max(20, 100 - (char_count - MAX_CHARS_FOR_MOBILE) * 2)
            issues.append("Too long for mobile — text will be very small")

        # Check for all caps (generally good for thumbnails)
        if text.isupper():
            pass  # Good
        elif text == text.title():
            suggestions.append("Consider ALL CAPS for more impact")
        else:
            suggestions.append("Try ALL CAPS — it's standard for thumbnails")

        # --- Power Words Score (25%) ---
        found_power_words = []
        for word in words:
            if word.upper() in ALL_POWER_WORDS:
                found_power_words.append(word.upper())

        if len(found_power_words) >= 2:
            power_words_score = 100
        elif len(found_power_words) == 1:
            power_words_score = 80
        else:
            power_words_score = 40
            # Suggest power words based on context
            if any(w in upper_text for w in ["BUG", "VULN", "CVE", "RCE", "XSS"]):
                suggestions.append('Add urgency: "CRITICAL" or "WARNING"')
            else:
                suggestions.append('Add impact: "CRITICAL", "INSANE", or "STOP"')

        if found_power_words:
            pass  # Will show as positive in UI
        else:
            issues.append("No power words — add urgency or emotion")

        # --- Niche-specific scoring (if profile provided) ---
        niche_bonus = 0
        if niche_profile and "patterns" in niche_profile:
            patterns = niche_profile["patterns"]
            niche_power_words = patterns.get("power_words", {})

            for word in words:
                if word.upper() in niche_power_words:
                    niche_bonus += 5  # Bonus for using niche-specific words

            # Check if word count matches niche patterns
            niche_word_range = patterns.get("word_count", {}).get("best_range", [2, 4])
            if niche_word_range[0] <= word_count <= niche_word_range[1]:
                niche_bonus += 5

        # --- Calculate Overall Score ---
        base_score = (
            length_score * 0.30 +
            readability_score * 0.25 +
            power_words_score * 0.25 +
            50 * 0.20  # Placeholder for emotional pull
        )

        overall_score = min(100, int(base_score + niche_bonus))

        return HeadlineScore(
            overall_score=overall_score,
            length_score=length_score,
            readability_score=readability_score,
            power_words_score=power_words_score,
            issues=issues,
            suggestions=suggestions[:3]  # Limit to 3 suggestions
        )


# Singleton instance
headline_scorer = HeadlineScorer()
```

**Step 2: Verify Python syntax**

Run: `cd backend && python -c "from services.headline_scorer import headline_scorer; print(headline_scorer.score('CRITICAL EXPLOIT FOUND'))"`

**Step 3: Commit**

```bash
git add backend/services/headline_scorer.py
git commit -m "feat: create headline scorer service with research-backed rules"
```

---

### Task 2.2: Create Headline Scoring API Route

**Files:**
- Create: `backend/routes/headline.py`
- Modify: `backend/main.py`

**Step 1: Create the headline route**

Create `backend/routes/headline.py`:

```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.headline_scorer import headline_scorer

router = APIRouter(prefix="/api/headline", tags=["headline"])


class HeadlineScoreRequest(BaseModel):
    text: str
    niche: Optional[str] = None


class HeadlineScoreResponse(BaseModel):
    overall_score: int
    length_score: int
    readability_score: int
    power_words_score: int
    issues: list[str]
    suggestions: list[str]


@router.post("/score", response_model=HeadlineScoreResponse)
async def score_headline(request: HeadlineScoreRequest):
    """Score a hook/headline text for CTR optimization."""
    # TODO: Load niche profile if niche is provided
    niche_profile = None

    result = headline_scorer.score(request.text, niche_profile)

    return HeadlineScoreResponse(
        overall_score=result.overall_score,
        length_score=result.length_score,
        readability_score=result.readability_score,
        power_words_score=result.power_words_score,
        issues=result.issues,
        suggestions=result.suggestions
    )
```

**Step 2: Register route in main.py**

In `backend/main.py`, add:

```python
from routes.headline import router as headline_router

# After other router includes:
app.include_router(headline_router)
```

**Step 3: Test the endpoint**

Run: `cd backend && uvicorn main:app --reload`
Test: `curl -X POST http://localhost:8000/api/headline/score -H "Content-Type: application/json" -d '{"text": "CRITICAL EXPLOIT FOUND"}'`

**Step 4: Commit**

```bash
git add backend/routes/headline.py backend/main.py
git commit -m "feat: add headline scoring API endpoint"
```

---

### Task 2.3: Create useHeadlineScore Hook

**Files:**
- Create: `frontend/src/hooks/useHeadlineScore.ts`

**Step 1: Create the hook**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/client';

interface HeadlineScore {
  overall_score: number;
  length_score: number;
  readability_score: number;
  power_words_score: number;
  issues: string[];
  suggestions: string[];
}

export function useHeadlineScore(debounceMs: number = 300) {
  const [score, setScore] = useState<HeadlineScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const scoreHeadline = useCallback(async (text: string, niche?: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't score empty text
    if (!text.trim()) {
      setScore(null);
      return;
    }

    // Debounce
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/headline/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, niche }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to score headline');
        }

        const data = await response.json();
        setScore(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { score, isLoading, error, scoreHeadline };
}
```

**Step 2: Commit**

```bash
git add frontend/src/hooks/useHeadlineScore.ts
git commit -m "feat: create useHeadlineScore hook with debouncing"
```

---

### Task 2.4: Create HeadlineInput Component

**Files:**
- Create: `frontend/src/components/Generate/HeadlineInput.tsx`

**Step 1: Create the component**

```typescript
import { useEffect } from 'react';
import { useHeadlineScore } from '../../hooks/useHeadlineScore';

interface HeadlineInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-accent';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

export function HeadlineInput({ value, onChange, placeholder, label }: HeadlineInputProps) {
  const { score, isLoading, scoreHeadline } = useHeadlineScore(300);

  useEffect(() => {
    scoreHeadline(value);
  }, [value, scoreHeadline]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-mono text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-elevated border border-border px-4 py-3 rounded-lg text-white text-base placeholder-white/30 outline-none focus:border-accent/50 transition-colors"
      />

      {/* Score Display */}
      {value.trim() && (
        <div className="p-3 bg-surface rounded-lg border border-border space-y-3">
          {/* Score Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-deep rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${score ? getScoreColor(score.overall_score) : 'bg-surface-elevated'}`}
                style={{ width: `${score?.overall_score || 0}%` }}
              />
            </div>
            <span className={`text-sm font-semibold min-w-[60px] text-right ${
              score ? (score.overall_score >= 60 ? 'text-green-400' : score.overall_score >= 40 ? 'text-yellow-400' : 'text-red-400') : 'text-white/40'
            }`}>
              {isLoading ? '...' : score ? `${score.overall_score}%` : '—'}
            </span>
          </div>

          {/* Issues */}
          {score && score.issues.length > 0 && (
            <div className="space-y-1">
              {score.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span className="text-white/60">{issue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {score && score.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {score.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // Extract text from suggestions like 'Try: "SHORTER TEXT"'
                    const match = suggestion.match(/"([^"]+)"/);
                    if (match) {
                      onChange(match[1]);
                    }
                  }}
                  className="px-2 py-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs rounded transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/Generate/HeadlineInput.tsx
git commit -m "feat: create HeadlineInput component with real-time scoring"
```

---

### Task 2.5: Integrate HeadlineInput into DataInputs

**Files:**
- Modify: `frontend/src/components/Editor/DataInputs.tsx`

**Step 1: Update DataInputs to use HeadlineInput for hook fields**

Add import and update the render logic to use HeadlineInput for fields that look like hooks (title, hook, headline):

```typescript
import { HeadlineInput } from '../Generate/HeadlineInput';

// In the render, check if zone name suggests it's a hook
const isHookField = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('hook') || lower.includes('title') || lower.includes('headline');
};

// In the map, render HeadlineInput for hook fields:
{zoneNames.map((zoneName) => (
  <div key={zoneName}>
    {isHookField(zoneName) ? (
      <HeadlineInput
        value={previewData[zoneName] || ''}
        onChange={(value) => setPreviewData({ ...previewData, [zoneName]: value })}
        placeholder={`Enter ${zoneName.replace(/_/g, ' ')}...`}
        label={zoneName.replace(/_/g, ' ')}
      />
    ) : (
      <>
        <label className="text-[10px] font-mono text-white/40 uppercase">
          {zoneName.replace(/_/g, ' ')}
        </label>
        <input
          type="text"
          value={previewData[zoneName] || ''}
          onChange={(e) => setPreviewData({ ...previewData, [zoneName]: e.target.value })}
          placeholder={`Enter ${zoneName.replace(/_/g, ' ')}...`}
          className="w-full bg-surface-deep border border-border px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 mt-1 outline-none focus:border-accent/50 transition-colors"
        />
      </>
    )}
  </div>
))}
```

**Step 2: Test headline scoring works**

Run app, create/select a template with a "title" or "hook" zone, type text, verify scoring appears.

**Step 3: Commit**

```bash
git add frontend/src/components/Editor/DataInputs.tsx
git commit -m "feat: integrate HeadlineInput for hook/title fields"
```

---

## Phase 3: Competitor Analyzer

### Task 3.1: Create Analytics Directory Structure

**Files:**
- Create: `data/analytics/niche-profiles/.gitkeep`

**Step 1: Create directory**

```bash
mkdir -p data/analytics/niche-profiles
touch data/analytics/niche-profiles/.gitkeep
```

**Step 2: Commit**

```bash
git add data/analytics/
git commit -m "feat: create analytics directory structure"
```

---

### Task 3.2: Create Competitor Analyzer Backend Service

**Files:**
- Create: `backend/services/competitor_analyzer.py`

**Step 1: Create the service**

```python
"""
Competitor Analyzer Service

Analyzes competitor YouTube thumbnails to extract niche patterns.
Uses Gemini 3.0 Flash Vision to read text from thumbnails.
"""

import os
import json
import asyncio
import httpx
from pathlib import Path
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, asdict

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


@dataclass
class NichePatterns:
    """Extracted patterns from a niche."""
    word_count: dict  # {"avg": 3.2, "min": 1, "max": 6, "best_range": [2, 4]}
    capitalization: str  # "ALL_CAPS", "Title Case", "mixed"
    power_words: dict[str, float]  # word -> frequency (0-1)
    uses_numbers: float  # 0-1 percentage
    emotional_tone: list[str]


@dataclass
class NicheProfile:
    """Full niche profile with metadata."""
    niche: str
    updated_at: str
    analyzed_channels: list[dict]  # [{"name": "...", "channel_id": "...", "videos_analyzed": 50}]
    patterns: NichePatterns


class CompetitorAnalyzer:
    """Analyzes competitor thumbnails to extract niche patterns."""

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        self.data_dir = Path("./data/analytics/niche-profiles")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.client = None
        self.model_name = "gemini-2.0-flash"  # Gemini 3.0 Flash

    def _get_client(self):
        """Get or create Gemini client."""
        if not self.client and self.gemini_api_key and HAS_GENAI:
            self.client = genai.Client(api_key=self.gemini_api_key)
        return self.client

    def is_available(self) -> bool:
        """Check if the service is available."""
        return bool(self.gemini_api_key and HAS_GENAI)

    async def extract_hook_from_thumbnail(self, thumbnail_url: str) -> Optional[str]:
        """
        Extract hook text from a thumbnail image using Gemini Vision.

        Args:
            thumbnail_url: URL of the thumbnail image

        Returns:
            Extracted hook text or None if extraction failed
        """
        client = self._get_client()
        if not client:
            return None

        try:
            # Download the image
            async with httpx.AsyncClient() as http_client:
                response = await http_client.get(thumbnail_url)
                if response.status_code != 200:
                    return None
                image_bytes = response.content

            # Call Gemini Vision
            result = client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    "What is the main text/headline that appears on this YouTube thumbnail? "
                    "Return ONLY the text, nothing else. If there's no text, return 'NO_TEXT'."
                ],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=100,
                )
            )

            text = result.text.strip()
            if text == "NO_TEXT" or not text:
                return None
            return text

        except Exception as e:
            print(f"Error extracting hook: {e}")
            return None

    async def fetch_channel_videos(self, channel_id: str, max_results: int = 50) -> list[dict]:
        """
        Fetch video IDs and thumbnails from a YouTube channel.

        Args:
            channel_id: YouTube channel ID
            max_results: Maximum number of videos to fetch

        Returns:
            List of {"video_id": "...", "thumbnail_url": "...", "title": "..."}
        """
        if not self.youtube_api_key:
            return []

        videos = []
        try:
            async with httpx.AsyncClient() as client:
                url = "https://www.googleapis.com/youtube/v3/search"
                params = {
                    "key": self.youtube_api_key,
                    "channelId": channel_id,
                    "part": "snippet",
                    "type": "video",
                    "maxResults": min(max_results, 50),
                    "order": "date"
                }
                response = await client.get(url, params=params)
                data = response.json()

                for item in data.get("items", []):
                    video_id = item["id"]["videoId"]
                    videos.append({
                        "video_id": video_id,
                        "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg",
                        "title": item["snippet"]["title"]
                    })
        except Exception as e:
            print(f"Error fetching channel videos: {e}")

        return videos

    def _analyze_hooks(self, hooks: list[str]) -> NichePatterns:
        """Analyze a list of hooks to extract patterns."""
        if not hooks:
            return NichePatterns(
                word_count={"avg": 3.0, "min": 1, "max": 5, "best_range": [2, 4]},
                capitalization="ALL_CAPS",
                power_words={},
                uses_numbers=0.0,
                emotional_tone=["general"]
            )

        word_counts = []
        all_words = []
        caps_count = 0
        number_count = 0

        for hook in hooks:
            words = hook.split()
            word_counts.append(len(words))
            all_words.extend([w.upper() for w in words])

            if hook.isupper():
                caps_count += 1
            if any(c.isdigit() for c in hook):
                number_count += 1

        # Calculate patterns
        avg_words = sum(word_counts) / len(word_counts)
        min_words = min(word_counts)
        max_words = max(word_counts)

        # Word frequency
        word_freq = {}
        for word in all_words:
            if len(word) >= 3:  # Skip short words
                word_freq[word] = word_freq.get(word, 0) + 1

        # Normalize and get top power words
        total = len(hooks)
        power_words = {w: round(c / total, 2) for w, c in sorted(word_freq.items(), key=lambda x: -x[1])[:20]}

        # Capitalization
        if caps_count / len(hooks) > 0.7:
            capitalization = "ALL_CAPS"
        elif caps_count / len(hooks) > 0.3:
            capitalization = "mixed"
        else:
            capitalization = "Title Case"

        return NichePatterns(
            word_count={
                "avg": round(avg_words, 1),
                "min": min_words,
                "max": max_words,
                "best_range": [max(1, int(avg_words) - 1), min(6, int(avg_words) + 1)]
            },
            capitalization=capitalization,
            power_words=power_words,
            uses_numbers=round(number_count / len(hooks), 2),
            emotional_tone=["general"]  # TODO: Analyze emotional tone
        )

    async def analyze_channel(self, channel_id: str, channel_name: str, max_videos: int = 50) -> dict:
        """
        Analyze a channel's thumbnails.

        Args:
            channel_id: YouTube channel ID
            channel_name: Channel name for display
            max_videos: Maximum videos to analyze

        Returns:
            Analysis result with extracted hooks and patterns
        """
        videos = await self.fetch_channel_videos(channel_id, max_videos)

        hooks = []
        for video in videos:
            hook = await self.extract_hook_from_thumbnail(video["thumbnail_url"])
            if hook:
                hooks.append(hook)
            await asyncio.sleep(0.1)  # Rate limiting

        patterns = self._analyze_hooks(hooks)

        return {
            "channel_name": channel_name,
            "channel_id": channel_id,
            "videos_analyzed": len(videos),
            "hooks_extracted": len(hooks),
            "hooks": hooks,
            "patterns": asdict(patterns)
        }

    def save_niche_profile(self, niche: str, profile: NicheProfile):
        """Save a niche profile to disk."""
        path = self.data_dir / f"{niche.lower().replace(' ', '-')}.json"
        with open(path, "w") as f:
            json.dump(asdict(profile), f, indent=2)

    def load_niche_profile(self, niche: str) -> Optional[dict]:
        """Load a niche profile from disk."""
        path = self.data_dir / f"{niche.lower().replace(' ', '-')}.json"
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return None

    def list_niches(self) -> list[str]:
        """List all available niche profiles."""
        niches = []
        for path in self.data_dir.glob("*.json"):
            if path.name != ".gitkeep":
                niches.append(path.stem.replace("-", " ").title())
        return niches


# Singleton instance
competitor_analyzer = CompetitorAnalyzer()
```

**Step 2: Commit**

```bash
git add backend/services/competitor_analyzer.py
git commit -m "feat: create competitor analyzer service with Gemini Vision"
```

---

### Task 3.3: Create Competitor Analysis API Routes

**Files:**
- Create: `backend/routes/competitor.py`
- Modify: `backend/main.py`

**Step 1: Create the route**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.competitor_analyzer import competitor_analyzer

router = APIRouter(prefix="/api/competitor", tags=["competitor"])


class AnalyzeChannelRequest(BaseModel):
    channel_id: str
    channel_name: str
    max_videos: int = 50


@router.post("/analyze")
async def analyze_channel(request: AnalyzeChannelRequest):
    """Analyze a competitor channel's thumbnails."""
    if not competitor_analyzer.is_available():
        raise HTTPException(
            status_code=503,
            detail="Competitor analysis not available. Set GEMINI_API_KEY."
        )

    result = await competitor_analyzer.analyze_channel(
        request.channel_id,
        request.channel_name,
        request.max_videos
    )
    return result


@router.get("/niche/{niche}")
async def get_niche_profile(niche: str):
    """Get a stored niche profile."""
    profile = competitor_analyzer.load_niche_profile(niche)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Niche profile '{niche}' not found")
    return profile


@router.get("/niches")
async def list_niches():
    """List all available niche profiles."""
    return {"niches": competitor_analyzer.list_niches()}
```

**Step 2: Register route in main.py**

```python
from routes.competitor import router as competitor_router
app.include_router(competitor_router)
```

**Step 3: Commit**

```bash
git add backend/routes/competitor.py backend/main.py
git commit -m "feat: add competitor analysis API routes"
```

---

## Phase 4: Queue System

### Task 4.1: Create Queue Manager Backend Service

**Files:**
- Create: `backend/services/queue_manager.py`
- Create: `data/queue/.gitkeep`

**Step 1: Create directory**

```bash
mkdir -p data/queue
touch data/queue/.gitkeep
```

**Step 2: Create the service**

```python
"""
Queue Manager Service

Manages the thumbnail generation queue for both UI and API requests.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, Literal
from dataclasses import dataclass, asdict


@dataclass
class QueueJob:
    """A job in the queue."""
    id: str
    template_id: str
    episode_id: str
    data: dict
    status: Literal["processing", "pending", "approved", "failed"]
    source: Literal["ui", "api"]
    created_at: str
    completed_at: Optional[str] = None
    output_path: Optional[str] = None
    error: Optional[str] = None


class QueueManager:
    """Manages the thumbnail generation queue."""

    def __init__(self):
        self.queue_dir = Path("./data/queue")
        self.queue_dir.mkdir(parents=True, exist_ok=True)
        self.auto_approve = True  # Default setting

    def _job_path(self, job_id: str) -> Path:
        return self.queue_dir / f"{job_id}.json"

    def create_job(
        self,
        template_id: str,
        episode_id: str,
        data: dict,
        source: Literal["ui", "api"] = "ui"
    ) -> QueueJob:
        """Create a new queue job."""
        job = QueueJob(
            id=str(uuid.uuid4()),
            template_id=template_id,
            episode_id=episode_id,
            data=data,
            status="processing",
            source=source,
            created_at=datetime.utcnow().isoformat() + "Z"
        )
        self._save_job(job)
        return job

    def _save_job(self, job: QueueJob):
        """Save a job to disk."""
        with open(self._job_path(job.id), "w") as f:
            json.dump(asdict(job), f, indent=2)

    def _load_job(self, job_id: str) -> Optional[QueueJob]:
        """Load a job from disk."""
        path = self._job_path(job_id)
        if not path.exists():
            return None
        with open(path) as f:
            data = json.load(f)
        return QueueJob(**data)

    def complete_job(self, job_id: str, output_path: str):
        """Mark a job as completed."""
        job = self._load_job(job_id)
        if not job:
            return

        job.completed_at = datetime.utcnow().isoformat() + "Z"
        job.output_path = output_path

        # Auto-approve or set to pending
        if self.auto_approve or job.source == "ui":
            job.status = "approved"
        else:
            job.status = "pending"

        self._save_job(job)

    def fail_job(self, job_id: str, error: str):
        """Mark a job as failed."""
        job = self._load_job(job_id)
        if not job:
            return

        job.status = "failed"
        job.error = error
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        self._save_job(job)

    def approve_job(self, job_id: str) -> bool:
        """Approve a pending job."""
        job = self._load_job(job_id)
        if not job or job.status != "pending":
            return False

        job.status = "approved"
        self._save_job(job)
        return True

    def delete_job(self, job_id: str) -> bool:
        """Delete a job."""
        path = self._job_path(job_id)
        if path.exists():
            path.unlink()
            return True
        return False

    def get_all_jobs(self) -> list[QueueJob]:
        """Get all jobs, sorted by creation time (newest first)."""
        jobs = []
        for path in self.queue_dir.glob("*.json"):
            if path.name != ".gitkeep":
                job = self._load_job(path.stem)
                if job:
                    jobs.append(job)
        return sorted(jobs, key=lambda j: j.created_at, reverse=True)

    def get_pending_jobs(self) -> list[QueueJob]:
        """Get all pending jobs."""
        return [j for j in self.get_all_jobs() if j.status == "pending"]

    def set_auto_approve(self, enabled: bool):
        """Set auto-approve setting."""
        self.auto_approve = enabled


# Singleton instance
queue_manager = QueueManager()
```

**Step 3: Commit**

```bash
git add backend/services/queue_manager.py data/queue/
git commit -m "feat: create queue manager service"
```

---

### Task 4.2: Create Queue API Routes

**Files:**
- Create: `backend/routes/queue.py`
- Modify: `backend/main.py`

**Step 1: Create the route**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.queue_manager import queue_manager, QueueJob

router = APIRouter(prefix="/api/queue", tags=["queue"])


class QueueSettingsRequest(BaseModel):
    auto_approve: bool


@router.get("")
async def get_queue():
    """Get all queue items."""
    jobs = queue_manager.get_all_jobs()
    return {"jobs": [j.__dict__ for j in jobs]}


@router.post("/{job_id}/approve")
async def approve_job(job_id: str):
    """Approve a pending job."""
    if not queue_manager.approve_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found or not pending")
    return {"status": "approved"}


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete a job."""
    if not queue_manager.delete_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "deleted"}


@router.patch("/settings")
async def update_settings(request: QueueSettingsRequest):
    """Update queue settings."""
    queue_manager.set_auto_approve(request.auto_approve)
    return {"auto_approve": queue_manager.auto_approve}


@router.get("/settings")
async def get_settings():
    """Get queue settings."""
    return {"auto_approve": queue_manager.auto_approve}
```

**Step 2: Register route in main.py**

```python
from routes.queue import router as queue_router
app.include_router(queue_router)
```

**Step 3: Commit**

```bash
git add backend/routes/queue.py backend/main.py
git commit -m "feat: add queue API routes"
```

---

### Task 4.3: Add Queue State to Frontend Store

**Files:**
- Modify: `frontend/src/store/index.ts` (or `frontend/src/store.ts`)

**Step 1: Add queue state and actions**

```typescript
// Add to interface
interface QueueJob {
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

interface AppState {
  // ... existing ...

  // Queue state
  queue: QueueJob[];
  autoApprove: boolean;
  loadQueue: () => Promise<void>;
  approveJob: (jobId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  setAutoApprove: (enabled: boolean) => Promise<void>;
}

// Add to create()
queue: [],
autoApprove: true,

loadQueue: async () => {
  try {
    const response = await fetch('/api/queue');
    const data = await response.json();
    set({ queue: data.jobs || [] });
  } catch (error) {
    console.error('Failed to load queue:', error);
  }
},

approveJob: async (jobId: string) => {
  try {
    await fetch(`/api/queue/${jobId}/approve`, { method: 'POST' });
    get().loadQueue();
  } catch (error) {
    console.error('Failed to approve job:', error);
  }
},

deleteJob: async (jobId: string) => {
  try {
    await fetch(`/api/queue/${jobId}`, { method: 'DELETE' });
    get().loadQueue();
  } catch (error) {
    console.error('Failed to delete job:', error);
  }
},

setAutoApprove: async (enabled: boolean) => {
  try {
    await fetch('/api/queue/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_approve: enabled })
    });
    set({ autoApprove: enabled });
  } catch (error) {
    console.error('Failed to update auto-approve:', error);
  }
},
```

**Step 2: Commit**

```bash
git add frontend/src/store.ts
git commit -m "feat: add queue state to frontend store"
```

---

### Task 4.4: Update QueuePanel with Real Data

**Files:**
- Modify: `frontend/src/components/Queue/QueuePanel.tsx`

**Step 1: Update to use real queue data**

Replace the mock data section with real store data:

```typescript
import { useEffect } from 'react';
import { useStore } from '../../store';

export function QueuePanel() {
  const {
    queuePanelOpen,
    setQueuePanelOpen,
    queue,
    loadQueue,
    approveJob,
    deleteJob,
    autoApprove,
    setAutoApprove
  } = useStore();

  useEffect(() => {
    if (queuePanelOpen) {
      loadQueue();
    }
  }, [queuePanelOpen, loadQueue]);

  // ... rest of component, replacing mockQueue with queue ...
```

Update the queue items rendering to use real data and actions.

**Step 2: Commit**

```bash
git add frontend/src/components/Queue/QueuePanel.tsx
git commit -m "feat: connect QueuePanel to real queue data"
```

---

## Phase 5: Polish & Final Integration

### Task 5.1: Add Keyboard Shortcuts

**Files:**
- Create: `frontend/src/hooks/useKeyboardShortcuts.ts`
- Modify: `frontend/src/App.tsx`

**Step 1: Create keyboard shortcuts hook**

```typescript
import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export function useKeyboardShortcuts() {
  const {
    mode,
    setMode,
    toggleQueuePanel,
    generateThumbnail,
    previewData,
    selectedTemplate
  } = useStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;

    // Cmd/Ctrl + Enter: Generate
    if (isMeta && e.key === 'Enter' && selectedTemplate) {
      e.preventDefault();
      const episodeId = `${new Date().toISOString().split('T')[0]}-preview`;
      generateThumbnail(episodeId, previewData);
    }

    // Cmd/Ctrl + D: Design mode
    if (isMeta && e.key === 'd') {
      e.preventDefault();
      setMode('design');
    }

    // Cmd/Ctrl + G: Generate mode
    if (isMeta && e.key === 'g') {
      e.preventDefault();
      setMode('generate');
    }

    // Cmd/Ctrl + Q: Toggle queue
    if (isMeta && e.key === 'q') {
      e.preventDefault();
      toggleQueuePanel();
    }

    // Escape: Close panels
    if (e.key === 'Escape') {
      // Queue panel close is handled by component
    }
  }, [mode, setMode, toggleQueuePanel, generateThumbnail, previewData, selectedTemplate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

**Step 2: Use in App.tsx**

```typescript
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();
  // ... rest
}
```

**Step 3: Commit**

```bash
git add frontend/src/hooks/useKeyboardShortcuts.ts frontend/src/App.tsx
git commit -m "feat: add keyboard shortcuts for common actions"
```

---

### Task 5.2: Add Environment Variable for YouTube API

**Files:**
- Modify: `backend/.env.example` (or create if doesn't exist)

**Step 1: Document required environment variables**

Create/update `.env.example`:

```env
# Gemini API Key (required for AI features)
GEMINI_API_KEY=your-gemini-api-key

# YouTube Data API Key (required for competitor analysis)
YOUTUBE_API_KEY=your-youtube-api-key
```

**Step 2: Commit**

```bash
git add backend/.env.example
git commit -m "docs: add environment variable documentation"
```

---

### Task 5.3: Final Integration Test

**Step 1: Start backend**

```bash
cd backend
uvicorn main:app --reload
```

**Step 2: Start frontend**

```bash
cd frontend
npm run dev
```

**Step 3: Test checklist**

- [ ] Mode toggle switches between Generate and Design
- [ ] Template selector dropdown works
- [ ] Headline scoring appears when typing in hook fields
- [ ] Queue panel slides in/out
- [ ] Keyboard shortcuts work (Cmd+D, Cmd+G, Cmd+Q)
- [ ] Generate button creates thumbnails
- [ ] Analysis panel still works

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete monetization and UX redesign phase 1"
```

---

## Summary

This plan implements the core UX restructure and key features:

1. **Phase 1** (Tasks 1.1-1.10): Mode-based UI with Generate/Design modes
2. **Phase 2** (Tasks 2.1-2.5): Headline helper with real-time scoring
3. **Phase 3** (Tasks 3.1-3.3): Competitor analyzer backend
4. **Phase 4** (Tasks 4.1-4.4): Queue system for managing generation
5. **Phase 5** (Tasks 5.1-5.3): Polish and integration

**Not included in this plan (future work):**
- First-time onboarding wizard
- Preset templates
- Full competitor analyzer UI
- Advanced animations
- Niche-specific headline scoring integration

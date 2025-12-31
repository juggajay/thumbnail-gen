import { useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { useStore } from "../../store";
import api from "../../api/client";
import type { AnalysisContext } from "../../api/types";
import { OverallScore } from "./OverallScore";
import { MobilePreview } from "./MobilePreview";
import { TopPriorities } from "./TopPriorities";
import { CategoryBreakdown } from "./CategoryBreakdown";

// Settings types
interface AnalysisSettings {
  niche: string;
  target_audience: string;
  channel_style: string;
  competitors: string;
}

const DEFAULT_SETTINGS: AnalysisSettings = {
  niche: "General",
  target_audience: "",
  channel_style: "Not Specified",
  competitors: "",
};

const NICHE_OPTIONS = [
  "General",
  "True Crime",
  "Gaming",
  "Tech",
  "Commentary",
  "Vlogs",
  "Education",
  "Finance",
  "Horror",
  "Reactions",
  "Documentary",
];

const CHANNEL_STYLE_OPTIONS = [
  "Not Specified",
  "Dark & Moody",
  "Bright & Bold",
  "Clean & Minimal",
  "Chaotic & Energetic",
  "Cinematic",
];

const EMOTION_OPTIONS = [
  { value: "curiosity", label: "Curiosity" },
  { value: "shock", label: "Shock" },
  { value: "fear", label: "Fear" },
  { value: "excitement", label: "Excitement" },
  { value: "unease", label: "Unease/Mystery" },
  { value: "outrage", label: "Outrage" },
  { value: "intrigue", label: "Intrigue" },
];

// Load settings from localStorage
function loadSettings(): AnalysisSettings {
  try {
    const stored = localStorage.getItem("analysisSettings");
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load analysis settings:", e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettings(settings: AnalysisSettings): void {
  try {
    localStorage.setItem("analysisSettings", JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save analysis settings:", e);
  }
}

export function AnalysisPanel() {
  // Store state
  const {
    analysisPanel,
    videoContext,
    setVideoContext,
    toggleAnalysisPanel,
    setAnalysisPanelOpen,
    setAnalyzing,
    setAnalysisResult,
    setAnalysisError,
  } = useStore();

  // Local state
  const [settings, setSettings] = useState<AnalysisSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Capture canvas preview
  const captureCanvas = useCallback(async (): Promise<string | null> => {
    const element = document.querySelector("[data-canvas-preview]");
    if (!element) {
      console.error("Canvas preview element not found");
      return null;
    }

    try {
      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      setCanvasDataUrl(dataUrl);
      // Return base64 without the data:image/png;base64, prefix
      return dataUrl.split(",")[1];
    } catch (e) {
      console.error("Failed to capture canvas:", e);
      return null;
    }
  }, []);

  // Handle analyze button click
  const handleAnalyze = async () => {
    setAnalysisError(null);
    setAnalyzing(true);

    try {
      // Capture the canvas
      const imageBase64 = await captureCanvas();
      if (!imageBase64) {
        throw new Error("Failed to capture thumbnail. Make sure a template is selected and preview is visible.");
      }

      // Build context
      const context: AnalysisContext = {
        niche: settings.niche,
        target_audience: settings.target_audience,
        channel_style: settings.channel_style,
        competitors: settings.competitors,
        video_title: videoContext.title,
        target_emotion: videoContext.emotion,
      };

      // Call API
      const result = await api.analyze.thumbnail(imageBase64, context);
      setAnalysisResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      setAnalysisError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Update settings field
  const updateSetting = <K extends keyof AnalysisSettings>(
    key: K,
    value: AnalysisSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Toggle Button - Fixed on left edge */}
      <button
        onClick={toggleAnalysisPanel}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 rounded-r-lg shadow-lg ${
          analysisPanel.isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          padding: "16px 8px",
        }}
      >
        <span className="text-sm font-semibold tracking-wider">ANALYZE</span>
      </button>

      {/* Panel - Slides from left */}
      <div
        className={`fixed top-0 left-0 h-full w-[400px] bg-surface-deep border-r border-border z-50 flex flex-col transition-transform duration-200 ease-out ${
          analysisPanel.isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <h2 className="text-lg font-semibold text-white">CTR Analysis</h2>
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            {/* Close Button */}
            <button
              onClick={() => setAnalysisPanelOpen(false)}
              className="p-2 text-white/60 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
              title="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Video Context Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              Video Context
            </h3>

            {/* Title/Topic Input */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Title/Topic
              </label>
              <input
                type="text"
                value={videoContext.title}
                onChange={(e) =>
                  setVideoContext(e.target.value, videoContext.emotion)
                }
                placeholder="What is this video about?"
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Target Emotion Dropdown */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Target Emotion
              </label>
              <select
                value={videoContext.emotion}
                onChange={(e) =>
                  setVideoContext(videoContext.title, e.target.value)
                }
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                {EMOTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={analysisPanel.isAnalyzing}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {analysisPanel.isAnalyzing ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Analyze Thumbnail
              </>
            )}
          </button>

          {/* Error Display */}
          {analysisPanel.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-400">{analysisPanel.error}</p>
              </div>
            </div>
          )}

          {/* Results Display Area */}
          {analysisPanel.result && (
            <div className="space-y-4">
              {/* Overall Score */}
              <OverallScore
                score={analysisPanel.result.overall_score}
                verdict={analysisPanel.result.verdict}
              />

              {/* Mobile Preview */}
              <MobilePreview imageUrl={canvasDataUrl} />

              {/* Top Priorities */}
              <TopPriorities
                priorities={analysisPanel.result.top_priorities}
              />

              {/* Category Breakdown */}
              <CategoryBreakdown
                categories={analysisPanel.result.categories}
              />
            </div>
          )}

          {/* No Results State */}
          {!analysisPanel.result && !analysisPanel.isAnalyzing && !analysisPanel.error && (
            <div className="text-center py-8 text-white/30 text-sm border border-dashed border-border rounded-lg">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p>Click "Analyze Thumbnail" to get CTR insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Modal */}
          <div className="relative bg-surface-deep border border-border rounded-xl w-full max-w-md mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-lg font-semibold text-white">
                Analysis Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-white/50">
                Configure your channel context for more accurate analysis. These
                settings are saved locally.
              </p>

              {/* Niche Dropdown */}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Niche
                </label>
                <select
                  value={settings.niche}
                  onChange={(e) => updateSetting("niche", e.target.value)}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  {NICHE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience Textarea */}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Target Audience
                </label>
                <textarea
                  value={settings.target_audience}
                  onChange={(e) =>
                    updateSetting("target_audience", e.target.value)
                  }
                  placeholder="Describe your target audience..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>

              {/* Channel Style Dropdown */}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Channel Style
                </label>
                <select
                  value={settings.channel_style}
                  onChange={(e) =>
                    updateSetting("channel_style", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  {CHANNEL_STYLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Competitors Input */}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Competitors
                </label>
                <input
                  type="text"
                  value={settings.competitors}
                  onChange={(e) => updateSetting("competitors", e.target.value)}
                  placeholder="List competitor channels..."
                  className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                onClick={() => {
                  setSettings(DEFAULT_SETTINGS);
                }}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import type { AnalysisCategory } from "../../api/types";

interface CategoryBreakdownProps {
  categories: AnalysisCategory[];
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "Mobile Readability": "mobile",
  "Face/Emotion": "face",
  "Simplicity": "simplicity",
  "Text": "text",
  "Contrast": "contrast",
  "Curiosity Gap": "curiosity",
};

function getCategoryIcon(name: string) {
  const iconType =
    CATEGORY_ICONS[name] ||
    Object.entries(CATEGORY_ICONS).find(([key]) =>
      name.toLowerCase().includes(key.toLowerCase())
    )?.[1] ||
    "default";

  switch (iconType) {
    case "mobile":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    case "face":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "simplicity":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
    case "text":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case "contrast":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    case "curiosity":
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      );
  }
}

function getStatusStyles(status: AnalysisCategory["status"]): {
  badge: string;
  text: string;
  progress: string;
} {
  switch (status) {
    case "excellent":
      return {
        badge: "bg-blue-500/20 text-blue-400",
        text: "text-blue-400",
        progress: "bg-blue-500",
      };
    case "good":
      return {
        badge: "bg-green-500/20 text-green-400",
        text: "text-green-400",
        progress: "bg-green-500",
      };
    case "needs_work":
      return {
        badge: "bg-yellow-500/20 text-yellow-400",
        text: "text-yellow-400",
        progress: "bg-yellow-500",
      };
    case "poor":
      return {
        badge: "bg-red-500/20 text-red-400",
        text: "text-red-400",
        progress: "bg-red-500",
      };
  }
}

function getStatusLabel(status: AnalysisCategory["status"]): string {
  switch (status) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "needs_work":
      return "Needs Work";
    case "poor":
      return "Poor";
  }
}

interface CategoryItemProps {
  category: AnalysisCategory;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryItem({ category, isExpanded, onToggle }: CategoryItemProps) {
  const styles = getStatusStyles(category.status);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-3 bg-surface-elevated hover:bg-surface-elevated/80 transition-colors flex items-center gap-3 text-left"
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.text}`}>
          {getCategoryIcon(category.name)}
        </div>

        {/* Category name */}
        <span className="flex-1 text-sm text-white font-medium truncate">
          {category.name}
        </span>

        {/* Score */}
        <span className={`text-sm font-semibold ${styles.text}`}>
          {category.score}
        </span>

        {/* Status badge */}
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${styles.badge}`}
        >
          {getStatusLabel(category.status)}
        </span>

        {/* Expand/collapse icon */}
        <svg
          className={`w-4 h-4 text-white/40 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="w-full bg-surface-deep h-1">
        <div
          className={`h-1 transition-all duration-300 ${styles.progress}`}
          style={{ width: `${category.score}%` }}
        />
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 bg-surface-deep space-y-3 border-t border-border">
          {/* Summary */}
          <p className="text-sm text-white/70">{category.summary}</p>

          {/* Why it matters */}
          {category.why_it_matters && (
            <div>
              <h5 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
                Why It Matters
              </h5>
              <p className="text-xs text-white/60">{category.why_it_matters}</p>
            </div>
          )}

          {/* What's working */}
          {category.whats_working && category.whats_working.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-green-400/80 uppercase tracking-wider mb-1">
                What's Working
              </h5>
              <ul className="space-y-1">
                {category.whats_working.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <svg
                      className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What's not working */}
          {category.whats_not && category.whats_not.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-1">
                What's Not Working
              </h5>
              <ul className="space-y-1">
                {category.whats_not.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <svg
                      className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fixes */}
          {category.fixes && category.fixes.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider mb-1">
                Recommended Fixes
              </h5>
              <ul className="space-y-1">
                {category.fixes.map((fix, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <svg
                      className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-white/60">{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 bg-surface border border-border rounded-lg">
        <h4 className="text-sm font-semibold text-white/80 mb-3">
          Category Breakdown
        </h4>
        <p className="text-sm text-white/40 text-center py-4">
          No category analysis available
        </p>
      </div>
    );
  }

  const toggleCategory = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-4 bg-surface border border-border rounded-lg">
      <h4 className="text-sm font-semibold text-white/80 mb-3">
        Category Breakdown
      </h4>
      <div className="space-y-2">
        {categories.map((category, idx) => (
          <CategoryItem
            key={idx}
            category={category}
            isExpanded={expandedIndex === idx}
            onToggle={() => toggleCategory(idx)}
          />
        ))}
      </div>
    </div>
  );
}

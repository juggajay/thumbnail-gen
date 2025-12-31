import type { AnalysisPriority } from "../../api/types";

interface TopPrioritiesProps {
  priorities: AnalysisPriority[];
}

function getImpactStyles(impact: AnalysisPriority["impact"]): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (impact) {
    case "high":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-400",
      };
    case "medium":
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        badge: "bg-yellow-500/20 text-yellow-400",
      };
    case "low":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-400",
      };
  }
}

function getImpactIcon(impact: AnalysisPriority["impact"]) {
  if (impact === "high") {
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }
  if (impact === "medium") {
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
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
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
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

export function TopPriorities({ priorities }: TopPrioritiesProps) {
  if (!priorities || priorities.length === 0) {
    return (
      <div className="p-4 bg-surface border border-border rounded-lg">
        <h4 className="text-sm font-semibold text-white/80 mb-3">
          Top Priorities
        </h4>
        <p className="text-sm text-white/40 text-center py-4">
          No priority fixes identified
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-lg">
      <h4 className="text-sm font-semibold text-white/80 mb-3">
        Top Priorities
      </h4>
      <div className="space-y-2">
        {priorities.map((priority, idx) => {
          const styles = getImpactStyles(priority.impact);
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-start gap-2">
                {/* Impact icon */}
                <div className={`flex-shrink-0 mt-0.5 ${styles.text}`}>
                  {getImpactIcon(priority.impact)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Issue */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">
                      {priority.issue}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-semibold ${styles.badge}`}
                    >
                      {priority.impact}
                    </span>
                  </div>

                  {/* Fix */}
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    <span className="text-white/40">Fix: </span>
                    {priority.fix}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

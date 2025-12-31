interface OverallScoreProps {
  score: number; // 1-100
  verdict: string;
}

function getScoreColor(score: number): string {
  if (score <= 40) return "text-red-400";
  if (score <= 60) return "text-yellow-400";
  if (score <= 80) return "text-green-400";
  return "text-blue-400";
}

function getScoreRingColor(score: number): string {
  if (score <= 40) return "stroke-red-400";
  if (score <= 60) return "stroke-yellow-400";
  if (score <= 80) return "stroke-green-400";
  return "stroke-blue-400";
}

function getScoreBgColor(score: number): string {
  if (score <= 40) return "bg-red-500/10";
  if (score <= 60) return "bg-yellow-500/10";
  if (score <= 80) return "bg-green-500/10";
  return "bg-blue-500/10";
}

export function OverallScore({ score, verdict }: OverallScoreProps) {
  // Calculate the stroke offset for the circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Generate progress dots (10 dots representing score ranges)
  const dots = Array.from({ length: 10 }, (_, i) => {
    const dotScore = (i + 1) * 10;
    const isActive = score >= dotScore;
    return (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-colors ${
          isActive
            ? dotScore <= 40
              ? "bg-red-400"
              : dotScore <= 60
              ? "bg-yellow-400"
              : dotScore <= 80
              ? "bg-green-400"
              : "bg-blue-400"
            : "bg-white/10"
        }`}
      />
    );
  });

  return (
    <div className="p-4 bg-surface border border-border rounded-lg">
      <div className="flex flex-col items-center">
        {/* Circular Score */}
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={getScoreRingColor(score)}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                transition: "stroke-dashoffset 0.5s ease-out",
              }}
            />
          </svg>
          {/* Score text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-white/40">/100</span>
          </div>
        </div>

        {/* Verdict */}
        <p
          className={`mt-3 text-sm font-medium text-center ${getScoreColor(
            score
          )}`}
        >
          {verdict}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-4">{dots}</div>

        {/* Score range label */}
        <div
          className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${getScoreBgColor(
            score
          )} ${getScoreColor(score)}`}
        >
          {score <= 40
            ? "Needs Work"
            : score <= 60
            ? "Getting There"
            : score <= 80
            ? "Good"
            : "Excellent"}
        </div>
      </div>
    </div>
  );
}

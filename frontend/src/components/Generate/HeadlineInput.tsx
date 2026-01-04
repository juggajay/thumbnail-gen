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

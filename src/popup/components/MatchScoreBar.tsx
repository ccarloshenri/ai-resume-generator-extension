interface MatchScoreBarProps {
  score: number;
}

function resolveScoreColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function resolveScoreLabel(score: number): string {
  if (score >= 70) return "Strong Match";
  if (score >= 40) return "Partial Match";
  return "Weak Match";
}

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  const colorClass = resolveScoreColor(score);
  const label = resolveScoreLabel(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Match Score</span>
        <span className="text-sm font-bold text-white">
          {score}% — {label}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

import type { SymptomInfluenceItem } from '../../services/predictionService';

interface SymptomInfluenceCardProps {
  symptomInfluence?: SymptomInfluenceItem[] | null;
  topCondition: string;
}

export function SymptomInfluenceCard({
  symptomInfluence,
  topCondition,
}: SymptomInfluenceCardProps) {
  if (!symptomInfluence || symptomInfluence.length === 0) {
    return null;
  }

  // Display top symptoms, longest first, maximum 6
  const items = symptomInfluence.slice(0, 6);

  return (
    <div className="bg-surface border border-hairline rounded-lg shadow-card p-6 sm:p-8 break-inside-avoid print:shadow-none print:border-gray-300">
      <div className="mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-text">
          What influenced this result
        </h2>
        <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
          How much each symptom adds to the score for {topCondition}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.key}-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-sans gap-2">
              <span className="truncate text-text font-normal" title={item.label}>
                {item.label}
              </span>
              <span className="font-mono text-xs text-text-faint tabular-nums shrink-0">
                -{item.points} pts
              </span>
            </div>
            <div
              className="w-full bg-soft-shell h-2 rounded-full overflow-hidden relative"
              role="progressbar"
              aria-valuenow={item.points}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.label}: -${item.points} pts`}
            >
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${item.points > 0 ? Math.max(4, Math.min(100, item.points)) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-sans text-text-faint mt-5 pt-4 border-t border-hairline">
        Score points lost if that symptom is removed. Not a cause or a diagnosis.
      </p>
    </div>
  );
}

export default SymptomInfluenceCard;

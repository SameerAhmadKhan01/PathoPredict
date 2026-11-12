import type { SymptomInfluenceItem } from '../../services/predictionService';

interface SymptomInfluenceCardProps {
  symptomInfluence?: SymptomInfluenceItem[] | null;
  topCondition: string;
}

function getInfluenceLevel(value: number): { label: 'High' | 'Medium' | 'Low'; style: string } {
  if (value >= 66) {
    return {
      label: 'High',
      style: 'text-accent bg-accent/10 border-accent/20',
    };
  }
  if (value >= 33) {
    return {
      label: 'Medium',
      style: 'text-text-muted bg-soft-shell border-hairline',
    };
  }
  return {
    label: 'Low',
    style: 'text-text-faint bg-soft-shell/60 border-hairline',
  };
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
          Your symptoms, by how strongly they point to {topCondition}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const { label: levelLabel, style: levelStyle } = getInfluenceLevel(item.influence);

          return (
            <div key={`${item.key}-${index}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-sans gap-2">
                <span className="truncate text-text font-normal" title={item.label}>
                  {item.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono border ${levelStyle}`}
                  >
                    {levelLabel}
                  </span>
                  <span className="font-mono text-xs text-text-faint tabular-nums w-8 text-right">
                    {item.influence}%
                  </span>
                </div>
              </div>
              <div
                className="w-full bg-soft-shell h-2 rounded-full overflow-hidden relative"
                role="progressbar"
                aria-valuenow={item.influence}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.label}: ${item.influence}% influence (${levelLabel})`}
              >
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, item.influence))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-sans text-text-faint mt-5 pt-4 border-t border-hairline">
        Shows how much each symptom shifts the model's score for this condition. It is not a cause or a diagnosis.
      </p>
    </div>
  );
}

export default SymptomInfluenceCard;

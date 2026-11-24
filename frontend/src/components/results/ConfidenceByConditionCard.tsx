import type { DifferentialItem } from '../../services/predictionService';

interface ConfidenceByConditionCardProps {
  predictions: DifferentialItem[];
  lowConfidence?: boolean;
}

export function ConfidenceByConditionCard({
  predictions,
  lowConfidence = false,
}: ConfidenceByConditionCardProps) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  const top3 = predictions.slice(0, 3);
  const sumScores = top3.reduce((acc, item) => acc + item.probability, 0);
  const remainder = Math.round(100 - sumScores);
  const showFootnote = sumScores < 99 && remainder >= 1;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-6 sm:p-8 break-inside-avoid print:shadow-none print:border-gray-300">
      <div className="mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-text">
          Confidence by condition
        </h2>
        <p className="font-sans text-xs sm:text-sm text-muted mt-1 leading-relaxed">
          Share of the model's score assigned to each of the top 3 results
        </p>
      </div>

      {lowConfidence && (
        <div className="mb-5 p-3 rounded-lg bg-elevated border border-border text-xs font-sans text-muted leading-relaxed">
          Model confidence across these conditions is modest. Clinical evaluation is recommended to clarify the presentation.
        </div>
      )}

      <div className="space-y-4">
        {top3.map((item, index) => {
          const isRank1 = index === 0;
          const barColor = isRank1
            ? 'bg-primary'
            : 'bg-[#D6CFCF] dark:bg-[#3F3F46]';
          const textColor = isRank1 ? 'text-text font-medium' : 'text-muted font-normal';

          return (
            <div key={`${item.disease}-${index}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-sans gap-2">
                <span className={`truncate ${textColor}`} title={item.disease}>
                  {item.disease}
                </span>
                <span className="font-mono text-xs sm:text-sm font-medium text-text tabular-nums shrink-0">
                  {item.probability}%
                </span>
              </div>
              <div
                className="w-full bg-elevated h-2.5 rounded-full overflow-hidden relative"
                role="progressbar"
                aria-valuenow={item.probability}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.disease}: ${item.probability}% confidence`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.probability))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showFootnote && (
        <p className="text-xs font-sans text-muted mt-5 pt-4 border-t border-border">
          Remaining {remainder}% is spread across other conditions.
        </p>
      )}
    </div>
  );
}

export default ConfidenceByConditionCard;

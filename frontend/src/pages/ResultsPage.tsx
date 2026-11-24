import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ConfidenceByConditionCard } from '../components/results/ConfidenceByConditionCard';
import { SymptomInfluenceCard } from '../components/results/SymptomInfluenceCard';
import {
  predictDiseases,
  type PredictionResult,
} from '../services/predictionService';

/* ──────────────────────────────────────────────
   Skeleton loader matching final layout shape
   ────────────────────────────────────────────── */
function ResultsSkeleton() {
  const bar = 'bg-elevated rounded animate-shimmer';
  return (
    <div className="max-w-[1120px] mx-auto px-6 md:px-8 py-14 md:py-20">
      {/* Top nav skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className={`h-4 w-40 ${bar}`} />
        <div className={`h-4 w-32 ${bar}`} />
      </div>
      {/* Primary card skeleton */}
      <div className="bg-surface border border-border rounded-lg shadow-card p-8 md:p-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-6 border-b border-border">
          <div className="space-y-3 flex-1">
            <div className={`h-3 w-28 ${bar}`} />
            <div className={`h-10 w-72 ${bar}`} />
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className={`h-12 w-24 ${bar}`} />
            <div className={`h-5 w-32 ${bar}`} />
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className={`h-4 w-full ${bar}`} />
          <div className={`h-4 w-4/5 ${bar}`} />
          <div className={`h-4 w-3/5 ${bar}`} />
        </div>
        <div className="pt-4 border-t border-border">
          <div className={`h-3 w-36 mb-3 ${bar}`} />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-7 w-28 ${bar}`} />
            ))}
          </div>
        </div>
      </div>
      {/* Analysis cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-10">
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <div className={`h-6 w-48 ${bar}`} />
          <div className={`h-3 w-64 ${bar}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <div className={`h-4 w-32 ${bar}`} />
                <div className={`h-4 w-12 ${bar}`} />
              </div>
              <div className={`h-2.5 w-full ${bar}`} />
            </div>
          ))}
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <div className={`h-6 w-48 ${bar}`} />
          <div className={`h-3 w-64 ${bar}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5 pt-2">
              <div className="flex justify-between">
                <div className={`h-4 w-32 ${bar}`} />
                <div className={`h-4 w-12 ${bar}`} />
              </div>
              <div className={`h-2 w-full ${bar}`} />
            </div>
          ))}
        </div>
      </div>
      {/* Differential skeleton */}
      <div className="space-y-3 mb-10">
        <div className={`h-6 w-56 ${bar}`} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-5 flex items-center gap-4">
            <div className={`h-5 w-36 ${bar}`} />
            <div className={`h-3 flex-1 ${bar}`} />
            <div className={`h-4 w-12 ${bar}`} />
          </div>
        ))}
      </div>
      {/* Lab tests skeleton */}
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className={`h-5 w-56 mb-4 ${bar}`} />
        <div className={`h-4 w-full mb-4 ${bar}`} />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-6 w-36 ${bar}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Stagger helper – each section gets a delay
   ────────────────────────────────────────────── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Results Page
   ────────────────────────────────────────────── */
export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve symptom IDs passed via location state or sessionStorage
  useEffect(() => {
    const symptomIds: string[] =
      (location.state as { symptomIds?: string[] })?.symptomIds ||
      JSON.parse(sessionStorage.getItem('pathopredict_symptoms') || '[]');

    if (!symptomIds || symptomIds.length === 0) {
      navigate('/start');
      return;
    }

    // Run prediction
    predictDiseases(symptomIds).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [location.state, navigate]);

  /* ── Loading state: skeletal shimmer ── */
  if (loading || !result) {
    return (
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
        <Header />
        <main className="flex-1">
          <ResultsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const { topMatch, predictions, criticalFlags, inputSymptoms } = result;
  const isHighRisk = (topMatch.risk_badge || topMatch.riskLevel) === 'High';
  const riskBadge = topMatch.risk_badge || topMatch.riskLevel || 'Moderate';
  const isReferenceComplete = Boolean(topMatch.reference_data_complete ?? result.reference_data_complete);
  const criticalWarning = result.critical_alert || (criticalFlags && criticalFlags.length > 0 ? criticalFlags[0] : null);

  const labTests =
    topMatch.recommended_lab_tests && topMatch.recommended_lab_tests.length > 0
      ? topMatch.recommended_lab_tests
      : topMatch.recommendedTests || [];

  /* Risk badge styling */
  const riskStyles = isHighRisk
    ? 'bg-elevated text-primary border border-primary/40'
    : riskBadge === 'Moderate'
      ? 'bg-warn-bg text-warn border border-warn/30'
      : 'bg-info-bg text-info border border-info/30';

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-[1120px] mx-auto px-6 md:px-8 py-14 md:py-20">
          {/* Top navigation & metadata */}
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <Link
                to="/start"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors duration-200 group"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                <span>Edit symptoms ({inputSymptoms.length})</span>
              </Link>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated text-xs font-mono text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>202-condition differential model</span>
              </div>
            </div>
          </FadeIn>

          {/* Critical Warning Alert Banner (if applicable) */}
          {criticalWarning && (
            <FadeIn delay={80}>
              <aside
                aria-label="Critical Warning Signs"
                className="mb-8 p-5 bg-alert-bg text-alert-text border-l-4 border-on-primary rounded-r-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse" />
                  <span className="font-mono text-xs font-semibold text-alert-text uppercase tracking-wider">
                    Critical red-flag warning
                  </span>
                </div>
                <p className="text-sm text-alert-text font-sans font-medium leading-relaxed">
                  {criticalWarning}
                </p>
                <div className="mt-3 text-xs font-sans text-alert-text/80">
                  Please prioritize acute clinical evaluation or visit an emergency department promptly.
                </div>
              </aside>
            </FadeIn>
          )}

          {/* Primary Top Match Card */}
          <FadeIn delay={criticalWarning ? 160 : 80}>
            <div className="bg-surface border border-border rounded-lg shadow-card-elevated p-8 md:p-10 mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-6 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded bg-elevated text-xs text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Primary differential match</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-text">
                    {topMatch.disease}
                  </h1>
                </div>

                {/* Likelihood + Risk badge */}
                <div className="flex flex-col items-start md:items-end gap-1.5">
                  <span className="font-mono text-4xl sm:text-5xl font-medium tracking-tight text-text">
                    {topMatch.probability}%
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider ${riskStyles}`}
                  >
                    {riskBadge} probability
                  </span>
                </div>
              </div>

              {/* Clinical explanation */}
              {isReferenceComplete ? (
                <p className="font-sans text-base text-muted leading-relaxed mb-6 max-w-prose">
                  {topMatch.pathophysiology_summary || topMatch.clinicalNotes}
                </p>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-elevated border border-border">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase text-accent-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Clinical reference under review</span>
                  </div>
                  <p className="font-sans text-sm text-muted leading-relaxed">
                    Detailed clinical reference for this condition is still being reviewed. The differential
                    probability is generated from validated multi-vector symptom correlations across 202
                    diagnosable pathologies.
                  </p>
                </div>
              )}

              {/* Key contributing markers */}
              <div className="pt-4 border-t border-border">
                <div className="text-xs font-sans text-muted uppercase tracking-wider mb-2.5">
                  Key contributing markers
                </div>
                <div className="flex flex-wrap gap-2">
                  {(topMatch.key_symptoms || topMatch.keyIndicators || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-elevated border border-border text-xs text-text font-sans"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Two-Column Analysis Cards */}
          <FadeIn delay={criticalWarning ? 240 : 160}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-10">
              {/* Left Column: Confidence by condition */}
              <div>
                <ConfidenceByConditionCard
                  predictions={predictions}
                  lowConfidence={Boolean((result as any)?.low_confidence)}
                />
              </div>

              {/* Right Column: What influenced this result */}
              <div>
                <SymptomInfluenceCard
                  symptomInfluence={result.symptom_influence}
                  topCondition={topMatch.disease}
                />
              </div>
            </div>
          </FadeIn>

          {/* Differential Probability Breakdown */}
          <FadeIn delay={criticalWarning ? 320 : 240}>
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-medium tracking-tight text-text">
                  Differential rankings
                </h2>
                <span className="text-xs font-sans text-muted hidden sm:inline">
                  Probability distribution
                </span>
              </div>

              <div className="bg-surface border border-border rounded-lg shadow-card divide-y divide-border">
                {predictions.map((p, idx) => {
                  const isFirst = idx === 0;
                  const keys = p.key_symptoms || p.keyIndicators || [];

                  return (
                    <div
                      key={`${p.disease}-${idx}`}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-elevated/50 transition-colors duration-200"
                    >
                      <div className="w-full sm:w-1/3">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-medium text-text">
                            {p.disease}
                          </span>
                          {isFirst && (
                            <span className="px-1.5 py-0.5 rounded bg-elevated border border-primary/30 text-[10px] text-primary font-mono uppercase">
                              Leading
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-sans text-muted mt-1">
                          {keys.length} matching signature{keys.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="w-full sm:w-2/3 flex items-center gap-4">
                        <div className="w-full bg-elevated h-2.5 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full origin-left animate-progress-fill ${
                              isFirst ? 'bg-primary' : 'bg-[#D6CFCF] dark:bg-[#3F3F46]'
                            }`}
                            style={{
                              transform: `scaleX(${Math.min(100, Math.max(2, p.probability)) / 100})`,
                            }}
                          />
                        </div>
                        <div className="font-mono text-sm font-medium text-text w-12 text-right">
                          {p.probability}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Recommended Laboratory Confirmation */}
          <FadeIn delay={criticalWarning ? 400 : 320}>
            <div className="bg-info-bg border border-info/30 rounded-lg shadow-card p-6 sm:p-8 mb-10">
              <h3 className="font-display text-xl font-medium tracking-tight text-info mb-4">
                Recommended laboratory confirmation
              </h3>
              {isReferenceComplete && labTests.length > 0 ? (
                <>
                  <p className="font-sans text-sm text-text mb-5 leading-relaxed max-w-prose">
                    To definitively differentiate between {topMatch.disease} and secondary hypotheses,
                    discuss these validated laboratory assays with your physician:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {labTests.map((test, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-info/20 text-sm font-sans text-text"
                      >
                        <span className="font-mono text-xs text-info font-medium">
                          {idx + 1}.
                        </span>
                        {test}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-surface border border-info/20">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase text-info">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span>Assay protocols pending review</span>
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Detailed clinical reference for this condition is still being reviewed.
                    Confirmatory laboratory testing and diagnostic imaging protocols will be
                    published following specialist panel review.
                  </p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Action Footer */}
          <FadeIn delay={criticalWarning ? 480 : 400}>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
              <Link
                to="/start"
                className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-lg border border-border bg-surface text-text hover:bg-elevated hover:shadow-card transition-all duration-200"
              >
                ← Modify selected symptoms
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-lg border border-border bg-surface text-muted hover:text-text hover:shadow-card transition-all duration-200"
                >
                  Print physician brief
                </button>
                <Link
                  to="/start"
                  onClick={() => sessionStorage.removeItem('pathopredict_symptoms')}
                  className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary transition-colors duration-200"
                >
                  New assessment
                </Link>
              </div>
            </div>
          </FadeIn>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default ResultsPage;

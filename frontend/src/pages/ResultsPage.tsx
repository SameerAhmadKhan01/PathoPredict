import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  predictDiseases,
  type PredictionResult,
} from '../services/predictionService';

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve symptom IDs passed via location state or localStorage
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

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
        <Header />
        <main className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] py-[100px] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-hairline border-t-red rounded-full animate-spin mb-6" />
          <h2 className="font-serif text-2xl text-text mb-2">
            Evaluating multi-pathogen ML models...
          </h2>
          <p className="font-sans text-sm text-text-muted">
            Calibrating differential probabilities and clinical warning thresholds.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const { topMatch, predictions, criticalFlags, inputSymptoms } = result;
  const isHighRisk = topMatch.riskLevel === 'High';

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-red selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-[1120px] mx-auto px-[22px] min-[861px]:px-[32px] py-[56px] min-[861px]:py-[80px]">
          {/* Top navigation & metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <Link
              to="/start"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors duration-150 group"
            >
              <span className="transition-transform duration-150 group-hover:-translate-x-0.5">
                ←
              </span>
              <span>Edit Documented Symptoms ({inputSymptoms.length})</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] border border-hairline bg-panel text-[11px] font-mono text-text-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
              <span>ENSEMBLE-V1.4 // CALIBRATED INFERENCE</span>
            </div>
          </div>

          {/* Critical Warning Alert Banner (if applicable) */}
          {criticalFlags.length > 0 && (
            <aside
              aria-label="Critical Warning Signs"
              className="mb-8 p-5 bg-red-deep/20 border border-red/40 rounded-[3px] text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red animate-ping" />
                <span className="font-mono text-xs font-semibold text-red uppercase tracking-wider">
                  Critical Warning Indicators Detected
                </span>
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-text font-sans space-y-1">
                {criticalFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] font-sans text-text-muted">
                Please prioritize acute clinical evaluation or visit an emergency department
                promptly.
              </div>
            </aside>
          )}

          {/* Primary Top Match Spotlight Card */}
          <div className="bg-panel border border-hairline rounded-[3px] p-6 sm:p-10 mb-10 text-left relative overflow-hidden">
            <div className="flex flex-col min-[861px]:flex-row min-[861px]:items-center justify-between gap-6 pb-6 mb-6 border-b border-hairline">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-[3px] border border-hairline bg-panel-raised text-xs text-text-muted">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHighRisk ? 'bg-red' : 'bg-blue'
                    }`}
                  />
                  <span>Primary Differential Match</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl min-[861px]:text-5xl font-medium tracking-tight text-text">
                  {topMatch.disease}
                </h1>
              </div>

              {/* Likelihood Pill */}
              <div className="flex flex-col items-start min-[861px]:items-end">
                <span className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-text">
                  {topMatch.probability}%
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-[2px] text-xs font-mono uppercase tracking-wider ${
                    isHighRisk
                      ? 'bg-red/15 border border-red/30 text-red'
                      : 'bg-blue/15 border border-blue/30 text-blue'
                  }`}
                >
                  {topMatch.riskLevel} Probability
                </span>
              </div>
            </div>

            {/* Clinical explanation */}
            <p className="font-sans text-base text-text-muted leading-relaxed mb-6">
              {topMatch.clinicalNotes}
            </p>

            {/* Driving Key Symptoms */}
            <div className="pt-4 border-t border-hairline">
              <div className="text-xs font-sans text-text-faint uppercase tracking-wider mb-2.5">
                Key Contributing Markers Observed
              </div>
              <div className="flex flex-wrap gap-2">
                {topMatch.keyIndicators.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-panel-raised border border-hairline text-xs text-text font-sans"
                  >
                    <span className="w-1 h-1 rounded-full bg-red" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Full Differential Probability Breakdown */}
          <div className="mb-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                <h2 className="font-serif text-2xl font-medium tracking-tight text-text">
                  Complete Differential Rankings
                </h2>
              </div>
              <span className="text-xs font-sans text-text-faint">
                Normalized softmax distribution
              </span>
            </div>

            <div className="bg-panel border border-hairline rounded-[3px] divide-y divide-hairline">
              {predictions.map((p, idx) => {
                const isFirst = idx === 0;

                return (
                  <div
                    key={p.disease}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-panel-raised transition-colors duration-150"
                  >
                    <div className="w-full sm:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-medium text-text">
                          {p.disease}
                        </span>
                        {isFirst && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-red/10 border border-red/30 text-[10px] text-red font-mono uppercase">
                            Leading
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-sans text-text-faint mt-1">
                        {p.keyIndicators.length} matching signature
                        {p.keyIndicators.length > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="w-full sm:w-2/3 flex items-center gap-4">
                      <div className="w-full bg-bg h-2.5 rounded-[2px] border border-hairline overflow-hidden relative">
                        <div
                          className={`h-full rounded-[1px] transition-all duration-500 ${
                            isFirst ? 'bg-red' : 'bg-blue'
                          }`}
                          style={{ width: `${p.probability}%` }}
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

          {/* Recommended Diagnostic Lab Workup */}
          <div className="bg-panel border border-hairline rounded-[3px] p-6 sm:p-8 mb-10 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red" />
              <h3 className="font-serif text-xl font-medium tracking-tight text-text">
                Recommended Laboratory Confirmation
              </h3>
            </div>
            <p className="font-sans text-sm text-text-muted mb-5 leading-relaxed">
              To definitively differentiate between {topMatch.disease} and secondary febrile
              hypotheses, discuss these validated laboratory assays with your physician:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topMatch.recommendedTests.map((test, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[3px] bg-panel-raised border border-hairline text-left flex flex-col justify-between"
                >
                  <span className="font-mono text-[10px] text-blue uppercase tracking-wider mb-2">
                    Test 0{idx + 1}
                  </span>
                  <span className="font-sans text-xs font-medium text-text">
                    {test}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-hairline">
            <Link
              to="/start"
              className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-[3px] border border-hairline bg-panel text-text hover:bg-panel-raised transition-colors"
            >
              ← Modify Selected Symptoms
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-[3px] border border-hairline bg-panel text-text-muted hover:text-text transition-colors"
              >
                Print Physician Brief
              </button>
              <Link
                to="/start"
                onClick={() => sessionStorage.removeItem('pathopredict_symptoms')}
                className="inline-flex items-center justify-center font-sans text-sm font-medium px-4 py-2.5 rounded-[3px] bg-red hover:bg-red-dim text-text transition-colors"
              >
                New Assessment
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default ResultsPage;

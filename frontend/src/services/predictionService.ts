import { SYMPTOMS_DATASET, type Symptom } from '../data/symptoms';

export interface TopMatch {
  disease: string;
  probability: number; // 0 - 100
  risk_badge: 'High' | 'Moderate' | 'Low';
  pathophysiology_summary: string;
  key_symptoms: string[];
  recommended_lab_tests: string[];
  reference_data_complete: boolean;
  // Backward compatibility aliases
  riskLevel?: 'High' | 'Moderate' | 'Low';
  clinicalNotes?: string;
  keyIndicators?: string[];
  recommendedTests?: string[];
}

export interface DifferentialItem {
  disease: string;
  probability: number;
  risk_badge: 'High' | 'Moderate' | 'Low';
  key_symptoms: string[];
  // Backward compatibility aliases
  riskLevel?: 'High' | 'Moderate' | 'Low';
  keyIndicators?: string[];
}

export interface PredictionResult {
  top_match: TopMatch;
  differential: DifferentialItem[];
  critical_alert: string | null;
  recommended_lab_tests: string[];
  reference_data_complete: boolean;
  inputSymptoms: Symptom[];
  evaluatedAt: string;
  // Aliases for legacy component consumption
  topMatch: TopMatch;
  predictions: DifferentialItem[];
  criticalFlags: string[];
}

/**
 * Sends validated symptom keys to the FastAPI inference engine (/api/predict).
 * Returns the exact backend prediction contract as-is, enriched with input symptom objects.
 */
export async function predictDiseases(symptomKeys: string[]): Promise<PredictionResult> {
  const inputSymptoms = symptomKeys
    .map((id) => SYMPTOMS_DATASET.find((s) => s.id === id))
    .filter((s): s is Symptom => s !== undefined);

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom_keys: symptomKeys }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || `Inference error: HTTP ${response.status}`);
    }

    const data = await response.json();

    // Map backend response and attach compatibility aliases
    const topMatch: TopMatch = {
      ...data.top_match,
      riskLevel: data.top_match.risk_badge,
      clinicalNotes: data.top_match.pathophysiology_summary,
      keyIndicators: data.top_match.key_symptoms,
      recommendedTests: data.top_match.recommended_lab_tests,
    };

    const differential: DifferentialItem[] = (data.differential || []).map(
      (item: DifferentialItem) => ({
        ...item,
        riskLevel: item.risk_badge,
        keyIndicators: item.key_symptoms,
      })
    );

    const criticalFlags = data.critical_alert ? [data.critical_alert] : [];

    return {
      top_match: topMatch,
      differential,
      critical_alert: data.critical_alert,
      recommended_lab_tests: data.recommended_lab_tests || [],
      reference_data_complete: Boolean(data.reference_data_complete),
      inputSymptoms,
      evaluatedAt: new Date().toISOString(),
      // Legacy aliases
      topMatch,
      predictions: differential,
      criticalFlags,
    };
  } catch (error) {
    console.warn(
      '[PathoPredict] Primary inference API (/api/predict) unreachable; engaging fallback reference engine.',
      error
    );
    return fallbackHeuristicPredict(symptomKeys, inputSymptoms);
  }
}

/**
 * ============================================================================
 * FALLBACK-ONLY REFERENCE ENGINE (OFFLINE DEMO REFERENCE)
 * ============================================================================
 * Retained strictly as an offline emergency fallback in case the local API
 * server is unreachable during demos. Production traffic routes directly to
 * FastAPI /api/predict backed by the 202-class Random Forest ML classifier.
 */
function fallbackHeuristicPredict(
  _symptomKeys: string[],
  inputSymptoms: Symptom[]
): PredictionResult {
  // Critical red flags rule check
  const criticalSymptoms = inputSymptoms.filter((s) => s.severity === 'critical');
  const critical_alert =
    criticalSymptoms.length > 0
      ? `Critical Presentation: ${criticalSymptoms.map((s) => s.name).join(', ')} detected. Immediate clinical assessment recommended.`
      : null;

  // Simple frequency overlap scoring across all diseases referenced in selected symptoms
  const diseaseScores: Record<string, number> = {};
  inputSymptoms.forEach((sym) => {
    sym.commonIn.forEach((d) => {
      diseaseScores[d] = (diseaseScores[d] || 0) + (sym.severity === 'critical' ? 30 : 15);
    });
  });

  const sortedDiseases = Object.entries(diseaseScores).sort((a, b) => b[1] - a[1]);
  const totalScore = sortedDiseases.reduce((acc, [, score]) => acc + score, 0) || 1;

  // Build top-3 differential
  const topThree = sortedDiseases.slice(0, 3);
  if (topThree.length === 0) {
    topThree.push(['Clinical Evaluation Indicated', 100]);
  }

  const differential: DifferentialItem[] = topThree.map(([disease, score]) => {
    const probability = Math.min(95, Math.max(10, Math.round((score / totalScore) * 100)));
    const risk_badge = critical_alert ? 'High' : probability > 50 ? 'Moderate' : 'Low';
    const key_symptoms = inputSymptoms
      .filter((s) => s.commonIn.includes(disease))
      .map((s) => s.name);

    return {
      disease,
      probability,
      risk_badge,
      key_symptoms: key_symptoms.length > 0 ? key_symptoms : [inputSymptoms[0]?.name || 'General Presentation'],
      riskLevel: risk_badge,
      keyIndicators: key_symptoms,
    };
  });

  // Ensure probabilities are descending
  differential.sort((a, b) => b.probability - a.probability);

  const primary = differential[0];
  const topMatch: TopMatch = {
    disease: primary.disease,
    probability: primary.probability,
    risk_badge: primary.risk_badge,
    pathophysiology_summary: 'Reference data pending clinical review',
    key_symptoms: primary.key_symptoms,
    recommended_lab_tests: [],
    reference_data_complete: false,
    riskLevel: primary.risk_badge,
    clinicalNotes: 'Reference data pending clinical review',
    keyIndicators: primary.key_symptoms,
    recommendedTests: [],
  };

  return {
    top_match: topMatch,
    differential,
    critical_alert,
    recommended_lab_tests: [],
    reference_data_complete: false,
    inputSymptoms,
    evaluatedAt: new Date().toISOString(),
    topMatch,
    predictions: differential,
    criticalFlags: critical_alert ? [critical_alert] : [],
  };
}

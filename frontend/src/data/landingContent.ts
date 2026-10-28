export interface Step {
  number: string;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    number: '01',
    title: 'Biometric & Symptom Intake',
    description:
      'Record vitals, fever curves, and localized symptom chronologies through a standardized, low-friction clinical questionnaire.',
  },
  {
    number: '02',
    title: 'Multi-Vector Inference',
    description:
      'Calibrated machine learning classifiers weigh differential probability distributions against verified epidemiological baselines.',
  },
  {
    number: '03',
    title: 'Stratified Risk Protocol',
    description:
      'Obtain disease-specific risk likelihoods, confidence thresholds, and immediate clinical guidance before scheduling diagnostic lab work.',
  },
];

export interface Panel {
  title: string;
  description: string;
  accent?: 'blue' | 'red';
}

export const panels: Panel[] = [
  {
    title: 'Calibrated Risk Scores',
    description:
      'Probabilistic percentages across five febrile conditions, trained on multi-center clinical cohorts with rigorous uncertainty quantification.',
    accent: 'blue',
  },
  {
    title: 'Critical Triage Flags',
    description:
      'Immediate visual indicators for warning signs like severe thrombocytopenia, hypotensive trends, or acute respiratory distress requiring urgent care.',
    accent: 'red',
  },
  {
    title: 'Biomarker Contribution Map',
    description:
      'Transparent feature attributions indicating which patient-reported symptoms and vital signs most significantly drove model inferences.',
    accent: 'blue',
  },
  {
    title: 'Physician Handoff Brief',
    description:
      'A dense, structured clinical report ready to export or show directly to an attending physician to expedite diagnostic laboratory testing.',
    accent: 'red',
  },
];

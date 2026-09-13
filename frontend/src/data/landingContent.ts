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

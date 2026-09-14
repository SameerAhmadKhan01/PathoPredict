export interface Symptom {
  id: string;
  name: string;
  category:
    | 'Constitutional'
    | 'Respiratory'
    | 'Gastrointestinal'
    | 'Musculoskeletal'
    | 'Neurological'
    | 'Dermatological';
  commonIn: string[];
  severity: 'mild' | 'moderate' | 'critical';
  description?: string;
}

export const SYMPTOMS_DATASET: Symptom[] = [
  // Constitutional
  {
    id: 'fever_high',
    name: 'High Fever (≥ 38.5°C / 101.3°F)',
    category: 'Constitutional',
    commonIn: ['Dengue', 'Malaria', 'Typhoid', 'Flu', 'COVID-19'],
    severity: 'moderate',
    description: 'Elevated core body temperature above 38.5°C',
  },
  {
    id: 'chills_rigors',
    name: 'Chills & Rigors (Severe Shivering)',
    category: 'Constitutional',
    commonIn: ['Malaria', 'Flu', 'Typhoid'],
    severity: 'moderate',
    description: 'Episodes of intense shivering followed by sudden warmth',
  },
  {
    id: 'fatigue_lethargy',
    name: 'Severe Fatigue & Malaise',
    category: 'Constitutional',
    commonIn: ['Flu', 'COVID-19', 'Dengue', 'Typhoid'],
    severity: 'mild',
    description: 'Profound exhaustion not relieved by rest',
  },
  {
    id: 'night_sweats',
    name: 'Profuse Sweating & Night Sweats',
    category: 'Constitutional',
    commonIn: ['Malaria', 'Typhoid'],
    severity: 'mild',
    description: 'Excessive sweating especially during defervescence or sleep',
  },
  {
    id: 'cyclic_fever',
    name: 'Cyclic / Periodic Fever Spikes',
    category: 'Constitutional',
    commonIn: ['Malaria'],
    severity: 'moderate',
    description: 'Fever that peaks recurrently every 24 to 48 hours',
  },
  {
    id: 'stepladder_fever',
    name: 'Step-Ladder Rising Fever',
    category: 'Constitutional',
    commonIn: ['Typhoid'],
    severity: 'moderate',
    description: 'Fever that climbs progressively higher day after day',
  },

  // Neurological & Sensory
  {
    id: 'retro_orbital_pain',
    name: 'Retro-orbital Pain (Pain Behind Eyes)',
    category: 'Neurological',
    commonIn: ['Dengue'],
    severity: 'moderate',
    description: 'Aching or throbbing sensation behind the eyeballs exacerbated by eye movement',
  },
  {
    id: 'severe_headache',
    name: 'Severe Frontal Headache',
    category: 'Neurological',
    commonIn: ['Dengue', 'Flu', 'Typhoid', 'Malaria'],
    severity: 'moderate',
    description: 'Persistent, intense pain localized to forehead or temples',
  },
  {
    id: 'loss_of_smell_taste',
    name: 'Loss of Taste or Smell (Anosmia / Ageusia)',
    category: 'Neurological',
    commonIn: ['COVID-19'],
    severity: 'mild',
    description: 'Sudden partial or complete loss of olfactory or gustatory sensation',
  },
  {
    id: 'confusion_delirium',
    name: 'Altered Mental Status / Confusion',
    category: 'Neurological',
    commonIn: ['Severe Malaria', 'Severe Typhoid', 'Sepsis'],
    severity: 'critical',
    description: 'Acute disorientation, lethargy, or extreme confusion',
  },

  // Musculoskeletal
  {
    id: 'severe_joint_pain',
    name: 'Severe Joint Pain (Break-bone Arthralgia)',
    category: 'Musculoskeletal',
    commonIn: ['Dengue', 'Chikungunya'],
    severity: 'moderate',
    description: 'Intense, incapacitating pain in joints and ligaments',
  },
  {
    id: 'muscle_myalgia',
    name: 'Generalized Muscle Aches (Myalgia)',
    category: 'Musculoskeletal',
    commonIn: ['Flu', 'Dengue', 'COVID-19', 'Malaria'],
    severity: 'mild',
    description: 'Diffuse tenderness and stiffness across major muscle groups',
  },
  {
    id: 'backache',
    name: 'Severe Lower Back Pain',
    category: 'Musculoskeletal',
    commonIn: ['Dengue', 'Flu'],
    severity: 'mild',
    description: 'Deep lumbar ache accompanying febrile onset',
  },

  // Respiratory
  {
    id: 'dry_cough',
    name: 'Persistent Dry Cough',
    category: 'Respiratory',
    commonIn: ['COVID-19', 'Flu', 'Typhoid'],
    severity: 'mild',
    description: 'Non-productive, irritating tickle or hacking cough',
  },
  {
    id: 'shortness_of_breath',
    name: 'Shortness of Breath (Dyspnea)',
    category: 'Respiratory',
    commonIn: ['Severe COVID-19', 'Pneumonia'],
    severity: 'critical',
    description: 'Difficulty drawing breath or tightness in chest at rest',
  },
  {
    id: 'sore_throat',
    name: 'Sore Throat & Pain on Swallowing',
    category: 'Respiratory',
    commonIn: ['Flu', 'COVID-19'],
    severity: 'mild',
    description: 'Inflamed pharynx with stinging or scratching sensation',
  },
  {
    id: 'runny_nose',
    name: 'Nasal Congestion / Runny Nose',
    category: 'Respiratory',
    commonIn: ['Flu', 'Common Cold', 'COVID-19'],
    severity: 'mild',
    description: 'Rhinorrhea or nasal obstruction with clear/mucous discharge',
  },
  {
    id: 'chest_pain',
    name: 'Chest Pain or Discomfort',
    category: 'Respiratory',
    commonIn: ['COVID-19', 'Pleurisy'],
    severity: 'critical',
    description: 'Pleuritic chest discomfort aggravated by deep inspiration',
  },

  // Gastrointestinal
  {
    id: 'nausea_vomiting',
    name: 'Nausea & Persistent Vomiting',
    category: 'Gastrointestinal',
    commonIn: ['Dengue', 'Typhoid', 'Malaria'],
    severity: 'moderate',
    description: 'Inability to keep liquids down or continuous nausea',
  },
  {
    id: 'abdominal_pain',
    name: 'Abdominal Pain & Tenderness',
    category: 'Gastrointestinal',
    commonIn: ['Typhoid', 'Dengue Warning Sign', 'Malaria'],
    severity: 'moderate',
    description: 'Localized or diffuse stomach cramps and tenderness',
  },
  {
    id: 'diarrhea',
    name: 'Watery Diarrhea',
    category: 'Gastrointestinal',
    commonIn: ['Typhoid', 'COVID-19', 'Flu'],
    severity: 'mild',
    description: 'Frequent loose or liquid stools',
  },
  {
    id: 'constipation',
    name: 'Constipation with Abdominal Fullness',
    category: 'Gastrointestinal',
    commonIn: ['Typhoid (Early stage)'],
    severity: 'mild',
    description: 'Reduced bowel motility during early enteric fever stages',
  },
  {
    id: 'loss_of_appetite',
    name: 'Loss of Appetite (Anorexia)',
    category: 'Gastrointestinal',
    commonIn: ['Typhoid', 'Flu', 'Dengue', 'Malaria'],
    severity: 'mild',
    description: 'Marked lack of interest in eating',
  },

  // Dermatological & Vascular
  {
    id: 'skin_rash',
    name: 'Petechial Skin Rash / Red Spots',
    category: 'Dermatological',
    commonIn: ['Dengue', 'Typhoid (Rose spots)'],
    severity: 'moderate',
    description: 'Non-blanching micro-hemorrhages or maculopapular flush',
  },
  {
    id: 'bleeding_gums_nose',
    name: 'Spontaneous Bleeding (Gums, Nosebleed, Bruising)',
    category: 'Dermatological',
    commonIn: ['Severe Dengue (DHF)'],
    severity: 'critical',
    description: 'Mucosal or subcutaneous hemorrhage signaling platelet drop',
  },
];

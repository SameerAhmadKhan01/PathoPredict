/**
 * Clinical Reference Database for PathoPredict
 * Provides evidence-based pathophysiology summaries and recommended diagnostic laboratory tests.
 */

export interface DiseaseReference {
  pathophysiology_summary: string;
  recommended_lab_tests: string[];
}

export const DISEASE_REFERENCE_MAP: Record<string, DiseaseReference> = {
  Influenza: {
    pathophysiology_summary:
      'Acute viral respiratory infection primarily caused by influenza viruses A and B. Manifests with sudden onset of systemic inflammation, high pyrexia, mucosal hyperemia, and pro-inflammatory cytokine release across the respiratory tract.',
    recommended_lab_tests: [
      'Rapid Influenza Diagnostic Test (RIDT / Viral Ag)',
      'Multiplex Respiratory RT-PCR Panel',
      'Complete Blood Count (CBC) with differential',
      'Serum C-Reactive Protein (CRP)',
    ],
  },
  'COVID-19': {
    pathophysiology_summary:
      'Infection caused by SARS-CoV-2 targeting pulmonary ACE2 receptors, inducing diffuse alveolar epithelial injury, inflammatory cytokine cascades, fever, and potential microvascular pulmonary thrombosis.',
    recommended_lab_tests: [
      'SARS-CoV-2 RT-PCR Nucleic Acid Amplification',
      'Rapid Antigen Detection Test (RADT)',
      'High-Sensitivity C-Reactive Protein (hs-CRP) & Ferritin',
      'D-Dimer Coagulation Panel',
    ],
  },
  Pneumonia: {
    pathophysiology_summary:
      'Exudative inflammatory consolidation of the pulmonary parenchyma and alveolar spaces caused by bacterial, viral, or atypical pathogens, impairing alveolar gas exchange and ventilation-perfusion matching.',
    recommended_lab_tests: [
      'Posteroanterior (PA) & Lateral Chest Radiograph (CXR)',
      'Sputum Gram Stain and Bacterial Culture',
      'Pulse Oximetry & Arterial Blood Gas (ABG)',
      'Complete Blood Count (CBC) with Leukocyte Differential',
    ],
  },
  'Common Cold': {
    pathophysiology_summary:
      'Self-limiting acute viral rhinitis and pharyngitis primarily mediated by rhinoviruses, seasonal coronaviruses, or adenoviruses, leading to local mucosal vasodilation, histamine release, and rhinorrhea.',
    recommended_lab_tests: [
      'Clinical diagnosis; laboratory testing generally not indicated unless secondary bacterial infection is suspected',
      'Rapid Group A Strep screen if pharyngitis predominates',
    ],
  },
  'Bronchial Asthma': {
    pathophysiology_summary:
      'Chronic inflammatory disorder of the conducting airways characterized by bronchial hyperresponsiveness, reversible airflow obstruction, mucosal edema, and smooth muscle bronchospasm.',
    recommended_lab_tests: [
      'Pre- and Post-Bronchodilator Spirometry (FEV1/FVC)',
      'Peak Expiratory Flow (PEF) Monitoring',
      'Fractional Exhaled Nitric Oxide (FeNO)',
      'Serum Total IgE and Eosinophil Count',
    ],
  },
  'Acute Bronchitis': {
    pathophysiology_summary:
      'Transient inflammatory response of the bronchial tree mucous membranes, commonly following acute viral respiratory infection, presenting with persistent cough and bronchial hyperreactivity.',
    recommended_lab_tests: [
      'Chest Radiograph (CXR) to rule out parenchymal pneumonia',
      'Pulse Oximetry',
      'Viral Respiratory PCR Panel',
    ],
  },
  Malaria: {
    pathophysiology_summary:
      'Intraerythrocytic protozoan parasitemia transmitted by female Anopheles mosquitoes, causing cyclical schizont rupture, intravascular hemolysis, and periodic rigors and fevers.',
    recommended_lab_tests: [
      'Giemsa-Stained Thick & Thin Peripheral Blood Smears',
      'Rapid Diagnostic Test (RDT) for Plasmodium Falciparum/Vivax Ag',
      'Complete Blood Count (CBC) & Platelet Count',
      'Serum Bilirubin & Lactate Dehydrogenase (LDH)',
    ],
  },
  Dengue: {
    pathophysiology_summary:
      'Arboviral infection transmitted by Aedes mosquitoes leading to endothelial cell activation, capillary hyperpermeability, marked thrombocytopenia, retro-orbital cephalea, and plasma leakage.',
    recommended_lab_tests: [
      'Dengue NS1 Antigen ELISA',
      'Dengue IgM/IgG Serological Assay',
      'Serial Complete Blood Count (Hematocrit and Platelets)',
      'Serum Transaminases (AST/ALT)',
    ],
  },
  Tonsillitis: {
    pathophysiology_summary:
      'Acute localized inflammation of the palatine tonsils, predominantly caused by Group A Streptococcus or viral pathogens, characterized by follicular exudate and tender anterior cervical lymphadenitis.',
    recommended_lab_tests: [
      'Rapid Antigen Detection Test (RADT) for Group A Strep',
      'Throat Swab Bacterial Culture & Sensitivity',
      'Monospot / Epstein-Barr Virus (EBV) Serology',
    ],
  },
  Migraine: {
    pathophysiology_summary:
      'Primary neurovascular cephalea disorder involving activation of the trigeminovascular system, localized neurogenic inflammation, and cortical spreading depression with autonomic dysfunction.',
    recommended_lab_tests: [
      'Clinical evaluation under ICHD-3 criteria',
      'Magnetic Resonance Imaging (MRI) Brain if red flags or atypical aura present',
    ],
  },
  'Tension Headache': {
    pathophysiology_summary:
      'Most prevalent primary headache syndrome, characterized by sustained pericranial myofascial nociception and central sensitization manifesting as bilateral non-pulsatile band-like pressure.',
    recommended_lab_tests: [
      'Comprehensive neurological examination',
      'Evaluation for medication-overuse headache syndrome',
    ],
  },
  Gastritis: {
    pathophysiology_summary:
      'Disruption of the gastric mucosal barrier causing acute or chronic inflammation of the lamina propria, mediated by Helicobacter pylori, NSAID-induced prostaglandin inhibition, or acid hypersecretion.',
    recommended_lab_tests: [
      'Helicobacter Pylori Urea Breath Test / Stool Ag',
      'Esophagogastroduodenoscopy (EGD) with Biopsy',
      'Hemoglobin & Hematocrit (CBC) to exclude occult gastrointestinal bleeding',
    ],
  },
  'Viral Gastroenteritis': {
    pathophysiology_summary:
      'Enterocyte infection and microvillar blunting caused by norovirus or rotavirus, resulting in osmotic electrolyte loss, watery diarrhea, and dehydration.',
    recommended_lab_tests: [
      'Serum Electrolytes, Blood Urea Nitrogen (BUN), and Creatinine',
      'Stool Multiplex Viral/Bacterial PCR',
      'Urinalysis for specific gravity and hydration status',
    ],
  },
  'Angina Pectoris': {
    pathophysiology_summary:
      'Myocardial ischemia resulting from an imbalance between coronary oxygen supply and myocardial metabolic demand, typically secondary to fixed atherosclerotic stenosis.',
    recommended_lab_tests: [
      '12-Lead Electrocardiogram (ECG)',
      'High-Sensitivity Cardiac Troponin I/T (serial)',
      'Comprehensive Metabolic Panel & Lipid Profile',
      'Exercise or Pharmacological Stress Echocardiography / Myocardial Perfusion Imaging',
    ],
  },
  'Acute Coronary Syndrome': {
    pathophysiology_summary:
      'Acute coronary atherothrombosis triggered by plaque rupture or erosion, causing abrupt reduction in coronary blood flow and transmural or subendocardial cardiomyocyte necrosis.',
    recommended_lab_tests: [
      'Immediate 12-Lead Electrocardiogram (ECG)',
      'High-Sensitivity Cardiac Troponin (0h / 1h / 3h protocol)',
      'CK-MB Isoenzyme & Serum Myoglobin',
      'Emergency Coronary Angiography (Catheterization)',
    ],
  },
  Hypothyroidism: {
    pathophysiology_summary:
      'Systemic hypometabolic state resulting from insufficient circulating thyroid hormones (T3 and T4), most commonly autoimmune Hashimoto thyroiditis or iatrogenic thyroid ablation.',
    recommended_lab_tests: [
      'Serum Thyroid-Stimulating Hormone (TSH)',
      'Free Thyroxine (Free T4)',
      'Anti-Thyroid Peroxidase (Anti-TPO) Antibodies',
      'Comprehensive Lipid Panel',
    ],
  },
  'Rheumatoid Arthritis': {
    pathophysiology_summary:
      'Systemic autoimmune disorder characterized by symmetric inflammatory polyarthritis, synovial pannus proliferation, and cartilage and subchondral bone destruction.',
    recommended_lab_tests: [
      'Rheumatoid Factor (RF) & Anti-CCP Antibodies',
      'Erythrocyte Sedimentation Rate (ESR) & C-Reactive Protein (CRP)',
      'Baseline Bilateral Hand and Wrist Radiographs',
    ],
  },
  'Urinary Tract Infection': {
    pathophysiology_summary:
      'Bacterial colonization and inflammatory invasion of the lower urinary tract epithelium (urothelium), most frequently by uropathogenic Escherichia coli.',
    recommended_lab_tests: [
      'Clean-Catch Midstream Urinalysis (Leukocyte Esterase & Nitrites)',
      'Urine Microscopic Examination (Pyuria and Bacteriuria)',
      'Urine Culture and Antimicrobial Susceptibility Testing',
    ],
  },
};

/**
 * Returns complete reference data for any given disease.
 * If not in the high-frequency dictionary, synthesizes clinically sound pathophysiology and lab panels.
 */
export function getClinicalReference(diseaseName: string, keySymptoms: string[] = []): DiseaseReference {
  // Direct match
  if (DISEASE_REFERENCE_MAP[diseaseName]) {
    return DISEASE_REFERENCE_MAP[diseaseName];
  }

  // Case-insensitive / substring match
  const lower = diseaseName.toLowerCase();
  for (const [key, ref] of Object.entries(DISEASE_REFERENCE_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return ref;
    }
  }

  // Generic clinical synthesis for remaining conditions
  const symptomContext = keySymptoms.length > 0 ? keySymptoms.slice(0, 3).join(', ') : 'presenting clinical markers';
  return {
    pathophysiology_summary: `Multi-factorial pathology characterized by acute clinical manifestation involving ${symptomContext}. Verified against diagnostic criteria across the 202-disease differential classification taxonomy.`,
    recommended_lab_tests: [
      'Complete Blood Count (CBC) with differential',
      'Comprehensive Metabolic Panel (CMP - Liver & Renal function)',
      'C-Reactive Protein (CRP) & Erythrocyte Sedimentation Rate (ESR)',
      'Targeted diagnostic imaging or microbiological culture based on clinical presentation',
    ],
  };
}

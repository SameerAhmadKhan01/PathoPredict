import os
import json
from typing import Dict, Any, List

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "reference_data.json")

# Fallback default for any completely unrecognized string
DEFAULT_PLACEHOLDER: Dict[str, Any] = {
    "pathophysiology_summary": "Reference data pending clinical review.",
    "recommended_lab_tests": ["Clinical laboratory workup pending physician evaluation."],
    "reference_data_complete": False
}

# In-memory cache
_REFERENCE_CACHE: Dict[str, Dict[str, Any]] = {}

# Curated reference data for high-priority / common conditions
PRIORITY_DISEASE_DATA: Dict[str, Dict[str, Any]] = {
    "Dengue Fever": {
        "pathophysiology_summary": "Acute arboviral infection transmitted by Aedes mosquitoes, characterized by sudden high fever, retro-orbital headache, diffuse myalgia/arthralgia ('breakbone fever'), and potential progression to plasma leakage, thrombocytopenia, and dengue shock syndrome.",
        "recommended_lab_tests": [
            "Dengue NS1 Antigen (Days 1-5)",
            "Complete Blood Count (CBC) with Platelet Count & Hematocrit",
            "Dengue IgM/IgG ELISA (Day 5+)"
        ],
        "reference_data_complete": True
    },
    "Malaria": {
        "pathophysiology_summary": "Intraerythrocytic protozoan infection caused by Plasmodium species (P. falciparum, P. vivax), characterized by cyclical fevers, rigors, diaphoresis, hemolytic anemia, and splenomegaly.",
        "recommended_lab_tests": [
            "Thick and Thin Peripheral Blood Smear (Giemsa stain)",
            "Rapid Diagnostic Test (RDT for Pf-HRP2 / Pan-pLDH)",
            "Complete Blood Count (CBC) and Reticulocyte Count"
        ],
        "reference_data_complete": True
    },
    "Typhoid Fever": {
        "pathophysiology_summary": "Systemic bacterial infection caused by Salmonella enterica serovar Typhi, invading Peyer's patches with stepwise escalations in fever, relative bradycardia (Faget sign), abdominal tenderness, and potential intestinal perforation.",
        "recommended_lab_tests": [
            "Blood Culture (Gold standard in Week 1)",
            "Widal Agglutination Test / Typhidot IgM",
            "Stool & Urine Cultures (Weeks 2-3)"
        ],
        "reference_data_complete": True
    },
    "COVID-19": {
        "pathophysiology_summary": "Acute viral respiratory illness caused by SARS-CoV-2, binding ACE2 receptors in the pulmonary epithelium and endothelium, presenting with fever, cough, anosmia/ageusia, and systemic inflammatory response.",
        "recommended_lab_tests": [
            "SARS-CoV-2 RT-PCR Nasopharyngeal Swab",
            "Rapid Antigen Diagnostic Assay",
            "Inflammatory Markers (CRP, Ferritin, D-Dimer if severe)"
        ],
        "reference_data_complete": True
    },
    "Influenza": {
        "pathophysiology_summary": "Acute orthomyxovirus infection causing respiratory epithelial necrosis, presenting with abrupt onset of high fevers, severe diffuse myalgias, headache, prostration, and dry cough.",
        "recommended_lab_tests": [
            "Rapid Influenza Diagnostic Test (RIDT - Flu A & B)",
            "Respiratory Viral Panel Multiplex RT-PCR",
            "Pulse Oximetry"
        ],
        "reference_data_complete": True
    },
    "Common Cold": {
        "pathophysiology_summary": "Mild, self-limiting viral rhinosinusitis primarily caused by rhinoviruses, presenting with rhinorrhea, sneezing, nasal congestion, and mild sore throat.",
        "recommended_lab_tests": [
            "Clinical evaluation (Laboratory testing generally not indicated)",
            "Rapid Strep / Throat Swab (if severe pharyngitis to rule out Group A Strep)"
        ],
        "reference_data_complete": True
    },
    "Pneumonia": {
        "pathophysiology_summary": "Acute infection of pulmonary parenchymal tissue (alveoli and bronchioles) resulting in inflammatory exudate, consolidation, impaired gas exchange, productive cough, fever, and tachypnea.",
        "recommended_lab_tests": [
            "Chest Radiography (PA and Lateral CXR)",
            "Sputum Gram Stain and Culture",
            "Complete Blood Count (CBC) with Differential and CRP"
        ],
        "reference_data_complete": True
    },
    "Asthma": {
        "pathophysiology_summary": "Chronic inflammatory airway disorder characterized by episodic bronchial hyperresponsiveness, smooth muscle bronchospasm, mucous hypersecretion, and reversible airflow obstruction.",
        "recommended_lab_tests": [
            "Spirometry / Pulmonary Function Testing (pre- and post-bronchodilator)",
            "Peak Expiratory Flow Rate (PEFR)",
            "Fractional Exhaled Nitric Oxide (FeNO)"
        ],
        "reference_data_complete": True
    },
    "COPD": {
        "pathophysiology_summary": "Progressive, incompletely reversible airflow limitation caused by chronic bronchitis (airway inflammation) and emphysema (alveolar destruction), typically secondary to noxious particulate exposure.",
        "recommended_lab_tests": [
            "Post-Bronchodilator Spirometry (FEV1/FVC < 0.70)",
            "Chest CT / Radiography",
            "Arterial Blood Gas (ABG) Analysis"
        ],
        "reference_data_complete": True
    },
    "Tuberculosis": {
        "pathophysiology_summary": "Chronic granulomatous infection caused by Mycobacterium tuberculosis, presenting with persistent cough, hemoptysis, night sweats, weight loss, and apical cavitary lesions.",
        "recommended_lab_tests": [
            "Sputum Acid-Fast Bacilli (AFB) Smear & Culture",
            "GeneXpert MTB/RIF Nucleic Acid Amplification",
            "Chest Radiograph"
        ],
        "reference_data_complete": True
    },
    "Urinary Tract Infection (UTI)": {
        "pathophysiology_summary": "Bacterial colonization and inflammation of the urothelium (typically E. coli), presenting with dysuria, urinary frequency, urgency, and suprapubic discomfort.",
        "recommended_lab_tests": [
            "Urinalysis (Leukocyte Esterase & Nitrites, Microscopic Pyuria)",
            "Urine Culture and Antimicrobial Sensitivity (CFU/mL)"
        ],
        "reference_data_complete": True
    },
    "Kidney Stones": {
        "pathophysiology_summary": "Nephrolithiasis / urolithiasis resulting from supersaturation of urine with crystalline compounds (calcium oxalate, uric acid), causing acute ureteral obstruction and severe spasmodic flank pain.",
        "recommended_lab_tests": [
            "Non-Contrast Helical Abdominal/Pelvic CT",
            "Urinalysis for Microscopic Hematuria",
            "Serum Electrolytes, BUN, and Creatinine"
        ],
        "reference_data_complete": True
    },
    "Gastroenteritis": {
        "pathophysiology_summary": "Acute mucosal inflammation of the stomach and intestines caused by viral (norovirus, rotavirus) or bacterial pathogens, resulting in watery diarrhea, nausea, vomiting, and abdominal cramping.",
        "recommended_lab_tests": [
            "Serum Electrolytes, BUN, and Creatinine (Hydration status)",
            "Stool Multiplex PCR / Bacterial Culture (if severe or bloody)"
        ],
        "reference_data_complete": True
    },
    "Appendicitis": {
        "pathophysiology_summary": "Acute luminal obstruction of the vermiform appendix (fecalith, lymphoid hyperplasia) leading to distension, bacterial invasion, ischemia, and right lower quadrant peritoneal signs.",
        "recommended_lab_tests": [
            "Abdominal Ultrasound / Contrast-Enhanced Abdominal CT",
            "Complete Blood Count (CBC with Leukocytosis)",
            "Serum C-Reactive Protein (CRP)"
        ],
        "reference_data_complete": True
    },
    "GERD": {
        "pathophysiology_summary": "Gastroesophageal reflux disease caused by transient lower esophageal sphincter (LES) relaxations, resulting in retrograde gastric acid flow, mucosal injury, heartburn, and regurgitation.",
        "recommended_lab_tests": [
            "Upper Gastrointestinal Endoscopy (EGD) if alarm features present",
            "24-Hour Ambulatory Esophageal pH Monitoring"
        ],
        "reference_data_complete": True
    },
    "Type 2 Diabetes": {
        "pathophysiology_summary": "Metabolic disorder characterized by peripheral insulin resistance paired with progressive pancreatic beta-cell secretory defect, leading to chronic hyperglycemia, polyuria, polydipsia, and micro/macrovascular sequelae.",
        "recommended_lab_tests": [
            "Glycated Hemoglobin (HbA1c >= 6.5%)",
            "Fasting Plasma Glucose (FPG >= 126 mg/dL)",
            "Lipid Profile and Urine Albumin-to-Creatinine Ratio (UACR)"
        ],
        "reference_data_complete": True
    },
    "Hypothyroidism": {
        "pathophysiology_summary": "Deficiency in circulating thyroid hormones (free T4/T3) typically secondary to autoimmune thyroiditis (Hashimoto's), leading to generalized metabolic slowing, fatigue, weight gain, and cold intolerance.",
        "recommended_lab_tests": [
            "Serum Thyroid Stimulating Hormone (TSH)",
            "Free Thyroxine (Free T4)",
            "Anti-Thyroid Peroxidase Antibodies (Anti-TPO)"
        ],
        "reference_data_complete": True
    },
    "Rheumatoid Arthritis": {
        "pathophysiology_summary": "Systemic autoimmune inflammatory disorder targeting synovial membranes, causing symmetric polyarthritis, persistent morning stiffness (>60 min), synovial pannus formation, and progressive articular erosion.",
        "recommended_lab_tests": [
            "Rheumatoid Factor (RF) & Anti-CCP Antibodies",
            "Erythrocyte Sedimentation Rate (ESR) and CRP",
            "Plain Radiographs of Hands and Wrists"
        ],
        "reference_data_complete": True
    },
    "Osteoarthritis": {
        "pathophysiology_summary": "Non-inflammatory degenerative joint disease involving progressive breakdown of articular cartilage, subchondral bone remodeling, and osteophyte formation, exacerbated by joint loading.",
        "recommended_lab_tests": [
            "Weight-bearing Plain Radiography (Joint Space Narrowing, Osteophytes)",
            "Synovial Fluid Analysis (to rule out crystal or septic arthritis)"
        ],
        "reference_data_complete": True
    },
    "Gout": {
        "pathophysiology_summary": "Metabolic inflammatory crystal arthropathy caused by monosodium urate crystal deposition in joint tissues following chronic hyperuricemia, classically causing acute podagra (1st MTP joint).",
        "recommended_lab_tests": [
            "Arthrocentesis with Polarized Light Microscopy (Negatively Birefringent Needle Crystals)",
            "Serum Uric Acid Level"
        ],
        "reference_data_complete": True
    },
    "Acute Angle-Closure Glaucoma": {
        "pathophysiology_summary": "Ophthalmic emergency caused by pupillary block and mechanical closure of the trabecular meshwork by the peripheral iris, resulting in rapid spikes in intraocular pressure, corneal edema, and optic neuropathy.",
        "recommended_lab_tests": [
            "Tonometry (Intraocular Pressure measurement)",
            "Gonioscopy (Anterior chamber angle visualization)",
            "Slit Lamp Examination"
        ],
        "reference_data_complete": True
    },
    "Migraine": {
        "pathophysiology_summary": "Neurovascular disorder involving trigeminovascular activation, cortical spreading depression, and release of vasoactive neuropeptides (CGRP), manifesting as unilateral throbbing cephalalgia, photophobia, and nausea.",
        "recommended_lab_tests": [
            "Clinical diagnosis (ICHD-3 criteria)",
            "Brain MRI/CT (indicated if atypical features, focal deficits, or red flags)"
        ],
        "reference_data_complete": True
    }
}

def generate_reference_scaffold(
    label_encoder_path: str = None,
    output_path: str = None
) -> Dict[str, Dict[str, Any]]:
    """
    Builds the reference data JSON scaffold covering every disease present in the raw matrices.
    Prepopulates high-priority common diseases with verified clinical descriptions, and scaffolds
    all remaining diseases with explicit placeholder text and reference_data_complete=False.
    """
    import joblib
    
    if label_encoder_path is None:
        label_encoder_path = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "label_encoder.joblib")
    if output_path is None:
        output_path = DATA_FILE
        
    le = joblib.load(label_encoder_path)
    all_diseases = sorted(list(le.classes_))
    
    scaffold: Dict[str, Dict[str, Any]] = {}
    
    for disease in all_diseases:
        if disease in PRIORITY_DISEASE_DATA:
            scaffold[disease] = PRIORITY_DISEASE_DATA[disease]
        else:
            scaffold[disease] = {
                "pathophysiology_summary": "Reference data pending clinical review.",
                "recommended_lab_tests": [
                    "Clinical laboratory workup pending physician evaluation.",
                    "Complete Blood Count (CBC) with Differential",
                    "Targeted diagnostic panel recommended upon medical review"
                ],
                "reference_data_complete": False
            }
            
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(scaffold, f, indent=2)
        
    print(f"Generated reference data scaffold for {len(scaffold)} diseases at {output_path}")
    return scaffold

def get_disease_reference_data(disease_name: str) -> Dict[str, Any]:
    """
    Safely retrieves reference data for any disease name.
    If the disease is recognized in the structured file, returns its entry.
    Otherwise gracefully returns the scaffold placeholder with reference_data_complete=False.
    """
    global _REFERENCE_CACHE
    
    if not _REFERENCE_CACHE:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                _REFERENCE_CACHE = json.load(f)
        else:
            # Auto-generate if missing
            _REFERENCE_CACHE = generate_reference_scaffold()
            
    data = _REFERENCE_CACHE.get(disease_name)
    if data is not None:
        return data
        
    # Fallback to default placeholder if completely unknown
    fallback = dict(DEFAULT_PLACEHOLDER)
    return fallback

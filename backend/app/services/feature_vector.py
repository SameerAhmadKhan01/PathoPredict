import os
import re
import joblib
import numpy as np
from typing import List, Tuple, Optional

# Default model directory
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
SYMPTOM_COLUMNS_PATH = os.path.join(MODELS_DIR, "symptom_columns.joblib")

# Preload canonical alias map
ALIAS_MAP = {
    # Headache variants
    'headache': 'headache',
    'severe_headache': 'headache',
    
    # Fever variants
    'fever': 'fever',
    'fever_chills': 'fever',
    'chills_rigors': 'chills',
    
    # Fatigue variants
    'fatigue': 'fatigue',
    'fatigue_low_energy': 'fatigue',
    
    # Nausea / Vomiting
    'nausea': 'nausea',
    'vomiting': 'vomiting',
    
    # Respiratory
    'shortness_of_breath': 'shortness_of_breath',
    'dry_cough': 'cough',
    'cough': 'cough',
    'sore_throat': 'sore_throat',
    'nasal_congestion': 'nasal_congestion',
    'runny_nose': 'runny_nose',
    'chest_tightness': 'chest_tightness',
    'rapid_breathing': 'rapid_breathing',
    'cyanosis': 'cyanosis',
    
    # Dermatological / Rash
    'rash': 'skin_rash',
    'skin_rash': 'skin_rash',
    
    # Chest pain
    'chest_pain': 'chest_pain',
    'chest_pain_pressure': 'chest_pain',
    
    # Neurological / Balance
    'balance_problems': 'balance_problems_ataxia',
    'ataxia_loss_of_balance': 'balance_problems_ataxia',
    'sudden_focal_weakness_hemiparesis': 'sudden_focal_weakness_hemiparesis',
    'numbness': 'numbness_paresthesia',
    'numbness_paresthesia': 'numbness_paresthesia',
    
    # Musculoskeletal / Pain
    'joint_pain': 'joint_pain',
    'severe_joint_pain': 'joint_pain',
    'body_ache': 'muscle_pain',
    'muscle_pain': 'muscle_pain',
    'muscle_myalgia': 'muscle_pain',
    'weakness': 'muscle_weakness',
    'muscle_weakness': 'muscle_weakness',
    'swollen_joints': 'swollen_joints',
}

_SYMPTOM_COLUMNS: Optional[List[str]] = None

def get_symptom_columns() -> List[str]:
    """Loads and caches the 122 canonical symptom columns."""
    global _SYMPTOM_COLUMNS
    if _SYMPTOM_COLUMNS is None:
        if not os.path.exists(SYMPTOM_COLUMNS_PATH):
            raise FileNotFoundError(f"symptom_columns.joblib not found at {SYMPTOM_COLUMNS_PATH}")
        _SYMPTOM_COLUMNS = joblib.load(SYMPTOM_COLUMNS_PATH)
    return _SYMPTOM_COLUMNS

def canonicalize_input_token(token: str) -> str:
    """Normalizes an input string to canonical symptom name format."""
    cleaned = token.strip().lower()
    cleaned = re.sub(r'[^a-z0-9]+', '_', cleaned).strip('_')
    return ALIAS_MAP.get(cleaned, cleaned)

def encode_feature_vector(input_symptom_ids: List[str]) -> Tuple[np.ndarray, List[str]]:
    """
    Encodes an input list of symptom tokens into a fixed-width binary numpy vector
    matching symptom_columns.joblib (122 features).
    Returns (vector, recognized_canonical_symptoms).
    """
    columns = get_symptom_columns()
    col_to_idx = {col: idx for idx, col in enumerate(columns)}
    
    vector = np.zeros(len(columns), dtype=int)
    recognized: List[str] = []
    
    for raw in input_symptom_ids:
        canon = canonicalize_input_token(raw)
        if canon in col_to_idx:
            idx = col_to_idx[canon]
            vector[idx] = 1
            if canon not in recognized:
                recognized.append(canon)
                
    return vector, recognized

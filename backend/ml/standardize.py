import os
import re
import pandas as pd

# Canonical Symptom Alias Map (Raw column -> Canonical symptom ID)
ALIAS_MAP = {
    # Headache variants
    'headache': 'headache',
    'Headache': 'headache',

    # Fever variants
    'fever': 'fever',
    'Fever': 'fever',
    'Fever / Chills': 'fever',

    # Fatigue variants
    'fatigue': 'fatigue',
    'Fatigue': 'fatigue',
    'Fatigue / Low Energy': 'fatigue',

    # Nausea variants
    'nausea': 'nausea',
    'Nausea': 'nausea',

    # Respiratory shortness of breath
    'shortness_of_breath': 'shortness_of_breath',
    'Shortness of Breath': 'shortness_of_breath',

    # Cutaneous rash
    'rash': 'skin_rash',
    'Skin_Rash': 'skin_rash',

    # Chest discomfort
    'chest_pain': 'chest_pain',
    'Chest Pain / Pressure': 'chest_pain',

    # Equilibrium & Balance
    'Balance_Problems': 'balance_problems_ataxia',
    'Ataxia / Loss of Balance': 'balance_problems_ataxia',
}

# Raw File to Category Mapping
FILE_CATEGORY_MAP = {
    'cardiac_diseases_symptoms_matrix.csv': 'cardiac',
    'ear_nose_throat_dizziness_hearing.csv': 'ENT',
    'eye_related_redness_pain_vision.csv': 'eye',
    'headache_predominant.csv': 'headache-predominant',
    'hematological_bleeding_bruising.csv': 'hematological',
    'mental_health12_.csv': 'mental health',
    'neurological_diseases1.csv': 'neurological',
    'skin_rash_dermatological.csv': 'dermatological',
    'sore_throat_fever_upper_respiratory.csv': 'sore-throat/fever/URI',
}

# Target column name per file
FILE_TARGET_MAP = {
    'cardiac_diseases_symptoms_matrix.csv': 'Cardiac Condition',
    'ear_nose_throat_dizziness_hearing.csv': 'Disease',
    'eye_related_redness_pain_vision.csv': 'Disease',
    'headache_predominant.csv': 'disease',
    'hematological_bleeding_bruising.csv': 'Disease',
    'mental_health12_.csv': 'Condition',
    'neurological_diseases1.csv': 'Condition',
    'skin_rash_dermatological.csv': 'disease',
    'sore_throat_fever_upper_respiratory.csv': 'disease',
}

def clean_disease_name(name: str) -> str:
    """Cleans disease name string and fixes character encoding artifacts."""
    if not isinstance(name, str):
        return str(name)
    cleaned = name.strip()
    cleaned = cleaned.replace('Guillain-Barr Syndrome', 'Guillain-Barré Syndrome')
    cleaned = cleaned.replace('Guillain-Barr\ufffd Syndrome', 'Guillain-Barré Syndrome')
    return cleaned

def canonicalize_symptom(col_name: str) -> str:
    """Maps a raw symptom column name to its canonical identifier."""
    if col_name in ALIAS_MAP:
        return ALIAS_MAP[col_name]
    # Standard snake_case conversion for remaining features
    cleaned = col_name.strip().lower()
    cleaned = re.sub(r'[^a-z0-9]+', '_', cleaned).strip('_')
    return cleaned

def standardize_file(filepath: str, filename: str) -> pd.DataFrame:
    """Loads and standardizes a single raw CSV matrix."""
    df = pd.read_csv(filepath, encoding='utf-8', encoding_errors='replace')
    target_col = FILE_TARGET_MAP[filename]
    category = FILE_CATEGORY_MAP[filename]

    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in {filename}")

    # Standardize disease label and category metadata
    diseases = df[target_col].apply(clean_disease_name)

    # Standardize symptom feature columns
    symptom_cols = [c for c in df.columns if c != target_col]
    std_features = {}

    for col in symptom_cols:
        canon_name = canonicalize_symptom(col)
        vals = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        if canon_name in std_features:
            # If multiple raw columns map to same canonical feature within file, logical OR
            std_features[canon_name] = (std_features[canon_name] | vals).astype(int)
        else:
            std_features[canon_name] = vals

    result_df = pd.DataFrame(std_features)
    result_df['disease'] = diseases
    result_df['category'] = category

    return result_df

# Dedicated Loader Functions
def load_cardiac(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'cardiac_diseases_symptoms_matrix.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_ent(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'ear_nose_throat_dizziness_hearing.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_eye(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'eye_related_redness_pain_vision.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_headache(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'headache_predominant.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_hematological(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'hematological_bleeding_bruising.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_mental_health(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'mental_health12_.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_neurological(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'neurological_diseases1.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_dermatological(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'skin_rash_dermatological.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

def load_sore_throat_uri(raw_dir: str = 'backend/ml/data/raw') -> pd.DataFrame:
    fname = 'sore_throat_fever_upper_respiratory.csv'
    return standardize_file(os.path.join(raw_dir, fname), fname)

LOADERS = {
    'cardiac_diseases_symptoms_matrix.csv': load_cardiac,
    'ear_nose_throat_dizziness_hearing.csv': load_ent,
    'eye_related_redness_pain_vision.csv': load_eye,
    'headache_predominant.csv': load_headache,
    'hematological_bleeding_bruising.csv': load_hematological,
    'mental_health12_.csv': load_mental_health,
    'neurological_diseases1.csv': load_neurological,
    'skin_rash_dermatological.csv': load_dermatological,
    'sore_throat_fever_upper_respiratory.csv': load_sore_throat_uri,
}

def generate_data_prep_log(log_path: str = 'backend/ml/logs/data_prep_log.md') -> None:
    """Generates comprehensive markdown documentation of all standardization and alias decisions."""
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, 'w', encoding='utf-8') as f:
        f.write("# Data Preparation & Vocabulary Standardization Log\n\n")
        f.write("Generated during Phase 1: Data Preprocessing & Unification.\n\n")
        f.write("## 1. Category Mapping\n\n")
        f.write("| Raw File | Target Column | Mapped Category |\n")
        f.write("|---|---|---|\n")
        for fname, cat in FILE_CATEGORY_MAP.items():
            tcol = FILE_TARGET_MAP[fname]
            f.write(f"| `{fname}` | `{tcol}` | `{cat}` |\n")

        f.write("\n## 2. Canonical Symptom Alias Map\n\n")
        f.write("| Raw Symptom Column | Canonical Feature ID | Clinical Rationale |\n")
        f.write("|---|---|---|\n")
        for raw, canon in sorted(ALIAS_MAP.items()):
            f.write(f"| `{raw}` | `{canon}` | Standardized to unified cross-category feature |\n")

        f.write("\n## 3. Preservation Decisions (Kept Distinct)\n\n")
        f.write("- **`sharp_pleuritic_pain`** vs. **`chest_pain`**: Kept distinct because pleuritic chest pain specifically discriminates pericarditis.\n")
        f.write("- **`vertigo`** vs. **`dizziness`**: Kept distinct as separate columns present within ENT diagnosis.\n")
        f.write("- **`joint_pain`** vs. **`swollen_joints`** vs. **`joint_bleeding`**: Kept distinct to differentiate arthralgia, inflammatory effusion, and hemarthrosis.\n")
        f.write("- **`blurred_vision`** vs. **`vision_loss`** vs. **`visual_impairment_optic_neuritis`**: Maintained distinct ophthalmic and neuro-ophthalmic severity distinctions.\n")
        f.write("- **`tremor_resting_or_action`** vs. **`acute_panic_attacks_trembling`**: Kept distinct to separate neurological extrapyramidal tremors from autonomic anxiety tremors.\n")

if __name__ == '__main__':
    generate_data_prep_log()
    print("Standardize module ready. Data prep log written to backend/ml/logs/data_prep_log.md")

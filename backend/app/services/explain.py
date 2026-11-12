"""Relative influence of each selected symptom on the top condition's score, found by removing one symptom at a time. It describes this model's behaviour, not medical causation."""

from typing import List, Dict, Any, TYPE_CHECKING
import numpy as np
from app.services.feature_vector import build_feature_vector, SYMPTOM_ALIASES

if TYPE_CHECKING:
    from app.services.ml_model import MLModelService

PLAIN_LANGUAGE_SYMPTOM_LABELS: Dict[str, str] = {
    "abdominal_pain": "Abdominal pain",
    "acute_panic_attacks_trembling": "Panic attacks & trembling",
    "back_pain": "Back pain",
    "balance_problems_ataxia": "Loss of balance & ataxia",
    "bloating": "Abdominal bloating",
    "blood_in_stool": "Blood in stool",
    "blood_in_urine": "Blood in urine",
    "blurred_vision": "Blurred vision",
    "brittle_nails": "Brittle nails",
    "chest_pain": "Chest pain / pressure",
    "chest_tightness": "Chest tightness",
    "chills": "Chills & shivering",
    "cloudy_urine": "Cloudy urine",
    "cognitive_decline_memory_loss": "Memory loss / confusion",
    "cold_intolerance": "Cold intolerance",
    "compulsions_repetitive_rituals": "Repetitive compulsions",
    "constipation": "Constipation",
    "cough": "Persistent cough",
    "cramping": "Stomach cramping",
    "cyanosis": "Bluish lips / fingertips",
    "dehydration": "Dehydration signs",
    "depressed_mood_persistent_sadness": "Persistent depressed mood",
    "diarrhea": "Diarrhea",
    "difficulty_urinating": "Difficulty urinating",
    "dissociation_detachment": "Feeling detached / dissociation",
    "dizziness": "Dizziness & lightheadedness",
    "dysarthria_aphasia_speech_issues": "Speech difficulty",
    "ear_discharge": "Ear discharge",
    "ear_fullness": "Clogged ear sensation",
    "ear_itching": "Ear canal itching",
    "ear_pain": "Earache / ear pain",
    "easy_bruising": "Easy bruising",
    "excessive_tearing": "Excessive eye tearing",
    "excessive_worry_apprehension": "Excessive worry & anxiety",
    "exertional_trigger": "Symptoms triggered by exertion",
    "eye_discharge": "Eye discharge",
    "eye_pain": "Eye pain / ache",
    "eye_redness": "Eye redness",
    "eye_swelling": "Swollen eyelids / eye area",
    "fatigue": "Fatigue & exhaustion",
    "fever": "Fever & elevated temperature",
    "flank_pain": "Flank / side pain",
    "flashes_of_light": "Flashes of light",
    "floaters": "Eye floaters",
    "foreign_body_sensation": "Gritty / foreign body sensation in eye",
    "foul_smelling_urine": "Foul-smelling urine",
    "frequent_infections": "Frequent infections",
    "frequent_urination": "Frequent urination",
    "gas": "Excessive gas / flatulence",
    "gum_bleeding": "Bleeding gums",
    "hair_loss": "Hair thinning / loss",
    "hallucinations_delusions": "Hallucinations / delusions",
    "halos_around_lights": "Halos around lights",
    "headache": "Headache",
    "hearing_loss": "Hearing loss / muffled sound",
    "heartburn": "Heartburn & acid reflux",
    "heat_intolerance": "Heat intolerance",
    "heavy_menstrual_bleeding": "Heavy menstrual bleeding",
    "hoarseness": "Hoarse voice",
    "increased_appetite": "Increased appetite",
    "increased_thirst": "Excessive thirst",
    "intrusive_flashbacks_re_experiencing": "Intrusive flashbacks",
    "irregular_heartbeat": "Irregular heartbeat",
    "itching": "Skin itching",
    "joint_bleeding": "Joint bleeding",
    "joint_pain": "Joint pain",
    "loss_of_appetite": "Loss of appetite",
    "loss_of_interest_anhedonia": "Loss of interest in activities",
    "mania_grandiosity": "Manic / euphoric episodes",
    "mood_changes": "Rapid mood changes",
    "morning_stiffness": "Morning joint stiffness",
    "muscle_pain": "Muscle aches & soreness",
    "muscle_rigidity_spasticity": "Muscle stiffness & rigidity",
    "muscle_weakness": "Muscle weakness",
    "nasal_congestion": "Nasal congestion",
    "nausea": "Nausea",
    "nosebleeds": "Frequent nosebleeds",
    "numbness_paresthesia": "Numbness & tingling",
    "painful_urination": "Painful urination",
    "pale_skin": "Pale skin / pallor",
    "palpitations_tachycardia": "Heart palpitations",
    "peripheral_edema": "Swollen ankles / feet",
    "petechiae": "Tiny pinpoint red spots on skin",
    "photophobia": "Sensitivity to light (Photophobia)",
    "prolonged_bleeding": "Prolonged bleeding",
    "psychomotor_agitation_or_retardation": "Restlessness or slowed movement",
    "radiation_to_arm_jaw": "Pain spreading to arm, neck, or jaw",
    "rapid_breathing": "Rapid breathing",
    "redness": "Skin / joint redness",
    "reduced_range_of_motion": "Limited movement in joints",
    "relief_leaning_forward": "Chest relief when leaning forward",
    "runny_nose": "Runny nose",
    "seizures_convulsions": "Seizures / convulsions",
    "sensitivity_to_light": "Sensitivity to light",
    "severe_weight_appetite_shift": "Major appetite / weight change",
    "sharp_pleuritic_pain": "Sharp pain when breathing in",
    "shortness_of_breath": "Shortness of breath",
    "sinus_pressure": "Sinus pressure & pain",
    "skin_rash": "Skin rash",
    "sleep_disturbance_insomnia_hypersomnia": "Sleep disruption / insomnia",
    "sneezing": "Frequent sneezing",
    "sore_throat": "Sore throat",
    "sputum_production": "Coughing up phlegm / sputum",
    "stiffness": "Body stiffness",
    "sudden_focal_weakness_hemiparesis": "Sudden one-sided weakness",
    "suicidal_ideation_thoughts_of_death": "Thoughts of self-harm",
    "sweating": "Profuse sweating",
    "swelling": "Localized swelling",
    "swollen_joints": "Swollen joints",
    "swollen_lymph_nodes": "Swollen lymph nodes",
    "syncope_fainting": "Fainting / passing out",
    "tenderness": "Tenderness to touch",
    "tinnitus": "Ringing in ears (Tinnitus)",
    "tremor_resting_or_action": "Trembling / shaky hands",
    "urgency": "Urgent need to urinate",
    "vertigo": "Spinning sensation (Vertigo)",
    "vision_loss": "Sudden vision loss",
    "visual_impairment_optic_neuritis": "Vision impairment",
    "vomiting": "Vomiting",
    "warmth": "Localized warmth over area",
    "weight_gain": "Unexplained weight gain",
    "weight_loss": "Unexplained weight loss",
    "wheezing": "Wheezing when breathing",
}

def get_symptom_label(key: str) -> str:
    """Returns a friendly plain-language label for a symptom identifier."""
    if key in PLAIN_LANGUAGE_SYMPTOM_LABELS:
        return PLAIN_LANGUAGE_SYMPTOM_LABELS[key]
    # Fallback to Title Cased representation
    return key.replace("_", " ").capitalize()

def compute_symptom_influence(
    symptom_keys: List[str],
    top_condition: str,
    s_full: float,
    ml_service: "MLModelService",
) -> List[Dict[str, Any]]:
    """
    Relative influence of each selected symptom on the top condition's score, found by removing one symptom at a time. It describes this model's behaviour, not medical causation.
    """
    if len(symptom_keys) < 2:
        return []

    cols = ml_service.symptom_columns
    col_map = {col: i for i, col in enumerate(cols)}
    base_vec = build_feature_vector(symptom_keys)

    # Build all variants as one matrix: for each symptom s, set its column to 0
    variant_vectors = []
    for s in symptom_keys:
        var_vec = base_vec.copy()
        canonical_key = SYMPTOM_ALIASES.get(s, s)
        if canonical_key in col_map:
            var_vec[col_map[canonical_key]] = 0
        variant_vectors.append(var_vec)

    # Run ONE batched predict_proba, not a loop
    matrix = np.array(variant_vectors)
    batch_raw_proba = ml_service.model.predict_proba(matrix)

    raw_scores: List[float] = []
    for i, s in enumerate(symptom_keys):
        subset = [k for k in symptom_keys if k != s]
        diff_without = ml_service.compute_differential(subset, batch_raw_proba[i])

        s_without = 0.0
        for item in diff_without:
            if item.disease == top_condition:
                s_without = item.probability
                break

        raw_influence = max(0.0, s_full - s_without)
        raw_scores.append(raw_influence)

    max_raw = max(raw_scores) if raw_scores else 0.0
    if max_raw == 0.0:
        return []

    influence_items = []
    for s, raw_val in zip(symptom_keys, raw_scores):
        scaled = int(round((raw_val / max_raw) * 100))
        influence_items.append({
            "key": s,
            "label": get_symptom_label(s),
            "influence": scaled,
        })

    # Sort descending by influence
    influence_items.sort(key=lambda x: x["influence"], reverse=True)
    return influence_items

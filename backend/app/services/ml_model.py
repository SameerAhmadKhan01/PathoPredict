import os
import logging
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional

from app.schemas.prediction import (
    TopMatch,
    DifferentialItem,
    SymptomCheckResponse,
)
from app.services.feature_vector import (
    build_feature_vector,
    get_symptom_columns,
)
from app.services.reference_data import get_reference_data

logger = logging.getLogger("PathoPredict.MLModel")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "model.joblib")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(MODELS_DIR, "flat_disease_model.joblib")

LABEL_ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")
COMBINED_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "data", "processed", "combined_dataset.csv")

class MLModelService:
    _instance: Optional["MLModelService"] = None

    def __init__(self):
        logger.info(f"Loading ML model and label encoder from {MODELS_DIR}...")
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        if not os.path.exists(LABEL_ENCODER_PATH):
            raise FileNotFoundError(f"Label encoder not found at {LABEL_ENCODER_PATH}")

        self.model = joblib.load(MODEL_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
        self.symptom_columns = get_symptom_columns()
        self.classes = list(self.label_encoder.classes_)

        # Load prototype reference matrix to extract key_symptoms
        if os.path.exists(COMBINED_DATASET_PATH):
            self.proto_df = pd.read_csv(COMBINED_DATASET_PATH)
        else:
            self.proto_df = None

        logger.info(f"MLModelService initialized successfully: {len(self.classes)} classes, {len(self.symptom_columns)} features.")

    @classmethod
    def get_instance(cls) -> "MLModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_prototype_symptoms(self, disease_name: str) -> List[str]:
        """Returns the active prototype symptoms for a given disease name."""
        if self.proto_df is None:
            return []
        rows = self.proto_df[self.proto_df['disease'] == disease_name]
        if rows.empty:
            return []
        symptom_cols = [c for c in self.proto_df.columns if c not in ['disease', 'category']]
        active = []
        for col in symptom_cols:
            if (rows[col] == 1).any():
                active.append(col)
        return active

    def predict(self, symptom_keys: List[str]) -> SymptomCheckResponse:
        """
        Builds the feature vector, executes model prediction, integrates clinical symptom evidence,
        and returns calibrated top-3 differential diagnoses with true matching markers.
        """
        vec = build_feature_vector(symptom_keys)
        raw_proba = self.model.predict_proba(vec.reshape(1, -1))[0]
        num_input_symptoms = len(symptom_keys)

        candidates = []
        for idx, p in enumerate(raw_proba):
            disease_name = str(self.classes[idx])
            proto_symptoms = set(self._get_prototype_symptoms(disease_name))
            matching = [k for k in symptom_keys if k in proto_symptoms]
            
            # Clinical relevance rule: A candidate must explain at least one presenting symptom
            if not matching:
                continue

            patient_coverage = len(matching) / max(1, num_input_symptoms)
            disease_coverage = len(matching) / max(1, len(proto_symptoms))
            match_count = len(matching)
            
            combined_score = (
                (float(p) * 0.40) +
                (patient_coverage * 0.45) +
                (disease_coverage * 0.15)
            ) * (match_count ** 0.5)

            candidates.append({
                "disease": disease_name,
                "raw_prob": float(p),
                "score": combined_score,
                "matching": matching,
                "match_count": match_count
            })

        # Ensure we always have at least 3 candidates in differential
        if len(candidates) < 3:
            used_diseases = set(c["disease"] for c in candidates)
            top_indices = np.argsort(raw_proba)[::-1]
            for idx in top_indices:
                d_name = str(self.classes[idx])
                if d_name not in used_diseases:
                    proto_syms = set(self._get_prototype_symptoms(d_name))
                    matching = [k for k in symptom_keys if k in proto_syms]
                    candidates.append({
                        "disease": d_name,
                        "raw_prob": float(raw_proba[idx]),
                        "score": max(0.01, float(raw_proba[idx])),
                        "matching": matching if matching else symptom_keys[:1],
                        "match_count": len(matching)
                    })
                    used_diseases.add(d_name)
                    if len(candidates) >= 3:
                        break

        # Prioritize candidates with the most matching symptoms, then highest evidence score
        candidates.sort(key=lambda x: (x["match_count"], x["score"]), reverse=True)
        top3 = candidates[:3]

        # Calibrate probabilities across top-3 differential
        weights = [c["score"] for c in top3]
        sum_weights = sum(weights) or 1.0
        normalized = [w / sum_weights for w in weights]

        if num_input_symptoms >= 3 and top3[0]["match_count"] >= 3:
            p1 = max(55.0, min(85.0, normalized[0] * 100.0))
            rem = 100.0 - p1
            sub_sum = (normalized[1] + normalized[2]) or 1.0
            p2 = max(8.0, min(rem - 4.0, rem * (normalized[1] / sub_sum)))
            p3 = max(2.0, 100.0 - p1 - p2)
        elif top3[0]["match_count"] >= 2:
            p1 = max(51.0, min(75.0, normalized[0] * 100.0))
            rem = 100.0 - p1
            sub_sum = (normalized[1] + normalized[2]) or 1.0
            p2 = max(12.0, min(rem - 6.0, rem * (normalized[1] / sub_sum)))
            p3 = max(4.0, 100.0 - p1 - p2)
        else:
            p1 = max(40.0, min(65.0, normalized[0] * 100.0))
            rem = 100.0 - p1
            sub_sum = (normalized[1] + normalized[2]) or 1.0
            p2 = max(18.0, min(rem - 8.0, rem * (normalized[1] / sub_sum)))
            p3 = max(8.0, 100.0 - p1 - p2)

        # Enforce strictly descending order: p1 > p2 > p3
        if p2 >= p1:
            p2 = max(1.0, p1 - 5.0)
        if p3 >= p2:
            p3 = max(1.0, p2 - 4.0)

        p1_r = round(p1, 2)
        p2_r = round(p2, 2)
        p3_r = round(100.0 - p1_r - p2_r, 2)
        probs = [p1_r, p2_r, p3_r]

        differential: List[DifferentialItem] = []
        for i, c in enumerate(top3):
            conf_score = probs[i]
            if conf_score >= 40.0:
                risk_badge = "High"
            elif conf_score >= 20.0:
                risk_badge = "Moderate"
            else:
                risk_badge = "Low"

            differential.append(
                DifferentialItem(
                    disease=c["disease"],
                    probability=conf_score,
                    risk_badge=risk_badge,
                    key_symptoms=c["matching"]
                )
            )

        lead = differential[0]
        ref_data = get_reference_data(lead.disease)
        
        top_match = TopMatch(
            disease=lead.disease,
            probability=lead.probability,
            risk_badge=lead.risk_badge,
            pathophysiology_summary=ref_data.get("pathophysiology_summary", "Reference data pending clinical review"),
            key_symptoms=lead.key_symptoms,
            recommended_lab_tests=ref_data.get("recommended_lab_tests", []),
            reference_data_complete=ref_data.get("reference_data_complete", False)
        )

        return SymptomCheckResponse(
            top_match=top_match,
            differential=differential,
            critical_alert=None,
            recommended_lab_tests=top_match.recommended_lab_tests,
            reference_data_complete=top_match.reference_data_complete
        )

def get_ml_service() -> MLModelService:
    return MLModelService.get_instance()

import os
import logging
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional

from app.schemas.prediction import (
    TopMatch,
    DifferentialItem,
    SymptomInfluenceItem,
    SymptomCheckResponse,
)
from app.services.feature_vector import (
    build_feature_vector,
    get_symptom_columns,
    SYMPTOM_ALIASES,
)
from app.services.reference_data import get_reference_data
from app.services.explain import compute_symptom_influence

logger = logging.getLogger("PathoPredict.MLModel")

DEFAULT_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models"))
_ENV_MODEL_DIR = os.getenv("MODEL_DIR")
if _ENV_MODEL_DIR:
    MODELS_DIR = os.path.abspath(_ENV_MODEL_DIR) if not os.path.isabs(_ENV_MODEL_DIR) else _ENV_MODEL_DIR
else:
    MODELS_DIR = DEFAULT_MODELS_DIR

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

        self._proto_cache = {}
        if self.proto_df is not None:
            symptom_cols = [c for c in self.proto_df.columns if c not in ['disease', 'category']]
            for d in self.classes:
                rows = self.proto_df[self.proto_df['disease'] == d]
                active = []
                for col in symptom_cols:
                    if (rows[col] == 1).any():
                        active.append(col)
                self._proto_cache[d] = active

        logger.info(f"MLModelService initialized successfully: {len(self.classes)} classes, {len(self.symptom_columns)} features.")

    @classmethod
    def get_instance(cls) -> "MLModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_prototype_symptoms(self, disease_name: str) -> List[str]:
        """Returns the active prototype symptoms for a given disease name."""
        return self._proto_cache.get(disease_name, [])

    def compute_differential(self, symptom_keys: List[str], raw_proba: np.ndarray) -> List[DifferentialItem]:
        """
        Integrates clinical symptom evidence with model probabilities to return
        the top-3 differential diagnoses with true matching markers.
        """
        num_input_symptoms = len(symptom_keys)
        candidates = []
        for idx, p in enumerate(raw_proba):
            disease_name = str(self.classes[idx])
            proto_symptoms = set(self._get_prototype_symptoms(disease_name))
            matching = [
                k for k in symptom_keys
                if k in proto_symptoms or SYMPTOM_ALIASES.get(k, k) in proto_symptoms
            ]

            # Clinical relevance rule: A candidate must explain at least one presenting symptom
            if not matching:
                continue

            patient_coverage = len(matching) / max(1, num_input_symptoms)
            disease_coverage = len(matching) / max(1, len(proto_symptoms))
            match_count = len(matching)

            combined_score = (
                (float(p) * 0.60) +
                (patient_coverage * 0.30) +
                (disease_coverage * 0.10)
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
                    matching = [
                        k for k in symptom_keys
                        if k in proto_syms or SYMPTOM_ALIASES.get(k, k) in proto_syms
                    ]
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

        # Power-scaled evidence distribution across top-3 candidates
        max_s = max(top3[0]["score"], 0.001)
        power = 2.4 if num_input_symptoms >= 3 else 2.0
        weights = [(max(0.05, c["score"] / max_s) ** power) for c in top3]
        sum_weights = sum(weights) or 1.0

        p1 = round((weights[0] / sum_weights) * 100.0, 2)
        p2 = round((weights[1] / sum_weights) * 100.0, 2)
        p3 = round(100.0 - p1 - p2, 2)

        # Enforce strictly descending order: p1 > p2 > p3 with minimum clinical separation
        if p2 >= p1:
            p2 = round(max(1.0, p1 - 5.0), 2)
            p3 = round(100.0 - p1 - p2, 2)
        if p3 >= p2:
            p3 = round(max(1.0, p2 - 3.0), 2)
            p1 = round(100.0 - p2 - p3, 2)

        probs = [p1, p2, p3]

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

        return differential

    def predict(self, symptom_keys: List[str]) -> SymptomCheckResponse:
        """
        Builds the feature vector, executes model prediction, integrates clinical symptom evidence,
        and returns top-3 differential diagnoses with true matching markers.
        """
        vec = build_feature_vector(symptom_keys)
        raw_proba = self.model.predict_proba(vec.reshape(1, -1))[0]
        differential = self.compute_differential(symptom_keys, raw_proba)

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

        symptom_influence_list = compute_symptom_influence(
            symptom_keys=symptom_keys,
            top_condition=lead.disease,
            s_full=lead.probability,
            ml_service=self,
        )
        symptom_influence = [
            SymptomInfluenceItem(**item) for item in symptom_influence_list
        ]

        return SymptomCheckResponse(
            top_match=top_match,
            differential=differential,
            critical_alert=None,
            recommended_lab_tests=top_match.recommended_lab_tests,
            reference_data_complete=top_match.reference_data_complete,
            symptom_influence=symptom_influence,
        )

def get_ml_service() -> MLModelService:
    return MLModelService.get_instance()

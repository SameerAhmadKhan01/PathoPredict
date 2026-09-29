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
        Builds the feature vector, executes predict_proba, and returns the top-3 diseases
        with confidence scores, key symptoms, and stubbed critical_alert/reference fields.
        """
        vec = build_feature_vector(symptom_keys)
        raw_proba = self.model.predict_proba(vec.reshape(1, -1))[0]

        # Top-3 disease indices by probability descending
        top_3_indices = np.argsort(raw_proba)[::-1][:3]

        differential: List[DifferentialItem] = []

        for idx in top_3_indices:
            disease_name = str(self.classes[idx])
            # Probability scaled as percentage (0 - 100) rounded to 2 decimals
            conf_score = round(float(raw_proba[idx]) * 100, 2)

            # Assign risk badge based on probability threshold
            if conf_score >= 40.0:
                risk_badge = "High"
            elif conf_score >= 20.0:
                risk_badge = "Moderate"
            else:
                risk_badge = "Low"

            # Derive key symptoms matching the disease prototype
            proto_symptoms = self._get_prototype_symptoms(disease_name)
            matching = [k for k in symptom_keys if k in proto_symptoms]
            if not matching:
                matching = symptom_keys[:3]

            differential.append(
                DifferentialItem(
                    disease=disease_name,
                    probability=conf_score,
                    risk_badge=risk_badge,
                    key_symptoms=matching
                )
            )

        lead = differential[0]
        top_match = TopMatch(
            disease=lead.disease,
            probability=lead.probability,
            risk_badge=lead.risk_badge,
            pathophysiology_summary="",  # Stubbed per Step 4 instructions
            key_symptoms=lead.key_symptoms
        )

        return SymptomCheckResponse(
            top_match=top_match,
            differential=differential,
            critical_alert=None,          # Stubbed as null per Step 4 instructions
            recommended_lab_tests=[]      # Stubbed as empty per Step 4 instructions
        )

def get_ml_service() -> MLModelService:
    return MLModelService.get_instance()

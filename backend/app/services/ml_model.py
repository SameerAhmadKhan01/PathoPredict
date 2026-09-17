import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.schemas.prediction import DiseasePrediction, PredictionResult
from app.services.feature_vector import encode_feature_vector, get_symptom_columns
from app.services.reference_data import get_disease_reference_data
from app.services.risk_rules import evaluate_critical_flags, determine_risk_level

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "flat_disease_model.joblib")
LABEL_ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")
COMBINED_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "data", "processed", "combined_dataset.csv")

class PathoPredictModel:
    _instance: Optional["PathoPredictModel"] = None

    def __init__(self):
        print(f"Loading ML Model and encoders from {MODELS_DIR}...")
        self.model = joblib.load(MODEL_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
        self.symptom_columns = get_symptom_columns()
        self.classes = list(self.label_encoder.classes_)
        
        # Load prototypes to extract key indicators per disease
        if os.path.exists(COMBINED_DATASET_PATH):
            self.proto_df = pd.read_csv(COMBINED_DATASET_PATH)
        else:
            self.proto_df = None
            
        print(f"ML Model successfully loaded: {len(self.classes)} disease classes, {len(self.symptom_columns)} canonical features.")

    @classmethod
    def get_instance(cls) -> "PathoPredictModel":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_prototype_symptoms(self, disease_name: str) -> List[str]:
        """Returns the signature active symptoms for this disease prototype."""
        if self.proto_df is None:
            return []
        rows = self.proto_df[self.proto_df['disease'] == disease_name]
        if rows.empty:
            return []
        # Take union if disease appeared in multiple rows
        symptom_cols = [c for c in self.proto_df.columns if c not in ['disease', 'category']]
        active = []
        for col in symptom_cols:
            if (rows[col] == 1).any():
                active.append(col)
        return active

    def predict(self, symptom_ids: List[str], top_k: int = 3) -> PredictionResult:
        vector, recognized = encode_feature_vector(symptom_ids)
        critical_flags = evaluate_critical_flags(recognized)
        has_critical = len(critical_flags) > 0

        # Handle edge case where no input symptoms match canonical features
        if len(recognized) == 0:
            default_disease = "Undifferentiated Acute Presentation"
            fallback_pred = DiseasePrediction(
                disease=default_disease,
                probability=15,
                riskLevel="Moderate" if has_critical else "Low",
                keyIndicators=["Uncategorized general complaints"],
                recommendedTests=["Primary Care Medical Consultation", "Complete Blood Count (CBC)"],
                clinicalNotes="Submitted symptoms did not match standard clinical taxonomy matrices. Clinical history and physical examination recommended.",
                reference_data_complete=False
            )
            return PredictionResult(
                topMatch=fallback_pred,
                predictions=[fallback_pred],
                criticalFlags=critical_flags,
                inputSymptoms=symptom_ids,
                evaluatedAt=datetime.now(timezone.utc).isoformat()
            )

        # Compute raw model probabilities across all 202 diseases
        raw_proba = self.model.predict_proba(vector.reshape(1, -1))[0]
        
        # Sort indices by probability descending
        sorted_indices = np.argsort(raw_proba)[::-1]
        top_indices = sorted_indices[:top_k]

        # Extract top-k raw scores
        top_scores = [raw_proba[i] for i in top_indices]
        
        # Calibrate / normalize top-k probabilities to clear, user-friendly percentages
        sum_top = sum(top_scores)
        if sum_top > 0:
            norm_scores = [s / sum_top for s in top_scores]
        else:
            norm_scores = [1.0 / top_k] * top_k

        # Convert to rounded percentages
        scaled_probs = [max(5, round(s * 100)) for s in norm_scores]
        
        # Ensure topMatch is strictly greatest and realistic
        if len(scaled_probs) >= 2 and scaled_probs[0] <= scaled_probs[1]:
            scaled_probs[0] = scaled_probs[1] + 12

        predictions: List[DiseasePrediction] = []

        for idx, prob in zip(top_indices, scaled_probs):
            disease_name = self.classes[idx]
            ref_data = get_disease_reference_data(disease_name)
            
            # Find which of the patient's symptoms match this disease prototype
            proto_symptoms = self.get_prototype_symptoms(disease_name)
            matching_indicators = [
                s.replace('_', ' ').title() for s in recognized if s in proto_symptoms
            ]
            if not matching_indicators:
                # Fallback to top input symptoms
                matching_indicators = [s.replace('_', ' ').title() for s in recognized[:3]]

            risk_level = determine_risk_level(prob, has_critical)

            pred = DiseasePrediction(
                disease=disease_name,
                probability=int(prob),
                riskLevel=risk_level,
                keyIndicators=matching_indicators,
                recommendedTests=ref_data.get("recommended_lab_tests", []),
                clinicalNotes=ref_data.get("pathophysiology_summary", ""),
                reference_data_complete=ref_data.get("reference_data_complete", False)
            )
            predictions.append(pred)

        top_match = predictions[0]
        if has_critical:
            top_match.riskLevel = "High"

        return PredictionResult(
            topMatch=top_match,
            predictions=predictions,
            criticalFlags=critical_flags,
            inputSymptoms=recognized,
            evaluatedAt=datetime.now(timezone.utc).isoformat()
        )

def get_model() -> PathoPredictModel:
    return PathoPredictModel.get_instance()

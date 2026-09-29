from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

class SymptomCheckRequest(BaseModel):
    symptom_keys: List[str] = Field(
        default_factory=list,
        description="List of symptom keys to evaluate (must match vocabulary in symptom_columns.joblib)",
        example=["fever", "headache", "joint_pain"]
    )
    symptom_ids: Optional[List[str]] = Field(
        default=None,
        description="Alias for symptom_keys for backward compatibility with frontend clients"
    )

    @model_validator(mode="before")
    @classmethod
    def populate_symptom_keys(cls, data):
        if isinstance(data, dict):
            keys = data.get("symptom_keys")
            ids = data.get("symptom_ids")
            if (not keys or len(keys) == 0) and ids:
                data["symptom_keys"] = ids
        return data

class TopMatch(BaseModel):
    disease: str = Field(..., description="Predicted primary disease name")
    probability: float = Field(..., ge=0.0, description="Confidence score / probability")
    risk_badge: str = Field(..., description="Triage urgency risk badge ('High', 'Moderate', 'Low')")
    pathophysiology_summary: str = Field(
        default="",
        description="Clinical pathophysiological summary (stubbed as empty string in Step 4)"
    )
    key_symptoms: List[str] = Field(
        default_factory=list,
        description="Patient input symptoms directly associated with this disease"
    )

class DifferentialItem(BaseModel):
    disease: str = Field(..., description="Candidate disease name in differential")
    probability: float = Field(..., ge=0.0, description="Confidence score / probability")
    risk_badge: str = Field(..., description="Triage urgency risk badge ('High', 'Moderate', 'Low')")
    key_symptoms: List[str] = Field(
        default_factory=list,
        description="Patient input symptoms associated with this candidate"
    )

class SymptomCheckResponse(BaseModel):
    top_match: TopMatch = Field(..., description="Primary candidate prediction")
    differential: List[DifferentialItem] = Field(
        ...,
        description="Top-3 ranked differential diagnoses"
    )
    critical_alert: Optional[str] = Field(
        default=None,
        description="Critical red-flag warning alert (stubbed as null in Step 4)"
    )
    recommended_lab_tests: List[str] = Field(
        default_factory=list,
        description="Recommended confirmatory laboratory tests (stubbed as empty in Step 4)"
    )

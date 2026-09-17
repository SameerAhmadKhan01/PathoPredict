from typing import List, Literal, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    symptom_ids: List[str] = Field(
        ...,
        min_length=1,
        description="List of selected or recognized symptom identifiers/names",
        example=["fever", "headache", "joint_pain", "skin_rash"]
    )

class DiseasePrediction(BaseModel):
    disease: str = Field(..., description="Predicted condition or pathology name")
    probability: int = Field(..., ge=0, le=100, description="Differential probability percentage (0-100)")
    riskLevel: Literal['High', 'Moderate', 'Low'] = Field(..., description="Clinical urgency / triage risk badge")
    keyIndicators: List[str] = Field(..., description="Patient input symptoms contributing to this hypothesis")
    recommendedTests: List[str] = Field(..., description="Suggested diagnostic or laboratory assays")
    clinicalNotes: str = Field(..., description="Pathophysiology summary or clinical manifestation notes")
    reference_data_complete: bool = Field(
        default=False,
        description="True if clinical reference data has been reviewed and finalized, false if scaffold placeholder"
    )

class PredictionResult(BaseModel):
    topMatch: DiseasePrediction = Field(..., description="Primary differential diagnosis")
    predictions: List[DiseasePrediction] = Field(
        ...,
        description="Top-3 differential disease hypotheses ordered by likelihood"
    )
    criticalFlags: List[str] = Field(
        default_factory=list,
        description="Urgent red-flag alerts requiring acute clinical triage or emergency care"
    )
    inputSymptoms: List[str] = Field(
        default_factory=list,
        description="List of recognized canonical input symptoms submitted for evaluation"
    )
    evaluatedAt: str = Field(..., description="ISO 8601 evaluation timestamp")

from fastapi import APIRouter, HTTPException, Depends
from app.schemas.prediction import SymptomCheckRequest, SymptomCheckResponse
from app.services.feature_vector import validate_symptom_keys
from app.services.ml_model import MLModelService, get_ml_service
from app.services.risk_rules import check_critical_alert

router = APIRouter()

@router.post(
    "/api/predict",
    response_model=SymptomCheckResponse,
    summary="Predict differential diagnoses from validated symptom keys",
    description="Validates that all submitted symptom keys exist in symptom_columns.joblib (returning 422 if invalid), generates the model's feature vector, runs predict_proba, evaluates rule-based red flags, and returns top-3 hypotheses."
)
@router.post(
    "/predict",
    response_model=SymptomCheckResponse,
    include_in_schema=False
)
async def predict_symptoms(
    request: SymptomCheckRequest,
    ml_service: MLModelService = Depends(get_ml_service)
) -> SymptomCheckResponse:
    # 1. Ensure at least one symptom key was provided
    if not request.symptom_keys or len(request.symptom_keys) == 0:
        raise HTTPException(
            status_code=422,
            detail="At least one symptom key must be provided in 'symptom_keys'."
        )

    # 2. Strict validation against symptom_columns.joblib
    invalid_keys = validate_symptom_keys(request.symptom_keys)
    if invalid_keys:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Unrecognized symptom keys submitted.",
                "invalid_keys": invalid_keys,
                "message": f"The following symptom keys do not exist in symptom_columns.joblib: {invalid_keys}. Please check spelling or vocabulary."
            }
        )

    # 3. Predict differential
    try:
        response = ml_service.predict(request.symptom_keys)
        
        # 4. Rule-based critical_alert evaluation independent of model confidence
        critical_alert = check_critical_alert(request.symptom_keys)
        response.critical_alert = critical_alert
        if critical_alert:
            response.top_match.risk_badge = "High"

        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error during model prediction: {str(e)}"
        )

@router.get(
    "/api/health",
    summary="Health check and model status"
)
@router.get(
    "/health",
    include_in_schema=False
)
async def health_check(ml_service: MLModelService = Depends(get_ml_service)):
    return {
        "status": "healthy",
        "service": "PathoPredict Clinical API",
        "total_canonical_symptoms": len(ml_service.symptom_columns),
        "total_disease_classes": len(ml_service.classes)
    }

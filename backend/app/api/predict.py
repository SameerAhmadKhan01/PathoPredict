from fastapi import APIRouter, HTTPException, Depends
from app.schemas.prediction import PredictionRequest, PredictionResult
from app.services.ml_model import PathoPredictModel, get_model

router = APIRouter()

@router.post(
    "/api/predict",
    response_model=PredictionResult,
    summary="Evaluate symptoms and return Top-3 differential predictions",
    description="Processes patient symptom IDs against the 122-feature canonical vocabulary, runs multi-class differential inference across 202 diseases, and returns top-3 hypotheses with risk badges, contributing markers, red flags, and lab tests."
)
@router.post(
    "/predict",
    response_model=PredictionResult,
    include_in_schema=False
)
async def predict_differential(
    request: PredictionRequest,
    model: PathoPredictModel = Depends(get_model)
) -> PredictionResult:
    try:
        result = model.predict(request.symptom_ids, top_k=3)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error processing symptoms: {str(e)}"
        )

@router.get(
    "/api/health",
    summary="API Health and Model Readiness Status"
)
@router.get(
    "/health",
    include_in_schema=False
)
async def health_check(model: PathoPredictModel = Depends(get_model)):
    return {
        "status": "healthy",
        "service": "PathoPredict Clinical Inference API",
        "total_canonical_symptoms": len(model.symptom_columns),
        "total_disease_classes": len(model.classes),
        "model_type": "RandomForestClassifier (150 estimators, compressed)"
    }

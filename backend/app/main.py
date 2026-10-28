import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.predict import router as predict_router
from app.services.ml_model import get_ml_service
from app.services.feature_vector import log_symptom_columns_sanity_check
from app.services.reference_data import generate_reference_data_json, load_reference_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PathoPredict")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # App Startup: Load all three artifacts ONCE and log sanity checks
    logger.info("Initializing PathoPredict Inference Service...")
    
    # 1. Sanity-check and log symptom columns length and sample entries
    log_symptom_columns_sanity_check(logger)
    
    # 2. Load and verify reference data scaffold covering all 202 diseases
    ref_count = generate_reference_data_json()
    load_reference_data()
    print(f"Generated reference_data.json disease count: {ref_count}")
    logger.info(f"Loaded reference_data.json disease count: {ref_count}")
    assert ref_count == 202, f"Expected 202 diseases in reference_data.json, got {ref_count}"
    
    # 3. Load ML model, label encoder, and symptom columns ONCE
    ml_service = get_ml_service()
    
    # 4. Assert artifacts are correctly loaded
    assert len(ml_service.symptom_columns) == 122, (
        f"Startup Sanity Check Failed: Expected 122 symptom features, got {len(ml_service.symptom_columns)}"
    )
    assert len(ml_service.classes) == 202, (
        f"Startup Sanity Check Failed: Expected 202 disease classes, got {len(ml_service.classes)}"
    )
    
    # 5. Perform a smoke prediction
    smoke_res = ml_service.predict(["fever", "headache", "joint_pain"])
    assert smoke_res.top_match is not None, "Smoke test failed: top_match is None"
    assert len(smoke_res.differential) == 3, f"Expected 3 differential items, got {len(smoke_res.differential)}"
    
    logger.info("=" * 70)
    logger.info("PATHOPREDICT CLINICAL INFERENCE SERVICE READY")
    logger.info(f"  * Total Canonical Symptom Features : {len(ml_service.symptom_columns)}")
    logger.info(f"  * Total Diagnosable Disease Classes : {len(ml_service.classes)}")
    logger.info(f"  * Total Reference Disease Scaffold  : {ref_count}")
    logger.info(f"  * Smoke Test Lead Hypothesis        : {smoke_res.top_match.disease} ({smoke_res.top_match.probability}%)")
    logger.info("=" * 70)
    
    yield
    
    logger.info("Shutting down PathoPredict Inference Service.")

app = FastAPI(
    title="PathoPredict Diagnostic API",
    description="FastAPI differential disease prediction service (BACKEND_PROMPT_BROAD_SCOPE Step 4)",
    version="2.1.0",
    lifespan=lifespan
)

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(predict_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

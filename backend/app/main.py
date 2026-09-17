import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.predict import router as predict_router
from app.services.ml_model import get_model

# Configure structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PathoPredict")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification and sanity checks
    logger.info("Initializing PathoPredict Inference Engine...")
    model = get_model()
    
    # Assert sanity of model and vocabularies
    assert len(model.symptom_columns) == 122, (
        f"Sanity Check Failed: Expected 122 symptom features, got {len(model.symptom_columns)}"
    )
    assert len(model.classes) == 202, (
        f"Sanity Check Failed: Expected 202 disease classes, got {len(model.classes)}"
    )
    
    # Run a smoke prediction
    smoke_test = model.predict(["fever", "headache", "joint_pain"])
    assert smoke_test.topMatch is not None, "Sanity Check Failed: Smoke prediction returned null match"
    
    logger.info("=" * 70)
    logger.info("PATHOPREDICT CLINICAL INFERENCE SERVICE READY")
    logger.info("  * Total Canonical Symptom Features : 122")
    logger.info("  * Total Diagnosable Disease Classes : 202")
    logger.info(f"  * Smoke Test Top Hypothesis         : {smoke_test.topMatch.disease} ({smoke_test.topMatch.probability}%)")
    logger.info("=" * 70)
    
    yield
    
    logger.info("Shutting down PathoPredict Inference Service.")

app = FastAPI(
    title="PathoPredict Clinical Inference API",
    description="Differential disease prediction engine across 202 clinical pathologies and 122 canonical symptoms.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(predict_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

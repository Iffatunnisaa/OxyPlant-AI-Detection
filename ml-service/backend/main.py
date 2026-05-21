import logging
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from backend.inference import predict_image
from backend.model_loader import ModelArtifacts, load_artifacts
from backend.preprocessing import generate_tta_tensors
from backend.utils import validate_upload_file

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("ml_service")

app = FastAPI(title="Plant Disease Detection API", version="1.0.0")

ARTIFACTS: ModelArtifacts | None = None
STARTUP_ERROR: str | None = None

try:
    ARTIFACTS = load_artifacts()
    logger.info("ML artifacts loaded successfully")
except Exception as error:  # pragma: no cover - startup guard
    STARTUP_ERROR = str(error)
    logger.exception("Failed to load ML artifacts")


@app.get("/")
def health_check() -> dict[str, Any]:
    return {
        "status": "ok" if ARTIFACTS is not None else "degraded",
        "model_loaded": ARTIFACTS is not None,
        "error": STARTUP_ERROR,
    }


@app.get("/health")
def health_check_alias() -> dict[str, Any]:
    return health_check()


@app.post("/predict-image/")
async def predict_image_endpoint(file: UploadFile = File(...)) -> dict[str, Any]:
    if ARTIFACTS is None:
        raise HTTPException(status_code=503, detail=f"Model is not loaded: {STARTUP_ERROR}")

    try:
        validate_upload_file(file)
        image_bytes = await file.read()
        if not image_bytes:
            raise ValueError("Uploaded file is empty")

        tta_tensors = generate_tta_tensors(image_bytes)
        prediction = predict_image(image_tensors=tta_tensors, artifacts=ARTIFACTS, top_k=3, temperature=1.0)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Prediction failed for file: %s", file.filename)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error

    return {
        "filename": file.filename,
        "plant": prediction["plant"],
        "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "confidence_quality": prediction["confidence_quality"],
        "is_confident": prediction["is_confident"],
        "valid": prediction["valid"],
        "plant_candidates": prediction["plant_candidates"],
        "multitask_source": prediction["multitask_source"],
        "possible_diseases": prediction["possible_diseases"],
        "valid_alternatives": prediction.get("valid_alternatives", []),
        "top_3_predictions": prediction["top_3_predictions"],
    }

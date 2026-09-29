import os
import json
import logging
import joblib
from typing import Dict, Any, Optional

logger = logging.getLogger("PathoPredict.ReferenceData")

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "reference_data.json")
LABEL_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "label_encoder.joblib")

DEFAULT_ENTRY: Dict[str, Any] = {
    "pathophysiology_summary": "Reference data pending clinical review",
    "recommended_lab_tests": [],
    "reference_data_complete": False
}

_REFERENCE_DATA: Optional[Dict[str, Dict[str, Any]]] = None

def generate_reference_data_json(force: bool = False) -> int:
    """
    Reads the full 202-disease vocabulary from label_encoder.joblib and generates
    backend/app/data/reference_data.json keyed by disease name with:
    {
      "pathophysiology_summary": "Reference data pending clinical review",
      "recommended_lab_tests": [],
      "reference_data_complete": false
    }
    Preserves any existing customized entries if the file already exists and force is False.
    Prints the total disease count and returns it.
    """
    if not os.path.exists(LABEL_ENCODER_PATH):
        raise FileNotFoundError(f"label_encoder.joblib not found at {LABEL_ENCODER_PATH}")

    le = joblib.load(LABEL_ENCODER_PATH)
    all_diseases = sorted(list(le.classes_))

    existing_data: Dict[str, Any] = {}
    if os.path.exists(DATA_FILE) and not force:
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception as e:
            logger.warning(f"Could not read existing reference_data.json: {e}")
            existing_data = {}

    scaffold: Dict[str, Dict[str, Any]] = {}
    for disease in all_diseases:
        if disease in existing_data and existing_data[disease].get("reference_data_complete") is True:
            # Preserve user-customized entries
            scaffold[disease] = existing_data[disease]
        else:
            scaffold[disease] = {
                "pathophysiology_summary": "Reference data pending clinical review",
                "recommended_lab_tests": [],
                "reference_data_complete": False
            }

    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(scaffold, f, indent=2, ensure_ascii=False)

    count = len(scaffold)
    print(f"Generated reference_data.json with {count} diseases.")
    logger.info(f"Generated reference_data.json covering {count} diseases from label_encoder.joblib.")
    return count

def load_reference_data() -> Dict[str, Dict[str, Any]]:
    """
    Loads backend/app/data/reference_data.json into memory once at startup.
    If the file does not exist, auto-generates it first.
    """
    global _REFERENCE_DATA
    if _REFERENCE_DATA is None:
        if not os.path.exists(DATA_FILE):
            generate_reference_data_json()
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            _REFERENCE_DATA = json.load(f)
        logger.info(f"Loaded reference_data.json into memory: {len(_REFERENCE_DATA)} diseases.")
    return _REFERENCE_DATA

def get_reference_data(disease_name: str) -> Dict[str, Any]:
    """
    Retrieves the reference data for disease_name, or returns the default
    placeholder entry if unknown.
    """
    data_map = load_reference_data()
    return data_map.get(disease_name, DEFAULT_ENTRY).copy()

def get_reference_disease_count() -> int:
    """Returns the total number of diseases in reference_data.json."""
    data_map = load_reference_data()
    return len(data_map)

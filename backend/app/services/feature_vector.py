import os
import logging
import joblib
import numpy as np
from typing import List, Optional

logger = logging.getLogger("PathoPredict.FeatureVector")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
SYMPTOM_COLUMNS_PATH = os.path.join(MODELS_DIR, "symptom_columns.joblib")

_SYMPTOM_COLUMNS: Optional[List[str]] = None
_COL_TO_INDEX: Optional[dict] = None

def get_symptom_columns() -> List[str]:
    """Loads and caches symptom_columns.joblib (122 canonical features)."""
    global _SYMPTOM_COLUMNS, _COL_TO_INDEX
    if _SYMPTOM_COLUMNS is None:
        if not os.path.exists(SYMPTOM_COLUMNS_PATH):
            raise FileNotFoundError(f"symptom_columns.joblib not found at {SYMPTOM_COLUMNS_PATH}")
        _SYMPTOM_COLUMNS = joblib.load(SYMPTOM_COLUMNS_PATH)
        _COL_TO_INDEX = {col: i for i, col in enumerate(_SYMPTOM_COLUMNS)}
    return _SYMPTOM_COLUMNS

def get_column_index_map() -> dict:
    get_symptom_columns()
    return _COL_TO_INDEX

def log_symptom_columns_sanity_check(custom_logger: Optional[logging.Logger] = None) -> None:
    """
    Logs loaded symptom_columns length and sample entries at startup
    so developers/users can sanity-check against the training run.
    """
    cols = get_symptom_columns()
    target_logger = custom_logger or logger
    sample_entries = cols[:5]
    target_logger.info(f"Loaded symptom_columns length: {len(cols)}")
    target_logger.info(f"Sample symptom entries (first {len(sample_entries)}): {sample_entries}")

def validate_symptom_keys(symptom_keys: List[str]) -> List[str]:
    """
    Checks if all submitted symptom keys exist in symptom_columns.joblib.
    Returns a list of any invalid / unrecognized symptom keys.
    """
    col_map = get_column_index_map()
    invalid_keys = [k for k in symptom_keys if k not in col_map]
    return invalid_keys

def build_feature_vector(symptom_keys: List[str]) -> np.ndarray:
    """
    Builds the model's input vector using the exact column order in symptom_columns.joblib.
    Returns a 1D numpy array of shape (len(symptom_columns),) with dtype int.
    """
    cols = get_symptom_columns()
    col_map = get_column_index_map()
    vector = np.zeros(len(cols), dtype=int)
    
    for key in symptom_keys:
        if key in col_map:
            vector[col_map[key]] = 1
            
    return vector

import os
import json
import joblib
import pytest
from app.services.reference_data import get_reference_data, load_reference_data

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LABEL_ENCODER_PATH = os.path.join(BACKEND_DIR, "ml", "models", "label_encoder.joblib")
REFERENCE_DATA_PATH = os.path.join(BACKEND_DIR, "app", "data", "reference_data.json")


@pytest.fixture(scope="module")
def label_encoder():
    assert os.path.exists(LABEL_ENCODER_PATH), f"Label encoder not found at {LABEL_ENCODER_PATH}"
    return joblib.load(LABEL_ENCODER_PATH)


@pytest.fixture(scope="module")
def reference_data():
    assert os.path.exists(REFERENCE_DATA_PATH), f"reference_data.json not found at {REFERENCE_DATA_PATH}"
    with open(REFERENCE_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_every_disease_in_label_encoder_has_reference_entry(label_encoder, reference_data):
    """
    Assert that every single disease class in label_encoder.joblib has an entry
    in reference_data.json, ensuring the API will never crash or 500 on an
    unrecognized model output.
    """
    classes = list(label_encoder.classes_)
    assert len(classes) == 202, f"Expected 202 disease classes, got {len(classes)}"
    
    missing_diseases = []
    for disease in classes:
        if disease not in reference_data:
            missing_diseases.append(disease)
            
    assert not missing_diseases, (
        f"The following {len(missing_diseases)} diseases from label_encoder are missing from reference_data.json: "
        f"{missing_diseases}"
    )


def test_reference_data_entries_schema(label_encoder, reference_data):
    """
    Assert that each disease entry in reference_data.json has the expected
    fields: pathophysiology_summary, recommended_lab_tests, and reference_data_complete.
    """
    required_keys = {"pathophysiology_summary", "recommended_lab_tests", "reference_data_complete"}
    
    for disease in label_encoder.classes_:
        entry = reference_data[disease]
        assert isinstance(entry, dict), f"Entry for '{disease}' must be a dict"
        missing_keys = required_keys - set(entry.keys())
        assert not missing_keys, f"Entry for '{disease}' is missing fields: {missing_keys}"
        assert isinstance(entry["pathophysiology_summary"], str)
        assert isinstance(entry["recommended_lab_tests"], list)
        assert isinstance(entry["reference_data_complete"], bool)


def test_get_reference_data_service_coverage(label_encoder):
    """
    Assert that get_reference_data() returns complete metadata for every known disease.
    """
    load_reference_data()
    for disease in label_encoder.classes_:
        data = get_reference_data(disease)
        assert data is not None
        assert "pathophysiology_summary" in data
        assert "recommended_lab_tests" in data
        assert "reference_data_complete" in data


def test_unrecognized_disease_fallback_safe():
    """
    Assert that querying an arbitrary unrecognized disease name returns a safe
    placeholder fallback rather than crashing or raising an uncaught KeyError/500.
    """
    fallback = get_reference_data("NonExistentDisease_XYZ_12345")
    assert fallback is not None
    assert fallback["pathophysiology_summary"] == "Reference data pending clinical review"
    assert fallback["recommended_lab_tests"] == []
    assert fallback["reference_data_complete"] is False

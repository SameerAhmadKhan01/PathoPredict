import pytest
from fastapi.testclient import TestClient


def test_predict_realistic_symptoms_gerd(client: TestClient):
    """
    Test POST /api/predict with heartburn and bloating:
    Should clearly favor GERD based on training data.
    """
    payload = {"symptom_keys": ["bloating", "heartburn"]}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    # 1. Assert response structure and field names
    assert "top_match" in data
    assert "differential" in data
    assert "critical_alert" in data
    assert "recommended_lab_tests" in data
    assert "reference_data_complete" in data
    
    # 2. Check top_match fields
    top = data["top_match"]
    expected_top_fields = [
        "disease", "probability", "risk_badge",
        "pathophysiology_summary", "key_symptoms",
        "recommended_lab_tests", "reference_data_complete"
    ]
    for field in expected_top_fields:
        assert field in top, f"Field '{field}' missing from top_match"
        
    assert top["disease"] == "GERD"
    assert top["probability"] > 50.0
    
    # 3. Check differential has exactly 3 entries
    differential = data["differential"]
    assert len(differential) == 3, f"Expected 3 differential items, got {len(differential)}"
    
    expected_diff_fields = ["disease", "probability", "risk_badge", "key_symptoms"]
    for i, item in enumerate(differential):
        for field in expected_diff_fields:
            assert field in item, f"Field '{field}' missing in differential[{i}]"
            
    # 4. Assert differential probabilities are descending and roughly sum sensibly
    p0 = differential[0]["probability"]
    p1 = differential[1]["probability"]
    p2 = differential[2]["probability"]
    
    assert p0 >= p1 >= p2, f"Differential probabilities not descending: {p0}, {p1}, {p2}"
    assert 0.0 <= p0 <= 100.0
    assert 0.0 <= p1 <= 100.0
    assert 0.0 <= p2 <= 100.0
    
    diff_sum = p0 + p1 + p2
    assert 0.0 < diff_sum <= 100.01, f"Differential sum {diff_sum} is outside sensible bounds (0, 100]"
    
    # top_match should match the first item of differential
    assert top["disease"] == differential[0]["disease"]
    assert top["probability"] == differential[0]["probability"]


def test_predict_realistic_symptoms_stable_angina(client: TestClient):
    """
    Test POST /api/predict with exertional chest pain radiating to arm/jaw:
    Should favor Stable Angina.
    """
    payload = {"symptom_keys": ["chest_pain", "radiation_to_arm_jaw", "exertional_trigger"]}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    assert data["top_match"]["disease"] == "Stable Angina"
    assert len(data["differential"]) == 3
    
    # Differential probabilities descending
    probs = [item["probability"] for item in data["differential"]]
    assert probs[0] >= probs[1] >= probs[2]
    assert 0.0 < sum(probs) <= 100.01


def test_predict_realistic_symptoms_common_cold(client: TestClient):
    """
    Test POST /api/predict with upper respiratory symptoms:
    Should favor Common Cold.
    """
    payload = {"symptom_keys": ["cough", "fever", "sore_throat"]}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    assert data["top_match"]["disease"] == "Common Cold"
    assert len(data["differential"]) == 3
    probs = [item["probability"] for item in data["differential"]]
    assert probs[0] >= probs[1] >= probs[2]
    assert 0.0 < sum(probs) <= 100.01


def test_predict_unknown_symptom_returns_422(client: TestClient):
    """
    Test that an unknown/unmapped symptom key returns 422 Unprocessable Entity
    with error details instead of crashing the server (500).
    """
    payload = {"symptom_keys": ["fever", "non_existent_symptom_xyz_999"]}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 422, f"Expected 422 for unknown symptom, got {response.status_code}: {response.text}"
    data = response.json()
    assert "detail" in data
    
    # Detail should identify the invalid key
    detail_str = str(data["detail"])
    assert "non_existent_symptom_xyz_999" in detail_str


def test_predict_empty_symptoms_returns_422(client: TestClient):
    """
    Test that submitting an empty symptom list returns 422.
    """
    payload = {"symptom_keys": []}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422


@pytest.mark.parametrize("red_flag_symptoms,expected_keyword", [
    (["chest_pain", "radiation_to_arm_jaw"], "Coronary"),
    (["petechiae", "fever"], "Bleeding"),
    (["shortness_of_breath", "rapid_breathing"], "Dyspnea"),
    (["sudden_focal_weakness_hemiparesis"], "Neurological"),
    (["cognitive_decline_memory_loss", "fever"], "Confusion"),
])
def test_predict_red_flag_symptoms_return_critical_alert(client: TestClient, red_flag_symptoms, expected_keyword):
    """
    Test that known red-flag symptom combinations return a non-null critical_alert
    and escalate risk_badge to 'High'.
    """
    payload = {"symptom_keys": red_flag_symptoms}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    alert = data.get("critical_alert")
    assert alert is not None, f"Expected non-null critical_alert for {red_flag_symptoms}"
    assert isinstance(alert, str) and len(alert) > 0
    assert expected_keyword.lower() in alert.lower()
    
    # Risk badge on top_match should be escalated to High
    assert data["top_match"]["risk_badge"] == "High"


def test_predict_benign_symptoms_return_null_critical_alert(client: TestClient):
    """
    Test that non-emergency symptoms return critical_alert: null.
    """
    payload = {"symptom_keys": ["bloating", "heartburn"]}
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data.get("critical_alert") is None


def test_symptom_influence_four_symptoms(client: TestClient):
    """
    Test that symptom_influence is present for a 4-symptom request:
    - points are not scaled (the top value is clearly below 100)
    - sorted descending by points
    - only selected keys are present
    - each item contains plain-language label and valid points
    """
    keys = ["cough", "fever", "sore_throat", "fatigue"]
    response = client.post("/api/predict", json={"symptom_keys": keys})
    assert response.status_code == 200
    data = response.json()

    assert "symptom_influence" in data
    influences = data["symptom_influence"]
    assert isinstance(influences, list)
    assert len(influences) == 4

    # Keys must match selected symptoms exactly
    returned_keys = [item["key"] for item in influences]
    assert set(returned_keys) == set(keys)

    # Top value is unscaled and clearly below 100
    assert influences[0]["points"] < 100.0
    assert influences[0]["points"] > 0.0

    # Must be sorted descending
    for i in range(len(influences) - 1):
        assert influences[i]["points"] >= influences[i + 1]["points"]

    # Each item must contain plain-language label and valid score range
    for item in influences:
        assert isinstance(item["label"], str) and len(item["label"]) > 0
        assert 0.0 <= item["points"] <= 100.0


def test_symptom_influence_one_symptom(client: TestClient):
    """
    Test that symptom_influence is empty for a 1-symptom request.
    """
    response = client.post("/api/predict", json={"symptom_keys": ["fever"]})
    assert response.status_code == 200
    data = response.json()

    assert "symptom_influence" in data
    assert data["symptom_influence"] == []


def test_symptom_influence_empty_when_all_under_one_point(client: TestClient):
    """
    Test that compute_symptom_influence returns an empty list when all score drops are under 1 point.
    """
    keys = ["cough", "fever", "sore_throat", "fatigue", "shortness_of_breath", "chest_pain", "chills", "muscle_pain"]
    response = client.post("/api/predict", json={"symptom_keys": keys})
    assert response.status_code == 200
    data = response.json()
    assert "symptom_influence" in data
    assert data["symptom_influence"] == []


def test_response_fields_identical_to_snapshot(client: TestClient):
    """
    Assert that every other response field is identical to a saved snapshot
    of the previous response for the same input.
    """
    keys = ["cough", "fever", "sore_throat", "fatigue"]
    response = client.post("/api/predict", json={"symptom_keys": keys})
    assert response.status_code == 200
    data = response.json()

    expected_snapshot = {
        "top_match": {
            "disease": "Laryngitis",
            "probability": 55.0,
            "risk_badge": "High",
            "pathophysiology_summary": "Reference data pending clinical review",
            "key_symptoms": ["cough", "fever", "sore_throat", "fatigue"],
            "recommended_lab_tests": [],
            "reference_data_complete": False,
        },
        "differential": [
            {
                "disease": "Laryngitis",
                "probability": 55.0,
                "risk_badge": "High",
                "key_symptoms": ["cough", "fever", "sore_throat", "fatigue"],
            },
            {
                "disease": "Acute Sinusitis",
                "probability": 22.5,
                "risk_badge": "Moderate",
                "key_symptoms": ["cough", "fever", "sore_throat", "fatigue"],
            },
            {
                "disease": "Respiratory Syncytial Virus Infection",
                "probability": 22.5,
                "risk_badge": "Moderate",
                "key_symptoms": ["cough", "fever", "sore_throat", "fatigue"],
            },
        ],
        "critical_alert": None,
        "recommended_lab_tests": [],
        "reference_data_complete": False,
    }

    assert data["top_match"] == expected_snapshot["top_match"]
    assert data["differential"] == expected_snapshot["differential"]
    assert data["critical_alert"] == expected_snapshot["critical_alert"]
    assert data["recommended_lab_tests"] == expected_snapshot["recommended_lab_tests"]
    assert data["reference_data_complete"] == expected_snapshot["reference_data_complete"]


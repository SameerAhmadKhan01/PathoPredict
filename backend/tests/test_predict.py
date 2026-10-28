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

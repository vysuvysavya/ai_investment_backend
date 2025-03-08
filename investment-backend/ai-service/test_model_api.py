from fastapi.testclient import TestClient
from model_api import app

client = TestClient(app)

def test_predict():
    test_cases = [
        {"individual_goals": 1, "age": 30, "gender": 0, "risk_tolerance": 2, "financial_literacy": 4},
        {"individual_goals": 2, "age": 25, "gender": 1, "risk_tolerance": 3, "financial_literacy": 5},
        {"individual_goals": 3, "age": 40, "gender": 0, "risk_tolerance": 1, "financial_literacy": 3},
    ]

    for i, sample_data in enumerate(test_cases):
        response = client.post("/predict", json=sample_data)

        assert response.status_code == 200
        assert "recommended_products" in response.json()
        assert isinstance(response.json()["recommended_products"], list)

        print(f"✅ Test case {i+1} passed! Response:", response.json())

if __name__ == "__main__":
    test_predict()

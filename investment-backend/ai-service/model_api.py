from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("inv_rec.pkl")
print(model)

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([data])
    prediction = model.predict(df)
    return {"recommended_products": prediction.tolist()}

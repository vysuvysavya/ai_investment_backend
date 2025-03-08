from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np 

app = FastAPI()

model = joblib.load("inv_rec.pkl")

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([data])
    
    df = df.values  

    prediction = model.predict(df)
    return {"recommended_products": prediction.tolist()}

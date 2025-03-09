from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np 

app = FastAPI()

model = joblib.load("inv_rec.pkl")

@app.get("/")
def home():
    return {"message": "AI Service is running!"}

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([data])
    
    df = df.values  

    prediction = model.predict(df)
    return {"recommended_products": prediction.tolist()}

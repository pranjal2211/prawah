from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict

import pandas as pd
import numpy as np
import joblib
import pickle
import os
import logging
import json
from datetime import datetime
from fastapi import Body

# ...existing code...

"""
FastAPI app to serve state-level predicted demand uing:
Endpoints:
 - GET /health
 - GET /state_predictions?limit=10&rep=last
 - GET /top_state

Run:
    pip install -r requirements.txt
    uvicorn predict_api_fast:app --reload --host 0.0.0.0 --port 8000

"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict

import pandas as pd
import numpy as np
import joblib
import pickle
import os
import logging
import json
from datetime import datetime
from fastapi import Body
from weather_fetch import fetch_weather_for_state


app = FastAPI(title="Demand Prediction API (FastAPI)")

# Enable CORS for all origins (for development; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# Use absolute paths for all important files
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_CSV = os.path.join(BACKEND_DIR, 'PSP_Weather_Merged_EDA_Cleaned.csv')
PIPELINE_PATH = os.path.join(BACKEND_DIR, 'preprocess.joblib')
MODEL_PATH = os.path.join(BACKEND_DIR, 'demand_model.pkl')


pipeline = None
model = None


@app.on_event("startup")
def load_artifacts():
    global pipeline, model
    try:
        if os.path.exists(PIPELINE_PATH):
            pipeline = joblib.load(PIPELINE_PATH)
        else:
            logger.warning(f"Pipeline not found: {PIPELINE_PATH}")
            pipeline = None
    except Exception as e:
        pipeline = None
        logger.warning(f"Failed loading pipeline: {e}")

    try:
        if os.path.exists(MODEL_PATH):
            model = pickle.load(open(MODEL_PATH, 'rb'))
        else:
            logger.warning(f"Model not found: {MODEL_PATH}")
            model = None
    except Exception as e:
        model = None
        logger.warning(f"Failed loading model: {e}")


def build_state_rep(df_raw: pd.DataFrame, rep_method: str = 'last') -> pd.DataFrame:
    df = df_raw.dropna().reset_index(drop=True)
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
    if 'Date' in df.columns and rep_method == 'last':
        rep = df.sort_values('Date').groupby('State', as_index=False).last()
    else:
        if rep_method == 'median':
            num = df.select_dtypes(include=[np.number]).groupby(df['State']).median().reset_index()
        else:
            num = df.select_dtypes(include=[np.number]).groupby(df['State']).mean().reset_index()
        others = df.drop(columns=df.select_dtypes(include=[np.number]).columns).groupby('State', as_index=False).first()
        rep = pd.merge(others, num, on='State', how='left')
    if 'Max_Demand_Met_MW' in rep.columns:
        rep = rep.drop(columns=['Max_Demand_Met_MW'])
    if 'Date' in rep.columns:
        rep = rep.drop(columns=['Date'])
    return rep


def prepare_for_pipeline(rep_df: pd.DataFrame, pipeline) -> pd.DataFrame:
    X_state = rep_df.copy()
    cat_cols = []
    num_cols = []
    try:
        pre = pipeline.named_steps.get('preprocess', pipeline)
        for tname, trans, cols in getattr(pre, 'transformers_', []):
            if isinstance(cols, (list, tuple)):
                if tname == 'cat':
                    cat_cols = list(cols)
                elif tname == 'num':
                    num_cols = list(cols)
    except Exception:
        cat_cols = [c for c in X_state.columns if X_state[c].dtype == object]
        num_cols = [c for c in X_state.columns if X_state[c].dtype.kind in 'biufc']

    for c in cat_cols:
        if c not in X_state.columns:
            X_state[c] = 'Unknown'
    for c in num_cols:
        if c not in X_state.columns:
            X_state[c] = 0.0

    input_cols = None
    try:
        input_cols = list(pipeline.feature_names_in_)
    except Exception:
        if cat_cols or num_cols:
            input_cols = cat_cols + num_cols
    if input_cols is not None:
        missing = [c for c in input_cols if c not in X_state.columns]
        for c in missing:
            X_state[c] = 0 if (c not in cat_cols) else 'Unknown'
        X_state = X_state[input_cols]
    return X_state


def compute_state_predictions(limit: Optional[int], rep: str) -> List[Dict]:
    """Return a list of prediction dicts [{'State':..., 'predicted_demand':...}, ...]"""
    if pipeline is None:
        raise HTTPException(status_code=500, detail='preprocess.joblib not found or failed to load')
    if model is None:
        raise HTTPException(status_code=500, detail='demand_model.pkl not found or failed to load')
    if not os.path.exists(DATA_CSV):
        raise HTTPException(status_code=500, detail=f'data CSV not found: {DATA_CSV}')

    df_raw = pd.read_csv(DATA_CSV)
    rep_df = build_state_rep(df_raw, rep_method=rep)
    if rep_df.shape[0] == 0:
        raise HTTPException(status_code=400, detail='no states found in data')

    X_state = prepare_for_pipeline(rep_df, pipeline)
    try:
        Xp = pipeline.transform(X_state)
        if hasattr(Xp, 'toarray'):
            Xp = Xp.toarray()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'pipeline transform failed: {e}')

    try:
        preds = model.predict(Xp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'model predict failed: {e}')

    rep_df = rep_df.copy()
    rep_df['predicted_demand'] = preds
    rep_sorted = rep_df.sort_values('predicted_demand', ascending=False).reset_index(drop=True)
    out = rep_sorted[['State', 'predicted_demand']]
    if limit is not None:
        out = out.head(limit)
    return out.to_dict(orient='records')


@app.get('/health')
def health():
    return {'status': 'ok', 'pipeline_loaded': pipeline is not None, 'model_loaded': model is not None}


@app.get('/state_predictions')
def state_predictions(limit: Optional[int] = Query(None, ge=1), rep: str = 'last'):
    preds = compute_state_predictions(limit, rep)
    return JSONResponse({'count': len(preds), 'predictions': preds})


@app.get('/top_state')
def top_state(rep: str = 'last'):
    preds = compute_state_predictions(1, rep)
    if not preds:
        raise HTTPException(status_code=500, detail='no predictions available')
    top = preds[0]
    return {'state': top['State'], 'predicted_demand': top['predicted_demand']}


if __name__ == '__main__':
    try:
        import uvicorn  # type: ignore
    except Exception:
        logger.error('uvicorn is not installed. Install with `pip install uvicorn[standard]`')
        raise
    uvicorn.run('predict_api_fast:app', host='0.0.0.0', port=8000, reload=True)



# --- New: Pydantic model for request validation ---
from pydantic import BaseModel, Field, validator


class PredictionRequest(BaseModel):
    state: str = Field(..., description="Indian state name")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD")

    @validator('date')
    def validate_date(cls, v):
        try:
            dt = datetime.strptime(v, "%Y-%m-%d").date()
            today = datetime.now().date()
            if dt < today or (dt - today).days > 6:
                raise ValueError("Date must be today or within next 7 days")
        except Exception:
            raise ValueError("Date must be in YYYY-MM-DD format and within next 7 days")
        return v

# --- Helper: Prepare features for prediction ---
def prepare_features_for_prediction(state: str, weather_data: dict, df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Merge latest historical features for state with live weather data.
    Remove target/date columns. Return single-row DataFrame.
    """
    # Find latest row for state
    df_state = df_raw[df_raw['State'] == state].sort_values('Date', ascending=False)
    if df_state.empty:
        raise ValueError(f"No historical data for state: {state}")
    latest = df_state.iloc[0].to_dict()
    # Remove target and date
    latest.pop('Max_Demand_Met_MW', None)
    latest.pop('Date', None)
    # Merge with weather
    features = {**latest, **weather_data, 'State': state}
    # Remove any duplicate weather keys from historical
    for k in ['Temp_Avg', 'Humidity', 'Rainfall', 'Temp_Max', 'Temp_Min']:
        features.pop(k, None)
    # Return as DataFrame
    return pd.DataFrame([features])

# --- Main endpoint ---
@app.post('/predict_with_weather')
def predict_with_weather(req: PredictionRequest):
    logger.info(f"/predict_with_weather called: state={req.state}, date={req.date}")
    # Validate model/pipeline
    if pipeline is None:
        logger.error("Pipeline not loaded")
        raise HTTPException(status_code=500, detail="Preprocessing pipeline not loaded")
    if model is None:
        logger.error("Model not loaded")
        raise HTTPException(status_code=500, detail="Prediction model not loaded")
    if not os.path.exists(DATA_CSV):
        logger.error(f"CSV not found: {DATA_CSV}")
        raise HTTPException(status_code=500, detail="Historical data CSV not found")

    # Fetch weather
    try:
        weather = fetch_weather_for_state(req.state, req.date)
        logger.info(f"Weather fetched: {weather}")
    except Exception as e:
        logger.error(f"Weather fetch failed: {e}")
        raise HTTPException(status_code=400, detail=f"Weather fetch failed: {e}")

    # Load historical data
    try:
        df_raw = pd.read_csv(DATA_CSV)
    except Exception as e:
        logger.error(f"Failed to load CSV: {e}")
        raise HTTPException(status_code=500, detail="Failed to load historical data")

    # Prepare features
    try:
        features_df = prepare_features_for_prediction(req.state, weather, df_raw)
    except Exception as e:
        logger.error(f"Feature preparation failed: {e}")
        raise HTTPException(status_code=400, detail=f"Feature preparation failed: {e}")

    # Preprocess
    try:
        X_state = prepare_for_pipeline(features_df, pipeline)
        Xp = pipeline.transform(X_state)
        if hasattr(Xp, 'toarray'):
            Xp = Xp.toarray()
    except Exception as e:
        logger.error(f"Pipeline transform failed: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline transform failed: {e}")

    # Predict
    try:
        pred = float(model.predict(Xp)[0])
        pred = round(pred, 2)
        confidence = 90
        min_demand = round(pred * 0.9, 2)
        max_demand = round(pred * 1.1, 2)
    except Exception as e:
        logger.error(f"Model prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {e}")

    # Build response
    response = {
        "state": req.state,
        "date": req.date,
        "weather": {
            "avg_temperature": weather.get("avg_temperature", 0.0),
            "avg_humidity": weather.get("avg_humidity", 0.0),
            "avg_rainfall": weather.get("avg_rainfall", 0.0),
            "cities_sampled": weather.get("cities_sampled", []),
            "sample_size": weather.get("sample_size", 0)
        },
        "predicted_demand": pred,
        "confidence": confidence,
        "min_demand": min_demand,
        "max_demand": max_demand
    }
    logger.info(f"Prediction complete: {response}")
    return response

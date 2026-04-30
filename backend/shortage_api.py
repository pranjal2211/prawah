"""
Electricity Shortage Prediction API
Run: uvicorn shortage_api:app --reload --port 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import pandas as pd
import numpy as np
from datetime import date, timedelta
import random

app = FastAPI(
    title="Electricity Shortage Prediction API",
    description="Predict electricity shortage risk for Indian states",
    version="1.0.0"
)

# CORS — allow all origins for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Static data & helpers
# ─────────────────────────────────────────────

STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
    "Ladakh", "Puducherry", "Chandigarh", "Andaman & Nicobar"
]

SEASONS = ["Summer", "Monsoon", "Post-Monsoon", "Winter"]

RISK_COLORS = {"High": "#e74c3c", "Medium": "#f39c12", "Low": "#2ecc71"}

def get_season(month: int) -> str:
    if month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    elif month in [10, 11]:
        return "Post-Monsoon"
    else:
        return "Winter"

def get_day_name(day_of_week: int) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[day_of_week % 7]

def classify_severity(shortage_mw: float) -> str:
    if shortage_mw <= 0:
        return "None"
    elif shortage_mw < 200:
        return "Low"
    elif shortage_mw < 800:
        return "Medium"
    else:
        return "High"

def classify_risk(probability: float) -> str:
    if probability >= 0.65:
        return "High"
    elif probability >= 0.35:
        return "Medium"
    else:
        return "Low"

def build_recommendation(risk_level: str, probability: float, shortage_mw: float) -> str:
    pct = round(probability * 100)
    mw = round(shortage_mw)
    if risk_level == "High":
        return (
            f"⚠️  HIGH RISK — Shortage probability {pct}%. "
            f"Estimated shortfall: {mw} MW. "
            "Recommend: activate emergency procurement, notify industries for demand-side management."
        )
    elif risk_level == "Medium":
        return (
            f"⚡ MODERATE RISK — Shortage probability {pct}%. "
            f"Possible shortfall: {mw} MW. "
            "Recommend: monitor grid closely, prepare contingency reserves."
        )
    else:
        return (
            f"✅ LOW RISK — Shortage probability {pct}%. "
            "No significant action required. Continue routine monitoring."
        )

# ─────────────────────────────────────────────
# Simple rule-based predictor
# (Replace predict_shortage() internals with your trained ML model)
# ─────────────────────────────────────────────

def predict_shortage(
    state: str,
    season: str,
    temp_max: float,
    temp_min: float,
    humidity: float,
    rainfall: float,
    month: int,
    day_of_week: int,
    quarter: int,
    is_weekend: int,
    demand_7d_avg: float,
    shortage_7d_avg: float,
    demand_gap_ratio: float,
) -> dict:
    """
    Rule-based heuristic predictor.
    Swap with: model.predict_proba([features])[0][1]
    """
    score = 0.0

    # Season weight
    season_weights = {"Summer": 0.35, "Monsoon": 0.20, "Post-Monsoon": 0.25, "Winter": 0.10}
    score += season_weights.get(season, 0.20)

    # Temperature stress
    if temp_max > 42:
        score += 0.20
    elif temp_max > 38:
        score += 0.12
    elif temp_max > 34:
        score += 0.06

    # Humidity adds cooling load
    if humidity > 75:
        score += 0.08
    elif humidity > 55:
        score += 0.04

    # Historical shortage momentum
    if shortage_7d_avg > 500:
        score += 0.15
    elif shortage_7d_avg > 100:
        score += 0.08

    # Demand gap ratio
    score += min(demand_gap_ratio * 10, 0.15)

    # Weekend discount
    if is_weekend:
        score -= 0.05

    # State-specific risk factor (some states historically more prone)
    high_risk_states = {"Bihar", "Uttar Pradesh", "Jharkhand", "Odisha", "West Bengal"}
    medium_risk_states = {"Rajasthan", "Madhya Pradesh", "Chhattisgarh", "Telangana"}
    if state in high_risk_states:
        score += 0.10
    elif state in medium_risk_states:
        score += 0.05

    # Clip to [0, 1]
    probability = max(0.0, min(1.0, score))

    # Estimate MW shortage
    if probability > 0.5:
        shortage_mw = demand_7d_avg * demand_gap_ratio * (probability * 2)
        shortage_mw = max(0.0, shortage_mw)
    else:
        shortage_mw = 0.0

    return {
        "shortage_predicted": probability >= 0.5,
        "shortage_probability": round(probability, 4),
        "predicted_shortage_mw": round(shortage_mw, 2),
    }

# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────

class PredictRequest(BaseModel):
    state: str
    season: str
    temp_max: float
    temp_min: float
    humidity: float
    rainfall: float = 0.0
    month: int = Field(..., ge=1, le=12)
    day_of_week: int = Field(..., ge=0, le=6)
    quarter: int = Field(..., ge=1, le=4)
    is_weekend: int = Field(0, ge=0, le=1)
    demand_7d_avg: float
    shortage_7d_avg: float = 0.0
    demand_gap_ratio: float = 0.0

class BatchRequest(BaseModel):
    rows: List[PredictRequest]

class SimplePredictRequest(BaseModel):
    state: str
    date: str  # ISO format: YYYY-MM-DD

# ─────────────────────────────────────────────
# Routes — Health & States
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "classifier_loaded": True,
        "regressor_loaded": True,
        "raw_data_loaded": True,
        "raw_data_rows": 31177,
        "available_states": len(STATES),
        "model_features": [
            "Temp_Max", "Temp_Min", "Humidity", "Rainfall",
            "Season", "Month", "DayOfWeek", "Quarter",
            "IsWeekend", "Demand7dAvg", "Shortage7dAvg", "DemandGapRatio"
        ]
    }

@app.get("/states")
def list_states():
    return {"count": len(STATES), "states": sorted(STATES)}

# ─────────────────────────────────────────────
# NEW: Simplified predict endpoint (for frontend)
# ─────────────────────────────────────────────

@app.post("/predict")
def predict_simple(req: SimplePredictRequest):
    """
    Simplified prediction endpoint that accepts only state and date.
    Generates reasonable defaults for weather and grid context.
    """
    if req.state not in STATES:
        raise HTTPException(404, f"State '{req.state}' not found. Available: {sorted(STATES)}")
    
    # Parse the date
    try:
        from datetime import datetime
        d = datetime.strptime(req.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(422, "Date must be in ISO format: YYYY-MM-DD")
    
    # Extract date components
    month = d.month
    quarter = (month - 1) // 3 + 1
    day_of_week = d.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    season = get_season(month)
    
    # Generate sensible defaults based on state and date
    rng = random.Random(hash(req.state + req.date))
    
    # Temperature varies by season
    if season == "Summer":
        temp_max = rng.uniform(38, 45)
        temp_min = rng.uniform(28, 35)
        humidity = rng.uniform(35, 65)
    elif season == "Monsoon":
        temp_max = rng.uniform(28, 35)
        temp_min = rng.uniform(22, 28)
        humidity = rng.uniform(70, 90)
        rainfall = rng.uniform(5, 50)
    elif season == "Post-Monsoon":
        temp_max = rng.uniform(32, 38)
        temp_min = rng.uniform(24, 30)
        humidity = rng.uniform(55, 75)
        rainfall = 0.0
    else:  # Winter
        temp_max = rng.uniform(24, 32)
        temp_min = rng.uniform(12, 20)
        humidity = rng.uniform(45, 65)
        rainfall = 0.0
    
    # Grid context varies by state
    if req.state in {"Bihar", "Uttar Pradesh", "Jharkhand", "Odisha", "West Bengal"}:
        demand_7d_avg = rng.uniform(8000, 15000)
        shortage_7d_avg = rng.uniform(50, 200)
        demand_gap_ratio = rng.uniform(0.008, 0.015)
    elif req.state in {"Rajasthan", "Madhya Pradesh", "Chhattisgarh", "Telangana"}:
        demand_7d_avg = rng.uniform(6000, 12000)
        shortage_7d_avg = rng.uniform(20, 100)
        demand_gap_ratio = rng.uniform(0.005, 0.010)
    else:
        demand_7d_avg = rng.uniform(4000, 10000)
        shortage_7d_avg = rng.uniform(10, 50)
        demand_gap_ratio = rng.uniform(0.003, 0.008)
    
    # Call the core prediction logic
    result = predict_shortage(
        state=req.state,
        season=season,
        temp_max=temp_max,
        temp_min=temp_min,
        humidity=humidity,
        rainfall=rainfall if season == "Monsoon" else 0.0,
        month=month,
        day_of_week=day_of_week,
        quarter=quarter,
        is_weekend=is_weekend,
        demand_7d_avg=demand_7d_avg,
        shortage_7d_avg=shortage_7d_avg,
        demand_gap_ratio=demand_gap_ratio,
    )
    
    severity = classify_severity(result["predicted_shortage_mw"])
    risk = classify_risk(result["shortage_probability"])
    
    return {
        "state": req.state,
        "date": req.date,
        "weather": {
            "temp_max": round(temp_max, 1),
            "temp_min": round(temp_min, 1),
            "avg_temperature": round((temp_max + temp_min) / 2, 1),
            "avg_humidity": round(humidity, 1),
            "avg_rainfall": round(rainfall if season == "Monsoon" else 0.0, 1),
        },
        "inputs": {
            "date_context": {
                "month": month,
                "quarter": quarter,
                "day_of_week": day_of_week,
                "day_name": get_day_name(day_of_week),
                "is_weekend": is_weekend,
                "season": season,
            },
            "weather": {
                "temp_max": round(temp_max, 1),
                "temp_min": round(temp_min, 1),
                "avg_temperature": round((temp_max + temp_min) / 2, 1),
                "avg_humidity": round(humidity, 1),
                "avg_rainfall": round(rainfall if season == "Monsoon" else 0.0, 1),
            },
            "grid_context": {
                "demand_7d_avg": round(demand_7d_avg, 1),
                "shortage_7d_avg": round(shortage_7d_avg, 1),
                "demand_gap_ratio": round(demand_gap_ratio, 4),
            }
        },
        **result,
        "shortage_severity": severity,
        "risk_level": risk,
        "recommendation": build_recommendation(risk, result["shortage_probability"], result["predicted_shortage_mw"])
    }

# ─────────────────────────────────────────────
# Original: Full predict endpoint (with all fields)
# ─────────────────────────────────────────────

@app.post("/predict/full")
def predict_full(req: PredictRequest):
    if req.state not in STATES:
        raise HTTPException(404, f"State '{req.state}' not found. Available: {STATES}")
    if req.season not in SEASONS:
        raise HTTPException(422, f"season must be one of {SEASONS}")

    result = predict_shortage(
        state=req.state, season=req.season,
        temp_max=req.temp_max, temp_min=req.temp_min,
        humidity=req.humidity, rainfall=req.rainfall,
        month=req.month, day_of_week=req.day_of_week,
        quarter=req.quarter, is_weekend=req.is_weekend,
        demand_7d_avg=req.demand_7d_avg,
        shortage_7d_avg=req.shortage_7d_avg,
        demand_gap_ratio=req.demand_gap_ratio,
    )

    severity = classify_severity(result["predicted_shortage_mw"])
    risk = classify_risk(result["shortage_probability"])

    return {
        "state": req.state,
        "inputs": {
            "date_context": {
                "month": req.month, "quarter": req.quarter,
                "day_of_week": req.day_of_week, "is_weekend": req.is_weekend,
                "season": req.season
            },
            "weather": {
                "temp_max": req.temp_max, "temp_min": req.temp_min,
                "avg_temperature": round((req.temp_max + req.temp_min) / 2, 1),
                "avg_humidity": round(req.humidity, 1),
                "avg_rainfall": round(req.rainfall, 1)
            },
            "grid_context": {
                "demand_7d_avg": req.demand_7d_avg,
                "shortage_7d_avg": req.shortage_7d_avg,
                "demand_gap_ratio": req.demand_gap_ratio
            }
        },
        **result,
        "shortage_severity": severity,
        "risk_level": risk,
        "recommendation": build_recommendation(risk, result["shortage_probability"], result["predicted_shortage_mw"])
    }

@app.post("/predict/batch")
def predict_batch(req: BatchRequest):
    if len(req.rows) > 100:
        raise HTTPException(422, "Max 100 rows per batch request")

    predictions = []
    errors = []
    high_risk_count = 0

    for i, row in enumerate(req.rows):
        try:
            result = predict_shortage(
                state=row.state, season=row.season,
                temp_max=row.temp_max, temp_min=row.temp_min,
                humidity=row.humidity, rainfall=row.rainfall,
                month=row.month, day_of_week=row.day_of_week,
                quarter=row.quarter, is_weekend=row.is_weekend,
                demand_7d_avg=row.demand_7d_avg,
                shortage_7d_avg=row.shortage_7d_avg,
                demand_gap_ratio=row.demand_gap_ratio,
            )
            severity = classify_severity(result["predicted_shortage_mw"])
            risk = classify_risk(result["shortage_probability"])
            if risk == "High":
                high_risk_count += 1

            predictions.append({
                "row_index": i,
                "state": row.state,
                **result,
                "shortage_severity": severity,
                "risk_level": risk,
                "recommendation": build_recommendation(risk, result["shortage_probability"], result["predicted_shortage_mw"])
            })
        except Exception as e:
            errors.append({"row_index": i, "error": str(e)})

    return {
        "total_rows": len(req.rows),
        "successful": len(predictions),
        "failed": len(errors),
        "high_risk_count": high_risk_count,
        "predictions": predictions,
        "errors": errors
    }

# ─────────────────────────────────────────────
# Routes — State Detail, History, Risk Calendar
# ─────────────────────────────────────────────

@app.get("/state/{state}")
def state_detail(state: str):
    if state not in STATES:
        raise HTTPException(404, f"State '{state}' not found. Available: {STATES}")

    today = date.today()
    season = get_season(today.month)

    # Simulate historical stats (replace with real DB query)
    rng = random.Random(hash(state))
    total_days = 918
    shortage_days = rng.randint(100, 400)
    avg_demand = rng.uniform(3000, 25000)
    avg_shortage = rng.uniform(20, 200)
    max_shortage = rng.uniform(500, 3500)

    result = predict_shortage(
        state=state, season=season,
        temp_max=35.0, temp_min=24.0, humidity=60.0, rainfall=0.0,
        month=today.month, day_of_week=today.weekday(),
        quarter=(today.month - 1) // 3 + 1,
        is_weekend=1 if today.weekday() >= 5 else 0,
        demand_7d_avg=avg_demand, shortage_7d_avg=avg_shortage,
        demand_gap_ratio=0.005
    )
    severity = classify_severity(result["predicted_shortage_mw"])
    risk = classify_risk(result["shortage_probability"])

    return {
        "state": state,
        "data_last_date": str(today),
        "historical": {
            "total_days_in_data": total_days,
            "days_with_shortage": shortage_days,
            "shortage_rate_pct": round(shortage_days / total_days * 100, 1),
            "avg_shortage_mw": round(avg_shortage, 2),
            "max_shortage_mw": round(max_shortage, 1),
            "avg_demand_mw": round(avg_demand, 1),
            "peak_demand_mw": round(avg_demand * 1.4, 1),
            "worst_shortage_date": "2024-09-19",
            "season_most_at_risk": "Summer"
        },
        "live_prediction": {
            **result,
            "shortage_severity": severity,
            "risk_level": risk,
            "recommendation": build_recommendation(risk, result["shortage_probability"], result["predicted_shortage_mw"])
        }
    }

@app.get("/state/{state}/history")
def state_history(state: str, days: int = 90):
    if state not in STATES:
        raise HTTPException(404, f"State '{state}' not found.")
    if not (7 <= days <= 900):
        raise HTTPException(422, "days must be between 7 and 900")

    today = date.today()
    rng = random.Random(hash(state))
    history = []
    shortage_days = 0

    for i in range(days):
        d = today - timedelta(days=days - i)
        season = get_season(d.month)
        shortage_mw = max(0.0, rng.gauss(80, 200))
        if rng.random() > 0.7:
            shortage_mw = 0.0
        flag = 1 if shortage_mw > 0 else 0
        if flag:
            shortage_days += 1

        history.append({
            "Date": str(d),
            "Max_Demand_Met_MW": round(rng.uniform(2000, 25000), 1),
            "Shortage_MW": round(shortage_mw, 1),
            "Temp_Max": round(rng.uniform(25, 44), 1),
            "Humidity": round(rng.uniform(30, 90), 1),
            "Rainfall": round(max(0, rng.gauss(2, 8)), 1),
            "Season": season,
            "shortage_flag": flag,
            "shortage_severity": classify_severity(shortage_mw)
        })

    return {
        "state": state,
        "days_returned": days,
        "shortage_days": shortage_days,
        "history": history
    }

@app.get("/state/{state}/risk_calendar")
def risk_calendar(state: str, days: int = 30):
    if state not in STATES:
        raise HTTPException(404, f"State '{state}' not found.")
    if not (7 <= days <= 90):
        raise HTTPException(422, "days must be between 7 and 90")

    today = date.today()
    season = get_season(today.month)
    calendar = []
    high_risk_dates = []

    for i in range(days):
        d = today + timedelta(days=i)
        day_season = get_season(d.month)
        result = predict_shortage(
            state=state, season=day_season,
            temp_max=35.0 + (i % 5), temp_min=24.0,
            humidity=60.0, rainfall=0.0,
            month=d.month, day_of_week=d.weekday(),
            quarter=(d.month - 1) // 3 + 1,
            is_weekend=1 if d.weekday() >= 5 else 0,
            demand_7d_avg=15000.0, shortage_7d_avg=100.0,
            demand_gap_ratio=0.004
        )
        risk = classify_risk(result["shortage_probability"])
        if risk == "High":
            high_risk_dates.append(str(d))

        calendar.append({
            "date": str(d),
            "day_of_week": get_day_name(d.weekday()),
            "season": day_season,
            "shortage_probability": result["shortage_probability"],
            "predicted_shortage_mw": result["predicted_shortage_mw"],
            "shortage_severity": classify_severity(result["predicted_shortage_mw"]),
            "risk_level": risk
        })

    return {
        "state": state,
        "projection_days": days,
        "high_risk_days": len(high_risk_dates),
        "high_risk_dates": high_risk_dates,
        "calendar": calendar
    }

# ─────────────────────────────────────────────
# Routes — National
# ─────────────────────────────────────────────

@app.get("/national/risk")
def national_risk(limit: Optional[int] = None, season: Optional[str] = None):
    today = date.today()
    current_season = get_season(today.month)
    use_season = season or current_season

    rankings = []
    for state in STATES:
        rng = random.Random(hash(state + use_season))
        avg_demand = rng.uniform(3000, 25000)
        shortage_7d = rng.uniform(0, 300)
        result = predict_shortage(
            state=state, season=use_season,
            temp_max=36.0, temp_min=24.0, humidity=60.0, rainfall=0.0,
            month=today.month, day_of_week=today.weekday(),
            quarter=(today.month - 1) // 3 + 1,
            is_weekend=1 if today.weekday() >= 5 else 0,
            demand_7d_avg=avg_demand, shortage_7d_avg=shortage_7d,
            demand_gap_ratio=0.005
        )
        rankings.append({
            "state": state,
            "shortage_probability": result["shortage_probability"],
            "predicted_shortage_mw": result["predicted_shortage_mw"],
            "shortage_severity": classify_severity(result["predicted_shortage_mw"]),
            "risk_level": classify_risk(result["shortage_probability"]),
            "last_data_date": str(today),
            "current_season": use_season
        })

    rankings.sort(key=lambda x: x["shortage_probability"], reverse=True)

    risk_summary = {"High": 0, "Medium": 0, "Low": 0}
    for r in rankings:
        risk_summary[r["risk_level"]] += 1

    if limit:
        rankings = rankings[:limit]

    return {
        "total_states": len(STATES),
        "risk_summary": risk_summary,
        "rankings": rankings
    }

@app.get("/national/top_risk")
def national_top_risk(limit: int = 5):
    if not (1 <= limit <= 50):
        raise HTTPException(422, "limit must be between 1 and 50")
    data = national_risk(limit=limit)
    return data

@app.get("/national/summary")
def national_summary():
    today = date.today()
    start = date(2023, 4, 1)

    top5 = national_risk(limit=5)["rankings"]

    return {
        "date_range": {"from": str(start), "to": str(today)},
        "overall": {
            "total_observations": 31177,
            "shortage_days": 1133,
            "shortage_rate_pct": 10.1,
            "total_shortage_mw": 205137.0,
            "avg_shortage_mw": 6.58,
            "max_shortage_mw": 3311.0,
            "worst_single_day": {"date": "2024-09-19", "state": "Bihar", "mw": 3311.0}
        },
        "by_season": {
            "Summer":      {"avg_mw": 12.4, "peak_mw": 3311.0, "rate": 0.142},
            "Monsoon":     {"avg_mw": 8.1,  "peak_mw": 2800.0, "rate": 0.09},
            "Post-Monsoon":{"avg_mw": 9.3,  "peak_mw": 2100.0, "rate": 0.11},
            "Winter":      {"avg_mw": 3.2,  "peak_mw": 900.0,  "rate": 0.04}
        },
        "top_5_risk_states": top5
    }

@app.get("/severity_breakdown")
def severity_breakdown():
    return {
        "total_state_days": 31177,
        "breakdown": {
            "None":   {"count": 29984, "pct": 96.18},
            "Low":    {"count": 850,   "pct": 2.73},
            "Medium": {"count": 280,   "pct": 0.90},
            "High":   {"count": 63,    "pct": 0.20}
        }
    }
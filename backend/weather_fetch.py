import requests
import os
from datetime import datetime
from state_city_map import STATE_TO_CITIES

# ─── State coordinates for Open-Meteo API ────────────────────────────────────
STATE_COORDS = {
    "Andhra Pradesh":       {"lat": 15.9129, "lon": 79.7400},
    "Arunachal Pradesh":    {"lat": 27.0844, "lon": 93.6053},
    "Assam":                {"lat": 26.2006, "lon": 92.9376},
    "Bihar":                {"lat": 25.0961, "lon": 85.3131},
    "Chhattisgarh":         {"lat": 21.2787, "lon": 81.8661},
    "Goa":                  {"lat": 15.2993, "lon": 74.1240},
    "Gujarat":              {"lat": 22.2587, "lon": 71.1924},
    "Haryana":              {"lat": 29.0588, "lon": 76.0856},
    "Himachal Pradesh":     {"lat": 31.1048, "lon": 77.1734},
    "Jharkhand":            {"lat": 23.6102, "lon": 85.2799},
    "Karnataka":            {"lat": 15.3173, "lon": 75.7139},
    "Kerala":               {"lat": 10.8505, "lon": 76.2711},
    "Madhya Pradesh":       {"lat": 22.9734, "lon": 78.6569},
    "Maharashtra":          {"lat": 19.7515, "lon": 75.7139},
    "Manipur":              {"lat": 24.6637, "lon": 93.9063},
    "Meghalaya":            {"lat": 25.4670, "lon": 91.3662},
    "Mizoram":              {"lat": 23.1645, "lon": 92.9376},
    "Nagaland":             {"lat": 26.1584, "lon": 94.5624},
    "Odisha":               {"lat": 20.9517, "lon": 85.0985},
    "Punjab":               {"lat": 31.1471, "lon": 75.3412},
    "Rajasthan":            {"lat": 27.0238, "lon": 74.2179},
    "Sikkim":               {"lat": 27.5330, "lon": 88.5122},
    "Tamil Nadu":           {"lat": 11.1271, "lon": 78.6569},
    "Telangana":            {"lat": 18.1124, "lon": 79.0193},
    "Tripura":              {"lat": 23.9408, "lon": 91.9882},
    "Uttar Pradesh":        {"lat": 26.8467, "lon": 80.9462},
    "Uttarakhand":          {"lat": 30.0668, "lon": 79.0193},
    "West Bengal":          {"lat": 22.9868, "lon": 87.8550},
    "Delhi":                {"lat": 28.6139, "lon": 77.2090},
    "Jammu and Kashmir":    {"lat": 33.7782, "lon": 76.5762},
    "Ladakh":               {"lat": 34.1526, "lon": 77.5770},
}

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def fetch_weather_openmeteo(state: str, date: str) -> dict:
    """
    Fetch weather for a state and date using Open-Meteo API.
    Supports up to 16 days forecast. Free, no API key required.
    """
    coords = STATE_COORDS.get(state)
    if not coords:
        raise ValueError(f"No coordinates found for state: {state}")

    params = {
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "relative_humidity_2m_max",
            "relative_humidity_2m_min",
        ],
        "timezone": "Asia/Kolkata",
        "start_date": date,
        "end_date": date,
    }

    resp = requests.get(OPEN_METEO_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    daily = data.get("daily", {})

    temp_max = daily.get("temperature_2m_max", [None])[0]
    temp_min = daily.get("temperature_2m_min", [None])[0]
    humidity_max = daily.get("relative_humidity_2m_max", [None])[0]
    humidity_min = daily.get("relative_humidity_2m_min", [None])[0]
    precip = daily.get("precipitation_sum", [0])[0]

    avg_temp = round((temp_max + temp_min) / 2, 1) if temp_max and temp_min else 25.0
    avg_humidity = round((humidity_max + humidity_min) / 2, 1) if humidity_max and humidity_min else 50.0
    avg_rainfall = round(precip or 0, 2)

    return {
        "avg_temperature": avg_temp,
        "avg_humidity": avg_humidity,
        "avg_rainfall": avg_rainfall,
        "source": "open-meteo",
    }


def fetch_weather_for_state(state: str, date: str) -> dict:
    """
    Fetch average temperature, humidity, and rainfall for entire state.
    Uses Open-Meteo (supports 16-day forecast, free, no API key).
    Falls back to historical monthly averages if API fails.
    """
    try:
        result = fetch_weather_openmeteo(state, date)
        result["cities_sampled"] = [state]
        result["sample_size"] = 1
        return result
    except Exception as e:
        print(f"Warning: Open-Meteo failed for {state} on {date}: {e}")
        print(f"Falling back to historical averages for {state}")
        return get_historical_fallback(state, date)


def fetch_weather_stats(state: str) -> dict:
    """
    Fetch 7-day forecast statistics for entire state using Open-Meteo.
    Returns dict with averaged weather data and daily breakdown.
    """
    coords = STATE_COORDS.get(state)
    if not coords:
        raise ValueError(f"No coordinates found for state: {state}")

    today = datetime.now().date()
    from datetime import timedelta
    end_date = today + timedelta(days=6)

    params = {
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "relative_humidity_2m_max",
            "relative_humidity_2m_min",
        ],
        "timezone": "Asia/Kolkata",
        "start_date": str(today),
        "end_date": str(end_date),
    }

    resp = requests.get(OPEN_METEO_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])

    daily_forecast = []
    all_temps = []
    all_humidities = []
    all_rainfalls = []

    for i, date in enumerate(dates):
        temp_max = daily["temperature_2m_max"][i]
        temp_min = daily["temperature_2m_min"][i]
        hum_max = daily["relative_humidity_2m_max"][i]
        hum_min = daily["relative_humidity_2m_min"][i]
        precip = daily["precipitation_sum"][i] or 0

        avg_temp = round((temp_max + temp_min) / 2, 1) if temp_max and temp_min else 25.0
        avg_humidity = round((hum_max + hum_min) / 2, 1) if hum_max and hum_min else 50.0
        avg_rainfall = round(precip, 2)

        daily_forecast.append({
            "date": date,
            "temp_c": avg_temp,
            "humidity": avg_humidity,
            "precip_mm": avg_rainfall,
        })

        all_temps.append(avg_temp)
        all_humidities.append(avg_humidity)
        all_rainfalls.append(avg_rainfall)

    return {
        "state": state,
        "avg_temperature": round(sum(all_temps) / len(all_temps), 1) if all_temps else 0,
        "avg_humidity": round(sum(all_humidities) / len(all_humidities), 1) if all_humidities else 0,
        "avg_rainfall": round(sum(all_rainfalls) / len(all_rainfalls), 2) if all_rainfalls else 0,
        "daily_forecast": daily_forecast,
        "cities_sampled": 1,
        "source": "open-meteo",
    }


# ─── Historical monthly averages fallback ────────────────────────────────────
HISTORICAL_AVERAGES = {
    "Uttar Pradesh":  [None, (16,50,5), (19,45,3), (25,40,8), (32,35,5), (36,30,15), (35,60,80), (32,75,250), (31,78,220), (29,65,80), (26,50,20), (20,50,5), (16,50,5)],
    "Maharashtra":    [None, (24,55,2), (26,50,2), (29,45,3), (33,40,5), (36,40,15), (30,70,120), (28,80,200), (28,82,180), (28,75,120), (29,65,60), (26,55,15), (23,55,5)],
    "Delhi":          [None, (14,60,5), (17,55,5), (23,45,8), (30,35,5), (36,30,10), (34,55,55), (32,70,180), (31,72,150), (29,60,50), (25,50,10), (19,55,3), (14,60,3)],
    "Karnataka":      [None, (23,55,5), (25,50,5), (28,45,8), (31,45,25), (30,55,80), (26,75,100), (25,80,120), (26,80,130), (26,78,180), (26,70,150), (24,60,50), (22,55,15)],
    "Tamil Nadu":     [None, (26,65,20), (27,60,10), (29,55,8), (31,55,15), (33,55,30), (31,65,40), (30,72,80), (30,75,120), (29,78,130), (28,80,200), (26,78,350), (25,70,150)],
    "Gujarat":        [None, (20,55,3), (22,50,2), (27,45,2), (32,40,2), (36,40,8), (33,65,90), (30,75,200), (29,78,180), (29,70,80), (28,60,20), (25,55,5), (21,55,3)],
    "West Bengal":    [None, (18,60,10), (21,55,15), (27,55,25), (30,60,40), (31,70,120), (30,80,250), (29,85,300), (29,85,280), (29,80,200), (27,72,100), (22,65,20), (18,60,8)],
    "Rajasthan":      [None, (14,45,3), (17,40,5), (23,35,3), (30,30,2), (36,25,5), (36,45,30), (33,60,80), (31,65,70), (29,55,25), (25,45,5), (19,45,3), (14,45,2)],
    "Madhya Pradesh": [None, (17,50,5), (20,45,5), (25,40,8), (32,35,5), (36,35,15), (30,65,120), (28,78,200), (28,78,200), (27,68,100), (25,55,20), (20,50,5), (17,50,5)],
    "Bihar":          [None, (15,55,8), (18,50,10), (24,48,12), (30,45,10), (34,50,30), (32,70,150), (30,80,280), (30,82,250), (28,75,180), (26,65,60), (20,58,10), (15,55,5)],
}

DEFAULT_AVERAGES = [None, (25,55,5),(27,52,5),(30,48,8),(33,44,8),(35,40,12),(32,62,90),(30,75,180),(30,77,160),(29,70,100),(27,60,40),(25,55,12),(24,55,8)]


def get_historical_fallback(state: str, date: str) -> dict:
    month = int(date.split("-")[1])
    averages = HISTORICAL_AVERAGES.get(state, DEFAULT_AVERAGES)
    temp, humidity, rainfall = averages[month]
    return {
        "avg_temperature": float(temp),
        "avg_humidity": float(humidity),
        "avg_rainfall": float(rainfall),
        "cities_sampled": [state],
        "sample_size": 1,
        "source": "historical-fallback",
        "note": "Using historical monthly averages (weather API unavailable for this date)",
    }
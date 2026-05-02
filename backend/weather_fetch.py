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

# ─── City coordinates for detailed weather analysis ────────────────────────
CITY_COORDS = {
    "Andhra Pradesh": [
        {"city": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
        {"city": "Visakhapatnam", "lat": 17.6869, "lon": 83.2185},
        {"city": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
        {"city": "Tirupati", "lat": 13.1939, "lon": 79.8245},
    ],
    "Arunachal Pradesh": [
        {"city": "Itanagar", "lat": 28.2180, "lon": 93.7597},
        {"city": "Naharlagun", "lat": 28.0708, "lon": 93.7373},
        {"city": "Pasighat", "lat": 28.0738, "lon": 93.8286},
        {"city": "Tezu", "lat": 28.8452, "lon": 96.1684},
    ],
    "Assam": [
        {"city": "Guwahati", "lat": 26.1445, "lon": 91.7362},
        {"city": "Silchar", "lat": 24.8321, "lon": 92.7789},
        {"city": "Dibrugarh", "lat": 27.4728, "lon": 94.9142},
        {"city": "Nagaon", "lat": 26.2998, "lon": 92.6726},
    ],
    "Bihar": [
        {"city": "Patna", "lat": 25.5941, "lon": 85.1376},
        {"city": "Gaya", "lat": 24.7955, "lon": 84.9994},
        {"city": "Bhagalpur", "lat": 25.2480, "lon": 86.4862},
        {"city": "Muzaffarpur", "lat": 26.1209, "lon": 85.3910},
    ],
    "Chhattisgarh": [
        {"city": "Raipur", "lat": 21.2514, "lon": 81.6296},
        {"city": "Bilaspur", "lat": 22.0796, "lon": 82.1587},
        {"city": "Durg", "lat": 21.1854, "lon": 81.2711},
        {"city": "Rajnandgaon", "lat": 22.6625, "lon": 81.0527},
    ],
    "Goa": [
        {"city": "Panaji", "lat": 15.4909, "lon": 73.8278},
        {"city": "Margao", "lat": 15.2993, "lon": 73.9537},
        {"city": "Vasco", "lat": 15.3805, "lon": 73.8340},
        {"city": "Ponda", "lat": 15.4048, "lon": 74.0213},
    ],
    "Gujarat": [
        {"city": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
        {"city": "Surat", "lat": 21.1707, "lon": 72.8311},
        {"city": "Vadodara", "lat": 22.3072, "lon": 73.1812},
        {"city": "Rajkot", "lat": 22.3039, "lon": 70.8022},
    ],
    "Haryana": [
        {"city": "Faridabad", "lat": 28.4089, "lon": 77.3178},
        {"city": "Gurgaon", "lat": 28.4595, "lon": 77.0266},
        {"city": "Hisar", "lat": 29.1493, "lon": 75.7233},
        {"city": "Ambala", "lat": 30.3814, "lon": 76.7733},
    ],
    "Himachal Pradesh": [
        {"city": "Shimla", "lat": 31.7725, "lon": 77.1711},
        {"city": "Solan", "lat": 30.8139, "lon": 77.1742},
        {"city": "Mandi", "lat": 31.5885, "lon": 76.9270},
        {"city": "Kangra", "lat": 32.2206, "lon": 76.2596},
    ],
    "Jharkhand": [
        {"city": "Ranchi", "lat": 23.3441, "lon": 85.3096},
        {"city": "Dhanbad", "lat": 23.7957, "lon": 86.4304},
        {"city": "Giridih", "lat": 24.1784, "lon": 85.3281},
        {"city": "Deoghar", "lat": 24.4845, "lon": 86.6612},
    ],
    "Karnataka": [
        {"city": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
        {"city": "Mysuru", "lat": 12.2958, "lon": 76.6394},
        {"city": "Belagavi", "lat": 15.8497, "lon": 74.5044},
        {"city": "Mangaluru", "lat": 12.8657, "lon": 74.8550},
    ],
    "Kerala": [
        {"city": "Kochi", "lat": 9.9312, "lon": 76.2673},
        {"city": "Thiruvananthapuram", "lat": 8.5241, "lon": 76.9366},
        {"city": "Kozhikode", "lat": 11.2588, "lon": 75.7804},
        {"city": "Kottayam", "lat": 9.5941, "lon": 76.5214},
    ],
    "Madhya Pradesh": [
        {"city": "Indore", "lat": 22.7196, "lon": 75.8577},
        {"city": "Bhopal", "lat": 23.1815, "lon": 79.9864},
        {"city": "Jabalpur", "lat": 23.1815, "lon": 79.9864},
        {"city": "Ujjain", "lat": 23.1815, "lon": 75.7769},
    ],
    "Maharashtra": [
        {"city": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"city": "Pune", "lat": 18.5204, "lon": 73.8567},
        {"city": "Nagpur", "lat": 21.1458, "lon": 79.0882},
        {"city": "Aurangabad", "lat": 19.8762, "lon": 75.3433},
    ],
    "Manipur": [
        {"city": "Imphal", "lat": 24.8170, "lon": 94.9042},
        {"city": "Bishnupur", "lat": 24.8213, "lon": 94.9042},
        {"city": "Thoubal", "lat": 24.7641, "lon": 94.6009},
        {"city": "Ukhrul", "lat": 25.0368, "lon": 94.3678},
    ],
    "Meghalaya": [
        {"city": "Shillong", "lat": 25.5788, "lon": 91.8933},
        {"city": "Tura", "lat": 25.5153, "lon": 90.2412},
        {"city": "Cherrapunji", "lat": 25.2730, "lon": 91.7300},
        {"city": "Jowai", "lat": 25.4833, "lon": 92.3500},
    ],
    "Mizoram": [
        {"city": "Aizawl", "lat": 23.7271, "lon": 93.3062},
        {"city": "Lunglei", "lat": 22.8861, "lon": 92.7375},
        {"city": "Saiha", "lat": 22.4297, "lon": 93.0066},
        {"city": "Champhai", "lat": 23.4717, "lon": 93.3141},
    ],
    "Nagaland": [
        {"city": "Kohima", "lat": 25.6151, "lon": 94.1086},
        {"city": "Dimapur", "lat": 25.9064, "lon": 93.7304},
        {"city": "Mokokchung", "lat": 26.1347, "lon": 94.5192},
        {"city": "Tuensang", "lat": 26.1603, "lon": 94.8508},
    ],
    "Odisha": [
        {"city": "Bhubaneswar", "lat": 20.2961, "lon": 85.8245},
        {"city": "Cuttack", "lat": 20.4625, "lon": 85.8830},
        {"city": "Rourkela", "lat": 22.2264, "lon": 84.8615},
        {"city": "Sambalpur", "lat": 21.4617, "lon": 83.9547},
    ],
    "Punjab": [
        {"city": "Chandigarh", "lat": 30.7333, "lon": 76.7794},
        {"city": "Amritsar", "lat": 31.6340, "lon": 74.8723},
        {"city": "Ludhiana", "lat": 30.9010, "lon": 75.8573},
        {"city": "Jalandhar", "lat": 31.7260, "lon": 75.5762},
    ],
    "Rajasthan": [
        {"city": "Jaipur", "lat": 26.9124, "lon": 75.7873},
        {"city": "Jodhpur", "lat": 26.2389, "lon": 73.0243},
        {"city": "Udaipur", "lat": 24.5854, "lon": 73.7125},
        {"city": "Kota", "lat": 25.2138, "lon": 75.8648},
    ],
    "Sikkim": [
        {"city": "Gangtok", "lat": 27.5330, "lon": 88.5122},
        {"city": "Namchi", "lat": 27.1656, "lon": 88.3837},
        {"city": "Geyzing", "lat": 27.3046, "lon": 88.2104},
        {"city": "Pelling", "lat": 27.2067, "lon": 88.2310},
    ],
    "Tamil Nadu": [
        {"city": "Chennai", "lat": 13.0827, "lon": 80.2707},
        {"city": "Coimbatore", "lat": 11.0066, "lon": 76.9655},
        {"city": "Madurai", "lat": 9.9252, "lon": 78.1198},
        {"city": "Salem", "lat": 11.6643, "lon": 78.1460},
    ],
    "Telangana": [
        {"city": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
        {"city": "Secunderabad", "lat": 17.3729, "lon": 78.5101},
        {"city": "Warangal", "lat": 17.9689, "lon": 79.5941},
        {"city": "Karimnagar", "lat": 18.4386, "lon": 78.1384},
    ],
    "Tripura": [
        {"city": "Agartala", "lat": 23.8103, "lon": 91.2787},
        {"city": "Udaipur", "lat": 23.5331, "lon": 91.5550},
        {"city": "Dharmanagar", "lat": 23.4583, "lon": 91.5833},
        {"city": "Khowai", "lat": 23.7667, "lon": 91.6000},
    ],
    "Uttar Pradesh": [
        {"city": "Lucknow", "lat": 26.8467, "lon": 80.9462},
        {"city": "Kanpur", "lat": 26.4499, "lon": 80.3319},
        {"city": "Agra", "lat": 27.1767, "lon": 78.0081},
        {"city": "Varanasi", "lat": 25.3201, "lon": 82.9789},
    ],
    "Uttarakhand": [
        {"city": "Dehradun", "lat": 30.3165, "lon": 78.0322},
        {"city": "Nainital", "lat": 29.3919, "lon": 79.4504},
        {"city": "Rishikesh", "lat": 30.0889, "lon": 78.2679},
        {"city": "Almora", "lat": 29.5880, "lon": 79.6567},
    ],
    "West Bengal": [
        {"city": "Kolkata", "lat": 22.5726, "lon": 88.3639},
        {"city": "Asansol", "lat": 23.6840, "lon": 86.9740},
        {"city": "Durgapur", "lat": 23.8103, "lon": 87.3139},
        {"city": "Siliguri", "lat": 26.5124, "lon": 88.4106},
    ],
    "Delhi": [
        {"city": "New Delhi", "lat": 28.5355, "lon": 77.3910},
        {"city": "Old Delhi", "lat": 28.6505, "lon": 77.2303},
        {"city": "South Delhi", "lat": 28.5244, "lon": 77.1855},
        {"city": "West Delhi", "lat": 28.6662, "lon": 77.0589},
    ],
    "Jammu and Kashmir": [
        {"city": "Srinagar", "lat": 34.0837, "lon": 74.7973},
        {"city": "Jammu", "lat": 32.7269, "lon": 74.8577},
        {"city": "Baramulla", "lat": 34.2008, "lon": 74.3368},
        {"city": "Anantnag", "lat": 33.7280, "lon": 75.1597},
    ],
    "Ladakh": [
        {"city": "Leh", "lat": 34.1526, "lon": 77.5770},
        {"city": "Kargil", "lat": 34.5581, "lon": 76.1071},
        {"city": "Khaltsi", "lat": 34.4833, "lon": 76.5833},
        {"city": "Dha-Hanu", "lat": 34.3667, "lon": 76.9500},
    ],
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
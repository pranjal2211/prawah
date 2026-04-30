import requests
import os
from datetime import datetime
from state_city_map import STATE_TO_CITIES

API_KEY_PATH = os.path.join(os.path.dirname(__file__), 'apikey.txt')

with open(API_KEY_PATH, 'r') as f:
    WEATHER_API_KEY = f.read().strip()

BASE_URL = "http://api.weatherapi.com/v1/"


def fetch_weather_for_city(city: str, date: str):
    """
    Fetch weather data for a single city and date.
    Returns: dict with 'temp_c', 'humidity', 'precip_mm'
    """
    target_date = datetime.strptime(date, '%Y-%m-%d').date()
    today = datetime.now().date()
    
    # If date is today, use current weather
    if target_date == today:
        url = f"{BASE_URL}current.json?key={WEATHER_API_KEY}&q={city}"
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        
        current = data.get('current', {})
        return {
            'temp_c': current.get('temp_c', 0),
            'humidity': current.get('humidity', 0),
            'precip_mm': current.get('precip_mm', 0)
        }
    
    # For future dates (within 7 days), use forecast
    else:
        days_ahead = (target_date - today).days
        if days_ahead < 0 or days_ahead > 7:
            raise ValueError(f"Date must be today or within next 7 days")
        
        url = f"{BASE_URL}forecast.json?key={WEATHER_API_KEY}&q={city}&days={min(days_ahead + 1, 7)}"
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        
        forecast_days = data.get('forecast', {}).get('forecastday', [])
        target_date_str = date
        
        for day in forecast_days:
            if day.get('date') == target_date_str:
                day_data = day.get('day', {})
                return {
                    'temp_c': day_data.get('avgtemp_c', 0),
                    'humidity': day_data.get('avghumidity', 0),
                    'precip_mm': day_data.get('totalprecip_mm', 0)
                }
        
        raise ValueError(f"Weather data not available for date: {date}")


def fetch_weather_for_state(state: str, date: str):
    """
    Fetch average temperature, humidity, and rainfall for entire state by averaging
    data from multiple cities across the state.
    Returns: dict with 'avg_temperature', 'avg_humidity', 'avg_rainfall'
    """
    cities = STATE_TO_CITIES.get(state)
    if not cities:
        raise ValueError(f"No city mapping for state: {state}")
    
    temps = []
    humidities = []
    rainfalls = []
    successful_cities = []
    
    # Fetch weather for each city in the state
    for city in cities:
        try:
            weather_data = fetch_weather_for_city(city, date)
            temps.append(weather_data['temp_c'])
            humidities.append(weather_data['humidity'])
            rainfalls.append(weather_data['precip_mm'])
            successful_cities.append(city)
        except Exception as e:
            print(f"Warning: Failed to fetch weather for {city}: {e}")
            continue
    
    if not temps:
        raise ValueError(f"Could not fetch weather data for any city in {state}")
    
    # Calculate state-wide averages
    avg_temp = round(sum(temps) / len(temps), 1)
    avg_humidity = round(sum(humidities) / len(humidities), 1)
    avg_rainfall = round(sum(rainfalls) / len(rainfalls), 2)
    
    return {
        'avg_temperature': avg_temp,
        'avg_humidity': avg_humidity,
        'avg_rainfall': avg_rainfall,
        'cities_sampled': successful_cities,
        'sample_size': len(successful_cities)
    }


def fetch_weather_stats(state: str):
    """
    Fetch 7-day forecast statistics for entire state by averaging across multiple cities.
    Returns: dict with averaged weather data and daily breakdown
    """
    cities = STATE_TO_CITIES.get(state)
    if not cities:
        raise ValueError(f"No city mapping for state: {state}")
    
    all_city_forecasts = []
    
    # Fetch 7-day forecast for each city
    for city in cities:
        try:
            url = f"{BASE_URL}forecast.json?key={WEATHER_API_KEY}&q={city}&days=7"
            resp = requests.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            forecast_days = data.get('forecast', {}).get('forecastday', [])
            all_city_forecasts.append({
                'city': city,
                'forecast': forecast_days
            })
        except Exception as e:
            print(f"Warning: Failed to fetch forecast for {city}: {e}")
            continue
    
    if not all_city_forecasts:
        raise ValueError(f"Could not fetch forecast data for any city in {state}")
    
    date_aggregates = {}
    
    for city_data in all_city_forecasts:
        for day in city_data['forecast']:
            date = day.get('date')
            day_info = day.get('day', {})
            
            if date not in date_aggregates:
                date_aggregates[date] = {
                    'temps': [],
                    'humidities': [],
                    'rainfalls': []
                }
            
            temp = day_info.get('avgtemp_c')
            humidity = day_info.get('avghumidity')
            rainfall = day_info.get('totalprecip_mm')
            
            if temp is not None:
                date_aggregates[date]['temps'].append(temp)
            if humidity is not None:
                date_aggregates[date]['humidities'].append(humidity)
            if rainfall is not None:
                date_aggregates[date]['rainfalls'].append(rainfall)
    
    # Calculate state-wide averages for each day
    daily_forecast = []
    all_temps = []
    all_humidities = []
    all_rainfalls = []
    
    for date in sorted(date_aggregates.keys()):
        data = date_aggregates[date]
        
        avg_temp = round(sum(data['temps']) / len(data['temps']), 1) if data['temps'] else 0
        avg_humidity = round(sum(data['humidities']) / len(data['humidities']), 1) if data['humidities'] else 0
        avg_rainfall = round(sum(data['rainfalls']) / len(data['rainfalls']), 2) if data['rainfalls'] else 0
        
        daily_forecast.append({
            'date': date,
            'temp_c': avg_temp,
            'humidity': avg_humidity,
            'precip_mm': avg_rainfall
        })
        
        all_temps.append(avg_temp)
        all_humidities.append(avg_humidity)
        all_rainfalls.append(avg_rainfall)
    
    # Overall 7-day averages
    overall_avg_temp = round(sum(all_temps) / len(all_temps), 1) if all_temps else 0
    overall_avg_humidity = round(sum(all_humidities) / len(all_humidities), 1) if all_humidities else 0
    overall_avg_rainfall = round(sum(all_rainfalls) / len(all_rainfalls), 2) if all_rainfalls else 0
    
    return {
        'state': state,
        'avg_temperature': overall_avg_temp,
        'avg_humidity': overall_avg_humidity,
        'avg_rainfall': overall_avg_rainfall,
        'daily_forecast': daily_forecast,
        'cities_sampled': len(all_city_forecasts)
    }
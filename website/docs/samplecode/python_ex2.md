
# Python Sample 2 (Temperature & Humidity API Example)

This sample code demonstrates how to send temperature and humidity data for a specific latitude/longitude location using Miniviz API.
The sending interval is set to 90 seconds. You can stop the execution with Ctrl+C.

```python
import os
import time
from datetime import datetime, timezone
import json
import random
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
API_URL = "https://api.miniviz.net"
LABEL_KEY = "Local_PC"
SEND_INTERVAL = 90  # seconds

# Latitude and longitude (specify coordinates for the location you want to get data from)
LATITUDE = 35.6762  # Tokyo, Japan
LONGITUDE = 139.6503

def read_sensor():
    """Fetch actual temperature and humidity from Open-Meteo API"""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "current_weather": True,
            "hourly": "relativehumidity_2m",
        }
        res = requests.get(url, params=params, timeout=5)
        res.raise_for_status()
        data = res.json()
        temperature = data["current_weather"]["temperature"]
        humidity = data["hourly"]["relativehumidity_2m"][0]
    except Exception as e:
        # Fallback to random values if API call fails
        print(f"Warning: Failed to fetch weather data: {e}, using random values")
        temperature = 15 + random.randint(0, 20)
        humidity = 40 + random.randint(0, 20)
    
    return {
        "temperature": temperature,
        "humidity": humidity
    }

def send_data():
    url = f"{API_URL}/api/project/{PROJECT_ID}?token={TOKEN}"
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    sensor_data = read_sensor()

    response = requests.post(url, json={
        "timestamp": timestamp_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": sensor_data["temperature"],
            "humidity": sensor_data["humidity"]
        }
    })

    if response.ok:
        data = response.json()
        print(f"Send successful (id={data.get('id')}) - Temperature: {sensor_data['temperature']:.1f}°C, Humidity: {sensor_data['humidity']:.1f}%")
    else:
        print(f"Send failed: {response.status_code} {response.text}")

if __name__ == "__main__":
    print("Starting miniviz data send test (press Ctrl+C to stop)")
    while True:
        send_data()
        time.sleep(SEND_INTERVAL)
```


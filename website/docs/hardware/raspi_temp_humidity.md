---
description: Send Raspberry Pi temperature and humidity data to MiniViz with Python and create charts with a minimal HTTP-based flow.
---

# Send temperature & humidity data with Raspberry Pi

This guide is the fastest way to send Raspberry Pi sensor data to MiniViz with Python and visualize it.
Use it when you want a simple HTTP workflow for prototypes, home labs, or monitoring without building a larger IoT stack first.

## What We'll Do
Send data using a temperature and humidity sensor and create graphs.

## Required Items

- Raspberry Pi
- Power supply (AC adapter, etc.)
- Temperature and humidity sensor (DHT11, etc.)

## Steps

1. Install OS on Raspberry Pi and verify startup
2. Connect/read temperature and humidity sensor
3. Run data transmission sample
4. Verify data transmission and create graphs
5. (Bonus) Persist as systemd service

## 1. Install OS on Raspberry Pi and Verify Startup

Install Raspberry Pi OS using Raspberry Pi Imager.

1. Download and install [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Insert SD card and launch Raspberry Pi Imager
3. Select OS (Raspberry Pi OS (64-bit) recommended)
4. Configure from settings (gear icon):
   - Enable SSH
   - Set username and password
   - Configure Wi-Fi (not needed for wired connection)
5. Execute write
6. Insert SD card into Raspberry Pi, connect power and boot
7. Connect via SSH and verify startup

```bash
ssh pi@raspberrypi.local
# or
ssh pi@<Raspberry Pi IP address>
```

## 2. Connect/Read Temperature and Humidity Sensor

### Sensor Connection

Connect a temperature and humidity sensor such as DHT11.

**DHT11 Connection Example:**
- VCC → 3.3V (Pin 1)
- GND → GND (Pin 6)
- DATA → GPIO 4 (Pin 7)

### Install Required Libraries

```bash
sudo apt update
sudo apt install -y python3-pip python3-dev
pip3 install Adafruit_DHT requests
```

### Test Sensor Reading

Test if sensor values can be read with the following Python script.

```python
import Adafruit_DHT

sensor = Adafruit_DHT.DHT11
pin = 4

humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

if humidity is not None and temperature is not None:
    print(f'Temperature: {temperature:.1f}°C')
    print(f'Humidity: {humidity:.1f}%')
else:
    print('Failed to read from sensor')
```

## 3. Run Data Transmission Sample

Create a Python script to send data to MiniViz API.

### Create Script

```bash
nano miniviz_sender.py
```

Write the following content (replace `PROJECT_ID` and `TOKEN` with actual values):

For details, see "3. Send Data (Device Side)" in [Quick Start](../quickstart).

```python
import os
import time
from datetime import datetime, timezone
import Adafruit_DHT
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
API_URL = "https://api.miniviz.net"
LABEL_KEY = "raspberry_pi_home"
SEND_INTERVAL = 90  # seconds

# DHT11 sensor configuration
DHT_SENSOR = Adafruit_DHT.DHT11
DHT_PIN = 4

def read_sensor():
    """Read temperature and humidity from sensor"""
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    return temperature, humidity

def send_data():
    """Send data to MiniViz API"""
    url = f"{API_URL}/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    
    temperature, humidity = read_sensor()
    
    if temperature is None or humidity is None:
        print("Failed to read from sensor")
        return
    
    payload = {
        "timestamp": timestamp_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1)
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.ok:
            data = response.json()
            print(f"Send successful (id={data.get('id')}) - Temperature: {temperature:.1f}°C, Humidity: {humidity:.1f}%")
        else:
            print(f"Send failed: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting MiniViz data transmission (press Ctrl+C to stop)")
    while True:
        send_data()
        time.sleep(SEND_INTERVAL)
```

### Run Script

```bash
python3 miniviz_sender.py
```

If working correctly, data will be sent every 90 seconds and transmission results will be displayed on the console.

## 4. Verify Data Transmission and Create Graphs

### Verify Data Transmission

1. Log in to MiniViz web interface
2. Check sent data from Database menu
3. Verify that temperature and humidity data is displayed

:::tip
It may take up to 30 seconds for the data to appear in the database after it is sent.
:::

### Create Graphs

1. Create graphs from Visualize menu
2. Select graph type (line chart recommended)
3. Select temperature and humidity as data sources
4. Verify that graphs are displayed correctly

For details, see "5. Create Charts" in [Quick Start](../quickstart).

## 5. (Bonus) Persist as systemd Service

Configure as a systemd service to automatically start data transmission when Raspberry Pi boots.

### Create Service File

```bash
sudo nano /etc/systemd/system/miniviz-sender.service
```

Write the following content (replace `/home/pi/miniviz_sender.py` with the actual script path):

```ini
[Unit]
Description=MiniViz Data Sender
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi
ExecStart=/usr/bin/python3 /home/pi/miniviz_sender.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable miniviz-sender.service
sudo systemctl start miniviz-sender.service
```

### Check Service Status

```bash
sudo systemctl status miniviz-sender.service
```

### Check Logs

```bash
sudo journalctl -u miniviz-sender.service -f
```

Now, data transmission will automatically start even after Raspberry Pi reboots.

## Sample Code

This is the full version of the code used in this guide.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="python" label="Python" default>

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

def generate_payload():
    return {
        "system_status": "running"
    }

def send_data():
    url = f"{API_URL}/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    response = requests.post(url, headers=headers, json={
        "timestamp": timestamp_ms,
        "label_key": LABEL_KEY,
        "payload": generate_payload()
    })

    if response.ok:
        data = response.json()
        print(f"Send successful (id={data.get('id')})")
    else:
        print(f"Send failed: {response.status_code} {response.text}")

if __name__ == "__main__":
    print("Starting miniviz data send test (press Ctrl+C to stop)")
    while True:
        send_data()
        time.sleep(SEND_INTERVAL)
```

  </TabItem>
</Tabs>

## Common errors

### Why is my Raspberry Pi data not showing up in MiniViz?

Check the following:

- The sensor can be read locally before sending
- `PROJECT_ID` and `TOKEN` are correct
- The request body includes `timestamp`, `label_key`, and `payload`
- `payload` contains only flat string or number values

### Why do I get a 403 error from MiniViz?

The most common causes are:

- The token is invalid or copied from another project
- The endpoint URL is incorrect
- You are trying to use a plan-limited feature

### Which payload types are not supported?

Avoid these payload value types:

- Nested objects
- Arrays
- Boolean values
- `null`

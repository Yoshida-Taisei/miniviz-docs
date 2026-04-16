
---
description: Send your first IoT data to Miniviz with curl or Python, verify it in the database, and create a chart in minutes.
---

import FaqPageJsonLd from '@site/src/components/FaqPageJsonLd';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const faqItems = [
  {
    question: 'Why is my data not showing up in Miniviz?',
    answer:
      'First check that the project ID and token are correct. Then verify that timestamp, label_key, and payload are included in the JSON body, and confirm that payload only contains flat string or number values. If the database page is still empty, inspect the device-side log and the HTTP response body.',
  },
  {
    question: 'Why do I get a 403 error when sending data or images?',
    answer:
      'A 403 error usually means the token is invalid or the feature is not available on your current plan. For image uploads, Miniviz requires the Pro plan. Re-copy the token from the project screen and confirm that you are calling the correct endpoint.',
  },
  {
    question: 'Which payload types are not supported by Miniviz?',
    answer:
      'Miniviz payload values must be flat strings or numbers. Nested objects, arrays, booleans, and null values are not supported. Keep the payload to 8 keys or fewer and within 400 bytes after JSON encoding.',
  },
];

<FaqPageJsonLd items={faqItems} />

# Quick Start

This page is the fastest way to confirm that Miniviz works for your device workflow.
Use it when you want to send sample sensor data with a simple HTTP POST, see the record in the database, and create your first chart in about 5 minutes before writing full device code.

:::info
AI can help you implement and support faster. See the [AI Guide on the Intro page](/#ai-quick-start-guide) for details.
:::

## 1. Create Miniviz Account / Login

Enter your email address and password to create a new account, or log in with an existing account.

![Account Creation / Login](/images/account_1.png)

## 2. Create Project

Create a project to manage your data.

![Create Project](/images/pj_1.png)

![Create Project](/images/pj_2.png)
![Create Project](/images/pj_3.png)


#### Copy Project ID and Token

Copy the Project ID and Token as they will be needed in the next step.
Click the token icon on the right
![Copy Project ID and Token](/images/pj_4.png)

The token copied here will be used on the device side.
![Copy Project ID and Token](/images/pj_5.png)


## 3. Send Data (Device Side)

Send data from the device side.
We recommend first testing data transmission with curl commands or a simple Python script.

### API Endpoint

```text
POST https://api.miniviz.net/api/project/{project_id}?token={token}
```

### Request Overview
Data transmission to Miniviz API uses the `POST` method. The request body is in JSON format.

### Request Body

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `timestamp`  | number | Yes | Transmission time (UNIX time in milliseconds) |
| `label_key`  | string | Yes | Label to identify the source, such as device name or location |
| `payload`    | object | Yes | Actual measurement values to send. Specify any metric name as the key, and a number or string as the value |

- `payload` supports numbers and strings. You can freely add any metrics.

### Request Example

```json
{
  "timestamp": 1731129600000,
  "label_key": "raspberry_pi_home",
  "payload": {
    "temperature": 25,
    "humidity": 55,
    "switch": "true",
    "system_status": "running"
  }
}
```


### curl Command (Linux/MacOS)

```bash

timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/{project_id}?token={token}" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"Local_PC\",
        \"payload\": {
          \"temperature\": 25,
          \"humidity\": 55,
          \"switch\": \"true\",
          \"system_status\": \"running\"
        }
      }"
```

### Python

### Sample Code

This is the full version of the code used in this guide.

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

def read_sensor():
    """Fetch actual temperature and humidity from Open-Meteo API"""
    try:
        # Using Tokyo coordinates as an example
        LATITUDE = 35.6762
        LONGITUDE = 139.6503
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
        print(f"Warning: Failed to fetch weather data: {e}. Using random values.")
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

  </TabItem>
</Tabs>

## 4. Check Data (Database)
Check data from the Database menu.
Sent data is saved in the database.
※If data is not displayed here, data transmission has failed. Please check the device-side logs again.※

![Check Data (Database)](/images/db_1.png)


## 5. Create Charts
Create charts from the Visualize menu.
You can create charts and configure chart types and data display formats.

![Create Charts](/images/viz_1.png)

After creating a line chart
![Create Charts](/images/viz_2.png)

## 6. Notification Settings
Configure notification destinations such as Slack and Webhooks.
Configure notifications from the Rules menu.

![Notification Settings](/images/alert_1.png)

### Slack Notification Settings
Configure Slack notifications.
Enter the Slack Webhook URL.
![Slack Notification Settings](/images/alert_2.png)

Notifications will be sent when the set threshold is exceeded.
![After Slack Notification Settings](/images/alert_3.png)

## 7. Image Transmission
Pro plan users can send images using the image transmission API.

For details, see [API Endpoint (Image)](./api_endpoint/api_image_reference).

## Common errors

### Why is my data not showing up in Miniviz?

Check the following in order:

- Project ID and token are correct
- The request body includes `timestamp`, `label_key`, and `payload`
- `payload` contains only flat string or number values
- The device log or HTTP response does not show an API error

### Why do I get a 403 error?

The most common causes are:

- The token is invalid or belongs to another project
- You are calling an endpoint that is not available on your plan
- You are using the image API without the Pro plan

### Which payload types are not supported?

Miniviz does not accept these payload value types:

- Nested objects
- Arrays
- Boolean values
- `null`


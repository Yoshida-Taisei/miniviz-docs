
# Python Sample 1 (Simple Data Sending Example)

This sample code demonstrates how to send data to Miniviz API.
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

def generate_payload():
    return {
        "system_status": "running"
    }

def send_data():
    url = f"{API_URL}/api/project/{PROJECT_ID}?token={TOKEN}"
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    response = requests.post(url, json={
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
---
layout: default
title: Pythonサンプル1
parent: リファレンス
nav_order: 1
---

# Pythonサンプル1

このサンプルコードは、Miniviz API を使用してデータを送信するためのものです。
送信間隔は90秒に設定されています。実行中はCtrl+Cで停止できます。

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
        "temperature": 25,
        "humidity": 55,
        "switch": "true",
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
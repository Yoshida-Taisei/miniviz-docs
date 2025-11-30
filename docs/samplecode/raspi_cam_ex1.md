---
layout: default
title: ラズパイカメラサンプル(画像送信)
parent: サンプルコード
nav_order: 3
---

# ラズパイカメラサンプル(USBカメラで撮影して画像を送信)

このサンプルコードは、Raspberry Piに接続されたUSBカメラで撮影した画像をMiniviz APIに送信するためのものです。
`fswebcam`を使用してカメラから画像を取得し、base64エンコードして送信します。
送信間隔は1分に設定されています。実行中はCtrl+Cで停止できます。

## 必要なパッケージ

```bash
sudo apt-get update
sudo apt-get install -y fswebcam python3-pip
pip3 install requests
```


```python
#!/usr/bin/env python3
"""
Raspberry Pi USB Camera to Miniviz
"""
import requests
import base64
import os
import subprocess
import time
from datetime import datetime, timezone

# Miniviz configuration
PROJECT_ID = "PROJECT_ID"
TOKEN = "TOKEN"
API_URL = "https://api.miniviz.net"
LABEL_KEY = "raspberry_pi_cam"

# USB Camera configuration
DEVICE = "/dev/video0"
RESOLUTION = "640x480"
IMAGE_PATH = "image.jpg"

# Send interval (seconds)
SEND_INTERVAL = 60  # 1 minute

def capture_image():
    """Capture image with USB camera"""
    cmd = [
        "fswebcam",
        "-d", DEVICE,
        "-r", RESOLUTION,
        "--no-banner",
        "-S", "5",
        IMAGE_PATH
    ]
    print("[Info] Capturing image...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"[Error] Capture failed: {result.stderr}")
        return False
    
    print("[Info] Image captured successfully")
    return True

def encode_image_to_base64(image_path):
    """Encode image file to base64"""
    with open(image_path, "rb") as f:
        image_data = f.read()
    return base64.b64encode(image_data).decode('utf-8')

def send_image_to_miniviz(image_path):
    """Send image to Miniviz API"""
    url = f"{API_URL}/api/project/{PROJECT_ID}/image"
    
    # Encode image to base64
    image_base64 = encode_image_to_base64(image_path)
    
    # Request payload
    payload = {
        "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
        "label_key": LABEL_KEY,
        "image_name": os.path.basename(image_path),
        "image_base64": image_base64
    }

    try:
        response = requests.post(url, json=payload, params={"token": TOKEN})
        response.raise_for_status()
        print("[Info] Send successful")
        print(response.json())
        return True
    except requests.exceptions.HTTPError as e:
        print(f"[Error] HTTP {e.response.status_code}")
        print(e.response.text)
        return False
    except Exception as e:
        print(f"[Error] {e}")
        return False

def cleanup_image(image_path):
    """Delete sent image file (to save disk space)"""
    try:
        if os.path.exists(image_path):
            os.remove(image_path)
            print(f"[Info] Cleaned up: {image_path}")
    except Exception as e:
        print(f"[Warning] Failed to delete {image_path}: {e}")

def main():
    """Main process"""
    # Capture image with USB camera
    if not capture_image():
        print("[Error] Failed to capture image")
        return
    
    # Send to Miniviz
    success = send_image_to_miniviz(IMAGE_PATH)
    
    # Delete image file only on success (to save disk space)
    if success:
        cleanup_image(IMAGE_PATH)

if __name__ == "__main__":
    print("Starting miniviz image send test (press Ctrl+C to stop)")
    try:
        while True:
            main()
            time.sleep(SEND_INTERVAL)
    except KeyboardInterrupt:
        print("\n[Info] Stopped by user")
```

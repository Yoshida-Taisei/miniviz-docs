---
description: Send Raspberry Pi USB camera images to Miniviz with Python and the image API, then review them from the dashboard.
---

# Send images with Raspberry Pi × USB camera

This page shows the shortest path to capture Raspberry Pi USB camera images and send them to Miniviz.
It is a good fit for simple remote monitoring prototypes where you want image history and dashboard visibility without a complex camera stack.

## What We'll Do
Connect a USB camera to Raspberry Pi and send images to Miniviz.

:::caution
The image transmission feature is only available for the **Pro plan**. It is not available for the free plan.
:::

## Required Items and Environment
* Raspberry Pi
* USB Camera
* Miniviz Project ID and Token

# Connect Raspberry Pi and USB Camera

Connect the USB camera and run the lsusb command.
```
pi@raspberrypi:~ $ lsusb
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 002: ID 0424:2514 Microchip Technology, Inc. (formerly SMSC) USB 2.0 Hub
Bus 001 Device 003: ID 0424:2514 Microchip Technology, Inc. (formerly SMSC) USB 2.0 Hub
Bus 001 Device 004: ID 0424:7800 Microchip Technology, Inc. (formerly SMSC)
Bus 001 Device 007: ID 0411:02da BUFFALO INC. (formerly MelCo., Inc.) USB 2.0 Camera // This is the USB camera
```

You can check the USB camera device file.
```
$ ls /dev/video*
/dev/video0  /dev/video10  /dev/video12  /dev/video14  /dev/video16  /dev/video20  /dev/video22  /dev/video31
/dev/video1  /dev/video11  /dev/video13  /dev/video15  /dev/video18  /dev/video21  /dev/video23
```

## Check Camera Video

```
$ sudo apt-get install fswebcam
$ fswebcam -r 640x480 --no-banner image.jpg
```

Check the image
(The quality is not great, but it's captured.)
![Sample Image](/images/raspi/sample_1.png)


# Send Camera Images to Miniviz

1. Get Project ID and Token
2. Call the image transmission API and send a sample image
3. If there are no issues, call the camera image transmission API to send camera images

## 1. Get Project ID and Token

Get the Project ID and Token.

Create Project -> Get Project ID and Token

<!-- Account -->
![Account](/images/pj_5.png)

## 2. Call Image Transmission API and Send Sample Image

API: Send image in request body
```
POST https://api.miniviz.net/api/project/{project_id}/image
```

Send the project token with the `Authorization: Bearer {token}` header. The legacy `?token={token}` query parameter is still supported for compatibility.

Request Body
```
{
    "timestamp": 1717587812345,
    "label_key": "raspberry_pi_home",
    "image_name": "camera_001.jpg",
    "image_base64": "base64_encoded_image_data"
}
```

### Send Sample Image (Python)

```python
#!/usr/bin/env python3
"""
Send image to miniviz
"""
import requests
import base64
import os
from datetime import datetime, timezone

# Configuration
PROJECT_ID = "PROJECT_ID"
TOKEN = "TOKEN"
API_URL = "https://api.miniviz.net"
IMAGE_PATH = "image.jpg"
LABEL_KEY = "raspberry_pi_cam"

# Encode image to base64
with open(IMAGE_PATH, "rb") as f:
    image_data = f.read()
image_base64 = base64.b64encode(image_data).decode('utf-8')

# Send request
url = f"{API_URL}/api/project/{PROJECT_ID}/image"
headers = {"Authorization": f"Bearer {TOKEN}"}
payload = {
    "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
    "label_key": LABEL_KEY,
    "image_name": os.path.basename(IMAGE_PATH),
    "image_base64": image_base64
}

try:
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    print("✅ Send successful")
    print(response.json())
except requests.exceptions.HTTPError as e:
    print(f"❌ Error: HTTP {e.response.status_code}")
    print(e.response.text)
except Exception as e:
    print(f"❌ Error: {e}")
```


## 3. Send Camera Images

If the sample code works, send camera images.

### Sample Code

This is the full version of the code used in this guide.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="python" label="Python" default>

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
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
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
        response = requests.post(url, headers=headers, json=payload)
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

  </TabItem>
</Tabs>

### Display Images in Database

Check data from the Database menu.
Sent data is saved in the database.
※If data is not displayed here, data transmission has failed. Please check the device-side logs again.※

![Check Data (Database)](/images/raspi/cam_db_3.png)


### Display Images in Visualize

Create graphs from the Visualize menu.
You can configure graph types and data display formats.



![Image Visualize](/images/raspi/cam_viz_2.png)

![Image Visualize](/images/raspi/cam_viz_3.png)

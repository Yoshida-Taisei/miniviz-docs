
# Raspberry PiとUSBカメラを用いた画像送信サンプル

## ここで行うこと
Raspberry PiとUSBカメラを接続してMinivizに画像を送信します。
※画像送信機能はProプランのみです。無料プランでは利用できません。

## 用意するもの・環境
* Raspberry Pi
* USBカメラ
* MinivizのプロジェクトIDとトークン

# Raspberry PiとUSBカメラの接続

USBカメラを接続して lsusb コマンドを実行します。
```
pi@raspberrypi:~ $ lsusb
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 002: ID 0424:2514 Microchip Technology, Inc. (formerly SMSC) USB 2.0 Hub
Bus 001 Device 003: ID 0424:2514 Microchip Technology, Inc. (formerly SMSC) USB 2.0 Hub
Bus 001 Device 004: ID 0424:7800 Microchip Technology, Inc. (formerly SMSC)
Bus 001 Device 007: ID 0411:02da BUFFALO INC. (formerly MelCo., Inc.) USB 2.0 Camera // これがUSBカメラ
```

USBカメラのデバイスファイルが確認できます。
```
$ ls /dev/video*
/dev/video0  /dev/video10  /dev/video12  /dev/video14  /dev/video16  /dev/video20  /dev/video22  /dev/video31
/dev/video1  /dev/video11  /dev/video13  /dev/video15  /dev/video18  /dev/video21  /dev/video23
```

## カメラの映像を確認

```
$ sudo apt-get install fswebcam
$ fswebcam -r 640x480 --no-banner image.jpg
```

画像を確認
(画質はイマイチですがとれています。)
![image](/images/raspi/sample_1.png)


# カメラの画像をMinivizに送信

1. プロジェクトIDとトークンを取得
2. 画像を送信するAPIを呼び出してサンプル画像を送信
3. 問題がなければ、カメラの画像を送信するAPIを呼び出してカメラの画像を送信

## 1. プロジェクトIDとトークンを取得

プロジェクトIDとトークンを取得します。

プロジェクト作成 -> プロジェクトIDとトークンを取得

<!-- アカウント -->
![アカウント](/images/pj_5.png)

## 2. 画像を送信するAPIを呼び出してサンプル画像を送信

API: リクエストボディに画像を送信
```
POST https://api.miniviz.net/api/project/{project_id}/image?token={token}
```

リクエストボディ
```
{
    "timestamp": 1717587812345,
    "label_key": "raspberry_pi_home",
    "image_name": "camera_001.jpg",
    "image_base64": "base64_encoded_image_data"
}
```

### サンプル画像を送信(Python)

```python
#!/usr/bin/env python3
"""
figure image to miniviz
"""
import requests
import base64
import os
from datetime import datetime, timezone

# 設定
PROJECT_ID = "PROJECT_ID"
TOKEN = "TOKEN"
API_URL = "https://api.miniviz.net"
IMAGE_PATH = "image.jpg"
LABEL_KEY = "raspberry_pi_cam"

# 画像をbase64エンコード
with open(IMAGE_PATH, "rb") as f:
    image_data = f.read()
image_base64 = base64.b64encode(image_data).decode('utf-8')

# リクエスト送信
url = f"{API_URL}/api/project/{PROJECT_ID}/image"
payload = {
    "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
    "label_key": LABEL_KEY,
    "image_name": os.path.basename(IMAGE_PATH),
    "image_base64": image_base64
}

try:
    response = requests.post(url, json=payload, params={"token": TOKEN})
    response.raise_for_status()
    print("✅ Send successful")
    print(response.json())
except requests.exceptions.HTTPError as e:
    print(f"❌ Error: HTTP {e.response.status_code}")
    print(e.response.text)
except Exception as e:
    print(f"❌ Error: {e}")
```


## 3. カメラの画像を送信

サンプルコードが問題なければ、カメラの画像を送信します。

### サンプルコード
コードはこちらを参照してください。
[サンプルコード](../samplecode/raspi_cam_ex1)

### 画像をデータベースで表示

データベースメニューからデータを確認します。
送信されたデータはデータベースに保存されます。
※ここに表示されない場合はデータ送信が失敗しています。再度デバイス側のログなどを確認してください。※

![データの確認(データベース)](/images/raspi/cam_db_3.png)


### 画像をVisualizeで表示

Visualizeメニューからグラフを作成します。
グラフの種類やデータの表示形式などを設定できます。



![画像のVisualize](/images/raspi/cam_viz_2.png)

![画像のVisualize](/images/raspi/cam_viz_3.png)

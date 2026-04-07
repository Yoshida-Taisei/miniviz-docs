
# クイックスタート

:::info
AI を活用するとより素早く実装やサポートが可能です。詳細は [はじめにの AI ガイド](/#ai-用クイックスタートガイド) をご覧ください。
:::

## 1. Minivizアカウント作成/ログイン

メールアドレス・パスワードを入力して新規登録するか、既存のアカウントでログインします。

![アカウント作成/ログイン](/images/account_1.png)

## 2. プロジェクト作成
データを管理するためのプロジェクトを作成します。

![プロジェクト作成](/images/pj_1.png)

![プロジェクト作成](/images/pj_2.png)
![プロジェクト作成](/images/pj_3.png)


#### プロジェクトID・トークンのコピー
次項で必要になるため、プロジェクトID・トークンをコピーしておきます。
右側のトークンアイコンをクリック
![プロジェクトID・トークンのコピー](/images/pj_4.png)

ここでコピーしたトークンは、デバイス側で使用します。
![プロジェクトID・トークンのコピー](/images/pj_5.png)


## 3. (デバイス側)データ送信
デバイス側でデータを送信します。
まずはcurlコマンドや簡易のPythonスクリプトでデータ送信できるか確認することをお勧めします。

### APIエンドポイント

```text
POST https://api.miniviz.net/api/project/{project_id}?token={token}
```

### リクエスト概要
Miniviz API へのデータ送信は `POST` メソッドを使用します。送信ボディは JSON 形式です。

### リクエストボディ

| フィールド名 | 型 | 必須 | 説明 |
|--------------|----|------|------|
| `timestamp`  | number | Yes | 送信時刻（UNIX 時間ミリ秒） |
| `label_key`  | string | Yes | デバイス名や設置場所など、送信元を識別するラベル |
| `payload`    | object | Yes | 実際に送信する計測値。キーに任意の指標名、値に数値または文字列を指定 |

- `payload` では数値と文字列をサポートしています。各指標は自由に追加できます。

### リクエスト例

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


### curlコマンド(Linux/MacOS)

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

### サンプルコード

このガイドで使用したコードの完全版です。

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

def read_sensor():
    """Open-Meteo APIから実際の温度・湿度を取得する"""
    try:
        # 東京の座標を例として使用
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
        # API呼び出しに失敗した場合はランダムな値を返す
        print(f"Warning: 天気データの取得に失敗しました: {e}。ランダムな値を使用します。")
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
        print(f"送信成功 (id={data.get('id')}) - 温度: {sensor_data['temperature']:.1f}°C, 湿度: {sensor_data['humidity']:.1f}%")
    else:
        print(f"送信失敗: {response.status_code} {response.text}")

if __name__ == "__main__":
    print("Starting miniviz data send test (press Ctrl+C to stop)")
    while True:
        send_data()
        time.sleep(SEND_INTERVAL)
```

  </TabItem>
</Tabs>

## 4. データの確認(データベース)
Databaseメニューからデータを確認します。
送信されたデータはデータベースに保存されます。
※ここに表示されない場合はデータ送信が失敗しています。再度デバイス側のログなどを確認してください。※

![データの確認(データベース)](/images/db_1.png)


## 5. グラフ作成
Visualizeメニューからグラフを作成します。
グラフを作成します。グラフの種類やデータの表示形式などを設定できます。

![グラフ作成](/images/viz_1.png)

ラインチャート作成後
![グラフ作成](/images/viz_2.png)

## 6. 通知設定
SlackやWebhookなどの通知先を設定します。
Rulesメニューから通知設定を行います。

![通知設定](/images/alert_1.png)

### Slack通知設定
Slack通知設定を行います。
SlackのWebhook URLを入力します。
![Slack通知設定](/images/alert_2.png)

設定した閾値を超えた場合に通知が行われます。
![Slack通知設定後](/images/alert_3.png)

## 7. 画像送信
Proプランでは画像送信APIを用いて画像を送信することができます。

詳細は[APIエンドポイント(画像)](./api_endpoint/api_image_reference)を参照してください。
---
description: Raspberry Pi の温湿度データを Python と HTTP で Miniviz に送り、最小構成でグラフ化する手順を解説します。
---

# Raspberry Pi で温湿度データを送る

このガイドは、Raspberry Pi のセンサーデータを Python で Miniviz に送り、可視化/グラフ化する最短手順です。
まずは大きな IoT アーキテクチャを組まずに、試作や自宅監視をシンプルな HTTP フローで始めたい場合に向いています。

## ここで行うこと
温度・湿度センサーを用いてデータを送信し、グラフを作成するサンプルを作成します。

## 必要なもの

- Raspberry Pi
- 電源(ACアダプターなど)
- 温度・湿度センサー(DHT11など)

## 手順

1. Raspberry PiへOSをインストール、起動確認
2. 温度・湿度センサーを接続/取得
3. データ送信サンプルを実行
4. データ送信確認・グラフ作成
5. (おまけ)systemdサービスとして永続化

## 1. Raspberry PiへOSをインストール、起動確認

Raspberry Pi Imagerを使用してRaspberry Pi OSをインストールします。

1. [Raspberry Pi Imager](https://www.raspberrypi.com/software/)をダウンロード・インストール
2. SDカードを挿入し、Raspberry Pi Imagerを起動
3. OSを選択（Raspberry Pi OS (64-bit)推奨）
4. 設定（歯車アイコン）から以下を設定：
   - SSHを有効化
   - ユーザー名・パスワードを設定
   - Wi-Fi設定（有線接続の場合は不要）
5. 書き込みを実行
6. SDカードをRaspberry Piに挿入し、電源を接続して起動
7. SSHで接続して起動確認

```bash
ssh pi@raspberrypi.local
# または
ssh pi@<Raspberry PiのIPアドレス>
```

## 2. 温度・湿度センサーを接続/取得

### センサーの接続

DHT11などの温度・湿度センサーを接続します。

**DHT11の接続例：**
- VCC → 3.3V (Pin 1)
- GND → GND (Pin 6)
- DATA → GPIO 4 (Pin 7)

### 必要なライブラリのインストール

```bash
sudo apt update
sudo apt install -y python3-pip python3-dev
pip3 install Adafruit_DHT requests
```

### センサー値取得のテスト

以下のPythonスクリプトでセンサー値が取得できるか確認します。

```python
import Adafruit_DHT

sensor = Adafruit_DHT.DHT11
pin = 4

humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

if humidity is not None and temperature is not None:
    print(f'温度: {temperature:.1f}°C')
    print(f'湿度: {humidity:.1f}%')
else:
    print('センサーからの読み取りに失敗しました')
```

## 3. データ送信サンプルを実行

Miniviz APIにデータを送信するPythonスクリプトを作成します。

### スクリプトの作成

```bash
nano miniviz_sender.py
```

以下の内容を記述します（`PROJECT_ID`と`TOKEN`は実際の値に置き換えてください）：

詳細は[クイックスタート](../quickstart)の「3. (デバイス側)データ送信」を参照してください。

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

# DHT11センサーの設定
DHT_SENSOR = Adafruit_DHT.DHT11
DHT_PIN = 4

def read_sensor():
    """センサーから温度・湿度を読み取る"""
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    return temperature, humidity

def send_data():
    """Miniviz APIにデータを送信"""
    url = f"{API_URL}/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    
    temperature, humidity = read_sensor()
    
    if temperature is None or humidity is None:
        print("センサーからの読み取りに失敗しました")
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
        response = requests.post(url, json=payload, headers=headers)
        if response.ok:
            data = response.json()
            print(f"送信成功 (id={data.get('id')}) - 温度: {temperature:.1f}°C, 湿度: {humidity:.1f}%")
        else:
            print(f"送信失敗: {response.status_code} {response.text}")
    except Exception as e:
        print(f"エラー: {e}")

if __name__ == "__main__":
    print("Minivizデータ送信を開始します (Ctrl+Cで停止)")
    while True:
        send_data()
        time.sleep(SEND_INTERVAL)
```

### スクリプトの実行

```bash
python3 miniviz_sender.py
```

正常に動作している場合、90秒ごとにデータが送信され、コンソールに送信結果が表示されます。

## 4. データ送信確認・グラフ作成

### データ送信の確認

1. MinivizのWebインターフェースにログイン
2. Databaseメニューから送信されたデータを確認
3. 温度・湿度のデータが表示されていることを確認

:::tip
データが送信されてからデータベースに反映されるまで、最大 30 秒ほどかかる場合があります。
:::

### グラフの作成

1. Visualizeメニューからグラフを作成
2. グラフタイプを選択（ラインチャート推奨）
3. データソースとして温度・湿度を選択
4. グラフが正常に表示されることを確認

詳細は[クイックスタート](../quickstart)の「5. グラフ作成」を参照してください。

## 5. (おまけ)systemdサービスとして永続化

Raspberry Pi起動時に自動的にデータ送信を開始するように、systemdサービスとして設定します。

### サービスファイルの作成

```bash
sudo nano /etc/systemd/system/miniviz-sender.service
```

以下の内容を記述します（`/home/pi/miniviz_sender.py`は実際のスクリプトのパスに置き換えてください）：

```ini
[Unit]
Description=Miniviz Data Sender
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

### サービスの有効化と起動

```bash
sudo systemctl daemon-reload
sudo systemctl enable miniviz-sender.service
sudo systemctl start miniviz-sender.service
```

### サービスの状態確認

```bash
sudo systemctl status miniviz-sender.service
```

### ログの確認

```bash
sudo journalctl -u miniviz-sender.service -f
```

これで、Raspberry Piを再起動しても自動的にデータ送信が開始されます。

## サンプルコード

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

def generate_payload():
    return {
        "system_status": "running"
    }

def send_data():
    url = f"{API_URL}/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    response = requests.post(url, json={
        "timestamp": timestamp_ms,
        "label_key": LABEL_KEY,
        "payload": generate_payload()
    }, headers=headers)

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

## よくあるエラー

### Raspberry Pi のデータが Miniviz に表示されない原因は？

次を確認してください。

- センサー値がローカルで正しく読めている
- `PROJECT_ID` と `TOKEN` を正しく設定している
- リクエストボディに `timestamp`、`label_key`、`payload` が含まれている
- `payload` がフラットな文字列または数値だけで構成されている

### Miniviz から 403 エラーが返るのはなぜ？

よくある原因は次の通りです。

- トークンが無効、または別プロジェクトのものを使っている
- エンドポイント URL が誤っている
- プラン制限のある機能を使おうとしている

### payload に送れない型は？

次の payload 値は避けてください。

- ネストしたオブジェクト
- 配列
- 真偽値
- `null`

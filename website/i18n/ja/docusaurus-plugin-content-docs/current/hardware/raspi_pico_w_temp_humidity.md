---
description: Raspberry Pi Pico W の温湿度データを MicroPython とシンプルな HTTP 送信で Miniviz に送る手順です。
---

# Raspberry Pi Pico W で温湿度データを送る

Raspberry Pi Pico W と DHT11 を使って、温度・湿度データを取得し、Miniviz に送信して可視化/グラフ化する手順をまとめます。  
IoT のプロトタイプや電子工作の入門用途におすすめの構成です。

## やること

Raspberry Pi Pico W と温湿度センサー DHT11 を使って、温度・湿度データを取得し、Miniviz 上で可視化/グラフ化します。

## 用意するもの

- Raspberry Pi Pico W（以下、ラズパイPico）
- DHT11（温度・湿度センサー）
- ブレッドボードとジャンパーワイヤー
- MicroPython 実行環境
- Miniviz のプロジェクト ID とトークン

## ラズパイPicoとDHT11を配線

写真のように配線します。

![配線写真](/images/pico/pico_1_01.png)

### ピン配置

| Pico のピン番号 | 接続先 | 役割 |
| --- | --- | --- |
| `36` | `VCC` | 電源 |
| `20` (`GP15`) | `DATA` | 信号 |
| `38` | `GND` | 接地 |

![ピン配色（黄 VCC、青 GND、緑 GP15）](/images/pico/pico_1_02.png)

## データを取得する

### VS Code / MicroPython を導入

今回は VS Code の MicroPython 拡張機能を使います。

- 拡張機能 `MicroPico` を導入  
  Pico との通信やコード転送を一括管理できるようになります。
- コマンドパレット（`Ctrl+Shift+P`）から `MicroPico: Configure project` を実行  
  Pico 用の補完機能や接続設定がフォルダ内に作成されます。

![拡張機能の画面](/images/pico/pico_1_03.png)

![画面下部の操作メニュー](/images/pico/pico_1_04.png)

### Picoファームウェアのインストール

1. 公式サイトから、自分のボード（Pico または Pico W）に合った `UF2` ファイルをダウンロードします。
2. 本体の `BOOTSEL` ボタンを押しながら USB 接続します。
3. Pico が外付けドライブとして認識されたら、`UF2` ファイルをコピーします。
4. 自動で再起動したら準備完了です。

[MicroPython on Raspberry Pi Pico](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html#drag-and-drop-micropython)

### サンプルコード

このガイドで使用したコードの完全版です。

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="python" label="Python (MicroPython)" default>

```python
import network
import urequests
import time
import machine
import dht
import ntptime

# ================= Configuration =================
WIFI_SSID  = "YOUR_WIFI_SSID"       # Wi-Fi SSID
WIFI_PASS  = "YOUR_WIFI_PASSWORD"   # Wi-Fi Password
PROJECT_ID = "YOUR_PROJECT_ID"      # Miniviz Project ID
TOKEN      = "YOUR_TOKEN"           # Miniviz API Token
LABEL_KEY  = "PicoW_DHT"            # Label for the device
SEND_INTERVAL = 120                 # Interval between sends (seconds)
# =================================================

# Hardware Setup
dht_sensor = dht.DHT11(machine.Pin(15))
try:
    led = machine.Pin("LED", machine.Pin.OUT)
except ValueError:
    led = machine.Pin(25, machine.Pin.OUT)

def connect_wifi():
    """Connect to Wi-Fi and sync time via NTP"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASS)

    print(f"Connecting to {WIFI_SSID}...", end="")
    while not wlan.isconnected():
        led.toggle()
        time.sleep(0.5)

    print("\n✅ Wi-Fi Connected!")
    led.off()

    # Attempt time synchronization using NTP
    ntptime.host = "ntp.nict.jp"
    try:
        print("Syncing time via NTP...", end="")
        ntptime.settime()
        print(" Done!")
    except:
        print(" Failed (Using internal clock)")

def send_data_to_miniviz(temp, hum):
    """Send measurement data to Miniviz and log details"""
    url = f"https://api.miniviz.net/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}

    # Calculate UNIX timestamp in milliseconds
    # Assuming time.time() is synced to 1970 Epoch
    unix_time_sec = time.time()
    ts_ms = int(unix_time_sec * 1000)

    # Create Miniviz-compliant payload
    payload = {
        "timestamp": ts_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": temp,
            "humidity": hum
        }
    }

    print("\n" + "=" * 40)
    print("📡 Data Packet Prepared")
    print(f"  [Timestamp] {ts_ms}")
    print(f"  [Label]     {LABEL_KEY}")
    print(f"  [Metrics]   Temp: {temp}°C, Humidity: {hum}%")
    print("-" * 40)

    try:
        print("🚀 Sending request to Miniviz...", end="")
        res = urequests.post(url, json=payload, headers=headers)

        if res.status_code in [200, 201]:
            print(f"\n✅ Success! (Status: {res.status_code})")
            print(f"  Response: {res.text}")
            # Blink LED twice on successful transmission
            for _ in range(2):
                led.on()
                time.sleep(0.1)
                led.off()
                time.sleep(0.1)
        else:
            print(f"\n❌ Server Error (Status: {res.status_code})")
            print(f"  Reason: {res.text}")

        res.close()
    except Exception as e:
        print(f"\n⚠️ Network/Connection Error: {e}")
    print("=" * 40)

def main():
    connect_wifi()

    print("\nStarting Telemetry (Ctrl+C to stop)")

    while True:
        try:
            # Read from sensor
            dht_sensor.measure()
            t = dht_sensor.temperature()
            h = dht_sensor.humidity()

            # Send data
            send_data_to_miniviz(t, h)

        except OSError as e:
            print(f"❌ Sensor Read Error: {e}")

        # Wait for the next interval
        time.sleep(SEND_INTERVAL)

if __name__ == "__main__":
    main()
```

  </TabItem>
</Tabs>

## Minivizに送信する

### プロジェクトIDとトークンを取得

先ほどのコードに Wi-Fi 接続、時刻同期、HTTP リクエストを追加して、`Miniviz` に送信します。

まずはプロジェクトを作成し、プロジェクト ID とトークンを取得してください。  
詳細はクイックリファレンスを参照してください。

![プロジェクト ID とトークンの取得画面](/images/pico/pico_1_06.png)

### Minivizに送信するソースコード

Wi-Fi 情報、プロジェクト ID、トークンは自分の環境に合わせて書き換えてください。

```python
import network
import urequests
import time
import machine
import dht
import ntptime

# ================= Configuration =================
WIFI_SSID  = "YOUR_WIFI_SSID"       # Wi-Fi SSID
WIFI_PASS  = "YOUR_WIFI_PASSWORD"   # Wi-Fi Password
PROJECT_ID = "YOUR_PROJECT_ID"      # Miniviz Project ID
TOKEN      = "YOUR_TOKEN"           # Miniviz API Token
LABEL_KEY  = "PicoW_DHT"            # Label for the device
SEND_INTERVAL = 120                 # Interval between sends (seconds)
# =================================================

# Hardware Setup
dht_sensor = dht.DHT11(machine.Pin(15))
try:
    led = machine.Pin("LED", machine.Pin.OUT)
except ValueError:
    led = machine.Pin(25, machine.Pin.OUT)

def connect_wifi():
    """Connect to Wi-Fi and sync time via NTP"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASS)

    print(f"Connecting to {WIFI_SSID}...", end="")
    while not wlan.isconnected():
        led.toggle()
        time.sleep(0.5)

    print("\n✅ Wi-Fi Connected!")
    led.off()

    # Attempt time synchronization using NTP
    ntptime.host = "ntp.nict.jp"
    try:
        print("Syncing time via NTP...", end="")
        ntptime.settime()
        print(" Done!")
    except:
        print(" Failed (Using internal clock)")

def send_data_to_miniviz(temp, hum):
    """Send measurement data to Miniviz and log details"""
    url = f"https://api.miniviz.net/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}

    # Calculate UNIX timestamp in milliseconds
    # Assuming time.time() is synced to 1970 Epoch
    unix_time_sec = time.time()
    ts_ms = int(unix_time_sec * 1000)

    # Create Miniviz-compliant payload
    payload = {
        "timestamp": ts_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": temp,
            "humidity": hum
        }
    }

    print("\n" + "=" * 40)
    print("📡 Data Packet Prepared")
    print(f"  [Timestamp] {ts_ms}")
    print(f"  [Label]     {LABEL_KEY}")
    print(f"  [Metrics]   Temp: {temp}°C, Humidity: {hum}%")
    print("-" * 40)

    try:
        print("🚀 Sending request to Miniviz...", end="")
        res = urequests.post(url, json=payload, headers=headers)

        if res.status_code in [200, 201]:
            print(f"\n✅ Success! (Status: {res.status_code})")
            print(f"  Response: {res.text}")
            # Blink LED twice on successful transmission
            for _ in range(2):
                led.on()
                time.sleep(0.1)
                led.off()
                time.sleep(0.1)
        else:
            print(f"\n❌ Server Error (Status: {res.status_code})")
            print(f"  Reason: {res.text}")

        res.close()
    except Exception as e:
        print(f"\n⚠️ Network/Connection Error: {e}")
    print("=" * 40)

def main():
    connect_wifi()

    print("\nStarting Telemetry (Ctrl+C to stop)")

    while True:
        try:
            # Read from sensor
            dht_sensor.measure()
            t = dht_sensor.temperature()
            h = dht_sensor.humidity()

            # Send data
            send_data_to_miniviz(t, h)

        except OSError as e:
            print(f"❌ Sensor Read Error: {e}")

        # Wait for the next interval
        time.sleep(SEND_INTERVAL)

if __name__ == "__main__":
    main()
```

実行すると、送信ログが表示されます。

![送信成功時のログ](/images/pico/pico_1_07.png)

## Miniviz上で確認する

`Database` メニューから送信したデータを確認できます。  
反映まで 30 秒ほどかかる場合があります。

![Database 画面](/images/pico/pico_1_08.png)

## グラフ化する

`Viz` メニューからグラフを作成できます。  
今回はラインチャートを選択します。

![グラフ設定画面](/images/pico/pico_1_09.png)

![作成されたラインチャート](/images/pico/pico_1_10.png)

## まとめ

今回はラズパイPicoを使って、温度・湿度の可視化/グラフ化を簡単に行いました。  
`Miniviz` ではこのほかにもさまざまなセンサーデータや画像を扱えるので、ぜひ試してみてください。

## モニター募集

Pro プランのモニターを募集しています。  
個人・学生・企業など、使ってフィードバックをいただける方に一定期間 Pro プランを提供します。詳細は問い合わせや DM でお願いします。

通常 2 週間の無料トライアルもあります。画像も扱える Pro プランもぜひご利用ください。

[Miniviz - IoT Data Visualization & Graphing Platform](https://miniviz.net)

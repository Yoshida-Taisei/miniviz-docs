---
description: SwitchBot CO2 センサーの CO2・温湿度データを Raspberry Pi 経由で Miniviz に送り、柔軟に可視化/グラフ化する手順です。
---

# SwitchBot CO2データを保存・可視化/グラフ化する（Miniviz / Raspberry Pi）

このページでは、SwitchBot CO2 センサーのデータを Raspberry Pi で取得し、Miniviz に送って可視化/グラフ化や通知につなげる方法を紹介します。
純正アプリだけでは足りない、自由なダッシュボード化や自動化をしたい場合に向いています。

## ここで行うこと

SwitchBot CO2センサーのデータをMinivizに送信して、データベースに温度・湿度・CO2濃度を保存し、グラフを作成します。SwitchBotアプリでもデータを確認できますが、Minivizへ送信することで、より柔軟なデータ活用が可能になります。

:::info
API連携では温湿度の値が取得できないため、今回はBLEを用いてデータを取得します。
:::

## 活用イメージ

- CO2・温度・湿度のグラフ化
- 農業分野（ハウス栽培）での環境監視
- 各部屋ごとのCO2比較・管理
- CO2や温湿度をトリガーにしたWebhook連携やファン稼働

## 必要なもの

- Raspberry Pi（Raspberry Pi 3 B+ / Zero 2 W など）
- SwitchBot CO2センサー
- MinivizのプロジェクトIDとトークン

## MinivizのプロジェクトIDとトークンを取得

プロジェクトIDとトークンを取得します。プロジェクトを作成し、プロジェクト詳細画面から確認してください。詳細は[クイックスタート](../quickstart)を参照してください。

## 手順

1. ローカルPCを使ってCO2センサーのデバイスIDを取得
2. Minivizにデータを送信するスクリプトを作成
3. Raspberry Piでスクリプトを常時稼働
4. Minivizでデータベースとグラフを確認

## 1. CO2センサーのBLEアドバタイズを受信してデバイスIDを取得

まずはセンサーのデバイスIDを取得します。ローカルPCで以下のスクリプトを実行し、近くにあるSwitchBot CO2センサーのBLEアドバタイズを確認します。

### デバイスID取得スクリプト

```python
import asyncio
from dataclasses import dataclass
import json
import time
from typing import Dict, Optional

from bleak import BleakScanner
from bleak.exc import BleakError


def _hex(b: bytes) -> str:
    return b.hex()


def decode_meter_like(rest: bytes) -> Optional[dict]:
    """
    meter_sw.md を参考に、restから温度/湿度/CO2をデコード（暫定）。
    """
    if len(rest) < 8:
        return None

    b3 = rest[2]
    b4 = rest[3]
    b5 = rest[4]

    temp_dec = b3 & 0x0F
    temp_sign = 1 if (b4 & 0x80) else -1
    temp_int = b4 & 0x7F
    temperature_c = temp_sign * (temp_int + temp_dec / 10.0)

    humidity = b5 & 0x7F
    co2 = int.from_bytes(rest[6:8], "little", signed=False)

    return {
        "temperature_c": temperature_c,
        "humidity": humidity,
        "co2": co2,
        "raw": rest.hex(),
        "b3": b3,
        "b4": b4,
        "b5": b5,
    }


@dataclass
class Seen:
    address: str
    name: str
    rssi: Optional[int]
    manufacturer_data: Dict[int, str]
    service_data: Dict[str, str]
    service_uuids: str


# settings
TARGET_DEVICE_ID = ""  # SwitchBot CO2センサーのデバイスID

NAME_CONTAINS = ""
SCAN_SECONDS = 30
SCAN_FOREVER = False
SKIP_APPLE = True
PRINT_ONLY_ON_CHANGE = True
SWITCHBOT_MFR_ID = 0x0969
ONLY_SWITCHBOT = True
DEBUG_RAW = True


async def main() -> None:
    seen: Dict[str, Seen] = {}
    last_fp: Dict[str, str] = {}

    def callback(device, adv_data):
        name = (adv_data.local_name or device.name or "").strip()
        if NAME_CONTAINS and NAME_CONTAINS.lower() not in name.lower():
            return

        rssi = getattr(adv_data, "rssi", None)
        if rssi is None:
            rssi = getattr(device, "rssi", None)

        raw_md = adv_data.manufacturer_data or {}

        if ONLY_SWITCHBOT and SWITCHBOT_MFR_ID not in raw_md:
            return

        if SKIP_APPLE and 76 in raw_md and SWITCHBOT_MFR_ID not in raw_md:
            return

        md = {k: _hex(v) for k, v in raw_md.items()}
        sd = {k: _hex(v) for k, v in (adv_data.service_data or {}).items()}
        su = ",".join(adv_data.service_uuids or [])

        fp = f"{name}|{rssi}|{md.get(SWITCHBOT_MFR_ID)}|{sd.get('0000fd3d-0000-1000-8000-00805f9b34fb')}"
        if PRINT_ONLY_ON_CHANGE and last_fp.get(device.address) == fp:
            return
        last_fp[device.address] = fp

        seen[device.address] = Seen(
            address=device.address,
            name=name or "(no name)",
            rssi=rssi,
            manufacturer_data=md,
            service_data=sd,
            service_uuids=su,
        )

        if SWITCHBOT_MFR_ID in md:
            v = md[SWITCHBOT_MFR_ID]
            raw = bytes.fromhex(v)
            if len(raw) >= 6:
                dev_id = raw[:6].hex().upper()
                rest = raw[6:]
                if TARGET_DEVICE_ID and dev_id != TARGET_DEVICE_ID:
                    return

                decoded = decode_meter_like(rest)
                if not decoded:
                    return

                batt = None
                fd3d_hex = sd.get("0000fd3d-0000-1000-8000-00805f9b34fb")
                if fd3d_hex:
                    raw_sd = bytes.fromhex(fd3d_hex)
                    if raw_sd:
                        batt = raw_sd[-1] & 0x7F

                out = {
                    "ts_ms": int(time.time() * 1000),
                    "dev_id": dev_id,
                    "temp_c": round(decoded["temperature_c"], 1),
                    "humidity": decoded["humidity"],
                    "co2": decoded["co2"],
                    "battery": batt,
                    "rssi": rssi,
                }
                if DEBUG_RAW:
                    out["rest_hex"] = rest.hex()
                    out["fd3d"] = fd3d_hex
                print(json.dumps(out, ensure_ascii=False))

    mode = "forever" if SCAN_FOREVER else f"{SCAN_SECONDS}s"
    print(f"Scanning... ({mode}) device_id={TARGET_DEVICE_ID or '(any)'}")
    async with BleakScanner(detection_callback=callback):
        if SCAN_FOREVER:
            while True:
                await asyncio.sleep(3600)
        else:
            await asyncio.sleep(SCAN_SECONDS)

    if not seen:
        print("No advertisements found. センサーの近くで実行/センサーを起こす(ボタン) を試して。")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except BleakError as e:
        msg = str(e)
        print("\n[BLEAK ERROR]", msg)
        if "not authorized" in msg.lower():
            print(
                "\nmacOSでBluetooth権限が未許可です。下記を確認してください。\n"
                "- システム設定 -> プライバシーとセキュリティ -> Bluetooth\n"
                "  で、実行しているアプリ（Terminal / iTerm / Cursor など）をON\n"
                "- いったんターミナルを再起動して、再実行\n"
                "\n補足: 権限は「python」ではなく「それを起動したアプリ」に紐づくことが多いです。"
            )
        raise
```

### 実行例

実行すると近くのデバイスが反応します。ここで `"dev_id": "AABBCCDDEEFF"` の値を控えておいてください。

```bash
python3 sw_ble_adv_scan.py
```

```json
{"ts_ms": 1773046541493, "dev_id": "AABBCCDDEEFF", "temp_c": 19.4, "humidity": 45, "co2": 268, "battery": null, "rssi": -78, "rest_hex": "116404932d000c01b700", "fd3d": null}
```

## 2. Minivizへデータを送信する

### 設定項目

スクリプト内の設定値を入力してください。

```python
# ===== ユーザー設定 =====
MINIVIZ_API_URL = "https://api.miniviz.net"
MINIVIZ_PROJECT_ID = "PROJECT_ID"  # MinivizのプロジェクトID
MINIVIZ_TOKEN = "PROJECT_TOKEN"  # トークン

# Miniviz上での送信元ラベル（デバイス名/設置場所など）
LABEL_KEY = "switchbot_meterpro_co2"

# Freeなら60秒、Proなら15秒（今回は120秒）
SEND_INTERVAL_SECONDS = 120

# SwitchBot BLE
SWITCHBOT_MFR_ID = 0x0969
TARGET_DEVICE_ID = "TARGET_DEVICE_ID"  # 先ほど取得したデバイスID
# ===== ここまで =====
```

### 送信スクリプト

```python
"""
SwitchBot MeterPro(CO2) のBLEアドバタイズから取得した値を Miniviz にPOSTする。

前提:
  pip install bleak requests

Miniviz API:
  POST https://api.miniviz.net/api/project/{project_id}?token={token}
"""

import asyncio
import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, Optional

import requests
from bleak import BleakScanner


# ===== ユーザー設定 =====
MINIVIZ_API_URL = "https://api.miniviz.net"
MINIVIZ_PROJECT_ID = "PROJECT_ID"
MINIVIZ_TOKEN = "PROJECT_TOKEN"

# Miniviz上での送信元ラベル（デバイス名/設置場所など）
LABEL_KEY = "switchbot_meterpro_co2"

# Freeなら60秒、Proなら15秒(今回は120秒)
SEND_INTERVAL_SECONDS = 120

# SwitchBot BLE
SWITCHBOT_MFR_ID = 0x0969
TARGET_DEVICE_ID = "TARGET_DEVICE_ID"  # 空なら最初に見つかった0x0969のデバイスを使う
# ===== ここまで =====


def decode_meter_like(rest: bytes) -> Optional[dict]:
    """
    SwitchBotAPI-BLE(meter.md) の温湿度の持ち方を参考にデコード。
    MeterPro(CO2)の観測では CO2 が rest[6:8] little-endian っぽい。
    """
    if len(rest) < 8:
        return None

    # meter.md: Byte3=小数(下位4bit), Byte4=符号+整数, Byte5=湿度(下位7bit)
    b3 = rest[2]
    b4 = rest[3]
    b5 = rest[4]

    temp_dec = b3 & 0x0F
    temp_sign = 1 if (b4 & 0x80) else -1
    temp_int = b4 & 0x7F
    temperature_c = temp_sign * (temp_int + temp_dec / 10.0)

    humidity = b5 & 0x7F
    co2 = int.from_bytes(rest[6:8], "little", signed=False)

    return {"temperature_c": temperature_c, "humidity": humidity, "co2": co2}


@dataclass
class Reading:
    dev_id: str
    temperature_c: float
    humidity: int
    co2: int
    battery: Optional[int]
    rssi: Optional[int]


async def read_once_from_ble() -> Reading:
    """
    0x0969の広告を1回拾ってReadingを返す（最大30秒待つ）。
    """
    found: Optional[Reading] = None

    def callback(device, adv_data):
        nonlocal found
        if found is not None:
            return

        raw_md = adv_data.manufacturer_data or {}
        if SWITCHBOT_MFR_ID not in raw_md:
            return

        raw = raw_md[SWITCHBOT_MFR_ID]
        if len(raw) < 6:
            return

        dev_id = raw[:6].hex().upper()
        if TARGET_DEVICE_ID and dev_id != TARGET_DEVICE_ID:
            return

        rest = raw[6:]
        decoded = decode_meter_like(rest)
        if not decoded:
            return

        # battery: service_data fd3d の末尾（&0x7F）
        battery = None
        fd3d_uuid = "0000fd3d-0000-1000-8000-00805f9b34fb"
        sd = adv_data.service_data or {}
        if fd3d_uuid in sd and sd[fd3d_uuid]:
            battery = sd[fd3d_uuid][-1] & 0x7F

        rssi = getattr(adv_data, "rssi", None)
        if rssi is None:
            rssi = getattr(device, "rssi", None)

        found = Reading(
            dev_id=dev_id,
            temperature_c=float(decoded["temperature_c"]),
            humidity=int(decoded["humidity"]),
            co2=int(decoded["co2"]),
            battery=battery,
            rssi=rssi,
        )

    async with BleakScanner(detection_callback=callback):
        # 最大30秒待つ
        for _ in range(30):
            if found is not None:
                break
            await asyncio.sleep(1)

    if found is None:
        raise RuntimeError("BLE広告が見つかりませんでした。センサーの近くで実行/センサーを起こす(ボタン)を試して。")
    return found


def post_to_miniviz(reading: Reading) -> None:
    url = f"{MINIVIZ_API_URL}/api/project/{MINIVIZ_PROJECT_ID}?token={MINIVIZ_TOKEN}"
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    payload: Dict[str, object] = {
        "temperature": round(reading.temperature_c, 1),
        "humidity": reading.humidity,
        "co2": reading.co2,
    }
    # optional fields（キー数8以下を維持）
    if reading.battery is not None:
        payload["battery"] = reading.battery
    if reading.rssi is not None:
        payload["rssi"] = reading.rssi

    body = {"timestamp": timestamp_ms, "label_key": LABEL_KEY, "payload": payload}

    r = requests.post(url, json=body, timeout=20)
    if r.status_code == 429:
        retry_after = int(r.headers.get("Retry-After", "60"))
        raise RuntimeError(f"Miniviz rate limit (429). Retry-After={retry_after}")
    r.raise_for_status()
    print(r.json())


def main() -> None:
    print("Starting BLE -> Miniviz sender (Ctrl+C to stop)")
    while True:
        try:
            reading = asyncio.run(read_once_from_ble())
            print(
                json.dumps(
                    {
                        "dev_id": reading.dev_id,
                        "temperature": round(reading.temperature_c, 1),
                        "humidity": reading.humidity,
                        "co2": reading.co2,
                        "battery": reading.battery,
                        "rssi": reading.rssi,
                    },
                    ensure_ascii=False,
                )
            )
            post_to_miniviz(reading)
            time.sleep(SEND_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print("Stopped.")
            return
        except Exception as e:
            msg = str(e)
            print(f"[ERROR] {msg}")
            # 429の場合は少し待つ
            if "Retry-After=" in msg:
                try:
                    retry_after = int(msg.split("Retry-After=")[-1].strip())
                except Exception:
                    retry_after = SEND_INTERVAL_SECONDS
                time.sleep(max(retry_after, SEND_INTERVAL_SECONDS))
            else:
                time.sleep(5)


if __name__ == "__main__":
    main()
```

## 3. Raspberry Piで常時稼働させる

systemdユニットを使って、Raspberry Pi起動時に自動でスクリプトを起動します。

### 1. スクリプトを配置

```bash
sudo mkdir -p /opt/miniviz
sudo nano /opt/miniviz/miniviz_raspi_swbot_co2.py
sudo chmod +x /opt/miniviz/miniviz_raspi_swbot_co2.py
```

### 2. Pythonライブラリをインストール

```bash
sudo pip3 install bleak requests --break-system-packages
```

### 3. systemdユニットを作成

```bash
sudo nano /etc/systemd/system/miniviz-co2.service
```

```ini
[Unit]
Description=Miniviz SwitchBot MeterPro CO2 BLE Sender
After=bluetooth.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
ExecStartPre=/usr/bin/bluetoothctl power on
ExecStart=/usr/bin/python3 /opt/miniviz/miniviz_raspi_swbot_co2.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

AmbientCapabilities=CAP_NET_RAW CAP_NET_ADMIN
CapabilityBoundingSet=CAP_NET_RAW CAP_NET_ADMIN

[Install]
WantedBy=multi-user.target
```

### 4. systemdを反映して起動

```bash
sudo systemctl daemon-reload
sudo systemctl enable miniviz-co2
sudo systemctl start miniviz-co2
```

## 4. Minivizでデータ確認・可視化/グラフ化

### データベースの確認

Databaseメニューより、データが保存されていることを確認できます。CSVでエクスポートも可能です。

保存される主なデータは以下の通りです。

- 温度
- 湿度
- CO2
- バッテリー
- RSSI

<!-- 画像 -->
![データベース](/images/swbot_co2/swbot_2.png)

### 可視化/グラフ化

取得したデータは自由にグラフ化できます。CO2の値が低すぎる場合は、センサーの校正状態も確認してください。

Minivizなら自由にレイアウトを作成できます。

<!-- 画像 -->
![可視化](/images/swbot_co2/swbot_1.png)

## よくあるエラー

### SwitchBot CO2 のデータが Miniviz に表示されない原因は？

次を確認してください。

- BLE アドバタイズからデバイス ID を正しく取得できている
- Raspberry Pi 上の送信スクリプトが動き続けている
- `PROJECT_ID` と `TOKEN` を正しく設定している
- `payload` の値が文字列または数値だけになっている

### データ送信時に 403 エラーが出るのはなぜ？

主な原因は次の通りです。

- トークンが無効、または別プロジェクトのものを使っている
- リクエスト URL が誤っている
- 現在のプランで使えない機能を呼んでいる

### payload に送れない型は？

次の payload 値は避けてください。

- ネストしたオブジェクト
- 配列
- 真偽値
- `null`

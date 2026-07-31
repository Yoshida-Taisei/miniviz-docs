
---
description: curl や Python で Miniviz に最初の IoT データを送り、データ確認とグラフ作成まで数分で試せる最短ガイドです。
---

import FaqPageJsonLd from '@site/src/components/FaqPageJsonLd';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const faqItems = [
  {
    question: 'Miniviz にデータが表示されない原因は？',
    answer:
      'まずプロジェクト ID とトークンが正しいか確認してください。次に JSON ボディに timestamp、label_key、payload が入っているか、payload がフラットな文字列または数値だけで構成されているかを確認します。それでも表示されない場合は、デバイス側ログと HTTP レスポンス本文を確認してください。',
  },
  {
    question: 'データ送信や画像送信で 403 エラーが出るのはなぜ？',
    answer:
      '403 エラーは、トークンが無効か、現在のプランで使えない機能を呼んでいる場合に発生しやすいです。画像送信 API は Pro プラン専用です。プロジェクト画面からトークンを再取得し、エンドポイントも再確認してください。',
  },
  {
    question: 'Miniviz の payload に送れない型は？',
    answer:
      'payload の値には、フラットな文字列または数値のみ使えます。ネストしたオブジェクト、配列、真偽値、null は送れません。JSON エンコード後 400 bytes 以内、キー数は 8 個以内に収めてください。',
  },
  {
    question: 'データ送信で 429 が返るのはなぜ？',
    answer:
      'Retry-After の時間を待ってから再送してください。Free は60秒、Pro は15秒が最短送信間隔です。短い間隔でのリトライを続けないでください。',
  },
  {
    question: 'Database には表示されるのにグラフに出ないのはなぜ？',
    answer:
      '数値の payload 項目を選んでいるか、グラフの期間にイベントの timestamp が含まれるか、送信先と同じプロジェクトを選んでいるか確認してください。',
  },
  {
    question: '送信先を変更したときに確認することは？',
    answer:
      'API のベース URL とプロジェクト ID/token をまとめて更新し、デバイスの送信周期を戻す前にテストイベントを1件送ってください。',
  },
];

<FaqPageJsonLd items={faqItems} />

# クイックスタート

このページは、Miniviz が自分のデバイス構成で動くかを最短で確認するための入口です。
まずはシンプルな HTTP POST でサンプルデータを送り、Database で保存を確認し、5 分程度で最初のグラフまで作る流れを試せます。

:::info
AI を活用するとより素早く実装やサポートが可能です。詳細は [はじめにの AI ガイド](/#ai-用クイックスタートガイド) をご覧ください。
:::

## 最初の経路を選ぶ

最初のグラフを作るのにセンサーは必要ありません。下の curl 例でイベントを送り、**Database** で確認してから **Visualize** でグラフを作ってください。実機を接続するときは [ESP32 温湿度](./hardware/esp32_temp_humidity) または [Raspberry Pi 温湿度](./hardware/raspi_temp_humidity) に進めます。

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
POST https://api.miniviz.net/api/project/{project_id}
```

### リクエスト概要
Miniviz API へのデータ送信は `POST` メソッドを使用します。送信ボディは JSON 形式です。
プロジェクト token は `Authorization: Bearer {token}` ヘッダーで送信します。既存の `?token={token}` クエリパラメータも互換目的で引き続き利用できます。

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
  "https://api.miniviz.net/api/project/{project_id}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
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
    url = f"{API_URL}/api/project/{PROJECT_ID}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    sensor_data = read_sensor()

    response = requests.post(url, headers=headers, json={
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

## よくあるエラー

### Miniviz にデータが表示されない原因は？

次の順に確認してください。

- プロジェクト ID とトークンが正しい
- リクエストボディに `timestamp`、`label_key`、`payload` が含まれている
- `payload` がフラットな文字列または数値だけで構成されている
- デバイス側ログや HTTP レスポンスに API エラーが出ていない

### 403 エラーが出るのはなぜ？

よくある原因は次の通りです。

- トークンが無効、または別プロジェクトのトークンを使っている
- 現在のプランで利用できない API を呼んでいる
- Pro プラン未契約で画像 API を使っている

### payload に送れない型は？

Miniviz では次の payload 値は送れません。

- ネストしたオブジェクト
- 配列
- 真偽値
- `null`

### データ送信で 429 が返るのはなぜ？

`Retry-After` の時間を待ってください。Free は60秒、Pro は15秒が最短送信間隔です。短い間隔でのリトライを続けないでください。

### Database には表示されるのにグラフに出ないのはなぜ？

数値の payload 項目を選んでいるか、グラフの期間にイベントの timestamp が含まれるか、送信先と同じプロジェクトを選んでいるか確認してください。

### 送信先を変更したときに確認することは？

API のベース URL とプロジェクト ID/token をまとめて更新し、デバイスの送信周期を戻す前にテストイベントを1件送ってください。

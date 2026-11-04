---
description: Ambient（ambidata.io）にデータを送っているデバイスを MiniViz へ移行する手順を、Python・ESP32・curl のビフォーアフター付きで解説します。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ambient から MiniViz へ移行する

このページは、すでに Ambient（ambidata.io）へデータを送っているデバイスを MiniViz に切り替えるためのガイドです。
同じセンサー値を MiniViz へ送るために必要な、最小限のコード変更を示します。

## 変わること

<div className="migration-table">

| 項目 | Ambient | MiniViz |
|------|---------|---------|
| エンドポイント | <pre><code>{`POST https://ambidata.io/api/v2/channels/{channelId}/data`}</code></pre> | <pre><code>{`POST https://api.miniviz.net/api/project/{project_id}`}</code></pre> |
| 認証 | リクエストボディの `writeKey` | <ul><li><code>Authorization: Bearer &#123;token&#125;</code> ヘッダー</li><li><code>?token=&#123;token&#125;</code> クエリ</li></ul> |
| 管理単位 | デバイスごとに1チャネル | プロジェクト1つ。`label_key` でデバイスを区別（例: `"label_key": "living-room"`） |
| 値 | `d1`〜`d8`（8個固定） | `payload` の任意キー（最大8キー、400バイト） |
| 時刻 | `created`（省略可、文字列またはミリ秒） | `timestamp`（必須、UNIX時間のミリ秒） |
| 一括送信 | `/dataarray` で複数件を送信可能 | なし。1リクエスト1件 |
| リクエスト例 | <pre><code>{`{\n  "writeKey": "WRITE_KEY",\n  "d1": 25.0,\n  "d2": 55.0\n}`}</code></pre> | <pre><code>{`{\n  "timestamp": 1731129600000,\n  "label_key": "living-room",\n  "payload": {\n    "temperature": 25.0,\n    "humidity": 55.0\n  }\n}`}</code></pre> |
| 最短送信間隔 | チャネルごとに5秒（1日3,000件まで、平均28.8秒ペース） | プロジェクトごとに60秒（Free）/ 15秒（Pro） |

</div>

- 変更の中心はリクエストボディです。
- `writeKey` は `Authorization` ヘッダーに移ります。
- `timestamp` と `label_key` が加わります。
- `d1` / `d2` は `temperature` / `humidity` のような名前のキーに変えます。
- 数値は数値のままでも、Ambient の Arduino ライブラリが送るような `"25.0"` という文字列でも送信できます。

### 参考リンク

- [Ambient 諸元/制限](https://ambidata.io/refs/spec/)
- [Ambient Python ライブラリ](https://ambidata.io/refs/python/) / [Arduino ライブラリ](https://ambidata.io/refs/arduino/)
- [MiniViz API リファレンス](../api_endpoint/api_reference)

## 手順

1. MiniViz でプロジェクトを作成し、プロジェクトIDとトークンをコピーします。[クイックスタート](../quickstart) を参照してください。
2. `payload` のキーを決めます（例: `temperature`、`humidity`）。
3. 送信関数を MiniViz 版に置き換えます。サンプルコードはこのページの末尾にあります。
4. 1件送信して、データベース画面で受信を確認します。

## 注意点

:::caution 送信間隔と過去データ

- 送信間隔はプランごとに決まっています（Free 60秒 / Pro 15秒）。この間隔に合わせて調整してください。
- 間隔はデバイス単位ではなくプロジェクト単位です。複数デバイスを1プロジェクトで使う場合は、合計の送信頻度がこの間隔に収まるように設計してください。
- 間隔が短すぎる送信は `Retry-After` 付きの `429` で拒否されます。
- `/dataarray` に相当する一括投入はありません。

:::

:::info キーの決め方

- `payload` のキーは自由です。`d1` / `d2` は `temperature` / `humidity` のような名前にするとグラフが見やすくなります。同じ項目を別名で送ると別項目になるため、変更は移行後のデータだけに適用してください。
- `label_key` は `A-Z`、`a-z`、`0-9`、`-`、`_`、`.`、`:`、`@`、`/` の128文字までです。日本語のチャネル名は使えないため、`ambient-ch12345` のように指定します。

:::

## サンプルコード

### Python

どちらも素の HTTP POST なので、変わるのは URL・ヘッダー・ボディだけです。追加ライブラリは不要です。
MiniViz 側は専用ライブラリを使わない前提で、HTTP クライアントは任意のものを使えます。
公式の `ambient` ライブラリを使っている場合の「変更前」は `am.send({"d1": temperature, "d2": humidity})` です。

<Tabs>
  <TabItem value="python" label="Python" default>

**変更前（Ambient）**

```python
import time
import requests

response = requests.post(
    f"https://ambidata.io/api/v2/channels/{CHANNEL_ID}/data",
    json={"writeKey": WRITE_KEY, "d1": temperature, "d2": humidity},
    timeout=10,
)
```

**変更後（MiniViz・URLトークン）**

```python
import time
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
LABEL_KEY = "ambient-ch12345"  # ASCII のみ、128文字まで


def send_to_miniviz(temperature, humidity):
    response = requests.post(
        f"https://api.miniviz.net/api/project/{PROJECT_ID}?token={TOKEN}",
        json={
            "timestamp": int(time.time() * 1000),
            "label_key": LABEL_KEY,
            "payload": {
                "temperature": temperature,
                "humidity": humidity,
            },
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    while True:
        temperature, humidity = 25.0, 55.0  # センサー読み取りに置き換える
        send_to_miniviz(temperature, humidity)
        time.sleep(60)  # Ambient は5秒可、無料プランは60秒必要
```

**変更後（MiniViz・Authorizationヘッダー）**

```python
import time
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
LABEL_KEY = "ambient-ch12345"  # ASCII のみ、128文字まで


def send_to_miniviz(temperature, humidity):
    response = requests.post(
        f"https://api.miniviz.net/api/project/{PROJECT_ID}",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={
            "timestamp": int(time.time() * 1000),
            "label_key": LABEL_KEY,
            "payload": {
                "temperature": temperature,
                "humidity": humidity,
            },
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    while True:
        temperature, humidity = 25.0, 55.0  # センサー読み取りに置き換える
        send_to_miniviz(temperature, humidity)
        time.sleep(60)  # Ambient は5秒可、無料プランは60秒必要
```

ヘッダーとクエリのどちらか一方を使います。両方送る場合は同じ値を指定してください。

  </TabItem>
  <TabItem value="cpp" label="C++ (Arduino)">

**変更前（Ambient）**

```cpp
#include <Ambient.h>

Ambient ambient;

ambient.begin(CHANNEL_ID, WRITE_KEY, &client);
ambient.set(1, temperature);
ambient.set(2, humidity);
ambient.send();
```

**変更後（MiniViz・URLトークン）**

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

void sendToMiniviz(float temperature, float humidity)
{
  HTTPClient http;
  http.begin(String("https://api.miniviz.net/api/project/") + project_id +
             "?token=" + token);
  http.addHeader("Content-Type", "application/json");

  struct timeval tv;
  gettimeofday(&tv, NULL);
  uint64_t ts = (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;

  String body = "{\"timestamp\":" + String(ts) +
                ",\"label_key\":\"ambient-ch12345\",\"payload\":{";
  body += "\"temperature\":" + String(temperature, 1) + ",";
  body += "\"humidity\":" + String(humidity, 1);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }

  // MiniViz は timestamp が必須なので、先に時計を合わせる
  configTime(0, 0, "ntp.nict.jp", "time.google.com");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
  }

  float temperature = 25.0;  // センサー読み取りに置き換える
  float humidity = 55.0;
  sendToMiniviz(temperature, humidity);

  // Ambient の5秒は不可。無料プランでは60秒以上あける
  esp_sleep_enable_timer_wakeup(60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
```

**変更後（MiniViz・Authorizationヘッダー）**

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

void sendToMiniviz(float temperature, float humidity)
{
  HTTPClient http;
  http.begin(String("https://api.miniviz.net/api/project/") + project_id);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + token);

  struct timeval tv;
  gettimeofday(&tv, NULL);
  uint64_t ts = (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;

  String body = "{\"timestamp\":" + String(ts) +
                ",\"label_key\":\"ambient-ch12345\",\"payload\":{";
  body += "\"temperature\":" + String(temperature, 1) + ",";
  body += "\"humidity\":" + String(humidity, 1);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }

  // MiniViz は timestamp が必須なので、先に時計を合わせる
  configTime(0, 0, "ntp.nict.jp", "time.google.com");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
  }

  float temperature = 25.0;  // センサー読み取りに置き換える
  float humidity = 55.0;
  sendToMiniviz(temperature, humidity);

  // Ambient の5秒は不可。無料プランでは60秒以上あける
  esp_sleep_enable_timer_wakeup(60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
```

  </TabItem>
  <TabItem value="curl" label="curl">

**変更前（Ambient）**

```bash
curl -X POST "https://ambidata.io/api/v2/channels/$CHANNEL_ID/data" \
  -H "Content-Type: application/json" \
  -d "{\"writeKey\":\"$WRITE_KEY\",\"d1\":25.0,\"d2\":55.0}"
```

**変更後（MiniViz・URLトークン）**

```bash
timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/$PROJECT_ID?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"ambient-ch12345\",
        \"payload\": {
          \"temperature\": 25.0,
          \"humidity\": 55.0
        }
      }"
```

**変更後（MiniViz・Authorizationヘッダー）**

```bash
timestamp_ms=$(( $(date -u +%s) * 1000 ))

curl -X POST \
  "https://api.miniviz.net/api/project/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"ambient-ch12345\",
        \"payload\": {
          \"temperature\": 25.0,
          \"humidity\": 55.0
        }
      }"
```

  </TabItem>
</Tabs>

リクエストの詳細と payload の制約は [API リファレンス](../api_endpoint/api_reference) を参照してください。

---
description: ESP8266(ESP32) と赤外線センサー（KY-022）の判定値を MiniViz に送信し、データ確認とグラフ化まで行う手順を紹介します。
---

# ESP8266(ESP32) で赤外線センサー判定値を送る

ESP8266（Lolin D1 R1 など）または ESP32 と赤外線センサー（KY-022）を使って、リモコン信号の判定値を MiniViz に送信し、可視化する手順です。
センサー入門や動作検証向けのシンプルな HTTP 送信構成で進めます。

## ここで行うこと

赤外線センサーの判定値（`0/1`）を ESP8266(ESP32) で読み取り、MiniViz API に定期送信してデータベース確認とグラフ表示を行います。

:::tip ESP32 を使う場合
同じ手順で進められます。ライブラリとピン指定だけ ESP32 向けに変更すれば動作します。
:::

## 必要なもの

- ESP8266（Lolin D1 R1 など）または ESP32（DevKitC など）
- USB ケーブル（データ転送対応）
- 赤外線センサー（KY-022 / VS1838B / TSOP1838）
- ジャンパーワイヤー
- MiniViz のプロジェクト ID とトークン

:::note ESP32 を使う場合
- ESP32 開発ボード（DevKitC など）を用意
- KY-022 の `VCC` は **3.3V** で接続（ESP32 GPIO は 5V 非対応）
:::

## 手順

1. Arduino IDE で ESP8266(ESP32) 開発環境を準備
2. KY-022 を ESP8266(ESP32) に配線
3. データ送信コードを実行
4. MiniViz で受信データとグラフを確認

## 1. ESP8266(ESP32) 開発環境の準備（Arduino IDE）

### Arduino IDE をインストール

Arduino 公式サイトから IDE をインストールします。

### ESP8266/ESP32 ボードを追加

ボードマネージャから ESP8266 をインストールし、利用するボードを選択します。
プロジェクト名は `esp8266-miniviz` など任意で構いません。

:::tip ESP32 を使う場合
ESP32 ボードパッケージをインストールし、`ESP32 Dev Module` など使用ボードを選択してください。
:::

## 2. 赤外線センサーを接続する

### 配線

KY-022 赤外線受信モジュールを以下のように接続します。

| KY-022 | ESP8266（Lolin D1 R1） |
| --- | --- |
| VCC | 5V |
| OUT | D5 |
| GND | GND |

:::caution ESP32 を使う場合
ESP32 では `VCC` を **3.3V** に接続してください。
`OUT` は `GPIO4` など任意の GPIO に接続し、コード側も同じ番号に合わせます。
:::

### 配線写真

![KY-022 と ESP8266 の接続](/images/esp8266_ir/ir_sensor_connection.jpg)

### センサー補足

- 3 ピン構成（GND / VCC / OUT）
- 受信素子は VS1838B / TSOP1838 互換
- 一般的な 38kHz リモコン信号に対応

## 3. データ送信サンプルを実行する

USB で ESP8266 を接続し、以下のコードを Arduino IDE に貼り付けて実行します。
`ssid`、`password`、`project_id`、`token` は自分の環境に合わせて置き換えてください。

### MiniViz のプロジェクト ID とトークンを取得

コード実行前に、MiniViz 側で送信先プロジェクトを作成し、認証情報を取得します。

1. MiniViz にログイン
2. プロジェクトを新規作成
3. プロジェクト詳細から `project_id` と `token` を確認
4. この 2 つをサンプルコード内の `project_id` / `token` に設定

詳細は [QuickStart](../quickstart) を参照してください。

:::tip ESP32 を使う場合
次の 3 点を置き換えれば、そのまま同じロジックで動作します。

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
const int irPin = 4; // GPIO4 の例
```
:::

## サンプルコード

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char *project_id = "YOUR_PROJECT_ID";
const char *token = "YOUR_TOKEN";

String endpoint = String("https://api.miniviz.net/api/project/") +
                  project_id;

const int irPin = D5;

void connectWiFi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(300);
    Serial.print(".");
    retry++;
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) Serial.println("Wi-Fi connected");
  else Serial.println("Wi-Fi connection failed");
}

void syncTime() {
  Serial.println("Syncing NTP...");
  configTime(0, 0, "ntp.nict.jp", "time.google.com");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
    Serial.print("*");
  }
  Serial.println("\nTime synced");
}

uint64_t getTimestampMs() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint64_t)tv.tv_sec * 1000ULL + (tv.tv_usec / 1000ULL);
}

void sendToMiniviz(int irState) {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + token);

  uint64_t ts = getTimestampMs();

  String body = "{";
  body += "\"timestamp\":" + String(ts) + ",";
  body += "\"label_key\":\"esp8266_home\",";
  body += "\"payload\":{";
  body += "\"value\":" + String(irState);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);
  delay(1000);
  connectWiFi();
  syncTime();
}

void loop() {
  int irState = digitalRead(irPin);
  Serial.print("IR State: ");
  Serial.println(irState == LOW ? "Signal Detected" : "No Signal");
  sendToMiniviz(irState);
  delay(500);
}
```

## 4. MiniViz で送信結果を確認する

### データ確認

1. MiniViz にログイン
2. `Database` 画面で送信データを確認
3. `label_key: esp8266_home` のレコードが増えていることを確認

:::note ESP32 を使う場合
`label_key` を `esp32_home` などに変更しておくと、デバイスごとに見分けやすくなります。
:::

![MiniViz データ確認画面](/images/esp8266_ir/graph_output.png)

### グラフ化

`Viz` 画面で折れ線グラフなどを作成し、`value` を選択して推移を確認します。

![グラフ出力例](/images/esp8266_ir/miniviz_data_view.png)

## まとめ

ESP8266(ESP32) と赤外線センサーだけで、判定値を簡単に MiniViz へ蓄積し可視化できます。
まずはこの最小構成で動作確認し、必要に応じて複数センサーや通知連携へ拡張してください。

ESP32 でもほぼ同じ構成で運用できます。実機差分は「ライブラリ」「GPIO 番号」「電圧（3.3V）」の 3 点です。

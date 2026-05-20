---
description: ESP32 の温湿度データをシンプルな HTTP POST で Miniviz に送り、すばやくグラフ化する手順を解説します。
---

# ESP32 で温湿度データを送る

このページでは、ESP32 から Miniviz へ温湿度データを送って可視化/グラフ化するまでの最短ルートを紹介します。
重い IoT アーキテクチャを使わず、まずは HTTP ベースで試作やデモを始めたい場合に向いています。

## ここで行うこと
温度・湿度センサーを用いてデータを送信し、グラフを作成するサンプルを作成します。

## 必要なもの

- ESP32
- USBケーブル（データ転送用）
- 温度・湿度センサー(DHT11など)
- ジャンパーワイヤー
- ブレッドボード（オプション）

## 手順

1. ESP32開発環境のセットアップ（PlatformIO）
2. 温度・湿度センサーを接続/取得
3. データ送信サンプルを実行
4. データ送信確認・グラフ作成
5. (おまけ) OTA更新の設定

## 1. ESP32開発環境のセットアップ（PlatformIO）

PlatformIOを使用してESP32の開発環境をセットアップします。

### PlatformIOのインストール

1. [PlatformIO IDE](https://platformio.org/install/ide?install=vscode)をダウンロード・インストール
   - Visual Studio Code拡張機能としてインストールする方法が推奨されます
2. Visual Studio Codeを起動し、PlatformIO拡張機能が有効になっていることを確認

### プロジェクトの作成

1. PlatformIOのホーム画面から「New Project」を選択
2. プロジェクト名を入力（例：`esp32-miniviz`）
3. Boardとして「ESP32 Dev Module」を選択
4. Frameworkとして「Arduino」を選択
5. プロジェクトを作成

:::tip
シリアルモニターで文字化けを防ぐため、ボーレートは `115200` に設定してください。
:::

`platformio.ini`ファイルの例
```ini
[env:esp32doit-devkit-v1]
platform = espressif32
board = esp32doit-devkit-v1
framework = arduino
lib_deps = adafruit/DHT sensor library@^1.4.6
monitor_speed = 115200
```

### 必要なライブラリの追加

プロジェクトの`platformio.ini`ファイルに必要なライブラリを追加します。

* [DHT sensor library](https://github.com/adafruit/DHT-sensor-library)

## 2. 温度・湿度センサーを接続/取得

### センサーの接続

DHT11などの温度・湿度センサーをESP32に接続します。

**DHT11の接続例：**

```
DHT11              ESP32
------             ----------------
(1) VCC  --------> 3.3V
(2) DATA --------> GPIO4
(3) NC   --------> -
(4) GND  --------> GND
```


## 3. データ送信サンプルを実行

Miniviz APIにデータを送信するESP32用のコードを作成します。

### コードの作成

`src/main.cpp`ファイルに以下の内容を記述します（`PROJECT_ID`と`TOKEN`は実際の値に置き換えてください）：

### ビルドとアップロード

1. ESP32をUSBケーブルでPCに接続
2. PlatformIOのターミナルから以下のコマンドを実行：
3. シリアルモニターで動作を確認：

## サンプルコード

このガイドで使用したコードの完全版です。

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="cpp" label="C++ (Arduino)" default>

```cpp
#include <Arduino.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

//----------------------------------------
// Configuration
//----------------------------------------
const int PIN_DHT = 4;
DHT dht(PIN_DHT, DHT11);

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";

// Miniviz API
const char *project_id = "MINIVIZ_PROJECT_ID";
const char *token = "MINIVIZ_API_TOKEN";

String endpoint = String("https://api.miniviz.net/api/project/") +
                  project_id + "?token=" + token;

// Deep Sleep (90 seconds)
const uint64_t SLEEP_INTERVAL_US = 90ULL * 1000000ULL;


//----------------------------------------
// Wi-Fi Connection
//----------------------------------------
void connectWiFi()
{
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

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected");
  } else {
    Serial.println("Wi-Fi connection failed");
  }
}

//----------------------------------------
// NTP Time Synchronization
//----------------------------------------
void syncTime()
{
  Serial.println("Syncing NTP...");
  configTime(0, 0, "ntp.nict.jp", "time.google.com");

  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(200);
    Serial.print("*");
  }
  Serial.println("\nTime synced");
}

//----------------------------------------
// UNIX Timestamp in Milliseconds
//----------------------------------------
uint64_t getTimestampMs()
{
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint64_t)tv.tv_sec * 1000ULL + (tv.tv_usec / 1000ULL);
}

//----------------------------------------
// POST to Miniviz
//----------------------------------------
void sendToMiniviz(float temp, float humid)
{
  if (WiFi.status() != WL_CONNECTED)
    connectWiFi();

  HTTPClient http;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  uint64_t ts = getTimestampMs();

  String body = "{";
  body += "\"timestamp\":" + String(ts) + ",";
  body += "\"label_key\":\"esp32_home\",";
  body += "\"payload\":{";
  body += "\"temperature\":" + String(temp) + ",";
  body += "\"humidity\":" + String(humid);
  body += "}}";

  int code = http.POST(body);
  Serial.println("HTTP code: " + String(code));
  Serial.println(http.getString());
  http.end();
}

//----------------------------------------
// Setup
//----------------------------------------
void setup()
{
  Serial.begin(115200);
  delay(200);

  dht.begin();
  connectWiFi();
  syncTime();
}

//----------------------------------------
// Loop (exits after one iteration due to DeepSleep)
//----------------------------------------
void loop()
{
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  Serial.printf("Temperature: %.2f°C  Humidity: %.2f%%\n", t, h);

  sendToMiniviz(t, h);

  Serial.println("Entering deep sleep...");
  esp_deep_sleep(SLEEP_INTERVAL_US);
}
```

  </TabItem>
</Tabs>

## 4. データ送信確認・グラフ作成

### データ送信の確認

1. MinivizのWebインターフェースにログイン
2. Databaseメニューから送信されたデータを確認
3. 温度・湿度のデータが表示されていることを確認

![DATA_BASE_ESP32](/images/esp32_1.png)

### グラフの作成

1. Visualizeメニューからグラフを作成
2. グラフタイプを選択（ラインチャート推奨）
3. データソースとして温度・湿度を選択
4. グラフが正常に表示されることを確認

詳細は[クイックスタート](../quickstart)の「5. グラフ作成」を参照してください。

## よくあるエラー

### ESP32 のデータが Miniviz に表示されない原因は？

まず次を確認してください。

- ESP32 が Wi-Fi に正常接続できている
- `PROJECT_ID` と `TOKEN` を正しく設定している
- リクエストボディに `timestamp`、`label_key`、`payload` が含まれている
- `payload` の値が文字列または数値だけになっている

### API から 403 エラーが返るのはなぜ？

主な原因は次の通りです。

- トークンが無効、または別プロジェクトのものを使っている
- リクエスト URL やエンドポイントが誤っている
- 現在のプランで使えない機能を呼んでいる

### payload で避けるべき型は？

次の payload 値は送らないでください。

- ネストしたオブジェクト
- 配列
- 真偽値
- `null`

# Miniviz クイックスタートガイド（AI用）

## 📋 このドキュメントについて

このドキュメントは、Miniviz（IoTシステム向けBIプラットフォーム）の使用方法に関する完全なガイドです。AIに質問する際に、このドキュメント全体を貼り付けて使用してください。

**使用方法:**
1. このドキュメント全体をコピーしてAIに貼り付ける
2. 「Minivizで〇〇を実装したい」「MinivizのAPIで△△を送信する方法は？」など、具体的な質問をする
3. AIはこのドキュメントの内容を参照して回答します

**このドキュメントに含まれる情報:**
- Minivizの基本的な使用方法（7ステップ）
- データ送信APIの完全な仕様（エンドポイント、リクエスト形式、制約事項）
- 画像送信APIの完全な仕様（Proプランのみ）
- サンプルコード（curl、Python）
- データ型の制約と制限事項

**重要事項:**
- データ送信API: `POST https://api.miniviz.net/api/project/{project_id}?token={token}`
- 画像送信API: `POST https://api.miniviz.net/api/project/{project_id}/image?token={token}` (Proプランのみ)
- ペイロード制約: 最大8キー、400バイトまで、フラット構造のみ（ネスト不可）
- 画像制約: 200KBまで、60秒/枚、JPEG/PNGのみ

---

## 全体の流れ

## 全体の流れ

1. Minivizアカウント作成/ログイン
2. プロジェクト作成
3. (デバイス側)データ送信
4. データの確認(データベース)
5. グラフ作成
6. 通知設定
7. (Proプランのみ)画像送信

---

## 1. Minivizアカウント作成/ログイン

メールアドレス・パスワードを入力して新規登録するか、既存のアカウントでログインします。

---

## 2. プロジェクト作成

データを管理するためのプロジェクトを作成します。

### プロジェクトID・トークンのコピー

次項で必要になるため、プロジェクトID・トークンをコピーしておきます。
- プロジェクト画面の右側のトークンアイコンをクリック
- プロジェクトIDとトークンが表示されるので、これらをコピー
- ここでコピーしたトークンは、デバイス側で使用します

---

## 3. (デバイス側)データ送信

デバイス側でデータを送信します。
まずはcurlコマンドや簡易のPythonスクリプトでデータ送信できるか確認することをお勧めします。

### APIエンドポイント

```
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

### データ型の制約

#### 受け入れ可能なデータ型

**文字列型（str）**
- 制約なし（文字数制限はない）
- 例: `"device-001"`, `"温度センサー"`, `"Hello World"`

**数値型**
- **整数型（int）**: 制約なし（範囲制限はない）
- **浮動小数点数型（float）**: 制約なし（範囲制限はない）
- 例: `42`, `-10`, `3.14`, `-99.9`

#### 受け入れ不可な型

以下の型は `payload` の値として使用できません：
- **辞書（dict）**: ネストされたオブジェクトは不可
- **配列（list, tuple, set）**: 配列型は不可
- **真偽値（bool）**: 不可（文字列の `"true"`/`"false"` または数値 `1`/`0` を使用）
- **null/None**: 不可

#### ペイロード全体の制約

- **キー数**: 最大8個
- **サイズ**: JSONエンコード後で最大400バイト
- **構造**: フラット（ネスト不可）

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

### Pythonサンプルコード

Pythonを使用する場合は、以下のようなコードでデータを送信できます：

```python
import time
from datetime import datetime, timezone
import requests

PROJECT_ID = "MINIVIZ_PROJECT_ID"
TOKEN = "MINIVIZ_API_TOKEN"
API_URL = "https://api.miniviz.net"
LABEL_KEY = "Local_PC"
SEND_INTERVAL = 90  # seconds

def send_data():
    url = f"{API_URL}/api/project/{PROJECT_ID}?token={TOKEN}"
    timestamp_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    response = requests.post(url, json={
        "timestamp": timestamp_ms,
        "label_key": LABEL_KEY,
        "payload": {
            "temperature": 25,
            "humidity": 55,
            "switch": "true",
            "system_status": "running"
        }
    })

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

---

## 4. データの確認(データベース)

Databaseメニューからデータを確認します。
送信されたデータはデータベースに保存されます。

**注意**: ここに表示されない場合はデータ送信が失敗しています。再度デバイス側のログなどを確認してください。

---

## 5. グラフ作成

Visualizeメニューからグラフを作成します。
グラフの種類やデータの表示形式などを設定できます。

- グラフタイプを選択（ラインチャート、バーチャートなど）
- データソースとして送信したデータを選択
- グラフが正常に表示されることを確認

---

## 6. 通知設定

SlackやWebhookなどの通知先を設定します。
Rulesメニューから通知設定を行います。

### Slack通知設定

1. Rulesメニューから通知設定を行う
2. SlackのWebhook URLを入力
3. 閾値や条件を設定
4. 設定した閾値を超えた場合に通知が行われる

---

## 7. 画像送信（Proプランのみ）

Proプランでは画像送信APIを用いて画像を送信することができます。

### APIエンドポイント

```
POST https://api.miniviz.net/api/project/{project_id}/image?token={token}
```

### リクエスト概要

Miniviz API への画像送信は `POST` メソッドを使用します。送信ボディは JSON 形式です。画像データは base64 エンコードして送信します。

### リクエストボディ（画像送信）

| フィールド名 | 型 | 必須 | 説明 |
|--------------|----|------|------|
| `timestamp`  | number | Yes | 送信時刻（UNIX 時間ミリ秒） |
| `label_key`  | string | Yes | デバイス名や設置場所など、送信元を識別するラベル（128文字以内、[A-Za-z0-9-_.:@/]のみ） |
| `image_name` | string | Yes | 画像ファイル名（255文字以内） |
| `image_base64` | string | Yes | base64エンコードされた画像データ（200KBまで） |

### 制限事項

#### 画像サイズと形式
- **画像サイズ**: 1枚あたり200KBまで（base64エンコード後のサイズ）
- **対応形式**: JPEG、PNGのみ
- **送信周期**: 60秒/枚（ラベルキー別に管理）
- **保存期間**: 30日間

※エクスポート機能は2025年12月末頃に公開予定です。

#### プラン制限
- **利用可能プラン**: Proプランのみ（無料プランでは403エラー）

### リクエスト例（画像送信）

```json
{
  "timestamp": 1717587812345,
  "label_key": "camera_1",
  "image_name": "image.jpg",
  "image_base64": "base64_encoded_image_data"
}
```

### curlコマンド(Linux/MacOS) - 画像送信

```bash
timestamp_ms=$(( $(date -u +%s) * 1000 ))

# 画像ファイルをbase64エンコード
image_base64=$(base64 -i image.jpg)

curl -X POST \
  "https://api.miniviz.net/api/project/{project_id}/image?token={token}" \
  -H "Content-Type: application/json" \
  -d "{
        \"timestamp\": ${timestamp_ms},
        \"label_key\": \"camera_1\",
        \"image_name\": \"image.jpg\",
        \"image_base64\": \"${image_base64}\"
      }"
```

### Pythonサンプルコード - 画像送信

```python
import requests
import base64
import os
from datetime import datetime, timezone

PROJECT_ID = "PROJECT_ID"
TOKEN = "TOKEN"
API_URL = "https://api.miniviz.net"
IMAGE_PATH = "image.jpg"
LABEL_KEY = "camera_1"

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

### 画像の確認

- データベースページから送信された画像をプレビューすることができます
- グラフ作成ページから画像をグラフに表示することもできます
  - [新しいグラフ作成] -> [グラフの種類を選択] -> [image]を選択

---

## まとめ

Minivizは以下の機能を提供します：

1. **データ送信**: IoTデバイスからセンサーデータを送信
2. **データ可視化**: データベースでデータを確認
3. **グラフ作成**: 送信したデータをグラフで可視化
4. **通知設定**: 閾値を超えた場合にSlackやWebhookで通知
5. **画像送信**: Proプランで画像データを送信・可視化

APIエンドポイント:
- データ送信: `POST https://api.miniviz.net/api/project/{project_id}?token={token}`
- 画像送信: `POST https://api.miniviz.net/api/project/{project_id}/image?token={token}`

制約:
- ペイロード: 最大8キー、400バイトまで
- 画像: 200KBまで、60秒/枚、Proプランのみ


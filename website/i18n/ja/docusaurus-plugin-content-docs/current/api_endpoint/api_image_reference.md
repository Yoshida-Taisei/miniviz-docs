---
description: Miniviz の画像送信 API について、POST エンドポイント、プラン制限、画像制約、リクエスト例をまとめたリファレンスです。
---

# Miniviz APIリファレンス(画像)

Miniviz APIは、以下のエンドポイントをサポートしています。

## APIエンドポイント

### 画像送信API

```text
POST https://api.miniviz.net/api/project/{project_id}/image?token={token}
```


## リクエスト概要

Miniviz API への画像送信は `POST` メソッドを使用します。project token は `?token={token}` クエリパラメータで渡します。送信ボディは JSON 形式です。画像データは base64 エンコードして送信します。

## リクエストボディ（画像送信）

| フィールド名 | 型 | 必須 | 説明 |
|--------------|----|------|------|
| `timestamp`  | number | Yes | 送信時刻（UNIX 時間ミリ秒） |
| `label_key`  | string | Yes | デバイス名や設置場所など、送信元を識別するラベル（128文字以内、[A-Za-z0-9-_.:@/]のみ） |
| `image_name` | string | Yes | 画像ファイル名（255文字以内） |
| `image_base64` | string | Yes | base64エンコードされた画像データ（200KBまで） |

## 制限事項

### 画像サイズと形式
- **画像サイズ**: 1枚あたり200KBまで（base64エンコード後のサイズ）
- **対応形式**: JPEG、PNGのみ
- **送信周期**: 60秒/枚（ラベルキー別に管理）
- **保存期間**: 365日間

### プラン制限
- **利用可能プラン**: Proプランのみ（無料プランでは403エラー）

## リクエスト例（画像送信）

```json
{
  "timestamp": 1717587812345,
  "label_key": "camera_1",
  "image_name": "image.jpg",
  "image_base64": "base64_encoded_image_data"
}
```

## curlコマンド(Linux/MacOS)

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

## 画像の確認

データベースページから送信された画像をプレビューすることができます。

![画像の確認](/images/db_image_1.png)

![画像の確認](/images/db_image_2.png)

また、グラフ作成ページから画像をグラフに表示することもできます。

[新しいグラフ作成] -> [グラフの種類を選択] -> [image]を選択

![画像のグラフ作成](/images/viz_image_1.png)

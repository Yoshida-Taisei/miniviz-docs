---
layout: default
title: APIエンドポイント
nav_order: 3
---

# Miniviz APIリファレンス

```text
POST https://api.miniviz.net/api/project/{project_id}?token={token}
```

## リクエスト概要
Miniviz API へのデータ送信は `POST` メソッドを使用します。送信ボディは JSON 形式です。

## リクエストボディ

| フィールド名 | 型 | 必須 | 説明 |
|--------------|----|------|------|
| `timestamp`  | number | Yes | 送信時刻（UNIX 時間ミリ秒） |
| `label_key`  | string | Yes | デバイス名や設置場所など、送信元を識別するラベル |
| `payload`    | object | Yes | 実際に送信する計測値。キーに任意の指標名、値に数値または文字列を指定 |

### 受け入れ可能なデータ型

#### 文字列型（str）
- 制約なし（文字数制限はない）
- 例: `"device-001"`, `"温度センサー"`, `"Hello World"`

#### 数値型
- **整数型（int）**: 制約なし（範囲制限はない）
- **浮動小数点数型（float）**: 制約なし（範囲制限はない）
- 例: `42`, `-10`, `3.14`, `-99.9`

### 受け入れ不可な型

以下の型は `payload` の値として使用できません：

- **辞書（dict）**: ネストされたオブジェクトは不可
- **配列（list, tuple, set）**: 配列型は不可
- **真偽値（bool）**: 不可（文字列の `"true"`/`"false"` または数値 `1`/`0` を使用）
- **null/None**: 不可

### ペイロード全体の制約

- **キー数**: 最大8個
- **サイズ**: JSONエンコード後で最大400バイト
- **構造**: フラット（ネスト不可）

## リクエスト例

```json
{
  "timestamp": 1731129600000, // UNIX 時間ミリ秒のみ受け入れ可能
  "label_key": "raspberry_pi_home",
  "payload": {
    "temperature": 25,
    "humidity": 55,
    "switch": "true", // True or Falseは文字列で指定してください。
    "system_status": "running" // 任意の文字列を指定してください。
  }
}
```


## curlコマンド(Linux/MacOS)

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
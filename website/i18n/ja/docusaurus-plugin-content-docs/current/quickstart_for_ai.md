---
description: 公開中の llms-full.txt と同じ中核本文を、そのまま AI ツールへ渡せる形で掲載します。
---

import AiGuideTabs from '@site/src/components/AiGuideTabs';

# MiniViz クイックスタートガイド（AI用）

このページでは、AI に MiniViz の現行公開仕様を理解させるための本文を、そのままコピーできる形で掲載しています。

ここに表示している本文は、エージェント向けに公開している `https://miniviz.net/llms-full.txt` と同じ中核テキストです。

## 使い方

1. 必要な言語タブの本文をコピーする
2. AI ツールへ貼り付ける
3. 「ESP32 から温湿度を MiniViz に送りたい」「MiniViz の画像 API の有効な例を出して」など、具体的な依頼を続けて書く

<AiGuideTabs defaultTab="ja" />

## CodexからMiniViz MCPを接続する

MiniViz MCPは、対応するAIクライアントから、あなたが選択したプロジェクトだけをread-onlyで参照するためのPublic Betaです。プロジェクトのデータや設定を確認できますが、データの送信・変更・削除、通知の送信、画像・プロジェクトtoken・認証情報の参照はできません。

Codexでの接続手順は次の通りです。

1. MiniVizにログインし、**AI連携**画面を開く。
2. 表示された**Server URL**をコピーする。
3. Codexで**Plugins** → **MCPs** → **Add server**を開き、ストリーミング可能なHTTPサーバーを選んでServer URLを貼り付ける。
4. 認証を開始し、MiniVizへログインして、Codexに参照を許可するプロジェクトを選択する。

画面例、トラブルシューティング、他の対応クライアントについては、[MiniViz MCPを接続する](./mcp/connect)を参照してください。
